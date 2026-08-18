import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiSheepFlocks } from "@/lib/hooks/useApiSheepFlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate() { return new Date().toISOString().split("T")[0]; }

const CATEGORIES = ["Clostridial", "Pasteurella", "Footrot", "Orf", "MV / Maedi Visna", "Ectoparasites", "Combination", "Other"];
const ROUTES = ["Subcutaneous (SC)", "Intramuscular (IM)", "Intranasal", "Oral", "Pour-On"];
const AGE_CLASSES = ["Lambs", "Hoggets", "Ewes", "Rams", "All Stock"];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function SheepVaccinationRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading } = useApiSheepFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const farmId = currentFarm?.id;
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(farmId);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("sheep-vaccination", farmId, user?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));

  const [flockId, setFlockId] = useState("");
  const [vaccinationDate, setVaccinationDate] = useState(todayDate());
  const [vaccineProduct, setVaccineProduct] = useState("");
  const [category, setCategory] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [numberTreated, setNumberTreated] = useState("");
  const [ageClass, setAgeClass] = useState("Ewes");
  const [doseVolume, setDoseVolume] = useState("");
  const [route, setRoute] = useState("Subcutaneous (SC)");
  const [withdrawalDays, setWithdrawalDays] = useState("0");
  const [nextDueDate, setNextDueDate] = useState("");
  const [administeredBy, setAdministeredBy] = useState("");
  const [vetPrescribed, setVetPrescribed] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!vaccinationDate.trim()) { Alert.alert("Date required", "Please enter the vaccination date."); return; }
    if (!vaccineProduct.trim()) { Alert.alert("Product required", "Please enter the vaccine product name."); return; }
    if (!numberTreated.trim()) { Alert.alert("Count required", "Please enter the number treated."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "sheep-vaccination-record",
        flockId: flockId ? Number(flockId) : null,
        vaccinationDate,
        vaccineProduct,
        vaccinationCategory: category || null,
        batchNumber: batchNumber || null,
        expiryDate: expiryDate || null,
        numberTreated: Number(numberTreated),
        ageClassTreated: ageClass,
        doseVolumeMl: doseVolume ? Number(doseVolume) : null,
        administrationRoute: route || null,
        withdrawalPeriodDays: withdrawalDays ? Number(withdrawalDays) : 0,
        nextDueDate: nextDueDate || null,
        administeredBy: administeredBy || null,
        vetPrescribed,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/sheep-vaccination-programmes`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Vaccination recorded", `${vaccineProduct} — withdrawal ${withdrawalDays ?? 0} days. Syncs when connected.`, [{ text: "Done", onPress: () => router.back() }]);
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
        <Text style={styles.headerTitle}>Sheep Vaccination Record</Text>
        <View style={{ width: 36 }} />
      </View>
      <IdentifierBanner
        justSaved={justSaved}
        loading={identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={!cphNumber}
        sbiMissing={!sbiNumber}
        context="vaccination records"
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Flock</Text>
        {flocksLoading ? <Text style={styles.hint}>Loading flocks…</Text> : flocks.length > 0 ? (
          <View style={styles.chips}>
            {flocks.map((f) => <Chip key={String(f.id)} label={f.name ?? "Flock"} selected={flockId === String(f.id)} onPress={() => { Haptics.selectionAsync(); setFlockId(String(f.id)); }} />)}
          </View>
        ) : <Text style={styles.hint}>No sheep flocks found.</Text>}

        <Text style={styles.sectionTitle}>Vaccine Category</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => <Chip key={c} label={c} selected={category === c} onPress={() => { Haptics.selectionAsync(); setCategory(c); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Age Class Treated</Text>
        <View style={styles.chips}>
          {AGE_CLASSES.map((c) => <Chip key={c} label={c} selected={ageClass === c} onPress={() => { Haptics.selectionAsync(); setAgeClass(c); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Product Details</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Vaccine Product *</Text>
          <Input value={vaccineProduct} onChangeText={setVaccineProduct} placeholder="e.g. Heptavac-P Plus" />
        </View>
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
            <Input value={withdrawalDays} onChangeText={setWithdrawalDays} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <Text style={styles.label}>Route</Text>
        <View style={styles.chips}>
          {ROUTES.map((r) => <Chip key={r} label={r} selected={route === r} onPress={() => { Haptics.selectionAsync(); setRoute(r); }} />)}
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
          <Text style={styles.toggleLabel}>Vet Prescribed / SQP Authorised</Text>
          <Switch value={vetPrescribed} onValueChange={setVetPrescribed} trackColor={{ false: colors.borderLight, true: "#15803d" }} thumbColor="#fff" />
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Vaccination Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  chipSelected: { backgroundColor: "#15803d", borderColor: "#15803d" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, marginBottom: spacing.sm },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, flex: 1, marginRight: spacing.sm },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  saveBtn: { marginTop: spacing.md },
});
