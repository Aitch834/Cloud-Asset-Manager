import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
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
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PoultryWelfareCheck } from "@/lib/types";
import { usePrint } from "@/lib/hooks/usePrint";
import { poultryWelfareCheckHtml } from "@/lib/printTemplates";

type LitterCondition = PoultryWelfareCheck["litterCondition"];
type BirdBehaviour = PoultryWelfareCheck["birdBehaviour"];
type AmmoniaLevel = PoultryWelfareCheck["ammoniaLevel"];
type OverallWelfare = PoultryWelfareCheck["overallWelfare"];

const LITTER_CONDITIONS: { key: LitterCondition; label: string; color: string }[] = [
  { key: "good", label: "Good — dry & friable", color: colors.success },
  { key: "fair", label: "Fair — slightly damp", color: colors.primary },
  { key: "poor", label: "Poor — wet patches", color: colors.accent },
  { key: "action-needed", label: "Action Needed — caked", color: colors.error },
];

const BEHAVIOURS: { key: BirdBehaviour; label: string; color: string }[] = [
  { key: "normal", label: "Normal", color: colors.success },
  { key: "dull", label: "Dull / Lethargic", color: colors.accent },
  { key: "distressed", label: "Distressed", color: colors.error },
];

const AMMONIA_LEVELS: { key: AmmoniaLevel; label: string; color: string }[] = [
  { key: "none", label: "None", color: colors.success },
  { key: "low", label: "Low", color: colors.primary },
  { key: "moderate", label: "Moderate", color: colors.accent },
  { key: "high", label: "High — action required", color: colors.error },
];

const WELFARE_OUTCOMES: { key: OverallWelfare; label: string; color: string }[] = [
  { key: "pass", label: "Pass", color: colors.success },
  { key: "advisory", label: "Advisory", color: colors.accent },
  { key: "fail", label: "Fail — action required", color: colors.error },
];

