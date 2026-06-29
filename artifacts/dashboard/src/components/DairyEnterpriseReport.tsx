import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TrendingUp, TrendingDown, Droplets, Package, ShoppingCart, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface MonthlyRow {
  month: string;
  volumeLitres: number;
  incomePence: number;
  feedCostPence: number;
  collections: number;
  grossMarginPence: number;
  pplActual: number | null;
}

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
  monthlyBreakdown: MonthlyRow[];
}

const PRINT_ID = "dairy-enterprise-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
  document.head.appendChild(s);
}

function fmtGBP(p: number) { return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtPpl(p: number | null) { return p == null ? "—" : `${p.toFixed(2)}p/L`; }
function fmtVol(l: number) { return l >= 1000 ? `${(l / 1000).toFixed(1)}kL` : `${l.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L`; }
function monthLabel(m: string) { return new Date(m + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" }); }

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
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.name === "Gross Margin" ? fmtGBP(p.value) : fmtGBP(Math.abs(p.value))}</p>
      ))}
    </div>
  );
};

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

  const chartData = (d?.monthlyBreakdown ?? []).map(m => ({
    label: monthLabel(m.month),
    "Milk Income": m.incomePence,
    "Feed Cost": m.feedCostPence,
    "Gross Margin": m.grossMarginPence,
  }));

  const feedPct = d && d.totalMilkIncomePence > 0 ? ((d.totalFeedCostPence / d.totalMilkIncomePence) * 100).toFixed(1) : null;

  return (
    <div id={PRINT_ID} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Dairy Enterprise Report</h2>
          <p className="text-sm text-foreground/50">Cost of production · Gross margin · Per-litre analysis</p>
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

      <div className="print:block hidden mb-2">
        <h2 className="text-xl font-bold">Dairy Enterprise Report — {year}</h2>
        <p className="text-sm text-gray-500">Cost of production and gross margin analysis</p>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No milk collection or feed delivery data found for {year}.<br />
          <span className="text-xs">Record milk collections and priced feed deliveries to generate this report.</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Milk Produced" value={fmtVol(d!.totalVolumeLitres)} sub={`${d!.collectionCount} collections`} icon={<Droplets className="w-4 h-4 text-blue-500" />} />
            <KpiCard label="Milk Income" value={fmtGBP(d!.totalMilkIncomePence)} sub={fmtPpl(d!.pencePerLitre)} icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
            <KpiCard label="Feed Cost" value={fmtGBP(d!.totalFeedCostPence)} sub={`${d!.totalFeedKg.toLocaleString("en-GB")} kg · ${feedPct ? feedPct + "% of income" : ""}`} icon={<Package className="w-4 h-4 text-amber-500" />} />
            <KpiCard
              label="Gross Margin"
              value={fmtGBP(d!.grossMarginPence)}
              sub={fmtPpl(d!.grossMarginPerLitrePence)}
              icon={marginPositive ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
              highlight={marginPositive ? "emerald" : "red"}
            />
          </div>

          {chartData.length > 1 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Monthly Income vs Feed Cost</h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `£${(v / 100).toFixed(0)}`} tick={{ fontSize: 11 }} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Milk Income" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Feed Cost" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={40} />
                    <Line type="monotone" dataKey="Gross Margin" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold">Cost of Production Summary — {d!.year}</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-foreground/60 text-xs">
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-right">per Litre</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Milk income", value: d!.totalMilkIncomePence, ppl: d!.pencePerLitre, bold: false, positive: true },
                  { label: `Feed cost (${d!.feedDeliveryCount} deliveries · ${d!.totalFeedKg.toLocaleString("en-GB")} kg)`, value: -d!.totalFeedCostPence, ppl: d!.feedCostPerLitrePence ? -d!.feedCostPerLitrePence : null, bold: false },
                  ...(d!.dairyPurchaseCostPence > 0 ? [{ label: "Livestock purchases (dairy)", value: -d!.dairyPurchaseCostPence, ppl: null as null, bold: false }] : []),
                  { label: "Total variable costs", value: -d!.totalVariableCostPence, ppl: null, bold: true, divider: true },
                  { label: "Gross margin", value: d!.grossMarginPence, ppl: d!.grossMarginPerLitrePence, bold: true, highlight: marginPositive ? "emerald" as const : "red" as const },
                ].map((row, i) => {
                  const ppl = row.ppl ?? (d!.totalVolumeLitres > 0 && row.value !== 0 ? row.value / d!.totalVolumeLitres : null);
                  return (
                    <tr key={i} className={`border-t ${(row as any).divider ? "border-t-2 border-border" : "border-border/40"} ${(row as any).highlight === "emerald" ? "bg-emerald-50/30" : (row as any).highlight === "red" ? "bg-red-50/30" : ""}`}>
                      <td className={`px-4 py-2 ${row.bold ? "font-semibold" : ""}`}>{row.label}</td>
                      <td className={`px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${(row as any).highlight === "emerald" ? "text-emerald-700" : (row as any).highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : (row as any).positive ? "text-emerald-700" : ""}`}>
                        {row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value)}
                      </td>
                      <td className="px-4 py-2 text-right text-foreground/40 text-xs">
                        {ppl != null ? `${ppl >= 0 ? "" : "-"}${Math.abs(ppl).toFixed(2)}p/L` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">
              Feed cost from priced deliveries tagged to dairy/cattle. Vet, AI, contractor, and fixed costs not included — add via Financial for a complete P&amp;L. Organic dairy farmers: NMR recording visit data is in the Recording Visits tab.
            </div>
          </div>

          {d!.monthlyBreakdown.length > 0 && (
            <Collapsible title={`Monthly Breakdown (${d!.monthlyBreakdown.length} months)`} open={showMonthly} setOpen={setShowMonthly}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/20 text-foreground/60">
                    <th className="px-3 py-2 text-left">Month</th>
                    <th className="px-3 py-2 text-right">Collections</th>
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
                      <td className="px-3 py-1.5 font-medium">{monthLabel(m.month)}</td>
                      <td className="px-3 py-1.5 text-right text-foreground/60">{m.collections}</td>
                      <td className="px-3 py-1.5 text-right">{m.volumeLitres.toLocaleString("en-GB", { maximumFractionDigits: 0 })}</td>
                      <td className="px-3 py-1.5 text-right text-emerald-700 font-medium">{fmtGBP(m.incomePence)}</td>
                      <td className="px-3 py-1.5 text-right text-foreground/60">{m.pplActual != null ? `${m.pplActual.toFixed(2)}p` : "—"}</td>
                      <td className="px-3 py-1.5 text-right text-amber-700">{m.feedCostPence > 0 ? fmtGBP(m.feedCostPence) : "—"}</td>
                      <td className={`px-3 py-1.5 text-right font-medium ${m.grossMarginPence >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmtGBP(m.grossMarginPence)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-border bg-muted/20 font-semibold text-xs">
                    <td className="px-3 py-2">Total</td>
                    <td className="px-3 py-2 text-right">{d!.collectionCount}</td>
                    <td className="px-3 py-2 text-right">{fmtVol(d!.totalVolumeLitres)}</td>
                    <td className="px-3 py-2 text-right text-emerald-700">{fmtGBP(d!.totalMilkIncomePence)}</td>
                    <td className="px-3 py-2 text-right">{fmtPpl(d!.pencePerLitre)}</td>
                    <td className="px-3 py-2 text-right text-amber-700">{fmtGBP(d!.totalFeedCostPence)}</td>
                    <td className={`px-3 py-2 text-right ${marginPositive ? "text-emerald-700" : "text-red-600"}`}>{fmtGBP(d!.grossMarginPence)}</td>
                  </tr>
                </tbody>
              </table>
            </Collapsible>
          )}
        </>
      )}
    </div>
  );
}
