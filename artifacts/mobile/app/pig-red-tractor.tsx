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
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { DiseaseAlertBanner } from "@/components/ui/DiseaseAlertBanner";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useDiseaseAlert } from "@/lib/hooks/useDiseaseAlert";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PigRedTractorChecklist } from "@/lib/types";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

interface CheckItem {
  key: keyof PigRedTractorChecklist;
  label: string;
  sublabel: string;
  category: string;
}

const CHECKLIST: CheckItem[] = [
  {
    key: "animalWelfarePlan",
    label: "Animal Welfare Plan",
    sublabel: "Written plan in place, reviewed within the last 12 months and available for inspection",
    category: "Documentation",
  },
  {
    key: "medicineRecordsCompliant",
    label: "Medicine Records Compliant",
    sublabel: "All veterinary medicines recorded within 72 hours — batch number, dose, withdrawal, operator",
    category: "Documentation",
  },
  {
    key: "feedRecordsComplete",
    label: "Feed Records Complete",
    sublabel: "Feed deliveries, batch numbers, and supplier details recorded and traceable",
    category: "Documentation",
  },
  {
    key: "movementRecordsComplete",
    label: "Movement Records Complete",
    sublabel: "eAML2 / APHA movement documents complete for all on-farm and off-farm movements",
    category: "Documentation",
  },
  {
    key: "biosecurityPlanCurrent",
    label: "Biosecurity Plan Current",
    sublabel: "Written biosecurity plan reviewed in the last 12 months with visitor protocols documented",
    category: "Documentation",
  },
  {
    key: "vetHealthPlanCurrent",
    label: "Vet Health Plan Current",
    sublabel: "Annual vet health plan signed off by a veterinary surgeon in the last 12 months",
    category: "Documentation",
  },
  {
    key: "zoonosisRiskCurrent",
    label: "Zoonosis Risk Assessment Current",
    sublabel: "Written zoonosis risk assessment reviewed and up to date",
    category: "Documentation",
  },
  {
    key: "staffTrainingCurrent",
    label: "Staff Training Records Current",
    sublabel: "All staff have documented training for their role; competency assessed and recorded",
    category: "Documentation",
  },
  {
    key: "haccp",
    label: "HACCP / QA Records",
    sublabel: "HACCP or quality assurance procedures documented, monitored and records maintained",
    category: "Documentation",
  },
  {
    key: "tailBitingRiskAssessment",
    label: "Tail-Biting Risk Assessment",
    sublabel: "Written tail-biting risk assessment completed and reviewed; corrective actions in place",
    category: "Welfare",
  },
  {
    key: "enrichmentProvided",
    label: "Environmental Enrichment Provided",
    sublabel: "Manipulable materials provided to all pigs at all times (chains, ropes, wood, straw etc.)",
    category: "Welfare",
  },
  {
    key: "spaceAllowanceCompliant",
    label: "Space Allowance Compliant",
    sublabel: "Stocking density meets legal minimums for all weight categories and pen types",
    category: "Welfare",
  },
  {
    key: "beddingAdequate",
    label: "Bedding / Lying Area Adequate",
    sublabel: "All pigs have access to adequate, clean and dry lying area at all times",
    category: "Welfare",
  },
  {
    key: "farrowingFacilitiesCompliant",
    label: "Farrowing Facilities Compliant",
    sublabel: "Farrowing crates or free-farrowing systems meet Red Tractor and legal standards (if applicable)",
    category: "Welfare",
  },
  {
    key: "weanerCareDocumented",
    label: "Weaner Care Protocol Documented",
    sublabel: "Written care protocol for newly weaned pigs in place and followed",
    category: "Welfare",
  },
  {
    key: "mortalityRecordsComplete",
    label: "Mortality Records Complete",
    sublabel: "All deaths recorded with cause, disposal method, and knacker/rendering documentation",
    category: "Health",
  },
  {
    key: "waterQualityTested",
    label: "Water Quality Tested",
    sublabel: "Annual water quality test results on file; results within acceptable limits",
    category: "Health",
  },
  {
    key: "ventilationWorking",
    label: "Ventilation System Working",
    sublabel: "Ventilation checked and performing correctly; alarm systems tested",
    category: "Facilities",
  },
  {
    key: "temperatureMonitoring",
    label: "Temperature Monitoring",
    sublabel: "Temperature monitoring in place and records maintained; alarms set and tested",
    category: "Facilities",
  },
];

const CATEGORIES = ["Documentation", "Welfare", "Health", "Facilities"];

