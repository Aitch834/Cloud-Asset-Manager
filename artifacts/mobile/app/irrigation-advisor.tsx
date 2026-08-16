/**
 * Irrigation Advisor — Mobile
 *
 * Mirrors the web dashboard's IrrigationAdvisorTab with a mobile-native UI.
 * Fetches field + weather data from /api/farms/:id/irrigation-advisor, runs
 * the SMD water-balance model inline, and lets growers log an irrigation
 * application directly from each scenario card.
 *
 * Computation model (ported from artifacts/dashboard/src/lib/irrigationSMD.ts):
 *   ET₀  — Hargreaves-Samani (station data) or UK 52°N monthly normals (fallback)
 *   SMD  — max(0, min(FC, SMD + ETc − Rain)) daily water balance
 *   Scenarios — three 14-day simulations (irrigate now / wait 7 / don't irrigate)
 */

import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
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
import { apiFetch } from "@/lib/apiFetch";
import { useFarm } from "@/lib/context/FarmContext";
import { appendToList, generateId, STORAGE_KEYS } from "@/lib/storage";
import { scheduleSync } from "@/lib/sync-engine";

// ─── Inlined irrigation data constants (from irrigationData.ts) ───────────────

const UK_MONTHLY_ET0: number[] = [
  0.3, 0.6, 1.1, 1.9, 2.8, 3.4, 3.5, 3.1, 2.0, 1.1, 0.5, 0.2,
];

const DEFAULT_FC_MM = 150;

const FIELD_CAPACITY_BY_SOIL: Record<string, number> = {
  sand: 90, "light sandy": 90, sandy: 90, "loamy sand": 100,
  "sandy loam": 120, "light loam": 135, "sandy clay loam": 145,
  "medium loam": 150, loam: 150, "silty loam": 155, "silt loam": 155,
  silt: 155, "clay loam": 160, "sandy clay": 160, "silty clay loam": 165,
  "silty clay": 170, "heavy clay": 175, clay: 175, peat: 200,
};

function getFieldCapacity(soilType?: string | null): number {
  if (!soilType) return DEFAULT_FC_MM;
  const n = soilType.toLowerCase().trim().replace(/_/g, " ");
  if (FIELD_CAPACITY_BY_SOIL[n] !== undefined) return FIELD_CAPACITY_BY_SOIL[n];
  for (const [key, fc] of Object.entries(FIELD_CAPACITY_BY_SOIL)) {
    if (n.includes(key) || key.includes(n)) return fc;
  }
  return DEFAULT_FC_MM;
}

interface CropProfile {
  Kc_ini: number; Kc_mid: number; Kc_end: number;
  fracDev: number; fracMid: number; fracLate: number;
  Ky: number; criticalSmdMm: number; typicalYieldTha: number;
}

const CROP_PROFILES: Record<string, CropProfile> = {
  "winter wheat": { Kc_ini: 0.30, Kc_mid: 1.15, Kc_end: 0.25, fracDev: 0.20, fracMid: 0.55, fracLate: 0.80, Ky: 0.50, criticalSmdMm: 40, typicalYieldTha: 9.0 },
  wheat: { Kc_ini: 0.30, Kc_mid: 1.15, Kc_end: 0.25, fracDev: 0.20, fracMid: 0.55, fracLate: 0.80, Ky: 0.50, criticalSmdMm: 40, typicalYieldTha: 9.0 },
  "spring barley": { Kc_ini: 0.30, Kc_mid: 1.15, Kc_end: 0.25, fracDev: 0.15, fracMid: 0.50, fracLate: 0.75, Ky: 0.45, criticalSmdMm: 35, typicalYieldTha: 6.5 },
  barley: { Kc_ini: 0.30, Kc_mid: 1.15, Kc_end: 0.25, fracDev: 0.17, fracMid: 0.52, fracLate: 0.78, Ky: 0.45, criticalSmdMm: 35, typicalYieldTha: 7.0 },
  oats: { Kc_ini: 0.30, Kc_mid: 1.15, Kc_end: 0.25, fracDev: 0.20, fracMid: 0.55, fracLate: 0.80, Ky: 0.45, criticalSmdMm: 40, typicalYieldTha: 7.5 },
  "oilseed rape": { Kc_ini: 0.35, Kc_mid: 1.15, Kc_end: 0.35, fracDev: 0.15, fracMid: 0.50, fracLate: 0.80, Ky: 0.70, criticalSmdMm: 40, typicalYieldTha: 4.0 },
  osr: { Kc_ini: 0.35, Kc_mid: 1.15, Kc_end: 0.35, fracDev: 0.15, fracMid: 0.50, fracLate: 0.80, Ky: 0.70, criticalSmdMm: 40, typicalYieldTha: 4.0 },
  potatoes: { Kc_ini: 0.50, Kc_mid: 1.15, Kc_end: 0.75, fracDev: 0.20, fracMid: 0.55, fracLate: 0.85, Ky: 1.10, criticalSmdMm: 25, typicalYieldTha: 45.0 },
  potato: { Kc_ini: 0.50, Kc_mid: 1.15, Kc_end: 0.75, fracDev: 0.20, fracMid: 0.55, fracLate: 0.85, Ky: 1.10, criticalSmdMm: 25, typicalYieldTha: 45.0 },
  "sugar beet": { Kc_ini: 0.35, Kc_mid: 1.20, Kc_end: 0.70, fracDev: 0.25, fracMid: 0.55, fracLate: 0.85, Ky: 1.00, criticalSmdMm: 35, typicalYieldTha: 75.0 },
  maize: { Kc_ini: 0.30, Kc_mid: 1.20, Kc_end: 0.35, fracDev: 0.20, fracMid: 0.55, fracLate: 0.80, Ky: 1.25, criticalSmdMm: 30, typicalYieldTha: 12.0 },
  "field beans": { Kc_ini: 0.40, Kc_mid: 1.15, Kc_end: 0.35, fracDev: 0.20, fracMid: 0.50, fracLate: 0.80, Ky: 0.70, criticalSmdMm: 35, typicalYieldTha: 5.0 },
  peas: { Kc_ini: 0.40, Kc_mid: 1.15, Kc_end: 1.10, fracDev: 0.20, fracMid: 0.50, fracLate: 0.80, Ky: 0.70, criticalSmdMm: 30, typicalYieldTha: 5.0 },
  vegetables: { Kc_ini: 0.50, Kc_mid: 1.05, Kc_end: 0.90, fracDev: 0.20, fracMid: 0.50, fracLate: 0.80, Ky: 1.00, criticalSmdMm: 20, typicalYieldTha: 40.0 },
};

