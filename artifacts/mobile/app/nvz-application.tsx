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
import type { NvzApplication } from "@/lib/types";
import { usePrint } from "@/lib/hooks/usePrint";
import { nvzApplicationHtml } from "@/lib/printTemplates";
import { useMobileLookup } from "@/lib/hooks/useMobileLookup";

const PRODUCT_TYPES = [
  { key: "synthetic-n", label: "Synthetic N", color: colors.info },
  { key: "slurry", label: "Slurry", color: colors.fieldBrown },
  { key: "fym", label: "FYM", color: "#92400E" },
  { key: "digestate", label: "Digestate", color: "#6D28D9" },
  { key: "poultry-manure", label: "Poultry Manure", color: "#D97706" },
  { key: "other-organic", label: "Other Organic", color: colors.textSecondary },
];

const APPLICATION_METHODS_FALLBACK = [
  "Trailing shoe", "Dribble bar", "Injected", "Broadcast", "Splash plate", "Irrigation", "Other",
];

export default function NvzApplicationScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const { fields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);
  const applicationMethods = useMobileLookup("nvz_application_methods", APPLICATION_METHODS_FALLBACK);
  const [saving, setSaving] = useState(false);

  const [fieldName, setFieldName] = useState("");
  const [productName, setProductName] = useState("");
  const [productType, setProductType] = useState("");
  const [nitrogenKgHa, setNitrogenKgHa] = useState("");
  const [areaAppliedHa, setAreaAppliedHa] = useState("");
  const [applicationMethod, setApplicationMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [totalCostPence, setTotalCostPence] = useState("");

  const handleSave = async () => {
    if (!fieldName.trim() || !productType) {
      Alert.alert("Required Fields", "Please select a field and product type.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let latitude: number | undefined;
    let longitude: number | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch (locErr: unknown) {
      console.warn("Location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const record: NvzApplication = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: fieldName.trim(),
      applicationDate: new Date().toISOString(),
      productName: productName.trim(),
      productType,
      nitrogenKgHa: nitrogenKgHa.trim(),
      areaAppliedHa: areaAppliedHa.trim(),
      applicationMethod,
      notes: notes.trim(),
      totalCostPence: totalCostPence ? Math.round(parseFloat(totalCostPence) * 100) : undefined,
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.NVZ_APPLICATIONS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "NVZ application saved. Print or save the fertiliser record?", [
      { text: "Print", onPress: async () => { await print(nvzApplicationHtml(record, currentFarm)); router.back(); } },
      { text: "Save PDF", onPress: async () => { await savePdf(nvzApplicationHtml(record, currentFarm), "NVZ Application"); router.back(); } },
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>NVZ Fertiliser Application</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.nvzBanner}>
            <Feather name="alert-triangle" size={14} color={colors.info} />
            <Text style={styles.nvzBannerText}>
              NVZ closed periods: organic manures prohibited Sep–Feb (grassland) or Oct–Jan (arable). Check rules before applying.
            </Text>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Field</Text>
          </View>
          <FieldPicker
            label="Field"
            value={fieldName}
            onChange={setFieldName}
            fields={fields}
            loading={fieldsLoading}
            error={fieldsError}
          />

          <View style={styles.sectionLabel}>
            <Feather name="zap" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Product Type</Text>
          </View>
          <View style={styles.chipRow}>
            {PRODUCT_TYPES.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => { Haptics.selectionAsync(); setProductType(p.key); }}
                style={[
                  styles.chip,
                  productType === p.key && { backgroundColor: p.color, borderColor: p.color },
                ]}
              >
                <Text style={[styles.chipText, productType === p.key && { color: colors.textInverse }]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
          <Input
            label="Product / Fertiliser Name"
            placeholder="e.g. AN 34.5%, Cattle slurry"
            value={productName}
            onChangeText={setProductName}
          />

          <View style={styles.sectionLabel}>
            <Feather name="bar-chart" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Application Quantities</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="N Applied (kg/ha)"
              placeholder="e.g. 80"
              value={nitrogenKgHa}
              onChangeText={setNitrogenKgHa}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Area (ha)"
              placeholder="e.g. 12.5"
              value={areaAppliedHa}
              onChangeText={setAreaAppliedHa}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="tool" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Application Method</Text>
          </View>
          <View style={styles.chipRow}>
            {applicationMethods.map((m) => (
              <Pressable
                key={m}
                onPress={() => { Haptics.selectionAsync(); setApplicationMethod(m); }}
                style={[
                  styles.chip,
                  applicationMethod === m && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.chipText, applicationMethod === m && { color: colors.textInverse }]}>{m}</Text>
              </Pressable>
            ))}
          </View>

          <Input
            label="Total Fertiliser Cost (£)"
            placeholder="e.g. 215.00"
            value={totalCostPence}
            onChangeText={setTotalCostPence}
            keyboardType="decimal-pad"
          />

          <Input
            label="Notes"
            placeholder="Any additional notes, soil conditions, etc."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save NVZ Application"
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
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  nvzBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.infoBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  nvzBannerText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.info,
    lineHeight: 20,
  },
  sectionLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
});
