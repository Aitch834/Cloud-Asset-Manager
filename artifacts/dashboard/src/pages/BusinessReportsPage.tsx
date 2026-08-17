import { useState, useMemo, useCallback, useEffect } from "react";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedNumberFilter } from "@/hooks/use-persisted-filter";
import { sanitiseCsvCell } from "@/lib/csv";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { apiUrl } from "@/lib/api";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Printer, Download, TrendingUp, TrendingDown, BarChart3, Package, Leaf, Tractor, PoundSterling, Calendar } from "lucide-react";

type Tab = "gross-margin" | "pl" | "input-costs" | "grain-position" | "subsidies" | "year-on-year" | "assets" | "benchmarking";

const VARIABLE_COST_CATS = [
  "Seeds & Seed Treatments",
  "Fertiliser",
  "Pesticides & Herbicides",
  "Fungicides",
  "Insecticides",
  "Veterinary & Medicine",
  "Feed & Forage",
  "Feed & Bedding",
  "Haulage",
  "Electricity",
  "Contracting & Machinery Hire",
];
const FIXED_COST_CATS = [
  // Machinery & fuel
  "Fuel",
  "Fuel & Energy",
  "Machinery & Equipment",
  // People
  "Labour",
  "Training & Development",
  // Property & occupancy
  "Rent & Land Charges",
  "Buildings Repairs & Maintenance",
  "Water & Drainage",
  "Business Rates",
  // Professional & admin
  "Professional Fees & Accountancy",
  "Legal Costs",
  "Office & Administration",
  "Telephone & IT",
  "Subscriptions & Memberships",
  "Marketing & Advertising",
  // Finance & insurance
  "Insurance Premiums",
  "Bank Charges & Loan Interest",
  "Hire Purchase & Leasing",
  // Other
  "Other Expense",
];
const INCOME_CATS = [
  "Crop Sales",
  "Livestock Sales",
  "Milk Sales",
  "Wool Sales",
  "Straw & Crop By-Product Sales",
  "Timber & Woodland Sales",
  "Agri-Environment Scheme",
  "Grant / Subsidy",
  "Diversification Income",
  "Shooting & Sporting Rights Income",
  "Property & Building Rental Income",
  "Renewable Energy Income",
  "Telecom Mast & Wayleave Income",
  "Contracting Income",
  "Insurance Receipts & Compensation",
  "Machinery & Asset Disposal Income",
  "Interest Received",
  "Other Income",
];

