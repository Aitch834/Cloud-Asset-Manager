import { b as useAppStore, a as useToast, t as useQueryClient, r as reactExports, l as useQuery, O as useMutation, j as jsxRuntimeExports, I as Input, c as Button, S as Plus, T as FlaskConical, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, H as DialogDescription, J as DialogFooter } from "./index-DmKdQ7dc.js";
import { u as useLookupStrings } from "./use-lookup-BEZJBDKz.js";
import { A as AppLayout, I as Info, c as ClipboardList, U as Users } from "./AppLayout-043XWITg.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BV5DYUfS.js";
import { B as Badge } from "./badge-Dd9DmBNE.js";
import { a as TabButton } from "./tab-button-B-pRLiL-.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-CHk2REty.js";
import { B as BuyerCombobox } from "./BuyerCombobox-QALGQUko.js";
import { L as Leaf, T as TriangleAlert } from "./triangle-alert-BqKtXZ3i.js";
import { D as Droplets } from "./shield-alert-Bs5wl-Zd.js";
import { E as Eye } from "./eye-DSB64hhJ.js";
import { P as Pencil } from "./pencil-COTSzZN1.js";
import { T as Trash2 } from "./trash-2-BLmnrwB4.js";
import { C as CircleCheck } from "./circle-check-CLHgZ2bc.js";
import { M as Mail } from "./mail-BvfGrIR2.js";
import { P as Phone } from "./phone-7R7GObpY.js";
import "./use-safe-clerk-CdeIM_NL.js";
import "./database-BIWxw2sm.js";
import "./shield-check-rhIGv_FB.js";
import "./tractor-js2Kek-5.js";
import "./index-B1W-aXvq.js";
import "./index-BolDo61T.js";
import "./chevron-up-DTDCi_Cf.js";
import "./textarea-B3BnPnd9.js";
import "./popover-41N7vSOs.js";
import "./command-BWd11wQ_.js";
import "./search-DCpGQVUF.js";
import "./chevrons-up-down-CVTq47nr.js";
import "./user-plus-DOT9DC1F.js";
const PRODUCT_TYPES = [
  { value: "synthetic-n", label: "Synthetic N (AN/Urea/UAN)", isOrganic: false, isLiquid: false },
  { value: "slurry", label: "Slurry (cattle/pig)", isOrganic: true, isLiquid: true },
  { value: "digestate", label: "Digestate (AD)", isOrganic: true, isLiquid: true },
  { value: "fy", label: "Farm Yard Manure (solid)", isOrganic: true, isLiquid: false },
  { value: "poultry-manure", label: "Poultry Manure", isOrganic: true, isLiquid: false },
  { value: "compost", label: "Compost / Green Waste", isOrganic: true, isLiquid: false },
  { value: "organic-n", label: "Other Organic N", isOrganic: true, isLiquid: false }
];
const APP_METHODS = [
  "Trailing shoe",
  "Dribble bar",
  "Injected",
  "Band spread",
  "Broadcast (surface)",
  "Umbilical",
  "Tanker spread",
  "Spinner / broadcast",
  "Foliar",
  "Irrigation"
];
const LAND_TYPES = ["arable", "grassland", "mixed"];
const ORGANIC_TYPES = /* @__PURE__ */ new Set(["slurry", "digestate", "fy", "poultry-manure", "compost", "organic-n"]);
const LIQUID_TYPES = /* @__PURE__ */ new Set(["slurry", "digestate"]);
const TOTAL_N_LIMIT = 250;
const ORGANIC_N_LIMIT = 170;
function checkTodayClosedPeriod(productType, landType) {
  if (!LIQUID_TYPES.has(productType)) return { closed: false, reason: null };
  const now = /* @__PURE__ */ new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayOfYear = month * 100 + day;
  if (landType === "arable") {
    if (dayOfYear >= 801 || dayOfYear <= 131) {
      return { closed: true, reason: "Slurry/digestate on arable land — closed period 1 Aug to 31 Jan" };
    }
  } else if (landType === "grassland") {
    if (dayOfYear >= 1015 || dayOfYear <= 131) {
      return { closed: true, reason: "Slurry/digestate on grassland — closed period 15 Oct to 31 Jan" };
    }
  } else if (landType === "mixed") {
    if (dayOfYear >= 801 || dayOfYear <= 131) {
      return { closed: true, reason: "Slurry/digestate on mixed land — closed period applies (1 Aug–31 Jan for arable portion)" };
    }
  }
  return { closed: false, reason: null };
}
function checkDateClosedPeriod(productType, landType, date) {
  if (!LIQUID_TYPES.has(productType)) return { closed: false, reason: null };
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfYear = month * 100 + day;
  if (landType === "arable") {
    if (dayOfYear >= 801 || dayOfYear <= 131) {
      return { closed: true, reason: "Applied during closed period (1 Aug–31 Jan, arable)" };
    }
  } else if (landType === "grassland") {
    if (dayOfYear >= 1015 || dayOfYear <= 131) {
      return { closed: true, reason: "Applied during closed period (15 Oct–31 Jan, grassland)" };
    }
  } else if (landType === "mixed") {
    if (dayOfYear >= 801 || dayOfYear <= 131) {
      return { closed: true, reason: "Applied during closed period (1 Aug–31 Jan)" };
    }
  }
  return { closed: false, reason: null };
}
const emptyForm = {
  fieldId: "",
  applicationDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
  productName: "",
  productType: "",
  nitrogenKgHa: "",
  areaAppliedHa: "",
  applicationMethod: "",
  notes: "",
  totalCostPence: "",
  stockItemId: "",
  stockDeliveryId: "",
  applicationRateKgHa: "",
  unitCostPencePerTonne: "",
  batchNumber: "",
  lotNumber: ""
};
function NBar({ value, limit, className = "" }) {
  const pct = Math.min(value / limit * 100, 100);
  const over = value > limit;
  const warn = value > limit * 0.85;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-2 rounded-full overflow-hidden bg-black/5 ${className}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `h-full rounded-full transition-all ${over ? "bg-red-500" : warn ? "bg-amber-400" : "bg-green-500"}`,
      style: { width: `${pct}%` }
    }
  ) });
}
const CLOSED_PERIOD_RULES = [
  { product: "Slurry / Digestate (liquid)", arableFrom: "01 Aug", arableTo: "31 Jan", grassFrom: "15 Oct", grassTo: "31 Jan", note: "Nitrates Action Programme — England" },
  { product: "Poultry Manure (high-N)", arableFrom: "01 Oct", arableTo: "31 Jan", grassFrom: "01 Oct", grassTo: "31 Jan", note: "High total N from poultry" },
  { product: "Farm Yard Manure (solid)", arableFrom: "—", arableTo: "—", grassFrom: "15 Oct", grassTo: "31 Jan", note: "Grassland only" }
];
function nextOpenDate(landType) {
  const today = /* @__PURE__ */ new Date();
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  if (!landType || landType === "arable" || landType === "mixed") {
    if (m >= 8) {
      const open = new Date(y + 1, 1, 1);
      const days = Math.ceil((open.getTime() - today.getTime()) / 864e5);
      return { date: `1 Feb ${y + 1}`, daysUntil: days };
    }
  }
  if (landType === "grassland" || landType === "mixed") {
    if (m >= 10 || m === 1) {
      const open = new Date(y + (m === 1 ? 0 : 1), 1, 1);
      const days = Math.ceil((open.getTime() - today.getTime()) / 864e5);
      return { date: `1 Feb ${m === 1 ? y : y + 1}`, daysUntil: days };
    }
  }
  return null;
}
function NvzClosedPeriodsTab({ fields }) {
  const today = /* @__PURE__ */ new Date();
  const nvzFields = fields.filter((f) => f.isNvz);
  nvzFields.filter((f) => {
    const check = checkTodayClosedPeriod("slurry", f.nvzLandType);
    return check.closed;
  });
  const month = today.getMonth() + 1;
  const isArableClosed = month >= 8 || month <= 1;
  const isGrasslandClosed = month >= 10 || month <= 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-3xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-800 mb-1", children: "NVZ Closed Spreading Periods" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Automatic calculation of closed periods for slurry and digestate based on your NVZ field land types. Based on England Nitrates Action Programme rules." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-4 ${isArableClosed ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-2.5 h-2.5 rounded-full ${isArableClosed ? "bg-red-500" : "bg-green-500"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-700", children: "Arable Land" })
        ] }),
        isArableClosed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-red-700", children: "CLOSED PERIOD" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mt-0.5", children: "No slurry/digestate — 1 Aug to 31 Jan" }),
          nextOpenDate("arable") && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-500 mt-1 font-medium", children: [
            "Opens: ",
            nextOpenDate("arable").date,
            " (",
            nextOpenDate("arable").daysUntil,
            " days)"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-green-700", children: "OPEN — Spreading permitted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600 mt-0.5", children: "Closed period starts: 1 Aug" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
            "Days until closed: ",
            Math.ceil((new Date(today.getFullYear(), 7, 1).getTime() - today.getTime()) / 864e5)
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-4 ${isGrasslandClosed ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `w-2.5 h-2.5 rounded-full ${isGrasslandClosed ? "bg-red-500" : "bg-green-500"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-gray-700", children: "Grassland" })
        ] }),
        isGrasslandClosed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-red-700", children: "CLOSED PERIOD" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mt-0.5", children: "No slurry/digestate — 15 Oct to 31 Jan" }),
          nextOpenDate("grassland") && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-500 mt-1 font-medium", children: [
            "Opens: ",
            nextOpenDate("grassland").date,
            " (",
            nextOpenDate("grassland").daysUntil,
            " days)"
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold text-green-700", children: "OPEN — Spreading permitted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600 mt-0.5", children: "Closed period starts: 15 Oct" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
            "Days until closed: ",
            Math.ceil((new Date(today.getFullYear(), 9, 15).getTime() - today.getTime()) / 864e5)
          ] })
        ] })
      ] })
    ] }),
    nvzFields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-700 mb-2", children: "NVZ Fields — Slurry/Digestate Status Today" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium text-gray-600", children: "Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium text-gray-600", children: "Land Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium text-gray-600", children: "Status Today" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium text-gray-600 hidden sm:table-cell", children: "Next Open" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: nvzFields.map((f) => {
          const cp = checkTodayClosedPeriod("slurry", f.nvzLandType);
          const nextOpen = nextOpenDate(f.nvzLandType);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: cp.closed ? "bg-red-50/50" : "hover:bg-gray-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: f.fieldName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 capitalize", children: f.nvzLandType || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: cp.closed ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full", children: "CLOSED — No spreading" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full", children: "Open" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden sm:table-cell text-xs text-gray-500", children: nextOpen ? `${nextOpen.date} (${nextOpen.daysUntil}d)` : "No restriction" })
          ] }, f.fieldId);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-700 mb-2", children: "Closed Period Rules Reference" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium", children: "Material" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium", children: "Arable Closed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium", children: "Grassland Closed" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium hidden md:table-cell", children: "Note" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: CLOSED_PERIOD_RULES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: r.product }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.arableFrom === "—" ? "No restriction" : `${r.arableFrom} – ${r.arableTo}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: r.grassFrom === "—" ? "No restriction" : `${r.grassFrom} – ${r.grassTo}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden md:table-cell text-gray-500", children: r.note })
        ] }, r.product)) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-2", children: "Source: The Nitrate Pollution Prevention Regulations 2015 (as amended). England only. Scotland, Wales and Northern Ireland have separate rules." })
    ] })
  ] });
}
function NvzFieldCard({ fs, onEdit }) {
  const totalOver = fs.totalNKgHa > TOTAL_N_LIMIT;
  const organicOver = fs.organicNKgHa > ORGANIC_N_LIMIT;
  const totalWarn = fs.totalNKgHa > TOTAL_N_LIMIT * 0.85 && !totalOver;
  const organicWarn = fs.organicNKgHa > ORGANIC_N_LIMIT * 0.85 && !organicOver;
  const areaHa = parseFloat(String(fs.areaHectares ?? "0")) || null;
  const closedPeriodWarnings = LIQUID_TYPES.size > 0 ? ["slurry", "digestate"].map((pt) => checkTodayClosedPeriod(pt, fs.nvzLandType)).filter((c) => c.closed) : [];
  const hasTodayClosed = closedPeriodWarnings.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-xl p-4 space-y-3 ${fs.isNvz ? "border-green-200 bg-green-50/30" : "border-border bg-card"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: fs.fieldName }),
          fs.isNvz ? /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "bg-green-100 text-green-800 border-green-200 text-[11px]", children: "NVZ" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-foreground/40 text-[11px]", children: "Non-NVZ" }),
          fs.nvzLandType && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "capitalize text-[11px]", children: fs.nvzLandType })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-foreground/50 mt-0.5", children: [
          areaHa ? `${areaHa.toFixed(2)} ha` : "Area unknown",
          " · ",
          fs.applicationCount,
          " application",
          fs.applicationCount !== 1 ? "s" : "",
          " in 12 months"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => onEdit(fs),
          className: "text-xs text-foreground/50 hover:text-foreground border border-border/50 rounded-lg px-2 py-1 bg-white whitespace-nowrap",
          children: "NVZ settings"
        }
      )
    ] }),
    hasTodayClosed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 mt-0.5 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Closed period active today — slurry/digestate spreading not permitted on this field" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/60", children: "Total N (12-month)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${totalOver ? "text-red-600" : totalWarn ? "text-amber-600" : "text-foreground"}`, children: [
            fs.totalNKgHa.toFixed(1),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-foreground/40", children: [
              "/ ",
              TOTAL_N_LIMIT,
              " kg/ha"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NBar, { value: fs.totalNKgHa, limit: TOTAL_N_LIMIT }),
        totalOver && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-red-600 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
          "Exceeds 250 kg N/ha annual limit"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/60", children: "Organic N (12-month)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-semibold ${organicOver ? "text-red-600" : organicWarn ? "text-amber-600" : "text-foreground"}`, children: [
            fs.organicNKgHa.toFixed(1),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-normal text-foreground/40", children: [
              "/ ",
              ORGANIC_N_LIMIT,
              " kg/ha"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NBar, { value: fs.organicNKgHa, limit: ORGANIC_N_LIMIT }),
        organicOver && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-red-600 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
          "Exceeds 170 kg organic N/ha NVZ limit"
        ] })
      ] })
    ] }),
    fs.applicationCount === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-foreground/40 italic", children: "No applications logged in the last 12 months" })
  ] });
}
function NVZPage() {
  const { farmId } = useAppStore();
  const appMethods = useLookupStrings("nvz_application_methods", APP_METHODS);
  const soilTypes = useLookupStrings("nvz_soil_types", [
    "Sand",
    "Loamy Sand",
    "Sandy Loam",
    "Sandy Silt Loam",
    "Silt Loam",
    "Silt",
    "Loam",
    "Clay Loam",
    "Sandy Clay Loam",
    "Silty Clay Loam",
    "Sandy Clay",
    "Silty Clay",
    "Clay"
  ]);
  const { toast } = useToast();
  const qc = useQueryClient();
  const [tab, setTab] = reactExports.useState("summary");
  const [selectedYear, setSelectedYear] = reactExports.useState((/* @__PURE__ */ new Date()).getFullYear());
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(emptyForm);
  const [search, setSearch] = reactExports.useState("");
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const formOpen = addOpen || !!editRecord;
  function openEditApp(r) {
    setEditRecord(r);
    setForm({
      fieldId: String(r.fieldId),
      applicationDate: r.applicationDate ? r.applicationDate.slice(0, 10) : "",
      productName: r.productName,
      productType: r.productType,
      nitrogenKgHa: String(r.nitrogenKgHa),
      areaAppliedHa: String(r.areaAppliedHa),
      applicationMethod: r.applicationMethod ?? "",
      notes: r.notes ?? "",
      totalCostPence: r.totalCostPence != null ? String(r.totalCostPence) : "",
      stockItemId: r.stockItemId != null ? String(r.stockItemId) : "",
      stockDeliveryId: r.stockDeliveryId != null ? String(r.stockDeliveryId) : "",
      applicationRateKgHa: r.applicationRateKgHa != null ? String(r.applicationRateKgHa) : "",
      unitCostPencePerTonne: r.unitCostPencePerTonne != null ? String(r.unitCostPencePerTonne) : "",
      batchNumber: r.batchNumber ?? "",
      lotNumber: r.lotNumber ?? ""
    });
  }
  function closeAppForm() {
    setAddOpen(false);
    setEditRecord(null);
    setForm(emptyForm);
  }
  const [nvzEditField, setNvzEditField] = reactExports.useState(null);
  const [nvzEditForm, setNvzEditForm] = reactExports.useState({ isNvz: false, nvzLandType: "" });
  const [raAddOpen, setRaAddOpen] = reactExports.useState(false);
  const [raViewItem, setRaViewItem] = reactExports.useState(null);
  const [raEditItem, setRaEditItem] = reactExports.useState(null);
  const [raDeleteId, setRaDeleteId] = reactExports.useState(null);
  const emptyRaForm = { assessmentDate: "", assessedBy: "", assessorName: "", assessorOrganisation: "", assessorSupplierId: null, assessorContactId: "", soilType: "", drainageRisk: "", slopeRisk: "", distanceToWatercourse: "", floodRisk: "", organicMatterLevel: "", applicationRestrictionsIdentified: "", mitigationMeasures: "", overallRiskLevel: "", nextReviewDate: "", notes: "" };
  const [raFieldIds, setRaFieldIds] = reactExports.useState([]);
  const [raForm, setRaForm] = reactExports.useState({ ...emptyRaForm });
  const [contactAddOpen, setContactAddOpen] = reactExports.useState(false);
  const [contactEditItem, setContactEditItem] = reactExports.useState(null);
  const [contactDeleteId, setContactDeleteId] = reactExports.useState(null);
  const emptyContactForm = { name: "", organisation: "", email: "", phone: "", role: "", qualifications: "", notes: "" };
  const [contactForm, setContactForm] = reactExports.useState({ ...emptyContactForm });
  const [nvzRaiseTask, setNvzRaiseTask] = reactExports.useState(null);
  useQuery({
    queryKey: ["nvz-summary", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nvz/field-summary`).then((r) => r.json()),
    enabled: !!farmId
  });
  const appsQ = useQuery({
    queryKey: ["nvz-applications", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nvz-applications`).then((r) => r.json()),
    enabled: !!farmId
  });
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()),
    enabled: !!farmId
  });
  const riskAssessmentsQ = useQuery({
    queryKey: ["nvz-risk-assessments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nvz-risk-assessments`).then((r) => r.json()),
    enabled: !!farmId
  });
  const contactsQ = useQuery({
    queryKey: ["farm-contacts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/contacts`).then((r) => r.json()),
    enabled: !!farmId
  });
  const raCreateMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/nvz-risk-assessments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, fieldIds: JSON.stringify(raFieldIds) }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Risk assessment saved" });
      qc.invalidateQueries({ queryKey: ["nvz-risk-assessments", farmId] });
      setRaAddOpen(false);
      setRaForm({ ...emptyRaForm });
      setRaFieldIds([]);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const raUpdateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/nvz-risk-assessments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, fieldIds: JSON.stringify(raFieldIds) }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Risk assessment updated" });
      qc.invalidateQueries({ queryKey: ["nvz-risk-assessments", farmId] });
      setRaEditItem(null);
      setRaFieldIds([]);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const raDeleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/nvz-risk-assessments/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Risk assessment deleted" });
      qc.invalidateQueries({ queryKey: ["nvz-risk-assessments", farmId] });
      setRaDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const contactCreateMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/contacts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Contact saved" });
      qc.invalidateQueries({ queryKey: ["farm-contacts", farmId] });
      setContactAddOpen(false);
      setContactForm({ ...emptyContactForm });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const contactUpdateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/contacts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Contact updated" });
      qc.invalidateQueries({ queryKey: ["farm-contacts", farmId] });
      setContactEditItem(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const contactDeleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/contacts/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Contact removed" });
      qc.invalidateQueries({ queryKey: ["farm-contacts", farmId] });
      setContactDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const applications = appsQ.data?.records ?? [];
  const fields = fieldsQ.data?.records ?? [];
  const riskAssessments = riskAssessmentsQ.data?.records ?? [];
  const contacts = contactsQ.data?.contacts ?? [];
  const availableYears = reactExports.useMemo(() => {
    const years = /* @__PURE__ */ new Set([(/* @__PURE__ */ new Date()).getFullYear()]);
    applications.forEach((a) => {
      if (a.applicationDate) years.add(new Date(a.applicationDate).getFullYear());
    });
    return Array.from(years).sort().reverse();
  }, [applications]);
  const yearApps = reactExports.useMemo(
    () => applications.filter((a) => a.applicationDate && new Date(a.applicationDate).getFullYear() === selectedYear),
    [applications, selectedYear]
  );
  const yearSummary = reactExports.useMemo(() => {
    const organicTypes = ["slurry", "fy", "poultry-manure", "organic-n", "digestate", "compost"];
    return fields.map((f) => {
      const fa = yearApps.filter((a) => a.fieldId === f.id);
      const areaHa = parseFloat(String(f.areaHectares ?? "1")) || 1;
      const totalNKg = fa.reduce((s, a) => s + parseFloat(a.totalNitrogenKg ?? "0"), 0);
      const organicNKg = fa.filter((a) => organicTypes.includes(a.productType)).reduce((s, a) => s + parseFloat(a.totalNitrogenKg ?? "0"), 0);
      return {
        fieldId: f.id,
        fieldName: f.name,
        areaHectares: f.areaHectares,
        isNvz: f.isNvz,
        nvzLandType: f.nvzLandType,
        totalNKg: parseFloat(totalNKg.toFixed(2)),
        organicNKg: parseFloat(organicNKg.toFixed(2)),
        totalNKgHa: parseFloat((totalNKg / areaHa).toFixed(2)),
        organicNKgHa: parseFloat((organicNKg / areaHa).toFixed(2)),
        applicationCount: fa.length
      };
    });
  }, [fields, yearApps]);
  const filteredApps = reactExports.useMemo(() => {
    if (!search.trim()) return yearApps;
    const q = search.toLowerCase();
    return yearApps.filter(
      (a) => (a.fieldName ?? "").toLowerCase().includes(q) || a.productName.toLowerCase().includes(q) || a.productType.toLowerCase().includes(q)
    );
  }, [yearApps, search]);
  const nvzFields = yearSummary.filter((f) => f.isNvz);
  const nvzFieldCount = nvzFields.length;
  const alertFields = yearSummary.filter((f) => f.totalNKgHa > TOTAL_N_LIMIT || f.organicNKgHa > ORGANIC_N_LIMIT).length;
  const warnFields = yearSummary.filter(
    (f) => (!f.totalNKgHa || f.totalNKgHa <= TOTAL_N_LIMIT) && (!f.organicNKgHa || f.organicNKgHa <= ORGANIC_N_LIMIT) && (f.totalNKgHa > TOTAL_N_LIMIT * 0.85 || f.organicNKgHa > ORGANIC_N_LIMIT * 0.85)
  ).length;
  const nvzDeliveriesQ = useQuery({
    queryKey: ["stock-deliveries-for-item", farmId, form.stockItemId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-deliveries-for-item?stockItemId=${form.stockItemId}`).then((r) => r.json()),
    enabled: !!farmId && !!form.stockItemId
  });
  const nvzStockItemsQ = useQuery({
    queryKey: ["stock-items", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-items`).then((r) => r.json()),
    enabled: !!farmId
  });
  const fertStockItems = (nvzStockItemsQ.data?.items ?? []).filter(
    (si) => ["fertiliser", "fert", "feed", "manure", "digestate"].some((t) => String(si.stockType ?? "").toLowerCase().includes(t))
  );
  function handleNvzDeliverySelect(deliveryId) {
    if (!deliveryId) {
      setForm((f) => ({ ...f, stockDeliveryId: "", batchNumber: "", lotNumber: "", unitCostPencePerTonne: "" }));
      return;
    }
    const del = (nvzDeliveriesQ.data?.deliveries ?? []).find((d) => String(d.id) === deliveryId);
    const unitPricePence = del?.unitPricePence ?? null;
    const unit = (del?.stockItemUnit ?? "kg").toLowerCase();
    const unitCostPencePerTonne = unitPricePence != null ? unit === "tonne" || unit === "t" ? unitPricePence : unitPricePence * 1e3 : null;
    setForm((f) => ({
      ...f,
      stockDeliveryId: deliveryId,
      batchNumber: del?.batchNumber ?? f.batchNumber,
      lotNumber: del?.lotNumber ?? f.lotNumber,
      unitCostPencePerTonne: unitCostPencePerTonne != null ? String(Math.round(unitCostPencePerTonne)) : f.unitCostPencePerTonne
    }));
  }
  const buildNvzPayload = (f) => {
    const unitCostPT = f.unitCostPencePerTonne !== "" ? Number(f.unitCostPencePerTonne) : void 0;
    const appRateKgHa = f.applicationRateKgHa !== "" ? parseFloat(f.applicationRateKgHa) : void 0;
    const areaHa = parseFloat(f.areaAppliedHa);
    const computedCost = unitCostPT && appRateKgHa && areaHa ? Math.round(unitCostPT * appRateKgHa / 1e3 * areaHa) : void 0;
    return {
      fieldId: parseInt(f.fieldId),
      applicationDate: f.applicationDate,
      productName: f.productName,
      productType: f.productType,
      nitrogenKgHa: parseFloat(f.nitrogenKgHa),
      areaAppliedHa: areaHa,
      applicationMethod: f.applicationMethod || void 0,
      notes: f.notes || void 0,
      totalCostPence: computedCost ?? (f.totalCostPence !== "" && f.totalCostPence != null ? Number(f.totalCostPence) : void 0),
      stockItemId: f.stockItemId ? parseInt(f.stockItemId) : void 0,
      stockDeliveryId: f.stockDeliveryId ? parseInt(f.stockDeliveryId) : void 0,
      applicationRateKgHa: appRateKgHa,
      unitCostPencePerTonne: unitCostPT,
      batchNumber: f.batchNumber || void 0,
      lotNumber: f.lotNumber || void 0
    };
  };
  const addMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/nvz-applications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Application logged" });
      qc.invalidateQueries({ queryKey: ["nvz-applications", farmId] });
      qc.invalidateQueries({ queryKey: ["nvz-summary", farmId] });
      closeAppForm();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/nvz-applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Application updated" });
      qc.invalidateQueries({ queryKey: ["nvz-applications", farmId] });
      qc.invalidateQueries({ queryKey: ["nvz-summary", farmId] });
      closeAppForm();
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/nvz-applications/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Record deleted" });
      qc.invalidateQueries({ queryKey: ["nvz-applications", farmId] });
      qc.invalidateQueries({ queryKey: ["nvz-summary", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" })
  });
  const nvzEditMut = useMutation({
    mutationFn: ({ fieldId, body }) => fetch(`/api/farms/${farmId}/fields/${fieldId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Field NVZ settings updated" });
      qc.invalidateQueries({ queryKey: ["nvz-summary", farmId] });
      qc.invalidateQueries({ queryKey: ["fields", farmId] });
      setNvzEditField(null);
    },
    onError: () => toast({ title: "Failed to update field", variant: "destructive" })
  });
  const handleAdd = () => {
    if (!form.fieldId || !form.applicationDate || !form.productName || !form.productType || !form.nitrogenKgHa || !form.areaAppliedHa) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (editRecord) {
      updateMut.mutate({ id: editRecord.id, body: buildNvzPayload(form) });
    } else {
      addMut.mutate(buildNvzPayload(form));
    }
  };
  const totalNApplied = applications.reduce((s, a) => s + parseFloat(a.totalNitrogenKg ?? "0"), 0);
  const fmt = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const selectedField = fields.find((f) => f.id === parseInt(form.fieldId));
  const closedPeriodWarning = form.productType && form.applicationDate && selectedField ? checkDateClosedPeriod(form.productType, selectedField.nvzLandType, new Date(form.applicationDate)) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "NVZ Compliance", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "NVZ Compliance Requirements (England)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-green-700 text-xs leading-relaxed", children: [
            "Fields in Nitrate Vulnerable Zones must not exceed ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "170 kg organic N/ha/year" }),
            " from livestock manures, or ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "250 kg total N/ha/year" }),
            " from all sources. Slurry and digestate are subject to closed spreading periods: arable land ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "1 Aug – 31 Jan" }),
            ", grassland ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "15 Oct – 31 Jan" }),
            ". Records are required under the Nitrates Action Programme."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-green-700 text-xs pt-0.5 flex flex-wrap gap-x-3 gap-y-0.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://www.gov.uk/guidance/nitrate-vulnerable-zones", target: "_blank", rel: "noopener noreferrer", className: "underline hover:text-green-900 inline-flex items-center gap-1", children: "NVZ guidance on GOV.UK ↗" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://magic.defra.gov.uk/MagicMap.aspx", target: "_blank", rel: "noopener noreferrer", className: "underline hover:text-green-900 inline-flex items-center gap-1", children: "Check NVZ boundaries on DEFRA MAGIC map ↗" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl p-3 bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: nvzFieldCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-foreground/50 mt-0.5", children: "NVZ fields" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl p-3 bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold text-foreground", children: yearApps.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-foreground/50 mt-0.5", children: [
            "Applications in ",
            selectedYear
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-xl p-3 ${alertFields > 0 ? "border-red-200 bg-red-50" : "border-border bg-card"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${alertFields > 0 ? "text-red-600" : "text-foreground"}`, children: alertFields }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-foreground/50 mt-0.5", children: "Fields over limit" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `border rounded-xl p-3 ${warnFields > 0 ? "border-amber-200 bg-amber-50" : "border-border bg-card"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-2xl font-bold ${warnFields > 0 ? "text-amber-600" : "text-foreground"}`, children: warnFields }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-foreground/50 mt-0.5", children: "Fields approaching limit" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-border pb-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "summary", onClick: () => setTab("summary"), children: "NVZ Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "log", onClick: () => setTab("log"), children: "Application Log" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "risk-assessments", onClick: () => setTab("risk-assessments"), children: [
            "Risk Assessments ",
            riskAssessments.length > 0 && `(${riskAssessments.length})`
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "closed-periods", onClick: () => setTab("closed-periods"), children: "Closed Periods" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "budget-calc", onClick: () => setTab("budget-calc"), children: "N Budget Calculator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "contacts", onClick: () => setTab("contacts"), children: [
            "Contacts ",
            contacts.length > 0 && `(${contacts.length})`
          ] })
        ] }),
        tab !== "risk-assessments" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/50 font-medium", children: "Year:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(selectedYear), onValueChange: (v) => setSelectedYear(Number(v)), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-7 text-xs w-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
          ] })
        ] })
      ] }),
      tab === "summary" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: fieldsQ.isLoading || appsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/40 text-center py-10", children: "Loading field data…" }) : yearSummary.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl p-10 text-center text-foreground/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No active fields found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Add fields in Fields & Crops, then log applications here." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        alertFields > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              alertFields,
              " field",
              alertFields > 1 ? "s" : ""
            ] }),
            " ha",
            alertFields > 1 ? "ve" : "s",
            " exceeded NVZ nitrogen limits in ",
            selectedYear,
            ". Review applications immediately."
          ] })
        ] }),
        yearApps.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 mt-0.5 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "No applications recorded in ",
            selectedYear,
            ". All fields show zero nitrogen totals for this year. Use the year selector to view other years, or log applications in the Application Log tab."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-3", children: yearSummary.map((fs) => /* @__PURE__ */ jsxRuntimeExports.jsx(NvzFieldCard, { fs, onEdit: (f) => {
          setNvzEditField(f);
          setNvzEditForm({ isNvz: f.isNvz, nvzLandType: f.nvzLandType ?? "" });
        } }, fs.fieldId)) })
      ] }) }),
      tab === "closed-periods" && /* @__PURE__ */ jsxRuntimeExports.jsx(NvzClosedPeriodsTab, { fields: yearSummary }),
      tab === "log" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Search by field or product…",
              value: search,
              onChange: (e) => setSearch(e.target.value),
              className: "max-w-xs"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-foreground/50 hidden sm:block", children: totalNApplied > 0 && `Total N logged: ${totalNApplied.toFixed(0)} kg` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
            setForm(emptyForm);
            setAddOpen(true);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5 mr-1.5" }),
            "Log Application"
          ] })
        ] }),
        appsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/40 text-center py-10", children: "Loading…" }) : filteredApps.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl p-10 text-center text-foreground/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No applications logged yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: 'Use "Log Application" to record each fertiliser or manure application.' })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/40 border-b border-border text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 font-medium text-foreground/60 text-xs", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 font-medium text-foreground/60 text-xs", children: "Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 font-medium text-foreground/60 text-xs", children: "Product" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 font-medium text-foreground/60 text-xs", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 font-medium text-foreground/60 text-xs text-right", children: "N kg/ha" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 font-medium text-foreground/60 text-xs text-right", children: "Area (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 font-medium text-foreground/60 text-xs text-right", children: "Total N (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2.5 font-medium text-foreground/60 text-xs" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredApps.map((a, idx) => {
            const fieldLandType = yearSummary.find((f) => f.fieldId === a.fieldId)?.nvzLandType ?? fields.find((f) => f.id === a.fieldId)?.nvzLandType;
            const cp = checkDateClosedPeriod(a.productType, fieldLandType, new Date(a.applicationDate));
            const isOrganic = ORGANIC_TYPES.has(a.productType);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "tr",
              {
                className: `border-b border-border/50 last:border-0 ${idx % 2 === 1 ? "bg-muted/20" : ""} ${cp.closed ? "bg-red-50/50" : ""}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 whitespace-nowrap", children: fmt(a.applicationDate) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", children: a.fieldName ?? `Field #${a.fieldId}` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-foreground/70", children: a.productName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-2.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${isOrganic ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`, children: [
                      isOrganic ? /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-3 h-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-3 h-3" }),
                      isOrganic ? "Organic" : "Synthetic"
                    ] }),
                    cp.closed && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-1.5 inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
                      "Closed period"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right tabular-nums", children: parseFloat(a.nitrogenKgHa).toFixed(1) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right tabular-nums", children: parseFloat(a.areaAppliedHa).toFixed(2) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right tabular-nums font-medium", children: parseFloat(a.totalNitrogenKg).toFixed(1) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(a), className: "text-foreground/30 hover:text-blue-500 transition-colors p-1 rounded", title: "View details", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEditApp(a), className: "text-foreground/30 hover:text-primary transition-colors p-1 rounded", title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(a.id), className: "text-foreground/30 hover:text-red-500 transition-colors p-1 rounded", title: "Delete record", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) }),
                    cp.closed && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRaiseTaskFor(a), className: "text-amber-500 hover:text-amber-700 transition-colors p-1 rounded", title: "Raise Task — closed period breach", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5" }) })
                  ] }) })
                ]
              },
              a.id
            );
          }) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewRecord, onOpenChange: (o) => {
      if (!o) setViewRecord(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "NVZ Application Record" }),
        viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, { children: [
          viewRecord.fieldName ?? `Field #${viewRecord.fieldId}`,
          " — ",
          viewRecord.applicationDate ? new Date(viewRecord.applicationDate).toLocaleDateString("en-GB") : "—"
        ] })
      ] }),
      viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: [
          ["Field", viewRecord.fieldName ?? `Field #${viewRecord.fieldId}`],
          ["Date", viewRecord.applicationDate ? new Date(viewRecord.applicationDate).toLocaleDateString("en-GB") : "—"],
          ["Product Name", viewRecord.productName],
          ["Product Type", PRODUCT_TYPES.find((p) => p.value === viewRecord.productType)?.label ?? viewRecord.productType],
          ["N Rate (kg/ha)", parseFloat(viewRecord.nitrogenKgHa).toFixed(1)],
          ["Area Applied (ha)", parseFloat(viewRecord.areaAppliedHa).toFixed(2)],
          ["Total N Applied", `${parseFloat(viewRecord.totalNitrogenKg).toFixed(1)} kg`],
          ["Application Method", viewRecord.applicationMethod ?? "—"]
        ].map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 font-medium uppercase tracking-wide mb-0.5", children: k }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-foreground", children: v || "—" })
        ] }, k)) }),
        viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 font-medium uppercase tracking-wide mb-0.5", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/80", children: viewRecord.notes })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const r = viewRecord;
          setViewRecord(null);
          openEditApp(r);
        }, children: "Edit" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: formOpen, onOpenChange: (o) => {
      if (!o) closeAppForm();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editRecord ? "Edit Fertiliser Application" : "Log Fertiliser Application" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editRecord ? "Update this NVZ application record." : "Record a fertiliser or manure application for NVZ compliance tracking." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium mb-1.5 block", children: [
              "Field ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fieldId, onValueChange: (v) => {
              const fld = fields.find((f) => String(f.id) === v);
              setForm((f) => ({ ...f, fieldId: v, areaAppliedHa: fld?.areaHectares ? String(fld.areaHectares) : f.areaAppliedHa }));
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(f.id), children: f.name }, f.id)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium mb-1.5 block", children: [
              "Application Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: form.applicationDate,
                onChange: (e) => setForm((f) => ({ ...f, applicationDate: e.target.value }))
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium mb-1.5 block", children: [
              "Product Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "e.g. Ammonium Nitrate 34.5%",
                value: form.productName,
                onChange: (e) => setForm((f) => ({ ...f, productName: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium mb-1.5 block", children: [
              "Product Type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.productType, onValueChange: (v) => setForm((f) => ({ ...f, productType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PRODUCT_TYPES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p.value, children: p.label }, p.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium mb-1.5 block", children: [
              "N Rate (kg/ha) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.1",
                min: "0",
                placeholder: "e.g. 80",
                value: form.nitrogenKgHa,
                onChange: (e) => setForm((f) => ({ ...f, nitrogenKgHa: e.target.value }))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium mb-1.5 block", children: [
              "Area Applied (ha) ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                min: "0",
                placeholder: "e.g. 12.50",
                value: form.areaAppliedHa,
                onChange: (e) => setForm((f) => ({ ...f, areaAppliedHa: e.target.value }))
              }
            ),
            (() => {
              const fr = fields.find((f) => String(f.id) === String(form.fieldId));
              const area = form.areaAppliedHa ? parseFloat(form.areaAppliedHa) : null;
              if (fr?.areaHectares && area && area > Number(fr.areaHectares)) {
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-red-600 mt-1", children: [
                  "Exceeds ",
                  fr.name,
                  "'s total area (",
                  Number(fr.areaHectares).toFixed(2),
                  " ha) — please correct before saving."
                ] });
              }
              return null;
            })()
          ] })
        ] }),
        form.nitrogenKgHa && form.areaAppliedHa && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-green-600 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-green-800", children: [
            "Total N applied:",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              (parseFloat(form.nitrogenKgHa) * parseFloat(form.areaAppliedHa)).toFixed(1),
              " kg"
            ] })
          ] })
        ] }),
        closedPeriodWarning?.closed && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mt-0.5 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Closed period warning:" }),
            " ",
            closedPeriodWarning.reason,
            ". Spreading on this date may breach NVZ regulations."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Application Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.applicationMethod, onValueChange: (v) => setForm((f) => ({ ...f, applicationMethod: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select method…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: appMethods.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2.5 space-y-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-emerald-800 flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-emerald-500" }),
            "Link to Stock Delivery — auto-populate cost"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: "Fertiliser Stock Item" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.stockItemId, onValueChange: (v) => setForm((f) => ({ ...f, stockItemId: v, stockDeliveryId: "", unitCostPencePerTonne: "", batchNumber: "", lotNumber: "" })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select stock item…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— None —" }),
                  fertStockItems.map((si) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(si.id), children: [
                    String(si.name),
                    si.unit ? ` (${si.unit})` : ""
                  ] }, String(si.id))),
                  nvzStockItemsQ.data?.items?.filter((si) => !fertStockItems.find((f) => f.id === si.id)).map((si) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(si.id), children: [
                    String(si.name),
                    si.unit ? ` (${si.unit})` : ""
                  ] }, String(si.id)))
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: "Delivery" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.stockDeliveryId, onValueChange: handleNvzDeliverySelect, disabled: !form.stockItemId, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: form.stockItemId ? "Select delivery…" : "Select item first" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "", children: "— None —" }),
                  (nvzDeliveriesQ.data?.deliveries ?? []).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(d.id), children: [
                    d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString("en-GB") : "—",
                    d.batchNumber ? ` · ${d.batchNumber}` : "",
                    d.unitPricePence != null ? ` · £${(d.unitPricePence / 100).toFixed(2)}/${d.stockItemUnit ?? "unit"}` : ""
                  ] }, String(d.id)))
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: "Application Rate (kg/ha)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.1",
                  min: "0",
                  placeholder: "e.g. 200",
                  className: "h-8 text-xs",
                  value: form.applicationRateKgHa,
                  onChange: (e) => setForm((f) => ({ ...f, applicationRateKgHa: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: "Unit Cost (p/tonne)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "1",
                  min: "0",
                  placeholder: "auto",
                  className: "h-8 text-xs",
                  value: form.unitCostPencePerTonne,
                  onChange: (e) => setForm((f) => ({ ...f, unitCostPencePerTonne: e.target.value }))
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: "Calc. cost" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 flex items-center px-2 rounded-lg border border-border/40 bg-white text-xs font-mono text-emerald-700", children: form.unitCostPencePerTonne && form.applicationRateKgHa && form.areaAppliedHa ? `£${(Number(form.unitCostPencePerTonne) * parseFloat(form.applicationRateKgHa) / 1e3 * parseFloat(form.areaAppliedHa) / 100).toFixed(2)}` : "—" })
            ] })
          ] }),
          (form.batchNumber || form.lotNumber) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 text-xs text-emerald-700", children: [
            form.batchNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Batch: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: form.batchNumber })
            ] }),
            form.lotNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Lot: ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: form.lotNumber })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "Optional notes…",
              value: form.notes,
              onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value }))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium mb-1.5 block", children: [
            "Total Application Cost ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/40 font-normal", children: "(£) — optional, overridden by delivery calc above" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 text-sm font-medium", children: "£" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.01",
                min: "0",
                placeholder: "e.g. 320.00",
                className: "pl-7",
                value: form.totalCostPence !== "" && form.totalCostPence != null ? (Number(form.totalCostPence) / 100).toFixed(2) : "",
                onChange: (e) => {
                  const v = e.target.value;
                  setForm((f) => ({ ...f, totalCostPence: v === "" ? "" : String(Math.round(parseFloat(v) * 100)) }));
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-1", children: "Manual override — leave blank if using delivery-linked costing above." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: closeAppForm, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleAdd, disabled: addMut.isPending || updateMut.isPending, children: addMut.isPending || updateMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Save Application" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) setDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-red-500" }),
          "Delete Record"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This application record will be permanently removed from the NVZ compliance log. This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", disabled: deleteMut.isPending, onClick: () => {
          if (deleteId) deleteMut.mutate(deleteId);
        }, children: deleteMut.isPending ? "Deleting…" : "Delete Record" })
      ] })
    ] }) }),
    tab === "risk-assessments" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60", children: "Record NVZ risk assessments required by the Nitrates Action Programme. Assessments identify application restrictions, soil risk factors, and mitigation measures." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setRaForm({ ...emptyRaForm });
          setRaFieldIds([]);
          setRaAddOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          " Add Assessment"
        ] })
      ] }),
      riskAssessments.some((r) => r.applicationRestrictionsIdentified?.trim()) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "10px 14px" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-amber-800", children: "Active Application Restrictions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-700 mt-0.5", children: [
            riskAssessments.filter((r) => r.applicationRestrictionsIdentified?.trim()).length,
            " assessment",
            riskAssessments.filter((r) => r.applicationRestrictionsIdentified?.trim()).length !== 1 ? "s" : "",
            " have active restrictions. Review before spreading."
          ] })
        ] })
      ] }),
      riskAssessmentsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/40 text-center py-10", children: "Loading…" }) : riskAssessments.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl p-10 text-center text-foreground/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No risk assessments recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Log a formal NVZ risk assessment to demonstrate compliance with the Nitrates Action Programme." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "2px solid #e5e7eb" }, children: ["Date", "Assessor", "Fields", "Soil Type", "Overall Risk", "Restrictions", "Next Review", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: riskAssessments.map((r) => {
          const riskColor = r.overallRiskLevel === "High" ? "#dc2626" : r.overallRiskLevel === "Medium" ? "#d97706" : "#16a34a";
          const riskBg = r.overallRiskLevel === "High" ? "#fef2f2" : r.overallRiskLevel === "Medium" ? "#fffbeb" : "#f0fdf4";
          const riskBorder = r.overallRiskLevel === "High" ? "#fecaca" : r.overallRiskLevel === "Medium" ? "#fde68a" : "#bbf7d0";
          const displayAssessor = r.assessorName || r.assessedBy || "—";
          const linkedIds = r.fieldIds ? (() => {
            try {
              return JSON.parse(r.fieldIds);
            } catch {
              return [];
            }
          })() : [];
          const linkedNames = fields.filter((f) => linkedIds.includes(f.id)).map((f) => f.name);
          const hasRestrictions = !!r.applicationRestrictionsIdentified?.trim();
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.assessmentDate ? new Date(r.assessmentDate).toLocaleDateString("en-GB") : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.75rem" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontWeight: 500 }, children: displayAssessor }),
              r.assessorOrganisation && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.75rem", color: "#9ca3af" }, children: r.assessorOrganisation })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: linkedNames.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title: linkedNames.join(", "), children: linkedNames.length === 1 ? linkedNames[0] : `${linkedNames.length} fields` }) : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.soilType || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: r.overallRiskLevel ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: riskBg, color: riskColor, border: `1px solid ${riskBorder}`, borderRadius: 4, padding: "2px 8px", fontSize: "0.75rem", fontWeight: 600 }, children: r.overallRiskLevel }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: hasRestrictions ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 4, color: "#d97706" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { style: { width: 12, height: 12, flexShrink: 0 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { overflow: "hidden", textOverflow: "ellipsis" }, children: r.applicationRestrictionsIdentified })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "None noted" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: r.nextReviewDate ? new Date(r.nextReviewDate).toLocaleDateString("en-GB") : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28 }, onClick: () => setRaViewItem(r), children: "View" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28 }, onClick: () => {
                setRaEditItem(r);
                setRaFieldIds(r.fieldIds ? (() => {
                  try {
                    return JSON.parse(r.fieldIds);
                  } catch {
                    return [];
                  }
                })() : []);
                setRaForm({ assessmentDate: r.assessmentDate ? r.assessmentDate.slice(0, 10) : "", assessedBy: r.assessedBy ?? "", assessorName: r.assessorName ?? "", assessorOrganisation: r.assessorOrganisation ?? "", assessorSupplierId: r.assessorSupplierId ?? null, assessorContactId: r.assessorContactId ? String(r.assessorContactId) : "", soilType: r.soilType ?? "", drainageRisk: r.drainageRisk ?? "", slopeRisk: r.slopeRisk ?? "", distanceToWatercourse: r.distanceToWatercourse ?? "", floodRisk: r.floodRisk ?? "", organicMatterLevel: r.organicMatterLevel ?? "", applicationRestrictionsIdentified: r.applicationRestrictionsIdentified ?? "", mitigationMeasures: r.mitigationMeasures ?? "", overallRiskLevel: r.overallRiskLevel ?? "", nextReviewDate: r.nextReviewDate ? r.nextReviewDate.slice(0, 10) : "", notes: r.notes ?? "" });
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { style: { width: 11, height: 11 } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28, color: "#ef4444", borderColor: "#fca5a5" }, onClick: () => setRaDeleteId(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { style: { width: 11, height: 11 } }) })
            ] }) })
          ] }, r.id);
        }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!raViewItem, onOpenChange: (open) => {
      if (!open) setRaViewItem(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 620 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "NVZ Risk Assessment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: raViewItem?.assessmentDate ? new Date(raViewItem.assessmentDate).toLocaleDateString("en-GB") : "" })
      ] }),
      raViewItem && (() => {
        const riskColor = raViewItem.overallRiskLevel === "High" ? "#dc2626" : raViewItem.overallRiskLevel === "Medium" ? "#d97706" : "#16a34a";
        const riskBg = raViewItem.overallRiskLevel === "High" ? "#fef2f2" : raViewItem.overallRiskLevel === "Medium" ? "#fffbeb" : "#f0fdf4";
        const VField = ({ label, value }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }, children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }, children: value || "—" })
        ] });
        const linkedIds = raViewItem.fieldIds ? (() => {
          try {
            return JSON.parse(raViewItem.fieldIds);
          } catch {
            return [];
          }
        })() : [];
        const linkedFieldNames = fields.filter((f) => linkedIds.includes(f.id)).map((f) => f.name);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14 }, children: [
          raViewItem.applicationRestrictionsIdentified?.trim() && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { style: { width: 16, height: 16, color: "#d97706", marginTop: 1, flexShrink: 0 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", fontWeight: 600, color: "#92400e" }, children: "Application Restrictions Active" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.8rem", color: "#78350f", marginTop: 2 }, children: raViewItem.applicationRestrictionsIdentified })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Assessment Date", value: raViewItem.assessmentDate ? new Date(raViewItem.assessmentDate).toLocaleDateString("en-GB") : null }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Next Review Date", value: raViewItem.nextReviewDate ? new Date(raViewItem.nextReviewDate).toLocaleDateString("en-GB") : null })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Assessor Name", value: raViewItem.assessorName || raViewItem.assessedBy }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Assessor Organisation", value: raViewItem.assessorOrganisation })
          ] }),
          linkedFieldNames.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Fields Covered", value: linkedFieldNames.join(", ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Soil Type (MAFF/AHDB)", value: raViewItem.soilType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Organic Matter Level", value: raViewItem.organicMatterLevel })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Drainage Risk", value: raViewItem.drainageRisk }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Slope Risk", value: raViewItem.slopeRisk }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Flood Risk", value: raViewItem.floodRisk })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Distance to Watercourse", value: raViewItem.distanceToWatercourse }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }, children: "Overall Risk Level" }),
              raViewItem.overallRiskLevel ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: riskBg, color: riskColor, border: `1px solid ${riskColor}33`, borderRadius: 4, padding: "2px 10px", fontSize: "0.8rem", fontWeight: 600 }, children: raViewItem.overallRiskLevel }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#d1d5db", fontSize: "0.875rem" }, children: "—" })
            ] })
          ] }),
          raViewItem.mitigationMeasures && /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Mitigation Measures", value: raViewItem.mitigationMeasures }),
          raViewItem.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(VField, { label: "Notes", value: raViewItem.notes })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setRaViewItem(null), children: "Close" }),
        raViewItem?.applicationRestrictionsIdentified?.trim() && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            style: { borderColor: "#fde68a", color: "#92400e", background: "#fffbeb" },
            onClick: () => {
              setNvzRaiseTask({ title: "NVZ Application Restriction Active", description: raViewItem.applicationRestrictionsIdentified });
              setRaViewItem(null);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 mr-1" }),
              " Raise Task"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          const r = raViewItem;
          setRaViewItem(null);
          setRaEditItem(r);
          setRaFieldIds(r.fieldIds ? (() => {
            try {
              return JSON.parse(r.fieldIds);
            } catch {
              return [];
            }
          })() : []);
          setRaForm({ assessmentDate: r.assessmentDate ? r.assessmentDate.slice(0, 10) : "", assessedBy: r.assessedBy ?? "", assessorName: r.assessorName ?? "", assessorOrganisation: r.assessorOrganisation ?? "", assessorSupplierId: r.assessorSupplierId ?? null, assessorContactId: r.assessorContactId ? String(r.assessorContactId) : "", soilType: r.soilType ?? "", drainageRisk: r.drainageRisk ?? "", slopeRisk: r.slopeRisk ?? "", distanceToWatercourse: r.distanceToWatercourse ?? "", floodRisk: r.floodRisk ?? "", organicMatterLevel: r.organicMatterLevel ?? "", applicationRestrictionsIdentified: r.applicationRestrictionsIdentified ?? "", mitigationMeasures: r.mitigationMeasures ?? "", overallRiskLevel: r.overallRiskLevel ?? "", nextReviewDate: r.nextReviewDate ? r.nextReviewDate.slice(0, 10) : "", notes: r.notes ?? "" });
        }, children: "Edit Assessment" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: raAddOpen || !!raEditItem, onOpenChange: (open) => {
      if (!open) {
        setRaAddOpen(false);
        setRaEditItem(null);
        setRaFieldIds([]);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 620 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: raEditItem ? "Edit Risk Assessment" : "Add NVZ Risk Assessment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12, maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Assessment Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: raForm.assessmentDate, onChange: (e) => setRaForm((f) => ({ ...f, assessmentDate: e.target.value })) })
        ] }),
        contacts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Select from Contacts Register" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: raForm.assessorContactId, onValueChange: (v) => {
            const c = contacts.find((x) => String(x.id) === v);
            setRaForm((f) => ({ ...f, assessorContactId: v, assessorName: c?.name ?? f.assessorName, assessorOrganisation: c?.organisation ?? f.assessorOrganisation }));
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Pick a contact to auto-fill assessor…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: contacts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
              c.name,
              c.organisation ? ` · ${c.organisation}` : "",
              c.role ? ` (${c.role})` : ""
            ] }, c.id)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Assessor Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: raForm.assessorName, onChange: (e) => setRaForm((f) => ({ ...f, assessorName: e.target.value })), placeholder: "Full name" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Assessor Organisation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: raForm.assessorSupplierId ?? null, valueName: raForm.assessorOrganisation, onChange: (id, name) => setRaForm((f) => ({ ...f, assessorSupplierId: id, assessorOrganisation: name })) })
          ] })
        ] }),
        fields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Fields Covered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#fafafa" }, children: fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { style: { display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: "0.8rem", userSelect: "none" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: raFieldIds.includes(f.id), onChange: (e) => setRaFieldIds((ids) => e.target.checked ? [...ids, f.id] : ids.filter((id) => id !== f.id)), style: { cursor: "pointer" } }),
            f.name
          ] }, f.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Soil Type (MAFF/AHDB)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: raForm.soilType, onValueChange: (v) => setRaForm((f) => ({ ...f, soilType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select texture…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: soilTypes.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Organic Matter Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: raForm.organicMatterLevel, onValueChange: (v) => setRaForm((f) => ({ ...f, organicMatterLevel: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Low", "Medium", "High"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Drainage Risk" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: raForm.drainageRisk, onValueChange: (v) => setRaForm((f) => ({ ...f, drainageRisk: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Low", "Medium", "High"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Slope Risk" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: raForm.slopeRisk, onValueChange: (v) => setRaForm((f) => ({ ...f, slopeRisk: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Low", "Medium", "High"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Flood Risk" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: raForm.floodRisk, onChange: (e) => setRaForm((f) => ({ ...f, floodRisk: e.target.value })), placeholder: "e.g. Zone 1, Zone 3" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Distance to Watercourse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: raForm.distanceToWatercourse, onChange: (e) => setRaForm((f) => ({ ...f, distanceToWatercourse: e.target.value })), placeholder: "e.g. >50m, 20m" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Application Restrictions Identified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: raForm.applicationRestrictionsIdentified, onChange: (e) => setRaForm((f) => ({ ...f, applicationRestrictionsIdentified: e.target.value })), placeholder: "e.g. No spreading Dec–Feb, 10m buffer required near drain" }),
          raForm.applicationRestrictionsIdentified?.trim() && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 mt-1 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3 h-3" }),
            " This restriction will appear as a standing notice in the Week Ahead planner."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Mitigation Measures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: raForm.mitigationMeasures, onChange: (e) => setRaForm((f) => ({ ...f, mitigationMeasures: e.target.value })), placeholder: "e.g. Trailing shoe only, maintain 10m buffer" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Overall Risk Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: raForm.overallRiskLevel, onValueChange: (v) => setRaForm((f) => ({ ...f, overallRiskLevel: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Low", "Medium", "High"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: v }, v)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Next Review Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: raForm.nextReviewDate, onChange: (e) => setRaForm((f) => ({ ...f, nextReviewDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: raForm.notes, onChange: (e) => setRaForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setRaAddOpen(false);
          setRaEditItem(null);
          setRaFieldIds([]);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          if (raEditItem) raUpdateMut.mutate({ id: raEditItem.id, body: raForm });
          else raCreateMut.mutate(raForm);
        }, disabled: !raForm.assessmentDate, children: "Save Assessment" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: raDeleteId !== null, onOpenChange: (open) => {
      if (!open) setRaDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Risk Assessment" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setRaDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => raDeleteId !== null && raDeleteMut.mutate(raDeleteId), children: "Delete" })
      ] })
    ] }) }),
    tab === "contacts" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/60", children: "Farm contacts register for assessors, agronomists, vets, and advisers. Select a contact when recording risk assessments to auto-populate assessor details." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setContactForm({ ...emptyContactForm });
          setContactAddOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          " Add Contact"
        ] })
      ] }),
      contactsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/40 text-center py-10", children: "Loading…" }) : contacts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl p-10 text-center text-foreground/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No contacts added yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Add assessors, agronomists and advisers to quickly populate risk assessment records." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { borderBottom: "2px solid #e5e7eb" }, children: ["Name", "Organisation", "Role", "Email", "Phone", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "0.5rem 0.75rem", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", color: "#6b7280", letterSpacing: "0.05em" }, children: h }, h)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: contacts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.625rem 0.75rem", fontWeight: 500 }, children: [
            c.name,
            c.qualifications && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: c.qualifications })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: c.organisation || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem", color: "#6b7280" }, children: c.role || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: c.email ? /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `mailto:${c.email}`, style: { color: "#3b82f6", textDecoration: "none", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { style: { width: 12, height: 12 } }),
            c.email
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: c.phone ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 3 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { style: { width: 12, height: 12 } }),
            c.phone
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28 }, onClick: () => {
              setContactEditItem(c);
              setContactForm({ name: c.name, organisation: c.organisation ?? "", email: c.email ?? "", phone: c.phone ?? "", role: c.role ?? "", qualifications: c.qualifications ?? "", notes: c.notes ?? "" });
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { style: { width: 11, height: 11 } }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28, color: "#ef4444", borderColor: "#fca5a5" }, onClick: () => setContactDeleteId(c.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { style: { width: 11, height: 11 } }) })
          ] }) })
        ] }, c.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: contactAddOpen || !!contactEditItem, onOpenChange: (open) => {
      if (!open) {
        setContactAddOpen(false);
        setContactEditItem(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: contactEditItem ? "Edit Contact" : "Add Contact" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contactForm.name, onChange: (e) => setContactForm((f) => ({ ...f, name: e.target.value })), placeholder: "Full name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Organisation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contactForm.organisation, onChange: (e) => setContactForm((f) => ({ ...f, organisation: e.target.value })), placeholder: "Company or firm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contactForm.role, onChange: (e) => setContactForm((f) => ({ ...f, role: e.target.value })), placeholder: "e.g. NVZ Assessor, Agronomist" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: contactForm.email, onChange: (e) => setContactForm((f) => ({ ...f, email: e.target.value })), placeholder: "email@example.com" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contactForm.phone, onChange: (e) => setContactForm((f) => ({ ...f, phone: e.target.value })), placeholder: "01234 567890" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Qualifications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contactForm.qualifications, onChange: (e) => setContactForm((f) => ({ ...f, qualifications: e.target.value })), placeholder: "e.g. FACTS qualified, BASIS registered" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: contactForm.notes, onChange: (e) => setContactForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setContactAddOpen(false);
          setContactEditItem(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
          if (contactEditItem) contactUpdateMut.mutate({ id: contactEditItem.id, body: contactForm });
          else contactCreateMut.mutate(contactForm);
        }, disabled: !contactForm.name.trim(), children: "Save Contact" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: contactDeleteId !== null, onOpenChange: (open) => {
      if (!open) setContactDeleteId(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "This will remove the contact from the register. Existing risk assessments are not affected." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setContactDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => contactDeleteId !== null && contactDeleteMut.mutate(contactDeleteId), children: "Remove" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!nvzRaiseTask,
        onClose: () => setNvzRaiseTask(null),
        defaultTitle: nvzRaiseTask?.title ?? "",
        defaultDescription: nvzRaiseTask?.description ?? "",
        taskType: "nvz_restriction",
        module: "NVZ"
      }
    ),
    tab === "budget-calc" && /* @__PURE__ */ jsxRuntimeExports.jsx(NvzBudgetCalcTab, { fields, applications, selectedYear, farmId, raiseTaskFor, setRaiseTaskFor }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: nvzEditField !== null, onOpenChange: (o) => {
      if (!o) setNvzEditField(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
          "NVZ Settings — ",
          nvzEditField?.fieldName
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Mark this field as within a Nitrate Vulnerable Zone and set its land type for closed-period calculations." })
      ] }),
      nvzEditField && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              id: "isNvzCheck",
              checked: nvzEditForm.isNvz,
              onChange: (e) => setNvzEditForm((f) => ({ ...f, isNvz: e.target.checked })),
              className: "w-4 h-4 accent-green-600"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "isNvzCheck", className: "text-sm font-medium cursor-pointer", children: "This field is within a Nitrate Vulnerable Zone (NVZ)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium mb-1.5 block", children: "Land Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: nvzEditForm.nvzLandType,
              onValueChange: (v) => setNvzEditForm((f) => ({ ...f, nvzLandType: v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select land type…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: LAND_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, className: "capitalize", children: t }, t)) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mt-1", children: "Used to determine closed periods for slurry and digestate." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setNvzEditField(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            disabled: nvzEditMut.isPending,
            onClick: () => {
              if (!nvzEditField) return;
              nvzEditMut.mutate({
                fieldId: nvzEditField.fieldId,
                body: { isNvz: nvzEditForm.isNvz, nvzLandType: nvzEditForm.nvzLandType || null }
              });
            },
            children: nvzEditMut.isPending ? "Saving…" : "Save Settings"
          }
        )
      ] })
    ] }) })
  ] });
}
const N_LIMITS = {
  arable: { organic: 170, total: 250, syntheticMax: 150 },
  grassland: { organic: 170, total: 300, syntheticMax: 200 },
  mixed: { organic: 170, total: 250, syntheticMax: 175 }
};
const BUDGET_ORGANIC_TYPES = /* @__PURE__ */ new Set(["slurry", "pig-slurry", "poultry-manure", "fym", "digestate-liquid", "digestate-solid", "sewage-sludge", "compost", "other-organic"]);
function NvzBudgetCalcTab({ fields, applications, selectedYear, farmId, raiseTaskFor, setRaiseTaskFor }) {
  const nvzFields = fields.filter((f) => f.isNvz && f.isActive !== false);
  const [extras, setExtras] = reactExports.useState({});
  const setExtra = (fieldId, key, val) => setExtras((p) => ({ ...p, [fieldId]: { ...p[fieldId] ?? { synth: "", organic: "" }, [key]: val } }));
  if (nvzFields.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-8 h-8 mx-auto mb-3 opacity-30" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "No NVZ fields configured" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm mt-1", children: "Mark fields as NVZ in the NVZ Summary tab to use the budget calculator." })
    ] });
  }
  const yearApps = applications.filter((a) => a.applicationDate?.startsWith(String(selectedYear)));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-4 h-4 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          "Nitrogen Budget Calculator — ",
          selectedYear
        ] }),
        " — Shows actual N applied (from your application log) plus any manual additions, against DEFRA Action Programme limits for NVZ fields. Organic N limit: ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "170 kg N/ha/yr" }),
        ". Total N limit varies by land type."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b text-xs text-gray-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2.5 font-medium", children: "Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2.5 font-medium", children: "Land type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2.5 font-medium", children: "Area (ha)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2.5 font-medium", children: "Logged N (kg/ha)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2.5 font-medium", children: "+ Synthetic N" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2.5 font-medium", children: "+ Organic N" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2.5 font-medium", children: "Total N" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2.5 font-medium", children: "Limit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-2.5 font-medium", children: "Remaining" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center px-3 py-2.5 font-medium", children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: nvzFields.map((field, i, arr) => {
        const fid = field.id;
        const landType = field.landType || "arable";
        const limits = N_LIMITS[landType] ?? N_LIMITS["arable"];
        const ha = parseFloat(String(field.areaHectares ?? "0")) || 1;
        const fieldApps = yearApps.filter((a) => a.fieldId === fid);
        const loggedN = fieldApps.reduce((s, a) => {
          const n = parseFloat(String(a.totalNitrogenKgHa ?? "0")) || 0;
          return s + n;
        }, 0);
        const loggedOrganic = fieldApps.filter((a) => BUDGET_ORGANIC_TYPES.has(a.productType ?? "")).reduce((s, a) => s + (parseFloat(String(a.totalNitrogenKgHa ?? "0")) || 0), 0);
        const extraSynth = parseFloat(extras[fid]?.synth ?? "0") || 0;
        const extraOrganic = parseFloat(extras[fid]?.organic ?? "0") || 0;
        const totalOrganic = loggedOrganic + extraOrganic;
        const totalN = loggedN + extraSynth + extraOrganic;
        const remaining = limits.total - totalN;
        const organicOk = totalOrganic <= 170;
        const totalOk = totalN <= limits.total;
        const status = !organicOk ? "organic-breach" : !totalOk ? "total-breach" : remaining < 30 ? "near-limit" : "ok";
        const statusBadge = {
          "ok": { label: "Within limit", bg: "#dcfce7", col: "#15803d" },
          "near-limit": { label: "Near limit", bg: "#fef9c3", col: "#92400e" },
          "organic-breach": { label: "Organic over", bg: "#fee2e2", col: "#b91c1c" },
          "total-breach": { label: "Over limit", bg: "#fee2e2", col: "#b91c1c" }
        }[status];
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium", children: field.name ?? `Field ${fid}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 capitalize text-gray-500 text-xs", children: landType }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right text-gray-600", children: ha.toFixed(1) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right font-mono", children: loggedN.toFixed(1) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "0", step: "any", className: "w-16 border rounded px-1.5 py-1 text-xs text-right", value: extras[fid]?.synth ?? "", onChange: (e) => setExtra(fid, "synth", e.target.value), placeholder: "0" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "0", step: "any", className: "w-16 border rounded px-1.5 py-1 text-xs text-right", value: extras[fid]?.organic ?? "", onChange: (e) => setExtra(fid, "organic", e.target.value), placeholder: "0" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right font-mono font-semibold", children: totalN.toFixed(1) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right text-gray-500", children: limits.total }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-right font-mono", style: { color: remaining < 0 ? "#dc2626" : remaining < 30 ? "#d97706" : "#16a34a", fontWeight: 600 }, children: remaining.toFixed(1) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2.5 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2 py-0.5 rounded-full font-medium", style: { background: statusBadge.bg, color: statusBadge.col }, children: statusBadge.label }) })
        ] }, fid);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: raiseTaskFor ? `NVZ Closed Period Breach — ${raiseTaskFor.fieldName ?? `Field #${raiseTaskFor.fieldId}`}` : "",
        defaultDescription: raiseTaskFor ? `Application of ${raiseTaskFor.productName} (${PRODUCT_TYPES.find((p) => p.value === raiseTaskFor.productType)?.label ?? raiseTaskFor.productType}) on ${raiseTaskFor.applicationDate ? new Date(raiseTaskFor.applicationDate).toLocaleDateString("en-GB") : "unknown date"} may be within a closed spreading period. Review and notify EA if required.` : "",
        module: "nvz"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-gray-400 space-y-0.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "Logged N is taken from your NVZ Application Log for ",
        selectedYear,
        ". Use the +Synthetic N / +Organic N columns to add any additional applications not yet recorded."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Organic N limit: 170 kg N/ha/yr (all NVZ fields). Total N limits: arable 250, grassland 300, mixed 250 kg/ha/yr — DEFRA Action Programme for Nitrates, England." })
    ] })
  ] });
}
export {
  NVZPage as default
};
