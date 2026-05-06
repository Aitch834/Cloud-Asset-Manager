import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
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
import { kvGet } from "@/lib/database";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

type MeterType = "electricity" | "gas" | "lpg_mains" | "other";
type ReadingType = "actual" | "estimated";

const METER_TYPES: { key: MeterType; label: string; unit: string }[] = [
  { key: "electricity", label: "Electricity", unit: "kWh" },
  { key: "gas", label: "Natural Gas", unit: "m³" },
  { key: "lpg_mains", label: "LPG (mains meter)", unit: "m³" },
  { key: "other", label: "Other Energy", unit: "units" },
];

const READING_TYPES: { key: ReadingType; label: string }[] = [
  { key: "actual", label: "Actual — meter read directly" },
  { key: "estimated", label: "Estimated — calculated from usage" },
];

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      const t = await SecureStore.getItemAsync("auth_session_token");
      if (t) return t;
    }
    const raw = await kvGet("bde_auth_token");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
}

async function uploadPhotoToStorage(photoUri: string, apiBase: string): Promise<string | null> {
  try {
    const presignRes = await fetch(`${apiBase}/api/storage/uploads/request-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "meter-reading.jpg", size: 0, contentType: "image/jpeg" }),
    });
    if (!presignRes.ok) return null;
    const { uploadURL, objectPath } = await presignRes.json();
    const fileRes = await fetch(photoUri);
    const blob = await fileRes.blob();
    const putRes = await fetch(uploadURL, {
      method: "PUT",
      body: blob,
      headers: { "Content-Type": blob.type || "image/jpeg" },
    });
    if (!putRes.ok) return null;
    return objectPath;
  } catch {
    return null;
  }
}

export default function FuelMeterReadingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [meterName, setMeterName] = useState("");
  const [meterReference, setMeterReference] = useState("");
  const [meterType, setMeterType] = useState<MeterType>("electricity");
  const [currentReading, setCurrentReading] = useState("");
  const [previousReading, setPreviousReading] = useState("");
  const [readingType, setReadingType] = useState<ReadingType>("actual");
  const [recordedBy, setRecordedBy] = useState(user?.name || "");
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const selectedMeterType = METER_TYPES.find((m) => m.key === meterType)!;

  const consumptionSinceLast =
    currentReading && previousReading
      ? Math.max(0, parseFloat(currentReading) - parseFloat(previousReading)).toFixed(1)
      : "";

  const takeOrPickPhoto = () => {
    Alert.alert(
      "Attach Meter Photo",
      "Photograph the meter display as evidence of the reading.",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Camera access is needed to photograph the meter.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false });
            if (!result.canceled && result.assets[0]) {
              setPhotoUri(result.assets[0].uri);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
        },
        {
          text: "Photo Library",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Photo library access is needed.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: false });
            if (!result.canceled && result.assets[0]) {
              setPhotoUri(result.assets[0].uri);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const handleSave = async () => {
    if (!meterName.trim()) {
      Alert.alert("Required", "Please enter the meter name or location.");
      return;
    }
    if (!currentReading.trim()) {
      Alert.alert("Required", "Please enter the current meter reading.");
      return;
    }
    if (isNaN(parseFloat(currentReading))) {
      Alert.alert("Invalid", "Current reading must be a number.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let documentUrl: string | undefined;

    if (photoUri) {
      setUploading(true);
      try {
        const apiBase = getApiBase();
        if (apiBase) {
          const objectPath = await uploadPhotoToStorage(photoUri, apiBase);
          if (objectPath) {
            documentUrl = objectPath;
          } else {
            Alert.alert(
              "Photo Not Uploaded",
              "The meter photo could not be uploaded right now — possibly no internet connection. The reading will still be saved and synced. You can attach the photo from the dashboard later.",
            );
          }
        }
      } catch {
        // silent — reading still saves
      } finally {
        setUploading(false);
      }
    }

    const record = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      meterName: meterName.trim(),
      meterReference: meterReference.trim(),
      meterType,
      readingDate: today,
      currentReading: currentReading.trim(),
      previousReading: previousReading.trim(),
      consumptionSinceLast,
      unit: selectedMeterType.unit,
      readingType,
      recordedBy: recordedBy.trim(),
      documentUrl,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.FUEL_METER_READINGS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert(
      "Reading Saved",
      consumptionSinceLast
        ? `Consumption since last reading: ${consumptionSinceLast} ${selectedMeterType.unit}${documentUrl ? ". Photo uploaded." : ""}`
        : `Meter reading recorded successfully.${documentUrl ? " Photo uploaded." : ""}`,
      [{ text: "Done", onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Grid Energy Meter Reading</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meter Details</Text>
            <Input
              label="Meter Name / Location"
              value={meterName}
              onChangeText={setMeterName}
              placeholder="e.g. Main farm supply, Grain store, Dairy unit"
              autoCapitalize="words"
            />
            <Input
              label="Meter Reference / MPAN / MPRN"
              value={meterReference}
              onChangeText={setMeterReference}
              placeholder="Meter serial number or supply number"
            />
            <Input
              label="Recorded By"
              value={recordedBy}
              onChangeText={setRecordedBy}
              placeholder="Your name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meter Type</Text>
            {METER_TYPES.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => setMeterType(m.key)}
                style={[
                  styles.option,
                  meterType === m.key && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary + "12",
                  },
                ]}
              >
                <View style={[styles.radio, meterType === m.key && { borderColor: colors.primary }]}>
                  {meterType === m.key && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <Text style={[styles.optionLabel, meterType === m.key && { color: colors.primary }]}>
                  {m.label}
                  <Text style={styles.optionSub}> — readings in {m.unit}</Text>
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Readings ({selectedMeterType.unit})
            </Text>
            <Input
              label={`Current Reading (${selectedMeterType.unit})`}
              value={currentReading}
              onChangeText={setCurrentReading}
              placeholder="e.g. 48321.4"
              keyboardType="decimal-pad"
            />
            <Input
              label={`Previous Reading (${selectedMeterType.unit})`}
              value={previousReading}
              onChangeText={setPreviousReading}
              placeholder="Leave blank if this is the first reading"
              keyboardType="decimal-pad"
            />
            {consumptionSinceLast !== "" && (
              <View style={styles.consumptionCard}>
                <Feather name="zap" size={16} color={colors.primary} />
                <Text style={styles.consumptionLabel}>Consumption since last reading</Text>
                <Text style={styles.consumptionValue}>
                  {consumptionSinceLast} {selectedMeterType.unit}
                </Text>
              </View>
            )}
            <Input
              label="Reading Date"
              value={today}
              editable={false}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reading Type</Text>
            {READING_TYPES.map((r) => (
              <Pressable
                key={r.key}
                onPress={() => setReadingType(r.key)}
                style={[
                  styles.option,
                  readingType === r.key && {
                    borderColor: colors.success,
                    backgroundColor: colors.success + "12",
                  },
                ]}
              >
                <View
                  style={[styles.radio, readingType === r.key && { borderColor: colors.success }]}
                >
                  {readingType === r.key && (
                    <View style={[styles.radioInner, { backgroundColor: colors.success }]} />
                  )}
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    readingType === r.key && { color: colors.success },
                  ]}
                >
                  {r.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Meter photo section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meter Photo</Text>
            <Text style={styles.sectionSub}>
              Photograph the meter display as evidence of the reading. Recommended for actual reads — provides proof for Ofgem, Red Tractor audits and billing disputes.
            </Text>

            {photoUri ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
                <View style={styles.photoActions}>
                  <Pressable style={styles.photoActionBtn} onPress={takeOrPickPhoto}>
                    <Feather name="refresh-cw" size={15} color={colors.primary} />
                    <Text style={styles.photoActionText}>Retake</Text>
                  </Pressable>
                  <Pressable style={[styles.photoActionBtn, { borderColor: colors.error }]} onPress={() => setPhotoUri(null)}>
                    <Feather name="x" size={15} color={colors.error} />
                    <Text style={[styles.photoActionText, { color: colors.error }]}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={styles.photoPrompt} onPress={takeOrPickPhoto}>
                <Feather name="camera" size={28} color={colors.textSecondary} />
                <Text style={styles.photoPromptTitle}>Photograph meter display</Text>
                <Text style={styles.photoPromptSub}>Tap to use camera or choose from library</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.section}>
            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Tariff changes, supply issues, fault observations…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Button
              title={uploading ? "Uploading photo…" : saving ? "Saving…" : "Save Meter Reading"}
              onPress={handleSave}
              disabled={saving || uploading}
            />
          </View>

          <View style={{ height: 60 }} />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  optionLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  optionSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  consumptionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary + "15",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + "33",
  },
  consumptionLabel: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  consumptionValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.primary,
  },
  photoPrompt: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  photoPromptTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  photoPromptSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  photoContainer: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    backgroundColor: colors.borderLight,
  },
  photoActions: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  photoActionText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
});