function matchCropProfile(cropName: string): CropProfile | null {
  if (!cropName) return null;
  const lower = cropName.toLowerCase().trim();
  if (CROP_PROFILES[lower]) return CROP_PROFILES[lower];
  for (const [key, profile] of Object.entries(CROP_PROFILES)) {
    if (lower.includes(key) || key.includes(lower)) return profile;
  }
  return null;
}

// ─── Inlined SMD computation (from irrigationSMD.ts) ─────────────────────────

function extraterrestrialRadiation(doy: number): number {
  const Gsc = 0.0820, lat = 0.9076;
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI / 365) * doy);
  const delta = 0.409 * Math.sin((2 * Math.PI / 365) * doy - 1.39);
  const ws = Math.acos(-Math.tan(lat) * Math.tan(delta));
  return Math.max(0, (24 * 60 / Math.PI) * Gsc * dr * (
    ws * Math.sin(lat) * Math.sin(delta) + Math.cos(lat) * Math.cos(delta) * Math.sin(ws)
  ));
}

function dayOfYear(dateStr: string): number {
  const d = new Date(dateStr);
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
}

function hargreavesET0(tmax: number, tmin: number, doy: number): number {
  const tmean = (tmax + tmin) / 2;
  return Math.max(0, 0.0023 * (tmean + 17.8) * Math.pow(Math.max(0, tmax - tmin), 0.5) * extraterrestrialRadiation(doy) / 2.45);
}

function fallbackET0(dateStr: string): number {
  return UK_MONTHLY_ET0[new Date(dateStr).getMonth()];
}

function getKc(profile: CropProfile, plantingDate: string, harvestDate: string | undefined, date: string): number {
  const plant = new Date(plantingDate).getTime();
  const harvest = harvestDate ? new Date(harvestDate).getTime() : plant + 180 * 86400000;
  const current = new Date(date).getTime();
  if (current <= plant) return profile.Kc_ini;
  if (current >= harvest) return profile.Kc_end;
  const elapsed = (current - plant) / (harvest - plant);
  if (elapsed < profile.fracDev) return profile.Kc_ini;
  if (elapsed < profile.fracMid) {
    const t = (elapsed - profile.fracDev) / (profile.fracMid - profile.fracDev);
    return profile.Kc_ini + t * (profile.Kc_mid - profile.Kc_ini);
  }
  if (elapsed < profile.fracLate) return profile.Kc_mid;
  const t = (elapsed - profile.fracLate) / (1 - profile.fracLate);
  return profile.Kc_mid + t * (profile.Kc_end - profile.Kc_mid);
}

interface DailyReading { date: string; tmax?: number; tmin?: number; rainfall?: number; }

function computeSMD(
  readings: DailyReading[],
  cropProfile: CropProfile | null,
  fieldCapacityMm: number,
  plantingDate: string | null,
  harvestDate: string | null | undefined,
): { date: string; smd: number; etC: number; stationData: boolean }[] {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date));
  let smd = 0;
  return sorted.map(day => {
    const kc = (cropProfile && plantingDate) ? getKc(cropProfile, plantingDate, harvestDate ?? undefined, day.date) : 1.0;
    const hasStation = day.tmax != null && day.tmin != null;
    const et0 = hasStation ? hargreavesET0(day.tmax!, day.tmin!, dayOfYear(day.date)) : fallbackET0(day.date);
    const etC = et0 * kc;
    smd = Math.max(0, Math.min(fieldCapacityMm, smd + etC - (day.rainfall ?? 0)));
    return { date: day.date, smd, etC, stationData: hasStation };
  });
}

type SmdStatus = "OK" | "Building" | "At Threshold" | "Critical";

function getSmdStatus(smd: number, criticalSmdMm: number): SmdStatus {
  if (smd <= criticalSmdMm * 0.40) return "OK";
  if (smd <= criticalSmdMm * 0.80) return "Building";
  if (smd <= criticalSmdMm * 1.20) return "At Threshold";
  return "Critical";
}

interface ScenarioResult {
  label: string;
  irrigationMm: number;
  projectedSmdAfterMm: number;
  projectedSmd14Mm: number;
  yieldLossFraction: number;
  yieldLossTha: number;
  irrigationRevenueSaved: number;
  netBenefit: number;
}

