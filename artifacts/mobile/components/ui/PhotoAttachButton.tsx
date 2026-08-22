import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/constants/colors";
import { fonts, fontSize } from "@/constants/typography";
import { radius, spacing } from "@/constants/spacing";

interface PhotoAttachButtonProps {
  photoUri: string | null;
  onPhotoSelected: (uri: string | null) => void;
  /** Optional caption rendered below the attached photo thumbnail. */
  caption?: string;
  label?: string;
  promptTitle?: string;
}

export function PhotoAttachButton({
  photoUri,
  onPhotoSelected,
  caption,
  label = "Attach Document / Photo",
  promptTitle = "Attach Supporting Document",
}: PhotoAttachButtonProps) {
  const handlePress = () => {
    Alert.alert(
      promptTitle,
      "Photograph a document or select from your photo library.",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Camera access is needed to take a photo.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              quality: 0.85,
              allowsEditing: false,
            });
            if (!result.canceled && result.assets[0]) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPhotoSelected(result.assets[0].uri);
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
            const result = await ImagePicker.launchImageLibraryAsync({
              quality: 0.85,
              allowsEditing: false,
            });
            if (!result.canceled && result.assets[0]) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPhotoSelected(result.assets[0].uri);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const handleRemove = () => {
    Alert.alert("Remove Photo", "Remove the attached photo?", [
      { text: "Remove", style: "destructive", onPress: () => onPhotoSelected(null) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (photoUri) {
    return (
      <View style={styles.previewContainer}>
        <Image source={{ uri: photoUri }} style={styles.preview} resizeMode="cover" />
        <View style={styles.previewOverlay}>
          <View style={styles.previewBadge}>
            <Feather name="paperclip" size={12} color="#fff" />
            <Text style={styles.previewBadgeText}>Attached</Text>
          </View>
          <Pressable onPress={handleRemove} style={styles.removeBtn}>
            <Feather name="x" size={16} color="#fff" />
          </Pressable>
        </View>
        <Pressable onPress={handlePress} style={styles.changeBtn}>
          <Feather name="camera" size={14} color={colors.primary} />
          <Text style={styles.changeBtnText}>Change photo</Text>
        </Pressable>
        {caption?.trim() ? (
          <Text style={styles.captionBelow} numberOfLines={2}>
            {caption.trim()}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <Pressable style={styles.attachBtn} onPress={handlePress}>
      <Feather name="paperclip" size={16} color={colors.primary} />
      <Text style={styles.attachBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  attachBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary + "40",
    borderStyle: "dashed",
    backgroundColor: colors.primary + "08",
    marginVertical: spacing.sm,
  },
  attachBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  previewContainer: {
    borderRadius: radius.md,
    overflow: "hidden",
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  preview: {
    width: "100%",
    height: 160,
  },
  previewOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  previewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  previewBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: "#fff",
  },
  removeBtn: {
    padding: 4,
    borderRadius: radius.full,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  changeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  changeBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  captionBelow: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 16,
    marginHorizontal: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
});
