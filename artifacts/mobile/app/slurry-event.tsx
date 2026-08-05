import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { FieldPicker } from "@/components/ui/FieldPicker";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFields } from "@/lib/hooks/useApiFields";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { SlurrySpreadingRecord } from "@/lib/types";

import { apiFetch } from "@/lib/apiFetch";
const SPREAD_MATERIALS = [
  "Cattle Slurry",
  "Pig Slurry",
  "Poultry Slurry",
  "Sheep Slurry",
  "Cattle FYM",
  "Pig FYM",
  "Poultry Manure (Dry)",
  "Digestate",
  "Dirty Water",
  "Other",
];

const APP_METHODS = [
  { key: "trailing_shoe", label: "Trailing Shoe" },
  { key: "injected", label: "Injected" },
  { key: "band_spread", label: "Band Spreading" },
  { key: "splash_plate", label: "Splash Plate" },
  { key: "irrigated", label: "Irrigated / Hose" },
];

const SOIL_CONDITIONS = [
  "Firm / Dry",
  "Moist",
  "Wet",
  "Saturated",
  "Frozen",
];

type Store = {
  id: number;
  storeName: string;
  storeType: string;
  material: string | null;
};

export default function SlurrySpreadingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);

  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const [spreadingDate, setSpreadingDate] = useState(today);
  const [fieldName, setFieldName] = useState("");
  const [fieldAreaHa, setFieldAreaHa] = useState("");
  const [manureType, setManureType] = useState("");
  const [volumeM3, setVolumeM3] = useState("");
  const [applicationRateM3Ha, setApplicationRateM3Ha] = useState("");
  const [applicationMethod, setApplicationMethod] = useState("trailing_shoe");
  const [soilCondition, setSoilCondition] = useState("");
  const [contractor, setContractor] = useState("");
  const [nvzClosedPeriod, setNvzClosedPeriod] = useState(false);
  const [windspeedOk, setWindspeedOk] = useState(true);
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  useEffect(() => {
    if (!currentFarm?.id) return;
    apiFetch(`/api/farms/${currentFarm.id}/slurry-stores`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        const list: Store[] = d.records ?? d ?? [];
        setStores(list);
        if (list.length === 1) {
          setSelectedStoreId(list[0].id);
          if (list[0].material) setManureType(list[0].material);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStores(false));
  }, [currentFarm?.id]);

  const selectedStore = stores.find((s) => s.id === selectedStoreId) ?? null;
  const materialLocked = !!selectedStore?.material;

  const handleStoreSelect = (store: Store) => {
    setSelectedStoreId(store.id);
    if (store.material) {
      setManureType(store.material);
    } else {
      setManureType("");
    }
    Haptics.selectionAsync();
  };

  const handleGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      Alert.alert("Location Error", "Could not get GPS position.");
    }
  };

  const doSave = async () => {
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: SlurrySpreadingRecord = {
      id: generateId(),
      farmId: String(currentFarm?.id ?? ""),
      spreadingDate,
      storeId: String(selectedStoreId ?? ""),
      storeName: selectedStore?.storeName ?? "",
      manureType,
      fieldName: fieldName.trim(),
      fieldAreaHa: fieldAreaHa.trim(),
      volumeM3: volumeM3.trim(),
      applicationRateM3Ha: applicationRateM3Ha.trim(),
      applicationMethod,
      soilConditionAtSpreading: soilCondition,
      contractor: contractor.trim(),
      nvzClosedPeriod,
      windspeedOk,
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SLURRY_SPREADING_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert("Saved", "Spreading record saved and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const handleSave = () => {
    if (!spreadingDate || !selectedStoreId) {
      Alert.alert("Required Fields", "Please select a store and spreading date.");
      return;
    }
    if (!manureType) {
      Alert.alert("Required Fields", "Please select the manure / material type.");
      return;
    }
    if (nvzClosedPeriod) {
      Alert.alert(
        "NVZ Closed Period Warning",
        "You have indicated spreading occurred in a closed NVZ period. Organic manures are prohibited in closed periods — this may be a compliance breach. Are you sure you want to save?",
        [
          { text: "Cancel" },
          { text: "Save Anyway", style: "destructive", onPress: doSave },
        ]
      );
      return;
    }
    doSave();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Slurry / Manure Spreading</Text>
            <Text style={styles.subtitle}>Field spreading record · NVZ compliance</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Store selection */}
          <Text style={styles.sectionTitle}>Source Store</Text>
          {loadingStores ? (
            <Text style={styles.hint}>Loading stores…</Text>
          ) : stores.length === 0 ? (
            <View style={[styles.alertBox, { borderColor: "#F59E0B", backgroundColor: "#FFFBEB" }]}>
              <Feather name="alert-triangle" size={14} color="#B45309" />
              <Text style={[styles.alertText, { color: "#92400E" }]}>
                No stores registered. Add stores in the dashboard first.
              </Text>
            </View>
          ) : (
            <View style={styles.storeGrid}>
              {stores.map((s) => (
                <Pressable
                  key={s.id}
                  style={[styles.storePill, selectedStoreId === s.id && styles.storePillActive]}
                  onPress={() => handleStoreSelect(s)}
                >
                  <Text
                    style={[
                      styles.storePillName,
                      selectedStoreId === s.id && styles.storePillNameActive,
                    ]}
                  >
                    {s.storeName}
                  </Text>
                  <Text
                    style={[
                      styles.storePillSub,
                      selectedStoreId === s.id && { color: "rgba(255,255,255,0.75)" },
                    ]}
                  >
                    {s.storeType}
                    {s.material ? ` · ${s.material}` : ""}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Date */}
          <Text style={styles.sectionTitle}>Spreading Date</Text>
          <Input
            value={spreadingDate}
            onChangeText={setSpreadingDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />

          {/* Manure / Material Type */}
          <Text style={styles.sectionTitle}>Manure / Material Type *</Text>
          {materialLocked ? (
            <View style={styles.lockedRow}>
              <Text style={styles.lockIcon}>🔒</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.lockedValue}>{selectedStore!.material}</Text>
                <Text style={styles.lockedHint}>
                  Locked to store configuration — species-specific storage enforced
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.chipRow}>
              {SPREAD_MATERIALS.map((m) => (
                <Pressable
                  key={m}
                  style={[styles.chip, manureType === m && styles.chipActive]}
                  onPress={() => {
                    setManureType(m);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text
                    style={[styles.chipText, manureType === m && styles.chipTextActive]}
                  >
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Field */}
          <Text style={styles.sectionTitle}>Field</Text>
          <FieldPicker
            label=""
            value={fieldName}
            onChange={setFieldName}
            fields={fields}
            loading={fieldsLoading}
            error={fieldsError}
          />
          <Input
            label="Field Area (ha)"
            value={fieldAreaHa}
            onChangeText={setFieldAreaHa}
            placeholder="e.g. 8.5"
            keyboardType="decimal-pad"
            style={{ marginTop: spacing.sm }}
          />

          {/* Volume & Rate */}
          <Text style={styles.sectionTitle}>Quantities</Text>
          <View style={styles.row}>
            <Input
              label="Volume (m³)"
              value={volumeM3}
              onChangeText={setVolumeM3}
              placeholder="e.g. 200"
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Rate (m³/ha)"
              value={applicationRateM3Ha}
              onChangeText={setApplicationRateM3Ha}
              placeholder="e.g. 25"
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
          </View>

          {/* Application method */}
          <Text style={styles.sectionTitle}>Application Method</Text>
          <View style={styles.chipRow}>
            {APP_METHODS.map((m) => (
              <Pressable
                key={m.key}
                style={[styles.chip, applicationMethod === m.key && styles.chipActive]}
                onPress={() => {
                  setApplicationMethod(m.key);
                  Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[
                    styles.chipText,
                    applicationMethod === m.key && styles.chipTextActive,
                  ]}
                >
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Soil condition */}
          <Text style={styles.sectionTitle}>Soil Condition at Spreading</Text>
          <View style={styles.chipRow}>
            {SOIL_CONDITIONS.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.chip,
                  soilCondition === c && styles.chipActive,
                  (c === "Wet" || c === "Saturated" || c === "Frozen") &&
                    soilCondition === c &&
                    styles.chipDanger,
                ]}
                onPress={() => {
                  setSoilCondition(c);
                  Haptics.selectionAsync();
                }}
              >
                <Text
                  style={[styles.chipText, soilCondition === c && styles.chipTextActive]}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
          {(soilCondition === "Wet" || soilCondition === "Saturated" || soilCondition === "Frozen") && (
            <View style={[styles.alertBox, { borderColor: colors.error, backgroundColor: "#FEF2F2" }]}>
              <Feather name="alert-circle" size={14} color={colors.error} />
              <Text style={[styles.alertText, { color: "#991B1B" }]}>
                Spreading on {soilCondition.toLowerCase()} or frozen ground risks run-off — check NVZ rules and RB209.
              </Text>
            </View>
          )}

          {/* Contractor */}
          <Input
            label="Contractor / Operator"
            value={contractor}
            onChangeText={setContractor}
            placeholder="Name or company"
            style={{ marginTop: spacing.md }}
          />

          {/* NVZ + Wind switches */}
          <View style={[styles.switchRow, nvzClosedPeriod && { borderColor: colors.error }]}>
            <View style={styles.flex}>
              <Text style={[styles.switchLabel, nvzClosedPeriod && { color: colors.error }]}>
                NVZ Closed Period
              </Text>
              <Text style={styles.switchSub}>
                Turn on if spreading occurred in a closed NVZ period
              </Text>
            </View>
            <Switch
              value={nvzClosedPeriod}
              onValueChange={(v) => {
                setNvzClosedPeriod(v);
                Haptics.selectionAsync();
              }}
              trackColor={{ false: colors.border, true: colors.error }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.switchRow, { marginTop: spacing.sm }]}>
            <View style={styles.flex}>
              <Text style={styles.switchLabel}>Windspeed Acceptable</Text>
              <Text style={styles.switchSub}>
                Spreading should not occur in high wind conditions near watercourses
              </Text>
            </View>
            <Switch
              value={windspeedOk}
              onValueChange={(v) => {
                setWindspeedOk(v);
                Haptics.selectionAsync();
              }}
              trackColor={{ false: colors.error, true: colors.success }}
              thumbColor="#fff"
            />
          </View>

          {/* GPS */}
          <Pressable onPress={handleGps} style={styles.gpsBtn}>
            <Feather
              name="map-pin"
              size={16}
              color={latitude !== undefined ? colors.success : colors.primary}
            />
            <Text
              style={[styles.gpsBtnText, latitude !== undefined && { color: colors.success }]}
            >
              {latitude !== undefined
                ? `GPS: ${latitude.toFixed(5)}, ${longitude?.toFixed(5)}`
                : "Capture GPS Location"}
            </Text>
          </Pressable>

          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional information…"
            multiline
            numberOfLines={3}
            style={{ marginTop: spacing.sm }}
          />

          <Button
            title={saving ? "Saving…" : "Save Spreading Record"}
            onPress={handleSave}
            disabled={saving}
            fullWidth
            icon="check"
            style={styles.saveBtn}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.sm },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: spacing.md,
  },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  storeGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  storePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    minWidth: 120,
  },
  storePillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  storePillName: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  storePillNameActive: { color: "#fff" },
  storePillSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lockedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: "#f0fdf4",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  lockIcon: { fontSize: 18 },
  lockedValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: "#166534",
  },
  lockedHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#166534",
    marginTop: 2,
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipDanger: { borderColor: colors.error, backgroundColor: colors.error + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  row: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  alertBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  alertText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.md,
  },
  switchLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  switchSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  gpsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginTop: spacing.md,
  },
  gpsBtnText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  saveBtn: { marginTop: spacing.lg },
});
