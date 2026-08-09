import { StaffMemberPicker, type ApiFarmMember, memberFullName } from "@/components/StaffMemberPicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { RaiseTaskSheet } from "@/components/ui/RaiseTaskSheet";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useApiFarmMembers } from "@/lib/hooks/useApiFarmMembers";
import { VineBlockPicker } from "@/components/VineBlockPicker";
import { useApiVineBlocks, type VineBlock } from "@/lib/hooks/useApiVineBlocks";
import { apiFetch } from "@/lib/apiFetch";
import { uploadPhotoToStorage, getApiBase, pickPhoto } from "@/lib/uploadPhoto";

const today = new Date().toISOString().split("T")[0];

const PRESSURE_LABELS = ["None", "Low", "Medium", "High"];
const PRESSURE_COLORS = [colors.textSecondary, colors.success, colors.warning ?? "#f59e0b", colors.error];

// 4-minute background refresh for presigned URLs (matching vine-block-photos.tsx pattern)
const PHOTO_REFRESH_MS = 4 * 60 * 1000;

interface ScoutingPhoto {
  id: number;
  scoutingId: number;
  farmId: number;
  objectPath: string;
  fileName: string | null;
  caption: string | null;
  sortOrder: number | null;
  uploadedAt: string;
  downloadUrl: string | null;
}

function PressurePicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.pressureRow}>
      <Text style={styles.pressureLabel}>{label}</Text>
      <View style={styles.pressureButtons}>
        {PRESSURE_LABELS.map((l, i) => (
          <Pressable
            key={i}
            style={[styles.pressureBtn, value === i && { backgroundColor: PRESSURE_COLORS[i], borderColor: PRESSURE_COLORS[i] }]}
            onPress={() => { Haptics.selectionAsync(); onChange(i); }}
          >
            <Text style={[styles.pressureBtnText, value === i && { color: "#fff" }]}>{l}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function BooleanToggle({ label, value, onChange, urgent }: { label: string; value: boolean; onChange: (v: boolean) => void; urgent?: boolean }) {
  return (
    <Pressable
      style={[styles.toggleRow, value && urgent && styles.toggleRowUrgent, value && !urgent && styles.toggleRowActive]}
      onPress={() => { Haptics.selectionAsync(); onChange(!value); }}
    >
      <Feather name={value ? "check-square" : "square"} size={18} color={value ? (urgent ? colors.error : colors.success) : colors.textSecondary} />
      <Text style={[styles.toggleLabel, value && urgent && { color: colors.error }]}>{label}</Text>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Photo thumbnail
// ---------------------------------------------------------------------------

function ScoutingPhotoThumbnail({
  photo,
  onDelete,
  onPress,
}: {
  photo: ScoutingPhoto;
  onDelete: (id: number) => void;
  onPress: (photo: ScoutingPhoto) => void;
}) {
  const uri = photo.downloadUrl ?? null;

  const handleLongPress = () => {
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
    <Pressable style={styles.thumbnail} onLongPress={handleLongPress} onPress={() => onPress(photo)}>
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

// ---------------------------------------------------------------------------
// Photo gallery section (rendered after save)
// ---------------------------------------------------------------------------

function ScoutingPhotoSection({
  farmId,
  scoutingId,
}: {
  farmId: string | number;
  scoutingId: number;
}) {
  const [photos, setPhotos] = useState<ScoutingPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  // Initial load + 4-minute silent background refresh
  useEffect(() => {
    loadPhotos();
    refreshTimer.current = setInterval(() => loadPhotos({ silent: true }), PHOTO_REFRESH_MS);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [loadPhotos]);

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

  const handlePressPhoto = (photo: ScoutingPhoto) => {
    if (!photo.downloadUrl) return;
    Alert.alert(
      photo.caption ? photo.caption : "Scouting Photo",
      undefined,
      [
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            Alert.alert("Delete Photo", "Are you sure? This cannot be undone.", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive", onPress: () => handleDeletePhoto(photo.id) },
            ]),
        },
        { text: "Close", style: "cancel" },
      ],
    );
  };

  return (
    <View style={styles.photoSection}>
      <View style={styles.photoHeader}>
        <Text style={styles.sectionTitle}>Photos</Text>
        <Text style={styles.photoHint}>{photos.length} attached</Text>
      </View>
      <Text style={styles.helperText}>
        Attach photos of disease symptoms as on-field evidence. Long-press a photo to delete it.
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
              onPress={handlePressPhoto}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyPhotos}>
              <Feather name="image" size={20} color={colors.textSecondary} />
              <Text style={styles.emptyPhotosText}>No photos yet</Text>
            </View>
          }
        />
      )}

      <Pressable
        style={[styles.addPhotoBtn, uploading && styles.addPhotoBtnDisabled]}
        onPress={handleAddPhoto}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={colors.primary ?? colors.success} />
        ) : (
          <Feather name="camera" size={16} color={colors.primary ?? colors.success} />
        )}
        <Text style={styles.addPhotoBtnText}>{uploading ? "Uploading…" : "Add Photo"}</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function VineScoutingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [selectedScout, setSelectedScout] = useState<ApiFarmMember | null>(null);
  const [manualScout, setManualScout] = useState(user?.name || "");
  const scoutedBy = selectedScout ? memberFullName(selectedScout) : manualScout;

  const [scoutDate, setScoutDate] = useState(today);
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [manualBlockName, setManualBlockName] = useState("");
  const [nextScoutDate, setNextScoutDate] = useState("");

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

  const [taskSheet, setTaskSheet] = useState<{ title: string; description: string } | null>(null);

  // After a successful API save we get a server-side record ID — used for photo attachment
  const [savedRecordId, setSavedRecordId] = useState<number | null>(null);

  const handleSave = async () => {
    if (!scoutDate || !scoutedBy.trim()) {
      Alert.alert("Required Fields", "Please enter a scout date and your name.");
      return;
    }

    if (xylella || phytophthora) {
      Alert.alert(
        "⚠️ Notifiable Pest Suspected",
        `You have flagged a possible notifiable plant pest. You must report this to APHA immediately on 0300 1000 313 before moving any plant material.\n\nRecord will still be saved.`,
        [{ text: "Understood — Save Record", style: "destructive", onPress: () => doSave() }, { text: "Cancel" }],
      );
      return;
    }

    doSave();
  };

  const doSave = async () => {
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const body = {
      scoutDate,
      blockName: (selectedBlock?.blockName ?? manualBlockName.trim()) || undefined,
      blockId: selectedBlock?.id ?? undefined,
      scoutedBy: scoutedBy.trim(),
      nextScoutDate: nextScoutDate || undefined,
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
      actionTaken: actionTaken.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      const res = await apiFetch(`/api/farms/${currentFarm?.id}/vineyard-scouting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Save Failed", (err as any).error ?? "Could not save the scouting record. Please try again.");
        setSaving(false);
        return;
      }

      const data: { record: { id: number } } = await res.json();
      setSavedRecordId(data.record.id);
    } catch {
      Alert.alert("Save Failed", "Could not reach the server. Please check your connection and try again.");
      setSaving(false);
      return;
    }

    setSaving(false);

    const hasHighPressure = downyMildew >= 2 || powderyMildew >= 2 || botrytis >= 2 || phomopsis >= 2;
    if (hasHighPressure || xylella || vineWeevil) {
      setTaskSheet({
        title: `High Disease Pressure — ${(selectedBlock?.blockName ?? manualBlockName) || "Vineyard"} · ${scoutDate}`,
        description: `Scout: ${scoutedBy}. Downy: ${PRESSURE_LABELS[downyMildew]}, Powdery: ${PRESSURE_LABELS[powderyMildew]}, Botrytis: ${PRESSURE_LABELS[botrytis]}${xylella ? " — XYLELLA SUSPECTED" : ""}. Consider spray intervention.`,
      });
    }
    // If no task sheet, the user stays on the screen to add photos, then navigates back manually
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Vineyard Disease Scouting</Text>
        </View>

        {/* ── Form (hidden once saved) ── */}
        {savedRecordId === null ? (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Walkabout Details</Text>
              <Text style={styles.fieldLabel}>Scout Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={scoutDate}
                onChangeText={v => { if (v <= today) setScoutDate(v); }}
                keyboardType="numeric"
              />
              <Text style={styles.fieldLabel}>Block / Area</Text>
              <VineBlockPicker blocks={blocks} selected={selectedBlock} onSelect={setSelectedBlock} loading={blocksLoading} />
              {!selectedBlock && (
                <Input placeholder={blocks.length ? "Or type block name manually" : "e.g. South Slope, Block 3"} value={manualBlockName} onChangeText={setManualBlockName} style={{ marginTop: 4 }} />
              )}
              <Text style={styles.fieldLabel}>Scouted By</Text>
              <StaffMemberPicker
                members={members}
                selected={selectedScout}
                onSelect={setSelectedScout}
                loading={false}
                error={null}
              />
              {!selectedScout && (
                <Input placeholder="Or type name manually" value={manualScout} onChangeText={setManualScout} style={{ marginTop: spacing.xs }} />
              )}
              <Text style={styles.fieldLabel}>Next Scout Date (planned)</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={nextScoutDate}
                onChangeText={v => { if (!v || v >= today) setNextScoutDate(v); }}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Disease Pressure</Text>
              <PressurePicker label="Downy Mildew" value={downyMildew} onChange={setDownyMildew} />
              <PressurePicker label="Powdery Mildew" value={powderyMildew} onChange={setPowderyMildew} />
              <PressurePicker label="Botrytis" value={botrytis} onChange={setBotrytis} />
              <PressurePicker label="Phomopsis" value={phomopsis} onChange={setPhomopsis} />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Pest Pressure</Text>
              <PressurePicker label="Leafhopper" value={leafhopper} onChange={setLeafhopper} />
              <PressurePicker label="Spider Mite" value={spiderMite} onChange={setSpiderMite} />
              <BooleanToggle label="Vine Weevil sighted" value={vineWeevil} onChange={setVineWeevil} urgent />
              <BooleanToggle label="Eutypa Dieback sighted" value={eutypaDieback} onChange={setEutypaDieback} />
            </View>

            <View style={[styles.card, { borderColor: colors.error, borderWidth: 1.5 }]}>
              <Text style={[styles.sectionTitle, { color: colors.error }]}>Notifiable Plant Pests</Text>
              <Text style={styles.helperText}>Report to APHA immediately on 0300 1000 313 if any of these are suspected. Do not move plant material off-site.</Text>
              <BooleanToggle label="Xylella fastidiosa suspected" value={xylella} onChange={setXylella} urgent />
              <BooleanToggle label="Phytophthora viticola suspected" value={phytophthora} onChange={setPhytophthora} urgent />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Actions & Notes</Text>
              <Text style={styles.fieldLabel}>Action Taken</Text>
              <Input placeholder="Describe any action taken…" value={actionTaken} onChangeText={setActionTaken} multiline numberOfLines={3} />
              <Text style={styles.fieldLabel}>Notes</Text>
              <Input placeholder="Additional observations…" value={notes} onChangeText={setNotes} multiline numberOfLines={3} />
            </View>

            <Button title={saving ? "Saving…" : "Save Scouting Record"} onPress={handleSave} disabled={saving} />
          </>
        ) : (
          /* ── Post-save: show success banner + photo gallery ── */
          <>
            <View style={styles.savedBanner}>
              <Feather name="check-circle" size={20} color={colors.success} />
              <Text style={styles.savedBannerText}>Scouting record saved</Text>
            </View>

            <View style={styles.card}>
              <ScoutingPhotoSection farmId={currentFarm?.id ?? ""} scoutingId={savedRecordId} />
            </View>

            <Button title="Done" onPress={() => router.back()} />
          </>
        )}
      </ScrollView>

      {taskSheet && (
        <RaiseTaskSheet
          visible
          farmId={currentFarm?.id ?? ""}
          module="viticulture"
          defaultTitle={taskSheet.title}
          defaultDescription={taskSheet.description}
          onRaised={() => {
            setTaskSheet(null);
            if (savedRecordId !== null) {
              // Stay on screen for photo attachment — dismiss task sheet only
            } else {
              router.back();
            }
          }}
          onSkip={() => {
            setTaskSheet(null);
            if (savedRecordId === null) router.back();
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xs },
  backBtn: { padding: spacing.xs },
  title: { fontSize: fontSize.lg, fontFamily: fonts.bold, color: colors.text, flex: 1 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.text },
  fieldLabel: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.textSecondary, marginTop: spacing.xs },
  helperText: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 18 },
  pressureRow: { gap: spacing.xs },
  pressureLabel: { fontSize: fontSize.sm, fontFamily: fonts.medium, color: colors.text },
  pressureButtons: { flexDirection: "row", gap: spacing.xs },
  pressureBtn: { flex: 1, paddingVertical: 6, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  pressureBtnText: { fontSize: fontSize.xs, fontFamily: fonts.medium, color: colors.textSecondary },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  toggleRowActive: { borderColor: colors.success, backgroundColor: "#f0fdf4" },
  toggleRowUrgent: { borderColor: colors.error, backgroundColor: "#fef2f2" },
  toggleLabel: { fontSize: fontSize.sm, fontFamily: fonts.regular, color: colors.text, flex: 1 },

  // Saved state
  savedBanner: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: "#f0fdf4", borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.success },
  savedBannerText: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.success, flex: 1 },

  // Photo section
  photoSection: { gap: spacing.sm },
  photoHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  photoHint: { fontSize: fontSize.xs, color: colors.textSecondary },
  thumbnail: { width: 88, gap: spacing.xs },
  thumbImgBox: { width: 88, height: 88, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.border },
  thumbImage: { width: "100%", height: "100%" },
  thumbPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  captionBelow: { fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 14 },
  emptyPhotos: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: spacing.sm },
  emptyPhotosText: { fontSize: fontSize.sm, color: colors.textSecondary },
  addPhotoBtn: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.primary ?? colors.success, alignSelf: "flex-start", marginTop: spacing.xs },
  addPhotoBtnDisabled: { opacity: 0.5 },
  addPhotoBtnText: { fontSize: fontSize.sm, fontFamily: fonts.semiBold, color: colors.primary ?? colors.success },
});
