/**
 * Irrigation Advisor Tab
 *
 * A what-if cost tool for arable fields.  All SMD calculations are performed
 * entirely client-side from sensor readings returned by the irrigation-advisor
 * API endpoint, keeping the server thin and the model transparent.
 *
 * Data sources
 * ─────────────
 *  • /api/farms/:id/irrigation-advisor  — fields, crop assignment, 60d sensor data
 *  • localStorage                        — per-farm irrigation cost defaults
 *
 * Calculation model
 * ─────────────────
 *  ET₀ via Hargreaves-Samani (station data) or UK 52°N monthly normals (fallback).
 *  SMD water balance: SMD(t) = max(0, min(FC, SMD(t-1) + ETc − Rainfall)).
 *  Yield response via FAO-56: (1 − Ya/Ym) = Ky × (1 − ETa/ETm).
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  Loader2, Sprout, Gauge, CloudRain, TrendingDown, TrendingUp,
  Minus, Info, Thermometer, BarChart3, AlertCircle, AlertTriangle, PlusCircle,
} from "lucide-react";
import { apiUrl as api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import {
  matchCropProfile,
  getFieldCapacity,
  DEFAULT_FIELD_CAPACITY_MM,
  type CropProfile,
} from "@/lib/irrigationData";
import {
  computeSMD,
  getGrowthStage,
  getSmdStatus,
  computeScenarios,
  computeForecastVerdict,
  type DailyReading,
  type SmdDay,
  type SmdStatus,
  type ScenarioResult,
} from "@/lib/irrigationSMD";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FieldOption {
  id: number;
  name: string;
  fieldReference?: string | null;
  areaHectares?: string | number | null;
  soilType?: string | null;
}

interface CropAssignment {
  id: number;
  cropName: string;
  variety?: string | null;
  plantingDate?: string | null;
  expectedHarvestDate?: string | null;
  year?: number | null;
}

/** Pre-aggregated daily weather row returned by the API (one row per calendar day). */
interface DailyWeatherRow {
  date: string;       // YYYY-MM-DD
  tmax: number | null;
  tmin: number | null;
  rainfallMm: number | null;
}

interface AdvisorPayload {
  fields: FieldOption[];
  assignment: CropAssignment | null;
  /** Pre-aggregated daily weather: at most one row per calendar day, ≤ 60 rows total. */
  dailyWeather: DailyWeatherRow[];
  hasWeatherStation: boolean;
  /** 7-day rainfall forecast from Open-Meteo (null when farm has no location set). */
  forecastRainfall7dMm: number | null;
  /** Day-by-day breakdown of the 7-day forecast (null when no location set). */
  forecastDailyMm: Array<{ date: string; mm: number }> | null;
  year: number;
}

// ─── Local-storage defaults ───────────────────────────────────────────────────

const LS_KEY = (farmId: number) => `irrigation-advisor-defaults-${farmId}`;
const LS_METHOD_KEY = (farmId: number) => `irrigation-advisor-method-${farmId}`;

interface IrrigDefaults {
  costPerMmHa: string;
  cropPricePerTonne: string;
  expectedRainfall7dMm: string;
  irrigateMm: string;
}

const DEFAULT_IRRIGATION_METHOD = "Overhead sprinkler";

function loadLastMethod(farmId: number): string {
  try {
    return localStorage.getItem(LS_METHOD_KEY(farmId)) ?? DEFAULT_IRRIGATION_METHOD;
  } catch { /* ignore */ }
  return DEFAULT_IRRIGATION_METHOD;
}
function saveLastMethod(farmId: number, method: string) {
  try { localStorage.setItem(LS_METHOD_KEY(farmId), method); } catch { /* ignore */ }
}

