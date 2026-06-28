import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Droplets, Package, ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";

interface DairyReportData {
  year: number;
  totalVolumeLitres: number;
  totalMilkIncomePence: number;
  totalFeedCostPence: number;
  totalFeedKg: number;
  dairyPurchaseCostPence: number;
  totalVariableCostPence: number;
  grossMarginPence: number;
  pencePerLitre: number | null;
  feedCostPerLitrePence: number | null;
  grossMarginPerLitrePence: number | null;
  collectionCount: number;
  feedDeliveryCount: number;
  monthlyBreakdown: {
    month: string;
    volumeLitres: number;
    incomePence: number;
    feedCostPence: number;
    collections: number;
    grossMarginPence: number;
    pplActual: number | null;
  }[];
}

function fmtGBP(pence: number) {
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtPpl(pence: number | null) {
  if (pence == null) return "—";
  return `${pence.toFixed(2)}p/L`;
}
function fmtVol(litres: number) {
  if (litres >= 1000) return `${(litres / 1000).toFixed(1)}kL`;
  return `${litres.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L`;
}

export function DairyEnterpriseReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [showMonthly, setShowMonthly] = useState(false);

  const { data, isLoading } = useQuery<DairyReportData>({
    queryKey: ["dairy-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/dairy-enterprise-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (isLoading) return <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>;

  const d = data;
  const hasData = d && (d.collectionCount > 0 || d.feedDeliveryCount > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Dairy Enterprise Report</h2>
          <p className="text-sm text-foreground/50">Cost of production and gross margin analysis</p>
        </div>
        <select
          className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No milk collection or feed delivery data found for {year}.<br />
          <span className="text-xs">Record milk collections and priced feed deliveries to generate this report.</span>
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Milk Produced" value={fmtVol(d!.totalVolumeLitres)} sub={`${d!.collectionCount} collections`} icon={<Droplets className="w-4 h-4 text-blue-500" />} />
            <KpiCard label="Milk Income" value={fmtGBP(d!.totalMilkIncomePence)} sub={fmtPpl(d!.pencePerLitre)} icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
            <KpiCard label="Feed Cost" value={fmtGBP(d!.totalFeedCostPence)} sub={`${d!.totalFeedKg.toLocaleString("en-GB")} kg delivered`} icon={<Package className="w-4 h-4 text-amber-500" />} />
            <KpiCard
              label="Gross Margin"
              value={fmtGBP(d!.grossMarginPence)}
              sub={fmtPpl(d!.grossMarginPerLitrePence)}
              icon={marginPositive ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
              highlight={marginPositive ? "emerald" : "red"}
            />
          </div>

          {/* Cost breakdown */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold">Cost of Production Summary</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <Row label="Milk income" value={d!.totalMilkIncomePence} perLitre={d!.pencePerLitre} litres={d!.totalVolumeLitres} bold positive />
                <Row label="Feed cost" value={-d!.totalFeedCostPence} perLitre={d!.feedCostPerLitrePence ? -d!.feedCostPerLitrePence : null} litres={d!.totalVolumeLitres} />
                {d!.dairyPurchaseCostPence > 0 && <Row label="Livestock purchases (dairy)" value={-d!.dairyPurchaseCostPence} perLitre={null} litres={d!.totalVolumeLitres} />}
                <Row label="Total variable costs" value={-d!.totalVariableCostPence} perLitre={null} litres={d!.totalVolumeLitres} divider />
                <Row label="Gross margin" value={d!.grossMarginPence} perLitre={d!.grossMarginPerLitrePence} litres={d!.totalVolumeLitres} bold highlight={marginPositive ? "emerald" : "red"} />
              </tbody>
            </table>
            <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">
              Feed cost from priced deliveries tagged to dairy/cattle. Labour, AI, and vet contractor costs not yet included — record these in Financial to build a complete P&amp;L.
            </div>
          </div>

          {/* Monthly breakdown toggle */}
          {d!.monthlyBreakdown.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted/30 transition-colors"
                onClick={() => setShowMonthly(v => !v)}
              >
                <span>Monthly Breakdown</span>
                {showMonthly ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showMonthly && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-t border-border bg-muted/30 text-foreground/60">
                        <th className="px-3 py-2 text-left">Month</th>
                        <th className="px-3 py-2 text-right">Volume (L)</th>
                        <th className="px-3 py-2 text-right">Income</th>
                        <th className="px-3 py-2 text-right">p/L</th>
                        <th className="px-3 py-2 text-right">Feed Cost</th>
                        <th className="px-3 py-2 text-right">Gross Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d!.monthlyBreakdown.map(m => (
                        <tr key={m.month} className="border-t border-border/40 hover:bg-muted/20">
                          <td className="px-3 py-1.5 font-medium">{new Date(m.month + "-01").toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</td>
                          <td className="px-3 py-1.5 text-right">{m.volumeLitres.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</td>
                          <td className="px-3 py-1.5 text-right">{fmtGBP(m.incomePence)}</td>
                          <td className="px-3 py-1.5 text-right text-foreground/60">{m.pplActual != null ? `${m.pplActual.toFixed(2)}p` : "—"}</td>
                          <td className="px-3 py-1.5 text-right text-amber-700">{m.feedCostPence > 0 ? fmtGBP(m.feedCostPence) : "—"}</td>
                          <td className={`px-3 py-1.5 text-right font-medium ${m.grossMarginPence >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmtGBP(m.grossMarginPence)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, sub, icon, highlight }: { label: string; value: string; sub: string; icon: React.ReactNode; highlight?: "emerald" | "red" }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight === "emerald" ? "border-emerald-200 bg-emerald-50/50" : highlight === "red" ? "border-red-200 bg-red-50/50" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-foreground/50">{label}</span>
        {icon}
      </div>
      <p className={`text-lg font-bold ${highlight === "emerald" ? "text-emerald-700" : highlight === "red" ? "text-red-600" : ""}`}>{value}</p>
      <p className="text-xs text-foreground/40 mt-0.5">{sub}</p>
    </div>
  );
}

function Row({ label, value, perLitre, litres, bold, positive, highlight, divider }: {
  label: string; value: number; perLitre: number | null; litres: number;
  bold?: boolean; positive?: boolean; highlight?: "emerald" | "red"; divider?: boolean;
}) {
  const ppl = perLitre ?? (litres > 0 ? value / litres : null);
  const isNeg = value < 0;
  return (
    <tr className={`border-t border-border/40 ${divider ? "border-t-2 border-border" : ""} ${highlight === "emerald" ? "bg-emerald-50/30" : highlight === "red" ? "bg-red-50/30" : ""}`}>
      <td className={`px-4 py-2 ${bold ? "font-semibold" : ""}`}>{label}</td>
      <td className={`px-4 py-2 text-right font-mono ${bold ? "font-bold" : ""} ${highlight === "emerald" ? "text-emerald-700" : highlight === "red" ? "text-red-600" : isNeg ? "text-red-600" : positive ? "text-emerald-700" : ""}`}>
        {value < 0 ? `-${fmtGBP(-value)}` : fmtGBP(value)}
      </td>
      <td className="px-4 py-2 text-right text-foreground/40 text-xs">
        {ppl != null ? `${ppl >= 0 ? "" : "-"}${Math.abs(ppl).toFixed(2)}p/L` : ""}
      </td>
    </tr>
  );
}
