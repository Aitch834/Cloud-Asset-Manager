/**
 * Shared scouting photo components used by both vine-scouting.tsx (new record)
 * and vine-scouting-history.tsx (edit existing record).
 *
 * Exports: ScoutingPhoto, ScoutingPhotoLightbox, ScoutingPhotoThumbnail, ScoutingPhotoSection
 */

import { Feather } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import { useFocusEffect } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { apiFetch } from "@/lib/apiFetch";
import { uploadPhotoToStorage, getApiBase, pickPhoto } from "@/lib/uploadPhoto";
import { fetchScoutingPhotoUrl } from "@/lib/scoutingPhotosApi";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";

const SCREEN = Dimensions.get("window");
// 4-minute background refresh for presigned URLs
const PHOTO_REFRESH_MS = 4 * 60 * 1000;
const SWIPE_THRESHOLD = 50;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScoutingPhoto {
  id: number;
  scoutingId: number;
  farmId: number;
  objectPath: string;
  fileName: string | null;
  caption: string | null;
  sortOrder: number | null;
  isCover: boolean;
  uploadedAt: string;
  downloadUrl: string | null;
}

// ---------------------------------------------------------------------------
// Caption Edit Modal (internal)
// ---------------------------------------------------------------------------

export function CaptionEditModal({
  visible,
  initialCaption,
  onSave,
  onClose,
  title = "Edit Caption",
  cancelLabel = "Cancel",
}: {
  visible: boolean;
  initialCaption: string;
  onSave: (caption: string) => void;
  onClose: () => void;
  /** Modal heading. Defaults to "Edit Caption". */
  title?: string;
  /** Label for the dismiss button. Defaults to "Cancel". */
  cancelLabel?: string;
}) {
  const [text, setText] = useState(initialCaption);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) setText(initialCaption);
  }, [visible, initialCaption]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={captionStyles.backdrop} onPress={onClose}>
          <Pressable style={[captionStyles.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
            <Text style={captionStyles.title}>{title}</Text>
            <TextInput
              style={captionStyles.input}
              value={text}
              onChangeText={setText}
              placeholder="Describe what this photo shows…"
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={3}
              maxLength={300}
              autoFocus
            />
            <View style={captionStyles.actions}>
              <Pressable style={captionStyles.cancelBtn} onPress={onClose}>
                <Text style={captionStyles.cancelBtnText}>{cancelLabel}</Text>
              </Pressable>
              <Pressable style={captionStyles.saveBtn} onPress={() => { onSave(text); onClose(); }}>
                <Text style={captionStyles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const captionStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 16,
  },
  title: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },
  cancelBtnText: { color: "#fff", fontSize: 15, fontWeight: "500" },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#6d28d9",
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});

// ---------------------------------------------------------------------------
// ScoutingPhotoLightbox
//
// Accepts an array of photos + an initial index so it works for both:
//  - New-record screen (multiple photos, swipe navigation)
//  - History / edit screen (may be single-photo; swipe hidden when only 1)
//
// onDelete is always awaited; the lightbox stays open on failure so the
// grower can retry.  It only closes automatically when the last photo is
// successfully deleted (caller closes it otherwise via onClose).
//
// onEditCaption is optional — when provided a "Caption" action button is shown.
// ---------------------------------------------------------------------------

