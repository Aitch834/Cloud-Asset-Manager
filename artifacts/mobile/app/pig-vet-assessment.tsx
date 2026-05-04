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
import { PigPenPicker } from "@/components/ui/PigPenPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiPigFlocks } from "@/lib/hooks/useApiPigFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PigVetAssessment } from "@/lib/types";

const HEALTH_RATINGS = ["Good", "Satisfactory", "Moderate concern", "Poor", "N/A"];
const BCS_OPTIONS = ["1 — Emaciated", "2 — Thin", "3 — Ideal", "4 — Fat", "5 — Obese"];

function RatingPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {HEALTH_RATINGS.map((r) => {
          const color = r === "Good" ? colors.success : r === "Satisfactory" ? colors.primary : r === "Moderate concern" ? colors.accent : r === "Poor" ? colors.error : colors.border;
          const selected = value === r;
          return (
            <Pressable key={r} onPress={() => { Haptics.selectionAsync(); onChange(r); }} style={[ratingStyles.chip, selected && { backgroundColor: color, borderColor: color }]}>
              <Text style={[ratingStyles.chipText, selected && ratingStyles.chipTextSelected]}>{r}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const ratingStyles = StyleSheet.create({
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { color: colors.textInverse },
});

export default function PigVetAssessmentScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPigFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState<number>(0);
  const [groupName, setGroupName] = useState("");
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [vetName, setVetName] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [bodyConditionScore, setBodyConditionScore] = useState("");
  const [lameness, setLameness] = useState("");
  const [respiratoryHealth, setRespiratoryHealth] = useState("");
  const [skinCondition, setSkinCondition] = useState("");
  const [tailBiting, setTailBiting] = useState("");
  const [mortalityRate, setMortalityRate] = useState("");
  const [findings, setFindings] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [nextReviewDate, setNextReviewDate] = useState("");

  const handleSave = async () => {
    if (!vetName.trim()) { Alert.alert("Required", "Please enter the vet name."); return; }
    if (!findings.trim()) { Alert.alert("Required", "Please enter the vet's findings."); return; }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PigVetAssessment = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockId,
      assessmentDate,
      vetName: vetName.trim(),
      practiceName: practiceName.trim(),
      bodyConditionScore,
      lameness,
      respiratoryHealth,
      skinCondition,
      tailBiting,
      mortalityRate: mortalityRate.trim(),
      findings: findings.trim(),
      recommendations: recommendations.trim(),
      nextReviewDate: nextReviewDate.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PIG_VET_ASSESSMENTS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", `Vet assessment saved. ${nextReviewDate ? `Next review: ${nextReviewDate}` : ""}`, [
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Vet Health Assessment</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.sectionLabel}>
            <Feather name="grid" size={14} color="#db2777" />
            <Text style={styles.sectionTitle}>Group &amp; Date</Text>
          </View>
          <PigPenPicker label="Select Group (optional)" value={groupName} onChange={setGroupName} onChangeFlock={(f) => setFlockId(f.id)} flocks={flocks} loading={flocksLoading} fromCache={fromCache} error={flocksError} />
          <Input label="Assessment Date *" placeholder="YYYY-MM-DD" maxDate="today" value={assessmentDate} onChangeText={setAssessmentDate} required />

          <View style={styles.sectionLabel}>
            <Feather name="user" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Veterinarian</Text>
          </View>
          <Input label="Vet Name *" placeholder="e.g. Dr. Sarah Jones" value={vetName} onChangeText={setVetName} required />
          <Input label="Practice Name" placeholder="e.g. County Vets Ltd" value={practiceName} onChangeText={setPracticeName} />

          <View style={styles.sectionLabel}>
            <Feather name="activity" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Health Observations</Text>
          </View>

          <Text style={styles.subHeading}>Body Condition Score</Text>
          <View style={styles.chipRow}>
            {BCS_OPTIONS.map((b) => (
              <Pressable key={b} onPress={() => { Haptics.selectionAsync(); setBodyConditionScore(b); }} style={[styles.chip, bodyConditionScore === b && styles.chipSelected]}>
                <Text style={[styles.chipText, bodyConditionScore === b && styles.chipTextSelected]}>{b}</Text>
              </Pressable>
            ))}
          </View>

          <RatingPicker label="Lameness" value={lameness} onChange={setLameness} />
          <RatingPicker label="Respiratory Health" value={respiratoryHealth} onChange={setRespiratoryHealth} />
          <RatingPicker label="Skin Condition" value={skinCondition} onChange={setSkinCondition} />
          <RatingPicker label="Tail Biting Prevalence" value={tailBiting} onChange={setTailBiting} />

          <Input label="Mortality Rate (%)" placeholder="e.g. 1.2" value={mortalityRate} onChangeText={setMortalityRate} keyboardType="decimal-pad" />

          <View style={styles.sectionLabel}>
            <Feather name="clipboard" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Findings &amp; Recommendations</Text>
          </View>
          <Input label="Vet Findings *" placeholder="Clinical findings, disease conditions observed…" value={findings} onChangeText={setFindings} multiline numberOfLines={3} required />
          <Input label="Recommendations" placeholder="Actions required, treatment changes, management improvements…" value={recommendations} onChangeText={setRecommendations} multiline numberOfLines={3} />

          <View style={styles.sectionLabel}>
            <Feather name="calendar" size={14} color="#db2777" />
            <Text style={styles.sectionTitle}>Follow-Up</Text>
          </View>
          <Input label="Next Review Date" placeholder="YYYY-MM-DD" minDate="today" value={nextReviewDate} onChangeText={setNextReviewDate} />

          <Button title="Save Vet Assessment" onPress={handleSave} loading={saving} fullWidth icon="check" />
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
  subHeading: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipSelected: { backgroundColor: "#db2777", borderColor: "#db2777" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { color: colors.textInverse },
});
