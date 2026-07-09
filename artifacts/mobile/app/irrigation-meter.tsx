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
import type { IrrigationMeterReading } from "@/lib/types";
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";

type PumpCondition = IrrigationMeterReading["pumpCondition"];

const PUMP_CONDITIONS: { key: PumpCondition; label: string; color: string }[] = [
  { key: "ok", label: "OK — no issues", color: colors.success },
  { key: "advisory", label: "Advisory — monitor", color: colors.accent },
  { key: "fault", label: "Fault — action required", color: colors.error },
];

export default function IrrigationMeterScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [sourceName, setSourceName] = useState("");
  const [meterReference, setMeterReference] = useState("");
  const [readingDate] = useState(today);
  const [readingM3, setReadingM3] = useState("");
  const [previousReadingM3, setPreviousReadingM3] = useState("");
  const [recordedBy, setRecordedBy] = useState(user?.name || "");
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
  }, [currentFarm?.id]);
  const [pumpCondition, setPumpCondition] = useState<PumpCondition>("ok");
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  const usageSinceLast =
    readingM3 && previousReadingM3
      ? Math.max(0, parseFloat(readingM3) - parseFloat(previousReadingM3)).toFixed(1)
      : "";

  const captureGPS = async () => {
    setGpsLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required to capture GPS coordinates.");
      setGpsLoading(false);
      return;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setLatitude(loc.coords.latitude);
    setLongitude(loc.coords.longitude);
    setGpsLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSave = async () => {
    if (!sourceName.trim()) {
      Alert.alert("Required", "Please enter the water source name.");
      return;
    }
    if (!readingM3.trim()) {
      Alert.alert("Required", "Please enter the meter reading.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: IrrigationMeterReading = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      sourceName: sourceName.trim(),
      meterReference: meterReference.trim(),
      readingDate,
      readingM3: readingM3.trim(),
      previousReadingM3: previousReadingM3.trim(),
      usageSinceLast,
      recordedBy: recordedBy.trim(),
      pumpCondition,
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.IRRIGATION_METER_READINGS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Reading Saved",
      usageSinceLast
        ? `Usage since last reading: ${usageSinceLast} m³`
        : "Meter reading recorded.",
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
          <Text style={styles.title}>Irrigation Meter Reading</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Source & Meter</Text>
            <Input
              label="Water Source Name"
              value={sourceName}
              onChangeText={setSourceName}
              placeholder="e.g. North bore hole, River abstraction, Reservoir 1"
              autoCapitalize="words"
            />
            <Input
              label="Meter Reference"
              value={meterReference}
              onChangeText={setMeterReference}
              placeholder="Meter ID or abstraction licence number"
            />
            <LookupPicker label="Recorded By" options={staffOptions} value={recordedBy} onSelect={(_id, l) => setRecordedBy(l)} allowFreeText />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meter Readings (m³)</Text>
            <Input
              label="Current Reading (m³)"
              value={readingM3}
              onChangeText={setReadingM3}
              placeholder="e.g. 12450.5"
              keyboardType="decimal-pad"
            />
            <Input
              label="Previous Reading (m³)"
              value={previousReadingM3}
              onChangeText={setPreviousReadingM3}
              placeholder="e.g. 12200.0 — leave blank if first reading"
              keyboardType="decimal-pad"
            />
            {usageSinceLast !== "" && (
              <View style={styles.usageCard}>
                <Feather name="activity" size={16} color={colors.primary} />
                <Text style={styles.usageLabel}>Usage since last reading</Text>
                <Text style={styles.usageValue}>{usageSinceLast} m³</Text>
              </View>
            )}
            <Input
              label="Reading Date"
              value={readingDate}
              editable={false}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pump / Infrastructure Condition</Text>
            {PUMP_CONDITIONS.map((c) => (
              <Pressable
                key={c.key}
                onPress={() => setPumpCondition(c.key)}
                style={[styles.option, pumpCondition === c.key && { borderColor: c.color, backgroundColor: c.color + "15" }]}
              >
                <View style={[styles.radio, pumpCondition === c.key && { borderColor: c.color }]}>
                  {pumpCondition === c.key && <View style={[styles.radioInner, { backgroundColor: c.color }]} />}
                </View>
                <Text style={[styles.optionLabel, pumpCondition === c.key && { color: c.color }]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Pressable onPress={captureGPS} style={styles.gpsButton} disabled={gpsLoading}>
              <Feather name="map-pin" size={18} color={latitude ? colors.success : colors.primary} />
              <Text style={[styles.gpsButtonText, latitude ? { color: colors.success } : {}]}>
                {gpsLoading ? "Getting location…" : latitude ? `GPS: ${latitude.toFixed(5)}, ${longitude?.toFixed(5)}` : "Capture GPS Location"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Licence condition notes, abstraction restrictions, issues observed…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Button
              title={saving ? "Saving…" : "Save Meter Reading"}
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
  usageCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryMuted + "22",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + "33",
  },
  usageLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  usageValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.primary,
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
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  gpsButtonText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});
