import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { router, useFocusEffect } from "expo-router";
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useApiFetch } from "@/lib/hooks/useApiFetch";
import { useApiVineBlocks, type VineBlock } from "@/lib/hooks/useApiVineBlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useIdentifierBannerDismiss } from "@/lib/hooks/useIdentifierBannerDismiss";
import { IdentifierBanner } from "@/components/ui/IdentifierBanner";
import { apiFetch } from "@/lib/apiFetch";
import { uploadPhotoToStorage, getApiBase, pickPhoto } from "@/lib/uploadPhoto";
import { vineyardCountEvents } from "@/lib/vineyardCountEvents";
import { usePrint } from "@/lib/hooks/usePrint";
import { vineSprayDiaryHtml, type VineSprayDiaryRow } from "@/lib/printTemplates";

// 4-minute background refresh for presigned URLs
const PHOTO_REFRESH_MS = 4 * 60 * 1000;

// ─── Lightbox constants ───────────────────────────────────────────────────────

const SCREEN = Dimensions.get("window");
const LB_SWIPE_DOWN_THRESHOLD = 120;
const LB_SWIPE_HORIZ_THRESHOLD = 60;
const LB_MIN_SCALE = 1;
const LB_MAX_SCALE = 5;
const LB_DIR_NONE = 0;
const LB_DIR_HORIZ = 1;
const LB_DIR_VERT = 2;

function lbClamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

interface SprayDiaryRecord {
  id: number;
  applicationDate: string | null;
  blockId: number | null;
  productName: string | null;
  mappNumber: string | null;
  activeIngredient: string | null;
  productType: string | null;
  ratePerHectare: number | null;
  rateUnit: string | null;
  areaTreatedHa: number | null;
  windSpeedMph: number | null;
  temperatureCelsius: number | null;
  weatherConditions: string | null;
  operatorName: string | null;
  operatorCertificateNo: string | null;
  notes: string | null;
  photoCount: number;
}

interface SprayDiaryPhoto {
  id: number;
  sprayDiaryId: number;
  farmId: number;
  objectPath: string;
  fileName: string | null;
  caption: string | null;
  sortOrder: number | null;
  uploadedAt: string;
  downloadUrl: string | null;
}

function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Normalise a grower-typed date to YYYY-MM-DD.
 * Accepts: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY.
 * Returns null when the value is blank, still being typed (< 8 chars),
 * or cannot be parsed.
 */
function canonicaliseDate(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;
  // Already ISO — YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD/MM/YYYY or DD-MM-YYYY
  const dmySlash = /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/.exec(s);
  if (dmySlash) return `${dmySlash[3]}-${dmySlash[2]}-${dmySlash[1]}`;
  return null; // incomplete or unrecognised
}

// ─── Block name lookup ────────────────────────────────────────────────────────

function useBlockName(blockId: number | null, blocks: VineBlock[]): string | null {
  if (!blockId) return null;
  return blocks.find(b => b.id === blockId)?.blockName ?? null;
}

// ─── Spray Photo Lightbox ─────────────────────────────────────────────────────

