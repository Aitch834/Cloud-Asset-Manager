import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { Wrench, Fuel, TrendingDown, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface MachineRow {
  id: number; name: string; machineType: string; makeModel: string;
  purchasePricePence: number; currentValuePence: number; depreciationRatePct: number;
  annualDepreciationPence: number; annualInsurancePence: number;
  fuelLitres: number; fuelCostPence: number;
  totalAnnualCostPence: number; costPerHourPence: number | null;
  currentHours: number | null; registration: string | null;
}

interface FleetReportData {
  year: number; machineCount: number;
  totalFleetAnnualCostPence: number;
  totalDepreciationPence: number;
  totalInsurancePence: number;
  totalFuelCostPence: number;
  machines: MachineRow[];
}

const PRINT_ID = "fleet-cost-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{visibility:hidden!important}#${PRINT_ID}{visibility:visible!important;display:block!important;position:fixed!important;inset:0!important;overflow:auto!important;background:#fff!important;z-index:99999!important;padding:24px!important}#${PRINT_ID} *{visibility:visible!important}.no-print{display:none!important;visibility:hidden!important}table{page-break-inside:auto}tr{page-break-inside:avoid}}`;
  document.head.appendChild(s);
}

function fmtGBP(p: number) { return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtGBPnull(p: number | null) { return p != null ? fmtGBP(p) : "—"; }

function KpiCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-1"><span className="text-xs text-foreground/50">{label}</span>{icon}</div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-foreground/40 mt-0.5">{sub}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1">
      <p className="font-semibold mb-1 truncate max-w-[180px]">{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: {fmtGBP(p.value)}</p>)}
    </div>
  );
};

