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
import type { SilageAdditiveRecord } from "@/lib/types";

import { apiFetch } from "@/lib/apiFetch";
const CROP_TYPES = ["Grass Silage", "Maize Silage", "Wholecrop", "Haylage", "Other"];
const ADDITIVE_TYPES = ["Bacterial Inoculant", "Acid-based", "Enzyme", "Other"];

export default function SilageAdditiveScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [stores, setStores] = useState<{ id: number; storeName: string; storeType: string }[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [selectedStoreId, setSelectedStoreId] = useState<number | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [applicationDate, setApplicationDate] = useState(today);
  const [cropType, setCropType] = useState("Grass Silage");
  const [productName, setProductName] = useState("");
  const [additiveType, setAdditiveType] = useState("Bacterial Inoculant");
  const [applicationRate, setApplicationRate] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [appliedBy, setAppliedBy] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!currentFarm?.id) return;
    const controller = new AbortController();
    apiFetch(`/api/farms/${currentFarm.id}/slurry-stores`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      signal: controller.signal,
    })
      .then(r => r.json())
      .then(d => {
        const list = (d.records ?? d ?? []).filter((s: any) => s.storeType === "Silage Clamp");
        setStores(list);
        if (list.length === 1) setSelectedStoreId(list[0].id);
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoadingStores(false);
      });
    return () => controller.abort();
  }, [currentFarm?.id]);

  const selectedStore = stores.find(s => s.id === selectedStoreId);

  const doSave = async () => {
    if (!currentFarm?.id) {
      Alert.alert("No Farm", "Please select a farm first.");
      return;
    }
    if (!applicationDate) {
      Alert.alert("Date Required", "Please enter the application date.");
      return;
    }
    if (!productName.trim()) {
      Alert.alert("Product Required", "Please enter the additive / inoculant product name.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: SilageAdditiveRecord = {
      id: generateId(),
      farmId: String(currentFarm.id),
      storeId: selectedStoreId ? String(selectedStoreId) : "",
      storeName: selectedStore?.storeName ?? "",
      applicationDate,
      cropType,
      productName: productName.trim(),
      additiveType,
      applicationRate: applicationRate.trim(),
      batchNumber: batchNumber.trim(),
      appliedBy: appliedBy.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SILAGE_ADDITIVE_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);

    Alert.alert("Saved", "Additive record saved and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Silage Additive / Inoculant</Text>
            <Text style={styles.subtitle}>Record additive applied at clamp filling</Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Date</Text>
          <Input
            value={applicationDate}
            onChangeText={setApplicationDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        {/* Clamp */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Silage Clamp</Text>
          {loadingStores ? (
            <Text style={styles.hintText}>Loading clamps…</Text>
          ) : stores.length === 0 ? (
            <Text style={styles.hintText}>No silage clamps registered — record will not be linked to a store.</Text>
          ) : (
            <View style={styles.optionRow}>
              {stores.map(s => (
                <Pressable
                  key={s.id}
                  style={[styles.optionPill, selectedStoreId === s.id && styles.optionPillActive]}
                  onPress={() => { setSelectedStoreId(s.id); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.optionPillText, selectedStoreId === s.id && styles.optionPillTextActive]}>
                    {s.storeName}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Crop type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crop Type</Text>
          <View style={styles.optionRow}>
            {CROP_TYPES.map(c => (
              <Pressable
                key={c}
                style={[styles.optionPill, cropType === c && styles.optionPillActive]}
                onPress={() => { setCropType(c); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.optionPillText, cropType === c && styles.optionPillTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Product */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Name</Text>
          <Input
            value={productName}
            onChangeText={setProductName}
            placeholder="e.g. Ecosyl, Magniva, propionic acid"
          />
        </View>

        {/* Additive type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additive Type</Text>
          <View style={styles.optionRow}>
            {ADDITIVE_TYPES.map(t => (
              <Pressable
                key={t}
                style={[styles.optionPill, additiveType === t && styles.optionPillActive]}
                onPress={() => { setAdditiveType(t); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.optionPillText, additiveType === t && styles.optionPillTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Rate & batch */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Rate</Text>
          <Input
            value={applicationRate}
            onChangeText={setApplicationRate}
            placeholder="e.g. 3L/tonne"
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Batch / Lot Number</Text>
          <Input value={batchNumber} onChangeText={setBatchNumber} placeholder="Batch number" />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applied By</Text>
          <Input value={appliedBy} onChangeText={setAppliedBy} placeholder="Operator name" />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Any other observations…"
            multiline
            numberOfLines={3}
          />
        </View>

        <Button
          title={saving ? "Saving…" : "Save Record"}
          onPress={doSave}
          disabled={saving}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  backBtn: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.sm },
  hintText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  optionPill: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: "center",
  },
  optionPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionPillText: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  optionPillTextActive: { color: "#fff" },
  saveBtn: { marginTop: spacing.sm },
});
