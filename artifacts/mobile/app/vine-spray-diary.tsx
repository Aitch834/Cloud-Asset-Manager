import { StaffMemberPicker, type ApiFarmMember, memberFullName } from "@/components/StaffMemberPicker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
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

// 4-minute background refresh for presigned URLs (matching vine-block-photos.tsx pattern)
const PHOTO_REFRESH_MS = 4 * 60 * 1000;

interface SprayDiaryPhoto {
  id: number;
  sprayDiaryId: number;
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
// Photo thumbnail
// ---------------------------------------------------------------------------

function SprayPhotoThumbnail({
  photo,
  onDelete,
  onPress,
  onReload,
  onShowTooltip,
  onHideTooltip,
}: {
  photo: SprayDiaryPhoto;
  onDelete: (id: number) => void;
  onPress: (photo: SprayDiaryPhoto) => void;
  onReload?: () => void;
  onShowTooltip: (caption: string) => void;
  onHideTooltip: () => void;
}) {
  const uri = photo.downloadUrl ?? null;
  const [imgError, setImgError] = useState(false);
  // Set to true when a long-press fires so onPressOut can show the Alert; cleared
  // there immediately. RN does NOT emit onPress after a recognised long press.
  const longPressJustFiredRef = useRef(false);

  // Reset error state whenever the URL is refreshed so the image retries
  const prevUri = useRef(uri);
  if (prevUri.current !== uri) {
    prevUri.current = uri;
    if (imgError) setImgError(false);
  }

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
    longPressJustFiredRef.current = false;
    onHideTooltip();
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
    <Pressable style={styles.thumbnail} onLongPress={handleLongPress} onPressOut={handlePressOut} onPress={() => onPress(photo)}>
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
            onPress={() => { onReload?.(); }}
            hitSlop={8}
          >
            <Feather name="refresh-cw" size={22} color={colors.textSecondary} />
            <Text style={styles.thumbReloadLabel}>Tap to reload</Text>
          </Pressable>
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Feather name="image" size={24} color={colors.textSecondary} />
          </View>
        )}
        {photo.isCover ? (
          <View style={styles.coverBadge}>
            <Text style={styles.coverBadgeText}>★</Text>
          </View>
        ) : null}
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
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Grid caption tooltip state — shown while a captioned thumbnail is long-pressed
  const [gridTooltipCaption, setGridTooltipCaption] = useState<string | null>(null);

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

  // Initial load + 4-minute silent background refresh
  useEffect(() => {
    loadPhotos();
    refreshTimer.current = setInterval(() => loadPhotos({ silent: true }), PHOTO_REFRESH_MS);
    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [loadPhotos]);

  // Immediately refresh presigned URLs on focus so photos never show as broken
  // after the grower returns from another app (matching vine-scouting.tsx pattern)
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

  const handlePressPhoto = (photo: SprayDiaryPhoto) => {
    if (!photo.downloadUrl) return;
    Alert.alert(
      photo.caption ? photo.caption : "Spray Diary Photo",
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
        <Text style={styles.sectionTitle}>Application Photos</Text>
        <Text style={styles.photoHint}>{photos.length} attached</Text>
      </View>
      <Text style={styles.helperText}>
        Attach photos documenting application conditions, equipment, or treated areas. Long-press a photo to delete it.
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
            <SprayPhotoThumbnail
              photo={item}
              onDelete={handleDeletePhoto}
              onPress={handlePressPhoto}
              onReload={() => loadPhotos({ silent: true })}
              onShowTooltip={setGridTooltipCaption}
              onHideTooltip={() => setGridTooltipCaption(null)}
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

      {/* Grid caption tooltip — shown while a captioned thumbnail is long-pressed */}
      {gridTooltipCaption != null ? (
        <View style={styles.gridCaptionTooltip} pointerEvents="none">
          <Text style={styles.gridCaptionTooltipText} numberOfLines={4}>
            {gridTooltipCaption}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function VineSprayDiaryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { members } = useApiFarmMembers(currentFarm?.id);
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [selectedOperator, setSelectedOperator] = useState<ApiFarmMember | null>(null);
  const [manualOperatorName, setManualOperatorName] = useState(user?.name || "");
  const operatorName = selectedOperator ? memberFullName(selectedOperator) : manualOperatorName;

  const [applicationDate, setApplicationDate] = useState(today);
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

  const [operatorCertificateNo, setOperatorCertificateNo] = useState("");
  const [notes, setNotes] = useState("");

  // After a successful API save we get a server-side record ID — used for photo attachment
  const [savedRecordId, setSavedRecordId] = useState<number | null>(null);

  const handleSave = async () => {
    if (!applicationDate || !productName.trim()) {
      Alert.alert("Required Fields", "Please enter an application date and product name.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const body: Record<string, unknown> = {
      applicationDate,
      blockId: selectedBlock?.id ?? undefined,
      productName: productName.trim(),
      mappNumber: mappNumber.trim() || undefined,
      activeIngredient: activeIngredient.trim() || undefined,
      productType: productType.trim() || undefined,
      ratePerHectare: ratePerHectare ? parseFloat(ratePerHectare) : undefined,
      rateUnit: rateUnit.trim() || undefined,
      areaTreatedHa: areaTreatedHa ? parseFloat(areaTreatedHa) : undefined,
      windSpeedMph: windSpeedMph ? parseFloat(windSpeedMph) : undefined,
      temperatureCelsius: temperatureCelsius ? parseFloat(temperatureCelsius) : undefined,
      weatherConditions: weatherConditions.trim() || undefined,
      operatorName: operatorName.trim() || undefined,
      operatorCertificateNo: operatorCertificateNo.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    try {
      const res = await apiFetch(`/api/farms/${currentFarm?.id}/vineyard-spray-diary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Alert.alert("Save Failed", (err as any).error ?? "Could not save the spray diary entry. Please try again.");
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
    // User stays on screen to add application condition photos
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
          <Text style={styles.title}>Vineyard Spray Diary</Text>
        </View>

        {/* ── Form (hidden once saved) ── */}
        {savedRecordId === null ? (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Application Details</Text>

              <Text style={styles.fieldLabel}>Application Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={applicationDate}
                onChangeText={v => { if (v <= today) setApplicationDate(v); }}
                keyboardType="numeric"
              />

              <Text style={styles.fieldLabel}>Vineyard Block</Text>
              <VineBlockPicker
                blocks={blocks}
                selected={selectedBlock}
                onSelect={setSelectedBlock}
                loading={blocksLoading}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Product</Text>

              <Text style={styles.fieldLabel}>Product Name *</Text>
              <Input
                placeholder="e.g. Mancozeb 80 WG"
                value={productName}
                onChangeText={setProductName}
              />

              <Text style={styles.fieldLabel}>MAPP Number</Text>
              <Input
                placeholder="e.g. MAPP 12345"
                value={mappNumber}
                onChangeText={setMappNumber}
                keyboardType="default"
              />

              <Text style={styles.fieldLabel}>Active Ingredient</Text>
              <Input
                placeholder="e.g. Mancozeb"
                value={activeIngredient}
                onChangeText={setActiveIngredient}
              />

              <Text style={styles.fieldLabel}>Product Type</Text>
              <Input
                placeholder="e.g. Fungicide, Insecticide, Herbicide"
                value={productType}
                onChangeText={setProductType}
              />

              <View style={styles.row}>
                <Input
                  label="Rate"
                  placeholder="e.g. 2.0"
                  value={ratePerHectare}
                  onChangeText={setRatePerHectare}
                  keyboardType="decimal-pad"
                  containerStyle={styles.flex}
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

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Weather Conditions</Text>

              <View style={styles.row}>
                <Input
                  label="Wind Speed (mph)"
                  placeholder="e.g. 5"
                  value={windSpeedMph}
                  onChangeText={setWindSpeedMph}
                  keyboardType="decimal-pad"
                  containerStyle={styles.flex}
                />
                <Input
                  label="Temperature (°C)"
                  placeholder="e.g. 18"
                  value={temperatureCelsius}
                  onChangeText={setTemperatureCelsius}
                  keyboardType="decimal-pad"
                  containerStyle={styles.flex}
                />
              </View>

              <Input
                label="Weather Conditions"
                placeholder="e.g. Dry, overcast, light breeze"
                value={weatherConditions}
                onChangeText={setWeatherConditions}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Operator</Text>

              <StaffMemberPicker
                members={members}
                selected={selectedOperator}
                onSelect={setSelectedOperator}
                loading={false}
                error={null}
              />
              {!selectedOperator && (
                <Input
                  placeholder="Or type operator name manually"
                  value={manualOperatorName}
                  onChangeText={setManualOperatorName}
                  style={{ marginTop: spacing.xs }}
                />
              )}

              <Text style={styles.fieldLabel}>Certificate No. (PA1/PA6/NPTC)</Text>
              <Input
                placeholder="e.g. 12345/67890"
                value={operatorCertificateNo}
                onChangeText={setOperatorCertificateNo}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Input
                placeholder="Additional notes about the application…"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <Button
              title="Save Entry"
              onPress={handleSave}
              loading={saving}
              fullWidth
              icon="check"
              style={{ marginHorizontal: spacing.lg }}
            />
          </>
        ) : (
          <>
            {/* Success state — show photo gallery */}
            <View style={[styles.card, { borderColor: colors.success, borderWidth: 1.5 }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Feather name="check-circle" size={20} color={colors.success} />
                <Text style={[styles.sectionTitle, { color: colors.success }]}>Entry Saved</Text>
              </View>
              <Text style={styles.helperText}>
                Your spray diary entry has been saved. Add photos below to document the application conditions, then tap Back when done.
              </Text>
            </View>

            <SprayDiaryPhotoSection
              farmId={currentFarm?.id ?? ""}
              sprayDiaryId={savedRecordId}
            />

            <Button
              title="Done"
              onPress={() => router.back()}
              variant="outline"
              fullWidth
              icon="arrow-left"
              style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { marginRight: spacing.md },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  helperText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  // Photo section
  photoSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  photoHint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
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
  thumbReloadLabel: { fontSize: fontSize.xs, color: colors.textSecondary, textAlign: "center" },
  captionBelow: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 80,
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
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary ?? colors.success,
    alignSelf: "flex-start",
  },
  addPhotoBtnDisabled: {
    opacity: 0.5,
  },
  addPhotoBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary ?? colors.success,
  },
});
