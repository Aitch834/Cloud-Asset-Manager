import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
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
import { ScoutingPhotoSection } from "@/components/ScoutingPhotoSection";
import { vineyardCountEvents } from "@/lib/vineyardCountEvents";

const PRESSURE_LABELS = ["None", "Low", "Medium", "High"];
const PRESSURE_COLORS = [colors.textSecondary, colors.success, colors.warning ?? "#f59e0b", colors.error];

interface ScoutingRecord {
  id: number;
  scoutDate: string | null;
  blockId: number | null;
  blockName: string | null;
  scoutedBy: string | null;
  downyMildewPressure: number | null;
  powderyMildewPressure: number | null;
  botrytisPressure: number | null;
  phomopsisPressure: number | null;
  leafhopperPressure: number | null;
  spiderMitePressure: number | null;
  vineWeevilSighted: boolean | null;
  eutypaDiebackSighted: boolean | null;
  xylellaFastidiosa: boolean | null;
  phytophthoraViticola: boolean | null;
  actionTaken: string | null;
  notes: string | null;
  photoCount: number | null;
}
function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function pressureBadge(value: number | null): { label: string; color: string } | null {
  if (!value || value === 0) return null;
  const idx = Math.min(Math.max(Number(value), 0), 3);
  return { label: PRESSURE_LABELS[idx], color: PRESSURE_COLORS[idx] };
}

function highestPressure(r: ScoutingRecord): { label: string; color: string } | null {
  const vals = [
    r.downyMildewPressure,
    r.powderyMildewPressure,
    r.botrytisPressure,
    r.phomopsisPressure,
    r.leafhopperPressure,
    r.spiderMitePressure,
  ].map(v => (v == null ? 0 : Number(v)));
  const max = Math.max(...vals);
  return pressureBadge(max);
}

// ─── Pressure Picker ──────────────────────────────────────────────────────────

function PressurePicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={editStyles.pressureRow}>
      <Text style={editStyles.pressureLabel}>{label}</Text>
      <View style={editStyles.pressureButtons}>
        {PRESSURE_LABELS.map((l, i) => (
          <Pressable
            key={i}
            style={[editStyles.pressureBtn, value === i && { backgroundColor: PRESSURE_COLORS[i], borderColor: PRESSURE_COLORS[i] }]}
            onPress={() => { Haptics.selectionAsync(); onChange(i); }}
          >
            <Text style={[editStyles.pressureBtnText, value === i && { color: "#fff" }]}>{l}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Boolean Toggle ───────────────────────────────────────────────────────────

function BooleanToggle({ label, value, onChange, urgent }: { label: string; value: boolean; onChange: (v: boolean) => void; urgent?: boolean }) {
  return (
    <Pressable
      style={[editStyles.toggleRow, value && urgent && editStyles.toggleRowUrgent, value && !urgent && editStyles.toggleRowActive]}
      onPress={() => { Haptics.selectionAsync(); onChange(!value); }}
    >
      <Feather name={value ? "check-square" : "square"} size={18} color={value ? (urgent ? colors.error : colors.success) : colors.textSecondary} />
      <Text style={[editStyles.toggleLabel, value && urgent && { color: colors.error }]}>{label}</Text>
    </Pressable>
  );
}


// ─── Scouting Photo Lightbox ──────────────────────────────────────────────────

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

// ─── Caption Edit Modal ───────────────────────────────────────────────────────

function CaptionEditModal({
  visible,
  initialCaption,
  onSave,
  onClose,
}: {
  visible: boolean;
  initialCaption: string;
  onSave: (caption: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState(initialCaption);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) setText(initialCaption);
  }, [visible, initialCaption]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={captionModalStyles.backdrop} onPress={onClose}>
          <Pressable style={[captionModalStyles.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={() => {}}>
            <Text style={captionModalStyles.title}>Edit Caption</Text>
            <TextInput
              style={captionModalStyles.input}
              value={text}
              onChangeText={setText}
              placeholder="Describe what this photo shows…"
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={3}
              maxLength={300}
              autoFocus
            />
            <View style={captionModalStyles.actions}>
              <Pressable style={captionModalStyles.cancelBtn} onPress={onClose}>
                <Text style={captionModalStyles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable style={captionModalStyles.saveBtn} onPress={() => { onSave(text); onClose(); }}>
                <Text style={captionModalStyles.saveBtnText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const captionModalStyles = StyleSheet.create({
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

// ─── Scouting Photo Lightbox ──────────────────────────────────────────────────

function ScoutingPhotoLightbox({
  photo,
  visible,
  onClose,
  onDelete,
  onEditCaption,
}: {
  photo: ScoutingPhoto | null;
  visible: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
  onEditCaption: (photo: ScoutingPhoto) => void;
}) {
  const insets = useSafeAreaInsets();
  const [sharing, setSharing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setSharing(false);
    setDeleting(false);
  }, [photo?.id]);

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
          onPress: () => {
            setDeleting(true);
            onDelete(photo.id);
            onClose();
          },
        },
      ],
    );
  }, [photo, deleting, onDelete, onClose]);

  if (!photo) return null;
  const uri = photo.downloadUrl;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.95)" />
      <View style={lbStyles.backdrop}>
        <Pressable style={[lbStyles.closeBtn, { top: insets.top + 12 }]} onPress={onClose} hitSlop={12}>
          <Feather name="x" size={24} color="#fff" />
        </Pressable>
        <View style={lbStyles.imageWrapper}>
          {uri ? (
            <Image source={{ uri }} style={lbStyles.image} resizeMode="contain" />
          ) : (
            <View style={lbStyles.imagePlaceholder}>
              <Feather name="image" size={48} color="rgba(255,255,255,0.3)" />
            </View>
          )}
        </View>
        {photo.caption ? (
          <View style={lbStyles.captionBar}>
            <Text style={lbStyles.captionText} numberOfLines={3}>{photo.caption}</Text>
          </View>
        ) : null}
        <View style={[lbStyles.actionBar, { paddingBottom: insets.bottom + 12 }]}>
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
          <Pressable
            style={lbStyles.actionBtn}
            onPress={() => onEditCaption(photo)}
          >
            <Feather name="edit-2" size={22} color="#fff" />
            <Text style={lbStyles.actionBtnText}>Caption</Text>
          </Pressable>
          <Pressable style={[lbStyles.actionBtn, lbStyles.actionBtnDanger]} onPress={handleDelete} disabled={deleting}>
            <Feather name="trash-2" size={22} color="#fca5a5" />
            <Text style={[lbStyles.actionBtnText, { color: "#fca5a5" }]}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Scouting Photo Thumbnail ─────────────────────────────────────────────────

function ScoutingPhotoThumbnail({
  photo,
  onDelete,
  onPress,
  onReload,
  onEditCaption,
}: {
  photo: ScoutingPhoto;
  onDelete: (id: number) => void;
  onPress: (photo: ScoutingPhoto) => void;
  onReload?: () => void;
  onEditCaption: (photo: ScoutingPhoto) => void;
}) {
  const uri = photo.downloadUrl ?? null;
  const [imgError, setImgError] = useState(false);

  const prevUri = useRef(uri);
  if (prevUri.current !== uri) {
    prevUri.current = uri;
    if (imgError) setImgError(false);
  }

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Photo Options", undefined, [
      {
        text: "Edit Caption",
        onPress: () => onEditCaption(photo),
      },
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
    <Pressable style={photoStyles.thumbnail} onLongPress={handleLongPress} onPress={() => onPress(photo)}>
      <View style={photoStyles.thumbImgBox}>
        {uri && !imgError ? (
          <Image
            source={{ uri }}
            style={photoStyles.thumbImage}
            resizeMode="cover"
            onError={() => setImgError(true)}
          />
        ) : imgError ? (
          <Pressable style={photoStyles.thumbPlaceholder} onPress={() => onReload?.()} hitSlop={8}>
            <Feather name="refresh-cw" size={22} color={colors.textSecondary} />
            <Text style={photoStyles.thumbReloadLabel}>Tap to reload</Text>
          </Pressable>
        ) : (
          <View style={photoStyles.thumbPlaceholder}>
            <Feather name="image" size={24} color={colors.textSecondary} />
          </View>
        )}
        {photo.caption ? (
          <View style={photoStyles.captionDot} />
        ) : null}
      </View>
      {photo.caption ? (
        <Text style={photoStyles.captionBelow} numberOfLines={2}>{photo.caption}</Text>
      ) : null}
    </Pressable>
  );
}

// ─── Scouting Photo Section ───────────────────────────────────────────────────

function ScoutingPhotoSection({ farmId, scoutingId }: { farmId: string; scoutingId: number }) {
  const [photos, setPhotos] = useState<ScoutingPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<ScoutingPhoto | null>(null);
  const [captionEditPhoto, setCaptionEditPhoto] = useState<ScoutingPhoto | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

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
      await loadPhotos();
    } catch {
      Alert.alert("Upload Failed", "An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-scouting/${scoutingId}/photos/${photoId}`, {
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
        // Keep lightbox in sync if it's open
        setLightboxPhoto((prev) => prev?.id === photoId ? { ...prev, caption: trimmed || null } : prev);
      } else {
        Alert.alert("Save Failed", "Could not save the caption. Please try again.");
      }
    } catch {
      Alert.alert("Save Failed", "An error occurred. Please try again.");
    }
  };

  const handleOpenCaptionEdit = (photo: ScoutingPhoto) => {
    setLightboxPhoto(null);
    // small delay so lightbox closes before caption modal opens
    setTimeout(() => setCaptionEditPhoto(photo), 150);
  };

  return (
    <View style={editStyles.card}>
      <View style={photoStyles.photoHeader}>
        <Text style={editStyles.sectionTitle}>Photos</Text>
        <Text style={photoStyles.photoHint}>{photos.length} attached</Text>
      </View>
      <Text style={editStyles.helperText}>
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
              onDelete={handleDeletePhoto}
              onPress={setLightboxPhoto}
              onReload={() => loadPhotos({ silent: true })}
              onEditCaption={handleOpenCaptionEdit}
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
      <ScoutingPhotoLightbox
        photo={lightboxPhoto}
        visible={lightboxPhoto !== null}
        onClose={() => setLightboxPhoto(null)}
        onDelete={(id) => {
          handleDeletePhoto(id);
          setLightboxPhoto(null);
        }}
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
    </View>
  );
}

const photoStyles = StyleSheet.create({
  photoHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.xs },
  photoHint: { fontSize: fontSize.xs, color: colors.textSecondary },
  thumbnail: { width: 88, gap: spacing.xs },
  thumbImgBox: { width: 88, height: 88, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.border },
  thumbImage: { width: 88, height: 88 },
  captionDot: {
    position: "absolute",
    bottom: 3,
    left: 3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#4ade80",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.4)",
  },
  thumbPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4 },
  thumbReloadLabel: { fontSize: fontSize.xs, color: colors.textSecondary, textAlign: "center" },
  captionBelow: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 14 },
  emptyPhotos: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: spacing.sm },
  emptyPhotosText: { fontSize: fontSize.sm, color: colors.textSecondary },
  addPhotoBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary ?? colors.success, alignSelf: "flex-start", marginTop: spacing.sm },
  addPhotoBtnDisabled: { opacity: 0.5 },
  addPhotoBtnText: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.primary ?? colors.success },
});

