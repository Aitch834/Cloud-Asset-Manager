import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { api } from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Download, Info, Printer, TrendingDown, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie,
  Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";

type AMRReport = {
  year: number;
  totalUseMg: number;
  mgPerPcu: number;
  criticallyImportantMg: number;
  criticallyImportantPercent: number;
  byClass: { className: string; totalMg: number; percent: number; isCritical: boolean }[];
  bySpecies: { species: string; totalMg: number; treatmentCount: number }[];
  monthlyTrend: { month: string; totalMg: number }[];
  rumaCategory: string; // "green" | "amber" | "red"
  prevYearMgPerPcu: number | null;
};

const RUMA_THRESHOLDS = { green: 50, amber: 99 }; // mg/PCU — indicative
const PIE_COLOURS = ["#3b82f6","#8b5cf6","#ec4899","#f97316","#eab308","#22c55e","#06b6d4","#ef4444"];
const CRITICAL_CLASSES = ["fluoroquinolones", "3rd/4th gen cephalosporins", "carbapenems", "colistin"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function AMRReportPage() {
  const { farmId } = useAppStore();
  const [year, setYear] = useState(currentYear);
  const [tab, setTab] = useState<"summary" | "species" | "trend" | "ruma">("summary");

  const reportQ = useQuery<AMRReport>({
    queryKey: ["farms", farmId, "amr-report", year],
    queryFn: () => api.get(`/farms/${farmId}/amr-report?year=${year}`).then(r => r.report),
    enabled: !!farmId,
  });

  const report = reportQ.data;

  const rumaColour = report?.rumaCategory === "green" ? "text-green-700 bg-green-50 border-green-200"
    : report?.rumaCategory === "amber" ? "text-amber-700 bg-amber-50 border-amber-200"
    : "text-red-700 bg-red-50 border-red-200";

  const trend = report && report.prevYearMgPerPcu != null
    ? report.mgPerPcu - report.prevYearMgPerPcu
    : null;

  return (
    <AppLayout title="Antimicrobial Usage (AMR) Report">
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>RUMA / VMD Reporting</strong> — Annual antibiotic usage calculated from medicine records. Target: reduce usage of Highest Priority Critically Important Antimicrobials (HP-CIAs) to zero.
      </div>

      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Year:</span>
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" />Print Report</Button>
          <Button variant="outline" size="sm"><Download className="w-4 h-4 mr-1" />Export CSV</Button>
        </div>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        {(["summary","species","trend","ruma"] as const).map(t => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>
            {t === "summary" ? "Annual Summary" : t === "species" ? "By Species" : t === "trend" ? "Monthly Trend" : "RUMA Benchmarks"}
          </Button>
        ))}
      </div>

      {reportQ.isLoading ? (
        <p className="text-sm text-muted-foreground">Calculating antibiotic usage for {year}…</p>
      ) : !report || report.totalUseMg === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <Info className="mx-auto mb-2 w-10 h-10 opacity-30" />
          <p className="font-medium">No antibiotic medicine records found for {year}.</p>
          <p className="text-sm mt-1">Records are auto-calculated from entries in the Medicine Register.</p>
        </div>
      ) : (
        <>
          {tab === "summary" && report && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold">{(report.totalUseMg / 1000).toFixed(1)}g</div>
                  <div className="text-xs text-muted-foreground">Total Antibiotic Use</div>
                </div>
                <div className="bg-white border rounded-lg p-4 text-center">
                  <div className={`text-2xl font-bold ${report.mgPerPcu > RUMA_THRESHOLDS.amber ? "text-red-600" : report.mgPerPcu > RUMA_THRESHOLDS.green ? "text-amber-600" : "text-green-600"}`}>
                    {report.mgPerPcu.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">mg/PCU</div>
                  {trend !== null && (
                    <div className={`text-xs flex items-center justify-center gap-1 mt-1 ${trend < 0 ? "text-green-600" : "text-red-600"}`}>
                      {trend < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {Math.abs(trend).toFixed(1)} vs last year
                    </div>
                  )}
                </div>
                <div className={`border rounded-lg p-4 text-center ${rumaColour}`}>
                  <div className="text-2xl font-bold capitalize">{report.rumaCategory}</div>
                  <div className="text-xs">RUMA Category</div>
                </div>
                <div className={`bg-white border rounded-lg p-4 text-center ${report.criticallyImportantMg > 0 ? "border-red-300" : ""}`}>
                  <div className={`text-2xl font-bold ${report.criticallyImportantMg > 0 ? "text-red-600" : "text-green-600"}`}>
                    {report.criticallyImportantMg > 0 ? `${report.criticallyImportantPercent.toFixed(1)}%` : "0%"}
                  </div>
                  <div className="text-xs text-muted-foreground">HP-CIA Usage</div>
                  {report.criticallyImportantMg > 0 && (
                    <div className="text-xs text-red-700 mt-1 flex items-center gap-1 justify-center"><AlertTriangle className="w-3 h-3" />Action needed</div>
                  )}
                </div>
              </div>

              {report.byClass.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="text-sm font-medium mb-3">Usage by Antibiotic Class</div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={report.byClass} layout="vertical">
                      <XAxis type="number" tick={{ fontSize: 11 }} unit="mg" />
                      <YAxis type="category" dataKey="className" tick={{ fontSize: 11 }} width={160} />
                      <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} mg`]} />
                      <Bar dataKey="totalMg" radius={[0, 4, 4, 0]}>
                        {report.byClass.map((c, i) => (
                          <Cell key={i} fill={c.isCritical ? "#ef4444" : "#3b82f6"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />Standard</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" />HP-CIA (critically important)</span>
                  </div>
                </div>
              )}

              {report.byClass.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="text-sm font-medium mb-3">Class Distribution (%)</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={report.byClass} dataKey="percent" nameKey="className" cx="50%" cy="50%" outerRadius={70}>
                        {report.byClass.map((_, i) => <Cell key={i} fill={PIE_COLOURS[i % PIE_COLOURS.length]} />)}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v: any) => [`${Number(v).toFixed(1)}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {tab === "species" && report && (
            <div className="space-y-4">
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Species</th>
                      <th className="px-4 py-2 text-right font-medium">Total Use (mg)</th>
                      <th className="px-4 py-2 text-right font-medium">Treatments</th>
                      <th className="px-4 py-2 text-right font-medium">Avg per Treatment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.bySpecies.map((s, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2">{s.species}</td>
                        <td className="px-4 py-2 text-right">{s.totalMg.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right">{s.treatmentCount}</td>
                        <td className="px-4 py-2 text-right">{s.treatmentCount > 0 ? Math.round(s.totalMg / s.treatmentCount).toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "trend" && report && report.monthlyTrend.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <div className="text-sm font-medium mb-3">Monthly Antibiotic Usage — {year}</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={report.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="mg" />
                  <Tooltip formatter={(v: any) => [`${Number(v).toLocaleString()} mg`]} />
                  <Line type="monotone" dataKey="totalMg" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Usage (mg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {tab === "ruma" && report && (
            <div className="space-y-4">
              <div className={`p-4 border rounded-lg ${rumaColour}`}>
                <div className="font-semibold mb-1">Your RUMA Category: {report.rumaCategory.toUpperCase()}</div>
                <div className="text-sm">mg/PCU: {report.mgPerPcu.toFixed(1)} — {
                  report.rumaCategory === "green" ? "Within responsible use targets." :
                  report.rumaCategory === "amber" ? "Above target — review antibiotic policies with vet." :
                  "Significantly above target — urgent vet review required."
                }</div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm font-semibold mb-3">RUMA Reference Bands</div>
                <div className="space-y-2 text-sm">
                  {[
                    { colour: "bg-green-500", band: "Green", label: `≤${RUMA_THRESHOLDS.green} mg/PCU`, desc: "Responsible use target" },
                    { colour: "bg-amber-400", band: "Amber", label: `${RUMA_THRESHOLDS.green+1}–${RUMA_THRESHOLDS.amber} mg/PCU`, desc: "Above target — review required" },
                    { colour: "bg-red-500", band: "Red", label: `>${RUMA_THRESHOLDS.amber} mg/PCU`, desc: "Significantly above target" },
                  ].map(b => (
                    <div key={b.band} className="flex items-center gap-3">
                      <span className={`${b.colour} w-4 h-4 rounded shrink-0`} />
                      <span className="font-medium">{b.band}</span>
                      <span className="text-muted-foreground">{b.label}</span>
                      <span className="text-muted-foreground">— {b.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <div className="text-sm font-semibold mb-2">Highest Priority Critically Important Antimicrobials (HP-CIAs)</div>
                <div className="text-xs text-muted-foreground mb-2">RUMA target: ZERO use. These classes are reserved for human medicine where no alternative exists.</div>
                <ul className="text-xs space-y-1 list-disc list-inside text-red-800">
                  {CRITICAL_CLASSES.map(c => <li key={c}>{c}</li>)}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
