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
import type { ServiceJobRecord } from "@/lib/types";

type RateType = ServiceJobRecord["rateType"];

const JOB_TYPES = [
  "Combining",
  "Baling",
  "Spraying",
  "Drilling",
  "Cultivating",
  "Mowing / Cutting",
  "Transport / Haulage",
  "Spreading",
  "Hedge Cutting",
  "Other",
];

const RATE_TYPES: { key: RateType; label: string }[] = [
  { key: "per_hour", label: "Per Hour" },
  { key: "per_acre", label: "Per Acre" },
  { key: "fixed", label: "Fixed Price" },
  { key: "tbc", label: "TBC" },
];

export default function ServiceJobScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [jobDate, setJobDate] = useState(today);
  const [customerName, setCustomerName] = useState("");
  const [jobType, setJobType] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [equipmentUsed, setEquipmentUsed] = useState("");
  const [rateType, setRateType] = useState<RateType>("per_hour");
  const [rateAmount, setRateAmount] = useState("");
  const [fieldOrLocation, setFieldOrLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [recordedBy, setRecordedBy] = useState(user?.name || "");

  const handleSave = async () => {
    if (!customerName.trim()) {
      Alert.alert("Required Fields", "Please enter the customer / farm name.");
      return;
    }
    if (!jobType.trim()) {
      Alert.alert("Required Fields", "Please select or enter the job type.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: ServiceJobRecord = {
      id: generateId(),
      farmId: currentFarm?.id ? String(currentFarm.id) : "",
      jobDate,
      customerName: customerName.trim(),
      jobType: jobType.trim(),
      hoursWorked: hoursWorked.trim(),
      equipmentUsed: equipmentUsed.trim(),
      rateType,
      rateAmount: rateAmount.trim(),
      fieldOrLocation: fieldOrLocation.trim(),
      notes: notes.trim(),
      recordedBy: recordedBy.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SERVICE_JOB_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Service job saved offline and queued for sync.", [
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
            <Text style={styles.title}>Log Service Job</Text>
            <Text style={styles.subtitle}>Record a contracting or service job completed</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <Text style={styles.sectionTitle}>Job Details</Text>
          <Input label="Job Date" value={jobDate} onChangeText={setJobDate} placeholder="YYYY-MM-DD" />
          <Input
            label="Customer / Farm Name *"
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="e.g. Meadowbrook Farm Ltd"
          />
          <Input
            label="Field / Location"
            value={fieldOrLocation}
            onChangeText={setFieldOrLocation}
            placeholder="e.g. North 40, Church Road farm"
          />

          <Text style={styles.sectionTitle}>Job Type *</Text>
          <View style={styles.chipRow}>
            {JOB_TYPES.map((j) => (
              <Pressable
                key={j}
                onPress={() => setJobType(j)}
                style={[styles.chip, jobType === j && styles.chipActive]}
              >
                <Text style={[styles.chipText, jobType === j && styles.chipTextActive]}>{j}</Text>
              </Pressable>
            ))}
          </View>
          <Input
            label="Or enter job type manually"
            value={JOB_TYPES.includes(jobType) ? "" : jobType}
            onChangeText={setJobType}
            placeholder="Custom job description…"
          />

          <Text style={styles.sectionTitle}>Labour & Equipment</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Hours Worked"
                value={hoursWorked}
                onChangeText={setHoursWorked}
                placeholder="e.g. 8.5"
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Equipment Used"
                value={equipmentUsed}
                onChangeText={setEquipmentUsed}
                placeholder="e.g. Case 8250"
              />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Rate & Pricing</Text>
          <Text style={styles.label}>Rate Type</Text>
          <View style={styles.chipRow}>
            {RATE_TYPES.map((r) => (
              <Pressable
                key={r.key}
                onPress={() => setRateType(r.key)}
                style={[styles.chip, rateType === r.key && styles.chipActive]}
              >
                <Text style={[styles.chipText, rateType === r.key && styles.chipTextActive]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>
          {rateType !== "tbc" && (
            <Input
              label={
                rateType === "per_hour"
                  ? "Rate (£ / hour)"
                  : rateType === "per_acre"
                    ? "Rate (£ / acre)"
                    : "Fixed Price (£)"
              }
              value={rateAmount}
              onChangeText={setRateAmount}
              placeholder="e.g. 95.00"
              keyboardType="decimal-pad"
            />
          )}

          <Text style={styles.sectionTitle}>Sign-off</Text>
          <Input label="Recorded By" value={recordedBy} onChangeText={setRecordedBy} placeholder="Your name" />
          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional details, access instructions, issues encountered…"
            multiline
            numberOfLines={3}
          />

          <View style={styles.infoCard}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={styles.infoText}>
              This job will appear in the Farm Services register on the dashboard once synced, where you can add invoice details and mark it as billed.
            </Text>
          </View>

          <Button title={saving ? "Saving…" : "Save Service Job"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
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
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  infoCard: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary + "40",
    backgroundColor: colors.primary + "08",
    marginTop: spacing.sm,
  },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.primary, flex: 1, lineHeight: 20 },
  saveButton: { marginTop: spacing.lg },
});
