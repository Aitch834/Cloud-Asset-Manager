import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useMemo } from "react";
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

// ─── Pressure Picker ──────────────────────────────────────────────────────────

function PressurePicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={editStyles.pressureRow}>
      <Text style={editStyles.pressureLabel}>{label}</Text>
      <View style={editStyles.pressureButtons}>
        {PRESSURE_LABELS.map((l, i) => (
          <Pressable
            key={i}
            style={[editStyles.pressureBtn, value === i && { backgroundColor: PRESSURE_COLORS[i], borderColor: PRESSURE_COLORS[i] }]}
            onPress={() => { Haptics.selectionAsync(); onChange(i); }}
          >
            <Text style={[editStyles.pressureBtnText, value === i && { color: "#fff" }]}>{l}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Boolean Toggle ───────────────────────────────────────────────────────────

function BooleanToggle({ label, value, onChange, urgent }: { label: string; value: boolean; onChange: (v: boolean) => void; urgent?: boolean }) {
  return (
    <Pressable
      style={[editStyles.toggleRow, value && urgent && editStyles.toggleRowUrgent, value && !urgent && editStyles.toggleRowActive]}
      onPress={() => { Haptics.selectionAsync(); onChange(!value); }}
    >
      <Feather name={value ? "check-square" : "square"} size={18} color={value ? (urgent ? colors.error : colors.success) : colors.textSecondary} />
      <Text style={[editStyles.toggleLabel, value && urgent && { color: colors.error }]}>{label}</Text>
    </Pressable>
  );
}

// ─── Edit Scouting Modal ──────────────────────────────────────────────────────

interface EditScoutingModalProps {
  visible: boolean;
  record: ScoutingRecord | null;
  farmId: string;
  blocks: VineBlock[];
  blocksLoading: boolean;
  onClose: () => void;
  onSaved: (recordId: number, updated: Partial<ScoutingRecord>) => void;
}

function EditScoutingModal({ visible, record, farmId, blocks, blocksLoading, onClose, onSaved }: EditScoutingModalProps) {
  const [saving, setSaving] = useState(false);

  // Form state
  const [scoutDate, setScoutDate] = useState("");
  const [scoutedBy, setScoutedBy] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [downyMildew, setDownyMildew] = useState(0);
  const [powderyMildew, setPowderyMildew] = useState(0);
  const [botrytis, setBotrytis] = useState(0);
  const [phomopsis, setPhomopsis] = useState(0);
  const [leafhopper, setLeafhopper] = useState(0);
  const [spiderMite, setSpiderMite] = useState(0);
  const [vineWeevil, setVineWeevil] = useState(false);
  const [eutypaDieback, setEutypaDieback] = useState(false);
  const [xylella, setXylella] = useState(false);
  const [phytophthora, setPhytophthora] = useState(false);
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");

  // Pre-fill from record when modal opens
  React.useEffect(() => {
    if (visible && record) {
      setScoutDate(record.scoutDate ?? "");
      setScoutedBy(record.scoutedBy ?? "");
      const current = record.blockId ? blocks.find(b => b.id === record.blockId) ?? null : null;
      setSelectedBlock(current);
      setDownyMildew(Number(record.downyMildewPressure ?? 0));
      setPowderyMildew(Number(record.powderyMildewPressure ?? 0));
      setBotrytis(Number(record.botrytisPressure ?? 0));
      setPhomopsis(Number(record.phomopsisPressure ?? 0));
      setLeafhopper(Number(record.leafhopperPressure ?? 0));
      setSpiderMite(Number(record.spiderMitePressure ?? 0));
      setVineWeevil(Boolean(record.vineWeevilSighted));
      setEutypaDieback(Boolean(record.eutypaDiebackSighted));
      setXylella(Boolean(record.xylellaFastidiosa));
      setPhytophthora(Boolean(record.phytophthoraViticola));
      setActionTaken(record.actionTaken ?? "");
      setNotes(record.notes ?? "");
    }
  }, [visible, record, blocks]);

  const doSave = async () => {
    if (!record) return;
    setSaving(true);
    try {
      const body = {
        scoutDate: scoutDate || null,
        scoutedBy: scoutedBy.trim() || null,
        blockId: selectedBlock?.id ?? null,
        blockName: selectedBlock?.blockName ?? null,
        downyMildewPressure: downyMildew,
        powderyMildewPressure: powderyMildew,
        botrytisPressure: botrytis,
        phomopsisPressure: phomopsis,
        leafhopperPressure: leafhopper,
        spiderMitePressure: spiderMite,
        vineWeevilSighted: vineWeevil,
        eutypaDiebackSighted: eutypaDieback,
        xylellaFastidiosa: xylella,
        phytophthoraViticola: phytophthora,
        actionTaken: actionTaken.trim() || null,
        notes: notes.trim() || null,
      };

      const res = await apiFetch(`/api/farms/${farmId}/vineyard-scouting/${record.id}`, {
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

  const handleSave = () => {
    if (!scoutDate || !scoutedBy.trim()) {
      Alert.alert("Required Fields", "Please enter a scout date and scouted by name.");
      return;
    }
    if (xylella || phytophthora) {
      Alert.alert(
        "⚠️ Notifiable Pest Flagged",
        "You have flagged a possible notifiable plant pest. You must report this to APHA immediately on 0300 1000 313.\n\nRecord will still be saved.",
        [
          { text: "Understood — Save Record", style: "destructive", onPress: doSave },
          { text: "Cancel" },
        ],
      );
      return;
    }
    doSave();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={editStyles.container}>
          {/* Header */}
          <View style={editStyles.header}>
            <Text style={editStyles.title}>Edit Scouting Record</Text>
            <Pressable onPress={onClose} style={editStyles.closeBtn} hitSlop={12}>
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={editStyles.scroll} contentContainerStyle={editStyles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* ── Walkabout Details ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Walkabout Details</Text>

              <Text style={editStyles.fieldLabel}>Scout Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={scoutDate}
                onChangeText={setScoutDate}
                keyboardType="numeric"
              />

              <Text style={editStyles.fieldLabel}>Scouted By *</Text>
              <Input
                placeholder="Enter name"
                value={scoutedBy}
                onChangeText={setScoutedBy}
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
                <Pressable
                  onPress={() => setSelectedBlock(null)}
                  style={editStyles.clearBlockBtn}
                >
                  <Feather name="x" size={12} color={colors.textSecondary} />
                  <Text style={editStyles.clearBlockText}>Clear block link</Text>
                </Pressable>
              )}
            </View>

            {/* ── Disease Pressure ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Disease Pressure</Text>
              <PressurePicker label="Downy Mildew" value={downyMildew} onChange={setDownyMildew} />
              <PressurePicker label="Powdery Mildew" value={powderyMildew} onChange={setPowderyMildew} />
              <PressurePicker label="Botrytis" value={botrytis} onChange={setBotrytis} />
              <PressurePicker label="Phomopsis" value={phomopsis} onChange={setPhomopsis} />
            </View>

            {/* ── Pest Pressure ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Pest Pressure</Text>
              <PressurePicker label="Leafhopper" value={leafhopper} onChange={setLeafhopper} />
              <PressurePicker label="Spider Mite" value={spiderMite} onChange={setSpiderMite} />
              <BooleanToggle label="Vine Weevil sighted" value={vineWeevil} onChange={setVineWeevil} urgent />
              <BooleanToggle label="Eutypa Dieback sighted" value={eutypaDieback} onChange={setEutypaDieback} />
            </View>

            {/* ── Notifiable ── */}
            <View style={[editStyles.card, { borderColor: colors.error, borderWidth: 1.5 }]}>
              <Text style={[editStyles.sectionTitle, { color: colors.error }]}>Notifiable Plant Pests</Text>
              <Text style={editStyles.helperText}>
                Report to APHA immediately on 0300 1000 313 if any of these are suspected. Do not move plant material off-site.
              </Text>
              <BooleanToggle label="Xylella fastidiosa suspected" value={xylella} onChange={setXylella} urgent />
              <BooleanToggle label="Phytophthora viticola suspected" value={phytophthora} onChange={setPhytophthora} urgent />
            </View>

            {/* ── Actions & Notes ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Actions & Notes</Text>
              <Text style={editStyles.fieldLabel}>Action Taken</Text>
              <Input placeholder="Describe any action taken…" value={actionTaken} onChangeText={setActionTaken} multiline numberOfLines={3} />
              <Text style={editStyles.fieldLabel}>Notes</Text>
              <Input placeholder="Additional observations…" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
            </View>
          </ScrollView>

          {/* Footer */}
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

function ScoutingRow({
  item,
  onEdit,
  onDelete,
}: {
  item: ScoutingRecord;
  onEdit: (record: ScoutingRecord) => void;
  onDelete: (id: number) => void;
}) {
  const linked = !!item.blockId;
  const pressure = highestPressure(item);
  const hasNotifiable = item.xylellaFastidiosa || item.phytophthoraViticola;

  const handlePress = () => {
    Haptics.selectionAsync();
    onEdit(item);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Scouting Record",
      `Delete the scouting record from ${formatDate(item.scoutDate)}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) },
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

export default function VineScoutingHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { address, loading: identifiersLoading } = useFarmIdentifiers(currentFarm?.id);
  const { records, loading, refreshing, error, refresh } = useApiFetch<ScoutingRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/vineyard-scouting",
  );
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);

  const missingAddressFields: string[] = !identifiersLoading
    ? [
        !currentFarm?.name || currentFarm.name.trim() === "" ? "Farm name" : "",
        !address || address.trim() === "" ? "Farm address" : "",
      ].filter(Boolean)
    : [];

  const [search, setSearch] = useState("");
  const [editingRecord, setEditingRecord] = useState<ScoutingRecord | null>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<number, Partial<ScoutingRecord>>>({});
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  const displayRecords = useMemo(() => {
    return records
      .filter(r => !deletedIds.has(r.id))
      .map(r => {
        const update = localUpdates[r.id];
        if (update !== undefined) return { ...r, ...update };
        return r;
      });
  }, [records, localUpdates, deletedIds]);

  const filtered = useMemo(() => {
    if (!search.trim()) return displayRecords;
    const q = search.toLowerCase();
    return displayRecords.filter(r =>
      (r.blockName ?? "").toLowerCase().includes(q) ||
      (r.scoutedBy ?? "").toLowerCase().includes(q) ||
      (r.scoutDate ?? "").includes(q),
    );
  }, [displayRecords, search]);

  const handleSaved = (recordId: number, updated: Partial<ScoutingRecord>) => {
    setLocalUpdates(prev => ({
      ...prev,
      [recordId]: { ...(prev[recordId] ?? {}), ...updated },
    }));
    setEditingRecord(null);
  };

  const handleDelete = async (id: number) => {
    // Optimistically remove from the list
    setDeletedIds(prev => new Set(prev).add(id));
    try {
      const res = await apiFetch(`/api/farms/${currentFarm?.id}/vineyard-scouting/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        // Restore on failure
        setDeletedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        Alert.alert("Delete Failed", "Could not delete the record. Please try again.");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setDeletedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      Alert.alert("Delete Failed", "Could not reach the server. Please try again.");
    }
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

      {missingAddressFields.length > 0 && (
        <Pressable
          onPress={() => router.push("/(tabs)/more")}
          style={styles.addressWarning}
        >
          <Feather name="alert-triangle" size={15} color="#92400e" />
          <Text style={styles.addressWarningText}>
            <Text style={styles.addressWarningBold}>Farm Settings incomplete: </Text>
            {missingAddressFields.join(", ")}{" "}
            {missingAddressFields.length === 1 ? "is" : "are"} not set — your report will have blank header fields.{" "}
            Tap to update in Farm Settings.
          </Text>
        </Pressable>
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
            <ScoutingRow item={item} onEdit={setEditingRecord} onDelete={handleDelete} />
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

      <EditScoutingModal
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
  helperText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
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
  pressureRow: { gap: spacing.xs },
  pressureLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  pressureButtons: { flexDirection: "row", gap: spacing.xs },
  pressureBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  pressureBtnText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  toggleRowActive: { borderColor: colors.success, backgroundColor: "#f0fdf4" },
  toggleRowUrgent: { borderColor: colors.error, backgroundColor: "#fef2f2" },
  toggleLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1 },
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
  addressWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  addressWarningText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  addressWarningBold: {
    fontFamily: fonts.semiBold,
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
