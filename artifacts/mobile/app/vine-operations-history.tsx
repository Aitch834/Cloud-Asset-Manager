import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { apiFetch } from "@/lib/apiFetch";
import { usePrint } from "@/lib/hooks/usePrint";
import { vineOperationsHtml, type VineOperationsRow } from "@/lib/printTemplates";

interface OperationRecord {
  id: number;
  operationDate: string | null;
  blockId: number | null;
  blockName: string | null;
  operationType: string | null;
  pruningSystem: string | null;
  budsPerVineTarget: number | null;
  budsPerVineActual: number | null;
  pruningWeightKgPerVine: number | null;
  operatorName: string | null;
  hoursWorked: number | null;
  notes: string | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Normalise a grower-typed date to YYYY-MM-DD.
 * Accepts: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY.
 * Returns null when blank, still being typed, unparseable, or an impossible
 * calendar date (e.g. 31 Feb or 30 Feb).
 */
function canonicaliseDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  let y: string, m: string, d: string;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    [y, m, d] = s.split("-") as [string, string, string];
  } else {
    const dmy = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/.exec(s);
    if (!dmy) return null;
    d = dmy[1]!; m = dmy[2]!; y = dmy[3]!;
  }
  // Reject impossible calendar dates (e.g. 31 Feb, 30 Feb) by round-trip check
  const date = new Date(`${y}-${m}-${d}`);
  if (
    isNaN(date.getTime()) ||
    date.getUTCFullYear() !== parseInt(y, 10) ||
    date.getUTCMonth() + 1 !== parseInt(m, 10) ||
    date.getUTCDate() !== parseInt(d, 10)
  ) {
    return null;
  }
  return `${y}-${m}-${d}`;
}

// ─── Operation type / pruning constants ──────────────────────────────────────

const OPERATION_TYPES = [
  { key: "Winter Pruning", icon: "scissors" as const, group: "Pruning" },
  { key: "Spur Thinning", icon: "git-branch" as const, group: "Pruning" },
  { key: "Cane Laying / Tie Down", icon: "link" as const, group: "Pruning" },
  { key: "Bud Rubbing", icon: "circle" as const, group: "Spring" },
  { key: "Shoot Thinning", icon: "sliders" as const, group: "Spring" },
  { key: "Wire Lifting", icon: "arrow-up" as const, group: "Canopy" },
  { key: "Leaf Removal", icon: "wind" as const, group: "Canopy" },
  { key: "Topping / Hedging", icon: "minus-square" as const, group: "Canopy" },
  { key: "Green Harvest (Crop Thinning)", icon: "scissors" as const, group: "Summer" },
  { key: "Soil Cultivation", icon: "layers" as const, group: "Soil" },
  { key: "Mulching", icon: "box" as const, group: "Soil" },
  { key: "Other", icon: "more-horizontal" as const, group: "Other" },
];