// ─── Edit Scouting Modal ──────────────────────────────────────────────────────

interface EditScoutingModalProps {
  visible: boolean;
  record: ScoutingRecord | null;
  farmId: string;
  blocks: VineBlock[];
  blocksLoading: boolean;
  onClose: () => void;
  onSaved: (recordId: number, updated: Partial<ScoutingRecord>) => void;
}

function EditScoutingModal({ visible, record, farmId, blocks, blocksLoading, onClose, onSaved }: EditScoutingModalProps) {
  const [saving, setSaving] = useState(false);

  // Form state
  const [scoutDate, setScoutDate] = useState("");
  const [scoutedBy, setScoutedBy] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [downyMildew, setDownyMildew] = useState(0);
  const [powderyMildew, setPowderyMildew] = useState(0);
  const [botrytis, setBotrytis] = useState(0);
  const [phomopsis, setPhomopsis] = useState(0);
  const [leafhopper, setLeafhopper] = useState(0);
  const [spiderMite, setSpiderMite] = useState(0);
  const [vineWeevil, setVineWeevil] = useState(false);
  const [eutypaDieback, setEutypaDieback] = useState(false);
  const [xylella, setXylella] = useState(false);
  const [phytophthora, setPhytophthora] = useState(false);
  const [actionTaken, setActionTaken] = useState("");
  const [notes, setNotes] = useState("");

  // Pre-fill from record when modal opens
  React.useEffect(() => {
    if (visible && record) {
      setScoutDate(record.scoutDate ?? "");
      setScoutedBy(record.scoutedBy ?? "");
      const current = record.blockId ? blocks.find(b => b.id === record.blockId) ?? null : null;
      setSelectedBlock(current);
      setDownyMildew(Number(record.downyMildewPressure ?? 0));
      setPowderyMildew(Number(record.powderyMildewPressure ?? 0));
      setBotrytis(Number(record.botrytisPressure ?? 0));
      setPhomopsis(Number(record.phomopsisPressure ?? 0));
      setLeafhopper(Number(record.leafhopperPressure ?? 0));
      setSpiderMite(Number(record.spiderMitePressure ?? 0));
      setVineWeevil(Boolean(record.vineWeevilSighted));
      setEutypaDieback(Boolean(record.eutypaDiebackSighted));
      setXylella(Boolean(record.xylellaFastidiosa));
      setPhytophthora(Boolean(record.phytophthoraViticola));
      setActionTaken(record.actionTaken ?? "");
      setNotes(record.notes ?? "");
    }
  }, [visible, record, blocks]);

  const doSave = async () => {
    if (!record) return;
    setSaving(true);
    try {
      const body = {
        scoutDate: scoutDate || null,
        scoutedBy: scoutedBy.trim() || null,
        blockId: selectedBlock?.id ?? null,
        blockName: selectedBlock?.blockName ?? null,
        downyMildewPressure: downyMildew,
        powderyMildewPressure: powderyMildew,
        botrytisPressure: botrytis,
        phomopsisPressure: phomopsis,
        leafhopperPressure: leafhopper,
        spiderMitePressure: spiderMite,
        vineWeevilSighted: vineWeevil,
        eutypaDiebackSighted: eutypaDieback,
        xylellaFastidiosa: xylella,
        phytophthoraViticola: phytophthora,
        actionTaken: actionTaken.trim() || null,
        notes: notes.trim() || null,
      };

      const res = await apiFetch(`/api/farms/${farmId}/vineyard-scouting/${record.id}`, {
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
      onSaved(record.id, body);
    } catch {
      Alert.alert("Save Failed", "Could not reach the server. Please try again.");
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!scoutDate || !scoutedBy.trim()) {
      Alert.alert("Required Fields", "Please enter a scout date and scouted by name.");
      return;
    }
    if (xylella || phytophthora) {
      Alert.alert(
        "⚠️ Notifiable Pest Flagged",
        "You have flagged a possible notifiable plant pest. You must report this to APHA immediately on 0300 1000 313.\n\nRecord will still be saved.",
        [
          { text: "Understood — Save Record", style: "destructive", onPress: doSave },
          { text: "Cancel" },
        ],
      );
      return;
    }
    doSave();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={editStyles.container}>
          {/* Header */}
          <View style={editStyles.header}>
            <Text style={editStyles.title}>Edit Scouting Record</Text>
            <Pressable onPress={onClose} style={editStyles.closeBtn} hitSlop={12}>
              <Feather name="x" size={22} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={editStyles.scroll} contentContainerStyle={editStyles.scrollContent} keyboardShouldPersistTaps="handled">
            {/* ── Walkabout Details ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Walkabout Details</Text>

              <Text style={editStyles.fieldLabel}>Scout Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={scoutDate}
                onChangeText={setScoutDate}
                keyboardType="numeric"
              />

              <Text style={editStyles.fieldLabel}>Scouted By *</Text>
              <Input
                placeholder="Enter name"
                value={scoutedBy}
                onChangeText={setScoutedBy}
              />

              <Text style={editStyles.fieldLabel}>Block / Area</Text>
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
                <Pressable
                  onPress={() => setSelectedBlock(null)}
                  style={editStyles.clearBlockBtn}
                >
                  <Feather name="x" size={12} color={colors.textSecondary} />
                  <Text style={editStyles.clearBlockText}>Clear block link</Text>
                </Pressable>
              )}
            </View>

            {/* ── Disease Pressure ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Disease Pressure</Text>
              <PressurePicker label="Downy Mildew" value={downyMildew} onChange={setDownyMildew} />
              <PressurePicker label="Powdery Mildew" value={powderyMildew} onChange={setPowderyMildew} />
              <PressurePicker label="Botrytis" value={botrytis} onChange={setBotrytis} />
              <PressurePicker label="Phomopsis" value={phomopsis} onChange={setPhomopsis} />
            </View>

            {/* ── Pest Pressure ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Pest Pressure</Text>
              <PressurePicker label="Leafhopper" value={leafhopper} onChange={setLeafhopper} />
              <PressurePicker label="Spider Mite" value={spiderMite} onChange={setSpiderMite} />
              <BooleanToggle label="Vine Weevil sighted" value={vineWeevil} onChange={setVineWeevil} urgent />
              <BooleanToggle label="Eutypa Dieback sighted" value={eutypaDieback} onChange={setEutypaDieback} />
            </View>

            {/* ── Notifiable ── */}
            <View style={[editStyles.card, { borderColor: colors.error, borderWidth: 1.5 }]}>
              <Text style={[editStyles.sectionTitle, { color: colors.error }]}>Notifiable Plant Pests</Text>
              <Text style={editStyles.helperText}>
                Report to APHA immediately on 0300 1000 313 if any of these are suspected. Do not move plant material off-site.
              </Text>
              <BooleanToggle label="Xylella fastidiosa suspected" value={xylella} onChange={setXylella} urgent />
              <BooleanToggle label="Phytophthora viticola suspected" value={phytophthora} onChange={setPhytophthora} urgent />
            </View>

            {/* ── Actions & Notes ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Actions & Notes</Text>
              <Text style={editStyles.fieldLabel}>Action Taken</Text>
              <Input placeholder="Describe any action taken…" value={actionTaken} onChangeText={setActionTaken} multiline numberOfLines={3} />
              <Text style={editStyles.fieldLabel}>Notes</Text>
              <Input placeholder="Additional observations…" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
            </View>

            {/* ── Photos ── */}
            {record && (
              <ScoutingPhotoSection farmId={farmId} scoutingId={record.id} />
            )}

            {/* ── Quick Links ── */}
            <View style={editStyles.card}>
              <Text style={editStyles.sectionTitle}>Quick Links</Text>
              <Text style={editStyles.quickLinkHint}>Jump to a related record for this scouting observation</Text>
              <Pressable
                style={editStyles.quickLinkBtn}
                onPress={() => {
                  onClose();
                  if (record?.blockId) {
                    router.push({ pathname: "/vine-operation", params: { blockId: String(record.blockId) } });
                  } else {
                    router.push("/vine-operation");
                  }
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
                  if (record?.blockId) {
                    router.push({ pathname: "/vine-harvest", params: { blockId: String(record.blockId) } });
                  } else {
                    router.push("/vine-harvest");
                  }
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

function ScoutingRow({
  item,
  onEdit,
  onDelete,
}: {
  item: ScoutingRecord;
  onEdit: (record: ScoutingRecord) => void;
  onDelete: (id: number) => void;
}) {
  const linked = !!item.blockId;
  const pressure = highestPressure(item);
  const hasNotifiable = item.xylellaFastidiosa || item.phytophthoraViticola;

  const handlePress = () => {
    Haptics.selectionAsync();
    onEdit(item);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Delete Scouting Record",
      `Delete the scouting record from ${formatDate(item.scoutDate)}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(item.id) },
      ],
    );
  };

  return (
    <Pressable style={styles.row} onPress={handlePress}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowDate}>{formatDate(item.scoutDate)}</Text>
        <View style={styles.rowMeta}>
          {linked ? (
            <View style={styles.blockTag}>
              <Feather name="layers" size={12} color={colors.primary} />
              <Text style={styles.blockTagText}>{item.blockName ?? "Block"}</Text>
            </View>
          ) : (
            <View style={styles.unlinkTag}>
              <Feather name="alert-circle" size={12} color={colors.warning ?? "#d97706"} />
              <Text style={styles.unlinkTagText}>No block linked</Text>
            </View>
          )}
          {item.scoutedBy ? (
            <Text style={styles.rowSub} numberOfLines={1}>{item.scoutedBy}</Text>
          ) : null}
        </View>
      </View>
      <View style={styles.rowRight}>
        {hasNotifiable && (
          <View style={[styles.badge, { backgroundColor: "#fef2f2", borderColor: colors.error }]}>
            <Text style={[styles.badgeText, { color: colors.error }]}>⚠ Notifiable</Text>
          </View>
        )}
        {!hasNotifiable && pressure && (
          <View style={[styles.badge, { backgroundColor: "#f5f5f5", borderColor: pressure.color }]}>
            <Text style={[styles.badgeText, { color: pressure.color }]}>{pressure.label}</Text>
          </View>
        )}
        {!!item.photoCount && item.photoCount > 0 && (
          <View style={styles.photoBadge}>
            <Feather name="camera" size={11} color={colors.primary} />
            <Text style={styles.photoBadgeText}>{item.photoCount}</Text>
          </View>
        )}
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

export default function VineScoutingHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { address, cphNumber, sbiNumber, loading: identifiersLoading, justSaved, clearJustSaved, refetch: refetchIdentifiers } = useFarmIdentifiers(currentFarm?.id);
  const missingIdentifiers = !identifiersLoading && (!cphNumber || !sbiNumber);
  const { dismissed: bannerDismissed, dismiss: dismissBanner } = useIdentifierBannerDismiss("vine-scouting-history", currentFarm?.id, user?.id);

  useFocusEffect(useCallback(() => { refetchIdentifiers(); }, [refetchIdentifiers]));
  const { records, loading, refreshing, error, refresh } = useApiFetch<ScoutingRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/vineyard-scouting",
  );
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);

  const missingAddressFields: string[] = !identifiersLoading
    ? [
        !currentFarm?.name || currentFarm.name.trim() === "" ? "Farm name" : "",
        !address || address.trim() === "" ? "Farm address" : "",
      ].filter(Boolean)
    : [];

  const [search, setSearch] = useState("");
  const [editingRecord, setEditingRecord] = useState<ScoutingRecord | null>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<number, Partial<ScoutingRecord>>>({});
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  const displayRecords = useMemo(() => {
    return records
      .filter(r => !deletedIds.has(r.id))
      .map(r => {
        const update = localUpdates[r.id];
        if (update !== undefined) return { ...r, ...update };
        return r;
      });
  }, [records, localUpdates, deletedIds]);

  const filtered = useMemo(() => {
    if (!search.trim()) return displayRecords;
    const q = search.toLowerCase();
    return displayRecords.filter(r =>
      (r.blockName ?? "").toLowerCase().includes(q) ||
      (r.scoutedBy ?? "").toLowerCase().includes(q) ||
      (r.scoutDate ?? "").includes(q),
    );
  }, [displayRecords, search]);

  const handleSaved = (recordId: number, updated: Partial<ScoutingRecord>) => {
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
      const res = await apiFetch(`/api/farms/${currentFarm?.id}/vineyard-scouting/${id}`, {
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Scouting History</Text>
      </View>

      <IdentifierBanner
        justSaved={justSaved && !identifiersLoading}
        missingIdentifiers={missingIdentifiers}
        bannerDismissed={bannerDismissed}
        onClearJustSaved={clearJustSaved}
        onDismiss={dismissBanner}
        cphMissing={!cphNumber}
        sbiMissing={!sbiNumber}
        context="scouting records"
      />

      <View style={styles.searchRow}>
        <Feather name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by block, scout or date…"
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
          clearButtonMode="while-editing"
        />
      </View>

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
            <ScoutingRow item={item} onEdit={setEditingRecord} onDelete={handleDelete} />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="eye-off" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No scouting records</Text>
              <Text style={styles.emptyText}>
                {search.trim() ? "No records match your search." : "Scouting records you create will appear here."}
              </Text>
            </View>
          }
        />
      )}

      <EditScoutingModal
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  closeBtn: { padding: spacing.xs },
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
  helperText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
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
  pressureRow: { gap: spacing.xs },
  pressureLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  pressureButtons: { flexDirection: "row", gap: spacing.xs },
  pressureBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  pressureBtnText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  toggleRowActive: { borderColor: colors.success, backgroundColor: "#f0fdf4" },
  toggleRowUrgent: { borderColor: colors.error, backgroundColor: "#fef2f2" },
  toggleLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  quickLinkHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  quickLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  quickLinkText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
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
  rowMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  rowSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginLeft: spacing.sm },
  deleteBtn: { padding: 4 },
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
  badge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs },
  photoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: "#f0f7ff",
  },
  photoBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primary },
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
});
