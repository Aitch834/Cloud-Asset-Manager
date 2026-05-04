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
import type { WelfareOutcomeRecord } from "@/lib/types";

type Lameness = WelfareOutcomeRecord["lameness"];
type Cleanliness = WelfareOutcomeRecord["cleanlinessScore"];
type Outcome = WelfareOutcomeRecord["outcome"];

const SPECIES_OPTIONS = ["Cattle", "Sheep", "Pigs", "Goats", "Poultry", "Deer", "Other"];

const LAMENESS_OPTIONS: { key: Lameness; label: string; color: string }[] = [
  { key: "none", label: "None", color: colors.success },
  { key: "low", label: "Low (<2%)", color: colors.success },
  { key: "moderate", label: "Moderate (2–5%)", color: colors.warning ?? colors.primary },
  { key: "high", label: "High (>5%)", color: colors.error },
];

const CLEANLINESS_OPTIONS: { key: Cleanliness; label: string }[] = [
  { key: "clean", label: "Clean" },
  { key: "slight", label: "Slightly Soiled" },
  { key: "moderate", label: "Moderately Soiled" },
  { key: "dirty", label: "Dirty" },
];

const OUTCOMES: { key: Outcome; label: string; color: string }[] = [
  { key: "satisfactory", label: "Satisfactory", color: colors.success },
  { key: "action_required", label: "Action Required", color: colors.warning ?? colors.primary },
  { key: "urgent_action", label: "Urgent Action", color: colors.error },
];

