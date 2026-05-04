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
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { HorticultureRecord } from "@/lib/types";

type ActivityType = HorticultureRecord["activityType"];

const ACTIVITY_TYPES: { key: ActivityType; label: string; icon: string; color: string }[] = [
  { key: "planting", label: "Planting", icon: "arrow-down", color: "#16a34a" },
  { key: "transplanting", label: "Transplanting", icon: "shuffle", color: "#0891b2" },
  { key: "harvest", label: "Harvest", icon: "package", color: "#d97706" },
  { key: "thinning", label: "Thinning", icon: "scissors", color: "#7c3aed" },
  { key: "pruning", label: "Pruning", icon: "edit-2", color: "#db2777" },
  { key: "soil_prep", label: "Soil Preparation", icon: "layers", color: "#92400e" },
  { key: "other", label: "Other", icon: "more-horizontal", color: colors.textSecondary },
];

export default function HorticultureRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [activityType, setActivityType] = useState<ActivityType>("planting");
  const [activityDate, setActivityDate] = useState(today);
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [blockOrField, setBlockOrField] = useState("");
  const [areaM2, setAreaM2] = useState("");
  const [rowsOrBeds, setRowsOrBeds] = useState("");
  const [plantingDensity, setPlantingDensity] = useState("");
  const [seedLotNumber, setSeedLotNumber] = useState("");
  const [seedSupplier, setSeedSupplier] = useState("");
  const [harvestWeightKg, setHarvestWeightKg] = useState("");
  const [weatherConditions, setWeatherConditions] = useState("");
  const [operator, setOperator] = useState(user?.name || "");
  const [notes, setNotes] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();

  const isPlanting = activityType === "planting" || activityType === "transplanting";
  const isHarvest = activityType === "harvest";

  const handleGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}
  };

  const handleSave = async () => {
    if (!cropName.trim() || !blockOrField.trim()) {
      Alert.alert("Required Fields", "Please enter the crop name and block/field.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: HorticultureRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      activityType,
      activityDate,
      cropName: cropName.trim(),
      variety: variety.trim(),
      blockOrField: blockOrField.trim(),
      areaM2: areaM2.trim(),
      rowsOrBeds: rowsOrBeds.trim(),
      plantingDensity: plantingDensity.trim(),
      seedLotNumber: seedLotNumber.trim(),
      seedSupplier: seedSupplier.trim(),
      harvestWeightKg: harvestWeightKg.trim(),
      operator: operator.trim(),
      weatherConditions: weatherConditions.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.HORTICULTURE_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Horticulture record saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  const selectedActivity = ACTIVITY_TYPES.find((a) => a.key === activityType);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Horticulture Record</Text>
            <Text style={styles.subtitle}>Planting, transplanting, harvesting & more</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Activity Type</Text>
          <View style={styles.chipRow}>
            {ACTIVITY_TYPES.map((a) => (
              <Pressable key={a.key} onPress={() => setActivityType(a.key)} style={[styles.chip, activityType === a.key && { borderColor: a.color, backgroundColor: a.color + "18" }]}>
                <Feather name={a.icon as any} size={12} color={activityType === a.key ? a.color : colors.textSecondary} />
                <Text style={[styles.chipText, activityType === a.key ? { color: a.color, fontFamily: fonts.semiBold } : null]}>{a.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Crop & Location</Text>
          <Input label="Activity Date" value={activityDate} onChangeText={setActivityDate} placeholder="YYYY-MM-DD" maxDate="today" />
          <Input label="Crop Name *" value={cropName} onChangeText={setCropName} placeholder="e.g. Strawberry, Lettuce, Leek" />
          <Input label="Variety" value={variety} onChangeText={setVariety} placeholder="e.g. Elsanta, Cos" />
          <Input label="Block / Field / Bed *" value={blockOrField} onChangeText={setBlockOrField} placeholder="e.g. Block A, Field 3" />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Area (m²)" value={areaM2} onChangeText={setAreaM2} placeholder="e.g. 500" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Rows / Beds" value={rowsOrBeds} onChangeText={setRowsOrBeds} placeholder="e.g. 12 rows" />
            </View>
          </View>

          {isPlanting && (
            <>
              <Text style={styles.sectionTitle}>Seed / Plant Details</Text>
              <Input label="Planting Density (plants/m²)" value={plantingDensity} onChangeText={setPlantingDensity} placeholder="e.g. 5" keyboardType="decimal-pad" />
              <Input label="Seed / Plant Lot Number" value={seedLotNumber} onChangeText={setSeedLotNumber} placeholder="Traceability lot reference" />
              <Input label="Seed / Plug Supplier" value={seedSupplier} onChangeText={setSeedSupplier} placeholder="Supplier name" />
            </>
          )}

          {isHarvest && (
            <>
              <Text style={styles.sectionTitle}>Harvest Details</Text>
              <Input label="Harvest Weight (kg)" value={harvestWeightKg} onChangeText={setHarvestWeightKg} placeholder="Total weight harvested" keyboardType="decimal-pad" />
            </>
          )}

          <Text style={styles.sectionTitle}>Operations</Text>
          <Input label="Operator" value={operator} onChangeText={setOperator} placeholder="Name" />
          <Input label="Weather Conditions" value={weatherConditions} onChangeText={setWeatherConditions} placeholder="e.g. Sunny 18°C, light breeze" />

          <Pressable onPress={handleGps} style={styles.gpsButton}>
            <Feather name="map-pin" size={16} color={latitude ? colors.success : colors.primary} />
            <Text style={[styles.gpsText, latitude !== undefined ? { color: colors.success } : null]}>
              {latitude !== undefined ? `GPS: ${latitude.toFixed(5)}, ${longitude?.toFixed(5)}` : "Capture GPS Location"}
            </Text>
          </Pressable>

          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional observations…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : `Save ${selectedActivity?.label || "Record"}`} onPress={handleSave} disabled={saving} style={styles.saveButton} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  gpsButton: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  gpsText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary },
  saveButton: { marginTop: spacing.lg },
});
