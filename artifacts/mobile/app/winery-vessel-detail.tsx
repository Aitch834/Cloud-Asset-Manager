import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
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
import { kvGet } from "@/lib/database";
import { getApiBase } from "@/lib/uploadPhoto";

// ── Auth helpers (mirrored from useApiFetch) ─────────────────────────────────

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

interface BarrelFill {
  id: number;
  fill_number: number | null;
  wine_name: string | null;
  vintage_year: number | null;
  variety: string | null;
  volume_litres: number | null;
  fill_date: string | null;
  rack_out_date: string | null;
  batch_ref: string | null;
  operator_name: string | null;
  notes: string | null;
}

interface BarrelMaintenance {
  id: number;
  maintenance_date: string | null;
  work_type: string | null;
  cooperage_name: string | null;
  cost_pence: number | null;
  notes: string | null;
}

interface BarrelMovement {
  id: number;
  moved_date: string | null;
  from_zone: string | null;
  from_position: string | null;
  to_zone: string | null;
  to_position: string | null;
  reason: string | null;
  operator_name: string | null;
  notes: string | null;
}

// ── Hook: fetch all three sub-resources in parallel ───────────────────────────

interface VesselDetail {
  fills: BarrelFill[];
  maintenance: BarrelMaintenance[];
  movements: BarrelMovement[];
}

function useVesselDetail(farmId: string | undefined, vesselId: string | undefined) {
  const [data, setData] = useState<VesselDetail>({ fills: [], maintenance: [], movements: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!farmId || !vesselId) { setLoading(false); return; }
    cancelRef.current = false;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const apiBase = getApiBase();
      if (!apiBase) throw new Error("No API domain configured — check connection settings.");
      const headers = await getAuthHeaders();
      const base = `${apiBase}/api/farms/${farmId}/winery-vessels/${vesselId}`;
      const [fillsRes, maintRes, movRes] = await Promise.all([
        fetch(`${base}/fills`, { headers }),
        fetch(`${base}/maintenance`, { headers }),
        fetch(`${base}/movements`, { headers }),
      ]);
      if (!fillsRes.ok || !maintRes.ok || !movRes.ok) throw new Error("Server error loading vessel details.");
      const [fillsJson, maintJson, movJson] = await Promise.all([
        fillsRes.json() as Promise<{ records: BarrelFill[] }>,
        maintRes.json() as Promise<{ records: BarrelMaintenance[] }>,
        movRes.json() as Promise<{ records: BarrelMovement[] }>,
      ]);
      if (!cancelRef.current) {
        setData({
          fills: fillsJson.records ?? [],
          maintenance: maintJson.records ?? [],
          movements: movJson.records ?? [],
        });
      }
    } catch (err) {
      if (!cancelRef.current) setError(err instanceof Error ? err.message : "Failed to load vessel details.");
    } finally {
      if (!cancelRef.current) { setLoading(false); setRefreshing(false); }
    }
  }, [farmId, vesselId]);

  useEffect(() => {
    void load();
    return () => { cancelRef.current = true; };
  }, [load]);

  const refresh = useCallback(() => { void load(true); }, [load]);

  return { data, loading, refreshing, error, refresh };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function pence(p: number | null): string {
  if (p == null) return "—";
  return `£${(p / 100).toFixed(2)}`;
}

// ── Section components ────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </View>
  );
}

function EmptySection({ label }: { label: string }) {
  return (
    <View style={styles.emptySection}>
      <Text style={styles.emptySectionText}>{label}</Text>
    </View>
  );
}

function FillCard({ fill }: { fill: BarrelFill }) {
  const title = [fill.wine_name, fill.variety].filter(Boolean).join(" · ") || "Unnamed fill";
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.fillBadge]}>
          <Text style={styles.fillBadgeText}>Fill {fill.fill_number ?? "?"}</Text>
        </View>
        {fill.vintage_year ? (
          <Text style={styles.cardMeta}>{fill.vintage_year}</Text>
        ) : null}
        {fill.batch_ref ? (
          <Text style={styles.cardMeta}>{fill.batch_ref}</Text>
        ) : null}
      </View>

      <Text style={styles.cardTitle}>{title}</Text>

      <View style={styles.cardRow}>
        <View style={styles.cardField}>
          <Text style={styles.fieldLabel}>Rack in</Text>
          <Text style={styles.fieldValue}>{fmt(fill.fill_date)}</Text>
        </View>
        <View style={styles.cardField}>
          <Text style={styles.fieldLabel}>Rack out</Text>
          <Text style={styles.fieldValue}>{fill.rack_out_date ? fmt(fill.rack_out_date) : "Current"}</Text>
        </View>
        {fill.volume_litres ? (
          <View style={styles.cardField}>
            <Text style={styles.fieldLabel}>Volume</Text>
            <Text style={styles.fieldValue}>{fill.volume_litres} L</Text>
          </View>
        ) : null}
      </View>

      {fill.operator_name ? (
        <Text style={styles.cardFooter}>
          <Feather name="user" size={11} color={colors.textTertiary} /> {fill.operator_name}
        </Text>
      ) : null}
      {fill.notes ? <Text style={styles.cardNotes}>{fill.notes}</Text> : null}
    </View>
  );
}

