import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FieldPicker } from "@/components/ui/FieldPicker";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import type { ApiField } from "@/lib/hooks/useApiFields";
import { useApiFields } from "@/lib/hooks/useApiFields";
import {
  BLACKGRASS_TARGET_POPULATION_M2,
  STANDARD_TARGET_POPULATION_M2,
  calculateSeedRate,
  getEstablishmentPercent,
} from "@/lib/seedRateCalculator";

const SOIL_TYPES = ["Clay", "Chalk/Limestone", "Silt", "Peat", "Sand", "Medium Loam", "Not sure"];

/**
 * Available water capacity (AWC, mm) hint per soil-type chip label.
 * Values aligned with SOIL_TYPE_OPTIONS in irrigationData.ts; chalk/limestone
 * uses a typical UK chalk soil value (~120 mm) from the same AHDB source.
 */
const SOIL_TYPE_AWC_MM: Record<string, number> = {
  "Clay":             175,
  "Chalk/Limestone":  120,
  "Silt":             155,
  "Peat":             200,
  "Sand":              90,
  "Medium Loam":      150,
};

// Maps a free-text or underscore soil type value (as stored on a field record)
// to the nearest calculator chip label, using the same regex priority order as
// seedRateCalculator's SOIL_ESTABLISHMENT_RULES (first match wins).
const SOIL_TYPE_CHIP_MAP: Array<{ pattern: RegExp; chip: string }> = [
  { pattern: /clay/i,            chip: "Clay" },
  { pattern: /chalk|limestone/i, chip: "Chalk/Limestone" },
  { pattern: /silt/i,            chip: "Silt" },
  { pattern: /peat/i,            chip: "Peat" },
  { pattern: /sand/i,            chip: "Sand" },
  { pattern: /loam/i,            chip: "Medium Loam" },
];

