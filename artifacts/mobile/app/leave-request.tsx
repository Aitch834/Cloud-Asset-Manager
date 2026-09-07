import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { kvGet } from "@/lib/database";
import { getMobileAuthToken as getCurrentAuthToken } from "@/lib/authToken";

// ─── Absence types staff can request ─────────────────────────────────────────
const REQUEST_TYPES = [
  "Annual Leave",
  "Compassionate Leave",
  "Unpaid Leave",
  "Training Day",
  "Other",
];

// ─── API helpers (same pattern as labour-timesheet.tsx) ───────────────────────
async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) {
      const farm = JSON.parse(raw) as { tenantSlug?: string; slug?: string };
      return farm.tenantSlug ?? farm.slug ?? "";
    }
  } catch {}
  return "";
}

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
}

// ─── Date helpers ──────────────────────────────────────────────────────────────
function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function calcDays(start: string, end: string): number | null {
  if (!start || !end || !/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return null;
  const s = new Date(start + "T00:00:00"), e = new Date(end + "T00:00:00");
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
  const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : null;
}

function fmtDisplay(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function LeaveRequestScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();

  const workerName = user?.name ?? "You";
  const farmId = currentFarm?.id ?? "";

  const today = todayIso();

  const [absenceType, setAbsenceType] = useState(REQUEST_TYPES[0]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const days = useMemo(() => calcDays(startDate, endDate), [startDate, endDate]);

  const isValid = days !== null && days > 0;

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isValid || !currentFarm) return;

    const typeLabel = absenceType;
    const dateLabel = startDate === endDate
      ? fmtDisplay(startDate)
      : `${fmtDisplay(startDate)} – ${fmtDisplay(endDate)}`;

    Alert.alert(
      "Submit Leave Request?",
      `Send a ${typeLabel} request for ${days} day${days === 1 ? "" : "s"} (${dateLabel}) to your manager?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Request",
          onPress: async () => {
            setSubmitting(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              const apiBase = getApiBase();
              const [token, tenantSlug] = await Promise.all([getCurrentAuthToken(), getTenantSlug()]);
              const res = await fetch(`${apiBase}/api/farms/${farmId}/labour/absences`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  "x-tenant-slug": tenantSlug,
                },
                body: JSON.stringify({
                  staffName: workerName,
                  absenceType,
                  startDate,
                  endDate,
                  daysCount: String(days),
                  notes: notes.trim() || null,
                  status: "pending",
                }),
              });
              if (res.ok) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  "Request Sent ✓",
                  `Your ${typeLabel} request has been sent to your manager for approval. You will receive a text message when it is actioned.`,
                  [{ text: "Done", onPress: () => router.back() }],
                );
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert("Submission Failed", "Could not reach the server. Please try again.");
              }
            } catch {
              Alert.alert("Error", "Something went wrong. Please check your connection and try again.");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="chevron-left" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerTitle}>
          <View style={[styles.headerIcon, { backgroundColor: "#d1fae5" }]}>
            <Feather name="calendar" size={18} color="#059669" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerText}>Request Leave</Text>
            <Text style={styles.headerSub} numberOfLines={1}>Submit to your manager for approval</Text>
          </View>
        </View>
      </View>

      {/* Worker banner */}
      <View style={styles.workerBanner}>
        <View style={styles.workerAvatar}>
          <Text style={styles.workerAvatarText}>
            {workerName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.workerName}>{workerName}</Text>
          <Text style={styles.workerSub}>{currentFarm?.name ?? "No farm selected"}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Leave type */}
        <View>
          <Text style={styles.sectionLabel}>Type of Leave</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipScrollContent}>
            {REQUEST_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => { setAbsenceType(t); Haptics.selectionAsync(); }}
                style={[styles.chip, absenceType === t && styles.chipSelected]}
              >
                <Text style={[styles.chipText, absenceType === t && styles.chipTextSelected]}>{t}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Dates */}
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>Start Date</Text>
            <TextInput
              style={styles.dateInput}
              value={startDate}
              onChangeText={(v) => {
                setStartDate(v);
                if (v > endDate) setEndDate(v);
              }}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor={colors.textSecondary}
            />
            {startDate && /^\d{4}-\d{2}-\d{2}$/.test(startDate) && (
              <Text style={styles.dateDisplay}>{fmtDisplay(startDate)}</Text>
            )}
          </View>
          <View style={styles.dateSeparator}>
            <Feather name="arrow-right" size={16} color={colors.textSecondary} />
          </View>
          <View style={styles.dateField}>
            <Text style={styles.fieldLabel}>End Date</Text>
            <TextInput
              style={styles.dateInput}
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              maxLength={10}
              placeholderTextColor={colors.textSecondary}
            />
            {endDate && /^\d{4}-\d{2}-\d{2}$/.test(endDate) && (
              <Text style={styles.dateDisplay}>{fmtDisplay(endDate)}</Text>
            )}
          </View>
        </View>

        {/* Days count pill */}
        {days !== null && days > 0 ? (
          <View style={styles.daysPill}>
            <Feather name="sun" size={14} color="#059669" />
            <Text style={styles.daysText}>{days} working day{days === 1 ? "" : "s"} requested</Text>
          </View>
        ) : startDate && endDate && (
          <View style={[styles.daysPill, styles.daysPillError]}>
            <Feather name="alert-circle" size={14} color="#dc2626" />
            <Text style={[styles.daysText, styles.daysTextError]}>
              {endDate < startDate ? "End date must be on or after start date" : "Enter valid dates in YYYY-MM-DD format"}
            </Text>
          </View>
        )}

        {/* Notes */}
        <View>
          <Text style={styles.fieldLabel}>Notes <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any details for your manager…"
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Feather name="info" size={13} color="#0369a1" style={{ marginTop: 1 }} />
          <Text style={styles.infoText}>
            Your request will appear as Pending in your manager's dashboard. They will approve or decline it and you will receive a text message with the outcome.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          title={submitting ? "Sending…" : `Send ${absenceType} Request${days && days > 0 ? ` (${days} day${days === 1 ? "" : "s"})` : ""}`}
          onPress={handleSubmit}
          disabled={submitting || !isValid}
          loading={submitting}
          style={{ ...styles.submitBtn, opacity: isValid ? 1 : 0.5 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface, gap: spacing.md,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: radius.full,
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
  },
  headerTitle: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  headerIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  headerText: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  headerSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },

  workerBanner: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: "#f0fdf4",
    borderBottomWidth: 1, borderBottomColor: "#bbf7d0",
  },
  workerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#059669", alignItems: "center", justifyContent: "center",
  },
  workerAvatarText: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: "#fff" },
  workerName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  workerSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },

  scroll: { flex: 1 },

  sectionLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.sm },
  fieldLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: 6 },
  optional: { fontFamily: fonts.regular, color: colors.textSecondary },

  chipScroll: { marginHorizontal: -spacing.lg },
  chipScrollContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1,
    borderColor: colors.border, backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: "#059669", backgroundColor: "#d1fae5" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextSelected: { color: "#059669" },

  dateRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm },
  dateField: { flex: 1 },
  dateSeparator: { paddingTop: 32, alignItems: "center" },
  dateInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text,
    backgroundColor: colors.surface, letterSpacing: 0.5,
  },
  dateDisplay: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#059669", marginTop: 4 },

  daysPill: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    backgroundColor: "#d1fae5", borderRadius: radius.full,
    paddingHorizontal: spacing.md, paddingVertical: 8, alignSelf: "flex-start",
  },
  daysPillError: { backgroundColor: "#fee2e2" },
  daysText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: "#059669" },
  daysTextError: { color: "#dc2626" },

  notesInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text,
    backgroundColor: colors.surface, minHeight: 80, textAlignVertical: "top",
  },

  infoBox: {
    flexDirection: "row", gap: spacing.sm, alignItems: "flex-start",
    backgroundColor: "#e0f2fe", borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: "#bae6fd",
  },
  infoText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#0369a1", lineHeight: 18 },

  footer: {
    paddingHorizontal: spacing.lg, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  submitBtn: { backgroundColor: "#059669" },
});
