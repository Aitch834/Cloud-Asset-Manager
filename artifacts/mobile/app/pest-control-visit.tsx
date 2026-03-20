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
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PestControlVisit } from "@/lib/types";
import { usePrint } from "@/lib/hooks/usePrint";
import { pestControlHtml } from "@/lib/printTemplates";

const COMMON_LOCATIONS = [
  "Grain store", "Feed store", "Cattle shed", "Dairy parlour",
  "Poultry house", "Pig building", "Workshop / yard", "Hedge / perimeter", "Other",
];

const PEST_TYPES = [
  { key: "rats-mice", label: "Rats / Mice", icon: "alert-circle" as const, color: "#92400E" },
  { key: "rabbits", label: "Rabbits", icon: "circle" as const, color: colors.fieldBrown },
  { key: "foxes", label: "Foxes", icon: "alert-triangle" as const, color: colors.accent },
  { key: "pigeons", label: "Pigeons", icon: "wind" as const, color: colors.textSecondary },
  { key: "slugs", label: "Slugs", icon: "droplet" as const, color: colors.success },
  { key: "other", label: "Other", icon: "more-horizontal" as const, color: colors.textTertiary },
];

export default function PestControlVisitScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const { print, savePdf } = usePrint();
  const [saving, setSaving] = useState(false);

  const [location, setLocation] = useState("");
  const [pestType, setPestType] = useState("");
  const [activityObserved, setActivityObserved] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [baitUsed, setBaitUsed] = useState("");
  const [carriedOutBy, setCarriedOutBy] = useState(user?.name || "");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!location.trim() || !pestType) {
      Alert.alert("Required Fields", "Please enter a location and select a pest type.");
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

    const record: PestControlVisit = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      location: location.trim(),
      visitDate: new Date().toISOString(),
      pestType,
      activityObserved: activityObserved.trim(),
      actionTaken: actionTaken.trim(),
      baitUsed: baitUsed.trim(),
      carriedOutBy: carriedOutBy.trim(),
      notes: notes.trim(),
      latitude,
      longitude,
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.PEST_CONTROL_VISITS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Pest control visit saved. Print or save the visit record?", [
      { text: "Print", onPress: async () => { await print(pestControlHtml(record, currentFarm)); router.back(); } },
      { text: "Save PDF", onPress: async () => { await savePdf(pestControlHtml(record, currentFarm), "Pest Control Visit"); router.back(); } },
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Pest Control Visit</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.fieldBrown} />
            <Text style={styles.sectionTitle}>Location <Text style={styles.required}>*</Text></Text>
          </View>
          <View style={styles.chipGrid}>
            {COMMON_LOCATIONS.map((loc) => {
              const selected = location === loc;
              return (
                <Pressable
                  key={loc}
                  onPress={() => { Haptics.selectionAsync(); setLocation(loc); }}
                  style={[styles.chip, selected && { backgroundColor: "#fef3c7", borderColor: "#d97706" }]}
                >
                  <Text style={[styles.chipText, selected && { color: "#d97706", fontFamily: fonts.semiBold }]}>{loc}</Text>
                </Pressable>
              );
            })}
          </View>
          <Input
            placeholder="Or type a specific location…"
            value={location}
            onChangeText={setLocation}
          />

          <View style={styles.sectionLabel}>
            <Feather name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Pest Type</Text>
          </View>
          <View style={styles.chipGrid}>
            {PEST_TYPES.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => { Haptics.selectionAsync(); setPestType(p.key); }}
                style={[
                  styles.chip,
                  pestType === p.key && { backgroundColor: p.color, borderColor: p.color },
                ]}
              >
                <Feather name={p.icon} size={14} color={pestType === p.key ? colors.textInverse : p.color} />
                <Text style={[styles.chipText, pestType === p.key && { color: colors.textInverse }]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="eye" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Observations & Actions</Text>
          </View>
          <Input
            label="Activity Observed"
            placeholder="e.g. Fresh droppings, bait taken, 3 rats caught, burrow activity"
            value={activityObserved}
            onChangeText={setActivityObserved}
            multiline
            numberOfLines={3}
          />
          <Input
            label="Action Taken"
            placeholder="e.g. Bait replenished, traps checked and reset, burrow blocked"
            value={actionTaken}
            onChangeText={setActionTaken}
            multiline
            numberOfLines={2}
          />
          <Input
            label="Bait / Product Used"
            placeholder="e.g. Bromadiolone block bait, snap traps"
            value={baitUsed}
            onChangeText={setBaitUsed}
          />

          <View style={styles.sectionLabel}>
            <Feather name="user" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Carried Out By</Text>
          </View>
          <Input
            label="Operator Name"
            value={carriedOutBy}
            onChangeText={setCarriedOutBy}
            placeholder="Your name"
          />
          <Input
            label="Notes"
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={2}
          />

          <Button
            title="Save Pest Control Visit"
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
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
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
  required: { color: colors.error },
});
