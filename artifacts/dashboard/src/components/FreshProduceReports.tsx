import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { TrendingUp, Printer, ChevronDown, ChevronUp, Leaf, Package } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";

interface HarvestRecord {
  id: number; harvestDate: string; harvestBatchRef: string; quantityKg: string;
  gradeA: string; gradeB: string; preHarvestInterval: string; destination: string;
  cropName?: string; blockId?: number;
}

interface Crop {
  id: number; cropName: string; variety: string; sowingDate: string;
  expectedHarvestDate: string; growingMethod: string; status: string; blockId: number;
}

interface IntakeRecord {
  id: number; intakeDate: string; productName: string; quantityKg: string;
  intakeTemperatureC: string; harvestRecordId: number | null;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function monthLabel(m: string) {
  return new Date(m + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

const PRINT_ID = "fresh-produce-reports-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{visibility:hidden!important}#${PRINT_ID}{visibility:visible!important;display:block!important;position:fixed!important;inset:0!important;overflow:auto!important;background:#fff!important;z-index:99999!important;padding:24px!important}#${PRINT_ID} *{visibility:visible!important}.no-print{display:none!important;visibility:hidden!important}table{page-break-inside:auto}tr{page-break-inside:avoid}}`;
  document.head.appendChild(s);
}

function Collapsible({ title, open, setOpen, children }: { title: string; open: boolean; setOpen: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted/30 transition-colors" onClick={() => setOpen(!open)}>
        <span>{title}</span>{open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="overflow-x-auto border-t border-border">{children}</div>}
    </div>
  );
}

function KpiCard({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: "emerald" | "amber" | "blue" }) {
  const cls = highlight === "emerald" ? "border-emerald-200 bg-emerald-50/50" : highlight === "amber" ? "border-amber-200 bg-amber-50/50" : highlight === "blue" ? "border-blue-200 bg-blue-50/50" : "border-border bg-card";
  const vCls = highlight === "emerald" ? "text-emerald-700" : highlight === "amber" ? "text-amber-700" : highlight === "blue" ? "text-blue-700" : "";
  return (
    <div className={`rounded-xl border p-3 ${cls}`}>
      <p className="text-xs text-foreground/50 mb-1">{label}</p>
      <p className={`text-lg font-bold ${vCls}`}>{value}</p>
      <p className="text-xs text-foreground/40 mt-0.5">{sub}</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === "number" ? `${p.value.toLocaleString("en-GB")} kg` : p.value}</p>
      ))}
    </div>
  );
};

