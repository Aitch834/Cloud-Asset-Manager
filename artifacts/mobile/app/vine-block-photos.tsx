import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
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

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useApiVineBlocks, type VineBlock } from "@/lib/hooks/useApiVineBlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { useUiPrefs } from "@/lib/hooks/useUiPrefs";
import { apiFetch } from "@/lib/apiFetch";
import { uploadPhotoToStorage, getApiBase } from "@/lib/uploadPhoto";
import { buildGridDeleteMessage, buildLightboxDeleteMessage } from "@/lib/vineBlockPhotosHelpers";
import { fetchBlockPhotos, applyPhotoUpdateIfCurrent } from "@/lib/vineBlockPhotosApi";
import { VineBlockPicker, BlockThumbnail } from "@/components/VineBlockPicker";

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

// Stored server-side (via useUiPrefs → /api/account/ui-prefs) so dismissal
// survives device changes.  AsyncStorage is used as a read-through cache by
// useUiPrefs; the server is the source of truth.
const REORDER_HINT_KEY = "lightbox_reorder_hint_shown";

function blockStatusColor(plantingStatus: string) {
  if (plantingStatus === "active") return "#16a34a";
  if (plantingStatus === "suspended") return "#d97706";
  return colors.textSecondary;
}
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

// Strip layout constants — item size is always fixed; overflow scrolls horizontally.
const STRIP_ITEM_GAP = 6;
const STRIP_MAX_ITEM_SIZE = 52;
const STRIP_SIDE_PADDING = 16; // padding at each end of the scrollable strip

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
 * - Items are always STRIP_MAX_ITEM_SIZE; a horizontal ScrollView handles overflow
 *   so thumbnails never shrink regardless of gallery size.
 * - Scroll is locked while a drag is active so pan doesn't fight the ScrollView.
 * - The active thumbnail is automatically scrolled into view on navigation.
 */