function MaintenanceCard({ record }: { record: BarrelMaintenance }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{record.work_type ?? "Maintenance"}</Text>
        <Text style={styles.cardMeta}>{fmt(record.maintenance_date)}</Text>
      </View>

      <View style={styles.cardRow}>
        {record.cooperage_name ? (
          <View style={styles.cardField}>
            <Text style={styles.fieldLabel}>Cooperage</Text>
            <Text style={styles.fieldValue}>{record.cooperage_name}</Text>
          </View>
        ) : null}
        <View style={styles.cardField}>
          <Text style={styles.fieldLabel}>Cost</Text>
          <Text style={styles.fieldValue}>{pence(record.cost_pence)}</Text>
        </View>
      </View>

      {record.notes ? <Text style={styles.cardNotes}>{record.notes}</Text> : null}
    </View>
  );
}

function MovementCard({ record }: { record: BarrelMovement }) {
  const fromLabel = [record.from_zone, record.from_position].filter(Boolean).join(" · ") || "Unknown";
  const toLabel = [record.to_zone, record.to_position].filter(Boolean).join(" · ") || "—";

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{fmt(record.moved_date)}</Text>
        {record.reason ? <Text style={styles.cardMeta}>{record.reason}</Text> : null}
      </View>

      <View style={styles.movementRoute}>
        <Text style={styles.movementZone}>{fromLabel}</Text>
        <Feather name="arrow-right" size={14} color={colors.textTertiary} />
        <Text style={styles.movementZone}>{toLabel}</Text>
      </View>

      {record.operator_name ? (
        <Text style={styles.cardFooter}>
          <Feather name="user" size={11} color={colors.textTertiary} /> {record.operator_name}
        </Text>
      ) : null}
      {record.notes ? <Text style={styles.cardNotes}>{record.notes}</Text> : null}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function WineryVesselDetailScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const params = useLocalSearchParams<{
    vesselId: string;
    vesselRef: string;
    vesselType?: string;
    notes?: string;
  }>();

  const { data, loading, refreshing, error, refresh } = useVesselDetail(
    currentFarm?.id,
    params.vesselId
  );

  const subtitle = params.vesselType ?? "Vessel";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Feather
          name="arrow-left"
          size={20}
          color={colors.text}
          onPress={() => router.back()}
          style={styles.backBtn}
        />
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>{params.vesselRef ?? "Vessel"}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading vessel record…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Error banner */}
          {error ? (
            <View style={styles.errorBanner}>
              <Feather name="wifi-off" size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Vessel notes */}
          {params.notes ? (
            <View style={styles.notesCard}>
              <Text style={styles.notesLabel}>Notes</Text>
              <Text style={styles.notesText}>{params.notes}</Text>
            </View>
          ) : null}

          {/* Fill history */}
          <SectionHeader title="Fill History" count={data.fills.length} />
          {data.fills.length === 0 ? (
            <EmptySection label="No fill history recorded for this vessel." />
          ) : (
            data.fills.map(f => <FillCard key={f.id} fill={f} />)
          )}

          {/* Cooperage / maintenance log */}
          <SectionHeader title="Cooperage & Maintenance" count={data.maintenance.length} />
          {data.maintenance.length === 0 ? (
            <EmptySection label="No cooperage or maintenance records." />
          ) : (
            data.maintenance.map(m => <MaintenanceCard key={m.id} record={m} />)
          )}

          {/* Movements */}
          <SectionHeader title="Movements" count={data.movements.length} />
          {data.movements.length === 0 ? (
            <EmptySection label="No movement records logged." />
          ) : (
            data.movements.map(mv => <MovementCard key={mv.id} record={mv} />)
          )}
        </ScrollView>
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
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: 1,
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
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  errorText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.error,
  },
  notesCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  notesLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  notesText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.text,
    lineHeight: 20,
  },
  // Section header
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  countBadge: {
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  countText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  // Empty section
  emptySection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  emptySectionText: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.textTertiary,
    textAlign: "center",
  },
  // Generic card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
    color: colors.text,
    flex: 1,
  },
  cardMeta: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  cardField: {
    minWidth: 80,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.text,
  },
  cardFooter: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textTertiary,
  },
  cardNotes: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 18,
    fontStyle: "italic",
  },
  // Fill badge
  fillBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  fillBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  // Movement route
  movementRoute: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  movementZone: {
    fontSize: fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.text,
    flex: 1,
  },
});
