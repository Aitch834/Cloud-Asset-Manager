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

const PRESSURE_LABELS = ["None", "Low", "Medium", "High"];
const PRESSURE_COLORS = [colors.textSecondary, colors.success, colors.warning ?? "#f59e0b", colors.error];

interface ScoutingRecord {
  id: number;
  scoutDate: string | null;
  blockId: number | null;
  blockName: string | null;
  scoutedBy: string | null;
  downyMildewPressure: number | null;
  powderyMildewPressure: number | null;
  botrytisPressure: number | null;
  phomopsisPressure: number | null;
  leafhopperPressure: number | null;
  spiderMitePressure: number | null;
  vineWeevilSighted: boolean | null;
  eutypaDiebackSighted: boolean | null;
  xylellaFastidiosa: boolean | null;
  phytophthoraViticola: boolean | null;
  actionTaken: string | null;
  notes: string | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function pressureBadge(value: number | null): { label: string; color: string } | null {
  if (!value || value === 0) return null;
  const idx = Math.min(Math.max(Number(value), 0), 3);
  return { label: PRESSURE_LABELS[idx], color: PRESSURE_COLORS[idx] };
}

function highestPressure(r: ScoutingRecord): { label: string; color: string } | null {
  const vals = [
    r.downyMildewPressure,
    r.powderyMildewPressure,
    r.botrytisPressure,
    r.phomopsisPressure,
    r.leafhopperPressure,
    r.spiderMitePressure,
  ].map(v => (v == null ? 0 : Number(v)));
  const max = Math.max(...vals);
  return pressureBadge(max);
}

// ─── Change Block Modal ────────────────────────────────────────────────────────

interface ChangeBlockModalProps {
  visible: boolean;
  record: ScoutingRecord | null;
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
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-scouting/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId: selectedBlock?.id ?? null,
          blockName: selectedBlock?.blockName ?? null,
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
            Scouting record · {formatDate(record.scoutDate)}
            {record.scoutedBy ? `  ·  ${record.scoutedBy}` : ""}
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

function ScoutingRow({
  item,
  onChangeBlock,
}: {
  item: ScoutingRecord;
  onChangeBlock: (record: ScoutingRecord) => void;
}) {
  const linked = !!item.blockId;
  const pressure = highestPressure(item);
  const hasNotifiable = item.xylellaFastidiosa || item.phytophthoraViticola;

  const handlePress = () => {
    Haptics.selectionAsync();
    Alert.alert(
      formatDate(item.scoutDate),
      item.blockName ? `Block: ${item.blockName}` : "No block linked",
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
        <Text style={styles.rowDate}>{formatDate(item.scoutDate)}</Text>
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
          {item.scoutedBy ? (
            <Text style={styles.rowSub} numberOfLines={1}>{item.scoutedBy}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        {hasNotifiable && (
          <View style={[styles.badge, { backgroundColor: "#fef2f2", borderColor: colors.error }]}>
            <Text style={[styles.badgeText, { color: colors.error }]}>⚠ Notifiable</Text>
          </View>
        )}
        {!hasNotifiable && pressure && (
          <View style={[styles.badge, { backgroundColor: "#f5f5f5", borderColor: pressure.color }]}>
            <Text style={[styles.badgeText, { color: pressure.color }]}>{pressure.label}</Text>
          </View>
        )}
        <Feather name="chevron-right" size={16} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VineScoutingHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { records, loading, refreshing, error, refresh } = useApiFetch<ScoutingRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/vineyard-scouting",
  );
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);

  const [search, setSearch] = useState("");
  const [changingRecord, setChangingRecord] = useState<ScoutingRecord | null>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<number, { blockId: number | null; blockName: string | null }>>({});

  const displayRecords = useMemo(() => {
    return records.map(r => {
      const update = localUpdates[r.id];
      if (update !== undefined) return { ...r, blockId: update.blockId, blockName: update.blockName };
      return r;
    });
  }, [records, localUpdates]);

  const filtered = useMemo(() => {
    if (!search.trim()) return displayRecords;
    const q = search.toLowerCase();
    return displayRecords.filter(r =>
      (r.blockName ?? "").toLowerCase().includes(q) ||
      (r.scoutedBy ?? "").toLowerCase().includes(q) ||
      (r.scoutDate ?? "").includes(q),
    );
  }, [displayRecords, search]);

  const handleChangeBlock = (record: ScoutingRecord) => {
    setChangingRecord(record);
  };

  const handleBlockSaved = (recordId: number, block: VineBlock | null) => {
    setLocalUpdates(prev => ({
      ...prev,
      [recordId]: { blockId: block?.id ?? null, blockName: block?.blockName ?? null },
    }));
    setChangingRecord(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Scouting History</Text>
      </View>

      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by block, scout or date…"
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
            <ScoutingRow item={item} onChangeBlock={handleChangeBlock} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="eye-off" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No scouting records</Text>
              <Text style={styles.emptyText}>
                {search.trim() ? "No records match your search." : "Scouting records you create will appear here."}
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
});
