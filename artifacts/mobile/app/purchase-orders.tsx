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
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useApiPurchaseOrders } from "@/lib/hooks/useApiPurchaseOrders";

type StatusTab = "all" | "outstanding" | "awaiting_approval" | "sent" | "draft" | "partially_received" | "fully_received";

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "outstanding", label: "Outstanding" },
  { key: "awaiting_approval", label: "Awaiting Approval" },
  { key: "sent", label: "Sent" },
  { key: "draft", label: "Draft" },
  { key: "partially_received", label: "Part. Received" },
  { key: "fully_received", label: "Received" },
];

function statusColor(status: string): string {
  switch (status) {
    case "awaiting_approval": return "#d97706";
    case "outstanding": return "#2563eb";
    case "sent": return "#0891b2";
    case "partially_received": return "#7c3aed";
    case "fully_received": return "#16a34a";
    case "draft": return "#6b7280";
    default: return "#6b7280";
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case "awaiting_approval": return "Awaiting Approval";
    case "outstanding": return "Outstanding";
    case "sent": return "Sent";
    case "partially_received": return "Partially Received";
    case "fully_received": return "Fully Received";
    case "draft": return "Draft";
    default: return status;
  }
}

function formatCurrency(pence: number | null): string {
  if (pence == null || pence === 0) return "";
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PurchaseOrdersScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [refreshing, setRefreshing] = useState(false);

  const { data, counts, loading, error, reload } = useApiPurchaseOrders(currentFarm?.id, activeTab);

  const pendingApproval = counts?.awaiting_approval ?? 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Purchase Orders</Text>
        <Pressable onPress={() => router.push("/raise-purchase-order")} style={styles.addButton}>
          <Feather name="plus" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {pendingApproval > 0 && activeTab !== "awaiting_approval" && (
        <Pressable style={styles.approvalBanner} onPress={() => setActiveTab("awaiting_approval")}>
          <Feather name="clock" size={15} color="#92400e" />
          <Text style={styles.approvalBannerText}>
            {pendingApproval} order{pendingApproval === 1 ? "" : "s"} awaiting approval
          </Text>
          <Text style={styles.approvalBannerLink}>Review →</Text>
        </Pressable>
      )}

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={STATUS_TABS}
        keyExtractor={(t) => t.key}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabBar}
        renderItem={({ item: tab }) => {
          const count = counts ? (tab.key === "all" ? counts.all : counts[tab.key as keyof typeof counts]) : null;
          return (
            <Pressable
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            >
              <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                {tab.label}{count != null && count > 0 ? ` (${count})` : ""}
              </Text>
            </Pressable>
          );
        }}
      />

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="alert-circle" size={32} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={reload} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Feather name="shopping-cart" size={40} color={colors.borderLight} />
              <Text style={styles.emptyText}>No purchase orders</Text>
              <Text style={styles.emptySubText}>Tap + to raise a new order</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.poNumber}>{item.poNumber || `PO #${item.id}`}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(item.status) + "18" }]}>
                  <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                    {statusLabel(item.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.supplierName}>{item.supplierName || "No supplier specified"}</Text>

              <View style={styles.metaRow}>
                {item.submittedByName ? (
                  <View style={styles.metaItem}>
                    <Feather name="user" size={11} color={colors.textTertiary} />
                    <Text style={styles.metaText}>{item.submittedByName}</Text>
                  </View>
                ) : null}
                {item.totalPence != null && item.totalPence > 0 ? (
                  <View style={styles.metaItem}>
                    <Feather name="tag" size={11} color={colors.textTertiary} />
                    <Text style={styles.metaText}>{formatCurrency(item.totalPence)}</Text>
                  </View>
                ) : null}
                {item.expectedDeliveryDate ? (
                  <View style={styles.metaItem}>
                    <Feather name="calendar" size={11} color={colors.textTertiary} />
                    <Text style={styles.metaText}>
                      {new Date(item.expectedDeliveryDate).toLocaleDateString("en-GB")}
                    </Text>
                  </View>
                ) : null}
                {item.lineCount > 0 ? (
                  <View style={styles.metaItem}>
                    <Feather name="list" size={11} color={colors.textTertiary} />
                    <Text style={styles.metaText}>{item.lineCount} line{item.lineCount === 1 ? "" : "s"}</Text>
                  </View>
                ) : null}
              </View>

              {item.status === "awaiting_approval" && (
                <View style={styles.approvalNote}>
                  <Feather name="clock" size={11} color="#92400e" />
                  <Text style={styles.approvalNoteText}>Awaiting manager approval before this order can be sent</Text>
                </View>
              )}
            </View>
          )}
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
  },
  backButton: { padding: spacing.xs },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.sm,
  },
  addButton: { padding: spacing.xs },
  approvalBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  approvalBannerText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: "#78350f",
    flex: 1,
  },
  approvalBannerLink: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#92400e",
  },
  tabScroll: { flexGrow: 0, marginBottom: spacing.sm },
  tabBar: { paddingHorizontal: spacing.lg, gap: spacing.xs },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
  },
  tabActive: { backgroundColor: colors.primary },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  tabLabelActive: { color: colors.textInverse },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  poNumber: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
  },
  supplierName: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  approvalNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: spacing.sm,
    backgroundColor: "#fef3c7",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  approvalNoteText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#92400e",
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  emptySubText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.error,
    textAlign: "center",
    marginHorizontal: spacing.lg,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  retryText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textInverse,
  },
});