function loadDefaults(farmId: number): IrrigDefaults {
  try {
    const raw = localStorage.getItem(LS_KEY(farmId));
    if (raw) return { ...emptyDefaults(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return emptyDefaults();
}
function emptyDefaults(): IrrigDefaults {
  return { costPerMmHa: "3.50", cropPricePerTonne: "220", expectedRainfall7dMm: "5", irrigateMm: "25" };
}
function saveDefaults(farmId: number, d: IrrigDefaults) {
  try { localStorage.setItem(LS_KEY(farmId), JSON.stringify(d)); } catch { /* ignore */ }
}

// ─── Helper functions ─────────────────────────────────────────────────────────

/** Pad daily reading series to include every calendar day for last 60 days */
function padReadings(readings: DailyReading[]): DailyReading[] {
  const today = new Date();
  const result: DailyReading[] = [];
  const byDate: Record<string, DailyReading> = {};
  for (const r of readings) byDate[r.date] = r;
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push(byDate[key] ?? { date: key });
  }
  return result;
}

const statusColour: Record<SmdStatus, { bg: string; text: string; dot: string }> = {
  "OK":           { bg: "bg-green-50 border-green-200",  text: "text-green-800",  dot: "bg-green-500"  },
  "Building":     { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-800", dot: "bg-yellow-500" },
  "At Threshold": { bg: "bg-orange-50 border-orange-200", text: "text-orange-800", dot: "bg-orange-500" },
  "Critical":     { bg: "bg-red-50 border-red-200",      text: "text-red-800",    dot: "bg-red-500"    },
};
const statusDesc: Record<SmdStatus, string> = {
  "OK":           "Soil has adequate moisture — no irrigation needed yet.",
  "Building":     "Deficit is growing — monitor closely over the next few days.",
  "At Threshold": "You are approaching the critical deficit for this crop — consider irrigating.",
  "Critical":     "Deficit exceeds the critical threshold — crop is likely under stress. Irrigate promptly.",
};

function fmtGbp(v: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);
}
function fmtPct(v: number) { return `${(v * 100).toFixed(1)}%`; }

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SmdGauge({ smd, fc, critical }: { smd: number; fc: number; critical: number }) {
  const pct = Math.min(100, (smd / fc) * 100);
  const critPct = (critical / fc) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Field Capacity (0 mm)</span>
        <span>Max Deficit ({fc} mm)</span>
      </div>
      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
        {/* Critical threshold line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-orange-400 z-10"
          style={{ left: `${critPct}%` }}
          title={`Critical threshold: ${critical} mm`}
        />
        {/* SMD fill */}
        <div
          className={`h-full rounded-full transition-all ${
            pct > (critPct * 1.2) ? "bg-red-500" :
            pct > critPct ? "bg-orange-400" :
            pct > critPct * 0.6 ? "bg-yellow-400" : "bg-green-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-center text-sm font-semibold">{smd.toFixed(1)} mm SMD</div>
    </div>
  );
}

function ScenarioCard({ result, accent, icon, onLog }: { result: ScenarioResult; accent: string; icon: React.ReactNode; onLog?: () => void }) {
  const netPositive = result.netBenefit >= 0;
  return (
    <div className={`rounded-lg border p-4 space-y-3 ${accent}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold text-sm">{result.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <span className="text-muted-foreground">Irrigation applied</span>
        <span className="font-medium text-right">{result.irrigationMm} mm</span>

        <span className="text-muted-foreground">Irrigation cost</span>
        <span className="font-medium text-right">{fmtGbp(result.irrigationCostTotal)}</span>

        {result.irrigationMm > 0 && (
          <>
            <span className="text-muted-foreground">SMD after application</span>
            <span className="font-medium text-right">{result.projectedSmdAfterMm.toFixed(1)} mm</span>
          </>
        )}

        <span className="text-muted-foreground">Est. SMD (day 14)</span>
        <span className="font-medium text-right">{result.projectedSmd14Mm.toFixed(1)} mm</span>

        <span className="text-muted-foreground">Yield loss est. (day 14)</span>
        <span className="font-medium text-right">{result.yieldLossTha.toFixed(2)} t/ha ({fmtPct(result.yieldLossFraction)})</span>

        <span className="text-muted-foreground">Revenue saved vs. no-irrig.</span>
        <span className="font-medium text-right">{fmtGbp(result.irrigationRevenueSaved)}</span>

        <span className="col-span-2 border-t pt-1.5 mt-0.5" />

        <span className={`font-semibold ${netPositive ? "text-green-700" : "text-red-700"}`}>Net benefit</span>
        <span className={`font-bold text-right ${netPositive ? "text-green-700" : "text-red-700"}`}>
          {netPositive ? "+" : ""}{fmtGbp(result.netBenefit)}
        </span>
      </div>
      {result.irrigationMm > 0 && onLog && (
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-7"
          onClick={onLog}
        >
          <PlusCircle className="w-3.5 h-3.5 mr-1" />
          Log this application
        </Button>
      )}
    </div>
  );
}

// ─── Log Application Dialog ───────────────────────────────────────────────────

interface LogAppPrefill {
  fieldId: string;
  fieldName: string;
  cropName: string;
  applicationDepthMm: number;
  scenarioLabel: string;
}

interface WaterAbstractionLicence {
  id: number;
  licenceNumber: string;
  waterSource: string;
  sourceType?: string | null;
}

interface IrrigationRecord {
  id: number;
  licenceId?: number | null;
  fieldId?: number | null;
  irrigationDate: string;
}

function LogApplicationDialog({
  farmId,
  prefill,
  onClose,
}: {
  farmId: number;
  prefill: LogAppPrefill;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);

  // ── Fetch abstraction licences for this farm ──────────────────────────────
  const { data: licences = [] } = useQuery<WaterAbstractionLicence[]>({
    queryKey: ["water-abstraction-licences", farmId],
    queryFn: () =>
      fetch(api(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" })
        .then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); }),
    staleTime: 2 * 60 * 1000,
  });

  // ── Fetch most-recent irrigation record for this specific field ───────────
  const fieldIdNum = prefill.fieldId ? parseInt(prefill.fieldId) : null;
  const { data: fieldRecords = [] } = useQuery<IrrigationRecord[]>({
    queryKey: ["irrig-records-field", farmId, fieldIdNum],
    queryFn: () => {
      const params = fieldIdNum ? `?fieldId=${fieldIdNum}` : "";
      return fetch(api(`farms/${farmId}/irrigation-records${params}`), { credentials: "include" })
        .then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); });
    },
    enabled: !!fieldIdNum,
    staleTime: 2 * 60 * 1000,
  });

  // ── Derive the best licence pre-fill ─────────────────────────────────────
  // Priority: (1) MRU licence for this field, (2) only licence on the farm, (3) none
  const derivedLicenceId = useMemo((): string => {
    // Check MRU: find most-recent record that has a licenceId
    const mru = fieldRecords.find(r => r.licenceId != null);
    if (mru?.licenceId != null) {
      // Verify the licence still exists on this farm
      if (licences.some(l => l.id === mru.licenceId)) return String(mru.licenceId);
    }
    // Fall back to single-licence auto-select
    if (licences.length === 1) return String(licences[0].id);
    return "";
  }, [fieldRecords, licences]);

  const [form, setForm] = useState({
    irrigationDate: today,
    cropType: prefill.cropName,
    applicationDepthMm: String(prefill.applicationDepthMm),
    irrigationMethod: loadLastMethod(farmId),
    status: "closed",
    licenceId: "",
    notes: "",
  });

  // Apply derived licence pre-fill once licences + records are loaded
  const licencePrefillAppliedRef = useRef(false);
  useEffect(() => {
    if (licencePrefillAppliedRef.current) return;
    if (derivedLicenceId) {
      licencePrefillAppliedRef.current = true;
      setForm(f => ({ ...f, licenceId: derivedLicenceId }));
    }
  }, [derivedLicenceId]);

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) =>
      fetch(api(`farms/${farmId}/irrigation-records`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(b),
      }).then(async r => {
        if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); }
        return r;
      }),
    onSuccess: () => {
      saveLastMethod(farmId, form.irrigationMethod);
      qc.invalidateQueries({ queryKey: ["irrig-records", farmId] });
      qc.invalidateQueries({ queryKey: ["irrig-records-field", farmId, fieldIdNum] });
      onClose();
    },
  });

  function handleSave() {
    const payload: Record<string, unknown> = {
      irrigationDate: form.irrigationDate,
      cropType: form.cropType || undefined,
      applicationDepthMm: form.applicationDepthMm ? parseFloat(form.applicationDepthMm) : undefined,
      irrigationMethod: form.irrigationMethod,
      status: form.status,
      notes: form.notes || undefined,
    };
    if (prefill.fieldId) payload.fieldId = parseInt(prefill.fieldId);
    if (form.licenceId) payload.licenceId = parseInt(form.licenceId);
    save.mutate(payload);
  }

  // ── Resolve display label for pre-fill source ─────────────────────────────
  const prefillSource = useMemo((): string | null => {
    if (!form.licenceId || !derivedLicenceId || form.licenceId !== derivedLicenceId) return null;
    const mru = fieldRecords.find(r => r.licenceId != null && String(r.licenceId) === form.licenceId);
    if (mru) return "previously used for this field";
    if (licences.length === 1) return "only licence on this farm";
    return null;
  }, [form.licenceId, derivedLicenceId, fieldRecords, licences]);

  return (
    <Dialog open onOpenChange={v => { if (!v) { save.reset(); onClose(); } }}>
      <DialogContent style={{ maxWidth: "32rem" }}>
        <DialogHeader>
          <DialogTitle>Log Irrigation Application</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-1">
          Pre-filled from the <strong>{prefill.scenarioLabel}</strong> scenario — adjust before saving.
          The record will appear in the Applications tab.
        </p>
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div>
            <Label>Date *</Label>
            <Input
              type="date"
              value={form.irrigationDate}
              onChange={e => setForm(f => ({ ...f, irrigationDate: e.target.value }))}
            />
          </div>
          <div>
            <Label>Field</Label>
            <Input value={prefill.fieldName} readOnly className="bg-muted/50 text-muted-foreground" />
          </div>
          <div>
            <Label>Crop Type</Label>
            <Input
              value={form.cropType}
              onChange={e => setForm(f => ({ ...f, cropType: e.target.value }))}
              placeholder="e.g. Wheat"
            />
          </div>
          <div>
            <Label>Application Depth (mm)</Label>
            <Input
              type="number"
              step="0.1"
              value={form.applicationDepthMm}
              onChange={e => setForm(f => ({ ...f, applicationDepthMm: e.target.value }))}
            />
          </div>
          <div className="col-span-2">
            <Label>Water Source / Licence</Label>
            {licences.length === 0 ? (
              <Input
                value=""
                readOnly
                disabled
                className="bg-muted/50 text-muted-foreground"
                placeholder="No abstraction licences set up"
              />
            ) : (
              <>
                <Select
                  value={form.licenceId || "__none__"}
                  onValueChange={v => setForm(f => ({ ...f, licenceId: v === "__none__" ? "" : v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a licence…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {licences.map(l => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.licenceNumber}
                        {l.waterSource ? ` — ${l.waterSource}` : ""}
                        {l.sourceType ? ` (${l.sourceType})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {prefillSource && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-selected: {prefillSource}.
                  </p>
                )}
              </>
            )}
          </div>
          <div>
            <Label>Method *</Label>
            <Select value={form.irrigationMethod} onValueChange={v => setForm(f => ({ ...f, irrigationMethod: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Overhead sprinkler", "Drip / trickle", "Furrow / flood", "Pivot", "Boom", "Traveller", "Hand-held", "Other"].map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="closed">Complete</SelectItem>
                <SelectItem value="open">Open (in progress)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label>Notes</Label>
            <Input
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes"
            />
          </div>
        </div>
        <DialogMutationError mutation={save} message="Failed to save — please try again." />
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            Log Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Manual rainfall entry ─────────────────────────────────────────────────────

interface ManualDay {
  date: string;
  tmax: string;
  tmin: string;
  rainfall: string;
}

function makeManualDays(): ManualDay[] {
  const rows: ManualDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    rows.push({ date: d.toISOString().slice(0, 10), tmax: "", tmin: "", rainfall: "" });
  }
  return rows;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function IrrigationAdvisorTab({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();

  // ── Selection state ────────────────────────────────────────────────────────
  const [selectedFieldId, setSelectedFieldId] = useState<string>("");
  const [year, setYear] = useState<string>(String(currentYear));

  // ── Log-application dialog ─────────────────────────────────────────────────
  const [logPrefill, setLogPrefill] = useState<LogAppPrefill | null>(null);

  // ── Platform config (provides server-side fallback defaults) ───────────────
  const { data: platformConfig, isFetched: platformConfigFetched } = useQuery<Record<string, string>>({
    queryKey: ["platform-config"],
    queryFn: () =>
      fetch(api("platform-config")).then(r => r.json()).then((d: { config: Record<string, string> }) => d.config),
    staleTime: 5 * 60 * 1000,
  });

  // ── Farm-level irrigation settings (DB-persisted, preferred over platform config) ──
  const { data: farmRecord, isFetched: farmRecordFetched } = useQuery<Record<string, unknown>>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(api(`farms/${farmId}`), { credentials: "include" }).then(r => r.json()).then(d => d.record ?? d),
    staleTime: 5 * 60 * 1000,
    enabled: !!farmId,
  });

  // ── Cost defaults — seeded from farm DB, then platform config, then localStorage ──
  const [defaults, setDefaultsState] = useState<IrrigDefaults>(() => loadDefaults(farmId));

  // ── Reset all per-farm UI state when the active farm changes ─────────────
  // (The component may stay mounted while the parent switches farmId.)
  const prevFarmIdRef = useRef(farmId);
  useEffect(() => {
    if (prevFarmIdRef.current === farmId) return;
    prevFarmIdRef.current = farmId;
    setDefaultsState(loadDefaults(farmId));
    // Refs reset so the seeding effects re-run for the new farm.
    // (rainfallFromForecast state + ref cleared via setForecastFlag below;
    //  both are in scope because this callback runs after all declarations.)
    setForecastFlag(false); // eslint-disable-line no-use-before-define
    configSeededForFarmRef.current = null;  // eslint-disable-line no-use-before-define
    forecastSeededForFarmRef.current = null; // eslint-disable-line no-use-before-define
  }, [farmId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Seed costPerMmHa / cropPricePerTonne / irrigateMm from farm DB first,
  // then platform config (cost only), then leave at localStorage value.
  // Each field is seeded independently so a missing cost value still receives
  // its platform-config fallback even when crop price or app rate have DB values.
  // We must wait until farmRecord has settled (isFetched) before marking done —
  // platformConfig often resolves first and must never permanently block DB values.
  const configSeededForFarmRef = useRef<number | null>(null);
  useEffect(() => {
    if (configSeededForFarmRef.current === farmId) return;
    // Wait for BOTH queries to have settled: farm-detail supplies crop price and
    // app rate; platform config is the fallback source for cost. Marking done
    // before either has resolved means one source silently wins and the other
    // is permanently ignored.
    if (!farmRecordFetched || !platformConfigFetched) return;
    configSeededForFarmRef.current = farmId;

    setDefaultsState(prev => {
      const next = { ...prev };

      // 1a. Farm-level DB cost → platform config fallback → leave as-is
      const farmCost = farmRecord?.irrigationCostPerMmHa as string | undefined;
      if (farmCost) {
        next.costPerMmHa = farmCost;
      } else if (!localStorage.getItem(LS_KEY(farmId))) {
        const serverCost = platformConfig?.["irrigation.costPerMmHa"];
        if (serverCost) next.costPerMmHa = serverCost;
      }

      // 1b. Farm-level DB crop price → leave as-is (no platform fallback for this field)
      const farmCropPrice = farmRecord?.irrigationCropPricePerTonne as string | undefined;
      if (farmCropPrice) next.cropPricePerTonne = farmCropPrice;

      // 1c. Farm-level DB application rate → leave as-is (no platform fallback for this field)
      const farmAppRate = farmRecord?.irrigationApplicationRateMm as string | undefined;
      if (farmAppRate) next.irrigateMm = farmAppRate;

      return next;
    });
  }, [farmRecord, farmRecordFetched, platformConfig, platformConfigFetched, farmId]);

  const qc = useQueryClient();

  // ── Save cost as farm default ──────────────────────────────────────────────
  const saveCostDefault = useMutation({
    mutationFn: (costPerMmHa: string) =>
      fetch(api(`farms/${farmId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ irrigationCostPerMmHa: costPerMmHa }),
      }).then(async r => {
        if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); }
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-detail", farmId] });
    },
  });

  // ── Save crop price as farm default ───────────────────────────────────────
  const saveCropPriceDefault = useMutation({
    mutationFn: (cropPricePerTonne: string) =>
      fetch(api(`farms/${farmId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ irrigationCropPricePerTonne: cropPricePerTonne }),
      }).then(async r => {
        if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); }
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-detail", farmId] });
    },
  });

  // ── Save application rate as farm default ──────────────────────────────────
  const saveAppRateDefault = useMutation({
    mutationFn: (irrigateMm: string) =>
      fetch(api(`farms/${farmId}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ irrigationApplicationRateMm: irrigateMm }),
      }).then(async r => {
        if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); }
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-detail", farmId] });
    },
  });

  // Derived: does the session value differ from what's stored in the DB?
  // Uses numeric comparison so "3.5" == "3.50" (Postgres numeric(8,2)) and empty == null.
  function numericDiffersFromDb(session: string, dbVal: string | undefined): boolean {
    const s = session.trim();
    const sEmpty = s === "";
    const dEmpty = dbVal == null || dbVal === "";
    if (sEmpty !== dEmpty) return true;
    if (sEmpty && dEmpty) return false;
    return parseFloat(s) !== parseFloat(dbVal!);
  }

  const dbCost = farmRecord?.irrigationCostPerMmHa as string | undefined;
  const costDiffersFromDb = numericDiffersFromDb(defaults.costPerMmHa, dbCost);

  const dbCropPrice = farmRecord?.irrigationCropPricePerTonne as string | undefined;
  const cropPriceDiffersFromDb = numericDiffersFromDb(defaults.cropPricePerTonne, dbCropPrice);

  const dbAppRate = farmRecord?.irrigationApplicationRateMm as string | undefined;
  const appRateDiffersFromDb = numericDiffersFromDb(defaults.irrigateMm, dbAppRate);

  function updateDefault(key: keyof IrrigDefaults, value: string) {
    const next = { ...defaults, [key]: value };
    setDefaultsState(next);
    // Do NOT persist a forecast-seeded rainfall value as a user override when
    // an unrelated field is saved — that would freeze the old forecast and
    // prevent re-seeding on the next mount.  Only write expectedRainfall7dMm
    // to localStorage when the user explicitly edits that field.
    if (key !== "expectedRainfall7dMm" && rainfallFromForecastRef.current) { // eslint-disable-line no-use-before-define
      const { expectedRainfall7dMm: _omit, ...rest } = next;
      void _omit;
      saveDefaults(farmId, rest as IrrigDefaults);
    } else {
      saveDefaults(farmId, next);
    }
  }

  // ── Manual data entry mode (when no weather station) ──────────────────────
  const [useManual, setUseManual] = useState(false);
  const [manualRows, setManualRows] = useState<ManualDay[]>(() => makeManualDays());

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isFetching, isError } = useQuery<AdvisorPayload>({
    queryKey: ["irrigation-advisor", farmId, selectedFieldId, year],
    queryFn: () => {
      const params = new URLSearchParams({ year });
      if (selectedFieldId) params.set("fieldId", selectedFieldId);
      return fetch(api(`farms/${farmId}/irrigation-advisor?${params}`), { credentials: "include" })
        .then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); });
    },
  });

  // ── Forecast rainfall pre-fill ────────────────────────────────────────────
  // Keyed by farmId so switching farms re-seeds from the new farm's forecast.
  // Guards against isFetching to ensure we never use stale data from a prior farm.
  const forecastSeededForFarmRef = useRef<number | null>(null);
  const [rainfallFromForecast, setRainfallFromForecast] = useState(false);
  // Ref kept in sync with the state for synchronous reads in event handlers.
  const rainfallFromForecastRef = useRef(false);
  function setForecastFlag(val: boolean) {
    rainfallFromForecastRef.current = val;
    setRainfallFromForecast(val);
  }
  useEffect(() => {
    if (!data || isFetching) return;                            // wait for fresh data
    if (forecastSeededForFarmRef.current === farmId) return;   // already seeded for this farm
    if (data.forecastRainfall7dMm == null) {
      forecastSeededForFarmRef.current = farmId;               // no forecast available — mark done
      return;
    }
    forecastSeededForFarmRef.current = farmId;
    // Only pre-fill when there is no manually-edited localStorage override for rainfall
    const stored = localStorage.getItem(LS_KEY(farmId));
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<IrrigDefaults>;
        if (parsed.expectedRainfall7dMm != null) return; // user has a stored preference
      } catch { /* ignore */ }
    }
    setDefaultsState(prev => ({
      ...prev,
      expectedRainfall7dMm: String(data.forecastRainfall7dMm),
    }));
    setForecastFlag(true);
  }, [data, isFetching, farmId]);

  // ── Field/crop derivations ─────────────────────────────────────────────────
  const field = useMemo(
    () => data?.fields.find(f => String(f.id) === selectedFieldId) ?? null,
    [data, selectedFieldId],
  );
  const areaHa = field ? (parseFloat(String(field.areaHectares ?? "0")) || 1) : 1;
  const cropProfile: CropProfile | null = useMemo(
    () => data?.assignment ? matchCropProfile(data.assignment.cropName) : null,
    [data?.assignment],
  );
  const fieldCapacity = useMemo(
    () => field ? getFieldCapacity(field.soilType) : DEFAULT_FIELD_CAPACITY_MM,
    [field],
  );

  // ── SMD calculation ─────────────────────────────────────────────────────────
  const smdSeries = useMemo((): SmdDay[] => {
    let dailyReadings: DailyReading[];
    if (useManual || !data?.hasWeatherStation) {
      // Always build a full 60-day padded series so today's SMD accounts for
      // the preceding weeks (climate-normal ET₀ used where values are blank).
      // Manual rows are overlaid on top for dates the user has filled in.
      const manualByDate: Record<string, ManualDay> = {};
      for (const r of manualRows) manualByDate[r.date] = r;

      dailyReadings = padReadings([]).map(d => {
        const m = manualByDate[d.date];
        if (!m) return d; // empty → SMD engine uses climate normal
        return {
          date: d.date,
          tmax: m.tmax ? parseFloat(m.tmax) : undefined,
          tmin: m.tmin ? parseFloat(m.tmin) : undefined,
          rainfall: m.rainfall ? parseFloat(m.rainfall) : undefined,
        };
      });
    } else {
      // API returns pre-aggregated daily rows (Tmax, Tmin, rainfallMm) — one per
      // calendar day — so no client-side collapse is needed regardless of the
      // station's reporting frequency.
      const stationRows: DailyReading[] = (data?.dailyWeather ?? []).map(r => ({
        date:     r.date,
        tmax:     r.tmax     != null ? r.tmax     : undefined,
        tmin:     r.tmin     != null ? r.tmin     : undefined,
        rainfall: r.rainfallMm != null ? r.rainfallMm : undefined,
      }));
      dailyReadings = padReadings(stationRows);
    }

    return computeSMD(
      dailyReadings,
      cropProfile,
      fieldCapacity,
      data?.assignment?.plantingDate ?? null,
      data?.assignment?.expectedHarvestDate,
    );
  }, [data, useManual, manualRows, cropProfile, fieldCapacity]);

  const todaySmd = smdSeries.length ? smdSeries[smdSeries.length - 1]?.smd ?? 0 : 0;
  const todayEtC = smdSeries.length ? smdSeries[smdSeries.length - 1]?.etC ?? 0 : 0;
  const smdStatus = cropProfile
    ? getSmdStatus(todaySmd, cropProfile.criticalSmdMm)
    : getSmdStatus(todaySmd, fieldCapacity * 0.5);
  const criticalThreshold = cropProfile?.criticalSmdMm ?? fieldCapacity * 0.5;
  const growthStage = getGrowthStage(
    cropProfile,
    data?.assignment?.plantingDate ?? null,
    data?.assignment?.expectedHarvestDate,
    new Date().toISOString().slice(0, 10),
  );

  // ── Scenario calculation ──────────────────────────────────────────────────
  const scenarios = useMemo(() => {
    if (!cropProfile) return null;
    const costPerMmHa = parseFloat(defaults.costPerMmHa) || 3.50;
    const cropPrice = parseFloat(defaults.cropPricePerTonne) || 220;
    const rain7d = parseFloat(defaults.expectedRainfall7dMm) || 0;
    const irrigateMm = parseFloat(defaults.irrigateMm) || 25;
    return computeScenarios({
      currentSmdMm: todaySmd,
      irrigateMm,
      costPerMmHa,
      fieldAreaHa: areaHa,
      cropPricePerTonne: cropPrice,
      typicalYieldTha: cropProfile.typicalYieldTha,
      Ky: cropProfile.Ky,
      fieldCapacityMm: fieldCapacity,
      criticalSmdMm: criticalThreshold,
      expectedRainfall7dMm: rain7d,
      currentDailyEtcMm: todayEtC,
    });
  }, [cropProfile, todaySmd, todayEtC, defaults, areaHa, fieldCapacity, criticalThreshold]);

  // ── Chart data (30-day history + 7-day SMD projection) ─────────────────────
  const chartData = useMemo(() => {
    const historical = smdSeries.slice(-30).map((d, i, arr) => ({
      date: d.date.slice(5), // MM-DD
      smd: parseFloat(d.smd.toFixed(1)),
      rain: parseFloat(d.rainfall.toFixed(1)),
      etC: parseFloat(d.etC.toFixed(2)),
      // Anchor the projection line at today so it connects without a gap
      smdProjected: i === arr.length - 1 ? parseFloat(d.smd.toFixed(1)) : (null as number | null),
    }));

    // Build a per-day forecast array for the projection
    const forecastDays = data?.forecastDailyMm;
    const forecastTotal = data?.forecastRainfall7dMm;
    let dailyForecast: Array<{ date: string; mm: number }> | null = null;
    if (forecastDays && forecastDays.length > 0) {
      dailyForecast = forecastDays.slice(0, 7);
    } else if (forecastTotal != null) {
      // Fall back to spreading the 7-day total uniformly
      const dailyMm = forecastTotal / 7;
      dailyForecast = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        return { date: d.toISOString().slice(0, 10), mm: dailyMm };
      });
    }

    if (!dailyForecast) return historical;

    // Project SMD forward using the same water-balance model
    let smd = todaySmd;
    const projected = dailyForecast.map(day => {
      smd = Math.max(0, Math.min(fieldCapacity, smd + todayEtC - day.mm));
      return {
        date: day.date.slice(5),
        smd: null as number | null,
        rain: null as number | null,
        etC: null as number | null,
        smdProjected: parseFloat(smd.toFixed(1)),
      };
    });

    return [...historical, ...projected];
  }, [smdSeries, data, todaySmd, todayEtC, fieldCapacity]);

  const statusStyle = statusColour[smdStatus];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap gap-3 items-start justify-between">
        <div>
          <h3 className="font-semibold text-base flex items-center gap-2">
            <Sprout className="w-4 h-4 text-green-600" />
            Irrigation Advisor
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Soil moisture deficit model + what-if cost analysis for arable fields.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="space-y-1">
            <Label className="text-xs">Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Field selector ── */}
      <div className="space-y-1.5">
        <Label className="text-sm">Field</Label>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading fields…
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 text-sm text-red-600 py-2">
            <AlertCircle className="w-4 h-4" /> Failed to load irrigation advisor data.
          </div>
        ) : !data?.fields.length ? (
          <div className="text-sm text-muted-foreground py-2 italic">
            No fields found. Add fields in the Field & Crop Management module first.
          </div>
        ) : (
          <Select value={selectedFieldId} onValueChange={setSelectedFieldId}>
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Choose a field…" />
            </SelectTrigger>
            <SelectContent>
              {data.fields.map(f => (
                <SelectItem key={f.id} value={String(f.id)}>
                  {f.name}{f.fieldReference ? ` (${f.fieldReference})` : ""}
                  {f.areaHectares ? ` — ${parseFloat(String(f.areaHectares)).toFixed(2)} ha` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Only show the rest once a field is picked */}
      {selectedFieldId && (
        <>
          {/* ── Field + Crop summary ── */}
          <div className="rounded-lg border bg-muted/30 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Soil Type</p>
              <p className="font-medium">{field?.soilType ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Field Capacity (AWC)</p>
              <p className="font-medium">{fieldCapacity} mm</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Crop ({year})</p>
              <p className="font-medium">
                {data?.assignment
                  ? `${data.assignment.cropName}${data.assignment.variety ? ` — ${data.assignment.variety}` : ""}`
                  : <span className="italic text-muted-foreground">No crop assigned</span>
                }
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Growth Stage</p>
              <p className="font-medium">{growthStage}</p>
            </div>
            {(farmRecord?.irrigationAbstractionSource || platformConfig?.["irrigation.abstractionSource"]) && (
              <div>
                <p className="text-xs text-muted-foreground">Abstraction Source</p>
                <p className="font-medium">
                  {(farmRecord?.irrigationAbstractionSource as string | undefined) || platformConfig?.["irrigation.abstractionSource"]}
                </p>
              </div>
            )}
            {cropProfile && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">Kc (today)</p>
                  <p className="font-medium">{smdSeries.length ? smdSeries[smdSeries.length - 1]?.kc.toFixed(2) : "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Critical SMD</p>
                  <p className="font-medium">{criticalThreshold} mm</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Yield Response (Ky)</p>
                  <p className="font-medium">{cropProfile.Ky}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Daily ETc (est.)</p>
                  <p className="font-medium">{todayEtC.toFixed(2)} mm/day</p>
                </div>
              </>
            )}
          </div>

          {/* ── Soil type warning ── */}
          {field && !field.soilType && (
            <a
              href={`/fields?editFieldId=${selectedFieldId}`}
              className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 hover:bg-yellow-100 transition-colors no-underline"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="flex-1">
                <span className="font-medium">Soil type not set</span> — field capacity is estimated at {DEFAULT_FIELD_CAPACITY_MM} mm (medium loam default).
                Set the soil type on this field for a more accurate calculation.
              </span>
              <span className="text-xs font-medium underline underline-offset-2">Edit field →</span>
            </a>
          )}

          {/* ── Data source notice ── */}
          {data && !data.hasWeatherStation && !useManual && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <Thermometer className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex-1">
                <span className="font-medium">No weather station connected.</span>{" "}
                SMD is estimated from UK 52°N climate normals — accuracy will be lower than with real station data.{" "}
                <button
                  className="underline font-medium ml-1"
                  onClick={() => setUseManual(true)}
                >Enter readings manually instead
                </button>
              </div>
            </div>
          )}
          {data?.hasWeatherStation && !useManual && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CloudRain className="w-3.5 h-3.5 text-blue-500" />
              Using 60 days of weather station data (Hargreaves-Samani ET₀).{" "}
              <button className="underline" onClick={() => setUseManual(true)}>Switch to manual entry</button>
            </div>
          )}
          {useManual && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Manual Weather Entry (last 7 days)</p>
                {data?.hasWeatherStation && (
                  <button className="text-xs underline text-muted-foreground" onClick={() => setUseManual(false)}>
                    Switch back to station data
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-1 pr-2 font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-1 pr-2 font-medium text-muted-foreground">Max °C</th>
                      <th className="text-left py-1 pr-2 font-medium text-muted-foreground">Min °C</th>
                      <th className="text-left py-1 font-medium text-muted-foreground">Rainfall mm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualRows.map((row, i) => (
                      <tr key={row.date} className="border-b last:border-0">
                        <td className="py-1 pr-2">{row.date}</td>
                        <td className="py-1 pr-2">
                          <Input
                            type="number" step="0.1" value={row.tmax}
                            onChange={e => {
                              const next = [...manualRows];
                              next[i] = { ...next[i], tmax: e.target.value };
                              setManualRows(next);
                            }}
                            className="h-6 w-20 text-xs"
                          />
                        </td>
                        <td className="py-1 pr-2">
                          <Input
                            type="number" step="0.1" value={row.tmin}
                            onChange={e => {
                              const next = [...manualRows];
                              next[i] = { ...next[i], tmin: e.target.value };
                              setManualRows(next);
                            }}
                            className="h-6 w-20 text-xs"
                          />
                        </td>
                        <td className="py-1">
                          <Input
                            type="number" step="0.1" value={row.rainfall}
                            onChange={e => {
                              const next = [...manualRows];
                              next[i] = { ...next[i], rainfall: e.target.value };
                              setManualRows(next);
                            }}
                            className="h-6 w-20 text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── SMD Status panel ── */}
          <div className={`rounded-lg border p-4 space-y-4 ${statusStyle.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusStyle.dot}`} />
                <span className={`font-semibold text-sm ${statusStyle.text}`}>{smdStatus}</span>
              </div>
              <Badge variant="outline" className="text-xs">{new Date().toLocaleDateString("en-GB")}</Badge>
            </div>
            <p className={`text-xs ${statusStyle.text}`}>{statusDesc[smdStatus]}</p>
            <SmdGauge smd={todaySmd} fc={fieldCapacity} critical={criticalThreshold} />
          </div>

          {/* ── 30-day SMD chart + 7-day projection ── */}
          {chartData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                  30-day Soil Moisture Deficit
                </p>
                {data?.forecastDailyMm || data?.forecastRainfall7dMm != null ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <span
                      className="inline-block w-6 border-t-2 border-dashed border-blue-400"
                      style={{ borderStyle: "dashed" }}
                    />
                    7-day forecast projection
                  </span>
                ) : null}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} unit=" mm" />
                  <Tooltip
                    contentStyle={{ fontSize: 11 }}
                    formatter={(val, name) => {
                      if (val === null || val === undefined) return [null, null];
                      if (name === "smdProjected") return [`${Number(val).toFixed(1)} mm`, "Projected (with forecast rain)"];
                      if (name === "smd") return [`${Number(val).toFixed(1)} mm`, "SMD"];
                      if (name === "rain") return [`${Number(val).toFixed(1)} mm`, "Rainfall"];
                      return [`${Number(val).toFixed(2)} mm`, "ETc"];
                    }}
                  />
                  {/* Critical threshold line */}
                  <ReferenceLine
                    y={criticalThreshold}
                    stroke="#f97316"
                    strokeDasharray="4 2"
                    label={{ value: `Critical ${criticalThreshold}mm`, position: "insideTopRight", fontSize: 9, fill: "#f97316" }}
                  />
                  {/* Historical SMD */}
                  <Area
                    type="monotone" dataKey="smd" stroke="#3b82f6" fill="#93c5fd"
                    fillOpacity={0.3} name="smd" strokeWidth={1.5}
                  />
                  {/* 7-day projected SMD — dashed, lighter fill */}
                  <Area
                    type="monotone" dataKey="smdProjected" stroke="#3b82f6" fill="#93c5fd"
                    fillOpacity={0.12} name="smdProjected" strokeWidth={1.5}
                    strokeDasharray="5 3" strokeOpacity={0.65}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── What-if inputs ── */}
          <div className="space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <Gauge className="w-4 h-4 text-purple-500" />
              What-if Parameters
              <span className="text-xs text-muted-foreground font-normal">
                (saved per farm)
              </span>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cost per mm/ha (£)</Label>
                <div className="flex gap-1.5 items-center">
                  <Input
                    type="number" step="0.1" min="0"
                    value={defaults.costPerMmHa}
                    onChange={e => { saveCostDefault.reset(); updateDefault("costPerMmHa", e.target.value); }}
                    className="h-8 text-sm"
                  />
                  {costDiffersFromDb && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs whitespace-nowrap shrink-0"
                      onClick={() => saveCostDefault.mutate(defaults.costPerMmHa)}
                      disabled={saveCostDefault.isPending}
                      title="Save this value as the farm default (persists across devices)"
                    >
                      {saveCostDefault.isPending
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : saveCostDefault.isSuccess
                          ? "Saved ✓"
                          : "Save as default"}
                    </Button>
                  )}
                </div>
                {saveCostDefault.isError && (
                  <p className="text-xs text-red-600">Failed to save — please try again.</p>
                )}
                <p className="text-xs text-muted-foreground">Pump + abstraction cost</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Crop price (£/t)</Label>
                <div className="flex gap-1.5 items-center">
                  <Input
                    type="number" step="1" min="0"
                    value={defaults.cropPricePerTonne}
                    onChange={e => { saveCropPriceDefault.reset(); updateDefault("cropPricePerTonne", e.target.value); }}
                    className="h-8 text-sm"
                  />
                  {cropPriceDiffersFromDb && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs whitespace-nowrap shrink-0"
                      onClick={() => saveCropPriceDefault.mutate(defaults.cropPricePerTonne)}
                      disabled={saveCropPriceDefault.isPending}
                      title="Save this value as the farm default (persists across devices)"
                    >
                      {saveCropPriceDefault.isPending
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : saveCropPriceDefault.isSuccess
                          ? "Saved ✓"
                          : "Save as default"}
                    </Button>
                  )}
                </div>
                {saveCropPriceDefault.isError && (
                  <p className="text-xs text-red-600">Failed to save — please try again.</p>
                )}
                <p className="text-xs text-muted-foreground">Current market price</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Application rate (mm)</Label>
                <div className="flex gap-1.5 items-center">
                  <Input
                    type="number" step="1" min="0"
                    value={defaults.irrigateMm}
                    onChange={e => { saveAppRateDefault.reset(); updateDefault("irrigateMm", e.target.value); }}
                    className="h-8 text-sm"
                  />
                  {appRateDiffersFromDb && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2 text-xs whitespace-nowrap shrink-0"
                      onClick={() => saveAppRateDefault.mutate(defaults.irrigateMm)}
                      disabled={saveAppRateDefault.isPending}
                      title="Save this value as the farm default (persists across devices)"
                    >
                      {saveAppRateDefault.isPending
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : saveAppRateDefault.isSuccess
                          ? "Saved ✓"
                          : "Save as default"}
                    </Button>
                  )}
                </div>
                {saveAppRateDefault.isError && (
                  <p className="text-xs text-red-600">Failed to save — please try again.</p>
                )}
                <p className="text-xs text-muted-foreground">mm per irrigation run</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Label className="text-xs">Expected rain (7d, mm)</Label>
                  {rainfallFromForecast && data?.forecastRainfall7dMm != null && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                      <CloudRain className="w-2.5 h-2.5" />
                      Forecast
                    </span>
                  )}
                </div>
                <Input
                  type="number" step="1" min="0"
                  value={defaults.expectedRainfall7dMm}
                  onChange={e => {
                    setForecastFlag(false);
                    updateDefault("expectedRainfall7dMm", e.target.value);
                  }}
                  className="h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {rainfallFromForecast && data?.forecastRainfall7dMm != null
                    ? "Pre-filled from Open-Meteo forecast"
                    : "Forecast / estimate"}
                </p>
              </div>
            </div>
          </div>

          {/* ── 7-day rainfall forecast chart ── */}
          {data?.forecastDailyMm && data.forecastDailyMm.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-500" />
                7-Day Rainfall Forecast
                <span className="text-xs text-muted-foreground font-normal">(Open-Meteo)</span>
              </p>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart
                  data={data.forecastDailyMm.map(d => ({
                    day: new Date(d.date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short" }),
                    mm: d.mm,
                  }))}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} unit=" mm" width={42} />
                  <Tooltip
                    contentStyle={{ fontSize: 11 }}
                    formatter={(val: number) => [`${val.toFixed(1)} mm`, "Rainfall"]}
                  />
                  <Bar dataKey="mm" radius={[3, 3, 0, 0]} maxBarSize={40}>
                    {data.forecastDailyMm.map((d, i) => (
                      <Cell
                        key={i}
                        fill={d.mm >= 5 ? "#3b82f6" : d.mm >= 1 ? "#93c5fd" : "#e5e7eb"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground">
                Bars shaded darker blue for ≥ 5 mm days. Total: <strong>{data.forecastRainfall7dMm ?? 0} mm</strong> over 7 days.
              </p>
              {/* ── SMD vs forecast verdict ── */}
              {(() => {
                if (!data.forecastDailyMm) return null;
                const vr = computeForecastVerdict({
                  currentSmdMm: todaySmd,
                  forecastDailyMm: data.forecastDailyMm,
                  dailyEtcMm: todayEtC,
                  fieldCapacityMm: fieldCapacity,
                });
                if (!vr) return null;
                const { projectedSmd, forecastTotal, verdict } = vr;
                const style =
                  verdict === "sufficient"
                    ? { bg: "bg-green-50 border-green-200", text: "text-green-800", dot: "bg-green-500" }
                    : verdict === "partial"
                    ? { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-800", dot: "bg-yellow-500" }
                    : { bg: "bg-red-50 border-red-200", text: "text-red-800", dot: "bg-red-500" };
                return (
                  <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${style.bg} ${style.text}`}>
                    <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
                    {verdict === "sufficient" ? (
                      <>
                        Forecast <strong>{forecastTotal.toFixed(1)} mm</strong> closes the{" "}
                        <strong>{todaySmd.toFixed(1)} mm</strong> deficit — rain likely sufficient,
                        consider holding off irrigation.
                      </>
                    ) : (
                      <>
                        Forecast <strong>{forecastTotal.toFixed(1)} mm</strong> vs{" "}
                        <strong>{todaySmd.toFixed(1)} mm</strong> deficit — projected SMD{" "}
                        <strong>{projectedSmd.toFixed(1)} mm</strong> after 7-day ET
                        {verdict === "insufficient" ? " — consider irrigating" : ""}.
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          ) : data && data.forecastDailyMm === null && (
            <div className="rounded-lg border border-muted bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2">
              <CloudRain className="w-3.5 h-3.5 shrink-0" />
              No rainfall forecast available — set a farm location to enable the 7-day forecast chart.
            </div>
          )}

          {/* ── Three-scenario comparison ── */}
          {cropProfile && scenarios ? (
            <div className="space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Decision Scenarios — {field?.name}
                {data?.assignment && (
                  <span className="text-xs text-muted-foreground font-normal">
                    ({data.assignment.cropName}, {areaHa.toFixed(2)} ha)
                  </span>
                )}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ScenarioCard
                  result={scenarios.irrigateNow}
                  accent="border bg-green-50/50"
                  icon={<TrendingUp className="w-4 h-4 text-green-600" />}
                  onLog={() => setLogPrefill({
                    fieldId: selectedFieldId,
                    fieldName: field?.name ?? "",
                    cropName: data?.assignment?.cropName ?? "",
                    applicationDepthMm: scenarios.irrigateNow.irrigationMm,
                    scenarioLabel: scenarios.irrigateNow.label,
                  })}
                />
                <ScenarioCard
                  result={scenarios.wait7}
                  accent="border bg-yellow-50/50"
                  icon={<Minus className="w-4 h-4 text-yellow-600" />}
                  onLog={() => setLogPrefill({
                    fieldId: selectedFieldId,
                    fieldName: field?.name ?? "",
                    cropName: data?.assignment?.cropName ?? "",
                    applicationDepthMm: scenarios.wait7.irrigationMm,
                    scenarioLabel: scenarios.wait7.label,
                  })}
                />
                <ScenarioCard
                  result={scenarios.skip}
                  accent="border bg-red-50/50"
                  icon={<TrendingDown className="w-4 h-4 text-red-600" />}
                />
              </div>
            </div>
          ) : selectedFieldId && !cropProfile && data?.assignment && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Crop <strong>{data.assignment.cropName}</strong> is not in the built-in irrigation
                profile database — yield loss estimates are unavailable.
                The SMD chart above is still valid.
              </span>
            </div>
          )}

          {/* ── No crop assigned ── */}
          {selectedFieldId && !data?.assignment && !isLoading && (
            <div className="rounded-lg border border-muted bg-muted/20 p-4 text-sm text-muted-foreground italic text-center">
              No crop assignment found for this field in {year}. Assign a crop in
              Field &amp; Crop Management to enable yield loss scenarios.
            </div>
          )}

          {/* ── Disclaimer ── */}
          <div className="rounded-lg bg-muted/40 border p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Methodology note</p>
            <p>
              ET₀ is calculated via Hargreaves-Samani (1985) when temperature data are available,
              otherwise UK 52°N monthly climate normals (ADAS / Met Office) are used.
              Crop coefficients (Kc) and yield response factors (Ky) follow FAO-56 / AHDB
              Irrigation Management Guide values. Yield loss estimates use the linear FAO-56
              model and should be treated as indicative — actual losses depend on growth stage,
              variety, and soil variability. This tool does not replace agronomic or
              water management professional advice.
            </p>
          </div>
        </>
      )}

      {/* ── Log Application dialog (triggered from scenario cards) ── */}
      {logPrefill && (
        <LogApplicationDialog
          farmId={farmId}
          prefill={logPrefill}
          onClose={() => setLogPrefill(null)}
        />
      )}
    </div>
  );
}
