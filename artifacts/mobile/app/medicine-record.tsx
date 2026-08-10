import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";
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
import { RFIDTagInput } from "@/components/ui/RFIDTagInput";
import { HerdPicker } from "@/components/ui/HerdPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { useSync } from "@/lib/context/SyncContext";
import { useApiHerds } from "@/lib/hooks/useApiHerds";
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
  const { herds, loading: herdsLoading, error: herdsError, fromCache: herdsCached } = useApiHerds(currentFarm?.id);
  const { cphNumber, sbiNumber, loading: identifiersLoading } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("medicine", currentFarm?.id);
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

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
  // ADR fields
  const [adverseReactionSuspected, setAdverseReactionSuspected] = useState(false);
  const [adverseReactionSigns, setAdverseReactionSigns] = useState("");
  const [adverseReactionSeverity, setAdverseReactionSeverity] = useState("");
  const [adverseReactionOnsetHours, setAdverseReactionOnsetHours] = useState("");
  const [adverseReactionOutcome, setAdverseReactionOutcome] = useState("");
  const [reportedToVetDate, setReportedToVetDate] = useState("");

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

    let documentUrl: string | undefined;
    if (photoUri) {
      try {
        const apiBase = getApiBase();
        const objectPath = await uploadPhotoToStorage(photoUri, apiBase, "medicine-document.jpg");
        if (objectPath) documentUrl = objectPath;
      } catch { /* best-effort */ }
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
      adverseReactionSuspected,
      adverseReactionSigns: adverseReactionSigns.trim() || undefined,
      adverseReactionSeverity: adverseReactionSeverity || undefined,
      adverseReactionOnsetHours: adverseReactionOnsetHours.trim() || undefined,
      adverseReactionOutcome: adverseReactionOutcome || undefined,
      reportedToVetDate: reportedToVetDate.trim() || undefined,
    };

    await appendToList(STORAGE_KEYS.MEDICINE_RECORDS, { ...record, documentUrl } as MedicineRecord);
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

      {missingIdentifiers && !bannerDismissed && (
        <Pressable
          onPress={() => router.push("/(tabs)/more")}
          style={styles.identifierBanner}
        >
          <Feather name="alert-triangle" size={15} color="#92400e" />
          <Text style={styles.identifierBannerText}>
            {!cphNumber && !sbiNumber
              ? "CPH and SBI are missing from your farm profile — required for medicine records."
              : !cphNumber
              ? "CPH number is missing from your farm profile — required for medicine records."
              : "SBI number is missing from your farm profile — required for medicine records."}
            {" "}Tap to go to Settings.
          </Text>
          <Pressable
            onPress={(e) => { e.stopPropagation(); dismissBanner(); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Dismiss warning"
          >
            <Feather name="x" size={15} color="#92400e" />
          </Pressable>
        </Pressable>
      )}

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
          <HerdPicker
            value={herdName}
            onChange={setHerdName}
            herds={herds}
            loading={herdsLoading}
            fromCache={herdsCached}
            error={herdsError}
            label="Herd / Flock *"
          />
          <RFIDTagInput
            label="Individual Animal ID (optional)"
            value={animalId}
            onChangeText={setAnimalId}
            onTagScanned={setAnimalId}
            placeholder="e.g. ear tag, CPH number"
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

          <PhotoAttachButton
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            label="Attach Treatment Document"
            promptTitle="Attach Medicine Record Document"
          />

          {/* ── Adverse Drug Reaction ── */}
          <View style={styles.sectionLabel}>
            <Feather name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Adverse Reaction (ADR)</Text>
          </View>

          <Pressable
            onPress={() => { Haptics.selectionAsync(); setAdverseReactionSuspected(v => !v); }}
            style={[
              styles.adrToggle,
              adverseReactionSuspected && { backgroundColor: "#fef2f2", borderColor: "#ef4444" },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.adrToggleLabel, adverseReactionSuspected && { color: "#b91c1c" }]}>
                Suspected adverse reaction?
              </Text>
              <Text style={styles.adrToggleHint}>
                VMR 2013 Reg 58 — tick if this treatment caused unexpected adverse effects
              </Text>
            </View>
            <View style={[styles.adrCheckbox, adverseReactionSuspected && { backgroundColor: "#ef4444", borderColor: "#ef4444" }]}>
              {adverseReactionSuspected && <Feather name="check" size={12} color="#fff" />}
            </View>
          </Pressable>

          {adverseReactionSuspected && (
            <>
              <Input
                label="Clinical Signs Observed"
                placeholder="e.g. anaphylaxis, swelling at injection site, neurological signs"
                value={adverseReactionSigns}
                onChangeText={setAdverseReactionSigns}
                multiline
                numberOfLines={2}
              />

              <View style={styles.sectionLabel}>
                <Text style={[styles.sectionTitle, { color: colors.error }]}>Severity</Text>
              </View>
              <View style={styles.chipRow}>
                {([
                  { key: "mild", label: "Mild" },
                  { key: "moderate", label: "Moderate" },
                  { key: "severe", label: "Severe" },
                  { key: "fatal", label: "Fatal" },
                ] as const).map(s => (
                  <Pressable
                    key={s.key}
                    onPress={() => { Haptics.selectionAsync(); setAdverseReactionSeverity(s.key); }}
                    style={[
                      styles.chip,
                      adverseReactionSeverity === s.key && { backgroundColor: colors.error, borderColor: colors.error },
                    ]}
                  >
                    <Text style={[styles.chipText, adverseReactionSeverity === s.key && { color: colors.textInverse }]}>
                      {s.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Input
                label="Onset (hours after treatment)"
                placeholder="e.g. 2"
                value={adverseReactionOnsetHours}
                onChangeText={setAdverseReactionOnsetHours}
                keyboardType="number-pad"
              />

              <View style={styles.sectionLabel}>
                <Text style={[styles.sectionTitle, { color: colors.error }]}>Outcome</Text>
              </View>
              <View style={styles.chipRow}>
                {([
                  { key: "recovered", label: "Recovered" },
                  { key: "recovering", label: "Recovering" },
                  { key: "not_recovered", label: "Not recovered" },
                  { key: "fatal", label: "Fatal" },
                  { key: "unknown", label: "Unknown" },
                ] as const).map(o => (
                  <Pressable
                    key={o.key}
                    onPress={() => { Haptics.selectionAsync(); setAdverseReactionOutcome(o.key); }}
                    style={[
                      styles.chip,
                      adverseReactionOutcome === o.key && { backgroundColor: colors.error, borderColor: colors.error },
                    ]}
                  >
                    <Text style={[styles.chipText, adverseReactionOutcome === o.key && { color: colors.textInverse }]}>
                      {o.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Input
                label="Date Reported to Vet"
                placeholder="YYYY-MM-DD"
                value={reportedToVetDate}
                onChangeText={setReportedToVetDate}
              />

              <View style={[styles.withdrawalBanner, { borderColor: "#fca5a5" }]}>
                <Feather name="alert-triangle" size={14} color={colors.error} />
                <Text style={[styles.withdrawalText, { color: "#b91c1c" }]}>
                  Serious reactions must be reported to the VMD SARSS portal within 15 days. Non-serious within 90 days. Update the full SARSS reference on the dashboard.
                </Text>
              </View>
            </>
          )}

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
  identifierBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  identifierBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
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
  adrToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  adrToggleLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: 2,
  },
  adrToggleHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  adrCheckbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
