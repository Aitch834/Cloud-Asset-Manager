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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { EnvironmentalFeature } from "@/lib/types";

const FEATURE_TYPES: { value: string; label: string }[] = [
  { value: "hedgerow",          label: "Hedgerow" },
  { value: "ditch",             label: "Ditch / Watercourse" },
  { value: "pond",              label: "Pond" },
  { value: "woodland",          label: "Woodland / Copse" },
  { value: "tree_belt",         label: "Tree Belt / Shelterbelt" },
  { value: "sssi",              label: "SSSI Area" },
  { value: "field_corner",      label: "Field Corner Buffer" },
  { value: "grass_buffer",      label: "Grass Buffer Strip" },
  { value: "wildflower_strip",  label: "Wildflower / Pollen Strip" },
  { value: "wetland",           label: "Wetland / Marsh" },
  { value: "ancient_woodland",  label: "Ancient Woodland" },
  { value: "stone_wall",        label: "Stone Wall / Boundary" },
  { value: "earth_bank",        label: "Earth Bank / Bund" },
  { value: "in_field_tree",     label: "In-field Tree(s)" },
  { value: "other",             label: "Other" },
];

const MANAGEMENT_PRACTICES: string[] = [
  "Annual coppicing",
  "Biennial trimming",
  "Mechanical trimming",
  "Grazing management",
  "No management (natural)",
  "Regular mowing / cutting",
  "Scrub clearance",
  "Tree works / surgery",
  "Restoration / replanting",
  "Water level management",
  "Other",
];

