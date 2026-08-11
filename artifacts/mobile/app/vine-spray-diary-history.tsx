import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useApiFetch } from "@/lib/hooks/useApiFetch";
import { useApiVineBlocks, type VineBlock } from "@/lib/hooks/useApiVineBlocks";
import { useFarmIdentifiers } from "@/lib/hooks/useFarmIdentifiers";
import { apiFetch } from "@/lib/apiFetch";
import { uploadPhotoToStorage, getApiBase, pickPhoto } from "@/lib/uploadPhoto";

// 4-minute background refresh for presigned URLs
const PHOTO_REFRESH_MS = 4 * 60 * 1000;

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

// ─── Block name lookup ────────────────────────────────────────────────────────

function useBlockName(blockId: number | null, blocks: VineBlock[]): string | null {
  if (!blockId) return null;
  return blocks.find(b => b.id === blockId)?.blockName ?? null;
}

// ─── Photo Thumbnail ──────────────────────────────────────────────────────────

function SprayPhotoThumbnail({
  photo,
  onDelete,
}: {
  photo: SprayDiaryPhoto;
  onDelete: (id: number) => void;
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
    <Pressable style={styles.thumbnail} onLongPress={handleLongPress}>
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
    <View style={styles.photoSection}>
      <View style={styles.photoHeader}>
        <Text style={styles.sectionLabel}>Application Photos</Text>
        <Text style={styles.photoCount}>{photos.length} attached</Text>
      </View>
      <Text style={styles.photoHint}>
        Long-press a photo to delete it.
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
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Feather name="camera" size={16} color={colors.primary} />
        )}
        <Text style={styles.addPhotoBtnText}>{uploading ? "Uploading…" : "Add Photo"}</Text>
      </Pressable>
    </View>
  );
}

// ─── Photo Gallery Modal ──────────────────────────────────────────────────────

interface PhotoGalleryModalProps {
  visible: boolean;
  record: SprayDiaryRecord | null;
  farmId: string;
  blocks: VineBlock[];
  blocksLoading: boolean;
  onClose: () => void;
  onChangeBlock: (record: SprayDiaryRecord) => void;
}

