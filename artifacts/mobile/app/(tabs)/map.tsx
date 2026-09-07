import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
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
import { getCurrentAuthToken } from "@/lib/authToken";
import { generateId, getList, appendToList, STORAGE_KEYS } from "@/lib/storage";
import type { FieldBoundary } from "@/lib/types";

type RecordingMode = "field" | "block" | "vineyard";
interface GrowingBlock { id: number; blockName: string; blockCode?: string | null; }

/** Seven MAFF/AHDB texture classes shown in the field soil type picker */
const SOIL_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "light_sandy", label: "Light Sandy" },
  { value: "sandy_loam",  label: "Sandy Loam" },
  { value: "medium_loam", label: "Medium Loam" },
  { value: "silty_loam",  label: "Silty Loam" },
  { value: "clay_loam",   label: "Clay Loam" },
  { value: "heavy_clay",  label: "Heavy Clay" },
  { value: "peat",        label: "Peat" },
];

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
    const token = await getCurrentAuthToken();
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
  const [selectedSoilType, setSelectedSoilType] = useState("");
  const [recordingMode, setRecordingMode] = useState<RecordingMode>("field");
  const [availableBlocks, setAvailableBlocks] = useState<GrowingBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [availableVineyardBlocks, setAvailableVineyardBlocks] = useState<GrowingBlock[]>([]);
  const [selectedVineyardBlockId, setSelectedVineyardBlockId] = useState<number | null>(null);

  const loadFields = useCallback(async () => {
    const allFields = await getList<FieldBoundary>(STORAGE_KEYS.FIELD_BOUNDARIES, currentFarm?.id);
    setFields(allFields);
    setLoading(false);
  }, [currentFarm?.id]);

  const loadBlocks = useCallback(async () => {
    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain || !currentFarm?.id) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`https://${apiDomain}/api/farms/${currentFarm.id}/horticulture-blocks`, { headers });
      if (res.ok) {
        const rows = await res.json() as GrowingBlock[];
        setAvailableBlocks(rows);
      }
    } catch { }
  }, [currentFarm?.id]);

  const loadVineyardBlocks = useCallback(async () => {
    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain || !currentFarm?.id) return;
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`https://${apiDomain}/api/farms/${currentFarm.id}/vineyard-blocks`, { headers });
      if (res.ok) {
        const rows = await res.json() as GrowingBlock[];
        setAvailableVineyardBlocks(rows);
      }
    } catch { }
  }, [currentFarm?.id]);

  useEffect(() => {
    loadFields();
    loadBlocks();
    loadVineyardBlocks();
  }, [loadFields, loadBlocks, loadVineyardBlocks]);

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
      Alert.alert("Not Enough Points", "You need at least 3 GPS points to define a boundary.");
      return;
    }
    const area = calculateAreaHectares(recordedPoints);
    setCalculatedArea(area);
    if (recordingMode === "block") {
      setSelectedBlockId(availableBlocks[0]?.id ?? null);
    } else if (recordingMode === "vineyard") {
      setSelectedVineyardBlockId(availableVineyardBlocks[0]?.id ?? null);
    } else {
      setFieldNameInput("");
      setSelectedSoilType("");
    }
    setNameModalVisible(true);
  };

  const saveField = async (name: string, soilType: string) => {
    const area = calculateAreaHectares(recordedPoints);
    const newField: FieldBoundary = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: name,
      coordinates: recordedPoints,
      areaHectares: area > 0 ? area.toFixed(4) : "",
      soilType: soilType,
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
          body: JSON.stringify({
            name,
            areaHectares: area > 0 ? String(area.toFixed(4)) : null,
            soilType: soilType || null,
          }),
        });
        if (!fieldRes.ok) {
          const t = await fieldRes.text().catch(() => "");
          throw new Error(t || `Request failed (${fieldRes.status})`);
        }
        const { record } = await fieldRes.json() as { record: { id: number } };
        const polygonPoints = recordedPoints.map((p) => ({ lat: p.latitude, lng: p.longitude }));
        await fetch(`https://${apiDomain}/api/farms/${currentFarm.id}/fields/${record.id}/boundary`, {
          method: "POST",
          headers,
          body: JSON.stringify({ polygonPoints, areaHectares: area, capturedBy: "mobile-gps" }),
        }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      } catch {
        Alert.alert("Sync Failed", "The field boundary was saved on this device but could not be sent to the server. It will remain marked as unsynced.");
      } finally {
        setSyncing(false);
      }
    }
  };

  const saveBlock = async (blockId: number) => {
    const area = calculateAreaHectares(recordedPoints);
    const block = availableBlocks.find(b => b.id === blockId);
    if (!block) return;
    const entry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      blockId,
      blockName: block.blockName,
      coordinates: recordedPoints,
      areaHectares: area > 0 ? area.toFixed(4) : "",
      createdAt: new Date().toISOString(),
      synced: false,
    };
    await appendToList(STORAGE_KEYS.BLOCK_BOUNDARIES, entry);
    setIsRecording(false);
    setRecordedPoints([]);
    setNameModalVisible(false);

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (apiDomain && currentFarm?.id) {
      setSyncing(true);
      try {
        const headers = await getAuthHeaders();
        const polygonPoints = recordedPoints.map((p) => ({ lat: p.latitude, lng: p.longitude }));
        await fetch(`https://${apiDomain}/api/farms/${currentFarm.id}/horticulture-blocks/${blockId}/boundary`, {
          method: "POST",
          headers,
          body: JSON.stringify({ polygonPoints, areaHectares: area, capturedBy: "mobile-gps" }),
        }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      } catch {
        Alert.alert("Sync Failed", "The block boundary was saved on this device but could not be sent to the server. It will remain marked as unsynced.");
      } finally {
        setSyncing(false);
      }
    }
  };

  const saveVineyardBlock = async (blockId: number) => {
    const area = calculateAreaHectares(recordedPoints);
    const block = availableVineyardBlocks.find(b => b.id === blockId);
    if (!block) return;
    setIsRecording(false);
    setRecordedPoints([]);
    setNameModalVisible(false);

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (apiDomain && currentFarm?.id) {
      setSyncing(true);
      try {
        const headers = await getAuthHeaders();
        const polygonPoints = recordedPoints.map((p) => ({ lat: p.latitude, lng: p.longitude }));
        await fetch(`https://${apiDomain}/api/farms/${currentFarm.id}/vineyard-blocks/${blockId}/boundary`, {
          method: "POST",
          headers,
          body: JSON.stringify({ polygonPoints, areaHectares: area, capturedBy: "mobile-gps" }),
        }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      } catch {
        Alert.alert("Sync Failed", "The vineyard block boundary could not be sent to the server. Please try recording it again.");
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
        <Text style={styles.title}>Farm Mapping</Text>
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
                {recordingMode === "block" ? "Block" : "Field"} Recording · {recordedPoints.length} point{recordedPoints.length === 1 ? "" : "s"}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actionBar}>
        {!isRecording && (
          <View style={styles.modeToggle}>
            <Pressable
              style={[styles.modeButton, recordingMode === "field" && styles.modeButtonActive]}
              onPress={() => setRecordingMode("field")}
            >
              <Text style={[styles.modeButtonText, recordingMode === "field" && styles.modeButtonTextActive]}>Field</Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, recordingMode === "block" && styles.modeButtonActive]}
              onPress={() => { setRecordingMode("block"); loadBlocks(); }}
            >
              <Text style={[styles.modeButtonText, recordingMode === "block" && styles.modeButtonTextActive]}>Hort Block</Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, recordingMode === "vineyard" && styles.modeButtonActive]}
              onPress={() => { setRecordingMode("vineyard"); loadVineyardBlocks(); }}
            >
              <Text style={[styles.modeButtonText, recordingMode === "vineyard" && styles.modeButtonTextActive]}>Vineyard</Text>
            </Pressable>
          </View>
        )}
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
              title={recordingMode === "block" ? "Record Block Boundary" : recordingMode === "vineyard" ? "Record Vineyard Block Boundary" : "Record Field Boundary"}
              icon="plus-circle"
              onPress={startRecording}
              fullWidth
              disabled={!location || (recordingMode === "block" && availableBlocks.length === 0) || (recordingMode === "vineyard" && availableVineyardBlocks.length === 0)}
            />
            {recordingMode === "block" && availableBlocks.length === 0 && (
              <Text style={[styles.fieldCount, { color: colors.textSecondary }]}>
                Add blocks in Fresh Produce → Blocks first
              </Text>
            )}
            {recordingMode === "vineyard" && availableVineyardBlocks.length === 0 && (
              <Text style={[styles.fieldCount, { color: colors.textSecondary }]}>
                Add blocks in Viticulture → Blocks first
              </Text>
            )}
            {recordingMode === "field" && fields.length > 0 && (
              <Text style={styles.fieldCount}>
                {fields.length} field{fields.length === 1 ? "" : "s"} mapped
              </Text>
            )}
            {recordingMode === "field" && (
              <Pressable style={styles.fieldRegisterLink} onPress={() => router.push("/field-edit")}>
                <Feather name="list" size={14} color={colors.primary} />
                <Text style={styles.fieldRegisterLinkText}>Edit field soil types</Text>
                <Feather name="chevron-right" size={14} color={colors.primary} />
              </Pressable>
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
            <Text style={styles.modalTitle}>
              {recordingMode === "block" ? "Select Growing Block" : recordingMode === "vineyard" ? "Select Vineyard Block" : "Name This Field"}
            </Text>
            {calculatedArea > 0 && (
              <View style={styles.areaChip}>
                <Feather name="map" size={14} color={colors.primary} />
                <Text style={styles.areaText}>
                  Calculated area: <Text style={styles.areaValue}>{calculatedArea.toFixed(2)} ha</Text>
                </Text>
              </View>
            )}

            {recordingMode === "block" ? (
              <>
                <Text style={styles.blockPickerLabel}>Choose which growing block this boundary belongs to:</Text>
                <View style={styles.blockPickerList}>
                  {availableBlocks.map(b => (
                    <Pressable
                      key={b.id}
                      style={[styles.blockPickerItem, selectedBlockId === b.id && styles.blockPickerItemActive]}
                      onPress={() => setSelectedBlockId(b.id)}
                    >
                      <Text style={[styles.blockPickerItemText, selectedBlockId === b.id && styles.blockPickerItemTextActive]}>
                        {b.blockName}{b.blockCode ? ` (${b.blockCode})` : ""}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.modalActions}>
                  <Button title="Cancel" variant="outline" onPress={() => setNameModalVisible(false)} style={{ flex: 1 }} />
                  <Button
                    title="Save Boundary"
                    icon="check"
                    onPress={() => { if (selectedBlockId) saveBlock(selectedBlockId); }}
                    style={{ flex: 1 }}
                    disabled={!selectedBlockId}
                  />
                </View>
              </>
            ) : recordingMode === "vineyard" ? (
              <>
                <Text style={styles.blockPickerLabel}>Choose which vineyard block this boundary belongs to:</Text>
                <View style={styles.blockPickerList}>
                  {availableVineyardBlocks.map(b => (
                    <Pressable
                      key={b.id}
                      style={[styles.blockPickerItem, selectedVineyardBlockId === b.id && styles.blockPickerItemActive]}
                      onPress={() => setSelectedVineyardBlockId(b.id)}
                    >
                      <Text style={[styles.blockPickerItemText, selectedVineyardBlockId === b.id && styles.blockPickerItemTextActive]}>
                        {b.blockName}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={styles.modalActions}>
                  <Button title="Cancel" variant="outline" onPress={() => setNameModalVisible(false)} style={{ flex: 1 }} />
                  <Button
                    title="Save Boundary"
                    icon="check"
                    onPress={() => { if (selectedVineyardBlockId) saveVineyardBlock(selectedVineyardBlockId); }}
                    style={{ flex: 1 }}
                    disabled={!selectedVineyardBlockId}
                  />
                </View>
              </>
            ) : (
              <>
                <TextInput
                  style={styles.modalInput}
                  value={fieldNameInput}
                  onChangeText={setFieldNameInput}
                  placeholder="e.g. Top Field, 20 Acre"
                  placeholderTextColor={colors.textTertiary}
                  autoFocus
                />
                <Text style={styles.soilPickerLabel}>Soil Type (optional)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.soilScrollRow} contentContainerStyle={styles.soilScrollContent}>
                  {SOIL_TYPE_OPTIONS.map(opt => (
                    <Pressable
                      key={opt.value}
                      style={[styles.soilChip, selectedSoilType === opt.value && styles.soilChipSelected]}
                      onPress={() => setSelectedSoilType(v => v === opt.value ? "" : opt.value)}
                    >
                      <Text style={[styles.soilChipText, selectedSoilType === opt.value && styles.soilChipTextSelected]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <View style={styles.modalActions}>
                  <Button title="Cancel" variant="outline" onPress={() => setNameModalVisible(false)} style={{ flex: 1 }} />
                  <Button
                    title="Save Field"
                    icon="check"
                    onPress={() => {
                      const name = fieldNameInput.trim() || `Field ${fields.length + 1}`;
                      saveField(name, selectedSoilType);
                    }}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
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
  modeToggle: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  modeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  modeButtonTextActive: {
    color: "#fff",
  },
  blockPickerLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  blockPickerList: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  blockPickerItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  blockPickerItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },
  blockPickerItemText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
  },
  blockPickerItemTextActive: {
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  soilPickerLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  soilScrollRow: {
    marginBottom: spacing.lg,
  },
  soilScrollContent: {
    gap: spacing.xs,
    paddingRight: spacing.xs,
  },
  soilChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  soilChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },
  soilChipText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  soilChipTextSelected: {
    fontFamily: fonts.semiBold,
    color: colors.primary,
  },
  fieldRegisterLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  fieldRegisterLinkText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});