function computeScenarios(opts: {
  currentSmdMm: number; irrigateMm: number; costPerMmHa: number;
  fieldAreaHa: number; cropPricePerTonne: number; typicalYieldTha: number;
  Ky: number; fieldCapacityMm: number; criticalSmdMm: number;
  expectedRainfall7dMm: number; currentDailyEtcMm: number;
}): { irrigateNow: ScenarioResult; wait7: ScenarioResult; skip: ScenarioResult } {
  const { currentSmdMm, irrigateMm, costPerMmHa, fieldAreaHa, cropPricePerTonne,
    typicalYieldTha, Ky, fieldCapacityMm, criticalSmdMm, expectedRainfall7dMm, currentDailyEtcMm } = opts;
  const HORIZON = 14, FORECAST_DAYS = 7;
  const dailyRainInForecast = expectedRainfall7dMm / FORECAST_DAYS;
  const stressRange = Math.max(1, fieldCapacityMm - criticalSmdMm);
  const clamp = (v: number) => Math.max(0, Math.min(fieldCapacityMm, v));

  function simulate(irrigateAtDay: number) {
    let smd = currentSmdMm, postIrrigSmd = currentSmdMm, sumEtaEtm = 0;
    for (let day = 0; day < HORIZON; day++) {
      if (day === irrigateAtDay) { smd = clamp(smd - irrigateMm); postIrrigSmd = smd; }
      const etaEtm = smd <= criticalSmdMm ? 1.0 : Math.max(0, 1 - (smd - criticalSmdMm) / stressRange);
      sumEtaEtm += etaEtm;
      const dailyRain = day < FORECAST_DAYS ? dailyRainInForecast : 0;
      smd = clamp(smd + currentDailyEtcMm - dailyRain);
    }
    return { day14Smd: smd, meanEtaEtm: sumEtaEtm / HORIZON, postIrrigSmd };
  }

  const nowSim = simulate(0), wait7Sim = simulate(7), skipSim = simulate(HORIZON);
  const skipYieldLossFrac = Math.max(0, Math.min(0.50, Ky * (1 - skipSim.meanEtaEtm)));
  const skipRevLoss = skipYieldLossFrac * typicalYieldTha * fieldAreaHa * cropPricePerTonne;

  function buildResult(label: string, sim: typeof nowSim, irrigMm: number): ScenarioResult {
    const irrigCostTotal = irrigMm * costPerMmHa * fieldAreaHa;
    const yieldLossFrac = Math.max(0, Math.min(0.50, Ky * (1 - sim.meanEtaEtm)));
    const yieldLossTha = typicalYieldTha * yieldLossFrac;
    const revenueSaved = Math.max(0, skipRevLoss - yieldLossTha * fieldAreaHa * cropPricePerTonne);
    return {
      label, irrigationMm: irrigMm,
      projectedSmdAfterMm: sim.postIrrigSmd, projectedSmd14Mm: sim.day14Smd,
      yieldLossFraction: yieldLossFrac, yieldLossTha,
      irrigationRevenueSaved: revenueSaved,
      netBenefit: revenueSaved - irrigCostTotal,
    };
  }
  return {
    irrigateNow: buildResult("Irrigate now", nowSim, irrigateMm),
    wait7: buildResult("Wait 7 days", wait7Sim, irrigateMm),
    skip: buildResult("Don't irrigate", skipSim, 0),
  };
}

// ─── API types ────────────────────────────────────────────────────────────────

interface FieldOption {
  id: number; name: string; fieldReference?: string | null;
  areaHectares?: string | number | null; soilType?: string | null;
}

interface CropAssignment {
  id: number; cropName: string; variety?: string | null;
  plantingDate?: string | null; expectedHarvestDate?: string | null; year?: number | null;
}

interface AdvisorPayload {
  fields: FieldOption[];
  assignment: CropAssignment | null;
  dailyWeather: { date: string; tmax: number | null; tmin: number | null; rainfallMm: number | null }[];
  hasWeatherStation: boolean;
  forecastRainfall7dMm: number | null;
  forecastDailyMm: Array<{ date: string; mm: number }> | null;
  year: number;
}

// ─── Status UI helpers ────────────────────────────────────────────────────────