const PRUNING_SYSTEMS = ["Double Guyot", "Single Guyot", "Cordon Spur", "Scott Henry", "Cane Replacement", "Other"];
const PRUNING_TYPES = ["Winter Pruning", "Spur Thinning", "Cane Laying / Tie Down"];

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditOperationModal({
  visible,
  record,
  farmId,
  blocks,
  blocksLoading,
  onClose,
  onSaved,
}: {
  visible: boolean;
  record: OperationRecord | null;
  farmId: string;
  blocks: VineBlock[];
  blocksLoading: boolean;
  onClose: () => void;
  onSaved: (recordId: number, updated: Partial<OperationRecord>) => void;
}) {
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [operationDate, setOperationDate] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [notes, setNotes] = useState("");
  const [operationType, setOperationType] = useState<string | null>(null);
  const [pruningSystem, setPruningSystem] = useState<string | null>(null);
  const [budsPerVineTarget, setBudsPerVineTarget] = useState("");
  const [budsPerVineActual, setBudsPerVineActual] = useState("");
  const [pruningWeightKg, setPruningWeightKg] = useState("");
  const [hoursWorked, setHoursWorked] = useState("");
  const [saving, setSaving] = useState(false);

  const isPruning = operationType !== null && PRUNING_TYPES.includes(operationType);

  React.useEffect(() => {
    if (visible && record) {
      setSaving(false);
      setOperationDate(record.operationDate ?? "");
      setOperatorName(record.operatorName ?? "");
      setNotes(record.notes ?? "");
      setOperationType(record.operationType ?? null);
      setPruningSystem(record.pruningSystem ?? null);
      setBudsPerVineTarget(record.budsPerVineTarget != null ? String(record.budsPerVineTarget) : "");
      setBudsPerVineActual(record.budsPerVineActual != null ? String(record.budsPerVineActual) : "");
      setPruningWeightKg(record.pruningWeightKgPerVine != null ? String(record.pruningWeightKgPerVine) : "");
      setHoursWorked(record.hoursWorked != null ? String(record.hoursWorked) : "");
      setSelectedBlock(record.blockId ? (blocks.find(b => b.id === record.blockId) ?? null) : null);
    }
  }, [visible, record, blocks]);

  const handleSave = async () => {
    if (!record) return;
    setSaving(true);
    try {
      const body: Partial<OperationRecord> & { blockId: number | null; blockName: string | null } = {
        operationDate: operationDate || null,
        operatorName: operatorName.trim() || null,
        notes: notes.trim() || null,
        blockId: selectedBlock?.id ?? null,
        blockName: selectedBlock?.blockName ?? null,
        operationType: operationType || null,
        pruningSystem: isPruning && pruningSystem ? pruningSystem : null,
        budsPerVineTarget: isPruning && budsPerVineTarget ? Number(budsPerVineTarget) : null,
        budsPerVineActual: isPruning && budsPerVineActual ? Number(budsPerVineActual) : null,
        pruningWeightKgPerVine: isPruning && pruningWeightKg ? Number(pruningWeightKg) : null,
        hoursWorked: hoursWorked ? Number(hoursWorked) : null,
      };
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-operations/${record.id}`, {
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
      setSaving(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSaved(record.id, body);
    } catch {
      Alert.alert("Save Failed", "Could not reach the server. Please try again.");
      setSaving(false);
    }
  };

  const opTypeGroups = useMemo(() => {
    return OPERATION_TYPES.reduce<Record<string, typeof OPERATION_TYPES>>((acc, op) => {
      if (!acc[op.group]) acc[op.group] = [];
      acc[op.group]!.push(op);
      return acc;
    }, {});
  }, []);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={editStyles.container}>
          <View style={editStyles.header}>
            <Text style={editStyles.title}>Edit Operation Record</Text>
            <Pressable onPress={onClose} style={editStyles.closeBtn} hitSlop={12}>
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={editStyles.scroll} contentContainerStyle={editStyles.scrollContent} keyboardShouldPersistTaps="handled">

            {/* Operation Type */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Operation Type</Text>
              {Object.entries(opTypeGroups).map(([group, ops]) => (
                <View key={group} style={editStyles.opGroup}>
                  <Text style={editStyles.opGroupLabel}>{group}</Text>
                  <View style={editStyles.opGroupChips}>
                    {ops.map(op => (
                      <Pressable
                        key={op.key}
                        style={[editStyles.typeChip, operationType === op.key && editStyles.typeChipSelected]}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setOperationType(operationType === op.key ? null : op.key);
                          if (!PRUNING_TYPES.includes(op.key)) {
                            setPruningSystem(null);
                            setBudsPerVineTarget("");
                            setBudsPerVineActual("");
                            setPruningWeightKg("");
                          }
                        }}
                      >
                        <Feather
                          name={op.icon}
                          size={13}
                          color={operationType === op.key ? colors.primary : colors.textSecondary}
                        />
                        <Text style={[editStyles.typeChipText, operationType === op.key && editStyles.typeChipTextSelected]}>
                          {op.key}
                        </Text>
                        {operationType === op.key && (
                          <Feather name="check" size={12} color={colors.primary} />
                        )}
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Pruning details — shown only for pruning operation types */}
            {isPruning && (
              <View style={editStyles.card}>
                <Text style={editStyles.sectionTitle}>Pruning Details</Text>

                <Text style={editStyles.fieldLabel}>Pruning System</Text>
                <View style={editStyles.chipRow}>
                  {PRUNING_SYSTEMS.map(s => (
                    <Pressable
                      key={s}
                      style={[editStyles.chip, pruningSystem === s && editStyles.chipSelected]}
                      onPress={() => { Haptics.selectionAsync(); setPruningSystem(pruningSystem === s ? null : s); }}
                    >
                      <Text style={[editStyles.chipText, pruningSystem === s && editStyles.chipTextSelected]}>{s}</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={editStyles.twoCol}>
                  <View style={editStyles.twoColField}>
                    <Text style={editStyles.fieldLabel}>Target Buds/Vine</Text>
                    <Input
                      placeholder="e.g. 8"
                      value={budsPerVineTarget}
                      onChangeText={setBudsPerVineTarget}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={editStyles.twoColField}>
                    <Text style={editStyles.fieldLabel}>Actual Buds/Vine</Text>
                    <Input
                      placeholder="e.g. 7"
                      value={budsPerVineActual}
                      onChangeText={setBudsPerVineActual}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <Text style={editStyles.fieldLabel}>Pruning Weight (kg/vine)</Text>
                <Input
                  placeholder="e.g. 0.45"
                  value={pruningWeightKg}
                  onChangeText={setPruningWeightKg}
                  keyboardType="decimal-pad"
                />
              </View>
            )}

            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Record Details</Text>

              <Text style={editStyles.fieldLabel}>Hours Worked</Text>
              <Input
                placeholder="e.g. 6.5"
                value={hoursWorked}
                onChangeText={setHoursWorked}
                keyboardType="decimal-pad"
              />

              <Text style={editStyles.fieldLabel}>Operation Date</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={operationDate}
                onChangeText={setOperationDate}
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

function OperationRow({
  item,
  onEdit,
  onDelete,
}: {
  item: OperationRecord;
  onEdit: (record: OperationRecord) => void;
  onDelete: (id: number) => void;
}) {
  const linked = !!item.blockId;

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Operation Record",
      `Delete the operation record from ${formatDate(item.operationDate)}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) },
      ],
    );
  };

  return (
    <Pressable style={styles.row} onPress={() => { Haptics.selectionAsync(); onEdit(item); }}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowDate}>{formatDate(item.operationDate)}</Text>
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
          {item.operationType ? (
            <Text style={styles.rowSub} numberOfLines={1}>{item.operationType}</Text>
          ) : null}
          {item.operatorName ? (
            <Text style={styles.rowSub} numberOfLines={1}>{item.operatorName}</Text>
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

export default function VineOperationsHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { records, loading, refreshing, error, refresh } = useApiFetch<OperationRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/vineyard-operations",
  );
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editingRecord, setEditingRecord] = useState<OperationRecord | null>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<number, Partial<OperationRecord>>>({});
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState(false);

  const { savePdf } = usePrint();

  const canonFrom = useMemo(() => canonicaliseDate(dateFrom), [dateFrom]);
  const canonTo = useMemo(() => canonicaliseDate(dateTo), [dateTo]);
  const dateFromInvalid = dateFrom.trim().length >= 8 && canonFrom === null;
  const dateToInvalid = dateTo.trim().length >= 8 && canonTo === null;
  const dateRangeReversed = canonFrom !== null && canonTo !== null && canonFrom > canonTo;

  const displayRecords = useMemo(() => {
    return records
      .filter(r => !deletedIds.has(r.id))
      .map(r => {
        const update = localUpdates[r.id];
        return update !== undefined ? { ...r, ...update } : r;
      });
  }, [records, localUpdates, deletedIds]);

  const filtered = useMemo(() => {
    let result = displayRecords;
    if (canonFrom) result = result.filter(r => r.operationDate && r.operationDate >= canonFrom);
    if (canonTo) result = result.filter(r => r.operationDate && r.operationDate <= canonTo);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        (r.blockName ?? "").toLowerCase().includes(q) ||
        (r.operatorName ?? "").toLowerCase().includes(q) ||
        (r.operationDate ?? "").includes(q) ||
        (r.operationType ?? "").toLowerCase().includes(q),
      );
    }
    return result;
  }, [displayRecords, search, canonFrom, canonTo]);

  const handleExport = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const rows: VineOperationsRow[] = filtered.map(r => ({
        id: r.id,
        operationDate: r.operationDate,
        blockName: r.blockName,
        operationType: r.operationType,
        operatorName: r.operatorName,
        hoursWorked: r.hoursWorked,
        notes: r.notes,
      }));
      const html = vineOperationsHtml(
        rows,
        currentFarm?.name ?? null,
        canonFrom ?? undefined,
        canonTo ?? undefined,
      );
      await savePdf(html, "Vine Operations History");
    } catch {
      Alert.alert("Export Failed", "Could not generate the operations report. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [exporting, filtered, currentFarm?.name, canonFrom, canonTo, savePdf]);

  const unlinkedCount = useMemo(() => displayRecords.filter(r => !r.blockId).length, [displayRecords]);

  const handleSaved = useCallback((recordId: number, updated: Partial<OperationRecord>) => {
    setLocalUpdates(prev => ({ ...prev, [recordId]: { ...(prev[recordId] ?? {}), ...updated } }));
    setEditingRecord(null);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    setDeletedIds(prev => new Set(prev).add(id));
    try {
      const res = await apiFetch(`/api/farms/${currentFarm?.id}/vineyard-operations/${id}`, { method: "DELETE" });
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
        <Text style={styles.title}>Operations History</Text>
        <Pressable
          onPress={handleExport}
          disabled={exporting || filtered.length === 0}
          style={[styles.exportBtn, (exporting || filtered.length === 0) && styles.exportBtnDisabled]}
          hitSlop={8}
        >
          {exporting
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Feather name="share" size={18} color={filtered.length === 0 ? colors.textSecondary : colors.primary} />
          }
          <Text style={[styles.exportBtnText, filtered.length === 0 && styles.exportBtnTextDisabled]}>
            {exporting ? "Exporting…" : "Export"}
          </Text>
        </Pressable>
        <Pressable
          style={styles.addBtn}
          onPress={() => router.push("/vine-operation")}
          hitSlop={12}
        >
          <Feather name="plus" size={20} color={colors.primary} />
        </Pressable>
      </View>

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
          placeholder="Search by block, type or operator…"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

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
              onChangeText={setDateFrom}
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
              onChangeText={setDateTo}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
        </View>
        {(dateFrom.trim() || dateTo.trim()) ? (
          <Pressable
            onPress={() => { setDateFrom(""); setDateTo(""); }}
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
            <OperationRow item={item} onEdit={setEditingRecord} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="scissors" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No operation records</Text>
              <Text style={styles.emptyText}>
                {search.trim() || dateFrom.trim() || dateTo.trim()
                  ? "No records match the current filters."
                  : "Vineyard operation records you create will appear here."}
              </Text>
            </View>
          }
        />
      )}

      <EditOperationModal
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
  // Operation type chip grid
  opGroup: { gap: 4 },
  opGroupLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  opGroupChips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  typeChipSelected: {
    borderColor: colors.primary,
    backgroundColor: "#ede9fe",
  },
  typeChipText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  typeChipTextSelected: {
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  // Pruning system chip row
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: "#ede9fe",
  },
  chipText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.text },
  chipTextSelected: { fontFamily: fonts.medium, color: colors.primary },
  // Two-column numeric inputs
  twoCol: { flexDirection: "row", gap: spacing.sm },
  twoColField: { flex: 1 },
  // Block link
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
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  exportBtnDisabled: {
    borderColor: colors.border,
  },
  exportBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  exportBtnTextDisabled: {
    color: colors.textSecondary,
  },
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