export default function PigRedTractorScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const pigAlert = useDiseaseAlert("pig");
  const [saving, setSaving] = useState(false);

  const [assessedBy, setAssessedBy] = useState(user?.name || "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);
  const [notes, setNotes] = useState("");
  const [nonConformances, setNonConformances] = useState("");

  const [checks, setChecks] = useState<Record<string, boolean>>(
    Object.fromEntries(CHECKLIST.map((item) => [item.key as string, false]))
  );

  const completedCount = Object.values(checks).filter(Boolean).length;
  const totalCount = CHECKLIST.length;
  const ncCount = totalCount - completedCount;

  const toggleCheck = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecks((c) => ({ ...c, [key]: !c[key] }));
  };

  const handleSave = async () => {
    if (!assessedBy.trim()) {
      Alert.alert("Required", "Please enter who completed this assessment.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PigRedTractorChecklist = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      assessmentDate: new Date().toISOString(),
      assessedBy: assessedBy.trim(),
      animalWelfarePlan: !!checks["animalWelfarePlan"],
      medicineRecordsCompliant: !!checks["medicineRecordsCompliant"],
      feedRecordsComplete: !!checks["feedRecordsComplete"],
      movementRecordsComplete: !!checks["movementRecordsComplete"],
      biosecurityPlanCurrent: !!checks["biosecurityPlanCurrent"],
      tailBitingRiskAssessment: !!checks["tailBitingRiskAssessment"],
      enrichmentProvided: !!checks["enrichmentProvided"],
      spaceAllowanceCompliant: !!checks["spaceAllowanceCompliant"],
      mortalityRecordsComplete: !!checks["mortalityRecordsComplete"],
      waterQualityTested: !!checks["waterQualityTested"],
      ventilationWorking: !!checks["ventilationWorking"],
      temperatureMonitoring: !!checks["temperatureMonitoring"],
      beddingAdequate: !!checks["beddingAdequate"],
      farrowingFacilitiesCompliant: !!checks["farrowingFacilitiesCompliant"],
      weanerCareDocumented: !!checks["weanerCareDocumented"],
      vetHealthPlanCurrent: !!checks["vetHealthPlanCurrent"],
      zoonosisRiskCurrent: !!checks["zoonosisRiskCurrent"],
      staffTrainingCurrent: !!checks["staffTrainingCurrent"],
      haccp: !!checks["haccp"],
      notes: notes.trim(),
      nonConformances: nonConformances.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PIG_RED_TRACTOR_CHECKLISTS, record);
    await refreshPendingCount();
    setSaving(false);

    const summary = ncCount > 0
      ? `Assessment saved with ${completedCount} compliant and ${ncCount} non-compliant item${ncCount > 1 ? "s" : ""}. Please document non-conformances and corrective actions.`
      : `All ${totalCount} Red Tractor requirements met. Assessment saved.`;

    Alert.alert(ncCount > 0 ? "Saved with Non-Conformances" : "Fully Compliant", summary, [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Pig Red Tractor Checklist</Text>
        <View style={{ width: 36 }} />
      </View>
      <DiseaseAlertBanner alert={pigAlert} sector="Pig" />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedCount / totalCount) * 100}%` }]} />
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>{completedCount}/{totalCount} compliant</Text>
            {ncCount > 0 && (
              <Text style={styles.ncLabel}>{ncCount} non-conformance{ncCount > 1 ? "s" : ""}</Text>
            )}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="user" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Assessed By</Text>
          </View>
          <LookupPicker label="Assessor Name" options={staffOptions} value={assessedBy} onSelect={(_id, l) => setAssessedBy(l)} allowFreeText />

          {CATEGORIES.map((category) => {
            const items = CHECKLIST.filter((item) => item.category === category);
            return (
              <View key={category}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{category}</Text>
                </View>
                {items.map((item) => {
                  const done = !!checks[item.key as string];
                  return (
                    <Pressable
                      key={item.key as string}
                      onPress={() => toggleCheck(item.key as string)}
                      style={[styles.checkRow, done ? styles.checkRowDone : styles.checkRowFail]}
                    >
                      <View style={[styles.checkbox, done ? styles.checkboxDone : styles.checkboxFail]}>
                        {done
                          ? <Feather name="check" size={14} color={colors.textInverse} />
                          : <Feather name="x" size={14} color={colors.textInverse} />}
                      </View>
                      <View style={styles.checkText}>
                        <Text style={[styles.checkLabel, done ? styles.checkLabelDone : styles.checkLabelFail]}>
                          {item.label}
                        </Text>
                        <Text style={styles.checkSub}>{item.sublabel}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            );
          })}

          {ncCount > 0 && (
            <>
              <View style={styles.sectionLabel}>
                <Feather name="alert-triangle" size={14} color={colors.error} />
                <Text style={styles.sectionTitle}>Non-Conformances</Text>
              </View>
              <Input
                label="Non-Conformance Details & Corrective Actions"
                placeholder="Describe any non-conformances found and the corrective actions planned or taken..."
                value={nonConformances}
                onChangeText={setNonConformances}
                multiline
                numberOfLines={4}
              />
            </>
          )}

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input
            label="Additional Notes"
            placeholder="Any general observations or comments..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Red Tractor Assessment"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.xs,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: 3,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  progressLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  ncLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.error,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryHeader: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  categoryTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#db2777",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  checkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  checkRowDone: {
    borderColor: colors.success,
    backgroundColor: "#f0fdf4",
  },
  checkRowFail: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: colors.success,
  },
  checkboxFail: {
    backgroundColor: colors.borderLight,
  },
  checkText: { flex: 1 },
  checkLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
  },
  checkLabelDone: { color: colors.success },
  checkLabelFail: { color: colors.text },
  checkSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
});
