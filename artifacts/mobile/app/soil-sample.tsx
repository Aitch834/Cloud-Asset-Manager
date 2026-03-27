import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FieldPicker } from "@/components/ui/FieldPicker";
import { LabPicker } from "@/components/ui/LabPicker";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFields } from "@/lib/hooks/useApiFields";
import { useApiLabs } from "@/lib/hooks/useApiLabs";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { SoilSample } from "@/lib/types";

type GpsStatus = "idle" | "capturing" | "captured" | "denied" | "error";

export default function SoilSampleScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading, error: fieldsError, fromCache: fieldsCached } = useApiFields(currentFarm?.id);
  const { labs, loading: labsLoading, error: labsError, fromCache: labsCached } = useApiLabs(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [fieldId, setFieldId] = useState<number | undefined>(undefined);
  const [fieldName, setFieldName] = useState("");
  const [sampleReference, setSampleReference] = useState("");
  const [sampledBy, setSampledBy] = useState("");
  const [labId, setLabId] = useState<number | null>(null);
  const [labName, setLabName] = useState("");
  const [depth, setDepth] = useState("");
  const [ph, setPh] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [magnesium, setMagnesium] = useState("");
  const [organicMatter, setOrganicMatter] = useState("");
  const [notes, setNotes] = useState("");

  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
  const [gpsLat, setGpsLat] = useState<number | undefined>(undefined);
  const [gpsLng, setGpsLng] = useState<number | undefined>(undefined);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | undefined>(undefined);
  const [locationDescription, setLocationDescription] = useState("");

  const captureGps = async () => {
    setGpsStatus("capturing");
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGpsStatus("denied");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
      setGpsLat(loc.coords.latitude);
      setGpsLng(loc.coords.longitude);
      setGpsAccuracy(loc.coords.accuracy ?? undefined);
      setGpsStatus("captured");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setGpsStatus("error");
    }
  };

  const clearGps = () => {
    setGpsLat(undefined);
    setGpsLng(undefined);
    setGpsAccuracy(undefined);
    setGpsStatus("idle");
  };

  const handleSave = async () => {
    if (!fieldName.trim()) {
      Alert.alert("Required", "Please select a field before saving.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const sample: SoilSample = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldId,
      fieldName: fieldName.trim(),
      sampleReference: sampleReference.trim(),
      dateTaken: new Date().toISOString(),
      sampledBy: sampledBy.trim(),
      labName: labName.trim(),
      labSupplierId: labId ?? undefined,
      depth: depth.trim(),
      ph: ph.trim(),
      phosphorus: phosphorus.trim(),
      potassium: potassium.trim(),
      magnesium: magnesium.trim(),
      organicMatter: organicMatter.trim(),
      notes: notes.trim(),
      latitude: gpsLat,
      longitude: gpsLng,
      locationDescription: locationDescription.trim() || undefined,
      photoIds: [],
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SOIL_SAMPLES, sample);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Soil sample saved. Lab results can be added in the dashboard once synced.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Soil Sample</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Sample Location</Text>
          </View>
          <FieldPicker
            label="Field"
            value={fieldName}
            onChange={setFieldName}
            onChangeField={(f) => { setFieldName(f.name); setFieldId(f.id); }}
            fields={fields}
            loading={fieldsLoading}
            fromCache={fieldsCached}
            error={fieldsError}
          />

          {/* GPS capture */}
          <View style={styles.gpsCard}>
            <View style={styles.gpsRow}>
              <View style={styles.gpsLabelRow}>
                <Feather
                  name="crosshair"
                  size={14}
                  color={gpsStatus === "captured" ? colors.success ?? "#16a34a" : colors.textSecondary}
                />
                <Text style={[styles.gpsLabel, gpsStatus === "captured" && styles.gpsLabelCaptured]}>
                  {gpsStatus === "idle" ? "GPS Point" :
                   gpsStatus === "capturing" ? "Capturing GPS…" :
                   gpsStatus === "captured" ? "GPS Captured" :
                   gpsStatus === "denied" ? "Location permission denied" :
                   "GPS unavailable"}
                </Text>
              </View>
              {gpsStatus === "idle" || gpsStatus === "denied" || gpsStatus === "error" ? (
                <TouchableOpacity style={styles.gpsCaptureBtn} onPress={captureGps} activeOpacity={0.7}>
                  <Feather name="crosshair" size={13} color={colors.primary} />
                  <Text style={styles.gpsCaptureBtnText}>Capture GPS</Text>
                </TouchableOpacity>
              ) : gpsStatus === "capturing" ? (
                <View style={styles.gpsCapturing}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.gpsCapturingText}>Locating…</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.gpsRecaptureBtn} onPress={captureGps} activeOpacity={0.7}>
                  <Feather name="refresh-cw" size={12} color={colors.textSecondary} />
                  <Text style={styles.gpsRecaptureBtnText}>Re-capture</Text>
                </TouchableOpacity>
              )}
            </View>

            {gpsStatus === "captured" && gpsLat !== undefined && gpsLng !== undefined && (
              <View style={styles.gpsCoords}>
                <View style={styles.gpsCoordsRow}>
                  <View style={styles.gpsCoordsItem}>
                    <Text style={styles.gpsCoordsLabel}>Latitude</Text>
                    <Text style={styles.gpsCoordsValue}>{gpsLat.toFixed(6)}</Text>
                  </View>
                  <View style={styles.gpsCoordsItem}>
                    <Text style={styles.gpsCoordsLabel}>Longitude</Text>
                    <Text style={styles.gpsCoordsValue}>{gpsLng.toFixed(6)}</Text>
                  </View>
                  {gpsAccuracy !== undefined && (
                    <View style={styles.gpsCoordsItem}>
                      <Text style={styles.gpsCoordsLabel}>Accuracy</Text>
                      <Text style={styles.gpsCoordsValue}>±{Math.round(gpsAccuracy)}m</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={clearGps} style={styles.gpsClearBtn}>
                  <Feather name="x" size={11} color={colors.textSecondary} />
                  <Text style={styles.gpsClearBtnText}>Clear</Text>
                </TouchableOpacity>
              </View>
            )}

            {gpsStatus === "denied" && (
              <Text style={styles.gpsHint}>Enable location access in your device settings to capture GPS coordinates.</Text>
            )}
            {gpsStatus === "idle" && (
              <Text style={styles.gpsHint}>Tap "Capture GPS" to record the precise position of this sample point within the field.</Text>
            )}
          </View>

          <Input
            label="Location description (optional)"
            placeholder="e.g. NE corner near hedge, 50m from gate"
            value={locationDescription}
            onChangeText={setLocationDescription}
          />

          <View style={styles.row}>
            <Input
              label="Sample Reference (optional)"
              placeholder="Auto-generated if blank"
              value={sampleReference}
              onChangeText={setSampleReference}
              containerStyle={styles.flex}
            />
            <Input
              label="Depth (cm)"
              placeholder="e.g. 30"
              value={depth}
              onChangeText={setDepth}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
          </View>
          <Input
            label="Sampled By"
            placeholder="Name of sampler"
            value={sampledBy}
            onChangeText={setSampledBy}
          />
          <LabPicker
            value={labId}
            labName={labName}
            onChange={(id, name) => { setLabId(id); setLabName(name); }}
            onClear={() => { setLabId(null); setLabName(""); }}
            labs={labs}
            loading={labsLoading}
            fromCache={labsCached}
            error={labsError}
          />

          <View style={styles.sectionLabel}>
            <Feather name="bar-chart-2" size={14} color={colors.fieldBrown} />
            <Text style={styles.sectionTitle}>Analysis Results</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="pH"
              placeholder="e.g. 6.5"
              value={ph}
              onChangeText={setPh}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="P (mg/L)"
              placeholder="Phosphorus"
              value={phosphorus}
              onChangeText={setPhosphorus}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
          </View>
          <View style={styles.row}>
            <Input
              label="K (mg/L)"
              placeholder="Potassium"
              value={potassium}
              onChangeText={setPotassium}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Mg (mg/L)"
              placeholder="Magnesium"
              value={magnesium}
              onChangeText={setMagnesium}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
          </View>
          <Input
            label="Organic Matter (%)"
            placeholder="e.g. 4.2"
            value={organicMatter}
            onChangeText={setOrganicMatter}
            keyboardType="decimal-pad"
          />

          <Input
            label="Notes"
            placeholder="Any additional observations..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Soil Sample"
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
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
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  gpsCard: {
    backgroundColor: colors.cardBackground ?? "#f9fafb",
    borderWidth: 1,
    borderColor: colors.border ?? "#e5e7eb",
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  gpsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gpsLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gpsLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  gpsLabelCaptured: {
    color: "#15803d",
  },
  gpsCaptureBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.primaryLight ?? "#e8f4fd",
  },
  gpsCaptureBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  gpsCapturing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  gpsCapturingText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  gpsRecaptureBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  gpsRecaptureBtnText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  gpsCoords: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border ?? "#e5e7eb",
    paddingTop: spacing.sm,
  },
  gpsCoordsRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  gpsCoordsItem: {
    flex: 1,
  },
  gpsCoordsLabel: {
    fontFamily: fonts.regular,
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  gpsCoordsValue: {
    fontFamily: fonts.mono ?? fonts.regular,
    fontSize: fontSize.xs,
    color: "#15803d",
    fontWeight: "600",
  },
  gpsClearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: spacing.xs ?? 4,
    alignSelf: "flex-end",
  },
  gpsClearBtnText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
  gpsHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs ?? 4,
    lineHeight: 16,
  },
});
