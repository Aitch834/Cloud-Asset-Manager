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
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate() { return new Date().toISOString().split("T")[0]; }

const COMPLIANCE_OPTIONS = [
  { key: "compliant", label: "Compliant", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { key: "partially_compliant", label: "Partial", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { key: "non_compliant", label: "Non-compliant", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
];

const BLOCK_REASONS = [
  "Avian influenza prevention zone",
  "Severe weather",
  "Veterinary advice",
  "Ground conditions / poaching risk",
  "Disease investigation",
  "Range renovation",
  "Other",
];

const VEG_CONDITIONS = ["Good", "Moderate", "Poor", "Bare / poached"];

function Chip({ label, selected, onPress, chipColor }: { label: string; selected: boolean; onPress: () => void; chipColor?: string }) {
  const bg = selected ? (chipColor ?? "#0f766e") : colors.surface;
  const bc = selected ? (chipColor ?? "#0f766e") : colors.borderLight;
  return (
    <Pressable onPress={onPress} style={[styles.chip, { backgroundColor: bg, borderColor: bc }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function OrganicPoultryAccessScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [recordDate, setRecordDate] = useState(todayDate());
  const [flockRef, setFlockRef] = useState("");
  const [houseOrLocation, setHouseOrLocation] = useState("");
  const [birdsInFlock, setBirdsInFlock] = useState("");
  const [birdsAccessedRange, setBirdsAccessedRange] = useState("");
  const [rangeAreaHa, setRangeAreaHa] = useState("");
  const [accessDurationHours, setAccessDurationHours] = useState("");
  const [vegetationCondition, setVegetationCondition] = useState("");
  const [complianceStatus, setComplianceStatus] = useState("compliant");
  const [accessBlocked, setAccessBlocked] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [notes, setNotes] = useState("");

  const birdsPerHa = birdsInFlock && rangeAreaHa && Number(rangeAreaHa) > 0
    ? (Number(birdsInFlock) / Number(rangeAreaHa)).toFixed(0)
    : null;

  const handleSave = async () => {
    if (!recordDate.trim()) { Alert.alert("Date required", "Please enter the record date."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "organic-poultry-access",
        recordDate,
        flockRef: flockRef || null,
        houseOrLocation: houseOrLocation || null,
        birdsInFlock: birdsInFlock ? Number(birdsInFlock) : null,
        birdsAccessedRange: birdsAccessedRange ? Number(birdsAccessedRange) : null,
        rangeAreaHa: rangeAreaHa || null,
        birdsPerHa: birdsPerHa ?? null,
        accessDurationHours: accessDurationHours || null,
        vegetationCondition: vegetationCondition || null,
        complianceStatus,
        accessBlocked,
        accessBlockReason: accessBlocked ? (blockReason || null) : null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/organic-poultry/access-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Access record saved", "Will sync when connected.", [{ text: "Done", onPress: () => router.back() }]);
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
        <Text style={styles.headerTitle}>Organic Poultry — Outdoor Access</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.infoBox}>
          <Feather name="info" size={14} color="#0f766e" />
          <Text style={styles.infoText}>
            Organic poultry must have continuous daytime access to outdoor range. Max stocking: 2,500 birds/ha (meat birds) or 170 kg LW/ha (laying hens). Record each time access is assessed or restricted.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Record Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Date *</Text>
            <Input value={recordDate} onChangeText={setRecordDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Flock / Flock ID</Text>
            <Input value={flockRef} onChangeText={setFlockRef} placeholder="e.g. Layer Flock 1" />
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>House / Location</Text>
          <Input value={houseOrLocation} onChangeText={setHouseOrLocation} placeholder="e.g. House A, North Range" />
        </View>

        <Text style={styles.sectionTitle}>Compliance Status</Text>
        <View style={styles.complianceRow}>
          {COMPLIANCE_OPTIONS.map((opt) => (
            <Pressable key={opt.key} onPress={() => { Haptics.selectionAsync(); setComplianceStatus(opt.key); }}
              style={[styles.complianceBtn, { backgroundColor: complianceStatus === opt.key ? opt.bg : colors.surface, borderColor: complianceStatus === opt.key ? opt.border : colors.borderLight }]}>
              <Text style={[styles.complianceTxt, { color: complianceStatus === opt.key ? opt.color : colors.textSecondary }]}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.field}>
          <Pressable onPress={() => { Haptics.selectionAsync(); setAccessBlocked(!accessBlocked); }} style={styles.checkRow}>
            <View style={[styles.checkbox, accessBlocked && styles.checkboxChecked]}>
              {accessBlocked && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={styles.label}>Outdoor access blocked today</Text>
          </Pressable>
        </View>

        {accessBlocked && (
          <>
            <Text style={styles.sectionTitle}>Reason Access Blocked</Text>
            <View style={styles.chips}>
              {BLOCK_REASONS.map((r) => (
                <Chip key={r} label={r} selected={blockReason === r} onPress={() => { Haptics.selectionAsync(); setBlockReason(r); }} chipColor="#dc2626" />
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Flock & Range Data</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Birds in Flock</Text>
            <Input value={birdsInFlock} onChangeText={setBirdsInFlock} keyboardType="number-pad" placeholder="0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Birds on Range</Text>
            <Input value={birdsAccessedRange} onChangeText={setBirdsAccessedRange} keyboardType="number-pad" placeholder="0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Range Area (ha)</Text>
            <Input value={rangeAreaHa} onChangeText={setRangeAreaHa} keyboardType="decimal-pad" placeholder="0.00" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Access Duration (hrs)</Text>
            <Input value={accessDurationHours} onChangeText={setAccessDurationHours} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
        </View>
        {birdsPerHa && (
          <View style={[styles.infoBox, { marginTop: 0 }]}>
            <Feather name="users" size={14} color="#0f766e" />
            <Text style={styles.infoText}>Calculated stocking density: <Text style={{ fontFamily: fonts.semiBold }}>{birdsPerHa} birds/ha</Text></Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Vegetation Condition</Text>
        <View style={styles.chips}>
          {VEG_CONDITIONS.map((v) => (
            <Chip key={v} label={v} selected={vegetationCondition === v} onPress={() => { Haptics.selectionAsync(); setVegetationCondition(v); }}
              chipColor={v === "Good" ? "#16a34a" : v === "Moderate" ? "#d97706" : "#dc2626"} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Additional observations" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Access Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.surface },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, flex: 1, textAlign: "center" },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.xs },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1 },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  complianceRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  complianceBtn: { flex: 1, alignItems: "center", paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1.5 },
  complianceTxt: { fontFamily: fonts.semiBold, fontSize: fontSize.xs },
  checkRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: colors.borderLight, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  checkboxChecked: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  infoBox: { flexDirection: "row", gap: spacing.xs, backgroundColor: "#ccfbf1", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, alignItems: "flex-start" },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#134e4a", flex: 1 },
  saveBtn: { marginTop: spacing.md },
});