export default function EnvironmentalFeatureScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const [featureType, setFeatureType]               = useState("");
  const [description, setDescription]               = useState("");
  const [areaHectares, setAreaHectares]             = useState("");
  const [lengthMetres, setLengthMetres]             = useState("");
  const [isEnclosed, setIsEnclosed]                 = useState(false);
  const [managementPractice, setManagementPractice] = useState("");
  const [dateRecorded, setDateRecorded]             = useState(today);
  const [latitude, setLatitude]                     = useState<number | undefined>();
  const [longitude, setLongitude]                   = useState<number | undefined>();
  const [photoTaken, setPhotoTaken]                 = useState(false);
  const [notes, setNotes]                           = useState("");

  const [showTypePicker, setShowTypePicker]         = useState(false);
  const [showPracticePicker, setShowPracticePicker] = useState(false);

  const typeLabel = FEATURE_TYPES.find(t => t.value === featureType)?.label ?? "";

  const handleGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLatitude(loc.coords.latitude);
        setLongitude(loc.coords.longitude);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {}
  };

  const handleSave = async () => {
    if (!featureType) {
      Alert.alert("Required Fields", "Please select a feature type.");
      return;
    }
    if (!currentFarm?.id) {
      Alert.alert("No Farm", "Please select a farm first.");
      return;
    }
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: EnvironmentalFeature = {
      id: generateId(),
      farmId: currentFarm.id,
      featureType,
      description: description.trim(),
      areaHectares: areaHectares.trim(),
      lengthMetres: lengthMetres.trim(),
      isEnclosed,
      managementPractice: managementPractice.trim(),
      dateRecorded,
      latitude,
      longitude,
      photoTaken,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.ENVIRONMENTAL_FEATURES, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Environmental feature registered and queued for sync.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Register Environmental Feature</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          {/* Feature Type */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Feature Type *</Text>
            <Pressable onPress={() => { Haptics.selectionAsync(); setShowTypePicker(true); }} style={styles.selectButton}>
              <Text style={[styles.selectText, !featureType && styles.placeholder]}>
                {typeLabel || "Select feature type…"}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Input
            label="Description"
            placeholder="e.g. Mixed species hedgerow along north boundary, approximately 200m"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Input
            label="Date Recorded"
            placeholder={today}
            value={dateRecorded}
            onChangeText={setDateRecorded}
            maxDate="today"
          />

          {/* Dimensions */}
          <Text style={styles.sectionLabel}>Dimensions</Text>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Input
                label="Area (ha)"
                placeholder="e.g. 0.50"
                value={areaHectares}
                onChangeText={setAreaHectares}
                keyboardType="decimal-pad"
                containerStyle={styles.flex}
              />
            </View>
            <View style={styles.halfField}>
              <Input
                label="Length (m)"
                placeholder="e.g. 200"
                value={lengthMetres}
                onChangeText={setLengthMetres}
                keyboardType="decimal-pad"
                containerStyle={styles.flex}
              />
            </View>
          </View>

          <Pressable onPress={() => { Haptics.selectionAsync(); setIsEnclosed(v => !v); }} style={styles.toggleRow}>
            <View style={[styles.toggleBox, isEnclosed && styles.toggleBoxActive]}>
              {isEnclosed && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={styles.toggleLabel}>Enclosed feature (e.g. fenced pond, enclosed woodland)</Text>
          </Pressable>

          {/* GPS */}
          <Pressable onPress={handleGps} style={styles.gpsButton}>
            <Feather name="map-pin" size={16} color={latitude ? colors.success : colors.primary} />
            <Text style={[styles.gpsText, latitude !== undefined ? { color: colors.success } : null]}>
              {latitude !== undefined
                ? `GPS: ${latitude.toFixed(5)}, ${longitude?.toFixed(5)}`
                : "Capture GPS Location (feature centroid)"}
            </Text>
          </Pressable>

          {/* Management Practice */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Management Practice</Text>
            <Pressable onPress={() => { Haptics.selectionAsync(); setShowPracticePicker(true); }} style={styles.selectButton}>
              <Text style={[styles.selectText, !managementPractice && styles.placeholder]}>
                {managementPractice || "Select management practice…"}
              </Text>
              <Feather name="chevron-down" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Photo */}
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Photo Taken</Text>
              <Text style={styles.switchSub}>Confirm a photo was taken to document this feature</Text>
            </View>
            <Switch value={photoTaken} onValueChange={setPhotoTaken} trackColor={{ false: colors.border, true: colors.success }} thumbColor="#fff" />
          </View>

          <Input
            label="Notes"
            placeholder="Condition, designation, scheme associations, follow-up needed…"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button title="Register Feature" onPress={handleSave} loading={saving} fullWidth icon="check" />
          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Feature type picker */}
      {showTypePicker && (
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Select Feature Type</Text>
              <Pressable onPress={() => setShowTypePicker(false)}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {FEATURE_TYPES.map(t => (
                <Pressable key={t.value} onPress={() => { setFeatureType(t.value); Haptics.selectionAsync(); setShowTypePicker(false); }}
                  style={[styles.sheetItem, featureType === t.value && styles.sheetItemSelected]}>
                  <Text style={[styles.sheetItemText, featureType === t.value && styles.sheetItemTextSelected]}>{t.label}</Text>
                  {featureType === t.value && <Feather name="check" size={16} color={colors.primary} />}
                </Pressable>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      )}

      {/* Management practice picker */}
      {showPracticePicker && (
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Management Practice</Text>
              <Pressable onPress={() => setShowPracticePicker(false)}>
                <Feather name="x" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {MANAGEMENT_PRACTICES.map(p => (
                <Pressable key={p} onPress={() => { setManagementPractice(p); Haptics.selectionAsync(); setShowPracticePicker(false); }}
                  style={[styles.sheetItem, managementPractice === p && styles.sheetItemSelected]}>
                  <Text style={[styles.sheetItemText, managementPractice === p && styles.sheetItemTextSelected]}>{p}</Text>
                  {managementPractice === p && <Feather name="check" size={16} color={colors.primary} />}
                </Pressable>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  fieldGroup: { marginBottom: spacing.lg },
  sectionLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: spacing.sm },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.xs },
  selectButton: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, minHeight: 44 },
  selectText: { fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.text, flex: 1 },
  placeholder: { color: colors.textTertiary },
  row: { flexDirection: "row", gap: spacing.md },
  halfField: { flex: 1 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg, marginTop: -spacing.sm },
  toggleBox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" },
  toggleBoxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  gpsButton: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginBottom: spacing.lg },
  gpsText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.primary, flex: 1 },
  switchRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  switchLabel: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.text },
  switchSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: "75%", paddingTop: spacing.lg, paddingHorizontal: spacing.lg },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  sheetTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  sheetItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderRadius: radius.sm },
  sheetItemSelected: { backgroundColor: colors.successBg },
  sheetItemText: { fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.text, flex: 1 },
  sheetItemTextSelected: { fontFamily: fonts.medium, color: colors.primary },
});
