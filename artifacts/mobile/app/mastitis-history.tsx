import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { G, Line, Rect, Text as SvgText } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useApiFetch } from "@/lib/hooks/useApiFetch";
import { getList, STORAGE_KEYS } from "@/lib/storage";
import type { DairyMastitisRecord } from "@/lib/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MastitisRecord {
  id: number | string;
  onsetDate: string;
  earTagNumber?: string | null;
  quartersAffected?: string | null;
  clinicalGrade?: string | null;
  treatmentProduct?: string | null;
  standardWithdrawalDays?: number | null;
  doubledWithdrawalDays?: number | null;
  withdrawalEndDate?: string | null;
  certifierNotified?: boolean | null;
  outcome?: string | null;
  chronicCase?: boolean | null;
  attendingVet?: string | null;
  notes?: string | null;
  /** True for records saved on-device that have not yet synced to the server */
  _offline?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function monthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function shortMonthLabel(year: number, month: number): string {
  return new Date(year, month, 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "2-digit",
  });
}

// ── Trend chart ───────────────────────────────────────────────────────────────

const CHART_HEIGHT = 140;
const BAR_COLOR_REGULAR = "#60a5fa"; // blue-400
const BAR_COLOR_CHRONIC = "#fbbf24"; // amber-400

interface TrendSlot {
  label: string;
  year: number;
  month: number;
  regular: number;
  chronic: number;
}

