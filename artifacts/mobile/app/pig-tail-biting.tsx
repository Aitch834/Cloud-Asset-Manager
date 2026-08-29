import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { DiseaseAlertBanner } from "@/components/ui/DiseaseAlertBanner";
import { Input } from "@/components/ui/Input";
import { PigPenPicker } from "@/components/ui/PigPenPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useDiseaseAlert } from "@/lib/hooks/useDiseaseAlert";
import { useApiPigFlocks } from "@/lib/hooks/useApiPigFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PigTailBitingRisk } from "@/lib/types";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";

const RISK_LEVELS = [
  { key: "low", label: "Low Risk", color: colors.success },
  { key: "medium", label: "Medium Risk", color: colors.accent },
  { key: "high", label: "High Risk", color: colors.error },
  { key: "active", label: "Active Outbreak", color: "#7f1d1d" },
];

const BITING_LEVELS = ["None", "Mild — minor injury", "Moderate — treatment required", "Severe — immediate intervention needed"];
const MIXING_FREQS = ["Never", "Rarely", "Occasionally", "Weekly", "Frequently"];
const MONITORING_FREQS = ["Daily", "Twice daily", "Every 4 hours", "Continuous CCTV"];
const ENRICHMENTS = ["Straw", "Hay", "Rooting material", "Hanging chains", "Bite logs", "Paper / cardboard", "Silage", "Toys", "Multiple types"];

