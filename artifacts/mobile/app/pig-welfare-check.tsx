import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
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
import type { PigWelfareCheck } from "@/lib/types";
import { usePrint } from "@/lib/hooks/usePrint";
import { pigWelfareCheckHtml } from "@/lib/printTemplates";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

type Behaviour = PigWelfareCheck["behaviour"];
type BeddingCondition = PigWelfareCheck["beddingCondition"];
type OverallWelfare = PigWelfareCheck["overallWelfare"];

const BEHAVIOURS: { key: Behaviour; label: string; color: string }[] = [
  { key: "normal", label: "Normal", color: colors.success },
  { key: "lethargic", label: "Lethargic", color: colors.accent },
  { key: "distressed", label: "Distressed", color: colors.error },
];

const BEDDING_CONDITIONS: { key: BeddingCondition; label: string; color: string }[] = [
  { key: "clean", label: "Clean & dry", color: colors.success },
  { key: "damp", label: "Damp", color: colors.primary },
  { key: "wet", label: "Wet", color: colors.accent },
  { key: "fouled", label: "Fouled — action needed", color: colors.error },
];

const WELFARE_OUTCOMES: { key: OverallWelfare; label: string; color: string }[] = [
  { key: "pass", label: "Pass", color: colors.success },
  { key: "advisory", label: "Advisory", color: colors.accent },
  { key: "fail", label: "Fail — action required", color: colors.error },
];

export default function PigWelfareCheckScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const [saving, setSaving] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [pigsInGroup, setPigsInGroup] = useState("");
  const [checkedBy, setCheckedBy] = useState(user?.name || "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);
  const [behaviour, setBehaviour] = useState<Behaviour>("normal");
  const [ventilationOk, setVentilationOk] = useState(true);
  const [feedOk, setFeedOk] = useState(true);
  const [waterOk, setWaterOk] = useState(true);
  const [beddingCondition, setBeddingCondition] = useState<BeddingCondition>("clean");
  const [tailBitingObserved, setTailBitingObserved] = useState(false);
  const [aggression, setAggression] = useState(false);
  const [sickInjuredCount, setSickInjuredCount] = useState("0");
  const [mortalityCount, setMortalityCount] = useState("0");
  const [overallWelfare, setOverallWelfare] = useState<OverallWelfare>("pass");
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!groupName.trim()) {
      Alert.alert("Required Fields", "Please enter the group or pen name.");
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

    const record: PigWelfareCheck = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      groupName: groupName.trim(),
      pigsInGroup: pigsInGroup.trim(),
      checkedBy: checkedBy.trim(),
      checkDate: new Date().toISOString(),
      behaviour,
      ventilationOk,
      feedOk,
      waterOk,
      beddingCondition,
      tailBitingObserved,
      aggression,
      sickInjuredCount,
      mortalityCount,
      overallWelfare,
      actionTaken: actionTaken.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PIG_WELFARE_CHECKS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Pig welfare check saved. Print or save the record?", [
      { text: "Print", onPress: async () => { await print(pigWelfareCheckHtml(record, currentFarm)); router.back(); } },
      { text: "Save PDF", onPress: async () => { await savePdf(pigWelfareCheckHtml(record, currentFarm), "Pig Welfare Check"); router.back(); } },
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Pig Welfare Check</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionLabel}>
            <Feather name="users" size={14} color={colors.fieldGreen} />
            <Text style={styles.sectionTitle}>Group / Pen</Text>
          </View>
          <Input
            label="Group / Pen Name"
            placeholder="e.g. Farrowing House 1, Finisher Pen B"
            value={groupName}
            onChangeText={setGroupName}
            required
          />
          <Input
            label="Pigs in Group"
            placeholder="e.g. 45"
            value={pigsInGroup}
            onChangeText={setPigsInGroup}
            keyboardType="number-pad"
          />
          <LookupPicker label="Checked By" options={staffOptions} value={checkedBy} onSelect={(_id, l) => setCheckedBy(l)} allowFreeText />

          <View style={styles.sectionLabel}>
            <Feather name="activity" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Pig Behaviour</Text>
          </View>
          <View style={styles.chipRow}>
            {BEHAVIOURS.map((b) => (
              <Pressable
                key={b.key}
                onPress={() => { Haptics.selectionAsync(); setBehaviour(b.key); }}
                style={[styles.chip, behaviour === b.key && { backgroundColor: b.color, borderColor: b.color }]}
              >
                <Text style={[styles.chipText, behaviour === b.key && { color: colors.textInverse }]}>{b.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="check-circle" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Environment &amp; Resources</Text>
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="wind" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Ventilation / temperature OK</Text>
            </View>
            <Switch
              value={ventilationOk}
              onValueChange={(v) => { Haptics.selectionAsync(); setVentilationOk(v); }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={ventilationOk ? colors.primary : colors.textTertiary}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="cpu" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Feed adequate</Text>
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
            <Text style={styles.sectionTitle}>Bedding / Floor Condition</Text>
          </View>
          <View style={styles.chipRow}>
            {BEDDING_CONDITIONS.map((b) => (
              <Pressable
                key={b.key}
                onPress={() => { Haptics.selectionAsync(); setBeddingCondition(b.key); }}
                style={[styles.chip, beddingCondition === b.key && { backgroundColor: b.color, borderColor: b.color }]}
              >
                <Text style={[styles.chipText, beddingCondition === b.key && { color: colors.textInverse }]}>{b.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="alert-triangle" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Welfare Concerns</Text>
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="scissors" size={16} color={colors.error} />
              <Text style={styles.toggleLabel}>Tail biting observed</Text>
            </View>
            <Switch
              value={tailBitingObserved}
              onValueChange={(v) => { Haptics.selectionAsync(); setTailBitingObserved(v); }}
              trackColor={{ false: colors.border, true: "#fecdd3" }}
              thumbColor={tailBitingObserved ? colors.error : colors.textTertiary}
            />
          </View>
          <View style={[styles.toggleRow, { marginBottom: spacing.xs }]}>
            <View style={styles.toggleInfo}>
              <Feather name="zap" size={16} color={colors.error} />
              <Text style={styles.toggleLabel}>Fighting / aggression observed</Text>
            </View>
            <Switch
              value={aggression}
              onValueChange={(v) => { Haptics.selectionAsync(); setAggression(v); }}
              trackColor={{ false: colors.border, true: "#fecdd3" }}
              thumbColor={aggression ? colors.error : colors.textTertiary}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="bar-chart-2" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Sick &amp; Mortalities</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="Sick / Injured Pigs"
              placeholder="0"
              value={sickInjuredCount}
              onChangeText={setSickInjuredCount}
              keyboardType="number-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Mortalities"
              placeholder="0"
              value={mortalityCount}
              onChangeText={setMortalityCount}
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
            placeholder="e.g. Separated injured pig, applied wound spray, checked drinkers"
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
