import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useState, useMemo, useCallback, useEffect } from "react";
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
import * as FileSystem from "expo-file-system/legacy";
import { apiFetch } from "@/lib/apiFetch";
import { openExternalUrl } from "@/utils/openExternalUrl";
import { getItem, getList, setItem } from "@/lib/storage";
import { usePersistedVarietySort } from "@/lib/hooks/usePersistedVarietySort";
import { usePersistedVarietyColumns } from "@/lib/hooks/usePersistedVarietyColumns";
import type { VarietyColsVisibility } from "@/lib/hooks/usePersistedVarietyColumns";
import { vineyardCountEvents } from "@/lib/vineyardCountEvents";
import { subscribe } from "@/lib/sync-engine";

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
  harvestMethod?: string;
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

type HarvestListItem = HarvestRecord | OfflineHarvestEntry;

type YieldCrossTabSort = {
  col: string;
  dir: "asc" | "desc";
} | null;

function isPendingHarvest(item: HarvestListItem): item is OfflineHarvestEntry {
  return "_pendingSync" in item && item._pendingSync === true;
}

function harvestDateTimestamp(item: HarvestListItem): number {
  if (!item.harvestDate) return 0;
  const timestamp = new Date(item.harvestDate).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}
function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function showBlockAreaExplanation() {
  Alert.alert(
    "Block area not set",
    "t/ha is calculated from each block's area. Open Vineyard Blocks and enter the area (ha) for each block to see this figure.",
    [{ text: "OK" }],
  );
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

  const linkedBlockAreaHa = selectedBlock?.areaHa ?? null;
  const tonnesPerHa =
    record?.yieldKg != null && linkedBlockAreaHa != null && linkedBlockAreaHa > 0
      ? record.yieldKg / 1000 / linkedBlockAreaHa
      : null;

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
                    {tonnesPerHa != null ? ` · ${tonnesPerHa.toFixed(2)} t/ha` : ""}
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
  isSinglePick,
  onEdit,
  onDelete,
}: {
  item: HarvestListItem;
  blockAreaHa?: number | null;
  isSinglePick: boolean;
  onEdit: (record: HarvestRecord) => void;
  onDelete: (id: number) => void;
}) {
  const pending = isPendingHarvest(item);
  const linked = !!item.blockId;
  const tonnesPerHa =
    item.yieldKg != null && blockAreaHa != null && blockAreaHa > 0
      ? item.yieldKg / 1000 / blockAreaHa
      : null;

  const handleDelete = () => {
    if (pending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Harvest Record",
      `Delete the harvest record from ${formatDate(item.harvestDate)}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(Number(item.id)) },
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
    <Pressable
      style={[styles.row, pending && styles.pendingRow]}
      onPress={() => {
        if (pending) return;
        Haptics.selectionAsync();
        onEdit(item);
      }}
      disabled={pending}
      accessibilityState={{ disabled: pending }}
    >
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
          {isSinglePick && (
            <View
              style={styles.singlePickBadge}
              accessible
              accessibilityRole="text"
              accessibilityLabel="1 pick — only one pick recorded for this block and vintage; data may have lower confidence"
            >
              <Text style={styles.singlePickBadgeText}>1 pick</Text>
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
        {pending && (
          <View style={styles.pendingBadge}>
            <Feather name="cloud-off" size={12} color={colors.textSecondary} />
            <Text style={styles.pendingBadgeText}>Waiting to sync</Text>
          </View>
        )}
        {item.grapeCondition ? (
          <View style={[styles.badge, { backgroundColor: "#f5f5f5", borderColor: conditionColor[item.grapeCondition] ?? colors.border }]}>
            <Text style={[styles.badgeText, { color: conditionColor[item.grapeCondition] ?? colors.text }]}>
              {item.grapeCondition}
            </Text>
          </View>
        ) : null}
        {!pending && (
          <>
            <Feather name="edit-2" size={14} color={colors.textSecondary} />
            <Pressable onPress={(e) => { e.stopPropagation(); handleDelete(); }} hitSlop={12} style={styles.deleteBtn}>
              <Feather name="trash-2" size={15} color={colors.error} />
            </Pressable>
            <Feather name="chevron-right" size={16} color={colors.textSecondary} />
          </>
        )}
      </View>
    </Pressable>
  );
}

// ─── Email helper ─────────────────────────────────────────────────────────────

function buildHarvestReportMailto(
  records: HarvestRecord[],
  farmName: string,
  sbi: string | null,
  address: string | null,
  farmMeta: Record<string, unknown> | null,
  blocks: { id: number; blockName?: string | null }[],
  yearLabel?: string,
): string {
  const fsaVineRef = String(farmMeta?.fsaVineRegisterRef ?? "").trim();
  const fsaWineRef = String(farmMeta?.fsaWineProductionRef ?? "").trim();
  const printed = new Date().toLocaleDateString("en-GB");

  const blockLookup: Record<number, string> = {};
  blocks.forEach(b => { blockLookup[b.id] = String(b.blockName ?? ""); });
  const bname = (id: number | null) =>
    id != null && blockLookup[id] ? blockLookup[id] : "—";

  const totalKg = records.reduce((s, r) => s + (parseFloat(String(r.yieldKg ?? 0)) || 0), 0);

  const col = (v: string | null | undefined, width: number) => {
    const s = v == null ? "—" : String(v);
    return s.length <= width ? s.padEnd(width) : s.slice(0, width - 1) + "…";
  };
  const nf = (v: number | null | undefined, dp: number) => {
    if (v == null) return "—";
    return v.toFixed(dp);
  };
  const df = (v: string | null | undefined) =>
    v ? new Date(v).toLocaleDateString("en-GB") : "—";

  const headerLine = [
    col("Date", 12), col("Vintage", 8), col("Block", 20),
    col("Method", 14), col("Yield (kg)", 11),
    col("Brix", 6), col("pH", 6), col("TA g/L", 7), col("PA %", 6),
  ].join("  ");
  const separator = "-".repeat(headerLine.length);

  const dataLines = records.map(r => [
    col(df(r.harvestDate), 12),
    col(r.vintageYear != null ? String(r.vintageYear) : null, 8),
    col(bname(r.blockId), 20),
    col(r.harvestMethod, 14),
    col(r.yieldKg != null ? r.yieldKg.toFixed(1) : "—", 11),
    col(nf(r.brix, 1), 6),
    col(nf(r.ph, 2), 6),
    col(nf(r.titratableAcidityGl, 2), 7),
    col(nf(r.potentialAlcohol, 2), 6),
  ].join("  "));

  const body = [
    `Harvest Report — ${farmName}${yearLabel ? ` (${yearLabel})` : ""}`,
    ``,
    `Farm: ${farmName}`,
    ...(address ? [`Address: ${address}`] : [`Address: (not set — add in Farm Settings)`]),
    sbi ? `SBI Number: ${sbi}` : `SBI Number: (not set — add in Farm Settings)`,
    fsaVineRef ? `FSA Vine Register Ref: ${fsaVineRef}` : `FSA Vine Register Ref: (not set — add in Farm Settings)`,
    fsaWineRef ? `FSA Wine Production Ref: ${fsaWineRef}` : `FSA Wine Production Ref: (not set — add in Farm Settings)`,
    `Date: ${printed}`,
    `Records: ${records.length}   Total yield: ${totalKg > 0 ? totalKg.toFixed(1) + " kg" : "—"}`,
    ``,
    separator,
    headerLine,
    separator,
    ...(dataLines.length > 0 ? dataLines : [`(no records)`]),
    separator,
    ``,
    `Prepared by BDE Farm Trac.`,
  ].join("\n");

  const subject = encodeURIComponent(
    `Harvest Report — ${farmName}${yearLabel ? ` (${yearLabel})` : ""}`,
  );
  return `mailto:?subject=${subject}&body=${encodeURIComponent(body)}`;
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function buildHarvestCsv(
  records: HarvestRecord[],
  blocks: { id: number; blockName?: string | null; areaHa?: number | null; variety?: string | null }[],
  farmName: string,
  yearLabel?: string,
): string {
  const q = (v: unknown): string => {
    const s = v == null ? "" : String(v);
    const safe = /^[=+\-@|%\t\r]/.test(s) ? "\t" + s : s;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const df = (v: string | null | undefined) =>
    v ? new Date(v).toLocaleDateString("en-GB") : "";

  const blockLookup = new Map<number, { name: string; areaHa: number | null; variety: string }>();
  for (const b of blocks) {
    blockLookup.set(b.id, {
      name: b.blockName ?? "",
      areaHa: b.areaHa ?? null,
      variety: String(b.variety ?? "").trim(),
    });
  }

  // ── Detail header + rows ─────────────────────────────────────────────────
  const detailHeader = [
    "Date", "Vintage", "Block", "Method", "Yield (kg)",
    "Brix", "pH", "TA (g/L)", "Pot. Alc (%)",
  ].map(q).join(",");

  const detailRows = records.map(r => {
    const block = r.blockId != null ? blockLookup.get(r.blockId) : undefined;
    return [
      df(r.harvestDate),
      r.vintageYear != null ? r.vintageYear : "",
      block?.name ?? "",
      r.harvestMethod ?? "",
      r.yieldKg != null ? r.yieldKg.toFixed(1) : "",
      r.brix != null ? r.brix.toFixed(1) : "",
      r.ph != null ? r.ph.toFixed(2) : "",
      r.titratableAcidityGl != null ? r.titratableAcidityGl.toFixed(2) : "",
      r.potentialAlcohol != null ? r.potentialAlcohol.toFixed(2) : "",
    ].map(q).join(",");
  });

  // ── Yield by Variety section (only when ≥2 distinct named varieties) ──────
  const UNKNOWN_KEY = "Unknown / Not linked";
  const avg = (vals: number[]) =>
    vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  const varietyMap: Record<string, {
    totalKg: number; totalHa: number; seenBlockIds: Set<number>;
    brixVals: number[]; phVals: number[]; taVals: number[]; paVals: number[];
  }> = {};

  for (const r of records) {
    const block = r.blockId != null ? blockLookup.get(r.blockId) : undefined;
    const variety = block?.variety ?? "";
    const key = variety || UNKNOWN_KEY;
    if (!varietyMap[key]) {
      varietyMap[key] = { totalKg: 0, totalHa: 0, seenBlockIds: new Set(), brixVals: [], phVals: [], taVals: [], paVals: [] };
    }
    const entry = varietyMap[key];
    entry.totalKg += parseFloat(String(r.yieldKg ?? 0)) || 0;
    if (r.blockId != null && !entry.seenBlockIds.has(r.blockId)) {
      entry.seenBlockIds.add(r.blockId);
      const ha = block?.areaHa;
      if (ha != null && ha > 0) entry.totalHa += ha;
    }
    const brix = parseFloat(String(r.brix ?? "")); if (!isNaN(brix)) entry.brixVals.push(brix);
    const ph = parseFloat(String(r.ph ?? "")); if (!isNaN(ph)) entry.phVals.push(ph);
    const ta = parseFloat(String(r.titratableAcidityGl ?? "")); if (!isNaN(ta)) entry.taVals.push(ta);
    const pa = parseFloat(String(r.potentialAlcohol ?? "")); if (!isNaN(pa)) entry.paVals.push(pa);
  }

  const namedKeys = Object.keys(varietyMap).filter(k => k !== UNKNOWN_KEY);
  const varietyLines: string[] = [];

  if (namedKeys.length >= 2) {
    const sortedEntries = Object.entries(varietyMap).sort(([a], [b]) => {
      if (a === UNKNOWN_KEY) return 1;
      if (b === UNKNOWN_KEY) return -1;
      return a.localeCompare(b);
    });

    const varietyHeader = [
      "Variety", "Area (ha)", "Total Yield (kg)", "Yield (kg/ha)",
      "Avg Brix", "Avg pH", "Avg TA (g/L)", "Avg Pot. Alc (%)",
    ].map(q).join(",");

    const varietyDataRows = sortedEntries.map(([variety, e]) => {
      const kgPerHa = e.totalHa > 0 && e.totalKg > 0 ? e.totalKg / e.totalHa : null;
      return [
        variety,
        e.totalHa > 0 ? e.totalHa.toFixed(2) : "",
        e.totalKg > 0 ? e.totalKg.toFixed(1) : "",
        kgPerHa != null ? Math.round(kgPerHa).toString() : "",
        avg(e.brixVals) != null ? avg(e.brixVals)!.toFixed(1) : "",
        avg(e.phVals) != null ? avg(e.phVals)!.toFixed(2) : "",
        avg(e.taVals) != null ? avg(e.taVals)!.toFixed(2) : "",
        avg(e.paVals) != null ? avg(e.paVals)!.toFixed(2) : "",
      ].map(q).join(",");
    });

    // Grand totals footer
    const rowsWithArea = sortedEntries.filter(([, e]) => e.totalHa > 0);
    const grandHa = rowsWithArea.reduce((s, [, e]) => s + e.totalHa, 0);
    const grandKgForArea = rowsWithArea.reduce((s, [, e]) => s + e.totalKg, 0);
    const grandKgPerHa = grandHa > 0 && grandKgForArea > 0 ? grandKgForArea / grandHa : null;
    const grandKg = sortedEntries.reduce((s, [, e]) => s + e.totalKg, 0);
    const allBrix = records.map(r => parseFloat(String(r.brix ?? ""))).filter(v => !isNaN(v));
    const allPh = records.map(r => parseFloat(String(r.ph ?? ""))).filter(v => !isNaN(v));
    const allTa = records.map(r => parseFloat(String(r.titratableAcidityGl ?? ""))).filter(v => !isNaN(v));
    const allPa = records.map(r => parseFloat(String(r.potentialAlcohol ?? ""))).filter(v => !isNaN(v));

    const varietyFooter = [
      "TOTAL",
      grandHa > 0 ? grandHa.toFixed(2) : "",
      grandKg > 0 ? grandKg.toFixed(1) : "",
      grandKgPerHa != null ? Math.round(grandKgPerHa).toString() : "",
      avg(allBrix) != null ? avg(allBrix)!.toFixed(1) : "",
      avg(allPh) != null ? avg(allPh)!.toFixed(2) : "",
      avg(allTa) != null ? avg(allTa)!.toFixed(2) : "",
      avg(allPa) != null ? avg(allPa)!.toFixed(2) : "",
    ].map(q).join(",");

    varietyLines.push(
      "",
      q("Yield by Variety"),
      varietyHeader,
      ...varietyDataRows,
      varietyFooter,
    );
  }

  const farmLabel = yearLabel ? `${farmName} — ${yearLabel} Vintage` : farmName;
  const lines = [
    q(`Vineyard Harvest Report — ${farmLabel}`),
    "",
    detailHeader,
    ...detailRows,
    ...varietyLines,
  ];
  return "\uFEFF" + lines.join("\r\n");
}

async function downloadHarvestCsv(
  records: HarvestRecord[],
  blocks: { id: number; blockName?: string | null; areaHa?: number | null; variety?: string | null }[],
  farmName: string,
  yearLabel?: string,
) {
  const safeName = farmName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const yearPart = yearLabel ? `-${yearLabel}` : "";
  const filename = `vineyard-harvest${yearPart}-${safeName}.csv`;
  const csvContent = buildHarvestCsv(records, blocks, farmName, yearLabel);

  if (Platform.OS === "web") {
    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      Alert.alert("Export failed", "Could not generate the CSV file.");
    }
    return;
  }

  try {
    const { shareAsync } = await import("expo-sharing");
    const uri = FileSystem.cacheDirectory + filename;
    await FileSystem.writeAsStringAsync(uri, csvContent, { encoding: FileSystem.EncodingType.UTF8 });
    await shareAsync(uri, {
      mimeType: "text/csv",
      dialogTitle: "Share Harvest CSV",
      UTI: "public.comma-separated-values-text",
    });
  } catch {
    Alert.alert("Export failed", "Could not generate or share the CSV file.");
  }
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VineHarvestHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { sbiNumber, address, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
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

  // Fetch extra farm meta (FSA refs) not covered by useFarmIdentifiers
  const [farmMeta, setFarmMeta] = React.useState<Record<string, unknown> | null>(null);
  React.useEffect(() => {
    if (!currentFarm?.id) return;
    let cancelled = false;
    apiFetch(`/api/farms/${currentFarm.id}`)
      .then(r => r.ok ? r.json() : null)
      .then((d: { record?: Record<string, unknown> } | null) => {
        if (!cancelled && d) setFarmMeta(d.record ?? d as Record<string, unknown>);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [currentFarm?.id]);

  const [search, setSearch] = useState("");
  const [selectedVintage, setSelectedVintage, vintageLoadedForFarmId] = usePersistedVintage(currentFarm?.id);
  const [selectedBlockIds, setSelectedBlockIds] = usePersistedBlockFilter(currentFarm?.id);
  const [editingRecord, setEditingRecord] = useState<HarvestRecord | null>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<number, Partial<HarvestRecord>>>({});
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [varietySort, setVarietySort] = usePersistedVarietySort(currentFarm?.id);
  const [varietyCols, toggleVarietyCol] = usePersistedVarietyColumns(currentFarm?.id);
  const [showVarietyColsPanel, setShowVarietyColsPanel] = useState(false);
  const [yieldCrossTabSort, setYieldCrossTabSort] = useState<YieldCrossTabSort>(null);

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
  const offlinePendingLoadId = React.useRef(0);
  const loadOfflinePending = useCallback(async () => {
    const loadId = ++offlinePendingLoadId.current;
    try {
      const all = await getList<OfflineHarvestEntry>("bde_vine_harvest");
      if (loadId !== offlinePendingLoadId.current) return;
      const pending = all.filter(
        r => r._pendingSync === true && (!currentFarm?.id || r.farmId === currentFarm.id),
      );
      setOfflinePending(pending);
    } catch {
      // non-fatal — totals will just exclude offline records
    }
  }, [currentFarm?.id]);

  React.useEffect(() => {
    void loadOfflinePending();
  }, [loadOfflinePending, records]); // re-read whenever server records refresh (sync may have cleared some)

  React.useEffect(() => {
    // The sync engine notifies once the queue is drained. Track whether this
    // screen observed an active sync so the initial idle notification cannot
    // trigger an unnecessary server request.
    let syncWasActive = false;
    return subscribe((syncState) => {
      const syncFinished = syncWasActive && !syncState.isSyncing && syncState.pendingCount === 0;
      syncWasActive = syncState.isSyncing || syncState.pendingCount > 0;

      if (syncFinished) {
        refresh();
        void loadOfflinePending();
      }
    });
  }, [refresh, loadOfflinePending]);

  const displayRecords = useMemo(() => {
    return records
      .filter(r => !deletedIds.has(r.id))
      .map(r => {
        const update = localUpdates[r.id];
        return update !== undefined ? { ...r, ...update } : r;
      });
  }, [records, localUpdates, deletedIds]);

  // For each block+vintage combination across all records, count picks.
  // Keep unsynced local records in the count because they are visible in the
  // list and represent real picks until the sync completes.
  const singlePickKeys = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const r of [...displayRecords, ...offlinePending]) {
      if (r.blockId == null) continue;
      const key = `${r.blockId}_${r.vintageYear}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return new Set(Object.entries(counts).filter(([, count]) => count === 1).map(([key]) => key));
  }, [displayRecords, offlinePending]);

  // Sorted unique vintage years descending
  const vintages = useMemo(() => {
    const years = new Set<number>();
    for (const r of [...displayRecords, ...offlinePending]) {
      if (r.vintageYear != null) years.add(r.vintageYear);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [displayRecords, offlinePending]);

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

  // Offline pending records that match the current vintage filter
  const offlinePendingForVintage = useMemo(() => {
    if (offlinePending.length === 0) return [];
    if (displayVintage === null) return offlinePending;
    return offlinePending.filter(r => r.vintageYear === displayVintage);
  }, [offlinePending, displayVintage]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const matchesSearch = (r: HarvestListItem) =>
      !q ||
      (r.blockName ?? "").toLowerCase().includes(q) ||
      (r.operatorName ?? "").toLowerCase().includes(q) ||
      (r.harvestDate ?? "").includes(q) ||
      String(r.vintageYear ?? "").includes(q);
    const matchesBlock = (r: HarvestListItem) =>
      selectedBlockIds.length === 0 ||
      (r.blockId != null && selectedBlockIds.includes(r.blockId));

    return [...blockFilteredRecords.filter(matchesSearch), ...offlinePendingForVintage.filter(r => matchesBlock(r) && matchesSearch(r))]
      .sort((a, b) => harvestDateTimestamp(b) - harvestDateTimestamp(a));
  }, [blockFilteredRecords, offlinePendingForVintage, search, selectedBlockIds]);

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

    for (const r of blockFilteredRecords) {
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
      count: blockFilteredRecords.length + offlinePendingForVintage.length,
      hasBlockWithMissingArea,
      hasUnsynced,
    };
  }, [blockFilteredRecords, vintageRecords, blocks, offlinePendingForVintage]);

  // Per-vintage chemistry averages for the all-years trend view. Keep this
  // independent of the selected vintage so the trend remains useful while a
  // grower is viewing one year's totals. Apply the block filter, and include
  // pending local records because they are already visible on this screen.
  const chemistryTrendData = useMemo(() => {
    type ChemistryValues = {
      brix: number[];
      ph: number[];
      ta: number[];
      potAlc: number[];
    };

    const vintageMap = new Map<number, ChemistryValues>();
    const allRecords = [...displayRecords, ...offlinePending].filter(
      r => r.vintageYear != null &&
        (selectedBlockIds.length === 0 || (r.blockId != null && selectedBlockIds.includes(r.blockId))),
    );

    const addValue = (values: number[], value: number | null | undefined) => {
      if (value == null || !Number.isFinite(Number(value))) return;
      values.push(Number(value));
    };

    for (const record of allRecords) {
      const vintage = record.vintageYear as number;
      const values = vintageMap.get(vintage) ?? { brix: [], ph: [], ta: [], potAlc: [] };
      addValue(values.brix, record.brix);
      addValue(values.ph, record.ph);
      addValue(values.ta, record.titratableAcidityGl);
      addValue(values.potAlc, record.potentialAlcohol);
      vintageMap.set(vintage, values);
    }

    const average = (values: number[]) =>
      values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

    const rows = Array.from(vintageMap.entries())
      .map(([vintageYear, values]) => ({
        vintageYear,
        avgBrix: average(values.brix),
        avgPh: average(values.ph),
        avgTa: average(values.ta),
        avgPotAlc: average(values.potAlc),
        hasChemistry: values.brix.length + values.ph.length + values.ta.length + values.potAlc.length > 0,
      }))
      .filter(row => row.hasChemistry)
      .sort((a, b) => a.vintageYear - b.vintageYear);

    return rows.length >= 2 ? rows : null;
  }, [displayRecords, offlinePending, selectedBlockIds]);

  // ── Yield by Block × Vintage cross-tab ─────────────────────────────────────
  // Like the dashboard, this is an all-vintages view. Keep pending offline
  // records in the table so the on-device report reflects the records the
  // grower can currently see.
  const yieldCrossTabData = useMemo(() => {
    const allRecords = [...displayRecords, ...offlinePending].filter(
      r => r.blockId != null && r.vintageYear != null &&
        (selectedBlockIds.length === 0 || selectedBlockIds.includes(r.blockId)),
    );
    const uniqueVintages = Array.from(new Set(allRecords.map(r => String(r.vintageYear))))
      .sort((a, b) => a.localeCompare(b));
    const uniqueBlockIds = Array.from(new Set(allRecords.map(r => r.blockId as number)));
    if (uniqueVintages.length < 2 || uniqueBlockIds.length < 2) return null;

    const blockMap = new Map(blocks.map(block => [block.id, block]));
    const rows = uniqueBlockIds.map(blockId => {
      const blockRecords = allRecords.filter(r => r.blockId === blockId);
      const block = blockMap.get(blockId);
      const fallbackName = blockRecords.find(r => r.blockName)?.blockName;
      const name = block?.blockName ?? fallbackName ?? `Block ${blockId}`;
      const areaHa = block?.areaHa != null && block.areaHa > 0 ? block.areaHa : null;
      const cells: Record<string, { kg: number; tha: number | null }> = {};
      let totalKg = 0;

      for (const vintage of uniqueVintages) {
        const kg = blockRecords
          .filter(r => String(r.vintageYear) === vintage)
          .reduce((sum, r) => sum + (Number(r.yieldKg ?? 0) || 0), 0);
        totalKg += kg;
        cells[vintage] = {
          kg,
          tha: areaHa != null && kg > 0 ? kg / 1000 / areaHa : null,
        };
      }

      return {
        blockId,
        name,
        areaHa,
        cells,
        totalKg,
        totalTha: areaHa != null && totalKg > 0 ? totalKg / 1000 / areaHa : null,
      };
    });

    const footerCells: Record<string, { kg: number; tha: number | null }> = {};
    let totalKg = 0;
    let totalAreaHa = 0;
    let totalKgWithKnownArea = 0;
    for (const vintage of uniqueVintages) {
      let vintageKg = 0;
      let vintageKgWithKnownArea = 0;
      let vintageAreaHa = 0;
      for (const row of rows) {
        const cell = row.cells[vintage];
        vintageKg += cell.kg;
        if (row.areaHa != null && cell.kg > 0) {
          vintageKgWithKnownArea += cell.kg;
          vintageAreaHa += row.areaHa;
        }
      }
      footerCells[vintage] = {
        kg: vintageKg,
        tha: vintageAreaHa > 0 && vintageKgWithKnownArea > 0
          ? vintageKgWithKnownArea / 1000 / vintageAreaHa
          : null,
      };
      totalKg += vintageKg;
    }
    for (const row of rows) {
      if (row.totalKg > 0 && row.areaHa != null) {
        totalAreaHa += row.areaHa;
        totalKgWithKnownArea += row.totalKg;
      }
    }

    return {
      uniqueVintages,
      rows,
      footerCells,
      totalKg,
      totalTha: totalAreaHa > 0 && totalKgWithKnownArea > 0
        ? totalKgWithKnownArea / 1000 / totalAreaHa
        : null,
    };
  }, [displayRecords, offlinePending, blocks, selectedBlockIds]);

  // Sort state is deliberately local to this screen. Do not carry a column
  // from one farm (or a removed vintage) into a table that cannot display it.
  useEffect(() => {
    setYieldCrossTabSort(null);
  }, [currentFarm?.id]);

  useEffect(() => {
    const match = yieldCrossTabSort?.col.match(/^vy:(?:kg|tha):(.+)$/);
    if (match && yieldCrossTabData && !yieldCrossTabData.uniqueVintages.includes(match[1])) {
      setYieldCrossTabSort(null);
    }
  }, [yieldCrossTabSort?.col, yieldCrossTabData]);

  const sortedYieldCrossTabRows = useMemo(() => {
    if (!yieldCrossTabData) return [];
    const { rows } = yieldCrossTabData;
    if (!yieldCrossTabSort) return [...rows].sort((a, b) => a.name.localeCompare(b.name));

    const direction = yieldCrossTabSort.dir === "asc" ? 1 : -1;
    const compareNames = (a: typeof rows[number], b: typeof rows[number]) => a.name.localeCompare(b.name);
    const compareNumbers = (a: number, b: number, rowA: typeof rows[number], rowB: typeof rows[number]) =>
      direction * (a - b) || compareNames(rowA, rowB);
    // A missing block area means t/ha is unavailable, not zero. Keep those
    // rows last in both directions and make equal values deterministic by name.
    const compareTonnesPerHa = (
      a: number | null,
      b: number | null,
      rowA: typeof rows[number],
      rowB: typeof rows[number],
    ) => {
      if (a == null && b == null) return compareNames(rowA, rowB);
      if (a == null) return 1;
      if (b == null) return -1;
      return compareNumbers(a, b, rowA, rowB);
    };

    return [...rows].sort((a, b) => {
      if (yieldCrossTabSort.col === "name") {
        return direction * a.name.localeCompare(b.name);
      }
      if (yieldCrossTabSort.col === "total:kg") {
        return compareNumbers(a.totalKg, b.totalKg, a, b);
      }
      if (yieldCrossTabSort.col === "total:tha") {
        return compareTonnesPerHa(a.totalTha, b.totalTha, a, b);
      }
      const match = yieldCrossTabSort.col.match(/^vy:(kg|tha):(.+)$/);
      if (match) {
        const [, metric, vintage] = match;
        if (metric === "kg") {
          return compareNumbers(a.cells[vintage]?.kg ?? 0, b.cells[vintage]?.kg ?? 0, a, b);
        }
        return compareTonnesPerHa(a.cells[vintage]?.tha ?? null, b.cells[vintage]?.tha ?? null, a, b);
      }
      return compareNames(a, b);
    });
  }, [yieldCrossTabData, yieldCrossTabSort]);

  const toggleYieldCrossTabSort = useCallback((col: string) => {
    setYieldCrossTabSort(current =>
      current?.col === col
        ? { col, dir: current.dir === "asc" ? "desc" : "asc" }
        : { col, dir: "desc" },
    );
  }, []);

  const clearYieldCrossTabSort = useCallback(() => {
    setYieldCrossTabSort(null);
  }, []);

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
    const varietyMap: Record<string, { totalKg: number; totalHa: number; seenBlockIds: Set<number>; brixVals: number[]; phVals: number[]; taVals: number[]; paVals: number[] }> = {};
    for (const r of vintageRecords) {
      const variety = r.blockId != null ? (blockVarietyMap.get(r.blockId) ?? "") : "";
      const key = variety || UNKNOWN_KEY;
      if (!varietyMap[key]) varietyMap[key] = { totalKg: 0, totalHa: 0, seenBlockIds: new Set(), brixVals: [], phVals: [], taVals: [], paVals: [] };
      const entry = varietyMap[key];
      entry.totalKg += parseFloat(String(r.yieldKg ?? 0)) || 0;
      if (r.blockId != null && !entry.seenBlockIds.has(r.blockId)) {
        entry.seenBlockIds.add(r.blockId);
        const ha = blockAreaMap.get(r.blockId);
        if (ha != null && ha > 0) entry.totalHa += ha;
      }
      const brix = parseFloat(String(r.brix ?? ""));
      if (!isNaN(brix)) entry.brixVals.push(brix);
      const ph = parseFloat(String(r.ph ?? ""));
      if (!isNaN(ph)) entry.phVals.push(ph);
      const ta = parseFloat(String(r.titratableAcidityGl ?? ""));
      if (!isNaN(ta)) entry.taVals.push(ta);
      const pa = parseFloat(String(r.potentialAlcohol ?? ""));
      if (!isNaN(pa)) entry.paVals.push(pa);
    }
    const namedKeys = Object.keys(varietyMap).filter(k => k !== UNKNOWN_KEY);
    if (namedKeys.length < 2) return null;

    // Build colour map: named varieties in insertion order get palette colours;
    // unknown blocks get a neutral gray.
    const colorMap: Record<string, string> = {};
    let paletteIdx = 0;
    for (const key of Object.keys(varietyMap)) {
      if (key === UNKNOWN_KEY) {
        colorMap[key] = "#94a3b8";
      } else {
        colorMap[key] = YIELD_CHART_COLORS[paletteIdx % YIELD_CHART_COLORS.length];
        paletteIdx++;
      }
    }

    const rows = Object.entries(varietyMap)
      .sort(([a], [b]) => {
        if (a === UNKNOWN_KEY) return 1;
        if (b === UNKNOWN_KEY) return -1;
        return a.localeCompare(b);
      })
      .map(([variety, e]) => ({
        variety,
        totalHa: e.totalHa,
        totalKg: e.totalKg,
        kgPerHa: e.totalHa > 0 && e.totalKg > 0 ? e.totalKg / e.totalHa : null,
        avgBrix: avg(e.brixVals),
        avgPh: avg(e.phVals),
        avgTa: avg(e.taVals),
        avgPotAlc: avg(e.paVals),
      }));

    const grandKg = rows.reduce((s, r) => s + r.totalKg, 0);
    const grandHa = rows.reduce((s, r) => s + r.totalHa, 0);
    return { rows, grandKg, grandHa, colorMap };
  }, [vintageRecords, blocks]);

  // Sorted variety rows (sort persisted per farm via usePersistedVarietySort)
  const sortedVarietyRows = useMemo(() => {
    if (!varietySummaryData) return [];
    const UNKNOWN_KEY = "Unknown / Not linked";
    return [...varietySummaryData.rows].sort((a, b) => {
      if (a.variety === UNKNOWN_KEY) return 1;
      if (b.variety === UNKNOWN_KEY) return -1;
      const d = varietySort.dir === "asc" ? 1 : -1;
      switch (varietySort.col) {
        case "variety":  return d * a.variety.localeCompare(b.variety);
        case "totalHa":  return d * (a.totalHa - b.totalHa);
        case "totalKg":  return d * (a.totalKg - b.totalKg);
        case "kgPerHa":  return d * ((a.kgPerHa ?? (d > 0 ? Infinity : -Infinity)) - (b.kgPerHa ?? (d > 0 ? Infinity : -Infinity)));
        case "avgBrix":  return d * ((a.avgBrix ?? (d > 0 ? Infinity : -Infinity)) - (b.avgBrix ?? (d > 0 ? Infinity : -Infinity)));
        default: return 0;
      }
    });
  }, [varietySummaryData, varietySort]);

  const toggleVarietySort = useCallback((col: "variety" | "totalHa" | "totalKg" | "kgPerHa" | "avgBrix") => {
    const newSort =
      varietySort.col === col
        ? { col, dir: varietySort.dir === "asc" ? ("desc" as const) : ("asc" as const) }
        : { col, dir: col === "variety" ? ("asc" as const) : ("desc" as const) };
    setVarietySort(newSort);
  }, [varietySort, setVarietySort]);

  const unlinkedCount = useMemo(() => displayRecords.filter(r => !r.blockId).length, [displayRecords]);

  const handleSaved = useCallback((recordId: number, updated: Partial<HarvestRecord>) => {
    setLocalUpdates(prev => ({ ...prev, [recordId]: { ...(prev[recordId] ?? {}), ...updated } }));
    vineyardCountEvents.emit();
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

  const [csvExporting, setCsvExporting] = useState(false);

  const handleExportCsv = async () => {
    if (!blockFilteredRecords.length || csvExporting) return;
    const yearLabel = displayVintage != null ? String(displayVintage) : undefined;
    setCsvExporting(true);
    try {
      await downloadHarvestCsv(blockFilteredRecords, blocks, currentFarm?.name ?? "Farm", yearLabel);
    } finally {
      setCsvExporting(false);
    }
  };

  const handleEmail = () => {
    if (!displayRecords.length) return;
    const yearLabel =
      displayVintage != null ? String(displayVintage) : undefined;
    const recordsToEmail = displayVintage != null ? vintageRecords : displayRecords;
    const mailto = buildHarvestReportMailto(
      recordsToEmail,
      currentFarm?.name ?? "Farm",
      sbiNumber ?? null,
      address ?? null,
      farmMeta,
      blocks,
      yearLabel,
    );
    openExternalUrl(mailto);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Harvest History</Text>
        {blockFilteredRecords.length > 0 && (
          <View style={styles.headerActions}>
            <Pressable
              onPress={handleExportCsv}
              style={styles.csvBtn}
              hitSlop={12}
              disabled={csvExporting}
              accessibilityLabel="Export harvest CSV"
              accessibilityRole="button"
            >
              <Feather name="download" size={20} color={csvExporting ? colors.textSecondary : colors.primary} />
            </Pressable>
            <Pressable
              onPress={handleEmail}
              style={styles.emailBtn}
              hitSlop={12}
              accessibilityLabel="Email harvest report"
              accessibilityRole="button"
            >
              <Feather name="mail" size={20} color={colors.primary} />
            </Pressable>
          </View>
        )}
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
                  onPress={showBlockAreaExplanation}
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

      {/* Yield by Block × Vintage cross-tab — available in All Vintages mode */}
      {!loading && !error && displayVintage === null && yieldCrossTabData && (
        <View style={styles.yieldCrossTabCard}>
          <View style={styles.yieldCrossTabHeader}>
            <View style={styles.yieldCrossTabHeaderCopy}>
              <View style={styles.yieldCrossTabTitleRow}>
                <Feather name="grid" size={14} color={colors.textSecondary} />
                <Text style={styles.yieldCrossTabTitle}>Yield by Block × Vintage</Text>
              </View>
              <Text style={styles.yieldCrossTabSubtitle}>
                Tap kg or t/ha to sort blocks by that vintage
              </Text>
            </View>
            {yieldCrossTabSort && (
              <Pressable
                style={styles.yieldCrossTabClearSort}
                onPress={() => { Haptics.selectionAsync(); clearYieldCrossTabSort(); }}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel="Clear yield cross-tab sort"
              >
                <Feather name="x" size={12} color={colors.primary} />
                <Text style={styles.yieldCrossTabClearSortText}>Clear sort</Text>
              </Pressable>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Two header rows keep each vintage's kg and t/ha controls together. */}
              <View style={[styles.yieldCrossTabRow, styles.yieldCrossTabHeaderRow]}>
                <Pressable
                  style={[
                    styles.yieldCrossTabBlockHeader,
                    yieldCrossTabSort?.col === "name" && styles.yieldCrossTabActiveHeader,
                  ]}
                  onPress={() => { Haptics.selectionAsync(); toggleYieldCrossTabSort("name"); }}
                  accessibilityRole="button"
                  accessibilityLabel="Sort yield cross-tab by block name"
                  accessibilityState={{ selected: yieldCrossTabSort?.col === "name" }}
                  accessibilityValue={{
                    text: yieldCrossTabSort?.col === "name"
                      ? `Sorted ${yieldCrossTabSort.dir === "asc" ? "ascending" : "descending"}`
                      : "Not sorted",
                  }}
                >
                  <Text style={[styles.yieldCrossTabHeaderLabel, yieldCrossTabSort?.col === "name" && styles.yieldCrossTabHeaderLabelActive]}>
                    Block
                  </Text>
                  <Feather
                    name={yieldCrossTabSort?.col === "name" ? (yieldCrossTabSort.dir === "asc" ? "arrow-up" : "arrow-down") : "minus"}
                    size={10}
                    color={yieldCrossTabSort?.col === "name" ? colors.primary : colors.textSecondary}
                    style={{ opacity: yieldCrossTabSort?.col === "name" ? 1 : 0.45 }}
                  />
                </Pressable>
                {yieldCrossTabData.uniqueVintages.map(vintage => (
                  <View key={vintage} style={styles.yieldCrossTabVintageHeader}>
                    <Text style={styles.yieldCrossTabHeaderLabel}>{vintage}</Text>
                  </View>
                ))}
                <View style={styles.yieldCrossTabTotalHeader}>
                  <Text style={styles.yieldCrossTabHeaderLabel}>Total</Text>
                </View>
              </View>

              <View style={[styles.yieldCrossTabRow, styles.yieldCrossTabSubheaderRow]}>
                <View style={styles.yieldCrossTabBlockHeader} />
                {yieldCrossTabData.uniqueVintages.map(vintage => (
                  <React.Fragment key={vintage}>
                    {(["kg", "tha"] as const).map(metric => {
                      const col = `vy:${metric}:${vintage}`;
                      const active = yieldCrossTabSort?.col === col;
                      return (
                        <Pressable
                          key={col}
                          style={[
                            styles.yieldCrossTabMetricHeader,
                            metric === "kg" && styles.yieldCrossTabMetricHeaderBorder,
                            active && styles.yieldCrossTabActiveHeader,
                          ]}
                          onPress={() => { Haptics.selectionAsync(); toggleYieldCrossTabSort(col); }}
                          accessibilityRole="button"
                          accessibilityLabel={`Sort yield cross-tab by ${vintage} ${metric === "kg" ? "kilograms" : "tonnes per hectare"}`}
                          accessibilityState={{ selected: active }}
                          accessibilityValue={{
                            text: active
                              ? `Sorted ${yieldCrossTabSort?.dir === "asc" ? "ascending" : "descending"}`
                              : "Not sorted",
                          }}
                        >
                          <Text style={[styles.yieldCrossTabHeaderLabel, active && styles.yieldCrossTabHeaderLabelActive]}>
                            {metric === "kg" ? "kg" : "t/ha"}
                          </Text>
                          <Feather
                            name={active ? (yieldCrossTabSort?.dir === "asc" ? "arrow-up" : "arrow-down") : "minus"}
                            size={9}
                            color={active ? colors.primary : colors.textSecondary}
                            style={{ opacity: active ? 1 : 0.4 }}
                          />
                        </Pressable>
                      );
                    })}
                  </React.Fragment>
                ))}
                <Pressable
                  style={[
                    styles.yieldCrossTabMetricHeader,
                    styles.yieldCrossTabMetricHeaderBorder,
                    yieldCrossTabSort?.col === "total:kg" && styles.yieldCrossTabActiveHeader,
                  ]}
                  onPress={() => { Haptics.selectionAsync(); toggleYieldCrossTabSort("total:kg"); }}
                  accessibilityRole="button"
                  accessibilityLabel="Sort yield cross-tab by total kilograms"
                  accessibilityState={{ selected: yieldCrossTabSort?.col === "total:kg" }}
                  accessibilityValue={{
                    text: yieldCrossTabSort?.col === "total:kg"
                      ? `Sorted ${yieldCrossTabSort.dir === "asc" ? "ascending" : "descending"}`
                      : "Not sorted",
                  }}
                >
                  <Text style={[styles.yieldCrossTabHeaderLabel, yieldCrossTabSort?.col === "total:kg" && styles.yieldCrossTabHeaderLabelActive]}>kg</Text>
                  <Feather
                    name={yieldCrossTabSort?.col === "total:kg" ? (yieldCrossTabSort.dir === "asc" ? "arrow-up" : "arrow-down") : "minus"}
                    size={9}
                    color={yieldCrossTabSort?.col === "total:kg" ? colors.primary : colors.textSecondary}
                    style={{ opacity: yieldCrossTabSort?.col === "total:kg" ? 1 : 0.4 }}
                  />
                </Pressable>
                <Pressable
                  style={[
                    styles.yieldCrossTabMetricHeader,
                    yieldCrossTabSort?.col === "total:tha" && styles.yieldCrossTabActiveHeader,
                  ]}
                  onPress={() => { Haptics.selectionAsync(); toggleYieldCrossTabSort("total:tha"); }}
                  accessibilityRole="button"
                  accessibilityLabel="Sort yield cross-tab by total tonnes per hectare"
                  accessibilityState={{ selected: yieldCrossTabSort?.col === "total:tha" }}
                  accessibilityValue={{
                    text: yieldCrossTabSort?.col === "total:tha"
                      ? `Sorted ${yieldCrossTabSort.dir === "asc" ? "ascending" : "descending"}`
                      : "Not sorted",
                  }}
                >
                  <Text style={[styles.yieldCrossTabHeaderLabel, yieldCrossTabSort?.col === "total:tha" && styles.yieldCrossTabHeaderLabelActive]}>t/ha</Text>
                  <Feather
                    name={yieldCrossTabSort?.col === "total:tha" ? (yieldCrossTabSort.dir === "asc" ? "arrow-up" : "arrow-down") : "minus"}
                    size={9}
                    color={yieldCrossTabSort?.col === "total:tha" ? colors.primary : colors.textSecondary}
                    style={{ opacity: yieldCrossTabSort?.col === "total:tha" ? 1 : 0.4 }}
                  />
                </Pressable>
              </View>

              {sortedYieldCrossTabRows.map((row, index) => (
                <View
                  key={row.blockId}
                  style={[
                    styles.yieldCrossTabRow,
                    styles.yieldCrossTabDataRow,
                    index < sortedYieldCrossTabRows.length - 1 && styles.yieldCrossTabDataRowBorder,
                  ]}
                >
                  <View style={styles.yieldCrossTabBlockCell}>
                    <Text style={styles.yieldCrossTabBlockName} numberOfLines={1}>{row.name}</Text>
                    {row.areaHa != null && <Text style={styles.yieldCrossTabBlockArea}>{row.areaHa.toFixed(2)} ha</Text>}
                  </View>
                  {yieldCrossTabData.uniqueVintages.map(vintage => {
                    const cell = row.cells[vintage];
                    return (
                      <React.Fragment key={vintage}>
                        <View style={[styles.yieldCrossTabValueCell, styles.yieldCrossTabMetricHeaderBorder]}>
                          <Text style={styles.yieldCrossTabValue}>
                            {cell.kg > 0 ? cell.kg.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : "—"}
                          </Text>
                        </View>
                        <View style={styles.yieldCrossTabValueCell}>
                          <Text style={styles.yieldCrossTabValue}>
                            {cell.tha != null ? cell.tha.toFixed(2) : "—"}
                          </Text>
                        </View>
                      </React.Fragment>
                    );
                  })}
                  <View style={[styles.yieldCrossTabValueCell, styles.yieldCrossTabMetricHeaderBorder]}>
                    <Text style={styles.yieldCrossTabValue}>
                      {row.totalKg > 0 ? row.totalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : "—"}
                    </Text>
                  </View>
                  <View style={styles.yieldCrossTabValueCell}>
                    <Text style={styles.yieldCrossTabValue}>
                      {row.totalTha != null ? row.totalTha.toFixed(2) : "—"}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={[styles.yieldCrossTabRow, styles.yieldCrossTabFooterRow]}>
                <View style={styles.yieldCrossTabBlockCell}>
                  <Text style={styles.yieldCrossTabFooterLabel}>All blocks</Text>
                </View>
                {yieldCrossTabData.uniqueVintages.map(vintage => {
                  const cell = yieldCrossTabData.footerCells[vintage];
                  return (
                    <React.Fragment key={vintage}>
                      <View style={[styles.yieldCrossTabValueCell, styles.yieldCrossTabMetricHeaderBorder]}>
                        <Text style={styles.yieldCrossTabFooterValue}>
                          {cell.kg > 0 ? cell.kg.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : "—"}
                        </Text>
                      </View>
                      <View style={styles.yieldCrossTabValueCell}>
                        <Text style={styles.yieldCrossTabFooterValue}>{cell.tha != null ? cell.tha.toFixed(2) : "—"}</Text>
                      </View>
                    </React.Fragment>
                  );
                })}
                <View style={[styles.yieldCrossTabValueCell, styles.yieldCrossTabMetricHeaderBorder]}>
                  <Text style={styles.yieldCrossTabFooterValue}>
                    {yieldCrossTabData.totalKg > 0 ? yieldCrossTabData.totalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : "—"}
                  </Text>
                </View>
                <View style={styles.yieldCrossTabValueCell}>
                  <Text style={styles.yieldCrossTabFooterValue}>
                    {yieldCrossTabData.totalTha != null ? yieldCrossTabData.totalTha.toFixed(2) : "—"}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Yield by Variety table — shown when ≥2 distinct named varieties */}
      {!loading && !error && varietySummaryData && (
        <View style={styles.varietyCard}>
          {/* Collapsible header */}
          <View style={styles.varietyHeader}>
            <Pressable
              style={styles.varietyHeaderLeft}
              onPress={() => { Haptics.selectionAsync(); setVarietyTableOpen(o => !o); setShowVarietyColsPanel(false); }}
            >
              <Feather name="bar-chart-2" size={14} color={colors.textSecondary} />
              <Text style={styles.varietyHeaderText}>Yield by Variety</Text>
            </Pressable>
            {varietyTableOpen && (
              <Pressable
                style={[styles.varietyColsBtn, showVarietyColsPanel && styles.varietyColsBtnActive]}
                onPress={() => { Haptics.selectionAsync(); setShowVarietyColsPanel(v => !v); }}
                hitSlop={4}
              >
                <Feather name="sliders" size={11} color={showVarietyColsPanel ? colors.primary : colors.textSecondary} />
                <Text style={[styles.varietyColsBtnText, showVarietyColsPanel && styles.varietyColsBtnTextActive]}>Columns</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setVarietyTableOpen(o => !o); setShowVarietyColsPanel(false); }}
              hitSlop={8}
              style={{ paddingLeft: 4 }}
            >
              <Feather
                name={varietyTableOpen ? "chevron-down" : "chevron-right"}
                size={14}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>

          {varietyTableOpen && showVarietyColsPanel && (
            <View style={styles.varietyColsPanel}>
              {([
                { key: "avgBrix" as keyof VarietyColsVisibility,    label: "Avg Brix °" },
                { key: "avgPh" as keyof VarietyColsVisibility,      label: "Avg pH" },
                { key: "avgTa" as keyof VarietyColsVisibility,      label: "Avg TA (g/L)" },
                { key: "avgPotAlc" as keyof VarietyColsVisibility,  label: "Avg Pot. Alc %" },
              ]).map(({ key, label }) => (
                <Pressable
                  key={key}
                  style={styles.varietyColsPanelRow}
                  onPress={() => { Haptics.selectionAsync(); toggleVarietyCol(key); }}
                >
                  <Feather
                    name={varietyCols[key] ? "check-square" : "square"}
                    size={15}
                    color={varietyCols[key] ? colors.primary : colors.textSecondary}
                  />
                  <Text style={styles.varietyColsPanelLabel}>{label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {varietyTableOpen && (
            <>
            {/* ── Proportional bar chart ── */}
            <View style={styles.varietyChart}>
              {varietySummaryData.grandKg > 0 && varietySummaryData.rows.map((row) => {
                const pct = row.totalKg / varietySummaryData.grandKg;
                const color = varietySummaryData.colorMap[row.variety] ?? "#94a3b8";
                return (
                  <View key={row.variety} style={styles.varietyBarRow}>
                    <View style={styles.varietyBarTrack}>
                      <View
                        style={[
                          styles.varietyBarFill,
                          { width: `${Math.max(pct * 100, 0.5)}%` as any, backgroundColor: color },
                        ]}
                      />
                    </View>
                    <Text style={styles.varietyBarPct} numberOfLines={1}>
                      {(pct * 100).toFixed(0)}%
                    </Text>
                  </View>
                );
              })}
              {/* Legend */}
              <View style={styles.varietyLegend}>
                {varietySummaryData.rows.map((row) => {
                  const color = varietySummaryData.colorMap[row.variety] ?? "#94a3b8";
                  return (
                    <View key={row.variety} style={styles.varietyLegendItem}>
                      <View style={[styles.varietyLegendSwatch, { backgroundColor: color }]} />
                      <Text style={styles.varietyLegendLabel} numberOfLines={1}>{row.variety}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                {/* Column headers */}
                <View style={[styles.varietyRow, styles.varietyHeaderRow]}>
                  {(
                    [
                      { col: "variety",    label: "Variety",         flex: 1,  align: "left",  show: true,                    sortable: true  as const },
                      { col: "totalHa",   label: "Area (ha)",        width: 80, align: "right", show: true,                    sortable: true  as const },
                      { col: "totalKg",   label: "Total kg",         width: 80, align: "right", show: true,                    sortable: true  as const },
                      { col: "kgPerHa",   label: "t / ha",           width: 72, align: "right", show: true,                    sortable: true  as const },
                      { col: "avgBrix",   label: "Avg Brix°",        width: 72, align: "right", show: varietyCols.avgBrix,    sortable: true  as const },
                      { col: "avgPh",     label: "Avg pH",           width: 60, align: "right", show: varietyCols.avgPh,      sortable: false as const },
                      { col: "avgTa",     label: "Avg TA (g/L)",     width: 72, align: "right", show: varietyCols.avgTa,      sortable: false as const },
                      { col: "avgPotAlc", label: "Avg Pot. Alc %",   width: 80, align: "right", show: varietyCols.avgPotAlc,  sortable: false as const },
                    ]
                  ).filter(c => c.show).map(c => {
                    if (c.sortable) {
                      const active = varietySort.col === c.col;
                      const icon = !active ? "minus" : varietySort.dir === "asc" ? "arrow-up" : "arrow-down";
                      return (
                        <Pressable
                          key={c.col}
                          style={[
                            styles.varietyHeaderCell,
                            c.flex != null ? { flex: c.flex } : { width: c.width },
                            c.align === "right" && { alignItems: "flex-end" },
                          ]}
                          onPress={() => { Haptics.selectionAsync(); toggleVarietySort(c.col as "variety" | "totalHa" | "totalKg" | "kgPerHa" | "avgBrix"); }}
                          hitSlop={6}
                        >
                          <View style={styles.varietyHeaderCellInner}>
                            {c.align === "right" && (
                              <Feather
                                name={icon}
                                size={9}
                                color={active ? colors.primary : colors.textSecondary}
                                style={{ opacity: active ? 1 : 0.4 }}
                              />
                            )}
                            <Text style={[styles.varietyHeaderLabel, active && styles.varietyHeaderLabelActive]}>
                              {c.label}
                            </Text>
                            {c.align === "left" && (
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
                    }
                    return (
                      <View
                        key={c.col}
                        style={[styles.varietyHeaderCell, { width: c.width }, { alignItems: "flex-end" }]}
                      >
                        <Text style={styles.varietyHeaderLabel}>{c.label}</Text>
                      </View>
                    );
                  })}
                </View>

                {/* Data rows */}
                {sortedVarietyRows.map((row, i) => {
                  const swatchColor = varietySummaryData.colorMap[row.variety] ?? "#94a3b8";
                  return (
                  <View
                    key={row.variety}
                    style={[styles.varietyRow, styles.varietyDataRow, i < sortedVarietyRows.length - 1 && styles.varietyDataRowBorder]}
                  >
                    <View style={[{ flex: 1 }, styles.varietyNameCell]}>
                      <View style={[styles.varietyRowSwatch, { backgroundColor: swatchColor }]} />
                      <Text style={styles.varietyName} numberOfLines={1}>{row.variety}</Text>
                    </View>
                    <View style={{ width: 80, alignItems: "flex-end" }}>
                      <Text style={styles.varietyValue}>
                        {row.totalHa > 0 ? row.totalHa.toFixed(2) : "—"}
                      </Text>
                    </View>
                    <View style={{ width: 80, alignItems: "flex-end" }}>
                      <Text style={styles.varietyValue}>
                        {row.totalKg > 0 ? row.totalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : "—"}
                      </Text>
                    </View>
                    <View style={{ width: 72, alignItems: "flex-end" }}>
                      {row.kgPerHa != null ? (
                        <Text style={styles.varietyValue}>{(row.kgPerHa / 1000).toFixed(2)}</Text>
                      ) : (
                        <Pressable
                          onPress={showBlockAreaExplanation}
                          hitSlop={6}
                          accessibilityRole="button"
                          accessibilityLabel={`Set block area to calculate t/ha for ${row.variety}`}
                        >
                          <Text style={styles.varietyValue}>—</Text>
                          <Text style={styles.varietyTonneHint}>Set block area to calculate</Text>
                        </Pressable>
                      )}
                    </View>
                    {varietyCols.avgBrix && (
                      <View style={{ width: 72, alignItems: "flex-end" }}>
                        <Text style={styles.varietyValue}>
                          {row.avgBrix != null ? row.avgBrix.toFixed(1) : "—"}
                        </Text>
                      </View>
                    )}
                    {varietyCols.avgPh && (
                      <View style={{ width: 60, alignItems: "flex-end" }}>
                        <Text style={styles.varietyValue}>
                          {row.avgPh != null ? row.avgPh.toFixed(2) : "—"}
                        </Text>
                      </View>
                    )}
                    {varietyCols.avgTa && (
                      <View style={{ width: 72, alignItems: "flex-end" }}>
                        <Text style={styles.varietyValue}>
                          {row.avgTa != null ? row.avgTa.toFixed(2) : "—"}
                        </Text>
                      </View>
                    )}
                    {varietyCols.avgPotAlc && (
                      <View style={{ width: 80, alignItems: "flex-end" }}>
                        <Text style={styles.varietyValue}>
                          {row.avgPotAlc != null ? row.avgPotAlc.toFixed(1) : "—"}
                        </Text>
                      </View>
                    )}
                  </View>
                  );
                })}

                {/* Grand total footer */}
                <View style={[styles.varietyRow, styles.varietyFooterRow]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.varietyFooterLabel}>Total</Text>
                  </View>
                  <View style={{ width: 80, alignItems: "flex-end" }}>
                    <Text style={styles.varietyFooterValue}>
                      {varietySummaryData.grandHa > 0
                        ? varietySummaryData.grandHa.toFixed(2)
                        : "—"}
                    </Text>
                  </View>
                  <View style={{ width: 80, alignItems: "flex-end" }}>
                    <Text style={styles.varietyFooterValue}>
                      {varietySummaryData.grandKg > 0
                        ? varietySummaryData.grandKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })
                        : "—"}
                    </Text>
                  </View>
                  <View style={{ width: 72 }} />
                  {varietyCols.avgBrix && <View style={{ width: 72 }} />}
                  {varietyCols.avgPh && <View style={{ width: 60 }} />}
                  {varietyCols.avgTa && <View style={{ width: 72 }} />}
                  {varietyCols.avgPotAlc && <View style={{ width: 80 }} />}
                </View>
              </View>
            </ScrollView>
            </>
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

      {/* Per-vintage chemistry trend — shown once at least two vintages have data */}
      {!loading && !error && chemistryTrendData && (
        <View style={styles.chemTrendCard}>
          <View style={styles.chemTrendHeader}>
            <View style={styles.chemTrendTitleRow}>
              <Feather name="trending-up" size={14} color={colors.textSecondary} />
              <Text style={styles.chemTrendTitle}>Chemistry by Vintage</Text>
            </View>
            <Text style={styles.chemTrendSubtitle}>Average must chemistry across vintages</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chemTrendTable}>
              <View style={[styles.chemTrendRow, styles.chemTrendHeaderRow]}>
                <View style={[styles.chemTrendVintageCell, styles.chemTrendHeaderCell]}>
                  <Text style={styles.chemTrendHeaderLabel}>Vintage</Text>
                </View>
                <View style={[styles.chemTrendValueCell, styles.chemTrendHeaderCell]}>
                  <Text style={styles.chemTrendHeaderLabel}>Avg Brix °</Text>
                </View>
                <View style={[styles.chemTrendValueCell, styles.chemTrendHeaderCell]}>
                  <Text style={styles.chemTrendHeaderLabel}>Avg pH</Text>
                </View>
                <View style={[styles.chemTrendValueCell, styles.chemTrendHeaderCell]}>
                  <Text style={styles.chemTrendHeaderLabel}>Avg TA (g/L)</Text>
                </View>
                <View style={[styles.chemTrendPotAlcCell, styles.chemTrendHeaderCell]}>
                  <Text style={styles.chemTrendHeaderLabel}>Avg Pot. Alc %</Text>
                </View>
              </View>
              {chemistryTrendData.map((row, index) => (
                <View
                  key={row.vintageYear}
                  style={[
                    styles.chemTrendRow,
                    index < chemistryTrendData.length - 1 && styles.chemTrendDataRowBorder,
                  ]}
                >
                  <View style={styles.chemTrendVintageCell}>
                    <Text style={styles.chemTrendVintage}>{row.vintageYear}</Text>
                  </View>
                  <View style={styles.chemTrendValueCell}>
                    <Text style={styles.chemTrendValue}>{row.avgBrix != null ? row.avgBrix.toFixed(1) : "—"}</Text>
                  </View>
                  <View style={styles.chemTrendValueCell}>
                    <Text style={styles.chemTrendValue}>{row.avgPh != null ? row.avgPh.toFixed(2) : "—"}</Text>
                  </View>
                  <View style={styles.chemTrendValueCell}>
                    <Text style={[styles.chemTrendValue, styles.chemTrendTaValue]}>
                      {row.avgTa != null ? row.avgTa.toFixed(2) : "—"}
                    </Text>
                  </View>
                  <View style={styles.chemTrendPotAlcCell}>
                    <Text style={styles.chemTrendValue}>{row.avgPotAlc != null ? row.avgPotAlc.toFixed(1) : "—"}</Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
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
                isSinglePick={item.blockId != null && singlePickKeys.has(`${item.blockId}_${item.vintageYear}`)}
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
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  csvBtn: { padding: 4 },
  emailBtn: { padding: 4 },
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
  // Yield by Block × Vintage cross-tab
  yieldCrossTabCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  yieldCrossTabHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  yieldCrossTabHeaderCopy: { flex: 1, gap: 2 },
  yieldCrossTabTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  yieldCrossTabTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  yieldCrossTabSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  yieldCrossTabClearSort: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  yieldCrossTabClearSortText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
    textDecorationLine: "underline",
  },
  yieldCrossTabRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  yieldCrossTabHeaderRow: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  yieldCrossTabSubheaderRow: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  yieldCrossTabBlockHeader: {
    width: 136,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  yieldCrossTabVintageHeader: {
    width: 144,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  yieldCrossTabTotalHeader: {
    width: 144,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  yieldCrossTabMetricHeader: {
    width: 72,
    minHeight: 44,
    paddingHorizontal: 4,
    paddingVertical: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 3,
  },
  yieldCrossTabMetricHeaderBorder: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  yieldCrossTabActiveHeader: {
    backgroundColor: "rgba(99,102,241,0.08)" as any,
  },
  yieldCrossTabHeaderLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  yieldCrossTabHeaderLabelActive: {
    color: colors.primary,
  },
  yieldCrossTabDataRow: {
    minHeight: 48,
    backgroundColor: colors.surface,
  },
  yieldCrossTabDataRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  yieldCrossTabBlockCell: {
    width: 136,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: "center",
  },
  yieldCrossTabBlockName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  yieldCrossTabBlockArea: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  yieldCrossTabValueCell: {
    width: 72,
    paddingHorizontal: 4,
    paddingVertical: spacing.sm,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  yieldCrossTabValue: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  yieldCrossTabFooterRow: {
    minHeight: 44,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  yieldCrossTabFooterLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  yieldCrossTabFooterValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.text,
    fontVariant: ["tabular-nums"],
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
  pendingRow: {
    borderLeftWidth: 3,
    borderLeftColor: colors.textSecondary,
    paddingLeft: spacing.lg - 3,
  },
  rowLeft: { flex: 1, gap: 4 },
  rowDate: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  rowSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginLeft: spacing.sm },
  deleteBtn: { padding: 4 },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
  pendingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.background,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pendingBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
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
  singlePickBadge: {
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderColor: "#fcd34d",
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  singlePickBadgeText: {
    color: "#92400e",
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
  },
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
  varietyHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  varietyHeaderText: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  varietyColsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  varietyColsBtnActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(99,102,241,0.06)" as any,
  },
  varietyColsBtnText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: colors.textSecondary,
  },
  varietyColsBtnTextActive: {
    color: colors.primary,
  },
  varietyColsPanel: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  varietyColsPanelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  varietyColsPanelLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
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
  varietyTonneHint: {
    fontFamily: fonts.regular,
    fontSize: 9,
    lineHeight: 11,
    color: colors.primary,
    textDecorationLine: "underline",
    textAlign: "right",
    maxWidth: 72,
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
  // Variety bar chart
  varietyChart: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.xs,
  },
  varietyBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  varietyBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: "hidden",
  },
  varietyBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  varietyBarPct: {
    width: 32,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "right",
  },
  varietyLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  varietyLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  varietyLegendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  varietyLegendLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  // Variety name cell with swatch dot
  varietyNameCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  varietyRowSwatch: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
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
  // Per-vintage chemistry trend table
  chemTrendCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  chemTrendHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  chemTrendTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  chemTrendTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chemTrendSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chemTrendTable: {
    minWidth: 440,
  },
  chemTrendRow: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 42,
  },
  chemTrendHeaderRow: {
    backgroundColor: colors.background,
  },
  chemTrendHeaderCell: {
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  chemTrendHeaderLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "right",
  },
  chemTrendVintageCell: {
    width: 72,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  chemTrendValueCell: {
    width: 82,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: spacing.xs,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  chemTrendPotAlcCell: {
    width: 112,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  chemTrendVintage: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  chemTrendValue: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  chemTrendTaValue: {
    color: "#ef4444",
  },
  chemTrendDataRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});

const YIELD_CHART_COLORS = [
  "#6366f1", "#10b981", "#f59e0b", "#ef4444",
  "#3b82f6", "#ec4899", "#8b5cf6", "#14b8a6",
  "#f97316", "#84cc16",
];
