import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { PigPenPicker } from "@/components/ui/PigPenPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiPigFlocks } from "@/lib/hooks/useApiPigFlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PigMedicineTreatment } from "@/lib/types";

const ROUTES = ["Oral", "Injection — IM", "Injection — SC", "Injection — IV", "In-feed", "In-water", "Topical", "Other"];
const DIAGNOSES = [
  "Respiratory disease", "Enteric / scour", "Bacterial infection", "Lameness",
  "Swine dysentery", "PRRS", "Streptococcal meningitis", "PCV2",
  "Post-weaning multisystemic wasting", "Routine prophylaxis", "Other",
];
const UNITS = ["ml", "mg", "g", "kg", "IU", "doses"];

export default function PigMedicineTreatmentScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPigFlocks(currentFarm?.id);
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("pig-medicine", currentFarm?.id, user?.id);
  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState<number>(0);
  const [groupName, setGroupName] = useState("");
  const [treatmentDate, setTreatmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [batchOrPenRef, setBatchOrPenRef] = useState("");
  const [numberOfAnimals, setNumberOfAnimals] = useState("1");
  const [medicineProductName, setMedicineProductName] = useState("");
  const [activeIngredient, setActiveIngredient] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [productBatchNumber, setProductBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [administrationRoute, setAdministrationRoute] = useState("Injection — IM");
  const [quantityUsed, setQuantityUsed] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("ml");
  const [diagnosisReason, setDiagnosisReason] = useState("");
  const [prescribingVetName, setPrescribingVetName] = useState("");
  const [prescribingVetPractice, setPrescribingVetPractice] = useState("");
  const [prescriptionObtained, setPrescriptionObtained] = useState(false);
  const [administeredBy, setAdministeredBy] = useState(user?.name || "");
  const [withdrawalPeriodMeatDays, setWithdrawalPeriodMeatDays] = useState("");
  const [withdrawalEndDate, setWithdrawalEndDate] = useState("");
  const [notes, setNotes] = useState("");

  const calcWithdrawalDate = (days: string) => {
    const d = parseInt(days, 10);
    if (!isNaN(d) && d > 0) {
      const date = new Date();
      date.setDate(date.getDate() + d);
      setWithdrawalEndDate(date.toISOString().split("T")[0]);
    }
  };

  const handleSave = async () => {
    if (!medicineProductName.trim()) { Alert.alert("Required", "Please enter the medicine product name."); return; }
    if (!diagnosisReason.trim()) { Alert.alert("Required", "Please select or enter the diagnosis / reason."); return; }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PigMedicineTreatment = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockId,
      treatmentDate,
      batchOrPenRef: batchOrPenRef.trim() || groupName.trim(),
      numberOfAnimals: numberOfAnimals.trim(),
      medicineProductName: medicineProductName.trim(),
      activeIngredient: activeIngredient.trim(),
      manufacturer: manufacturer.trim(),
      productBatchNumber: productBatchNumber.trim(),
      expiryDate: expiryDate.trim(),
      administrationRoute,
      quantityUsed: quantityUsed.trim(),
      unitOfMeasure,
      diagnosisReason: diagnosisReason.trim(),
      prescribingVetName: prescribingVetName.trim(),
      prescribingVetPractice: prescribingVetPractice.trim(),
      prescriptionObtained,
      administeredBy: administeredBy.trim(),
      withdrawalPeriodMeatDays: withdrawalPeriodMeatDays.trim(),
      withdrawalEndDate: withdrawalEndDate.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PIG_MEDICINE_TREATMENTS, record);
    await refreshPendingCount();
    setSaving(false);

    const wdMsg = withdrawalEndDate ? `\n\n⚠️ Withdrawal period clear date: ${withdrawalEndDate}. Pigs must not go to slaughter before this date.` : "";
    Alert.alert("Saved", `Medicine treatment record saved.${wdMsg}`, [
      { text: "Record Another", onPress: () => {
        setMedicineProductName(""); setActiveIngredient(""); setManufacturer("");
        setProductBatchNumber(""); setQuantityUsed(""); setDiagnosisReason("");
        setWithdrawalPeriodMeatDays(""); setWithdrawalEndDate(""); setNotes("");
      }},
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Medicine Treatment</Text>
        <View style={{ width: 36 }} />
      </View>

      <IdentifierBanner
        justSaved={justSaved && !identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={!cphNumber}
        sbiMissing={!sbiNumber}
        context="pig medicine records"
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.sectionLabel}>
            <Feather name="grid" size={14} color="#db2777" />
            <Text style={styles.sectionTitle}>Group / Pen &amp; Date</Text>
          </View>
          <PigPenPicker label="Select Group (optional)" value={groupName} onChange={setGroupName} onChangeFlock={(f) => setFlockId(f.id)} flocks={flocks} loading={flocksLoading} fromCache={fromCache} error={flocksError} />
          <Input label="Treatment Date *" placeholder="YYYY-MM-DD" maxDate="today" value={treatmentDate} onChangeText={setTreatmentDate} required />
          <View style={styles.row}>
            <Input label="Batch / Pen Ref" placeholder="e.g. Pen 4, Batch 12" value={batchOrPenRef} onChangeText={setBatchOrPenRef} containerStyle={styles.flex} />
            <Input label="Number of Animals *" placeholder="e.g. 20" value={numberOfAnimals} onChangeText={setNumberOfAnimals} keyboardType="number-pad" containerStyle={styles.flex} />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Diagnosis / Reason</Text>
          </View>
          <View style={styles.chipRow}>
            {DIAGNOSES.map((d) => (
              <Pressable key={d} onPress={() => { Haptics.selectionAsync(); setDiagnosisReason(d); }} style={[styles.chip, diagnosisReason === d && styles.chipError]}>
                <Text style={[styles.chipText, diagnosisReason === d && styles.chipTextInverse]}>{d}</Text>
              </Pressable>
            ))}
          </View>
          {!DIAGNOSES.includes(diagnosisReason) && (
            <Input label="Custom Diagnosis" placeholder="Describe the condition" value={diagnosisReason} onChangeText={setDiagnosisReason} />
          )}

          <View style={styles.sectionLabel}>
            <Feather name="package" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Medicine Details</Text>
          </View>
          <Input label="Product Name *" placeholder="e.g. Amoxinsol 50, Draxxin" value={medicineProductName} onChangeText={setMedicineProductName} required />
          <Input label="Active Ingredient" placeholder="e.g. Amoxicillin" value={activeIngredient} onChangeText={setActiveIngredient} />
          <Input label="Manufacturer" placeholder="e.g. Zoetis, MSD Animal Health" value={manufacturer} onChangeText={setManufacturer} />
          <View style={styles.row}>
            <Input label="Batch Number" placeholder="e.g. BN456789" value={productBatchNumber} onChangeText={setProductBatchNumber} containerStyle={styles.flex} />
            <Input label="Expiry Date" placeholder="YYYY-MM-DD" value={expiryDate} onChangeText={setExpiryDate} containerStyle={styles.flex} />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="activity" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Administration</Text>
          </View>
          <View style={styles.chipRow}>
            {ROUTES.map((r) => (
              <Pressable key={r} onPress={() => { Haptics.selectionAsync(); setAdministrationRoute(r); }} style={[styles.chip, administrationRoute === r && styles.chipPrimary]}>
                <Text style={[styles.chipText, administrationRoute === r && styles.chipTextInverse]}>{r}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}>
            <Input label="Quantity Used *" placeholder="e.g. 10" value={quantityUsed} onChangeText={setQuantityUsed} keyboardType="decimal-pad" containerStyle={styles.flex} />
            <View style={styles.flex}>
              <Text style={styles.inputLabel}>Unit</Text>
              <View style={styles.unitRow}>
                {UNITS.map((u) => (
                  <Pressable key={u} onPress={() => { Haptics.selectionAsync(); setUnitOfMeasure(u); }} style={[styles.unitChip, unitOfMeasure === u && styles.unitChipSelected]}>
                    <Text style={[styles.unitText, unitOfMeasure === u && styles.unitTextSelected]}>{u}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
          <Input label="Administered By" placeholder="Operator name" value={administeredBy} onChangeText={setAdministeredBy} />

          <View style={styles.sectionLabel}>
            <Feather name="user" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Veterinary Authority</Text>
          </View>
          <Input label="Prescribing Vet Name" placeholder="e.g. Dr. A. Smith" value={prescribingVetName} onChangeText={setPrescribingVetName} />
          <Input label="Vet Practice" placeholder="e.g. Farm Vet Partnership" value={prescribingVetPractice} onChangeText={setPrescribingVetPractice} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="file-text" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Written prescription obtained</Text>
            </View>
            <Switch value={prescriptionObtained} onValueChange={(v) => { Haptics.selectionAsync(); setPrescriptionObtained(v); }} trackColor={{ false: colors.border, true: colors.primaryMuted }} thumbColor={prescriptionObtained ? colors.primary : colors.textTertiary} />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="clock" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Withdrawal Period</Text>
          </View>
          <Input
            label="Meat Withdrawal (days)"
            placeholder="e.g. 28"
            value={withdrawalPeriodMeatDays}
            onChangeText={(v) => { setWithdrawalPeriodMeatDays(v); calcWithdrawalDate(v); }}
            keyboardType="number-pad"
          />
          <Input label="Withdrawal Clear Date" placeholder="Auto-calculated or YYYY-MM-DD" value={withdrawalEndDate} onChangeText={setWithdrawalEndDate} />
          {withdrawalEndDate ? (
            <View style={styles.warningBanner}>
              <Feather name="alert-triangle" size={14} color="#92400e" />
              <Text style={styles.warningText}>Pigs must not go to slaughter before {withdrawalEndDate}</Text>
            </View>
          ) : null}

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input label="Additional Notes" placeholder="Clinical signs observed, response to treatment…" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

          <Button title="Save Treatment Record" onPress={handleSave} loading={saving} fullWidth icon="check" />
          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.sm },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipError: { backgroundColor: colors.error, borderColor: colors.error },
  chipPrimary: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextInverse: { color: colors.textInverse },
  inputLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  unitRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  unitChip: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  unitChipSelected: { backgroundColor: "#db2777", borderColor: "#db2777" },
  unitText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.text },
  unitTextSelected: { color: colors.textInverse },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  toggleInfo: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  warningBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: "#fef3c7", borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: "#fbbf24" },
  warningText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: "#92400e", flex: 1 },
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
});
