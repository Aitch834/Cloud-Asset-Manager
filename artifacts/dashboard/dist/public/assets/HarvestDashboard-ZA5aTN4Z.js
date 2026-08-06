import { b as useAppStore, u as useLocation, r as reactExports, m as useQuery, j as jsxRuntimeExports } from "./index-CL7I2SfF.js";
import { A as AppLayout, a as Wheat, T as TrendingUp, e as ChartColumn } from "./AppLayout-swjhJeIk.js";
import { C as ChevronRight, T as Tractor } from "./tractor-DFDGZlbe.js";
import { C as CircleCheck } from "./circle-check-O6Peh1Cq.js";
import { D as Droplets } from "./shield-alert-e7MkaN-1.js";
import { C as Calendar } from "./calendar-x-k3ne5s.js";
import { a as Clock } from "./database-BZBY5KTM.js";
import "./use-safe-clerk-VdTi7dYa.js";
import "./trash-2-B9QM90sQ.js";
import "./triangle-alert-gAXTnZz-.js";
import "./shield-check-C2_xWcp4.js";
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};
function SeasonProgressBar({ harvested, total }) {
  const pct = total > 0 ? Math.min(100, harvested / total * 100) : 0;
  const colour = pct >= 90 ? "#15803d" : pct >= 50 ? "#1d4ed8" : pct >= 20 ? "#d97706" : "#6b7280";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#374151" }, children: "Season Progress" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", fontWeight: 700, color: colour }, children: [
        harvested.toFixed(1),
        " / ",
        total.toFixed(1),
        " ha (",
        pct.toFixed(0),
        "%)"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#f3f4f6", borderRadius: 999, height: 14, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: colour, width: `${pct}%`, height: "100%", borderRadius: 999, transition: "width 0.6s ease" } }) })
  ] });
}
function FieldStatusPill({ status }) {
  return status === "harvested" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#166534", background: "#dcfce7", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 11 }),
    " Done"
  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#92400e", background: "#fef3c7", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11 }),
    " Pending"
  ] });
}
function HarvestDayTooltip({ day, records, pos }) {
  const label = (/* @__PURE__ */ new Date(day + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const totalTonnes = records.reduce((s, r) => s + (parseFloat(r.yieldTonnes) || 0), 0);
  const totalHa = records.reduce((s, r) => s + (parseFloat(r.areaHarvestedHa) || 0), 0);
  const operators = [...new Set(records.filter((r) => r.operatorName).map((r) => r.operatorName))];
  const moistureRecords = records.filter((r) => r.moisturePercent);
  const avgMoisture = moistureRecords.length ? moistureRecords.reduce((s, r) => s + parseFloat(r.moisturePercent), 0) / moistureRecords.length : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    position: "fixed",
    top: pos.top,
    right: pos.right,
    zIndex: 9999,
    width: 288,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)",
    pointerEvents: "none",
    overflow: "hidden"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.65rem 0.9rem", background: "#f8fffe", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.82rem", color: "#111827" }, children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.75rem", fontWeight: 700, color: "#166534", background: "#dcfce7", borderRadius: 6, padding: "2px 7px" }, children: [
        totalTonnes.toFixed(1),
        " t total"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "0.5rem 0" }, children: records.map((r, i) => {
      const fieldName = r.field?.name || r.fieldName || "Unknown Field";
      const cropName = r.crop?.name || r.cropName || "Unknown Crop";
      const variety = r.crop?.variety || r.cropVariety;
      const yield_ = parseFloat(r.yieldTonnes) || 0;
      const area = parseFloat(r.areaHarvestedHa) || 0;
      const moisture = r.moisturePercent ? parseFloat(r.moisturePercent) : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "0.45rem 0.9rem",
        borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.82rem", color: "#111827", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: fieldName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.73rem", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, children: [
            cropName,
            variety ? ` · ${variety}` : ""
          ] }),
          moisture !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.7rem", color: "#0369a1", marginTop: 1, display: "flex", alignItems: "center", gap: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { size: 9, color: "#0369a1" }),
            " ",
            moisture.toFixed(1),
            "% moisture"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right", flexShrink: 0, marginLeft: 10 }, children: [
          yield_ > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 700, fontSize: "0.85rem", color: "#166534" }, children: [
            yield_.toFixed(1),
            " t"
          ] }),
          area > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#9ca3af" }, children: [
            area.toFixed(1),
            " ha"
          ] }),
          yield_ > 0 && area > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.7rem", color: "#6b7280" }, children: [
            (yield_ / area).toFixed(2),
            " t/ha"
          ] })
        ] })
      ] }, r.id ?? i);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.5rem 0.9rem", background: "#f9fafb", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#6b7280" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, color: "#374151" }, children: records.length }),
          " field",
          records.length !== 1 ? "s" : ""
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#6b7280" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, color: "#374151" }, children: totalHa.toFixed(1) }),
          " ha"
        ] }),
        avgMoisture !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#6b7280" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 600, color: "#374151" }, children: [
            avgMoisture.toFixed(1),
            "%"
          ] }),
          " avg moisture"
        ] })
      ] }),
      operators.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: operators.join(", ") })
    ] })
  ] });
}
function HarvestDashboard() {
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();
  const [hoveredDay, setHoveredDay] = reactExports.useState(null);
  const [tooltipPos, setTooltipPos] = reactExports.useState(null);
  const harvestQ = useQuery({
    queryKey: ["harvests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/harvests`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const fieldCropQ = useQuery({
    queryKey: ["field-crops", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/field-crops`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const harvests = harvestQ.data ?? [];
  const fieldCrops = fieldCropQ.data ?? [];
  const loading = harvestQ.isLoading || fieldCropQ.isLoading;
  const todayStr = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const todayHarvests = harvests.filter(
    (r) => r.harvestDate && new Date(r.harvestDate).toISOString().slice(0, 10) === todayStr
  );
  const seasonTotalHa = fieldCrops.reduce((s, fc) => s + (parseFloat(fc.areaHectares) || 0), 0);
  const harvestedHa = harvests.reduce((s, r) => s + (parseFloat(r.areaHarvestedHa) || 0), 0);
  const totalTonnes = harvests.reduce((s, r) => s + (parseFloat(r.yieldTonnes) || 0), 0);
  const avgYieldHa = harvestedHa > 0 ? totalTonnes / harvestedHa : 0;
  const moistureRecords = harvests.filter((r) => r.moisturePercent);
  const avgMoisture = moistureRecords.length ? moistureRecords.reduce((s, r) => s + parseFloat(r.moisturePercent), 0) / moistureRecords.length : null;
  const harvestedFieldIds = new Set(harvests.map((r) => r.fieldCropAssignmentId));
  const fieldStatuses = fieldCrops.map((fc) => ({
    ...fc,
    status: harvestedFieldIds.has(fc.id) ? "harvested" : "pending",
    harvestRecords: harvests.filter((r) => r.fieldCropAssignmentId === fc.id)
  }));
  const todayTotalHa = todayHarvests.reduce((s, r) => s + (parseFloat(r.areaHarvestedHa) || 0), 0);
  const todayTotalTonnes = todayHarvests.reduce((s, r) => s + (parseFloat(r.yieldTonnes) || 0), 0);
  const harvestDays = [...new Set(harvests.map((r) => r.harvestDate ? new Date(r.harvestDate).toISOString().slice(0, 10) : null).filter((d) => d !== null))].sort().reverse().slice(0, 7);
  const handleRowMouseEnter = (e, day) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const tooltipHeight = 80 + harvests.filter(
      (r) => r.harvestDate && new Date(r.harvestDate).toISOString().slice(0, 10) === day
    ).length * 62;
    const topPos = Math.min(rect.top, window.innerHeight - tooltipHeight - 12);
    setHoveredDay(day);
    setTooltipPos({ top: Math.max(8, topPos), right: window.innerWidth - rect.left + 12 });
  };
  const handleRowMouseLeave = () => {
    setHoveredDay(null);
    setTooltipPos(null);
  };
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Harvest Dashboard", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "4rem 2rem", textAlign: "center", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 40, style: { margin: "0 auto 1rem" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#6b7280" }, children: "Select a farm to view the harvest dashboard" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Harvest Dashboard", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1200, margin: "0 auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Real-time snapshot of harvest progress, field status, and season totals." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => navigate("/harvest"),
            style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer" },
            children: [
              "View Full Harvest Log ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
            ]
          }
        )
      ] }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }, children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 88, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, animation: "pulse 1.5s infinite" } }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }, children: [
          { label: "Fields Harvested", value: `${harvestedFieldIds.size} / ${fieldCrops.length}`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 18, color: "#15803d" }), bg: "#f0fdf4", iconBg: "#dcfce7" },
          { label: "Total Yield", value: `${totalTonnes.toFixed(1)} t`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 18, color: "#7c3aed" }), bg: "#f5f3ff", iconBg: "#ede9fe" },
          { label: "Avg Yield / ha", value: avgYieldHa > 0 ? `${avgYieldHa.toFixed(2)} t/ha` : "—", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 18, color: "#1d4ed8" }), bg: "#eff6ff", iconBg: "#dbeafe" },
          { label: "Avg Moisture", value: avgMoisture !== null ? `${avgMoisture.toFixed(1)}%` : "—", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { size: 18, color: "#0369a1" }), bg: "#f0f9ff", iconBg: "#e0f2fe" }
        ].map(({ label, value, icon, bg, iconBg }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: iconBg, borderRadius: 8, padding: 8, flexShrink: 0 }, children: icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }, children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.25rem", fontWeight: 700, color: "#111827" }, children: value })
          ] })
        ] }, label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SeasonProgressBar, { harvested: harvestedHa, total: seasonTotalHa }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 8 }, children: "Based on field-crop assignments for the current season. Area harvested vs total cropped area." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "1.5rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 15, color: "#15803d" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: [
                "Today's Activity",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 400, color: "#9ca3af", fontSize: "0.78rem" }, children: [
                  "— ",
                  (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long" })
                ] })
              ] })
            ] }),
            todayHarvests.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 24, style: { margin: "0 auto 0.5rem", opacity: 0.3 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem" }, children: "No harvest activity logged today" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, borderBottom: "1px solid #f3f4f6" }, children: [
                ["Fields cut today", todayHarvests.length],
                ["Area today", `${todayTotalHa.toFixed(1)} ha`],
                ["Tonnes today", `${todayTotalTonnes.toFixed(1)} t`],
                ["Operators", [...new Set(todayHarvests.filter((r) => r.operatorName).map((r) => r.operatorName))].length || "—"]
              ].map(([k, v], i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.75rem 1.25rem", borderRight: i % 2 === 0 ? "1px solid #f3f4f6" : "none", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600, marginBottom: 2 }, children: k }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 700, fontSize: "1.1rem", color: "#111827" }, children: v })
              ] }, k)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "0.75rem 1.25rem" }, children: todayHarvests.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 6, marginBottom: 6, borderBottom: "1px solid #f9fafb" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.85rem", color: "#111827" }, children: r.field?.name || "Unknown Field" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: [
                    r.crop?.name || "Unknown Crop",
                    r.crop?.variety ? ` · ${r.crop.variety}` : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right" }, children: [
                  r.yieldTonnes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#166534" }, children: [
                    r.yieldTonnes,
                    "t"
                  ] }),
                  r.areaHarvestedHa && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: [
                    parseFloat(r.areaHarvestedHa).toFixed(1),
                    " ha"
                  ] })
                ] })
              ] }, r.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { size: 15, color: "#1d4ed8" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: "Recent Harvest Days" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: "auto", fontSize: "0.7rem", color: "#9ca3af", fontStyle: "italic" }, children: "Hover for detail" })
            ] }),
            harvestDays.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem" }, children: "No harvest records yet this season" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: harvestDays.map((day) => {
              const dayRecs = harvests.filter(
                (r) => r.harvestDate && new Date(r.harvestDate).toISOString().slice(0, 10) === day
              );
              const dayHa = dayRecs.reduce((s, r) => s + (parseFloat(r.areaHarvestedHa) || 0), 0);
              const dayT = dayRecs.reduce((s, r) => s + (parseFloat(r.yieldTonnes) || 0), 0);
              const isToday = day === todayStr;
              const isHovered = hoveredDay === day;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  onMouseEnter: (e) => handleRowMouseEnter(e, day),
                  onMouseLeave: handleRowMouseLeave,
                  style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.65rem 1.25rem",
                    borderBottom: "1px solid #f9fafb",
                    background: isHovered ? "#f0f9ff" : isToday ? "#f0fdf4" : "transparent",
                    cursor: "default",
                    transition: "background 0.1s"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
                      isToday && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", fontWeight: 700, color: "#15803d", background: "#dcfce7", borderRadius: 4, padding: "1px 5px" }, children: "TODAY" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.85rem", fontWeight: isToday ? 700 : 500, color: "#374151" }, children: (/* @__PURE__ */ new Date(day + "T12:00:00")).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 16, fontSize: "0.8rem" }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#6b7280" }, children: [
                        dayRecs.length,
                        " field",
                        dayRecs.length !== 1 ? "s" : ""
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#374151", fontWeight: 600 }, children: [
                        dayHa.toFixed(1),
                        " ha"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#166534", fontWeight: 700 }, children: [
                        dayT.toFixed(1),
                        " t"
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db", fontSize: "0.7rem" }, children: "›" })
                    ] })
                  ]
                },
                day
              );
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { size: 15, color: "#374151" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: "Field Status — This Season" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", fontSize: "0.75rem", color: "#9ca3af" }, children: [
              harvestedFieldIds.size,
              " of ",
              fieldCrops.length,
              " fields harvested"
            ] })
          ] }),
          fieldStatuses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem" }, children: "No field-crop assignments found. Set up your fields and crops first." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Field", "Crop / Variety", "Area (ha)", "Status", "Last Harvest", "Yield", "Moisture"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.6rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: fieldStatuses.sort((a, b) => {
              if (a.status === b.status) return (a.fieldName || "").localeCompare(b.fieldName || "");
              return a.status === "pending" ? -1 : 1;
            }).map((fc, i) => {
              const lastRec = fc.harvestRecords?.slice().sort(
                (a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime()
              )[0];
              const totalFieldTonnes = fc.harvestRecords?.reduce((s, r) => s + (parseFloat(r.yieldTonnes) || 0), 0) ?? 0;
              fc.harvestRecords?.reduce((s, r) => s + (parseFloat(r.areaHarvestedHa) || 0), 0) ?? 0;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6", background: fc.status === "pending" ? "transparent" : "#fafffe" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem", fontWeight: 600, color: "#111827" }, children: fc.fieldName || `Field #${fc.fieldId}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.65rem 0.875rem", color: "#374151" }, children: [
                  fc.cropName || "—",
                  fc.cropVariety ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af", fontSize: "0.75rem" }, children: [
                    " · ",
                    fc.cropVariety
                  ] }) : null
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem", color: "#6b7280" }, children: fc.areaHectares ? parseFloat(String(fc.areaHectares)).toFixed(2) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FieldStatusPill, { status: fc.status }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: lastRec ? fmt(lastRec.harvestDate) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem", fontWeight: 600, color: "#166534" }, children: totalFieldTonnes > 0 ? `${totalFieldTonnes.toFixed(1)} t` : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.65rem 0.875rem", color: "#6b7280" }, children: lastRec?.moisturePercent ? `${lastRec.moisturePercent}%` : "—" })
              ] }, fc.id);
            }) })
          ] })
        ] })
      ] })
    ] }),
    hoveredDay && tooltipPos && (() => {
      const dayRecs = harvests.filter(
        (r) => r.harvestDate && new Date(r.harvestDate).toISOString().slice(0, 10) === hoveredDay
      );
      return /* @__PURE__ */ jsxRuntimeExports.jsx(HarvestDayTooltip, { day: hoveredDay, records: dayRecs, pos: tooltipPos });
    })()
  ] });
}
export {
  HarvestDashboard as default
};
