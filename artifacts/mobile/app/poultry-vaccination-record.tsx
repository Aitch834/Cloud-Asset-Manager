import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
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

function todayDate() { return new Date().toISOString().split("T")[0]; }

const CATEGORIES = [
  "Newcastle Disease (ND)", "Infectious Bronchitis (IB)", "Marek's Disease",
  "Gumboro / IBD", "Avian Metapneumovirus (aMPV / TRT)", "ILT",
  "EDS", "AE / Fowl Typhoid", "Salmonella", "Mycoplasma (MG)", "Fowl Pox", "Other",
];

const CATEGORY_KEY: Record<string, string> = {
  "Newcastle Disease (ND)": "ND", "Infectious Bronchitis (IB)": "IB", "Marek's Disease": "Marek",
  "Gumboro / IBD": "Gumboro", "Avian Metapneumovirus (aMPV / TRT)": "aMPV", "ILT": "ILT",
  "EDS": "EDS", "AE / Fowl Typhoid": "AE", "Salmonella": "Salmonella",
  "Mycoplasma (MG)": "Mycoplasma", "Fowl Pox": "FowlPox", "Other": "Other",
};

const CATEGORY_PRODUCTS: Record<string, string[]> = {
  "Newcastle Disease (ND)": ["Nobilis ND Clone 30", "Nobilis ND Clone 45", "Nobilis ND Hitchner B1", "Nobilis ND Ma5+Clone30", "Avinew (La Sota)", "Hipraviar Clone 45", "Other — enter manually"],
  "Infectious Bronchitis (IB)": ["Nobilis IB Ma5", "Nobilis IB 4-91", "Nobilis IB H120", "Nobilis IB Multi+Clone30", "Hipraviar IB-H120", "Poulvac IB H52", "Other — enter manually"],
  "Marek's Disease": ["Nobilis Rismavac (HVT+Rispens)", "Nobilis Turkey Herpesvirus (HVT)", "Vectormune HVT NDV", "Rispens/CVI988", "Other — enter manually"],
  "Gumboro / IBD": ["Nobilis Gumboro D78", "Nobilis Gumboro 228E", "Nobilis IBA", "Bursa-Vac", "TAD Gumboro vac", "Other — enter manually"],
  "Avian Metapneumovirus (aMPV / TRT)": ["Nobilis TRT", "Hipraviar TRT-C", "Poulvac TRT", "Other — enter manually"],
  "ILT": ["Nobilis ILT", "TAD Laryngo vac", "Poulvac ILT", "Other — enter manually"],
  "EDS": ["Nobilis EDS", "Other — enter manually"],
  "AE / Fowl Typhoid": ["Nobilis AE+POX", "Poulvac AE Layervax", "Other — enter manually"],
  "Salmonella": ["Nobilis SalENT", "AviPro Salmonella Vac E", "AviPro Salmonella Vac T", "Salenvac (inactivated)", "Salmovac 440", "Other — enter manually"],
  "Mycoplasma (MG)": ["Nobilis MG 6/85", "Biomune MG-F36", "Other — enter manually"],
  "Fowl Pox": ["Nobilis Pox", "Hipraviar Pox", "AE Vac+Pox combo", "Other — enter manually"],
  "Other": ["Other — enter manually"],
};

