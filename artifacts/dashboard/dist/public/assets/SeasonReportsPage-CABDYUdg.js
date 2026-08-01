import { q as createLucideIcon, b as useAppStore, r as reactExports, l as useQuery, j as jsxRuntimeExports, c as Button, d as LoaderCircle, T as FlaskConical } from "./index-BKcsQW2l.js";
import { h as herdSpeciesDisplayLabel, a as herdProductionSubtype } from "./herd-utils-DXn3XBS9.js";
import { g as gradeLabel } from "./harvestGrades-CRosQIUs.js";
import { A as AppLayout, a1 as FileChartColumn, a as Wheat, r as Bug, S as Sprout, a0 as Milk } from "./AppLayout-B8_1RkJL.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Cds8YET0.js";
import { T as TabBar, a as TabButton } from "./tab-button-BR2o9ThO.js";
import { b as buildProReport } from "./print-report-B_FwCCVJ.js";
import { P as Printer } from "./printer-BplHN2gK.js";
import { C as CircleAlert } from "./database-BbsdnltO.js";
import { L as Leaf, T as TriangleAlert } from "./triangle-alert-DP76btZo.js";
import { C as CircleCheck } from "./circle-check-aL4uVv-H.js";
import { T as Tractor, C as ChevronRight } from "./tractor-BHt8CiXS.js";
import { C as ChevronDown } from "./trash-2-PNmQtpsZ.js";
import "./use-safe-clerk-C3AlvsMT.js";
import "./shield-alert-CPHe-hz7.js";
import "./shield-check-CWBpqMg4.js";
import "./index-kuvxhwVM.js";
import "./index-AB_R5gev.js";
import "./chevron-up-BvI8mfC2.js";
const __iconNode = [
  [
    "path",
    {
      d: "M16.4 13.7A6.5 6.5 0 1 0 6.28 6.6c-1.1 3.13-.78 3.9-3.18 6.08A3 3 0 0 0 5 18c4 0 8.4-1.8 11.4-4.3",
      key: "cisjcv"
    }
  ],
  [
    "path",
    {
      d: "m18.5 6 2.19 4.5a6.48 6.48 0 0 1-2.29 7.2C15.4 20.2 11 22 7 22a3 3 0 0 1-2.68-1.66L2.4 16.5",
      key: "5byaag"
    }
  ],
  ["circle", { cx: "12.5", cy: "8.5", r: "2.5", key: "9738u8" }]
];
const Beef = createLucideIcon("beef", __iconNode);
const fmt2 = (n, dp = 2) => {
  if (n == null || isNaN(n)) return "—";
  return n.toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
};
const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtPence = (p) => {
  if (!p) return "—";
  return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
function StatCard({ label, value, sub, color = "#166534", bg = "#f0fdf4", border = "#bbf7d0" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: "0.875rem 1.125rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#6b7280", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 700, color, lineHeight: 1 }, children: value }),
    sub && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.72rem", color: "#9ca3af", marginTop: 3 }, children: sub })
  ] });
}
function MiniTable({ headers, rows, emptyMsg }) {
  if (rows.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#9ca3af", padding: "0.5rem 0", fontStyle: "italic" }, children: emptyMsg ?? "No records" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb" }, children: headers.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "5px 8px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid #e5e7eb", whiteSpace: "nowrap" }, children: h }, h)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: i % 2 === 1 ? "#f9fafb" : "#fff" }, children: row.map((cell, j) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "4px 8px", borderBottom: "1px solid #f3f4f6", color: "#374151", verticalAlign: "top", whiteSpace: j === 0 ? "nowrap" : void 0 }, children: cell ?? "—" }, j)) }, i)) })
  ] }) });
}
function FieldCard({ fieldData, defaultOpen = false }) {
  const [open, setOpen] = reactExports.useState(defaultOpen);
  const [section, setSection] = reactExports.useState("ops");
  const { field, assignments, sprays, drilling, operations, harvests, summary } = fieldData;
  const cropLabel = assignments.length > 0 ? assignments.map((a) => `${a.cropName}${a.cropVariety ? ` (${a.cropVariety})` : ""}`).join(", ") : "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 10, overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        style: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: open ? "#f0fdf4" : "#fff", cursor: "pointer", border: "none", textAlign: "left" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.9rem", fontWeight: 700, color: "#1a3a1a" }, children: field.name }),
            field.fieldReference && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", background: "#e5e7eb", color: "#374151", padding: "1px 6px", borderRadius: 4 }, children: field.fieldReference }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.78rem", color: "#6b7280" }, children: [
              fmt2(parseFloat(field.areaHectares), 2),
              " ha"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.78rem", color: "#059669", fontWeight: 500 }, children: cropLabel })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 16 }, children: [
            summary.totalYieldTonnes > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.78rem", color: "#166534", fontWeight: 600 }, children: [
              fmt2(summary.totalYieldTonnes, 2),
              " t · ",
              fmt2(summary.yieldTHa, 2),
              " t/ha"
            ] }),
            summary.totalMachineHours > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#6b7280" }, children: [
              fmt2(summary.totalMachineHours, 1),
              " mach. hrs"
            ] }),
            open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-gray-400" })
          ] })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.75rem 1rem", borderTop: "1px solid #e5e7eb" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginBottom: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Yield", value: summary.totalYieldTonnes > 0 ? `${fmt2(summary.totalYieldTonnes, 2)} t` : "—", sub: summary.yieldTHa > 0 ? `${fmt2(summary.yieldTHa, 2)} t/ha` : void 0, color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Area Harvested", value: summary.totalAreaHarvestedHa > 0 ? `${fmt2(summary.totalAreaHarvestedHa, 2)} ha` : "—", color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Machine Hours", value: summary.totalMachineHours > 0 ? fmt2(summary.totalMachineHours, 1) : "—", sub: summary.totalLabourHours > 0 ? `${fmt2(summary.totalLabourHours, 1)} labour hrs` : void 0, color: "#d97706", bg: "#fffbeb", border: "#fde68a" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Operations Cost", value: summary.machineCostPence > 0 ? fmtPence(summary.machineCostPence) : "—", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Spray Applications", value: String(summary.sprayCount), color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }, children: [
        { key: "ops", label: `Operations (${operations.length})`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { className: "w-3.5 h-3.5" }) },
        { key: "sprays", label: `Sprays (${sprays.length})`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3.5 h-3.5" }) },
        { key: "drilling", label: `Drilling (${drilling.length})`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "w-3.5 h-3.5" }) },
        { key: "harvest", label: `Harvest (${harvests.length})`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { className: "w-3.5 h-3.5" }) }
      ].map(({ key, label, icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setSection(key),
          style: { display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, fontSize: "0.78rem", fontWeight: section === key ? 600 : 400, background: section === key ? "#1a3a1a" : "#f3f4f6", color: section === key ? "#fff" : "#374151", border: "none", cursor: "pointer" },
          children: [
            icon,
            label
          ]
        },
        key
      )) }),
      section === "ops" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MiniTable,
        {
          headers: ["Date", "Operation", "Implement", "Area (ha)", "Mach. Hrs", "Labour Hrs", "Operator", "Cost"],
          rows: operations.map((o) => [
            fmtDate(o.operationDate),
            o.operationType,
            o.implement ?? (o.vehicleDescription ?? "—"),
            o.areaHa ? fmt2(parseFloat(o.areaHa), 2) : "—",
            o.machineHours ? fmt2(parseFloat(o.machineHours), 1) : "—",
            o.labourHours ? fmt2(parseFloat(o.labourHours), 1) : "—",
            o.isContractor ? `Contractor${o.contractorName ? `: ${o.contractorName}` : ""}` : o.operator ?? "—",
            o.isContractor ? fmtPence(o.contractorCostPence) : o.machineRatePence || o.labourRatePence ? fmtPence(Math.round((parseFloat(o.machineHours ?? "0") || 0) * (o.machineRatePence ?? 0)) + Math.round((parseFloat(o.labourHours ?? "0") || 0) * (o.labourRatePence ?? 0))) : "—"
          ]),
          emptyMsg: "No field operations recorded for this field in the selected year"
        }
      ),
      section === "sprays" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MiniTable,
        {
          headers: ["Date", "Product", "Category", "Rate", "Area (ha)", "Water (L)", "Operator"],
          rows: sprays.map((s) => [
            fmtDate(s.applicationDate),
            s.productName ?? "—",
            s.category ?? "—",
            s.applicationRate ? `${fmt2(parseFloat(s.applicationRate), 3)} ${s.rateUnit ?? ""}`.trim() : "—",
            s.areaSprayedHa ? fmt2(parseFloat(s.areaSprayedHa), 2) : "—",
            s.waterVolumeLitres ? fmt2(parseFloat(s.waterVolumeLitres), 0) : "—",
            s.operatorName ?? "—"
          ]),
          emptyMsg: "No spray applications recorded for this field in the selected year"
        }
      ),
      section === "drilling" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MiniTable,
        {
          headers: ["Date", "Crop", "Variety", "Lot No.", "Seed Rate", "Area Seeded (ha)", "Operator"],
          rows: drilling.map((d) => [
            fmtDate(d.drillingDate),
            d.cropName,
            d.variety ?? "—",
            d.seedLotNumber ?? "—",
            d.seedRate ? `${fmt2(parseFloat(d.seedRate), 2)} ${d.seedRateUnit ?? ""}`.trim() : "—",
            d.areaSeededHa ? fmt2(parseFloat(d.areaSeededHa), 2) : "—",
            d.operator ?? "—"
          ]),
          emptyMsg: "No drilling records for this field in the selected year"
        }
      ),
      section === "harvest" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MiniTable,
        {
          headers: ["Date", "Yield (t)", "Area (ha)", "Yield (t/ha)", "Moisture %", "Grade", "Operator"],
          rows: harvests.map((h) => {
            const yt = parseFloat(h.yieldTonnes ?? "0") || 0;
            const ah = parseFloat(h.areaHarvestedHa ?? "0") || 0;
            return [
              fmtDate(h.harvestDate),
              yt > 0 ? fmt2(yt, 2) : "—",
              ah > 0 ? fmt2(ah, 2) : "—",
              yt > 0 && ah > 0 ? fmt2(yt / ah, 2) : "—",
              h.moisturePercent ? `${fmt2(parseFloat(h.moisturePercent), 1)}%` : "—",
              gradeLabel(h.qualityGrade),
              h.operatorName ?? "—"
            ];
          }),
          emptyMsg: "No harvest records for this field in the selected year"
        }
      )
    ] })
  ] });
}
function HerdCard({ herdData }) {
  const [open, setOpen] = reactExports.useState(true);
  const [section, setSection] = reactExports.useState("movements");
  const { herd, movements, medicines, milk, mortality, feed, summary } = herdData;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid #e5e7eb", borderRadius: 10, marginBottom: 10, overflow: "hidden" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setOpen((o) => !o),
        style: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", background: open ? "#fef3c7" : "#fff", cursor: "pointer", border: "none", textAlign: "left" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.9rem", fontWeight: 700, color: "#92400e" }, children: herd.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.78rem", color: "#6b7280" }, children: [
              herd.type ? herdSpeciesDisplayLabel(herd.type) + (herdProductionSubtype(herd.type) ? ` (${herdProductionSubtype(herd.type)})` : "") : "—",
              herd.breed ? ` · ${herd.breed}` : ""
            ] }),
            herd.herdNumber && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.72rem", background: "#e5e7eb", color: "#374151", padding: "1px 6px", borderRadius: 4 }, children: herd.herdNumber })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#059669" }, children: [
              "↑",
              summary.movementIn,
              " in"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#dc2626" }, children: [
              "↓",
              summary.movementOut,
              " out"
            ] }),
            summary.deaths > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#9ca3af" }, children: [
              summary.deaths,
              " deaths"
            ] }),
            summary.totalMilkLitres > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#3b82f6" }, children: [
              Math.round(summary.totalMilkLitres).toLocaleString("en-GB"),
              " L milk"
            ] }),
            open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-gray-400" })
          ] })
        ]
      }
    ),
    open && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.75rem 1rem", borderTop: "1px solid #e5e7eb" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Movements In", value: String(summary.movementIn), color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Movements Out", value: String(summary.movementOut), color: "#dc2626", bg: "#fef2f2", border: "#fecaca" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Mortalities", value: String(summary.deaths), color: "#374151", bg: "#f9fafb", border: "#e5e7eb" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Medicine Records", value: String(summary.medicineCount), color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" }),
        summary.totalMilkLitres > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Milk Yield", value: `${Math.round(summary.totalMilkLitres).toLocaleString("en-GB")} L`, color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" }),
        summary.totalFeedKg > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Feed Used", value: `${Math.round(summary.totalFeedKg).toLocaleString("en-GB")} kg`, color: "#d97706", bg: "#fffbeb", border: "#fde68a" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }, children: [
        { key: "movements", label: `Movements (${movements.length})`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Beef, { className: "w-3.5 h-3.5" }) },
        { key: "medicines", label: `Medicines (${medicines.length})`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3.5 h-3.5" }) },
        { key: "milk", label: `Milk Records (${milk.length})`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Milk, { className: "w-3.5 h-3.5" }) },
        { key: "feed", label: `Feed Records (${feed.length})`, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "w-3.5 h-3.5" }) }
      ].map(({ key, label, icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setSection(key),
          style: { display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, fontSize: "0.78rem", fontWeight: section === key ? 600 : 400, background: section === key ? "#92400e" : "#f3f4f6", color: section === key ? "#fff" : "#374151", border: "none", cursor: "pointer" },
          children: [
            icon,
            label
          ]
        },
        key
      )) }),
      section === "movements" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MiniTable,
        {
          headers: ["Date", "Type", "No. Animals", "From", "To", "Licence No.", "Species"],
          rows: movements.map((m) => [
            fmtDate(m.movementDate),
            m.movementType,
            m.numberOfAnimals ?? 1,
            m.fromLocation ?? "—",
            m.toLocation ?? "—",
            m.licenceNumber ?? "—",
            m.species ?? "—"
          ]),
          emptyMsg: "No movements recorded for this enterprise in the selected year"
        }
      ),
      section === "medicines" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MiniTable,
        {
          headers: ["Date", "Medicine", "Dosage", "Route", "Animals Treated", "Withdrawal (days)", "Administered By"],
          rows: medicines.map((m) => [
            fmtDate(m.administeredDate),
            m.medicineName,
            m.dosage ?? "—",
            m.administrationRoute ?? "—",
            m.treatedAnimalCount != null ? m.treatedAnimalCount : m.treatmentScope ?? "—",
            m.withdrawalPeriodDays ?? "—",
            m.administeredBy ?? "—"
          ]),
          emptyMsg: "No medicine records for this enterprise in the selected year"
        }
      ),
      section === "milk" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MiniTable,
        {
          headers: ["Date", "Session", "Yield (L)", "Fat %", "Protein %", "Lactose %", "SCC (000s)", "Antibiotic Test"],
          rows: milk.map((m) => [
            fmtDate(m.recordDate),
            m.sessionType ?? m.recordType ?? "—",
            m.yieldLitres ? fmt2(parseFloat(m.yieldLitres), 0) : "—",
            m.fatPercent ? `${fmt2(parseFloat(m.fatPercent), 2)}%` : "—",
            m.proteinPercent ? `${fmt2(parseFloat(m.proteinPercent), 2)}%` : "—",
            m.lactosePercent ? `${fmt2(parseFloat(m.lactosePercent), 2)}%` : "—",
            m.sccThousands ?? "—",
            m.antibioticResidueTestResult ?? "—"
          ]),
          emptyMsg: "No milk records for this enterprise in the selected year"
        }
      ),
      section === "feed" && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MiniTable,
        {
          headers: ["Date", "Feed Type", "Quantity (kg)", "Supplier", "Batch No."],
          rows: feed.map((f) => [
            fmtDate(f.feedDate),
            f.feedType,
            f.quantityKg ? fmt2(parseFloat(f.quantityKg), 0) : "—",
            f.supplier ?? "—",
            f.batchNumber ?? "—"
          ]),
          emptyMsg: "No feed records for this enterprise in the selected year"
        }
      )
    ] })
  ] });
}
function buildSeasonPrintDoc(data, year) {
  const { farm, farmSummary, arableFields, livestockHerds } = data;
  const avgYield = farmSummary.arable.totalAreaHarvestedHa > 0 ? farmSummary.arable.totalYieldTonnes / farmSummary.arable.totalAreaHarvestedHa : 0;
  let arableHtml = `
<div class="section-head">Arable Summary — Crop Year ${year}</div>
<table>
<thead><tr><th>Field</th><th>Ref</th><th>Area (ha)</th><th>Crop / Variety</th><th>Drilling Date</th><th>Harvest Date</th><th>Yield (t)</th><th>Yield (t/ha)</th><th>Moisture %</th><th>Mach. Hrs</th><th>Labour Hrs</th><th>Ops Cost</th><th>Spray Apps</th></tr></thead>
<tbody>
${arableFields.map((f) => {
    const crop = f.assignments.map((a) => `${a.cropName}${a.cropVariety ? ` (${a.cropVariety})` : ""}`).join(", ") || "—";
    const drillDate = f.drilling.length > 0 ? fmtDate(f.drilling[0].drillingDate) : f.assignments.length > 0 && f.assignments[0].plantingDate ? fmtDate(f.assignments[0].plantingDate) : "—";
    const harvestDate = f.harvests.length > 0 ? fmtDate(f.harvests[0].harvestDate) : "—";
    const moisture = f.harvests.length > 0 && f.harvests[0].moisturePercent ? `${fmt2(parseFloat(f.harvests[0].moisturePercent), 1)}%` : "—";
    return `<tr>
<td>${f.field.name}</td>
<td>${f.field.fieldReference ?? "—"}</td>
<td>${fmt2(parseFloat(f.field.areaHectares ?? "0"), 2)}</td>
<td>${crop}</td>
<td>${drillDate}</td>
<td>${harvestDate}</td>
<td>${f.summary.totalYieldTonnes > 0 ? fmt2(f.summary.totalYieldTonnes, 2) : "—"}</td>
<td>${f.summary.yieldTHa > 0 ? fmt2(f.summary.yieldTHa, 2) : "—"}</td>
<td>${moisture}</td>
<td>${f.summary.totalMachineHours > 0 ? fmt2(f.summary.totalMachineHours, 1) : "—"}</td>
<td>${f.summary.totalLabourHours > 0 ? fmt2(f.summary.totalLabourHours, 1) : "—"}</td>
<td>${f.summary.machineCostPence > 0 ? fmtPence(f.summary.machineCostPence) : "—"}</td>
<td>${f.summary.sprayCount}</td>
</tr>`;
  }).join("")}
<tr style="background:#1a3a1a;color:#fff;font-weight:700;">
<td colspan="2">TOTALS</td>
<td>${fmt2(farmSummary.arable.totalCroppedAreaHa, 2)}</td>
<td>—</td><td>—</td><td>—</td>
<td>${farmSummary.arable.totalYieldTonnes > 0 ? fmt2(farmSummary.arable.totalYieldTonnes, 2) : "—"}</td>
<td>${avgYield > 0 ? fmt2(avgYield, 2) : "—"}</td>
<td>—</td>
<td>${farmSummary.arable.totalMachineHours > 0 ? fmt2(farmSummary.arable.totalMachineHours, 1) : "—"}</td>
<td>${farmSummary.arable.totalLabourHours > 0 ? fmt2(farmSummary.arable.totalLabourHours, 1) : "—"}</td>
<td>${farmSummary.arable.totalMachCostPence > 0 ? fmtPence(farmSummary.arable.totalMachCostPence) : "—"}</td>
<td>${farmSummary.arable.totalSprayApps}</td>
</tr>
</tbody>
</table>`;
  arableFields.forEach((f) => {
    if (f.sprays.length === 0) return;
    arableHtml += `
<div class="section-head" style="margin-top:14px">${f.field.name} — Spray Applications</div>
<table>
<thead><tr><th>Date</th><th>Product</th><th>Category</th><th>Rate</th><th>Area (ha)</th><th>Water Vol (L)</th><th>Operator</th><th>Reason</th></tr></thead>
<tbody>
${f.sprays.map((s) => `<tr>
<td>${fmtDate(s.applicationDate)}</td>
<td>${s.productName ?? "—"}</td>
<td>${s.category ?? "—"}</td>
<td>${s.applicationRate ? `${fmt2(parseFloat(s.applicationRate), 3)} ${s.rateUnit ?? ""}`.trim() : "—"}</td>
<td>${s.areaSprayedHa ? fmt2(parseFloat(s.areaSprayedHa), 2) : "—"}</td>
<td>${s.waterVolumeLitres ? fmt2(parseFloat(s.waterVolumeLitres), 0) : "—"}</td>
<td>${s.operatorName ?? "—"}</td>
<td>${s.reasonForApplication ?? "—"}</td>
</tr>`).join("")}
</tbody></table>`;
  });
  let livestockHtml = "";
  if (livestockHerds.length > 0) {
    livestockHtml += `<div class="section-head" style="margin-top:18px">Livestock & Dairy Summary — ${year}</div>
<table>
<thead><tr><th>Enterprise</th><th>Type / Breed</th><th>Herd No.</th><th>Movements In</th><th>Movements Out</th><th>Mortalities</th><th>Medicine Records</th><th>Total Milk (L)</th><th>Total Feed (kg)</th></tr></thead>
<tbody>
${livestockHerds.map((h) => `<tr>
<td>${h.herd.name}</td>
<td>${h.herd.type ? herdSpeciesDisplayLabel(h.herd.type) + (herdProductionSubtype(h.herd.type) ? ` (${herdProductionSubtype(h.herd.type)})` : "") : "—"}${h.herd.breed ? ` / ${h.herd.breed}` : ""}</td>
<td>${h.herd.herdNumber ?? "—"}</td>
<td>${h.summary.movementIn}</td>
<td>${h.summary.movementOut}</td>
<td>${h.summary.deaths}</td>
<td>${h.summary.medicineCount}</td>
<td>${h.summary.totalMilkLitres > 0 ? Math.round(h.summary.totalMilkLitres).toLocaleString("en-GB") : "—"}</td>
<td>${h.summary.totalFeedKg > 0 ? Math.round(h.summary.totalFeedKg).toLocaleString("en-GB") : "—"}</td>
</tr>`).join("")}
</tbody></table>`;
  }
  return buildProReport({
    title: `Season Report — ${year}`,
    subtitle: `Full-season field and livestock summary for crop year ${year}`,
    farmName: farm?.name,
    cphNumber: farm?.cphNumber,
    tableHtml: arableHtml + livestockHtml,
    landscape: true,
    footerNote: `Generated ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} · BDE Farm Trac · Barnett Davies Enterprises Ltd`
  });
}
function SeasonReportsPage() {
  const { farmId: currentFarmId } = useAppStore();
  const farmId = currentFarmId;
  const [tab, setTab] = reactExports.useState("arable");
  const [year, setYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const { data: yearsData } = useQuery({
    queryKey: ["season-report-years", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/available-years`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["season-report", farmId, year],
    queryFn: () => fetch(`/api/farms/${farmId}/reports/season-report?year=${year}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: fiveInFiveSummary } = useQuery({
    queryKey: ["blackgrass-five-in-five-summary", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/blackgrass-five-in-five/summary`).then((r) => r.ok ? r.json() : null),
    enabled: !!farmId
  });
  const { data: ipmPlansRaw } = useQuery({
    queryKey: ["ipm-plans-season", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/ipm-plans`).then((r) => r.json()).then((d) => d.plans ?? d.records ?? []),
    enabled: !!farmId
  });
  const { data: oaCertRaw } = useQuery({
    queryKey: ["oa-cert-season", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-arable/certification`).then((r) => r.ok ? r.json().then((d) => d.records ?? []) : []),
    enabled: !!farmId
  });
  const { data: oaConvRaw } = useQuery({
    queryKey: ["oa-conv-season", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-arable/field-conversion`).then((r) => r.ok ? r.json().then((d) => d.records ?? []) : []),
    enabled: !!farmId
  });
  const { data: oaHarvestRaw } = useQuery({
    queryKey: ["oa-harvest-season", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-arable/harvest-declarations`).then((r) => r.ok ? r.json().then((d) => d.records ?? []) : []),
    enabled: !!farmId
  });
  const { data: oaInputRaw } = useQuery({
    queryKey: ["oa-input-season", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-arable/input-records`).then((r) => r.ok ? r.json().then((d) => d.records ?? []) : []),
    enabled: !!farmId
  });
  const availableYears = reactExports.useMemo(() => {
    if (!yearsData?.years?.length) return [(/* @__PURE__ */ new Date()).getFullYear()];
    return yearsData.years;
  }, [yearsData]);
  const arableFields = data?.arableFields ?? [];
  const livestockHerds = data?.livestockHerds ?? [];
  const farmSummary = data?.farmSummary;
  const avgYield = farmSummary?.arable?.totalAreaHarvestedHa > 0 ? farmSummary.arable.totalYieldTonnes / farmSummary.arable.totalAreaHarvestedHa : 0;
  const ipmPlans = ipmPlansRaw ?? [];
  const ipmPlansForYear = ipmPlans.filter((p) => p.planYear === year || String(p.planYear) === String(year));
  const ipmAllPlansWithYear = ipmPlans.filter((p) => p.planYear != null);
  const oaCert = oaCertRaw ?? [];
  const oaConv = oaConvRaw ?? [];
  const oaHarvest = oaHarvestRaw ?? [];
  const oaInput = oaInputRaw ?? [];
  const oaHarvestForYear = oaHarvest.filter((h) => {
    const d = h.harvestDate || h.declarationDate || h.date || "";
    return d && new Date(d).getFullYear() === year;
  });
  const oaInputForYear = oaInput.filter((i) => {
    const d = i.applicationDate || i.recordDate || i.date || "";
    return d && new Date(d).getFullYear() === year;
  });
  const certifiedCount = oaConv.filter((c) => c.status === "certified" || c.conversionStatus === "certified").length;
  const inConversionCount = oaConv.filter((c) => c.status === "in_conversion" || c.conversionStatus === "in_conversion").length;
  const latestCert = oaCert.length > 0 ? oaCert[oaCert.length - 1] : null;
  function handlePrint() {
    if (!data) return;
    const html = buildSeasonPrintDoc(data, year);
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.addEventListener("afterprint", () => win.close());
      win.print();
    }, 600);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Season Reports", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1200, margin: "0 auto", padding: "0 0 2rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", flexWrap: "wrap", gap: 10 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileChartColumn, { className: "w-6 h-6 text-green-700" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { style: { fontSize: "1.2rem", fontWeight: 700, color: "#1a3a1a", margin: 0 }, children: "Season Reports" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.78rem", color: "#6b7280", margin: 0 }, children: "Field-by-field and enterprise-level review for the selected crop year" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(year), onValueChange: (v) => setYear(parseInt(v)), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 110 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, disabled: !data || isLoading, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1.5" }),
          "Print Report"
        ] })
      ] })
    ] }),
    isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200, gap: 10, color: "#6b7280" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Loading season data…" })
    ] }),
    isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "1rem", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.85rem" }, children: "Failed to load season report data. Please try again." })
    ] }),
    !isLoading && !isError && (data || tab === "ipm" || tab === "organic" || tab === "forage") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      (farmSummary != null || tab === "ipm" || tab === "organic" || tab === "forage") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: "1.25rem" }, children: tab === "arable" && farmSummary ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Fields in Crop", value: String(farmSummary.arable.fieldCount), sub: `${fmt2(farmSummary.arable.totalCroppedAreaHa, 1)} ha total` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Harvested", value: farmSummary.arable.totalYieldTonnes > 0 ? `${fmt2(farmSummary.arable.totalYieldTonnes, 1)} t` : "—", sub: farmSummary.arable.totalAreaHarvestedHa > 0 ? `from ${fmt2(farmSummary.arable.totalAreaHarvestedHa, 1)} ha` : void 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Average Yield", value: avgYield > 0 ? `${fmt2(avgYield, 2)} t/ha` : "—", color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Machine Hrs", value: farmSummary.arable.totalMachineHours > 0 ? fmt2(farmSummary.arable.totalMachineHours, 1) : "—", sub: farmSummary.arable.totalLabourHours > 0 ? `${fmt2(farmSummary.arable.totalLabourHours, 1)} labour hrs` : void 0, color: "#d97706", bg: "#fffbeb", border: "#fde68a" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Operations Cost", value: farmSummary.arable.totalMachCostPence > 0 ? fmtPence(farmSummary.arable.totalMachCostPence) : "—", color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Spray Applications", value: String(farmSummary.arable.totalSprayApps), color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" })
      ] }) : tab === "livestock" && farmSummary ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Enterprises", value: String(farmSummary.livestock.herdCount), color: "#92400e", bg: "#fffbeb", border: "#fde68a" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Movements", value: String(farmSummary.livestock.totalMovements), color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Medicine Records", value: String(farmSummary.livestock.totalMedicineRecords), color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Total Milk (L)", value: farmSummary.livestock.totalMilkLitres > 0 ? Math.round(farmSummary.livestock.totalMilkLitres).toLocaleString("en-GB") : "—", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" })
      ] }) : tab === "ipm" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: `Plans — ${year}`, value: String(ipmPlansForYear.length), sub: ipmPlans.length > ipmPlansForYear.length ? `${ipmPlans.length} total` : void 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active", value: String(ipmPlansForYear.filter((p) => p.status === "active").length), color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Review Due", value: String(ipmPlansForYear.filter((p) => p.status === "review_due" || p.status === "review").length), color: "#d97706", bg: "#fffbeb", border: "#fde68a" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "All Years", value: String(ipmAllPlansWithYear.length), sub: "plans on file", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" })
      ] }) : tab === "organic" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Certified Fields", value: String(certifiedCount), color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "In Conversion", value: String(inConversionCount), color: "#d97706", bg: "#fffbeb", border: "#fde68a" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: `Harvests ${year}`, value: String(oaHarvestForYear.length), color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: `Inputs ${year}`, value: String(oaInputForYear.length), color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" })
      ] }) : tab === "forage" && data?.forageSummary ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Straw Batches", value: String(data.forageSummary.strawBatchCount), sub: data.forageSummary.strawTotalBales > 0 ? `${data.forageSummary.strawTotalBales} bales in` : void 0, color: "#92400e", bg: "#fffbeb", border: "#fde68a" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Straw Remaining", value: String(data.forageSummary.strawBalesRemaining), sub: "bales", color: "#d97706", bg: "#fff7ed", border: "#fed7aa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Silage Entries", value: String(data.forageSummary.silageEntries), sub: data.forageSummary.silageTotalTonnes > 0 ? `${fmt2(data.forageSummary.silageTotalTonnes, 1)} t` : void 0, color: "#166534", bg: "#f0fdf4", border: "#bbf7d0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Haylage Batches", value: String(data.forageSummary.haylageEntries), color: "#0f766e", bg: "#f0fdfa", border: "#99f6e4" })
      ] }) : null }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "arable", onClick: () => setTab("arable"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { className: "w-4 h-4 mr-1.5" }),
          "Arable & Cropping",
          farmSummary && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 6, fontSize: "0.72rem", background: tab === "arable" ? "#fff" : "#e5e7eb", color: tab === "arable" ? "#1a3a1a" : "#6b7280", padding: "1px 6px", borderRadius: 4 }, children: farmSummary.arable.fieldCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "livestock", onClick: () => setTab("livestock"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Beef, { className: "w-4 h-4 mr-1.5" }),
          "Livestock & Dairy",
          farmSummary && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 6, fontSize: "0.72rem", background: tab === "livestock" ? "#fff" : "#e5e7eb", color: tab === "livestock" ? "#1a3a1a" : "#6b7280", padding: "1px 6px", borderRadius: 4 }, children: farmSummary.livestock.herdCount })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "ipm", onClick: () => setTab("ipm"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bug, { className: "w-4 h-4 mr-1.5" }),
          "IPM Plans",
          ipmPlansForYear.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 6, fontSize: "0.72rem", background: tab === "ipm" ? "#fff" : "#e5e7eb", color: tab === "ipm" ? "#1a3a1a" : "#6b7280", padding: "1px 6px", borderRadius: 4 }, children: ipmPlansForYear.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "organic", onClick: () => setTab("organic"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-4 h-4 mr-1.5" }),
          "Organic Arable",
          oaConv.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 6, fontSize: "0.72rem", background: tab === "organic" ? "#fff" : "#e5e7eb", color: tab === "organic" ? "#1a3a1a" : "#6b7280", padding: "1px 6px", borderRadius: 4 }, children: oaConv.length })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "forage", onClick: () => setTab("forage"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "w-4 h-4 mr-1.5" }),
          "Forage & Straw",
          data?.forageSummary && data.forageSummary.strawBatchCount + data.forageSummary.silageEntries > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { marginLeft: 6, fontSize: "0.72rem", background: tab === "forage" ? "#fff" : "#e5e7eb", color: tab === "forage" ? "#1a3a1a" : "#6b7280", padding: "1px 6px", borderRadius: 4 }, children: data.forageSummary.strawBatchCount + data.forageSummary.silageEntries })
        ] })
      ] }),
      tab === "arable" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "1rem" }, children: [
        fiveInFiveSummary && fiveInFiveSummary.totalRiskFields > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginBottom: "1.25rem", borderRadius: 10, border: "1px solid #d1fae5", background: "#f0fdf4", overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.75rem 1rem", background: "#059669", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.9rem", fontWeight: 600 }, children: "Black-grass Five-in-Five — Farm Rollup" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.85rem", fontWeight: 700 }, children: [
              fiveInFiveSummary.fieldsMeetingTarget,
              "/",
              fiveInFiveSummary.totalRiskFields,
              " fields meeting ",
              fiveInFiveSummary.targetPillarCount,
              "+ pillars"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "0.9rem 1rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }, children: fiveInFiveSummary.fields.map((f) => {
            const strong = f.distinctPillarCount >= 4;
            const moderate = f.distinctPillarCount >= 2 && f.distinctPillarCount < 4;
            const dotColor = strong ? "#16a34a" : moderate ? "#d97706" : "#dc2626";
            const recs = f.recommendations ?? [];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.5rem 0.7rem", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: "0.8rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 6, fontWeight: 500, color: "#1f2937" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: dotColor, flexShrink: 0 } }),
                  f.fieldName
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                  f.moaRepetitionRisk && /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5", style: { color: "#dc2626" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 700, color: "#374151" }, children: [
                    f.distinctPillarCount,
                    "/5"
                  ] })
                ] })
              ] }),
              recs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 6, paddingTop: 6, borderTop: "1px dashed #e5e7eb", display: "flex", flexDirection: "column", gap: 3 }, children: [
                recs.slice(0, 3).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: r.severity === "high" ? "#b91c1c" : r.severity === "medium" ? "#b45309" : "#1d4ed8" }, children: [
                  "• ",
                  r.title
                ] }, r.key)),
                recs.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.72rem", color: "#9ca3af" }, children: [
                  "+",
                  recs.length - 3,
                  " more recommendation",
                  recs.length - 3 === 1 ? "" : "s"
                ] })
              ] })
            ] }, f.fieldId);
          }) })
        ] }),
        arableFields.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 500, color: "#374151", marginBottom: 4 }, children: [
            "No arable data for ",
            year
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.82rem" }, children: [
            "Field operations, spray records, and harvest data logged in ",
            year,
            " will appear here."
          ] })
        ] }) : arableFields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(FieldCard, { fieldData: f, defaultOpen: arableFields.length === 1 }, f.field.id))
      ] }),
      tab === "livestock" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: "1rem" }, children: livestockHerds.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Beef, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 500, color: "#374151", marginBottom: 4 }, children: [
          "No livestock data for ",
          year
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.82rem" }, children: [
          "Movements, medicine treatments, and milk records logged in ",
          year,
          " will appear here."
        ] })
      ] }) : livestockHerds.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(HerdCard, { herdData: h }, h.herd.id)) }),
      tab === "ipm" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: "1rem" }, children: ipmPlans.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bug, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 500, color: "#374151", marginBottom: 4 }, children: "No IPM plans found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.82rem" }, children: [
          "Create an IPM plan under ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sprays & Inputs → IPM" }),
          " to start recording monitoring observations and threshold breaches."
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        ipmPlansForYear.length === 0 && ipmPlans.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, padding: "0.75rem 1rem", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, marginBottom: "1rem", fontSize: "0.85rem", color: "#92400e" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 flex-shrink-0" }),
          "No IPM plans recorded for ",
          year,
          ". Showing all plans below."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.75rem 1rem", background: "#1a3a1a", display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bug, { className: "w-4 h-4 text-green-300" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#fff", fontWeight: 600, fontSize: "0.9rem" }, children: [
              "IPM Plans ",
              ipmPlansForYear.length > 0 ? `— ${year}` : "— All Years"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb" }, children: ["Plan Name", "Year", "Status", "Agronomist", "Valid From", "Valid To", "Review Date"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "8px 12px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (ipmPlansForYear.length > 0 ? ipmPlansForYear : ipmPlans).map((p, i) => {
              const statusColor = p.status === "active" ? { color: "#166534", bg: "#dcfce7" } : p.status === "review_due" || p.status === "review" ? { color: "#92400e", bg: "#fef3c7" } : p.status === "expired" ? { color: "#991b1b", bg: "#fee2e2" } : { color: "#6b7280", bg: "#f3f4f6" };
              const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 12px", fontWeight: 600, color: "#1f2937", fontSize: "0.85rem" }, children: p.name || p.planName || p.cropType || `Plan #${p.id}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 12px", color: "#6b7280", fontSize: "0.82rem" }, children: p.planYear ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 12px" }, children: p.status ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: "0.75rem", fontWeight: 600, background: statusColor.bg, color: statusColor.color }, children: p.status.replace(/_/g, " ") }) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 12px", color: "#374151", fontSize: "0.82rem" }, children: p.agronomist || p.agronomistName || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 12px", color: "#6b7280", fontSize: "0.82rem", whiteSpace: "nowrap" }, children: fmtD(p.validFrom || p.startDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 12px", color: "#6b7280", fontSize: "0.82rem", whiteSpace: "nowrap" }, children: fmtD(p.validTo || p.endDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 12px", color: "#6b7280", fontSize: "0.82rem", whiteSpace: "nowrap" }, children: fmtD(p.reviewDate) })
              ] }, p.id);
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginTop: "1rem", padding: "0.75rem 1rem", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: "0.82rem", color: "#166534" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-4 h-4 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Pest threshold entries and monitoring log observations are recorded under ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Sprays & Inputs → IPM" }),
            ". Use the monitoring log as evidence for SFI CIPM actions."
          ] })
        ] })
      ] }) }),
      tab === "organic" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }, children: [
        latestCert && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem 1.25rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-700" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontWeight: 600, color: "#14532d", fontSize: "0.9rem" }, children: "Organic Certification" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, fontSize: "0.82rem" }, children: [
            ["Certification Body", latestCert.certificationBody || latestCert.body || "—"],
            ["Certificate Number", latestCert.certificationNumber || latestCert.certNumber || "—"],
            ["Standard", latestCert.standard || latestCert.certificationStandard || "—"],
            ["Expiry", latestCert.expiryDate ? new Date(latestCert.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"]
          ].map(([label, val]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.72rem", margin: "0 0 2px" }, children: label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#15803d", margin: 0 }, children: val })
          ] }, label)) })
        ] }),
        oaConv.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.65rem 1rem", background: "#166534", display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-4 h-4 text-green-200" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#fff", fontWeight: 600, fontSize: "0.875rem" }, children: "Field Conversion Status" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb" }, children: ["Field / Parcel", "Area (ha)", "Status", "Conversion Start", "Certified From", "Notes"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "7px 12px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: oaConv.map((c, i) => {
              const st = c.status || c.conversionStatus || "";
              const stColor = st.includes("certified") ? "#166534" : st.includes("conversion") ? "#92400e" : "#6b7280";
              const stBg = st.includes("certified") ? "#dcfce7" : st.includes("conversion") ? "#fef3c7" : "#f3f4f6";
              const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600, color: "#1f2937", fontSize: "0.82rem" }, children: c.fieldName || c.parcelRef || c.field || `Field ${i + 1}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }, children: c.areaHa != null ? fmt2(c.areaHa, 2) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 600, background: stBg, color: stColor }, children: st ? st.replace(/_/g, " ") : "—" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }, children: fmtD(c.conversionStartDate || c.startDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }, children: fmtD(c.certifiedFromDate || c.certifiedFrom) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem", maxWidth: 200 }, children: c.notes || "—" })
              ] }, c.id ?? i);
            }) })
          ] })
        ] }),
        oaHarvestForYear.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.65rem 1rem", background: "#0f766e", display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { className: "w-4 h-4 text-teal-200" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#fff", fontWeight: 600, fontSize: "0.875rem" }, children: [
              "Harvest Declarations — ",
              year
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", fontSize: "0.78rem", color: "#99f6e4" }, children: [
              oaHarvestForYear.length,
              " record",
              oaHarvestForYear.length !== 1 ? "s" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb" }, children: ["Harvest Date", "Crop", "Field / Parcel", "Yield (t)", "Buyer / Destination", "Declaration Ref"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "7px 12px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: oaHarvestForYear.map((h, i) => {
              const d = h.harvestDate || h.declarationDate || h.date || "";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontSize: "0.82rem", whiteSpace: "nowrap" }, children: d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600, color: "#1f2937", fontSize: "0.82rem" }, children: h.cropType || h.crop || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }, children: h.fieldName || h.parcelRef || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }, children: h.yieldTonnes != null ? fmt2(h.yieldTonnes, 2) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }, children: h.buyerName || h.buyer || h.destination || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }, children: h.declarationRef || h.reference || "—" })
              ] }, h.id ?? i);
            }) })
          ] })
        ] }),
        oaInputForYear.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.65rem 1rem", background: "#7c3aed", display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-4 h-4 text-purple-200" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#fff", fontWeight: 600, fontSize: "0.875rem" }, children: [
              "Input Records — ",
              year
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", fontSize: "0.78rem", color: "#ddd6fe" }, children: [
              oaInputForYear.length,
              " record",
              oaInputForYear.length !== 1 ? "s" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb" }, children: ["Date", "Product", "Active Substance", "MAPP / PCS No.", "Quantity", "Field / Crop"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "7px 12px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: oaInputForYear.map((inp, i) => {
              const d = inp.applicationDate || inp.recordDate || inp.date || "";
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontSize: "0.82rem", whiteSpace: "nowrap" }, children: d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600, color: "#1f2937", fontSize: "0.82rem" }, children: inp.productName || inp.product || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }, children: inp.activeSubstance || inp.activeName || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }, children: inp.mappNumber || inp.pcsNumber || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }, children: inp.quantity != null ? `${inp.quantity} ${inp.unit || inp.uom || ""}`.trim() : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }, children: inp.fieldName || inp.cropType || "—" })
              ] }, inp.id ?? i);
            }) })
          ] })
        ] }),
        oaConv.length === 0 && oaHarvestForYear.length === 0 && oaInputForYear.length === 0 && !latestCert && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-10 h-10 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 500, color: "#374151", marginBottom: 4 }, children: "No organic arable records found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.82rem" }, children: [
            "Add field conversion status, harvest declarations and approved input records under ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Organic Arable" }),
            " in the main menu."
          ] })
        ] })
      ] }),
      tab === "forage" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }, children: [
        data?.strawBales && data.strawBales.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.65rem 1rem", background: "#92400e", display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { className: "w-4 h-4 text-amber-200" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#fff", fontWeight: 600, fontSize: "0.875rem" }, children: [
              "Straw Bale Inventory — ",
              year
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", fontSize: "0.78rem", color: "#fde68a" }, children: [
              data.strawBales.length,
              " batch",
              data.strawBales.length !== 1 ? "es" : ""
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb" }, children: ["Batch Ref", "Type", "Format", "Harvest", "Bales In", "Remaining", "Storage", "Biomass"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "7px 12px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: data.strawBales.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600, color: "#1f2937", fontSize: "0.82rem" }, children: b.batchRef ?? `Batch ${i + 1}` }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }, children: b.strawType ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }, children: b.baleFormat ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem", whiteSpace: "nowrap" }, children: b.harvestDate ? new Date(b.harvestDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }, children: b.quantityBales ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontSize: "0.82rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: (b.quantityRemaining ?? b.quantityBales) > 0 ? "#166534" : "#6b7280", fontWeight: 600 }, children: b.quantityRemaining ?? b.quantityBales ?? "—" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }, children: b.storageLocation ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontSize: "0.82rem" }, children: b.biomassContract ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: "0.72rem", fontWeight: 600, background: "#dcfce7", color: "#166534" }, children: "Yes" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "—" }) })
            ] }, b.id ?? i)) })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "1.25rem 1.5rem", textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { className: "w-8 h-8 mx-auto mb-2 text-amber-400 opacity-60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 500, color: "#92400e", marginBottom: 4, fontSize: "0.9rem" }, children: [
            "No straw bale inventory for ",
            year
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#d97706" }, children: "Add batches under Straw Management." })
        ] }),
        data?.silageStock && data.silageStock.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "0.65rem 1rem", background: "#166534", display: "flex", alignItems: "center", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "w-4 h-4 text-green-200" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#fff", fontWeight: 600, fontSize: "0.875rem" }, children: [
              "Silage & Haylage Stock — ",
              year
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { marginLeft: "auto", fontSize: "0.78rem", color: "#bbf7d0" }, children: [
              data.silageStock.length,
              " entr",
              data.silageStock.length !== 1 ? "ies" : "y"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb" }, children: ["Type", "Cut", "Source Field", "Harvest", "Qty In", "Used", "Remaining", "DM%", "Clamp"].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "7px 12px", textAlign: "left", fontSize: "0.72rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }, children: h }, h)) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: data.silageStock.map((s, i) => {
              const isBales = s.quantityBales != null;
              const qtyIn = isBales ? `${s.quantityBales ?? 0} bales` : s.quantityTonnes != null ? `${fmt2(parseFloat(String(s.quantityTonnes)), 1)} t` : "—";
              const used = isBales ? `${s.usedBales ?? 0} bales` : `${fmt2(s.usedTonnes ?? 0, 1)} t`;
              const rem = isBales ? s.remainingBales != null ? `${s.remainingBales} bales` : "—" : s.remainingTonnes != null ? `${fmt2(parseFloat(String(s.remainingTonnes)), 1)} t` : "—";
              const low = isBales ? s.quantityBales && (s.remainingBales ?? s.quantityBales) / s.quantityBales < 0.2 : s.quantityTonnes && (s.remainingTonnes ?? s.quantityTonnes) / parseFloat(String(s.quantityTonnes)) < 0.2;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderTop: i > 0 ? "1px solid #f3f4f6" : "none" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600, color: "#1f2937", fontSize: "0.82rem" }, children: s.cropType ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }, children: s.cutNumber ? `${s.cutNumber}` : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }, children: s.fieldOfOrigin ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem", whiteSpace: "nowrap" }, children: s.harvestDate ? new Date(s.harvestDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }, children: qtyIn }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#d97706", fontSize: "0.82rem" }, children: used }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", fontWeight: 600, color: low ? "#dc2626" : "#166534", fontSize: "0.82rem" }, children: rem }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#374151", fontSize: "0.82rem" }, children: s.dryMatterPercent != null ? `${s.dryMatterPercent}%` : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "8px 12px", color: "#6b7280", fontSize: "0.82rem" }, children: s.storeName ?? "—" })
              ] }, s.id ?? i);
            }) })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1.25rem 1.5rem", textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "w-8 h-8 mx-auto mb-2 text-green-400 opacity-60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 500, color: "#166534", marginBottom: 4, fontSize: "0.9rem" }, children: [
            "No silage or haylage stock recorded for ",
            year
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8rem", color: "#15803d" }, children: "Log cuts via Silage & Haylage in the Environmental module or via the mobile app." })
        ] })
      ] })
    ] })
  ] }) });
}
export {
  SeasonReportsPage as default
};
