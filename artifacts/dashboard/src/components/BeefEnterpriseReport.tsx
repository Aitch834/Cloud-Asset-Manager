import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Scale, Package, ShoppingCart, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface Settlement { id: number; killDate: string; abattoirName: string; numberOfHead: number; totalCarcassWeightKg: string; averagePricePerKgGbp: string; dominantGrade: string; netPaymentGbp: string; netPaymentPence: number; killingOutPercentage: string; }
interface FeedDelivery { id: number; deliveryDate: string; productName: string; quantityKg: string; costPence: number; }
interface Purchase { id: number; invoiceDate: string; species: string; numberOfHead: number; totalAmountPence: number; pricePerHeadPence: number; }

interface BeefReportData {
  year: number; totalHeadSold: number; totalCarcassKg: number; totalRevenuePence: number;
  totalFeedCostPence: number; totalFeedKg: number; totalPurchaseCostPence: number; totalHeadPurchased: number; totalVetCostPence: number;
  totalContractorCostPence?: number;
  totalVariableCostPence: number; grossMarginPence: number; grossMarginPerHeadPence: number | null;
  revenuePerKgDwtPence: number | null; costPerKgDwtPence: number | null; settlementCount: number;
  settlements: Settlement[]; feedDeliveries: FeedDelivery[]; purchases: Purchase[];
}

const PRINT_ID = "beef-enterprise-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
  document.head.appendChild(s);
}

function fmtGBP(p: number) { return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtPkg(p: number | null) { return p == null ? "—" : `${(p / 100).toFixed(2)}p/kg`; }
function fmtPerHead(p: number | null) { return p == null ? "—" : fmtGBP(p); }
function monthLabel(d: string) { return new Date(d.slice(0, 7) + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }); }

function KpiCard({ label, value, sub, icon, highlight }: { label: string; value: string; sub: string; icon: React.ReactNode; highlight?: "emerald" | "red" }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight === "emerald" ? "border-emerald-200 bg-emerald-50/50" : highlight === "red" ? "border-red-200 bg-red-50/50" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between mb-1"><span className="text-xs text-foreground/50">{label}</span>{icon}</div>
      <p className={`text-lg font-bold ${highlight === "emerald" ? "text-emerald-700" : highlight === "red" ? "text-red-600" : ""}`}>{value}</p>
      <p className="text-xs text-foreground/40 mt-0.5">{sub}</p>
    </div>
  );
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: {fmtGBP(Math.abs(p.value))}</p>)}
    </div>
  );
};

