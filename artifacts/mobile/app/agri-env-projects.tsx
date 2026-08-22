import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
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
import { getIncomeSummaryYears, hasCompletionDateInYear } from "@/lib/agri-env-income-summary";
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

const CURRENT_YEAR = new Date().getFullYear();

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

function schemeFilterKey(farmId: string | number): string {
  return `${STORAGE_KEYS.AGRI_ENV_SCHEME_FILTER}_${farmId}`;
}

function deadlineStatus(dateStr: string | null): "overdue" | "warning" | "ok" | "none" {
  if (!dateStr) return "none";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);
  const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / 86_400_000);
  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 30) return "warning";
  return "ok";
}

function MilestoneDeadlineSummary({
  overdueCount,
  upcomingCount,
  schemeFilter,
}: {
  overdueCount: number;
  upcomingCount: number;
  schemeFilter: string;
}) {
  if (overdueCount === 0 && upcomingCount === 0) return null;

  return (
    <View style={styles.deadlineBanner}>
      <View style={styles.deadlineBannerIcon}>
        <Feather
          name="alert-triangle"
          size={17}
          color={overdueCount > 0 ? colors.error : colors.accentDark}
        />
      </View>
      <View style={styles.deadlineBannerBody}>
        <Text style={[
          styles.deadlineBannerTitle,
          { color: overdueCount > 0 ? colors.error : colors.accentDark },
        ]}>
          Milestone deadlines
        </Text>
        <Text style={styles.deadlineBannerScope}>
          {schemeFilter ? `Showing ${schemeFilter}` : "All schemes"}
        </Text>
      </View>
      <View style={styles.deadlineBadges}>
        {overdueCount > 0 && (
          <View style={[styles.deadlineBadge, styles.deadlineBadgeOverdue]}>
            <Text style={[styles.deadlineBadgeCount, { color: colors.error }]}>{overdueCount}</Text>
            <Text style={[styles.deadlineBadgeLabel, { color: colors.error }]}>Overdue</Text>
          </View>
        )}
        {upcomingCount > 0 && (
          <View style={[styles.deadlineBadge, styles.deadlineBadgeUpcoming]}>
            <Text style={[styles.deadlineBadgeCount, { color: colors.accentDark }]}>{upcomingCount}</Text>
            <Text style={[styles.deadlineBadgeLabel, { color: colors.accentDark }]}>Due soon</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function FarmDrawdownSummary({
  projects,
  milestones,
}: {
  projects: AgriEnvProject[];
  milestones: AgriEnvMilestone[];
}) {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);

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
  const availableYears = getIncomeSummaryYears(milestones, includedIds, CURRENT_YEAR);

  const paidPence = milestones
    .filter(m => m.status === "paid" && includedIds.has(m.projectId) && hasCompletionDateInYear(m.completionDate, selectedYear))
    .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);

  const submittedPence = milestones
    .filter(m => m.status === "submitted" && includedIds.has(m.projectId) && hasCompletionDateInYear(m.completionDate, selectedYear))
    .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);

  const pct    = Math.min(100, Math.round(paidPence      / totalGrantPence * 100));
  const pctSub = Math.min(100 - pct, Math.round(submittedPence / totalGrantPence * 100));

  // Per-project breakdown — only shown when there are multiple active projects.
  const perProject = withValue.length > 1
    ? withValue.map(p => {
        const projPaid = milestones
          .filter(m => m.status === "paid" && m.projectId === p.id && hasCompletionDateInYear(m.completionDate, selectedYear))
          .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
        const projSubmitted = milestones
          .filter(m => m.status === "submitted" && m.projectId === p.id && hasCompletionDateInYear(m.completionDate, selectedYear))
          .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
        // Remaining grant value is a lifetime figure, so it stays stable when
        // the income summary is switched to a different year.
        const allTimePaid = milestones
          .filter(m => m.status === "paid" && m.projectId === p.id)
          .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
        const total = p.totalGrantValuePence ?? 0;
        const remaining = total > 0 ? total - allTimePaid : null;
        return { project: p, projPaid, projSubmitted, total, remaining };
      })
    : [];

  return (
    <View style={summaryStyles.card}>
      <View style={summaryStyles.headingRow}>
        <Text style={summaryStyles.heading}>
          Farm-wide drawdown — {withValue.length} active project{withValue.length !== 1 ? "s" : ""}
        </Text>
        <Text style={summaryStyles.yearLabel}>Income year</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={summaryStyles.yearPickerContent}
        style={summaryStyles.yearPicker}
        accessibilityLabel="Select income year"
      >
        {availableYears.map(year => {
          const active = selectedYear === year;
          return (
            <Pressable
              key={year}
              testID={`agri-env-summary-year-${year}`}
              style={[summaryStyles.yearChip, active && summaryStyles.yearChipActive]}
              onPress={() => setSelectedYear(year)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Show agri-environment income for ${year}`}
            >
              <Text style={[summaryStyles.yearChipText, active && summaryStyles.yearChipTextActive]}>
                {year}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={summaryStyles.labelsRow}>
        <Text style={summaryStyles.label}>
          {paidPence > 0
            ? `${fmt(paidPence)} of ${fmt(totalGrantPence)} claimed in ${selectedYear}`
            : `${fmt(totalGrantPence)} total — no paid claims in ${selectedYear}`}
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
          {fmt(submittedPence)} submitted in {selectedYear} (awaiting payment)
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
// Returns "YYYY-MM-DD" of today in the device's local timezone.
function todayIso(): string {
  return dateToIso(new Date());
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

/**
 * Parse a YYYY-MM-DD string as a local (device-timezone) Date so the
 * native date picker doesn't show the previous day in UTC-negative zones.
 */
function parseIsoDateLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Serialise a local Date back to YYYY-MM-DD. */
function dateToIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

/**
 * Format a YYYY-MM-DD ISO string for display using local date components,
 * so it always matches what the native picker shows (avoids UTC-offset shift).
 */
function formatLocalIsoDate(iso: string): string {
  if (!iso) return "";
  return parseIsoDateLocal(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
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
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
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

  // Tracks which farm's stored filter has been read and applied.
  // The persist effect compares this to currentFarm.id so it can only
  // write when the async read for the *current* farm has resolved —
  // preventing a farm-switch render's prior closure from writing the
  // old farm's query under the new farm's key.
  const [hydratedFarmId, setHydratedFarmId] = useState<string | number | null>(null);

  // Restore the scheme filter from storage when the farm changes.
  // Resets searchQuery and hydratedFarmId to neutral immediately so no
  // carry-over from the previous farm leaks into persistence. A
  // cancellation flag prevents a stale async read from resolving after
  // the farm has changed again.
  useEffect(() => {
    if (!currentFarm?.id) {
      setSearchQuery("");
      setHydratedFarmId(null);
      return;
    }
    const farmId = currentFarm.id;
    setSearchQuery("");
    setHydratedFarmId(null);
    let cancelled = false;
    getItem<string>(schemeFilterKey(farmId))
      .then((stored) => {
        if (cancelled) return;
        setSearchQuery(typeof stored === "string" ? stored : "");
        setHydratedFarmId(farmId);
      })
      .catch(() => {
        if (!cancelled) setHydratedFarmId(farmId);
      });
    return () => { cancelled = true; };
  }, [currentFarm?.id]);

  // Persist the scheme filter, but only once the hydration read for the
  // current farm has resolved (hydratedFarmId === currentFarm.id).
  // This ensures we never write a previous farm's filter under the new
  // farm's key, even during the render that immediately follows a farm switch.
  useEffect(() => {
    if (!currentFarm?.id || hydratedFarmId !== currentFarm.id) return;
    setItem<string>(schemeFilterKey(currentFarm.id), searchQuery).catch(() => { /* ignore */ });
  }, [searchQuery, currentFarm?.id, hydratedFarmId]);

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

  const STATUS_CHIPS: { key: string | null; label: string }[] = [
    { key: null,        label: "All" },
    { key: "active",    label: "Active" },
    { key: "pending",   label: "Pending" },
    { key: "completed", label: "Completed" },
  ];

  const filteredProjects = projects.filter(p => {
    const nameOk = !searchQuery.trim() ||
      p.schemeName.toLowerCase().includes(searchQuery.trim().toLowerCase());
    const statusOk = statusFilter === null || p.status === statusFilter;
    return nameOk && statusOk;
  });

  // The mobile scheme filter is a type-to-search field. Use the same
  // scheme-only scope for deadline counts as the dashboard: status chips
  // affect the list, but not the selected scheme's deadline summary.
  const schemeFilter = searchQuery.trim();
  const schemeProjects = schemeFilter
    ? projects.filter(p => p.schemeName.toLowerCase().includes(schemeFilter.toLowerCase()))
    : projects;
  const schemeProjectIds = new Set(schemeProjects.map(p => p.id));
  const pendingMilestones = milestones.filter(
    m => m.status !== "paid" && schemeProjectIds.has(m.projectId),
  );
  const overdueMs = pendingMilestones.filter(m => deadlineStatus(m.dueDate) === "overdue").length;
  const upcomingMs = pendingMilestones.filter(m => deadlineStatus(m.dueDate) === "warning").length;

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

    // Remaining = total grant minus all paid claims (null when no grant value set).
    const remaining: number | null = total > 0 ? total - paidPence : null;

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

        {/* Collapsed summary line — grant total + remaining badge */}
        {!isExpanded && total > 0 && (
          <View style={styles.collapsedRow}>
            <Text style={styles.collapsedSummary} numberOfLines={1}>
              {fmt(total)} total
            </Text>
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
          </View>
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

            {/* Grant value + remaining badge */}
            {total > 0 && (
              <View style={styles.grantValueRow}>
                <Text style={styles.grantValue}>{fmt(total)} total grant value</Text>
                {remaining !== null && (
                  <View style={[
                    summaryStyles.remainingPill,
                    remaining <= 0 ? summaryStyles.remainingPillFull : summaryStyles.remainingPillPartial,
                  ]}>
                    <Text style={[
                      summaryStyles.remainingPillText,
                      remaining <= 0 ? summaryStyles.remainingPillTextFull : summaryStyles.remainingPillTextPartial,
                    ]}>
                      {remaining > 0 ? `${fmt(remaining)} remaining` : "fully claimed"}
                    </Text>
                  </View>
                )}
              </View>
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

      {/* Status chip toggles */}
      {!loading && !error && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipRow}
          contentContainerStyle={styles.chipRowContent}
        >
          {STATUS_CHIPS.map(chip => {
            const active = statusFilter === chip.key;
            return (
              <Pressable
                key={chip.key ?? "__all__"}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setStatusFilter(active ? null : chip.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Filter by ${chip.label}`}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
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
                {(searchQuery.trim() || statusFilter !== null) ? "No matching projects" : "No agri-env projects"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery.trim() && statusFilter !== null
                  ? "Try a different name or status filter."
                  : searchQuery.trim()
                  ? "Try a different scheme name."
                  : statusFilter !== null
                  ? "No projects with this status."
                  : "Add projects and milestones from the dashboard Grants tab."}
              </Text>
            </View>
          }
          ListHeaderComponent={
            projects.length > 0 ? (
              <View>
                <MilestoneDeadlineSummary
                  overdueCount={overdueMs}
                  upcomingCount={upcomingMs}
                  schemeFilter={schemeFilter}
                />
                <FarmDrawdownSummary projects={projects} milestones={milestones} />
                <Text style={styles.countLabel}>
                  {(searchQuery.trim() || statusFilter !== null)
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

            {Platform.OS === "ios" ? (
              /* iOS — inline spinner; safe to keep mounted as value drives display only */
              <DateTimePicker
                value={parseIsoDateLocal(datePicker.date)}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                  if (selectedDate) {
                    setDatePicker(prev =>
                      prev ? { ...prev, date: dateToIso(selectedDate) } : prev,
                    );
                  }
                }}
                style={styles.nativeDatePicker}
              />
            ) : (
              /* Android — imperative API: never mount the component; open dialog on tap */
              <Pressable
                style={styles.androidDateRow}
                onPress={() => {
                  void DateTimePickerAndroid.open({
                    value: parseIsoDateLocal(datePicker.date),
                    mode: "date",
                    maximumDate: new Date(),
                    onChange: (_event: DateTimePickerEvent, selectedDate?: Date) => {
                      if (selectedDate) {
                        setDatePicker(prev =>
                          prev ? { ...prev, date: dateToIso(selectedDate) } : prev,
                        );
                      }
                    },
                  });
                }}
                accessibilityRole="button"
                accessibilityLabel={`Selected date: ${formatLocalIsoDate(datePicker.date)}. Tap to change.`}
              >
                <Feather name="calendar" size={18} color={colors.primary} />
                <Text style={styles.androidDateText}>
                  {formatLocalIsoDate(datePicker.date)}
                </Text>
                <Feather name="chevron-right" size={16} color={colors.textTertiary} />
              </Pressable>
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
                  const { milestoneId, projectId, newStatus, date } = datePicker;
                  setDatePicker(null);
                  void saveMilestoneStatus(milestoneId, projectId, newStatus, date);
                }}
                style={styles.sheetConfirm}
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
  deadlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.accentLight,
    borderRadius: radius.md,
  },
  deadlineBannerIcon: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  deadlineBannerBody: {
    flex: 1,
    gap: 2,
  },
  deadlineBannerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
  },
  deadlineBannerScope: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
  deadlineBadges: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  deadlineBadge: {
    minWidth: 45,
    alignItems: "center",
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  deadlineBadgeOverdue: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error + "55",
  },
  deadlineBadgeUpcoming: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warning + "55",
  },
  deadlineBadgeCount: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    lineHeight: 18,
  },
  deadlineBadgeLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 9,
  },

  // Status chip row
  chipRow: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexGrow: 0,
  },
  chipRowContent: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.textInverse ?? "#ffffff",
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
  collapsedRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 4,
    gap: 6,
    flexWrap: "wrap" as const,
  },
  collapsedSummary: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },

  // Grant value row (expanded body)
  grantValueRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 6,
    gap: 8,
    flexWrap: "wrap" as const,
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
  nativeDatePicker: {
    marginBottom: spacing.md,
    alignSelf: "stretch" as const,
  },
  androidDateRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  androidDateText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
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
  headingRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: spacing.sm,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  yearLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: colors.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.4,
  },
  yearPicker: {
    marginTop: 8,
    marginBottom: 10,
  },
  yearPickerContent: {
    flexDirection: "row" as const,
    gap: spacing.xs,
  },
  yearChip: {
    minWidth: 54,
    alignItems: "center" as const,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  yearChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  yearChipText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.textSecondary,
  },
  yearChipTextActive: {
    color: colors.textInverse,
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