function DraggablePhotoStrip({ photos, currentIndex, onSelect, onReorder }: DraggablePhotoStripProps) {
  // Separate cover from the draggable pool
  const coverPhoto = useMemo(() => photos.find((p) => p.isCover) ?? null, [photos]);
  const nonCoverPhotos = useMemo(() => photos.filter((p) => !p.isCover), [photos]);

  // Fixed item size — ScrollView handles overflow for large galleries
  const itemSize = STRIP_MAX_ITEM_SIZE;
  const slotWidth = itemSize + STRIP_ITEM_GAP;

  // localOrder stores non-cover photo IDs in display order (ID-based)
  const [localOrder, setLocalOrder] = useState<number[]>(() => nonCoverPhotos.map((p) => p.id));
  const [dragSourceSlot, setDragSourceSlot] = useState<number>(-1);
  const [dropTargetSlot, setDropTargetSlot] = useState<number>(-1);
  // JS-thread flag that disables the ScrollView while a drag gesture is active
  const [dragActive, setDragActive] = useState(false);

  // Caption tooltip state — shown on long-press of a captioned thumbnail
  const [tooltipPhotoId, setTooltipPhotoId] = useState<number | null>(null);
  // Stable refs so the timer callback never captures stale state.
  // Initialized with safe empty values; kept in sync by effects below.
  const localOrderRef = useRef<number[]>([]);
  const photoMapRef = useRef<Map<number, BlockPhoto>>(new Map());

  // Ref for programmatic scrolling (auto-scroll to active thumbnail)
  const scrollViewRef = useRef<ScrollView>(null);

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
    setDragActive(false);
    isDragging.value = false;
    dragSourceSlotSv.value = -1;
  }, [nonCoverIdsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // O(1) photo lookup by ID for rendering
  const photoMap = useMemo(() => new Map(photos.map((p) => [p.id, p])), [photos]);

  // Keep stable refs in sync so tooltip timer closures are always fresh
  useEffect(() => { localOrderRef.current = localOrder; }, [localOrder]);
  useEffect(() => { photoMapRef.current = photoMap; }, [photoMap]);

  // ID of the photo currently displayed in the lightbox (for highlight + auto-scroll)
  const currentPhotoId = photos[currentIndex]?.id ?? -1;

  // Auto-scroll the active thumbnail into view whenever navigation changes it.
  // Positions are computed from the fixed layout: paddingLeft + slot * slotWidth.
  useEffect(() => {
    if (!scrollViewRef.current) return;
    const coverSlotX = STRIP_SIDE_PADDING; // left edge of cover thumbnail
    let itemLeftX: number;
    if (currentPhotoId === coverPhoto?.id) {
      itemLeftX = coverSlotX;
    } else {
      const slotInNonCover = localOrder.indexOf(currentPhotoId);
      if (slotInNonCover < 0) return;
      const nonCoverBaseX = STRIP_SIDE_PADDING + (coverPhoto ? slotWidth : 0);
      itemLeftX = nonCoverBaseX + slotInNonCover * slotWidth;
    }
    // Centre the thumbnail within the visible strip width
    const scrollX = Math.max(0, itemLeftX - SCREEN.width / 2 + itemSize / 2);
    scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
  }, [currentPhotoId]); // eslint-disable-line react-hooks/exhaustive-deps

  const nonCoverCount = nonCoverPhotos.length;

  const hapticStart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const activateDrag = useCallback(() => {
    setDragActive(true);
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
    setDragActive(false);
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
    setDragActive(false);
    setDragSourceSlot(-1);
    setDropTargetSlot(-1);
  }, []);

  // --- Caption tooltip helpers ---

  /**
   * Show the tooltip for the given non-cover slot (if the photo has a caption).
   * Called from the LongPress gesture's onStart worklet via runOnJS.
   */
  const showTooltipForSlot = useCallback((slot: number) => {
    const photoId = localOrderRef.current[slot];
    if (photoId != null) {
      const ph = photoMapRef.current.get(photoId);
      if (ph?.caption) setTooltipPhotoId(photoId);
    }
  }, []); // stable — reads via refs

  /** Hide any visible tooltip. Called on release or movement. */
  const clearTooltip = useCallback(() => {
    setTooltipPhotoId(null);
  }, []);

  // Worklet-safe snapshots (captured as consts so worklets close over stable values)
  const slotWidthSv = slotWidth;
  const itemSizeSv = itemSize;

  /**
   * LongPress gesture: fires at 300 ms (before the Pan activates at 450 ms).
   * Shows the caption tooltip for the pressed slot while the finger is held.
   * Combined with the Pan gesture using Gesture.Simultaneous so both can
   * coexist — dragging will clear the tooltip via the Pan's onUpdate check.
   */
  const stripLongPressGesture = Gesture.LongPress()
    .minDuration(300)
    .onStart((e) => {
      "worklet";
      const slot = Math.max(0, Math.min(nonCoverCount - 1, Math.floor(e.x / slotWidthSv)));
      runOnJS(showTooltipForSlot)(slot);
    })
    .onFinalize(() => {
      "worklet";
      runOnJS(clearTooltip)();
    });

  const stripPanGesture = Gesture.Pan()
    .activateAfterLongPress(450)
    .onBegin((e) => {
      "worklet";
      const slot = Math.max(0, Math.min(nonCoverCount - 1, Math.floor(e.x / slotWidthSv)));
      isDragging.value = true;
      dragSourceSlotSv.value = slot;
      dragPosX.value = slot * slotWidthSv + itemSizeSv / 2;
      runOnJS(hapticStart)();
      runOnJS(activateDrag)();
      runOnJS(beginDrag)(slot);
    })
    .onUpdate((e) => {
      "worklet";
      const clamped = Math.max(itemSizeSv / 2, Math.min(nonCoverCount * slotWidthSv - itemSizeSv / 2, e.x));
      dragPosX.value = clamped;
      const drop = Math.max(0, Math.min(nonCoverCount - 1, Math.round((clamped - itemSizeSv / 2) / slotWidthSv)));
      runOnJS(updateDrop)(drop);
      // User is intentionally dragging — dismiss the caption tooltip
      runOnJS(clearTooltip)();
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

  // Combine drag + tooltip gestures so both can coexist on the same view
  const stripGesture = Gesture.Simultaneous(stripPanGesture, stripLongPressGesture);

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
  const nonCoverStripWidth = nonCoverCount > 0 ? nonCoverCount * slotWidth - STRIP_ITEM_GAP : 0;

  const tooltipCaption = tooltipPhotoId != null ? (photoMap.get(tooltipPhotoId)?.caption ?? null) : null;

  return (
    <View style={stripStyles.container}>
      {/* Caption tooltip — rendered above the strip, pointer-events:none so taps fall through */}
      {tooltipCaption != null ? (
        <View style={stripStyles.captionTooltip} pointerEvents="none">
          <Text style={stripStyles.captionTooltipText} numberOfLines={4}>
            {tooltipCaption}
          </Text>
        </View>
      ) : null}

    <ScrollView
      ref={scrollViewRef}
      horizontal
      scrollEnabled={!dragActive}
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      style={stripStyles.scrollView}
      contentContainerStyle={stripStyles.outerRow}
    >
      {/* Cover photo — pinned at position 0, not draggable */}
      {coverPhoto ? (
        <Pressable
          style={[
            stripStyles.item,
            { width: itemSize, height: itemSize },
            coverPhoto.id === currentPhotoId && stripStyles.itemCurrent,
            stripStyles.itemCoverBorder,
          ]}
          onPress={() => {
            const idx = photos.findIndex((p) => p.id === coverPhoto.id);
            if (idx >= 0) onSelect(idx);
          }}
          onLongPress={() => {
            if (coverPhoto.caption) setTooltipPhotoId(coverPhoto.id);
          }}
          onPressOut={() => setTooltipPhotoId(null)}
          delayLongPress={500}
        >
          {coverPhoto.downloadUrl ? (
            <Image source={{ uri: coverPhoto.downloadUrl }} style={stripStyles.itemImage} resizeMode="cover" />
          ) : (
            <View style={stripStyles.itemPlaceholder} />
          )}
          <View style={stripStyles.coverBadge}>
            <Text style={stripStyles.coverBadgeText}>★</Text>
          </View>
          {coverPhoto.caption ? (
            <View style={stripStyles.captionDot} />
          ) : null}
        </Pressable>
      ) : null}

      {/* Draggable non-cover strip */}
      {nonCoverCount > 0 ? (
        <GestureDetector gesture={stripGesture}>
          <View style={{ width: nonCoverStripWidth, height: itemSize, position: "relative" }}>
            <View style={[stripStyles.row, { height: itemSize }]}>
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
                      { width: itemSize, height: itemSize },
                      isCurrentPage && stripStyles.itemCurrent,
                      isGap && stripStyles.itemGap,
                    ]}
                  >
                    {!isGap && uri ? (
                      <Image source={{ uri }} style={stripStyles.itemImage} resizeMode="cover" />
                    ) : !isGap ? (
                      <View style={stripStyles.itemPlaceholder} />
                    ) : null}
                    {!isGap && ph?.caption ? (
                      <View style={stripStyles.captionDot} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {/* Floating copy of the dragged thumbnail */}
            {dragging && draggedPhoto ? (
              <Animated.View style={[stripStyles.floatingItem, { width: itemSize, height: itemSize }, floatingStyle]}>
                {draggedPhoto.downloadUrl ? (
                  <Image
                    source={{ uri: draggedPhoto.downloadUrl }}
                    style={stripStyles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={stripStyles.itemPlaceholder} />
                )}
                {draggedPhoto.caption ? (
                  <View style={stripStyles.captionDot} />
                ) : null}
              </Animated.View>
            ) : null}
          </View>
        </GestureDetector>
      ) : null}
    </ScrollView>
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
  onDelete: (photoId: number) => void;
  onReorder: (newPhotoIds: number[]) => void;
  onEditCaption: (photo: BlockPhoto) => void;
  onReload: () => void;
}

function PhotoLightbox({ photos, initialIndex, visible, onClose, onDelete, onReorder, onEditCaption, onReload }: LightboxProps) {
  const insets = useSafeAreaInsets();
  const { user } = useFarm();

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

  // Server-synced UI hint dismissal flags.
  // prefsReady becomes true once the AsyncStorage cache has been read, so we
  // never show a hint based on an empty "not yet loaded" prefs map.
  // Scope prefs by user ID so a logout/account-switch never crosses user data.
  const { prefsReady, isHintDismissed, dismissHint } = useUiPrefs(user?.id);

  // One-time "Hold & drag to reorder" hint
  const [showReorderHint, setShowReorderHint] = useState(false);
  const hintOpacity = useSharedValue(0);
  const hintDismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Image error / retry state for the lightbox
  const [imgError, setImgError] = useState(false);
  const prevUriRef = useRef<string | null>(null);

  const [saving, setSaving] = useState(false);

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
      const tmpUri = `${FileSystem.cacheDirectory}block_photo_${currentPhoto.id}.${ext}`;
      const dl = await FileSystem.downloadAsync(currentPhoto.downloadUrl, tmpUri);
      await MediaLibrary.saveToLibraryAsync(dl.uri);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Save Failed", "Could not save the photo. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [saving]); // eslint-disable-line react-hooks/exhaustive-deps

  const [sharing, setSharing] = useState(false);

  const handleShare = useCallback(async () => {
    const currentPhoto = photosRef.current[indexSv.value];
    if (!currentPhoto?.downloadUrl || sharing) return;
    setSharing(true);
    try {
      const ext = currentPhoto.fileName?.split(".").pop()?.toLowerCase() ?? "jpg";
      const tmpUri = `${FileSystem.cacheDirectory}block_photo_share_${currentPhoto.id}.${ext}`;
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

  const dismissReorderHint = useCallback(() => {
    if (hintDismissTimer.current) {
      clearTimeout(hintDismissTimer.current);
      hintDismissTimer.current = null;
    }
    hintOpacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(setShowReorderHint)(false);
    });
    // Persist dismissal to server (and local cache) via useUiPrefs
    dismissHint(REORDER_HINT_KEY);
  }, [dismissHint]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show / hide the reorder hint reactively.
  //
  // Dependencies: visible, prefsReady, isHintDismissed
  //   • `prefsReady` ensures we never show the hint based on an empty "not yet
  //     loaded" prefs map (critical for a fresh device where the user may have
  //     already dismissed the hint on another device).
  //   • `isHintDismissed` is a callback whose identity changes whenever the
  //     underlying prefs map updates, so the effect re-runs whenever the server
  //     response arrives.  This lets a mid-session server sync hide a currently
  //     visible hint (cross-device dismissal correction).
  //
  // Clearing the auto-dismiss timer in cleanup prevents double-dismiss when the
  // effect re-runs because prefs updated.
  useEffect(() => {
    // If conditions aren't met, hide the hint and clear any running timer.
    if (!visible || photos.length <= 1 || !prefsReady) {
      if (showReorderHint) {
        if (hintDismissTimer.current) {
          clearTimeout(hintDismissTimer.current);
          hintDismissTimer.current = null;
        }
        hintOpacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(setShowReorderHint)(false);
        });
      }
      return;
    }

    if (isHintDismissed(REORDER_HINT_KEY)) {
      // Dismissed (possibly arriving from server sync) — hide it if showing.
      if (showReorderHint) {
        if (hintDismissTimer.current) {
          clearTimeout(hintDismissTimer.current);
          hintDismissTimer.current = null;
        }
        hintOpacity.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(setShowReorderHint)(false);
        });
      }
      return;
    }

    // Not dismissed and lightbox is open with multiple photos — show hint.
    if (!showReorderHint) {
      setShowReorderHint(true);
      hintOpacity.value = withTiming(1, { duration: 300 });
    }
    // (Re-)arm the auto-dismiss timer.  Clear any previous one first so we
    // don't accumulate timers if the effect re-runs while the hint is visible.
    if (hintDismissTimer.current) {
      clearTimeout(hintDismissTimer.current);
      hintDismissTimer.current = null;
    }
    hintDismissTimer.current = setTimeout(() => {
      dismissReorderHint();
    }, 3000);

    return () => {
      if (hintDismissTimer.current) {
        clearTimeout(hintDismissTimer.current);
        hintDismissTimer.current = null;
      }
    };
  }, [visible, prefsReady, isHintDismissed]); // eslint-disable-line react-hooks/exhaustive-deps

  const hintAnimatedStyle = useAnimatedStyle(() => ({
    opacity: hintOpacity.value,
  }));

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

        {/* Save to camera roll button */}
        {photo ? (
          <Pressable
            style={[styles.lbSaveBtn, { top: insets.top + 12 }]}
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
            style={[styles.lbShareBtn, { top: insets.top + 12 }]}
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

        {/* Delete button */}
        {photo ? (
          <Pressable
            style={[styles.lbDeleteBtn, { top: insets.top + 12 }]}
            hitSlop={16}
            onPress={() => {
              const photoId = photo.id;
              const message = buildLightboxDeleteMessage(photos.length, photo.isCover);
              Alert.alert(
                "Delete Photo",
                message,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => onDelete(photoId),
                  },
                ],
              );
            }}
          >
            <Feather name="trash-2" size={22} color="#fff" />
          </Pressable>
        ) : null}

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
              (() => {
                // Reset error flag whenever the URI changes (new photo navigated to,
                // or URLs refreshed after a successful reload).
                if (prevUriRef.current !== uri) {
                  prevUriRef.current = uri;
                  if (imgError) setImgError(false);
                }
                return imgError ? (
                  <Pressable
                    style={styles.lbRetryContainer}
                    onPress={onReload}
                    hitSlop={16}
                  >
                    <Feather name="refresh-cw" size={36} color="rgba(255,255,255,0.85)" />
                    <Text style={styles.lbRetryText}>Tap to reload</Text>
                  </Pressable>
                ) : (
                  <Image
                    source={{ uri }}
                    style={styles.lbImage}
                    resizeMode="contain"
                    onError={() => setImgError(true)}
                  />
                );
              })()
            ) : (
              <ActivityIndicator size="large" color="#fff" />
            )}
          </Animated.View>
        </GestureDetector>

        {/* Caption row — always visible so growers can add/edit from the lightbox */}
        {photo ? (
          <Pressable
            style={[styles.lbCaption, { paddingBottom: insets.bottom + 16 }]}
            onPress={() => onEditCaption(photo)}
            hitSlop={8}
          >
            <View style={styles.lbCaptionRow}>
              {caption ? (
                <Text style={styles.lbCaptionText}>{caption}</Text>
              ) : (
                <Text style={styles.lbCaptionPlaceholder}>Add a caption…</Text>
              )}
              <Feather name="edit-2" size={14} color="rgba(255,255,255,0.7)" style={styles.lbEditIcon} />
            </View>
          </Pressable>
        ) : null}

        {/* Draggable thumbnail strip — always shown so growers confirm the right image */}
        <View style={[styles.lbStripWrapper, { bottom: 72 + insets.bottom }]}>
          {hasMultiple && showReorderHint ? (
            <Pressable onPress={dismissReorderHint} hitSlop={8}>
              <Animated.View style={[styles.lbReorderHint, hintAnimatedStyle]}>
                <Feather name="move" size={13} color="#fff" style={{ marginRight: 5 }} />
                <Text style={styles.lbReorderHintText}>Hold &amp; drag to reorder</Text>
              </Animated.View>
            </Pressable>
          ) : null}
          <DraggablePhotoStrip
            photos={photos}
            currentIndex={currentIndex}
            onSelect={(idx) => goToIndex(idx)}
            onReorder={onReorder}
          />
          <Text style={styles.lbHintText}>
            {hasMultiple
              ? "Hold & drag thumbnails to reorder · Swipe photo to browse"
              : "Pinch to zoom · Double-tap · Swipe down to close"}
          </Text>
        </View>
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
  photosCount,
  onDelete,
  onPress,
  onEditCaption,
  onShowTooltip,
  onHideTooltip,
  onReload,
  reloading,
}: {
  photo: BlockPhoto;
  photosCount: number;
  onDelete: (id: number) => void;
  onPress: (uri: string | null, photo: BlockPhoto) => void;
  onEditCaption: (photo: BlockPhoto) => void;
  onShowTooltip: (caption: string) => void;
  onHideTooltip: () => void;
  onReload: () => void;
  reloading?: boolean;
}) {
  const uri = photo.downloadUrl ?? null;
  const [imgError, setImgError] = useState(false);
  const prevUri = useRef(uri);
  if (prevUri.current !== uri) {
    prevUri.current = uri;
    if (imgError) setImgError(false);
  }

  // Set to true when a long-press fires so onPressOut can show the Alert; cleared
  // there immediately.  RN 0.81 Pressability does NOT emit onPress after a
  // recognised long press, so no suppression of onPress is needed.
  const longPressJustFiredRef = useRef(false);

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    longPressJustFiredRef.current = true;
    // Show caption tooltip while the finger is held (captioned photos only)
    if (photo.caption) {
      onShowTooltip(photo.caption);
    }
  };

  const handlePressOut = () => {
    if (!longPressJustFiredRef.current) return;
    longPressJustFiredRef.current = false; // reset immediately
    onHideTooltip();
    Alert.alert("Photo Options", undefined, [
      { text: "Edit Caption", onPress: () => onEditCaption(photo) },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Delete Photo",
            buildGridDeleteMessage(photosCount),
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
    <Pressable
      style={styles.thumbnail}
      onLongPress={handleLongPress}
      onPressOut={handlePressOut}
      onPress={() => onPress(uri, photo)}
    >
      <View style={styles.thumbImgBox}>
        {uri && !imgError ? (
          <Image
            source={{ uri }}
            style={styles.thumbImage}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : imgError ? (
          <Pressable
            style={styles.thumbPlaceholder}
            onPress={(e) => { e.stopPropagation(); if (!reloading) onReload(); }}
            hitSlop={8}
            disabled={reloading}
          >
            {reloading ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <>
                <Feather name="refresh-cw" size={22} color={colors.textSecondary} />
                <Text style={styles.thumbReloadLabel}>Tap to reload</Text>
              </>
            )}
          </Pressable>
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Feather name="image" size={24} color={colors.textSecondary} />
          </View>
        )}
        {photo.caption ? (
          <View style={stripStyles.captionDot} />
        ) : null}
      </View>
      {photo.caption ? (
        <Text style={styles.captionBelow} numberOfLines={2}>{photo.caption}</Text>
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
  const { address, loading: identifiersLoading } = useFarmIdentifiers(currentFarm?.id);

  const missingAddressFields: string[] = !identifiersLoading
    ? [
        !currentFarm?.name || currentFarm.name.trim() === "" ? "Farm name" : "",
        !address || address.trim() === "" ? "Farm address" : "",
      ].filter(Boolean)
    : [];

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

  // Grid caption tooltip state — shown while a captioned thumbnail is long-pressed
  const [gridTooltipCaption, setGridTooltipCaption] = useState<string | null>(null);

  // Which thumbnail's reload is currently in-flight (null = none)
  const [reloadingPhotoId, setReloadingPhotoId] = useState<number | null>(null);

  // Generation counter — incremented at the start of every loadPhotos call AND
  // synchronously on block selection change and unmount.  applyPhotoUpdateIfCurrent
  // compares the captured gen against the live counter before writing to state,
  // discarding any response whose generation no longer matches the latest.
  const loadGenRef = useRef(0);

  // Advance the generation synchronously when the grower selects a different
  // block.  This closes the window between the selection commit and the next
  // loadPhotos invocation during which a stale previous-block response could
  // otherwise slip past the guard.
  const handleSelectBlock = useCallback((block: VineBlock | null) => {
    loadGenRef.current++;
    setSelectedBlock(block);
  }, []);

  // Unmount cleanup: advance the generation so any in-flight loadPhotos
  // call cannot write to state after the component has been torn down.
  useEffect(() => {
    return () => { loadGenRef.current++; };
  }, []);

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

  const loadPhotos = useCallback(async (options?: { silent?: boolean }) => {
    if (!currentFarm?.id || !selectedBlock) return;
    // Capture and advance the generation token before any async work so that
    // a concurrent or later call gets a higher token and wins.
    const gen = ++loadGenRef.current;
    if (!options?.silent) setPhotosLoading(true);
    try {
      const fetched = await fetchBlockPhotos(currentFarm.id, selectedBlock.id);
      applyPhotoUpdateIfCurrent(
        gen,
        () => loadGenRef.current,
        fetched,
        (photos) => setPhotos(photos as BlockPhoto[]),
      );
    } finally {
      // Clear the spinner whenever this is the current/latest request —
      // regardless of whether it was silent.  A silent refresh that supersedes
      // a non-silent load must still clear the spinner that the non-silent
      // load set; omitting the silent check here prevents a permanently-stuck
      // indicator when the focus-effect refresh races the initial selection load.
      if (gen === loadGenRef.current) setPhotosLoading(false);
    }
  }, [currentFarm?.id, selectedBlock]);

  useEffect(() => {
    setPhotos([]);
    loadPhotos();
  }, [selectedBlock?.id, loadPhotos]);

  // User-initiated reload from a broken thumbnail: shows a spinner on that
  // thumbnail while in-flight and an Alert if the server request fails.
  const handleReload = useCallback(async (photoId: number) => {
    if (!currentFarm?.id || !selectedBlock) return;
    setReloadingPhotoId(photoId);
    const gen = ++loadGenRef.current;
    try {
      const fetched = await fetchBlockPhotos(currentFarm.id, selectedBlock.id);
      if (fetched === null) {
        Alert.alert("Reload Failed", "Could not reload photos. Please check your connection and try again.");
        return;
      }
      applyPhotoUpdateIfCurrent(gen, () => loadGenRef.current, fetched, (p) => setPhotos(p as BlockPhoto[]));
    } catch {
      Alert.alert("Reload Failed", "Could not reload photos. Please check your connection and try again.");
    } finally {
      setReloadingPhotoId(null);
    }
  }, [currentFarm?.id, selectedBlock]);

  // Re-fetch photos whenever the screen comes back into focus so that
  // short-lived presigned URLs are always fresh after the grower returns from
  // another app (matching vine-scouting.tsx pattern).
  useFocusEffect(
    useCallback(() => {
      loadPhotos({ silent: true });
    }, [loadPhotos]),
  );

  // Background interval: silently refresh presigned URLs every 4 minutes so
  // photos stay visible for growers who keep the screen open without navigating
  // away (presigned URLs expire after ~5 min and useFocusEffect only fires on
  // focus changes, not while the screen remains continuously in the foreground).
  useEffect(() => {
    if (!selectedBlock) return;
    const intervalId = setInterval(() => {
      loadPhotos({ silent: true });
    }, 4 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [selectedBlock?.id, loadPhotos]);

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

  const activeBlocks = blocks.filter(b => b.plantingStatus === "active");
  const suspendedBlocks = blocks.filter(b => b.plantingStatus === "suspended");

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

      {/* Block picker — only shown once a block is selected, to allow switching */}
      {selectedBlock && (
        <View style={styles.pickerWrapper}>
          <VineBlockPicker
            blocks={blocks}
            selected={selectedBlock}
            onSelect={handleSelectBlock}
            loading={blocksLoading}
          />
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

      {/* Block list (no block selected) / Gallery (block selected) */}
      {blocksLoading && !selectedBlock ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : !selectedBlock ? (
        <FlatList
          data={[
            ...(activeBlocks.length > 0 ? [{ _type: "header" as const, label: "Active Blocks" }] : []),
            ...activeBlocks.map(b => ({ _type: "block" as const, block: b })),
            ...(suspendedBlocks.length > 0 ? [{ _type: "header" as const, label: "Suspended" }] : []),
            ...suspendedBlocks.map(b => ({ _type: "block" as const, block: b })),
          ]}
          keyExtractor={(item, i) =>
            item._type === "header" ? `header-${i}` : String(item.block.id)
          }
          contentContainerStyle={styles.blockList}
          renderItem={({ item }) => {
            if (item._type === "header") {
              return <Text style={styles.blockListSection}>{item.label}</Text>;
            }
            const b = item.block;
            return (
              <Pressable
                style={[
                  styles.blockListRow,
                  b.plantingStatus === "suspended" && styles.blockListRowSuspended,
                ]}
                onPress={() => handleSelectBlock(b)}
              >
                <BlockThumbnail uri={b.coverPhotoUrl ?? null} />
                <View
                  style={[styles.blockListStatusDot, { backgroundColor: blockStatusColor(b.plantingStatus) }]}
                />
                <View style={styles.blockListInfo}>
                  <Text style={styles.blockListName}>
                    {b.blockName}
                    {b.blockRef ? (
                      <Text style={styles.blockListRef}> · {b.blockRef}</Text>
                    ) : null}
                  </Text>
                  {b.variety ? (
                    <Text style={styles.blockListMeta}>
                      {b.variety}
                      {b.rootstock ? ` / ${b.rootstock}` : ""}
                      {b.areaHa ? ` · ${Number(b.areaHa).toFixed(2)} ha` : ""}
                    </Text>
                  ) : null}
                </View>
                <Feather name="chevron-right" size={16} color={colors.textSecondary} />
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.centred}>
              <EmptyState
                icon="layers"
                title="No blocks yet"
                message="Vineyard blocks added in the dashboard will appear here."
              />
            </View>
          }
        />
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
              photosCount={photos.length}
              onDelete={handleDelete}
              onPress={openLightbox}
              onEditCaption={handleEditCaption}
              onShowTooltip={setGridTooltipCaption}
              onHideTooltip={() => setGridTooltipCaption(null)}
              onReload={() => handleReload(item.id)}
              reloading={reloadingPhotoId === item.id}
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

      {/* Grid caption tooltip — shown while a captioned thumbnail is long-pressed */}
      {gridTooltipCaption != null ? (
        <View style={styles.gridCaptionTooltip} pointerEvents="none">
          <Text style={styles.gridCaptionTooltipText} numberOfLines={4}>
            {gridTooltipCaption}
          </Text>
        </View>
      ) : null}

      {/* Full-screen lightbox */}
      <PhotoLightbox
        photos={photos}
        initialIndex={lightboxIndex}
        visible={lightboxVisible}
        onClose={closeLightbox}
        onDelete={handleDelete}
        onReorder={handleReorder}
        onEditCaption={handleEditCaption}
        onReload={() => loadPhotos({ silent: true })}
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
  addressWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
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
    backgroundColor: colors.surface,
    maxWidth: THUMB_SIZE,
  },
  thumbImgBox: {
    height: THUMB_SIZE,
    backgroundColor: "#f1f5f9",
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    height: THUMB_SIZE,
  },
  thumbReloadLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  captionBelow: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    fontStyle: "italic",
    color: colors.textSecondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    lineHeight: 14,
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
  gridCaptionTooltip: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.88)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 100,
  },
  gridCaptionTooltipText: {
    color: "#fff",
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
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
  lbDeleteBtn: {
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
  lbSaveBtn: {
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
  lbShareBtn: {
    position: "absolute",
    left: 112,
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
  lbRetryContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  lbRetryText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
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
  lbCaptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  lbCaptionText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "#fff",
    textAlign: "center",
    flex: 1,
    flexShrink: 1,
  },
  lbCaptionPlaceholder: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    flex: 1,
    flexShrink: 1,
  },
  lbEditIcon: {
    flexShrink: 0,
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
  lbReorderHint: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.72)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  lbReorderHintText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: "#fff",
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
  // ── Block list (shown when no block is selected) ──────────────────────────
  blockList: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  blockListSection: {
    fontSize: fontSize.xs,
    fontFamily: fonts.bold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
    marginTop: spacing.sm,
  },
  blockListRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  blockListRowSuspended: {
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
  },
  blockListStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  blockListInfo: {
    flex: 1,
  },
  blockListName: {
    fontSize: fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  blockListRef: {
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  blockListMeta: {
    fontSize: fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: 1,
  },
});

// Styles for DraggablePhotoStrip (separate to keep the main StyleSheet tidy).
// Width/height on items is applied inline because it is computed dynamically.
const stripStyles = StyleSheet.create({
  container: {
    // Outer wrapper so the tooltip overlay can be positioned absolutely above the strip
    width: SCREEN.width,
  },
  scrollView: {
    // Fill the full lightbox width so the strip edge-to-edge
    width: SCREEN.width,
  },
  captionTooltip: {
    position: "absolute",
    bottom: STRIP_MAX_ITEM_SIZE + 10,
    left: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.88)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 100,
  },
  captionTooltipText: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 18,
  },
  outerRow: {
    // contentContainerStyle for the horizontal ScrollView
    flexDirection: "row",
    gap: STRIP_ITEM_GAP,
    alignItems: "center",
    flexWrap: "nowrap",
    paddingHorizontal: STRIP_SIDE_PADDING,
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
  captionDot: {
    position: "absolute",
    bottom: 3,
    left: 3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ade80", // green dot — caption present
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.4)",
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
