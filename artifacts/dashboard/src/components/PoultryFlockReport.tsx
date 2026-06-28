import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { TrendingUp, TrendingDown, Bird, ChevronDown, ChevronUp } from "lucide-react";

interface FlockOption { id: number; flockNumber: string; species: string; placementDate: string; status: string; }
interface PoultryFlockReportData {
  flockId: number;
  flockNumber: string;
  species: string;
  placementDate: string;
  depletionDate: string | null;
  totalBirdsPlaced: number;
  totalBirdsDelivered: number;
  totalLiveweightKg: number;
  totalChickCostPence: number;
  totalFeedCostPence: number;
  totalFeedKg: number;
  totalVariableCostPence: number;
  totalRevenuePence: number;
  grossMarginPence: number;
  grossMarginPerBirdPence: number | null;
  costPerBirdPence: number | null;
  revenuePerKgLwPence: number | null;
  feedCostPerBirdPence: number | null;
  feedKgPerBird: number | null;
  avgFcr: number | null;
  mortalityRate: number | null;
  settlements: { id: number; settlementDate: string; birdsDelivered: number; totalLiveweightKg: string; grossValuePence: number; netPaymentPence: number; fcr: string; ebi: string }[];
  chickPurchases: { id: number; deliveryDate: string; numberOfBirdsReceived: number; pricePer100BirdsPence: number; totalCostPence: number }[];
  feedDeliveries: { id: number; deliveryDate: string; productName: string; quantityKg: string; costPence: number }[];
}

