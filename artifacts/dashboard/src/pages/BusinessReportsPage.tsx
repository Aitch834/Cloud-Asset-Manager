import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Printer, TrendingUp, TrendingDown, BarChart3, Package, Leaf, Tractor, PoundSterling, Calendar } from "lucide-react";

type Tab = "gross-margin" | "pl" | "input-costs" | "grain-position" | "subsidies" | "year-on-year" | "assets";

const VARIABLE_COST_CATS = ["Seeds & Seed Treatments", "Fertiliser", "Pesticides & Herbicides", "Fungicides", "Insecticides", "Veterinary & Medicine", "Feed & Bedding", "Haulage"];
const FIXED_COST_CATS = ["Labour", "Fuel", "Machinery & Equipment"];
const INCOME_CATS = ["Crop Sales", "Livestock Sales", "Agri-Environment Scheme", "Grant / Subsidy", "Other Income"];

const fmt = (p: number | null | undefined) => {
  if (p == null) return "—";
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const fmtN = (n: number | null | undefined, dp = 2) => {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
};

function StatCard({ label, value, sub, color = "#166534", bg = "#f0fdf4", border = "#bbf7d0" }: { label: string; value: string; sub?: string; color?: string; bg?: string; border?: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "0.875rem 1.125rem" }}>
      <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
      <p style={{ fontSize: "1.35rem", fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: 3 }}>{sub}</p>}
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <tr style={{ background: "#f9fafb" }}>
      <td colSpan={99} style={{ padding: "0.4rem 0.875rem", fontSize: "0.72rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #e5e7eb", borderTop: "1px solid #e5e7eb" }}>{label}</td>
    </tr>
  );
}

function TotalRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <tr style={{ background: highlight ? "#f0fdf4" : "#fff", borderTop: "2px solid #d1fae5" }}>
      <td style={{ padding: "0.6rem 0.875rem", fontWeight: 700, color: "#111827" }}>{label}</td>
      <td style={{ padding: "0.6rem 0.875rem", fontWeight: 700, color: highlight ? "#166534" : "#111827", textAlign: "right" }}>{value}</td>
    </tr>
  );
}

function DataRow({ label, value, indent }: { label: string; value: string; indent?: boolean }) {
  return (
    <tr>
      <td style={{ padding: "0.5rem 0.875rem", paddingLeft: indent ? "1.75rem" : "0.875rem", color: "#374151" }}>{label}</td>
      <td style={{ padding: "0.5rem 0.875rem", color: "#374151", textAlign: "right" }}>{value}</td>
    </tr>
  );
}

function EmptyState({ icon: Icon, message }: { icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>; message: string }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
      <Icon size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
      <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No data available</p>
      <p style={{ fontSize: "0.875rem" }}>{message}</p>
    </div>
  );
}

