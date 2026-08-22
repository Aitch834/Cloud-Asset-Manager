import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
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
import { getItem, removeItem, setItem, STORAGE_KEYS } from "@/lib/storage";

interface AgriEnvMilestone {
  id: number;
  projectId: number;
  farmId: number;
  milestoneName: string;
  dueDate: string | null;
  completionDate: string | null;
  claimAmountPence: number | null;
  status: string;
  evidenceNotes: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface MilestoneDetailCache {
  milestones: AgriEnvMilestone[];
  cachedAt: string; // ISO timestamp
}

const MILESTONE_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "#d97706", bg: "#fef3c7" },
  submitted: { label: "Submitted", color: "#0891b2", bg: "#e0f2fe" },
  paid:      { label: "Paid",      color: "#15803d", bg: "#dcfce7" },
  overdue:   { label: "Overdue",   color: "#b91c1c", bg: "#fee2e2" },
  cancelled: { label: "Cancelled", color: "#6b7280", bg: "#f3f4f6" },
};

function fmt(pence: number): string {
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}`;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function cacheKey(farmId: string | number, projectId: string | number): string {
  return `${STORAGE_KEYS.AGRI_ENV_PROJECT_MILESTONES_CACHE}_${farmId}_${projectId}`;
}

function farmMilestonesCacheKey(farmId: string | number): string {
  return `${STORAGE_KEYS.AGRI_ENV_MILESTONES_CACHE}_${farmId}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function AgriEnvMilestoneDetailScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const params = useLocalSearchParams<{ projectId: string; milestoneId: string }>();

  const projectId = params.projectId ? parseInt(params.projectId, 10) : null;
  const milestoneId = params.milestoneId ? parseInt(params.milestoneId, 10) : null;

  const [milestone, setMilestone] = useState<AgriEnvMilestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedAt, setCachedAt] = useState<Date | null>(null);
  const cancelRef = useRef(false);
  // Persists across load() calls so a failed pull-to-refresh never replaces
  // already-visible cached content with the full-screen error state.
  // Reset whenever the farm/project/milestone identifiers change.
  const hasCachedDataRef = useRef(false);

  // Reset the cached-data ref whenever the identifiers change so a stale
  // "has cache" signal from a previous milestone never suppresses a genuine
  // error on a new one.
  useEffect(() => {
    hasCachedDataRef.current = false;
  }, [currentFarm?.id, projectId, milestoneId]);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!currentFarm?.id || !projectId || !milestoneId) {
        setLoading(false);
        return;
      }
      cancelRef.current = false;

      // ── Cache-first: show stored data immediately ──
      if (!isRefresh) {
        const cached = await getItem<MilestoneDetailCache>(
          cacheKey(currentFarm.id, projectId),
        );
        if (cached) {
          const found = cached.milestones.find(m => m.id === milestoneId) ?? null;
          if (found && !cancelRef.current) {
            setMilestone(found);
            setCachedAt(new Date(cached.cachedAt));
            setLoading(false);
            hasCachedDataRef.current = true;
            // Fall through to background refresh — no spinner.
          } else if (!cancelRef.current) {
            setLoading(true);
          }
        } else {
          setLoading(true);
        }
      } else {
        setRefreshing(true);
      }

      setError(null);

      try {
        const res = await apiFetch(
          `/api/farms/${currentFarm.id}/agri-env-projects/${projectId}/milestones`,
        );
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = (await res.json()) as { milestones: AgriEnvMilestone[] };
        const loaded = data.milestones ?? [];

        if (!cancelRef.current) {
          const found = loaded.find(m => m.id === milestoneId) ?? null;
          setMilestone(found);
          setCachedAt(null); // live data — suppress banner
          // Persist in background; ignore write failures.
          const now = new Date().toISOString();
          setItem<MilestoneDetailCache>(cacheKey(currentFarm.id, projectId), {
            milestones: loaded,
            cachedAt: now,
          }).catch(() => { /* ignore */ });
        }
        // The project list has a separate farm-wide milestones cache. The
        // detail endpoint only returns this project's milestones, so
        // invalidate the farm-wide entry rather than replacing it with a
        // partial list. The project list reloads it when it regains focus.
        removeItem(farmMilestonesCacheKey(currentFarm.id)).catch(() => { /* ignore */ });
      } catch (err) {
        if (!cancelRef.current) {
          // Only surface the full-screen error when there is no cached content
          // already visible. hasCachedDataRef persists across load() calls
          // (unlike a local variable), so a failed pull-to-refresh while the
          // advisor is already reading cached data stays silent — they can see
          // the milestone and pull again when connectivity returns.
          if (!hasCachedDataRef.current) {
            setError(err instanceof Error ? err.message : "Failed to load");
          }
        }
      } finally {
        if (!cancelRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFarm?.id, projectId, milestoneId],
  );

  useEffect(() => {
    void load();
    return () => {
      cancelRef.current = true;
    };
  }, [load]);

  const refresh = useCallback(() => { void load(true); }, [load]);

  const statusMeta =
    milestone
      ? (MILESTONE_STATUS_META[milestone.status] ?? {
          label: milestone.status,
          color: "#374151",
          bg: "#f3f4f6",
        })
      : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          Milestone Detail
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Cached-data banner */}
      {!loading && cachedAt && (
        <View style={styles.cacheBanner}>
          <Feather name="clock" size={12} color={colors.textTertiary} />
          <Text style={styles.cacheBannerText}>
            Showing data from{" "}
            {cachedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} at{" "}
            {cachedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} —
            updating…
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centre}>
          <Feather name="wifi-off" size={32} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Could not load milestone</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <Pressable onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : !milestone ? (
        <View style={styles.centre}>
          <Feather name="file-text" size={32} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Milestone not found</Text>
          <Text style={styles.emptySubtitle}>
            It may have been deleted or moved.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Name + status */}
          <View style={styles.card}>
            <View style={styles.nameRow}>
              <Text style={styles.milestoneName}>{milestone.milestoneName}</Text>
              {statusMeta && (
                <View style={[styles.statusPill, { backgroundColor: statusMeta.bg }]}>
                  <Text style={[styles.statusPillText, { color: statusMeta.color }]}>
                    {statusMeta.label}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Dates & claim */}
          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Grant Claim</Text>
            <DetailRow label="Due date" value={formatDate(milestone.dueDate)} />
            <DetailRow
              label="Completion date"
              value={formatDate(milestone.completionDate)}
            />
            <DetailRow
              label="Claim amount"
              value={
                milestone.claimAmountPence != null
                  ? fmt(milestone.claimAmountPence)
                  : "—"
              }
            />
          </View>

          {/* Evidence notes */}
          {!!milestone.evidenceNotes && (
            <View style={styles.card}>
              <Text style={styles.sectionHeading}>Evidence Notes</Text>
              <Text style={styles.evidenceText}>{milestone.evidenceNotes}</Text>
            </View>
          )}
        </ScrollView>
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
    flex: 1,
    textAlign: "center",
  },

  // States
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
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

  // Cached-data banner
  cacheBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    backgroundColor: "#fef9c3",
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
  },
  cacheBannerText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: "#92400e",
    flexShrink: 1,
  },

  // Content
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  milestoneName: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    flexShrink: 0,
  },
  statusPillText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  sectionHeading: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  detailLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: "right",
    flexShrink: 0,
    maxWidth: "55%",
  },
  evidenceText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
});
