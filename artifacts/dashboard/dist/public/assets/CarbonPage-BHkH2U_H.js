import { s as createLucideIcon, c as useQueryClient, r as reactExports, j as jsxRuntimeExports, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, d as Button, e as LoaderCircle, b as useAppStore, R as Redirect, n as Card, o as CardContent, a as useToast, m as useQuery, S as useMutation, T as Plus, N as DialogMutationError, C as Checkbox } from "./index-Dlv8zTbH.js";
import { u as usePersistedTab } from "./use-persisted-tab-kRRD9k4Y.js";
import { a as usePersistedFilter } from "./use-persisted-filter-DGO1esrN.js";
import { p as printProReport } from "./print-report-slff5PK4.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { p as parseCsvText } from "./bottling-csv-BeHtHDhe.js";
import { F as FileText } from "./shield-alert-DeBoPUxh.js";
import { U as Upload } from "./upload-3UK8R7NW.js";
import { C as CircleAlert } from "./database-4ecPHfqF.js";
import { D as Download } from "./download-C-5y8VBs.js";
import { C as CircleCheck } from "./circle-check-D4ULeYcW.js";
import { A as AppLayout, e as ChartColumn, E as Flame, Z as Zap, S as Sprout } from "./AppLayout-nEK-87Y8.js";
import { C as ConfirmDialog } from "./confirm-dialog-DMT6hITH.js";
import { T as Textarea } from "./textarea-BHD8c2kf.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CqnRJHML.js";
import { T as TabBar, a as TabButton } from "./tab-button-BO6T60pV.js";
import { u as useLookupStrings } from "./use-lookup-B1XDjWew.js";
import { B as BuyerCombobox } from "./BuyerCombobox-JTOr4_BS.js";
import { R as RecordAttachments } from "./RecordAttachments-BO5C-UBP.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar } from "./generateCategoricalChart-BBXHVrDq.js";
import { B as BarChart } from "./BarChart-Cq-acIrf.js";
import { C as CartesianGrid } from "./CartesianGrid-DSY4SL_y.js";
import { P as Printer } from "./printer-DOja9Byg.js";
import { S as Sparkles } from "./sparkles-DpEY1fkA.js";
import { E as Eye } from "./eye-TnpyEpKW.js";
import { P as Pencil } from "./pencil-CbN6DX3b.js";
import { T as Trash2 } from "./trash-2-BdMcq7jT.js";
import "./use-safe-clerk-C1zu97Nb.js";
import "./triangle-alert-CBl_3SE7.js";
import "./shield-check-CiNKmxt1.js";
import "./tractor-B2MnitzB.js";
import "./index-oWQBDbaB.js";
import "./index-lH5v_mCx.js";
import "./chevron-up-Q3mGU4mZ.js";
import "./popover-CiD7pFWn.js";
import "./command-YI70LK_M.js";
import "./search-CT7tBRJn.js";
import "./chevrons-up-down-C7vUJJgr.js";
import "./user-plus-DeGXR8Ud.js";
import "./use-upload-C6ghB--B.js";
import "./paperclip-B7OQp7a5.js";
import "./image-DIH-7Kv8.js";
const __iconNode$2 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M8 18v-2", key: "qcmpov" }],
  ["path", { d: "M12 18v-4", key: "q1q25u" }],
  ["path", { d: "M16 18v-6", key: "15y0np" }]
];
const FileChartColumnIncreasing = createLucideIcon("file-chart-column-increasing", __iconNode$2);
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 3v1", key: "1asbbs" }],
  ["path", { d: "M12 20v1", key: "1wcdkc" }],
  ["path", { d: "M3 12h1", key: "lp3yf2" }],
  ["path", { d: "M20 12h1", key: "1vloll" }],
  ["path", { d: "m18.364 5.636-.707.707", key: "1hakh0" }],
  ["path", { d: "m6.343 17.657-.707.707", key: "18m9nf" }],
  ["path", { d: "m5.636 5.636.707.707", key: "1xv1c5" }],
  ["path", { d: "m17.657 17.657.707.707", key: "vl76zb" }]
];
const SunMedium = createLucideIcon("sun-medium", __iconNode$1);
const __iconNode = [
  ["path", { d: "M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z", key: "1l6gj6" }],
  ["path", { d: "M7 16v6", key: "1a82de" }],
  ["path", { d: "M13 19v3", key: "13sx9i" }],
  [
    "path",
    {
      d: "M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5",
      key: "1sj9kv"
    }
  ]
];
const Trees = createLucideIcon("trees", __iconNode);
function normKey(k) {
  return k.toLowerCase().trim().replace(/[\s\-–]+/g, "_").replace(/[^a-z0-9_]/g, "");
}
const ALIASES = {
  report_year: "auditYear",
  year: "auditYear",
  audit_year: "auditYear",
  reporting_year: "auditYear",
  total_emissions_tco2e: "totalTco2e",
  gross_emissions_tco2e: "totalTco2e",
  total_tco2e: "totalTco2e",
  gross_tco2e: "totalTco2e",
  total_carbon_emissions: "totalTco2e",
  total_emissions: "totalTco2e",
  total_sequestration_tco2e: "seqTco2e",
  sequestration_tco2e: "seqTco2e",
  total_sequestration: "seqTco2e",
  sequestration: "seqTco2e",
  net_emissions_tco2e: "netTco2e",
  net_tco2e: "netTco2e",
  net_emissions: "netTco2e",
  net_carbon: "netTco2e",
  emissions_per_ha_tco2e: "intensityPerHa",
  tco2e_per_ha: "intensityPerHa",
  intensity_per_ha: "intensityPerHa",
  fuel_emissions_tco2e: "fuelTco2e",
  fuel_energy_tco2e: "fuelTco2e",
  energy_emissions: "fuelTco2e",
  fuel_tco2e: "fuelTco2e",
  energy_tco2e: "fuelTco2e",
  fertiliser_emissions_tco2e: "fertTco2e",
  fertilizer_emissions_tco2e: "fertTco2e",
  soil_emissions_tco2e: "fertTco2e",
  fertiliser_soil_tco2e: "fertTco2e",
  fertiliser_tco2e: "fertTco2e",
  livestock_emissions_tco2e: "livestockTco2e",
  livestock_tco2e: "livestockTco2e",
  enteric_emissions_tco2e: "entericTco2e",
  enteric_tco2e: "entericTco2e",
  manure_emissions_tco2e: "manureTco2e",
  manure_tco2e: "manureTco2e",
  inputs_emissions_tco2e: "inputsTco2e",
  purchased_inputs_tco2e: "inputsTco2e",
  supply_chain_tco2e: "inputsTco2e",
  inputs_tco2e: "inputsTco2e",
  transport_emissions_tco2e: "transportTco2e",
  transport_tco2e: "transportTco2e",
  woodland_ha: "woodlandHa",
  woodland_area_ha: "woodlandHa",
  hedgerow_km: "hedgerowKm",
  hedgerow_length_km: "hedgerowKm",
  grassland_ha: "grasslandHa",
  permanent_grassland_ha: "grasslandHa",
  woodland_sequestration_tco2e: "woodlandSeqTco2e",
  hedgerow_sequestration_tco2e: "hedgerowSeqTco2e",
  grassland_sequestration_tco2e: "grasslandSeqTco2e",
  peatland_sequestration_tco2e: "peatlandSeqTco2e",
  peatland_ha: "peatlandHa",
  agroforestry_ha: "agroforestryHa",
  agroforestry_sequestration_tco2e: "agroforestrySeqTco2e",
  farm_name: "farmName",
  report_name: "reportName",
  farm_type: "farmType",
  total_farm_area_ha: "farmAreaHa"
};
function mapRow(row) {
  const out = {};
  for (const [k, v] of Object.entries(row)) {
    const mapped = ALIASES[normKey(k)] ?? normKey(k);
    out[mapped] = v;
  }
  return out;
}
function num(v) {
  if (!v || v.trim() === "" || v === "—") return null;
  const n = parseFloat(v.replace(/,/g, ""));
  return isNaN(n) ? null : n;
}
function buildPlan(mapped) {
  const audit = {
    auditYear: mapped.auditYear ?? "",
    totalTco2e: num(mapped.totalTco2e),
    seqTco2e: num(mapped.seqTco2e),
    netTco2e: num(mapped.netTco2e),
    intensityPerHa: num(mapped.intensityPerHa),
    farmName: mapped.farmName ?? mapped.reportName ?? ""
  };
  const emissions = [];
  const addEmission = (tco2eKey, category, scope, desc) => {
    const v = num(mapped[tco2eKey]);
    if (v != null && v > 0) emissions.push({ category, scope, activityDescription: desc, tonnesCo2e: v });
  };
  addEmission("fuelTco2e", "Fuel & Energy", "Scope 1", "Fuel & energy use (FCT import)");
  addEmission("fertTco2e", "Soil & Fertiliser N₂O", "Scope 1", "Fertiliser & soil emissions (FCT import)");
  if (mapped.entericTco2e && num(mapped.entericTco2e) != null) {
    addEmission("entericTco2e", "Livestock Enteric Fermentation", "Scope 1", "Livestock enteric fermentation (FCT import)");
    addEmission("manureTco2e", "Livestock Manure", "Scope 1", "Livestock manure management (FCT import)");
  } else {
    addEmission("livestockTco2e", "Livestock Enteric Fermentation", "Scope 1", "Livestock emissions (FCT import)");
  }
  addEmission("inputsTco2e", "Purchased Inputs", "Scope 3", "Purchased inputs & supply chain (FCT import)");
  addEmission("transportTco2e", "Transport", "Scope 3", "Transport emissions (FCT import)");
  const sequestration = [];
  const addSeq = (seqKey, areaKey, featureType, unit) => {
    const tco2e = num(mapped[seqKey]);
    const area = num(mapped[areaKey]);
    if (tco2e != null || area != null) {
      sequestration.push({ featureType, areaHaOrLengthM: area, unit, tonnesCo2eSequestered: tco2e });
    }
  };
  addSeq("woodlandSeqTco2e", "woodlandHa", "Woodland", "ha");
  addSeq("hedgerowSeqTco2e", "hedgerowKm", "Hedgerow", "km");
  addSeq("grasslandSeqTco2e", "grasslandHa", "Permanent Grassland", "ha");
  addSeq("peatlandSeqTco2e", "peatlandHa", "Peatland", "ha");
  addSeq("agroforestrySeqTco2e", "agroforestryHa", "Agroforestry", "ha");
  if (sequestration.length === 0 && audit.seqTco2e != null && audit.seqTco2e > 0) {
    sequestration.push({ featureType: "Other", areaHaOrLengthM: null, unit: "ha", tonnesCo2eSequestered: audit.seqTco2e });
  }
  const knownMapped = new Set(Object.values(ALIASES));
  const unmappedCols = Object.keys(mapped).filter((k) => !knownMapped.has(k) && mapped[k]?.trim() !== "");
  return { audit, emissions, sequestration, unmappedCols };
}
const SAMPLE_CSV = `report_year,farm_name,farm_type,total_farm_area_ha,fuel_emissions_tco2e,fertiliser_emissions_tco2e,livestock_emissions_tco2e,inputs_emissions_tco2e,woodland_ha,woodland_sequestration_tco2e,hedgerow_km,hedgerow_sequestration_tco2e,grassland_ha,grassland_sequestration_tco2e,total_emissions_tco2e,total_sequestration_tco2e,net_emissions_tco2e,emissions_per_ha_tco2e
2024,"Green Acres Farm",Mixed,320,45.2,82.1,205.7,38.3,8.5,18.4,4.2,6.8,120,36.9,371.3,62.1,309.2,0.97`;
function downloadTemplate() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "fct_import_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}
function FctImportDialog({ open, farmId, onClose }) {
  const qc = useQueryClient();
  const fileRef = reactExports.useRef(null);
  const [step, setStep] = reactExports.useState("upload");
  const [dragOver, setDragOver] = reactExports.useState(false);
  const [fileName, setFileName] = reactExports.useState("");
  const [plan, setPlan] = reactExports.useState(null);
  const [ignoredRows, setIgnoredRows] = reactExports.useState(0);
  const [parseError, setParseError] = reactExports.useState("");
  const [conductedBy, setConductedBy] = reactExports.useState("");
  const [auditDate, setAuditDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
  const [supplyChain, setSupplyChain] = reactExports.useState("");
  const [notes, setNotes] = reactExports.useState("");
  const [importEmissions, setImportEmissions] = reactExports.useState(true);
  const [importSeq, setImportSeq] = reactExports.useState(true);
  const [saving, setSaving] = reactExports.useState(false);
  const [savedCounts, setSavedCounts] = reactExports.useState({ audit: 0, emissions: 0, seq: 0 });
  const reset = () => {
    setStep("upload");
    setFileName("");
    setPlan(null);
    setParseError("");
    setIgnoredRows(0);
    setConductedBy("");
    setAuditDate((/* @__PURE__ */ new Date()).toISOString().slice(0, 10));
    setSupplyChain("");
    setNotes("");
    setImportEmissions(true);
    setImportSeq(true);
    setSaving(false);
  };
  const handleClose = () => {
    reset();
    onClose();
  };
  const processCsv = (text, name) => {
    setParseError("");
    try {
      const records = parseCsvText(text);
      if (records.length < 2) throw new Error("CSV must have a header row and at least one data row.");
      const headers = records[0];
      const values = records[1];
      const extraRows = records.slice(2).filter((row) => row.some((cell) => cell != null && cell.trim() !== "")).length;
      const rawRow = {};
      headers.forEach((h, i) => {
        rawRow[h] = values[i] ?? "";
      });
      const mapped = mapRow(rawRow);
      const importPlan = buildPlan(mapped);
      if (!importPlan.audit.auditYear && !importPlan.audit.totalTco2e) {
        throw new Error("Could not find audit year or emissions totals in this CSV. Please check the file or use the template.");
      }
      setFileName(name);
      setPlan(importPlan);
      setIgnoredRows(extraRows);
      setStep("review");
    } catch (e) {
      setParseError(e instanceof Error ? e.message : "Unknown parse error");
    }
  };
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => processCsv(ev.target?.result, f.name);
    reader.readAsText(f);
  };
  const onDrop = reactExports.useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".csv")) {
      setParseError("Please upload a .csv file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => processCsv(ev.target?.result, f.name);
    reader.readAsText(f);
  }, []);
  const doImport = async () => {
    if (!plan) return;
    setSaving(true);
    let emissionCount = 0;
    let seqCount = 0;
    try {
      const year = plan.audit.auditYear || String((/* @__PURE__ */ new Date()).getFullYear());
      await fetch(apiUrl(`farms/${farmId}/carbon-audits`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          auditYear: year,
          auditDate,
          conductedBy: conductedBy || "Farm Carbon Toolkit (FCT)",
          auditTool: "Farm Carbon Toolkit (FCT)",
          supplyChainRequirement: supplyChain,
          totalTonnesCo2e: plan.audit.totalTco2e,
          sequestrationTonnesCo2e: plan.audit.seqTco2e,
          netTonnesCo2e: plan.audit.netTco2e,
          notes: notes || `Imported from FCT CSV export (${fileName})`
        })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      if (importEmissions) {
        for (const rec of plan.emissions) {
          await fetch(apiUrl(`farms/${farmId}/carbon-emissions`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              emissionYear: year,
              scope: rec.scope,
              category: rec.category,
              activityDescription: rec.activityDescription,
              tonnesCo2e: rec.tonnesCo2e,
              emissionFactorSource: "Farm Carbon Toolkit (FCT)"
            })
          }).then(async (r) => {
            if (!r.ok) {
              const t = await r.text().catch(() => "");
              throw new Error(t || `Request failed (${r.status})`);
            }
            return r;
          });
          emissionCount++;
        }
      }
      if (importSeq) {
        for (const rec of plan.sequestration) {
          await fetch(apiUrl(`farms/${farmId}/carbon-sequestration`), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              sequestrationYear: year,
              featureType: rec.featureType,
              featureName: `${rec.featureType} (FCT ${year})`,
              areaHaOrLengthM: rec.areaHaOrLengthM,
              unit: rec.unit,
              tonnesCo2eSequestered: rec.tonnesCo2eSequestered,
              sequestrationFactorSource: "Farm Carbon Toolkit (FCT)"
            })
          }).then(async (r) => {
            if (!r.ok) {
              const t = await r.text().catch(() => "");
              throw new Error(t || `Request failed (${r.status})`);
            }
            return r;
          });
          seqCount++;
        }
      }
      qc.invalidateQueries({ queryKey: ["carbon-audits", farmId] });
      qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] });
      qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] });
      setSavedCounts({ audit: 1, emissions: emissionCount, seq: seqCount });
      setStep("done");
    } catch {
      setParseError("Import failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) handleClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "46rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-green-600" }),
      "Import from Farm Carbon Toolkit"
    ] }) }),
    step === "upload" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Export your completed report from",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "https://calculator.farmcarbontoolkit.org.uk", target: "_blank", rel: "noreferrer", className: "underline text-green-700", children: "calculator.farmcarbontoolkit.org.uk" }),
        " ",
        "as a CSV, then upload it here. We'll map the figures automatically."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${dragOver ? "border-green-500 bg-green-50" : "border-muted-foreground/30 hover:border-green-400"}`,
          onClick: () => fileRef.current?.click(),
          onDragOver: (e) => {
            e.preventDefault();
            setDragOver(true);
          },
          onDragLeave: () => setDragOver(false),
          onDrop,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-8 h-8 mx-auto mb-2 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Drop your FCT CSV here, or click to browse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: ".csv files only" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileRef, type: "file", accept: ".csv", className: "hidden", onChange: onFileChange })
          ]
        }
      ),
      parseError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: parseError })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: downloadTemplate, className: "text-xs text-green-700 underline flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" }),
          " Download sample template"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Not sure of the format? Use the sample template as a guide." })
      ] })
    ] }),
    step === "review" && plan && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 max-h-[70vh] overflow-y-auto pr-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Parsed ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fileName }),
          " successfully. Review the data below before importing."
        ] })
      ] }),
      ignoredRows > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm text-amber-800 bg-amber-50 p-3 rounded-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Only the first data row will be imported — ",
          ignoredRows,
          " additional data",
          " ",
          ignoredRows === 1 ? "row was" : "rows were",
          " found in this CSV and will be ignored. To import another year, export it as a separate CSV and import it separately."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: "Carbon Audit Record" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded p-2 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Audit Year" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: plan.audit.auditYear || "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-orange-50 rounded p-2 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Gross Emissions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-orange-700", children: plan.audit.totalTco2e != null ? `${plan.audit.totalTco2e} tCO₂e` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 rounded p-2 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Sequestration" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-green-700", children: plan.audit.seqTco2e != null ? `${plan.audit.seqTco2e} tCO₂e` : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 rounded p-2 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Net Emissions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-blue-700", children: plan.audit.netTco2e != null ? `${plan.audit.netTco2e} tCO₂e` : "—" })
          ] }),
          plan.audit.intensityPerHa != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/40 rounded p-2 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Intensity/ha" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold", children: [
              plan.audit.intensityPerHa,
              " tCO₂e/ha"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Audit Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: auditDate, onChange: (e) => setAuditDate(e.target.value), className: "mt-1 h-8 text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Conducted By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: conductedBy, onChange: (e) => setConductedBy(e.target.value), placeholder: "Farm Carbon Toolkit (FCT)", className: "mt-1 h-8 text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Supply Chain Customer (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: supplyChain, onChange: (e) => setSupplyChain(e.target.value), placeholder: "e.g. Tesco, ABP", className: "mt-1 h-8 text-sm" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Notes (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "e.g. Annual FCT submission", className: "mt-1 h-8 text-sm" })
          ] })
        ] })
      ] }),
      plan.emissions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: [
            "Emission Breakdown (",
            plan.emissions.length,
            " records)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1.5 text-xs cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: importEmissions, onChange: (e) => setImportEmissions(e.target.checked) }),
            "Import these"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 text-muted-foreground font-medium", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 text-muted-foreground font-medium", children: "Scope" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1 text-muted-foreground font-medium", children: "tCO₂e" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: plan.emissions.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1", children: r.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-muted-foreground", children: r.scope }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right font-medium", children: r.tonnesCo2e.toFixed(2) })
          ] }, i)) })
        ] })
      ] }),
      plan.sequestration.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide", children: [
            "Sequestration (",
            plan.sequestration.length,
            " records)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1.5 text-xs cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: importSeq, onChange: (e) => setImportSeq(e.target.checked) }),
            "Import these"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 text-muted-foreground font-medium", children: "Feature" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 text-muted-foreground font-medium", children: "Area/Length" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-1 text-muted-foreground font-medium", children: "tCO₂e Sequestered" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: plan.sequestration.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1", children: r.featureType }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-muted-foreground", children: r.areaHaOrLengthM != null ? `${r.areaHaOrLengthM} ${r.unit}` : "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 text-right font-medium", children: r.tonnesCo2eSequestered != null ? r.tonnesCo2eSequestered.toFixed(2) : "—" })
          ] }, i)) })
        ] })
      ] }),
      plan.unmappedCols.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground bg-muted/30 p-3 rounded-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Columns not mapped:" }),
        " ",
        plan.unmappedCols.join(", "),
        " — these values won't be imported."
      ] }),
      parseError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: parseError })
      ] })
    ] }),
    step === "done" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-6 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-12 h-12 text-green-600 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Import complete" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          savedCounts.audit,
          " Carbon Audit record created"
        ] }),
        savedCounts.emissions > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          savedCounts.emissions,
          " Emission records created"
        ] }),
        savedCounts.seq > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          savedCounts.seq,
          " Sequestration records created"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Records are now visible in the Carbon Audits, Emissions, and Sequestration tabs." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      step === "upload" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleClose, children: "Cancel" }),
      step === "review" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setStep("upload");
          setParseError("");
        }, className: "mr-auto", children: "← Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: handleClose, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: doImport, disabled: saving, className: "bg-green-700 hover:bg-green-800", children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-1 animate-spin" }),
          "Importing…"
        ] }) : `Import ${1 + (importEmissions ? plan.emissions.length : 0) + (importSeq ? plan.sequestration.length : 0)} records` })
      ] }),
      step === "done" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleClose, children: "Done" })
    ] })
  ] }) });
}
const fmt = (v) => v == null || v === "" ? "—" : String(v);
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
function Empty({ msg }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: msg });
}
function DataTable({ cols, rows, onEdit, onDelete, onView, deleteMutation }) {
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (deleteMutation?.isSuccess) setPendingDelete(null);
  }, [deleteMutation?.isSuccess]);
  if (!rows.length) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No records yet." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: c.label }, c.key)),
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
        cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: c.fmt ? c.fmt(row) : fmt(row[c.key]) }, c.key)),
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1", children: [
          onView && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onView(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          onEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onEdit(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          onDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
            deleteMutation?.reset();
            setPendingDelete(row);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!pendingDelete,
        title: "Delete Record",
        message: "Are you sure you want to delete this record? This cannot be undone.",
        mutation: deleteMutation,
        onConfirm: () => {
          if (pendingDelete && onDelete) {
            onDelete(pendingDelete);
            if (!deleteMutation) setPendingDelete(null);
          }
        },
        onCancel: () => {
          setPendingDelete(null);
          deleteMutation?.reset();
        },
        confirmLabel: "Delete",
        confirmVariant: "destructive"
      }
    )
  ] });
}
const AUDIT_TOOLS = [
  "Agrecalc",
  "Cool Farm Tool",
  "Farm Carbon Toolkit",
  "AHDB Carbon Calculator",
  "SAC Carbon Calculator",
  "Carbon Footprint Ltd",
  "Arla Carbon Check",
  "Soil Association / OF&G calculator",
  "Bespoke consultant methodology",
  "Other"
];
const AUDIT_VERIFICATION_STATUSES = [
  "Self-assessed / unverified",
  "Internal review completed",
  "Third-party verified",
  "Certified (e.g. PAS 2060)"
];
const AUDITOR_TYPES = [
  "Internal staff member",
  "External auditor / consultant",
  "Not yet confirmed"
];
function AuditsTab({ farmId, prefillAudit, onPrefillUsed }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [showImport, setShowImport] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [auditorMode, setAuditorMode] = reactExports.useState("list");
  const [certBodyMode, setCertBodyMode] = reactExports.useState("list");
  reactExports.useEffect(() => {
    if (!prefillAudit) return;
    setEditing(null);
    setAuditorMode("list");
    setCertBodyMode("list");
    setForm({
      totalScope1TonnesCo2e: prefillAudit.scope1.toFixed(3),
      totalScope2TonnesCo2e: prefillAudit.scope2.toFixed(3),
      totalScope3TonnesCo2e: prefillAudit.scope3.toFixed(3),
      totalTonnesCo2e: prefillAudit.total.toFixed(3),
      notes: prefillAudit.notes
    });
    setOpen(true);
    onPrefillUsed?.();
  }, [prefillAudit]);
  const certBodies = useLookupStrings("carbon_certification_bodies", [
    "Carbon Trust",
    "BSI (PAS 2060)",
    "LRQA (Lloyd's Register)",
    "Bureau Veritas",
    "SGS UK",
    "Intertek",
    "ADAS",
    "SAC Consulting",
    "Agrecalc Carbon Assurance",
    "Farm Carbon Toolkit",
    "Carbon Footprint Ltd",
    "Soil Association (organic carbon)",
    "Agri Carbon",
    "Other"
  ]);
  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["carbon-audits", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/carbon-audits`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: staffList = [] } = useQuery({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/staff`), { credentials: "include" }).then((r) => r.json()).then((d) => d.staff ?? [])
  });
  const { data: auditorSuppliers = [] } = useQuery({
    queryKey: ["contractor-suppliers", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/contractor-suppliers`), { credentials: "include" }).then((r) => r.ok ? r.json() : { records: [] }).then((d) => d.records ?? [])
  });
  const save = useMutation({
    mutationFn: (b) => fetch(
      editing ? apiUrl(`farms/${farmId}/carbon-audits/${editing.id}`) : apiUrl(`farms/${farmId}/carbon-audits`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carbon-audits", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/carbon-audits/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-audits", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const isInternal = form.auditorType === "Internal staff member";
  const isExternal = form.auditorType === "External auditor / consultant";
  const chartData = audits.filter((a) => a.auditYear && a.totalTonnesCo2e != null).sort((a, b) => Number(a.auditYear) - Number(b.auditYear)).map((a) => ({
    year: String(a.auditYear),
    gross: a.totalTonnesCo2e != null ? parseFloat(String(a.totalTonnesCo2e)) : 0,
    net: a.netTonnesCo2e != null ? parseFloat(String(a.netTonnesCo2e)) : 0,
    seq: a.sequestrationTonnesCo2e != null ? parseFloat(String(a.sequestrationTonnesCo2e)) : 0
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Carbon Audits" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setShowImport(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 mr-1" }),
          "Import from FCT"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({});
          setAuditorMode("list");
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Audit"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FctImportDialog, { open: showImport, farmId, onClose: () => setShowImport(false) }),
    chartData.length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border rounded-lg p-4 bg-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3", children: "Year-on-Year Carbon Trend (tCO₂e)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: chartData, margin: { top: 4, right: 12, left: 0, bottom: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f3f4f6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "year", tick: { fontSize: 11 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, unit: "t" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { formatter: (v, name) => [`${v.toFixed(1)} tCO₂e`, name], contentStyle: { fontSize: "0.8rem" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: "0.75rem" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "gross", name: "Gross Emissions", fill: "#f97316", radius: [3, 3, 0, 0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "seq", name: "Sequestration", fill: "#22c55e", radius: [3, 3, 0, 0] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "net", name: "Net Emissions", fill: "#3b82f6", radius: [3, 3, 0, 0] })
      ] }) })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "auditYear", label: "Year" },
          { key: "auditDate", label: "Audit Date", fmt: (r) => fmtDate(r.auditDate) },
          { key: "conductedBy", label: "Conducted By" },
          { key: "auditorType", label: "Auditor Type" },
          { key: "auditTool", label: "Audit Tool" },
          { key: "verificationStatus", label: "Verification" },
          { key: "totalTonnesCo2e", label: "Total tCO₂e" },
          { key: "netTonnesCo2e", label: "Net tCO₂e" }
        ],
        rows: audits,
        onView: setViewRecord,
        onEdit: (r) => {
          setEditing(r);
          setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
          setAuditorMode(r.conductedBy && staffList.some((s) => s.name === r.conductedBy) ? "list" : "other");
          setCertBodyMode(r.certificationBody && certBodies.includes(String(r.certificationBody)) ? "list" : "other");
          setOpen(true);
        },
        onDelete: (r) => del.mutate(r.id),
        deleteMutation: del
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "46rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Carbon Audit" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2", children: "Audit Overview" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Audit Year" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.auditYear ?? "—") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Audit Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.auditDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Audit Tool / Methodology" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.auditTool ?? "—") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Verification Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.verificationStatus ?? "—") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Supply Chain Customer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.supplyChainRequirement ?? "—") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Certification Body" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.certificationBody ?? "—") })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2", children: "Auditor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Auditor Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.auditorType ?? "—") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Conducted By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.conductedBy ?? "—") })
            ] }),
            !!viewRecord.auditorCompany && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Auditor Company" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.auditorCompany) }),
              !!viewRecord.auditorSupplierId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Linked to supplier record" })
            ] }),
            !!viewRecord.linkedPoReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Linked PO Reference" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: String(viewRecord.linkedPoReference) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2", children: "Emissions Figures (tCO₂e)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-3", children: [
            ["Scope 1", viewRecord.totalScope1TonnesCo2e],
            ["Scope 2", viewRecord.totalScope2TonnesCo2e],
            ["Scope 3", viewRecord.totalScope3TonnesCo2e],
            ["Gross Total", viewRecord.totalTonnesCo2e],
            ["Sequestration", viewRecord.sequestrationTonnesCo2e],
            ["Net Total", viewRecord.netTonnesCo2e]
          ].map(([label, val]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg px-3 py-2 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: String(label) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-base", children: val != null && val !== "" ? String(val) : "—" })
          ] }, String(label))) })
        ] }),
        !!(viewRecord.intensityPerTonneProd || viewRecord.reductionTargetPct) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          !!viewRecord.intensityPerTonneProd && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Intensity per Tonne Produced" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.intensityPerTonneProd) })
          ] }),
          !!viewRecord.reductionTargetPct && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Reduction Target (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              String(viewRecord.reductionTargetPct),
              "%"
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2", children: "Documents" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "carbon_audit_report", recordId: viewRecord.id })
        ] }),
        !!viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium whitespace-pre-wrap", children: String(viewRecord.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setEditing(viewRecord);
          setForm(Object.fromEntries(Object.entries(viewRecord).map(([k, v]) => [k, v == null ? "" : String(v)])));
          setAuditorMode(viewRecord.conductedBy && staffList.some((s) => s.name === viewRecord.conductedBy) ? "list" : "other");
          setCertBodyMode(viewRecord.certificationBody && certBodies.includes(String(viewRecord.certificationBody)) ? "list" : "other");
          setOpen(true);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) {
        setEditing(null);
        setForm({});
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "46rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Carbon Audit" : "Add Carbon Audit" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-h-[75vh] overflow-y-auto pr-1 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Audit Overview" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Audit Year *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.auditYear ?? "", onValueChange: (v) => setForm((f) => ({ ...f, auditYear: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select year" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EM_YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Audit Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.auditDate ?? "", onChange: (e) => setForm((f) => ({ ...f, auditDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Audit Tool / Methodology" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.auditTool ?? "", onValueChange: (v) => setForm((f) => ({ ...f, auditTool: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select tool…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: AUDIT_TOOLS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Verification Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.verificationStatus ?? "", onValueChange: (v) => setForm((f) => ({ ...f, verificationStatus: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select status…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: AUDIT_VERIFICATION_STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supply Chain Customer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.supplyChainRequirement ?? "", onValueChange: (v) => setForm((f) => ({ ...f, supplyChainRequirement: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select customer…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-60 overflow-y-auto", children: SR_CUSTOMERS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certification Body" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: certBodyMode === "other" ? "__other__" : form.certificationBody ?? "",
                  onValueChange: (v) => {
                    if (v === "__other__") {
                      setCertBodyMode("other");
                      setForm((f) => ({ ...f, certificationBody: "" }));
                      return;
                    }
                    setCertBodyMode("list");
                    setForm((f) => ({ ...f, certificationBody: v }));
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select certification body…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-60 overflow-y-auto", children: [
                      certBodies.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b, children: b }, b)),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Not listed / enter manually" })
                    ] })
                  ]
                }
              ),
              certBodyMode === "other" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  className: "mt-1.5",
                  value: form.certificationBody ?? "",
                  onChange: (e) => setForm((f) => ({ ...f, certificationBody: e.target.value })),
                  placeholder: "Enter certification body name…"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Auditor" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Auditor Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.auditorType ?? "", onValueChange: (v) => {
                setForm((f) => ({ ...f, auditorType: v, conductedBy: "", auditorStaffId: "", auditorCompany: "", auditorSupplierId: "", linkedPoReference: "" }));
                setAuditorMode("list");
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: AUDITOR_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
              ] })
            ] }),
            isInternal && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: auditorMode === "list" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Staff Member *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: form.auditorStaffId ?? "",
                  onValueChange: (v) => {
                    if (v === "__other__") {
                      setAuditorMode("other");
                      setForm((f) => ({ ...f, auditorStaffId: "", conductedBy: "" }));
                      return;
                    }
                    const m = staffList.find((s) => String(s.id ?? s.memberId) === v);
                    setForm((f) => ({ ...f, auditorStaffId: v, conductedBy: m?.name ?? "" }));
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select staff member…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                      staffList.map((s) => {
                        const id = String(s.id ?? s.memberId);
                        return /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: id, children: [
                          s.name,
                          s.role ? ` — ${s.role}` : ""
                        ] }, id);
                      }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Not in list (enter name manually)" })
                    ] })
                  ]
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.conductedBy ?? "", onChange: (e) => setForm((f) => ({ ...f, conductedBy: e.target.value })), placeholder: "Full name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "ghost", className: "shrink-0 text-xs", onClick: () => setAuditorMode("list"), children: "← Back to list" })
              ] })
            ] }) }),
            isExternal && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Auditor Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.conductedBy ?? "", onChange: (e) => setForm((f) => ({ ...f, conductedBy: e.target.value })), placeholder: "Individual name" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Auditor Company" }),
                auditorSuppliers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Select,
                    {
                      value: form.auditorSupplierId ?? "",
                      onValueChange: (v) => {
                        if (v === "__manual__") {
                          setForm((f) => ({ ...f, auditorSupplierId: "", auditorCompany: "" }));
                          return;
                        }
                        const s = auditorSuppliers.find((s2) => String(s2.id) === v);
                        setForm((f) => ({ ...f, auditorSupplierId: v, auditorCompany: s?.name ?? "" }));
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Link to supplier…" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                          auditorSuppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                            s.name,
                            s.category ? ` (${s.category})` : ""
                          ] }, s.id)),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "Not in supplier list" })
                        ] })
                      ]
                    }
                  ),
                  (!form.auditorSupplierId || form.auditorSupplierId === "__manual__") && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: form.auditorCompany ?? "", onChange: (e) => setForm((f) => ({ ...f, auditorCompany: e.target.value })), placeholder: "Company name (manual)" }),
                  !!form.auditorSupplierId && form.auditorSupplierId !== "__manual__" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Linked — enables PO / invoice matching" })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.auditorCompany ?? "", onChange: (e) => setForm((f) => ({ ...f, auditorCompany: e.target.value })), placeholder: "Company / organisation name" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked PO Reference" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.linkedPoReference ?? "", onChange: (e) => setForm((f) => ({ ...f, linkedPoReference: e.target.value })), placeholder: "e.g. PO-2024-0142" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Optional — links the audit fee to a purchase order" })
              ] })
            ] }),
            !form.auditorType && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conducted By *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.conductedBy ?? "", onChange: (e) => setForm((f) => ({ ...f, conductedBy: e.target.value })), placeholder: "Name of auditor or organisation" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Emissions Figures (tCO₂e)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: [
            ["totalScope1TonnesCo2e", "Scope 1 tCO₂e"],
            ["totalScope2TonnesCo2e", "Scope 2 tCO₂e"],
            ["totalScope3TonnesCo2e", "Scope 3 tCO₂e"],
            ["totalTonnesCo2e", "Gross Total tCO₂e"],
            ["sequestrationTonnesCo2e", "Sequestration tCO₂e"],
            ["netTonnesCo2e", "Net Total tCO₂e"],
            ["intensityPerTonneProd", "Intensity per Tonne Produced"],
            ["reductionTargetPct", "Reduction Target (%)"]
          ].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: l }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form[k] ?? "", onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })) })
          ] }, k)) })
        ] }),
        !!editing?.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Audit Report Document" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "carbon_audit_report", recordId: editing.id })
        ] }),
        !editing?.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "Save this audit first, then re-open to attach the report document." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2, placeholder: "Additional context, caveats, methodology notes…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save the audit — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }) : null,
          "Save"
        ] })
      ] })
    ] }) })
  ] });
}
const EM_YEARS = Array.from(
  { length: (/* @__PURE__ */ new Date()).getFullYear() - 2014 },
  (_, i) => String((/* @__PURE__ */ new Date()).getFullYear() + 1 - i)
);
const EM_FACTOR_SOURCES = [
  "DEFRA UK GHG Conversion Factors 2024",
  "DEFRA UK GHG Conversion Factors 2023",
  "IPCC 2019 Guidelines",
  "AHDB Carbon Calculator",
  "Agrecalc",
  "Cool Farm Tool",
  "Other / manual"
];
const EMISSION_TAXONOMY = {
  "Fuel & Energy": {
    scope: "Scope 1",
    subcategories: [
      { label: "Red diesel (Gas oil)", unit: "litres", factor: 2557e-6 },
      { label: "White diesel (DERV)", unit: "litres", factor: 2542e-6 },
      { label: "Petrol", unit: "litres", factor: 2154e-6 },
      { label: "LPG", unit: "litres", factor: 1566e-6 },
      { label: "Natural gas", unit: "kWh", factor: 183e-6 },
      { label: "Kerosene (heating)", unit: "litres", factor: 253e-5 },
      { label: "Grid electricity (Scope 2)", unit: "kWh", factor: 207e-6 },
      { label: "Biogas / biomethane", unit: "kWh", factor: 1e-5 }
    ]
  },
  "Livestock Enteric Fermentation": {
    scope: "Scope 1",
    subcategories: [
      { label: "Dairy cows", unit: "head·year", factor: 1.9 },
      { label: "Beef cattle", unit: "head·year", factor: 1.2 },
      { label: "Sheep", unit: "head·year", factor: 0.083 },
      { label: "Pigs", unit: "head·year", factor: 0.035 },
      { label: "Poultry", unit: "head·year", factor: 1e-3 }
    ]
  },
  "Livestock Manure": {
    scope: "Scope 1",
    subcategories: [
      { label: "Dairy cows", unit: "head·year", factor: 0.96 },
      { label: "Beef cattle", unit: "head·year", factor: 0.46 },
      { label: "Sheep", unit: "head·year", factor: 0.032 },
      { label: "Pigs", unit: "head·year", factor: 0.42 },
      { label: "Poultry (broilers)", unit: "head·year", factor: 6e-3 },
      { label: "Cattle slurry storage", unit: "m³", factor: 15e-4 }
    ]
  },
  "Soil & Fertiliser N₂O": {
    scope: "Scope 1",
    subcategories: [
      { label: "Synthetic N fertiliser — direct N₂O", unit: "kg N", factor: 44e-4 },
      { label: "Organic N (slurry/FYM) — direct N₂O", unit: "kg N", factor: 22e-4 },
      { label: "Crop residues — direct N₂O", unit: "kg N", factor: 22e-4 },
      { label: "Indirect N₂O (leaching & run-off)", unit: "kg N", factor: 75e-5 }
    ]
  },
  "Land Use Change": {
    scope: "Scope 1",
    subcategories: [
      { label: "Peat drainage — arable", unit: "ha", factor: 10.5 },
      { label: "Peat drainage — grassland", unit: "ha", factor: 7 },
      { label: "Deforestation", unit: "ha", factor: 55 }
    ]
  },
  "Purchased Inputs": {
    scope: "Scope 3",
    subcategories: [
      { label: "Synthetic N fertiliser (manufacture)", unit: "kg", factor: 448e-5 },
      { label: "Compound fertiliser (manufacture)", unit: "kg", factor: 2e-3 },
      { label: "Pesticides / agrochemicals", unit: "kg a.i.", factor: 85e-4 },
      { label: "Purchased animal feed", unit: "tonne", factor: 0.45 },
      { label: "Lime / ground limestone", unit: "tonne", factor: 0.14 },
      { label: "Plastic film & packaging", unit: "kg", factor: 32e-4 }
    ]
  },
  "Transport": {
    scope: "Scope 3",
    subcategories: [
      { label: "Road haulage — HGV", unit: "tonne·km", factor: 82e-6 },
      { label: "Road haulage — rigid lorry", unit: "tonne·km", factor: 11e-5 },
      { label: "Employee car travel", unit: "km", factor: 17e-5 },
      { label: "Air freight", unit: "tonne·km", factor: 602e-6 }
    ]
  },
  "Buildings & Infrastructure": {
    scope: "Scope 3",
    subcategories: [
      { label: "Concrete (embodied carbon)", unit: "tonne", factor: 0.107 },
      { label: "Steel (embodied carbon)", unit: "tonne", factor: 1.77 },
      { label: "Timber (embodied carbon)", unit: "m³", factor: 0.058 },
      { label: "Refrigerant leak — HFC-134a", unit: "kg", factor: 1.3 },
      { label: "Refrigerant leak — R410A", unit: "kg", factor: 2.088 }
    ]
  },
  "Other": {
    scope: "Scope 3",
    subcategories: [
      { label: "Waste to landfill", unit: "tonne", factor: 0.467 },
      { label: "Water consumption", unit: "m³", factor: 149e-6 },
      { label: "Other (manual entry)", unit: "unit" }
    ]
  }
};
const SOURCE_COLOURS = {
  "Fuel & Energy": "bg-orange-100 text-orange-700",
  "Grid Energy": "bg-yellow-100 text-yellow-700",
  "Fertiliser (NVZ)": "bg-green-100 text-green-700",
  "Slurry & Manure": "bg-amber-100 text-amber-700",
  "Livestock": "bg-blue-100 text-blue-700"
};
function GenerateDialog({ farmId, onDone }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [year, setYear] = usePersistedFilter({ page: "carbon-generate-emissions", filter: "year", farmId, defaultValue: String((/* @__PURE__ */ new Date()).getFullYear() - 1) });
  const [preview, setPreview] = reactExports.useState(null);
  const [existingCount, setExistingCount] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(false);
  const [selected, setSelected] = reactExports.useState(/* @__PURE__ */ new Set());
  const [saving, setSaving] = reactExports.useState(false);
  const [editedCo2e, setEditedCo2e] = reactExports.useState({});
  const [rowErrors, setRowErrors] = reactExports.useState({});
  const hasRowErrors = Object.keys(rowErrors).length > 0;
  const fetchPreview = async () => {
    setLoading(true);
    setPreview(null);
    setSelected(/* @__PURE__ */ new Set());
    setEditedCo2e({});
    setRowErrors({});
    try {
      const res = await fetch(apiUrl(`farms/${farmId}/carbon-emissions/preview?year=${year}`), { credentials: "include" });
      const data = await res.json();
      const suggs = data.suggestions ?? [];
      setPreview(suggs);
      setExistingCount(data.existingCount ?? 0);
      setSelected(new Set(suggs.map((_, i) => i)));
    } finally {
      setLoading(false);
    }
  };
  const confirm = async () => {
    if (!preview) return;
    setSaving(true);
    const chosen = preview.map((s, i) => ({ s, i })).filter(({ i }) => selected.has(i));
    const submittedIdx = chosen.map(({ i }) => i);
    const records = chosen.map(({ s, i }) => ({
      emissionYear: parseInt(year),
      category: s.category,
      subcategory: s.subcategory,
      scope: s.scope,
      activityDescription: s.activityDescription,
      quantity: String(s.quantity),
      unit: s.unit,
      emissionFactorSource: s.emissionFactorSource,
      tonnesCo2e: editedCo2e[i] !== void 0 ? editedCo2e[i] : String(s.tonnesCo2e)
    }));
    try {
      const res = await fetch(apiUrl(`farms/${farmId}/carbon-emissions/bulk`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ records })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      const data = await res.json().catch(() => ({}));
      if (data.rejectedCount > 0) {
        const errs = {};
        for (const rej of data.rejected ?? []) {
          const pIdx = submittedIdx[rej.row - 1];
          if (pIdx !== void 0) errs[pIdx] = rej.reason.replace(/^Row \d+:\s*/, "");
        }
        setRowErrors(errs);
        setSelected(new Set(Object.keys(errs).map(Number)));
        qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] });
        toast({
          title: `${data.created ?? 0} record${data.created === 1 ? "" : "s"} added, ${data.rejectedCount} skipped`,
          description: "The skipped rows are highlighted below — fix them and re-submit.",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }
      setSaving(false);
      onDone();
    } catch (err) {
      setSaving(false);
      toast({ title: "Import failed", description: err instanceof Error ? err.message : void 0, variant: "destructive" });
    }
  };
  const selectedCount = selected.size;
  const totalCo2e = preview ? preview.reduce((sum, s, i) => {
    if (!selected.has(i)) return sum;
    const co2e = parseFloat(editedCo2e[i] ?? String(s.tonnesCo2e));
    return sum + (isNaN(co2e) ? 0 : co2e);
  }, 0) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onDone, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "58rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Generate Emissions Records from Farm Data" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Pulls activity data from Fuel & Energy, NVZ Fertiliser, Slurry & Manure, and Livestock modules and calculates indicative CO₂e using DEFRA 2024 factors. Review and adjust each line before confirming." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: year, onValueChange: (v) => {
            setYear(v);
            if (!hasRowErrors) setPreview(null);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EM_YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: fetchPreview, disabled: loading, children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-1 animate-spin" }),
          "Fetching…"
        ] }) : "Fetch from records" })
      ] }),
      hasRowErrors && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
          Object.keys(rowErrors).length,
          " row",
          Object.keys(rowErrors).length !== 1 ? "s were" : " was",
          " skipped."
        ] }),
        " ",
        "They are highlighted below with the reason — correct the values (e.g. pick a valid year) and click Create to re-submit just those rows."
      ] }),
      preview !== null && existingCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Note:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          existingCount,
          " emission record",
          existingCount !== 1 ? "s" : "",
          " already exist for ",
          year,
          ". New records will be added alongside them, not replace them."
        ] })
      ] }),
      preview !== null && preview.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground italic text-center py-4", children: [
        "No activity data found for ",
        year,
        " in the connected modules. Check that fuel usage, NVZ fertiliser, slurry, and livestock records have been entered for this year."
      ] }),
      preview !== null && preview.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            preview.length,
            " suggestion",
            preview.length !== 1 ? "s" : "",
            " — ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-foreground", children: [
              selectedCount,
              " selected"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-1.5 cursor-pointer text-muted-foreground select-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                checked: selectedCount === preview.length && preview.length > 0,
                onCheckedChange: (c) => {
                  if (c === true) setSelected(new Set(preview.map((_, i) => i)));
                  else setSelected(/* @__PURE__ */ new Set());
                }
              }
            ),
            "Select all"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border overflow-auto max-h-80", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 sticky top-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 w-8" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "Source" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "Sub-category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "Activity description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-right", children: "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left w-20", children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-right w-32", children: "tCO₂e ✎" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: preview.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t transition-opacity ${rowErrors[i] ? "bg-red-50" : ""} ${selected.has(i) ? "" : "opacity-40"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Checkbox,
              {
                checked: selected.has(i),
                onCheckedChange: (c) => setSelected((prev) => {
                  const next = new Set(prev);
                  if (c === true) next.add(i);
                  else next.delete(i);
                  return next;
                })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${SOURCE_COLOURS[s.source] ?? "bg-muted text-muted-foreground"}`, children: s.source }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium text-xs leading-tight", children: s.subcategory || s.category }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: s.scope }),
              !!rowErrors[i] && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-red-600 font-medium mt-0.5", children: rowErrors[i] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-xs text-muted-foreground max-w-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-2", children: s.activityDescription }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-right tabular-nums text-xs", children: Number(s.quantity).toLocaleString("en-GB", { maximumFractionDigits: 1 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-xs text-muted-foreground", children: s.unit }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.0001",
                className: "h-7 text-right text-xs w-full",
                value: editedCo2e[i] ?? s.tonnesCo2e.toFixed(4),
                onChange: (e) => setEditedCo2e((prev) => ({ ...prev, [i]: e.target.value }))
              }
            ) })
          ] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { className: "bg-muted/30 border-t font-semibold text-sm sticky bottom-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "p-2 text-right", children: "Total (selected):" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2 text-right tabular-nums", children: [
              totalCo2e.toFixed(3),
              " tCO₂e"
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Figures use DEFRA 2024 factors. Edit any tCO₂e value before confirming. Livestock figures reflect the current active population — adjust if the ",
          year,
          " herd differed significantly."
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onDone, disabled: saving, children: "Cancel" }),
      preview !== null && preview.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: confirm, disabled: saving || selectedCount === 0, children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-1 animate-spin" }),
        "Creating…"
      ] }) : `Create ${selectedCount} record${selectedCount !== 1 ? "s" : ""}` })
    ] })
  ] }) });
}
function EmissionsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [generateOpen, setGenerateOpen] = reactExports.useState(false);
  const [filterYear, setFilterYear] = usePersistedFilter({ page: "carbon-emissions", filter: "year", farmId, defaultValue: "all" });
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["carbon-emissions", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/carbon-emissions`), { credentials: "include" }).then((r) => r.json())
  });
  const save = useMutation({
    mutationFn: (b) => fetch(apiUrl(`farms/${farmId}/carbon-emissions`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] });
      setOpen(false);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/carbon-emissions/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { data: farmRec } = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}`), { credentials: "include" }).then((r) => r.json()).then((d) => d.record)
  });
  const allRows = records;
  const availableYears = Array.from(new Set(allRows.map((r) => String(r.emissionYear)))).sort((a, b) => Number(b) - Number(a));
  const filteredRows = filterYear === "all" ? allRows : allRows.filter((r) => String(r.emissionYear) === filterYear);
  const totalCo2e = filteredRows.reduce((sum, r) => sum + (parseFloat(String(r.tonnesCo2e ?? "0")) || 0), 0);
  function printEmissions() {
    const yearLabel = filterYear === "all" ? "All Years" : filterYear;
    const scopeOrder = ["Scope 1", "Scope 2", "Scope 3"];
    const rowsByScope = {};
    filteredRows.forEach((r) => {
      const s = String(r.scope ?? "Other");
      if (!rowsByScope[s]) rowsByScope[s] = [];
      rowsByScope[s].push(r);
    });
    const allScopes = [
      ...scopeOrder.filter((s) => rowsByScope[s]?.length),
      ...Object.keys(rowsByScope).filter((s) => !scopeOrder.includes(s) && rowsByScope[s]?.length)
    ];
    let tableHtml = "";
    let grand = 0;
    allScopes.forEach((scope) => {
      const rows = rowsByScope[scope];
      const scopeTotal = rows.reduce((s, r) => s + (parseFloat(String(r.tonnesCo2e ?? "0")) || 0), 0);
      grand += scopeTotal;
      tableHtml += `<div class="section-head">${scope}</div><table><thead><tr><th>Category</th><th>Sub-category</th><th>Activity</th><th>Year</th><th>Quantity</th><th>Unit</th><th style="text-align:right">tCO₂e</th></tr></thead><tbody>`;
      rows.forEach((r) => {
        tableHtml += `<tr><td>${r.category ?? "—"}</td><td>${r.subcategory ?? "—"}</td><td>${r.activityDescription ?? "—"}</td><td>${r.emissionYear ?? "—"}</td><td>${r.quantity ?? "—"}</td><td>${r.unit ?? "—"}</td><td style="text-align:right;font-weight:600">${parseFloat(String(r.tonnesCo2e ?? "0")).toFixed(4)}</td></tr>`;
      });
      tableHtml += `</tbody><tfoot><tr style="background:#f0fdf4"><td colspan="6" style="text-align:right;font-weight:700;padding:4px 5px">${scope} Total</td><td style="text-align:right;font-weight:700;padding:4px 5px">${scopeTotal.toFixed(3)} tCO₂e</td></tr></tfoot></table>`;
    });
    tableHtml += `<table style="margin-top:12px"><tfoot><tr style="background:#1a3a1a"><td style="color:#fff;font-weight:700;padding:5px 6px">Grand Total — ${yearLabel}</td><td colspan="5"></td><td style="color:#fff;font-weight:700;text-align:right;padding:5px 6px">${grand.toFixed(3)} tCO₂e</td></tr></tfoot></table>`;
    printProReport({
      title: "Annual Carbon Emissions Summary",
      farmName: farmRec?.name,
      cphNumber: farmRec?.cphNumber,
      subtitle: `Year: ${yearLabel}`,
      recordCount: filteredRows.length,
      recordLabel: "emission record",
      tableHtml,
      footerNote: "DEFRA/IPCC emission factors applied. Verify totals with your carbon auditor before submission.",
      landscape: true
    });
  }
  const catDef = form.category ? EMISSION_TAXONOMY[form.category] : null;
  const subcatDef = catDef?.subcategories.find((s) => s.label === form.subcategory) ?? null;
  const calcCo2e = subcatDef?.factor != null && form.quantity ? (parseFloat(form.quantity) * subcatDef.factor).toFixed(4) : null;
  const handleCategoryChange = (v) => {
    const def = EMISSION_TAXONOMY[v];
    setForm((f) => ({ ...f, category: v, subcategory: "", unit: "", scope: def?.scope ?? "", tonnesCo2e: "" }));
  };
  const handleSubcategoryChange = (v) => {
    const def = catDef?.subcategories.find((s) => s.label === v);
    const newScope = v.includes("Scope 2") ? "Scope 2" : catDef?.scope ?? "";
    setForm((f) => {
      const qty = parseFloat(f.quantity);
      const co2e = def?.factor != null && !isNaN(qty) ? (qty * def.factor).toFixed(4) : f.tonnesCo2e;
      return { ...f, subcategory: v, unit: def?.unit ?? "", scope: newScope, tonnesCo2e: co2e };
    });
  };
  const handleQuantityChange = (v) => {
    setForm((f) => {
      const qty = parseFloat(v);
      const factor = catDef?.subcategories.find((s) => s.label === f.subcategory)?.factor;
      const co2e = factor != null && !isNaN(qty) ? (qty * factor).toFixed(4) : f.tonnesCo2e;
      return { ...f, quantity: v, tonnesCo2e: co2e };
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Emissions Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterYear, onValueChange: setFilterYear, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-36 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        filteredRows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          filteredRows.length,
          " record",
          filteredRows.length !== 1 ? "s" : "",
          " · ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
            totalCo2e.toFixed(3),
            " tCO₂e"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printEmissions, disabled: filteredRows.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setGenerateOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 mr-1" }),
          "Generate from records"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setForm({});
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "emissionYear", label: "Year" },
          { key: "scope", label: "Scope" },
          { key: "category", label: "Category" },
          { key: "subcategory", label: "Sub-category" },
          { key: "activityDescription", label: "Activity" },
          { key: "quantity", label: "Qty" },
          { key: "unit", label: "Unit" },
          { key: "tonnesCo2e", label: "tCO₂e" }
        ],
        rows: filteredRows,
        onView: setViewRecord,
        onDelete: (r) => del.mutate(r.id),
        deleteMutation: del
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Emissions Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.emissionYear ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Scope" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.scope ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.category ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sub-category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.subcategory ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Activity Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.activityDescription ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.quantity ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Unit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.unit ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Emission Factor Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.emissionFactorSource ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "tCO₂e" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.tonnesCo2e ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Emissions Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Year *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.emissionYear ?? "", onValueChange: (v) => setForm((f) => ({ ...f, emissionYear: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select year" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EM_YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Scope" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center h-9 px-3 rounded-md border bg-muted/40 text-sm gap-2", children: form.scope ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: form.scope }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground ml-1", children: "(set from category)" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "Select a category first" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.category ?? "", onValueChange: handleCategoryChange, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select category" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.keys(EMISSION_TAXONOMY).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sub-category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.subcategory ?? "", onValueChange: handleSubcategoryChange, disabled: !catDef, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: catDef ? "Select sub-category" : "Select a category first" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: catDef?.subcategories.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s.label, children: s.label }, s.label)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Activity Description *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.activityDescription ?? "",
              onChange: (e) => setForm((f) => ({ ...f, activityDescription: e.target.value })),
              placeholder: "e.g. Tractor fleet — mixed arable operations 2024"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.quantity ?? "", onChange: (e) => handleQuantityChange(e.target.value), placeholder: "0.000" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center h-9 px-3 rounded-md border bg-muted/40 text-sm", children: form.unit ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: form.unit }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "Set by sub-category" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Emission Factor Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.emissionFactorSource ?? "", onValueChange: (v) => setForm((f) => ({ ...f, emissionFactorSource: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select source" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EM_FACTOR_SOURCES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "tCO₂e *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.0001",
              value: form.tonnesCo2e ?? "",
              onChange: (e) => setForm((f) => ({ ...f, tonnesCo2e: e.target.value })),
              placeholder: "0.0000"
            }
          ),
          calcCo2e && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5 leading-snug", children: [
            "Indicative: ",
            calcCo2e,
            " tCO₂e (qty × DEFRA 2024 factor)",
            form.tonnesCo2e && form.tonnesCo2e !== calcCo2e && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                className: "ml-1 text-primary underline",
                onClick: () => setForm((f) => ({ ...f, tonnesCo2e: calcCo2e })),
                children: "use this"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) }),
    generateOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      GenerateDialog,
      {
        farmId,
        onDone: () => {
          setGenerateOpen(false);
          qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] });
        }
      }
    )
  ] });
}
const SEQ_FEATURES = {
  "Woodland": { unit: "ha", factorTco2ePerUnit: 3.5 },
  "Hedgerow": { unit: "km", factorTco2ePerUnit: 0.34 },
  "Peatland": { unit: "ha", factorTco2ePerUnit: 5.5 },
  "Permanent Grassland": { unit: "ha", factorTco2ePerUnit: 0.5 },
  "Wildflower Meadow": { unit: "ha", factorTco2ePerUnit: 0.3 },
  "Riparian Buffer": { unit: "ha", factorTco2ePerUnit: 1.2 },
  "Agroforestry": { unit: "ha", factorTco2ePerUnit: 1.5 },
  "Other": { unit: "ha" }
};
const SEQ_FACTOR_SOURCES = [...EM_FACTOR_SOURCES, "Woodland Carbon Code", "Peatland Code"];
const SEQ_SOURCE_COLOURS = {
  "Environmental Features": "bg-emerald-100 text-emerald-700",
  "Field Season Land Use": "bg-lime-100 text-lime-700"
};
function GenerateSeqDialog({ farmId, onDone }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [year, setYear] = usePersistedFilter({ page: "carbon-generate-sequestration", filter: "year", farmId, defaultValue: String((/* @__PURE__ */ new Date()).getFullYear() - 1) });
  const [preview, setPreview] = reactExports.useState(null);
  const [existingCount, setExistingCount] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(false);
  const [selected, setSelected] = reactExports.useState(/* @__PURE__ */ new Set());
  const [saving, setSaving] = reactExports.useState(false);
  const [editedCo2e, setEditedCo2e] = reactExports.useState({});
  const [rowErrors, setRowErrors] = reactExports.useState({});
  const hasRowErrors = Object.keys(rowErrors).length > 0;
  const fetchPreview = async () => {
    setLoading(true);
    setPreview(null);
    setSelected(/* @__PURE__ */ new Set());
    setEditedCo2e({});
    setRowErrors({});
    try {
      const res = await fetch(apiUrl(`farms/${farmId}/carbon-sequestration/preview?year=${year}`), { credentials: "include" });
      const data = await res.json();
      const suggs = data.suggestions ?? [];
      setPreview(suggs);
      setExistingCount(data.existingCount ?? 0);
      setSelected(new Set(suggs.map((_, i) => i)));
    } finally {
      setLoading(false);
    }
  };
  const confirm = async () => {
    if (!preview) return;
    setSaving(true);
    const chosen = preview.map((s, i) => ({ s, i })).filter(({ i }) => selected.has(i));
    const submittedIdx = chosen.map(({ i }) => i);
    const records = chosen.map(({ s, i }) => ({
      sequestrationYear: parseInt(year),
      featureType: s.featureType,
      featureName: s.featureName,
      areaHaOrLengthM: String(s.quantity),
      unit: s.unit,
      tonnesCo2eSequestered: editedCo2e[i] !== void 0 ? editedCo2e[i] : String(s.tonnesCo2eSequestered),
      sequestrationFactorSource: s.sequestrationFactorSource
    }));
    try {
      const res = await fetch(apiUrl(`farms/${farmId}/carbon-sequestration/bulk`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ records })
      }).then(async (r) => {
        if (!r.ok) {
          const t = await r.text().catch(() => "");
          throw new Error(t || `Request failed (${r.status})`);
        }
        return r;
      });
      const data = await res.json().catch(() => ({}));
      if (data.rejectedCount > 0) {
        const errs = {};
        for (const rej of data.rejected ?? []) {
          const pIdx = submittedIdx[rej.row - 1];
          if (pIdx !== void 0) errs[pIdx] = rej.reason.replace(/^Row \d+:\s*/, "");
        }
        setRowErrors(errs);
        setSelected(new Set(Object.keys(errs).map(Number)));
        qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] });
        toast({
          title: `${data.created ?? 0} record${data.created === 1 ? "" : "s"} added, ${data.rejectedCount} skipped`,
          description: "The skipped rows are highlighted below — fix them and re-submit.",
          variant: "destructive"
        });
        setSaving(false);
        return;
      }
      setSaving(false);
      onDone();
    } catch (err) {
      setSaving(false);
      toast({ title: "Import failed", description: err instanceof Error ? err.message : void 0, variant: "destructive" });
    }
  };
  const selectedCount = selected.size;
  const totalSeq = preview ? preview.reduce((sum, s, i) => {
    if (!selected.has(i)) return sum;
    const v = parseFloat(editedCo2e[i] ?? String(s.tonnesCo2eSequestered));
    return sum + (isNaN(v) ? 0 : v);
  }, 0) : 0;
  const toggleAll = () => {
    if (!preview) return;
    if (selected.size === preview.length) setSelected(/* @__PURE__ */ new Set());
    else setSelected(new Set(preview.map((_, i) => i)));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: onDone, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "58rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Generate Sequestration Records from Farm Data" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Reads your Environmental Features register and Field Season Land Use records and calculates indicative annual sequestration using recognised UK factors (Woodland Carbon Code, Peatland Code, DEFRA agri-environment guidance). Review and adjust each line before confirming." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-36", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: year, onValueChange: (v) => {
            setYear(v);
            if (!hasRowErrors) setPreview(null);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EM_YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: fetchPreview, disabled: loading, children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-1 animate-spin" }),
          "Scanning…"
        ] }) : "Preview" })
      ] }),
      hasRowErrors && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
          Object.keys(rowErrors).length,
          " row",
          Object.keys(rowErrors).length !== 1 ? "s were" : " was",
          " skipped."
        ] }),
        " ",
        "They are highlighted below with the reason — correct the values (e.g. pick a valid year) and click Create to re-submit just those rows."
      ] }),
      existingCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "⚠" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "There ",
          existingCount === 1 ? "is" : "are",
          " already ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: existingCount }),
          " sequestration record",
          existingCount !== 1 ? "s" : "",
          " for ",
          year,
          ". Confirming will add to them — check for duplicates."
        ] })
      ] }),
      preview !== null && preview.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground italic py-4 text-center", children: [
        "No mappable features found for ",
        year,
        '. Add features in the Environmental Features module, or record land use in Fields & Crops with types such as "Woodland", "Hedgerow", or "Permanent Grassland".'
      ] }),
      preview !== null && preview.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded-lg border max-h-80 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50 sticky top-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left w-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: selectedCount === preview.length, onCheckedChange: toggleAll }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "Source" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "Feature Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "Feature / Field Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-right", children: "Area / Length" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-left", children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "p-2 text-right", children: "tCO₂e / yr" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: preview.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t ${rowErrors[i] ? "bg-red-50" : ""} ${!selected.has(i) ? "opacity-40" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { checked: selected.has(i), onCheckedChange: (c) => setSelected((prev) => {
              const n = new Set(prev);
              c ? n.add(i) : n.delete(i);
              return n;
            }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${SEQ_SOURCE_COLOURS[s.source] ?? "bg-muted text-muted-foreground"}`, children: s.source }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2 font-medium", children: [
              s.featureType,
              !!rowErrors[i] && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-red-600 font-normal mt-0.5", children: rowErrors[i] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-muted-foreground max-w-[14rem] truncate", children: s.featureName || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-right tabular-nums", children: s.quantity.toFixed(3) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-muted-foreground", children: s.unit }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "p-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "0",
                step: "0.001",
                className: "h-7 text-right text-xs w-24 border rounded px-1",
                value: editedCo2e[i] ?? s.tonnesCo2eSequestered.toFixed(3),
                onChange: (e) => setEditedCo2e((prev) => ({ ...prev, [i]: e.target.value }))
              }
            ) })
          ] }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { className: "bg-muted/30 border-t font-semibold text-sm sticky bottom-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "p-2 text-right", children: "Total (selected):" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "p-2 text-right tabular-nums", children: [
              totalSeq.toFixed(3),
              " tCO₂e / yr"
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Factors: Woodland 3.5 tCO₂e/ha, Hedgerow 0.34 tCO₂e/km, Peatland 5.5 tCO₂e/ha, Permanent Grassland 0.5 tCO₂e/ha, Wildflower Meadow 0.3 tCO₂e/ha, Riparian Buffer 1.2 tCO₂e/ha, Agroforestry 1.5 tCO₂e/ha. Edit any value before confirming." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onDone, disabled: saving, children: "Cancel" }),
      preview !== null && preview.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: confirm, disabled: saving || selectedCount === 0, children: saving ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-1 animate-spin" }),
        "Creating…"
      ] }) : `Create ${selectedCount} record${selectedCount !== 1 ? "s" : ""}` })
    ] })
  ] }) });
}
function SequestrationTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [generateOpen, setGenerateOpen] = reactExports.useState(false);
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["carbon-seq", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/carbon-sequestration`), { credentials: "include" }).then((r) => r.json())
  });
  const save = useMutation({
    mutationFn: (b) => fetch(
      editing ? apiUrl(`farms/${farmId}/carbon-sequestration/${editing.id}`) : apiUrl(`farms/${farmId}/carbon-sequestration`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/carbon-sequestration/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { data: farmRec } = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}`), { credentials: "include" }).then((r) => r.json()).then((d) => d.record)
  });
  const [filterYear, setFilterYear] = usePersistedFilter({ page: "carbon-sequestration", filter: "year", farmId, defaultValue: "all" });
  const allSeqRows = records;
  const seqYears = Array.from(new Set(allSeqRows.map((r) => String(r.sequestrationYear)))).sort((a, b) => Number(b) - Number(a));
  const filteredSeqRows = filterYear === "all" ? allSeqRows : allSeqRows.filter((r) => String(r.sequestrationYear) === filterYear);
  const totalSeq = filteredSeqRows.reduce((sum, r) => sum + (parseFloat(String(r.tonnesCo2eSequestered ?? "0")) || 0), 0);
  const featDef = form.featureType ? SEQ_FEATURES[form.featureType] : null;
  const calcSeq = featDef?.factorTco2ePerUnit != null && form.areaHaOrLengthM ? (parseFloat(form.areaHaOrLengthM) * featDef.factorTco2ePerUnit).toFixed(3) : null;
  const handleFeatureTypeChange = (v) => {
    const def = SEQ_FEATURES[v];
    setForm((f) => {
      const qty = parseFloat(f.areaHaOrLengthM);
      const seq = def?.factorTco2ePerUnit != null && !isNaN(qty) ? (qty * def.factorTco2ePerUnit).toFixed(3) : f.tonnesCo2eSequestered;
      return { ...f, featureType: v, unit: def?.unit ?? "ha", tonnesCo2eSequestered: seq };
    });
  };
  const handleAreaChange = (v) => {
    setForm((f) => {
      const qty = parseFloat(v);
      const factor = featDef?.factorTco2ePerUnit;
      const seq = factor != null && !isNaN(qty) ? (qty * factor).toFixed(3) : f.tonnesCo2eSequestered;
      return { ...f, areaHaOrLengthM: v, tonnesCo2eSequestered: seq };
    });
  };
  function handleOpen(editRec) {
    if (editRec) {
      setEditing(editRec);
      setForm(Object.fromEntries(Object.entries(editRec).map(([k, v]) => [k, v == null ? "" : String(v)])));
    } else {
      setEditing(null);
      setForm({});
    }
    setOpen(true);
  }
  function printSequestration() {
    const yearLabel = filterYear === "all" ? "All Years" : filterYear;
    const featureOrder = Object.keys(SEQ_FEATURES);
    const rowsByType = {};
    filteredSeqRows.forEach((r) => {
      const t = String(r.featureType ?? "Other");
      if (!rowsByType[t]) rowsByType[t] = [];
      rowsByType[t].push(r);
    });
    const allTypes = [
      ...featureOrder.filter((t) => rowsByType[t]?.length),
      ...Object.keys(rowsByType).filter((t) => !featureOrder.includes(t) && rowsByType[t]?.length)
    ];
    let tableHtml = "";
    let grand = 0;
    allTypes.forEach((type) => {
      const rows = rowsByType[type];
      const typeTotal = rows.reduce((s, r) => s + (parseFloat(String(r.tonnesCo2eSequestered ?? "0")) || 0), 0);
      grand += typeTotal;
      tableHtml += `<div class="section-head">${type}</div><table><thead><tr><th>Year</th><th>Feature Name</th><th>Area / Length</th><th>Unit</th><th>Factor Source</th><th style="text-align:right">tCO₂e Sequestered</th></tr></thead><tbody>`;
      rows.forEach((r) => {
        tableHtml += `<tr><td>${r.sequestrationYear ?? "—"}</td><td>${r.featureName ?? "—"}</td><td>${r.areaHaOrLengthM ?? "—"}</td><td>${r.unit ?? "—"}</td><td>${r.sequestrationFactorSource ?? "—"}</td><td style="text-align:right;font-weight:600">${parseFloat(String(r.tonnesCo2eSequestered ?? "0")).toFixed(3)}</td></tr>`;
      });
      tableHtml += `</tbody><tfoot><tr style="background:#f0fdf4"><td colspan="5" style="text-align:right;font-weight:700;padding:4px 5px">${type} Total</td><td style="text-align:right;font-weight:700;padding:4px 5px">${typeTotal.toFixed(3)} tCO₂e</td></tr></tfoot></table>`;
    });
    tableHtml += `<table style="margin-top:12px"><tfoot><tr style="background:#1a3a1a"><td style="color:#fff;font-weight:700;padding:5px 6px">Grand Total Sequestered — ${yearLabel}</td><td colspan="4"></td><td style="color:#fff;font-weight:700;text-align:right;padding:5px 6px">${grand.toFixed(3)} tCO₂e</td></tr></tfoot></table>`;
    printProReport({
      title: "Carbon Sequestration Summary",
      farmName: farmRec?.name,
      cphNumber: farmRec?.cphNumber,
      subtitle: `Year: ${yearLabel}`,
      recordCount: filteredSeqRows.length,
      recordLabel: "sequestration record",
      tableHtml,
      footerNote: "Sequestration estimates based on DEFRA / Woodland Carbon Code / Peatland Code factors. Independent verification recommended.",
      landscape: true
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Carbon Sequestration" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterYear, onValueChange: setFilterYear, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-36 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            seqYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        filteredSeqRows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
          filteredSeqRows.length,
          " record",
          filteredSeqRows.length !== 1 ? "s" : "",
          " · ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-foreground", children: [
            totalSeq.toFixed(3),
            " tCO₂e sequestered"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printSequestration, disabled: filteredSeqRows.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setGenerateOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4 h-4 mr-1" }),
          "Generate from records"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => handleOpen(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [
      { key: "sequestrationYear", label: "Year" },
      { key: "featureType", label: "Feature Type" },
      { key: "featureName", label: "Feature" },
      { key: "areaHaOrLengthM", label: "Area/Length" },
      { key: "unit", label: "Unit" },
      { key: "tonnesCo2eSequestered", label: "tCO₂e Sequestered" }
    ], rows: filteredSeqRows, onView: setViewRecord, onEdit: (r) => handleOpen(r), onDelete: (r) => del.mutate(r.id), deleteMutation: del }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Sequestration Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.sequestrationYear ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Feature Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.featureType ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Feature Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.featureName ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Area/Length" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.areaHaOrLengthM ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Unit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.unit ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "tCO₂e Sequestered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.tonnesCo2eSequestered ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sequestration Factor Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.sequestrationFactorSource ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Sequestration Record" : "Add Sequestration Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Year *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sequestrationYear ?? "", onValueChange: (v) => setForm((f) => ({ ...f, sequestrationYear: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select year" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EM_YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feature Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.featureType ?? "", onValueChange: handleFeatureTypeChange, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select feature" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.keys(SEQ_FEATURES).map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Feature Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.featureName ?? "", onChange: (e) => setForm((f) => ({ ...f, featureName: e.target.value })), placeholder: "e.g. North Wood, Boundary Hedge A" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area / Length" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.areaHaOrLengthM ?? "", onChange: (e) => handleAreaChange(e.target.value), placeholder: "0.000" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center h-9 px-3 rounded-md border bg-muted/40 text-sm", children: form.unit ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: form.unit }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground italic", children: "Set by feature type" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "tCO₂e Sequestered *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.001",
              value: form.tonnesCo2eSequestered ?? "",
              onChange: (e) => setForm((f) => ({ ...f, tonnesCo2eSequestered: e.target.value })),
              placeholder: "0.000"
            }
          ),
          calcSeq && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5 leading-snug", children: [
            "Indicative: ",
            calcSeq,
            " tCO₂e (area × WCC/DEFRA factor)",
            form.tonnesCo2eSequestered && form.tonnesCo2eSequestered !== calcSeq && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ml-1 text-primary underline", onClick: () => setForm((f) => ({ ...f, tonnesCo2eSequestered: calcSeq })), children: "use this" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sequestration Factor Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sequestrationFactorSource ?? "", onValueChange: (v) => setForm((f) => ({ ...f, sequestrationFactorSource: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select source" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SEQ_FACTOR_SOURCES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) }),
    generateOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      GenerateSeqDialog,
      {
        farmId,
        onDone: () => {
          setGenerateOpen(false);
          qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] });
        }
      }
    )
  ] });
}
const RA_CATEGORIES = [
  "Renewable Energy",
  "Energy Efficiency",
  "Fertiliser Reduction",
  "Livestock Feed",
  "Woodland Planting",
  "Wetland Restoration",
  "Transport Efficiency",
  "Equipment Upgrade",
  "Soil Management",
  "Waste Reduction",
  "Other"
];
const RA_STATUSES = [
  { v: "planned", l: "Planned" },
  { v: "in-progress", l: "In Progress" },
  { v: "completed", l: "Completed" },
  { v: "cancelled", l: "Cancelled" }
];
const RA_TARGET_SOURCES = [
  "Carbon audit report",
  "Scheme requirement document",
  "Internal target",
  "Advisor recommendation",
  "Other"
];
const RA_FUNDING_TYPES = [
  "Own farm funds",
  "Government grant",
  "Agri-environment scheme",
  "Third-party / charity funding",
  "Loan / finance"
];
const RA_CONTRACTOR_TYPES = [
  "External contractor / firm",
  "Internal staff member",
  "Not yet confirmed"
];
function ReductionActionsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [responsibleMode, setResponsibleMode] = reactExports.useState("list");
  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["carbon-actions", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/carbon-reduction-actions`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: staffList = [] } = useQuery({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/staff`), { credentials: "include" }).then((r) => r.json()).then((d) => d.staff ?? [])
  });
  const { data: contractorSuppliers = [] } = useQuery({
    queryKey: ["contractor-suppliers", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/contractor-suppliers`), { credentials: "include" }).then((r) => r.ok ? r.json() : { records: [] }).then((d) => d.records ?? [])
  });
  const save = useMutation({
    mutationFn: (b) => fetch(
      editing ? apiUrl(`farms/${farmId}/carbon-reduction-actions/${editing.id}`) : apiUrl(`farms/${farmId}/carbon-reduction-actions`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["carbon-actions", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/carbon-reduction-actions/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-actions", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const [filterStatus, setFilterStatus] = usePersistedFilter({ page: "carbon-reduction-actions", filter: "status", farmId, defaultValue: "all" });
  const { data: farmRec } = useQuery({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}`), { credentials: "include" }).then((r) => r.json()).then((d) => d.record)
  });
  const allActions = actions;
  const filteredActions = filterStatus === "all" ? allActions : allActions.filter((a) => String(a.status ?? "") === filterStatus);
  function printActions() {
    const statusLabel = filterStatus === "all" ? "All Statuses" : filterStatus.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    let tableHtml = `<table><thead><tr><th>Action</th><th>Category</th><th>Description</th><th>Status</th><th style="text-align:right">Target tCO₂e</th><th>Planned Start</th><th>Target Date</th><th>Responsible</th><th>Funding</th></tr></thead><tbody>`;
    filteredActions.forEach((a) => {
      const status = String(a.status ?? "—").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const startDate = a.plannedStartDate ? new Date(a.plannedStartDate).toLocaleDateString("en-GB") : "—";
      const endDate = a.plannedCompletionDate ? new Date(a.plannedCompletionDate).toLocaleDateString("en-GB") : "—";
      tableHtml += `<tr><td style="font-weight:600">${a.actionTitle ?? "—"}</td><td>${a.category ?? "—"}</td><td>${a.description ?? "—"}</td><td>${status}</td><td style="text-align:right">${a.targetReductionTonnesCo2e ?? "—"}</td><td>${startDate}</td><td>${endDate}</td><td>${a.responsiblePerson ?? "—"}</td><td>${a.fundingType ?? "—"}</td></tr>`;
    });
    const totalTarget = filteredActions.reduce((s, a) => s + (parseFloat(String(a.targetReductionTonnesCo2e ?? "0")) || 0), 0);
    tableHtml += `</tbody><tfoot><tr style="background:#1a3a1a"><td style="color:#fff;font-weight:700;padding:5px 6px" colspan="4">Total Target Reduction</td><td style="color:#fff;font-weight:700;text-align:right;padding:5px 6px">${totalTarget.toFixed(3)} tCO₂e</td><td colspan="4"></td></tr></tfoot></table>`;
    printProReport({
      title: "Carbon Reduction Action Plan",
      farmName: farmRec?.name,
      cphNumber: farmRec?.cphNumber,
      subtitle: `Status: ${statusLabel}`,
      recordCount: filteredActions.length,
      recordLabel: "action",
      tableHtml,
      footerNote: "Review and update reduction actions regularly as part of your farm carbon management strategy.",
      landscape: true
    });
  }
  const isExternalFunding = form.fundingType && form.fundingType !== "Own farm funds";
  const showGrantFields = isExternalFunding && form.fundingType !== "Loan / finance";
  const isExternalDoc = form.targetSourceType && form.targetSourceType !== "Internal target";
  const isExternalContractor = form.contractorType === "External contractor / firm";
  const isInternalContractor = form.contractorType === "Internal staff member";
  const fundingNameLabel = form.fundingType === "Government grant" ? "Grant name" : form.fundingType === "Agri-environment scheme" ? "Scheme name" : form.fundingType === "Third-party / charity funding" ? "Funder name" : form.fundingType === "Loan / finance" ? "Lender / bank name" : "Name / reference";
  const fundingRefLabel = form.fundingType === "Government grant" ? "Grant reference number" : form.fundingType === "Agri-environment scheme" ? "Agreement / scheme reference" : "Reference number";
  const handleOpen = (editRec) => {
    if (editRec) {
      setEditing(editRec);
      const f2 = Object.fromEntries(Object.entries(editRec).map(([k, v]) => [k, v == null ? "" : String(v)]));
      setForm(f2);
      const nameInList = staffList.some((s) => s.name === editRec.responsiblePerson);
      setResponsibleMode(editRec.responsiblePerson && !nameInList ? "other" : "list");
    } else {
      setEditing(null);
      setForm({ status: "planned" });
      setResponsibleMode("list");
    }
    setOpen(true);
  };
  const f = (key) => form[key] ?? "";
  const sf = (key) => (v) => setForm((prev) => ({ ...prev, [key]: v }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Carbon Reduction Actions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Plan and track actions to reduce the holding's carbon footprint. Record who is responsible, how the work is funded, and who will carry it out." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 flex-wrap justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: filterStatus, onValueChange: setFilterStatus, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "h-8 w-40 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All statuses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "planned", children: "Planned" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "in-progress", children: "In Progress" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "completed", children: "Completed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "cancelled", children: "Cancelled" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: printActions, disabled: filteredActions.length === 0, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4 mr-1" }),
          "Print Plan"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => handleOpen(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Action"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "actionTitle", label: "Action" },
          { key: "category", label: "Category" },
          { key: "targetReductionTonnesCo2e", label: "Target tCO₂e" },
          { key: "status", label: "Status", fmt: (r) => String(r.status ?? "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) },
          { key: "plannedCompletionDate", label: "Target Date", fmt: (r) => fmtDate(r.plannedCompletionDate) },
          { key: "responsiblePerson", label: "Responsible" },
          { key: "fundingType", label: "Funding" }
        ],
        rows: filteredActions,
        onView: setViewRecord,
        onEdit: (r) => handleOpen(r),
        onDelete: (r) => del.mutate(r.id),
        deleteMutation: del
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Reduction Action" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[70vh] overflow-y-auto pr-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide font-semibold", children: "Action" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.actionTitle ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.category ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.status ?? "—").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.description ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide font-semibold", children: "Carbon Target" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Target Reduction (tCO₂e)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.targetReductionTonnesCo2e ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Target Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.targetSourceType ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide font-semibold", children: "Responsible Person" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.responsiblePerson ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide font-semibold", children: "Timeline & Cost" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Planned Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.plannedStartDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Planned Completion" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.plannedCompletionDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Estimated Cost (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.estimatedCost ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide font-semibold", children: "Funding" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Funding Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.fundingType ?? viewRecord.fundingSource ?? "—") })
        ] }),
        !!viewRecord.fundingGrantName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Grant / Scheme Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.fundingGrantName) })
        ] }),
        !!viewRecord.fundingGrantReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.fundingGrantReference) })
        ] }),
        !!(viewRecord.contractorName || viewRecord.contractorType || viewRecord.contractorCompany) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide font-semibold", children: "Contractor" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.contractorType ?? "—") })
          ] }),
          !!viewRecord.contractorName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.contractorName) })
          ] }),
          !!viewRecord.contractorCompany && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.contractorCompany) }),
            !!viewRecord.contractorSupplierId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Linked to supplier record" })
          ] }),
          !!viewRecord.linkedPoReference && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Linked PO Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium font-mono", children: String(viewRecord.linkedPoReference) })
          ] })
        ] }),
        !!viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.notes) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          handleOpen(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) setEditing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "46rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Reduction Action"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[78vh] overflow-y-auto pr-1 space-y-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1", children: "Action" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Action Title *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f("actionTitle"), onChange: (e) => sf("actionTitle")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Category *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f("category"), onValueChange: sf("category"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-60 overflow-y-auto", children: RA_CATEGORIES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f("status") || "planned", onValueChange: sf("status"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RA_STATUSES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: f("description"), onChange: (e) => sf("description")(e.target.value), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1", children: "Carbon Target" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "The target reduction in tonnes of CO₂ equivalent. This figure should come from a carbon audit, scheme agreement, or advisor recommendation — not estimated." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Reduction (tCO₂e)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: f("targetReductionTonnesCo2e"), onChange: (e) => sf("targetReductionTonnesCo2e")(e.target.value), placeholder: "e.g. 12.500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source of this figure" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f("targetSourceType"), onValueChange: sf("targetSourceType"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Where did this figure come from?" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RA_TARGET_SOURCES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        isExternalDoc && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "carbon_action_target_doc", recordId: editing.id }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "Save this record first to attach the source document (audit report, scheme letter, etc.)." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1", children: "Responsible Person" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "The person at this holding who is accountable for ensuring this action is delivered — typically the farm manager or business owner." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Select from staff" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: responsibleMode === "other" ? "__other__" : f("responsiblePerson") || "",
              onValueChange: (v) => {
                if (v === "__other__") {
                  setResponsibleMode("other");
                  setForm((prev) => ({ ...prev, responsiblePerson: "" }));
                } else {
                  setResponsibleMode("list");
                  setForm((prev) => ({ ...prev, responsiblePerson: v }));
                }
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a staff member…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-60 overflow-y-auto", children: [
                  staffList.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: s.name, children: [
                    s.name,
                    s.role ? ` (${s.role})` : ""
                  ] }, s.name)),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / not in list" })
                ] })
              ]
            }
          )
        ] }),
        responsibleMode === "other" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f("responsiblePerson"), onChange: (e) => sf("responsiblePerson")(e.target.value), placeholder: "Full name" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1", children: "Timeline & Cost" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Planned Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f("plannedStartDate"), onChange: (e) => sf("plannedStartDate")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Planned Completion" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: f("plannedCompletionDate"), onChange: (e) => sf("plannedCompletionDate")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Estimated Cost (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: f("estimatedCost"), onChange: (e) => sf("estimatedCost")(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1", children: "Funding" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Funding Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f("fundingType"), onValueChange: sf("fundingType"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "How will this be funded?" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RA_FUNDING_TYPES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        isExternalFunding && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: fundingNameLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f("fundingGrantName"), onChange: (e) => sf("fundingGrantName")(e.target.value) })
          ] }),
          showGrantFields && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: fundingRefLabel }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f("fundingGrantReference"), onChange: (e) => sf("fundingGrantReference")(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1", children: "Funding agreement / grant offer letter" }),
            editing ? /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "carbon_action_funding_doc", recordId: editing.id }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "Save this record first to attach the funding agreement document." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1", children: "Contractor / Who will do the work?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "The person or firm physically carrying out this work — which may be different from the responsible person above." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contractor type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f("contractorType"), onValueChange: sf("contractorType"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RA_CONTRACTOR_TYPES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        isInternalContractor && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Staff member carrying out the work" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: f("contractorName"), onValueChange: sf("contractorName"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a staff member…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-60 overflow-y-auto", children: staffList.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: s.name, children: [
              s.name,
              s.role ? ` (${s.role})` : ""
            ] }, s.name)) })
          ] })
        ] }),
        isExternalContractor && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          contractorSuppliers.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Select from approved suppliers" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: f("contractorSupplierId") || "__other__",
                onValueChange: (v) => {
                  if (v === "__other__") {
                    setForm((prev) => ({ ...prev, contractorSupplierId: "", contractorCompany: "", contractorName: "" }));
                  } else {
                    const sup = contractorSuppliers.find((s) => String(s.id) === v);
                    setForm((prev) => ({
                      ...prev,
                      contractorSupplierId: v,
                      contractorCompany: sup?.name ?? "",
                      contractorName: sup?.contactName ?? prev.contractorName ?? ""
                    }));
                  }
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a supplier…" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { className: "max-h-60 overflow-y-auto", children: [
                    contractorSuppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                      s.name,
                      s.category ? ` — ${s.category}` : ""
                    ] }, s.id)),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Not in list (enter manually)" })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Linking to a supplier enables POs and invoices to be matched to this action." })
          ] }),
          (!f("contractorSupplierId") || f("contractorSupplierId") === "__other__") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contractor / individual name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f("contractorName"), onChange: (e) => sf("contractorName")(e.target.value), placeholder: "Name or trading name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Company / firm" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f("contractorCompany"), onChange: (e) => sf("contractorCompany")(e.target.value), placeholder: "Registered company name" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked PO reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: f("linkedPoReference"), onChange: (e) => sf("linkedPoReference")(e.target.value), placeholder: "e.g. PO-2024-0042" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Enter the purchase order number raised for this contractor's work so invoices can be matched." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: f("notes"), onChange: (e) => sf("notes")(e.target.value), rows: 2 })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