function PhotoGalleryModal({
  visible,
  record,
  farmId,
  blocks,
  blocksLoading: _blocksLoading,
  onClose,
  onChangeBlock,
}: PhotoGalleryModalProps) {
  const linkedBlockName = record?.blockId
    ? blocks.find(b => b.id === record.blockId)?.blockName ?? null
    : null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={photoModalStyles.container}>
        {/* Header */}
        <View style={photoModalStyles.header}>
          <View style={photoModalStyles.headerLeft}>
            <Text style={photoModalStyles.title} numberOfLines={1}>
              {record?.productName ?? "Spray Entry"}
            </Text>
            <Text style={photoModalStyles.subtitle}>
              {formatDate(record?.applicationDate)}
              {linkedBlockName ? `  ·  ${linkedBlockName}` : ""}
            </Text>
          </View>
          <Pressable onPress={onClose} style={photoModalStyles.closeBtn} hitSlop={12}>
            <Feather name="x" size={22} color={colors.text} />
          </Pressable>
        </View>

        {/* Record summary */}
        <ScrollView style={photoModalStyles.scroll} contentContainerStyle={photoModalStyles.scrollContent}>
          {record && (
            <View style={photoModalStyles.summaryCard}>
              {record.productType ? (
                <View style={photoModalStyles.typeBadge}>
                  <Text style={photoModalStyles.typeBadgeText}>{record.productType}</Text>
                </View>
              ) : null}
              <View style={photoModalStyles.summaryGrid}>
                {record.activeIngredient ? (
                  <View style={photoModalStyles.summaryItem}>
                    <Text style={photoModalStyles.summaryKey}>Active Ingredient</Text>
                    <Text style={photoModalStyles.summaryVal}>{record.activeIngredient}</Text>
                  </View>
                ) : null}
                {record.mappNumber ? (
                  <View style={photoModalStyles.summaryItem}>
                    <Text style={photoModalStyles.summaryKey}>MAPP No.</Text>
                    <Text style={photoModalStyles.summaryVal}>{record.mappNumber}</Text>
                  </View>
                ) : null}
                {record.ratePerHectare != null ? (
                  <View style={photoModalStyles.summaryItem}>
                    <Text style={photoModalStyles.summaryKey}>Rate</Text>
                    <Text style={photoModalStyles.summaryVal}>
                      {record.ratePerHectare} {record.rateUnit ?? "L/ha"}
                    </Text>
                  </View>
                ) : null}
                {record.areaTreatedHa != null ? (
                  <View style={photoModalStyles.summaryItem}>
                    <Text style={photoModalStyles.summaryKey}>Area</Text>
                    <Text style={photoModalStyles.summaryVal}>{Number(record.areaTreatedHa).toFixed(2)} ha</Text>
                  </View>
                ) : null}
                {record.operatorName ? (
                  <View style={photoModalStyles.summaryItem}>
                    <Text style={photoModalStyles.summaryKey}>Operator</Text>
                    <Text style={photoModalStyles.summaryVal}>{record.operatorName}</Text>
                  </View>
                ) : null}
                {record.weatherConditions ? (
                  <View style={photoModalStyles.summaryItem}>
                    <Text style={photoModalStyles.summaryKey}>Weather</Text>
                    <Text style={photoModalStyles.summaryVal}>{record.weatherConditions}</Text>
                  </View>
                ) : null}
              </View>
              {record.notes ? (
                <Text style={photoModalStyles.notes}>{record.notes}</Text>
              ) : null}
            </View>
          )}

          {/* Photo gallery */}
          {record && (
            <SprayDiaryPhotoSection farmId={farmId} sprayDiaryId={record.id} />
          )}
        </ScrollView>

        {/* Footer — Change Block */}
        <View style={photoModalStyles.footer}>
          <Button
            title="Change Block Link"
            onPress={() => {
              if (record) {
                onClose();
                // small delay so the gallery modal fully closes before the block picker opens
                setTimeout(() => onChangeBlock(record), 350);
              }
            }}
            variant="outline"
            fullWidth
            icon="layers"
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Change Block Modal ────────────────────────────────────────────────────────

interface ChangeBlockModalProps {
  visible: boolean;
  record: SprayDiaryRecord | null;
  farmId: string;
  blocks: VineBlock[];
  blocksLoading: boolean;
  onClose: () => void;
  onSaved: (recordId: number, block: VineBlock | null) => void;
}

function ChangeBlockModal({ visible, record, farmId, blocks, blocksLoading, onClose, onSaved }: ChangeBlockModalProps) {
  const [selectedBlock, setSelectedBlock] = useState<VineBlock | null>(null);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible && record) {
      const current = record.blockId ? blocks.find(b => b.id === record.blockId) ?? null : null;
      setSelectedBlock(current);
    }
  }, [visible, record, blocks]);

  const handleConfirm = async () => {
    if (!record) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/api/farms/${farmId}/vineyard-spray-diary/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockId: selectedBlock?.id ?? null,
        }),
      });
      if (!res.ok) {
        Alert.alert("Save Failed", "Could not update the block link. Please try again.");
        setSaving(false);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSaved(record.id, selectedBlock);
    } catch {
      Alert.alert("Save Failed", "Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={modalStyles.container}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Change Block</Text>
          <Pressable onPress={onClose} style={modalStyles.closeBtn} hitSlop={12}>
            <Feather name="x" size={22} color={colors.text} />
          </Pressable>
        </View>

        {record && (
          <Text style={modalStyles.subtitle}>
            Spray diary · {formatDate(record.applicationDate)}
            {record.productName ? `  ·  ${record.productName}` : ""}
          </Text>
        )}

        <ScrollView style={modalStyles.scroll} contentContainerStyle={modalStyles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={modalStyles.sectionLabel}>Select a block to link this record to</Text>

          {blocksLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.md }} />
          ) : blocks.length === 0 ? (
            <Text style={modalStyles.emptyText}>No vineyard blocks found for this farm.</Text>
          ) : (
            <VineBlockPicker
              blocks={blocks}
              selected={selectedBlock}
              onSelect={setSelectedBlock}
              loading={false}
            />
          )}

          {selectedBlock && (
            <View style={modalStyles.selectedInfo}>
              <Feather name="check-circle" size={16} color={colors.success} />
              <Text style={modalStyles.selectedInfoText}>
                Will link to <Text style={{ fontFamily: fonts.semiBold }}>{selectedBlock.blockName}</Text>
              </Text>
            </View>
          )}

          {!selectedBlock && record?.blockId && (
            <View style={modalStyles.unlinkInfo}>
              <Feather name="info" size={16} color={colors.textSecondary} />
              <Text style={modalStyles.unlinkInfoText}>Clearing the selection will unlink this record from its current block.</Text>
            </View>
          )}
        </ScrollView>

        <View style={modalStyles.footer}>
          <Button
            title={saving ? "Saving…" : "Confirm"}
            onPress={handleConfirm}
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
    </Modal>
  );
}

