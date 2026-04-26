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
import type { OrganicInspection } from "@/lib/types";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const CERTIFIERS = [
  "Soil Association",
  "OF&G",
  "BDOCA",
  "ABCERT",
  "Organic Farmers & Growers",
  "Other",
];

const OUTCOMES = [
  { key: "Pass", color: "#16a34a" },
  { key: "Conditional Pass", color: "#d97706" },
  { key: "Non-Conformance Identified", color: "#dc2626" },
  { key: "Certificate Suspended", color: "#7c3aed" },
];

export default function OrganicInspectionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [certifier, setCertifier] = useState("Soil Association");
  const [inspectionDate, setInspectionDate] = useState(todayDate());
  const [inspectorName, setInspectorName] = useState(user?.name ?? "");
  const [outcome, setOutcome] = useState("Pass");
  const [certificateReference, setCertificateReference] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [nonConformances, setNonConformances] = useState("");
  const [actions, setActions] = useState("");
  const [notes, setNotes] = useState("");

  const needsDetail = outcome === "Non-Conformance Identified" || outcome === "Certificate Suspended";

  const handleSave = async () => {
    if (!inspectionDate.trim()) {
      Alert.alert("Required Field", "Please enter the inspection date.");
      return;
    }
    if (!certifier.trim()) {
      Alert.alert("Required Field", "Please select a certifying body.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: OrganicInspection = {
      id: generateId(),
      farmId: currentFarm?.id ?? "",
      certifier: certifier.trim(),
      inspectorName: inspectorName.trim(),
      inspectionDate: inspectionDate.trim(),
      outcome,
      certificateReference: certificateReference.trim(),
      nextDueDate: nextDueDate.trim(),
      nonConformances: nonConformances.trim(),
      actions: actions.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.ORGANIC_INSPECTIONS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Inspection Recorded",
      "Your organic inspection has been saved and will sync when online.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Record Inspection</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoBox}>
            <Feather name="shield" size={14} color="#16a34a" />
            <Text style={styles.infoText}>
              Log your annual certifier inspection visit. Records sync to the Organic Compliance module.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Inspection Details</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Certifying Body *</Text>
              <View style={styles.chipWrap}>
                {CERTIFIERS.map((c) => (
                  <Pressable
                    key={c}
                    style={[styles.chip, certifier === c && styles.chipActive]}
                    onPress={() => { Haptics.selectionAsync(); setCertifier(c); }}
                  >
                    <Text style={[styles.chipText, certifier === c && styles.chipTextActive]}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Inspection Date *</Text>
                <Input placeholder="YYYY-MM-DD" value={inspectionDate} onChangeText={setInspectionDate} />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Next Due Date</Text>
                <Input placeholder="YYYY-MM-DD" value={nextDueDate} onChangeText={setNextDueDate} />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Inspector Name</Text>
              <Input placeholder="Name of certifier's inspector" value={inspectorName} onChangeText={setInspectorName} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Outcome *</Text>
              <View style={styles.chipWrap}>
                {OUTCOMES.map((o) => (
                  <Pressable
                    key={o.key}
                    style={[styles.chip, outcome === o.key && { backgroundColor: o.color, borderColor: o.color }]}
                    onPress={() => { Haptics.selectionAsync(); setOutcome(o.key); }}
                  >
                    <Text style={[styles.chipText, outcome === o.key && { color: "#fff" }]}>{o.key}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Certificate / Report Reference</Text>
              <Input placeholder="e.g. SA-2024-12345" value={certificateReference} onChangeText={setCertificateReference} />
            </View>
          </View>

          {needsDetail && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Non-Conformance Details</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Non-Conformances Identified</Text>
                <Input
                  placeholder="Describe each non-conformance..."
                  value={nonConformances}
                  onChangeText={setNonConformances}
                  multiline
                  numberOfLines={3}
                  style={styles.textarea}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Actions Required</Text>
                <Input
                  placeholder="Actions to resolve non-conformances..."
                  value={actions}
                  onChangeText={setActions}
                  multiline
                  numberOfLines={3}
                  style={styles.textarea}
                />
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <View style={styles.field}>
              <Input
                placeholder="Any additional notes from the inspection..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                style={styles.textarea}
              />
            </View>
          </View>

          <Button title={saving ? "Saving…" : "Save Inspection"} onPress={handleSave} disabled={saving} />
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#f0fdf4",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#15803d", flex: 1 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  field: { marginBottom: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: "#fff" },
  textarea: { minHeight: 80, textAlignVertical: "top" },
});
