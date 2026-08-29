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

import { DiseaseAlertBanner } from "@/components/ui/DiseaseAlertBanner";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useDiseaseAlert } from "@/lib/hooks/useDiseaseAlert";
import { useSync } from "@/lib/context/SyncContext";
import { STORAGE_KEYS, appendToList } from "@/lib/storage";
import type { DairyMobilityScoring, MobilityScoringAnimal } from "@/lib/types";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

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
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const dairyAlert = useDiseaseAlert("dairy");

  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [assessedBy, setAssessedBy] = useState(user?.name || "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);
  const [score0, setScore0] = useState("");
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [score3, setScore3] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [nextAssessmentDue, setNextAssessmentDue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const [animals, setAnimals] = useState<MobilityScoringAnimal[]>([]);
  const [pendingTag, setPendingTag] = useState("");
  const [pendingScore, setPendingScore] = useState<2 | 3>(3);
  const [pendingNotes, setPendingNotes] = useState("");

  const score2Count = parseInt(score2, 10) || 0;
  const score3Count = parseInt(score3, 10) || 0;
  const showAnimalSection = score2Count > 0 || score3Count > 0;

  function addAnimal() {
    const tag = pendingTag.trim();
    if (!tag) return;
    setAnimals(prev => [...prev, { animalTag: tag, scoreGrade: pendingScore, notes: pendingNotes.trim() || null }]);
    setPendingTag("");
    setPendingNotes("");
    Haptics.selectionAsync();
  }
  function removeAnimal(idx: number) {
    setAnimals(prev => prev.filter((_, i) => i !== idx));
    Haptics.selectionAsync();
  }

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
      animals,
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
          <Feather name="arrow-left" size={20} color={colors.text} />
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

      <DiseaseAlertBanner alert={dairyAlert} sector="Dairy" />

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
            maxDate="today"
          />
          <LookupPicker label="Assessed By" options={staffOptions} value={assessedBy} onSelect={(_id, l) => setAssessedBy(l)} allowFreeText />
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

        {showAnimalSection && (
          <View style={styles.animalSection}>
            <Text style={styles.animalSectionTitle}>Individual Animal Records</Text>
            <Text style={styles.animalSectionSub}>Record each Score 2 or 3 animal individually. Matched animals update their livestock record on sync.</Text>

            {animals.map((a, idx) => (
              <View key={idx} style={[styles.animalRow, a.scoreGrade === 3 ? styles.animalRowScore3 : styles.animalRowScore2]}>
                <View style={[styles.scoreBadge, a.scoreGrade === 3 ? styles.scoreBadge3 : styles.scoreBadge2]}>
                  <Text style={styles.scoreBadgeText}>{a.scoreGrade}</Text>
                </View>
                <Text style={styles.animalTag}>{a.animalTag}</Text>
                {a.notes ? <Text style={styles.animalNotes}>{a.notes}</Text> : null}
                <Pressable onPress={() => removeAnimal(idx)} style={styles.removeBtn}>
                  <Feather name="x" size={14} color="#9ca3af" />
                </Pressable>
              </View>
            ))}

            <View style={styles.addAnimalForm}>
              <View style={styles.addAnimalRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addAnimalLabel}>Ear tag number</Text>
                  <Input
                    value={pendingTag}
                    onChangeText={setPendingTag}
                    placeholder="e.g. UK123456 001234"
                  />
                </View>
                <View style={{ marginLeft: spacing.sm }}>
                  <Text style={styles.addAnimalLabel}>Score</Text>
                  <View style={styles.scorePicker}>
                    <Pressable
                      style={[styles.scorePickerBtn, pendingScore === 2 && styles.scorePickerBtn2Active]}
                      onPress={() => { setPendingScore(2); Haptics.selectionAsync(); }}
                    >
                      <Text style={[styles.scorePickerBtnText, pendingScore === 2 && { color: "#fff" }]}>2</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.scorePickerBtn, pendingScore === 3 && styles.scorePickerBtn3Active]}
                      onPress={() => { setPendingScore(3); Haptics.selectionAsync(); }}
                    >
                      <Text style={[styles.scorePickerBtnText, pendingScore === 3 && { color: "#fff" }]}>3</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
              <Input
                value={pendingNotes}
                onChangeText={setPendingNotes}
                placeholder="Notes, e.g. left rear (optional)"
              />
              <Pressable
                style={[styles.addAnimalBtn, !pendingTag.trim() && styles.addAnimalBtnDisabled]}
                onPress={addAnimal}
                disabled={!pendingTag.trim()}
              >
                <Feather name="plus" size={14} color="#fff" />
                <Text style={styles.addAnimalBtnText}>Add Animal</Text>
              </Pressable>
            </View>
          </View>
        )}

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
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
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
    fontFamily: fonts.semiBold,
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
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
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
    color: colors.text,
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
    fontSize: fontSize.md,
    color: "#fff",
  },
  scoreCardLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
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
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
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
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: "#fff",
  },
  animalSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  animalSectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  animalSectionSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  animalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  animalRowScore3: { borderColor: "#fca5a5", backgroundColor: "#fef2f2" },
  animalRowScore2: { borderColor: "#fcd34d", backgroundColor: "#fffbeb" },
  scoreBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  scoreBadge3: { backgroundColor: "#ef4444" },
  scoreBadge2: { backgroundColor: "#f59e0b" },
  scoreBadgeText: { fontFamily: fonts.bold, fontSize: fontSize.xs, color: "#fff" },
  animalTag: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  animalNotes: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, fontStyle: "italic" },
  removeBtn: { padding: spacing.xs },
  addAnimalForm: { gap: spacing.xs, marginTop: spacing.xs },
  addAnimalRow: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm },
  addAnimalLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.xs },
  scorePicker: { flexDirection: "row", gap: spacing.xs },
  scorePickerBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  scorePickerBtn2Active: { backgroundColor: "#f59e0b", borderColor: "#f59e0b" },
  scorePickerBtn3Active: { backgroundColor: "#ef4444", borderColor: "#ef4444" },
  scorePickerBtnText: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.text },
  addAnimalBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: "#2563eb",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  addAnimalBtnDisabled: { opacity: 0.4 },
  addAnimalBtnText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: "#fff" },
});
