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
  TextInput,
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

type SubcatDef = { label: string; unit: string; factor?: number; overrideScope?: string };
type CatDef = {
  key: CarbonEntry["category"];
  label: string;
  icon: string;
  color: string;
  scope: string;
  subcategories: SubcatDef[];
};

const EMISSION_TAXONOMY: CatDef[] = [
  {
    key: "fuel_energy",
    label: "Fuel & Energy",
    icon: "zap",
    color: "#d97706",
    scope: "Scope 1",
    subcategories: [
      { label: "Red diesel (Gas oil)", unit: "litres", factor: 0.002557 },
      { label: "White diesel (DERV)", unit: "litres", factor: 0.002542 },
      { label: "Petrol", unit: "litres", factor: 0.002154 },
      { label: "LPG", unit: "litres", factor: 0.001566 },
      { label: "Natural gas", unit: "kWh", factor: 0.000183 },
      { label: "Kerosene (heating)", unit: "litres", factor: 0.002530 },
      { label: "Grid electricity (Scope 2)", unit: "kWh", factor: 0.000207, overrideScope: "Scope 2" },
      { label: "Biogas / biomethane", unit: "kWh", factor: 0.000010 },
    ],
  },
  {
    key: "enteric_fermentation",
    label: "Enteric Fermentation",
    icon: "wind",
    color: "#16a34a",
    scope: "Scope 1",
    subcategories: [
      { label: "Dairy cows", unit: "head·year", factor: 1.90 },
      { label: "Beef cattle", unit: "head·year", factor: 1.20 },
      { label: "Sheep", unit: "head·year", factor: 0.083 },
      { label: "Pigs", unit: "head·year", factor: 0.035 },
      { label: "Poultry", unit: "head·year", factor: 0.001 },
    ],
  },
  {
    key: "manure",
    label: "Livestock Manure",
    icon: "droplet",
    color: "#92400e",
    scope: "Scope 1",
    subcategories: [
      { label: "Dairy cows", unit: "head·year", factor: 0.960 },
      { label: "Beef cattle", unit: "head·year", factor: 0.460 },
      { label: "Sheep", unit: "head·year", factor: 0.032 },
      { label: "Pigs", unit: "head·year", factor: 0.420 },
      { label: "Poultry (broilers)", unit: "head·year", factor: 0.006 },
      { label: "Cattle slurry storage", unit: "m³", factor: 0.0015 },
    ],
  },
  {
    key: "fertiliser",
    label: "Soil & Fertiliser N₂O",
    icon: "activity",
    color: "#0891b2",
    scope: "Scope 1",
    subcategories: [
      { label: "Synthetic N fertiliser — direct N₂O", unit: "kg N", factor: 0.00440 },
      { label: "Organic N (slurry/FYM) — direct N₂O", unit: "kg N", factor: 0.00220 },
      { label: "Crop residues — direct N₂O", unit: "kg N", factor: 0.00220 },
      { label: "Indirect N₂O (leaching & run-off)", unit: "kg N", factor: 0.00075 },
    ],
  },
  {
    key: "land_use",
    label: "Land Use Change",
    icon: "map",
    color: "#059669",
    scope: "Scope 1",
    subcategories: [
      { label: "Peat drainage — arable", unit: "ha", factor: 10.50 },
      { label: "Peat drainage — grassland", unit: "ha", factor: 7.00 },
      { label: "Deforestation", unit: "ha", factor: 55.00 },
    ],
  },
  {
    key: "imported_feed",
    label: "Purchased Inputs",
    icon: "package",
    color: "#7c3aed",
    scope: "Scope 3",
    subcategories: [
      { label: "Synthetic N fertiliser (manufacture)", unit: "kg", factor: 0.00448 },
      { label: "Compound fertiliser (manufacture)", unit: "kg", factor: 0.00200 },
      { label: "Pesticides / agrochemicals", unit: "kg a.i.", factor: 0.00850 },
      { label: "Purchased animal feed", unit: "tonne", factor: 0.45 },
      { label: "Lime / ground limestone", unit: "tonne", factor: 0.140 },
      { label: "Plastic film & packaging", unit: "kg", factor: 0.00320 },
    ],
  },
  {
    key: "crop_residue",
    label: "Transport",
    icon: "truck",
    color: "#dc2626",
    scope: "Scope 3",
    subcategories: [
      { label: "Road haulage — HGV", unit: "tonne·km", factor: 0.0000820 },
      { label: "Road haulage — rigid lorry", unit: "tonne·km", factor: 0.0001100 },
      { label: "Employee car travel", unit: "km", factor: 0.0001700 },
      { label: "Air freight", unit: "tonne·km", factor: 0.0006020 },
    ],
  },
  {
    key: "waste",
    label: "Buildings & Other",
    icon: "home",
    color: "#6b7280",
    scope: "Scope 3",
    subcategories: [
      { label: "Concrete (embodied carbon)", unit: "tonne", factor: 0.1070 },
      { label: "Steel (embodied carbon)", unit: "tonne", factor: 1.770 },
      { label: "Timber (embodied carbon)", unit: "m³", factor: 0.0580 },
      { label: "Waste to landfill", unit: "tonne", factor: 0.4670 },
      { label: "Water consumption", unit: "m³", factor: 0.000149 },
      { label: "Refrigerant leak — HFC-134a", unit: "kg", factor: 1.300 },
      { label: "Refrigerant leak — R410A", unit: "kg", factor: 2.088 },
    ],
  },
  {
    key: "other",
    label: "Other / Manual",
    icon: "more-horizontal",
    color: "#9ca3af",
    scope: "Scope 3",
    subcategories: [
      { label: "Other (manual entry)", unit: "unit" },
    ],
  },
];

