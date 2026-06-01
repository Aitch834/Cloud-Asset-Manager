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

const TEST_METHODS = ["ELISA", "AGID (Agar Gel Immunodiffusion)", "PCR", "Western Blot", "Other"];
const STATUSES = ["CAEV Free Accredited", "Monitored Herd", "In Progress", "Positive — Action Required", "Pending Results"];
const SCHEMES = ["GoatVet CAEV Accreditation", "British Goat Society", "Other", "None"];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function CaeMonitoringScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [testDate, setTestDate] = useState(todayDate());
  const [flockGroup, setFlockGroup] = useState("");
  const [numberTested, setNumberTested] = useState("");
  const [numberPositive, setNumberPositive] = useState("");
  const [testMethod, setTestMethod] = useState("");
  const [scheme, setScheme] = useState("");
  const [status, setStatus] = useState("");
  const [testingVet, setTestingVet] = useState("");
  const [labName, setLabName] = useState("");
  const [labRef, setLabRef] = useState("");
  const [nextTestDue, setNextTestDue] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!testDate.trim()) {
      Alert.alert("Test date required", "Please enter the date of testing.");
      return;
    }
    if (!numberTested.trim()) {
      Alert.alert("Animals tested required", "Please enter the number of animals tested.");
      return;
    }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "cae-monitoring",
        testDate,
        flockGroup: flockGroup || null,
        numberTested: Number(numberTested),
        numberPositive: numberPositive ? Number(numberPositive) : null,
        testMethod: testMethod || null,
        scheme: scheme || null,
        status: status || null,
        testingVet: testingVet || null,
        labName: labName || null,
        labRef: labRef || null,
        nextTestDue: nextTestDue || null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/goat-dairy/cae-monitoring`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "CAE test recorded",
        `Test for ${numberTested} animals recorded. Will sync when connected.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
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
        <Text style={styles.headerTitle}>CAE Monitoring</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.hint}>Caprine Arthritis Encephalitis (CAE) — annual blood testing required for CAEV-free accreditation</Text>

        <Text style={styles.sectionTitle}>Test Details</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Test Date *</Text>
            <Input value={testDate} onChangeText={setTestDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Next Test Due</Text>
            <Input value={nextTestDue} onChangeText={setNextTestDue} placeholder="YYYY-MM-DD" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Herd / Group</Text>
          <Input value={flockGroup} onChangeText={setFlockGroup} placeholder="e.g. Home herd — milking does" />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Animals Tested *</Text>
            <Input value={numberTested} onChangeText={setNumberTested} placeholder="e.g. 32" keyboardType="number-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Positive Results</Text>
            <Input value={numberPositive} onChangeText={setNumberPositive} placeholder="e.g. 0" keyboardType="number-pad" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Test Method</Text>
        <View style={styles.chips}>
          {TEST_METHODS.map(m => (
            <Chip key={m} label={m} selected={testMethod === m} onPress={() => setTestMethod(m === testMethod ? "" : m)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Accreditation Scheme</Text>
        <View style={styles.chips}>
          {SCHEMES.map(s => (
            <Chip key={s} label={s} selected={scheme === s} onPress={() => setScheme(s === scheme ? "" : s)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.chips}>
          {STATUSES.map(s => (
            <Chip key={s} label={s} selected={status === s} onPress={() => setStatus(s === status ? "" : s)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Lab & Vet Details</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Testing Vet / Practice</Text>
          <Input value={testingVet} onChangeText={setTestingVet} placeholder="Vet name or practice" />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Laboratory</Text>
            <Input value={labName} onChangeText={setLabName} placeholder="e.g. APHA" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Lab Reference</Text>
            <Input value={labRef} onChangeText={setLabRef} placeholder="Lab ref number" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />
        </View>

        <Button title={saving ? "Saving…" : "Save CAE Test Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.surface },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.xs },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, backgroundColor: colors.infoBg, borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: "#15803d", borderColor: "#15803d" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  saveBtn: { marginTop: spacing.md },
});
