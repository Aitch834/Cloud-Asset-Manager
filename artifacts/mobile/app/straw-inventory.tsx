import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
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
import { useApiStraws } from "@/lib/hooks/useApiStraws";

const SPECIES_OPTIONS = ["Cattle", "Sheep", "Pig", "Goat", "Other"];

function ChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.chipRow}>
      {options.map((o) => (
        <Pressable
          key={o}
          onPress={() => onChange(o)}
          style={[styles.chip, value === o && styles.chipActive]}
        >
          <Text style={[styles.chipText, value === o && styles.chipTextActive]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

type FormState = {
  sireName: string;
  sireBreed: string;
  sireSpecies: string;
  supplierName: string;
  batchNumber: string;
  strawsReceived: string;
  storageLocation: string;
  deliveryDate: string;
  unitCost: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  sireName: "", sireBreed: "", sireSpecies: "Cattle",
  supplierName: "", batchNumber: "", strawsReceived: "",
  storageLocation: "", deliveryDate: "", unitCost: "", notes: "",
};

export default function StrawInventoryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmIdStr = currentFarm?.id ? String(currentFarm.id) : undefined;
  const { straws, loading, fromCache } = useApiStraws(farmIdStr);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const handleSave = async () => {
    if (!form.sireName.trim()) {
      Alert.alert("Required", "Please enter the donor sire name.");
      return;
    }
    if (!form.batchNumber.trim()) {
      Alert.alert("Required", "Please enter the batch / lot number.");
      return;
    }
    if (!form.strawsReceived.trim() || isNaN(Number(form.strawsReceived))) {
      Alert.alert("Required", "Please enter the number of straws received.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const domain =
        process.env.EXPO_PUBLIC_API_URL ||
        (process.env.EXPO_PUBLIC_REPLIT_DEV_DOMAIN
          ? `https://${process.env.EXPO_PUBLIC_REPLIT_DEV_DOMAIN}`
          : "");
      const body = {
        sireName: form.sireName.trim(),
        sireBreed: form.sireBreed.trim() || null,
        sireSpecies: form.sireSpecies,
        supplierName: form.supplierName.trim() || null,
        batchNumber: form.batchNumber.trim(),
        strawsReceived: Number(form.strawsReceived),
        storageLocation: form.storageLocation.trim() || null,
        deliveryDate: form.deliveryDate.trim() || null,
        unitCostPence: form.unitCost.trim() ? Math.round(Number(form.unitCost) * 100) : null,
        notes: form.notes.trim() || null,
      };
      await fetch(`${domain}/api/farms/${currentFarm?.id}/straws`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      Alert.alert("Saved", "Straw delivery logged successfully.");
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch {
      Alert.alert("Error", "Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  function stockLabel(received: number, used: number) {
    const remaining = received - used;
    if (remaining <= 0) return { label: "Out of Stock", bg: colors.errorBg, text: colors.error };
    if (remaining <= 2) return { label: `${remaining} left — Low`, bg: "#fef3c7", text: "#92400e" };
    return { label: `${remaining} remaining`, bg: "#dcfce7", text: "#166534" };
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={[styles.screen, { paddingTop: insets.top }]}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setTimeout(() => setRefreshing(false), 1000);
            }}
          />
        }
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.back}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Straw Inventory</Text>
            <Text style={styles.subtitle}>AI straw deliveries and stock levels</Text>
          </View>
          {!showForm && (
            <Button title="Add" onPress={() => { setForm(EMPTY_FORM); setShowForm(true); }} />
          )}
        </View>

        {fromCache && (
          <View style={styles.cacheNotice}>
            <Feather name="wifi-off" size={13} color="#92400e" />
            <Text style={styles.cacheText}>Offline — showing cached data</Text>
          </View>
        )}

        {/* List view */}
        {!showForm && (
          <>
            {loading && straws.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Loading…</Text>
              </View>
            ) : straws.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="package" size={40} color={colors.border} />
                <Text style={styles.emptyTitle}>No deliveries logged yet</Text>
                <Text style={styles.emptyText}>
                  Log your first straw delivery to start tracking stock. The batch number on the straw label is your key traceability link to the donor animal.
                </Text>
                <Button title="Log First Delivery" onPress={() => setShowForm(true)} />
              </View>
            ) : (
              straws.map((s) => {
                const stock = stockLabel(s.strawsReceived, s.strawsUsed ?? 0);
                return (
                  <View key={s.id} style={styles.card}>
                    <View style={styles.cardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cardName}>{s.sireName}</Text>
                        {s.sireBreed && (
                          <Text style={styles.cardMeta}>{s.sireBreed} · {s.sireSpecies}</Text>
                        )}
                      </View>
                      <View style={[styles.stockBadge, { backgroundColor: stock.bg }]}>
                        <Text style={[styles.stockText, { color: stock.text }]}>{stock.label}</Text>
                      </View>
                    </View>
                    <View style={styles.cardDetails}>
                      <View style={styles.detailRow}>
                        <Feather name="hash" size={12} color={colors.textSecondary} />
                        <Text style={styles.detailText}>{s.batchNumber}</Text>
                      </View>
                      {s.supplierName && (
                        <View style={styles.detailRow}>
                          <Feather name="truck" size={12} color={colors.textSecondary} />
                          <Text style={styles.detailText}>{s.supplierName}</Text>
                        </View>
                      )}
                      {s.storageLocation && (
                        <View style={styles.detailRow}>
                          <Feather name="archive" size={12} color={colors.textSecondary} />
                          <Text style={styles.detailText}>{s.storageLocation}</Text>
                        </View>
                      )}
                      {s.deliveryDate && (
                        <View style={styles.detailRow}>
                          <Feather name="calendar" size={12} color={colors.textSecondary} />
                          <Text style={styles.detailText}>Delivered {s.deliveryDate}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardUsage}>
                      {s.strawsReceived} received · {s.strawsUsed ?? 0} used at AI services
                    </Text>
                  </View>
                );
              })
            )}
          </>
        )}

        {/* Add form */}
        {showForm && (
          <>
            <Text style={styles.sectionTitle}>Donor Details</Text>
            <Input label="Donor Sire Name *" value={form.sireName} onChangeText={(v) => setField("sireName", v)} placeholder="e.g. Cogent Commander" />

            <Text style={styles.label}>Species *</Text>
            <ChipRow options={SPECIES_OPTIONS as string[]} value={form.sireSpecies} onChange={(v) => setField("sireSpecies", v)} />

            <Input
              label="Breed"
              value={form.sireBreed}
              onChangeText={(v) => setField("sireBreed", v)}
              placeholder={
                ({ Cattle: "e.g. Aberdeen Angus", Sheep: "e.g. Suffolk", Pig: "e.g. Large White", Goat: "e.g. Boer" } as Record<string, string>)[form.sireSpecies] ?? "e.g. enter breed"
              }
            />

            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <Input label="Batch / Lot Number *" value={form.batchNumber} onChangeText={(v) => setField("batchNumber", v)} placeholder="As printed on straw label" />
            <Input label="Supplier / AI Centre" value={form.supplierName} onChangeText={(v) => setField("supplierName", v)} placeholder="e.g. Cogent Breeding, Genus ABS" />
            <Input label="Straws Received *" value={form.strawsReceived} onChangeText={(v) => setField("strawsReceived", v)} placeholder="e.g. 10" keyboardType="numeric" />
            <Input label="Storage Location" value={form.storageLocation} onChangeText={(v) => setField("storageLocation", v)} placeholder="e.g. Tank 2, Goblet 3" />
            <Input label="Delivery Date" value={form.deliveryDate} onChangeText={(v) => setField("deliveryDate", v)} placeholder="YYYY-MM-DD" />
            <Input label="Unit Cost (£ each)" value={form.unitCost} onChangeText={(v) => setField("unitCost", v)} placeholder="e.g. 18.50" keyboardType="numeric" />
            <Input label="Notes" value={form.notes} onChangeText={(v) => setField("notes", v)} placeholder="Health cert reference, catalogue page, etc." multiline />

            <View style={styles.actions}>
              <Pressable onPress={() => { setShowForm(false); setForm(EMPTY_FORM); }} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Button title={saving ? "Saving…" : "Save Delivery"} onPress={handleSave} />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg },
  back: { padding: spacing.xs },
  headerText: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  cacheNotice: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: "#fef3c7", borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.md },
  cacheText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#92400e" },
  empty: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.xxxl },
  emptyTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", lineHeight: 20 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginBottom: spacing.sm },
  cardName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  cardMeta: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  stockBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.sm },
  stockText: { fontFamily: fonts.medium, fontSize: fontSize.xs },
  cardDetails: { gap: spacing.xs, marginBottom: spacing.sm },
  detailRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  detailText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  cardUsage: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, borderTopWidth: 1, borderTopColor: colors.borderLight, paddingTop: spacing.sm, marginTop: spacing.xs },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.textSecondary },
  chipTextActive: { color: colors.textInverse },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.md, marginTop: spacing.xl },
  cancelBtn: { justifyContent: "center", paddingHorizontal: spacing.lg },
  cancelText: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.textSecondary },
});
