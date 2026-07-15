import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const SAMPLE_TYPES = [
  { key: "boot_swab", label: "Boot Swab" },
  { key: "drag_swab", label: "Drag Swab" },
  { key: "hand_held_swab", label: "Hand-held Swab" },
  { key: "environmental", label: "Environmental Swab" },
  { key: "faecal", label: "Faecal Sample" },
];

const RESULTS = [
  { key: "negative", label: "Negative" },
  { key: "positive", label: "Positive" },
  { key: "pending", label: "Pending" },
];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function SwitchRow({ label, value, onValueChange, hint }: { label: string; value: boolean; onValueChange: (v: boolean) => void; hint?: string }) {
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderLight, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function PoultryNcpTestScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [sampleDate, setSampleDate] = useState(todayDate());
  const [flockRef, setFlockRef] = useState("");
  const [sampleType, setSampleType] = useState<string>("boot_swab");
  const [sampleRef, setSampleRef] = useState("");
  const [laboratoryName, setLaboratoryName] = useState("");
  const [result, setResult] = useState<string>("pending");
  const [serotypeIsolated, setSerotypeIsolated] = useState("");
  const [notificationSentToApha, setNotificationSentToApha] = useState(false);
  const [notes, setNotes] = useState("");

  const isPositive = result === "positive";

  async function handleSave() {
    if (!currentFarm) {
      Alert.alert("No farm selected", "Please select a farm before saving.");
      return;
    }
    if (!sampleDate) {
      Alert.alert("Required", "Please enter the sample date.");
      return;
    }
    setSaving(true);
    try {
      const record = {
        id: generateId(),
        farmId: currentFarm.id,
        sampleDate,
        flockRef,
        samplingMethod: sampleType,
        sampleRef,
        laboratoryName,
        result,
        serotypeIsolated: isPositive ? serotypeIsolated : null,
        notificationSentToApha: isPositive ? notificationSentToApha : false,
        notes,
        recordedBy: user?.name ?? null,
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.POULTRY_NCP_TESTS, record);
      await refreshPendingCount();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "NCP Salmonella test record saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="x" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>NCP Salmonella Test</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionHeader}>Test Details</Text>

          <Text style={styles.label}>Sample Date</Text>
          <Input value={sampleDate} onChangeText={setSampleDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.label}>Flock / Shed Reference</Text>
          <Input value={flockRef} onChangeText={setFlockRef} placeholder="e.g. House 2 — Broiler flock" />

          <Text style={styles.label}>Sample Type</Text>
          <View style={styles.chips}>
            {SAMPLE_TYPES.map((s) => (
              <Chip key={s.key} label={s.label} selected={sampleType === s.key} onPress={() => setSampleType(s.key)} />
            ))}
          </View>

          <Text style={styles.label}>Sample Reference / Batch No.</Text>
          <Input value={sampleRef} onChangeText={setSampleRef} placeholder="Lab ref or batch number" />

          <Text style={styles.label}>Laboratory Name</Text>
          <Input value={laboratoryName} onChangeText={setLaboratoryName} placeholder="e.g. APHA Weybridge" />

          <Text style={styles.sectionHeader}>Result</Text>

          <Text style={styles.label}>Test Result</Text>
          <View style={styles.chips}>
            {RESULTS.map((r) => (
              <Chip
                key={r.key}
                label={r.label}
                selected={result === r.key}
                onPress={() => setResult(r.key)}
              />
            ))}
          </View>

          {isPositive && (
            <>
              <Text style={styles.label}>Serotype Isolated</Text>
              <Input
                value={serotypeIsolated}
                onChangeText={setSerotypeIsolated}
                placeholder="e.g. S. Enteritidis, S. Typhimurium"
              />
              <SwitchRow
                label="APHA Notification Sent"
                hint="Salmonella Enteritidis and Typhimurium are notifiable — APHA must be informed"
                value={notificationSentToApha}
                onValueChange={setNotificationSentToApha}
              />
            </>
          )}

          <Text style={styles.sectionHeader}>Notes</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional observations or actions taken"
            multiline
            numberOfLines={3}
          />

          <Button title={saving ? "Saving…" : "Save Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backBtn: { padding: 6 },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  body: { padding: spacing.md, gap: spacing.sm, paddingBottom: 40 },
  sectionHeader: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: 4 },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  saveBtn: { marginTop: spacing.lg },
});
