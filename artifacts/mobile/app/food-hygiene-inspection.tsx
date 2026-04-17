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

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { FoodHygieneInspectionRecord } from "@/lib/types";

const RELATES_TO = [
  "Farm Shop",
  "Food Processing",
  "Events / Catering",
  "Farm Kitchen",
  "Equine / Livery",
  "Other",
];

const INSPECTION_TYPES: { key: FoodHygieneInspectionRecord["inspectionType"]; label: string }[] = [
  { key: "local_authority_routine", label: "Local Authority Routine" },
  { key: "allergen_compliance", label: "Allergen Compliance" },
  { key: "haccp_audit", label: "HACCP Audit" },
  { key: "red_tractor", label: "Red Tractor" },
  { key: "self_audit", label: "Self-Audit" },
  { key: "other", label: "Other" },
];

const RATINGS = [0, 1, 2, 3, 4, 5];

export default function FoodHygieneInspectionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [relatesTo, setRelatesTo] = useState("");
  const [inspectionDate, setInspectionDate] = useState(today);
  const [inspectionType, setInspectionType] = useState<FoodHygieneInspectionRecord["inspectionType"]>("local_authority_routine");
  const [inspectorName, setInspectorName] = useState("");
  const [inspectorOrganisation, setInspectorOrganisation] = useState("");
  const [hygieneRating, setHygieneRating] = useState<number | null>(null);
  const [reinspectionRequired, setReinspectionRequired] = useState(false);
  const [reinspectionDate, setReinspectionDate] = useState("");
  const [findingsSummary, setFindingsSummary] = useState("");
  const [correctiveActions, setCorrectiveActions] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!relatesTo || !inspectionDate) {
      Alert.alert("Required Fields", "Please select what this inspection relates to and enter the date.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: FoodHygieneInspectionRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      relatesTo,
      inspectionDate,
      inspectionType,
      inspectorName: inspectorName.trim(),
      inspectorOrganisation: inspectorOrganisation.trim(),
      hygieneRating: hygieneRating !== null ? String(hygieneRating) : "",
      reinspectionRequired,
      reinspectionDate: reinspectionDate.trim(),
      findingsSummary: findingsSummary.trim(),
      correctiveActions: correctiveActions.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.FOOD_HYGIENE_INSPECTIONS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Hygiene inspection record saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Food Hygiene Inspection</Text>
            <Text style={styles.subtitle}>EHO visits, HACCP audits & allergen compliance checks</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Relates To *</Text>
          <View style={styles.chipRow}>
            {RELATES_TO.map((r) => (
              <Pressable key={r} onPress={() => setRelatesTo(r)} style={[styles.chip, relatesTo === r && styles.chipActive]}>
                <Text style={[styles.chipText, relatesTo === r && styles.chipTextActive]}>{r}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Inspection</Text>
          <Input label="Inspection Date *" value={inspectionDate} onChangeText={setInspectionDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.label}>Inspection Type</Text>
          <View style={styles.chipRow}>
            {INSPECTION_TYPES.map((t) => (
              <Pressable key={t.key} onPress={() => setInspectionType(t.key)} style={[styles.chip, inspectionType === t.key && styles.chipActive]}>
                <Text style={[styles.chipText, inspectionType === t.key && styles.chipTextActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <Input label="Inspector Name" value={inspectorName} onChangeText={setInspectorName} placeholder="Name of inspector" />
          <Input label="Organisation" value={inspectorOrganisation} onChangeText={setInspectorOrganisation} placeholder="e.g. Local Authority, Red Tractor" />

          <Text style={styles.sectionTitle}>Outcome</Text>
          <Text style={styles.label}>Food Hygiene Rating (0–5)</Text>
          <View style={styles.chipRow}>
            {RATINGS.map((r) => (
              <Pressable
                key={r}
                onPress={() => setHygieneRating(hygieneRating === r ? null : r)}
                style={[styles.ratingChip, hygieneRating === r && styles.ratingChipActive(r)]}
              >
                <Text style={[styles.ratingText, hygieneRating === r && styles.ratingTextActive]}>{r}</Text>
              </Pressable>
            ))}
          </View>
          {hygieneRating !== null && (
            <Text style={[styles.ratingHint, { color: hygieneRating <= 2 ? colors.error : hygieneRating <= 3 ? colors.accent : "#16a34a" }]}>
              {hygieneRating === 0 ? "Urgent improvement necessary"
                : hygieneRating === 1 ? "Major improvement necessary"
                : hygieneRating === 2 ? "Improvement necessary"
                : hygieneRating === 3 ? "Generally satisfactory"
                : hygieneRating === 4 ? "Good"
                : "Very good"}
            </Text>
          )}

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Reinspection required?</Text>
            <Switch
              value={reinspectionRequired}
              onValueChange={setReinspectionRequired}
              trackColor={{ false: colors.border, true: colors.primary + "66" }}
              thumbColor={reinspectionRequired ? colors.primary : colors.textSecondary}
            />
          </View>
          {reinspectionRequired && (
            <Input label="Reinspection Date" value={reinspectionDate} onChangeText={setReinspectionDate} placeholder="YYYY-MM-DD" />
          )}

          <Text style={styles.sectionTitle}>Findings &amp; Actions</Text>
          <Input label="Findings Summary" value={findingsSummary} onChangeText={setFindingsSummary} placeholder="Key findings from the inspection…" multiline numberOfLines={4} />
          <Input label="Corrective Actions Required" value={correctiveActions} onChangeText={setCorrectiveActions} placeholder="Actions to be taken, deadlines…" multiline numberOfLines={4} />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional details…" multiline numberOfLines={2} />

          <Button title={saving ? "Saving…" : "Save Inspection"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const ratingColors = ["#dc2626", "#ea580c", "#d97706", "#ca8a04", "#16a34a", "#15803d"];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  ratingChip: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border },
  ratingChipActive: (r: number) => ({ borderColor: ratingColors[r], backgroundColor: ratingColors[r] + "20" }),
  ratingText: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text },
  ratingTextActive: { color: colors.text },
  ratingHint: { fontFamily: fonts.medium, fontSize: fontSize.sm, marginTop: -spacing.sm, marginBottom: spacing.sm },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  saveButton: { marginTop: spacing.lg },
});
