import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiPigFlocks, type ApiPigFlock } from "@/lib/hooks/useApiPigFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate() { return new Date().toISOString().split("T")[0]; }

const CATEGORIES = [
  "PRRS", "PCV2 / Circovirus", "Enzootic Pneumonia (MH)", "Erysipelas / PPV",
  "E. coli / Clostridial", "APP", "Swine Influenza", "PED", "Other",
];

const CATEGORY_PRODUCTS: Record<string, string[]> = {
  "PRRS": ["Ingelvac PRRS MLV", "Porcilis PRRS", "Fostera PRRS", "Amervac PRRS", "Other — enter manually"],
  "PCV2 / Circovirus": ["Ingelvac CircoFLEX", "Circovac", "Porcilis PCV AD", "Suvaxyn MH+PCV2", "Other — enter manually"],
  "Enzootic Pneumonia (MH)": ["Ingelvac M.hyo. IDAL", "Hyoresp", "Suvaxyn MH-One", "Stellamune Mycoplasma", "Other — enter manually"],
  "Erysipelas / PPV": ["Eryseng Parvo", "Porcilis Ery+Parvo", "Suvaxyn Ery+Parvo", "Other — enter manually"],
  "E. coli / Clostridial": ["Porcilis ColiClos", "Neocolipor", "Suiseng", "Other — enter manually"],
  "APP": ["Porcilis APP", "Coglapix", "Other — enter manually"],
  "Swine Influenza": ["Respiporc FluCombi", "Porcilis Flu", "Suvaxyn Flu", "Other — enter manually"],
  "PED": ["Porcilis PED", "Other — enter manually"],
  "Other": ["Other — enter manually"],
};

const ROUTES = ["Intramuscular (IM)", "Subcutaneous (SC)", "Intradermal (ID)", "Intranasal", "Oral", "In-water"];
const AGE_GROUPS = ["Sows / Gilts", "Boars", "Piglets / Suckling", "Weaners", "Growers", "Finishers", "All pigs"];

function Chip({ label, selected, onPress, color }: { label: string; selected: boolean; onPress: () => void; color?: string }) {
  const bg = color ?? "#db2777";
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && { backgroundColor: bg, borderColor: bg }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function PigVaccinationRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading } = useApiPigFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [herdId, setHerdId] = useState("");
  const [vaccinationDate, setVaccinationDate] = useState(todayDate());
  const [vaccinationCategory, setVaccinationCategory] = useState("");
  const [vaccineProduct, setVaccineProduct] = useState("");
  const [customProduct, setCustomProduct] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [ageGroupTreated, setAgeGroupTreated] = useState("");
  const [numberTreated, setNumberTreated] = useState("");
  const [doseVolumeMl, setDoseVolumeMl] = useState("");
  const [administrationRoute, setAdministrationRoute] = useState("Intramuscular (IM)");
  const [withdrawalPeriodDays, setWithdrawalPeriodDays] = useState("0");
  const [nextDueDate, setNextDueDate] = useState("");
  const [administeredBy, setAdministeredBy] = useState(user?.name || "");
  const [vetPrescribed, setVetPrescribed] = useState(false);
  const [notes, setNotes] = useState("");

  const productOptions = CATEGORY_PRODUCTS[vaccinationCategory] ?? [];
  const isCustomProduct = vaccineProduct === "Other — enter manually";
  const resolvedProduct = isCustomProduct ? customProduct.trim() : vaccineProduct;

  const handleSave = async () => {
    if (!vaccinationDate.trim()) { Alert.alert("Date required", "Please enter the vaccination date."); return; }
    if (!vaccinationCategory.trim()) { Alert.alert("Category required", "Please select a disease category."); return; }
    if (!resolvedProduct) { Alert.alert("Product required", "Please select or enter the vaccine product."); return; }
    if (!numberTreated.trim()) { Alert.alert("Count required", "Please enter the number of pigs treated."); return; }

    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "pig-vaccination-record",
        herdId: herdId ? Number(herdId) : null,
        vaccinationDate,
        vaccinationCategory,
        vaccineProduct: resolvedProduct,
        batchNumber: batchNumber || null,
        expiryDate: expiryDate || null,
        ageGroupTreated: ageGroupTreated || null,
        numberTreated: Number(numberTreated),
        doseVolumeMl: doseVolumeMl || null,
        administrationRoute,
        withdrawalPeriodDays: Number(withdrawalPeriodDays) || 0,
        nextDueDate: nextDueDate || null,
        administeredBy: administeredBy || null,
        vetPrescribed,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/pig-vaccination-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const msg = Number(withdrawalPeriodDays) > 0
        ? `\n\nWithdrawal period: ${withdrawalPeriodDays} days — do not send pigs for slaughter before the withdrawal date.`
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
        <Text style={styles.headerTitle}>Pig Vaccination Record</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Herd / Group</Text>
        {flocksLoading ? <Text style={styles.hint}>Loading herds…</Text> : flocks.length > 0 ? (
          <View style={styles.chips}>
            {flocks.map((f: ApiPigFlock) => <Chip key={String(f.id)} label={f.flockName ?? "Herd"} selected={herdId === String(f.id)} onPress={() => { Haptics.selectionAsync(); setHerdId(String(f.id)); }} />)}
          </View>
        ) : <Text style={styles.hint}>No pig herds found. Herds are set up in the dashboard under Livestock → Herds & Animals.</Text>}

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

        <Text style={styles.sectionTitle}>Age Group Treated</Text>
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
            <Input value={doseVolumeMl} onChangeText={setDoseVolumeMl} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Withdrawal (days)</Text>
            <Input value={withdrawalPeriodDays} onChangeText={setWithdrawalPeriodDays} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        {Number(withdrawalPeriodDays) > 0 && (
          <View style={styles.warningBanner}>
            <Feather name="alert-triangle" size={14} color="#92400e" />
            <Text style={styles.warningText}>Pigs must not go for slaughter for {withdrawalPeriodDays} days after vaccination</Text>
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
          <Switch value={vetPrescribed} onValueChange={setVetPrescribed} trackColor={{ false: colors.borderLight, true: "#db2777" }} thumbColor="#fff" />
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
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, marginBottom: spacing.sm },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, flex: 1, marginRight: spacing.sm },
  warningBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: "#fef3c7", borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: "#fbbf24" },
  warningText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: "#92400e", flex: 1 },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  saveBtn: { marginTop: spacing.md },
});
