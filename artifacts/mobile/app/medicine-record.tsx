import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
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
import type { MedicineRecord } from "@/lib/types";
import { usePrint } from "@/lib/hooks/usePrint";
import { medicineRecordHtml } from "@/lib/printTemplates";

const ROUTES = [
  { key: "oral", label: "Oral", icon: "droplet" as const },
  { key: "injection", label: "Injection", icon: "activity" as const },
  { key: "topical", label: "Topical", icon: "edit-2" as const },
  { key: "eye-ear", label: "Eye/Ear", icon: "eye" as const },
  { key: "other", label: "Other", icon: "more-horizontal" as const },
];

function calcWithdrawalEnd(days: string): string {
  const d = parseInt(days, 10);
  if (!d || d <= 0) return "";
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date.toISOString().split("T")[0];
}

export default function MedicineRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const [saving, setSaving] = useState(false);

  const [herdName, setHerdName] = useState("");
  const [animalId, setAnimalId] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [dosage, setDosage] = useState("");
  const [dosageUnit, setDosageUnit] = useState("ml");
  const [administrationRoute, setAdministrationRoute] = useState("");
  const [administeredBy, setAdministeredBy] = useState(user?.name || "");
  const [withdrawalPeriodDays, setWithdrawalPeriodDays] = useState("");
  const [reason, setReason] = useState("");
  const [vetName, setVetName] = useState("");
  const [notes, setNotes] = useState("");

  const withdrawalEndDate = calcWithdrawalEnd(withdrawalPeriodDays);

  const handleSave = async () => {
    if (!herdName.trim() || !medicineName.trim()) {
      Alert.alert("Required Fields", "Please enter the herd/flock name and medicine name.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch (locErr: unknown) {
      console.warn("Location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const record: MedicineRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      herdName: herdName.trim(),
      animalId: animalId.trim(),
      medicineName: medicineName.trim(),
      batchNumber: batchNumber.trim(),
      dosage: dosage.trim(),
      dosageUnit,
      administrationRoute,
      administeredBy: administeredBy.trim(),
      administeredDate: new Date().toISOString(),
      withdrawalPeriodDays: withdrawalPeriodDays.trim(),
      withdrawalEndDate,
      reason: reason.trim(),
      vetName: vetName.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.MEDICINE_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Medicine record saved. Print or save the treatment record?", [
      { text: "Print", onPress: async () => { await print(medicineRecordHtml(record, currentFarm)); router.back(); } },
      { text: "Save PDF", onPress: async () => { await savePdf(medicineRecordHtml(record, currentFarm), "Medicine Record"); router.back(); } },
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Medicine Record</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionLabel}>
            <Feather name="users" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Animal Details</Text>
          </View>
          <Input
            label="Herd / Flock Name"
            placeholder="e.g. Main Dairy Herd, Pen 3 Pigs"
            value={herdName}
            onChangeText={setHerdName}
            required
          />
          <Input
            label="Individual Animal ID (optional)"
            placeholder="e.g. ear tag, CPH number"
            value={animalId}
            onChangeText={setAnimalId}
          />

          <View style={styles.sectionLabel}>
            <Feather name="package" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Medicine Details</Text>
          </View>
          <Input
            label="Medicine / Product Name"
            placeholder="e.g. Penicillin G, Metacam"
            value={medicineName}
            onChangeText={setMedicineName}
            required
          />
          <Input
            label="Batch Number"
            placeholder="e.g. AB123456"
            value={batchNumber}
            onChangeText={setBatchNumber}
          />
          <View style={styles.row}>
            <Input
              label="Dosage"
              placeholder="e.g. 5"
              value={dosage}
              onChangeText={setDosage}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Unit"
              placeholder="ml"
              value={dosageUnit}
              onChangeText={setDosageUnit}
              containerStyle={{ width: 90 }}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="activity" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Administration Route</Text>
          </View>
          <View style={styles.chipRow}>
            {ROUTES.map((r) => (
              <Pressable
                key={r.key}
                onPress={() => { Haptics.selectionAsync(); setAdministrationRoute(r.key); }}
                style={[
                  styles.chip,
                  administrationRoute === r.key && { backgroundColor: colors.error, borderColor: colors.error },
                ]}
              >
                <Feather
                  name={r.icon}
                  size={14}
                  color={administrationRoute === r.key ? colors.textInverse : colors.error}
                />
                <Text style={[styles.chipText, administrationRoute === r.key && { color: colors.textInverse }]}>
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="clock" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Withdrawal & Reason</Text>
          </View>
          <Input
            label="Withdrawal Period (days)"
            placeholder="e.g. 28"
            value={withdrawalPeriodDays}
            onChangeText={setWithdrawalPeriodDays}
            keyboardType="number-pad"
          />
          {withdrawalEndDate ? (
            <View style={styles.withdrawalBanner}>
              <Feather name="alert-circle" size={14} color={colors.warning} />
              <Text style={styles.withdrawalText}>
                Clearance date: <Text style={{ fontFamily: fonts.semiBold }}>{withdrawalEndDate}</Text> — do not sell produce before this date.
              </Text>
            </View>
          ) : null}
          <Input
            label="Reason for Treatment"
            placeholder="e.g. Mastitis treatment, lameness"
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={2}
          />

          <View style={styles.sectionLabel}>
            <Feather name="user" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Administration & Vet</Text>
          </View>
          <Input
            label="Administered By"
            placeholder="Operator name"
            value={administeredBy}
            onChangeText={setAdministeredBy}
          />
          <Input
            label="Prescribing Vet (optional)"
            placeholder="e.g. Dr. Smith"
            value={vetName}
            onChangeText={setVetName}
          />
          <Input
            label="Notes"
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Medicine Record"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  withdrawalBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  withdrawalText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.accent,
    lineHeight: 20,
  },
});
