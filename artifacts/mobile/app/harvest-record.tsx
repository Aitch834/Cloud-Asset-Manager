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
import { StoragePicker } from "@/components/ui/StoragePicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFields } from "@/lib/hooks/useApiFields";
import { useApiStorageLocations } from "@/lib/hooks/useApiStorageLocations";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { HarvestRecord, TransportRun } from "@/lib/types";

const CROP_TYPES = [
  "Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley",
  "Oats", "OSR", "Peas", "Beans", "Maize", "Rye", "Triticale", "Other",
];

function formatCurrentTime() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, "0");
  const m = now.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

const emptyRun = (): TransportRun => ({ vehicleNumber: "", storageDestination: "", loadNotes: "" });

export default function HarvestRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);
  const { locations: storageLocations, loading: storageLoading, error: storageError } = useApiStorageLocations(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [fieldName, setFieldName] = useState("");
  const [cropType, setCropType] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");
  const [yieldUnit, setYieldUnit] = useState("t/ha");
  const [moisturePercent, setMoisturePercent] = useState("");
  const [grainQualityNotes, setGrainQualityNotes] = useState("");
  const [transportRuns, setTransportRuns] = useState<TransportRun[]>([emptyRun()]);
  const [equipmentUsed, setEquipmentUsed] = useState("");
  const [operatorName, setOperatorName] = useState(user?.name || "");
  const [startTime, setStartTime] = useState(formatCurrentTime());
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");

  function updateRun(index: number, field: keyof TransportRun, value: string) {
    setTransportRuns((prev) => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  }

  function addRun() {
    Haptics.selectionAsync();
    setTransportRuns((prev) => [...prev, emptyRun()]);
  }

  function removeRun(index: number) {
    Haptics.selectionAsync();
    setTransportRuns((prev) => prev.filter((_, i) => i !== index));
  }

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

    const filledRuns = transportRuns.filter((r) => r.vehicleNumber.trim() || r.storageDestination.trim());

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
      transportRuns: filledRuns.length > 0 ? filledRuns : undefined,
      trailerVehicleNumber: filledRuns.map((r) => r.vehicleNumber).filter(Boolean).join(", "),
      storageDestination: filledRuns.map((r) => r.storageDestination).filter(Boolean).join(", "),
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
          <Text style={styles.hintText}>Start time pre-filled from your device clock. Tap to adjust.</Text>

          <View style={styles.sectionLabel}>
            <Feather name="truck" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Transport & Storage</Text>
          </View>
          <Text style={styles.hintText}>
            Add a row for each tractor/trailer run. Use multiple rows if loads go to different stores or vehicles change throughout the day.
          </Text>

          {transportRuns.map((run, index) => (
            <View key={index} style={styles.transportCard}>
              <View style={styles.transportCardHeader}>
                <View style={styles.transportRunBadge}>
                  <Feather name="truck" size={11} color={colors.textSecondary} />
                  <Text style={styles.transportRunLabel}>Run {index + 1}</Text>
                </View>
                {transportRuns.length > 1 && (
                  <Pressable onPress={() => removeRun(index)} style={styles.removeBtn} hitSlop={8}>
                    <Feather name="x" size={14} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>
              <Input
                label="Tractor / Trailer No."
                placeholder="e.g. AB12 CDE, Trailer 3"
                value={run.vehicleNumber}
                onChangeText={(v) => updateRun(index, "vehicleNumber", v)}
              />
              <StoragePicker
                label="Storage Destination"
                value={run.storageDestination}
                onChange={(v) => updateRun(index, "storageDestination", v)}
                locations={storageLocations}
                loading={storageLoading}
                error={storageError}
              />
              <Input
                label="Load Notes (optional)"
                placeholder="e.g. approx 10t, partial load, final run"
                value={run.loadNotes ?? ""}
                onChangeText={(v) => updateRun(index, "loadNotes", v)}
              />
            </View>
          ))}

          <Pressable onPress={addRun} style={styles.addRunBtn}>
            <Feather name="plus" size={15} color={colors.primary} />
            <Text style={styles.addRunText}>Add Another Transport Run</Text>
          </Pressable>

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
          <Text style={styles.hintText}>Pre-filled from your login. Tap to change if recording on behalf of another operator.</Text>

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
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
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
  hintText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  transportCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  transportCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  transportRunBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  transportRunLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  removeBtn: {
    padding: spacing.xs,
  },
  addRunBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderStyle: "dashed",
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
  },
  addRunText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});
