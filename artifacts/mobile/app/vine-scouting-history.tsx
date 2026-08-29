import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
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
import { usePersistedBlockFilter } from "@/lib/hooks/usePersistedBlockFilter";
import { usePersistedPressureFilter } from "@/lib/hooks/usePersistedPressureFilter";
import { usePersistedVintage } from "@/lib/hooks/usePersistedVintage";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { apiFetch } from "@/lib/apiFetch";
import { ScoutingPhotoSection } from "@/components/ScoutingPhotoSection";
import { vineyardCountEvents } from "@/lib/vineyardCountEvents";
import { usePrint } from "@/lib/hooks/usePrint";
import { vineScoutingHistoryHtml, type VineScoutingHistoryRow } from "@/lib/printTemplates";

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

const PRESSURE_LABELS = ["None", "Low", "Medium", "High"];
const PRESSURE_COLORS = [colors.textSecondary, colors.success, colors.warning ?? "#f59e0b", colors.error];

// Disease keyword → field mapping (mirrors dashboard ScoutingTab)
const SCOUTING_DISEASE_KEYWORDS: Array<{ terms: string[]; field: keyof ScoutingRecord; isBoolean?: boolean }> = [
  { terms: ["downy", "downy mildew", "plasmopara"], field: "downyMildewPressure" },
  { terms: ["powdery", "powdery mildew", "erysiphe"], field: "powderyMildewPressure" },
  { terms: ["botrytis", "grey mould", "gray mould", "bunch rot"], field: "botrytisPressure" },
  { terms: ["phomopsis", "cane blight"], field: "phomopsisPressure" },
  { terms: ["leafhopper"], field: "leafhopperPressure" },
  { terms: ["spider mite", "mite"], field: "spiderMitePressure" },
  { terms: ["vine weevil", "weevil"], field: "vineWeevilSighted", isBoolean: true },
  { terms: ["eutypa", "dieback"], field: "eutypaDiebackSighted", isBoolean: true },
  { terms: ["xylella"], field: "xylellaFastidiosa", isBoolean: true },
  { terms: ["phytophthora"], field: "phytophthoraViticola", isBoolean: true },
];
const PRESSURE_NUMERIC_FIELDS: (keyof ScoutingRecord)[] = [
  "downyMildewPressure", "powderyMildewPressure", "botrytisPressure",
  "phomopsisPressure", "leafhopperPressure", "spiderMitePressure",
];

interface ScoutingRecord {
  id: number;
  scoutDate: string | null;
  nextScoutDate: string | null;
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
  photoCount: number | null;
}
function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function scoutYear(date: string | null | undefined): number | null {
  const year = date?.trim().slice(0, 4);
  if (!year || !/^\d{4}$/.test(year)) return null;
  return Number(year);
}

