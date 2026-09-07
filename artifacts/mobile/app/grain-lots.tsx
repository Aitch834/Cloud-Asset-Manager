import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { kvGet, kvSet } from "@/lib/database";
import { getMobileAuthToken as getCurrentAuthToken } from "@/lib/authToken";

async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) { const f = JSON.parse(raw); return f.tenantSlug || f.slug || ""; }
  } catch { }
  return "";
}

interface GrainLot {
  id: number;
  lotReference: string | null;
  customerName: string;
  commodity: string;
  variety: string | null;
  grade: string | null;
  intakeDate: string;
  quantityTonnes: string;
  bayOrBin: string | null;
  status: string;
  notes: string | null;
  agreementId: number | null;
}

interface LotMovement {
  id: number;
  movementDate: string;
  movementType: string;
  quantityTonnes: string;
  destination: string | null;
  vehicleReg: string | null;
  haulier: string | null;
  deliveryNoteRef: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  in_store:  { label: "In Store",   color: "#166534", bg: "#dcfce7" },
  partial:   { label: "Partial",    color: "#92400e", bg: "#fef3c7" },
  outloaded: { label: "Outloaded",  color: "#6b7280", bg: "#f3f4f6" },
  returned:  { label: "Returned",   color: "#1e40af", bg: "#dbeafe" },
};

const MOVEMENT_LABELS: Record<string, string> = {
  outloading: "Outloading",
  sample: "Sample",
  return: "Return",
  transfer: "Transfer",
};

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
}

function fmt2dp(val: string | null | undefined): string {
  if (!val) return "—";
  const n = parseFloat(val);
  return isNaN(n) ? val : n.toFixed(2);
}

