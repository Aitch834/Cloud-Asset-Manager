import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

const CULL_REASONS = ["Age", "Teeth / Dentition", "Mastitis", "Poor Performance", "Lameness / CODD", "Infertility", "Prolapse", "Condition", "Market Opportunity", "Other"];
const DESTINATIONS = ["Abattoir", "Mart / Auction", "Direct Sale", "Farm Casualty"];
const AGE_CLASSES = ["Lambs", "Hoggets", "Ewes", "Rams", "Mixed"];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function SheepCullRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading } = useApiSheepFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const farmId = currentFarm?.id;
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(farmId);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("sheep-cull", farmId, user?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));

  const [flockId, setFlockId] = useState("");
  const [cullDate, setCullDate] = useState(todayDate());
  const [numberCulled, setNumberCulled] = useState("");
  const [ageClass, setAgeClass] = useState("Ewes");
  const [reason, setReason] = useState("");
  const [destination, setDestination] = useState("Mart / Auction");
  const [destinationCph, setDestinationCph] = useState("");
  const [avgLiveWeight, setAvgLiveWeight] = useState("");
  const [avgDeadweight, setAvgDeadweight] = useState("");
  const [killoutPct, setKilloutPct] = useState("");
  const [pricePerHead, setPricePerHead] = useState("");
  const [totalValue, setTotalValue] = useState("");
  const [abattoirName, setAbattoirName] = useState("");
  const [finishGrade, setFinishGrade] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!cullDate.trim()) { Alert.alert("Date required", "Please enter the cull date."); return; }
    if (!numberCulled.trim()) { Alert.alert("Count required", "Please enter the number culled."); return; }
    if (!reason) { Alert.alert("Reason required", "Please select a reason for culling."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "sheep-cull-record",
        flockId: flockId ? Number(flockId) : null,
        cullDate,
        numberCulled: Number(numberCulled),
        ageClass,
        reasonForCulling: reason,
        destination,
        destinationCph: destinationCph || null,
        averageLiveWeightKg: avgLiveWeight ? Number(avgLiveWeight) : null,
        averageDeadweightKg: avgDeadweight ? Number(avgDeadweight) : null,
        deadweightKilloutPercent: killoutPct ? Number(killoutPct) : null,
        pricePerHeadGbp: pricePerHead ? Number(pricePerHead) : null,
        totalValueGbp: totalValue ? Number(totalValue) : null,
        abattoirName: abattoirName || null,
        finishGrade: finishGrade || null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/sheep-cull-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Cull record saved", "Will sync when connected.", [{ text: "Done", onPress: () => router.back() }]);
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
        <Text style={styles.headerTitle}>Sheep Cull / Market Record</Text>
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
        context="movement submissions"
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Flock</Text>
        {flocksLoading ? <Text style={styles.hint}>Loading flocks…</Text> : flocks.length > 0 ? (
          <View style={styles.chips}>
            {flocks.map((f) => <Chip key={String(f.id)} label={f.name ?? "Flock"} selected={flockId === String(f.id)} onPress={() => { Haptics.selectionAsync(); setFlockId(String(f.id)); }} />)}
          </View>
        ) : <Text style={styles.hint}>No sheep flocks found.</Text>}

        <Text style={styles.sectionTitle}>Age Class</Text>
        <View style={styles.chips}>
          {AGE_CLASSES.map((c) => <Chip key={c} label={c} selected={ageClass === c} onPress={() => { Haptics.selectionAsync(); setAgeClass(c); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Cull Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Cull Date *</Text>
            <Input value={cullDate} onChangeText={setCullDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Number Culled *</Text>
            <Input value={numberCulled} onChangeText={setNumberCulled} keyboardType="numeric" placeholder="0" />
          </View>
        </View>

        <Text style={styles.label}>Reason for Culling *</Text>
        <View style={styles.chips}>
          {CULL_REASONS.map((r) => <Chip key={r} label={r} selected={reason === r} onPress={() => { Haptics.selectionAsync(); setReason(r); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Destination</Text>
        <View style={styles.chips}>
          {DESTINATIONS.map((d) => <Chip key={d} label={d} selected={destination === d} onPress={() => { Haptics.selectionAsync(); setDestination(d); }} />)}
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Destination CPH</Text>
            <Input value={destinationCph} onChangeText={setDestinationCph} placeholder="e.g. 12/345/0001" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Abattoir / Mart Name</Text>
            <Input value={abattoirName} onChangeText={setAbattoirName} placeholder="Name" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Weights & Value</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Avg Live Weight (kg)</Text>
            <Input value={avgLiveWeight} onChangeText={setAvgLiveWeight} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Avg Deadweight (kg)</Text>
            <Input value={avgDeadweight} onChangeText={setAvgDeadweight} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Kill-out %</Text>
            <Input value={killoutPct} onChangeText={setKilloutPct} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Finish Grade</Text>
            <Input value={finishGrade} onChangeText={setFinishGrade} placeholder="e.g. R3L" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Price Per Head (£)</Text>
            <Input value={pricePerHead} onChangeText={setPricePerHead} keyboardType="decimal-pad" placeholder="0.00" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Total Value (£)</Text>
            <Input value={totalValue} onChangeText={setTotalValue} keyboardType="decimal-pad" placeholder="0.00" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Cull Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  saveBtn: { marginTop: spacing.md },
});