const fmt = (p: number | null | undefined) => {
  if (p == null) return "—";
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const fmtN = (n: number | null | undefined, dp = 2) => {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
};

type ExportFn = () => void;

function downloadCsv(filename: string, rows: (string | number | null | undefined)[][]) {
  const content = rows.map(r =>
    r.map(cell => {
      const safe = sanitiseCsvCell(cell);
      return safe.includes(",") || safe.includes('"') || safe.includes("\n")
        ? `"${safe.replace(/"/g, '""')}"` : safe;
    }).join(",")
  ).join("\n");
  const blob = new Blob(["\uFEFF" + content, ""], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

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
function GrossMarginTab({ farmId, year, onRegisterExport }: { farmId: number; year: number; onRegisterExport: (fn: ExportFn) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-gross-margin", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/gross-margin?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const harvests: any[] = data?.harvests ?? [];
  const costs: any[] = data?.costs ?? [];
  const agriEnvSummary: any[] = data?.agriEnvSummary ?? [];

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

  // Linked agri-env income transactions are already represented by their milestone claim in
  // agriEnvYearTotal; exclude them from financial income to avoid double-counting (same
  // pattern as PLTab's unlinkedAgriEnvTxTotal / incomeValues logic).
  const txIncomeTotal = costs.filter(t =>
    t.transactionType === "income" &&
    !(t.category === "Agri-Environment Scheme" && t.agriEnvProjectId)
  ).reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const cropSales = costs.filter(t => t.category === "Crop Sales").reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const varCostTotal = costs.filter(t => t.transactionType === "expense" && VARIABLE_COST_CATS.includes(t.category ?? "")).reduce((s, t) => s + (t.amountPence ?? 0), 0);

  // Agri-env milestone claims earned in the selected year (same logic as P&L tab)
  const agriEnvYearTotal = agriEnvSummary.reduce((s: number, p: any) => s + (p.yearClaimedPence ?? 0), 0);
  const agriEnvActiveProjects = agriEnvSummary.filter((p: any) => (p.yearClaimedPence ?? 0) > 0);

  const incomeTotal = txIncomeTotal + agriEnvYearTotal;
  const grossMargin = incomeTotal - varCostTotal;

  // Double-count warning: only unlinked Agri-Environment Scheme transactions (no agriEnvProjectId) alongside milestone claims.
  // Linked transactions are already excluded from txIncomeTotal above and should not trigger the warning.
  const unlinkedAgriEnvTxIncome = costs.filter(t => t.category === "Agri-Environment Scheme" && t.transactionType === "income" && !t.agriEnvProjectId).reduce((s: number, t: any) => s + (t.amountPence ?? 0), 0);
  const hasDoubleCountRisk = agriEnvYearTotal > 0 && unlinkedAgriEnvTxIncome > 0;

  const costByCat = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of costs) {
      if (t.transactionType === "expense") {
        m[t.category ?? "Other"] = (m[t.category ?? "Other"] ?? 0) + (t.amountPence ?? 0);
      }
    }
    return m;
  }, [costs]);

  useEffect(() => {
    onRegisterExport(() => {
      const rows: (string | number)[][] = [["Crop", "Records", "Area (ha)", "Total Yield (t)", "Yield / ha"]];
      for (const [crop, d] of Object.entries(cropMap)) {
        rows.push([crop, d.count, fmtN(d.area), fmtN(d.yield), d.area > 0 ? fmtN(d.yield / d.area) : "—"]);
      }
      rows.push([]);
      rows.push(["Input Cost Category", "Total Cost", "Cost / ha"]);
      for (const cat of VARIABLE_COST_CATS.filter(c => costByCat[c])) {
        rows.push([cat, fmt(costByCat[cat]), totalArea > 0 ? fmt(Math.round(costByCat[cat] / totalArea)) : "—"]);
      }
      rows.push(["Total Variable Costs", fmt(varCostTotal), totalArea > 0 ? fmt(Math.round(varCostTotal / totalArea)) : "—"]);
      rows.push([]);
      rows.push(["Summary", ""]);
      rows.push(["Financial income", fmt(txIncomeTotal)]);
      if (agriEnvYearTotal > 0) {
        rows.push([`Agri-env schemes (from Agri-Env tab, ${agriEnvActiveProjects.length} project${agriEnvActiveProjects.length !== 1 ? "s" : ""})`, fmt(agriEnvYearTotal), hasDoubleCountRisk ? "WARNING: also recorded as financial transaction — possible double-count" : ""]);
        if (agriEnvActiveProjects.length > 1) {
          for (const p of agriEnvActiveProjects) {
            rows.push([`  ↳ ${p.schemeName}`, fmt(p.yearClaimedPence), ""]);
          }
        }
      }
      rows.push(["Total Farm Output", fmt(incomeTotal)]);
      rows.push(["Total Variable Costs", fmt(varCostTotal)]);
      rows.push(["Gross Margin", fmt(grossMargin)]);
      downloadCsv(`gross-margin-${year}.csv`, rows);
    });
  }, [data, cropMap, costByCat, totalArea, varCostTotal, txIncomeTotal, agriEnvYearTotal, agriEnvActiveProjects, hasDoubleCountRisk, incomeTotal, grossMargin, year, onRegisterExport]);

  if (isLoading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>;
  if (harvests.length === 0 && costs.length === 0 && agriEnvYearTotal === 0) return <EmptyState icon={TrendingUp} message="Add harvest records, financial transactions, or agri-env milestone claims to generate this report." />;

  return (
    <div className="space-y-6">
      {hasDoubleCountRisk && (
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.75rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.1rem", lineHeight: 1.3 }}>⚠️</span>
          <div>
            <p style={{ fontWeight: 600, color: "#92400e", fontSize: "0.875rem", marginBottom: 2 }}>Possible double-count detected</p>
            <p style={{ color: "#78350f", fontSize: "0.8rem" }}>
              You have both an <strong>Agri-Environment Scheme</strong> financial transaction and agri-env project records in {year}.
              The agri-env line below is drawn from the Agri-Env tab. To avoid double-counting, remove either the financial transaction or the agri-env tab milestone claims from your totals.
            </p>
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Total Area Harvested" value={`${fmtN(totalArea)} ha`} />
        <StatCard label="Total Yield" value={`${fmtN(totalYield)} t`} sub={totalArea > 0 ? `${fmtN(totalYield / totalArea)} t/ha avg` : undefined} />
        <StatCard label="Total Farm Output" value={fmt(incomeTotal)} bg="#eff6ff" border="#bfdbfe" color="#1e40af" sub={agriEnvYearTotal > 0 ? `Incl. ${fmt(agriEnvYearTotal)} agri-env schemes (from Agri-Env tab)` : undefined} />
        <StatCard label="Gross Margin" value={fmt(grossMargin)} bg={grossMargin >= 0 ? "#f0fdf4" : "#fef2f2"} border={grossMargin >= 0 ? "#bbf7d0" : "#fecaca"} color={grossMargin >= 0 ? "#166534" : "#991b1b"} />
      </div>

      {agriEnvActiveProjects.length > 1 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }}>Agri-Environment Scheme Breakdown</h3>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  <th style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>Project</th>
                  <th style={{ padding: "0.6rem 0.875rem", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>Claimed in {year}</th>
                </tr>
              </thead>
              <tbody>
                {agriEnvActiveProjects.map((p: any, i: number, arr: any[]) => (
                  <tr key={p.id} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.5rem 0.875rem", paddingLeft: "1.75rem", color: "#374151" }}>↳ {p.schemeName}</td>
                    <td style={{ padding: "0.5rem 0.875rem", color: "#374151", textAlign: "right" }}>{fmt(p.yearClaimedPence)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #d1fae5", background: "#f0fdf4" }}>
                  <td style={{ padding: "0.6rem 0.875rem", fontWeight: 700 }}>Total agri-env schemes</td>
                  <td style={{ padding: "0.6rem 0.875rem", fontWeight: 700, color: "#166534", textAlign: "right" }}>{fmt(agriEnvYearTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 6 }}>
            * Drawn from milestone claims in the Agri-Env tab. Amounts reflect milestones completed in {year} only.
          </p>
        </div>
      )}

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
function PLTab({ farmId, year, onRegisterExport }: { farmId: number; year: number; onRegisterExport: (fn: ExportFn) => void }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["report-gross-margin", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/gross-margin?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  // Link-to-project dialog state
  const [linkingTx, setLinkingTx] = useState<{ id: number; description: string | null } | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const costs: any[] = data?.costs ?? [];
  // agriEnvSummary: per-project { id, schemeName, totalGrantValuePence, yearClaimedPence }
  // yearClaimedPence = sum of completed milestones with completionDate in the selected year only
  const agriEnvSummary: any[] = data?.agriEnvSummary ?? [];

  const sumCat = (cat: string) => costs.filter(t => t.category === cat).reduce((s, t) => s + (t.amountPence ?? 0), 0);

  // Individual Agri-Env Scheme income transactions, split by linked vs unlinked.
  // Must be computed before incomeValues so linked transactions can be excluded from totals.
  const agriEnvSchemeTxs: any[] = costs.filter(t => t.category === "Agri-Environment Scheme" && t.transactionType === "income");
  // Linked transactions are already represented by the milestone claim in agriEnvYearTotal;
  // only unlinked transactions contribute to the financial income total.
  const unlinkedAgriEnvTxTotal = agriEnvSchemeTxs.filter(t => !t.agriEnvProjectId).reduce((s: number, t: any) => s + (t.amountPence ?? 0), 0);

  // Income by category (financial transactions only).
  // For "Agri-Environment Scheme" we use only unlinked transactions so linked ones are not
  // double-counted alongside the milestone claim amount added via agriEnvYearTotal below.
  const incomeValues = INCOME_CATS.reduce((m, c) => {
    m[c] = c === "Agri-Environment Scheme" ? unlinkedAgriEnvTxTotal : sumCat(c);
    return m;
  }, {} as Record<string, number>);
  const txIncomeTotal = Object.values(incomeValues).reduce((s, v) => s + v, 0);

  // Only count milestones actually claimed (completed) in the selected year — never the full agreement value
  const agriEnvYearTotal = agriEnvSummary.reduce((s: number, p: any) => s + (p.yearClaimedPence ?? 0), 0);
  const agriEnvActiveProjects = agriEnvSummary.filter((p: any) => (p.yearClaimedPence ?? 0) > 0);
  // Projects active in year but with no milestone claims yet recorded
  const agriEnvUnclaimedProjects = agriEnvSummary.filter((p: any) => (p.yearClaimedPence ?? 0) === 0);

  // Double-count warning: only triggered when there are UNLINKED agri-env scheme transactions alongside milestone claims
  const hasDoubleCountRisk = agriEnvYearTotal > 0 && unlinkedAgriEnvTxTotal > 0;

  // Total output = financial income (linked agri-env excluded) + milestone claims this year.
  // A linked transaction contributes 0 to txIncomeTotal; its value is represented exactly once
  // through the milestone claim's yearClaimedPence.
  const totalOutput = txIncomeTotal + agriEnvYearTotal;

  // Variable costs
  const varCosts = VARIABLE_COST_CATS.reduce((m, c) => { m[c] = sumCat(c); return m; }, {} as Record<string, number>);
  const totalVarCosts = Object.values(varCosts).reduce((s, v) => s + v, 0);
  const grossMargin = totalOutput - totalVarCosts;

  // Fixed costs / overheads — all categories in FIXED_COST_CATS
  const fixedCosts = FIXED_COST_CATS.reduce((m, c) => { m[c] = sumCat(c); return m; }, {} as Record<string, number>);
  const totalFixed = Object.values(fixedCosts).reduce((s, v) => s + v, 0);
  const netFarmIncome = grossMargin - totalFixed;

  // Mutation: link (or unlink) a financial transaction to an agri-env project
  const linkMutation = useMutation({
    mutationFn: async ({ txId, projectId }: { txId: number; projectId: number | null }) => {
      const res = await fetch(`/api/farms/${farmId}/financial-transactions/${txId}/link-agri-env`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agriEnvProjectId: projectId }),
      });
      if (!res.ok) throw new Error("Failed to update link");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-gross-margin", farmId, year] });
      setLinkingTx(null);
      setSelectedProjectId("");
    },
  });

  useEffect(() => {
    onRegisterExport(() => {
      const rows: (string | number)[][] = [
        ["Line Item", "Amount", "Note"],
        ["INCOME", "", ""],
        ...INCOME_CATS.filter(c => incomeValues[c] > 0).map(c => [c, fmt(incomeValues[c]), ""]),
        ...(agriEnvYearTotal > 0 ? [
          ["Agri-environment schemes (milestone claims)", fmt(agriEnvYearTotal), `${agriEnvActiveProjects.length} project(s) with claims in ${year}${hasDoubleCountRisk ? " — WARNING: also recorded as financial transaction" : ""}`],
          ...(agriEnvActiveProjects.length > 1 ? agriEnvActiveProjects.map((p: any) => [`  ↳ ${p.schemeName}`, fmt(p.yearClaimedPence), ""]) : []),
        ] : []),
        ["Total Farm Output", fmt(totalOutput), ""],
        [],
        ["VARIABLE COSTS", "", ""],
        ...VARIABLE_COST_CATS.filter(c => varCosts[c] > 0).map(c => [c, fmt(varCosts[c]), ""]),
        ["Total Variable Costs", `(${fmt(totalVarCosts)})`, ""],
        ["Gross Margin", fmt(grossMargin), ""],
        [],
        ["FIXED COSTS / OVERHEADS", "", ""],
        ...FIXED_COST_CATS.filter(c => fixedCosts[c] > 0).map(c => [c, fmt(fixedCosts[c]), ""]),
        ["Total Fixed Costs", `(${fmt(totalFixed)})`, ""],
        ["Net Farm Income", fmt(netFarmIncome), ""],
      ];
      downloadCsv(`pl-statement-${year}.csv`, rows);
    });
  }, [data, agriEnvSummary, agriEnvYearTotal, agriEnvActiveProjects, hasDoubleCountRisk, totalOutput, txIncomeTotal, totalVarCosts, grossMargin, totalFixed, netFarmIncome, year, onRegisterExport]);

  if (isLoading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>;
  if (costs.length === 0 && agriEnvSummary.length === 0) return <EmptyState icon={PoundSterling} message="Add financial transactions to generate the income statement." />;

  // Lookup a linked project name from agriEnvSummary (or fall back to id)
  const projectName = (id: number) => agriEnvSummary.find((p: any) => p.id === id)?.schemeName ?? `Project #${id}`;

  return (
    <div>
      {/* Link-to-project modal */}
      {linkingTx && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => { setLinkingTx(null); setSelectedProjectId(""); }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "1.5rem", width: 420, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 4, color: "#111827" }}>Link transaction to agri-env project</h3>
            <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: 16 }}>
              Linking tells the system this transaction <em>is</em> the milestone payment — it will be shown as "via milestone record" and excluded from the double-count warning.
            </p>
            {linkingTx.description && (
              <p style={{ fontSize: "0.8rem", color: "#374151", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.5rem 0.75rem", marginBottom: 14, fontStyle: "italic" }}>
                "{linkingTx.description}"
              </p>
            )}
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>Agri-env project</label>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.875rem", color: "#111827", background: "#fff", marginBottom: 20 }}
            >
              <option value="">— select a project —</option>
              {agriEnvSummary.map((p: any) => (
                <option key={p.id} value={String(p.id)}>{p.schemeName}</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setLinkingTx(null); setSelectedProjectId(""); }}
                style={{ padding: "0.45rem 1rem", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: "0.875rem", cursor: "pointer", color: "#374151" }}
              >
                Cancel
              </button>
              <button
                disabled={!selectedProjectId || linkMutation.isPending}
                onClick={() => { if (selectedProjectId) linkMutation.mutate({ txId: linkingTx.id, projectId: parseInt(selectedProjectId) }); }}
                style={{ padding: "0.45rem 1rem", border: "none", borderRadius: 6, background: selectedProjectId ? "#166534" : "#9ca3af", color: "#fff", fontSize: "0.875rem", cursor: selectedProjectId ? "pointer" : "not-allowed", fontWeight: 600 }}
              >
                {linkMutation.isPending ? "Saving…" : "Link transaction"}
              </button>
            </div>
            {linkMutation.isError && (
              <p style={{ fontSize: "0.78rem", color: "#dc2626", marginTop: 8 }}>Failed to link — please try again.</p>
            )}
          </div>
        </div>
      )}

      {hasDoubleCountRisk && (
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.1rem", lineHeight: 1.3 }}>⚠️</span>
          <div>
            <p style={{ fontWeight: 600, color: "#92400e", fontSize: "0.875rem", marginBottom: 2 }}>Possible double-count detected</p>
            <p style={{ color: "#78350f", fontSize: "0.8rem" }}>
              You have both an <strong>Agri-Environment Scheme</strong> financial transaction and agri-env milestone claims in {year}.
              Use the <strong>Link to project</strong> action on the transaction row below to confirm this transaction is the milestone payment — it will be excluded from double-counting.
              Or remove either the financial transaction or the agri-env milestone claims.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Farm Output" value={fmt(totalOutput)} bg="#eff6ff" border="#bfdbfe" color="#1e40af" />
        <StatCard label="Gross Margin" value={fmt(grossMargin)} bg={grossMargin >= 0 ? "#f0fdf4" : "#fef2f2"} border={grossMargin >= 0 ? "#bbf7d0" : "#fecaca"} color={grossMargin >= 0 ? "#166534" : "#991b1b"} />
        <StatCard label="Net Farm Income" value={fmt(netFarmIncome)} bg={netFarmIncome >= 0 ? "#f0fdf4" : "#fef2f2"} border={netFarmIncome >= 0 ? "#bbf7d0" : "#fecaca"} color={netFarmIncome >= 0 ? "#166534" : "#991b1b"} sub="After fixed costs" />
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <tbody>
            <SectionDivider label="Income" />
            {INCOME_CATS.filter(c => incomeValues[c] > 0).map(c => {
              // Agri-env scheme transactions get expanded per-transaction rendering
              if (c === "Agri-Environment Scheme") {
                return agriEnvSchemeTxs.map((tx: any) => {
                  const isLinked = !!tx.agriEnvProjectId;
                  return (
                    <tr key={tx.id} style={{ background: isLinked ? "#fafafa" : undefined }}>
                      <td style={{ padding: "0.5rem 0.875rem", paddingLeft: "1.75rem", color: isLinked ? "#9ca3af" : "#374151" }}>
                        <span style={{ textDecoration: isLinked ? "line-through" : undefined }}>
                          {tx.description || c}
                        </span>
                        {isLinked ? (
                          <span style={{ marginLeft: 8, fontSize: "0.7rem", background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 4, padding: "1px 6px", verticalAlign: "middle" }}>
                            via milestone record · {projectName(tx.agriEnvProjectId)}
                          </span>
                        ) : hasDoubleCountRisk ? (
                          <button
                            onClick={() => { setLinkingTx({ id: tx.id, description: tx.description }); setSelectedProjectId(""); }}
                            style={{ marginLeft: 10, fontSize: "0.72rem", background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d", borderRadius: 4, padding: "1px 7px", cursor: "pointer", verticalAlign: "middle", fontWeight: 600 }}
                          >
                            Link to project
                          </button>
                        ) : null}
                        {isLinked && (
                          <button
                            onClick={() => linkMutation.mutate({ txId: tx.id, projectId: null })}
                            style={{ marginLeft: 8, fontSize: "0.72rem", background: "transparent", color: "#9ca3af", border: "none", cursor: "pointer", padding: "1px 4px", verticalAlign: "middle" }}
                            title="Remove link"
                          >
                            ×
                          </button>
                        )}
                      </td>
                      <td style={{ padding: "0.5rem 0.875rem", color: isLinked ? "#9ca3af" : "#374151", textAlign: "right" }}>
                        {fmt(tx.amountPence)}
                      </td>
                    </tr>
                  );
                });
              }
              return <DataRow key={c} label={c} value={fmt(incomeValues[c])} indent />;
            })}
            {agriEnvYearTotal > 0 && (
              <>
                <tr style={{ background: "#f0fdf4" }}>
                  <td style={{ padding: "0.5rem 0.875rem", paddingLeft: "1.75rem", color: "#166534" }}>
                    Agri-environment schemes (milestone claims)
                    <span style={{ marginLeft: 8, fontSize: "0.7rem", background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 4, padding: "1px 6px", verticalAlign: "middle" }}>
                      from Agri-Env tab · {agriEnvActiveProjects.length} project{agriEnvActiveProjects.length !== 1 ? "s" : ""}
                    </span>
                    {agriEnvActiveProjects.length === 1 && (() => {
                      const p = agriEnvActiveProjects[0];
                      if (p.totalGrantValuePence == null || p.totalGrantValuePence <= 0) return null;
                      const remaining = p.totalGrantValuePence - (p.allTimeClaimedPence ?? 0);
                      return (
                        <span style={{ marginLeft: 8, fontSize: "0.7rem", background: remaining > 0 ? "#fffbeb" : "#f0fdf4", color: remaining > 0 ? "#92400e" : "#166534", border: `1px solid ${remaining > 0 ? "#fcd34d" : "#bbf7d0"}`, borderRadius: 4, padding: "1px 6px", verticalAlign: "middle" }}>
                          {remaining > 0 ? `${fmt(remaining)} remaining` : "fully claimed"}
                        </span>
                      );
                    })()}
                  </td>
                  <td style={{ padding: "0.5rem 0.875rem", color: "#166534", textAlign: "right", fontWeight: 500 }}>{fmt(agriEnvYearTotal)}</td>
                </tr>
                {agriEnvActiveProjects.length > 1 && agriEnvActiveProjects.map((p: any) => {
                  const remaining = p.totalGrantValuePence != null && p.totalGrantValuePence > 0
                    ? p.totalGrantValuePence - (p.allTimeClaimedPence ?? 0)
                    : null;
                  return (
                    <tr key={p.id} style={{ background: "#f7fef9" }}>
                      <td style={{ padding: "0.35rem 0.875rem", paddingLeft: "3rem", color: "#15803d", fontSize: "0.82rem" }}>
                        <span style={{ marginRight: 6, opacity: 0.5 }}>↳</span>{p.schemeName}
                        {remaining !== null && (
                          <span style={{ marginLeft: 8, fontSize: "0.68rem", background: remaining > 0 ? "#fffbeb" : "#f0fdf4", color: remaining > 0 ? "#92400e" : "#166534", border: `1px solid ${remaining > 0 ? "#fcd34d" : "#bbf7d0"}`, borderRadius: 4, padding: "1px 5px", verticalAlign: "middle" }}>
                            {remaining > 0 ? `${fmt(remaining)} remaining` : "fully claimed"}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "0.35rem 0.875rem", color: "#15803d", textAlign: "right", fontSize: "0.82rem" }}>{fmt(p.yearClaimedPence)}</td>
                    </tr>
                  );
                })}
              </>
            )}
            {agriEnvUnclaimedProjects.length > 0 && agriEnvYearTotal === 0 && (
              <tr style={{ background: "#fafafa" }}>
                <td colSpan={2} style={{ padding: "0.45rem 0.875rem", paddingLeft: "1.75rem", color: "#6b7280", fontSize: "0.78rem", fontStyle: "italic" }}>
                  {agriEnvUnclaimedProjects.length} agri-env project{agriEnvUnclaimedProjects.length !== 1 ? "s" : ""} active — no completed milestone claims recorded for {year}
                </td>
              </tr>
            )}
            <TotalRow label="Total Farm Output" value={fmt(totalOutput)} />

            <SectionDivider label="Variable Costs" />
            {VARIABLE_COST_CATS.filter(c => varCosts[c] > 0).map(c => (
              <DataRow key={c} label={c} value={fmt(varCosts[c])} indent />
            ))}
            <TotalRow label="Total Variable Costs" value={`(${fmt(totalVarCosts)})`} />
            <TotalRow label="Gross Margin" value={fmt(grossMargin)} highlight />

            <SectionDivider label="Fixed Costs / Overheads" />
            {FIXED_COST_CATS.filter(c => fixedCosts[c] > 0).map(c => (
              <DataRow key={c} label={c} value={fmt(fixedCosts[c])} indent />
            ))}
            <TotalRow label="Total Fixed Costs" value={`(${fmt(totalFixed)})`} />
            <TotalRow label="Net Farm Income" value={fmt(netFarmIncome)} highlight />
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 8 }}>
        Based on {costs.length} financial transaction{costs.length !== 1 ? "s" : ""}{agriEnvYearTotal > 0 ? ` and completed milestone claims from ${agriEnvActiveProjects.length} agri-env project${agriEnvActiveProjects.length !== 1 ? "s" : ""} (from the Agri-Env tab, claims dated in ${year} only)` : agriEnvSummary.length > 0 ? ` — ${agriEnvSummary.length} agri-env project${agriEnvSummary.length !== 1 ? "s" : ""} active but no completed milestone claims in ${year}` : ""} recorded for {year}. Record depreciation as a "Machinery &amp; Equipment" or "Other Expense" transaction to include it in the P&amp;L. For a full balance sheet add assets and liabilities via the Asset Register.
      </p>
    </div>
  );
}

// ── Input Cost Breakdown Tab ─────────────────────────────────────────────────
function InputCostsTab({ farmId, year, onRegisterExport }: { farmId: number; year: number; onRegisterExport: (fn: ExportFn) => void }) {
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

  useEffect(() => {
    onRegisterExport(() => {
      const rows: (string | number)[][] = [["Category", "Total Cost", "% of Spend"]];
      for (const [cat, amt] of byCat) {
        const pct = totalExpenses > 0 ? ((amt / totalExpenses) * 100).toFixed(1) : "0.0";
        rows.push([cat, fmt(amt), `${pct}%`]);
      }
      rows.push(["TOTAL", fmt(totalExpenses), "100.0%"]);
      downloadCsv(`input-costs-${year}.csv`, rows);
    });
  }, [data, byCat, totalExpenses, year, onRegisterExport]);

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
function GrainPositionTab({ farmId, year, onRegisterExport }: { farmId: number; year: number; onRegisterExport: (fn: ExportFn) => void }) {
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

  useEffect(() => {
    onRegisterExport(() => {
      const rows: (string | number)[][] = [
        ["HARVEST BY CROP", "", ""],
        ["Crop", "Harvested (t)", "% of Total"],
        ...Object.entries(harvestedByCrop).map(([crop, tonnes]) => [
          crop, fmtN(tonnes), totalHarvested > 0 ? `${((tonnes / totalHarvested) * 100).toFixed(1)}%` : "—"
        ]),
        ["TOTAL", fmtN(totalHarvested), "100.0%"],
        [],
        ["HAULAGE MOVEMENTS", "", "", "", ""],
        ["Date", "Load", "Destination", "Weight (t)", "Haulier"],
        ...haulage.map((h: any) => [
          new Date(h.departureDate).toLocaleDateString("en-GB"),
          h.loadDescription || h.loadType || "—",
          h.destination || "—",
          fmtN(parseFloat(h.weightTonnes ?? 0)),
          h.haulierCompany || "—",
        ]),
        [],
        ["SUMMARY", ""],
        ["Total Harvested", `${fmtN(totalHarvested)} t`],
        ["Total Moved / Sold", `${fmtN(totalHaulageOut)} t`],
        ["Est. In Store / Unsold", `${fmtN(inStore)} t`],
        ["Crop Sales Income", fmt(totalSalesValue)],
      ];
      downloadCsv(`grain-position-${year}.csv`, rows);
    });
  }, [data, harvestedByCrop, haulage, totalHarvested, totalHaulageOut, inStore, totalSalesValue, year, onRegisterExport]);

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

const MILESTONE_STATUSES = ["pending", "submitted", "paid", "overdue"] as const;
type MilestoneStatus = typeof MILESTONE_STATUSES[number];

// ── Subsidies Tab ────────────────────────────────────────────────────────────
function SubsidiesTab({ farmId, year, onRegisterExport }: { farmId: number; year: number; onRegisterExport: (fn: ExportFn) => void }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["report-subsidies", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/subsidies?year=${year}`).then(r => r.json()),
    enabled: !!farmId,
  });

  const schemes: any[] = data?.schemes ?? [];
  const subsidyTx: any[] = (data?.subsidyTransactions ?? []).filter((t: any) => ["Agri-Environment Scheme", "Grant / Subsidy"].includes(t.category ?? ""));
  const agriEnvProjects: any[] = data?.agriEnvProjects ?? [];
  const agriEnvMilestones: any[] = data?.agriEnvMilestones ?? [];

  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [updatingMilestone, setUpdatingMilestone] = useState<number | null>(null);
  const [milestoneError, setMilestoneError] = useState<string | null>(null);
  const todayIso = new Date().toISOString().slice(0, 10);
  const [pendingCompletion, setPendingCompletion] = useState<{
    milestoneId: number; projectId: number; newStatus: string; date: string;
  } | null>(null);
  const [pendingPnlWarning, setPendingPnlWarning] = useState<{
    milestoneId: number; projectId: number; newStatus: string; completionDate?: string; claimAmountPence: number; direction: "add" | "remove";
  } | null>(null);

  const dateIsInYear = (dateStr: string) => new Date(dateStr).getFullYear() === year;

  const updateMilestoneStatus = useMutation({
    mutationFn: async ({ milestoneId, projectId, status, completionDate }: { milestoneId: number; projectId: number; status: string; completionDate?: string }) => {
      const body: Record<string, string> = { status };
      if (completionDate) body.completionDate = completionDate;
      const res = await fetch(apiUrl(`farms/${farmId}/agri-env-projects/${projectId}/milestones/${milestoneId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update milestone status");
      return res.json();
    },
    onSuccess: () => {
      setMilestoneError(null);
      setPendingCompletion(null);
      queryClient.invalidateQueries({ queryKey: ["report-subsidies", farmId, year] });
      queryClient.invalidateQueries({ queryKey: ["report-gross-margin", farmId, year] });
    },
    onError: () => {
      setMilestoneError("Failed to update milestone status. Please try again.");
    },
    onSettled: () => setUpdatingMilestone(null),
  });

  const milestonesByProject = useMemo(() => {
    const m: Record<number, any[]> = {};
    for (const ms of agriEnvMilestones) {
      if (!m[ms.projectId]) m[ms.projectId] = [];
      m[ms.projectId].push(ms);
    }
    return m;
  }, [agriEnvMilestones]);

  const toggleProject = (id: number) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const activeSchemes = schemes.filter(s => s.status === "active");
  const totalAnnualSchemes = activeSchemes.reduce((s, sc) => s + (sc.annualPaymentPence ?? 0), 0);
  const totalSubsidyReceived = subsidyTx.reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const totalAgriEnvGrantValue = agriEnvProjects.reduce((s, p) => s + (p.totalGrantValuePence ?? 0), 0);
  // Canonical milestone statuses: pending | submitted | paid | overdue
  const totalMilestonesDrawnDown = agriEnvMilestones.filter(m => m.status === "submitted" || m.status === "paid").reduce((s: number, m: any) => s + (m.claimAmountPence ?? 0), 0);
  const totalMilestonesOutstanding = agriEnvMilestones.filter(m => m.status !== "submitted" && m.status !== "paid" && m.claimAmountPence != null).reduce((s: number, m: any) => s + (m.claimAmountPence ?? 0), 0);

  const msStatusStyle = (status: string): React.CSSProperties => {
    if (status === "paid") return { background: "#dcfce7", color: "#166534" };
    if (status === "submitted") return { background: "#dbeafe", color: "#1e40af" };
    if (status === "overdue") return { background: "#fee2e2", color: "#991b1b" };
    return { background: "#f3f4f6", color: "#374151" };
  };

  useEffect(() => {
    onRegisterExport(() => {
      const rows: (string | number)[][] = [
        ["SCHEME AGREEMENTS", "", "", "", "", ""],
        ["Scheme", "Agreement No.", "Start Date", "End Date", "Annual Payment", "Status"],
        ...schemes.map((s: any) => [
          s.schemeName,
          s.agreementNumber || "—",
          s.startDate ? new Date(s.startDate).toLocaleDateString("en-GB") : "—",
          s.endDate ? new Date(s.endDate).toLocaleDateString("en-GB") : "Ongoing",
          s.annualPaymentPence != null ? fmt(s.annualPaymentPence) : "—",
          s.status,
        ]),
        [],
        ["AGRI-ENVIRONMENT SCHEMES", "", "", "", "", "", "", ""],
        ["Scheme", "Agreement Ref.", "Start Date", "End Date", "Total Grant Value", "Status", "", ""],
      ];
      for (const p of agriEnvProjects) {
        rows.push([
          p.schemeName,
          p.agreementReference || "—",
          p.startDate ? new Date(p.startDate).toLocaleDateString("en-GB") : "—",
          p.endDate ? new Date(p.endDate).toLocaleDateString("en-GB") : "Ongoing",
          p.totalGrantValuePence != null ? fmt(p.totalGrantValuePence) : "—",
          p.status, "", "",
        ]);
        const pMilestones = milestonesByProject[p.id] ?? [];
        if (pMilestones.length > 0) {
          rows.push(["", "  Milestone", "Due Date", "Completion Date", "Claim Amount", "Status", "", ""]);
          for (const ms of pMilestones) {
            rows.push([
              "",
              `  ${ms.milestoneName}`,
              ms.dueDate ? new Date(ms.dueDate).toLocaleDateString("en-GB") : "—",
              ms.completionDate ? new Date(ms.completionDate).toLocaleDateString("en-GB") : "—",
              ms.claimAmountPence != null ? fmt(ms.claimAmountPence) : "—",
              ms.status,
              "", "",
            ]);
          }
        }
      }
      rows.push(["Agri-environment schemes total", fmt(totalAgriEnvGrantValue)]);
      rows.push(["Total milestones submitted / paid", fmt(totalMilestonesDrawnDown)]);
      rows.push([]);
      rows.push(["SUBSIDY PAYMENTS RECEIVED", "", "", ""]);
      rows.push(["Date", "Description", "Category", "Amount"]);
      for (const t of subsidyTx) {
        rows.push([
          new Date(t.transactionDate).toLocaleDateString("en-GB"),
          t.description || "—",
          t.category || "—",
          fmt(t.amountPence),
        ]);
      }
      rows.push([]);
      rows.push(["Annual Scheme Value", fmt(totalAnnualSchemes)]);
      rows.push(["Agri-environment schemes total", fmt(totalAgriEnvGrantValue)]);
      rows.push(["Total Received", fmt(totalSubsidyReceived)]);
      downloadCsv(`subsidies-${year}.csv`, rows);
    });
  }, [data, schemes, agriEnvProjects, agriEnvMilestones, milestonesByProject, subsidyTx, totalAnnualSchemes, totalAgriEnvGrantValue, totalMilestonesDrawnDown, totalSubsidyReceived, year, onRegisterExport]);

  if (isLoading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>;
  if (schemes.length === 0 && subsidyTx.length === 0 && agriEnvProjects.length === 0) return <EmptyState icon={Leaf} message="Add agri-environment scheme agreements and subsidy transactions to see this report." />;

  return (
    <div className="space-y-6">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <StatCard label="Active Schemes" value={String(activeSchemes.length)} />
        <StatCard label="Annual Scheme Value" value={fmt(totalAnnualSchemes)} sub="Expected annual total" />
        <StatCard label="Agri-env Scheme Value" value={fmt(totalAgriEnvGrantValue)} sub="Active & completed agreements" bg="#f0fdf4" border="#bbf7d0" color="#166534" />
        <StatCard label="Subsidy Received" value={fmt(totalSubsidyReceived)} sub={`Recorded in ${year}`} bg="#eff6ff" border="#bfdbfe" color="#1e40af" />
      </div>
      {agriEnvMilestones.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <StatCard label="Milestones Submitted / Paid" value={fmt(totalMilestonesDrawnDown)} sub="Sum of submitted & paid milestones" bg="#f0fdf4" border="#bbf7d0" color="#166534" />
          <StatCard label="Milestones Outstanding" value={fmt(totalMilestonesOutstanding)} sub="Pending milestone claim amounts" bg="#fefce8" border="#fde68a" color="#92400e" />
          <StatCard label="Total Milestones" value={String(agriEnvMilestones.length)} sub="Across all agri-env projects" bg="#fafafa" border="#e5e7eb" color="#374151" />
        </div>
      )}

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

      {agriEnvProjects.length > 0 && totalAgriEnvGrantValue > 0 && (() => {
        const drawdownPct = Math.min(100, (totalMilestonesDrawnDown / totalAgriEnvGrantValue) * 100);
        return (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem 1.25rem" }}>
            <p style={{ fontSize: "0.72rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10, fontWeight: 600 }}>Farm-wide Drawdown Summary</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
              <div>
                <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: 2 }}>Total Grant Value</p>
                <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "#166534" }}>{fmt(totalAgriEnvGrantValue)}</p>
                <p style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{agriEnvProjects.filter((p: any) => p.totalGrantValuePence > 0).length} project{agriEnvProjects.filter((p: any) => p.totalGrantValuePence > 0).length !== 1 ? "s" : ""}</p>
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: 2 }}>Total Claimed</p>
                <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "#166534" }}>{fmt(totalMilestonesDrawnDown)}</p>
                <p style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Submitted &amp; paid milestones</p>
              </div>
              <div>
                <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: 2 }}>Overall Drawdown</p>
                <p style={{ fontSize: "1.2rem", fontWeight: 700, color: drawdownPct >= 75 ? "#166534" : drawdownPct >= 40 ? "#92400e" : "#374151" }}>{drawdownPct.toFixed(1)}%</p>
                <p style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{fmt(totalAgriEnvGrantValue - totalMilestonesDrawnDown)} remaining</p>
              </div>
            </div>
            <div style={{ background: "#dcfce7", borderRadius: 6, height: 10, width: "100%" }}>
              <div style={{ background: "#166534", borderRadius: 6, height: 10, width: `${drawdownPct}%`, transition: "width 0.3s ease", opacity: 0.9 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>£0</span>
              <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>{fmt(totalAgriEnvGrantValue)}</span>
            </div>
          </div>
        );
      })()}

      {agriEnvProjects.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }}>Agri-environment Schemes</h3>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["", "Scheme", "Agreement Ref.", "Start", "End", "Total Grant Value", "Status"].map(h => (
                    <th key={h} style={{ padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agriEnvProjects.map((p: any, i) => {
                  const pMilestones = milestonesByProject[p.id] ?? [];
                  const isExpanded = expandedProjects.has(p.id);
                  const claimedTotal = pMilestones.filter((m: any) => m.status === "submitted" || m.status === "paid").reduce((s: number, m: any) => s + (m.claimAmountPence ?? 0), 0);
                  return (
                    <>
                      <tr key={p.id} style={{ borderBottom: isExpanded ? "none" : (i < agriEnvProjects.length - 1 ? "1px solid #f3f4f6" : "none"), cursor: pMilestones.length > 0 ? "pointer" : undefined, background: isExpanded ? "#f9fafb" : undefined }}
                        onClick={() => pMilestones.length > 0 && toggleProject(p.id)}>
                        <td style={{ padding: "0.6rem 0.5rem 0.6rem 0.875rem", width: 24, color: "#9ca3af", fontSize: "0.75rem", userSelect: "none" }}>
                          {pMilestones.length > 0 ? (isExpanded ? "▾" : "▸") : ""}
                        </td>
                        <td style={{ padding: "0.6rem 0.875rem", fontWeight: 500 }}>
                          {p.schemeName}
                          {pMilestones.length > 0 && (
                            <span style={{ marginLeft: 6, fontSize: "0.7rem", color: "#6b7280", fontWeight: 400 }}>
                              {pMilestones.length} milestone{pMilestones.length !== 1 ? "s" : ""}
                              {claimedTotal > 0 && ` · ${fmt(claimedTotal)} submitted/paid`}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.8rem" }}>{p.agreementReference || "—"}</td>
                        <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{p.startDate ? new Date(p.startDate).toLocaleDateString("en-GB") : "—"}</td>
                        <td style={{ padding: "0.6rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{p.endDate ? new Date(p.endDate).toLocaleDateString("en-GB") : "Ongoing"}</td>
                        <td style={{ padding: "0.6rem 0.875rem", fontWeight: 500 }}>
                          {p.totalGrantValuePence != null ? fmt(p.totalGrantValuePence) : "—"}
                          {p.totalGrantValuePence > 0 && (() => {
                            const pct = Math.min(100, (claimedTotal / p.totalGrantValuePence) * 100);
                            return (
                              <div style={{ marginTop: 4 }}>
                                <div style={{ background: "#e5e7eb", borderRadius: 4, height: 6, width: "100%", minWidth: 80 }}>
                                  <div style={{ background: "#166534", borderRadius: 4, height: 6, width: `${pct}%`, opacity: 0.85 }} />
                                </div>
                                <div style={{ fontSize: "0.68rem", color: "#6b7280", marginTop: 2, whiteSpace: "nowrap" }}>
                                  {fmt(claimedTotal)} claimed · {pct.toFixed(0)}%
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td style={{ padding: "0.6rem 0.875rem" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 20, textTransform: "capitalize", background: p.status === "active" ? "#dcfce7" : p.status === "completed" ? "#eff6ff" : "#f3f4f6", color: p.status === "active" ? "#166534" : p.status === "completed" ? "#1e40af" : "#374151" }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && pMilestones.length > 0 && (
                        <>
                          <tr style={{ background: "#f9fafb" }}>
                            <td />
                            <td colSpan={6} style={{ padding: 0 }}>
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                                <thead>
                                  <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                    {["Milestone", "Due Date", "Completion Date", "Claim Amount", "Status"].map(h => (
                                      <th key={h} style={{ padding: "0.4rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.72rem" }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {pMilestones.map((ms: any, mi: number) => {
                                    const isUpdating = updatingMilestone === ms.id;
                                    const isPending = pendingCompletion?.milestoneId === ms.id;
                                    const isPendingWarning = pendingPnlWarning?.milestoneId === ms.id;
                                    const needsDate = (s: string) => (s === "submitted" || s === "paid") && !ms.completionDate;
                                    // A milestone is counted in the P&L if: status is submitted/paid,
                                    // completionDate falls in the report year, and the project overlaps
                                    // the year (same filter as the gross-margin API endpoint).
                                    const projectOverlapsYear =
                                      p.status !== "withdrawn" &&
                                      (!p.startDate || p.startDate <= `${year}-12-31`) &&
                                      (!p.endDate || p.endDate >= `${year}-01-01`);
                                    const msIsIncluded = (status: string, completionDate?: string) =>
                                      (status === "submitted" || status === "paid") &&
                                      !!completionDate && dateIsInYear(completionDate) &&
                                      projectOverlapsYear;
                                    // Warn only when P&L inclusion actually changes and there is a claim amount
                                    const pnlChanges = (newStatus: string, completionDate?: string) =>
                                      ms.claimAmountPence != null &&
                                      msIsIncluded(ms.status ?? "pending", ms.completionDate) !== msIsIncluded(newStatus, completionDate);
                                    const pnlChangeDir = (newStatus: string, completionDate?: string): "add" | "remove" =>
                                      msIsIncluded(newStatus, completionDate) ? "add" : "remove";
                                    return (
                                    <tr key={ms.id} style={{ borderBottom: mi < pMilestones.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                                      <td style={{ padding: "0.45rem 0.875rem", paddingLeft: "1.25rem", color: "#374151" }}>{ms.milestoneName}</td>
                                      <td style={{ padding: "0.45rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{ms.dueDate ? new Date(ms.dueDate).toLocaleDateString("en-GB") : "—"}</td>
                                      <td style={{ padding: "0.45rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                                        {isPending ? (
                                          <input
                                            type="date"
                                            value={pendingCompletion!.date}
                                            max={todayIso}
                                            onChange={e => setPendingCompletion(prev => prev ? { ...prev, date: e.target.value } : prev)}
                                            style={{ fontSize: "0.75rem", padding: "2px 4px", border: "1px solid #93c5fd", borderRadius: 4, background: "#eff6ff", color: "#1e40af", width: 120 }}
                                          />
                                        ) : (
                                          ms.completionDate ? new Date(ms.completionDate).toLocaleDateString("en-GB") : "—"
                                        )}
                                      </td>
                                      <td style={{ padding: "0.45rem 0.875rem", fontWeight: ms.claimAmountPence != null ? 600 : undefined, color: ms.claimAmountPence != null ? "#166534" : "#9ca3af" }}>
                                        {ms.claimAmountPence != null ? fmt(ms.claimAmountPence) : "—"}
                                      </td>
                                      <td style={{ padding: "0.45rem 0.875rem" }} onClick={e => e.stopPropagation()}>
                                        {isPendingWarning ? (
                                          <div style={{ display: "flex", flexDirection: "column", gap: 4, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, padding: "6px 8px", minWidth: 220 }}>
                                            <div style={{ fontSize: "0.7rem", color: "#92400e", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                                              <span>⚠</span>
                                              <span>
                                                {pendingPnlWarning!.direction === "add"
                                                  ? `This will add ${fmt(pendingPnlWarning!.claimAmountPence)} to the ${year} P&L income total.`
                                                  : `This will remove ${fmt(pendingPnlWarning!.claimAmountPence)} from the ${year} P&L income total.`}
                                              </span>
                                            </div>
                                            <div style={{ display: "flex", gap: 4 }}>
                                              <button
                                                onClick={() => {
                                                  const w = pendingPnlWarning!;
                                                  setPendingPnlWarning(null);
                                                  setPendingCompletion(null);
                                                  setUpdatingMilestone(w.milestoneId);
                                                  updateMilestoneStatus.mutate({ milestoneId: w.milestoneId, projectId: w.projectId, status: w.newStatus, completionDate: w.completionDate });
                                                }}
                                                disabled={isUpdating}
                                                style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, background: "#d97706", color: "#fff", border: "none", cursor: isUpdating ? "wait" : "pointer", fontWeight: 600, opacity: isUpdating ? 0.6 : 1 }}
                                              >
                                                {isUpdating ? "Saving…" : "Confirm"}
                                              </button>
                                              <button
                                                onClick={() => { setPendingPnlWarning(null); setPendingCompletion(null); }}
                                                disabled={isUpdating}
                                                style={{ fontSize: "0.7rem", padding: "2px 7px", borderRadius: 20, background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer", fontWeight: 600 }}
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>
                                        ) : isPending ? (
                                          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                            <button
                                              onClick={() => {
                                                if (!pendingCompletion?.date) return;
                                                if (pnlChanges(pendingCompletion.newStatus, pendingCompletion.date)) {
                                                  setPendingPnlWarning({
                                                    milestoneId: ms.id,
                                                    projectId: p.id,
                                                    newStatus: pendingCompletion.newStatus,
                                                    completionDate: pendingCompletion.date,
                                                    claimAmountPence: ms.claimAmountPence,
                                                    direction: pnlChangeDir(pendingCompletion.newStatus, pendingCompletion.date),
                                                  });
                                                } else {
                                                  setUpdatingMilestone(ms.id);
                                                  updateMilestoneStatus.mutate({
                                                    milestoneId: ms.id,
                                                    projectId: p.id,
                                                    status: pendingCompletion.newStatus,
                                                    completionDate: pendingCompletion.date,
                                                  });
                                                }
                                              }}
                                              disabled={isUpdating || !pendingCompletion?.date}
                                              style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, background: "#1e40af", color: "#fff", border: "none", cursor: isUpdating ? "wait" : "pointer", fontWeight: 600, opacity: isUpdating ? 0.6 : 1 }}
                                            >
                                              {isUpdating ? "Saving…" : "Save"}
                                            </button>
                                            <button
                                              onClick={() => setPendingCompletion(null)}
                                              disabled={isUpdating}
                                              style={{ fontSize: "0.7rem", padding: "2px 7px", borderRadius: 20, background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer", fontWeight: 600 }}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <select
                                            disabled={isUpdating}
                                            value={ms.status ?? "pending"}
                                            onChange={e => {
                                              const newStatus = e.target.value as MilestoneStatus;
                                              if (needsDate(newStatus)) {
                                                const defaultDate = ms.dueDate && ms.dueDate.slice(0, 10) <= todayIso ? ms.dueDate.slice(0, 10) : todayIso;
                                                setPendingCompletion({ milestoneId: ms.id, projectId: p.id, newStatus, date: defaultDate });
                                              } else if (pnlChanges(newStatus, ms.completionDate)) {
                                                setPendingPnlWarning({ milestoneId: ms.id, projectId: p.id, newStatus, completionDate: ms.completionDate, claimAmountPence: ms.claimAmountPence, direction: pnlChangeDir(newStatus, ms.completionDate) });
                                              } else {
                                                setUpdatingMilestone(ms.id);
                                                updateMilestoneStatus.mutate({ milestoneId: ms.id, projectId: p.id, status: newStatus });
                                              }
                                            }}
                                            style={{
                                              fontSize: "0.7rem",
                                              fontWeight: 600,
                                              padding: "2px 22px 2px 7px",
                                              borderRadius: 20,
                                              textTransform: "capitalize",
                                              border: "1px solid transparent",
                                              cursor: isUpdating ? "wait" : "pointer",
                                              appearance: "auto",
                                              opacity: isUpdating ? 0.6 : 1,
                                              ...msStatusStyle(ms.status ?? "pending"),
                                            }}
                                          >
                                            {MILESTONE_STATUSES.map(s => (
                                              <option key={s} value={s} style={{ textTransform: "capitalize" }}>{s}</option>
                                            ))}
                                          </select>
                                        )}
                                      </td>
                                    </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                              {milestoneError && (
                                <div style={{ padding: "0.5rem 0.875rem", background: "#fef2f2", borderTop: "1px solid #fecaca", color: "#991b1b", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 6 }}>
                                  <span>⚠</span>
                                  <span>{milestoneError}</span>
                                  <button onClick={() => setMilestoneError(null)} style={{ marginLeft: "auto", fontSize: "0.75rem", color: "#991b1b", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>✕</button>
                                </div>
                              )}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: i < agriEnvProjects.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                            <td colSpan={7} style={{ padding: 0 }} />
                          </tr>
                        </>
                      )}
                    </>
                  );
                })}
                <tr style={{ borderTop: "2px solid #d1fae5", background: "#f0fdf4" }}>
                  <td />
                  <td colSpan={4} style={{ padding: "0.6rem 0.875rem", fontWeight: 700, color: "#166534" }}>Total Agri-environment Scheme Value</td>
                  <td style={{ padding: "0.6rem 0.875rem", fontWeight: 700, color: "#166534" }}>{fmt(totalAgriEnvGrantValue)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: 6 }}>
            Click a project row to expand its milestones. Showing all agri-environment agreements except withdrawn ones.
          </p>
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
function YearOnYearTab({ farmId, onRegisterExport }: { farmId: number; onRegisterExport: (fn: ExportFn) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-year-on-year", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/year-on-year`).then(r => r.json()),
    enabled: !!farmId,
  });

  const allHarvests: any[] = data?.harvests ?? [];
  const allTx: any[] = data?.transactions ?? [];

  const availableYears = useMemo(() => {
    const s = new Set<number>();
    for (const h of allHarvests) if (h.harvestDate) s.add(new Date(h.harvestDate).getFullYear());
    for (const t of allTx) if (t.transactionDate) s.add(new Date(t.transactionDate).getFullYear());
    return [...s].sort((a, b) => b - a);
  }, [allHarvests, allTx]);

  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const activeYears = useMemo(() => {
    const base = selectedYears.length > 0 ? selectedYears : availableYears.slice(0, 5);
    return base.sort((a, b) => b - a).slice(0, 5);
  }, [selectedYears, availableYears]);

  const toggleYear = (y: number) => {
    setSelectedYears(prev => {
      if (prev.includes(y)) return prev.filter(x => x !== y);
      if (prev.length >= 5) return prev;
      return [...prev, y];
    });
  };

  const years = activeYears;

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

  useEffect(() => {
    onRegisterExport(() => {
      const header = ["Metric", ...byYear.map(r => String(r.year))];
      const dataRows = [
        ["Area Harvested (ha)", ...byYear.map(r => fmtN(r.totalArea))],
        ["Total Yield (t)", ...byYear.map(r => fmtN(r.totalYield))],
        ["Average Yield (t/ha)", ...byYear.map(r => fmtN(r.yieldPerHa, 2))],
        ["Total Income", ...byYear.map(r => fmt(r.totalIncome))],
        ["Total Expenditure", ...byYear.map(r => fmt(r.totalExpense))],
        ["Net Position", ...byYear.map(r => fmt(r.netPos))],
      ];
      const cropHeader = ["Crop", ...byYear.map(r => String(r.year))];
      const cropRows: (string | number)[][] = [...new Set(allHarvests.map((h: any) => h.cropName))].map(crop =>
        [String(crop), ...byYear.map(r => {
          const t = allHarvests.filter((h: any) => h.cropName === crop && new Date(h.harvestDate).getFullYear() === r.year).reduce((s: number, h: any) => s + parseFloat(h.yieldTonnes ?? 0), 0);
          return t > 0 ? fmtN(t) : "—";
        })]
      );
      downloadCsv("year-on-year.csv", [header, ...dataRows, [], ["CROP MIX BY YEAR (t)"], cropHeader, ...cropRows]);
    });
  }, [data, byYear, allHarvests, onRegisterExport]);

  if (isLoading) return <p className="text-sm text-muted-foreground py-8 text-center">Loading…</p>;
  if (availableYears.length === 0) return <EmptyState icon={Calendar} message="Add harvest records and financial transactions across multiple years to see trends." />;

  const changeIcon = (curr: number, prev: number) => {
    if (!prev) return null;
    return curr >= prev
      ? <TrendingUp size={14} style={{ color: "#166534", display: "inline", marginLeft: 4 }} />
      : <TrendingDown size={14} style={{ color: "#dc2626", display: "inline", marginLeft: 4 }} />;
  };

  return (
    <div className="space-y-6">
      {availableYears.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 500 }}>Compare seasons (up to 5):</span>
          {availableYears.map(y => {
            const isSelected = selectedYears.length === 0 ? activeYears.includes(y) : selectedYears.includes(y);
            return (
              <button
                key={y}
                onClick={() => toggleYear(y)}
                style={{ padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", border: `1px solid ${isSelected ? "#166534" : "#d1d5db"}`, background: isSelected ? "#dcfce7" : "#fff", color: isSelected ? "#166534" : "#6b7280", transition: "all 0.15s" }}
              >
                {y}
              </button>
            );
          })}
          {selectedYears.length > 0 && (
            <button onClick={() => setSelectedYears([])} style={{ fontSize: "0.75rem", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", marginLeft: 4 }}>Reset</button>
          )}
        </div>
      )}
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
function AssetRegisterTab({ farmId, onRegisterExport }: { farmId: number; onRegisterExport: (fn: ExportFn) => void }) {
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

  useEffect(() => {
    onRegisterExport(() => {
      const rows: (string | number)[][] = [
        ["Asset", "Type", "Purchase Year", "Age (yrs)", "Purchase Price", "Annual Depreciation", "Net Book Value", "Maintenance Spend", "Status"],
        ...assetRows.map(r => [
          r.name,
          r.type?.replace(/_/g, " ") || "—",
          r.purchaseYear ?? "—",
          r.age != null ? r.age : "—",
          r.purchasePricePence ? fmt(r.purchasePricePence) : "—",
          r.annualDeprn ? fmt(r.annualDeprn) : "—",
          r.nbv != null ? (r.nbv === 0 ? "Fully depreciated" : fmt(r.nbv)) : "—",
          r.maintCost > 0 ? fmt(r.maintCost) : "—",
          r.status,
        ]),
        [],
        ["TOTALS", "", "", "", fmt(totalPurchaseValue), "", fmt(totalNbv), fmt(totalMaint)],
      ];
      downloadCsv("asset-register.csv", rows);
    });
  }, [data, assetRows, totalPurchaseValue, totalNbv, totalMaint, onRegisterExport]);

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
  const [tab, setTab] = usePersistedTab<Tab>({ page: "business-reports", farmId, validIds: ["gross-margin", "pl", "input-costs", "grain-position", "subsidies", "year-on-year", "assets", "benchmarking"], defaultTab: "gross-margin" });
  const [year, setYear] = usePersistedNumberFilter({ page: "business-reports", filter: "year", farmId, defaultValue: new Date().getFullYear() });
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const [exportFn, setExportFn] = useState<ExportFn | null>(null);

  const onRegisterExport = useCallback((fn: ExportFn) => {
    setExportFn(() => fn);
  }, []);

  // Reset export fn when tab changes so the button isn't stale
  useEffect(() => { setExportFn(null); }, [tab]);

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
      {/* Print-only styles */}
      <style>{`
        @media print {
          aside, nav, header, [data-sidebar], .sidebar, [class*="sidebar"] { display: none !important; }
          body { background: white !important; }
          .print-hide { display: none !important; }
        }
      `}</style>

      <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
        Financial performance reports, grain position, subsidy income and asset register — all derived from data recorded across your farm modules.
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", flex: 1 }}>
          <TabBar>
            <TabButton active={tab === "gross-margin"} onClick={() => setTab("gross-margin")}>Gross Margin</TabButton>
            <TabButton active={tab === "pl"} onClick={() => setTab("pl")}>P&amp;L Statement</TabButton>
            <TabButton active={tab === "input-costs"} onClick={() => setTab("input-costs")}>Input Costs</TabButton>
            <TabButton active={tab === "grain-position"} onClick={() => setTab("grain-position")}>Grain Position</TabButton>
            <TabButton active={tab === "subsidies"} onClick={() => setTab("subsidies")}>Subsidies</TabButton>
            <TabButton active={tab === "year-on-year"} onClick={() => setTab("year-on-year")}>Year-on-Year</TabButton>
            <TabButton active={tab === "assets"} onClick={() => setTab("assets")}>Asset Register</TabButton>
            <TabButton active={tab === "benchmarking"} onClick={() => setTab("benchmarking")}>Benchmarking</TabButton>
          </TabBar>
        </div>

        <div className="print-hide" style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          {showYearSelector && (
            <Select value={String(year)} onValueChange={v => setYear(parseInt(v))}>
              <SelectTrigger style={{ width: 110 }}><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            style={{ gap: "0.375rem", display: "flex", alignItems: "center" }}
          >
            <Printer size={14} />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportFn?.()}
            disabled={!exportFn}
            style={{ gap: "0.375rem", display: "flex", alignItems: "center" }}
          >
            <Download size={14} />
            Export CSV
          </Button>
        </div>
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        {tab === "gross-margin" && <GrossMarginTab farmId={farmId} year={year} onRegisterExport={onRegisterExport} />}
        {tab === "pl" && <PLTab farmId={farmId} year={year} onRegisterExport={onRegisterExport} />}
        {tab === "input-costs" && <InputCostsTab farmId={farmId} year={year} onRegisterExport={onRegisterExport} />}
        {tab === "grain-position" && <GrainPositionTab farmId={farmId} year={year} onRegisterExport={onRegisterExport} />}
        {tab === "subsidies" && <SubsidiesTab farmId={farmId} year={year} onRegisterExport={onRegisterExport} />}
        {tab === "year-on-year" && <YearOnYearTab farmId={farmId} onRegisterExport={onRegisterExport} />}
        {tab === "assets" && <AssetRegisterTab farmId={farmId} onRegisterExport={onRegisterExport} />}
        {tab === "benchmarking" && <BenchmarkingTab farmId={farmId} year={year} />}
      </div>
    </AppLayout>
  );
}

// ─── T018: Benchmarking Tab ────────────────────────────────────────────────────
const BENCHMARKS: { metric: string; unit: string; low: number; avg: number; top: number; description: string }[] = [
  { metric: "Winter Wheat Yield",          unit: "t/ha",        low: 6.0,   avg: 8.2,   top: 11.0,  description: "AHDB national average 2023" },
  { metric: "Winter Barley Yield",         unit: "t/ha",        low: 5.0,   avg: 6.8,   top: 9.5,   description: "AHDB national average 2023" },
  { metric: "OSR Yield",                   unit: "t/ha",        low: 2.8,   avg: 3.5,   top: 5.2,   description: "AHDB national average 2023" },
  { metric: "Wheat Variable Costs",        unit: "£/ha",        low: 850,   avg: 680,   top: 520,   description: "Lower is better — Andersons Benchmarking" },
  { metric: "Wheat Gross Margin",          unit: "£/ha",        low: 320,   avg: 680,   top: 1200,  description: "AHDB Farmbench top third vs bottom third" },
  { metric: "Nitrogen Use Efficiency",     unit: "kg grain/kg N",low: 28,   avg: 38,    top: 52,    description: "Sustainable use target >40 kg grain/kg N" },
  { metric: "Spray Costs",                 unit: "£/ha",        low: 340,   avg: 230,   top: 155,   description: "Lower is better — Nix Farm Management 2023" },
  { metric: "Diesel Consumption",          unit: "l/ha",        low: 120,   avg: 85,    top: 55,    description: "Lower is better" },
  { metric: "Machinery Depreciation",      unit: "£/ha",        low: 190,   avg: 130,   top: 75,    description: "Lower is better" },
  { metric: "Labour Cost",                 unit: "£/ha",        low: 210,   avg: 145,   top: 90,    description: "Lower is better" },
];

function BenchmarkingTab({ farmId, year }: { farmId: number; year: number }) {
  const [farmValues, setFarmValues] = useState<Record<string, string>>({});
  const fv = (k: string) => parseFloat(farmValues[k] ?? "") || null;

  const position = (val: number | null, b: typeof BENCHMARKS[0]) => {
    if (val === null) return null;
    const lowerIsBetter = ["Variable Costs", "Costs", "Spray", "Diesel", "Machinery", "Labour"].some(k => b.metric.includes(k));
    if (lowerIsBetter) {
      if (val <= b.top) return "top";
      if (val <= b.avg) return "avg";
      return "low";
    } else {
      if (val >= b.top) return "top";
      if (val >= b.avg) return "avg";
      return "low";
    }
  };

  const posColor = (p: string | null) => p === "top" ? "#16a34a" : p === "avg" ? "#d97706" : p === "low" ? "#dc2626" : "#9ca3af";
  const posLabel = (p: string | null) => p === "top" ? "Top third" : p === "avg" ? "Middle" : p === "low" ? "Bottom third" : "Enter value";

  return (
    <div style={{ padding: "0.5rem 0" }}>
      <div style={{ display: "flex", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: "0.85rem", color: "#1e40af", alignItems: "flex-start" }}>
        <TrendingUp size={15} style={{ marginTop: 1, flexShrink: 0 }} />
        <span><strong>Industry Benchmarking</strong> — Enter your farm figures to compare against AHDB and Andersons national benchmarks for {year}. Data sources: AHDB Farmbench, Nix Farm Management Pocketbook, Andersons Benchmarking.</span>
      </div>
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Metric", "Unit", "Your figure", "Bottom third", "Average", "Top third", "Position"].map(h => (
                <th key={h} style={{ padding: "0.6rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BENCHMARKS.map((b, i, arr) => {
              const val = fv(b.metric);
              const pos = position(val, b);
              return (
                <tr key={b.metric} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.6rem 1rem", fontWeight: 500 }}>
                    <div>{b.metric}</div>
                    <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{b.description}</div>
                  </td>
                  <td style={{ padding: "0.6rem 1rem", color: "#6b7280", fontSize: "0.8rem" }}>{b.unit}</td>
                  <td style={{ padding: "0.4rem 0.75rem" }}>
                    <input type="number" step="any" style={{ width: 80, border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: "0.85rem" }} value={farmValues[b.metric] ?? ""} onChange={e => setFarmValues(p => ({ ...p, [b.metric]: e.target.value }))} placeholder="—" />
                  </td>
                  <td style={{ padding: "0.6rem 1rem", fontSize: "0.8rem", color: "#dc2626" }}>{b.low}</td>
                  <td style={{ padding: "0.6rem 1rem", fontSize: "0.8rem", color: "#d97706" }}>{b.avg}</td>
                  <td style={{ padding: "0.6rem 1rem", fontSize: "0.8rem", color: "#16a34a" }}>{b.top}</td>
                  <td style={{ padding: "0.6rem 1rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: posColor(pos), background: posColor(pos) + "1a", borderRadius: 999, padding: "2px 10px", display: "inline-block" }}>
                      {posLabel(pos)}
                    </span>
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
