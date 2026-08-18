import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useState, useMemo, useCallback } from "react";
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
import { usePersistedBlockFilter } from "@/lib/hooks/usePersistedBlockFilter";
import { usePersistedVintage } from "@/lib/hooks/usePersistedVintage";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { apiFetch } from "@/lib/apiFetch";
import { getItem, getList, setItem } from "@/lib/storage";

interface HarvestRecord {
  id: number;
  harvestDate: string | null;
  blockId: number | null;
  blockName: string | null;
  vintageYear: number | null;
  harvestMethod: string | null;
  yieldKg: number | null;
  brix: number | null;
  ph: number | null;
  titratableAcidityGl: number | null;
  potentialAlcohol: number | null;
  grapeCondition: string | null;
  operatorName: string | null;
  notes: string | null;
}

interface OfflineHarvestEntry {
  id: string;
  farmId: string;
  harvestDate?: string;
  vintageYear?: number;
  blockId?: number;
  blockName?: string;
  yieldKg?: number;
  brix?: number;
  ph?: number;
  titratableAcidityGl?: number;
  potentialAlcohol?: number;
  grapeCondition?: string;
  operatorName?: string;
  notes?: string;
  _pendingSync?: boolean;
}
function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Edit Modal (block-link focused) ─────────────────────────────────────────

