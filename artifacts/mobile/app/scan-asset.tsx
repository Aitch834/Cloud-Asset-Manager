import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { kvGet } from "@/lib/database";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    let token: string | null = null;
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      token = await SecureStore.getItemAsync("auth_session_token");
    } else {
      try { token = localStorage.getItem("auth_session_token"); } catch {}
    }
    if (!token) {
      const raw = await kvGet("bde_auth_token");
      token = raw ? JSON.parse(raw) : null;
    }
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const farmRaw = await kvGet("bde_current_farm");
    if (farmRaw) {
      const farm = JSON.parse(farmRaw);
      const slug = farm.tenantSlug || farm.slug || "";
      if (slug) headers["x-tenant-slug"] = slug;
    }
  } catch {}
  return headers;
}

type EntityType = "equipment" | "field" | "animal" | "storage" | "tank";

interface ScanResult {
  type: EntityType;
  code: string;
  data: Record<string, unknown>;
}

const ENTITY_META: Record<EntityType, { label: string; colour: string; icon: keyof typeof Feather.glyphMap }> = {
  equipment: { label: "Equipment Asset",   colour: "#0f766e", icon: "tool" },
  field:     { label: "Field",             colour: "#15803d", icon: "map" },
  animal:    { label: "Animal",            colour: "#b45309", icon: "feather" },
  storage:   { label: "Storage Location", colour: "#1d4ed8", icon: "archive" },
  tank:      { label: "Bulk Milk Tank",   colour: "#0369a1", icon: "droplet" },
};

const QUICK_ACTIONS: Record<EntityType, { label: string; sub: string; icon: keyof typeof Feather.glyphMap; colour: string; bg: string; route: string; paramKey: string; nameKey?: string; extraParams?: Record<string, string> }[]> = {
  equipment: [
    { label: "Report Defect / Fault",      sub: "Log a breakdown, fault or safety concern",       icon: "alert-triangle", colour: "#dc2626", bg: "#FEE2E2", route: "/equipment-defect",    paramKey: "assetId",  nameKey: "assetName" },
    { label: "Log Service / Workshop Job", sub: "Record a service, repair or inspection job",      icon: "tool",           colour: "#0f766e", bg: "#CCFBF1", route: "/service-job",         paramKey: "assetId",  nameKey: "assetName" },
    { label: "Record Fuel Drawdown",       sub: "Log fuel drawn from storage for this equipment", icon: "droplet",        colour: "#0369a1", bg: "#DBEAFE", route: "/fuel-drawdown",       paramKey: "assetId",  nameKey: "assetName" },
    { label: "Calibration Check",          sub: "Record a sprayer or equipment calibration",      icon: "check-circle",   colour: "#7c3aed", bg: "#EDE9FE", route: "/sprayer-calibration", paramKey: "assetId",  nameKey: "assetName" },
  ],
  field: [
    { label: "Log Crop Event",             sub: "Record drilling, spraying or harvest activity", icon: "feather",       colour: "#15803d", bg: "#DCFCE7", route: "/crop-event",        paramKey: "fieldId",  nameKey: "fieldName" },
    { label: "Record Spray Application",   sub: "Log chemical application for this field",       icon: "droplet",       colour: "#0369a1", bg: "#DBEAFE", route: "/spray-record",      paramKey: "fieldId",  nameKey: "fieldName" },
    { label: "Log Soil Sample",            sub: "Record soil testing for this field",             icon: "layers",        colour: "#92400e", bg: "#FEF3C7", route: "/soil-sample",       paramKey: "fieldId",  nameKey: "fieldName" },
    { label: "Field Inspection",           sub: "Complete a field walkover inspection",           icon: "search",        colour: "#6d28d9", bg: "#EDE9FE", route: "/field-inspection",  paramKey: "fieldId",  nameKey: "fieldName" },
  ],
  animal: [
    { label: "Log Medicine / Treatment",   sub: "Record a medicine withdrawal or treatment",      icon: "activity",      colour: "#be123c", bg: "#FFE4E6", route: "/medicine-record",   paramKey: "animalId", nameKey: "animalName" },
    { label: "Mobility Score",             sub: "Complete a mobility assessment",                 icon: "trending-up",   colour: "#0369a1", bg: "#DBEAFE", route: "/mobility-scoring",  paramKey: "animalId", nameKey: "animalName" },
    { label: "Calving Record",             sub: "Record a calving event",                        icon: "heart",         colour: "#d97706", bg: "#FEF3C7", route: "/calving-record",    paramKey: "animalId", nameKey: "animalName" },
  ],
  storage: [
    { label: "Log Biofuel Delivery",       sub: "Record fuel delivered to this store",            icon: "truck",         colour: "#0f766e", bg: "#CCFBF1", route: "/biofuel-delivery",  paramKey: "storeId",  nameKey: "storeName" },
    { label: "Log Feed Record",            sub: "Record feed stock movement",                     icon: "package",       colour: "#92400e", bg: "#FEF3C7", route: "/feed-record",       paramKey: "storeId",  nameKey: "storeName" },
  ],
  tank: [
    { label: "Log Monitoring Record",      sub: "Temperature check, cleaning or ABR test",       icon: "activity",      colour: "#0369a1", bg: "#DBEAFE", route: "/bulk-tank-record",  paramKey: "tankId",  nameKey: "tankName" },
    { label: "Log Deep Clean",             sub: "Record a full tank clean and sanitisation",     icon: "check-circle",  colour: "#0f766e", bg: "#CCFBF1", route: "/bulk-tank-record",  paramKey: "tankId",  nameKey: "tankName", extraParams: { presetType: "cleaning" } },
  ],
};

