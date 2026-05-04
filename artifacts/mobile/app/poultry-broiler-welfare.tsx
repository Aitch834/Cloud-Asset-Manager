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
import { FlockPicker } from "@/components/ui/FlockPicker";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiPoultryFlocks } from "@/lib/hooks/useApiPoultryFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PoultryBroilerWelfare } from "@/lib/types";

const SCORES_03 = ["0", "1", "2", "3"];
const GAIT_SCORES = ["0 — Normal", "1 — Slight", "2 — Moderate", "3 — Severe"];
const OUTCOMES: { key: string; label: string; color: string }[] = [
  { key: "Pass", label: "Pass", color: colors.success },
  { key: "Pass with advisory", label: "Pass with Advisory", color: colors.accent },
  { key: "Fail", label: "Fail", color: colors.error },
];

function ScorePicker({ label, value, onChange, scores }: { label: string; value: string; onChange: (v: string) => void; scores: string[] }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={{ fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs }}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {scores.map((s) => (
          <Pressable
            key={s}
            onPress={() => { Haptics.selectionAsync(); onChange(s); }}
            style={[scoreStyles.chip, value === s && scoreStyles.chipSelected]}
          >
            <Text style={[scoreStyles.chipText, value === s && scoreStyles.chipTextSelected]}>{s}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipSelected: { backgroundColor: "#d97706", borderColor: "#d97706" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { color: colors.textInverse },
});

export default function PoultryBroilerWelfareScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPoultryFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState<number>(0);
  const [flockNumber, setFlockNumber] = useState("");
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [assessedBy, setAssessedBy] = useState(user?.name || "");
  const [ageAtAssessmentDays, setAgeAtAssessmentDays] = useState("");
  const [sampleSize, setSampleSize] = useState("");
  const [footpadDermatitisScore, setFootpadDermatitisScore] = useState("");
  const [footpadDermatitisPercent, setFootpadDermatitisPercent] = useState("");
  const [hockBurnScore, setHockBurnScore] = useState("");
  const [hockBurnPercent, setHockBurnPercent] = useState("");
  const [gaitScore, setGaitScore] = useState("");
  const [breastBlisterPercent, setBreastBlisterPercent] = useState("");
  const [plumageScore, setPlumageScore] = useState("");
  const [soiledPlumagePercent, setSoiledPlumagePercent] = useState("");
  const [overallOutcome, setOverallOutcome] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!flockNumber.trim()) { Alert.alert("Required", "Please select a flock."); return; }
    if (!assessedBy.trim()) { Alert.alert("Required", "Please enter who conducted the assessment."); return; }
    if (!overallOutcome) { Alert.alert("Required", "Please select the overall assessment outcome."); return; }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PoultryBroilerWelfare = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockId,
      flockNumber: flockNumber.trim(),
      assessmentDate,
      assessedBy: assessedBy.trim(),
      ageAtAssessmentDays: ageAtAssessmentDays.trim(),
      sampleSize: sampleSize.trim(),
      footpadDermatitisScore,
      footpadDermatitisPercent: footpadDermatitisPercent.trim(),
      hockBurnScore,
      hockBurnPercent: hockBurnPercent.trim(),
      gaitScore,
      breastBlisterPercent: breastBlisterPercent.trim(),
      plumageScore,
      soiledPlumagePercent: soiledPlumagePercent.trim(),
      overallOutcome,
      actionsTaken: actionsTaken.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.POULTRY_BROILER_WELFARE, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", `BWI assessment recorded — Outcome: ${overallOutcome}`, [
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Broiler Welfare Index</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.sectionLabel}>
            <Feather name="feather" size={14} color="#d97706" />
            <Text style={styles.sectionTitle}>Flock &amp; Assessor</Text>
          </View>
          <FlockPicker label="Select Flock *" value={flockNumber} onChange={setFlockNumber} onChangeFlock={(f) => setFlockId(f.id)} flocks={flocks} loading={flocksLoading} fromCache={fromCache} error={flocksError} />
          <Input label="Assessment Date *" placeholder="YYYY-MM-DD" maxDate="today" value={assessmentDate} onChangeText={setAssessmentDate} required />
          <Input label="Assessed By *" placeholder="Assessor name" value={assessedBy} onChangeText={setAssessedBy} required />
          <View style={styles.row}>
            <Input label="Bird Age (days)" placeholder="e.g. 35" value={ageAtAssessmentDays} onChangeText={setAgeAtAssessmentDays} keyboardType="number-pad" containerStyle={styles.flex} />
            <Input label="Sample Size (birds)" placeholder="e.g. 100" value={sampleSize} onChangeText={setSampleSize} keyboardType="number-pad" containerStyle={styles.flex} />
          </View>

          <View style={styles.infoBox}>
            <Feather name="info" size={13} color={colors.info} />
            <Text style={styles.infoText}>Record scores at slaughter or at house level. All metrics are used to calculate the Broiler Welfare Index per DEFRA / Red Tractor requirements.</Text>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="activity" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Footpad Dermatitis</Text>
          </View>
          <ScorePicker label="Footpad Dermatitis Score (0–3)" value={footpadDermatitisScore} onChange={setFootpadDermatitisScore} scores={SCORES_03} />
          <Input label="Footpad Dermatitis (%)" placeholder="e.g. 15" value={footpadDermatitisPercent} onChangeText={setFootpadDermatitisPercent} keyboardType="decimal-pad" />

          <View style={styles.sectionLabel}>
            <Feather name="activity" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Hock Burn</Text>
          </View>
          <ScorePicker label="Hock Burn Score (0–3)" value={hockBurnScore} onChange={setHockBurnScore} scores={SCORES_03} />
          <Input label="Hock Burn (%)" placeholder="e.g. 8" value={hockBurnPercent} onChangeText={setHockBurnPercent} keyboardType="decimal-pad" />

          <View style={styles.sectionLabel}>
            <Feather name="trending-up" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Gait &amp; Locomotion</Text>
          </View>
          <ScorePicker label="Gait Score" value={gaitScore} onChange={setGaitScore} scores={GAIT_SCORES} />

          <View style={styles.sectionLabel}>
            <Feather name="layers" size={14} color="#92400e" />
            <Text style={styles.sectionTitle}>Breast Blisters &amp; Plumage</Text>
          </View>
          <Input label="Breast Blister (%)" placeholder="e.g. 5" value={breastBlisterPercent} onChangeText={setBreastBlisterPercent} keyboardType="decimal-pad" />
          <ScorePicker label="Plumage Score (0–3)" value={plumageScore} onChange={setPlumageScore} scores={SCORES_03} />
          <Input label="Soiled Plumage (%)" placeholder="e.g. 10" value={soiledPlumagePercent} onChangeText={setSoiledPlumagePercent} keyboardType="decimal-pad" />

          <View style={styles.sectionLabel}>
            <Feather name="shield" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Overall BWI Outcome</Text>
          </View>
          <View style={styles.outcomeRow}>
            {OUTCOMES.map((o) => (
              <Pressable
                key={o.key}
                onPress={() => { Haptics.selectionAsync(); setOverallOutcome(o.key); }}
                style={[styles.outcomeCard, overallOutcome === o.key && { borderColor: o.color, backgroundColor: o.color + "22" }]}
              >
                <Text style={[styles.outcomeLabel, overallOutcome === o.key && { color: o.color }]}>{o.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Actions &amp; Notes</Text>
          </View>
          <Input label="Actions Taken / Required" placeholder="e.g. Improved litter management, reduced stocking density, contacted vet…" value={actionsTaken} onChangeText={setActionsTaken} multiline numberOfLines={2} />
          <Input label="Additional Notes" placeholder="Any other observations…" value={notes} onChangeText={setNotes} multiline numberOfLines={2} />

          <Button title="Save BWI Assessment" onPress={handleSave} loading={saving} fullWidth icon="check" />
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
  outcomeRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg },
  outcomeCard: { flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center" },
  outcomeLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, textAlign: "center" },
});
