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

const INPUT_TYPES = ["Feed / supplement", "Mineral / vitamin", "Veterinary medicine", "Cleaning agent", "Pest control product", "Other"];
const STATUSES = ["pending", "approved", "refused", "withdrawn"];
const CERTIFYING_BODIES = ["Soil Association", "OF&G (Organic Farmers & Growers)", "Biodynamic Association", "OF&G Scotland", "Other"];

const CHIP_COLOR = "#0f766e";

function Chip({ label, selected, onPress, chipColor }: { label: string; selected: boolean; onPress: () => void; chipColor?: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && { backgroundColor: chipColor ?? CHIP_COLOR, borderColor: chipColor ?? CHIP_COLOR }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function OrganicVenisonDerogationScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [caseReference, setCaseReference] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputType, setInputType] = useState("");
  const [regulatoryBasis, setRegulatoryBasis] = useState("");
  const [certifyingBody, setCertifyingBody] = useState("Soil Association");
  const [applicationDate, setApplicationDate] = useState(todayDate());
  const [justification, setJustification] = useState("");
  const [status, setStatus] = useState("pending");
  const [internalDecisionDate, setInternalDecisionDate] = useState("");
  const [decisionDate, setDecisionDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [approvalConditions, setApprovalConditions] = useState("");
  const [availabilitySearchDate, setAvailabilitySearchDate] = useState("");
  const [availabilitySearchRef, setAvailabilitySearchRef] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionRef, setRejectionRef] = useState("");
  const [notes, setNotes] = useState("");

  const isDecided = status === "approved" || status === "refused";
  const isRefused = status === "refused";

  const handleSave = async () => {
    if (!inputName.trim()) { Alert.alert("Input name required", "Please enter the name of the input requiring a derogation."); return; }
    if (!justification.trim()) { Alert.alert("Justification required", "Please provide the justification for the derogation."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "organic-venison-derogation",
        caseReference: caseReference || null,
        inputName,
        inputType: inputType || null,
        regulatoryBasis: regulatoryBasis || null,
        certifyingBody,
        applicationDate: applicationDate || null,
        justification,
        status,
        decisionDate: decisionDate || null,
        expiryDate: expiryDate || null,
        approvalConditions: approvalConditions || null,
        internalDecisionDate: internalDecisionDate || null,
        availabilitySearchDate: availabilitySearchDate || null,
        availabilitySearchRef: availabilitySearchRef || null,
        rejectionReason: rejectionReason || null,
        rejectionRef: rejectionRef || null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/organic-venison/derogations`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Derogation saved", "Will sync when connected.", [{ text: "Done", onPress: () => router.back() }]);
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
        <Text style={styles.headerTitle}>Organic Venison Derogation</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.infoBox}>
          <Feather name="info" size={14} color={CHIP_COLOR} />
          <Text style={styles.infoText}>A derogation must be applied for before the input is used. Submit a written application to your certifying body with evidence that no certified organic alternative is available (OFIS / UKOAS search evidence). Record the application here immediately.</Text>
        </View>

        <Text style={styles.sectionTitle}>Input Details</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Input Name *</Text>
          <Input value={inputName} onChangeText={setInputName} placeholder="e.g. Haemovit B12 injection" />
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Case Reference</Text>
            <Input value={caseReference} onChangeText={setCaseReference} placeholder="e.g. DERG-2025-001" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Application Date</Text>
            <Input value={applicationDate} onChangeText={setApplicationDate} placeholder="YYYY-MM-DD" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Input Type</Text>
        <View style={styles.chips}>
          {INPUT_TYPES.map((t) => <Chip key={t} label={t} selected={inputType === t} onPress={() => { Haptics.selectionAsync(); setInputType(t); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Certifying Body</Text>
        <View style={styles.chips}>
          {CERTIFYING_BODIES.map((b) => <Chip key={b} label={b} selected={certifyingBody === b} onPress={() => { Haptics.selectionAsync(); setCertifyingBody(b); }} />)}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Regulatory Basis</Text>
          <Input value={regulatoryBasis} onChangeText={setRegulatoryBasis} placeholder="e.g. UK Organic Reg Art. 24" />
        </View>

        <Text style={styles.sectionTitle}>Justification *</Text>
        <Input value={justification} onChangeText={setJustification} placeholder="Why is no certified organic alternative commercially available? Include OFIS/UKOAS search reference if applicable." multiline numberOfLines={4} />

        <Text style={styles.sectionTitle}>Availability Search Evidence</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Search Date</Text>
            <Input value={availabilitySearchDate} onChangeText={setAvailabilitySearchDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Search Ref (OFIS/UKOAS)</Text>
            <Input value={availabilitySearchRef} onChangeText={setAvailabilitySearchRef} placeholder="e.g. UKOAS-2025-001" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Status</Text>
        <View style={styles.chips}>
          {STATUSES.map((s) => (
            <Chip key={s} label={s.charAt(0).toUpperCase() + s.slice(1)} selected={status === s}
              onPress={() => { Haptics.selectionAsync(); setStatus(s); }}
              chipColor={s === "approved" ? "#16a34a" : s === "refused" ? "#dc2626" : s === "withdrawn" ? "#6b7280" : CHIP_COLOR} />
          ))}
        </View>

        {isDecided && (
          <>
            <Text style={styles.sectionTitle}>Decision</Text>
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.label}>Decision Date</Text>
                <Input value={decisionDate} onChangeText={setDecisionDate} placeholder="YYYY-MM-DD" />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Internal Decision Date</Text>
                <Input value={internalDecisionDate} onChangeText={setInternalDecisionDate} placeholder="YYYY-MM-DD" />
              </View>
            </View>
            {!isRefused && (
              <>
                <View style={styles.row}>
                  <View style={[styles.field, { flex: 1 }]}>
                    <Text style={styles.label}>Expiry Date</Text>
                    <Input value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" />
                  </View>
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Approval Conditions</Text>
                  <Input value={approvalConditions} onChangeText={setApprovalConditions} placeholder="Any conditions attached to the approval…" multiline numberOfLines={3} />
                </View>
              </>
            )}
            {isRefused && (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Refusal Reason</Text>
                  <Input value={rejectionReason} onChangeText={setRejectionReason} placeholder="Reason given by the certifier for refusing the derogation…" multiline numberOfLines={3} />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Refusal Reference</Text>
                  <Input value={rejectionRef} onChangeText={setRejectionRef} placeholder="e.g. CB-REF-2025-007" />
                </View>
              </>
            )}
          </>
        )}

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Additional notes or correspondence log" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Derogation"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  infoBox: { flexDirection: "row", gap: spacing.xs, backgroundColor: "#ccfbf1", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, alignItems: "flex-start" },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#134e4a", flex: 1 },
  saveBtn: { marginTop: spacing.md },
});
