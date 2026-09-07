import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import {
  canApplyMilestoneLoad,
  confirmMilestoneSave,
  persistMilestoneCacheUpdate,
} from "@/lib/agriEnvMilestoneCache";
import { getItem, removeItem, setItem, STORAGE_KEYS } from "@/lib/storage";
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

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

interface MilestoneListCache {
  data: AgriEnvMilestone[];
  cachedAt: string;
}

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

interface AgriEnvProjectsCache {
  data: AgriEnvProject[];
  cachedAt: string;
}

const MILESTONE_STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pending",   color: "#d97706", bg: "#fef3c7" },
  submitted: { label: "Submitted", color: "#0891b2", bg: "#e0f2fe" },
  paid:      { label: "Paid",      color: "#15803d", bg: "#dcfce7" },
  overdue:   { label: "Overdue",   color: "#b91c1c", bg: "#fee2e2" },
  cancelled: { label: "Cancelled", color: "#6b7280", bg: "#f3f4f6" },
};

const MILESTONE_STATUSES = ["pending", "submitted", "paid", "overdue", "cancelled"] as const;
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

function allMilestonesCacheKey(farmId: string | number): string {
  return `${STORAGE_KEYS.AGRI_ENV_MILESTONES_CACHE}_${farmId}`;
}

function farmMilestonesCacheKey(farmId: string | number): string {
  return `${STORAGE_KEYS.AGRI_ENV_MILESTONES_CACHE}_${farmId}`;
}

