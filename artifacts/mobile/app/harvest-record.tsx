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
import { FieldPicker } from "@/components/ui/FieldPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFields } from "@/lib/hooks/useApiFields";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { HarvestRecord } from "@/lib/types";

const CROP_TYPES = [
  "Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley",
  "Oats", "OSR", "Peas", "Beans", "Maize", "Rye", "Triticale", "Other",
];

export default function HarvestRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [fieldName, setFieldName] = useState("");
  const [cropType, setCropType] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");
  const [yieldUnit, setYieldUnit] = useState("t/ha");
  const [moisturePercent, setMoisturePercent] = useState("");
  const [grainQualityNotes, setGrainQualityNotes] = useState("");
  const [trailerVehicleNumber, setTrailerVehicleNumber] = useState("");
  const [storageDestination, setStorageDestination] = useState("");
  const [equipmentUsed, setEquipmentUsed] = useState("");
  const [operatorName, setOperatorName] = useState(user?.name || "");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!fieldName.trim() || !cropType) {
      Alert.alert("Required Fields", "Please select a field and crop type.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch (locErr: unknown) {
      console.warn("Location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const record: HarvestRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: fieldName.trim(),
      cropType,
      harvestDate: new Date().toISOString(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      yieldAmount: yieldAmount.trim(),
      yieldUnit,
      moisturePercent: moisturePercent.trim(),
      grainQualityNotes: grainQualityNotes.trim(),
      trailerVehicleNumber: trailerVehicleNumber.trim(),
      storageDestination: storageDestination.trim(),
      operatorName: operatorName.trim(),
      equipmentUsed: equipmentUsed.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.HARVEST_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Harvest record saved successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Harvest Record</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.fieldGold} />
            <Text style={styles.sectionTitle}>Field</Text>
          </View>
          <FieldPicker
            label="Field"
            value={fieldName}
            onChange={setFieldName}
            fields={fields}
            loading={fieldsLoading}
            error={fieldsError}
          />

          <View style={styles.sectionLabel}>
            <Feather name="tag" size={14} color={colors.fieldBrown} />
            <Text style={styles.sectionTitle}>Crop Type</Text>
          </View>
          <View style={styles.chipGrid}>
            {CROP_TYPES.map((c) => (
              <Pressable
                key={c}
                onPress={() => { Haptics.selectionAsync(); setCropType(c); }}
                style={[
                  styles.chip,
                  cropType === c && { backgroundColor: colors.fieldGold, borderColor: colors.fieldGold },
                ]}
              >
                <Text style={[styles.chipText, cropType === c && { color: colors.textInverse }]}>{c}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="bar-chart-2" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Yield & Quality</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="Yield Amount"
              placeholder="e.g. 8.5"
              value={yieldAmount}
              onChangeText={setYieldAmount}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Unit"
              placeholder="t/ha"
              value={yieldUnit}
              onChangeText={setYieldUnit}
              containerStyle={{ width: 90 }}
            />
          </View>
          <Input
            label="Moisture %"
            placeholder="e.g. 15"
            value={moisturePercent}
            onChangeText={setMoisturePercent}
            keyboardType="decimal-pad"
          />
          <Input
            label="Grain Quality / Grade Notes"
            placeholder="e.g. Group 1, low N, clean sample"
            value={grainQualityNotes}
            onChangeText={setGrainQualityNotes}
            multiline
            numberOfLines={2}
          />

          <View style={styles.sectionLabel}>
            <Feather name="clock" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Timing</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="Start Time"
              placeholder="e.g. 09:30"
              value={startTime}
              onChangeText={setStartTime}
              containerStyle={styles.flex}
            />
            <Input
              label="End Time"
              placeholder="e.g. 18:00"
              value={endTime}
              onChangeText={setEndTime}
              containerStyle={styles.flex}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="truck" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Transport & Storage</Text>
          </View>
          <Input
            label="Trailer / Vehicle No."
            placeholder="e.g. Trailer 3, AB12 CDE"
            value={trailerVehicleNumber}
            onChangeText={setTrailerVehicleNumber}
          />
          <Input
            label="Storage Destination"
            placeholder="e.g. Grain store 1, merchant name"
            value={storageDestination}
            onChangeText={setStorageDestination}
          />

          <View style={styles.sectionLabel}>
            <Feather name="tool" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Equipment & Operator</Text>
          </View>
          <Input
            label="Combine / Equipment Used"
            placeholder="e.g. New Holland CR8090"
            value={equipmentUsed}
            onChangeText={setEquipmentUsed}
          />
          <Input
            label="Operator Name"
            placeholder="Operator"
            value={operatorName}
            onChangeText={setOperatorName}
          />
          <Input
            label="Notes"
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Harvest Record"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: { flexDirection: "row", gap: spacing.md },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
});
