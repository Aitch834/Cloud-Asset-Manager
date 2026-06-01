import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { SmallRuminantPicker } from "@/components/ui/SmallRuminantPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiSheepFlocks } from "@/lib/hooks/useApiSheepFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

const PRODUCT_CATEGORIES = ["Allopathic", "Homeopathic", "Phytotherapy", "Vaccination", "Antibiotic", "NSAID / Analgesic", "Anthelmintic", "Other"];
const ROUTES_OF_ADMIN = ["Oral", "Injection — IM", "Injection — IV", "Injection — SC", "Topical", "Pour-on", "Intramammary", "Other"];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.borderLight, true: "#15803d" }} thumbColor="#fff" />
    </View>
  );
}

export default function OrganicSheepTreatmentScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache: flocksCached, error: flocksError } = useApiSheepFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [treatmentDate, setTreatmentDate] = useState(todayDate());
  const [flockGroup, setFlockGroup] = useState("");
  const [animalLisTags, setAnimalLisTags] = useState("");
  const [numberOfAnimals, setNumberOfAnimals] = useState("");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [activeIngredient, setActiveIngredient] = useState("");
  const [doseAmount, setDoseAmount] = useState("");
  const [routeOfAdministration, setRouteOfAdministration] = useState("");
  const [vetName, setVetName] = useState("");
  const [prescriptionRef, setPrescriptionRef] = useState("");
  const [standardMilkWithdrawalDays, setStandardMilkWithdrawalDays] = useState("");
  const [standardMeatWithdrawalDays, setStandardMeatWithdrawalDays] = useState("");
  const [certifierNotified, setCertifierNotified] = useState(false);
  const [notes, setNotes] = useState("");

  const doubledMilkWithdrawalDays = standardMilkWithdrawalDays ? String(Number(standardMilkWithdrawalDays) * 2) : "";
  const doubledMeatWithdrawalDays = standardMeatWithdrawalDays ? String(Number(standardMeatWithdrawalDays) * 2) : "";
  const milkWithdrawalEndDate = doubledMilkWithdrawalDays ? addDays(treatmentDate, Number(doubledMilkWithdrawalDays)) : "";
  const meatWithdrawalEndDate = doubledMeatWithdrawalDays ? addDays(treatmentDate, Number(doubledMeatWithdrawalDays)) : "";

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert("Product required", "Please enter the medicine product name.");
      return;
    }
    if (!treatmentDate.trim()) {
      Alert.alert("Treatment date required", "Please enter the date of treatment.");
      return;
    }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "organic-sheep-treatment",
        treatmentDate,
        flockGroup: flockGroup || null,
        animalLisTags: animalLisTags || null,
        numberOfAnimals: numberOfAnimals ? Number(numberOfAnimals) : null,
        productName,
        productCategory: productCategory || null,
        activeIngredient: activeIngredient || null,
        doseAmount: doseAmount || null,
        routeOfAdministration: routeOfAdministration || null,
        vetName: vetName || null,
        prescriptionRef: prescriptionRef || null,
        standardMilkWithdrawalDays: standardMilkWithdrawalDays ? Number(standardMilkWithdrawalDays) : null,
        doubledMilkWithdrawalDays: doubledMilkWithdrawalDays ? Number(doubledMilkWithdrawalDays) : null,
        standardMeatWithdrawalDays: standardMeatWithdrawalDays ? Number(standardMeatWithdrawalDays) : null,
        doubledMeatWithdrawalDays: doubledMeatWithdrawalDays ? Number(doubledMeatWithdrawalDays) : null,
        milkWithdrawalEndDate: milkWithdrawalEndDate || null,
        meatWithdrawalEndDate: meatWithdrawalEndDate || null,
        certifierNotified,
        treatmentNumber: 1,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/organic-sheep-dairy/treatments`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Treatment recorded",
        milkWithdrawalEndDate
          ? `${productName} recorded. Organic milk withdrawal ends ${milkWithdrawalEndDate} (doubled withdrawal).`
          : `${productName} recorded. Will sync when connected.`,
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
        <Text style={styles.headerTitle}>Organic Sheep Treatment</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.orgWarning}>
          <Feather name="alert-circle" size={14} color="#92400e" />
          <Text style={styles.orgWarningText}>Organic rules require doubled withdrawal periods for all allopathic medicines. Notify your certifier after any allopathic treatment.</Text>
        </View>

        <Text style={styles.sectionTitle}>Treatment Details</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Treatment Date *</Text>
            <Input value={treatmentDate} onChangeText={setTreatmentDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Number of Animals</Text>
            <Input value={numberOfAnimals} onChangeText={setNumberOfAnimals} placeholder="e.g. 3" keyboardType="number-pad" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Animal LIS Tags</Text>
          <Input value={animalLisTags} onChangeText={setAnimalLisTags} placeholder="e.g. UK123 456789, UK123 456790" multiline />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Flock / Group</Text>
          <SmallRuminantPicker species="sheep" value={flockGroup} onChange={setFlockGroup} flocks={flocks} loading={flocksLoading} fromCache={flocksCached} error={flocksError} />
        </View>

        <Text style={styles.sectionTitle}>Medicine</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Product Name *</Text>
          <Input value={productName} onChangeText={setProductName} placeholder="e.g. Pen & Strep" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Active Ingredient</Text>
          <Input value={activeIngredient} onChangeText={setActiveIngredient} placeholder="e.g. Procaine benzylpenicillin" />
        </View>

        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.chips}>
          {PRODUCT_CATEGORIES.map(c => (
            <Chip key={c} label={c} selected={productCategory === c} onPress={() => setProductCategory(c === productCategory ? "" : c)} />
          ))}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Dose</Text>
            <Input value={doseAmount} onChangeText={setDoseAmount} placeholder="e.g. 5ml/kg" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Route</Text>
            <View style={styles.chips}>
              {ROUTES_OF_ADMIN.slice(0, 4).map(r => (
                <Chip key={r} label={r} selected={routeOfAdministration === r} onPress={() => setRouteOfAdministration(r === routeOfAdministration ? "" : r)} />
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Withdrawal Periods (Organic — Doubled)</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Standard Milk W/D (days)</Text>
            <Input value={standardMilkWithdrawalDays} onChangeText={setStandardMilkWithdrawalDays} placeholder="e.g. 4" keyboardType="number-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Doubled Milk W/D (days)</Text>
            <Input value={doubledMilkWithdrawalDays} editable={false} placeholder="Auto-calculated" style={styles.readOnly} />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Standard Meat W/D (days)</Text>
            <Input value={standardMeatWithdrawalDays} onChangeText={setStandardMeatWithdrawalDays} placeholder="e.g. 8" keyboardType="number-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Doubled Meat W/D (days)</Text>
            <Input value={doubledMeatWithdrawalDays} editable={false} placeholder="Auto-calculated" style={styles.readOnly} />
          </View>
        </View>

        {!!(milkWithdrawalEndDate || meatWithdrawalEndDate) && (
          <View style={styles.withdrawalBox}>
            {!!milkWithdrawalEndDate && <Text style={styles.withdrawalText}>🥛 Milk clear: {milkWithdrawalEndDate}</Text>}
            {!!meatWithdrawalEndDate && <Text style={styles.withdrawalText}>🥩 Meat clear: {meatWithdrawalEndDate}</Text>}
          </View>
        )}

        <Text style={styles.sectionTitle}>Vet Details</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Prescribing Vet</Text>
            <Input value={vetName} onChangeText={setVetName} placeholder="Vet name" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Prescription Ref</Text>
            <Input value={prescriptionRef} onChangeText={setPrescriptionRef} placeholder="Rx reference" />
          </View>
        </View>

        <ToggleRow label="Certifier Notified" value={certifierNotified} onChange={setCertifierNotified} />

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <Input value={notes} onChangeText={setNotes} placeholder="Diagnosis, clinical signs, outcome…" multiline numberOfLines={3} />
        </View>

        <Button title={saving ? "Saving…" : "Save Treatment Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  orgWarning: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs, backgroundColor: "#fef3c7", borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  orgWarningText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#92400e", flex: 1 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surface },
  chipSelected: { backgroundColor: "#15803d", borderColor: "#15803d" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  readOnly: { backgroundColor: colors.borderLight + "44" },
  withdrawalBox: { backgroundColor: "#dcfce7", borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm, gap: spacing.xs },
  withdrawalText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: "#15803d" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, marginBottom: spacing.xs },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  saveBtn: { marginTop: spacing.md },
});
