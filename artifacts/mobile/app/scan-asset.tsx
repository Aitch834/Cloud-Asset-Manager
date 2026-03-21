import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
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

interface EquipmentResult {
  id: number;
  assetNumber: string | null;
  name: string;
  type: string;
  make: string | null;
  model: string | null;
  serialNumber: string | null;
  registrationNumber: string | null;
  yearOfManufacture: number | null;
  currentHours: number | null;
  status: string;
  location: string | null;
  notes: string | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active:       { label: "Operational",  color: "#16a34a" },
  broken:       { label: "Broken Down",  color: "#dc2626" },
  "in-service": { label: "In Service",   color: "#d97706" },
  retired:      { label: "Retired",      color: "#6b7280" },
  sold:         { label: "Sold",         color: "#6b7280" },
};

export default function ScanAssetScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [equipment, setEquipment] = useState<EquipmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastScan = useRef<string>("");

  async function handleBarcode({ data }: { data: string }) {
    if (!scanning || !currentFarm || data === lastScan.current) return;
    lastScan.current = data;
    setScanning(false);
    setLoading(true);
    setError(null);
    setEquipment(null);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
      const headers = await getAuthHeaders();

      let result: EquipmentResult | null = null;

      if (data.match(/^EQ-\d{4}$/)) {
        const res = await fetch(
          `https://${apiDomain}/api/farms/${currentFarm.id}/equipment/by-asset/${data}`,
          { headers }
        );
        if (res.ok) result = await res.json();
      }

      if (!result) {
        const parsed = parseInt(data.replace(/^EQ-0*/, ""), 10);
        if (!isNaN(parsed)) {
          const res = await fetch(
            `https://${apiDomain}/api/farms/${currentFarm.id}/equipment/${parsed}`,
            { headers }
          );
          if (res.ok) result = await res.json();
        }
      }

      if (result) {
        setEquipment(result);
      } else {
        setError(`No asset found for "${data}". Make sure you scanned a BDE Farm Trac asset label.`);
      }
    } catch {
      setError("Could not reach the server. Check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    lastScan.current = "";
    setEquipment(null);
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
        <Text style={styles.permSub}>BDE Farm Trac needs camera access to scan asset QR codes.</Text>
        <Button title="Grant Camera Access" onPress={requestPermission} style={{ marginTop: spacing.lg }} />
        <Pressable onPress={() => router.back()} style={{ marginTop: spacing.md }}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const statusInfo = equipment ? (STATUS_LABELS[equipment.status] ?? { label: equipment.status, color: "#6b7280" }) : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Scan Asset</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* ── Scanner or result ── */}
      {scanning && !loading && !equipment && !error ? (
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
            <Text style={styles.scanHint}>Point at an asset QR label</Text>
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
              <Text style={styles.loadingText}>Looking up asset…</Text>
            </View>
          )}

          {error && !loading && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={32} color="#dc2626" style={{ marginBottom: spacing.sm }} />
              <Text style={styles.errorTitle}>Asset Not Found</Text>
              <Text style={styles.errorSub}>{error}</Text>
              <Button title="Scan Again" onPress={reset} style={{ marginTop: spacing.lg }} />
            </View>
          )}

          {equipment && !loading && (
            <>
              <View style={styles.assetCard}>
                <Text style={styles.assetNumber}>{equipment.assetNumber || `EQ-${String(equipment.id).padStart(4, "0")}`}</Text>
                <Text style={styles.assetName}>{equipment.name}</Text>
                <Text style={styles.assetType}>{equipment.type}</Text>
                {(equipment.make || equipment.model) && (
                  <Text style={styles.assetMeta}>{[equipment.make, equipment.model].filter(Boolean).join(" ")}</Text>
                )}

                <View style={[styles.statusPill, { backgroundColor: statusInfo!.color + "20" }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusInfo!.color }]} />
                  <Text style={[styles.statusText, { color: statusInfo!.color }]}>{statusInfo!.label}</Text>
                </View>
              </View>

              <View style={styles.detailsCard}>
                {equipment.serialNumber && <DetailRow label="Serial No." value={equipment.serialNumber} />}
                {equipment.registrationNumber && <DetailRow label="Reg. No." value={equipment.registrationNumber} />}
                {equipment.yearOfManufacture && <DetailRow label="Year" value={String(equipment.yearOfManufacture)} />}
                {equipment.currentHours != null && <DetailRow label="Hours" value={`${equipment.currentHours} hrs`} />}
                {equipment.location && <DetailRow label="Location" value={equipment.location} />}
                {equipment.notes && <DetailRow label="Notes" value={equipment.notes} />}
              </View>

              <View style={styles.actionsCard}>
                <Text style={styles.actionsTitle}>Quick Actions</Text>
                <Pressable
                  style={styles.actionRow}
                  onPress={() => router.push({ pathname: "/equipment-defect", params: { assetId: equipment.id, assetName: equipment.name, assetNumber: equipment.assetNumber ?? `EQ-${String(equipment.id).padStart(4, "0")}` } })}
                >
                  <View style={[styles.actionIcon, { backgroundColor: "#FEE2E2" }]}>
                    <Feather name="alert-triangle" size={18} color="#dc2626" />
                  </View>
                  <View style={styles.actionText}>
                    <Text style={styles.actionTitle}>Report Defect / Fault</Text>
                    <Text style={styles.actionSub}>Log a breakdown, fault or safety concern</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color={colors.textSecondary} />
                </Pressable>
              </View>

              <Button title="Scan Another Asset" onPress={reset} variant="outline" style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm }} />
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;
const FRAME_SIZE = 220;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: "rgba(0,0,0,0.7)" },
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
  scanHint: { color: "#fff", marginTop: spacing.lg, fontSize: fontSize.sm, fontFamily: fonts.regular, opacity: 0.8 },

  resultContent: { padding: spacing.lg, backgroundColor: "#f8fafc", flexGrow: 1 },

  loadingBox: { alignItems: "center", paddingVertical: spacing.xl * 2 },
  loadingText: { marginTop: spacing.md, color: colors.textSecondary, fontFamily: fonts.regular, fontSize: fontSize.sm },

  errorBox: { alignItems: "center", paddingVertical: spacing.xl, paddingHorizontal: spacing.lg },
  errorTitle: { fontSize: fontSize.lg, fontFamily: fonts.semiBold, color: "#dc2626", marginBottom: spacing.xs },
  errorSub: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.textSecondary, textAlign: "center" },

  assetCard: { backgroundColor: "#fff", borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  assetNumber: { fontSize: 28, fontFamily: fonts.bold, color: colors.primary, letterSpacing: 2, marginBottom: spacing.xs },
  assetName: { fontSize: fontSize.lg, fontFamily: fonts.semiBold, color: colors.textPrimary, textAlign: "center" },
  assetType: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.textSecondary, marginTop: 2 },
  assetMeta: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.textSecondary },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: spacing.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: fontSize.sm, fontFamily: fonts.medium },

  detailsCard: { backgroundColor: "#fff", borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: spacing.xs, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#f1f5f9" },
  detailLabel: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary },
  detailValue: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.textPrimary, maxWidth: "60%", textAlign: "right" },

  actionsCard: { backgroundColor: "#fff", borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  actionsTitle: { fontSize: fontSize.xs, fontFamily: fonts.semiBold, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm },
  actionRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm },
  actionIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  actionText: { flex: 1 },
  actionTitle: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textPrimary },
  actionSub: { fontSize: fontSize.xs, fontFamily: fonts.regular, color: colors.textSecondary },

  permTitle: { fontSize: fontSize.lg, fontFamily: fonts.semiBold, color: colors.textPrimary, textAlign: "center", marginBottom: spacing.sm },
  permSub: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.textSecondary, textAlign: "center" },
  backLink: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.primary },
});
