import { b as useAppStore, c as useQueryClient, r as reactExports, j as jsxRuntimeExports, d as Button, m as useQuery, S as useMutation } from "./index-wemPfpPl.js";
import { u as usePersistedTab } from "./use-persisted-tab-fQM1Fshb.js";
import { u as usePersistedNumberFilter } from "./use-persisted-filter-CbXrTJNk.js";
import { s as sanitiseCsvCell } from "./csv-DqFyucvM.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { A as AppLayout, e as ChartColumn, T as TrendingUp } from "./AppLayout-AXmKydl8.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CTXoQF7V.js";
import { T as TabBar, a as TabButton } from "./tab-button-BZkJxXGd.js";
import { P as Printer } from "./printer-B6s1K_bm.js";
import { D as Download } from "./download-DlEJTRl7.js";
import { P as PoundSterling } from "./shield-alert-v5Hmk-P0.js";
import { P as Package } from "./use-safe-clerk-B0Pu-4CF.js";
import { L as Leaf } from "./triangle-alert-Cud9xgqQ.js";
import { C as Calendar } from "./calendar-BorXt0Yn.js";
import { T as Tractor } from "./tractor-DUyEXa4Y.js";
import { T as TrendingDown } from "./trending-down-C5NUxu1_.js";
import "./trash-2-B0iEP7TA.js";
import "./database-cyFXXRKA.js";
import "./shield-check-BwCbdWBg.js";
import "./index-DOjzO7K0.js";
import "./index-C5TnK4L6.js";
import "./chevron-up-D9CkaeOU.js";
const AGRI_ENV_CATS = [
  "Agri-Environment Scheme",
  "Vineyard Agri-Environment Scheme"
];
function agriEnvDoubleCountRisk(costs, agriEnvYearTotal) {
  const agriEnvSchemeTxs = costs.filter(
    (t) => AGRI_ENV_CATS.includes(t.category) && t.transactionType === "income"
  );
  const unlinkedTotal = agriEnvSchemeTxs.filter((t) => !t.agriEnvProjectId).reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const hasDoubleCountRisk = agriEnvYearTotal > 0 && unlinkedTotal > 0;
  return { agriEnvSchemeTxs, unlinkedTotal, hasDoubleCountRisk };
}
function calcGrossMarginTxIncomeTotal(costs) {
  return costs.filter(
    (t) => t.transactionType === "income" && !(AGRI_ENV_CATS.includes(t.category) && t.agriEnvProjectId)
  ).reduce((s, t) => s + (t.amountPence ?? 0), 0);
}
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
  "Vineyard Agri-Environment Scheme",
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
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["report-gross-margin", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/gross-margin?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const [linkingTx, setLinkingTx] = reactExports.useState(null);
  const [selectedProjectId, setSelectedProjectId] = reactExports.useState("");
  const harvests = data?.harvests ?? [];
  const costs = data?.costs ?? [];
  const agriEnvSummary = data?.agriEnvSummary ?? [];
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
  const agriEnvYearTotal = agriEnvSummary.reduce((s, p) => s + (p.yearClaimedPence ?? 0), 0);
  const agriEnvActiveProjects = agriEnvSummary.filter((p) => (p.yearClaimedPence ?? 0) > 0);
  const { agriEnvSchemeTxs, hasDoubleCountRisk } = agriEnvDoubleCountRisk(costs, agriEnvYearTotal);
  const txIncomeTotal = calcGrossMarginTxIncomeTotal(costs);
  const varCostTotal = costs.filter((t) => t.transactionType === "expense" && VARIABLE_COST_CATS.includes(t.category ?? "")).reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const incomeTotal = txIncomeTotal + agriEnvYearTotal;
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
  const linkMutation = useMutation({
    mutationFn: async ({ txId, projectId }) => {
      const res = await fetch(`/api/farms/${farmId}/financial-transactions/${txId}/link-agri-env`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agriEnvProjectId: projectId })
      });
      if (!res.ok) throw new Error("Failed to update link");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-gross-margin", farmId, year] });
      setLinkingTx(null);
      setSelectedProjectId("");
    }
  });
  const projectName = (id) => agriEnvSummary.find((p) => p.id === id)?.schemeName ?? `Project #${id}`;
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
      rows.push(["Financial income (excl. linked agri-env transactions)", fmt(txIncomeTotal)]);
      if (agriEnvYearTotal > 0) {
        rows.push([`Agri-env schemes (from Agri-Env tab, ${agriEnvActiveProjects.length} project${agriEnvActiveProjects.length !== 1 ? "s" : ""})`, fmt(agriEnvYearTotal), hasDoubleCountRisk ? "WARNING: unlinked agri-env financial transaction also present — possible double-count" : ""]);
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
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Loading…" });
  if (harvests.length === 0 && costs.length === 0 && agriEnvYearTotal === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: TrendingUp, message: "Add harvest records, financial transactions, or agri-env milestone claims to generate this report." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    linkingTx && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }, onClick: () => {
      setLinkingTx(null);
      setSelectedProjectId("");
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", borderRadius: 12, padding: "1.5rem", width: 420, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }, onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "1rem", marginBottom: 4, color: "#111827" }, children: "Link transaction to agri-env project" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginBottom: 16 }, children: [
        "Linking tells the system this transaction ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "is" }),
        ' the milestone payment — it will be shown as "via milestone record" and excluded from the double-count warning.'
      ] }),
      linkingTx.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#374151", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.5rem 0.75rem", marginBottom: 14, fontStyle: "italic" }, children: [
        '"',
        linkingTx.description,
        '"'
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6 }, children: "Agri-env project" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: selectedProjectId,
          onChange: (e) => setSelectedProjectId(e.target.value),
          style: { width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.875rem", color: "#111827", background: "#fff", marginBottom: 20 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— select a project —" }),
            agriEnvSummary.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: String(p.id), children: p.schemeName }, p.id))
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setLinkingTx(null);
              setSelectedProjectId("");
            },
            style: { padding: "0.45rem 1rem", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: "0.875rem", cursor: "pointer", color: "#374151" },
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            disabled: !selectedProjectId || linkMutation.isPending,
            onClick: () => {
              if (selectedProjectId) linkMutation.mutate({ txId: linkingTx.id, projectId: parseInt(selectedProjectId) });
            },
            style: { padding: "0.45rem 1rem", border: "none", borderRadius: 6, background: selectedProjectId ? "#166534" : "#9ca3af", color: "#fff", fontSize: "0.875rem", cursor: selectedProjectId ? "pointer" : "not-allowed", fontWeight: 600 },
            children: linkMutation.isPending ? "Saving…" : "Link transaction"
          }
        )
      ] }),
      linkMutation.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#dc2626", marginTop: 8 }, children: "Failed to link — please try again." })
    ] }) }),
    hasDoubleCountRisk && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.75rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "1.1rem", lineHeight: 1.3 }, children: "⚠️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#92400e", fontSize: "0.875rem", marginBottom: 2 }, children: "Possible double-count detected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: "#78350f", fontSize: "0.8rem" }, children: [
          "You have both an ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Agri-Environment Scheme" }),
          " financial transaction and agri-env milestone claims in ",
          year,
          ". Use the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Link to project" }),
          " action on the transaction row below to confirm this transaction is the milestone payment — it will be excluded from double-counting. Or remove either the financial transaction or the agri-env milestone claims."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Area Harvested", value: `${fmtN(totalArea)} ha` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Yield", value: `${fmtN(totalYield)} t`, sub: totalArea > 0 ? `${fmtN(totalYield / totalArea)} t/ha avg` : void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Farm Output", value: fmt(incomeTotal), bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af", sub: agriEnvYearTotal > 0 ? `Incl. ${fmt(agriEnvYearTotal)} agri-env schemes (from Agri-Env tab)` : void 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Gross Margin", value: fmt(grossMargin), bg: grossMargin >= 0 ? "#f0fdf4" : "#fef2f2", border: grossMargin >= 0 ? "#bbf7d0" : "#fecaca", color: grossMargin >= 0 ? "#166534" : "#991b1b" })
    ] }),
    agriEnvSchemeTxs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }, children: "Agri-Environment Scheme Transactions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Transaction", "Amount"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: h === "Amount" ? "right" : "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: agriEnvSchemeTxs.map((tx, i, arr) => {
          const isLinked = !!tx.agriEnvProjectId;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none", background: isLinked ? "#fafafa" : void 0 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem 0.875rem", color: isLinked ? "#9ca3af" : "#374151" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { textDecoration: isLinked ? "line-through" : void 0 }, children: tx.description || "Agri-Environment Scheme" }),
              isLinked ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 8, fontSize: "0.7rem", background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 4, padding: "1px 6px", verticalAlign: "middle" }, children: [
                "via milestone record · ",
                projectName(tx.agriEnvProjectId)
              ] }) : hasDoubleCountRisk ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    setLinkingTx({ id: tx.id, description: tx.description });
                    setSelectedProjectId("");
                  },
                  style: { marginLeft: 10, fontSize: "0.72rem", background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d", borderRadius: 4, padding: "1px 7px", cursor: "pointer", verticalAlign: "middle", fontWeight: 600 },
                  children: "Link to project"
                }
              ) : null,
              isLinked && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => linkMutation.mutate({ txId: tx.id, projectId: null }),
                  style: { marginLeft: 8, fontSize: "0.72rem", background: "transparent", color: "#9ca3af", border: "none", cursor: "pointer", padding: "1px 4px", verticalAlign: "middle" },
                  title: "Remove link",
                  children: "×"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem", color: isLinked ? "#9ca3af" : "#374151", textAlign: "right" }, children: fmt(tx.amountPence) })
          ] }, tx.id);
        }) })
      ] }) })
    ] }),
    agriEnvActiveProjects.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }, children: "Agri-Environment Scheme Breakdown" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: "Project" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("th", { style: { padding: "0.6rem 0.875rem", textAlign: "right", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: [
            "Claimed in ",
            year
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          agriEnvActiveProjects.map((p, i, arr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem 0.875rem", paddingLeft: "1.75rem", color: "#374151" }, children: [
              "↳ ",
              p.schemeName
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem", color: "#374151", textAlign: "right" }, children: fmt(p.yearClaimedPence) })
          ] }, p.id)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: "2px solid #d1fae5", background: "#f0fdf4" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 700 }, children: "Total agri-env schemes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 700, color: "#166534", textAlign: "right" }, children: fmt(agriEnvYearTotal) })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 6 }, children: [
        "* Drawn from milestone claims in the Agri-Env tab. Amounts reflect milestones completed in ",
        year,
        " only."
      ] })
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
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["report-gross-margin", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/gross-margin?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const [linkingTx, setLinkingTx] = reactExports.useState(null);
  const [selectedProjectId, setSelectedProjectId] = reactExports.useState("");
  const costs = data?.costs ?? [];
  const agriEnvSummary = data?.agriEnvSummary ?? [];
  const sumCat = (cat) => costs.filter((t) => t.category === cat).reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const agriEnvYearTotal = agriEnvSummary.reduce((s, p) => s + (p.yearClaimedPence ?? 0), 0);
  const agriEnvActiveProjects = agriEnvSummary.filter((p) => (p.yearClaimedPence ?? 0) > 0);
  const agriEnvUnclaimedProjects = agriEnvSummary.filter((p) => (p.yearClaimedPence ?? 0) === 0);
  const { agriEnvSchemeTxs, hasDoubleCountRisk } = agriEnvDoubleCountRisk(costs, agriEnvYearTotal);
  const linkedAgriEnvCatTotal = (cat) => agriEnvSchemeTxs.filter((t) => t.category === cat && !t.agriEnvProjectId).reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const incomeValues = INCOME_CATS.reduce((m, c) => {
    m[c] = AGRI_ENV_CATS.includes(c) ? linkedAgriEnvCatTotal(c) : sumCat(c);
    return m;
  }, {});
  const txIncomeTotal = Object.values(incomeValues).reduce((s, v) => s + v, 0);
  const totalOutput = txIncomeTotal + agriEnvYearTotal;
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
  const linkMutation = useMutation({
    mutationFn: async ({ txId, projectId }) => {
      const res = await fetch(`/api/farms/${farmId}/financial-transactions/${txId}/link-agri-env`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agriEnvProjectId: projectId })
      });
      if (!res.ok) throw new Error("Failed to update link");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-gross-margin", farmId, year] });
      setLinkingTx(null);
      setSelectedProjectId("");
    }
  });
  reactExports.useEffect(() => {
    onRegisterExport(() => {
      const rows = [
        ["Line Item", "Claimed this year", "Total grant value", "All-time claimed", "Remaining grant value", "Note"],
        ["INCOME", "", "", "", "", ""],
        ...INCOME_CATS.filter((c) => incomeValues[c] > 0).map((c) => [c, fmt(incomeValues[c]), "", "", "", ""]),
        ...agriEnvYearTotal > 0 ? [
          ["Agri-environment schemes (milestone claims)", fmt(agriEnvYearTotal), "", "", "", `${agriEnvActiveProjects.length} project(s) with claims in ${year}${hasDoubleCountRisk ? " — WARNING: also recorded as financial transaction" : ""}`],
          ...agriEnvActiveProjects.map((p) => {
            const remaining = p.totalGrantValuePence != null ? (p.totalGrantValuePence ?? 0) - (p.allTimeClaimedPence ?? 0) : null;
            return [
              `  ↳ ${p.schemeName}`,
              fmt(p.yearClaimedPence),
              p.totalGrantValuePence != null ? fmt(p.totalGrantValuePence) : "—",
              p.allTimeClaimedPence != null ? fmt(p.allTimeClaimedPence) : "—",
              remaining != null ? fmt(remaining) : "—",
              ""
            ];
          })
        ] : [],
        ["Total Farm Output", fmt(totalOutput), "", "", "", ""],
        [],
        ["VARIABLE COSTS", "", "", "", "", ""],
        ...VARIABLE_COST_CATS.filter((c) => varCosts[c] > 0).map((c) => [c, fmt(varCosts[c]), "", "", "", ""]),
        ["Total Variable Costs", `(${fmt(totalVarCosts)})`, "", "", "", ""],
        ["Gross Margin", fmt(grossMargin), "", "", "", ""],
        [],
        ["FIXED COSTS / OVERHEADS", "", "", "", "", ""],
        ...FIXED_COST_CATS.filter((c) => fixedCosts[c] > 0).map((c) => [c, fmt(fixedCosts[c]), "", "", "", ""]),
        ["Total Fixed Costs", `(${fmt(totalFixed)})`, "", "", "", ""],
        ["Net Farm Income", fmt(netFarmIncome), "", "", "", ""]
      ];
      downloadCsv(`pl-statement-${year}.csv`, rows);
    });
  }, [data, agriEnvSummary, agriEnvYearTotal, agriEnvActiveProjects, hasDoubleCountRisk, totalOutput, txIncomeTotal, totalVarCosts, grossMargin, totalFixed, netFarmIncome, year, onRegisterExport]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Loading…" });
  if (costs.length === 0 && agriEnvSummary.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: PoundSterling, message: "Add financial transactions to generate the income statement." });
  const projectName = (id) => agriEnvSummary.find((p) => p.id === id)?.schemeName ?? `Project #${id}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    linkingTx && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }, onClick: () => {
      setLinkingTx(null);
      setSelectedProjectId("");
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", borderRadius: 12, padding: "1.5rem", width: 420, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }, onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "1rem", marginBottom: 4, color: "#111827" }, children: "Link transaction to agri-env project" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginBottom: 16 }, children: [
        "Linking tells the system this transaction ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "is" }),
        ' the milestone payment — it will be shown as "via milestone record" and excluded from the double-count warning.'
      ] }),
      linkingTx.description && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#374151", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.5rem 0.75rem", marginBottom: 14, fontStyle: "italic" }, children: [
        '"',
        linkingTx.description,
        '"'
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { style: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6 }, children: "Agri-env project" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: selectedProjectId,
          onChange: (e) => setSelectedProjectId(e.target.value),
          style: { width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "0.5rem 0.75rem", fontSize: "0.875rem", color: "#111827", background: "#fff", marginBottom: 20 },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— select a project —" }),
            agriEnvSummary.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: String(p.id), children: p.schemeName }, p.id))
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, justifyContent: "flex-end" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setLinkingTx(null);
              setSelectedProjectId("");
            },
            style: { padding: "0.45rem 1rem", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: "0.875rem", cursor: "pointer", color: "#374151" },
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            disabled: !selectedProjectId || linkMutation.isPending,
            onClick: () => {
              if (selectedProjectId) linkMutation.mutate({ txId: linkingTx.id, projectId: parseInt(selectedProjectId) });
            },
            style: { padding: "0.45rem 1rem", border: "none", borderRadius: 6, background: selectedProjectId ? "#166534" : "#9ca3af", color: "#fff", fontSize: "0.875rem", cursor: selectedProjectId ? "pointer" : "not-allowed", fontWeight: 600 },
            children: linkMutation.isPending ? "Saving…" : "Link transaction"
          }
        )
      ] }),
      linkMutation.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#dc2626", marginTop: 8 }, children: "Failed to link — please try again." })
    ] }) }),
    hasDoubleCountRisk && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "1.1rem", lineHeight: 1.3 }, children: "⚠️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#92400e", fontSize: "0.875rem", marginBottom: 2 }, children: "Possible double-count detected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: "#78350f", fontSize: "0.8rem" }, children: [
          "You have both an ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Agri-Environment Scheme" }),
          " financial transaction and agri-env milestone claims in ",
          year,
          ". Use the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Link to project" }),
          " action on the transaction row below to confirm this transaction is the milestone payment — it will be excluded from double-counting. Or remove either the financial transaction or the agri-env milestone claims."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Farm Output", value: fmt(totalOutput), bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Gross Margin", value: fmt(grossMargin), bg: grossMargin >= 0 ? "#f0fdf4" : "#fef2f2", border: grossMargin >= 0 ? "#bbf7d0" : "#fecaca", color: grossMargin >= 0 ? "#166534" : "#991b1b" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Net Farm Income", value: fmt(netFarmIncome), bg: netFarmIncome >= 0 ? "#f0fdf4" : "#fef2f2", border: netFarmIncome >= 0 ? "#bbf7d0" : "#fecaca", color: netFarmIncome >= 0 ? "#166534" : "#991b1b", sub: "After fixed costs" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionDivider, { label: "Income" }),
      INCOME_CATS.filter((c) => incomeValues[c] > 0).map((c) => {
        if (c === "Agri-Environment Scheme") {
          return agriEnvSchemeTxs.map((tx) => {
            const isLinked = !!tx.agriEnvProjectId;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: isLinked ? "#fafafa" : void 0 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem 0.875rem", paddingLeft: "1.75rem", color: isLinked ? "#9ca3af" : "#374151" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { textDecoration: isLinked ? "line-through" : void 0 }, children: tx.description || c }),
                isLinked ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 8, fontSize: "0.7rem", background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: 4, padding: "1px 6px", verticalAlign: "middle" }, children: [
                  "via milestone record · ",
                  projectName(tx.agriEnvProjectId)
                ] }) : hasDoubleCountRisk ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => {
                      setLinkingTx({ id: tx.id, description: tx.description });
                      setSelectedProjectId("");
                    },
                    style: { marginLeft: 10, fontSize: "0.72rem", background: "#fffbeb", color: "#92400e", border: "1px solid #fcd34d", borderRadius: 4, padding: "1px 7px", cursor: "pointer", verticalAlign: "middle", fontWeight: 600 },
                    children: "Link to project"
                  }
                ) : null,
                isLinked && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => linkMutation.mutate({ txId: tx.id, projectId: null }),
                    style: { marginLeft: 8, fontSize: "0.72rem", background: "transparent", color: "#9ca3af", border: "none", cursor: "pointer", padding: "1px 4px", verticalAlign: "middle" },
                    title: "Remove link",
                    children: "×"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem", color: isLinked ? "#9ca3af" : "#374151", textAlign: "right" }, children: fmt(tx.amountPence) })
            ] }, tx.id);
          });
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx(DataRow, { label: c, value: fmt(incomeValues[c]), indent: true }, c);
      }),
      agriEnvYearTotal > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f0fdf4" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem 0.875rem", paddingLeft: "1.75rem", color: "#166534" }, children: [
            "Agri-environment schemes (milestone claims)",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 8, fontSize: "0.7rem", background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0", borderRadius: 4, padding: "1px 6px", verticalAlign: "middle" }, children: [
              "from Agri-Env tab · ",
              agriEnvActiveProjects.length,
              " project",
              agriEnvActiveProjects.length !== 1 ? "s" : ""
            ] }),
            agriEnvActiveProjects.length === 1 && (() => {
              const p = agriEnvActiveProjects[0];
              if (p.totalGrantValuePence == null || p.totalGrantValuePence <= 0) return null;
              const remaining = p.totalGrantValuePence - (p.allTimeClaimedPence ?? 0);
              return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 8, fontSize: "0.7rem", background: remaining > 0 ? "#fffbeb" : "#f0fdf4", color: remaining > 0 ? "#92400e" : "#166534", border: `1px solid ${remaining > 0 ? "#fcd34d" : "#bbf7d0"}`, borderRadius: 4, padding: "1px 6px", verticalAlign: "middle" }, children: remaining > 0 ? `${fmt(remaining)} remaining` : "fully claimed" });
            })()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.875rem", color: "#166534", textAlign: "right", fontWeight: 500 }, children: fmt(agriEnvYearTotal) })
        ] }),
        agriEnvActiveProjects.length > 1 && agriEnvActiveProjects.map((p) => {
          const remaining = p.totalGrantValuePence != null && p.totalGrantValuePence > 0 ? p.totalGrantValuePence - (p.allTimeClaimedPence ?? 0) : null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f7fef9" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.35rem 0.875rem", paddingLeft: "3rem", color: "#15803d", fontSize: "0.82rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginRight: 6, opacity: 0.5 }, children: "↳" }),
              p.schemeName,
              remaining !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 8, fontSize: "0.68rem", background: remaining > 0 ? "#fffbeb" : "#f0fdf4", color: remaining > 0 ? "#92400e" : "#166534", border: `1px solid ${remaining > 0 ? "#fcd34d" : "#bbf7d0"}`, borderRadius: 4, padding: "1px 5px", verticalAlign: "middle" }, children: remaining > 0 ? `${fmt(remaining)} remaining` : "fully claimed" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.35rem 0.875rem", color: "#15803d", textAlign: "right", fontSize: "0.82rem" }, children: fmt(p.yearClaimedPence) })
          ] }, p.id);
        })
      ] }),
      agriEnvUnclaimedProjects.length > 0 && agriEnvYearTotal === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#fafafa" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 2, style: { padding: "0.45rem 0.875rem", paddingLeft: "1.75rem", color: "#6b7280", fontSize: "0.78rem", fontStyle: "italic" }, children: [
        agriEnvUnclaimedProjects.length,
        " agri-env project",
        agriEnvUnclaimedProjects.length !== 1 ? "s" : "",
        " active — no completed milestone claims recorded for ",
        year
      ] }) }),
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
      " financial transaction",
      costs.length !== 1 ? "s" : "",
      agriEnvYearTotal > 0 ? ` and completed milestone claims from ${agriEnvActiveProjects.length} agri-env project${agriEnvActiveProjects.length !== 1 ? "s" : ""} (from the Agri-Env tab, claims dated in ${year} only)` : agriEnvSummary.length > 0 ? ` — ${agriEnvSummary.length} agri-env project${agriEnvSummary.length !== 1 ? "s" : ""} active but no completed milestone claims in ${year}` : "",
      " recorded for ",
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
const MILESTONE_STATUSES = ["pending", "completed", "submitted", "paid", "overdue"];
function SubsidiesTab({ farmId, year, onRegisterExport }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["report-subsidies", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/subsidies?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const schemes = data?.schemes ?? [];
  const subsidyTx = (data?.subsidyTransactions ?? []).filter((t) => ["Agri-Environment Scheme", "Grant / Subsidy"].includes(t.category ?? ""));
  const agriEnvProjects = data?.agriEnvProjects ?? [];
  const agriEnvMilestones = data?.agriEnvMilestones ?? [];
  const [expandedProjects, setExpandedProjects] = reactExports.useState(/* @__PURE__ */ new Set());
  const [updatingMilestone, setUpdatingMilestone] = reactExports.useState(null);
  const [milestoneError, setMilestoneError] = reactExports.useState(null);
  const todayIso = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const [pendingCompletion, setPendingCompletion] = reactExports.useState(null);
  const [pendingPnlWarning, setPendingPnlWarning] = reactExports.useState(null);
  const dateIsInYear = (dateStr) => new Date(dateStr).getFullYear() === year;
  const updateMilestoneStatus = useMutation({
    mutationFn: async ({ milestoneId, projectId, status, completionDate }) => {
      const body = { status };
      if (completionDate !== void 0) body.completionDate = completionDate ?? null;
      const res = await fetch(apiUrl(`farms/${farmId}/agri-env-projects/${projectId}/milestones/${milestoneId}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
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
    onSettled: () => setUpdatingMilestone(null)
  });
  const milestonesByProject = reactExports.useMemo(() => {
    const m = {};
    for (const ms of agriEnvMilestones) {
      if (!m[ms.projectId]) m[ms.projectId] = [];
      m[ms.projectId].push(ms);
    }
    return m;
  }, [agriEnvMilestones]);
  const toggleProject = (id) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const activeSchemes = schemes.filter((s) => s.status === "active");
  const totalAnnualSchemes = activeSchemes.reduce((s, sc) => s + (sc.annualPaymentPence ?? 0), 0);
  const totalSubsidyReceived = subsidyTx.reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const agriEnvYearClaimed = agriEnvMilestones.filter((m) => (m.status === "submitted" || m.status === "paid") && m.completionDate && dateIsInYear(m.completionDate)).reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
  const { hasDoubleCountRisk } = agriEnvDoubleCountRisk(data?.subsidyTransactions ?? [], agriEnvYearClaimed);
  const totalAgriEnvGrantValue = agriEnvProjects.reduce((s, p) => s + (p.totalGrantValuePence ?? 0), 0);
  const totalMilestonesDrawnDown = agriEnvMilestones.filter((m) => m.status === "submitted" || m.status === "paid").reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
  const totalMilestonesOutstanding = agriEnvMilestones.filter((m) => m.status !== "submitted" && m.status !== "paid" && m.claimAmountPence != null).reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
  const msStatusStyle = (status) => {
    if (status === "paid" || status === "completed") return { background: "#dcfce7", color: "#166534" };
    if (status === "submitted") return { background: "#dbeafe", color: "#1e40af" };
    if (status === "overdue") return { background: "#fee2e2", color: "#991b1b" };
    return { background: "#f3f4f6", color: "#374151" };
  };
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
        ["AGRI-ENVIRONMENT SCHEMES", "", "", "", "", "", "", ""],
        ["Scheme", "Agreement Ref.", "Start Date", "End Date", "Total Grant Value", "Status", "", ""]
      ];
      for (const p of agriEnvProjects) {
        rows.push([
          p.schemeName,
          p.agreementReference || "—",
          p.startDate ? new Date(p.startDate).toLocaleDateString("en-GB") : "—",
          p.endDate ? new Date(p.endDate).toLocaleDateString("en-GB") : "Ongoing",
          p.totalGrantValuePence != null ? fmt(p.totalGrantValuePence) : "—",
          p.status,
          "",
          ""
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
              "",
              ""
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
          fmt(t.amountPence)
        ]);
      }
      rows.push([]);
      rows.push(["Annual Scheme Value", fmt(totalAnnualSchemes)]);
      rows.push(["Agri-environment schemes total", fmt(totalAgriEnvGrantValue)]);
      rows.push(["Total Received", fmt(totalSubsidyReceived)]);
      downloadCsv(`subsidies-${year}.csv`, rows);
    });
  }, [data, schemes, agriEnvProjects, agriEnvMilestones, milestonesByProject, subsidyTx, totalAnnualSchemes, totalAgriEnvGrantValue, totalMilestonesDrawnDown, totalSubsidyReceived, year, onRegisterExport]);
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Loading…" });
  if (schemes.length === 0 && subsidyTx.length === 0 && agriEnvProjects.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Leaf, message: "Add agri-environment scheme agreements and subsidy transactions to see this report." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    hasDoubleCountRisk && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.75rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "1.1rem", lineHeight: 1.3 }, children: "⚠️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#92400e", fontSize: "0.875rem", marginBottom: 2 }, children: "Possible double-count detected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: "#78350f", fontSize: "0.8rem" }, children: [
          "You have both an ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Agri-Environment Scheme" }),
          " financial transaction and agri-env milestone claims in ",
          year,
          ". The same payment may be recorded twice. Go to the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Gross Margin" }),
          " tab and use ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Link to project" }),
          " on the transaction to confirm it is the milestone payment, or remove either the financial transaction or the milestone claim."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active Schemes", value: String(activeSchemes.length) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Annual Scheme Value", value: fmt(totalAnnualSchemes), sub: "Expected annual total" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Agri-env Scheme Value", value: fmt(totalAgriEnvGrantValue), sub: "Active & completed agreements", bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Subsidy Received", value: fmt(totalSubsidyReceived), sub: `Recorded in ${year}`, bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" })
    ] }),
    agriEnvMilestones.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Milestones Submitted / Paid", value: fmt(totalMilestonesDrawnDown), sub: "Sum of submitted & paid milestones", bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Milestones Outstanding", value: fmt(totalMilestonesOutstanding), sub: "Pending milestone claim amounts", bg: "#fefce8", border: "#fde68a", color: "#92400e" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Milestones", value: String(agriEnvMilestones.length), sub: "Across all agri-env projects", bg: "#fafafa", border: "#e5e7eb", color: "#374151" })
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
    agriEnvProjects.length > 0 && totalAgriEnvGrantValue > 0 && (() => {
      const drawdownPct = Math.min(100, totalMilestonesDrawnDown / totalAgriEnvGrantValue * 100);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10, fontWeight: 600 }, children: "Farm-wide Drawdown Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 2 }, children: "Total Grant Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.2rem", fontWeight: 700, color: "#166534" }, children: fmt(totalAgriEnvGrantValue) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#9ca3af" }, children: [
              agriEnvProjects.filter((p) => p.totalGrantValuePence > 0).length,
              " project",
              agriEnvProjects.filter((p) => p.totalGrantValuePence > 0).length !== 1 ? "s" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 2 }, children: "Total Claimed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.2rem", fontWeight: 700, color: "#166534" }, children: fmt(totalMilestonesDrawnDown) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af" }, children: "Submitted & paid milestones" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 2 }, children: "Overall Drawdown" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.2rem", fontWeight: 700, color: drawdownPct >= 75 ? "#166534" : drawdownPct >= 40 ? "#92400e" : "#374151" }, children: [
              drawdownPct.toFixed(1),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#9ca3af" }, children: [
              fmt(totalAgriEnvGrantValue - totalMilestonesDrawnDown),
              " remaining"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#dcfce7", borderRadius: 6, height: 10, width: "100%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#166534", borderRadius: 6, height: 10, width: `${drawdownPct}%`, transition: "width 0.3s ease", opacity: 0.9 } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginTop: 4 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", color: "#6b7280" }, children: "£0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.68rem", color: "#6b7280" }, children: fmt(totalAgriEnvGrantValue) })
        ] })
      ] });
    })(),
    agriEnvProjects.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "0.875rem", marginBottom: 8, color: "#374151" }, children: "Agri-environment Schemes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["", "Scheme", "Agreement Ref.", "Start", "End", "Total Grant Value", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          agriEnvProjects.map((p, i) => {
            const pMilestones = milestonesByProject[p.id] ?? [];
            const isExpanded = expandedProjects.has(p.id);
            const claimedTotal = pMilestones.filter((m) => m.status === "submitted" || m.status === "paid").reduce((s, m) => s + (m.claimAmountPence ?? 0), 0);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "tr",
                {
                  style: { borderBottom: isExpanded ? "none" : i < agriEnvProjects.length - 1 ? "1px solid #f3f4f6" : "none", cursor: pMilestones.length > 0 ? "pointer" : void 0, background: isExpanded ? "#f9fafb" : void 0 },
                  onClick: () => pMilestones.length > 0 && toggleProject(p.id),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.5rem 0.6rem 0.875rem", width: 24, color: "#9ca3af", fontSize: "0.75rem", userSelect: "none" }, children: pMilestones.length > 0 ? isExpanded ? "▾" : "▸" : "" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 500 }, children: [
                      p.schemeName,
                      pMilestones.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: 6, fontSize: "0.7rem", color: "#6b7280", fontWeight: 400 }, children: [
                        pMilestones.length,
                        " milestone",
                        pMilestones.length !== 1 ? "s" : "",
                        claimedTotal > 0 && ` · ${fmt(claimedTotal)} submitted/paid`
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.8rem" }, children: p.agreementReference || "—" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: p.startDate ? new Date(p.startDate).toLocaleDateString("en-GB") : "—" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: p.endDate ? new Date(p.endDate).toLocaleDateString("en-GB") : "Ongoing" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 500 }, children: [
                      p.totalGrantValuePence != null ? fmt(p.totalGrantValuePence) : "—",
                      p.totalGrantValuePence > 0 && (() => {
                        const pct = Math.min(100, claimedTotal / p.totalGrantValuePence * 100);
                        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 4 }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#e5e7eb", borderRadius: 4, height: 6, width: "100%", minWidth: 80 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#166534", borderRadius: 4, height: 6, width: `${pct}%`, opacity: 0.85 } }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.68rem", color: "#6b7280", marginTop: 2, whiteSpace: "nowrap" }, children: [
                            fmt(claimedTotal),
                            " claimed · ",
                            pct.toFixed(0),
                            "%"
                          ] })
                        ] });
                      })()
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: 20, textTransform: "capitalize", background: p.status === "active" ? "#dcfce7" : p.status === "completed" ? "#eff6ff" : "#f3f4f6", color: p.status === "active" ? "#166534" : p.status === "completed" ? "#1e40af" : "#374151" }, children: p.status }) })
                  ]
                },
                p.id
              ),
              isExpanded && pMilestones.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", {}),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 6, style: { padding: 0 }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "1px solid #e5e7eb" }, children: ["Milestone", "Due Date", "Completion Date", "Claim Amount", "Status"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.4rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.72rem" }, children: h }, h)) }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: pMilestones.map((ms, mi) => {
                        const isUpdating = updatingMilestone === ms.id;
                        const isPending = pendingCompletion?.milestoneId === ms.id;
                        const isPendingWarning = pendingPnlWarning?.milestoneId === ms.id;
                        const needsDate = (s) => (s === "completed" || s === "submitted" || s === "paid") && !ms.completionDate;
                        const projectOverlapsYear = p.status !== "withdrawn" && (!p.startDate || p.startDate <= `${year}-12-31`) && (!p.endDate || p.endDate >= `${year}-01-01`);
                        const msIsIncluded = (status, completionDate) => (status === "submitted" || status === "paid") && !!completionDate && dateIsInYear(completionDate) && projectOverlapsYear;
                        const pnlChanges = (newStatus, completionDate) => ms.claimAmountPence != null && msIsIncluded(ms.status ?? "pending", ms.completionDate) !== msIsIncluded(newStatus, completionDate);
                        const pnlChangeDir = (newStatus, completionDate) => msIsIncluded(newStatus, completionDate) ? "add" : "remove";
                        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: mi < pMilestones.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.45rem 0.875rem", paddingLeft: "1.25rem", color: "#374151" }, children: ms.milestoneName }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.45rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: ms.dueDate ? new Date(ms.dueDate).toLocaleDateString("en-GB") : "—" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.45rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "date",
                              value: pendingCompletion.date,
                              max: todayIso,
                              onChange: (e) => setPendingCompletion((prev) => prev ? { ...prev, date: e.target.value } : prev),
                              style: { fontSize: "0.75rem", padding: "2px 4px", border: "1px solid #93c5fd", borderRadius: 4, background: "#eff6ff", color: "#1e40af", width: 120 }
                            }
                          ) : ms.completionDate ? new Date(ms.completionDate).toLocaleDateString("en-GB") : "—" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.45rem 0.875rem", fontWeight: ms.claimAmountPence != null ? 600 : void 0, color: ms.claimAmountPence != null ? "#166534" : "#9ca3af" }, children: ms.claimAmountPence != null ? fmt(ms.claimAmountPence) : "—" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.45rem 0.875rem" }, onClick: (e) => e.stopPropagation(), children: isPendingWarning ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 4, background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 6, padding: "6px 8px", minWidth: 220 }, children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.7rem", color: "#92400e", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }, children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "⚠" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: pendingPnlWarning.direction === "add" ? `This will add ${fmt(pendingPnlWarning.claimAmountPence)} to the ${year} P&L income total.` : `This will remove ${fmt(pendingPnlWarning.claimAmountPence)} from the ${year} P&L income total.` })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "button",
                                {
                                  onClick: () => {
                                    const w = pendingPnlWarning;
                                    setPendingPnlWarning(null);
                                    setPendingCompletion(null);
                                    setUpdatingMilestone(w.milestoneId);
                                    updateMilestoneStatus.mutate({ milestoneId: w.milestoneId, projectId: w.projectId, status: w.newStatus, completionDate: w.completionDate });
                                  },
                                  disabled: isUpdating,
                                  style: { fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, background: "#d97706", color: "#fff", border: "none", cursor: isUpdating ? "wait" : "pointer", fontWeight: 600, opacity: isUpdating ? 0.6 : 1 },
                                  children: isUpdating ? "Saving…" : "Confirm"
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "button",
                                {
                                  onClick: () => {
                                    setPendingPnlWarning(null);
                                    setPendingCompletion(null);
                                  },
                                  disabled: isUpdating,
                                  style: { fontSize: "0.7rem", padding: "2px 7px", borderRadius: 20, background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer", fontWeight: 600 },
                                  children: "Cancel"
                                }
                              )
                            ] })
                          ] }) : isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4, alignItems: "center" }, children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "button",
                              {
                                onClick: () => {
                                  if (!pendingCompletion?.date) return;
                                  const newDateWouldBeIncluded = msIsIncluded(pendingCompletion.newStatus, pendingCompletion.date);
                                  const existingDateWouldBeIncluded = msIsIncluded(pendingCompletion.newStatus, ms.completionDate);
                                  const pendingDateRemovesFromPnl = ms.claimAmountPence != null && existingDateWouldBeIncluded && !newDateWouldBeIncluded;
                                  if (pnlChanges(pendingCompletion.newStatus, pendingCompletion.date) || pendingDateRemovesFromPnl) {
                                    setPendingPnlWarning({
                                      milestoneId: ms.id,
                                      projectId: p.id,
                                      newStatus: pendingCompletion.newStatus,
                                      completionDate: pendingCompletion.date,
                                      claimAmountPence: ms.claimAmountPence,
                                      direction: newDateWouldBeIncluded ? "add" : "remove"
                                    });
                                  } else {
                                    setUpdatingMilestone(ms.id);
                                    updateMilestoneStatus.mutate({
                                      milestoneId: ms.id,
                                      projectId: p.id,
                                      status: pendingCompletion.newStatus,
                                      completionDate: pendingCompletion.date
                                    });
                                  }
                                },
                                disabled: isUpdating || !pendingCompletion?.date,
                                style: { fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, background: "#1e40af", color: "#fff", border: "none", cursor: isUpdating ? "wait" : "pointer", fontWeight: 600, opacity: isUpdating ? 0.6 : 1 },
                                children: isUpdating ? "Saving…" : "Save"
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "button",
                              {
                                onClick: () => setPendingCompletion(null),
                                disabled: isUpdating,
                                style: { fontSize: "0.7rem", padding: "2px 7px", borderRadius: 20, background: "#f3f4f6", color: "#374151", border: "none", cursor: "pointer", fontWeight: 600 },
                                children: "Cancel"
                              }
                            )
                          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "select",
                            {
                              disabled: isUpdating,
                              value: ms.status ?? "pending",
                              onChange: (e) => {
                                const newStatus = e.target.value;
                                if (needsDate(newStatus)) {
                                  const defaultDate = ms.dueDate && ms.dueDate.slice(0, 10) <= todayIso ? ms.dueDate.slice(0, 10) : todayIso;
                                  setPendingCompletion({ milestoneId: ms.id, projectId: p.id, newStatus, date: defaultDate });
                                } else if (pnlChanges(newStatus, ms.completionDate)) {
                                  const nextDate = newStatus === "pending" || newStatus === "overdue" ? null : ms.completionDate;
                                  setPendingPnlWarning({ milestoneId: ms.id, projectId: p.id, newStatus, completionDate: nextDate, claimAmountPence: ms.claimAmountPence, direction: pnlChangeDir(newStatus, ms.completionDate) });
                                } else {
                                  setUpdatingMilestone(ms.id);
                                  const completionDate = newStatus === "pending" || newStatus === "overdue" ? null : void 0;
                                  updateMilestoneStatus.mutate({ milestoneId: ms.id, projectId: p.id, status: newStatus, completionDate });
                                }
                              },
                              style: {
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                padding: "2px 22px 2px 7px",
                                borderRadius: 20,
                                textTransform: "capitalize",
                                border: "1px solid transparent",
                                cursor: isUpdating ? "wait" : "pointer",
                                appearance: "auto",
                                opacity: isUpdating ? 0.6 : 1,
                                ...msStatusStyle(ms.status ?? "pending")
                              },
                              children: MILESTONE_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, style: { textTransform: "capitalize" }, children: s }, s))
                            }
                          ) })
                        ] }, ms.id);
                      }) })
                    ] }),
                    milestoneError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.5rem 0.875rem", background: "#fef2f2", borderTop: "1px solid #fecaca", color: "#991b1b", fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 6 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "⚠" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: milestoneError }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMilestoneError(null), style: { marginLeft: "auto", fontSize: "0.75rem", color: "#991b1b", background: "none", border: "none", cursor: "pointer", padding: "0 4px" }, children: "✕" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: i < agriEnvProjects.length - 1 ? "1px solid #f3f4f6" : "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 7, style: { padding: 0 } }) })
              ] })
            ] });
          }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: "2px solid #d1fae5", background: "#f0fdf4" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 4, style: { padding: "0.6rem 0.875rem", fontWeight: 700, color: "#166534" }, children: "Total Agri-environment Scheme Value" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.6rem 0.875rem", fontWeight: 700, color: "#166534" }, children: fmt(totalAgriEnvGrantValue) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", {})
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 6 }, children: "Click a project row to expand its milestones. Showing all agri-environment agreements except withdrawn ones." })
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
  const agriEnvTotalClaimedPence = data?.agriEnvTotalClaimedPence ?? 0;
  const unlinkedAgriEnvTxTotal = allTx.filter((t) => (t.category === "Agri-Environment Scheme" || t.category === "Vineyard Agri-Environment Scheme") && t.transactionType === "income" && !t.agriEnvProjectId).reduce((s, t) => s + (t.amountPence ?? 0), 0);
  const hasDoubleCountRisk = agriEnvTotalClaimedPence > 0 && unlinkedAgriEnvTxTotal > 0;
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground py-8 text-center", children: "Loading…" });
  if (availableYears.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { icon: Calendar, message: "Add harvest records and financial transactions across multiple years to see trends." });
  const changeIcon = (curr, prev) => {
    if (!prev) return null;
    return curr >= prev ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 14, style: { color: "#166534", display: "inline", marginLeft: 4 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { size: 14, style: { color: "#dc2626", display: "inline", marginLeft: 4 } });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    hasDoubleCountRisk && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 8, padding: "0.75rem 1rem", display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "1.1rem", lineHeight: 1.3 }, children: "⚠️" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#92400e", fontSize: "0.875rem", marginBottom: 2 }, children: "Possible double-count detected" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: "#78350f", fontSize: "0.8rem" }, children: [
          "You have both an ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Agri-Environment Scheme" }),
          " financial transaction and agri-env milestone records on file. The income figures across all years shown here are drawn from financial transactions only — if the same payment also appears as a milestone claim in the Agri-Env tab, it may be counted twice in your overall reporting. To resolve this, link the financial transaction to the relevant agri-env project in the P&L tab."
        ] })
      ] })
    ] }),
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
  const queryClient = useQueryClient();
  const [tab, setTab] = usePersistedTab({ page: "business-reports", farmId, validIds: ["gross-margin", "pl", "input-costs", "grain-position", "subsidies", "year-on-year", "assets", "benchmarking"], defaultTab: "gross-margin" });
  const [year, setYear] = usePersistedNumberFilter({ page: "business-reports", filter: "year", farmId, defaultValue: (/* @__PURE__ */ new Date()).getFullYear() });
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  const [exportFn, setExportFn] = reactExports.useState(null);
  const onRegisterExport = reactExports.useCallback((fn) => {
    setExportFn(() => fn);
  }, []);
  const switchTab = reactExports.useCallback((next) => {
    if ((next === "gross-margin" || next === "pl") && farmId) {
      queryClient.invalidateQueries({ queryKey: ["report-gross-margin", farmId, year] });
    }
    setTab(next);
  }, [queryClient, farmId, year, setTab]);
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
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "gross-margin", onClick: () => switchTab("gross-margin"), children: "Gross Margin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "pl", onClick: () => switchTab("pl"), children: "P&L Statement" }),
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
