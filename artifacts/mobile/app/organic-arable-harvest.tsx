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
import { FieldPicker } from "@/components/ui/FieldPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFields } from "@/lib/hooks/useApiFields";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { OrganicArableHarvest } from "@/lib/types";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const ORGANIC_STATUSES = [
  { key: "certified", label: "Certified Organic", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { key: "in-conversion", label: "In-Conversion", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { key: "conventional", label: "Conventional (not organic)", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" },
];

const COMMON_CROPS = [
  "Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley",
  "Malting Barley", "Oilseed Rape (OSR)", "Winter Oats", "Spring Oats",
  "Winter Beans", "Spring Beans", "Peas", "Maize", "Potatoes",
  "Linseed", "Rye", "Other",
];

export default function OrganicArableHarvestScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [harvestDate, setHarvestDate] = useState(todayDate());
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [yieldTonnes, setYieldTonnes] = useState("");
  const [moisturePercent, setMoisturePercent] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [organicStatus, setOrganicStatus] = useState("certified");
  const [certifierRef, setCertifierRef] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!cropName.trim()) {
      Alert.alert("Required", "Please select or enter the crop name.");
      return;
    }
    if (!harvestDate.trim()) {
      Alert.alert("Required", "Please enter the harvest date.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: OrganicArableHarvest = {
      id: generateId(),
      farmId: currentFarm?.id ?? "",
      harvestDate: harvestDate.trim(),
      cropName: cropName.trim(),
      variety: variety.trim(),
      fieldName: fieldName.trim(),
      yieldTonnes: yieldTonnes.trim(),
      moisturePercent: moisturePercent.trim(),
      storageLocation: storageLocation.trim(),
      organicStatus,
      certifierRef: certifierRef.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.ORGANIC_ARABLE_HARVESTS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Harvest Logged",
      "The harvest record has been saved locally and will sync when online. Add the buyer declaration from the dashboard.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Log Harvest</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoBox}>
            <Feather name="sun" size={14} color="#16a34a" />
            <Text style={styles.infoText}>
              Record harvest details for organic arable crops. The buyer declaration (buyer name, sale price, premium) can be added from the dashboard after the record is synced.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organic Status</Text>
            <View style={styles.statusCol}>
              {ORGANIC_STATUSES.map(s => (
                <Pressable
                  key={s.key}
                  style={[
                    styles.statusChip,
                    { borderColor: organicStatus === s.key ? s.color : colors.border, backgroundColor: organicStatus === s.key ? s.bg : colors.surface },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setOrganicStatus(s.key); }}
                >
                  <View style={[styles.statusDot, { backgroundColor: s.color }]} />
                  <Text style={[styles.statusLabel, { color: organicStatus === s.key ? s.color : colors.textSecondary }]}>{s.label}</Text>
                  {organicStatus === s.key && <Feather name="check" size={16} color={s.color} />}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crop</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Crop *</Text>
              <View style={styles.chipWrap}>
                {COMMON_CROPS.map(c => (
                  <Pressable
                    key={c}
                    style={[styles.chip, cropName === c && styles.chipActive]}
                    onPress={() => { Haptics.selectionAsync(); setCropName(c); }}
                  >
                    <Text style={[styles.chipText, cropName === c && styles.chipTextActive]}>{c}</Text>
                  </Pressable>
                ))}
              </View>
              {!COMMON_CROPS.includes(cropName) && (
                <Input placeholder="Or type crop name…" value={cropName} onChangeText={setCropName} style={{ marginTop: spacing.sm }} />
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Variety</Text>
              <Input placeholder="e.g. KWS Zyatt, Skyfall, RGT Planet" value={variety} onChangeText={setVariety} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Harvest Details</Text>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Harvest Date *</Text>
                <Input placeholder="YYYY-MM-DD" value={harvestDate} onChangeText={setHarvestDate} />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Field</Text>
              <FieldPicker fields={fields} loading={fieldsLoading} value={fieldName} onChange={setFieldName} label="Field (optional)" error={null} />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Yield (tonnes)</Text>
                <Input
                  placeholder="e.g. 8.5"
                  value={yieldTonnes}
                  onChangeText={setYieldTonnes}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Moisture %</Text>
                <Input
                  placeholder="e.g. 15.2"
                  value={moisturePercent}
                  onChangeText={setMoisturePercent}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Storage Location</Text>
              <Input
                placeholder="e.g. Grain store A — segregated organic bay"
                value={storageLocation}
                onChangeText={setStorageLocation}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Certifier Reference</Text>
              <Input
                placeholder="e.g. SA-CROP-2025-001 (if applicable)"
                value={certifierRef}
                onChangeText={setCertifierRef}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.field}>
              <Input
                placeholder="Harvesting conditions, equipment used, any contamination risk…"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={styles.textarea}
              />
            </View>
          </View>

          <View style={styles.buyerNote}>
            <Feather name="file-text" size={13} color="#6b7280" />
            <Text style={styles.buyerNoteText}>
              Buyer declaration (buyer name, sale date, price, premium) is added separately from the dashboard after syncing.
            </Text>
          </View>

          <Button title={saving ? "Saving…" : "Log Harvest"} onPress={handleSave} disabled={saving} />
          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#f0fdf4",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#15803d", flex: 1 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  field: { marginBottom: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  statusCol: { gap: spacing.sm },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, flex: 1 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: "#fff" },
  buyerNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buyerNoteText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  textarea: { minHeight: 80, textAlignVertical: "top" },
});
