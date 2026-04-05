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

type MeterType = "electricity" | "gas" | "lpg_mains" | "other";
type ReadingType = "actual" | "estimated";

const METER_TYPES: { key: MeterType; label: string; unit: string }[] = [
  { key: "electricity", label: "Electricity", unit: "kWh" },
  { key: "gas", label: "Natural Gas", unit: "m³" },
  { key: "lpg_mains", label: "LPG (mains meter)", unit: "m³" },
  { key: "other", label: "Other Energy", unit: "units" },
];

const READING_TYPES: { key: ReadingType; label: string }[] = [
  { key: "actual", label: "Actual — meter read directly" },
  { key: "estimated", label: "Estimated — calculated from usage" },
];

export default function FuelMeterReadingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [meterName, setMeterName] = useState("");
  const [meterReference, setMeterReference] = useState("");
  const [meterType, setMeterType] = useState<MeterType>("electricity");
  const [currentReading, setCurrentReading] = useState("");
  const [previousReading, setPreviousReading] = useState("");
  const [readingType, setReadingType] = useState<ReadingType>("actual");
  const [recordedBy, setRecordedBy] = useState(user?.name || "");
  const [notes, setNotes] = useState("");

  const selectedMeterType = METER_TYPES.find((m) => m.key === meterType)!;

  const consumptionSinceLast =
    currentReading && previousReading
      ? Math.max(0, parseFloat(currentReading) - parseFloat(previousReading)).toFixed(1)
      : "";

  const handleSave = async () => {
    if (!meterName.trim()) {
      Alert.alert("Required", "Please enter the meter name or location.");
      return;
    }
    if (!currentReading.trim()) {
      Alert.alert("Required", "Please enter the current meter reading.");
      return;
    }
    if (isNaN(parseFloat(currentReading))) {
      Alert.alert("Invalid", "Current reading must be a number.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      meterName: meterName.trim(),
      meterReference: meterReference.trim(),
      meterType,
      readingDate: today,
      currentReading: currentReading.trim(),
      previousReading: previousReading.trim(),
      consumptionSinceLast,
      unit: selectedMeterType.unit,
      readingType,
      recordedBy: recordedBy.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.FUEL_METER_READINGS, record, currentFarm?.id);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Reading Saved",
      consumptionSinceLast
        ? `Consumption since last reading: ${consumptionSinceLast} ${selectedMeterType.unit}`
        : "Meter reading recorded successfully.",
      [{ text: "Done", onPress: () => router.back() }]
    );
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
          <Text style={styles.title}>Grid Energy Meter Reading</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meter Details</Text>
            <Input
              label="Meter Name / Location"
              value={meterName}
              onChangeText={setMeterName}
              placeholder="e.g. Main farm supply, Grain store, Dairy unit"
              autoCapitalize="words"
            />
            <Input
              label="Meter Reference / MPAN / MPRN"
              value={meterReference}
              onChangeText={setMeterReference}
              placeholder="Meter serial number or supply number"
            />
            <Input
              label="Recorded By"
              value={recordedBy}
              onChangeText={setRecordedBy}
              placeholder="Your name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meter Type</Text>
            {METER_TYPES.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => setMeterType(m.key)}
                style={[
                  styles.option,
                  meterType === m.key && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + "12",
                  },
                ]}
              >
                <View style={[styles.radio, meterType === m.key && { borderColor: colors.primary }]}>
                  {meterType === m.key && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <Text style={[styles.optionLabel, meterType === m.key && { color: colors.primary }]}>
                  {m.label}
                  <Text style={styles.optionSub}> — readings in {m.unit}</Text>
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Readings ({selectedMeterType.unit})
            </Text>
            <Input
              label={`Current Reading (${selectedMeterType.unit})`}
              value={currentReading}
              onChangeText={setCurrentReading}
              placeholder="e.g. 48321.4"
              keyboardType="decimal-pad"
            />
            <Input
              label={`Previous Reading (${selectedMeterType.unit})`}
              value={previousReading}
              onChangeText={setPreviousReading}
              placeholder="Leave blank if this is the first reading"
              keyboardType="decimal-pad"
            />
            {consumptionSinceLast !== "" && (
              <View style={styles.consumptionCard}>
                <Feather name="zap" size={16} color={colors.primary} />
                <Text style={styles.consumptionLabel}>Consumption since last reading</Text>
                <Text style={styles.consumptionValue}>
                  {consumptionSinceLast} {selectedMeterType.unit}
                </Text>
              </View>
            )}
            <Input
              label="Reading Date"
              value={today}
              editable={false}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reading Type</Text>
            {READING_TYPES.map((r) => (
              <Pressable
                key={r.key}
                onPress={() => setReadingType(r.key)}
                style={[
                  styles.option,
                  readingType === r.key && {
                    borderColor: colors.success,
                    backgroundColor: colors.success + "12",
                  },
                ]}
              >
                <View
                  style={[styles.radio, readingType === r.key && { borderColor: colors.success }]}
                >
                  {readingType === r.key && (
                    <View style={[styles.radioInner, { backgroundColor: colors.success }]} />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    readingType === r.key && { color: colors.success },
                  ]}
                >
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Tariff changes, supply issues, fault observations…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Button
              title={saving ? "Saving…" : "Save Meter Reading"}
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
    flex: 1,
  },
  optionSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  consumptionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary + "15",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + "33",
  },
  consumptionLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  consumptionValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.primary,
  },
});
