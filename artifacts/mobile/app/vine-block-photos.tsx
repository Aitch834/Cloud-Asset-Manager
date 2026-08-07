import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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
}

/** Fetch a gallery photo from the API and return a base64 data-URI for display. */
async function fetchPhotoDataUri(farmId: number, blockId: number, photoId: number): Promise<string | null> {
  try {
    const res = await apiFetch(`/api/farms/${farmId}/vineyard-blocks/${blockId}/photos/${photoId}`);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);
    const contentType = res.headers.get("content-type") || "image/jpeg";
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

function PhotoThumbnail({
  photo,
  farmId,
  blockId,
  onDelete,
}: {
  photo: BlockPhoto;
  farmId: number;
  blockId: number;
  onDelete: (id: number) => void;
}) {
  const [uri, setUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchPhotoDataUri(farmId, blockId, photo.id).then((u) => {
      if (!cancelled) { setUri(u); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [photo.id, farmId, blockId]);

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Delete Photo", "Remove this photo from the block gallery?", [
      { text: "Delete", style: "destructive", onPress: () => onDelete(photo.id) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <Pressable style={styles.thumbnail} onLongPress={handleLongPress}>
      {loading ? (
        <View style={styles.thumbPlaceholder}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      ) : uri ? (
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

export default function VineBlockPhotosScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);

  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [photos, setPhotos] = useState<BlockPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
              farmId={Number(currentFarm?.id)}
              blockId={selectedBlock.id}
              onDelete={handleDelete}
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
              <Text style={styles.hint}>Hold any photo to delete it.</Text>
            </View>
          }
        />
      )}
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
});
