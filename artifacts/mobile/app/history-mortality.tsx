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

interface MortalityRecord {
  id: number;
  dateOfDeath: string;
  species: string;
  tagNumber: string | null;
  breed: string | null;
  causeOfDeath: string;
  disposalMethod: string | null;
  disposalOperator: string | null;
  disposalRef: string | null;
  veterinaryAttended: boolean | null;
  vetName: string | null;
  postMortemCarriedOut: boolean | null;
  postMortemFindings: string | null;
  bcmsNotified: boolean | null;
  bcmsNotificationRef: string | null;
  contractorName: string | null;
  invoiceStatus: string | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function yearOf(d: string | null | undefined): string {
  if (!d) return "";
  return new Date(d).getFullYear().toString();
}

const DISPOSAL_LABELS: Record<string, string> = {
  "knackery": "Knackery",
  "hunt": "Hunt",
  "incinerator": "Incinerator",
  "rendering": "Rendering",
  "burial": "Burial",
  "own-land": "Burial (own land)",
};

export default function HistoryMortalityScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { records, loading, refreshing, error, refresh } = useApiFetch<MortalityRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/mortality-records",
  );

  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("all");

  const years = useMemo(
    () => Array.from(new Set(records.map(r => yearOf(r.dateOfDeath)).filter(Boolean))).sort().reverse(),
    [records],
  );

  const filtered = useMemo(() => {
    let list = records;
    if (yearFilter !== "all") list = list.filter(r => yearOf(r.dateOfDeath) === yearFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.species.toLowerCase().includes(q) ||
        (r.tagNumber ?? "").toLowerCase().includes(q) ||
        r.causeOfDeath.toLowerCase().includes(q) ||
        (r.breed ?? "").toLowerCase().includes(q) ||
        (r.contractorName ?? "").toLowerCase().includes(q),
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
        <Text style={styles.title}>Mortality Records</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.filterBar}>
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search species, tag, cause or breed…"
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
              <Feather name="file-text" size={36} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No mortality records{yearFilter !== "all" ? ` for ${yearFilter}` : ""}</Text>
              <Text style={styles.emptySubtitle}>Mortality records must be retained for 3 years by law. Records entered on the dashboard appear here.</Text>
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
                  <Text style={styles.dateBadgeText}>{formatDate(item.dateOfDeath)}</Text>
                </View>
                {item.bcmsNotified ? (
                  <View style={[styles.statusBadge, { backgroundColor: colors.successBg }]}>
                    <Feather name="check-circle" size={10} color={colors.success} />
                    <Text style={[styles.statusText, { color: colors.success }]}> BCMS notified</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: colors.warningBg }]}>
                    <Feather name="alert-circle" size={10} color={colors.warning} />
                    <Text style={[styles.statusText, { color: colors.warning }]}> BCMS pending</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardTitle}>{item.species}{item.breed ? ` · ${item.breed}` : ""}</Text>
              {item.tagNumber ? (
                <Text style={styles.tagText}>Tag: {item.tagNumber}</Text>
              ) : null}
              <Text style={styles.causeText}>{item.causeOfDeath}</Text>
              <View style={styles.cardRow}>
                {item.disposalMethod ? (
                  <View style={styles.chip}>
                    <Feather name="trash-2" size={11} color={colors.textSecondary} />
                    <Text style={styles.chipText}>{DISPOSAL_LABELS[item.disposalMethod] ?? item.disposalMethod}</Text>
                  </View>
                ) : null}
                {item.veterinaryAttended ? (
                  <View style={styles.chip}>
                    <Feather name="user-check" size={11} color={colors.textSecondary} />
                    <Text style={styles.chipText}>Vet attended{item.vetName ? `: ${item.vetName}` : ""}</Text>
                  </View>
                ) : null}
                {item.postMortemCarriedOut ? (
                  <View style={[styles.chip, { backgroundColor: colors.infoBg }]}>
                    <Feather name="clipboard" size={11} color={colors.info} />
                    <Text style={[styles.chipText, { color: colors.info }]}>Post mortem</Text>
                  </View>
                ) : null}
              </View>
              {item.contractorName ? (
                <Text style={styles.cardNote}>Contractor: {item.contractorName}{item.disposalRef ? ` · Ref: ${item.disposalRef}` : ""}</Text>
              ) : null}
              {item.bcmsNotificationRef ? (
                <Text style={styles.cardNote}>BCMS ref: {item.bcmsNotificationRef}</Text>
              ) : null}
              {item.postMortemFindings ? (
                <Text style={styles.cardNote} numberOfLines={2}>PM findings: {item.postMortemFindings}</Text>
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
  cardHeader: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.sm },
  dateBadge: { backgroundColor: colors.primaryMuted + "33", paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  dateBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primaryDark },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  statusText: { fontFamily: fonts.medium, fontSize: fontSize.xs },
  cardTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
  tagText: { fontFamily: fonts.mono ?? fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 2 },
  causeText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.sm },
  cardRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.xs },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.background, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  chipText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  cardNote: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing.xs },
});