function fmtGBP(pence: number) { return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtGBPnull(pence: number | null) { return pence != null ? fmtGBP(pence) : "—"; }

export function PoultryFlockReport({ farmId }: { farmId: number }) {
  const [selectedFlockId, setSelectedFlockId] = useState<number | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

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
  const toggle = (s: string) => setOpenSection(v => v === s ? null : s);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold">Poultry Flock Report</h2>
          <p className="text-sm text-foreground/50">Cost per bird, FCR, producer margin per flock</p>
        </div>
        {flocks.length > 0 && (
          <select className="h-9 rounded-lg border border-border bg-background px-3 text-sm" value={activeFlockId ?? ""} onChange={e => setSelectedFlockId(parseInt(e.target.value))}>
            {flocks.map(f => <option key={f.id} value={f.id}>{f.flockNumber} — {f.species} ({new Date(f.placementDate).toLocaleDateString("en-GB")}) [{f.status}]</option>)}
          </select>
        )}
      </div>

      {!activeFlockId ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">No flocks found. Create a flock in the Flocks tab first.</div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16 text-foreground/40 text-sm">Loading report…</div>
      ) : !hasData ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm">No settlement, chick purchase, or priced feed data found for this flock.</div>
      ) : (
        <>
          {/* Flock info bar */}
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-2.5 flex flex-wrap gap-4 text-sm">
            <span><strong>Flock:</strong> {d!.flockNumber}</span>
            <span><strong>Species:</strong> {d!.species}</span>
            <span><strong>Placed:</strong> {d!.placementDate ? new Date(d!.placementDate).toLocaleDateString("en-GB") : "—"}</span>
            {d!.depletionDate && <span><strong>Depleted:</strong> {new Date(d!.depletionDate).toLocaleDateString("en-GB")}</span>}
          </div>

          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="Birds Placed" value={d!.totalBirdsPlaced.toLocaleString("en-GB")} sub={d!.mortalityRate != null ? `${d!.mortalityRate.toFixed(1)}% mortality` : "—"} icon={<Bird className="w-4 h-4 text-orange-500" />} />
            <KpiCard label="Revenue" value={fmtGBP(d!.totalRevenuePence)} sub={d!.revenuePerKgLwPence != null ? `${(d!.revenuePerKgLwPence / 100).toFixed(2)}p/kg LW` : "—"} icon={<TrendingUp className="w-4 h-4 text-emerald-500" />} />
            <KpiCard label="Gross Margin" value={fmtGBP(d!.grossMarginPence)} sub={fmtGBPnull(d!.grossMarginPerBirdPence) + "/bird"} icon={marginPositive ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />} highlight={marginPositive ? "emerald" : "red"} />
            <KpiCard label="Avg FCR" value={d!.avgFcr != null ? d!.avgFcr.toFixed(2) : "—"} sub={d!.feedKgPerBird != null ? `${d!.feedKgPerBird.toFixed(2)} kg feed/bird` : "—"} icon={<Bird className="w-4 h-4 text-blue-500" />} />
          </div>

          {/* Summary table */}
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
                  { label: "Settlement revenue", value: d!.totalRevenuePence, positive: true },
                  { label: `Chick/poult cost (${d!.chickPurchases.length} purchases)`, value: -d!.totalChickCostPence },
                  { label: `Feed cost (${d!.feedDeliveries.length} deliveries · ${d!.totalFeedKg.toLocaleString("en-GB")} kg)`, value: -d!.totalFeedCostPence },
                  { label: "Total variable costs", value: -d!.totalVariableCostPence, bold: true, divider: true },
                  { label: "Producer gross margin", value: d!.grossMarginPence, bold: true, highlight: marginPositive ? "emerald" as const : "red" as const },
                ].map((row, i) => (
                  <tr key={i} className={`border-t ${row.divider ? "border-t-2 border-border" : "border-border/40"} ${row.highlight === "emerald" ? "bg-emerald-50/30" : row.highlight === "red" ? "bg-red-50/30" : ""}`}>
                    <td className={`px-4 py-2 ${row.bold ? "font-semibold" : ""}`}>{row.label}</td>
                    <td className={`px-4 py-2 text-right font-mono ${row.bold ? "font-bold" : ""} ${row.highlight === "emerald" ? "text-emerald-700" : row.highlight === "red" ? "text-red-600" : row.value < 0 ? "text-red-600" : row.positive ? "text-emerald-700" : ""}`}>
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
              Feed cost includes deliveries tagged to poultry/broilers in the date range of this flock. Heating, bedding/litter, and catch contractor costs not included — add via Financial.
            </div>
          </div>

          {/* Performance metrics */}
          {(d!.avgFcr != null || d!.mortalityRate != null) && (
            <div className="rounded-xl border border-border bg-card px-4 py-3">
              <h3 className="text-sm font-semibold mb-3">Production Performance</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {d!.avgFcr != null && <Metric label="Avg FCR" value={d!.avgFcr.toFixed(2)} note="kg feed per kg LW" />}
                {d!.mortalityRate != null && <Metric label="Mortality Rate" value={`${d!.mortalityRate.toFixed(1)}%`} note={`${d!.totalBirdsPlaced - d!.totalBirdsDelivered} birds`} />}
                {d!.feedKgPerBird != null && <Metric label="Feed/Bird" value={`${d!.feedKgPerBird.toFixed(2)} kg`} note="total feed per bird placed" />}
                {d!.feedCostPerBirdPence != null && <Metric label="Feed Cost/Bird" value={fmtGBP(d!.feedCostPerBirdPence)} note="variable feed cost" />}
              </div>
            </div>
          )}

          {/* Detail sections */}
          {d!.settlements.length > 0 && (
            <Collapsible title={`Settlements (${d!.settlements.length})`} open={openSection === "settlements"} setOpen={() => toggle("settlements")}>
              <table className="w-full text-xs">
                <thead><tr className="bg-muted/20 text-foreground/60"><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Birds</th><th className="px-3 py-2 text-right">LW (kg)</th><th className="px-3 py-2 text-right">FCR</th><th className="px-3 py-2 text-right">EBI</th><th className="px-3 py-2 text-right">Net Payment</th></tr></thead>
                <tbody>
                  {d!.settlements.map(s => (
                    <tr key={s.id} className="border-t border-border/40 hover:bg-muted/20">
                      <td className="px-3 py-1.5">{s.settlementDate ? new Date(s.settlementDate).toLocaleDateString("en-GB") : "—"}</td>
                      <td className="px-3 py-1.5 text-right">{s.birdsDelivered?.toLocaleString("en-GB") ?? "—"}</td>
                      <td className="px-3 py-1.5 text-right">{s.totalLiveweightKg != null ? parseFloat(String(s.totalLiveweightKg)).toLocaleString("en-GB") : "—"}</td>
                      <td className="px-3 py-1.5 text-right">{s.fcr ?? "—"}</td>
                      <td className="px-3 py-1.5 text-right">{s.ebi ?? "—"}</td>
                      <td className="px-3 py-1.5 text-right font-medium text-emerald-700">{s.netPaymentPence ? fmtGBP(s.netPaymentPence) : "—"}</td>
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

function Metric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div>
      <p className="text-xs text-foreground/50">{label}</p>
      <p className="text-base font-bold">{value}</p>
      <p className="text-xs text-foreground/40">{note}</p>
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