// ── Gross Margin Tab ─────────────────────────────────────────────────────────
function GrossMarginTab({ farmId, year }: { farmId: number; year: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-gross-margin", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/gross-margin?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const harvests: any[] = data?.harvests ?? [];
  const costs: any[] = data?.costs ?? [];

  const cropMap = useMemo(() => {
    const m: Record<string, { yield: number; area: number; count: number }> = {};
    for (const h of harvests) {
      const k = h.cropName || "Unknown";
      if (!m[k]) m[k] = { yield: 0, area: 0, count: 0 };
      m[k].yield += parseFloat(h.yieldTonnes ?? 0);
      m[k].area += parseFloat(h.areaHarvestedHa ?? 0);
      m[k].count++;
    }
    return m;
  }, [harvests]);

  const totalYield = Object.values(cropMap).reduce((s, c) => s + c.yield, 0);
  const totalArea = Object.values(cropMap).reduce((s, c) => s + c.area, 0);

  const incomeTotal = costs.filter(t => t.transactionType === "income").reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const cropSales = costs.filter(t => t.category === "Crop Sales").reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const varCostTotal = costs.filter(t => t.transactionType === "expense" && VARIABLE_COST_CATS.includes(t.category ?? "")).reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const grossMargin = incomeTotal - varCostTotal;

  const costByCat = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of costs) {
      if (t.transactionType === "expense") {
        m[t.category ?? "Other"] = (m[t.category ?? "Other"] ?? 0) + (t.amountPence ?? 0);
      }
    }
    return m;
  }, [costs]);

  if (isLoading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>;
  if (harvests.length === 0 && costs.length === 0) return <EmptyState icon={TrendingUp} message="Add harvest records and financial transactions to generate this report." />;

  return (
    <div className="space-y-6">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Total Area Harvested" value={`${fmtN(totalArea)} ha`} />
        <StatCard label="Total Yield" value={`${fmtN(totalYield)} t`} sub={totalArea > 0 ? `${fmtN(totalYield / totalArea)} t/ha avg` : undefined} />
        <StatCard label="Total Farm Output" value={fmt(incomeTotal)} bg="#eff6ff" border="#bfdbfe" color="#1e40af" />
        <StatCard label="Gross Margin" value={fmt(grossMargin)} bg={grossMargin >= 0 ? "#f0fdf4" : "#fef2f2"} border={grossMargin >= 0 ? "#bbf7d0" : "#fecaca"} color={grossMargin >= 0 ? "#166534" : "#991b1b"} />
      </div>

      {Object.keys(cropMap).length > 0 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }}>Yield by Crop</h3>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Crop", "Records", "Area (ha)", "Total Yield (t)", "Yield / ha"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(cropMap).map(([crop, d], i, arr) => (
                  <tr key={crop} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.6rem 0.875rem", fontWeight: 600 }}>{crop}</td>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280" }}>{d.count}</td>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280" }}>{fmtN(d.area)}</td>
                    <td style={{ padding: "0.6rem 0.875rem", fontWeight: 500 }}>{fmtN(d.yield)}</td>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280" }}>{d.area > 0 ? fmtN(d.yield / d.area) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {Object.keys(costByCat).length > 0 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }}>Variable Input Costs</h3>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Category", "Total Cost", "Cost / ha"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {VARIABLE_COST_CATS.filter(c => costByCat[c]).map((cat, i, arr) => (
                  <tr key={cat} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.6rem 0.875rem" }}>{cat}</td>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#dc2626" }}>{fmt(costByCat[cat])}</td>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280" }}>{totalArea > 0 ? fmt(Math.round(costByCat[cat] / totalArea)) : "—"}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #d1fae5", background: "#f0fdf4" }}>
                  <td style={{ padding: "0.6rem 0.875rem", fontWeight: 700 }}>Total Variable Costs</td>
                  <td style={{ padding: "0.6rem 0.875rem", fontWeight: 700, color: "#dc2626" }}>{fmt(varCostTotal)}</td>
                  <td style={{ padding: "0.6rem 0.875rem", fontWeight: 500, color: "#6b7280" }}>{totalArea > 0 ? fmt(Math.round(varCostTotal / totalArea)) : "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 6 }}>
            * Input costs are shown as farm totals for the year. Allocation per crop requires tagging individual transactions to a specific crop.
          </p>
        </div>
      )}
    </div>
  );
}