function normaliseBdeCode(raw: string): string {
  const match = raw.match(/^BDE:F\d+:(.+)$/i);
  return match ? match[1] : raw;
}

function detectEntityType(raw: string): EntityType | null {
  const code = normaliseBdeCode(raw);
  if (code.startsWith("EQ-"))  return "equipment";
  if (code.startsWith("FLD-")) return "field";
  if (code.startsWith("ANM-")) return "animal";
  if (code.startsWith("STG-")) return "storage";
  if (code.startsWith("TNK-")) return "tank";
  return null;
}

async function lookupEntity(rawCode: string, type: EntityType, farmId: number, headers: Record<string, string>): Promise<Record<string, unknown> | null> {
  const code = normaliseBdeCode(rawCode);
  const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
  const base = `https://${apiDomain}/api/farms/${farmId}`;
  const endpoints: Record<EntityType, string> = {
    equipment: `${base}/equipment/by-asset/${code}`,
    field:     `${base}/fields/by-code/${code}`,
    animal:    `${base}/animals/by-code/${code}`,
    storage:   `${base}/storage-locations/by-code/${code}`,
    tank:      `${base}/dairy/tanks/by-code/${code}`,
  };
  const res = await fetch(endpoints[type], { headers });
  if (!res.ok) return null;
  return res.json();
}

function entityDisplayName(type: EntityType, data: Record<string, unknown>): string {
  switch (type) {
    case "equipment": return (data.name as string) || `Asset #${data.id}`;
    case "field":     return (data.name as string) || `Field #${data.id}`;
    case "animal":    return (data.earTagNumber as string) || (data.tagNumber as string) || `Animal #${data.id}`;
    case "storage":   return (data.name as string) || `Store #${data.id}`;
    case "tank":      return (data.name as string) || `Tank #${data.id}`;
  }
}

function entitySubtitle(type: EntityType, data: Record<string, unknown>): string | null {
  switch (type) {
    case "equipment": return [(data.make as string), (data.model as string)].filter(Boolean).join(" ") || (data.type as string) || null;
    case "field":     return (data.fieldReference as string) ? `Ref: ${data.fieldReference}` : (data.soilType as string) || null;
    case "animal":    return [(data.species as string), (data.breed as string)].filter(Boolean).join(" · ") || null;
    case "storage":   return (data.type as string) ? `${data.type}`.replace(/_/g, " ") : null;
    case "tank":      return (data.location as string) || (data.capacityLitres ? `Capacity: ${Number(data.capacityLitres).toLocaleString()} L` : null);
  }
}