function EditHarvestModal({
  visible,
  record,
  farmId,
  blocks,
  blocksLoading,
  onClose,
  onSaved,
}: {
  visible: boolean;
  record: HarvestRecord | null;
  farmId: string;
  blocks: VineBlock[];
  blocksLoading: boolean;
  onClose: () => void;
  onSaved: (recordId: number, updated: Partial<HarvestRecord>) => void;
}) {
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [harvestDate, setHarvestDate] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible && record) {
      setHarvestDate(record.harvestDate ?? "");
      setOperatorName(record.operatorName ?? "");
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
        harvestDate: harvestDate || null,
        operatorName: operatorName.trim() || null,
        notes: notes.trim() || null,
        blockId: selectedBlock?.id ?? null,
        blockName: selectedBlock?.blockName ?? null,
      };
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-harvest/${record.id}`, {
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
            <Text style={editStyles.title}>Edit Harvest Record</Text>
            <Pressable onPress={onClose} style={editStyles.closeBtn} hitSlop={12}>
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={editStyles.scroll} contentContainerStyle={editStyles.scrollContent} keyboardShouldPersistTaps="handled">
            {record && (
              <View style={editStyles.summaryBadge}>
                {record.yieldKg != null && (
                  <Text style={editStyles.summaryLine}>
                    <Text style={editStyles.summaryBold}>{record.yieldKg} kg</Text>
                    {record.vintageYear ? ` · ${record.vintageYear}` : ""}
                  </Text>
                )}
                {record.harvestMethod ? (
                  <Text style={editStyles.summaryLine}>{record.harvestMethod}</Text>
                ) : null}
                {record.grapeCondition ? (
                  <Text style={editStyles.summaryLine}>Condition: {record.grapeCondition}</Text>
                ) : null}
              </View>
            )}

            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Record Details</Text>

              <Text style={editStyles.fieldLabel}>Harvest Date</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={harvestDate}
                onChangeText={setHarvestDate}
                keyboardType="numeric"
              />

              <Text style={editStyles.fieldLabel}>Operator</Text>
              <Input
                placeholder="Enter name"
                value={operatorName}
                onChangeText={setOperatorName}
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
                placeholder="Additional notes…"
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

function HarvestRow({
  item,
  blockAreaHa,
  onEdit,
  onDelete,
}: {
  item: HarvestRecord;
  blockAreaHa?: number | null;
  onEdit: (record: HarvestRecord) => void;
  onDelete: (id: number) => void;
}) {
  const linked = !!item.blockId;
  const tonnesPerHa =
    item.yieldKg != null && blockAreaHa != null && blockAreaHa > 0
      ? item.yieldKg / 1000 / blockAreaHa
      : null;

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Harvest Record",
      `Delete the harvest record from ${formatDate(item.harvestDate)}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) },
      ],
    );
  };

  const conditionColor: Record<string, string> = {
    Excellent: "#16a34a",
    Good: "#65a30d",
    Fair: "#d97706",
    Poor: "#dc2626",
  };

  return (
    <Pressable style={styles.row} onPress={() => { Haptics.selectionAsync(); onEdit(item); }}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowDate}>{formatDate(item.harvestDate)}</Text>
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
          {item.yieldKg != null ? (
            <Text style={styles.rowSub}>
              {item.yieldKg.toLocaleString("en-GB")} kg
              {tonnesPerHa != null ? ` · ${tonnesPerHa.toFixed(2)} t/ha` : ""}
            </Text>
          ) : null}
          {item.vintageYear ? (
            <Text style={styles.rowSub}>{item.vintageYear}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        {item.grapeCondition ? (
          <View style={[styles.badge, { backgroundColor: "#f5f5f5", borderColor: conditionColor[item.grapeCondition] ?? colors.border }]}>
            <Text style={[styles.badgeText, { color: conditionColor[item.grapeCondition] ?? colors.text }]}>
              {item.grapeCondition}
            </Text>
          </View>
        ) : null}
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

export default function VineHarvestHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { address, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("vine-harvest-history", currentFarm?.id, user?.id);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));

  const missingAddressFields: string[] = !identifiersLoading
    ? [
        !currentFarm?.name || currentFarm.name.trim() === "" ? "Farm name" : "",
        !address || address.trim() === "" ? "Farm address" : "",
      ].filter(Boolean)
    : [];
  const missingIdentifiers = missingAddressFields.length > 0;

  const { records, loading, refreshing, error, refresh, recordsFarmId } = useApiFetch<HarvestRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/vineyard-harvest",
  );
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);

  const [search, setSearch] = useState("");
  const [selectedVintage, setSelectedVintage, vintageLoadedForFarmId] = usePersistedVintage(currentFarm?.id);
  const [selectedBlockIds, setSelectedBlockIds] = usePersistedBlockFilter(currentFarm?.id);
  const [editingRecord, setEditingRecord] = useState<HarvestRecord | null>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<number, Partial<HarvestRecord>>>({});
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [varietySort, setVarietySort] = useState<{ col: "variety" | "totalKg" | "kgPerHa" | "avgBrix"; dir: "asc" | "desc" }>({ col: "variety", dir: "asc" });

  // Persisted open/closed state for the Yield by Variety panel, scoped per farm.
  // Default: open (true). Loaded from storage on mount / farm switch.
  const [varietyTableOpen, setVarietyTableOpenRaw] = useState(true);
  const loadedVarietyOpenForFarm = React.useRef<string | undefined>(undefined);
  // Set to true when the user explicitly toggles the panel so a stale async
  // storage read cannot overwrite a choice they made before hydration finished.
  const varietyUserToggledRef = React.useRef(false);
  React.useEffect(() => {
    if (!currentFarm?.id) return;
    const farmId = String(currentFarm.id);
    if (loadedVarietyOpenForFarm.current === farmId) return;
    // Reset to default immediately on farm switch so a farm with no stored
    // preference never inherits the previous farm's collapsed state.
    setVarietyTableOpenRaw(true);
    varietyUserToggledRef.current = false;
    let cancelled = false;
    getItem<boolean>(`bde_vine_variety_table_open_${farmId}`).then((stored) => {
      if (cancelled || varietyUserToggledRef.current) return;
      if (typeof stored === "boolean") setVarietyTableOpenRaw(stored);
      loadedVarietyOpenForFarm.current = farmId;
    });
    return () => { cancelled = true; };
  }, [currentFarm?.id]);

  const setVarietyTableOpen = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    varietyUserToggledRef.current = true;
    setVarietyTableOpenRaw(prev => {
      const value = typeof next === "function" ? next(prev) : next;
      if (currentFarm?.id) {
        setItem(`bde_vine_variety_table_open_${currentFarm.id}`, value).catch(() => { /* best-effort */ });
      }
      return value;
    });
  }, [currentFarm?.id]);

  // Offline-pending records that haven't synced yet
  const [offlinePending, setOfflinePending] = useState<OfflineHarvestEntry[]>([]);
  React.useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const all = await getList<OfflineHarvestEntry>("bde_vine_harvest");
        if (!active) return;
        const pending = all.filter(
          r => r._pendingSync === true && (!currentFarm?.id || r.farmId === currentFarm.id),
        );
        setOfflinePending(pending);
      } catch {
        // non-fatal — totals will just exclude offline records
      }
    };
    load();
    return () => { active = false; };
  }, [currentFarm?.id, records]); // re-read whenever server records refresh (sync may have cleared some)

  const displayRecords = useMemo(() => {
    return records
      .filter(r => !deletedIds.has(r.id))
      .map(r => {
        const update = localUpdates[r.id];
        return update !== undefined ? { ...r, ...update } : r;
      });
  }, [records, localUpdates, deletedIds]);

  // Sorted unique vintage years descending
  const vintages = useMemo(() => {
    const years = new Set<number>();
    for (const r of displayRecords) {
      if (r.vintageYear != null) years.add(r.vintageYear);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [displayRecords]);

  // Once both the persisted value AND the current farm's records are confirmed
  // loaded, apply the stored selection — or fall back to the most recent if
  // it's no longer valid.
  //
  // Guards:
  //   vintageLoadedForFarmId === currentFarm?.id  — AsyncStorage read is for THIS farm
  //   recordsFarmId === currentFarm?.id           — records come from a SUCCESSFUL fetch
  //                                                 for THIS farm (useApiFetch retains
  //                                                 prior-farm records while loading and
  //                                                 on error, so !loading alone is not
  //                                                 sufficient)
  //
  // selectedVintage semantics (from usePersistedVintage):
  //   undefined → no preference stored; apply default (most recent)
  //   null      → user explicitly chose "All vintages"; keep it
  //   number    → specific year; keep if still available, else fall back
  const resolvedForFarm = React.useRef<string | undefined>(undefined);
  React.useEffect(() => {
    // Only proceed once AsyncStorage has finished reading for THIS farm
    if (vintageLoadedForFarmId !== currentFarm?.id) return;
    // Only proceed once records are confirmed from a successful fetch for THIS farm
    if (recordsFarmId !== currentFarm?.id) return;
    if (vintages.length === 0) return;
    // Already resolved for this farm — don't override manual selections mid-session
    if (resolvedForFarm.current === currentFarm?.id) return;
    resolvedForFarm.current = currentFarm?.id;
    if (selectedVintage === null) {
      // Explicit "All vintages" stored — nothing to change
      return;
    }
    if (selectedVintage !== undefined && vintages.includes(selectedVintage)) {
      // Stored vintage year is still available — keep it
      return;
    }
    // No preference (undefined) or stored year has no data — default to most recent
    setSelectedVintage(vintages[0]);
  }, [vintageLoadedForFarmId, recordsFarmId, vintages, selectedVintage, setSelectedVintage, currentFarm?.id]);

  // Coerce undefined (loading / pre-resolution) to null so filtering always works.
  // After the resolution effect above fires, selectedVintage is always null | number.
  const displayVintage = selectedVintage ?? null;

  // Records for the selected vintage (all vintages if null)
  const vintageRecords = useMemo(() => {
    if (displayVintage === null) return displayRecords;
    return displayRecords.filter(r => r.vintageYear === displayVintage);
  }, [displayRecords, displayVintage]);

  // Blocks that have at least one record — used to populate the block filter chips
  const recordBlockIds = useMemo(() => {
    const ids = new Set<number>();
    for (const r of displayRecords) {
      if (r.blockId != null) ids.add(r.blockId);
    }
    return ids;
  }, [displayRecords]);

  const filterBlocks = useMemo(
    () => blocks.filter(b => recordBlockIds.has(b.id)),
    [blocks, recordBlockIds],
  );

  // Block-filtered records (applied before free-text search)
  const blockFilteredRecords = useMemo(() => {
    if (selectedBlockIds.length === 0) return vintageRecords;
    const idSet = new Set(selectedBlockIds);
    return vintageRecords.filter(r => r.blockId != null && idSet.has(r.blockId));
  }, [vintageRecords, selectedBlockIds]);

  const filtered = useMemo(() => {
    if (!search.trim()) return blockFilteredRecords;
    const q = search.toLowerCase();
    return blockFilteredRecords.filter(r =>
      (r.blockName ?? "").toLowerCase().includes(q) ||
      (r.operatorName ?? "").toLowerCase().includes(q) ||
      (r.harvestDate ?? "").includes(q) ||
      String(r.vintageYear ?? "").includes(q),
    );
  }, [blockFilteredRecords, search]);

  // Offline pending records that match the current vintage filter
  const offlinePendingForVintage = useMemo(() => {
    if (offlinePending.length === 0) return [];
    if (displayVintage === null) return offlinePending;
    return offlinePending.filter(r => r.vintageYear === displayVintage);
  }, [offlinePending, displayVintage]);

  // Farm-wide totals for the selected vintage (server + offline pending merged)
  const totals = useMemo(() => {
    const blockAreaMap = new Map<number, number>();
    for (const b of blocks) {
      if (b.id != null && b.areaHa != null) blockAreaMap.set(b.id, Number(b.areaHa));
    }
    let totalKg = 0;
    let yieldKgForArea = 0;
    let totalAreaHa = 0;
    let brixSum = 0; let brixCount = 0;
    let phSum = 0;   let phCount = 0;
    let taSum = 0;   let taCount = 0;
    let paSum = 0;   let paCount = 0;
    const seenBlockIds = new Set<number>();

    for (const r of vintageRecords) {
      if (r.yieldKg != null) {
        totalKg += Number(r.yieldKg);
        if (r.blockId != null) {
          const area = blockAreaMap.get(r.blockId);
          if (area != null && area > 0) {
            yieldKgForArea += Number(r.yieldKg);
            // Only count each block's area once regardless of how many picks it has
            if (!seenBlockIds.has(r.blockId)) {
              seenBlockIds.add(r.blockId);
              totalAreaHa += area;
            }
          }
        }
      }
      if (r.brix != null)               { brixSum += Number(r.brix);                 brixCount++; }
      if (r.ph != null)                  { phSum   += Number(r.ph);                   phCount++;   }
      if (r.titratableAcidityGl != null) { taSum   += Number(r.titratableAcidityGl); taCount++;   }
      if (r.potentialAlcohol != null)    { paSum   += Number(r.potentialAlcohol);     paCount++;   }
    }

    // Merge offline pending records into totals
    for (const r of offlinePendingForVintage) {
      if (r.yieldKg != null) {
        totalKg += Number(r.yieldKg);
        if (r.blockId != null) {
          const area = blockAreaMap.get(r.blockId);
          if (area != null && area > 0) {
            yieldKgForArea += Number(r.yieldKg);
            if (!seenBlockIds.has(r.blockId)) {
              seenBlockIds.add(r.blockId);
              totalAreaHa += area;
            }
          }
        }
      }
      if (r.brix != null)               { brixSum += Number(r.brix);                 brixCount++; }
      if (r.ph != null)                  { phSum   += Number(r.ph);                   phCount++;   }
      if (r.titratableAcidityGl != null) { taSum   += Number(r.titratableAcidityGl); taCount++;   }
      if (r.potentialAlcohol != null)    { paSum   += Number(r.potentialAlcohol);     paCount++;   }
    }

    const weightedTonnesPerHa = totalAreaHa > 0 ? (yieldKgForArea / 1000) / totalAreaHa : null;
    const avgBrix    = brixCount > 0 ? brixSum / brixCount : null;
    const avgPh      = phCount   > 0 ? phSum   / phCount   : null;
    const avgTa      = taCount   > 0 ? taSum   / taCount   : null;
    const avgPotAlc  = paCount   > 0 ? paSum   / paCount   : null;
    // True when at least one record is linked to a block whose area is absent or
    // non-positive — i.e. the grower needs to set block area for t/ha to appear.
    const hasBlockWithMissingArea = vintageRecords.some(r => {
      if (r.blockId == null) return false;
      const area = blockAreaMap.get(r.blockId);
      return area == null || area <= 0;
    });
    const hasUnsynced = offlinePendingForVintage.length > 0;
    return {
      totalKg,
      weightedTonnesPerHa,
      avgBrix,
      avgPh,
      avgTa,
      avgPotAlc,
      count: vintageRecords.length + offlinePendingForVintage.length,
      hasBlockWithMissingArea,
      hasUnsynced,
    };
  }, [vintageRecords, blocks, offlinePendingForVintage]);

  // ── Yield by Variety summary (requires ≥2 distinct named varieties) ──────────
  const varietySummaryData = useMemo(() => {
    const UNKNOWN_KEY = "Unknown / Not linked";
    const avg = (vals: number[]) => vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    const blockAreaMap = new Map<number, number>();
    const blockVarietyMap = new Map<number, string>();
    for (const b of blocks) {
      if (b.id != null) {
        if (b.areaHa != null) blockAreaMap.set(b.id, Number(b.areaHa));
        blockVarietyMap.set(b.id, String(b.variety ?? "").trim());
      }
    }
    const varietyMap: Record<string, { totalKg: number; totalHa: number; seenBlockIds: Set<number>; brixVals: number[] }> = {};
    for (const r of vintageRecords) {
      const variety = r.blockId != null ? (blockVarietyMap.get(r.blockId) ?? "") : "";
      const key = variety || UNKNOWN_KEY;
      if (!varietyMap[key]) varietyMap[key] = { totalKg: 0, totalHa: 0, seenBlockIds: new Set(), brixVals: [] };
      const entry = varietyMap[key];
      entry.totalKg += parseFloat(String(r.yieldKg ?? 0)) || 0;
      if (r.blockId != null && !entry.seenBlockIds.has(r.blockId)) {
        entry.seenBlockIds.add(r.blockId);
        const ha = blockAreaMap.get(r.blockId);
        if (ha != null && ha > 0) entry.totalHa += ha;
      }
      const brix = parseFloat(String(r.brix ?? ""));
      if (!isNaN(brix)) entry.brixVals.push(brix);
    }
    const namedKeys = Object.keys(varietyMap).filter(k => k !== UNKNOWN_KEY);
    if (namedKeys.length < 2) return null;

    const rows = Object.entries(varietyMap)
      .sort(([a], [b]) => {
        if (a === UNKNOWN_KEY) return 1;
        if (b === UNKNOWN_KEY) return -1;
        return a.localeCompare(b);
      })
      .map(([variety, e]) => ({
        variety,
        totalKg: e.totalKg,
        kgPerHa: e.totalHa > 0 && e.totalKg > 0 ? e.totalKg / e.totalHa : null,
        avgBrix: avg(e.brixVals),
      }));

    const grandKg = rows.reduce((s, r) => s + r.totalKg, 0);
    return { rows, grandKg };
  }, [vintageRecords, blocks]);

  // Sorted variety rows (local sort, no persistence)
  const sortedVarietyRows = useMemo(() => {
    if (!varietySummaryData) return [];
    const UNKNOWN_KEY = "Unknown / Not linked";
    return [...varietySummaryData.rows].sort((a, b) => {
      if (a.variety === UNKNOWN_KEY) return 1;
      if (b.variety === UNKNOWN_KEY) return -1;
      const d = varietySort.dir === "asc" ? 1 : -1;
      switch (varietySort.col) {
        case "variety":  return d * a.variety.localeCompare(b.variety);
        case "totalKg":  return d * (a.totalKg - b.totalKg);
        case "kgPerHa":  return d * ((a.kgPerHa ?? (d > 0 ? Infinity : -Infinity)) - (b.kgPerHa ?? (d > 0 ? Infinity : -Infinity)));
        case "avgBrix":  return d * ((a.avgBrix ?? (d > 0 ? Infinity : -Infinity)) - (b.avgBrix ?? (d > 0 ? Infinity : -Infinity)));
        default: return 0;
      }
    });
  }, [varietySummaryData, varietySort]);

  const toggleVarietySort = useCallback((col: "variety" | "totalKg" | "kgPerHa" | "avgBrix") => {
    setVarietySort(prev =>
      prev.col === col
        ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { col, dir: col === "variety" ? "asc" : "desc" },
    );
  }, []);

  const unlinkedCount = useMemo(() => displayRecords.filter(r => !r.blockId).length, [displayRecords]);

  const handleSaved = useCallback((recordId: number, updated: Partial<HarvestRecord>) => {
    setLocalUpdates(prev => ({ ...prev, [recordId]: { ...(prev[recordId] ?? {}), ...updated } }));
    setEditingRecord(null);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    setDeletedIds(prev => new Set(prev).add(id));
    try {
      const res = await apiFetch(`/api/farms/${currentFarm?.id}/vineyard-harvest/${id}`, { method: "DELETE" });
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
        <Text style={styles.title}>Harvest History</Text>
      </View>

      <IdentifierBanner
        justSaved={justSaved && !identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={false}
        sbiMissing={false}
        warningMessage={`${missingAddressFields.join(" and ")} ${missingAddressFields.length === 1 ? "is" : "are"} missing from your farm profile.`}
      />

      {/* Vintage filter chips */}
      {vintages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.vintageScroll}
          contentContainerStyle={styles.vintageScrollContent}
        >
          <Pressable
            style={[styles.vintageChip, displayVintage === null && styles.vintageChipActive]}
            onPress={() => setSelectedVintage(null)}
          >
            <Text style={[styles.vintageChipText, displayVintage === null && styles.vintageChipTextActive]}>
              All
            </Text>
          </Pressable>
          {vintages.map(y => (
            <Pressable
              key={y}
              style={[styles.vintageChip, displayVintage === y && styles.vintageChipActive]}
              onPress={() => setSelectedVintage(y)}
            >
              <Text style={[styles.vintageChipText, displayVintage === y && styles.vintageChipTextActive]}>
                {y}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Block filter chips */}
      {filterBlocks.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.blockFilterScroll}
          contentContainerStyle={styles.blockFilterScrollContent}
        >
          <Pressable
            style={[styles.blockChip, selectedBlockIds.length === 0 && styles.blockChipActive]}
            onPress={() => { Haptics.selectionAsync(); setSelectedBlockIds([]); }}
          >
            <Text style={[styles.blockChipText, selectedBlockIds.length === 0 && styles.blockChipTextActive]}>
              Show all
            </Text>
          </Pressable>
          {filterBlocks.length > 1 && (
            <Pressable
              style={styles.blockChip}
              onPress={() => {
                Haptics.selectionAsync();
                // Pick the first block that has records in the current vintage
                // view so the chart is never left empty after tapping.
                const firstInVintage = vintageRecords.find(r => r.blockId != null)?.blockId;
                setSelectedBlockIds([firstInVintage ?? filterBlocks[0].id]);
              }}
            >
              <Text style={styles.blockChipText}>Select none</Text>
            </Pressable>
          )}
          {filterBlocks.map(b => {
            const active = selectedBlockIds.includes(b.id);
            return (
              <Pressable
                key={b.id}
                style={[styles.blockChip, active && styles.blockChipActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setSelectedBlockIds(
                    active
                      ? selectedBlockIds.filter(id => id !== b.id)
                      : [...selectedBlockIds, b.id],
                  );
                }}
              >
                <Text style={[styles.blockChipText, active && styles.blockChipTextActive]}>
                  {b.blockName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Farm-wide totals summary card */}
      {!loading && !error && totals.count > 0 && (
        <View style={styles.totalsCard}>
          <Text style={styles.totalsLabel}>
            {displayVintage != null ? `${displayVintage} Vintage` : "All Vintages"} · {totals.count} record{totals.count !== 1 ? "s" : ""}
          </Text>
          <View style={styles.totalsRow}>
            <View style={styles.totalsStat}>
              <Text style={styles.totalsValue}>
                {totals.totalKg >= 1000
                  ? `${(totals.totalKg / 1000).toFixed(2)} t`
                  : `${totals.totalKg.toFixed(0)} kg`}
              </Text>
              <Text style={styles.totalsStatLabel}>Total Yield</Text>
            </View>
            <View style={styles.totalsDivider} />
            <View style={styles.totalsStat}>
              <Text style={styles.totalsValue}>
                {totals.weightedTonnesPerHa != null ? `${totals.weightedTonnesPerHa.toFixed(2)}` : "—"}
              </Text>
              <Text style={styles.totalsStatLabel}>t / ha</Text>
              {totals.weightedTonnesPerHa == null && totals.hasBlockWithMissingArea && (
                <Pressable
                  onPress={() =>
                    Alert.alert(
                      "Block area not set",
                      "t/ha is calculated from each block's area. Open Vineyard Blocks and enter the area (ha) for each block to see this figure.",
                      [{ text: "OK" }],
                    )
                  }
                  hitSlop={8}
                >
                  <Text style={styles.totalsHint}>Set block area to calculate</Text>
                </Pressable>
              )}
            </View>
            <View style={styles.totalsDivider} />
            <View style={styles.totalsStat}>
              <Text style={styles.totalsValue}>
                {totals.avgBrix != null ? `${totals.avgBrix.toFixed(1)}°` : "—"}
              </Text>
              <Text style={styles.totalsStatLabel}>Avg Brix</Text>
            </View>
          </View>
          {totals.hasUnsynced && (
            <View style={styles.unsyncedNote}>
              <Feather name="cloud-off" size={11} color={colors.textSecondary} />
              <Text style={styles.unsyncedNoteText}>
                Includes {offlinePendingForVintage.length} unsynced record{offlinePendingForVintage.length !== 1 ? "s" : ""} — totals may update once connected
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Yield by Variety table — shown when ≥2 distinct named varieties */}
      {!loading && !error && varietySummaryData && (
        <View style={styles.varietyCard}>
          {/* Collapsible header */}
          <Pressable
            style={styles.varietyHeader}
            onPress={() => { Haptics.selectionAsync(); setVarietyTableOpen(o => !o); }}
          >
            <Feather name="bar-chart-2" size={14} color={colors.textSecondary} />
            <Text style={styles.varietyHeaderText}>Yield by Variety</Text>
            <Feather
              name={varietyTableOpen ? "chevron-down" : "chevron-right"}
              size={14}
              color={colors.textSecondary}
            />
          </Pressable>

          {varietyTableOpen && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Column headers */}
                <View style={[styles.varietyRow, styles.varietyHeaderRow]}>
                  {(
                    [
                      { col: "variety",  label: "Variety",    flex: 1, align: "left"  },
                      { col: "totalKg",  label: "Total kg",   width: 80, align: "right" },
                      { col: "kgPerHa",  label: "t / ha",     width: 72, align: "right" },
                      { col: "avgBrix",  label: "Avg Brix°",  width: 72, align: "right" },
                    ] as { col: "variety" | "totalKg" | "kgPerHa" | "avgBrix"; label: string; flex?: number; width?: number; align: "left" | "right" }[]
                  ).map(({ col, label, flex, width, align }) => {
                    const active = varietySort.col === col;
                    const icon = !active ? "minus" : varietySort.dir === "asc" ? "arrow-up" : "arrow-down";
                    return (
                      <Pressable
                        key={col}
                        style={[
                          styles.varietyHeaderCell,
                          flex != null ? { flex } : { width },
                          align === "right" && { alignItems: "flex-end" },
                        ]}
                        onPress={() => { Haptics.selectionAsync(); toggleVarietySort(col); }}
                        hitSlop={6}
                      >
                        <View style={styles.varietyHeaderCellInner}>
                          {align === "right" && (
                            <Feather
                              name={icon}
                              size={9}
                              color={active ? colors.primary : colors.textSecondary}
                              style={{ opacity: active ? 1 : 0.4 }}
                            />
                          )}
                          <Text style={[styles.varietyHeaderLabel, active && styles.varietyHeaderLabelActive]}>
                            {label}
                          </Text>
                          {align === "left" && (
                            <Feather
                              name={icon}
                              size={9}
                              color={active ? colors.primary : colors.textSecondary}
                              style={{ opacity: active ? 1 : 0.4 }}
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Data rows */}
                {sortedVarietyRows.map((row, i) => (
                  <View
                    key={row.variety}
                    style={[styles.varietyRow, styles.varietyDataRow, i < sortedVarietyRows.length - 1 && styles.varietyDataRowBorder]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.varietyName} numberOfLines={1}>{row.variety}</Text>
                    </View>
                    <View style={{ width: 80, alignItems: "flex-end" }}>
                      <Text style={styles.varietyValue}>
                        {row.totalKg > 0 ? row.totalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : "—"}
                      </Text>
                    </View>
                    <View style={{ width: 72, alignItems: "flex-end" }}>
                      <Text style={styles.varietyValue}>
                        {row.kgPerHa != null ? (row.kgPerHa / 1000).toFixed(2) : "—"}
                      </Text>
                    </View>
                    <View style={{ width: 72, alignItems: "flex-end" }}>
                      <Text style={styles.varietyValue}>
                        {row.avgBrix != null ? row.avgBrix.toFixed(1) : "—"}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Grand total footer */}
                <View style={[styles.varietyRow, styles.varietyFooterRow]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.varietyFooterLabel}>Total</Text>
                  </View>
                  <View style={{ width: 80, alignItems: "flex-end" }}>
                    <Text style={styles.varietyFooterValue}>
                      {varietySummaryData.grandKg > 0
                        ? varietySummaryData.grandKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })
                        : "—"}
                    </Text>
                  </View>
                  <View style={{ width: 72 }} />
                  <View style={{ width: 72 }} />
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {/* Must Chemistry summary card */}
      {!loading && !error && totals.count > 0 &&
        (totals.avgBrix != null || totals.avgPh != null || totals.avgTa != null || totals.avgPotAlc != null) && (
        <View style={styles.chemCard}>
          <Text style={styles.chemCardLabel}>Must Chemistry</Text>
          <View style={styles.chemGrid}>
            <View style={styles.chemStat}>
              <Text style={styles.chemValue}>
                {totals.avgBrix != null ? `${totals.avgBrix.toFixed(1)}°` : "—"}
              </Text>
              <Text style={styles.chemStatLabel}>Avg Brix °</Text>
            </View>
            <View style={styles.chemStat}>
              <Text style={styles.chemValue}>
                {totals.avgPh != null ? totals.avgPh.toFixed(2) : "—"}
              </Text>
              <Text style={styles.chemStatLabel}>Avg pH</Text>
            </View>
            <View style={styles.chemStat}>
              <Text style={[styles.chemValue, styles.chemValueTa]}>
                {totals.avgTa != null ? totals.avgTa.toFixed(2) : "—"}
              </Text>
              <Text style={styles.chemStatLabel}>Avg TA (g/L)</Text>
            </View>
            <View style={styles.chemStat}>
              <Text style={styles.chemValue}>
                {totals.avgPotAlc != null ? `${totals.avgPotAlc.toFixed(1)}%` : "—"}
              </Text>
              <Text style={styles.chemStatLabel}>Avg Pot. Alc %</Text>
            </View>
          </View>
        </View>
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
          placeholder="Search by block, operator or date…"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

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
          renderItem={({ item }) => {
            const areaHa = item.blockId != null
              ? blocks.find(b => b.id === item.blockId)?.areaHa ?? null
              : null;
            return (
              <HarvestRow
                item={item}
                blockAreaHa={typeof areaHa === "number" ? areaHa : null}
                onEdit={setEditingRecord}
                onDelete={handleDelete}
              />
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="eye-off" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No harvest records</Text>
              <Text style={styles.emptyText}>
                {search.trim() ? "No records match your search." : "Harvest records you create will appear here."}
              </Text>
            </View>
          }
        />
      )}

      <EditHarvestModal
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
  summaryBadge: {
    backgroundColor: "#f0fdf4",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 2,
  },
  summaryLine: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text },
  summaryBold: { fontFamily: fonts.semiBold },
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
  // Vintage filter chips
  vintageScroll: { flexGrow: 0 },
  vintageScrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
    flexDirection: "row",
  },
  vintageChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vintageChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  vintageChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  vintageChipTextActive: {
    color: "#ffffff",
  },
  // Block filter chips
  blockFilterScroll: { flexGrow: 0 },
  blockFilterScrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
    flexDirection: "row",
  },
  blockChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  blockChipActive: {
    backgroundColor: "#ede9fe",
    borderColor: colors.primary,
  },
  blockChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  blockChipTextActive: {
    color: colors.primary,
  },
  // Totals card
  totalsCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  totalsLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  totalsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalsStat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  totalsValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  totalsStatLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  totalsHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.primary,
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: 2,
  },
  totalsDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  unsyncedNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  unsyncedNoteText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
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
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs },
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
  // Yield by Variety table
  varietyCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  varietyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  varietyHeaderText: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  varietyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  varietyHeaderRow: {
    paddingVertical: spacing.xs,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  varietyDataRow: {
    paddingVertical: spacing.sm,
  },
  varietyDataRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  varietyFooterRow: {
    paddingVertical: spacing.sm,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  varietyHeaderCell: {
    paddingVertical: 2,
  },
  varietyHeaderCellInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  varietyHeaderLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  varietyHeaderLabelActive: {
    color: colors.primary,
  },
  varietyName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  varietyValue: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  varietyFooterLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  varietyFooterValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  // Must Chemistry card
  chemCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  chemCardLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  chemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chemStat: {
    width: "50%",
    alignItems: "center",
    paddingVertical: spacing.xs,
    gap: 2,
  },
  chemValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  chemValueTa: {
    color: "#ef4444",
  },
  chemStatLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
