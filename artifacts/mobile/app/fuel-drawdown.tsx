import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
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

type QualifyingActivity =
  | "agriculture"
  | "heating"
  | "electricity_generation"
  | "non_commercial_heating"
  | "other";

const ACTIVITIES: { key: QualifyingActivity; label: string; description: string }[] = [
  { key: "agriculture", label: "Agriculture", description: "Tractors, combines, farm vehicles and machinery" },
  { key: "heating", label: "Heating / Drying", description: "Grain driers, livestock building heating, greenhouses" },
  { key: "electricity_generation", label: "Electricity Generation", description: "On-farm generators for qualifying purposes" },
  { key: "non_commercial_heating", label: "Non-commercial Heating", description: "Farm house, worker accommodation, farm office" },
  { key: "other", label: "Other Qualifying Use", description: "Other HMRC-permitted use of rebated fuel" },
];

export default function FuelDrawdownScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const params = useLocalSearchParams<{ assetId?: string; assetName?: string }>();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [tankName, setTankName] = useState("");
  const [vehicleName, setVehicleName] = useState(params.assetName ?? "");
  const [quantityLitres, setQuantityLitres] = useState("");
  const [purpose, setPurpose] = useState("");
  const [qualifyingActivity, setQualifyingActivity] = useState<QualifyingActivity>("agriculture");
  const [recordedBy, setRecordedBy] = useState(user?.name || "");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!tankName.trim()) {
      Alert.alert("Required", "Please enter the tank name you are drawing from.");
      return;
    }
    if (!quantityLitres.trim() || isNaN(parseFloat(quantityLitres)) || parseFloat(quantityLitres) <= 0) {
      Alert.alert("Required", "Please enter a valid quantity in litres.");
      return;
    }
    if (!purpose.trim()) {
      Alert.alert("Required", "Please enter a purpose or activity description.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      tankName: tankName.trim(),
      vehicleName: vehicleName.trim() || undefined,
      quantityLitres: parseFloat(quantityLitres).toFixed(1),
      purpose: purpose.trim(),
      qualifyingActivity,
      recordedBy: recordedBy.trim(),
      notes: notes.trim() || undefined,
      usageDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.FUEL_DRAWDOWNS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Draw-Down Saved",
      `${parseFloat(quantityLitres).toFixed(0)} L recorded from ${tankName.trim()}${vehicleName.trim() ? ` → ${vehicleName.trim()}` : ""}. Record will sync to your usage log automatically.`,
      [{ text: "Done", onPress: () => router.back() }],
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
          <Text style={styles.title}>Fuel Draw-Down</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.infoCard}>
            <Feather name="info" size={16} color="#d97706" />
            <Text style={styles.infoText}>
              Record every fuel draw-down for HMRC rebated fuel compliance. Keep a note of the vehicle or machine and qualifying purpose — this demonstrates to HMRC that red diesel is used only for permitted agricultural activities.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tank & Vehicle</Text>
            <Input
              label="Tank Name *"
              value={tankName}
              onChangeText={setTankName}
              placeholder="e.g. Main Red Diesel, Heating Oil, LPG Bulk"
              autoCapitalize="words"
            />
            <Input
              label="Vehicle / Machine (optional)"
              value={vehicleName}
              onChangeText={setVehicleName}
              placeholder="e.g. Case IH Puma 165, JD 6R, Massey 6S, Grain Drier"
              autoCapitalize="words"
            />
            <Input
              label="Recorded By"
              value={recordedBy}
              onChangeText={setRecordedBy}
              placeholder="Your name"
              autoCapitalize="words"
            />
            <Input
              label="Date"
              value={today}
              editable={false}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity & Purpose</Text>
            <Input
              label="Quantity Drawn (litres) *"
              value={quantityLitres}
              onChangeText={setQuantityLitres}
              placeholder="e.g. 150"
              keyboardType="decimal-pad"
            />
            <Input
              label="Purpose / Activity *"
              value={purpose}
              onChangeText={setPurpose}
              placeholder="e.g. Ploughing — Home Field, Grain drying — Wheat"
              autoCapitalize="sentences"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Qualifying Activity</Text>
            <Text style={styles.sectionSub}>
              Required for HMRC red diesel records — select the category that best describes this use.
            </Text>
            {ACTIVITIES.map((a) => (
              <Pressable
                key={a.key}
                onPress={() => setQualifyingActivity(a.key)}
                style={[
                  styles.option,
                  qualifyingActivity === a.key && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + "12",
                  },
                ]}
              >
                <View style={[styles.radio, qualifyingActivity === a.key && { borderColor: colors.primary }]}>
                  {qualifyingActivity === a.key && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, qualifyingActivity === a.key && { color: colors.primary }]}>
                    {a.label}
                  </Text>
                  <Text style={styles.optionSub}>{a.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional details, field name, operator…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Button
              title={saving ? "Saving…" : "Record Draw-Down"}
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
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 17,
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
  optionSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
});
