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
import type { OrganicArableInput } from "@/lib/types";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const INPUT_TYPES = [
  "Fertiliser / Soil Amendment",
  "Crop Protection / Pesticide",
  "Biological Control",
  "Seed Treatment",
  "Cleaning & Disinfection",
  "Other",
];

const PERMITTED_STATUSES = [
  { key: "permitted", label: "Permitted (Annex II)", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { key: "restricted", label: "Restricted — notify certifier", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { key: "prohibited", label: "Prohibited", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
];

const QUANTITY_UNITS = ["kg/ha", "l/ha", "t/ha", "kg", "l", "g/ha"];

export default function OrganicArableInputScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [productName, setProductName] = useState("");
  const [inputType, setInputType] = useState("");
  const [permittedStatus, setPermittedStatus] = useState("permitted");
  const [regulatoryBasis, setRegulatoryBasis] = useState("Annex II — UK Retained EU Reg 2018/848");
  const [supplierName, setSupplierName] = useState("");
  const [applicationDate, setApplicationDate] = useState(todayDate());
  const [fieldName, setFieldName] = useState("");
  const [quantityApplied, setQuantityApplied] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("kg/ha");
  const [areaAppliedHa, setAreaAppliedHa] = useState("");
  const [certifierApproval, setCertifierApproval] = useState("");
  const [activeIngredient, setActiveIngredient] = useState("");
  const [notes, setNotes] = useState("");

  const needsApproval = permittedStatus === "restricted";
  const isProhibited = permittedStatus === "prohibited";

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert("Required", "Please enter the product or substance name.");
      return;
    }
    if (!applicationDate.trim()) {
      Alert.alert("Required", "Please enter the application date.");
      return;
    }
    if (needsApproval && !certifierApproval.trim()) {
      Alert.alert(
        "Certifier Approval Required",
        "Restricted inputs require prior certifier notification. Please enter the certifier reference before saving.",
        [{ text: "OK" }]
      );
      return;
    }
    if (isProhibited) {
      Alert.alert(
        "Prohibited Input",
        "This substance is not permitted on organic land. Please change the status or select a different product.",
        [{ text: "OK" }]
      );
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: OrganicArableInput = {
      id: generateId(),
      farmId: currentFarm?.id ?? "",
      productName: productName.trim(),
      inputType: inputType.trim(),
      permittedStatus,
      regulatoryBasis: regulatoryBasis.trim(),
      supplierName: supplierName.trim(),
      applicationDate: applicationDate.trim(),
      fieldName: fieldName.trim(),
      quantityApplied: quantityApplied.trim(),
      quantityUnit: quantityUnit.trim(),
      areaAppliedHa: areaAppliedHa.trim(),
      certifierApproval: certifierApproval.trim(),
      activeIngredient: activeIngredient.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.ORGANIC_ARABLE_INPUTS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Input Logged",
      "The arable input record has been saved locally and will sync when online.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Log Arable Input</Text>
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
            <Feather name="package" size={14} color="#2563eb" />
            <Text style={styles.infoText}>
              Record all fertilisers, soil amendments, and crop protection products applied to organically managed arable land. Only Annex II approved inputs are permitted — restricted inputs require prior certifier notification.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Product / Substance Name *</Text>
              <Input placeholder="e.g. Rock Phosphate, Bordeaux Mixture" value={productName} onChangeText={setProductName} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Active Ingredient</Text>
              <Input placeholder="e.g. Copper hydroxide, Calcium carbonate" value={activeIngredient} onChangeText={setActiveIngredient} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Input Type</Text>
              <View style={styles.chipWrap}>
                {INPUT_TYPES.map(t => (
                  <Pressable
                    key={t}
                    style={[styles.chip, inputType === t && styles.chipActive]}
                    onPress={() => { Haptics.selectionAsync(); setInputType(t); }}
                  >
                    <Text style={[styles.chipText, inputType === t && styles.chipTextActive]}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Permitted Status</Text>
              <View style={styles.approvalCol}>
                {PERMITTED_STATUSES.map(s => (
                  <Pressable
                    key={s.key}
                    style={[
                      styles.approvalChip,
                      { borderColor: permittedStatus === s.key ? s.color : colors.border, backgroundColor: permittedStatus === s.key ? s.bg : colors.surface },
                    ]}
                    onPress={() => { Haptics.selectionAsync(); setPermittedStatus(s.key); }}
                  >
                    <View style={[styles.approvalDot, { backgroundColor: s.color }]} />
                    <Text style={[styles.approvalLabel, { color: permittedStatus === s.key ? s.color : colors.textSecondary }]}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Supplier</Text>
              <Input placeholder="e.g. Agrichoice Ltd" value={supplierName} onChangeText={setSupplierName} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Application Details</Text>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Application Date *</Text>
                <Input placeholder="YYYY-MM-DD" value={applicationDate} onChangeText={setApplicationDate} />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Field</Text>
              <FieldPicker fields={fields} loading={fieldsLoading} value={fieldName} onChange={setFieldName} label="Field (optional)" error={null} />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Quantity Applied</Text>
                <Input placeholder="Amount" value={quantityApplied} onChangeText={setQuantityApplied} keyboardType="decimal-pad" />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Unit</Text>
                <View style={styles.chipWrap}>
                  {QUANTITY_UNITS.map(u => (
                    <Pressable
                      key={u}
                      style={[styles.chip, quantityUnit === u && styles.chipActive, { paddingHorizontal: spacing.sm }]}
                      onPress={() => { Haptics.selectionAsync(); setQuantityUnit(u); }}
                    >
                      <Text style={[styles.chipText, quantityUnit === u && styles.chipTextActive]}>{u}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Area Applied (ha)</Text>
              <Input placeholder="e.g. 12.5" value={areaAppliedHa} onChangeText={setAreaAppliedHa} keyboardType="decimal-pad" />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Regulatory Basis</Text>
              <Input placeholder="e.g. Annex II — UK Retained EU Reg 2018/848" value={regulatoryBasis} onChangeText={setRegulatoryBasis} />
            </View>
          </View>

          {needsApproval && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certifier Approval</Text>
              <View style={styles.warningBox}>
                <Feather name="alert-triangle" size={13} color="#92400e" />
                <Text style={styles.warningText}>
                  Restricted inputs require prior written notification to your certifying body before use. Record their approval reference below.
                </Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Certifier Approval Reference *</Text>
                <Input placeholder="e.g. SA-RESTR-2024-001" value={certifierApproval} onChangeText={setCertifierApproval} />
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.field}>
              <Input
                placeholder="Application method, operator, justification for use…"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
                style={styles.textarea}
              />
            </View>
          </View>

          <Button title={saving ? "Saving…" : "Save Input Record"} onPress={handleSave} disabled={saving} />
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
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  approvalDot: { width: 8, height: 8, borderRadius: 4 },
  approvalLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm },
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
  textarea: { minHeight: 90, textAlignVertical: "top" },
});
