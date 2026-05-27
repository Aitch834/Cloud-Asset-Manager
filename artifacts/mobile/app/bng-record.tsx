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
import type { BngRecord } from "@/lib/types";

const RECORD_TYPES = [
  { v: "baseline",          l: "Baseline",          color: "#0369a1", icon: "map" },
  { v: "post-creation",     l: "Post-creation",     color: "#16a34a", icon: "check-circle" },
  { v: "annual-monitoring", l: "Annual Monitoring",  color: "#d97706", icon: "refresh-cw" },
  { v: "final-assessment",  l: "Final Assessment",  color: "#7c3aed", icon: "award" },
];

const ASSESSOR_TYPES = [
  "Internal staff",
  "Agri-environment advisor",
  "Independent ecologist",
  "CIEEM member ecologist",
];

const HABITATS = [
  "Arable Field Margins", "Deciduous Woodland", "Hedgerow",
  "Grassland (neutral)", "Grassland (calcareous)", "Grassland (acid)",
  "Heathland", "Bog / Mire", "Fen", "Wetland / Reed Bed",
  "Pond / Lake", "River / Stream", "Wildflower Meadow", "Woodland Edge", "Other",
];

const CONDITIONS = ["Distinctly sub-optimal", "Moderate", "Fairly good", "Good", "Excellent"];

const COMPLIANCE_STATUSES = [
  "On track",
  "Shortfall identified",
  "Remedial action in progress",
  "In breach",
];

const LEGAL_TYPES = [
  "Section 106", "Conservation Covenant", "Management Agreement",
  "Habitat Bank Agreement", "Planning Condition", "Other",
];

