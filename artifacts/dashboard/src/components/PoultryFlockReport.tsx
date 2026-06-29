import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TrendingUp, TrendingDown, Bird, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface FlockOption { id: number; flockNumber: string; species: string; placementDate: string; status: string; }
interface Settlement { id: number; settlementDate: string; birdsDelivered: number; totalLiveweightKg: string; grossValuePence: number; netPaymentPence: number; fcr: string; ebi: string; }
interface ChickPurchase { id: number; deliveryDate: string; numberOfBirdsReceived: number; pricePer100BirdsPence: number; totalCostPence: number; }
interface FeedDelivery { id: number; deliveryDate: string; productName: string; quantityKg: string; costPence: number; }

interface PoultryFlockReportData {
  flockId: number; flockNumber: string; species: string; placementDate: string; depletionDate: string | null;
  totalBirdsPlaced: number; totalBirdsDelivered: number; totalLiveweightKg: number;
  totalChickCostPence: number; totalFeedCostPence: number; totalFeedKg: number;
  totalVariableCostPence: number; totalRevenuePence: number; grossMarginPence: number;
  grossMarginPerBirdPence: number | null; costPerBirdPence: number | null;
  revenuePerKgLwPence: number | null; feedCostPerBirdPence: number | null; feedKgPerBird: number | null;
  avgFcr: number | null; mortalityRate: number | null;
  settlements: Settlement[]; chickPurchases: ChickPurchase[]; feedDeliveries: FeedDelivery[];
}

const PRINT_ID = "poultry-flock-report-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
  document.head.appendChild(s);
}

