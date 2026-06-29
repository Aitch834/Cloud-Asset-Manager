import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface KillRecord { id: number; killDate: string; numberOfHead: number; totalDeadweightKg: string; pricePerKgPence: number; netPaymentPence: number; leanMeatPct: string; averageP2BackfatMm: string; }
interface FeedDelivery { id: number; deliveryDate: string; productName: string; quantityKg: string; costPence: number; }
interface Purchase { id: number; purchaseDate: string; numberOfHead: number; totalAmountPence: number; pricePerHeadPence: number; }

interface PigReportData {
  year: number; totalHeadKilled: number; totalDeadweightKg: number; totalRevenuePence: number;
  totalFeedCostPence: number; totalFeedKg: number; totalPurchaseCostPence: number; totalHeadPurchased: number;
  totalVariableCostPence: number; grossMarginPence: number; grossMarginPerHeadPence: number | null;
  revenuePerKgDwtPence: number | null; variableCostPerKgDwtPence: number | null; feedCostPerKgDwtPence: number | null;
  avgLeanMeatPct: number | null;
  killRecords: KillRecord[]; feedDeliveries: FeedDelivery[]; purchases: Purchase[];
}

const PRINT_ID = "pig-enterprise-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
  document.head.appendChild(s);
}

function fmtGBP(p: number) { return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtPkg(p: number | null) { return p == null ? "—" : `${(p / 100).toFixed(2)}p/kg`; }
function monthLabel(d: string) { return new Date(d.slice(0, 7) + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }); }

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: {fmtGBP(Math.abs(p.value))}</p>)}
    </div>
  );
};

