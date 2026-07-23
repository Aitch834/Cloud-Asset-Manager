import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { StrawSaleRecord } from "@/lib/types";

const STRAW_TYPES = ["Wheat Straw", "Barley Straw", "Oat Straw", "Oilseed Rape Straw"];
const BALE_FORMATS = ["Small Rectangular", "Big Round", "Big Square"];

function PillRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.pillRow}>
      {options.map((o) => (
        <Pressable
          key={o}
          style={[styles.pill, value === o && styles.pillActive]}
          onPress={() => onChange(o)}
        >
          <Text style={[styles.pillText, value === o && styles.pillTextActive]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function StrawSaleScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [isCashSale, setIsCashSale] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [strawType, setStrawType] = useState("Wheat Straw");
  const [baleFormat, setBaleFormat] = useState("Big Round");
  const [quantityBales, setQuantityBales] = useState("");
  const [pricePerBaleGbp, setPricePerBaleGbp] = useState("");
  const [totalValueGbp, setTotalValueGbp] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [haulierName, setHaulierName] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [trailerReg, setTrailerReg] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const qty = parseFloat(quantityBales);
    const price = parseFloat(pricePerBaleGbp);
    if (!isNaN(qty) && !isNaN(price) && qty > 0 && price > 0) {
      setTotalValueGbp((qty * price).toFixed(2));
    }
  }, [quantityBales, pricePerBaleGbp]);

  const handleSave = async () => {
    if (!isCashSale && !buyerName.trim()) {
      Alert.alert("Required", "Please enter the buyer name, or toggle Cash Sale for a farm-gate transaction.");
      return;
    }
    if (!quantityBales.trim() || isNaN(Number(quantityBales)) || Number(quantityBales) <= 0) {
      Alert.alert("Required", "Please enter the number of bales sold.");
      return;
    }
    if (!currentFarm) {
      Alert.alert("Error", "No farm selected.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: StrawSaleRecord = {
      id: generateId(),
      farmId: currentFarm.id?.toString() ?? "",
      saleDate,
      isCashSale,
      buyerName: isCashSale ? "Cash Sale" : buyerName.trim(),
      buyerAddress: buyerAddress.trim() || undefined,
      buyerPhone: buyerPhone.trim() || undefined,
      strawType,
      baleFormat,
      quantityBales: quantityBales.trim(),
      pricePerBaleGbp: pricePerBaleGbp.trim(),
      totalValueGbp: totalValueGbp.trim(),
      storageLocation: storageLocation.trim() || undefined,
      haulierName: haulierName.trim() || undefined,
      vehicleReg: vehicleReg.trim() || undefined,
      trailerReg: trailerReg.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.STRAW_SALE_RECORDS, record);
      await refreshPendingCount();
      Alert.alert(
        "Sale Recorded",
        "Queued for sync. An invoice reference (STR-YYYY-NNNN) will be assigned automatically when this record reaches the server.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch {
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Record Straw Sale</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.form}>

          {/* Sale type toggle */}
          <View style={styles.saleTypeRow}>
            <Text style={styles.sectionLabel}>Sale Type</Text>
            <Pressable
              style={[styles.cashToggle, isCashSale && styles.cashToggleActive]}
              onPress={() => {
                setIsCashSale((v) => !v);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Feather
                name="dollar-sign"
                size={14}
                color={isCashSale ? "#fff" : colors.textSecondary}
              />
              <Text style={[styles.cashToggleText, isCashSale && styles.cashToggleTextActive]}>
                Cash Sale
              </Text>
            </Pressable>
          </View>

          {isCashSale && (
            <View style={styles.infoBanner}>
              <Feather name="info" size={13} color="#166534" style={{ marginTop: 1 }} />
              <Text style={styles.infoBannerText}>
                Farm-gate cash sale. Traceability is maintained via the product and date fields below.
              </Text>
            </View>
          )}

          <Input
            label="Sale Date *"
            value={saleDate}
            onChangeText={setSaleDate}
            placeholder="YYYY-MM-DD"
            maxDate="today"
          />

          {/* Buyer */}
          {!isCashSale && (
            <>
              <Input
                label="Buyer Name *"
                value={buyerName}
                onChangeText={setBuyerName}
                placeholder="e.g. Smith Farms Ltd"
              />
              <Input
                label="Buyer Address"
                value={buyerAddress}
                onChangeText={setBuyerAddress}
                placeholder="Optional — for invoice"
                multiline
                numberOfLines={2}
              />
              <Input
                label="Buyer Phone"
                value={buyerPhone}
                onChangeText={setBuyerPhone}
                placeholder="Optional"
                keyboardType="phone-pad"
              />
            </>
          )}

          {/* Straw type */}
          <Text style={styles.sectionLabel}>Straw Type *</Text>
          <PillRow options={STRAW_TYPES} value={strawType} onChange={setStrawType} />

          {/* Bale format */}
          <Text style={styles.sectionLabel}>Bale Format *</Text>
          <PillRow options={BALE_FORMATS} value={baleFormat} onChange={setBaleFormat} />

          {/* Quantity & price */}
          <Input
            label="Number of Bales *"
            value={quantityBales}
            onChangeText={setQuantityBales}
            placeholder="e.g. 50"
            keyboardType="number-pad"
          />
          <Input
            label="Price per Bale (£)"
            value={pricePerBaleGbp}
            onChangeText={setPricePerBaleGbp}
            placeholder="e.g. 28.00"
            keyboardType="decimal-pad"
          />
          <Input
            label="Total Value (£)"
            value={totalValueGbp}
            onChangeText={setTotalValueGbp}
            placeholder="Auto-calculated or enter manually"
            keyboardType="decimal-pad"
          />

          {/* Storage */}
          <Input
            label="Selling From (Storage Location)"
            value={storageLocation}
            onChangeText={setStorageLocation}
            placeholder="e.g. North Barn, Yard Stack A"
          />

          {/* Transport */}
          <Text style={styles.sectionLabel}>Transport</Text>
          <Input
            label="Haulier / Driver"
            value={haulierName}
            onChangeText={setHaulierName}
            placeholder="e.g. Jones Haulage — or 'Own'  "
          />
          <Input
            label="Vehicle Reg"
            value={vehicleReg}
            onChangeText={(v) => setVehicleReg(v.toUpperCase())}
            placeholder="e.g. AB12 CDE"
            autoCapitalize="characters"
          />
          <Input
            label="Trailer Reg"
            value={trailerReg}
            onChangeText={(v) => setTrailerReg(v.toUpperCase())}
            placeholder="Optional"
            autoCapitalize="characters"
          />

          <Input
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes…"
            multiline
            numberOfLines={3}
          />

          <View style={styles.invoiceNotice}>
            <Feather name="file-text" size={13} color="#1d4ed8" style={{ marginTop: 1 }} />
            <Text style={styles.invoiceNoticeText}>
              An invoice reference (STR-{new Date().getFullYear()}-XXXX) is auto-generated when this record syncs. Open Straw Management on the dashboard to print the invoice.
            </Text>
          </View>

          <Button
            title={saving ? "Saving…" : "Save Straw Sale"}
            onPress={handleSave}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { padding: spacing.lg, gap: spacing.md },
  saleTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  cashToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cashToggleActive: { backgroundColor: "#166534", borderColor: "#166534" },
  cashToggleText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  cashToggleTextActive: { color: "#fff" },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#dcfce7",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: -4,
  },
  infoBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#166534",
    lineHeight: 18,
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.sm },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillActive: { backgroundColor: "#d97706", borderColor: "#d97706" },
  pillText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  pillTextActive: { color: "#fff" },
  invoiceNotice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#eff6ff",
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  invoiceNoticeText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: "#1d4ed8",
    lineHeight: 18,
  },
});
