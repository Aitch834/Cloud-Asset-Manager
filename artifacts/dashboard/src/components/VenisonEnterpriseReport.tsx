import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Printer, ChevronDown, ChevronUp, Target } from "lucide-react";
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from "recharts";

interface CullRecord {
  id: number; cullDate: string; species: string; sex: string; ageClass: string;
  stalkerName: string; locationBeat: string; carcassWeightKg: string;
  liveweightKg: string; killoutPercent: string; cullReason: string;
  foodSafetyInspectionResult: string; notifiableDiseaseSupect: boolean;
}

interface SaleRecord {
  id: number; saleDate: string; species: string; numberCarcasses: number;
  totalWeightKg: string; totalValueGbp: number; pricePerKgGbp: string;
  destinationType: string; buyerName: string; gradeOrQuality: string;
}

function fmtGbp(v: number) {
  return `£${Number(v).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function monthLabel(m: string) {
  return new Date(m + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}

function isStag(sex: string) { return /stag|buck/i.test(sex ?? ""); }
function isHind(sex: string) { return /hind|doe/i.test(sex ?? ""); }

const PRINT_ID = "venison-enterprise-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
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

function KpiCard({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: "emerald" | "red" | "amber" }) {
  const cls = highlight === "emerald" ? "border-emerald-200 bg-emerald-50/50" : highlight === "red" ? "border-red-200 bg-red-50/50" : highlight === "amber" ? "border-amber-200 bg-amber-50/50" : "border-border bg-card";
  const vCls = highlight === "emerald" ? "text-emerald-700" : highlight === "red" ? "text-red-600" : highlight === "amber" ? "text-amber-700" : "";
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
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.name.toLowerCase().includes("kg") ? `${p.value.toLocaleString("en-GB")} kg` : typeof p.value === "number" ? p.value.toLocaleString("en-GB") : p.value}
        </p>
      ))}
    </div>
  );
};

export function VenisonEnterpriseReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (s: string) => setOpenSection(v => v === s ? null : s);

  const { data: cullRaw, isLoading: cullLoading } = useQuery({
    queryKey: ["venison-cull", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/venison-cull-records`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const { data: salesRaw, isLoading: salesLoading } = useQuery({
    queryKey: ["venison-sales", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/venison-carcass-sales`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const allCull: CullRecord[] = useMemo(() => (Array.isArray(cullRaw) ? cullRaw : (cullRaw?.records ?? [])), [cullRaw]);
  const allSales: SaleRecord[] = useMemo(() => (Array.isArray(salesRaw) ? salesRaw : (salesRaw?.records ?? [])), [salesRaw]);

  const years = useMemo(() => {
    const s = new Set<number>();
    allCull.forEach(r => { const y = parseInt(String(r.cullDate ?? "").slice(0, 4)); if (y) s.add(y); });
    allSales.forEach(r => { const y = parseInt(String(r.saleDate ?? "").slice(0, 4)); if (y) s.add(y); });
    if (!s.size) s.add(currentYear);
    return Array.from(s).sort((a, b) => b - a);
  }, [allCull, allSales, currentYear]);

  const cull = useMemo(() => allCull.filter(r => String(r.cullDate ?? "").startsWith(String(year))), [allCull, year]);
  const sales = useMemo(() => allSales.filter(r => String(r.saleDate ?? "").startsWith(String(year))), [allSales, year]);

  const totalCullCarcassKg = useMemo(() => cull.reduce((s, r) => s + (parseFloat(String(r.carcassWeightKg)) || 0), 0), [cull]);
  const totalSalesValueGbp = useMemo(() => sales.reduce((s, r) => s + (Number(r.totalValueGbp) || 0), 0), [sales]);
  const totalCarcassesSold = useMemo(() => sales.reduce((s, r) => s + (Number(r.numberCarcasses) || 0), 0), [sales]);
  const avgKillout = useMemo(() => {
    const valid = cull.filter(r => r.killoutPercent);
    return valid.length ? valid.reduce((s, r) => s + (parseFloat(String(r.killoutPercent)) || 0), 0) / valid.length : null;
  }, [cull]);

  const stagCull = useMemo(() => cull.filter(r => isStag(r.sex)), [cull]);
  const hindCull = useMemo(() => cull.filter(r => isHind(r.sex)), [cull]);
  const otherCull = useMemo(() => cull.filter(r => !isStag(r.sex) && !isHind(r.sex)), [cull]);

  const stagKg = useMemo(() => stagCull.reduce((s, r) => s + (parseFloat(String(r.carcassWeightKg)) || 0), 0), [stagCull]);
  const hindKg = useMemo(() => hindCull.reduce((s, r) => s + (parseFloat(String(r.carcassWeightKg)) || 0), 0), [hindCull]);

  const monthlyChart = useMemo(() => {
    const map: Record<string, { cullCount: number; carcassKg: number; salesValue: number }> = {};
    cull.forEach(r => {
      const m = String(r.cullDate ?? "").slice(0, 7); if (!m || m.length < 7) return;
      if (!map[m]) map[m] = { cullCount: 0, carcassKg: 0, salesValue: 0 };
      map[m].cullCount++;
      map[m].carcassKg += parseFloat(String(r.carcassWeightKg)) || 0;
    });
    sales.forEach(r => {
      const m = String(r.saleDate ?? "").slice(0, 7); if (!m || m.length < 7) return;
      if (!map[m]) map[m] = { cullCount: 0, carcassKg: 0, salesValue: 0 };
      map[m].salesValue += Number(r.totalValueGbp) || 0;
    });
    return Object.entries(map).sort().map(([m, v]) => ({
      label: monthLabel(m),
      "Culls": v.cullCount,
      "Carcass (kg)": Math.round(v.carcassKg),
      "Sales Value (£)": parseFloat(v.salesValue.toFixed(2)),
    }));
  }, [cull, sales]);

  const speciesBreakdown = useMemo(() => {
    const map: Record<string, { culls: number; kgTotal: number }> = {};
    cull.forEach(r => {
      const sp = r.species || "Unknown";
      if (!map[sp]) map[sp] = { culls: 0, kgTotal: 0 };
      map[sp].culls++;
      map[sp].kgTotal += parseFloat(String(r.carcassWeightKg)) || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].culls - a[1].culls).map(([species, v]) => ({ species, ...v }));
  }, [cull]);

  const isLoading = cullLoading || salesLoading;
  const hasData = cull.length > 0 || sales.length > 0;

  return (
    <div id={PRINT_ID} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Venison Enterprise Report</h2>
          <p className="text-sm text-foreground/50">Cull summary · Stalking season split · Carcass sales & revenue</p>
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

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>
      ) : !hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No cull or sale records found for {year}. Add cull records and carcass sales to generate this report.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Total Culls" value={String(cull.length)} sub={`${totalCullCarcassKg > 0 ? `${totalCullCarcassKg.toFixed(1)} kg total carcass` : "No weights recorded"}`} />
            <KpiCard label="Stag / Buck" value={String(stagCull.length)} sub={stagKg > 0 ? `${stagKg.toFixed(1)} kg carcass` : "—"} highlight="amber" />
            <KpiCard label="Hind / Doe" value={String(hindCull.length)} sub={hindKg > 0 ? `${hindKg.toFixed(1)} kg carcass` : "—"} />
            <KpiCard label="Avg Kill-out %" value={avgKillout != null ? `${avgKillout.toFixed(1)}%` : "—"} sub={avgKillout != null ? (avgKillout >= 55 ? "Good yield" : avgKillout >= 50 ? "Average" : "Below target") : "No data"} highlight={avgKillout != null && avgKillout >= 55 ? "emerald" : undefined} />
          </div>

          {totalSalesValueGbp > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <KpiCard label="Carcass Sales" value={String(sales.length)} sub={`${totalCarcassesSold} carcasses sold`} />
              <KpiCard label="Total Revenue" value={fmtGbp(totalSalesValueGbp)} sub={totalCarcassesSold > 0 ? `${fmtGbp(totalSalesValueGbp / totalCarcassesSold)}/carcass avg` : "—"} highlight="emerald" />
              <KpiCard
                label="Revenue / kg (carcass)"
                value={totalCullCarcassKg > 0 ? `${fmtGbp(totalSalesValueGbp / totalCullCarcassKg)}/kg` : "—"}
                sub="sales value ÷ total carcass kg culled"
              />
            </div>
          )}

          {monthlyChart.length > 1 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Monthly Cull Volume & Revenue — {year}</h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={monthlyChart} margin={{ top: 4, right: 12, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} width={40} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} width={55} tickFormatter={v => `£${v.toFixed(0)}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar yAxisId="left" dataKey="Culls" fill="#15803d" radius={[3, 3, 0, 0]} maxBarSize={40} />
                    <Bar yAxisId="left" dataKey="Carcass (kg)" fill="#92400e" radius={[3, 3, 0, 0]} maxBarSize={40} />
                    <Line yAxisId="right" type="monotone" dataKey="Sales Value (£)" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Stalking Season Split — {year}</h3>
                <p className="text-xs text-foreground/40 mt-0.5">Stag/Buck vs Hind/Doe cull breakdown</p>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/20 text-foreground/60 text-xs"><th className="px-4 py-2 text-left">Class</th><th className="px-4 py-2 text-right">Culls</th><th className="px-4 py-2 text-right">Carcass (kg)</th><th className="px-4 py-2 text-right">Avg Wt (kg)</th></tr></thead>
                <tbody>
                  {[
                    { label: "Stag / Buck", culls: stagCull, kg: stagKg, cls: "text-amber-700" },
                    { label: "Hind / Doe", culls: hindCull, kg: hindKg, cls: "" },
                    ...(otherCull.length > 0 ? [{ label: "Other / Unknown", culls: otherCull, kg: otherCull.reduce((s, r) => s + (parseFloat(String(r.carcassWeightKg)) || 0), 0), cls: "text-foreground/40" }] : []),
                    { label: "Total", culls: cull, kg: totalCullCarcassKg, cls: "font-semibold", bold: true },
                  ].map((row, i) => (
                    <tr key={i} className={`border-t border-border/40 ${(row as any).bold ? "bg-muted/20 font-semibold" : ""}`}>
                      <td className={`px-4 py-2 ${row.cls}`}>{row.label}</td>
                      <td className="px-4 py-2 text-right">{row.culls.length}</td>
                      <td className="px-4 py-2 text-right">{row.kg > 0 ? row.kg.toFixed(1) : "—"}</td>
                      <td className="px-4 py-2 text-right text-foreground/50">
                        {row.culls.length > 0 && row.kg > 0 ? `${(row.kg / row.culls.length).toFixed(1)} kg` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {speciesBreakdown.length > 0 && (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/30">
                  <h3 className="text-sm font-semibold">Cull by Species — {year}</h3>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="bg-muted/20 text-foreground/60 text-xs"><th className="px-4 py-2 text-left">Species</th><th className="px-4 py-2 text-right">Culls</th><th className="px-4 py-2 text-right">Carcass (kg)</th><th className="px-4 py-2 text-right">Avg (kg)</th></tr></thead>
                  <tbody>
                    {speciesBreakdown.map((row, i) => (
                      <tr key={i} className="border-t border-border/40">
                        <td className="px-4 py-2 font-medium">{row.species}</td>
                        <td className="px-4 py-2 text-right">{row.culls}</td>
                        <td className="px-4 py-2 text-right">{row.kgTotal > 0 ? row.kgTotal.toFixed(1) : "—"}</td>
                        <td className="px-4 py-2 text-right text-foreground/50">{row.culls > 0 && row.kgTotal > 0 ? `${(row.kgTotal / row.culls).toFixed(1)}` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {sales.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Carcass Sales Summary — {year}</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/20 text-foreground/60 text-xs">
                    <th className="px-4 py-2 text-left">Item</th><th className="px-4 py-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/40"><td className="px-4 py-2">Sale records</td><td className="px-4 py-2 text-right">{sales.length}</td></tr>
                  <tr className="border-t border-border/40"><td className="px-4 py-2">Total carcasses sold</td><td className="px-4 py-2 text-right">{totalCarcassesSold}</td></tr>
                  <tr className="border-t border-border/40"><td className="px-4 py-2">Total weight sold (kg)</td><td className="px-4 py-2 text-right">{sales.reduce((s, r) => s + (parseFloat(String(r.totalWeightKg)) || 0), 0).toFixed(1)} kg</td></tr>
                  <tr className="border-t border-border/40"><td className="px-4 py-2 font-semibold">Total sales revenue</td><td className="px-4 py-2 text-right font-bold text-emerald-700">{fmtGbp(totalSalesValueGbp)}</td></tr>
                </tbody>
              </table>
              <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">
                Stalker fees, larder processing, transport, and vet costs should be added via Financial for a complete P&amp;L.
              </div>
            </div>
          )}

          <Collapsible
            title={`Cull Records (${cull.length} culls · ${totalCullCarcassKg > 0 ? `${totalCullCarcassKg.toFixed(1)} kg carcass` : "no weights"})`}
            open={openSection === "cull"} setOpen={v => toggle(v ? "cull" : "")}
          >
            <table className="w-full text-xs">
              <thead><tr className="bg-muted/20 text-foreground/60">
                <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Stalker</th>
                <th className="px-3 py-2 text-left">Species</th><th className="px-3 py-2 text-left">Sex</th>
                <th className="px-3 py-2 text-left">Age Class</th><th className="px-3 py-2 text-right">Carcass (kg)</th>
                <th className="px-3 py-2 text-right">Kill-out %</th><th className="px-3 py-2 text-left">Food Safety</th>
              </tr></thead>
              <tbody>
                {cull.map(r => (
                  <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                    <td className="px-3 py-1.5">{fmtDate(r.cullDate)}</td>
                    <td className="px-3 py-1.5">{r.stalkerName || "—"}</td>
                    <td className="px-3 py-1.5 font-medium">{r.species || "—"}</td>
                    <td className="px-3 py-1.5">{r.sex || "—"}</td>
                    <td className="px-3 py-1.5">{r.ageClass || "—"}</td>
                    <td className="px-3 py-1.5 text-right">{r.carcassWeightKg ? `${parseFloat(String(r.carcassWeightKg)).toFixed(1)}` : "—"}</td>
                    <td className="px-3 py-1.5 text-right">{r.killoutPercent ? `${r.killoutPercent}%` : "—"}</td>
                    <td className="px-3 py-1.5 text-xs max-w-[160px] truncate">{String(r.foodSafetyInspectionResult || "—").split("—")[0].trim() || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Collapsible>

          {sales.length > 0 && (
            <Collapsible
              title={`Sale Records (${sales.length} · ${totalCarcassesSold} carcasses · ${fmtGbp(totalSalesValueGbp)})`}
              open={openSection === "sales"} setOpen={v => toggle(v ? "sales" : "")}
            >
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60">
                  <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Species</th>
                  <th className="px-3 py-2 text-right">Carcasses</th><th className="px-3 py-2 text-right">Weight (kg)</th>
                  <th className="px-3 py-2 text-right">p/kg</th><th className="px-3 py-2 text-left">Destination</th>
                  <th className="px-3 py-2 text-right">Value</th>
                </tr></thead>
                <tbody>
                  {sales.map(r => (
                    <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{fmtDate(r.saleDate)}</td>
                      <td className="px-3 py-1.5">{r.species || "—"}</td>
                      <td className="px-3 py-1.5 text-right">{r.numberCarcasses ?? "—"}</td>
                      <td className="px-3 py-1.5 text-right">{r.totalWeightKg ? `${parseFloat(String(r.totalWeightKg)).toFixed(1)}` : "—"}</td>
                      <td className="px-3 py-1.5 text-right">{r.pricePerKgGbp ? `£${parseFloat(String(r.pricePerKgGbp)).toFixed(2)}` : "—"}</td>
                      <td className="px-3 py-1.5">{r.destinationType || "—"}{r.buyerName ? ` — ${r.buyerName}` : ""}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-emerald-700">{r.totalValueGbp ? fmtGbp(Number(r.totalValueGbp)) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Collapsible>
          )}

          <div className="rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-foreground/50 flex items-start gap-2">
            <Target className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Stalker fees, transport, larder processing, and veterinary costs are not tracked in cull/sale records. Add these via the <strong>Financial</strong> module for a complete enterprise P&amp;L.</span>
          </div>
        </>
      )}
    </div>
  );
}