const ROUTES = ["Drinking water", "Eye drop", "Spray (coarse)", "Spray (fine mist)", "Subcutaneous injection", "Intramuscular injection", "Wing web / stab", "In ovo", "Intranasal"];
const AGE_GROUPS = ["Day-old chicks", "Broilers", "Pullets", "Layers", "Breeders", "Turkeys", "All birds"];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function PoultryVaccinationRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPoultryFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState<number>(0);
  const [flockNumber, setFlockNumber] = useState("");
  const [vaccinationDate, setVaccinationDate] = useState(todayDate());
  const [vaccinationCategory, setVaccinationCategory] = useState("");
  const [vaccineProduct, setVaccineProduct] = useState("");
  const [customProduct, setCustomProduct] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [ageGroupTreated, setAgeGroupTreated] = useState("");
  const [numberTreated, setNumberTreated] = useState("");
  const [doseVolume, setDoseVolume] = useState("");
  const [administrationRoute, setAdministrationRoute] = useState("Drinking water");
  const [withdrawalPeriodDays, setWithdrawalPeriodDays] = useState("0");
  const [nextDueDate, setNextDueDate] = useState("");
  const [administeredBy, setAdministeredBy] = useState(user?.name || "");
  const [vetPrescribed, setVetPrescribed] = useState(false);
  const [notes, setNotes] = useState("");

  const productOptions = CATEGORY_PRODUCTS[vaccinationCategory] ?? [];
  const isCustomProduct = vaccineProduct === "Other — enter manually";
  const resolvedProduct = isCustomProduct ? customProduct.trim() : vaccineProduct;

  const handleSave = async () => {
    if (!flockNumber.trim()) { Alert.alert("Flock required", "Please select a flock."); return; }
    if (!vaccinationDate.trim()) { Alert.alert("Date required", "Please enter the vaccination date."); return; }
    if (!vaccinationCategory.trim()) { Alert.alert("Category required", "Please select a disease category."); return; }
    if (!resolvedProduct) { Alert.alert("Product required", "Please select or enter the vaccine product."); return; }
    if (!numberTreated.trim()) { Alert.alert("Count required", "Please enter the number of birds treated."); return; }

    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "poultry-vaccination-record",
        flockId: flockId || null,
        vaccinationDate,
        vaccinationCategory: CATEGORY_KEY[vaccinationCategory] ?? vaccinationCategory,
        vaccineProduct: resolvedProduct,
        batchNumber: batchNumber || null,
        expiryDate: expiryDate || null,
        ageGroupTreated: ageGroupTreated || null,
        numberTreated: Number(numberTreated),
        doseVolume: doseVolume || null,
        administrationRoute,
        withdrawalPeriodDays: Number(withdrawalPeriodDays) || 0,
        nextDueDate: nextDueDate || null,
        administeredBy: administeredBy || null,
        vetPrescribed,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/poultry-vaccination-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const msg = Number(withdrawalPeriodDays) > 0
        ? `\n\nWithdrawal period: ${withdrawalPeriodDays} days — do not send birds for slaughter before the withdrawal date.`
        : "";
      Alert.alert("Vaccination recorded", `${resolvedProduct} (${vaccinationCategory}) saved and queued for sync.${msg}`, [
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Save failed", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Poultry Vaccination Record</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Flock</Text>
        <FlockPicker label="Select Flock *" value={flockNumber} onChange={setFlockNumber} onChangeFlock={(f) => setFlockId(f.id)} flocks={flocks} loading={flocksLoading} fromCache={fromCache} error={flocksError} />

        <Text style={styles.sectionTitle}>Disease Category *</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => <Chip key={c} label={c} selected={vaccinationCategory === c} onPress={() => { Haptics.selectionAsync(); setVaccinationCategory(c); setVaccineProduct(""); setCustomProduct(""); }} />)}
        </View>

        {vaccinationCategory !== "" && (
          <>
            <Text style={styles.sectionTitle}>Vaccine Product *</Text>
            <View style={styles.chips}>
              {productOptions.map((p) => <Chip key={p} label={p} selected={vaccineProduct === p} onPress={() => { Haptics.selectionAsync(); setVaccineProduct(p); }} />)}
            </View>
            {isCustomProduct && (
              <View style={styles.field}>
                <Text style={styles.label}>Product Name (manual entry) *</Text>
                <Input value={customProduct} onChangeText={setCustomProduct} placeholder="Enter vaccine product name" />
              </View>
            )}
          </>
        )}

        <Text style={styles.sectionTitle}>Age Group</Text>
        <View style={styles.chips}>
          {AGE_GROUPS.map((g) => <Chip key={g} label={g} selected={ageGroupTreated === g} onPress={() => { Haptics.selectionAsync(); setAgeGroupTreated(g); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Product Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Batch Number</Text>
            <Input value={batchNumber} onChangeText={setBatchNumber} placeholder="Batch ref" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Expiry Date</Text>
            <Input value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Administration</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Vaccination Date *</Text>
            <Input value={vaccinationDate} onChangeText={setVaccinationDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Number Treated *</Text>
            <Input value={numberTreated} onChangeText={setNumberTreated} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Dose Volume (ml)</Text>
            <Input value={doseVolume} onChangeText={setDoseVolume} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Withdrawal (days)</Text>
            <Input value={withdrawalPeriodDays} onChangeText={setWithdrawalPeriodDays} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        {Number(withdrawalPeriodDays) > 0 && (
          <View style={styles.warningBanner}>
            <Feather name="alert-triangle" size={14} color="#92400e" />
            <Text style={styles.warningText}>Birds must not go for slaughter for {withdrawalPeriodDays} days after vaccination</Text>
          </View>
        )}
        <Text style={styles.label}>Administration Route</Text>
        <View style={styles.chips}>
          {ROUTES.map((r) => <Chip key={r} label={r} selected={administrationRoute === r} onPress={() => { Haptics.selectionAsync(); setAdministrationRoute(r); }} />)}
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Next Due Date</Text>
            <Input value={nextDueDate} onChangeText={setNextDueDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Administered By</Text>
            <Input value={administeredBy} onChangeText={setAdministeredBy} placeholder="Name" />
          </View>
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Vet Prescribed (POM-V product)</Text>
          <Switch value={vetPrescribed} onValueChange={setVetPrescribed} trackColor={{ false: colors.borderLight, true: "#d97706" }} thumbColor="#fff" />
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Vaccination Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
        <View style={{ height: insets.bottom + spacing.xxxl }} />
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
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: "#d97706", borderColor: "#d97706" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, marginBottom: spacing.sm },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, flex: 1, marginRight: spacing.sm },
  warningBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: "#fef3c7", borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: "#fbbf24" },
  warningText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: "#92400e", flex: 1 },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  saveBtn: { marginTop: spacing.md },
});
