import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { apiFetch } from "@/lib/apiFetch";
import { useFarm } from "@/lib/context/FarmContext";

interface IrrigationRecord {
  id: number;
  irrigationDate: string;
  fieldId: number | null;
  fieldOrBlockDescription: string | null;
  applicationDepthMm: string | number | null;
  irrigationMethod: string;
  cropType: string | null;
  areaIrrigatedHa: string | number | null;
  operatorName: string | null;
  notes: string | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function yearOf(d: string | null | undefined): string {
  if (!d) return "";
  return new Date(d).getFullYear().toString();
}

function fieldLabel(record: IrrigationRecord): string {
  if (record.fieldOrBlockDescription) return record.fieldOrBlockDescription;
  if (record.fieldId) return `Field #${record.fieldId}`;
  return "";
}

export default function IrrigationHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id;

  const [records, setRecords] = useState<IrrigationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqIdRef = useRef(0);

  const load = useCallback(async (isRefresh = false) => {
    if (!farmId) { setRecords([]); setLoading(false); return; }
    const reqId = ++reqIdRef.current;
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/farms/${farmId}/irrigation-records`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json() as IrrigationRecord[];
      if (reqId === reqIdRef.current) setRecords(Array.isArray(json) ? json : []);
    } catch (err) {
      if (reqId === reqIdRef.current) setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      if (reqId === reqIdRef.current) { setLoading(false); setRefreshing(false); }
    }
  }, [farmId]);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(() => { void load(true); }, [load]);

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");

  const years = useMemo(
    () =>
      Array.from(new Set(records.map(r => yearOf(r.irrigationDate)).filter(Boolean)))
        .sort()
        .reverse(),
    [records],
  );

  const filtered = useMemo(() => {
    let list = records;
    if (yearFilter !== "all") list = list.filter(r => yearOf(r.irrigationDate) === yearFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        r =>
          (r.irrigationMethod ?? "").toLowerCase().includes(q) ||
          fieldLabel(r).toLowerCase().includes(q) ||
          (r.cropType ?? "").toLowerCase().includes(q) ||
          (r.operatorName ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [records, yearFilter, search]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Irrigation Applications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterBar}>
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search field, method or crop…"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.yearScroll}
          contentContainerStyle={styles.yearScrollContent}
        >
          {["all", ...years].map(y => (
            <Pressable
              key={y}
              onPress={() => setYearFilter(y)}
              style={[styles.yearPill, yearFilter === y && styles.yearPillActive]}
            >
              <Text style={[styles.yearPillText, yearFilter === y && styles.yearPillTextActive]}>
                {y === "all" ? "All years" : y}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centre}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
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
          data={filtered}
          keyExtractor={item => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
          }
          contentContainerStyle={filtered.length === 0 ? styles.centre : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Feather name="droplet" size={36} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>
                No applications{yearFilter !== "all" ? ` for ${yearFilter}` : ""}
              </Text>
              <Text style={styles.emptySubtitle}>
                Irrigation applications logged from the Advisor or dashboard will appear here.
              </Text>
            </View>
          }
          ListHeaderComponent={
            filtered.length > 0 ? (
              <Text style={styles.countLabel}>
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </Text>
            ) : null
          }
          renderItem={({ item }) => {
            const field = fieldLabel(item);
            const depthNum =
              item.applicationDepthMm != null ? Number(item.applicationDepthMm) : null;
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>{formatDate(item.irrigationDate)}</Text>
                  </View>
                  <View style={styles.methodBadge}>
                    <Text style={styles.methodBadgeText} numberOfLines={1}>
                      {item.irrigationMethod}
                    </Text>
                  </View>
                </View>

                {field ? (
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    📍 {field}
                  </Text>
                ) : null}

                {item.cropType ? (
                  <Text style={styles.cardSub}>{item.cropType}</Text>
                ) : null}

                <View style={styles.cardRow}>
                  {depthNum != null && depthNum > 0 ? (
                    <View style={styles.chip}>
                      <Feather name="layers" size={11} color={colors.textSecondary} />
                      <Text style={styles.chipText}>{depthNum.toFixed(1)} mm</Text>
                    </View>
                  ) : null}
                  {item.areaIrrigatedHa != null && Number(item.areaIrrigatedHa) > 0 ? (
                    <View style={styles.chip}>
                      <Feather name="maximize-2" size={11} color={colors.textSecondary} />
                      <Text style={styles.chipText}>
                        {Number(item.areaIrrigatedHa).toFixed(2)} ha
                      </Text>
                    </View>
                  ) : null}
                  {item.operatorName ? (
                    <View style={styles.chip}>
                      <Feather name="user" size={11} color={colors.textSecondary} />
                      <Text style={styles.chipText}>{item.operatorName}</Text>
                    </View>
                  ) : null}
                </View>

                {item.notes ? (
                  <Text style={styles.cardNote} numberOfLines={2}>
                    {item.notes}
                  </Text>
                ) : null}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

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
  filterBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: spacing.sm,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
  },
  yearScroll: { flexGrow: 0 },
  yearScrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  yearPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  yearPillText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  yearPillTextActive: { color: colors.textInverse },
  listContent: { padding: spacing.lg, gap: spacing.md },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyWrap: { alignItems: "center", paddingTop: spacing.xl * 2 },
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
  retryText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textInverse },
  countLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: "wrap",
  },
  dateBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  dateBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: "#0369a1" },
  methodBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexShrink: 1,
  },
  methodBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
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
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  chipText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  cardNote: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
});
