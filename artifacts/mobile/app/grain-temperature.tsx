import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import {
  getCachedGrainBins,
  getRefCacheSyncedMinsAgo,
  type RefGrainBin,
} from "@/lib/refCache";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { GrainTemperatureReading } from "@/lib/types";

const SENSOR_POSITIONS = ["Centre", "Top", "Bottom", "North side", "South side", "East side", "West side", "Probe 1", "Probe 2", "Probe 3"];

export default function GrainTemperatureScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const timeNow = now.toTimeString().slice(0, 5);

  const [binReference, setBinReference] = useState("");
  const [readingDate, setReadingDate] = useState(today);
  const [readingTime, setReadingTime] = useState(timeNow);
  const [temperatureC, setTemperatureC] = useState("");
  const [sensorLocation, setSensorLocation] = useState("Centre");
  const [recordedBy, setRecordedBy] = useState(user?.name || "");
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");

  const [binOptions, setBinOptions] = useState<LookupOption[]>([]);
  const [binsSyncedMinsAgo, setBinsSyncedMinsAgo] = useState<number | null>(null);

  useEffect(() => {
    if (!currentFarm?.id) return;
    const farmId = String(currentFarm.id);
    getCachedGrainBins(farmId).then((bins: RefGrainBin[]) => {
      setBinOptions(bins.map((b) => ({ id: b.id, label: b.label, sublabel: b.sublabel || undefined })));
    });
    getRefCacheSyncedMinsAgo("grain-bins", farmId).then(setBinsSyncedMinsAgo);
  }, [currentFarm?.id]);

  const tempNum = parseFloat(temperatureC);
  const isTempHigh = !isNaN(tempNum) && tempNum > 20;

  const handleSave = async () => {
    if (!binReference.trim() || !temperatureC.trim()) {
      Alert.alert("Required Fields", "Please select a bin / store and enter the temperature.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: GrainTemperatureReading = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      binReference: binReference.trim(),
      readingDate,
      readingTime,
      temperatureC: temperatureC.trim(),
      sensorLocation,
      recordedBy: recordedBy.trim(),
      alertTriggered,
      actionTaken: actionTaken.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.GRAIN_TEMPERATURE_READINGS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Grain temperature reading saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Grain Temperature Reading</Text>
            <Text style={styles.subtitle}>Monitor stored grain condition</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Store Location</Text>
          <Text style={styles.label}>Bin / Store Reference *</Text>
          <LookupPicker
            label="Select Bin / Store"
            value={binReference}
            options={binOptions}
            onSelect={(_id, label) => setBinReference(label)}
            placeholder="Select or search bins…"
            allowFreeText
            syncedMinsAgo={binsSyncedMinsAgo}
            emptyMessage="No bins cached yet — sync when online to populate, or enter manually."
            icon="package"
          />
          <Text style={styles.label}>Sensor Position</Text>
          <View style={styles.chipRow}>
            {SENSOR_POSITIONS.map((p) => (
              <Pressable key={p} onPress={() => setSensorLocation(p)} style={[styles.chip, sensorLocation === p && styles.chipActive]}>
                <Text style={[styles.chipText, sensorLocation === p && styles.chipTextActive]}>{p}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Reading</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Date" value={readingDate} onChangeText={setReadingDate} placeholder="YYYY-MM-DD" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Time" value={readingTime} onChangeText={setReadingTime} placeholder="HH:MM" />
            </View>
          </View>

          <Input label="Temperature (°C) *" value={temperatureC} onChangeText={setTemperatureC} placeholder="e.g. 14.5" keyboardType="decimal-pad" />

          {isTempHigh && (
            <View style={styles.alertBanner}>
              <Feather name="alert-triangle" size={14} color={colors.error} />
              <Text style={styles.alertText}>Temperature above 20°C — grain may be at risk of spoilage. Consider ventilation.</Text>
            </View>
          )}

          <Input label="Recorded By" value={recordedBy} onChangeText={setRecordedBy} placeholder="Name" />

          <Text style={styles.sectionTitle}>Alert / Action</Text>
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Alert Triggered</Text>
              <Text style={styles.switchSub}>Turn on if this reading triggered a management action</Text>
            </View>
            <Switch value={alertTriggered} onValueChange={setAlertTriggered} trackColor={{ false: colors.border, true: colors.error }} thumbColor="#fff" />
          </View>

          {alertTriggered && (
            <Input label="Action Taken" value={actionTaken} onChangeText={setActionTaken} placeholder="e.g. Aeration fan switched on for 4 hours" multiline numberOfLines={3} />
          )}

          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional observations…" multiline numberOfLines={2} />

          <Button title={saving ? "Saving…" : "Save Temperature Reading"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  alertBanner: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: "#FEE2E2", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: "#FECACA" },
  alertText: { flex: 1, fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.error, lineHeight: 20 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  switchLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  switchSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  saveButton: { marginTop: spacing.lg },
});
