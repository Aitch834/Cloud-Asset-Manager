import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";

interface PigReportData {
  year: number;
  totalHeadKilled: number;
  totalDeadweightKg: number;
  totalRevenuePence: number;
  totalFeedCostPence: number;
  totalFeedKg: number;
  totalPurchaseCostPence: number;
  totalHeadPurchased: number;
  totalVariableCostPence: number;
  grossMarginPence: number;
  grossMarginPerHeadPence: number | null;
  revenuePerKgDwtPence: number | null;
  variableCostPerKgDwtPence: number | null;
  feedCostPerKgDwtPence: number | null;
  avgLeanMeatPct: number | null;
  killRecords: { id: number; killDate: string; numberOfHead: number; totalDeadweightKg: string; pricePerKgPence: number; netPaymentPence: number; leanMeatPct: string; averageP2BackfatMm: string }[];
  feedDeliveries: { id: number; deliveryDate: string; productName: string; quantityKg: string; costPence: number }[];
  purchases: { id: number; purchaseDate: string; numberOfHead: number; totalAmountPence: number; pricePerHeadPence: number }[];
}

function fmtGBP(pence: number) { return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

export function PigEnterpriseReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PigReportData>({
    queryKey: ["pig-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/pig-enterprise-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const d = data;
  const hasData = d && (d.totalHeadKilled > 0 || d.totalFeedCostPence > 0 || d.totalPurchaseCostPence > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;
  const toggle = (s: string) => setOpenSection(v => v === s ? null : s);

  if (isLoading) return <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Pig Enterprise Report</h2>
          <p className="text-sm text-foreground/50">Cost per kg deadweight · Gross margin per head</p>
        </div>
        <select className="h-9 rounded-lg border border-border bg-background px-3 text-sm" value={year} onChange={e => setYear(parseInt(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No kill records, priced feed deliveries or livestock purchases found for {year}.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Head Killed" value={d!.totalHeadKilled.toLocaleString("en-GB")} sub={`${d!.totalDeadweightKg.toLocaleString("en-GB")} kg dwt`} />
            <KpiCard label="Kill Revenue" value={fmtGBP(d!.totalRevenuePence)} sub={d!.revenuePerKgDwtPence != null ? `${(d!.revenuePerKgDwtPence / 100).toFixed(2)}p/kg` : "—"} positive />
            <KpiCard label="Variable Costs" value={fmtGBP(d!.totalVariableCostPence)} sub={`Feed ${fmtGBP(d!.totalFeedCostPence)} · Purchases ${fmtGBP(d!.totalPurchaseCostPence)}`} />
            <KpiCard label="Gross Margin" value={fmtGBP(d!.grossMarginPence)} sub={d!.grossMarginPerHeadPence != null ? `${fmtGBP(d!.grossMarginPerHeadPence)}/head` : "—"} highlight={marginPositive ? "emerald" : "red"} />
          </div>

          {/* Summary table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30"><h3 className="text-sm font-semibold">Enterprise P&amp;L Summary — {d!.year}</h3></div>
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
                  { label: "Kill revenue", value: d!.totalRevenuePence, positive: true },
                  { label: "Livestock purchases", value: -d!.totalPurchaseCostPence },
                  { label: `Feed cost (${d!.feedDeliveries.length} deliveries)`, value: -d!.totalFeedCostPence },
                  { label: "Total variable costs", value: -d!.totalVariableCostPence, bold: true, divider: true },
                  { label: "Gross margin", value: d!.grossMarginPence, bold: true, highlight: marginPositive ? "emerald" as const : "red" as const },
                ].map((row, i) => (
                  <tr key={i} className={`border-t ${row.divider ? "border-t-2 border-border" : "border-border/40"} ${row.highlight === "emerald" ? "bg-emerald-50/30" : row.highlight === "red" ? "bg-red-50/30" : ""}`}>
                    <td className={`px-4 py-2 ${row.bold ? "font-semibold" : ""}`}>{row.label}</td>
                    <td className={`px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${row.highlight === "emerald" ? "text-emerald-700" : row.highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : row.positive ? "text-emerald-700" : ""}`}>
                      {row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value)}
                    </td>
                    <td className="px-4 py-2 text-right text-foreground/50 text-xs">{d!.totalHeadKilled > 0 ? fmtGBP(Math.abs(row.value) / d!.totalHeadKilled) : "—"}</td>
                    <td className="px-4 py-2 text-right text-foreground/50 text-xs">{d!.totalDeadweightKg > 0 ? `${(Math.abs(row.value) / d!.totalDeadweightKg / 100).toFixed(2)}p/kg` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {d!.avgLeanMeatPct != null && (
              <div className="px-4 py-2 border-t border-border/40 text-xs text-foreground/60">
                Avg lean meat %: <strong>{d!.avgLeanMeatPct.toFixed(1)}%</strong>
                {d!.variableCostPerKgDwtPence != null && <> · Variable cost/kg: <strong>{(d!.variableCostPerKgDwtPence / 100).toFixed(2)}p</strong></>}
                {d!.feedCostPerKgDwtPence != null && <> · Feed cost/kg: <strong>{(d!.feedCostPerKgDwtPence / 100).toFixed(2)}p</strong></>}
              </div>
            )}
            <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">Feed cost from priced deliveries tagged to pigs/swine. Bedding, haulage, and vet costs should be added via Financial for a full P&amp;L.</div>
          </div>

          {/* Kill records detail */}
          {d!.killRecords.length > 0 && (
            <Collapsible title={`Kill Records (${d!.killRecords.length})`} open={openSection === "kills"} setOpen={() => toggle("kills")}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60"><th className="px-3 py-2 text-left">Kill Date</th><th className="px-3 py-2 text-right">Head</th><th className="px-3 py-2 text-right">Deadweight</th><th className="px-3 py-2 text-right">p/kg</th><th className="px-3 py-2 text-right">LMP %</th><th className="px-3 py-2 text-right">Net Payment</th></tr></thead>
                <tbody>
                  {d!.killRecords.map(r => (
                    <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{new Date(r.killDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-1.5 text-right">{r.numberOfHead}</td>
                      <td className="px-3 py-1.5 text-right">{r.totalDeadweightKg != null ? `${parseFloat(String(r.totalDeadweightKg)).toFixed(0)} kg` : "—"}</td>
                      <td className="px-3 py-1.5 text-right">{r.pricePerKgPence != null ? `${(r.pricePerKgPence / 100).toFixed(2)}p` : "—"}</td>
                      <td className="px-3 py-1.5 text-right">{r.leanMeatPct != null ? `${parseFloat(String(r.leanMeatPct)).toFixed(1)}%` : "—"}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-emerald-700">{r.netPaymentPence ? fmtGBP(r.netPaymentPence) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Collapsible>
          )}

          {d!.feedDeliveries.length > 0 && (
            <Collapsible title={`Feed Deliveries (${d!.feedDeliveries.length})`} open={openSection === "feed"} setOpen={() => toggle("feed")}>
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

function KpiCard({ label, value, sub, positive, highlight }: { label: string; value: string; sub: string; positive?: boolean; highlight?: "emerald" | "red" }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight === "emerald" ? "border-emerald-200 bg-emerald-50/50" : highlight === "red" ? "border-red-200 bg-red-50/50" : "border-border bg-card"}`}>
      <span className="text-xs text-foreground/50">{label}</span>
      <p className={`text-lg font-bold mt-1 ${highlight === "emerald" ? "text-emerald-700" : highlight === "red" ? "text-red-600" : positive ? "text-emerald-700" : ""}`}>{value}</p>
      <p className="text-xs text-foreground/40 mt-0.5">{sub}</p>
    </div>
  );
}

function Collapsible({ title, open, setOpen, children }: { title: string; open: boolean; setOpen: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted/30 transition-colors" onClick={setOpen}>
        <span>{title}</span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="overflow-x-auto border-t border-border">{children}</div>}
    </div>
  );
}
