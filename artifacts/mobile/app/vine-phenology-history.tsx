import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
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

import { VineBlockPicker } from "@/components/VineBlockPicker";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useApiFetch } from "@/lib/hooks/useApiFetch";
import { useApiVineBlocks, type VineBlock } from "@/lib/hooks/useApiVineBlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { apiFetch } from "@/lib/apiFetch";
import { vineyardCountEvents } from "@/lib/vineyardCountEvents";
import {
  buildWinegbSeasonYears,
  isWinegbMutationResultCurrent,
  winegbYearOf,
} from "@/lib/winegbSeasons";
import { openExternalUrl } from "@/utils/openExternalUrl";
import {
  getWinegbSurveyStatus,
  WINEGB_SURVEYS,
  type WinegbSurvey,
  type WinegbSurveyKey,
} from "@/lib/winegbSurveys";
import {
  canonicalisePhenologyDate,
  filterPhenologyRecordsByDateRange,
  getPersistablePhenologyDateRange,
  isPhenologyDateInvalid,
  parsePersistedPhenologyDateRange,
} from "@/lib/vinePhenologyDateFilter";

// ─── WineGB Survey Panel ──────────────────────────────────────────────────────

const WINEGB_SURVEY_URL = "https://winegb.co.uk/production/vineyards-wineries/";

interface WinegbSubmission {
  submitted: boolean;
  submittedAt: string | null;
}

