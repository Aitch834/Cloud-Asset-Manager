import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
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
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PhotoRecord } from "@/lib/types";

export default function PhotoCaptureScreen() {
  const insets = useSafeAreaInsets();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Photo library access is needed.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSave = async () => {
    if (!photoUri) {
      Alert.alert("No Photo", "Please take or select a photo first.");
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
      console.warn("Photo location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const photo: PhotoRecord = {
      id: generateId(),
      uri: photoUri,
      caption: caption.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PHOTOS, photo);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Photo saved successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Photo Capture</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {photoUri ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUri }} style={styles.photo} />
            <Button
              title="Retake"
              icon="refresh-cw"
              variant="outline"
              size="sm"
              onPress={() => setPhotoUri(null)}
              style={styles.retakeButton}
            />
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Feather name="camera" size={48} color={colors.primaryMuted} />
            <Text style={styles.placeholderText}>No photo taken yet</Text>
            <Text style={styles.placeholderSubtext}>
              Take a photo for compliance evidence
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button
            title="Take Photo"
            icon="camera"
            onPress={takePhoto}
            fullWidth
          />
          <Button
            title="Choose from Library"
            icon="image"
            variant="outline"
            onPress={pickPhoto}
            fullWidth
          />
        </View>

        {!!photoUri && (
          <>
            <Input
              label="Caption"
              placeholder="Describe this photo..."
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={2}
            />

            <Button
              title="Save Photo"
              onPress={handleSave}
              loading={saving}
              fullWidth
              icon="check"
            />
          </>
        )}

        <View style={{ height: insets.bottom + spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  photoContainer: {
    borderRadius: radius.lg,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  photo: {
    width: "100%",
    height: 300,
    borderRadius: radius.lg,
  },
  retakeButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
  },
  placeholder: {
    height: 250,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    marginBottom: spacing.lg,
  },
  placeholderText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  placeholderSubtext: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
});
