import { b as useAppStore, u as useLocation, l as useQuery, j as jsxRuntimeExports } from "./index-DMNkf8lm.js";
import { A as AppLayout, I as Info } from "./AppLayout-BTePU50s.js";
import { L as Leaf, T as TriangleAlert } from "./triangle-alert-TyZXTgXW.js";
import { C as ChevronRight } from "./tractor-CmIRaOY-.js";
import { L as Lock } from "./lock-BeLUhZ-x.js";
import { C as CircleCheck } from "./circle-check-DgE__n29.js";
import "./use-safe-clerk-CgUUcA4M.js";
import "./trash-2-D9hEsCoN.js";
import "./database-ehu65ifW.js";
import "./shield-alert-CmF9VY04.js";
import "./shield-check-BkemVvD4.js";
const ORGANIC_N_LIMIT = 170;
const TOTAL_N_LIMIT = 250;
function daysUntilOpen(landType) {
  const now = /* @__PURE__ */ new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayOfYear = month * 100 + day;
  let closedEnd = null;
  if (landType === "arable" || landType === "mixed") {
    if (dayOfYear >= 801 || dayOfYear <= 131) {
      closedEnd = new Date(now.getFullYear(), 0, 31);
      if (dayOfYear >= 801) closedEnd = new Date(now.getFullYear() + 1, 0, 31);
    }
  } else if (landType === "grassland") {
    if (dayOfYear >= 1015 || dayOfYear <= 131) {
      closedEnd = new Date(now.getFullYear(), 0, 31);
      if (dayOfYear >= 1015) closedEnd = new Date(now.getFullYear() + 1, 0, 31);
    }
  }
  if (closedEnd) {
    const msLeft = closedEnd.getTime() - now.getTime();
    return { open: false, daysRemaining: Math.max(0, Math.ceil(msLeft / 864e5)) };
  }
  return { open: true, daysRemaining: null };
}
function isTodayClosed(landType) {
  return !daysUntilOpen(landType).open;
}
function NBar({ value, limit }) {
  const pct = Math.min(value / limit * 100, 100);
  const over = value > limit;
  const warn = value > limit * 0.85 && !over;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 8, borderRadius: 999, overflow: "hidden", background: "#f3f4f6" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: "100%", borderRadius: 999, width: `${pct}%`, background: over ? "#ef4444" : warn ? "#f59e0b" : "#22c55e", transition: "width 0.5s ease" } }) });
}
function NVZDashboard() {
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();
  const summaryQ = useQuery({
    queryKey: ["nvz-summary", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nvz/field-summary`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.summaries ?? []
  });
  const summaries = summaryQ.data ?? [];
  const nvzFields = summaries.filter((s) => s.isNvz);
  const nonNvzFields = summaries.filter((s) => !s.isNvz);
  const fieldsOverLimit = nvzFields.filter((s) => s.organicNKgHa > ORGANIC_N_LIMIT || s.totalNKgHa > TOTAL_N_LIMIT);
  const fieldsInClosedPeriod = nvzFields.filter((s) => isTodayClosed(s.nvzLandType));
  const fieldsOk = nvzFields.filter((s) => s.organicNKgHa <= ORGANIC_N_LIMIT && s.totalNKgHa <= TOTAL_N_LIMIT);
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "NVZ Status Board", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "4rem 2rem", textAlign: "center", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 40, style: { margin: "0 auto 1rem" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#6b7280" }, children: "Select a farm to view the NVZ status board" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "NVZ Status Board", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Nitrogen balance, closed period status, and limit tracking across all NVZ-designated fields." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/nvz"), style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer" }, children: [
        "NVZ Records ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
      ] })
    ] }),
    summaryQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }, children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 88, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10 } }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      fieldsOverLimit.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, color: "#dc2626", style: { marginTop: 1, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 700, color: "#dc2626", fontSize: "0.9rem" }, children: [
            fieldsOverLimit.length,
            " field",
            fieldsOverLimit.length > 1 ? "s" : "",
            " exceeding N application limits"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }, children: [
            fieldsOverLimit.map((s) => s.fieldName).join(", "),
            " — review applications immediately. Breaching NVZ limits carries enforcement risk."
          ] })
        ] })
      ] }),
      fieldsInClosedPeriod.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 18, color: "#d97706", style: { marginTop: 1, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 700, color: "#92400e", fontSize: "0.9rem" }, children: [
            "Slurry / digestate closed period is currently active on ",
            fieldsInClosedPeriod.length,
            " field",
            fieldsInClosedPeriod.length > 1 ? "s" : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }, children: "Do not apply liquid organic nitrogen to these fields until the closed period ends (31 Jan)." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }, children: [
        { label: "NVZ Fields", value: nvzFields.length, bg: "#f0f9ff", iconBg: "#e0f2fe", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 18, color: "#0369a1" }) },
        { label: "Over N Limit", value: fieldsOverLimit.length, bg: fieldsOverLimit.length > 0 ? "#fef2f2" : "#f9fafb", iconBg: fieldsOverLimit.length > 0 ? "#fee2e2" : "#f3f4f6", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, color: fieldsOverLimit.length > 0 ? "#dc2626" : "#9ca3af" }) },
        { label: "Closed Period", value: fieldsInClosedPeriod.length, bg: fieldsInClosedPeriod.length > 0 ? "#fffbeb" : "#f9fafb", iconBg: fieldsInClosedPeriod.length > 0 ? "#fef3c7" : "#f3f4f6", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 18, color: fieldsInClosedPeriod.length > 0 ? "#d97706" : "#9ca3af" }) },
        { label: "Within Limits", value: fieldsOk.length, bg: "#f0fdf4", iconBg: "#dcfce7", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, color: "#15803d" }) }
      ].map(({ label, value, bg, iconBg, icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: iconBg, borderRadius: 8, padding: 8, flexShrink: 0 }, children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.375rem", fontWeight: 700, color: "#111827" }, children: value })
        ] })
      ] }, label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", marginBottom: "1.25rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { size: 15, color: "#374151" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: "NVZ Field N Balance — Rolling 12 Months" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", display: "flex", gap: 16, fontSize: "0.72rem", color: "#9ca3af" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Organic limit: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "170 kg N/ha" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Total limit: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "250 kg N/ha" })
            ] })
          ] })
        ] }),
        nvzFields.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { size: 24, style: { margin: "0 auto 0.5rem", opacity: 0.4 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem" }, children: "No NVZ-designated fields found. Mark fields as NVZ in the NVZ module." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: nvzFields.sort((a, b) => {
          const aOver = a.organicNKgHa > ORGANIC_N_LIMIT || a.totalNKgHa > TOTAL_N_LIMIT;
          const bOver = b.organicNKgHa > ORGANIC_N_LIMIT || b.totalNKgHa > TOTAL_N_LIMIT;
          if (aOver && !bOver) return -1;
          if (!aOver && bOver) return 1;
          return (b.totalNKgHa || 0) - (a.totalNKgHa || 0);
        }).map((fs, i, arr) => {
          const organicOver = fs.organicNKgHa > ORGANIC_N_LIMIT;
          const totalOver = fs.totalNKgHa > TOTAL_N_LIMIT;
          const organicWarn = !organicOver && fs.organicNKgHa > ORGANIC_N_LIMIT * 0.85;
          const totalWarn = !totalOver && fs.totalNKgHa > TOTAL_N_LIMIT * 0.85;
          const closedInfo = daysUntilOpen(fs.nvzLandType);
          const rowBg = organicOver || totalOver ? "#fff5f5" : organicWarn || totalWarn ? "#fffdf0" : "transparent";
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "1rem 1.25rem", borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none", background: rowBg }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10, gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 700, color: "#111827", fontSize: "0.9rem" }, children: fs.fieldName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 1 }, children: [
                  fs.nvzLandType ? `${fs.nvzLandType} land` : "NVZ field",
                  fs.areaHectares ? ` · ${parseFloat(String(fs.areaHectares)).toFixed(1)} ha` : "",
                  " · ",
                  fs.applicationCount || 0,
                  " application",
                  fs.applicationCount !== 1 ? "s" : ""
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }, children: [
                !closedInfo.open && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.7rem", fontWeight: 700, color: "#92400e", background: "#fef3c7", borderRadius: 4, padding: "2px 6px", display: "inline-flex", alignItems: "center", gap: 3 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { size: 10 }),
                  " Closed — opens in ",
                  closedInfo.daysRemaining,
                  "d"
                ] }),
                (organicOver || totalOver) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 700, color: "#991b1b", background: "#fee2e2", borderRadius: 4, padding: "2px 6px" }, children: "Over limit" }),
                !organicOver && !totalOver && !organicWarn && !totalWarn && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 700, color: "#166534", background: "#dcfce7", borderRadius: 4, padding: "2px 6px" }, children: "Within limits" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", color: "#6b7280", fontWeight: 600 }, children: "Organic N applied" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", fontWeight: 700, color: organicOver ? "#dc2626" : organicWarn ? "#d97706" : "#374151" }, children: [
                    (fs.organicNKgHa || 0).toFixed(1),
                    " / ",
                    ORGANIC_N_LIMIT,
                    " kg/ha"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(NBar, { value: fs.organicNKgHa || 0, limit: ORGANIC_N_LIMIT })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 4 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", color: "#6b7280", fontWeight: 600 }, children: "Total N applied" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", fontWeight: 700, color: totalOver ? "#dc2626" : totalWarn ? "#d97706" : "#374151" }, children: [
                    (fs.totalNKgHa || 0).toFixed(1),
                    " / ",
                    TOTAL_N_LIMIT,
                    " kg/ha"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(NBar, { value: fs.totalNKgHa || 0, limit: TOTAL_N_LIMIT })
              ] })
            ] })
          ] }, fs.fieldId);
        }) })
      ] }),
      nonNvzFields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "0.75rem 1.25rem", fontSize: "0.8rem", color: "#6b7280" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { style: { color: "#374151" }, children: [
          nonNvzFields.length,
          " non-NVZ field",
          nonNvzFields.length > 1 ? "s" : ""
        ] }),
        " with fertiliser applications are not subject to NVZ limits but are tracked for NMP purposes."
      ] })
    ] })
  ] }) });
}
export {
  NVZDashboard as default
};
