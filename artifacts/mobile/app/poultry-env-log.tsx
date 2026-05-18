import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { FlockPicker } from "@/components/ui/FlockPicker";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { radius, spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";
import { useSync } from "@/lib/context/SyncContext";
import { useApiPoultryFlocks } from "@/lib/hooks/useApiPoultryFlocks";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import type { PoultryEnvironmentalLog } from "@/lib/types";

const VENTILATION_RATES = ["Minimum", "Low", "Medium", "High", "Maximum", "Alarm"];

export default function PoultryEnvLogScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const { refreshPendingCount } = useSync();
  const { flocks, loading: flocksLoading, fromCache, error: flocksError } = useApiPoultryFlocks(currentFarm?.id);
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const [flockId, setFlockId] = useState<number>(0);
  const [flockNumber, setFlockNumber] = useState("");
  const [logDate, setLogDate] = useState(now.toISOString().split("T")[0]);
  const [logTime, setLogTime] = useState(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
  const [temperatureMin, setTemperatureMin] = useState("");
  const [temperatureMax, setTemperatureMax] = useState("");
  const [humidity, setHumidity] = useState("");
  const [co2Ppm, setCo2Ppm] = useState("");
  const [ammoniaPpm, setAmmoniaPpm] = useState("");
  const [ventilationRate, setVentilationRate] = useState("Minimum");
  const [lightingHours, setLightingHours] = useState("");
  const [stockingDensity, setStockingDensity] = useState("");
  const [alarmActivated, setAlarmActivated] = useState(false);
  const [alarmDetails, setAlarmDetails] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    if (!flockNumber.trim()) { Alert.alert("Required", "Please select a flock."); return; }

    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const record: PoultryEnvironmentalLog = {
      id: generateId(),
      farmId: currentFarm?.id || "",
      flockId,
      flockNumber: flockNumber.trim(),
      logDate,
      logTime,
      temperatureMin: temperatureMin.trim(),
      temperatureMax: temperatureMax.trim(),
      humidity: humidity.trim(),
      co2Ppm: co2Ppm.trim(),
      ammoniaPpm: ammoniaPpm.trim(),
      ventilationRate,
      lightingHours: lightingHours.trim(),
      stockingDensity: stockingDensity.trim(),
      alarmActivated,
      alarmDetails: alarmDetails.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      synced: false,
    };

    await appendToList(STORAGE_KEYS.POULTRY_ENVIRONMENTAL_LOGS, record);
    await refreshPendingCount();
    setSaving(false);

    const alerts: string[] = [];
    const amm = parseFloat(ammoniaPpm || "0");
    const co2 = parseInt(co2Ppm || "0", 10);
    if (amm >= 20) alerts.push(`⚠️ NH₃ ${amm} ppm — exceeds 20 ppm Red Tractor limit`);
    if (co2 >= 3000) alerts.push(`⚠️ CO₂ ${co2} ppm — check ventilation`);

    Alert.alert("Saved", `Environmental log saved.${alerts.length ? "\n\n" + alerts.join("\n") : ""}`, [
      { text: "Log Another", onPress: () => {
        setTemperatureMin(""); setTemperatureMax(""); setHumidity("");
        setCo2Ppm(""); setAmmoniaPpm(""); setAlarmActivated(false); setAlarmDetails(""); setNotes("");
        setLogTime(`${String(new Date().getHours()).padStart(2, "0")}:${String(new Date().getMinutes()).padStart(2, "0")}`);
      }},
      { text: "Done", onPress: () => router.back() },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Button title="" icon="arrow-left" variant="ghost" size="sm" onPress={() => router.back()} />
        <Text style={styles.title}>Environmental Log</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.flex}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">

          <View style={styles.sectionLabel}>
            <Feather name="feather" size={14} color="#d97706" />
            <Text style={styles.sectionTitle}>Flock &amp; Time</Text>
          </View>
          <FlockPicker label="Select Flock *" value={flockNumber} onChange={setFlockNumber} onChangeFlock={(f) => setFlockId(f.id)} flocks={flocks} loading={flocksLoading} fromCache={fromCache} error={flocksError} />
          <View style={styles.row}>
            <Input label="Date *" placeholder="YYYY-MM-DD" maxDate="today" value={logDate} onChangeText={setLogDate} containerStyle={styles.flex} />
            <Input label="Time" placeholder="HH:MM" value={logTime} onChangeText={setLogTime} containerStyle={styles.flex} />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="thermometer" size={14} color={colors.info} />
            <Text style={styles.sectionTitle}>Temperature &amp; Humidity</Text>
          </View>
          <View style={styles.row}>
            <Input label="Temp Min (°C)" placeholder="e.g. 20" value={temperatureMin} onChangeText={setTemperatureMin} keyboardType="decimal-pad" containerStyle={styles.flex} />
            <Input label="Temp Max (°C)" placeholder="e.g. 24" value={temperatureMax} onChangeText={setTemperatureMax} keyboardType="decimal-pad" containerStyle={styles.flex} />
          </View>
          <Input label="Relative Humidity (%)" placeholder="e.g. 65" value={humidity} onChangeText={setHumidity} keyboardType="decimal-pad" />

          <View style={styles.sectionLabel}>
            <Feather name="alert-triangle" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Air Quality</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Input label="NH₃ Ammonia (ppm)" placeholder="e.g. 10" value={ammoniaPpm} onChangeText={setAmmoniaPpm} keyboardType="decimal-pad" />
              {parseFloat(ammoniaPpm || "0") >= 20 && (
                <Text style={styles.alertHint}>⚠️ Exceeds 20 ppm limit</Text>
              )}
            </View>
            <View style={styles.flex}>
              <Input label="CO₂ (ppm)" placeholder="e.g. 2000" value={co2Ppm} onChangeText={setCo2Ppm} keyboardType="number-pad" />
              {parseInt(co2Ppm || "0", 10) >= 3000 && (
                <Text style={styles.alertHint}>⚠️ Check ventilation</Text>
              )}
            </View>
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="wind" size={14} color={colors.primary} />
            <Text style={styles.sectionTitle}>Ventilation</Text>
          </View>
          <View style={styles.chipRow}>
            {VENTILATION_RATES.map((v) => (
              <Button
                key={v}
                title={v}
                variant={ventilationRate === v ? "primary" : "outline"}
                size="sm"
                onPress={() => { Haptics.selectionAsync(); setVentilationRate(v); }}
              />
            ))}
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="sun" size={14} color={colors.accent} />
            <Text style={styles.sectionTitle}>Lighting &amp; Stocking</Text>
          </View>
          <View style={styles.row}>
            <Input label="Lighting Hours" placeholder="e.g. 18" value={lightingHours} onChangeText={setLightingHours} keyboardType="decimal-pad" containerStyle={styles.flex} />
            <Input label="Stocking Density (kg/m²)" placeholder="e.g. 33" value={stockingDensity} onChangeText={setStockingDensity} keyboardType="decimal-pad" containerStyle={styles.flex} />
          </View>

          <View style={styles.sectionLabel}>
            <Feather name="bell" size={14} color={colors.error} />
            <Text style={styles.sectionTitle}>Alarms</Text>
          </View>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Feather name="bell" size={16} color={colors.textSecondary} />
              <Text style={styles.toggleLabel}>Alarm activated during period</Text>
            </View>
            <Switch value={alarmActivated} onValueChange={(v) => { Haptics.selectionAsync(); setAlarmActivated(v); }} trackColor={{ false: colors.border, true: "#fee2e2" }} thumbColor={alarmActivated ? colors.error : colors.textTertiary} />
          </View>
          {alarmActivated && (
            <Input label="Alarm Details" placeholder="Type of alarm, duration, action taken…" value={alarmDetails} onChangeText={setAlarmDetails} multiline numberOfLines={2} />
          )}
          {alarmActivated && (
            <View style={styles.advisoryAmber}>
              <Feather name="alert-triangle" size={14} color="#92400e" />
              <Text style={styles.advisoryAmberText}>
                Environmental advisory: investigate and document the cause of this alarm before the next flush cycle. Record the corrective action in the Alarm Details field above and follow up via the Task Board if further intervention is required.
              </Text>
            </View>
          )}

          <View style={styles.sectionLabel}>
            <Feather name="edit-3" size={14} color={colors.textSecondary} />
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <Input label="Additional Notes" placeholder="Any observations…" value={notes} onChangeText={setNotes} multiline numberOfLines={2} />

          <Button title="Save Environmental Log" onPress={handleSave} loading={saving} fullWidth icon="check" />
          <View style={{ height: insets.bottom + spacing.xxxl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  title: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  form: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  sectionLabel: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.md, marginTop: spacing.sm },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  row: { flexDirection: "row", gap: spacing.md },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginBottom: spacing.lg },
  alertHint: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.error, marginTop: -spacing.sm, marginBottom: spacing.sm },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  toggleInfo: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text, flex: 1 },
  advisoryAmber: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: "#fffbeb", borderRadius: radius.md, borderWidth: 1, borderColor: "#f59e0b", padding: spacing.md, marginBottom: spacing.sm },
  advisoryAmberText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#92400e", flex: 1, lineHeight: 18 },
});
