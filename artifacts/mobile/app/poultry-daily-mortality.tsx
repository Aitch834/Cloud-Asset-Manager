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
import { FlockPicker } from "@/components/ui/FlockPicker";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiPoultryFlocks } from "@/lib/hooks/useApiPoultryFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PoultryDailyMortality } from "@/lib/types";

const CAUSES = [
  "Unknown", "Heart/circulatory failure", "Respiratory disease", "Enteric disease",
  "Leg / skeletal disorder", "Predator", "Smothering", "Culled — poor condition",
  "Culled — injury", "Other",
];

export default function PoultryDailyMortalityScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPoultryFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [flockId, setFlockId] = useState<number>(0);
  const [flockNumber, setFlockNumber] = useState("");
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split("T")[0]);
  const [mortalityCount, setMortalityCount] = useState("0");
  const [culledCount, setCulledCount] = useState("0");
  const [mainCause, setMainCause] = useState("Unknown");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!flockNumber.trim()) {
      Alert.alert("Required Fields", "Please select a flock.");
      return;
    }
    if (!recordDate.trim()) {
      Alert.alert("Required Fields", "Please enter the record date.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PoultryDailyMortality = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockId,
      flockNumber: flockNumber.trim(),
      recordDate,
      mortalityCount: mortalityCount.trim() || "0",
      culledCount: culledCount.trim() || "0",
      mainCause,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.POULTRY_DAILY_MORTALITY, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Daily mortality record saved and queued for sync.", [
      { text: "Record Another", onPress: () => {
        setMortalityCount("0"); setCulledCount("0"); setNotes(""); setMainCause("Unknown");
      }},
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Daily Mortality</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.sectionLabel}>
            <Feather name="feather" size={14} color="#d97706" />
            <Text style={styles.sectionTitle}>Flock &amp; Date</Text>
          </View>
          <FlockPicker
            label="Select Flock *"
            value={flockNumber}
            onChange={setFlockNumber}
            onChangeFlock={(f) => setFlockId(f.id)}
            flocks={flocks}
            loading={flocksLoading}
            fromCache={fromCache}
            error={flocksError}
          />
          <Input
            label="Record Date *"
            placeholder="YYYY-MM-DD"
            value={recordDate}
            onChangeText={setRecordDate}
            required
          />

          <View style={styles.sectionLabel}>
            <Feather name="alert-triangle" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Mortality Counts</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="Dead (natural)"
              placeholder="0"
              value={mortalityCount}
              onChangeText={setMortalityCount}
              keyboardType="number-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Culled"
              placeholder="0"
              value={culledCount}
              onChangeText={setCulledCount}
              keyboardType="number-pad"
              containerStyle={styles.flex}
            />
          </View>
          <Text style={styles.hint}>
            Total: {(parseInt(mortalityCount || "0", 10) + parseInt(culledCount || "0", 10))} birds
          </Text>

          <View style={styles.sectionLabel}>
            <Feather name="info" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Main Cause</Text>
          </View>
          <View style={styles.chipRow}>
            {CAUSES.map((c) => (
              <Pressable
                key={c}
                onPress={() => { Haptics.selectionAsync(); setMainCause(c); }}
                style={[styles.chip, mainCause === c && styles.chipSelected]}
              >
                <Text style={[styles.chipText, mainCause === c && styles.chipTextSelected]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input
            label="Additional Notes"
            placeholder="Any observations, pen location, actions taken…"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button title="Save Mortality Record" onPress={handleSave} loading={saving} fullWidth icon="check" />
          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.sm },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", gap: spacing.md },
  hint: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary, marginBottom: spacing.md, marginTop: -spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipSelected: { backgroundColor: colors.error, borderColor: colors.error },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { color: colors.textInverse },
});
