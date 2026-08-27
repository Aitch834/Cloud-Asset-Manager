import { useQuery } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { useRawFarmName } from "@/hooks/use-farm-name";
import { printElementReport } from "@/lib/print-report";
import { Users, Clock, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend } from "recharts";

interface EnterpriseRow {
  enterprise: string;
  regularHours: number; overtimeHours: number; totalHours: number;
  totalCostPence: number; pctOfTotal: number;
}

interface StaffRow {
  staffName: string;
  regularHours: number; overtimeHours: number; totalHours: number;
  totalCostPence: number; regularRatePence: number | null;
}

interface LabourReportData {
  year: number;
  totalRegularHours: number; totalOvertimeHours: number;
  totalCostPence: number; timesheetEntries: number;
  byEnterprise: EnterpriseRow[];
  byStaff: StaffRow[];
}

function fmtGBP(p: number) { return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

const ENTERPRISE_COLOURS: Record<string, string> = {
  Dairy: "#3b82f6", Beef: "#f97316", Sheep: "#f59e0b", Pigs: "#ec4899",
  Poultry: "#eab308", Arable: "#22c55e", Livestock: "#f97316",
  Machinery: "#64748b", General: "#94a3b8",
};
const ENTERPRISE_CSS: Record<string, string> = {
  Dairy: "bg-blue-500", Beef: "bg-orange-500", Sheep: "bg-amber-400", Pigs: "bg-pink-500",
  Poultry: "bg-yellow-500", Arable: "bg-green-500", Livestock: "bg-orange-400",
  Machinery: "bg-slate-500", General: "bg-gray-400",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }}>{p.name}: {fmtGBP(p.value)} · {p.payload.totalHours?.toFixed(1)} hrs</p>
      ))}
    </div>
  );
};

