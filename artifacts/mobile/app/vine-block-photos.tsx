import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  isCover: boolean;
  uploadedAt: string;
  /** Short-lived presigned GET URL returned by the API — use directly in <Image>. */
  downloadUrl: string | null;
}

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

const SCREEN = Dimensions.get("window");
const SWIPE_DOWN_THRESHOLD = 120;
const SWIPE_HORIZ_THRESHOLD = 60;
const MIN_SCALE = 1;
const MAX_SCALE = 5;

// Gesture direction lock — 0 = undecided, 1 = horizontal, 2 = vertical
const DIR_NONE = 0;
const DIR_HORIZ = 1;
const DIR_VERT = 2;

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

// ---------------------------------------------------------------------------
// Draggable photo strip (shown inside lightbox for reordering)
// ---------------------------------------------------------------------------

// Item size is computed dynamically from photo count — see DraggablePhotoStrip.
const STRIP_ITEM_GAP = 6;
const STRIP_MAX_ITEM_SIZE = 52;
const STRIP_MIN_ITEM_SIZE = 36;
const STRIP_H_PADDING = 32; // total horizontal padding around the strip

/** Compute the item size that fits all `count` photos without clipping. */
function computeStripItemSize(count: number): number {
  if (count <= 1) return STRIP_MAX_ITEM_SIZE;
  const available = SCREEN.width - STRIP_H_PADDING - (count - 1) * STRIP_ITEM_GAP;
  return Math.max(STRIP_MIN_ITEM_SIZE, Math.min(STRIP_MAX_ITEM_SIZE, Math.floor(available / count)));
}

interface DraggablePhotoStripProps {
  photos: BlockPhoto[];
  currentIndex: number;
  onSelect: (idx: number) => void;
  onReorder: (newPhotoIds: number[]) => void;
}

/**
 * Horizontal thumbnail strip shown inside the lightbox.
 *
 * Design constraints preserved here:
 * - The cover photo (isCover=true) is always pinned at position 0 and is NOT
 *   draggable — the server enforces `ORDER BY is_cover DESC` so any sort_order
 *   change on the cover is ignored at read-time.
 * - Only non-cover photos are draggable; their new order is submitted as
 *   `[cover.id, ...newNonCoverIds]` so the API validation sees the full set.
 * - Item size is computed from the total photo count so every thumbnail fits
 *   on-screen without clipping, even for large galleries.
 */
