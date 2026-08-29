import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useApiFetch } from "@/lib/hooks/useApiFetch";
import { getList, STORAGE_KEYS } from "@/lib/storage";
import type { DairyDctRecord } from "@/lib/types";
import {
  buildDctCsv,
  buildDctCsvFilename,
  type DctCsvRecord,
} from "@/lib/utils/dctCsv";

interface DctRecord extends DctCsvRecord {
  id: number | string;
  notes?: string | null;
  _offline?: boolean;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
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

async function shareDctCsv(records: DctRecord[], monthName: string): Promise<void> {
  const filename = buildDctCsvFilename(monthName);
  const content = buildDctCsv(records);

  if (Platform.OS === "web") {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  const { shareAsync } = await import("expo-sharing");
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await shareAsync(uri, {
    mimeType: "text/csv",
    dialogTitle: "Share DCT CSV",
    UTI: "public.comma-separated-values-text",
  });
}

export default function DctHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id != null ? String(currentFarm.id) : undefined;
  const { records: serverRecords, loading, refreshing, error, refresh } =
    useApiFetch<DctRecord>(farmId, "/api/farms/:farmId/dairy/dct-records");

  const [offlineRecords, setOfflineRecords] = useState<DctRecord[]>([]);
  const [exporting, setExporting] = useState(false);
  const now = new Date();
  const [filterYear, setFilterYear] = useState(now.getFullYear());
  const [filterMonth, setFilterMonth] = useState(now.getMonth());

  useEffect(() => {
    if (!farmId) return;
    getList<DairyDctRecord>(STORAGE_KEYS.DAIRY_DCT_RECORDS, farmId)
      .then((local) => {
        const unsynced = local
          .filter((record) => !record.synced && String(record.farmId) === farmId)
          .map<DctRecord>((record) => ({
            id: record.id,
            dryOffDate: record.dryOffDate,
            cowEarTag: record.cowEarTag,
            protocol: record.protocol,
            antibioticTubeProduct: record.antibioticProduct,
            antibioticTubeBatch: record.antibioticBatch,
            antibioticTubeWithdrawalMilkDays: record.milkWithdrawalDays
              ? Number(record.milkWithdrawalDays)
              : null,
            doubledMilkWithdrawalDays: record.milkWithdrawalDays
              ? Number(record.milkWithdrawalDays) * 2
              : null,
            teatSealantProduct: record.teatSealantProduct,
            sccAtDryOff: record.sccAtDryOff,
            vetAuthorisation: record.pomvAuthorised,
            vetName: record.prescribingVet,
            expectedCalvingDate: record.expectedCalvingDate,
            treatmentJustification: record.treatmentJustification,
            notes: record.notes,
            _offline: true,
          }));
        setOfflineRecords(unsynced);
      })
      .catch(() => {
        // Storage read errors should not prevent server records from showing.
      });
  }, [farmId, refreshing]);

  const records = useMemo<DctRecord[]>(() => {
    const serverIds = new Set(serverRecords.map((record) => String(record.id)));
    const pendingOffline = offlineRecords.filter(
      (record) => !serverIds.has(String(record.id)),
    );
    return [...pendingOffline, ...serverRecords].sort((a, b) =>
      (b.dryOffDate ?? "").localeCompare(a.dryOffDate ?? ""),
    );
  }, [offlineRecords, serverRecords]);

  const monthRecords = useMemo(
    () =>
      records.filter((record) => {
        if (!record.dryOffDate) return false;
        const date = new Date(record.dryOffDate);
        return (
          date.getFullYear() === filterYear && date.getMonth() === filterMonth
        );
      }),
    [filterMonth, filterYear, records],
  );

  const selectedMonth = monthLabel(filterYear, filterMonth);

  function stepMonth(direction: 1 | -1) {
    const nextMonth = filterMonth + direction;
    if (nextMonth < 0) {
      setFilterYear((year) => year - 1);
      setFilterMonth(11);
    } else if (nextMonth > 11) {
      setFilterYear((year) => year + 1);
      setFilterMonth(0);
    } else {
      setFilterMonth(nextMonth);
    }
  }

  async function handleExport() {
    if (monthRecords.length === 0) {
      Alert.alert(
        "Nothing to export",
        `There are no DCT records in ${selectedMonth}.`,
      );
      return;
    }
    setExporting(true);
    try {
      await shareDctCsv(monthRecords, selectedMonth);
    } catch (exportError) {
      console.error("DCT CSV export error:", exportError);
      Alert.alert("Export failed", "Could not generate or share the DCT CSV.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>DCT History</Text>
        <Pressable
          onPress={handleExport}
          disabled={exporting}
          style={[styles.exportButton, exporting && styles.disabledButton]}
          accessibilityRole="button"
          accessibilityLabel="CSV Export"
        >
          {exporting ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="download" size={17} color={colors.primary} />
          )}
          <Text style={styles.exportButtonText}>
            {exporting ? "Exporting…" : "CSV Export"}
          </Text>
        </Pressable>
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
          <Pressable onPress={refresh} style={styles.retryButton}>
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
              {!!error && (
                <View style={styles.offlineBanner}>
                  <Feather name="wifi-off" size={14} color="#92400e" />
                  <Text style={styles.offlineBannerText}>
                    Couldn’t reach the server — showing saved offline records
                    only.
                  </Text>
                </View>
              )}
              <View style={styles.monthNav}>
                <Pressable
                  onPress={() => stepMonth(-1)}
                  style={styles.monthArrow}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Previous month"
                >
                  <Feather
                    name="chevron-left"
                    size={20}
                    color={colors.text}
                  />
                </Pressable>
                <Text style={styles.monthLabel}>{selectedMonth}</Text>
                <Pressable
                  onPress={() => stepMonth(1)}
                  style={styles.monthArrow}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel="Next month"
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
                  {monthRecords.length} record
                  {monthRecords.length !== 1 ? "s" : ""}
                </Text>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Feather
                name="check-circle"
                size={36}
                color={colors.textTertiary}
              />
              <Text style={styles.emptyTitle}>
                No DCT records in {selectedMonth}
              </Text>
              <Text style={styles.emptySubtitle}>
                {records.length > 0
                  ? "Use the month arrows to navigate to a different month."
                  : "DCT records added on the dashboard will appear here."}
              </Text>
            </View>
          }
          renderItem={({ item }) => <DctCard record={item} />}
        />
      )}
    </View>
  );
}

