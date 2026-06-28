import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";

interface SheepReportData {
  flockYear: string;
  totalHeadSold: number;
  totalWoolKg: number;
  totalCullRevenuePence: number;
  totalWoolRevenuePence: number;
  totalRevenuePence: number;
  totalFeedCostPence: number;
  totalFeedKg: number;
  totalPurchaseCostPence: number;
  totalHeadPurchased: number;
  totalVariableCostPence: number;
  grossMarginPence: number;
  grossMarginPerHeadSoldPence: number | null;
  avgWoolPricePerKgGbp: number | null;
  cullRecords: { id: number; cullDate: string; numberOfHead: number; pricePerHeadGbp: string; totalValueGbp: string; reason: string }[];
  shearingRecords: { id: number; shearingDate: string; headSheared: number; totalWoolWeightKg: string; pricePerKgGbp: string; totalValueGbp: string }[];
  feedDeliveries: { id: number; deliveryDate: string; productName: string; quantityKg: string; costPence: number }[];
  purchases: { id: number; purchaseDate: string; numberOfHead: number; totalAmountPence: number; pricePerHeadPence: number }[];
}

function fmtGBP(pence: number) { return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }

export function SheepEnterpriseReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  // Sheep year: Aug–Jul, show as "2024/25" — use the start year of the flock year
  const currentFlockYear = new Date().getMonth() >= 7 ? currentYear : currentYear - 1;
  const [year, setYear] = useState(currentFlockYear);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const { data, isLoading } = useQuery<SheepReportData>({
    queryKey: ["sheep-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/sheep-enterprise-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentFlockYear - i);
  const d = data;
  const hasData = d && (d.totalHeadSold > 0 || d.totalFeedCostPence > 0 || d.totalPurchaseCostPence > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;

  if (isLoading) return <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>;

  const toggle = (s: string) => setOpenSection(v => v === s ? null : s);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Sheep Enterprise Report</h2>
          <p className="text-sm text-foreground/50">Flock year Aug–Jul · Gross margin per ewe</p>
        </div>
        <select className="h-9 rounded-lg border border-border bg-background px-3 text-sm" value={year} onChange={e => setYear(parseInt(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}/{(y + 1).toString().slice(2)}</option>)}
        </select>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No cull records, shearing records, feed deliveries or purchases found for flock year {d?.flockYear ?? `${year}/${(year + 1).toString().slice(2)}`}.
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Flock Year</span>
              <p className="text-lg font-bold">{d!.flockYear}</p>
              <p className="text-xs text-foreground/40">{d!.totalHeadSold} head sold · {d!.totalWoolKg.toFixed(0)} kg wool</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Total Output</span>
              <p className="text-lg font-bold text-emerald-700">{fmtGBP(d!.totalRevenuePence)}</p>
              <p className="text-xs text-foreground/40">Lambs/culls {fmtGBP(d!.totalCullRevenuePence)} · Wool {fmtGBP(d!.totalWoolRevenuePence)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Variable Costs</span>
              <p className="text-lg font-bold">{fmtGBP(d!.totalVariableCostPence)}</p>
              <p className="text-xs text-foreground/40">Feed {fmtGBP(d!.totalFeedCostPence)} · Purchase {fmtGBP(d!.totalPurchaseCostPence)}</p>
            </div>
            <div className={`rounded-xl border p-3 ${marginPositive ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground/50">Gross Margin</span>
                {marginPositive ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
              </div>
              <p className={`text-lg font-bold ${marginPositive ? "text-emerald-700" : "text-red-600"}`}>{fmtGBP(d!.grossMarginPence)}</p>
              <p className="text-xs text-foreground/40">{d!.grossMarginPerHeadSoldPence != null ? `${fmtGBP(d!.grossMarginPerHeadSoldPence)}/head sold` : "—"}</p>
            </div>
          </div>

          {/* Summary table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30"><h3 className="text-sm font-semibold">Enterprise Summary — Flock Year {d!.flockYear}</h3></div>
            <table className="w-full text-sm">
              <tbody>
                {[
                  { label: "Lamb & cull sales", value: d!.totalCullRevenuePence, positive: true },
                  { label: "Wool sales", value: d!.totalWoolRevenuePence, positive: true, sub: d!.avgWoolPricePerKgGbp ? `avg £${d!.avgWoolPricePerKgGbp?.toFixed(2)}/kg` : undefined },
                  { label: "Total output", value: d!.totalRevenuePence, bold: true, divider: true },
                  { label: "Feed cost", value: -d!.totalFeedCostPence, sub: `${d!.totalFeedKg.toLocaleString("en-GB")} kg` },
                  { label: "Livestock purchases", value: -d!.totalPurchaseCostPence },
                  { label: "Total variable costs", value: -d!.totalVariableCostPence, bold: true, divider: true },
                  { label: "Gross margin", value: d!.grossMarginPence, bold: true, highlight: marginPositive ? "emerald" as const : "red" as const },
                ].map((row, i) => (
                  <tr key={i} className={`border-t ${row.divider ? "border-t-2 border-border" : "border-border/40"} ${row.highlight === "emerald" ? "bg-emerald-50/30" : row.highlight === "red" ? "bg-red-50/30" : ""}`}>
                    <td className={`px-4 py-2 ${row.bold ? "font-semibold" : ""}`}>
                      {row.label}
                      {row.sub && <span className="ml-2 text-xs text-foreground/40">{row.sub}</span>}
                    </td>
                    <td className={`px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${row.highlight === "emerald" ? "text-emerald-700" : row.highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : row.positive ? "text-emerald-700" : ""}`}>
                      {row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">Feed from priced deliveries tagged to sheep. Shearing contractor, dipping, scanning, and vet costs should be added via Financial for a complete P&amp;L.</div>
          </div>

          {/* Detail sections */}
          {d!.cullRecords.length > 0 && (
            <Collapsible title={`Lamb/Cull Sales (${d!.cullRecords.length} records)`} open={openSection === "culls"} setOpen={() => toggle("culls")}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60"><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Head</th><th className="px-3 py-2 text-right">£/Head</th><th className="px-3 py-2 text-right">Total Value</th><th className="px-3 py-2 text-left">Reason</th></tr></thead>
                <tbody>
                  {d!.cullRecords.map(r => (
                    <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{new Date(r.cullDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-1.5 text-right">{r.numberOfHead}</td>
                      <td className="px-3 py-1.5 text-right">£{parseFloat(String(r.pricePerHeadGbp)).toFixed(2)}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-emerald-700">£{parseFloat(String(r.totalValueGbp)).toFixed(2)}</td>
                      <td className="px-3 py-1.5 text-foreground/60">{r.reason ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Collapsible>
          )}

          {d!.shearingRecords.length > 0 && (
            <Collapsible title={`Shearing Records (${d!.shearingRecords.length})`} open={openSection === "shearing"} setOpen={() => toggle("shearing")}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60"><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Head</th><th className="px-3 py-2 text-right">Wool (kg)</th><th className="px-3 py-2 text-right">£/kg</th><th className="px-3 py-2 text-right">Total</th></tr></thead>
                <tbody>
                  {d!.shearingRecords.map(r => (
                    <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{new Date(r.shearingDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-1.5 text-right">{r.headSheared}</td>
                      <td className="px-3 py-1.5 text-right">{parseFloat(String(r.totalWoolWeightKg)).toFixed(1)}</td>
                      <td className="px-3 py-1.5 text-right">£{parseFloat(String(r.pricePerKgGbp)).toFixed(2)}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-emerald-700">£{parseFloat(String(r.totalValueGbp)).toFixed(2)}</td>
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
