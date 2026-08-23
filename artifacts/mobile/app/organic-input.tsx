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
import { FieldPicker } from "@/components/ui/FieldPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFields } from "@/lib/hooks/useApiFields";
import { kvGet, replacePendingSyncItem } from "@/lib/database";
import { savePendingOrganicInputRevision } from "@/lib/organicInputPendingEdit";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { OrganicInput } from "@/lib/types";
import { scheduleSync } from "@/lib/sync-engine";

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

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    let token: string | null = null;
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      token = await SecureStore.getItemAsync("auth_session_token");
    } else {
      try { token = localStorage.getItem("auth_session_token"); } catch { token = null; }
    }
    if (!token) {
      const raw = await kvGet("bde_auth_token");
      token = raw ? JSON.parse(raw) : null;
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const farmRaw = await kvGet("bde_current_farm");
    if (farmRaw) {
      const farm = JSON.parse(farmRaw);
      headers["x-tenant-slug"] = farm.tenantSlug || farm.slug || "";
    }
  } catch {}
  return headers;
}

export default function OrganicInputScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { isConnected, refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  // Route params — present when editing an existing server record (id) or a pending local record (pendingId)
  const params = useLocalSearchParams<{
    id?: string;
    pendingId?: string;
    productName?: string;
    inputType?: string;
    approvalStatus?: string;
    supplier?: string;
    dateOfUse?: string;
    quantityAmount?: string;
    quantityUnit?: string;
    cropYear?: string;
    certifierApprovalRef?: string;
    derogationExpiryDate?: string;
    fieldName?: string;
    notes?: string;
  }>();

  const editId = params.id ? parseInt(params.id) : null;
  const isEdit = editId != null && !isNaN(editId);
  /** true when editing a pending (not-yet-synced) local record */
  const isPendingEdit = !!params.pendingId && !isEdit;

  const apiBase = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";

  const [productName, setProductName] = useState(params.productName ?? "");
  const [inputType, setInputType] = useState(params.inputType ?? "");
  const [approvalStatus, setApprovalStatus] = useState(params.approvalStatus ?? "permitted");
  const [supplier, setSupplier] = useState(params.supplier ?? "");
  const [dateOfUse, setDateOfUse] = useState(params.dateOfUse ?? todayDate());
  const [fieldName, setFieldName] = useState(params.fieldName ?? "");
  const [quantityAmount, setQuantityAmount] = useState(params.quantityAmount ?? "");
  const [quantityUnit, setQuantityUnit] = useState(params.quantityUnit || "kg");
  const [cropYear, setCropYear] = useState(params.cropYear ?? currentYear());
  const [certifierApprovalRef, setCertifierApprovalRef] = useState(params.certifierApprovalRef ?? "");
  const [derogationExpiryDate, setDerogationExpiryDate] = useState(params.derogationExpiryDate ?? "");
  const [notes, setNotes] = useState(params.notes ?? "");

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

    const changes = {
      productName: productName.trim(),
      inputType: inputType.trim() || null,
      approvalStatus,
      supplier: supplier.trim() || null,
      dateOfUse: dateOfUse.trim() || null,
      fieldName: fieldName.trim() || null,
      quantityAmount: quantityAmount.trim() || null,
      quantityUnit: quantityUnit.trim() || null,
      cropYear: cropYear.trim() ? parseInt(cropYear.trim()) : null,
      certifierApprovalRef: certifierApprovalRef.trim() || null,
      derogationExpiryDate: derogationExpiryDate.trim() || null,
      notes: notes.trim() || null,
    };

    if (isPendingEdit) {
      // ── Pending edit mode: overwrite the queued local record ──────────────
      try {
        const updatedRecord: OrganicInput = {
          id: params.pendingId!,
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
          derogationExpiryDate: derogationExpiryDate.trim() || undefined,
          notes: notes.trim(),
          createdAt: new Date().toISOString(),
          synced: false,
        };
        const outcome = await savePendingOrganicInputRevision({
          localId: params.pendingId!,
          farmId: currentFarm?.id ?? "",
          updatedRecord,
          changes,
        });
        setSaving(false);
        if (outcome === "server_record_unavailable") {
          Alert.alert(
            "Could Not Save",
            "The record finished syncing, but its server copy could not be identified. Keep this screen open and try again.",
          );
          return;
        }
        await scheduleSync();
        const title = outcome === "server_edit_queued" ? "Edit Pending Sync" : "Record Updated";
        Alert.alert(title, "Your changes will sync when you're back online.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } catch {
        setSaving(false);
        Alert.alert("Error", "Could not update this record. Please try again.");
      }
    } else if (isEdit) {
      // ── Edit mode: PUT to server ──────────────────────────────────────────
      const queueEdit = async (): Promise<void> => {
        try {
          await replacePendingSyncItem(STORAGE_KEYS.ORGANIC_INPUT_EDITS, String(editId), {
            farmId: currentFarm?.id ?? "",
            serverRecordId: editId,
            changes,
          });
          await scheduleSync();
          Alert.alert(
            "Edit Pending Sync",
            "Your changes are saved on this device and will sync when your connection returns.",
            [{ text: "OK", onPress: () => router.back() }],
          );
        } catch {
          Alert.alert(
            "Could Not Save",
            "Your changes could not be saved on this device. Please keep this screen open and try again.",
          );
        } finally {
          setSaving(false);
        }
      };

      if (!isConnected) {
        await queueEdit();
        return;
      }

      try {
        const headers = await getAuthHeaders();
        const res = await fetch(
          `${apiBase}/api/farms/${currentFarm?.id}/organic/inputs/${editId}`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify(changes),
          }
        );
        setSaving(false);
        if (!res.ok) {
          Alert.alert("Error", "Could not save changes. Please try again.");
          return;
        }
        Alert.alert("Changes Saved", "The input record has been updated.", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } catch {
        // A fetch rejection is a network-level failure. Preserve the edit even
        // if NetInfo had not yet reported that connectivity was lost.
        await queueEdit();
      }
    } else {
      // ── Add mode: queue for sync ──────────────────────────────────────────
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
        derogationExpiryDate: derogationExpiryDate.trim() || undefined,
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
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{isPendingEdit ? "Edit Pending Record" : isEdit ? "Edit Input Record" : "Log Organic Input"}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!isEdit && !isPendingEdit && (
            <View style={styles.infoBox}>
              <Feather name="package" size={14} color="#2563eb" />
              <Text style={styles.infoText}>
                Log any input used on organically-managed land — fertilisers, sprays, seed treatments, feed supplements. Records sync to the Input Register.
              </Text>
            </View>
          )}

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
              <View style={styles.field}>
                <Text style={styles.label}>Derogation Expiry Date</Text>
                <Input
                  placeholder="YYYY-MM-DD"
                  value={derogationExpiryDate}
                  onChangeText={setDerogationExpiryDate}
                  keyboardType="numbers-and-punctuation"
                />
                <Text style={styles.fieldHint}>Leave blank if no fixed expiry date</Text>
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

          <Button
            title={saving ? "Saving…" : isPendingEdit ? "Save Changes" : isEdit ? "Save Changes" : "Save Input Record"}
            onPress={handleSave}
            disabled={saving}
          />
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
  fieldHint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing.xs },
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
