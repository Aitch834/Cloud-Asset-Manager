import { Feather } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid, DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ComplianceCard } from "@/components/home/ComplianceCard";
import { HomePersonaliseSheet } from "@/components/home/HomePersonaliseSheet";
import { MyTasksCard } from "@/components/home/MyTasksCard";
import { QuickAction } from "@/components/home/QuickAction";
import { WeatherWidget } from "@/components/home/WeatherWidget";
import { WinegbSurveyNudge } from "@/components/home/WinegbSurveyNudge";
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
import {
  getDairyHomeShortcut,
  getHomeModuleChecks,
  shouldShowViticultureComplianceGaps,
} from "@/lib/homeModuleChecks";
import {
  formatAgriEnvMilestoneStatus,
  getAgriEnvMilestoneSections,
  type AgriEnvMilestoneRecord,
} from "@/lib/agri-env-milestone-sections";
import {
  getUpcomingInspectionReminders,
  type OrganicInspectionReminder,
  type OrganicInspectionReminderRecord,
} from "@/lib/organicInspectionReminders";
import {
  agriEnvProjectsCacheKey,
  getCachedAgriEnvProject,
  getList,
  setItem,
  STORAGE_KEYS,
} from "@/lib/storage";
import { vineyardCountEvents } from "@/lib/vineyardCountEvents";
import { winegbSubmissionEvents } from "@/lib/winegbSubmissionEvents";
import { WINEGB_SURVEY_KEYS } from "@/lib/winegbSurveys";

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
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
    resolvedFarmId: dashboardResolvedFarmId,
    reload: reloadDashboard,
  } = useApiFarmDashboard(currentFarm?.id);
  const { data: taskSummary, loading: taskSummaryLoading } = useApiMyTasksSummary(currentFarm?.id);
  const { heroCard, setHeroCard, loaded: prefLoaded } = useHomePreference(user?.id);
  const dashboardModulesResolved =
    dashboardResolvedFarmId === currentFarm?.id &&
    !dashboardLoading &&
    dashboardError == null;
  const { activeModuleKeys, isViticultureActive, isOrganicActive } =
    getHomeModuleChecks(dashboardData, dashboardModulesResolved);
  const dairyHomeShortcut = getDairyHomeShortcut(activeModuleKeys);
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
  const [winegbPendingCount, setWinegbPendingCount] = useState(0);
  const winegbRequestGenerationRef = useRef(0);
  const [fpInputDerogAlerts, setFpInputDerogAlerts] = useState<Array<{ id: string; title: string; isOverdue: boolean; dueDate: string | null }>>([]);
  const [fpDerogAlerts, setFpDerogAlerts] = useState<Array<{ id: string; title: string; isOverdue: boolean }>>([]);
  const [upcomingMilestones, setUpcomingMilestones] = useState<ReturnType<typeof getAgriEnvMilestoneSections>["upcoming"]>([]);
  const [pastMilestones, setPastMilestones] = useState<ReturnType<typeof getAgriEnvMilestoneSections>["past"]>([]);
  const [markCompleteTarget, setMarkCompleteTarget] = useState<{
    id: number;
    projectId: number;
    milestoneName: string;
  } | null>(null);
  const [completionSummary, setCompletionSummary] = useState<{
    milestoneName: string;
    claimAmountPence: number | null;
    alreadyPaid: boolean;
    milestoneCount?: number;
    completedMilestoneCount?: number;
    claimedAmountPence?: number;
    remainingGrantValuePence?: number | null;
    totalsAreCached?: boolean;
  } | null>(null);
  const [completionDate, setCompletionDate] = useState<Date>(new Date());
  const [evidenceNote, setEvidenceNote] = useState("");
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const markingCompleteRef = useRef(false);
  const [upcomingInspections, setUpcomingInspections] = useState<OrganicInspectionReminder[]>([]);

  const handleMarkComplete = useCallback(async () => {
    const target = markCompleteTarget;
    if (!target || !currentFarm?.id || markingCompleteRef.current) return;
    markingCompleteRef.current = true;
    setIsMarkingComplete(true);
    try {
      const y = completionDate.getFullYear();
      const m = String(completionDate.getMonth() + 1).padStart(2, "0");
      const d = String(completionDate.getDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;
      const res = await apiFetch(
        `/api/farms/${currentFarm.id}/agri-env-projects/${target.projectId}/milestones/${target.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            completionDate: dateStr,
            ...(evidenceNote.trim() ? { evidenceNotes: evidenceNote.trim() } : {}),
          }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Error", (err as { error?: string }).error || "Could not mark milestone complete.");
        return;
      }

      const saved = await res.json().catch(() => ({})) as {
        milestone?: { claimAmountPence?: number | null; status?: string };
      };
      const summary: {
        milestoneName: string;
        claimAmountPence: number | null;
        alreadyPaid: boolean;
        milestoneCount?: number;
        completedMilestoneCount?: number;
        claimedAmountPence?: number;
        remainingGrantValuePence?: number | null;
        totalsAreCached?: boolean;
      } = {
        milestoneName: target.milestoneName,
        claimAmountPence: saved.milestone?.claimAmountPence ?? null,
        alreadyPaid: saved.milestone?.status === "paid",
      };

      try {
        const projectsRes = await apiFetch(`/api/farms/${currentFarm.id}/agri-env-projects`);
        if (projectsRes.ok) {
          const payload = await projectsRes.json() as {
            projects?: Array<{
              id: number;
              milestoneCount?: number;
              completedMilestoneCount?: number;
              claimedAmountPence?: number;
              remainingGrantValuePence?: number | null;
            }>;
          };
          const project = (payload.projects ?? []).find((item) => item.id === target.projectId);
          if (project) {
            summary.milestoneCount = project.milestoneCount;
            summary.completedMilestoneCount = project.completedMilestoneCount;
            summary.claimedAmountPence = project.claimedAmountPence;
            summary.remainingGrantValuePence = project.remainingGrantValuePence;
          }
          await setItem(agriEnvProjectsCacheKey(currentFarm.id), {
            data: payload.projects ?? [],
            cachedAt: new Date().toISOString(),
          }).catch(() => { /* Fresh totals still take precedence if cache persistence fails. */ });
        } else {
          throw new Error(`Server error ${projectsRes.status}`);
        }
      } catch {
        const cachedProject = await getCachedAgriEnvProject<{
          id: number;
          milestoneCount?: number;
          completedMilestoneCount?: number;
          claimedAmountPence?: number;
          remainingGrantValuePence?: number | null;
        }>(currentFarm.id, target.projectId).catch(() => null);
        if (cachedProject) {
          summary.milestoneCount = cachedProject.milestoneCount;
          summary.completedMilestoneCount = cachedProject.completedMilestoneCount;
          summary.claimedAmountPence = cachedProject.claimedAmountPence;
          summary.remainingGrantValuePence = cachedProject.remainingGrantValuePence;
          summary.totalsAreCached = true;
        }
      }

      // Remove from the home screen list immediately
      setUpcomingMilestones((prev) => prev.filter((m) => m.id !== target.id));
      setMarkCompleteTarget(null);
      setEvidenceNote("");
      setCompletionSummary(summary);
    } catch {
      Alert.alert("Offline", "Could not reach the server. Please try again when back online.");
    } finally {
      markingCompleteRef.current = false;
      setIsMarkingComplete(false);
    }
  }, [markCompleteTarget, currentFarm?.id, completionDate, evidenceNote]);

  const fetchFPInputDerogAlerts = useCallback(async () => {
    if (!currentFarm?.id || !isOrganicActive) {
      setFpInputDerogAlerts([]);
      setFpDerogAlerts([]);
      return;
    }
    try {
      const res = await apiFetch(`/api/farms/${currentFarm.id}/week-ahead?days=30`);
      if (!res.ok) return;
      const data = await res.json();
      const tasks: Array<{ id: string; type: string; title: string; colour: string; dueDate?: string }> = data.tasks ?? [];
      setFpInputDerogAlerts(
        tasks
          .filter((t) => t.type === "organic_fp_input_log_derogation_expiry")
          .map((t) => ({ id: t.id, title: t.title, isOverdue: t.colour === "red", dueDate: t.dueDate ?? null })),
      );
      setFpDerogAlerts(
        tasks
          .filter((t) => t.type === "organic_fp_derogation_expiry")
          .map((t) => ({ id: t.id, title: t.title, isOverdue: t.colour === "red" })),
      );
    } catch { /* ignore */ }
  }, [currentFarm?.id, isOrganicActive]);

  const fetchUpcomingMilestones = useCallback(async () => {
    if (!currentFarm?.id) return;
    try {
      const res = await apiFetch(`/api/farms/${currentFarm.id}/planner-events`);
      if (!res.ok) return;
      const data = await res.json();
      const milestones: AgriEnvMilestoneRecord[] = data.milestones ?? [];
      const sections = getAgriEnvMilestoneSections(milestones);
      setUpcomingMilestones(sections.upcoming);
      setPastMilestones(sections.past);
    } catch { /* ignore */ }
  }, [currentFarm?.id]);

  const fetchUpcomingInspections = useCallback(async () => {
    if (!currentFarm?.id || !isOrganicActive) {
      setUpcomingInspections([]);
      return;
    }
    try {
      const res = await apiFetch(`/api/farms/${currentFarm.id}/organic/inspections`);
      if (!res.ok) return;
      const data = await res.json();
      const records: OrganicInspectionReminderRecord[] = data.records ?? [];
      setUpcomingInspections(getUpcomingInspectionReminders(records));
    } catch { /* ignore */ }
  }, [currentFarm?.id, isOrganicActive]);

  const fetchUnlinkedCounts = useCallback(async () => {
    if (!currentFarm?.id || !isViticultureActive) return;
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
  }, [currentFarm?.id, isViticultureActive]);

  const fetchWinegbSubmissions = useCallback(async () => {
    const requestGeneration = ++winegbRequestGenerationRef.current;
    const farmId = currentFarm?.id;
    if (!farmId || !isViticultureActive) {
      setWinegbPendingCount(0);
      return;
    }
    try {
      const year = new Date().getFullYear();
      const res = await apiFetch(`/api/farms/${farmId}/winegb-submissions?year=${year}`);
      if (!res.ok) return;
      const payload = await res.json() as { submissions: Record<string, { submitted: boolean }> };
      const pending = WINEGB_SURVEY_KEYS.filter(
        key => !(payload.submissions?.[key]?.submitted ?? false),
      ).length;
      if (requestGeneration === winegbRequestGenerationRef.current) {
        setWinegbPendingCount(pending);
      }
    } catch { /* ignore */ }
  }, [currentFarm?.id, isViticultureActive]);

  // Clear any stale viticulture compliance-gap counts when the farm doesn't
  // have the module, so banners never appear for non-viticulture farms.
  useEffect(() => {
    if (!isViticultureActive) {
      setUnlinkedCounts({ scouting: 0, sprayDiary: 0, phenology: 0, harvest: 0, operations: 0 });
      setWinegbPendingCount(0);
    }
  }, [isViticultureActive]);

  useFocusEffect(
    useCallback(() => {
      fetchUnlinkedCounts();
      fetchFPInputDerogAlerts();
      fetchUpcomingMilestones();
      fetchUpcomingInspections();
      fetchWinegbSubmissions();
    }, [fetchUnlinkedCounts, fetchFPInputDerogAlerts, fetchUpcomingMilestones, fetchUpcomingInspections, fetchWinegbSubmissions])
  );

  // Also re-fetch immediately when a history screen changes a block link inline
  // (without navigating away), so the compliance gap banner stays accurate.
  useEffect(() => {
    return vineyardCountEvents.subscribe(() => {
      fetchUnlinkedCounts();
    });
  }, [fetchUnlinkedCounts]);

  // Re-fetch WineGB submission counts immediately when phenology marks a survey
  // submitted, without waiting for a pull-to-refresh or focus cycle.
  useEffect(() => {
    return winegbSubmissionEvents.subscribe(() => {
      fetchWinegbSubmissions();
    });
  }, [fetchWinegbSubmissions]);

  // A refresh can remove a milestone while its completion sheet is open
  // (for example, if it was paid from the dashboard). Do not leave a stale
  // sheet available to submit against a card that is no longer on Home.
  useEffect(() => {
    if (
      markCompleteTarget &&
      !upcomingMilestones.some((milestone) => milestone.id === markCompleteTarget.id)
    ) {
      setMarkCompleteTarget(null);
      setEvidenceNote("");
    }
  }, [markCompleteTarget, upcomingMilestones]);

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
      const res = await apiFetch(
        `/api/farms/${currentFarm.id}/sensor-readings?category=weather&limit=50`,
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
    await Promise.all([loadData(), triggerSync(), reloadDashboard(), fetchLiveWeather(), fetchUnlinkedCounts(), fetchFPInputDerogAlerts(), fetchUpcomingMilestones(), fetchUpcomingInspections(), fetchWinegbSubmissions()]);
    setRefreshing(false);
  }, [loadData, triggerSync, reloadDashboard, fetchLiveWeather, fetchUnlinkedCounts, fetchFPInputDerogAlerts, fetchUpcomingMilestones, fetchUpcomingInspections, fetchWinegbSubmissions]);

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
        {dashboardError && !dashboardLoading && (
          <View style={styles.dashboardErrorBanner}>
            <View style={styles.unlinkedIconWrap}>
              <Feather name="cloud-off" size={18} color={colors.error} />
            </View>
            <View style={styles.unlinkedContent}>
              <Text style={styles.unlinkedTitle}>Home modules unavailable</Text>
              <Text style={styles.unlinkedSubtitle}>
                Module-specific checks are hidden until the dashboard reconnects.
              </Text>
            </View>
            <Pressable onPress={() => { void reloadDashboard(); }} hitSlop={8}>
              <Text style={styles.dashboardRetryText}>Retry</Text>
            </Pressable>
          </View>
        )}

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
          {dairyHomeShortcut && (
            <QuickAction
              title={dairyHomeShortcut.title}
              icon="bar-chart-2"
              color="#2563eb"
              bgColor="#dbeafe"
              onPress={() => router.push(dairyHomeShortcut.route)}
            />
          )}
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

        {shouldShowViticultureComplianceGaps(
          dashboardData,
          unlinkedCounts,
          dashboardModulesResolved,
        ) && (
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

        {isViticultureActive && winegbPendingCount > 0 && (
          <>
            <SectionHeader title="WineGB Surveys" />
            <WinegbSurveyNudge pendingCount={winegbPendingCount} />
          </>
        )}

        {isOrganicActive && (fpInputDerogAlerts.length > 0 || fpDerogAlerts.length > 0) && (
          <>
            <SectionHeader title="Upcoming Alerts" />
            {fpInputDerogAlerts.map((alert) => (
              <Pressable
                key={alert.id}
                style={[
                  styles.unlinkedBanner,
                  alert.isOverdue ? styles.alertBannerRed : styles.alertBannerAmber,
                ]}
                onPress={() => router.push("/organic-fp-inputs-list")}
              >
                <View style={[
                  styles.unlinkedIconWrap,
                  { backgroundColor: (alert.isOverdue ? colors.error : colors.warning) + "22" },
                ]}>
                  <Feather
                    name="alert-triangle"
                    size={18}
                    color={alert.isOverdue ? colors.error : colors.warning}
                  />
                </View>
                <View style={styles.unlinkedContent}>
                  <Text style={styles.unlinkedTitle}>{alert.title}</Text>
                  <Text style={[styles.unlinkedSubtitle, alert.isOverdue && { color: colors.error }]}>
                    {alert.dueDate
                      ? `${alert.isOverdue ? "Expired" : "Expires"} ${new Date(alert.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · Tap to review FP input log`
                      : "Tap to review FP input log"}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </Pressable>
            ))}
            {fpDerogAlerts.map((alert) => (
              <Pressable
                key={alert.id}
                style={[
                  styles.unlinkedBanner,
                  alert.isOverdue ? styles.alertBannerRed : styles.alertBannerAmber,
                ]}
                onPress={() => router.push("/organic-fp-derogations")}
              >
                <View style={[
                  styles.unlinkedIconWrap,
                  { backgroundColor: (alert.isOverdue ? colors.error : colors.warning) + "22" },
                ]}>
                  <Feather
                    name="alert-triangle"
                    size={18}
                    color={alert.isOverdue ? colors.error : colors.warning}
                  />
                </View>
                <View style={styles.unlinkedContent}>
                  <Text style={styles.unlinkedTitle}>{alert.title}</Text>
                  <Text style={styles.unlinkedSubtitle}>Tap to review FP derogations</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </Pressable>
            ))}
          </>
        )}

        {isOrganicActive && upcomingInspections.length > 0 && (
          <>
            <SectionHeader title="Organic Inspections" />
            {upcomingInspections.map((inspection) => (
              <Pressable
                key={inspection.id}
                style={[
                  styles.unlinkedBanner,
                  inspection.isOverdue ? styles.alertBannerRed : styles.alertBannerAmber,
                ]}
                onPress={() => router.push("/organic-overview")}
              >
                <View style={[
                  styles.unlinkedIconWrap,
                  { backgroundColor: (inspection.isOverdue ? colors.error : colors.warning) + "22" },
                ]}>
                  <Feather
                    name="clipboard"
                    size={18}
                    color={inspection.isOverdue ? colors.error : colors.warning}
                  />
                </View>
                <View style={styles.unlinkedContent}>
                  <Text style={styles.unlinkedTitle}>{inspection.certifier}</Text>
                  <Text style={[styles.unlinkedSubtitle, inspection.isOverdue && { color: colors.error }]}>
                    {inspection.isOverdue ? "Overdue — was due " : "Due "}
                    {new Date(inspection.nextDueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </Pressable>
            ))}
          </>
        )}

        {upcomingMilestones.length > 0 && (
          <>
            <SectionHeader title="Grant Milestones" />
            {upcomingMilestones.map((ms) => (
              <View
                key={ms.id}
                style={[
                  styles.unlinkedBanner,
                  styles.milestoneBannerWrap,
                  ms.isOverdue ? styles.alertBannerRed : styles.milestoneBanner,
                ]}
              >
                <Pressable
                  style={styles.milestoneCardBody}
                  onPress={() => router.push("/agri-env-projects")}
                >
                  <View style={[
                    styles.unlinkedIconWrap,
                    { backgroundColor: ms.isOverdue ? "#DC262622" : "#0D948822" },
                  ]}>
                    <Feather
                      name="flag"
                      size={18}
                      color={ms.isOverdue ? "#DC2626" : "#0D9488"}
                    />
                  </View>
                  <View style={styles.unlinkedContent}>
                    <Text style={styles.unlinkedTitle}>{ms.milestoneName}</Text>
                    <Text style={[styles.unlinkedSubtitle, ms.isOverdue && { color: "#DC2626" }]}>
                      {ms.schemeName
                        ? `${ms.schemeName} · `
                        : ""}
                      {ms.isOverdue ? "Overdue — was due " : "Due "}
                      {new Date(`${ms.dueDate.slice(0, 10)}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </Text>
                    <Text style={styles.milestoneStatusLine}>
                      Status: {formatAgriEnvMilestoneStatus(ms.status)}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  style={styles.milestoneCompleteBtn}
                  onPress={() => {
                    setCompletionDate(new Date());
                    setEvidenceNote("");
                    setCompletionSummary(null);
                    setMarkCompleteTarget({ id: ms.id, projectId: ms.projectId, milestoneName: ms.milestoneName });
                  }}
                >
                  <Feather name="check-circle" size={14} color="#0D9488" />
                  <Text style={styles.milestoneCompleteBtnText}>Mark complete</Text>
                </Pressable>
              </View>
            ))}
          </>
        )}

        {pastMilestones.length > 0 && (
          <>
            <SectionHeader title="Past milestones" />
            {pastMilestones.map((ms) => (
              <Pressable
                key={ms.id}
                style={[styles.unlinkedBanner, styles.pastMilestoneBanner]}
                onPress={() => router.push("/agri-env-projects")}
                accessibilityRole="button"
                accessibilityLabel={`${ms.schemeName}, ${ms.milestoneName}, due ${new Date(`${ms.dueDate.slice(0, 10)}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}, status ${formatAgriEnvMilestoneStatus(ms.status)}. Open agri-environment grants.`}
              >
                <View style={styles.unlinkedIconWrap}>
                  <Feather name="check-circle" size={18} color={colors.textSecondary} />
                </View>
                <View style={styles.unlinkedContent}>
                  <Text style={styles.unlinkedTitle}>{ms.milestoneName}</Text>
                  <Text style={styles.unlinkedSubtitle}>
                    {ms.schemeName ? `${ms.schemeName} · ` : ""}
                    Due {new Date(`${ms.dueDate.slice(0, 10)}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </Text>
                  <Text style={styles.milestoneStatusLine}>
                    Status: {formatAgriEnvMilestoneStatus(ms.status)}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.textSecondary} />
              </Pressable>
            ))}
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

      {/* Mark Complete sheet */}
      <Modal
        visible={!!markCompleteTarget}
        transparent
        animationType="slide"
        onRequestClose={() => setMarkCompleteTarget(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.mcOverlay}
        >
          <Pressable style={styles.mcBackdrop} onPress={() => setMarkCompleteTarget(null)} />
          <View style={styles.mcSheet}>
            <View style={styles.mcHandle} />

            <View style={styles.mcIconRow}>
              <View style={styles.mcIconBg}>
                <Feather name="check-circle" size={20} color="#0D9488" />
              </View>
              <Text style={styles.mcHeading}>Mark Milestone Complete</Text>
            </View>

            {markCompleteTarget && (
              <Text style={styles.mcMilestoneName} numberOfLines={2}>
                {markCompleteTarget.milestoneName}
              </Text>
            )}

            <Text style={styles.mcLabel}>Completion date</Text>
            {Platform.OS === "android" ? (
              <Pressable
                style={styles.mcDateBtn}
                onPress={() =>
                  DateTimePickerAndroid.open({
                    value: completionDate,
                    mode: "date",
                    maximumDate: new Date(),
                    onChange: (_event: DateTimePickerEvent, d?: Date) => {
                      if (d) setCompletionDate(d);
                    },
                  })
                }
              >
                <Feather name="calendar" size={14} color={colors.primary} />
                <Text style={styles.mcDateBtnText}>
                  {completionDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </Text>
              </Pressable>
            ) : (
              <DateTimePicker
                value={completionDate}
                mode="date"
                display="compact"
                maximumDate={new Date()}
                onChange={(_event: DateTimePickerEvent, d?: Date) => {
                  if (d) setCompletionDate(d);
                }}
                style={{ alignSelf: "flex-start", marginBottom: spacing.md }}
              />
            )}

            <Text style={styles.mcLabel}>Evidence note (optional)</Text>
            <TextInput
              style={styles.mcTextInput}
              value={evidenceNote}
              onChangeText={setEvidenceNote}
              placeholder="e.g. hedgerow planted, CAMS submitted…"
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              autoCapitalize="sentences"
            />

            <View style={styles.mcActions}>
              <Pressable
                style={styles.mcCancelBtn}
                onPress={() => setMarkCompleteTarget(null)}
                disabled={isMarkingComplete}
              >
                <Text style={styles.mcCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.mcConfirmBtn, isMarkingComplete && styles.mcConfirmDisabled]}
                onPress={handleMarkComplete}
                disabled={isMarkingComplete}
              >
                {isMarkingComplete ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Feather name="check" size={15} color="#fff" />
                    <Text style={styles.mcConfirmText}>Confirm</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Successful completion summary */}
      <Modal
        visible={!!completionSummary}
        transparent
        animationType="slide"
        onRequestClose={() => setCompletionSummary(null)}
      >
        <View style={styles.mcOverlay}>
          <Pressable style={styles.mcBackdrop} onPress={() => setCompletionSummary(null)} />
          <View style={styles.mcSheet}>
            <View style={styles.mcHandle} />
            <View style={styles.mcIconRow}>
              <View style={styles.mcIconBg}>
                <Feather name="check-circle" size={20} color="#0D9488" />
              </View>
              <Text style={styles.mcHeading}>
                {completionSummary?.alreadyPaid ? "Milestone already paid" : "Milestone complete"}
              </Text>
            </View>

            {completionSummary && (
              <>
                <Text style={styles.mcMilestoneName} numberOfLines={2}>
                  {completionSummary.milestoneName}
                </Text>
                {completionSummary.claimAmountPence != null && (
                  <View style={styles.mcSummaryHighlight}>
                    <Text style={styles.mcSummaryLabel}>This milestone</Text>
                    <Text style={styles.mcSummaryAmount}>
                      {formatPence(completionSummary.claimAmountPence)} claim value
                    </Text>
                  </View>
                )}
                {completionSummary.milestoneCount != null &&
                  completionSummary.completedMilestoneCount != null &&
                  completionSummary.claimedAmountPence != null && (
                    <View style={styles.mcSummaryCard}>
                      <Text style={styles.mcSummaryTitle}>Project progress</Text>
                      {completionSummary.totalsAreCached && (
                        <Text style={styles.mcCachedLabel}>Offline · cached totals</Text>
                      )}
                      <Text style={styles.mcSummaryProgress}>
                        {completionSummary.completedMilestoneCount} of {completionSummary.milestoneCount} milestones complete
                      </Text>
                      <View style={styles.mcSummaryTotals}>
                        <View style={styles.mcSummaryTotalItem}>
                          <Text style={styles.mcSummaryLabel}>Claimed</Text>
                          <Text style={styles.mcSummaryValue}>
                            {formatPence(completionSummary.claimedAmountPence)}
                          </Text>
                        </View>
                        {completionSummary.remainingGrantValuePence != null && (
                          <View style={styles.mcSummaryTotalItem}>
                            <Text style={styles.mcSummaryLabel}>Remaining</Text>
                            <Text style={styles.mcSummaryValue}>
                              {formatPence(completionSummary.remainingGrantValuePence)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}
                <Pressable
                  style={styles.mcDoneBtn}
                  onPress={() => setCompletionSummary(null)}
                >
                  <Text style={styles.mcConfirmText}>Done</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function formatPence(pence: number): string {
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 0 })}`;
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
  dashboardErrorBanner: {
    marginTop: spacing.sm,
    backgroundColor: colors.error + "10",
    borderColor: colors.error + "55",
  },
  dashboardRetryText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.primary,
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
  alertBannerRed: {
    backgroundColor: "#FEF2F2",
    borderColor: "#DC262655",
  },
  alertBannerAmber: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warning + "55",
  },
  milestoneBanner: {
    backgroundColor: "#F0FDFA",
    borderColor: "#0D948855",
  },
  milestoneBannerWrap: {
    flexDirection: "column",
    paddingBottom: spacing.sm,
    gap: 0,
  },
  milestoneCardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  milestoneCompleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: "#0D948818",
    marginTop: spacing.xs,
  },
  milestoneCompleteBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: "#0D9488",
  },
  milestoneStatusLine: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 3,
  },
  pastMilestoneBanner: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  // Mark Complete sheet
  mcOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  mcBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  mcSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 16,
    paddingTop: spacing.md,
  },
  mcHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  mcIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  mcIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#0D948815",
    alignItems: "center",
    justifyContent: "center",
  },
  mcHeading: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  mcMilestoneName: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  mcLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  mcDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background ?? "#fafafa",
    marginBottom: spacing.md,
    alignSelf: "flex-start",
  },
  mcDateBtnText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
  },
  mcTextInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.background ?? "#fafafa",
    marginBottom: spacing.lg,
    minHeight: 72,
  },
  mcActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  mcCancelBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  mcCancelText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  mcConfirmBtn: {
    flex: 2,
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: 10,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
  },
  mcConfirmDisabled: {
    opacity: 0.6,
  },
  mcConfirmText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: "#fff",
  },
  mcDoneBtn: {
    padding: spacing.md,
    borderRadius: 10,
    backgroundColor: "#0D9488",
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  mcSummaryHighlight: {
    backgroundColor: "#F0FDFA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#99F6E455",
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  mcSummaryCard: {
    backgroundColor: colors.background ?? "#fafafa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
  },
  mcSummaryTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  mcCachedLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  mcSummaryProgress: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  mcSummaryTotals: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  mcSummaryTotalItem: {
    flex: 1,
  },
  mcSummaryLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  mcSummaryAmount: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: "#0D9488",
  },
  mcSummaryValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
});
