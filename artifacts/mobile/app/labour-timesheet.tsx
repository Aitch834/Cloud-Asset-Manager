import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { kvGet } from "@/lib/database";
import { getMobileAuthToken as getCurrentAuthToken } from "@/lib/authToken";
import { generateId } from "@/lib/storage";
import {
  type DraftEntry,
  addDraftEntry,
  clearDraft,
  loadDraft,
  removeDraftEntry,
  saveDraft,
  todayIso,
} from "@/lib/timesheetDraft";

// ─── Task types (matches dashboard LabourPage) ───────────────────────────────
const TASK_TYPES = [
  "General Farm Work",
  "Livestock Handling",
  "Harvesting",
  "Drilling / Planting",
  "Crop Spraying",
  "Machinery Maintenance",
  "Fencing / Hedging",
  "Irrigation",
  "Grain Handling / Store",
  "Cleaning & Biosecurity",
  "Vehicle / Transport",
  "Travel (between sites)",
  "Record Keeping / Admin",
  "Building / Construction",
];

// ─── API helpers ──────────────────────────────────────────────────────────────
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

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function LabourTimesheetScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const date = todayIso();
  const workerName = user?.name ?? "You";
  const farmId = currentFarm?.id ?? "";
  const userId = user?.id ?? "unknown";

  // ── Draft state ────────────────────────────────────────────────────────────
  const [entries, setEntries] = useState<DraftEntry[]>([]);
  const [loadingDraft, setLoadingDraft] = useState(true);

  // ── Add-entry form state ───────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [taskType, setTaskType] = useState(TASK_TYPES[0]);
  const [regularHours, setRegularHours] = useState("");
  const [overtimeHours, setOvertimeHours] = useState("");
  const [entryNotes, setEntryNotes] = useState("");

  // ── Submit state ───────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);

  // ── Load draft on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (!farmId) return;
    loadDraft(farmId, userId, date).then((loaded) => {
      setEntries(loaded);
      setLoadingDraft(false);
    });
  }, [farmId, userId, date]);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalRegular = entries.reduce((s, e) => s + e.hoursRegular, 0);
  const totalOvertime = entries.reduce((s, e) => s + e.hoursOvertime, 0);
  const taskLinkedCount = entries.filter((e) => e.linkedTaskId).length;

  // ── Add freeform entry ─────────────────────────────────────────────────────
  const handleAddEntry = async () => {
    const reg = parseFloat(regularHours);
    if (!regularHours || isNaN(reg) || reg <= 0) {
      Alert.alert("Hours required", "Please enter how many regular hours you worked.");
      return;
    }
    const ot = parseFloat(overtimeHours) || 0;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const entry: DraftEntry = {
      id: generateId(),
      taskType,
      hoursRegular: reg,
      hoursOvertime: ot,
      notes: entryNotes.trim(),
    };
    const next = [...entries, entry];
    setEntries(next);
    await saveDraft(farmId, userId, date, next);
    setRegularHours("");
    setOvertimeHours("");
    setEntryNotes("");
    setShowForm(false);
  };

  // ── Delete entry ───────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const next = await removeDraftEntry(farmId, userId, date, id);
    setEntries(next);
  }, [farmId, userId, date]);

  // ── Refresh entries (called when returning from task inbox) ────────────────
  const refreshDraft = useCallback(async () => {
    if (!farmId) return;
    const loaded = await loadDraft(farmId, userId, date);
    setEntries(loaded);
  }, [farmId, userId, date]);

  // Refresh when screen is focused (entries may have been added via task inbox)
  useEffect(() => {
    const interval = setInterval(refreshDraft, 3000);
    return () => clearInterval(interval);
  }, [refreshDraft]);

  // ── Submit timesheet ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (entries.length === 0 || !currentFarm) return;

    Alert.alert(
      "Submit Timesheet?",
      `This will submit ${entries.length} entr${entries.length === 1 ? "y" : "ies"} (${totalRegular.toFixed(1)}h regular${totalOvertime > 0 ? ` + ${totalOvertime.toFixed(1)}h overtime` : ""}) to your manager for approval.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async () => {
            setSubmitting(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              const apiBase = getApiBase();
              const [token, tenantSlug] = await Promise.all([getCurrentAuthToken(), getTenantSlug()]);
              let successCount = 0;
              let failCount = 0;

              for (const entry of entries) {
                try {
                  const res = await fetch(`${apiBase}/api/farms/${farmId}/labour/timesheets`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      "x-tenant-slug": tenantSlug,
                    },
                    body: JSON.stringify({
                      staffName: workerName,
                      date,
                      taskType: entry.taskType,
                      hoursRegular: entry.hoursRegular.toFixed(2),
                      hoursOvertime: entry.hoursOvertime.toFixed(2),
                      notes: [
                        entry.linkedTaskTitle ? `Task: ${entry.linkedTaskTitle}` : "",
                        entry.notes,
                      ].filter(Boolean).join(" — ") || null,
                    }),
                  });
                  if (res.ok) successCount++;
                  else failCount++;
                } catch { failCount++; }
              }

              if (successCount > 0) {
                await clearDraft(farmId, userId, date);
                setEntries([]);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(
                  "Timesheet Submitted ✓",
                  failCount === 0
                    ? `All ${successCount} entr${successCount === 1 ? "y" : "ies"} sent to your manager for approval.`
                    : `${successCount} submitted, ${failCount} failed — please try again later.`,
                  [{ text: "Done", onPress: () => router.back() }],
                );
              } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                Alert.alert("Submission Failed", "Could not reach the server. Entries are saved locally.");
              }
            } catch {
              Alert.alert("Error", "Something went wrong. Please try again.");
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
          <View style={[styles.headerIcon, { backgroundColor: "#ede9fe" }]}>
            <Feather name="clock" size={18} color="#4f46e5" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerText}>My Timesheet</Text>
            <Text style={styles.headerSub} numberOfLines={1}>{today}</Text>
          </View>
        </View>
      </View>

      {/* Worker identity banner */}
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
        {entries.length > 0 && (
          <View style={styles.totalsBadge}>
            <Text style={styles.totalsBadgeText}>
              {(totalRegular + totalOvertime).toFixed(1)}h logged
            </Text>
          </View>
        )}
      </View>

      {/* Task-linked hint banner */}
      {taskLinkedCount > 0 && (
        <View style={styles.taskHintBanner}>
          <Feather name="link" size={13} color="#7c3aed" />
          <Text style={styles.taskHintText}>
            {taskLinkedCount} entr{taskLinkedCount === 1 ? "y" : "ies"} logged via task completion
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        keyboardShouldPersistTaps="handled"
      >
        {loadingDraft ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Loading…</Text>
          </View>
        ) : entries.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="clock" size={32} color="#a5b4fc" />
            </View>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptyText}>
              Add entries here, or complete tasks from your Task Inbox — time logged there appears automatically.
            </Text>
          </View>
        ) : (
          <View style={styles.entriesList}>
            {entries.map((entry, i) => (
              <View key={entry.id} style={[styles.entryCard, entry.linkedTaskId ? styles.entryCardLinked : null]}>
                <View style={styles.entryLeft}>
                  <View style={[styles.entryNumber, entry.linkedTaskId ? styles.entryNumberLinked : null]}>
                    {entry.linkedTaskId ? (
                      <Feather name="link" size={12} color="#7c3aed" />
                    ) : (
                      <Text style={styles.entryNumberText}>{i + 1}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    {entry.linkedTaskTitle ? (
                      <Text style={styles.entryLinkedTask} numberOfLines={1}>
                        {entry.linkedTaskTitle}
                      </Text>
                    ) : null}
                    <Text style={styles.entryTask}>{entry.taskType}</Text>
                    <Text style={styles.entryHours}>
                      {entry.hoursRegular.toFixed(1)}h regular
                      {entry.hoursOvertime > 0 ? ` · ${entry.hoursOvertime.toFixed(1)}h overtime` : ""}
                    </Text>
                    {entry.notes ? (
                      <Text style={styles.entryNotes} numberOfLines={2}>{entry.notes}</Text>
                    ) : null}
                  </View>
                </View>
                <Pressable onPress={() => handleDelete(entry.id)} style={styles.deleteBtn} hitSlop={8}>
                  <Feather name="trash-2" size={16} color={colors.error} />
                </Pressable>
              </View>
            ))}

            {entries.length > 0 && (
              <View style={styles.totalsCard}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Regular hours</Text>
                  <Text style={styles.totalValue}>{totalRegular.toFixed(1)}h</Text>
                </View>
                {totalOvertime > 0 && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Overtime hours</Text>
                    <Text style={styles.totalValue}>{totalOvertime.toFixed(1)}h</Text>
                  </View>
                )}
                <View style={[styles.totalRow, styles.totalRowBold]}>
                  <Text style={styles.totalLabelBold}>Total</Text>
                  <Text style={styles.totalValueBold}>{(totalRegular + totalOvertime).toFixed(1)}h</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Add entry form */}
        {showForm && (
          <View style={styles.addForm}>
            <View style={styles.addFormHeader}>
              <Text style={styles.addFormTitle}>Add Work Entry</Text>
              <Pressable
                onPress={() => { setShowForm(false); setRegularHours(""); setOvertimeHours(""); setEntryNotes(""); }}
                hitSlop={8}
              >
                <Feather name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Task Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
              contentContainerStyle={styles.chipScrollContent}
            >
              {TASK_TYPES.map((t) => (
                <Pressable
                  key={t}
                  onPress={() => { setTaskType(t); Haptics.selectionAsync(); }}
                  style={[styles.chip, taskType === t && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, taskType === t && styles.chipTextSelected]}>{t}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.hoursRow}>
              <View style={styles.hoursField}>
                <Text style={styles.fieldLabel}>Regular hours</Text>
                <Input
                  value={regularHours}
                  onChangeText={setRegularHours}
                  placeholder="e.g. 7.5"
                  keyboardType="decimal-pad"
                />
                <Text style={styles.fieldHint}>e.g. 7.5 for 7h 30m</Text>
              </View>
              <View style={styles.hoursField}>
                <Text style={styles.fieldLabel}>Overtime <Text style={styles.optional}>(optional)</Text></Text>
                <Input
                  value={overtimeHours}
                  onChangeText={setOvertimeHours}
                  placeholder="e.g. 1.5"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Notes <Text style={styles.optional}>(optional)</Text></Text>
            <Input
              value={entryNotes}
              onChangeText={setEntryNotes}
              placeholder="What did you do? Any details…"
              multiline
              numberOfLines={2}
            />

            <Button title="Add Entry" onPress={handleAddEntry} style={styles.addBtn} />
          </View>
        )}

        <View style={styles.wtrNote}>
          <Feather name="info" size={13} color="#6366f1" style={{ marginTop: 1 }} />
          <Text style={styles.wtrText}>
            Hours feed into the 17-week WTR rolling average. Your manager reviews and approves submitted entries on the dashboard.
          </Text>
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {!showForm && (
          <Pressable
            onPress={() => { setShowForm(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={styles.addEntryBtn}
          >
            <Feather name="plus" size={18} color="#4f46e5" />
            <Text style={styles.addEntryBtnText}>Add Entry</Text>
          </Pressable>
        )}
        {!showForm && entries.length > 0 && (
          <Button
            title={submitting ? "Submitting…" : `Submit Today's Timesheet (${entries.length})`}
            onPress={handleSubmit}
            disabled={submitting}
            loading={submitting}
            style={styles.submitBtn}
          />
        )}
        {!showForm && entries.length === 0 && (
          <Text style={styles.footerHint}>Add at least one entry before submitting.</Text>
        )}
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
    backgroundColor: "#f5f3ff",
    borderBottomWidth: 1, borderBottomColor: "#e0e7ff",
  },
  workerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "#4f46e5", alignItems: "center", justifyContent: "center",
  },
  workerAvatarText: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: "#fff" },
  workerName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  workerSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  totalsBadge: {
    backgroundColor: "#4f46e5", paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.full,
  },
  totalsBadgeText: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: "#fff" },

  taskHintBanner: {
    flexDirection: "row", alignItems: "center", gap: spacing.xs,
    paddingHorizontal: spacing.lg, paddingVertical: 7,
    backgroundColor: "#faf5ff", borderBottomWidth: 1, borderBottomColor: "#e9d5ff",
  },
  taskHintText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: "#7c3aed" },

  scroll: { flex: 1 },

  emptyState: {
    alignItems: "center", paddingVertical: spacing.xxxl, paddingHorizontal: spacing.xl, gap: spacing.md,
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: "#ede9fe",
    alignItems: "center", justifyContent: "center",
  },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  emptyText: {
    fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary,
    textAlign: "center", lineHeight: 20,
  },

  entriesList: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.sm },

  entryCard: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1, shadowRadius: 4, elevation: 1, gap: spacing.sm,
    borderWidth: 1, borderColor: "transparent",
  },
  entryCardLinked: {
    borderColor: "#e9d5ff", backgroundColor: "#fdf4ff",
  },
  entryLeft: { flex: 1, flexDirection: "row", gap: spacing.sm, alignItems: "flex-start" },
  entryNumber: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: "#ede9fe",
    alignItems: "center", justifyContent: "center",
  },
  entryNumberLinked: { backgroundColor: "#f3e8ff" },
  entryNumberText: { fontFamily: fonts.bold, fontSize: fontSize.xs, color: "#4f46e5" },
  entryLinkedTask: {
    fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: "#7c3aed",
    marginBottom: 2,
  },
  entryTask: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  entryHours: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#4f46e5", marginTop: 2 },
  entryNotes: {
    fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary,
    marginTop: 3, lineHeight: 16,
  },
  deleteBtn: { padding: spacing.xs },

  totalsCard: {
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: "#e0e7ff", marginTop: spacing.sm,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalRowBold: { borderTopWidth: 1, borderTopColor: colors.borderLight, marginTop: 4, paddingTop: 8 },
  totalLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  totalValue: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  totalLabelBold: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  totalValueBold: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: "#4f46e5" },

  addForm: {
    marginHorizontal: spacing.lg, marginTop: spacing.lg,
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, borderColor: "#e0e7ff",
    shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1, shadowRadius: 8, elevation: 2, gap: spacing.md,
  },
  addFormHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addFormTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },

  fieldLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  fieldHint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 3 },
  optional: { fontFamily: fonts.regular, color: colors.textSecondary, fontWeight: "400" },

  chipScroll: { marginBottom: spacing.sm },
  chipScrollContent: { gap: spacing.sm, paddingBottom: 4 },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 2,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
  },
  chipSelected: { borderColor: "#4f46e5", backgroundColor: "#ede9fe" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextSelected: { color: "#4f46e5" },

  hoursRow: { flexDirection: "row", gap: spacing.md },
  hoursField: { flex: 1 },
  addBtn: { marginTop: spacing.xs },

  wtrNote: {
    flexDirection: "row", gap: spacing.sm,
    marginHorizontal: spacing.lg, marginTop: spacing.xl, padding: spacing.md,
    backgroundColor: "#eef2ff", borderRadius: radius.md, borderWidth: 1, borderColor: "#c7d2fe",
  },
  wtrText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#4338ca", lineHeight: 18 },

  footer: {
    paddingHorizontal: spacing.lg, paddingTop: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
    backgroundColor: colors.surface, gap: spacing.sm,
  },
  addEntryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
    paddingVertical: spacing.sm + 2, borderRadius: radius.lg,
    borderWidth: 1.5, borderColor: "#4f46e5", backgroundColor: "#f5f3ff",
  },
  addEntryBtnText: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: "#4f46e5" },
  submitBtn: { width: "100%" },
  footerHint: {
    textAlign: "center", fontFamily: fonts.regular, fontSize: fontSize.xs,
    color: colors.textSecondary, paddingVertical: spacing.xs,
  },
});
