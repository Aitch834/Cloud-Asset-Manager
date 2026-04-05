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

type MeasurementMethod = "dip_stick" | "sight_gauge" | "flow_meter" | "weighbridge" | "other";

const METHODS: { key: MeasurementMethod; label: string; description: string }[] = [
  { key: "dip_stick", label: "Dip Stick", description: "Physical dip into tank" },
  { key: "sight_gauge", label: "Sight Gauge", description: "Reading from sight glass" },
  { key: "flow_meter", label: "Flow Meter / Totaliser", description: "Electronic flow meter reading" },
  { key: "weighbridge", label: "Weighbridge", description: "Weight-based measurement" },
  { key: "other", label: "Other", description: "Alternative measurement method" },
];

const VARIANCE_THRESHOLD = 50;

export default function FuelStockCheckScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [tankName, setTankName] = useState("");
  const [measuredLitres, setMeasuredLitres] = useState("");
  const [calculatedLitres, setCalculatedLitres] = useState("");
  const [method, setMethod] = useState<MeasurementMethod>("dip_stick");
  const [checkedBy, setCheckedBy] = useState(user?.name || "");
  const [notes, setNotes] = useState("");

  const variance =
    measuredLitres && calculatedLitres
      ? parseFloat(measuredLitres) - parseFloat(calculatedLitres)
      : null;

  const varianceIsLarge = variance !== null && Math.abs(variance) >= VARIANCE_THRESHOLD;
  const varianceIsNegative = variance !== null && variance < 0;

  const handleSave = async () => {
    if (!tankName.trim()) {
      Alert.alert("Required", "Please enter the tank name.");
      return;
    }
    if (!measuredLitres.trim()) {
      Alert.alert("Required", "Please enter the measured quantity.");
      return;
    }
    if (isNaN(parseFloat(measuredLitres)) || parseFloat(measuredLitres) < 0) {
      Alert.alert("Invalid", "Measured quantity must be a positive number.");
      return;
    }

    setSaving(true);

    if (varianceIsLarge && varianceIsNegative) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const record = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      tankName: tankName.trim(),
      measuredLitres: measuredLitres.trim(),
      calculatedLitres: calculatedLitres.trim(),
      varianceLitres: variance !== null ? variance.toFixed(1) : null,
      method,
      checkedBy: checkedBy.trim(),
      checkDate: today,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.FUEL_STOCK_CHECKS, record, currentFarm?.id);
    await refreshPendingCount();
    setSaving(false);

    const title = varianceIsLarge && varianceIsNegative
      ? "Discrepancy Flagged"
      : "Stock Check Saved";

    const message = variance !== null
      ? varianceIsLarge && varianceIsNegative
        ? `Significant shortfall of ${Math.abs(variance).toFixed(0)} L detected. This will be flagged in your Week Ahead planner for investigation.`
        : `Variance: ${variance > 0 ? "+" : ""}${variance.toFixed(0)} L — within acceptable tolerance.`
      : "Stock check recorded successfully.";

    Alert.alert(title, message, [{ text: "Done", onPress: () => router.back() }]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Fuel Tank Stock Check</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tank & Checker</Text>
            <Input
              label="Tank Name"
              value={tankName}
              onChangeText={setTankName}
              placeholder="e.g. Main Red Diesel, Heating Oil Bunded, LPG Bulk"
              autoCapitalize="words"
            />
            <Input
              label="Checked By"
              value={checkedBy}
              onChangeText={setCheckedBy}
              placeholder="Your name"
              autoCapitalize="words"
            />
            <Input
              label="Check Date"
              value={today}
              editable={false}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Quantities</Text>
            <Input
              label="Physically Measured (litres)"
              value={measuredLitres}
              onChangeText={setMeasuredLitres}
              placeholder="e.g. 4250"
              keyboardType="decimal-pad"
            />
            <Input
              label="Expected from Records (litres)"
              value={calculatedLitres}
              onChangeText={setCalculatedLitres}
              placeholder="Calculated stock from deliveries minus usage — leave blank if unknown"
              keyboardType="decimal-pad"
            />

            {variance !== null && (
              <View
                style={[
                  styles.varianceCard,
                  {
                    borderColor: varianceIsLarge
                      ? varianceIsNegative
                        ? colors.error
                        : colors.accent
                      : colors.success + "66",
                    backgroundColor: varianceIsLarge
                      ? varianceIsNegative
                        ? colors.error + "12"
                        : colors.accent + "12"
                      : colors.success + "10",
                  },
                ]}
              >
                <Feather
                  name={varianceIsLarge ? (varianceIsNegative ? "alert-triangle" : "info") : "check-circle"}
                  size={18}
                  color={
                    varianceIsLarge
                      ? varianceIsNegative
                        ? colors.error
                        : colors.accent
                      : colors.success
                  }
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.varianceTitle,
                      {
                        color: varianceIsLarge
                          ? varianceIsNegative
                            ? colors.error
                            : colors.accent
                          : colors.success,
                      },
                    ]}
                  >
                    {varianceIsLarge && varianceIsNegative
                      ? "Significant Shortfall — Investigate"
                      : varianceIsLarge
                      ? "Surplus Detected — Check Records"
                      : "Within Tolerance"}
                  </Text>
                  <Text style={styles.varianceDetail}>
                    {variance > 0 ? "+" : ""}
                    {variance.toFixed(0)} L variance
                    {varianceIsLarge && varianceIsNegative
                      ? " — may indicate theft, leak or metering error"
                      : varianceIsLarge
                      ? " — check delivery records for unrecorded deliveries"
                      : " — normal dip-stick measurement tolerance"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Measurement Method</Text>
            {METHODS.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => setMethod(m.key)}
                style={[
                  styles.option,
                  method === m.key && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + "12",
                  },
                ]}
              >
                <View
                  style={[styles.radio, method === m.key && { borderColor: colors.primary }]}
                >
                  {method === m.key && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.optionLabel,
                      method === m.key && { color: colors.primary },
                    ]}
                  >
                    {m.label}
                  </Text>
                  <Text style={styles.optionSub}>{m.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Observations, reasons for discrepancy, action taken…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Button
              title={saving ? "Saving…" : "Save Stock Check"}
              onPress={handleSave}
              disabled={saving}
            />
          </View>

          <View style={{ height: 60 }} />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  optionLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  optionSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  varianceCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  varianceTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  varianceDetail: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});
