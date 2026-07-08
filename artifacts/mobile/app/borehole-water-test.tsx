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

const RESULT_OPTIONS = ["Pass", "Pass with treatment", "Fail", "Retest required"];
const OVERALL_OPTIONS = ["Pass", "Pass with treatment", "Fail", "Retest required"];

function Chip({ label, selected, onPress, color }: { label: string; selected: boolean; onPress: () => void; color?: string }) {
  const activeColor = color ?? "#0284c7";
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: activeColor, borderColor: activeColor }]}
    >
      <Text style={[styles.chipText, selected && { color: "#fff" }]}>{label}</Text>
    </Pressable>
  );
}

function chipColor(value: string): string {
  if (value.startsWith("Pass")) return "#15803d";
  if (value.startsWith("Fail")) return "#dc2626";
  return "#b45309";
}

export default function BoreholeWaterTestScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [testDate, setTestDate] = useState(todayDate());
  const [testingCompany, setTestingCompany] = useState("");
  const [staticWaterLevelM, setStaticWaterLevelM] = useState("");
  const [pumpingWaterLevelM, setPumpingWaterLevelM] = useState("");
  const [bacteriologicalResult, setBacteriologicalResult] = useState("");
  const [chemicalResult, setChemicalResult] = useState("");
  const [overallResult, setOverallResult] = useState("");
  const [nextTestDueDate, setNextTestDueDate] = useState("");
  const [correctiveAction, setCorrectiveAction] = useState("");

  const handleSave = async () => {
    if (!testDate.trim()) {
      Alert.alert("Required", "Please enter the test date.");
      return;
    }

    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "borehole-water-test",
        testDate,
        testingCompany: testingCompany || null,
        staticWaterLevelM: staticWaterLevelM ? Number(staticWaterLevelM) : null,
        pumpingWaterLevelM: pumpingWaterLevelM ? Number(pumpingWaterLevelM) : null,
        bacteriologicalResult: bacteriologicalResult || null,
        chemicalResult: chemicalResult || null,
        overallResult: overallResult || null,
        nextTestDueDate: nextTestDueDate || null,
        correctiveAction: correctiveAction || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/borehole-tests`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };

      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const hasFail = overallResult.startsWith("Fail") || bacteriologicalResult.startsWith("Fail") || chemicalResult.startsWith("Fail");

      if (hasFail) {
        Alert.alert(
          "Test Failure Recorded",
          "The borehole test failure has been saved. Ensure corrective actions are implemented before the water source is used.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          "Borehole Test Saved",
          "The water test record has been saved and will sync when connected.",
          [{ text: "Done", onPress: () => router.back() }]
        );
      }
    } catch {
      Alert.alert("Error", "Failed to save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Borehole Water Test</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.hint}>
          Record borehole and well water test results. Log the sampling visit now and return to
          enter laboratory results once the report arrives.
        </Text>

        <Text style={styles.sectionTitle}>Sample Visit</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Test Date *</Text>
            <Input value={testDate} onChangeText={setTestDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Next Test Due</Text>
            <Input value={nextTestDueDate} onChangeText={setNextTestDueDate} placeholder="YYYY-MM-DD" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Testing Company</Text>
          <Input value={testingCompany} onChangeText={setTestingCompany} placeholder="Company or lab name" />
        </View>

        <Text style={styles.sectionTitle}>Water Levels</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Static Water Level (m)</Text>
            <Input
              value={staticWaterLevelM}
              onChangeText={setStaticWaterLevelM}
              placeholder="e.g. 12.5"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Pumping Water Level (m)</Text>
            <Input
              value={pumpingWaterLevelM}
              onChangeText={setPumpingWaterLevelM}
              placeholder="e.g. 18.2"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Bacteriological Result</Text>
        <View style={styles.chips}>
          {RESULT_OPTIONS.map(o => (
            <Chip
              key={o}
              label={o}
              selected={bacteriologicalResult === o}
              onPress={() => setBacteriologicalResult(bacteriologicalResult === o ? "" : o)}
              color={chipColor(o)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Chemical Result</Text>
        <View style={styles.chips}>
          {RESULT_OPTIONS.map(o => (
            <Chip
              key={o}
              label={o}
              selected={chemicalResult === o}
              onPress={() => setChemicalResult(chemicalResult === o ? "" : o)}
              color={chipColor(o)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Overall Result</Text>
        <View style={styles.chips}>
          {OVERALL_OPTIONS.map(o => (
            <Chip
              key={o}
              label={o}
              selected={overallResult === o}
              onPress={() => setOverallResult(overallResult === o ? "" : o)}
              color={chipColor(o)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Corrective Action</Text>
        <View style={styles.field}>
          <Input
            value={correctiveAction}
            onChangeText={setCorrectiveAction}
            placeholder="Actions taken or required following this test"
            multiline
            numberOfLines={3}
          />
        </View>

        <Button
          title={saving ? "Saving…" : "Save Borehole Test Record"}
          onPress={handleSave}
          disabled={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.xs },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    backgroundColor: colors.infoBg,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  saveBtn: { marginTop: spacing.md },
});