// ─── Record Row ───────────────────────────────────────────────────────────────

function SprayDiaryRow({
  item,
  blocks,
  onOpenPhotos,
}: {
  item: SprayDiaryRecord;
  blocks: VineBlock[];
  onOpenPhotos: (record: SprayDiaryRecord) => void;
}) {
  const linkedBlockName = useBlockName(item.blockId, blocks);
  const linked = !!item.blockId;

  const handlePress = () => {
    Haptics.selectionAsync();
    onOpenPhotos(item);
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
        <Feather name="camera" size={14} color={colors.textSecondary} />
        <Feather name="chevron-right" size={16} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function VineSprayDiaryHistoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { address, loading: identifiersLoading } = useFarmIdentifiers(currentFarm?.id);
  const { records, loading, refreshing, error, refresh } = useApiFetch<SprayDiaryRecord>(
    currentFarm?.id,
    "/api/farms/:farmId/vineyard-spray-diary",
  );
  const { blocks, loading: blocksLoading } = useApiVineBlocks(currentFarm?.id);

  const missingAddressFields: string[] = !identifiersLoading
    ? [
        !currentFarm?.name || currentFarm.name.trim() === "" ? "Farm name" : "",
        !address || address.trim() === "" ? "Farm address" : "",
      ].filter(Boolean)
    : [];

  const [search, setSearch] = useState("");
  const [photoRecord, setPhotoRecord] = useState<SprayDiaryRecord | null>(null);
  const [changingRecord, setChangingRecord] = useState<SprayDiaryRecord | null>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<number, { blockId: number | null }>>({});

  const displayRecords = useMemo(() => {
    return records.map(r => {
      const update = localUpdates[r.id];
      if (update !== undefined) return { ...r, blockId: update.blockId };
      return r;
    });
  }, [records, localUpdates]);

  const filtered = useMemo(() => {
    if (!search.trim()) return displayRecords;
    const q = search.toLowerCase();
    return displayRecords.filter(r => {
      const blockName = r.blockId ? blocks.find(b => b.id === r.blockId)?.blockName ?? "" : "";
      return (
        (r.productName ?? "").toLowerCase().includes(q) ||
        blockName.toLowerCase().includes(q) ||
        (r.operatorName ?? "").toLowerCase().includes(q) ||
        (r.applicationDate ?? "").includes(q) ||
        (r.productType ?? "").toLowerCase().includes(q)
      );
    });
  }, [displayRecords, search, blocks]);

  const handleBlockSaved = (recordId: number, block: VineBlock | null) => {
    setLocalUpdates(prev => ({
      ...prev,
      [recordId]: { blockId: block?.id ?? null },
    }));
    setChangingRecord(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Spray Diary History</Text>
      </View>

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
              onOpenPhotos={setPhotoRecord}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="droplet" size={32} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No spray diary entries</Text>
              <Text style={styles.emptyText}>
                {search.trim() ? "No entries match your search." : "Spray diary entries you create will appear here."}
              </Text>
            </View>
          }
        />
      )}

      {/* Photo gallery modal — opens when a row is tapped */}
      <PhotoGalleryModal
        visible={photoRecord !== null}
        record={photoRecord}
        farmId={currentFarm?.id ?? ""}
        blocks={blocks}
        blocksLoading={blocksLoading}
        onClose={() => setPhotoRecord(null)}
        onChangeBlock={record => setChangingRecord(record)}
      />

      {/* Change block modal — opened from the gallery modal footer */}
      <ChangeBlockModal
        visible={changingRecord !== null}
        record={changingRecord}
        farmId={currentFarm?.id ?? ""}
        blocks={blocks}
        blocksLoading={blocksLoading}
        onClose={() => setChangingRecord(null)}
        onSaved={handleBlockSaved}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const photoModalStyles = StyleSheet.create({
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
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xl },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 2,
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ede9fe",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  typeBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primary },
  summaryGrid: { gap: spacing.sm },
  summaryItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: spacing.md },
  summaryKey: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  summaryVal: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, flex: 2, textAlign: "right" },
  notes: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: "italic",
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});

const modalStyles = StyleSheet.create({
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
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.sm },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: "#f0fdf4",
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.success,
  },
  selectedInfoText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.success,
    flex: 1,
  },
  unlinkInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unlinkInfoText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});

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
  rowProduct: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  rowProductType: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexWrap: "wrap" },
  rowSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  rowRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginLeft: spacing.sm },
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
  // Photo section
  photoSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
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
  sectionLabel: {
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
    marginBottom: spacing.xs,
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
  captionBelow: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 80,
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
