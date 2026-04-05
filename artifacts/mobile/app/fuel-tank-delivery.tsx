import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
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
import { kvGet } from "@/lib/database";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

type FuelType =
  | "red_diesel"
  | "white_diesel"
  | "heating_oil"
  | "lpg_bulk"
  | "lpg_bottles"
  | "AdBlue"
  | "petrol"
  | "other";

type QualifyingUse =
  | "agriculture"
  | "forestry"
  | "horticulture"
  | "commercial_fishing"
  | "non_commercial"
  | "other";

const FUEL_TYPES: { key: FuelType; label: string; hmrcNote?: string }[] = [
  { key: "red_diesel", label: "Red Diesel (Gas Oil)", hmrcNote: "HMRC rebated — qualifying use required" },
  { key: "white_diesel", label: "Road Diesel (DERV)" },
  { key: "heating_oil", label: "Heating Oil (Kerosene)" },
  { key: "lpg_bulk", label: "LPG — Bulk Tank" },
  { key: "lpg_bottles", label: "LPG — Bottled / Cylinder" },
  { key: "AdBlue", label: "AdBlue" },
  { key: "petrol", label: "Petrol" },
  { key: "other", label: "Other" },
];

const QUALIFYING_USES: { key: QualifyingUse; label: string }[] = [
  { key: "agriculture", label: "Agriculture" },
  { key: "forestry", label: "Forestry" },
  { key: "horticulture", label: "Horticulture" },
  { key: "commercial_fishing", label: "Commercial Fishing" },
  { key: "non_commercial", label: "Non-commercial Heating" },
  { key: "other", label: "Other Qualifying Use" },
];

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      const t = await SecureStore.getItemAsync("auth_session_token");
      if (t) return t;
    }
    const raw = await kvGet("bde_auth_token");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) {
      const farm = JSON.parse(raw);
      return farm.tenantSlug || farm.slug || "";
    }
  } catch {}
  return "";
}

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  return domain ? `https://${domain}` : "";
}