export default function GrainLotsScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const [lots, setLots] = useState<GrainLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [movements, setMovements] = useState<Record<number, LotMovement[]>>({});
  const [loadingMovements, setLoadingMovements] = useState<number | null>(null);

  const fetchLots = useCallback(async (silent = false) => {
    if (!currentFarm?.id) return;
    if (!silent) setLoading(true);
    setIsOffline(false);
    const cacheKey = `grain_lots_all_${currentFarm.id}`;

    try {
      const cached = await kvGet(cacheKey);
      if (cached) {
        setLots(JSON.parse(cached));
        if (!silent) setLoading(false);
      }
    } catch { }

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) { setIsOffline(true); setLoading(false); setRefreshing(false); return; }

    try {
      const [token, slug] = await Promise.all([getCurrentAuthToken(), getTenantSlug()]);
      if (!slug) { setIsOffline(true); setLoading(false); setRefreshing(false); return; }

      const headers: Record<string, string> = { "Content-Type": "application/json", "x-tenant-slug": slug };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`https://${apiDomain}/api/farms/${currentFarm.id}/grain-intakes`, { headers });
      if (!res.ok) throw new Error("API error");

      const data = await res.json() as { records?: GrainLot[] };
      const records = data.records ?? [];
      setLots(records);
      await kvSet(cacheKey, JSON.stringify(records));
    } catch {
      setIsOffline(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentFarm?.id]);

  useEffect(() => { fetchLots(); }, [fetchLots]);

  const fetchMovements = useCallback(async (intakeId: number) => {
    if (movements[intakeId] !== undefined) return;
    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) return;
    setLoadingMovements(intakeId);
    try {
      const [token, slug] = await Promise.all([getCurrentAuthToken(), getTenantSlug()]);
      if (!slug) return;
      const headers: Record<string, string> = { "Content-Type": "application/json", "x-tenant-slug": slug };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(
        `https://${apiDomain}/api/farms/${currentFarm!.id}/grain-intakes/${intakeId}/movements`,
        { headers },
      );
      if (!res.ok) return;
      const data = await res.json() as { records?: LotMovement[] };
      setMovements(prev => ({ ...prev, [intakeId]: data.records ?? [] }));
    } catch { }
    finally { setLoadingMovements(null); }
  }, [currentFarm?.id, movements]);

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      fetchMovements(id);
    }
  };

  const activeLots = lots.filter(l => l.status !== "outloaded" && l.status !== "returned");
  const closedLots = lots.filter(l => l.status === "outloaded" || l.status === "returned");

  const renderLot = (lot: GrainLot) => {
    const sc = STATUS_CONFIG[lot.status] ?? { label: lot.status, color: "#374151", bg: "#f3f4f6" };
    const isExpanded = expandedId === lot.id;
    const lotMovements = movements[lot.id];
    const lotRef = lot.lotReference ?? `#${lot.id}`;

    return (
      <View key={lot.id} style={styles.card}>
        <Pressable onPress={() => toggleExpand(lot.id)} style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.lotRef}>{lotRef}</Text>
              <View style={[styles.badge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.badgeText, { color: sc.color }]}>{sc.label}</Text>
              </View>
            </View>
            <Text style={styles.customerName}>{lot.customerName}</Text>
            <Text style={styles.commodityLine}>
              {lot.commodity}{lot.variety ? ` · ${lot.variety}` : ""}{lot.grade ? ` · ${lot.grade}` : ""}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Feather name="package" size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>{fmt2dp(lot.quantityTonnes)}t</Text>
              </View>
              <View style={styles.metaItem}>
                <Feather name="calendar" size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>{fmtDate(lot.intakeDate)}</Text>
              </View>
              {lot.bayOrBin ? (
                <View style={styles.metaItem}>
                  <Feather name="map-pin" size={12} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{lot.bayOrBin}</Text>
                </View>
              ) : null}
            </View>
          </View>
          <Feather
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.textSecondary}
          />
        </Pressable>

        {isExpanded && (
          <View style={styles.expandedSection}>
            <View style={styles.divider} />
            <View style={styles.expandedActions}>
              <Pressable
                style={styles.actionBtn}
                onPress={() => router.push("/third-party-grain-outloading")}
              >
                <Feather name="upload" size={13} color={colors.primary} />
                <Text style={styles.actionBtnText}>Record Outloading</Text>
              </Pressable>
            </View>

            <Text style={styles.movementHeading}>Movement History</Text>

            {loadingMovements === lot.id ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Loading movements…</Text>
              </View>
            ) : !lotMovements ? (
              <Text style={styles.offlineNote}>Connect to load movement history</Text>
            ) : lotMovements.length === 0 ? (
              <Text style={styles.emptyNote}>No movements recorded yet</Text>
            ) : (
              lotMovements.map(m => (
                <View key={m.id} style={styles.movementRow}>
                  <View style={styles.movementLeft}>
                    <Text style={styles.movementType}>{MOVEMENT_LABELS[m.movementType] ?? m.movementType}</Text>
                    <Text style={styles.movementDate}>{fmtDate(m.movementDate)}</Text>
                  </View>
                  <View style={styles.movementRight}>
                    <Text style={styles.movementQty}>{fmt2dp(m.quantityTonnes)}t</Text>
                    {m.destination ? <Text style={styles.movementDest}>{m.destination}</Text> : null}
                    {m.vehicleReg ? <Text style={styles.movementDest}>{m.vehicleReg}</Text> : null}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Grain Lots in Store</Text>
          <Text style={styles.subtitle}>Third-party customer lots — live balances</Text>
        </View>
        {isOffline && (
          <View style={styles.offlinePill}>
            <Feather name="wifi-off" size={11} color="#92400e" />
            <Text style={styles.offlinePillText}>Cached</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading lots…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 40 }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); setMovements({}); fetchLots(true); }}
              tintColor={colors.primary}
            />
          }
        >
          {lots.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={40} color={colors.border} />
              <Text style={styles.emptyTitle}>No lots recorded</Text>
              <Text style={styles.emptyBody}>
                Use the Third-Party Grain Intake form to book in a customer's delivery.
                Once synced, lots will appear here.
              </Text>
              <Pressable
                style={styles.intakeBtn}
                onPress={() => router.push("/third-party-grain-intake")}
              >
                <Feather name="download" size={14} color="#fff" />
                <Text style={styles.intakeBtnText}>Record Intake</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {activeLots.length > 0 && (
                <>
                  <Text style={styles.sectionHeading}>
                    Active — {activeLots.length} lot{activeLots.length !== 1 ? "s" : ""} in store
                  </Text>
                  {activeLots.map(renderLot)}
                </>
              )}

              {closedLots.length > 0 && (
                <>
                  <Text style={[styles.sectionHeading, { marginTop: spacing.lg }]}>
                    Closed / Outloaded
                  </Text>
                  {closedLots.map(renderLot)}
                </>
              )}

              <View style={styles.quickActions}>
                <Pressable
                  style={styles.quickBtn}
                  onPress={() => router.push("/third-party-grain-intake")}
                >
                  <Feather name="download" size={14} color={colors.primary} />
                  <Text style={styles.quickBtnText}>New Intake</Text>
                </Pressable>
                <Pressable
                  style={styles.quickBtn}
                  onPress={() => router.push("/third-party-grain-outloading")}
                >
                  <Feather name="upload" size={14} color={colors.primary} />
                  <Text style={styles.quickBtnText}>Record Outloading</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  offlinePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  offlinePillText: { fontFamily: fonts.medium, fontSize: 10, color: "#92400e" },
  centred: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  loadingText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  listContent: { padding: spacing.lg, gap: spacing.sm },
  sectionHeading: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: 2,
  },
  lotRef: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: { fontFamily: fonts.semiBold, fontSize: 10 },
  customerName: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: 2 },
  commodityLine: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  expandedSection: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  divider: { height: 1, backgroundColor: colors.borderLight, marginBottom: spacing.md },
  expandedActions: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primary + "50",
    backgroundColor: colors.primary + "08",
  },
  actionBtnText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  movementHeading: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm },
  offlineNote: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, paddingVertical: spacing.sm },
  emptyNote: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, paddingVertical: spacing.sm },
  movementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  movementLeft: { flex: 1 },
  movementRight: { alignItems: "flex-end" },
  movementType: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  movementDate: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  movementQty: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  movementDest: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, textAlign: "right" },
  emptyState: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  emptyBody: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
  intakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
  },
  intakeBtnText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: "#fff" },
  quickActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
    justifyContent: "center",
  },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  quickBtnText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
});
