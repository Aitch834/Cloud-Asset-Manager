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
import type { CarbonSequestrationRecord } from "@/lib/types";

type FeatureDef = { unit: string; factorTco2ePerUnit?: number };

const SEQ_FEATURES: Record<string, FeatureDef> = {
  "Woodland":            { unit: "ha",  factorTco2ePerUnit: 3.50 },
  "Hedgerow":            { unit: "km",  factorTco2ePerUnit: 0.34 },
  "Peatland":            { unit: "ha",  factorTco2ePerUnit: 5.50 },
  "Permanent Grassland": { unit: "ha",  factorTco2ePerUnit: 0.50 },
  "Wildflower Meadow":   { unit: "ha",  factorTco2ePerUnit: 0.30 },
  "Riparian Buffer":     { unit: "ha",  factorTco2ePerUnit: 1.20 },
  "Agroforestry":        { unit: "ha",  factorTco2ePerUnit: 1.50 },
  "Other":               { unit: "ha" },
};

const FEATURE_ICONS: Record<string, string> = {
  "Woodland": "wind", "Hedgerow": "minus", "Peatland": "droplets",
  "Permanent Grassland": "sun", "Wildflower Meadow": "feather",
  "Riparian Buffer": "waves", "Agroforestry": "tree", "Other": "more-horizontal",
};

const FACTOR_SOURCES = [
  "Woodland Carbon Code",
  "Peatland Code",
  "DEFRA UK GHG Conversion Factors 2024",
  "IPCC 2019 Guidelines",
  "Agrecalc",
  "Other / manual",
];

const YEARS = Array.from({ length: new Date().getFullYear() - 2014 }, (_, i) =>
  String(new Date().getFullYear() + 1 - i)
);

