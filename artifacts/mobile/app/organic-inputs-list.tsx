import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { router, useFocusEffect } from "expo-router";
import { Platform } from "react-native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useSync } from "@/lib/context/SyncContext";
import { getPendingSyncItems, kvGet, requestPendingSyncItemDiscard } from "@/lib/database";
import { STORAGE_KEYS } from "@/lib/storage";
import { parseQueuedOrganicInputEdit } from "@/lib/organicInputOfflineEdit";
import { buildInputRegisterCsv } from "@/lib/organicInputRegisterCsv";
import { scheduleSync } from "@/lib/sync-engine";
import {
  buildFilteredRestrictedInputsCsv,
  buildRestrictedInputsCsvFilename,
  filterRestrictedInputs,
  type RestrictedInputsStatusFilter,
} from "@/lib/organicRestrictedInputsCsv";
import { organicInputRegisterHtml } from "@/lib/organicInputPrint";
import { usePrint } from "@/lib/hooks/usePrint";

function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

async function downloadInputRegisterCsv(records: DisplayRecord[], farmName: string, cropYear: number | null) {
  const safeName = farmName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const yearPart = cropYear ? `-${cropYear}` : "";
  const filename = `input-register${yearPart}-${safeName}.csv`;
  const csvContent = buildInputRegisterCsv(records);

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
      dialogTitle: "Share Input Register CSV",
      UTI: "public.comma-separated-values-text",
    });
  } catch {
    Alert.alert("Export failed", "Could not generate or share the CSV file.");
  }
}

