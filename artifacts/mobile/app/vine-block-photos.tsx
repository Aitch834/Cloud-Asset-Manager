import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VineBlockPicker } from "@/components/VineBlockPicker";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useApiVineBlocks, type VineBlock } from "@/lib/hooks/useApiVineBlocks";
import { apiFetch } from "@/lib/apiFetch";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";

interface BlockPhoto {
  id: number;
  blockId: number;
  farmId: number;
  objectPath: string;
  fileName: string | null;
  caption: string | null;
  uploadedAt: string;
  /** Short-lived presigned GET URL returned by the API — use directly in <Image>. */
  downloadUrl: string | null;
}

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

const SCREEN = Dimensions.get("window");
const SWIPE_DOWN_THRESHOLD = 120;
const MIN_SCALE = 1;
const MAX_SCALE = 5;

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

interface LightboxProps {
  uri: string | null;
  caption: string | null;
  visible: boolean;
  onClose: () => void;
}

function PhotoLightbox({ uri, caption, visible, onClose }: LightboxProps) {
  const insets = useSafeAreaInsets();

  // Zoom / pan state
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Background fade
  const bgOpacity = useSharedValue(0);

  // Reset transforms when the lightbox opens/closes
  useEffect(() => {
    if (visible) {
      scale.value = 1;
      savedScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      bgOpacity.value = withTiming(1, { duration: 200 });
    } else {
      bgOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pinch-to-zoom gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, MIN_SCALE, MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // Snap back to 1 if under-zoomed
      if (scale.value < MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE);
        savedScale.value = MIN_SCALE;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  // Pan gesture — drag when zoomed in, swipe-down to close when at 1×
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        // Allow free panning when zoomed
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      } else {
        // Only vertical drag when at base scale (swipe-to-dismiss)
        translateY.value = Math.max(0, e.translationY);
      }
    })
    .onEnd((e) => {
      if (scale.value <= 1 && e.translationY > SWIPE_DOWN_THRESHOLD) {
        // Dismiss: slide out then close
        translateY.value = withTiming(SCREEN.height, { duration: 220 }, () => {
          runOnJS(onClose)();
        });
      } else if (scale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      } else {
        // Snap back to centre
        translateY.value = withSpring(0);
      }
    });

  // Double-tap resets zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const composed = Gesture.Simultaneous(
    Gesture.Race(doubleTapGesture, panGesture),
    pinchGesture,
  );

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar hidden />
      <Animated.View style={[styles.lbOverlay, bgStyle]}>
        {/* Close button */}
        <Pressable
          style={[styles.lbCloseBtn, { top: insets.top + 12 }]}
          onPress={onClose}
          hitSlop={16}
        >
          <Feather name="x" size={24} color="#fff" />
        </Pressable>

        {/* Zoomable image */}
        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.lbImageContainer, imageStyle]}>
            {uri ? (
              <Image
                source={{ uri }}
                style={styles.lbImage}
                resizeMode="contain"
              />
            ) : (
              <ActivityIndicator size="large" color="#fff" />
            )}
          </Animated.View>
        </GestureDetector>

        {/* Caption */}
        {caption ? (
          <View style={[styles.lbCaption, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.lbCaptionText}>{caption}</Text>
          </View>
        ) : null}

        {/* Hint */}
        <View style={[styles.lbHint, { bottom: caption ? 60 + insets.bottom : insets.bottom + 16 }]}>
          <Text style={styles.lbHintText}>Pinch to zoom · Double-tap · Swipe down to close</Text>
        </View>
      </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Thumbnail
// ---------------------------------------------------------------------------

function PhotoThumbnail({
  photo,
  onDelete,
  onPress,
}: {
  photo: BlockPhoto;
  onDelete: (id: number) => void;
  onPress: (uri: string | null, photo: BlockPhoto) => void;
}) {
  const uri = photo.downloadUrl ?? null;

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Delete Photo", "Remove this photo from the block gallery?", [
      { text: "Delete", style: "destructive", onPress: () => onDelete(photo.id) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <Pressable
      style={styles.thumbnail}
      onLongPress={handleLongPress}
      onPress={() => onPress(uri, photo)}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
      ) : (
        <View style={styles.thumbPlaceholder}>
          <Feather name="image" size={24} color={colors.textSecondary} />
        </View>
      )}
      {photo.caption ? (
        <View style={styles.captionBar}>
          <Text style={styles.captionText} numberOfLines={1}>{photo.caption}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function VineBlockPhotosScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);

  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [photos, setPhotos] = useState<BlockPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Lightbox state
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);
  const [lightboxCaption, setLightboxCaption] = useState<string | null>(null);
  const [lightboxVisible, setLightboxVisible] = useState(false);

  const openLightbox = useCallback((uri: string | null, photo: BlockPhoto) => {
    setLightboxUri(uri);
    setLightboxCaption(photo.caption);
    setLightboxVisible(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxVisible(false);
  }, []);

  const loadPhotos = useCallback(async () => {
    if (!currentFarm?.id || !selectedBlock) return;
    setPhotosLoading(true);
    try {
      const res = await apiFetch(`/api/farms/${currentFarm.id}/vineyard-blocks/${selectedBlock.id}/photos`);
      if (res.ok) {
        const data: { photos: BlockPhoto[] } = await res.json();
        setPhotos(data.photos ?? []);
      }
    } catch {
      // no-op
    } finally {
      setPhotosLoading(false);
    }
  }, [currentFarm?.id, selectedBlock]);

  useEffect(() => {
    setPhotos([]);
    loadPhotos();
  }, [selectedBlock?.id, loadPhotos]);

  const handleAddPhoto = () => {
    if (!currentFarm?.id || !selectedBlock) return;

    Alert.alert(
      "Add Block Photo",
      "Take a new photo or choose from your library.",
      [
        {
          text: "Camera",
          onPress: () => launchPicker("camera"),
        },
        {
          text: "Photo Library",
          onPress: () => launchPicker("library"),
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const launchPicker = async (source: "camera" | "library") => {
    if (!currentFarm?.id || !selectedBlock) return;

    let result: ImagePicker.ImagePickerResult;
    if (source === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Camera access is needed to take a photo.");
        return;
      }
      result = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Required", "Photo library access is needed.");
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: false });
    }

    if (result.canceled || !result.assets[0]) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const asset = result.assets[0];
    const ext = asset.uri.split(".").pop() ?? "jpg";
    const fileName = `block-${selectedBlock.id}-${Date.now()}.${ext}`;

    setUploading(true);
    try {
      const apiBase = getApiBase();
      const objectPath = await uploadPhotoToStorage(asset.uri, apiBase, fileName);
      if (!objectPath) {
        Alert.alert("Upload Failed", "Could not upload the photo. Please try again.");
        return;
      }

      const res = await apiFetch(
        `/api/farms/${currentFarm.id}/vineyard-blocks/${selectedBlock.id}/photos`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ objectPath, fileName }),
        },
      );
      if (!res.ok) {
        Alert.alert("Save Failed", "Photo uploaded but could not be added to the gallery.");
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadPhotos();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!currentFarm?.id || !selectedBlock) return;
    try {
      const res = await apiFetch(
        `/api/farms/${currentFarm.id}/vineyard-blocks/${selectedBlock.id}/photos/${photoId}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      } else {
        Alert.alert("Error", "Could not delete the photo.");
      }
    } catch {
      Alert.alert("Error", "Could not delete the photo.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Block Photos</Text>
        {selectedBlock && (
          <Pressable
            style={[styles.addBtn, uploading && styles.addBtnDisabled]}
            onPress={handleAddPhoto}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="camera" size={18} color="#fff" />
            )}
          </Pressable>
        )}
      </View>

      {/* Block picker */}
      <View style={styles.pickerWrapper}>
        <VineBlockPicker
          blocks={blocks}
          selected={selectedBlock}
          onSelect={setSelectedBlock}
          loading={blocksLoading}
        />
      </View>

      {/* Gallery */}
      {!selectedBlock ? (
        <View style={styles.centred}>
          <EmptyState
            icon="image"
            title="Select a block"
            message="Choose a vineyard block above to view and add photos."
          />
        </View>
      ) : photosLoading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.centred}>
          <EmptyState
            icon="camera"
            title="No photos yet"
            message={`Tap the camera button to add the first photo of ${selectedBlock.blockName}.`}
          />
          <Button
            title="Add Photo"
            icon="camera"
            onPress={handleAddPhoto}
            style={{ marginTop: spacing.lg }}
            loading={uploading}
          />
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <PhotoThumbnail
              photo={item}
              onDelete={handleDelete}
              onPress={openLightbox}
            />
          )}
          ListFooterComponent={
            <View style={styles.footer}>
              <Button
                title={uploading ? "Uploading…" : "Add Another Photo"}
                icon="camera"
                variant="outline"
                onPress={handleAddPhoto}
                loading={uploading}
                fullWidth
              />
              <Text style={styles.hint}>Tap to view · Hold to delete.</Text>
            </View>
          }
        />
      )}

      {/* Full-screen lightbox */}
      <PhotoLightbox
        uri={lightboxUri}
        caption={lightboxCaption}
        visible={lightboxVisible}
        onClose={closeLightbox}
      />
    </View>
  );
}

const THUMB_SIZE = 170;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnDisabled: {
    opacity: 0.6,
  },
  pickerWrapper: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  centred: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  grid: {
    padding: spacing.sm,
    gap: spacing.sm,
  },
  thumbnail: {
    flex: 1,
    margin: spacing.xs,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    height: THUMB_SIZE,
    maxWidth: THUMB_SIZE,
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  captionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
  },
  captionText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#fff",
  },
  footer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
  },
  // Lightbox styles
  lbOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  lbCloseBtn: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  lbImageContainer: {
    width: SCREEN.width,
    height: SCREEN.height,
    alignItems: "center",
    justifyContent: "center",
  },
  lbImage: {
    width: SCREEN.width,
    height: SCREEN.height,
  },
  lbCaption: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  lbCaptionText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#fff",
    textAlign: "center",
  },
  lbHint: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  lbHintText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.4)",
  },
});
