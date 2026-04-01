import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";

type Assignment = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  module: string | null;
  staffName: string;
  assignmentNote: string | null;
  status: string;
  smsSent: boolean;
  completedAt: string | null;
  completionNote: string | null;
  createdAt: string;
};

function fmtDate(d: string | null): string {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === "completed" || status === "cancelled") return false;
  return new Date(dueDate) < new Date();
}

const STATUS_COLOURS: Record<string, string> = {
  pending: colors.warning ?? "#f59e0b",
  in_progress: "#3b82f6",
  completed: colors.success ?? "#22c55e",
  cancelled: colors.textMuted ?? "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

function AssignmentCard({
  item, farmId, onUpdated,
}: {
  item: Assignment; farmId: number; onUpdated: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [completionNote, setCompletionNote] = useState("");
  const [loading, setLoading] = useState(false);
  const overdue = isOverdue(item.dueDate, item.status);
  const isDone = item.status === "completed" || item.status === "cancelled";

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/farms/${farmId}/task-assignments/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed", completionNote: completionNote.trim() || undefined }),
      });
      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onUpdated();
        setExpanded(false);
      } else {
        Alert.alert("Error", "Failed to mark task complete. Please try again.");
      }
    } catch {
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleInProgress = async () => {
    setLoading(true);
    try {
      await fetch(`/api/farms/${farmId}/task-assignments/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in_progress" }),
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onUpdated();
    } catch {
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.card, overdue && styles.cardOverdue, isDone && styles.cardDone]}>
      <TouchableOpacity
        onPress={() => setExpanded(p => !p)}
        activeOpacity={0.8}
        style={styles.cardHeader}
      >
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.statusDot, { backgroundColor: STATUS_COLOURS[item.status] ?? colors.textMuted }]} />
          <View style={styles.cardHeaderText}>
            <Text style={[styles.cardTitle, isDone && styles.cardTitleDone]} numberOfLines={2}>
              {item.title}
            </Text>
            {item.dueDate && (
              <Text style={[styles.cardDue, overdue && styles.cardDueOverdue]}>
                {overdue ? "⚠ Overdue · " : "Due "}
                {fmtDate(item.dueDate)}
              </Text>
            )}
            {item.module && (
              <Text style={styles.cardModule}>{item.module}</Text>
            )}
          </View>
        </View>
        <View style={styles.cardHeaderRight}>
          <View style={[styles.statusBadge, { borderColor: STATUS_COLOURS[item.status] ?? colors.textMuted }]}>
            <Text style={[styles.statusBadgeText, { color: STATUS_COLOURS[item.status] ?? colors.textMuted }]}>
              {STATUS_LABELS[item.status] ?? item.status}
            </Text>
          </View>
          <Feather
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.textMuted}
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.expandedContent}>
          {item.description && (
            <Text style={styles.expandedDesc}>{item.description}</Text>
          )}
          {item.assignmentNote && (
            <View style={styles.noteBox}>
              <Text style={styles.noteLabel}>Manager's note</Text>
              <Text style={styles.noteText}>{item.assignmentNote}</Text>
            </View>
          )}
          {item.completionNote && (
            <View style={[styles.noteBox, styles.completionNoteBox]}>
              <Text style={[styles.noteLabel, styles.completionNoteLabel]}>Completion note</Text>
              <Text style={[styles.noteText, styles.completionNoteText]}>{item.completionNote}</Text>
            </View>
          )}
          {item.completedAt && (
            <Text style={styles.completedAt}>Completed {fmtDate(item.completedAt)}</Text>
          )}

          {!isDone && (
            <View style={styles.actionArea}>
              <TextInput
                value={completionNote}
                onChangeText={setCompletionNote}
                placeholder="Add a completion note (optional)…"
                placeholderTextColor={colors.textMuted}
                style={styles.noteInput}
                multiline
                numberOfLines={2}
              />
              <View style={styles.actionButtons}>
                {item.status === "pending" && (
                  <TouchableOpacity
                    onPress={handleInProgress}
                    disabled={loading}
                    style={[styles.btnSecondary, loading && styles.btnDisabled]}
                  >
                    <Text style={styles.btnSecondaryText}>Mark In Progress</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleComplete}
                  disabled={loading}
                  style={[styles.btnComplete, loading && styles.btnDisabled]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Feather name="check-circle" size={15} color="#fff" />
                      <Text style={styles.btnCompleteText}>Mark Complete</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

export default function TaskInboxScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"open" | "done">("open");

  const fetchAssignments = useCallback(async () => {
    if (!currentFarm) return;
    try {
      const res = await fetch(`/api/farms/${currentFarm.id}/task-assignments`);
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.records ?? []);
      }
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentFarm]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssignments();
  };

  const open = assignments.filter(a => a.status === "pending" || a.status === "in_progress");
  const done = assignments.filter(a => a.status === "completed" || a.status === "cancelled");
  const displayed = filter === "open" ? open : done;

  if (!currentFarm) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>No farm selected. Please go back and select a farm.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tasks</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, filter === "open" && styles.tabActive]}
          onPress={() => setFilter("open")}
        >
          <Text style={[styles.tabText, filter === "open" && styles.tabTextActive]}>
            Open ({open.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filter === "done" && styles.tabActive]}
          onPress={() => setFilter("done")}
        >
          <Text style={[styles.tabText, filter === "done" && styles.tabTextActive]}>
            Completed ({done.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading tasks…</Text>
        </View>
      ) : displayed.length === 0 ? (
        <View style={styles.centered}>
          <Feather name="check-circle" size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {filter === "open" ? "No open tasks" : "No completed tasks"}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filter === "open"
              ? "Tasks assigned to you will appear here."
              : "Completed tasks will be shown here."}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {displayed.map(item => (
            <AssignmentCard
              key={item.id}
              item={item}
              farmId={currentFarm.id}
              onUpdated={fetchAssignments}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background ?? "#f9fafb" },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: colors.border ?? "#e5e7eb",
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  headerTitle: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  tabs: {
    flexDirection: "row", margin: spacing.md,
    backgroundColor: "#f3f4f6", borderRadius: 10, padding: 3,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: "center", borderRadius: 8 },
  tabActive: { backgroundColor: "#fff", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  tabText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textMuted ?? "#6b7280" },
  tabTextActive: { fontFamily: fonts.bold, color: colors.text },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.xl },
  loadingText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.sm },
  emptyTitle: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text, marginTop: spacing.md, textAlign: "center" },
  emptySubtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs, textAlign: "center" },
  errorText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.error ?? "#ef4444", textAlign: "center", margin: spacing.lg },
  list: { flex: 1 },
  card: {
    backgroundColor: "#fff", marginHorizontal: spacing.md, marginBottom: spacing.sm,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border ?? "#e5e7eb",
    overflow: "hidden",
  },
  cardOverdue: { borderColor: "#fca5a5", backgroundColor: "#fff7f7" },
  cardDone: { opacity: 0.7 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", padding: spacing.md, justifyContent: "space-between" },
  cardHeaderLeft: { flexDirection: "row", alignItems: "flex-start", flex: 1, gap: spacing.sm },
  cardHeaderRight: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginLeft: spacing.sm },
  cardHeaderText: { flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, flexShrink: 0 },
  cardTitle: { fontFamily: fonts.semiBold ?? fonts.bold, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  cardTitleDone: { textDecorationLine: "line-through", color: colors.textMuted },
  cardDue: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  cardDueOverdue: { color: "#dc2626", fontFamily: fonts.semiBold ?? fonts.bold },
  cardModule: { fontFamily: fonts.regular, fontSize: 10, color: colors.textMuted, marginTop: 2 },
  statusBadge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  statusBadgeText: { fontFamily: fonts.semiBold ?? fonts.bold, fontSize: 10 },
  expandedContent: {
    paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: 0,
    borderTopWidth: 1, borderTopColor: colors.border ?? "#e5e7eb",
  },
  expandedDesc: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary ?? "#4b5563", paddingTop: spacing.sm, lineHeight: 20 },
  noteBox: { backgroundColor: "#eef2ff", borderRadius: 8, padding: spacing.sm, marginTop: spacing.sm },
  noteLabel: { fontFamily: fonts.bold, fontSize: 11, color: "#4338ca", marginBottom: 2 },
  noteText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#4338ca", lineHeight: 18 },
  completionNoteBox: { backgroundColor: "#f0fdf4" },
  completionNoteLabel: { color: "#15803d" },
  completionNoteText: { color: "#15803d" },
  completedAt: { fontFamily: fonts.regular, fontSize: 11, color: colors.textMuted, marginTop: spacing.sm },
  actionArea: { marginTop: spacing.sm },
  noteInput: {
    borderWidth: 1, borderColor: colors.border ?? "#e5e7eb", borderRadius: 10,
    padding: spacing.sm, fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text,
    backgroundColor: "#fff", minHeight: 60, textAlignVertical: "top",
  },
  actionButtons: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  btnSecondary: {
    flex: 1, borderWidth: 1, borderColor: "#3b82f6", borderRadius: 10,
    paddingVertical: spacing.sm, alignItems: "center",
  },
  btnSecondaryText: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: "#3b82f6" },
  btnComplete: {
    flex: 2, backgroundColor: "#22c55e", borderRadius: 10,
    paddingVertical: spacing.sm, alignItems: "center", flexDirection: "row",
    justifyContent: "center", gap: 6,
  },
  btnCompleteText: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: "#fff" },
  btnDisabled: { opacity: 0.5 },
});