async function downloadRestrictedInputsCsv(
  records: DisplayRecord[],
  farmName: string,
  filter: RestrictedInputsStatusFilter,
) {
  const filename = buildRestrictedInputsCsvFilename(farmName, filter);
  const csvContent = buildFilteredRestrictedInputsCsv(records, filter);

  if (Platform.OS === "web") {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  const { shareAsync } = await import("expo-sharing");
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await shareAsync(uri, {
    mimeType: "text/csv",
    dialogTitle: "Share Restricted Inputs CSV",
    UTI: "public.comma-separated-values-text",
  });
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00Z");
  if (isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    let token: string | null = null;
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      token = await SecureStore.getItemAsync("auth_session_token");
    } else {
      try { token = localStorage.getItem("auth_session_token"); } catch { token = null; }
    }
    if (!token) {
      const raw = await kvGet("bde_auth_token");
      token = raw ? JSON.parse(raw) : null;
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const farmRaw = await kvGet("bde_current_farm");
    if (farmRaw) {
      const farm = JSON.parse(farmRaw);
      headers["x-tenant-slug"] = farm.tenantSlug || farm.slug || "";
    }
  } catch {}
  return headers;
}

interface ServerInputRecord {
  id: number;
  productName: string;
  inputType: string | null;
  approvalStatus: string;
  supplier: string | null;
  dateOfUse: string | null;
  quantityAmount: string | null;
  quantityUnit: string | null;
  certifierApprovalRef: string | null;
  derogationExpiryDate: string | null;
  fieldName: string | null;
  cropYear: number | null;
  notes: string | null;
  poReference: string | null;
  grnReference: string | null;
  justification: string | null;
  certifierNotified: boolean;
  appliedBy: string | null;
}

/** Unified shape for display — covers both server and local-pending records */
interface DisplayRecord {
  key: string;
  /** Numeric server id — present only for synced records */
  serverId: number | null;
  /** Local record UUID — present only for pending (not-yet-synced) records */
  localId: string | null;
  productName: string;
  inputType: string | null;
  approvalStatus: string;
  supplier: string | null;
  dateOfUse: string | null;
  quantityAmount: string | null;
  quantityUnit: string | null;
  certifierApprovalRef: string | null;
  derogationExpiryDate: string | null;
  fieldName: string | null;
  cropYear: number | null;
  notes: string | null;
  poReference: string | null;
  grnReference: string | null;
  justification: string | null;
  certifierNotified: boolean;
  appliedBy: string | null;
  pending: boolean;
  editPending: boolean;
}

function applyPendingEdit(
  record: DisplayRecord,
  changes: Record<string, unknown>,
): DisplayRecord {
  return {
    ...record,
    productName: String(changes.productName ?? record.productName),
    inputType: changes.inputType == null ? null : String(changes.inputType),
    approvalStatus: String(changes.approvalStatus ?? record.approvalStatus),
    supplier: changes.supplier == null ? null : String(changes.supplier),
    dateOfUse: changes.dateOfUse == null ? null : String(changes.dateOfUse),
    fieldName: changes.fieldName == null ? null : String(changes.fieldName),
    quantityAmount: changes.quantityAmount == null ? null : String(changes.quantityAmount),
    quantityUnit: changes.quantityUnit == null ? null : String(changes.quantityUnit),
    cropYear: changes.cropYear == null ? null : Number(changes.cropYear),
    certifierApprovalRef: changes.certifierApprovalRef == null ? null : String(changes.certifierApprovalRef),
    derogationExpiryDate: changes.derogationExpiryDate == null ? null : String(changes.derogationExpiryDate),
    notes: changes.notes == null ? null : String(changes.notes),
    justification: changes.justification == null ? record.justification : String(changes.justification),
    certifierNotified: changes.certifierNotified == null ? record.certifierNotified : Boolean(changes.certifierNotified),
    appliedBy: changes.appliedBy == null ? record.appliedBy : String(changes.appliedBy),
    // poReference / grnReference are not editable on mobile; preserve server value
    editPending: true,
  };
}

function pendingEditOnlyRecord(
  serverId: number,
  changes: Record<string, unknown>,
): DisplayRecord {
  return applyPendingEdit({
    key: `server-${serverId}`,
    serverId,
    localId: null,
    productName: "",
    inputType: null,
    approvalStatus: "permitted",
    supplier: null,
    dateOfUse: null,
    quantityAmount: null,
    quantityUnit: null,
    certifierApprovalRef: null,
    derogationExpiryDate: null,
    fieldName: null,
    cropYear: null,
    notes: null,
    poReference: null,
    grnReference: null,
    justification: null,
    certifierNotified: false,
    appliedBy: null,
    pending: false,
    editPending: false,
  }, changes);
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  permitted:  { label: "Permitted",  color: "#16a34a", bg: "#f0fdf4" },
  restricted: { label: "Restricted", color: "#d97706", bg: "#fffbeb" },
  derogation: { label: "Derogation", color: "#dc2626", bg: "#fef2f2" },
};

export default function OrganicInputsListScreen({ restrictedOnly = false }: { restrictedOnly?: boolean }) {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { pendingCount, refreshPendingCount } = useSync();
  const { savePdf } = usePrint();
  const farmId = currentFarm?.id;

  const [records, setRecords] = useState<DisplayRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<number | string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RestrictedInputsStatusFilter>("active");

  const apiBase = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";

  const load = useCallback(async () => {
    if (!farmId) { setLoading(false); return; }

    // Load records that are actually pending in the sync queue (authoritative — uses DB synced column,
    // not the unreliable JSON payload synced field which is not updated after sync).
    const allPending = await getPendingSyncItems();
    const pendingItems = allPending.filter(item => item.record_type === STORAGE_KEYS.ORGANIC_INPUTS);
    const pendingEditItems = allPending.filter(item => item.record_type === STORAGE_KEYS.ORGANIC_INPUT_EDITS);
    const pending: DisplayRecord[] = pendingItems
      .map(item => {
        const data = JSON.parse(item.data_json) as Record<string, unknown>;
        if (data.farmId !== farmId || data._discardRequested === true) return null;
        const rec: DisplayRecord = {
          key: `pending-${item.record_id}`,
          serverId: null,
          localId: item.record_id,
          productName: String(data.productName ?? ""),
          inputType: data.inputType ? String(data.inputType) : null,
          approvalStatus: String(data.approvalStatus ?? "permitted"),
          supplier: data.supplier ? String(data.supplier) : null,
          dateOfUse: data.dateOfUse ? String(data.dateOfUse) : null,
          quantityAmount: data.quantityAmount ? String(data.quantityAmount) : null,
          quantityUnit: data.quantityUnit ? String(data.quantityUnit) : null,
          certifierApprovalRef: data.certifierApprovalRef ? String(data.certifierApprovalRef) : null,
          derogationExpiryDate: data.derogationExpiryDate ? String(data.derogationExpiryDate) : null,
          fieldName: data.fieldName ? String(data.fieldName) : null,
          cropYear: data.cropYear ? Number(data.cropYear) : null,
          notes: data.notes ? String(data.notes) : null,
          poReference: null,
          grnReference: null,
           justification: data.justification ? String(data.justification) : null,
           certifierNotified: Boolean(data.certifierNotified),
           appliedBy: data.appliedBy ? String(data.appliedBy) : null,
          pending: true,
          editPending: false,
        };
        return rec;
      })
      .filter((r): r is DisplayRecord => r !== null);

    // Fetch server records if online — these are already-synced records
    let server: DisplayRecord[] = [];
    if (apiBase) {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${apiBase}/api/farms/${farmId}/organic/inputs`, { headers });
        if (res.ok) {
          const data = await res.json();
          server = (data.records as ServerInputRecord[]).map(r => ({
            key: `server-${r.id}`,
            serverId: r.id,
            localId: null,
            productName: r.productName,
            inputType: r.inputType,
            approvalStatus: r.approvalStatus,
            supplier: r.supplier,
            dateOfUse: r.dateOfUse,
            quantityAmount: r.quantityAmount,
            quantityUnit: r.quantityUnit,
            certifierApprovalRef: r.certifierApprovalRef,
            derogationExpiryDate: r.derogationExpiryDate,
            fieldName: r.fieldName,
            cropYear: r.cropYear,
            notes: r.notes,
            poReference: r.poReference,
            grnReference: r.grnReference,
             justification: r.justification,
             certifierNotified: r.certifierNotified,
             appliedBy: r.appliedBy,
            pending: false,
            editPending: false,
          }));
        }
      } catch {}
    }

    // Overlay the latest locally-saved edit on its server row until the queued PUT succeeds.
    // New offline records remain at the top, while pending edits retain their normal position.
    const pendingEdits = new Map<number, Record<string, unknown>>();
    for (const item of pendingEditItems) {
      try {
        const edit = parseQueuedOrganicInputEdit(JSON.parse(item.data_json));
        if (edit?.farmId === farmId && String(edit.serverRecordId) === item.record_id) {
          pendingEdits.set(edit.serverRecordId, edit.changes);
        }
      } catch {
        // Ignore malformed persisted edits so one bad queue row cannot strand
        // the whole list in its loading state. The sync engine marks it failed.
      }
    }
    const displayServer = server.map((record) => {
      const changes = pendingEdits.get(record.serverId!);
      return changes ? applyPendingEdit(record, changes) : record;
    });
    const displayedServerIds = new Set(displayServer.map(record => record.serverId));
    const offlineOnlyEdits = Array.from(pendingEdits.entries())
      .filter(([serverId]) => !displayedServerIds.has(serverId))
      .map(([serverId, changes]) => pendingEditOnlyRecord(serverId, changes));

    // Pending at top (awaiting sync), then server records ordered newest-first (API default)
    setRecords([...pending, ...offlineOnlyEdits, ...displayServer]);
    setLoading(false);
    setRefreshing(false);
  }, [farmId, apiBase, pendingCount]);

  // Reload whenever screen comes into focus (e.g. returning from add/edit form)
  useFocusEffect(useCallback(() => {
    setLoading(true);
    load();
  }, [load]));

  const onRefresh = () => { setRefreshing(true); load(); };

  const visibleRecords = restrictedOnly
    ? filterRestrictedInputs(records, statusFilter)
    : records;

  async function handleExport() {
    if (restrictedOnly) {
      const exportable = records.filter((record) => !record.pending && !record.editPending);
      const filteredExportable = filterRestrictedInputs(exportable, statusFilter);
      if (filteredExportable.length === 0) {
        Alert.alert(
          "Nothing to export",
          visibleRecords.length > 0
            ? "All records have edits or additions still awaiting sync. Please sync your data first, then export."
            : "There are no restricted inputs in this filter to download.",
        );
        return;
      }

      setExporting(true);
      try {
        await downloadRestrictedInputsCsv(
          exportable,
          currentFarm?.name ?? "farm",
          statusFilter,
        );
      } catch {
        Alert.alert("Export failed", "Could not generate or share the CSV file.");
      } finally {
        setExporting(false);
      }
      return;
    }

    // Include offline additions so the export matches the records visible in the
    // register. Keep queued edits out because they may not contain the complete
    // server record and therefore risk producing an inaccurate compliance row.
    const exportable = records.filter(r => !r.editPending);
    if (exportable.length === 0) {
      Alert.alert(
        "Nothing to export",
        records.length > 0
          ? "All records have edits still awaiting sync. Please sync your data first, then export."
          : "There are no input records to download."
      );
      return;
    }
    setExporting(true);
    try {
      const cropYears = [...new Set(exportable.map(r => r.cropYear).filter(Boolean) as number[])];
      const cropYear = cropYears.length === 1 ? cropYears[0] : null;
      await downloadInputRegisterCsv(exportable, currentFarm?.name ?? "farm", cropYear);
    } finally {
      setExporting(false);
    }
  }

  async function handlePrint() {
    if (restrictedOnly) return;

    // Match CSV: include offline additions, but not partial queued edits.
    const exportable = records.filter(r => !r.editPending);
    if (exportable.length === 0) {
      Alert.alert(
        "Nothing to print",
        records.length > 0
          ? "All records have edits still awaiting sync. Please sync your data first, then print."
          : "There are no input records to print.",
      );
      return;
    }

    setExporting(true);
    try {
      const cropYears = [...new Set(exportable.map(r => r.cropYear).filter(Boolean) as number[])];
      const cropYear = cropYears.length === 1 ? cropYears[0] : null;
      await savePdf(
        organicInputRegisterHtml(exportable, currentFarm?.name ?? "farm", cropYear),
        "Organic Input Register",
      );
    } catch {
      Alert.alert("Print failed", "Could not generate or share the Input Register PDF.");
    } finally {
      setExporting(false);
    }
  }

  const handleEdit = (r: DisplayRecord) => {
    const sharedParams = {
      productName: r.productName ?? "",
      inputType: r.inputType ?? "",
      approvalStatus: r.approvalStatus ?? "permitted",
      supplier: r.supplier ?? "",
      dateOfUse: r.dateOfUse ?? "",
      quantityAmount: r.quantityAmount ?? "",
      quantityUnit: r.quantityUnit ?? "",
      cropYear: r.cropYear != null ? String(r.cropYear) : "",
      certifierApprovalRef: r.certifierApprovalRef ?? "",
      derogationExpiryDate: r.derogationExpiryDate ?? "",
      fieldName: r.fieldName ?? "",
      notes: r.notes ?? "",
    };
    if (r.pending && r.localId) {
      router.push({
        pathname: "/organic-input",
        params: { pendingId: r.localId, ...sharedParams },
      });
    } else if (r.serverId) {
      router.push({
        pathname: "/organic-input",
        params: { id: String(r.serverId), ...sharedParams },
      });
    }
  };

  const handleDeletePending = (r: DisplayRecord) => {
    if (!r.localId) return;
    Alert.alert(
      "Discard Pending Record",
      `Remove "${r.productName}"? If syncing has already started, its server copy will also be removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: async () => {
            setDeleting(r.localId!);
            try {
              const queued = await requestPendingSyncItemDiscard(
                STORAGE_KEYS.ORGANIC_INPUTS,
                r.localId!,
              );
              if (!queued) {
                throw new Error("Pending record is no longer available");
              }
              setRecords(prev => prev.filter(x => x.localId !== r.localId));
              await refreshPendingCount();
              await scheduleSync();
            } catch {
              Alert.alert("Error", "Could not discard this record. Please try again.");
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  const handleDelete = (r: DisplayRecord) => {
    if (!r.serverId || !farmId) return;
    Alert.alert(
      "Delete Input Record",
      `Remove "${r.productName}" from the organic input register? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(r.serverId!);
            try {
              const headers = await getAuthHeaders();
              const res = await fetch(
                `${apiBase}/api/farms/${farmId}/organic/inputs/${r.serverId}`,
                { method: "DELETE", headers }
              );
              if (!res.ok) {
                Alert.alert("Error", "Could not delete this record. Please try again.");
              } else {
                setRecords(prev => prev.filter(x => x.serverId !== r.serverId));
              }
            } catch {
              Alert.alert("Error", "Could not delete this record. Please try again.");
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{restrictedOnly ? "Restricted Inputs" : "Organic Inputs"}</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={[styles.exportBtn, exporting && { opacity: 0.5 }]}
            onPress={handleExport}
            disabled={exporting}
            accessibilityRole="button"
            accessibilityLabel={restrictedOnly ? "Export Restricted Inputs CSV" : "Export CSV"}
          >
            {exporting
              ? <ActivityIndicator size="small" color={colors.primary} />
              : <Feather name="download" size={16} color={colors.primary} />}
            <Text style={styles.exportLabel}>{exporting ? "…" : restrictedOnly ? "Export CSV" : "CSV"}</Text>
          </Pressable>
          {!restrictedOnly && (
            <Pressable
              style={[styles.exportBtn, exporting && { opacity: 0.5 }]}
              onPress={handlePrint}
              disabled={exporting}
              accessibilityRole="button"
              accessibilityLabel="Print or share Input Register PDF"
            >
              {exporting
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Feather name="printer" size={16} color={colors.primary} />}
              <Text style={styles.exportLabel}>{exporting ? "…" : "Print / Share PDF"}</Text>
            </Pressable>
          )}
          {!restrictedOnly && (
            <Pressable style={styles.addButton} onPress={() => router.push("/organic-input")}>
              <Feather name="plus" size={22} color={colors.primary} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {restrictedOnly && (
          <>
            <View style={styles.restrictedInfo}>
              <Feather name="alert-triangle" size={16} color="#92400e" />
              <Text style={styles.restrictedInfoText}>
                Restricted and derogation inputs for audit review. The CSV includes the records shown for the selected status.
              </Text>
            </View>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Derogation status</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {(["active", "pending", "expired", "all"] as RestrictedInputsStatusFilter[]).map((filter) => (
                  <Pressable
                    key={filter}
                    style={[styles.filterChip, statusFilter === filter && styles.filterChipActive]}
                    onPress={() => setStatusFilter(filter)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: statusFilter === filter }}
                  >
                    <Text style={[
                      styles.filterChipText,
                      statusFilter === filter && styles.filterChipTextActive,
                    ]}>
                      {filter[0].toUpperCase() + filter.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </>
        )}
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : visibleRecords.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="package" size={32} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>
              {restrictedOnly
                ? `No ${statusFilter === "all" ? "restricted or derogation" : statusFilter} inputs`
                : "No inputs recorded"}
            </Text>
            <Text style={styles.emptySubtext}>
              {restrictedOnly
                ? "Restricted or derogation inputs recorded in the Organic Inputs register will appear here."
                : "Tap + to log an organic input — fertilisers, sprays, feed supplements, and other approved products."}
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            {visibleRecords.map((r, i) => {
              const status = STATUS_CONFIG[r.approvalStatus] ?? { label: r.approvalStatus, color: colors.textSecondary, bg: colors.surface };
              const needsExpiry = r.approvalStatus === "restricted" || r.approvalStatus === "derogation";
              const expiryDays = daysUntil(r.derogationExpiryDate);
              const isExpired = expiryDays !== null && expiryDays < 0;
              const isExpiringSoon = expiryDays !== null && expiryDays >= 0 && expiryDays <= 30;
              const isDeleting = r.pending ? deleting === r.localId : deleting === r.serverId;

              return (
                <View key={r.key}>
                  {i > 0 && <View style={styles.divider} />}
                  {/* Outer row is a plain View so the delete button sits beside the edit target */}
                  <View style={styles.row}>
                    {/* Tappable content area — opens new pending and synced records, unless a server edit is syncing */}
                    <Pressable
                      style={({ pressed }) => [styles.rowContent, pressed && !r.editPending && styles.rowPressed]}
                      onPress={() => { if (!r.editPending) handleEdit(r); }}
                      disabled={r.editPending}
                    >
                      <View style={styles.nameRow}>
                        <Text style={styles.productName} numberOfLines={1}>{r.productName}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                        </View>
                        {r.pending && (
                          <View style={styles.pendingBadge}>
                            <Text style={styles.pendingText}>Pending sync</Text>
                          </View>
                        )}
                        {r.editPending && (
                          <View style={styles.pendingBadge}>
                            <Text style={styles.pendingText}>Edit pending sync</Text>
                          </View>
                        )}
                      </View>

                      {r.inputType ? (
                        <Text style={styles.detail}>{r.inputType}</Text>
                      ) : null}

                      <View style={styles.metaRow}>
                        {r.dateOfUse ? (
                          <View style={styles.metaItem}>
                            <Feather name="calendar" size={11} color={colors.textSecondary} />
                            <Text style={styles.metaText}>{fmtDate(r.dateOfUse)}</Text>
                          </View>
                        ) : null}
                        {r.quantityAmount ? (
                          <View style={styles.metaItem}>
                            <Feather name="layers" size={11} color={colors.textSecondary} />
                            <Text style={styles.metaText}>{r.quantityAmount}{r.quantityUnit ? ` ${r.quantityUnit}` : ""}</Text>
                          </View>
                        ) : null}
                        {r.fieldName ? (
                          <View style={styles.metaItem}>
                            <Feather name="map-pin" size={11} color={colors.textSecondary} />
                            <Text style={styles.metaText}>{r.fieldName}</Text>
                          </View>
                        ) : null}
                      </View>

                      {needsExpiry && r.derogationExpiryDate ? (
                        <View style={styles.expiryRow}>
                          <Feather
                            name="clock"
                            size={12}
                            color={isExpired ? colors.textSecondary : isExpiringSoon ? "#d97706" : colors.textSecondary}
                          />
                          <Text style={[styles.expiryLabel, isExpiringSoon && !isExpired && styles.expiryWarnText]}>
                            Derogation expires: {fmtDate(r.derogationExpiryDate)}
                          </Text>
                          {isExpired ? (
                            <View style={styles.expiredBadge}>
                              <Text style={styles.expiredBadgeText}>Expired</Text>
                            </View>
                          ) : isExpiringSoon ? (
                            <View style={styles.warnBadge}>
                              <Text style={styles.warnBadgeText}>{expiryDays}d</Text>
                            </View>
                          ) : null}
                        </View>
                      ) : needsExpiry && !r.derogationExpiryDate ? (
                        <View style={styles.expiryRow}>
                          <Feather name="alert-circle" size={12} color="#d97706" />
                          <Text style={styles.noExpiryText}>No expiry date recorded</Text>
                        </View>
                      ) : null}

                      {r.certifierApprovalRef ? (
                        <Text style={styles.refText}>Ref: {r.certifierApprovalRef}</Text>
                      ) : null}
                    </Pressable>

                    {/* Delete + chevron sit OUTSIDE the edit Pressable so taps don't bubble */}
                    {(r.pending ? r.localId != null : !r.editPending && r.serverId != null) && (
                      <View style={styles.actions}>
                        <Pressable
                          style={styles.actionBtn}
                          onPress={() => r.pending ? handleDeletePending(r) : handleDelete(r)}
                          hitSlop={8}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <ActivityIndicator size="small" color={colors.textSecondary} />
                          ) : (
                            <Feather name="trash-2" size={16} color={colors.textSecondary} />
                          )}
                        </Pressable>
                        <Feather name="chevron-right" size={16} color={colors.textTertiary} />
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  addButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  exportLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: colors.primary },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text, flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  restrictedInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    borderWidth: 1,
    borderRadius: radius.lg,
  },
  restrictedInfoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    lineHeight: 20,
    color: "#92400e",
  },
  filterSection: { gap: spacing.sm },
  filterLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary },
  filterRow: { gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  filterChipText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary },
  filterChipTextActive: { color: colors.surface },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: "center",
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.textSecondary },
  emptySubtext: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textTertiary, textAlign: "center" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  divider: { height: 1, backgroundColor: colors.borderLight },
  row: { flexDirection: "row", alignItems: "center" },
  rowContent: { flex: 1, paddingVertical: spacing.md },
  rowPressed: { opacity: 0.6 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: 2, flexWrap: "wrap" },
  productName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  statusText: { fontFamily: fonts.semiBold, fontSize: fontSize.xs },
  pendingBadge: {
    backgroundColor: "#f1f5f9", paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: radius.full,
  },
  pendingText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  detail: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 4 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginTop: 2 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  expiryRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: spacing.xs },
  expiryLabel: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, flex: 1 },
  expiryWarnText: { color: "#92400e" },
  warnBadge: {
    backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: radius.full, overflow: "hidden",
  },
  warnBadgeText: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: "#92400e" },
  expiredBadge: {
    backgroundColor: "#f1f5f9", paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: radius.full, overflow: "hidden",
  },
  expiredBadgeText: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: colors.textSecondary },
  noExpiryText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#d97706" },
  refText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },
  actions: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginLeft: spacing.sm },
  actionBtn: { padding: 4 },
});