export function ScoutingPhotoLightbox({
  photos,
  initialIndex,
  visible,
  onClose,
  onDelete,
  onReload,
  onEditCaption,
}: {
  photos: ScoutingPhoto[];
  initialIndex: number;
  visible: boolean;
  onClose: () => void;
  /** Awaited; lightbox stays open on rejection so the grower can retry. */
  onDelete: (id: number) => Promise<void>;
  onReload?: (id: number) => Promise<void>;
  /** When provided a "Caption" button appears in the action bar. */
  onEditCaption?: (photo: ScoutingPhoto) => void;
}) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [reloading, setReloading] = useState(false);
  /** True while the 2 s auto-retry timer is counting down (before the reload fires). */
  const [autoRetryPending, setAutoRetryPending] = useState(false);
  /** Tracks whether we have already fired one automatic retry for the current photo view. */
  const autoRetried = useRef(false);
  const autoRetryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Cancel any scheduled auto-retry and reset related state. */
  const cancelAutoRetry = useCallback(() => {
    if (autoRetryTimer.current !== null) {
      clearTimeout(autoRetryTimer.current);
      autoRetryTimer.current = null;
    }
    setAutoRetryPending(false);
    autoRetried.current = false;
  }, []);

  // Sync index when lightbox opens; reset in-flight flags
  useEffect(() => {
    if (visible) {
      setCurrentIndex(Math.min(initialIndex, Math.max(0, photos.length - 1)));
    }
    setSaving(false);
    setSharing(false);
    setDeleting(false);
    setReloading(false);
    cancelAutoRetry();
  }, [visible, initialIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clamp when photos array shrinks (e.g. a delete from outside)
  useEffect(() => {
    if (photos.length === 0) {
      onClose();
      return;
    }
    setCurrentIndex((prev) => Math.min(prev, photos.length - 1));
  }, [photos.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset in-flight flags and image error when displayed photo changes
  useEffect(() => {
    setSaving(false);
    setSharing(false);
    setDeleting(false);
    setImgError(false);
    setReloading(false);
    cancelAutoRetry();
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const photo = photos[currentIndex] ?? null;

  // Auto-retry: when imgError fires and onReload is available, silently reload
  // after a short delay.  Only one automatic attempt is made per photo view;
  // if it fails the "Tap to reload" UI appears as the manual fallback.
  useEffect(() => {
    if (!imgError || !onReload || !photo || autoRetried.current) return;
    autoRetried.current = true;
    setAutoRetryPending(true);
    autoRetryTimer.current = setTimeout(async () => {
      autoRetryTimer.current = null;
      setAutoRetryPending(false);
      setReloading(true);
      try {
        await onReload(photo.id);
      } finally {
        setReloading(false);
      }
    }, 2000);
    return () => {
      if (autoRetryTimer.current !== null) {
        clearTimeout(autoRetryTimer.current);
        autoRetryTimer.current = null;
      }
    };
  }, [imgError]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear image error (and reloading) when the URL is refreshed (e.g. after onReload)
  const prevDownloadUrl = useRef(photo?.downloadUrl);
  if (prevDownloadUrl.current !== photo?.downloadUrl) {
    prevDownloadUrl.current = photo?.downloadUrl;
    if (imgError) setImgError(false);
    if (reloading) setReloading(false);
  }

  const handleReload = useCallback(async () => {
    if (!onReload || reloading) return;
    setReloading(true);
    try {
      if (photo) await onReload(photo.id);
    } finally {
      setReloading(false);
    }
  }, [onReload, photo, reloading]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, photos.length - 1));
  }, [photos.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Keep a ref to photos.length so the PanResponder closure stays current
  const photosLenRef = useRef(photos.length);
  photosLenRef.current = photos.length;

  // Keep a ref to deleting so the PanResponder closure can block swipes
  // while a delete is in flight, preventing a race where a fast swipe
  // advances to a photo that is about to be removed.
  const deletingRef = useRef(deleting);
  deletingRef.current = deleting;

  // Horizontal swipe navigation
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_evt, gs) =>
        !deletingRef.current &&
        Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderRelease: (_evt, gs) => {
        // Guard here too: a gesture that began before deletion started
        // must not advance the index after the delete is confirmed.
        if (deletingRef.current) return;
        if (gs.dx < -SWIPE_THRESHOLD) {
          setCurrentIndex((i) => Math.min(i + 1, photosLenRef.current - 1));
        } else if (gs.dx > SWIPE_THRESHOLD) {
          setCurrentIndex((i) => Math.max(i - 1, 0));
        }
      },
    }),
  ).current;

  const handleSaveToRoll = useCallback(async () => {
    if (!photo?.downloadUrl || saving) return;
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
      const ext = photo.fileName?.split(".").pop()?.toLowerCase() ?? "jpg";
      const tmpUri = `${FileSystem.cacheDirectory}scouting_save_${photo.id}.${ext}`;
      const dl = await FileSystem.downloadAsync(photo.downloadUrl, tmpUri);
      await MediaLibrary.saveToLibraryAsync(dl.uri);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Save Failed", "Could not save the photo. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [photo, saving]);

  const handleShare = useCallback(async () => {
    if (!photo?.downloadUrl || sharing) return;
    setSharing(true);
    try {
      const ext = photo.fileName?.split(".").pop()?.toLowerCase() ?? "jpg";
      const tmpUri = `${FileSystem.cacheDirectory}scouting_share_${photo.id}.${ext}`;
      const dl = await FileSystem.downloadAsync(photo.downloadUrl, tmpUri);
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
  }, [photo, sharing]);

  const handleDelete = useCallback(() => {
    if (!photo || deleting) return;
    Alert.alert(
      "Delete Photo",
      "Are you sure you want to delete this photo? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Set the ref synchronously so PanResponder closures see it
            // immediately — before the next React render propagates the
            // setDeleting(true) state change.
            deletingRef.current = true;
            setDeleting(true);
            try {
              await onDelete(photo.id);
              // onDelete resolving means success — the caller's handleDeletePhoto
              // already removed the photo from state, so photos.length will drop.
              // Close only if this was the last photo; otherwise stay open on the
              // next photo (the useEffect above already clamped the index).
              if (photosLenRef.current <= 1) onClose();
            } catch {
              // Delete failed — keep lightbox open so the grower can retry.
              Alert.alert("Delete Failed", "Could not delete the photo. Please try again.");
            } finally {
              deletingRef.current = false;
              setDeleting(false);
            }
          },
        },
      ],
    );
  }, [photo, deleting, onDelete, onClose]);

  if (!visible) return null;

  const uri = photo?.downloadUrl ?? null;
  const hasMultiple = photos.length > 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.95)" />
      <View style={lbStyles.backdrop}>
        {/* Close button */}
        <Pressable
          style={[lbStyles.closeBtn, { top: insets.top + 12 }]}
          onPress={onClose}
          hitSlop={12}
        >
          <Feather name="x" size={24} color="#fff" />
        </Pressable>

        {/* Photo count indicator */}
        {hasMultiple ? (
          <View style={[lbStyles.counter, { top: insets.top + 18 }]}>
            <Text style={lbStyles.counterText}>
              {currentIndex + 1} / {photos.length}
            </Text>
          </View>
        ) : null}

        {/* Swipeable photo area */}
        <View style={lbStyles.imageWrapper} {...panResponder.panHandlers}>
          {uri && !imgError ? (
            <Image
              source={{ uri }}
              style={lbStyles.image}
              resizeMode="contain"
              onError={() => setImgError(true)}
            />
          ) : reloading || autoRetryPending ? (
            <View style={lbStyles.imagePlaceholder}>
              <ActivityIndicator size="large" color="rgba(255,255,255,0.75)" />
            </View>
          ) : (
            <Pressable
              style={lbStyles.imagePlaceholder}
              onPress={handleReload}
              hitSlop={12}
              disabled={!onReload}
            >
              <Feather name="refresh-cw" size={40} color="rgba(255,255,255,0.55)" />
              <Text style={lbStyles.reloadLabel}>Tap to reload</Text>
            </Pressable>
          )}

          {/* Left chevron */}
          {hasMultiple && currentIndex > 0 ? (
            <Pressable style={[lbStyles.chevron, lbStyles.chevronLeft]} onPress={goPrev} hitSlop={12}>
              <Feather name="chevron-left" size={32} color="#fff" />
            </Pressable>
          ) : null}

          {/* Right chevron */}
          {hasMultiple && currentIndex < photos.length - 1 ? (
            <Pressable style={[lbStyles.chevron, lbStyles.chevronRight]} onPress={goNext} hitSlop={12}>
              <Feather name="chevron-right" size={32} color="#fff" />
            </Pressable>
          ) : null}
        </View>

        {/* Caption */}
        {photo?.caption ? (
          <View style={lbStyles.captionBar}>
            <Text style={lbStyles.captionText} numberOfLines={3}>
              {photo.caption}
            </Text>
          </View>
        ) : null}

        {/* Action bar */}
        <View style={[lbStyles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
          {/* Save to camera roll */}
          <Pressable
            style={[lbStyles.actionBtn, saving && lbStyles.actionBtnDisabled]}
            onPress={handleSaveToRoll}
            disabled={saving || !uri}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="download" size={22} color="#fff" />
            )}
            <Text style={lbStyles.actionBtnText}>{saving ? "Saving…" : "Save"}</Text>
          </Pressable>

          {/* Share */}
          <Pressable
            style={[lbStyles.actionBtn, sharing && lbStyles.actionBtnDisabled]}
            onPress={handleShare}
            disabled={sharing || !uri}
          >
            {sharing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="share-2" size={22} color="#fff" />
            )}
            <Text style={lbStyles.actionBtnText}>{sharing ? "Sharing…" : "Share"}</Text>
          </Pressable>

          {/* Caption (optional) */}
          {onEditCaption && photo ? (
            <Pressable style={lbStyles.actionBtn} onPress={() => onEditCaption(photo)}>
              <Feather name="edit-2" size={22} color="#fff" />
              <Text style={lbStyles.actionBtnText}>Caption</Text>
            </Pressable>
          ) : null}

          {/* Delete */}
          <Pressable
            style={[lbStyles.actionBtn, lbStyles.actionBtnDanger]}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#fca5a5" />
            ) : (
              <Feather name="trash-2" size={22} color="#fca5a5" />
            )}
            <Text style={[lbStyles.actionBtnText, { color: "#fca5a5" }]}>
              {deleting ? "Deleting…" : "Delete"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const lbStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtn: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
  },
  counter: {
    position: "absolute",
    alignSelf: "center",
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  counterText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  imageWrapper: {
    width: SCREEN.width,
    height: SCREEN.height * 0.62,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN.width,
    height: SCREEN.height * 0.62,
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  reloadLabel: {
    marginTop: 10,
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "600",
  },
  chevron: {
    position: "absolute",
    top: "50%",
    marginTop: -24,
    zIndex: 5,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 24,
  },
  chevronLeft: { left: 8 },
  chevronRight: { right: 8 },
  captionBar: {
    marginTop: 12,
    marginHorizontal: 24,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: 12,
    alignSelf: "stretch",
  },
  captionText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    paddingTop: 16,
    paddingHorizontal: 32,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  actionBtn: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.12)",
    flex: 1,
  },
  actionBtnDisabled: { opacity: 0.5 },
  actionBtnDanger: { backgroundColor: "rgba(220,38,38,0.15)" },
  actionBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});