export function FleetCostReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = usePersistedNumberFilter({ page: "fleet-cost-report", filter: "year", farmId, defaultValue: currentYear });
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading } = useQuery<FleetReportData>({
    queryKey: ["fleet-cost-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/fleet-cost-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>;

  const d = data;
  const hasData = d && d.machineCount > 0;
  const displayMachines = showAll ? (d?.machines ?? []) : (d?.machines ?? []).slice(0, 10);

  const chartData = (d?.machines ?? []).slice(0, 15).map(m => ({
    name: m.name.length > 18 ? m.name.slice(0, 16) + "…" : m.name,
    "Depreciation": m.annualDepreciationPence,
    "Insurance": m.annualInsurancePence,
    "Fuel": m.fuelCostPence,
  }));

  const totalOtherPct = d && d.totalFleetAnnualCostPence > 0
    ? ((d.totalFleetAnnualCostPence - d.totalDepreciationPence - d.totalInsurancePence - d.totalFuelCostPence) / d.totalFleetAnnualCostPence * 100).toFixed(0)
    : null;

  return (
    <div id={PRINT_ID} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Fleet Cost Report</h2>
          <p className="text-sm text-foreground/50">Annual depreciation, insurance, and fuel cost per machine</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 rounded-lg border border-border bg-background px-3 text-sm" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => { ensurePrintStyle(); window.print(); }} className="h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50">
            <Printer className="w-3.5 h-3.5" />Print
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No active machinery found. Add equipment with purchase price, current value and insurance in the Fleet section.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Active Machines" value={d!.machineCount.toString()} sub="in fleet" icon={<Wrench className="w-4 h-4 text-slate-500" />} />
            <KpiCard label="Total Annual Cost" value={fmtGBP(d!.totalFleetAnnualCostPence)} sub={`${fmtGBP(Math.round(d!.totalFleetAnnualCostPence / (d!.machineCount || 1)))} avg/machine`} icon={<TrendingDown className="w-4 h-4 text-orange-500" />} />
            <KpiCard label="Depreciation" value={fmtGBP(d!.totalDepreciationPence)} sub={`${d!.totalFleetAnnualCostPence > 0 ? Math.round(d!.totalDepreciationPence / d!.totalFleetAnnualCostPence * 100) : 0}% of fleet cost`} icon={<TrendingDown className="w-4 h-4 text-amber-500" />} />
            <KpiCard label="Fuel Cost" value={fmtGBP(d!.totalFuelCostPence)} sub="from tracked usage records" icon={<Fuel className="w-4 h-4 text-blue-500" />} />
          </div>

          {chartData.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Annual Cost by Machine — Depreciation + Insurance + Fuel</h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 32 + 60)}>
                  <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 60, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" tickFormatter={v => `£${(v / 100).toFixed(0)}`} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Depreciation" fill="#f59e0b" stackId="a" maxBarSize={20} />
                    <Bar dataKey="Insurance" fill="#8b5cf6" stackId="a" maxBarSize={20} />
                    <Bar dataKey="Fuel" fill="#3b82f6" stackId="a" radius={[0, 3, 3, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Cost per Machine — {d!.year}</h3>
              <span className="text-xs text-foreground/40">Declining balance depreciation · est. 500 hrs/year for cost/hr</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20 text-foreground/60 text-xs border-b border-border">
                    <th className="px-4 py-2 text-left">Machine</th>
                    <th className="px-4 py-2 text-right">Current Value</th>
                    <th className="px-4 py-2 text-right">Depr. Rate</th>
                    <th className="px-4 py-2 text-right">Depreciation</th>
                    <th className="px-4 py-2 text-right">Insurance</th>
                    <th className="px-4 py-2 text-right">Fuel</th>
                    <th className="px-4 py-2 text-right">Total/Year</th>
                    <th className="px-4 py-2 text-right">Est. Cost/hr</th>
                  </tr>
                </thead>
                <tbody>
                  {displayMachines.map(m => (
                    <tr key={m.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-4 py-2">
                        <p className="font-medium">{m.name}</p>
                        <p className="text-xs text-foreground/40">{m.machineType}{m.makeModel ? ` · ${m.makeModel}` : ""}{m.registration ? ` · ${m.registration}` : ""}</p>
                      </td>
                      <td className="px-4 py-2 text-right text-foreground/70">{m.currentValuePence > 0 ? fmtGBP(m.currentValuePence) : m.purchasePricePence > 0 ? fmtGBP(m.purchasePricePence) : "—"}</td>
                      <td className="px-4 py-2 text-right text-foreground/50 text-xs">{m.depreciationRatePct}%</td>
                      <td className="px-4 py-2 text-right">{m.annualDepreciationPence > 0 ? fmtGBP(m.annualDepreciationPence) : "—"}</td>
                      <td className="px-4 py-2 text-right">{m.annualInsurancePence > 0 ? fmtGBP(m.annualInsurancePence) : "—"}</td>
                      <td className="px-4 py-2 text-right">{m.fuelCostPence > 0 ? <span title={`${m.fuelLitres.toFixed(1)}L`}>{fmtGBP(m.fuelCostPence)}</span> : "—"}</td>
                      <td className="px-4 py-2 text-right font-semibold">{fmtGBP(m.totalAnnualCostPence)}</td>
                      <td className="px-4 py-2 text-right font-mono text-foreground/70">{fmtGBPnull(m.costPerHourPence)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-muted/20 font-semibold text-sm">
                    <td className="px-4 py-2">Total Fleet ({d!.machineCount} machines)</td>
                    <td className="px-4 py-2 text-right" />
                    <td className="px-4 py-2 text-right" />
                    <td className="px-4 py-2 text-right">{fmtGBP(d!.totalDepreciationPence)}</td>
                    <td className="px-4 py-2 text-right">{fmtGBP(d!.totalInsurancePence)}</td>
                    <td className="px-4 py-2 text-right">{fmtGBP(d!.totalFuelCostPence)}</td>
                    <td className="px-4 py-2 text-right">{fmtGBP(d!.totalFleetAnnualCostPence)}</td>
                    <td className="px-4 py-2 text-right" />
                  </tr>
                </tbody>
              </table>
            </div>
            {d!.machines.length > 10 && (
              <button className="w-full px-4 py-2.5 text-xs text-foreground/60 hover:bg-muted/30 flex items-center justify-center gap-1 border-t border-border" onClick={() => setShowAll(v => !v)}>
                {showAll ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</> : <><ChevronDown className="w-3.5 h-3.5" /> Show all {d!.machines.length} machines</>}
              </button>
            )}
            <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">
              Depreciation = declining balance on current value (purchase price if current value not set). Default rate 15% if not specified on the machine record. Fuel from usage records tagged to equipment. Cost/hr assumes 500 hrs/year — set actual hours in the Fleet module for precision. Repair, tyres, and operator labour not included.
            </div>
          </div>

          {d!.totalDepreciationPence > 0 && (
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <h3 className="text-sm font-semibold mb-3">Cost Structure Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-foreground/50">Depreciation</p>
                  <p className="text-base font-bold text-amber-600">{fmtGBP(d!.totalDepreciationPence)}</p>
                  <p className="text-xs text-foreground/40">{d!.totalFleetAnnualCostPence > 0 ? Math.round(d!.totalDepreciationPence / d!.totalFleetAnnualCostPence * 100) : 0}% of total</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/50">Insurance</p>
                  <p className="text-base font-bold text-purple-600">{fmtGBP(d!.totalInsurancePence)}</p>
                  <p className="text-xs text-foreground/40">{d!.totalFleetAnnualCostPence > 0 ? Math.round(d!.totalInsurancePence / d!.totalFleetAnnualCostPence * 100) : 0}% of total</p>
                </div>
                <div>
                  <p className="text-xs text-foreground/50">Fuel</p>
                  <p className="text-base font-bold text-blue-600">{fmtGBP(d!.totalFuelCostPence)}</p>
                  <p className="text-xs text-foreground/40">{d!.totalFleetAnnualCostPence > 0 ? Math.round(d!.totalFuelCostPence / d!.totalFleetAnnualCostPence * 100) : 0}% of total</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
