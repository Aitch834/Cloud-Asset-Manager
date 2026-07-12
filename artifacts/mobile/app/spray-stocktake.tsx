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
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import {
  getCachedSprayProducts,
  getCachedStaffMembers,
  getRefCacheSyncedMinsAgo,
  type RefSprayProduct,
  type RefStaffMember,
} from "@/lib/refCache";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

export default function SprayStocktakeScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [systemQtyLitres, setSystemQtyLitres] = useState("");
  const [physicalQtyLitres, setPhysicalQtyLitres] = useState("");
  const [conductedBy, setConductedBy] = useState(user?.name || "");
  const [stocktakeDate, setStocktakeDate] = useState(today);
  const [notes, setNotes] = useState("");

  const [productOptions, setProductOptions] = useState<LookupOption[]>([]);
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  const [productsSyncedMinsAgo, setProductsSyncedMinsAgo] = useState<number | null>(null);
  const [allProducts, setAllProducts] = useState<RefSprayProduct[]>([]);

  useEffect(() => {
    if (!currentFarm?.id) return;
    const farmId = String(currentFarm.id);
    getCachedSprayProducts(farmId).then((products: RefSprayProduct[]) => {
      setAllProducts(products);
      setProductOptions(products.map((p) => ({ id: p.id, label: p.label })));
    });
    getCachedStaffMembers(farmId).then((members: RefStaffMember[]) => {
      setStaffOptions(members.map((m) => ({ id: m.id, label: m.label, sublabel: m.role || undefined })));
    });
    getRefCacheSyncedMinsAgo("spray-products", farmId).then(setProductsSyncedMinsAgo);
  }, [currentFarm?.id]);

  const handleProductSelect = (id: string, label: string) => {
    setProductId(id);
    setProductName(label);
    const found = allProducts.find((p) => p.id === id);
    if (found?.currentStockQuantity != null) {
      setSystemQtyLitres(parseFloat(found.currentStockQuantity).toFixed(2));
    } else {
      setSystemQtyLitres("");
    }
  };

  const physicalNum = parseFloat(physicalQtyLitres);
  const systemNum = parseFloat(systemQtyLitres);
  const variance = !isNaN(physicalNum) && !isNaN(systemNum) ? physicalNum - systemNum : null;
  const varianceLarge = variance !== null && Math.abs(variance) >= 0.5;
  const varianceNegative = variance !== null && variance < 0;

  const handleSave = async () => {
    if (!productName.trim()) {
      Alert.alert("Required", "Please select or enter a spray product.");
      return;
    }
    if (!physicalQtyLitres.trim() || isNaN(physicalNum) || physicalNum < 0) {
      Alert.alert("Required", "Please enter a valid physical quantity in litres.");
      return;
    }

    setSaving(true);

    if (varianceLarge && varianceNegative) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    const record = {
      id: generateId(),
      farmId: String(currentFarm?.id || ""),
      sprayProductId: productId || null,
      productName: productName.trim(),
      systemQtyLitres: systemQtyLitres.trim() || null,
      physicalQtyLitres: physicalQtyLitres.trim(),
      varianceLitres: variance !== null ? variance.toFixed(2) : null,
      conductedBy: conductedBy.trim(),
      stocktakeDate,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SPRAY_STOCK_STOCKTAKES, record);
    await refreshPendingCount();
    setSaving(false);

    const title = varianceLarge && varianceNegative ? "Shortfall Recorded" : "Stocktake Saved";
    const message =
      variance !== null
        ? varianceLarge && varianceNegative
          ? `${Math.abs(variance).toFixed(1)} L shortfall vs system records. Saved and queued for sync.`
          : `Variance: ${variance >= 0 ? "+" : ""}${variance.toFixed(1)} L. Saved and queued for sync.`
        : "Spray stocktake saved offline and queued for sync.";

    Alert.alert(title, message, [{ text: "Done", onPress: () => router.back() }]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Spray Store Stocktake</Text>
            <Text style={styles.subtitle}>Count physical stock and compare against system records</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product</Text>
            <LookupPicker
              label="Spray Product *"
              value={productName}
              options={productOptions}
              onSelect={handleProductSelect}
              placeholder="Select or search products…"
              allowFreeText
              syncedMinsAgo={productsSyncedMinsAgo}
              emptyMessage="No products cached — sync when online to populate, or type manually."
              icon="droplet"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Stock Quantities</Text>
            <Input
              label="Physical Qty (litres) *"
              value={physicalQtyLitres}
              onChangeText={setPhysicalQtyLitres}
              placeholder="e.g. 18.5"
              keyboardType="decimal-pad"
            />
            <View style={styles.systemQtyRow}>
              <View style={{ flex: 1 }}>
                <Input
                  label="System Qty (litres)"
                  value={systemQtyLitres}
                  onChangeText={setSystemQtyLitres}
                  placeholder="Auto-filled from product record"
                  keyboardType="decimal-pad"
                />
              </View>
              {systemQtyLitres !== "" && (
                <View style={styles.systemQtyBadge}>
                  <Feather name="database" size={12} color={colors.info} />
                  <Text style={styles.systemQtyBadgeText}>System</Text>
                </View>
              )}
            </View>

            {variance !== null && (
              <View
                style={[
                  styles.varianceCard,
                  {
                    borderColor: varianceLarge
                      ? varianceNegative ? colors.error : colors.accent
                      : colors.success + "66",
                    backgroundColor: varianceLarge
                      ? varianceNegative ? colors.error + "12" : colors.accent + "12"
                      : colors.success + "10",
                  },
                ]}
              >
                <Feather
                  name={varianceLarge ? (varianceNegative ? "alert-triangle" : "info") : "check-circle"}
                  size={18}
                  color={varianceLarge ? (varianceNegative ? colors.error : colors.accent) : colors.success}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.varianceTitle,
                      { color: varianceLarge ? (varianceNegative ? colors.error : colors.accent) : colors.success },
                    ]}
                  >
                    {varianceLarge && varianceNegative
                      ? "Shortfall — Investigate"
                      : varianceLarge
                      ? "Surplus — Check Records"
                      : "Within Tolerance"}
                  </Text>
                  <Text style={styles.varianceDetail}>
                    {variance >= 0 ? "+" : ""}
                    {variance.toFixed(1)} L variance
                    {varianceLarge && varianceNegative
                      ? " — check for unrecorded applications or spillage"
                      : varianceLarge
                      ? " — check for unrecorded deliveries or returns"
                      : " — within normal measurement tolerance"}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <LookupPicker
              label="Conducted By"
              value={conductedBy}
              options={staffOptions}
              onSelect={(_id, label) => setConductedBy(label)}
              placeholder="Name of person conducting the stocktake"
              allowFreeText
              icon="user"
            />
            <Input
              label="Stocktake Date"
              value={stocktakeDate}
              onChangeText={setStocktakeDate}
              placeholder="YYYY-MM-DD"
              maxDate="today"
            />
            <Input
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Any observations, condition of containers, actions taken…"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.section}>
            <Button
              title={saving ? "Saving…" : "Save Stocktake"}
              onPress={handleSave}
              disabled={saving}
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
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  systemQtyRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
  },
  systemQtyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: "#eff6ff",
    marginBottom: spacing.md,
  },
  systemQtyBadgeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.info,
  },
  varianceCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  varianceTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, marginBottom: 2 },
  varianceDetail: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, lineHeight: 16 },
});