function MastitisTrendChart({
  data,
  width,
}: {
  data: TrendSlot[];
  width: number;
}) {
  const PAD_LEFT = 24;
  const PAD_RIGHT = 4;
  const PAD_TOP = 8;
  const PAD_BOTTOM = 28;

  const plotW = width - PAD_LEFT - PAD_RIGHT;
  const plotH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const maxVal = Math.max(...data.map((d) => d.regular + d.chronic), 1);
  // Round up to nearest nice number
  const yMax = maxVal <= 4 ? 4 : Math.ceil(maxVal / 2) * 2;

  const barW = (plotW / data.length) * 0.55;
  const gap = plotW / data.length;

  const yTicks = [0, Math.round(yMax / 2), yMax];

  return (
    <Svg width={width} height={CHART_HEIGHT}>
      {/* Y-axis gridlines + labels */}
      {yTicks.map((tick) => {
        const y = PAD_TOP + plotH - (tick / yMax) * plotH;
        return (
          <G key={tick}>
            <Line
              x1={PAD_LEFT}
              y1={y}
              x2={PAD_LEFT + plotW}
              y2={y}
              stroke="#f0f0f0"
              strokeWidth={1}
            />
            <SvgText
              x={PAD_LEFT - 3}
              y={y + 3.5}
              fontSize={8}
              fill="#9ca3af"
              textAnchor="end"
            >
              {tick}
            </SvgText>
          </G>
        );
      })}

      {/* Bars */}
      {data.map((slot, i) => {
        const x = PAD_LEFT + i * gap + gap / 2 - barW / 2;
        const regularH = (slot.regular / yMax) * plotH;
        const chronicH = (slot.chronic / yMax) * plotH;
        const totalH = regularH + chronicH;

        return (
          <G key={i}>
            {/* Regular (bottom) */}
            {regularH > 0 && (
              <Rect
                x={x}
                y={PAD_TOP + plotH - regularH}
                width={barW}
                height={regularH}
                fill={BAR_COLOR_REGULAR}
                rx={chronicH > 0 ? 0 : 2}
                ry={chronicH > 0 ? 0 : 2}
              />
            )}
            {/* Chronic (top) */}
            {chronicH > 0 && (
              <Rect
                x={x}
                y={PAD_TOP + plotH - totalH}
                width={barW}
                height={chronicH}
                fill={BAR_COLOR_CHRONIC}
                rx={2}
                ry={2}
              />
            )}
            {/* Empty bar outline when both zero */}
            {totalH === 0 && (
              <Rect
                x={x}
                y={PAD_TOP + plotH - 2}
                width={barW}
                height={2}
                fill="#e5e7eb"
                rx={1}
              />
            )}
            {/* X-axis label */}
            <SvgText
              x={PAD_LEFT + i * gap + gap / 2}
              y={PAD_TOP + plotH + 14}
              fontSize={8}
              fill="#9ca3af"
              textAnchor="middle"
            >
              {slot.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function MastitisHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id != null ? String(currentFarm.id) : undefined;

  const { records: serverRecords, loading, refreshing, error, refresh } =
    useApiFetch<MastitisRecord>(farmId, "/api/farms/:farmId/dairy/mastitis-records");

  // Merge unsynced offline records so records entered on-device appear immediately
  const [offlineRecords, setOfflineRecords] = useState<MastitisRecord[]>([]);
  useEffect(() => {
    if (!farmId) return;
    getList<DairyMastitisRecord>(STORAGE_KEYS.DAIRY_MASTITIS_RECORDS, farmId)
      .then((local) => {
        const unsynced = local
          .filter((r) => !r.synced && String(r.farmId) === String(farmId))
          .map<MastitisRecord>((r) => ({
            id: r.id,
            onsetDate: r.onsetDate,
            earTagNumber: r.cowEarTag || null,
            quartersAffected: r.quartersAffected || null,
            clinicalGrade: r.clinicalGrade || null,
            treatmentProduct: r.treatmentProduct || null,
            standardWithdrawalDays: null,
            doubledWithdrawalDays: null,
            withdrawalEndDate: null,
            certifierNotified: null,
            outcome: null,
            chronicCase: null,
            attendingVet: r.vetName || null,
            notes: r.notes || null,
            _offline: true,
          }));
        setOfflineRecords(unsynced);
      })
      .catch(() => { /* storage read failure is non-fatal */ });
  }, [farmId, refreshing]);

  // Combined list: offline-only records + server records, sorted newest first
  const records = useMemo<MastitisRecord[]>(() => {
    const serverIds = new Set(serverRecords.map((r) => String(r.id)));
    const pendingOffline = offlineRecords.filter((r) => !serverIds.has(String(r.id)));
    return [...pendingOffline, ...serverRecords].sort((a, b) =>
      (b.onsetDate ?? "").localeCompare(a.onsetDate ?? ""),
    );
  }, [serverRecords, offlineRecords]);

  // Month navigator (defaults to current month)
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth());

  function stepMonth(dir: 1 | -1) {
    const next = filterMonth + dir;
    if (next < 0) {
      setFilterYear((y) => y - 1);
      setFilterMonth(11);
    } else if (next > 11) {
      setFilterYear((y) => y + 1);
      setFilterMonth(0);
    } else {
      setFilterMonth(next);
    }
  }

  // 12-month rolling trend
  const trendData = useMemo<TrendSlot[]>(() => {
    const nowYear = now.getFullYear();
    const nowMonth = now.getMonth();
    const slots: TrendSlot[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(nowYear, nowMonth - i, 1);
      slots.push({
        label: shortMonthLabel(d.getFullYear(), d.getMonth()),
        year: d.getFullYear(),
        month: d.getMonth(),
        regular: 0,
        chronic: 0,
      });
    }
    for (const r of records) {
      if (!r.onsetDate) continue;
      const d = new Date(r.onsetDate);
      const slot = slots.find(
        (s) => s.year === d.getFullYear() && s.month === d.getMonth(),
      );
      if (!slot) continue;
      if (r.outcome === "chronic" || r.chronicCase) {
        slot.chronic += 1;
      } else {
        slot.regular += 1;
      }
    }
    return slots;
  }, [records]);

  // Monthly list
  const monthRecords = useMemo(
    () =>
      records.filter((r) => {
        if (!r.onsetDate) return false;
        const d = new Date(r.onsetDate);
        return d.getFullYear() === filterYear && d.getMonth() === filterMonth;
      }),
    [records, filterYear, filterMonth],
  );

  const hasAnyRecords = records.length > 0;
  const chartLabel = monthLabel(filterYear, filterMonth);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Mastitis History</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error && records.length === 0 ? (
        <View style={styles.centre}>
          <Feather name="wifi-off" size={32} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>Could not load records</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <Pressable onPress={refresh} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={monthRecords}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={
            monthRecords.length === 0 ? styles.listEmpty : styles.listContent
          }
          ListHeaderComponent={
            <View>
              {/* 12-month trend chart */}
              {/* Server error banner — shown when we have offline records but couldn't reach the server */}
              {!!error && (
                <View style={styles.offlineBanner}>
                  <Feather name="wifi-off" size={14} color="#92400e" />
                  <Text style={styles.offlineBannerText}>
                    Couldn't reach the server — showing saved offline records only.
                  </Text>
                </View>
              )}

              {hasAnyRecords && (
                <View style={styles.chartCard}>
                  <Text style={styles.chartTitle}>12-Month Case Trend</Text>
                  {/* Legend */}
                  <View style={styles.legend}>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: BAR_COLOR_REGULAR },
                        ]}
                      />
                      <Text style={styles.legendText}>Standard</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: BAR_COLOR_CHRONIC },
                        ]}
                      />
                      <Text style={styles.legendText}>Chronic</Text>
                    </View>
                  </View>
                  <View
                    style={styles.chartWrap}
                    onLayout={(e) => {
                      // Width is measured via onLayout; we pass it to chart
                    }}
                  >
                    <ChartWithWidth data={trendData} />
                  </View>
                </View>
              )}

              {/* Month navigator */}
              <View style={styles.monthNav}>
                <Pressable
                  onPress={() => stepMonth(-1)}
                  style={styles.monthArrow}
                  hitSlop={10}
                >
                  <Feather
                    name="chevron-left"
                    size={20}
                    color={colors.text}
                  />
                </Pressable>
                <Text style={styles.monthLabel}>{chartLabel}</Text>
                <Pressable
                  onPress={() => stepMonth(1)}
                  style={styles.monthArrow}
                  hitSlop={10}
                >
                  <Feather
                    name="chevron-right"
                    size={20}
                    color={colors.text}
                  />
                </Pressable>
              </View>

              {monthRecords.length > 0 && (
                <Text style={styles.countLabel}>
                  {monthRecords.length} case
                  {monthRecords.length !== 1 ? "s" : ""}
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Feather name="check-circle" size={36} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No cases in {chartLabel}</Text>
              <Text style={styles.emptySubtitle}>
                {hasAnyRecords
                  ? "Use the month arrows to navigate to a different month."
                  : "Mastitis records added on the dashboard will appear here."}
              </Text>
            </View>
          }
          renderItem={({ item }) => <MastitisCard record={item} />}
        />
      )}
    </View>
  );
}

