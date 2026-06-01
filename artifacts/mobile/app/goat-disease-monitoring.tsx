import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiGoatFlocks } from "@/lib/hooks/useApiGoatFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate() { return new Date().toISOString().split("T")[0]; }

const MONITORING_TYPES = ["CAE / CAEV", "CLA (Caseous Lymphadenitis)", "Johne's Disease", "Foot Rot", "Cryptosporidiosis", "Toxoplasmosis", "Chlamydiosis", "Mycoplasma", "Faecal Egg Count (FEC)", "Other"];
const STATUSES = ["Negative / Clear", "Positive — Action Required", "Pending Results", "In Progress", "Inconclusive"];
const TESTING_BODIES = ["APHA", "SAC Consulting", "Biobest", "Farm Vet", "Farm Lab", "GoatVet", "Other"];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function GoatDiseaseMonitoringScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading } = useApiGoatFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState("");
  const [monitoringDate, setMonitoringDate] = useState(todayDate());
  const [monitoringType, setMonitoringType] = useState("");
  const [schemeReference, setSchemeReference] = useState("");
  const [testingBody, setTestingBody] = useState("");
  const [numberOfSamples, setNumberOfSamples] = useState("");
  const [positiveResults, setPositiveResults] = useState("");
  const [negativeResults, setNegativeResults] = useState("");
  const [status, setStatus] = useState("Pending Results");
  const [actionsTaken, setActionsTaken] = useState("");
  const [nextTestDue, setNextTestDue] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!monitoringDate.trim()) { Alert.alert("Date required", "Please enter the monitoring date."); return; }
    if (!monitoringType) { Alert.alert("Type required", "Please select the monitoring type."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "goat-disease-monitoring",
        herdId: flockId ? Number(flockId) : null,
        monitoringDate,
        monitoringType,
        schemeReference: schemeReference || null,
        testingBody: testingBody || null,
        numberOfSamples: numberOfSamples ? Number(numberOfSamples) : null,
        positiveResults: positiveResults ? Number(positiveResults) : 0,
        negativeResults: negativeResults ? Number(negativeResults) : 0,
        status,
        actionsTaken: actionsTaken || null,
        nextTestDue: nextTestDue || null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/goat-disease-monitoring`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Disease monitoring saved", "Will sync when connected.", [{ text: "Done", onPress: () => router.back() }]);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Save failed", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Goat Disease Monitoring</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Herd</Text>
        {flocksLoading ? <Text style={styles.hint}>Loading herds…</Text> : flocks.length > 0 ? (
          <View style={styles.chips}>
            {flocks.map((f) => <Chip key={String(f.id)} label={f.name ?? "Herd"} selected={flockId === String(f.id)} onPress={() => { Haptics.selectionAsync(); setFlockId(String(f.id)); }} />)}
          </View>
        ) : <Text style={styles.hint}>No goat herds found.</Text>}

        <Text style={styles.sectionTitle}>Monitoring Type</Text>
        <View style={styles.chips}>
          {MONITORING_TYPES.map((t) => <Chip key={t} label={t} selected={monitoringType === t} onPress={() => { Haptics.selectionAsync(); setMonitoringType(t); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Test Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Monitoring Date *</Text>
            <Input value={monitoringDate} onChangeText={setMonitoringDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>No. of Samples</Text>
            <Input value={numberOfSamples} onChangeText={setNumberOfSamples} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Positive Results</Text>
            <Input value={positiveResults} onChangeText={setPositiveResults} keyboardType="numeric" placeholder="0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Negative Results</Text>
            <Input value={negativeResults} onChangeText={setNegativeResults} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Scheme / Reference</Text>
            <Input value={schemeReference} onChangeText={setSchemeReference} placeholder="e.g. CAEV accreditation ref" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Next Test Due</Text>
            <Input value={nextTestDue} onChangeText={setNextTestDue} placeholder="YYYY-MM-DD" />
          </View>
        </View>

        <Text style={styles.label}>Testing Body</Text>
        <View style={styles.chips}>
          {TESTING_BODIES.map((b) => <Chip key={b} label={b} selected={testingBody === b} onPress={() => { Haptics.selectionAsync(); setTestingBody(b); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.chips}>
          {STATUSES.map((s) => <Chip key={s} label={s} selected={status === s} onPress={() => { Haptics.selectionAsync(); setStatus(s); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Actions & Notes</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Actions Taken</Text>
          <Input value={actionsTaken} onChangeText={setActionsTaken} placeholder="Actions taken as a result of this monitoring" multiline numberOfLines={2} />
        </View>
        <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Monitoring Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: "#0891b2", borderColor: "#0891b2" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  saveBtn: { marginTop: spacing.md },
});