function dateOnly(d: string | null | undefined): string | null {
  const value = d?.trim().slice(0, 10);
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function isPastDate(d: string | null | undefined): boolean {
  const date = dateOnly(d);
  if (!date) return false;
  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  return date < todayKey;
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
  onPhotoCountChange: (recordId: number, count: number) => void;
}

function EditScoutingModal({ visible, record, farmId, blocks, blocksLoading, onClose, onSaved, onPhotoCountChange }: EditScoutingModalProps) {
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

            {/* ── Photos ── */}
            {record && (
              <ScoutingPhotoSection
                farmId={farmId}
                scoutingId={record.id}
                onPhotoCountChange={(count) => onPhotoCountChange(record.id, count)}
              />
            )}

            {/* ── Quick Links ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Quick Links</Text>
              <Text style={editStyles.quickLinkHint}>Jump to a related record for this scouting observation</Text>
              <Pressable
                style={editStyles.quickLinkBtn}
                onPress={() => {
                  onClose();
                  if (record?.blockId) {
                    router.push({ pathname: "/vine-operation", params: { blockId: String(record.blockId) } });
                  } else {
                    router.push("/vine-operation");
                  }
                }}
              >
                <Feather name="tool" size={16} color={colors.primary} />
                <Text style={editStyles.quickLinkText}>Log Vineyard Operation</Text>
                <Feather name="arrow-right" size={16} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                style={[editStyles.quickLinkBtn, { marginTop: spacing.sm }]}
                onPress={() => {
                  onClose();
                  if (record?.blockId) {
                    router.push({ pathname: "/vine-harvest", params: { blockId: String(record.blockId) } });
                  } else {
                    router.push("/vine-harvest");
                  }
                }}
              >
                <Feather name="package" size={16} color={colors.primary} />
                <Text style={editStyles.quickLinkText}>Log Harvest Record</Text>
                <Feather name="arrow-right" size={16} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                style={[editStyles.quickLinkBtn, { marginTop: spacing.sm }]}
                onPress={() => {
                  onClose();
                  if (record?.blockId) {
                    router.push({ pathname: "/vine-spray-diary", params: { blockId: String(record.blockId) } });
                  } else {
                    router.push("/vine-spray-diary");
                  }
                }}
              >
                <Feather name="droplet" size={16} color={colors.primary} />
                <Text style={editStyles.quickLinkText}>Log Spray Diary Entry</Text>
                <Feather name="arrow-right" size={16} color={colors.textSecondary} />
              </Pressable>
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

// ─── Pressure detail row shown inside the card ───────────────────────────────

const DISEASE_FIELDS: { key: keyof ScoutingRecord; label: string }[] = [
  { key: "downyMildewPressure", label: "Downy" },
  { key: "powderyMildewPressure", label: "Powdery" },
  { key: "botrytisPressure", label: "Botrytis" },
  { key: "phomopsisPressure", label: "Phomopsis" },
  { key: "leafhopperPressure", label: "Leafhopper" },
  { key: "spiderMitePressure", label: "Spider Mite" },
];

function PressureGrid({ record }: { record: ScoutingRecord }) {
  const active = DISEASE_FIELDS.filter(f => {
    const v = record[f.key];
    return v != null && Number(v) > 0;
  });
  if (active.length === 0) return null;
  return (
    <View style={styles.pressureGrid}>
      {active.map(f => {
        const idx = Math.min(Math.max(Number(record[f.key] ?? 0), 0), 3);
        return (
          <View key={f.key} style={[styles.pressurePill, { borderColor: PRESSURE_COLORS[idx] }]}>
            <View style={[styles.pressureDot, { backgroundColor: PRESSURE_COLORS[idx] }]} />
            <Text style={[styles.pressurePillLabel, { color: PRESSURE_COLORS[idx] }]}>
              {f.label}
            </Text>
            <Text style={[styles.pressurePillValue, { color: PRESSURE_COLORS[idx] }]}>
              {PRESSURE_LABELS[idx]}
            </Text>
          </View>
        );
      })}
    </View>
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
  const hasNotifiable = item.xylellaFastidiosa || item.phytophthoraViticola;
  const hasBoolPests = item.vineWeevilSighted || item.eutypaDiebackSighted;
  const isOverdue = isPastDate(item.nextScoutDate);

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
    <Pressable style={[styles.card, isOverdue && styles.cardOverdue]} onPress={handlePress}>
      {/* ── Header row: date + actions ── */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
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
        <View style={styles.cardActions}>
          {!!item.photoCount && item.photoCount > 0 && (
            <View style={styles.photoBadge}>
              <Feather name="camera" size={11} color={colors.primary} />
              <Text style={styles.photoBadgeText}>{item.photoCount}</Text>
            </View>
          )}
          <Feather name="edit-2" size={14} color={colors.textSecondary} />
          <Pressable onPress={(e) => { e.stopPropagation(); handleDelete(); }} hitSlop={12} style={styles.deleteBtn}>
            <Feather name="trash-2" size={15} color={colors.error} />
          </Pressable>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </View>
      </View>

      {/* ── Next scouting due ── */}
      <View style={[styles.nextDueRow, isOverdue && styles.nextDueRowOverdue]}>
        <Feather
          name={isOverdue ? "alert-triangle" : "calendar"}
          size={13}
          color={isOverdue ? colors.error : colors.textSecondary}
        />
        <Text style={[styles.nextDueText, isOverdue && styles.nextDueTextOverdue]}>
          {isOverdue
            ? `Overdue · ${formatDate(item.nextScoutDate)}`
            : item.nextScoutDate
            ? `Next: ${formatDate(item.nextScoutDate)}`
            : "Next: Not scheduled"}
        </Text>
      </View>

      {/* ── Notifiable banner ── */}
      {hasNotifiable && (
        <View style={styles.notifiableBanner}>
          <Feather name="alert-triangle" size={13} color={colors.error} />
          <Text style={styles.notifiableText}>
            ⚠ Notifiable pest flagged
            {item.xylellaFastidiosa && item.phytophthoraViticola
              ? " — Xylella & Phytophthora viticola"
              : item.xylellaFastidiosa
              ? " — Xylella fastidiosa"
              : " — Phytophthora viticola"}
          </Text>
        </View>
      )}

      {/* ── Disease / pest pressure pills ── */}
      <PressureGrid record={item} />

      {/* ── Boolean pest sightings ── */}
      {hasBoolPests && (
        <View style={styles.boolPestRow}>
          {item.vineWeevilSighted && (
            <View style={styles.boolPestTag}>
              <Feather name="alert-circle" size={11} color={colors.error} />
              <Text style={styles.boolPestText}>Vine Weevil</Text>
            </View>
          )}
          {item.eutypaDiebackSighted && (
            <View style={[styles.boolPestTag, { borderColor: colors.warning ?? "#d97706", backgroundColor: "#fffbeb" }]}>
              <Feather name="alert-circle" size={11} color={colors.warning ?? "#d97706"} />
              <Text style={[styles.boolPestText, { color: colors.warning ?? "#d97706" }]}>Eutypa Dieback</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Action taken ── */}
      {!!item.actionTaken && (
        <View style={styles.actionRow}>
          <Feather name="check-circle" size={13} color={colors.success} style={styles.actionIcon} />
          <Text style={styles.actionText} numberOfLines={2}>{item.actionTaken}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VineScoutingHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { address, cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("vine-scouting-history", currentFarm?.id, user?.id);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));
  const { records, loading, refreshing, error, refresh, recordsFarmId } = useApiFetch<ScoutingRecord>(
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
  const [selectedVintage, setSelectedVintage, vintageLoadedForFarmId] = usePersistedVintage(currentFarm?.id);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [pressureFilter, setPressureFilter] = usePersistedPressureFilter(currentFarm?.id);
  const [selectedBlockIds, setSelectedBlockIds] = usePersistedBlockFilter(currentFarm?.id);
  const [editingRecord, setEditingRecord] = useState<ScoutingRecord | null>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<number, Partial<ScoutingRecord>>>({});
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
        if (update !== undefined) return { ...r, ...update };
        return r;
      });
  }, [records, localUpdates, deletedIds]);

  // Sorted unique scouting years descending, matching the vintage picker used
  // by the harvest history screen.
  const scoutingYears = useMemo(() => {
    const years = new Set<number>();
    for (const record of displayRecords) {
      const year = scoutYear(record.scoutDate);
      if (year !== null) years.add(year);
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [displayRecords]);

  // Wait for both the persisted preference and this farm's successful records
  // before resolving the initial selection. This prevents a previous farm's
  // year from being applied to the current list and preserves "All years".
  const resolvedVintageForFarm = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (vintageLoadedForFarmId !== currentFarm?.id) return;
    if (recordsFarmId !== currentFarm?.id) return;
    if (scoutingYears.length === 0) return;
    if (resolvedVintageForFarm.current === currentFarm?.id) return;
    resolvedVintageForFarm.current = currentFarm?.id;
    if (selectedVintage === null) return;
    if (selectedVintage !== undefined && scoutingYears.includes(selectedVintage)) return;
    setSelectedVintage(scoutingYears[0]);
  }, [
    vintageLoadedForFarmId,
    recordsFarmId,
    scoutingYears,
    selectedVintage,
    setSelectedVintage,
    currentFarm?.id,
  ]);

  const displayVintage = selectedVintage ?? null;

  const yearFilteredRecords = useMemo(() => {
    if (displayVintage === null) return displayRecords;
    return displayRecords.filter(record => scoutYear(record.scoutDate) === displayVintage);
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
    if (selectedBlockIds.length === 0) return yearFilteredRecords;
    const idSet = new Set(selectedBlockIds);
    return yearFilteredRecords.filter(r => r.blockId != null && idSet.has(r.blockId));
  }, [yearFilteredRecords, selectedBlockIds]);

  const filtered = useMemo(() => {
    let rows = blockFilteredRecords;
    if (canonFrom) rows = rows.filter(r => r.scoutDate && r.scoutDate >= canonFrom);
    if (canonTo) rows = rows.filter(r => r.scoutDate && r.scoutDate <= canonTo);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchedDiseases = SCOUTING_DISEASE_KEYWORDS.filter(d =>
        d.terms.some(t => t.includes(q) || q.includes(t)),
      );
      rows = rows.filter(r => {
        if (
          (r.blockName ?? "").toLowerCase().includes(q) ||
          (r.scoutedBy ?? "").toLowerCase().includes(q) ||
          (r.scoutDate ?? "").includes(q)
        ) return true;
        for (const d of matchedDiseases) {
          if (d.isBoolean) { if (r[d.field]) return true; }
          else { if (Number(r[d.field] ?? 0) > 0) return true; }
        }
        return false;
      });
    }
    if (pressureFilter !== "__all__") {
      const minLevel = Number(pressureFilter);
      rows = rows.filter(r =>
        PRESSURE_NUMERIC_FIELDS.some(f => Number(r[f] ?? 0) >= minLevel),
      );
    }
    return rows;
  }, [blockFilteredRecords, search, pressureFilter, canonFrom, canonTo]);

  const searchPressureFilterActive = search.trim().length > 0 || pressureFilter !== "__all__";
  const pressureFilterDescription =
    pressureFilter === "1" ? "Low or above" :
    pressureFilter === "2" ? "Medium or above" :
    pressureFilter === "3" ? "High only" :
    null;
  const searchPressureFilterDescription = [
    search.trim() ? `"${search.trim()}"` : null,
    pressureFilterDescription ? `pressure "${pressureFilterDescription}"` : null,
  ].filter(Boolean).join(" and ");
  const clearFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPressureFilter("__all__");
    setSelectedVintage(null);
  };

  const handleSaved = (recordId: number, updated: Partial<ScoutingRecord>) => {
    setLocalUpdates(prev => ({
      ...prev,
      [recordId]: { ...(prev[recordId] ?? {}), ...updated },
    }));
    setEditingRecord(null);
    // If the blockId changed (link/unlink), notify the home screen immediately
    // so its compliance gap banner reflects the new count without waiting for
    // the next navigation focus event.
    if ('blockId' in updated) {
      vineyardCountEvents.emit();
    }
  };

  // Called by ScoutingPhotoSection (via EditScoutingModal) whenever a photo is
  // added or deleted so the badge on the row updates without a full list reload.
  const handlePhotoCountChange = useCallback((recordId: number, count: number) => {
    setLocalUpdates(prev => ({
      ...prev,
      [recordId]: { ...(prev[recordId] ?? {}), photoCount: count },
    }));
  }, []);

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

  const handleExport = useCallback(async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const rows: VineScoutingHistoryRow[] = filtered.map(r => ({
        id: r.id,
        scoutDate: r.scoutDate,
        blockName: r.blockName,
        scoutedBy: r.scoutedBy,
        downyMildewPressure: r.downyMildewPressure,
        powderyMildewPressure: r.powderyMildewPressure,
        botrytisPressure: r.botrytisPressure,
        phomopsisPressure: r.phomopsisPressure,
        leafhopperPressure: r.leafhopperPressure,
        spiderMitePressure: r.spiderMitePressure,
        vineWeevilSighted: r.vineWeevilSighted,
        eutypaDiebackSighted: r.eutypaDiebackSighted,
        xylellaFastidiosa: r.xylellaFastidiosa,
        phytophthoraViticola: r.phytophthoraViticola,
        actionTaken: r.actionTaken,
        notes: r.notes,
      }));
      const html = vineScoutingHistoryHtml(
        rows,
        currentFarm?.name ?? null,
        address ?? null,
        null,
        search.trim() || undefined,
        canonFrom ?? undefined,
        canonTo ?? undefined,
      );
      await savePdf(html, "Vine Scouting History");
    } catch {
      Alert.alert("Export Failed", "Could not generate the scouting report. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [exporting, filtered, currentFarm?.name, address, search, canonFrom, canonTo, savePdf]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Scouting History</Text>
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
        context="scouting records"
      />

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

      {(search.trim() || dateFrom.trim() || dateTo.trim() || pressureFilter !== "__all__" || displayVintage !== null) ? (
        <View style={styles.clearFiltersRow}>
          <Pressable
            onPress={clearFilters}
            style={styles.clearFiltersChip}
            hitSlop={6}
          >
            <Feather name="x" size={13} color={colors.primary} />
            <Text style={styles.clearFiltersText}>Clear filters</Text>
          </Pressable>
          {searchPressureFilterActive && (
            <View style={styles.matchCountChip}>
              <Feather name="filter" size={12} color={colors.textSecondary} />
              <Text style={styles.matchCountText}>
                {filtered.length} {filtered.length === 1 ? "record" : "records"} matched
              </Text>
            </View>
          )}
        </View>
      ) : null}

      {/* Pressure filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pressureFilterScroll}
        contentContainerStyle={styles.pressureFilterScrollContent}
      >
        {(["__all__", "1", "2", "3"] as const).map((value) => {
          const label = value === "__all__" ? "All pressure" : value === "1" ? "Low+" : value === "2" ? "Medium+" : "High";
          const active = pressureFilter === value;
          const chipColor = value === "1" ? colors.success : value === "2" ? (colors.warning ?? "#f59e0b") : value === "3" ? colors.error : undefined;
          return (
            <Pressable
              key={value}
              style={[
                styles.pressureChip,
                active && (chipColor ? { backgroundColor: chipColor + "22", borderColor: chipColor } : styles.pressureChipActive),
              ]}
              onPress={() => { Haptics.selectionAsync(); setPressureFilter(value); }}
            >
              {value !== "__all__" && (
                <View style={[styles.pressureChipDot, { backgroundColor: active ? chipColor : colors.textSecondary }]} />
              )}
              <Text style={[styles.pressureChipText, active && (chipColor ? { color: chipColor } : styles.pressureChipTextActive)]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Season/year filter chips */}
      {scoutingYears.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.yearFilterScroll}
          contentContainerStyle={styles.yearFilterScrollContent}
        >
          <Pressable
            style={[styles.yearChip, displayVintage === null && styles.yearChipActive]}
            onPress={() => { Haptics.selectionAsync(); setSelectedVintage(null); }}
          >
            <Text style={[styles.yearChipText, displayVintage === null && styles.yearChipTextActive]}>
              All years
            </Text>
          </Pressable>
          {scoutingYears.map(year => (
            <Pressable
              key={year}
              style={[styles.yearChip, displayVintage === year && styles.yearChipActive]}
              onPress={() => { Haptics.selectionAsync(); setSelectedVintage(year); }}
            >
              <Text style={[styles.yearChipText, displayVintage === year && styles.yearChipTextActive]}>
                {year}
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
                // Keep one block visible, matching the harvest history shortcut.
                const firstLinkedBlockId = displayRecords.find(r => r.blockId != null)?.blockId;
                setSelectedBlockIds([firstLinkedBlockId ?? filterBlocks[0].id]);
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
              {searchPressureFilterActive ? (
                <>
                  <Text style={styles.emptyTitle}>
                    No scouting records match {searchPressureFilterDescription}
                  </Text>
                  <Text style={styles.emptyText}>
                    Try adjusting your search or clear the filters to see all records.
                  </Text>
                  <Pressable onPress={clearFilters} style={styles.emptyClearButton} hitSlop={6}>
                    <Feather name="x" size={13} color={colors.primary} />
                    <Text style={styles.emptyClearText}>Clear filters</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.emptyTitle}>No scouting records</Text>
                  <Text style={styles.emptyText}>
                    {dateFrom.trim() || dateTo.trim() || displayVintage !== null
                      ? "No records match the current filters."
                      : selectedBlockIds.length > 0
                        ? "No records for the selected block(s)."
                      : "Scouting records you create will appear here."}
                  </Text>
                </>
              )}
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
        onPhotoCountChange={handlePhotoCountChange}
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
  quickLinkHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  quickLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  quickLinkText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
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
  // Card-style row (replaces old horizontal `row`)
  card: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  cardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    paddingLeft: spacing.lg - 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardHeaderLeft: { flex: 1, gap: 4 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginLeft: spacing.sm },
  rowDate: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  rowSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  deleteBtn: { padding: 4 },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
  nextDueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
  },
  nextDueRowOverdue: {
    backgroundColor: colors.errorBg,
  },
  nextDueText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  nextDueTextOverdue: {
    color: colors.error,
  },
  // Pressure pills grid
  pressureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  pressurePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: colors.surface,
  },
  pressureDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pressurePillLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  pressurePillValue: {
    fontFamily: fonts.regular,
    fontSize: 11,
    opacity: 0.8,
  },
  // Boolean pest sightings
  boolPestRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  boolPestTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    backgroundColor: "#fef2f2",
  },
  boolPestText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.error,
  },
  // Notifiable banner
  notifiableBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "#fef2f2",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.error + "55",
  },
  notifiableText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.error,
    flex: 1,
  },
  // Action taken
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    paddingTop: 2,
  },
  actionIcon: { marginTop: 1 },
  actionText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
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
  photoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: "#f0f7ff",
  },
  photoBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primary },
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
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
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
  matchCountChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  matchCountText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emptyClearButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  emptyClearText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  // Pressure filter chips
  pressureFilterScroll: { flexGrow: 0 },
  pressureFilterScrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
    flexDirection: "row",
  },
  pressureChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressureChipActive: {
    backgroundColor: "#ede9fe",
    borderColor: colors.primary,
  },
  pressureChipDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pressureChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  pressureChipTextActive: {
    color: colors.primary,
  },
  // Season/year filter chips
  yearFilterScroll: { flexGrow: 0 },
  yearFilterScrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    gap: spacing.xs,
    flexDirection: "row",
  },
  yearChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  yearChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  yearChipTextActive: {
    color: colors.textInverse,
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
});
