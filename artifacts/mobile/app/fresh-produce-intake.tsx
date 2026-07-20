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
import type { FreshProduceIntakeRecord } from "@/lib/types";

const CONDITIONS = ["Good", "Acceptable", "Poor", "Rejected"] as const;
type Condition = typeof CONDITIONS[number];

const CONDITION_COLORS: Record<Condition, { bg: string; border: string; text: string }> = {
  Good:       { bg: "#dcfce7", border: "#16a34a", text: "#15803d" },
  Acceptable: { bg: "#fef9c3", border: "#ca8a04", text: "#a16207" },
  Poor:       { bg: "#ffedd5", border: "#ea580c", text: "#c2410c" },
  Rejected:   { bg: "#fee2e2", border: "#dc2626", text: "#b91c1c" },
};

export default function FreshProduceIntakeScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [intakeDate, setIntakeDate] = useState(today);
  const [harvestBatchRef, setHarvestBatchRef] = useState("");
  const [productName, setProductName] = useState("");
  const [blockOrField, setBlockOrField] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [condition, setCondition] = useState<Condition>("Good");
  const [intakeTemperatureC, setIntakeTemperatureC] = useState("");
  const [targetStorageTemperatureC, setTargetStorageTemperatureC] = useState("");
  const [preCoolingStartTime, setPreCoolingStartTime] = useState("");
  const [preCoolingEndTime, setPreCoolingEndTime] = useState("");
  const [inspector, setInspector] = useState(user?.name || "");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!productName.trim() || !harvestBatchRef.trim()) {
      Alert.alert("Required Fields", "Please enter the product name and harvest batch reference.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: FreshProduceIntakeRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      intakeDate,
      harvestBatchRef: harvestBatchRef.trim(),
      productName: productName.trim(),
      blockOrField: blockOrField.trim(),
      quantityKg: quantityKg.trim(),
      conditionOnArrival: condition,
      intakeTemperatureC: intakeTemperatureC.trim(),
      targetStorageTemperatureC: targetStorageTemperatureC.trim(),
      preCoolingStartTime: preCoolingStartTime.trim(),
      preCoolingEndTime: preCoolingEndTime.trim(),
      inspector: inspector.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.FRESH_PRODUCE_INTAKE_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Intake QC record saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const condColor = CONDITION_COLORS[condition];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Fresh Produce Intake QC</Text>
            <Text style={styles.subtitle}>Condition, temperature &amp; traceability at receipt</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <Text style={styles.sectionTitle}>Batch &amp; Product</Text>
          <Input label="Intake Date" value={intakeDate} onChangeText={setIntakeDate} placeholder="YYYY-MM-DD" maxDate="today" />
          <Input label="Harvest Batch Ref *" value={harvestBatchRef} onChangeText={setHarvestBatchRef} placeholder="e.g. HB-2026-042" />
          <Input label="Product Name *" value={productName} onChangeText={setProductName} placeholder="e.g. Strawberry, Iceberg Lettuce" />
          <Input label="Block / Field Origin" value={blockOrField} onChangeText={setBlockOrField} placeholder="e.g. Block A, Field 3" />
          <Input label="Quantity Received (kg)" value={quantityKg} onChangeText={setQuantityKg} placeholder="Total weight received" keyboardType="decimal-pad" />

          <Text style={styles.sectionTitle}>Condition on Arrival</Text>
          <View style={styles.chipRow}>
            {CONDITIONS.map((c) => {
              const col = CONDITION_COLORS[c];
              const active = condition === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => { setCondition(c); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={[styles.condChip, active && { backgroundColor: col.bg, borderColor: col.border }]}
                >
                  <Text style={[styles.condChipText, active && { color: col.text, fontFamily: fonts.semiBold }]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
          {condition === "Poor" || condition === "Rejected" ? (
            <View style={[styles.alertBanner, { backgroundColor: condColor.bg, borderColor: condColor.border }]}>
              <Feather name="alert-triangle" size={14} color={condColor.text} />
              <Text style={[styles.alertText, { color: condColor.text }]}>
                {condition === "Rejected" ? "Record rejection reason in Notes. Notify QA manager." : "Monitor closely. Record any corrective action in Notes."}
              </Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>Temperature</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Intake Temp (°C)" value={intakeTemperatureC} onChangeText={setIntakeTemperatureC} placeholder="e.g. 4.2" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Target Storage Temp (°C)" value={targetStorageTemperatureC} onChangeText={setTargetStorageTemperatureC} placeholder="e.g. 2.0" keyboardType="decimal-pad" />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Pre-Cooling</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Pre-Cooling Start" value={preCoolingStartTime} onChangeText={setPreCoolingStartTime} placeholder="e.g. 14:30" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Pre-Cooling End" value={preCoolingEndTime} onChangeText={setPreCoolingEndTime} placeholder="e.g. 16:00" />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Inspector &amp; Notes</Text>
          <Input label="Inspector / Checker" value={inspector} onChangeText={setInspector} placeholder="Name" />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Rejection reasons, corrective actions, observations…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Intake Record"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  condChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border },
  condChipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  alertBanner: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, marginTop: spacing.xs },
  alertText: { fontFamily: fonts.regular, fontSize: fontSize.sm, flex: 1 },
  saveButton: { marginTop: spacing.lg },
});
