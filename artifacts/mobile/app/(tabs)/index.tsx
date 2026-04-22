import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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
import { getList, STORAGE_KEYS } from "@/lib/storage";

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
  const { heroCard, setHeroCard, loaded: prefLoaded } = useHomePreference();
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
    await Promise.all([loadData(), triggerSync()]);
    setRefreshing(false);
  }, [loadData, triggerSync]);

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

        <SectionHeader title="Today's Weather" />
        <WeatherWidget
          temperature="14°C"
          conditions="Cloudy"
          windSpeed="12 mph NW"
          rainfall="2mm"
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
});
