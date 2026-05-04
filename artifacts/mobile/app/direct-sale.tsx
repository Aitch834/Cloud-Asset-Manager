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
import type { DirectSaleRecord } from "@/lib/types";

const CHANNELS: Array<{ value: string; label: string; icon: keyof typeof Feather.glyphMap }> = [
  { value: "farm_shop", label: "Farm Shop", icon: "home" },
  { value: "box_scheme", label: "Box Scheme", icon: "package" },
  { value: "farmers_market", label: "Farmers Market", icon: "shopping-bag" },
  { value: "wholesale", label: "Wholesale", icon: "truck" },
  { value: "online", label: "Online", icon: "globe" },
  { value: "restaurant", label: "Restaurant", icon: "coffee" },
];

const UNITS = ["kg", "dozen", "unit", "litre", "bunch", "box", "bag", "jar", "punnet"];
const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "invoice", label: "Invoice" },
];

export default function DirectSaleScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [channel, setChannel] = useState("farm_shop");
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [unitPrice, setUnitPrice] = useState("");
  const [grossValue, setGrossValue] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending" | "overdue">("paid");
  const [customerName, setCustomerName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert("Required", "Please enter the product name.");
      return;
    }
    if (!quantity.trim()) {
      Alert.alert("Required", "Please enter the quantity.");
      return;
    }
    if (!unitPrice.trim()) {
      Alert.alert("Required", "Please enter the unit price.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const qtyNum = parseFloat(quantity);
    const priceNum = parseFloat(unitPrice);
    const calcGross = grossValue.trim() || (
      (!isNaN(qtyNum) && !isNaN(priceNum)) ? (qtyNum * priceNum).toFixed(2) : ""
    );

    const record: DirectSaleRecord = {
      id: generateId(),
      farmId: currentFarm?.id?.toString() ?? "",
      saleDate,
      channel,
      productName: productName.trim(),
      productCategory: productCategory.trim(),
      quantity: quantity.trim(),
      unit,
      unitPrice: unitPrice.trim(),
      grossValue: calcGross,
      paymentMethod,
      paymentStatus,
      customerName: customerName.trim(),
      invoiceNumber: invoiceNumber.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.DIRECT_SALE_RECORDS, record);
      await refreshPendingCount();
      Alert.alert("Saved", "Sale recorded and queued for sync.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Failed to save sale record. Please try again.");
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
          <Text style={styles.headerTitle}>Record Direct Sale</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionLabel}>Sales Channel</Text>
          <View style={styles.channelGrid}>
            {CHANNELS.map(c => (
              <Pressable
                key={c.value}
                style={[styles.channelCard, channel === c.value && styles.channelCardActive]}
                onPress={() => setChannel(c.value)}
              >
                <Feather name={c.icon} size={18} color={channel === c.value ? "#fff" : colors.textSecondary} />
                <Text style={[styles.channelText, channel === c.value && styles.channelTextActive]}>
                  {c.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input label="Sale Date *" value={saleDate} onChangeText={setSaleDate} placeholder="YYYY-MM-DD" maxDate="today" />
          <Input label="Product Name *" value={productName} onChangeText={setProductName} placeholder="e.g. Organic Carrots, Free Range Eggs" />
          <Input label="Product Category" value={productCategory} onChangeText={setProductCategory} placeholder="e.g. Vegetables, Meat, Eggs" />

          <Input label="Quantity *" value={quantity} onChangeText={setQuantity} placeholder="0.00" keyboardType="decimal-pad" />

          <Text style={styles.sectionLabel}>Unit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.sm }}>
            {UNITS.map(u => (
              <Pressable
                key={u}
                style={[styles.unitPill, unit === u && styles.unitPillActive]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Input label="Unit Price (£) *" value={unitPrice} onChangeText={setUnitPrice} placeholder="e.g. 2.50" keyboardType="decimal-pad" />
          <Input label="Gross Value (£)" value={grossValue} onChangeText={setGrossValue} placeholder="auto-calculated if blank" keyboardType="decimal-pad" />

          <Text style={styles.sectionLabel}>Payment Method</Text>
          <View style={styles.pillRow}>
            {PAYMENT_METHODS.map(m => (
              <Pressable
                key={m.value}
                style={[styles.pill, paymentMethod === m.value && styles.pillActive]}
                onPress={() => setPaymentMethod(m.value)}
              >
                <Text style={[styles.pillText, paymentMethod === m.value && styles.pillTextActive]}>{m.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Payment Status</Text>
          <View style={styles.pillRow}>
            {(["paid", "pending", "overdue"] as const).map(s => (
              <Pressable
                key={s}
                style={[
                  styles.pill,
                  paymentStatus === s && s === "paid" && styles.pillPaid,
                  paymentStatus === s && s === "pending" && styles.pillPending,
                  paymentStatus === s && s === "overdue" && styles.pillOverdue,
                ]}
                onPress={() => setPaymentStatus(s)}
              >
                <Text style={[styles.pillText, paymentStatus === s && styles.pillTextActive]}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input label="Customer Name" value={customerName} onChangeText={setCustomerName} placeholder="Optional" />
          <Input label="Invoice Number" value={invoiceNumber} onChangeText={setInvoiceNumber} placeholder="Optional" />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional notes…" multiline numberOfLines={3} />

          <Button
            title={saving ? "Saving…" : "Save Sale"}
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
  channelGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.sm },
  channelCard: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  channelCardActive: { backgroundColor: "#0891b2", borderColor: "#0891b2" },
  channelText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  channelTextActive: { color: "#fff" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.sm },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  pillActive: { backgroundColor: "#0891b2", borderColor: "#0891b2" },
  pillPaid: { backgroundColor: "#15803d", borderColor: "#15803d" },
  pillPending: { backgroundColor: "#d97706", borderColor: "#d97706" },
  pillOverdue: { backgroundColor: "#dc2626", borderColor: "#dc2626" },
  pillText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  pillTextActive: { color: "#fff" },
  unitPill: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    marginRight: 6,
  },
  unitPillActive: { backgroundColor: "#0891b2", borderColor: "#0891b2" },
  unitText: { fontFamily: fonts.medium, fontSize: 11, color: colors.textSecondary },
  unitTextActive: { color: "#fff" },
});
