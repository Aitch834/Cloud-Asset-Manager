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
import type { LivestockCheck } from "@/lib/types";

type Condition = LivestockCheck["overallCondition"];

const CONDITIONS: { key: Condition; label: string; color: string }[] = [
  { key: "excellent", label: "Excellent", color: colors.success },
  { key: "good", label: "Good", color: colors.primary },
  { key: "fair", label: "Fair", color: colors.accent },
  { key: "poor", label: "Poor / Action Needed", color: colors.error },
];

export default function LivestockCheckScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [herdName, setHerdName] = useState("");
  const [checkedBy, setCheckedBy] = useState(user?.name || "");
  const [overallCondition, setOverallCondition] = useState<Condition>("good");
  const [sickCount, setSickCount] = useState("0");
  const [mortalityCount, setMortalityCount] = useState("0");
  const [feedOk, setFeedOk] = useState(true);
  const [waterOk, setWaterOk] = useState(true);
  const [shelterOk, setShelterOk] = useState(true);
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!herdName.trim()) {
      Alert.alert("Required Fields", "Please enter the herd or flock name.");
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

    const record: LivestockCheck = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      herdName: herdName.trim(),
      checkDate: new Date().toISOString(),
      checkedBy: checkedBy.trim(),
      overallCondition,
      sickCount,
      mortalityCount,
      feedOk,
      waterOk,
      shelterOk,
      actionTaken: actionTaken.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.LIVESTOCK_CHECKS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Livestock health check saved successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Livestock Health Check</Text>
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
            <Text style={styles.sectionTitle}>Herd / Flock</Text>
          </View>
          <Input
            label="Herd / Flock Name"
            placeholder="e.g. Main Dairy Herd, Broiler House 2"
            value={herdName}
            onChangeText={setHerdName}
            required
          />
          <Input
            label="Checked By"
            placeholder="Operator name"
            value={checkedBy}
            onChangeText={setCheckedBy}
          />

          <View style={styles.sectionLabel}>
            <Feather name="heart" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Overall Condition</Text>
          </View>
          <View style={styles.chipRow}>
            {CONDITIONS.map((c) => (
              <Pressable
                key={c.key}
                onPress={() => { Haptics.selectionAsync(); setOverallCondition(c.key); }}
                style={[
                  styles.chip,
                  overallCondition === c.key && { backgroundColor: c.color, borderColor: c.color },
                ]}
              >
                <Text style={[styles.chipText, overallCondition === c.key && { color: colors.textInverse }]}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="bar-chart-2" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Observations</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="Sick / Lame Count"
              placeholder="0"
              value={sickCount}
              onChangeText={setSickCount}
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
            <Feather name="check-circle" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Welfare Checks</Text>
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="cpu" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Feed supply OK</Text>
            </View>
            <Switch
              value={feedOk}
              onValueChange={(v) => { Haptics.selectionAsync(); setFeedOk(v); }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={feedOk ? colors.primary : colors.textTertiary}
            />
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="droplet" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Fresh water OK</Text>
            </View>
            <Switch
              value={waterOk}
              onValueChange={(v) => { Haptics.selectionAsync(); setWaterOk(v); }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={waterOk ? colors.primary : colors.textTertiary}
            />
          </View>
          <View style={[styles.toggleRow, { marginBottom: spacing.lg }]}>
            <View style={styles.toggleInfo}>
              <Feather name="home" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Shelter / housing OK</Text>
            </View>
            <Switch
              value={shelterOk}
              onValueChange={(v) => { Haptics.selectionAsync(); setShelterOk(v); }}
              trackColor={{ false: colors.border, true: colors.primaryMuted }}
              thumbColor={shelterOk ? colors.primary : colors.textTertiary}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Actions & Notes</Text>
          </View>
          <Input
            label="Action Taken"
            placeholder="e.g. Separated sick animal, called vet"
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
            title="Save Health Check"
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