export default function PoultryWelfareCheckScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const [saving, setSaving] = useState(false);

  const [houseName, setHouseName] = useState("");
  const [flockId, setFlockId] = useState("");
  const [checkedBy, setCheckedBy] = useState(user?.name || "");
  const [ambientTempC, setAmbientTempC] = useState("");
  const [ventilationOk, setVentilationOk] = useState(true);
  const [lightingOk, setLightingOk] = useState(true);
  const [feedOk, setFeedOk] = useState(true);
  const [waterOk, setWaterOk] = useState(true);
  const [litterCondition, setLitterCondition] = useState<LitterCondition>("good");
  const [birdBehaviour, setBirdBehaviour] = useState<BirdBehaviour>("normal");
  const [ammoniaLevel, setAmmoniaLevel] = useState<AmmoniaLevel>("none");
  const [dailyMortalities, setDailyMortalities] = useState("0");
  const [sickInjuredCount, setSickInjuredCount] = useState("0");
  const [overallWelfare, setOverallWelfare] = useState<OverallWelfare>("pass");
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!houseName.trim()) {
      Alert.alert("Required Fields", "Please enter the house or unit name.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch (locErr: unknown) {
      console.warn("Location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const record: PoultryWelfareCheck = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      houseName: houseName.trim(),
      flockId: flockId.trim(),
      checkedBy: checkedBy.trim(),
      checkDate: new Date().toISOString(),
      ambientTempC: ambientTempC.trim(),
      ventilationOk,
      lightingOk,
      feedOk,
      waterOk,
      litterCondition,
      birdBehaviour,
      ammoniaLevel,
      dailyMortalities,
      sickInjuredCount,
      overallWelfare,
      actionTaken: actionTaken.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.POULTRY_WELFARE_CHECKS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Poultry welfare check saved. Print or save the record?", [
      { text: "Print", onPress: async () => { await print(poultryWelfareCheckHtml(record, currentFarm)); router.back(); } },
      { text: "Save PDF", onPress: async () => { await savePdf(poultryWelfareCheckHtml(record, currentFarm), "Poultry Welfare Check"); router.back(); } },
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Poultry Welfare Check</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionLabel}>
            <Feather name="home" size={14} color={colors.fieldGreen} />
            <Text style={styles.sectionTitle}>House &amp; Flock</Text>
          </View>
          <Input
            label="House / Unit Name"
            placeholder="e.g. Broiler House 1, Layer Unit A"
            value={houseName}
            onChangeText={setHouseName}
            required
          />
          <Input
            label="Flock / Batch ID"
            placeholder="e.g. Flock 24-07"
            value={flockId}
            onChangeText={setFlockId}
          />
          <Input
            label="Checked By"
            placeholder="Operator name"
            value={checkedBy}
            onChangeText={setCheckedBy}
          />

          <View style={styles.sectionLabel}>
            <Feather name="thermometer" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Environment</Text>
          </View>
          <Input
            label="Ambient Temperature (°C)"
            placeholder="e.g. 21"
            value={ambientTempC}
            onChangeText={setAmbientTempC}
            keyboardType="decimal-pad"
          />
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="wind" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Ventilation / airflow OK</Text>
            </View>
            <Switch
              value={ventilationOk}
              onValueChange={(v) => { Haptics.selectionAsync(); setVentilationOk(v); }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={ventilationOk ? colors.primary : colors.textTertiary}
            />
          </View>
          <View style={[styles.toggleRow, { marginBottom: spacing.xs }]}>
            <View style={styles.toggleInfo}>
              <Feather name="sun" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Lighting adequate</Text>
            </View>
            <Switch
              value={lightingOk}
              onValueChange={(v) => { Haptics.selectionAsync(); setLightingOk(v); }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={lightingOk ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="alert-triangle" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Ammonia Level</Text>
          </View>
          <View style={styles.chipRow}>
            {AMMONIA_LEVELS.map((a) => (
              <Pressable
                key={a.key}
                onPress={() => { Haptics.selectionAsync(); setAmmoniaLevel(a.key); }}
                style={[styles.chip, ammoniaLevel === a.key && { backgroundColor: a.color, borderColor: a.color }]}
              >
                <Text style={[styles.chipText, ammoniaLevel === a.key && { color: colors.textInverse }]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="check-circle" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Feed &amp; Water</Text>
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="cpu" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Feed available</Text>
            </View>
            <Switch
              value={feedOk}
              onValueChange={(v) => { Haptics.selectionAsync(); setFeedOk(v); }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={feedOk ? colors.primary : colors.textTertiary}
            />
          </View>
          <View style={[styles.toggleRow, { marginBottom: spacing.xs }]}>
            <View style={styles.toggleInfo}>
              <Feather name="droplet" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Fresh water available</Text>
            </View>
            <Switch
              value={waterOk}
              onValueChange={(v) => { Haptics.selectionAsync(); setWaterOk(v); }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={waterOk ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="layers" size={14} color={colors.fieldBrown} />
            <Text style={styles.sectionTitle}>Litter Condition</Text>
          </View>
          <View style={styles.chipRow}>
            {LITTER_CONDITIONS.map((l) => (
              <Pressable
                key={l.key}
                onPress={() => { Haptics.selectionAsync(); setLitterCondition(l.key); }}
                style={[styles.chip, litterCondition === l.key && { backgroundColor: l.color, borderColor: l.color }]}
              >
                <Text style={[styles.chipText, litterCondition === l.key && { color: colors.textInverse }]}>{l.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="activity" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Bird Behaviour</Text>
          </View>
          <View style={styles.chipRow}>
            {BEHAVIOURS.map((b) => (
              <Pressable
                key={b.key}
                onPress={() => { Haptics.selectionAsync(); setBirdBehaviour(b.key); }}
                style={[styles.chip, birdBehaviour === b.key && { backgroundColor: b.color, borderColor: b.color }]}
              >
                <Text style={[styles.chipText, birdBehaviour === b.key && { color: colors.textInverse }]}>{b.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="bar-chart-2" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Mortality &amp; Health</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="Daily Mortalities"
              placeholder="0"
              value={dailyMortalities}
              onChangeText={setDailyMortalities}
              keyboardType="number-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Sick / Injured Birds"
              placeholder="0"
              value={sickInjuredCount}
              onChangeText={setSickInjuredCount}
              keyboardType="number-pad"
              containerStyle={styles.flex}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="shield" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Overall Welfare Outcome</Text>
          </View>
          <View style={styles.chipRow}>
            {WELFARE_OUTCOMES.map((w) => (
              <Pressable
                key={w.key}
                onPress={() => { Haptics.selectionAsync(); setOverallWelfare(w.key); }}
                style={[styles.chip, overallWelfare === w.key && { backgroundColor: w.color, borderColor: w.color }]}
              >
                <Text style={[styles.chipText, overallWelfare === w.key && { color: colors.textInverse }]}>{w.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Actions &amp; Notes</Text>
          </View>
          <Input
            label="Action Taken"
            placeholder="e.g. Increased ventilation, removed wet litter from west end"
            value={actionTaken}
            onChangeText={setActionTaken}
            multiline
            numberOfLines={2}
          />
          <Input
            label="Notes"
            placeholder="Any additional observations..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Welfare Check"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  toggleLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
  },
});
