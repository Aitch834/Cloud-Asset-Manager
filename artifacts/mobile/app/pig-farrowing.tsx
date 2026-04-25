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
import type { PigFarrowingRecord } from "@/lib/types";

type FarrowingEase = string;
type BCS = PigFarrowingRecord["sowConditionScore"];

const FARROWING_EASE: { key: FarrowingEase; label: string; color: string }[] = [
  { key: "1 — Unassisted", label: "1 — Unassisted (no help needed)", color: colors.success },
  { key: "2 — Minor assistance", label: "2 — Minor assistance (1 person)", color: colors.primary },
  { key: "3 — Major assistance", label: "3 — Major assistance (mechanical / multiple staff)", color: colors.accent },
  { key: "4 — Vet required", label: "4 — Vet required / caesarean", color: colors.error },
];

const BCS_OPTIONS: { key: BCS; label: string }[] = [
  { key: "1", label: "1 — Emaciated" },
  { key: "2", label: "2 — Thin" },
  { key: "3", label: "3 — Ideal" },
  { key: "4", label: "4 — Overweight" },
  { key: "5", label: "5 — Obese" },
];

export default function PigFarrowingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [sowId, setSowId] = useState("");
  const [farrowingDate] = useState(today);
  const [totalBorn, setTotalBorn] = useState("");
  const [bornAlive, setBornAlive] = useState("");
  const [stillborn, setStillborn] = useState("");
  const [mummified, setMummified] = useState("");
  const [avgBirthWeightKg, setAvgBirthWeightKg] = useState("");
  const [farrowingEase, setFarrowingEase] = useState<FarrowingEase>("1 — Unassisted");
  const [colostrum, setColostrum] = useState(true);
  const [sowBcs, setSowBcs] = useState<BCS>("3");
  const [attendedBy, setAttendedBy] = useState(user?.name || "");
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  const captureGPS = async () => {
    setGpsLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission required.");
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
    if (!sowId.trim()) {
      Alert.alert("Required", "Please enter the sow tag or ID.");
      return;
    }
    if (!totalBorn.trim() || !bornAlive.trim()) {
      Alert.alert("Required", "Please enter total born and born alive counts.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PigFarrowingRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      sowId: sowId.trim(),
      farrowingDate,
      totalBorn: totalBorn.trim(),
      bornAlive: bornAlive.trim(),
      stillborn: stillborn.trim() || "0",
      mummified: mummified.trim() || "0",
      averageBirthWeightKg: avgBirthWeightKg.trim(),
      farrowingEase,
      colostrum,
      sowConditionScore: sowBcs,
      attendedBy: attendedBy.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PIG_FARROWING_RECORDS, record, currentFarm?.id);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Farrowing Recorded",
      `Sow ${sowId}: ${bornAlive} born alive of ${totalBorn} total.`,
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
          <Text style={styles.title}>Farrowing Record</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sow Details</Text>
            <Input
              label="Sow Tag / ID"
              value={sowId}
              onChangeText={setSowId}
              placeholder="e.g. UK123456/001 or Sow 42"
              autoCapitalize="characters"
            />
            <Input
              label="Farrowing Date"
              value={farrowingDate}
              editable={false}
              placeholder="YYYY-MM-DD"
            />
            <Input
              label="Attended By"
              value={attendedBy}
              onChangeText={setAttendedBy}
              placeholder="Staff member name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Litter Data</Text>
            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Total Born"
                  value={totalBorn}
                  onChangeText={setTotalBorn}
                  placeholder="e.g. 14"
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Born Alive"
                  value={bornAlive}
                  onChangeText={setBornAlive}
                  placeholder="e.g. 12"
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Stillborn"
                  value={stillborn}
                  onChangeText={setStillborn}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Mummified"
                  value={mummified}
                  onChangeText={setMummified}
                  placeholder="0"
                  keyboardType="number-pad"
                />
              </View>
            </View>
            <Input
              label="Average Birth Weight (kg)"
              value={avgBirthWeightKg}
              onChangeText={setAvgBirthWeightKg}
              placeholder="e.g. 1.4"
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Farrowing Ease</Text>
            {FARROWING_EASE.map((opt) => (
              <Pressable
                key={opt.key}
                onPress={() => setFarrowingEase(opt.key)}
                style={[styles.option, farrowingEase === opt.key && { borderColor: opt.color, backgroundColor: opt.color + "15" }]}
              >
                <View style={[styles.radio, farrowingEase === opt.key && { borderColor: opt.color }]}>
                  {farrowingEase === opt.key && <View style={[styles.radioInner, { backgroundColor: opt.color }]} />}
                </View>
                <Text style={[styles.optionLabel, farrowingEase === opt.key && { color: opt.color }]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sow Condition</Text>
            <View style={styles.bcsRow}>
              {BCS_OPTIONS.map((b) => (
                <Pressable
                  key={b.key}
                  onPress={() => setSowBcs(b.key)}
                  style={[styles.bcsOption, sowBcs === b.key && styles.bcsOptionActive]}
                >
                  <Text style={[styles.bcsScore, sowBcs === b.key && styles.bcsScoreActive]}>{b.key}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.bcsLabel}>
              BCS {sowBcs} — {BCS_OPTIONS.find(b => b.key === sowBcs)?.label.split(" — ")[1]}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Colostrum Management</Text>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Colostrum received by all live piglets</Text>
                <Text style={styles.switchSub}>Required within 6 hours of birth (Red Tractor Pigs)</Text>
              </View>
              <Switch
                value={colostrum}
                onValueChange={setColostrum}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>
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
              placeholder="Fostering decisions, piglet interventions, vet attendance…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Button
              title={saving ? "Saving…" : "Save Farrowing Record"}
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
  rowInputs: { flexDirection: "row", gap: spacing.md },
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
  bcsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  bcsOption: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  bcsOptionActive: { borderColor: "#db2777", backgroundColor: "#fce7f3" },
  bcsScore: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  bcsScoreActive: { color: "#db2777" },
  bcsLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  switchSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
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
