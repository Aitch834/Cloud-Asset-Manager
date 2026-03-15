import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFields } from "@/lib/hooks/useApiFields";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { SoilSample } from "@/lib/types";

export default function SoilSampleScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [fieldName, setFieldName] = useState("");
  const [sampleReference, setSampleReference] = useState("");
  const [sampledBy, setSampledBy] = useState("");
  const [labName, setLabName] = useState("");
  const [depth, setDepth] = useState("");
  const [ph, setPh] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [magnesium, setMagnesium] = useState("");
  const [organicMatter, setOrganicMatter] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!fieldName.trim() || !sampleReference.trim()) {
      Alert.alert("Required", "Please select a field and enter the sample reference.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let latitude: number | undefined;
    let longitude: number | undefined;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch (locErr: unknown) {
      console.warn("Soil sample location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const sample: SoilSample = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: fieldName.trim(),
      sampleReference: sampleReference.trim(),
      dateTaken: new Date().toISOString(),
      sampledBy: sampledBy.trim(),
      labName: labName.trim(),
      depth: depth.trim(),
      ph: ph.trim(),
      phosphorus: phosphorus.trim(),
      potassium: potassium.trim(),
      magnesium: magnesium.trim(),
      organicMatter: organicMatter.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      photoIds: [],
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SOIL_SAMPLES, sample);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Soil sample saved successfully.", [
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
            fields={fields}
            loading={fieldsLoading}
            error={fieldsError}
          />
          <View style={styles.row}>
            <Input
              label="Sample Reference"
              placeholder="e.g. SS-001"
              value={sampleReference}
              onChangeText={setSampleReference}
              containerStyle={styles.flex}
              required
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
          <View style={styles.row}>
            <Input
              label="Sampled By"
              placeholder="Name of sampler"
              value={sampledBy}
              onChangeText={setSampledBy}
              containerStyle={styles.flex}
            />
            <Input
              label="Lab Submitted To"
              placeholder="e.g. NRM Laboratories"
              value={labName}
              onChangeText={setLabName}
              containerStyle={styles.flex}
            />
          </View>

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
});
