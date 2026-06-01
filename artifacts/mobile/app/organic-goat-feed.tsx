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
  Switch,
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

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

const FEED_TYPES = ["Grazed Pasture", "Conserved Forage", "Concentrate", "Mineral / Supplement", "Total Mixed Ration", "Browse", "Other"];

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: colors.borderLight, true: "#15803d" }} thumbColor="#fff" />
    </View>
  );
}

export default function OrganicGoatFeedScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [recordDate, setRecordDate] = useState(todayDate());
  const [flockGroup, setFlockGroup] = useState("");
  const [feedType, setFeedType] = useState("");
  const [feedProductName, setFeedProductName] = useState("");
  const [supplier, setSupplier] = useState("");
  const [supplierApprovalNumber, setSupplierApprovalNumber] = useState("");
  const [isOrganicApproved, setIsOrganicApproved] = useState(true);
  const [quantityKg, setQuantityKg] = useState("");
  const [organicPercentage, setOrganicPercentage] = useState("");
  const [poReference, setPoReference] = useState("");
  const [grnReference, setGrnReference] = useState("");
  const [certifierApprovalRef, setCertifierApprovalRef] = useState("");
  const [derogationReference, setDerogationReference] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!feedProductName.trim()) {
      Alert.alert("Feed product required", "Please enter the feed product name.");
      return;
    }
    if (!feedType.trim()) {
      Alert.alert("Feed type required", "Please select the feed type.");
      return;
    }
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const payload = {
        id: generateId(),
        farmId: currentFarm?.id,
        type: "organic-goat-feed",
        recordDate,
        flockGroup: flockGroup || null,
        feedType,
        feedProductName,
        supplier: supplier || null,
        supplierApprovalNumber: supplierApprovalNumber || null,
        isOrganicApproved,
        quantityKg: quantityKg || null,
        organicPercentage: organicPercentage || null,
        poReference: poReference || null,
        grnReference: grnReference || null,
        certifierApprovalRef: certifierApprovalRef || null,
        derogationReference: derogationReference || null,
        notes: notes || null,
        syncEndpoint: `/api/farms/${currentFarm?.id}/organic-goat-dairy/feed`,
        syncMethod: "POST",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, payload);
      await refreshPendingCount();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Feed record saved",
        `${feedProductName} recorded for ${recordDate}. Will sync when connected.`,
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch {
      Alert.alert("Error", "Failed to save the record. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Organic Goat Feed Record</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Feed Details</Text>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Record Date *</Text>
            <Input value={recordDate} onChangeText={setRecordDate} placeholder="YYYY-MM-DD" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Quantity (kg)</Text>
            <Input value={quantityKg} onChangeText={setQuantityKg} placeholder="e.g. 250" keyboardType="decimal-pad" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Feed Product Name *</Text>
          <Input value={feedProductName} onChangeText={setFeedProductName} placeholder="e.g. Organic Goat Dairy Nuts" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Herd / Group</Text>
          <Input value={flockGroup} onChangeText={setFlockGroup} placeholder="e.g. Does — milkers" />
        </View>

        <Text style={styles.sectionTitle}>Feed Type *</Text>
        <View style={styles.chips}>
          {FEED_TYPES.map(t => (
            <Chip key={t} label={t} selected={feedType === t} onPress={() => setFeedType(t)} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Organic Status</Text>

        <ToggleRow label="Certified organic / approved feed" value={isOrganicApproved} onChange={setIsOrganicApproved} />

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Organic %</Text>
            <Input value={organicPercentage} onChangeText={setOrganicPercentage} placeholder="e.g. 100" keyboardType="decimal-pad" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Certifier Approval Ref</Text>
            <Input value={certifierApprovalRef} onChangeText={setCertifierApprovalRef} placeholder="e.g. SA/AP/12345" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Derogation Reference</Text>
          <Input value={derogationReference} onChangeText={setDerogationReference} placeholder="If feed used under derogation" />
        </View>

        <Text style={styles.sectionTitle}>Supplier & References</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Supplier</Text>
          <Input value={supplier} onChangeText={setSupplier} placeholder="e.g. Organic Feed Co Ltd" />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1, marginRight: spacing.sm }]}>
            <Text style={styles.label}>Supplier Approval No.</Text>
            <Input value={supplierApprovalNumber} onChangeText={setSupplierApprovalNumber} placeholder="Organic cert number" />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>GRN Reference</Text>
            <Input value={grnReference} onChangeText={setGrnReference} placeholder="Goods received note" />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Purchase Order Reference</Text>
          <Input value={poReference} onChangeText={setPoReference} placeholder="PO number" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes</Text>
          <Input value={notes} onChangeText={setNotes} placeholder="Any additional notes" multiline numberOfLines={3} />
        </View>

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
  chipSelected: { backgroundColor: "#15803d", borderColor: "#15803d" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextSelected: { color: "#fff" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight, marginBottom: spacing.xs },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  saveBtn: { marginTop: spacing.md },
});
