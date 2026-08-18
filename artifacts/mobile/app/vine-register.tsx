import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Linking,
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
import { useFarm } from "@/lib/context/FarmContext";
import { apiFetch } from "@/lib/apiFetch";
import { useApiFetch } from "@/lib/hooks/useApiFetch";
import { useApiVineBlocks, type VineBlock } from "@/lib/hooks/useApiVineBlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { getApiBase, getAuthToken } from "@/lib/uploadPhoto";
import { kvGet } from "@/lib/database";

interface VineRegisterEntry {
  id: number;
  fsaVineRegisterRef: string | null;
  registeredVariety: string | null;
  registeredAreaHa: string | null;
  giClassification: string | null;
  wineColour: string | null;
  dateRegistered: string | null;
  isRemovedFromRegister: boolean | null;
}

interface FarmVitiMeta {
  fsaVineRegisterRef: string | null;
  fsaWineProductionRef: string | null;
  winegbMembershipNumber: string | null;
  appaRef: string | null;
}
function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Register Row ─────────────────────────────────────────────────────────────

function RegisterRow({ item }: { item: VineRegisterEntry }) {
  const isRemoved = !!item.isRemovedFromRegister;
  return (
    <View style={[styles.row, isRemoved && styles.rowRemoved]}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowVariety}>{item.registeredVariety ?? "—"}</Text>
        <View style={styles.rowMeta}>
          {!!item.registeredAreaHa && (
            <Text style={styles.rowSub}>
              {parseFloat(item.registeredAreaHa).toFixed(2)} ha
            </Text>
          )}
          {!!item.giClassification && (
            <Text style={styles.rowSub}> · {item.giClassification}</Text>
          )}
          {!!item.wineColour && (
            <Text style={styles.rowSub}> · {item.wineColour}</Text>
          )}
        </View>
        <View style={styles.rowMeta}>
          {!!item.fsaVineRegisterRef && (
            <Text style={styles.rowRef}>Ref: {item.fsaVineRegisterRef}</Text>
          )}
          {!!item.dateRegistered && (
            <Text style={styles.rowRef}>
              {item.fsaVineRegisterRef ? " · " : ""}Registered: {formatDate(item.dateRegistered)}
            </Text>
          )}
        </View>
      </View>
      {isRemoved ? (
        <View style={styles.removedBadge}>
          <Text style={styles.removedBadgeText}>Removed</Text>
        </View>
      ) : (
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Active</Text>
        </View>
      )}
    </View>
  );
}

// ─── RPA Warning Banner ────────────────────────────────────────────────────────

function RpaWarningBanner({
  sbiMissing,
  sectorMissing,
}: {
  sbiMissing: boolean;
  sectorMissing: boolean;
}) {
  if (!sbiMissing && !sectorMissing) return null;

  const missing =
    sbiMissing && sectorMissing
      ? "an SBI number and a Viticulture sector"
      : sbiMissing
      ? "an SBI number"
      : "a Viticulture sector";

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/more")}
      style={styles.rpaBanner}
      accessibilityRole="button"
      accessibilityLabel="RPA Export unavailable. Tap to go to Settings."
    >
      <Feather name="alert-triangle" size={15} color="#92400e" style={{ marginTop: 1 }} />
      <Text style={styles.rpaBannerText}>
        <Text style={styles.rpaBannerBold}>RPA Export unavailable: </Text>
        The Print RPA Reference action requires {missing} to be set.{" "}
        <Text style={styles.rpaBannerLink}>Tap to go to Settings.</Text>
      </Text>
    </Pressable>
  );
}

