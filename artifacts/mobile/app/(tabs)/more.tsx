import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { APP_VERSION_FULL } from "@/constants/version";
import { ListItem } from "@/components/ui/ListItem";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useAuth } from "@/lib/auth";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiModules } from "@/lib/hooks/useApiModules";
import { getItem, removeItem, STORAGE_KEYS } from "@/lib/storage";
import { getApiBase } from "@/lib/uploadPhoto";
import * as Location from "expo-location";

type LisStatus = {
  configured: boolean;
  sandboxMode?: boolean;
  testStatus?: string | null;
  testMessage?: string | null;
  lastTestedAt?: string | null;
  lisLastSyncedAt?: string | null;
  lisLastSyncSummary?: string | null;
} | null;

async function lisApiFetch(path: string, method = "GET"): Promise<Response> {
  const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${getApiBase()}${path}`, { method, headers });
}

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, farms, setCurrentFarm, user } = useFarm();
  const { logout } = useAuth();
  const { pendingCount, isSyncing, isConnected, lastSyncTime, triggerSync } = useSync();
  const { activeModuleKeys } = useApiModules(currentFarm?.id);

  const [lisStatus, setLisStatus] = useState<LisStatus>(null);
  const [lisSyncing, setLisSyncing] = useState(false);
  const [lisInboundCount, setLisInboundCount] = useState(0);

  // ── Location sharing ────────────────────────────────────────────────────────
  const [isSharing, setIsSharing] = useState(false);
  const [sharingLastPing, setSharingLastPing] = useState<Date | null>(null);
  const sharingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shiftStartRef = useRef<Date | null>(null);

  async function postLocationPing(sharing: boolean): Promise<void> {
    if (!currentFarm?.id) return;
    const token = await getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const slug = (currentFarm as any).tenantSlug || (currentFarm as any).slug || "";
    if (slug) headers["x-tenant-slug"] = slug;
    const name = (user as any)?.fullName || (user as any)?.firstName || "Unknown";
    const body: Record<string, unknown> = { isSharing: sharing, userName: name };
    if (sharing) {
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      body.latitude = pos.coords.latitude;
      body.longitude = pos.coords.longitude;
      body.accuracyM = pos.coords.accuracy;
      body.shiftStartedAt = shiftStartRef.current?.toISOString();
    }
    await fetch(`${getApiBase()}/api/farms/${currentFarm.id}/staff-location-ping`, {
      method: "POST", headers, body: JSON.stringify(body),
    });
  }

  useEffect(() => {
    if (!isSharing) {
      if (sharingIntervalRef.current) { clearInterval(sharingIntervalRef.current); sharingIntervalRef.current = null; }
      postLocationPing(false).catch(() => {});
      return;
    }
    shiftStartRef.current = new Date();
    postLocationPing(true).then(() => setSharingLastPing(new Date())).catch(() => {});
    sharingIntervalRef.current = setInterval(() => {
      postLocationPing(true).then(() => setSharingLastPing(new Date())).catch(() => {});
    }, 30_000);
    return () => { if (sharingIntervalRef.current) { clearInterval(sharingIntervalRef.current); sharingIntervalRef.current = null; } };
  }, [isSharing, currentFarm?.id]);

  async function toggleSharing(value: boolean): Promise<void> {
    if (value) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Location permission is needed to share your position with the farm dashboard.");
        return;
      }
    }
    setIsSharing(value);
  }

  useEffect(() => {
    if (!currentFarm?.id) return;
    setLisStatus(null);
    setLisInboundCount(0);
    lisApiFetch(`/api/farms/${currentFarm.id}/lis-credentials`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setLisStatus(data as LisStatus); })
      .catch(() => {});
    lisApiFetch(`/api/farms/${currentFarm.id}/lis-inbound-movements`)
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => { if (Array.isArray(data)) setLisInboundCount(data.length); })
      .catch(() => {});
  }, [currentFarm?.id]);

  const handleLisSync = async () => {
    if (!currentFarm?.id || lisSyncing) return;
    setLisSyncing(true);
    try {
      const res = await lisApiFetch(`/api/farms/${currentFarm.id}/lis/sync-herds`, "POST");
      const data = await res.json() as { success?: boolean; message?: string; cphValid?: boolean; cphNumber?: string };
      if (res.ok && data.success) {
        setLisStatus(prev => prev ? {
          ...prev,
          lisLastSyncedAt: new Date().toISOString(),
          lisLastSyncSummary: data.message ?? null,
        } : prev);
        Alert.alert(
          "LIS Sync Complete",
          [
            data.cphNumber ? `CPH ${data.cphNumber} — ${data.cphValid ? "registered in LIS ✓" : "not recognised by LIS"}` : null,
            data.message ?? "Sync completed.",
          ].filter(Boolean).join("\n"),
        );
      } else {
        Alert.alert("LIS Sync Failed", (data as any)?.message ?? "Unable to reach LIS. Check your connection and credentials in Farm Settings on the dashboard.");
      }
    } catch {
      Alert.alert("LIS Sync Error", "Network error — please check your internet connection and try again.");
    } finally {
      setLisSyncing(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "User"}</Text>
            <Text style={styles.profileEmail}>{user?.email || ""}</Text>
          </View>
        </View>

        <SectionHeader title="Farm" />
        <View style={styles.section}>
          <ListItem
            title="Current Farm"
            subtitle={currentFarm?.name || "None selected"}
            icon="map-pin"
            iconColor={colors.primary}
            onPress={() => {
              if (farms.length <= 1) return;
              Alert.alert(
                "Switch Farm",
                "Select the farm to manage:",
                farms.map((f) => ({
                  text: f.name,
                  onPress: () => setCurrentFarm(f),
                })),
              );
            }}
          />
          <View style={styles.divider} />
          <ListItem
            title="Sectors"
            subtitle={
              [
                currentFarm?.sectorArable && "Arable",
                currentFarm?.sectorBeef && "Beef",
                currentFarm?.sectorDairy && "Dairy",
                currentFarm?.sectorPigs && "Pigs",
                currentFarm?.sectorPoultry && "Poultry",
              ]
                .filter(Boolean)
                .join(", ") || "None"
            }
            icon="grid"
            showChevron={false}
          />
        </View>

        <SectionHeader title="Sync" />
        <View style={styles.section}>
          <ListItem
            title="Sync Status"
            subtitle={
              isSyncing
                ? "Syncing..."
                : pendingCount > 0
                  ? `${pendingCount} record${pendingCount === 1 ? "" : "s"} pending — tap to view`
                  : "All records synced"
            }
            icon="refresh-cw"
            iconColor={pendingCount > 0 ? colors.accent : colors.success}
            iconBgColor={pendingCount > 0 ? colors.warningBg : colors.successBg}
            onPress={() => router.push("/sync-status")}
            rightElement={
              pendingCount > 0 ? (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>{pendingCount}</Text>
                </View>
              ) : undefined
            }
          />
          <View style={styles.divider} />
          <ListItem
            title="Sync Now"
            subtitle={
              lastSyncTime
                ? `Last synced ${new Date(lastSyncTime).toLocaleString("en-GB")}`
                : "Never synced"
            }
            icon="upload-cloud"
            iconColor={colors.primary}
            iconBgColor={colors.primary ?? colors.primary + "15"}
            onPress={triggerSync}
            showChevron={false}
          />
          <View style={styles.divider} />
          <ListItem
            title="Last Synced"
            subtitle={
              lastSyncTime
                ? new Date(lastSyncTime).toLocaleString("en-GB")
                : "Never"
            }
            icon="clock"
            showChevron={false}
          />
        </View>

        <SectionHeader title="Location Sharing" />
        <View style={styles.section}>
          <View style={[styles.listItemRow, { justifyContent: "space-between", alignItems: "center" }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>Share My Location</Text>
              <Text style={styles.locationSubtitle}>
                {isSharing
                  ? sharingLastPing
                    ? `Active · last ping ${sharingLastPing.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
                    : "Starting…"
                  : "Off · your position is not visible to others"}
              </Text>
            </View>
            <Switch
              value={isSharing}
              onValueChange={toggleSharing}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={"#fff"}
            />
          </View>
          {isSharing && (
            <>
              <View style={styles.divider} />
              <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
                <Text style={styles.locationNote}>
                  Your GPS position is sent to the farm dashboard every 30 seconds while this is on. Turn off or close the app to stop sharing.
                </Text>
              </View>
            </>
          )}
        </View>

        <SectionHeader title="Livestock Integration (LIS)" />
        <View style={styles.section}>
          <ListItem
            title="Connection Status"
            subtitle={
              lisStatus === null
                ? "Checking…"
                : !lisStatus.configured
                ? "Not configured — set up LIS credentials in Farm Settings on the dashboard"
                : lisStatus.testStatus === "ok"
                ? `Connected${lisStatus.sandboxMode ? " (sandbox)" : " (live)"} — CPH verified`
                : "Configured — connection not yet tested"
            }
            icon="shield"
            iconColor={lisStatus?.configured && lisStatus?.testStatus === "ok" ? colors.success : colors.textSecondary}
            iconBgColor={lisStatus?.configured && lisStatus?.testStatus === "ok" ? colors.successBg : "#f3f4f6"}
            showChevron={false}
          />
          <View style={styles.divider} />
          <ListItem
            title="Last LIS Sync"
            subtitle={
              lisStatus?.lisLastSyncedAt
                ? `${new Date(lisStatus.lisLastSyncedAt).toLocaleString("en-GB")}${lisStatus.lisLastSyncSummary ? ` — ${lisStatus.lisLastSyncSummary}` : ""}`
                : "Not yet synced"
            }
            icon="refresh-cw"
            iconColor={lisStatus?.lisLastSyncedAt ? colors.info : colors.textSecondary}
            iconBgColor={lisStatus?.lisLastSyncedAt ? "#eff6ff" : "#f3f4f6"}
            showChevron={false}
          />
          <View style={styles.divider} />
          <ListItem
            title={lisSyncing ? "Syncing with LIS…" : "Sync with LIS"}
            subtitle={
              !lisStatus?.configured
                ? "Configure LIS credentials on the dashboard first"
                : "Pull latest approved movements and CPH status from the CLA API"
            }
            icon="download-cloud"
            iconColor={lisStatus?.configured ? "#2563eb" : colors.textSecondary}
            iconBgColor={lisStatus?.configured ? "#eff6ff" : "#f3f4f6"}
            onPress={lisStatus?.configured ? handleLisSync : undefined}
            showChevron={lisStatus?.configured ?? false}
            rightElement={lisSyncing ? (
              <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#2563eb", borderTopColor: "transparent" }} />
            ) : undefined}
          />
          {lisInboundCount > 0 && (
            <>
              <View style={styles.divider} />
              <ListItem
                title={`${lisInboundCount} Inbound Movement${lisInboundCount !== 1 ? "s" : ""} Pending Review`}
                subtitle="Tap to view in Livestock Movements history — use the Review button on each item"
                icon="inbox"
                iconColor="#92400e"
                iconBgColor="#fef3c7"
                onPress={() => router.push("/history-movements")}
              />
            </>
          )}
        </View>

        <SectionHeader title="Tasks" />
        <View style={styles.section}>
          <ListItem
            title="My Task Inbox"
            subtitle="View and complete tasks assigned to you"
            icon="check-square"
            iconColor="#22c55e"
            iconBgColor="#f0fdf4"
            onPress={() => router.push("/task-inbox")}
          />
        </View>

        {(activeModuleKeys.includes("livestock-management") || activeModuleKeys.includes("sprays-inputs")) && (
          <>
            <SectionHeader title="Records History" />
            <View style={styles.section}>
              {activeModuleKeys.includes("sprays-inputs") && (
                <>
                  <ListItem
                    title="Spray Applications"
                    subtitle="Full spray diary — filter by year, search by product or field"
                    icon="droplet"
                    iconColor="#0891b2"
                    iconBgColor="#e0f2fe"
                    onPress={() => router.push("/history-spray")}
                  />
                  {activeModuleKeys.includes("livestock-management") && <View style={styles.divider} />}
                </>
              )}
              {activeModuleKeys.includes("livestock-management") && (
                <>
                  <ListItem
                    title="Medicine Records"
                    subtitle="Treatment history with withdrawal period status"
                    icon="thermometer"
                    iconColor="#dc2626"
                    iconBgColor="#fee2e2"
                    onPress={() => router.push("/history-medicine")}
                  />
                  <View style={styles.divider} />
                  <ListItem
                    title="Livestock Movements"
                    subtitle="On/off movements — filter by year or movement type"
                    icon="shuffle"
                    iconColor="#7c3aed"
                    iconBgColor="#ede9fe"
                    onPress={() => router.push("/history-movements")}
                  />
                  <View style={styles.divider} />
                  <ListItem
                    title="TB Test Records"
                    subtitle="Test results, reactor counts and restriction status"
                    icon="activity"
                    iconColor="#d97706"
                    iconBgColor="#fef3c7"
                    onPress={() => router.push("/history-tb-tests")}
                  />
                  <View style={styles.divider} />
                  <ListItem
                    title="Mortality Records"
                    subtitle="3-year legal register — BCMS notification status"
                    icon="file-text"
                    iconColor="#374151"
                    iconBgColor="#f3f4f6"
                    onPress={() => router.push("/history-mortality")}
                  />
                </>
              )}
            </View>
          </>
        )}

        {activeModuleKeys.includes("stock-suppliers") && (
          <>
            <SectionHeader title="Trade Contacts & Stock" />
            <View style={styles.section}>
              <ListItem
                title="Purchase Orders"
                subtitle="View and manage orders by status — Outstanding, Awaiting Approval, Sent, Received"
                icon="shopping-cart"
                iconColor="#059669"
                iconBgColor="#ecfdf5"
                onPress={() => router.push("/purchase-orders")}
              />
              <View style={styles.divider} />
              <ListItem
                title="Raise Purchase Order"
                subtitle="Create a new order for a supplier with line items and estimated value"
                icon="plus-circle"
                iconColor="#0891b2"
                iconBgColor="#e0f2fe"
                onPress={() => router.push("/raise-purchase-order")}
              />
            </View>
          </>
        )}

        {activeModuleKeys.includes("organic-compliance") && (
          <>
            <SectionHeader title="Organic Compliance" />
            <View style={styles.section}>
              <ListItem
                title="Organic Overview"
                subtitle="Certification status, inspections and input register"
                icon="sun"
                iconColor="#16a34a"
                iconBgColor="#f0fdf4"
                onPress={() => router.push("/organic-overview")}
              />
              <View style={styles.divider} />
              <ListItem
                title="Record Inspection Visit"
                subtitle="Log an organic certifier inspection"
                icon="shield"
                iconColor="#16a34a"
                iconBgColor="#f0fdf4"
                onPress={() => router.push("/organic-inspection")}
              />
              <View style={styles.divider} />
              <ListItem
                title="Log Organic Input"
                subtitle="Add to the organic input register"
                icon="package"
                iconColor="#2563eb"
                iconBgColor="#eff6ff"
                onPress={() => router.push("/organic-input")}
              />
            </View>
          </>
        )}

        {activeModuleKeys.includes("organic-arable") && (
          <>
            <SectionHeader title="Organic Arable" />
            <View style={styles.section}>
              <ListItem
                title="Organic Arable Overview"
                subtitle="Certification, conversion, seed sourcing and harvest summary"
                icon="sun"
                iconColor="#16a34a"
                iconBgColor="#f0fdf4"
                onPress={() => router.push("/organic-arable-overview")}
              />
              <View style={styles.divider} />
              <ListItem
                title="Log Arable Input"
                subtitle="Record fertiliser, amendment or crop protection applied"
                icon="package"
                iconColor="#2563eb"
                iconBgColor="#eff6ff"
                onPress={() => router.push("/organic-arable-input")}
              />
              <View style={styles.divider} />
              <ListItem
                title="Log Seed Purchase"
                subtitle="Organic certified or derogation seed record"
                icon="box"
                iconColor="#7c3aed"
                iconBgColor="#f5f3ff"
                onPress={() => router.push("/organic-arable-seed")}
              />
              <View style={styles.divider} />
              <ListItem
                title="Log Seed Stock Movement"
                subtitle="Goods in, seed used, adjustment or waste"
                icon="layers"
                iconColor="#0891b2"
                iconBgColor="#ecfeff"
                onPress={() => router.push("/organic-arable-stock-movement")}
              />
              <View style={styles.divider} />
              <ListItem
                title="Log Harvest"
                subtitle="Record harvest yield and organic status"
                icon="truck"
                iconColor="#d97706"
                iconBgColor="#fffbeb"
                onPress={() => router.push("/organic-arable-harvest")}
              />
            </View>
          </>
        )}

        {(activeModuleKeys.includes("carbon-sustainability") || activeModuleKeys.includes("environmental")) && (
          <>
            <SectionHeader title="Carbon & Sustainability" />
            <View style={styles.section}>
              <ListItem
                title="GHG Emission Entry"
                subtitle="Record emission sources using DEFRA 2024 factors — fuels, livestock, fertilisers, transport"
                icon="zap"
                iconColor="#d97706"
                iconBgColor="#fef3c7"
                onPress={() => router.push("/carbon-entry")}
              />
              <View style={styles.divider} />
              <ListItem
                title="Carbon Audit Record"
                subtitle="Log a formal farm carbon audit with Scope 1, 2 and 3 tCO₂e figures"
                icon="clipboard"
                iconColor="#0369a1"
                iconBgColor="#e0f2fe"
                onPress={() => router.push("/carbon-audit")}
              />
              <View style={styles.divider} />
              <ListItem
                title="Carbon Sequestration"
                subtitle="Record woodland, hedgerow, peatland and other sequestering habitats"
                icon="wind"
                iconColor="#16a34a"
                iconBgColor="#dcfce7"
                onPress={() => router.push("/carbon-sequestration")}
              />
              <View style={styles.divider} />
              <ListItem
                title="Carbon Reduction Action"
                subtitle="Log a planned or in-progress action to cut farm emissions"
                icon="trending-down"
                iconColor="#059669"
                iconBgColor="#d1fae5"
                onPress={() => router.push("/carbon-reduction-action")}
              />
              <View style={styles.divider} />
              <ListItem
                title="Biodiversity Net Gain (BNG)"
                subtitle="Log BNG habitat records with Defra Metric 4.0 unit calculations"
                icon="feather"
                iconColor="#7c3aed"
                iconBgColor="#f3e8ff"
                onPress={() => router.push("/bng-record")}
              />
            </View>
          </>
        )}

        <SectionHeader title="Equipment" />
        <View style={styles.section}>
          <ListItem
            title="RFID Reader"
            subtitle="Bluetooth ear tag scanning for cattle, sheep & goats"
            icon="bluetooth"
            iconColor="#2563eb"
            iconBgColor="#dbeafe"
            onPress={() => router.push("/rfid-settings")}
          />
        </View>

        <SectionHeader title="App" />
        <View style={styles.section}>
          <ListItem
            title="Help Centre"
            subtitle="Guides, FAQs and how-to articles"
            icon="help-circle"
            iconColor="#0369a1"
            iconBgColor="#e0f2fe"
            onPress={() => router.push("/help")}
          />
          <View style={styles.divider} />
          <ListItem
            title="Offline Mode"
            subtitle="Records stored locally in SQLite until synced"
            icon="wifi-off"
            showChevron={false}
          />
          <View style={styles.divider} />
          <ListItem
            title="Connection Status"
            subtitle={isConnected ? "Online" : "Offline"}
            icon={isConnected ? "wifi" : "wifi-off"}
            iconColor={isConnected ? colors.success : colors.textTertiary}
            iconBgColor={isConnected ? colors.successBg : colors.borderLight}
            showChevron={false}
          />
          <View style={styles.divider} />
          <ListItem
            title="About BDE Farm Trac"
            subtitle={`v${APP_VERSION_FULL}`}
            icon="info"
            showChevron={false}
          />
        </View>

        <SectionHeader title="Account" />
        <View style={styles.section}>
          <ListItem
            title="Sign Out"
            subtitle="Log out of your account"
            icon="log-out"
            iconColor={colors.error}
            iconBgColor={colors.errorBg}
            onPress={() => {
              Alert.alert(
                "Sign Out",
                "Are you sure you want to sign out? Unsynced records will be kept on this device.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                      await logout();
                      await removeItem(STORAGE_KEYS.AUTH_STATE);
                      await removeItem(STORAGE_KEYS.AUTH_TOKEN);
                      router.replace("/login");
                    },
                  },
                ],
              );
            }}
          />
        </View>

        <View style={styles.footer}>
          <Feather name="shield" size={20} color={colors.primaryMuted} />
          <Text style={styles.footerText}>Red Tractor Compliance Platform</Text>
          <Text style={styles.footerSubtext}>bdefarmtrac.co.uk</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.text,
  },
  scrollContent: {},
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.textInverse,
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  profileEmail: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: spacing.lg + 36 + spacing.md,
  },
  pendingBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  pendingBadgeText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    color: colors.textInverse,
  },
  footer: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    gap: spacing.xs,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  footerSubtext: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },
  listItemRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  locationTitle: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
  },
  locationSubtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  locationNote: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