function mapFieldSoilTypeToChip(rawSoilType: string): string | null {
  const normalised = rawSoilType.replace(/_/g, " ").trim();
  for (const { pattern, chip } of SOIL_TYPE_CHIP_MAP) {
    if (pattern.test(normalised)) return chip;
  }
  return null;
}

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export default function SeedRateCalculatorScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id ? String(currentFarm.id) : undefined;
  const { fields, loading: fieldsLoading, fromCache: fieldsFromCache, error: fieldsError } = useApiFields(farmId);

  const [selectedFieldName, setSelectedFieldName] = useState("");
  const [soilType, setSoilType] = useState("");
  const [drillingDate, setDrillingDate] = useState(todayDate());
  const [blackgrassRisk, setBlackgrassRisk] = useState(false);
  const [targetPopulation, setTargetPopulation] = useState(String(STANDARD_TARGET_POPULATION_M2));
  const [tgwGrams, setTgwGrams] = useState("");

  const handleFieldChange = (field: ApiField) => {
    if (field.soilType) {
      const chip = mapFieldSoilTypeToChip(field.soilType);
      if (chip) setSoilType(chip);
    }
  };

  const handleBlackgrassToggle = () => {
    const next = !blackgrassRisk;
    setBlackgrassRisk(next);
    setTargetPopulation(String(next ? BLACKGRASS_TARGET_POPULATION_M2 : STANDARD_TARGET_POPULATION_M2));
  };

  const establishment = useMemo(
    () => getEstablishmentPercent(soilType || null, drillingDate || null),
    [soilType, drillingDate]
  );

  const result = useMemo(() => {
    const target = parseFloat(targetPopulation);
    const tgw = parseFloat(tgwGrams);
    if (!target || !tgw) return null;
    return calculateSeedRate(target, tgw, establishment.percent);
  }, [targetPopulation, tgwGrams, establishment.percent]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Seed Rate Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hintBanner}>
            <Feather name="info" size={13} color="#1d4ed8" style={{ marginTop: 1 }} />
            <Text style={styles.hintText}>
              Estimates a starting seed rate from target plant population, TGW, soil type and drilling
              date. Treat this as a starting point — not a substitute for merchant/agronomist advice.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Field Conditions</Text>

            <FieldPicker
              value={selectedFieldName}
              onChange={setSelectedFieldName}
              onChangeField={handleFieldChange}
              fields={fields}
              loading={fieldsLoading}
              fromCache={fieldsFromCache}
              error={fieldsError}
              label="Field (optional)"
              allowScan={false}
            />

            <View style={styles.field}>
              <Text style={styles.label}>Soil Type</Text>
              <View style={styles.chipWrap}>
                {SOIL_TYPES.map((s) => (
                  <Pressable
                    key={s}
                    style={[styles.chip, soilType === s && styles.chipSelected]}
                    onPress={() => setSoilType(soilType === s ? "" : s)}
                  >
                    <Text style={[styles.chipText, soilType === s && styles.chipTextSelected]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.hint}>{establishment.soilLabel}</Text>
              {soilType && SOIL_TYPE_AWC_MM[soilType] !== undefined && (
                <Text style={styles.hint}>
                  Holds ~{SOIL_TYPE_AWC_MM[soilType]} mm available water
                </Text>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Drilling Date</Text>
              <Input placeholder="YYYY-MM-DD" value={drillingDate} onChangeText={setDrillingDate} />
              <Text style={styles.hint}>{establishment.dateLabel}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Target &amp; Seed</Text>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Black-grass Risk Field?</Text>
                <Text style={styles.hint}>
                  AHDB guidance suggests a higher target population ({BLACKGRASS_TARGET_POPULATION_M2}/m²)
                  to boost crop competition against black-grass
                </Text>
              </View>
              <Pressable
                onPress={handleBlackgrassToggle}
                style={[styles.switchTrack, blackgrassRisk && styles.switchTrackOn]}
              >
                <View style={[styles.switchThumb, blackgrassRisk && styles.switchThumbOn]} />
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Target Plant Population (plants/m²)</Text>
              <Input
                placeholder={String(STANDARD_TARGET_POPULATION_M2)}
                value={targetPopulation}
                onChangeText={setTargetPopulation}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>TGW — Thousand Grain Weight (g) *</Text>
              <Input
                placeholder="e.g. 48.5"
                value={tgwGrams}
                onChangeText={setTgwGrams}
                keyboardType="decimal-pad"
              />
              <Text style={styles.hint}>Find this on the seed batch label, or in Seed Store</Text>
            </View>
          </View>

          {result ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Estimated Establishment</Text>
              <Text style={styles.resultBig}>{establishment.percent}%</Text>

              <View style={styles.resultDivider} />

              <View style={styles.resultRow}>
                <View style={styles.resultCell}>
                  <Text style={styles.resultCellValue}>{result.seedsPerM2}</Text>
                  <Text style={styles.resultCellLabel}>Seeds/m²</Text>
                </View>
                <View style={styles.resultCell}>
                  <Text style={[styles.resultCellValue, { color: colors.primary }]}>
                    {result.seedRateKgHa}
                  </Text>
                  <Text style={styles.resultCellLabel}>kg/ha Seed Rate</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.placeholderCard}>
              <Feather name="percent" size={20} color={colors.textTertiary} />
              <Text style={styles.placeholderText}>Enter a target population and TGW to see the result</Text>
            </View>
          )}

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md },
  hintBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: "#eff6ff",
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  hintText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#1d4ed8", lineHeight: 16 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  field: { gap: spacing.xs },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
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
  toggleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  switchTrack: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.border,
    padding: 2,
    justifyContent: "center",
  },
  switchTrackOn: { backgroundColor: colors.primary },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  switchThumbOn: { transform: [{ translateX: 18 }] },
  resultCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#bbf7d0",
    alignItems: "center",
  },
  resultLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: "#166534" },
  resultBig: { fontFamily: fonts.bold, fontSize: 32, color: "#166534", marginTop: 2 },
  resultDivider: { height: 1, backgroundColor: "#bbf7d0", width: "100%", marginVertical: spacing.sm },
  resultRow: { flexDirection: "row", width: "100%", justifyContent: "space-around" },
  resultCell: { alignItems: "center" },
  resultCellValue: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  resultCellLabel: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  placeholderCard: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  placeholderText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textTertiary, textAlign: "center" },
});
