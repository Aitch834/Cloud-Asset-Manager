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
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import {
  getCachedGrainBins,
  getRefCacheSyncedMinsAgo,
  type RefGrainBin,
} from "@/lib/refCache";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { GrainStoreMovement } from "@/lib/types";

type MovementType = GrainStoreMovement["movementType"];

const MOVEMENT_TYPES: { key: MovementType; label: string; description: string; color: string }[] = [
  { key: "transfer", label: "Transfer", description: "Move crop between two storage locations", color: "#0284c7" },
  { key: "drying_loss", label: "Drying Loss", description: "Weight reduction during conditioning", color: "#d97706" },
  { key: "adjustment", label: "Adjustment", description: "Weighbridge recount or auditor correction", color: "#7c3aed" },
];

const CROP_TYPES = ["Wheat", "Barley", "Oilseed Rape", "Oats", "Rye", "Maize", "Beans", "Peas", "Other"];

export default function StorageMovementScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [movementType, setMovementType] = useState<MovementType>("transfer");
  const [movementDate, setMovementDate] = useState(today);
  const [sourceStore, setSourceStore] = useState("");
  const [destinationStore, setDestinationStore] = useState("");
  const [cropType, setCropType] = useState("");
  const [weightTonnes, setWeightTonnes] = useState("");
  const [reason, setReason] = useState("");
  const [recordedBy, setRecordedBy] = useState(user?.name || "");
  const [notes, setNotes] = useState("");

  const [binOptions, setBinOptions] = useState<LookupOption[]>([]);
  const [binsSyncedMinsAgo, setBinsSyncedMinsAgo] = useState<number | null>(null);

  useEffect(() => {
    if (!currentFarm?.id) return;
    const farmId = String(currentFarm.id);
    getCachedGrainBins(farmId).then((bins: RefGrainBin[]) => {
      setBinOptions(bins.map((b) => ({ id: b.id, label: b.label, sublabel: b.sublabel || undefined })));
    });
    getRefCacheSyncedMinsAgo("grain-bins", farmId).then(setBinsSyncedMinsAgo);
  }, [currentFarm?.id]);

  const selected = MOVEMENT_TYPES.find((m) => m.key === movementType)!;

  const handleSave = async () => {
    if (!sourceStore.trim()) {
      Alert.alert("Required Fields", "Please select a source store / bin.");
      return;
    }
    if (movementType === "transfer" && !destinationStore.trim()) {
      Alert.alert("Required Fields", "Please select a destination store for the transfer.");
      return;
    }
    if (!cropType.trim()) {
      Alert.alert("Required Fields", "Please select a crop type.");
      return;
    }
    if (!weightTonnes.trim()) {
      Alert.alert("Required Fields", "Please enter the weight in tonnes.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: GrainStoreMovement = {
      id: generateId(),
      farmId: currentFarm?.id ? String(currentFarm.id) : "",
      movementType,
      movementDate,
      sourceStore: sourceStore.trim(),
      destinationStore: destinationStore.trim(),
      cropType: cropType.trim(),
      weightTonnes: weightTonnes.trim(),
      reason: reason.trim(),
      recordedBy: recordedBy.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.GRAIN_STORE_MOVEMENTS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Grain store movement saved offline and queued for sync.", [
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
            <Text style={styles.title}>Grain Store Movement</Text>
            <Text style={styles.subtitle}>Transfer · Drying Loss · Adjustment</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <Text style={styles.sectionTitle}>Movement Type</Text>
          {MOVEMENT_TYPES.map((m) => (
            <Pressable
              key={m.key}
              onPress={() => setMovementType(m.key)}
              style={[
                styles.typeCard,
                movementType === m.key && { borderColor: m.color, backgroundColor: m.color + "12" },
              ]}
            >
              <View style={[styles.typeIndicator, { backgroundColor: m.color + "20" }]}>
                <Feather
                  name={m.key === "transfer" ? "arrow-right-circle" : m.key === "drying_loss" ? "thermometer" : "edit-3"}
                  size={20}
                  color={m.color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.typeLabel, movementType === m.key && { color: m.color, fontFamily: fonts.semiBold }]}>
                  {m.label}
                </Text>
                <Text style={styles.typeDescription}>{m.description}</Text>
              </View>
              {movementType === m.key && (
                <Feather name="check-circle" size={18} color={m.color} />
              )}
            </Pressable>
          ))}

          <Text style={styles.sectionTitle}>Date</Text>
          <Input label="Movement Date" maxDate="today" value={movementDate} onChangeText={setMovementDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.sectionTitle}>
            {movementType === "transfer" ? "Source Store" : "Store / Bin"}
          </Text>
          <LookupPicker
            label="Select Bin / Store"
            value={sourceStore}
            options={binOptions}
            onSelect={(_id, label) => setSourceStore(label)}
            placeholder="Select or search bins…"
            allowFreeText
            syncedMinsAgo={binsSyncedMinsAgo}
            emptyMessage="No bins cached yet — sync when online to populate, or enter manually."
            icon="package"
          />

          {movementType === "transfer" && (
            <>
              <Text style={styles.sectionTitle}>Destination Store</Text>
              <LookupPicker
                label="Destination Bin / Store"
                value={destinationStore}
                options={binOptions.filter((b) => b.label !== sourceStore)}
                onSelect={(_id, label) => setDestinationStore(label)}
                placeholder="Select or search bins…"
                allowFreeText
                syncedMinsAgo={binsSyncedMinsAgo}
                emptyMessage="No bins cached yet — sync when online to populate, or enter manually."
                icon="package"
              />
            </>
          )}

          <Text style={styles.sectionTitle}>Crop</Text>
          <Text style={styles.label}>Crop Type *</Text>
          <View style={styles.chipRow}>
            {CROP_TYPES.map((c) => (
              <Pressable key={c} onPress={() => setCropType(c)} style={[styles.chip, cropType === c && styles.chipActive]}>
                <Text style={[styles.chipText, cropType === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Quantity</Text>
          <Input
            label={
              movementType === "drying_loss"
                ? "Drying Loss (tonnes)"
                : movementType === "adjustment"
                  ? "Adjustment Quantity (tonnes, use – prefix for reduction)"
                  : "Weight Transferred (tonnes)"
            }
            value={weightTonnes}
            onChangeText={setWeightTonnes}
            placeholder="e.g. 12.50"
            keyboardType="decimal-pad"
          />

          <Text style={styles.sectionTitle}>Details</Text>
          <Input
            label={movementType === "adjustment" ? "Reason for Adjustment" : "Reason / Reference"}
            value={reason}
            onChangeText={setReason}
            placeholder={
              movementType === "drying_loss"
                ? "e.g. Conditioning run 1 — dryer no. 2"
                : movementType === "adjustment"
                  ? "e.g. Post-harvest weighbridge recount"
                  : "e.g. Move to merchant position"
            }
          />
          <Input label="Recorded By" value={recordedBy} onChangeText={setRecordedBy} placeholder="Your name" />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional details…" multiline numberOfLines={3} />

          <View style={[styles.summaryCard, { borderColor: selected.color }]}>
            <Feather name="info" size={14} color={selected.color} />
            <Text style={[styles.summaryText, { color: selected.color }]}>
              {movementType === "transfer"
                ? "This will create a negative movement on the source store and a positive intake on the destination store on the dashboard."
                : movementType === "drying_loss"
                  ? "Drying loss is recorded as a negative weight on the source store to reflect moisture reduction during conditioning."
                  : "An adjustment corrects the running stock balance. Enter a positive value to increase stock, or prefix with – to reduce it."}
            </Text>
          </View>

          <Button title={saving ? "Saving…" : "Save Movement"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
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
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  typeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  typeIndicator: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  typeLabel: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  typeDescription: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  summaryCard: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
  },
  summaryText: { fontFamily: fonts.regular, fontSize: fontSize.sm, flex: 1, lineHeight: 20 },
  saveButton: { marginTop: spacing.lg },
});
