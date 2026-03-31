import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
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
import type { GrainSaleRecord } from "@/lib/types";
import { useMobileLookup } from "@/lib/hooks/useMobileLookup";

const COMMODITIES_FALLBACK = [
  "Winter Wheat", "Spring Wheat", "Winter Barley", "Spring Barley",
  "Malting Barley", "Winter Oats", "Spring Oats", "Oilseed Rape",
  "Winter Beans", "Spring Beans", "Peas", "Maize", "Linseed", "Other",
];

const SALE_TYPES = [
  { value: "spot", label: "Spot" },
  { value: "forward", label: "Forward Contract" },
  { value: "pool", label: "Pool Scheme" },
  { value: "ex-store", label: "Ex-Store" },
];

export default function GrainSaleScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const commodities = useMobileLookup("commodity_types", COMMODITIES_FALLBACK);
  const [saving, setSaving] = useState(false);

  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [saleType, setSaleType] = useState<"spot" | "forward" | "pool" | "ex-store">("spot");
  const [buyer, setBuyer] = useState("");
  const [merchantRef, setMerchantRef] = useState("");
  const [commodity, setCommodity] = useState("");
  const [variety, setVariety] = useState("");
  const [tonnage, setTonnage] = useState("");
  const [pricePerTonne, setPricePerTonne] = useState("");
  const [grossValue, setGrossValue] = useState("");
  const [netValue, setNetValue] = useState("");
  const [moisture, setMoisture] = useState("");
  const [protein, setProtein] = useState("");
  const [gradeAchieved, setGradeAchieved] = useState("");
  const [cropYear, setCropYear] = useState("");
  const [weighbridgeTicket, setWeighbridgeTicket] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!buyer.trim()) {
      Alert.alert("Required", "Please enter the buyer / merchant name.");
      return;
    }
    if (!commodity.trim()) {
      Alert.alert("Required", "Please select a commodity.");
      return;
    }
    if (!tonnage.trim()) {
      Alert.alert("Required", "Please enter the tonnage sold.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: GrainSaleRecord = {
      id: generateId(),
      farmId: currentFarm?.id?.toString() ?? "",
      saleDate,
      saleType,
      buyer: buyer.trim(),
      merchantRef: merchantRef.trim(),
      commodity: commodity.trim(),
      variety: variety.trim(),
      tonnage: tonnage.trim(),
      pricePerTonne: pricePerTonne.trim(),
      grossValue: grossValue.trim(),
      deductions: "",
      netValue: netValue.trim(),
      moisture: moisture.trim(),
      specificWeight: "",
      protein: protein.trim(),
      gradeAchieved: gradeAchieved.trim(),
      deliveryDate: "",
      deliveryLocation: deliveryLocation.trim(),
      weighbridgeTicket: weighbridgeTicket.trim(),
      invoiceNumber: invoiceNumber.trim(),
      cropYear: cropYear.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.GRAIN_SALE_RECORDS, record);
      await refreshPendingCount();
      Alert.alert("Saved", "Grain sale recorded and queued for sync.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save grain sale. Please try again.");
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
          <Text style={styles.headerTitle}>Record Grain Sale</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionLabel}>Sale Type</Text>
          <View style={styles.pillRow}>
            {SALE_TYPES.map(t => (
              <Pressable
                key={t.value}
                style={[styles.pill, saleType === t.value && styles.pillActive]}
                onPress={() => setSaleType(t.value as "spot" | "forward" | "pool" | "ex-store")}
              >
                <Text style={[styles.pillText, saleType === t.value && styles.pillTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input label="Sale Date *" value={saleDate} onChangeText={setSaleDate} placeholder="YYYY-MM-DD" />
          <Input label="Buyer / Merchant *" value={buyer} onChangeText={setBuyer} placeholder="e.g. Frontier Agriculture" />
          <Input label="Merchant Reference" value={merchantRef} onChangeText={setMerchantRef} placeholder="Contract or lot reference" />

          <Text style={styles.sectionLabel}>Commodity *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.commodityScroll}>
            {commodities.map(c => (
              <Pressable
                key={c}
                style={[styles.commodityPill, commodity === c && styles.commodityPillActive]}
                onPress={() => setCommodity(c)}
              >
                <Text style={[styles.commodityText, commodity === c && styles.commodityTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Input label="Variety" value={variety} onChangeText={setVariety} placeholder="e.g. Skyfall, KWS Extase" />
          <Input label="Tonnage (t) *" value={tonnage} onChangeText={setTonnage} placeholder="0.00" keyboardType="decimal-pad" />
          <Input label="Price (£/tonne)" value={pricePerTonne} onChangeText={setPricePerTonne} placeholder="e.g. 185.50" keyboardType="decimal-pad" />
          <Input label="Gross Value (£)" value={grossValue} onChangeText={setGrossValue} placeholder="0.00" keyboardType="decimal-pad" />
          <Input label="Net Value (£)" value={netValue} onChangeText={setNetValue} placeholder="0.00" keyboardType="decimal-pad" />
          <Input label="Moisture (%)" value={moisture} onChangeText={setMoisture} placeholder="e.g. 14.5" keyboardType="decimal-pad" />
          <Input label="Protein (%)" value={protein} onChangeText={setProtein} placeholder="e.g. 13.0" keyboardType="decimal-pad" />
          <Input label="Grade Achieved" value={gradeAchieved} onChangeText={setGradeAchieved} placeholder="e.g. Group 1 Milling" />
          <Input label="Crop Year" value={cropYear} onChangeText={setCropYear} placeholder="e.g. 2024/25" />
          <Input label="Delivery Location" value={deliveryLocation} onChangeText={setDeliveryLocation} placeholder="e.g. Cambs Grain Ltd" />
          <Input label="Weighbridge Ticket" value={weighbridgeTicket} onChangeText={setWeighbridgeTicket} />
          <Input label="Invoice Number" value={invoiceNumber} onChangeText={setInvoiceNumber} />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional notes…" multiline numberOfLines={3} />

          <Button
            title={saving ? "Saving…" : "Save Grain Sale"}
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
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { padding: spacing.lg, gap: spacing.md },
  sectionLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: 6 },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.sm },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  pillActive: { backgroundColor: "#166534", borderColor: "#166534" },
  pillText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  pillTextActive: { color: "#fff" },
  commodityScroll: { marginBottom: spacing.sm },
  commodityPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    marginRight: 8,
  },
  commodityPillActive: { backgroundColor: "#166534", borderColor: "#166534" },
  commodityText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  commodityTextActive: { color: "#fff" },
});
