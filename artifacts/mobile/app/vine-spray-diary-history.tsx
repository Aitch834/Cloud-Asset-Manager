import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
    <View style={editStyles.photoSection}>
      <View style={editStyles.photoHeader}>
        <Text style={editStyles.photoSectionTitle}>Application Photos</Text>
        <Text style={editStyles.photoCount}>{photos.length} attached</Text>
      </View>
      <Text style={editStyles.photoHint}>Long-press a photo to delete it.</Text>

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
            <View style={editStyles.emptyPhotos}>
              <Feather name="image" size={20} color={colors.textSecondary} />
              <Text style={editStyles.emptyPhotosText}>No photos yet</Text>
            </View>
          }
        />
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
}: {
  item: SprayDiaryRecord;
  blocks: VineBlock[];
  onEdit: (record: SprayDiaryRecord) => void;
}) {
  const linkedBlockName = useBlockName(item.blockId, blocks);
  const linked = !!item.blockId;

  const handlePress = () => {
    Haptics.selectionAsync();
    onEdit(item);
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
  const [editingRecord, setEditingRecord] = useState<SprayDiaryRecord | null>(null);
  const [localUpdates, setLocalUpdates] = useState<Record<number, Partial<SprayDiaryRecord>>>({});

  const displayRecords = useMemo(() => {
    return records.map(r => {
      const update = localUpdates[r.id];
      if (update !== undefined) return { ...r, ...update };
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

  const handleSaved = (recordId: number, updated: Partial<SprayDiaryRecord>) => {
    setLocalUpdates(prev => ({
      ...prev,
      [recordId]: { ...(prev[recordId] ?? {}), ...updated },
    }));
    setEditingRecord(null);
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
              onEdit={setEditingRecord}
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
