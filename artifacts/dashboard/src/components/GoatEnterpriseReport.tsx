import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { TrendingUp, TrendingDown, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface CullRecord {
  id: number;
  cullDate: string;
  numberCulled: number;
  ageClass: string | null;
  reasonForCulling: string;
  destination: string;
  averageLiveWeightKg: string | null;
  averageDeadweightKg: string | null;
  pricePerHeadGbp: string | null;
  totalValueGbp: string | null;
  finishGrade: string | null;
  abattoirName: string | null;
}

interface GoatReportData {
  year: number;
  totalHeadSold: number;
  totalRevenuePence: number;
  avgPricePerHeadPence: number | null;
  totalFeedCostPence: number;
  totalVetCostPence: number;
  totalVariableCostPence: number;
  grossMarginPence: number;
  grossMarginPerHeadPence: number | null;
  byDestination: { destination: string; head: number; revenue: number }[];
  cullRecords: CullRecord[];
}

const PRINT_ID = "goat-enterprise-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
  document.head.appendChild(s);
}

function fmtGBP(p: number) {
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function monthLabel(d: string) {
  return new Date(d.slice(0, 7) + "-01").toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
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
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" ? fmtGBP(Math.abs(p.value)) : p.value}
        </p>
      ))}
    </div>
  );
};

