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
import { useApiHerds } from "@/lib/hooks/useApiHerds";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate() { return new Date().toISOString().split("T")[0]; }

const DEER_SPECIES = ["Red Deer", "Roe Deer", "Fallow Deer", "Sika Deer", "Muntjac", "Chinese Water Deer", "Reindeer", "Other"];
const SEX_OPTIONS = ["Stag", "Hind", "Buck", "Doe", "Calf", "Fawn", "Kid", "Unknown"];
const AGE_CLASSES = ["Calf / Fawn / Kid", "Yearling (Pricket / Knobber)", "Adult", "Unknown"];
const CULL_METHODS = ["Rifle (stalking)", "Driven / Sika drive", "Trap (licensed)"];
const CULL_REASONS = ["Population management (annual cull plan)", "Damage control", "Welfare — injured or sick", "Sporting cull", "Licensed out-of-season emergency"];
const FOOD_SAFETY_RESULTS = ["Passed", "Conditionally passed", "Failed — carcass condemned", "Not inspected"];

function Chip({ label, selected, onPress, chipColor }: { label: string; selected: boolean; onPress: () => void; chipColor?: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && { backgroundColor: chipColor ?? CHIP_COLOR, borderColor: chipColor ?? CHIP_COLOR }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const CHIP_COLOR = "#15803d";

export default function VenisonCullRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { herds, loading: herdsLoading } = useApiHerds(currentFarm?.id);
  const deerHerds = herds.filter((h) => /deer|venison|red|roe|fallow|sika|muntjac/i.test(h.type ?? "") || herds.length <= 5);
  const displayHerds = deerHerds.length > 0 ? deerHerds : herds;
  const [saving, setSaving] = useState(false);

  const [herdId, setHerdId] = useState("");
  const [cullDate, setCullDate] = useState(todayDate());
  const [stalkerName, setStalkerName] = useState("");
  const [species, setSpecies] = useState("Roe Deer");
  const [sex, setSex] = useState("Hind");
  const [ageClass, setAgeClass] = useState("Adult");
  const [locationBeat, setLocationBeat] = useState("");
  const [larderNumber, setLarderNumber] = useState("");
  const [carcassNumber, setCarcassNumber] = useState("");
  const [liveweightKg, setLiveweightKg] = useState("");
  const [grallochWeightKg, setGrallochWeightKg] = useState("");
  const [carcassWeightKg, setCarcassWeightKg] = useState("");
  const [killoutPercent, setKilloutPercent] = useState("");
  const [cullMethod, setCullMethod] = useState("Rifle (stalking)");
  const [cullReason, setCullReason] = useState("Population management (annual cull plan)");
  const [foodSafetyResult, setFoodSafetyResult] = useState("Passed");
  const [notifiableDisease, setNotifiableDisease] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!cullDate.trim()) { Alert.alert("Date required", "Please enter the cull date."); return; }
    if (!species) { Alert.alert("Species required", "Please select a deer species."); return; }
    if (!cullReason) { Alert.alert("Reason required", "Please select a cull reason."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "venison-cull-record",
        herdId: herdId ? Number(herdId) : null,
        cullDate,
        stalkerName: stalkerName || null,
        species,
        sex: sex || null,
        ageClass: ageClass || null,
        locationBeat: locationBeat || null,
        larderNumber: larderNumber || null,
        carcassNumber: carcassNumber || null,
        liveweightKg: liveweightKg ? Number(liveweightKg) : null,
        grallochWeightKg: grallochWeightKg ? Number(grallochWeightKg) : null,
        carcassWeightKg: carcassWeightKg ? Number(carcassWeightKg) : null,
        killoutPercent: killoutPercent ? Number(killoutPercent) : null,
        cullMethod,
        cullReason,
        foodSafetyInspectionResult: foodSafetyResult,
        notifiableDiseaseSupect: notifiableDisease,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/venison-cull-records`,
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
        <Text style={styles.headerTitle}>Venison Cull Record</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Deer Herd</Text>
        {herdsLoading ? <Text style={styles.hint}>Loading herds…</Text> : displayHerds.length > 0 ? (
          <View style={styles.chips}>
            {displayHerds.map((h) => <Chip key={String(h.id)} label={h.name ?? "Herd"} selected={herdId === String(h.id)} onPress={() => { Haptics.selectionAsync(); setHerdId(String(h.id)); }} />)}
          </View>
        ) : <Text style={styles.hint}>No herds found. Register deer herds in Livestock → Herds &amp; Animals on the dashboard.</Text>}

        <Text style={styles.sectionTitle}>Species</Text>
        <View style={styles.chips}>
          {DEER_SPECIES.map((s) => <Chip key={s} label={s} selected={species === s} onPress={() => { Haptics.selectionAsync(); setSpecies(s); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Sex</Text>
        <View style={styles.chips}>
          {SEX_OPTIONS.map((s) => <Chip key={s} label={s} selected={sex === s} onPress={() => { Haptics.selectionAsync(); setSex(s); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Age Class</Text>
        <View style={styles.chips}>
          {AGE_CLASSES.map((a) => <Chip key={a} label={a} selected={ageClass === a} onPress={() => { Haptics.selectionAsync(); setAgeClass(a); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Cull Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Cull Date *</Text>
            <Input value={cullDate} onChangeText={setCullDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Stalker Name</Text>
            <Input value={stalkerName} onChangeText={setStalkerName} placeholder="Name" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Location / Beat</Text>
            <Input value={locationBeat} onChangeText={setLocationBeat} placeholder="e.g. North Block" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Larder Number</Text>
            <Input value={larderNumber} onChangeText={setLarderNumber} placeholder="e.g. L-001" />
          </View>
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Carcass Number</Text>
          <Input value={carcassNumber} onChangeText={setCarcassNumber} placeholder="e.g. C-001" />
        </View>

        <Text style={styles.sectionTitle}>Cull Method</Text>
        <View style={styles.chips}>
          {CULL_METHODS.map((m) => <Chip key={m} label={m} selected={cullMethod === m} onPress={() => { Haptics.selectionAsync(); setCullMethod(m); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Cull Reason *</Text>
        <View style={styles.chips}>
          {CULL_REASONS.map((r) => <Chip key={r} label={r} selected={cullReason === r} onPress={() => { Haptics.selectionAsync(); setCullReason(r); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Weights (kg)</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Liveweight (kg)</Text>
            <Input value={liveweightKg} onChangeText={setLiveweightKg} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Gralloch Weight (kg)</Text>
            <Input value={grallochWeightKg} onChangeText={setGrallochWeightKg} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Carcass Weight (kg)</Text>
            <Input value={carcassWeightKg} onChangeText={setCarcassWeightKg} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Kill-out %</Text>
            <Input value={killoutPercent} onChangeText={setKilloutPercent} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Food Safety Inspection</Text>
        <View style={styles.chips}>
          {FOOD_SAFETY_RESULTS.map((r) => <Chip key={r} label={r} selected={foodSafetyResult === r} onPress={() => { Haptics.selectionAsync(); setFoodSafetyResult(r); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Notifiable Disease</Text>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Notifiable Disease Suspected</Text>
            <Text style={styles.hint}>Tick if signs are consistent with a notifiable disease (e.g. bTB lesions, FMD signs).</Text>
          </View>
          <Switch value={notifiableDisease} onValueChange={(v) => { Haptics.selectionAsync(); setNotifiableDisease(v); }} trackColor={{ false: colors.borderLight, true: "#dc2626" }} />
        </View>
        {notifiableDisease && (
          <View style={styles.alertBox}>
            <Feather name="alert-triangle" size={16} color="#dc2626" />
            <Text style={styles.alertText}>Contact APHA immediately on 03000 200 301. Do not delay — mandatory notification must be made before laboratory confirmation.</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Additional notes" multiline numberOfLines={3} />

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
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: spacing.sm },
  switchRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  alertBox: { flexDirection: "row", gap: spacing.xs, backgroundColor: "#fee2e2", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, alignItems: "flex-start" },
  alertText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: "#991b1b", flex: 1 },
  saveBtn: { marginTop: spacing.md },
});
