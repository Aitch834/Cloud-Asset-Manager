import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TrendingUp, TrendingDown, Scale, ShoppingCart, Package, ChevronDown, ChevronUp } from "lucide-react";

interface BeefReportData {
  year: number;
  totalHeadSold: number;
  totalCarcassKg: number;
  totalRevenuePence: number;
  totalFeedCostPence: number;
  totalFeedKg: number;
  totalPurchaseCostPence: number;
  totalHeadPurchased: number;
  totalVariableCostPence: number;
  grossMarginPence: number;
  grossMarginPerHeadPence: number | null;
  revenuePerKgDwtPence: number | null;
  costPerKgDwtPence: number | null;
  settlementCount: number;
  settlements: { id: number; killDate: string; abattoirName: string; numberOfHead: number; totalCarcassWeightKg: string; averagePricePerKgGbp: string; dominantGrade: string; netPaymentGbp: string; netPaymentPence: number; killingOutPercentage: string }[];
  feedDeliveries: { id: number; deliveryDate: string; productName: string; quantityKg: string; costPence: number }[];
  purchases: { id: number; purchaseDate: string; species: string; numberOfHead: number; totalAmountPence: number; pricePerHeadPence: number }[];
}

function fmtGBP(pence: number) { return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtPkg(pence: number | null) { if (pence == null) return "—"; return `${(pence / 100).toFixed(2)}p/kg`; }

export function BeefEnterpriseReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [showSettlements, setShowSettlements] = useState(false);
  const [showFeed, setShowFeed] = useState(false);

  const { data, isLoading } = useQuery<BeefReportData>({
    queryKey: ["beef-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/beef-enterprise-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const d = data;
  const hasData = d && (d.settlementCount > 0 || d.totalFeedCostPence > 0 || d.totalPurchaseCostPence > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;

  if (isLoading) return <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Beef Enterprise Report</h2>
          <p className="text-sm text-foreground/50">Cost per head, cost per kg deadweight, and gross margin</p>
        </div>
        <select className="h-9 rounded-lg border border-border bg-background px-3 text-sm" value={year} onChange={e => setYear(parseInt(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No deadweight settlements, feed deliveries or livestock purchases found for {year}.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Head Sold" value={d!.totalHeadSold.toString()} sub={`${d!.totalCarcassKg.toLocaleString("en-GB")} kg dwt`} icon={<Scale className="w-4 h-4 text-orange-500" />} />
            <KpiCard label="Revenue" value={fmtGBP(d!.totalRevenuePence)} sub={fmtPkg(d!.revenuePerKgDwtPence)} icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
            <KpiCard label="Variable Costs" value={fmtGBP(d!.totalVariableCostPence)} sub={`Feed: ${fmtGBP(d!.totalFeedCostPence)} · Purchase: ${fmtGBP(d!.totalPurchaseCostPence)}`} icon={<Package className="w-4 h-4 text-amber-500" />} />
            <KpiCard label="Gross Margin" value={fmtGBP(d!.grossMarginPence)} sub={d!.grossMarginPerHeadPence != null ? `${fmtGBP(d!.grossMarginPerHeadPence)}/head` : "—"} icon={marginPositive ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />} highlight={marginPositive ? "emerald" : "red"} />
          </div>

          {/* P&L table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold">Enterprise Summary</h3>
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
                  { label: "Deadweight revenue", value: d!.totalRevenuePence, positive: true, bold: false },
                  { label: "Livestock purchases", value: -d!.totalPurchaseCostPence, positive: false, bold: false },
                  { label: "Feed cost", value: -d!.totalFeedCostPence, positive: false, bold: false },
                  { label: "Total variable costs", value: -d!.totalVariableCostPence, positive: false, bold: false, divider: true },
                  { label: "Gross margin", value: d!.grossMarginPence, positive: marginPositive, bold: true, highlight: marginPositive ? "emerald" as const : "red" as const },
                ].map((row, i) => (
                  <tr key={i} className={`border-t ${row.divider ? "border-t-2 border-border" : "border-border/40"} ${row.highlight === "emerald" ? "bg-emerald-50/30" : row.highlight === "red" ? "bg-red-50/30" : ""}`}>
                    <td className={`px-4 py-2 ${row.bold ? "font-semibold" : ""}`}>{row.label}</td>
                    <td className={`px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${row.highlight === "emerald" ? "text-emerald-700" : row.highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : row.positive ? "text-emerald-700" : ""}`}>
                      {row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value)}
                    </td>
                    <td className="px-4 py-2 text-right text-foreground/50 text-xs">
                      {d!.totalHeadSold > 0 ? fmtGBP(Math.abs(row.value) / d!.totalHeadSold) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right text-foreground/50 text-xs">
                      {d!.totalCarcassKg > 0 ? `${(Math.abs(row.value) / d!.totalCarcassKg / 100).toFixed(2)}p/kg` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">Feed cost includes tagged deliveries only. Labour, haulage and vet costs should be added via Financial for a full enterprise P&amp;L.</div>
          </div>

          {/* Settlements detail */}
          {d!.settlements.length > 0 && (
            <Collapsible title={`Deadweight Settlements (${d!.settlements.length})`} open={showSettlements} setOpen={setShowSettlements}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60"><th className="px-3 py-2 text-left">Kill Date</th><th className="px-3 py-2 text-left">Abattoir</th><th className="px-3 py-2 text-right">Head</th><th className="px-3 py-2 text-right">Carcass Wt</th><th className="px-3 py-2 text-right">Grade</th><th className="px-3 py-2 text-right">Net Payment</th></tr></thead>
                <tbody>
                  {d!.settlements.map(s => (
                    <tr key={s.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{new Date(s.killDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-1.5">{s.abattoirName}</td>
                      <td className="px-3 py-1.5 text-right">{s.numberOfHead}</td>
                      <td className="px-3 py-1.5 text-right">{parseFloat(String(s.totalCarcassWeightKg)).toFixed(0)} kg</td>
                      <td className="px-3 py-1.5 text-right">{s.dominantGrade ?? "—"}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-emerald-700">{fmtGBP(s.netPaymentPence)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Collapsible>
          )}

          {/* Feed detail */}
          {d!.feedDeliveries.length > 0 && (
            <Collapsible title={`Feed Deliveries (${d!.feedDeliveries.length})`} open={showFeed} setOpen={setShowFeed}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60"><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-left">Product</th><th className="px-3 py-2 text-right">Qty (kg)</th><th className="px-3 py-2 text-right">Cost</th></tr></thead>
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
        <span>{title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="overflow-x-auto border-t border-border">{children}</div>}
    </div>
  );
}
