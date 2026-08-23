import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Platform } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { useApiModules } from "@/lib/hooks/useApiModules";
import { isResponseCurrentForFarm } from "@/lib/utils/farmRequestGuard";

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

type DerogationStatus = "pending" | "approved" | "refused" | "expired" | "withdrawn";

interface VitDerogCase {
  id: number;
  inputName: string;
  inputType: string;
  certifier: string | null;
  certifierRef: string | null;
  applicationDate: string | null;
  internalDecisionDate: string | null;
  decisionDate: string | null;
  expiryDate: string | null;
  status: DerogationStatus;
  availabilitySearchDate: string | null;
  availabilitySearchRef: string | null;
  approvalConditions: string | null;
  justification: string | null;
  vintageYear: number | null;
  regulatoryBasis: string | null;
  rejectionReason: string | null;
  rejectionRef: string | null;
  correctiveAction: string | null;
}

const STATUS_CONFIG: Record<DerogationStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:   { label: "Pending",   color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  approved:  { label: "Approved",  color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  refused:   { label: "Refused",   color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  expired:   { label: "Expired",   color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" },
  withdrawn: { label: "Withdrawn", color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" },
};

export default function OrganicVitDerogationsScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id;

  const { activeModuleKeys, loading: modulesLoading, resolvedFarmId } = useApiModules(farmId);
  // Require resolvedFarmId to match so we never act on stale module state from a previous farm.
  const isOrganicVitModuleActive =
    resolvedFarmId === farmId && activeModuleKeys.includes("organic-viticulture");

  const [cases, setCases] = useState<VitDerogCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  // Track whether module loading has been attempted at all for the current farm.
  // This lets us distinguish "modules not yet started" (keep spinner) from
  // "modules attempted and failed" (resolvedFarmId stayed unset — show empty rather
  // than spinning forever).
  const [modulesAttempted, setModulesAttempted] = useState(false);
  useEffect(() => {
    if (modulesLoading) setModulesAttempted(true);
  }, [modulesLoading]);

  // Clear stale data from the previous farm immediately on farm switch so old
  // cases are never rendered while the new farm's module state resolves.
  useEffect(() => {
    setModulesAttempted(false);
    setCases([]);
    setExpanded(null);
  }, [farmId]);

  const apiBase = process.env.EXPO_PUBLIC_DOMAIN ? `https://${process.env.EXPO_PUBLIC_DOMAIN}` : "";

  // Keep a ref that is always current with the active farmId so in-flight fetches
  // initiated for a previous farm can detect the switch and discard their response
  // rather than writing stale data into state.
  const activeFarmIdRef = useRef(farmId);
  activeFarmIdRef.current = farmId;

  const load = useCallback(async () => {
    if (!farmId || !apiBase) { setLoading(false); return; }
    // Keep the spinner while modules are actively being fetched for this farm.
    if (modulesLoading) { return; }
    // Module resolution finished but resolvedFarmId never matched (network/auth
    // failure) — stop spinning and show the empty state so the user isn't stuck.
    if (resolvedFarmId !== farmId) { setLoading(false); return; }
    if (!isOrganicVitModuleActive) { setLoading(false); return; }
    // Capture the farm identity at request start. Any await below can cross a
    // farm-switch boundary; we check the ref after each one and bail out if the
    // farm has changed so prior-farm cases can never reach setCases.
    const myFarmId = farmId;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      if (!isResponseCurrentForFarm(myFarmId, activeFarmIdRef.current)) return;
      const res = await fetch(`${apiBase}/api/farms/${myFarmId}/organic-viticulture/input-derogations`, { headers });
      if (!isResponseCurrentForFarm(myFarmId, activeFarmIdRef.current)) return;
      if (res.ok) {
        const data = await res.json();
        if (isResponseCurrentForFarm(myFarmId, activeFarmIdRef.current)) {
          setCases(data.cases ?? []);
        }
      }
    } catch {}
    if (isResponseCurrentForFarm(myFarmId, activeFarmIdRef.current)) {
      setLoading(false);
      setRefreshing(false);
    }
  }, [farmId, apiBase, isOrganicVitModuleActive, modulesLoading, resolvedFarmId]);

  useEffect(() => { load(); }, [load]);

  const onRefresh = () => { setRefreshing(true); load(); };

  // Show a spinner while:
  //   • modules haven't been attempted yet (pre-effect transition window), OR
  //   • modules are actively loading, OR
  //   • the data fetch itself is in flight.
  // Stop showing the spinner once module loading has been attempted and
  // completed (regardless of success/failure) and data loading is done.
  const modulesConfirmedForFarm = resolvedFarmId === farmId;
  const showSpinner =
    (!modulesConfirmedForFarm && (!modulesAttempted || modulesLoading)) ||
    (loading && !refreshing);

  const counts = {
    pending:   cases.filter(c => c.status === "pending").length,
    approved:  cases.filter(c => c.status === "approved").length,
    refused:   cases.filter(c => c.status === "refused").length,
    expired:   cases.filter(c => c.status === "expired").length,
    withdrawn: cases.filter(c => c.status === "withdrawn").length,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Vit Input Derogations</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.infoBox}>
          <Feather name="info" size={14} color="#4c1d95" />
          <Text style={styles.infoText}>
            UK Organic Regulations 2020 — Schedule 1 / Annex II: certain vineyard inputs require prior written approval from your certifying body before use. Copper fungicides and non-organic materials used under derogation must be documented. Manage cases, correspondence, and approval documents in the dashboard.
          </Text>
        </View>

        {cases.length > 0 && (
          <View style={styles.summaryRow}>
            {(["pending", "approved", "refused", "expired", "withdrawn"] as DerogationStatus[])
              .filter(s => counts[s] > 0)
              .map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <View key={s} style={[styles.summaryChip, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                    <Text style={[styles.summaryCount, { color: cfg.color }]}>{counts[s]}</Text>
                    <Text style={[styles.summaryLabel, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                );
              })}
          </View>
        )}

        {showSpinner ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
        ) : cases.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="file-text" size={32} color={colors.textSecondary} style={{ marginBottom: spacing.md }} />
            <Text style={styles.emptyText}>No derogation cases recorded yet.</Text>
            <Text style={styles.emptySubtext}>Open the dashboard to add and manage organic viticulture input derogation cases, certifier correspondence, and approval documents.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Derogation Cases ({cases.length})</Text>
            {cases.map(c => {
              const cfg = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.pending;
              const days = daysUntil(c.expiryDate);
              const isExpanded = expanded === c.id;
              const expiryUrgent = days !== null && days >= 0 && days <= 60;
              const expiryOverdue = days !== null && days < 0;

              return (
                <Pressable
                  key={c.id}
                  style={[styles.caseCard, isExpanded && styles.caseCardExpanded]}
                  onPress={() => setExpanded(isExpanded ? null : c.id)}
                >
                  <View style={styles.caseHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.caseName}>{c.inputName}</Text>
                      <Text style={styles.caseSub}>
                        {c.inputType}{c.vintageYear ? ` · ${c.vintageYear} vintage` : ""}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end", gap: 4 }}>
                      <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
                        <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
                      </View>
                      {c.status === "refused" && !c.correctiveAction && (
                        <View style={[styles.statusBadge, { backgroundColor: "#fff7ed", borderColor: "#fed7aa" }]}>
                          <Text style={[styles.statusLabel, { color: "#c2410c" }]}>Action Required</Text>
                        </View>
                      )}
                      <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} />
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.caseBody}>
                      <View style={styles.divider} />

                      {c.certifier ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Certifier</Text>
                          <Text style={styles.detailValue}>{c.certifier}</Text>
                        </View>
                      ) : null}

                      {c.certifierRef ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Certifier Ref</Text>
                          <Text style={styles.detailValue}>{c.certifierRef}</Text>
                        </View>
                      ) : null}

                      {c.applicationDate ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Applied</Text>
                          <Text style={styles.detailValue}>{fmtDate(c.applicationDate)}</Text>
                        </View>
                      ) : null}

                      {c.decisionDate ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Decision</Text>
                          <Text style={styles.detailValue}>{fmtDate(c.decisionDate)}</Text>
                        </View>
                      ) : null}

                      {c.expiryDate ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Expires</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                            <Text style={styles.detailValue}>{fmtDate(c.expiryDate)}</Text>
                            {expiryOverdue && (
                              <View style={[styles.urgencyBadge, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
                                <Text style={[styles.urgencyText, { color: "#dc2626" }]}>Expired</Text>
                              </View>
                            )}
                            {expiryUrgent && !expiryOverdue && (
                              <View style={[styles.urgencyBadge, { backgroundColor: days! <= 14 ? "#fef2f2" : "#fffbeb", borderColor: days! <= 14 ? "#fecaca" : "#fde68a" }]}>
                                <Text style={[styles.urgencyText, { color: days! <= 14 ? "#dc2626" : "#d97706" }]}>{days}d</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      ) : null}

                      {c.availabilitySearchDate || c.availabilitySearchRef ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Availability Search</Text>
                          <View style={styles.tickBadge}>
                            <Feather name="check" size={11} color="#16a34a" />
                            <Text style={styles.tickText}>{c.availabilitySearchRef ? c.availabilitySearchRef : fmtDate(c.availabilitySearchDate)}</Text>
                          </View>
                        </View>
                      ) : null}

                      {c.justification ? (
                        <View style={[styles.detailRow, { alignItems: "flex-start" }]}>
                          <Text style={styles.detailLabel}>Justification</Text>
                          <Text style={[styles.detailValue, { flex: 1 }]}>{c.justification}</Text>
                        </View>
                      ) : null}

                      {c.approvalConditions ? (
                        <View style={[styles.detailRow, { alignItems: "flex-start" }]}>
                          <Text style={styles.detailLabel}>Conditions</Text>
                          <Text style={[styles.detailValue, { flex: 1 }]}>{c.approvalConditions}</Text>
                        </View>
                      ) : null}

                      {c.internalDecisionDate ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Internal Decision</Text>
                          <Text style={styles.detailValue}>{fmtDate(c.internalDecisionDate)}</Text>
                        </View>
                      ) : null}

                      {c.rejectionReason ? (
                        <View style={[styles.detailRow, { alignItems: "flex-start" }]}>
                          <Text style={styles.detailLabel}>Refusal Reason</Text>
                          <Text style={[styles.detailValue, { flex: 1, color: "#dc2626" }]}>{c.rejectionReason}</Text>
                        </View>
                      ) : null}

                      {c.rejectionRef ? (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Refusal Ref</Text>
                          <Text style={styles.detailValue}>{c.rejectionRef}</Text>
                        </View>
                      ) : null}

                      {c.correctiveAction ? (
                        <View style={[styles.detailRow, { alignItems: "flex-start" }]}>
                          <Text style={styles.detailLabel}>Corrective Action</Text>
                          <Text style={[styles.detailValue, { flex: 1, color: "#16a34a" }]}>{c.correctiveAction}</Text>
                        </View>
                      ) : null}

                      {c.status === "refused" && !c.correctiveAction ? (
                        <View style={[styles.dashboardNote, { backgroundColor: "#fff7ed", borderColor: "#fed7aa", borderWidth: 1 }]}>
                          <Feather name="alert-circle" size={12} color="#c2410c" />
                          <Text style={[styles.dashboardNoteText, { color: "#c2410c" }]}>
                            Action required — this derogation was refused. Record a corrective action in the dashboard.
                          </Text>
                        </View>
                      ) : null}

                      {c.regulatoryBasis ? (
                        <View style={[styles.detailRow, { alignItems: "flex-start" }]}>
                          <Text style={styles.detailLabel}>Regulatory Basis</Text>
                          <Text style={[styles.detailValue, { flex: 1 }]}>{c.regulatoryBasis}</Text>
                        </View>
                      ) : null}

                      <View style={styles.dashboardNote}>
                        <Feather name="monitor" size={12} color={colors.textSecondary} />
                        <Text style={styles.dashboardNoteText}>
                          Add correspondence, upload approval letters and availability search evidence, and edit case details in the dashboard → Organic Viticulture → Input Derogations.
                        </Text>
                      </View>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </>
        )}

        <View style={{ height: 120 }} />
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
    backgroundColor: "#f5f3ff",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#ddd6fe",
  },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#4c1d95", flex: 1 },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  summaryCount: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  summaryLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
    marginTop: spacing.lg,
  },
  emptyText: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, textAlign: "center", marginBottom: spacing.xs },
  emptySubtext: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
  caseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  caseCardExpanded: { borderWidth: 1.5, borderColor: "#9333ea33" },
  caseHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  caseName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  caseSub: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.xs },
  caseBody: { marginTop: spacing.sm },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.sm },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.xs,
    gap: spacing.md,
  },
  detailLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flexShrink: 0,
    width: 130,
  },
  detailValue: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    textAlign: "right",
    flex: 1,
  },
  urgencyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  urgencyText: { fontFamily: fonts.bold, fontSize: 11 },
  tickBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#f0fdf4",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tickText: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: "#16a34a" },
  dashboardNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  dashboardNoteText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
});