export default function BngRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [recordType, setRecordType] = useState("baseline");
  const [assessmentDate, setAssessmentDate] = useState("");
  const [habitatType, setHabitatType] = useState("");
  const [areaHa, setAreaHa] = useState("");
  const [assessorType, setAssessorType] = useState("");
  const [assessorName, setAssessorName] = useState("");
  const [assessmentTool, setAssessmentTool] = useState("Defra Metric 4.0");
  const [baselineCondition, setBaselineCondition] = useState("");
  const [targetCondition, setTargetCondition] = useState("");
  const [achievedCondition, setAchievedCondition] = useState("");
  const [baselineUnits, setBaselineUnits] = useState("");
  const [targetUnits, setTargetUnits] = useState("");
  const [achievedUnits, setAchievedUnits] = useState("");
  const [netGainUnits, setNetGainUnits] = useState("");
  const [complianceStatus, setComplianceStatus] = useState("");
  const [legalAgreementType, setLegalAgreementType] = useState("");
  const [planningReference, setPlanningReference] = useState("");
  const [notes, setNotes] = useState("");

  const isMonitoring = recordType !== "baseline";
  const isLegal = !!(legalAgreementType || planningReference);

  const recTypeDef = RECORD_TYPES.find(r => r.v === recordType)!;

  const calcNetGain = () => {
    const bl = parseFloat(baselineUnits);
    if (isNaN(bl)) return;
    const comp = isMonitoring ? parseFloat(achievedUnits) : parseFloat(targetUnits);
    if (!isNaN(comp)) setNetGainUnits((comp - bl).toFixed(3));
  };

  const handleSave = async () => {
    if (!habitatType) { Alert.alert("Required", "Please select a habitat type."); return; }
    if (!assessmentDate.trim()) { Alert.alert("Required", "Please enter the assessment date."); return; }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const record: BngRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      recordType,
      assessmentDate: assessmentDate.trim(),
      habitatType,
      areaHa: areaHa.trim(),
      assessorType,
      assessorName: assessorName.trim(),
      assessmentTool,
      baselineCondition,
      targetCondition,
      achievedCondition,
      baselineUnits: baselineUnits.trim(),
      targetUnits: targetUnits.trim(),
      achievedUnits: achievedUnits.trim(),
      netGainUnits: netGainUnits.trim(),
      complianceStatus,
      legalAgreementType,
      planningReference: planningReference.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };
    await appendToList(STORAGE_KEYS.BNG_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "BNG record saved and queued for sync.", [
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
            <Text style={styles.title}>Biodiversity Net Gain (BNG)</Text>
            <Text style={styles.subtitle}>Defra Metric 4.0 · Habitat assessment & monitoring</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* ── Record type ── */}
          <Text style={styles.sectionTitle}>Record Type *</Text>
          <View style={styles.typeGrid}>
            {RECORD_TYPES.map(rt => (
              <Pressable
                key={rt.v}
                onPress={() => setRecordType(rt.v)}
                style={[styles.typeCard, recordType === rt.v && { borderColor: rt.color, backgroundColor: rt.color + "15" }]}
              >
                <Feather name={rt.icon as any} size={18} color={recordType === rt.v ? rt.color : colors.textSecondary} />
                <Text style={[styles.typeLabel, recordType === rt.v && { color: rt.color, fontFamily: fonts.semiBold }]}>{rt.l}</Text>
              </Pressable>
            ))}
          </View>

          <View style={[styles.infoBanner, { borderColor: recTypeDef.color + "40", backgroundColor: recTypeDef.color + "10" }]}>
            <Feather name="info" size={13} color={recTypeDef.color} />
            <Text style={[styles.infoText, { color: recTypeDef.color }]}>
              {recordType === "baseline" && "Record the pre-intervention habitat condition and biodiversity unit values from Defra Metric 4.0."}
              {recordType === "post-creation" && "Record habitat condition immediately after creation or intervention works."}
              {recordType === "annual-monitoring" && "Annual check on habitat condition and achieved biodiversity units vs baseline."}
              {recordType === "final-assessment" && "End-of-agreement final condition and net gain calculation."}
            </Text>
          </View>

          {/* ── Assessment details ── */}
          <Input label="Assessment Date *" value={assessmentDate} onChangeText={setAssessmentDate} placeholder="DD/MM/YYYY" />

          <Text style={styles.sectionTitle}>Habitat Type *</Text>
          <View style={styles.chipRow}>
            {HABITATS.map(h => (
              <Pressable key={h} onPress={() => setHabitatType(h)} style={[styles.chip, habitatType === h && styles.chipActive]}>
                <Text style={[styles.chipText, habitatType === h && styles.chipTextActive]}>{h}</Text>
              </Pressable>
            ))}
          </View>

          <Input label="Area (ha)" value={areaHa} onChangeText={setAreaHa} keyboardType="decimal-pad" placeholder="0.000" />

          {/* ── Assessor ── */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Assessor</Text>

          <Text style={styles.fieldLabel}>Assessor Type</Text>
          <View style={styles.chipRow}>
            {ASSESSOR_TYPES.map(t => (
              <Pressable key={t} onPress={() => setAssessorType(t)} style={[styles.chip, assessorType === t && styles.chipActive]}>
                <Text style={[styles.chipText, assessorType === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          {assessorType === "Internal staff" && (
            <View style={styles.warningBanner}>
              <Feather name="alert-triangle" size={13} color="#d97706" />
              <Text style={styles.warningText}>Internal staff assessments may not be accepted for legal BNG obligations (S106, planning conditions). An independent ecologist is recommended.</Text>
            </View>
          )}

          <Input label="Assessor Name" value={assessorName} onChangeText={setAssessorName} placeholder="Full name" />
          <Input label="Assessment Tool" value={assessmentTool} onChangeText={setAssessmentTool} placeholder="e.g. Defra Metric 4.0" />

          {/* ── Conditions ── */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Habitat Condition</Text>

          <Text style={styles.fieldLabel}>Baseline Condition *</Text>
          <View style={styles.chipRow}>
            {CONDITIONS.map(c => (
              <Pressable key={c} onPress={() => setBaselineCondition(c)} style={[styles.chip, baselineCondition === c && styles.chipActive]}>
                <Text style={[styles.chipText, baselineCondition === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>{isMonitoring ? "Target Condition" : "Target Condition (post-intervention)"}</Text>
          <View style={styles.chipRow}>
            {CONDITIONS.map(c => (
              <Pressable key={c} onPress={() => setTargetCondition(c)} style={[styles.chip, targetCondition === c && styles.chipActive]}>
                <Text style={[styles.chipText, targetCondition === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          {isMonitoring && (
            <>
              <Text style={styles.fieldLabel}>Achieved Condition</Text>
              <View style={styles.chipRow}>
                {CONDITIONS.map(c => (
                  <Pressable key={c} onPress={() => setAchievedCondition(c)} style={[styles.chip, achievedCondition === c && styles.chipActive]}>
                    <Text style={[styles.chipText, achievedCondition === c && styles.chipTextActive]}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* ── Biodiversity units ── */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Biodiversity Units (Defra Metric 4.0)</Text>
          <View style={styles.unitsGrid}>
            <View style={styles.unitCell}>
              <Input label="Baseline Units" value={baselineUnits} onChangeText={setBaselineUnits} onBlur={calcNetGain} keyboardType="decimal-pad" placeholder="0.000" />
            </View>
            <View style={styles.unitCell}>
              <Input label={isMonitoring ? "Achieved Units" : "Target Units"} value={isMonitoring ? achievedUnits : targetUnits} onChangeText={isMonitoring ? setAchievedUnits : setTargetUnits} onBlur={calcNetGain} keyboardType="decimal-pad" placeholder="0.000" />
            </View>
            <View style={styles.unitCell}>
              <Input label="Net Gain Units" value={netGainUnits} onChangeText={setNetGainUnits} keyboardType="decimal-pad" placeholder="auto" />
            </View>
          </View>
          <View style={styles.calcHint}>
            <Feather name="info" size={12} color={colors.textSecondary} />
            <Text style={styles.calcHintText}>Net gain = {isMonitoring ? "achieved" : "target"} units − baseline units. Tap outside to auto-calculate.</Text>
          </View>

          {/* ── Compliance & legal ── */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Compliance Status</Text>
          <View style={styles.chipRow}>
            {COMPLIANCE_STATUSES.map(s => {
              const color = s === "In breach" ? "#dc2626" : s === "Remedial action in progress" ? "#d97706" : s === "Shortfall identified" ? "#f59e0b" : "#16a34a";
              return (
                <Pressable key={s} onPress={() => setComplianceStatus(s)} style={[styles.chip, complianceStatus === s && { borderColor: color, backgroundColor: color + "15" }]}>
                  <Text style={[styles.chipText, complianceStatus === s && { color, fontFamily: fonts.semiBold }]}>{s}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.fieldLabel}>Legal Agreement Type</Text>
          <View style={styles.chipRow}>
            {LEGAL_TYPES.map(t => (
              <Pressable key={t} onPress={() => setLegalAgreementType(t === legalAgreementType ? "" : t)} style={[styles.chip, legalAgreementType === t && styles.chipActive]}>
                <Text style={[styles.chipText, legalAgreementType === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Input label="Planning / Agreement Reference" value={planningReference} onChangeText={setPlanningReference} placeholder="e.g. 24/00123/FUL" />

          {/* ── Notes ── */}
          <View style={styles.divider} />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Monitoring observations, remedial action details…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save BNG Record"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm },
  fieldLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  typeCard: { width: "48%", flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  typeLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  infoText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm, lineHeight: 20 },
  warningBanner: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: "#fffbeb", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: "#fde68a" },
  warningText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#92400e", lineHeight: 19 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.xs },
  unitsGrid: { flexDirection: "row", gap: spacing.sm },
  unitCell: { flex: 1 },
  calcHint: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  calcHintText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, flex: 1 },
  saveButton: { marginTop: spacing.lg },
});
