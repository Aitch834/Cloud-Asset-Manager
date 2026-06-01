import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiHerds } from "@/lib/hooks/useApiHerds";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate() { return new Date().toISOString().split("T")[0]; }

const EVENT_TYPES = [
  "Vaccination",
  "bTB skin test (SICCT)",
  "bTB gamma-interferon blood test",
  "Post mortem examination",
  "Worming / parasite treatment",
  "Other vet treatment",
  "Vet visit / health check",
];
const BTB_RESULTS = ["Clear / Negative", "Standard Reactor", "Inconclusive Reactor", "Not Applicable"];

const CHIP_COLOR = "#15803d";

function Chip({ label, selected, onPress, chipColor }: { label: string; selected: boolean; onPress: () => void; chipColor?: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && { backgroundColor: chipColor ?? CHIP_COLOR, borderColor: chipColor ?? CHIP_COLOR }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const isBtbTest = (et: string) => et === "bTB skin test (SICCT)" || et === "bTB gamma-interferon blood test";

export default function VenisonHealthRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { herds, loading: herdsLoading } = useApiHerds(currentFarm?.id);
  const displayHerds = herds.filter((h) => /deer|venison|red|roe|fallow|sika|muntjac/i.test(h.type ?? "")).length > 0
    ? herds.filter((h) => /deer|venison|red|roe|fallow|sika|muntjac/i.test(h.type ?? ""))
    : herds;
  const [saving, setSaving] = useState(false);

  const [herdId, setHerdId] = useState("");
  const [eventDate, setEventDate] = useState(todayDate());
  const [healthEventType, setHealthEventType] = useState("Vaccination");
  const [productOrDescription, setProductOrDescription] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [numberTreated, setNumberTreated] = useState("");
  const [withdrawalPeriodDays, setWithdrawalPeriodDays] = useState("0");
  const [btbTestResult, setBtbTestResult] = useState("Clear / Negative");
  const [aphaReference, setAphaReference] = useState("");
  const [vetName, setVetName] = useState("");
  const [vetPrescribed, setVetPrescribed] = useState(false);
  const [notifiableDisease, setNotifiableDisease] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!eventDate.trim()) { Alert.alert("Date required", "Please enter the event date."); return; }
    if (!healthEventType) { Alert.alert("Event type required", "Please select the event type."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "venison-health-record",
        herdId: herdId ? Number(herdId) : null,
        eventDate,
        healthEventType,
        productOrDescription: productOrDescription || null,
        batchNumber: batchNumber || null,
        numberTreated: numberTreated ? Number(numberTreated) : null,
        withdrawalPeriodDays: Number(withdrawalPeriodDays || 0),
        btbTestResult: isBtbTest(healthEventType) ? btbTestResult : null,
        aphaReference: aphaReference || null,
        vetName: vetName || null,
        vetPrescribed,
        notifiableDiseaseSupect: notifiableDisease,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/venison-health-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Health record saved", "Will sync when connected.", [{ text: "Done", onPress: () => router.back() }]);
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
        <Text style={styles.headerTitle}>Venison Health Record</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Deer Herd</Text>
        {herdsLoading ? <Text style={styles.hint}>Loading herds…</Text> : displayHerds.length > 0 ? (
          <View style={styles.chips}>
            {displayHerds.map((h) => <Chip key={String(h.id)} label={h.name ?? "Herd"} selected={herdId === String(h.id)} onPress={() => { Haptics.selectionAsync(); setHerdId(String(h.id)); }} />)}
          </View>
        ) : <Text style={styles.hint}>No herds found.</Text>}

        <Text style={styles.sectionTitle}>Event Type *</Text>
        <View style={styles.chips}>
          {EVENT_TYPES.map((e) => <Chip key={e} label={e} selected={healthEventType === e} onPress={() => { Haptics.selectionAsync(); setHealthEventType(e); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Event Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Event Date *</Text>
            <Input value={eventDate} onChangeText={setEventDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>No. Animals Treated</Text>
            <Input value={numberTreated} onChangeText={setNumberTreated} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Product / Description</Text>
          <Input value={productOrDescription} onChangeText={setProductOrDescription} placeholder="Product name or procedure description" />
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Batch Number</Text>
            <Input value={batchNumber} onChangeText={setBatchNumber} placeholder="Batch / lot no." />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Withdrawal Period (days)</Text>
            <Input value={withdrawalPeriodDays} onChangeText={setWithdrawalPeriodDays} keyboardType="numeric" placeholder="0" />
          </View>
        </View>

        {isBtbTest(healthEventType) && (
          <>
            <Text style={styles.sectionTitle}>bTB Test Result</Text>
            <View style={styles.chips}>
              {BTB_RESULTS.map((r) => (
                <Chip key={r} label={r} selected={btbTestResult === r}
                  onPress={() => { Haptics.selectionAsync(); setBtbTestResult(r); }}
                  chipColor={r === "Clear / Negative" ? "#16a34a" : r === "Not Applicable" ? "#6b7280" : "#dc2626"} />
              ))}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>APHA Reference</Text>
              <Input value={aphaReference} onChangeText={setAphaReference} placeholder="e.g. APHA-TB-2025-001" />
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Vet Details</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Vet Name</Text>
          <Input value={vetName} onChangeText={setVetName} placeholder="Attending vet's name" />
        </View>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Vet Prescription (POM-V)</Text>
          <Switch value={vetPrescribed} onValueChange={(v) => { Haptics.selectionAsync(); setVetPrescribed(v); }} trackColor={{ false: colors.borderLight, true: CHIP_COLOR }} />
        </View>

        <Text style={styles.sectionTitle}>Notifiable Disease</Text>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Notifiable Disease Suspected</Text>
            <Text style={styles.hint}>Tick if signs are consistent with a notifiable disease.</Text>
          </View>
          <Switch value={notifiableDisease} onValueChange={(v) => { Haptics.selectionAsync(); setNotifiableDisease(v); }} trackColor={{ false: colors.borderLight, true: "#dc2626" }} />
        </View>
        {notifiableDisease && (
          <View style={styles.alertBox}>
            <Feather name="alert-triangle" size={16} color="#dc2626" />
            <Text style={styles.alertText}>Contact APHA immediately on 03000 200 301. Mandatory notification must be made before laboratory confirmation.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Clinical findings, treatment outcome…" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Health Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.sm },
  alertBox: { flexDirection: "row", gap: spacing.xs, backgroundColor: "#fee2e2", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, alignItems: "flex-start" },
  alertText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: "#991b1b", flex: 1 },
  saveBtn: { marginTop: spacing.md },
});
