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
import { useAuth } from "@/lib/auth";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.borderLight, true: "#15803d" }} thumbColor="#fff" />
    </View>
  );
}

const ABR_OPTIONS = ["Negative", "Positive", "Borderline", "Invalid"] as const;
type AbrResult = (typeof ABR_OPTIONS)[number] | "";

const ABR_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Negative: { bg: "#f0fdf4", text: "#16a34a", border: "#86efac" },
  Positive: { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" },
  Borderline: { bg: "#fffbeb", text: "#d97706", border: "#fcd34d" },
  Invalid: { bg: "#f9fafb", text: "#6b7280", border: "#d1d5db" },
};

export default function OrganicGoatMilkCollectionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const [collectionDate, setCollectionDate] = useState(todayDate());
  const [volumeLitres, setVolumeLitres] = useState("");
  const [collectorName, setCollectorName] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [processorRef, setProcessorRef] = useState("");
  const [milkTemperatureCelsius, setMilkTemperatureCelsius] = useState("");
  const [tempTestedBy, setTempTestedBy] = useState("");
  const [fatPercentage, setFatPercentage] = useState("");
  const [proteinPercentage, setProteinPercentage] = useState("");
  const [lactosePercentage, setLactosePercentage] = useState("");
  const [sccCount, setSccCount] = useState("");
  const [tbcCount, setTbcCount] = useState("");
  const [antibioticResidueTestResult, setAntibioticResidueTestResult] = useState<AbrResult>("");
  const [abrTestedBy, setAbrTestedBy] = useState("");
  const [abrTestKitLot, setAbrTestKitLot] = useState("");
  const [abrTestKitBatch, setAbrTestKitBatch] = useState("");
  const [collectionSlipRef, setCollectionSlipRef] = useState("");
  const [isOrganicCollection, setIsOrganicCollection] = useState(true);
  const [nonOrganicReason, setNonOrganicReason] = useState("");
  const [organicPremiumPence, setOrganicPremiumPence] = useState("");
  const [isRetest, setIsRetest] = useState(false);
  const [witnessedBy, setWitnessedBy] = useState("");
  const [notes, setNotes] = useState("");

  const sccWarning = sccCount && Number(sccCount) > 1000;

  const handleSave = async () => {
    if (!volumeLitres.trim()) {
      Alert.alert("Volume required", "Please enter the volume collected in litres.");
      return;
    }
    if (!isOrganicCollection && !nonOrganicReason.trim()) {
      Alert.alert("Reason required", "Please provide a reason why this collection is non-organic.");
      return;
    }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "organic-goat-milk-collection",
        collectionDate,
        volumeLitres,
        collectorName: collectorName || null,
        vehicleRegistration: vehicleRegistration || null,
        processorRef: processorRef || null,
        milkTemperatureCelsius: milkTemperatureCelsius || null,
        tempTestedBy: tempTestedBy || null,
        fatPercentage: fatPercentage || null,
        proteinPercentage: proteinPercentage || null,
        lactosePercentage: lactosePercentage || null,
        sccCount: sccCount ? Number(sccCount) : null,
        tbcCount: tbcCount ? Number(tbcCount) : null,
        antibioticResidueTestResult: antibioticResidueTestResult || null,
        abrTestedBy: abrTestedBy || null,
        abrTestKitLot: abrTestKitLot || null,
        abrTestKitBatch: abrTestKitBatch || null,
        collectionSlipRef: collectionSlipRef || null,
        isOrganicCollection,
        nonOrganicReason: isOrganicCollection ? null : nonOrganicReason,
        organicPremiumPence: organicPremiumPence ? Number(organicPremiumPence) : null,
        isRetest,
        witnessedBy: witnessedBy || null,
        recordedByUserName: user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || null : null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/organic-goat-dairy/collections`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Collection recorded",
        `${volumeLitres}L recorded for ${collectionDate}. Will sync when connected.`,
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
        <Text style={styles.headerTitle}>Organic Goat Milk Collection</Text>
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
            <Input value={collectionDate} onChangeText={setCollectionDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Volume (litres) *</Text>
            <Input value={volumeLitres} onChangeText={setVolumeLitres} placeholder="e.g. 420" keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Collector / Milk Buyer</Text>
          <Input value={collectorName} onChangeText={setCollectorName} placeholder="e.g. Delamere Dairy" />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Vehicle Registration</Text>
            <Input value={vehicleRegistration} onChangeText={setVehicleRegistration} placeholder="e.g. AB12 CDE" autoCapitalize="characters" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Processor Ref</Text>
            <Input value={processorRef} onChangeText={setProcessorRef} placeholder="Processor reference" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Temperature & Quality</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Milk Temp (°C)</Text>
            <Input value={milkTemperatureCelsius} onChangeText={setMilkTemperatureCelsius} placeholder="e.g. 4.0" keyboardType="decimal-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Temp Tested By</Text>
            <Input value={tempTestedBy} onChangeText={setTempTestedBy} placeholder="Name" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Fat %</Text>
            <Input value={fatPercentage} onChangeText={setFatPercentage} placeholder="e.g. 4.8" keyboardType="decimal-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Protein %</Text>
            <Input value={proteinPercentage} onChangeText={setProteinPercentage} placeholder="e.g. 3.5" keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Lactose %</Text>
            <Input value={lactosePercentage} onChangeText={setLactosePercentage} placeholder="e.g. 4.4" keyboardType="decimal-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>SCC (k/mL)</Text>
            <Input value={sccCount} onChangeText={setSccCount} placeholder="limit 1,000k" keyboardType="number-pad" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>TBC (k/mL)</Text>
            <Input value={tbcCount} onChangeText={setTbcCount} placeholder="e.g. 25" keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }} />
        </View>

        {!!sccWarning && (
          <View style={styles.warning}>
            <Feather name="alert-triangle" size={14} color="#92400e" />
            <Text style={styles.warningText}>SCC exceeds the 1,000k/mL regulatory limit for organic goat milk — collection may be rejected</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>ABR Test</Text>

        <Text style={styles.label}>ABR Result</Text>
        <View style={styles.chipRow}>
          {ABR_OPTIONS.map(opt => {
            const active = antibioticResidueTestResult === opt;
            const col = ABR_COLORS[opt];
            return (
              <Pressable
                key={opt}
                style={[styles.chip, active && { backgroundColor: col.bg, borderColor: col.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAntibioticResidueTestResult(active ? "" : opt);
                }}
              >
                <Text style={[styles.chipText, active && { color: col.text, fontFamily: fonts.semiBold }]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>

        {antibioticResidueTestResult === "Positive" && (
          <View style={styles.positiveWarning}>
            <Feather name="alert-triangle" size={14} color="#dc2626" />
            <Text style={styles.positiveWarningText}>Positive ABR result — contact your milk buyer immediately.</Text>
          </View>
        )}

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>ABR Tested By</Text>
            <Input value={abrTestedBy} onChangeText={setAbrTestedBy} placeholder="Name" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Kit Lot</Text>
            <Input value={abrTestKitLot} onChangeText={setAbrTestKitLot} placeholder="Lot number" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Kit Batch</Text>
          <Input value={abrTestKitBatch} onChangeText={setAbrTestKitBatch} placeholder="Batch number" />
        </View>

        <Text style={styles.sectionTitle}>Organic Status</Text>

        <ToggleRow label="This is an organic collection" value={isOrganicCollection} onChange={setIsOrganicCollection} />

        {!isOrganicCollection && (
          <View style={styles.field}>
            <Text style={styles.label}>Reason for Non-Organic Collection *</Text>
            <Input value={nonOrganicReason} onChangeText={setNonOrganicReason} placeholder="e.g. Antibiotic withdrawal period" multiline numberOfLines={2} />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Organic Premium (pence/litre)</Text>
          <Input value={organicPremiumPence} onChangeText={setOrganicPremiumPence} placeholder="e.g. 10" keyboardType="number-pad" />
        </View>

        <ToggleRow label="This is a retest of a previous collection" value={isRetest} onChange={setIsRetest} />

        <Text style={styles.sectionTitle}>References</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Collection Slip Ref</Text>
            <Input value={collectionSlipRef} onChangeText={setCollectionSlipRef} placeholder="Docket number" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Witnessed By</Text>
            <Input value={witnessedBy} onChangeText={setWitnessedBy} placeholder="Name" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />
        </View>

        <Button title={saving ? "Saving…" : "Save Collection Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.surface },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.xs },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  chipText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  warning: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: "#fef3c7", borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  warningText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#92400e", flex: 1 },
  positiveWarning: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: "#fef2f2", borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  positiveWarningText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#dc2626", flex: 1 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, marginBottom: spacing.xs },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  saveBtn: { marginTop: spacing.md },
});