export function BeefEnterpriseReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (s: string) => setOpenSection(v => v === s ? null : s);

  const { data, isLoading } = useQuery<BeefReportData>({
    queryKey: ["beef-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/beef-enterprise-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>;

  const d = data;
  const hasData = d && (d.settlementCount > 0 || d.totalFeedCostPence > 0 || d.totalPurchaseCostPence > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;

  const chartData = useMemo(() => {
    if (!d) return [];
    const map: Record<string, { revenue: number; feedCost: number; purchases: number }> = {};
    d.settlements.forEach(s => {
      const m = s.killDate.slice(0, 7);
      if (!map[m]) map[m] = { revenue: 0, feedCost: 0, purchases: 0 };
      map[m].revenue += s.netPaymentPence;
    });
    d.feedDeliveries.forEach(f => {
      const m = f.deliveryDate.slice(0, 7);
      if (!map[m]) map[m] = { revenue: 0, feedCost: 0, purchases: 0 };
      map[m].feedCost += f.costPence;
    });
    d.purchases.forEach(p => {
      const m = p.invoiceDate.slice(0, 7);
      if (!map[m]) map[m] = { revenue: 0, feedCost: 0, purchases: 0 };
      map[m].purchases += p.totalAmountPence;
    });
    return Object.entries(map).sort().map(([m, v]) => ({
      label: monthLabel(m),
      "Revenue": v.revenue,
      "Feed Cost": v.feedCost,
      "Purchases": v.purchases,
      "Gross Margin": v.revenue - v.feedCost - v.purchases,
    }));
  }, [d]);

  const avgKoPercent = d?.settlements.filter(s => s.killingOutPercentage).length
    ? (d.settlements.reduce((sum, s) => sum + (parseFloat(String(s.killingOutPercentage)) || 0), 0) / d.settlements.filter(s => s.killingOutPercentage).length).toFixed(1)
    : null;

  return (
    <div id={PRINT_ID} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Beef Enterprise Report</h2>
          <p className="text-sm text-foreground/50">Cost per head · Cost per kg deadweight · Gross margin</p>
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
          No deadweight settlements, feed deliveries or livestock purchases found for {year}.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Head Sold" value={d!.totalHeadSold.toString()} sub={`${d!.totalCarcassKg.toLocaleString("en-GB")} kg dwt${avgKoPercent ? ` · avg KO ${avgKoPercent}%` : ""}`} icon={<Scale className="w-4 h-4 text-orange-500" />} />
            <KpiCard label="Revenue" value={fmtGBP(d!.totalRevenuePence)} sub={fmtPkg(d!.revenuePerKgDwtPence)} icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
            <KpiCard label="Variable Costs" value={fmtGBP(d!.totalVariableCostPence)} sub={`Feed ${fmtGBP(d!.totalFeedCostPence)} · Purchases ${fmtGBP(d!.totalPurchaseCostPence)}`} icon={<Package className="w-4 h-4 text-amber-500" />} />
            <KpiCard label="Gross Margin" value={fmtGBP(d!.grossMarginPence)} sub={d!.grossMarginPerHeadPence != null ? `${fmtGBP(d!.grossMarginPerHeadPence)}/head` : "—"} icon={marginPositive ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />} highlight={marginPositive ? "emerald" : "red"} />
          </div>

          {chartData.length > 1 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Monthly Revenue vs Costs</h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `£${(v / 100).toFixed(0)}`} tick={{ fontSize: 11 }} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Revenue" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={36} />
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
                  { label: `Deadweight revenue (${d!.settlementCount} settlements)`, value: d!.totalRevenuePence, positive: true, bold: false },
                  { label: `Livestock purchases (${d!.totalHeadPurchased} head)`, value: -d!.totalPurchaseCostPence, bold: false },
                  { label: `Feed cost (${d!.feedDeliveries.length} deliveries · ${d!.totalFeedKg.toLocaleString("en-GB")} kg)`, value: -d!.totalFeedCostPence, bold: false },
                  ...(d!.totalVetCostPence > 0 ? [{ label: "Vet & medicine (invoiced)", value: -d!.totalVetCostPence, bold: false }] : []),
                  ...((d!.totalContractorCostPence ?? 0) > 0 ? [{ label: "Contractor costs (field ops)", value: -(d!.totalContractorCostPence!), bold: false }] : []),
                  { label: "Total variable costs", value: -d!.totalVariableCostPence, bold: true, divider: true },
                  { label: "Gross margin", value: d!.grossMarginPence, bold: true, highlight: marginPositive ? "emerald" as const : "red" as const },
                ].map((row, i) => (
                  <tr key={i} className={`border-t ${(row as any).divider ? "border-t-2 border-border" : "border-border/40"} ${(row as any).highlight === "emerald" ? "bg-emerald-50/30" : (row as any).highlight === "red" ? "bg-red-50/30" : ""}`}>
                    <td className={`px-4 py-2 ${row.bold ? "font-semibold" : ""}`}>{row.label}</td>
                    <td className={`px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${(row as any).highlight === "emerald" ? "text-emerald-700" : (row as any).highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : (row as any).positive ? "text-emerald-700" : ""}`}>
                      {row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value)}
                    </td>
                    <td className="px-4 py-2 text-right text-foreground/50 text-xs">{d!.totalHeadSold > 0 ? fmtGBP(Math.abs(row.value) / d!.totalHeadSold) : "—"}</td>
                    <td className="px-4 py-2 text-right text-foreground/50 text-xs">{d!.totalCarcassKg > 0 ? `${(Math.abs(row.value) / d!.totalCarcassKg / 100).toFixed(2)}p/kg` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {d!.costPerKgDwtPence != null && (
              <div className="px-4 py-2 border-t border-border/40 text-xs text-foreground/60 flex gap-4">
                <span>Variable cost/kg dwt: <strong>{fmtPkg(d!.costPerKgDwtPence)}</strong></span>
                {avgKoPercent && <span>Avg killing out: <strong>{avgKoPercent}%</strong></span>}
              </div>
            )}
            <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">
              Feed from priced deliveries tagged to beef/cattle. Haulage, bedding, vet, and fixed costs should be recorded in Financial for a complete enterprise P&amp;L.
            </div>
          </div>

          {d!.settlements.length > 0 && (
            <Collapsible title={`Deadweight Settlements (${d!.settlements.length})`} open={openSection === "settlements"} setOpen={v => toggle(v ? "settlements" : "")}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60">
                  <th className="px-3 py-2 text-left">Kill Date</th><th className="px-3 py-2 text-left">Abattoir</th>
                  <th className="px-3 py-2 text-right">Head</th><th className="px-3 py-2 text-right">Carcass Wt</th>
                  <th className="px-3 py-2 text-right">p/kg</th><th className="px-3 py-2 text-right">KO%</th>
                  <th className="px-3 py-2 text-right">Grade</th><th className="px-3 py-2 text-right">Net Payment</th>
                </tr></thead>
                <tbody>
                  {d!.settlements.map(s => (
                    <tr key={s.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{new Date(s.killDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-1.5">{s.abattoirName}</td>
                      <td className="px-3 py-1.5 text-right">{s.numberOfHead}</td>
                      <td className="px-3 py-1.5 text-right">{parseFloat(String(s.totalCarcassWeightKg)).toFixed(0)} kg</td>
                      <td className="px-3 py-1.5 text-right">{s.averagePricePerKgGbp ? `${(parseFloat(String(s.averagePricePerKgGbp)) * 100).toFixed(0)}p` : "—"}</td>
                      <td className="px-3 py-1.5 text-right">{s.killingOutPercentage ? `${parseFloat(String(s.killingOutPercentage)).toFixed(1)}%` : "—"}</td>
                      <td className="px-3 py-1.5 text-right">{s.dominantGrade ?? "—"}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-emerald-700">{fmtGBP(s.netPaymentPence)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Collapsible>
          )}

          {d!.feedDeliveries.length > 0 && (
            <Collapsible title={`Feed Deliveries (${d!.feedDeliveries.length} · ${d!.totalFeedKg.toLocaleString("en-GB")} kg total)`} open={openSection === "feed"} setOpen={v => toggle(v ? "feed" : "")}>
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

          {d!.purchases.length > 0 && (
            <Collapsible title={`Livestock Purchases (${d!.purchases.length} · ${d!.totalHeadPurchased} head)`} open={openSection === "purchases"} setOpen={v => toggle(v ? "purchases" : "")}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60">
                  <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Species</th>
                  <th className="px-3 py-2 text-right">Head</th><th className="px-3 py-2 text-right">£/Head</th><th className="px-3 py-2 text-right">Total</th>
                </tr></thead>
                <tbody>
                  {d!.purchases.map(p => (
                    <tr key={p.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{new Date(p.invoiceDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-1.5">{p.species}</td>
                      <td className="px-3 py-1.5 text-right">{p.numberOfHead}</td>
                      <td className="px-3 py-1.5 text-right">{p.pricePerHeadPence ? fmtGBP(p.pricePerHeadPence) : "—"}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-red-700">{fmtGBP(p.totalAmountPence)}</td>
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
