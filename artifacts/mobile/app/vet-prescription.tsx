import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { HerdPicker } from "@/components/ui/HerdPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiHerds } from "@/lib/hooks/useApiHerds";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { VetPrescription } from "@/lib/types";

const DOSE_UNITS = ["ml", "mg", "g", "tablets", "IU", "other"];
const ROUTES = ["Oral", "Injection IM", "Injection IV", "Injection SC", "Topical", "Intramammary", "Intrauterine", "Eye/Ear", "Other"];
const QTY_UNITS = ["ml", "mg", "g", "tablets", "vials", "tubes", "sachets"];

export default function VetPrescriptionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { herds, loading: herdsLoading, fromCache: herdsCached, error: herdsError } = useApiHerds(currentFarm?.id);
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [herdName, setHerdName] = useState("");
  const [prescribingVet, setPrescribingVet] = useState("");
  const [vetPracticeName, setVetPracticeName] = useState("");
  const [vetRcvsNumber, setVetRcvsNumber] = useState("");
  const [prescriptionDate, setPrescriptionDate] = useState(today);
  const [expiryDate, setExpiryDate] = useState("");
  const [drugName, setDrugName] = useState("");
  const [drugSpecies, setDrugSpecies] = useState("");
  const [dose, setDose] = useState("");
  const [doseUnit, setDoseUnit] = useState("ml");
  const [route, setRoute] = useState("Injection IM");
  const [duration, setDuration] = useState("");
  const [withdrawalMeat, setWithdrawalMeat] = useState("");
  const [withdrawalMilk, setWithdrawalMilk] = useState("");
  const [quantityPrescribed, setQuantityPrescribed] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("ml");
  const [prescriptionReference, setPrescriptionReference] = useState("");
  const [clinicalReason, setClinicalReason] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!drugName.trim() || !prescribingVet.trim()) {
      Alert.alert("Required Fields", "Please enter the drug name and prescribing vet.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let documentUrl: string | undefined;
    if (photoUri) {
      try {
        const apiBase = getApiBase();
        const objectPath = await uploadPhotoToStorage(photoUri, apiBase, "prescription-document.jpg");
        if (objectPath) documentUrl = objectPath;
      } catch { /* best-effort */ }
    }

    const record: VetPrescription = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      herdName: herdName.trim(),
      prescribingVet: prescribingVet.trim(),
      vetPracticeName: vetPracticeName.trim(),
      vetRcvsNumber: vetRcvsNumber.trim(),
      prescriptionDate,
      expiryDate: expiryDate.trim(),
      drugName: drugName.trim(),
      drugSpecies: drugSpecies.trim(),
      dose: dose.trim(),
      doseUnit,
      route,
      duration: duration.trim(),
      withdrawalMeat: withdrawalMeat.trim(),
      withdrawalMilk: withdrawalMilk.trim(),
      quantityPrescribed: quantityPrescribed.trim(),
      quantityUnit,
      prescriptionReference: prescriptionReference.trim(),
      clinicalReason: clinicalReason.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.VET_PRESCRIPTIONS, { ...record, documentUrl } as VetPrescription);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Veterinary prescription saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Veterinary Prescription</Text>
            <Text style={styles.subtitle}>Log a vet-written prescription for audit trail</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {herdsCached && (
            <View style={styles.offlineBanner}>
              <Feather name="wifi-off" size={14} color={colors.accent} />
              <Text style={styles.offlineText}>Offline — using cached herd list</Text>
            </View>
          )}

          <View style={styles.warningBanner}>
            <Feather name="alert-triangle" size={14} color={colors.accent} />
            <Text style={styles.warningText}>This form records a prescription issued by a vet. It does not replace the original prescription document — retain the original for audit.</Text>
          </View>

          <Text style={styles.sectionTitle}>Vet Details</Text>
          <Input label="Prescribing Vet Name *" value={prescribingVet} onChangeText={setPrescribingVet} placeholder="Full name" />
          <Input label="Veterinary Practice" value={vetPracticeName} onChangeText={setVetPracticeName} placeholder="Practice name" />
          <Input label="RCVS Registration Number" value={vetRcvsNumber} onChangeText={setVetRcvsNumber} placeholder="e.g. 1234567" keyboardType="numeric" />
          <Input label="Prescription Date" maxDate="today" value={prescriptionDate} onChangeText={setPrescriptionDate} placeholder="YYYY-MM-DD" />
          <Input label="Prescription Expiry Date" value={expiryDate} onChangeText={setExpiryDate} placeholder="YYYY-MM-DD" />
          <Input label="Prescription Reference Number" value={prescriptionReference} onChangeText={setPrescriptionReference} placeholder="Vet's reference" />

          <Text style={styles.sectionTitle}>Animal / Herd</Text>
          <HerdPicker herds={herds} loading={herdsLoading} fromCache={herdsCached} error={herdsError} value={herdName} onChange={setHerdName} />
          <Input label="Species / Target Animal" value={drugSpecies} onChangeText={setDrugSpecies} placeholder="e.g. Cattle, Sheep, Pigs" />

          <Text style={styles.sectionTitle}>Drug Details</Text>
          <Input label="Drug / Product Name *" value={drugName} onChangeText={setDrugName} placeholder="Full product name" />
          <Input label="Clinical Reason / Diagnosis" value={clinicalReason} onChangeText={setClinicalReason} placeholder="Reason for prescription" multiline numberOfLines={2} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Dose" value={dose} onChangeText={setDose} placeholder="Amount" keyboardType="decimal-pad" />
            </View>
            <View style={{ width: 110 }}>
              <Text style={styles.label}>Unit</Text>
              <View style={styles.chipRow}>
                {DOSE_UNITS.map((u) => (
                  <Pressable key={u} onPress={() => setDoseUnit(u)} style={[styles.chip, doseUnit === u && styles.chipActive]}>
                    <Text style={[styles.chipText, doseUnit === u && styles.chipTextActive]}>{u}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Text style={styles.label}>Administration Route</Text>
          <View style={styles.chipRow}>
            {ROUTES.map((r) => (
              <Pressable key={r} onPress={() => setRoute(r)} style={[styles.chip, route === r && styles.chipActive]}>
                <Text style={[styles.chipText, route === r && styles.chipTextActive]}>{r}</Text>
              </Pressable>
            ))}
          </View>

          <Input label="Treatment Duration" value={duration} onChangeText={setDuration} placeholder="e.g. 5 days, 3 doses" />

          <Text style={styles.sectionTitle}>Withdrawal Periods</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Meat Withdrawal (days)" value={withdrawalMeat} onChangeText={setWithdrawalMeat} placeholder="0" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Milk Withdrawal (days)" value={withdrawalMilk} onChangeText={setWithdrawalMilk} placeholder="0" keyboardType="numeric" />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Quantity Prescribed</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Quantity" value={quantityPrescribed} onChangeText={setQuantityPrescribed} placeholder="Amount" keyboardType="decimal-pad" />
            </View>
            <View style={{ width: 110 }}>
              <Text style={styles.label}>Unit</Text>
              <View style={styles.chipRow}>
                {QTY_UNITS.map((u) => (
                  <Pressable key={u} onPress={() => setQuantityUnit(u)} style={[styles.chip, quantityUnit === u && styles.chipActive]}>
                    <Text style={[styles.chipText, quantityUnit === u && styles.chipTextActive]}>{u}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Additional information…" multiline numberOfLines={3} />

          <PhotoAttachButton
            photoUri={photoUri}
            onPhotoSelected={setPhotoUri}
            label="Attach Prescription Document"
            promptTitle="Photograph Prescription"
          />

          <Button title={saving ? "Saving…" : "Save Prescription"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  offlineBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.warningBg, padding: spacing.sm, borderRadius: radius.md },
  offlineText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.accent },
  warningBanner: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: "#FEF3C7", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: "#FDE68A" },
  warningText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#92400E", lineHeight: 20 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  saveButton: { marginTop: spacing.lg },
});
