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

const CROP_TYPES = ["Grass Silage", "Maize Silage", "Wholecrop", "Haylage", "Hay", "Other"];
const CUT_NUMBERS = ["1st Cut", "2nd Cut", "3rd Cut", "4th Cut", "5th Cut"];
const PURPOSES = ["feeding", "bedding", "sold", "waste"];

export default function SilageCutRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [cropType, setCropType] = useState("");
  const [cutNumber, setCutNumber] = useState("");
  const [fieldOfOrigin, setFieldOfOrigin] = useState("");
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().slice(0, 10));
  const [quantityTonnes, setQuantityTonnes] = useState("");
  const [quantityBales, setQuantityBales] = useState("");
  const [baleWeightKg, setBaleWeightKg] = useState("");
  const [dryMatterPercent, setDryMatterPercent] = useState("");
  const [storeName, setStoreName] = useState("");
  const [notes, setNotes] = useState("");

  const isHaylageOrHay = cropType === "Haylage" || cropType === "Hay";

  async function handleSave() {
    if (!cropType) {
      Alert.alert("Required", "Please select the crop type.");
      return;
    }
    if (!currentFarm) {
      Alert.alert("Error", "No farm selected.");
      return;
    }
    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const record = {
        id: generateId(),
        farmId: currentFarm.id,
        cropType,
        cutNumber: cutNumber ? parseInt(cutNumber.replace(/\D/g, "")) : null,
        fieldOfOrigin: fieldOfOrigin || null,
        harvestDate: harvestDate || null,
        quantityTonnes: quantityTonnes ? parseFloat(quantityTonnes) : null,
        quantityBales: quantityBales ? parseInt(quantityBales) : null,
        baleWeightKg: baleWeightKg ? parseFloat(baleWeightKg) : null,
        dryMatterPercent: dryMatterPercent ? parseFloat(dryMatterPercent) : null,
        storeName: storeName || null,
        notes: notes || null,
        status: "in-store",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.SILAGE_HAYLAGE_STOCK, record);
      await refreshPendingCount();
      Alert.alert("Saved", "Cut record logged — will sync when online.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Could not save record.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Silage / Haylage Cut Record</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Crop & Cut</Text>

          <Text style={styles.label}>Crop Type *</Text>
          <View style={styles.chipRow}>
            {CROP_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setCropType(t)}
                style={[styles.chip, cropType === t && styles.chipSelected]}
              >
                <Text style={[styles.chipText, cropType === t && styles.chipTextSelected]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: spacing.md }]}>Cut Number</Text>
          <View style={styles.chipRow}>
            {CUT_NUMBERS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCutNumber(c)}
                style={[styles.chip, cutNumber === c && styles.chipSelected]}
              >
                <Text style={[styles.chipText, cutNumber === c && styles.chipTextSelected]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="Source Field"
            value={fieldOfOrigin}
            onChangeText={setFieldOfOrigin}
            placeholder="Field name or reference"
          />

          <Input
            label="Harvest / Clamp Date"
            value={harvestDate}
            onChangeText={setHarvestDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quantity</Text>

          {!isHaylageOrHay && (
            <Input
              label="Quantity (tonnes)"
              value={quantityTonnes}
              onChangeText={setQuantityTonnes}
              keyboardType="numeric"
              placeholder="e.g. 120"
            />
          )}

          {isHaylageOrHay && (
            <View style={styles.row2}>
              <View style={styles.halfField}>
                <Input
                  label="Number of Bales"
                  value={quantityBales}
                  onChangeText={setQuantityBales}
                  keyboardType="numeric"
                  placeholder="e.g. 80"
                />
              </View>
              <View style={styles.halfField}>
                <Input
                  label="Bale Weight (kg)"
                  value={baleWeightKg}
                  onChangeText={setBaleWeightKg}
                  keyboardType="numeric"
                  placeholder="e.g. 550"
                />
              </View>
            </View>
          )}

          <Input
            label="Dry Matter % (DM)"
            value={dryMatterPercent}
            onChangeText={setDryMatterPercent}
            keyboardType="numeric"
            placeholder="e.g. 30"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Storage</Text>

          <Input
            label="Clamp / Store Name"
            value={storeName}
            onChangeText={setStoreName}
            placeholder="e.g. Main clamp, North yard"
          />

          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any observations or quality notes"
            multiline
          />

          <Button
            title={saving ? "Saving…" : "Save Cut Record"}
            onPress={handleSave}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backBtn: { padding: spacing.xs },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  card: {
    margin: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: { backgroundColor: "#15803d", borderColor: "#15803d" },
  chipText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  row2: { flexDirection: "row", gap: spacing.sm },
  halfField: { flex: 1 },
});
