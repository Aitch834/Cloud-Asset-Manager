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
import type { TbTestRecord } from "@/lib/types";

type TestType = TbTestRecord["testType"];
type TestResult = TbTestRecord["result"];

const TEST_TYPES: { key: TestType; label: string }[] = [
  { key: "routine", label: "Routine / Scheduled" },
  { key: "pre_movement", label: "Pre-Movement Test" },
  { key: "contiguous", label: "Contiguous Herd Test" },
  { key: "gamma_ifn", label: "Gamma Interferon Test" },
  { key: "check_test", label: "Check Test" },
  { key: "other", label: "Other" },
];

const RESULTS: { key: TestResult; label: string; color: string }[] = [
  { key: "clear", label: "Clear — No Reactors", color: colors.success },
  { key: "inconclusive", label: "Inconclusive", color: colors.warning ?? colors.primary },
  { key: "failed_reactors", label: "Failed — Reactors Found", color: colors.error },
];

const SPECIES_OPTIONS = ["Cattle", "Buffalo", "Deer"];

export default function TbTestScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [testDate, setTestDate] = useState(today);
  const [herdOrFlockNumber, setHerdOrFlockNumber] = useState("");
  const [species, setSpecies] = useState("Cattle");
  const [testType, setTestType] = useState<TestType>("routine");
  const [vetName, setVetName] = useState("");
  const [vetAddress, setVetAddress] = useState("");
  const [animalsTested, setAnimalsTested] = useState("");
  const [reactors, setReactors] = useState("0");
  const [inconclusives, setInconclusives] = useState("0");
  const [result, setResult] = useState<TestResult>("clear");
  const [restrictionsLifted, setRestrictionsLifted] = useState(false);
  const [retestDueDate, setRetestDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!testDate || !vetName.trim() || !animalsTested.trim()) {
      Alert.alert("Required Fields", "Please enter the test date, vet name and number of animals tested.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: TbTestRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      testDate,
      herdOrFlockNumber: herdOrFlockNumber.trim(),
      species,
      testType,
      vetName: vetName.trim(),
      vetAddress: vetAddress.trim(),
      animalsTested: animalsTested.trim(),
      reactors: reactors.trim(),
      inconclusives: inconclusives.trim(),
      result,
      restrictionsLifted,
      retestDueDate: retestDueDate.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.TB_TEST_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "TB test record saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>TB Test Record</Text>
            <Text style={styles.subtitle}>Tuberculin skin test results & reactor log</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <Text style={styles.sectionTitle}>Test Details</Text>
          <Input
            label="Test Date *"
            value={testDate}
            onChangeText={setTestDate}
            placeholder="YYYY-MM-DD"
          />
          <Input
            label="Herd / CTS Number"
            value={herdOrFlockNumber}
            onChangeText={setHerdOrFlockNumber}
            placeholder="e.g. 33/444/55555"
          />

          <Text style={styles.fieldLabel}>Species</Text>
          <View style={styles.chipRow}>
            {SPECIES_OPTIONS.map((s) => (
              <Pressable
                key={s}
                style={[styles.chip, species === s && styles.chipActive]}
                onPress={() => setSpecies(s)}
              >
                <Text style={[styles.chipText, species === s && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Test Type *</Text>
          <View style={styles.chipRow}>
            {TEST_TYPES.map((t) => (
              <Pressable
                key={t.key}
                style={[styles.chip, testType === t.key && styles.chipActive]}
                onPress={() => setTestType(t.key)}
              >
                <Text style={[styles.chipText, testType === t.key && styles.chipTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Veterinarian</Text>
          <Input
            label="Vet Name *"
            value={vetName}
            onChangeText={setVetName}
            placeholder="e.g. Dr A. Smith"
          />
          <Input
            label="Vet Practice / Address"
            value={vetAddress}
            onChangeText={setVetAddress}
            placeholder="e.g. Valley Farm Vets, Shrewsbury"
          />

          <Text style={styles.sectionTitle}>Animals & Results</Text>
          <Input
            label="Animals Tested *"
            value={animalsTested}
            onChangeText={setAnimalsTested}
            placeholder="Number of animals"
            keyboardType="numeric"
          />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Input
                label="Reactors"
                value={reactors}
                onChangeText={setReactors}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Inconclusives"
                value={inconclusives}
                onChangeText={setInconclusives}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Test Result *</Text>
          {RESULTS.map((r) => (
            <Pressable
              key={r.key}
              style={[styles.resultOption, result === r.key && { borderColor: r.color, backgroundColor: r.color + "15" }]}
              onPress={() => setResult(r.key)}
            >
              <View style={[styles.radioOuter, result === r.key && { borderColor: r.color }]}>
                {result === r.key && <View style={[styles.radioInner, { backgroundColor: r.color }]} />}
              </View>
              <Text style={[styles.resultLabel, result === r.key && { color: r.color }]}>{r.label}</Text>
            </Pressable>
          ))}

          {(result === "inconclusive" || result === "failed_reactors") && (
            <Input
              label="Retest Due Date"
              value={retestDueDate}
              onChangeText={setRetestDueDate}
              placeholder="YYYY-MM-DD"
            />
          )}

          <Pressable
            style={styles.toggleRow}
            onPress={() => setRestrictionsLifted(!restrictionsLifted)}
          >
            <View style={[styles.checkbox, restrictionsLifted && styles.checkboxChecked]}>
              {restrictionsLifted && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={styles.toggleLabel}>Movement restrictions lifted</Text>
          </Pressable>

          <Text style={styles.sectionTitle}>Notes</Text>
          <Input
            label="Additional Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional information..."
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save TB Test Record"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: { marginRight: spacing.sm, padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.sm },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextActive: { color: colors.primary },
  row: { flexDirection: "row" },
  resultOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  radioInner: { width: 8, height: 8, borderRadius: 4 },
  resultLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1 },
});
