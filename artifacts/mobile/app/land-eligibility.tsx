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
import type { BiofuelFieldDeclaration } from "@/lib/types";

const LAND_USE_OPTIONS = [
  { key: "arable", label: "Arable / Cropland" },
  { key: "grassland", label: "Improved Grassland" },
  { key: "rough-grazing", label: "Rough Grazing" },
  { key: "forest", label: "Forest / Woodland" },
  { key: "peatland", label: "Peatland / Bog" },
  { key: "wetland", label: "Wetland" },
  { key: "other", label: "Other" },
];

const ELIGIBILITY_OPTIONS = [
  { key: "eligible" as const, label: "Eligible", color: "#16a34a" },
  { key: "not-eligible" as const, label: "Not Eligible", color: "#dc2626" },
  { key: "requires-verification" as const, label: "Requires Verification", color: "#d97706" },
];

type EligibilityStatus = BiofuelFieldDeclaration["eligibilityStatus"];

export default function LandEligibilityScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { fields, loading: fieldsLoading, error: fieldsError } = useApiFields(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const [fieldName, setFieldName] = useState("");
  const [landUseIn2008, setLandUseIn2008] = useState("");
  const [convertedAfter2008, setConvertedAfter2008] = useState(false);
  const [conversionFrom, setConversionFrom] = useState("");
  const [highCarbonStockRisk, setHighCarbonStockRisk] = useState(false);
  const [highBiodiversityRisk, setHighBiodiversityRisk] = useState(false);
  const [eligibilityStatus, setEligibilityStatus] = useState<EligibilityStatus>("eligible");
  const [declaredBy, setDeclaredBy] = useState(user?.name || "");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!fieldName) { Alert.alert("Required", "Please enter or select a field name."); return; }
    if (!landUseIn2008) { Alert.alert("Required", "Please select the land use in January 2008."); return; }
    if (!currentFarm?.id) { Alert.alert("Error", "No farm selected."); return; }

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
    } catch {}

    const record: BiofuelFieldDeclaration = {
      id: generateId(),
      farmId: currentFarm.id,
      fieldName,
      landUseIn2008,
      convertedAfter2008,
      conversionFrom,
      highCarbonStockRisk,
      highBiodiversityRisk,
      eligibilityStatus,
      declarationDate: new Date().toISOString(),
      declaredBy,
      notes,
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.BIOFUEL_FIELD_DECLARATIONS, record);
      await refreshPendingCount();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Land eligibility declaration saved and queued for sync.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Error", "Could not save declaration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={[styles.container, { paddingTop: insets.top }]}
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.titleRow}>
            <View style={[styles.iconBadge, { backgroundColor: "#dcfce7" }]}>
              <Feather name="map" size={22} color="#16a34a" />
            </View>
            <View>
              <Text style={styles.title}>Land Eligibility Declaration</Text>
              <Text style={styles.subtitle}>RTFO / ISCC biofuel crop eligibility</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Field Information</Text>
          <FieldPicker
            fields={fields}
            loading={fieldsLoading}
            error={fieldsError || undefined}
            value={fieldName}
            onChange={setFieldName}
            placeholder="Select or enter field name"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Land Use in January 2008</Text>
          <Text style={styles.hint}>What was this field used for on 1 January 2008?</Text>
          <View style={styles.optionGrid}>
            {LAND_USE_OPTIONS.map(opt => (
              <Pressable
                key={opt.key}
                onPress={() => { setLandUseIn2008(opt.key); Haptics.selectionAsync(); }}
                style={[styles.optionBtn, landUseIn2008 === opt.key && styles.optionBtnSelected]}
              >
                <Text style={[styles.optionBtnText, landUseIn2008 === opt.key && styles.optionBtnTextSelected]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risk Flags</Text>
          <View style={styles.toggleRow}>
            <Pressable onPress={() => { setConvertedAfter2008(v => !v); Haptics.selectionAsync(); }} style={[styles.toggleBtn, convertedAfter2008 && styles.toggleBtnOn]}>
              <View style={[styles.toggleDot, convertedAfter2008 && styles.toggleDotOn]} />
            </Pressable>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.toggleLabel}>Converted after January 2008?</Text>
              <Text style={styles.toggleHint}>Was this field converted from a different land use after 2008?</Text>
            </View>
          </View>
          {convertedAfter2008 && (
            <Input
              label="Converted from (prior use)"
              value={conversionFrom}
              onChangeText={setConversionFrom}
              placeholder="e.g. Woodland, Peatland"
              style={{ marginTop: spacing.sm }}
            />
          )}
          <View style={[styles.toggleRow, { marginTop: spacing.md }]}>
            <Pressable onPress={() => { setHighCarbonStockRisk(v => !v); Haptics.selectionAsync(); }} style={[styles.toggleBtn, highCarbonStockRisk && { ...styles.toggleBtnOn, backgroundColor: "#dc2626" }]}>
              <View style={[styles.toggleDot, highCarbonStockRisk && styles.toggleDotOn]} />
            </Pressable>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[styles.toggleLabel, highCarbonStockRisk && { color: "#dc2626" }]}>High Carbon Stock Risk?</Text>
              <Text style={styles.toggleHint}>Forest, peatland or wetland with high carbon sequestration</Text>
            </View>
          </View>
          <View style={[styles.toggleRow, { marginTop: spacing.md }]}>
            <Pressable onPress={() => { setHighBiodiversityRisk(v => !v); Haptics.selectionAsync(); }} style={[styles.toggleBtn, highBiodiversityRisk && { ...styles.toggleBtnOn, backgroundColor: "#dc2626" }]}>
              <View style={[styles.toggleDot, highBiodiversityRisk && styles.toggleDotOn]} />
            </Pressable>
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={[styles.toggleLabel, highBiodiversityRisk && { color: "#dc2626" }]}>High Biodiversity Risk?</Text>
              <Text style={styles.toggleHint}>SSSI, ancient woodland, primary forest or protected habitat</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eligibility Assessment</Text>
          <View style={styles.eligibilityRow}>
            {ELIGIBILITY_OPTIONS.map(opt => (
              <Pressable
                key={opt.key}
                onPress={() => { setEligibilityStatus(opt.key); Haptics.selectionAsync(); }}
                style={[styles.eligibilityBtn, eligibilityStatus === opt.key && { backgroundColor: opt.color + "22", borderColor: opt.color }]}
              >
                <Text style={[styles.eligibilityText, eligibilityStatus === opt.key && { color: opt.color, fontFamily: fonts.semiBold }]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {eligibilityStatus === "not-eligible" && (
            <View style={styles.warningBox}>
              <Feather name="alert-triangle" size={16} color="#dc2626" />
              <Text style={styles.warningText}>Crops from ineligible fields cannot enter the biofuel supply chain. Contact your buyer before proceeding.</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Declaration Details</Text>
          <Input label="Declared By" value={declaredBy} onChangeText={setDeclaredBy} placeholder="Your full name" />
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Additional notes or observations" multiline numberOfLines={3} style={{ marginTop: spacing.sm }} />
        </View>

        <View style={styles.submitSection}>
          <Button label={saving ? "Saving..." : "Save Declaration"} onPress={handleSave} disabled={saving} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  backBtn: { marginBottom: spacing.md },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconBadge: { width: 48, height: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.text },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.sm },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  optionBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  optionBtnSelected: { borderColor: "#16a34a", backgroundColor: "#dcfce7" },
  optionBtnText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text },
  optionBtnTextSelected: { fontFamily: fonts.semiBold, color: "#16a34a" },
  toggleRow: { flexDirection: "row", alignItems: "flex-start" },
  toggleBtn: { width: 48, height: 28, borderRadius: 14, backgroundColor: colors.border, justifyContent: "center", paddingHorizontal: 3 },
  toggleBtnOn: { backgroundColor: "#16a34a" },
  toggleDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#fff" },
  toggleDotOn: { alignSelf: "flex-end" },
  toggleLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text },
  toggleHint: { fontFamily: fonts.regular, fontSize: fontSize.xs ?? 11, color: colors.textSecondary, marginTop: 2 },
  eligibilityRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  eligibilityBtn: { flex: 1, minWidth: 100, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: "center" },
  eligibilityText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, textAlign: "center" },
  warningBox: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, marginTop: spacing.sm, backgroundColor: "#fef2f2", borderRadius: radius.sm, padding: spacing.md, borderWidth: 1, borderColor: "#fecaca" },
  warningText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#7f1d1d", flex: 1, lineHeight: 18 },
  submitSection: { marginHorizontal: spacing.lg, marginTop: spacing.sm },
});