// ── P&L Statement Tab ────────────────────────────────────────────────────────
function PLTab({ farmId, year }: { farmId: number; year: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-gross-margin", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/gross-margin?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const costs: any[] = data?.costs ?? [];

  const sumCat = (cat: string) => costs.filter(t => t.category === cat).reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const sumCats = (cats: string[], type?: string) => costs.filter(t => (!type || t.transactionType === type) && cats.includes(t.category ?? "")).reduce((s, t) => s + (t.amountPence ?? 0), 0);

  const cropSales = sumCat("Crop Sales");
  const livestockSales = sumCat("Livestock Sales");
  const agriEnvIncome = sumCat("Agri-Environment Scheme");
  const grantIncome = sumCat("Grant / Subsidy");
  const otherIncome = sumCat("Other Income");
  const totalOutput = cropSales + livestockSales + agriEnvIncome + grantIncome + otherIncome;

  const varCosts = VARIABLE_COST_CATS.reduce((m, c) => { m[c] = sumCat(c); return m; }, {} as Record<string, number>);
  const totalVarCosts = Object.values(varCosts).reduce((s, v) => s + v, 0);
  const grossMargin = totalOutput - totalVarCosts;

  const labour = sumCat("Labour");
  const fuel = sumCat("Fuel");
  const machinery = sumCat("Machinery & Equipment");
  const otherExp = costs.filter(t => t.transactionType === "expense" && t.category === "Other Expense").reduce((s, t) => s + t.amountPence, 0);
  const totalFixed = labour + fuel + machinery + otherExp;
  const netFarmIncome = grossMargin - totalFixed;

  if (isLoading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>;
  if (costs.length === 0) return <EmptyState icon={PoundSterling} message="Add financial transactions to generate the income statement." />;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Farm Output" value={fmt(totalOutput)} bg="#eff6ff" border="#bfdbfe" color="#1e40af" />
        <StatCard label="Gross Margin" value={fmt(grossMargin)} bg={grossMargin >= 0 ? "#f0fdf4" : "#fef2f2"} border={grossMargin >= 0 ? "#bbf7d0" : "#fecaca"} color={grossMargin >= 0 ? "#166534" : "#991b1b"} />
        <StatCard label="Net Farm Income" value={fmt(netFarmIncome)} bg={netFarmIncome >= 0 ? "#f0fdf4" : "#fef2f2"} border={netFarmIncome >= 0 ? "#bbf7d0" : "#fecaca"} color={netFarmIncome >= 0 ? "#166534" : "#991b1b"} sub="After fixed costs" />
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <tbody>
            <SectionDivider label="Income" />
            {cropSales > 0 && <DataRow label="Crop Sales" value={fmt(cropSales)} indent />}
            {livestockSales > 0 && <DataRow label="Livestock Sales" value={fmt(livestockSales)} indent />}
            {agriEnvIncome > 0 && <DataRow label="Agri-Environment Scheme Payments" value={fmt(agriEnvIncome)} indent />}
            {grantIncome > 0 && <DataRow label="Grants & Subsidies" value={fmt(grantIncome)} indent />}
            {otherIncome > 0 && <DataRow label="Other Income" value={fmt(otherIncome)} indent />}
            <TotalRow label="Total Farm Output" value={fmt(totalOutput)} />

            <SectionDivider label="Variable Costs" />
            {VARIABLE_COST_CATS.filter(c => varCosts[c] > 0).map(c => (
              <DataRow key={c} label={c} value={fmt(varCosts[c])} indent />
            ))}
            <TotalRow label="Total Variable Costs" value={`(${fmt(totalVarCosts)})`} />
            <TotalRow label="Gross Margin" value={fmt(grossMargin)} highlight />

            <SectionDivider label="Fixed Costs / Overheads" />
            {labour > 0 && <DataRow label="Labour" value={fmt(labour)} indent />}
            {fuel > 0 && <DataRow label="Fuel" value={fmt(fuel)} indent />}
            {machinery > 0 && <DataRow label="Machinery & Equipment" value={fmt(machinery)} indent />}
            {otherExp > 0 && <DataRow label="Other Overhead Costs" value={fmt(otherExp)} indent />}
            <TotalRow label="Total Fixed Costs" value={`(${fmt(totalFixed)})`} />
            <TotalRow label="Net Farm Income" value={fmt(netFarmIncome)} highlight />
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 8 }}>
        Based on {costs.length} financial transactions recorded for {year}. Rent, finance charges, and depreciation should be added as transactions for a complete picture.
      </p>
    </div>
  );
}