function buildVineRegisterMailto(
  records: VineRegisterEntry[],
  farmName: string,
  sbi: string | null,
  address: string | null,
  vitiMeta: FarmVitiMeta,
): { href: string; isTruncated: boolean } {
  const fsaRef = vitiMeta.fsaVineRegisterRef?.trim() ?? "";
  const fsaWineRef = vitiMeta.fsaWineProductionRef?.trim() ?? "";
  const winegbNo = vitiMeta.winegbMembershipNumber?.trim() ?? "";
  const appaRef = vitiMeta.appaRef?.trim() ?? "";
  const sbiStr = sbi?.trim() ?? "";
  const addressStr = address?.trim() ?? "";
  const printed = new Date().toLocaleDateString("en-GB");

  const activeRecords = records.filter(r => !r.isRemovedFromRegister);
  const removedRecords = records.filter(r => !!r.isRemovedFromRegister);
  const totalHa = records.reduce((sum, r) => {
    const n = parseFloat(r.registeredAreaHa ?? "");
    return sum + (isNaN(n) ? 0 : n);
  }, 0);

  const col = (v: string | null | undefined, width: number) => {
    const s = v == null || v === "" ? "—" : v;
    return s.length <= width ? s.padEnd(width) : s.slice(0, width - 1) + "…";
  };
  const d = (v: string | null | undefined) =>
    v ? new Date(v).toLocaleDateString("en-GB") : "—";

  const headerLine = [
    col("Variety", 24),
    col("FSA Ref", 16),
    col("Area (ha)", 10),
    col("GI", 22),
    col("Wine Colour", 16),
    col("Date Reg.", 12),
    col("Status", 8),
  ].join("  ");
  const separator = "-".repeat(headerLine.length);

  const buildLines = (recs: VineRegisterEntry[]) =>
    recs.map(r => [
      col(r.registeredVariety, 24),
      col(r.fsaVineRegisterRef, 16),
      col(r.registeredAreaHa ? parseFloat(r.registeredAreaHa).toFixed(4) : "—", 10),
      col(r.giClassification, 22),
      col(r.wineColour, 16),
      col(d(r.dateRegistered), 12),
      col(r.isRemovedFromRegister ? "Removed" : "Active", 8),
    ].join("  "));

  const body = [
    `FSA Vine Register — ${farmName}`,
    ``,
    `Farm: ${farmName}`,
    addressStr ? `Address: ${addressStr}` : `Address: (not set — add in Farm Settings)`,
    sbiStr ? `SBI Number: ${sbiStr}` : `SBI Number: (not set — add in Farm Settings)`,
    fsaRef ? `FSA Vine Register Ref: ${fsaRef}` : `FSA Vine Register Ref: (not set — add in Farm Settings)`,
    fsaWineRef ? `FSA Wine Production Ref: ${fsaWineRef}` : `FSA Wine Production Ref: (not set — add in Farm Settings)`,
    ...(winegbNo ? [`WineGB Membership No: ${winegbNo}`] : []),
    ...(appaRef ? [`APPA Ref: ${appaRef}`] : []),
    `Date: ${printed}`,
    `Entries: ${records.length}   Active: ${activeRecords.length}   Removed: ${removedRecords.length}   Total area: ${totalHa.toFixed(4)} ha`,
    ``,
    separator,
    headerLine,
    separator,
    ...(activeRecords.length > 0 ? buildLines(activeRecords) : [`(no active entries)`]),
    ...(removedRecords.length > 0 ? [separator, `Removed from register:`, ...buildLines(removedRecords)] : []),
    separator,
    ``,
    `Prepared by BDE Farm Trac. Mandatory FSA register for UK vineyards over 0.01 ha.`,
  ].join("\n");

  const subject = encodeURIComponent(
    `FSA Vine Register — ${farmName}${fsaRef ? ` (Ref: ${fsaRef})` : ""}`,
  );
  const encodedBody = encodeURIComponent(body);
  const href = `mailto:?subject=${subject}&body=${encodedBody}`;
  return { href, isTruncated: encodedBody.length > MAILTO_BODY_LIMIT };
}

// ─── Missing Parcel Ref Banner ─────────────────────────────────────────────────

