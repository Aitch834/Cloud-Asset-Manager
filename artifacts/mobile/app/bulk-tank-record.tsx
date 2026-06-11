import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { STORAGE_KEYS, appendToList, generateId } from "@/lib/storage";

const RECORD_TYPES = [
  { value: "daily-temperature", label: "Daily Temperature Check" },
  { value: "cleaning",          label: "Tank Cleaning" },
  { value: "antibiotic-residue-test", label: "Antibiotic Residue Test" },
  { value: "maintenance",       label: "Tank Maintenance" },
];

const ABR_RESULTS = ["negative", "positive", "borderline", "invalid"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function BulkTankRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { triggerSync } = useSync();
  const params = useLocalSearchParams<{ tankId?: string; tankName?: string; presetType?: string }>();

  const [recordDate, setRecordDate] = useState(today());
  const [recordType, setRecordType] = useState<string>(params.presetType === "cleaning" ? "cleaning" : "daily-temperature");
  const [temperature, setTemperature] = useState("");
  const [tankCleaned, setTankCleaned] = useState(params.presetType === "cleaning");
  const [cleaningProduct, setCleaningProduct] = useState("");
  const [cleaningBatch, setCleaningBatch] = useState("");
  const [abrResult, setAbrResult] = useState<string>("");
  const [abrRef, setAbrRef] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const tankId = params.tankId ? parseInt(params.tankId) : null;
  const tankName = params.tankName ?? null;

  async function handleSave() {
    if (!currentFarm) {
      Alert.alert("Error", "No farm selected.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        tankId,
        recordDate,
        recordType,
        tankTemperatureCelsius: temperature ? parseFloat(temperature) : null,
        tankCleaned,
        cleaningProductUsed: tankCleaned ? cleaningProduct || null : null,
        cleaningProductBatch: tankCleaned ? cleaningBatch || null : null,
        antibioticResidueResult: abrResult || null,
        antibioticResidueTestRef: abrRef || null,
        notes: notes || null,
      };

      const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
      let token: string | null = null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      try {
        if (Platform.OS !== "web") {
          const SecureStore = await import("expo-secure-store");
          token = await SecureStore.getItemAsync("auth_session_token");
        } else {
          try { token = localStorage.getItem("auth_session_token"); } catch {}
        }
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const farmRaw = await (await import("@/lib/database")).kvGet("bde_current_farm");
        if (farmRaw) {
          const farm = JSON.parse(farmRaw);
          const slug = farm.tenantSlug || farm.slug || "";
          if (slug) headers["x-tenant-slug"] = slug;
        }
      } catch {}

      const res = await fetch(
        `https://${apiDomain}/api/farms/${currentFarm.id}/dairy/bulk-tank-records`,
        { method: "POST", headers, body: JSON.stringify(payload) }
      );

      if (res.ok) {
        await appendToList(STORAGE_KEYS.PENDING_SYNC, { id: generateId(), savedAt: new Date().toISOString() });
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        triggerSync();
        router.back();
      } else {
        const body = await res.json().catch(() => ({}));
        Alert.alert("Save Failed", body.error ?? "Could not save the record. Try again.");
      }
    } catch (e) {
      Alert.alert("Error", "Could not reach the server. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Tank Monitoring Record</Text>
          {tankName && <Text style={styles.headerSub}>{tankName}</Text>}
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl * 2 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Section title="Date *">
          <TextInput
            style={styles.input}
            value={recordDate}
            onChangeText={setRecordDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
          />
        </Section>

        <Section title="Record Type *">
          <View style={styles.chipRow}>
            {RECORD_TYPES.map(rt => (
              <Pressable
                key={rt.value}
                style={[styles.chip, recordType === rt.value && styles.chipSelected]}
                onPress={() => { Haptics.selectionAsync(); setRecordType(rt.value); if (rt.value === "cleaning") setTankCleaned(true); }}
              >
                <Text style={[styles.chipText, recordType === rt.value && styles.chipTextSelected]}>{rt.label}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Tank Temperature (°C)">
          <TextInput
            style={styles.input}
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="decimal-pad"
            placeholder="Target ≤4°C"
            placeholderTextColor={colors.textSecondary}
          />
        </Section>

        <Section title="Tank Cleaned">
          <View style={styles.switchRow}>
            <Switch
              value={tankCleaned}
              onValueChange={v => { Haptics.selectionAsync(); setTankCleaned(v); }}
              trackColor={{ false: "#e2e8f0", true: colors.primary }}
              thumbColor="#fff"
            />
            <Text style={styles.switchLabel}>{tankCleaned ? "Tank cleaned and sanitised" : "Not cleaned this record"}</Text>
          </View>
        </Section>

        {tankCleaned && (
          <>
            <Section title="Cleaning Product">
              <TextInput
                style={styles.input}
                value={cleaningProduct}
                onChangeText={setCleaningProduct}
                placeholder="e.g. Alkacip Plus"
                placeholderTextColor={colors.textSecondary}
              />
            </Section>
            <Section title="Product Batch Number">
              <TextInput
                style={styles.input}
                value={cleaningBatch}
                onChangeText={setCleaningBatch}
                placeholder="Batch / lot number"
                placeholderTextColor={colors.textSecondary}
              />
            </Section>
          </>
        )}

        <Section title="Antibiotic Residue Result">
          <View style={styles.chipRow}>
            {ABR_RESULTS.map(r => (
              <Pressable
                key={r}
                style={[
                  styles.chip,
                  abrResult === r && (r === "negative" ? styles.chipGreen : r === "positive" ? styles.chipRed : styles.chipSelected),
                ]}
                onPress={() => { Haptics.selectionAsync(); setAbrResult(abrResult === r ? "" : r); }}
              >
                <Text style={[styles.chipText, abrResult === r && styles.chipTextSelected]}>{r.charAt(0).toUpperCase() + r.slice(1)}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="ABR Test Reference">
          <TextInput
            style={styles.input}
            value={abrRef}
            onChangeText={setAbrRef}
            placeholder="Test kit lot / reference"
            placeholderTextColor={colors.textSecondary}
          />
        </Section>

        <Section title="Notes">
          <TextInput
            style={[styles.input, styles.textarea]}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            placeholder="Any additional observations"
            placeholderTextColor={colors.textSecondary}
          />
        </Section>

        <Button
          title={saving ? "Saving…" : "Save Record"}
          onPress={handleSave}
          disabled={saving || !recordDate || !recordType}
          style={styles.saveBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  backBtn: { padding: spacing.xs },
  headerTextBlock: { flex: 1, alignItems: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: "#fff" },
  headerSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  content: { padding: spacing.lg, gap: spacing.md },
  section: { gap: spacing.xs },
  sectionTitle: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
  },
  textarea: { minHeight: 80, textAlignVertical: "top", paddingTop: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipGreen: { backgroundColor: "#16a34a", borderColor: "#16a34a" },
  chipRed: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { color: "#fff" },
  switchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.xs },
  switchLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  saveBtn: { marginTop: spacing.lg },
});
