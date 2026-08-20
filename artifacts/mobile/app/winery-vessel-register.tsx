import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { kvGet, kvSet } from "@/lib/database";
import { useApiFetch } from "@/lib/hooks/useApiFetch";
import { useApiModules } from "@/lib/hooks/useApiModules";
import { usePersistedAlertFlag } from "@/lib/hooks/usePersistedAlertFlag";
import { getApiBase } from "@/lib/uploadPhoto";

// ── Auth helpers ──────────────────────────────────────────────────────────────
import { isApproachingNeutral, isIdleBarrel } from "../lib/utils/vesselAlerts";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    let token: string | null = null;
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      token = await SecureStore.getItemAsync("auth_session_token");
    } else {
      try { token = localStorage.getItem("auth_session_token"); } catch {}
    }
    if (!token) {
      const raw = await kvGet("bde_auth_token");
      if (raw) token = JSON.parse(raw) as string;
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const farmRaw = await kvGet("bde_current_farm");
    if (farmRaw) {
      const farm = JSON.parse(farmRaw) as { tenantSlug?: string; slug?: string };
      headers["x-tenant-slug"] = farm.tenantSlug ?? farm.slug ?? "";
    }
  } catch {}
  return headers;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface WineryVessel {
  id: number;
  vessel_ref: string;
  vessel_type: string | null;
  capacity_litres: number | null;
  material: string | null;
  oak_origin: string | null;
  cooperage: string | null;
  fill_number: number | null;
  toasting_level: string | null;
  cellar_zone: string | null;
  cellar_position: string | null;
  location: string | null;
  current_contents: string | null;
  current_volume_litres: number | null;
  status: string | null;
  notes: string | null;
  // Derived by the API
  is_full: boolean;
  empty_since: string | null; // ISO date of last rack-out, null if currently full or never filled
  fill_count: number | null;
  maintenance_count: number | null;
}

// ── Flag filter ───────────────────────────────────────────────────────────────

type AlertFlag = "idle" | "approaching-neutral" | "no-fills";

interface FlagDef {
  key: AlertFlag;
  label: string;
  shortLabel: string;
}

const FLAG_DEFS: FlagDef[] = [
  { key: "idle",               label: "Idle (threshold exceeded)", shortLabel: "idle"          },
  { key: "approaching-neutral",label: "Approaching neutral",  shortLabel: "approaching neutral" },
  { key: "no-fills",           label: "No fills logged",      shortLabel: "no fills"         },
];

