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
import type { CropEvent } from "@/lib/types";
import { PhotoAttachButton } from "@/components/ui/PhotoAttachButton";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";

const EVENT_TYPES: { key: CropEvent["eventType"]; label: string; icon: keyof typeof Feather.glyphMap; color: string }[] = [
  { key: "drilling", label: "Drilling", icon: "arrow-down", color: colors.fieldBrown },
  { key: "spraying", label: "Spraying", icon: "droplet", color: colors.info },
  { key: "fertilising", label: "Fertilising", icon: "zap", color: colors.accent },
  { key: "harvesting", label: "Harvesting", icon: "scissors", color: colors.fieldGold },
  { key: "cultivation", label: "Cultivation", icon: "grid", color: colors.primaryDark },
  { key: "inspection", label: "Inspection", icon: "eye", color: "#8B5CF6" },
  { key: "other", label: "Other", icon: "more-horizontal", color: colors.textSecondary },
];

export default function CropEventScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [fieldName, setFieldName] = useState("");
  const [eventType, setEventType] = useState<CropEvent["eventType"] | "">("");
  const [description, setDescription] = useState("");
  const [yieldAmount, setYieldAmount] = useState("");
  const [yieldUnit, setYieldUnit] = useState("t/ha");
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoCaption, setPhotoCaption] = useState("");

  const handleSave = async () => {
    if (!fieldName.trim() || !eventType) {
      Alert.alert("Required", "Please select a field and event type.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let documentUrl: string | undefined;
    if (photoUri) {
      try {
        const objectPath = await uploadPhotoToStorage(photoUri, getApiBase(), "crop-event-photo.jpg");
        if (objectPath) documentUrl = objectPath;
      } catch {
        // The record remains available for sync even when the optional photo upload fails.
      }
    }

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
      console.warn("Crop event location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const event: CropEvent = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: fieldName.trim(),
      eventType: eventType as CropEvent["eventType"],
      date: new Date().toISOString(),
      description: description.trim(),
      operatorName: user?.name || "",
      yieldAmount: eventType === "harvesting" ? yieldAmount.trim() : "",
      yieldUnit: eventType === "harvesting" ? yieldUnit : "",
      notes: notes.trim(),
      photoIds: [],
      documentUrl,
      documentCaption: photoCaption.trim() || undefined,
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.CROP_EVENTS, event);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Crop event saved successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Crop Event</Text>
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
          <FieldPicker
            label="Field"
            value={fieldName}
            onChange={setFieldName}
            fields={fields}
            loading={fieldsLoading}
            error={fieldsError}
          />

          <View style={styles.sectionLabel}>
            <Feather name="tag" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Event Type</Text>
          </View>
          <View style={styles.typeGrid}>
            {EVENT_TYPES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => {
                  Haptics.selectionAsync();
                  setEventType(t.key);
                }}
                style={[
                  styles.typeChip,
                  eventType === t.key && { backgroundColor: t.color, borderColor: t.color },
                ]}
              >
                <Feather name={t.icon} size={16} color={eventType === t.key ? colors.textInverse : t.color} />
                <Text
                  style={[
                    styles.typeChipText,
                    eventType === t.key && { color: colors.textInverse },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="Description"
            placeholder="What was done..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {eventType === "harvesting" && (
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
                label="Yield Unit"
                placeholder="e.g. t/ha"
                value={yieldUnit}
                onChangeText={setYieldUnit}
                containerStyle={styles.flex}
              />
            </View>
          )}

          <Input
            label="Notes"
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          {photoUri ? (
            <Input
              label="Photo Caption"
              placeholder="Describe what this photo shows..."
              value={photoCaption}
              onChangeText={setPhotoCaption}
              multiline
              numberOfLines={2}
              maxLength={300}
            />
          ) : null}
          <PhotoAttachButton
            photoUri={photoUri}
            onPhotoSelected={(uri) => {
              setPhotoUri(uri);
              if (uri !== photoUri) setPhotoCaption("");
            }}
            caption={photoCaption}
            label="Attach Photo"
            promptTitle="Attach Photo to Crop Event"
          />

          <Button
            title="Save Crop Event"
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
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