function projectListCacheKey(farmId: string | number): string {
  return `${STORAGE_KEYS.AGRI_ENV_PROJECTS_CACHE}_${farmId}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function ProjectSummaryCard({
  project,
  projectMilestones,
}: {
  project: AgriEnvProject | null;
  projectMilestones: AgriEnvMilestone[];
}) {
  if (!project || (project.totalGrantValuePence ?? 0) <= 0) return null;

  const total = project.totalGrantValuePence ?? 0;
  // All-time paid/submitted across all milestones for this project.
  // projectMilestones holds the full list fetched by the detail endpoint,
  // so these totals are accurate even when there are sibling milestones.
  const allTimePaid = projectMilestones
    .filter(m => m.status === "paid")
    .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
  const allTimeSubmitted = projectMilestones
    .filter(m => m.status === "submitted")
    .reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
  const remaining = total - allTimePaid;
  const isFullyClaimed = remaining <= 0;

  return (
    <View style={styles.projectSummaryCard}>
      <Text style={styles.projectSummaryScheme} numberOfLines={2}>
        {project.schemeName}
      </Text>
      <View style={styles.projectSummaryRow}>
        <Text style={styles.projectSummaryTotal}>
          {fmt(total)} total grant value
        </Text>
        <View style={[
          styles.remainingPill,
          isFullyClaimed ? styles.remainingPillFull : styles.remainingPillPartial,
        ]}>
          <Text style={[
            styles.remainingPillText,
            isFullyClaimed ? styles.remainingPillTextFull : styles.remainingPillTextPartial,
          ]}>
            {isFullyClaimed ? "fully claimed" : `${fmt(remaining)} left`}
          </Text>
        </View>
      </View>
      {allTimePaid > 0 && (
        <Text style={styles.projectSummaryMeta}>
          {fmt(allTimePaid)} claimed so far
          {allTimeSubmitted > 0 ? ` · ${fmt(allTimeSubmitted)} submitted` : ""}
        </Text>
      )}
      {allTimePaid === 0 && allTimeSubmitted > 0 && (
        <Text style={styles.projectSummaryMeta}>
          {fmt(allTimeSubmitted)} submitted (awaiting payment)
        </Text>
      )}
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
  // All milestones for this project — needed to compute the true all-time
  // claimed/submitted totals shown in the project summary row.
  const [projectMilestones, setProjectMilestones] = useState<AgriEnvMilestone[]>([]);
  const [project, setProject] = useState<AgriEnvProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cachedAt, setCachedAt] = useState<Date | null>(null);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState<MilestoneEditDraft>({
    status: "pending",
    completionDate: "",
    claimAmount: "",
    evidenceNotes: "",
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [offlineCacheWarning, setOfflineCacheWarning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCompletionDatePicker, setShowCompletionDatePicker] = useState(false);
  const cancelRef = useRef(false);
  // Persists across load() calls so a failed pull-to-refresh never replaces
  // already-visible cached content with the full-screen error state.
  // Reset whenever the farm/project/milestone identifiers change.
  const hasCachedDataRef = useRef(false);
  // Prevent a detail refresh that started before a save from invalidating the
  // farm-wide cache after the save has written its confirmed milestone.
  const cacheMutationVersionRef = useRef(0);

  // Reset the cached-data ref whenever the identifiers change so a stale
  // "has cache" signal from a previous milestone never suppresses a genuine
  // error on a new one.
  useEffect(() => {
    hasCachedDataRef.current = false;
  }, [currentFarm?.id, projectId, milestoneId]);

  const load = useCallback(
    async (isRefresh = false, signal?: AbortSignal) => {
      if (!currentFarm?.id || !projectId || !milestoneId) {
        setLoading(false);
        return;
      }
      cancelRef.current = false;

      // ── Cache-first: show stored data immediately ──
      if (!isRefresh) {
        const [cached, projectsCache] = await Promise.all([
          getItem<MilestoneDetailCache>(cacheKey(currentFarm.id, projectId)),
          getItem<AgriEnvProjectsCache>(projectListCacheKey(currentFarm.id)),
        ]);
        if (projectsCache && !cancelRef.current) {
          const foundProject = projectsCache.data.find(p => p.id === projectId) ?? null;
          setProject(foundProject);
        }
        if (cached) {
          const found = cached.milestones.find(m => m.id === milestoneId) ?? null;
          if (found && !cancelRef.current) {
            setMilestone(found);
            setProjectMilestones(cached.milestones);
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

      const cacheVersionAtRequest = cacheMutationVersionRef.current;
      try {
        const [res, projectsRes] = await Promise.all([
          apiFetch(`/api/farms/${currentFarm.id}/agri-env-projects/${projectId}/milestones`, { signal }),
          apiFetch(`/api/farms/${currentFarm.id}/agri-env-projects`, { signal }),
        ]);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = (await res.json()) as { milestones: AgriEnvMilestone[] };
        const loaded = data.milestones ?? [];

        // Update project from the fresh projects response (best-effort).
        if (projectsRes.ok && !cancelRef.current) {
          const projectsData = (await projectsRes.json()) as { projects: AgriEnvProject[] };
          const loadedProjects = projectsData.projects ?? [];
          const foundProject = loadedProjects.find(p => p.id === projectId) ?? null;
          setProject(foundProject);
          // Persist project list for subsequent visits (shares key with the
          // projects screen so both screens warm each other's cache).
          const now = new Date().toISOString();
          setItem<AgriEnvProjectsCache>(projectListCacheKey(currentFarm.id), {
            data: loadedProjects,
            cachedAt: now,
          }).catch(() => { /* ignore */ });
        }

        if (
          !signal?.aborted &&
          !cancelRef.current &&
          canApplyMilestoneLoad(
            cacheVersionAtRequest,
            cacheMutationVersionRef.current,
          )
        ) {
          const found = loaded.find(m => m.id === milestoneId) ?? null;
          setMilestone(found);
          setProjectMilestones(loaded);
          setCachedAt(null); // live data — suppress banner
          // Persist in background; ignore write failures.
          const now = new Date().toISOString();
          setItem<MilestoneDetailCache>(cacheKey(currentFarm.id, projectId), {
            milestones: loaded,
            cachedAt: now,
          }).catch(() => { /* ignore */ });
          // The project list has a separate farm-wide milestones cache. The
          // detail endpoint only returns this project's milestones, so
          // invalidate the farm-wide entry rather than replacing it with a
          // partial list. The project list reloads it when it regains focus.
          removeItem(farmMilestonesCacheKey(currentFarm.id)).catch(() => { /* ignore */ });
        }
      } catch (err) {
        if (
          !signal?.aborted &&
          !cancelRef.current &&
          canApplyMilestoneLoad(
            cacheVersionAtRequest,
            cacheMutationVersionRef.current,
          )
        ) {
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
        if (!signal?.aborted && !cancelRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentFarm?.id, projectId, milestoneId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(false, controller.signal);
    return () => {
      cancelRef.current = true;
      controller.abort();
    };
  }, [load]);

  const refresh = useCallback(() => { void load(true); }, [load]);

  const startEditing = useCallback(() => {
    if (!milestone) return;
    setEditDraft({
      status: milestone.status,
      completionDate: milestone.completionDate ?? "",
      claimAmount:
        milestone.claimAmountPence != null
          ? (milestone.claimAmountPence / 100).toFixed(2)
          : "",
      evidenceNotes: milestone.evidenceNotes ?? "",
    });
    setEditError(null);
    setEditing(true);
  }, [milestone]);

  const updateMilestoneCache = useCallback(async (updated: AgriEnvMilestone) => {
    if (!currentFarm?.id || !projectId) return;
    const now = new Date().toISOString();
    const mutationVersionAtSave = cacheMutationVersionRef.current;
    const [projectCache, allCache] = await Promise.all([
      getItem<MilestoneDetailCache>(cacheKey(currentFarm.id, projectId)),
      getItem<MilestoneListCache>(allMilestonesCacheKey(currentFarm.id)),
    ]);
    const projectMilestones = projectCache?.milestones ?? [];
    const { hydration } = await persistMilestoneCacheUpdate({
      updated,
      projectMilestones,
      allMilestones: allCache?.data ?? null,
      persistProjectMilestones: (milestones) =>
        setItem<MilestoneDetailCache>(cacheKey(currentFarm.id, projectId), {
          milestones,
          cachedAt: now,
        }),
      persistAllMilestones: (milestones) =>
        setItem<MilestoneListCache>(allMilestonesCacheKey(currentFarm.id), {
          data: milestones,
          cachedAt: now,
        }),
      hydrateAllMilestones: allCache
        ? undefined
        : async () => {
            const res = await apiFetch(
              `/api/farms/${currentFarm.id}/agri-env-milestones`,
            );
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = (await res.json()) as { milestones: AgriEnvMilestone[] };
            return data.milestones ?? [];
          },
      canApplyHydration: () =>
        !cancelRef.current &&
        cacheMutationVersionRef.current === mutationVersionAtSave,
    });
    // Hydration deliberately continues without holding the editor open. The
    // confirmed project and farm-list fallback caches are already durable.
    void hydration;
  }, [currentFarm?.id, projectId]);

  const saveEdits = useCallback(async () => {
    if (!milestone || !currentFarm?.id || !projectId) return;

    const completionDate = editDraft.completionDate.trim();
    if (editDraft.status === "paid" && !completionDate) {
      setEditError("A paid milestone must have a completion date.");
      return;
    }

    const amountText = editDraft.claimAmount.trim().replace(/[£,\s]/g, "");
    const amount = amountText ? Number(amountText) : null;
    if (amount != null && (!Number.isFinite(amount) || amount < 0)) {
      setEditError("Enter a valid claim amount.");
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      const res = await apiFetch(
        `/api/farms/${currentFarm.id}/agri-env-projects/${projectId}/milestones/${milestone.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: editDraft.status,
            completionDate: completionDate || null,
            claimAmountPence: amount == null ? null : Math.round(amount * 100),
            evidenceNotes: editDraft.evidenceNotes.trim() || null,
          }),
        },
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Server error ${res.status}`);
      }
      const data = await res.json() as { milestone: AgriEnvMilestone };
      cacheMutationVersionRef.current += 1;
      setMilestone(prev => prev ? { ...prev, ...data.milestone } : data.milestone);
      // Keep the project-wide milestone list in sync so the remaining-balance
      // badge updates immediately rather than waiting for the next load().
      setProjectMilestones(prev =>
        prev.some(m => m.id === data.milestone.id)
          ? prev.map(m => m.id === data.milestone.id ? { ...m, ...data.milestone } : m)
          : [...prev, data.milestone],
      );
      const confirmedSave = await confirmMilestoneSave(
        data.milestone,
        updateMilestoneCache,
      );
      setOfflineCacheWarning(!confirmedSave.offlineAvailable);
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Could not save milestone.");
    } finally {
      setSaving(false);
    }
  }, [currentFarm?.id, editDraft, milestone, projectId, updateMilestoneCache]);

  const statusMeta =
    milestone
      ? (MILESTONE_STATUS_META[milestone.status] ?? {
          label: milestone.status,
          color: "#374151",
          bg: "#f3f4f6",
        })
      : null;
  const siblingMilestones = milestone
    ? projectMilestones.filter(candidate => candidate.id !== milestone.id)
    : [];

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
        {milestone && !loading && !error ? (
          <Pressable
            onPress={startEditing}
            style={styles.editButton}
            accessibilityRole="button"
            accessibilityLabel="Edit milestone"
            testID="edit-milestone-button"
          >
            <Feather name="edit-2" size={15} color={colors.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        ) : (
          <View style={{ width: 56 }} />
        )}
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
      ) : editing ? (
        <KeyboardAwareScrollViewCompat
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          bottomOffset={68}
          keyboardDismissMode="interactive"
        >
          <View style={styles.editIntro}>
            <Text style={styles.editIntroTitle}>Edit milestone</Text>
            <Text style={styles.editIntroText}>
              Update the claim progress and supporting notes while you are on site.
            </Text>
          </View>

          <ProjectSummaryCard
            project={project}
            projectMilestones={projectMilestones}
          />

          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Status</Text>
            <View style={styles.statusOptions}>
              {MILESTONE_STATUSES.map(status => {
                const meta = MILESTONE_STATUS_META[status];
                const selected = editDraft.status === status;
                return (
                  <Pressable
                    key={status}
                    onPress={() => {
                      setEditDraft(prev => ({ ...prev, status }));
                      setEditError(null);
                    }}
                    style={[
                      styles.statusOption,
                      selected && {
                        backgroundColor: meta.bg,
                        borderColor: meta.color,
                      },
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={`Status: ${meta.label}`}
                    testID={`milestone-status-${status}`}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        selected && { color: meta.color },
                      ]}
                    >
                      {meta.label}
                    </Text>
                    {selected && <Feather name="check" size={14} color={meta.color} />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Grant Claim</Text>

            <Text style={styles.fieldLabel}>Completion date</Text>
            <Pressable
              onPress={() => {
                const value = parseIsoDateLocal(editDraft.completionDate);
                if (Platform.OS === "android") {
                  DateTimePickerAndroid.open({
                    value,
                    mode: "date",
                    maximumDate: new Date(),
                    onChange: (_event: DateTimePickerEvent, selectedDate?: Date) => {
                      if (selectedDate) {
                        setEditDraft(prev => ({
                          ...prev,
                          completionDate: dateToIso(selectedDate),
                        }));
                        setEditError(null);
                      }
                    },
                  });
                } else {
                  setShowCompletionDatePicker(prev => !prev);
                }
              }}
              style={styles.datePressable}
              accessibilityRole="button"
              accessibilityLabel={
                editDraft.completionDate
                  ? `Completion date: ${formatLocalIsoDate(editDraft.completionDate)}`
                  : "Choose completion date"
              }
              testID="milestone-completion-date-input"
            >
              <Feather name="calendar" size={16} color={colors.textTertiary} />
              <Text
                style={
                  editDraft.completionDate
                    ? styles.datePressableText
                    : styles.datePressablePlaceholder
                }
              >
                {editDraft.completionDate
                  ? formatLocalIsoDate(editDraft.completionDate)
                  : "Select date"}
              </Text>
              {!!editDraft.completionDate && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setEditDraft(prev => ({ ...prev, completionDate: "" }));
                    setShowCompletionDatePicker(false);
                    setEditError(null);
                  }}
                  hitSlop={8}
                  style={styles.clearDateButton}
                  accessibilityRole="button"
                  accessibilityLabel="Clear completion date"
                >
                  <Feather name="x" size={17} color={colors.textSecondary} />
                </Pressable>
              )}
            </Pressable>
            {Platform.OS === "ios" && showCompletionDatePicker && (
              <DateTimePicker
                value={parseIsoDateLocal(editDraft.completionDate)}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(_event: DateTimePickerEvent, selectedDate?: Date) => {
                  if (selectedDate) {
                    setEditDraft(prev => ({
                      ...prev,
                      completionDate: dateToIso(selectedDate),
                    }));
                    setEditError(null);
                  }
                }}
                style={styles.nativeDatePicker}
              />
            )}

            <Text style={styles.fieldLabel}>Claim amount (£)</Text>
            <TextInput
              value={editDraft.claimAmount}
              onChangeText={claimAmount => {
                setEditDraft(prev => ({ ...prev, claimAmount }));
                setEditError(null);
              }}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              style={styles.textInput}
              keyboardType="decimal-pad"
              accessibilityLabel="Claim amount in pounds"
              testID="milestone-claim-amount-input"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionHeading}>Evidence Notes</Text>
            <TextInput
              value={editDraft.evidenceNotes}
              onChangeText={evidenceNotes => {
                setEditDraft(prev => ({ ...prev, evidenceNotes }));
                setEditError(null);
              }}
              placeholder="Add evidence, submission details or supporting context…"
              placeholderTextColor={colors.textTertiary}
              style={[styles.textInput, styles.notesInput]}
              multiline
              textAlignVertical="top"
              accessibilityLabel="Evidence notes"
              testID="milestone-evidence-notes-input"
            />
          </View>

          {!!editError && (
            <View style={styles.editError}>
              <Feather name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.editErrorText}>{editError}</Text>
            </View>
          )}

          <View style={styles.editActions}>
            <Pressable
              onPress={() => {
                setEditing(false);
                setEditError(null);
                setShowCompletionDatePicker(false);
              }}
              style={styles.cancelButton}
              disabled={saving}
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => { void saveEdits(); }}
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Save milestone changes"
              testID="save-milestone-button"
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <>
                  <Feather name="check" size={16} color={colors.textInverse} />
                  <Text style={styles.saveButtonText}>Save changes</Text>
                </>
              )}
            </Pressable>
          </View>
        </KeyboardAwareScrollViewCompat>
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
          {offlineCacheWarning && (
            <View
              style={styles.offlineCacheWarning}
              accessibilityRole="alert"
              testID="milestone-offline-cache-warning"
            >
              <Feather name="wifi-off" size={18} color="#92400e" />
              <View style={styles.offlineCacheWarningContent}>
                <Text style={styles.offlineCacheWarningTitle}>
                  Saved online, but not available offline yet
                </Text>
                <Text style={styles.offlineCacheWarningText}>
                  Reconnect and refresh this milestone before relying on it for offline access.
                </Text>
              </View>
            </View>
          )}

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

          {/* Project context summary */}
          <ProjectSummaryCard
            project={project}
            projectMilestones={projectMilestones}
          />

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

          {/* Sibling milestones — the full list is already loaded for this project. */}
          {siblingMilestones.length > 0 && (
            <View style={styles.milestonesCard}>
              <Text style={styles.sectionHeading}>Milestones</Text>
              <Text style={styles.milestonesHint}>Other milestones in this project</Text>
              <View style={styles.siblingMilestoneList}>
                {siblingMilestones.map((sibling, index) => {
                  const siblingStatus =
                    MILESTONE_STATUS_META[sibling.status] ?? {
                      label: sibling.status,
                      color: "#374151",
                      bg: "#f3f4f6",
                    };
                  return (
                    <Pressable
                      key={sibling.id}
                      style={[
                        styles.siblingMilestoneRow,
                        index < siblingMilestones.length - 1 &&
                          styles.siblingMilestoneRowBorder,
                      ]}
                      onPress={() =>
                        router.push({
                          pathname: "/agri-env-milestone-detail" as any,
                          params: {
                            projectId: String(sibling.projectId),
                            milestoneId: String(sibling.id),
                          },
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel={`${sibling.milestoneName ?? "Milestone"}, due ${formatDate(sibling.dueDate)}, ${siblingStatus.label}. Open milestone detail.`}
                    >
                      <View style={styles.siblingMilestoneMain}>
                        <Text style={styles.siblingMilestoneName} numberOfLines={2}>
                          {sibling.milestoneName ?? "Milestone"}
                        </Text>
                        <Text style={styles.siblingMilestoneDueDate}>
                          Due {formatDate(sibling.dueDate)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.siblingMilestoneStatusPill,
                          { backgroundColor: siblingStatus.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.siblingMilestoneStatusText,
                            { color: siblingStatus.color },
                          ]}
                        >
                          {siblingStatus.label}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
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
  editButton: {
    minWidth: 56,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
  },
  editButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.primary,
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
  offlineCacheWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  offlineCacheWarningContent: {
    flex: 1,
  },
  offlineCacheWarningTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#92400e",
  },
  offlineCacheWarningText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: 19,
    color: "#92400e",
    marginTop: 2,
  },
  editIntro: {
    paddingVertical: spacing.xs,
  },
  editIntroTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  editIntroText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 19,
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
  statusOptions: {
    gap: spacing.xs,
  },
  statusOption: {
    minHeight: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
  },
  statusOptionText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: 6,
    marginTop: spacing.sm,
  },
  datePressable: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
  },
  datePressableText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  datePressablePlaceholder: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  clearDateButton: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  nativeDatePicker: {
    alignSelf: "stretch",
    marginTop: spacing.xs,
  },
  textInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.background,
  },
  notesInput: {
    minHeight: 118,
  },
  editError: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  editErrorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.error,
    lineHeight: 19,
  },
  editActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  cancelButton: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cancelButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1.4,
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textInverse,
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
  milestonesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  milestonesHint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  siblingMilestoneList: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  siblingMilestoneRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  siblingMilestoneRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight ?? colors.border,
  },
  siblingMilestoneMain: {
    flex: 1,
    flexShrink: 1,
  },
  siblingMilestoneName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  siblingMilestoneDueDate: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 3,
  },
  siblingMilestoneStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    flexShrink: 0,
  },
  siblingMilestoneStatusText: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },

  // Project context summary
  projectSummaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    gap: 4,
  },
  projectSummaryScheme: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  projectSummaryRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: spacing.sm,
    marginTop: 2,
  },
  projectSummaryTotal: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
    flexShrink: 1,
  },
  projectSummaryMeta: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textTertiary,
    marginTop: 1,
  },
  remainingPill: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    flexShrink: 0,
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
    fontSize: 11,
    fontFamily: fonts.semiBold,
  },
  remainingPillTextPartial: {
    color: "#92400e",
  },
  remainingPillTextFull: {
    color: "#166534",
  },
});

function parseIsoDateLocal(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  if (year && month && day) {
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed;
    }
  }
  return new Date();
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return dateToIso(parseIsoDateLocal(value)) === value;
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

interface MilestoneEditDraft {
  status: string;
  completionDate: string;
  claimAmount: string;
  evidenceNotes: string;
}

function dateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
