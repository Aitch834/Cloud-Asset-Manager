import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useApiFetch } from "@/lib/hooks/useApiFetch";
import { useApiVineBlocks, type VineBlock } from "@/lib/hooks/useApiVineBlocks";
import { apiFetch } from "@/lib/apiFetch";

interface SprayDiaryRecord {
  id: number;
  applicationDate: string | null;
  blockId: number | null;
  productName: string | null;
  mappNumber: string | null;
  activeIngredient: string | null;
  productType: string | null;
  ratePerHectare: number | null;
  rateUnit: string | null;
  areaTreatedHa: number | null;
  windSpeedMph: number | null;
  temperatureCelsius: number | null;
  weatherConditions: string | null;
  operatorName: string | null;
  operatorCertificateNo: string | null;
  notes: string | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Block name lookup ────────────────────────────────────────────────────────

function useBlockName(blockId: number | null, blocks: VineBlock[]): string | null {
  if (!blockId) return null;
  return blocks.find(b => b.id === blockId)?.blockName ?? null;
}

// ─── Change Block Modal ────────────────────────────────────────────────────────

interface ChangeBlockModalProps {
  visible: boolean;
  record: SprayDiaryRecord | null;
  farmId: string;
  blocks: VineBlock[];
  blocksLoading: boolean;
  onClose: () => void;
  onSaved: (recordId: number, block: VineBlock | null) => void;
}

function ChangeBlockModal({ visible, record, farmId, blocks, blocksLoading, onClose, onSaved }: ChangeBlockModalProps) {
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [saving, setSaving] = useState(false);

  // Pre-select the currently linked block when modal opens
  React.useEffect(() => {
    if (visible && record) {
      const current = record.blockId ? blocks.find(b => b.id === record.blockId) ?? null : null;
      setSelectedBlock(current);
    }
  }, [visible, record, blocks]);

  const handleConfirm = async () => {
    if (!record) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-spray-diary/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId: selectedBlock?.id ?? null,
        }),
      });
      if (!res.ok) {
        Alert.alert("Save Failed", "Could not update the block link. Please try again.");
        setSaving(false);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSaved(record.id, selectedBlock);
    } catch {
      Alert.alert("Save Failed", "Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Change Block</Text>
          <Pressable onPress={onClose} style={modalStyles.closeBtn} hitSlop={12}>
            <Feather name="x" size={22} color={colors.text} />
          </Pressable>
        </View>

        {record && (
          <Text style={modalStyles.subtitle}>
            Spray diary · {formatDate(record.applicationDate)}
            {record.productName ? `  ·  ${record.productName}` : ""}
          </Text>
        )}

        <ScrollView style={modalStyles.scroll} contentContainerStyle={modalStyles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={modalStyles.sectionLabel}>Select a block to link this record to</Text>

          {blocksLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.md }} />
          ) : blocks.length === 0 ? (
            <Text style={modalStyles.emptyText}>No vineyard blocks found for this farm.</Text>
          ) : (
            <VineBlockPicker
              blocks={blocks}
              selected={selectedBlock}
              onSelect={setSelectedBlock}
              loading={false}
            />
          )}

          {selectedBlock && (
            <View style={modalStyles.selectedInfo}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={modalStyles.selectedInfoText}>
                Will link to <Text style={{ fontFamily: fonts.semiBold }}>{selectedBlock.blockName}</Text>
              </Text>
            </View>
          )}

          {!selectedBlock && record?.blockId && (
            <View style={modalStyles.unlinkInfo}>
              <Feather name="info" size={16} color={colors.textSecondary} />
              <Text style={modalStyles.unlinkInfoText}>Clearing the selection will unlink this record from its current block.</Text>
            </View>
          )}
        </ScrollView>

        <View style={modalStyles.footer}>
          <Button
            title={saving ? "Saving…" : "Confirm"}
            onPress={handleConfirm}
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
    </Modal>
  );
}

// ─── Record Row ───────────────────────────────────────────────────────────────

