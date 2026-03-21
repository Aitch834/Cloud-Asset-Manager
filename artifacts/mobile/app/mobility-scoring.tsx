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

import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { STORAGE_KEYS, appendToList } from "@/lib/storage";
import type { DairyMobilityScoring } from "@/lib/types";

const MOBILITY_ACTIONS = [
  "No action required",
  "Foot bathing implemented",
  "Vet inspection arranged",
  "Individual cows foot-trimmed",
  "Cows removed from herd",
  "Diet / environment change",
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ScoreCard({
  score,
  label,
  description,
  value,
  onChange,
  accent,
}: {
  score: number;
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  accent: string;
}) {
  return (
    <View style={styles.scoreCard}>
      <View style={[styles.scoreCircle, { backgroundColor: accent }]}>
        <Text style={styles.scoreCircleText}>{score}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.scoreCardLabel}>{label}</Text>
        <Text style={styles.scoreCardDesc}>{description}</Text>
      </View>
      <Input
        placeholder="0"
        value={value}
        onChangeText={onChange}
        keyboardType="number-pad"
        style={styles.scoreInput}
      />
    </View>
  );
}

export default function MobilityScoringScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();

  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [assessedBy, setAssessedBy] = useState("");
  const [score0, setScore0] = useState("");
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [score3, setScore3] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [nextAssessmentDue, setNextAssessmentDue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const totalScored =
    (parseInt(score0, 10) || 0) +
    (parseInt(score1, 10) || 0) +
    (parseInt(score2, 10) || 0) +
    (parseInt(score3, 10) || 0);

  const lameCount = (parseInt(score2, 10) || 0) + (parseInt(score3, 10) || 0);
  const lamePct = totalScored > 0 ? Math.round((lameCount / totalScored) * 100) : null;

  const handleSave = async () => {
    if (totalScored === 0) {
      Alert.alert("Required", "Please enter counts for at least one mobility score.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: DairyMobilityScoring = {
      id: `mobility_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      farmId: currentFarm?.id?.toString() ?? "unknown",
      assessmentDate,
      assessedBy: assessedBy.trim(),
      totalCowsScored: totalScored,
      score0Count: parseInt(score0, 10) || 0,
      score1Count: parseInt(score1, 10) || 0,
      score2Count: parseInt(score2, 10) || 0,
      score3Count: parseInt(score3, 10) || 0,
      actionTaken: actionTaken.trim(),
      nextAssessmentDue: nextAssessmentDue.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.DAIRY_MOBILITY_SCORINGS, record);
      await refreshPendingCount();
      Alert.alert(
        "Mobility Scoring Saved",
        "The assessment has been saved and will sync when connected.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Save mobility scoring error:", err);
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
          <Text style={styles.headerTitle}>Mobility Scoring</Text>
          <Text style={styles.headerSub}>Herd-wide lameness assessment (AHDB 0–3)</Text>
        </View>
        <View style={styles.dairyBadge}>
          <Feather name="trending-up" size={14} color="#065f46" />
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
            Red Tractor requires regular mobility scoring. Target: fewer than 10% scoring 2 or 3.
            Score at least every 3 months as cows exit the milking parlour (AHDB method).
          </Text>
        </View>

        <Section title="Assessment Details">
          <Text style={styles.label}>Assessment Date</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={assessmentDate}
            onChangeText={setAssessmentDate}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.label}>Assessed By</Text>
          <Input placeholder="e.g. Tom Davies" value={assessedBy} onChangeText={setAssessedBy} />
        </Section>

        <Section title="Mobility Scores">
          <Text style={styles.sectionSub}>Enter the number of cows in each category</Text>
          <ScoreCard
            score={0}
            label="Normal"
            description="Walks freely with even weight bearing"
            value={score0}
            onChange={setScore0}
            accent="#16a34a"
          />
          <ScoreCard
            score={1}
            label="Imperfect"
            description="Walks freely but with slight unevenness"
            value={score1}
            onChange={setScore1}
            accent="#d97706"
          />
          <ScoreCard
            score={2}
            label="Lame"
            description="Clearly lame with uneven gait or reduced speed"
            value={score2}
            onChange={setScore2}
            accent="#ea580c"
          />
          <ScoreCard
            score={3}
            label="Severely Lame"
            description="Reluctant to bear weight; urgent care needed"
            value={score3}
            onChange={setScore3}
            accent="#dc2626"
          />
        </Section>

        {totalScored > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total scored</Text>
              <Text style={styles.summaryValue}>{totalScored}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Lame (score 2 + 3)</Text>
              <Text style={[styles.summaryValue, lameCount > 0 && { color: "#dc2626" }]}>{lameCount}</Text>
            </View>
            {lamePct !== null && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Lameness prevalence</Text>
                <View style={[styles.pctBadge, lamePct > 10 && styles.pctBadgeWarn]}>
                  <Text style={[styles.pctText, lamePct > 10 && { color: "#dc2626" }]}>
                    {lamePct}%{lamePct > 10 ? " ▲ >10% target" : " ✓"}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        <Section title="Action Taken">
          <View style={styles.chipRow}>
            {MOBILITY_ACTIONS.map((a) => (
              <Pressable
                key={a}
                style={[
                  styles.chip,
                  actionTaken === a && { backgroundColor: "#2563eb", borderColor: "#2563eb" },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setActionTaken(actionTaken === a ? "" : a);
                }}
              >
                <Text style={[styles.chipText, actionTaken === a && { color: "#fff" }]}>{a}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Next Assessment Due</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={nextAssessmentDue}
            onChangeText={setNextAssessmentDue}
            keyboardType="numbers-and-punctuation"
          />
        </Section>

        <Section title="Notes">
          <Input
            placeholder="Environmental concerns, individual cows noted, vet advice..."
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
          <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save Mobility Scoring"}</Text>
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
  sectionSub: {
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
  scoreCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  scoreCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreCircleText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.base,
    color: "#fff",
  },
  scoreCardLabel: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  scoreCardDesc: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  scoreInput: {
    width: 64,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  pctBadge: {
    backgroundColor: "#dcfce7",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  pctBadgeWarn: {
    backgroundColor: "#fee2e2",
  },
  pctText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.sm,
    color: "#16a34a",
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
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    backgroundColor: "#16a34a",
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
