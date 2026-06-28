import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Users, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface EnterpriseRow {
  enterprise: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  totalCostPence: number;
  pctOfTotal: number;
}

interface StaffRow {
  staffName: string;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  totalCostPence: number;
  regularRatePence: number | null;
}

interface LabourReportData {
  year: number;
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalCostPence: number;
  timesheetEntries: number;
  byEnterprise: EnterpriseRow[];
  byStaff: StaffRow[];
}

function fmtGBP(pence: number) { return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

const ENTERPRISE_COLOURS: Record<string, string> = {
  Dairy: "bg-blue-500", Beef: "bg-orange-500", Sheep: "bg-amber-400", Pigs: "bg-pink-500",
  Poultry: "bg-yellow-500", Arable: "bg-green-500", Livestock: "bg-orange-400",
  Machinery: "bg-slate-500", General: "bg-gray-400",
};

export function LabourEnterpriseReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [showStaff, setShowStaff] = useState(false);

  const { data, isLoading } = useQuery<LabourReportData>({
    queryKey: ["labour-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/labour-enterprise-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const d = data;
  const hasData = d && d.timesheetEntries > 0;

  if (isLoading) return <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Labour Cost by Enterprise</h2>
          <p className="text-sm text-foreground/50">Hours and wage cost allocated by enterprise from timesheets</p>
        </div>
        <select className="h-9 rounded-lg border border-border bg-background px-3 text-sm" value={year} onChange={e => setYear(parseInt(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No timesheet entries found for {year}.<br />
          <span className="text-xs">Record timesheets with task types to see labour costs by enterprise. Set hourly rates in the Labour → Pay Summary tab.</span>
        </div>
      ) : (
        <>
          {/* Totals */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-blue-500" /><span className="text-xs text-foreground/50">Total Hours</span></div>
              <p className="text-lg font-bold">{(d!.totalRegularHours + d!.totalOvertimeHours).toFixed(1)}</p>
              <p className="text-xs text-foreground/40">{d!.totalRegularHours.toFixed(1)} reg + {d!.totalOvertimeHours.toFixed(1)} OT</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-emerald-500" /><span className="text-xs text-foreground/50">Total Wage Cost</span></div>
              <p className="text-lg font-bold text-emerald-700">{fmtGBP(d!.totalCostPence)}</p>
              <p className="text-xs text-foreground/40">{d!.byStaff.length} staff · {d!.timesheetEntries} entries</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs text-foreground/50">Cost Per Hour</span></div>
              <p className="text-lg font-bold">{d!.totalRegularHours + d!.totalOvertimeHours > 0 ? fmtGBP(d!.totalCostPence / (d!.totalRegularHours + d!.totalOvertimeHours)) : "—"}</p>
              <p className="text-xs text-foreground/40">avg across all staff</p>
            </div>
          </div>

          {/* Enterprise breakdown */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30"><h3 className="text-sm font-semibold">Labour Cost by Enterprise — {d!.year}</h3></div>

            {/* Visual bar chart */}
            <div className="px-4 py-3 space-y-2">
              {d!.byEnterprise.map(e => (
                <div key={e.enterprise} className="flex items-center gap-3">
                  <span className="text-sm w-20 text-right text-foreground/70 shrink-0">{e.enterprise}</span>
                  <div className="flex-1 bg-muted/50 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ENTERPRISE_COLOURS[e.enterprise] ?? "bg-slate-400"}`}
                      style={{ width: `${Math.max(e.pctOfTotal, 1)}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono w-24 text-right shrink-0">{fmtGBP(e.totalCostPence)}</span>
                  <span className="text-xs text-foreground/40 w-10 text-right shrink-0">{e.pctOfTotal.toFixed(1)}%</span>
                </div>
              ))}
            </div>

            {/* Detail table */}
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/20 text-foreground/60 text-xs"><th className="px-4 py-2 text-left">Enterprise</th><th className="px-4 py-2 text-right">Reg Hrs</th><th className="px-4 py-2 text-right">OT Hrs</th><th className="px-4 py-2 text-right">Total Hrs</th><th className="px-4 py-2 text-right">Total Cost</th><th className="px-4 py-2 text-right">% of Labour</th></tr></thead>
                <tbody>
                  {d!.byEnterprise.map(e => (
                    <tr key={e.enterprise} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-4 py-2 flex items-center gap-2">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${ENTERPRISE_COLOURS[e.enterprise] ?? "bg-slate-400"}`} />
                        {e.enterprise}
                      </td>
                      <td className="px-4 py-2 text-right">{e.regularHours.toFixed(1)}</td>
                      <td className="px-4 py-2 text-right">{e.overtimeHours.toFixed(1)}</td>
                      <td className="px-4 py-2 text-right font-medium">{e.totalHours.toFixed(1)}</td>
                      <td className="px-4 py-2 text-right font-semibold">{fmtGBP(e.totalCostPence)}</td>
                      <td className="px-4 py-2 text-right text-foreground/60">{e.pctOfTotal.toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border font-semibold bg-muted/20">
                    <td className="px-4 py-2">Total</td>
                    <td className="px-4 py-2 text-right">{d!.totalRegularHours.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right">{d!.totalOvertimeHours.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right">{(d!.totalRegularHours + d!.totalOvertimeHours).toFixed(1)}</td>
                    <td className="px-4 py-2 text-right">{fmtGBP(d!.totalCostPence)}</td>
                    <td className="px-4 py-2 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">
              Enterprise allocation is based on task type from timesheet entries. Costs are zero for staff without hourly rates set — configure rates in Labour → Pay Summary. Contractor costs from Financial are not included here.
            </div>
          </div>

          {/* Staff breakdown (collapsible) */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted/30 transition-colors" onClick={() => setShowStaff(v => !v)}>
              <span>Staff Cost Breakdown ({d!.byStaff.length} staff members)</span>
              {showStaff ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showStaff && (
              <div className="overflow-x-auto border-t border-border">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/20 text-foreground/60 text-xs"><th className="px-4 py-2 text-left">Staff Member</th><th className="px-4 py-2 text-right">Reg Hrs</th><th className="px-4 py-2 text-right">OT Hrs</th><th className="px-4 py-2 text-right">Rate</th><th className="px-4 py-2 text-right">Total Cost</th></tr></thead>
                  <tbody>
                    {d!.byStaff.map(s => (
                      <tr key={s.staffName} className="border-t border-border/40 hover:bg-muted/20">
                        <td className="px-4 py-2 font-medium">{s.staffName}</td>
                        <td className="px-4 py-2 text-right">{s.regularHours.toFixed(1)}</td>
                        <td className="px-4 py-2 text-right">{s.overtimeHours.toFixed(1)}</td>
                        <td className="px-4 py-2 text-right text-foreground/60 text-xs">{s.regularRatePence != null ? fmtGBP(s.regularRatePence) + "/hr" : "No rate set"}</td>
                        <td className="px-4 py-2 text-right font-semibold">{s.totalCostPence > 0 ? fmtGBP(s.totalCostPence) : <span className="text-foreground/30">—</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