export function PigEnterpriseReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (s: string) => setOpenSection(v => v === s ? null : s);

  const { data, isLoading } = useQuery<PigReportData>({
    queryKey: ["pig-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/pig-enterprise-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>;

  const d = data;
  const hasData = d && (d.totalHeadKilled > 0 || d.totalFeedCostPence > 0 || d.totalPurchaseCostPence > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;

  const chartData = useMemo(() => {
    if (!d) return [];
    const map: Record<string, { revenue: number; feedCost: number; purchases: number }> = {};
    d.killRecords.forEach(r => {
      const m = r.killDate.slice(0, 7);
      if (!map[m]) map[m] = { revenue: 0, feedCost: 0, purchases: 0 };
      map[m].revenue += r.netPaymentPence ?? 0;
    });
    d.feedDeliveries.forEach(f => {
      const m = f.deliveryDate.slice(0, 7);
      if (!map[m]) map[m] = { revenue: 0, feedCost: 0, purchases: 0 };
      map[m].feedCost += f.costPence;
    });
    d.purchases.forEach(p => {
      const m = p.purchaseDate.slice(0, 7);
      if (!map[m]) map[m] = { revenue: 0, feedCost: 0, purchases: 0 };
      map[m].purchases += p.totalAmountPence;
    });
    return Object.entries(map).sort().map(([m, v]) => ({
      label: monthLabel(m),
      "Kill Revenue": v.revenue,
      "Feed Cost": v.feedCost,
      "Purchases": v.purchases,
      "Gross Margin": v.revenue - v.feedCost - v.purchases,
    }));
  }, [d]);

  const avgP2 = d && d.killRecords.filter(r => r.averageP2BackfatMm).length
    ? d.killRecords.reduce((s, r) => s + (parseFloat(String(r.averageP2BackfatMm)) || 0), 0) / d.killRecords.filter(r => r.averageP2BackfatMm).length
    : null;

  return (
    <div id={PRINT_ID} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Pig Enterprise Report</h2>
          <p className="text-sm text-foreground/50">Cost per kg deadweight · Gross margin per head · Carcase quality</p>
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
          No kill records, priced feed deliveries or livestock purchases found for {year}.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Head Killed</span>
              <p className="text-lg font-bold">{d!.totalHeadKilled.toLocaleString("en-GB")}</p>
              <p className="text-xs text-foreground/40">{d!.totalDeadweightKg.toLocaleString("en-GB")} kg dwt{d!.avgLeanMeatPct ? ` · avg LMP ${d!.avgLeanMeatPct.toFixed(1)}%` : ""}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Kill Revenue</span>
              <p className="text-lg font-bold text-emerald-700">{fmtGBP(d!.totalRevenuePence)}</p>
              <p className="text-xs text-foreground/40">{fmtPkg(d!.revenuePerKgDwtPence)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Variable Costs</span>
              <p className="text-lg font-bold">{fmtGBP(d!.totalVariableCostPence)}</p>
              <p className="text-xs text-foreground/40">Feed {fmtGBP(d!.totalFeedCostPence)} · Purchases {fmtGBP(d!.totalPurchaseCostPence)}</p>
            </div>
            <div className={`rounded-xl border p-3 ${marginPositive ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground/50">Gross Margin</span>
                {marginPositive ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
              </div>
              <p className={`text-lg font-bold ${marginPositive ? "text-emerald-700" : "text-red-600"}`}>{fmtGBP(d!.grossMarginPence)}</p>
              <p className="text-xs text-foreground/40">{d!.grossMarginPerHeadPence != null ? `${fmtGBP(d!.grossMarginPerHeadPence)}/head` : "—"}</p>
            </div>
          </div>

          {chartData.length > 1 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Monthly Kill Revenue vs Costs</h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `£${(v / 100).toFixed(0)}`} tick={{ fontSize: 11 }} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Kill Revenue" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="Feed Cost" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="Purchases" fill="#f97316" radius={[3, 3, 0, 0]} maxBarSize={36} />
                    <Line type="monotone" dataKey="Gross Margin" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold">Enterprise P&amp;L Summary — {d!.year}</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-foreground/60 text-xs">
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-right">Per Head</th>
                  <th className="px-4 py-2 text-right">Per kg Dwt</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: `Kill revenue (${d!.killRecords.length} kills · ${d!.totalHeadKilled} head)`, value: d!.totalRevenuePence, positive: true },
                  { label: `Livestock purchases (${d!.totalHeadPurchased} head)`, value: -d!.totalPurchaseCostPence },
                  { label: `Feed cost (${d!.feedDeliveries.length} deliveries · ${d!.totalFeedKg.toLocaleString("en-GB")} kg)`, value: -d!.totalFeedCostPence },
                  { label: "Total variable costs", value: -d!.totalVariableCostPence, bold: true, divider: true },
                  { label: "Gross margin", value: d!.grossMarginPence, bold: true, highlight: marginPositive ? "emerald" as const : "red" as const },
                ].map((row, i) => (
                  <tr key={i} className={`border-t ${(row as any).divider ? "border-t-2 border-border" : "border-border/40"} ${(row as any).highlight === "emerald" ? "bg-emerald-50/30" : (row as any).highlight === "red" ? "bg-red-50/30" : ""}`}>
                    <td className={`px-4 py-2 ${row.bold ? "font-semibold" : ""}`}>{row.label}</td>
                    <td className={`px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${(row as any).highlight === "emerald" ? "text-emerald-700" : (row as any).highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : (row as any).positive ? "text-emerald-700" : ""}`}>
                      {row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value)}
                    </td>
                    <td className="px-4 py-2 text-right text-foreground/50 text-xs">{d!.totalHeadKilled > 0 ? fmtGBP(Math.abs(row.value) / d!.totalHeadKilled) : "—"}</td>
                    <td className="px-4 py-2 text-right text-foreground/50 text-xs">{d!.totalDeadweightKg > 0 ? `${(Math.abs(row.value) / d!.totalDeadweightKg / 100).toFixed(2)}p/kg` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(d!.avgLeanMeatPct != null || avgP2 != null || d!.feedCostPerKgDwtPence != null) && (
              <div className="px-4 py-2 border-t border-border/40 text-xs text-foreground/60 flex flex-wrap gap-4">
                {d!.avgLeanMeatPct != null && <span>Avg lean meat %: <strong>{d!.avgLeanMeatPct.toFixed(1)}%</strong></span>}
                {avgP2 != null && <span>Avg P2 backfat: <strong>{avgP2.toFixed(1)} mm</strong></span>}
                {d!.feedCostPerKgDwtPence != null && <span>Feed cost/kg dwt: <strong>{fmtPkg(d!.feedCostPerKgDwtPence)}</strong></span>}
                {d!.variableCostPerKgDwtPence != null && <span>Variable cost/kg dwt: <strong>{fmtPkg(d!.variableCostPerKgDwtPence)}</strong></span>}
              </div>
            )}
            <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">
              Feed from priced deliveries tagged to pigs/swine. Bedding, haulage, vet, and fixed costs should be added via Financial for a complete P&amp;L.
            </div>
          </div>

          {d!.killRecords.length > 0 && (
            <Collapsible title={`Kill Records (${d!.killRecords.length} · ${d!.totalHeadKilled} head · ${d!.totalDeadweightKg.toLocaleString("en-GB")} kg dwt)`} open={openSection === "kills"} setOpen={v => toggle(v ? "kills" : "")}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60">
                  <th className="px-3 py-2 text-left">Kill Date</th><th className="px-3 py-2 text-right">Head</th>
                  <th className="px-3 py-2 text-right">Deadweight</th><th className="px-3 py-2 text-right">p/kg</th>
                  <th className="px-3 py-2 text-right">LMP %</th><th className="px-3 py-2 text-right">P2 (mm)</th><th className="px-3 py-2 text-right">Net Payment</th>
                </tr></thead>
                <tbody>
                  {d!.killRecords.map(r => (
                    <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{new Date(r.killDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-1.5 text-right">{r.numberOfHead}</td>
                      <td className="px-3 py-1.5 text-right">{r.totalDeadweightKg != null ? `${parseFloat(String(r.totalDeadweightKg)).toFixed(0)} kg` : "—"}</td>
                      <td className="px-3 py-1.5 text-right">{r.pricePerKgPence ? `${(r.pricePerKgPence / 100).toFixed(2)}p` : "—"}</td>
                      <td className="px-3 py-1.5 text-right">{r.leanMeatPct != null ? `${parseFloat(String(r.leanMeatPct)).toFixed(1)}%` : "—"}</td>
                      <td className="px-3 py-1.5 text-right">{r.averageP2BackfatMm != null ? `${parseFloat(String(r.averageP2BackfatMm)).toFixed(1)}` : "—"}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-emerald-700">{r.netPaymentPence ? fmtGBP(r.netPaymentPence) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Collapsible>
          )}

          {d!.feedDeliveries.length > 0 && (
            <Collapsible title={`Feed Deliveries (${d!.feedDeliveries.length} · ${d!.totalFeedKg.toLocaleString("en-GB")} kg)`} open={openSection === "feed"} setOpen={v => toggle(v ? "feed" : "")}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60">
                  <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-right">Qty (kg)</th><th className="px-3 py-2 text-right">Cost</th>
                </tr></thead>
                <tbody>
                  {d!.feedDeliveries.map(f => (
                    <tr key={f.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{new Date(f.deliveryDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-1.5">{f.productName}</td>
                      <td className="px-3 py-1.5 text-right">{parseFloat(String(f.quantityKg)).toLocaleString("en-GB")}</td>
                      <td className="px-3 py-1.5 text-right font-medium">{fmtGBP(f.costPence)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Collapsible>
          )}
        </>
      )}
    </div>
  );
}