const FACTOR_SOURCES = [
  "DEFRA UK GHG Conversion Factors 2024",
  "DEFRA UK GHG Conversion Factors 2023",
  "IPCC 2019 Guidelines",
  "AHDB Carbon Calculator",
  "Agrecalc",
  "Cool Farm Tool",
  "Farm Carbon Toolkit",
  "Other / manual",
];

export default function CarbonEntryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const currentYear = new Date().getFullYear().toString();
  const [recordYear, setRecordYear] = useState(currentYear);
  const [category, setCategory] = useState<CarbonEntry["category"]>("fuel_energy");
  const [subcategory, setSubcategory] = useState("");
  const [scope, setScope] = useState("Scope 1");
  const [unit, setUnit] = useState("litres");
  const [quantity, setQuantity] = useState("");
  const [tonnesCo2e, setTonnesCo2e] = useState("");
  const [emissionFactorSource, setEmissionFactorSource] = useState("DEFRA UK GHG Conversion Factors 2024");
  const [notes, setNotes] = useState("");

  const catDef = EMISSION_TAXONOMY.find(c => c.key === category)!;
  const subcatDef = catDef?.subcategories.find(s => s.label === subcategory) ?? null;

  useEffect(() => {
    setSubcategory("");
    setUnit("");
    setScope(catDef?.scope ?? "Scope 1");
    setTonnesCo2e("");
    setQuantity("");
  }, [category]);

  const handleSubcategorySelect = (sub: SubcatDef) => {
    setSubcategory(sub.label);
    setUnit(sub.unit);
    setScope(sub.overrideScope ?? catDef?.scope ?? "Scope 1");
    if (sub.factor != null && quantity) {
      const qty = parseFloat(quantity);
      if (!isNaN(qty)) setTonnesCo2e((qty * sub.factor).toFixed(4));
    }
  };

  const handleQuantityChange = (v: string) => {
    setQuantity(v);
    const qty = parseFloat(v);
    if (!isNaN(qty) && subcatDef?.factor != null) {
      setTonnesCo2e((qty * subcatDef.factor).toFixed(4));
    }
  };

  const handleSave = async () => {
    if (!subcategory) {
      Alert.alert("Required", "Please select an emission subcategory.");
      return;
    }
    if (!quantity.trim()) {
      Alert.alert("Required", "Please enter the quantity.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const record: CarbonEntry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      recordYear,
      category,
      sourceDescription: subcategory,
      quantity: quantity.trim(),
      unit: unit.trim(),
      emissionFactorSource,
      co2eKg: tonnesCo2e ? (parseFloat(tonnesCo2e) * 1000).toFixed(1) : "",
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };
    await appendToList(STORAGE_KEYS.CARBON_ENTRIES, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Emission record saved and queued for sync.", [
      { text: "Add Another", onPress: () => { setSubcategory(""); setQuantity(""); setTonnesCo2e(""); setNotes(""); } },
      { text: "Done", onPress: () => router.back() },
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
            <Text style={styles.title}>GHG Emission Entry</Text>
            <Text style={styles.subtitle}>DEFRA 2024 conversion factors · tCO₂e</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.infoBanner}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text style={styles.infoText}>Select a category and subcategory — tCO₂e is auto-calculated using DEFRA 2024 factors where available.</Text>
          </View>

          <Input label="Record Year" value={recordYear} onChangeText={setRecordYear} keyboardType="numeric" />

          <Text style={styles.sectionTitle}>Emission Category</Text>
          <View style={styles.categoryGrid}>
            {EMISSION_TAXONOMY.map(c => (
              <Pressable
                key={c.key}
                onPress={() => setCategory(c.key)}
                style={[styles.categoryCard, category === c.key && { borderColor: c.color, backgroundColor: c.color + "18" }]}
              >
                <Feather name={c.icon as any} size={16} color={category === c.key ? c.color : colors.textSecondary} />
                <Text style={[styles.categoryLabel, category === c.key && { color: c.color, fontFamily: fonts.semiBold }]}>{c.label}</Text>
                <Text style={[styles.scopeTag, { color: category === c.key ? c.color : colors.textSecondary }]}>{c.scope}</Text>
              </Pressable>
            ))}
          </View>

          {catDef && (
            <>
              <Text style={styles.sectionTitle}>Subcategory *</Text>
              <View style={styles.chipRow}>
                {catDef.subcategories.map(sub => (
                  <Pressable
                    key={sub.label}
                    onPress={() => handleSubcategorySelect(sub)}
                    style={[styles.chip, subcategory === sub.label && { ...styles.chipActive, borderColor: catDef.color, backgroundColor: catDef.color + "18" }]}
                  >
                    <Text style={[styles.chipText, subcategory === sub.label && { color: catDef.color, fontFamily: fonts.semiBold }]}>{sub.label}</Text>
                    {sub.unit && <Text style={[styles.chipUnit, subcategory === sub.label && { color: catDef.color }]}>{sub.unit}</Text>}
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {subcategory !== "" && (
            <>
              <View style={styles.scopeRow}>
                <Feather name="tag" size={13} color={colors.textSecondary} />
                <Text style={styles.scopeText}>{scope} · Unit: {unit}</Text>
              </View>

              <Text style={styles.sectionTitle}>Quantity *</Text>
              <View style={styles.row}>
                <View style={{ flex: 2 }}>
                  <Input
                    label={`Quantity (${unit})`}
                    value={quantity}
                    onChangeText={handleQuantityChange}
                    keyboardType="decimal-pad"
                    placeholder="0.000"
                  />
                </View>
                <View style={{ flex: 2 }}>
                  <Input
                    label="tCO₂e (auto-calculated)"
                    value={tonnesCo2e}
                    onChangeText={setTonnesCo2e}
                    keyboardType="decimal-pad"
                    placeholder="0.0000"
                  />
                </View>
              </View>
              {subcatDef?.factor != null && quantity !== "" && (
                <View style={styles.calcNote}>
                  <Feather name="check-circle" size={12} color="#16a34a" />
                  <Text style={styles.calcNoteText}>
                    {quantity} × {subcatDef.factor} (DEFRA 2024) = {tonnesCo2e} tCO₂e
                  </Text>
                </View>
              )}

              <Text style={styles.sectionTitle}>Emission Factor Source</Text>
              <View style={styles.chipRow}>
                {FACTOR_SOURCES.map(s => (
                  <Pressable key={s} onPress={() => setEmissionFactorSource(s)} style={[styles.chip, emissionFactorSource === s && styles.chipActive]}>
                    <Text style={[styles.chipText, emissionFactorSource === s && styles.chipTextActive]}>{s}</Text>
                  </Pressable>
                ))}
              </View>

              <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Assumptions, source details…" multiline numberOfLines={2} />

              <Button title={saving ? "Saving…" : "Save Emission Record"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
            </>
          )}
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
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: colors.primary + "10", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary + "30" },
  infoText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  categoryCard: { width: "31%", alignItems: "center", gap: 3, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  categoryLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.text, textAlign: "center", lineHeight: 14 },
  scopeTag: { fontFamily: fonts.medium, fontSize: 9, color: colors.textSecondary },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  chipUnit: { fontFamily: fonts.regular, fontSize: 10, color: colors.textSecondary },
  scopeRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: "#f0fdf4", padding: spacing.sm, borderRadius: radius.sm },
  scopeText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: "#16a34a" },
  row: { flexDirection: "row", gap: spacing.md },
  calcNote: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: "#f0fdf4", padding: spacing.sm, borderRadius: radius.sm },
  calcNoteText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#16a34a", flex: 1 },
  saveButton: { marginTop: spacing.lg },
});
