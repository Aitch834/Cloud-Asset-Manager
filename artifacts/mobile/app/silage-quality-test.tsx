import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { SilageQualityTest } from "@/lib/types";

export default function SilageQualityTestScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [stores, setStores] = useState<{ id: number; storeName: string; storeType: string }[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [testDate, setTestDate] = useState(today);
  const [dryMatterPct, setDryMatterPct] = useState("");
  const [ph, setPh] = useState("");
  const [metabolisableEnergy, setMetabolisableEnergy] = useState("");
  const [crudeProteinPct, setCrudeProteinPct] = useState("");
  const [ammoniaN, setAmmoniaN] = useState("");
  const [labName, setLabName] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!currentFarm?.id) return;
    fetch(`/api/farms/${currentFarm.id}/slurry-stores`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => {
        const list = (d.records ?? d ?? []).filter((s: any) => s.storeType === "Silage Clamp");
        setStores(list);
        if (list.length === 1) setSelectedStoreId(list[0].id);
      })
      .catch(() => {})
      .finally(() => setLoadingStores(false));
  }, [currentFarm?.id]);

  const selectedStore = stores.find(s => s.id === selectedStoreId);

  const doSave = async () => {
    if (!currentFarm?.id) {
      Alert.alert("No Farm", "Please select a farm first.");
      return;
    }
    if (!testDate) {
      Alert.alert("Date Required", "Please enter the test date.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: SilageQualityTest = {
      id: generateId(),
      farmId: String(currentFarm.id),
      storeId: selectedStoreId ? String(selectedStoreId) : "",
      storeName: selectedStore?.storeName ?? "",
      testDate,
      dryMatterPct: dryMatterPct.trim(),
      ph: ph.trim(),
      metabolisableEnergy: metabolisableEnergy.trim(),
      crudeProteinPct: crudeProteinPct.trim(),
      ammoniaN: ammoniaN.trim(),
      labName: labName.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SILAGE_QUALITY_TESTS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert("Saved", "Quality test saved and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Silage Quality / DM% Test</Text>
            <Text style={styles.subtitle}>Record a silage quality analysis</Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Date</Text>
          <Input
            value={testDate}
            onChangeText={setTestDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Clamp */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Silage Clamp</Text>
          {loadingStores ? (
            <Text style={styles.hintText}>Loading clamps…</Text>
          ) : stores.length === 0 ? (
            <Text style={styles.hintText}>No silage clamps registered — record will not be linked to a store.</Text>
          ) : (
            <View style={styles.optionRow}>
              {stores.map(s => (
                <Pressable
                  key={s.id}
                  style={[styles.optionPill, selectedStoreId === s.id && styles.optionPillActive]}
                  onPress={() => { setSelectedStoreId(s.id); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.optionPillText, selectedStoreId === s.id && styles.optionPillTextActive]}>
                    {s.storeName}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dry Matter %</Text>
          <Input value={dryMatterPct} onChangeText={setDryMatterPct} placeholder="e.g. 32.5" keyboardType="decimal-pad" />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>pH</Text>
          <Input value={ph} onChangeText={setPh} placeholder="e.g. 4.2" keyboardType="decimal-pad" />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metabolisable Energy (MJ/kg DM)</Text>
          <Input value={metabolisableEnergy} onChangeText={setMetabolisableEnergy} placeholder="e.g. 11.2" keyboardType="decimal-pad" />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crude Protein %</Text>
          <Input value={crudeProteinPct} onChangeText={setCrudeProteinPct} placeholder="e.g. 14.5" keyboardType="decimal-pad" />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ammonia-N (% of total N)</Text>
          <Input value={ammoniaN} onChangeText={setAmmoniaN} placeholder="e.g. 8.0" keyboardType="decimal-pad" />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lab / Analyser</Text>
          <Input value={labName} onChangeText={setLabName} placeholder="e.g. Trouw Nutrition, NIRS on-farm" />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Any other observations…"
            multiline
            numberOfLines={3}
          />
        </View>

        <Button
          title={saving ? "Saving…" : "Save Test"}
          onPress={doSave}
          disabled={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  backBtn: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.sm },
  hintText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  optionPill: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: "center",
  },
  optionPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionPillText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  optionPillTextActive: { color: "#fff" },
  saveBtn: { marginTop: spacing.sm },
});
