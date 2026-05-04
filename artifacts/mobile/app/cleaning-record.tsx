import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
import { useSync } from "@/lib/context/SyncContext";
import { useApiCoshh } from "@/lib/hooks/useApiCoshh";
import { useApiStockItems } from "@/lib/hooks/useApiStockItems";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { CleaningRecord, CleaningStockConsumption } from "@/lib/types";
import { usePrint } from "@/lib/hooks/usePrint";
import { cleaningRecordHtml } from "@/lib/printTemplates";

const CLEANING_TYPES = [
  { key: "routine-clean", label: "Routine clean", icon: "wind" as const },
  { key: "deep-clean", label: "Deep clean", icon: "wind" as const },
  { key: "disinfection", label: "Disinfection", icon: "droplet" as const },
  { key: "fogging", label: "Fogging / fumigation", icon: "cloud" as const },
  { key: "pre-housing", label: "Pre-housing clean", icon: "home" as const },
  { key: "post-tb", label: "Post-TB restriction", icon: "alert-circle" as const },
  { key: "emergency", label: "Emergency clean", icon: "alert-triangle" as const },
  { key: "other", label: "Other", icon: "more-horizontal" as const },
];

const COMMON_AREAS = [
  "Cattle shed", "Sheep shed", "Pig building", "Poultry house",
  "Milking parlour", "Calf pens", "Isolation unit", "Yard / concrete",
  "Vehicle / trailer", "Feed store", "Equipment", "Other",
];

async function pickPhoto(label: string): Promise<string | null> {
  return new Promise(resolve => {
    Alert.alert(
      label,
      "Photograph the product label or select from library.",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Camera access is needed.");
              resolve(null);
              return;
            }
            const result = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false });
            resolve(!result.canceled ? result.assets[0].uri : null);
          },
        },
        {
          text: "Photo Library",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Photo library access is needed.");
              resolve(null);
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: false });
            resolve(!result.canceled ? result.assets[0].uri : null);
          },
        },
        { text: "Cancel", style: "cancel", onPress: () => resolve(null) },
      ],
    );
  });
}

