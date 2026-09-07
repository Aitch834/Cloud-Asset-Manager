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
import { useUser } from "@clerk/expo";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const ABR_OPTIONS = ["Negative", "Positive", "Borderline", "Invalid"] as const;
type AbrResult = (typeof ABR_OPTIONS)[number] | "";

const ABR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Negative: { bg: "#f0fdf4", text: "#16a34a", border: "#86efac" },
  Positive: { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" },
  Borderline: { bg: "#fffbeb", text: "#d97706", border: "#fcd34d" },
  Invalid: { bg: "#f9fafb", text: "#6b7280", border: "#d1d5db" },
};

type FormState = {
  collectionDate: string;
  volumeLitres: string;
  collectorName: string;
  vehicleRegistration: string;
  processorRef: string;
  milkTemperatureCelsius: string;
  tempTestedBy: string;
  fatPercentage: string;
  proteinPercentage: string;
  lactosePercentage: string;
  sccCount: string;
  tbcCount: string;
  antibioticResidueTestResult: AbrResult;
  abrTestedBy: string;
  abrTestKitLot: string;
  abrTestKitBatch: string;
  collectionSlipRef: string;
  isOrganicCollection: boolean;
  nonOrganicReason: string;
  isRetest: boolean;
  witnessedBy: string;
  notes: string;
};

const INITIAL: FormState = {
  collectionDate: todayDate(),
  volumeLitres: "",
  collectorName: "",
  vehicleRegistration: "",
  processorRef: "",
  milkTemperatureCelsius: "",
  tempTestedBy: "",
  fatPercentage: "",
  proteinPercentage: "",
  lactosePercentage: "",
  sccCount: "",
  tbcCount: "",
  antibioticResidueTestResult: "",
  abrTestedBy: "",
  abrTestKitLot: "",
  abrTestKitBatch: "",
  collectionSlipRef: "",
  isOrganicCollection: true,
  nonOrganicReason: "",
  isRetest: false,
  witnessedBy: "",
  notes: "",
};

