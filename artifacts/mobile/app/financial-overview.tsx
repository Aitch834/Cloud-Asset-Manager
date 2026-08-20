import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
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
import { useFocusEffect } from "expo-router";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { apiFetch } from "@/lib/apiFetch";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

const ENTERPRISE_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#f97316",
];

interface Transaction {
  transactionDate: string | null;
  transactionType: "income" | "expense";
  amountPence: number;
  enterprise: string | null;
}

interface EnterpriseSplit {
  name: string;
  income: number;
  expense: number;
}

function fmt(pence: number): string {
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function FinancialOverviewScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();

  const [year, setYear] = useState(CURRENT_YEAR);
  const [records, setRecords] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (silent = false) => {
      if (!currentFarm?.id) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(`/api/farms/${currentFarm.id}/financial-transactions`);
        if (!res.ok) throw new Error(`Server error (${res.status})`);
        const data = await res.json();
        setRecords(data.records ?? []);
      } catch (e: any) {
        setError(e.message ?? "Failed to load");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [currentFarm?.id],
  );

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  // Filter to selected year
  const yearRecords = records.filter((r) => {
    if (!r.transactionDate) return false;
    return new Date(r.transactionDate).getFullYear() === year;
  });

  const totalIncome = yearRecords
    .filter((r) => r.transactionType === "income")
    .reduce((s, r) => s + (r.amountPence ?? 0), 0);

  const totalExpense = yearRecords
    .filter((r) => r.transactionType === "expense")
    .reduce((s, r) => s + (r.amountPence ?? 0), 0);

  const net = totalIncome - totalExpense;

  // Per-enterprise breakdown
  const splitMap: Record<string, { income: number; expense: number }> = {};
  for (const r of yearRecords) {
    const key = r.enterprise || "Untagged";
    if (!splitMap[key]) splitMap[key] = { income: 0, expense: 0 };
    if (r.transactionType === "income") splitMap[key].income += r.amountPence ?? 0;
    else splitMap[key].expense += r.amountPence ?? 0;
  }
  const enterpriseSplit: EnterpriseSplit[] = Object.entries(splitMap)
    .filter(([, v]) => v.income > 0 || v.expense > 0)
    .sort((a, b) => b[1].income + b[1].expense - (a[1].income + a[1].expense))
    .map(([name, { income, expense }]) => ({ name, income, expense }));

  const showSplit = enterpriseSplit.length >= 2;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Financial Overview</Text>
          {currentFarm && (
            <Text style={styles.subtitle}>{currentFarm.name}</Text>
          )}
        </View>
      </View>

      {/* Year picker */}
      <View style={styles.yearRow}>
        <Pressable
          style={styles.yearArrow}
          onPress={() => setYear((y) => Math.min(y + 1, CURRENT_YEAR))}
          disabled={year >= CURRENT_YEAR}
        >
          <Feather
            name="chevron-left"
            size={20}
            color={year >= CURRENT_YEAR ? colors.textTertiary : colors.text}
          />
        </Pressable>
        <Text style={styles.yearLabel}>{year}</Text>
        <Pressable
          style={styles.yearArrow}
          onPress={() => setYear((y) => Math.max(y - 1, YEARS[YEARS.length - 1]))}
          disabled={year <= YEARS[YEARS.length - 1]}
        >
          <Feather
            name="chevron-right"
            size={20}
            color={year <= YEARS[YEARS.length - 1] ? colors.textTertiary : colors.text}
          />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centred}>
          <Feather name="alert-circle" size={32} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => load()}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {/* Summary cards */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summaryCardIncome]}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>
                {fmt(totalIncome)}
              </Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardExpense]}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {fmt(totalExpense)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.netCard,
              { borderColor: net >= 0 ? "#bbf7d0" : "#fecaca" },
            ]}
          >
            <Text style={styles.summaryLabel}>Net Balance</Text>
            <Text
              style={[
                styles.netValue,
                { color: net >= 0 ? colors.success : colors.error },
              ]}
            >
              {net < 0 ? "−" : ""}
              {fmt(Math.abs(net))}
              {net < 0 ? "  deficit" : ""}
            </Text>
          </View>

          {yearRecords.length === 0 && (
            <View style={styles.emptyCard}>
              <Feather name="inbox" size={28} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No transactions in {year}</Text>
            </View>
          )}

          {/* Enterprise split */}
          {showSplit && (
            <View style={styles.splitCard}>
              <View style={styles.splitHeader}>
                <Feather name="bar-chart-2" size={14} color={colors.textSecondary} />
                <Text style={styles.splitTitle}>
                  Income &amp; Expenses by Enterprise
                </Text>
              </View>

              {/* Column headings */}
              <View style={[styles.splitRow, styles.splitHeadingRow]}>
                <Text style={[styles.splitCol, styles.splitHeading]}>Enterprise</Text>
                <Text style={[styles.splitNumCol, styles.splitHeading]}>Income</Text>
                <Text style={[styles.splitNumCol, styles.splitHeading]}>Expenses</Text>
                <Text style={[styles.splitNumCol, styles.splitHeading]}>Net</Text>
              </View>

              {enterpriseSplit.map(({ name, income, expense }, i) => {
                const rowNet = income - expense;
                return (
                  <View
                    key={name}
                    style={[
                      styles.splitRow,
                      i < enterpriseSplit.length - 1 && styles.splitRowBorder,
                    ]}
                  >
                    <View style={styles.splitCol}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: ENTERPRISE_COLORS[i % ENTERPRISE_COLORS.length] },
                        ]}
                      />
                      <Text style={styles.enterpriseName} numberOfLines={1}>
                        {name}
                      </Text>
                    </View>
                    <Text style={[styles.splitNumCol, styles.incomeText]}>
                      {fmt(income)}
                    </Text>
                    <Text style={[styles.splitNumCol, styles.expenseText]}>
                      {fmt(expense)}
                    </Text>
                    <Text
                      style={[
                        styles.splitNumCol,
                        styles.netText,
                        { color: rowNet >= 0 ? colors.success : colors.error },
                      ]}
                    >
                      {rowNet < 0 ? "−" : ""}
                      {fmt(Math.abs(rowNet))}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  yearRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xl,
    paddingBottom: spacing.lg,
  },
  yearArrow: {
    padding: spacing.sm,
  },
  yearLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xl,
    color: colors.text,
    minWidth: 56,
    textAlign: "center",
  },
  centred: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xxxl,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.error,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
  },
  retryText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textInverse,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryCardIncome: {},
  summaryCardExpense: {},
  summaryLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.lg,
  },
  netCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  netValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxxl,
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  // Enterprise split card
  splitCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  splitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  splitTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  splitHeadingRow: {
    backgroundColor: colors.borderLight,
    paddingVertical: spacing.sm,
  },
  splitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  splitRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  splitHeading: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  splitCol: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  splitNumCol: {
    flex: 1,
    textAlign: "right",
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    flexShrink: 0,
  },
  enterpriseName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  incomeText: {
    color: colors.success,
    fontFamily: fonts.medium,
  },
  expenseText: {
    color: colors.text,
  },
  netText: {
    fontFamily: fonts.semiBold,
  },
});