function fmtGBP(p: number) { return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtGBPnull(p: number | null) { return p != null ? fmtGBP(p) : "—"; }

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

function KpiCard({ label, value, sub, icon, highlight }: { label: string; value: string; sub: string; icon: React.ReactNode; highlight?: "emerald" | "red" }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight === "emerald" ? "border-emerald-200 bg-emerald-50/50" : highlight === "red" ? "border-red-200 bg-red-50/50" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between mb-1"><span className="text-xs text-foreground/50">{label}</span>{icon}</div>
      <p className={`text-lg font-bold ${highlight === "emerald" ? "text-emerald-700" : highlight === "red" ? "text-red-600" : ""}`}>{value}</p>
      <p className="text-xs text-foreground/40 mt-0.5">{sub}</p>
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

export function PoultryFlockReport({ farmId }: { farmId: number }) {
  const [selectedFlockId, setSelectedFlockId] = useState<number | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (s: string) => setOpenSection(v => v === s ? null : s);

  const { data: flockList } = useQuery<{ flocks: FlockOption[] }>({
    queryKey: ["poultry-flocks-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/poultry-flocks`).then(r => r.json()),
    enabled: !!farmId,
  });

  const flocks = flockList?.flocks ?? [];
  const activeFlockId = selectedFlockId ?? (flocks[0]?.id ?? null);

  const { data, isLoading } = useQuery<PoultryFlockReportData>({
    queryKey: ["poultry-flock-report", farmId, activeFlockId],
    queryFn: () => fetch(`/api/farms/${farmId}/poultry-flock-report?flockId=${activeFlockId}`).then(r => r.json()),
    enabled: !!farmId && !!activeFlockId,
  });

  const d = data;
  const hasData = d && (d.totalBirdsPlaced > 0 || d.totalRevenuePence > 0 || d.totalVariableCostPence > 0);
  const marginPositive = (d?.grossMarginPence ?? 0) >= 0;

  const settlementChartData = (d?.settlements ?? []).map((s, i) => ({
    label: s.settlementDate ? new Date(s.settlementDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : `Settlement ${i + 1}`,
    "Revenue": s.netPaymentPence,
    "Birds": s.birdsDelivered,
  }));

  const mortalityCount = d && d.totalBirdsPlaced > d.totalBirdsDelivered ? d.totalBirdsPlaced - d.totalBirdsDelivered : 0;

  return (
    <div id={PRINT_ID} className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h2 className="text-lg font-semibold">Poultry Flock Report</h2>
          <p className="text-sm text-foreground/50">Cost per bird · FCR · Producer margin · Mortality</p>
        </div>
        <div className="flex items-center gap-2">
          {flocks.length > 0 && (
            <select className="h-9 rounded-lg border border-border bg-background px-3 text-sm" value={activeFlockId ?? ""} onChange={e => setSelectedFlockId(parseInt(e.target.value))}>
              {flocks.map(f => <option key={f.id} value={f.id}>{f.flockNumber} — {f.species} ({new Date(f.placementDate).toLocaleDateString("en-GB")}) [{f.status}]</option>)}
            </select>
          )}
          <button onClick={() => { ensurePrintStyle(); window.print(); }} className="h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50">
            <Printer className="w-3.5 h-3.5" />Print
          </button>
        </div>
      </div>

      {!activeFlockId ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">No flocks found. Create a flock in the Flocks tab first.</div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>
      ) : !hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">No settlement, chick purchase, or priced feed data found for this flock.</div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-2.5 flex flex-wrap gap-4 text-sm">
            <span><strong>Flock:</strong> {d!.flockNumber}</span>
            <span><strong>Species:</strong> {d!.species}</span>
            <span><strong>Placed:</strong> {d!.placementDate ? new Date(d!.placementDate).toLocaleDateString("en-GB") : "—"}</span>
            {d!.depletionDate && <span><strong>Depleted:</strong> {new Date(d!.depletionDate).toLocaleDateString("en-GB")}</span>}
            <span><strong>Birds Placed:</strong> {d!.totalBirdsPlaced.toLocaleString("en-GB")}</span>
            {d!.mortalityRate != null && <span className={d!.mortalityRate > 4 ? "text-red-600 font-medium" : "text-foreground/70"}><strong>Mortality:</strong> {d!.mortalityRate.toFixed(1)}% ({mortalityCount} birds)</span>}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Settlement Revenue" value={fmtGBP(d!.totalRevenuePence)} sub={d!.revenuePerKgLwPence != null ? `${(d!.revenuePerKgLwPence / 100).toFixed(2)}p/kg LW` : "—"} icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
            <KpiCard label="Variable Cost/Bird" value={fmtGBPnull(d!.costPerBirdPence)} sub={`Chicks ${fmtGBP(d!.totalChickCostPence)} · Feed ${fmtGBP(d!.totalFeedCostPence)}`} icon={<Bird className="w-4 h-4 text-orange-500" />} />
            <KpiCard label="Avg FCR" value={d!.avgFcr != null ? d!.avgFcr.toFixed(2) : "—"} sub={d!.feedKgPerBird != null ? `${d!.feedKgPerBird.toFixed(2)} kg feed/bird placed` : "—"} icon={<Bird className="w-4 h-4 text-blue-500" />} />
            <KpiCard label="Gross Margin" value={fmtGBP(d!.grossMarginPence)} sub={d!.grossMarginPerBirdPence != null ? `${fmtGBPnull(d!.grossMarginPerBirdPence)}/bird` : "—"} icon={marginPositive ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />} highlight={marginPositive ? "emerald" : "red"} />
          </div>

          {settlementChartData.length > 1 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <h3 className="text-sm font-semibold">Settlement Revenue by Catch</h3>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={190}>
                  <BarChart data={settlementChartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => `£${(v / 100).toFixed(0)}`} tick={{ fontSize: 11 }} width={60} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Revenue" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30"><h3 className="text-sm font-semibold">Flock Financial Summary</h3></div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/20 text-foreground/60 text-xs">
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-right">Per Bird Placed</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: `Settlement revenue (${d!.settlements.length} catches · ${d!.totalBirdsDelivered.toLocaleString("en-GB")} birds delivered)`, value: d!.totalRevenuePence, positive: true },
                  { label: `Chick/poult cost (${d!.chickPurchases.length} purchases)`, value: -d!.totalChickCostPence },
                  { label: `Feed cost (${d!.feedDeliveries.length} deliveries · ${d!.totalFeedKg.toLocaleString("en-GB")} kg)`, value: -d!.totalFeedCostPence },
                  { label: "Total variable costs", value: -d!.totalVariableCostPence, bold: true, divider: true },
                  { label: "Producer gross margin", value: d!.grossMarginPence, bold: true, highlight: marginPositive ? "emerald" as const : "red" as const },
                ].map((row, i) => (
                  <tr key={i} className={`border-t ${(row as any).divider ? "border-t-2 border-border" : "border-border/40"} ${(row as any).highlight === "emerald" ? "bg-emerald-50/30" : (row as any).highlight === "red" ? "bg-red-50/30" : ""}`}>
                    <td className={`px-4 py-2 ${row.bold ? "font-semibold" : ""}`}>{row.label}</td>
                    <td className={`px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${(row as any).highlight === "emerald" ? "text-emerald-700" : (row as any).highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : (row as any).positive ? "text-emerald-700" : ""}`}>
                      {row.value < 0 ? `-${fmtGBP(-row.value)}` : fmtGBP(row.value)}
                    </td>
                    <td className="px-4 py-2 text-right text-foreground/50 text-xs">
                      {d!.totalBirdsPlaced > 0 ? fmtGBP(Math.abs(row.value) / d!.totalBirdsPlaced) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2 bg-muted/20 text-xs text-foreground/40">
              Feed cost from deliveries tagged to poultry/broilers during flock period. Heating, bedding/litter, catch contractor, and vet costs should be added via Financial for a complete P&amp;L.
            </div>
          </div>

          {(d!.avgFcr != null || d!.mortalityRate != null || d!.feedKgPerBird != null) && (
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <h3 className="text-sm font-semibold mb-3">Production Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {d!.avgFcr != null && (
                  <div>
                    <p className="text-xs text-foreground/50">Avg FCR</p>
                    <p className={`text-base font-bold ${d!.avgFcr < 1.8 ? "text-emerald-700" : d!.avgFcr > 2.2 ? "text-red-600" : ""}`}>{d!.avgFcr.toFixed(2)}</p>
                    <p className="text-xs text-foreground/40">{d!.avgFcr < 1.8 ? "Excellent" : d!.avgFcr < 2.0 ? "Good" : d!.avgFcr < 2.2 ? "Average" : "Above target"}</p>
                  </div>
                )}
                {d!.mortalityRate != null && (
                  <div>
                    <p className="text-xs text-foreground/50">Mortality Rate</p>
                    <p className={`text-base font-bold ${d!.mortalityRate < 3 ? "text-emerald-700" : d!.mortalityRate > 5 ? "text-red-600" : "text-amber-600"}`}>{d!.mortalityRate.toFixed(1)}%</p>
                    <p className="text-xs text-foreground/40">{mortalityCount} birds · {d!.mortalityRate < 3 ? "Within target" : d!.mortalityRate > 5 ? "Investigate" : "Monitor"}</p>
                  </div>
                )}
                {d!.feedKgPerBird != null && (
                  <div>
                    <p className="text-xs text-foreground/50">Feed per Bird</p>
                    <p className="text-base font-bold">{d!.feedKgPerBird.toFixed(2)} kg</p>
                    <p className="text-xs text-foreground/40">total feed / birds placed</p>
                  </div>
                )}
                {d!.feedCostPerBirdPence != null && (
                  <div>
                    <p className="text-xs text-foreground/50">Feed Cost/Bird</p>
                    <p className="text-base font-bold">{fmtGBP(d!.feedCostPerBirdPence)}</p>
                    <p className="text-xs text-foreground/40">variable feed cost only</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {d!.settlements.length > 0 && (
            <Collapsible title={`Settlement Records (${d!.settlements.length} catches · ${d!.totalBirdsDelivered.toLocaleString("en-GB")} birds · ${d!.totalLiveweightKg.toLocaleString("en-GB")} kg LW)`} open={openSection === "settlements"} setOpen={v => toggle(v ? "settlements" : "")}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60">
                  <th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Birds</th>
                  <th className="px-3 py-2 text-right">LW (kg)</th><th className="px-3 py-2 text-right">FCR</th>
                  <th className="px-3 py-2 text-right">EBI</th><th className="px-3 py-2 text-right">Net Payment</th>
                </tr></thead>
                <tbody>
                  {d!.settlements.map(s => (
                    <tr key={s.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{s.settlementDate ? new Date(s.settlementDate).toLocaleDateString("en-GB") : "—"}</td>
                      <td className="px-3 py-1.5 text-right">{s.birdsDelivered?.toLocaleString("en-GB") ?? "—"}</td>
                      <td className="px-3 py-1.5 text-right">{s.totalLiveweightKg != null ? parseFloat(String(s.totalLiveweightKg)).toLocaleString("en-GB") : "—"}</td>
                      <td className="px-3 py-1.5 text-right font-medium">{s.fcr ?? "—"}</td>
                      <td className="px-3 py-1.5 text-right">{s.ebi ?? "—"}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-emerald-700">{s.netPaymentPence ? fmtGBP(s.netPaymentPence) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Collapsible>
          )}

          {d!.chickPurchases.length > 0 && (
            <Collapsible title={`Chick/Poult Purchases (${d!.chickPurchases.length})`} open={openSection === "chicks"} setOpen={v => toggle(v ? "chicks" : "")}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60">
                  <th className="px-3 py-2 text-left">Delivery Date</th><th className="px-3 py-2 text-right">Birds Received</th>
                  <th className="px-3 py-2 text-right">Price/100 Birds</th><th className="px-3 py-2 text-right">Total Cost</th>
                </tr></thead>
                <tbody>
                  {d!.chickPurchases.map(c => (
                    <tr key={c.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{new Date(c.deliveryDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-1.5 text-right">{c.numberOfBirdsReceived.toLocaleString("en-GB")}</td>
                      <td className="px-3 py-1.5 text-right">{c.pricePer100BirdsPence ? fmtGBP(c.pricePer100BirdsPence) : "—"}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-red-700">{fmtGBP(c.totalCostPence)}</td>
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
