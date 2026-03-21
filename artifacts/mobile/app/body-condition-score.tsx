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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { STORAGE_KEYS, appendToList } from "@/lib/storage";
import type { DairyBcsRecord } from "@/lib/types";

const BCS_SCORES = ["1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"];
const LIFE_STAGES = [
  "Pre-calving (>3 weeks)",
  "Early lactation (0–3 wks)",
  "Mid lactation",
  "Late lactation",
  "Dry period",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.borderLight, true: "#2563eb" }}
        thumbColor={"#fff"}
      />
    </View>
  );
}

function BcsHint({ score }: { score: string }) {
  const val = parseFloat(score);
  if (!val) return null;
  let note = "";
  let noteColor = colors.textSecondary;
  if (val <= 1.5) { note = "Emaciated — immediate attention required"; noteColor = "#dc2626"; }
  else if (val <= 2.0) { note = "Thin — review nutrition and feed allocation"; noteColor = "#ea580c"; }
  else if (val <= 2.5) { note = "Below target — monitor closely"; noteColor = "#d97706"; }
  else if (val <= 3.5) { note = "Ideal range — maintain current management"; noteColor = "#16a34a"; }
  else if (val <= 4.0) { note = "Over-conditioned — review diet"; noteColor = "#d97706"; }
  else { note = "Obese — high risk of metabolic disease"; noteColor = "#dc2626"; }

  return (
    <View style={[styles.bcsHint, { borderColor: noteColor + "40", backgroundColor: noteColor + "14" }]}>
      <Feather name="activity" size={13} color={noteColor} />
      <Text style={[styles.bcsHintText, { color: noteColor }]}>{note}</Text>
    </View>
  );
}

export default function BodyConditionScoreScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();

  const [cowEarTag, setCowEarTag] = useState("");
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [lifeStage, setLifeStage] = useState("");
  const [bcsScore, setBcsScore] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [assessedBy, setAssessedBy] = useState("");
  const [actionRequired, setActionRequired] = useState(false);
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!cowEarTag.trim()) {
      Alert.alert("Required", "Please enter the cow ear tag (or 'All herd' for a batch score).");
      return;
    }
    if (!bcsScore) {
      Alert.alert("Required", "Please select a BCS score.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: DairyBcsRecord = {
      id: `bcs_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      farmId: currentFarm?.id?.toString() ?? "unknown",
      cowEarTag: cowEarTag.trim(),
      assessmentDate,
      lifeStage,
      bcsScore,
      assessedBy: assessedBy.trim(),
      targetScore,
      actionRequired,
      actionTaken: actionTaken.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.DAIRY_BCS_RECORDS, record);
      await refreshPendingCount();
      Alert.alert(
        "BCS Record Saved",
        "Body condition score has been saved and will sync when connected.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Save BCS error:", err);
      Alert.alert("Save Failed", "Could not save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Body Condition Score</Text>
          <Text style={styles.headerSub}>Record BCS 1–5 per cow or group</Text>
        </View>
        <View style={styles.dairyBadge}>
          <Feather name="bar-chart-2" size={14} color="#065f46" />
          <Text style={styles.dairyBadgeText}>Dairy</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.complianceNote}>
          <Feather name="info" size={14} color="#1e40af" style={{ marginTop: 2 }} />
          <Text style={styles.complianceNoteText}>
            Score at drying off, calving, and mid-lactation. Target BCS at calving: 2.5–3.0. Records
            support Red Tractor welfare and health planning requirements.
          </Text>
        </View>

        <Section title="Cow / Group">
          <Text style={styles.label}>Cow Ear Tag or Group Name *</Text>
          <Input
            placeholder="e.g. UK123456 78901 or 'All herd'"
            value={cowEarTag}
            onChangeText={setCowEarTag}
            autoCapitalize="characters"
          />
          <Text style={styles.label}>Assessment Date</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={assessmentDate}
            onChangeText={setAssessmentDate}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.label}>Life Stage</Text>
          <View style={styles.chipRow}>
            {LIFE_STAGES.map((ls) => (
              <Pressable
                key={ls}
                style={[styles.chip, lifeStage === ls && { backgroundColor: "#7c3aed", borderColor: "#7c3aed" }]}
                onPress={() => { Haptics.selectionAsync(); setLifeStage(ls); }}
              >
                <Text style={[styles.chipText, lifeStage === ls && { color: "#fff" }]}>{ls}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="BCS Score *">
          <Text style={styles.scaleNote}>1 = Emaciated &nbsp;•&nbsp; 3 = Ideal &nbsp;•&nbsp; 5 = Obese</Text>
          <View style={styles.chipRow}>
            {BCS_SCORES.map((s) => (
              <Pressable
                key={s}
                style={[styles.chip, bcsScore === s && { backgroundColor: "#2563eb", borderColor: "#2563eb" }]}
                onPress={() => { Haptics.selectionAsync(); setBcsScore(s); }}
              >
                <Text style={[styles.chipText, bcsScore === s && { color: "#fff" }]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <BcsHint score={bcsScore} />
          <Text style={styles.label}>Target Score for This Stage</Text>
          <View style={styles.chipRow}>
            {BCS_SCORES.map((s) => (
              <Pressable
                key={s}
                style={[styles.chip, targetScore === s && { backgroundColor: "#16a34a", borderColor: "#16a34a" }]}
                onPress={() => { Haptics.selectionAsync(); setTargetScore(s); }}
              >
                <Text style={[styles.chipText, targetScore === s && { color: "#fff" }]}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Assessor">
          <Text style={styles.label}>Assessed By</Text>
          <Input placeholder="e.g. John Smith" value={assessedBy} onChangeText={setAssessedBy} />
        </Section>

        <Section title="Action">
          <ToggleRow label="Action required" value={actionRequired} onChange={setActionRequired} />
          {actionRequired && (
            <>
              <Text style={styles.label}>Action Taken / Planned</Text>
              <Input
                placeholder="e.g. Moved to high-energy diet, separated from herd"
                value={actionTaken}
                onChangeText={setActionTaken}
                multiline
                style={{ minHeight: 64 }}
              />
            </>
          )}
        </Section>

        <Section title="Notes">
          <Input
            placeholder="Any additional observations..."
            value={notes}
            onChangeText={setNotes}
            multiline
            style={{ minHeight: 80 }}
          />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Feather name="save" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save BCS Record"}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  headerSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  dairyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#d1fae5",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  dairyBadgeText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.xs,
    color: "#065f46",
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  complianceNote: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#eff6ff",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    marginBottom: spacing.sm,
  },
  complianceNoteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#1e40af",
    lineHeight: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  scaleNote: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  toggleLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  bcsHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.sm,
    padding: spacing.sm,
    borderWidth: 1,
    marginTop: spacing.sm,
  },
  bcsHintText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    flex: 1,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.base,
    color: "#fff",
  },
});
