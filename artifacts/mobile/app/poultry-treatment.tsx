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
import { FlockPicker } from "@/components/ui/FlockPicker";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiPoultryFlocks } from "@/lib/hooks/useApiPoultryFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PoultryTreatment } from "@/lib/types";

const ROUTES = ["In-water", "In-feed", "Oral", "Injection — IM", "Injection — SC", "Injection — IV", "Topical", "Other"];
const CONDITIONS = [
  "Respiratory disease", "Enteric disease", "Bacterial infection", "Viral infection",
  "Coccidiosis", "Mycoplasma", "Newcastle disease control", "Other",
];

export default function PoultryTreatmentScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPoultryFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState<number>(0);
  const [flockNumber, setFlockNumber] = useState("");
  const [treatmentDate, setTreatmentDate] = useState(new Date().toISOString().split("T")[0]);
  const [numberOfBirdsTreated, setNumberOfBirdsTreated] = useState("");
  const [productName, setProductName] = useState("");
  const [activeIngredient, setActiveIngredient] = useState("");
  const [condition, setCondition] = useState("");
  const [routeOfAdministration, setRouteOfAdministration] = useState("In-water");
  const [doseRate, setDoseRate] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [administeredBy, setAdministeredBy] = useState(user?.name || "");
  const [prescribingVetName, setPrescribingVetName] = useState("");
  const [prescribingVetPractice, setPrescribingVetPractice] = useState("");
  const [prescriptionObtained, setPrescriptionObtained] = useState(false);
  const [withdrawalPeriodDays, setWithdrawalPeriodDays] = useState("");
  const [withdrawalClearDate, setWithdrawalClearDate] = useState("");
  const [notes, setNotes] = useState("");

  const calcWithdrawalDate = (days: string) => {
    const d = parseInt(days, 10);
    if (!isNaN(d) && d > 0) {
      const date = new Date();
      date.setDate(date.getDate() + d);
      setWithdrawalClearDate(date.toISOString().split("T")[0]);
    }
  };

  const handleSave = async () => {
    if (!flockNumber.trim()) { Alert.alert("Required", "Please select a flock."); return; }
    if (!productName.trim()) { Alert.alert("Required", "Please enter the product name."); return; }
    if (!condition.trim()) { Alert.alert("Required", "Please select the condition being treated."); return; }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PoultryTreatment = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockId,
      flockNumber: flockNumber.trim(),
      treatmentDate,
      numberOfBirdsTreated: numberOfBirdsTreated.trim(),
      productName: productName.trim(),
      activeIngredient: activeIngredient.trim(),
      condition: condition.trim(),
      routeOfAdministration,
      doseRate: doseRate.trim(),
      durationDays: durationDays.trim(),
      batchNumber: batchNumber.trim(),
      expiryDate: expiryDate.trim(),
      administeredBy: administeredBy.trim(),
      prescribingVetName: prescribingVetName.trim(),
      prescribingVetPractice: prescribingVetPractice.trim(),
      prescriptionObtained,
      withdrawalPeriodDays: withdrawalPeriodDays.trim(),
      withdrawalClearDate: withdrawalClearDate.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.POULTRY_TREATMENTS, record);
    await refreshPendingCount();
    setSaving(false);

    const withdrawalMsg = withdrawalClearDate
      ? `\n\nWithdrawal period clear date: ${withdrawalClearDate}. Do not send birds for slaughter before this date.`
      : "";
    Alert.alert("Saved", `Treatment record saved and queued for sync.${withdrawalMsg}`, [
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Poultry Treatment</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.sectionLabel}>
            <Feather name="feather" size={14} color="#d97706" />
            <Text style={styles.sectionTitle}>Flock &amp; Date</Text>
          </View>
          <FlockPicker label="Select Flock *" value={flockNumber} onChange={setFlockNumber} onChangeFlock={(f) => setFlockId(f.id)} flocks={flocks} loading={flocksLoading} fromCache={fromCache} error={flocksError} />
          <Input label="Treatment Date *" placeholder="YYYY-MM-DD" value={treatmentDate} onChangeText={setTreatmentDate} required />
          <Input label="Number of Birds Treated" placeholder="e.g. 5000" value={numberOfBirdsTreated} onChangeText={setNumberOfBirdsTreated} keyboardType="number-pad" />

          <View style={styles.sectionLabel}>
            <Feather name="package" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Condition Being Treated</Text>
          </View>
          <View style={styles.chipRow}>
            {CONDITIONS.map((c) => (
              <Pressable key={c} onPress={() => { Haptics.selectionAsync(); setCondition(c); }} style={[styles.chip, condition === c && styles.chipError]}>
                <Text style={[styles.chipText, condition === c && styles.chipTextInverse]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="package" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Product Details</Text>
          </View>
          <Input label="Product Name *" placeholder="e.g. Baytril 10%, Colistin" value={productName} onChangeText={setProductName} required />
          <Input label="Active Ingredient" placeholder="e.g. Enrofloxacin" value={activeIngredient} onChangeText={setActiveIngredient} />
          <Input label="Batch Number" placeholder="e.g. BN123456" value={batchNumber} onChangeText={setBatchNumber} />
          <Input label="Expiry Date" placeholder="YYYY-MM-DD" value={expiryDate} onChangeText={setExpiryDate} />

          <View style={styles.sectionLabel}>
            <Feather name="activity" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Administration</Text>
          </View>
          <View style={styles.chipRow}>
            {ROUTES.map((r) => (
              <Pressable key={r} onPress={() => { Haptics.selectionAsync(); setRouteOfAdministration(r); }} style={[styles.chip, routeOfAdministration === r && styles.chipPrimary]}>
                <Text style={[styles.chipText, routeOfAdministration === r && styles.chipTextInverse]}>{r}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}>
            <Input label="Dose Rate" placeholder="e.g. 10mg/kg" value={doseRate} onChangeText={setDoseRate} containerStyle={styles.flex} />
            <Input label="Duration (days)" placeholder="e.g. 5" value={durationDays} onChangeText={setDurationDays} keyboardType="number-pad" containerStyle={styles.flex} />
          </View>
          <Input label="Administered By" placeholder="Operator name" value={administeredBy} onChangeText={setAdministeredBy} />

          <View style={styles.sectionLabel}>
            <Feather name="user" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Veterinary Details</Text>
          </View>
          <Input label="Prescribing Vet Name" placeholder="e.g. Dr. Jane Smith" value={prescribingVetName} onChangeText={setPrescribingVetName} />
          <Input label="Vet Practice" placeholder="e.g. Country Vets Ltd" value={prescribingVetPractice} onChangeText={setPrescribingVetPractice} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="file-text" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Prescription obtained</Text>
            </View>
            <Switch value={prescriptionObtained} onValueChange={(v) => { Haptics.selectionAsync(); setPrescriptionObtained(v); }} trackColor={{ false: colors.border, true: colors.primaryMuted }} thumbColor={prescriptionObtained ? colors.primary : colors.textTertiary} />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="clock" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Withdrawal Period</Text>
          </View>
          <Input
            label="Withdrawal Period (days)"
            placeholder="e.g. 14"
            value={withdrawalPeriodDays}
            onChangeText={(v) => { setWithdrawalPeriodDays(v); calcWithdrawalDate(v); }}
            keyboardType="number-pad"
          />
          <Input label="Withdrawal Clear Date" placeholder="Auto-calculated or enter YYYY-MM-DD" value={withdrawalClearDate} onChangeText={setWithdrawalClearDate} />
          {withdrawalClearDate ? (
            <View style={styles.warningBanner}>
              <Feather name="alert-triangle" size={14} color="#92400e" />
              <Text style={styles.warningText}>Birds must not go for slaughter before {withdrawalClearDate}</Text>
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
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  toggleInfo: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  warningBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: "#fef3c7", borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: "#fbbf24" },
  warningText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: "#92400e", flex: 1 },
});
