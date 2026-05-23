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
import type { OrganicArableSeed } from "@/lib/types";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const SEED_TYPES = [
  { key: "organic", label: "Certified Organic", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { key: "untreated-conventional", label: "Untreated Conventional", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { key: "treated-conventional-derogation", label: "Treated Conventional (Derogation)", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
];

const COMMON_CROPS = [
  "Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley",
  "Malting Barley", "Oilseed Rape (OSR)", "Winter Oats", "Spring Oats",
  "Winter Beans", "Spring Beans", "Peas", "Maize", "Potatoes",
  "Linseed", "Rye", "Other",
];

export default function OrganicArableSeedScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [purchaseDate, setPurchaseDate] = useState(todayDate());
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [seedType, setSeedType] = useState("organic");
  const [derogationGranted, setDerogationGranted] = useState(false);
  const [derogationReference, setDerogationReference] = useState("");
  const [certifierApproval, setCertifierApproval] = useState("");
  const [batchLotNumber, setBatchLotNumber] = useState("");
  const [notes, setNotes] = useState("");

  const needsDerogation = seedType !== "organic";

  const handleSave = async () => {
    if (!cropName.trim()) {
      Alert.alert("Required", "Please enter the crop name.");
      return;
    }
    if (!purchaseDate.trim()) {
      Alert.alert("Required", "Please enter the purchase date.");
      return;
    }
    if (needsDerogation && !derogationGranted) {
      Alert.alert(
        "Derogation Required",
        "Non-organic seed requires prior written approval from your certifying body. Have you received this approval?",
        [
          { text: "No — go back", style: "cancel" },
          {
            text: "Yes — continue",
            onPress: async () => {
              setDerogationGranted(true);
              await doSave();
            },
          },
        ]
      );
      return;
    }
    await doSave();
  };

  const doSave = async () => {
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: OrganicArableSeed = {
      id: generateId(),
      farmId: currentFarm?.id ?? "",
      purchaseDate: purchaseDate.trim(),
      cropName: cropName.trim(),
      variety: variety.trim(),
      quantityKg: quantityKg.trim(),
      supplierName: supplierName.trim(),
      supplierAddress: supplierAddress.trim(),
      seedType,
      derogationGranted,
      derogationReference: derogationReference.trim(),
      certifierApproval: certifierApproval.trim(),
      batchLotNumber: batchLotNumber.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.ORGANIC_ARABLE_SEEDS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Seed Record Saved",
      "The seed purchase has been saved locally and will sync when online.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Log Seed Purchase</Text>
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
            <Feather name="box" size={14} color="#2563eb" />
            <Text style={styles.infoText}>
              All seed used on organically certified or in-conversion arable land must be recorded. Certified organic seed is strongly preferred — a derogation from your certifier is required for non-organic seed.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seed Type</Text>
            <View style={styles.approvalCol}>
              {SEED_TYPES.map(s => (
                <Pressable
                  key={s.key}
                  style={[
                    styles.approvalChip,
                    { borderColor: seedType === s.key ? s.color : colors.border, backgroundColor: seedType === s.key ? s.bg : colors.surface },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setSeedType(s.key); if (s.key === "organic") setDerogationGranted(false); }}
                >
                  <View style={[styles.approvalDot, { backgroundColor: s.color }]} />
                  <Text style={[styles.approvalLabel, { color: seedType === s.key ? s.color : colors.textSecondary }]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {needsDerogation && (
            <View style={[styles.section, { borderWidth: 1.5, borderColor: "#fde68a" }]}>
              <View style={styles.warningBox}>
                <Feather name="alert-triangle" size={13} color="#92400e" />
                <Text style={styles.warningText}>
                  Non-organic seed requires prior written approval (derogation) from your certifying body before purchase and use. Ensure you have received this approval. Upload the approval letter to the record in the dashboard.
                </Text>
              </View>
              <Pressable
                style={[styles.checkRow]}
                onPress={() => { Haptics.selectionAsync(); setDerogationGranted(v => !v); }}
              >
                <View style={[styles.checkbox, derogationGranted && styles.checkboxChecked]}>
                  {derogationGranted && <Feather name="check" size={12} color="#fff" />}
                </View>
                <Text style={styles.checkLabel}>Derogation granted by certifier</Text>
              </Pressable>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crop Details</Text>

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

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Quantity (kg)</Text>
                <Input placeholder="e.g. 500" value={quantityKg} onChangeText={setQuantityKg} keyboardType="decimal-pad" />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Batch / Lot No.</Text>
                <Input placeholder="e.g. BL-2024-001" value={batchLotNumber} onChangeText={setBatchLotNumber} />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Purchase Details</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Purchase Date *</Text>
              <Input placeholder="YYYY-MM-DD" value={purchaseDate} onChangeText={setPurchaseDate} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Supplier Name</Text>
              <Input placeholder="e.g. Organic Seed Store Ltd" value={supplierName} onChangeText={setSupplierName} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Supplier Address</Text>
              <Input placeholder="Town / postcode" value={supplierAddress} onChangeText={setSupplierAddress} />
            </View>
          </View>

          {needsDerogation && derogationGranted && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Derogation Reference</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Certifier Derogation Reference</Text>
                <Input placeholder="e.g. SA-DER-2024-007" value={derogationReference} onChangeText={setDerogationReference} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Certifier Approval Reference</Text>
                <Input placeholder="e.g. Approval letter ref" value={certifierApproval} onChangeText={setCertifierApproval} />
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.field}>
              <Input
                placeholder="Additional notes…"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                style={styles.textarea}
              />
            </View>
          </View>

          <Button title={saving ? "Saving…" : "Save Seed Record"} onPress={handleSave} disabled={saving} />
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
    backgroundColor: "#eff6ff",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#1d4ed8", flex: 1 },
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
  approvalCol: { gap: spacing.sm },
  approvalChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  approvalDot: { width: 8, height: 8, borderRadius: 4 },
  approvalLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, flex: 1 },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#fffbeb",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: spacing.md,
  },
  warningText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#92400e", flex: 1 },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  textarea: { minHeight: 80, textAlignVertical: "top" },
});
