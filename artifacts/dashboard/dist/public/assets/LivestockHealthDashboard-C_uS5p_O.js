import { b as useAppStore, u as useLocation, m as useQuery, j as jsxRuntimeExports } from "./index-Bd-r42pU.js";
import { A as AppLayout, H as HeartPulse } from "./AppLayout-BanleXYV.js";
import { C as ChevronRight } from "./tractor-Bmlnur2O.js";
import { S as ShieldAlert } from "./shield-alert-DWs-PSsT.js";
import { T as TriangleAlert } from "./triangle-alert-Cu9EpiaP.js";
import { P as Pill } from "./pill-CcGraYsr.js";
import { a as Clock } from "./database-DVm6kjB5.js";
import { C as CircleCheck } from "./circle-check-Cn18BXmO.js";
import "./use-safe-clerk-CYaLgRwx.js";
import "./trash-2-CzpE_E7W.js";
import "./shield-check-B1cZod9y.js";
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 864e5);
}
function fmt(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
function WithdrawalBadge({ days }) {
  if (days === null) return null;
  if (days < 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#166534", background: "#dcfce7", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 11 }),
    " Cleared"
  ] });
  if (days <= 3) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#991b1b", background: "#fee2e2", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 11 }),
    " ",
    days,
    "d remaining — URGENT"
  ] });
  if (days <= 14) return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#92400e", background: "#fef3c7", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11 }),
    " ",
    days,
    "d remaining"
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "#1d4ed8", background: "#dbeafe", borderRadius: 999, padding: "2px 10px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 11 }),
    " ",
    days,
    "d remaining"
  ] });
}
const SPECIES_COLOURS = {
  cattle: { bg: "#f0fdf4", text: "#166534" },
  sheep: { bg: "#fffbeb", text: "#92400e" },
  pigs: { bg: "#fdf4ff", text: "#7e22ce" },
  poultry: { bg: "#fff7ed", text: "#c2410c" },
  goats: { bg: "#f0f9ff", text: "#0369a1" },
  other: { bg: "#f9fafb", text: "#374151" }
};
function specieColour(type) {
  const key = (type || "other").toLowerCase();
  return SPECIES_COLOURS[key] || SPECIES_COLOURS.other;
}
function LivestockHealthDashboard() {
  const { farmId } = useAppStore();
  const [, navigate] = useLocation();
  const herdsQ = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const medicineQ = useQuery({
    queryKey: ["medicine-records", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/medicine-records`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const herds = herdsQ.data ?? [];
  const medicine = medicineQ.data ?? [];
  const loading = herdsQ.isLoading || medicineQ.isLoading;
  const now = /* @__PURE__ */ new Date();
  now.setHours(0, 0, 0, 0);
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const activeWithdrawals = medicine.filter(
    (m) => m.withdrawalEndDate && daysUntil(m.withdrawalEndDate) !== null && daysUntil(m.withdrawalEndDate) >= 0
  ).sort((a, b) => daysUntil(a.withdrawalEndDate) - daysUntil(b.withdrawalEndDate));
  const thisWeekTreatments = medicine.filter((m) => {
    if (!m.administeredDate) return false;
    const d = new Date(m.administeredDate);
    d.setHours(0, 0, 0, 0);
    return d >= weekAgo && d <= now;
  });
  const todayTreatments = medicine.filter((m) => {
    if (!m.administeredDate) return false;
    return new Date(m.administeredDate).toISOString().slice(0, 10) === todayStr;
  });
  const urgentWithdrawals = activeWithdrawals.filter((m) => (daysUntil(m.withdrawalEndDate) ?? 99) <= 3);
  const herdMap = new Map(herds.map((h) => [h.id, h]));
  const herdMedicineCount = /* @__PURE__ */ new Map();
  medicine.forEach((m) => {
    if (m.herdId) herdMedicineCount.set(m.herdId, (herdMedicineCount.get(m.herdId) || 0) + 1);
  });
  if (!farmId) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Livestock & Poultry Health", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "4rem 2rem", textAlign: "center", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { size: 40, style: { margin: "0 auto 1rem" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#6b7280" }, children: "Select a farm to view the health dashboard" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Livestock & Poultry Health", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Withdrawal period tracking, active treatments, and herd health overview." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/medicine"), style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "#7c3aed", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer" }, children: [
          "Medicine Records ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/livestock"), style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 600, color: "#166534", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.4rem 0.9rem", cursor: "pointer" }, children: [
          "Herd Register ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 14 })
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }, children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 88, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, animation: "pulse 1.5s infinite" } }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      urgentWithdrawals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "flex-start", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { size: 18, color: "#dc2626", style: { marginTop: 1, flexShrink: 0 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 700, color: "#dc2626", fontSize: "0.9rem" }, children: [
            "Urgent — ",
            urgentWithdrawals.length,
            " withdrawal period",
            urgentWithdrawals.length > 1 ? "s" : "",
            " expiring within 3 days"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }, children: [
            urgentWithdrawals.map((m) => m.medicineName).join(", "),
            " — do not send affected animals for slaughter until clearance date has passed."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: "1.5rem" }, children: [
        { label: "Active Herds / Flocks", value: herds.filter((h) => h.isActive !== false).length, bg: "#f0fdf4", iconBg: "#dcfce7", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { size: 18, color: "#15803d" }) },
        { label: "In Withdrawal", value: activeWithdrawals.length, bg: activeWithdrawals.length > 0 ? "#fffbeb" : "#f9fafb", iconBg: activeWithdrawals.length > 0 ? "#fef3c7" : "#f3f4f6", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 18, color: activeWithdrawals.length > 0 ? "#d97706" : "#9ca3af" }) },
        { label: "Treated This Week", value: thisWeekTreatments.length, bg: "#eff6ff", iconBg: "#dbeafe", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { size: 18, color: "#1d4ed8" }) },
        { label: "Treated Today", value: todayTreatments.length, bg: "#f5f3ff", iconBg: "#ede9fe", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 18, color: "#7c3aed" }) }
      ].map(({ label, value, bg, iconBg, icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: iconBg, borderRadius: 8, padding: 8, flexShrink: 0 }, children: icon }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 600 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.375rem", fontWeight: 700, color: "#111827" }, children: value })
        ] })
      ] }, label)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "1.5rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 15, color: "#d97706" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: "Active Withdrawal Periods" }),
            activeWithdrawals.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", fontSize: "0.75rem", fontWeight: 700, color: "#dc2626" }, children: [
              activeWithdrawals.length,
              " active"
            ] })
          ] }),
          activeWithdrawals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 24, style: { margin: "0 auto 0.5rem", color: "#86efac" } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem", fontWeight: 600, color: "#15803d" }, children: "No animals currently in withdrawal" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: activeWithdrawals.map((m) => {
            const days = daysUntil(m.withdrawalEndDate);
            const herd = m.herdId ? herdMap.get(m.herdId) : null;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.75rem 1.25rem", borderBottom: "1px solid #f9fafb", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.875rem", color: "#111827" }, children: m.medicineName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 1 }, children: [
                  herd ? herd.name : "Individual animal",
                  m.administeredBy ? ` · ${m.administeredBy}` : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 1 }, children: [
                  "Clearance: ",
                  fmt(m.withdrawalEndDate)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(WithdrawalBadge, { days })
            ] }, m.id);
          }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 15, color: "#1d4ed8" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: "Treatments This Week" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", fontSize: "0.75rem", color: "#9ca3af" }, children: [
              thisWeekTreatments.length,
              " recorded"
            ] })
          ] }),
          thisWeekTreatments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem" }, children: "No treatments recorded in the last 7 days" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            thisWeekTreatments.slice(0, 8).map((m) => {
              const herd = m.herdId ? herdMap.get(m.herdId) : null;
              const isToday = m.administeredDate && new Date(m.administeredDate).toISOString().slice(0, 10) === todayStr;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.65rem 1.25rem", borderBottom: "1px solid #f9fafb", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, fontSize: "0.85rem", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: m.medicineName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: [
                    herd ? herd.name : "—",
                    m.dosage ? ` · ${m.dosage}` : ""
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "right", flexShrink: 0 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#374151" }, children: new Date(m.administeredDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) }),
                  isToday && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.65rem", fontWeight: 700, color: "#15803d", background: "#dcfce7", borderRadius: 4, padding: "1px 5px" }, children: "TODAY" })
                ] })
              ] }, m.id);
            }),
            thisWeekTreatments.length > 8 && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/medicine", style: { display: "block", padding: "0.5rem 1.25rem", fontSize: "0.75rem", color: "#2563eb", fontWeight: 600, textDecoration: "none" }, children: [
              "+",
              thisWeekTreatments.length - 8,
              " more — View all in Medicine →"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.875rem 1.25rem", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(HeartPulse, { size: 15, color: "#374151" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 700, fontSize: "0.9rem", color: "#111827" }, children: "Herd & Flock Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", fontSize: "0.75rem", color: "#9ca3af" }, children: [
            herds.length,
            " registered"
          ] })
        ] }),
        herds.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "2rem 1.25rem", textAlign: "center", color: "#9ca3af" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.85rem" }, children: "No herds or flocks registered. Add them via the Herd Register." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, padding: "1rem" }, children: herds.map((h) => {
          const col = specieColour(h.type);
          const medCount = herdMedicineCount.get(h.id) || 0;
          const activeW = activeWithdrawals.filter((m) => m.herdId === h.id).length;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: col.bg, border: "1px solid #e5e7eb", borderRadius: 10, padding: "0.875rem 1rem" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 700, color: "#111827", fontSize: "0.9rem" }, children: h.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: col.text, fontWeight: 600, textTransform: "capitalize", marginTop: 1 }, children: [
                  h.type || "Unknown",
                  h.breed ? ` · ${h.breed}` : ""
                ] })
              ] }),
              activeW > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.65rem", fontWeight: 700, color: "#92400e", background: "#fef3c7", borderRadius: 4, padding: "2px 6px" }, children: [
                activeW,
                " withdrawal",
                activeW > 1 ? "s" : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 8, display: "flex", gap: 12 }, children: [
              h.herdNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#6b7280" }, children: [
                "Herd No: ",
                h.herdNumber
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#6b7280" }, children: [
                medCount,
                " treatment",
                medCount !== 1 ? "s" : "",
                " recorded"
              ] })
            ] }),
            h.isActive === false && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 4 }, children: "Inactive" })
          ] }, h.id);
        }) })
      ] })
    ] })
  ] }) });
}
export {
  LivestockHealthDashboard as default
};
