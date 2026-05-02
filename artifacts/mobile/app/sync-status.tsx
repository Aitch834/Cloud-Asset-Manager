import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useSync } from "@/lib/context/SyncContext";

const RECORD_TYPES: { key: string; label: string; icon: string }[] = [
  { key: "spray_applications", label: "Spray Applications", icon: "droplet" },
  { key: "movements", label: "Livestock Movements", icon: "truck" },
  { key: "medicine_records", label: "Medicine Records", icon: "activity" },
  { key: "training_records", label: "Training Records", icon: "book" },
  { key: "nvz_applications", label: "NVZ Applications", icon: "filter" },
  { key: "documents", label: "Documents", icon: "file" },
  { key: "soil_tests", label: "Soil Tests", icon: "layers" },
  { key: "inspections", label: "Inspections", icon: "clipboard" },
];

export default function SyncStatusScreen() {
  const insets = useSafeAreaInsets();
  const { pendingCount, isSyncing, isConnected, lastSyncTime, lastError, triggerSync } = useSync();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await triggerSync();
    setRefreshing(false);
  };

  const fmtTime = (t: number | null) => {
    if (!t) return "Never";
    const d = new Date(t);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  const statusColor = isSyncing
    ? colors.primary
    : pendingCount > 0
    ? colors.accent
    : colors.success;

  const statusLabel = isSyncing
    ? "Syncing…"
    : pendingCount > 0
    ? `${pendingCount} record${pendingCount === 1 ? "" : "s"} pending`
    : "All synced";

  const statusIcon: "refresh-cw" | "clock" | "check-circle" = isSyncing
    ? "refresh-cw"
    : pendingCount > 0
    ? "clock"
    : "check-circle";

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Sync Status</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.syncBtn} disabled={isSyncing}>
          {isSyncing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Feather name="refresh-cw" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Status Banner */}
        <View style={[styles.statusBanner, { borderColor: statusColor + "33", backgroundColor: statusColor + "10" }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
            <Text style={styles.statusSub}>
              Last sync: {fmtTime(lastSyncTime)}
            </Text>
          </View>
          {isSyncing && (
            <ActivityIndicator size="small" color={statusColor} />
          )}
          {!isSyncing && <Feather name={statusIcon} size={20} color={statusColor} />}
        </View>

        {/* Connection Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Feather
                name={isConnected ? "wifi" : "wifi-off"}
                size={18}
                color={isConnected ? colors.success : colors.error}
              />
              <Text style={styles.rowLabel}>
                {isConnected ? "Online — connected to server" : "Offline — records stored locally"}
              </Text>
            </View>
          </View>
        </View>

        {/* Last Error */}
        {lastError && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Error</Text>
            <View style={[styles.card, styles.errorCard]}>
              <View style={styles.row}>
                <Feather name="alert-triangle" size={16} color={colors.error} />
                <Text style={[styles.rowLabel, { color: colors.error }]}>{lastError}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Pending Count */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Queue</Text>
          <View style={styles.card}>
            <View style={styles.pendingRow}>
              <View>
                <Text style={styles.pendingCount}>{pendingCount}</Text>
                <Text style={styles.pendingLabel}>Records pending upload</Text>
              </View>
              {pendingCount === 0 ? (
                <Feather name="check-circle" size={28} color={colors.success} />
              ) : (
                <TouchableOpacity
                  style={styles.syncNowBtn}
                  onPress={triggerSync}
                  disabled={isSyncing || !isConnected}
                >
                  <Text style={styles.syncNowLabel}>
                    {isSyncing ? "Syncing…" : !isConnected ? "Offline" : "Sync Now"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Record Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Record Types Synced</Text>
          <View style={styles.card}>
            {RECORD_TYPES.map((type, i) => (
              <View key={type.key}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.row}>
                  <View style={styles.typeIcon}>
                    <Feather name={type.icon as any} size={14} color={colors.primary} />
                  </View>
                  <Text style={styles.typeLabel}>{type.label}</Text>
                  <Feather name="check" size={14} color={colors.success} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* How Sync Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How Sync Works</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              Records you create in the app are saved immediately to your device — even without internet. When you connect, they automatically sync to your farm's account in the cloud.
            </Text>
            <Text style={[styles.infoText, { marginTop: spacing.sm }]}>
              Pull to refresh on this screen or tap the sync button above to trigger an immediate sync.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backBtn: { padding: spacing.xs, marginRight: spacing.sm },
  title: { flex: 1, fontSize: fontSize.lg, fontFamily: fonts.semiBold, color: colors.text },
  syncBtn: { padding: spacing.xs, width: 36, alignItems: "center" },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: fontSize.md, fontFamily: fonts.semiBold },
  statusSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  section: { marginBottom: spacing.md },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: fonts.semiBold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorCard: {
    backgroundColor: colors.errorBg,
    borderColor: colors.error + "44",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  rowLabel: { flex: 1, fontSize: fontSize.md, color: colors.text, fontFamily: fonts.regular },
  pendingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  pendingCount: {
    fontSize: 36,
    fontFamily: fonts.semiBold,
    color: colors.text,
    lineHeight: 40,
  },
  pendingLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontFamily: fonts.regular },
  syncNowBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  syncNowLabel: { color: "#fff", fontFamily: fonts.semiBold, fontSize: fontSize.sm },
  typeIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: colors.primaryBg ?? colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  typeLabel: { flex: 1, fontSize: fontSize.md, color: colors.text, fontFamily: fonts.regular },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 2 },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  infoText: { fontSize: fontSize.sm, color: colors.textSecondary, fontFamily: fonts.regular, lineHeight: 20 },
});
