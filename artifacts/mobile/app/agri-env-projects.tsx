import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { apiFetch } from "@/lib/apiFetch";
import { getItem, setItem, STORAGE_KEYS } from "@/lib/storage";

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
  farmId: number;
  milestoneName: string | null;
  dueDate: string | null;
  completionDate: string | null;
  claimAmountPence: number | null;
  status: string;
  evidenceNotes: string | null;
}

type MilestoneStatus = "pending" | "submitted" | "paid" | "overdue";

const MILESTONE_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "#d97706", bg: "#fef3c7" },
  submitted: { label: "Submitted", color: "#1d4ed8", bg: "#dbeafe" },
  paid:      { label: "Paid",      color: "#15803d", bg: "#dcfce7" },
  overdue:   { label: "Overdue",   color: "#b91c1c", bg: "#fee2e2" },
  cancelled: { label: "Cancelled", color: "#6b7280", bg: "#f3f4f6" },
};
const MILESTONE_STATUSES: MilestoneStatus[] = ["pending", "submitted", "paid", "overdue"];

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

function projectsCacheKey(farmId: string | number): string {
  return `${STORAGE_KEYS.AGRI_ENV_PROJECTS_CACHE}_${farmId}`;
}

function FarmDrawdownSummary({
  projects,
  milestones,
}: {
  projects: AgriEnvProject[];
  milestones: AgriEnvMilestone[];
}) {
  // Only consider active/applied/pending projects with a grant value.
  // Withdrawn and completed projects still appear in the list below but
  // should not inflate the farm-wide summary bar.
  const ACTIVE_STATUSES = new Set(["active", "applied", "pending"]);
  const withValue = projects.filter(
    p => ACTIVE_STATUSES.has(p.status) && (p.totalGrantValuePence ?? 0) > 0,
  );
  if (withValue.length === 0) return null;

  const includedIds = new Set(withValue.map(p => p.id));
  const totalGrantPence = withValue.reduce((s, p) => s + (p.totalGrantValuePence ?? 0), 0);

  const paidPence = milestones
    .filter(m => m.status === "paid" && includedIds.has(m.projectId))
    .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);

  const submittedPence = milestones
    .filter(m => m.status === "submitted" && includedIds.has(m.projectId))
    .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);

  const pct    = Math.min(100, Math.round(paidPence      / totalGrantPence * 100));
  const pctSub = Math.min(100 - pct, Math.round(submittedPence / totalGrantPence * 100));

  // Per-project breakdown — only shown when there are multiple active projects.
  const perProject = withValue.length > 1
    ? withValue.map(p => {
        const projPaid = milestones
          .filter(m => m.status === "paid" && m.projectId === p.id)
          .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
        const projSubmitted = milestones
          .filter(m => m.status === "submitted" && m.projectId === p.id)
          .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
        const total = p.totalGrantValuePence ?? 0;
        const remaining = total > 0 ? total - projPaid : null;
        return { project: p, projPaid, projSubmitted, total, remaining };
      })
    : [];

  return (
    <View style={summaryStyles.card}>
      <Text style={summaryStyles.heading}>
        Farm-wide drawdown — {withValue.length} active project{withValue.length !== 1 ? "s" : ""}
      </Text>
      <View style={summaryStyles.labelsRow}>
        <Text style={summaryStyles.label}>
          {paidPence > 0
            ? `${fmt(paidPence)} of ${fmt(totalGrantPence)} claimed`
            : `${fmt(totalGrantPence)} total — no paid claims yet`}
        </Text>
        <Text style={[summaryStyles.pct, pct >= 100 && summaryStyles.pctFull]}>
          {pct}%
        </Text>
      </View>
      <View style={summaryStyles.track}>
        <View style={[summaryStyles.fill, { width: `${pct}%` as any }]} />
        {pctSub > 0 && (
          <View style={[summaryStyles.submitted, { width: `${pctSub}%` as any }]} />
        )}
      </View>
      {pctSub > 0 && (
        <Text style={summaryStyles.submittedNote}>
          {fmt(submittedPence)} submitted (awaiting payment)
        </Text>
      )}

      {/* Per-project sub-rows — only when multiple active projects */}
      {perProject.length > 0 && (
        <View style={summaryStyles.projectsWrap}>
          {perProject.map(({ project, projPaid, projSubmitted, total, remaining }) => (
            <View key={project.id} style={summaryStyles.projectRow}>
              <View style={summaryStyles.projectRowLeft}>
                <Text style={summaryStyles.projectArrow}>↳</Text>
                <Text style={summaryStyles.projectName} numberOfLines={2}>{project.schemeName}</Text>
              </View>
              <View style={summaryStyles.projectRowRight}>
                {remaining !== null && (
                  <View style={[
                    summaryStyles.remainingPill,
                    remaining <= 0 ? summaryStyles.remainingPillFull : summaryStyles.remainingPillPartial,
                  ]}>
                    <Text style={[
                      summaryStyles.remainingPillText,
                      remaining <= 0 ? summaryStyles.remainingPillTextFull : summaryStyles.remainingPillTextPartial,
                    ]}>
                      {remaining > 0 ? `${fmt(remaining)} left` : "fully claimed"}
                    </Text>
                  </View>
                )}
                <Text style={summaryStyles.projectAmount}>
                  {projPaid > 0 ? fmt(projPaid) : projSubmitted > 0 ? `${fmt(projSubmitted)} sub.` : "—"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
// Returns "YYYY-MM-DD" of today.
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Default completion date for the prompt when a milestone is marked
 * submitted/paid. Matches the dashboard logic in BusinessReportsPage.tsx:
 *   ms.dueDate && ms.dueDate.slice(0,10) <= todayIso ? ms.dueDate.slice(0,10) : todayIso
 *
 * A completion date must be ≤ today (you cannot complete something in the
 * future), so a future due date falls back to today, the same as the
 * dashboard's max={todayIso} constraint.
 */
function defaultCompletionDate(dueDate: string | null | undefined): string {
  const today = todayIso();
  if (dueDate && dueDate.slice(0, 10) <= today) return dueDate.slice(0, 10);
  return today;
}

function needsCompletionDate(status: string): boolean {
  return status === "submitted" || status === "paid";
}

/** Returns true if the string is a real calendar date in YYYY-MM-DD format. */
function isValidDateString(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s);
  // new Date("2024-02-30") creates a Date but shifts the day — check round-trip
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

interface MilestonePickerState {
  milestoneId: number;
  projectId: number;
  currentStatus: string;
}

interface MilestoneDateState {
  milestoneId: number;
  projectId: number;
  newStatus: string;
  date: string; // YYYY-MM-DD
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
  const [searchQuery, setSearchQuery] = useState("");
  const [cachedAt,    setCachedAt]    = useState<Date | null>(null);
  const cancelRef = useRef(false);

  // Milestone status-change flow
  const [statusPicker,     setStatusPicker]     = useState<MilestonePickerState | null>(null);
  const [datePicker,       setDatePicker]       = useState<MilestoneDateState | null>(null);
  const [savingMilestone,  setSavingMilestone]  = useState<number | null>(null);

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

  // Restore the expanded project ID from storage, validating against a project list.
  const restoreExpanded = useCallback(
    async (loadedProjects: AgriEnvProject[]) => {
      if (!currentFarm?.id) return;
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
    },
    [currentFarm?.id],
  );

  // Persist fresh data to the local cache.
  const persistCache = useCallback(
    async (loadedProjects: AgriEnvProject[], loadedMilestones: AgriEnvMilestone[]) => {
      if (!currentFarm?.id) return;
      const now = new Date().toISOString();
      await Promise.all([
        setItem<AgriEnvCache<AgriEnvProject>>(projectsCacheKey(currentFarm.id), {
          data: loadedProjects,
          cachedAt: now,
        }),
        setItem<AgriEnvCache<AgriEnvMilestone>>(milestonesCacheKey(currentFarm.id), {
          data: loadedMilestones,
          cachedAt: now,
        }),
      ]);
    },
    [currentFarm?.id],
  );

  const load = useCallback(async (isRefresh = false) => {
    if (!currentFarm?.id) { setLoading(false); return; }
    cancelRef.current = false;

    // --- Cache-first: read stored data and show it immediately ---
    if (!isRefresh) {
      const [projCache, milCache] = await Promise.all([
        getItem<AgriEnvCache<AgriEnvProject>>(projectsCacheKey(currentFarm.id)),
        getItem<AgriEnvCache<AgriEnvMilestone>>(milestonesCacheKey(currentFarm.id)),
      ]);
      const cacheValid =
        projCache &&
        milCache &&
        !isCacheStale(projCache.cachedAt) &&
        !isCacheStale(milCache.cachedAt) &&
        !cancelRef.current;
      if (cacheValid) {
        setProjects(projCache.data);
        setMilestones(milCache.data);
        setCachedAt(new Date(projCache.cachedAt));
        await restoreExpanded(projCache.data);
        setLoading(false);
        // Fall through to background refresh (no spinner, just silent update).
      } else {
        setLoading(true);
      }
    } else {
      setRefreshing(true);
    }

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
        const loadedProjects   = projData.projects   ?? [];
        const loadedMilestones = milData.milestones  ?? [];
        setProjects(loadedProjects);
        setMilestones(loadedMilestones);
        setCachedAt(null); // now showing live data — suppress the banner
        await restoreExpanded(loadedProjects);
        // Persist in the background; ignore write failures.
        persistCache(loadedProjects, loadedMilestones).catch(() => { /* ignore */ });
      }
    } catch (err) {
      if (!cancelRef.current) {
        // Only show the error state when we have no cached data to fall back on.
        setProjects((prev) => {
          if (prev.length === 0) {
            setError(err instanceof Error ? err.message : "Failed to load");
          }
          return prev;
        });
      }
    } finally {
      if (!cancelRef.current) { setLoading(false); setRefreshing(false); }
    }
  }, [currentFarm?.id, restoreExpanded, persistCache]);

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

  // Save a milestone status (and optional completion date) to the server.
  const saveMilestoneStatus = useCallback(async (
    milestoneId: number,
    projectId: number,
    newStatus: string,
    completionDate?: string,
  ) => {
    if (!currentFarm?.id) return;
    setSavingMilestone(milestoneId);
    try {
      const body: Record<string, unknown> = { status: newStatus };
      if (completionDate) {
        body.completionDate = completionDate;
      } else if (newStatus === "pending" || newStatus === "overdue") {
        // Clear the completion date when reverting away from submitted/paid.
        body.completionDate = null;
      }
      const res = await apiFetch(
        `/api/farms/${currentFarm.id}/agri-env-projects/${projectId}/milestones/${milestoneId}`,
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
      );
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json() as { milestone: AgriEnvMilestone };
      // Update local milestones state so UI reflects the change immediately,
      // and write the updated list back to the offline cache so a force-quit
      // before the next background refresh doesn't revert the new status.
      setMilestones(prev => {
        const updated = prev.map(m => m.id === milestoneId ? { ...m, ...data.milestone } : m);
        const now = new Date().toISOString();
        setItem<AgriEnvCache<AgriEnvMilestone>>(milestonesCacheKey(currentFarm!.id), {
          data: updated,
          cachedAt: now,
        }).catch(() => { /* ignore write failures */ });
        return updated;
      });
    } catch {
      Alert.alert("Error", "Could not update milestone status. Please try again.");
    } finally {
      setSavingMilestone(null);
    }
  }, [currentFarm?.id]);

  // Called when user picks a new status from the status sheet.
  const handleStatusPick = useCallback((newStatus: string) => {
    if (!statusPicker) return;
    const { milestoneId, projectId } = statusPicker;
    setStatusPicker(null);
    const ms = milestones.find(m => m.id === milestoneId);
    if (needsCompletionDate(newStatus) && !ms?.completionDate) {
      // Prompt for a completion date, defaulting to dueDate if past.
      setDatePicker({
        milestoneId,
        projectId,
        newStatus,
        date: defaultCompletionDate(ms?.dueDate),
      });
    } else {
      void saveMilestoneStatus(milestoneId, projectId, newStatus);
    }
  }, [statusPicker, milestones, saveMilestoneStatus]);

  const filteredProjects = searchQuery.trim()
    ? projects.filter(p =>
        p.schemeName.toLowerCase().includes(searchQuery.trim().toLowerCase())
      )
    : projects;

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

            {/* Individual milestone rows — tap body to open detail, tap pill to change status */}
            {projMilestones.length > 0 && (
              <View style={styles.milestonesWrap}>
                <Text style={styles.milestonesHeading}>Milestones</Text>
                {projMilestones.map((ms, idx) => {
                  const msMeta = MILESTONE_STATUS_META[ms.status as MilestoneStatus]
                    ?? { label: ms.status, color: "#374151", bg: "#f3f4f6" };
                  const isSaving = savingMilestone === ms.id;
                  return (
                    <View
                      key={ms.id}
                      style={[
                        styles.milestoneRow,
                        idx < projMilestones.length - 1 && styles.milestoneRowBorder,
                      ]}
                    >
                      {/* Tap main body → detail screen */}
                      <Pressable
                        style={styles.milestoneMain}
                        onPress={() =>
                          router.push({
                            pathname: "/agri-env-milestone-detail" as any,
                            params: {
                              projectId: String(project.id),
                              milestoneId: String(ms.id),
                            },
                          })
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`${ms.milestoneName ?? "Milestone"}, ${msMeta.label}. Open milestone detail.`}
                      >
                        <Text style={styles.milestoneName} numberOfLines={2}>
                          {ms.milestoneName ?? "Milestone"}
                        </Text>
                        {!!ms.dueDate && (
                          <Text style={styles.milestoneMeta}>
                            Due {formatDate(ms.dueDate)}
                          </Text>
                        )}
                        {!!ms.completionDate && (
                          <Text style={styles.milestoneMeta}>
                            Completed {formatDate(ms.completionDate)}
                          </Text>
                        )}
                        {ms.claimAmountPence != null && (
                          <Text style={styles.milestoneAmount}>
                            {fmt(ms.claimAmountPence)}
                          </Text>
                        )}
                      </Pressable>
                      {/* Tap pill → quick status change */}
                      <Pressable
                        onPress={() => {
                          if (isSaving) return;
                          setStatusPicker({ milestoneId: ms.id, projectId: project.id, currentStatus: ms.status });
                        }}
                        style={[styles.milestoneStatusPill, { backgroundColor: msMeta.bg }, isSaving && { opacity: 0.5 }]}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={`Milestone status: ${msMeta.label}. Tap to change.`}
                      >
                        {isSaving
                          ? <ActivityIndicator size="small" color={msMeta.color} style={{ width: 16, height: 16 }} />
                          : <Text style={[styles.milestoneStatusText, { color: msMeta.color }]}>{msMeta.label}</Text>
                        }
                        {!isSaving && (
                          <Feather name="chevron-down" size={11} color={msMeta.color} />
                        )}
                      </Pressable>
                    </View>
                  );
                })}
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

      {/* Cached-data banner */}
      {!loading && cachedAt && (
        <View style={styles.cacheBanner}>
          <Feather name="clock" size={12} color={colors.textTertiary} />
          <Text style={styles.cacheBannerText}>
            Showing data from {cachedAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}{" "}
            at {cachedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} — updating…
          </Text>
        </View>
      )}

      {/* Search bar */}
      {!loading && !error && (
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Filter by scheme name…"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8} style={styles.searchClear}>
              <Feather name="x" size={15} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      )}

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
          data={filteredProjects}
          keyExtractor={item => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
          }
          contentContainerStyle={filteredProjects.length === 0 ? styles.centre : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Feather name="file-text" size={36} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>
                {searchQuery.trim() ? "No matching projects" : "No agri-env projects"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery.trim()
                  ? "Try a different scheme name."
                  : "Add projects and milestones from the dashboard Grants tab."}
              </Text>
            </View>
          }
          ListHeaderComponent={
            projects.length > 0 ? (
              <View>
                <FarmDrawdownSummary projects={projects} milestones={milestones} />
                <Text style={styles.countLabel}>
                  {searchQuery.trim()
                    ? `${filteredProjects.length} of ${projects.length} project${projects.length !== 1 ? "s" : ""} — tap to expand`
                    : `${projects.length} project${projects.length !== 1 ? "s" : ""} — tap to expand`}
                </Text>
              </View>
            ) : null
          }
          renderItem={renderItem}
        />
      )}

      {/* ── Milestone status picker sheet ── */}
      {!!statusPicker && (
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Change Status</Text>
              <Pressable onPress={() => setStatusPicker(null)} hitSlop={8}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {MILESTONE_STATUSES.map(s => {
                const meta = MILESTONE_STATUS_META[s];
                const isCurrent = statusPicker.currentStatus === s;
                return (
                  <Pressable
                    key={s}
                    onPress={() => handleStatusPick(s)}
                    style={[styles.sheetItem, isCurrent && { backgroundColor: meta.bg }]}
                  >
                    <View style={[styles.sheetItemDot, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.sheetItemDotText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                    {isCurrent && <Feather name="check" size={16} color={meta.color} />}
                  </Pressable>
                );
              })}
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      )}

      {/* ── Completion date entry sheet ── */}
      {!!datePicker && (
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Completion Date</Text>
              <Pressable onPress={() => setDatePicker(null)} hitSlop={8}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <Text style={styles.sheetSubtitle}>
              When was this milestone {datePicker.newStatus === "paid" ? "paid" : "submitted"}?
            </Text>
            <TextInput
              style={styles.dateInput}
              value={datePicker.date}
              onChangeText={v => setDatePicker(prev => prev ? { ...prev, date: v } : prev)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numbers-and-punctuation"
              autoFocus
              maxLength={10}
            />
            {!!datePicker.date && !isValidDateString(datePicker.date) && (
              <Text style={styles.dateError}>Enter a valid date (YYYY-MM-DD)</Text>
            )}
            <View style={styles.sheetActions}>
              <Pressable
                onPress={() => setDatePicker(null)}
                style={styles.sheetCancel}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!datePicker.date) return;
                  if (!isValidDateString(datePicker.date)) {
                    Alert.alert("Invalid date", "Please enter a valid date in YYYY-MM-DD format.");
                    return;
                  }
                  const { milestoneId, projectId, newStatus, date } = datePicker;
                  setDatePicker(null);
                  void saveMilestoneStatus(milestoneId, projectId, newStatus, date);
                }}
                style={[
                  styles.sheetConfirm,
                  (!datePicker.date || !isValidDateString(datePicker.date)) && { opacity: 0.4 },
                ]}
                disabled={!datePicker.date || !isValidDateString(datePicker.date)}
              >
                <Text style={styles.sheetConfirmText}>Save</Text>
              </Pressable>
            </View>
            <View style={{ height: insets.bottom + spacing.md }} />
          </View>
        </View>
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

  // Search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    paddingVertical: 6,
  },
  searchClear: {
    padding: 4,
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

  // Milestone rows
  milestonesWrap: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  milestonesHeading: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  milestoneRow: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 8,
    gap: spacing.sm,
  },
  milestoneRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight ?? colors.border,
  },
  milestoneMain: {
    flex: 1,
    flexShrink: 1,
  },
  milestoneName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  milestoneMeta: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 2,
  },
  milestoneAmount: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: "#059669",
    marginTop: 2,
  },
  milestoneStatusPill: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    flexShrink: 0,
    marginTop: 2,
  },
  milestoneStatusText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },

  // Overlay sheets (status picker + date entry)
  overlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end" as const,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    maxHeight: "75%",
  },
  sheetHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  sheetSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sheetItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: 2,
  },
  sheetItemDot: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  sheetItemDotText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
  },
  dateInput: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  dateError: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs ?? 11,
    color: "#b91c1c",
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  sheetActions: {
    flexDirection: "row" as const,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sheetCancel: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: "#f3f4f6",
    alignItems: "center" as const,
  },
  sheetCancelText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sheetConfirm: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center" as const,
  },
  sheetConfirmText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#ffffff",
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

const summaryStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: 8,
  },
  labelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    flexShrink: 1,
  },
  pct: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.text,
    marginLeft: spacing.xs,
  },
  pctFull: {
    color: "#059669",
  },
  track: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
    flexDirection: "row",
  },
  fill: {
    height: "100%",
    backgroundColor: "#059669",
  },
  submitted: {
    height: "100%",
    backgroundColor: "#93c5fd",
  },
  submittedNote: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 3,
  },
  projectsWrap: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    gap: 6,
  },
  projectRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  projectRowLeft: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    flex: 1,
    flexShrink: 1,
    marginRight: 8,
  },
  projectArrow: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textTertiary,
    marginRight: 4,
    lineHeight: 16,
  },
  projectName: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    flexShrink: 1,
    lineHeight: 16,
  },
  projectRowRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  projectAmount: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: "#15803d",
    textAlign: "right" as const,
  },
  remainingPill: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
  },
  remainingPillPartial: {
    backgroundColor: "#fffbeb",
    borderColor: "#fcd34d",
  },
  remainingPillFull: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  remainingPillText: {
    fontSize: 10,
    fontFamily: fonts.regular,
  },
  remainingPillTextPartial: {
    color: "#92400e",
  },
  remainingPillTextFull: {
    color: "#166534",
  },
});

interface AgriEnvCache<T> {
  data: T[];
  cachedAt: string; // ISO timestamp
}

function milestonesCacheKey(farmId: string | number): string {
  return `${STORAGE_KEYS.AGRI_ENV_MILESTONES_CACHE}_${farmId}`;
}

/** Cache entries older than this are discarded and a fresh fetch is made. */
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Returns true when the cache entry should be discarded:
 * - timestamp is missing, unparseable, or in the future (clock skew / corruption)
 * - entry is older than CACHE_TTL_MS
 */
function isCacheStale(cachedAt: string | undefined | null): boolean {
  if (!cachedAt) return true;
  const ts = new Date(cachedAt).getTime();
  if (Number.isNaN(ts)) return true;      // unparseable timestamp
  const age = Date.now() - ts;
  if (age < 0) return true;               // future timestamp — treat as corrupt
  return age > CACHE_TTL_MS;
}
