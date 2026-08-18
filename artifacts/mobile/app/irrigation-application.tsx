import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { useApiModules } from "@/lib/hooks/useApiModules";
import { appendToList, generateId, getItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import type { IrrigationApplication } from "@/lib/types";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

const METHODS = [
  "Drip / Trickle",
  "Overhead Sprinkler",
  "Boom Irrigation",
  "Flood / Furrow",
  "Linear Move",
  "Rain Gun",
  "Sub-surface Drip",
  "Micro-jet",
];

const DEFAULT_IRRIGATION_METHOD = "Overhead Sprinkler";
const irrigMethodKey = (farmId: string | number) => `bde_irrigation_method_${farmId}`;

const GROWTH_STAGES = [
  "Germination / Establishment",
  "Vegetative Growth",
  "Canopy Development",
  "Flowering",
  "Fruit / Tuber Initiation",
  "Bulking / Fill",
  "Ripening / Maturation",
  "Harvest",
];

function OptionButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.option,
        selected && { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
      ]}
    >
      <View style={[styles.radio, selected && { borderColor: colors.primary }]}>
        {selected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
      </View>
      <Text style={[styles.optionLabel, selected && { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

export default function IrrigationApplicationScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { activeModuleKeys, resolvedFarmId } = useApiModules(currentFarm?.id ? String(currentFarm.id) : undefined);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [irrigationDate] = useState(today);
  const [waterSource, setWaterSource] = useState("");
  const [fieldOrBlockDescription, setFieldOrBlockDescription] = useState("");
  const [cropType, setCropType] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [irrigationMethod, setIrrigationMethod] = useState("");
  const [meterStartReading, setMeterStartReading] = useState("");
  const [meterEndReading, setMeterEndReading] = useState("");
  const [volumeAppliedM3, setVolumeAppliedM3] = useState("");
  const [areaIrrigatedHa, setAreaIrrigatedHa] = useState("");
  const [operatorName, setOperatorName] = useState(user?.name || "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);

  // Load last-used irrigation method for this farm.
  // Reset to empty immediately so a prior farm's value never leaks in,
  // then apply the stored value only if the farm hasn't changed again.
  useEffect(() => {
    setIrrigationMethod("");
    if (!currentFarm?.id) return;
    let cancelled = false;
    getItem<string>(irrigMethodKey(currentFarm.id)).then((saved) => {
      if (!cancelled && saved && METHODS.includes(saved)) {
        setIrrigationMethod(saved);
      }
    });
    return () => { cancelled = true; };
  }, [currentFarm?.id]);
  const [rainfallLast7DaysMm, setRainfallLast7DaysMm] = useState("");
  const [notes, setNotes] = useState("");

  const meterVolume =
    meterStartReading && meterEndReading
      ? Math.max(0, parseFloat(meterEndReading) - parseFloat(meterStartReading))
      : null;

  const effectiveVolume = meterVolume ?? (volumeAppliedM3 ? parseFloat(volumeAppliedM3) : null);
  const effectiveArea = areaIrrigatedHa ? parseFloat(areaIrrigatedHa) : null;
  const applicationDepthMm =
    effectiveVolume && effectiveArea && effectiveArea > 0
      ? ((effectiveVolume / (effectiveArea * 10000)) * 1000).toFixed(1)
      : "";

  const handleSave = async () => {
    // Guard: if the module cache has been resolved for this farm and water-irrigation
    // is not among the active modules, refuse to queue the record. Without this check
    // the sync engine would retry the upload indefinitely after the server returns 403.
    const farmIdStr = currentFarm?.id ? String(currentFarm.id) : undefined;
    if (farmIdStr && resolvedFarmId === farmIdStr && !activeModuleKeys.includes("water-irrigation")) {
      Alert.alert(
        "Module Not Enabled",
        "The Water & Irrigation module is not active on this farm. Please contact your farm administrator to enable it before logging irrigation records.",
        [{ text: "OK" }]
      );
      return;
    }

    if (!fieldOrBlockDescription.trim()) {
      Alert.alert("Required", "Please enter the field or block being irrigated.");
      return;
    }
    if (!irrigationMethod) {
      Alert.alert("Required", "Please select the irrigation method.");
      return;
    }
    const finalVolume = meterVolume !== null ? meterVolume.toFixed(2) : volumeAppliedM3.trim();

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: IrrigationApplication = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      irrigationDate,
      waterSource: waterSource.trim(),
      fieldOrBlockDescription: fieldOrBlockDescription.trim(),
      cropType: cropType.trim(),
      growthStage,
      irrigationMethod,
      meterStartReading: meterStartReading.trim(),
      meterEndReading: meterEndReading.trim(),
      volumeAppliedM3: finalVolume,
      applicationDepthMm,
      areaIrrigatedHa: areaIrrigatedHa.trim(),
      operatorName: operatorName.trim(),
      rainfallLast7DaysMm: rainfallLast7DaysMm.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.IRRIGATION_APPLICATIONS, record);
    if (currentFarm?.id) {
      await setItem(irrigMethodKey(currentFarm.id), irrigationMethod);
    }
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Irrigation Logged",
      [
        `Field: ${record.fieldOrBlockDescription}`,
        finalVolume ? `Volume: ${finalVolume} m³` : null,
        applicationDepthMm ? `Depth: ${applicationDepthMm} mm` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      [{ text: "Done", onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Irrigation Application</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── WHEN / WHO ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>When &amp; Who</Text>
            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Date</Text>
                <View style={styles.readonlyField}>
                  <Text style={styles.readonlyText}>{irrigationDate}</Text>
                </View>
              </View>
            </View>
            <LookupPicker label="Operator" options={staffOptions} value={operatorName} onSelect={(_id, l) => setOperatorName(l)} allowFreeText />
          </View>

          {/* ── FIELD / CROP ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Field &amp; Crop</Text>
            <Input
              label="Field / Block *"
              value={fieldOrBlockDescription}
              onChangeText={setFieldOrBlockDescription}
              placeholder="e.g. Home Field, North block, Polytunnel 3"
              autoCapitalize="words"
            />
            <Input
              label="Area Irrigated (ha)"
              value={areaIrrigatedHa}
              onChangeText={setAreaIrrigatedHa}
              placeholder="e.g. 3.25"
              keyboardType="decimal-pad"
            />
            <Input
              label="Crop Type"
              value={cropType}
              onChangeText={setCropType}
              placeholder="e.g. Potatoes, Lettuce, Strawberries"
              autoCapitalize="words"
            />
            <Text style={styles.fieldLabel}>Growth Stage</Text>
            {GROWTH_STAGES.map(stage => (
              <OptionButton
                key={stage}
                label={stage}
                selected={growthStage === stage}
                onPress={() => setGrowthStage(growthStage === stage ? "" : stage)}
              />
            ))}
          </View>

          {/* ── WATER SOURCE ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Water Source</Text>
            <Input
              label="Water Source / Licence"
              value={waterSource}
              onChangeText={setWaterSource}
              placeholder="e.g. North borehole, Licence 12/54/18/0012"
              autoCapitalize="words"
            />
          </View>

          {/* ── METHOD ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Irrigation Method *</Text>
            {METHODS.map(method => (
              <OptionButton
                key={method}
                label={method}
                selected={irrigationMethod === method}
                onPress={() => setIrrigationMethod(method)}
              />
            ))}
          </View>

          {/* ── METER READINGS ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meter Readings</Text>
            <Text style={styles.hint}>
              Enter the meter reading before and after the run — volume will be calculated automatically.
              Leave blank if no meter is fitted and enter volume directly.
            </Text>
            <Input
              label="Meter Start Reading (m³)"
              value={meterStartReading}
              onChangeText={setMeterStartReading}
              placeholder="Reading at start of run"
              keyboardType="decimal-pad"
            />
            <Input
              label="Meter End Reading (m³)"
              value={meterEndReading}
              onChangeText={setMeterEndReading}
              placeholder="Reading at end of run"
              keyboardType="decimal-pad"
            />
            {meterVolume !== null && (
              <View style={styles.calcCard}>
                <Feather name="droplet" size={16} color={colors.success} />
                <Text style={styles.calcLabel}>Volume from meter</Text>
                <Text style={styles.calcValue}>{meterVolume.toFixed(2)} m³</Text>
              </View>
            )}
          </View>

          {/* ── VOLUMES ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Volume &amp; Depth</Text>
            {meterVolume !== null ? (
              <View style={styles.readonlyCard}>
                <Text style={styles.readonlyCardLabel}>Volume Applied (from meter)</Text>
                <Text style={styles.readonlyCardValue}>{meterVolume.toFixed(2)} m³</Text>
              </View>
            ) : (
              <Input
                label="Volume Applied (m³)"
                value={volumeAppliedM3}
                onChangeText={setVolumeAppliedM3}
                placeholder="m³ abstracted"
                keyboardType="decimal-pad"
              />
            )}
            {applicationDepthMm ? (
              <View style={styles.calcCard}>
                <Feather name="layers" size={16} color={colors.primary} />
                <Text style={styles.calcLabel}>Application depth (calculated)</Text>
                <Text style={styles.calcValue}>{applicationDepthMm} mm</Text>
              </View>
            ) : null}
            {!applicationDepthMm && (
              <Text style={styles.hint}>
                Application depth is calculated automatically from volume ÷ area (volume m³ ÷ area ha ÷ 10 = mm).
                Fill in area and volume above to calculate it.
              </Text>
            )}
          </View>

          {/* ── OTHER ── */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other</Text>
            <Input
              label="Rainfall Last 7 Days (mm)"
              value={rainfallLast7DaysMm}
              onChangeText={setRainfallLast7DaysMm}
              placeholder="Recent rainfall — helps justify irrigation decision"
              keyboardType="decimal-pad"
            />
            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Any observations, issues, or relevant conditions…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Button
              title={saving ? "Saving…" : "Save Irrigation Record"}
              onPress={handleSave}
              disabled={saving}
            />
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  row: { flexDirection: "row", gap: spacing.md },
  field: {},
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  readonlyField: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  readonlyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  optionLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  calcCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.success + "18",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.success + "40",
  },
  calcLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.success,
  },
  calcValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.success,
  },
  readonlyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  readonlyCardLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  readonlyCardValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.text,
  },
});