// ── Chart with measured width ─────────────────────────────────────────────────

function ChartWithWidth({ data }: { data: TrendSlot[] }) {
  const [chartWidth, setChartWidth] = useState(0);
  return (
    <View
      onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
      style={{ width: "100%" }}
    >
      {chartWidth > 0 && (
        <MastitisTrendChart data={data} width={chartWidth} />
      )}
    </View>
  );
}

// ── Record card ───────────────────────────────────────────────────────────────

function MastitisCard({ record: r }: { record: MastitisRecord }) {
  const isChronic = r.outcome === "chronic" || !!r.chronicCase;
  const certStatus =
    r.treatmentProduct
      ? r.certifierNotified
        ? { label: "Certifier notified", bg: "#dcfce7", color: "#15803d" }
        : { label: "Notify certifier", bg: "#fef3c7", color: "#92400e" }
      : null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>{formatDate(r.onsetDate)}</Text>
        </View>
        {isChronic && (
          <View style={styles.chronicBadge}>
            <Text style={styles.chronicText}>Chronic</Text>
          </View>
        )}
        {r._offline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>Pending sync</Text>
          </View>
        )}
        {certStatus && (
          <View style={[styles.certBadge, { backgroundColor: certStatus.bg }]}>
            <Text style={[styles.certText, { color: certStatus.color }]}>
              {certStatus.label}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.cardTitle}>
        {r.earTagNumber || "Unknown cow"}
        {r.quartersAffected ? ` · ${r.quartersAffected}` : ""}
      </Text>

      {r.clinicalGrade ? (
        <Text style={styles.cardSub}>Grade: {r.clinicalGrade}</Text>
      ) : null}
      {r.treatmentProduct ? (
        <Text style={styles.cardSub}>Treatment: {r.treatmentProduct}</Text>
      ) : null}
      {r.doubledWithdrawalDays != null ? (
        <Text style={styles.cardSub}>
          Doubled W/D: {r.doubledWithdrawalDays}d
          {r.withdrawalEndDate
            ? ` (ends ${formatDate(r.withdrawalEndDate)})`
            : ""}
        </Text>
      ) : null}
      {r.outcome && r.outcome !== "chronic" ? (
        <Text style={styles.cardSub}>Outcome: {r.outcome}</Text>
      ) : null}
      {r.attendingVet ? (
        <Text style={styles.cardSub}>Vet: {r.attendingVet}</Text>
      ) : null}
      {r.notes ? (
        <Text style={styles.cardNote} numberOfLines={2}>
          {r.notes}
        </Text>
      ) : null}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  title: {
    flex: 1,
    textAlign: "center",
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  listContent: { padding: spacing.lg, gap: spacing.md },
  listEmpty: { padding: spacing.lg, flexGrow: 1 },
  emptyWrap: {
    alignItems: "center",
    paddingTop: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: "center",
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: "center",
    maxWidth: 280,
  },
  retryBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  retryText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textInverse,
  },

  // Chart
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  legend: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  chartWrap: { width: "100%" },

  // Month navigator
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  monthArrow: {
    padding: spacing.xs,
  },
  monthLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  countLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateBadge: {
    backgroundColor: "#fee2e280",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  dateBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#991b1b",
  },
  chronicBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  chronicText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#92400e",
  },
  certBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  certText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
  },
  cardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: 2,
  },
  cardSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardNote: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  offlineBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  offlineText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#0369a1",
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  offlineBannerText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    flex: 1,
  },
});
