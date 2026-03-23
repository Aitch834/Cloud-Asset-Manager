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
import type { CarbonEntry } from "@/lib/types";

type Category = CarbonEntry["category"];

const CATEGORIES: { key: Category; label: string; icon: string; color: string; unit: string }[] = [
  { key: "enteric_fermentation", label: "Enteric Fermentation", icon: "wind", color: "#16a34a", unit: "head/year" },
  { key: "manure", label: "Manure Management", icon: "droplet", color: "#92400e", unit: "head/year" },
  { key: "fuel_energy", label: "Fuel & Energy", icon: "zap", color: "#d97706", unit: "litres or kWh" },
  { key: "fertiliser", label: "Fertiliser Use", icon: "activity", color: "#0891b2", unit: "kg N applied" },
  { key: "imported_feed", label: "Imported Feed", icon: "package", color: "#7c3aed", unit: "tonnes" },
  { key: "crop_residue", label: "Crop Residue / Burning", icon: "layers", color: "#dc2626", unit: "tonnes" },
  { key: "land_use", label: "Land Use Change", icon: "map", color: "#059669", unit: "hectares" },
  { key: "waste", label: "Waste Disposal", icon: "trash-2", color: "#6b7280", unit: "tonnes" },
  { key: "renewable_energy", label: "Renewable Energy (offset)", icon: "sun", color: "#f59e0b", unit: "kWh generated" },
  { key: "other", label: "Other Source", icon: "more-horizontal", color: colors.textSecondary, unit: "unit" },
];

const EMISSION_FACTOR_SOURCES = ["IPCC 2019", "AHDB Carbon Calculator", "Agrecalc", "Cool Farm Tool", "Farm Carbon Toolkit", "Custom / measured", "Other"];

export default function CarbonEntryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const currentYear = new Date().getFullYear().toString();

  const [recordYear, setRecordYear] = useState(currentYear);
  const [category, setCategory] = useState<Category>("fuel_energy");
  const [sourceDescription, setSourceDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [emissionFactorSource, setEmissionFactorSource] = useState("AHDB Carbon Calculator");
  const [co2eKg, setCo2eKg] = useState("");
  const [notes, setNotes] = useState("");

  const selectedCategory = CATEGORIES.find((c) => c.key === category);

  useEffect(() => {
    if (selectedCategory) setUnit(selectedCategory.unit);
  }, [category]);

  const handleSave = async () => {
    if (!sourceDescription.trim() || !quantity.trim()) {
      Alert.alert("Required Fields", "Please enter the source description and quantity.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: CarbonEntry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      recordYear,
      category,
      sourceDescription: sourceDescription.trim(),
      quantity: quantity.trim(),
      unit: unit.trim(),
      emissionFactorSource: emissionFactorSource.trim(),
      co2eKg: co2eKg.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.CARBON_ENTRIES, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Carbon entry saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Carbon & Sustainability Entry</Text>
            <Text style={styles.subtitle}>Emission sources, offsets & footprint data</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.infoBanner}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={styles.infoText}>Data entered here feeds your farm carbon footprint calculator. Each entry should represent a single emission source or offset for the farm year.</Text>
          </View>

          <Text style={styles.sectionTitle}>Farm Year</Text>
          <Input label="Record Year" value={recordYear} onChangeText={setRecordYear} placeholder="e.g. 2025" keyboardType="numeric" />

          <Text style={styles.sectionTitle}>Emission Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => (
              <Pressable key={c.key} onPress={() => setCategory(c.key)} style={[styles.categoryCard, category === c.key && { borderColor: c.color, backgroundColor: c.color + "15" }]}>
                <Feather name={c.icon as any} size={18} color={category === c.key ? c.color : colors.textSecondary} />
                <Text style={[styles.categoryLabel, category === c.key && { color: c.color, fontFamily: fonts.semiBold }]}>{c.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Source Details</Text>
          <Input label="Source Description *" value={sourceDescription} onChangeText={setSourceDescription} placeholder={`e.g. Diesel — tractors, ${selectedCategory?.unit || "quantity"}`} />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Quantity *" value={quantity} onChangeText={setQuantity} placeholder="Amount" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Unit" value={unit} onChangeText={setUnit} placeholder={selectedCategory?.unit || "unit"} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Carbon Factor</Text>
          <Text style={styles.label}>Emission Factor Source</Text>
          <View style={styles.chipRow}>
            {EMISSION_FACTOR_SOURCES.map((s) => (
              <Pressable key={s} onPress={() => setEmissionFactorSource(s)} style={[styles.chip, emissionFactorSource === s && styles.chipActive]}>
                <Text style={[styles.chipText, emissionFactorSource === s && styles.chipTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <Input label="CO₂e (kg) — if known" value={co2eKg} onChangeText={setCo2eKg} placeholder="Leave blank if calculated by tool" keyboardType="decimal-pad" />

          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Additional context or assumptions…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Carbon Entry"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, gap: spacing.md },
  backButton: { padding: spacing.xs },
  title: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: colors.primary + "10", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary + "30" },
  infoText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  categoryCard: { width: "48%", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: spacing.xs, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  categoryLabel: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.text, textAlign: "center", lineHeight: 16 },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  saveButton: { marginTop: spacing.lg },
});
