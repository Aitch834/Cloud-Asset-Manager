import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Platform } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
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

import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { kvGet } from "@/lib/database";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  const d = new Date(val);
  if (isNaN(d.getTime())) return val;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  return Math.ceil((target.getTime() - Date.now()) / 86400000);
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    let token: string | null = null;
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      token = await SecureStore.getItemAsync("auth_session_token");
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

interface Certification {
  certifier: string | null;
  certificateNumber: string | null;
  status: string | null;
  renewalDate: string | null;
  operatorNumber: string | null;
}

interface Inspection {
  id: number;
  certifier: string;
  inspectionDate: string;
  outcome: string;
  nextDueDate: string | null;
  certificateReference: string | null;
}

const OUTCOME_COLORS: Record<string, string> = {
  Pass: colors.success,
  "Conditional Pass": "#d97706",
  "Non-Conformance Identified": colors.error,
  "Certificate Suspended": "#7c3aed",
};

const STATUS_COLORS: Record<string, string> = {
  certified: colors.success,
  "in-conversion": "#d97706",
  suspended: colors.error,
  withdrawn: colors.textSecondary,
};

export default function OrganicOverviewScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id;

  const [certification, setCertification] = useState<Certification | null>(null);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const apiBase = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";

  const load = useCallback(async () => {
    if (!farmId || !apiBase) { setLoading(false); return; }
    try {
      const headers = await getAuthHeaders();
      const [certRes, inspRes] = await Promise.all([
        fetch(`${apiBase}/api/farms/${farmId}/organic/certification`, { headers }),
        fetch(`${apiBase}/api/farms/${farmId}/organic/inspections`, { headers }),
      ]);
      if (certRes.ok) {
        const data = await certRes.json();
        setCertification(data.record ?? null);
      }
      if (inspRes.ok) {
        const data = await inspRes.json();
        setInspections((data.records ?? []).slice(0, 5));
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [farmId, apiBase]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  const nextInspection = inspections.find(r => r.nextDueDate);
  const nextDays = nextInspection ? daysUntil(nextInspection.nextDueDate) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Organic Compliance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : (
          <>
            <View style={styles.infoBox}>
              <Feather name="leaf" size={14} color="#16a34a" />
              <Text style={styles.infoText}>
                Complementary evidence records alongside your certifier's portal — Soil Association, OF&G, BDOCA.
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Certification Status</Text>
            {certification ? (
              <View style={styles.card}>
                <View style={styles.certRow}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[certification.status ?? ""] ?? colors.textSecondary }]} />
                  <Text style={styles.certifier}>{certification.certifier ?? "—"}</Text>
                  <Text style={[styles.statusBadge, { color: STATUS_COLORS[certification.status ?? ""] ?? colors.textSecondary }]}>
                    {certification.status ? certification.status.charAt(0).toUpperCase() + certification.status.slice(1) : "Unknown"}
                  </Text>
                </View>
                {certification.certificateNumber ? (
                  <Text style={styles.certDetail}>Certificate: {certification.certificateNumber}</Text>
                ) : null}
                {certification.operatorNumber ? (
                  <Text style={styles.certDetail}>Operator No: {certification.operatorNumber}</Text>
                ) : null}
                {certification.renewalDate ? (
                  <View style={styles.renewalRow}>
                    <Feather name="calendar" size={13} color={colors.textSecondary} />
                    <Text style={styles.certDetail}> Renewal due: {fmtDate(certification.renewalDate)}</Text>
                    {(() => {
                      const d = daysUntil(certification.renewalDate);
                      if (d !== null && d <= 60 && d >= 0)
                        return <Text style={styles.warningBadge}>{d}d</Text>;
                      if (d !== null && d < 0)
                        return <Text style={styles.errorBadge}>Overdue</Text>;
                      return null;
                    })()}
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.emptyText}>No certification details on record.</Text>
                <Text style={styles.emptySubtext}>Add your certification details in the dashboard.</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Next Inspection</Text>
            {nextInspection ? (
              <View style={[styles.card, nextDays !== null && nextDays <= 60 ? styles.warningCard : null]}>
                <View style={styles.certRow}>
                  <Feather name="clock" size={15} color={nextDays !== null && nextDays <= 0 ? colors.error : nextDays !== null && nextDays <= 60 ? "#d97706" : colors.textSecondary} />
                  <Text style={styles.inspDate}>{fmtDate(nextInspection.nextDueDate)}</Text>
                  {nextDays !== null && nextDays <= 60 && nextDays >= 0 && <Text style={styles.warningBadge}>{nextDays}d</Text>}
                  {nextDays !== null && nextDays < 0 && <Text style={styles.errorBadge}>Overdue</Text>}
                </View>
                <Text style={styles.certDetail}>Last inspected: {fmtDate(nextInspection.inspectionDate)} — {nextInspection.certifier}</Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.emptyText}>No inspection dates recorded.</Text>
              </View>
            )}

            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionRow}>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }]}
                onPress={() => router.push("/organic-inspection")}
              >
                <Feather name="shield" size={22} color="#16a34a" />
                <Text style={[styles.actionLabel, { color: "#16a34a" }]}>Record Inspection</Text>
                <Text style={styles.actionSub}>Log a certifier inspection visit</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}
                onPress={() => router.push("/organic-input")}
              >
                <Feather name="package" size={22} color="#2563eb" />
                <Text style={[styles.actionLabel, { color: "#2563eb" }]}>Log Organic Input</Text>
                <Text style={styles.actionSub}>Add to input register</Text>
              </Pressable>
            </View>

            {inspections.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Recent Inspections</Text>
                <View style={styles.card}>
                  {inspections.map((r, i) => {
                    const outcomeColor = OUTCOME_COLORS[r.outcome] ?? colors.textSecondary;
                    return (
                      <View key={r.id}>
                        {i > 0 && <View style={styles.divider} />}
                        <View style={styles.inspRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.inspTitle}>{fmtDate(r.inspectionDate)} — {r.certifier}</Text>
                            <Text style={[styles.inspOutcome, { color: outcomeColor }]}>{r.outcome}</Text>
                            {r.certificateReference ? <Text style={styles.certDetail}>Ref: {r.certificateReference}</Text> : null}
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

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
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#f0fdf4",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#15803d", flex: 1 },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
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
  warningCard: { borderWidth: 1, borderColor: "#fde68a" },
  certRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  certifier: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, flex: 1 },
  statusBadge: { fontFamily: fonts.medium, fontSize: fontSize.sm },
  certDetail: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  renewalRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.xs },
  warningBadge: {
    fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: "#92400e",
    backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: radius.full, overflow: "hidden", marginLeft: spacing.xs,
  },
  errorBadge: {
    fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: "#991b1b",
    backgroundColor: "#fee2e2", paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: radius.full, overflow: "hidden", marginLeft: spacing.xs,
  },
  inspDate: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  emptyText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", marginBottom: 2 },
  emptySubtext: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, textAlign: "center" },
  actionRow: { flexDirection: "row", gap: spacing.md },
  actionBtn: {
    flex: 1, padding: spacing.md, borderRadius: radius.lg, alignItems: "center",
    borderWidth: 1, gap: spacing.xs,
  },
  actionLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, textAlign: "center" },
  actionSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, textAlign: "center" },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.sm },
  inspRow: { flexDirection: "row", alignItems: "flex-start" },
  inspTitle: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  inspOutcome: { fontFamily: fonts.medium, fontSize: fontSize.xs, marginTop: 2 },
});
