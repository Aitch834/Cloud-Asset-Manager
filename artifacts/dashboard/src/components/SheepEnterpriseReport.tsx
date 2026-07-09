import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface SheepReportData {
  flockYear: string;
  totalHeadSold: number; totalWoolKg: number;
  totalCullRevenuePence: number; totalWoolRevenuePence: number; totalRevenuePence: number;
  totalFeedCostPence: number; totalFeedKg: number; totalPurchaseCostPence: number; totalHeadPurchased: number; totalVetCostPence: number;
  totalContractorCostPence?: number;
  totalVariableCostPence: number; grossMarginPence: number; grossMarginPerHeadSoldPence: number | null;
  avgWoolPricePerKgGbp: number | null;
  cullRecords: { id: number; cullDate: string; numberOfHead: number; pricePerHeadGbp: string; totalValueGbp: string; reason: string }[];
  shearingRecords: { id: number; shearingDate: string; headSheared: number; totalWoolWeightKg: string; pricePerKgGbp: string; totalValueGbp: string }[];
  feedDeliveries: { id: number; deliveryDate: string; productName: string; quantityKg: string; costPence: number }[];
  purchases: { id: number; invoiceDate: string; numberOfHead: number; totalAmountPence: number; pricePerHeadPence: number }[];
}

const PRINT_ID = "sheep-enterprise-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
  document.head.appendChild(s);
}