// ── Input Cost Breakdown Tab ─────────────────────────────────────────────────
function InputCostsTab({ farmId, year }: { farmId: number; year: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-gross-margin", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/gross-margin?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const costs: any[] = (data?.costs ?? []).filter((t: any) => t.transactionType === "expense");
  const totalExpenses = costs.reduce((s, t) => s + (t.amountPence ?? 0), 0);

  const byCat = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of costs) {
      const k = t.category || "Uncategorised";
      m[k] = (m[k] ?? 0) + (t.amountPence ?? 0);
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [costs]);

  const byMonth = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of costs) {
      const mo = new Date(t.transactionDate).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      m[mo] = (m[mo] ?? 0) + (t.amountPence ?? 0);
    }
    return Object.entries(m);
  }, [costs]);

  if (isLoading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>;
  if (costs.length === 0) return <EmptyState icon={BarChart3} message="Add expense transactions to see your input cost breakdown." />;

  return (
    <div className="space-y-6">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label="Total Expenditure" value={fmt(totalExpenses)} bg="#fef2f2" border="#fecaca" color="#dc2626" />
        <StatCard label="Expense Records" value={String(costs.length)} bg="#fafafa" border="#e5e7eb" color="#374151" />
        <StatCard label="Avg Monthly Spend" value={fmt(Math.round(totalExpenses / 12))} bg="#fafafa" border="#e5e7eb" color="#374151" />
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Category", "Total", "% of Spend", "Bar"].map(h => (
                <th key={h} style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byCat.map(([cat, amt], i) => {
              const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
              return (
                <tr key={cat} style={{ borderBottom: i < byCat.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.6rem 0.875rem", fontWeight: 500 }}>{cat}</td>
                  <td style={{ padding: "0.6rem 0.875rem", color: "#dc2626" }}>{fmt(amt)}</td>
                  <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280" }}>{pct.toFixed(1)}%</td>
                  <td style={{ padding: "0.6rem 0.875rem", width: "30%" }}>
                    <div style={{ background: "#f3f4f6", borderRadius: 4, height: 8 }}>
                      <div style={{ background: "#dc2626", borderRadius: 4, height: 8, width: `${pct}%`, opacity: 0.7 }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Grain Position Tab ───────────────────────────────────────────────────────
function GrainPositionTab({ farmId, year }: { farmId: number; year: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-grain-position", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/grain-position?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const harvests: any[] = data?.harvests ?? [];
  const haulage: any[] = data?.haulage ?? [];
  const cropSales: any[] = (data?.cropSalesTransactions ?? []).filter((t: any) => t.category === "Crop Sales");

  const harvestedByCrop = useMemo(() => {
    const m: Record<string, number> = {};
    for (const h of harvests) m[h.cropName || "Unknown"] = (m[h.cropName || "Unknown"] ?? 0) + parseFloat(h.yieldTonnes ?? 0);
    return m;
  }, [harvests]);

  const totalHarvested = Object.values(harvestedByCrop).reduce((s, v) => s + v, 0);
  const totalHaulageOut = haulage.reduce((s, h) => s + parseFloat(h.weightTonnes ?? 0), 0);
  const inStore = Math.max(0, totalHarvested - totalHaulageOut);
  const totalSalesValue = cropSales.reduce((s, t) => s + (t.amountPence ?? 0), 0);

  if (isLoading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>;
  if (harvests.length === 0) return <EmptyState icon={Package} message="Add harvest records to track your grain position." />;

  return (
    <div className="space-y-6">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Total Harvested" value={`${fmtN(totalHarvested)} t`} />
        <StatCard label="Total Moved / Sold" value={`${fmtN(totalHaulageOut)} t`} bg="#fef3c7" border="#fde68a" color="#92400e" />
        <StatCard label="Est. In Store / Unsold" value={`${fmtN(inStore)} t`} bg="#eff6ff" border="#bfdbfe" color="#1e40af" />
        <StatCard label="Crop Sales Income" value={fmt(totalSalesValue)} />
      </div>

      <div>
        <h3 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }}>Harvest by Crop</h3>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Crop", "Harvested (t)", "% of Total"].map(h => (
                  <th key={h} style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(harvestedByCrop).map(([crop, tonnes], i, arr) => (
                <tr key={crop} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.6rem 0.875rem", fontWeight: 500 }}>{crop}</td>
                  <td style={{ padding: "0.6rem 0.875rem" }}>{fmtN(tonnes)}</td>
                  <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280" }}>{totalHarvested > 0 ? `${((tonnes / totalHarvested) * 100).toFixed(1)}%` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {haulage.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }}>Recent Haulage Movements</h3>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Date", "Load", "Destination", "Weight (t)", "Haulier"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {haulage.slice(0, 15).map((h: any, i) => (
                  <tr key={h.id} style={{ borderBottom: i < Math.min(haulage.length, 15) - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{new Date(h.departureDate).toLocaleDateString("en-GB")}</td>
                    <td style={{ padding: "0.6rem 0.875rem" }}>{h.loadDescription || h.loadType || "—"}</td>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280" }}>{h.destination || "—"}</td>
                    <td style={{ padding: "0.6rem 0.875rem" }}>{fmtN(parseFloat(h.weightTonnes ?? 0))}</td>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280" }}>{h.haulierCompany || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Subsidies Tab ────────────────────────────────────────────────────────────
function SubsidiesTab({ farmId, year }: { farmId: number; year: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-subsidies", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/subsidies?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const schemes: any[] = data?.schemes ?? [];
  const subsidyTx: any[] = (data?.subsidyTransactions ?? []).filter((t: any) => ["Agri-Environment Scheme", "Grant / Subsidy"].includes(t.category ?? ""));

  const activeSchemes = schemes.filter(s => s.status === "active");
  const totalAnnualSchemes = activeSchemes.reduce((s, sc) => s + (sc.annualPaymentPence ?? 0), 0);
  const totalSubsidyReceived = subsidyTx.reduce((s, t) => s + (t.amountPence ?? 0), 0);

  if (isLoading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>;
  if (schemes.length === 0 && subsidyTx.length === 0) return <EmptyState icon={Leaf} message="Add agri-environment scheme agreements and subsidy transactions to see this report." />;

  return (
    <div className="space-y-6">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <StatCard label="Active Schemes" value={String(activeSchemes.length)} />
        <StatCard label="Annual Scheme Value" value={fmt(totalAnnualSchemes)} sub="Expected annual total" />
        <StatCard label="Subsidy Received" value={fmt(totalSubsidyReceived)} sub={`Recorded in ${year}`} bg="#eff6ff" border="#bfdbfe" color="#1e40af" />
      </div>

      {schemes.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }}>Scheme Agreements</h3>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Scheme", "Agreement No.", "Start", "End", "Annual Payment", "Status"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {schemes.map((s: any, i) => (
                  <tr key={s.id} style={{ borderBottom: i < schemes.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.6rem 0.875rem", fontWeight: 500 }}>{s.schemeName}</td>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.8rem" }}>{s.agreementNumber || "—"}</td>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{new Date(s.startDate).toLocaleDateString("en-GB")}</td>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{s.endDate ? new Date(s.endDate).toLocaleDateString("en-GB") : "Ongoing"}</td>
                    <td style={{ padding: "0.6rem 0.875rem", fontWeight: 500 }}>{s.annualPaymentPence != null ? fmt(s.annualPaymentPence) : "—"}</td>
                    <td style={{ padding: "0.6rem 0.875rem" }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 20, textTransform: "capitalize", background: s.status === "active" ? "#dcfce7" : "#f3f4f6", color: s.status === "active" ? "#166534" : "#374151" }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subsidyTx.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }}>Subsidy & Grant Payments Received ({year})</h3>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Date", "Description", "Category", "Amount"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subsidyTx.map((t: any, i) => (
                  <tr key={t.id} style={{ borderBottom: i < subsidyTx.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{new Date(t.transactionDate).toLocaleDateString("en-GB")}</td>
                    <td style={{ padding: "0.6rem 0.875rem" }}>{t.description || "—"}</td>
                    <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280" }}>{t.category || "—"}</td>
                    <td style={{ padding: "0.6rem 0.875rem", fontWeight: 600, color: "#166534" }}>{fmt(t.amountPence)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Year-on-Year Tab ─────────────────────────────────────────────────────────
function YearOnYearTab({ farmId }: { farmId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-year-on-year", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/year-on-year`).then(r => r.json()),
    enabled: !!farmId,
  });

  const allHarvests: any[] = data?.harvests ?? [];
  const allTx: any[] = data?.transactions ?? [];

  const years = useMemo(() => {
    const s = new Set<number>();
    for (const h of allHarvests) s.add(new Date(h.harvestDate).getFullYear());
    for (const t of allTx) s.add(new Date(t.transactionDate).getFullYear());
    return [...s].sort((a, b) => b - a).slice(0, 5);
  }, [allHarvests, allTx]);

  const byYear = useMemo(() => years.map(y => {
    const yHarvests = allHarvests.filter(h => new Date(h.harvestDate).getFullYear() === y);
    const yTx = allTx.filter(t => new Date(t.transactionDate).getFullYear() === y);
    const totalYield = yHarvests.reduce((s, h) => s + parseFloat(h.yieldTonnes ?? 0), 0);
    const totalArea = yHarvests.reduce((s, h) => s + parseFloat(h.areaHarvestedHa ?? 0), 0);
    const totalIncome = yTx.filter(t => t.transactionType === "income").reduce((s, t) => s + (t.amountPence ?? 0), 0);
    const totalExpense = yTx.filter(t => t.transactionType === "expense").reduce((s, t) => s + (t.amountPence ?? 0), 0);
    const netPos = totalIncome - totalExpense;
    return { year: y, totalYield, totalArea, yieldPerHa: totalArea > 0 ? totalYield / totalArea : 0, totalIncome, totalExpense, netPos };
  }), [years, allHarvests, allTx]);

  if (isLoading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>;
  if (years.length === 0) return <EmptyState icon={Calendar} message="Add harvest records and financial transactions across multiple years to see trends." />;

  const changeIcon = (curr: number, prev: number) => {
    if (!prev) return null;
    return curr >= prev
      ? <TrendingUp size={14} style={{ color: "#166534", display: "inline", marginLeft: 4 }} />
      : <TrendingDown size={14} style={{ color: "#dc2626", display: "inline", marginLeft: 4 }} />;
  };

  return (
    <div className="space-y-6">
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>Metric</th>
              {byYear.map(r => (
                <th key={r.year} style={{ padding: "0.6rem 0.875rem", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{r.year}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Area Harvested (ha)", key: "totalArea" as const, fmt: (v: number) => fmtN(v) },
              { label: "Total Yield (t)", key: "totalYield" as const, fmt: (v: number) => fmtN(v) },
              { label: "Average Yield (t/ha)", key: "yieldPerHa" as const, fmt: (v: number) => fmtN(v, 2) },
              { label: "Total Income", key: "totalIncome" as const, fmt: (v: number) => fmt(v) },
              { label: "Total Expenditure", key: "totalExpense" as const, fmt: (v: number) => fmt(v) },
              { label: "Net Position", key: "netPos" as const, fmt: (v: number) => fmt(v) },
            ].map((row, ri) => (
              <tr key={row.label} style={{ borderBottom: "1px solid #f3f4f6", background: ri % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={{ padding: "0.6rem 0.875rem", fontWeight: 500 }}>{row.label}</td>
                {byYear.map((r, yi) => {
                  const val = r[row.key] as number;
                  const prev = byYear[yi + 1]?.[row.key] as number | undefined;
                  const isNetOrIncome = row.key === "netPos" || row.key === "totalIncome";
                  return (
                    <td key={r.year} style={{ padding: "0.6rem 0.875rem", textAlign: "right", color: row.key === "netPos" ? (val >= 0 ? "#166534" : "#dc2626") : "#374151", fontWeight: yi === 0 ? 600 : 400 }}>
                      {row.fmt(val)}
                      {yi === 0 && prev !== undefined && changeIcon(val, prev)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }}>Crop Mix by Year</h3>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <th style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>Crop</th>
                {byYear.map(r => <th key={r.year} style={{ padding: "0.6rem 0.875rem", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{r.year} (t)</th>)}
              </tr>
            </thead>
            <tbody>
              {[...new Set(allHarvests.map(h => h.cropName))].map((crop, i, arr) => (
                <tr key={String(crop)} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.6rem 0.875rem", fontWeight: 500 }}>{String(crop)}</td>
                  {byYear.map(r => {
                    const yTotal = allHarvests.filter(h => h.cropName === crop && new Date(h.harvestDate).getFullYear() === r.year).reduce((s, h) => s + parseFloat(h.yieldTonnes ?? 0), 0);
                    return <td key={r.year} style={{ padding: "0.6rem 0.875rem", textAlign: "right", color: "#6b7280" }}>{yTotal > 0 ? fmtN(yTotal) : "—"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Asset Register Tab ───────────────────────────────────────────────────────
function AssetRegisterTab({ farmId }: { farmId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-assets", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/assets`).then(r => r.json()),
    enabled: !!farmId,
  });

  const equipment: any[] = data?.equipment ?? [];
  const maintenance: any[] = data?.maintenanceCosts ?? [];
  const currentYear = new Date().getFullYear();

  const assetRows = useMemo(() => equipment.map(e => {
    const purchaseYear = e.purchaseDate ? new Date(e.purchaseDate).getFullYear() : (e.yearOfManufacture ?? null);
    const age = purchaseYear ? currentYear - purchaseYear : null;
    const purchasePrice = e.purchasePricePence ?? null;
    const usefulLife = 10;
    const annualDeprn = purchasePrice ? Math.round(purchasePrice / usefulLife) : null;
    const accumulatedDeprn = (age != null && annualDeprn != null) ? Math.min(annualDeprn * age, purchasePrice!) : null;
    const nbv = e.currentValuePence ?? (purchasePrice != null && accumulatedDeprn != null ? Math.max(0, purchasePrice - accumulatedDeprn) : null);
    const maintCost = maintenance.filter(m => m.equipmentId === e.id).reduce((s, m) => s + (m.costPence ?? 0), 0);
    return { ...e, age, purchaseYear, annualDeprn, nbv, maintCost };
  }), [equipment, maintenance, currentYear]);

  const totalPurchaseValue = assetRows.filter(r => r.purchasePricePence).reduce((s, r) => s + r.purchasePricePence, 0);
  const totalNbv = assetRows.filter(r => r.nbv != null).reduce((s, r) => s + r.nbv, 0);
  const totalMaint = assetRows.reduce((s, r) => s + r.maintCost, 0);

  if (isLoading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>;
  if (equipment.length === 0) return <EmptyState icon={Tractor} message="Add equipment records with purchase prices to generate your asset register." />;

  return (
    <div className="space-y-6">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Total Assets" value={String(equipment.length)} />
        <StatCard label="Total Purchase Value" value={totalPurchaseValue > 0 ? fmt(totalPurchaseValue) : "—"} bg="#eff6ff" border="#bfdbfe" color="#1e40af" />
        <StatCard label="Est. Net Book Value" value={totalNbv > 0 ? fmt(totalNbv) : "—"} sub="Straight-line 10yr depreciation" />
        <StatCard label="Total Maintenance Spend" value={totalMaint > 0 ? fmt(totalMaint) : "—"} bg="#fef3c7" border="#fde68a" color="#92400e" />
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Asset", "Type", "Purchase Year", "Age (yrs)", "Purchase Price", "Annual Depreciation", "Net Book Value", "Maintenance Spend", "Status"].map(h => (
                <th key={h} style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.72rem", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assetRows.map((r, i) => (
              <tr key={r.id} style={{ borderBottom: i < assetRows.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <td style={{ padding: "0.6rem 0.875rem", fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280", textTransform: "capitalize" }}>{r.type?.replace(/_/g, " ") || "—"}</td>
                <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280" }}>{r.purchaseYear ?? "—"}</td>
                <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280" }}>{r.age != null ? r.age : "—"}</td>
                <td style={{ padding: "0.6rem 0.875rem" }}>{r.purchasePricePence ? fmt(r.purchasePricePence) : "—"}</td>
                <td style={{ padding: "0.6rem 0.875rem", color: "#dc2626" }}>{r.annualDeprn ? fmt(r.annualDeprn) : "—"}</td>
                <td style={{ padding: "0.6rem 0.875rem", fontWeight: 600, color: r.nbv != null && r.nbv <= 0 ? "#9ca3af" : "#166534" }}>{r.nbv != null ? (r.nbv === 0 ? "Fully depreciated" : fmt(r.nbv)) : "—"}</td>
                <td style={{ padding: "0.6rem 0.875rem", color: "#92400e" }}>{r.maintCost > 0 ? fmt(r.maintCost) : "—"}</td>
                <td style={{ padding: "0.6rem 0.875rem" }}>
                  <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 20, textTransform: "capitalize", background: r.status === "active" ? "#dcfce7" : "#f3f4f6", color: r.status === "active" ? "#166534" : "#374151" }}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
        Depreciation calculated on a straight-line basis over 10 years from purchase date. Enter purchase prices on individual equipment records for accurate figures. Net Book Value shows current value estimate; enter a current market value on the equipment record to override.
      </p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function BusinessReportsPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("gross-margin");
  const [year, setYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  if (!farmId) {
    return (
      <AppLayout title="Business Reports">
        <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>
          <BarChart3 size={40} style={{ margin: "0 auto 16px", opacity: 0.4 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>Select a farm to view business reports</p>
        </div>
      </AppLayout>
    );
  }

  const yearTabs: Tab[] = ["gross-margin", "pl", "input-costs", "grain-position", "subsidies"];
  const showYearSelector = yearTabs.includes(tab);

  return (
    <AppLayout title="Business Reports">
      <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
        Financial performance reports, grain position, subsidy income and asset register — all derived from data recorded across your farm modules.
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.5rem" }}>
        <TabBar>
          <TabButton active={tab === "gross-margin"} onClick={() => setTab("gross-margin")}>Gross Margin</TabButton>
          <TabButton active={tab === "pl"} onClick={() => setTab("pl")}>P&amp;L Statement</TabButton>
          <TabButton active={tab === "input-costs"} onClick={() => setTab("input-costs")}>Input Costs</TabButton>
          <TabButton active={tab === "grain-position"} onClick={() => setTab("grain-position")}>Grain Position</TabButton>
          <TabButton active={tab === "subsidies"} onClick={() => setTab("subsidies")}>Subsidies</TabButton>
          <TabButton active={tab === "year-on-year"} onClick={() => setTab("year-on-year")}>Year-on-Year</TabButton>
          <TabButton active={tab === "assets"} onClick={() => setTab("assets")}>Asset Register</TabButton>
        </TabBar>

        {showYearSelector && (
          <Select value={String(year)} onValueChange={v => setYear(parseInt(v))}>
            <SelectTrigger style={{ width: 120 }}><SelectValue /></SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        {tab === "gross-margin" && <GrossMarginTab farmId={farmId} year={year} />}
        {tab === "pl" && <PLTab farmId={farmId} year={year} />}
        {tab === "input-costs" && <InputCostsTab farmId={farmId} year={year} />}
        {tab === "grain-position" && <GrainPositionTab farmId={farmId} year={year} />}
        {tab === "subsidies" && <SubsidiesTab farmId={farmId} year={year} />}
        {tab === "year-on-year" && <YearOnYearTab farmId={farmId} />}
        {tab === "assets" && <AssetRegisterTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
