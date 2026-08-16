import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
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
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";

interface VineRegisterEntry {
  id: number;
  fsaVineRegisterRef: string | null;
  registeredVariety: string | null;
  registeredAreaHa: string | null;
  giClassification: string | null;
  wineColour: string | null;
  dateRegistered: string | null;
  isRemovedFromRegister: boolean | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Register Row ─────────────────────────────────────────────────────────────

function RegisterRow({ item }: { item: VineRegisterEntry }) {
  const isRemoved = !!item.isRemovedFromRegister;
  return (
    <View style={[styles.row, isRemoved && styles.rowRemoved]}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowVariety}>{item.registeredVariety ?? "—"}</Text>
        <View style={styles.rowMeta}>
          {!!item.registeredAreaHa && (
            <Text style={styles.rowSub}>
              {parseFloat(item.registeredAreaHa).toFixed(2)} ha
            </Text>
          )}
          {!!item.giClassification && (
            <Text style={styles.rowSub}> · {item.giClassification}</Text>
          )}
          {!!item.wineColour && (
            <Text style={styles.rowSub}> · {item.wineColour}</Text>
          )}
        </View>
        <View style={styles.rowMeta}>
          {!!item.fsaVineRegisterRef && (
            <Text style={styles.rowRef}>Ref: {item.fsaVineRegisterRef}</Text>
          )}
          {!!item.dateRegistered && (
            <Text style={styles.rowRef}>
              {item.fsaVineRegisterRef ? " · " : ""}Registered: {formatDate(item.dateRegistered)}
            </Text>
          )}
        </View>
      </View>
      {isRemoved ? (
        <View style={styles.removedBadge}>
          <Text style={styles.removedBadgeText}>Removed</Text>
        </View>
      ) : (
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Active</Text>
        </View>
      )}
    </View>
  );
}

// ─── RPA Warning Banner ────────────────────────────────────────────────────────

function RpaWarningBanner({
  sbiMissing,
  sectorMissing,
}: {
  sbiMissing: boolean;
  sectorMissing: boolean;
}) {
  if (!sbiMissing && !sectorMissing) return null;

  const missing =
    sbiMissing && sectorMissing
      ? "an SBI number and a Viticulture sector"
      : sbiMissing
      ? "an SBI number"
      : "a Viticulture sector";

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/more")}
      style={styles.rpaBanner}
      accessibilityRole="button"
      accessibilityLabel="RPA Export unavailable. Tap to go to Settings."
    >
      <Feather name="alert-triangle" size={15} color="#92400e" style={{ marginTop: 1 }} />
      <Text style={styles.rpaBannerText}>
        <Text style={styles.rpaBannerBold}>RPA Export unavailable: </Text>
        The Print RPA Reference action requires {missing} to be set.{" "}
        <Text style={styles.rpaBannerLink}>Tap to go to Settings.</Text>
      </Text>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VineRegisterScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { sbiNumber, loading: identifiersLoading } = useFarmIdentifiers(currentFarm?.id);
  const { records, loading, refreshing, error, refresh } = useApiFetch<VineRegisterEntry>(
    currentFarm?.id,
    "/api/farms/:farmId/vine-register",
  );

  const [search, setSearch] = useState("");

  const sbiMissing = !identifiersLoading && !sbiNumber;
  const sectorMissing = !currentFarm?.sectorViticulture;
  const showRpaWarning = !identifiersLoading && (sbiMissing || sectorMissing);

  const activeRecords = records.filter(r => !r.isRemovedFromRegister);
  const totalAreaHa = activeRecords.reduce((sum, r) => {
    const area = parseFloat(r.registeredAreaHa ?? "");
    return sum + (isNaN(area) ? 0 : area);
  }, 0);

  const filtered = search.trim()
    ? records.filter(r =>
        (r.registeredVariety ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (r.fsaVineRegisterRef ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : records;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>FSA Vine Register</Text>
      </View>

      {/* RPA missing-fields warning */}
      {showRpaWarning && (
        <RpaWarningBanner sbiMissing={sbiMissing} sectorMissing={sectorMissing} />
      )}

      {/* Summary card */}
      {!loading && !error && records.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{activeRecords.length}</Text>
            <Text style={styles.summaryLabel}>Active{"\n"}Entries</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{totalAreaHa.toFixed(2)}</Text>
            <Text style={styles.summaryLabel}>Registered{"\n"}Area (ha)</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStat}>
            <Text style={styles.summaryValue}>{records.length}</Text>
            <Text style={styles.summaryLabel}>Total{"\n"}Entries</Text>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search variety or FSA ref…"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

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
          contentContainerStyle={
            filtered.length === 0 ? styles.emptyContainer : styles.listContent
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => <RegisterRow item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="list" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No register entries</Text>
              <Text style={styles.emptyText}>
                {search.trim()
                  ? "No entries match your search."
                  : "Add vine register entries from the dashboard to see them here."}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

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
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
    flex: 1,
  },
  rpaBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rpaBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  rpaBannerBold: {
    fontFamily: fonts.semiBold,
    color: "#92400e",
  },
  rpaBannerLink: {
    fontFamily: fonts.medium,
    color: "#92400e",
    textDecorationLine: "underline",
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  summaryStat: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  summaryValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.md,
    marginTop: spacing.sm,
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
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  rowRemoved: {
    opacity: 0.55,
  },
  rowLeft: { flex: 1, gap: 3 },
  rowVariety: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  rowSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  rowRef: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  activeBadge: {
    backgroundColor: "#f0fdf4",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#86efac",
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  activeBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#166534",
  },
  removedBadge: {
    backgroundColor: "#fef2f2",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fca5a5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: spacing.sm,
  },
  removedBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#991b1b",
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
  errorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.error,
    flex: 1,
  },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
