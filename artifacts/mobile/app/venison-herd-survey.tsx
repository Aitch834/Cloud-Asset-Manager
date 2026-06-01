import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

const SURVEY_METHODS = ["Driven Count", "Thermal Imaging — Ground-based", "Fixed Point Count (Vantage Point)", "ADE Count — Aerial", "Thermal Drone Survey", "Camera Trap Census"];
const DEER_SPECIES = ["Red Deer", "Roe Deer", "Fallow Deer", "Sika Deer", "Muntjac", "Chinese Water Deer", "Reindeer", "Mixed"];
const WEATHER_CONDITIONS = ["Good — clear, calm", "Fair — light cloud or breeze", "Poor — overcast or wet", "Very poor — fog, heavy rain or wind"];

const CHIP_COLOR = "#15803d";

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && { backgroundColor: CHIP_COLOR, borderColor: CHIP_COLOR }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function VenisonHerdSurveyScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { herds, loading: herdsLoading } = useApiHerds(currentFarm?.id);
  const displayHerds = herds.filter((h) => /deer|venison|red|roe|fallow|sika|muntjac/i.test(h.type ?? "")).length > 0
    ? herds.filter((h) => /deer|venison|red|roe|fallow|sika|muntjac/i.test(h.type ?? ""))
    : herds;
  const [saving, setSaving] = useState(false);

  const [herdId, setHerdId] = useState("");
  const [surveyDate, setSurveyDate] = useState(todayDate());
  const [surveyMethod, setSurveyMethod] = useState("Fixed Point Count (Vantage Point)");
  const [species, setSpecies] = useState("Roe Deer");
  const [maleCount, setMaleCount] = useState("");
  const [femaleCount, setFemaleCount] = useState("");
  const [youngCount, setYoungCount] = useState("");
  const [totalCount, setTotalCount] = useState("");
  const [maleFemaleRatio, setMaleFemaleRatio] = useState("");
  const [recruitmentRatePercent, setRecruitmentRatePercent] = useState("");
  const [observedBy, setObservedBy] = useState("");
  const [weatherConditions, setWeatherConditions] = useState("Good — clear, calm");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!surveyDate.trim()) { Alert.alert("Date required", "Please enter the survey date."); return; }
    if (!surveyMethod) { Alert.alert("Method required", "Please select the survey method."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "venison-herd-survey",
        herdId: herdId ? Number(herdId) : null,
        surveyDate,
        surveyMethod,
        species: species || null,
        maleCount: maleCount ? Number(maleCount) : null,
        femaleCount: femaleCount ? Number(femaleCount) : null,
        youngCount: youngCount ? Number(youngCount) : null,
        totalCount: totalCount ? Number(totalCount) : null,
        maleFemaleRatio: maleFemaleRatio || null,
        recruitmentRatePercent: recruitmentRatePercent || null,
        observedBy: observedBy || null,
        weatherConditions: weatherConditions || null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/venison-herd-monitoring`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Population survey saved", "Will sync when connected.", [{ text: "Done", onPress: () => router.back() }]);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Save failed", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const autoTotal = () => {
    const m = Number(maleCount || 0);
    const f = Number(femaleCount || 0);
    const y = Number(youngCount || 0);
    if (m > 0 || f > 0 || y > 0) setTotalCount(String(m + f + y));
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Deer Population Survey</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Deer Herd</Text>
        {herdsLoading ? <Text style={styles.hint}>Loading herds…</Text> : displayHerds.length > 0 ? (
          <View style={styles.chips}>
            {displayHerds.map((h) => <Chip key={String(h.id)} label={h.name ?? "Herd"} selected={herdId === String(h.id)} onPress={() => { Haptics.selectionAsync(); setHerdId(String(h.id)); }} />)}
          </View>
        ) : <Text style={styles.hint}>No herds found.</Text>}

        <Text style={styles.sectionTitle}>Survey Details</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Survey Date *</Text>
            <Input value={surveyDate} onChangeText={setSurveyDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Observed By</Text>
            <Input value={observedBy} onChangeText={setObservedBy} placeholder="Name" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Survey Method *</Text>
        <View style={styles.chips}>
          {SURVEY_METHODS.map((m) => <Chip key={m} label={m} selected={surveyMethod === m} onPress={() => { Haptics.selectionAsync(); setSurveyMethod(m); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Species</Text>
        <View style={styles.chips}>
          {DEER_SPECIES.map((s) => <Chip key={s} label={s} selected={species === s} onPress={() => { Haptics.selectionAsync(); setSpecies(s); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Population Counts</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Males (Stags / Bucks)</Text>
            <Input value={maleCount} onChangeText={setMaleCount} keyboardType="numeric" placeholder="0" onBlur={autoTotal} />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Females (Hinds / Does)</Text>
            <Input value={femaleCount} onChangeText={setFemaleCount} keyboardType="numeric" placeholder="0" onBlur={autoTotal} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Young (Calves / Fawns)</Text>
            <Input value={youngCount} onChangeText={setYoungCount} keyboardType="numeric" placeholder="0" onBlur={autoTotal} />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Total Count</Text>
            <Input value={totalCount} onChangeText={setTotalCount} keyboardType="numeric" placeholder="0" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Male : Female Ratio</Text>
            <Input value={maleFemaleRatio} onChangeText={setMaleFemaleRatio} placeholder="e.g. 1:3.5" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Recruitment Rate %</Text>
            <Input value={recruitmentRatePercent} onChangeText={setRecruitmentRatePercent} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Weather Conditions</Text>
        <View style={styles.chips}>
          {WEATHER_CONDITIONS.map((w) => <Chip key={w} label={w} selected={weatherConditions === w} onPress={() => { Haptics.selectionAsync(); setWeatherConditions(w); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Observations, behaviour, habitat condition…" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Population Survey"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
  saveBtn: { marginTop: spacing.md },
});
