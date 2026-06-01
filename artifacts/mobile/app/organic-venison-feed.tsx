import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";

function todayDate() { return new Date().toISOString().split("T")[0]; }

const PRODUCT_TYPES = ["Concentrate feed", "Hay / silage", "Mineral lick / salt block", "Liquid supplement", "Vitamin / mineral premix", "Drench", "Other"];
const APPROVAL_STATUSES = [
  "Certified Organic",
  "Approved for Organic Use",
  "Derogation Required",
  "Not Permitted",
];

const CHIP_COLOR = "#0f766e";

function Chip({ label, selected, onPress, chipColor }: { label: string; selected: boolean; onPress: () => void; chipColor?: string }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && { backgroundColor: chipColor ?? CHIP_COLOR, borderColor: chipColor ?? CHIP_COLOR }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function OrganicVenisonFeedScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [applicationDate, setApplicationDate] = useState(todayDate());
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [organicApprovalStatus, setOrganicApprovalStatus] = useState("Certified Organic");
  const [certifierApprovalReference, setCertifierApprovalReference] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [areaOrHerd, setAreaOrHerd] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [notes, setNotes] = useState("");

  const needsCertifierRef = organicApprovalStatus === "Approved for Organic Use" || organicApprovalStatus === "Derogation Required";
  const isNotPermitted = organicApprovalStatus === "Not Permitted";

  const handleSave = async () => {
    if (!applicationDate.trim()) { Alert.alert("Date required", "Please enter the application date."); return; }
    if (!productName.trim()) { Alert.alert("Product required", "Please enter the product name."); return; }
    if (isNotPermitted) { Alert.alert("Not Permitted", "This product is not permitted for use on an organic holding under UK Organic Regulations. Do not use it."); return; }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "organic-venison-feed",
        applicationDate,
        productName,
        productType: productType || null,
        organicApprovalStatus,
        certifierApprovalReference: certifierApprovalReference || null,
        quantityKg: quantityKg || null,
        areaOrHerd: areaOrHerd || null,
        supplierName: supplierName || null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/organic-venison/feed-supplements`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Feed record saved", "Will sync when connected.", [{ text: "Done", onPress: () => router.back() }]);
    } catch {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Save failed", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.text} /></Pressable>
        <Text style={styles.headerTitle}>Organic Venison Feed Record</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.infoBox}>
          <Feather name="info" size={14} color={CHIP_COLOR} />
          <Text style={styles.infoText}>All supplementary feed and mineral inputs must be documented. Products not fully certified organic must have prior certifier approval or a derogation before use.</Text>
        </View>

        <Text style={styles.sectionTitle}>Product Details</Text>
        <View style={styles.field}>
          <Text style={styles.label}>Product Name *</Text>
          <Input value={productName} onChangeText={setProductName} placeholder="e.g. Organic Mineral Lick Block" />
        </View>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Date Applied / Supplied *</Text>
            <Input value={applicationDate} onChangeText={setApplicationDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Supplier</Text>
            <Input value={supplierName} onChangeText={setSupplierName} placeholder="Supplier name" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Product Type</Text>
        <View style={styles.chips}>
          {PRODUCT_TYPES.map((t) => <Chip key={t} label={t} selected={productType === t} onPress={() => { Haptics.selectionAsync(); setProductType(t); }} />)}
        </View>

        <Text style={styles.sectionTitle}>Organic Approval Status *</Text>
        <View style={styles.chips}>
          {APPROVAL_STATUSES.map((s) => (
            <Chip key={s} label={s} selected={organicApprovalStatus === s}
              onPress={() => { Haptics.selectionAsync(); setOrganicApprovalStatus(s); }}
              chipColor={s === "Certified Organic" ? "#16a34a" : s === "Not Permitted" ? "#dc2626" : s === "Derogation Required" ? "#d97706" : CHIP_COLOR} />
          ))}
        </View>
        {isNotPermitted && (
          <View style={styles.alertBox}>
            <Feather name="alert-triangle" size={14} color="#dc2626" />
            <Text style={styles.alertText}>This product is NOT PERMITTED under UK Organic Regulations. It must not be used on an organic holding.</Text>
          </View>
        )}
        {needsCertifierRef && (
          <View style={styles.field}>
            <Text style={styles.label}>Certifier Approval Reference {organicApprovalStatus === "Approved for Organic Use" ? "*" : "(Derogation Case Ref)"}</Text>
            <Input value={certifierApprovalReference} onChangeText={setCertifierApprovalReference} placeholder="e.g. SA/2025/0012 or DERG-2025-001" />
          </View>
        )}

        <Text style={styles.sectionTitle}>Quantity & Application</Text>
        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Quantity (kg)</Text>
            <Input value={quantityKg} onChangeText={setQuantityKg} keyboardType="decimal-pad" placeholder="0.0" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Area / Herd Reference</Text>
            <Input value={areaOrHerd} onChangeText={setAreaOrHerd} placeholder="e.g. North Deer Park / Herd A" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <Input value={notes} onChangeText={setNotes} placeholder="Additional notes" multiline numberOfLines={3} />

        <Button title={saving ? "Saving…" : "Save Feed Record"} onPress={handleSave} disabled={saving} style={styles.saveBtn} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.surface },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.xs },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: "row" },
  field: { marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight, backgroundColor: colors.surface },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  infoBox: { flexDirection: "row", gap: spacing.xs, backgroundColor: "#ccfbf1", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, alignItems: "flex-start" },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#134e4a", flex: 1 },
  alertBox: { flexDirection: "row", gap: spacing.xs, backgroundColor: "#fee2e2", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, alignItems: "flex-start" },
  alertText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: "#991b1b", flex: 1 },
  saveBtn: { marginTop: spacing.md },
});
