import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { apiFetch } from "@/lib/apiFetch";
import { useFarm } from "@/lib/context/FarmContext";
import {
  getSyncItemsForType,
  resetSyncItemToRetryById,
} from "@/lib/database";
import { scheduleSync, subscribe as subscribeSyncEngine } from "@/lib/sync-engine";

// ─── Types ──────────────────────────────────────────────────────────────────

interface IrrigationRecord {
  id: number;
  irrigationDate: string;
  fieldId: number | null;
  fieldName: string | null;
  fieldOrBlockDescription: string | null;
  applicationDepthMm: string | number | null;
  irrigationMethod: string;
  cropType: string | null;
  areaIrrigatedHa: string | number | null;
  operatorName: string | null;
  notes: string | null;
}

/** Shape stored in sync_queue.data_json for irrigation applications. */
interface LocalIrrigationPayload {
  farmId?: string | number;
  irrigationDate?: string;
  fieldId?: number | string | null;
  fieldName?: string | null;
  fieldOrBlockDescription?: string | null;
  applicationDepthMm?: string | number | null;
  irrigationMethod?: string;
  cropType?: string | null;
  areaIrrigatedHa?: string | number | null;
  operatorName?: string | null;
  notes?: string | null;
}

type LocalPhase = "failed" | "pending-retry";

interface LocalIrrigationItem {
  /** Queue-row ID (sync_queue.id). Used as the primary key for UI actions. */
  syncId: string;
  /** The record's local UUID (sync_queue.record_id). */
  recordId: string;
  phase: LocalPhase;
  error: string | null;
  payload: LocalIrrigationPayload;
}

type DisplayRow =
  | { kind: "server"; record: IrrigationRecord }
  | { kind: "local"; item: LocalIrrigationItem };

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function yearOf(d: string | null | undefined): string {
  if (!d) return "";
  const yr = new Date(d).getFullYear();
  return Number.isNaN(yr) ? "" : yr.toString();
}

function fieldLabel(
  rec: Pick<
    IrrigationRecord | LocalIrrigationPayload,
    "fieldOrBlockDescription" | "fieldName" | "fieldId"
  >,
): string {
  if (rec.fieldOrBlockDescription) return String(rec.fieldOrBlockDescription);
  if (rec.fieldName) return String(rec.fieldName);
  if (rec.fieldId) return `Field #${rec.fieldId}`;
  return "";
}

function safeParsePayload(json: string): LocalIrrigationPayload {
  try {
    return JSON.parse(json) as LocalIrrigationPayload;
  } catch {
    return {};
  }
}

// ─── Irrigation method options (mirrors irrigation-application.tsx) ──────────

