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
import type { OrganicArableStockMovement } from "@/lib/types";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const MOVEMENT_TYPES = [
  {
    key: "goods_in",
    label: "Goods In",
    sub: "Seed received / delivery",
    icon: "arrow-down-circle",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#bbf7d0",
  },
  {
    key: "consumption",
    label: "Seed Used / Drilled",
    sub: "Seed drilled into field",
    icon: "arrow-up-circle",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
  },
  {
    key: "adjustment",
    label: "Stock Adjustment",
    sub: "Stocktake correction",
    icon: "edit-2",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
  },
  {
    key: "waste",
    label: "Waste / Loss",
    sub: "Damaged, rejected or lost stock",
    icon: "trash-2",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
  },
] as const;

type MovementTypeKey = "goods_in" | "consumption" | "adjustment" | "waste";

const COMMON_CROPS = [
  "Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley",
  "Malting Barley", "Oilseed Rape (OSR)", "Winter Oats", "Spring Oats",
  "Winter Beans", "Spring Beans", "Peas", "Maize", "Potatoes",
  "Linseed", "Rye", "Other",
];

export default function OrganicArableStockMovementScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [movementType, setMovementType] = useState<MovementTypeKey>("goods_in");
  const [movementDate, setMovementDate] = useState(todayDate());
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [batchLotNumber, setBatchLotNumber] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [drillingDate, setDrillingDate] = useState("");
  const [poReference, setPoReference] = useState("");
  const [grnReference, setGrnReference] = useState("");
  const [notes, setNotes] = useState("");

  const selected = MOVEMENT_TYPES.find(m => m.key === movementType)!;
  const isGoodsIn = movementType === "goods_in";
  const isConsumption = movementType === "consumption";

  const handleSave = async () => {
    if (!cropName.trim()) {
      Alert.alert("Required", "Please enter or select the crop.");
      return;
    }
    if (!quantityKg.trim() || isNaN(parseFloat(quantityKg))) {
      Alert.alert("Required", "Please enter a valid quantity in kg.");
      return;
    }
    if (isConsumption && !fieldName.trim()) {
      Alert.alert("Required", "Please enter the field name for a consumption movement.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: OrganicArableStockMovement = {
      id: generateId(),
      farmId: currentFarm?.id ?? "",
      movementType,
      movementDate: movementDate.trim(),
      cropName: cropName.trim(),
      variety: variety.trim(),
      batchLotNumber: batchLotNumber.trim(),
      quantityKg: quantityKg.trim(),
      fieldName: fieldName.trim(),
      poReference: poReference.trim(),
      grnReference: grnReference.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.ORGANIC_ARABLE_STOCK_MOVEMENTS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Movement Saved",
      "The seed stock movement has been saved locally and will sync when online. The stock balance will update automatically after sync.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Log Seed Stock Movement</Text>
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
            <Feather name="layers" size={14} color="#0891b2" />
            <Text style={styles.infoText}>
              Record movements against your organic seed stock lines. Goods In adds to the balance; Seed Used and Waste reduce it. The running balance updates automatically after sync.
            </Text>
          </View>

          {/* Movement type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Movement Type</Text>
            <View style={styles.typeGrid}>
              {MOVEMENT_TYPES.map(m => (
                <Pressable
                  key={m.key}
                  style={[
                    styles.typeCard,
                    {
                      borderColor: movementType === m.key ? m.color : colors.border,
                      backgroundColor: movementType === m.key ? m.bg : colors.surface,
                    },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setMovementType(m.key); }}
                >
                  <Feather name={m.icon as never} size={20} color={movementType === m.key ? m.color : colors.textSecondary} />
                  <Text style={[styles.typeLabel, { color: movementType === m.key ? m.color : colors.text }]}>{m.label}</Text>
                  <Text style={styles.typeSub}>{m.sub}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Crop details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crop & Lot</Text>

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
              <Input placeholder="e.g. KWS Zyatt, Skyfall" value={variety} onChangeText={setVariety} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Batch / Lot Number</Text>
              <Input placeholder="e.g. BL-2024-001" value={batchLotNumber} onChangeText={setBatchLotNumber} />
            </View>
          </View>

          {/* Movement details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Movement Details</Text>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Date *</Text>
                <Input placeholder="YYYY-MM-DD" value={movementDate} onChangeText={setMovementDate} />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Quantity (kg) *</Text>
                <Input
                  placeholder="e.g. 500"
                  value={quantityKg}
                  onChangeText={setQuantityKg}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {isConsumption && (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>Field Drilled *</Text>
                  <Input placeholder="e.g. Home Field, Block A" value={fieldName} onChangeText={setFieldName} />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Drilling Date</Text>
                  <Input placeholder="YYYY-MM-DD" value={drillingDate} onChangeText={setDrillingDate} />
                </View>
              </>
            )}

            {isGoodsIn && (
              <>
                <View style={styles.field}>
                  <Text style={styles.label}>PO Reference</Text>
                  <Input placeholder="e.g. PO-2024-012" value={poReference} onChangeText={setPoReference} />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>GRN Reference</Text>
                  <Input placeholder="e.g. GRN-2024-007" value={grnReference} onChangeText={setGrnReference} />
                </View>
              </>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Input
              placeholder="Additional notes…"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              style={styles.textarea}
            />
          </View>

          <View style={[styles.summaryBox, { borderColor: selected.border, backgroundColor: selected.bg }]}>
            <Feather name={selected.icon as never} size={14} color={selected.color} />
            <Text style={[styles.summaryText, { color: selected.color }]}>
              {movementType === "goods_in" && "This movement will increase the stock balance for the matching lot."}
              {movementType === "consumption" && "This movement will reduce the stock balance for the matching lot."}
              {movementType === "adjustment" && "This movement will adjust the stock balance for the matching lot."}
              {movementType === "waste" && "This movement will reduce the stock balance for the matching lot."}
            </Text>
          </View>

          <Button title={saving ? "Saving…" : "Save Movement"} onPress={handleSave} disabled={saving} />
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
  title: { fontFamily: fonts.bold, fontSize: fontSize.base, color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#ecfeff",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#a5f3fc",
  },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#0e7490", flex: 1 },
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
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  typeCard: {
    width: "47%",
    borderRadius: radius.md,
    borderWidth: 1.5,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  typeLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, textAlign: "center" },
  typeSub: { fontFamily: fonts.regular, fontSize: 10, color: colors.textSecondary, textAlign: "center" },
  field: { marginBottom: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
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
  textarea: { minHeight: 80, textAlignVertical: "top" },
  summaryBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
  },
  summaryText: { fontFamily: fonts.medium, fontSize: fontSize.sm, flex: 1 },
});
