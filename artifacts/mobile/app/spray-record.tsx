import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, getList, STORAGE_KEYS } from "@/lib/storage";
import type { FieldBoundary, SprayRecord, WeatherEntry } from "@/lib/types";

function isPointInPolygon(
  point: { latitude: number; longitude: number },
  polygon: { latitude: number; longitude: number }[],
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude;
    const yi = polygon[i].longitude;
    const xj = polygon[j].latitude;
    const yj = polygon[j].longitude;
    const intersect = yi > point.longitude !== yj > point.longitude &&
      point.latitude < ((xj - xi) * (point.longitude - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export default function SprayRecordScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm, user } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [fieldName, setFieldName] = useState("");
  const [productName, setProductName] = useState("");
  const [applicationRate, setApplicationRate] = useState("");
  const [applicationUnit, setApplicationUnit] = useState("L/ha");
  const [windSpeed, setWindSpeed] = useState("");
  const [windDirection, setWindDirection] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [pressure, setPressure] = useState("");
  const [equipmentUsed, setEquipmentUsed] = useState("");
  const [notes, setNotes] = useState("");

  const [detectedField, setDetectedField] = useState<FieldBoundary | null>(null);
  const [linkedWeather, setLinkedWeather] = useState<WeatherEntry | null>(null);
  const [fields, setFields] = useState<FieldBoundary[]>([]);

  const detectFieldFromGPS = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const point = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };

      const allFields = await getList<FieldBoundary>(STORAGE_KEYS.FIELD_BOUNDARIES, currentFarm?.id);
      setFields(allFields);

      for (const field of allFields) {
        if (field.coordinates.length >= 3 && isPointInPolygon(point, field.coordinates)) {
          setDetectedField(field);
          setFieldName(field.fieldName);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return;
        }
      }
    } catch (locErr: unknown) {
      console.warn("GPS field detection unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }
  }, [currentFarm?.id]);

  const linkTodayWeather = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const entries = await getList<WeatherEntry>(STORAGE_KEYS.WEATHER_ENTRIES, currentFarm?.id);
    const todayEntry = entries.find((e) => e.date === today);
    if (todayEntry) {
      setLinkedWeather(todayEntry);
      if (!windSpeed) setWindSpeed(todayEntry.windSpeed);
      if (!windDirection) setWindDirection(todayEntry.windDirection);
      if (!temperature) setTemperature(todayEntry.temperatureHigh);
      if (!pressure) setPressure(todayEntry.pressure);
    }
  }, [currentFarm?.id]);

  useEffect(() => {
    detectFieldFromGPS();
    linkTodayWeather();
  }, [detectFieldFromGPS, linkTodayWeather]);

  const handleSave = async () => {
    if (!fieldName.trim() || !productName.trim()) {
      Alert.alert("Required Fields", "Please enter the field name and product name.");
      return;
    }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    let latitude: number | undefined;
    let longitude: number | undefined;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch (locErr: unknown) {
      console.warn("Spray record location unavailable:", locErr instanceof Error ? locErr.message : "unknown");
    }

    const record: SprayRecord = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      fieldName: fieldName.trim(),
      productName: productName.trim(),
      applicationRate: applicationRate.trim(),
      applicationUnit,
      windSpeed: windSpeed.trim(),
      windDirection: windDirection.trim(),
      temperature: temperature.trim(),
      humidity: humidity.trim(),
      pressure: pressure.trim(),
      operatorName: user?.name || "",
      equipmentUsed: equipmentUsed.trim(),
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString(),
      notes: notes.trim(),
      latitude,
      longitude,
      linkedWeatherDate: linkedWeather?.date || "",
      detectedFieldId: detectedField?.id || "",
      photoIds: [],
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.SPRAY_RECORDS, record);
    await refreshPendingCount();
    setSaving(false);
    Alert.alert("Saved", "Spray record saved successfully.", [
      { text: "OK", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Spray Record</Text>
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
          {detectedField && (
            <View style={styles.detectedBanner}>
              <Feather name="navigation" size={14} color={colors.success} />
              <Text style={styles.detectedText}>
                GPS detected: {detectedField.fieldName}
              </Text>
              <Badge text="Auto" variant="success" />
            </View>
          )}

          {linkedWeather && (
            <View style={styles.linkedBanner}>
              <Feather name="cloud" size={14} color={colors.info} />
              <Text style={styles.linkedText}>
                Weather linked from today's entry ({linkedWeather.conditions})
              </Text>
            </View>
          )}

          <View style={styles.sectionLabel}>
            <Feather name="map-pin" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Location</Text>
          </View>
          <Input
            label="Field Name"
            placeholder="e.g. Top Field, 20 Acre"
            value={fieldName}
            onChangeText={setFieldName}
            icon="map"
            required
          />
          {!detectedField && fields.length > 0 && (
            <View style={styles.fieldSuggestions}>
              <Text style={styles.suggestionLabel}>Saved fields:</Text>
              <View style={styles.chipRow}>
                {fields.slice(0, 5).map((f) => (
                  <Pressable
                    key={f.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setFieldName(f.fieldName);
                      setDetectedField(f);
                    }}
                    style={styles.fieldChip}
                  >
                    <Text style={styles.fieldChipText}>{f.fieldName}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          <View style={styles.sectionLabel}>
            <Feather name="droplet" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Product Details</Text>
          </View>
          <Input
            label="Product Name"
            placeholder="e.g. Roundup, Galaxy"
            value={productName}
            onChangeText={setProductName}
            required
          />
          <View style={styles.row}>
            <Input
              label="Application Rate"
              placeholder="e.g. 3.0"
              value={applicationRate}
              onChangeText={setApplicationRate}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Unit"
              placeholder="L/ha"
              value={applicationUnit}
              onChangeText={setApplicationUnit}
              containerStyle={{ width: 100 }}
            />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="cloud" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Weather Conditions</Text>
          </View>
          <View style={styles.row}>
            <Input
              label="Wind Speed (mph)"
              placeholder="e.g. 8"
              value={windSpeed}
              onChangeText={setWindSpeed}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Wind Direction"
              placeholder="e.g. NW"
              value={windDirection}
              onChangeText={setWindDirection}
              containerStyle={styles.flex}
            />
          </View>
          <View style={styles.row}>
            <Input
              label="Temperature (\u00B0C)"
              placeholder="e.g. 14"
              value={temperature}
              onChangeText={setTemperature}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Humidity (%)"
              placeholder="e.g. 65"
              value={humidity}
              onChangeText={setHumidity}
              keyboardType="decimal-pad"
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

          <View style={styles.sectionLabel}>
            <Feather name="tool" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Equipment & Notes</Text>
          </View>
          <Input
            label="Equipment Used"
            placeholder="e.g. 24m sprayer"
            value={equipmentUsed}
            onChangeText={setEquipmentUsed}
          />
          <Input
            label="Notes"
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <Button
            title="Save Spray Record"
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
  detectedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.successBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  detectedText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.success,
    flex: 1,
  },
  linkedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.infoBg,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  linkedText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.info,
    flex: 1,
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
  row: {
    flexDirection: "row",
    gap: spacing.md,
  },
  fieldSuggestions: {
    marginBottom: spacing.md,
  },
  suggestionLabel: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  fieldChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fieldChipText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
});