const STATUS_STYLE: Record<SmdStatus, { bg: string; border: string; text: string; dot: string; desc: string }> = {
  "OK":           { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d", dot: "#22c55e", desc: "Soil has adequate moisture — no irrigation needed yet." },
  "Building":     { bg: "#fefce8", border: "#fef08a", text: "#a16207", dot: "#eab308", desc: "Deficit growing — monitor closely." },
  "At Threshold": { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c", dot: "#f97316", desc: "Approaching critical deficit — consider irrigating." },
  "Critical":     { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c", dot: "#ef4444", desc: "Deficit exceeds threshold — crop likely under stress." },
};

// ─── Log Application Modal ────────────────────────────────────────────────────

const METHODS = [
  "Overhead sprinkler", "Drip / trickle", "Furrow / flood",
  "Pivot", "Boom", "Traveller", "Hand-held", "Other",
];

interface LogPrefill {
  fieldId: number;
  fieldName: string;
  cropName: string;
  applicationDepthMm: number;
  scenarioLabel: string;
}

function LogModal({
  farmId,
  prefill,
  onClose,
}: {
  farmId: number;
  prefill: LogPrefill;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const today = new Date().toISOString().slice(0, 10);
  const [irrigationDate, setIrrigationDate] = useState(today);
  const [cropType, setCropType] = useState(prefill.cropName);
  const [applicationDepthMm, setApplicationDepthMm] = useState(String(prefill.applicationDepthMm));
  const [irrigationMethod, setIrrigationMethod] = useState("Overhead sprinkler");
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    const depthNum = parseFloat(applicationDepthMm);
    if (!irrigationDate) { setError("Date is required."); return; }
    if (!irrigationMethod) { setError("Method is required."); return; }
    if (isNaN(depthNum) || depthNum <= 0) { setError("Enter a valid application depth."); return; }
    setError("");
    setSaving(true);

    try {
      const record = {
        id: generateId(),
        farmId: String(farmId),
        fieldId: prefill.fieldId,
        irrigationDate,
        waterSource: "",
        fieldOrBlockDescription: prefill.fieldName,
        cropType: cropType.trim(),
        growthStage: "",
        irrigationMethod,
        meterStartReading: null,
        meterEndReading: null,
        volumeAppliedM3: null,
        applicationDepthMm: depthNum,
        areaIrrigatedHa: null,
        operatorName: "",
        rainfallLast7DaysMm: null,
        notes: notes.trim(),
        createdAt: new Date().toISOString(),
        synced: false,
      };
      await appendToList(STORAGE_KEYS.IRRIGATION_APPLICATIONS, record);
      void scheduleSync();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
      Alert.alert("Saved", "Irrigation application logged — it will sync when online.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save — please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <View style={[styles.modalContainer, { paddingBottom: insets.bottom + spacing.md }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log Irrigation Application</Text>
            <Pressable onPress={onClose} style={styles.modalClose} hitSlop={12}>
              <Feather name="x" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.modalSubtitle}>
            Pre-filled from <Text style={{ fontFamily: fonts.medium }}>{prefill.scenarioLabel}</Text> — adjust before saving.
          </Text>

          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* Date */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Date *</Text>
              <Input
                value={irrigationDate}
                onChangeText={setIrrigationDate}
                placeholder="YYYY-MM-DD"
                keyboardType="numeric"
              />
            </View>

            {/* Field (read-only) */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Field</Text>
              <View style={styles.readonlyField}>
                <Text style={styles.readonlyText}>{prefill.fieldName}</Text>
              </View>
            </View>

            {/* Crop type */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Crop Type</Text>
              <Input
                value={cropType}
                onChangeText={setCropType}
                placeholder="e.g. Wheat"
              />
            </View>

            {/* Application depth */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Application Depth (mm) *</Text>
              <Input
                value={applicationDepthMm}
                onChangeText={setApplicationDepthMm}
                keyboardType="decimal-pad"
                placeholder="e.g. 25"
              />
            </View>

            {/* Method picker */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Method *</Text>
              <Pressable style={styles.pickerRow} onPress={() => setShowMethodPicker(true)}>
                <Text style={styles.pickerText}>{irrigationMethod}</Text>
                <Feather name="chevron-down" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Notes */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Notes</Text>
              <Input
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional notes"
                multiline
                numberOfLines={3}
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={14} color="#b91c1c" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.modalFooter}>
              <Button variant="outline" title="Cancel" onPress={onClose} style={{ flex: 1 }} />
              <Button title={saving ? "Saving…" : "Log Application"} onPress={handleSave} disabled={saving} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Method picker modal */}
      {showMethodPicker && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowMethodPicker(false)}>
          <Pressable style={styles.pickerOverlay} onPress={() => setShowMethodPicker(false)}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Irrigation Method</Text>
              {METHODS.map(m => (
                <Pressable
                  key={m}
                  style={[styles.pickerItem, m === irrigationMethod && styles.pickerItemSelected]}
                  onPress={() => { setIrrigationMethod(m); setShowMethodPicker(false); }}
                >
                  <Text style={[styles.pickerItemText, m === irrigationMethod && styles.pickerItemTextSelected]}>{m}</Text>
                  {m === irrigationMethod && <Feather name="check" size={16} color={colors.primary} />}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      )}
    </Modal>
  );
}

// ─── Scenario Card ────────────────────────────────────────────────────────────

function ScenarioCard({
  result,
  accent,
  onLog,
}: {
  result: ScenarioResult;
  accent: { bg: string; border: string; label: string };
  onLog?: () => void;
}) {
  const netPos = result.netBenefit >= 0;
  const fmtGbp = (v: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);
  const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <View style={[styles.scenarioCard, { backgroundColor: accent.bg, borderColor: accent.border }]}>
      <Text style={styles.scenarioLabel}>{result.label}</Text>

      <View style={styles.scenarioRow}>
        <Text style={styles.scenarioKey}>Applied</Text>
        <Text style={styles.scenarioVal}>{result.irrigationMm} mm</Text>
      </View>
      {result.irrigationMm > 0 && (
        <View style={styles.scenarioRow}>
          <Text style={styles.scenarioKey}>SMD after application</Text>
          <Text style={styles.scenarioVal}>{result.projectedSmdAfterMm.toFixed(1)} mm</Text>
        </View>
      )}
      <View style={styles.scenarioRow}>
        <Text style={styles.scenarioKey}>Est. SMD (day 14)</Text>
        <Text style={styles.scenarioVal}>{result.projectedSmd14Mm.toFixed(1)} mm</Text>
      </View>
      <View style={styles.scenarioRow}>
        <Text style={styles.scenarioKey}>Yield loss est. (day 14)</Text>
        <Text style={styles.scenarioVal}>
          {result.yieldLossTha.toFixed(2)} t/ha ({fmtPct(result.yieldLossFraction)})
        </Text>
      </View>
      <View style={styles.scenarioRow}>
        <Text style={styles.scenarioKey}>Revenue saved vs. no-irrig.</Text>
        <Text style={styles.scenarioVal}>{fmtGbp(result.irrigationRevenueSaved)}</Text>
      </View>
      <View style={[styles.scenarioRow, styles.scenarioDivider]}>
        <Text style={[styles.scenarioKey, { fontFamily: fonts.semiBold }]}>Net benefit</Text>
        <Text style={[styles.scenarioVal, { color: netPos ? "#15803d" : "#b91c1c", fontFamily: fonts.bold }]}>
          {netPos ? "+" : ""}{fmtGbp(result.netBenefit)}
        </Text>
      </View>

      {result.irrigationMm > 0 && onLog && (
        <Pressable style={styles.logBtn} onPress={onLog}>
          <Feather name="plus-circle" size={14} color={colors.primary} />
          <Text style={styles.logBtnText}>Log this application</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── 7-day Forecast Bar Chart ─────────────────────────────────────────────────

const DAY_ABBREV = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ForecastRainfallChart({ days }: { days: Array<{ date: string; mm: number }> }) {
  const maxMm = Math.max(...days.map(d => d.mm), 1);
  const BAR_HEIGHT = 80;

  return (
    <View style={fcStyles.container}>
      <View style={fcStyles.bars}>
        {days.map((d) => {
          const barH = Math.max(2, (d.mm / maxMm) * BAR_HEIGHT);
          const heavy = d.mm >= 5;
          const dayName = DAY_ABBREV[new Date(d.date).getDay()];
          return (
            <View key={d.date} style={fcStyles.col}>
              {d.mm > 0 && (
                <Text style={fcStyles.mmLabel}>{d.mm % 1 === 0 ? d.mm : d.mm.toFixed(1)}</Text>
              )}
              <View style={fcStyles.barTrack}>
                <View
                  style={[
                    fcStyles.bar,
                    { height: barH, backgroundColor: heavy ? "#1d4ed8" : "#93c5fd" },
                  ]}
                />
              </View>
              <Text style={fcStyles.dayLabel}>{dayName}</Text>
            </View>
          );
        })}
      </View>
      <Text style={fcStyles.caption}>
        Total: <Text style={{ fontFamily: fonts.semiBold }}>{days.reduce((s, d) => s + d.mm, 0).toFixed(1)} mm</Text> over 7 days · darker bars ≥ 5 mm
      </Text>
    </View>
  );
}

const fcStyles = StyleSheet.create({
  container: { gap: 6 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 4, height: 108 },
  col: { flex: 1, alignItems: "center", justifyContent: "flex-end", gap: 2 },
  barTrack: { width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 3, minHeight: 2 },
  mmLabel: { fontFamily: fonts.regular, fontSize: 9, color: "#334155", textAlign: "center" },
  dayLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.textSecondary, textAlign: "center" },
  caption: { fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary, textAlign: "center" },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function IrrigationAdvisorScreen() {
  const insets = useSafeAreaInsets();
  const { currentFarm } = useFarm();
  const farmId = currentFarm?.id ? Number(currentFarm.id) : null;

  // ── Data ────────────────────────────────────────────────────────────────────
  const [data, setData] = useState<AdvisorPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  // Independent counter used to force a re-fetch on Retry without relying on
  // setState bail-out behaviour (React bails out of setState(same value)).
  const [reloadToken, setReloadToken] = useState(0);

  // ── Cost defaults ────────────────────────────────────────────────────────
  const [costPerMmHa, setCostPerMmHa] = useState("3.50");
  const [irrigateMm, setIrrigateMm] = useState("25");
  const [cropPricePerTonne, setCropPricePerTonne] = useState("220");
  // Rainfall is seeded from the API forecast after the first successful load;
  // the user can override it afterwards.  We track whether it has been seeded
  // so a field change that clears `data` doesn't reset a deliberate override.
  const [expectedRainfall, setExpectedRainfall] = useState<string | null>(null);
  const forecastSeeded = React.useRef(false);

  // ── Log modal ────────────────────────────────────────────────────────────
  const [logPrefill, setLogPrefill] = useState<LogPrefill | null>(null);

  // ── Fetch advisor data ────────────────────────────────────────────────────
  useEffect(() => {
    if (!farmId) return;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ year: String(new Date().getFullYear()) });
    if (selectedFieldId) params.set("fieldId", String(selectedFieldId));
    apiFetch(`/api/farms/${farmId}/irrigation-advisor?${params}`)
      .then(r => {
        if (!r.ok) throw new Error(`Failed (${r.status})`);
        return r.json() as Promise<AdvisorPayload>;
      })
      .then(d => {
        setData(d);
        // Auto-select first field if none chosen yet
        if (!selectedFieldId && d.fields.length > 0) {
          setSelectedFieldId(d.fields[0].id);
        }
        // Seed expected-rainfall from the API forecast exactly once.
        // null means "no location set"; 0 is a valid forecast so we must
        // preserve it — use Number.isFinite, not a falsy check.
        if (!forecastSeeded.current && Number.isFinite(d.forecastRainfall7dMm)) {
          setExpectedRainfall(String(d.forecastRainfall7dMm));
          forecastSeeded.current = true;
        } else if (!forecastSeeded.current) {
          // No forecast available — fall back to the conventional default.
          setExpectedRainfall("5");
          forecastSeeded.current = true;
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load advisor data"))
      .finally(() => setLoading(false));
  }, [farmId, selectedFieldId, reloadToken]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Compute SMD and scenarios ─────────────────────────────────────────────
  const { smdSeries, currentSmd, fieldCapacity, cropProfile, scenarios, selectedField } = useMemo(() => {
    if (!data) return { smdSeries: [], currentSmd: 0, fieldCapacity: DEFAULT_FC_MM, cropProfile: null, scenarios: null, selectedField: null };

    const selectedField = data.fields.find(f => f.id === selectedFieldId) ?? data.fields[0] ?? null;
    const fc = getFieldCapacity(selectedField?.soilType);
    const cp = data.assignment ? matchCropProfile(data.assignment.cropName) : null;

    // Pad to 60 days
    const today = new Date();
    const byDate: Record<string, { date: string; tmax?: number; tmin?: number; rainfall?: number }> = {};
    for (const r of data.dailyWeather) {
      byDate[r.date] = { date: r.date, tmax: r.tmax ?? undefined, tmin: r.tmin ?? undefined, rainfall: r.rainfallMm ?? undefined };
    }
    const padded: DailyReading[] = [];
    for (let i = 59; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      padded.push(byDate[key] ?? { date: key });
    }

    const smdSeries = computeSMD(padded, cp, fc, data.assignment?.plantingDate ?? null, data.assignment?.expectedHarvestDate);
    const currentSmd = smdSeries.length ? smdSeries[smdSeries.length - 1].smd : 0;
    const currentDailyEtcMm = smdSeries.length ? smdSeries[smdSeries.length - 1].etC : fallbackET0(today.toISOString().slice(0, 10));

    // Financial scenarios require a recognized crop profile — without one we
    // cannot compute credible yield loss or net-benefit figures.
    if (!cp) {
      return { smdSeries, currentSmd, fieldCapacity: fc, cropProfile: null, scenarios: null, selectedField };
    }

    // Parse user inputs; use Number.isFinite so that zero is preserved (as
    // opposed to the falsy || fallback pattern that turns 0 into a default).
    const mmNum   = Number.isFinite(parseFloat(irrigateMm))        ? parseFloat(irrigateMm)        : 25;
    const costNum  = Number.isFinite(parseFloat(costPerMmHa))       ? parseFloat(costPerMmHa)       : 3.50;
    const priceNum = Number.isFinite(parseFloat(cropPricePerTonne)) ? parseFloat(cropPricePerTonne) : 220;
    const rainRaw  = parseFloat(expectedRainfall ?? "");
    const rainNum  = Number.isFinite(rainRaw) ? rainRaw : 5;
    const areaHa   = parseFloat(String(selectedField?.areaHectares ?? ""));
    const effectiveArea = areaHa > 0 ? areaHa : 1;

    const scenarios = computeScenarios({
      currentSmdMm: currentSmd,
      irrigateMm: mmNum > 0 ? mmNum : 25,
      costPerMmHa: costNum,
      fieldAreaHa: effectiveArea,
      cropPricePerTonne: priceNum,
      typicalYieldTha: cp.typicalYieldTha,
      Ky: cp.Ky,
      fieldCapacityMm: fc,
      criticalSmdMm: cp.criticalSmdMm,
      expectedRainfall7dMm: rainNum,
      currentDailyEtcMm,
    });

    return { smdSeries, currentSmd, fieldCapacity: fc, cropProfile: cp, scenarios, selectedField };
  }, [data, selectedFieldId, irrigateMm, costPerMmHa, cropPricePerTonne, expectedRainfall]);

  const criticalSmd = cropProfile?.criticalSmdMm ?? 35;
  const smdStatus = getSmdStatus(currentSmd, criticalSmd);
  const statusStyle = STATUS_STYLE[smdStatus];

  function openLogModal(scenario: ScenarioResult) {
    if (!selectedField || !farmId) return;
    setLogPrefill({
      fieldId: selectedField.id,
      fieldName: selectedField.name,
      cropName: data?.assignment?.cropName ?? "",
      applicationDepthMm: scenario.irrigationMm,
      scenarioLabel: scenario.label,
    });
  }

  if (!farmId) {
    return (
      <View style={[styles.center, { paddingTop: insets.top + 60 }]}>
        <Text style={styles.emptyText}>No farm selected.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background ?? "#f8fafc" }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Irrigation Advisor</Text>
          {currentFarm?.name ? <Text style={styles.headerSub}>{currentFarm.name}</Text> : null}
        </View>
      </View>

      {loading && !data ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.emptyText, { marginTop: 12 }]}>Loading advisor data…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="alert-circle" size={32} color="#ef4444" />
          <Text style={[styles.emptyText, { marginTop: 8, color: "#b91c1c" }]}>{error}</Text>
          <Button title="Retry" style={{ marginTop: 16 }} onPress={() => { setError(""); setReloadToken(t => t + 1); }} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Field selector */}
          {data && data.fields.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Field</Text>
              <Pressable style={styles.pickerRow} onPress={() => setShowFieldPicker(true)}>
                <Text style={styles.pickerText}>
                  {selectedField?.name ?? "Select a field"}
                  {selectedField?.fieldReference ? ` (${selectedField.fieldReference})` : ""}
                </Text>
                <Feather name="chevron-down" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          )}

          {/* Soil type warning */}
          {selectedField && !selectedField.soilType && (
            <Pressable
              style={styles.soilWarningBanner}
              onPress={() => router.push("/field-edit")}
            >
              <Feather name="alert-triangle" size={16} color="#a16207" />
              <Text style={styles.soilWarningText}>
                Soil type not set — using medium loam default. Tap to update.
              </Text>
              <Feather name="chevron-right" size={16} color="#a16207" />
            </Pressable>
          )}

          {/* Crop info */}
          {data?.assignment && (
            <View style={[styles.section, styles.cropRow]}>
              <Feather name="sun" size={16} color={colors.primary} />
              <Text style={styles.cropText}>
                <Text style={{ fontFamily: fonts.semiBold }}>{data.assignment.cropName}</Text>
                {data.assignment.variety ? ` — ${data.assignment.variety}` : ""}
              </Text>
            </View>
          )}

          {/* SMD status */}
          <View style={[styles.statusCard, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
            <View style={styles.statusHeader}>
              <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
              <Text style={[styles.statusLabel, { color: statusStyle.text }]}>{smdStatus}</Text>
              <Text style={[styles.statusSmd, { color: statusStyle.text }]}>{currentSmd.toFixed(1)} mm SMD</Text>
            </View>
            <Text style={[styles.statusDesc, { color: statusStyle.text }]}>{statusStyle.desc}</Text>
            {/* SMD bar */}
            <View style={styles.smdBarTrack}>
              <View style={[styles.smdBarCritMarker, { left: `${Math.min(100, (criticalSmd / fieldCapacity) * 100)}%` as unknown as number }]} />
              <View style={[styles.smdBarFill, {
                width: `${Math.min(100, (currentSmd / fieldCapacity) * 100)}%` as unknown as number,
                backgroundColor: smdStatus === "Critical" ? "#ef4444" : smdStatus === "At Threshold" ? "#f97316" : smdStatus === "Building" ? "#eab308" : "#22c55e",
              }]} />
            </View>
            <View style={styles.smdBarLabels}>
              <Text style={styles.smdBarLabel}>Field Capacity (0 mm)</Text>
              <Text style={styles.smdBarLabel}>Max Deficit ({fieldCapacity} mm)</Text>
            </View>
            {!data?.hasWeatherStation && (
              <Text style={styles.noStationNote}>⚠ Using UK climate normals — no weather station linked to this farm.</Text>
            )}
          </View>

          {/* Cost inputs */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Assumptions</Text>
            <View style={styles.inputGrid}>
              <View style={styles.inputCell}>
                <Text style={styles.label}>Cost per mm/ha (£)</Text>
                <Input value={costPerMmHa} onChangeText={setCostPerMmHa} keyboardType="decimal-pad" placeholder="3.50" />
              </View>
              <View style={styles.inputCell}>
                <Text style={styles.label}>Irrigate (mm)</Text>
                <Input value={irrigateMm} onChangeText={setIrrigateMm} keyboardType="decimal-pad" placeholder="25" />
              </View>
              <View style={styles.inputCell}>
                <Text style={styles.label}>Crop price (£/t)</Text>
                <Input value={cropPricePerTonne} onChangeText={setCropPricePerTonne} keyboardType="decimal-pad" placeholder="220" />
              </View>
              <View style={styles.inputCell}>
                <Text style={styles.label}>Expected rainfall 7d (mm)</Text>
                <Input value={expectedRainfall ?? ""} onChangeText={setExpectedRainfall} keyboardType="decimal-pad" placeholder="5" />
              </View>
            </View>
          </View>

          {/* 7-day rainfall forecast chart */}
          {data?.forecastDailyMm && data.forecastDailyMm.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>7-Day Rainfall Forecast</Text>
              <View style={[styles.statusCard, { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" }]}>
                <ForecastRainfallChart days={data.forecastDailyMm} />
              </View>
            </View>
          ) : data && data.forecastDailyMm === null ? (
            <View style={[styles.unavailableCard]}>
              <Feather name="cloud-off" size={18} color="#64748b" />
              <Text style={[styles.unavailableDesc, { flex: 1 }]}>
                No rainfall forecast available — set a farm location to enable the 7-day forecast chart.
              </Text>
            </View>
          ) : null}

          {/* Scenario cards — only when a recognized crop profile is available */}
          {data && !scenarios && (
            <View style={[styles.unavailableCard]}>
              <Feather name="info" size={18} color="#64748b" />
              <View style={{ flex: 1 }}>
                <Text style={styles.unavailableTitle}>Financial scenarios unavailable</Text>
                <Text style={styles.unavailableDesc}>
                  {!data.assignment
                    ? "No crop is assigned to this field for the current year. Assign a crop from the dashboard to enable yield-loss and net-benefit projections."
                    : `"${data.assignment.cropName}" isn't in the supported crop list. Scenarios require a recognised crop profile to calculate credible yield-loss and net-benefit figures.`}
                </Text>
              </View>
            </View>
          )}
          {scenarios && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>14-Day Scenarios</Text>
              <ScenarioCard
                result={scenarios.irrigateNow}
                accent={{ bg: "#eff6ff", border: "#bfdbfe", label: "blue" }}
                onLog={() => openLogModal(scenarios.irrigateNow)}
              />
              <ScenarioCard
                result={scenarios.wait7}
                accent={{ bg: "#f0fdf4", border: "#bbf7d0", label: "green" }}
                onLog={() => openLogModal(scenarios.wait7)}
              />
              <ScenarioCard
                result={scenarios.skip}
                accent={{ bg: "#fafafa", border: "#e5e7eb", label: "grey" }}
              />
            </View>
          )}

          <View style={{ height: insets.bottom + spacing.xl }} />
        </ScrollView>
      )}

      {/* Field picker modal */}
      {showFieldPicker && data && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setShowFieldPicker(false)}>
          <Pressable style={styles.pickerOverlay} onPress={() => setShowFieldPicker(false)}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Select Field</Text>
              {data.fields.map(f => (
                <Pressable
                  key={f.id}
                  style={[styles.pickerItem, f.id === selectedFieldId && styles.pickerItemSelected]}
                  onPress={() => { setSelectedFieldId(f.id); setShowFieldPicker(false); }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pickerItemText, f.id === selectedFieldId && styles.pickerItemTextSelected]}>
                      {f.name}
                    </Text>
                    {f.fieldReference ? <Text style={styles.pickerSub}>{f.fieldReference}</Text> : null}
                  </View>
                  {f.id === selectedFieldId && <Feather name="check" size={16} color={colors.primary} />}
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Log application modal */}
      {logPrefill && farmId && (
        <LogModal
          farmId={farmId}
          prefill={logPrefill}
          onClose={() => setLogPrefill(null)}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
    backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#f1f5f9",
  },
  backBtn: { marginRight: spacing.sm, padding: 4 },
  headerTitle: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  headerSub: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center" },

  scroll: { padding: spacing.md, gap: spacing.sm },

  section: { gap: spacing.xs },
  sectionLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },

  cropRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: "#fff", borderRadius: radius.md, padding: spacing.sm, borderWidth: 1, borderColor: "#e2e8f0" },
  cropText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1 },

  statusCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, gap: spacing.xs },
  statusHeader: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, flex: 1 },
  statusSmd: { fontFamily: fonts.bold, fontSize: fontSize.sm },
  statusDesc: { fontFamily: fonts.regular, fontSize: fontSize.xs },
  smdBarTrack: { height: 10, backgroundColor: "#e5e7eb", borderRadius: 5, overflow: "hidden", marginTop: 4, position: "relative" },
  smdBarFill: { height: "100%", borderRadius: 5 },
  smdBarCritMarker: { position: "absolute", top: 0, bottom: 0, width: 2, backgroundColor: "#f97316", zIndex: 1 },
  smdBarLabels: { flexDirection: "row", justifyContent: "space-between" },
  smdBarLabel: { fontFamily: fonts.regular, fontSize: 10, color: colors.textSecondary },
  noStationNote: { fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary, marginTop: 2 },

  inputGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  inputCell: { width: "47%", gap: 4 },

  pickerRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff", borderRadius: radius.md, borderWidth: 1, borderColor: "#e2e8f0",
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
  },
  pickerText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  pickerOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: spacing.xl },
  pickerCard: { backgroundColor: "#fff", borderRadius: radius.xl, overflow: "hidden", maxHeight: 400 },
  pickerTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  pickerItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: "#f8fafc" },
  pickerItemSelected: { backgroundColor: colors.primary + "10" },
  pickerItemText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.text, flex: 1 },
  pickerItemTextSelected: { fontFamily: fonts.medium, color: colors.primary },
  pickerSub: { fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary, marginTop: 1 },

  soilWarningBanner: { flexDirection: "row", alignItems: "center", gap: spacing.xs, backgroundColor: "#fefce8", borderRadius: radius.md, borderWidth: 1, borderColor: "#fef08a", padding: spacing.sm },
  soilWarningText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#a16207", flex: 1, lineHeight: 18 },

  unavailableCard: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, backgroundColor: "#f8fafc", borderRadius: radius.lg, borderWidth: 1, borderColor: "#e2e8f0", padding: spacing.md },
  unavailableTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: "#334155", marginBottom: 4 },
  unavailableDesc: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#64748b", lineHeight: 18 },

  scenarioCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.xs },
  scenarioLabel: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.text, marginBottom: 4 },
  scenarioRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scenarioDivider: { borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: spacing.xs, marginTop: spacing.xs },
  scenarioKey: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, flex: 1 },
  scenarioVal: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.text, textAlign: "right" },
  logBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, borderColor: colors.primary + "50", backgroundColor: "#fff" },
  logBtnText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primary },

  // Modal styles
  modalContainer: { flex: 1, backgroundColor: "#fff" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.md, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  modalTitle: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.text },
  modalClose: { padding: 4 },
  modalSubtitle: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textSecondary, paddingHorizontal: spacing.md, paddingBottom: spacing.xs },
  modalScroll: { flex: 1, padding: spacing.md },
  fieldGroup: { marginBottom: spacing.sm, gap: 4 },
  label: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.text },
  readonlyField: { backgroundColor: "#f8fafc", borderRadius: radius.md, borderWidth: 1, borderColor: "#e2e8f0", paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  readonlyText: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textSecondary },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fef2f2", borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm },
  errorText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: "#b91c1c", flex: 1 },
  modalFooter: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
});
