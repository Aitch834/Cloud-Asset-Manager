import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
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
import { LookupPicker, type LookupOption } from "@/components/ui/LookupPicker";
import { getCachedStaffMembers, type RefStaffMember } from "@/lib/refCache";
import { getCurrentAuthToken } from "@/lib/authToken";
import { kvGet } from "@/lib/database";

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
  const [staffOptions, setStaffOptions] = useState<LookupOption[]>([]);
  useEffect(() => {
    if (!currentFarm?.id) return;
    getCachedStaffMembers(String(currentFarm.id)).then((members: RefStaffMember[]) =>
      setStaffOptions(members.map(m => ({ id: m.id, label: m.label, sublabel: m.role || undefined })))
    );
  }, [currentFarm?.id]);
  const [areaSeededHa, setAreaSeededHa] = useState("");
  const [areaAutoFilled, setAreaAutoFilled] = useState(false);
  const [soilConditions, setSoilConditions] = useState("");
  const [weatherNotes, setWeatherNotes] = useState("");
  const [weatherSource, setWeatherSource] = useState<"manual" | "open_meteo" | "davis_station" | "vehicle_station" | "third_party">("manual");
  const [notes, setNotes] = useState("");
  const [seedCostPencePerKg, setSeedCostPencePerKg] = useState("");
  const [seedBatches, setSeedBatches] = useState<Array<{
    id: number; batchNumber: string; cropName: string;
    varietyName?: string | null; tgwGrams?: string | number;
    quantityRemainingKg?: string | number; treatmentNotes?: string | null;
    costPence?: number | null;
  }>>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    if (!currentFarm?.id) return;
    let cancelled = false;
    async function fetchBatches() {
      setLoadingBatches(true);
      try {
        const token = await getCurrentAuthToken();
        const farmRaw = await kvGet("bde_current_farm");
        const slug = farmRaw ? (JSON.parse(farmRaw).tenantSlug || "") : "";
        const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
        const headers: Record<string, string> = { "Content-Type": "application/json", "x-tenant-slug": slug };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`https://${apiDomain}/api/farms/${currentFarm!.id}/seed-batches`, { headers });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setSeedBatches(data.records ?? []);
        }
      } catch {}
      finally { if (!cancelled) setLoadingBatches(false); }
    }
    fetchBatches();
    return () => { cancelled = true; };
  }, [currentFarm?.id]);

  const handleCropSelect = (name: string) => {
    setCropName(name);
    setSelectedBatchId(null);
    const matched = crops.find(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (matched?.variety) {
      setVariety(matched.variety);
    }
  };

  const handleBatchSelect = (batchId: number | null) => {
    setSelectedBatchId(batchId);
    if (batchId === null) return;
    const batch = seedBatches.find(b => b.id === batchId);
    if (!batch) return;
    if (batch.varietyName && !variety) setVariety(batch.varietyName);
    if (batch.batchNumber) setSeedLotNumber(batch.batchNumber);
    if (batch.treatmentNotes) { setIsTreated(true); setTreatmentProduct(batch.treatmentNotes); }
    if (batch.costPence) setSeedCostPencePerKg(String((batch.costPence as number / 1000).toFixed(2)));
  };

  const handleFieldChange = (field: import("@/lib/hooks/useApiFields").ApiField) => {
    if (field.areaSqMetres && !areaAutoFilled && !areaSeededHa) {
      const ha = (field.areaSqMetres / 10000).toFixed(2);
      setAreaSeededHa(ha);
      setAreaAutoFilled(true);
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

    if (fieldName && areaSeededHa.trim()) {
      const selectedField = fields.find(f => f.name === fieldName);
      if (selectedField?.areaSqMetres) {
        const fieldAreaHa = selectedField.areaSqMetres / 10000;
        const newAreaHa = parseFloat(areaSeededHa);
        if (!isNaN(newAreaHa) && newAreaHa > fieldAreaHa) {
          Alert.alert(
            "Area Too Large",
            `The area drilled (${newAreaHa.toFixed(2)} ha) exceeds ${fieldName}'s total area (${fieldAreaHa.toFixed(2)} ha). Please check and correct the area before saving.`
          );
          return;
        }
      }
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
      weatherSource: weatherNotes.trim() ? weatherSource : undefined,
      notes: notes.trim(),
      seedCostPencePerKg: seedCostPencePerKg ? Math.round(parseFloat(seedCostPencePerKg) * 100) : undefined,
      seedBatchId: selectedBatchId ?? undefined,
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
                maxDate="today"
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
                onChangeField={handleFieldChange}
                error={null}
                label="Field"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Area Drilled (ha)</Text>
              <Input
                placeholder="e.g. 14.5"
                value={areaSeededHa}
                onChangeText={(v) => { setAreaSeededHa(v); setAreaAutoFilled(false); }}
                keyboardType="decimal-pad"
              />
              {areaAutoFilled && (
                <Text style={styles.hint}>Auto-filled from field register — edit if drilling only part of the field</Text>
              )}
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

            {cropName ? (() => {
              const batchesForCrop = seedBatches.filter(b =>
                b.cropName.toLowerCase() === cropName.toLowerCase() && Number(b.quantityRemainingKg ?? 0) > 0
              );
              return batchesForCrop.length > 0 ? (
                <View style={styles.field}>
                  <Text style={styles.label}>Seed Batch from Store {loadingBatches ? "(loading…)" : ""}</Text>
                  <View style={styles.chipWrap}>
                    <Pressable
                      style={[styles.chip, selectedBatchId === null && styles.chipSelected]}
                      onPress={() => handleBatchSelect(null)}
                    >
                      <Text style={[styles.chipText, selectedBatchId === null && styles.chipTextSelected]}>No batch</Text>
                    </Pressable>
                    {batchesForCrop.map(b => (
                      <Pressable
                        key={b.id}
                        style={[styles.chip, selectedBatchId === b.id && styles.chipSelected]}
                        onPress={() => handleBatchSelect(b.id)}
                      >
                        <Text style={[styles.chipText, selectedBatchId === b.id && styles.chipTextSelected]}>
                          {b.batchNumber}
                          {b.quantityRemainingKg ? ` (${Number(b.quantityRemainingKg).toFixed(0)}kg)` : ""}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {selectedBatchId !== null && (() => {
                    const sb = seedBatches.find(b => b.id === selectedBatchId);
                    return sb ? (
                      <Text style={styles.hint}>
                        TGW {sb.tgwGrams}g · {Number(sb.quantityRemainingKg ?? 0).toFixed(0)}kg remaining — stock will be deducted automatically
                      </Text>
                    ) : null;
                  })()}
                </View>
              ) : null;
            })() : null}

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
              <View style={styles.chipWrap}>
                <Pressable
                  style={[styles.chip, weatherSource === "manual" && styles.chipSelected]}
                  onPress={() => setWeatherSource("manual")}
                >
                  <Text style={[styles.chipText, weatherSource === "manual" && styles.chipTextSelected]}>
                    Enter manually
                  </Text>
                </Pressable>
                <View style={[styles.chip, styles.chipDisabled]}>
                  <Text style={[styles.chipText, styles.chipTextDisabled]}>
                    Station / API  (coming soon)
                  </Text>
                </View>
              </View>
              <Input
                placeholder="e.g. Dry, light wind, 8°C"
                value={weatherNotes}
                onChangeText={setWeatherNotes}
              />
              <Text style={styles.hint}>
                Future: auto-fetch from farm weather station, Open-Meteo, or vehicle-mounted sensor
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Operator &amp; Notes</Text>

            <View style={styles.field}>
              <LookupPicker
                label="Operator / Driller"
                value={operator}
                options={staffOptions}
                onSelect={(_id, label) => setOperator(label)}
                placeholder="Select or type name…"
                allowFreeText
                icon="user"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Seed Cost (£/kg)</Text>
              <Input
                placeholder="e.g. 0.65"
                value={seedCostPencePerKg}
                onChangeText={setSeedCostPencePerKg}
                keyboardType="decimal-pad"
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
  chipDisabled: {
    opacity: 0.4,
  },
  chipTextDisabled: {
    color: colors.textSecondary,
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
