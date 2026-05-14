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
import type { OrganicInput } from "@/lib/types";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function currentYear(): string {
  return String(new Date().getFullYear());
}

const INPUT_TYPES = [
  "Fertiliser / Soil Amendment",
  "Crop Protection",
  "Seed Treatment",
  "Feed Supplement / Additive",
  "Cleaning & Disinfection",
  "Other",
];

const APPROVAL_STATUS = [
  { key: "permitted", label: "Permitted", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  { key: "restricted", label: "Restricted", color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { key: "derogation", label: "Derogation Required", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
];

const QUANTITY_UNITS = ["kg", "g", "tonnes", "L", "mL", "bags", "units", "other"];

export default function OrganicInputScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [productName, setProductName] = useState("");
  const [inputType, setInputType] = useState("");
  const [approvalStatus, setApprovalStatus] = useState("permitted");
  const [supplier, setSupplier] = useState("");
  const [dateOfUse, setDateOfUse] = useState(todayDate());
  const [fieldName, setFieldName] = useState("");
  const [quantityAmount, setQuantityAmount] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("kg");
  const [cropYear, setCropYear] = useState(currentYear());
  const [certifierApprovalRef, setCertifierApprovalRef] = useState("");
  const [notes, setNotes] = useState("");

  const needsApprovalRef = approvalStatus === "restricted" || approvalStatus === "derogation";

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert("Required Field", "Please enter a product name.");
      return;
    }
    if (!dateOfUse.trim()) {
      Alert.alert("Required Field", "Please enter the date of use.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: OrganicInput = {
      id: generateId(),
      farmId: currentFarm?.id ?? "",
      productName: productName.trim(),
      inputType: inputType.trim(),
      approvalStatus,
      supplier: supplier.trim(),
      dateOfUse: dateOfUse.trim(),
      fieldName: fieldName.trim(),
      quantityAmount: quantityAmount.trim(),
      quantityUnit: quantityUnit.trim(),
      cropYear: cropYear.trim(),
      certifierApprovalRef: certifierApprovalRef.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.ORGANIC_INPUTS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Input Logged",
      "Your organic input has been saved and will sync when online.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Log Organic Input</Text>
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
              Log any input used on organically-managed land — fertilisers, sprays, seed treatments, feed supplements. Records sync to the Input Register.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Details</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Product Name *</Text>
              <Input placeholder="e.g. Rock Phosphate, Permitted Spray" value={productName} onChangeText={setProductName} />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Input Type</Text>
              <View style={styles.chipWrap}>
                {INPUT_TYPES.map((t) => (
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
              <Text style={styles.label}>Approval Status</Text>
              <View style={styles.approvalRow}>
                {APPROVAL_STATUS.map((s) => (
                  <Pressable
                    key={s.key}
                    style={[
                      styles.approvalChip,
                      { borderColor: approvalStatus === s.key ? s.color : colors.border, backgroundColor: approvalStatus === s.key ? s.bg : colors.surface },
                    ]}
                    onPress={() => { Haptics.selectionAsync(); setApprovalStatus(s.key); }}
                  >
                    <View style={[styles.approvalDot, { backgroundColor: s.color }]} />
                    <Text style={[styles.approvalLabel, { color: approvalStatus === s.key ? s.color : colors.textSecondary }]}>{s.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Supplier</Text>
              <Input placeholder="e.g. Agrichoice Ltd" value={supplier} onChangeText={setSupplier} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Application Details</Text>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Date of Use *</Text>
                <Input placeholder="YYYY-MM-DD" value={dateOfUse} onChangeText={setDateOfUse} maxDate="today" />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Crop Year</Text>
                <Input placeholder={currentYear()} value={cropYear} onChangeText={setCropYear} keyboardType="number-pad" />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Field</Text>
              <FieldPicker fields={fields} loading={fieldsLoading} value={fieldName} onChange={setFieldName} label="Field (optional)" error={null} />
            </View>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Quantity</Text>
                <Input placeholder="Amount" value={quantityAmount} onChangeText={setQuantityAmount} keyboardType="decimal-pad" />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Unit</Text>
                <View style={styles.chipWrap}>
                  {QUANTITY_UNITS.map((u) => (
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
          </View>

          {needsApprovalRef && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Approval Reference</Text>
              <View style={[styles.warningBox]}>
                <Feather name="alert-triangle" size={13} color="#92400e" />
                <Text style={styles.warningText}>
                  {approvalStatus === "derogation"
                    ? "A derogation must be obtained from your certifier before use. Record the certifier reference below. For livestock feed ingredients, manage the full derogation case — including correspondence log and approval documents — in the Feed Derogations section of the Organic Livestock module in the dashboard."
                    : "Notify your certifier before applying restricted inputs. Record their reference below."}
                </Text>
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Certifier Approval / Reference</Text>
                <Input placeholder="e.g. SA-DER-2024-001" value={certifierApprovalRef} onChangeText={setCertifierApprovalRef} />
              </View>
              {approvalStatus === "derogation" && inputType === "Feed Supplement / Additive" && (
                <Pressable
                  style={styles.derogationLink}
                  onPress={() => router.push("/organic-feed-derogations")}
                >
                  <Feather name="file-text" size={13} color="#ea580c" />
                  <Text style={styles.derogationLinkText}>View Feed Derogation Cases</Text>
                  <Feather name="chevron-right" size={13} color="#ea580c" />
                </Pressable>
              )}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Notes</Text>
            <View style={styles.field}>
              <Input
                placeholder="Reason for use, application method, operator..."
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
  approvalRow: { gap: spacing.sm },
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
  derogationLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: "#fff7ed",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  derogationLinkText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#ea580c",
    flex: 1,
  },
});
