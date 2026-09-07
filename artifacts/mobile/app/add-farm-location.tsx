import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
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
import { kvGet } from "@/lib/database";
import { getMobileAuthToken as getCurrentAuthToken } from "@/lib/authToken";

async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) {
      const farm = JSON.parse(raw);
      return farm.tenantSlug || farm.slug || "";
    }
  } catch {}
  return "";
}

// ─── Location types ───────────────────────────────────────────────────
interface LocationType {
  value: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  colour: string;
}

const LOCATION_TYPES: LocationType[] = [
  { value: "livestock_building", label: "Livestock Building",     icon: "home",           colour: "#3b82f6" },
  { value: "grain_store",        label: "Crop & Feed Store",      icon: "package",        colour: "#ca8a04" },
  { value: "workshop",           label: "Equipment & Workshop",   icon: "tool",           colour: "#ea580c" },
  { value: "chemical_store",     label: "Chemical & Fuel Store",  icon: "alert-triangle", colour: "#dc2626" },
  { value: "yard",               label: "Outdoor Area / Yard",    icon: "map-pin",        colour: "#16a34a" },
  { value: "field",              label: "Field",                  icon: "map-pin",        colour: "#65a30d" },
  { value: "welfare_facility",   label: "Welfare Facility",       icon: "heart",          colour: "#9333ea" },
  { value: "office",             label: "Office / Building",      icon: "briefcase",      colour: "#475569" },
  { value: "other",              label: "Other",                  icon: "more-horizontal", colour: "#6b7280" },
];

// ─── Screen ───────────────────────────────────────────────────────────
export default function AddFarmLocationScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();

  const [name, setName] = useState("");
  const [locationType, setLocationType] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter a name for this location.");
      return;
    }
    if (!locationType) {
      Alert.alert("Required", "Please select a location type.");
      return;
    }
    if (!currentFarm?.id) {
      Alert.alert("Error", "No farm selected. Please select a farm first.");
      return;
    }

    const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
    if (!apiDomain) {
      Alert.alert("Error", "API not configured — please contact support.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // ── GPS capture ────────────────────────────────────────────────
    let latitude: number | null = null;
    let longitude: number | null = null;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch {
      // GPS optional — proceed without coordinates
    }

    // ── API call ───────────────────────────────────────────────────
    try {
      const [token, tenantSlug] = await Promise.all([getCurrentAuthToken(), getTenantSlug()]);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-tenant-slug": tenantSlug,
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(
        `https://${apiDomain}/api/farms/${currentFarm.id}/farm-locations`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            name: name.trim(),
            locationType,
            description: description.trim() || null,
            notes: notes.trim() || null,
            isActive: true,
            latitude,
            longitude,
          }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Server returned ${res.status}`);
      }

      setSaving(false);
      const typeLabel = LOCATION_TYPES.find(t => t.value === locationType)?.label ?? locationType;
      const gpsNote = latitude != null ? "\n\nGPS coordinates captured automatically." : "";

      Alert.alert(
        "Location Added",
        `"${name.trim()}" has been added as a ${typeLabel} and is now available across the dashboard.${gpsNote}`,
        [
          {
            text: "Add Another",
            onPress: () => {
              setName("");
              setLocationType("");
              setDescription("");
              setNotes("");
            },
          },
          { text: "Done", onPress: () => router.back() },
        ]
      );
    } catch (err: unknown) {
      setSaving(false);
      const msg = err instanceof Error ? err.message : "Unknown error";
      Alert.alert(
        "Could Not Save",
        `The location could not be saved to the server: ${msg}\n\nPlease check your connection and try again.`
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Farm Location</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Feather name="map-pin" size={15} color={colors.primary} />
          <Text style={styles.infoText}>
            GPS coordinates will be captured automatically when you save, pinning this location on the Farm Map.
          </Text>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Location Name <Text style={styles.required}>*</Text>
          </Text>
          <Input
            placeholder="e.g. Sugar Beet Store, Cattle Shed 3, New Grain Pit"
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Location type chips */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Location Type <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.chipGrid}>
            {LOCATION_TYPES.map(t => {
              const selected = locationType === t.value;
              return (
                <Pressable
                  key={t.value}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setLocationType(selected ? "" : t.value);
                  }}
                  style={[
                    styles.typeChip,
                    selected && { borderColor: t.colour, backgroundColor: t.colour + "18" },
                  ]}
                >
                  <Feather
                    name={t.icon}
                    size={14}
                    color={selected ? t.colour : colors.textSecondary}
                  />
                  <Text style={[styles.typeChipText, selected && { color: t.colour, fontFamily: fonts.semiBold }]}>
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description (optional)</Text>
          <Input
            placeholder="e.g. Covered clamp for sugar beet — capacity approx 500t"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes (optional)</Text>
          <Input
            placeholder="Any additional information about this location…"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            style={styles.notesInput}
          />
        </View>

        {/* Farm */}
        <View style={styles.farmRow}>
          <Feather name="home" size={13} color={colors.textSecondary} />
          <Text style={styles.farmText}>
            Adding to: <Text style={styles.farmName}>{currentFarm?.name ?? "No farm selected"}</Text>
          </Text>
        </View>

        {/* Save */}
        <Button
          title={saving ? "Saving…" : "Add Location"}
          onPress={handleSave}
          loading={saving}
          style={styles.saveBtn}
        />

        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: colors.primary + "12",
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.primary,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
  section: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  required: {
    color: colors.error,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeChipText: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
  farmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  farmText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
  },
  farmName: {
    fontFamily: fonts.semiBold,
    color: colors.text,
  },
  saveBtn: {
    marginTop: spacing.sm,
  },
});