async function uploadPhotoToStorage(photoUri: string, apiBase: string): Promise<string | null> {
  try {
    const presignRes = await fetch(`${apiBase}/api/storage/uploads/request-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "fuel-delivery-note.jpg", size: 0, contentType: "image/jpeg" }),
    });
    if (!presignRes.ok) return null;
    const { uploadURL, objectPath } = await presignRes.json();
    const fileRes = await fetch(photoUri);
    const blob = await fileRes.blob();
    const putRes = await fetch(uploadURL, {
      method: "PUT",
      body: blob,
      headers: { "Content-Type": blob.type || "image/jpeg" },
    });
    if (!putRes.ok) return null;
    return objectPath;
  } catch {
    return null;
  }
}

export default function FuelTankDeliveryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [tankName, setTankName] = useState("");
  const [fuelType, setFuelType] = useState<FuelType>("red_diesel");
  const [supplierName, setSupplierName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [quantityLitres, setQuantityLitres] = useState("");
  const [unitPricePence, setUnitPricePence] = useState("");
  const [deliveryNoteNumber, setDeliveryNoteNumber] = useState("");
  const [invoiceReference, setInvoiceReference] = useState("");
  const [qualifyingUse, setQualifyingUse] = useState<QualifyingUse>("agriculture");
  const [notes, setNotes] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const isRedDiesel = fuelType === "red_diesel";
  const totalCostPence =
    unitPricePence && quantityLitres
      ? Math.round(parseFloat(unitPricePence) * parseFloat(quantityLitres))
      : null;

  const takeOrPickPhoto = () => {
    Alert.alert(
      "Attach Delivery Note",
      "Photograph the delivery note or invoice for your records.",
      [
        {
          text: "Camera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Camera access is needed to photograph the delivery note.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: false });
            if (!result.canceled && result.assets[0]) {
              setPhotoUri(result.assets[0].uri);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
        },
        {
          text: "Photo Library",
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              Alert.alert("Permission Required", "Photo library access is needed.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: false });
            if (!result.canceled && result.assets[0]) {
              setPhotoUri(result.assets[0].uri);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const handleSave = async () => {
    if (!tankName.trim()) {
      Alert.alert("Required", "Please enter the tank name.");
      return;
    }
    if (!quantityLitres.trim() || isNaN(parseFloat(quantityLitres)) || parseFloat(quantityLitres) <= 0) {
      Alert.alert("Required", "Please enter a valid quantity in litres.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let documentUrl: string | undefined;

    if (photoUri) {
      setUploading(true);
      try {
        const apiBase = getApiBase();
        if (apiBase) {
          const objectPath = await uploadPhotoToStorage(photoUri, apiBase);
          if (objectPath) {
            documentUrl = objectPath;
          } else {
            Alert.alert(
              "Photo Not Uploaded",
              "The delivery note photo could not be uploaded right now — possibly no internet connection. The delivery record will still be saved and synced. You can attach the document from the dashboard later.",
            );
          }
        }
      } catch {
        // silent — delivery still saves
      } finally {
        setUploading(false);
      }
    }

    const qty = parseFloat(quantityLitres);
    const record = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      tankName: tankName.trim(),
      fuelType,
      supplierName: supplierName.trim() || undefined,
      driverName: driverName.trim() || undefined,
      quantityLitres: qty.toFixed(1),
      unitPricePence: unitPricePence ? Math.round(parseFloat(unitPricePence)) : undefined,
      totalCostPence: totalCostPence ?? undefined,
      deliveryNoteNumber: deliveryNoteNumber.trim() || undefined,
      invoiceReference: invoiceReference.trim() || undefined,
      qualifyingUse,
      documentUrl,
      notes: notes.trim() || undefined,
      deliveryDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.FUEL_TANK_DELIVERIES, record, currentFarm?.id);
    await refreshPendingCount();
    setSaving(false);

    const costStr = totalCostPence ? ` — £${(totalCostPence / 100).toFixed(2)}` : "";
    Alert.alert(
      "Delivery Recorded",
      `${qty.toFixed(0)} L of ${FUEL_TYPES.find(f => f.key === fuelType)?.label ?? fuelType} into ${tankName.trim()}${costStr}.${documentUrl ? " Delivery note photo uploaded." : ""} Record will sync automatically.`,
      [{ text: "Done", onPress: () => router.back() }],
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Log Fuel Delivery</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* HMRC info banner for red diesel */}
          {isRedDiesel && (
            <View style={styles.infoCard}>
              <Feather name="info" size={16} color="#d97706" />
              <Text style={styles.infoText}>
                Red diesel deliveries must be documented for HMRC compliance. Record the supplier, delivery note number, quantity and qualifying use. Keep records for at least 6 years.
              </Text>
            </View>
          )}

          {/* Delivery basics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <Input
              label="Tank Name *"
              value={tankName}
              onChangeText={setTankName}
              placeholder="e.g. Main Red Diesel, Heating Oil Bunded"
              autoCapitalize="words"
            />
            <Input
              label="Supplier"
              value={supplierName}
              onChangeText={setSupplierName}
              placeholder="e.g. Certas Energy, Crown Oil, Gleadells"
              autoCapitalize="words"
            />
            <Input
              label="Driver Name"
              value={driverName}
              onChangeText={setDriverName}
              placeholder="Tanker driver's name (optional)"
              autoCapitalize="words"
            />
            <Input
              label="Delivery Date"
              value={today}
              editable={false}
            />
          </View>

          {/* Fuel type selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fuel Type</Text>
            {FUEL_TYPES.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => setFuelType(f.key)}
                style={[
                  styles.option,
                  fuelType === f.key && { borderColor: colors.primary, backgroundColor: colors.primary + "12" },
                ]}
              >
                <View style={[styles.radio, fuelType === f.key && { borderColor: colors.primary }]}>
                  {fuelType === f.key && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.optionLabel, fuelType === f.key && { color: colors.primary }]}>
                    {f.label}
                  </Text>
                  {f.hmrcNote && <Text style={styles.optionSub}>{f.hmrcNote}</Text>}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Quantity & price */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantity & Cost</Text>
            <Input
              label="Quantity Delivered (litres) *"
              value={quantityLitres}
              onChangeText={setQuantityLitres}
              placeholder="e.g. 5000"
              keyboardType="decimal-pad"
            />
            <Input
              label="Unit Price (pence per litre)"
              value={unitPricePence}
              onChangeText={setUnitPricePence}
              placeholder="e.g. 87 for 87p/L"
              keyboardType="decimal-pad"
            />
            {totalCostPence !== null && (
              <View style={styles.costCard}>
                <Feather name="pound-sign" size={15} color={colors.primary} />
                <Text style={styles.costText}>
                  Total cost: <Text style={styles.costValue}>£{(totalCostPence / 100).toFixed(2)}</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Reference numbers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reference Numbers</Text>
            <Input
              label="Delivery Note Number"
              value={deliveryNoteNumber}
              onChangeText={setDeliveryNoteNumber}
              placeholder="From the tanker delivery docket"
              autoCapitalize="characters"
            />
            <Input
              label="Invoice Reference"
              value={invoiceReference}
              onChangeText={setInvoiceReference}
              placeholder="Supplier invoice number"
              autoCapitalize="characters"
            />
          </View>

          {/* Qualifying use (only shown for red diesel) */}
          {isRedDiesel && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Qualifying Use</Text>
              <Text style={styles.sectionSub}>
                Required for HMRC red diesel records — select the primary intended use for this delivery.
              </Text>
              {QUALIFYING_USES.map((q) => (
                <Pressable
                  key={q.key}
                  onPress={() => setQualifyingUse(q.key)}
                  style={[
                    styles.option,
                    qualifyingUse === q.key && { borderColor: colors.primary, backgroundColor: colors.primary + "12" },
                  ]}
                >
                  <View style={[styles.radio, qualifyingUse === q.key && { borderColor: colors.primary }]}>
                    {qualifyingUse === q.key && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                  </View>
                  <Text style={[styles.optionLabel, qualifyingUse === q.key && { color: colors.primary }]}>
                    {q.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Delivery note photo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Note / Document</Text>
            <Text style={styles.sectionSub}>
              Photograph the paper delivery docket from the tanker driver. This becomes your digital audit trail — essential for HMRC red diesel inspections.
            </Text>

            {photoUri ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
                <View style={styles.photoActions}>
                  <Pressable style={styles.photoActionBtn} onPress={takeOrPickPhoto}>
                    <Feather name="refresh-cw" size={15} color={colors.primary} />
                    <Text style={styles.photoActionText}>Retake</Text>
                  </Pressable>
                  <Pressable style={[styles.photoActionBtn, { borderColor: colors.error }]} onPress={() => setPhotoUri(null)}>
                    <Feather name="x" size={15} color={colors.error} />
                    <Text style={[styles.photoActionText, { color: colors.error }]}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable style={styles.photoPrompt} onPress={takeOrPickPhoto}>
                <Feather name="camera" size={28} color={colors.textMuted} />
                <Text style={styles.photoPromptTitle}>Photograph delivery note</Text>
                <Text style={styles.photoPromptSub}>Tap to use camera or choose from library</Text>
              </Pressable>
            )}
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional details, tank condition, discrepancy…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Button
              title={uploading ? "Uploading photo…" : saving ? "Saving…" : "Record Delivery"}
              onPress={handleSave}
              disabled={saving || uploading}
            />
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#92400e",
    lineHeight: 18,
  },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 17,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  optionLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  optionSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  costCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary + "10",
    borderColor: colors.primary + "40",
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  costText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  costValue: {
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  photoPrompt: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  photoPromptTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  photoPromptSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  photoContainer: {
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    backgroundColor: colors.borderLight,
  },
  photoActions: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  photoActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  photoActionText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
});
