import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ComplianceCard } from "@/components/home/ComplianceCard";
import { HomePersonaliseSheet } from "@/components/home/HomePersonaliseSheet";
import { MyTasksCard } from "@/components/home/MyTasksCard";
import { QuickAction } from "@/components/home/QuickAction";
import { WeatherWidget } from "@/components/home/WeatherWidget";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFarmDashboard } from "@/lib/hooks/useApiFarmDashboard";
import { useApiMyTasksSummary } from "@/lib/hooks/useApiMyTasksSummary";
import { useHomePreference } from "@/lib/hooks/useHomePreference";
import { apiFetch } from "@/lib/apiFetch";
import { getList, STORAGE_KEYS } from "@/lib/storage";
import { vineyardCountEvents } from "@/lib/vineyardCountEvents";

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  time: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, farms, setCurrentFarm, user } = useFarm();
  const { pendingCount, isSyncing, triggerSync } = useSync();
  const { data: dashboardData, loading: dashboardLoading } = useApiFarmDashboard(currentFarm?.id);
  const { data: taskSummary, loading: taskSummaryLoading } = useApiMyTasksSummary(currentFarm?.id);
  const { heroCard, setHeroCard, loaded: prefLoaded } = useHomePreference(user?.id);
  const [personaliseVisible, setPersonaliseVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [recordCounts, setRecordCounts] = useState({
    sprays: 0,
    weather: 0,
    visitors: 0,
    cropEvents: 0,
    soilSamples: 0,
  });

  const [unlinkedCounts, setUnlinkedCounts] = useState({ scouting: 0, sprayDiary: 0, phenology: 0, harvest: 0, operations: 0 });

  const fetchUnlinkedCounts = useCallback(async () => {
    if (!currentFarm?.id) return;
    try {
      const [scoutRes, sprayRes, phenologyRes, harvestRes, opsRes] = await Promise.all([
        apiFetch(`/api/farms/${currentFarm.id}/vineyard-scouting`),
        apiFetch(`/api/farms/${currentFarm.id}/vineyard-spray-diary`),
        apiFetch(`/api/farms/${currentFarm.id}/vineyard-phenology`),
        apiFetch(`/api/farms/${currentFarm.id}/vineyard-harvest`),
        apiFetch(`/api/farms/${currentFarm.id}/vineyard-operations`),
      ]);
      const scoutData = scoutRes.ok ? await scoutRes.json() : { records: [] };
      const sprayData = sprayRes.ok ? await sprayRes.json() : { records: [] };
      const phenologyData = phenologyRes.ok ? await phenologyRes.json() : { records: [] };
      const harvestData = harvestRes.ok ? await harvestRes.json() : { records: [] };
      const opsData = opsRes.ok ? await opsRes.json() : { records: [] };
      const scoutRecords: { blockId: number | null }[] = scoutData.records ?? [];
      const sprayRecords: { blockId: number | null }[] = sprayData.records ?? [];
      const phenologyRecords: { blockId: number | null }[] = phenologyData.records ?? [];
      const harvestRecords: { blockId: number | null }[] = harvestData.records ?? [];
      const opsRecords: { blockId: number | null }[] = opsData.records ?? [];
      setUnlinkedCounts({
        scouting: scoutRecords.filter(r => r.blockId == null).length,
        sprayDiary: sprayRecords.filter(r => r.blockId == null).length,
        phenology: phenologyRecords.filter(r => r.blockId == null).length,
        harvest: harvestRecords.filter(r => r.blockId == null).length,
        operations: opsRecords.filter(r => r.blockId == null).length,
      });
    } catch { /* ignore */ }
  }, [currentFarm?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchUnlinkedCounts();
    }, [fetchUnlinkedCounts])
  );

  // Also re-fetch immediately when a history screen changes a block link inline
  // (without navigating away), so the compliance gap banner stays accurate.
  useEffect(() => {
    return vineyardCountEvents.subscribe(() => {
      fetchUnlinkedCounts();
    });
  }, [fetchUnlinkedCounts]);

  const [liveWeather, setLiveWeather] = useState<{
    temperature: string;
    conditions: string;
    windSpeed: string;
    rainfall: string;
    source: string;
  } | null>(null);

  const fetchLiveWeather = useCallback(async () => {
    if (!currentFarm?.id) return;
    try {
      const { kvGet } = await import("@/lib/database");
      const domain = process.env.EXPO_PUBLIC_DOMAIN || "";
      const token = await kvGet("bde_auth_token");
      const tenantRaw = await kvGet("bde_current_farm");
      const tenantParsed = tenantRaw ? JSON.parse(tenantRaw) : null;
      const tenantSlug = tenantParsed ? (tenantParsed.tenantSlug || tenantParsed.slug || "") : "";
      const headers: Record<string, string> = { "x-tenant-slug": tenantSlug };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(
        `${domain}/api/farms/${currentFarm.id}/sensor-readings?category=weather&limit=50`,
        { headers },
      );
      if (res.ok) {
        const data = await res.json();
        const readings: any[] = data.readings ?? [];
        if (readings.length > 0) {
          const latestByParam = new Map<string, any>();
          for (const r of [...readings].sort(
            (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
          )) {
            if (!latestByParam.has(r.parameter)) latestByParam.set(r.parameter, r);
          }
          const getVal = (p: string) => latestByParam.get(p)?.value;
          const temp    = getVal("air_temperature") ?? getVal("temperature");
          const wind    = getVal("wind_speed");
          const windDir = getVal("wind_direction");
          const rain    = getVal("rainfall") ?? getVal("precipitation");
          if (temp != null || wind != null) {
            const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
            const compass = windDir != null ? dirs[Math.round(Number(windDir) / 22.5) % 16] : "";
            const stationName = readings[0]?.stationName ?? "Station";
            setLiveWeather({
              temperature: temp != null ? `${Math.round(Number(temp) * 10) / 10}°C` : "—",
              conditions: "From station",
              windSpeed: wind != null ? `${Math.round(Number(wind))} km/h${compass ? " " + compass : ""}` : "—",
              rainfall: rain != null ? `${Math.round(Number(rain) * 10) / 10} mm` : "0 mm",
              source: stationName,
            });
            return;
          }
        }
      }
    } catch { /* ignore */ }
  }, [currentFarm?.id]);

  useEffect(() => {
    fetchLiveWeather();
  }, [fetchLiveWeather]);

  const loadData = useCallback(async () => {
    const farmId = currentFarm?.id;
    const [sprays, weather, visitors, crops, soil] = await Promise.all([
      getList<{ farmId: string }>(STORAGE_KEYS.SPRAY_RECORDS, farmId),
      getList<{ farmId: string }>(STORAGE_KEYS.WEATHER_ENTRIES, farmId),
      getList<{ farmId: string }>(STORAGE_KEYS.VISITOR_LOG, farmId),
      getList<{ farmId: string }>(STORAGE_KEYS.CROP_EVENTS, farmId),
      getList<{ farmId: string }>(STORAGE_KEYS.SOIL_SAMPLES, farmId),
    ]);

    setRecordCounts({
      sprays: sprays.length,
      weather: weather.length,
      visitors: visitors.length,
      cropEvents: crops.length,
      soilSamples: soil.length,
    });

    const activities: RecentActivity[] = [];
    if (sprays.length > 0) {
      activities.push({
        id: "spray",
        type: "Spray Record",
        title: `${sprays.length} spray record${sprays.length === 1 ? "" : "s"} logged`,
        time: "Recent",
        icon: "droplet",
        color: colors.info,
      });
    }
    if (visitors.length > 0) {
      activities.push({
        id: "visitor",
        type: "Visitor Log",
        title: `${visitors.length} visitor${visitors.length === 1 ? "" : "s"} recorded`,
        time: "Recent",
        icon: "users",
        color: colors.accent,
      });
    }
    if (crops.length > 0) {
      activities.push({
        id: "crop",
        type: "Crop Event",
        title: `${crops.length} crop event${crops.length === 1 ? "" : "s"} logged`,
        time: "Recent",
        icon: "layers",
        color: colors.fieldGreen,
      });
    }
    setRecentActivity(activities);
  }, [currentFarm?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadData(), triggerSync(), fetchLiveWeather(), fetchUnlinkedCounts()]);
    setRefreshing(false);
  }, [loadData, triggerSync, fetchLiveWeather, fetchUnlinkedCounts]);

  const totalRecords = Object.values(recordCounts).reduce((a, b) => a + b, 0);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Good {getTimeOfDay()}, {user?.name?.split(" ")[0] || "there"}
          </Text>
          <Pressable
            style={styles.farmSelector}
            onPress={() => {
              const next = farms[(farms.indexOf(currentFarm!) + 1) % farms.length];
              if (next) setCurrentFarm(next);
            }}
          >
            <Feather name="map-pin" size={13} color={colors.primary} />
            <Text style={styles.farmName}>{currentFarm?.name || "No farm selected"}</Text>
            {farms.length > 1 && (
              <Feather name="chevron-down" size={13} color={colors.primary} />
            )}
          </Pressable>
        </View>
        <View style={styles.headerButtons}>
          <Pressable
            style={styles.syncButton}
            onPress={() => setPersonaliseVisible(true)}
            hitSlop={8}
          >
            <Feather name="sliders" size={18} color={colors.primary} />
          </Pressable>
          <Pressable
            style={styles.syncButton}
            onPress={triggerSync}
          >
            {pendingCount > 0 && (
              <View style={styles.syncBadge}>
                <Text style={styles.syncBadgeText}>{pendingCount}</Text>
              </View>
            )}
            <Feather
              name={isSyncing ? "loader" : "refresh-cw"}
              size={20}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {(!prefLoaded || heroCard === "compliance") ? (
          <ComplianceCard
            score={dashboardData?.complianceScore ?? 0}
            completedForms={dashboardData?.completedForms ?? 0}
            totalForms={dashboardData?.totalForms ?? 0}
            overdueItems={dashboardData?.overdueActions ?? 0}
            loading={dashboardLoading || !prefLoaded}
          />
        ) : (
          <MyTasksCard
            data={taskSummary}
            loading={taskSummaryLoading}
          />
        )}

        <SectionHeader title="Quick Actions" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActions}
        >
          <QuickAction
            title="My Tasks"
            icon="check-square"
            color="#22c55e"
            bgColor="#f0fdf4"
            onPress={() => router.push("/task-inbox")}
          />
          <QuickAction
            title="Spray Record"
            icon="droplet"
            color={colors.info}
            bgColor={colors.infoBg}
            onPress={() => router.push("/spray-record")}
          />
          <QuickAction
            title="Weather"
            icon="cloud"
            color={colors.accent}
            bgColor={colors.warningBg}
            onPress={() => router.push("/weather-entry")}
          />
          <QuickAction
            title="Visitor Log"
            icon="users"
            color="#8B5CF6"
            bgColor="#EDE9FE"
            onPress={() => router.push("/visitor-log")}
          />
          <QuickAction
            title="Crop Event"
            icon="layers"
            color={colors.fieldGreen}
            bgColor={colors.successBg}
            onPress={() => router.push("/crop-event")}
          />
          <QuickAction
            title="Soil Sample"
            icon="thermometer"
            color={colors.fieldBrown}
            bgColor="#FEF3C7"
            onPress={() => router.push("/soil-sample")}
          />
          <QuickAction
            title="Take Photo"
            icon="camera"
            color={colors.textSecondary}
            bgColor={colors.borderLight}
            onPress={() => router.push("/photo-capture")}
          />
        </ScrollView>

        <SectionHeader title={liveWeather ? `Today's Weather · ${liveWeather.source}` : "Today's Weather"} />
        <WeatherWidget
          temperature={liveWeather?.temperature ?? "—"}
          conditions={liveWeather?.conditions ?? "Loading…"}
          windSpeed={liveWeather?.windSpeed ?? "—"}
          rainfall={liveWeather?.rainfall ?? "—"}
        />

        <SectionHeader title="Farm Overview" />
        <Card style={styles.overviewCard}>
          <View style={styles.overviewRow}>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{totalRecords}</Text>
              <Text style={styles.overviewLabel}>Total Records</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{recordCounts.sprays}</Text>
              <Text style={styles.overviewLabel}>Sprays</Text>
            </View>
            <View style={styles.overviewItem}>
              <Text style={styles.overviewValue}>{recordCounts.cropEvents}</Text>
              <Text style={styles.overviewLabel}>Crop Events</Text>
            </View>
          </View>
        </Card>

        {(unlinkedCounts.scouting > 0 || unlinkedCounts.sprayDiary > 0 || unlinkedCounts.phenology > 0 || unlinkedCounts.harvest > 0 || unlinkedCounts.operations > 0) && (
          <>
            <SectionHeader title="Compliance Gaps" />
            {unlinkedCounts.scouting > 0 && (
              <Pressable
                style={styles.unlinkedBanner}
                onPress={() => router.push("/vine-scouting-history")}
              >
                <View style={styles.unlinkedIconWrap}>
                  <Feather name="alert-triangle" size={18} color={colors.warning} />
                </View>
                <View style={styles.unlinkedContent}>
                  <Text style={styles.unlinkedTitle}>
                    {unlinkedCounts.scouting} unlinked scouting{" "}
                    {unlinkedCounts.scouting === 1 ? "record" : "records"}
                  </Text>
                  <Text style={styles.unlinkedSubtitle}>Tap to link to a vineyard block</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
            {unlinkedCounts.sprayDiary > 0 && (
              <Pressable
                style={styles.unlinkedBanner}
                onPress={() => router.push("/vine-spray-diary-history")}
              >
                <View style={styles.unlinkedIconWrap}>
                  <Feather name="alert-triangle" size={18} color={colors.warning} />
                </View>
                <View style={styles.unlinkedContent}>
                  <Text style={styles.unlinkedTitle}>
                    {unlinkedCounts.sprayDiary} unlinked spray diary{" "}
                    {unlinkedCounts.sprayDiary === 1 ? "record" : "records"}
                  </Text>
                  <Text style={styles.unlinkedSubtitle}>Tap to link to a vineyard block</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
            {unlinkedCounts.phenology > 0 && (
              <Pressable
                style={styles.unlinkedBanner}
                onPress={() => router.push("/vine-phenology-history")}
              >
                <View style={styles.unlinkedIconWrap}>
                  <Feather name="alert-triangle" size={18} color={colors.warning} />
                </View>
                <View style={styles.unlinkedContent}>
                  <Text style={styles.unlinkedTitle}>
                    {unlinkedCounts.phenology} unlinked phenology{" "}
                    {unlinkedCounts.phenology === 1 ? "record" : "records"}
                  </Text>
                  <Text style={styles.unlinkedSubtitle}>Tap to link to a vineyard block</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
            {unlinkedCounts.harvest > 0 && (
              <Pressable
                style={styles.unlinkedBanner}
                onPress={() => router.push("/vine-harvest-history")}
              >
                <View style={styles.unlinkedIconWrap}>
                  <Feather name="alert-triangle" size={18} color={colors.warning} />
                </View>
                <View style={styles.unlinkedContent}>
                  <Text style={styles.unlinkedTitle}>
                    {unlinkedCounts.harvest} unlinked harvest{" "}
                    {unlinkedCounts.harvest === 1 ? "record" : "records"}
                  </Text>
                  <Text style={styles.unlinkedSubtitle}>Tap to link to a vineyard block</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
            {unlinkedCounts.operations > 0 && (
              <Pressable
                style={styles.unlinkedBanner}
                onPress={() => router.push("/vine-operations-history")}
              >
                <View style={styles.unlinkedIconWrap}>
                  <Feather name="alert-triangle" size={18} color={colors.warning} />
                </View>
                <View style={styles.unlinkedContent}>
                  <Text style={styles.unlinkedTitle}>
                    {unlinkedCounts.operations} unlinked{" "}
                    {unlinkedCounts.operations === 1 ? "operation" : "operations"}
                  </Text>
                  <Text style={styles.unlinkedSubtitle}>Tap to link to a vineyard block</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
          </>
        )}

        {recentActivity.length > 0 && (
          <>
            <SectionHeader title="Recent Activity" />
            <Card style={styles.activityCard} padded={false}>
              {recentActivity.map((activity, i) => (
                <View key={activity.id}>
                  <View style={styles.activityItem}>
                    <View style={[styles.activityIcon, { backgroundColor: activity.color + "18" }]}>
                      <Feather name={activity.icon} size={16} color={activity.color} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                    <Badge text={activity.type} variant="neutral" />
                  </View>
                  {i < recentActivity.length - 1 && <View style={styles.activityDivider} />}
                </View>
              ))}
            </Card>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <HomePersonaliseSheet
        visible={personaliseVisible}
        current={heroCard}
        onSelect={setHeroCard}
        onClose={() => setPersonaliseVisible(false)}
      />
    </View>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  greeting: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  farmSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  farmName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  syncButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted + "33",
    alignItems: "center",
    justifyContent: "center",
  },
  syncBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  syncBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: colors.textInverse,
  },
  scrollContent: {
    paddingTop: spacing.sm,
  },
  quickActions: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  overviewCard: {
    marginHorizontal: spacing.lg,
  },
  overviewRow: {
    flexDirection: "row",
  },
  overviewItem: {
    flex: 1,
    alignItems: "center",
  },
  overviewValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  overviewLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityCard: {
    marginHorizontal: spacing.lg,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
  },
  activityTime: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activityDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: spacing.lg + 36 + spacing.md,
  },
  unlinkedBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.warningBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.warning + "55",
    gap: spacing.md,
  },
  unlinkedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.warning + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  unlinkedContent: {
    flex: 1,
  },
  unlinkedTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  unlinkedSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