const IRRIGATION_METHODS = [
  "Drip / Trickle",
  "Overhead Sprinkler",
  "Boom Irrigation",
  "Flood / Furrow",
  "Linear Move",
  "Rain Gun",
  "Sub-surface Drip",
  "Micro-jet",
];

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function IrrigationHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id;

  const [records, setRecords] = useState<IrrigationRecord[]>([]);
  const [localItems, setLocalItems] = useState<LocalIrrigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // Server-fetch error kept separate so local cards remain visible when offline.
  const [serverError, setServerError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ── Edit modal state ──────────────────────────────────────────────────────
  const [editRecord, setEditRecord] = useState<IrrigationRecord | null>(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editFieldDesc, setEditFieldDesc] = useState("");
  const [editCropType, setEditCropType] = useState("");
  const [editMethod, setEditMethod] = useState("");
  const [editDepthMm, setEditDepthMm] = useState("");
  const [editAreaHa, setEditAreaHa] = useState("");
  const [editOperator, setEditOperator] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const reqIdRef = useRef(0);
  // Per-request counter for local item loads — prevents stale farm-switch reads.
  const localReqRef = useRef(0);
  // Tracks which queue-row IDs the grower has explicitly retried. Items in this
  // set are shown as 'pending-retry' cards even after being reset to 'pending'
  // in the queue; they are removed once the sync outcome is confirmed.
  const retriedSyncIdsRef = useRef<Set<string>>(new Set());
  // Previous isSyncing value for transition detection in the subscription.
  const prevIsSyncingRef = useRef(false);

  // Modal for showing sync-error details
  const [errorModal, setErrorModal] = useState<{
    visible: boolean;
    item: LocalIrrigationItem | null;
  }>({ visible: false, item: null });

  // ── Load local items (failed + user-retried pending) ──────────────────────

  const loadLocalItems = useCallback(async () => {
    const capturedFarmId = farmId;
    const reqId = ++localReqRef.current;

    if (!capturedFarmId) {
      setLocalItems([]);
      return;
    }
    try {
      // Query both 'failed' and 'pending' statuses so we can track pending-retry
      // cards that were just reset from 'failed' by the user.
      const rows = await getSyncItemsForType(
        "bde_irrigation_applications",
        ["failed", "pending"],
        String(capturedFarmId),
      );
      if (reqId !== localReqRef.current) return; // stale — farm switched

      // Prune retriedSyncIds for any rows that are no longer in the queue
      // (they were successfully synced and removed by clearCompletedSyncItems).
      const returnedIds = new Set(rows.map((r) => r.id));
      for (const id of retriedSyncIdsRef.current) {
        if (!returnedIds.has(id)) {
          retriedSyncIdsRef.current.delete(id);
        }
      }

      const items: LocalIrrigationItem[] = rows
        // Show 'failed' items always; show 'pending' items only if the grower
        // explicitly retried them (so ordinary first-time uploads don't appear
        // as history cards).
        .filter((r) => r.status === "failed" || retriedSyncIdsRef.current.has(r.id))
        .map((r) => ({
          syncId: r.id,
          recordId: r.record_id,
          phase: (r.status === "failed" ? "failed" : "pending-retry") as LocalPhase,
          error: r.last_error,
          payload: safeParsePayload(r.data_json),
        }));

      setLocalItems(items);
    } catch {
      if (reqId === localReqRef.current) setLocalItems([]);
    }
  }, [farmId]);

  // ── Immediately clear local state on farm change ───────────────────────────

  useEffect(() => {
    // Cancel any in-flight loadLocalItems from the prior farm and clear display.
    localReqRef.current++;
    retriedSyncIdsRef.current = new Set();
    setLocalItems([]);
  }, [farmId]);

  // ── Subscribe to sync engine (transition-only) ────────────────────────────

  useEffect(() => {
    const unsub = subscribeSyncEngine((syncState) => {
      const wasSyncing = prevIsSyncingRef.current;
      prevIsSyncingRef.current = syncState.isSyncing;
      // Only reload after a genuine sync cycle ends (isSyncing: true → false).
      // Ignoring the false→false no-op prevents loadLocalItems from firing
      // during the scheduleSync() pending-count refresh (which broadcasts state
      // without ever starting a sync cycle), which would clear pending-retry
      // cards before the upload attempt even starts.
      if (wasSyncing && !syncState.isSyncing) {
        void loadLocalItems();
      }
    });
    return unsub;
  }, [loadLocalItems]);

  // ── Server history load ────────────────────────────────────────────────────

  const load = useCallback(
    async (isRefresh = false) => {
      if (!farmId) {
        setRecords([]);
        setLoading(false);
        return;
      }
      const reqId = ++reqIdRef.current;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setServerError(null);

      // Load local items first so they are visible even if the server is offline.
      await loadLocalItems();

      try {
        const res = await apiFetch(`/api/farms/${farmId}/irrigation-records`);
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const json = (await res.json()) as IrrigationRecord[];
        if (reqId === reqIdRef.current)
          setRecords(Array.isArray(json) ? json : []);
      } catch (err) {
        if (reqId === reqIdRef.current)
          setServerError(
            err instanceof Error ? err.message : "Failed to load",
          );
      } finally {
        if (reqId === reqIdRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [farmId, loadLocalItems],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => {
    void load(true);
  }, [load]);

  // ── Delete a server-synced record ─────────────────────────────────────────

  const handleDelete = useCallback(
    (item: IrrigationRecord) => {
      const label = item.irrigationDate
        ? formatDate(item.irrigationDate)
        : "this application";
      Alert.alert(
        "Delete Application",
        `Remove the irrigation application on ${label}? This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              if (!farmId) return;
              setDeletingId(item.id);
              try {
                const res = await apiFetch(
                  `/api/farms/${farmId}/irrigation-records/${item.id}`,
                  { method: "DELETE" },
                );
                if (!res.ok) throw new Error(`Server error ${res.status}`);
                setRecords((prev) => prev.filter((r) => r.id !== item.id));
              } catch {
                Alert.alert(
                  "Delete Failed",
                  "Could not delete the record. Please try again.",
                );
              } finally {
                setDeletingId(null);
              }
            },
          },
        ],
      );
    },
    [farmId],
  );

  // ── Retry a failed local item ─────────────────────────────────────────────

  const handleRetry = useCallback(async (item: LocalIrrigationItem) => {
    setErrorModal({ visible: false, item: null });

    // Optimistically flip the card to 'pending-retry' so the grower sees
    // immediate feedback. We do NOT remove the card — if the upload fails again
    // the subscription will call loadLocalItems() and the badge returns.
    retriedSyncIdsRef.current.add(item.syncId);
    setLocalItems((prev) =>
      prev.map((i) =>
        i.syncId === item.syncId ? { ...i, phase: "pending-retry" } : i,
      ),
    );

    try {
      // Reset only this specific queue row, not all rows for the record.
      await resetSyncItemToRetryById(item.syncId);
      await scheduleSync(300);
      // The sync-engine subscription (isSyncing: true → false) will call
      // loadLocalItems() once the attempt resolves, restoring the failed badge
      // if the upload fails again, or removing the card if it succeeds.
    } catch {
      // Queue-reset itself failed — revert the optimistic update.
      retriedSyncIdsRef.current.delete(item.syncId);
      setLocalItems((prev) =>
        prev.map((i) =>
          i.syncId === item.syncId ? { ...i, phase: "failed" } : i,
        ),
      );
      Alert.alert(
        "Retry Failed",
        "Could not queue the record for retry. Please try again.",
      );
    }
  }, []);

  const openErrorModal = useCallback((item: LocalIrrigationItem) => {
    setErrorModal({ visible: true, item });
  }, []);

  // ── Open edit modal pre-filled from a server record ───────────────────────

  const openEdit = useCallback((record: IrrigationRecord) => {
    setEditRecord(record);
    setEditFieldDesc(record.fieldOrBlockDescription ?? record.fieldName ?? "");
    setEditCropType(record.cropType ?? "");
    setEditMethod(record.irrigationMethod ?? "");
    setEditDepthMm(
      record.applicationDepthMm != null ? String(record.applicationDepthMm) : "",
    );
    setEditAreaHa(
      record.areaIrrigatedHa != null ? String(record.areaIrrigatedHa) : "",
    );
    setEditOperator(record.operatorName ?? "");
    setEditNotes(record.notes ?? "");
  }, []);

  const closeEdit = useCallback(() => {
    setEditRecord(null);
    setEditSaving(false);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editRecord || !farmId) return;
    if (!editFieldDesc.trim()) {
      Alert.alert("Required", "Please enter the field or block description.");
      return;
    }
    if (!editMethod) {
      Alert.alert("Required", "Please select the irrigation method.");
      return;
    }
    setEditSaving(true);
    try {
      const body: Record<string, unknown> = {
        fieldOrBlockDescription: editFieldDesc.trim() || null,
        cropType: editCropType.trim() || null,
        irrigationMethod: editMethod,
        operatorName: editOperator.trim() || null,
        notes: editNotes.trim() || null,
        // Always send these so clearing a value (blank input) persists as null
        // rather than leaving the old database value in place.
        applicationDepthMm: editDepthMm.trim() ? editDepthMm.trim() : null,
        areaIrrigatedHa: editAreaHa.trim() ? editAreaHa.trim() : null,
        // Preserve the linked field so the server-side area-limit check runs
        // against the correct field even when only depth/area is being corrected.
        fieldId: editRecord.fieldId ?? null,
      };
      const res = await apiFetch(
        `/api/farms/${farmId}/irrigation-records/${editRecord.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const updated = (await res.json()) as IrrigationRecord;
      setRecords((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r)),
      );
      closeEdit();
    } catch {
      Alert.alert("Save Failed", "Could not update the record. Please try again.");
      setEditSaving(false);
    }
  }, [
    editRecord,
    farmId,
    editFieldDesc,
    editMethod,
    editCropType,
    editDepthMm,
    editAreaHa,
    editOperator,
    editNotes,
    closeEdit,
  ]);

  // ── Filters ───────────────────────────────────────────────────────────────

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");

  const years = useMemo(() => {
    const serverYears = records.map((r) => yearOf(r.irrigationDate));
    const localYears = localItems.map((i) => yearOf(i.payload.irrigationDate));
    return Array.from(new Set([...serverYears, ...localYears].filter(Boolean)))
      .sort()
      .reverse();
  }, [records, localItems]);

  const displayRows = useMemo((): DisplayRow[] => {
    const q = search.trim().toLowerCase();

    const matchLocal = (i: LocalIrrigationItem): boolean => {
      if (yearFilter !== "all" && yearOf(i.payload.irrigationDate) !== yearFilter)
        return false;
      if (!q) return true;
      const p = i.payload;
      return (
        (p.irrigationMethod ?? "").toLowerCase().includes(q) ||
        fieldLabel(p).toLowerCase().includes(q) ||
        (p.cropType ?? "").toLowerCase().includes(q) ||
        (p.operatorName ?? "").toLowerCase().includes(q)
      );
    };

    const matchServer = (r: IrrigationRecord): boolean => {
      if (yearFilter !== "all" && yearOf(r.irrigationDate) !== yearFilter)
        return false;
      if (!q) return true;
      return (
        (r.irrigationMethod ?? "").toLowerCase().includes(q) ||
        fieldLabel(r).toLowerCase().includes(q) ||
        (r.cropType ?? "").toLowerCase().includes(q) ||
        (r.operatorName ?? "").toLowerCase().includes(q)
      );
    };

    // Local items (failed + pending-retry) first — most urgent.
    return [
      ...localItems.filter(matchLocal).map((item): DisplayRow => ({
        kind: "local",
        item,
      })),
      ...records.filter(matchServer).map((record): DisplayRow => ({
        kind: "server",
        record,
      })),
    ];
  }, [localItems, records, yearFilter, search]);

  const failedCount = localItems.filter((i) => i.phase === "failed").length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Irrigation Applications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterBar}>
        <View style={styles.searchRow}>
          <Feather
            name="search"
            size={16}
            color={colors.textTertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search field, method or crop…"
            placeholderTextColor={colors.textTertiary}
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
          {["all", ...years].map((y) => (
            <Pressable
              key={y}
              onPress={() => setYearFilter(y)}
              style={[
                styles.yearPill,
                yearFilter === y && styles.yearPillActive,
              ]}
            >
              <Text
                style={[
                  styles.yearPillText,
                  yearFilter === y && styles.yearPillTextActive,
                ]}
              >
                {y === "all" ? "All years" : y}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading && localItems.length === 0 ? (
        // Full-screen spinner only when there is nothing local to show yet.
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : serverError && records.length === 0 && localItems.length === 0 ? (
        // Full-screen error only when there is truly nothing to render.
        <View style={styles.centre}>
          <Feather name="wifi-off" size={32} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Could not load records</Text>
          <Text style={styles.emptySubtitle}>{serverError}</Text>
          <Pressable onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={displayRows}
          keyExtractor={(row) =>
            row.kind === "server"
              ? `srv-${row.record.id}`
              : `local-${row.item.syncId}`
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={
            displayRows.length === 0 ? styles.centre : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Feather name="droplet" size={36} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>
                No applications
                {yearFilter !== "all" ? ` for ${yearFilter}` : ""}
              </Text>
              <Text style={styles.emptySubtitle}>
                Irrigation applications logged from the Advisor or dashboard
                will appear here.
              </Text>
            </View>
          }
          ListHeaderComponent={
            <>
              {/* Inline server-error banner — local cards remain usable. */}
              {serverError ? (
                <View style={styles.serverErrorBanner}>
                  <Feather name="wifi-off" size={14} color="#92400e" />
                  <View style={styles.serverErrorText}>
                    <Text style={styles.serverErrorTitle}>
                      Could not load server history
                    </Text>
                    <Text style={styles.serverErrorSub}>
                      {serverError} · Offline records below still show.
                    </Text>
                  </View>
                  <Pressable onPress={refresh} hitSlop={8}>
                    <Feather name="refresh-cw" size={14} color="#92400e" />
                  </Pressable>
                </View>
              ) : null}
              {/* Subtle spinner when server request is in-flight but locals exist. */}
              {loading && localItems.length > 0 ? (
                <View style={styles.inlineLoading}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.inlineLoadingText}>
                    Loading server records…
                  </Text>
                </View>
              ) : null}
              {displayRows.length > 0 ? (
                <Text style={styles.countLabel}>
                  {displayRows.length} record
                  {displayRows.length !== 1 ? "s" : ""}
                  {failedCount > 0 ? ` · ${failedCount} failed to sync` : ""}
                </Text>
              ) : null}
            </>
          }
          renderItem={({ item: row }) => {
            if (row.kind === "local") {
              return (
                <LocalItemCard
                  item={row.item}
                  onPress={() => openErrorModal(row.item)}
                />
              );
            }

            const item = row.record;
            const fld = fieldLabel(item);
            const depthNum =
              item.applicationDepthMm != null
                ? Number(item.applicationDepthMm)
                : null;
            const isDeleting = deletingId === item.id;

            return (
              <Pressable
                style={[styles.card, isDeleting && styles.cardDeleting]}
                onLongPress={() => handleDelete(item)}
                delayLongPress={400}
                android_ripple={null}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>
                      {formatDate(item.irrigationDate)}
                    </Text>
                  </View>
                  <View style={styles.methodBadge}>
                    <Text style={styles.methodBadgeText} numberOfLines={1}>
                      {item.irrigationMethod}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={colors.error} />
                  ) : (
                    <View style={styles.cardActions}>
                      <Pressable
                        onPress={() => openEdit(item)}
                        hitSlop={12}
                        style={styles.editBtn}
                      >
                        <Feather name="edit-2" size={15} color={colors.primary} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(item)}
                        hitSlop={12}
                        style={styles.deleteBtn}
                      >
                        <Feather name="trash-2" size={16} color={colors.error} />
                      </Pressable>
                    </View>
                  )}
                </View>

                {fld ? (
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    📍 {fld}
                  </Text>
                ) : null}

                {item.cropType ? (
                  <Text style={styles.cardSub}>{item.cropType}</Text>
                ) : null}

                <View style={styles.cardRow}>
                  {depthNum != null && depthNum > 0 ? (
                    <View style={styles.chip}>
                      <Feather
                        name="layers"
                        size={11}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.chipText}>
                        {depthNum.toFixed(1)} mm
                      </Text>
                    </View>
                  ) : null}
                  {item.areaIrrigatedHa != null &&
                  Number(item.areaIrrigatedHa) > 0 ? (
                    <View style={styles.chip}>
                      <Feather
                        name="maximize-2"
                        size={11}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.chipText}>
                        {Number(item.areaIrrigatedHa).toFixed(2)} ha
                      </Text>
                    </View>
                  ) : null}
                  {item.operatorName ? (
                    <View style={styles.chip}>
                      <Feather
                        name="user"
                        size={11}
                        color={colors.textSecondary}
                      />
                      <Text style={styles.chipText}>{item.operatorName}</Text>
                    </View>
                  ) : null}
                </View>

                {item.notes ? (
                  <Text style={styles.cardNote} numberOfLines={2}>
                    {item.notes}
                  </Text>
                ) : null}
              </Pressable>
            );
          }}
        />
      )}

      {/* ── Edit record modal ─────────────────────────────────────────────── */}
      <Modal
        visible={editRecord !== null}
        transparent
        animationType="slide"
        onRequestClose={closeEdit}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.editOverlay}>
            <View style={styles.editSheet}>
              {/* Header */}
              <View style={styles.editHeader}>
                <Text style={styles.editTitle}>Edit Application</Text>
                <Pressable onPress={closeEdit} hitSlop={12}>
                  <Feather name="x" size={20} color={colors.textSecondary} />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.editScrollContent}
              >
                {/* Date (read-only) */}
                {editRecord ? (
                  <View style={styles.editField}>
                    <Text style={styles.editLabel}>Date</Text>
                    <View style={styles.editReadonly}>
                      <Text style={styles.editReadonlyText}>
                        {formatDate(editRecord.irrigationDate)}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* Field / Block */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Field / Block *</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editFieldDesc}
                    onChangeText={setEditFieldDesc}
                    placeholder="e.g. Home Field, North block"
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="words"
                  />
                </View>

                {/* Crop Type */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Crop Type</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editCropType}
                    onChangeText={setEditCropType}
                    placeholder="e.g. Potatoes, Lettuce"
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="words"
                  />
                </View>

                {/* Irrigation Method */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Irrigation Method *</Text>
                  {IRRIGATION_METHODS.map((m) => (
                    <Pressable
                      key={m}
                      onPress={() => setEditMethod(m)}
                      style={[
                        styles.methodOption,
                        editMethod === m && styles.methodOptionSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.methodRadio,
                          editMethod === m && styles.methodRadioSelected,
                        ]}
                      >
                        {editMethod === m && (
                          <View style={styles.methodRadioInner} />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.methodOptionLabel,
                          editMethod === m && styles.methodOptionLabelSelected,
                        ]}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Area & Depth */}
                <View style={styles.editRow}>
                  <View style={[styles.editField, { flex: 1 }]}>
                    <Text style={styles.editLabel}>Area (ha)</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editAreaHa}
                      onChangeText={setEditAreaHa}
                      placeholder="e.g. 3.25"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={[styles.editField, { flex: 1 }]}>
                    <Text style={styles.editLabel}>Depth (mm)</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editDepthMm}
                      onChangeText={setEditDepthMm}
                      placeholder="e.g. 25.0"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>

                {/* Operator */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Operator</Text>
                  <TextInput
                    style={styles.editInput}
                    value={editOperator}
                    onChangeText={setEditOperator}
                    placeholder="Operator name"
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="words"
                  />
                </View>

                {/* Notes */}
                <View style={styles.editField}>
                  <Text style={styles.editLabel}>Notes</Text>
                  <TextInput
                    style={[styles.editInput, styles.editInputMultiline]}
                    value={editNotes}
                    onChangeText={setEditNotes}
                    placeholder="Any observations or notes…"
                    placeholderTextColor={colors.textTertiary}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Actions */}
                <View style={styles.editActions}>
                  <Pressable style={styles.editCancelBtn} onPress={closeEdit}>
                    <Text style={styles.editCancelText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.editSaveBtn,
                      editSaving && styles.editSaveBtnDisabled,
                    ]}
                    onPress={() => void handleSaveEdit()}
                    disabled={editSaving}
                  >
                    {editSaving ? (
                      <ActivityIndicator size="small" color={colors.textInverse} />
                    ) : (
                      <Text style={styles.editSaveText}>Save Changes</Text>
                    )}
                  </Pressable>
                </View>

                <View style={{ height: 24 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Sync-error detail / retry modal */}
      <Modal
        visible={errorModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setErrorModal({ visible: false, item: null })}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setErrorModal({ visible: false, item: null })}
        >
          <Pressable style={styles.modalCard} onPress={() => { /* absorb */ }}>
            <View style={styles.modalHeader}>
              {errorModal.item?.phase === "pending-retry" ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Feather name="alert-circle" size={20} color={colors.error} />
              )}
              <Text
                style={[
                  styles.modalTitle,
                  errorModal.item?.phase === "pending-retry" &&
                    styles.modalTitleUploading,
                ]}
              >
                {errorModal.item?.phase === "pending-retry"
                  ? "Uploading…"
                  : "Sync Failed"}
              </Text>
            </View>

            {errorModal.item ? (
              <>
                <Text style={styles.modalBody}>
                  {errorModal.item.phase === "pending-retry"
                    ? "This irrigation application is queued for upload and will be sent when the connection allows."
                    : "This irrigation application was saved on your device but could not be uploaded to the server."}
                </Text>

                {errorModal.item.payload.irrigationDate ? (
                  <Text style={styles.modalDetail}>
                    Date: {formatDate(errorModal.item.payload.irrigationDate)}
                  </Text>
                ) : null}
                {errorModal.item.payload.irrigationMethod ? (
                  <Text style={styles.modalDetail}>
                    Method: {errorModal.item.payload.irrigationMethod}
                  </Text>
                ) : null}

                {errorModal.item.phase === "failed" &&
                errorModal.item.error ? (
                  <View style={styles.errorBox}>
                    <Text style={styles.errorBoxLabel}>Error detail</Text>
                    <Text style={styles.errorBoxText}>
                      {errorModal.item.error}
                    </Text>
                  </View>
                ) : null}

                {errorModal.item.phase === "failed" ? (
                  <Text style={styles.modalHint}>
                    Tap Retry to attempt uploading again. If the problem
                    persists, please check your connection and contact support.
                  </Text>
                ) : null}
              </>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancelBtn}
                onPress={() => setErrorModal({ visible: false, item: null })}
              >
                <Text style={styles.modalCancelText}>Dismiss</Text>
              </Pressable>
              {errorModal.item?.phase === "failed" ? (
                <Pressable
                  style={styles.modalRetryBtn}
                  onPress={() => {
                    if (errorModal.item) void handleRetry(errorModal.item);
                  }}
                >
                  <Feather
                    name="refresh-cw"
                    size={14}
                    color={colors.textInverse}
                  />
                  <Text style={styles.modalRetryText}>Retry Now</Text>
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Local item card ─────────────────────────────────────────────────────────

function LocalItemCard({
  item,
  onPress,
}: {
  item: LocalIrrigationItem;
  onPress: () => void;
}) {
  const p = item.payload;
  const fld = fieldLabel(p);
  const depthNum =
    p.applicationDepthMm != null ? Number(p.applicationDepthMm) : null;
  const isPendingRetry = item.phase === "pending-retry";

  return (
    <Pressable
      style={[styles.card, isPendingRetry ? styles.cardPending : styles.cardFailed]}
      onPress={onPress}
      android_ripple={null}
    >
      {/* Status badge row */}
      <View style={styles.statusBadgeRow}>
        {isPendingRetry ? (
          <View style={styles.pendingBadge}>
            <ActivityIndicator size="small" color={colors.primary} style={{ width: 11, height: 11 }} />
            <Text style={styles.pendingBadgeText}>Uploading…</Text>
          </View>
        ) : (
          <View style={styles.failedBadge}>
            <Feather name="alert-circle" size={11} color="#dc2626" />
            <Text style={styles.failedBadgeText}>Sync failed</Text>
          </View>
        )}
        <Text style={styles.tapHint}>Tap for details</Text>
      </View>

      <View style={styles.cardHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>
            {formatDate(p.irrigationDate)}
          </Text>
        </View>
        {p.irrigationMethod ? (
          <View style={styles.methodBadge}>
            <Text style={styles.methodBadgeText} numberOfLines={1}>
              {p.irrigationMethod}
            </Text>
          </View>
        ) : null}
        <View style={{ flex: 1 }} />
      </View>

      {fld ? (
        <Text style={styles.cardTitle} numberOfLines={1}>
          📍 {fld}
        </Text>
      ) : null}

      {p.cropType ? <Text style={styles.cardSub}>{p.cropType}</Text> : null}

      <View style={styles.cardRow}>
        {depthNum != null && depthNum > 0 ? (
          <View style={styles.chip}>
            <Feather name="layers" size={11} color={colors.textSecondary} />
            <Text style={styles.chipText}>{depthNum.toFixed(1)} mm</Text>
          </View>
        ) : null}
        {p.areaIrrigatedHa != null && Number(p.areaIrrigatedHa) > 0 ? (
          <View style={styles.chip}>
            <Feather name="maximize-2" size={11} color={colors.textSecondary} />
            <Text style={styles.chipText}>
              {Number(p.areaIrrigatedHa).toFixed(2)} ha
            </Text>
          </View>
        ) : null}
        {p.operatorName ? (
          <View style={styles.chip}>
            <Feather name="user" size={11} color={colors.textSecondary} />
            <Text style={styles.chipText}>{p.operatorName}</Text>
          </View>
        ) : null}
      </View>

      {p.notes ? (
        <Text style={styles.cardNote} numberOfLines={2}>
          {p.notes}
        </Text>
      ) : null}
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  title: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  filterBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.sm,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
  },
  yearScroll: { flexGrow: 0 },
  yearScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  yearPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  yearPillText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  yearPillTextActive: { color: colors.textInverse },
  listContent: { padding: spacing.lg, gap: spacing.md },
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  emptyWrap: { alignItems: "center", paddingTop: spacing.xl * 2 },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  retryText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textInverse,
  },
  countLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  // Server-error inline banner
  serverErrorBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fcd34d",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  serverErrorText: { flex: 1 },
  serverErrorTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: "#92400e",
  },
  serverErrorSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    marginTop: 2,
    lineHeight: 15,
  },
  // Inline loading (while server request in-flight, locals already shown)
  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  inlineLoadingText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardDeleting: { opacity: 0.5 },
  cardFailed: {
    borderWidth: 1.5,
    borderColor: "#fca5a5",
    backgroundColor: "#fff8f8",
  },
  cardPending: {
    borderWidth: 1.5,
    borderColor: "#93c5fd",
    backgroundColor: "#f0f9ff",
  },
  deleteBtn: { padding: 4 },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: "wrap",
  },
  dateBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  dateBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#0369a1",
  },
  methodBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 1,
  },
  methodBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: 2,
  },
  cardSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chipText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  cardNote: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  // Status badge row (inside local item cards)
  statusBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  failedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fee2e2",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#fca5a5",
  },
  failedBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: "#dc2626",
  },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#eff6ff",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#93c5fd",
  },
  pendingBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: "#1d4ed8",
  },
  tapHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    flex: 1,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.error,
  },
  modalTitleUploading: {
    color: colors.primary,
  },
  modalBody: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  modalDetail: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  errorBox: {
    backgroundColor: "#fff1f2",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#fecdd3",
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBoxLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: "#be123c",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  errorBoxText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#be123c",
    lineHeight: 16,
  },
  modalHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    lineHeight: 16,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "flex-end",
  },
  modalCancelBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  modalRetryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  modalRetryText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textInverse,
  },
  // Card action buttons (edit + delete)
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  editBtn: { padding: 4 },
  // Edit modal
  editOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  editSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  editHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  editTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  editScrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  editField: {
    marginBottom: spacing.md,
  },
  editRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  editLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  editInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  editInputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  editReadonly: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  editReadonlyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  // Method radio buttons inside edit modal
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  methodOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "12",
  },
  methodRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  methodRadioSelected: { borderColor: colors.primary },
  methodRadioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: colors.primary,
  },
  methodOptionLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  methodOptionLabelSelected: { color: colors.primary },
  // Edit modal action buttons
  editActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  editCancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  editCancelText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  editSaveBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  editSaveBtnDisabled: { opacity: 0.6 },
  editSaveText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textInverse,
  },
});
