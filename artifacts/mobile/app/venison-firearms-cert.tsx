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

const CERT_TYPES = [
  "Section 1 Firearms Certificate (FC)",
  "Section 2 Shotgun Certificate (SGC)",
  "DSC1 — Deer Stalking Certificate Level 1",
  "DSC2 — Deer Stalking Certificate Level 2",
  "Scottish Stalking Certificate",
  "Hunter Food Hygiene Certificate (WGMI)",
  "Larder Hygiene Certificate",
  "Other",
];
const CERT_STATUSES = ["active", "pending", "suspended", "expired", "surrendered"];

const CHIP_COLOR = "#15803d";

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && { backgroundColor: CHIP_COLOR, borderColor: CHIP_COLOR }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function VenisonFirearmsCertScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [holderName, setHolderName] = useState("");
  const [certificateType, setCertificateType] = useState("Section 1 Firearms Certificate (FC)");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [issuingAuthority, setIssuingAuthority] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [calibreOrDescription, setCalibreOrDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!holderName.trim()) { Alert.alert("Name required", "Please enter the certificate holder's name."); return; }
    if (!certificateType) { Alert.alert("Type required", "Please select the certificate type."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "venison-firearms-cert",
        holderName,
        certificateType,
        certificateNumber: certificateNumber || null,
        issuingAuthority: issuingAuthority || null,
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
        calibreOrDescription: calibreOrDescription || null,
        status,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/venison-firearms-register`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Certificate saved", "Will sync when connected.", [{ text: "Done", onPress: () => router.back() }]);
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
        <Text style={styles.headerTitle}>Firearms / Stalking Certificate</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.infoBox}>
          <Feather name="shield" size={14} color="#0891b2" />
          <Text style={styles.infoText}>All stalkers and certificate holders must have current, valid authorisation before entering the field. Section 1 FCs must be renewed every 5 years with your local police firearms licensing department.</Text>
        </View>

        <Text style={styles.sectionTitle}>Certificate Type *</Text>
        <View style={styles.chips}>
          {CERT_TYPES.map((t) => <Chip key={t} label={t} selected={certificateType === t} onPress={() => { Haptics.selectionAsync(); setCertificateType(t); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Holder Details</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Holder Name *</Text>
          <Input value={holderName} onChangeText={setHolderName} placeholder="Full name of certificate holder" />
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Certificate Number</Text>
            <Input value={certificateNumber} onChangeText={setCertificateNumber} placeholder="e.g. FC/123456/P" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Issuing Authority</Text>
            <Input value={issuingAuthority} onChangeText={setIssuingAuthority} placeholder="e.g. Hampshire Constabulary / LANTRA" />
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Calibre / Scope / Description</Text>
          <Input value={calibreOrDescription} onChangeText={setCalibreOrDescription} placeholder="e.g. .308 Winchester; any rifle under 12,000 ft⋅lb" />
        </View>

        <Text style={styles.sectionTitle}>Dates</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Issue Date</Text>
            <Input value={issueDate} onChangeText={setIssueDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Expiry Date</Text>
            <Input value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.chips}>
          {CERT_STATUSES.map((s) => (
            <Chip key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} selected={status === s} onPress={() => { Haptics.selectionAsync(); setStatus(s); }} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Conditions, restrictions, renewal notes…" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Certificate"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  infoBox: { flexDirection: "row", gap: spacing.xs, backgroundColor: "#e0f2fe", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, alignItems: "flex-start" },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#0c4a6e", flex: 1 },
  saveBtn: { marginTop: spacing.md },
});