export default function CarbonSequestrationScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [featureType, setFeatureType] = useState("");
  const [featureName, setFeatureName] = useState("");
  const [areaHaOrLengthM, setAreaHaOrLengthM] = useState("");
  const [tonnesCo2eSequestered, setTonnesCo2eSequestered] = useState("");
  const [sequestrationFactorSource, setSequestrationFactorSource] = useState("Woodland Carbon Code");
  const [notes, setNotes] = useState("");

  const featDef = featureType ? SEQ_FEATURES[featureType] : null;

  const calcSeq =
    featDef?.factorTco2ePerUnit != null && areaHaOrLengthM
      ? (parseFloat(areaHaOrLengthM) * featDef.factorTco2ePerUnit).toFixed(3)
      : null;

  const handleFeatureSelect = (ft: string) => {
    const def = SEQ_FEATURES[ft];
    setFeatureType(ft);
    if (areaHaOrLengthM && def?.factorTco2ePerUnit != null) {
      setTonnesCo2eSequestered((parseFloat(areaHaOrLengthM) * def.factorTco2ePerUnit).toFixed(3));
    }
  };

  const handleAreaChange = (v: string) => {
    setAreaHaOrLengthM(v);
    if (featDef?.factorTco2ePerUnit != null) {
      const qty = parseFloat(v);
      if (!isNaN(qty)) setTonnesCo2eSequestered((qty * featDef.factorTco2ePerUnit).toFixed(3));
    }
  };

  const handleSave = async () => {
    if (!featureType) { Alert.alert("Required", "Please select a feature type."); return; }
    if (!areaHaOrLengthM.trim()) { Alert.alert("Required", "Please enter the area or length."); return; }
    if (!tonnesCo2eSequestered.trim()) { Alert.alert("Required", "Please enter or confirm the tCO₂e figure."); return; }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const record: CarbonSequestrationRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      sequestrationYear: year,
      featureType,
      featureName: featureName.trim(),
      areaHaOrLengthM: areaHaOrLengthM.trim(),
      unit: featDef?.unit ?? "ha",
      tonnesCo2eSequestered: tonnesCo2eSequestered.trim(),
      sequestrationFactorSource,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };
    await appendToList(STORAGE_KEYS.CARBON_SEQUESTRATION_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Sequestration record saved and queued for sync.", [
      { text: "Add Another", onPress: () => { setFeatureType(""); setFeatureName(""); setAreaHaOrLengthM(""); setTonnesCo2eSequestered(""); setNotes(""); } },
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
            <Text style={styles.title}>Carbon Sequestration</Text>
            <Text style={styles.subtitle}>Woodland, hedgerow, peatland & habitat features</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.infoBanner}>
            <Feather name="info" size={14} color="#16a34a" />
            <Text style={styles.infoText}>Record features that sequester carbon. Area × the indicative Woodland Carbon Code / DEFRA factor gives a tCO₂e estimate you can override with verified figures.</Text>
          </View>

          <Text style={styles.sectionTitle}>Year *</Text>
          <View style={styles.chipRow}>
            {YEARS.slice(0, 8).map(y => (
              <Pressable key={y} onPress={() => setYear(y)} style={[styles.chip, year === y && styles.chipActive]}>
                <Text style={[styles.chipText, year === y && styles.chipTextActive]}>{y}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Feature Type *</Text>
          <View style={styles.featureGrid}>
            {Object.keys(SEQ_FEATURES).map(ft => {
              const def = SEQ_FEATURES[ft];
              const active = featureType === ft;
              return (
                <Pressable
                  key={ft}
                  onPress={() => handleFeatureSelect(ft)}
                  style={[styles.featureCard, active && styles.featureCardActive]}
                >
                  <Feather name={(FEATURE_ICONS[ft] ?? "leaf") as any} size={18} color={active ? "#16a34a" : colors.textSecondary} />
                  <Text style={[styles.featureLabel, active && styles.featureLabelActive]}>{ft}</Text>
                  {def.factorTco2ePerUnit != null && (
                    <Text style={styles.featureFactor}>{def.factorTco2ePerUnit} tCO₂e/{def.unit}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          {featureType !== "" && (
            <>
              <Input
                label="Feature Name / Description"
                value={featureName}
                onChangeText={setFeatureName}
                placeholder="e.g. North Wood, Boundary Hedge A"
              />

              <View style={styles.row}>
                <View style={{ flex: 1.5 }}>
                  <Input
                    label={`Area / Length (${featDef?.unit ?? "ha"})`}
                    value={areaHaOrLengthM}
                    onChangeText={handleAreaChange}
                    keyboardType="decimal-pad"
                    placeholder="0.000"
                  />
                </View>
                <View style={{ flex: 1.5 }}>
                  <Input
                    label="tCO₂e Sequestered *"
                    value={tonnesCo2eSequestered}
                    onChangeText={setTonnesCo2eSequestered}
                    keyboardType="decimal-pad"
                    placeholder="0.000"
                  />
                </View>
              </View>

              {calcSeq != null && (
                <View style={styles.calcNote}>
                  <Feather name="check-circle" size={12} color="#16a34a" />
                  <Text style={styles.calcNoteText}>
                    Indicative: {areaHaOrLengthM} {featDef?.unit} × {featDef?.factorTco2ePerUnit} = {calcSeq} tCO₂e
                  </Text>
                  {tonnesCo2eSequestered !== calcSeq && (
                    <Pressable onPress={() => setTonnesCo2eSequestered(calcSeq)}>
                      <Text style={styles.useCalcLink}>Use this</Text>
                    </Pressable>
                  )}
                </View>
              )}

              <Text style={styles.sectionTitle}>Sequestration Factor Source</Text>
              <View style={styles.chipRow}>
                {FACTOR_SOURCES.map(s => (
                  <Pressable key={s} onPress={() => setSequestrationFactorSource(s)} style={[styles.chip, sequestrationFactorSource === s && styles.chipActive]}>
                    <Text style={[styles.chipText, sequestrationFactorSource === s && styles.chipTextActive]}>{s}</Text>
                  </Pressable>
                ))}
              </View>

              <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Survey method, certification code…" multiline numberOfLines={2} />

              <Button title={saving ? "Saving…" : "Save Sequestration Record"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
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
  infoBanner: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: "#f0fdf4", padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: "#bbf7d0" },
  infoText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: "#16a34a", backgroundColor: "#f0fdf4" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: "#16a34a", fontFamily: fonts.semiBold },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  featureCard: { width: "31%", alignItems: "center", gap: 3, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  featureCardActive: { borderColor: "#16a34a", backgroundColor: "#f0fdf4" },
  featureLabel: { fontFamily: fonts.regular, fontSize: 11, color: colors.text, textAlign: "center" },
  featureLabelActive: { color: "#16a34a", fontFamily: fonts.semiBold },
  featureFactor: { fontFamily: fonts.regular, fontSize: 9, color: colors.textSecondary, textAlign: "center" },
  row: { flexDirection: "row", gap: spacing.md },
  calcNote: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: "#f0fdf4", padding: spacing.sm, borderRadius: radius.sm, flexWrap: "wrap" },
  calcNoteText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#16a34a", flex: 1 },
  useCalcLink: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: "#16a34a", textDecorationLine: "underline" },
  saveButton: { marginTop: spacing.lg },
});
