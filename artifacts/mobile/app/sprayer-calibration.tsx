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
import type { SprayerCalibration } from "@/lib/types";

type Result = SprayerCalibration["passOrFail"];

const NOZZLE_TYPES = ["Flat fan", "Air induction", "Twin flat fan", "Deflector", "Rotary", "Hollow cone", "Other"];
const RESULT_OPTIONS: { key: Result; label: string; color: string }[] = [
  { key: "pass", label: "Pass", color: colors.success },
  { key: "advisory", label: "Advisory — monitor", color: colors.accent },
  { key: "fail", label: "Fail — remediation required", color: colors.error },
];

export default function SprayerCalibrationScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [sprayerName, setSprayerName] = useState("");
  const [calibrationDate, setCalibrationDate] = useState(today);
  const [calibratedBy, setCalibratedBy] = useState(user?.name || "");
  const [certificationNumber, setCertificationNumber] = useState("");
  const [nozzleType, setNozzleType] = useState("Flat fan");
  const [nozzleSize, setNozzleSize] = useState("");
  const [pressureBar, setPressureBar] = useState("");
  const [speedKmh, setSpeedKmh] = useState("");
  const [targetVolumePerHa, setTargetVolumePerHa] = useState("");
  const [actualVolumePerHa, setActualVolumePerHa] = useState("");
  const [passOrFail, setPassOrFail] = useState<Result>("pass");
  const [nextCalibrationDue, setNextCalibrationDue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (calibrationDate) {
      const d = new Date(calibrationDate);
      d.setFullYear(d.getFullYear() + 1);
      setNextCalibrationDue(d.toISOString().split("T")[0]);
    }
  }, [calibrationDate]);

  const deviation = (() => {
    const target = parseFloat(targetVolumePerHa);
    const actual = parseFloat(actualVolumePerHa);
    if (!isNaN(target) && !isNaN(actual) && target > 0) {
      return (((actual - target) / target) * 100).toFixed(1);
    }
    return null;
  })();

  const handleSave = async () => {
    if (!sprayerName.trim() || !calibrationDate) {
      Alert.alert("Required Fields", "Please enter the sprayer name and calibration date.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: SprayerCalibration = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      sprayerName: sprayerName.trim(),
      calibrationDate,
      calibratedBy: calibratedBy.trim(),
      certificationNumber: certificationNumber.trim(),
      nozzleType,
      nozzleSize: nozzleSize.trim(),
      pressureBar: pressureBar.trim(),
      speedKmh: speedKmh.trim(),
      targetVolumePerHa: targetVolumePerHa.trim(),
      actualVolumePerHa: actualVolumePerHa.trim(),
      passOrFail,
      nextCalibrationDue,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SPRAYER_CALIBRATIONS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Sprayer calibration saved offline and queued for sync.", [
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
            <Text style={styles.title}>Sprayer Calibration</Text>
            <Text style={styles.subtitle}>Nozzle checks, output & NSTS compliance</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Sprayer</Text>
          <Input label="Sprayer Name / Registration *" value={sprayerName} onChangeText={setSprayerName} placeholder="e.g. Amazone UX5200" />
          <Input label="Calibration Date *" value={calibrationDate} onChangeText={setCalibrationDate} placeholder="YYYY-MM-DD" />
          <Input label="Calibrated By" value={calibratedBy} onChangeText={setCalibratedBy} placeholder="Name or NSTS engineer" />
          <Input label="NSTS / Certification Number" value={certificationNumber} onChangeText={setCertificationNumber} placeholder="Certificate reference" />

          <Text style={styles.sectionTitle}>Nozzle Setup</Text>
          <Text style={styles.label}>Nozzle Type</Text>
          <View style={styles.chipRow}>
            {NOZZLE_TYPES.map((n) => (
              <Pressable key={n} onPress={() => setNozzleType(n)} style={[styles.chip, nozzleType === n && styles.chipActive]}>
                <Text style={[styles.chipText, nozzleType === n && styles.chipTextActive]}>{n}</Text>
              </Pressable>
            ))}
          </View>
          <Input label="Nozzle Size / Colour" value={nozzleSize} onChangeText={setNozzleSize} placeholder="e.g. 03 / Blue" />

          <Text style={styles.sectionTitle}>Operating Parameters</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Pressure (bar)" value={pressureBar} onChangeText={setPressureBar} placeholder="e.g. 2.5" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Speed (km/h)" value={speedKmh} onChangeText={setSpeedKmh} placeholder="e.g. 8" keyboardType="decimal-pad" />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Output Check</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Target Volume (L/ha)" value={targetVolumePerHa} onChangeText={setTargetVolumePerHa} placeholder="e.g. 200" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Actual Volume (L/ha)" value={actualVolumePerHa} onChangeText={setActualVolumePerHa} placeholder="e.g. 198" keyboardType="decimal-pad" />
            </View>
          </View>

          {deviation !== null && (
            <View style={[styles.deviationBanner, parseFloat(deviation) > 5 || parseFloat(deviation) < -5 ? styles.deviationFail : styles.deviationOk]}>
              <Feather name={Math.abs(parseFloat(deviation)) <= 5 ? "check-circle" : "alert-triangle"} size={14} color={Math.abs(parseFloat(deviation)) <= 5 ? colors.success : colors.error} />
              <Text style={[styles.deviationText, { color: Math.abs(parseFloat(deviation)) <= 5 ? colors.success : colors.error }]}>
                Output deviation: {deviation}% {Math.abs(parseFloat(deviation)) <= 5 ? "(within ±5% tolerance)" : "(exceeds ±5% — check nozzles)"}
              </Text>
            </View>
          )}

          <Text style={styles.label}>Overall Result</Text>
          <View style={styles.chipRow}>
            {RESULT_OPTIONS.map((r) => (
              <Pressable key={r.key} onPress={() => setPassOrFail(r.key)} style={[styles.chip, passOrFail === r.key && { borderColor: r.color, backgroundColor: r.color + "20" }]}>
                <Text style={[styles.chipText, passOrFail === r.key && { color: r.color, fontFamily: fonts.semiBold }]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>

          <Input label="Next Calibration Due (auto-set to +1 year)" value={nextCalibrationDue} onChangeText={setNextCalibrationDue} placeholder="YYYY-MM-DD" />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any observations or remedial actions…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Calibration Record"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
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
  deviationBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
  deviationOk: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  deviationFail: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  deviationText: { fontFamily: fonts.medium, fontSize: fontSize.sm, flex: 1 },
  saveButton: { marginTop: spacing.lg },
});
