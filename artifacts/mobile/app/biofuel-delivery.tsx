import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import type { BiofuelDeliveryRecord } from "@/lib/types";
import { usePrint } from "@/lib/hooks/usePrint";
import { biofuelDeclarationHtml } from "@/lib/printTemplates";
import { Pressable } from "react-native";
import { useMobileLookup } from "@/lib/hooks/useMobileLookup";

const CROP_TYPES = [
  "Feed Wheat", "Milling Wheat", "Oilseed Rape (OSR)", "Sugar Beet",
  "Maize / Corn", "Barley", "Miscanthus", "Short Rotation Coppice", "Other",
];

const SUSTAINABILITY_SCHEMES_FALLBACK = [
  "ISCC UK", "ISCC EU", "Bonsucro", "REDcert", "RTRS", "Other",
];

export default function BiofuelDeliveryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const sustainabilitySchemes = useMobileLookup("biofuel_cert_schemes", SUSTAINABILITY_SCHEMES_FALLBACK);
  const [saving, setSaving] = useState(false);

  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [buyerName, setBuyerName] = useState("");
  const [buyerRtfoRef, setBuyerRtfoRef] = useState("");
  const [cropType, setCropType] = useState("");
  const [quantityTonnes, setQuantityTonnes] = useState("");
  const [certificationRef, setCertificationRef] = useState("");
  const [sustainabilityDeclarationRef, setSustainabilityDeclarationRef] = useState("");
  const [sustainabilityScheme, setSustainabilityScheme] = useState("");
  const [ghgSavingPercent, setGhgSavingPercent] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!buyerName) { Alert.alert("Required", "Please enter a buyer name."); return; }
    if (!cropType) { Alert.alert("Required", "Please select or enter a crop type."); return; }
    if (!deliveryDate) { Alert.alert("Required", "Please enter the delivery date."); return; }
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

    const record: BiofuelDeliveryRecord = {
      id: generateId(),
      farmId: currentFarm.id,
      deliveryDate: new Date(deliveryDate).toISOString(),
      buyerName,
      buyerRtfoRef,
      cropType,
      quantityTonnes,
      certificationRef,
      sustainabilityDeclarationRef,
      sustainabilityScheme,
      ghgSavingPercent,
      notes,
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    try {
      await appendToList(STORAGE_KEYS.BIOFUEL_DELIVERY_RECORDS, record);
      await refreshPendingCount();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Saved", "Biofuel delivery saved. Print or save the RTFO sustainability declaration?", [
        { text: "Print", onPress: async () => { await print(biofuelDeclarationHtml(record, currentFarm)); router.back(); } },
        { text: "Save PDF", onPress: async () => { await savePdf(biofuelDeclarationHtml(record, currentFarm), "RTFO Declaration"); router.back(); } },
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Error", "Could not save delivery record. Please try again.");
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
            <View style={[styles.iconBadge, { backgroundColor: "#fef3c7" }]}>
              <Feather name="truck" size={22} color="#d97706" />
            </View>
            <View>
              <Text style={styles.title}>Biofuel Crop Delivery</Text>
              <Text style={styles.subtitle}>RTFO consignment record</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Details</Text>
          <Input
            label="Delivery Date"
            value={deliveryDate}
            onChangeText={setDeliveryDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numeric"
            maxDate="today"
          />
          <Input
            label="Quantity (tonnes)"
            value={quantityTonnes}
            onChangeText={setQuantityTonnes}
            placeholder="e.g. 250.5"
            keyboardType="decimal-pad"
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buyer Information</Text>
          <Input
            label="Buyer Name"
            value={buyerName}
            onChangeText={setBuyerName}
            placeholder="e.g. Vivergo Fuels, Ensus, Stallingborough"
          />
          <Input
            label="Buyer RTFO Reference"
            value={buyerRtfoRef}
            onChangeText={setBuyerRtfoRef}
            placeholder="e.g. RTFO-2024-001234"
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crop Type</Text>
          <View style={styles.chipGrid}>
            {CROP_TYPES.map(ct => (
              <Pressable
                key={ct}
                onPress={() => { setCropType(ct); Haptics.selectionAsync(); }}
                style={[styles.chip, cropType === ct && styles.chipSelected]}
              >
                <Text style={[styles.chipText, cropType === ct && styles.chipTextSelected]}>{ct}</Text>
              </Pressable>
            ))}
          </View>
          {cropType === "Other" && (
            <Input label="Specify crop" value={cropType === "Other" ? "" : cropType} onChangeText={setCropType} placeholder="Enter crop type" style={{ marginTop: spacing.sm }} />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sustainability &amp; Certification</Text>
          <Text style={styles.hint}>Sustainability scheme used for this consignment</Text>
          <View style={styles.chipGrid}>
            {sustainabilitySchemes.map(s => (
              <Pressable
                key={s}
                onPress={() => { setSustainabilityScheme(s); Haptics.selectionAsync(); }}
                style={[styles.chip, sustainabilityScheme === s && { ...styles.chipSelected, borderColor: "#16a34a", backgroundColor: "#dcfce7" }]}
              >
                <Text style={[styles.chipText, sustainabilityScheme === s && { color: "#16a34a", fontFamily: fonts.semiBold }]}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <Input
            label="Certification Reference"
            value={certificationRef}
            onChangeText={setCertificationRef}
            placeholder="Your ISCC cert number for this delivery"
            style={{ marginTop: spacing.sm }}
          />
          <Input
            label="Sustainability Declaration Reference"
            value={sustainabilityDeclarationRef}
            onChangeText={setSustainabilityDeclarationRef}
            placeholder="e.g. SD-2024-001"
            style={{ marginTop: spacing.sm }}
          />
          <Input
            label="GHG Saving (%)"
            value={ghgSavingPercent}
            onChangeText={setGhgSavingPercent}
            placeholder="e.g. 65"
            keyboardType="decimal-pad"
            style={{ marginTop: spacing.sm }}
          />
        </View>

        <View style={styles.section}>
          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Additional notes" multiline numberOfLines={3} />
        </View>

        <View style={styles.submitSection}>
          <Button title={saving ? "Saving..." : "Save Delivery Record"} onPress={handleSave} disabled={saving} />
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
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipSelected: { borderColor: "#d97706", backgroundColor: "#fef3c7" },
  chipText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { fontFamily: fonts.semiBold, color: "#d97706" },
  submitSection: { marginHorizontal: spacing.lg, marginTop: spacing.sm },
});
