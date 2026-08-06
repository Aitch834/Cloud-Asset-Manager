import { useState, useMemo, useEffect } from "react";
import { usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { YearCompareSelector, COMPARE_COLORS } from "@/components/analytics/YearCompareSelector";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp, TrendingDown, Printer, ChevronDown, ChevronUp, Grape,
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
  ratePerHectare: string | null; quantityUsed: string | null;
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
      {open && <div className="overflow-x-auto border-t border-border">{children}</div>}
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

  // ── Vintage yield + Brix trend (filtered to selected/compare years) ───────
  const allVintageMap = useMemo(() => {
    const map: Record<string, {
      totalKg: number; totalHa: number; brixSum: number; brixCount: number;
      phSum: number; phCount: number; potAlcSum: number; potAlcCount: number;
      records: number;
    }> = {};
    harvests.forEach(h => {
      const yr = String(h.vintageYear);
      if (!yr || yr === "null") return;
      if (!map[yr]) map[yr] = { totalKg: 0, totalHa: 0, brixSum: 0, brixCount: 0, phSum: 0, phCount: 0, potAlcSum: 0, potAlcCount: 0, records: 0 };
      const m = map[yr];
      m.totalKg += n(h.yieldKg);
      const tha = n(h.yieldTonnesPerHa);
      if (tha > 0 && n(h.yieldKg) > 0) m.totalHa += n(h.yieldKg) / 1000 / tha;
      if (h.brix != null && h.brix !== "") { m.brixSum += n(h.brix); m.brixCount++; }
      if (h.ph != null && h.ph !== "") { m.phSum += n(h.ph); m.phCount++; }
      if (h.potentialAlcohol != null && h.potentialAlcohol !== "") { m.potAlcSum += n(h.potentialAlcohol); m.potAlcCount++; }
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
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold">
              Vintage Yield{compareYear ? ` — ${selectedYear} vs ${compareYear}` : ` — ${selectedYear}`}
            </h3>
            <p className="text-xs text-foreground/40">Total tonnes picked per vintage</p>
          </div>
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
        </div>

        {/* Brix & chemistry */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold">
              Must Chemistry{compareYear ? ` — ${selectedYear} vs ${compareYear}` : ` — ${selectedYear}`}
            </h3>
            <p className="text-xs text-foreground/40">Average Brix, pH, and potential alcohol per vintage</p>
          </div>
          <div className="p-4">
            {vintageData.filter(d => d["Avg Brix °"] != null).length === 0 ? (
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
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ── Disease pressure ─── */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold">Disease &amp; Pest Pressure — {selectedYear}</h3>
          <p className="text-xs text-foreground/40">0 = None · 1 = Low · 2 = Medium · 3 = High</p>
        </div>
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
      </div>

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
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold">
              Canopy Operations — Hours by Type{compareYear ? ` · ${selectedYear} vs ${compareYear}` : ` · ${selectedYear}`}
            </h3>
          </div>
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
        </div>
      )}
    </div>
  );
}

// ─── Vintage Season Report ────────────────────────────────────────────────────
const SEASON_PRINT_ID = "vintage-season-report-print";
function ensureSeasonPrintStyle() {
  if (document.getElementById(SEASON_PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = SEASON_PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${SEASON_PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}table{page-break-inside:auto}tr{page-break-inside:avoid}}`;
  document.head.appendChild(s);
}

export function VintageSeasonReportTab({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { blocks, harvests, scouts, ops, sprays, loading } = useVitData(farmId);

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

  // Harvest for selected vintage
  const vintageHarvest = useMemo(
    () => harvests.filter(h => Number(h.vintageYear) === year),
    [harvests, year],
  );

  // Season scouting (calendar year matching vintage)
  const seasonScouts = useMemo(
    () => scouts.filter(s => new Date(s.scoutDate).getFullYear() === year)
      .sort((a, b) => a.scoutDate.localeCompare(b.scoutDate)),
    [scouts, year],
  );

  // Operations for vintage year
  const seasonOps = useMemo(
    () => ops.filter(o => new Date(o.operationDate).getFullYear() === year)
      .sort((a, b) => a.operationDate.localeCompare(b.operationDate)),
    [ops, year],
  );

  // Spray diary for vintage year
  const seasonSprays = useMemo(
    () => sprays.filter(s => new Date(s.applicationDate).getFullYear() === year),
    [sprays, year],
  );

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
  const totalOpsHours = seasonOps.reduce((s, o) => s + n(o.hoursWorked), 0);
  const totalSprayArea = seasonSprays.reduce((s, sp) => s + n(sp.areaTreatedHa), 0);

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
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {vintageYears.map(y => <option key={y} value={y}>{y} Vintage</option>)}
          </select>
          {printButton}
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Grape className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-bold">Vintage Report — {year}</h1>
        </div>
        <p className="text-sm text-gray-500">Produced {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* Season summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Vintage Year", value: String(year) },
          { label: "Harvest Records", value: String(vintageHarvest.length) },
          { label: "Total Yield", value: totalYieldKg > 0 ? `${(totalYieldKg / 1000).toFixed(2)} t` : "—" },
          { label: "Area Harvested", value: totalAreaHa > 0 ? `${totalAreaHa.toFixed(2)} ha` : "—" },
          { label: "Avg Yield (t/ha)", value: avgTha > 0 ? avgTha.toFixed(2) : "—" },
          { label: "Avg Brix °", value: avgBrix != null ? avgBrix.toFixed(1) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs text-foreground/50">{label}</p>
            <p className="text-lg font-bold text-purple-700">{value}</p>
          </div>
        ))}
      </div>

      {/* Harvest by block */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold">Harvest Records — {year} Vintage</h3>
          <p className="text-xs text-foreground/40">Per-block yield and must chemistry</p>
        </div>
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
                    <td className="px-4 py-2" />
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
      </div>

      {/* Disease pressure season peak summary */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold">Disease &amp; Pest Pressure — {year} Season Summary</h3>
          <p className="text-xs text-foreground/40">{seasonScouts.length} scouting round{seasonScouts.length !== 1 ? "s" : ""} recorded</p>
        </div>
        {seasonScouts.length === 0 ? (
          <p className="text-sm text-foreground/40 text-center py-6">
            No scouting records for {year}. Add rounds in the Disease Scouting tab.
          </p>
        ) : (
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
                  {seasonScouts.map(s => {
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
        )}
      </div>

      {/* Canopy operations log */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
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
      </div>

      {/* Spray diary season summary */}
      {seasonSprays.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h3 className="text-sm font-semibold">Spray Diary Summary — {year}</h3>
            <p className="text-xs text-foreground/40">
              {seasonSprays.length} application{seasonSprays.length !== 1 ? "s" : ""} ·{" "}
              {totalSprayArea > 0 ? `${totalSprayArea.toFixed(2)} ha total area treated` : ""}
            </p>
          </div>
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
                {seasonSprays.map(sp => (
                  <tr key={sp.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="px-4 py-2 text-xs">{fmtDate(sp.applicationDate)}</td>
                    <td className="px-4 py-2">{blockName(sp.blockId)}</td>
                    <td className="px-4 py-2">{fmt(sp.productName)}</td>
                    <td className="px-4 py-2 text-right font-mono">{fmtN(sp.areaTreatedHa, 2)}</td>
                    <td className="px-4 py-2 text-right font-mono">{fmtN(sp.ratePerHectare, 2)}</td>
                    <td className="px-4 py-2 text-right font-mono">{fmtN(sp.quantityUsed, 2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/20 font-semibold text-xs">
                  <td className="px-4 py-2" colSpan={3}>Season Total</td>
                  <td className="px-4 py-2 text-right font-mono font-bold">{totalSprayArea.toFixed(2)}</td>
                  <td className="px-4 py-2" colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Enterprise Report ────────────────────────────────────────────────────────
const ENT_PRINT_ID = "viticulture-enterprise-report-print";
function ensureEntPrintStyle() {
  if (document.getElementById(ENT_PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = ENT_PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${ENT_PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
  document.head.appendChild(s);
}

export function ViticulturalEnterpriseReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (s: string) => setOpenSection(v => (v === s ? null : s));

  const { blocks, harvests, ops, sprays, loading } = useVitData(farmId);

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
      m[p].totalQty += n(sp.quantityUsed);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">
        Loading report…
      </div>
    );
  }

  return (
    <div id={ENT_PRINT_ID} className="space-y-5">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Viticulture Enterprise Report</h2>
          <p className="text-sm text-foreground/50">
            Yield summary · Operational inputs · Gross margin framework
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

          {/* Gross margin framework */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold">Gross Margin Framework — {year}</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-foreground/60 text-xs">
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-right">Per ha</th>
                  <th className="px-4 py-2 text-right">Per kg</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {/* Revenue */}
                <tr className="border-t border-border/40 bg-emerald-50/30">
                  <td className="px-4 py-2 font-semibold text-emerald-700">Grape / Wine Revenue</td>
                  <td className="px-4 py-2 text-right text-foreground/40 italic">Add via Financial</td>
                  <td className="px-4 py-2 text-right text-foreground/40">—</td>
                  <td className="px-4 py-2 text-right text-foreground/40">—</td>
                  <td className="px-4 py-2 text-xs text-foreground/40">Record grape/wine sales in the Financial module to complete this line</td>
                </tr>
                {/* Spray costs */}
                <tr className="border-t border-border/40">
                  <td className="px-4 py-2 text-foreground/70">Spray &amp; Agrochemical Cost</td>
                  <td className="px-4 py-2 text-right text-foreground/40 italic">Add via Financial</td>
                  <td className="px-4 py-2 text-right text-foreground/40">—</td>
                  <td className="px-4 py-2 text-right text-foreground/40">—</td>
                  <td className="px-4 py-2 text-xs text-foreground/40">
                    {totalSprayApplications > 0
                      ? `${totalSprayApplications} applications · ${totalSprayArea.toFixed(1)} ha treated recorded`
                      : "No spray records"}
                  </td>
                </tr>
                {/* Labour */}
                <tr className="border-t border-border/40">
                  <td className="px-4 py-2 text-foreground/70">Labour Cost</td>
                  <td className="px-4 py-2 text-right text-foreground/40 italic">Add via Financial</td>
                  <td className="px-4 py-2 text-right text-foreground/40">—</td>
                  <td className="px-4 py-2 text-right text-foreground/40">—</td>
                  <td className="px-4 py-2 text-xs text-foreground/40">
                    {totalOpsHours > 0
                      ? `${totalOpsHours.toFixed(1)} canopy hours recorded`
                      : "No operation hours recorded"}
                  </td>
                </tr>
                {/* Other variable costs */}
                <tr className="border-t border-border/40">
                  <td className="px-4 py-2 text-foreground/70">Other Variable Costs</td>
                  <td className="px-4 py-2 text-right text-foreground/40 italic">Add via Financial</td>
                  <td className="px-4 py-2 text-right text-foreground/40">—</td>
                  <td className="px-4 py-2 text-right text-foreground/40">—</td>
                  <td className="px-4 py-2 text-xs text-foreground/40">Haulage, winery processing, packaging, certification</td>
                </tr>
                {/* Gross margin */}
                <tr className="border-t-2 border-border bg-muted/10 font-semibold">
                  <td className="px-4 py-2">Gross Margin</td>
                  <td className="px-4 py-2 text-right text-foreground/40 italic">Add costs &amp; revenue via Financial</td>
                  <td className="px-4 py-2 text-right text-foreground/40">—</td>
                  <td className="px-4 py-2 text-right text-foreground/40">—</td>
                  <td className="px-4 py-2" />
                </tr>
              </tbody>
            </table>
            <div className="px-4 py-3 bg-amber-50/60 border-t border-amber-200/60">
              <p className="text-xs text-amber-800">
                <span className="font-semibold">To complete this report:</span> record grape and wine sales revenue,
                spray product costs, labour costs, and winery processing costs in the Financial module,
                tagged to the Viticulture enterprise. Yield and operational input data above are drawn
                directly from your Harvest, Pruning &amp; Canopy, and Spray Diary records.
              </p>
            </div>
          </div>

          {/* Harvest by block detail */}
          {vintageHarvest.length > 0 && (
            <Collapsible
              title={`Harvest Detail — ${vintageHarvest.length} record${vintageHarvest.length !== 1 ? "s" : ""} · ${(totalYieldKg / 1000).toFixed(2)} t total`}
              open={openSection === "harvest"}
              setOpen={v => toggle(v ? "harvest" : "")}
            >
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
            </Collapsible>
          )}

          {/* Operations detail */}
          {yearOps.length > 0 && (
            <Collapsible
              title={`Canopy Operations — ${yearOps.length} operation${yearOps.length !== 1 ? "s" : ""} · ${totalOpsHours.toFixed(1)} hours`}
              open={openSection === "ops"}
              setOpen={v => toggle(v ? "ops" : "")}
            >
              <div className="p-4 space-y-3">
                {/* Hours by type summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {opsByType.map(([type, hours]) => (
                    <div key={type} className="rounded-lg border border-border bg-background p-2.5">
                      <p className="text-xs text-foreground/50 leading-tight">{type}</p>
                      <p className="text-sm font-bold mt-0.5">{hours.toFixed(1)} h</p>
                    </div>
                  ))}
                </div>
                {/* Operations table */}
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
                </table>
              </div>
            </Collapsible>
          )}

          {/* Spray diary detail */}
          {yearSprays.length > 0 && (
            <Collapsible
              title={`Spray Diary — ${totalSprayApplications} application${totalSprayApplications !== 1 ? "s" : ""} · ${totalSprayArea.toFixed(1)} ha treated`}
              open={openSection === "sprays"}
              setOpen={v => toggle(v ? "sprays" : "")}
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
              </div>
            </Collapsible>
          )}
        </>
      )}
    </div>
  );
}
