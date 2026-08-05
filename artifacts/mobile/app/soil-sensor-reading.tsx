import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { colors } from "@/constants/colors";
import { spacing } from "@/constants/spacing";
import { fonts, fontSize } from "@/constants/typography";
import { useFarm } from "@/lib/context/FarmContext";

import { apiFetch } from "@/lib/apiFetch";
interface SoilSensorProbe {
  id: number;
  name: string;
  manufacturer: string | null;
  model: string | null;
  sensorType: string;
  depthsCm: string | null;
  isActive: boolean;
}

const SENSOR_TYPE_LABELS: Record<string, string> = {
  moisture: "Moisture only",
  moisture_temp: "Moisture + Temp",
  moisture_temp_ec: "Moisture + Temp + EC",
  multi_depth: "Multi-depth",
};

function now(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default function SoilSensorReadingScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();

  const [probes, setProbes] = useState<SoilSensorProbe[]>([]);
  const [loadingProbes, setLoadingProbes] = useState(true);
  const [probesError, setProbesError] = useState<string | null>(null);

  const [selectedProbeId, setSelectedProbeId] = useState<number | null>(null);
  const [showProbePicker, setShowProbePicker] = useState(false);

  const [readingAt, setReadingAt] = useState(now());
  const [depthCm, setDepthCm] = useState("");
  const [moisturePercent, setMoisturePercent] = useState("");
  const [temperatureCelsius, setTemperatureCelsius] = useState("");
  const [ecUsPerCm, setEcUsPerCm] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);

  const selectedProbe = probes.find(p => p.id === selectedProbeId);

  useEffect(() => {
    if (!currentFarm?.id) return;
    setLoadingProbes(true);
    apiFetch(`/api/farms/${currentFarm.id}/soil-sensors`)
      .then(r => r.ok ? r.json() : Promise.reject("Failed to load probes"))
      .then(d => {
        const active = (d.records as SoilSensorProbe[]).filter(p => p.isActive);
        setProbes(active);
        if (active.length === 1) setSelectedProbeId(active[0].id);
      })
      .catch(() => setProbesError("Could not load sensor probes. Check your connection."))
      .finally(() => setLoadingProbes(false));
  }, [currentFarm?.id]);

  const handleSave = async () => {
    if (!currentFarm?.id) return;
    if (!selectedProbeId) {
      Alert.alert("No probe selected", "Please select a sensor probe first.");
      return;
    }
    if (!readingAt) {
      Alert.alert("Missing date/time", "Please enter the reading date and time.");
      return;
    }
    if (!moisturePercent && !temperatureCelsius && !ecUsPerCm) {
      Alert.alert("No measurements", "Enter at least one measurement value (moisture, temperature, or EC).");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(`/api/farms/${currentFarm.id}/soil-sensors/${selectedProbeId}/readings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          readingAt: new Date(readingAt).toISOString(),
          depthCm: depthCm ? parseInt(depthCm, 10) : undefined,
          moisturePercent: moisturePercent || undefined,
          temperatureCelsius: temperatureCelsius || undefined,
          ecUsPerCm: ecUsPerCm || undefined,
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Save failed");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Reading recorded", `Saved to ${selectedProbe?.name ?? "probe"}.`, [
        { text: "Record another", onPress: () => {
          setMoisturePercent("");
          setTemperatureCelsius("");
          setEcUsPerCm("");
          setNotes("");
          setReadingAt(now());
        }},
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", err instanceof Error ? err.message : "Could not save reading.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Soil Sensor Reading</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Probe picker */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sensor Probe *</Text>
          {loadingProbes ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
          ) : probesError ? (
            <View style={styles.errorBox}>
              <Feather name="wifi-off" size={16} color="#dc2626" />
              <Text style={styles.errorText}>{probesError}</Text>
            </View>
          ) : probes.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="alert-circle" size={16} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                No active sensor probes found. Register a probe in Soil Tests → Sensors on the dashboard first.
              </Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.pickerBtn}
                onPress={() => setShowProbePicker(v => !v)}
              >
                <View style={{ flex: 1 }}>
                  {selectedProbe ? (
                    <>
                      <Text style={styles.pickerBtnText}>{selectedProbe.name}</Text>
                      <Text style={styles.pickerBtnSub}>
                        {[selectedProbe.manufacturer, selectedProbe.model].filter(Boolean).join(" · ")}
                        {selectedProbe.depthsCm ? `  ·  ${selectedProbe.depthsCm} cm` : ""}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.pickerPlaceholder}>Select a probe…</Text>
                  )}
                </View>
                <Feather name={showProbePicker ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              {showProbePicker && (
                <View style={styles.dropdownList}>
                  {probes.map(probe => (
                    <TouchableOpacity
                      key={probe.id}
                      style={[styles.dropdownItem, selectedProbeId === probe.id && styles.dropdownItemActive]}
                      onPress={() => { setSelectedProbeId(probe.id); setShowProbePicker(false); }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.dropdownItemText, selectedProbeId === probe.id && styles.dropdownItemTextActive]}>
                          {probe.name}
                        </Text>
                        {(probe.manufacturer || probe.model) && (
                          <Text style={styles.dropdownItemSub}>
                            {[probe.manufacturer, probe.model].filter(Boolean).join(" · ")}
                          </Text>
                        )}
                      </View>
                      {selectedProbeId === probe.id && (
                        <Feather name="check" size={16} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Date / time */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Date &amp; Time *</Text>
          <Input
            value={readingAt}
            onChangeText={setReadingAt}
            placeholder="YYYY-MM-DDTHH:MM"
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={() => setReadingAt(now())} style={styles.nowBtn}>
            <Feather name="clock" size={13} color={colors.primary} />
            <Text style={styles.nowBtnText}>Set to now</Text>
          </TouchableOpacity>
        </View>

        {/* Depth */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Depth (cm)</Text>
          <Input
            value={depthCm}
            onChangeText={setDepthCm}
            placeholder="e.g. 20"
            keyboardType="numeric"
          />
        </View>

        {/* Measurements */}
        <View style={styles.measurementRow}>
          <View style={styles.measurementCell}>
            <Text style={styles.sectionLabel}>Moisture %</Text>
            <Input
              value={moisturePercent}
              onChangeText={setMoisturePercent}
              placeholder="0–100"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.measurementCell}>
            <Text style={styles.sectionLabel}>Temp °C</Text>
            <Input
              value={temperatureCelsius}
              onChangeText={setTemperatureCelsius}
              placeholder="e.g. 12"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.measurementCell}>
            <Text style={styles.sectionLabel}>EC μS/cm</Text>
            <Input
              value={ecUsPerCm}
              onChangeText={setEcUsPerCm}
              placeholder="e.g. 250"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.measurementHint}>
          <Feather name="info" size={12} color={colors.textSecondary} />
          <Text style={styles.measurementHintText}>
            Enter only the values your probe measures — all three fields are optional.
          </Text>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes (optional)</Text>
          <Input
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g. After heavy rain, soil appears saturated"
            multiline
            numberOfLines={2}
          />
        </View>

        <Button
          title={saving ? "Saving…" : "Save Sensor Reading"}
          loading={saving}
          onPress={handleSave}
          disabled={saving || !selectedProbeId || (!moisturePercent && !temperatureCelsius && !ecUsPerCm)}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.lg, color: colors.text },
  scroll: { flex: 1 },
  content: { padding: spacing.md, gap: spacing.sm },
  section: { gap: spacing.xs },
  sectionLabel: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: "#fff",
    gap: spacing.xs,
  },
  pickerBtnText: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text },
  pickerBtnSub: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1 },
  pickerPlaceholder: { fontFamily: fonts.regular, fontSize: fontSize.md, color: "#9ca3af" },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
    marginTop: 2,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    gap: spacing.sm,
  },
  dropdownItemActive: { backgroundColor: "#f0fdf4" },
  dropdownItemText: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.text },
  dropdownItemTextActive: { color: colors.primary },
  dropdownItemSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1 },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: "#dc2626", flex: 1 },
  emptyBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, flex: 1 },
  nowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  nowBtnText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primary },
  measurementRow: { flexDirection: "row", gap: spacing.sm },
  measurementCell: { flex: 1, gap: spacing.xs },
  measurementHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
    marginTop: -spacing.xs,
  },
  measurementHintText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});
