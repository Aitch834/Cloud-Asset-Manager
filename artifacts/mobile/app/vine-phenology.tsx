import { StaffMemberPicker, type ApiFarmMember, memberFullName } from "@/components/StaffMemberPicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
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
import { useUiPrefs, runUiPrefBatchMigration, dismissHintDurable } from "@/lib/hooks/useUiPrefs";
import { VineBlockPicker } from "@/components/VineBlockPicker";
import { useApiVineBlocks, type VineBlock } from "@/lib/hooks/useApiVineBlocks";
import { apiFetch } from "@/lib/apiFetch";

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

type WinegbSurveyKey = "bud_burst" | "flowering" | "veraison" | "harvest";

// Maps BBCH stage codes to WineGB's seasonal vineyard surveys.
// surveyKey matches the server's WinegbSurveyKey (null = no checklist entry).
const WINEGB_SURVEY_MAP: Record<string, { surveyName: string; label: string; surveyKey: WinegbSurveyKey | null }> = {
  "05": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "07": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "09": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "11": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "13": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "15": { surveyName: "Bud Burst Survey", label: "bud burst", surveyKey: "bud_burst" },
  "53": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "55": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "57": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "60": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "65": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "68": { surveyName: "Flowering Survey", label: "flowering", surveyKey: "flowering" },
  "71": { surveyName: "Fruit Set Survey", label: "fruit set / berry development", surveyKey: null },
  "73": { surveyName: "Fruit Set Survey", label: "fruit set / berry development", surveyKey: null },
  "75": { surveyName: "Fruit Set Survey", label: "fruit set / berry development", surveyKey: null },
  "77": { surveyName: "Véraison Survey", label: "véraison", surveyKey: "veraison" },
  "81": { surveyName: "Véraison Survey", label: "véraison", surveyKey: "veraison" },
  "83": { surveyName: "Véraison Survey", label: "véraison", surveyKey: "veraison" },
  "85": { surveyName: "Véraison Survey", label: "véraison", surveyKey: "veraison" },
  "89": { surveyName: "Harvest Survey", label: "harvest", surveyKey: "harvest" },
};

const WINEGB_SURVEY_URL = "https://winegb.co.uk/production/vineyards-wineries/";

// Returns the useUiPrefs key for a WineGB survey dismissal, scoped by survey name and season year.
function winegbPrefKey(surveyName: string, year: number): string {
  return `winegb_${surveyName.replace(/\s/g, "_").toLowerCase()}_${year}`;
}