function SprayDiaryRow({
  item,
  blocks,
  onChangeBlock,
}: {
  item: SprayDiaryRecord;
  blocks: VineBlock[];
  onChangeBlock: (record: SprayDiaryRecord) => void;
}) {
  const linkedBlockName = useBlockName(item.blockId, blocks);
  const linked = !!item.blockId;

  const handlePress = () => {
    Haptics.selectionAsync();
    Alert.alert(
      formatDate(item.applicationDate),
      item.productName ?? "Spray entry",
      [
        {
          text: "Change Block",
          onPress: () => onChangeBlock(item),
        },
        { text: "Close", style: "cancel" },
      ],
    );
  };

  return (
    <Pressable style={styles.row} onPress={handlePress}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowDate}>{formatDate(item.applicationDate)}</Text>
        <Text style={styles.rowProduct} numberOfLines={1}>
          {item.productName ?? "—"}
          {item.productType ? <Text style={styles.rowProductType}>  {item.productType}</Text> : null}
        </Text>
        <View style={styles.rowMeta}>
          {linked ? (
            <View style={styles.blockTag}>
              <Feather name="layers" size={12} color={colors.primary} />
              <Text style={styles.blockTagText}>{linkedBlockName ?? "Block"}</Text>
            </View>
          ) : (
            <View style={styles.unlinkTag}>
              <Feather name="alert-circle" size={12} color={colors.warning ?? "#d97706"} />
              <Text style={styles.unlinkTagText}>No block linked</Text>
            </View>
          )}
          {item.operatorName ? (
            <Text style={styles.rowSub} numberOfLines={1}>{item.operatorName}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        {item.areaTreatedHa ? (
          <View style={styles.areaBadge}>
            <Text style={styles.areaBadgeText}>{Number(item.areaTreatedHa).toFixed(1)} ha</Text>
          </View>
        ) : null}
        <Feather name="chevron-right" size={16} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VineSprayDiaryHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { records, loading, refreshing, error, refresh } = useApiFetch<SprayDiaryRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/vineyard-spray-diary",
  );
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);

  const [search, setSearch] = useState("");
  const [changingRecord, setChangingRecord] = useState<SprayDiaryRecord | null>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<number, { blockId: number | null }>>({});

  const displayRecords = useMemo(() => {
    return records.map(r => {
      const update = localUpdates[r.id];
      if (update !== undefined) return { ...r, blockId: update.blockId };
      return r;
    });
  }, [records, localUpdates]);

  const filtered = useMemo(() => {
    if (!search.trim()) return displayRecords;
    const q = search.toLowerCase();
    return displayRecords.filter(r => {
      const blockName = r.blockId ? blocks.find(b => b.id === r.blockId)?.blockName ?? "" : "";
      return (
        (r.productName ?? "").toLowerCase().includes(q) ||
        blockName.toLowerCase().includes(q) ||
        (r.operatorName ?? "").toLowerCase().includes(q) ||
        (r.applicationDate ?? "").includes(q) ||
        (r.productType ?? "").toLowerCase().includes(q)
      );
    });
  }, [displayRecords, search, blocks]);

  const handleChangeBlock = (record: SprayDiaryRecord) => {
    setChangingRecord(record);
  };

  const handleBlockSaved = (recordId: number, block: VineBlock | null) => {
    setLocalUpdates(prev => ({
      ...prev,
      [recordId]: { blockId: block?.id ?? null },
    }));
    setChangingRecord(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Spray Diary History</Text>
      </View>

      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by product, block or operator…"
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
          renderItem={({ item }) => (
            <SprayDiaryRow
              item={item}
              blocks={blocks}
              onChangeBlock={handleChangeBlock}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="droplet" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No spray diary entries</Text>
              <Text style={styles.emptyText}>
                {search.trim() ? "No entries match your search." : "Spray diary entries you create will appear here."}
              </Text>
            </View>
          }
        />
      )}

      <ChangeBlockModal
        visible={changingRecord !== null}
        record={changingRecord}
        farmId={currentFarm?.id ?? ""}
        blocks={blocks}
        blocksLoading={blocksLoading}
        onClose={() => setChangingRecord(null)}
        onSaved={handleBlockSaved}
      />
    </View>
  );
}

const modalStyles = StyleSheet.create({
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
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.sm },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: "#f0fdf4",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.success,
  },
  selectedInfoText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.success,
    flex: 1,
  },
  unlinkInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unlinkInfoText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});

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
  rowProduct: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  rowProductType: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  rowSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginLeft: spacing.sm },
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
  areaBadge: {
    backgroundColor: colors.background,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  areaBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
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
