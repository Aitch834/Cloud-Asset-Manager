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
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PoultryThinningRecord } from "@/lib/types";

type ThinningNumber = PoultryThinningRecord["thinningNumber"];

const THINNING_OPTIONS: ThinningNumber[] = ["1st", "2nd", "3rd", "Final depletion"];

export default function PoultryThinningScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [flockReference, setFlockReference] = useState("");
  const [thinningNumber, setThinningNumber] = useState<ThinningNumber>("1st");
  const [thinningDate] = useState(today);
  const [birdsRemoved, setBirdsRemoved] = useState("");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [actualAvgWeightKg, setActualAvgWeightKg] = useState("");
  const [destinationAbattoir, setDestinationAbattoir] = useState("");
  const [catchingContractor, setCatchingContractor] = useState("");
  const [catchingStartTime, setCatchingStartTime] = useState("");
  const [catchingEndTime, setCatchingEndTime] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [doaAtLoading, setDoaAtLoading] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!flockReference.trim()) {
      Alert.alert("Required", "Please enter the flock reference.");
      return;
    }
    if (!birdsRemoved.trim()) {
      Alert.alert("Required", "Please enter the number of birds removed.");
      return;
    }
    if (!destinationAbattoir.trim()) {
      Alert.alert("Required", "Please enter the destination abattoir.");
      return;
    }
    if (!vehicleReg.trim()) {
      Alert.alert("Required", "Please enter the vehicle registration.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PoultryThinningRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockReference: flockReference.trim(),
      thinningNumber,
      thinningDate,
      birdsRemoved: birdsRemoved.trim(),
      targetWeightKg: targetWeightKg.trim(),
      actualAvgWeightKg: actualAvgWeightKg.trim(),
      destinationAbattoir: destinationAbattoir.trim(),
      catchingContractor: catchingContractor.trim(),
      catchingStartTime: catchingStartTime.trim(),
      catchingEndTime: catchingEndTime.trim(),
      vehicleReg: vehicleReg.trim().toUpperCase(),
      doaAtLoading: doaAtLoading.trim() || "0",
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.POULTRY_THINNING_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Thinning Recorded",
      `${birdsRemoved} birds removed (${thinningNumber} thinning) — ${destinationAbattoir}.`,
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
          <Text style={styles.title}>Poultry Thinning Record</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoBanner}>
            <Feather name="info" size={16} color="#1d4ed8" />
            <Text style={styles.infoText}>
              Catching-to-slaughter journey time is calculated from catching start time. Required for Food Chain Information (FCI) and Red Tractor Broilers audit.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Flock Details</Text>
            <Input
              label="Flock Reference"
              value={flockReference}
              onChangeText={setFlockReference}
              placeholder="e.g. House 2 — Crop 2025-04"
              autoCapitalize="words"
            />
            <Text style={styles.subLabel}>Thinning Number</Text>
            <View style={styles.thinningRow}>
              {THINNING_OPTIONS.map((opt) => (
                <Pressable
                  key={opt}
                  onPress={() => setThinningNumber(opt)}
                  style={[styles.thinningOption, thinningNumber === opt && styles.thinningOptionActive]}
                >
                  <Text style={[styles.thinningLabel, thinningNumber === opt && styles.thinningLabelActive]}>
                    {opt}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Input
              label="Thinning Date"
              value={thinningDate}
              editable={false}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Birds Removed</Text>
            <Input
              label="Number of Birds Removed"
              value={birdsRemoved}
              onChangeText={setBirdsRemoved}
              placeholder="e.g. 4500"
              keyboardType="number-pad"
            />
            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Target Live Weight (kg)"
                  value={targetWeightKg}
                  onChangeText={setTargetWeightKg}
                  placeholder="e.g. 1.8"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Actual Avg Live Weight (kg)"
                  value={actualAvgWeightKg}
                  onChangeText={setActualAvgWeightKg}
                  placeholder="e.g. 1.75"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <Input
              label="DOA at Loading (birds found dead during catching)"
              value={doaAtLoading}
              onChangeText={setDoaAtLoading}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Transport & Catching</Text>
            <Input
              label="Destination Abattoir"
              value={destinationAbattoir}
              onChangeText={setDestinationAbattoir}
              placeholder="Abattoir name"
              autoCapitalize="words"
            />
            <Input
              label="Catching Contractor"
              value={catchingContractor}
              onChangeText={setCatchingContractor}
              placeholder="Contractor company name"
              autoCapitalize="words"
            />
            <Input
              label="Vehicle Registration"
              value={vehicleReg}
              onChangeText={setVehicleReg}
              placeholder="e.g. BT23 XYZ"
              autoCapitalize="characters"
            />
            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Input
                  label="Catching Start Time"
                  value={catchingStartTime}
                  onChangeText={setCatchingStartTime}
                  placeholder="HH:MM"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input
                  label="Catching End Time"
                  value={catchingEndTime}
                  onChangeText={setCatchingEndTime}
                  placeholder="HH:MM"
                  keyboardType="numbers-and-punctuation"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Welfare observations, delays, abattoir DOA report reference…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Button
              title={saving ? "Saving…" : "Save Thinning Record"}
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
  infoBanner: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: "#dbeafe",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#1e40af",
    lineHeight: 18,
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  subLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  thinningRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  thinningOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  thinningOptionActive: {
    borderColor: "#d97706",
    backgroundColor: "#fef3c7",
  },
  thinningLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  thinningLabelActive: { color: "#d97706" },
  rowInputs: { flexDirection: "row", gap: spacing.md },
});
