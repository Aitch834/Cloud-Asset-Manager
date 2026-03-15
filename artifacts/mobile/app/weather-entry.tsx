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
import type { WeatherEntry } from "@/lib/types";

const CONDITIONS = ["Sunny", "Partly Cloudy", "Cloudy", "Overcast", "Light Rain", "Heavy Rain", "Drizzle", "Fog", "Windy", "Stormy", "Snow", "Frost"];

const ENTRY_MODES: { key: "manual" | "station"; label: string; icon: "edit-3" | "radio" }[] = [
  { key: "manual", label: "Manual Entry", icon: "edit-3" },
  { key: "station", label: "Weather Station", icon: "radio" },
];

export default function WeatherEntryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [entryMode, setEntryMode] = useState<"manual" | "station">("manual");
  const [temperatureHigh, setTemperatureHigh] = useState("");
  const [temperatureLow, setTemperatureLow] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [windDirection, setWindDirection] = useState("");
  const [pressure, setPressure] = useState("");
  const [conditions, setConditions] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!conditions) {
      Alert.alert("Required", "Please select the weather conditions.");
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
      console.warn("Weather entry location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const now = new Date().toISOString();

    const entry: WeatherEntry = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      date: now.split("T")[0],
      temperatureHigh: temperatureHigh.trim(),
      temperatureLow: temperatureLow.trim(),
      rainfall: rainfall.trim(),
      windSpeed: windSpeed.trim(),
      windDirection: windDirection.trim(),
      pressure: pressure.trim(),
      conditions,
      entryMode,
      notes: notes.trim(),
      latitude,
      longitude,
      recordedAt: now,
      createdAt: now,
      synced: false,
    };

    await appendToList(STORAGE_KEYS.WEATHER_ENTRIES, entry);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Weather entry saved successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Weather Entry</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.form}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.dateLabel}>
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </Text>

          <View style={styles.sectionLabel}>
            <Feather name="settings" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Entry Mode</Text>
          </View>
          <View style={styles.modeRow}>
            {ENTRY_MODES.map((m) => (
              <Pressable
                key={m.key}
                onPress={() => {
                  Haptics.selectionAsync();
                  setEntryMode(m.key);
                }}
                style={[
                  styles.modeButton,
                  entryMode === m.key && styles.modeButtonActive,
                ]}
              >
                <Feather
                  name={m.icon}
                  size={16}
                  color={entryMode === m.key ? colors.textInverse : colors.textSecondary}
                />
                <Text style={[
                  styles.modeText,
                  entryMode === m.key && styles.modeTextActive,
                ]}>
                  {m.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="cloud" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Conditions</Text>
          </View>
          <View style={styles.conditionsGrid}>
            {CONDITIONS.map((c) => (
              <Pressable
                key={c}
                onPress={() => {
                  Haptics.selectionAsync();
                  setConditions(c);
                }}
                style={[
                  styles.conditionChip,
                  conditions === c && styles.conditionChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.conditionChipText,
                    conditions === c && styles.conditionChipTextActive,
                  ]}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="thermometer" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Temperature</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="High (\u00B0C)"
              placeholder="e.g. 18"
              value={temperatureHigh}
              onChangeText={setTemperatureHigh}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Low (\u00B0C)"
              placeholder="e.g. 8"
              value={temperatureLow}
              onChangeText={setTemperatureLow}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="droplet" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Precipitation & Atmosphere</Text>
          </View>
          <Input
            label="Rainfall (mm)"
            placeholder="e.g. 2.5"
            value={rainfall}
            onChangeText={setRainfall}
            keyboardType="decimal-pad"
          />
          <View style={styles.row}>
            <Input
              label="Wind Speed (mph)"
              placeholder="e.g. 12"
              value={windSpeed}
              onChangeText={setWindSpeed}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Direction"
              placeholder="e.g. NW"
              value={windDirection}
              onChangeText={setWindDirection}
              containerStyle={styles.flex}
            />
          </View>
          <Input
            label="Pressure (hPa)"
            placeholder="e.g. 1013"
            value={pressure}
            onChangeText={setPressure}
            keyboardType="decimal-pad"
          />

          <Input
            label="Notes"
            placeholder="Any additional observations..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Weather Entry"
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
  dateLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.primary,
    marginBottom: spacing.lg,
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
  modeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  modeTextActive: {
    color: colors.textInverse,
  },
  conditionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  conditionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  conditionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  conditionChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
  },
  conditionChipTextActive: {
    color: colors.textInverse,
  },
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
});