export default function WelfareOutcomeScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [assessmentDate, setAssessmentDate] = useState(today);
  const [species, setSpecies] = useState("Cattle");
  const [animalGroup, setAnimalGroup] = useState("");
  const [animalCount, setAnimalCount] = useState("");
  const [assessorName, setAssessorName] = useState(user?.name || "");
  const [bcsAverage, setBcsAverage] = useState("");
  const [lameness, setLameness] = useState<Lameness>("none");
  const [mortalityRate, setMortalityRate] = useState("");
  const [injuriesObserved, setInjuriesObserved] = useState(false);
  const [cleanlinessScore, setCleanlinessScore] = useState<Cleanliness>("clean");
  const [waterAccess, setWaterAccess] = useState(true);
  const [feedAccess, setFeedAccess] = useState(true);
  const [shelterAdequate, setShelterAdequate] = useState(true);
  const [behaviourNormal, setBehaviourNormal] = useState(true);
  const [outcome, setOutcome] = useState<Outcome>("satisfactory");
  const [actionsRequired, setActionsRequired] = useState("");
  const [nextAssessmentDate, setNextAssessmentDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!assessmentDate || !assessorName.trim() || !species) {
      Alert.alert("Required Fields", "Please enter the assessment date, assessor name and species.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: WelfareOutcomeRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      assessmentDate,
      species,
      animalGroup: animalGroup.trim(),
      animalCount: animalCount.trim(),
      assessorName: assessorName.trim(),
      bcsAverage: bcsAverage.trim(),
      lameness,
      mortalityRate: mortalityRate.trim(),
      injuriesObserved,
      cleanlinessScore,
      waterAccess,
      feedAccess,
      shelterAdequate,
      behaviourNormal,
      outcome,
      actionsRequired: actionsRequired.trim(),
      nextAssessmentDate: nextAssessmentDate.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.WELFARE_OUTCOME_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Welfare outcome assessment saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const BoolToggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) => (
    <Pressable style={styles.toggleRow} onPress={() => onChange(!value)}>
      <View style={[styles.checkbox, value && styles.checkboxChecked]}>
        {value && <Feather name="check" size={12} color="#fff" />}
      </View>
      <Text style={styles.toggleLabel}>{label}</Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Welfare Outcome Assessment</Text>
            <Text style={styles.subtitle}>Red Tractor / organic welfare outcome metrics</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <Text style={styles.sectionTitle}>Assessment Details</Text>
          <Input
            label="Assessment Date *"
            maxDate="today"
            value={assessmentDate}
            onChangeText={setAssessmentDate}
            placeholder="YYYY-MM-DD"
          />
          <Input
            label="Assessor Name *"
            value={assessorName}
            onChangeText={setAssessorName}
            placeholder="e.g. J. Smith"
          />

          <Text style={styles.fieldLabel}>Species *</Text>
          <View style={styles.chipRow}>
            {SPECIES_OPTIONS.map((s) => (
              <Pressable
                key={s}
                style={[styles.chip, species === s && styles.chipActive]}
                onPress={() => setSpecies(s)}
              >
                <Text style={[styles.chipText, species === s && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="Animal Group / Identifier"
            value={animalGroup}
            onChangeText={setAnimalGroup}
            placeholder="e.g. Herd 1, Pen 3, Batch A"
          />
          <Input
            label="Number of Animals"
            value={animalCount}
            onChangeText={setAnimalCount}
            placeholder="e.g. 120"
            keyboardType="numeric"
          />

          <Text style={styles.sectionTitle}>Welfare Indicators</Text>
          <Input
            label="Average Body Condition Score (BCS)"
            value={bcsAverage}
            onChangeText={setBcsAverage}
            placeholder="e.g. 3.0 (cattle scale 1–5)"
            keyboardType="numeric"
          />
          <Input
            label="Mortality Rate (%)"
            value={mortalityRate}
            onChangeText={setMortalityRate}
            placeholder="e.g. 1.2"
            keyboardType="numeric"
          />

          <Text style={styles.fieldLabel}>Lameness Prevalence</Text>
          <View style={styles.chipRow}>
            {LAMENESS_OPTIONS.map((l) => (
              <Pressable
                key={l.key}
                style={[styles.chip, lameness === l.key && { borderColor: l.color, backgroundColor: l.color + "15" }]}
                onPress={() => setLameness(l.key)}
              >
                <Text style={[styles.chipText, lameness === l.key && { color: l.color }]}>{l.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Cleanliness Score</Text>
          <View style={styles.chipRow}>
            {CLEANLINESS_OPTIONS.map((c) => (
              <Pressable
                key={c.key}
                style={[styles.chip, cleanlinessScore === c.key && styles.chipActive]}
                onPress={() => setCleanlinessScore(c.key)}
              >
                <Text style={[styles.chipText, cleanlinessScore === c.key && styles.chipTextActive]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Husbandry Checks</Text>
          <BoolToggle label="Injuries observed" value={injuriesObserved} onChange={setInjuriesObserved} />
          <BoolToggle label="Adequate water access" value={waterAccess} onChange={setWaterAccess} />
          <BoolToggle label="Adequate feed access" value={feedAccess} onChange={setFeedAccess} />
          <BoolToggle label="Shelter / housing adequate" value={shelterAdequate} onChange={setShelterAdequate} />
          <BoolToggle label="Normal behaviour observed" value={behaviourNormal} onChange={setBehaviourNormal} />

          <Text style={styles.sectionTitle}>Outcome</Text>
          {OUTCOMES.map((o) => (
            <Pressable
              key={o.key}
              style={[styles.resultOption, outcome === o.key && { borderColor: o.color, backgroundColor: o.color + "15" }]}
              onPress={() => setOutcome(o.key)}
            >
              <View style={[styles.radioOuter, outcome === o.key && { borderColor: o.color }]}>
                {outcome === o.key && <View style={[styles.radioInner, { backgroundColor: o.color }]} />}
              </View>
              <Text style={[styles.resultLabel, outcome === o.key && { color: o.color }]}>{o.label}</Text>
            </Pressable>
          ))}

          {(outcome === "action_required" || outcome === "urgent_action") && (
            <Input
              label="Actions Required"
              value={actionsRequired}
              onChangeText={setActionsRequired}
              placeholder="Describe corrective actions..."
              multiline
              numberOfLines={3}
            />
          )}

          <Input
            label="Next Assessment Due"
            minDate="today"
            value={nextAssessmentDate}
            onChangeText={setNextAssessmentDate}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.sectionTitle}>Notes</Text>
          <Input
            label="Additional Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional observations..."
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Welfare Assessment"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: { marginRight: spacing.sm, padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.sm },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextActive: { color: colors.primary },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  resultOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  radioInner: { width: 8, height: 8, borderRadius: 4 },
  resultLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
});