export function LabourEnterpriseReport({ farmId }: { farmId: number }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const farmName = useRawFarmName(farmId);
  const currentYear = new Date().getFullYear();
  const [year, setYear] = usePersistedNumberFilter({ page: "labour-enterprise-report", filter: "year", farmId, defaultValue: currentYear });
  const [showStaff, setShowStaff] = useState(false);

  const { data, isLoading } = useQuery<LabourReportData>({
    queryKey: ["labour-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/labour-enterprise-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>;

  const d = data;
  const hasData = d && d.timesheetEntries > 0;
  const totalHours = d ? d.totalRegularHours + d.totalOvertimeHours : 0;

  const chartData = (d?.byEnterprise ?? []).map(e => ({
    enterprise: e.enterprise,
    "Wage Cost": e.totalCostPence,
    totalHours: e.totalHours,
    pct: e.pctOfTotal,
  }));

  const staffWithRates = (d?.byStaff ?? []).filter(s => s.regularRatePence != null && s.regularRatePence > 0);
  const staffNoRates = (d?.byStaff ?? []).filter(s => !s.regularRatePence || s.regularRatePence === 0);

  return (
    <div ref={reportRef} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Labour Cost by Enterprise</h2>
          <p className="text-sm text-foreground/50">Hours and wage cost allocated by enterprise from timesheets</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 rounded-lg border border-border bg-background px-3 text-sm" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => printElementReport(reportRef.current, { title: "Labour Enterprise Report", subtitle: `${year} labour analysis`, farmName })} className="h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50">
            <Printer className="w-3.5 h-3.5" />Print
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No timesheet entries found for {year}.<br />
          <span className="text-xs">Record timesheets with task types to see labour costs by enterprise. Set hourly rates in the Labour → Pay Summary tab.</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-blue-500" /><span className="text-xs text-foreground/50">Total Hours</span></div>
              <p className="text-lg font-bold">{totalHours.toFixed(1)}</p>
              <p className="text-xs text-foreground/40">{d!.totalRegularHours.toFixed(1)} reg + {d!.totalOvertimeHours.toFixed(1)} OT · {d!.timesheetEntries} entries</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1"><Users className="w-4 h-4 text-emerald-500" /><span className="text-xs text-foreground/50">Total Wage Cost</span></div>
              <p className="text-lg font-bold text-emerald-700">{fmtGBP(d!.totalCostPence)}</p>
              <p className="text-xs text-foreground/40">{d!.byStaff.length} staff · {staffNoRates.length > 0 ? `${staffNoRates.length} without rates set` : "all rates configured"}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2 mb-1"><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs text-foreground/50">Avg Cost / Hour</span></div>
              <p className="text-lg font-bold">{totalHours > 0 && d!.totalCostPence > 0 ? fmtGBP(d!.totalCostPence / totalHours) : "—"}</p>
              <p className="text-xs text-foreground/40">across all costed hours</p>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Wage Cost by Enterprise — {d!.year}</h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 38 + 60)}>
                  <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 80, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" tickFormatter={v => `£${(v / 100).toFixed(0)}`} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="enterprise" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Wage Cost" radius={[0, 3, 3, 0]} maxBarSize={24}>
                      {chartData.map((e) => (
                        <Cell key={e.enterprise} fill={ENTERPRISE_COLOURS[e.enterprise] ?? "#94a3b8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30"><h3 className="text-sm font-semibold">Enterprise Allocation Detail — {d!.year}</h3></div>
            <div className="px-4 py-3 space-y-2">
              {d!.byEnterprise.map(e => (
                <div key={e.enterprise} className="flex items-center gap-3">
                  <span className="text-sm w-20 text-right text-foreground/70 shrink-0">{e.enterprise}</span>
                  <div className="flex-1 bg-muted/50 rounded-full h-5 overflow-hidden">
                    <div className={`h-full rounded-full ${ENTERPRISE_CSS[e.enterprise] ?? "bg-slate-400"}`} style={{ width: `${Math.max(e.pctOfTotal, 1)}%` }} />
                  </div>
                  <span className="text-sm font-mono w-24 text-right shrink-0">{fmtGBP(e.totalCostPence)}</span>
                  <span className="text-xs text-foreground/40 w-12 text-right shrink-0">{e.pctOfTotal.toFixed(1)}%</span>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto border-t border-border">
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/20 text-foreground/60 text-xs">
                  <th className="px-4 py-2 text-left">Enterprise</th>
                  <th className="px-4 py-2 text-right">Reg Hrs</th><th className="px-4 py-2 text-right">OT Hrs</th>
                  <th className="px-4 py-2 text-right">Total Hrs</th><th className="px-4 py-2 text-right">Wage Cost</th>
                  <th className="px-4 py-2 text-right">Cost/Hr</th><th className="px-4 py-2 text-right">% Labour</th>
                </tr></thead>
                <tbody>
                  {d!.byEnterprise.map(e => (
                    <tr key={e.enterprise} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-4 py-2 flex items-center gap-2">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${ENTERPRISE_CSS[e.enterprise] ?? "bg-slate-400"}`} />
                        {e.enterprise}
                      </td>
                      <td className="px-4 py-2 text-right">{e.regularHours.toFixed(1)}</td>
                      <td className="px-4 py-2 text-right">{e.overtimeHours.toFixed(1)}</td>
                      <td className="px-4 py-2 text-right font-medium">{e.totalHours.toFixed(1)}</td>
                      <td className="px-4 py-2 text-right font-semibold">{fmtGBP(e.totalCostPence)}</td>
                      <td className="px-4 py-2 text-right text-foreground/60 text-xs">{e.totalHours > 0 && e.totalCostPence > 0 ? fmtGBP(e.totalCostPence / e.totalHours) : "—"}</td>
                      <td className="px-4 py-2 text-right text-foreground/60">{e.pctOfTotal.toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border font-semibold bg-muted/20">
                    <td className="px-4 py-2">Total</td>
                    <td className="px-4 py-2 text-right">{d!.totalRegularHours.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right">{d!.totalOvertimeHours.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right">{totalHours.toFixed(1)}</td>
                    <td className="px-4 py-2 text-right">{fmtGBP(d!.totalCostPence)}</td>
                    <td className="px-4 py-2 text-right">{totalHours > 0 && d!.totalCostPence > 0 ? fmtGBP(d!.totalCostPence / totalHours) : "—"}</td>
                    <td className="px-4 py-2 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">
              Enterprise allocation based on task type from timesheet entries. {staffNoRates.length > 0 ? `${staffNoRates.length} staff member(s) have no hourly rate set — their hours are counted but contribute £0 to wage cost. Configure rates in Labour → Pay Summary.` : "All staff have hourly rates configured."} Contractor costs from Financial are not included.
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted/30 transition-colors" onClick={() => setShowStaff(v => !v)}>
              <span>Staff Cost Breakdown ({d!.byStaff.length} staff members)</span>
              {showStaff ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showStaff && (
              <div className="overflow-x-auto border-t border-border">
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/20 text-foreground/60 text-xs">
                    <th className="px-4 py-2 text-left">Staff Member</th>
                    <th className="px-4 py-2 text-right">Reg Hrs</th><th className="px-4 py-2 text-right">OT Hrs</th>
                    <th className="px-4 py-2 text-right">Total Hrs</th><th className="px-4 py-2 text-right">Rate/hr</th>
                    <th className="px-4 py-2 text-right">Wage Cost</th>
                  </tr></thead>
                  <tbody>
                    {d!.byStaff.map(s => (
                      <tr key={s.staffName} className="border-t border-border/40 hover:bg-muted/20">
                        <td className="px-4 py-2 font-medium">{s.staffName}</td>
                        <td className="px-4 py-2 text-right">{s.regularHours.toFixed(1)}</td>
                        <td className="px-4 py-2 text-right">{s.overtimeHours.toFixed(1)}</td>
                        <td className="px-4 py-2 text-right font-medium">{s.totalHours.toFixed(1)}</td>
                        <td className="px-4 py-2 text-right text-foreground/60 text-xs">{s.regularRatePence && s.regularRatePence > 0 ? `${fmtGBP(s.regularRatePence)}/hr` : <span className="text-amber-600">No rate</span>}</td>
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