interface SprayLightboxProps {
  photos: SprayDiaryPhoto[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
}

function SprayPhotoLightbox({ photos, initialIndex, visible, onClose }: SprayLightboxProps) {
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // UI-thread shared values
  const indexSv = useSharedValue(initialIndex);
  const totalSv = useSharedValue(photos.length);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const slideX = useSharedValue(0);
  const gestureDir = useSharedValue(LB_DIR_NONE);
  const bgOpacity = useSharedValue(0);

  // Keep totalSv in sync
  useEffect(() => {
    totalSv.value = photos.length;
  }, [photos.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on open/close
  useEffect(() => {
    if (visible) {
      const idx = Math.min(initialIndex, photos.length - 1);
      setCurrentIndex(idx);
      indexSv.value = idx;
      scale.value = 1;
      savedScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      slideX.value = 0;
      bgOpacity.value = withTiming(1, { duration: 200 });
    } else {
      bgOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ref so worklet callbacks are never stale
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const goToIndex = useCallback((idx: number) => {
    setCurrentIndex(idx);
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    slideX.value = 0;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Save to camera roll + share
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleSaveToRoll = useCallback(async () => {
    const currentPhoto = photosRef.current[indexSv.value];
    if (!currentPhoto?.downloadUrl || saving) return;
    setSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library in Settings to save photos.",
        );
        return;
      }
      const ext = currentPhoto.fileName?.split(".").pop()?.toLowerCase() ?? "jpg";
      const tmpUri = `${FileSystem.cacheDirectory}spray_photo_${currentPhoto.id}.${ext}`;
      const dl = await FileSystem.downloadAsync(currentPhoto.downloadUrl, tmpUri);
      await MediaLibrary.saveToLibraryAsync(dl.uri);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Save Failed", "Could not save the photo. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [saving]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleShare = useCallback(async () => {
    const currentPhoto = photosRef.current[indexSv.value];
    if (!currentPhoto?.downloadUrl || sharing) return;
    setSharing(true);
    try {
      const ext = currentPhoto.fileName?.split(".").pop()?.toLowerCase() ?? "jpg";
      const tmpUri = `${FileSystem.cacheDirectory}spray_photo_share_${currentPhoto.id}.${ext}`;
      const dl = await FileSystem.downloadAsync(currentPhoto.downloadUrl, tmpUri);
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Sharing Not Available", "Sharing is not supported on this device.");
        return;
      }
      await Sharing.shareAsync(dl.uri, { mimeType: `image/${ext === "jpg" ? "jpeg" : ext}` });
    } catch {
      Alert.alert("Share Failed", "Could not share the photo. Please try again.");
    } finally {
      setSharing(false);
    }
  }, [sharing]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pinch-to-zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = lbClamp(savedScale.value * e.scale, LB_MIN_SCALE, LB_MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < LB_MIN_SCALE) {
        scale.value = withSpring(LB_MIN_SCALE);
        savedScale.value = LB_MIN_SCALE;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  // Pan: zoom-pan + swipe-down dismiss + horizontal navigation
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      gestureDir.value = LB_DIR_NONE;
    })
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
        return;
      }
      if (gestureDir.value === LB_DIR_NONE) {
        if (Math.abs(e.translationX) > 8 || Math.abs(e.translationY) > 8) {
          gestureDir.value =
            Math.abs(e.translationX) >= Math.abs(e.translationY)
              ? LB_DIR_HORIZ
              : LB_DIR_VERT;
        }
        return;
      }
      if (gestureDir.value === LB_DIR_HORIZ) {
        slideX.value = e.translationX;
      } else {
        translateY.value = Math.max(0, e.translationY);
      }
    })
    .onEnd((e) => {
      if (scale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
        return;
      }
      if (gestureDir.value === LB_DIR_HORIZ) {
        const dx = e.translationX;
        if (dx < -LB_SWIPE_HORIZ_THRESHOLD && indexSv.value < totalSv.value - 1) {
          const next = indexSv.value + 1;
          indexSv.value = next;
          slideX.value = withTiming(-SCREEN.width, { duration: 220 }, () => {
            runOnJS(goToIndex)(next);
          });
        } else if (dx > LB_SWIPE_HORIZ_THRESHOLD && indexSv.value > 0) {
          const prev = indexSv.value - 1;
          indexSv.value = prev;
          slideX.value = withTiming(SCREEN.width, { duration: 220 }, () => {
            runOnJS(goToIndex)(prev);
          });
        } else {
          slideX.value = withSpring(0);
        }
      } else if (gestureDir.value === LB_DIR_VERT) {
        if (e.translationY > LB_SWIPE_DOWN_THRESHOLD) {
          translateY.value = withTiming(SCREEN.height, { duration: 220 }, () => {
            runOnJS(onClose)();
          });
        } else {
          translateY.value = withSpring(0);
        }
      }
    });

  // Double-tap: toggle 2.5× zoom
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
      { translateX: translateX.value + slideX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const bgStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const photo = photos[currentIndex];
  const uri = photo?.downloadUrl ?? null;
  const caption = photo?.caption ?? null;
  const hasMultiple = photos.length > 1;

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
        <Animated.View style={[lbStyles.overlay, bgStyle]}>
          {/* Close button */}
          <Pressable
            style={[lbStyles.closeBtn, { top: insets.top + 12 }]}
            onPress={onClose}
            hitSlop={16}
          >
            <Feather name="x" size={24} color="#fff" />
          </Pressable>

          {/* Save to camera roll button */}
          {photo ? (
            <Pressable
              style={[lbStyles.saveBtn, { top: insets.top + 12 }]}
              hitSlop={16}
              onPress={handleSaveToRoll}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="download" size={22} color="#fff" />
              )}
            </Pressable>
          ) : null}

          {/* Share button */}
          {photo ? (
            <Pressable
              style={[lbStyles.shareBtn, { top: insets.top + 12 }]}
              hitSlop={16}
              onPress={handleShare}
              disabled={sharing}
            >
              {sharing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="share-2" size={22} color="#fff" />
              )}
            </Pressable>
          ) : null}

          {/* Photo counter */}
          {hasMultiple ? (
            <View style={[lbStyles.counter, { top: insets.top + 20 }]}>
              <Text style={lbStyles.counterText}>
                {currentIndex + 1} / {photos.length}
              </Text>
            </View>
          ) : null}

          {/* Zoomable image */}
          <GestureDetector gesture={composed}>
            <Animated.View style={[lbStyles.imageContainer, imageStyle]}>
              {uri ? (
                <Image
                  source={{ uri }}
                  style={lbStyles.image}
                  resizeMode="contain"
                />
              ) : (
                <ActivityIndicator size="large" color="#fff" />
              )}
            </Animated.View>
          </GestureDetector>

          {/* Caption (read-only) */}
          {caption ? (
            <View style={[lbStyles.captionBar, { paddingBottom: insets.bottom + 16 }]}>
              <Text style={lbStyles.captionText}>{caption}</Text>
            </View>
          ) : null}

          {/* Hint */}
          <View style={[lbStyles.hintBar, { bottom: (caption ? 60 : 16) + insets.bottom }]}>
            <Text style={lbStyles.hintText}>
              {hasMultiple
                ? "Swipe to browse · Pinch to zoom · Swipe down to close"
                : "Pinch to zoom · Double-tap · Swipe down to close"}
            </Text>
          </View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

// ─── Photo Thumbnail ──────────────────────────────────────────────────────────

function SprayPhotoThumbnail({
  photo,
  onPress,
  onDelete,
}: {
  photo: SprayDiaryPhoto;
  onPress: () => void;
  onDelete: (id: number) => void;
}) {
  const uri = photo.downloadUrl ?? null;
  // Prevent onPress from firing when the gesture was a long-press
  const wasLongPress = useRef(false);

  const handlePress = () => {
    if (wasLongPress.current) {
      wasLongPress.current = false;
      return;
    }
    onPress();
  };

  const handleLongPress = () => {
    wasLongPress.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Photo Options", undefined, [
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Delete Photo",
            "Are you sure you want to delete this photo? This cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => onDelete(photo.id) },
            ],
          );
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <Pressable style={styles.thumbnail} onPress={handlePress} onLongPress={handleLongPress}>
      <View style={styles.thumbImgBox}>
        {uri ? (
          <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Feather name="image" size={24} color={colors.textSecondary} />
          </View>
        )}
      </View>
      {photo.caption ? (
        <Text style={styles.captionBelow} numberOfLines={2}>{photo.caption}</Text>
      ) : null}
    </Pressable>
  );
}

// ─── Photo Gallery Section ────────────────────────────────────────────────────

function SprayDiaryPhotoSection({
  farmId,
  sprayDiaryId,
}: {
  farmId: string | number;
  sprayDiaryId: number;
}) {
  const [photos, setPhotos] = useState<SprayDiaryPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadPhotos = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-spray-diary/${sprayDiaryId}/photos`);
      if (res.ok) {
        const data: { photos: SprayDiaryPhoto[] } = await res.json();
        setPhotos(data.photos ?? []);
      }
    } catch {
      // no-op on silent refresh
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [farmId, sprayDiaryId]);

  // Initial load + 4-minute silent background refresh for presigned URLs
  useEffect(() => {
    loadPhotos();
    refreshTimer.current = setInterval(() => loadPhotos({ silent: true }), PHOTO_REFRESH_MS);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [loadPhotos]);

  // Re-fetch photos whenever the screen comes back into focus so that
  // short-lived presigned URLs are always fresh after the grower returns from
  // another app (matching vine-scouting.tsx pattern).
  useFocusEffect(
    useCallback(() => {
      loadPhotos({ silent: true });
    }, [loadPhotos]),
  );

  const handleAddPhoto = async () => {
    const uri = await pickPhoto("Attach Spray Diary Photo");
    if (!uri) return;

    setUploading(true);
    try {
      const apiBase = getApiBase();
      const fileName = `spray-diary-${sprayDiaryId}-${Date.now()}.jpg`;
      const objectPath = await uploadPhotoToStorage(uri, apiBase, fileName);
      if (!objectPath) {
        Alert.alert("Upload Failed", "Could not upload the photo. Please try again.");
        return;
      }

      const res = await apiFetch(`/api/farms/${farmId}/vineyard-spray-diary/${sprayDiaryId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath, fileName }),
      });

      if (!res.ok) {
        Alert.alert("Upload Failed", "Photo was uploaded but could not be saved. Please try again.");
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await loadPhotos();
    } catch {
      Alert.alert("Upload Failed", "An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-spray-diary/${sprayDiaryId}/photos/${photoId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      } else {
        Alert.alert("Delete Failed", "Could not delete the photo. Please try again.");
      }
    } catch {
      Alert.alert("Delete Failed", "An error occurred. Please try again.");
    }
  };

  return (
    <View style={editStyles.photoSection}>
      <View style={editStyles.photoHeader}>
        <Text style={editStyles.photoSectionTitle}>Application Photos</Text>
        <Text style={editStyles.photoCount}>{photos.length} attached</Text>
      </View>
      <Text style={editStyles.photoHint}>Tap to view full-screen · Long-press to delete.</Text>

      {loading ? (
        <ActivityIndicator size="small" color={colors.textSecondary} style={{ marginTop: spacing.sm }} />
      ) : (
        <>
          <FlatList
            data={photos}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEnabled
            style={{ marginTop: spacing.sm }}
            contentContainerStyle={{ gap: spacing.sm }}
            renderItem={({ index, item }) => (
              <SprayPhotoThumbnail
                photo={item}
                onPress={() => setLightboxIndex(index)}
                onDelete={handleDeletePhoto}
              />
            )}
            ListEmptyComponent={
              <View style={editStyles.emptyPhotos}>
                <Feather name="image" size={20} color={colors.textSecondary} />
                <Text style={editStyles.emptyPhotosText}>No photos yet</Text>
              </View>
            }
          />
          <SprayPhotoLightbox
            photos={photos}
            initialIndex={lightboxIndex ?? 0}
            visible={lightboxIndex !== null}
            onClose={() => setLightboxIndex(null)}
          />
        </>
      )}

      <Pressable
        style={[editStyles.addPhotoBtn, uploading && editStyles.addPhotoBtnDisabled]}
        onPress={handleAddPhoto}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Feather name="camera" size={16} color={colors.primary} />
        )}
        <Text style={editStyles.addPhotoBtnText}>{uploading ? "Uploading…" : "Add Photo"}</Text>
      </Pressable>
    </View>
  );
}

