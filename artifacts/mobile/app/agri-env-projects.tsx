import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { apiFetch } from "@/lib/apiFetch";
import { getItem, setItem } from "@/lib/storage";

interface AgriEnvProject {
  id: number;
  schemeName: string;
  administeringBody: string | null;
  agreementReference: string | null;
  startDate: string | null;
  endDate: string | null;
  totalGrantValuePence: number | null;
  status: string;
}

interface AgriEnvMilestone {
  id: number;
  projectId: number;
  claimAmountPence: number | null;
  status: string;
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: "Active",    color: "#15803d", bg: "#dcfce7" },
  completed: { label: "Completed", color: "#1d4ed8", bg: "#dbeafe" },
  withdrawn: { label: "Withdrawn", color: "#b91c1c", bg: "#fee2e2" },
  pending:   { label: "Pending",   color: "#d97706", bg: "#fef3c7" },
  applied:   { label: "Applied",   color: "#0891b2", bg: "#e0f2fe" },
  suspended: { label: "Suspended", color: "#9333ea", bg: "#f3e8ff" },
};

function fmt(pence: number): string {
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}`;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function expandedKey(farmId: string | number): string {
  return `bde_agri_env_expanded_${farmId}`;
}

export default function AgriEnvProjectsScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();

  const [projects,    setProjects]    = useState<AgriEnvProject[]>([]);
  const [milestones,  setMilestones]  = useState<AgriEnvMilestone[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [expandedId,  setExpandedId]  = useState<number | null>(null);
  const cancelRef = useRef(false);

  // Persist / restore the expanded project ID per farm.
  const persistExpanded = useCallback(
    (id: number | null) => {
      if (!currentFarm?.id) return;
      setItem(expandedKey(currentFarm.id), id).catch(() => {
        /* ignore write failures */
      });
    },
    [currentFarm?.id],
  );

  const load = useCallback(async (isRefresh = false) => {
    if (!currentFarm?.id) { setLoading(false); return; }
    cancelRef.current = false;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const [projRes, milRes] = await Promise.all([
        apiFetch(`/api/farms/${currentFarm.id}/agri-env-projects`),
        apiFetch(`/api/farms/${currentFarm.id}/agri-env-milestones`),
      ]);
      if (!projRes.ok) throw new Error(`Server error ${projRes.status}`);
      if (!milRes.ok)  throw new Error(`Server error ${milRes.status}`);
      const projData = await projRes.json() as { projects: AgriEnvProject[] };
      const milData  = await milRes.json()  as { milestones: AgriEnvMilestone[] };
      if (!cancelRef.current) {
        const loadedProjects = projData.projects ?? [];
        setProjects(loadedProjects);
        setMilestones(milData.milestones ?? []);

        // Restore the last-expanded project for this farm, but only if it
        // still exists in the freshly loaded list.
        const stored = await getItem<number | null>(expandedKey(currentFarm.id));
        if (
          stored !== null &&
          typeof stored === "number" &&
          loadedProjects.some((p) => p.id === stored)
        ) {
          setExpandedId(stored);
        } else {
          // Project was deleted or no stored value — start fully collapsed.
          setExpandedId(null);
        }
      }
    } catch (err) {
      if (!cancelRef.current) setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      if (!cancelRef.current) { setLoading(false); setRefreshing(false); }
    }
  }, [currentFarm?.id]);

  useEffect(() => {
    void load();
    return () => { cancelRef.current = true; };
  }, [load]);

  const refresh = useCallback(() => { void load(true); }, [load]);

  const toggleExpanded = useCallback(
    (id: number) => {
      setExpandedId((prev) => {
        const next = prev === id ? null : id;
        persistExpanded(next);
        return next;
      });
    },
    [persistExpanded],
  );

  const renderItem = ({ item: project }: { item: AgriEnvProject }) => {
    const isExpanded = expandedId === project.id;
    const total = project.totalGrantValuePence ?? 0;
    const projMilestones = milestones.filter(m => m.projectId === project.id);

    const paidPence = projMilestones
      .filter(m => m.status === "paid")
      .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
    const submittedPence = projMilestones
      .filter(m => m.status === "submitted")
      .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);

    const pct    = total > 0 ? Math.min(100, Math.round(paidPence      / total * 100)) : 0;
    const pctSub = total > 0 ? Math.min(100 - pct, Math.round(submittedPence / total * 100)) : 0;

    const statusMeta = STATUS_META[project.status] ?? { label: project.status, color: "#374151", bg: "#f3f4f6" };

    const dateRange = [formatDate(project.startDate), formatDate(project.endDate)].filter(Boolean).join(" – ");

    return (
      <Pressable
        style={[styles.card, isExpanded && styles.cardExpanded]}
        onPress={() => { toggleExpanded(project.id); }}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`${project.schemeName}, ${statusMeta.label}. ${isExpanded ? "Collapse" : "Expand"} details.`}
      >
        {/* Card header — always visible */}
        <View style={styles.cardHeaderRow}>
          <Text style={styles.schemeName} numberOfLines={isExpanded ? undefined : 2}>
            {project.schemeName}
          </Text>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
              <Text style={[styles.statusPillText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
            </View>
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.textTertiary}
            />
          </View>
        </View>

        {/* Collapsed summary line */}
        {!isExpanded && total > 0 && (
          <Text style={styles.collapsedSummary} numberOfLines={1}>
            {fmt(total)} — {pct}% drawn
          </Text>
        )}

        {/* Expanded body */}
        {isExpanded && (
          <View style={styles.expandedBody}>
            {!!project.administeringBody && (
              <Text style={styles.metaLine}>{project.administeringBody}</Text>
            )}
            {!!project.agreementReference && (
              <Text style={styles.metaLine}>Ref: {project.agreementReference}</Text>
            )}
            {!!dateRange && (
              <Text style={styles.metaLine}>{dateRange}</Text>
            )}

            {/* Grant value */}
            {total > 0 && (
              <Text style={styles.grantValue}>{fmt(total)} total grant value</Text>
            )}

            {/* Drawdown progress bar — shown whenever totalGrantValuePence > 0 */}
            {total > 0 && (
              <View style={styles.progressWrap}>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabel}>
                    {paidPence > 0
                      ? `${fmt(paidPence)} of ${fmt(total)} claimed`
                      : `${fmt(total)} total — no paid claims yet`}
                  </Text>
                  <Text style={[styles.progressPct, pct >= 100 && styles.progressPctFull]}>
                    {pct}% drawn
                  </Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` as any }]} />
                  {pctSub > 0 && (
                    <View style={[styles.progressSubmitted, { width: `${pctSub}%` as any }]} />
                  )}
                </View>
                {pctSub > 0 && (
                  <Text style={styles.submittedNote}>
                    {fmt(submittedPence)} submitted (awaiting payment)
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Agri-Environment Grants</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centre}>
          <Feather name="wifi-off" size={32} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Could not load projects</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <Pressable onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={item => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
          }
          contentContainerStyle={projects.length === 0 ? styles.centre : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Feather name="file-text" size={36} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No agri-env projects</Text>
              <Text style={styles.emptySubtitle}>
                Add projects and milestones from the dashboard Grants tab.
              </Text>
            </View>
          }
          ListHeaderComponent={
            projects.length > 0 ? (
              <Text style={styles.countLabel}>
                {projects.length} project{projects.length !== 1 ? "s" : ""} — tap to expand
              </Text>
            ) : null
          }
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },

  // States
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyWrap: {
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.xxl ?? 48,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    textAlign: "center",
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  retryText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textInverse,
  },

  // List
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  countLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardExpanded: {
    borderColor: colors.primary,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
  },
  schemeName: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 99,
  },
  statusPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  collapsedSummary: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 4,
  },

  // Expanded body
  expandedBody: {
    marginTop: spacing.sm,
  },
  metaLine: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  grantValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#059669",
    marginTop: 6,
  },

  // Progress bar
  progressWrap: {
    marginTop: 10,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  progressLabel: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    flexShrink: 1,
  },
  progressPct: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  progressPctFull: {
    color: "#059669",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    flexDirection: "row",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#059669",
  },
  progressSubmitted: {
    height: "100%",
    backgroundColor: "#93c5fd",
  },
  submittedNote: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 3,
  },
});
