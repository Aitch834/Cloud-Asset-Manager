import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
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
import { FieldPicker } from "@/components/ui/FieldPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiCrops } from "@/lib/hooks/useApiCrops";
import { useApiFields } from "@/lib/hooks/useApiFields";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { SeedDrillingRecord } from "@/lib/types";

function todayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export default function SeedDrillingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading } = useApiFields(currentFarm?.id);
  const { crops } = useApiCrops(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [fieldName, setFieldName] = useState("");
  const [drillingDate, setDrillingDate] = useState(todayDate());
  const [cropName, setCropName] = useState("");
  const [variety, setVariety] = useState("");
  const [seedLotNumber, setSeedLotNumber] = useState("");
  const [seedRate, setSeedRate] = useState("");
  const [seedRateUnit, setSeedRateUnit] = useState("kg/ha");
  const [isTreated, setIsTreated] = useState(false);
  const [treatmentProduct, setTreatmentProduct] = useState("");
  const [operator, setOperator] = useState(user?.name || "");
  const [areaSeededHa, setAreaSeededHa] = useState("");
  const [soilConditions, setSoilConditions] = useState("");
  const [weatherNotes, setWeatherNotes] = useState("");
  const [notes, setNotes] = useState("");

  const handleCropSelect = (name: string) => {
    setCropName(name);
    const matched = crops.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (matched?.variety) {
      setVariety(matched.variety);
    }
  };

  const handleSave = async () => {
    if (!cropName.trim()) {
      Alert.alert("Required Field", "Please enter or select a crop.");
      return;
    }
    if (!drillingDate.trim()) {
      Alert.alert("Required Field", "Please enter a drilling date.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch (locErr: unknown) {
      console.warn(
        "Location unavailable:",
        locErr instanceof Error ? locErr.message : "unknown"
      );
    }

    const record: SeedDrillingRecord = {
      id: generateId(),
      farmId: currentFarm?.id ?? "",
      fieldName: fieldName || undefined,
      drillingDate,
      cropName: cropName.trim(),
      variety: variety.trim(),
      seedLotNumber: seedLotNumber.trim(),
      seedRate: seedRate.trim(),
      seedRateUnit: seedRateUnit.trim() || "kg/ha",
      isTreated,
      treatmentProduct: isTreated ? treatmentProduct.trim() : "",
      operator: operator.trim(),
      areaSeededHa: areaSeededHa.trim(),
      soilConditions: soilConditions || undefined,
      weatherNotes: weatherNotes.trim() || undefined,
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SEED_DRILLING_RECORDS, record);
    await refreshPendingCount();

    setSaving(false);
    router.back();
  };

  const SEED_RATE_UNITS = ["kg/ha", "seeds/m²", "units/ha", "lbs/acre"];

  const SOIL_CONDITION_OPTIONS = [
    { value: "firm_good_tilth", label: "Good tilth" },
    { value: "adequate_tilth", label: "Adequate" },
    { value: "cloddy_rough", label: "Cloddy/rough" },
    { value: "wet_soft", label: "Wet/soft" },
    { value: "dry_dusty", label: "Dry/dusty" },
    { value: "frozen", label: "Frozen" },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Seed Drilling Record</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Drilling Details</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Drilling Date *</Text>
              <Input
                placeholder="YYYY-MM-DD"
                value={drillingDate}
                onChangeText={setDrillingDate}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Field (optional)</Text>
              <FieldPicker
                fields={fields}
                loading={fieldsLoading}
                value={fieldName}
                onChange={(name) => setFieldName(name)}
                placeholder="Select or type field name…"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Area Drilled (ha)</Text>
              <Input
                placeholder="e.g. 14.5"
                value={areaSeededHa}
                onChangeText={setAreaSeededHa}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Crop &amp; Seed</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Crop *</Text>
              {crops.length > 0 ? (
                <>
                  <View style={styles.chipWrap}>
                    {crops.map((c) => (
                      <Pressable
                        key={c.id}
                        style={[
                          styles.chip,
                          cropName === c.name && styles.chipSelected,
                        ]}
                        onPress={() => handleCropSelect(c.name)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            cropName === c.name && styles.chipTextSelected,
                          ]}
                        >
                          {c.name}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {!crops.find(
                    (c) => c.name.toLowerCase() === cropName.toLowerCase()
                  ) && (
                    <Input
                      placeholder="Or type crop name…"
                      value={cropName}
                      onChangeText={setCropName}
                      style={{ marginTop: spacing.xs }}
                    />
                  )}
                </>
              ) : (
                <Input
                  placeholder="e.g. Winter Wheat"
                  value={cropName}
                  onChangeText={setCropName}
                />
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Variety</Text>
              <Input
                placeholder="e.g. KWS Zyatt"
                value={variety}
                onChangeText={setVariety}
              />
              {crops.length > 0 && cropName ? (
                <Text style={styles.hint}>
                  Auto-filled from Crops Register — edit if drilling a different
                  variety
                </Text>
              ) : null}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Seed Lot Number</Text>
              <Input
                placeholder="e.g. LOT-2024-001"
                value={seedLotNumber}
                onChangeText={setSeedLotNumber}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Seed Rate</Text>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Input
                    placeholder="e.g. 200"
                    value={seedRate}
                    onChangeText={setSeedRate}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={styles.unitGroup}>
                  {SEED_RATE_UNITS.map((u) => (
                    <Pressable
                      key={u}
                      style={[
                        styles.unitChip,
                        seedRateUnit === u && styles.unitChipSelected,
                      ]}
                      onPress={() => setSeedRateUnit(u)}
                    >
                      <Text
                        style={[
                          styles.unitText,
                          seedRateUnit === u && styles.unitTextSelected,
                        ]}
                      >
                        {u}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seed Treatment</Text>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Seed Treated?</Text>
                <Text style={styles.hint}>
                  Record fungicide, insecticide or other seed dressings
                </Text>
              </View>
              <Switch
                value={isTreated}
                onValueChange={setIsTreated}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.surface}
              />
            </View>

            {isTreated && (
              <View style={styles.field}>
                <Text style={styles.label}>Treatment Product</Text>
                <Input
                  placeholder="e.g. Redigo Pro, Vibrance Duo"
                  value={treatmentProduct}
                  onChangeText={setTreatmentProduct}
                />
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conditions</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Soil Conditions</Text>
              <View style={styles.chipWrap}>
                {SOIL_CONDITION_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    style={[
                      styles.chip,
                      soilConditions === opt.value && styles.chipSelected,
                    ]}
                    onPress={() =>
                      setSoilConditions(
                        soilConditions === opt.value ? "" : opt.value
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        soilConditions === opt.value && styles.chipTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Weather at Drilling</Text>
              <Input
                placeholder="e.g. Dry, light wind, 8°C"
                value={weatherNotes}
                onChangeText={setWeatherNotes}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Operator &amp; Notes</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Operator / Driller</Text>
              <Input
                placeholder="Name of operator"
                value={operator}
                onChangeText={setOperator}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Notes</Text>
              <Input
                placeholder="Drilling depth, any issues…"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.gpsNote}>
            <Feather name="map-pin" size={14} color={colors.textSecondary} />
            <Text style={styles.gpsText}>
              GPS coordinates will be captured automatically on save
            </Text>
          </View>

          <Button
            title="Save Drilling Record"
            loading={saving}
            onPress={handleSave}
          />

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
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
  field: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.textInverse,
  },
  unitGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    alignItems: "center",
  },
  unitChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.md,
    backgroundColor: colors.borderLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  unitChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  unitText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.text,
  },
  unitTextSelected: {
    color: colors.textInverse,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  gpsNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  gpsText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
