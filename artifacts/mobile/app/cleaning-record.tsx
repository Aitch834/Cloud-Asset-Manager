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
import type { CleaningRecord } from "@/lib/types";

const CLEANING_TYPES = [
  { key: "routine-clean", label: "Routine clean", icon: "wind" as const },
  { key: "deep-clean", label: "Deep clean", icon: "wind" as const },
  { key: "disinfection", label: "Disinfection", icon: "droplet" as const },
  { key: "fogging", label: "Fogging / fumigation", icon: "cloud" as const },
  { key: "pre-housing", label: "Pre-housing clean", icon: "home" as const },
  { key: "post-tb", label: "Post-TB restriction", icon: "alert-circle" as const },
  { key: "emergency", label: "Emergency clean", icon: "alert-triangle" as const },
  { key: "other", label: "Other", icon: "more-horizontal" as const },
];

const COMMON_AREAS = [
  "Cattle shed", "Sheep shed", "Pig building", "Poultry house",
  "Milking parlour", "Calf pens", "Isolation unit", "Yard / concrete",
  "Vehicle / trailer", "Feed store", "Equipment", "Other",
];

export default function CleaningRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const [area, setArea] = useState("");
  const [cleaningType, setCleaningType] = useState("");
  const [productsUsed, setProductsUsed] = useState("");
  const [dilutionRate, setDilutionRate] = useState("");
  const [contactTime, setContactTime] = useState("");
  const [cleanedBy, setCleanedBy] = useState(user?.name || "");
  const [cleanedDate, setCleanedDate] = useState(today);
  const [nextDueDate, setNextDueDate] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!area.trim() || !cleaningType) {
      Alert.alert("Required Fields", "Please enter an area and select a cleaning type.");
      return;
    }
    if (!cleanedDate) {
      Alert.alert("Required Fields", "Please enter the date the cleaning was carried out.");
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

    const record: CleaningRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      area: area.trim(),
      cleaningType,
      productsUsed: productsUsed.trim(),
      dilutionRate: dilutionRate.trim(),
      contactTime: contactTime.trim(),
      cleanedBy: cleanedBy.trim(),
      cleanedDate: cleanedDate ? new Date(cleanedDate).toISOString() : new Date().toISOString(),
      nextDueDate: nextDueDate ? new Date(nextDueDate).toISOString() : "",
      verifiedBy: verifiedBy.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.CLEANING_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Cleaning & disinfection record saved successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Cleaning & Disinfection</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 100 }]}
        >
          {/* Area */}
          <View style={styles.sectionLabel}>
            <Feather name="home" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Area / Location <Text style={styles.required}>*</Text></Text>
          </View>
          <View style={styles.chipGrid}>
            {COMMON_AREAS.map((a) => {
              const selected = area === a;
              return (
                <Pressable
                  key={a}
                  style={[styles.chip, selected && { backgroundColor: "#e0f2fe", borderColor: "#0891b2" }]}
                  onPress={() => { Haptics.selectionAsync(); setArea(a); }}
                >
                  <Text style={[styles.chipText, selected && { color: "#0891b2", fontFamily: fonts.semiBold }]}>{a}</Text>
                </Pressable>
              );
            })}
          </View>
          <Input
            placeholder="Or type a specific area..."
            value={area}
            onChangeText={setArea}
            style={{ marginBottom: spacing.lg }}
          />

          {/* Cleaning Type */}
          <View style={styles.sectionLabel}>
            <Feather name="wind" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Cleaning Type <Text style={styles.required}>*</Text></Text>
          </View>
          <View style={styles.chipGrid}>
            {CLEANING_TYPES.map((ct) => {
              const selected = cleaningType === ct.key;
              return (
                <Pressable
                  key={ct.key}
                  style={[styles.chip, selected && { backgroundColor: "#e0f2fe", borderColor: "#0891b2" }]}
                  onPress={() => { Haptics.selectionAsync(); setCleaningType(ct.key); }}
                >
                  <Feather name={ct.icon} size={12} color={selected ? "#0891b2" : colors.textSecondary} />
                  <Text style={[styles.chipText, selected && { color: "#0891b2", fontFamily: fonts.semiBold }]}>{ct.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Products & Method */}
          <View style={styles.sectionLabel}>
            <Feather name="droplet" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Products & Method</Text>
          </View>
          <Input
            placeholder="Product(s) used, e.g. Virkon S, Citric acid"
            value={productsUsed}
            onChangeText={setProductsUsed}
            style={{ marginBottom: spacing.sm }}
          />
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.fieldLabel}>Dilution rate</Text>
              <Input
                placeholder="e.g. 1:200"
                value={dilutionRate}
                onChangeText={setDilutionRate}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.fieldLabel}>Contact time</Text>
              <Input
                placeholder="e.g. 30 mins"
                value={contactTime}
                onChangeText={setContactTime}
              />
            </View>
          </View>

          {/* People */}
          <View style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
            <Feather name="user" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>People</Text>
          </View>
          <Text style={styles.fieldLabel}>Cleaned by</Text>
          <Input
            placeholder="Name of person who carried out the clean"
            value={cleanedBy}
            onChangeText={setCleanedBy}
            style={{ marginBottom: spacing.sm }}
          />
          <Text style={styles.fieldLabel}>Verified by</Text>
          <Input
            placeholder="Supervisor or checker (optional)"
            value={verifiedBy}
            onChangeText={setVerifiedBy}
          />

          {/* Dates */}
          <View style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
            <Feather name="calendar" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Dates</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.fieldLabel}>Date cleaned <Text style={styles.required}>*</Text></Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={cleanedDate}
                onChangeText={setCleanedDate}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.fieldLabel}>Next due date</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={nextDueDate}
                onChangeText={setNextDueDate}
              />
            </View>
          </View>

          {/* Notes */}
          <View style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
            <Feather name="file-text" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input
            placeholder="Observations, issues found, or any other notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <View style={{ marginTop: spacing.xl }}>
            <Button
              title={saving ? "Saving..." : "Save Record"}
              onPress={handleSave}
              disabled={saving}
              icon="check"
            />
          </View>
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
  required: { color: colors.error },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
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
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  halfInput: { flex: 1 },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});