export default function CleaningRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const [area, setArea] = useState("");
  const [cleaningType, setCleaningType] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [customProductInput, setCustomProductInput] = useState("");
  const [stockConsumptions, setStockConsumptions] = useState<Record<string, { stockItemId: number | null; stockItemName: string; quantityUsed: string }>>({});
  const [dilutionRate, setDilutionRate] = useState("");
  const [contactTime, setContactTime] = useState("");
  const [cleanedBy, setCleanedBy] = useState(user?.name || "");
  const [cleanedDate, setCleanedDate] = useState(today);
  const [nextDueDate, setNextDueDate] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [labelPhotoFrontUri, setLabelPhotoFrontUri] = useState<string | null>(null);
  const [labelPhotoBackUri, setLabelPhotoBackUri] = useState<string | null>(null);

  const farmIdStr = currentFarm?.id ? String(currentFarm.id) : undefined;
  const { records: coshhRecords } = useApiCoshh(farmIdStr);
  const { cleaningItems, hasDisinfectantCategory } = useApiStockItems(farmIdStr);
  const coshhSubstances = coshhRecords.map(r => r.substanceName).filter(Boolean);

  function toggleProduct(name: string) {
    Haptics.selectionAsync();
    setSelectedProducts(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  }

  function addCustomProduct() {
    const val = customProductInput.trim();
    if (!val) return;
    if (!selectedProducts.includes(val)) {
      setSelectedProducts(prev => [...prev, val]);
    }
    setCustomProductInput("");
  }

  function removeProduct(name: string) {
    Haptics.selectionAsync();
    setSelectedProducts(prev => prev.filter(p => p !== name));
    setStockConsumptions(prev => { const next = { ...prev }; delete next[name]; return next; });
  }

  function openStockPicker(product: string) {
    const current = stockConsumptions[product];
    const matched = cleaningItems.filter(s => {
      const norm = product.toLowerCase();
      return s.name.toLowerCase().includes(norm) || norm.includes(s.name.toLowerCase());
    });
    const others = cleaningItems.filter(s => !matched.includes(s));
    const orderedItems = [...matched, ...others];

    if (orderedItems.length === 0) {
      Alert.alert(
        "No Stock Items",
        hasDisinfectantCategory
          ? "No cleaning/disinfectant stock items found."
          : "No stock items found. Add products in the Stock & Suppliers module.",
      );
      return;
    }

    const buttons = orderedItems.slice(0, 9).map(s => ({
      text: `${matched.includes(s) ? "✓ " : ""}${s.name}${s.unit ? ` (${s.unit})` : ""}`,
      onPress: () => {
        Haptics.selectionAsync();
        setStockConsumptions(prev => ({
          ...prev,
          [product]: { stockItemId: s.id, stockItemName: s.name, quantityUsed: prev[product]?.quantityUsed ?? "" },
        }));
      },
    }));

    if (current?.stockItemId) {
      buttons.push({
        text: "✕ Clear link",
        onPress: () => setStockConsumptions(prev => {
          const next = { ...prev };
          delete next[product];
          return next;
        }),
      });
    }
    buttons.push({ text: "Cancel", onPress: () => {} });

    Alert.alert(
      `Stock item for "${product}"`,
      hasDisinfectantCategory ? "Showing cleaning/disinfectant products:" : "Showing all stock items:",
      buttons,
    );
  }

  const handleSave = async () => {
    if (!area.trim() || !cleaningType) {
      Alert.alert("Required Fields", "Please enter an area and select a cleaning type.");
      return;
    }
    if (!cleanedDate) {
      Alert.alert("Required Fields", "Please enter the date the cleaning was carried out.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch (locErr: unknown) {
      console.warn("Location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const consumptions: CleaningStockConsumption[] = selectedProducts
      .filter(p => stockConsumptions[p]?.stockItemId)
      .map(p => ({
        productName: p,
        stockItemId: stockConsumptions[p].stockItemId!,
        stockItemName: stockConsumptions[p].stockItemName,
        quantityUsed: stockConsumptions[p].quantityUsed || "0",
      }));

    const record: CleaningRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      area: area.trim(),
      cleaningType,
      productsUsed: selectedProducts.join(", "),
      dilutionRate: dilutionRate.trim(),
      contactTime: contactTime.trim(),
      cleanedBy: cleanedBy.trim(),
      cleanedDate: cleanedDate ? new Date(cleanedDate).toISOString() : new Date().toISOString(),
      nextDueDate: nextDueDate ? new Date(nextDueDate).toISOString() : "",
      verifiedBy: verifiedBy.trim(),
      notes: notes.trim(),
      consumptions: consumptions.length > 0 ? consumptions : undefined,
      labelPhotoFrontUri: labelPhotoFrontUri ?? undefined,
      labelPhotoBackUri: labelPhotoBackUri ?? undefined,
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.CLEANING_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Cleaning record saved. Print or save the C&D record?", [
      { text: "Print", onPress: async () => { await print(cleaningRecordHtml(record, currentFarm)); router.back(); } },
      { text: "Save PDF", onPress: async () => { await savePdf(cleaningRecordHtml(record, currentFarm), "Cleaning Record"); router.back(); } },
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Cleaning & Disinfection</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <ScrollView
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 100 }]}
        >
          {/* Area */}
          <View style={styles.sectionLabel}>
            <Feather name="home" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Area / Location <Text style={styles.required}>*</Text></Text>
          </View>
          <View style={styles.chipGrid}>
            {COMMON_AREAS.map((a) => {
              const selected = area === a;
              return (
                <Pressable
                  key={a}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => { Haptics.selectionAsync(); setArea(a); }}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{a}</Text>
                </Pressable>
              );
            })}
          </View>
          <Input
            placeholder="Or type a specific area..."
            value={area}
            onChangeText={setArea}
            style={{ marginBottom: spacing.lg }}
          />

          {/* Cleaning Type */}
          <View style={styles.sectionLabel}>
            <Feather name="wind" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Cleaning Type <Text style={styles.required}>*</Text></Text>
          </View>
          <View style={styles.chipGrid}>
            {CLEANING_TYPES.map((ct) => {
              const selected = cleaningType === ct.key;
              return (
                <Pressable
                  key={ct.key}
                  style={[styles.chip, selected && styles.chipSelected]}
                  onPress={() => { Haptics.selectionAsync(); setCleaningType(ct.key); }}
                >
                  <Feather name={ct.icon} size={12} color={selected ? "#0891b2" : colors.textSecondary} />
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{ct.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Products & Method */}
          <View style={styles.sectionLabel}>
            <Feather name="droplet" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Products Used</Text>
          </View>

          {/* Selected product chips */}
          {selectedProducts.length > 0 && (
            <View style={styles.selectedProductsRow}>
              {selectedProducts.map(p => (
                <Pressable
                  key={p}
                  style={styles.productChipSelected}
                  onPress={() => removeProduct(p)}
                >
                  <Text style={styles.productChipSelectedText}>{p}</Text>
                  <Feather name="x" size={11} color="#0e7490" />
                </Pressable>
              ))}
            </View>
          )}

          {/* COSHH register chips */}
          {coshhSubstances.length > 0 && (
            <>
              <Text style={styles.fieldLabel}>From COSHH register — tap to add:</Text>
              <View style={styles.chipGrid}>
                {coshhSubstances.map(name => {
                  const selected = selectedProducts.includes(name);
                  return (
                    <Pressable
                      key={name}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => toggleProduct(name)}
                    >
                      {selected && <Feather name="check" size={11} color="#0891b2" />}
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{name}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Custom product input */}
          <Text style={[styles.fieldLabel, { marginTop: coshhSubstances.length > 0 ? spacing.xs : 0 }]}>
            {coshhSubstances.length > 0 ? "Or add unlisted product:" : "Product(s) used:"}
          </Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder={coshhSubstances.length > 0 ? "Type product name…" : "e.g. Virkon S, Citric acid"}
                value={customProductInput}
                onChangeText={setCustomProductInput}
                onSubmitEditing={addCustomProduct}
                returnKeyType="done"
              />
            </View>
            {customProductInput.trim().length > 0 && (
              <Pressable style={styles.addButton} onPress={addCustomProduct}>
                <Feather name="plus" size={18} color="#fff" />
              </Pressable>
            )}
          </View>

          {/* Per-product stock links */}
          {selectedProducts.length > 0 && (
            <>
              <View style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
                <Feather name="package" size={14} color={colors.textSecondary} />
                <Text style={styles.sectionTitle}>Stock Used — per product</Text>
              </View>
              <Text style={styles.fieldLabel}>
                {hasDisinfectantCategory
                  ? "Link each product to a cleaning stock item to track usage."
                  : "Link to a stock item to record usage. Add 'Disinfectant' category items in Stock & Suppliers for filtered suggestions."}
              </Text>
              {selectedProducts.map(product => {
                const link = stockConsumptions[product];
                return (
                  <View key={product} style={styles.stockRow}>
                    <Text style={styles.stockProductName} numberOfLines={1}>{product}</Text>
                    <View style={styles.stockRowRight}>
                      <Pressable
                        style={[styles.stockLinkBtn, link?.stockItemId && styles.stockLinkBtnLinked]}
                        onPress={() => openStockPicker(product)}
                      >
                        <Feather name="link" size={12} color={link?.stockItemId ? "#0e7490" : colors.textSecondary} />
                        <Text style={[styles.stockLinkBtnText, link?.stockItemId && styles.stockLinkBtnTextLinked]} numberOfLines={1}>
                          {link?.stockItemName || "Link stock…"}
                        </Text>
                      </Pressable>
                      {link?.stockItemId && (
                        <View style={styles.qtyInputWrap}>
                          <Input
                            placeholder="Qty"
                            value={link.quantityUsed}
                            onChangeText={v => setStockConsumptions(prev => ({
                              ...prev,
                              [product]: { ...prev[product], quantityUsed: v },
                            }))}
                            keyboardType="decimal-pad"
                            style={styles.qtyInput}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </>
          )}

          {/* Dilution & Contact */}
          <View style={[styles.row, { marginTop: spacing.sm }]}>
            <View style={styles.halfInput}>
              <Text style={styles.fieldLabel}>Dilution rate</Text>
              <Input
                placeholder="e.g. 1:200"
                value={dilutionRate}
                onChangeText={setDilutionRate}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.fieldLabel}>Contact time</Text>
              <Input
                placeholder="e.g. 30 mins"
                value={contactTime}
                onChangeText={setContactTime}
              />
            </View>
          </View>

          {/* People */}
          <View style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
            <Feather name="user" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>People</Text>
          </View>
          <Text style={styles.fieldLabel}>Cleaned by</Text>
          <Input
            placeholder="Name of person who carried out the clean"
            value={cleanedBy}
            onChangeText={setCleanedBy}
            style={{ marginBottom: spacing.sm }}
          />
          <Text style={styles.fieldLabel}>Verified by</Text>
          <Input
            placeholder="Supervisor or checker (optional)"
            value={verifiedBy}
            onChangeText={setVerifiedBy}
          />

          {/* Dates */}
          <View style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
            <Feather name="calendar" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Dates</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.halfInput}>
              <Text style={styles.fieldLabel}>Date cleaned <Text style={styles.required}>*</Text></Text>
              <Input
                placeholder="YYYY-MM-DD"
                maxDate="today"
                value={cleanedDate}
                onChangeText={setCleanedDate}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.fieldLabel}>Next due date</Text>
              <Input
                placeholder="YYYY-MM-DD"
                minDate="today"
                value={nextDueDate}
                onChangeText={setNextDueDate}
              />
            </View>
          </View>

          {/* Product Label Photos */}
          <View style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
            <Feather name="camera" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Product Label Photos</Text>
          </View>
          <Text style={styles.fieldLabel}>
            Photograph the front and back of the product label (including directions, approval numbers and dilution rates) for compliance records.
          </Text>

          <View style={styles.photoRow}>
            <View style={styles.photoSlot}>
              <Text style={styles.photoSlotLabel}>Front of label</Text>
              {labelPhotoFrontUri ? (
                <View style={styles.photoPreviewWrap}>
                  <Image source={{ uri: labelPhotoFrontUri }} style={styles.photoPreview} resizeMode="cover" />
                  <View style={styles.photoPreviewActions}>
                    <Pressable
                      style={styles.photoAction}
                      onPress={async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const uri = await pickPhoto("Replace Front Label Photo");
                        if (uri) setLabelPhotoFrontUri(uri);
                      }}
                    >
                      <Feather name="camera" size={13} color={colors.primary} />
                      <Text style={styles.photoActionText}>Retake</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.photoAction, styles.photoActionRemove]}
                      onPress={() => {
                        Alert.alert("Remove Photo", "Remove front label photo?", [
                          { text: "Remove", style: "destructive", onPress: () => setLabelPhotoFrontUri(null) },
                          { text: "Cancel", style: "cancel" },
                        ]);
                      }}
                    >
                      <Feather name="trash-2" size={13} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  style={styles.photoPlaceholder}
                  onPress={async () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const uri = await pickPhoto("Front Label Photo");
                    if (uri) setLabelPhotoFrontUri(uri);
                  }}
                >
                  <Feather name="camera" size={22} color={colors.textSecondary} />
                  <Text style={styles.photoPlaceholderText}>Tap to photograph</Text>
                </Pressable>
              )}
            </View>

            <View style={styles.photoSlot}>
              <Text style={styles.photoSlotLabel}>Back of label</Text>
              {labelPhotoBackUri ? (
                <View style={styles.photoPreviewWrap}>
                  <Image source={{ uri: labelPhotoBackUri }} style={styles.photoPreview} resizeMode="cover" />
                  <View style={styles.photoPreviewActions}>
                    <Pressable
                      style={styles.photoAction}
                      onPress={async () => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const uri = await pickPhoto("Replace Back Label Photo");
                        if (uri) setLabelPhotoBackUri(uri);
                      }}
                    >
                      <Feather name="camera" size={13} color={colors.primary} />
                      <Text style={styles.photoActionText}>Retake</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.photoAction, styles.photoActionRemove]}
                      onPress={() => {
                        Alert.alert("Remove Photo", "Remove back label photo?", [
                          { text: "Remove", style: "destructive", onPress: () => setLabelPhotoBackUri(null) },
                          { text: "Cancel", style: "cancel" },
                        ]);
                      }}
                    >
                      <Feather name="trash-2" size={13} color={colors.error} />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  style={styles.photoPlaceholder}
                  onPress={async () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const uri = await pickPhoto("Back Label Photo");
                    if (uri) setLabelPhotoBackUri(uri);
                  }}
                >
                  <Feather name="camera" size={22} color={colors.textSecondary} />
                  <Text style={styles.photoPlaceholderText}>Tap to photograph</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Notes */}
          <View style={[styles.sectionLabel, { marginTop: spacing.lg }]}>
            <Feather name="file-text" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input
            placeholder="Observations, issues found, or any other notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <View style={{ marginTop: spacing.xl }}>
            <Button
              title={saving ? "Saving..." : "Save Record"}
              onPress={handleSave}
              disabled={saving}
              icon="check"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  required: { color: colors.error },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: "#e0f2fe", borderColor: "#0891b2" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { color: "#0891b2", fontFamily: fonts.semiBold },
  selectedProductsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  productChipSelected: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: "#cffafe",
    borderWidth: 1,
    borderColor: "#67e8f9",
  },
  productChipSelectedText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: "#0e7490",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: "flex-end",
  },
  halfInput: { flex: 1 },
  fieldLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "#0891b2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  stockProductName: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
    minWidth: 0,
  },
  stockRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    flexShrink: 0,
  },
  stockLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 140,
  },
  stockLinkBtnLinked: {
    backgroundColor: "#cffafe",
    borderColor: "#67e8f9",
  },
  stockLinkBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  stockLinkBtnTextLinked: {
    color: "#0e7490",
    fontFamily: fonts.semiBold,
  },
  qtyInputWrap: { width: 64 },
  qtyInput: { height: 36, fontSize: fontSize.xs } as any,
  photoRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  photoSlot: { flex: 1 },
  photoSlotLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  photoPlaceholder: {
    height: 120,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  photoPlaceholderText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  photoPreviewWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  photoPreview: { width: "100%", height: 120 },
  photoPreviewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xs,
    backgroundColor: colors.surface,
  },
  photoAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  photoActionText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  photoActionRemove: {
    borderColor: colors.error + "30",
    backgroundColor: colors.error + "08",
  },
});
