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
import { Input } from "@/components/ui/Input";
import { PigPenPicker } from "@/components/ui/PigPenPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiPigFlocks } from "@/lib/hooks/useApiPigFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PigFciDocument } from "@/lib/types";

const CASUALTY_STATUSES = [
  "None — all pigs fit for slaughter",
  "Casualty — emergency slaughter authorised by vet",
  "Treated — withdrawal period clear",
  "Lame — able to walk without assistance",
];

export default function PigFciScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPigFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState<number>(0);
  const [groupName, setGroupName] = useState("");
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split("T")[0]);
  const [batchReference, setBatchReference] = useState("");
  const [destinationAbattoir, setDestinationAbattoir] = useState("");
  const [numberOfPigs, setNumberOfPigs] = useState("");
  const [veterinaryMedicinesLast60Days, setVeterinaryMedicinesLast60Days] = useState(false);
  const [medicineDetails, setMedicineDetails] = useState("");
  const [withdrawalPeriodClear, setWithdrawalPeriodClear] = useState(true);
  const [feedWithdrawalHours, setFeedWithdrawalHours] = useState("");
  const [lambnessCasualtyStatus, setLambnessCasualtyStatus] = useState(CASUALTY_STATUSES[0]);
  const [signedByFarmer, setSignedByFarmer] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!numberOfPigs.trim()) { Alert.alert("Required", "Please enter the number of pigs."); return; }

    if (!withdrawalPeriodClear && veterinaryMedicinesLast60Days) {
      Alert.alert(
        "Withdrawal Period Not Clear",
        "You have indicated veterinary medicines were used in the last 60 days AND the withdrawal period is NOT clear. These pigs cannot be legally slaughtered. Do you still want to save this record?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Save Anyway", style: "destructive", onPress: doSave },
        ]
      );
      return;
    }
    await doSave();
  };

  const doSave = async () => {
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PigFciDocument = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockId,
      documentDate,
      batchReference: batchReference.trim(),
      destinationAbattoir: destinationAbattoir.trim(),
      numberOfPigs: numberOfPigs.trim(),
      veterinaryMedicinesLast60Days,
      medicineDetails: medicineDetails.trim(),
      withdrawalPeriodClear,
      feedWithdrawalHours: feedWithdrawalHours.trim(),
      lambnessCasualtyStatus,
      signedByFarmer,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PIG_FCI_DOCUMENTS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("FCI Document Saved", "Food Chain Information document queued for sync. Ensure a copy accompanies the pigs to the abattoir.", [
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Pig FCI Document</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.infoBox}>
            <Feather name="info" size={14} color={colors.info} />
            <Text style={styles.infoText}>
              Food Chain Information (FCI) must accompany every pig to slaughter under EC 853/2004. Complete this document before the pigs leave the farm.
            </Text>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="grid" size={14} color="#db2777" />
            <Text style={styles.sectionTitle}>Group &amp; Dispatch</Text>
          </View>
          <PigPenPicker label="Select Group (optional)" value={groupName} onChange={setGroupName} onChangeFlock={(f) => { setFlockId(f.id); if (!numberOfPigs) setNumberOfPigs(String(f.currentCount || "")); }} flocks={flocks} loading={flocksLoading} fromCache={fromCache} error={flocksError} />
          <Input label="Document Date *" placeholder="YYYY-MM-DD" value={documentDate} onChangeText={setDocumentDate} required />
          <Input label="Batch Reference" placeholder="e.g. Batch 2024-12" value={batchReference} onChangeText={setBatchReference} />
          <Input label="Destination Abattoir" placeholder="Name and address" value={destinationAbattoir} onChangeText={setDestinationAbattoir} />
          <Input label="Number of Pigs *" placeholder="e.g. 100" value={numberOfPigs} onChangeText={setNumberOfPigs} keyboardType="number-pad" required />

          <View style={styles.sectionLabel}>
            <Feather name="alert-triangle" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Health Declaration</Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="package" size={16} color={colors.textSecondary} />
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>Vet medicines in last 60 days?</Text>
                <Text style={styles.toggleSub}>Any veterinary medicines administered in the 60 days before dispatch</Text>
              </View>
            </View>
            <Switch value={veterinaryMedicinesLast60Days} onValueChange={(v) => { Haptics.selectionAsync(); setVeterinaryMedicinesLast60Days(v); }} trackColor={{ false: colors.border, true: "#fee2e2" }} thumbColor={veterinaryMedicinesLast60Days ? colors.error : colors.textTertiary} />
          </View>
          {veterinaryMedicinesLast60Days && (
            <Input label="Medicine Details" placeholder="Product name, last dose date, withdrawal period…" value={medicineDetails} onChangeText={setMedicineDetails} multiline numberOfLines={2} />
          )}

          <View style={[styles.toggleRow, !withdrawalPeriodClear && styles.toggleRowDanger]}>
            <View style={styles.toggleInfo}>
              <Feather name="clock" size={16} color={colors.textSecondary} />
              <View style={styles.toggleTextBlock}>
                <Text style={styles.toggleLabel}>Withdrawal period clear?</Text>
                <Text style={styles.toggleSub}>All withdrawal periods have elapsed — pigs are safe for slaughter</Text>
              </View>
            </View>
            <Switch value={withdrawalPeriodClear} onValueChange={(v) => { Haptics.selectionAsync(); setWithdrawalPeriodClear(v); }} trackColor={{ false: "#fecaca", true: colors.primaryMuted }} thumbColor={withdrawalPeriodClear ? colors.primary : colors.error} />
          </View>
          {!withdrawalPeriodClear && (
            <View style={styles.dangerBanner}>
              <Feather name="alert-octagon" size={14} color="#7f1d1d" />
              <Text style={styles.dangerText}>⚠️ Withdrawal period NOT clear — these pigs cannot be legally slaughtered for human consumption until all withdrawal periods have elapsed.</Text>
            </View>
          )}

          <View style={styles.sectionLabel}>
            <Feather name="heart" size={14} color="#db2777" />
            <Text style={styles.sectionTitle}>Lameness / Casualty Status</Text>
          </View>
          {CASUALTY_STATUSES.map((s) => (
            <Button
              key={s}
              title={s}
              variant={lambnessCasualtyStatus === s ? "primary" : "outline"}
              size="sm"
              onPress={() => { Haptics.selectionAsync(); setLambnessCasualtyStatus(s); }}
            />
          ))}

          <View style={[styles.sectionLabel, { marginTop: spacing.md }]}>
            <Feather name="clock" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Feed Withdrawal</Text>
          </View>
          <Input label="Feed Withdrawal Period (hours)" placeholder="e.g. 12–14" value={feedWithdrawalHours} onChangeText={setFeedWithdrawalHours} keyboardType="number-pad" />

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
          <Input label="Additional Notes" placeholder="Any other information for the abattoir…" value={notes} onChangeText={setNotes} multiline numberOfLines={2} />

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
  toggleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  toggleRowDanger: { borderColor: colors.error, backgroundColor: "#fff5f5" },
  toggleInfo: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, flex: 1 },
  toggleTextBlock: { flex: 1 },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  toggleSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, lineHeight: 16 },
  dangerBanner: { flexDirection: "row", gap: spacing.sm, backgroundColor: "#fef2f2", borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: "#fca5a5", alignItems: "flex-start" },
  dangerText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: "#7f1d1d", flex: 1, lineHeight: 18 },
});
