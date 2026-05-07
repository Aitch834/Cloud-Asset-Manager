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
import { createPurchaseOrder } from "@/lib/hooks/useApiPurchaseOrders";

interface LineItem {
  id: string;
  description: string;
  quantityOrdered: string;
  unitPricePence: string;
}

function generateLineId() {
  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function RaisePurchaseOrderScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const [saving, setSaving] = useState(false);

  const [supplierName, setSupplierName] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { id: generateLineId(), description: "", quantityOrdered: "", unitPricePence: "" },
  ]);

  const addLine = () => {
    setLines((prev) => [...prev, { id: generateLineId(), description: "", quantityOrdered: "", unitPricePence: "" }]);
  };

  const removeLine = (id: string) => {
    if (lines.length === 1) {
      Alert.alert("Required", "At least one line item is required.");
      return;
    }
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const updateLine = (id: string, field: keyof LineItem, value: string) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleSave = async () => {
    if (!supplierName.trim()) {
      Alert.alert("Required", "Please enter a supplier name.");
      return;
    }

    const validLines = lines.filter((l) => l.description.trim());
    if (validLines.length === 0) {
      Alert.alert("Required", "Please add at least one line item with a description.");
      return;
    }

    if (!currentFarm?.id) {
      Alert.alert("Error", "No farm selected.");
      return;
    }

    setSaving(true);

    const apiLines = validLines.map((l) => ({
      description: l.description.trim(),
      quantityOrdered: parseFloat(l.quantityOrdered) || 1,
      unitPricePence: l.unitPricePence
        ? Math.round(parseFloat(l.unitPricePence) * 100)
        : null,
    }));

    const result = await createPurchaseOrder(currentFarm.id, {
      supplierName: supplierName.trim(),
      expectedDeliveryDate: expectedDeliveryDate.trim() || undefined,
      notes: notes.trim() || undefined,
      submittedByName: user?.name || undefined,
      status: "draft",
      lines: apiLines,
    });

    setSaving(false);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Purchase Order Created",
        `${result.poNumber} has been saved as a draft. Open it on the dashboard to send it to your supplier or submit it for approval.`,
        [{ text: "Done", onPress: () => router.replace("/purchase-orders") }],
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", result.error || "Failed to create purchase order. Please check your connection and try again.");
    }
  };

  const estimatedTotal = lines.reduce((sum, l) => {
    const qty = parseFloat(l.quantityOrdered) || 0;
    const price = parseFloat(l.unitPricePence) || 0;
    return sum + qty * price;
  }, 0);

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
          <Text style={styles.title}>Raise Purchase Order</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Supplier & Delivery</Text>
            <Input
              label="Supplier Name"
              value={supplierName}
              onChangeText={setSupplierName}
              placeholder="e.g. Massey Agri Supplies Ltd"
              autoCapitalize="words"
            />
            <Input
              label="Expected Delivery Date (optional)"
              value={expectedDeliveryDate}
              onChangeText={setExpectedDeliveryDate}
              placeholder="DD/MM/YYYY"
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Line Items</Text>
              <Pressable onPress={addLine} style={styles.addLineBtn}>
                <Feather name="plus" size={14} color={colors.primary} />
                <Text style={styles.addLineBtnText}>Add line</Text>
              </Pressable>
            </View>

            {lines.map((line, index) => (
              <View key={line.id} style={styles.lineCard}>
                <View style={styles.lineCardHeader}>
                  <Text style={styles.lineLabel}>Line {index + 1}</Text>
                  <Pressable onPress={() => removeLine(line.id)} style={styles.removeLineBtn}>
                    <Feather name="x" size={16} color={colors.textTertiary} />
                  </Pressable>
                </View>
                <Input
                  label="Product / Description"
                  value={line.description}
                  onChangeText={(v) => updateLine(line.id, "description", v)}
                  placeholder="e.g. Fertiliser 28% liquid N — 1000 L IBC"
                  autoCapitalize="sentences"
                />
                <View style={styles.lineRow}>
                  <View style={styles.lineHalf}>
                    <Input
                      label="Quantity"
                      value={line.quantityOrdered}
                      onChangeText={(v) => updateLine(line.id, "quantityOrdered", v)}
                      placeholder="1"
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={styles.lineHalf}>
                    <Input
                      label="Unit Price (£)"
                      value={line.unitPricePence}
                      onChangeText={(v) => updateLine(line.id, "unitPricePence", v)}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </View>
            ))}

            {estimatedTotal > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Estimated Total</Text>
                <Text style={styles.totalValue}>
                  £{estimatedTotal.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Input
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Delivery instructions, account reference, urgency…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.infoBox}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={styles.infoText}>
              The order will be saved as a draft. If any product requires manager approval, it will be placed in Awaiting Approval status automatically. Open it on the dashboard to send it to your supplier.
            </Text>
          </View>

          <View style={styles.section}>
            <Button
              title={saving ? "Creating Order…" : "Create Purchase Order"}
              onPress={handleSave}
              disabled={saving}
            />
          </View>

          <View style={{ height: 80 }} />
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
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  addLineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.primary + "15",
    borderRadius: radius.sm,
  },
  addLineBtnText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  lineCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  lineCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  lineLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  removeLineBtn: { padding: 2 },
  lineRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  lineHalf: { flex: 1 },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + "30",
  },
  totalLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: fontSize.md,
    color: colors.primary,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.primary + "10",
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
