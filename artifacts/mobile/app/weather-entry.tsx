import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { LookupPicker } from "@/components/ui/LookupPicker";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { WeatherEntry } from "@/lib/types";
import { getCurrentAuthToken } from "@/lib/authToken";

const CONDITIONS = ["Sunny", "Partly Cloudy", "Cloudy", "Overcast", "Light Rain", "Heavy Rain", "Drizzle", "Fog", "Windy", "Stormy", "Snow", "Frost"];

const ENTRY_MODES: { key: "manual" | "station"; label: string; icon: "edit-3" | "radio" }[] = [
  { key: "manual", label: "Manual Entry", icon: "edit-3" },
  { key: "station", label: "Weather Station", icon: "radio" },
];

function wmoCodeToCondition(code: number): string {
  if (code === 0 || code === 1) return "Sunny";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code === 61 || code === 63 || code === 80 || code === 81) return "Light Rain";
  if (code === 65 || code === 66 || code === 67 || code === 82) return "Heavy Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code === 85 || code === 86) return "Snow";
  if (code === 95 || code === 96 || code === 99) return "Stormy";
  return "Cloudy";
}

function degreesToCompass(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    rain: number;
    weather_code: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  daily: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export default function WeatherEntryScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const [saving, setSaving] = useState(false);

  const [entryMode, setEntryMode] = useState<"manual" | "station">("manual");
  const [temperatureHigh, setTemperatureHigh] = useState("");
  const [temperatureLow, setTemperatureLow] = useState("");
  const [humidity, setHumidity] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [windDirection, setWindDirection] = useState("");
  const [pressure, setPressure] = useState("");
  const [conditions, setConditions] = useState("");
  const [notes, setNotes] = useState("");

  const [vehicleMode, setVehicleMode] = useState(false);
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [selectedDeviceName, setSelectedDeviceName] = useState<string>("");
  const [selectedDeviceSerial, setSelectedDeviceSerial] = useState<string>("");
  const [devicesList, setDevicesList] = useState<Array<{ id: string; label: string; sublabel?: string }>>([]);

  const [fetchingStation, setFetchingStation] = useState(false);
  const [stationError, setStationError] = useState<string | null>(null);
  const [stationFetchedAt, setStationFetchedAt] = useState<Date | null>(null);
  const [stationLocation, setStationLocation] = useState<string | null>(null);
  const [stationSource, setStationSource] = useState<"sensor" | "open-meteo" | null>(null);

  useEffect(() => {
    if (!vehicleMode || !currentFarm?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
        if (!apiDomain) return;
        const token = await getCurrentAuthToken();
        const { kvGet } = await import("@/lib/database");
        const raw = await kvGet("bde_current_farm");
        const farm = raw ? JSON.parse(raw) : null;
        const tenantSlug = farm ? (farm.tenantSlug || farm.slug || "") : "";
        const headers: Record<string, string> = { "Content-Type": "application/json", "x-tenant-slug": tenantSlug };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(`https://${apiDomain}/api/farms/${currentFarm.id}/vehicle-weather-devices`, { headers });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const active = (data.records ?? []).filter((d: any) => d.isActive !== false);
        if (!cancelled) {
          setDevicesList(active.map((d: any) => ({
            id: String(d.id),
            label: d.name,
            sublabel: [d.manufacturer, d.serialNumber ? `S/N: ${d.serialNumber}` : null].filter(Boolean).join(" · ") || undefined,
          })));
        }
      } catch { }
    })();
    return () => { cancelled = true; };
  }, [vehicleMode, currentFarm?.id]);

  const fetchWeatherFromStation = useCallback(async () => {
    setFetchingStation(true);
    setStationError(null);

    try {
      // 1. Try connected API sensor stations first
      if (currentFarm?.id) {
        try {
          const apiDomain = process.env.EXPO_PUBLIC_DOMAIN;
          const token = await getCurrentAuthToken();
          const { kvGet } = await import("@/lib/database");
          const raw = await kvGet("bde_current_farm");
          const farm = raw ? JSON.parse(raw) : null;
          const tenantSlug = farm ? (farm.tenantSlug || farm.slug || "") : "";
          const headers: Record<string, string> = { "x-tenant-slug": tenantSlug };
          if (token) headers["Authorization"] = `Bearer ${token}`;
          const res = await fetch(
            `https://${apiDomain}/api/farms/${currentFarm.id}/sensor-readings?category=weather&limit=50`,
            { headers },
          );
          if (res.ok) {
            const data = await res.json();
            const readings: any[] = data.readings ?? [];
            if (readings.length > 0) {
              const latestByParam = new Map<string, any>();
              for (const r of [...readings].sort(
                (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
              )) {
                if (!latestByParam.has(r.parameter)) latestByParam.set(r.parameter, r);
              }
              const getVal = (p: string) => latestByParam.get(p)?.value;
              const temp    = getVal("air_temperature") ?? getVal("temperature");
              const wind    = getVal("wind_speed");
              const windDir = getVal("wind_direction");
              const hum     = getVal("humidity") ?? getVal("relative_humidity");
              const rain    = getVal("rainfall") ?? getVal("precipitation");
              const pres    = getVal("pressure");
              if (temp != null || wind != null) {
                if (temp    != null) setTemperatureHigh(String(Math.round(Number(temp) * 10) / 10));
                if (wind    != null) setWindSpeed(String(Math.round(Number(wind))));
                if (windDir != null) setWindDirection(degreesToCompass(Number(windDir)));
                if (hum     != null) setHumidity(String(Math.round(Number(hum))));
                if (rain    != null) setRainfall(String(Math.round(Number(rain) * 10) / 10));
                if (pres    != null) setPressure(String(Math.round(Number(pres))));
                const stationName = readings[0]?.stationName ?? readings[0]?.stationId ?? "Connected Station";
                setStationFetchedAt(new Date());
                setStationLocation(stationName);
                setStationSource("sensor");
                setFetchingStation(false);
                return;
              }
            }
          }
        } catch { /* fall through to Open-Meteo */ }
      }

      // 2. Fall back to Open-Meteo via geolocation
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setStationError("Location permission is required to fetch weather data. Please enable it in Settings.");
        setFetchingStation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;

      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${latitude.toFixed(4)}&longitude=${longitude.toFixed(4)}` +
        `&current=temperature_2m,relative_humidity_2m,rain,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m` +
        `&daily=temperature_2m_max,temperature_2m_min` +
        `&wind_speed_unit=mph&temperature_unit=celsius&precipitation_unit=mm&timezone=auto`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Open-Meteo returned ${response.status}`);

      const data: OpenMeteoResponse = await response.json();
      const c = data.current;
      const d = data.daily;

      setTemperatureHigh(d.temperature_2m_max[0] != null ? String(Math.round(d.temperature_2m_max[0] * 10) / 10) : "");
      setTemperatureLow(d.temperature_2m_min[0] != null ? String(Math.round(d.temperature_2m_min[0] * 10) / 10) : "");
      setHumidity(c.relative_humidity_2m != null ? String(Math.round(c.relative_humidity_2m)) : "");
      setRainfall(c.rain != null ? String(Math.round(c.rain * 10) / 10) : "");
      setWindSpeed(c.wind_speed_10m != null ? String(Math.round(c.wind_speed_10m)) : "");
      setWindDirection(c.wind_direction_10m != null ? degreesToCompass(c.wind_direction_10m) : "");
      setPressure(c.pressure_msl != null ? String(Math.round(c.pressure_msl)) : "");
      setConditions(wmoCodeToCondition(c.weather_code));
      setStationFetchedAt(new Date());
      setStationLocation(`${latitude.toFixed(3)}°N, ${Math.abs(longitude).toFixed(3)}°${longitude < 0 ? "W" : "E"}`);
      setStationSource("open-meteo");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.warn("Weather fetch failed:", msg);
      setStationError("Could not fetch weather data. Check your internet connection and try again.");
    } finally {
      setFetchingStation(false);
    }
  }, [currentFarm?.id]);

  const handleModeChange = (mode: "manual" | "station") => {
    Haptics.selectionAsync();
    setEntryMode(mode);
    if (mode === "station") {
      fetchWeatherFromStation();
    }
  };

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
      humidity: humidity.trim(),
      rainfall: rainfall.trim(),
      windSpeed: windSpeed.trim(),
      windDirection: windDirection.trim(),
      pressure: pressure.trim(),
      conditions,
      entryMode,
      vehicleMode,
      vehicleName: vehicleName.trim(),
      vehicleReg: vehicleReg.trim(),
      deviceId: selectedDeviceId || undefined,
      deviceName: selectedDeviceName || undefined,
      deviceSerial: selectedDeviceSerial || undefined,
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
                onPress={() => handleModeChange(m.key)}
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

          {entryMode === "station" && (
            <View style={[
              styles.stationBanner,
              stationError ? styles.stationBannerError : fetchingStation ? styles.stationBannerLoading : styles.stationBannerSuccess,
            ]}>
              {fetchingStation ? (
                <View style={styles.stationBannerRow}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.stationBannerText}>Fetching weather data…</Text>
                </View>
              ) : stationError ? (
                <>
                  <View style={styles.stationBannerRow}>
                    <Feather name="alert-circle" size={14} color={colors.error} />
                    <Text style={[styles.stationBannerText, { color: colors.error }]}>{stationError}</Text>
                  </View>
                  <Pressable onPress={fetchWeatherFromStation} style={styles.retryButton}>
                    <Feather name="refresh-cw" size={12} color={colors.primary} />
                    <Text style={styles.retryText}>Try again</Text>
                  </Pressable>
                </>
              ) : stationFetchedAt ? (
                <View style={styles.stationBannerRow}>
                  <Feather name="check-circle" size={14} color={colors.success} />
                  <View style={styles.flex}>
                    <Text style={[styles.stationBannerText, { color: colors.success }]}>
                      {stationSource === "sensor" ? `Connected Station: ${stationLocation}` : `Open-Meteo · ${stationLocation}`}
                    </Text>
                    <Text style={styles.stationBannerSub}>
                      Fetched at {stationFetchedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · Fields are editable
                    </Text>
                  </View>
                  <Pressable onPress={fetchWeatherFromStation} style={styles.refreshIconButton}>
                    <Feather name="refresh-cw" size={14} color={colors.textSecondary} />
                  </Pressable>
                </View>
              ) : null}
            </View>
          )}

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
              label="High (°C)"
              placeholder="e.g. 18"
              value={temperatureHigh}
              onChangeText={setTemperatureHigh}
              keyboardType="decimal-pad"
              containerStyle={styles.flex}
            />
            <Input
              label="Low (°C)"
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
          <View style={styles.row}>
            <Input
              label="Rainfall (mm)"
              placeholder="e.g. 2.5"
              value={rainfall}
              onChangeText={setRainfall}
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

          <View style={styles.sectionLabel}>
            <Feather name="truck" size={14} color="#0284c7" />
            <Text style={styles.sectionTitle}>Vehicle / Sprayer Reading</Text>
          </View>
          <Pressable
            style={styles.vehicleToggle}
            onPress={() => { Haptics.selectionAsync(); setVehicleMode((v) => !v); }}
          >
            <View style={styles.vehicleToggleLeft}>
              <Text style={styles.vehicleToggleLabel}>Link to vehicle / spray run</Text>
              <Text style={styles.vehicleToggleSub}>
                Tag this reading to a specific vehicle or spray application for the vehicle weather log
              </Text>
            </View>
            <Switch
              value={vehicleMode}
              onValueChange={(v) => { Haptics.selectionAsync(); setVehicleMode(v); }}
              trackColor={{ false: colors.borderLight, true: "#0284c7" }}
              thumbColor={colors.surface}
            />
          </Pressable>
          {vehicleMode && (
            <>
              <View style={styles.row}>
                <Input
                  label="Vehicle / Machine Name"
                  placeholder="e.g. Amazone sprayer"
                  value={vehicleName}
                  onChangeText={setVehicleName}
                  containerStyle={styles.flex}
                />
                <Input
                  label="Registration"
                  placeholder="e.g. YX21 ABC"
                  value={vehicleReg}
                  onChangeText={setVehicleReg}
                  containerStyle={styles.flex}
                />
              </View>
              {devicesList.length > 0 && (
                <LookupPicker
                  label="Weather Device (optional)"
                  value={selectedDeviceName}
                  onSelect={(id, label) => {
                    const found = devicesList.find((d) => d.id === id);
                    setSelectedDeviceId(id);
                    setSelectedDeviceName(label);
                    const serial = found?.sublabel?.includes("S/N:") ? found.sublabel.split("S/N: ")[1]?.split(" ·")[0] ?? "" : "";
                    setSelectedDeviceSerial(serial);
                  }}
                  options={devicesList}
                  placeholder="Select from Device Register…"
                  allowFreeText={false}
                  emptyMessage="No devices in register."
                  icon="cpu"
                  required={false}
                />
              )}
            </>
          )}

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
    marginBottom: spacing.md,
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
  stationBanner: {
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  stationBannerLoading: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  stationBannerSuccess: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  stationBannerError: {
    backgroundColor: "#fff5f5",
    borderColor: "#fed7d7",
  },
  stationBannerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  stationBannerText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  stationBannerSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
  },
  retryText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  refreshIconButton: {
    padding: spacing.xs,
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
  vehicleToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  vehicleToggleLeft: {
    flex: 1,
  },
  vehicleToggleLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.md,
    color: colors.text,
  },
  vehicleToggleSub: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
