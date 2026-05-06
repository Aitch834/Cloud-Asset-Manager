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
import type { DairyMastitisRecord } from "@/lib/types";

const CLINICAL_GRADES = ["Subclinical", "Mild", "Moderate", "Severe"];
const QUARTERS = ["Left fore", "Right fore", "Left hind", "Right hind"];

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
        trackColor={{ false: colors.borderLight, true: "#dc2626" }}
        thumbColor={"#fff"}
      />
    </View>
  );
}

export default function MastitisRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();

  const [cowEarTag, setCowEarTag] = useState("");
  const [onsetDate, setOnsetDate] = useState(new Date().toISOString().split("T")[0]);
  const [quartersAffected, setQuartersAffected] = useState<string[]>([]);
  const [clinicalGrade, setClinicalGrade] = useState("");
  const [treatmentProduct, setTreatmentProduct] = useState("");
  const [treatmentStartDate, setTreatmentStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [treatmentDurationDays, setTreatmentDurationDays] = useState("");
  const [vetConsulted, setVetConsulted] = useState(false);
  const [vetName, setVetName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleQuarter = (q: string) => {
    Haptics.selectionAsync();
    setQuartersAffected((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q],
    );
  };

  const handleSave = async () => {
    if (!cowEarTag.trim()) {
      Alert.alert("Required", "Please enter the cow ear tag.");
      return;
    }
    if (!clinicalGrade) {
      Alert.alert("Required", "Please select a clinical grade.");
      return;
    }
    if (quartersAffected.length === 0) {
      Alert.alert("Required", "Please select at least one quarter affected.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: DairyMastitisRecord = {
      id: `mastitis_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      farmId: currentFarm?.id?.toString() ?? "unknown",
      cowEarTag: cowEarTag.trim(),
      onsetDate,
      quartersAffected: quartersAffected.join(", "),
      clinicalGrade,
      treatmentProduct: treatmentProduct.trim(),
      treatmentStartDate,
      treatmentDurationDays: treatmentDurationDays.trim(),
      vetConsulted,
      vetName: vetName.trim(),
      notes: notes.trim(),
      latitude: null,
      longitude: null,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.DAIRY_MASTITIS_RECORDS, record);
      await refreshPendingCount();
      Alert.alert(
        "Mastitis Record Saved",
        "The record has been saved and will sync when connected.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err) {
      console.error("Save mastitis error:", err);
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
          <Text style={styles.headerTitle}>Mastitis Record</Text>
          <Text style={styles.headerSub}>Log clinical mastitis case and treatment</Text>
        </View>
        <View style={styles.alertBadge}>
          <Feather name="alert-circle" size={14} color="#991b1b" />
          <Text style={styles.alertBadgeText}>Health</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.complianceNote}>
          <Feather name="info" size={14} color="#92400e" style={{ marginTop: 2 }} />
          <Text style={styles.complianceNoteText}>
            All mastitis cases must be recorded for Red Tractor dairy compliance. Observe medicine
            withdrawal periods before returning milk to the bulk tank. Retain records for 3 years.
          </Text>
        </View>

        <Section title="Cow & Onset">
          <Text style={styles.label}>Cow Ear Tag *</Text>
          <Input
            placeholder="e.g. UK123456 78901"
            value={cowEarTag}
            onChangeText={setCowEarTag}
            autoCapitalize="characters"
          />
          <Text style={styles.label}>Date of Onset *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            maxDate="today"
            value={onsetDate}
            onChangeText={setOnsetDate}
            keyboardType="numbers-and-punctuation"
          />
        </Section>

        <Section title="Quarters Affected *">
          <View style={styles.chipRow}>
            {QUARTERS.map((q) => (
              <Pressable
                key={q}
                style={[
                  styles.chip,
                  quartersAffected.includes(q) && { backgroundColor: "#dc2626", borderColor: "#dc2626" },
                ]}
                onPress={() => toggleQuarter(q)}
              >
                <Text style={[styles.chipText, quartersAffected.includes(q) && { color: "#fff" }]}>{q}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Clinical Grade *">
          <View style={styles.chipRow}>
            {CLINICAL_GRADES.map((g) => (
              <Pressable
                key={g}
                style={[styles.chip, clinicalGrade === g && { backgroundColor: "#dc2626", borderColor: "#dc2626" }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setClinicalGrade(g);
                }}
              >
                <Text style={[styles.chipText, clinicalGrade === g && { color: "#fff" }]}>{g}</Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title="Treatment">
          <Text style={styles.label}>Treatment Product</Text>
          <Input
            placeholder="e.g. Ubrolexin intramammary, 3 tubes"
            value={treatmentProduct}
            onChangeText={setTreatmentProduct}
          />
          <Text style={styles.label}>Treatment Start Date</Text>
          <Input
            placeholder="YYYY-MM-DD"
            maxDate="today"
            value={treatmentStartDate}
            onChangeText={setTreatmentStartDate}
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.label}>Treatment Duration (days)</Text>
          <Input
            placeholder="e.g. 3"
            value={treatmentDurationDays}
            onChangeText={setTreatmentDurationDays}
            keyboardType="number-pad"
          />
          <ToggleRow label="Vet consulted" value={vetConsulted} onChange={setVetConsulted} />
          {vetConsulted && (
            <>
              <Text style={styles.label}>Vet Name / Practice</Text>
              <Input placeholder="e.g. Jane Brown MRCVS" value={vetName} onChangeText={setVetName} />
            </>
          )}
        </Section>

        <Section title="Notes">
          <Input
            placeholder="Recovery notes, follow-up actions, re-test results..."
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
          <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save Mastitis Record"}</Text>
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
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fee2e2",
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  alertBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: "#991b1b",
  },
  scroll: {
    padding: spacing.md,
    gap: spacing.md,
  },
  complianceNote: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#fffbeb",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: spacing.sm,
  },
  complianceNoteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#92400e",
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
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
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
    color: colors.text,
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
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveBtn: {
    backgroundColor: "#dc2626",
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
});