function matchesFlag(
  v: WineryVessel,
  flag: AlertFlag | null,
  idleBarrelDaysThreshold?: number | null,
  approachingNeutralFillsThreshold?: number | null,
): boolean {
  if (!flag) return true;
  const barrel = isBarrelType(v.vessel_type);
  const active = String(v.status ?? "active") === "active";
  if (flag === "idle")                return barrel && active && isIdleBarrel(v.empty_since, idleBarrelDaysThreshold);
  if (flag === "approaching-neutral") return barrel && active && isApproachingNeutral(v.fill_number, approachingNeutralFillsThreshold);
  // no-fills: barrel/barrique vessels only, consistent with dashboard barrel-health flags
  if (flag === "no-fills")            return barrel && active && Number(v.fill_count ?? 0) === 0;
  return true;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Barrels and barriques carry oak-specific health flags; other vessels (tanks, amphorae, etc.) do not. */
function isBarrelType(vesselType: string | null): boolean {
  const t = (vesselType ?? "").toLowerCase();
  return t.includes("barrel") || t.includes("barrique");
}

/**
 * Fill-tier label for barrel/barrique vessels.
 * Matches the dashboard VesselRegisterTab:
 *   1 = New oak, 2 = 2nd fill, 3 = 3rd fill, 4 = 4th fill (approaching neutral), 5+ = neutral.
 */
function fillTier(fillNumber: number | null): { label: string; color: string; bg: string } {
  if (!fillNumber || fillNumber <= 0) return { label: "Unknown", color: colors.textSecondary, bg: colors.borderLight };
  if (fillNumber === 1) return { label: "New oak", color: "#92400e", bg: "#fef3c7" };
  if (fillNumber === 2) return { label: "2nd fill", color: "#78350f", bg: "#fde68a" };
  if (fillNumber === 3) return { label: "3rd fill", color: "#166534", bg: "#f0fdf4" };
  if (fillNumber === 4) return { label: "4th fill", color: "#1e40af", bg: "#eff6ff" };
  return { label: `${fillNumber}th fill – neutral`, color: "#6b7280", bg: "#f9fafb" };
}
function idleDays(emptySince: string): number {
  const emptyDate = new Date(emptySince);
  const now = new Date();
  return Math.floor((now.getTime() - emptyDate.getTime()) / (1000 * 60 * 60 * 24));
}

// ── Fill form ─────────────────────────────────────────────────────────────────

interface FillFormState {
  fillNumber: string;
  wineName: string;
  vintageYear: string;
  variety: string;
  volumeLitres: string;
  fillDate: string;
  rackOutDate: string;
  batchRef: string;
  operatorName: string;
  notes: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface LogFillModalProps {
  visible: boolean;
  farmId: string;
  vesselId: string;
  vesselRef: string;
  onClose: () => void;
  onSuccess: () => void;
}

function LogFillModal({ visible, farmId, vesselId, vesselRef, onClose, onSuccess }: LogFillModalProps) {
  const [form, setForm] = useState<FillFormState>({
    fillNumber: "1",
    wineName: "",
    vintageYear: "",
    variety: "",
    volumeLitres: "",
    fillDate: todayIso(),
    rackOutDate: "",
    batchRef: "",
    operatorName: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setForm({
      fillNumber: "1",
      wineName: "",
      vintageYear: "",
      variety: "",
      volumeLitres: "",
      fillDate: todayIso(),
      rackOutDate: "",
      batchRef: "",
      operatorName: "",
      notes: "",
    });
    setError(null);
    let cancelled = false;
    void (async () => {
      const storedOperator = await kvGet("last_operator_name");
      if (!cancelled && storedOperator) {
        setForm(prev => ({
          ...prev,
          ...(prev.operatorName === "" ? { operatorName: storedOperator } : {}),
        }));
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function set(field: keyof FillFormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.fillDate.trim()) { setError("Rack-in date is required."); return; }
    const fillNumber = parseInt(form.fillNumber.trim());
    if (!form.fillNumber.trim() || isNaN(fillNumber) || fillNumber < 1) {
      setError("Fill number must be a positive integer.");
      return;
    }
    let vintageYear: number | null = null;
    if (form.vintageYear.trim()) {
      const parsed = parseInt(form.vintageYear.trim());
      if (isNaN(parsed)) { setError("Vintage year must be a valid year."); return; }
      vintageYear = parsed;
    }
    let volumeLitres: number | null = null;
    if (form.volumeLitres.trim()) {
      const parsed = parseFloat(form.volumeLitres.trim());
      if (isNaN(parsed) || parsed < 0) { setError("Volume must be a valid positive number."); return; }
      volumeLitres = parsed;
    }
    setError(null);
    setSubmitting(true);
    try {
      const apiBase = getApiBase();
      if (!apiBase) throw new Error("No API domain configured.");
      const headers = await getAuthHeaders();
      const res = await fetch(`${apiBase}/api/farms/${farmId}/winery-vessels/${vesselId}/fills`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          fillNumber,
          wineName: form.wineName.trim() || null,
          vintageYear,
          variety: form.variety.trim() || null,
          volumeLitres,
          fillDate: form.fillDate.trim(),
          rackOutDate: form.rackOutDate.trim() || null,
          batchRef: form.batchRef.trim() || null,
          operatorName: form.operatorName.trim() || null,
          notes: form.notes.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Server error (${res.status})`);
      }
      if (form.operatorName.trim()) {
        kvSet("last_operator_name", form.operatorName.trim()).catch(() => undefined);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save fill record.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (submitting) return;
    setError(null);
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={formStyles.sheet}>
          <View style={formStyles.sheetHeader}>
            <Text style={formStyles.sheetTitle}>Log Fill — {vesselRef}</Text>
            <Pressable onPress={handleClose} style={formStyles.closeBtn} disabled={submitting}>
              <Feather name="x" size={20} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={formStyles.body} keyboardShouldPersistTaps="handled">
            {error ? (
              <View style={formStyles.errorBanner}>
                <Feather name="alert-circle" size={14} color={colors.error} />
                <Text style={formStyles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Fill number */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Fill number <Text style={formStyles.required}>*</Text></Text>
              <TextInput
                style={formStyles.input}
                value={form.fillNumber}
                onChangeText={v => set("fillNumber", v)}
                placeholder="e.g. 1"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </View>

            {/* Wine name */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Wine name</Text>
              <TextInput
                style={formStyles.input}
                value={form.wineName}
                onChangeText={v => set("wineName", v)}
                placeholder="e.g. Estate Pinot Noir"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
              />
            </View>

            {/* Vintage year / variety */}
            <View style={formStyles.row}>
              <View style={[formStyles.field, { flex: 1 }]}>
                <Text style={formStyles.label}>Vintage</Text>
                <TextInput
                  style={formStyles.input}
                  value={form.vintageYear}
                  onChangeText={v => set("vintageYear", v)}
                  placeholder="e.g. 2024"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  returnKeyType="next"
                />
              </View>
              <View style={[formStyles.field, { flex: 1 }]}>
                <Text style={formStyles.label}>Variety</Text>
                <TextInput
                  style={formStyles.input}
                  value={form.variety}
                  onChangeText={v => set("variety", v)}
                  placeholder="e.g. Pinot Noir"
                  placeholderTextColor={colors.textTertiary}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Volume */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Volume (litres)</Text>
              <TextInput
                style={formStyles.input}
                value={form.volumeLitres}
                onChangeText={v => set("volumeLitres", v)}
                placeholder="e.g. 225"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                returnKeyType="next"
              />
            </View>

            {/* Rack in / rack out dates */}
            <View style={formStyles.row}>
              <View style={[formStyles.field, { flex: 1 }]}>
                <Text style={formStyles.label}>Rack-in date <Text style={formStyles.required}>*</Text></Text>
                <TextInput
                  style={formStyles.input}
                  value={form.fillDate}
                  onChangeText={v => set("fillDate", v)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="next"
                />
              </View>
              <View style={[formStyles.field, { flex: 1 }]}>
                <Text style={formStyles.label}>Rack-out date</Text>
                <TextInput
                  style={formStyles.input}
                  value={form.rackOutDate}
                  onChangeText={v => set("rackOutDate", v)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Batch ref */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Batch reference</Text>
              <TextInput
                style={formStyles.input}
                value={form.batchRef}
                onChangeText={v => set("batchRef", v)}
                placeholder="e.g. LOT-2024-01"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
              />
            </View>

            {/* Operator */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Operator name</Text>
              <TextInput
                style={formStyles.input}
                value={form.operatorName}
                onChangeText={v => set("operatorName", v)}
                placeholder="Name of person logging fill"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="next"
              />
            </View>

            {/* Notes */}
            <View style={formStyles.field}>
              <Text style={formStyles.label}>Notes</Text>
              <TextInput
                style={[formStyles.input, formStyles.multiline]}
                value={form.notes}
                onChangeText={v => set("notes", v)}
                placeholder="Any additional notes…"
                placeholderTextColor={colors.textTertiary}
                multiline
                numberOfLines={3}
                returnKeyType="default"
              />
            </View>

            <TouchableOpacity
              style={[formStyles.submitBtn, submitting && formStyles.submitBtnDisabled]}
              onPress={() => { void handleSubmit(); }}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={formStyles.submitBtnText}>Save fill record</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Zone section header ───────────────────────────────────────────────────────

interface ZoneSectionHeaderProps {
  zone: string;
  totalCount: number;
  flagCount: number | null;
  flagShortLabel: string | null;
}

function ZoneSectionHeader({ zone, totalCount, flagCount, flagShortLabel }: ZoneSectionHeaderProps) {
  const hasFlaggedVessels = flagCount !== null && flagCount > 0;
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText} numberOfLines={1}>
        {zone}
      </Text>
      {flagCount !== null ? (
        // Flag filter active — show count of matching vessels
        <View style={[styles.sectionCountChip, hasFlaggedVessels ? styles.sectionCountChipAlert : styles.sectionCountChipNone]}>
          {hasFlaggedVessels && <Feather name="alert-triangle" size={10} color="#b45309" />}
          <Text style={[styles.sectionCountText, hasFlaggedVessels ? styles.sectionCountTextAlert : styles.sectionCountTextNone]}>
            {flagCount} {flagShortLabel}
          </Text>
        </View>
      ) : (
        // No filter — show total vessel count
        <View style={styles.sectionCountChip}>
          <Text style={styles.sectionCountText}>
            {totalCount} vessel{totalCount !== 1 ? "s" : ""}
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Row component ─────────────────────────────────────────────────────────────

function VesselRow({
  vessel,
  idleBarrelDaysThreshold,
  approachingNeutralFillsThreshold,
  onLogFill,
}: {
  vessel: WineryVessel;
  idleBarrelDaysThreshold?: number | null;
  approachingNeutralFillsThreshold?: number | null;
  onLogFill?: () => void;
}) {
  const barrel = isBarrelType(vessel.vessel_type);
  const active = String(vessel.status ?? "active") === "active";
  const tier = fillTier(vessel.fill_number);
  // Health alerts only apply to active barrel/barrique vessels (matches dashboard behaviour)
  const idle = barrel && active && isIdleBarrel(vessel.empty_since, idleBarrelDaysThreshold);
  const approachingNeutral = barrel && active && isApproachingNeutral(vessel.fill_number, approachingNeutralFillsThreshold);
  const hasAlerts = idle || approachingNeutral;

  const locationParts = [vessel.cellar_zone, vessel.cellar_position, vessel.location]
    .filter(Boolean)
    .join(" · ");
  const capacityLabel = vessel.capacity_litres ? `${vessel.capacity_litres} L` : null;

  const handlePress = () => {
    router.push({
      pathname: "/winery-vessel-detail",
      params: {
        vesselId: String(vessel.id),
        vesselRef: vessel.vessel_ref,
        vesselType: vessel.vessel_type ?? "",
        notes: vessel.notes ?? "",
        cellarZone: vessel.cellar_zone ?? "",
        cellarPosition: vessel.cellar_position ?? "",
      },
    });
  };

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [styles.row, hasAlerts && styles.rowAlert, pressed && styles.rowPressed]}>
      {/* Left: ref + meta */}
      <View style={styles.rowMain}>
        <View style={styles.rowHeader}>
          <Text style={styles.vesselRef}>{vessel.vessel_ref}</Text>
          {vessel.vessel_type ? (
            <Text style={styles.vesselType}>{vessel.vessel_type}</Text>
          ) : null}
        </View>

        <View style={styles.badgeRow}>
          {/* Fill tier badge — barrels/barriques only */}
          {barrel && vessel.fill_number != null && vessel.fill_number > 0 && (
            <View style={[styles.badge, { backgroundColor: tier.bg }]}>
              <Text style={[styles.badgeText, { color: tier.color }]}>{tier.label}</Text>
            </View>
          )}

          {/* No fills logged badge — shown when fill_count is 0; tappable to log a fill inline */}
          {Number(vessel.fill_count ?? 0) === 0 && (
            <Pressable
              onPress={e => { e.stopPropagation?.(); onLogFill?.(); }}
              hitSlop={6}
              style={({ pressed }) => [styles.noFillsBadge, pressed && { opacity: 0.65 }]}
            >
              <Feather name="plus-circle" size={11} color="#b45309" style={{ marginRight: 3 }} />
              <Text style={styles.noFillsBadgeText}>No fills logged</Text>
            </Pressable>
          )}

          {/* Status / fullness badge */}
          {vessel.is_full ? (
            <View style={[styles.badge, { backgroundColor: colors.successBg }]}>
              <Text style={[styles.badgeText, { color: colors.success }]}>In use</Text>
            </View>
          ) : (
            <View style={[styles.badge, { backgroundColor: colors.borderLight }]}>
              <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Empty</Text>
            </View>
          )}
        </View>

        {/* Alert badges */}
        {(idle || approachingNeutral) && (
          <View style={styles.alertBadgeRow}>
            {idle && vessel.empty_since && (
              <View style={[styles.alertBadge, { backgroundColor: colors.errorBg }]}>
                <Feather name="alert-triangle" size={11} color={colors.error} />
                <Text style={[styles.alertBadgeText, { color: colors.error }]}>
                  Idle {idleDays(vessel.empty_since)}d
                </Text>
              </View>
            )}
            {approachingNeutral && (
              <View style={[styles.alertBadge, { backgroundColor: colors.warningBg }]}>
                <Feather name="alert-triangle" size={11} color={colors.warning} />
                <Text style={[styles.alertBadgeText, { color: colors.accentDark }]}>
                  Approaching neutral
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Secondary info */}
        <View style={styles.metaRow}>
          {vessel.current_contents ? (
            <Text style={styles.metaText} numberOfLines={1}>
              {vessel.current_contents}
              {vessel.current_volume_litres ? ` · ${vessel.current_volume_litres} L` : ""}
            </Text>
          ) : null}
          {locationParts ? (
            <Text style={styles.metaText} numberOfLines={1}>{locationParts}</Text>
          ) : null}
          {capacityLabel && !vessel.current_contents ? (
            <Text style={styles.metaText}>{capacityLabel}</Text>
          ) : null}
        </View>
      </View>

      {/* Right: capacity chip + chevron */}
      <View style={styles.rowRight}>
        {capacityLabel ? (
          <View style={styles.capacityChip}>
            <Text style={styles.capacityText}>{capacityLabel}</Text>
          </View>
        ) : null}
        <Feather name="chevron-right" size={16} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

// ── Empty / error states ──────────────────────────────────────────────────────

function EmptyState({ error }: { error: string | null }) {
  return (
    <View style={styles.emptyWrap}>
      <Feather name={error ? "wifi-off" : "package"} size={36} color={colors.textTertiary} />
      <Text style={styles.emptyTitle}>{error ? "Could not load vessels" : "No vessels found"}</Text>
      <Text style={styles.emptyBody}>
        {error
          ? "Check your connection and pull down to retry."
          : "Add vessels to the Vessel Register from the dashboard to see them here."}
      </Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function WineryVesselRegisterScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();

  const { activeModuleKeys, resolvedFarmId } = useApiModules(currentFarm?.id);
  // Require resolvedFarmId to match currentFarm.id so we never fire this request
  // during the window between a farm switch and the new farm's module fetch completing.
  const isWineryModuleActive =
    resolvedFarmId === currentFarm?.id &&
    activeModuleKeys.includes("viticulture");

  const { records, loading, refreshing, error, refresh } = useApiFetch<WineryVessel>(
    isWineryModuleActive ? currentFarm?.id : undefined,
    "/api/farms/:farmId/winery-vessels"
  );

  // Re-fetch the vessel list whenever this screen regains focus so the zone
  // badge is up-to-date after returning from the vessel detail screen.
  // Skip the very first focus event — the initial load already fetched data.
  const isMountedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!isMountedRef.current) { isMountedRef.current = true; return; }
      refresh();
    }, [refresh])
  );

  // ── Alert-flag filter ──────────────────────────────────────────────────────
  const [alertFlag, setAlertFlag] = usePersistedAlertFlag(currentFarm?.id ? String(currentFarm.id) : undefined);

  // ── Log-fill quick-action modal ────────────────────────────────────────────
  const [logFillVessel, setLogFillVessel] = useState<WineryVessel | null>(null);

  function toggleFlag(flag: AlertFlag) {
    setAlertFlag(alertFlag === flag ? null : flag);
  }

  // ── Stats ──────────────────────────────────────────────────────────────────

  const total = records.length;
  const idleCount = records.filter(v =>
    isBarrelType(v.vessel_type) &&
    String(v.status ?? "active") === "active" &&
    isIdleBarrel(v.empty_since, currentFarm?.idleBarrelDays)
  ).length;
  const neutralCount = records.filter(v =>
    isBarrelType(v.vessel_type) &&
    String(v.status ?? "active") === "active" &&
    isApproachingNeutral(v.fill_number, currentFarm?.approachingNeutralFills)
  ).length;
  const noFillsCount = records.filter(v =>
    isBarrelType(v.vessel_type) &&
    String(v.status ?? "active") === "active" &&
    Number(v.fill_count ?? 0) === 0
  ).length;

  // ── Zone-grouped sections ──────────────────────────────────────────────────

  const sections = useMemo(() => {
    // Collect all unique zones (preserving order: assigned zones sorted, then "Unassigned")
    const zoneSet = new Set<string>();
    for (const v of records) {
      zoneSet.add(v.cellar_zone ? v.cellar_zone : "Unassigned");
    }
    const zones = Array.from(zoneSet).sort((a, b) => {
      if (a === "Unassigned") return 1;
      if (b === "Unassigned") return -1;
      return a.localeCompare(b);
    });

    return zones.map(zone => {
      // All vessels in this zone
      const zoneVessels = records.filter(v =>
        (v.cellar_zone ? v.cellar_zone : "Unassigned") === zone
      );
      // Vessels passing the active flag filter
      const filtered = alertFlag
        ? zoneVessels.filter(v => matchesFlag(
            v, alertFlag,
            currentFarm?.idleBarrelDays,
            currentFarm?.approachingNeutralFills,
          ))
        : zoneVessels;

      return {
        zone,
        totalCount: zoneVessels.length,
        flagCount: alertFlag !== null ? filtered.length : null,
        data: filtered,
      };
    }).filter(s => s.data.length > 0 || alertFlag === null);
    // When a flag is active, hide zones where nothing matches (data.length === 0)
    // But only hide when a flag IS active; otherwise all zones always show.
  }, [records, alertFlag, currentFarm?.idleBarrelDays, currentFarm?.approachingNeutralFills]);

  const activeFlagDef = alertFlag ? FLAG_DEFS.find(f => f.key === alertFlag) ?? null : null;

  // Derive the effective label for the active flag using farm-configured thresholds where applicable
  const activeFlagLabel = activeFlagDef
    ? activeFlagDef.key === "idle"
      ? `Idle >${currentFarm?.idleBarrelDays ?? 90} days`
      : activeFlagDef.label
    : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Vessel Register</Text>
      </View>

      {/* Summary / filter bar */}
      {total > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryChip}>
            <Feather name="package" size={13} color={colors.textSecondary} />
            <Text style={styles.summaryText}>{total} vessel{total !== 1 ? "s" : ""}</Text>
          </View>
          {idleCount > 0 && (
            <Pressable
              onPress={() => toggleFlag("idle")}
              style={[styles.summaryChip, styles.summaryAlert, alertFlag === "idle" && styles.summaryChipActive]}
            >
              <Feather name="alert-triangle" size={13} color={colors.error} />
              <Text style={[styles.summaryText, { color: colors.error }]}>
                {idleCount} idle
              </Text>
            </Pressable>
          )}
          {neutralCount > 0 && (
            <Pressable
              onPress={() => toggleFlag("approaching-neutral")}
              style={[styles.summaryChip, styles.summaryWarn, alertFlag === "approaching-neutral" && styles.summaryChipActive]}
            >
              <Feather name="alert-triangle" size={13} color={colors.accentDark} />
              <Text style={[styles.summaryText, { color: colors.accentDark }]}>
                {neutralCount} approaching neutral
              </Text>
            </Pressable>
          )}
          {noFillsCount > 0 && (
            <Pressable
              onPress={() => toggleFlag("no-fills")}
              style={[styles.summaryChip, styles.summaryNoFills, alertFlag === "no-fills" && styles.summaryChipActive]}
            >
              <Feather name="alert-triangle" size={13} color="#b45309" />
              <Text style={[styles.summaryText, { color: "#b45309" }]}>
                {noFillsCount} no fills
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Active filter pill */}
      {alertFlag && (
        <View style={styles.filterPillRow}>
          <View style={styles.filterPill}>
            <Feather name="filter" size={11} color={colors.primary} />
            <Text style={styles.filterPillText}>{activeFlagLabel}</Text>
            <Pressable onPress={() => setAlertFlag(null)} hitSlop={8}>
              <Feather name="x" size={13} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      )}

      {/* List */}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading vessels…</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <VesselRow
              vessel={item}
              idleBarrelDaysThreshold={currentFarm?.idleBarrelDays}
              approachingNeutralFillsThreshold={currentFarm?.approachingNeutralFills}
              onLogFill={() => setLogFillVessel(item)}
            />
          )}
          renderSectionHeader={({ section }) => (
            <ZoneSectionHeader
              zone={section.zone}
              totalCount={section.totalCount}
              flagCount={section.flagCount}
              flagShortLabel={activeFlagDef?.shortLabel ?? null}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
          ListEmptyComponent={<EmptyState error={error} />}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Log-fill quick-action modal */}
      {logFillVessel && currentFarm?.id && (
        <LogFillModal
          visible={!!logFillVessel}
          farmId={String(currentFarm.id)}
          vesselId={String(logFillVessel.id)}
          vesselRef={logFillVessel.vessel_ref}
          onClose={() => setLogFillVessel(null)}
          onSuccess={() => { setLogFillVessel(null); refresh(); }}
        />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: {
    padding: spacing.xs,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.text,
    flex: 1,
  },
  summaryBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
  },
  summaryChipActive: {
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  summaryAlert: {
    backgroundColor: colors.errorBg,
  },
  summaryWarn: {
    backgroundColor: colors.warningBg,
  },
  summaryNoFills: {
    backgroundColor: "#fffbeb",
  },
  summaryText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  filterPillRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  filterPillText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  separator: {
    height: spacing.sm,
  },
  sectionSeparator: {
    height: spacing.md,
  },
  // Zone section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: spacing.xs,
    paddingTop: spacing.xs,
  },
  sectionHeaderText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  sectionCountChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
  },
  sectionCountChipAlert: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  sectionCountChipNone: {
    backgroundColor: colors.borderLight,
  },
  sectionCountText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  sectionCountTextAlert: {
    color: "#b45309",
    fontFamily: fonts.semiBold,
  },
  sectionCountTextNone: {
    color: colors.textTertiary,
  },
  // Row
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowAlert: {
    borderColor: "#fca5a5",
  },
  rowPressed: {
    opacity: 0.75,
  },
  rowRight: {
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.xs,
  },
  rowMain: {
    flex: 1,
    gap: spacing.xs,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  vesselRef: {
    fontSize: fontSize.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  vesselType: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
  },
  noFillsBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  noFillsBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: "#b45309",
  },
  alertBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  alertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  alertBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semiBold,
  },
  metaRow: {
    gap: 2,
  },
  metaText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  capacityChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.borderLight,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  capacityText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
    textAlign: "center",
  },
  emptyBody: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

// ── Form modal styles (shared by LogFillModal) ────────────────────────────────

const formStyles = StyleSheet.create({
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
    fontSize: fontSize.md,
    fontFamily: fonts.semiBold,
    color: colors.text,
    flex: 1,
    marginRight: spacing.sm,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  body: {
    padding: spacing.md,
    gap: spacing.md,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.error,
    flex: 1,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  required: {
    color: colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: fontSize.md,
    fontFamily: fonts.semiBold,
    color: "#fff",
  },
});
