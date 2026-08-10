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
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  Loader2, Sprout, Gauge, CloudRain, TrendingDown, TrendingUp,
  Minus, Info, Thermometer, BarChart3, AlertCircle,
} from "lucide-react";
import { apiUrl as api } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  year: number;
}

// ─── Local-storage defaults ───────────────────────────────────────────────────

const LS_KEY = (farmId: number) => `irrigation-advisor-defaults-${farmId}`;

interface IrrigDefaults {
  costPerMmHa: string;
  cropPricePerTonne: string;
  expectedRainfall7dMm: string;
  irrigateMm: string;
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

function ScenarioCard({ result, accent, icon }: { result: ScenarioResult; accent: string; icon: React.ReactNode }) {
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
    </div>
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

  // ── Platform config (provides server-side fallback defaults) ───────────────
  const { data: platformConfig } = useQuery<Record<string, string>>({
    queryKey: ["platform-config"],
    queryFn: () =>
      fetch(api("platform-config")).then(r => r.json()).then((d: { config: Record<string, string> }) => d.config),
    staleTime: 5 * 60 * 1000,
  });

  // ── Cost defaults — seeded from localStorage, fallback to platform config ──
  const [defaults, setDefaultsState] = useState<IrrigDefaults>(() => loadDefaults(farmId));
  // Seed from platform config if this farm has no localStorage overrides
  const seededRef = useRef(false);
  useEffect(() => {
    if (!platformConfig || seededRef.current) return;
    seededRef.current = true;
    if (localStorage.getItem(LS_KEY(farmId))) return; // already have farm overrides
    const serverCost = platformConfig["irrigation.costPerMmHa"];
    if (serverCost) {
      setDefaultsState(prev => ({ ...prev, costPerMmHa: serverCost }));
    }
  }, [platformConfig, farmId]);

  function updateDefault(key: keyof IrrigDefaults, value: string) {
    const next = { ...defaults, [key]: value };
    setDefaultsState(next);
    saveDefaults(farmId, next);
  }

  // ── Manual data entry mode (when no weather station) ──────────────────────
  const [useManual, setUseManual] = useState(false);
  const [manualRows, setManualRows] = useState<ManualDay[]>(() => makeManualDays());

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery<AdvisorPayload>({
    queryKey: ["irrigation-advisor", farmId, selectedFieldId, year],
    queryFn: () => {
      const params = new URLSearchParams({ year });
      if (selectedFieldId) params.set("fieldId", selectedFieldId);
      return fetch(api(`farms/${farmId}/irrigation-advisor?${params}`), { credentials: "include" })
        .then(r => { if (!r.ok) throw new Error("Failed"); return r.json(); });
    },
  });

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

  // ── Chart data ─────────────────────────────────────────────────────────────
  const chartData = useMemo(() => smdSeries.slice(-30).map(d => ({
    date: d.date.slice(5), // MM-DD
    smd: parseFloat(d.smd.toFixed(1)),
    rain: parseFloat(d.rainfall.toFixed(1)),
    etC: parseFloat(d.etC.toFixed(2)),
  })), [smdSeries]);

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
            {platformConfig?.["irrigation.abstractionSource"] && (
              <div>
                <p className="text-xs text-muted-foreground">Abstraction Source</p>
                <p className="font-medium">{platformConfig["irrigation.abstractionSource"]}</p>
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

          {/* ── 30-day SMD chart ── */}
          {chartData.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                30-day Soil Moisture Deficit
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10 }} unit=" mm" />
                  <Tooltip
                    contentStyle={{ fontSize: 11 }}
                    formatter={(val, name) => [
                      `${Number(val).toFixed(1)} mm`,
                      name === "smd" ? "SMD" : name === "rain" ? "Rainfall" : "ETc",
                    ]}
                  />
                  {/* Critical threshold line */}
                  <ReferenceLine
                    y={criticalThreshold}
                    stroke="#f97316"
                    strokeDasharray="4 2"
                    label={{ value: `Critical ${criticalThreshold}mm`, position: "insideTopRight", fontSize: 9, fill: "#f97316" }}
                  />
                  <Area
                    type="monotone" dataKey="smd" stroke="#3b82f6" fill="#93c5fd"
                    fillOpacity={0.3} name="smd" strokeWidth={1.5}
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
                <Input
                  type="number" step="0.1" min="0"
                  value={defaults.costPerMmHa}
                  onChange={e => updateDefault("costPerMmHa", e.target.value)}
                  className="h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground">Pump + abstraction cost</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Crop price (£/t)</Label>
                <Input
                  type="number" step="1" min="0"
                  value={defaults.cropPricePerTonne}
                  onChange={e => updateDefault("cropPricePerTonne", e.target.value)}
                  className="h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground">Current market price</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Application rate (mm)</Label>
                <Input
                  type="number" step="1" min="0"
                  value={defaults.irrigateMm}
                  onChange={e => updateDefault("irrigateMm", e.target.value)}
                  className="h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground">mm per irrigation run</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Expected rain (7d, mm)</Label>
                <Input
                  type="number" step="1" min="0"
                  value={defaults.expectedRainfall7dMm}
                  onChange={e => updateDefault("expectedRainfall7dMm", e.target.value)}
                  className="h-8 text-sm"
                />
                <p className="text-xs text-muted-foreground">Forecast / estimate</p>
              </div>
            </div>
          </div>

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
                />
                <ScenarioCard
                  result={scenarios.wait7}
                  accent="border bg-yellow-50/50"
                  icon={<Minus className="w-4 h-4 text-yellow-600" />}
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
    </div>
  );
}