export default function PigTailBitingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const pigAlert = useDiseaseAlert("pig");
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPigFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState<number>(0);
  const [groupName, setGroupName] = useState("");
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [assessedBy, setAssessedBy] = useState(user?.name || "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);
  const [riskLevel, setRiskLevel] = useState("low");
  const [tailsDockedAtBirth, setTailsDockedAtBirth] = useState(false);
  const [tailLengthAdequate, setTailLengthAdequate] = useState(true);
  const [stockingDensityOk, setStockingDensityOk] = useState(true);
  const [enrichmentProvided, setEnrichmentProvided] = useState(true);
  const [selectedEnrichments, setSelectedEnrichments] = useState<string[]>([]);
  const [feedingSystemOk, setFeedingSystemOk] = useState(true);
  const [healthStatusOk, setHealthStatusOk] = useState(true);
  const [mixingFrequency, setMixingFrequency] = useState("Never");
  const [currentBiting, setCurrentBiting] = useState(false);
  const [bitingLevel, setBitingLevel] = useState("None");
  const [interventionsTaken, setInterventionsTaken] = useState("");
  const [monitoringFrequency, setMonitoringFrequency] = useState("Daily");
  const [reviewDate, setReviewDate] = useState("");
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const toggleEnrichment = (e: string) => {
    Haptics.selectionAsync();
    setSelectedEnrichments(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);
  };

  const handleSave = async () => {
    if (!assessedBy.trim()) { Alert.alert("Required", "Please enter who carried out the assessment."); return; }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PigTailBitingRisk = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockId,
      assessmentDate,
      assessedBy: assessedBy.trim(),
      riskLevel,
      tailsDockedAtBirth,
      tailLengthAdequate,
      stockingDensityOk,
      enrichmentProvided,
      enrichmentTypes: selectedEnrichments.join(", "),
      feedingSystemOk,
      healthStatusOk,
      mixingFrequency,
      currentBiting,
      bitingLevel: currentBiting ? bitingLevel : "None",
      interventionsTaken: interventionsTaken.trim(),
      monitoringFrequency,
      reviewDate: reviewDate.trim(),
      notes: notes.trim(),
      photoUri: photoUri || undefined,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PIG_TAIL_BITING_RISKS, record);
    await refreshPendingCount();
    setSaving(false);

    const isHighRisk = riskLevel === "high" || riskLevel === "active";
    Alert.alert(
      isHighRisk ? "⚠️ High-Risk Assessment Saved" : "Saved",
      isHighRisk
        ? "Tail biting risk assessment saved. Immediate corrective action is required. Ensure enrichment, stocking density and group stability are reviewed urgently."
        : "Tail biting risk assessment saved and queued for sync.",
      [{ text: "Done", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Tail Biting Risk</Text>
        <View style={{ width: 36 }} />
      </View>
      <DiseaseAlertBanner alert={pigAlert} sector="Pig" />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.infoBox}>
            <Feather name="info" size={14} color={colors.info} />
            <Text style={styles.infoText}>
              Red Tractor requires a written tail biting risk assessment. Tail docking is only permitted where a risk assessment demonstrates it is necessary — routine docking without assessment is prohibited under the Mutilations Regulations.
            </Text>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="grid" size={14} color="#db2777" />
            <Text style={styles.sectionTitle}>Group &amp; Assessor</Text>
          </View>
          <PigPenPicker label="Select Group (optional)" value={groupName} onChange={setGroupName} onChangeFlock={(f) => setFlockId(f.id)} flocks={flocks} loading={flocksLoading} fromCache={fromCache} error={flocksError} />
          <View style={styles.row}>
            <Input label="Assessment Date *" placeholder="YYYY-MM-DD" value={assessmentDate} onChangeText={setAssessmentDate} containerStyle={styles.flex} required />
            <View style={styles.flex}><LookupPicker label="Assessed By" options={staffOptions} value={assessedBy} onSelect={(_id, l) => setAssessedBy(l)} allowFreeText /></View>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="alert-triangle" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Overall Risk Level</Text>
          </View>
          <View style={styles.riskRow}>
            {RISK_LEVELS.map((r) => (
              <Pressable key={r.key} onPress={() => { Haptics.selectionAsync(); setRiskLevel(r.key); }} style={[styles.riskCard, riskLevel === r.key && { borderColor: r.color, backgroundColor: r.color + "18" }]}>
                <Text style={[styles.riskLabel, riskLevel === r.key && { color: r.color }]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="check-square" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Risk Factors</Text>
          </View>
          {[
            { label: "Tails docked at birth", value: tailsDockedAtBirth, onChange: setTailsDockedAtBirth, sub: "Docking should only be done where risk assessment justifies it" },
            { label: "Tail length adequate (undocked)", value: tailLengthAdequate, onChange: setTailLengthAdequate },
            { label: "Stocking density within limits", value: stockingDensityOk, onChange: setStockingDensityOk },
            { label: "Feeding system adequate (no competition)", value: feedingSystemOk, onChange: setFeedingSystemOk },
            { label: "Health status satisfactory", value: healthStatusOk, onChange: setHealthStatusOk },
          ].map(({ label, value, onChange, sub }) => (
            <View key={label} style={styles.toggleRow}>
              <View style={styles.toggleInfo}>
                <View style={styles.toggleTextBlock}>
                  <Text style={styles.toggleLabel}>{label}</Text>
                  {sub && <Text style={styles.toggleSub}>{sub}</Text>}
                </View>
              </View>
              <Switch value={value} onValueChange={(v) => { Haptics.selectionAsync(); onChange(v); }} trackColor={{ false: colors.border, true: colors.primaryMuted }} thumbColor={value ? colors.primary : colors.textTertiary} />
            </View>
          ))}

          <View style={styles.sectionLabel}>
            <Feather name="layers" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Environmental Enrichment</Text>
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Enrichment provided</Text>
            </View>
            <Switch value={enrichmentProvided} onValueChange={(v) => { Haptics.selectionAsync(); setEnrichmentProvided(v); }} trackColor={{ false: colors.border, true: colors.primaryMuted }} thumbColor={enrichmentProvided ? colors.primary : colors.textTertiary} />
          </View>
          {enrichmentProvided && (
            <>
              <Text style={styles.subLabel}>Select enrichment types (tick all that apply):</Text>
              <View style={styles.chipRow}>
                {ENRICHMENTS.map((e) => (
                  <Pressable key={e} onPress={() => toggleEnrichment(e)} style={[styles.chip, selectedEnrichments.includes(e) && styles.chipSelected]}>
                    <Text style={[styles.chipText, selectedEnrichments.includes(e) && styles.chipTextSelected]}>{e}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          <View style={styles.sectionLabel}>
            <Feather name="users" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Group Management</Text>
          </View>
          <Text style={styles.subLabel}>Mixing / regrouping frequency:</Text>
          <View style={styles.chipRow}>
            {MIXING_FREQS.map((m) => (
              <Pressable key={m} onPress={() => { Haptics.selectionAsync(); setMixingFrequency(m); }} style={[styles.chip, mixingFrequency === m && styles.chipSelected]}>
                <Text style={[styles.chipText, mixingFrequency === m && styles.chipTextSelected]}>{m}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="alert-octagon" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Current Biting Activity</Text>
          </View>
          <View style={[styles.toggleRow, currentBiting && styles.toggleRowDanger]}>
            <View style={styles.toggleInfo}>
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>Active tail biting currently observed</Text>
                <Text style={styles.toggleSub}>Any pigs showing tail wounds or biting behaviour right now</Text>
              </View>
            </View>
            <Switch value={currentBiting} onValueChange={(v) => { Haptics.selectionAsync(); setCurrentBiting(v); }} trackColor={{ false: colors.border, true: "#fee2e2" }} thumbColor={currentBiting ? colors.error : colors.textTertiary} />
          </View>
          {currentBiting && (
            <>
              <Text style={styles.subLabel}>Severity:</Text>
              <View style={styles.chipRow}>
                {BITING_LEVELS.filter(b => b !== "None").map((b) => (
                  <Pressable key={b} onPress={() => { Haptics.selectionAsync(); setBitingLevel(b); }} style={[styles.chip, bitingLevel === b && styles.chipError]}>
                    <Text style={[styles.chipText, bitingLevel === b && styles.chipTextSelected]}>{b}</Text>
                  </Pressable>
                ))}
              </View>
              <Input label="Interventions Already Taken" placeholder="e.g. Removed biters, added straw, sprayed wounds with Stockholm tar…" value={interventionsTaken} onChangeText={setInterventionsTaken} multiline numberOfLines={2} />
            </>
          )}

          <View style={styles.sectionLabel}>
            <Feather name="eye" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Monitoring &amp; Review</Text>
          </View>
          <Text style={styles.subLabel}>Monitoring frequency:</Text>
          <View style={styles.chipRow}>
            {MONITORING_FREQS.map((m) => (
              <Pressable key={m} onPress={() => { Haptics.selectionAsync(); setMonitoringFrequency(m); }} style={[styles.chip, monitoringFrequency === m && styles.chipSelected]}>
                <Text style={[styles.chipText, monitoringFrequency === m && styles.chipTextSelected]}>{m}</Text>
              </Pressable>
            ))}
          </View>
          <Input label="Next Review Date" placeholder="YYYY-MM-DD" value={reviewDate} onChangeText={setReviewDate} />

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input label="Additional Notes" placeholder="Any other observations or actions…" value={notes} onChangeText={setNotes} multiline numberOfLines={2} />

          <PhotoAttachButton
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            label="Attach Photo Evidence"
            promptTitle="Tail Biting Assessment Photo"
          />

          <Button title="Save Tail Biting Assessment" onPress={handleSave} loading={saving} fullWidth icon="check" />
          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.sm },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", gap: spacing.md },
  infoBox: { flexDirection: "row", gap: spacing.sm, backgroundColor: colors.infoBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: "flex-start" },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.info, flex: 1, lineHeight: 18 },
  riskRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  riskCard: { flex: 1, minWidth: "45%", padding: spacing.md, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center" },
  riskLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, textAlign: "center" },
  toggleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  toggleRowDanger: { borderColor: colors.error, backgroundColor: "#fff5f5" },
  toggleInfo: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, flex: 1 },
  toggleTextBlock: { flex: 1 },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  toggleSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  subLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipSelected: { backgroundColor: "#db2777", borderColor: "#db2777" },
  chipError: { backgroundColor: colors.error, borderColor: colors.error },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { color: colors.textInverse },
});
