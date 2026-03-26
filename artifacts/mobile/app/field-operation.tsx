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
import { FieldPicker } from "@/components/ui/FieldPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiFields } from "@/lib/hooks/useApiFields";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { FieldOperation } from "@/lib/types";

// ─── Operation type groups ─────────────────────────
interface OpType {
  value: string;
  label: string;
  hasDepth: boolean;
  hasPasses: boolean;
  hasQuantity: boolean;
  quantityLabel?: string;
  defaultUnit?: string;
}

const OPERATION_GROUPS: { label: string; types: OpType[] }[] = [
  {
    label: "Primary Cultivation",
    types: [
      { value: "ploughing", label: "Ploughing", hasDepth: true, hasPasses: true, hasQuantity: false },
      { value: "subsoiling", label: "Sub-soiling", hasDepth: true, hasPasses: true, hasQuantity: false },
      { value: "mole_ploughing", label: "Mole Ploughing", hasDepth: true, hasPasses: false, hasQuantity: false },
    ],
  },
  {
    label: "Secondary Cultivation",
    types: [
      { value: "discing", label: "Discing", hasDepth: true, hasPasses: true, hasQuantity: false },
      { value: "power_harrowing", label: "Power Harrowing", hasDepth: true, hasPasses: true, hasQuantity: false },
      { value: "rotovating", label: "Rotovating", hasDepth: true, hasPasses: false, hasQuantity: false },
      { value: "tine_harrowing", label: "Tine Harrowing", hasDepth: false, hasPasses: true, hasQuantity: false },
      { value: "stubble_cultivation", label: "Stubble Cultivation", hasDepth: true, hasPasses: true, hasQuantity: false },
    ],
  },
  {
    label: "Consolidation",
    types: [
      { value: "rolling", label: "Rolling", hasDepth: false, hasPasses: true, hasQuantity: false },
      { value: "cambridge_rolling", label: "Cambridge Rolling", hasDepth: false, hasPasses: true, hasQuantity: false },
      { value: "bed_forming", label: "Bed Forming", hasDepth: false, hasPasses: false, hasQuantity: false },
    ],
  },
  {
    label: "Soil Amendments",
    types: [
      { value: "lime_spreading", label: "Lime Spreading", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Rate", defaultUnit: "t/ha" },
      { value: "gypsum", label: "Gypsum Application", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Rate", defaultUnit: "t/ha" },
      { value: "compost", label: "Compost / Organic Matter", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Rate", defaultUnit: "t/ha" },
    ],
  },
  {
    label: "Crop Establishment",
    types: [
      { value: "cover_crop_seeding", label: "Cover Crop Seeding", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Seed Rate", defaultUnit: "kg/ha" },
      { value: "cover_crop_rolling", label: "Cover Crop Rolling / Crimping", hasDepth: false, hasPasses: false, hasQuantity: false },
    ],
  },
  {
    label: "Applications",
    types: [
      { value: "slug_pellets", label: "Slug Pellets", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Rate", defaultUnit: "kg/ha" },
      { value: "irrigation", label: "Irrigation", hasDepth: false, hasPasses: false, hasQuantity: true, quantityLabel: "Volume", defaultUnit: "mm" },
      { value: "desiccation", label: "Cover Crop Desiccation", hasDepth: false, hasPasses: false, hasQuantity: false },
    ],
  },
  {
    label: "Drainage",
    types: [
      { value: "mole_drainage", label: "Mole Drainage", hasDepth: true, hasPasses: false, hasQuantity: false },
      { value: "drainage_repair", label: "Drainage Repair", hasDepth: false, hasPasses: false, hasQuantity: false },
    ],
  },
  {
    label: "Other",
    types: [
      { value: "other", label: "Other", hasDepth: false, hasPasses: false, hasQuantity: false },
    ],
  },
];

const ALL_TYPES = OPERATION_GROUPS.flatMap((g) => g.types);
const getTypeDef = (v: string) => ALL_TYPES.find((t) => t.value === v) ?? null;

const UNITS = ["t/ha", "kg/ha", "l/ha", "mm", "m³", "bales", "bags"];

export default function FieldOperationScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [fieldName, setFieldName] = useState("");
  const [operationType, setOperationType] = useState("");
  const [vehicleDescription, setVehicleDescription] = useState("");
  const [implement, setImplement] = useState("");
  const [workingDepthCm, setWorkingDepthCm] = useState("");
  const [passes, setPasses] = useState("1");
  const [areaHa, setAreaHa] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("");
  const [operator, setOperator] = useState(user?.name || "");
  const [notes, setNotes] = useState("");
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);

  const typeDef = operationType ? getTypeDef(operationType) : null;
  const typeLabel = typeDef?.label ?? "Select operation type…";

  function handleTypeSelect(value: string) {
    const def = getTypeDef(value);
    setOperationType(value);
    if (def?.defaultUnit && !quantityUnit) setQuantityUnit(def.defaultUnit);
    Haptics.selectionAsync();
    setShowTypePicker(false);
  }

  const handleSave = async () => {
    if (!fieldName.trim() || !operationType) {
      Alert.alert("Required Fields", "Please select a field and operation type.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: FieldOperation = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: fieldName.trim(),
      fieldId: "",
      operationDate: new Date().toISOString(),
      operationType,
      vehicleDescription: vehicleDescription.trim(),
      implement: implement.trim(),
      workingDepthCm: workingDepthCm.trim(),
      passes: passes.trim() || "1",
      areaHa: areaHa.trim(),
      quantity: quantity.trim(),
      quantityUnit: quantityUnit.trim(),
      operator: operator.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.FIELD_OPERATIONS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Field operation logged successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Field Operation</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          {/* Field */}
          <FieldPicker
            label="Field"
            value={fieldName}
            onChange={setFieldName}
            fields={fields}
            loading={fieldsLoading}
            error={fieldsError}
          />

          {/* Operation type picker */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Operation Type *</Text>
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setShowTypePicker(true); }}
              style={styles.selectButton}
            >
              <Text style={[styles.selectText, !operationType && styles.placeholder]}>
                {typeLabel}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Operation type modal */}
          {showTypePicker && (
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerSheet}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>Select Operation Type</Text>
                  <Pressable onPress={() => setShowTypePicker(false)}>
                    <Feather name="x" size={20} color={colors.textSecondary} />
                  </Pressable>
                </View>
                <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                  {OPERATION_GROUPS.map((group) => (
                    <View key={group.label}>
                      <Text style={styles.groupLabel}>{group.label}</Text>
                      {group.types.map((t) => (
                        <Pressable
                          key={t.value}
                          onPress={() => handleTypeSelect(t.value)}
                          style={[
                            styles.pickerItem,
                            operationType === t.value && styles.pickerItemSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.pickerItemText,
                              operationType === t.value && styles.pickerItemTextSelected,
                            ]}
                          >
                            {t.label}
                          </Text>
                          {operationType === t.value && (
                            <Feather name="check" size={16} color={colors.primary} />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  ))}
                  <View style={{ height: 40 }} />
                </ScrollView>
              </View>
            </View>
          )}

          {/* Vehicle */}
          <Input
            label="Vehicle / Tractor"
            placeholder="e.g. JD 6R 185 (YT23 ABC)"
            value={vehicleDescription}
            onChangeText={setVehicleDescription}
          />

          {/* Implement */}
          <Input
            label="Implement / Machinery"
            placeholder="e.g. Lemken Diamant 11, Sumo Trio 5m"
            value={implement}
            onChangeText={setImplement}
          />

          {/* Area */}
          <Input
            label="Area (ha)"
            placeholder="0.00"
            value={areaHa}
            onChangeText={setAreaHa}
            keyboardType="decimal-pad"
          />

          {/* Depth & passes — shown based on operation type */}
          {typeDef && (typeDef.hasDepth || typeDef.hasPasses) && (
            <View style={styles.row}>
              {typeDef.hasDepth && (
                <Input
                  label="Working Depth (cm)"
                  placeholder="e.g. 25"
                  value={workingDepthCm}
                  onChangeText={setWorkingDepthCm}
                  keyboardType="number-pad"
                  containerStyle={styles.flex}
                />
              )}
              {typeDef.hasPasses && (
                <Input
                  label="No. of Passes"
                  placeholder="1"
                  value={passes}
                  onChangeText={setPasses}
                  keyboardType="number-pad"
                  containerStyle={styles.flex}
                />
              )}
            </View>
          )}

          {/* Quantity — shown for amendment/application types */}
          {typeDef?.hasQuantity && (
            <View style={styles.row}>
              <Input
                label={typeDef.quantityLabel ?? "Quantity"}
                placeholder="0"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="decimal-pad"
                containerStyle={{ flex: 2 }}
              />
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.label}>Unit</Text>
                <Pressable
                  onPress={() => { Haptics.selectionAsync(); setShowUnitPicker(!showUnitPicker); }}
                  style={styles.selectButton}
                >
                  <Text style={[styles.selectText, !quantityUnit && styles.placeholder]}>
                    {quantityUnit || "Unit"}
                  </Text>
                  <Feather name="chevron-down" size={14} color={colors.textSecondary} />
                </Pressable>
                {showUnitPicker && (
                  <View style={styles.unitDropdown}>
                    {UNITS.map((u) => (
                      <Pressable
                        key={u}
                        onPress={() => {
                          setQuantityUnit(u);
                          setShowUnitPicker(false);
                          Haptics.selectionAsync();
                        }}
                        style={[styles.unitOption, quantityUnit === u && styles.unitOptionSelected]}
                      >
                        <Text style={[styles.unitOptionText, quantityUnit === u && styles.unitOptionTextSelected]}>
                          {u}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Operator */}
          <Input
            label="Operator"
            placeholder="Name"
            value={operator}
            onChangeText={setOperator}
          />

          {/* Notes */}
          <Input
            label="Notes"
            placeholder="Soil conditions, weather, observations…"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Log Operation"
            onPress={handleSave}
            loading={saving}
            fullWidth
            icon="check"
          />

          <View style={{ height: insets.bottom + spacing.xxxl }} />
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
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  form: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  selectText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  placeholder: {
    color: colors.textTertiary,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  // Type picker overlay
  pickerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "80%",
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  pickerTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.lg,
    color: colors.text,
  },
  pickerScroll: {
    marginTop: spacing.sm,
  },
  groupLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  pickerItemSelected: {
    backgroundColor: colors.successBg,
  },
  pickerItemText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.text,
  },
  pickerItemTextSelected: {
    fontFamily: fonts.medium,
    color: colors.primary,
  },
  // Unit dropdown
  unitDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    zIndex: 50,
    overflow: "hidden",
    marginTop: 2,
  },
  unitOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  unitOptionSelected: {
    backgroundColor: colors.successBg,
  },
  unitOptionText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  unitOptionTextSelected: {
    fontFamily: fonts.medium,
    color: colors.primary,
  },
});
