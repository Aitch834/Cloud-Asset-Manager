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

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const OUTCOMES = [
  { key: "satisfactory", label: "Satisfactory", color: "#16a34a" },
  { key: "action_required", label: "Action Required", color: "#d97706" },
  { key: "urgent_action", label: "Urgent Action", color: "#dc2626" },
];

const SPECIES = ["Cattle", "Sheep", "Goats", "Pigs", "Poultry", "Deer", "Mixed", "Other"];

function Chip({ label, selected, onPress, color }: { label: string; selected: boolean; onPress: () => void; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: color ?? colors.primary, borderColor: color ?? colors.primary }]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function AhwrReviewScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [reviewDate, setReviewDate] = useState(todayDate());
  const [vetName, setVetName] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [species, setSpecies] = useState<string>("Cattle");
  const [keyFindings, setKeyFindings] = useState("");
  const [healthPriorities, setHealthPriorities] = useState("");
  const [actionPoints, setActionPoints] = useState("");
  const [nextReviewDate, setNextReviewDate] = useState("");
  const [outcome, setOutcome] = useState<string>("satisfactory");
  const [notes, setNotes] = useState("");

  async function handleSave() {
    if (!currentFarm) {
      Alert.alert("No farm selected", "Please select a farm before saving.");
      return;
    }
    if (!reviewDate || !vetName) {
      Alert.alert("Required", "Please enter the review date and vet name.");
      return;
    }
    setSaving(true);
    try {
      const record = {
        id: generateId(),
        farmId: currentFarm.id,
        reviewDate,
        vetName,
        practiceName,
        species,
        keyFindings,
        healthPriorities,
        actionPoints,
        nextReviewDate: nextReviewDate || null,
        outcome,
        notes,
        recordedBy: user?.name ?? null,
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.AHWR_RECORDS, record);
      await refreshPendingCount();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Annual Health & Welfare Review saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="x" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Annual Health Review</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionHeader}>Review Details</Text>

          <Text style={styles.label}>Review Date</Text>
          <Input value={reviewDate} onChangeText={setReviewDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.label}>Vet Name</Text>
          <Input value={vetName} onChangeText={setVetName} placeholder="e.g. Dr Sarah Jones" />

          <Text style={styles.label}>Veterinary Practice</Text>
          <Input value={practiceName} onChangeText={setPracticeName} placeholder="Practice name" />

          <Text style={styles.label}>Species Reviewed</Text>
          <View style={styles.chips}>
            {SPECIES.map((s) => (
              <Chip key={s} label={s} selected={species === s} onPress={() => setSpecies(s)} />
            ))}
          </View>

          <Text style={styles.sectionHeader}>Findings & Actions</Text>

          <Text style={styles.label}>Key Findings</Text>
          <Input
            value={keyFindings}
            onChangeText={setKeyFindings}
            placeholder="Summary of health status, disease pressures, BCS, welfare indicators…"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Health Priorities (next 12 months)</Text>
          <Input
            value={healthPriorities}
            onChangeText={setHealthPriorities}
            placeholder="Vaccination protocols, endemic disease management, nutrition plans…"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Action Points</Text>
          <Input
            value={actionPoints}
            onChangeText={setActionPoints}
            placeholder="Specific actions agreed with vet — owner and date for each"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Next Review Date</Text>
          <Input value={nextReviewDate} onChangeText={setNextReviewDate} placeholder="YYYY-MM-DD (typically 12 months)" />

          <Text style={styles.sectionHeader}>Overall Outcome</Text>
          <View style={styles.chips}>
            {OUTCOMES.map((o) => (
              <Chip key={o.key} label={o.label} selected={outcome === o.key} onPress={() => setOutcome(o.key)} color={o.color} />
            ))}
          </View>

          <Text style={styles.sectionHeader}>Notes</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional observations or follow-up"
            multiline
            numberOfLines={3}
          />

          <Button title={saving ? "Saving…" : "Save Review"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backBtn: { padding: 6 },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  body: { padding: spacing.md, gap: spacing.sm, paddingBottom: 40 },
  sectionHeader: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  saveBtn: { marginTop: spacing.lg },
});