function MissingParcelRefBanner({
  blocks,
  onBlockPress,
}: {
  blocks: VineBlock[];
  onBlockPress: (block: VineBlock) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  if (blocks.length === 0) return null;

  return (
    <View style={styles.parcelBanner}>
      <Pressable
        onPress={() => setExpanded(e => !e)}
        style={styles.parcelBannerHeader}
        accessibilityRole="button"
        accessibilityLabel={`${blocks.length} block${blocks.length === 1 ? "" : "s"} missing Parcel / Field Ref`}
      >
        <Feather name="alert-triangle" size={15} color="#92400e" style={{ marginTop: 1 }} />
        <Text style={styles.parcelBannerTitle}>
          <Text style={styles.parcelBannerBold}>
            {blocks.length} block{blocks.length === 1 ? "" : "s"} missing Parcel / Field Ref
          </Text>
          {" — "}tap a block to add it
        </Text>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={14}
          color="#92400e"
        />
      </Pressable>
      {expanded && (
        <View style={styles.parcelBannerList}>
          {blocks.map((block, idx) => (
            <Pressable
              key={block.id}
              onPress={() => onBlockPress(block)}
              style={[
                styles.parcelBannerItem,
                idx < blocks.length - 1 && styles.parcelBannerItemBorder,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Add Parcel / Field Ref for ${block.blockName}`}
            >
              <Text style={styles.parcelBannerBlockName}>{block.blockName}</Text>
              <Feather name="edit-2" size={13} color="#b45309" />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Edit Parcel Ref Modal ────────────────────────────────────────────────────

function EditParcelRefModal({
  block,
  farmId,
  onClose,
  onSaved,
}: {
  block: VineBlock | null;
  farmId: number | undefined;
  onClose: () => void;
  onSaved: (blockId: number) => void;
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state whenever the block changes
  React.useEffect(() => {
    if (block) {
      setValue(block.fieldParcelRef ?? "");
      setError(null);
    }
  }, [block]);

  const handleSave = useCallback(async () => {
    if (!block || !farmId) return;
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Please enter a Parcel / Field Ref.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-blocks/${block.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fieldParcelRef: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSaved(block.id);
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [block, farmId, value, onSaved, onClose]);

  return (
    <Modal
      visible={!!block}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Add Parcel / Field Ref</Text>
          {!!block && (
            <Text style={styles.modalSubtitle}>{block.blockName}</Text>
          )}
          <Text style={styles.modalHint}>
            Enter the reference used for this block in the Rural Payments portal.
          </Text>
          <TextInput
            style={[styles.modalInput, !!error && styles.modalInputError]}
            value={value}
            onChangeText={v => { setValue(v); setError(null); }}
            placeholder="e.g. SX1234 5678"
            placeholderTextColor={colors.textSecondary}
            autoFocus
            autoCapitalize="characters"
            returnKeyType="done"
            onSubmitEditing={handleSave}
            editable={!saving}
          />
          {!!error && (
            <Text style={styles.modalError}>{error}</Text>
          )}
          <View style={styles.modalButtons}>
            <Pressable
              onPress={onClose}
              style={[styles.modalBtn, styles.modalBtnCancel]}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Text style={styles.modalBtnCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={[styles.modalBtn, styles.modalBtnSave, saving && styles.modalBtnDisabled]}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Save Parcel / Field Ref"
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.modalBtnSaveText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface AddEntryForm {
  registeredVariety: string;
  registeredAreaHa: string;
  giClassification: string;
  wineColour: string;
  fsaVineRegisterRef: string;
  dateRegistered: string;
}
export default function VineRegisterScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { farmName, sbiNumber, address, loading: identifiersLoading } = useFarmIdentifiers(currentFarm?.id);
  const vitiMeta = useFarmVitiMeta(currentFarm?.id);
  const { records, loading, refreshing, error, refresh } = useApiFetch<VineRegisterEntry>(
    currentFarm?.id,
    "/api/farms/:farmId/vine-register",
  );
  const farmIdStr = currentFarm?.id != null ? String(currentFarm.id) : undefined;
  const { blocks, loading: blocksLoading } = useApiVineBlocks(farmIdStr);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "removed">("active");
  const [addEntryVisible, setAddEntryVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<VineBlock | null>(null);
  // Track blocks whose ref has been saved this session so the banner hides
  // them immediately without needing a full re-fetch of the blocks list.
  const [savedBlockIds, setSavedBlockIds] = useState<Set<number>>(new Set());

  const sbiMissing = !identifiersLoading && !sbiNumber;
  const sectorMissing = !currentFarm?.sectorViticulture;
  const showRpaWarning = !identifiersLoading && (sbiMissing || sectorMissing);

  // Only show the parcel ref banner when the farm has the Viticulture sector
  // enabled (same condition as the desktop RPA buttons).
  const missingParcelRefBlocks: VineBlock[] = currentFarm?.sectorViticulture
    ? blocks.filter(
        b =>
          !savedBlockIds.has(b.id) &&
          (!b.fieldParcelRef || String(b.fieldParcelRef).trim() === ""),
      )
    : [];

  const handleEmailPress = useCallback(() => {
    if (!records.length) return;
    const name = farmName ?? currentFarm?.name ?? "Farm";
    const { href, isTruncated } = buildVineRegisterMailto(
      records,
      name,
      sbiNumber,
      address,
      vitiMeta,
    );
    if (isTruncated) {
      Alert.alert(
        "Email may be cut off",
        "Your vine register has too many entries to fit in a single email — the message body may be truncated by your email app.\n\nFor a complete record, use the dashboard on desktop to export a CSV instead.",
        [
          {
            text: "Open email anyway",
            onPress: () => {
              Linking.openURL(href).catch(() => {
                Alert.alert("Could not open email", "No email app was found on this device.");
              });
            },
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }
    Linking.openURL(href).catch(() => {
      Alert.alert("Could not open email", "No email app was found on this device.");
    });
  }, [records, farmName, currentFarm?.name, sbiNumber, address, vitiMeta]);

  const handleBlockSaved = useCallback((blockId: number) => {
    setSavedBlockIds(prev => new Set([...prev, blockId]));
  }, []);

  const activeRecords = records.filter(r => !r.isRemovedFromRegister);
  const totalAreaHa = activeRecords.reduce((sum, r) => {
    const area = parseFloat(r.registeredAreaHa ?? "");
    return sum + (isNaN(area) ? 0 : area);
  }, 0);

  const statusFiltered =
    statusFilter === "active"
      ? records.filter(r => !r.isRemovedFromRegister)
      : statusFilter === "removed"
      ? records.filter(r => !!r.isRemovedFromRegister)
      : records;

  const filtered = search.trim()
    ? statusFiltered.filter(r =>
        (r.registeredVariety ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (r.fsaVineRegisterRef ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : statusFiltered;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>FSA Vine Register</Text>
        {records.length > 0 && (
          <Pressable
            onPress={handleEmailPress}
            style={styles.emailBtn}
            hitSlop={12}
            accessibilityLabel="Email vine register"
            accessibilityRole="button"
          >
            <Feather name="mail" size={20} color={colors.primary} />
          </Pressable>
        )}
        <Pressable
          onPress={() => setAddEntryVisible(true)}
          style={styles.addBtn}
          accessibilityRole="button"
          accessibilityLabel="Add register entry"
          hitSlop={8}
        >
          <Feather name="plus" size={20} color={colors.primary} />
        </Pressable>
      </View>

      {/* RPA missing-fields warning */}
      {showRpaWarning && (
        <RpaWarningBanner sbiMissing={sbiMissing} sectorMissing={sectorMissing} />
      )}

      {/* Missing Parcel / Field Ref warning */}
      {!blocksLoading && missingParcelRefBlocks.length > 0 && (
        <MissingParcelRefBanner
          blocks={missingParcelRefBlocks}
          onBlockPress={setEditingBlock}
        />
      )}

      {/* Summary card */}
      {!loading && !error && records.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{activeRecords.length}</Text>
            <Text style={styles.summaryLabel}>Active{"\n"}Entries</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{totalAreaHa.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Registered{"\n"}Area (ha)</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{records.length}</Text>
            <Text style={styles.summaryLabel}>Total{"\n"}Entries</Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search variety or FSA ref…"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Status filter chips */}
      <View style={styles.chipRow}>
        {(["all", "active", "removed"] as const).map(opt => (
          <Pressable
            key={opt}
            onPress={() => setStatusFilter(opt)}
            style={[styles.chip, statusFilter === opt && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: statusFilter === opt }}
            accessibilityLabel={opt === "all" ? "All entries" : opt === "active" ? "Active entries" : "Removed entries"}
          >
            <Text style={[styles.chipText, statusFilter === opt && styles.chipTextActive]}>
              {opt === "all" ? "All" : opt === "active" ? "Active" : "Removed"}
            </Text>
          </Pressable>
        ))}
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
          contentContainerStyle={
            filtered.length === 0 ? styles.emptyContainer : styles.listContent
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => <RegisterRow item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="list" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No register entries</Text>
              <Text style={styles.emptyText}>
                {search.trim()
                  ? "No entries match your search."
                  : statusFilter === "active"
                  ? "No active entries. Tap + to add one."
                  : statusFilter === "removed"
                  ? "No removed entries found."
                  : "Tap the + button above to add your first vine register entry."}
              </Text>
            </View>
          }
        />
      )}

      {/* Edit Parcel Ref Modal */}
      <EditParcelRefModal
        block={editingBlock}
        farmId={currentFarm?.id != null ? Number(currentFarm.id) : undefined}
        onClose={() => setEditingBlock(null)}
        onSaved={handleBlockSaved}
      />

      {/* Add Entry Modal */}
      <AddEntryModal
        visible={addEntryVisible}
        farmId={currentFarm?.id != null ? Number(currentFarm.id) : undefined}
        onClose={() => setAddEntryVisible(false)}
        onSaved={refresh}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  addBtn: { padding: 4 },
  emailBtn: { padding: 4 },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
    flex: 1,
  },
  rpaBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rpaBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  rpaBannerBold: {
    fontFamily: fonts.semiBold,
    color: "#92400e",
  },
  rpaBannerLink: {
    fontFamily: fonts.medium,
    color: "#92400e",
    textDecorationLine: "underline",
  },
  // ── Missing Parcel Ref Banner ──────────────────────────────────────────────
  parcelBanner: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    overflow: "hidden",
  },
  parcelBannerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
  },
  parcelBannerTitle: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  parcelBannerBold: {
    fontFamily: fonts.semiBold,
    color: "#92400e",
  },
  parcelBannerList: {
    borderTopWidth: 1,
    borderTopColor: "#fde68a",
  },
  parcelBannerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#fffbeb",
  },
  parcelBannerItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#fde68a",
  },
  parcelBannerBlockName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#92400e",
    flex: 1,
    marginRight: spacing.sm,
  },
  // ── Edit Parcel Ref Modal ──────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  modalSubtitle: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: -spacing.xs,
  },
  modalHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.xs,
  },
  modalInputError: {
    borderColor: colors.error,
  },
  modalError: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.error,
  },
  modalButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  modalBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  modalBtnCancel: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modalBtnCancelText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  modalBtnSave: {
    backgroundColor: colors.primary,
  },
  modalBtnDisabled: {
    opacity: 0.6,
  },
  modalBtnSaveText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#fff",
  },
  // ── Summary ────────────────────────────────────────────────────────────────
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  summaryStat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  summaryValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.md,
    marginTop: spacing.sm,
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
  chipRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: "#fff",
  },
  listContent: { paddingBottom: spacing.xl },
  emptyContainer: { flex: 1, justifyContent: "center" },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  rowRemoved: {
    opacity: 0.55,
  },
  rowLeft: { flex: 1, gap: 3 },
  rowVariety: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  rowSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  rowRef: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  activeBadge: {
    backgroundColor: "#f0fdf4",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#86efac",
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  activeBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#166534",
  },
  removedBadge: {
    backgroundColor: "#fef2f2",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fca5a5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  removedBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#991b1b",
  },
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
  errorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.error,
    flex: 1,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});

const addStyles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  sheetTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  cancelBtn: { paddingVertical: 4, paddingHorizontal: 4 },
  cancelText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    minWidth: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#fff",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: "#fef2f2",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorBannerText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.error,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  fieldGroup: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  required: {
    color: colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  chipTextSelected: {
    fontFamily: fonts.medium,
    color: "#fff",
  },
  varietySelected: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  varietySelectedText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  varietyList: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    maxHeight: 200,
    overflow: "hidden",
  },
  varietyItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  varietyItemText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  backToList: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.xs,
    paddingVertical: 4,
  },
  backToListText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
});
function useFarmVitiMeta(farmId: string | undefined): FarmVitiMeta {
  const [meta, setMeta] = useState<FarmVitiMeta>({
    fsaVineRegisterRef: null,
    fsaWineProductionRef: null,
    winegbMembershipNumber: null,
    appaRef: null,
  });

  const fetch_ = useCallback(async () => {
    if (!farmId) return;
    try {
      const apiBase = getApiBase();
      if (!apiBase) return;
      const token = await getAuthToken();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      // x-tenant-slug is required by the API; read it the same way useFarmIdentifiers does.
      try {
        const farmRaw = await kvGet("bde_current_farm");
        if (farmRaw) {
          const farm = JSON.parse(farmRaw) as { tenantSlug?: string; slug?: string };
          headers["x-tenant-slug"] = farm.tenantSlug ?? farm.slug ?? "";
        }
      } catch { /* best-effort */ }
      const res = await fetch(`${apiBase}/api/farms/${farmId}`, { headers });
      if (!res.ok) return;
      const data = await res.json() as { record?: Record<string, unknown> };
      const r = data.record ?? {};
      setMeta({
        fsaVineRegisterRef: r.fsaVineRegisterRef != null ? String(r.fsaVineRegisterRef) : null,
        fsaWineProductionRef: r.fsaWineProductionRef != null ? String(r.fsaWineProductionRef) : null,
        winegbMembershipNumber: r.winegbMembershipNumber != null ? String(r.winegbMembershipNumber) : null,
        appaRef: r.appaRef != null ? String(r.appaRef) : null,
      });
    } catch {
      // best-effort — viticulture meta not critical for viewing the list
    }
  }, [farmId]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return meta;
}

const MAILTO_BODY_LIMIT = 1800;

const UK_GRAPE_VARIETIES = [
  "Bacchus", "Chardonnay", "Dornfelder", "Huxelrebe",
  "Madeleine Angevine", "Müller-Thurgau", "Ortega", "Phoenix",
  "Pinot Blanc", "Pinot Gris", "Pinot Meunier", "Pinot Noir",
  "Regent", "Reichensteiner", "Rondo", "Seyval Blanc",
  "Siegerrebe", "Solaris", "Auxerrois", "Cabernet Cortis",
  "Cabernet Blanc", "Johanniter", "Lakhta", "Sauvignon Blanc",
  "Other",
];

const COLOUR_OPTIONS = [
  "White", "Red", "Rosé",
  "Sparkling White", "Sparkling Rosé", "Sparkling Red",
];

const GI_OPTIONS = [
  "English Wine PDO", "English Wine PGI",
  "Welsh Wine PDO", "Welsh Wine PGI",
  "UK Table Wine", "No GI",
];

function AddEntryModal({
  visible,
  farmId,
  onClose,
  onSaved,
}: {
  visible: boolean;
  farmId: number | undefined;
  onClose: () => void;
  onSaved: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<AddEntryForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sf = (k: keyof AddEntryForm, v: string) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const reset = useCallback(() => {
    setForm(EMPTY_FORM);
    setError(null);
    setSaving(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleSave = useCallback(async () => {
    if (!farmId) return;
    if (!form.registeredVariety.trim()) {
      setError("Variety is required.");
      return;
    }
    const areaRaw = form.registeredAreaHa.trim();
    const area = parseFloat(areaRaw);
    if (!areaRaw || isNaN(area) || area <= 0) {
      setError("Registered Area (ha) is required and must be a positive number.");
      return;
    }
    const dateStr = form.dateRegistered.trim();
    if (dateStr) {
      const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
      if (!isValidDate) {
        setError("Date Registered must be in YYYY-MM-DD format (e.g. 2024-06-15).");
        return;
      }
    }
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        registeredVariety: form.registeredVariety.trim() || null,
        registeredAreaHa: areaRaw || null,
        giClassification: form.giClassification || null,
        wineColour: form.wineColour || null,
        fsaVineRegisterRef: form.fsaVineRegisterRef.trim() || null,
        dateRegistered: dateStr || null,
      };
      const res = await apiFetch(`/api/farms/${farmId}/vine-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      onSaved();
      reset();
      onClose();
    } catch {
      setError("Failed to save entry. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [farmId, form, onSaved, onClose, reset]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <View style={[addStyles.sheet, { paddingTop: insets.top || 16 }]}>
          {/* Sheet header */}
          <View style={addStyles.sheetHeader}>
            <Pressable
              onPress={handleClose}
              style={addStyles.cancelBtn}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              disabled={saving}
            >
              <Text style={addStyles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={addStyles.sheetTitle}>Add Register Entry</Text>
            <Pressable
              onPress={handleSave}
              style={[addStyles.saveBtn, saving && addStyles.saveBtnDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Save entry"
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={addStyles.saveText}>Save</Text>
              )}
            </Pressable>
          </View>

          {/* Error banner */}
          {!!error && (
            <View style={addStyles.errorBanner}>
              <Feather name="alert-circle" size={14} color={colors.error} />
              <Text style={addStyles.errorBannerText}>{error}</Text>
            </View>
          )}

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={addStyles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Variety */}
            <VarietyPicker
              value={form.registeredVariety}
              onChange={v => sf("registeredVariety", v)}
            />

            {/* Area */}
            <View style={addStyles.fieldGroup}>
              <Text style={addStyles.fieldLabel}>
                Registered Area (ha) <Text style={addStyles.required}>*</Text>
              </Text>
              <TextInput
                style={addStyles.input}
                value={form.registeredAreaHa}
                onChangeText={v => sf("registeredAreaHa", v)}
                placeholder="e.g. 0.50"
                placeholderTextColor={colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>

            {/* GI Classification */}
            <ChipPicker
              label="GI Classification"
              options={GI_OPTIONS}
              value={form.giClassification}
              onChange={v => sf("giClassification", v)}
            />

            {/* Wine Colour */}
            <ChipPicker
              label="Wine Colour"
              options={COLOUR_OPTIONS}
              value={form.wineColour}
              onChange={v => sf("wineColour", v)}
            />

            {/* FSA Ref */}
            <View style={addStyles.fieldGroup}>
              <Text style={addStyles.fieldLabel}>FSA Vine Register Ref</Text>
              <TextInput
                style={addStyles.input}
                value={form.fsaVineRegisterRef}
                onChangeText={v => sf("fsaVineRegisterRef", v)}
                placeholder="e.g. VR123456"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
            </View>

            {/* Date Registered */}
            <View style={[addStyles.fieldGroup, { marginBottom: spacing.xl }]}>
              <Text style={addStyles.fieldLabel}>Date Registered</Text>
              <TextInput
                style={addStyles.input}
                value={form.dateRegistered}
                onChangeText={v => sf("dateRegistered", v)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function VarietyPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [otherMode, setOtherMode] = useState(false);

  const handleClear = () => {
    setOtherMode(false);
    setQuery("");
    onChange("");
  };

  const filtered = query.trim()
    ? UK_GRAPE_VARIETIES.filter(v =>
        v.toLowerCase().includes(query.toLowerCase()),
      )
    : UK_GRAPE_VARIETIES;

  // "Other" selected — show free-text input for the actual variety name
  if (otherMode) {
    return (
      <View style={addStyles.fieldGroup}>
        <Text style={addStyles.fieldLabel}>
          Variety <Text style={addStyles.required}>*</Text>
        </Text>
        <TextInput
          style={addStyles.input}
          value={value}
          onChangeText={onChange}
          placeholder="Enter variety name"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="words"
          autoFocus
        />
        <Pressable
          onPress={handleClear}
          style={addStyles.backToList}
          accessibilityRole="button"
          accessibilityLabel="Back to variety list"
        >
          <Feather name="arrow-left" size={12} color={colors.primary} />
          <Text style={addStyles.backToListText}>Back to list</Text>
        </Pressable>
      </View>
    );
  }

  // Standard variety selected — show pill
  if (value) {
    return (
      <View style={addStyles.fieldGroup}>
        <Text style={addStyles.fieldLabel}>
          Variety <Text style={addStyles.required}>*</Text>
        </Text>
        <Pressable
          style={addStyles.varietySelected}
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel={`Selected: ${value}. Tap to clear.`}
        >
          <Text style={addStyles.varietySelectedText}>{value}</Text>
          <Feather name="x" size={14} color={colors.primary} />
        </Pressable>
      </View>
    );
  }

  // Default — searchable list
  return (
    <View style={addStyles.fieldGroup}>
      <Text style={addStyles.fieldLabel}>
        Variety <Text style={addStyles.required}>*</Text>
      </Text>
      <TextInput
        style={addStyles.input}
        placeholder="Search variety…"
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={setQuery}
        autoCapitalize="words"
      />
      <View style={addStyles.varietyList}>
        {filtered.map(v => (
          <Pressable
            key={v}
            style={addStyles.varietyItem}
            onPress={() => {
              if (v === "Other") {
                setOtherMode(true);
                onChange("");
              } else {
                onChange(v);
                setQuery("");
              }
            }}
            accessibilityRole="button"
          >
            <Text style={addStyles.varietyItemText}>{v}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ChipPicker({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <View style={addStyles.fieldGroup}>
      <Text style={addStyles.fieldLabel}>{label}</Text>
      <View style={addStyles.chipWrap}>
        {options.map(opt => (
          <Pressable
            key={opt}
            style={[addStyles.chip, value === opt && addStyles.chipSelected]}
            onPress={() => onChange(value === opt ? "" : opt)}
            accessibilityRole="button"
            accessibilityState={{ selected: value === opt }}
          >
            <Text style={[addStyles.chipText, value === opt && addStyles.chipTextSelected]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const EMPTY_FORM: AddEntryForm = {
  registeredVariety: "",
  registeredAreaHa: "",
  giClassification: "",
  wineColour: "",
  fsaVineRegisterRef: "",
  dateRegistered: "",
};