export default function OrganicMilkCollectionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { user } = useUser();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL);

  const set = (k: keyof FormState) => (v: string) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.volumeLitres.trim()) {
      Alert.alert("Volume required", "Please enter the volume collected in litres.");
      return;
    }
    if (!form.isOrganicCollection && !form.nonOrganicReason.trim()) {
      Alert.alert("Reason required", "Please provide a reason why this collection is non-organic (e.g. antibiotic withdrawal).");
      return;
    }

    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "organic-milk-collection",
        collectionDate: form.collectionDate,
        volumeLitres: form.volumeLitres,
        collectorName: form.collectorName || null,
        vehicleRegistration: form.vehicleRegistration || null,
        processorRef: form.processorRef || null,
        milkTemperatureCelsius: form.milkTemperatureCelsius || null,
        tempTestedBy: form.tempTestedBy || null,
        fatPercentage: form.fatPercentage || null,
        proteinPercentage: form.proteinPercentage || null,
        lactosePercentage: form.lactosePercentage || null,
        sccCount: form.sccCount ? Number(form.sccCount) : null,
        tbcCount: form.tbcCount ? Number(form.tbcCount) : null,
        antibioticResidueTestResult: form.antibioticResidueTestResult || null,
        abrTestedBy: form.abrTestedBy || null,
        abrTestKitLot: form.abrTestKitLot || null,
        abrTestKitBatch: form.abrTestKitBatch || null,
        collectionSlipRef: form.collectionSlipRef || null,
        isOrganicCollection: form.isOrganicCollection,
        nonOrganicReason: form.isOrganicCollection ? null : form.nonOrganicReason,
        isRetest: form.isRetest,
        witnessedBy: form.witnessedBy || null,
        recordedByUserName: user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.primaryEmailAddress?.emailAddress || null : null,
        notes: form.notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/organic-dairy/collections`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };

      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "Collection recorded",
        `${form.volumeLitres}L recorded for ${form.collectionDate}. It will sync when connected.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "Failed to save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Milk Collection</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Collection Details</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Collection Date *</Text>
            <Input value={form.collectionDate} onChangeText={set("collectionDate")} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Volume (litres) *</Text>
            <Input value={form.volumeLitres} onChangeText={set("volumeLitres")} placeholder="e.g. 3200" keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Collector / Milk Buyer</Text>
          <Input value={form.collectorName} onChangeText={set("collectorName")} placeholder="e.g. Arla UK Ltd" />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Vehicle Registration</Text>
            <Input value={form.vehicleRegistration} onChangeText={set("vehicleRegistration")} placeholder="e.g. AB12 CDE" autoCapitalize="characters" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Processor Ref</Text>
            <Input value={form.processorRef} onChangeText={set("processorRef")} placeholder="Processor reference" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Temperature & Quality</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Milk Temp (°C)</Text>
            <Input value={form.milkTemperatureCelsius} onChangeText={set("milkTemperatureCelsius")} placeholder="e.g. 4.0" keyboardType="decimal-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Temp Tested By</Text>
            <Input value={form.tempTestedBy} onChangeText={set("tempTestedBy")} placeholder="Name" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Fat %</Text>
            <Input value={form.fatPercentage} onChangeText={set("fatPercentage")} placeholder="e.g. 4.1" keyboardType="decimal-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Protein %</Text>
            <Input value={form.proteinPercentage} onChangeText={set("proteinPercentage")} placeholder="e.g. 3.3" keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Lactose %</Text>
            <Input value={form.lactosePercentage} onChangeText={set("lactosePercentage")} placeholder="e.g. 4.6" keyboardType="decimal-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>SCC (000s/ml)</Text>
            <Input value={form.sccCount} onChangeText={set("sccCount")} placeholder="e.g. 180" keyboardType="number-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>TBC (000s/ml)</Text>
            <Input value={form.tbcCount} onChangeText={set("tbcCount")} placeholder="e.g. 15" keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }} />
        </View>

        <Text style={styles.sectionTitle}>ABR Test</Text>

        <Text style={styles.label}>ABR Result</Text>
        <View style={styles.chipRow}>
          {ABR_OPTIONS.map(opt => {
            const active = form.antibioticResidueTestResult === opt;
            const col = ABR_COLORS[opt];
            return (
              <Pressable
                key={opt}
                style={[styles.chip, active && { backgroundColor: col.bg, borderColor: col.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setForm(p => ({ ...p, antibioticResidueTestResult: active ? "" : opt }));
                }}
              >
                <Text style={[styles.chipText, active && { color: col.text, fontFamily: fonts.semiBold }]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>

        {!!form.antibioticResidueTestResult && form.antibioticResidueTestResult === "Positive" && (
          <View style={styles.warningBox}>
            <Feather name="alert-triangle" size={16} color="#dc2626" style={{ marginTop: 2 }} />
            <Text style={styles.warningText}>Positive ABR result — this collection should not be accepted. Contact your milk buyer immediately.</Text>
          </View>
        )}

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>ABR Tested By</Text>
            <Input value={form.abrTestedBy} onChangeText={set("abrTestedBy")} placeholder="Name" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Kit Lot</Text>
            <Input value={form.abrTestKitLot} onChangeText={set("abrTestKitLot")} placeholder="Lot number" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Kit Batch</Text>
          <Input value={form.abrTestKitBatch} onChangeText={set("abrTestKitBatch")} placeholder="Batch number" />
        </View>

        <Text style={styles.sectionTitle}>Organic Certification</Text>

        <Pressable
          style={[styles.toggleRow, form.isOrganicCollection && styles.toggleRowActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setForm(p => ({ ...p, isOrganicCollection: !p.isOrganicCollection, nonOrganicReason: !p.isOrganicCollection ? "" : p.nonOrganicReason }));
          }}
        >
          <View style={[styles.toggleIndicator, form.isOrganicCollection && styles.toggleIndicatorActive]}>
            {form.isOrganicCollection && <Feather name="check" size={14} color="#fff" />}
          </View>
          <Text style={styles.toggleLabel}>This collection is certified as Organic</Text>
        </Pressable>

        {!form.isOrganicCollection && (
          <View style={styles.warningBox}>
            <Feather name="alert-triangle" size={16} color="#d97706" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.warningText, { color: "#92400e", fontFamily: fonts.semiBold }]}>Non-organic collection — reason required</Text>
              <Input
                value={form.nonOrganicReason}
                onChangeText={set("nonOrganicReason")}
                placeholder="e.g. Antibiotic withdrawal period, conversion milk…"
                multiline
              />
              <Text style={[styles.warningText, { marginTop: spacing.xs, color: "#b45309" }]}>This milk will be sold as conventional. Notify your certifier if this occurs regularly.</Text>
            </View>
          </View>
        )}

        <Pressable
          style={[styles.toggleRow, form.isRetest && styles.toggleRowAmber]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setForm(p => ({ ...p, isRetest: !p.isRetest }));
          }}
        >
          <View style={[styles.toggleIndicator, form.isRetest && styles.toggleIndicatorAmber]}>
            {form.isRetest && <Feather name="check" size={14} color="#fff" />}
          </View>
          <Text style={styles.toggleLabel}>This is a retest of a previous collection</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Traceability</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Collection Docket / Receipt Ref</Text>
          <Input value={form.collectionSlipRef} onChangeText={set("collectionSlipRef")} placeholder="Docket number from tanker driver" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Witnessed By (farm staff at collection)</Text>
          <Input value={form.witnessedBy} onChangeText={set("witnessedBy")} placeholder="Name of staff member present" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <Input value={form.notes} onChangeText={set("notes")} placeholder="Any additional observations" multiline />
        </View>

        <Button
          title={saving ? "Saving…" : "Save Collection Record"}
          onPress={handleSave}
          disabled={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.xs },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.sm,
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
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    marginBottom: spacing.sm,
  },
  toggleRowActive: {
    borderColor: "#16a34a",
    backgroundColor: "#f0fdf4",
  },
  toggleRowAmber: {
    borderColor: "#d97706",
    backgroundColor: "#fffbeb",
  },
  toggleIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  toggleIndicatorActive: {
    borderColor: "#16a34a",
    backgroundColor: "#16a34a",
  },
  toggleIndicatorAmber: {
    borderColor: "#d97706",
    backgroundColor: "#d97706",
  },
  toggleLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  warningBox: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#fbbf24",
    backgroundColor: "#fffbeb",
    marginBottom: spacing.sm,
  },
  warningText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    flex: 1,
  },
  saveBtn: { marginTop: spacing.lg },
});
