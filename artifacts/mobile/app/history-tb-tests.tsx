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

interface TbTestRecord {
  id: number;
  testDate: string;
  readingDate: string | null;
  testType: string;
  species: string;
  herdFlockRef: string | null;
  animalsTested: number | null;
  reactors: number;
  inconclusives: number;
  outcome: string;
  movementRestriction: boolean;
  restrictionLiftedDate: string | null;
  nextTestDueDate: string | null;
  testingVet: string | null;
  aphaOfficer: string | null;
  aphaCaseRef: string | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function yearOf(d: string | null | undefined): string {
  if (!d) return "";
  return new Date(d).getFullYear().toString();
}

const OUTCOME_STYLE: Record<string, { text: string; bg: string }> = {
  "clear": { text: "#15803d", bg: "#dcfce7" },
  "pass": { text: "#15803d", bg: "#dcfce7" },
  "inconclusive": { text: "#92400e", bg: "#fef3c7" },
  "fail": { text: "#b91c1c", bg: "#fee2e2" },
  "restricted": { text: "#b91c1c", bg: "#fee2e2" },
  "reactor-found": { text: "#b91c1c", bg: "#fee2e2" },
};

const TEST_TYPE_LABELS: Record<string, string> = {
  "routine": "Routine",
  "check": "Check Test",
  "pre-movement": "Pre-Movement",
  "post-movement": "Post-Movement",
  "gamma-ifn": "Gamma IFN",
  "elisa": "ELISA",
  "short-interval": "Short Interval",
};

export default function HistoryTbTestsScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { records, loading, refreshing, error, refresh } = useApiFetch<TbTestRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/tb-tests",
  );

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");

  const years = useMemo(
    () => Array.from(new Set(records.map(r => yearOf(r.testDate)).filter(Boolean))).sort().reverse(),
    [records],
  );

  const filtered = useMemo(() => {
    let list = records;
    if (yearFilter !== "all") list = list.filter(r => yearOf(r.testDate) === yearFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.species.toLowerCase().includes(q) ||
        (r.herdFlockRef ?? "").toLowerCase().includes(q) ||
        (r.testingVet ?? "").toLowerCase().includes(q) ||
        (r.aphaCaseRef ?? "").toLowerCase().includes(q) ||
        r.testType.toLowerCase().includes(q),
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
        <Text style={styles.title}>TB Test Records</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterBar}>
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search species, herd ref or vet…"
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
              <Feather name="activity" size={36} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No TB tests{yearFilter !== "all" ? ` for ${yearFilter}` : ""}</Text>
              <Text style={styles.emptySubtitle}>TB test results recorded on the dashboard will appear here.</Text>
            </View>
          }
          ListHeaderComponent={
            filtered.length > 0 ? (
              <Text style={styles.countLabel}>{filtered.length} test{filtered.length !== 1 ? "s" : ""}</Text>
            ) : null
          }
          renderItem={({ item }) => {
            const outcomeStyle = OUTCOME_STYLE[item.outcome.toLowerCase()] ?? { text: colors.textSecondary, bg: colors.background };
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateBadgeText}>{formatDate(item.testDate)}</Text>
                  </View>
                  <View style={[styles.outcomeBadge, { backgroundColor: outcomeStyle.bg }]}>
                    <Text style={[styles.outcomeBadgeText, { color: outcomeStyle.text }]}>
                      {item.outcome.toUpperCase()}
                    </Text>
                  </View>
                  {item.movementRestriction && !item.restrictionLiftedDate && (
                    <View style={[styles.outcomeBadge, { backgroundColor: "#fee2e2" }]}>
                      <Feather name="lock" size={10} color="#b91c1c" />
                      <Text style={[styles.outcomeBadgeText, { color: "#b91c1c" }]}> RESTRICTED</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle}>{item.species}</Text>
                <Text style={styles.cardSub}>{TEST_TYPE_LABELS[item.testType] ?? item.testType}
                  {item.herdFlockRef ? ` · Herd: ${item.herdFlockRef}` : ""}
                </Text>
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{item.animalsTested ?? "—"}</Text>
                    <Text style={styles.statLabel}>Tested</Text>
                  </View>
                  <View style={[styles.statBox, item.reactors > 0 && { backgroundColor: "#fee2e2" }]}>
                    <Text style={[styles.statValue, item.reactors > 0 && { color: "#b91c1c" }]}>{item.reactors}</Text>
                    <Text style={[styles.statLabel, item.reactors > 0 && { color: "#b91c1c" }]}>Reactors</Text>
                  </View>
                  <View style={[styles.statBox, item.inconclusives > 0 && { backgroundColor: "#fef3c7" }]}>
                    <Text style={[styles.statValue, item.inconclusives > 0 && { color: "#92400e" }]}>{item.inconclusives}</Text>
                    <Text style={[styles.statLabel, item.inconclusives > 0 && { color: "#92400e" }]}>Inconclusive</Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  {item.readingDate ? <Text style={styles.metaText}>Reading: {formatDate(item.readingDate)}</Text> : null}
                  {item.nextTestDueDate ? <Text style={styles.metaText}>Next due: {formatDate(item.nextTestDueDate)}</Text> : null}
                </View>
                {item.testingVet ? <Text style={styles.cardNote}>Vet: {item.testingVet}{item.aphaOfficer ? ` · APHA: ${item.aphaOfficer}` : ""}</Text> : null}
                {item.aphaCaseRef ? <Text style={styles.cardNote}>Case ref: {item.aphaCaseRef}</Text> : null}
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
  cardHeader: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.sm },
  dateBadge: { backgroundColor: colors.primaryMuted + "33", paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  dateBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primaryDark },
  outcomeBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  outcomeBadgeText: { fontFamily: fonts.semiBold, fontSize: fontSize.xs },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
  cardSub: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.sm },
  statBox: { flex: 1, backgroundColor: colors.background, borderRadius: radius.sm, padding: spacing.sm, alignItems: "center" },
  statValue: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  statLabel: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md, marginBottom: spacing.xs },
  metaText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  cardNote: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: 2 },
});
