import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
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

interface SummaryStats {
  certifications: { total: number; certified: number; renewalDue: number };
  fieldConversion: { total: number; certifiedHa: number; conversionHa: number };
  seedRecords: { total: number; organic: number; derogations: number };
  inputRecords: { total: number; restricted: number };
  harvests: { total: number; certifiedOrganic: number; totalYield: number };
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

function QuickAction({ icon, label, sub, onPress }: {
  icon: string; label: string; sub: string; onPress: () => void;
}) {
  return (
    <Pressable style={styles.quickAction} onPress={onPress}>
      <View style={styles.qaIcon}>
        <Feather name={icon as never} size={20} color={colors.primary} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
      <Text style={styles.qaSub}>{sub}</Text>
    </Pressable>
  );
}

export default function OrganicArableOverviewScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentFarm?.id) return;
    const farmId = currentFarm.id;
    setLoading(true);

    Promise.allSettled([
      fetch(`/api/farms/${farmId}/organic-arable/certification`, { credentials: "include" }).then(r => r.json()),
      fetch(`/api/farms/${farmId}/organic-arable/field-conversion`, { credentials: "include" }).then(r => r.json()),
      fetch(`/api/farms/${farmId}/organic-arable/seed-records`, { credentials: "include" }).then(r => r.json()),
      fetch(`/api/farms/${farmId}/organic-arable/input-records`, { credentials: "include" }).then(r => r.json()),
      fetch(`/api/farms/${farmId}/organic-arable/harvest-declarations`, { credentials: "include" }).then(r => r.json()),
    ]).then(results => {
      const [certsRes, convRes, seedRes, inputRes, harvestRes] = results;
      const certs = certsRes.status === "fulfilled" ? (certsRes.value?.records ?? []) : [];
      const convs = convRes.status === "fulfilled" ? (convRes.value?.records ?? []) : [];
      const seeds = seedRes.status === "fulfilled" ? (seedRes.value?.records ?? []) : [];
      const inputs = inputRes.status === "fulfilled" ? (inputRes.value?.records ?? []) : [];
      const harvests = harvestRes.status === "fulfilled" ? (harvestRes.value?.records ?? []) : [];

      const today = new Date();
      const nextYear = new Date(today); nextYear.setFullYear(today.getFullYear() + 1);

      setStats({
        certifications: {
          total: certs.length,
          certified: certs.filter((c: Record<string, unknown>) => c.status === "certified").length,
          renewalDue: certs.filter((c: Record<string, unknown>) => {
            if (!c.renewalDate) return false;
            const d = new Date(String(c.renewalDate));
            return d >= today && d <= nextYear;
          }).length,
        },
        fieldConversion: {
          total: convs.length,
          certifiedHa: convs.filter((c: Record<string, unknown>) => c.status === "certified").reduce((s: number, c: Record<string, unknown>) => s + (parseFloat(String(c.areaHa || 0)) || 0), 0),
          conversionHa: convs.filter((c: Record<string, unknown>) => c.status === "in-conversion").reduce((s: number, c: Record<string, unknown>) => s + (parseFloat(String(c.areaHa || 0)) || 0), 0),
        },
        seedRecords: {
          total: seeds.length,
          organic: seeds.filter((s: Record<string, unknown>) => s.seedType === "organic").length,
          derogations: seeds.filter((s: Record<string, unknown>) => s.seedType !== "organic").length,
        },
        inputRecords: {
          total: inputs.length,
          restricted: inputs.filter((i: Record<string, unknown>) => i.permittedStatus === "restricted").length,
        },
        harvests: {
          total: harvests.length,
          certifiedOrganic: harvests.filter((h: Record<string, unknown>) => h.organicStatus === "certified").length,
          totalYield: harvests.reduce((s: number, h: Record<string, unknown>) => s + (parseFloat(String(h.yieldTonnes || 0)) || 0), 0),
        },
      });
      setLoading(false);
    });
  }, [currentFarm?.id]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Organic Arable</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Feather name="sun" size={14} color="#16a34a" />
          <Text style={styles.infoText}>
            Certification, conversion register, seed sourcing, input log and harvest declarations for organic arable production.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Loading summary…</Text>
          </View>
        ) : stats ? (
          <>
            {/* Certification */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Certification</Text>
              <View style={styles.statsRow}>
                <StatCard label="Certificates" value={stats.certifications.total} />
                <StatCard label="Certified" value={stats.certifications.certified} color="#16a34a" />
                <StatCard
                  label="Renewals Due"
                  value={stats.certifications.renewalDue}
                  sub="12 months"
                  color={stats.certifications.renewalDue > 0 ? "#d97706" : undefined}
                />
              </View>
            </View>

            {/* Field Conversion */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Field Conversion</Text>
              <View style={styles.statsRow}>
                <StatCard label="Fields" value={stats.fieldConversion.total} />
                <StatCard
                  label="Certified Ha"
                  value={stats.fieldConversion.certifiedHa > 0 ? `${stats.fieldConversion.certifiedHa.toFixed(1)} ha` : "—"}
                  color="#16a34a"
                />
                <StatCard
                  label="In Conversion"
                  value={stats.fieldConversion.conversionHa > 0 ? `${stats.fieldConversion.conversionHa.toFixed(1)} ha` : "—"}
                  color={stats.fieldConversion.conversionHa > 0 ? "#d97706" : undefined}
                />
              </View>
            </View>

            {/* Seed & Inputs */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seed Sourcing</Text>
              <View style={styles.statsRow}>
                <StatCard label="Seed Records" value={stats.seedRecords.total} />
                <StatCard label="Organic Seed" value={stats.seedRecords.organic} color="#16a34a" />
                <StatCard
                  label="Derogations"
                  value={stats.seedRecords.derogations}
                  color={stats.seedRecords.derogations > 0 ? "#d97706" : undefined}
                />
              </View>
            </View>

            {/* Harvests */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Harvests</Text>
              <View style={styles.statsRow}>
                <StatCard label="Records" value={stats.harvests.total} />
                <StatCard label="Certified" value={stats.harvests.certifiedOrganic} color="#16a34a" />
                <StatCard
                  label="Total Yield"
                  value={stats.harvests.totalYield > 0 ? `${stats.harvests.totalYield.toFixed(1)} t` : "—"}
                />
              </View>
            </View>
          </>
        ) : null}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <QuickAction
            icon="package"
            label="Log Input"
            sub="Fertiliser, soil amendment, spray"
            onPress={() => router.push("/organic-arable-input")}
          />
          <QuickAction
            icon="box"
            label="Log Seed Purchase"
            sub="Organic or derogation seed"
            onPress={() => router.push("/organic-arable-seed")}
          />
          <QuickAction
            icon="truck"
            label="Log Harvest"
            sub="Yield and organic status"
            onPress={() => router.push("/organic-arable-harvest")}
          />
        </View>

        <View style={styles.footNote}>
          <Feather name="info" size={12} color={colors.textTertiary} />
          <Text style={styles.footNoteText}>
            Full records, certification management, field conversion tracking and buyer declarations are available in the Organic Arable section of the Farm Trac dashboard.
          </Text>
        </View>

        <View style={{ height: 40 }} />
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
  scrollContent: { padding: spacing.lg, gap: spacing.md },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#f0fdf4",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#15803d", flex: 1 },
  loadingWrap: { alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.md },
  loadingText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  statsRow: { flexDirection: "row", gap: spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  statValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: "center",
  },
  statSub: {
    fontFamily: fonts.regular,
    fontSize: 9,
    color: colors.textTertiary,
    textAlign: "center",
    marginTop: 1,
  },
  quickGrid: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  quickAction: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  qaIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  qaLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, textAlign: "center" },
  qaSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary, textAlign: "center", marginTop: 2 },
  footNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.md,
  },
  footNoteText: { fontFamily: fonts.regular, fontSize: 11, color: colors.textTertiary, flex: 1 },
});