export function FreshProduceReports({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = usePersistedNumberFilter({ page: "fresh-produce-reports", filter: "year", farmId, defaultValue: currentYear });
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (s: string) => setOpenSection(v => v === s ? null : s);

  const { data: harvestRaw, isLoading: harvestLoading } = useQuery({
    queryKey: ["horti-harvest", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/horticulture-harvest-records`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const { data: cropsRaw } = useQuery({
    queryKey: ["horti-crops", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/horticulture-crops`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const { data: intakeRaw } = useQuery({
    queryKey: ["fp-intake", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fresh-produce-intake`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const allHarvest: HarvestRecord[] = useMemo(() => (Array.isArray(harvestRaw) ? harvestRaw : (harvestRaw?.records ?? [])), [harvestRaw]);
  const allCrops: Crop[] = useMemo(() => (Array.isArray(cropsRaw) ? cropsRaw : (cropsRaw?.records ?? [])), [cropsRaw]);
  const allIntake: IntakeRecord[] = useMemo(() => (Array.isArray(intakeRaw) ? intakeRaw : (intakeRaw?.records ?? [])), [intakeRaw]);

  const years = useMemo(() => {
    const s = new Set<number>();
    allHarvest.forEach(r => { const y = parseInt(String(r.harvestDate ?? "").slice(0, 4)); if (y) s.add(y); });
    allIntake.forEach(r => { const y = parseInt(String(r.intakeDate ?? "").slice(0, 4)); if (y) s.add(y); });
    if (!s.size) s.add(currentYear);
    return Array.from(s).sort((a, b) => b - a);
  }, [allHarvest, allIntake, currentYear]);

  const harvest = useMemo(() => allHarvest.filter(r => String(r.harvestDate ?? "").startsWith(String(year))), [allHarvest, year]);
  const intake = useMemo(() => allIntake.filter(r => String(r.intakeDate ?? "").startsWith(String(year))), [allIntake, year]);

  const totalHarvestKg = useMemo(() => harvest.reduce((s, r) => s + (parseFloat(String(r.quantityKg)) || 0), 0), [harvest]);
  const totalGradeAKg = useMemo(() => harvest.reduce((s, r) => s + (parseFloat(String(r.gradeA)) || 0), 0), [harvest]);
  const totalGradeBKg = useMemo(() => harvest.reduce((s, r) => s + (parseFloat(String(r.gradeB)) || 0), 0), [harvest]);
  const gradeAPct = totalHarvestKg > 0 ? (totalGradeAKg / totalHarvestKg) * 100 : null;
  const gradeBPct = totalHarvestKg > 0 ? (totalGradeBKg / totalHarvestKg) * 100 : null;
  const phiFails = harvest.filter(r => r.preHarvestInterval && parseInt(String(r.preHarvestInterval)) === 0).length;

  const monthlyChart = useMemo(() => {
    const map: Record<string, { totalKg: number; gradeAKg: number; gradeBKg: number }> = {};
    harvest.forEach(r => {
      const m = String(r.harvestDate ?? "").slice(0, 7); if (!m || m.length < 7) return;
      if (!map[m]) map[m] = { totalKg: 0, gradeAKg: 0, gradeBKg: 0 };
      map[m].totalKg += parseFloat(String(r.quantityKg)) || 0;
      map[m].gradeAKg += parseFloat(String(r.gradeA)) || 0;
      map[m].gradeBKg += parseFloat(String(r.gradeB)) || 0;
    });
    return Object.entries(map).sort().map(([m, v]) => ({
      label: monthLabel(m),
      "Grade A (kg)": Math.round(v.gradeAKg),
      "Grade B (kg)": Math.round(v.gradeBKg),
      "Ungraded (kg)": Math.max(0, Math.round(v.totalKg - v.gradeAKg - v.gradeBKg)),
    }));
  }, [harvest]);

  const cropBreakdown = useMemo(() => {
    const map: Record<string, { totalKg: number; gradeAKg: number; batches: number }> = {};
    harvest.forEach(r => {
      const cropKey = r.cropName || "Unspecified";
      if (!map[cropKey]) map[cropKey] = { totalKg: 0, gradeAKg: 0, batches: 0 };
      map[cropKey].totalKg += parseFloat(String(r.quantityKg)) || 0;
      map[cropKey].gradeAKg += parseFloat(String(r.gradeA)) || 0;
      map[cropKey].batches++;
    });
    if (Object.keys(map).length === 1 && map["Unspecified"]) {
      const cropsGrouped: Record<string, { totalKg: number; gradeAKg: number; batches: number }> = {};
      allCrops.filter(c => c.status !== "Retired").forEach(c => {
        const k = c.cropName + (c.variety ? ` — ${c.variety}` : "");
        cropsGrouped[k] = { totalKg: 0, gradeAKg: 0, batches: 0 };
      });
      if (Object.keys(cropsGrouped).length > 0) return Object.entries(cropsGrouped).map(([crop, v]) => ({ crop, ...v }));
    }
    return Object.entries(map).sort((a, b) => b[1].totalKg - a[1].totalKg).map(([crop, v]) => ({ crop, ...v }));
  }, [harvest, allCrops]);

  const intakeTempIssues = useMemo(() => intake.filter(r => {
    const t = parseFloat(String(r.intakeTemperatureC));
    return !isNaN(t) && t > 8;
  }).length, [intake]);

  const intakeTotalKg = useMemo(() => intake.reduce((s, r) => s + (parseFloat(String(r.quantityKg)) || 0), 0), [intake]);

  const hasData = harvest.length > 0 || intake.length > 0;

  return (
    <div id={PRINT_ID} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Fresh Produce Season Report</h2>
          <p className="text-sm text-foreground/50">Harvest yield · Grade split · Crop breakdown · Intake quality</p>
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

      {harvestLoading ? (
        <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>
      ) : !hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No harvest or intake records found for {year}. Log harvest batches in the Harvest tab to generate this report.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Harvest Batches" value={String(harvest.length)} sub={`${totalHarvestKg > 0 ? `${totalHarvestKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg total` : "No weights"}`} />
            <KpiCard label="Grade A Yield" value={gradeAPct != null ? `${gradeAPct.toFixed(1)}%` : totalGradeAKg > 0 ? `${totalGradeAKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "—"} sub={totalGradeAKg > 0 ? `${totalGradeAKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "Not recorded"} highlight={gradeAPct != null && gradeAPct >= 80 ? "emerald" : gradeAPct != null && gradeAPct >= 65 ? "amber" : undefined} />
            <KpiCard label="Grade B Yield" value={gradeBPct != null ? `${gradeBPct.toFixed(1)}%` : totalGradeBKg > 0 ? `${totalGradeBKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "—"} sub={totalGradeBKg > 0 ? `${totalGradeBKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "Not recorded"} />
            <KpiCard label="Intake Records" value={String(intake.length)} sub={intakeTotalKg > 0 ? `${intakeTotalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg intake` : "No intake weights"} highlight={intakeTempIssues > 0 ? "amber" : undefined} />
          </div>

          {phiFails > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
              <span className="font-semibold">⚠ PHI Alert:</span>
              <span>{phiFails} harvest batch{phiFails > 1 ? "es" : ""} recorded with PHI of 0 days — verify pre-harvest intervals are compliant before despatch.</span>
            </div>
          )}

          {intakeTempIssues > 0 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50/50 px-4 py-3 text-sm text-orange-800 flex items-center gap-2">
              <span className="font-semibold">⚠ Temperature Alert:</span>
              <span>{intakeTempIssues} intake record{intakeTempIssues > 1 ? "s" : ""} above 8°C — review cold chain compliance for affected batches.</span>
            </div>
          )}

          {monthlyChart.length > 1 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Monthly Harvest Volume by Grade — {year}</h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthlyChart} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} width={52} tickFormatter={v => `${v.toLocaleString("en-GB")} kg`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Grade A (kg)" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={40} stackId="a" />
                    <Bar dataKey="Grade B (kg)" fill="#f59e0b" radius={[0, 0, 0, 0]} maxBarSize={40} stackId="a" />
                    <Bar dataKey="Ungraded (kg)" fill="#94a3b8" radius={[0, 0, 3, 3]} maxBarSize={40} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Yield Summary — {year}</h3>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/20 text-foreground/60 text-xs"><th className="px-4 py-2 text-left">Grade</th><th className="px-4 py-2 text-right">Quantity (kg)</th><th className="px-4 py-2 text-right">% of Harvest</th></tr></thead>
                <tbody>
                  {[
                    { label: "Grade A", kg: totalGradeAKg, highlight: "emerald" as const },
                    { label: "Grade B", kg: totalGradeBKg, highlight: "amber" as const },
                    ...(totalHarvestKg - totalGradeAKg - totalGradeBKg > 1 ? [{ label: "Ungraded / Other", kg: totalHarvestKg - totalGradeAKg - totalGradeBKg, highlight: undefined }] : []),
                    { label: "Total Harvested", kg: totalHarvestKg, bold: true },
                  ].map((row, i) => (
                    <tr key={i} className={`border-t border-border/40 ${(row as any).bold ? "bg-muted/20 font-semibold" : ""}`}>
                      <td className={`px-4 py-2 ${(row as any).highlight === "emerald" ? "text-emerald-700" : (row as any).highlight === "amber" ? "text-amber-700" : ""}`}>{row.label}</td>
                      <td className="px-4 py-2 text-right">{row.kg > 0 ? row.kg.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : "—"}</td>
                      <td className="px-4 py-2 text-right text-foreground/50">{totalHarvestKg > 0 && row.kg > 0 ? `${((row.kg / totalHarvestKg) * 100).toFixed(1)}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Crop Register — {year}</h3>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/20 text-foreground/60 text-xs"><th className="px-4 py-2 text-left">Crop / Variety</th><th className="px-4 py-2 text-right">Batches</th><th className="px-4 py-2 text-right">Yield (kg)</th><th className="px-4 py-2 text-right">Grade A</th></tr></thead>
                <tbody>
                  {cropBreakdown.length === 0 ? (
                    <tr><td className="px-4 py-4 text-center text-foreground/40 text-xs" colSpan={4}>No crop breakdown available</td></tr>
                  ) : cropBreakdown.map((row, i) => (
                    <tr key={i} className="border-t border-border/40">
                      <td className="px-4 py-2 font-medium">{row.crop}</td>
                      <td className="px-4 py-2 text-right">{row.batches}</td>
                      <td className="px-4 py-2 text-right">{row.totalKg > 0 ? row.totalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : "—"}</td>
                      <td className="px-4 py-2 text-right text-foreground/50">{row.totalKg > 0 && row.gradeAKg > 0 ? `${((row.gradeAKg / row.totalKg) * 100).toFixed(1)}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {allCrops.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Active Crops — Sowing &amp; Harvest Schedule</h3>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/20 text-foreground/60 text-xs">
                  <th className="px-4 py-2 text-left">Crop</th><th className="px-4 py-2 text-left">Variety</th>
                  <th className="px-4 py-2 text-left">Method</th><th className="px-4 py-2 text-left">Sown</th>
                  <th className="px-4 py-2 text-left">Expected Harvest</th><th className="px-4 py-2 text-left">Status</th>
                </tr></thead>
                <tbody>
                  {allCrops.filter(c => c.status !== "Retired").map(c => (
                    <tr key={c.id} className="border-t border-border/40">
                      <td className="px-4 py-2 font-medium">{c.cropName}</td>
                      <td className="px-4 py-2">{c.variety || "—"}</td>
                      <td className="px-4 py-2 text-xs">{c.growingMethod || "—"}</td>
                      <td className="px-4 py-2">{fmtDate(c.sowingDate)}</td>
                      <td className="px-4 py-2">{fmtDate(c.expectedHarvestDate)}</td>
                      <td className="px-4 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${c.status === "Harvested" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : c.status === "Growing" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-border bg-muted/30"}`}>{c.status || "—"}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Collapsible
            title={`Harvest Batches (${harvest.length} · ${totalHarvestKg > 0 ? `${totalHarvestKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "no weights"})`}
            open={openSection === "harvest"} setOpen={v => toggle(v ? "harvest" : "")}
          >
            <table className="w-full text-xs">
              <thead><tr className="bg-muted/20 text-foreground/60">
                <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Batch Ref</th>
                <th className="px-3 py-2 text-right">Total (kg)</th><th className="px-3 py-2 text-right">Grade A</th>
                <th className="px-3 py-2 text-right">Grade B</th><th className="px-3 py-2 text-right">PHI (days)</th>
                <th className="px-3 py-2 text-left">Destination</th>
              </tr></thead>
              <tbody>
                {harvest.map(r => (
                  <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="px-3 py-1.5">{fmtDate(r.harvestDate)}</td>
                    <td className="px-3 py-1.5 font-medium">{r.harvestBatchRef || "—"}</td>
                    <td className="px-3 py-1.5 text-right">{r.quantityKg ? parseFloat(String(r.quantityKg)).toLocaleString("en-GB") : "—"}</td>
                    <td className="px-3 py-1.5 text-right text-emerald-700">{r.gradeA ? parseFloat(String(r.gradeA)).toLocaleString("en-GB") : "—"}</td>
                    <td className="px-3 py-1.5 text-right text-amber-700">{r.gradeB ? parseFloat(String(r.gradeB)).toLocaleString("en-GB") : "—"}</td>
                    <td className={`px-3 py-1.5 text-right ${r.preHarvestInterval === "0" ? "text-red-600 font-medium" : ""}`}>{r.preHarvestInterval ?? "—"}</td>
                    <td className="px-3 py-1.5">{r.destination || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Collapsible>

          {intake.length > 0 && (
            <Collapsible
              title={`Intake Records (${intake.length} · ${intakeTotalKg > 0 ? `${intakeTotalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "no weights"}${intakeTempIssues > 0 ? ` · ⚠ ${intakeTempIssues} temp issue${intakeTempIssues > 1 ? "s" : ""}` : ""})`}
              open={openSection === "intake"} setOpen={v => toggle(v ? "intake" : "")}
            >
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60">
                  <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-right">Qty (kg)</th><th className="px-3 py-2 text-right">Temp (°C)</th>
                </tr></thead>
                <tbody>
                  {intake.map(r => {
                    const tempVal = parseFloat(String(r.intakeTemperatureC));
                    const tempHigh = !isNaN(tempVal) && tempVal > 8;
                    return (
                      <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                        <td className="px-3 py-1.5">{fmtDate(r.intakeDate)}</td>
                        <td className="px-3 py-1.5">{r.productName || "—"}</td>
                        <td className="px-3 py-1.5 text-right">{r.quantityKg ? parseFloat(String(r.quantityKg)).toLocaleString("en-GB") : "—"}</td>
                        <td className={`px-3 py-1.5 text-right ${tempHigh ? "text-orange-600 font-medium" : ""}`}>{r.intakeTemperatureC ? `${r.intakeTemperatureC}°C${tempHigh ? " ⚠" : ""}` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Collapsible>
          )}

          <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-foreground/50 flex items-start gap-2">
            <Leaf className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Selling prices and input costs (seeds, spray programme, labour) are not captured in harvest records. Add revenue and variable costs via the <strong>Financial</strong> module for a full enterprise gross margin.</span>
          </div>
        </>
      )}
    </div>
  );
}
