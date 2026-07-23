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
  Switch,
  Text,
  TextInput,
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

const TEST_TYPES = [
  { key: "bulk_milk_elisa", label: "Bulk Milk ELISA" },
  { key: "individual_blood_elisa", label: "Individual Blood ELISA" },
  { key: "individual_milk_elisa", label: "Individual Milk ELISA" },
  { key: "faecal_pcr", label: "Faecal PCR" },
  { key: "pooled_faecal_pcr", label: "Pooled Faecal PCR" },
  { key: "post_mortem", label: "Post-mortem" },
];

const RISK_LEVELS = [
  { key: "1_very_low", label: "1 — Very Low" },
  { key: "2_low", label: "2 — Low" },
  { key: "3_moderate", label: "3 — Moderate" },
  { key: "4_high", label: "4 — High" },
];

const LAB_PRESETS = [
  "APHA Starcross",
  "APHA Weybridge",
  "APHA Lasswade (Scotland)",
  "SAC / SRUC Veterinary Services",
  "Biobest Laboratories",
  "Axiom Veterinary Laboratories",
  "Westgate Labs",
  "Quality Milk Laboratories",
  "Other (enter below)",
];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function SwitchRow({ label, value, onValueChange, hint }: { label: string; value: boolean; onValueChange: (v: boolean) => void; hint?: string }) {
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.switchHint}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderLight, true: "#15803d" }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function JohnesMonitoringScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [testDate, setTestDate] = useState(todayDate());
  const [testType, setTestType] = useState("bulk_milk_elisa");
  const [animalsTestedCount, setAnimalsTestedCount] = useState("");
  const [positiveAnimalsCount, setPositiveAnimalsCount] = useState("");
  const [bulkMilkOd, setBulkMilkOd] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [labSel, setLabSel] = useState("");
  const [labManual, setLabManual] = useState("");
  const [labRef, setLabRef] = useState("");
  const [vetName, setVetName] = useState("");
  const [jmmEnrolled, setJmmEnrolled] = useState(false);
  const [njmpSchemeRef, setNjmpSchemeRef] = useState("");
  const [njmpPlanDate, setNjmpPlanDate] = useState("");
  const [njmpColostrumMgmt, setNjmpColostrumMgmt] = useState(false);
  const [njmpPurchasedTesting, setNjmpPurchasedTesting] = useState(false);
  const [njmpBajvaAdvisor, setNjmpBajvaAdvisor] = useState("");
  const [njmpControlStrategy, setNjmpControlStrategy] = useState("");
  const [njmpRiskAssessmentDate, setNjmpRiskAssessmentDate] = useState("");
  const [njmpDeclarationDate, setNjmpDeclarationDate] = useState("");
  const [njmpDeclarationRecipient, setNjmpDeclarationRecipient] = useState("");
  const [vetSignOff, setVetSignOff] = useState(false);
  const [nextTestDue, setNextTestDue] = useState("");
  const [notes, setNotes] = useState("");

  const labName = labSel === "Other (enter below)" ? labManual : labSel;

  const handleSave = async () => {
    if (!testDate.trim()) {
      Alert.alert("Required", "Please enter the test date.");
      return;
    }
    if (!testType) {
      Alert.alert("Required", "Please select the test type.");
      return;
    }

    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "johnes-monitoring",
        testDate,
        testType,
        animalsTestedCount: animalsTestedCount ? Number(animalsTestedCount) : null,
        positiveAnimalsCount: positiveAnimalsCount ? Number(positiveAnimalsCount) : null,
        bulkMilkOd: bulkMilkOd ? Number(bulkMilkOd) : null,
        riskLevel: riskLevel || null,
        labName: labName || null,
        labRef: labRef || null,
        vetName: vetName || null,
        jmmEnrolled,
        njmpSchemeRef: jmmEnrolled ? (njmpSchemeRef || null) : null,
        njmpPlanDate: jmmEnrolled ? (njmpPlanDate || null) : null,
        njmpColostrumMgmt: jmmEnrolled ? njmpColostrumMgmt : false,
        njmpPurchasedTesting: jmmEnrolled ? njmpPurchasedTesting : false,
        njmpBajvaAdvisor: jmmEnrolled ? (njmpBajvaAdvisor || null) : null,
        njmpControlStrategy: jmmEnrolled ? (njmpControlStrategy || null) : null,
        njmpRiskAssessmentDate: jmmEnrolled ? (njmpRiskAssessmentDate || null) : null,
        njmpDeclarationDate: jmmEnrolled ? (njmpDeclarationDate || null) : null,
        njmpDeclarationRecipient: jmmEnrolled ? (njmpDeclarationRecipient || null) : null,
        vetSignOff,
        nextTestDue: nextTestDue || null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/johnes-monitoring`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };

      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "Johne's Test Recorded",
        "The monitoring record has been saved and will sync when connected.",
        [{ text: "Done", onPress: () => router.back() }]
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
        <Text style={styles.headerTitle}>Johne's Disease Monitoring</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.hint}>
          NJMP-enrolled herds require annual bulk milk ELISA testing. Record all test results here for full traceability and NJMP / JMM compliance reporting.
        </Text>

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

        <Text style={styles.sectionTitle}>Test Type *</Text>
        <View style={styles.chips}>
          {TEST_TYPES.map(t => (
            <Chip key={t.key} label={t.label} selected={testType === t.key} onPress={() => setTestType(t.key)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Results</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Animals Tested</Text>
            <Input value={animalsTestedCount} onChangeText={setAnimalsTestedCount} placeholder="e.g. 120" keyboardType="number-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Positive Animals</Text>
            <Input value={positiveAnimalsCount} onChangeText={setPositiveAnimalsCount} placeholder="e.g. 0" keyboardType="number-pad" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bulk Milk OD Value</Text>
          <Input value={bulkMilkOd} onChangeText={setBulkMilkOd} placeholder="Optical density reading" keyboardType="decimal-pad" />
        </View>

        <Text style={styles.sectionTitle}>Risk Level (NJMP 1–4 Scale)</Text>
        <View style={styles.chips}>
          {RISK_LEVELS.map(r => (
            <Chip key={r.key} label={r.label} selected={riskLevel === r.key} onPress={() => setRiskLevel(riskLevel === r.key ? "" : r.key)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Laboratory</Text>
        <View style={styles.chips}>
          {LAB_PRESETS.map(l => (
            <Chip key={l} label={l} selected={labSel === l} onPress={() => setLabSel(labSel === l ? "" : l)} />
          ))}
        </View>
        {labSel === "Other (enter below)" && (
          <View style={styles.field}>
            <Text style={styles.label}>Lab Name</Text>
            <Input value={labManual} onChangeText={setLabManual} placeholder="Enter laboratory name" />
          </View>
        )}
        <View style={styles.field}>
          <Text style={styles.label}>Lab Reference Number</Text>
          <Input value={labRef} onChangeText={setLabRef} placeholder="Lab submission reference" />
        </View>

        <Text style={styles.sectionTitle}>Vet & Compliance</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Attending Vet Name</Text>
          <Input value={vetName} onChangeText={setVetName} placeholder="e.g. Mr J Smith BVSc MRCVS" />
        </View>

        <SwitchRow
          label="NJMP / JMM Enrolled"
          value={jmmEnrolled}
          onValueChange={setJmmEnrolled}
          hint="Herd is enrolled in the National Johne's Management Plan / Johne's Management in Milk programme"
        />

        {jmmEnrolled && (
          <View style={styles.njmpPanel}>
            <Text style={styles.njmpTitle}>NJMP Details</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Scheme Reference Number</Text>
              <Input value={njmpSchemeRef} onChangeText={setNjmpSchemeRef} placeholder="e.g. AHDB-JMM-123456" />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Written Plan Last Reviewed (YYYY-MM-DD)</Text>
              <Input value={njmpPlanDate} onChangeText={setNjmpPlanDate} placeholder="YYYY-MM-DD" />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>BAJVA Advisor Name</Text>
              <Text style={styles.switchHint}>BCVA Accredited Johne's Veterinary Advisor — must be BAJVA-accredited</Text>
              <Input value={njmpBajvaAdvisor} onChangeText={setNjmpBajvaAdvisor} placeholder="e.g. Dr A Jones MRCVS — BAJVA accredited" />
            </View>

            <Text style={[styles.label, { marginBottom: 4 }]}>Control Strategy (NJMP approved)</Text>
            <View style={styles.chips}>
              {[
                { key: "s1_test_cull", label: "S1 — Test & cull high-risk" },
                { key: "s2_segregate", label: "S2 — Segregate high-risk cows" },
                { key: "s3_purchased_animals", label: "S3 — Purchased animal mgmt" },
                { key: "s4_calf_colostrum", label: "S4 — Calf & colostrum mgmt" },
                { key: "s5_slurry_pasture", label: "S5 — Slurry & pasture mgmt" },
                { key: "s6_bespoke", label: "S6 — Bespoke vet-led strategy" },
              ].map(s => (
                <Chip key={s.key} label={s.label} selected={njmpControlStrategy === s.key} onPress={() => setNjmpControlStrategy(njmpControlStrategy === s.key ? "" : s.key)} />
              ))}
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Annual Risk Assessment Date</Text>
                <Input value={njmpRiskAssessmentDate} onChangeText={setNjmpRiskAssessmentDate} placeholder="YYYY-MM-DD" />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Annual Declaration Date</Text>
                <Input value={njmpDeclarationDate} onChangeText={setNjmpDeclarationDate} placeholder="YYYY-MM-DD" />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Declaration Recipient (milk purchaser)</Text>
              <Input value={njmpDeclarationRecipient} onChangeText={setNjmpDeclarationRecipient} placeholder="e.g. Arla Foods UK, Müller Milk, First Milk…" />
            </View>

            <SwitchRow
              label="Colostrum Management Protocol Documented"
              value={njmpColostrumMgmt}
              onValueChange={setNjmpColostrumMgmt}
              hint="Protocol to reduce calf-to-calf Johne's transmission via colostrum is documented"
            />

            <SwitchRow
              label="Purchased Animal Testing Protocol in Place"
              value={njmpPurchasedTesting}
              onValueChange={setNjmpPurchasedTesting}
              hint="Testing/quarantine protocol for bought-in cattle is documented and followed"
            />
          </View>
        )}

        <SwitchRow
          label="Vet Sign-Off"
          value={vetSignOff}
          onValueChange={setVetSignOff}
          hint="Results reviewed and signed off by a veterinary surgeon"
        />

        <Text style={styles.sectionTitle}>Notes</Text>
        <View style={styles.field}>
          <Input value={notes} onChangeText={setNotes} placeholder="Any additional observations, actions taken, management changes" multiline numberOfLines={3} />
        </View>

        <Button
          title={saving ? "Saving…" : "Save Johne's Monitoring Record"}
          onPress={handleSave}
          disabled={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.xs },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    backgroundColor: colors.infoBg,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: "#1d4ed8", borderColor: "#1d4ed8" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  switchHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  njmpPanel: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  njmpTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#15803d",
    marginBottom: spacing.sm,
  },
  saveBtn: { marginTop: spacing.md },
});
