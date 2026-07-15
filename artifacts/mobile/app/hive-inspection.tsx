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

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const TEMPERAMENT = [
  { key: "docile", label: "Docile" },
  { key: "normal", label: "Normal" },
  { key: "defensive", label: "Defensive" },
  { key: "aggressive", label: "Aggressive" },
];

const HEALTH = [
  { key: "good", label: "Good", color: "#16a34a" },
  { key: "fair", label: "Fair", color: "#d97706" },
  { key: "poor", label: "Poor", color: "#dc2626" },
];

const BROOD_STATUS = [
  { key: "normal", label: "Normal Pattern" },
  { key: "patchy", label: "Patchy" },
  { key: "none", label: "None" },
];

function Chip({ label, selected, onPress, color }: { label: string; selected: boolean; onPress: () => void; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: color ?? colors.primary, borderColor: color ?? colors.primary }]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function SwitchRow({ label, value, onValueChange, hint }: { label: string; value: boolean; onValueChange: (v: boolean) => void; hint?: string }) {
  return (
    <View style={styles.switchRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderLight, true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function HiveInspectionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [inspectionDate, setInspectionDate] = useState(todayDate());
  const [hiveRef, setHiveRef] = useState("");
  const [apiaryRef, setApiaryRef] = useState("");
  const [queenSeen, setQueenSeen] = useState(false);
  const [eggsPresent, setEggsPresent] = useState(false);
  const [queenCellsFound, setQueenCellsFound] = useState(false);
  const [queenCellCount, setQueenCellCount] = useState("");
  const [broodStatus, setBroodStatus] = useState<string>("normal");
  const [temperament, setTemperament] = useState<string>("normal");
  const [varroa, setVarroaCount] = useState("");
  const [foodStores, setFoodStores] = useState("");
  const [supers, setSupers] = useState("");
  const [overallHealth, setOverallHealth] = useState<string>("good");
  const [actionsTaken, setActionsTaken] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSave() {
    if (!currentFarm) {
      Alert.alert("No farm selected", "Please select a farm before saving.");
      return;
    }
    if (!inspectionDate || !hiveRef) {
      Alert.alert("Required", "Please enter the inspection date and hive reference.");
      return;
    }
    setSaving(true);
    try {
      const record = {
        id: generateId(),
        farmId: currentFarm.id,
        inspectionDate,
        hiveRef,
        apiaryRef,
        queenSeen,
        eggsPresent,
        queenCellsFound,
        queenCellCount: queenCellsFound && queenCellCount ? Number(queenCellCount) : null,
        broodStatus,
        temperament,
        varroaCount: varroa ? Number(varroa) : null,
        foodStoresFrames: foodStores ? Number(foodStores) : null,
        superCount: supers ? Number(supers) : null,
        overallHealth,
        actionsTaken,
        notes,
        inspectedBy: user?.name ?? null,
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.HIVE_INSPECTIONS, record);
      await refreshPendingCount();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Hive inspection record saved.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="x" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Hive Inspection</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionHeader}>Hive Details</Text>

          <Text style={styles.label}>Inspection Date</Text>
          <Input value={inspectionDate} onChangeText={setInspectionDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.label}>Hive Reference</Text>
          <Input value={hiveRef} onChangeText={setHiveRef} placeholder="e.g. Hive 3 or Top Bar 1" />

          <Text style={styles.label}>Apiary / Location</Text>
          <Input value={apiaryRef} onChangeText={setApiaryRef} placeholder="e.g. Home Apiary, North Field" />

          <Text style={styles.sectionHeader}>Colony Status</Text>

          <SwitchRow label="Queen Seen" value={queenSeen} onValueChange={setQueenSeen} />
          <SwitchRow label="Eggs Present" value={eggsPresent} onValueChange={setEggsPresent} hint="Indicates a laying queen within the last 3 days" />
          <SwitchRow label="Queen Cells Found" value={queenCellsFound} onValueChange={setQueenCellsFound} />

          {queenCellsFound && (
            <>
              <Text style={styles.label}>Number of Queen Cells</Text>
              <Input value={queenCellCount} onChangeText={setQueenCellCount} placeholder="0" keyboardType="numeric" />
            </>
          )}

          <Text style={styles.label}>Brood Pattern</Text>
          <View style={styles.chips}>
            {BROOD_STATUS.map((b) => (
              <Chip key={b.key} label={b.label} selected={broodStatus === b.key} onPress={() => setBroodStatus(b.key)} />
            ))}
          </View>

          <Text style={styles.label}>Colony Temperament</Text>
          <View style={styles.chips}>
            {TEMPERAMENT.map((t) => (
              <Chip key={t.key} label={t.label} selected={temperament === t.key} onPress={() => setTemperament(t.key)} />
            ))}
          </View>

          <Text style={styles.sectionHeader}>Varroa & Stores</Text>

          <Text style={styles.label}>Varroa Count (mites per 100 bees)</Text>
          <Input value={varroa} onChangeText={setVarroaCount} placeholder="e.g. 3" keyboardType="numeric" />

          <Text style={styles.label}>Food Stores (frames)</Text>
          <Input value={foodStores} onChangeText={setFoodStores} placeholder="e.g. 4" keyboardType="numeric" />

          <Text style={styles.label}>Supers On Hive</Text>
          <Input value={supers} onChangeText={setSupers} placeholder="e.g. 2" keyboardType="numeric" />

          <Text style={styles.sectionHeader}>Assessment</Text>

          <Text style={styles.label}>Overall Colony Health</Text>
          <View style={styles.chips}>
            {HEALTH.map((h) => (
              <Chip key={h.key} label={h.label} selected={overallHealth === h.key} onPress={() => setOverallHealth(h.key)} color={h.color} />
            ))}
          </View>

          <Text style={styles.label}>Actions Taken</Text>
          <Input
            value={actionsTaken}
            onChangeText={setActionsTaken}
            placeholder="Added super, applied Apiguard, merged colony, clipped queen…"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Notes</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional observations"
            multiline
            numberOfLines={3}
          />

          <Button title={saving ? "Saving…" : "Save Inspection"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
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
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backBtn: { padding: 6 },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  body: { padding: spacing.md, gap: spacing.sm, paddingBottom: 40 },
  sectionHeader: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: 4 },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  saveBtn: { marginTop: spacing.lg },
});
