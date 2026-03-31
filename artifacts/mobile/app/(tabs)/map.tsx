import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FieldMap } from "@/components/FieldMap";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { kvGet } from "@/lib/database";
import { generateId, getList, appendToList, STORAGE_KEYS } from "@/lib/storage";
import type { FieldBoundary } from "@/lib/types";

function calculateAreaHectares(points: { latitude: number; longitude: number }[]): number {
  if (points.length < 3) return 0;
  const R = 6371000;
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = (points[i].longitude * Math.PI / 180) * R * Math.cos((points[i].latitude * Math.PI / 180));
    const yi = (points[i].latitude * Math.PI / 180) * R;
    const xj = (points[j].longitude * Math.PI / 180) * R * Math.cos((points[j].latitude * Math.PI / 180));
    const yj = (points[j].latitude * Math.PI / 180) * R;
    area += xi * yj - xj * yi;
  }
  return Math.abs(area / 2) / 10000;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    let token: string | null = null;
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      token = await SecureStore.getItemAsync("auth_session_token");
    } else {
      try { token = localStorage.getItem("auth_session_token"); } catch { }
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
  } catch { }
  return headers;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [fields, setFields] = useState<FieldBoundary[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedPoints, setRecordedPoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [fieldNameInput, setFieldNameInput] = useState("");
  const [calculatedArea, setCalculatedArea] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [showNvzLayer, setShowNvzLayer] = useState(false);
  const [nvzTileUrl, setNvzTileUrl] = useState<string | undefined>(undefined);

  const loadFields = useCallback(async () => {
    const allFields = await getList<FieldBoundary>(STORAGE_KEYS.FIELD_BOUNDARIES, currentFarm?.id);
    setFields(allFields);
    setLoading(false);
  }, [currentFarm?.id]);

  useEffect(() => {
    loadFields();
  }, [loadFields]);

  useEffect(() => {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    const base = domain ? `https://${domain}` : "";
    fetch(`${base}/api/platform-config`)
      .then((r) => r.ok ? r.json() : null)
      .then((data: { config?: Record<string, string> } | null) => {
        const url = data?.config?.nvz_tile_url;
        if (url) setNvzTileUrl(url);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (permission?.granted) {
      (async () => {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLocation(loc);
      })();
    }
  }, [permission?.granted]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordedPoints([]);
    if (location) {
      setRecordedPoints([
        { latitude: location.coords.latitude, longitude: location.coords.longitude },
      ]);
    }
  };

  const addPoint = async () => {
    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setRecordedPoints((prev) => [
      ...prev,
      { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
    ]);
    setLocation(loc);
  };

  const finishRecording = () => {
    if (recordedPoints.length < 3) {
      Alert.alert("Not Enough Points", "You need at least 3 GPS points to define a field boundary.");
      return;
    }
    const area = calculateAreaHectares(recordedPoints);
    setCalculatedArea(area);
    setFieldNameInput("");
    setNameModalVisible(true);
  };

  const saveField = async (name: string) => {
    const area = calculateAreaHectares(recordedPoints);
    const newField: FieldBoundary = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: name,
      coordinates: recordedPoints,
      areaHectares: area > 0 ? area.toFixed(4) : "",
      soilType: "",
      currentCrop: "",
      notes: `${recordedPoints.length} GPS boundary points`,
      createdAt: new Date().toISOString(),
      synced: false,
    };
    await appendToList(STORAGE_KEYS.FIELD_BOUNDARIES, newField);
    setFields((prev) => [newField, ...prev]);
    setIsRecording(false);
    setRecordedPoints([]);
    setNameModalVisible(false);

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (apiDomain && currentFarm?.id) {
      setSyncing(true);
      try {
        const headers = await getAuthHeaders();
        const fieldRes = await fetch(`https://${apiDomain}/api/farms/${currentFarm.id}/fields`, {
          method: "POST",
          headers,
          body: JSON.stringify({ name, areaHectares: area > 0 ? String(area.toFixed(4)) : null }),
        });
        if (fieldRes.ok) {
          const { record } = await fieldRes.json() as { record: { id: number } };
          const polygonPoints = recordedPoints.map((p) => ({ lat: p.latitude, lng: p.longitude }));
          await fetch(`https://${apiDomain}/api/farms/${currentFarm.id}/fields/${record.id}/boundary`, {
            method: "POST",
            headers,
            body: JSON.stringify({ polygonPoints, areaHectares: area, capturedBy: "mobile-gps" }),
          });
        }
      } catch {
      } finally {
        setSyncing(false);
      }
    }
  };

  if (!permission) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Field Mapping</Text>
        </View>
        <View style={styles.center}>
          <EmptyState
            icon="map-pin"
            title="Location Access Required"
            message="BDE Farm Trac needs your location to record GPS field boundaries and map your farm."
            actionTitle={
              permission.status === "denied" && !permission.canAskAgain
                ? "Open Settings"
                : "Enable Location"
            }
            onAction={
              permission.status === "denied" && !permission.canAskAgain
                ? () => { Linking.openSettings(); }
                : requestPermission
            }
          />
        </View>
      </View>
    );
  }

  const initialRegion = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 52.2,
        longitude: -1.0,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Field Mapping</Text>
        <Text style={styles.subtitle}>{currentFarm?.name}</Text>
      </View>

      <View style={styles.mapContainer}>
        <FieldMap
          fields={fields}
          recordedPoints={recordedPoints}
          isRecording={isRecording}
          initialRegion={initialRegion}
          showNvzLayer={showNvzLayer}
          nvzTileUrl={nvzTileUrl}
        />

        {/* NVZ layer toggle */}
        <Pressable
          onPress={() => setShowNvzLayer(v => !v)}
          style={[styles.nvzToggle, showNvzLayer && styles.nvzToggleActive]}
        >
          <Text style={[styles.nvzToggleText, showNvzLayer && styles.nvzToggleTextActive]}>
            NVZ
          </Text>
        </Pressable>

        {isRecording && (
          <View style={styles.recordingOverlay}>
            <View style={styles.recordingHeader}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                Recording \u00B7 {recordedPoints.length} point{recordedPoints.length === 1 ? "" : "s"}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actionBar}>
        {isRecording ? (
          <View style={styles.recordingActions}>
            <Button
              title="Add Point"
              icon="plus"
              onPress={addPoint}
              variant="secondary"
              style={{ flex: 1 }}
            />
            <Button
              title={recordedPoints.length >= 3 ? "Finish" : "Cancel"}
              icon={recordedPoints.length >= 3 ? "check" : "x"}
              onPress={recordedPoints.length >= 3 ? finishRecording : () => {
                setIsRecording(false);
                setRecordedPoints([]);
              }}
              variant={recordedPoints.length >= 3 ? "primary" : "outline"}
              style={{ flex: 1 }}
            />
          </View>
        ) : (
          <>
            <Button
              title="Record Field Boundary"
              icon="plus-circle"
              onPress={startRecording}
              fullWidth
              disabled={!location}
            />
            {fields.length > 0 && (
              <Text style={styles.fieldCount}>
                {fields.length} field{fields.length === 1 ? "" : "s"} mapped
              </Text>
            )}
          </>
        )}
      </View>

      <Modal
        visible={nameModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setNameModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: insets.bottom + spacing.lg }]}>
            <Text style={styles.modalTitle}>Name This Field</Text>
            {calculatedArea > 0 && (
              <View style={styles.areaChip}>
                <Feather name="map" size={14} color={colors.primary} />
                <Text style={styles.areaText}>
                  Calculated area: <Text style={styles.areaValue}>{calculatedArea.toFixed(2)} ha</Text>
                </Text>
              </View>
            )}
            <TextInput
              style={styles.modalInput}
              value={fieldNameInput}
              onChangeText={setFieldNameInput}
              placeholder="e.g. Top Field, 20 Acre"
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setNameModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Field"
                icon="check"
                onPress={() => {
                  const name = fieldNameInput.trim() || `Field ${fields.length + 1}`;
                  saveField(name);
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {syncing && (
        <View style={styles.syncingBanner}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.syncingText}>Syncing to cloud…</Text>
        </View>
      )}

      <View style={{ height: 100 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordingOverlay: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  recordingHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  recordingText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#fff",
  },
  actionBar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  recordingActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  fieldCount: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  nvzToggle: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  nvzToggleActive: {
    backgroundColor: "rgba(239, 68, 68, 0.8)",
    borderColor: "rgba(239, 68, 68, 0.5)",
  },
  nvzToggleText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xs,
    color: "#fff",
    letterSpacing: 0.5,
  },
  nvzToggleTextActive: {
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
  },
  modalTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  modalInput: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  areaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary + "15",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  areaText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  areaValue: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  syncingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  syncingText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
