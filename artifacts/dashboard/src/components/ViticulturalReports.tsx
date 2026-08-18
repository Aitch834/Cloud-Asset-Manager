import { useState, useMemo, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { usePersistedFilter, usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { YearCompareSelector, COMPARE_COLORS } from "@/components/analytics/YearCompareSelector";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, TrendingDown, Printer, ChevronDown, ChevronUp, Grape, AlertTriangle, Search,
} from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

// ─── Shared types ─────────────────────────────────────────────────────────────
type Block = {
  id: number; blockName: string; variety: string; areaHa: string;
  numberOfVines: number; isActive: boolean | null;
};
type HarvestRec = {
  id: number; harvestDate: string; vintageYear: number | string;
  blockId: number | null; yieldKg: string | null; yieldTonnesPerHa: string | null;
  brix: string | null; ph: string | null; titratableAcidityGl: string | null;
  potentialAlcohol: string | null; grapeCondition: string | null;
  botrytisPresent: boolean | null; botrytisPercentage: string | null;
  harvestMethod: string | null; operatorName: string | null; notes: string | null;
  destinationWinery: string | null; destinationWineryType: string | null;
};
type ScoutRec = {
  id: number; scoutDate: string; blockId: number | null;
  downyMildewPressure: string | number; powderyMildewPressure: string | number;
  botrytisPressure: string | number; phomopsisPressure: string | number;
  leafhopperPressure: string | number; spiderMitePressure: string | number;
  vineWeevilSighted: boolean | null; eutypaDiebackSighted: boolean | null;
  xylellaFastidiosa: boolean | null; phytophthoraViticola: boolean | null;
  scoutedBy: string | null; actionTaken: string | null;
};
type OpRec = {
  id: number; operationDate: string; blockId: number | null;
  operationType: string | null; pruningWeightKgPerVine: string | null;
  hoursWorked: string | null; numberOfVinesPruned: number | null;
  budCountPerVine: string | null; operatorName: string | null;
  pruningSystem: string | null;
};
type SprayRec = {
  id: number; applicationDate: string; blockId: number | null;
  productName: string | null; areaTreatedHa: string | null;
  ratePerHectare: string | null; totalQuantityApplied: string | null;
};

// ─── Shared helpers ───────────────────────────────────────────────────────────
import { apiUrl as api } from "@/lib/api";
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
const fmtN = (v: unknown, dp = 1) =>
  v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp);
const n = (v: unknown) => (v == null || v === "" ? 0 : parseFloat(String(v)) || 0);

function useVitData(farmId: number) {
  const q = <T,>(key: string, endpoint: string) =>
    useQuery<T[]>({
      queryKey: [key, farmId],
      queryFn: () =>
        fetch(api(`farms/${farmId}/${endpoint}`), { credentials: "include" })
          .then(r => r.json())
          .then(j => (Array.isArray(j) ? j : j.records ?? [])),
      enabled: !!farmId,
      staleTime: 60_000,
    });

  const blocks = q<Block>("vineyard-blocks", "vineyard-blocks");
  const harvests = q<HarvestRec>("vineyard-harvest", "vineyard-harvest");
  const scouts = q<ScoutRec>("vineyard-scouting", "vineyard-scouting");
  const ops = q<OpRec>("vineyard-operations", "vineyard-operations");
  const sprays = q<SprayRec>("vineyard-spray-diary", "vineyard-spray-diary");

  const loading =
    blocks.isLoading || harvests.isLoading || scouts.isLoading ||
    ops.isLoading || sprays.isLoading;

  return {
    blocks: blocks.data ?? [],
    harvests: harvests.data ?? [],
    scouts: scouts.data ?? [],
    ops: ops.data ?? [],
    sprays: sprays.data ?? [],
    loading,
  };
}

const BLOCK_COLORS = [
  "#7c3aed", "#2563eb", "#16a34a", "#dc2626", "#d97706",
  "#0891b2", "#db2777", "#65a30d", "#9333ea", "#0f766e",
];

const DISEASE_SERIES = [
  { key: "downyMildewPressure", label: "Downy Mildew", color: "#7c3aed" },
  { key: "powderyMildewPressure", label: "Powdery Mildew", color: "#8b5cf6" },
  { key: "botrytisPressure", label: "Botrytis", color: "#ef4444" },
  { key: "phomopsisPressure", label: "Phomopsis", color: "#f59e0b" },
  { key: "leafhopperPressure", label: "Leafhopper", color: "#06b6d4" },
  { key: "spiderMitePressure", label: "Spider Mite", color: "#ec4899" },
];
const PRESSURE_LABEL: Record<number, string> = { 0: "None", 1: "Low", 2: "Medium", 3: "High" };
const PRESSURE_COLOR: Record<number, string> = {
  0: "text-gray-400", 1: "text-green-600", 2: "text-amber-600", 3: "text-red-600",
};

