import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Platform } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
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
import { kvGet } from "@/lib/database";
import { useApiCrops } from "@/lib/hooks/useApiCrops";

interface SeedBatch {
  id: number;
  cropId: number;
  cropName: string;
  varietyId: number;
  varietyName?: string | null;
  supplierId?: number | null;
  supplierName?: string | null;
  batchNumber: string;
  tgwGrams: string | number;
  bagWeightKg: string | number;
  quantityReceivedKg: string | number;
  quantityRemainingKg: string | number;
  dateReceived?: string | null;
  treatmentNotes?: string | null;
  isActive?: boolean;
}

async function getAuthToken(): Promise<string | null> {
  try {
    if (Platform.OS !== "web") {
      const SecureStore = await import("expo-secure-store");
      const token = await SecureStore.getItemAsync("auth_session_token");
      if (token) return token;
    } else {
      try {
        const token = localStorage.getItem("auth_session_token");
        if (token) return token;
      } catch { }
    }
    const raw = await kvGet("bde_auth_token");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function getTenantSlug(): Promise<string> {
  try {
    const raw = await kvGet("bde_current_farm");
    if (raw) {
      const farm = JSON.parse(raw);
      return farm.tenantSlug || farm.slug || "";
    }
  } catch { }
  return "";
}

async function authedFetch(path: string, farmId: string, options: RequestInit = {}) {
  const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
  const [token, tenantSlug] = await Promise.all([getAuthToken(), getTenantSlug()]);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-tenant-slug": tenantSlug,
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`https://${apiDomain}${path}`, { ...options, headers });
}

function num(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  const n = parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

function fmtDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB");
}

const emptyForm = {
  cropName: "",
  selectedVarietyId: "",
  batchNumber: "",
  tgwGrams: "",
  bagWeightKg: "25",
  quantityReceivedKg: "",
  dateReceived: new Date().toISOString().slice(0, 10),
  treatmentNotes: "",
};

export default function SeedStoreScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id;
  const { crops } = useApiCrops(farmId);

  const [batches, setBatches] = useState<SeedBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [consumingBatch, setConsumingBatch] = useState<SeedBatch | null>(null);
  const [consumeKg, setConsumeKg] = useState("");
  const [consuming, setConsuming] = useState(false);

  const load = useCallback(async () => {
    if (!farmId) return;
    try {
      const res = await authedFetch(`/api/farms/${farmId}/seed-batches`, farmId);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setBatches((data.records ?? []) as SeedBatch[]);
    } catch {
      // silent — keep whatever was already loaded
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [farmId]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const openConsume = (batch: SeedBatch) => {
    setConsumingBatch(batch);
    setConsumeKg("");
  };

  const handleConsume = async () => {
    if (!farmId || !consumingBatch) return;
    const kg = parseFloat(consumeKg);
    if (!consumeKg || isNaN(kg) || kg <= 0) {
      Alert.alert("Invalid amount", "Please enter a positive number of kg to log as used.");
      return;
    }
    const remaining = Number(consumingBatch.quantityRemainingKg ?? 0);
    if (kg > remaining) {
      Alert.alert("Too much", `Only ${remaining.toFixed(0)} kg remaining in this batch.`);
      return;
    }
    setConsuming(true);
    try {
      const res = await authedFetch(`/api/farms/${farmId}/seed-batches/${consumingBatch.id}/consume`, farmId, {
        method: "POST",
        body: JSON.stringify({ amountKg: kg }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setConsumingBatch(null);
      setConsumeKg("");
      await load();
    } catch (e) {
      Alert.alert("Failed", e instanceof Error ? e.message : "Could not log usage. Try again.");
    } finally {
      setConsuming(false);
    }
  };

  const uniqueCrops = crops.filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i);
  const varietiesForCrop = crops.filter(c => c.name === form.cropName);

  const openAdd = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const selectCrop = (cropName: string) => {
    const options = crops.filter(c => c.name === cropName);
    setForm(f => ({
      ...f,
      cropName,
      selectedVarietyId: options.length === 1 ? String(options[0].id) : "",
    }));
  };

  const handleSave = async () => {
    if (!farmId) return;
    const variety = crops.find(c => String(c.id) === form.selectedVarietyId);
    if (!variety || !variety.cropId || !form.batchNumber.trim() || !form.tgwGrams || !form.quantityReceivedKg) {
      Alert.alert(
        "Missing details",
        varietiesForCrop.length > 1 && !form.selectedVarietyId
          ? "Please select a variety."
          : "Crop, variety, batch number, TGW and quantity received are required.",
      );
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const res = await authedFetch(`/api/farms/${farmId}/seed-batches`, farmId, {
        method: "POST",
        body: JSON.stringify({
          cropId: variety.cropId,
          varietyId: variety.id,
          batchNumber: form.batchNumber.trim(),
          tgwGrams: form.tgwGrams,
          bagWeightKg: form.bagWeightKg || "25",
          quantityReceivedKg: form.quantityReceivedKg,
          dateReceived: form.dateReceived || null,
          treatmentNotes: form.treatmentNotes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setFormOpen(false);
      setForm(emptyForm);
      await load();
    } catch {
      Alert.alert("Failed to save", "Could not save this seed batch. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Seed Store</Text>
        <Pressable onPress={openAdd} style={styles.backButton}>
          <Feather name="plus" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : batches.length === 0 ? (
        <View style={styles.centerFill}>
          <Feather name="package" size={28} color={colors.textTertiary} />
          <Text style={styles.emptyTitle}>No seed batches recorded yet</Text>
          <Text style={styles.emptySubtitle}>Log a batch to track TGW and stock as it arrives from suppliers</Text>
          <Button title="Log Seed Batch" onPress={openAdd} style={{ marginTop: spacing.md }} />
        </View>
      ) : (
        <FlatList
          data={batches}
          keyExtractor={(b) => String(b.id)}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: insets.bottom + 40 }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          renderItem={({ item: b }) => {
            const received = num(b.quantityReceivedKg);
            const remaining = num(b.quantityRemainingKg);
            const bagWeight = num(b.bagWeightKg) || 25;
            const bagsRemaining = bagWeight > 0 ? remaining / bagWeight : 0;
            const pctRemaining = received > 0 ? Math.max(0, Math.min(100, (remaining / received) * 100)) : 0;
            const isLow = received > 0 && pctRemaining <= 15 && remaining > 0;
            const isDepleted = remaining <= 0;
            return (
              <View style={[styles.card, isLow && styles.cardLow]}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardCrop}>
                    {b.cropName}{b.varietyName ? ` — ${b.varietyName}` : ""}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                    {isLow && <Feather name="alert-triangle" size={14} color="#f59e0b" />}
                    {!isDepleted && (
                      <Pressable
                        onPress={() => openConsume(b)}
                        style={{ backgroundColor: "#D1FAE5", borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 }}
                      >
                        <Text style={{ fontFamily: fonts.medium, fontSize: 10, color: "#065f46" }}>Log Use</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
                <Text style={styles.cardBatch}>
                  Batch {b.batchNumber}{b.supplierName ? ` · ${b.supplierName}` : ""}
                </Text>

                <View style={styles.statsRow}>
                  <View style={styles.statCell}>
                    <Text style={styles.statValue}>{num(b.tgwGrams).toFixed(1)}g</Text>
                    <Text style={styles.statLabel}>TGW</Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={[styles.statValue, isDepleted && { color: colors.textTertiary }]}>
                      {remaining % 1 === 0 ? remaining.toFixed(0) : remaining.toFixed(1)}kg
                    </Text>
                    <Text style={styles.statLabel}>of {received.toFixed(0)}kg left</Text>
                  </View>
                  <View style={styles.statCell}>
                    <Text style={styles.statValue}>{bagsRemaining.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>bags @ {bagWeight}kg</Text>
                  </View>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${pctRemaining}%`, backgroundColor: isDepleted ? colors.border : isLow ? "#f59e0b" : colors.primary },
                    ]}
                  />
                </View>

                <Text style={styles.cardFooter}>Received {fmtDate(b.dateReceived)}</Text>
                {b.treatmentNotes ? <Text style={styles.cardNotes}>{b.treatmentNotes}</Text> : null}
              </View>
            );
          }}
        />
      )}

      <Modal visible={formOpen} animationType="slide" transparent onRequestClose={() => setFormOpen(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Seed Batch</Text>
              <Pressable onPress={() => setFormOpen(false)}>
                <Feather name="x" size={20} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
              <View style={styles.field}>
                <Text style={styles.label}>Crop *</Text>
                <View style={styles.chipWrap}>
                  {uniqueCrops.map((c) => (
                    <Pressable
                      key={c.id}
                      style={[styles.chip, form.cropName === c.name && styles.chipSelected]}
                      onPress={() => selectCrop(c.name)}
                    >
                      <Text style={[styles.chipText, form.cropName === c.name && styles.chipTextSelected]}>{c.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {form.cropName ? (
                <View style={styles.field}>
                  <Text style={styles.label}>Variety{varietiesForCrop.length > 1 ? " *" : ""}</Text>
                  <View style={styles.chipWrap}>
                    {varietiesForCrop.map((v) => (
                      <Pressable
                        key={v.id}
                        style={[styles.chip, form.selectedVarietyId === String(v.id) && styles.chipSelected]}
                        onPress={() => setForm(f => ({ ...f, selectedVarietyId: String(v.id) }))}
                      >
                        <Text style={[styles.chipText, form.selectedVarietyId === String(v.id) && styles.chipTextSelected]}>
                          {v.variety || "—"}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ) : null}

              <Input label="Batch Number *" placeholder="e.g. SK-2026-0417" value={form.batchNumber} onChangeText={(v) => setForm(f => ({ ...f, batchNumber: v }))} />
              <Input label="TGW (g) *" placeholder="e.g. 48.5" value={form.tgwGrams} onChangeText={(v) => setForm(f => ({ ...f, tgwGrams: v }))} keyboardType="decimal-pad" />
              <Input label="Bag Weight (kg)" value={form.bagWeightKg} onChangeText={(v) => setForm(f => ({ ...f, bagWeightKg: v }))} keyboardType="decimal-pad" />
              <Input label="Quantity Received (kg) *" placeholder="e.g. 1000" value={form.quantityReceivedKg} onChangeText={(v) => setForm(f => ({ ...f, quantityReceivedKg: v }))} keyboardType="decimal-pad" />
              <Input label="Date Received" placeholder="YYYY-MM-DD" value={form.dateReceived} onChangeText={(v) => setForm(f => ({ ...f, dateReceived: v }))} />
              <Input label="Treatment / Notes" placeholder="e.g. Redigo Deter treated" value={form.treatmentNotes} onChangeText={(v) => setForm(f => ({ ...f, treatmentNotes: v }))} multiline numberOfLines={2} />

              <Button title="Log Batch" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal visible={!!consumingBatch} animationType="slide" transparent onRequestClose={() => setConsumingBatch(null)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Stock Used</Text>
              <Pressable onPress={() => setConsumingBatch(null)}>
                <Feather name="x" size={20} color={colors.text} />
              </Pressable>
            </View>
            {consumingBatch && (
              <ScrollView contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.lg }} keyboardShouldPersistTaps="handled">
                <View style={{ backgroundColor: "#F0FDF4", borderRadius: radius.md, padding: spacing.sm }}>
                  <Text style={{ fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: "#065f46" }}>
                    {consumingBatch.cropName}{consumingBatch.varietyName ? ` — ${consumingBatch.varietyName}` : ""}
                  </Text>
                  <Text style={{ fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 }}>
                    Batch {consumingBatch.batchNumber} · {Number(consumingBatch.quantityRemainingKg ?? 0).toFixed(0)} kg remaining
                  </Text>
                </View>
                <Input
                  label="Amount Used (kg) *"
                  placeholder="e.g. 25"
                  value={consumeKg}
                  onChangeText={setConsumeKg}
                  keyboardType="decimal-pad"
                />
                <Button title="Confirm Stock Used" onPress={handleConsume} loading={consuming} style={{ marginTop: spacing.xs }} />
              </ScrollView>
            )}
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  backButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg, gap: spacing.xs },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginTop: spacing.sm },
  emptySubtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardLow: { borderColor: "#f59e0b", borderWidth: 1.5 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardCrop: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  cardBatch: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.sm },
  statCell: {},
  statValue: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text },
  statLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.textTertiary },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.borderLight, overflow: "hidden", marginTop: spacing.sm },
  progressFill: { height: "100%" },
  cardFooter: { fontFamily: fonts.regular, fontSize: 10, color: colors.textTertiary, marginTop: spacing.xs },
  cardNotes: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.xs,
  },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.md,
    maxHeight: "88%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  modalTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  field: { gap: spacing.xs, marginBottom: spacing.xs },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { color: colors.textInverse },
});