// ---------------------------------------------------------------------------
// ScoutingPhotoThumbnail
// ---------------------------------------------------------------------------

export function ScoutingPhotoThumbnail({
  photo,
  onDelete,
  onPress,
  onReload,
  onEditCaption,
  onShowTooltip,
  onHideTooltip,
  reloading,
  anyReloading,
}: {
  photo: ScoutingPhoto;
  onDelete: (id: number) => void;
  onPress: (photo: ScoutingPhoto) => void;
  onReload?: () => void;
  /** When provided, long-press menu includes "Edit Caption". */
  onEditCaption?: (photo: ScoutingPhoto) => void;
  onShowTooltip?: (caption: string) => void;
  onHideTooltip?: () => void;
  /** True when this specific thumbnail's reload is in flight (shows spinner). */
  reloading?: boolean;
  /** True when any thumbnail's reload is in flight — disables other broken thumbnails. */
  anyReloading?: boolean;
}) {
  const uri = photo.downloadUrl ?? null;
  const [imgError, setImgError] = useState(false);
  // Set to true when a long-press fires so onPressOut can show the Alert; cleared
  // there immediately. RN does NOT emit onPress after a recognised long press.
  const longPressJustFiredRef = useRef(false);

  const prevUri = useRef(uri);
  if (prevUri.current !== uri) {
    prevUri.current = uri;
    if (imgError) setImgError(false);
  }

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    longPressJustFiredRef.current = true;
    // Show caption tooltip while the finger is held (captioned photos only)
    if (photo.caption && onShowTooltip) {
      onShowTooltip(photo.caption);
    }
  };

  const handlePressOut = () => {
    if (!longPressJustFiredRef.current) return;
    longPressJustFiredRef.current = false;
    onHideTooltip?.();
    const options: Parameters<typeof Alert.alert>[2] = [];
    if (onEditCaption) {
      options.push({ text: "Edit Caption", onPress: () => onEditCaption(photo) });
    }
    options.push({
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
    });
    options.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Photo Options", undefined, options);
  };

  return (
    <Pressable style={photoStyles.thumbnail} onLongPress={handleLongPress} onPressOut={handlePressOut} onPress={() => onPress(photo)}>
      <View style={photoStyles.thumbImgBox}>
        {uri && !imgError ? (
          <Image
            source={{ uri }}
            style={photoStyles.thumbImage}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : imgError ? (
          <Pressable
            style={[photoStyles.thumbPlaceholder, anyReloading && !reloading && photoStyles.thumbPlaceholderDisabled]}
            onPress={() => { if (!reloading && !anyReloading) onReload?.(); }}
            hitSlop={8}
            disabled={reloading || anyReloading}
          >
            {reloading ? (
              <ActivityIndicator size="small" color={colors.textSecondary} />
            ) : (
              <>
                <Feather name="refresh-cw" size={22} color={anyReloading ? colors.border : colors.textSecondary} />
                {!anyReloading && <Text style={photoStyles.thumbReloadLabel}>Tap to reload</Text>}
              </>
            )}
          </Pressable>
        ) : (
          <View style={photoStyles.thumbPlaceholder}>
            <Feather name="image" size={24} color={colors.textSecondary} />
          </View>
        )}
        {photo.isCover ? (
          <View style={photoStyles.coverBadge}>
            <Text style={photoStyles.coverBadgeText}>★</Text>
          </View>
        ) : null}
      </View>
      {photo.caption ? (
        <Text style={photoStyles.captionBelow} numberOfLines={2}>{photo.caption}</Text>
      ) : null}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// ScoutingPhotoSection
// ---------------------------------------------------------------------------

export function ScoutingPhotoSection({
  farmId,
  scoutingId,
  onPhotoCountChange,
}: {
  farmId: string | number;
  scoutingId: number;
  /** Called whenever the local photo list grows or shrinks. */
  onPhotoCountChange?: (count: number) => void;
}) {
  const [photos, setPhotos] = useState<ScoutingPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [captionEditPhoto, setCaptionEditPhoto] = useState<ScoutingPhoto | null>(null);
  // ID of a freshly-uploaded photo awaiting an optional caption before the list reloads
  const [pendingCaptionPhotoId, setPendingCaptionPhotoId] = useState<number | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Grid caption tooltip state — shown while a captioned thumbnail is long-pressed
  const [gridTooltipCaption, setGridTooltipCaption] = useState<string | null>(null);
  // Which thumbnail's reload is currently in-flight (null = none).
  // While non-null, all other broken thumbnails are disabled so only one reload runs at a time.
  const [reloadingPhotoId, setReloadingPhotoId] = useState<number | null>(null);
  // Synchronous guard so rapid / multi-touch presses on different broken thumbnails
  // cannot start two concurrent reloads before React commits the first state update.
  const reloadInFlightRef = useRef(false);

  // Notify parent whenever the local photo count changes (add or delete).
  // We skip the very first render (when photos is still the initial []) so we
  // don't override a badge that was already correct from the server-fetched list.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onPhotoCountChange?.(photos.length);
  }, [photos.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPhotos = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    try {
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-scouting/${scoutingId}/photos`);
      if (res.ok) {
        const data: { photos: ScoutingPhoto[] } = await res.json();
        setPhotos(data.photos ?? []);
      }
    } catch {
      // no-op on silent refresh
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [farmId, scoutingId]);

  useEffect(() => {
    loadPhotos();
    refreshTimer.current = setInterval(() => loadPhotos({ silent: true }), PHOTO_REFRESH_MS);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [loadPhotos]);

  useFocusEffect(
    useCallback(() => {
      loadPhotos({ silent: true });
    }, [loadPhotos]),
  );

  const handleAddPhoto = async () => {
    const uri = await pickPhoto("Attach Scouting Photo");
    if (!uri) return;
    setUploading(true);
    try {
      const apiBase = getApiBase();
      const fileName = `scouting-${scoutingId}-${Date.now()}.jpg`;
      const objectPath = await uploadPhotoToStorage(uri, apiBase, fileName);
      if (!objectPath) {
        Alert.alert("Upload Failed", "Could not upload the photo. Please try again.");
        return;
      }
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-scouting/${scoutingId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath, fileName }),
      });
      if (!res.ok) {
        Alert.alert("Upload Failed", "Photo was uploaded but could not be saved. Please try again.");
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Show the caption prompt before reloading; loadPhotos() is called after
      // the grower saves or skips (handlePendingCaptionSave / handlePendingCaptionSkip).
      const data: { photo?: { id?: number } } = await res.json().catch(() => ({}));
      const newId = data?.photo?.id;
      if (newId) {
        setPendingCaptionPhotoId(newId);
      } else {
        // Fallback: no ID returned — just reload immediately
        await loadPhotos();
      }
    } catch {
      Alert.alert("Upload Failed", "An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handlePendingCaptionSave = async (caption: string) => {
    const photoId = pendingCaptionPhotoId;
    setPendingCaptionPhotoId(null);
    if (photoId && caption.trim()) {
      // Best-effort PATCH — don't block the list reload if it fails
      await apiFetch(`/api/farms/${farmId}/vineyard-scouting/${scoutingId}/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: caption.trim() }),
      }).catch(() => null);
    }
    await loadPhotos();
  };

  const handlePendingCaptionSkip = async () => {
    setPendingCaptionPhotoId(null);
    await loadPhotos();
  };

  /**
   * Deletes a photo and removes it from local state.
   * Throws on failure so the lightbox can keep itself open for retry.
   */
  const handleDeletePhoto = async (photoId: number): Promise<void> => {
    const res = await apiFetch(`/api/farms/${farmId}/vineyard-scouting/${scoutingId}/photos/${photoId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } else {
      throw new Error("delete_failed");
    }
  };

  // Refresh only the affected photo's presigned URL instead of replacing the
  // full scouting photo list.
  const handleReload = useCallback(async (photoId: number): Promise<void> => {
    if (reloadInFlightRef.current) return;
    reloadInFlightRef.current = true;
    setReloadingPhotoId(photoId);
    try {
      const freshUrl = await fetchScoutingPhotoUrl(farmId, scoutingId, photoId);
      if (freshUrl === null) {
        Alert.alert("Reload Failed", "Could not reload photo. Please check your connection and try again.");
        return;
      }
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, downloadUrl: freshUrl } : p)),
      );
    } finally {
      reloadInFlightRef.current = false;
      setReloadingPhotoId(null);
    }
  }, [farmId, scoutingId]);

  const handleSaveCaption = async (photoId: number, caption: string) => {
    const trimmed = caption.trim();
    try {
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-scouting/${scoutingId}/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: trimmed || null }),
      });
      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setPhotos((prev) => prev.map((p) => p.id === photoId ? { ...p, caption: trimmed || null } : p));
      } else {
        Alert.alert("Save Failed", "Could not save the caption. Please try again.");
      }
    } catch {
      Alert.alert("Save Failed", "An error occurred. Please try again.");
    }
  };

  const handleOpenCaptionEdit = (photo: ScoutingPhoto) => {
    setLightboxIndex(null);
    // small delay so lightbox closes before caption modal opens
    setTimeout(() => setCaptionEditPhoto(photo), 150);
  };

  const handlePressPhoto = (photo: ScoutingPhoto) => {
    const idx = photos.findIndex((p) => p.id === photo.id);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  return (
    <View style={sectionStyles.card}>
      <View style={photoStyles.photoHeader}>
        <Text style={sectionStyles.sectionTitle}>Photos</Text>
        <Text style={photoStyles.photoHint}>{photos.length} attached</Text>
      </View>
      <Text style={sectionStyles.helperText}>
        Tap a photo to view or edit its caption. Long-press a thumbnail for quick options.
      </Text>
      {loading ? (
        <ActivityIndicator size="small" color={colors.textSecondary} style={{ marginTop: spacing.sm }} />
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled
          style={{ marginTop: spacing.sm }}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <ScoutingPhotoThumbnail
              photo={item}
              onDelete={(id) => {
                handleDeletePhoto(id).catch(() => {
                  Alert.alert("Delete Failed", "Could not delete the photo. Please try again.");
                });
              }}
              onPress={handlePressPhoto}
              onReload={() => handleReload(item.id)}
              onEditCaption={handleOpenCaptionEdit}
              onShowTooltip={setGridTooltipCaption}
              onHideTooltip={() => setGridTooltipCaption(null)}
              reloading={reloadingPhotoId === item.id}
              anyReloading={reloadingPhotoId !== null}
            />
          )}
          ListEmptyComponent={
            <View style={photoStyles.emptyPhotos}>
              <Feather name="image" size={20} color={colors.textSecondary} />
              <Text style={photoStyles.emptyPhotosText}>No photos yet</Text>
            </View>
          }
        />
      )}
      <Pressable
        style={[photoStyles.addPhotoBtn, uploading && photoStyles.addPhotoBtnDisabled]}
        onPress={handleAddPhoto}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={colors.primary ?? colors.success} />
        ) : (
          <Feather name="camera" size={16} color={colors.primary ?? colors.success} />
        )}
        <Text style={photoStyles.addPhotoBtnText}>{uploading ? "Uploading…" : "Add Photo"}</Text>
      </Pressable>

      {/* Grid caption tooltip — shown while a captioned thumbnail is long-pressed */}
      {gridTooltipCaption != null ? (
        <View style={photoStyles.gridCaptionTooltip} pointerEvents="none">
          <Text style={photoStyles.gridCaptionTooltipText} numberOfLines={4}>
            {gridTooltipCaption}
          </Text>
        </View>
      ) : null}

      <ScoutingPhotoLightbox
        photos={photos}
        initialIndex={lightboxIndex ?? 0}
        visible={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        onReload={handleReload}
        onDelete={handleDeletePhoto}
        onEditCaption={handleOpenCaptionEdit}
      />

      <CaptionEditModal
        visible={captionEditPhoto !== null}
        initialCaption={captionEditPhoto?.caption ?? ""}
        onSave={(caption) => {
          if (captionEditPhoto) handleSaveCaption(captionEditPhoto.id, caption);
        }}
        onClose={() => setCaptionEditPhoto(null)}
      />

      {/* Post-upload caption prompt — shown immediately after a successful upload */}
      <CaptionEditModal
        visible={pendingCaptionPhotoId !== null}
        initialCaption=""
        title="Add a Caption?"
        cancelLabel="Skip"
        onSave={handlePendingCaptionSave}
        onClose={handlePendingCaptionSkip}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const sectionStyles = StyleSheet.create({
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
  helperText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

const photoStyles = StyleSheet.create({
  photoHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xs },
  photoHint: { fontSize: fontSize.xs, color: colors.textSecondary },
  thumbnail: { width: 88, gap: spacing.xs },
  thumbImgBox: { width: 88, height: 88, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.border },
  thumbImage: { width: 88, height: 88 },
  thumbPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  thumbPlaceholderDisabled: { opacity: 0.45 },
  thumbReloadLabel: { fontSize: fontSize.xs, color: colors.textSecondary, textAlign: "center" },
  captionBelow: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 14 },
  gridCaptionTooltip: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
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
  emptyPhotos: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: spacing.sm },
  emptyPhotosText: { fontSize: fontSize.sm, color: colors.textSecondary },
  addPhotoBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary ?? colors.success, alignSelf: "flex-start", marginTop: spacing.sm },
  addPhotoBtnDisabled: { opacity: 0.5 },
  addPhotoBtnText: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.primary ?? colors.success },
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
});