function fmtGBP(p: number) { return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtGBPv(v: number) { return `£${v.toFixed(2)}`; }
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

export function SheepEnterpriseReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const currentFlockYear = new Date().getMonth() >= 7 ? currentYear : currentYear - 1;
  const [year, setYear] = useState(currentFlockYear);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (s: string) => setOpenSection(v => v === s ? null : s);

  const { data, isLoading } = useQuery<SheepReportData>({
    queryKey: ["sheep-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/sheep-enterprise-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentFlockYear - i);
  if (isLoading) return <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>;

  const d = data;
  const hasData = d && (d.totalHeadSold > 0 || d.totalFeedCostPence > 0 || d.totalPurchaseCostPence > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;

  const chartData = useMemo(() => {
    if (!d) return [];
    const map: Record<string, { cullRevenue: number; woolRevenue: number; feedCost: number }> = {};
    d.cullRecords.forEach(r => {
      const m = r.cullDate.slice(0, 7);
      if (!map[m]) map[m] = { cullRevenue: 0, woolRevenue: 0, feedCost: 0 };
      map[m].cullRevenue += Math.round(parseFloat(String(r.totalValueGbp)) * 100);
    });
    d.shearingRecords.forEach(r => {
      const m = r.shearingDate.slice(0, 7);
      if (!map[m]) map[m] = { cullRevenue: 0, woolRevenue: 0, feedCost: 0 };
      map[m].woolRevenue += Math.round(parseFloat(String(r.totalValueGbp)) * 100);
    });
    d.feedDeliveries.forEach(f => {
      const m = f.deliveryDate.slice(0, 7);
      if (!map[m]) map[m] = { cullRevenue: 0, woolRevenue: 0, feedCost: 0 };
      map[m].feedCost += f.costPence;
    });
    return Object.entries(map).sort().map(([m, v]) => ({
      label: monthLabel(m),
      "Lamb/Cull Sales": v.cullRevenue,
      "Wool Sales": v.woolRevenue,
      "Feed Cost": v.feedCost,
    }));
  }, [d]);

  const avgLambPrice = d && d.cullRecords.length > 0
    ? d.cullRecords.reduce((s, r) => s + parseFloat(String(r.pricePerHeadGbp)), 0) / d.cullRecords.length
    : null;

  return (
    <div id={PRINT_ID} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Sheep Enterprise Report</h2>
          <p className="text-sm text-foreground/50">Flock year Aug–Jul · Gross margin per head sold · Wool income</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-9 rounded-lg border border-border bg-background px-3 text-sm" value={year} onChange={e => setYear(parseInt(e.target.value))}>
            {years.map(y => <option key={y} value={y}>{y}/{(y + 1).toString().slice(2)}</option>)}
          </select>
          <button onClick={() => { ensurePrintStyle(); window.print(); }} className="h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50">
            <Printer className="w-3.5 h-3.5" />Print
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No cull records, shearing records, feed deliveries or purchases found for flock year {d?.flockYear ?? `${year}/${(year + 1).toString().slice(2)}`}.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Flock Year</span>
              <p className="text-lg font-bold">{d!.flockYear}</p>
              <p className="text-xs text-foreground/40">{d!.totalHeadSold} head sold · {d!.totalWoolKg.toFixed(0)} kg wool</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Total Output</span>
              <p className="text-lg font-bold text-emerald-700">{fmtGBP(d!.totalRevenuePence)}</p>
              <p className="text-xs text-foreground/40">
                {avgLambPrice ? `avg £${avgLambPrice.toFixed(2)}/head` : "Lambs"} + wool {fmtGBP(d!.totalWoolRevenuePence)}
              </p>
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
              <p className="text-xs text-foreground/40">{d!.grossMarginPerHeadSoldPence != null ? `${fmtGBP(d!.grossMarginPerHeadSoldPence)}/head sold` : "—"}</p>
            </div>
          </div>

          {chartData.length > 1 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Monthly Output vs Feed Cost — Flock Year {d!.flockYear}</h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `£${(v / 100).toFixed(0)}`} tick={{ fontSize: 11 }} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Lamb/Cull Sales" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="Wool Sales" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={36} />
                    <Bar dataKey="Feed Cost" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <h3 className="text-sm font-semibold">Enterprise Summary — Flock Year {d!.flockYear}</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-foreground/60 text-xs">
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-right">Per Head Sold</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: `Lamb/cull sales (${d!.cullRecords.length} records · ${d!.totalHeadSold} head)`, value: d!.totalCullRevenuePence, positive: true },
                  { label: `Wool sales${d!.avgWoolPricePerKgGbp ? ` · avg £${d!.avgWoolPricePerKgGbp.toFixed(2)}/kg` : ""} (${d!.totalWoolKg.toFixed(0)} kg)`, value: d!.totalWoolRevenuePence, positive: true },
                  { label: "Total output", value: d!.totalRevenuePence, bold: true, divider: true },
                  { label: `Feed cost (${d!.feedDeliveries.length} deliveries · ${d!.totalFeedKg.toLocaleString("en-GB")} kg)`, value: -d!.totalFeedCostPence },
                  { label: `Livestock purchases (${d!.totalHeadPurchased} head)`, value: -d!.totalPurchaseCostPence },
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
                    <td className="px-4 py-2 text-right text-foreground/50 text-xs">
                      {d!.totalHeadSold > 0 ? fmtGBP(Math.abs(row.value) / d!.totalHeadSold) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">
              Feed from priced deliveries tagged to sheep. Shearing contractor, dipping, scanning, vet, and fixed costs should be added via Financial for a complete enterprise P&amp;L.
            </div>
          </div>

          {d!.cullRecords.length > 0 && (
            <Collapsible title={`Lamb & Cull Sales (${d!.cullRecords.length} records · ${d!.totalHeadSold} head)`} open={openSection === "culls"} setOpen={v => toggle(v ? "culls" : "")}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60">
                  <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Head</th>
                  <th className="px-3 py-2 text-right">£/Head</th><th className="px-3 py-2 text-right">Total Value</th><th className="px-3 py-2 text-left">Reason</th>
                </tr></thead>
                <tbody>
                  {d!.cullRecords.map(r => (
                    <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{new Date(r.cullDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-1.5 text-right">{r.numberOfHead}</td>
                      <td className="px-3 py-1.5 text-right">{fmtGBPv(parseFloat(String(r.pricePerHeadGbp)))}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-emerald-700">{fmtGBPv(parseFloat(String(r.totalValueGbp)))}</td>
                      <td className="px-3 py-1.5 text-foreground/60">{r.reason ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Collapsible>
          )}

          {d!.shearingRecords.length > 0 && (
            <Collapsible title={`Shearing Records (${d!.shearingRecords.length} · ${d!.totalWoolKg.toFixed(0)} kg)`} open={openSection === "shearing"} setOpen={v => toggle(v ? "shearing" : "")}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60">
                  <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Head</th>
                  <th className="px-3 py-2 text-right">Wool (kg)</th><th className="px-3 py-2 text-right">£/kg</th><th className="px-3 py-2 text-right">Total</th>
                </tr></thead>
                <tbody>
                  {d!.shearingRecords.map(r => (
                    <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{new Date(r.shearingDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-1.5 text-right">{r.headSheared}</td>
                      <td className="px-3 py-1.5 text-right">{parseFloat(String(r.totalWoolWeightKg)).toFixed(1)}</td>
                      <td className="px-3 py-1.5 text-right">{fmtGBPv(parseFloat(String(r.pricePerKgGbp)))}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-emerald-700">{fmtGBPv(parseFloat(String(r.totalValueGbp)))}</td>
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