type BlockInfo = { id: number; name: string; variety: string };
function Collapsible({
  title, open, setOpen, children,
}: {
  title: string; open: boolean; setOpen: (v: boolean) => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <div className={`overflow-x-auto border-t border-border${open ? "" : " hidden print:block"}`}>{children}</div>
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Analytics chart-card wrapper ────────────────────────────────────────────
// Applies the analytics-chart-cap class (print-height limit) automatically so
// any future chart added here cannot silently miss it.
function AnalyticsChartCard({
  title,
  subtitle,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="analytics-chart-cap rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="text-sm font-semibold">{title}</h3>
        {subtitle && <p className="text-xs text-foreground/40">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── Analytics Tab ────────────────────────────────────────────────────────────
export function ViticulturalAnalyticsTab({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const { blocks, harvests, scouts, ops, loading } = useVitData(farmId);

  // ── Available years (union of harvest vintages + scout years + op years) ──
  const availableYears = useMemo(() => {
    const s = new Set<number>();
    harvests.forEach(h => { const y = Number(h.vintageYear); if (y > 2000) s.add(y); });
    scouts.forEach(sc => { const y = new Date(sc.scoutDate).getFullYear(); if (y > 2000) s.add(y); });
    ops.forEach(o => { const y = new Date(o.operationDate).getFullYear(); if (y > 2000) s.add(y); });
    if (!s.has(currentYear)) s.add(currentYear);
    return [...s].sort((a, b) => b - a);
  }, [harvests, scouts, ops, currentYear]);

  const [selectedYear, setSelectedYear] = usePersistedNumberFilter({
    page: "viticulture-analytics",
    filter: "year",
    farmId,
    defaultValue: currentYear,
    isValid: (y) => y > 2000 && y <= currentYear + 1,
  });
  const [compareYear, setCompareYear] = useState<number | null>(null);
  useEffect(() => { setCompareYear(prev => (prev === selectedYear ? null : prev)); }, [selectedYear]);
  useEffect(() => { ensureAnalyticsPrintStyle(); }, []);

  // ── Vintage yield + Brix trend (filtered to selected/compare years) ───────
  const allVintageMap = useMemo(() => {
    const map: Record<string, {
      totalKg: number; totalHa: number; brixSum: number; brixCount: number;
      phSum: number; phCount: number; potAlcSum: number; potAlcCount: number;
      taSum: number; taCount: number;
      records: number;
    }> = {};
    harvests.forEach(h => {
      const yr = String(h.vintageYear);
      if (!yr || yr === "null") return;
      if (!map[yr]) map[yr] = { totalKg: 0, totalHa: 0, brixSum: 0, brixCount: 0, phSum: 0, phCount: 0, potAlcSum: 0, potAlcCount: 0, taSum: 0, taCount: 0, records: 0 };
      const m = map[yr];
      m.totalKg += n(h.yieldKg);
      const tha = n(h.yieldTonnesPerHa);
      if (tha > 0 && n(h.yieldKg) > 0) m.totalHa += n(h.yieldKg) / 1000 / tha;
      if (h.brix != null && h.brix !== "") { m.brixSum += n(h.brix); m.brixCount++; }
      if (h.ph != null && h.ph !== "") { m.phSum += n(h.ph); m.phCount++; }
      if (h.potentialAlcohol != null && h.potentialAlcohol !== "") { m.potAlcSum += n(h.potentialAlcohol); m.potAlcCount++; }
      if (h.titratableAcidityGl != null && h.titratableAcidityGl !== "") { m.taSum += n(h.titratableAcidityGl); m.taCount++; }
      m.records++;
    });
    return map;
  }, [harvests]);

  const vintageData = useMemo(() => {
    const activeYears = compareYear
      ? [String(Math.min(selectedYear, compareYear)), String(Math.max(selectedYear, compareYear))]
      : [String(selectedYear)];
    return activeYears
      .filter(yr => allVintageMap[yr])
      .map(yr => {
        const v = allVintageMap[yr];
        return {
          vintage: yr,
          "Yield (t)": v.totalKg > 0 ? parseFloat((v.totalKg / 1000).toFixed(2)) : 0,
          "Yield (t/ha)": v.totalHa > 0 ? parseFloat((v.totalKg / 1000 / v.totalHa).toFixed(2)) : 0,
          "Avg Brix °": v.brixCount > 0 ? parseFloat((v.brixSum / v.brixCount).toFixed(1)) : null,
          "Avg pH": v.phCount > 0 ? parseFloat((v.phSum / v.phCount).toFixed(2)) : null,
          "Potential Alcohol %": v.potAlcCount > 0 ? parseFloat((v.potAlcSum / v.potAlcCount).toFixed(1)) : null,
          "Avg TA (g/L)": v.taCount > 0 ? parseFloat((v.taSum / v.taCount).toFixed(2)) : null,
          records: v.records,
        };
      });
  }, [allVintageMap, selectedYear, compareYear]);

  // ── Disease pressure season ────────────────────────────────────────────────
  const diseaseData = useMemo(() => {
    const yearScouts = scouts
      .filter(s => new Date(s.scoutDate).getFullYear() === selectedYear)
      .sort((a, b) => a.scoutDate.localeCompare(b.scoutDate));
    return yearScouts.map(s => ({
      date: fmtDate(s.scoutDate).slice(0, 5),
      "Downy Mildew": n(s.downyMildewPressure),
      "Powdery Mildew": n(s.powderyMildewPressure),
      "Botrytis": n(s.botrytisPressure),
      "Phomopsis": n(s.phomopsisPressure),
      "Leafhopper": n(s.leafhopperPressure),
      "Spider Mite": n(s.spiderMitePressure),
    }));
  }, [scouts, selectedYear]);

  const diseaseDataCompare = useMemo(() => {
    if (!compareYear) return [];
    return scouts
      .filter(s => new Date(s.scoutDate).getFullYear() === compareYear)
      .sort((a, b) => a.scoutDate.localeCompare(b.scoutDate))
      .map(s => ({
        date: fmtDate(s.scoutDate).slice(0, 5),
        "Downy Mildew": n(s.downyMildewPressure),
        "Powdery Mildew": n(s.powderyMildewPressure),
        "Botrytis": n(s.botrytisPressure),
        "Phomopsis": n(s.phomopsisPressure),
        "Leafhopper": n(s.leafhopperPressure),
        "Spider Mite": n(s.spiderMitePressure),
      }));
  }, [scouts, compareYear]);

  // ── Operations hours by type (filtered to selected year) ─────────────────
  const opsHoursData = useMemo(() => {
    const primary: Record<string, number> = {};
    ops.filter(o => new Date(o.operationDate).getFullYear() === selectedYear).forEach(o => {
      const t = o.operationType ?? "Unknown";
      primary[t] = (primary[t] ?? 0) + n(o.hoursWorked);
    });
    const compare: Record<string, number> = {};
    if (compareYear) {
      ops.filter(o => new Date(o.operationDate).getFullYear() === compareYear).forEach(o => {
        const t = o.operationType ?? "Unknown";
        compare[t] = (compare[t] ?? 0) + n(o.hoursWorked);
      });
    }
    const types = new Set([...Object.keys(primary), ...Object.keys(compare)]);
    return [...types]
      .map(type => ({ type, "Hours": parseFloat((primary[type] ?? 0).toFixed(1)), "Hours (cmp)": parseFloat((compare[type] ?? 0).toFixed(1)) }))
      .filter(d => d["Hours"] > 0 || d["Hours (cmp)"] > 0)
      .sort((a, b) => b["Hours"] - a["Hours"])
      .slice(0, 8);
  }, [ops, selectedYear, compareYear]);

  // ── Block performance table (vintages filtered to selected/compare years) ──
  const blockPerfData = useMemo(() => {
    const allVintages = [...new Set(harvests.map(h => String(h.vintageYear)).filter(Boolean))].sort();
    const vintages = compareYear
      ? allVintages.filter(yr => yr === String(selectedYear) || yr === String(compareYear))
      : allVintages.filter(yr => yr === String(selectedYear));
    const activeBlocks = blocks.filter(b => b.isActive !== false);
    const rows = activeBlocks.map(bl => {
      const row: Record<string, unknown> = {
        block: bl.blockName, variety: bl.variety, areaHa: bl.areaHa,
      };
      vintages.forEach(yr => {
        const recs = harvests.filter(h => h.blockId === bl.id && String(h.vintageYear) === yr);
        if (recs.length === 0) { row[yr] = null; return; }
        const totKg = recs.reduce((s, r) => s + n(r.yieldKg), 0);
        const areaHa = n(bl.areaHa);
        row[yr] = areaHa > 0 ? parseFloat((totKg / 1000 / areaHa).toFixed(2)) : null;
      });
      return row;
    });
    return { rows, vintages };
  }, [blocks, harvests, selectedYear, compareYear]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">
        Loading analytics…
      </div>
    );
  }

  const noData = harvests.length === 0 && scouts.length === 0;
  if (noData) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
        No harvest or scouting records yet. Record your first vintage and disease scouting rounds to see analytics.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Viticulture Analytics</h2>
          <p className="text-sm text-foreground/50">
            Vintage yield &amp; chemistry · Disease pressure · Block performance · Operations
          </p>
        </div>
        <YearCompareSelector
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
          compareYear={compareYear}
          onCompareYearChange={setCompareYear}
        />
      </div>

      {/* ── Vintage yield & Brix ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Yield */}
        <AnalyticsChartCard
          title={compareYear ? `Vintage Yield — ${selectedYear} vs ${compareYear}` : `Vintage Yield — ${selectedYear}`}
          subtitle="Total tonnes picked per vintage"
        >
          <div className="p-4">
            {vintageData.length === 0 ? (
              <p className="text-sm text-foreground/40 text-center py-6">No harvest records for {selectedYear}</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={vintageData} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="vintage" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="t" tick={{ fontSize: 11 }} width={46} label={{ value: "t", position: "insideTop", offset: -4, fontSize: 10 }} />
                  <YAxis yAxisId="tha" orientation="right" tick={{ fontSize: 11 }} width={46} label={{ value: "t/ha", position: "insideTop", offset: -4, fontSize: 10 }} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="t" dataKey="Yield (t)" fill={COMPARE_COLORS[0]} radius={[3, 3, 0, 0]} maxBarSize={60} />
                  <Line yAxisId="tha" type="monotone" dataKey="Yield (t/ha)" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </AnalyticsChartCard>

        {/* Brix & chemistry */}
        <AnalyticsChartCard
          title={compareYear ? `Must Chemistry — ${selectedYear} vs ${compareYear}` : `Must Chemistry — ${selectedYear}`}
          subtitle="Average Brix, pH, potential alcohol, and TA per vintage"
        >
          <div className="p-4">
            {vintageData.filter(d => d["Avg Brix °"] != null || d["Avg pH"] != null || d["Potential Alcohol %"] != null || d["Avg TA (g/L)"] != null).length === 0 ? (
              <p className="text-sm text-foreground/40 text-center py-6">No chemistry data recorded for {selectedYear}</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={vintageData} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="vintage" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="brix" tick={{ fontSize: 11 }} width={40} domain={["auto", "auto"]} />
                  <YAxis yAxisId="alc" orientation="right" tick={{ fontSize: 11 }} width={40} domain={["auto", "auto"]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                  <Line yAxisId="brix" type="monotone" dataKey="Avg Brix °" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line yAxisId="brix" type="monotone" dataKey="Avg pH" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" connectNulls />
                  <Line yAxisId="alc" type="monotone" dataKey="Potential Alcohol %" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line yAxisId="alc" type="monotone" dataKey="Avg TA (g/L)" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="3 2" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </AnalyticsChartCard>
      </div>

      {/* ── Disease pressure ─── */}
      <AnalyticsChartCard
        title={`Disease & Pest Pressure — ${selectedYear}`}
        subtitle="0 = None · 1 = Low · 2 = Medium · 3 = High"
      >
        <div className="p-4">
          {diseaseData.length === 0 ? (
            <p className="text-sm text-foreground/40 text-center py-6">
              No scouting records for {selectedYear}. Add records in the Disease Scouting tab.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={diseaseData} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 3]} ticks={[0, 1, 2, 3]}
                  tickFormatter={v => PRESSURE_LABEL[v] ?? String(v)} width={58} />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                {DISEASE_SERIES.map(d => (
                  <Line key={d.key} type="monotone" dataKey={d.label} stroke={d.color} strokeWidth={2} dot={{ r: 3 }} connectNulls />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        {compareYear && (
          <div className="border-t border-border">
            <div className="px-4 py-2 bg-muted/20">
              <p className="text-xs font-medium text-foreground/60">Compare: {compareYear}</p>
            </div>
            <div className="p-4">
              {diseaseDataCompare.length === 0 ? (
                <p className="text-sm text-foreground/40 text-center py-4">
                  No scouting records for {compareYear}.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={diseaseDataCompare} margin={{ top: 4, right: 8, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 3]} ticks={[0, 1, 2, 3]}
                      tickFormatter={v => PRESSURE_LABEL[v] ?? String(v)} width={58} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    {DISEASE_SERIES.map(d => (
                      <Line key={d.key} type="monotone" dataKey={d.label} stroke={d.color} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} connectNulls />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </AnalyticsChartCard>

      {/* ── Block performance table ─── */}
      {blockPerfData.rows.length > 0 && blockPerfData.vintages.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold">
              Block Performance — Yield (t/ha){compareYear ? ` · ${selectedYear} vs ${compareYear}` : ` · ${selectedYear}`}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-foreground/60 text-xs">
                  <th className="px-4 py-2 text-left">Block</th>
                  <th className="px-4 py-2 text-left">Variety</th>
                  <th className="px-4 py-2 text-right">Area (ha)</th>
                  {blockPerfData.vintages.map(yr => (
                    <th key={yr} className="px-4 py-2 text-right">{yr}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blockPerfData.rows.map((row, i) => (
                  <tr key={i} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="px-4 py-2 font-medium">{String(row.block)}</td>
                    <td className="px-4 py-2 text-foreground/60">{String(row.variety ?? "—")}</td>
                    <td className="px-4 py-2 text-right">{fmtN(row.areaHa, 2)}</td>
                    {blockPerfData.vintages.map(yr => (
                      <td key={yr} className="px-4 py-2 text-right font-mono">
                        {row[yr] != null ? String(row[yr]) : <span className="text-foreground/30">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Operations hours by type ─── */}
      {opsHoursData.length > 0 && (
        <AnalyticsChartCard
          title={compareYear ? `Canopy Operations — Hours by Type · ${selectedYear} vs ${compareYear}` : `Canopy Operations — Hours by Type · ${selectedYear}`}
        >
          <div className="p-4">
            <ResponsiveContainer width="100%" height={Math.max(180, opsHoursData.length * 28)}>
              <BarChart
                data={opsHoursData}
                layout="vertical"
                margin={{ top: 4, right: 30, bottom: 4, left: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} unit=" h" />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 10 }} width={140} />
                <Tooltip content={<ChartTooltip />} />
                {compareYear && <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />}
                <Bar dataKey="Hours" name={compareYear ? String(selectedYear) : "Hours"} fill={COMPARE_COLORS[0]} radius={[0, 3, 3, 0]} maxBarSize={18} />
                {compareYear && <Bar dataKey="Hours (cmp)" name={String(compareYear)} fill={COMPARE_COLORS[1]} radius={[0, 3, 3, 0]} maxBarSize={18} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsChartCard>
      )}
    </div>
  );
}

const ANALYTICS_PRINT_ID = "viticulture-analytics-print";
const SEASON_PRINT_ID = "vintage-season-report-print";
function ensureSeasonPrintStyle() {
  if (document.getElementById(SEASON_PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = SEASON_PRINT_ID + "-css";
  s.textContent = `@page{size:A4 landscape;margin:1cm}@media print{body>*{visibility:hidden!important}#${SEASON_PRINT_ID}{visibility:visible!important;display:block!important;position:fixed!important;inset:0!important;overflow:visible!important;background:#fff!important;z-index:99999!important;padding:16px!important}#${SEASON_PRINT_ID} *{visibility:visible!important}#${SEASON_PRINT_ID} .hidden{display:block!important}.no-print{display:none!important;visibility:hidden!important}table{page-break-inside:auto}tr{page-break-inside:avoid}#${SEASON_PRINT_ID} .overflow-x-auto{overflow:visible!important}.print-all-vintages-tbl{width:100%!important}.print-all-vintages-tbl table{width:100%!important;font-size:8.5px!important;table-layout:fixed!important}.print-all-vintages-tbl th,.print-all-vintages-tbl td{padding:2px 4px!important;word-break:break-word}.print-chem-xtab{width:100%!important}.print-chem-xtab table{width:100%!important;font-size:8.5px!important;table-layout:auto!important}.print-chem-xtab th,.print-chem-xtab td{padding:2px 4px!important;word-break:break-word}.print-chart-card{page-break-inside:avoid;break-inside:avoid;break-before:avoid}.print-chart-card .recharts-responsive-container{width:100%!important;max-height:300px!important}.print-chart-card .recharts-wrapper{max-height:300px!important}.print-chart-card .recharts-wrapper svg{max-height:300px!important}.print-block-chart-cap .recharts-responsive-container{height:300px!important;max-height:300px!important}.print-block-chart-cap .recharts-wrapper{height:300px!important}.print-block-chart-cap .recharts-wrapper svg{height:300px!important}}`;
  document.head.appendChild(s);
}

export function VintageSeasonReportTab({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  // null = "All Vintages" mode — persisted as "all" sentinel string
  const [yearStr, setYearStr] = usePersistedNumberFilter({ page: "vintage-season-report", filter: "year", farmId, defaultValue: currentYear });
  const year: number | null = yearStr === -1 ? null : yearStr;
  const setYear = (v: number | null) => setYearStr(v == null ? -1 : v);
  const { blocks, harvests, scouts, ops, sprays, loading } = useVitData(farmId);
  const [, navigate] = useLocation();

  const { data: farmMeta } = useQuery<Record<string, unknown> | null>({
    queryKey: ["farm-meta", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}`, { credentials: "include" });
      if (!r.ok) return null;
      const d = await r.json();
      return (d.record ?? d) as Record<string, unknown>;
    },
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
  });

  const missingAddressFields = farmMeta != null
    ? [
        !farmMeta.name || String(farmMeta.name).trim() === "" ? "Farm name" : "",
        !farmMeta.address || String(farmMeta.address).trim() === "" ? "Farm address" : "",
        !farmMeta.sbiNumber || String(farmMeta.sbiNumber).trim() === ""
          ? "SBI Number (missing)"
          : !/^\d{9}$/.test(String(farmMeta.sbiNumber).trim())
            ? "SBI Number (invalid — must be exactly 9 digits)"
            : "",
      ].filter(Boolean)
    : [];

  const vintageYears = useMemo(() => {
    const yrs = [...new Set(harvests.map(h => Number(h.vintageYear)).filter(Boolean))].sort((a, b) => b - a);
    if (!yrs.includes(currentYear)) yrs.unshift(currentYear);
    return yrs;
  }, [harvests, currentYear]);

  const blockMap = useMemo(() => {
    const m: Record<number, Block> = {};
    blocks.forEach(b => { m[b.id] = b; });
    return m;
  }, [blocks]);

  const blockName = (id: unknown) => blockMap[id as number]?.blockName ?? fmt(id);

  // Harvest for selected vintage (null = all)
  const vintageHarvest = useMemo(
    () => year == null ? harvests : harvests.filter(h => Number(h.vintageYear) === year),
    [harvests, year],
  );

  // Season scouting (calendar year matching vintage; empty in all-vintages mode)
  const seasonScouts = useMemo(
    () => year == null ? [] : scouts.filter(s => new Date(s.scoutDate).getFullYear() === year)
      .sort((a, b) => a.scoutDate.localeCompare(b.scoutDate)),
    [scouts, year],
  );

  // Operations for vintage year (empty in all-vintages mode)
  const seasonOps = useMemo(
    () => year == null ? [] : ops.filter(o => new Date(o.operationDate).getFullYear() === year)
      .sort((a, b) => a.operationDate.localeCompare(b.operationDate)),
    [ops, year],
  );

  // Spray diary for vintage year (empty in all-vintages mode)
  const seasonSprays = useMemo(
    () => year == null ? [] : sprays.filter(s => new Date(s.applicationDate).getFullYear() === year),
    [sprays, year],
  );

  // All-vintages summary: one row per vintage year
  const allVintagesSummary = useMemo(() => {
    if (year != null) return [];
    const map: Record<string, {
      vintage: string; totalKg: number; totalAreaHa: number;
      brixSum: number; brixCount: number; phSum: number; phCount: number;
      taSum: number; taCount: number; potAlcSum: number; potAlcCount: number;
      records: number;
    }> = {};
    harvests.forEach(h => {
      const yr = String(h.vintageYear);
      if (!yr || yr === "null" || yr === "undefined") return;
      if (!map[yr]) map[yr] = { vintage: yr, totalKg: 0, totalAreaHa: 0, brixSum: 0, brixCount: 0, phSum: 0, phCount: 0, taSum: 0, taCount: 0, potAlcSum: 0, potAlcCount: 0, records: 0 };
      const m = map[yr];
      m.totalKg += n(h.yieldKg);
      // Reconstruct area from t/ha if block area not directly available
      const tha = n(h.yieldTonnesPerHa);
      if (tha > 0 && n(h.yieldKg) > 0) m.totalAreaHa += n(h.yieldKg) / 1000 / tha;
      if (h.brix != null && h.brix !== "") { m.brixSum += n(h.brix); m.brixCount++; }
      if (h.ph != null && h.ph !== "") { m.phSum += n(h.ph); m.phCount++; }
      if (h.titratableAcidityGl != null && h.titratableAcidityGl !== "") { m.taSum += n(h.titratableAcidityGl); m.taCount++; }
      if (h.potentialAlcohol != null && h.potentialAlcohol !== "") { m.potAlcSum += n(h.potentialAlcohol); m.potAlcCount++; }
      m.records++;
    });
    // Build block-set per vintage for accurate area (avoids double-counting blocks)
    const blockSetsPerVintage: Record<string, Set<number>> = {};
    harvests.forEach(h => {
      const yr = String(h.vintageYear);
      if (!yr || yr === "null" || yr === "undefined" || !map[yr]) return;
      if (h.blockId != null) {
        if (!blockSetsPerVintage[yr]) blockSetsPerVintage[yr] = new Set();
        blockSetsPerVintage[yr].add(h.blockId);
      }
    });
    Object.entries(blockSetsPerVintage).forEach(([yr, ids]) => {
      const area = [...ids].reduce((s, id) => s + n(blockMap[id]?.areaHa), 0);
      if (area > 0 && map[yr]) map[yr].totalAreaHa = area;
    });

    return Object.values(map).sort((a, b) => b.vintage.localeCompare(a.vintage));
  }, [year, harvests, blockMap]);

  // Block filter for per-block yield trend (all-vintages mode only)
  // Persisted as JSON array of block IDs in localStorage; empty string = "all blocks" (null)
  // Legacy format was a JSON array of block-name strings — migrated automatically on first load.
  const [_storedBlocks, _setStoredBlocks] = usePersistedFilter({
    page: "vintage-season-report",
    filter: "block-selection",
    farmId,
    defaultValue: "",
  });

  // One-time migration: if stored value is a legacy string array (block names), convert to IDs.
  useEffect(() => {
    if (!_storedBlocks || !blocks.length) return;
    try {
      const arr = JSON.parse(_storedBlocks) as unknown[];
      if (!Array.isArray(arr) || arr.length === 0) return;
      if (typeof arr[0] !== "string") return; // already numeric IDs — nothing to do
      // Map legacy block names to current block IDs; drop any that no longer exist
      const ids = (arr as string[])
        .map(name => blocks.find(b => b.blockName === name)?.id)
        .filter((id): id is number => id != null);
      _setStoredBlocks(ids.length > 0 ? JSON.stringify(ids) : "");
    } catch { /* unparseable — leave as-is */ }
  // _setStoredBlocks is a stable setter; omit to avoid spurious re-runs
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_storedBlocks, blocks]);

  const selectedBlockIds: Set<number> | null = useMemo(() => {
    if (!_storedBlocks) return null;
    try {
      const arr = JSON.parse(_storedBlocks) as unknown[];
      if (!Array.isArray(arr)) return null;
      // Legacy string arrays: return null (show all) while the migration effect runs
      if (arr.length > 0 && typeof arr[0] === "string") return null;
      // Validate all entries are numbers before constructing the Set
      if (!arr.every(x => typeof x === "number")) return null;
      // Empty array is a valid "none selected" state — keep it as an empty Set
      return new Set(arr as number[]);
    } catch {
      return null;
    }
  }, [_storedBlocks]);
  const _persistBlockIds = (v: Set<number> | null) => {
    _setStoredBlocks(v == null ? "" : JSON.stringify([...v]));
  };

  // Yield chart mode: "t" = total tonnes (default), "tha" = t/ha per block
  const [chartInTha, setChartInTha] = useState(false);

  // Block filter state for spray diary and scouting sections (null = all blocks shown)
  const [selectedSprayBlocks, setSelectedSprayBlocks] = useState<Set<number> | null>(null);
  const [selectedScoutBlocks, setSelectedScoutBlocks] = useState<Set<number> | null>(null);

  // Reset spray/scout block filters when the vintage year changes
  useEffect(() => {
    setSelectedSprayBlocks(null);
    setSelectedScoutBlocks(null);
  }, [year]);

  // Per-block yield trend across all vintages (all-vintages mode only)
  const blockYieldTrendData = useMemo(() => {
    if (year != null) return { chartData: [], blockLines: [] as { key: string; variety: string; color: string }[] };
    const allVintages = [...new Set(
      harvests.map(h => String(h.vintageYear)).filter(yr => yr && yr !== "null" && yr !== "undefined"),
    )].sort();
    const blocksWithData = blocks.filter(
      b => b.isActive !== false && harvests.some(h => h.blockId === b.id),
    );
    if (blocksWithData.length === 0 || allVintages.length === 0) {
      return { chartData: [], blockLines: [] as { key: string; variety: string; color: string }[] };
    }
    const chartData = allVintages.map(yr => {
      const row: Record<string, number | string | null> = { vintage: yr };
      blocksWithData.forEach(bl => {
        const recs = harvests.filter(h => h.blockId === bl.id && String(h.vintageYear) === yr);
        if (recs.length === 0) { row[bl.blockName] = null; return; }
        const totKg = recs.reduce((s, r) => s + n(r.yieldKg), 0);
        const areaHa = n(bl.areaHa);
        row[bl.blockName] = areaHa > 0 ? parseFloat((totKg / 1000 / areaHa).toFixed(2)) : null;
      });
      return row;
    });
    const blockLines = blocksWithData.map((bl, i) => ({
      key: bl.blockName,
      variety: bl.variety ?? "",
      color: BLOCK_COLORS[i % BLOCK_COLORS.length],
    }));
    return { chartData, blockLines };
  }, [year, harvests, blocks]);

  // BlockInfo[] for the trend chart filter strip — maps blockLines to block IDs
  const trendBlockInfos: BlockInfo[] = useMemo(() => {
    return blockYieldTrendData.blockLines
      .map(bl => {
        const block = blocks.find(b => b.blockName === bl.key);
        return block ? { id: block.id, name: bl.key, variety: bl.variety } : null;
      })
      .filter((bi): bi is BlockInfo => bi !== null);
  }, [blockYieldTrendData.blockLines, blocks]);

  // Derive visible block names from selected IDs (null = all visible)
  const visibleBlockNames: Set<string> | null = useMemo(() => {
    if (selectedBlockIds == null) return null;
    const nameSet = new Set<string>();
    trendBlockInfos.forEach(bi => { if (selectedBlockIds.has(bi.id)) nameSet.add(bi.name); });
    return nameSet;
  }, [selectedBlockIds, trendBlockInfos]);

  // Totals
  const totalYieldKg = useMemo(() => vintageHarvest.reduce((s, h) => s + n(h.yieldKg), 0), [vintageHarvest]);
  const totalAreaHa = useMemo(() => {
    const blockIds = new Set(vintageHarvest.map(h => h.blockId).filter((id): id is number => id != null));
    return [...blockIds].reduce((s, id) => s + n(blockMap[id]?.areaHa), 0);
  }, [vintageHarvest, blockMap]);
  const avgTha = totalAreaHa > 0 ? totalYieldKg / 1000 / totalAreaHa : 0;
  const brixVals = vintageHarvest.filter(h => h.brix != null && h.brix !== "").map(h => n(h.brix));
  const avgBrix = brixVals.length > 0 ? brixVals.reduce((a, b) => a + b, 0) / brixVals.length : null;
  const phVals = vintageHarvest.filter(h => h.ph != null && h.ph !== "").map(h => n(h.ph));
  const avgPH = phVals.length > 0 ? phVals.reduce((a, b) => a + b, 0) / phVals.length : null;
  const potAlcVals = vintageHarvest.filter(h => h.potentialAlcohol != null && h.potentialAlcohol !== "").map(h => n(h.potentialAlcohol));
  const avgPotAlc = potAlcVals.length > 0 ? potAlcVals.reduce((a, b) => a + b, 0) / potAlcVals.length : null;
  const taVals = vintageHarvest.filter(h => h.titratableAcidityGl != null && h.titratableAcidityGl !== "").map(h => n(h.titratableAcidityGl));
  const avgTA = taVals.length > 0 ? taVals.reduce((a, b) => a + b, 0) / taVals.length : null;
  const totalOpsHours = seasonOps.reduce((s, o) => s + n(o.hoursWorked), 0);
  const totalSprayArea = seasonSprays.reduce((s, sp) => s + n(sp.areaTreatedHa), 0);

  // All-vintages grand KPI values — hoisted so the print header and on-screen cards share them
  const grandKg = allVintagesSummary.reduce((s, r) => s + r.totalKg, 0);
  const grandArea = allVintagesSummary.reduce((s, r) => s + r.totalAreaHa, 0);
  const grandTha = grandArea > 0 ? grandKg / 1000 / grandArea : null;
  const grandBrixSum = allVintagesSummary.reduce((s, r) => s + r.brixSum, 0);
  const grandBrixCount = allVintagesSummary.reduce((s, r) => s + r.brixCount, 0);
  const grandPhSum = allVintagesSummary.reduce((s, r) => s + r.phSum, 0);
  const grandPhCount = allVintagesSummary.reduce((s, r) => s + r.phCount, 0);
  const grandTaSum = allVintagesSummary.reduce((s, r) => s + r.taSum, 0);
  const grandTaCount = allVintagesSummary.reduce((s, r) => s + r.taCount, 0);
  const grandPotAlcSum = allVintagesSummary.reduce((s, r) => s + r.potAlcSum, 0);
  const grandPotAlcCount = allVintagesSummary.reduce((s, r) => s + r.potAlcCount, 0);
  const grandBrix = grandBrixCount > 0 ? grandBrixSum / grandBrixCount : null;
  const grandPh = grandPhCount > 0 ? grandPhSum / grandPhCount : null;
  const grandTa = grandTaCount > 0 ? grandTaSum / grandTaCount : null;
  const grandPotAlc = grandPotAlcCount > 0 ? grandPotAlcSum / grandPotAlcCount : null;

  // Disease peak pressure per disease across the season
  const diseasePeak = useMemo(() => {
    const peak: Record<string, number> = {};
    DISEASE_SERIES.forEach(d => { peak[d.key] = 0; });
    seasonScouts.forEach(s => {
      DISEASE_SERIES.forEach(d => {
        const v = n((s as Record<string, unknown>)[d.key]);
        if (v > (peak[d.key] ?? 0)) peak[d.key] = v;
      });
    });
    return peak;
  }, [seasonScouts]);

  // Unique blocks appearing in spray/scout records for the selected year — used by filter strips
  const sprayBlockInfos: BlockInfo[] = useMemo(() => {
    const seen = new Map<number, BlockInfo>();
    seasonSprays.forEach(sp => {
      if (sp.blockId != null && !seen.has(sp.blockId)) {
        const bl = blockMap[sp.blockId];
        if (bl) seen.set(sp.blockId, { id: sp.blockId, name: bl.blockName, variety: bl.variety ?? "" });
      }
    });
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [seasonSprays, blockMap]);

  const scoutBlockInfos: BlockInfo[] = useMemo(() => {
    const seen = new Map<number, BlockInfo>();
    seasonScouts.forEach(sc => {
      if (sc.blockId != null && !seen.has(sc.blockId)) {
        const bl = blockMap[sc.blockId];
        if (bl) seen.set(sc.blockId, { id: sc.blockId, name: bl.blockName, variety: bl.variety ?? "" });
      }
    });
    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [seasonScouts, blockMap]);

  // Rows filtered by block selection
  const visibleSprays = useMemo(
    () => selectedSprayBlocks == null
      ? seasonSprays
      : seasonSprays.filter(sp => sp.blockId != null && selectedSprayBlocks.has(sp.blockId)),
    [seasonSprays, selectedSprayBlocks],
  );
  const seasonSprayByProduct = useMemo(() => {
    const m: Record<string, { applications: number; totalAreaHa: number; totalQty: number }> = {};
    visibleSprays.forEach(sp => {
      const p = sp.productName ?? "Unknown";
      if (!m[p]) m[p] = { applications: 0, totalAreaHa: 0, totalQty: 0 };
      m[p].applications++;
      m[p].totalAreaHa += n(sp.areaTreatedHa);
      m[p].totalQty += n(sp.totalQuantityApplied);
    });
    return Object.entries(m).sort(([, a], [, b]) => b.applications - a.applications);
  }, [visibleSprays]);
  const visibleScouts = useMemo(
    () => selectedScoutBlocks == null
      ? seasonScouts
      : seasonScouts.filter(sc => sc.blockId != null && selectedScoutBlocks.has(sc.blockId)),
    [seasonScouts, selectedScoutBlocks],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">
        Loading report…
      </div>
    );
  }

  const printButton = (
    <button
      onClick={() => { ensureSeasonPrintStyle(); window.print(); }}
      className="h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50"
    >
      <Printer className="w-3.5 h-3.5" />Print / Save PDF
    </button>
  );

  return (
    <div id={SEASON_PRINT_ID} className="space-y-5">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Vintage Season Report</h2>
          <p className="text-sm text-foreground/50">
            Full per-block harvest summary · Disease scouting log · Canopy operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
            value={year == null ? "all" : year}
            onChange={e => setYear(e.target.value === "all" ? null : Number(e.target.value))}
          >
            <option value="all">All Vintages</option>
            {vintageYears.map(y => <option key={y} value={y}>{y} Vintage</option>)}
          </select>
          {printButton}
        </div>
      </div>

      {/* Farm address warning (no-print) */}
      {missingAddressFields.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 no-print">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
          <span>
            <span className="font-medium">Farm Settings incomplete:</span>{" "}
            {missingAddressFields.join(", ")}{" "}
            {missingAddressFields.length === 1 ? "is" : "are"} not set — your printed report will have blank header fields.{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-amber-900 font-medium"
              onClick={() => navigate("/settings/farm")}
            >
              Add in Farm Settings → General
            </button>
          </span>
        </div>
      )}

      {/* Print header */}
      <div className="hidden print:block border-b-2 border-gray-800 pb-3 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Grape className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-bold">
            {year == null ? "All Vintages — Yield Summary" : `Vintage Season Report — ${year}`}
          </h1>
        </div>
        {!!farmMeta?.name && <p className="text-sm font-semibold mt-0.5">{String(farmMeta.name)}</p>}
        {!!farmMeta?.address && <p className="text-xs text-gray-500">{String(farmMeta.address)}</p>}
        <p className="text-xs text-gray-400 mt-1">Produced {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        {/* All-vintages compact KPI row — print only */}
        {year == null && allVintagesSummary.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-0.5 text-xs text-gray-700 border-t border-gray-300 pt-2">
            {grandKg > 0 && <span><span className="font-semibold">Total Yield:</span> {(grandKg / 1000).toFixed(2)} t</span>}
            {grandArea > 0 && <span><span className="font-semibold">Total Area:</span> {grandArea.toFixed(2)} ha</span>}
            {grandTha != null && <span><span className="font-semibold">Avg t/ha:</span> {grandTha.toFixed(2)}</span>}
            {grandBrix != null && <span><span className="font-semibold">Avg Brix:</span> {grandBrix.toFixed(1)}°</span>}
            {grandPh != null && <span><span className="font-semibold">Avg pH:</span> {grandPh.toFixed(2)}</span>}
            {grandTa != null && <span><span className="font-semibold">Avg TA:</span> {grandTa.toFixed(2)} g/L</span>}
            {grandPotAlc != null && <span><span className="font-semibold">Avg Pot. Alc:</span> {grandPotAlc.toFixed(1)}%</span>}
          </div>
        )}
      </div>

      {/* Season summary KPIs (single-vintage mode only) */}
      {year != null && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "Vintage Year", value: String(year) },
            { label: "Harvest Records", value: String(vintageHarvest.length) },
            { label: "Total Yield", value: totalYieldKg > 0 ? `${(totalYieldKg / 1000).toFixed(2)} t` : "—" },
            { label: "Area Harvested", value: totalAreaHa > 0 ? `${totalAreaHa.toFixed(2)} ha` : "—" },
            { label: "Avg Yield (t/ha)", value: avgTha > 0 ? avgTha.toFixed(2) : "—" },
            { label: "Avg Brix °", value: avgBrix != null ? avgBrix.toFixed(1) : "—" },
            { label: "Avg pH", value: avgPH != null ? avgPH.toFixed(2) : "—" },
            { label: "Avg TA (g/L)", value: avgTA != null ? avgTA.toFixed(1) : "—" },
            { label: "Avg Pot. Alc %", value: avgPotAlc != null ? avgPotAlc.toFixed(1) : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs text-foreground/50">{label}</p>
              <p className="text-lg font-bold text-purple-700">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* All-vintages KPI cards */}
      {year == null && allVintagesSummary.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Total Yield", value: grandKg > 0 ? `${(grandKg / 1000).toFixed(2)} t` : "—" },
            { label: "Total Area", value: grandArea > 0 ? `${grandArea.toFixed(2)} ha` : "—" },
            { label: "Avg t/ha", value: grandTha != null ? grandTha.toFixed(2) : "—" },
            { label: "Avg Brix °", value: grandBrix != null ? grandBrix.toFixed(1) : "—" },
            { label: "Avg pH", value: grandPh != null ? grandPh.toFixed(2) : "—" },
            { label: "Avg TA (g/L)", value: grandTa != null ? grandTa.toFixed(2) : "—" },
            { label: "Avg Pot. Alc %", value: grandPotAlc != null ? grandPotAlc.toFixed(1) : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-3">
              <p className="text-xs text-foreground/50">{label}</p>
              <p className="text-lg font-bold text-purple-700">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* All-vintages yield chart */}
      {year == null && (() => {
        const chartData = [...allVintagesSummary]
          .sort((a, b) => a.vintage.localeCompare(b.vintage))
          .map(row => ({
            vintage: row.vintage,
            "Yield (t)": row.totalKg > 0 ? parseFloat((row.totalKg / 1000).toFixed(2)) : 0,
            "Yield (t/ha)": row.totalAreaHa > 0 ? parseFloat((row.totalKg / 1000 / row.totalAreaHa).toFixed(2)) : null,
          }));
        return (
          <div className="rounded-xl border border-border bg-card overflow-hidden print-chart-card">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">Yield Trend — All Vintages</h3>
                <p className="text-xs text-foreground/40">
                  {chartInTha
                    ? "Yield per hectare (t/ha) — comparable across blocks of different sizes"
                    : "Total tonnes picked (bars) and yield per hectare (line) across recorded vintages"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChartInTha(v => !v)}
                className="no-print shrink-0 h-7 px-2.5 rounded-md border border-border bg-background text-xs font-medium hover:bg-muted/50 transition-colors"
                title="Toggle between total yield and yield per hectare"
              >
                {chartInTha ? "Show total (t)" : "Show t/ha"}
              </button>
            </div>
            <div className="p-4">
              {chartData.length === 0 ? (
                <p className="text-sm text-foreground/40 text-center py-6">
                  No harvest records found. Add records in the Harvest tab to see the yield trend.
                </p>
              ) : chartInTha ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="vintage" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={54} label={{ value: "t/ha", position: "insideTop", offset: -4, fontSize: 10 }} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Yield (t/ha)" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="vintage" tick={{ fontSize: 11 }} />
                    <YAxis
                      yAxisId="t"
                      tick={{ fontSize: 11 }}
                      width={50}
                      label={{ value: "t", position: "insideTop", offset: -4, fontSize: 10 }}
                    />
                    <YAxis
                      yAxisId="tha"
                      orientation="right"
                      tick={{ fontSize: 11 }}
                      width={54}
                      label={{ value: "t/ha", position: "insideTop", offset: -4, fontSize: 10 }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="t" dataKey="Yield (t)" fill="#7c3aed" radius={[3, 3, 0, 0]} maxBarSize={60} />
                    <Line
                      yAxisId="tha"
                      type="monotone"
                      dataKey="Yield (t/ha)"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        );
      })()}

      {/* Per-block yield trend chart (all-vintages mode only) */}
      {year == null && (
        <div className="rounded-xl border border-border bg-card overflow-hidden print-chart-card">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold">Per-Block Yield Trend — All Vintages</h3>
            <p className="text-xs text-foreground/40">Yield (t/ha) per vintage for each block — spot which blocks are improving or declining</p>
          </div>
          {/* Block filter toggles — shown when there are 2+ blocks, hidden on print */}
          {blockYieldTrendData.blockLines.length >= 2 && (
            <BlockFilterStrip
              blockInfos={trendBlockInfos}
              selectedIds={selectedBlockIds}
              onChangeIds={_persistBlockIds}
            />
          )}
          <div className="p-4 print-block-chart-cap">
            {blockYieldTrendData.chartData.length === 0 ? (
              <p className="text-sm text-foreground/40 text-center py-6">
                No block harvest records found. Link harvest records to blocks to see per-block trends.
              </p>
            ) : (() => {
              const visibleLines = blockYieldTrendData.blockLines.filter(
                bl => visibleBlockNames == null || visibleBlockNames.has(bl.key),
              );
              if (visibleLines.length === 0) {
                return (
                  <p className="text-sm text-foreground/40 text-center py-6">
                    No blocks selected. Tap a block above to add it to the chart, or use <em>Show all</em> to restore the full view.
                  </p>
                );
              }
              return (
                <ResponsiveContainer width="100%" height={Math.max(220, visibleLines.length * 18 + 80)}>
                  <LineChart data={blockYieldTrendData.chartData} margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="vintage" tick={{ fontSize: 11 }} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      width={50}
                      label={{ value: "t/ha", position: "insideTop", offset: -4, fontSize: 10 }}
                      domain={[0, "auto"]}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    {visibleLines.map(bl => (
                      <Line
                        key={bl.key}
                        type="monotone"
                        dataKey={bl.key}
                        stroke={bl.color}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>
      )}

      {/* Block × Vintage yield cross-tab table (all-vintages mode only) */}
      {year == null && blockYieldTrendData.blockLines.length > 0 && blockYieldTrendData.chartData.length > 0 && (() => {
        const allLines = blockYieldTrendData.blockLines;
        const vintageRows = [...blockYieldTrendData.chartData].sort(
          (a, b) => String(a.vintage).localeCompare(String(b.vintage)),
        );
        return (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">Block × Vintage Yield (t/ha)</h3>
                <p className="text-xs text-foreground/40">
                  Yield per hectare for each block across all vintages
                  {visibleBlockNames != null && (
                    <> · <span className="text-purple-600 font-medium">filtered to {visibleBlockNames.size} block{visibleBlockNames.size !== 1 ? "s" : ""}</span></>
                  )}
                </p>
              </div>
              {visibleBlockNames != null && (
                <button
                  type="button"
                  onClick={() => _persistBlockIds(null)}
                  className="no-print shrink-0 text-xs text-foreground/40 hover:text-foreground/70 underline underline-offset-2"
                >
                  Show all
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20 text-foreground/60 text-xs">
                    <th className="px-4 py-2 text-left sticky left-0 bg-muted/20 z-10">Vintage</th>
                    {/* On screen show filtered blocks; print always shows all */}
                    {allLines.map(bl => (
                      <th
                        key={bl.key}
                        className={`px-4 py-2 text-right min-w-[80px]${
                          visibleBlockNames != null && !visibleBlockNames.has(bl.key)
                            ? " hidden print:table-cell"
                            : ""
                        }`}
                      >
                        <span className="font-semibold" style={{ color: bl.color }}>{bl.key}</span>
                        {bl.variety && <div className="text-foreground/40 font-normal truncate max-w-[80px]">{bl.variety}</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vintageRows.map(row => (
                    <tr key={String(row.vintage)} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-4 py-2 font-semibold text-purple-700 sticky left-0 bg-card">{String(row.vintage)}</td>
                      {allLines.map(bl => (
                        <td
                          key={bl.key}
                          className={`px-4 py-2 text-right font-mono${
                            visibleBlockNames != null && !visibleBlockNames.has(bl.key)
                              ? " hidden print:table-cell"
                              : ""
                          }`}
                        >
                          {row[bl.key] != null
                            ? <span>{Number(row[bl.key]).toFixed(2)}</span>
                            : <span className="text-foreground/30">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* All-vintages yield summary table */}
      {year == null && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold">Yield Summary — All Vintages</h3>
            <p className="text-xs text-foreground/40">Total yield, area, t/ha, average Brix, pH, TA and potential alcohol per vintage year</p>
          </div>
          {allVintagesSummary.length === 0 ? (
            <p className="text-sm text-foreground/40 text-center py-6">
              No harvest records found. Add records in the Harvest tab.
            </p>
          ) : (
            <div className="overflow-x-auto print-all-vintages-tbl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20 text-foreground/60 text-xs">
                    <th className="px-4 py-2 text-left">Vintage</th>
                    <th className="px-4 py-2 text-right">Picks</th>
                    <th className="px-4 py-2 text-right">Total Yield (kg)</th>
                    <th className="px-4 py-2 text-right">Total Yield (t)</th>
                    <th className="px-4 py-2 text-right">Area (ha)</th>
                    <th className="px-4 py-2 text-right">Yield (t/ha)</th>
                    <th className="px-4 py-2 text-right">Avg Brix °</th>
                    <th className="px-4 py-2 text-right">Avg pH</th>
                    <th className="px-4 py-2 text-right">Avg TA (g/L)</th>
                    <th className="px-4 py-2 text-right">Avg Pot. Alc %</th>
                  </tr>
                </thead>
                <tbody>
                  {allVintagesSummary.map(row => {
                    const tha = row.totalAreaHa > 0 ? row.totalKg / 1000 / row.totalAreaHa : null;
                    return (
                      <tr key={row.vintage} className="border-t border-border/40 hover:bg-muted/20">
                        <td className="px-4 py-2 font-semibold text-purple-700">{row.vintage}</td>
                        <td className="px-4 py-2 text-right">
                          {row.records === 1 ? (
                            <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 ring-1 ring-inset ring-amber-300" title="Only one pick recorded — low-confidence data">1 pick</span>
                          ) : row.records <= 3 ? (
                            <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 text-xs font-medium px-2 py-0.5">{row.records} picks</span>
                          ) : (
                            <span className="text-foreground/60">{row.records}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-right font-mono">{row.totalKg > 0 ? row.totalKg.toFixed(0) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.totalKg > 0 ? (row.totalKg / 1000).toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.totalAreaHa > 0 ? row.totalAreaHa.toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono font-semibold">{tha != null ? tha.toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.brixCount > 0 ? (row.brixSum / row.brixCount).toFixed(1) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.phCount > 0 ? (row.phSum / row.phCount).toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.taCount > 0 ? (row.taSum / row.taCount).toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.potAlcCount > 0 ? (row.potAlcSum / row.potAlcCount).toFixed(1) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                {allVintagesSummary.length > 0 && (() => {
                  const grandKg = allVintagesSummary.reduce((s, r) => s + r.totalKg, 0);
                  const grandArea = allVintagesSummary.reduce((s, r) => s + r.totalAreaHa, 0);
                  const grandTha = grandArea > 0 ? grandKg / 1000 / grandArea : null;
                  // Record-weighted: sum all raw measurement sums and counts across vintages
                  const grandBrixSum = allVintagesSummary.reduce((s, r) => s + r.brixSum, 0);
                  const grandBrixCount = allVintagesSummary.reduce((s, r) => s + r.brixCount, 0);
                  const grandPhSum = allVintagesSummary.reduce((s, r) => s + r.phSum, 0);
                  const grandPhCount = allVintagesSummary.reduce((s, r) => s + r.phCount, 0);
                  const grandTaSum = allVintagesSummary.reduce((s, r) => s + r.taSum, 0);
                  const grandTaCount = allVintagesSummary.reduce((s, r) => s + r.taCount, 0);
                  const grandPotAlcSum = allVintagesSummary.reduce((s, r) => s + r.potAlcSum, 0);
                  const grandPotAlcCount = allVintagesSummary.reduce((s, r) => s + r.potAlcCount, 0);
                  const grandBrix = grandBrixCount > 0 ? grandBrixSum / grandBrixCount : null;
                  const grandPh = grandPhCount > 0 ? grandPhSum / grandPhCount : null;
                  const grandTa = grandTaCount > 0 ? grandTaSum / grandTaCount : null;
                  const grandPotAlc = grandPotAlcCount > 0 ? grandPotAlcSum / grandPotAlcCount : null;
                  return (
                    <tfoot>
                      <tr className="border-t-2 border-border bg-muted/20 font-semibold text-xs">
                        <td className="px-4 py-2">All Vintages</td>
                        <td className="px-4 py-2 text-right font-mono">{allVintagesSummary.reduce((s, r) => s + r.records, 0)}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold">{grandKg > 0 ? grandKg.toFixed(0) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold">{grandKg > 0 ? (grandKg / 1000).toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold">{grandArea > 0 ? grandArea.toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold">{grandTha != null ? grandTha.toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold">{grandBrix != null ? grandBrix.toFixed(1) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold">{grandPh != null ? grandPh.toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold">{grandTa != null ? grandTa.toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono font-bold">{grandPotAlc != null ? grandPotAlc.toFixed(1) : "—"}</td>
                      </tr>
                    </tfoot>
                  );
                })()}
              </table>
            </div>
          )}
        </div>
      )}

      {/* Chemistry cross-tab — all-vintages mode (#799/#802/#805) */}
      {year == null && allVintagesSummary.length > 0 && (() => {
        const vintages = [...allVintagesSummary].sort((a, b) => a.vintage.localeCompare(b.vintage));
        type VRow = typeof allVintagesSummary[0];
        const chemRows: { label: string; format: (v: VRow) => string }[] = [
          { label: "Yield (t/ha)", format: v => v.totalAreaHa > 0 ? (v.totalKg / 1000 / v.totalAreaHa).toFixed(2) : "—" },
          { label: "Avg Brix °",   format: v => v.brixCount > 0 ? (v.brixSum / v.brixCount).toFixed(1) : "—" },
          { label: "Avg pH",       format: v => v.phCount > 0 ? (v.phSum / v.phCount).toFixed(2) : "—" },
          { label: "Avg TA (g/L)", format: v => v.taCount > 0 ? (v.taSum / v.taCount).toFixed(2) : "—" },
          { label: "Avg Pot. Alc %", format: v => v.potAlcCount > 0 ? (v.potAlcSum / v.potAlcCount).toFixed(1) : "—" },
        ];
        const pickBadge = (records: number) => records === 1
          ? <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 text-xs font-semibold px-1.5 ring-1 ring-inset ring-amber-300" title="Only one pick recorded — low-confidence data">1 pick</span>
          : records <= 3
          ? <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 text-xs font-medium px-1.5">{records} picks</span>
          : <span className="text-foreground/40 text-xs">{records} picks</span>;
        return (
          <div className="rounded-xl border border-border bg-card overflow-hidden print-chem-xtab">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold">Chemistry Summary — All Vintages</h3>
              <p className="text-xs text-foreground/40">Yield and must chemistry averages per vintage — compare trends across years at a glance</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20 text-foreground/60 text-xs">
                    <th className="px-4 py-2 text-left sticky left-0 bg-muted/20 z-10">Metric</th>
                    {vintages.map(v => (
                      <th key={v.vintage} className="px-4 py-2 text-right min-w-[90px]">
                        <span className="font-semibold text-purple-700">{v.vintage}</span>
                        <div className="mt-0.5">{pickBadge(v.records)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chemRows.map(row => (
                    <tr key={row.label} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-4 py-2 font-medium text-foreground/70 sticky left-0 bg-card">{row.label}</td>
                      {vintages.map(v => (
                        <td key={v.vintage} className="px-4 py-2 text-right font-mono">{row.format(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Harvest by block (single-vintage mode only) */}
      {year != null && <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold">Harvest Records — {year} Vintage</h3>
          <p className="text-xs text-foreground/40">Per-block yield and must chemistry</p>
        </div>
        {year != null && vintageHarvest.length > 0 && vintageHarvest.length <= 3 && (
          <div className="flex items-start gap-2.5 px-4 py-2.5 border-b border-amber-200 bg-amber-50">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
            <p className="text-xs text-amber-800">
              <span className="font-semibold">
                {vintageHarvest.length === 1 ? "Only 1 pick recorded" : `Only ${vintageHarvest.length} picks recorded`}
              </span>
              {" "}— data may not be representative of the full vintage.
            </p>
          </div>
        )}
        {vintageHarvest.length === 0 ? (
          <p className="text-sm text-foreground/40 text-center py-6">
            No harvest records for {year}. Add records in the Harvest tab.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20 text-foreground/60 text-xs">
                    <th className="px-4 py-2 text-left">Block</th>
                    <th className="px-4 py-2 text-left">Variety</th>
                    <th className="px-4 py-2 text-right">Date</th>
                    <th className="px-4 py-2 text-right">Method</th>
                    <th className="px-4 py-2 text-right">Yield (kg)</th>
                    <th className="px-4 py-2 text-right">t/ha</th>
                    <th className="px-4 py-2 text-right">Brix °</th>
                    <th className="px-4 py-2 text-right">pH</th>
                    <th className="px-4 py-2 text-right">TA (g/L)</th>
                    <th className="px-4 py-2 text-right">Pot. Alc %</th>
                    <th className="px-4 py-2 text-left">Condition</th>
                    <th className="px-4 py-2 text-left">Botrytis</th>
                  </tr>
                </thead>
                <tbody>
                  {vintageHarvest.map(h => (
                    <tr key={h.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-4 py-2 font-medium">{blockName(h.blockId)}</td>
                      <td className="px-4 py-2 text-foreground/60 text-xs">
                        {fmt(blockMap[h.blockId as number]?.variety)}
                      </td>
                      <td className="px-4 py-2 text-right text-xs">{fmtDate(h.harvestDate)}</td>
                      <td className="px-4 py-2 text-right text-xs">{fmt(h.harvestMethod)}</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtN(h.yieldKg, 0)}</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtN(h.yieldTonnesPerHa, 2)}</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtN(h.brix, 1)}</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtN(h.ph, 2)}</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtN(h.titratableAcidityGl, 1)}</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtN(h.potentialAlcohol, 1)}</td>
                      <td className="px-4 py-2 text-xs">{fmt(h.grapeCondition)}</td>
                      <td className="px-4 py-2 text-xs">
                        {h.botrytisPresent
                          ? <span className="text-red-600 font-medium">Yes {h.botrytisPercentage ? `(${h.botrytisPercentage}%)` : ""}</span>
                          : <span className="text-green-600">No</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/20 font-semibold text-xs">
                    <td className="px-4 py-2" colSpan={4}>Season Totals / Averages</td>
                    <td className="px-4 py-2 text-right font-mono font-bold">
                      {totalYieldKg > 0 ? totalYieldKg.toFixed(0) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold">
                      {avgTha > 0 ? avgTha.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold">
                      {avgBrix != null ? avgBrix.toFixed(1) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold">
                      {avgPH != null ? avgPH.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold">
                      {avgTA != null ? avgTA.toFixed(1) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right font-mono font-bold">
                      {avgPotAlc != null ? avgPotAlc.toFixed(1) : "—"}
                    </td>
                    <td className="px-4 py-2" colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>}

      {/* Per-block yield summary (single-vintage mode only) */}
      {year != null && vintageHarvest.length > 0 && (() => {
        // Aggregate harvest records per block
        const blockSummaryMap: Record<number | string, {
          blockId: number | null; blockName: string; variety: string; areaHa: number;
          totalKg: number; brixSum: number; brixCount: number;
          phSum: number; phCount: number; taSum: number; taCount: number;
          potAlcSum: number; potAlcCount: number;
        }> = {};
        vintageHarvest.forEach(h => {
          const key = h.blockId ?? "unknown";
          if (!blockSummaryMap[key]) {
            const bl = h.blockId != null ? blockMap[h.blockId] : undefined;
            blockSummaryMap[key] = {
              blockId: h.blockId,
              blockName: bl?.blockName ?? fmt(h.blockId),
              variety: bl?.variety ?? "—",
              areaHa: bl != null ? n(bl.areaHa) : 0,
              totalKg: 0, brixSum: 0, brixCount: 0,
              phSum: 0, phCount: 0, taSum: 0, taCount: 0,
              potAlcSum: 0, potAlcCount: 0,
            };
          }
          const row = blockSummaryMap[key];
          row.totalKg += n(h.yieldKg);
          if (h.brix != null && h.brix !== "") { row.brixSum += n(h.brix); row.brixCount++; }
          if (h.ph != null && h.ph !== "") { row.phSum += n(h.ph); row.phCount++; }
          if (h.titratableAcidityGl != null && h.titratableAcidityGl !== "") { row.taSum += n(h.titratableAcidityGl); row.taCount++; }
          if (h.potentialAlcohol != null && h.potentialAlcohol !== "") { row.potAlcSum += n(h.potentialAlcohol); row.potAlcCount++; }
        });
        const summaryRows = Object.values(blockSummaryMap).sort((a, b) => a.blockName.localeCompare(b.blockName));
        const summTotalKg = summaryRows.reduce((s, r) => s + r.totalKg, 0);
        const summTotalArea = summaryRows.reduce((s, r) => s + r.areaHa, 0);
        const summAvgTha = summTotalArea > 0 ? summTotalKg / 1000 / summTotalArea : 0;
        const summBrixAll = summaryRows.flatMap(r => r.brixCount > 0 ? [r.brixSum / r.brixCount] : []);
        const summPhAll = summaryRows.flatMap(r => r.phCount > 0 ? [r.phSum / r.phCount] : []);
        const summPotAlcAll = summaryRows.flatMap(r => r.potAlcCount > 0 ? [r.potAlcSum / r.potAlcCount] : []);
        const summAvgBrix = summBrixAll.length > 0 ? summBrixAll.reduce((a, b) => a + b, 0) / summBrixAll.length : null;
        const summAvgPh = summPhAll.length > 0 ? summPhAll.reduce((a, b) => a + b, 0) / summPhAll.length : null;
        const summAvgPotAlc = summPotAlcAll.length > 0 ? summPotAlcAll.reduce((a, b) => a + b, 0) / summPotAlcAll.length : null;

        return (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold">Yield Summary by Block — {year} Vintage</h3>
              <p className="text-xs text-foreground/40">Aggregated totals and averages per block</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20 text-foreground/60 text-xs">
                    <th className="px-4 py-2 text-left">Block</th>
                    <th className="px-4 py-2 text-left">Variety</th>
                    <th className="px-4 py-2 text-right">Area (ha)</th>
                    <th className="px-4 py-2 text-right">Total Yield (kg)</th>
                    <th className="px-4 py-2 text-right">Yield (t/ha)</th>
                    <th className="px-4 py-2 text-right">Avg Brix °</th>
                    <th className="px-4 py-2 text-right">Avg pH</th>
                    <th className="px-4 py-2 text-right">Avg TA (g/L)</th>
                    <th className="px-4 py-2 text-right">Avg Pot. Alc %</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryRows.map((row, i) => {
                    const tha = row.areaHa > 0 ? row.totalKg / 1000 / row.areaHa : null;
                    return (
                      <tr key={i} className="border-t border-border/40 hover:bg-muted/20">
                        <td className="px-4 py-2 font-medium">{row.blockName}</td>
                        <td className="px-4 py-2 text-foreground/60 text-xs">{row.variety}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.areaHa > 0 ? row.areaHa.toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.totalKg > 0 ? row.totalKg.toFixed(0) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono">{tha != null ? tha.toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.brixCount > 0 ? (row.brixSum / row.brixCount).toFixed(1) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.phCount > 0 ? (row.phSum / row.phCount).toFixed(2) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.taCount > 0 ? (row.taSum / row.taCount).toFixed(1) : "—"}</td>
                        <td className="px-4 py-2 text-right font-mono">{row.potAlcCount > 0 ? (row.potAlcSum / row.potAlcCount).toFixed(1) : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/20 font-semibold text-xs">
                    <td className="px-4 py-2" colSpan={2}>Season Totals / Averages</td>
                    <td className="px-4 py-2 text-right font-mono font-bold">{summTotalArea > 0 ? summTotalArea.toFixed(2) : "—"}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold">{summTotalKg > 0 ? summTotalKg.toFixed(0) : "—"}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold">{summAvgTha > 0 ? summAvgTha.toFixed(2) : "—"}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold">{summAvgBrix != null ? summAvgBrix.toFixed(1) : "—"}</td>
                    <td className="px-4 py-2 text-right font-mono font-bold">{summAvgPh != null ? summAvgPh.toFixed(2) : "—"}</td>
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2 text-right font-mono font-bold">{summAvgPotAlc != null ? summAvgPotAlc.toFixed(1) : "—"}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Disease pressure season peak summary (single-vintage mode only) */}
      {year != null && <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold">Disease &amp; Pest Pressure — {year} Season Summary</h3>
          <p className="text-xs text-foreground/40">{seasonScouts.length} scouting round{seasonScouts.length !== 1 ? "s" : ""} recorded</p>
        </div>
        {seasonScouts.length === 0 ? (
          <p className="text-sm text-foreground/40 text-center py-6">
            No scouting records for {year}. Add rounds in the Disease Scouting tab.
          </p>
        ) : (
          <>
            {scoutBlockInfos.length >= 8 && (
              <BlockFilterStrip
                blockInfos={scoutBlockInfos}
                selectedIds={selectedScoutBlocks}
                onChangeIds={setSelectedScoutBlocks}
              />
            )}
          <div className="p-4 space-y-3">
            {/* Peak pressure per disease */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {DISEASE_SERIES.map(d => {
                const peak = diseasePeak[d.key] ?? 0;
                return (
                  <div key={d.key} className="rounded-lg border border-border bg-background p-2.5">
                    <p className="text-xs text-foreground/50 leading-tight">{d.label}</p>
                    <p className={`text-sm font-bold mt-0.5 ${PRESSURE_COLOR[peak]}`}>
                      {PRESSURE_LABEL[peak] ?? "—"}
                    </p>
                    <p className="text-xs text-foreground/30">peak this season</p>
                  </div>
                );
              })}
            </div>

            {/* Scouting log table */}
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/20 text-foreground/60">
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Block</th>
                    <th className="px-3 py-2 text-left">Scouted By</th>
                    <th className="px-3 py-2 text-left">Downy</th>
                    <th className="px-3 py-2 text-left">Powdery</th>
                    <th className="px-3 py-2 text-left">Botrytis</th>
                    <th className="px-3 py-2 text-left">Phomopsis</th>
                    <th className="px-3 py-2 text-left">Leafhopper</th>
                    <th className="px-3 py-2 text-left">Spider Mite</th>
                    <th className="px-3 py-2 text-left">Alerts</th>
                    <th className="px-3 py-2 text-left">Action Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleScouts.map(s => {
                    const alerts = [
                      s.vineWeevilSighted && "Vine Weevil",
                      s.eutypaDiebackSighted && "Eutypa",
                      s.xylellaFastidiosa && "⚠ Xylella",
                      s.phytophthoraViticola && "Phytophthora",
                    ].filter(Boolean).join(", ");
                    const pl = (v: unknown) => {
                      const p = PRESSURE_LABEL[n(v)];
                      const c = PRESSURE_COLOR[n(v)];
                      return <span className={c}>{p}</span>;
                    };
                    return (
                      <tr key={s.id} className="border-t border-border/40">
                        <td className="px-3 py-1.5">{fmtDate(s.scoutDate)}</td>
                        <td className="px-3 py-1.5">{blockName(s.blockId)}</td>
                        <td className="px-3 py-1.5">{fmt(s.scoutedBy)}</td>
                        <td className="px-3 py-1.5">{pl(s.downyMildewPressure)}</td>
                        <td className="px-3 py-1.5">{pl(s.powderyMildewPressure)}</td>
                        <td className="px-3 py-1.5">{pl(s.botrytisPressure)}</td>
                        <td className="px-3 py-1.5">{pl(s.phomopsisPressure)}</td>
                        <td className="px-3 py-1.5">{pl(s.leafhopperPressure)}</td>
                        <td className="px-3 py-1.5">{pl(s.spiderMitePressure)}</td>
                        <td className="px-3 py-1.5 text-red-700 font-medium">{alerts || "—"}</td>
                        <td className="px-3 py-1.5 max-w-[200px] truncate">{fmt(s.actionTaken)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          </>
        )}
      </div>}

      {/* Canopy operations log (single-vintage mode only) */}
      {year != null && <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold">Canopy &amp; Pruning Operations — {year}</h3>
          <p className="text-xs text-foreground/40">
            {seasonOps.length} operation{seasonOps.length !== 1 ? "s" : ""} ·{" "}
            {totalOpsHours > 0 ? `${totalOpsHours.toFixed(1)} hours total` : "No hours recorded"}
          </p>
        </div>
        {seasonOps.length === 0 ? (
          <p className="text-sm text-foreground/40 text-center py-6">
            No canopy operations recorded for {year}. Add records in the Pruning &amp; Canopy tab.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-foreground/60 text-xs">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Block</th>
                  <th className="px-4 py-2 text-left">Operation</th>
                  <th className="px-4 py-2 text-left">System</th>
                  <th className="px-4 py-2 text-right">Pruning Wt (kg/vine)</th>
                  <th className="px-4 py-2 text-right">Bud Count/vine</th>
                  <th className="px-4 py-2 text-right">Hours</th>
                  <th className="px-4 py-2 text-left">Operator</th>
                </tr>
              </thead>
              <tbody>
                {seasonOps.map(o => (
                  <tr key={o.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="px-4 py-2 text-xs">{fmtDate(o.operationDate)}</td>
                    <td className="px-4 py-2">{blockName(o.blockId)}</td>
                    <td className="px-4 py-2">{fmt(o.operationType)}</td>
                    <td className="px-4 py-2 text-xs text-foreground/60">{fmt(o.pruningSystem)}</td>
                    <td className="px-4 py-2 text-right font-mono">{fmtN(o.pruningWeightKgPerVine, 3)}</td>
                    <td className="px-4 py-2 text-right font-mono">{fmtN(o.budCountPerVine, 1)}</td>
                    <td className="px-4 py-2 text-right font-mono font-medium">{fmtN(o.hoursWorked, 1)}</td>
                    <td className="px-4 py-2 text-xs text-foreground/60">{fmt(o.operatorName)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/20 font-semibold text-xs">
                  <td className="px-4 py-2" colSpan={6}>Season Total</td>
                  <td className="px-4 py-2 text-right font-mono font-bold">
                    {totalOpsHours.toFixed(1)} h
                  </td>
                  <td className="px-4 py-2" />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>}

      {/* Spray diary season summary (single-vintage mode only) */}
      {year != null && seasonSprays.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold">Spray Diary Summary — {year}</h3>
            <p className="text-xs text-foreground/40">
              {seasonSprays.length} application{seasonSprays.length !== 1 ? "s" : ""} ·{" "}
              {totalSprayArea > 0 ? `${totalSprayArea.toFixed(2)} ha total area treated` : ""}
            </p>
          </div>
          {sprayBlockInfos.length >= 8 && (
            <BlockFilterStrip
              blockInfos={sprayBlockInfos}
              selectedIds={selectedSprayBlocks}
              onChangeIds={setSelectedSprayBlocks}
            />
          )}
          <div className="p-4 space-y-3">
            {/* Product summary */}
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/20 text-foreground/60">
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-right">Applications</th>
                    <th className="px-3 py-2 text-right">Total Area (ha)</th>
                    <th className="px-3 py-2 text-right">Total Qty Used</th>
                  </tr>
                </thead>
                <tbody>
                  {seasonSprayByProduct.map(([product, stats]) => (
                    <tr key={product} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5 font-medium">{product}</td>
                      <td className="px-3 py-1.5 text-right">{stats.applications}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{stats.totalAreaHa.toFixed(2)}</td>
                      <td className="px-3 py-1.5 text-right font-mono">{stats.totalQty.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Full application log */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20 text-foreground/60 text-xs">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Block</th>
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-right">Area (ha)</th>
                    <th className="px-4 py-2 text-right">Rate (per ha)</th>
                    <th className="px-4 py-2 text-right">Qty Used</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSprays.map(sp => (
                    <tr key={sp.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-4 py-2 text-xs">{fmtDate(sp.applicationDate)}</td>
                      <td className="px-4 py-2">{blockName(sp.blockId)}</td>
                      <td className="px-4 py-2">{fmt(sp.productName)}</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtN(sp.areaTreatedHa, 2)}</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtN(sp.ratePerHectare, 2)}</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtN(sp.totalQuantityApplied, 2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/20 font-semibold text-xs">
                    <td className="px-4 py-2" colSpan={3}>Season Total</td>
                    <td className="px-4 py-2 text-right font-mono font-bold">
                      {visibleSprays.reduce((s, sp) => s + n(sp.areaTreatedHa), 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2" colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Enterprise Report ────────────────────────────────────────────────────────
const ENT_PRINT_ID = "viticulture-enterprise-report-print";
function ensureEntPrintStyle() {
  // v3 — display:none siblings (not visibility:hidden) so no blank second page
  if (document.getElementById(ENT_PRINT_ID + "-css-v3")) return;
  ["-css", "-css-v2"].forEach(sfx => document.getElementById(ENT_PRINT_ID + sfx)?.remove());
  const s = document.createElement("style");
  s.id = ENT_PRINT_ID + "-css-v3";
  s.textContent = [
    `@page{size:A4 portrait;margin:1.5cm}`,
    `@media print{`,
    `html,body{margin:0!important;padding:0!important;height:auto!important;overflow:visible!important}`,
    `body>*{display:none!important}`,
    `#${ENT_PRINT_ID}{display:block!important;background:#fff!important;padding:24px!important;box-sizing:border-box!important}`,
    `.no-print{display:none!important}`,
    `table{page-break-inside:auto;border-collapse:collapse}`,
    `tr{page-break-inside:avoid;break-inside:avoid}`,
    `}`,
  ].join("");
  document.head.appendChild(s);
}

export function ViticulturalEnterpriseReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = usePersistedNumberFilter({ page: "viticultural-enterprise-report", filter: "year", farmId, defaultValue: currentYear });
  // All three sections open by default; each toggles independently
  const [openSections, setOpenSections] = useState<Set<string>>(() => new Set(["harvest", "ops", "sprays", "scouting"]));
  const toggleSection = (s: string) => setOpenSections(prev => {
    const next = new Set(prev);
    next.has(s) ? next.delete(s) : next.add(s);
    return next;
  });
  const [forcePrint, setForcePrint] = useState(false);
  useEffect(() => {
    const before = () => setForcePrint(true);
    const after = () => setForcePrint(false);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);
  const [, setLocation] = useLocation();

  const { blocks, harvests, scouts, ops, sprays, loading } = useVitData(farmId);

  // Financial transactions for this farm — filtered to Viticulture enterprise + selected year
  const { data: allTransactions } = useQuery<any[]>({
    queryKey: ["financial-transactions", farmId],
    queryFn: () =>
      fetch(api(`farms/${farmId}/financial-transactions`), { credentials: "include" })
        .then(r => r.json())
        .then(j => j.records ?? []),
    enabled: !!farmId,
    staleTime: 60_000,
  });

  const vitTx = useMemo(() => {
    if (!allTransactions) return [];
    return allTransactions.filter((t: any) => {
      if ((t.enterprise ?? "") !== "Viticulture") return false;
      const txYear = t.transactionDate ? new Date(t.transactionDate).getFullYear() : null;
      return txYear === year;
    });
  }, [allTransactions, year]);

  // ── Explicit category sets for each Gross Margin row ────────────────────
  // Revenue rows (each tracked separately; all contribute to GM output total)
  const VIT_GRAPE_WINE_CATS = new Set(["Grape Sales", "Wine Sales — Sparkling", "Wine Sales — Still", "Wine Sales — Rosé"]);
  const VIT_CONTRACT_CATS   = new Set(["Winery Contract Processing Income"]);
  const VIT_SCHEME_CATS     = new Set(["Vineyard Agri-Environment Scheme", "Other Viticulture Income"]);

  // Expense rows — explicit variable / direct cost categories only
  const VIT_SPRAY_CATS   = new Set(["Pesticides & Herbicides", "Fungicides", "Insecticides"]);
  const VIT_VINEMGMT_CATS = new Set(["Vine Management"]);
  const VIT_LABOUR_CATS  = new Set(["Labour"]);
  const VIT_WINERY_CATS  = new Set(["Winery Processing Costs"]);
  // Other variable direct costs — haulage, packaging, certification etc.
  const VIT_OTHER_VARIABLE_CATS = new Set([
    "Seeds & Seed Treatments", "Fertiliser", "Haulage", "Electricity",
    "Contracting & Machinery Hire", "Feed & Forage", "Feed & Bedding", "Veterinary & Medicine",
  ]);
  // Capital / establishment items — shown separately, excluded from GM
  const VIT_CAPITAL_CATS = new Set(["Vineyard Establishment Costs", "Vine Purchases & Replacements"]);

  const sumTx = (cats: Set<string>, type: "income" | "expense") =>
    vitTx.filter((t: any) => t.transactionType === type && cats.has(t.category ?? ""))
         .reduce((s: number, t: any) => s + (t.amountPence ?? 0), 0);

  const vitGrapeWinePence   = useMemo(() => sumTx(VIT_GRAPE_WINE_CATS, "income"), [vitTx]);
  const vitContractPence    = useMemo(() => sumTx(VIT_CONTRACT_CATS, "income"),   [vitTx]);
  const vitSchemePence      = useMemo(() => sumTx(VIT_SCHEME_CATS, "income"),     [vitTx]);
  const vitTotalRevPence    = vitGrapeWinePence + vitContractPence + vitSchemePence;

  const vitSprayCostPence   = useMemo(() => sumTx(VIT_SPRAY_CATS, "expense"),       [vitTx]);
  const vitVineMgmtPence    = useMemo(() => sumTx(VIT_VINEMGMT_CATS, "expense"),    [vitTx]);
  const vitLabourCostPence  = useMemo(() => sumTx(VIT_LABOUR_CATS, "expense"),      [vitTx]);
  const vitWineryCostPence  = useMemo(() => sumTx(VIT_WINERY_CATS, "expense"),      [vitTx]);
  const vitOtherVarPence    = useMemo(() => sumTx(VIT_OTHER_VARIABLE_CATS, "expense"), [vitTx]);
  const vitCapitalPence     = useMemo(() => sumTx(VIT_CAPITAL_CATS, "expense"),     [vitTx]);

  // Gross Margin = sales + contract + scheme income minus all direct variable costs
  const vitTotalDirectCostPence = vitSprayCostPence + vitVineMgmtPence + vitLabourCostPence + vitWineryCostPence + vitOtherVarPence;
  const vitGrossMarginPence     = vitTotalRevPence - vitTotalDirectCostPence;

  const fmtGbp = (pence: number) => `£${(Math.abs(pence) / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtPerHa = (pence: number, ha: number) => ha > 0 ? `£${(Math.abs(pence) / 100 / ha).toFixed(2)}` : "—";
  const fmtPerKg = (pence: number, kg: number) => kg > 0 ? `${(Math.abs(pence) / kg).toFixed(1)}p` : "—";

  // Farm Settings completeness check — warn before printing if key header fields are missing
  const { data: farmMeta } = useQuery<Record<string, unknown> | null>({
    queryKey: ["farm-meta", farmId],
    queryFn: async () => {
      const r = await fetch(`/api/farms/${farmId}`, { credentials: "include" });
      if (!r.ok) return null;
      const d = await r.json();
      return (d.record ?? d) as Record<string, unknown>;
    },
    enabled: !!farmId,
    staleTime: 5 * 60 * 1000,
  });
  const entMissingFields = farmMeta != null
    ? [
        !farmMeta.name || String(farmMeta.name).trim() === "" ? "Farm name" : "",
        !farmMeta.address || String(farmMeta.address).trim() === "" ? "Farm address" : "",
      ].filter(Boolean) as string[]
    : [];

  const blockMap = useMemo(() => {
    const m: Record<number, Block> = {};
    blocks.forEach(b => { m[b.id] = b; });
    return m;
  }, [blocks]);

  const blockName = (id: unknown) => blockMap[id as number]?.blockName ?? fmt(id);

  const vintageHarvest = useMemo(
    () => harvests.filter(h => Number(h.vintageYear) === year),
    [harvests, year],
  );
  const yearOps = useMemo(
    () => ops.filter(o => new Date(o.operationDate).getFullYear() === year),
    [ops, year],
  );
  const yearSprays = useMemo(
    () => sprays.filter(s => new Date(s.applicationDate).getFullYear() === year),
    [sprays, year],
  );
  const yearScouts = useMemo(
    () => scouts.filter(s => new Date(s.scoutDate).getFullYear() === year)
      .sort((a, b) => a.scoutDate.localeCompare(b.scoutDate)),
    [scouts, year],
  );

  // Disease peak pressure per disease across the enterprise year
  const entDiseasePeak = useMemo(() => {
    const peak: Record<string, number> = {};
    DISEASE_SERIES.forEach(d => { peak[d.key] = 0; });
    yearScouts.forEach(s => {
      DISEASE_SERIES.forEach(d => {
        const v = n((s as Record<string, unknown>)[d.key]);
        if (v > (peak[d.key] ?? 0)) peak[d.key] = v;
      });
    });
    return peak;
  }, [yearScouts]);

  // Harvest totals
  const totalYieldKg = vintageHarvest.reduce((s, h) => s + n(h.yieldKg), 0);
  const activeBlockIds = new Set(vintageHarvest.map(h => h.blockId).filter((id): id is number => id != null));
  const totalHarvestHa = [...activeBlockIds].reduce((s, id) => s + n(blockMap[id]?.areaHa), 0);
  const avgTha = totalHarvestHa > 0 ? totalYieldKg / 1000 / totalHarvestHa : 0;
  const brixVals = vintageHarvest.filter(h => h.brix != null && h.brix !== "").map(h => n(h.brix));
  const avgBrix = brixVals.length > 0 ? brixVals.reduce((a, b) => a + b, 0) / brixVals.length : null;

  // Operations hours by type
  const opsByType = useMemo(() => {
    const m: Record<string, number> = {};
    yearOps.forEach(o => {
      const t = o.operationType ?? "Other";
      m[t] = (m[t] ?? 0) + n(o.hoursWorked);
    });
    return Object.entries(m).sort(([, a], [, b]) => b - a);
  }, [yearOps]);
  const totalOpsHours = yearOps.reduce((s, o) => s + n(o.hoursWorked), 0);

  // Spray summary
  const sprayByProduct = useMemo(() => {
    const m: Record<string, { applications: number; totalAreaHa: number; totalQty: number }> = {};
    yearSprays.forEach(sp => {
      const p = sp.productName ?? "Unknown";
      if (!m[p]) m[p] = { applications: 0, totalAreaHa: 0, totalQty: 0 };
      m[p].applications++;
      m[p].totalAreaHa += n(sp.areaTreatedHa);
      m[p].totalQty += n(sp.totalQuantityApplied);
    });
    return Object.entries(m).sort(([, a], [, b]) => b.applications - a.applications);
  }, [yearSprays]);
  const totalSprayApplications = yearSprays.length;
  const totalSprayArea = yearSprays.reduce((s, sp) => s + n(sp.areaTreatedHa), 0);

  const vintageYears = useMemo(() => {
    const yrs = [...new Set(harvests.map(h => Number(h.vintageYear)).filter(Boolean))].sort((a, b) => b - a);
    if (!yrs.includes(currentYear)) yrs.unshift(currentYear);
    return yrs;
  }, [harvests, currentYear]);

  const hasData = vintageHarvest.length > 0 || yearOps.length > 0 || yearSprays.length > 0;

  // Per-block yield summary — computed at component level so the print-only section can use it
  const entBlockSummary = useMemo(() => {
    const map: Record<number | string, {
      blockId: number | null; blockName: string; variety: string; areaHa: number;
      totalKg: number; brixSum: number; brixCount: number;
      phSum: number; phCount: number; taSum: number; taCount: number;
      potAlcSum: number; potAlcCount: number;
    }> = {};
    vintageHarvest.forEach(h => {
      const key = h.blockId ?? "unknown";
      if (!map[key]) {
        const bl = h.blockId != null ? blockMap[h.blockId] : undefined;
        map[key] = {
          blockId: h.blockId,
          blockName: bl?.blockName ?? fmt(h.blockId),
          variety: bl?.variety ?? "—",
          areaHa: bl != null ? n(bl.areaHa) : 0,
          totalKg: 0, brixSum: 0, brixCount: 0,
          phSum: 0, phCount: 0, taSum: 0, taCount: 0,
          potAlcSum: 0, potAlcCount: 0,
        };
      }
      const row = map[key];
      row.totalKg += n(h.yieldKg);
      if (h.brix != null && h.brix !== "") { row.brixSum += n(h.brix); row.brixCount++; }
      if (h.ph != null && h.ph !== "") { row.phSum += n(h.ph); row.phCount++; }
      if (h.titratableAcidityGl != null && h.titratableAcidityGl !== "") { row.taSum += n(h.titratableAcidityGl); row.taCount++; }
      if (h.potentialAlcohol != null && h.potentialAlcohol !== "") { row.potAlcSum += n(h.potentialAlcohol); row.potAlcCount++; }
    });
    const rows = Object.values(map).sort((a, b) => a.blockName.localeCompare(b.blockName));
    const totalKg = rows.reduce((s, r) => s + r.totalKg, 0);
    const totalArea = rows.reduce((s, r) => s + r.areaHa, 0);
    const avgThaVal = totalArea > 0 ? totalKg / 1000 / totalArea : 0;
    const brixAll = rows.flatMap(r => r.brixCount > 0 ? [r.brixSum / r.brixCount] : []);
    const phAll = rows.flatMap(r => r.phCount > 0 ? [r.phSum / r.phCount] : []);
    const potAlcAll = rows.flatMap(r => r.potAlcCount > 0 ? [r.potAlcSum / r.potAlcCount] : []);
    return {
      rows,
      totalKg,
      totalArea,
      avgTha: avgThaVal,
      avgBrix: brixAll.length > 0 ? brixAll.reduce((a, b) => a + b, 0) / brixAll.length : null,
      avgPh: phAll.length > 0 ? phAll.reduce((a, b) => a + b, 0) / phAll.length : null,
      avgPotAlc: potAlcAll.length > 0 ? potAlcAll.reduce((a, b) => a + b, 0) / potAlcAll.length : null,
    };
  }, [vintageHarvest, blockMap]);

  // Auto-jump to the most recent vintage year that has data when the current
  // selection (defaulting to today's year) yields nothing — e.g. first visit
  // after demo seeding or after a new year rolls over with no records yet.
  const hasAutoJumpedYear = useRef(false);
  useEffect(() => {
    if (loading || hasData || hasAutoJumpedYear.current) return;
    hasAutoJumpedYear.current = true;
    const best = vintageYears.find(y => y !== currentYear);
    if (best !== undefined && best !== year) setYear(best);
  // Only re-run when loading or hasData change — intentionally omit year/setYear/vintageYears
  // to avoid re-triggering after the user manually picks a year with no data.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">
        Loading report…
      </div>
    );
  }

  const hasVitTx = vitTx.length > 0;
  const gmColor = vitGrossMarginPence >= 0 ? "#166534" : "#991b1b";

  return (
    <div id={ENT_PRINT_ID} className="space-y-5">
      {/* ── Controls ── */}
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Viticulture Enterprise Report</h2>
          <p className="text-sm text-foreground/50">
            Yield summary · Gross margin framework · Operational inputs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {vintageYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={() => { ensureEntPrintStyle(); window.print(); }}
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50"
          >
            <Printer className="w-3.5 h-3.5" />Print
          </button>
        </div>
      </div>

      {entMissingFields.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-md border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 no-print">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
          <span>
            <span className="font-medium">Farm Settings incomplete:</span>{" "}
            {entMissingFields.join(", ")} {entMissingFields.length === 1 ? "is" : "are"} not set — your printed report will have blank header fields.{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-amber-900 font-medium"
              onClick={() => setLocation("/settings/farm")}
            >
              Add in Farm Settings → General
            </button>
          </span>
        </div>
      )}

      {/* Print-only report header — shows farm name/address so they appear in the printed output */}
      <div className="hidden print:block border-b-2 border-gray-800 pb-3 mb-4">
        <h1 className="text-xl font-bold">Viticulture Enterprise Report — {year}</h1>
        {!!farmMeta?.name && <p className="text-sm font-semibold mt-0.5">{String(farmMeta.name)}</p>}
        {!!farmMeta?.address && <p className="text-xs text-gray-500">{String(farmMeta.address)}</p>}
        <p className="text-xs text-gray-400 mt-1">
          {[
            farmMeta?.appaRef ? `APPA: ${String(farmMeta.appaRef)}` : null,
            farmMeta?.fsaWineProductionRef ? `FSA Wine: ${String(farmMeta.fsaWineProductionRef)}` : null,
            farmMeta?.winegbMembershipNumber ? `WineGB: ${String(farmMeta.winegbMembershipNumber)}` : null,
          ].filter(Boolean).join(" · ")}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Printed: {new Date().toLocaleDateString("en-GB")}</p>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No harvest, operations, or spray records found for {year}.
          Record your vintage harvest, canopy operations, and spray diary to build an enterprise report.
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Total Yield — {year}</span>
              <p className="text-lg font-bold text-purple-700">
                {totalYieldKg > 0 ? `${(totalYieldKg / 1000).toFixed(2)} t` : "—"}
              </p>
              <p className="text-xs text-foreground/40">
                {totalYieldKg > 0 ? `${totalYieldKg.toFixed(0)} kg` : "No harvest records"} · {vintageHarvest.length} record{vintageHarvest.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Avg Yield per Hectare</span>
              <p className="text-lg font-bold">
                {avgTha > 0 ? `${avgTha.toFixed(2)} t/ha` : "—"}
              </p>
              <p className="text-xs text-foreground/40">
                {totalHarvestHa > 0 ? `across ${totalHarvestHa.toFixed(2)} ha` : "Area not linked"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Avg Brix — {year}</span>
              <p className="text-lg font-bold">
                {avgBrix != null ? `${avgBrix.toFixed(1)} °` : "—"}
              </p>
              <p className="text-xs text-foreground/40">average must sugar at harvest</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Canopy Operations</span>
              <p className="text-lg font-bold">
                {totalOpsHours > 0 ? `${totalOpsHours.toFixed(1)} h` : "—"}
              </p>
              <p className="text-xs text-foreground/40">
                {yearOps.length} operation{yearOps.length !== 1 ? "s" : ""} · {opsByType.length} type{opsByType.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* ── Gross Margin Framework — 4-column, no Notes column ── */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold">Gross Margin Framework — {year}</h3>
              {!hasVitTx && (
                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
                  No Viticulture transactions recorded for {year}
                </span>
              )}
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-foreground/60 text-xs">
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-right">Per ha</th>
                  <th className="px-4 py-2 text-right">Per kg</th>
                </tr>
              </thead>
              <tbody>
                {/* Output */}
                <tr className="bg-emerald-50/50">
                  <td className="px-4 py-1.5 text-xs font-semibold text-emerald-800 uppercase tracking-wide" colSpan={4}>Output</td>
                </tr>
                {([
                  { label: "Grape & Wine Sales", value: vitGrapeWinePence },
                  { label: "Contract Processing Income", value: vitContractPence },
                  { label: "Scheme & Other Income", value: vitSchemePence },
                ] as { label: string; value: number }[]).map(row => (
                  <tr key={row.label} className="border-t border-border/40 bg-emerald-50/20">
                    <td className="px-4 py-2 text-sm text-foreground/80 pl-6">{row.label}</td>
                    <td className="px-4 py-2 text-right font-semibold text-emerald-700">
                      {hasVitTx ? fmtGbp(row.value) : <span className="text-foreground/30 italic text-xs">Add via Financial</span>}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-emerald-700">{hasVitTx ? fmtPerHa(row.value, totalHarvestHa) : "—"}</td>
                    <td className="px-4 py-2 text-right font-mono text-emerald-700">{hasVitTx ? fmtPerKg(row.value, totalYieldKg) : "—"}</td>
                  </tr>
                ))}
                <tr className="border-t border-emerald-200/60 bg-emerald-50/40 font-semibold">
                  <td className="px-4 py-2 text-sm text-emerald-800 pl-6">Total Output</td>
                  <td className="px-4 py-2 text-right text-emerald-800">{hasVitTx ? fmtGbp(vitTotalRevPence) : "—"}</td>
                  <td className="px-4 py-2 text-right font-mono text-emerald-700">{hasVitTx ? fmtPerHa(vitTotalRevPence, totalHarvestHa) : "—"}</td>
                  <td className="px-4 py-2 text-right font-mono text-emerald-700">{hasVitTx ? fmtPerKg(vitTotalRevPence, totalYieldKg) : "—"}</td>
                </tr>

                {/* Direct variable costs */}
                <tr className="bg-muted/30">
                  <td className="px-4 py-1.5 text-xs font-semibold text-foreground/60 uppercase tracking-wide" colSpan={4}>Direct Variable Costs</td>
                </tr>
                {([
                  { label: "Spray & Agrochemical", value: vitSprayCostPence, hint: totalSprayApplications > 0 ? `${totalSprayApplications} applications recorded` : "" },
                  { label: "Vine Management", value: vitVineMgmtPence, hint: "" },
                  { label: "Labour", value: vitLabourCostPence, hint: totalOpsHours > 0 ? `${totalOpsHours.toFixed(1)} canopy hours recorded` : "" },
                  { label: "Winery Processing", value: vitWineryCostPence, hint: "" },
                  { label: "Other Direct Costs", value: vitOtherVarPence, hint: "Haulage · Fertiliser · Contracting · Electricity" },
                ] as { label: string; value: number; hint: string }[]).map(row => (
                  <tr key={row.label} className="border-t border-border/40">
                    <td className="px-4 py-2 text-sm text-foreground/80 pl-6">
                      {row.label}
                      {row.hint ? <span className="text-xs text-foreground/40 ml-1.5">· {row.hint}</span> : null}
                    </td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {hasVitTx ? fmtGbp(row.value) : <span className="text-foreground/30 italic text-xs">Add via Financial</span>}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">{hasVitTx ? fmtPerHa(row.value, totalHarvestHa) : "—"}</td>
                    <td className="px-4 py-2 text-right font-mono">{hasVitTx ? fmtPerKg(row.value, totalYieldKg) : "—"}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border bg-muted/10 font-semibold">
                  <td className="px-4 py-2 text-sm pl-6">Total Direct Costs</td>
                  <td className="px-4 py-2 text-right">{hasVitTx ? fmtGbp(vitTotalDirectCostPence) : "—"}</td>
                  <td className="px-4 py-2 text-right font-mono">{hasVitTx ? fmtPerHa(vitTotalDirectCostPence, totalHarvestHa) : "—"}</td>
                  <td className="px-4 py-2 text-right font-mono">{hasVitTx ? fmtPerKg(vitTotalDirectCostPence, totalYieldKg) : "—"}</td>
                </tr>

                {/* Gross Margin */}
                <tr className={`border-t border-border font-bold ${vitGrossMarginPence >= 0 ? "bg-emerald-50/30" : "bg-red-50/30"}`}>
                  <td className="px-4 py-2.5">Gross Margin</td>
                  <td className="px-4 py-2.5 text-right" style={{ color: gmColor }}>
                    {hasVitTx
                      ? (vitGrossMarginPence < 0 ? "−" : "") + fmtGbp(vitGrossMarginPence)
                      : <span className="text-foreground/40 italic font-normal text-sm">Add revenue &amp; costs via Financial</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono" style={{ color: gmColor }}>{hasVitTx ? fmtPerHa(vitGrossMarginPence, totalHarvestHa) : "—"}</td>
                  <td className="px-4 py-2.5 text-right font-mono" style={{ color: gmColor }}>{hasVitTx ? fmtPerKg(vitGrossMarginPence, totalYieldKg) : "—"}</td>
                </tr>

                {/* Capital items below GM line */}
                {vitCapitalPence > 0 && (
                  <>
                    <tr className="bg-muted/20">
                      <td className="px-4 py-1.5 text-xs font-semibold text-foreground/50 uppercase tracking-wide" colSpan={4}>Capital &amp; Establishment (not in Gross Margin)</td>
                    </tr>
                    <tr className="border-t border-border/40">
                      <td className="px-4 py-2 text-sm text-foreground/70 pl-6">Vine Establishment &amp; Replacements</td>
                      <td className="px-4 py-2 text-right font-semibold">{fmtGbp(vitCapitalPence)}</td>
                      <td className="px-4 py-2 text-right font-mono">{fmtPerHa(vitCapitalPence, totalHarvestHa)}</td>
                      <td className="px-4 py-2 text-right font-mono">—</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
            <div className="px-4 py-2.5 bg-amber-50/60 border-t border-amber-200/60">
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Financial module categories used:</span>{" "}
                Grape Sales · Wine Sales (Sparkling / Still / Rosé) · Winery Contract Processing Income · Vineyard Agri-Environment Scheme · Other Viticulture Income ·
                Pesticides &amp; Herbicides · Fungicides · Insecticides · Vine Management · Labour · Winery Processing Costs · Haulage · Fertiliser · Contracting &amp; Machinery Hire · Electricity.
                Tag each transaction to the <span className="font-semibold">Viticulture</span> enterprise.
              </p>
            </div>
          </div>

          {/* ── Harvest Detail — open by default ── */}
          {vintageHarvest.length > 0 && (
            <Collapsible
              title={`Harvest Detail — ${vintageHarvest.length} record${vintageHarvest.length !== 1 ? "s" : ""} · ${(totalYieldKg / 1000).toFixed(2)} t total`}
              open={forcePrint || openSections.has("harvest")}
              setOpen={() => toggleSection("harvest")}
            >
              {/* Yield summary by block */}
              {entBlockSummary.rows.length > 0 && (
                <div className="px-4 py-3 border-b border-border bg-muted/10">
                  <p className="text-xs font-semibold text-foreground/60 mb-2">Yield Summary by Block</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/20 text-foreground/60">
                          <th className="px-3 py-2 text-left">Block</th>
                          <th className="px-3 py-2 text-left">Variety</th>
                          <th className="px-3 py-2 text-right">Area (ha)</th>
                          <th className="px-3 py-2 text-right">Yield (kg)</th>
                          <th className="px-3 py-2 text-right">Yield (t/ha)</th>
                          <th className="px-3 py-2 text-right">Avg Brix °</th>
                          <th className="px-3 py-2 text-right">Avg pH</th>
                          <th className="px-3 py-2 text-right">Avg TA (g/L)</th>
                          <th className="px-3 py-2 text-right">Avg Pot. Alc %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entBlockSummary.rows.map((row, i) => {
                          const tha = row.areaHa > 0 ? row.totalKg / 1000 / row.areaHa : null;
                          return (
                            <tr key={i} className="border-t border-border/40 hover:bg-muted/20">
                              <td className="px-3 py-1.5 font-medium">{row.blockName}</td>
                              <td className="px-3 py-1.5 text-foreground/60">{row.variety}</td>
                              <td className="px-3 py-1.5 text-right font-mono">{row.areaHa > 0 ? row.areaHa.toFixed(2) : "—"}</td>
                              <td className="px-3 py-1.5 text-right font-mono">{row.totalKg > 0 ? row.totalKg.toFixed(0) : "—"}</td>
                              <td className="px-3 py-1.5 text-right font-mono">{tha != null ? tha.toFixed(2) : "—"}</td>
                              <td className="px-3 py-1.5 text-right font-mono">{row.brixCount > 0 ? (row.brixSum / row.brixCount).toFixed(1) : "—"}</td>
                              <td className="px-3 py-1.5 text-right font-mono">{row.phCount > 0 ? (row.phSum / row.phCount).toFixed(2) : "—"}</td>
                              <td className="px-3 py-1.5 text-right font-mono">{row.taCount > 0 ? (row.taSum / row.taCount).toFixed(1) : "—"}</td>
                              <td className="px-3 py-1.5 text-right font-mono">{row.potAlcCount > 0 ? (row.potAlcSum / row.potAlcCount).toFixed(1) : "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border bg-muted/20 font-semibold">
                          <td className="px-3 py-1.5" colSpan={2}>Season Totals / Averages</td>
                          <td className="px-3 py-1.5 text-right font-mono font-bold">{entBlockSummary.totalArea > 0 ? entBlockSummary.totalArea.toFixed(2) : "—"}</td>
                          <td className="px-3 py-1.5 text-right font-mono font-bold">{entBlockSummary.totalKg > 0 ? entBlockSummary.totalKg.toFixed(0) : "—"}</td>
                          <td className="px-3 py-1.5 text-right font-mono font-bold">{entBlockSummary.avgTha > 0 ? entBlockSummary.avgTha.toFixed(2) : "—"}</td>
                          <td className="px-3 py-1.5 text-right font-mono font-bold">{entBlockSummary.avgBrix != null ? entBlockSummary.avgBrix.toFixed(1) : "—"}</td>
                          <td className="px-3 py-1.5 text-right font-mono font-bold">{entBlockSummary.avgPh != null ? entBlockSummary.avgPh.toFixed(2) : "—"}</td>
                          <td className="px-3 py-1.5" />
                          <td className="px-3 py-1.5 text-right font-mono font-bold">{entBlockSummary.avgPotAlc != null ? entBlockSummary.avgPotAlc.toFixed(1) : "—"}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
              {/* Per-record harvest detail */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted/20 text-foreground/60">
                      <th className="px-3 py-2 text-left">Block</th>
                      <th className="px-3 py-2 text-right">Date</th>
                      <th className="px-3 py-2 text-right">Yield (kg)</th>
                      <th className="px-3 py-2 text-right">t/ha</th>
                      <th className="px-3 py-2 text-right">Brix °</th>
                      <th className="px-3 py-2 text-right">pH</th>
                      <th className="px-3 py-2 text-right">TA (g/L)</th>
                      <th className="px-3 py-2 text-right">Pot. Alc %</th>
                      <th className="px-3 py-2 text-left">Condition</th>
                      <th className="px-3 py-2 text-left">Destination</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vintageHarvest.map(h => (
                      <tr key={h.id} className="border-t border-border/40 hover:bg-muted/20">
                        <td className="px-3 py-1.5 font-medium">{blockName(h.blockId)}</td>
                        <td className="px-3 py-1.5 text-right">{fmtDate(h.harvestDate)}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{fmtN(h.yieldKg, 0)}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{fmtN(h.yieldTonnesPerHa, 2)}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{fmtN(h.brix, 1)}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{fmtN(h.ph, 2)}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{fmtN(h.titratableAcidityGl, 1)}</td>
                        <td className="px-3 py-1.5 text-right font-mono">{fmtN(h.potentialAlcohol, 1)}</td>
                        <td className="px-3 py-1.5">{fmt(h.grapeCondition)}</td>
                        <td className="px-3 py-1.5">
                          {h.destinationWineryType === "own-holding" ? "Own winery"
                            : h.destinationWineryType === "contract-processor" ? `Contract: ${fmt(h.destinationWinery)}`
                            : fmt(h.destinationWinery)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Collapsible>
          )}

          {/* ── Canopy Operations — open by default ── */}
          {yearOps.length > 0 && (
            <Collapsible
              title={`Canopy Operations — ${yearOps.length} operation${yearOps.length !== 1 ? "s" : ""} · ${totalOpsHours.toFixed(1)} hours`}
              open={forcePrint || openSections.has("ops")}
              setOpen={() => toggleSection("ops")}
            >
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {opsByType.map(([type, hours]) => (
                    <div key={type} className="rounded-lg border border-border bg-background p-2.5">
                      <p className="text-xs text-foreground/50 leading-tight">{type}</p>
                      <p className="text-sm font-bold mt-0.5">{hours.toFixed(1)} h</p>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/20 text-foreground/60">
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Block</th>
                        <th className="px-3 py-2 text-left">Operation</th>
                        <th className="px-3 py-2 text-right">Pruning Wt (kg/vine)</th>
                        <th className="px-3 py-2 text-right">Bud Count/vine</th>
                        <th className="px-3 py-2 text-right">Hours</th>
                        <th className="px-3 py-2 text-left">Operator</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearOps.map(o => (
                        <tr key={o.id} className="border-t border-border/40 hover:bg-muted/20">
                          <td className="px-3 py-1.5">{fmtDate(o.operationDate)}</td>
                          <td className="px-3 py-1.5">{blockName(o.blockId)}</td>
                          <td className="px-3 py-1.5">{fmt(o.operationType)}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{fmtN(o.pruningWeightKgPerVine, 3)}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{fmtN(o.budCountPerVine, 1)}</td>
                          <td className="px-3 py-1.5 text-right font-mono font-medium">{fmtN(o.hoursWorked, 1)}</td>
                          <td className="px-3 py-1.5 text-foreground/60">{fmt(o.operatorName)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border bg-muted/20 font-semibold">
                        <td className="px-3 py-1.5" colSpan={5}>Total</td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold">{totalOpsHours.toFixed(1)}</td>
                        <td className="px-3 py-1.5" />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </Collapsible>
          )}

          {/* ── Spray Diary — open by default ── */}
          {yearSprays.length > 0 && (
            <Collapsible
              title={`Spray Diary — ${totalSprayApplications} application${totalSprayApplications !== 1 ? "s" : ""} · ${totalSprayArea.toFixed(1)} ha treated`}
              open={forcePrint || openSections.has("sprays")}
              setOpen={() => toggleSection("sprays")}
            >
              <div className="p-4 space-y-3">
                {/* Product summary */}
                <div className="overflow-x-auto rounded-lg border border-border/50">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/20 text-foreground/60">
                        <th className="px-3 py-2 text-left">Product</th>
                        <th className="px-3 py-2 text-right">Applications</th>
                        <th className="px-3 py-2 text-right">Total Area (ha)</th>
                        <th className="px-3 py-2 text-right">Total Qty Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sprayByProduct.map(([product, stats]) => (
                        <tr key={product} className="border-t border-border/40 hover:bg-muted/20">
                          <td className="px-3 py-1.5 font-medium">{product}</td>
                          <td className="px-3 py-1.5 text-right">{stats.applications}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{stats.totalAreaHa.toFixed(2)}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{stats.totalQty.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Full application log */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/20 text-foreground/60">
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Block</th>
                        <th className="px-3 py-2 text-left">Product</th>
                        <th className="px-3 py-2 text-right">Area (ha)</th>
                        <th className="px-3 py-2 text-right">Rate (per ha)</th>
                        <th className="px-3 py-2 text-right">Qty Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearSprays.map(sp => (
                        <tr key={sp.id} className="border-t border-border/40 hover:bg-muted/20">
                          <td className="px-3 py-1.5">{fmtDate(sp.applicationDate)}</td>
                          <td className="px-3 py-1.5">{blockName(sp.blockId)}</td>
                          <td className="px-3 py-1.5 font-medium">{fmt(sp.productName)}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{fmtN(sp.areaTreatedHa, 2)}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{fmtN(sp.ratePerHectare, 2)}</td>
                          <td className="px-3 py-1.5 text-right font-mono">{fmtN(sp.totalQuantityApplied, 2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border bg-muted/20 font-semibold">
                        <td className="px-3 py-1.5" colSpan={3}>Total</td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold">{totalSprayArea.toFixed(2)}</td>
                        <td className="px-3 py-1.5" colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </Collapsible>
          )}

          {/* ── Disease Scouting ── */}
          {yearScouts.length > 0 && (
            <>
              {/* Peak pressure summary — placed outside the Collapsible so it always appears in print */}
              <div className="hidden print:block rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-semibold">Disease &amp; Pest Pressure — {year} Season Peak</h3>
                  <p className="text-xs text-foreground/40">{yearScouts.length} scouting round{yearScouts.length !== 1 ? "s" : ""} · 0 = None · 1 = Low · 2 = Medium · 3 = High</p>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {DISEASE_SERIES.map(d => {
                      const peak = entDiseasePeak[d.key] ?? 0;
                      return (
                        <div key={d.key} className="rounded-lg border border-border bg-background p-2.5">
                          <p className="text-xs text-foreground/50 leading-tight">{d.label}</p>
                          <p className={`text-sm font-bold mt-0.5 ${PRESSURE_COLOR[peak]}`}>
                            {PRESSURE_LABEL[peak] ?? "—"}
                          </p>
                          <p className="text-xs text-foreground/30">peak this season</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Collapsible per-record log (screen) — content also appears in print when collapsed via print:block */}
              <Collapsible
                title={`Disease Scouting — ${yearScouts.length} round${yearScouts.length !== 1 ? "s" : ""}`}
                open={forcePrint || openSections.has("scouting")}
                setOpen={() => toggleSection("scouting")}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-muted/20 text-foreground/60">
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-left">Block</th>
                        <th className="px-3 py-2 text-left">Downy</th>
                        <th className="px-3 py-2 text-left">Powdery</th>
                        <th className="px-3 py-2 text-left">Botrytis</th>
                        <th className="px-3 py-2 text-left">Phomopsis</th>
                        <th className="px-3 py-2 text-left">Leafhopper</th>
                        <th className="px-3 py-2 text-left">Spider Mite</th>
                        <th className="px-3 py-2 text-left">Alerts</th>
                        <th className="px-3 py-2 text-left">Action Taken</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearScouts.map(s => {
                        const alerts = [
                          s.vineWeevilSighted && "Vine Weevil",
                          s.eutypaDiebackSighted && "Eutypa",
                          s.xylellaFastidiosa && "⚠ Xylella",
                          s.phytophthoraViticola && "Phytophthora",
                        ].filter(Boolean).join(", ");
                        const pl = (v: unknown) => {
                          const p = PRESSURE_LABEL[n(v)];
                          const c = PRESSURE_COLOR[n(v)];
                          return <span className={c}>{p}</span>;
                        };
                        return (
                          <tr key={s.id} className="border-t border-border/40 hover:bg-muted/20">
                            <td className="px-3 py-1.5">{fmtDate(s.scoutDate)}</td>
                            <td className="px-3 py-1.5">{blockName(s.blockId)}</td>
                            <td className="px-3 py-1.5">{pl(s.downyMildewPressure)}</td>
                            <td className="px-3 py-1.5">{pl(s.powderyMildewPressure)}</td>
                            <td className="px-3 py-1.5">{pl(s.botrytisPressure)}</td>
                            <td className="px-3 py-1.5">{pl(s.phomopsisPressure)}</td>
                            <td className="px-3 py-1.5">{pl(s.leafhopperPressure)}</td>
                            <td className="px-3 py-1.5">{pl(s.spiderMitePressure)}</td>
                            <td className="px-3 py-1.5 text-red-700 font-medium">{alerts || "—"}</td>
                            <td className="px-3 py-1.5 max-w-[200px] truncate">{fmt(s.actionTaken)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Collapsible>
            </>
          )}
        </>
      )}
    </div>
  );
}

function BlockFilterStrip({
  blockInfos,
  selectedIds,
  onChangeIds,
}: {
  blockInfos: BlockInfo[];
  selectedIds: Set<number> | null;
  onChangeIds: (ids: Set<number> | null) => void;
}) {
  const [search, setSearch] = useState("");
  const [groupByVariety, setGroupByVariety] = useState(false);

  const showSearch = blockInfos.length >= 8;
  const searchLower = search.trim().toLowerCase();
  const filtered = searchLower
    ? blockInfos.filter(b =>
        b.name.toLowerCase().includes(searchLower) ||
        b.variety.toLowerCase().includes(searchLower),
      )
    : blockInfos;

  const allIds = blockInfos.map(b => b.id);

  const toggleBlock = (id: number) => {
    const current = selectedIds ?? new Set(allIds);
    const next = new Set(current);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      if (next.size === allIds.length) { onChangeIds(null); return; }
    }
    onChangeIds(next);
  };

  const toggleVariety = (variety: string) => {
    const varietyIds = blockInfos.filter(b => b.variety === variety).map(b => b.id);
    const current = selectedIds ?? new Set(allIds);
    const allActive = varietyIds.every(id => current.has(id));
    const next = new Set(current);
    if (allActive) {
      varietyIds.forEach(id => next.delete(id));
    } else {
      varietyIds.forEach(id => next.add(id));
      if (next.size === allIds.length) { onChangeIds(null); return; }
    }
    onChangeIds(next);
  };

  const varietyGroups: { variety: string; blocks: BlockInfo[] }[] = [];
  if (groupByVariety) {
    const seen = new Map<string, BlockInfo[]>();
    filtered.forEach(b => {
      const v = b.variety || "Unknown variety";
      if (!seen.has(v)) seen.set(v, []);
      seen.get(v)!.push(b);
    });
    seen.forEach((blocks, variety) => varietyGroups.push({ variety, blocks }));
    varietyGroups.sort((a, b) => a.variety.localeCompare(b.variety));
  }

  return (
    <div className="border-b border-border bg-muted/10 no-print">
      {/* Toolbar row */}
      <div className="px-4 py-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-foreground/50 shrink-0">Show blocks:</span>

        {showSearch && (
          <div className="relative shrink-0">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-foreground/40 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search blocks or varieties…"
              className="h-6 pl-6 pr-2 rounded-full border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 w-48"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70 text-xs leading-none"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        )}

        {showSearch && new Set(blockInfos.map(b => b.variety)).size > 1 && (
          <button
            type="button"
            onClick={() => setGroupByVariety(v => !v)}
            className={`h-6 px-2.5 rounded-full text-xs font-medium border transition-colors shrink-0 ${
              groupByVariety
                ? "bg-purple-600 border-purple-600 text-white"
                : "border-border bg-background text-foreground/60 hover:text-foreground"
            }`}
          >
            By variety
          </button>
        )}

        {selectedIds != null && (
          <button
            type="button"
            onClick={() => onChangeIds(null)}
            className="text-xs text-foreground/40 hover:text-foreground/70 underline underline-offset-2 shrink-0"
          >
            Show all
          </button>
        )}

        {(selectedIds == null || selectedIds.size > 0) && (
          <button
            type="button"
            onClick={() => onChangeIds(new Set())}
            className="text-xs text-foreground/40 hover:text-foreground/70 underline underline-offset-2 shrink-0"
          >
            Select none
          </button>
        )}
      </div>

      {/* Pills row */}
      <div className="px-4 pb-2.5 flex flex-wrap gap-1.5">
        {groupByVariety ? (
          varietyGroups.map(({ variety, blocks: vBlocks }) => {
            const allActive = vBlocks.every(b => selectedIds == null || selectedIds.has(b.id));
            const someActive = !allActive && vBlocks.some(b => selectedIds == null || selectedIds.has(b.id));
            return (
              <div key={variety} className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleVariety(variety)}
                  className={`inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-xs font-semibold border transition-colors ${
                    allActive
                      ? "bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200"
                      : someActive
                      ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
                      : "border-border bg-background text-foreground/40 hover:text-foreground/70"
                  }`}
                  title={allActive ? `Hide all ${variety}` : `Show all ${variety}`}
                >
                  <Grape className="w-2.5 h-2.5" />{variety}
                </button>
                {vBlocks.map(b => {
                  const active = selectedIds == null || selectedIds.has(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBlock(b.id)}
                      className={`h-6 px-2 rounded-full text-xs font-medium border transition-colors ${
                        active
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "border-border bg-background text-foreground/40 hover:text-foreground/70"
                      }`}
                      title={active ? `Hide ${b.name}` : `Show ${b.name}`}
                    >
                      {b.name}
                    </button>
                  );
                })}
              </div>
            );
          })
        ) : (
          filtered.map(b => {
            const active = selectedIds == null || selectedIds.has(b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => toggleBlock(b.id)}
                className={`h-6 px-2 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "border-border bg-background text-foreground/40 hover:text-foreground/70"
                }`}
                title={active ? `Hide ${b.name}` : `Show ${b.name}`}
              >
                {b.name}
              </button>
            );
          })
        )}
        {filtered.length === 0 && (
          <p className="text-xs text-foreground/40 italic">No blocks match "{search}"</p>
        )}
      </div>
    </div>
  );
}

function ensureAnalyticsPrintStyle() {
  if (document.getElementById(ANALYTICS_PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = ANALYTICS_PRINT_ID + "-css";
  s.textContent = `@media print{.analytics-chart-cap{page-break-inside:avoid;break-inside:avoid;break-before:avoid}.analytics-chart-cap .recharts-responsive-container{width:100%!important;max-height:300px!important}.analytics-chart-cap .recharts-wrapper{max-height:300px!important}.analytics-chart-cap .recharts-wrapper svg{max-height:300px!important}}`;
  document.head.appendChild(s);
}