function entityStatus(type: EntityType, data: Record<string, unknown>): { label: string; colour: string } | null {
  const STATUS_EQ: Record<string, { label: string; colour: string }> = {
    active:       { label: "Operational",  colour: "#16a34a" },
    broken:       { label: "Broken Down",  colour: "#dc2626" },
    "in-service": { label: "In Service",   colour: "#d97706" },
    disposed:     { label: "Disposed",     colour: "#6b7280" },
  };
  const STATUS_ANI: Record<string, { label: string; colour: string }> = {
    active:      { label: "Active",     colour: "#16a34a" },
    sold:        { label: "Sold",       colour: "#d97706" },
    dead:        { label: "Deceased",   colour: "#dc2626" },
    transferred: { label: "Moved",      colour: "#6b7280" },
  };
  if (type === "equipment") return STATUS_EQ[data.status as string] ?? { label: data.status as string, colour: "#6b7280" };
  if (type === "animal")    return STATUS_ANI[data.status as string] ?? { label: data.status as string, colour: "#6b7280" };
  if (type === "storage")   return data.isActive ? { label: "Active", colour: "#16a34a" } : { label: "Inactive", colour: "#6b7280" };
  if (type === "tank")      return { label: "Registered", colour: "#16a34a" };
  return null;
}

export default function ScanQRScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastScan = useRef<string>("");
  const [gpsUpdating, setGpsUpdating] = useState(false);

  async function handleUpdateTankGps() {
    if (!result || result.type !== "tank" || !currentFarm) return;
    setGpsUpdating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location Access Required", "Please grant location access to capture GPS coordinates.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;

      const headers = await getAuthHeaders();
      const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
      const current = result.data;
      const res = await fetch(
        `https://${apiDomain}/api/farms/${currentFarm.id}/dairy/tanks/${current.id}`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify({
            name: current.name,
            location: current.location ?? null,
            capacityLitres: current.capacityLitres ?? null,
            notes: current.notes ?? null,
            latitudeDeg: latitude,
            longitudeDeg: longitude,
          }),
        }
      );
      if (res.ok) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          "GPS Updated",
          `Tank location set to ${latitude.toFixed(6)}, ${longitude.toFixed(6)}. It will appear on the farm map.`,
        );
        setResult(r => r ? { ...r, data: { ...r.data, latitudeDeg: latitude, longitudeDeg: longitude } } : r);
      } else {
        Alert.alert("Update Failed", "Could not save the GPS coordinates. Try again.");
      }
    } catch {
      Alert.alert("Error", "Could not capture GPS. Check location permissions and try again.");
    } finally {
      setGpsUpdating(false);
    }
  }

  async function handleBarcode({ data }: { data: string }) {
    if (!scanning || !currentFarm || data === lastScan.current) return;
    lastScan.current = data;
    setScanning(false);
    setLoading(true);
    setError(null);
    setResult(null);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const type = detectEntityType(data);
    if (!type) {
      setError("Unrecognised code. Make sure you're scanning a BDE Farm Trac QR label.");
      setLoading(false);
      return;
    }

    const normalised = normaliseBdeCode(data);
    try {
      const headers = await getAuthHeaders();
      const entityData = await lookupEntity(data, type, parseInt(currentFarm.id), headers);
      if (entityData) {
        setResult({ type, code: normalised, data: entityData });
      } else {
        setError(`No record found for "${data}". Make sure you scanned a label generated in BDE Farm Trac.`);
      }
    } catch {
      setError("Could not reach the server. Check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    lastScan.current = "";
    setResult(null);
    setError(null);
    setScanning(true);
  }

  if (!permission) {
    return <View style={[styles.centered, { paddingTop: insets.top }]}><ActivityIndicator color={colors.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top, paddingBottom: insets.bottom, paddingHorizontal: spacing.lg }]}>
        <Feather name="camera-off" size={48} color={colors.textSecondary} style={{ marginBottom: spacing.md }} />
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permSub}>BDE Farm Trac needs camera access to scan QR labels.</Text>
        <Button title="Grant Camera Access" onPress={() => { requestPermission(); }} style={{ marginTop: spacing.lg }} />
        <Pressable onPress={() => router.back()} style={{ marginTop: spacing.md }}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const meta = result ? ENTITY_META[result.type] : null;
  const status = result ? entityStatus(result.type, result.data) : null;
  const actions = result ? QUICK_ACTIONS[result.type] : [];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Workshop — Scan QR Code</Text>
        <View style={{ width: 36 }} />
      </View>

      {scanning && !loading && !result && !error ? (
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={handleBarcode}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          />
          <View style={styles.overlay}>
            <View style={styles.frame}>
              <View style={[styles.corner, styles.tl]} />
              <View style={[styles.corner, styles.tr]} />
              <View style={[styles.corner, styles.bl]} />
              <View style={[styles.corner, styles.br]} />
            </View>
            <Text style={styles.scanHint}>Point at a BDE Farm Trac QR label</Text>
            <Text style={styles.scanSub}>Fields · Animals · Equipment · Storage · Tanks</Text>
          </View>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.resultContent, { paddingBottom: insets.bottom + spacing.xl }]}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Looking up record…</Text>
            </View>
          )}

          {error && !loading && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={32} color="#dc2626" style={{ marginBottom: spacing.sm }} />
              <Text style={styles.errorTitle}>Not Recognised</Text>
              <Text style={styles.errorSub}>{error}</Text>
              <Button title="Scan Again" onPress={reset} style={{ marginTop: spacing.lg }} />
            </View>
          )}

          {result && !loading && meta && (
            <>
              <View style={[styles.entityCard, { borderTopColor: meta.colour, borderTopWidth: 3 }]}>
                <View style={[styles.entityIconBox, { backgroundColor: meta.colour + "18" }]}>
                  <Feather name={meta.icon} size={22} color={meta.colour} />
                </View>
                <Text style={[styles.entityTypeLabel, { color: meta.colour }]}>{meta.label}</Text>
                <Text style={[styles.entityCode, { color: meta.colour }]}>{result.code}</Text>
                <Text style={styles.entityName}>{entityDisplayName(result.type, result.data)}</Text>
                {entitySubtitle(result.type, result.data) && (
                  <Text style={styles.entitySub}>{entitySubtitle(result.type, result.data)}</Text>
                )}
                {status && (
                  <View style={[styles.statusPill, { backgroundColor: status.colour + "20" }]}>
                    <View style={[styles.statusDot, { backgroundColor: status.colour }]} />
                    <Text style={[styles.statusText, { color: status.colour }]}>{status.label}</Text>
                  </View>
                )}
              </View>

              {actions.length > 0 && (
                <View style={styles.actionsCard}>
                  <Text style={styles.actionsTitle}>Quick Actions</Text>
                  {actions.map(action => (
                    <Pressable
                      key={action.label}
                      style={styles.actionRow}
                      onPress={() => router.push({
                        pathname: action.route as never,
                        params: {
                          [action.paramKey]: result.data.id,
                          ...(action.nameKey ? { [action.nameKey]: entityDisplayName(result.type, result.data) } : {}),
                          ...(action.extraParams ?? {}),
                        } as Record<string, string>,
                      })}
                    >
                      <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                        <Feather name={action.icon} size={18} color={action.colour} />
                      </View>
                      <View style={styles.actionTextBlock}>
                        <Text style={styles.actionTitle}>{action.label}</Text>
                        <Text style={styles.actionSub}>{action.sub}</Text>
                      </View>
                      <Feather name="chevron-right" size={16} color={colors.textSecondary} />
                    </Pressable>
                  ))}
                  {result.type === "tank" && (
                    <Pressable
                      style={[styles.actionRow, { borderBottomWidth: 0 }]}
                      onPress={handleUpdateTankGps}
                      disabled={gpsUpdating}
                    >
                      <View style={[styles.actionIcon, { backgroundColor: "#EFF6FF" }]}>
                        <Feather name={gpsUpdating ? "loader" : "map-pin"} size={18} color="#2563eb" />
                      </View>
                      <View style={styles.actionTextBlock}>
                        <Text style={styles.actionTitle}>
                          {result.data.latitudeDeg ? "Update GPS Location" : "Set GPS Location"}
                        </Text>
                        <Text style={styles.actionSub}>
                          {result.data.latitudeDeg
                            ? `Current: ${(result.data.latitudeDeg as number).toFixed(5)}, ${(result.data.longitudeDeg as number).toFixed(5)}`
                            : "Capture device GPS to place tank on the farm map"}
                        </Text>
                      </View>
                      {gpsUpdating
                        ? <ActivityIndicator size="small" color="#2563eb" />
                        : <Feather name="chevron-right" size={16} color={colors.textSecondary} />}
                    </Pressable>
                  )}
                </View>
              )}

              <Button title="Scan Another" onPress={reset} variant="outline" style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm }} />
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;
const FRAME_SIZE = 220;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: "rgba(0,0,0,0.8)" },
  backBtn: { padding: spacing.xs, borderRadius: radius.sm },
  headerTitle: { color: "#fff", fontSize: fontSize.md, fontFamily: fonts.semiBold },

  cameraContainer: { flex: 1, position: "relative" },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  frame: { width: FRAME_SIZE, height: FRAME_SIZE, position: "relative" },
  corner: { position: "absolute", width: CORNER_SIZE, height: CORNER_SIZE, borderColor: "#fff" },
  tl: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  tr: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  bl: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  br: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  scanHint: { color: "#fff", marginTop: spacing.lg, fontSize: fontSize.sm, fontFamily: fonts.regular, opacity: 0.9 },
  scanSub: { color: "#fff", marginTop: 4, fontSize: fontSize.xs, fontFamily: fonts.regular, opacity: 0.6 },

  resultContent: { padding: spacing.lg, backgroundColor: "#f8fafc", flexGrow: 1 },

  loadingBox: { alignItems: "center", paddingVertical: spacing.xl * 2 },
  loadingText: { marginTop: spacing.md, color: colors.textSecondary, fontFamily: fonts.regular, fontSize: fontSize.sm },

  errorBox: { alignItems: "center", paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  errorTitle: { fontSize: fontSize.lg, fontFamily: fonts.semiBold, color: "#dc2626", marginBottom: spacing.xs },
  errorSub: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.textSecondary, textAlign: "center" },

  entityCard: { backgroundColor: "#fff", borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  entityIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  entityTypeLabel: { fontSize: fontSize.xs, fontFamily: fonts.semiBold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  entityCode: { fontSize: 24, fontFamily: fonts.bold, letterSpacing: 2, marginBottom: spacing.xs },
  entityName: { fontSize: fontSize.lg, fontFamily: fonts.semiBold, color: colors.text, textAlign: "center" },
  entitySub: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.textSecondary, textTransform: "capitalize" },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: fontSize.sm, fontFamily: fonts.medium },

  actionsCard: { backgroundColor: "#fff", borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  actionsTitle: { fontSize: fontSize.xs, fontFamily: fonts.semiBold, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm },
  actionRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#f1f5f9" },
  actionIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  actionTextBlock: { flex: 1 },
  actionTitle: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.text },
  actionSub: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: colors.textSecondary },

  permTitle: { fontSize: fontSize.lg, fontFamily: fonts.semiBold, color: colors.text, textAlign: "center", marginBottom: spacing.sm },
  permSub: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.textSecondary, textAlign: "center" },
  backLink: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.primary },
});