export default function VinePhenologyScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);

  const [selectedObserver, setSelectedObserver] = useState<ApiFarmMember | null>(null);
  const [manualObserver, setManualObserver] = useState(user?.name || "");
  const observer = selectedObserver ? memberFullName(selectedObserver) : manualObserver;

  const [observationDate, setObservationDate] = useState(today);
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [manualBlockName, setManualBlockName] = useState("");
  const [selectedStage, setSelectedStage] = useState<typeof BBCH_STAGES[0] | null>(null);
  const [percentageReached, setPercentageReached] = useState("");
  const [temperatureC, setTemperatureC] = useState("");
  const [notes, setNotes] = useState("");

  // WineGB survey banner state — dismissed surveys persisted via useUiPrefs (server-synced, account-wide).
  const [winegbSurveyBanner, setWinegbSurveyBanner] = useState<{ surveyName: string; label: string } | null>(null);
  const currentSeasonYear = new Date().getFullYear();
  const { prefsReady, isHintDismissed } = useUiPrefs(user?.id);

  // One-time migration: read the old per-farm AsyncStorage dismissal array and promote each
  // survey name into the useUiPrefs system, then remove the legacy key.  migrationDone stays
  // false until the read + promotion attempt completes so we never flash the banner to a grower
  // who had already dismissed it under the old scheme.
  const [migrationDone, setMigrationDone] = useState(false);
  const migrationKeyRef = useRef<string>("");

  const farmId = currentFarm?.id ?? "";
  const userId = user?.id;

  useEffect(() => {
    if (!farmId || !userId) {
      setMigrationDone(true);
      return;
    }
    const legacyKey = `bde_winegb_dismissed_${farmId}_${currentSeasonYear}`;
    migrationKeyRef.current = legacyKey;
    setMigrationDone(false);

    // runUiPrefBatchMigration atomically writes all new pref keys to cache +
    // pending queue before removing the legacy key, so an app crash or
    // AsyncStorage failure cannot leave the grower without any record.
    // On "retry" the legacy key is retained and will be re-attempted next mount.
    void runUiPrefBatchMigration(
      userId,
      legacyKey,
      (raw) => {
        const dismissed: string[] = JSON.parse(raw);
        return dismissed.map(surveyName => winegbPrefKey(surveyName, currentSeasonYear));
      },
    ).then((result) => {
      if (migrationKeyRef.current !== legacyKey) return;
      // On "retry" the durable write failed and the legacy key was retained so
      // the migration can be re-attempted next mount.  Keep migrationDone false
      // so the banner stays hidden for any surveys still in the legacy record —
      // an identical strategy to the identifier-warning migration guard.
      if (result !== "retry") setMigrationDone(true);
    }).catch(() => {
      // Unexpected error — unblock the UI; legacy key is retained for next attempt.
      if (migrationKeyRef.current === legacyKey) setMigrationDone(true);
    });
  // currentSeasonYear never changes within a session.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmId, userId]);

  const filteredStages = seasonFilter ? BBCH_STAGES.filter(s => s.season === seasonFilter) : BBCH_STAGES;

  const dismissBanner = async () => {
    if (winegbSurveyBanner && userId) {
      // Await the durable cache + pending-queue write before navigating away so
      // an immediate app background/termination after dismissal cannot lose the choice.
      try {
        await dismissHintDurable(userId, winegbPrefKey(winegbSurveyBanner.surveyName, currentSeasonYear));
      } catch { /* best-effort — navigate regardless */ }
    }
    setWinegbSurveyBanner(null);
    router.back();
  };

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
      blockName: (selectedBlock?.blockName ?? manualBlockName.trim()) || undefined,
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

    // Show WineGB survey nudge for viticulture farms when a relevant BBCH stage is saved
    if (currentFarm?.sectorViticulture) {
      const survey = WINEGB_SURVEY_MAP[selectedStage.code];
      if (survey && prefsReady && migrationDone && !isHintDismissed(winegbPrefKey(survey.surveyName, currentSeasonYear))) {
        if (survey.surveyKey) {
          // This survey has a checklist entry — check if already ticked for the year,
          // then offer to mark it submitted via an Alert.
          const obsYear = observationDate
            ? new Date(observationDate).getFullYear()
            : currentSeasonYear;
          try {
            const res = await apiFetch(`/api/farms/${currentFarm?.id}/winegb-submissions?year=${obsYear}`);
            if (res.ok) {
              const payload = await res.json() as { submissions: Record<string, { submitted: boolean }> };
              const alreadySubmitted = payload.submissions?.[survey.surveyKey]?.submitted ?? false;
              if (!alreadySubmitted) {
                Alert.alert(
                  `Mark ${survey.surveyName} as submitted?`,
                  `You've recorded a ${survey.label} observation. Have you already submitted your data to WineGB for ${obsYear}?`,
                  [
                    {
                      text: "Mark as Submitted",
                      onPress: async () => {
                        try {
                          await apiFetch(`/api/farms/${currentFarm?.id}/winegb-submissions/${survey.surveyKey}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ submitted: true, year: obsYear }),
                          });
                        } catch { /* best-effort */ }
                        router.back();
                      },
                    },
                    { text: "Not Yet", style: "cancel", onPress: () => router.back() },
                  ],
                );
                return; // wait for Alert button before navigating
              }
            }
          } catch { /* network error — fall through to router.back() */ }
        } else {
          // No checklist key (e.g. Fruit Set) — show the external-link banner
          setWinegbSurveyBanner(survey);
          return; // stay on screen to show banner
        }
      }
    }

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

        {/* WineGB seasonal survey nudge */}
        {winegbSurveyBanner && (
          <View style={styles.winegbBanner}>
            <Feather name="globe" size={16} color="#059669" style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.winegbBannerTitle}>WineGB {winegbSurveyBanner.surveyName}</Text>
              <Text style={styles.winegbBannerBody}>
                WineGB are collecting UK-wide data on {winegbSurveyBanner.label} this season. Submit your figures to their{" "}
                <Text
                  style={styles.winegbBannerLink}
                  onPress={() => void WebBrowser.openBrowserAsync(WINEGB_SURVEY_URL)}
                >
                  Vineyard Survey →
                </Text>
              </Text>
            </View>
            <Pressable
              onPress={dismissBanner}
              hitSlop={8}
              accessibilityLabel="Dismiss WineGB survey prompt"
              style={styles.winegbDismiss}
            >
              <Feather name="x" size={16} color="#059669" />
            </Pressable>
          </View>
        )}

        {!winegbSurveyBanner && (
          <>
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
              <VineBlockPicker blocks={blocks} selected={selectedBlock} onSelect={setSelectedBlock} loading={blocksLoading} />
              {!selectedBlock && (
                <Input placeholder={blocks.length ? "Or type block name manually" : "e.g. South Slope, Block 3"} value={manualBlockName} onChangeText={setManualBlockName} style={{ marginTop: 4 }} />
              )}
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
          </>
        )}

        {winegbSurveyBanner && (
          <Button title="Done" onPress={dismissBanner} />
        )}
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
  winegbBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#6ee7b7",
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  winegbBannerTitle: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
    color: "#065f46",
    marginBottom: 2,
  },
  winegbBannerBody: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: "#065f46",
    lineHeight: 20,
  },
  winegbBannerLink: {
    fontFamily: fonts.semiBold,
    textDecorationLine: "underline",
    color: "#065f46",
  },
  winegbDismiss: {
    paddingTop: 2,
  },
});
