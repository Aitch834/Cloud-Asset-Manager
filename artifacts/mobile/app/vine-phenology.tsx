import { StaffMemberPicker, type ApiFarmMember, memberFullName } from "@/components/StaffMemberPicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFarmMembers } from "@/lib/hooks/useApiFarmMembers";
import { appendToList, generateId } from "@/lib/storage";

const today = new Date().toISOString().split("T")[0];

const BBCH_STAGES: { code: string; desc: string; season: string }[] = [
  { code: "00", desc: "Dormancy — buds dormant", season: "Winter" },
  { code: "05", desc: "Wool stage — bud scales swelling", season: "Winter" },
  { code: "07", desc: "Burst bud — green tips visible", season: "Spring" },
  { code: "09", desc: "Shoot growth begins", season: "Spring" },
  { code: "11", desc: "First leaf unfolded", season: "Spring" },
  { code: "13", desc: "Three leaves unfolded", season: "Spring" },
  { code: "15", desc: "Five leaves unfolded", season: "Spring" },
  { code: "53", desc: "Inflorescence visible — closed", season: "Spring" },
  { code: "55", desc: "Inflorescence clearly visible", season: "Spring" },
  { code: "57", desc: "Single flowers separating", season: "Spring" },
  { code: "60", desc: "Start of flowering — first caps fallen", season: "Summer" },
  { code: "65", desc: "Full flowering — 50% caps fallen", season: "Summer" },
  { code: "68", desc: "End of flowering — nearly all caps fallen", season: "Summer" },
  { code: "71", desc: "Fruit set — berries pea-sized", season: "Summer" },
  { code: "73", desc: "Berries beginning to touch", season: "Summer" },
  { code: "75", desc: "Berries touching", season: "Summer" },
  { code: "77", desc: "Berries beginning to soften", season: "Summer" },
  { code: "81", desc: "Beginning of ripening — berries colouring", season: "Autumn" },
  { code: "83", desc: "Berries developing variety colour", season: "Autumn" },
  { code: "85", desc: "Berries softening", season: "Autumn" },
  { code: "89", desc: "Berries ripe for harvest", season: "Autumn" },
  { code: "93", desc: "Beginning of leaf colouration / fall", season: "Autumn" },
  { code: "97", desc: "End of leaf fall", season: "Autumn" },
];

const seasons = Array.from(new Set(BBCH_STAGES.map(s => s.season)));

export default function VinePhenologyScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);

  const [selectedObserver, setSelectedObserver] = useState<ApiFarmMember | null>(null);
  const [manualObserver, setManualObserver] = useState(user?.name || "");
  const observer = selectedObserver ? memberFullName(selectedObserver) : manualObserver;

  const [observationDate, setObservationDate] = useState(today);
  const [blockName, setBlockName] = useState("");
  const [selectedStage, setSelectedStage] = useState<typeof BBCH_STAGES[0] | null>(null);
  const [percentageReached, setPercentageReached] = useState("");
  const [temperatureC, setTemperatureC] = useState("");
  const [notes, setNotes] = useState("");

  const filteredStages = seasonFilter ? BBCH_STAGES.filter(s => s.season === seasonFilter) : BBCH_STAGES;

  const handleSave = async () => {
    if (!observationDate || !selectedStage) {
      Alert.alert("Required Fields", "Please select an observation date and BBCH stage.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const entry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      observationDate,
      blockName: blockName.trim() || undefined,
      bbchStage: selectedStage.code,
      bbchDescription: selectedStage.desc,
      percentageReached: percentageReached ? Number(percentageReached) : undefined,
      observer: observer.trim() || undefined,
      temperatureC: temperatureC ? Number(temperatureC) : undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      _pendingSync: true,
    };

    await appendToList("bde_vine_phenology", entry);
    await refreshPendingCount();

    setSaving(false);
    router.back();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Vine Phenology Observation</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Observation Details</Text>
          <Text style={styles.fieldLabel}>Observation Date *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={observationDate}
            onChangeText={v => { if (v <= today) setObservationDate(v); }}
            keyboardType="numeric"
          />
          <Text style={styles.fieldLabel}>Block / Area</Text>
          <Input placeholder="e.g. South Slope, Block 3" value={blockName} onChangeText={setBlockName} />
          <Text style={styles.fieldLabel}>Observer</Text>
          <StaffMemberPicker
            members={members}
            selected={selectedObserver}
            onSelect={setSelectedObserver}
            loading={false}
            error={null}
          />
          {!selectedObserver && (
            <Input placeholder="Or type name manually" value={manualObserver} onChangeText={setManualObserver} style={{ marginTop: spacing.xs }} />
          )}
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>% Reached</Text>
              <Input placeholder="e.g. 50" value={percentageReached} onChangeText={setPercentageReached} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Temperature (°C)</Text>
              <Input placeholder="e.g. 18.5" value={temperatureC} onChangeText={setTemperatureC} keyboardType="decimal-pad" />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>BBCH Growth Stage *</Text>
          <Text style={styles.helperText}>Select the growth stage that best matches your current observation.</Text>
          <View style={styles.seasonTabs}>
            <Pressable style={[styles.seasonTab, !seasonFilter && styles.seasonTabActive]} onPress={() => setSeasonFilter(null)}>
              <Text style={[styles.seasonTabText, !seasonFilter && styles.seasonTabTextActive]}>All</Text>
            </Pressable>
            {seasons.map(s => (
              <Pressable key={s} style={[styles.seasonTab, seasonFilter === s && styles.seasonTabActive]} onPress={() => setSeasonFilter(s)}>
                <Text style={[styles.seasonTabText, seasonFilter === s && styles.seasonTabTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          {filteredStages.map(stage => (
            <Pressable
              key={stage.code}
              style={[styles.stageOption, selectedStage?.code === stage.code && styles.stageOptionSelected]}
              onPress={() => { Haptics.selectionAsync(); setSelectedStage(stage); }}
            >
              <View style={[styles.stageBadge, selectedStage?.code === stage.code && { backgroundColor: colors.primary }]}>
                <Text style={[styles.stageBadgeText, selectedStage?.code === stage.code && { color: "#fff" }]}>{stage.code}</Text>
              </View>
              <Text style={[styles.stageDesc, selectedStage?.code === stage.code && { color: colors.primary }]}>{stage.desc}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Input placeholder="Additional observations…" value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
        </View>

        <Button title={saving ? "Saving…" : "Save Phenology Observation"} onPress={handleSave} disabled={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  backBtn: { padding: spacing.xs },
  title: { fontSize: fontSize.lg, fontFamily: fonts.bold, color: colors.text, flex: 1 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.text },
  fieldLabel: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary, marginTop: spacing.xs },
  helperText: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 18 },
  twoCol: { flexDirection: "row", gap: spacing.sm },
  seasonTabs: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  seasonTab: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full ?? 99, borderWidth: 1, borderColor: colors.border },
  seasonTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  seasonTabText: { fontSize: fontSize.xs, fontFamily: fonts.medium, color: colors.textSecondary },
  seasonTabTextActive: { color: "#fff" },
  stageOption: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  stageOptionSelected: { borderColor: colors.primary, backgroundColor: "#ede9fe" },
  stageBadge: { width: 40, height: 28, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  stageBadgeText: { fontSize: fontSize.xs, fontFamily: fonts.bold, color: colors.textSecondary },
  stageDesc: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.text, flex: 1 },
});