function DraggablePhotoStrip({ photos, currentIndex, onSelect, onReorder }: DraggablePhotoStripProps) {
  // Separate cover from the draggable pool
  const coverPhoto = useMemo(() => photos.find((p) => p.isCover) ?? null, [photos]);
  const nonCoverPhotos = useMemo(() => photos.filter((p) => !p.isCover), [photos]);

  // Dynamic item size — fits all photos on screen width
  const itemSize = useMemo(() => computeStripItemSize(photos.length), [photos.length]);
  const slotWidth = itemSize + STRIP_ITEM_GAP;

  // localOrder stores non-cover photo IDs in display order (ID-based)
  const [localOrder, setLocalOrder] = useState<number[]>(() => nonCoverPhotos.map((p) => p.id));
  const [dragSourceSlot, setDragSourceSlot] = useState<number>(-1);
  const [dropTargetSlot, setDropTargetSlot] = useState<number>(-1);

  const dragPosX = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const dragSourceSlotSv = useSharedValue(-1);

  // Reset local order when the non-cover photo set changes (add/delete).
  // A reorder that preserves the same IDs (same key) does NOT reset.
  const nonCoverIdsKey = nonCoverPhotos.map((p) => p.id).join(",");
  useEffect(() => {
    setLocalOrder(nonCoverPhotos.map((p) => p.id));
    setDragSourceSlot(-1);
    setDropTargetSlot(-1);
    isDragging.value = false;
    dragSourceSlotSv.value = -1;
  }, [nonCoverIdsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // O(1) photo lookup by ID for rendering
  const photoMap = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);

  // ID of the photo currently displayed in the lightbox (for highlight)
  const currentPhotoId = photos[currentIndex]?.id ?? -1;

  const nonCoverCount = nonCoverPhotos.length;

  const hapticStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const beginDrag = useCallback((slot: number) => {
    dragSourceSlotSv.value = slot;
    setDragSourceSlot(slot);
    setDropTargetSlot(slot);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateDrop = useCallback((slot: number) => {
    setDropTargetSlot(slot);
  }, []);

  const commitReorder = useCallback((sourceSlot: number, targetSlot: number) => {
    setDragSourceSlot(-1);
    setDropTargetSlot(-1);
    if (sourceSlot < 0 || sourceSlot === targetSlot) return;
    setLocalOrder((prev) => {
      const next = [...prev];
      const [moved] = next.splice(sourceSlot, 1);
      next.splice(targetSlot, 0, moved);
      // Always submit cover first (if one exists) so the full-set API
      // validation passes and the server ordering contract is respected.
      const fullOrder = coverPhoto ? [coverPhoto.id, ...next] : next;
      onReorder(fullOrder);
      return next;
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [coverPhoto, onReorder]);

  const cancelDrag = useCallback(() => {
    setDragSourceSlot(-1);
    setDropTargetSlot(-1);
  }, []);

  // Worklet-safe snapshot of slotWidth and nonCoverCount
  const slotWidthSv = slotWidth;
  const itemSizeSv = itemSize;

  const stripPanGesture = Gesture.Pan()
    .activateAfterLongPress(450)
    .onBegin((e) => {
      "worklet";
      const slot = Math.max(0, Math.min(nonCoverCount - 1, Math.floor(e.x / slotWidthSv)));
      isDragging.value = true;
      dragSourceSlotSv.value = slot;
      dragPosX.value = slot * slotWidthSv + itemSizeSv / 2;
      runOnJS(hapticStart)();
      runOnJS(beginDrag)(slot);
    })
    .onUpdate((e) => {
      "worklet";
      const clamped = Math.max(itemSizeSv / 2, Math.min(nonCoverCount * slotWidthSv - itemSizeSv / 2, e.x));
      dragPosX.value = clamped;
      const drop = Math.max(0, Math.min(nonCoverCount - 1, Math.round((clamped - itemSizeSv / 2) / slotWidthSv)));
      runOnJS(updateDrop)(drop);
    })
    .onEnd((e) => {
      "worklet";
      const clamped = Math.max(itemSizeSv / 2, Math.min(nonCoverCount * slotWidthSv - itemSizeSv / 2, e.x));
      const drop = Math.max(0, Math.min(nonCoverCount - 1, Math.round((clamped - itemSizeSv / 2) / slotWidthSv)));
      const source = dragSourceSlotSv.value;
      isDragging.value = false;
      dragSourceSlotSv.value = -1;
      runOnJS(commitReorder)(source, drop);
    })
    .onFinalize(() => {
      "worklet";
      isDragging.value = false;
      dragSourceSlotSv.value = -1;
      runOnJS(cancelDrag)();
    });

  // Build display slots for non-cover photos (ID-based).
  // During drag: source slot becomes a gap (null), gap moves to drop position.
  const displaySlots: Array<number | null> = useMemo(() => {
    if (dragSourceSlot < 0) return [...localOrder];
    const arr: Array<number | null> = [...localOrder];
    arr.splice(dragSourceSlot, 1, null);
    const removed = arr.splice(dragSourceSlot, 1);
    arr.splice(dropTargetSlot, 0, removed[0]);
    return arr;
  }, [localOrder, dragSourceSlot, dropTargetSlot]);

  const floatingStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: 0,
    left: dragPosX.value - itemSizeSv / 2,
    opacity: isDragging.value ? 1 : 0,
    zIndex: 20,
    transform: [{ scale: withSpring(isDragging.value ? 1.2 : 1) }],
  }));

  const dragging = dragSourceSlot >= 0;
  const draggedPhotoId = dragging ? localOrder[dragSourceSlot] ?? -1 : -1;
  const draggedPhoto = draggedPhotoId >= 0 ? photoMap.get(draggedPhotoId) : undefined;
  const nonCoverStripWidth = nonCoverCount * slotWidth - STRIP_ITEM_GAP;

  const iSize = itemSize; // stable reference for inline styles

  return (
    <View style={stripStyles.outerRow}>
      {/* Cover photo — pinned at position 0, not draggable */}
      {coverPhoto ? (
        <Pressable
          style={[
            stripStyles.item,
            { width: iSize, height: iSize },
            coverPhoto.id === currentPhotoId && stripStyles.itemCurrent,
            stripStyles.itemCoverBorder,
          ]}
          onPress={() => {
            const idx = photos.findIndex((p) => p.id === coverPhoto.id);
            if (idx >= 0) onSelect(idx);
          }}
        >
          {coverPhoto.downloadUrl ? (
            <Image source={{ uri: coverPhoto.downloadUrl }} style={stripStyles.itemImage} resizeMode="cover" />
          ) : (
            <View style={stripStyles.itemPlaceholder} />
          )}
          <View style={stripStyles.coverBadge}>
            <Text style={stripStyles.coverBadgeText}>★</Text>
          </View>
        </Pressable>
      ) : null}

      {/* Draggable non-cover strip */}
      {nonCoverCount > 0 ? (
        <GestureDetector gesture={stripPanGesture}>
          <View style={{ width: nonCoverStripWidth, height: iSize, position: "relative" }}>
            <View style={[stripStyles.row, { height: iSize }]}>
              {displaySlots.map((photoId, slotIdx) => {
                const isGap = photoId === null;
                const ph = !isGap ? photoMap.get(photoId!) : undefined;
                const isCurrentPage = !isGap && photoId === currentPhotoId;
                const uri = ph?.downloadUrl ?? null;
                return (
                  <Pressable
                    key={slotIdx}
                    onPress={() => {
                      if (!dragging && !isGap && photoId != null) {
                        const idx = photos.findIndex((p) => p.id === photoId);
                        if (idx >= 0) onSelect(idx);
                      }
                    }}
                    style={[
                      stripStyles.item,
                      { width: iSize, height: iSize },
                      isCurrentPage && stripStyles.itemCurrent,
                      isGap && stripStyles.itemGap,
                    ]}
                  >
                    {!isGap && uri ? (
                      <Image source={{ uri }} style={stripStyles.itemImage} resizeMode="cover" />
                    ) : !isGap ? (
                      <View style={stripStyles.itemPlaceholder} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {/* Floating copy of the dragged thumbnail */}
            {dragging && draggedPhoto ? (
              <Animated.View style={[stripStyles.floatingItem, { width: iSize, height: iSize }, floatingStyle]}>
                {draggedPhoto.downloadUrl ? (
                  <Image
                    source={{ uri: draggedPhoto.downloadUrl }}
                    style={stripStyles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={stripStyles.itemPlaceholder} />
                )}
              </Animated.View>
            ) : null}
          </View>
        </GestureDetector>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Lightbox
// ---------------------------------------------------------------------------

interface LightboxProps {
  photos: BlockPhoto[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  onReorder: (newPhotoIds: number[]) => void;
}

function PhotoLightbox({ photos, initialIndex, visible, onClose, onReorder }: LightboxProps) {
  const insets = useSafeAreaInsets();

  // Track the current photo by ID so that when the parent reorders photos[]
  // the displayed photo stays the same (currentIndex is derived, not stored).
  const [currentPhotoId, setCurrentPhotoId] = useState<number | null>(
    photos[Math.min(initialIndex, photos.length - 1)]?.id ?? null,
  );

  // Derive the numeric index from the ID — automatically corrects after reorder
  const currentIndex = useMemo(() => {
    if (currentPhotoId == null) return 0;
    const idx = photos.findIndex((p) => p.id === currentPhotoId);
    return idx >= 0 ? idx : 0;
  }, [photos, currentPhotoId]);

  // UI-thread shared values for worklet gestures
  const indexSv = useSharedValue(initialIndex);
  const totalSv = useSharedValue(photos.length);

  // Keep worklet index in sync with derived JS-thread index (handles reorder)
  useEffect(() => {
    indexSv.value = currentIndex;
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep totalSv in sync when photos change
  useEffect(() => {
    totalSv.value = photos.length;
  }, [photos.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Guard against blank slide or out-of-bounds index when the photos array
  // shrinks (e.g. a photo deleted from the grid while the lightbox is open).
  useEffect(() => {
    if (!visible) return;
    if (photos.length === 0) {
      // All photos gone — close the lightbox gracefully
      onClose();
      return;
    }
    const stillExists = photos.some((p) => p.id === currentPhotoId);
    if (!stillExists && currentPhotoId != null) {
      // The currently-displayed photo was deleted. Clamp to the nearest
      // remaining slide (indexSv.value held its old position before deletion).
      const clampedIdx = Math.min(indexSv.value, photos.length - 1);
      const newId = photos[clampedIdx]?.id ?? null;
      setCurrentPhotoId(newId);
    }
  }, [photos]); // eslint-disable-line react-hooks/exhaustive-deps

  // Ref to always-current photos so goToIndex worklet callback never goes stale
  const photosRef = useRef(photos);
  photosRef.current = photos;

  // Zoom / pan state
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Horizontal slide for swipe-navigation
  const slideX = useSharedValue(0);

  // Gesture direction lock (reset each gesture)
  const gestureDir = useSharedValue(DIR_NONE);

  // Background fade
  const bgOpacity = useSharedValue(0);

  // Reset everything when the lightbox opens/closes
  useEffect(() => {
    if (visible) {
      const idx = Math.min(initialIndex, photosRef.current.length - 1);
      const id = photosRef.current[idx]?.id ?? null;
      setCurrentPhotoId(id);
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

  // Navigate to a specific index (called from worklet via runOnJS).
  // Uses photosRef so the closure never goes stale when photos are reordered.
  const goToIndex = useCallback((idx: number) => {
    const photo = photosRef.current[idx];
    setCurrentPhotoId(photo?.id ?? null);
    // Reset zoom for the new photo
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    slideX.value = 0;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pinch-to-zoom gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = clamp(savedScale.value * e.scale, MIN_SCALE, MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE);
        savedScale.value = MIN_SCALE;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  // Pan gesture — zoom pan · swipe-down dismiss · horizontal navigation
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      gestureDir.value = DIR_NONE;
    })
    .onUpdate((e) => {
      if (scale.value > 1) {
        // Free pan when zoomed in
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
        return;
      }

      // Lock gesture direction on first significant movement
      if (gestureDir.value === DIR_NONE) {
        if (Math.abs(e.translationX) > 8 || Math.abs(e.translationY) > 8) {
          gestureDir.value =
            Math.abs(e.translationX) >= Math.abs(e.translationY)
              ? DIR_HORIZ
              : DIR_VERT;
        }
        return;
      }

      if (gestureDir.value === DIR_HORIZ) {
        slideX.value = e.translationX;
      } else {
        // Vertical — swipe-to-dismiss (only downward)
        translateY.value = Math.max(0, e.translationY);
      }
    })
    .onEnd((e) => {
      if (scale.value > 1) {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
        return;
      }

      if (gestureDir.value === DIR_HORIZ) {
        const dx = e.translationX;
        if (dx < -SWIPE_HORIZ_THRESHOLD && indexSv.value < totalSv.value - 1) {
          // Swipe left → next photo
          const next = indexSv.value + 1;
          indexSv.value = next;
          slideX.value = withTiming(-SCREEN.width, { duration: 220 }, () => {
            runOnJS(goToIndex)(next);
          });
        } else if (dx > SWIPE_HORIZ_THRESHOLD && indexSv.value > 0) {
          // Swipe right → previous photo
          const prev = indexSv.value - 1;
          indexSv.value = prev;
          slideX.value = withTiming(SCREEN.width, { duration: 220 }, () => {
            runOnJS(goToIndex)(prev);
          });
        } else {
          // Not far enough — snap back
          slideX.value = withSpring(0);
        }
      } else if (gestureDir.value === DIR_VERT) {
        if (e.translationY > SWIPE_DOWN_THRESHOLD) {
          translateY.value = withTiming(SCREEN.height, { duration: 220 }, () => {
            runOnJS(onClose)();
          });
        } else {
          translateY.value = withSpring(0);
        }
      }
    });

  // Double-tap resets / zooms in
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
      <Animated.View style={[styles.lbOverlay, bgStyle]}>
        {/* Close button */}
        <Pressable
          style={[styles.lbCloseBtn, { top: insets.top + 12 }]}
          onPress={onClose}
          hitSlop={16}
        >
          <Feather name="x" size={24} color="#fff" />
        </Pressable>

        {/* Page counter */}
        {hasMultiple ? (
          <View style={[styles.lbCounter, { top: insets.top + 20 }]}>
            <Text style={styles.lbCounterText}>
              {currentIndex + 1} / {photos.length}
            </Text>
          </View>
        ) : null}

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

        {/* Draggable thumbnail strip — replaces dot indicator, allows reordering */}
        {hasMultiple ? (
          <View style={[styles.lbStripWrapper, { bottom: caption ? 72 + insets.bottom : insets.bottom + 16 }]}>
            <DraggablePhotoStrip
              photos={photos}
              currentIndex={currentIndex}
              onSelect={(idx) => goToIndex(idx)}
              onReorder={onReorder}
            />
            <Text style={styles.lbHintText}>
              Hold &amp; drag thumbnails to reorder · Swipe photo to browse
            </Text>
          </View>
        ) : (
          <View style={[styles.lbStripWrapper, { bottom: insets.bottom + 16 }]}>
            <Text style={styles.lbHintText}>
              Pinch to zoom · Double-tap · Swipe down to close
            </Text>
          </View>
        )}
      </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Caption sheet
// ---------------------------------------------------------------------------

function CaptionSheet({
  visible,
  initialCaption,
  saving,
  onSave,
  onClose,
}: {
  visible: boolean;
  initialCaption: string | null;
  saving: boolean;
  onSave: (caption: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(initialCaption ?? "");

  // Reset text whenever the sheet opens for a (possibly different) photo
  useEffect(() => {
    if (visible) setText(initialCaption ?? "");
  }, [visible, initialCaption]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.sheetOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.sheetDismiss} onPress={onClose} />
        <View style={styles.sheetCard}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Edit Caption</Text>
          <TextInput
            style={styles.sheetInput}
            value={text}
            onChangeText={setText}
            placeholder="e.g. Post-harvest Oct 2025"
            placeholderTextColor={colors.textSecondary}
            maxLength={200}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => onSave(text)}
          />
          <View style={styles.sheetRow}>
            <Pressable style={styles.sheetCancel} onPress={onClose}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.sheetSave, saving && styles.sheetSaveDisabled]}
              onPress={() => onSave(text)}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sheetSaveText}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  onEditCaption,
}: {
  photo: BlockPhoto;
  onDelete: (id: number) => void;
  onPress: (uri: string | null, photo: BlockPhoto) => void;
  onEditCaption: (photo: BlockPhoto) => void;
}) {
  const uri = photo.downloadUrl ?? null;

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Photo Options", undefined, [
      { text: "Edit Caption", onPress: () => onEditCaption(photo) },
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
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxVisible, setLightboxVisible] = useState(false);

  // Caption sheet state
  const [captionPhoto, setCaptionPhoto] = useState<BlockPhoto | null>(null);
  const [captionSaving, setCaptionSaving] = useState(false);

  const openLightbox = useCallback((_uri: string | null, photo: BlockPhoto) => {
    setPhotos((prev) => {
      const idx = prev.findIndex((p) => p.id === photo.id);
      setLightboxIndex(idx >= 0 ? idx : 0);
      return prev;
    });
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

  // Re-fetch photos whenever the screen comes back into focus so that
  // short-lived presigned URLs are always fresh (they expire after ~5 min).
  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos]),
  );

  // Called by the lightbox strip when the grower drags photos into a new order.
  // Optimistically reorders state immediately then persists to the server.
  const handleReorder = useCallback(async (newPhotoIds: number[]) => {
    if (!currentFarm?.id || !selectedBlock) return;
    // Optimistic update: reorder photos state by the new ID order
    setPhotos((prev) => {
      const map = new Map(prev.map((p) => [p.id, p]));
      return newPhotoIds.map((id) => map.get(id)).filter(Boolean) as BlockPhoto[];
    });
    try {
      const res = await apiFetch(
        `/api/farms/${currentFarm.id}/vineyard-blocks/${selectedBlock.id}/photos/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photoIds: newPhotoIds }),
        },
      );
      if (!res.ok) {
        // Revert by reloading from server
        loadPhotos();
      }
    } catch {
      loadPhotos();
    }
  }, [currentFarm?.id, selectedBlock, loadPhotos]);

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

  const handleEditCaption = useCallback((photo: BlockPhoto) => {
    setCaptionPhoto(photo);
  }, []);

  const handleSaveCaption = async (caption: string) => {
    if (!currentFarm?.id || !selectedBlock || !captionPhoto) return;
    setCaptionSaving(true);
    try {
      const res = await apiFetch(
        `/api/farms/${currentFarm.id}/vineyard-blocks/${selectedBlock.id}/photos/${captionPhoto.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caption: caption.trim() || null }),
        },
      );
      if (res.ok) {
        const trimmed = caption.trim() || null;
        setPhotos((prev) =>
          prev.map((p) => (p.id === captionPhoto.id ? { ...p, caption: trimmed } : p)),
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCaptionPhoto(null);
      } else {
        Alert.alert("Error", "Could not save the caption. Please try again.");
      }
    } catch {
      Alert.alert("Error", "Could not save the caption.");
    } finally {
      setCaptionSaving(false);
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
              onEditCaption={handleEditCaption}
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
              <Text style={styles.hint}>Tap to view · Hold for options.</Text>
            </View>
          }
        />
      )}

      {/* Full-screen lightbox */}
      <PhotoLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        visible={lightboxVisible}
        onClose={closeLightbox}
        onReorder={handleReorder}
      />

      {/* Caption editor */}
      <CaptionSheet
        visible={captionPhoto !== null}
        initialCaption={captionPhoto?.caption ?? null}
        saving={captionSaving}
        onSave={handleSaveCaption}
        onClose={() => setCaptionPhoto(null)}
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
  lbCounter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  lbCounterText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.85)",
    letterSpacing: 0.5,
  },
  lbDots: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  lbDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  lbDotActive: {
    backgroundColor: "#fff",
    width: 8,
    height: 8,
    borderRadius: 4,
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
  lbStripWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    gap: 8,
    zIndex: 10,
  },
  lbHintText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
  },
  // Caption sheet
  sheetOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetDismiss: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheetCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
    alignSelf: "center",
    marginBottom: spacing.md,
  },
  sheetTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sheetInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: spacing.md,
  },
  sheetRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  sheetCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  sheetCancelText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sheetSave: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  sheetSaveDisabled: {
    opacity: 0.6,
  },
  sheetSaveText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: "#fff",
  },
});

// Styles for DraggablePhotoStrip (separate to keep the main StyleSheet tidy).
// Width/height on items is applied inline because it is computed dynamically.
const stripStyles = StyleSheet.create({
  outerRow: {
    flexDirection: "row",
    gap: STRIP_ITEM_GAP,
    alignItems: "center",
    flexWrap: "nowrap",
  },
  row: {
    flexDirection: "row",
    gap: STRIP_ITEM_GAP,
    alignItems: "center",
  },
  item: {
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  itemCurrent: {
    borderColor: "#fff",
    borderWidth: 2,
  },
  itemCoverBorder: {
    borderColor: "rgba(255,215,0,0.7)", // gold tint for the cover
    borderWidth: 2,
  },
  itemGap: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.3)",
    borderStyle: "dashed",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemPlaceholder: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  coverBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 3,
    paddingHorizontal: 2,
  },
  coverBadgeText: {
    fontSize: 8,
    color: "rgba(255,215,0,0.9)",
    lineHeight: 11,
  },
  floatingItem: {
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
});
