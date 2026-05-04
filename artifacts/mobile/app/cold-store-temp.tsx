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
import type { ColdStoreTempReading } from "@/lib/types";

const STORE_TYPES = ["Cold Room", "Blast Chiller", "CA Store", "Refrigerated Container", "Walk-in Freezer", "Other"];

export default function ColdStoreTempScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const timeNow = now.toTimeString().slice(0, 5);

  const [storeReference, setStoreReference] = useState("");
  const [storeName, setStoreName] = useState("Cold Room");
  const [readingDate, setReadingDate] = useState(today);
  const [readingTime, setReadingTime] = useState(timeNow);
  const [temperatureC, setTemperatureC] = useState("");
  const [targetMinC, setTargetMinC] = useState("");
  const [targetMaxC, setTargetMaxC] = useState("");
  const [recordedBy, setRecordedBy] = useState(user?.name || "");
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");

  const tempNum = parseFloat(temperatureC);
  const minNum = parseFloat(targetMinC);
  const maxNum = parseFloat(targetMaxC);
  const isOutOfRange = !isNaN(tempNum) && !isNaN(minNum) && !isNaN(maxNum) && (tempNum < minNum || tempNum > maxNum);

  const handleSave = async () => {
    if (!storeReference.trim() || !temperatureC.trim()) {
      Alert.alert("Required Fields", "Please enter the store reference and temperature reading.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: ColdStoreTempReading = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      storeReference: storeReference.trim(),
      storeName,
      readingDate,
      readingTime,
      temperatureC: temperatureC.trim(),
      targetMinC: targetMinC.trim(),
      targetMaxC: targetMaxC.trim(),
      alertTriggered: alertTriggered || isOutOfRange,
      actionTaken: actionTaken.trim(),
      recordedBy: recordedBy.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.COLD_STORE_TEMP_READINGS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Cold store temperature reading saved offline and queued for sync.", [
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
            <Text style={styles.title}>Cold Store Temperature Log</Text>
            <Text style={styles.subtitle}>Daily temperature monitoring & compliance</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Store</Text>
          <Input label="Store Reference / ID *" value={storeReference} onChangeText={setStoreReference} placeholder="e.g. CS-01 / Packing Chill 1" />
          <Text style={styles.label}>Store Type</Text>
          <View style={styles.chipRow}>
            {STORE_TYPES.map((s) => (
              <Pressable key={s} onPress={() => setStoreName(s)} style={[styles.chip, storeName === s && styles.chipActive]}>
                <Text style={[styles.chipText, storeName === s && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Target Range</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Target Min (°C)" value={targetMinC} onChangeText={setTargetMinC} placeholder="e.g. 2" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Target Max (°C)" value={targetMaxC} onChangeText={setTargetMaxC} placeholder="e.g. 8" keyboardType="decimal-pad" />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Reading</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Date" value={readingDate} onChangeText={setReadingDate} placeholder="YYYY-MM-DD" maxDate="today" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Time" value={readingTime} onChangeText={setReadingTime} placeholder="HH:MM" />
            </View>
          </View>
          <Input label="Temperature (°C) *" value={temperatureC} onChangeText={setTemperatureC} placeholder="e.g. 5.2" keyboardType="decimal-pad" />

          {isOutOfRange && (
            <View style={styles.alertBanner}>
              <Feather name="alert-triangle" size={14} color={colors.error} />
              <Text style={styles.alertText}>
                Temperature {temperatureC}°C is outside the target range ({targetMinC}–{targetMaxC}°C). Please record the action taken below.
              </Text>
            </View>
          )}

          {!isNaN(tempNum) && !isOutOfRange && !isNaN(minNum) && !isNaN(maxNum) && (
            <View style={styles.okBanner}>
              <Feather name="check-circle" size={14} color={colors.success} />
              <Text style={styles.okText}>Temperature {temperatureC}°C is within the target range.</Text>
            </View>
          )}

          <Input label="Recorded By" value={recordedBy} onChangeText={setRecordedBy} placeholder="Name" />

          <Text style={styles.sectionTitle}>Alert & Action</Text>
          <View style={[styles.switchRow, alertTriggered && { borderColor: colors.error }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.switchLabel, alertTriggered && { color: colors.error }]}>Alert / Non-Conformance</Text>
              <Text style={styles.switchSub}>Turn on if this reading triggered a corrective action</Text>
            </View>
            <Switch value={alertTriggered || isOutOfRange} onValueChange={setAlertTriggered} trackColor={{ false: colors.border, true: colors.error }} thumbColor="#fff" />
          </View>

          {(alertTriggered || isOutOfRange) && (
            <Input label="Action Taken *" value={actionTaken} onChangeText={setActionTaken} placeholder="e.g. Engineer called, product moved to alternate store" multiline numberOfLines={3} />
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
  alertBanner: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: "#FEF2F2", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: "#FECACA" },
  alertText: { flex: 1, fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.error, lineHeight: 20 },
  okBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: "#F0FDF4", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: "#BBF7D0" },
  okText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.success, flex: 1 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  switchLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  switchSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  saveButton: { marginTop: spacing.lg },
});
