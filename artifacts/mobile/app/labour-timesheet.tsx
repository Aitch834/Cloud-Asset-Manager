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

import { StaffMemberPicker } from "@/components/StaffMemberPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFarmMembers, type ApiFarmMember } from "@/lib/hooks/useApiFarmMembers";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import { kvGet } from "@/lib/database";

type OperationType =
  | "cultivation"
  | "drilling"
  | "spraying"
  | "harvesting"
  | "livestock_care"
  | "maintenance"
  | "administration"
  | "other";

const OPERATION_TYPES: { key: OperationType; label: string }[] = [
  { key: "cultivation", label: "Cultivation" },
  { key: "drilling", label: "Drilling / Planting" },
  { key: "spraying", label: "Spraying" },
  { key: "harvesting", label: "Harvesting" },
  { key: "livestock_care", label: "Livestock Care" },
  { key: "maintenance", label: "Maintenance / Repair" },
  { key: "administration", label: "Administration" },
  { key: "other", label: "Other" },
];

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      const t = await SecureStore.getItemAsync("auth_session_token");
      if (t) return t;
    }
    const raw = await kvGet("bde_auth_token");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) {
      const farm = JSON.parse(raw);
      return farm.tenantSlug || farm.slug || "";
    }
  } catch {}
  return "";
}

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
}

export default function LabourTimesheetScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { members, loading: membersLoading } = useApiFarmMembers(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [selectedMember, setSelectedMember] = useState<ApiFarmMember | null>(null);
  const [workDate, setWorkDate] = useState(today);
  const [operationType, setOperationType] = useState<OperationType>("cultivation");
  const [hoursWorked, setHoursWorked] = useState("");
  const [fieldReference, setFieldReference] = useState("");
  const [notes, setNotes] = useState("");

  const isValid = selectedMember !== null && workDate.length === 10 && parseFloat(hoursWorked) > 0;

  const handleSave = async () => {
    if (!isValid || !currentFarm) return;
    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const record = {
      id: generateId(),
      farmId: currentFarm.id,
      staffUserId: selectedMember!.userId,
      staffName: `${selectedMember!.firstName ?? ""} ${selectedMember!.lastName ?? ""}`.trim(),
      workDate,
      operationType,
      hoursWorked: parseFloat(hoursWorked),
      fieldReference: fieldReference.trim() || null,
      notes: notes.trim() || null,
      createdAt: new Date().toISOString(),
      _syncStatus: "pending" as const,
    };

    try {
      const apiBase = getApiBase();
      let saved = false;

      if (apiBase) {
        try {
          const [token, tenantSlug] = await Promise.all([getAuthToken(), getTenantSlug()]);
          const res = await fetch(`${apiBase}/api/farms/${currentFarm.id}/labour/timesheets`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              "x-tenant-slug": tenantSlug,
            },
            body: JSON.stringify({
              staffUserId: record.staffUserId,
              workDate: record.workDate,
              operationType: record.operationType,
              hoursWorked: record.hoursWorked,
              fieldReference: record.fieldReference,
              notes: record.notes,
            }),
          });
          if (res.ok) {
            saved = true;
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch {}
      }

      if (!saved) {
        await appendToList(STORAGE_KEYS.PENDING_SYNC, record);
        await refreshPendingCount();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      const operationLabel = OPERATION_TYPES.find(o => o.key === operationType)?.label ?? operationType;
      Alert.alert(
        saved ? "Timesheet Saved" : "Saved Offline",
        saved
          ? `${record.hoursWorked}h logged for ${record.staffName} (${operationLabel}) on ${record.workDate}.`
          : `${record.hoursWorked}h saved locally and will sync when connected.`,
        [{ text: "Log Another", onPress: resetForm }, { text: "Done", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "Could not save the timesheet entry. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedMember(null);
    setWorkDate(today);
    setOperationType("cultivation");
    setHoursWorked("");
    setFieldReference("");
    setNotes("");
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="chevron-left" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <View style={[styles.headerIcon, { backgroundColor: "#ede9fe" }]}>
            <Feather name="clock" size={18} color="#4f46e5" />
          </View>
          <View>
            <Text style={styles.headerText}>Labour Timesheet</Text>
            <Text style={styles.headerSub}>Log staff hours</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Staff Member</Text>
          <StaffMemberPicker
            members={members}
            loading={membersLoading}
            selected={selectedMember}
            onSelect={setSelectedMember}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Date</Text>
          <Input
            value={workDate}
            onChangeText={setWorkDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numeric"
          />
          <Text style={styles.hint}>Enter in YYYY-MM-DD format</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operation Type</Text>
          <View style={styles.chipGrid}>
            {OPERATION_TYPES.map(op => (
              <Pressable
                key={op.key}
                onPress={() => { setOperationType(op.key); Haptics.selectionAsync(); }}
                style={[styles.chip, operationType === op.key && styles.chipSelected]}
              >
                <Text style={[styles.chipText, operationType === op.key && styles.chipTextSelected]}>
                  {op.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hours Worked</Text>
          <Input
            value={hoursWorked}
            onChangeText={setHoursWorked}
            placeholder="e.g. 7.5"
            keyboardType="decimal-pad"
          />
          <Text style={styles.hint}>Decimal hours — e.g. 7.5 for 7 hours 30 minutes</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Field / Group Reference <Text style={styles.optional}>(optional)</Text></Text>
          <Input
            value={fieldReference}
            onChangeText={setFieldReference}
            placeholder="e.g. North Field, Herd 1"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes <Text style={styles.optional}>(optional)</Text></Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes…"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={[styles.wtrNote, { marginHorizontal: spacing.lg }]}>
          <Feather name="info" size={14} color="#4f46e5" style={{ marginTop: 1 }} />
          <Text style={styles.wtrNoteText}>
            Hours are included in the 17-week WTR rolling average on the dashboard. If a worker's average exceeds 48 hours per week, a compliance alert is raised.
          </Text>
        </View>
      </ScrollView>

      {/* Save button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          onPress={handleSave}
          disabled={!isValid || saving}
          loading={saving}
          title={saving ? "Saving…" : "Save Timesheet Entry"}
          style={styles.saveBtn}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { fontFamily: fonts.semiBold, fontSize: fontSize.base, color: colors.text },
  headerSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  scroll: { flex: 1 },
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  optional: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    fontWeight: "400",
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: "#4f46e5",
    backgroundColor: "#ede9fe",
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chipTextSelected: {
    color: "#4f46e5",
  },
  wtrNote: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.md,
    backgroundColor: "#ede9fe",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#c4b5fd",
  },
  wtrNoteText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#4f46e5",
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  saveBtn: { width: "100%" },
});