function DctCard({ record }: { record: DctRecord }) {
  const milkWithdrawal =
    record.doubledMilkWithdrawalDays ??
    record.standardMilkWithdrawalDays ??
    record.antibioticTubeWithdrawalMilkDays;
  const justification =
    record.therapeuticJustification ?? record.treatmentJustification;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>
            {formatDate(record.dryOffDate)}
          </Text>
        </View>
        {record._offline && (
          <View style={styles.offlineBadge}>
            <Text style={styles.offlineText}>Pending sync</Text>
          </View>
        )}
        {record.vetAuthorisation && (
          <View style={styles.vetBadge}>
            <Text style={styles.vetText}>Vet auth</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardTitle}>{record.cowEarTag || "Unknown cow"}</Text>
      {record.protocol && (
        <Text style={styles.cardSub}>
          Protocol: {record.protocol.replace(/-/g, " ")}
        </Text>
      )}
      {record.antibioticTubeProduct && (
        <Text style={styles.cardSub}>
          Antibiotic: {record.antibioticTubeProduct}
        </Text>
      )}
      {record.teatSealantProduct && (
        <Text style={styles.cardSub}>
          Teat sealant: {record.teatSealantProduct}
        </Text>
      )}
      {milkWithdrawal != null && (
        <Text style={styles.cardSub}>
          Milk withdrawal: {milkWithdrawal} days
        </Text>
      )}
      {record.expectedCalvingDate && (
        <Text style={styles.cardSub}>
          Expected calving: {formatDate(record.expectedCalvingDate)}
        </Text>
      )}
      {justification && (
        <Text style={styles.cardNote} numberOfLines={2}>
          {justification}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  exportButton: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
  },
  exportButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  disabledButton: { opacity: 0.5 },
  centre: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  listContent: { padding: spacing.lg },
  listEmpty: { padding: spacing.lg, flexGrow: 1 },
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
  monthArrow: { padding: spacing.xs },
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
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dateBadge: {
    backgroundColor: "#cffafe",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  dateBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#0e7490",
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
  vetBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  vetText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#15803d",
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
  retryButton: {
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
});