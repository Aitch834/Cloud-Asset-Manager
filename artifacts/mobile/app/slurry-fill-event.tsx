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
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { SlurryFillEvent } from "@/lib/types";

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

type Store = {
  id: number;
  storeName: string;
  storeType: string;
  material: string | null;
  capacityM3: number | null;
};

export default function SlurryFillEventScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();

  const [stores, setStores] = useState<Store[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const [eventDate, setEventDate] = useState(today);
  const [materialType, setMaterialType] = useState("");
  const [volumeM3, setVolumeM3] = useState("");
  const [sourceDescription, setSourceDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  useEffect(() => {
    if (!currentFarm?.id) return;
    const controller = new AbortController();
    apiFetch(`/api/farms/${currentFarm.id}/slurry-stores`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((d) => {
        const list: Store[] = d.records ?? d ?? [];
        setStores(list);
        if (list.length === 1) {
          setSelectedStoreId(list[0].id);
          if (list[0].material) setMaterialType(list[0].material);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoadingStores(false);
      });
    return () => controller.abort();
  }, [currentFarm?.id]);

  const selectedStore = stores.find((s) => s.id === selectedStoreId) ?? null;
  const materialLocked = !!selectedStore?.material;

  const handleStoreSelect = (store: Store) => {
    setSelectedStoreId(store.id);
    if (store.material) {
      setMaterialType(store.material);
    } else {
      setMaterialType("");
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

  const handleSave = async () => {
    if (!selectedStoreId) {
      Alert.alert("Store Required", "Please select the store receiving this material.");
      return;
    }
    if (!materialType) {
      Alert.alert("Material Required", "Please select or confirm the material type.");
      return;
    }
    if (!volumeM3.trim()) {
      Alert.alert("Volume Required", "Please enter the volume added (m³).");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: SlurryFillEvent = {
      id: generateId(),
      farmId: String(currentFarm?.id ?? ""),
      storeId: String(selectedStoreId),
      storeName: selectedStore?.storeName ?? "",
      materialType,
      eventDate,
      volumeM3: volumeM3.trim(),
      sourceDescription: sourceDescription.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SLURRY_FILL_EVENTS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert("Saved", "Fill / intake event saved and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
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
            <Text style={styles.title}>Slurry Store Fill Event</Text>
            <Text style={styles.subtitle}>Log intake · species-specific storage enforced</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Store selection */}
          <Text style={styles.sectionTitle}>Store Receiving Material *</Text>
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
                    {s.capacityM3 ? ` · ${s.capacityM3}m³ cap.` : ""}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Material type */}
          <Text style={styles.sectionTitle}>Material Type *</Text>
          {materialLocked ? (
            <View style={styles.lockedRow}>
              <Text style={styles.lockIcon}>🔒</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.lockedValue}>{selectedStore!.material}</Text>
                <Text style={styles.lockedHint}>
                  This store accepts {selectedStore!.material} only — species-specific storage enforced
                </Text>
              </View>
            </View>
          ) : selectedStoreId ? (
            <View style={styles.chipRow}>
              {SPREAD_MATERIALS.map((m) => (
                <Pressable
                  key={m}
                  style={[styles.chip, materialType === m && styles.chipActive]}
                  onPress={() => {
                    setMaterialType(m);
                    Haptics.selectionAsync();
                  }}
                >
                  <Text
                    style={[styles.chipText, materialType === m && styles.chipTextActive]}
                  >
                    {m}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.hint}>Select a store above to set material type</Text>
          )}

          {/* Date */}
          <Text style={styles.sectionTitle}>Date of Fill *</Text>
          <Input
            value={eventDate}
            onChangeText={setEventDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />

          {/* Volume */}
          <Text style={styles.sectionTitle}>Volume Added (m³) *</Text>
          <Input
            value={volumeM3}
            onChangeText={setVolumeM3}
            placeholder="e.g. 50.0"
            keyboardType="decimal-pad"
          />
          {selectedStore?.capacityM3 && volumeM3 && Number(volumeM3) > 0 && (
            <View style={styles.capacityBar}>
              <View style={styles.capacityBarTrack}>
                <View
                  style={[
                    styles.capacityBarFill,
                    {
                      width: `${Math.min(100, (Number(volumeM3) / selectedStore.capacityM3) * 100)}%`,
                      backgroundColor:
                        Number(volumeM3) / selectedStore.capacityM3 > 0.9
                          ? colors.error
                          : Number(volumeM3) / selectedStore.capacityM3 > 0.75
                          ? "#F59E0B"
                          : colors.success,
                    },
                  ]}
                />
              </View>
              <Text style={styles.capacityLabel}>
                {((Number(volumeM3) / selectedStore.capacityM3) * 100).toFixed(0)}% of{" "}
                {selectedStore.capacityM3}m³ capacity
              </Text>
            </View>
          )}

          {/* Source */}
          <Text style={styles.sectionTitle}>Source / Origin</Text>
          <Input
            value={sourceDescription}
            onChangeText={setSourceDescription}
            placeholder="e.g. cattle housing, dirty water, import from farm"
          />

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

          {/* Notes */}
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
            title={saving ? "Saving…" : "Log Fill Event"}
            onPress={handleSave}
            disabled={saving || !selectedStoreId}
            fullWidth
            icon="arrow-down"
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
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  alertBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  alertText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm },
  capacityBar: { marginTop: spacing.xs },
  capacityBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderLight,
    overflow: "hidden",
  },
  capacityBarFill: { height: "100%", borderRadius: 3 },
  capacityLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
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