export function GoatEnterpriseReport({ farmId }: { farmId: number }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = usePersistedNumberFilter({ page: "goat-enterprise-report", filter: "year", farmId, defaultValue: currentYear });
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (s: string) => setOpenSection(v => v === s ? null : s);

  const { data, isLoading } = useQuery<GoatReportData>({
    queryKey: ["goat-enterprise-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/goat-enterprise-report?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  if (isLoading) return <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>;

  const d = data;
  const hasData = d && (d.totalHeadSold > 0 || d.totalFeedCostPence > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;

  const chartData = useMemo(() => {
    if (!d) return [];
    const map: Record<string, { revenue: number; feedCost: number }> = {};
    d.cullRecords.forEach(r => {
      const m = r.cullDate.slice(0, 7);
      if (!map[m]) map[m] = { revenue: 0, feedCost: 0 };
      map[m].revenue += Math.round((parseFloat(r.totalValueGbp ?? "0") || 0) * 100);
    });
    return Object.entries(map).sort().map(([m, v]) => ({
      label: monthLabel(m),
      "Sale Revenue": v.revenue,
      "Feed Cost": v.feedCost,
      "Gross Margin": v.revenue - v.feedCost,
    }));
  }, [d]);

  return (
    <div id={PRINT_ID} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Goat Enterprise Report</h2>
          <p className="text-sm text-foreground/50">Sale revenue · Price per head · Gross margin by destination</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
            value={year}
            onChange={e => setYear(parseInt(e.target.value))}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={() => { ensurePrintStyle(); window.print(); }}
            className="h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50"
          >
            <Printer className="w-3.5 h-3.5" />Print
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">
          No cull/market records found for {year}. Record goat sales in the Cull / Market tab.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Head Sold</span>
              <p className="text-lg font-bold">{d!.totalHeadSold.toLocaleString("en-GB")}</p>
              <p className="text-xs text-foreground/40">{d!.cullRecords.length} sale{d!.cullRecords.length !== 1 ? "s" : ""} recorded</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Sale Revenue</span>
              <p className="text-lg font-bold text-emerald-700">{fmtGBP(d!.totalRevenuePence)}</p>
              <p className="text-xs text-foreground/40">
                {d!.avgPricePerHeadPence != null ? `avg ${fmtGBP(d!.avgPricePerHeadPence)}/head` : "—"}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-3">
              <span className="text-xs text-foreground/50">Variable Costs</span>
              <p className="text-lg font-bold">{fmtGBP(d!.totalVariableCostPence)}</p>
              <p className="text-xs text-foreground/40">
                {d!.totalFeedCostPence > 0 && `Feed ${fmtGBP(d!.totalFeedCostPence)}`}
                {d!.totalVetCostPence > 0 && ` · Vet ${fmtGBP(d!.totalVetCostPence)}`}
                {d!.totalVariableCostPence === 0 && "Add via Financial"}
              </p>
            </div>
            <div className={`rounded-xl border p-3 ${marginPositive ? "border-emerald-200 bg-emerald-50/50" : "border-red-200 bg-red-50/50"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground/50">Gross Margin</span>
                {marginPositive
                  ? <TrendingUp className="w-4 h-4 text-emerald-500" />
                  : <TrendingDown className="w-4 h-4 text-red-500" />}
              </div>
              <p className={`text-lg font-bold ${marginPositive ? "text-emerald-700" : "text-red-600"}`}>
                {fmtGBP(d!.grossMarginPence)}
              </p>
              <p className="text-xs text-foreground/40">
                {d!.grossMarginPerHeadPence != null ? `${fmtGBP(d!.grossMarginPerHeadPence)}/head` : "—"}
              </p>
            </div>
          </div>

          {chartData.length > 1 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Monthly Sale Revenue — {year}</h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={220}>
                  <ComposedChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `£${(v / 100).toFixed(0)}`} tick={{ fontSize: 11 }} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Sale Revenue" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={36} />
                    {d!.totalFeedCostPence > 0 && (
                      <Bar dataKey="Feed Cost" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={36} />
                    )}
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
                </tr>
              </thead>
              <tbody>
                {[
                  { label: `Sale revenue (${d!.totalHeadSold} head, ${d!.cullRecords.length} lots)`, value: d!.totalRevenuePence, positive: true },
                  ...(d!.totalFeedCostPence > 0 ? [{ label: "Feed cost", value: -d!.totalFeedCostPence }] : []),
                  ...(d!.totalVetCostPence > 0 ? [{ label: "Vet & medicine", value: -d!.totalVetCostPence }] : []),
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
              Feed costs from priced deliveries tagged to goats. Bedding, haulage, vet, and fixed costs should be added via Financial for a complete P&amp;L.
            </div>
          </div>

          {d!.byDestination.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Sales by Destination</h3>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/20 text-foreground/60 text-xs">
                  <th className="px-4 py-2 text-left">Destination</th>
                  <th className="px-4 py-2 text-right">Head</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                  <th className="px-4 py-2 text-right">Avg/Head</th>
                </tr></thead>
                <tbody>
                  {d!.byDestination.map((row, i) => (
                    <tr key={i} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-4 py-2 capitalize">{row.destination.replace(/_/g, " ")}</td>
                      <td className="px-4 py-2 text-right">{row.head}</td>
                      <td className="px-4 py-2 text-right text-emerald-700 font-medium">{fmtGBP(row.revenue)}</td>
                      <td className="px-4 py-2 text-right text-foreground/50">{row.head > 0 ? fmtGBP(row.revenue / row.head) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {d!.cullRecords.length > 0 && (
            <Collapsible
              title={`Cull / Market Records (${d!.cullRecords.length} lots · ${d!.totalHeadSold} head)`}
              open={openSection === "culls"}
              setOpen={v => toggle(v ? "culls" : "")}
            >
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-right">Head</th>
                  <th className="px-3 py-2 text-left">Destination</th>
                  <th className="px-3 py-2 text-left">Age Class</th>
                  <th className="px-3 py-2 text-right">Avg LW (kg)</th>
                  <th className="px-3 py-2 text-right">£/Head</th>
                  <th className="px-3 py-2 text-right">Total Value</th>
                </tr></thead>
                <tbody>
                  {d!.cullRecords.map(r => (
                    <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{new Date(r.cullDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-1.5 text-right">{r.numberCulled}</td>
                      <td className="px-3 py-1.5 capitalize">{r.destination.replace(/_/g, " ")}</td>
                      <td className="px-3 py-1.5">{r.ageClass ?? "—"}</td>
                      <td className="px-3 py-1.5 text-right">{r.averageLiveWeightKg ? parseFloat(r.averageLiveWeightKg).toFixed(1) : "—"}</td>
                      <td className="px-3 py-1.5 text-right">{r.pricePerHeadGbp ? `£${parseFloat(r.pricePerHeadGbp).toFixed(2)}` : "—"}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-emerald-700">
                        {r.totalValueGbp ? `£${parseFloat(r.totalValueGbp).toFixed(2)}` : "—"}
                      </td>
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
