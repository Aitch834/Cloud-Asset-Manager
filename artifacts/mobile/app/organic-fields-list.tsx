import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Platform } from "react-native";
import React, { useCallback, useState } from "react";
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
import { certificationNotice, type CertificationNotice } from "@/lib/organicFieldCertification";
import {
  buildOrganicFieldStatusCsv,
  buildOrganicFieldStatusCsvFilename,
  shareOrganicFieldStatusCsv,
  type OrganicFieldStatusCsvRecord,
} from "@/lib/organicFieldStatusCsv";

function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    let token: string | null = null;
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      token = await SecureStore.getItemAsync("auth_session_token");
    } else {
      try { token = localStorage.getItem("auth_session_token"); } catch { token = null; }
    }
    if (!token) {
      const raw = await kvGet("bde_auth_token");
      token = raw ? JSON.parse(raw) : null;
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const farmRaw = await kvGet("bde_current_farm");
    if (farmRaw) {
      const farm = JSON.parse(farmRaw);
      headers["x-tenant-slug"] = farm.tenantSlug || farm.slug || "";
    }
  } catch {}
  return headers;
}

interface FieldStatus extends OrganicFieldStatusCsvRecord {
  id: number;
}

function fmtDateValue(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const STATUS_LABELS: Record<string, string> = {
  certified: "Certified Organic",
  "in-conversion": "In Conversion",
  conventional: "Conventional",
};

const STATUS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  certified:      { text: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  "in-conversion":{ text: "#92400e", bg: "#fffbeb", border: "#fde68a" },
  conventional:   { text: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" },
};
async function downloadCsv(records: FieldStatus[], farmName: string) {
  const filename = buildOrganicFieldStatusCsvFilename(farmName);
  const csvContent = buildOrganicFieldStatusCsv(records);

  if (Platform.OS === "web") {
    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      Alert.alert("Export failed", "Could not generate the CSV file.");
    }
    return;
  }

  try {
    await shareOrganicFieldStatusCsv(records, farmName);
  } catch {
    Alert.alert("Export failed", "Could not generate or share the CSV file.");
  }
}

export default function OrganicFieldsListScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id;
  const farmName = currentFarm?.name ?? "farm";

  const [records, setRecords] = useState<FieldStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);

  const apiBase = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";

  const load = useCallback(async () => {
    if (!farmId || !apiBase) { setLoading(false); return; }
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${apiBase}/api/farms/${farmId}/organic/fields`, { headers });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records ?? []);
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [farmId, apiBase]);

  useFocusEffect(useCallback(() => { setLoading(true); load(); }, [load]));

  const onRefresh = () => { setRefreshing(true); load(); };

  async function handleExport() {
    if (records.length === 0) {
      Alert.alert("Nothing to export", "There are no field status records to download.");
      return;
    }
    setExporting(true);
    try {
      await downloadCsv(records, farmName);
    } finally {
      setExporting(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Field Status Register</Text>
          <Text style={styles.subtitle}>Organic field conversion records</Text>
        </View>
        <Pressable
          style={[styles.exportBtn, exporting && { opacity: 0.5 }]}
          onPress={handleExport}
          disabled={exporting}
          accessibilityRole="button"
          accessibilityLabel="Download CSV"
        >
          {exporting
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Feather name="download" size={18} color={colors.primary} />}
          <Text style={styles.exportLabel}>{exporting ? "Exporting…" : "CSV"}</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : records.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="map" size={40} color={colors.textTertiary} style={{ marginBottom: spacing.md }} />
            <Text style={styles.emptyTitle}>No field status records</Text>
            <Text style={styles.emptyText}>
              Add organic field status records from the dashboard's Organic → Fields tab.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.countLabel}>{records.length} field{records.length !== 1 ? "s" : ""}</Text>
            {records.map((r, i) => {
              const sc = STATUS_COLORS[r.status] ?? STATUS_COLORS.conventional;
              const notice = certificationNotice(r.conversionStartDate, r.status);
              return (
                <View
                  key={r.id}
                  style={[styles.card, i > 0 && { marginTop: spacing.sm }]}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.fieldName}>{r.fieldName}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
                      <Text style={[styles.statusText, { color: sc.text }]}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </Text>
                    </View>
                  </View>

                  {notice ? (
                    <View
                      style={[
                        styles.certificationNotice,
                        notice.kind === "eligible" ? styles.eligibleNotice : styles.dueSoonNotice,
                      ]}
                    >
                      <Feather
                        name={notice.kind === "eligible" ? "check-circle" : "calendar"}
                        size={15}
                        color={notice.kind === "eligible" ? "#15803d" : "#92400e"}
                      />
                      <View style={styles.certificationNoticeCopy}>
                        <Text
                          style={[
                            styles.certificationNoticeTitle,
                            { color: notice.kind === "eligible" ? "#15803d" : "#92400e" },
                          ]}
                        >
                          {notice.kind === "eligible" ? "Eligible now" : "Cert. due soon"}
                        </Text>
                        <Text
                          style={[
                            styles.certificationNoticeDate,
                            { color: notice.kind === "eligible" ? "#166534" : "#92400e" },
                          ]}
                        >
                          {notice.kind === "eligible"
                            ? `Two-year conversion complete ${fmtDateValue(notice.date)}`
                            : `Expected ${fmtDateValue(notice.date)}`}
                        </Text>
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Conversion Start</Text>
                      <Text style={styles.detailValue}>{fmtDate(r.conversionStartDate)}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Certified From</Text>
                      <Text style={styles.detailValue}>{fmtDate(r.certificationDate)}</Text>
                    </View>
                    {r.certifierRef ? (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Certifier Ref</Text>
                        <Text style={styles.detailValue}>{r.certifierRef}</Text>
                      </View>
                    ) : null}
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Parallel Production</Text>
                      <Text style={[styles.detailValue, r.parallelProduction ? { color: "#d97706" } : null]}>
                        {r.parallelProduction ? "Yes" : "No"}
                      </Text>
                    </View>
                  </View>

                  {r.notes ? (
                    <View style={styles.notesRow}>
                      <Feather name="file-text" size={12} color={colors.textSecondary} />
                      <Text style={styles.notesText}>{r.notes}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
            <View style={{ height: 120 }} />
          </>
        )}
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "#eff6ff",
  },
  exportLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.primary },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  countLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: "center",
    marginTop: spacing.xxl,
  },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.xs },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  fieldName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, flex: 1 },
  statusBadge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    flexShrink: 0,
  },
  statusText: { fontFamily: fonts.semiBold, fontSize: fontSize.xs },
  certificationNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  dueSoonNotice: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  eligibleNotice: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  certificationNoticeCopy: { flex: 1, gap: 2 },
  certificationNoticeTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm },
  certificationNoticeDate: { fontFamily: fonts.regular, fontSize: fontSize.xs },
  detailGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, rowGap: spacing.sm },
  detailItem: { minWidth: "45%", flex: 1 },
  detailLabel: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginBottom: 2 },
  detailValue: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  notesRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  notesText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
});
