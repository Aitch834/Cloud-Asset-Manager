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
import type { FieldInspection } from "@/lib/types";

type ActionRequired = FieldInspection["actionRequired"];

const ACTIONS: { key: ActionRequired; label: string; color: string }[] = [
  { key: "none", label: "No Action", color: colors.success },
  { key: "monitor", label: "Monitor", color: colors.accent },
  { key: "treat", label: "Treatment Recommended", color: colors.error },
  { key: "urgent", label: "Urgent Action", color: "#7C3AED" },
];

const GROWTH_STAGES = [
  "Germination", "GS10–19", "GS20–29", "GS30–39",
  "GS40–49", "GS50–59", "GS60–69", "GS70–79", "GS80–89", "Harvest",
];

export default function FieldInspectionScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [fieldName, setFieldName] = useState("");
  const [cropType, setCropType] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [pestDiseaseObservations, setPestDiseaseObservations] = useState("");
  const [actionRequired, setActionRequired] = useState<ActionRequired>("none");
  const [recommendedAction, setRecommendedAction] = useState("");
  const [inspector, setInspector] = useState(user?.name || "");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!fieldName.trim()) {
      Alert.alert("Required Fields", "Please select a field.");
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

    const record: FieldInspection = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: fieldName.trim(),
      inspectionDate: new Date().toISOString(),
      cropType: cropType.trim(),
      growthStage,
      pestDiseaseObservations: pestDiseaseObservations.trim(),
      actionRequired,
      recommendedAction: recommendedAction.trim(),
      inspector: inspector.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.FIELD_INSPECTIONS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Field inspection saved successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Field Crop Inspection</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.primary} />
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
            <Feather name="layers" size={14} color={colors.fieldGreen} />
            <Text style={styles.sectionTitle}>Crop & Growth Stage</Text>
          </View>
          <Input
            label="Crop Type"
            placeholder="e.g. Winter wheat, OSR"
            value={cropType}
            onChangeText={setCropType}
          />
          <View style={styles.stageGrid}>
            {GROWTH_STAGES.map((gs) => (
              <Pressable
                key={gs}
                onPress={() => { Haptics.selectionAsync(); setGrowthStage(gs); }}
                style={[
                  styles.stageChip,
                  growthStage === gs && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.stageText, growthStage === gs && { color: colors.textInverse }]}>{gs}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="search" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Observations</Text>
          </View>
          <Input
            label="Pest / Disease Observations"
            placeholder="e.g. Septoria on lower leaves (5-15%), aphid pressure moderate, slugs in headlands"
            value={pestDiseaseObservations}
            onChangeText={setPestDiseaseObservations}
            multiline
            numberOfLines={4}
          />

          <View style={styles.sectionLabel}>
            <Feather name="flag" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Action Required</Text>
          </View>
          <View style={styles.actionGrid}>
            {ACTIONS.map((a) => (
              <Pressable
                key={a.key}
                onPress={() => { Haptics.selectionAsync(); setActionRequired(a.key); }}
                style={[
                  styles.actionCard,
                  actionRequired === a.key && { borderColor: a.color, backgroundColor: a.color + "18" },
                ]}
              >
                <View style={[styles.actionDot, { backgroundColor: actionRequired === a.key ? a.color : colors.border }]} />
                <Text style={[styles.actionLabel, actionRequired === a.key && { color: a.color }]}>
                  {a.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {actionRequired !== "none" && (
            <Input
              label="Recommended Action"
              placeholder="e.g. Apply T1 fungicide, target BBCH 31–32"
              value={recommendedAction}
              onChangeText={setRecommendedAction}
              multiline
              numberOfLines={2}
            />
          )}

          <View style={styles.sectionLabel}>
            <Feather name="user" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Inspector</Text>
          </View>
          <Input
            label="Inspector Name"
            value={inspector}
            onChangeText={setInspector}
            placeholder="Your name"
          />
          <Input
            label="Notes"
            placeholder="Any additional observations or photos reference..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Inspection"
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
  stageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stageChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  actionGrid: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  actionLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
  },
});
