import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { kvGet } from "@/lib/database";
import { getMobileAuthToken as getCurrentAuthToken } from "@/lib/authToken";

async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) { const f = JSON.parse(raw); return f.tenantSlug || f.slug || ""; }
  } catch { }
  return "";
}

interface DispatchPlan {
  id: number;
  planRef: string;
  title: string;
  loadType: string;
  commodity: string | null;
  sourceLocation: string | null;
  destination: string | null;
  haulierName: string | null;
  plannedDate: string;
  plannedDateEnd: string | null;
  estimatedLoads: number | null;
  estimatedTonnes: string | null;
  status: "draft" | "confirmed" | "in_progress" | "complete" | "cancelled";
  notes: string | null;
  haulierNotifiedAt: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#6b7280", bg: "#f3f4f6" },
  confirmed: { label: "Confirmed", color: "#1d4ed8", bg: "#dbeafe" },
  in_progress: { label: "In Progress", color: "#d97706", bg: "#fef3c7" },
  complete: { label: "Complete", color: "#16a34a", bg: "#dcfce7" },
  cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2" },
};

function formatDate(d: string): string {
  try {
    const dt = new Date(d);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (dt.toDateString() === today.toDateString()) return "Today";
    if (dt.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return dt.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  } catch { return d; }
}

function isToday(d: string): boolean {
  try {
    return new Date(d).toDateString() === new Date().toDateString();
  } catch { return false; }
}

function isPast(d: string): boolean {
  try {
    const dt = new Date(d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dt < today;
  } catch { return false; }
}

export default function DispatchPlansScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const [plans, setPlans] = useState<DispatchPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchPlans = useCallback(async () => {
    const farmId = currentFarm?.id;
    if (!farmId) return;
    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) return;
    try {
      const [token, slug] = await Promise.all([getCurrentAuthToken(), getTenantSlug()]);
      if (!slug) return;
      const headers: Record<string, string> = { "Content-Type": "application/json", "x-tenant-slug": slug };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/dispatch-plans`, { headers });
      if (!res.ok) return;
      const json = await res.json() as { records?: DispatchPlan[] };
      setPlans(json.records ?? []);
    } catch { }
  }, [currentFarm?.id]);

  useEffect(() => {
    setLoading(true);
    fetchPlans().finally(() => setLoading(false));
  }, [fetchPlans]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPlans();
    setRefreshing(false);
  };

  const updateStatus = async (plan: DispatchPlan, newStatus: string) => {
    const farmId = currentFarm?.id;
    if (!farmId) return;
    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) return;
    setUpdatingId(plan.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const [token, slug] = await Promise.all([getCurrentAuthToken(), getTenantSlug()]);
      const headers: Record<string, string> = { "Content-Type": "application/json", "x-tenant-slug": slug };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`https://${apiDomain}/api/farms/${farmId}/dispatch-plans/${plan.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ ...plan, status: newStatus }),
      });
      if (res.ok) {
        setPlans((prev) => prev.map((p) => p.id === plan.id ? { ...p, status: newStatus as DispatchPlan["status"] } : p));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert("Error", "Could not update plan status. Please try again.");
      }
    } catch {
      Alert.alert("Error", "No connection. Please check your internet.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmStatusUpdate = (plan: DispatchPlan, newStatus: string, label: string) => {
    Alert.alert(
      `${label}?`,
      `Mark "${plan.title || plan.planRef}" as ${label.toLowerCase()}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: label, onPress: () => updateStatus(plan, newStatus) },
      ]
    );
  };

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const activePlans = plans.filter((p) => p.status === "in_progress");
  const todayPlans = plans.filter((p) => p.status !== "in_progress" && p.status !== "complete" && p.status !== "cancelled" && isToday(p.plannedDate));
  const upcomingPlans = plans.filter((p) => p.status === "confirmed" && !isToday(p.plannedDate) && !isPast(p.plannedDate));
  const pastPlans = plans.filter((p) => (p.status === "complete" || p.status === "cancelled") || (isPast(p.plannedDate) && p.status !== "in_progress"));

  const renderPlanCard = (plan: DispatchPlan) => {
    const cfg = STATUS_CONFIG[plan.status] ?? STATUS_CONFIG.draft;
    const isUpdating = updatingId === plan.id;

    return (
      <View key={plan.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: "#f3f4f6" }]}>
              <Text style={[styles.badgeText, { color: "#374151" }]}>{plan.planRef}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
              <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
            {plan.haulierNotifiedAt && (
              <View style={[styles.badge, { backgroundColor: "#f0fdf4" }]}>
                <Feather name="bell" size={10} color="#16a34a" />
                <Text style={[styles.badgeText, { color: "#16a34a", marginLeft: 3 }]}>Notified</Text>
              </View>
            )}
          </View>
          <Text style={styles.planDate}>{formatDate(plan.plannedDate)}</Text>
        </View>

        {plan.title ? <Text style={styles.planTitle}>{plan.title}</Text> : null}

        <View style={styles.planDetails}>
          {plan.commodity ? (
            <View style={styles.detailRow}>
              <Feather name="package" size={13} color={colors.textSecondary} />
              <Text style={styles.detailText}>{plan.commodity}</Text>
            </View>
          ) : null}
          {(plan.haulierName || plan.destination) ? (
            <View style={styles.detailRow}>
              <Feather name="truck" size={13} color={colors.textSecondary} />
              <Text style={styles.detailText} numberOfLines={1}>
                {[plan.haulierName, plan.destination].filter(Boolean).join(" → ")}
              </Text>
            </View>
          ) : null}
          {plan.sourceLocation ? (
            <View style={styles.detailRow}>
              <Feather name="database" size={13} color={colors.textSecondary} />
              <Text style={styles.detailText}>{plan.sourceLocation}</Text>
            </View>
          ) : null}
          {plan.estimatedLoads ? (
            <View style={styles.detailRow}>
              <Feather name="layers" size={13} color={colors.textSecondary} />
              <Text style={styles.detailText}>
                {plan.estimatedLoads} load{plan.estimatedLoads !== 1 ? "s" : ""} planned
                {plan.estimatedTonnes ? ` · ${parseFloat(plan.estimatedTonnes).toFixed(0)}t` : ""}
              </Text>
            </View>
          ) : null}
        </View>

        {isUpdating ? (
          <View style={styles.actionRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.updatingText}>Updating…</Text>
          </View>
        ) : (
          <View style={styles.actionRow}>
            {plan.status === "confirmed" || plan.status === "draft" ? (
              <Pressable
                style={[styles.actionBtn, { backgroundColor: "#fef3c7", borderColor: "#f59e0b" }]}
                onPress={() => confirmStatusUpdate(plan, "in_progress", "Start Moving")}
              >
                <Feather name="play" size={13} color="#d97706" />
                <Text style={[styles.actionBtnText, { color: "#d97706" }]}>Start Moving</Text>
              </Pressable>
            ) : null}
            {plan.status === "in_progress" ? (
              <Pressable
                style={[styles.actionBtn, { backgroundColor: "#dcfce7", borderColor: "#86efac" }]}
                onPress={() => confirmStatusUpdate(plan, "complete", "Mark Complete")}
              >
                <Feather name="check-circle" size={13} color="#16a34a" />
                <Text style={[styles.actionBtnText, { color: "#16a34a" }]}>Mark Complete</Text>
              </Pressable>
            ) : null}
            {plan.status !== "complete" && plan.status !== "cancelled" ? (
              <Pressable
                style={[styles.actionBtn, { backgroundColor: "#e0f2fe", borderColor: "#7dd3fc" }]}
                onPress={() => router.push({
                  pathname: "/haulage-confirm",
                  params: {
                    planId: String(plan.id),
                    planRef: plan.planRef,
                    planCommodity: plan.commodity ?? "",
                    planDestination: plan.destination ?? "",
                    planHaulierName: plan.haulierName ?? "",
                    planSourceLocation: plan.sourceLocation ?? "",
                  },
                })}
              >
                <Feather name="plus-circle" size={13} color="#0284c7" />
                <Text style={[styles.actionBtnText, { color: "#0284c7" }]}>Log a Load</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </View>
    );
  };

  const renderSection = (title: string, icon: string, data: DispatchPlan[], accent: string) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Feather name={icon as any} size={14} color={accent} />
          <Text style={[styles.sectionTitle, { color: accent }]}>{title}</Text>
          <View style={[styles.countBadge, { backgroundColor: accent + "20" }]}>
            <Text style={[styles.countText, { color: accent }]}>{data.length}</Text>
          </View>
        </View>
        {data.map(renderPlanCard)}
      </View>
    );
  };

  const hasPlans = plans.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Dispatch Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading plans…</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        >
          {!hasPlans ? (
            <View style={styles.emptyState}>
              <Feather name="calendar" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>No Dispatch Plans</Text>
              <Text style={styles.emptyBody}>
                Create dispatch plans on the web dashboard under Haulage & Transport → Dispatch Plans to organise your crop movements.
              </Text>
            </View>
          ) : (
            <>
              {renderSection("Active — In Progress", "activity", activePlans, "#d97706")}
              {renderSection("Today", "sun", todayPlans, "#1d4ed8")}
              {renderSection("Upcoming", "calendar", upcomingPlans, "#059669")}
              {pastPlans.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Feather name="clock" size={14} color={colors.textSecondary} />
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Recent</Text>
                  </View>
                  {pastPlans.slice(0, 5).map(renderPlanCard)}
                </View>
              )}
            </>
          )}
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
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
    flex: 1,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: fonts.semiBold,
    fontSize: 10,
  },
  planDate: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  planTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  planDetails: {
    gap: 4,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  detailText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.xs,
    flexWrap: "wrap",
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    alignItems: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  actionBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
  },
  updatingText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginTop: spacing.sm,
  },
  emptyBody: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