const SR_CERTIFYING_BODIES = [
  "Red Tractor Assurance",
  "LEAF Marque",
  "Soil Association",
  "Organic Farmers & Growers",
  "Woodland Carbon Code",
  "Peatland Code",
  "Countryside Stewardship (Natural England)",
  "SFI (Sustainable Farming Incentive)",
  "Farm Carbon Toolkit",
  "Agrecalc",
  "Cool Farm Alliance",
  "RCMS",
  "Other"
];
const SR_CUSTOMERS = [
  "Tesco",
  "Sainsbury's",
  "ASDA / Walmart",
  "M&S (Marks & Spencer)",
  "Waitrose / John Lewis Partnership",
  "Co-op",
  "Morrisons",
  "Aldi UK",
  "Lidl GB",
  "McDonald's UK",
  "ABP Food Group",
  "Cargill UK",
  "Müller UK",
  "Arla Foods UK",
  "Saputo Dairy UK",
  "AHDB Benchmarking",
  "Red Tractor Assurance",
  "LEAF (Linking Environment And Farming)",
  "Other"
];
const SR_REPORT_TYPES = [
  "Agrecalc",
  "Cool Farm Tool",
  "Farm Carbon Cutting Toolkit (FCCT)",
  "AHDB GHG Calculator",
  "Red Tractor Sustainability Assessment",
  "LEAF Marque Assessment",
  "Retailer Bespoke Format",
  "Other"
];
const SR_STATUS_OPTIONS = [
  { v: "draft", l: "Draft" },
  { v: "ready", l: "Ready to Submit" },
  { v: "submitted", l: "Submitted" },
  { v: "acknowledged", l: "Acknowledged" },
  { v: "resubmission_required", l: "Resubmission Required" },
  { v: "completed", l: "Completed" }
];
const SR_SUBMISSION_METHODS = ["Email", "Retailer Portal", "Post", "Hand Delivery", "Other"];
const srStatusLabel = (v) => SR_STATUS_OPTIONS.find((o) => o.v === String(v ?? ""))?.l ?? String(v ?? "—");
function ReportsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["sustainability-reports", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/sustainability-reports`), { credentials: "include" }).then((r) => r.json())
  });
  const save = useMutation({
    mutationFn: (b) => fetch(
      editing ? apiUrl(`farms/${farmId}/sustainability-reports/${editing.id}`) : apiUrl(`farms/${farmId}/sustainability-reports`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sustainability-reports", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/sustainability-reports/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sustainability-reports", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const { data: reportSuppliers = [] } = useQuery({
    queryKey: ["contractor-suppliers", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/contractor-suppliers`), { credentials: "include" }).then((r) => r.ok ? r.json() : { records: [] }).then((d) => d.records ?? [])
  });
  const { data: schemeRecords = [] } = useQuery({
    queryKey: ["scheme-records", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/scheme-records`), { credentials: "include" }).then((r) => r.ok ? r.json() : []).then((d) => Array.isArray(d) ? d : [])
  });
  const calcNetPosition = (() => {
    const em = parseFloat(String(form.totalEmissionsTonnesCo2e ?? ""));
    const seq = parseFloat(String(form.sequestrationTonnesCo2e ?? "0"));
    return !isNaN(em) ? (em - (isNaN(seq) ? 0 : seq)).toFixed(3) : null;
  })();
  const suggestedTitle = [form.reportYear, form.reportType, form.supplyChainCustomer].filter(Boolean).join(" — ");
  const handleOpen = (editRec) => {
    if (editRec) {
      setEditing(editRec);
      setForm(Object.fromEntries(
        Object.entries(editRec).map(([k, v]) => [k, v == null ? "" : typeof v === "boolean" ? v : String(v)])
      ));
    } else {
      setEditing(null);
      setForm({ status: "draft", submittedToCustomer: false });
    }
    setOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Sustainability Report Submissions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Track carbon and sustainability reports submitted to supply chain customers — retailers, processors, and certification bodies." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => handleOpen(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Report"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "reportYear", label: "Year" },
          { key: "reportTitle", label: "Title" },
          { key: "reportType", label: "Type" },
          { key: "supplyChainCustomer", label: "Customer" },
          { key: "deadlineDate", label: "Deadline", fmt: (r) => fmtDate(r.deadlineDate) },
          { key: "status", label: "Status", fmt: (r) => srStatusLabel(r.status) },
          { key: "submittedToCustomer", label: "Submitted", fmt: (r) => r.submittedToCustomer ? "Yes" : "No" },
          { key: "netPositionTonnesCo2e", label: "Net Position (tCO₂e)" }
        ],
        rows: reports,
        onView: setViewRecord,
        onEdit: (r) => handleOpen(r),
        onDelete: (r) => del.mutate(r.id),
        deleteMutation: del
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "48rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        String(viewRecord.reportYear ?? ""),
        " — ",
        String(viewRecord.supplyChainCustomer ?? "Sustainability Report"),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm font-normal text-muted-foreground", children: srStatusLabel(viewRecord.status) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Report Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.reportTitle ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Report Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.reportType ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Generated Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.generatedDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Supply Chain Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.supplyChainCustomer ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Contact at Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.contactNameAtCustomer ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Customer Deadline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.deadlineDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Submission Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.submissionMethod ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Submitted to Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.submittedToCustomer ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Submission Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.submissionDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Customer Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.customerReference ?? "—") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Acknowledged Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.acknowledgedDate) })
        ] }),
        !!(viewRecord.preparedBy || viewRecord.certifyingBody || viewRecord.certificateReference || viewRecord.preparedBySupplierId || viewRecord.preparedByPoReference || viewRecord.preparedByInvoiceRef) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3 grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Prepared By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.preparedBy ?? "—") }),
            !!viewRecord.preparedBySupplierId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Linked to supplier record" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "PO Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.preparedByPoReference ?? "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Invoice Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.preparedByInvoiceRef ?? "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certifying / Issuing Body" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.certifyingBody ?? "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Certificate / Reference No." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.certificateReference ?? "—") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3 grid grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Total Emissions (tCO₂e)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.totalEmissionsTonnesCo2e ?? "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sequestration (tCO₂e)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.sequestrationTonnesCo2e ?? "—") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Net Position (tCO₂e)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.netPositionTonnesCo2e ?? "—") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "sustainability_report", recordId: viewRecord.id }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.notes ?? "—") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          handleOpen(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) setEditing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "46rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Sustainability Report"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Report Year *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.reportYear ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, reportYear: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select year" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EM_YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.status ?? "draft"), onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SR_STATUS_OPTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Report Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.reportType ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, reportType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select tool / format" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SR_REPORT_TYPES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Generated Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.generatedDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, generatedDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Report Title *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: String(form.reportTitle ?? ""),
              onChange: (e) => setForm((f) => ({ ...f, reportTitle: e.target.value })),
              placeholder: suggestedTitle || "e.g. 2024 Agrecalc Carbon Report — Tesco"
            }
          ),
          suggestedTitle && !form.reportTitle && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            "Suggested:",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-primary underline", onClick: () => setForm((f) => ({ ...f, reportTitle: suggestedTitle })), children: suggestedTitle })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Supply Chain Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.supplyChainCustomer ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, supplyChainCustomer: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select customer" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-60 overflow-y-auto", children: SR_CUSTOMERS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact at Customer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.contactNameAtCustomer ?? ""), onChange: (e) => setForm((f) => ({ ...f, contactNameAtCustomer: e.target.value })), placeholder: "Name / team" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Customer Deadline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.deadlineDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, deadlineDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "sr-sub", checked: Boolean(form.submittedToCustomer), onCheckedChange: (v) => setForm((f) => ({ ...f, submittedToCustomer: Boolean(v) })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "sr-sub", children: "Submitted to customer?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Submission Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.submissionMethod ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, submissionMethod: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select method" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SR_SUBMISSION_METHODS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Submission Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.submissionDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, submissionDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Customer Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.customerReference ?? ""), onChange: (e) => setForm((f) => ({ ...f, customerReference: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Acknowledged Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.acknowledgedDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, acknowledgedDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2", children: "Report Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Prepared By" }),
              reportSuppliers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Select,
                  {
                    value: String(form.preparedBySupplierId ?? ""),
                    onValueChange: (v) => {
                      if (v === "__manual__") {
                        setForm((f) => ({ ...f, preparedBySupplierId: "", preparedBy: "" }));
                        return;
                      }
                      const s = reportSuppliers.find((s2) => String(s2.id) === v);
                      setForm((f) => ({ ...f, preparedBySupplierId: v, preparedBy: s?.name ?? "" }));
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select from suppliers…" }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                        reportSuppliers.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                          s.name,
                          s.category ? ` (${s.category})` : ""
                        ] }, s.id)),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "Not in supplier list" })
                      ] })
                    ]
                  }
                ),
                (!form.preparedBySupplierId || form.preparedBySupplierId === "__manual__") && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1.5", value: String(form.preparedBy ?? ""), onChange: (e) => setForm((f) => ({ ...f, preparedBy: e.target.value })), placeholder: "Company / organisation name" }),
                !!form.preparedBySupplierId && form.preparedBySupplierId !== "__manual__" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Linked to supplier — enables PO / invoice matching" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.preparedBy ?? ""), onChange: (e) => setForm((f) => ({ ...f, preparedBy: e.target.value })), placeholder: "Organisation / consultant name" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Purchase Order Ref." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.preparedByPoReference ?? ""), onChange: (e) => setForm((f) => ({ ...f, preparedByPoReference: e.target.value })), placeholder: "e.g. PO-2024-0142" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Invoice Ref." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.preparedByInvoiceRef ?? ""), onChange: (e) => setForm((f) => ({ ...f, preparedByInvoiceRef: e.target.value })), placeholder: "Invoice number" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certifying / Issuing Body" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.certifyingBody ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, certifyingBody: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select body…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: SR_CERTIFYING_BODIES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Certificate / Reference No." }),
              schemeRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Select,
                {
                  value: "",
                  onValueChange: (v) => {
                    const s = schemeRecords.find((r) => String(r.id) + r.type === v);
                    if (!s) return;
                    setForm((f) => ({
                      ...f,
                      certificateReference: String(s.agreementNumber ?? ""),
                      ...f.certifyingBody ? {} : { certifyingBody: String(s.schemeName ?? "") }
                    }));
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mb-1.5 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Auto-fill from a scheme record…" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: schemeRecords.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id) + s.type, children: [
                      s.schemeName,
                      " — ",
                      s.agreementNumber,
                      " (",
                      s.type,
                      ")"
                    ] }, `${s.type}-${s.id}`)) })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.certificateReference ?? ""), onChange: (e) => setForm((f) => ({ ...f, certificateReference: e.target.value })), placeholder: "Agreement / certificate reference" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2", children: "Key Metrics from Report" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Emissions (tCO₂e)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.001",
                  value: String(form.totalEmissionsTonnesCo2e ?? ""),
                  onChange: (e) => {
                    const em = parseFloat(e.target.value);
                    const seq = parseFloat(String(form.sequestrationTonnesCo2e ?? "0"));
                    const net = !isNaN(em) ? (em - (isNaN(seq) ? 0 : seq)).toFixed(3) : String(form.netPositionTonnesCo2e ?? "");
                    setForm((f) => ({ ...f, totalEmissionsTonnesCo2e: e.target.value, netPositionTonnesCo2e: net }));
                  },
                  placeholder: "0.000"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sequestration (tCO₂e)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.001",
                  value: String(form.sequestrationTonnesCo2e ?? ""),
                  onChange: (e) => {
                    const seq = parseFloat(e.target.value);
                    const em = parseFloat(String(form.totalEmissionsTonnesCo2e ?? ""));
                    const net = !isNaN(em) ? (em - (isNaN(seq) ? 0 : seq)).toFixed(3) : String(form.netPositionTonnesCo2e ?? "");
                    setForm((f) => ({ ...f, sequestrationTonnesCo2e: e.target.value, netPositionTonnesCo2e: net }));
                  },
                  placeholder: "0.000"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Position (tCO₂e)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.001",
                  value: String(form.netPositionTonnesCo2e ?? ""),
                  onChange: (e) => setForm((f) => ({ ...f, netPositionTonnesCo2e: e.target.value })),
                  placeholder: "Auto-calculated"
                }
              ),
              calcNetPosition && String(form.netPositionTonnesCo2e) !== calcNetPosition && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
                "= ",
                calcNetPosition,
                " tCO₂e",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-primary underline", onClick: () => setForm((f) => ({ ...f, netPositionTonnesCo2e: calcNetPosition })), children: "use this" })
              ] })
            ] })
          ] })
        ] }),
        editing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "sustainability_report", recordId: editing.id }) }),
        !editing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: "Save the report first, then open it to attach documents." }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
const TECH_TYPE_MAP = {
  solar_pv: "Solar PV",
  wind_turbine: "Wind Turbine",
  hydro: "Hydro",
  biomass_boiler: "Biomass Boiler",
  anaerobic_digester: "Anaerobic Digestion (AD)",
  ground_source_heat_pump: "Ground Source Heat Pump",
  air_source_heat_pump: "Air Source Heat Pump",
  other: "Other"
};
const UK_GRID_KG_CO2E_PER_KWH = 0.207;
function RenewableEnergyTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [syncing, setSyncing] = reactExports.useState(false);
  const [syncStatus, setSyncStatus] = reactExports.useState(null);
  const hasSyncedRef = reactExports.useRef(false);
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["renewable-energy", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/renewable-energy-production`), { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? [])
  });
  const { data: installations = [], isLoading: instLoading } = useQuery({
    queryKey: ["solar-installations", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/solar-installations`), { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? [])
  });
  const { data: generationReadings = [], isLoading: genLoading } = useQuery({
    queryKey: ["solar-generation", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/solar-generation`), { credentials: "include" }).then((r) => r.json()).then((d) => Array.isArray(d) ? d : d.records ?? [])
  });
  const save = useMutation({
    mutationFn: (b) => fetch(editing ? apiUrl(`farms/${farmId}/renewable-energy-production/${editing.id}`) : apiUrl(`farms/${farmId}/renewable-energy-production`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["renewable-energy", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/renewable-energy-production/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["renewable-energy", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const doSync = async (force = false) => {
    if (!installations.length && !generationReadings.length) {
      setSyncStatus({ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), created: 0 });
      return;
    }
    setSyncing(true);
    let created = 0;
    try {
      const instMap = /* @__PURE__ */ new Map();
      installations.forEach((i) => instMap.set(i.id, i));
      const groups = /* @__PURE__ */ new Map();
      generationReadings.forEach((g) => {
        if (!g.readingDate) return;
        const year = new Date(g.readingDate).getFullYear();
        const key = `${g.installationId}_${year}`;
        if (!groups.has(key)) groups.set(key, { installationId: g.installationId, year, readings: [] });
        groups.get(key).readings.push(g);
      });
      const existingKeys = new Set(
        records.map((r) => `${String(r.systemName ?? "").trim().toLowerCase()}_${r.productionYear}`)
      );
      for (const { installationId, year, readings } of groups.values()) {
        const inst = instMap.get(installationId);
        if (!inst) continue;
        const existKey = `${inst.installationName.trim().toLowerCase()}_${year}`;
        if (!force && existingKeys.has(existKey)) continue;
        const totalGen = readings.reduce((s, r) => s + (Number(r.generationKwh) || 0), 0);
        const totalExport = readings.reduce((s, r) => s + (Number(r.exportKwh) || 0), 0);
        const totalSelf = readings.reduce((s, r) => s + (Number(r.selfConsumedKwh) || 0), 0);
        const totalRevenue = readings.reduce((s, r) => s + (Number(r.fitPaymentAmount) || 0), 0);
        const co2Avoided = parseFloat((totalGen * UK_GRID_KG_CO2E_PER_KWH / 1e3).toFixed(3));
        const dates = readings.map((r) => r.readingDate).sort();
        const periodStart = `${year}-01-01`;
        const periodEnd = `${year}-12-31`;
        await fetch(apiUrl(`farms/${farmId}/renewable-energy-production`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            technologyType: TECH_TYPE_MAP[inst.technologyType] ?? "Other",
            systemName: inst.installationName,
            productionYear: year,
            installedCapacityKw: inst.installedCapacityKw ?? null,
            periodStart,
            periodEnd,
            generationKwh: totalGen || null,
            selfConsumedKwh: totalSelf || null,
            exportedKwh: totalExport || null,
            exportTariffPencePerKwh: inst.tariffRatePence ?? null,
            exportRevenueGbp: totalRevenue ? parseFloat((totalRevenue / 100).toFixed(2)) : null,
            co2AvoidedTonnes: co2Avoided || null,
            fitRocReference: inst.fitOrSegContractRef ?? null,
            meterReadingStart: null,
            meterReadingEnd: null,
            notes: `Auto-synced from Fuel & Energy (${readings.length} reading${readings.length !== 1 ? "s" : ""}, ${dates[0]} – ${dates[dates.length - 1]})`
          })
        }).then(async (r) => {
          if (!r.ok) {
            const t = await r.text().catch(() => "");
            throw new Error(t || `Request failed (${r.status})`);
          }
          return r;
        });
        created++;
      }
      if (created > 0) qc.invalidateQueries({ queryKey: ["renewable-energy", farmId] });
      setSyncStatus({ time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), created });
    } finally {
      setSyncing(false);
    }
  };
  reactExports.useEffect(() => {
    if (!hasSyncedRef.current && !isLoading && !instLoading && !genLoading) {
      hasSyncedRef.current = true;
      doSync(false);
    }
  }, [isLoading, instLoading, genLoading]);
  const TECH_TYPES = ["Solar PV", "Wind Turbine", "Anaerobic Digestion (AD)", "Hydro", "Biomass Boiler", "Ground Source Heat Pump", "Air Source Heat Pump", "Other"];
  const calcCo2Avoided = form.generationKwh ? (parseFloat(form.generationKwh) * UK_GRID_KG_CO2E_PER_KWH / 1e3).toFixed(3) : null;
  const calcExportRevenue = form.exportedKwh && form.exportTariffPencePerKwh ? (parseFloat(form.exportedKwh) * parseFloat(form.exportTariffPencePerKwh) / 100).toFixed(2) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Renewable Energy Production Log" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Auto-synced from Fuel & Energy. Generation, self-consumption and export from all on-farm renewables. CO₂ avoided calculated using the BEIS UK grid factor (0.207 kgCO₂e/kWh)." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setForm({ productionYear: String((/* @__PURE__ */ new Date()).getFullYear()) });
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Manual Record"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 px-3 py-2 rounded-md bg-green-50 border border-green-200 text-xs text-green-800", children: syncing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Syncing from Fuel & Energy…" })
    ] }) : syncStatus ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SunMedium, { className: "w-3.5 h-3.5 shrink-0 text-green-600" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: syncStatus.created > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          syncStatus.created,
          " new record",
          syncStatus.created !== 1 ? "s" : ""
        ] }),
        " pulled from Fuel & Energy · ",
        syncStatus.time
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        "Up to date · last checked ",
        syncStatus.time
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "underline text-green-700 hover:text-green-900", onClick: () => {
        hasSyncedRef.current = false;
        doSync(false);
      }, children: "Re-sync" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SunMedium, { className: "w-3.5 h-3.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Checking Fuel & Energy for new generation data…" })
    ] }) }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "technologyType", label: "Technology" },
          { key: "systemName", label: "System" },
          { key: "productionYear", label: "Year" },
          { key: "periodStart", label: "Period", fmt: (r) => `${fmtDate(r.periodStart)} – ${fmtDate(r.periodEnd)}` },
          { key: "generationKwh", label: "Generated (kWh)" },
          { key: "selfConsumedKwh", label: "Self-used (kWh)" },
          { key: "exportedKwh", label: "Exported (kWh)" },
          { key: "exportRevenueGbp", label: "Export Revenue (£)" },
          { key: "co2AvoidedTonnes", label: "CO₂ Avoided (t)" }
        ],
        rows: records,
        onEdit: (r) => {
          setEditing(r);
          setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
          setOpen(true);
        },
        onDelete: (r) => del.mutate(r.id),
        deleteMutation: del
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Renewable Energy Production" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Technology Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.technologyType ?? "", onValueChange: (v) => setForm((f) => ({ ...f, technologyType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TECH_TYPES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "System Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. South Barn Solar Array", value: form.systemName ?? "", onChange: (e) => setForm((f) => ({ ...f, systemName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Production Year *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.productionYear ?? "", onValueChange: (v) => setForm((f) => ({ ...f, productionYear: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select year" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: EM_YEARS.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Installed Capacity (kW)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.installedCapacityKw ?? "", onChange: (e) => setForm((f) => ({ ...f, installedCapacityKw: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Period Start *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.periodStart ?? "", onChange: (e) => setForm((f) => ({ ...f, periodStart: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Period End *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.periodEnd ?? "", onChange: (e) => setForm((f) => ({ ...f, periodEnd: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Generation (kWh) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.generationKwh ?? "", onChange: (e) => {
            const gen = parseFloat(e.target.value);
            const co2 = !isNaN(gen) ? (gen * UK_GRID_KG_CO2E_PER_KWH / 1e3).toFixed(3) : form.co2AvoidedTonnes;
            setForm((f) => ({ ...f, generationKwh: e.target.value, co2AvoidedTonnes: co2 }));
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Self-consumed (kWh)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.selfConsumedKwh ?? "", onChange: (e) => setForm((f) => ({ ...f, selfConsumedKwh: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Exported (kWh)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.exportedKwh ?? "", onChange: (e) => {
            const exp = parseFloat(e.target.value);
            const tariff = parseFloat(form.exportTariffPencePerKwh ?? "");
            const rev = !isNaN(exp) && !isNaN(tariff) ? (exp * tariff / 100).toFixed(2) : form.exportRevenueGbp;
            setForm((f) => ({ ...f, exportedKwh: e.target.value, exportRevenueGbp: rev }));
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Export Tariff (p/kWh)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.exportTariffPencePerKwh ?? "", onChange: (e) => {
            const tariff = parseFloat(e.target.value);
            const exp = parseFloat(form.exportedKwh ?? "");
            const rev = !isNaN(tariff) && !isNaN(exp) ? (exp * tariff / 100).toFixed(2) : form.exportRevenueGbp;
            setForm((f) => ({ ...f, exportTariffPencePerKwh: e.target.value, exportRevenueGbp: rev }));
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Export Revenue (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.exportRevenueGbp ?? "", onChange: (e) => setForm((f) => ({ ...f, exportRevenueGbp: e.target.value })) }),
          calcExportRevenue && form.exportRevenueGbp !== calcExportRevenue && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            "Calculated: £",
            calcExportRevenue,
            " (exported kWh × tariff)",
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ml-1 text-primary underline", onClick: () => setForm((f) => ({ ...f, exportRevenueGbp: calcExportRevenue })), children: "use this" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "CO₂ Avoided (tonnes)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", value: form.co2AvoidedTonnes ?? "", onChange: (e) => setForm((f) => ({ ...f, co2AvoidedTonnes: e.target.value })) }),
          calcCo2Avoided && form.co2AvoidedTonnes !== calcCo2Avoided && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            "Calculated: ",
            calcCo2Avoided,
            " t (generation × 0.207 kgCO₂e/kWh)",
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "ml-1 text-primary underline", onClick: () => setForm((f) => ({ ...f, co2AvoidedTonnes: calcCo2Avoided })), children: "use this" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "FIT / RO Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.fitRocReference ?? "", onChange: (e) => setForm((f) => ({ ...f, fitRocReference: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meter Reading (Start)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.meterReadingStart ?? "", onChange: (e) => setForm((f) => ({ ...f, meterReadingStart: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meter Reading (End)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.meterReadingEnd ?? "", onChange: (e) => setForm((f) => ({ ...f, meterReadingEnd: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
const BNG_ASSESSOR_TYPES = [
  "Internal staff",
  "Agri-environment advisor",
  "Independent ecologist",
  "CIEEM member ecologist"
];
const BNG_RECORD_TYPES = [
  { v: "baseline", l: "Baseline" },
  { v: "post-creation", l: "Post-creation" },
  { v: "annual-monitoring", l: "Annual Monitoring" },
  { v: "final-assessment", l: "Final Assessment" }
];
const BNG_HABITATS = [
  "Arable Field Margins",
  "Deciduous Woodland",
  "Hedgerow",
  "Grassland (neutral)",
  "Grassland (calcareous)",
  "Grassland (acid)",
  "Heathland",
  "Bog / Mire",
  "Fen",
  "Wetland / Reed Bed",
  "Pond / Lake",
  "River / Stream",
  "Wildflower Meadow",
  "Woodland Edge",
  "Other"
];
const BNG_CONDITIONS = ["Distinctly sub-optimal", "Moderate", "Fairly good", "Good", "Excellent"];
const BNG_COMPLIANCE = ["On track", "Shortfall identified", "Remedial action in progress", "In breach"];
const BNG_LEGAL_TYPES = ["Section 106", "Conservation Covenant", "Management Agreement", "Habitat Bank Agreement", "Planning Condition", "Other"];
function BngTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [assessorSupplierId, setAssessorSupplierId] = reactExports.useState(null);
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["bng", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/biodiversity-net-gain`), { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? [])
  });
  const save = useMutation({
    mutationFn: (b) => fetch(
      editing ? apiUrl(`farms/${farmId}/biodiversity-net-gain/${editing.id}`) : apiUrl(`farms/${farmId}/biodiversity-net-gain`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bng", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
      setAssessorSupplierId(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/biodiversity-net-gain/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bng", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const isMonitoring = form.recordType !== "baseline";
  const calcNetGain = (() => {
    const bl = parseFloat(form.baselineUnits ?? "");
    if (isNaN(bl)) return null;
    const comparator = isMonitoring ? parseFloat(form.achievedUnits ?? "") : parseFloat(form.targetUnits ?? "");
    return !isNaN(comparator) ? (comparator - bl).toFixed(3) : null;
  })();
  const showAssessorWarning = form.assessorType === "Internal staff" && !!(form.legalAgreementType || form.planningReference);
  const handleOpen = (editRec) => {
    if (editRec) {
      setEditing(editRec);
      setForm(Object.fromEntries(Object.entries(editRec).filter(([k]) => k !== "assessorSupplierId").map(([k, v]) => [k, v == null ? "" : String(v)])));
      setAssessorSupplierId(editRec.assessorSupplierId != null ? Number(editRec.assessorSupplierId) : null);
    } else {
      setEditing(null);
      setForm({ assessmentTool: "Defra Metric 4.0", recordType: "baseline", status: "active" });
      setAssessorSupplierId(null);
    }
    setOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Biodiversity Net Gain (BNG) Tracker" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Record habitat baseline assessments and post-creation monitoring using Defra Metric 4.0. Mandatory 10% BNG applies to most new planning permissions from April 2024. Biodiversity unit values must come from the Defra Metric calculator." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => handleOpen(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Record"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "assessmentDate", label: "Date", fmt: (r) => fmtDate(r.assessmentDate) },
          { key: "recordType", label: "Type", fmt: (r) => BNG_RECORD_TYPES.find((t) => t.v === String(r.recordType ?? ""))?.l ?? String(r.recordType ?? "—") },
          { key: "habitatType", label: "Habitat" },
          { key: "areaHa", label: "Area (ha)" },
          { key: "assessorType", label: "Assessor Type" },
          { key: "baselineCondition", label: "Baseline Condition" },
          { key: "targetCondition", label: "Target Condition" },
          { key: "achievedCondition", label: "Achieved Condition" },
          { key: "netGainUnits", label: "Net Gain Units" },
          { key: "complianceStatus", label: "Compliance" },
          { key: "status", label: "Status" }
        ],
        rows: records,
        onEdit: (r) => handleOpen(r),
        onDelete: (r) => del.mutate(r.id),
        deleteMutation: del
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      setOpen(v);
      if (!v) setEditing(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "48rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " BNG Record"
      ] }) }),
      showAssessorWarning && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800", children: "⚠ This record references a legal agreement or planning permission. Legally binding BNG assessments must be conducted by a qualified ecologist — not internal staff." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Assessment" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.assessmentDate ?? "", onChange: (e) => setForm((f) => ({ ...f, assessmentDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Record Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.recordType ?? "baseline", onValueChange: (v) => setForm((f) => ({ ...f, recordType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BNG_RECORD_TYPES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessor Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.assessorType ?? "", onValueChange: (v) => setForm((f) => ({ ...f, assessorType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select assessor type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BNG_ASSESSOR_TYPES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessor Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.assessorName ?? "", onChange: (e) => setForm((f) => ({ ...f, assessorName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessor Organisation / Firm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCombobox, { farmId, types: ["contractor", "general"], valueId: assessorSupplierId, valueName: form.assessorOrganisation ?? "", onChange: (id, name) => {
            setAssessorSupplierId(id);
            setForm((f) => ({ ...f, assessorOrganisation: name }));
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Assessment Tool" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.assessmentTool ?? "Defra Metric 4.0", onValueChange: (v) => setForm((f) => ({ ...f, assessmentTool: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Defra Metric 4.0", "Defra Metric 3.1", "Defra Metric 3.0", "CIEEM Rapid Assessment", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Habitat" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Habitat Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.habitatType ?? "", onValueChange: (v) => setForm((f) => ({ ...f, habitatType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select habitat" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { className: "max-h-60 overflow-y-auto", children: BNG_HABITATS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area (ha) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", value: form.areaHa ?? "", onChange: (e) => setForm((f) => ({ ...f, areaHa: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Habitat Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.habitatDescription ?? "", onChange: (e) => setForm((f) => ({ ...f, habitatDescription: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: isMonitoring ? "Baseline (from original survey)" : "Condition & Biodiversity Units" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: isMonitoring ? "Enter the original baseline values for reference. Condition is assessed by the ecologist using habitat-specific Defra criteria." : "Condition is assessed by the ecologist using habitat-specific Defra criteria. Unit values come directly from the Defra Biodiversity Metric calculator output." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Baseline Condition *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.baselineCondition ?? "", onValueChange: (v) => setForm((f) => ({ ...f, baselineCondition: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select condition" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BNG_CONDITIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Baseline Units" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.001",
              value: form.baselineUnits ?? "",
              onChange: (e) => {
                const bl = parseFloat(e.target.value);
                const comp = isMonitoring ? parseFloat(form.achievedUnits ?? "") : parseFloat(form.targetUnits ?? "");
                const net = !isNaN(bl) && !isNaN(comp) ? (comp - bl).toFixed(3) : form.netGainUnits ?? "";
                setForm((f) => ({ ...f, baselineUnits: e.target.value, netGainUnits: net }));
              },
              placeholder: "From Defra Metric calculator"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Condition" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.targetCondition ?? "", onValueChange: (v) => setForm((f) => ({ ...f, targetCondition: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Committed target" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BNG_CONDITIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Committed in the management agreement" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Units" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.001",
              value: form.targetUnits ?? "",
              onChange: (e) => {
                if (!isMonitoring) {
                  const bl = parseFloat(form.baselineUnits ?? "");
                  const tgt = parseFloat(e.target.value);
                  const net = !isNaN(bl) && !isNaN(tgt) ? (tgt - bl).toFixed(3) : form.netGainUnits ?? "";
                  setForm((f) => ({ ...f, targetUnits: e.target.value, netGainUnits: net }));
                } else {
                  setForm((f) => ({ ...f, targetUnits: e.target.value }));
                }
              },
              placeholder: "From Defra Metric calculator"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Must be ≥ 10% above baseline" })
        ] }),
        !isMonitoring && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Projected Net Gain Units" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              type: "number",
              step: "0.001",
              value: form.netGainUnits ?? "",
              onChange: (e) => setForm((f) => ({ ...f, netGainUnits: e.target.value })),
              placeholder: "Auto-calculated: target − baseline"
            }
          ),
          calcNetGain && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
            "= ",
            calcNetGain,
            " units (target ",
            form.targetUnits,
            " − baseline ",
            form.baselineUnits,
            ")",
            " ",
            String(form.netGainUnits) !== calcNetGain && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-primary underline", onClick: () => setForm((f) => ({ ...f, netGainUnits: calcNetGain })), children: "use this" })
          ] })
        ] }),
        isMonitoring && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Monitoring Results" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Record what was actually achieved in this monitoring period. Achieved condition must be assessed by the ecologist on site." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Achieved Condition" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.achievedCondition ?? "", onValueChange: (v) => setForm((f) => ({ ...f, achievedCondition: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Condition found on site" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BNG_CONDITIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Achieved Units" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.001",
                value: form.achievedUnits ?? "",
                onChange: (e) => {
                  const bl = parseFloat(form.baselineUnits ?? "");
                  const ach = parseFloat(e.target.value);
                  const net = !isNaN(bl) && !isNaN(ach) ? (ach - bl).toFixed(3) : form.netGainUnits ?? "";
                  setForm((f) => ({ ...f, achievedUnits: e.target.value, netGainUnits: net }));
                },
                placeholder: "From Defra Metric calculator"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Net Gain Units (Achieved)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.001",
                value: form.netGainUnits ?? "",
                onChange: (e) => setForm((f) => ({ ...f, netGainUnits: e.target.value })),
                placeholder: "Auto-calculated: achieved − baseline"
              }
            ),
            calcNetGain && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              "= ",
              calcNetGain,
              " units (achieved ",
              form.achievedUnits,
              " − baseline ",
              form.baselineUnits,
              ")",
              " ",
              String(form.netGainUnits) !== calcNetGain && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "text-primary underline", onClick: () => setForm((f) => ({ ...f, netGainUnits: calcNetGain })), children: "use this" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Compliance Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.complianceStatus ?? "", onValueChange: (v) => setForm((f) => ({ ...f, complianceStatus: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select status" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BNG_COMPLIANCE.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          form.complianceStatus && form.complianceStatus !== "On track" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Remedial Action / Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: form.remedialActionNotes ?? "",
                onChange: (e) => setForm((f) => ({ ...f, remedialActionNotes: e.target.value })),
                rows: 2,
                placeholder: "Describe the shortfall and any remedial actions being taken or planned…"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Legal Agreement" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Legal Agreement Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.legalAgreementType ?? "", onValueChange: (v) => setForm((f) => ({ ...f, legalAgreementType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: BNG_LEGAL_TYPES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Planning Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.planningReference ?? "", onChange: (e) => setForm((f) => ({ ...f, planningReference: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Management Commitment (years)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.managementCommitmentYears ?? "", onChange: (e) => setForm((f) => ({ ...f, managementCommitmentYears: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "active", onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [{ v: "active", l: "Active" }, { v: "monitoring", l: "Monitoring" }, { v: "completed", l: "Completed" }, { v: "lapsed", l: "Lapsed" }].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate({ ...form, assessorSupplierId: assessorSupplierId ?? null }), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function CarbonPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "carbon", farmId, validIds: ["audits", "emissions", "sequestration", "actions", "reports", "renewable", "bng", "auto-calc"], defaultTab: "audits" });
  const [prefillAudit, setPrefillAudit] = reactExports.useState(null);
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Carbon & Sustainability", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "audits", onClick: () => setTab("audits"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5 mr-1" }),
        "Carbon Audits"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "emissions", onClick: () => setTab("emissions"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "w-3.5 h-3.5 mr-1" }),
        "Emissions"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "sequestration", onClick: () => setTab("sequestration"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trees, { className: "w-3.5 h-3.5 mr-1" }),
        "Sequestration"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "actions", onClick: () => setTab("actions"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-3.5 h-3.5 mr-1" }),
        "Reduction Actions"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "renewable", onClick: () => setTab("renewable"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SunMedium, { className: "w-3.5 h-3.5 mr-1" }),
        "Renewable Energy"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "bng", onClick: () => setTab("bng"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "w-3.5 h-3.5 mr-1" }),
        "Biodiversity Net Gain"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "reports", onClick: () => setTab("reports"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileChartColumnIncreasing, { className: "w-3.5 h-3.5 mr-1" }),
        "Reports"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "auto-calc", onClick: () => setTab("auto-calc"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-3.5 h-3.5 mr-1" }),
        "Auto-Calculator"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
      tab === "audits" && /* @__PURE__ */ jsxRuntimeExports.jsx(AuditsTab, { farmId, prefillAudit, onPrefillUsed: () => setPrefillAudit(null) }),
      tab === "emissions" && /* @__PURE__ */ jsxRuntimeExports.jsx(EmissionsTab, { farmId }),
      tab === "sequestration" && /* @__PURE__ */ jsxRuntimeExports.jsx(SequestrationTab, { farmId }),
      tab === "actions" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReductionActionsTab, { farmId }),
      tab === "renewable" && /* @__PURE__ */ jsxRuntimeExports.jsx(RenewableEnergyTab, { farmId }),
      tab === "bng" && /* @__PURE__ */ jsxRuntimeExports.jsx(BngTab, { farmId }),
      tab === "reports" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReportsTab, { farmId }),
      tab === "auto-calc" && /* @__PURE__ */ jsxRuntimeExports.jsx(CarbonAutoCalcTab, { farmId, onUseForAudit: (s1, s2, s3, t, notes) => {
        setPrefillAudit({ scope1: s1, scope2: s2, scope3: s3, total: t, notes });
        setTab("audits");
      } })
    ] }) })
  ] }) });
}
const DEFRA_EF = {
  diesel: { label: "Red Diesel / Gas Oil", unit: "litres", kgCo2ePerUnit: 2.5437, scope: "1", category: "Fuel" },
  petrol: { label: "Petrol", unit: "litres", kgCo2ePerUnit: 2.1555, scope: "1", category: "Fuel" },
  lng: { label: "LNG / Propane (heating)", unit: "litres", kgCo2ePerUnit: 1.1544, scope: "1", category: "Fuel" },
  elec: { label: "Grid Electricity", unit: "kWh", kgCo2ePerUnit: 0.20705, scope: "2", category: "Energy" },
  ammonium: { label: "Ammonium Nitrate (34.5%N)", unit: "kg", kgCo2ePerUnit: 5.82, scope: "3", category: "Fertiliser" },
  urea: { label: "Urea (46%N)", unit: "kg", kgCo2ePerUnit: 4.7, scope: "3", category: "Fertiliser" },
  can: { label: "CAN (27%N)", unit: "kg", kgCo2ePerUnit: 3.04, scope: "3", category: "Fertiliser" },
  beef_head: { label: "Beef cattle (per head/yr)", unit: "head", kgCo2ePerUnit: 3200, scope: "1", category: "Livestock" },
  dairy_head: { label: "Dairy cows (per head/yr)", unit: "head", kgCo2ePerUnit: 5400, scope: "1", category: "Livestock" },
  sheep_head: { label: "Sheep (per head/yr)", unit: "head", kgCo2ePerUnit: 320, scope: "1", category: "Livestock" },
  pigs_head: { label: "Pigs (per head/yr)", unit: "head", kgCo2ePerUnit: 310, scope: "1", category: "Livestock" },
  poultry_k: { label: "Poultry (per 1,000 birds)", unit: "k birds", kgCo2ePerUnit: 280, scope: "1", category: "Livestock" }
};
function CarbonAutoCalcTab({ farmId, onUseForAudit }) {
  const [inputs, setInputs] = reactExports.useState({});
  const [copied, setCopied] = reactExports.useState(false);
  const [prefillYear, setPrefillYear] = usePersistedFilter({ page: "carbon-auto-calc", filter: "year", farmId, defaultValue: String((/* @__PURE__ */ new Date()).getFullYear() - 1) });
  const [prefilling, setPrefilling] = reactExports.useState(false);
  const [prefillSources, setPrefillSources] = reactExports.useState(null);
  const set = (key, val) => setInputs((p) => ({ ...p, [key]: val }));
  const results = Object.entries(DEFRA_EF).map(([key, ef]) => {
    const qty = parseFloat(inputs[key] ?? "0") || 0;
    const tCo2e = qty * ef.kgCo2ePerUnit / 1e3;
    return { key, ...ef, qty, tCo2e };
  });
  const s1 = results.filter((r) => r.scope === "1").reduce((s, r) => s + r.tCo2e, 0);
  const s2 = results.filter((r) => r.scope === "2").reduce((s, r) => s + r.tCo2e, 0);
  const s3 = results.filter((r) => r.scope === "3").reduce((s, r) => s + r.tCo2e, 0);
  const total = s1 + s2 + s3;
  const fmt2 = (t) => t.toFixed(3);
  const cats = [...new Set(Object.values(DEFRA_EF).map((e) => e.category))];
  const prefillYears = Array.from({ length: 6 }, (_, i) => String((/* @__PURE__ */ new Date()).getFullYear() - i));
  const handlePrefill = async () => {
    setPrefilling(true);
    try {
      const r = await fetch(apiUrl(`farms/${farmId}/carbon-calc-prefill?year=${prefillYear}`), { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        const next = {};
        Object.keys(DEFRA_EF).forEach((key) => {
          const v = data[key];
          if (v != null && Number(v) > 0) next[key] = String(parseFloat(String(v)));
        });
        setInputs(next);
        setPrefillSources(data.sources ?? {});
      }
    } finally {
      setPrefilling(false);
    }
  };
  const auditNotes = total > 0 ? `Auto-calculated from farm records (${prefillYear}) using DEFRA 2023 GHG Conversion Factors.
${results.filter((r) => r.qty > 0).map((r) => `${r.label}: ${r.qty} ${r.unit} → ${fmt2(r.tCo2e)} tCO₂e`).join("\n")}` : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-end", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mb-1 font-medium", children: "Pre-fill year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: prefillYear, onValueChange: setPrefillYear, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: prefillYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: handlePrefill, disabled: prefilling, children: prefilling ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 mr-1.5 animate-spin" }),
        "Loading…"
      ] }) : "Pre-fill from farm records" }),
      prefillSources && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 flex-wrap", children: ["fuel", "fertiliser", "livestock", "electricity"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-2 py-0.5 rounded-full border font-medium ${prefillSources[s] ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"}`, children: [
        prefillSources[s] ? "✓" : "—",
        " ",
        s
      ] }, s)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "w-4 h-4 mt-0.5 shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "DEFRA 2023 GHG Conversion Factors." }),
        " Pre-fill from your farm records or enter quantities manually — totals update instantly. When ready, use ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Create Carbon Audit" }),
        " to push the figures directly into a new audit record."
      ] })
    ] }),
    total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-3", children: [
      { label: "Scope 1 (Direct)", val: s1, bg: "#fef2f2", col: "#dc2626" },
      { label: "Scope 2 (Energy)", val: s2, bg: "#fffbeb", col: "#d97706" },
      { label: "Scope 3 (Indirect)", val: s3, bg: "#f5f3ff", col: "#7c3aed" },
      { label: "Total tCO₂e / yr", val: total, bg: "#f9fafb", col: "#111827" }
    ].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl p-4 border text-center", style: { background: s.bg }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", style: { color: s.col }, children: fmt2(s.val) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: s.label })
    ] }, s.label)) }),
    cats.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-700 mb-2", children: cat }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-gray-50 border-b text-xs text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2 font-medium", children: "Activity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2 font-medium", children: "Scope" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2 font-medium", children: "Quantity / year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-2 font-medium", children: "EF (kg CO₂e)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-4 py-2 font-medium", children: "tCO₂e" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: results.filter((r) => r.category === cat).map((r, i, arr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 font-medium text-gray-800", children: r.label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs px-1.5 py-0.5 rounded font-medium ${r.scope === "1" ? "bg-red-100 text-red-700" : r.scope === "2" ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-700"}`, children: [
            "S",
            r.scope
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: "0", step: "any", className: "w-24 border rounded px-2 py-1 text-sm", value: inputs[r.key] ?? "", onChange: (e) => set(r.key, e.target.value), placeholder: "0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400", children: r.unit })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-xs text-gray-400", children: r.kgCo2ePerUnit.toLocaleString() }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2.5 text-right font-mono font-semibold", children: r.tCo2e > 0 ? fmt2(r.tCo2e) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-300 font-normal", children: "—" }) })
        ] }, r.key)) })
      ] }) })
    ] }, cat)),
    total > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => onUseForAudit(s1, s2, s3, total, auditNotes), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-4 h-4 mr-1.5" }),
        "Use these figures → Create Carbon Audit"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          className: "text-sm border px-4 py-2 rounded-lg font-medium hover:bg-gray-50",
          onClick: () => {
            const lines = [`DEFRA Auto-Calc — Total: ${fmt2(total)} tCO₂e/yr`, `Scope 1: ${fmt2(s1)} | Scope 2: ${fmt2(s2)} | Scope 3: ${fmt2(s3)}`, ``, ...results.filter((r) => r.qty > 0).map((r) => `  ${r.label}: ${r.qty} ${r.unit} → ${fmt2(r.tCo2e)} tCO₂e`)];
            navigator.clipboard.writeText(lines.join("\n"));
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          },
          children: copied ? "✓ Copied" : "Copy to Clipboard"
        }
      )
    ] })
  ] });
}
export {
  CarbonPage as default
};