function WinegbSubmissionsPanel({ farmId, seasonYear }: { farmId: string; seasonYear: number }) {
  const [collapsed, setCollapsed] = useState(false);
  const [submissions, setSubmissions] = useState<Record<string, WinegbSubmission>>({});
  const [loadingPanel, setLoadingPanel] = useState(true);
  const [toggling, setToggling] = useState<WinegbSurveyKey | null>(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const seasonYearRef = useRef(seasonYear);
  seasonYearRef.current = seasonYear;

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchSubmissions = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoadingPanel(true);
    setSubmissions({});
    try {
      const res = await apiFetch(`/api/farms/${farmId}/winegb-submissions?year=${seasonYear}`);
      if (!mountedRef.current || requestId !== requestIdRef.current) return;
      if (res.ok) {
        const json = await res.json() as { submissions: Record<string, WinegbSubmission> };
        setSubmissions(json.submissions ?? {});
      }
    } catch {
      // silently ignore network errors for the panel
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) setLoadingPanel(false);
    }
  }, [farmId, seasonYear]);

  useEffect(() => {
    void fetchSubmissions();
  }, [fetchSubmissions]);

  const handleToggle = async (survey: WinegbSurvey) => {
    if (toggling) return;
    const current = submissions[survey.key]?.submitted ?? false;
    setToggling(survey.key);
    try {
      const res = await apiFetch(`/api/farms/${farmId}/winegb-submissions/${survey.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submitted: !current, year: seasonYear }),
      });
      if (res.ok) {
        if (
          !mountedRef.current ||
          !isWinegbMutationResultCurrent(seasonYear, seasonYearRef.current)
        ) return;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSubmissions(prev => ({
          ...prev,
          [survey.key]: { submitted: !current, submittedAt: !current ? new Date().toISOString() : null },
        }));
      } else {
        Alert.alert("Save Failed", "Could not update the survey status. Please try again.");
      }
    } catch {
      Alert.alert("Save Failed", "Could not reach the server. Please try again.");
    } finally {
      setToggling(null);
    }
  };

  const doneCount = WINEGB_SURVEYS.filter(s => submissions[s.key]?.submitted).length;
  const allDone = doneCount === WINEGB_SURVEYS.length;

  return (
    <View style={wgStyles.container}>
      {/* Header row */}
      <Pressable
        style={wgStyles.headerRow}
        onPress={() => setCollapsed(c => !c)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={collapsed ? "Expand WineGB survey checklist" : "Collapse WineGB survey checklist"}
      >
        <View style={wgStyles.headerLeft}>
          <Feather name="globe" size={14} color="#059669" />
          <Text style={wgStyles.headerTitle}>WineGB Surveys — {seasonYear}</Text>
          {allDone ? (
            <View style={wgStyles.allDoneBadge}>
              <Feather name="check-circle" size={11} color="#15803d" />
              <Text style={wgStyles.allDoneText}>All submitted</Text>
            </View>
          ) : doneCount > 0 ? (
            <View style={wgStyles.countBadge}>
              <Text style={wgStyles.countBadgeText}>{doneCount}/{WINEGB_SURVEYS.length}</Text>
            </View>
          ) : null}
        </View>
        <Feather name={collapsed ? "chevron-down" : "chevron-up"} size={16} color="#059669" />
      </Pressable>

      {!collapsed && (
        <>
          {loadingPanel ? (
            <View style={wgStyles.loadingRow}>
              <ActivityIndicator size="small" color="#059669" />
              <Text style={wgStyles.loadingText}>Loading…</Text>
            </View>
          ) : (
            <View style={wgStyles.surveyList}>
              {WINEGB_SURVEYS.map(survey => {
                const state = submissions[survey.key];
                const isSubmitted = state?.submitted ?? false;
                const { isOverdue, isInSeason } = getWinegbSurveyStatus({
                  survey,
                  seasonYear,
                  submitted: isSubmitted,
                });
                const isPending = toggling === survey.key;

                let rowStyle = wgStyles.surveyRowDefault;
                let labelStyle = wgStyles.surveyLabelDefault;
                let iconColor = "#6b7280";
                if (isSubmitted) { rowStyle = wgStyles.surveyRowSubmitted; labelStyle = wgStyles.surveyLabelSubmitted; iconColor = "#16a34a"; }
                else if (isOverdue) { rowStyle = wgStyles.surveyRowOverdue; labelStyle = wgStyles.surveyLabelOverdue; iconColor = "#dc2626"; }
                else if (isInSeason) { rowStyle = wgStyles.surveyRowInSeason; labelStyle = wgStyles.surveyLabelInSeason; iconColor = "#d97706"; }

                return (
                  <Pressable
                    key={survey.key}
                    style={[wgStyles.surveyRow, rowStyle]}
                    onPress={() => { void handleToggle(survey); }}
                    disabled={isPending}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSubmitted }}
                    accessibilityLabel={`${isSubmitted ? "Unmark" : "Mark"} ${survey.label} as submitted`}
                  >
                    {isPending ? (
                      <ActivityIndicator size="small" color={iconColor} style={wgStyles.surveyIcon} />
                    ) : isSubmitted ? (
                      <Feather name="check-circle" size={15} color={iconColor} style={wgStyles.surveyIcon} />
                    ) : isOverdue ? (
                      <Feather name="alert-triangle" size={15} color={iconColor} style={wgStyles.surveyIcon} />
                    ) : isInSeason ? (
                      <Feather name="alert-triangle" size={15} color={iconColor} style={wgStyles.surveyIcon} />
                    ) : (
                      <View style={[wgStyles.surveyCheckbox, wgStyles.surveyIcon]} />
                    )}
                    <Text style={[wgStyles.surveyLabel, labelStyle]}>{survey.label}</Text>
                    {isOverdue && (
                      <View style={wgStyles.overdueBadge}>
                        <Text style={wgStyles.overdueBadgeText}>Overdue</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}
          <Text style={wgStyles.hint}>
            Tap a row to mark it as submitted. Tick each survey once you've submitted your data to WineGB.
          </Text>
          <Pressable
            style={wgStyles.externalLink}
            onPress={() => void openExternalUrl(WINEGB_SURVEY_URL)}
            accessibilityRole="link"
            accessibilityLabel="Submit to WineGB"
            testID="submit-to-winegb-link"
          >
            <Text style={wgStyles.externalLinkText}>Submit to WineGB ↗</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

// ─── Phenology Record ─────────────────────────────────────────────────────────

interface PhenologyRecord {
  id: number;
  observationDate: string | null;
  blockId: number | null;
  blockName: string | null;
  bbchStage: string | null;
  bbchDescription: string | null;
  percentageReached: number | null;
  observer: string | null;
  temperatureC: number | null;
  notes: string | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Edit Modal (block-link focused) ─────────────────────────────────────────

function EditPhenologyModal({
  visible,
  record,
  farmId,
  blocks,
  blocksLoading,
  onClose,
  onSaved,
}: {
  visible: boolean;
  record: PhenologyRecord | null;
  farmId: string;
  blocks: VineBlock[];
  blocksLoading: boolean;
  onClose: () => void;
  onSaved: (recordId: number, updated: Partial<PhenologyRecord>) => void;
}) {
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [observationDate, setObservationDate] = useState("");
  const [observer, setObserver] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible && record) {
      setObservationDate(record.observationDate ?? "");
      setObserver(record.observer ?? "");
      setNotes(record.notes ?? "");
      if (record.blockId) {
        setSelectedBlock(blocks.find(b => b.id === record.blockId) ?? null);
      } else {
        setSelectedBlock(null);
      }
    }
  }, [visible, record, blocks]);

  const handleSave = async () => {
    if (!record) return;
    setSaving(true);
    try {
      const body = {
        observationDate: observationDate || null,
        observer: observer.trim() || null,
        notes: notes.trim() || null,
        blockId: selectedBlock?.id ?? null,
        blockName: selectedBlock?.blockName ?? null,
      };
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-phenology/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Save Failed", (err as any).error ?? "Could not save the record. Please try again.");
        setSaving(false);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSaved(record.id, body);
    } catch {
      Alert.alert("Save Failed", "Could not reach the server. Please try again.");
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={editStyles.container}>
          <View style={editStyles.header}>
            <Text style={editStyles.title}>Edit Phenology Record</Text>
            <Pressable onPress={onClose} style={editStyles.closeBtn} hitSlop={12}>
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={editStyles.scroll} contentContainerStyle={editStyles.scrollContent} keyboardShouldPersistTaps="handled">
            {record && (
              <View style={editStyles.stageBadge}>
                <Text style={editStyles.stageBadgeLabel}>BBCH {record.bbchStage}</Text>
                <Text style={editStyles.stageBadgeDesc}>{record.bbchDescription ?? ""}</Text>
              </View>
            )}

            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Record Details</Text>

              <Text style={editStyles.fieldLabel}>Observation Date</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={observationDate}
                onChangeText={setObservationDate}
                keyboardType="numeric"
              />

              <Text style={editStyles.fieldLabel}>Observer</Text>
              <Input
                placeholder="Enter name"
                value={observer}
                onChangeText={setObserver}
              />

              <Text style={editStyles.fieldLabel}>Block / Area</Text>
              {blocksLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.sm }} />
              ) : (
                <VineBlockPicker
                  blocks={blocks}
                  selected={selectedBlock}
                  onSelect={setSelectedBlock}
                  loading={false}
                />
              )}
              {selectedBlock && (
                <Pressable onPress={() => setSelectedBlock(null)} style={editStyles.clearBlockBtn}>
                  <Feather name="x" size={12} color={colors.textSecondary} />
                  <Text style={editStyles.clearBlockText}>Clear block link</Text>
                </Pressable>
              )}

              <Text style={editStyles.fieldLabel}>Notes</Text>
              <Input
                placeholder="Additional observations…"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          <View style={editStyles.footer}>
            <Button
              title={saving ? "Saving…" : "Save Changes"}
              onPress={handleSave}
              disabled={saving}
              fullWidth
            />
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Record Row ───────────────────────────────────────────────────────────────

function PhenologyRow({
  item,
  onEdit,
  onDelete,
}: {
  item: PhenologyRecord;
  onEdit: (record: PhenologyRecord) => void;
  onDelete: (id: number) => void;
}) {
  const linked = !!item.blockId;

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Phenology Record",
      `Delete the phenology record from ${formatDate(item.observationDate)}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) },
      ],
    );
  };

  return (
    <Pressable style={styles.row} onPress={() => { Haptics.selectionAsync(); onEdit(item); }}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowDate}>{formatDate(item.observationDate)}</Text>
        <View style={styles.rowMeta}>
          {linked ? (
            <View style={styles.blockTag}>
              <Feather name="layers" size={12} color={colors.primary} />
              <Text style={styles.blockTagText}>{item.blockName ?? "Block"}</Text>
            </View>
          ) : (
            <View style={styles.unlinkTag}>
              <Feather name="alert-circle" size={12} color={colors.warning ?? "#d97706"} />
              <Text style={styles.unlinkTagText}>No block linked</Text>
            </View>
          )}
          {item.bbchStage ? (
            <Text style={styles.rowSub}>BBCH {item.bbchStage}</Text>
          ) : null}
          {item.observer ? (
            <Text style={styles.rowSub} numberOfLines={1}>{item.observer}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        <Feather name="edit-2" size={14} color={colors.textSecondary} />
        <Pressable onPress={(e) => { e.stopPropagation(); handleDelete(); }} hitSlop={12} style={styles.deleteBtn}>
          <Feather name="trash-2" size={15} color={colors.error} />
        </Pressable>
        <Feather name="chevron-right" size={16} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VinePhenologyHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("vine-phenology-history", currentFarm?.id, user?.id);
  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));
  const { records, loading, refreshing, error, refresh } = useApiFetch<PhenologyRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/vineyard-phenology",
  );
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);

  const currentYear = new Date().getFullYear();
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [winegbYears, setWinegbYears] = useState<number[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateRangeRestoredForFarmId, setDateRangeRestoredForFarmId] = useState<string | undefined>();
  const dateRangeChangedDuringRestoreRef = useRef(false);
  const [editingRecord, setEditingRecord] = useState<PhenologyRecord | null>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<number, Partial<PhenologyRecord>>>({});
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setDateRangeRestoredForFarmId(undefined);
    dateRangeChangedDuringRestoreRef.current = false;
    setDateFrom("");
    setDateTo("");
  }, [currentFarm?.id]);

  useEffect(() => {
    const farmId = currentFarm?.id == null ? undefined : String(currentFarm.id);
    if (!farmId || dateRangeRestoredForFarmId === farmId) return;

    let cancelled = false;
    const storageKey = `bde_vine_phenology_date_range_${farmId}`;
    void AsyncStorage.getItem(storageKey)
      .then(raw => {
        if (cancelled || dateRangeChangedDuringRestoreRef.current) return;
        let restored = null;
        if (raw) {
          try {
            restored = parsePersistedPhenologyDateRange(JSON.parse(raw));
          } catch {
            // Ignore malformed storage and leave the filter cleared.
          }
        }
        if (restored) {
          setDateFrom(restored.from);
          setDateTo(restored.to);
        }
      })
      .catch(() => {
        // Keep the visible range empty if local preference storage is unavailable.
      })
      .finally(() => {
        if (!cancelled) setDateRangeRestoredForFarmId(farmId);
      });

    return () => {
      cancelled = true;
    };
  }, [currentFarm?.id, dateRangeRestoredForFarmId]);

  useEffect(() => {
    const farmId = currentFarm?.id == null ? undefined : String(currentFarm.id);
    if (!farmId || dateRangeRestoredForFarmId !== farmId) return;
    const persistedRange = getPersistablePhenologyDateRange(dateFrom, dateTo);
    if (!persistedRange) return;
    void AsyncStorage.setItem(
      `bde_vine_phenology_date_range_${farmId}`,
      JSON.stringify(persistedRange),
    );
  }, [currentFarm?.id, dateFrom, dateRangeRestoredForFarmId, dateTo]);

  const updateDateFrom = useCallback((value: string) => {
    dateRangeChangedDuringRestoreRef.current = true;
    setDateFrom(value);
  }, []);

  const updateDateTo = useCallback((value: string) => {
    dateRangeChangedDuringRestoreRef.current = true;
    setDateTo(value);
  }, []);

  const clearDateRange = useCallback(() => {
    dateRangeChangedDuringRestoreRef.current = true;
    setDateFrom("");
    setDateTo("");
    const farmId = currentFarm?.id == null ? undefined : String(currentFarm.id);
    if (farmId) {
      void AsyncStorage.removeItem(`bde_vine_phenology_date_range_${farmId}`);
    }
  }, [currentFarm?.id]);

  useEffect(() => {
    let active = true;
    const farmId = currentFarm?.id;
    if (!farmId) {
      setWinegbYears([]);
      return () => { active = false; };
    }

    void apiFetch(`/api/farms/${farmId}/winegb-submissions-history`)
      .then(async res => {
        if (!active || !res.ok) return;
        const payload = await res.json() as { years?: unknown };
        if (!active || !Array.isArray(payload.years)) return;
        setWinegbYears(payload.years.filter((year): year is number =>
          typeof year === "number" && Number.isInteger(year),
        ));
      })
      .catch(() => {
        // The visible phenology records still provide a useful local fallback.
      });

    return () => { active = false; };
  }, [currentFarm?.id]);

  const canonFrom = useMemo(() => canonicalisePhenologyDate(dateFrom), [dateFrom]);
  const canonTo = useMemo(() => canonicalisePhenologyDate(dateTo), [dateTo]);
  const dateFromInvalid = isPhenologyDateInvalid(dateFrom);
  const dateToInvalid = isPhenologyDateInvalid(dateTo);
  const dateRangeReversed = canonFrom !== null && canonTo !== null && canonFrom > canonTo;

  const displayRecords = useMemo(() => {
    return records
      .filter(r => !deletedIds.has(r.id))
      .map(r => {
        const update = localUpdates[r.id];
        return update !== undefined ? { ...r, ...update } : r;
      });
  }, [records, localUpdates, deletedIds]);

  const years = useMemo(
    () => buildWinegbSeasonYears(
      currentYear,
      winegbYears,
      displayRecords.map(r => r.observationDate),
    ),
    [currentYear, displayRecords, winegbYears],
  );
  const selectedSeasonYear = yearFilter === "all" ? currentYear : Number(yearFilter);

  const filtered = useMemo(() => {
    let result = filterPhenologyRecordsByDateRange(displayRecords, dateFrom, dateTo);
    if (yearFilter !== "all") result = result.filter(r => winegbYearOf(r.observationDate) === yearFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        (r.blockName ?? "").toLowerCase().includes(q) ||
        (r.observer ?? "").toLowerCase().includes(q) ||
        (r.observationDate ?? "").includes(q) ||
        (r.bbchStage ?? "").includes(q),
      );
    }
    return result;
  }, [displayRecords, yearFilter, search, dateFrom, dateTo]);

  const unlinkedCount = useMemo(() => displayRecords.filter(r => !r.blockId).length, [displayRecords]);

  const handleSaved = useCallback((recordId: number, updated: Partial<PhenologyRecord>) => {
    setLocalUpdates(prev => ({ ...prev, [recordId]: { ...(prev[recordId] ?? {}), ...updated } }));
    vineyardCountEvents.emit();
    setEditingRecord(null);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    setDeletedIds(prev => new Set(prev).add(id));
    try {
      const res = await apiFetch(`/api/farms/${currentFarm?.id}/vineyard-phenology/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setDeletedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        Alert.alert("Delete Failed", "Could not delete the record. Please try again.");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setDeletedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      Alert.alert("Delete Failed", "Could not reach the server. Please try again.");
    }
  }, [currentFarm?.id]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Phenology History</Text>
      </View>

      <IdentifierBanner
        justSaved={justSaved && !identifiersLoading}
        loading={identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={!cphNumber}
        sbiMissing={!sbiNumber}
        context="phenology records"
      />

      {currentFarm?.id && (
        <WinegbSubmissionsPanel farmId={String(currentFarm.id)} seasonYear={selectedSeasonYear} />
      )}

      {unlinkedCount > 0 && (
        <View style={styles.unlinkedBanner}>
          <Feather name="alert-triangle" size={15} color="#92400e" />
          <Text style={styles.unlinkedBannerText}>
            {unlinkedCount} {unlinkedCount === 1 ? "record is" : "records are"} not linked to a vineyard block. Tap a record to assign one.
          </Text>
        </View>
      )}

      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by block, observer or date…"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.yearScroll}
        contentContainerStyle={styles.yearScrollContent}
      >
        {["all", ...years].map(y => (
          <Pressable
            key={y}
            onPress={() => setYearFilter(y)}
            style={[styles.yearPill, yearFilter === y && styles.yearPillActive]}
          >
            <Text style={[styles.yearPillText, yearFilter === y && styles.yearPillTextActive]}>
              {y === "all" ? "All years" : y}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Date range filter */}
      <View style={styles.dateRangeRow}>
        <Feather name="calendar" size={14} color={colors.textSecondary} />
        <View style={styles.dateRangeInputs}>
          <View style={styles.dateRangeField}>
            <Text style={styles.dateRangeLabel}>From</Text>
            <TextInput
              style={[styles.dateInput, dateFromInvalid && styles.dateInputError]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.textSecondary}
              value={dateFrom}
              onChangeText={updateDateFrom}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
          <View style={styles.dateRangeSep} />
          <View style={styles.dateRangeField}>
            <Text style={styles.dateRangeLabel}>To</Text>
            <TextInput
              style={[styles.dateInput, dateToInvalid && styles.dateInputError]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.textSecondary}
              value={dateTo}
              onChangeText={updateDateTo}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
        </View>
        {(dateFrom.trim() || dateTo.trim()) ? (
          <Pressable
            onPress={clearDateRange}
            hitSlop={10}
            style={styles.dateRangeClear}
          >
            <Feather name="x-circle" size={16} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {(dateFromInvalid || dateToInvalid || dateRangeReversed) && (
        <View style={styles.dateRangeError}>
          <Feather name="alert-circle" size={13} color={colors.error} />
          <Text style={styles.dateRangeErrorText}>
            {dateRangeReversed
              ? "'From' date must be before 'To' date."
              : "Use DD/MM/YYYY or YYYY-MM-DD format."}
          </Text>
        </View>
      )}

      {(search.trim() || dateFrom.trim() || dateTo.trim()) ? (
        <View style={styles.clearFiltersRow}>
          <Pressable
            onPress={() => { setSearch(""); clearDateRange(); }}
            style={styles.clearFiltersChip}
            hitSlop={6}
          >
            <Feather name="x" size={13} color={colors.primary} />
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </Pressable>
        </View>
      ) : null}

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={18} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <PhenologyRow item={item} onEdit={setEditingRecord} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="eye-off" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No phenology records</Text>
              <Text style={styles.emptyText}>
                {search.trim() || dateFrom.trim() || dateTo.trim()
                  ? "No records match the current filters."
                  : "Phenology records you create will appear here."}
              </Text>
            </View>
          }
        />
      )}

      <EditPhenologyModal
        visible={editingRecord !== null}
        record={editingRecord}
        farmId={currentFarm?.id ?? ""}
        blocks={blocks}
        blocksLoading={blocksLoading}
        onClose={() => setEditingRecord(null)}
        onSaved={handleSaved}
      />
    </View>
  );
}

// ─── Edit Modal Styles ────────────────────────────────────────────────────────

const editStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  closeBtn: { padding: spacing.xs },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  stageBadge: {
    backgroundColor: "#ede9fe",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  stageBadgeLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.primary },
  stageBadgeDesc: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  clearBlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  clearBlockText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textDecorationLine: "underline",
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text, flex: 1 },
  unlinkedBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  unlinkedBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { marginRight: spacing.xs },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  yearScroll: {
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  yearScrollContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  yearPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  yearPillText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  yearPillTextActive: {
    color: colors.textInverse,
  },
  dateRangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateRangeInputs: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dateRangeField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateRangeLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    width: 26,
  },
  dateInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.text,
    paddingVertical: 4,
  },
  dateRangeSep: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  dateRangeClear: {
    paddingLeft: spacing.xs,
  },
  dateInputError: {
    color: colors.error,
  },
  dateRangeError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginHorizontal: spacing.md,
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  dateRangeErrorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.error,
  },
  clearFiltersRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  clearFiltersChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  clearFiltersText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  listContent: { paddingBottom: spacing.xl },
  emptyContainer: { flex: 1, justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  rowLeft: { flex: 1, gap: 4 },
  rowDate: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  rowSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginLeft: spacing.sm },
  deleteBtn: { padding: 4 },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
  blockTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ede9fe",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  blockTagText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primary },
  unlinkTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fffbeb",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unlinkTagText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.warning ?? "#d97706" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: "#fef2f2",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.error, flex: 1 },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
});

// ─── WineGB Panel Styles ──────────────────────────────────────────────────────

const wgStyles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: "#ecfdf5",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#6ee7b7",
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flex: 1,
    flexWrap: "wrap",
  },
  headerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#065f46",
  },
  allDoneBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#dcfce7",
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  allDoneText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#15803d",
  },
  countBadge: {
    backgroundColor: "#d1fae5",
    borderRadius: 100,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#6ee7b7",
  },
  countBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#047857",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#059669",
  },
  surveyList: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
  },
  surveyRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
  surveyIcon: {
    marginRight: spacing.xs,
  },
  surveyCheckbox: {
    width: 15,
    height: 15,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#6ee7b7",
    backgroundColor: "transparent",
  },
  surveyLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
  },
  // State variants
  surveyRowDefault: { borderColor: "#6ee7b7", backgroundColor: "#ffffff" },
  surveyLabelDefault: { color: "#065f46" },
  surveyRowSubmitted: { borderColor: "#86efac", backgroundColor: "#f0fdf4" },
  surveyLabelSubmitted: { color: "#15803d" },
  surveyRowOverdue: { borderColor: "#fca5a5", backgroundColor: "#fef2f2" },
  surveyLabelOverdue: { color: "#b91c1c" },
  surveyRowInSeason: { borderColor: "#fcd34d", backgroundColor: "#fffbeb" },
  surveyLabelInSeason: { color: "#92400e" },
  overdueBadge: {
    backgroundColor: "#fee2e2",
    borderRadius: 100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "#fca5a5",
    marginLeft: spacing.xs,
  },
  overdueBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
    color: "#b91c1c",
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: "#047857",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    lineHeight: 16,
  },
  externalLink: {
    alignSelf: "flex-start",
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  externalLinkText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
