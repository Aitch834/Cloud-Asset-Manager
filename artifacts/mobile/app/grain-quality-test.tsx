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
import type { GrainQualityTest } from "@/lib/types";

type PassFail = GrainQualityTest["passOrFail"];

const CROP_TYPES = ["Wheat", "Barley", "Oilseed Rape", "Oats", "Rye", "Maize", "Beans", "Peas", "Other"];
const RESULT_OPTIONS: { key: PassFail; label: string; color: string }[] = [
  { key: "pass", label: "Pass", color: colors.success },
  { key: "conditional", label: "Conditional Pass", color: colors.accent },
  { key: "fail", label: "Fail", color: colors.error },
];

export default function GrainQualityTestScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const [binReference, setBinReference] = useState("");
  const [cropType, setCropType] = useState("");
  const [variety, setVariety] = useState("");
  const [sampleDate, setSampleDate] = useState(today);
  const [moisture, setMoisture] = useState("");
  const [protein, setProtein] = useState("");
  const [specificWeight, setSpecificWeight] = useState("");
  const [hagberg, setHagberg] = useState("");
  const [screenings, setScreenings] = useState("");
  const [mycotoxin, setMycotoxin] = useState("");
  const [testedBy, setTestedBy] = useState(user?.name || "");
  const [labReference, setLabReference] = useState("");
  const [passOrFail, setPassOrFail] = useState<PassFail>("pass");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!binReference.trim() || !cropType.trim()) {
      Alert.alert("Required Fields", "Please enter the bin reference and crop type.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: GrainQualityTest = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      binReference: binReference.trim(),
      cropType: cropType.trim(),
      variety: variety.trim(),
      sampleDate,
      moisture: moisture.trim(),
      protein: protein.trim(),
      specificWeight: specificWeight.trim(),
      hagbergFallingNumber: hagberg.trim(),
      screenings: screenings.trim(),
      mycotoxinResult: mycotoxin.trim(),
      testedBy: testedBy.trim(),
      labReference: labReference.trim(),
      passOrFail,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.GRAIN_QUALITY_TESTS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Grain quality test saved offline and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
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
            <Text style={styles.title}>Grain Quality Test</Text>
            <Text style={styles.subtitle}>Moisture, protein, Hagberg & more</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.sectionTitle}>Bin / Store</Text>
          <Input label="Bin / Store Reference *" value={binReference} onChangeText={setBinReference} placeholder="e.g. Bin 3 / Flat Store A" />
          <Input label="Sample Date" value={sampleDate} onChangeText={setSampleDate} placeholder="YYYY-MM-DD" />

          <Text style={styles.sectionTitle}>Crop</Text>
          <Text style={styles.label}>Crop Type *</Text>
          <View style={styles.chipRow}>
            {CROP_TYPES.map((c) => (
              <Pressable key={c} onPress={() => setCropType(c)} style={[styles.chip, cropType === c && styles.chipActive]}>
                <Text style={[styles.chipText, cropType === c && styles.chipTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <Input label="Variety" value={variety} onChangeText={setVariety} placeholder="e.g. KWS Zyatt" />

          <Text style={styles.sectionTitle}>Quality Parameters</Text>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Moisture (%)" value={moisture} onChangeText={setMoisture} placeholder="e.g. 14.5" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Protein (%)" value={protein} onChangeText={setProtein} placeholder="e.g. 12.0" keyboardType="decimal-pad" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Specific Weight (kg/hl)" value={specificWeight} onChangeText={setSpecificWeight} placeholder="e.g. 76.0" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Hagberg Falling Number" value={hagberg} onChangeText={setHagberg} placeholder="e.g. 250" keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input label="Screenings (%)" value={screenings} onChangeText={setScreenings} placeholder="e.g. 2.1" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="Mycotoxin Result (ppb)" value={mycotoxin} onChangeText={setMycotoxin} placeholder="e.g. <20" />
            </View>
          </View>

          <Text style={styles.sectionTitle}>Testing</Text>
          <Input label="Tested By" value={testedBy} onChangeText={setTestedBy} placeholder="Name or lab" />
          <Input label="Lab / Certificate Reference" value={labReference} onChangeText={setLabReference} placeholder="Lab ref number" />

          <Text style={styles.label}>Overall Result</Text>
          <View style={styles.chipRow}>
            {RESULT_OPTIONS.map((r) => (
              <Pressable key={r.key} onPress={() => setPassOrFail(r.key)} style={[styles.chip, passOrFail === r.key && { borderColor: r.color, backgroundColor: r.color + "20" }]}>
                <Text style={[styles.chipText, passOrFail === r.key && { color: r.color, fontFamily: fonts.semiBold }]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>

          <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Any additional observations…" multiline numberOfLines={3} />

          <Button title={saving ? "Saving…" : "Save Quality Test"} onPress={handleSave} disabled={saving} style={styles.saveButton} />
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
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: spacing.md },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary + "15" },
  chipText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  chipTextActive: { color: colors.primary, fontFamily: fonts.semiBold },
  saveButton: { marginTop: spacing.lg },
});
