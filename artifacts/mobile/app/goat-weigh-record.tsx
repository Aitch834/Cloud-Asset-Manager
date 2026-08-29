import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { DiseaseAlertBanner } from "@/components/ui/DiseaseAlertBanner";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useDiseaseAlert } from "@/lib/hooks/useDiseaseAlert";
import { useApiGoatFlocks } from "@/lib/hooks/useApiGoatFlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate() { return new Date().toISOString().split("T")[0]; }

const WEIGH_TYPES = ["Routine", "Pre-Sale", "Pre-Movement", "Post-Weaning", "8-Week", "Store Check"];
const AGE_CLASSES = ["Kids", "Weanlings", "Yearlings", "Does", "Bucks", "Mixed"];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function GoatWeighRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const goatAlert = useDiseaseAlert("goat");
  const { flocks, loading: flocksLoading } = useApiGoatFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const farmId = currentFarm?.id;
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(farmId);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("goat-weigh", farmId, user?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));

  const [flockId, setFlockId] = useState("");
  const [weighDate, setWeighDate] = useState(todayDate());
  const [weighType, setWeighType] = useState("Routine");
  const [ageClass, setAgeClass] = useState("Kids");
  const [weighedBy, setWeighedBy] = useState("");
  const [numberWeighed, setNumberWeighed] = useState("");
  const [avgWeight, setAvgWeight] = useState("");
  const [lowestWeight, setLowestWeight] = useState("");
  const [highestWeight, setHighestWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [dlwg, setDlwg] = useState("");
  const [daysSincePrev, setDaysSincePrev] = useState("");
  const [bcs, setBcs] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!weighDate.trim()) { Alert.alert("Date required", "Please enter the weigh date."); return; }
    if (!numberWeighed.trim()) { Alert.alert("Count required", "Please enter the number weighed."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "goat-weigh-record",
        herdId: flockId ? Number(flockId) : null,
        weighDate,
        weighType,
        ageClassWeighed: ageClass,
        weighedBy: weighedBy || null,
        numberWeighed: Number(numberWeighed),
        averageWeightKg: avgWeight ? Number(avgWeight) : null,
        lowestWeightKg: lowestWeight ? Number(lowestWeight) : null,
        highestWeightKg: highestWeight ? Number(highestWeight) : null,
        targetWeightKg: targetWeight ? Number(targetWeight) : null,
        dlwgGPerDay: dlwg ? Number(dlwg) : null,
        daysSincePreviousWeigh: daysSincePrev ? Number(daysSincePrev) : null,
        bodyConditionScore: bcs ? Number(bcs) : null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/goat-weigh-records`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Weigh record saved", "Will sync when connected.", [{ text: "Done", onPress: () => router.back() }]);
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
        <Text style={styles.headerTitle}>Goat Weigh-In Record</Text>
        <View style={{ width: 36 }} />
      </View>
      <DiseaseAlertBanner alert={goatAlert} sector="Goat" />
      <IdentifierBanner
        justSaved={justSaved}
        loading={identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={!cphNumber}
        sbiMissing={!sbiNumber}
        context="weighing records"
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Herd</Text>
        {flocksLoading ? <Text style={styles.hint}>Loading herds…</Text> : flocks.length > 0 ? (
          <View style={styles.chips}>
            {flocks.map((f) => <Chip key={String(f.id)} label={f.name ?? "Herd"} selected={flockId === String(f.id)} onPress={() => { Haptics.selectionAsync(); setFlockId(String(f.id)); }} />)}
          </View>
        ) : <Text style={styles.hint}>No goat herds found.</Text>}

        <Text style={styles.sectionTitle}>Weigh Type</Text>
        <View style={styles.chips}>
          {WEIGH_TYPES.map((t) => <Chip key={t} label={t} selected={weighType === t} onPress={() => { Haptics.selectionAsync(); setWeighType(t); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Age Class</Text>
        <View style={styles.chips}>
          {AGE_CLASSES.map((c) => <Chip key={c} label={c} selected={ageClass === c} onPress={() => { Haptics.selectionAsync(); setAgeClass(c); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Weigh Date *</Text>
            <Input value={weighDate} onChangeText={setWeighDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Number Weighed *</Text>
            <Input value={numberWeighed} onChangeText={setNumberWeighed} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Avg Weight (kg)</Text>
            <Input value={avgWeight} onChangeText={setAvgWeight} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Target Weight (kg)</Text>
            <Input value={targetWeight} onChangeText={setTargetWeight} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Lowest (kg)</Text>
            <Input value={lowestWeight} onChangeText={setLowestWeight} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Highest (kg)</Text>
            <Input value={highestWeight} onChangeText={setHighestWeight} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>DLWG (g/day)</Text>
            <Input value={dlwg} onChangeText={setDlwg} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Days Since Last Weigh</Text>
            <Input value={daysSincePrev} onChangeText={setDaysSincePrev} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>BCS (1–5)</Text>
            <Input value={bcs} onChangeText={setBcs} keyboardType="decimal-pad" placeholder="e.g. 3.0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Weighed By</Text>
            <Input value={weighedBy} onChangeText={setWeighedBy} placeholder="Name" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Weigh Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  chipSelected: { backgroundColor: "#0891b2", borderColor: "#0891b2" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  saveBtn: { marginTop: spacing.md },
});
