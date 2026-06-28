import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Wrench, Fuel, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";

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

function fmtGBP(pence: number) { return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtGBPnull(pence: number | null) { return pence != null ? fmtGBP(pence) : "—"; }

export function FleetCostReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading } = useQuery<FleetReportData>({
    queryKey: ["fleet-cost-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/fleet-cost-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const d = data;
  const hasData = d && d.machineCount > 0;

  if (isLoading) return <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>;

  const displayMachines = showAll ? (d?.machines ?? []) : (d?.machines ?? []).slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Fleet Cost Report</h2>
          <p className="text-sm text-foreground/50">Annual depreciation, insurance, and fuel cost per machine</p>
        </div>
        <select className="h-9 rounded-lg border border-border bg-background px-3 text-sm" value={year} onChange={e => setYear(parseInt(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No active machinery found. Add equipment in the Fleet section to generate this report.
        </div>
      ) : (
        <>
          {/* Fleet KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Active Machines" value={d!.machineCount.toString()} sub="in fleet" icon={<Wrench className="w-4 h-4 text-slate-500" />} />
            <KpiCard label="Total Annual Cost" value={fmtGBP(d!.totalFleetAnnualCostPence)} sub={`${fmtGBP(Math.round(d!.totalFleetAnnualCostPence / (d!.machineCount || 1)))} avg/machine`} icon={<TrendingDown className="w-4 h-4 text-orange-500" />} />
            <KpiCard label="Total Depreciation" value={fmtGBP(d!.totalDepreciationPence)} sub={`${Math.round(d!.totalDepreciationPence / d!.totalFleetAnnualCostPence * 100)}% of fleet cost`} icon={<TrendingDown className="w-4 h-4 text-amber-500" />} />
            <KpiCard label="Fleet Fuel Cost" value={fmtGBP(d!.totalFuelCostPence)} sub="from tracked usage" icon={<Fuel className="w-4 h-4 text-blue-500" />} />
          </div>

          {/* Machine breakdown table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Cost per Machine — {d!.year}</h3>
              <span className="text-xs text-foreground/40">Depreciation uses {d!.machines[0]?.depreciationRatePct ?? 15}% declining balance (default if not set)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20 text-foreground/60 text-xs border-b border-border">
                    <th className="px-4 py-2 text-left">Machine</th>
                    <th className="px-4 py-2 text-right">Current Value</th>
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
                      <td className="px-4 py-2 text-right text-foreground/70">{m.currentValuePence > 0 ? fmtGBP(m.currentValuePence) : "—"}</td>
                      <td className="px-4 py-2 text-right">{m.annualDepreciationPence > 0 ? fmtGBP(m.annualDepreciationPence) : "—"}</td>
                      <td className="px-4 py-2 text-right">{m.annualInsurancePence > 0 ? fmtGBP(m.annualInsurancePence) : "—"}</td>
                      <td className="px-4 py-2 text-right">{m.fuelCostPence > 0 ? fmtGBP(m.fuelCostPence) : "—"}</td>
                      <td className="px-4 py-2 text-right font-semibold">{fmtGBP(m.totalAnnualCostPence)}</td>
                      <td className="px-4 py-2 text-right font-mono text-foreground/70">{fmtGBPnull(m.costPerHourPence)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-muted/20 font-semibold text-sm">
                    <td className="px-4 py-2">Total Fleet</td>
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
              Depreciation = declining balance on current value (or purchase price if not set). Fuel linked from fuel usage records tagged to equipment. Cost/hr assumes 500 hrs/year unless current hours available. Add purchase price, current value, and insurance in the Fleet/Equipment page to improve accuracy.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-1"><span className="text-xs text-foreground/50">{label}</span>{icon}</div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-xs text-foreground/40 mt-0.5">{sub}</p>
    </div>
  );
}
