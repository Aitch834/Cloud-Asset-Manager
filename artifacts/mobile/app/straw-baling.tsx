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

const STRAW_TYPES = ["Wheat Straw", "Barley Straw", "Oat Straw", "Oilseed Rape Straw"];
const BALE_FORMATS = ["Small Rectangular", "Big Round", "Big Square"];
const WEATHER_OPTIONS = ["Sunny", "Dry & Windy", "Overcast", "Light Rain", "Humid", "Cloudy", "Hot & Dry"];
const SOIL_OPTIONS = ["Dry", "Slightly Moist", "Moist", "Wet"];

export default function StrawBalingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [operationDate, setOperationDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [fieldOfOrigin, setFieldOfOrigin] = useState("");
  const [strawType, setStrawType] = useState("Wheat Straw");
  const [baleFormat, setBaleFormat] = useState("Big Round");
  const [cropVariety, setCropVariety] = useState("");
  const [areaHa, setAreaHa] = useState("");
  const [totalBalesProduced, setTotalBalesProduced] = useState("");
  const [baleWeightKg, setBaleWeightKg] = useState("");
  const [tractorDescription, setTractorDescription] = useState("");
  const [balerDescription, setBalerDescription] = useState("");
  const [operatorName, setOperatorName] = useState("");
  const [machineHours, setMachineHours] = useState("");
  const [labourHours, setLabourHours] = useState("");
  const [weatherConditions, setWeatherConditions] = useState("");
  const [temperatureC, setTemperatureC] = useState("");
  const [soilConditions, setSoilConditions] = useState("");
  const [notes, setNotes] = useState("");

  async function save() {
    if (!totalBalesProduced || isNaN(Number(totalBalesProduced)) || Number(totalBalesProduced) <= 0) {
      Alert.alert("Required", "Please enter the total number of bales produced.");
      return;
    }
    if (!operationDate) {
      Alert.alert("Required", "Please enter the operation date.");
      return;
    }
    if (!currentFarm) {
      Alert.alert("Error", "No farm selected.");
      return;
    }
    setSaving(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const record = {
        id: generateId(),
        farmId: currentFarm.id,
        operationDate,
        fieldOfOrigin: fieldOfOrigin || null,
        strawType,
        baleFormat,
        cropVariety: cropVariety || null,
        areaHa: areaHa ? Number(areaHa) : null,
        totalBalesProduced: Number(totalBalesProduced),
        baleWeightKg: baleWeightKg ? Number(baleWeightKg) : null,
        tractorDescription: tractorDescription || null,
        balerDescription: balerDescription || null,
        operatorName: operatorName || null,
        machineHours: machineHours || null,
        labourHours: labourHours || null,
        weatherConditions: weatherConditions || null,
        temperatureC: temperatureC || null,
        soilConditions: soilConditions || null,
        notes: notes || null,
        status: "open",
        createdAt: new Date().toISOString(),
      };
      await appendToList(STORAGE_KEYS.PENDING_SYNC, {
        id: generateId(),
        recordType: "bde_straw_baling_operations",
        data: record,
        createdAt: new Date().toISOString(),
      });
      await refreshPendingCount();
      Alert.alert("Saved", "Baling operation saved — it will sync when you're online.", [
        { text: "Add Cartage Journey", onPress: () => router.back() },
        { text: "Record Another", onPress: resetForm },
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert("Error", "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setOperationDate(new Date().toISOString().slice(0, 10));
    setFieldOfOrigin(""); setStrawType("Wheat Straw"); setBaleFormat("Big Round");
    setCropVariety(""); setAreaHa(""); setTotalBalesProduced(""); setBaleWeightKg("");
    setTractorDescription(""); setBalerDescription(""); setOperatorName("");
    setMachineHours(""); setLabourHours(""); setWeatherConditions("");
    setTemperatureC(""); setSoilConditions(""); setNotes("");
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Baling Operation</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Feather name="info" size={14} color="#92400e" style={{ marginTop: 1 }} />
          <Text style={styles.infoText}>
            Phase 1 of 3: Record the baler's output for this field session. Use Straw Cartage to log individual trailer journeys.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operation Details</Text>

          <Text style={styles.label}>Date *</Text>
          <Input
            value={operationDate}
            onChangeText={setOperationDate}
            placeholder="YYYY-MM-DD"
            style={styles.input}
          />

          <Text style={styles.label}>Field of Origin</Text>
          <Input
            value={fieldOfOrigin}
            onChangeText={setFieldOfOrigin}
            placeholder="e.g. North Field, Home Farm"
            style={styles.input}
          />

          <Text style={styles.label}>Straw Type</Text>
          <View style={styles.chipRow}>
            {STRAW_TYPES.map(t => (
              <Pressable
                key={t}
                style={[styles.chip, strawType === t && styles.chipActive]}
                onPress={() => setStrawType(t)}
              >
                <Text style={[styles.chipText, strawType === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Bale Format</Text>
          <View style={styles.chipRow}>
            {BALE_FORMATS.map(t => (
              <Pressable
                key={t}
                style={[styles.chip, baleFormat === t && styles.chipActive]}
                onPress={() => setBaleFormat(t)}
              >
                <Text style={[styles.chipText, baleFormat === t && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Crop Variety</Text>
          <Input
            value={cropVariety}
            onChangeText={setCropVariety}
            placeholder="e.g. Skyfall, Crusoe"
            style={styles.input}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Area Baled (ha)</Text>
              <Input
                value={areaHa}
                onChangeText={setAreaHa}
                keyboardType="decimal-pad"
                placeholder="0.0"
                style={styles.input}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Bale Weight (kg)</Text>
              <Input
                value={baleWeightKg}
                onChangeText={setBaleWeightKg}
                keyboardType="decimal-pad"
                placeholder="e.g. 300"
                style={styles.input}
              />
            </View>
          </View>

          <Text style={styles.label}>Total Bales Produced *</Text>
          <Input
            value={totalBalesProduced}
            onChangeText={setTotalBalesProduced}
            keyboardType="number-pad"
            placeholder="e.g. 320"
            style={styles.input}
          />
          <Text style={styles.hint}>Total count from the baler on this session</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Machine & Labour</Text>

          <Text style={styles.label}>Tractor / Power Unit</Text>
          <Input
            value={tractorDescription}
            onChangeText={setTractorDescription}
            placeholder="e.g. JD 6175R — AB23 XYZ"
            style={styles.input}
          />

          <Text style={styles.label}>Baler / Implement</Text>
          <Input
            value={balerDescription}
            onChangeText={setBalerDescription}
            placeholder="e.g. Claas Variant 460"
            style={styles.input}
          />

          <Text style={styles.label}>Operator Name</Text>
          <Input
            value={operatorName}
            onChangeText={setOperatorName}
            placeholder="e.g. John Smith"
            style={styles.input}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Machine Hours</Text>
              <Input
                value={machineHours}
                onChangeText={setMachineHours}
                keyboardType="decimal-pad"
                placeholder="0.0"
                style={styles.input}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Labour Hours</Text>
              <Input
                value={labourHours}
                onChangeText={setLabourHours}
                keyboardType="decimal-pad"
                placeholder="0.0"
                style={styles.input}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weather Conditions</Text>

          <Text style={styles.label}>Conditions</Text>
          <View style={styles.chipRow}>
            {WEATHER_OPTIONS.map(w => (
              <Pressable
                key={w}
                style={[styles.chip, weatherConditions === w && styles.chipActive]}
                onPress={() => setWeatherConditions(weatherConditions === w ? "" : w)}
              >
                <Text style={[styles.chipText, weatherConditions === w && styles.chipTextActive]}>{w}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Temperature (°C)</Text>
              <Input
                value={temperatureC}
                onChangeText={setTemperatureC}
                keyboardType="decimal-pad"
                placeholder="e.g. 22"
                style={styles.input}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Soil Conditions</Text>
              <View style={[styles.chipRow, { marginTop: 4 }]}>
                {SOIL_OPTIONS.map(s => (
                  <Pressable
                    key={s}
                    style={[styles.chip, soilConditions === s && styles.chipActive, { marginBottom: 4 }]}
                    onPress={() => setSoilConditions(soilConditions === s ? "" : s)}
                  >
                    <Text style={[styles.chipText, soilConditions === s && styles.chipTextActive]}>{s}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional details…"
            multiline
            numberOfLines={3}
            style={[styles.input, { minHeight: 72, textAlignVertical: "top" }]}
          />
        </View>

        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm }}>
          <Button
            title={saving ? "Saving…" : "Save Baling Operation"}
            onPress={save}
            disabled={saving}
            style={styles.saveBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { padding: spacing.xs, borderRadius: radius.sm },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  infoBanner: {
    flexDirection: "row", gap: 8, alignItems: "flex-start",
    backgroundColor: "#fef3c7", borderBottomWidth: 1, borderBottomColor: "#fde68a",
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  infoText: { flex: 1, fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#92400e" },
  section: {
    backgroundColor: colors.surface, marginHorizontal: spacing.md,
    marginTop: spacing.md, borderRadius: radius.md, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.md,
  },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: 4, marginTop: spacing.sm },
  input: { marginBottom: 0 },
  hint: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.sm },
  half: { flex: 1 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginBottom: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm, paddingVertical: 5,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: "#d97706", borderColor: "#d97706" },
  chipText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },
  chipTextActive: { color: "#fff", fontFamily: fonts.medium },
  saveBtn: { marginBottom: spacing.sm },
});
