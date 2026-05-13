import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import type { PoultryFciDocument } from "@/lib/types";

export default function PoultryFciScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPoultryFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState<number>(0);
  const [flockNumber, setFlockNumber] = useState("");
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split("T")[0]);
  const [catchingDate, setCatchingDate] = useState(new Date().toISOString().split("T")[0]);
  const [destinationAbattoir, setDestinationAbattoir] = useState("");
  const [numberOfBirds, setNumberOfBirds] = useState("");
  const [catchingContractor, setCatchingContractor] = useState("");
  const [anyDiseaseOrCondition, setAnyDiseaseOrCondition] = useState(false);
  const [diseaseDetails, setDiseaseDetails] = useState("");
  const [medicationsLast7Days, setMedicationsLast7Days] = useState(false);
  const [medicationDetails, setMedicationDetails] = useState("");
  const [withdrawalPeriodClear, setWithdrawalPeriodClear] = useState(true);
  const [lastFeedWithdrawalHours, setLastFeedWithdrawalHours] = useState("");
  const [signedByFarmer, setSignedByFarmer] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!flockNumber.trim()) { Alert.alert("Required", "Please select a flock."); return; }
    if (!numberOfBirds.trim()) { Alert.alert("Required", "Please enter the number of birds."); return; }
    if (!withdrawalPeriodClear && medicationsLast7Days) {
      Alert.alert(
        "Withdrawal Period Warning",
        "You have indicated medication used in the last 7 days AND that the withdrawal period is NOT clear. Birds cannot be sent for slaughter. Do you still want to save this record?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Save Anyway", style: "destructive", onPress: () => doSave() },
        ]
      );
      return;
    }
    await doSave();
  };

  const doSave = async () => {
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PoultryFciDocument = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockId,
      flockNumber: flockNumber.trim(),
      documentDate,
      catchingDate: catchingDate.trim(),
      destinationAbattoir: destinationAbattoir.trim(),
      numberOfBirds: numberOfBirds.trim(),
      catchingContractor: catchingContractor.trim(),
      anyDiseaseOrCondition,
      diseaseDetails: diseaseDetails.trim(),
      medicationsLast7Days,
      medicationDetails: medicationDetails.trim(),
      withdrawalPeriodClear,
      lastFeedWithdrawalHours: lastFeedWithdrawalHours.trim(),
      signedByFarmer,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.POULTRY_FCI_DOCUMENTS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("FCI Document Saved", "Food Chain Information document queued for sync.", [
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>FCI Document</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.infoBox}>
            <Feather name="info" size={14} color={colors.info} />
            <Text style={styles.infoText}>
              Food Chain Information (FCI) must accompany every batch to slaughter under EC 853/2004. Complete this before the birds leave the farm.
            </Text>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="feather" size={14} color="#d97706" />
            <Text style={styles.sectionTitle}>Flock &amp; Dispatch Details</Text>
          </View>
          <FlockPicker label="Select Flock *" value={flockNumber} onChange={setFlockNumber} onChangeFlock={(f) => { setFlockId(f.id); if (!numberOfBirds) setNumberOfBirds(String(f.placementCount || "")); }} flocks={flocks} loading={flocksLoading} fromCache={fromCache} error={flocksError} />
          <Input label="Document Date *" placeholder="YYYY-MM-DD" maxDate="today" value={documentDate} onChangeText={setDocumentDate} required />
          <Input label="Catching Date" placeholder="YYYY-MM-DD" maxDate="today" value={catchingDate} onChangeText={setCatchingDate} />
          <Input label="Destination Abattoir / Slaughterhouse" placeholder="Name and address" value={destinationAbattoir} onChangeText={setDestinationAbattoir} />
          <Input label="Number of Birds *" placeholder="e.g. 20000" value={numberOfBirds} onChangeText={setNumberOfBirds} keyboardType="number-pad" required />
          <Input label="Catching Contractor" placeholder="Company name" value={catchingContractor} onChangeText={setCatchingContractor} />

          <View style={styles.sectionLabel}>
            <Feather name="alert-triangle" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Health Declaration</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="activity" size={16} color={colors.textSecondary} />
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>Disease or abnormal condition?</Text>
                <Text style={styles.toggleSubLabel}>Any notifiable disease, welfare concern or abnormality affecting this flock</Text>
              </View>
            </View>
            <Switch value={anyDiseaseOrCondition} onValueChange={(v) => { Haptics.selectionAsync(); setAnyDiseaseOrCondition(v); }} trackColor={{ false: colors.border, true: "#fee2e2" }} thumbColor={anyDiseaseOrCondition ? colors.error : colors.textTertiary} />
          </View>
          {anyDiseaseOrCondition && (
            <Input label="Disease / Condition Details" placeholder="Nature of disease, when identified, actions taken…" value={diseaseDetails} onChangeText={setDiseaseDetails} multiline numberOfLines={2} />
          )}

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="package" size={16} color={colors.textSecondary} />
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>Medications in last 7 days?</Text>
                <Text style={styles.toggleSubLabel}>Any veterinary medicines administered in the 7 days before catching</Text>
              </View>
            </View>
            <Switch value={medicationsLast7Days} onValueChange={(v) => { Haptics.selectionAsync(); setMedicationsLast7Days(v); }} trackColor={{ false: colors.border, true: "#fee2e2" }} thumbColor={medicationsLast7Days ? colors.error : colors.textTertiary} />
          </View>
          {medicationsLast7Days && (
            <Input label="Medication Details" placeholder="Product name, last dose date, withdrawal period…" value={medicationDetails} onChangeText={setMedicationDetails} multiline numberOfLines={2} />
          )}

          <View style={[styles.toggleRow, !withdrawalPeriodClear && styles.toggleRowDanger]}>
            <View style={styles.toggleInfo}>
              <Feather name="clock" size={16} color={colors.textSecondary} />
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>Withdrawal period clear?</Text>
                <Text style={styles.toggleSubLabel}>All withdrawal periods have been observed — birds are safe to slaughter</Text>
              </View>
            </View>
            <Switch value={withdrawalPeriodClear} onValueChange={(v) => { Haptics.selectionAsync(); setWithdrawalPeriodClear(v); }} trackColor={{ false: "#fecaca", true: colors.primaryMuted }} thumbColor={withdrawalPeriodClear ? colors.primary : colors.error} />
          </View>
          {!withdrawalPeriodClear && (
            <View style={styles.dangerBanner}>
              <Feather name="alert-octagon" size={14} color="#7f1d1d" />
              <Text style={styles.dangerText}>⚠️ Withdrawal period NOT clear — these birds cannot be legally slaughtered for human consumption until all withdrawal periods have elapsed.</Text>
            </View>
          )}

          <View style={styles.sectionLabel}>
            <Feather name="clock" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Feed Withdrawal</Text>
          </View>
          <Input label="Feed Withdrawal Period (hours)" placeholder="e.g. 12" value={lastFeedWithdrawalHours} onChangeText={setLastFeedWithdrawalHours} keyboardType="number-pad" />

          <View style={styles.sectionLabel}>
            <Feather name="check-circle" size={14} color={colors.success} />
            <Text style={styles.sectionTitle}>Declaration</Text>
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="user-check" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Signed by farmer / keeper</Text>
            </View>
            <Switch value={signedByFarmer} onValueChange={(v) => { Haptics.selectionAsync(); setSignedByFarmer(v); }} trackColor={{ false: colors.border, true: colors.primaryMuted }} thumbColor={signedByFarmer ? colors.primary : colors.textTertiary} />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input label="Additional Notes" placeholder="Any other relevant information for the slaughterhouse…" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />

          <Button title="Save FCI Document" onPress={handleSave} loading={saving} fullWidth icon="check" />
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
  infoBox: { flexDirection: "row", gap: spacing.sm, backgroundColor: colors.infoBg, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: "flex-start" },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.info, flex: 1, lineHeight: 18 },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  toggleRowDanger: { borderColor: colors.error, backgroundColor: "#fff5f5" },
  toggleInfo: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, flex: 1 },
  toggleTextBlock: { flex: 1 },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  toggleSubLabel: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  dangerBanner: { flexDirection: "row", gap: spacing.sm, backgroundColor: "#fef2f2", borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: "#fca5a5", alignItems: "flex-start" },
  dangerText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: "#7f1d1d", flex: 1, lineHeight: 18 },
});
