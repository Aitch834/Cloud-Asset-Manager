import { b as useAppStore, u as useLocation, r as reactExports, l as useQuery, j as jsxRuntimeExports, T as FlaskConical } from "./index-D10RTn8b.js";
import { A as AppLayout, T as TrendingUp, I as Info } from "./AppLayout-DfEI23nO.js";
import { C as ChevronRight } from "./tractor-DjqZANIp.js";
import { T as TriangleAlert } from "./triangle-alert-D6PyINJB.js";
import { a as Clock } from "./database-CP3GUYd-.js";
import { C as CircleCheck } from "./circle-check-DmX7_GS5.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend } from "./generateCategoricalChart-CwVKTimr.js";
import { L as LineChart } from "./LineChart-Bx8R-Wlw.js";
import { C as CartesianGrid } from "./CartesianGrid-Bnx2fTc-.js";
import { L as Line } from "./Line-CPBXmpbX.js";
import "./use-safe-clerk-CrdGQ5AM.js";
import "./trash-2-CNQPfEeW.js";
import "./shield-alert-X7ttD9YG.js";
import "./shield-check-BNxc2Vs2.js";
function daysSince(dateStr) {
  if (!dateStr) return null;
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((now.getTime() - d.getTime()) / 864e5);
}
function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtShort(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}
function TestAgeBadge({ days }) {
  if (days === null) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#991b1b", background: "#fee2e2", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11 }),
    " Never tested"
  ] });
  if (days > 365 * 5) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#991b1b", background: "#fee2e2", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11 }),
    " Overdue (",
    Math.floor(days / 365),
    "y ago)"
  ] });
  if (days > 365 * 3) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#92400e", background: "#fef3c7", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11 }),
    " Review due (",
    Math.floor(days / 365),
    "y ago)"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#166534", background: "#dcfce7", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 11 }),
    " Current (",
    Math.floor(days / 365),
    "y ago)"
  ] });
}
function NutrientPill({ label, value, status }) {
  const s = (status || "").toLowerCase();
  const col = s === "low" ? { bg: "#fee2e2", text: "#991b1b" } : s === "high" ? { bg: "#dbeafe", text: "#1d4ed8" } : s === "adequate" || s === "optimal" ? { bg: "#dcfce7", text: "#166534" } : { bg: "#f3f4f6", text: "#6b7280" };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: col.bg, borderRadius: 8, padding: "0.35rem 0.65rem", display: "inline-flex", flexDirection: "column", alignItems: "center", minWidth: 52 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", color: col.text, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 700, color: col.text }, children: value !== null && value !== void 0 ? value : "—" })
  ] });
}
const FIELD_COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#9333ea",
  "#dc2626",
  "#0891b2",
  "#c2410c",
  "#65a30d",
  "#db2777",
  "#0f766e",
  "#7c3aed",
  "#b45309",
  "#059669",
  "#e11d48",
  "#0369a1"
];
const NUTRIENT_OPTIONS = [
  { key: "ph", label: "pH", domain: [3, 8] },
  { key: "phosphorus", label: "Phosphorus (P Index)", domain: [0, 4] },
  { key: "potassium", label: "Potassium (K Index)", domain: [0, 4] },
  { key: "magnesium", label: "Magnesium (Mg Index)", domain: [0, 4] },
  { key: "organicMatter", label: "Organic Matter %", domain: [0, 10] }
];
function SoilDashboard() {
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();
  const [viewTab, setViewTab] = reactExports.useState("overview");
  const [selectedNutrient, setSelectedNutrient] = reactExports.useState("ph");
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const soilQ = useQuery({
    queryKey: ["soil-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/soil-tests`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const fields = fieldsQ.data ?? [];
  const soilTests = soilQ.data ?? [];
  const loading = fieldsQ.isLoading || soilQ.isLoading;
  const fieldTestMap = /* @__PURE__ */ new Map();
  soilTests.forEach((t) => {
    if (!fieldTestMap.has(t.fieldId)) fieldTestMap.set(t.fieldId, []);
    fieldTestMap.get(t.fieldId).push(t);
  });
  const fieldSummaries = fields.map((f) => {
    const tests = (fieldTestMap.get(f.id) || []).sort(
      (a, b) => new Date(b.sampleDate).getTime() - new Date(a.sampleDate).getTime()
    );
    const latest = tests[0] || null;
    const days = latest ? daysSince(latest.sampleDate) : null;
    const results = latest?.results || [];
    const getResult = (nutrient) => results.find((r) => r.nutrient?.toLowerCase().includes(nutrient.toLowerCase()));
    const ph = getResult("ph");
    const p = getResult("phosphorus");
    const k = getResult("potassium");
    const mg = getResult("magnesium");
    return { field: f, latest, days, ph, p, k, mg, testCount: tests.length, allTests: tests };
  });
  const neverTested = fieldSummaries.filter((s) => s.days === null).length;
  const overdue = fieldSummaries.filter((s) => s.days !== null && s.days > 365 * 5).length;
  const reviewDue = fieldSummaries.filter((s) => s.days !== null && s.days > 365 * 3 && s.days <= 365 * 5).length;
  const current = fieldSummaries.filter((s) => s.days !== null && s.days <= 365 * 3).length;
  const sorted = [...fieldSummaries].sort((a, b) => {
    if (a.days === null && b.days !== null) return -1;
    if (a.days !== null && b.days === null) return 1;
    if (a.days === null && b.days === null) return a.field.name.localeCompare(b.field.name);
    return b.days - a.days;
  });
  const nutrientConfig = NUTRIENT_OPTIONS.find((n) => n.key === selectedNutrient) ?? NUTRIENT_OPTIONS[0];
  const trendData = reactExports.useMemo(() => {
    const allDates = /* @__PURE__ */ new Set();
    fieldSummaries.forEach((s) => {
      s.allTests.forEach((t) => {
        if (t.sampleDate) allDates.add(t.sampleDate.slice(0, 10));
      });
    });
    const sorted2 = Array.from(allDates).sort();
    return sorted2.map((date) => {
      const point = { date, label: fmtShort(date) };
      fieldSummaries.forEach((s) => {
        const test = s.allTests.find((t) => t.sampleDate?.slice(0, 10) === date);
        if (test) {
          const results = test.results || [];
          const match = results.find((r) => r.nutrient?.toLowerCase().includes(selectedNutrient.toLowerCase()));
          if (match) {
            const val = parseFloat(match.index ?? match.value ?? "");
            if (!isNaN(val)) point[`field_${s.field.id}`] = val;
          }
        }
      });
      return point;
    });
  }, [fieldSummaries, selectedNutrient]);
  const fieldsWithTrendData = fieldSummaries.filter(
    (s) => s.allTests.some((t) => {
      const results = t.results || [];
      return results.some((r) => r.nutrient?.toLowerCase().includes(selectedNutrient.toLowerCase()) && (r.index ?? r.value));
    })
  );
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Soil Health Dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "4rem 2rem", textAlign: "center", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { size: 40, style: { margin: "0 auto 1rem" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#6b7280" }, children: "Select a farm to view soil health status" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Soil Health Dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Per-field soil test status, pH, phosphorus, potassium, and magnesium indices at a glance." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/soil"), style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer" }, children: [
        "Soil Test Records ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 2, background: "#f3f4f6", borderRadius: 10, padding: 3, marginBottom: "1.5rem", width: "fit-content" }, children: [
      { key: "overview", label: "Overview", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { size: 14 }) },
      { key: "trends", label: "Nutrient Trends", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 14 }) }
    ].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setViewTab(t.key),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0.4rem 1rem",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontSize: "0.82rem",
          fontWeight: 600,
          background: viewTab === t.key ? "#fff" : "transparent",
          color: viewTab === t.key ? "#111827" : "#6b7280",
          boxShadow: viewTab === t.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
          transition: "all 0.15s"
        },
        children: [
          t.icon,
          " ",
          t.label
        ]
      },
      t.key
    )) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }, children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 88, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10 } }, i)) }) : viewTab === "overview" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      neverTested + overdue > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, color: "#dc2626", style: { marginTop: 1, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 700, color: "#dc2626", fontSize: "0.9rem" }, children: [
            neverTested + overdue,
            " field",
            neverTested + overdue > 1 ? "s" : "",
            " need soil testing"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }, children: "Soil tests older than 5 years or never conducted. AHDB recommends testing every 3–5 years for accurate fertiliser planning." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }, children: [
        { label: "Never Tested", value: neverTested, bg: neverTested > 0 ? "#fef2f2" : "#f9fafb", iconBg: neverTested > 0 ? "#fecaca" : "#f3f4f6", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, color: neverTested > 0 ? "#dc2626" : "#9ca3af" }) },
        { label: "Overdue (5y+)", value: overdue, bg: overdue > 0 ? "#fff5f5" : "#f9fafb", iconBg: overdue > 0 ? "#fecaca" : "#f3f4f6", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 18, color: overdue > 0 ? "#dc2626" : "#9ca3af" }) },
        { label: "Review Due (3–5y)", value: reviewDue, bg: reviewDue > 0 ? "#fffbeb" : "#f9fafb", iconBg: reviewDue > 0 ? "#fef3c7" : "#f3f4f6", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 18, color: reviewDue > 0 ? "#d97706" : "#9ca3af" }) },
        { label: "Current (< 3y)", value: current, bg: "#f0fdf4", iconBg: "#dcfce7", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, color: "#15803d" }) }
      ].map(({ label, value, bg, iconBg, icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: iconBg, borderRadius: 8, padding: 8, flexShrink: 0 }, children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.375rem", fontWeight: 700, color: "#111827" }, children: value })
        ] })
      ] }, label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { size: 15, color: "#374151" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: "Field Soil Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: "auto", fontSize: "0.72rem", color: "#9ca3af" }, children: "Sorted: most urgent first" })
        ] }),
        sorted.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 24, style: { margin: "0 auto 0.5rem", opacity: 0.4 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem" }, children: "No fields found. Add fields via Fields & Crops." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Field", "Last Tested", "Test Age", "pH", "P Index", "K Index", "Mg Index", "Tests"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }, children: h }, h)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: sorted.map((s) => {
            const rowBg = s.days === null || s.days > 365 * 5 ? "#fff8f8" : s.days > 365 * 3 ? "#fffef5" : "transparent";
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6", background: rowBg }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.65rem 0.875rem", fontWeight: 600, color: "#111827" }, children: [
                s.field.name,
                s.field.fieldReference ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af", fontSize: "0.75rem" }, children: [
                  " (",
                  s.field.fieldReference,
                  ")"
                ] }) : null
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmt(s.latest?.sampleDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TestAgeBadge, { days: s.days }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem" }, children: s.ph ? /* @__PURE__ */ jsxRuntimeExports.jsx(NutrientPill, { label: "pH", value: s.ph.value, status: s.ph.status }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem" }, children: s.p ? /* @__PURE__ */ jsxRuntimeExports.jsx(NutrientPill, { label: s.p.index || "P", value: s.p.index || s.p.value, status: s.p.status }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem" }, children: s.k ? /* @__PURE__ */ jsxRuntimeExports.jsx(NutrientPill, { label: s.k.index || "K", value: s.k.index || s.k.value, status: s.k.status }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem" }, children: s.mg ? /* @__PURE__ */ jsxRuntimeExports.jsx(NutrientPill, { label: s.mg.index || "Mg", value: s.mg.index || s.mg.value, status: s.mg.status }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db" }, children: "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem", color: "#6b7280" }, children: s.testCount })
            ] }, s.field.id);
          }) })
        ] })
      ] })
    ] }) : (
      /* ── TRENDS TAB ── */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.82rem", fontWeight: 600, color: "#374151" }, children: "Show:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: NUTRIENT_OPTIONS.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setSelectedNutrient(n.key),
              style: {
                padding: "0.3rem 0.85rem",
                borderRadius: 999,
                border: "1.5px solid",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: "pointer",
                borderColor: selectedNutrient === n.key ? "#2563eb" : "#e5e7eb",
                background: selectedNutrient === n.key ? "#dbeafe" : "#fff",
                color: selectedNutrient === n.key ? "#1d4ed8" : "#6b7280"
              },
              children: n.label
            },
            n.key
          )) })
        ] }),
        fieldsWithTrendData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px dashed #e5e7eb", borderRadius: 12, padding: "3rem 2rem", textAlign: "center", color: "#9ca3af" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 32, style: { margin: "0 auto 0.75rem", opacity: 0.3 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.9rem", color: "#6b7280" }, children: "No trend data available" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", marginTop: 4 }, children: [
            "Add multiple soil test records with ",
            nutrientConfig.label,
            " results to see trends over time."
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 15, color: "#374151" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: [
                nutrientConfig.label,
                " — All Fields Over Time"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", fontSize: "0.72rem", color: "#9ca3af" }, children: [
                fieldsWithTrendData.length,
                " field",
                fieldsWithTrendData.length !== 1 ? "s" : "",
                " with data"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 320, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: trendData, margin: { top: 5, right: 20, left: 0, bottom: 5 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f3f4f6" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11, fill: "#6b7280" } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: nutrientConfig.domain, tick: { fontSize: 11, fill: "#6b7280" }, width: 35 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Tooltip,
                {
                  contentStyle: { fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e7eb" },
                  formatter: (val, name) => {
                    const fieldId = parseInt(name.replace("field_", ""));
                    const field = fields.find((f) => f.id === fieldId);
                    return [val, field?.name ?? name];
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Legend,
                {
                  formatter: (value) => {
                    const fieldId = parseInt(value.replace("field_", ""));
                    const field = fields.find((f) => f.id === fieldId);
                    return field?.name ?? value;
                  },
                  wrapperStyle: { fontSize: "0.78rem" }
                }
              ),
              fieldsWithTrendData.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                Line,
                {
                  type: "monotone",
                  dataKey: `field_${s.field.id}`,
                  stroke: FIELD_COLORS[i % FIELD_COLORS.length],
                  strokeWidth: 2,
                  dot: { r: 4 },
                  activeDot: { r: 6 },
                  connectNulls: false
                },
                s.field.id
              ))
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }, children: fieldsWithTrendData.map((s, i) => {
            const color = FIELD_COLORS[i % FIELD_COLORS.length];
            const fieldTests = s.allTests.map((t) => {
              const results = t.results || [];
              const match = results.find((r) => r.nutrient?.toLowerCase().includes(selectedNutrient.toLowerCase()));
              if (!match) return null;
              const val = parseFloat(match.index ?? match.value ?? "");
              return isNaN(val) ? null : { date: t.sampleDate?.slice(0, 10), val };
            }).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));
            if (fieldTests.length === 0) return null;
            const latest = fieldTests[fieldTests.length - 1];
            const first = fieldTests[0];
            const change = fieldTests.length > 1 ? latest.val - first.val : null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: `1px solid ${color}30`, borderRadius: 10, padding: "0.875rem 1rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 700, fontSize: "0.85rem", color: "#111827" }, children: s.field.name }),
                  s.field.fieldReference && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.72rem", color: "#9ca3af" }, children: s.field.fieldReference })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.1rem", fontWeight: 700, color }, children: latest.val }),
                  change !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", fontWeight: 600, color: change > 0 ? "#16a34a" : change < 0 ? "#dc2626" : "#6b7280" }, children: [
                    change > 0 ? "▲" : change < 0 ? "▼" : "—",
                    " ",
                    Math.abs(change).toFixed(2),
                    " since first test"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 60, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: fieldTests, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: "val", stroke: color, strokeWidth: 2, dot: false }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { domain: nutrientConfig.domain, hide: true }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", hide: true }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Tooltip,
                  {
                    contentStyle: { fontSize: "0.75rem", borderRadius: 6, border: "1px solid #e5e7eb", padding: "4px 8px" },
                    formatter: (v) => [v, nutrientConfig.label],
                    labelFormatter: (l) => fmtShort(l)
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 4 }, children: [
                fieldTests.length,
                " test",
                fieldTests.length !== 1 ? "s" : "",
                " · First: ",
                fmtShort(first.date),
                " · Latest: ",
                fmtShort(latest.date)
              ] })
            ] }, s.field.id);
          }) })
        ] })
      ] })
    )
  ] }) });
}
export {
  SoilDashboard as default
};