// ─── Edit Spray Diary Modal ───────────────────────────────────────────────────

interface EditSprayDiaryModalProps {
  visible: boolean;
  record: SprayDiaryRecord | null;
  farmId: string;
  blocks: VineBlock[];
  blocksLoading: boolean;
  onClose: () => void;
  onSaved: (recordId: number, updated: Partial<SprayDiaryRecord>) => void;
}

function EditSprayDiaryModal({ visible, record, farmId, blocks, blocksLoading, onClose, onSaved }: EditSprayDiaryModalProps) {
  const [saving, setSaving] = useState(false);

  // Form state
  const [applicationDate, setApplicationDate] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [productName, setProductName] = useState("");
  const [mappNumber, setMappNumber] = useState("");
  const [activeIngredient, setActiveIngredient] = useState("");
  const [productType, setProductType] = useState("");
  const [ratePerHectare, setRatePerHectare] = useState("");
  const [rateUnit, setRateUnit] = useState("L/ha");
  const [areaTreatedHa, setAreaTreatedHa] = useState("");
  const [windSpeedMph, setWindSpeedMph] = useState("");
  const [temperatureCelsius, setTemperatureCelsius] = useState("");
  const [weatherConditions, setWeatherConditions] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [operatorCertificateNo, setOperatorCertificateNo] = useState("");
  const [notes, setNotes] = useState("");

  // Pre-fill from record when modal opens
  React.useEffect(() => {
    if (visible && record) {
      setApplicationDate(record.applicationDate ?? "");
      const current = record.blockId ? blocks.find(b => b.id === record.blockId) ?? null : null;
      setSelectedBlock(current);
      setProductName(record.productName ?? "");
      setMappNumber(record.mappNumber ?? "");
      setActiveIngredient(record.activeIngredient ?? "");
      setProductType(record.productType ?? "");
      setRatePerHectare(record.ratePerHectare != null ? String(record.ratePerHectare) : "");
      setRateUnit(record.rateUnit ?? "L/ha");
      setAreaTreatedHa(record.areaTreatedHa != null ? String(record.areaTreatedHa) : "");
      setWindSpeedMph(record.windSpeedMph != null ? String(record.windSpeedMph) : "");
      setTemperatureCelsius(record.temperatureCelsius != null ? String(record.temperatureCelsius) : "");
      setWeatherConditions(record.weatherConditions ?? "");
      setOperatorName(record.operatorName ?? "");
      setOperatorCertificateNo(record.operatorCertificateNo ?? "");
      setNotes(record.notes ?? "");
    }
  }, [visible, record, blocks]);

  const handleSave = async () => {
    if (!record) return;
    if (!applicationDate || !productName.trim()) {
      Alert.alert("Required Fields", "Please enter an application date and product name.");
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        applicationDate,
        blockId: selectedBlock?.id ?? null,
        productName: productName.trim(),
        mappNumber: mappNumber.trim() || null,
        activeIngredient: activeIngredient.trim() || null,
        productType: productType.trim() || null,
        ratePerHectare: ratePerHectare ? parseFloat(ratePerHectare) : null,
        rateUnit: rateUnit.trim() || null,
        areaTreatedHa: areaTreatedHa ? parseFloat(areaTreatedHa) : null,
        windSpeedMph: windSpeedMph ? parseFloat(windSpeedMph) : null,
        temperatureCelsius: temperatureCelsius ? parseFloat(temperatureCelsius) : null,
        weatherConditions: weatherConditions.trim() || null,
        operatorName: operatorName.trim() || null,
        operatorCertificateNo: operatorCertificateNo.trim() || null,
        notes: notes.trim() || null,
      };

      const res = await apiFetch(`/api/farms/${farmId}/vineyard-spray-diary/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Save Failed", (err as any).error ?? "Could not save the record. Please try again.");
        setSaving(false);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSaved(record.id, body as Partial<SprayDiaryRecord>);
    } catch {
      Alert.alert("Save Failed", "Could not reach the server. Please try again.");
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={editStyles.container}>
          {/* Header */}
          <View style={editStyles.header}>
            <View style={editStyles.headerLeft}>
              <Text style={editStyles.title} numberOfLines={1}>
                {record?.productName ?? "Edit Spray Entry"}
              </Text>
              <Text style={editStyles.subtitle}>{formatDate(record?.applicationDate)}</Text>
            </View>
            <Pressable onPress={onClose} style={editStyles.closeBtn} hitSlop={12}>
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={editStyles.scroll} contentContainerStyle={editStyles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* ── Application Details ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Application Details</Text>

              <Text style={editStyles.fieldLabel}>Application Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={applicationDate}
                onChangeText={setApplicationDate}
                keyboardType="numeric"
              />

              <Text style={editStyles.fieldLabel}>Vineyard Block</Text>
              {blocksLoading ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.sm }} />
              ) : (
                <VineBlockPicker
                  blocks={blocks}
                  selected={selectedBlock}
                  onSelect={setSelectedBlock}
                  loading={false}
                />
              )}
              {selectedBlock && (
                <Pressable onPress={() => setSelectedBlock(null)} style={editStyles.clearBlockBtn}>
                  <Feather name="x" size={12} color={colors.textSecondary} />
                  <Text style={editStyles.clearBlockText}>Clear block link</Text>
                </Pressable>
              )}
            </View>

            {/* ── Product ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Product</Text>

              <Text style={editStyles.fieldLabel}>Product Name *</Text>
              <Input
                placeholder="e.g. Mancozeb 80 WG"
                value={productName}
                onChangeText={setProductName}
              />

              <Text style={editStyles.fieldLabel}>MAPP Number</Text>
              <Input
                placeholder="e.g. MAPP 12345"
                value={mappNumber}
                onChangeText={setMappNumber}
              />

              <Text style={editStyles.fieldLabel}>Active Ingredient</Text>
              <Input
                placeholder="e.g. Mancozeb"
                value={activeIngredient}
                onChangeText={setActiveIngredient}
              />

              <Text style={editStyles.fieldLabel}>Product Type</Text>
              <Input
                placeholder="e.g. Fungicide, Insecticide, Herbicide"
                value={productType}
                onChangeText={setProductType}
              />

              <View style={editStyles.row}>
                <Input
                  label="Rate"
                  placeholder="e.g. 2.0"
                  value={ratePerHectare}
                  onChangeText={setRatePerHectare}
                  keyboardType="decimal-pad"
                  containerStyle={editStyles.flex}
                />
                <Input
                  label="Unit"
                  placeholder="L/ha"
                  value={rateUnit}
                  onChangeText={setRateUnit}
                  containerStyle={{ width: 100 }}
                />
              </View>

              <Input
                label="Area Treated (ha)"
                placeholder="e.g. 3.5"
                value={areaTreatedHa}
                onChangeText={setAreaTreatedHa}
                keyboardType="decimal-pad"
              />
            </View>

            {/* ── Weather Conditions ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Weather Conditions</Text>

              <View style={editStyles.row}>
                <Input
                  label="Wind Speed (mph)"
                  placeholder="e.g. 5"
                  value={windSpeedMph}
                  onChangeText={setWindSpeedMph}
                  keyboardType="decimal-pad"
                  containerStyle={editStyles.flex}
                />
                <Input
                  label="Temperature (°C)"
                  placeholder="e.g. 18"
                  value={temperatureCelsius}
                  onChangeText={setTemperatureCelsius}
                  keyboardType="decimal-pad"
                  containerStyle={editStyles.flex}
                />
              </View>

              <Input
                label="Weather Conditions"
                placeholder="e.g. Dry, overcast, light breeze"
                value={weatherConditions}
                onChangeText={setWeatherConditions}
              />
            </View>

            {/* ── Operator ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Operator</Text>

              <Text style={editStyles.fieldLabel}>Operator Name</Text>
              <Input
                placeholder="e.g. John Smith"
                value={operatorName}
                onChangeText={setOperatorName}
              />

              <Text style={editStyles.fieldLabel}>Certificate No. (PA1/PA6/NPTC)</Text>
              <Input
                placeholder="e.g. 12345/67890"
                value={operatorCertificateNo}
                onChangeText={setOperatorCertificateNo}
              />
            </View>

            {/* ── Notes ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Notes</Text>
              <Input
                placeholder="Additional notes about the application…"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* ── Photos ── */}
            {record && (
              <SprayDiaryPhotoSection farmId={farmId} sprayDiaryId={record.id} />
            )}

            {/* ── Quick Links ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Quick Links</Text>
              <Text style={editStyles.quickLinkHint}>Jump to a related record for this application</Text>
              <Pressable
                style={editStyles.quickLinkBtn}
                onPress={() => {
                  onClose();
                  const params = record?.blockId ? { blockId: String(record.blockId) } : undefined;
                  router.push(params ? { pathname: "/vine-operation", params } : "/vine-operation");
                }}
              >
                <Feather name="tool" size={16} color={colors.primary} />
                <Text style={editStyles.quickLinkText}>Log Vineyard Operation</Text>
                <Feather name="arrow-right" size={16} color={colors.textSecondary} />
              </Pressable>
              <Pressable
                style={[editStyles.quickLinkBtn, { marginTop: spacing.sm }]}
                onPress={() => {
                  onClose();
                  const params = record?.blockId ? { blockId: String(record.blockId) } : undefined;
                  router.push(params ? { pathname: "/vine-harvest", params } : "/vine-harvest");
                }}
              >
                <Feather name="package" size={16} color={colors.primary} />
                <Text style={editStyles.quickLinkText}>Log Harvest Record</Text>
                <Feather name="arrow-right" size={16} color={colors.textSecondary} />
              </Pressable>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={editStyles.footer}>
            <Button
              title={saving ? "Saving…" : "Save Changes"}
              onPress={handleSave}
              disabled={saving}
              fullWidth
            />
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              fullWidth
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Record Row ───────────────────────────────────────────────────────────────

function SprayDiaryRow({
  item,
  blocks,
  onEdit,
  onDelete,
}: {
  item: SprayDiaryRecord;
  blocks: VineBlock[];
  onEdit: (record: SprayDiaryRecord) => void;
  onDelete: (id: number) => void;
}) {
  const linkedBlockName = useBlockName(item.blockId, blocks);
  const linked = !!item.blockId;

  const handlePress = () => {
    Haptics.selectionAsync();
    onEdit(item);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const photoCount = item.photoCount ?? 0;
    const photoWarning = photoCount > 0
      ? `\n\nThis record has ${photoCount} ${photoCount === 1 ? "photo" : "photos"}. Deleting it will also remove all attached photos.`
      : "";
    Alert.alert(
      "Delete Spray Entry",
      `Delete the spray entry for "${item.productName ?? "this record"}" on ${formatDate(item.applicationDate)}?${photoWarning} This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) },
      ],
    );
  };

  return (
    <Pressable style={styles.row} onPress={handlePress}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowDate}>{formatDate(item.applicationDate)}</Text>
        <Text style={styles.rowProduct} numberOfLines={1}>
          {item.productName ?? "—"}
          {item.productType ? <Text style={styles.rowProductType}>  {item.productType}</Text> : null}
        </Text>
        <View style={styles.rowMeta}>
          {linked ? (
            <View style={styles.blockTag}>
              <Feather name="layers" size={12} color={colors.primary} />
              <Text style={styles.blockTagText}>{linkedBlockName ?? "Block"}</Text>
            </View>
          ) : (
            <View style={styles.unlinkTag}>
              <Feather name="alert-circle" size={12} color={colors.warning ?? "#d97706"} />
              <Text style={styles.unlinkTagText}>No block linked</Text>
            </View>
          )}
          {item.operatorName ? (
            <Text style={styles.rowSub} numberOfLines={1}>{item.operatorName}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        {item.areaTreatedHa ? (
          <View style={styles.areaBadge}>
            <Text style={styles.areaBadgeText}>{Number(item.areaTreatedHa).toFixed(1)} ha</Text>
          </View>
        ) : null}
        <Feather name="edit-2" size={14} color={colors.textSecondary} />
        <Pressable onPress={(e) => { e.stopPropagation(); handleDelete(); }} hitSlop={12} style={styles.deleteBtn}>
          <Feather name="trash-2" size={15} color={colors.error} />
        </Pressable>
        <Feather name="chevron-right" size={16} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VineSprayDiaryHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { address, postcode, cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("vine-spray-history", currentFarm?.id, user?.id);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));
  const { records, loading, refreshing, error, refresh } = useApiFetch<SprayDiaryRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/vineyard-spray-diary",
  );
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);
  const { savePdf } = usePrint();

  const missingAddressFields: string[] = !identifiersLoading
    ? [
        !currentFarm?.name || currentFarm.name.trim() === "" ? "Farm name" : "",
        !address || address.trim() === "" ? "Farm address" : "",
      ].filter(Boolean)
    : [];

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [editingRecord, setEditingRecord] = useState<SprayDiaryRecord | null>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<number, Partial<SprayDiaryRecord>>>({});
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [exporting, setExporting] = useState(false);

  const displayRecords = useMemo(() => {
    return records
      .filter(r => !deletedIds.has(r.id))
      .map(r => {
        const update = localUpdates[r.id];
        if (update !== undefined) return { ...r, ...update };
        return r;
      });
  }, [records, localUpdates, deletedIds]);

  const canonFrom = useMemo(() => canonicaliseDate(dateFrom), [dateFrom]);
  const canonTo = useMemo(() => canonicaliseDate(dateTo), [dateTo]);

  // Validation flags — only flag once the user has finished typing a full date
  const dateFromInvalid = dateFrom.trim().length >= 8 && canonFrom === null;
  const dateToInvalid = dateTo.trim().length >= 8 && canonTo === null;
  const dateRangeReversed = canonFrom !== null && canonTo !== null && canonFrom > canonTo;

  const filtered = useMemo(() => {
    let result = displayRecords;

    // Date range filter — only apply when canonical form is valid
    if (canonFrom) {
      result = result.filter(r => r.applicationDate && r.applicationDate >= canonFrom);
    }
    if (canonTo) {
      result = result.filter(r => r.applicationDate && r.applicationDate <= canonTo);
    }

    // Text search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r => {
        const blockName = r.blockId ? blocks.find(b => b.id === r.blockId)?.blockName ?? "" : "";
        return (
          (r.productName ?? "").toLowerCase().includes(q) ||
          blockName.toLowerCase().includes(q) ||
          (r.operatorName ?? "").toLowerCase().includes(q) ||
          (r.applicationDate ?? "").includes(q) ||
          (r.productType ?? "").toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [displayRecords, search, canonFrom, canonTo, blocks]);

  const handleSaved = (recordId: number, updated: Partial<SprayDiaryRecord>) => {
    setLocalUpdates(prev => ({
      ...prev,
      [recordId]: { ...(prev[recordId] ?? {}), ...updated },
    }));
    setEditingRecord(null);
    // If the blockId changed (link/unlink), notify the home screen immediately
    // so its compliance gap banner reflects the new count without waiting for
    // the next navigation focus event.
    if ('blockId' in updated) {
      vineyardCountEvents.emit();
    }
  };

  const handleDelete = async (id: number) => {
    // Optimistically remove from the list
    setDeletedIds(prev => new Set(prev).add(id));
    try {
      const res = await apiFetch(`/api/farms/${currentFarm?.id}/vineyard-spray-diary/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        // Restore on failure
        setDeletedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
        Alert.alert("Delete Failed", "Could not delete the record. Please try again.");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch {
      setDeletedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      Alert.alert("Delete Failed", "Could not reach the server. Please try again.");
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const rows: VineSprayDiaryRow[] = filtered.map(r => ({
        id: r.id,
        applicationDate: r.applicationDate,
        blockName: r.blockId ? (blocks.find(b => b.id === r.blockId)?.blockName ?? null) : null,
        productName: r.productName,
        mappNumber: r.mappNumber,
        activeIngredient: r.activeIngredient,
        productType: r.productType,
        ratePerHectare: r.ratePerHectare,
        rateUnit: r.rateUnit,
        areaTreatedHa: r.areaTreatedHa,
        windSpeedMph: r.windSpeedMph,
        temperatureCelsius: r.temperatureCelsius,
        weatherConditions: r.weatherConditions,
        operatorName: r.operatorName,
        operatorCertificateNo: r.operatorCertificateNo,
        notes: r.notes,
      }));
      const html = vineSprayDiaryHtml(
        rows,
        currentFarm?.name ?? null,
        address,
        postcode,
        search.trim() || undefined,
        canonFrom ?? undefined,
        canonTo ?? undefined,
      );
      await savePdf(html, "Vine Spray Diary");
    } catch {
      Alert.alert("Export Failed", "Could not generate the spray diary report. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Spray Diary History</Text>
        <Pressable
          onPress={handleExport}
          disabled={exporting || filtered.length === 0}
          style={[styles.exportBtn, (exporting || filtered.length === 0) && styles.exportBtnDisabled]}
          hitSlop={8}
        >
          {exporting
            ? <ActivityIndicator size="small" color={colors.primary} />
            : <Feather name="share" size={18} color={filtered.length === 0 ? colors.textSecondary : colors.primary} />
          }
          <Text style={[styles.exportBtnText, filtered.length === 0 && styles.exportBtnTextDisabled]}>
            {exporting ? "Exporting…" : "Export"}
          </Text>
        </Pressable>
      </View>

      <IdentifierBanner
        justSaved={justSaved && !identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={!cphNumber}
        sbiMissing={!sbiNumber}
        context="spray records"
      />

      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by product, block or operator…"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Date range filter */}
      <View style={styles.dateRangeRow}>
        <Feather name="calendar" size={14} color={colors.textSecondary} />
        <View style={styles.dateRangeInputs}>
          <View style={styles.dateRangeField}>
            <Text style={styles.dateRangeLabel}>From</Text>
            <TextInput
              style={[styles.dateInput, dateFromInvalid && styles.dateInputError]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.textSecondary}
              value={dateFrom}
              onChangeText={setDateFrom}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
          <View style={styles.dateRangeSep} />
          <View style={styles.dateRangeField}>
            <Text style={styles.dateRangeLabel}>To</Text>
            <TextInput
              style={[styles.dateInput, dateToInvalid && styles.dateInputError]}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={colors.textSecondary}
              value={dateTo}
              onChangeText={setDateTo}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          </View>
        </View>
        {(dateFrom.trim() || dateTo.trim()) ? (
          <Pressable
            onPress={() => { setDateFrom(""); setDateTo(""); }}
            hitSlop={10}
            style={styles.dateRangeClear}
          >
            <Feather name="x-circle" size={16} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {(dateFromInvalid || dateToInvalid || dateRangeReversed) && (
        <View style={styles.dateRangeError}>
          <Feather name="alert-circle" size={13} color={colors.error} />
          <Text style={styles.dateRangeErrorText}>
            {dateRangeReversed
              ? "'From' date must be before 'To' date."
              : "Use DD/MM/YYYY or YYYY-MM-DD format."}
          </Text>
        </View>
      )}

      {missingAddressFields.length > 0 && (
        <Pressable
          onPress={() => router.push("/(tabs)/more")}
          style={styles.addressWarning}
        >
          <Feather name="alert-triangle" size={15} color="#92400e" />
          <Text style={styles.addressWarningText}>
            <Text style={styles.addressWarningBold}>Farm Settings incomplete: </Text>
            {missingAddressFields.join(", ")}{" "}
            {missingAddressFields.length === 1 ? "is" : "are"} not set — your report will have blank header fields.{" "}
            Tap to update in Farm Settings.
          </Text>
        </Pressable>
      )}

      {loading && !refreshing ? (
        <ActivityIndicator style={{ marginTop: spacing.xl }} color={colors.primary} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={18} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => (
            <SprayDiaryRow
              item={item}
              blocks={blocks}
              onEdit={setEditingRecord}
              onDelete={handleDelete}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="droplet" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No spray diary entries</Text>
              <Text style={styles.emptyText}>
                {search.trim() || dateFrom.trim() || dateTo.trim()
                  ? "No entries match the current filters."
                  : "Spray diary entries you create will appear here."}
              </Text>
            </View>
          }
        />
      )}

      <EditSprayDiaryModal
        visible={editingRecord !== null}
        record={editingRecord}
        farmId={currentFarm?.id ?? ""}
        blocks={blocks}
        blocksLoading={blocksLoading}
        onClose={() => setEditingRecord(null)}
        onSaved={handleSaved}
      />
    </View>
  );
}

// ─── Edit Modal Styles ────────────────────────────────────────────────────────

const editStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  headerLeft: { flex: 1, marginRight: spacing.md },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: { padding: spacing.xs, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  row: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  clearBlockBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  clearBlockText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textDecorationLine: "underline",
  },
  quickLinkHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  quickLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickLinkText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  // Photo section (inside card)
  photoSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  photoSectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  photoCount: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  photoHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  emptyPhotos: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  emptyPhotosText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  addPhotoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignSelf: "flex-start",
  },
  addPhotoBtnDisabled: { opacity: 0.5 },
  addPhotoBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text, flex: 1 },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  exportBtnDisabled: { borderColor: colors.border },
  exportBtnText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primary },
  exportBtnTextDisabled: { color: colors.textSecondary },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    margin: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { marginRight: spacing.xs },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  listContent: { paddingBottom: spacing.xl },
  emptyContainer: { flex: 1, justifyContent: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  rowLeft: { flex: 1, gap: 4 },
  rowDate: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  rowProduct: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  rowProductType: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  rowSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginLeft: spacing.sm },
  deleteBtn: { padding: 4 },
  addressWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  addressWarningText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  addressWarningBold: {
    fontFamily: fonts.semiBold,
  },
  dateRangeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateRangeInputs: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dateRangeField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateRangeLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    width: 26,
  },
  dateInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.text,
    paddingVertical: 4,
  },
  dateRangeSep: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  dateRangeClear: {
    paddingLeft: spacing.xs,
  },
  dateInputError: {
    color: colors.error,
  },
  dateRangeError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginHorizontal: spacing.md,
    marginTop: -spacing.xs,
    marginBottom: spacing.xs,
  },
  dateRangeErrorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.error,
  },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.lg },
  blockTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ede9fe",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  blockTagText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primary },
  unlinkTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fffbeb",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unlinkTagText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.warning ?? "#d97706" },
  areaBadge: {
    backgroundColor: colors.background,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  areaBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: "#fef2f2",
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.error, flex: 1 },
  emptyBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
  thumbnail: { alignItems: "center", maxWidth: 90 },
  thumbImgBox: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.border,
  },
  thumbImage: { width: "100%", height: "100%" },
  thumbPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.borderLight,
  },
  captionBelow: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 80,
  },
});

// ─── Lightbox Styles ──────────────────────────────────────────────────────────

const lbStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
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
  counter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  counterText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.5,
  },
  imageContainer: {
    width: SCREEN.width,
    height: SCREEN.height,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: SCREEN.width,
    height: SCREEN.height,
  },
  captionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  captionText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#fff",
    textAlign: "center",
  },
  hintBar: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  hintText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
  },
  saveBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  shareBtn: {
    position: "absolute",
    left: 64,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
});
