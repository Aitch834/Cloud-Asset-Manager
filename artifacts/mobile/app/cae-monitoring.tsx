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
import { SmallRuminantPicker } from "@/components/ui/SmallRuminantPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiGoatFlocks } from "@/lib/hooks/useApiGoatFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const TEST_TYPES = ["ELISA Blood Test", "AGID (Agar Gel Immunodiffusion)", "PCR", "Western Blot", "Other"];
const ACCREDITATION_STATUSES = ["CAEV Free Accredited", "Monitored Herd", "In Progress", "Positive — Action Required", "Pending Results"];
const ACCREDITATION_BODIES = ["GoatVet CAEV Accreditation", "British Goat Society", "Other", "None"];

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
  const { flocks, loading: flocksLoading, fromCache: flocksCached, error: flocksError } = useApiGoatFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [testDate, setTestDate] = useState(todayDate());
  const [flockId, setFlockId] = useState("");
  const [animalsTestedCount, setAnimalsTestedCount] = useState("");
  const [positiveCount, setPositiveCount] = useState("");
  const [testType, setTestType] = useState("");
  const [accreditationBody, setAccreditationBody] = useState("");
  const [caeAccreditationStatus, setCaeAccreditationStatus] = useState("");
  const [vetName, setVetName] = useState("");
  const [laboratory, setLaboratory] = useState("");
  const [labRef, setLabRef] = useState("");
  const [nextTestDue, setNextTestDue] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!testDate.trim()) {
      Alert.alert("Test date required", "Please enter the date of testing.");
      return;
    }
    if (!animalsTestedCount.trim()) {
      Alert.alert("Animals tested required", "Please enter the number of animals tested.");
      return;
    }
    if (!testType) {
      Alert.alert("Test type required", "Please select the type of test performed.");
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
        flockId: flockId ? Number(flockId) : null,
        animalsTestedCount: Number(animalsTestedCount),
        positiveCount: positiveCount ? Number(positiveCount) : null,
        testType: testType || null,
        accreditationBody: accreditationBody || null,
        caeAccreditationStatus: caeAccreditationStatus || null,
        vetName: vetName || null,
        laboratory: laboratory || null,
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
        `Test for ${animalsTestedCount} animals recorded. Will sync when connected.`,
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
          <SmallRuminantPicker species="goat" value={flockId} onChange={setFlockId} flocks={flocks} loading={flocksLoading} fromCache={flocksCached} error={flocksError} />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Animals Tested *</Text>
            <Input value={animalsTestedCount} onChangeText={setAnimalsTestedCount} placeholder="e.g. 32" keyboardType="number-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Positive Results</Text>
            <Input value={positiveCount} onChangeText={setPositiveCount} placeholder="e.g. 0" keyboardType="number-pad" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Test Type *</Text>
        <View style={styles.chips}>
          {TEST_TYPES.map(m => (
            <Chip key={m} label={m} selected={testType === m} onPress={() => setTestType(m === testType ? "" : m)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Accreditation Scheme</Text>
        <View style={styles.chips}>
          {ACCREDITATION_BODIES.map(s => (
            <Chip key={s} label={s} selected={accreditationBody === s} onPress={() => setAccreditationBody(s === accreditationBody ? "" : s)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Accreditation Status</Text>
        <View style={styles.chips}>
          {ACCREDITATION_STATUSES.map(s => (
            <Chip key={s} label={s} selected={caeAccreditationStatus === s} onPress={() => setCaeAccreditationStatus(s === caeAccreditationStatus ? "" : s)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Lab & Vet Details</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Testing Vet / Practice</Text>
          <Input value={vetName} onChangeText={setVetName} placeholder="Vet name or practice" />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Laboratory</Text>
            <Input value={laboratory} onChangeText={setLaboratory} placeholder="e.g. APHA" />
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
