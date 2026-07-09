import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { useFarm } from "@/lib/context/FarmContext";
import { useApiFetch } from "@/lib/hooks/useApiFetch";

interface SprayRecord {
  id: number;
  applicationDate: string;
  productName: string | null;
  fieldName: string | null;
  targetCrop: string | null;
  areaSprayedHa: number | null;
  operatorName: string | null;
  productCategory: string | null;
  reasonForApplication: string | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function yearOf(d: string | null | undefined): string {
  if (!d) return "";
  return new Date(d).getFullYear().toString();
}

export default function HistorySprayScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { records, loading, refreshing, error, refresh } = useApiFetch<SprayRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/spray-applications",
  );

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");

  const years = useMemo(
    () => Array.from(new Set(records.map(r => yearOf(r.applicationDate)).filter(Boolean))).sort().reverse(),
    [records],
  );

  const filtered = useMemo(() => {
    let list = records;
    if (yearFilter !== "all") list = list.filter(r => yearOf(r.applicationDate) === yearFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        (r.productName ?? "").toLowerCase().includes(q) ||
        (r.fieldName ?? "").toLowerCase().includes(q) ||
        (r.targetCrop ?? "").toLowerCase().includes(q) ||
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
        <Text style={styles.title}>Spray Applications</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterBar}>
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search product, field or operator…"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll} contentContainerStyle={styles.yearScrollContent}>
          {["all", ...years].map(y => (
            <Pressable key={y} onPress={() => setYearFilter(y)} style={[styles.yearPill, yearFilter === y && styles.yearPillActive]}>
              <Text style={[styles.yearPillText, yearFilter === y && styles.yearPillTextActive]}>
                {y === "all" ? "All years" : y}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centre}><ActivityIndicator size="large" color={colors.primary} /></View>
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          contentContainerStyle={filtered.length === 0 ? styles.centre : styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Feather name="droplet" size={36} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No spray records{yearFilter !== "all" ? ` for ${yearFilter}` : ""}</Text>
              <Text style={styles.emptySubtitle}>Spray applications recorded on the dashboard will appear here.</Text>
            </View>
          }
          ListHeaderComponent={
            filtered.length > 0 ? (
              <Text style={styles.countLabel}>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeText}>{formatDate(item.applicationDate)}</Text>
                </View>
                {item.productCategory ? (
                  <View style={styles.catBadge}>
                    <Text style={styles.catBadgeText}>{item.productCategory}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.cardTitle}>{item.productName ?? "Unknown product"}</Text>
              {item.fieldName ? <Text style={styles.cardSub}>📍 {item.fieldName}{item.targetCrop ? ` · ${item.targetCrop}` : ""}</Text> : null}
              <View style={styles.cardRow}>
                {item.areaSprayedHa != null ? (
                  <View style={styles.chip}>
                    <Feather name="maximize-2" size={11} color={colors.textSecondary} />
                    <Text style={styles.chipText}>{Number(item.areaSprayedHa).toFixed(2)} ha</Text>
                  </View>
                ) : null}
                {item.operatorName ? (
                  <View style={styles.chip}>
                    <Feather name="user" size={11} color={colors.textSecondary} />
                    <Text style={styles.chipText}>{item.operatorName}</Text>
                  </View>
                ) : null}
              </View>
              {item.reasonForApplication ? (
                <Text style={styles.cardNote} numberOfLines={2}>{item.reasonForApplication}</Text>
              ) : null}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { width: 40, alignItems: "flex-start" },
  title: { flex: 1, textAlign: "center", fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  filterBar: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingTop: spacing.sm },
  searchRow: { flexDirection: "row", alignItems: "center", marginHorizontal: spacing.lg, backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, paddingVertical: spacing.sm, fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.text },
  yearScroll: { flexGrow: 0 },
  yearScrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, gap: spacing.sm },
  yearPill: { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: 20, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  yearPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  yearPillText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  yearPillTextActive: { color: colors.textInverse },
  listContent: { padding: spacing.lg, gap: spacing.md },
  centre: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyWrap: { alignItems: "center", paddingTop: spacing.xl * 2 },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginTop: spacing.md, textAlign: "center" },
  emptySubtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, textAlign: "center", maxWidth: 280 },
  retryBtn: { marginTop: spacing.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.md },
  retryText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textInverse },
  countLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 3, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  dateBadge: { backgroundColor: colors.primaryMuted + "33", paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  dateBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primaryDark },
  catBadge: { backgroundColor: colors.infoBg, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  catBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.info },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
  cardSub: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  cardRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xs },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  chipText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  cardNote: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing.xs, fontStyle: "italic" },
});
