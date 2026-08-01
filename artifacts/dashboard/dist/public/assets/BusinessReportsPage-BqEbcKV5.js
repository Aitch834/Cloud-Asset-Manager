import { b as useAppStore, r as reactExports, j as jsxRuntimeExports, c as Button, l as useQuery } from "./index-9TdKDBky.js";
import { s as sanitiseCsvCell } from "./csv-Dr539t8b.js";
import { A as AppLayout, e as ChartColumn, T as TrendingUp } from "./AppLayout-DLDCaeZI.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-D40rD95d.js";
import { T as TabBar, a as TabButton } from "./tab-button-DEgqcQIX.js";
import { P as Printer } from "./printer-BCiLP3fN.js";
import { D as Download } from "./download-C2Lzohwb.js";
import { P as PoundSterling } from "./shield-alert-D1qAeL2C.js";
import { P as Package } from "./use-safe-clerk-ojNgkJUn.js";
import { L as Leaf } from "./triangle-alert-ovS-qHuL.js";
import { C as Calendar } from "./calendar-CaYxTra8.js";
import { T as Tractor } from "./tractor-G-wv8iDL.js";
import { T as TrendingDown } from "./trending-down-B-J2peGz.js";
import "./trash-2-T2G6OWGD.js";
import "./database-BUiHbT9Z.js";
import "./shield-check-BeSegzgb.js";
import "./index-CiizZ2VB.js";
import "./index-DFhdgm2F.js";
import "./chevron-up-Ch-I18bp.js";
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
  "Contracting & Machinery Hire"
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
  "Other Expense"
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
  "Other Income"
];
const fmt = (p) => {
  if (p == null) return "—";
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const fmtN = (n, dp = 2) => {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
};
function downloadCsv(filename, rows) {
  const content = rows.map(
    (r) => r.map((cell) => {
      const safe = sanitiseCsvCell(cell);
      return safe.includes(",") || safe.includes('"') || safe.includes("\n") ? `"${safe.replace(/"/g, '""')}"` : safe;
    }).join(",")
  ).join("\n");
  const blob = new Blob(["\uFEFF" + content, ""], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1e3);
}
function StatCard({ label, value, sub, color = "#166534", bg = "#f0fdf4", border = "#bbf7d0" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "0.875rem 1.125rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 700, color, lineHeight: 1 }, children: value }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 3 }, children: sub })
  ] });
}
function SectionDivider({ label }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 99, style: { padding: "0.4rem 0.875rem", fontSize: "0.72rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: "1px solid #e5e7eb", borderTop: "1px solid #e5e7eb" }, children: label }) });
}
function TotalRow({ label, value, highlight }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: highlight ? "#f0fdf4" : "#fff", borderTop: "2px solid #d1fae5" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 700, color: "#111827" }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 700, color: highlight ? "#166534" : "#111827", textAlign: "right" }, children: value })
  ] });
}
function DataRow({ label, value, indent }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem", paddingLeft: indent ? "1.75rem" : "0.875rem", color: "#374151" }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem", color: "#374151", textAlign: "right" }, children: value })
  ] });
}
function EmptyState({ icon: Icon, message }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 36, style: { margin: "0 auto 12px", opacity: 0.4 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", marginBottom: 4 }, children: "No data available" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: message })
  ] });
}
function GrossMarginTab({ farmId, year, onRegisterExport }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-gross-margin", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/gross-margin?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const harvests = data?.harvests ?? [];
  const costs = data?.costs ?? [];
  const cropMap = reactExports.useMemo(() => {
    const m = {};
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
  const incomeTotal = costs.filter((t) => t.transactionType === "income").reduce((s, t) => s + (t.amountPence ?? 0), 0);
  costs.filter((t) => t.category === "Crop Sales").reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const varCostTotal = costs.filter((t) => t.transactionType === "expense" && VARIABLE_COST_CATS.includes(t.category ?? "")).reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const grossMargin = incomeTotal - varCostTotal;
  const costByCat = reactExports.useMemo(() => {
    const m = {};
    for (const t of costs) {
      if (t.transactionType === "expense") {
        m[t.category ?? "Other"] = (m[t.category ?? "Other"] ?? 0) + (t.amountPence ?? 0);
      }
    }
    return m;
  }, [costs]);
  reactExports.useEffect(() => {
    onRegisterExport(() => {
      const rows = [["Crop", "Records", "Area (ha)", "Total Yield (t)", "Yield / ha"]];
      for (const [crop, d] of Object.entries(cropMap)) {
        rows.push([crop, d.count, fmtN(d.area), fmtN(d.yield), d.area > 0 ? fmtN(d.yield / d.area) : "—"]);
      }
      rows.push([]);
      rows.push(["Input Cost Category", "Total Cost", "Cost / ha"]);
      for (const cat of VARIABLE_COST_CATS.filter((c) => costByCat[c])) {
        rows.push([cat, fmt(costByCat[cat]), totalArea > 0 ? fmt(Math.round(costByCat[cat] / totalArea)) : "—"]);
      }
      rows.push(["Total Variable Costs", fmt(varCostTotal), totalArea > 0 ? fmt(Math.round(varCostTotal / totalArea)) : "—"]);
      rows.push([]);
      rows.push(["Summary", ""]);
      rows.push(["Total Farm Output", fmt(incomeTotal)]);
      rows.push(["Total Variable Costs", fmt(varCostTotal)]);
      rows.push(["Gross Margin", fmt(grossMargin)]);
      downloadCsv(`gross-margin-${year}.csv`, rows);
    });
  }, [data, cropMap, costByCat, totalArea, varCostTotal, incomeTotal, grossMargin, year, onRegisterExport]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Loading…" });
  if (harvests.length === 0 && costs.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: TrendingUp, message: "Add harvest records and financial transactions to generate this report." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Area Harvested", value: `${fmtN(totalArea)} ha` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Yield", value: `${fmtN(totalYield)} t`, sub: totalArea > 0 ? `${fmtN(totalYield / totalArea)} t/ha avg` : void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Farm Output", value: fmt(incomeTotal), bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Gross Margin", value: fmt(grossMargin), bg: grossMargin >= 0 ? "#f0fdf4" : "#fef2f2", border: grossMargin >= 0 ? "#bbf7d0" : "#fecaca", color: grossMargin >= 0 ? "#166534" : "#991b1b" })
    ] }),
    Object.keys(cropMap).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }, children: "Yield by Crop" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Crop", "Records", "Area (ha)", "Total Yield (t)", "Yield / ha"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: Object.entries(cropMap).map(([crop, d], i, arr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 600 }, children: crop }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280" }, children: d.count }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280" }, children: fmtN(d.area) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 500 }, children: fmtN(d.yield) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280" }, children: d.area > 0 ? fmtN(d.yield / d.area) : "—" })
        ] }, crop)) })
      ] }) })
    ] }),
    Object.keys(costByCat).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }, children: "Variable Input Costs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Category", "Total Cost", "Cost / ha"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          VARIABLE_COST_CATS.filter((c) => costByCat[c]).map((cat, i, arr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem" }, children: cat }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#dc2626" }, children: fmt(costByCat[cat]) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280" }, children: totalArea > 0 ? fmt(Math.round(costByCat[cat] / totalArea)) : "—" })
          ] }, cat)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: "2px solid #d1fae5", background: "#f0fdf4" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 700 }, children: "Total Variable Costs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 700, color: "#dc2626" }, children: fmt(varCostTotal) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 500, color: "#6b7280" }, children: totalArea > 0 ? fmt(Math.round(varCostTotal / totalArea)) : "—" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 6 }, children: "* Input costs are shown as farm totals for the year. Allocation per crop requires tagging individual transactions to a specific crop." })
    ] })
  ] });
}
function PLTab({ farmId, year, onRegisterExport }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-gross-margin", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/gross-margin?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const costs = data?.costs ?? [];
  const sumCat = (cat) => costs.filter((t) => t.category === cat).reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const incomeValues = INCOME_CATS.reduce((m, c) => {
    m[c] = sumCat(c);
    return m;
  }, {});
  const totalOutput = Object.values(incomeValues).reduce((s, v) => s + v, 0);
  const varCosts = VARIABLE_COST_CATS.reduce((m, c) => {
    m[c] = sumCat(c);
    return m;
  }, {});
  const totalVarCosts = Object.values(varCosts).reduce((s, v) => s + v, 0);
  const grossMargin = totalOutput - totalVarCosts;
  const fixedCosts = FIXED_COST_CATS.reduce((m, c) => {
    m[c] = sumCat(c);
    return m;
  }, {});
  const totalFixed = Object.values(fixedCosts).reduce((s, v) => s + v, 0);
  const netFarmIncome = grossMargin - totalFixed;
  reactExports.useEffect(() => {
    onRegisterExport(() => {
      const rows = [
        ["Line Item", "Amount"],
        ["INCOME", ""],
        ...INCOME_CATS.filter((c) => incomeValues[c] > 0).map((c) => [c, fmt(incomeValues[c])]),
        ["Total Farm Output", fmt(totalOutput)],
        [],
        ["VARIABLE COSTS", ""],
        ...VARIABLE_COST_CATS.filter((c) => varCosts[c] > 0).map((c) => [c, fmt(varCosts[c])]),
        ["Total Variable Costs", `(${fmt(totalVarCosts)})`],
        ["Gross Margin", fmt(grossMargin)],
        [],
        ["FIXED COSTS / OVERHEADS", ""],
        ...FIXED_COST_CATS.filter((c) => fixedCosts[c] > 0).map((c) => [c, fmt(fixedCosts[c])]),
        ["Total Fixed Costs", `(${fmt(totalFixed)})`],
        ["Net Farm Income", fmt(netFarmIncome)]
      ];
      downloadCsv(`pl-statement-${year}.csv`, rows);
    });
  }, [data, totalOutput, totalVarCosts, grossMargin, totalFixed, netFarmIncome, year, onRegisterExport]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Loading…" });
  if (costs.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: PoundSterling, message: "Add financial transactions to generate the income statement." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Farm Output", value: fmt(totalOutput), bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Gross Margin", value: fmt(grossMargin), bg: grossMargin >= 0 ? "#f0fdf4" : "#fef2f2", border: grossMargin >= 0 ? "#bbf7d0" : "#fecaca", color: grossMargin >= 0 ? "#166534" : "#991b1b" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Net Farm Income", value: fmt(netFarmIncome), bg: netFarmIncome >= 0 ? "#f0fdf4" : "#fef2f2", border: netFarmIncome >= 0 ? "#bbf7d0" : "#fecaca", color: netFarmIncome >= 0 ? "#166534" : "#991b1b", sub: "After fixed costs" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionDivider, { label: "Income" }),
      INCOME_CATS.filter((c) => incomeValues[c] > 0).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: c, value: fmt(incomeValues[c]), indent: true }, c)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TotalRow, { label: "Total Farm Output", value: fmt(totalOutput) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionDivider, { label: "Variable Costs" }),
      VARIABLE_COST_CATS.filter((c) => varCosts[c] > 0).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: c, value: fmt(varCosts[c]), indent: true }, c)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TotalRow, { label: "Total Variable Costs", value: `(${fmt(totalVarCosts)})` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TotalRow, { label: "Gross Margin", value: fmt(grossMargin), highlight: true }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionDivider, { label: "Fixed Costs / Overheads" }),
      FIXED_COST_CATS.filter((c) => fixedCosts[c] > 0).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: c, value: fmt(fixedCosts[c]), indent: true }, c)),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TotalRow, { label: "Total Fixed Costs", value: `(${fmt(totalFixed)})` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TotalRow, { label: "Net Farm Income", value: fmt(netFarmIncome), highlight: true })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 8 }, children: [
      "Based on ",
      costs.length,
      " financial transactions recorded for ",
      year,
      '. Record depreciation as a "Machinery & Equipment" or "Other Expense" transaction to include it in the P&L. For a full balance sheet add assets and liabilities via the Asset Register.'
    ] })
  ] });
}
function InputCostsTab({ farmId, year, onRegisterExport }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-gross-margin", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/gross-margin?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const costs = (data?.costs ?? []).filter((t) => t.transactionType === "expense");
  const totalExpenses = costs.reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const byCat = reactExports.useMemo(() => {
    const m = {};
    for (const t of costs) {
      const k = t.category || "Uncategorised";
      m[k] = (m[k] ?? 0) + (t.amountPence ?? 0);
    }
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [costs]);
  reactExports.useMemo(() => {
    const m = {};
    for (const t of costs) {
      const mo = new Date(t.transactionDate).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
      m[mo] = (m[mo] ?? 0) + (t.amountPence ?? 0);
    }
    return Object.entries(m);
  }, [costs]);
  reactExports.useEffect(() => {
    onRegisterExport(() => {
      const rows = [["Category", "Total Cost", "% of Spend"]];
      for (const [cat, amt] of byCat) {
        const pct = totalExpenses > 0 ? (amt / totalExpenses * 100).toFixed(1) : "0.0";
        rows.push([cat, fmt(amt), `${pct}%`]);
      }
      rows.push(["TOTAL", fmt(totalExpenses), "100.0%"]);
      downloadCsv(`input-costs-${year}.csv`, rows);
    });
  }, [data, byCat, totalExpenses, year, onRegisterExport]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Loading…" });
  if (costs.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: ChartColumn, message: "Add expense transactions to see your input cost breakdown." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Expenditure", value: fmt(totalExpenses), bg: "#fef2f2", border: "#fecaca", color: "#dc2626" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Expense Records", value: String(costs.length), bg: "#fafafa", border: "#e5e7eb", color: "#374151" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Avg Monthly Spend", value: fmt(Math.round(totalExpenses / 12)), bg: "#fafafa", border: "#e5e7eb", color: "#374151" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Category", "Total", "% of Spend", "Bar"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: byCat.map(([cat, amt], i) => {
        const pct = totalExpenses > 0 ? amt / totalExpenses * 100 : 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < byCat.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 500 }, children: cat }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#dc2626" }, children: fmt(amt) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280" }, children: [
            pct.toFixed(1),
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", width: "30%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f3f4f6", borderRadius: 4, height: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#dc2626", borderRadius: 4, height: 8, width: `${pct}%`, opacity: 0.7 } }) }) })
        ] }, cat);
      }) })
    ] }) })
  ] });
}
function GrainPositionTab({ farmId, year, onRegisterExport }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-grain-position", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/grain-position?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const harvests = data?.harvests ?? [];
  const haulage = data?.haulage ?? [];
  const cropSales = (data?.cropSalesTransactions ?? []).filter((t) => t.category === "Crop Sales");
  const harvestedByCrop = reactExports.useMemo(() => {
    const m = {};
    for (const h of harvests) m[h.cropName || "Unknown"] = (m[h.cropName || "Unknown"] ?? 0) + parseFloat(h.yieldTonnes ?? 0);
    return m;
  }, [harvests]);
  const totalHarvested = Object.values(harvestedByCrop).reduce((s, v) => s + v, 0);
  const totalHaulageOut = haulage.reduce((s, h) => s + parseFloat(h.weightTonnes ?? 0), 0);
  const inStore = Math.max(0, totalHarvested - totalHaulageOut);
  const totalSalesValue = cropSales.reduce((s, t) => s + (t.amountPence ?? 0), 0);
  reactExports.useEffect(() => {
    onRegisterExport(() => {
      const rows = [
        ["HARVEST BY CROP", "", ""],
        ["Crop", "Harvested (t)", "% of Total"],
        ...Object.entries(harvestedByCrop).map(([crop, tonnes]) => [
          crop,
          fmtN(tonnes),
          totalHarvested > 0 ? `${(tonnes / totalHarvested * 100).toFixed(1)}%` : "—"
        ]),
        ["TOTAL", fmtN(totalHarvested), "100.0%"],
        [],
        ["HAULAGE MOVEMENTS", "", "", "", ""],
        ["Date", "Load", "Destination", "Weight (t)", "Haulier"],
        ...haulage.map((h) => [
          new Date(h.departureDate).toLocaleDateString("en-GB"),
          h.loadDescription || h.loadType || "—",
          h.destination || "—",
          fmtN(parseFloat(h.weightTonnes ?? 0)),
          h.haulierCompany || "—"
        ]),
        [],
        ["SUMMARY", ""],
        ["Total Harvested", `${fmtN(totalHarvested)} t`],
        ["Total Moved / Sold", `${fmtN(totalHaulageOut)} t`],
        ["Est. In Store / Unsold", `${fmtN(inStore)} t`],
        ["Crop Sales Income", fmt(totalSalesValue)]
      ];
      downloadCsv(`grain-position-${year}.csv`, rows);
    });
  }, [data, harvestedByCrop, haulage, totalHarvested, totalHaulageOut, inStore, totalSalesValue, year, onRegisterExport]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Loading…" });
  if (harvests.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Package, message: "Add harvest records to track your grain position." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Harvested", value: `${fmtN(totalHarvested)} t` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Moved / Sold", value: `${fmtN(totalHaulageOut)} t`, bg: "#fef3c7", border: "#fde68a", color: "#92400e" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Est. In Store / Unsold", value: `${fmtN(inStore)} t`, bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Crop Sales Income", value: fmt(totalSalesValue) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }, children: "Harvest by Crop" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Crop", "Harvested (t)", "% of Total"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: Object.entries(harvestedByCrop).map(([crop, tonnes], i, arr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 500 }, children: crop }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem" }, children: fmtN(tonnes) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280" }, children: totalHarvested > 0 ? `${(tonnes / totalHarvested * 100).toFixed(1)}%` : "—" })
        ] }, crop)) })
      ] }) })
    ] }),
    haulage.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }, children: "Recent Haulage Movements" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Load", "Destination", "Weight (t)", "Haulier"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: haulage.slice(0, 15).map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < Math.min(haulage.length, 15) - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: new Date(h.departureDate).toLocaleDateString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem" }, children: h.loadDescription || h.loadType || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280" }, children: h.destination || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem" }, children: fmtN(parseFloat(h.weightTonnes ?? 0)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280" }, children: h.haulierCompany || "—" })
        ] }, h.id)) })
      ] }) })
    ] })
  ] });
}
function SubsidiesTab({ farmId, year, onRegisterExport }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-subsidies", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/subsidies?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const schemes = data?.schemes ?? [];
  const subsidyTx = (data?.subsidyTransactions ?? []).filter((t) => ["Agri-Environment Scheme", "Grant / Subsidy"].includes(t.category ?? ""));
  const activeSchemes = schemes.filter((s) => s.status === "active");
  const totalAnnualSchemes = activeSchemes.reduce((s, sc) => s + (sc.annualPaymentPence ?? 0), 0);
  const totalSubsidyReceived = subsidyTx.reduce((s, t) => s + (t.amountPence ?? 0), 0);
  reactExports.useEffect(() => {
    onRegisterExport(() => {
      const rows = [
        ["SCHEME AGREEMENTS", "", "", "", "", ""],
        ["Scheme", "Agreement No.", "Start Date", "End Date", "Annual Payment", "Status"],
        ...schemes.map((s) => [
          s.schemeName,
          s.agreementNumber || "—",
          s.startDate ? new Date(s.startDate).toLocaleDateString("en-GB") : "—",
          s.endDate ? new Date(s.endDate).toLocaleDateString("en-GB") : "Ongoing",
          s.annualPaymentPence != null ? fmt(s.annualPaymentPence) : "—",
          s.status
        ]),
        [],
        ["SUBSIDY PAYMENTS RECEIVED", "", "", ""],
        ["Date", "Description", "Category", "Amount"],
        ...subsidyTx.map((t) => [
          new Date(t.transactionDate).toLocaleDateString("en-GB"),
          t.description || "—",
          t.category || "—",
          fmt(t.amountPence)
        ]),
        [],
        ["Annual Scheme Value", fmt(totalAnnualSchemes)],
        ["Total Received", fmt(totalSubsidyReceived)]
      ];
      downloadCsv(`subsidies-${year}.csv`, rows);
    });
  }, [data, schemes, subsidyTx, totalAnnualSchemes, totalSubsidyReceived, year, onRegisterExport]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Loading…" });
  if (schemes.length === 0 && subsidyTx.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Leaf, message: "Add agri-environment scheme agreements and subsidy transactions to see this report." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active Schemes", value: String(activeSchemes.length) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Annual Scheme Value", value: fmt(totalAnnualSchemes), sub: "Expected annual total" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Subsidy Received", value: fmt(totalSubsidyReceived), sub: `Recorded in ${year}`, bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" })
    ] }),
    schemes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }, children: "Scheme Agreements" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Scheme", "Agreement No.", "Start", "End", "Annual Payment", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: schemes.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < schemes.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 500 }, children: s.schemeName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.8rem" }, children: s.agreementNumber || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: new Date(s.startDate).toLocaleDateString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: s.endDate ? new Date(s.endDate).toLocaleDateString("en-GB") : "Ongoing" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 500 }, children: s.annualPaymentPence != null ? fmt(s.annualPaymentPence) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 20, textTransform: "capitalize", background: s.status === "active" ? "#dcfce7" : "#f3f4f6", color: s.status === "active" ? "#166534" : "#374151" }, children: s.status }) })
        ] }, s.id)) })
      ] }) })
    ] }),
    subsidyTx.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { style: { fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }, children: [
        "Subsidy & Grant Payments Received (",
        year,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date", "Description", "Category", "Amount"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: subsidyTx.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < subsidyTx.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: new Date(t.transactionDate).toLocaleDateString("en-GB") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem" }, children: t.description || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280" }, children: t.category || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 600, color: "#166534" }, children: fmt(t.amountPence) })
        ] }, t.id)) })
      ] }) })
    ] })
  ] });
}
function YearOnYearTab({ farmId, onRegisterExport }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-year-on-year", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/year-on-year`).then((r) => r.json()),
    enabled: !!farmId
  });
  const allHarvests = data?.harvests ?? [];
  const allTx = data?.transactions ?? [];
  const availableYears = reactExports.useMemo(() => {
    const s = /* @__PURE__ */ new Set();
    for (const h of allHarvests) if (h.harvestDate) s.add(new Date(h.harvestDate).getFullYear());
    for (const t of allTx) if (t.transactionDate) s.add(new Date(t.transactionDate).getFullYear());
    return [...s].sort((a, b) => b - a);
  }, [allHarvests, allTx]);
  const [selectedYears, setSelectedYears] = reactExports.useState([]);
  const activeYears = reactExports.useMemo(() => {
    const base = selectedYears.length > 0 ? selectedYears : availableYears.slice(0, 5);
    return base.sort((a, b) => b - a).slice(0, 5);
  }, [selectedYears, availableYears]);
  const toggleYear = (y) => {
    setSelectedYears((prev) => {
      if (prev.includes(y)) return prev.filter((x) => x !== y);
      if (prev.length >= 5) return prev;
      return [...prev, y];
    });
  };
  const years = activeYears;
  const byYear = reactExports.useMemo(() => years.map((y) => {
    const yHarvests = allHarvests.filter((h) => new Date(h.harvestDate).getFullYear() === y);
    const yTx = allTx.filter((t) => new Date(t.transactionDate).getFullYear() === y);
    const totalYield = yHarvests.reduce((s, h) => s + parseFloat(h.yieldTonnes ?? 0), 0);
    const totalArea = yHarvests.reduce((s, h) => s + parseFloat(h.areaHarvestedHa ?? 0), 0);
    const totalIncome = yTx.filter((t) => t.transactionType === "income").reduce((s, t) => s + (t.amountPence ?? 0), 0);
    const totalExpense = yTx.filter((t) => t.transactionType === "expense").reduce((s, t) => s + (t.amountPence ?? 0), 0);
    const netPos = totalIncome - totalExpense;
    return { year: y, totalYield, totalArea, yieldPerHa: totalArea > 0 ? totalYield / totalArea : 0, totalIncome, totalExpense, netPos };
  }), [years, allHarvests, allTx]);
  reactExports.useEffect(() => {
    onRegisterExport(() => {
      const header = ["Metric", ...byYear.map((r) => String(r.year))];
      const dataRows = [
        ["Area Harvested (ha)", ...byYear.map((r) => fmtN(r.totalArea))],
        ["Total Yield (t)", ...byYear.map((r) => fmtN(r.totalYield))],
        ["Average Yield (t/ha)", ...byYear.map((r) => fmtN(r.yieldPerHa, 2))],
        ["Total Income", ...byYear.map((r) => fmt(r.totalIncome))],
        ["Total Expenditure", ...byYear.map((r) => fmt(r.totalExpense))],
        ["Net Position", ...byYear.map((r) => fmt(r.netPos))]
      ];
      const cropHeader = ["Crop", ...byYear.map((r) => String(r.year))];
      const cropRows = [...new Set(allHarvests.map((h) => h.cropName))].map(
        (crop) => [String(crop), ...byYear.map((r) => {
          const t = allHarvests.filter((h) => h.cropName === crop && new Date(h.harvestDate).getFullYear() === r.year).reduce((s, h) => s + parseFloat(h.yieldTonnes ?? 0), 0);
          return t > 0 ? fmtN(t) : "—";
        })]
      );
      downloadCsv("year-on-year.csv", [header, ...dataRows, [], ["CROP MIX BY YEAR (t)"], cropHeader, ...cropRows]);
    });
  }, [data, byYear, allHarvests, onRegisterExport]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Loading…" });
  if (availableYears.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Calendar, message: "Add harvest records and financial transactions across multiple years to see trends." });
  const changeIcon = (curr, prev) => {
    if (!prev) return null;
    return curr >= prev ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 14, style: { color: "#166534", display: "inline", marginLeft: 4 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { size: 14, style: { color: "#dc2626", display: "inline", marginLeft: 4 } });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    availableYears.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", color: "#6b7280", fontWeight: 500 }, children: "Compare seasons (up to 5):" }),
      availableYears.map((y) => {
        const isSelected = selectedYears.length === 0 ? activeYears.includes(y) : selectedYears.includes(y);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => toggleYear(y),
            style: { padding: "0.25rem 0.75rem", borderRadius: 20, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", border: `1px solid ${isSelected ? "#166534" : "#d1d5db"}`, background: isSelected ? "#dcfce7" : "#fff", color: isSelected ? "#166534" : "#6b7280", transition: "all 0.15s" },
            children: y
          },
          y
        );
      }),
      selectedYears.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedYears([]), style: { fontSize: "0.75rem", color: "#9ca3af", background: "none", border: "none", cursor: "pointer", marginLeft: 4 }, children: "Reset" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: "Metric" }),
        byYear.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: r.year }, r.year))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [
        { label: "Area Harvested (ha)", key: "totalArea", fmt: (v) => fmtN(v) },
        { label: "Total Yield (t)", key: "totalYield", fmt: (v) => fmtN(v) },
        { label: "Average Yield (t/ha)", key: "yieldPerHa", fmt: (v) => fmtN(v, 2) },
        { label: "Total Income", key: "totalIncome", fmt: (v) => fmt(v) },
        { label: "Total Expenditure", key: "totalExpense", fmt: (v) => fmt(v) },
        { label: "Net Position", key: "netPos", fmt: (v) => fmt(v) }
      ].map((row, ri) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6", background: ri % 2 === 0 ? "#fff" : "#fafafa" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 500 }, children: row.label }),
        byYear.map((r, yi) => {
          const val = r[row.key];
          const prev = byYear[yi + 1]?.[row.key];
          row.key === "netPos" || row.key === "totalIncome";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.6rem 0.875rem", textAlign: "right", color: row.key === "netPos" ? val >= 0 ? "#166534" : "#dc2626" : "#374151", fontWeight: yi === 0 ? 600 : 400 }, children: [
            row.fmt(val),
            yi === 0 && prev !== void 0 && changeIcon(val, prev)
          ] }, r.year);
        })
      ] }, row.label)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }, children: "Crop Mix by Year" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: "Crop" }),
          byYear.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { style: { padding: "0.6rem 0.875rem", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: [
            r.year,
            " (t)"
          ] }, r.year))
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [...new Set(allHarvests.map((h) => h.cropName))].map((crop, i, arr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 500 }, children: String(crop) }),
          byYear.map((r) => {
            const yTotal = allHarvests.filter((h) => h.cropName === crop && new Date(h.harvestDate).getFullYear() === r.year).reduce((s, h) => s + parseFloat(h.yieldTonnes ?? 0), 0);
            return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", textAlign: "right", color: "#6b7280" }, children: yTotal > 0 ? fmtN(yTotal) : "—" }, r.year);
          })
        ] }, String(crop))) })
      ] }) })
    ] })
  ] });
}
function AssetRegisterTab({ farmId, onRegisterExport }) {
  const { data, isLoading } = useQuery({
    queryKey: ["report-assets", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/assets`).then((r) => r.json()),
    enabled: !!farmId
  });
  const equipment = data?.equipment ?? [];
  const maintenance = data?.maintenanceCosts ?? [];
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const assetRows = reactExports.useMemo(() => equipment.map((e) => {
    const purchaseYear = e.purchaseDate ? new Date(e.purchaseDate).getFullYear() : e.yearOfManufacture ?? null;
    const age = purchaseYear ? currentYear - purchaseYear : null;
    const purchasePrice = e.purchasePricePence ?? null;
    const usefulLife = 10;
    const annualDeprn = purchasePrice ? Math.round(purchasePrice / usefulLife) : null;
    const accumulatedDeprn = age != null && annualDeprn != null ? Math.min(annualDeprn * age, purchasePrice) : null;
    const nbv = e.currentValuePence ?? (purchasePrice != null && accumulatedDeprn != null ? Math.max(0, purchasePrice - accumulatedDeprn) : null);
    const maintCost = maintenance.filter((m) => m.equipmentId === e.id).reduce((s, m) => s + (m.costPence ?? 0), 0);
    return { ...e, age, purchaseYear, annualDeprn, nbv, maintCost };
  }), [equipment, maintenance, currentYear]);
  const totalPurchaseValue = assetRows.filter((r) => r.purchasePricePence).reduce((s, r) => s + r.purchasePricePence, 0);
  const totalNbv = assetRows.filter((r) => r.nbv != null).reduce((s, r) => s + r.nbv, 0);
  const totalMaint = assetRows.reduce((s, r) => s + r.maintCost, 0);
  reactExports.useEffect(() => {
    onRegisterExport(() => {
      const rows = [
        ["Asset", "Type", "Purchase Year", "Age (yrs)", "Purchase Price", "Annual Depreciation", "Net Book Value", "Maintenance Spend", "Status"],
        ...assetRows.map((r) => [
          r.name,
          r.type?.replace(/_/g, " ") || "—",
          r.purchaseYear ?? "—",
          r.age != null ? r.age : "—",
          r.purchasePricePence ? fmt(r.purchasePricePence) : "—",
          r.annualDeprn ? fmt(r.annualDeprn) : "—",
          r.nbv != null ? r.nbv === 0 ? "Fully depreciated" : fmt(r.nbv) : "—",
          r.maintCost > 0 ? fmt(r.maintCost) : "—",
          r.status
        ]),
        [],
        ["TOTALS", "", "", "", fmt(totalPurchaseValue), "", fmt(totalNbv), fmt(totalMaint)]
      ];
      downloadCsv("asset-register.csv", rows);
    });
  }, [data, assetRows, totalPurchaseValue, totalNbv, totalMaint, onRegisterExport]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Loading…" });
  if (equipment.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Tractor, message: "Add equipment records with purchase prices to generate your asset register." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Assets", value: String(equipment.length) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Purchase Value", value: totalPurchaseValue > 0 ? fmt(totalPurchaseValue) : "—", bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Est. Net Book Value", value: totalNbv > 0 ? fmt(totalNbv) : "—", sub: "Straight-line 10yr depreciation" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Maintenance Spend", value: totalMaint > 0 ? fmt(totalMaint) : "—", bg: "#fef3c7", border: "#fde68a", color: "#92400e" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Asset", "Type", "Purchase Year", "Age (yrs)", "Purchase Price", "Annual Depreciation", "Net Book Value", "Maintenance Spend", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.72rem", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: assetRows.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < assetRows.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 600 }, children: r.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280", textTransform: "capitalize" }, children: r.type?.replace(/_/g, " ") || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280" }, children: r.purchaseYear ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280" }, children: r.age != null ? r.age : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem" }, children: r.purchasePricePence ? fmt(r.purchasePricePence) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#dc2626" }, children: r.annualDeprn ? fmt(r.annualDeprn) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 600, color: r.nbv != null && r.nbv <= 0 ? "#9ca3af" : "#166534" }, children: r.nbv != null ? r.nbv === 0 ? "Fully depreciated" : fmt(r.nbv) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#92400e" }, children: r.maintCost > 0 ? fmt(r.maintCost) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 20, textTransform: "capitalize", background: r.status === "active" ? "#dcfce7" : "#f3f4f6", color: r.status === "active" ? "#166534" : "#374151" }, children: r.status }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: "Depreciation calculated on a straight-line basis over 10 years from purchase date. Enter purchase prices on individual equipment records for accurate figures. Net Book Value shows current value estimate; enter a current market value on the equipment record to override." })
  ] });
}
function BusinessReportsPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = reactExports.useState("gross-margin");
  const [year, setYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const [exportFn, setExportFn] = reactExports.useState(null);
  const onRegisterExport = reactExports.useCallback((fn) => {
    setExportFn(() => fn);
  }, []);
  reactExports.useEffect(() => {
    setExportFn(null);
  }, [tab]);
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Business Reports", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "4rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { size: 40, style: { margin: "0 auto 16px", opacity: 0.4 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "Select a farm to view business reports" })
    ] }) });
  }
  const yearTabs = ["gross-margin", "pl", "input-costs", "grain-position", "subsidies"];
  const showYearSelector = yearTabs.includes(tab);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Business Reports", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @media print {
          aside, nav, header, [data-sidebar], .sidebar, [class*="sidebar"] { display: none !important; }
          body { background: white !important; }
          .print-hide { display: none !important; }
        }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.9rem", marginBottom: "1.25rem" }, children: "Financial performance reports, grain position, subsidy income and asset register — all derived from data recorded across your farm modules." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.5rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", flex: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "gross-margin", onClick: () => setTab("gross-margin"), children: "Gross Margin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "pl", onClick: () => setTab("pl"), children: "P&L Statement" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "input-costs", onClick: () => setTab("input-costs"), children: "Input Costs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "grain-position", onClick: () => setTab("grain-position"), children: "Grain Position" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "subsidies", onClick: () => setTab("subsidies"), children: "Subsidies" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "year-on-year", onClick: () => setTab("year-on-year"), children: "Year-on-Year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "assets", onClick: () => setTab("assets"), children: "Asset Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "benchmarking", onClick: () => setTab("benchmarking"), children: "Benchmarking" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "print-hide", style: { display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }, children: [
        showYearSelector && /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(year), onValueChange: (v) => setYear(parseInt(v)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 110 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => window.print(),
            style: { gap: "0.375rem", display: "flex", alignItems: "center" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14 }),
              "Print"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => exportFn?.(),
            disabled: !exportFn,
            style: { gap: "0.375rem", display: "flex", alignItems: "center" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 14 }),
              "Export CSV"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "1.25rem" }, children: [
      tab === "gross-margin" && /* @__PURE__ */ jsxRuntimeExports.jsx(GrossMarginTab, { farmId, year, onRegisterExport }),
      tab === "pl" && /* @__PURE__ */ jsxRuntimeExports.jsx(PLTab, { farmId, year, onRegisterExport }),
      tab === "input-costs" && /* @__PURE__ */ jsxRuntimeExports.jsx(InputCostsTab, { farmId, year, onRegisterExport }),
      tab === "grain-position" && /* @__PURE__ */ jsxRuntimeExports.jsx(GrainPositionTab, { farmId, year, onRegisterExport }),
      tab === "subsidies" && /* @__PURE__ */ jsxRuntimeExports.jsx(SubsidiesTab, { farmId, year, onRegisterExport }),
      tab === "year-on-year" && /* @__PURE__ */ jsxRuntimeExports.jsx(YearOnYearTab, { farmId, onRegisterExport }),
      tab === "assets" && /* @__PURE__ */ jsxRuntimeExports.jsx(AssetRegisterTab, { farmId, onRegisterExport }),
      tab === "benchmarking" && /* @__PURE__ */ jsxRuntimeExports.jsx(BenchmarkingTab, { farmId, year })
    ] })
  ] });
}
const BENCHMARKS = [
  { metric: "Winter Wheat Yield", unit: "t/ha", low: 6, avg: 8.2, top: 11, description: "AHDB national average 2023" },
  { metric: "Winter Barley Yield", unit: "t/ha", low: 5, avg: 6.8, top: 9.5, description: "AHDB national average 2023" },
  { metric: "OSR Yield", unit: "t/ha", low: 2.8, avg: 3.5, top: 5.2, description: "AHDB national average 2023" },
  { metric: "Wheat Variable Costs", unit: "£/ha", low: 850, avg: 680, top: 520, description: "Lower is better — Andersons Benchmarking" },
  { metric: "Wheat Gross Margin", unit: "£/ha", low: 320, avg: 680, top: 1200, description: "AHDB Farmbench top third vs bottom third" },
  { metric: "Nitrogen Use Efficiency", unit: "kg grain/kg N", low: 28, avg: 38, top: 52, description: "Sustainable use target >40 kg grain/kg N" },
  { metric: "Spray Costs", unit: "£/ha", low: 340, avg: 230, top: 155, description: "Lower is better — Nix Farm Management 2023" },
  { metric: "Diesel Consumption", unit: "l/ha", low: 120, avg: 85, top: 55, description: "Lower is better" },
  { metric: "Machinery Depreciation", unit: "£/ha", low: 190, avg: 130, top: 75, description: "Lower is better" },
  { metric: "Labour Cost", unit: "£/ha", low: 210, avg: 145, top: 90, description: "Lower is better" }
];
function BenchmarkingTab({ farmId, year }) {
  const [farmValues, setFarmValues] = reactExports.useState({});
  const fv = (k) => parseFloat(farmValues[k] ?? "") || null;
  const position = (val, b) => {
    if (val === null) return null;
    const lowerIsBetter = ["Variable Costs", "Costs", "Spray", "Diesel", "Machinery", "Labour"].some((k) => b.metric.includes(k));
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
  const posColor = (p) => p === "top" ? "#16a34a" : p === "avg" ? "#d97706" : p === "low" ? "#dc2626" : "#9ca3af";
  const posLabel = (p) => p === "top" ? "Top third" : p === "avg" ? "Middle" : p === "low" ? "Bottom third" : "Enter value";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.5rem 0" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px", marginBottom: 20, fontSize: "0.85rem", color: "#1e40af", alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 15, style: { marginTop: 1, flexShrink: 0 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Industry Benchmarking" }),
        " — Enter your farm figures to compare against AHDB and Andersons national benchmarks for ",
        year,
        ". Data sources: AHDB Farmbench, Nix Farm Management Pocketbook, Andersons Benchmarking."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Metric", "Unit", "Your figure", "Bottom third", "Average", "Top third", "Position"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: BENCHMARKS.map((b, i, arr) => {
        const val = fv(b.metric);
        const pos = position(val, b);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.6rem 1rem", fontWeight: 500 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: b.metric }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: b.description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 1rem", color: "#6b7280", fontSize: "0.8rem" }, children: b.unit }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.4rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", step: "any", style: { width: 80, border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: "0.85rem" }, value: farmValues[b.metric] ?? "", onChange: (e) => setFarmValues((p) => ({ ...p, [b.metric]: e.target.value })), placeholder: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 1rem", fontSize: "0.8rem", color: "#dc2626" }, children: b.low }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 1rem", fontSize: "0.8rem", color: "#d97706" }, children: b.avg }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 1rem", fontSize: "0.8rem", color: "#16a34a" }, children: b.top }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 1rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", fontWeight: 600, color: posColor(pos), background: posColor(pos) + "1a", borderRadius: 999, padding: "2px 10px", display: "inline-block" }, children: posLabel(pos) }) })
        ] }, b.metric);
      }) })
    ] }) })
  ] });
}
export {
  BusinessReportsPage as default
};
