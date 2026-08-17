import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { APP_VERSION_FULL as VERSION_FALLBACK } from "@/constants/version";
import { Input } from "@/components/ui/Input";
import { ListItem } from "@/components/ui/ListItem";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useAuth } from "@/lib/auth";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { apiFetch } from "@/lib/apiFetch";
import { useApiModules } from "@/lib/hooks/useApiModules";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { identifierJustSavedKey } from "@/lib/hooks/useFarmIdentifiers";
import { getItem, removeItem, STORAGE_KEYS } from "@/lib/storage";
import { getApiBase } from "@/lib/uploadPhoto";
import * as Location from "expo-location";

const SMS_CATEGORIES: ReadonlyArray<{
  key: string;
  label: string;
  description: string;
  moduleGates: ReadonlyArray<string>;
}> = [
  {
    key: "livestock",
    label: "Livestock & Animals",
    description: "Welfare alerts, withdrawal breaches, notifiable disease, herd health follow-ups.",
    moduleGates: [
      "livestock-management", "livestock",
      "beef-production", "sheep-production", "goat-production", "venison-production",
      "pig-production", "poultry-production",
      "organic-livestock",
    ],
  },
  {
    key: "dairy",
    label: "Dairy",
    description: "ABR test results, mastitis records, mobility scoring alerts.",
    moduleGates: [
      "dairy-management",
      "sheep-dairy", "goat-dairy",
      "organic-dairy", "organic-sheep-dairy", "organic-goat-dairy",
    ],
  },
  {
    key: "arable",
    label: "Arable & Crops",
    description: "IPM pest/disease threshold alerts, irrigation advisories, field scouting flags.",
    moduleGates: [
      "field-crop-management", "crop-management",
      "fresh-produce", "organic-fresh-produce",
      "water-irrigation",
      "organic-arable",
    ],
  },
  {
    key: "viticulture",
    label: "Viticulture & Winery",
    description: "Vineyard and winery compliance alerts.",
    moduleGates: ["viticulture"],
  },
  {
    key: "tasks",
    label: "Task Assignments & Reminders",
    description: "Notifications when tasks are assigned to you, and timesheet submission reminders.",
    moduleGates: [],
  },
  {
    key: "regulatory",
    label: "Regulatory Compliance",
    description: "Withdrawal period breaches, biosecurity declarations, SSAFO inspections, RIDDOR incidents.",
    moduleGates: [],
  },
  {
    key: "quality",
    label: "Quality & Non-conformances",
    description: "Non-conformance records, corrective actions, feed intake rejections.",
    moduleGates: [],
  },
  {
    key: "stock",
    label: "Stock & Supplies",
    description: "Stock-low and stock-out alerts across feed, medicines, and supplies.",
    moduleGates: [],
  },
];

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
  const { currentFarm, farms, setCurrentFarm, updateFarm, user } = useFarm();
  const { logout } = useAuth();
  const { pendingCount, isSyncing, isConnected, lastSyncTime, triggerSync } = useSync();
  const { activeModuleKeys } = useApiModules(currentFarm?.id);

  const { farmName, contactPhone, cphNumber, sbiNumber, address, postcode, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);

  // Farm Profile edit state
  const [farmNameDraft, setFarmNameDraft] = useState("");
  const [phoneDraft, setPhoneDraft] = useState("");
  const [cphDraft, setCphDraft] = useState("");
  const [sbiDraft, setSbiDraft] = useState("");
  const [addressDraft, setAddressDraft] = useState("");
  const [postcodeDraft, setPostcodeDraft] = useState("");
  const [postcodeBlurred, setPostcodeBlurred] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  // UK postcode: one or two alpha chars, one digit, optional alpha/digit, optional space, one digit, two alpha chars
  const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/i;

  /** Uppercase and insert the missing space before the 3-char inward code. */
  function normalisePostcode(raw: string): string {
    const v = raw.trim().toUpperCase().replace(/\s+/g, "");
    if (v.length >= 4) return v.slice(0, -3) + " " + v.slice(-3);
    return raw.trim().toUpperCase();
  }

  const postcodeVal = postcodeDraft.trim();
  const showPostcodeWarning =
    postcodeBlurred &&
    postcodeVal.length > 0 &&
    !UK_POSTCODE_RE.test(postcodeVal);

  // Keep draft values in sync when identifier data loads
  useEffect(() => {
    setFarmNameDraft(farmName ?? "");
    setPhoneDraft(contactPhone ?? "");
    setCphDraft(cphNumber ?? "");
    setSbiDraft(sbiNumber ?? "");
    setAddressDraft(address ?? "");
    setPostcodeDraft(postcode ?? "");
    setPostcodeBlurred(false);
  }, [farmName, contactPhone, cphNumber, sbiNumber, address, postcode]);

  async function saveProfile(): Promise<void> {
    if (!currentFarm?.id) return;
    if (!farmNameDraft.trim()) {
      setProfileError("Farm name cannot be empty.");
      return;
    }
    if (sbiDraft.trim().length > 0 && !/^\d{9}$/.test(sbiDraft.trim())) {
      setProfileError("SBI Number must be exactly 9 digits (e.g. 123456789).");
      return;
    }
    // Normalise postcode before saving so the server always receives a correctly
    // formatted value even when the grower submits via the keyboard Done key
    // without blurring the field first.
    const normalisedPostcode = normalisePostcode(postcodeDraft);
    setPostcodeDraft(normalisedPostcode);
    // Reveal any postcode warning if the grower taps Save without having blurred the field
    setPostcodeBlurred(true);
    setProfileSaving(true);
    setProfileError(null);
    setProfileSaved(false);
    try {
      const res = await apiFetch(`/api/farms/${currentFarm.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: farmNameDraft.trim() || null,
          phone: phoneDraft.trim() || null,
          cphNumber: cphDraft.trim() || null,
          sbiNumber: sbiDraft.trim() || null,
          address: addressDraft.trim() || null,
          postcode: normalisedPostcode || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      refetchIdentifiers();
      // Reflect the new name immediately in FarmContext (top nav + farm picker)
      await updateFarm(currentFarm.id, { name: farmNameDraft.trim() });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
      // Signal other livestock screens so they can show the confirmation nudge
      if (currentFarm?.id) {
        try {
          await AsyncStorage.setItem(
            identifierJustSavedKey(currentFarm.id),
            JSON.stringify({ ts: Date.now() }),
          );
        } catch {
          // best-effort
        }
      }
    } catch (err: unknown) {
      setProfileError(err instanceof Error ? err.message : "Save failed — check your connection and try again.");
    } finally {
      setProfileSaving(false);
    }
  }

  // ── SMS Notification Preferences ────────────────────────────────────────────
  const [smsMobile, setSmsMobile] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [categoryStates, setCategoryStates] = useState<Record<string, boolean>>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [smsLoading, setSmsLoading] = useState(true);
  const [smsSaving, setSmsSaving] = useState(false);
  const [smsSaved, setSmsSaved] = useState(false);
  const [smsError, setSmsError] = useState<string | null>(null);

  const hasSmsModule = activeModuleKeys.includes("sms-alerts");
  const activeModuleKeySet = new Set(activeModuleKeys);
  const visibleCategories = SMS_CATEGORIES.filter(
    cat => cat.moduleGates.length === 0 || cat.moduleGates.some(g => activeModuleKeySet.has(g)),
  );

  useEffect(() => {
    setSmsLoading(true);
    apiFetch("/api/account/profile")
      .then(r => r.ok ? r.json() : null)
      .then((data: { phoneNumber?: string | null; smsOptIn?: string; smsConsentAt?: string | null; smsCategories?: Record<string, boolean> | null } | null) => {
        if (!data) return;
        setSmsMobile(data.phoneNumber ?? "");
        setSmsEnabled(data.smsOptIn !== "none");
        if (data.smsConsentAt) setConsentChecked(true);
        const saved = data.smsCategories;
        const initial: Record<string, boolean> = {};
        for (const cat of SMS_CATEGORIES) {
          initial[cat.key] = saved == null ? true : (saved[cat.key] ?? true);
        }
        setCategoryStates(initial);
      })
      .catch(() => {})
      .finally(() => setSmsLoading(false));
  }, []);

  async function saveSmsPrefs(): Promise<void> {
    if (smsEnabled && !consentChecked) {
      setSmsError("Please tick the consent box before enabling SMS alerts.");
      return;
    }
    setSmsSaving(true);
    setSmsError(null);
    setSmsSaved(false);
    try {
      const res = await apiFetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: smsMobile.trim(),
          smsOptIn: smsEnabled ? "all" : "none",
          smsCategories: smsEnabled ? categoryStates : null,
          consentGiven: smsEnabled ? consentChecked : undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `Save failed (${res.status})`);
      }
      setSmsSaved(true);
      setTimeout(() => setSmsSaved(false), 3000);
    } catch (err: unknown) {
      setSmsError(err instanceof Error ? err.message : "Save failed — check your connection and try again.");
    } finally {
      setSmsSaving(false);
    }
  }

  const [appVersion, setAppVersion] = useState<string>(VERSION_FALLBACK);
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
    }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
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
    fetch(`${getApiBase()}/api/version`)
      .then(r => r.ok ? r.json() : null)
      .then((data: { full?: string } | null) => { if (data?.full) setAppVersion(data.full); })
      .catch(() => {});
  }, []);

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

        <SectionHeader title="Farm Profile" />
        <View style={[styles.section, { padding: spacing.lg }]}>
          <Input
            label="Farm Name"
            placeholder="e.g. Manor Farm"
            value={farmNameDraft}
            onChangeText={t => { setFarmNameDraft(t); setProfileSaved(false); }}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
          />
          <Input
            label="Contact Phone"
            placeholder="e.g. 01234 567890"
            value={phoneDraft}
            onChangeText={t => { setPhoneDraft(t); setProfileSaved(false); }}
            keyboardType="phone-pad"
            autoCorrect={false}
            returnKeyType="next"
          />
          <Input
            label="CPH Number"
            placeholder="e.g. 12/345/0001"
            value={cphDraft}
            onChangeText={t => { setCphDraft(t); setProfileSaved(false); }}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="next"
          />
          <Input
            label="SBI Number"
            placeholder="e.g. 123456789"
            value={sbiDraft}
            onChangeText={t => { setSbiDraft(t); setProfileSaved(false); }}
            keyboardType="numeric"
            returnKeyType="next"
          />
          {sbiDraft.trim().length > 0 && !/^\d{9}$/.test(sbiDraft.trim()) && (
            <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#92400e", marginTop: -spacing.sm, marginBottom: spacing.sm }}>
              SBI must be exactly 9 digits (e.g. 123456789)
            </Text>
          )}
          <Input
            label="Farm Address"
            placeholder="e.g. Home Farm, Market Lane, Dorchester"
            value={addressDraft}
            onChangeText={t => { setAddressDraft(t); setProfileSaved(false); }}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
          />
          <Input
            label="Postcode"
            placeholder="e.g. DT1 1AA"
            value={postcodeDraft}
            onChangeText={t => { setPostcodeDraft(t); setProfileSaved(false); }}
            onBlur={() => {
              const normalised = normalisePostcode(postcodeDraft);
              setPostcodeDraft(normalised);
              setPostcodeBlurred(true);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={saveProfile}
            containerStyle={{ marginBottom: showPostcodeWarning ? spacing.xs : 0 }}
          />
          {showPostcodeWarning && (
            <Text style={styles.postcodeWarningText}>
              This doesn't look like a valid UK postcode (e.g. DT1 1AA). You can still save if you're sure.
            </Text>
          )}
          {!!profileError && (
            <Text style={styles.profileErrorText}>{profileError}</Text>
          )}
          {profileSaved && (
            <Text style={styles.profileSavedText}>✓ Saved — identifiers updated</Text>
          )}
          <TouchableOpacity
            style={[styles.saveButton, profileSaving && styles.saveButtonDisabled]}
            onPress={saveProfile}
            disabled={profileSaving}
            activeOpacity={0.8}
          >
            {profileSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Farm Profile</Text>
            )}
          </TouchableOpacity>
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
              <View style={styles.divider} />
              <ListItem
                title="Agri-Environment Grants"
                subtitle="View grant agreements and track drawdown progress per project"
                icon="trending-up"
                iconColor="#059669"
                iconBgColor="#d1fae5"
                onPress={() => router.push("/agri-env-projects")}
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
            subtitle={`v${appVersion}`}
            icon="info"
            showChevron={false}
          />
        </View>

        <SectionHeader title="SMS Notifications" />
        <View style={[styles.section, { padding: spacing.lg }]}>
          {smsLoading ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : !hasSmsModule ? (
            <View style={{ alignItems: "center", paddingVertical: spacing.md, gap: spacing.sm }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.borderLight, alignItems: "center", justifyContent: "center" }}>
                <Feather name="lock" size={18} color={colors.textTertiary} />
              </View>
              <Text style={{ fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, textAlign: "center" }}>
                SMS Alerts add-on not active
              </Text>
              <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 }}>
                SMS Text Alerts is available as an add-on for £4/month per farm. Contact your BDE Farm Trac account manager to activate.
              </Text>
            </View>
          ) : (
            <>
              <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.md }}>
                Each team member independently controls which alert categories they receive.
              </Text>

              {/* Phone number */}
              <Input
                label="Mobile Number (for SMS)"
                placeholder="+447911123456"
                value={smsMobile}
                onChangeText={t => { setSmsMobile(t); setSmsSaved(false); }}
                keyboardType="phone-pad"
                autoCorrect={false}
                returnKeyType="done"
              />
              <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: -spacing.sm, marginBottom: spacing.md }}>
                UK number in international format, e.g. +447911123456
              </Text>

              {/* Master toggle */}
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginBottom: spacing.md }}>
                <View style={{ flex: 1, marginRight: spacing.md }}>
                  <Text style={{ fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text }}>Enable SMS text notifications</Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, lineHeight: 18 }}>
                    Turn off to stop all SMS alerts regardless of category settings.
                  </Text>
                </View>
                <Switch
                  value={smsEnabled}
                  onValueChange={v => {
                    setSmsEnabled(v);
                    if (!v) setConsentChecked(false);
                    setSmsSaved(false);
                  }}
                  disabled={!smsMobile.trim()}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#fff"
                />
              </View>

              {/* Per-category toggles */}
              {smsEnabled && (
                <View style={{ marginBottom: spacing.md }}>
                  <Text style={{ fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.xs }}>Alert categories</Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginBottom: spacing.sm }}>
                    Only categories relevant to your farm are shown.
                  </Text>
                  <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, overflow: "hidden" }}>
                    {visibleCategories.map((cat, idx) => (
                      <View key={cat.key}>
                        {idx > 0 && <View style={{ height: 1, backgroundColor: colors.borderLight }} />}
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
                          <View style={{ flex: 1, marginRight: spacing.md }}>
                            <Text style={{ fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text }}>{cat.label}</Text>
                            <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, lineHeight: 18 }}>{cat.description}</Text>
                          </View>
                          <Switch
                            value={categoryStates[cat.key] ?? true}
                            onValueChange={v => {
                              setCategoryStates(prev => ({ ...prev, [cat.key]: v }));
                              setSmsSaved(false);
                            }}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor="#fff"
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                  <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textTertiary, marginTop: spacing.xs, lineHeight: 18 }}>
                    Disable categories you're not responsible for. A dairy manager can silence livestock alerts; a cereals manager can silence dairy alerts.
                  </Text>
                </View>
              )}

              {/* Farm Manager note */}
              <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.md }}>
                <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 18 }}>
                  <Text style={{ fontFamily: fonts.semiBold, color: colors.text }}>Farm Managers</Text> are automatically included in critical alerts when a mobile number is saved. Disabling SMS entirely always overrides this.
                </Text>
              </View>

              {/* GDPR consent */}
              {smsEnabled && (
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.md }}
                  onPress={() => { setConsentChecked(v => !v); setSmsSaved(false); }}
                  activeOpacity={0.7}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: consentChecked ? colors.primary : colors.border, backgroundColor: consentChecked ? colors.primary : "transparent", alignItems: "center", justifyContent: "center", marginTop: 1, flexShrink: 0 }}>
                    {consentChecked && <Feather name="check" size={12} color="#fff" />}
                  </View>
                  <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, flex: 1, lineHeight: 18 }}>
                    I consent to BDE Farm Trac sending me compliance alert text messages to the number above. I understand I can withdraw consent at any time by disabling SMS notifications.
                  </Text>
                </TouchableOpacity>
              )}

              {!!smsError && (
                <Text style={styles.profileErrorText}>{smsError}</Text>
              )}
              {smsSaved && (
                <Text style={styles.profileSavedText}>✓ Notification preferences saved</Text>
              )}

              <TouchableOpacity
                style={[styles.saveButton, smsSaving && styles.saveButtonDisabled]}
                onPress={saveSmsPrefs}
                disabled={smsSaving}
                activeOpacity={0.8}
              >
                {smsSaving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Preferences</Text>
                )}
              </TouchableOpacity>
            </>
          )}
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
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.textInverse,
  },
  profileErrorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.error,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  profileSavedText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.success,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  postcodeWarningText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
});
