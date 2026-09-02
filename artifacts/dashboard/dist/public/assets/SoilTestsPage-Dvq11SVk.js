const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/leaflet-src-Da-Npv1V.js","assets/index-Dq7ETKNw.js","assets/index-BqyJtWxe.css"])))=>i.map(i=>d[i]);
import { s as createLucideIcon, m as useQuery, c as useQueryClient, r as reactExports, S as useMutation, aN as toast, j as jsxRuntimeExports, d as Button, T as Plus, e as LoaderCircle, n as Card, M as MapPin, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, I as Input, N as DialogMutationError, J as DialogFooter, O as React, _ as __vitePreload, X, b as useAppStore, R as Redirect, K as Map$1, a as useToast, U as FlaskConical, A as ArrowRight, H as DialogDescription, B as Building2 } from "./index-Dq7ETKNw.js";
import { a as usePersistedFilter, u as usePersistedNumberFilter } from "./use-persisted-filter-BoVDVFfM.js";
import { C as ConfirmDialog } from "./confirm-dialog-DIvJ5fLh.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B0tM2xzX.js";
import { p as parseCsvText } from "./bottling-csv-BeHtHDhe.js";
import { A as Activity } from "./activity-g3A4UYj-.js";
import { C as Calendar } from "./calendar-BZ6XOpvb.js";
import { P as Pencil } from "./pencil-CJLXYShC.js";
import { T as Trash2, C as ChevronDown } from "./trash-2-B051Nk0V.js";
import { C as ChevronUp } from "./chevron-up-BQ9VpSIZ.js";
import { C as ChartNoAxesColumn } from "./chart-no-axes-column-Qr6EY8L0.js";
import { U as Upload } from "./upload-Cs_gYTxt.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, _ as ReferenceLine } from "./generateCategoricalChart-T1qqGCge.js";
import { L as LineChart } from "./LineChart-Dl92Hvnt.js";
import { C as CartesianGrid } from "./CartesianGrid-B2jSm6NB.js";
import { L as Line } from "./Line-OopoEenc.js";
import { C as Cpu } from "./cpu-BPO1-9Se.js";
import { C as CircleCheckBig } from "./circle-check-big-DhpIUkKA.js";
import { I as Info, A as AppLayout, T as TrendingUp, i as TestTube, U as Users } from "./AppLayout-B8I5kP9a.js";
import { C as CircleAlert, a as Clock } from "./database-Bm6ZiS0t.js";
import { o as openPrintWindow } from "./print-report-ClU8-1P0.js";
import { C as CropYearSelector } from "./CropYearSelector-CTWIIXHK.js";
import { c as currentCropYear, i as isInCropYear } from "./cropYear-Dmv-iNR6.js";
import { u as usePersistedTab } from "./use-persisted-tab-Cbu2lQoD.js";
import { T as TabBar, a as TabButton } from "./tab-button-Bk_KmBTr.js";
import { L as LabSelector } from "./LabSelector-QYwpMnkE.js";
import { R as RecordAttachments } from "./RecordAttachments-CsLmSc2O.js";
import { u as useQueries } from "./useQueries-488kruce.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem, d as DropdownMenuSeparator } from "./dropdown-menu-CgFs3W8R.js";
import { S as Search } from "./search-D1DNkgbE.js";
import { E as Ellipsis } from "./ellipsis-1fOkl24j.js";
import { A as Archive } from "./archive-CBoZHeX-.js";
import { H as History } from "./history-BtUfBcLx.js";
import { U as UserCheck } from "./user-check-D6DL2kQQ.js";
import { P as Printer } from "./printer-DvdgRXBc.js";
import { M as Minus } from "./minus-Dpe4zR-O.js";
import { T as TrendingDown } from "./trending-down-DYBs72hD.js";
import "./index-DPLuSmH_.js";
import "./index-CkGadoSP.js";
import "./use-safe-clerk-CWH6qFOJ.js";
import "./shield-alert-Duw1BH-c.js";
import "./triangle-alert-YuC7-1rz.js";
import "./shield-check-BtwviHfM.js";
import "./tractor-BCHVit-1.js";
import "./use-upload-BwthrWi6.js";
import "./paperclip-iPpojDCT.js";
import "./image-C4tqSFz3.js";
import "./download-Ys6IG1SI.js";
import "./index-CAb-kyg8.js";
import "./circle-ByzT-RHV.js";
const __iconNode$1 = [
  ["path", { d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z", key: "1rqfz7" }],
  ["path", { d: "M14 2v4a2 2 0 0 0 2 2h4", key: "tnqrlb" }],
  ["path", { d: "M12 12v6", key: "3ahymv" }],
  ["path", { d: "m15 15-3-3-3 3", key: "15xj92" }]
];
const FileUp = createLucideIcon("file-up", __iconNode$1);
const __iconNode = [
  ["path", { d: "M12 3v18", key: "108xh3" }],
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M3 9h18", key: "1pudct" }],
  ["path", { d: "M3 15h18", key: "5xshup" }]
];
const Table = createLucideIcon("table", __iconNode);
const SENSOR_TYPES = {
  moisture: "Moisture only",
  moisture_temp: "Moisture + Temperature",
  moisture_temp_ec: "Moisture + Temperature + EC",
  multi_depth: "Multi-depth (moisture + temperature + EC)"
};
const PROBE_CATALOGUE = {
  "METER Group": {
    "TEROS 10": { sensorType: "moisture" },
    "TEROS 11": { sensorType: "moisture_temp_ec" },
    "TEROS 12": { sensorType: "moisture_temp_ec" },
    "TEROS 21": { sensorType: "moisture_temp" },
    "TEROS 54": { sensorType: "moisture_temp" },
    "GS3": { sensorType: "moisture_temp_ec" },
    "5TM": { sensorType: "moisture_temp" },
    "5TE": { sensorType: "moisture_temp_ec" },
    "EC-5": { sensorType: "moisture" },
    "Em50 / Em50G": { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 60" }
  },
  "Sentek Technologies": {
    "Drill & Drop": { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 50, 60" },
    "EnviroSCAN": { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 60, 100" },
    "EasyAG 50": { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 50" },
    "EasyAG 70": { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 50, 60, 70" },
    "TriSCAN": { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 60" }
  },
  "Delta-T Devices": {
    "SM150T": { sensorType: "moisture_temp" },
    "SM300": { sensorType: "moisture_temp_ec" },
    "Profile Probe PR2": { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 60, 100" },
    "GP2": { sensorType: "moisture_temp_ec" },
    "WET-2": { sensorType: "moisture_temp_ec" },
    "HH2 / PR2": { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 60, 100" }
  },
  "Stevens Water": {
    "HydraProbe": { sensorType: "moisture_temp_ec" },
    "HydraProbe 2": { sensorType: "moisture_temp_ec" },
    "Pico": { sensorType: "moisture_temp" },
    "Vitel": { sensorType: "moisture_temp_ec" }
  },
  "Pessl Instruments (METOS)": {
    "SMT100": { sensorType: "moisture_temp" },
    "iMETOS Soil": { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 60" },
    "PHOS": { sensorType: "moisture_temp_ec" }
  },
  "Vegetronix": {
    "VH400": { sensorType: "moisture" },
    "VH400-WB": { sensorType: "moisture_temp" },
    "THERM200": { sensorType: "moisture_temp" },
    "Aqua-Spy": { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 60" }
  },
  "Campbell Scientific": {
    "CS616": { sensorType: "moisture" },
    "CS650": { sensorType: "moisture_temp" },
    "CS655": { sensorType: "moisture_temp_ec" },
    "Hydrosense II": { sensorType: "moisture" }
  },
  "Acclima": {
    "TDR-310S": { sensorType: "moisture_temp_ec" },
    "TDR-315L": { sensorType: "moisture_temp_ec" },
    "TDR-315H": { sensorType: "moisture_temp_ec" }
  },
  "Other": {}
};
const MANUFACTURERS = Object.keys(PROBE_CATALOGUE);
function fmt(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return val;
  }
}
function fmtDt(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return val;
  }
}
function parseNum(s) {
  if (!s) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}
function EmptySensors({ onAdd }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-16 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-7 h-7 text-green-600" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-base font-semibold text-gray-800 mb-1", children: "No sensor probes registered" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 max-w-sm mb-5", children: "Register your first continuous soil monitoring probe to start recording moisture, temperature, and electrical conductivity readings." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onAdd, size: "sm", className: "gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
      " Add First Probe"
    ] })
  ] });
}
const EMPTY_PROBE = {
  name: "",
  manufacturer: "",
  model: "",
  sensorType: "moisture_temp_ec",
  depthsCm: "",
  fieldId: "",
  latitude: "",
  longitude: "",
  installDate: "",
  notes: ""
};
function ProbeDialog({
  open,
  onClose,
  probe,
  fields,
  farmId
}) {
  const qc = useQueryClient();
  const [form, setForm] = reactExports.useState(() => probe ? {
    name: probe.name,
    manufacturer: probe.manufacturer ?? "",
    model: probe.model ?? "",
    sensorType: probe.sensorType,
    depthsCm: probe.depthsCm ?? "",
    fieldId: probe.fieldId ? String(probe.fieldId) : "",
    latitude: probe.latitude ?? "",
    longitude: probe.longitude ?? "",
    installDate: probe.installDate ? probe.installDate.slice(0, 10) : "",
    notes: probe.notes ?? ""
  } : EMPTY_PROBE);
  const [sensorTypeAutoDetected, setSensorTypeAutoDetected] = reactExports.useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const knownModels = form.manufacturer && form.manufacturer !== "Other" ? Object.keys(PROBE_CATALOGUE[form.manufacturer] ?? {}) : null;
  function handleManufacturerChange(mfr) {
    setForm((f) => ({ ...f, manufacturer: mfr === "__none__" ? "" : mfr, model: "" }));
    setSensorTypeAutoDetected(false);
  }
  function handleModelSelect(modelValue) {
    const model = modelValue === "__none__" ? "" : modelValue;
    const spec = form.manufacturer ? PROBE_CATALOGUE[form.manufacturer]?.[model] : void 0;
    setForm((f) => ({
      ...f,
      model,
      sensorType: spec ? spec.sensorType : f.sensorType,
      // Suggest depths only when the field is currently empty
      depthsCm: spec?.typicalDepthsCm && !f.depthsCm ? spec.typicalDepthsCm : f.depthsCm
    }));
    setSensorTypeAutoDetected(!!spec);
  }
  const save = useMutation({
    mutationFn: async () => {
      const url = probe ? `/api/farms/${farmId}/soil-sensors/${probe.id}` : `/api/farms/${farmId}/soil-sensors`;
      const res = await fetch(url, {
        method: probe ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isActive: true })
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["soil-sensors", farmId] });
      toast({ title: probe ? "Probe updated" : "Probe registered", description: form.name });
      onClose();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      onClose();
      save.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: probe ? "Edit Sensor Probe" : "Register Sensor Probe" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Probe Name *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.name, onChange: set("name"), placeholder: "e.g. North Field — TEROS 12" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Manufacturer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.manufacturer || "__none__", onValueChange: handleManufacturerChange, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select manufacturer…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not specified —" }),
            MANUFACTURERS.filter((m) => m !== "Other").map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other / not listed" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Model" }),
        knownModels && knownModels.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.model || "__none__", onValueChange: handleModelSelect, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select model…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select model —" }),
            knownModels.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m))
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.model,
            onChange: set("model"),
            placeholder: form.manufacturer ? "Enter model name" : "Select a manufacturer first",
            disabled: !form.manufacturer
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600", children: "Sensor Type" }),
          sensorTypeAutoDetected && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-green-600 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3 h-3" }),
            " Auto-detected"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: form.sensorType,
            onValueChange: (v) => {
              setForm((f) => ({ ...f, sensorType: v }));
              setSensorTypeAutoDetected(false);
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: Object.entries(SENSOR_TYPES).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: k, children: v }, k)) })
            ]
          }
        ),
        sensorTypeAutoDetected && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "Detected from the selected model — you can override this if needed." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Monitoring Depths (cm)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.depthsCm, onChange: set("depthsCm"), placeholder: "e.g. 10, 20, 30, 60" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-0.5", children: "Comma-separated depths at which this probe measures" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Field (optional)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fieldId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, fieldId: v === "__none__" ? "" : v })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "— Farm-wide —" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Farm-wide —" }),
            fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(f.id), children: [
              f.name,
              f.fieldReference ? ` (${f.fieldReference})` : ""
            ] }, f.id))
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Latitude" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.latitude, onChange: set("latitude"), placeholder: "e.g. 52.1234" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Longitude" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.longitude, onChange: set("longitude"), placeholder: "e.g. -1.5678" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Install Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.installDate, onChange: set("installDate") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            value: form.notes,
            onChange: set("notes"),
            rows: 2,
            className: "w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500",
            placeholder: "Location description, calibration notes…"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: !form.name || save.isPending, children: [
        save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
        probe ? "Save Changes" : "Register Probe"
      ] })
    ] })
  ] }) });
}
const EMPTY_READING = {
  readingAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
  depthCm: "",
  moisturePercent: "",
  temperatureCelsius: "",
  ecUsPerCm: "",
  notes: ""
};
function AddReadingDialog({ open, onClose, probe, farmId }) {
  const qc = useQueryClient();
  const [form, setForm] = reactExports.useState(EMPTY_READING);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/soil-sensors/${probe.id}/readings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["soil-readings", probe.id] });
      toast({ title: "Reading recorded" });
      setForm(EMPTY_READING);
      onClose();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
    if (!v) {
      onClose();
      save.reset();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Manual Reading" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: probe.name })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Date & Time *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: form.readingAt, onChange: set("readingAt") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Depth (cm)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.depthCm, onChange: set("depthCm"), placeholder: "e.g. 20" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Moisture (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.moisturePercent, onChange: set("moisturePercent"), placeholder: "0–100" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Temp (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.temperatureCelsius, onChange: set("temperatureCelsius"), placeholder: "e.g. 12" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "EC (μS/cm)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.ecUsPerCm, onChange: set("ecUsPerCm"), placeholder: "e.g. 250" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.notes, onChange: set("notes"), placeholder: "Optional observation…" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => save.mutate(), disabled: !form.readingAt || save.isPending, children: [
        save.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
        "Record Reading"
      ] })
    ] })
  ] }) });
}
function CsvImportDialog({ open, onClose, probe, farmId }) {
  const qc = useQueryClient();
  const fileRef = reactExports.useRef(null);
  const [preview, setPreview] = reactExports.useState([]);
  const [error, setError] = reactExports.useState(null);
  const [importing, setImporting] = reactExports.useState(false);
  const [failedRows, setFailedRows] = reactExports.useState([]);
  const [importedSoFar, setImportedSoFar] = reactExports.useState(0);
  const parseCSV = reactExports.useCallback((text) => {
    setError(null);
    const records = parseCsvText(text);
    if (records.length < 2) {
      setError("CSV must have a header row and at least one data row.");
      return;
    }
    const headers = records[0].map((h) => h.toLowerCase());
    const required = ["readingat"];
    const missing = required.filter((r) => !headers.includes(r));
    if (missing.length > 0) {
      setError(`Missing required column: ${missing.join(", ")}. Expected headers: readingat, depthcm, moisturepercent, temperaturecelsius, ecuspercm`);
      return;
    }
    const rows = records.slice(1).map(
      (vals) => Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]))
    );
    setPreview(rows.slice(0, 5));
  }, []);
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFailedRows([]);
    setImportedSoFar(0);
    const reader = new FileReader();
    reader.onload = (ev) => parseCSV(String(ev.target?.result ?? ""));
    reader.readAsText(f);
  };
  const submitRows = async (rowVals, alreadyImported) => {
    setImporting(true);
    setError(null);
    try {
      const rows = rowVals.map((r) => ({
        readingAt: r.readingAt,
        depthCm: r.depthCm ? parseInt(r.depthCm, 10) : void 0,
        moisturePercent: r.moisturePercent || void 0,
        temperatureCelsius: r.temperatureCelsius || void 0,
        ecUsPerCm: r.ecUsPerCm || void 0,
        notes: r.notes || void 0
      }));
      const res = await fetch(`/api/farms/${farmId}/soil-sensors/${probe.id}/readings/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows })
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Import failed");
      const data = await res.json();
      qc.invalidateQueries({ queryKey: ["soil-readings", probe.id] });
      const totalImported = alreadyImported + (data.inserted ?? 0);
      const rejectedCount = data.rejectedCount ?? 0;
      if (rejectedCount > 0) {
        const rejects = data.rejected ?? [];
        setFailedRows(rejects.filter((rej) => rowVals[rej.row - 1] !== void 0).map((rej) => ({ values: rowVals[rej.row - 1], reason: rej.reason.replace(/^Row \d+:\s*/, "") })));
        setImportedSoFar(totalImported);
        toast({
          title: `${data.inserted} imported, ${rejectedCount} skipped`,
          description: "Fix the skipped rows below and re-submit just those rows.",
          variant: "destructive"
        });
      } else {
        toast({ title: "Import complete", description: `${totalImported} readings imported` });
        setFailedRows([]);
        setImportedSoFar(0);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };
  const doImport = async () => {
    if (!fileRef.current?.files?.[0]) return;
    const text = await fileRef.current.files[0].text();
    const records = parseCsvText(text);
    if (records.length < 2) {
      setError("CSV must have a header row and at least one data row.");
      return;
    }
    const headers = records[0].map((h) => h.toLowerCase());
    const rowVals = records.slice(1).map((vals) => {
      const row = Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
      return {
        readingAt: row["readingat"] || row["datetime"] || row["timestamp"] || "",
        depthCm: row["depthcm"] || "",
        moisturePercent: row["moisturepercent"] || row["moisture"] || "",
        temperatureCelsius: row["temperaturecelsius"] || row["temperature"] || row["temp"] || "",
        ecUsPerCm: row["ecuspercm"] || row["ec"] || "",
        notes: row["notes"] || ""
      };
    });
    await submitRows(rowVals, 0);
  };
  const retryFailed = async () => {
    await submitRows(failedRows.map((f) => f.values), importedSoFar);
  };
  const setFailedField = (idx, key, value) => {
    setFailedRows((prev) => prev.map((f, i) => i === idx ? { ...f, values: { ...f.values, [key]: value } } : f));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => !v && onClose(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Import Readings from CSV" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: probe.name })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-blue-100 bg-blue-50 p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-3 h-3" }),
          " Expected CSV format"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("code", { className: "text-xs text-blue-800 block font-mono leading-5", children: [
          "readingat,depthcm,moisturepercent,temperaturecelsius,ecuspercm,notes",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "2026-03-01 09:00,20,28.5,11.2,185,",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          "2026-03-01 10:00,20,28.3,11.4,186,Dry spell"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-600 mt-1.5", children: [
          "Only ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "readingat" }),
          " is required. Column names are case-insensitive. Up to 5,000 rows per import."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-gray-600 mb-1 block", children: "Choose CSV file" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            ref: fileRef,
            type: "file",
            accept: ".csv,text/csv",
            onChange: onFile,
            className: "block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-200 file:bg-gray-50 file:text-gray-700 file:text-sm cursor-pointer"
          }
        )
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-red-200 bg-red-50 p-3 flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-red-500 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-700", children: error })
      ] }),
      failedRows.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-red-200 bg-red-50 p-3 mb-2 flex items-start gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-red-500 mt-0.5 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-red-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
              failedRows.length,
              " row",
              failedRows.length !== 1 ? "s were" : " was",
              " skipped"
            ] }),
            importedSoFar > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              " (",
              importedSoFar,
              " imported so far)"
            ] }) : null,
            ".",
            " ",
            'Correct the values below and click "Retry skipped rows" to import just these rows.'
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded border border-gray-200 max-h-64 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "text-xs w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 sticky top-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-1 text-left text-gray-500 font-medium", children: "Reading At *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-1 text-left text-gray-500 font-medium", children: "Depth" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-1 text-left text-gray-500 font-medium", children: "Moist %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-1 text-left text-gray-500 font-medium", children: "Temp °C" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-1 text-left text-gray-500 font-medium", children: "EC" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-1 text-left text-gray-500 font-medium", children: "Notes" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: failedRows.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-gray-100 bg-red-50/50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs min-w-36", value: f.values.readingAt, onChange: (e) => setFailedField(i, "readingAt", e.target.value), placeholder: "YYYY-MM-DD HH:MM" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs w-16", value: f.values.depthCm, onChange: (e) => setFailedField(i, "depthCm", e.target.value) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs w-16", value: f.values.moisturePercent, onChange: (e) => setFailedField(i, "moisturePercent", e.target.value) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs w-16", value: f.values.temperatureCelsius, onChange: (e) => setFailedField(i, "temperatureCelsius", e.target.value) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs w-16", value: f.values.ecUsPerCm, onChange: (e) => setFailedField(i, "ecUsPerCm", e.target.value) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-1 py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-7 text-xs min-w-24", value: f.values.notes, onChange: (e) => setFailedField(i, "notes", e.target.value) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "bg-red-50/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-2 pb-1.5 text-red-600", children: f.reason }) })
          ] }, i)) })
        ] }) })
      ] }),
      failedRows.length === 0 && preview.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-medium text-gray-600 mb-1", children: [
          "Preview (first ",
          preview.length,
          " rows)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded border border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "text-xs w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: Object.keys(preview[0]).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-1 text-left text-gray-500 font-medium", children: k }, k)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: preview.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-t border-gray-100", children: Object.values(row).map((v, j) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1 text-gray-700", children: v || "—" }, j)) }, i)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: failedRows.length > 0 ? "Close" : "Cancel" }),
      failedRows.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: retryFailed, disabled: importing, children: [
        importing && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 mr-1.5" }),
        " Retry ",
        failedRows.length,
        " skipped row",
        failedRows.length !== 1 ? "s" : ""
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: doImport, disabled: !preview.length || !!error || importing, children: [
        importing && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 mr-1.5" }),
        " Import Readings"
      ] })
    ] })
  ] }) });
}
function ProbePanel({ probe, farmId, fields }) {
  const [panelTab, setPanelTab] = reactExports.useState("chart");
  const [range, setRange] = reactExports.useState("90");
  const [showAddReading, setShowAddReading] = reactExports.useState(false);
  const [showImport, setShowImport] = reactExports.useState(false);
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const fromDate = /* @__PURE__ */ new Date();
  fromDate.setDate(fromDate.getDate() - parseInt(range, 10));
  const { data, isLoading } = useQuery({
    queryKey: ["soil-readings", probe.id, range],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/soil-sensors/${probe.id}/readings?from=${fromDate.toISOString()}&limit=2000`);
      if (!res.ok) throw new Error("Failed to load readings");
      return res.json();
    }
  });
  const qc = useQueryClient();
  const deleteReading = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/farms/${farmId}/soil-sensors/${probe.id}/readings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["soil-readings", probe.id] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const readings = data?.records ?? [];
  const chartData = readings.map((r) => ({
    t: new Date(r.readingAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    fullDt: fmtDt(r.readingAt),
    moisture: parseNum(r.moisturePercent),
    temp: parseNum(r.temperatureCelsius),
    ec: parseNum(r.ecUsPerCm)
  }));
  const hasMoisture = readings.some((r) => r.moisturePercent !== null);
  const hasTemp = readings.some((r) => r.temperatureCelsius !== null);
  const hasEC = readings.some((r) => r.ecUsPerCm !== null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border-t border-gray-100 px-4 pt-3 pb-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: ["chart", "table", "import"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setPanelTab(t),
          className: `px-3 py-1 rounded text-xs font-medium transition-colors ${panelTab === t ? "bg-white border border-gray-200 text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`,
          children: t === "chart" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "w-3 h-3 inline mr-1" }),
            "Chart"
          ] }) : t === "table" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Table, { className: "w-3 h-3 inline mr-1" }),
            "Readings"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileUp, { className: "w-3 h-3 inline mr-1" }),
            "Import CSV"
          ] })
        },
        t
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        panelTab !== "import" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: range,
            onChange: (e) => setRange(e.target.value),
            className: "text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-green-500",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "30", children: "Last 30 days" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "90", children: "Last 90 days" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "180", children: "Last 6 months" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "365", children: "Last year" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs gap-1", onClick: () => setShowAddReading(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3 h-3" }),
          " Add Reading"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "h-7 text-xs gap-1", onClick: () => setShowImport(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3 h-3" }),
          " Import"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-10 gap-2 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
      " Loading readings…"
    ] }) : readings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center py-10 text-center text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-8 h-8 mb-2 opacity-40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No readings in this period" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-0.5", children: "Add a manual reading or import from CSV" })
    ] }) : panelTab === "chart" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: chartData, margin: { top: 4, right: 16, bottom: 4, left: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "t", tick: { fontSize: 10 }, interval: "preserveStartEnd" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "m", domain: [0, 60], unit: "%", tick: { fontSize: 10 }, width: 38 }),
        hasTemp && /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { yAxisId: "t", orientation: "right", unit: "°C", tick: { fontSize: 10 }, width: 38 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Tooltip,
          {
            labelFormatter: (_label, payload) => payload?.[0]?.payload?.fullDt ?? "",
            formatter: (val, name) => {
              if (name === "Moisture") return [`${val}%`, name];
              if (name === "Temperature") return [`${val}°C`, name];
              if (name === "EC") return [`${val} μS/cm`, name];
              return [String(val), name];
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, {}),
        hasMoisture && /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "m", type: "monotone", dataKey: "moisture", name: "Moisture", stroke: "#16a34a", dot: false, strokeWidth: 2, connectNulls: true }),
        hasTemp && /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "t", type: "monotone", dataKey: "temp", name: "Temperature", stroke: "#ea580c", dot: false, strokeWidth: 1.5, connectNulls: true }),
        hasEC && /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { yAxisId: "m", type: "monotone", dataKey: "ec", name: "EC", stroke: "#7c3aed", dot: false, strokeWidth: 1.5, connectNulls: true, strokeDasharray: "4 2" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mt-1 text-xs text-gray-400 justify-end", children: [
        hasMoisture && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-0.5 bg-green-600 inline-block" }),
          " Moisture (%)"
        ] }),
        hasTemp && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-0.5 bg-orange-500 inline-block" }),
          " Temperature (°C)"
        ] }),
        hasEC && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-0.5 bg-violet-600 inline-block" }),
          " EC (μS/cm)"
        ] })
      ] })
    ] }) : panelTab === "table" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto rounded border border-gray-200 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "text-xs w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-500", children: "Date / Time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium text-gray-500", children: "Depth (cm)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium text-gray-500", children: "Moisture %" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium text-gray-500", children: "Temp °C" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right font-medium text-gray-500", children: "EC μS/cm" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left font-medium text-gray-500", children: "Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: readings.slice().reverse().map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-gray-100 hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-gray-700 whitespace-nowrap", children: fmtDt(r.readingAt) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right text-gray-600", children: r.depthCm ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right font-medium text-green-700", children: r.moisturePercent ? `${parseFloat(r.moisturePercent).toFixed(1)}%` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right text-orange-600", children: r.temperatureCelsius ? `${parseFloat(r.temperatureCelsius).toFixed(1)}°C` : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right text-violet-700", children: r.ecUsPerCm ? parseFloat(r.ecUsPerCm).toFixed(0) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${r.entryMethod === "csv" ? "bg-blue-50 text-blue-700" : r.entryMethod === "api" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"}`, children: r.entryMethod }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setPendingDelete(r.id),
            className: "text-gray-300 hover:text-red-500 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
          }
        ) })
      ] }, r.id)) })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowImport(true), size: "sm", className: "gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileUp, { className: "w-4 h-4" }),
        " Open CSV Import"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-400 mt-2", children: "Import up to 5,000 readings at a time from your data logger export" })
    ] }),
    showAddReading && /* @__PURE__ */ jsxRuntimeExports.jsx(AddReadingDialog, { open: true, probe, farmId, onClose: () => {
      setShowAddReading(false);
      qc.invalidateQueries({ queryKey: ["soil-readings", probe.id] });
    } }),
    showImport && /* @__PURE__ */ jsxRuntimeExports.jsx(CsvImportDialog, { open: true, probe, farmId, onClose: () => setShowImport(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelete !== null,
        title: "Delete Reading",
        message: "Delete this soil moisture reading? This cannot be undone.",
        mutation: deleteReading,
        onConfirm: () => {
          if (pendingDelete !== null) deleteReading.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) });
        },
        onCancel: () => {
          setPendingDelete(null);
          deleteReading.reset();
        },
        confirmLabel: "Delete",
        confirmVariant: "destructive"
      }
    )
  ] });
}
const SOIL_PARAM_META = {
  soil_moisture_1: { label: "Soil Moisture 1", color: "#3b82f6" },
  soil_moisture_2: { label: "Soil Moisture 2", color: "#60a5fa" },
  soil_moisture_3: { label: "Soil Moisture 3", color: "#93c5fd" },
  soil_moisture_4: { label: "Soil Moisture 4", color: "#bfdbfe" },
  soil_temperature_1: { label: "Soil Temp 1", color: "#f97316" },
  soil_temperature_2: { label: "Soil Temp 2", color: "#fb923c" },
  soil_temperature_3: { label: "Soil Temp 3", color: "#fdba74" },
  soil_temperature_4: { label: "Soil Temp 4", color: "#fed7aa" },
  volumetric_water_content: { label: "Vol. Water Content", color: "#06b6d4" },
  soil_temperature: { label: "Soil Temperature", color: "#f97316" },
  electrical_conductivity: { label: "Electrical Conductivity", color: "#8b5cf6" },
  water_potential: { label: "Water Potential", color: "#14b8a6" },
  dielectric_permittivity: { label: "Dielec. Permittivity", color: "#6b7280" }
};
function ApiConnectedSoilSensors({ farmId }) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const [days, setDays] = reactExports.useState("7");
  const [selectedStation, setSelectedStation] = reactExports.useState(null);
  const [selectedParam, setSelectedParam] = usePersistedFilter({ page: "soil-sensors-api", filter: "param", farmId, defaultValue: "" });
  const from = new Date(Date.now() - Number(days) * 864e5).toISOString();
  const { data, isLoading } = useQuery({
    queryKey: ["sensor-readings-soil", farmId, days],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/sensor-readings?category=soil&from=${encodeURIComponent(from)}&limit=2000`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: expanded
  });
  const readings = data?.readings ?? [];
  const stationMap = /* @__PURE__ */ new Map();
  for (const r of readings) {
    if (!stationMap.has(r.stationId)) stationMap.set(r.stationId, { name: r.stationName ?? r.stationId, readings: [] });
    stationMap.get(r.stationId).readings.push(r);
  }
  const stations = Array.from(stationMap.entries());
  reactExports.useEffect(() => {
    if (stations.length > 0 && !selectedStation) setSelectedStation(stations[0][0]);
  }, [stations.length]);
  const stationData = selectedStation ? stationMap.get(selectedStation) : null;
  const availableParams = Array.from(new Set(stationData?.readings.map((r) => r.parameter) ?? []));
  reactExports.useEffect(() => {
    if (availableParams.length > 0 && !selectedParam) {
      const pref = availableParams.find((p) => p === "volumetric_water_content") ?? availableParams.find((p) => p === "soil_moisture_1") ?? availableParams[0];
      setSelectedParam(pref);
    }
  }, [availableParams.join(",")]);
  const latestByParam = /* @__PURE__ */ new Map();
  for (const r of [...stationData?.readings ?? []].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  )) {
    if (!latestByParam.has(r.parameter)) latestByParam.set(r.parameter, r);
  }
  const chartData = (stationData?.readings ?? []).filter((r) => r.parameter === selectedParam).sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()).map((r) => ({
    t: new Date(r.recordedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    v: r.value != null ? Number(r.value) : null
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 border-t border-gray-100 pt-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setExpanded((e) => !e), className: "flex items-center gap-2 w-full text-left mb-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { className: "w-4 h-4 text-green-600" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "API Connected Soil Sensors" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-400 ml-1", children: "(Davis, ZENTRA, FieldClimate, Sencrop)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `w-4 h-4 text-gray-400 ml-auto transition-transform ${expanded ? "rotate-180" : ""}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-3", children: "Readings collected automatically from connected sensor APIs every 30 minutes." }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-gray-400 py-8 justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
      " Loading…"
    ] }) : stations.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-10 text-sm text-gray-400", children: [
      "No soil sensor readings found. Connect a soil sensor integration in",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-gray-600", children: "Farm Settings → Sensor Integrations" }),
      "."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-4", children: [
        stations.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: selectedStation ?? "",
            onChange: (e) => {
              setSelectedStation(e.target.value);
              setSelectedParam("");
            },
            className: "text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500",
            children: stations.map(([id, s]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, children: s.name }, id))
          }
        ),
        stations.length === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: stations[0][1].name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: days,
            onChange: (e) => setDays(e.target.value),
            className: "text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-green-500",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "7", children: "Last 7 days" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "14", children: "Last 14 days" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "30", children: "Last 30 days" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-5", children: availableParams.map((param) => {
        const r = latestByParam.get(param);
        const meta = SOIL_PARAM_META[param];
        const isSelected = selectedParam === param;
        if (!r) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setSelectedParam(param),
            className: `rounded border p-2.5 text-left transition-all text-xs ${isSelected ? "border-green-500 bg-green-50 ring-1 ring-green-400" : "border-gray-200 bg-white hover:border-gray-300"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-gray-500 mb-1 truncate", children: [
                meta?.label ?? param,
                r.depthCm ? ` (${r.depthCm} cm)` : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-semibold text-gray-800", children: [
                Number(r.value).toFixed(1),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-gray-500 ml-0.5", children: r.unit })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-400 mt-0.5", children: new Date(r.recordedAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) })
            ]
          },
          param
        );
      }) }),
      chartData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-600", children: SOIL_PARAM_META[selectedParam]?.label ?? selectedParam }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: selectedParam,
              onChange: (e) => setSelectedParam(e.target.value),
              className: "text-xs border border-gray-200 rounded px-2 py-0.5 bg-white focus:outline-none ml-auto",
              children: availableParams.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p, children: SOIL_PARAM_META[p]?.label ?? p }, p))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: chartData, margin: { top: 2, right: 12, left: 0, bottom: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "t", tick: { fontSize: 9 }, interval: "preserveStartEnd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 9 }, width: 45 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tooltip,
            {
              formatter: (v) => [
                `${v} ${latestByParam.get(selectedParam)?.unit ?? ""}`,
                SOIL_PARAM_META[selectedParam]?.label ?? selectedParam
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Line,
            {
              type: "monotone",
              dataKey: "v",
              stroke: SOIL_PARAM_META[selectedParam]?.color ?? "#3b82f6",
              dot: false,
              strokeWidth: 2,
              connectNulls: true
            }
          )
        ] }) })
      ] })
    ] }) })
  ] });
}
function SoilSensorsTab({ farmId }) {
  const { data: fieldsData } = useQuery({
    queryKey: ["fields", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/fields`);
      if (!res.ok) return { records: [] };
      return res.json();
    }
  });
  const fields = fieldsData?.records ?? [];
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = reactExports.useState(false);
  const [editProbe, setEditProbe] = reactExports.useState(null);
  const [expanded, setExpanded] = reactExports.useState(/* @__PURE__ */ new Set());
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["soil-sensors", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/soil-sensors`);
      if (!res.ok) throw new Error("Failed to load sensor probes");
      return res.json();
    }
  });
  const deleteProbe = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`/api/farms/${farmId}/soil-sensors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["soil-sensors", farmId] });
      toast({ title: "Probe removed" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const toggleExpand = (id) => setExpanded((s) => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const probes = data?.records ?? [];
  const activeCount = probes.filter((p) => p.isActive).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: pendingDelete !== null,
        title: "Delete Probe",
        message: pendingDelete ? `Delete "${pendingDelete.name}" and all its readings? This cannot be undone.` : "",
        mutation: deleteProbe,
        onConfirm: () => {
          if (pendingDelete) deleteProbe.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        },
        onCancel: () => {
          setPendingDelete(null);
          deleteProbe.reset();
        },
        confirmLabel: "Delete",
        confirmVariant: "destructive"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-semibold text-gray-800", children: "Continuous Soil Monitoring" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: probes.length === 0 ? "Register sensor probes and log readings manually or import from your data logger CSV." : `${activeCount} active probe${activeCount !== 1 ? "s" : ""} · ${probes.length} registered` })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => setShowAdd(true), size: "sm", className: "gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        " Add Probe"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center py-16 gap-2 text-gray-400", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin" }),
      " Loading probes…"
    ] }) : probes.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptySensors, { onAdd: () => setShowAdd(true) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: probes.map((probe) => {
      const field = fields.find((f) => f.id === probe.fieldId);
      const isExpanded = expanded.has(probe.id);
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-2.5 h-2.5 rounded-full shrink-0 ${probe.isActive ? "bg-green-500" : "bg-gray-300"}`, title: probe.isActive ? "Active" : "Inactive" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm text-gray-800", children: probe.name }),
              probe.manufacturer && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full", children: probe.manufacturer }),
              probe.model && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 font-mono", children: probe.model }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full", children: SENSOR_TYPES[probe.sensorType] ?? probe.sensorType })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 flex-wrap", children: [
              field && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 flex items-center gap-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3 h-3" }),
                field.name
              ] }),
              probe.depthsCm && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 flex items-center gap-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-3 h-3" }),
                probe.depthsCm,
                " cm"
              ] }),
              probe.installDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 flex items-center gap-0.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3 h-3" }),
                "Installed ",
                fmt(probe.installDate)
              ] }),
              probe.latitude && probe.longitude && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "a",
                {
                  href: `https://www.google.com/maps?q=${probe.latitude},${probe.longitude}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-xs text-blue-600 hover:underline flex items-center gap-0.5",
                  onClick: (e) => e.stopPropagation(),
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3 h-3" }),
                    "GPS"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditProbe(probe), className: "p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700", title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setPendingDelete(probe),
                className: "p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600",
                title: "Delete",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => toggleExpand(probe.id),
                className: "p-1.5 rounded hover:bg-gray-100 text-gray-500 ml-1",
                title: isExpanded ? "Collapse" : "View readings",
                children: isExpanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" })
              }
            )
          ] })
        ] }),
        isExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx(ProbePanel, { probe, farmId, fields })
      ] }, probe.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ApiConnectedSoilSensors, { farmId }),
    showAdd && /* @__PURE__ */ jsxRuntimeExports.jsx(ProbeDialog, { open: true, farmId, fields, onClose: () => setShowAdd(false) }),
    editProbe && /* @__PURE__ */ jsxRuntimeExports.jsx(ProbeDialog, { open: true, probe: editProbe, farmId, fields, onClose: () => setEditProbe(null) })
  ] });
}
function destroyMap(map) {
  if (!map) return;
  try {
    map.off();
    map.remove();
  } catch {
  }
}
function SoilLocationPicker({ lat, lng, locationDescription, onLatLngChange, onDescriptionChange }) {
  const mapRef = reactExports.useRef(null);
  const leafletMapRef = reactExports.useRef(null);
  const markerRef = reactExports.useRef(null);
  const [leafletReady, setLeafletReady] = reactExports.useState(false);
  const [expanded, setExpanded] = reactExports.useState(!!(lat && lng));
  reactExports.useEffect(() => {
    __vitePreload(() => import("./leaflet-src-Da-Npv1V.js").then((n) => n.l), true ? __vite__mapDeps([0,1,2]) : void 0).then((L) => {
      if (!("_leafletLoaded" in window)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        window["_leafletLoaded"] = true;
      }
      window["_L"] = L;
      setLeafletReady(true);
    });
    return () => {
      destroyMap(leafletMapRef.current);
      leafletMapRef.current = null;
      markerRef.current = null;
    };
  }, []);
  reactExports.useEffect(() => {
    if (!leafletReady || !expanded || !mapRef.current) return;
    const L = window["_L"];
    if (leafletMapRef.current) {
      leafletMapRef.current.invalidateSize();
      return;
    }
    const initLat = lat ? parseFloat(lat) : 52.4;
    const initLng = lng ? parseFloat(lng) : -1.5;
    const initZoom = lat && lng ? 16 : 6;
    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([initLat, initLng], initZoom);
    map.scrollWheelZoom.enable();
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics", maxZoom: 20 }
    ).addTo(map);
    leafletMapRef.current = map;
    const pinHtml = `<div style="width:28px;height:28px;display:flex;align-items:center;justify-content:center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#dc2626" width="28" height="28">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>`;
    const icon = L.divIcon({ html: pinHtml, className: "", iconSize: [28, 28], iconAnchor: [14, 28] });
    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        markerRef.current = L.marker([parsedLat, parsedLng], { icon, draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current.getLatLng();
          onLatLngChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
        });
      }
    }
    map.on("click", (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        markerRef.current = L.marker([clickLat, clickLng], { icon, draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current.getLatLng();
          onLatLngChange(pos.lat.toFixed(6), pos.lng.toFixed(6));
        });
      }
      onLatLngChange(clickLat.toFixed(6), clickLng.toFixed(6));
    });
  }, [leafletReady, expanded]);
  reactExports.useEffect(() => {
    if (!markerRef.current || !lat || !lng) return;
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
      markerRef.current.setLatLng([parsedLat, parsedLng]);
    }
  }, [lat, lng]);
  function handleClear() {
    if (markerRef.current && leafletMapRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    onLatLngChange("", "");
  }
  function handleToggle() {
    const next = !expanded;
    setExpanded(next);
    if (next) {
      setTimeout(() => {
        leafletMapRef.current?.invalidateSize();
      }, 100);
    } else {
      destroyMap(leafletMapRef.current);
      leafletMapRef.current = null;
      markerRef.current = null;
    }
  }
  const hasPin = !!(lat && lng);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3.5 h-3.5 text-red-500" }),
        "Sample Point Location"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: handleToggle,
          className: "text-xs text-primary hover:underline",
          children: expanded ? "Hide map" : hasPin ? "Edit on map" : "Pick on map"
        }
      )
    ] }),
    expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border overflow-hidden", style: { position: "relative" }, children: [
      !leafletReady && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-muted flex items-center justify-content-center z-10 flex items-center justify-center", style: { height: 260 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin text-muted-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: mapRef, style: { height: 260, width: "100%" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 left-2 right-2 z-[1000] pointer-events-none flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-black/60 text-white text-xs rounded-full px-3 py-1", children: hasPin ? "Drag pin to adjust · Click to move" : "Click map to place sample point" }) })
    ] }),
    hasPin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground mb-0.5 block", children: "Latitude" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: lat,
              onChange: (e) => onLatLngChange(e.target.value, lng),
              className: "w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-mono",
              placeholder: "51.500000"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground mb-0.5 block", children: "Longitude" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: lng,
              onChange: (e) => onLatLngChange(lat, e.target.value),
              className: "w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-mono",
              placeholder: "-1.500000"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "ghost", size: "sm", className: "mt-4 text-muted-foreground hover:text-destructive", onClick: handleClear, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" }) })
    ] }),
    !hasPin && !expanded && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: 'No GPS point recorded. Click "Pick on map" to mark the exact sample location within the field.' }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs text-muted-foreground mb-0.5 block", children: "Location description (optional)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: locationDescription,
          onChange: (e) => onDescriptionChange(e.target.value),
          className: "w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-sm",
          placeholder: "e.g. NE corner near hedge, 50m from gate"
        }
      )
    ] })
  ] });
}
function formatDate(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return val;
  }
}
function formatDateLong(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return val;
  }
}
const COMMON_NUTRIENTS = ["pH", "Phosphorus (P)", "Potassium (K)", "Magnesium (Mg)", "Nitrogen (N)", "Sulphur (SO3)", "Organic Matter (OM)", "Calcium (Ca)", "Sodium (Na)", "Boron (B)"];
const EMPTY_TEST = { fieldId: "", sampleDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), laboratory: "", sampleReference: "", sampleDepthCm: "", sampledBy: "", notes: "" };
const EMPTY_RESULT = { nutrient: "", value: "", unit: "mg/l", index: "", status: "" };
const STATUS_CONFIG = {
  sampled: { label: "Sampled", color: "bg-blue-50 text-blue-700 border-blue-200", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }) },
  sent_to_lab: { label: "Sent to Lab", color: "bg-amber-50 text-amber-700 border-amber-200", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3" }) },
  results_received: { label: "Results Received", color: "bg-green-50 text-green-700 border-green-200", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3 h-3" }) },
  archived: { label: "Archived", color: "bg-gray-100 text-gray-500 border-gray-200", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-3 h-3" }) }
};
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.sampled;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`, children: [
    cfg.icon,
    cfg.label
  ] });
}
function resultStatusBadge(status) {
  if (!status) return null;
  const s = status.toLowerCase();
  const cls = s === "low" ? "bg-red-100 text-red-700 border-red-200" : s === "high" ? "bg-blue-100 text-blue-700 border-blue-200" : s === "adequate" || s === "optimal" ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200";
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`, children: status });
}
const STATUS_FILTER_TABS = [
  { key: "all", label: "All Samples" },
  { key: "sampled", label: "Sampled" },
  { key: "sent_to_lab", label: "Sent to Lab" },
  { key: "results_received", label: "Results Received" },
  { key: "archived", label: "Archived" }
];
function SoilFieldHistoryDialog({ field, tests, onClose }) {
  const [yearFilter, setYearFilter] = React.useState("all");
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const fieldTests = tests.filter((t) => t.fieldId === field.id);
  const sorted = [...fieldTests].sort((a, b) => new Date(b.sampleDate ?? 0).getTime() - new Date(a.sampleDate ?? 0).getTime());
  const filtered = yearFilter === "all" ? sorted : sorted.filter((t) => t.sampleDate && new Date(t.sampleDate).getFullYear() === yearFilter);
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const STATUS_LABELS = {
    sampled: { text: "Sampled", color: "#92400e", bg: "#fffbeb" },
    sent_to_lab: { text: "Sent to Lab", color: "#1d4ed8", bg: "#eff6ff" },
    results_received: { text: "Results In", color: "#15803d", bg: "#f0fdf4" },
    archived: { text: "Archived", color: "#6b7280", bg: "#f3f4f6" }
  };
  function handlePrint() {
    const rows = filtered.map((t) => `<tr><td>${fmtDate(t.sampleDate)}</td><td>${t.sampleReference || "—"}</td><td>${t.laboratory || "—"}</td><td>${t.sampleDepthCm ? `${t.sampleDepthCm} cm` : "—"}</td><td>${t.sampledBy || "—"}</td><td>${(STATUS_LABELS[t.status ?? "sampled"] ?? {}).text ?? t.status}</td><td>${t.notes || ""}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Soil Test History — ${field.name}</title><style>body{font-family:Arial,sans-serif;font-size:10pt;margin:20mm}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#d97706;color:#fff;padding:5px 7px;text-align:left;font-size:8.5pt}td{padding:4px 7px;border-bottom:1px solid #e5e7eb;font-size:9pt;vertical-align:top}tr:nth-child(even) td{background:#f9fafb}.footer{margin-top:18px;font-size:8pt;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:10mm}}</style></head><body><h1 style="font-size:14pt">Soil Test History — ${field.name}</h1><p style="font-size:9pt;color:#555">Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")} · ${filtered.length} test${filtered.length !== 1 ? "s" : ""}${yearFilter !== "all" ? ` (${yearFilter})` : ""}</p><table><thead><tr><th>Sample Date</th><th>Reference</th><th>Laboratory</th><th>Depth</th><th>Sampled By</th><th>Status</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table><p class="footer">NVZ regulations require soil test records to be retained for at least 5 years.</p></body></html>`);
      w.document.close();
      w.focus();
      w.print();
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl max-h-[85vh] flex flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4 text-amber-600" }),
      "Soil Test History — ",
      field.name
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap border-b pb-3", children: [
      ["all", ...recentYears].map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setYearFilter(y), style: { padding: "3px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: yearFilter === y ? "1.5px solid #d97706" : "1.5px solid #e5e7eb", background: yearFilter === y ? "#fffbeb" : "#fff", color: yearFilter === y ? "#92400e" : "#6b7280" }, children: y === "all" ? "All years" : y }, y)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-auto text-xs text-muted-foreground", children: [
        filtered.length,
        " test",
        filtered.length !== 1 ? "s" : ""
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto min-h-0", children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-14 text-muted-foreground gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-9 h-9 text-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm", children: [
        "No soil tests",
        yearFilter !== "all" ? ` in ${yearFilter}` : "",
        " for ",
        field.name
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y", children: filtered.map((t) => {
      const sl = STATUS_LABELS[t.status ?? "sampled"] ?? STATUS_LABELS.sampled;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-3 px-1 flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 w-24 text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-800 leading-tight", children: t.sampleDate ? new Date(t.sampleDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: t.sampleDate ? new Date(t.sampleDate).getFullYear() : "" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            t.sampleReference && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs bg-black/5 px-1.5 py-0.5 rounded", children: t.sampleReference }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: sl.bg, color: sl.color }, children: sl.text })
          ] }),
          t.laboratory && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-700", children: [
            "Lab: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: t.laboratory })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 text-xs text-muted-foreground flex-wrap", children: [
            t.sampleDepthCm && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Depth: ",
              t.sampleDepthCm,
              " cm"
            ] }),
            t.sampledBy && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Sampled by: ",
              t.sampledBy
            ] })
          ] }),
          t.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic", children: t.notes })
        ] })
      ] }, t.id);
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "border-t pt-3 flex-row items-center gap-2 sm:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground flex-1", children: [
        "NVZ regulations: retain soil test records for at least ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "5 years" }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: handlePrint, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
          "Print / Export"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: onClose, children: "Close" })
      ] })
    ] })
  ] }) });
}
function RegisterTab({ farmId }) {
  const qc = useQueryClient();
  const { toast: toast2 } = useToast();
  const [search, setSearch] = reactExports.useState("");
  const [cropYear, setCropYear] = usePersistedNumberFilter({ page: "soil-tests-register", filter: "crop-year", farmId, defaultValue: currentCropYear() });
  const [statusFilter, setStatusFilter] = usePersistedFilter({ page: "soil-tests-register", filter: "status", farmId, defaultValue: "all" });
  const [historyField, setHistoryField] = reactExports.useState(null);
  const [expanded, setExpanded] = reactExports.useState(/* @__PURE__ */ new Set());
  const [addTestOpen, setAddTestOpen] = reactExports.useState(false);
  const [editTest, setEditTest] = reactExports.useState(null);
  const [deleteTestId, setDeleteTestId] = reactExports.useState(null);
  const [testForm, setTestForm] = reactExports.useState(EMPTY_TEST);
  const [labSupplierId, setLabSupplierId] = reactExports.useState(null);
  const [sampleLat, setSampleLat] = reactExports.useState("");
  const [sampleLng, setSampleLng] = reactExports.useState("");
  const [sampleLocationDesc, setSampleLocationDesc] = reactExports.useState("");
  const [addResultFor, setAddResultFor] = reactExports.useState(null);
  const [resultForm, setResultForm] = reactExports.useState(EMPTY_RESULT);
  const [deleteResultInfo, setDeleteResultInfo] = reactExports.useState(null);
  const [samplerType, setSamplerType] = reactExports.useState("external");
  const [samplerOrganisation, setSamplerOrganisation] = reactExports.useState("");
  const [sampledByStaffId, setSampledByStaffId] = reactExports.useState(null);
  const fieldsQ = useQuery({
    queryKey: ["fields-soil", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json())
  });
  const testsQ = useQuery({
    queryKey: ["soil-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/soil-tests`).then((r) => r.json())
  });
  const staffQ = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then((r) => r.json())
  });
  const activeStaff = (staffQ.data?.members ?? []).filter((m) => m.isActive);
  const fields = fieldsQ.data?.records ?? [];
  const allTests = testsQ.data?.records ?? [];
  const expandedIds = Array.from(expanded);
  const detailResults = useQueries({
    queries: expandedIds.map((testId) => ({
      queryKey: ["soil-test-detail", farmId, testId],
      queryFn: () => fetch(`/api/farms/${farmId}/soil-tests/${testId}`).then((r) => r.json()),
      enabled: true
    }))
  });
  const detailMap = {};
  expandedIds.forEach((testId, i) => {
    const d = detailResults[i]?.data?.record;
    if (d) detailMap[testId] = d;
  });
  const detailLoadingMap = {};
  expandedIds.forEach((testId, i) => {
    detailLoadingMap[testId] = detailResults[i]?.isLoading ?? false;
  });
  const createTest = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/soil-tests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["soil-tests", farmId] });
      setAddTestOpen(false);
      setEditTest(null);
      setTestForm(EMPTY_TEST);
      setSampleLat("");
      setSampleLng("");
      setSampleLocationDesc("");
      resetSamplerState();
      if (data?.record?.id) setExpanded((prev) => /* @__PURE__ */ new Set([...prev, data.record.id]));
    },
    onError: () => toast2({ title: "Save failed", variant: "destructive" })
  });
  const updateTest = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/soil-tests/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["soil-tests", farmId] });
      setEditTest(null);
      setTestForm(EMPTY_TEST);
      setAddTestOpen(false);
      setSampleLat("");
      setSampleLng("");
      setSampleLocationDesc("");
      resetSamplerState();
    },
    onError: () => toast2({ title: "Save failed", variant: "destructive" })
  });
  const deleteTest = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/soil-tests/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["soil-tests", farmId] });
      setDeleteTestId(null);
      setExpanded((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    },
    onError: () => toast2({ title: "Delete failed", variant: "destructive" })
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => fetch(`/api/farms/${farmId}/soil-tests/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["soil-tests", farmId] });
    },
    onError: () => toast2({ title: "Update failed", variant: "destructive" })
  });
  const addResult = useMutation({
    mutationFn: ({ testId, body }) => fetch(`/api/farms/${farmId}/soil-tests/${testId}/results`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }).then((r) => r.json()),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["soil-test-detail", farmId, vars.testId] });
      setAddResultFor(null);
      setResultForm(EMPTY_RESULT);
    },
    onError: () => toast2({ title: "Save failed", variant: "destructive" })
  });
  const deleteResult = useMutation({
    mutationFn: ({ testId, resultId }) => fetch(`/api/farms/${farmId}/soil-tests/${testId}/results/${resultId}`, { method: "DELETE" }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["soil-test-detail", farmId, vars.testId] });
      setDeleteResultInfo(null);
    },
    onError: () => toast2({ title: "Delete failed", variant: "destructive" })
  });
  const filtered = allTests.filter((t) => {
    if (!isInCropYear(t.sampleDate, cropYear)) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (!search) return true;
    const fieldName = fields.find((f) => f.id === t.fieldId)?.name ?? "";
    return fieldName.toLowerCase().includes(search.toLowerCase()) || t.laboratory?.toLowerCase().includes(search.toLowerCase()) || t.sampleReference?.toLowerCase().includes(search.toLowerCase()) || t.sampledBy?.toLowerCase().includes(search.toLowerCase());
  });
  const yearTests = allTests.filter((t) => isInCropYear(t.sampleDate, cropYear));
  const counts = { all: yearTests.length };
  for (const t of yearTests) {
    counts[t.status] = (counts[t.status] ?? 0) + 1;
  }
  function resetSamplerState() {
    setSamplerType("external");
    setSamplerOrganisation("");
    setSampledByStaffId(null);
  }
  function openAddTest() {
    setEditTest(null);
    setTestForm(EMPTY_TEST);
    setLabSupplierId(null);
    setSampleLat("");
    setSampleLng("");
    setSampleLocationDesc("");
    resetSamplerState();
    setAddTestOpen(true);
  }
  function openEditTest(t) {
    setEditTest(t);
    setTestForm({ fieldId: String(t.fieldId), sampleDate: t.sampleDate?.slice(0, 10) ?? "", laboratory: t.laboratory ?? "", sampleReference: t.sampleReference ?? "", sampleDepthCm: String(t.sampleDepthCm ?? ""), sampledBy: t.sampledBy ?? "", notes: t.notes ?? "" });
    setLabSupplierId(t.labSupplierId ?? null);
    setSampleLat(t.latitude ?? "");
    setSampleLng(t.longitude ?? "");
    setSampleLocationDesc(t.locationDescription ?? "");
    const type = t.samplerType === "staff" ? "staff" : "external";
    setSamplerType(type);
    setSamplerOrganisation(t.samplerOrganisation ?? "");
    if (type === "staff") {
      const matched = activeStaff.find((s) => `${s.firstName} ${s.lastName}` === t.sampledBy);
      setSampledByStaffId(matched?.id ?? null);
    } else {
      setSampledByStaffId(null);
    }
    setAddTestOpen(true);
  }
  function handleTestSubmit(e) {
    e.preventDefault();
    let resolvedName = null;
    let resolvedOrg = null;
    if (samplerType === "staff") {
      const staff = activeStaff.find((s) => s.id === sampledByStaffId);
      resolvedName = staff ? `${staff.firstName} ${staff.lastName}` : null;
      resolvedOrg = null;
    } else {
      resolvedName = testForm.sampledBy || null;
      resolvedOrg = samplerOrganisation || null;
    }
    const body = {
      ...testForm,
      fieldId: Number(testForm.fieldId),
      sampleDate: new Date(testForm.sampleDate).toISOString(),
      sampleDepthCm: testForm.sampleDepthCm ? Number(testForm.sampleDepthCm) : null,
      sampledBy: resolvedName,
      samplerType,
      samplerOrganisation: resolvedOrg,
      sampleReference: testForm.sampleReference || null,
      labSupplierId: labSupplierId ?? null,
      latitude: sampleLat || null,
      longitude: sampleLng || null,
      locationDescription: sampleLocationDesc || null
    };
    if (editTest) {
      updateTest.mutate({ id: editTest.id, body });
    } else {
      createTest.mutate(body);
    }
  }
  function handleResultSubmit(e) {
    e.preventDefault();
    if (!addResultFor) return;
    const body = { ...resultForm, value: resultForm.value || null, index: resultForm.index || null, status: resultForm.status || null };
    addResult.mutate({ testId: addResultFor, body });
  }
  function toggleExpand(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  const NEXT_STATUS = {
    sampled: { status: "sent_to_lab", label: "Mark as Sent to Lab" },
    sent_to_lab: { status: "results_received", label: "Mark Results Received" },
    results_received: null,
    archived: null
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    historyField && /* @__PURE__ */ jsxRuntimeExports.jsx(SoilFieldHistoryDialog, { field: historyField, tests: allTests, onClose: () => setHistoryField(null) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mb-5", children: STATUS_FILTER_TABS.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setStatusFilter(tab.key),
        className: `px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${statusFilter === tab.key ? "bg-primary text-white border-primary" : "bg-white text-foreground/60 border-border hover:border-primary/40 hover:text-foreground"}`,
        children: [
          tab.label,
          counts[tab.key] != null && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${statusFilter === tab.key ? "bg-white/20" : "bg-black/5"}`, children: counts[tab.key] })
        ]
      },
      tab.key
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-80", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search by field, lab, reference, sampler...", className: "pl-9 bg-white", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: openAddTest, className: "gap-2 shrink-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
        " Register Sample"
      ] })
    ] }),
    testsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 text-foreground/50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto mb-2" }),
      "Loading..."
    ] }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "w-8 h-8 text-primary/40" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-foreground/80 mb-1", children: "No samples in register" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/50 text-sm", children: search || statusFilter !== "all" ? "No samples match your filter." : "Register your first soil sample to begin tracking. Samples taken on the mobile app will appear here automatically after sync." })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.map((test) => {
      const fieldName = fields.find((f) => f.id === test.fieldId)?.name ?? `Field #${test.fieldId}`;
      const isExp = expanded.has(test.id);
      const detail = detailMap[test.id];
      const detailLoading = detailLoadingMap[test.id] ?? false;
      const nextStatus = NEXT_STATUS[test.status ?? "sampled"];
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-4 flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-5 h-5 text-amber-600" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm text-foreground", children: fieldName }),
                test.sampleReference && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono bg-black/5 px-1.5 py-0.5 rounded", children: test.sampleReference }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: test.status ?? "sampled" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 mt-0.5", children: [
                formatDate(test.sampleDate),
                test.laboratory && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  " · ",
                  test.laboratory
                ] }),
                test.sampleDepthCm && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  " · ",
                  test.sampleDepthCm,
                  "cm depth"
                ] }),
                test.sampledBy && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  " · Sampled by ",
                  test.sampledBy
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "w-4 h-4" }) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-52", children: [
                nextStatus && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => updateStatus.mutate({ id: test.id, status: nextStatus.status }), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 mr-2 text-primary" }),
                  nextStatus.label
                ] }),
                test.status !== "archived" && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => updateStatus.mutate({ id: test.id, status: "archived" }), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-4 h-4 mr-2 text-foreground/40" }),
                  "Archive"
                ] }),
                test.status === "archived" && /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => updateStatus.mutate({ id: test.id, status: "sampled" }), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 mr-2 text-blue-500" }),
                  "Restore to Sampled"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => test.fieldId != null && setHistoryField({ id: test.fieldId, name: fieldName }), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(History, { className: "w-4 h-4 mr-2 text-amber-600" }),
                  "Field Test History"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => openEditTest(test), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4 mr-2" }),
                  "Edit Details"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setDeleteTestId(test.id), className: "text-red-600 focus:text-red-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4 mr-2" }),
                  "Delete"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleExpand(test.id), className: "p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-foreground", children: isExp ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" }) })
          ] })
        ] }),
        isExp && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border/50 px-5 py-4 bg-muted/20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4 text-xs text-foreground/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground/70", children: "Timeline:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Sampled ",
              formatDate(test.sampleDate)
            ] }),
            test.sentToLabDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Sent to lab ",
                formatDate(test.sentToLabDate)
              ] })
            ] }),
            test.resultsReceivedDate && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Results received ",
                formatDate(test.resultsReceivedDate)
              ] })
            ] })
          ] }),
          test.latitude && test.longitude && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4 text-xs text-foreground/60 bg-green-50 border border-green-200 rounded-lg px-3 py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-3.5 h-3.5 text-green-600 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-green-800", children: [
              parseFloat(test.latitude).toFixed(6),
              ", ",
              parseFloat(test.longitude).toFixed(6)
            ] }),
            test.locationDescription && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-green-700 before:content-['·'] before:mx-1.5", children: test.locationDescription }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: `https://maps.google.com/?q=${test.latitude},${test.longitude}`,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "ml-auto text-primary hover:underline whitespace-nowrap",
                children: "View on map ↗"
              }
            )
          ] }),
          detailLoading && !detail ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-4 text-foreground/40 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mx-auto mb-1" }),
            "Loading results..."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            detail?.results && detail.results.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider", children: "Nutrient" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider", children: "Value" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider", children: "Unit" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider", children: "AHDB Index" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-bold text-foreground/50 uppercase tracking-wider", children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: detail.results.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30 hover:bg-black/[0.02]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 font-medium text-foreground", children: r.nutrient }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 text-right font-mono font-semibold text-foreground/80", children: r.value ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 text-foreground/60", children: r.unit ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 font-mono text-foreground/70", children: r.index ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: resultStatusBadge(r.status) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteResultInfo({ testId: test.id, resultId: r.id }), className: "p-1 rounded hover:bg-red-50 text-foreground/30 hover:text-red-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) }) })
              ] }, r.id)) })
            ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/40 italic mb-4", children: test.status === "sampled" || test.status === "sent_to_lab" ? "No lab results yet — add results when the lab report arrives." : "No nutrient results recorded for this sample." }),
            addResultFor === test.id ? /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleResultSubmit, className: "border border-border/50 rounded-xl p-4 bg-white space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-wider text-foreground/50 mb-2", children: "Add Lab Result" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: [
                    "Nutrient ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "select",
                      {
                        className: "flex-1 h-8 rounded-md border border-input bg-background px-2 py-1 text-xs",
                        value: COMMON_NUTRIENTS.includes(resultForm.nutrient) ? resultForm.nutrient : "",
                        onChange: (e) => e.target.value && setResultForm((f) => ({ ...f, nutrient: e.target.value })),
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select..." }),
                          COMMON_NUTRIENTS.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: n, children: n }, n))
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs w-32", placeholder: "or type...", value: !COMMON_NUTRIENTS.includes(resultForm.nutrient) ? resultForm.nutrient : "", onChange: (e) => setResultForm((f) => ({ ...f, nutrient: e.target.value })) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: "Value" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", type: "number", step: "0.01", placeholder: "e.g. 6.5", value: resultForm.value, onChange: (e) => setResultForm((f) => ({ ...f, value: e.target.value })) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: "Unit" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs", value: resultForm.unit, onChange: (e) => setResultForm((f) => ({ ...f, unit: e.target.value })), children: ["mg/l", "kg/ha", "%", "meq/100g", "ppm", "—"].map((u) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: u, children: u }, u)) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: "AHDB Index" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs", value: resultForm.index, onChange: (e) => setResultForm((f) => ({ ...f, index: e.target.value })), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "—" }),
                    ["0", "0-", "1", "2-", "2+", "3", "4"].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: i, children: i }, i))
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: "Status" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs", value: resultForm.status, onChange: (e) => setResultForm((f) => ({ ...f, status: e.target.value })), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "—" }),
                    ["Low", "Adequate", "Optimal", "High", "Excessive"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s))
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1 justify-end", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", size: "sm", variant: "outline", onClick: () => {
                  setAddResultFor(null);
                  setResultForm(EMPTY_RESULT);
                }, children: "Cancel" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", size: "sm", disabled: !resultForm.nutrient || addResult.isPending, children: [
                  addResult.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin mr-1" }),
                  " Add Result"
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "gap-1.5", onClick: () => {
              setAddResultFor(test.id);
              setResultForm(EMPTY_RESULT);
            }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" }),
              " Add Lab Result"
            ] }),
            test.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 italic mt-3 border-t border-border/30 pt-3", children: [
              "Notes: ",
              test.notes
            ] })
          ] })
        ] })
      ] }, test.id);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addTestOpen, onOpenChange: (o) => {
      if (!o) {
        setAddTestOpen(false);
        setEditTest(null);
        setTestForm(EMPTY_TEST);
        setSampleLat("");
        setSampleLng("");
        setSampleLocationDesc("");
        createTest.reset();
        updateTest.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { className: "w-5 h-5 text-amber-600" }),
          editTest ? "Edit Sample" : "Register Soil Sample"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: editTest ? "Update the sample details." : "Register a new soil sample. A reference will be auto-generated if left blank. Lab results can be added once the report arrives." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleTestSubmit, className: "space-y-4 pt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
            "Field ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50", value: testForm.fieldId, onChange: (e) => setTestForm((f) => ({ ...f, fieldId: e.target.value })), required: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select field..." }),
            fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: f.id, children: [
              f.name,
              f.fieldReference ? ` (${f.fieldReference})` : ""
            ] }, f.id))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: [
              "Sample Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: testForm.sampleDate, onChange: (e) => setTestForm((f) => ({ ...f, sampleDate: e.target.value })), required: true })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Depth (cm)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", max: "200", placeholder: "e.g. 15", value: testForm.sampleDepthCm, onChange: (e) => setTestForm((f) => ({ ...f, sampleDepthCm: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Sample Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Auto-generated if blank", value: testForm.sampleReference, onChange: (e) => setTestForm((f) => ({ ...f, sampleReference: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-2 block", children: "Sampled By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex rounded-md border border-border overflow-hidden mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setSamplerType("staff");
                  setSampledByStaffId(null);
                },
                className: `flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${samplerType === "staff" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5" }),
                  "Farm staff"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  setSamplerType("external");
                  setSampledByStaffId(null);
                },
                className: `flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors border-l border-border ${samplerType === "external" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:bg-muted"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "w-3.5 h-3.5" }),
                  "External sampler"
                ]
              }
            )
          ] }),
          samplerType === "staff" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              className: "w-full border border-border rounded-md px-3 py-2 text-sm bg-background",
              value: sampledByStaffId ?? "",
              onChange: (e) => setSampledByStaffId(e.target.value ? Number(e.target.value) : null),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select staff member…" }),
                activeStaff.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: s.id, children: [
                  s.firstName,
                  " ",
                  s.lastName
                ] }, s.id))
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                placeholder: "Sampler name",
                value: testForm.sampledBy,
                onChange: (e) => setTestForm((f) => ({ ...f, sampledBy: e.target.value }))
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  className: "pl-8",
                  placeholder: "Organisation (e.g. lab name, consultancy)",
                  value: samplerOrganisation,
                  onChange: (e) => setSamplerOrganisation(e.target.value)
                }
              )
            ] }),
            testForm.laboratory && !samplerOrganisation && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                className: "text-xs text-primary hover:underline",
                onClick: () => setSamplerOrganisation(testForm.laboratory),
                children: [
                  "Use lab name: ",
                  testForm.laboratory
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            LabSelector,
            {
              farmId,
              value: labSupplierId,
              labName: testForm.laboratory || null,
              onChange: (id, name) => {
                setLabSupplierId(id);
                setTestForm((f) => ({ ...f, laboratory: name ?? "" }));
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-medium text-foreground/70 mb-1 block", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Any additional notes", value: testForm.notes, onChange: (e) => setTestForm((f) => ({ ...f, notes: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            SoilLocationPicker,
            {
              lat: sampleLat,
              lng: sampleLng,
              locationDescription: sampleLocationDesc,
              onLatLngChange: (lat, lng) => {
                setSampleLat(lat);
                setSampleLng(lng);
              },
              onDescriptionChange: setSampleLocationDesc
            }
          ) })
        ] }),
        editTest && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "soil_test", recordId: editTest.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: editTest ? updateTest : createTest, message: "Failed to save — your entries are still here." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: () => {
            setAddTestOpen(false);
            setEditTest(null);
            setTestForm(EMPTY_TEST);
          }, children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "submit", disabled: createTest.isPending || updateTest.isPending, children: [
            (createTest.isPending || updateTest.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }),
            editTest ? "Update Sample" : "Register Sample"
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteTestId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteTestId(null);
        deleteTest.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Soil Sample" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/70 text-sm", children: "This will permanently delete this sample and all its lab results from the register. Cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteTest, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteTestId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteTestId && deleteTest.mutate(deleteTestId), disabled: deleteTest.isPending, children: [
          deleteTest.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          " Delete"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteResultInfo !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteResultInfo(null);
        deleteResult.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Lab Result" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-foreground/70 text-sm", children: "Remove this nutrient reading from the sample record?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteResult, message: "Failed to remove — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteResultInfo(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "destructive", onClick: () => deleteResultInfo && deleteResult.mutate(deleteResultInfo), disabled: deleteResult.isPending, children: [
          deleteResult.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }),
          " Remove"
        ] })
      ] })
    ] }) })
  ] });
}
function PrintTab({ farmId }) {
  const [printYear, setPrintYear] = usePersistedFilter({ page: "soil-tests-print", filter: "year", farmId, defaultValue: "all" });
  const [printStatus, setPrintStatus] = usePersistedFilter({ page: "soil-tests-print", filter: "status", farmId, defaultValue: "all" });
  const fieldsQ = useQuery({ queryKey: ["fields-soil", farmId], queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()) });
  const testsQ = useQuery({ queryKey: ["soil-tests", farmId], queryFn: () => fetch(`/api/farms/${farmId}/soil-tests`).then((r) => r.json()) });
  const farmQ = useQuery({ queryKey: ["farm", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()) });
  const fields = fieldsQ.data?.records ?? [];
  const allTests = testsQ.data?.records ?? [];
  const farm = farmQ.data?.record;
  const years = [...new Set(allTests.map((t) => new Date(t.sampleDate).getFullYear()))].sort((a, b) => b - a);
  const testDetailResults = useQueries({
    queries: allTests.map((test) => ({
      queryKey: ["soil-test-detail", farmId, test.id],
      queryFn: () => fetch(`/api/farms/${farmId}/soil-tests/${test.id}`).then((r) => r.json())
    }))
  });
  const testsWithResults = allTests.map((test, i) => ({ ...test, results: testDetailResults[i]?.data?.record?.results ?? [] }));
  const filteredTests = testsWithResults.filter((t) => printYear === "all" || String(new Date(t.sampleDate).getFullYear()) === printYear).filter((t) => printStatus === "all" || t.status === printStatus);
  const handlePrint = () => {
    const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const meta = [
      farm?.cphNumber ? `CPH: ${farm.cphNumber}` : null,
      farm?.redTractorId ? `Red Tractor ID: ${farm.redTractorId}` : null
    ].filter(Boolean).join("  ·  ");
    const farmLine = `<div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1a3a1a;padding-bottom:6px;margin-bottom:8px">
      <div>
        <h1 style="font-size:12px;font-weight:700;color:#1a3a1a;margin:0 0 2px">Soil Sample Register</h1>
        ${farm ? `<p style="font-size:7.5px;color:#374151;margin:4px 0;line-height:1.5"><strong>${farm.name}</strong>${meta ? "  ·  " + meta : ""}</p>` : ""}
        ${printYear !== "all" ? `<p style="font-size:7.5px;color:#444;margin:4px 0;line-height:1.5">Year: ${printYear}</p>` : ""}
      </div>
      <div style="text-align:right;font-size:7px;color:#374151;line-height:1.8">
        <div style="display:inline-block;background:#dc2626;color:#fff;font-size:6.5px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:.05em;margin-bottom:3px">RED TRACTOR</div><br>
        <span>Printed: ${today}</span><br>
        <span>${filteredTests.length} sample${filteredTests.length !== 1 ? "s" : ""}</span>
      </div>
    </div>`;
    const statusLabel = (s) => STATUS_CONFIG[s]?.label ?? s;
    const testBlocks = filteredTests.map((test) => {
      const fieldName = fields.find((f) => f.id === test.fieldId)?.name ?? `Field #${test.fieldId}`;
      const resultsRows = (test.results ?? []).map(
        (r, i) => `<tr style="background:${i % 2 ? "#f9fafb" : "#fff"}"><td style="border:1px solid #e5e7eb;padding:4px 8px;font-weight:600">${r.nutrient}</td><td style="border:1px solid #e5e7eb;padding:4px 8px;font-family:monospace">${r.value ?? "—"}</td><td style="border:1px solid #e5e7eb;padding:4px 8px">${r.unit ?? "—"}</td><td style="border:1px solid #e5e7eb;padding:4px 8px;font-family:monospace">${r.index ?? "—"}</td><td style="border:1px solid #e5e7eb;padding:4px 8px">${r.status ?? "—"}</td></tr>`
      ).join("");
      const hasResults = (test.results ?? []).length > 0;
      return `<div style="margin-bottom:24px;page-break-inside:avoid">
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px 14px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <p style="font-size:12px;font-weight:700;margin:0 0 2px">${fieldName} — <span style="font-family:monospace">${test.sampleReference ?? "—"}</span></p>
              <p style="font-size:10px;color:#374151;margin:0">${formatDateLong(test.sampleDate)}${test.sampleDepthCm ? ` · ${test.sampleDepthCm}cm depth` : ""}${test.laboratory ? ` · ${test.laboratory}` : ""}${test.sampledBy ? ` · Sampled by ${test.sampledBy}` : ""}</p>
            </div>
            <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:12px;border:1px solid #d1d5db;background:#fff">${statusLabel(test.status ?? "sampled")}</span>
          </div>
          ${test.sentToLabDate ? `<p style="font-size:9px;color:#555;margin:4px 0 0">Sent to lab: ${formatDate(test.sentToLabDate)}${test.resultsReceivedDate ? ` · Results received: ${formatDate(test.resultsReceivedDate)}` : ""}</p>` : ""}
        </div>
        ${hasResults ? `<table style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr style="background:#f3f4f6"><th style="border:1px solid #e5e7eb;padding:4px 8px;text-align:left">Nutrient</th><th style="border:1px solid #e5e7eb;padding:4px 8px;text-align:left">Value</th><th style="border:1px solid #e5e7eb;padding:4px 8px;text-align:left">Unit</th><th style="border:1px solid #e5e7eb;padding:4px 8px;text-align:left">AHDB Index</th><th style="border:1px solid #e5e7eb;padding:4px 8px;text-align:left">Status</th></tr></thead><tbody>${resultsRows}</tbody></table>` : `<p style="font-size:10px;color:#555;font-style:italic;margin:4px 0">Lab results pending</p>`}
        ${test.notes ? `<p style="font-size:9px;color:#444;font-style:italic;margin:4px 0 0">Notes: ${test.notes}</p>` : ""}
      </div>`;
    }).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Soil Sample Register</title><style>
      @page { size: A4; margin: 0.9cm 1.1cm; }
      *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { font-family: Arial, Helvetica, sans-serif; font-size: 8px; color: #111; margin: 0; padding: 0; }
      table { width: 100%; border-collapse: collapse; font-size: 7.5px; }
      th { background: #1a3a1a; padding: 4px 5px; color: #fff; font-weight: 700; font-size: 6.5px; text-transform: uppercase; letter-spacing: .05em; text-align: left; }
      td { padding: 3px 5px; border-bottom: 1px solid #e5e7eb; border-right: 1px solid #f0f0f0; vertical-align: top; }
      tr:nth-child(even) { background: #f8fafc; }
      .footer { margin-top: 10px; padding-top: 6px; border-top: 1px solid #d1d5db; display: flex; justify-content: space-between; font-size: 6.5px; color: #555; }
    </style></head><body>
    ${farmLine}${testBlocks}
    <div class="footer">
      <span>Retain for a minimum of 3 years and make available at Red Tractor audit inspection.</span>
      <span>BDE Farm Trac · ${today}</span>
    </div>
    </body></html>`);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-4 items-start sm:items-end mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-foreground mb-1", children: "Print Sample Register" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Export a printable record for assessors or Red Tractor inspections." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 items-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: "Filter by year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10", value: printYear, onChange: (e) => setPrintYear(e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: "Filter by status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { className: "h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10", value: printStatus, onChange: (e) => setPrintStatus(e.target.value), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All statuses" }),
            Object.entries(STATUS_CONFIG).map(([k, v]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: k, children: v.label }, k))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handlePrint, className: "gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-4 h-4" }),
          " Print / Save PDF"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-foreground/50 border-t border-border/30 pt-4", children: [
      filteredTests.length,
      " sample",
      filteredTests.length !== 1 ? "s" : "",
      " will be included",
      filteredTests.filter((t) => (t.results ?? []).length === 0).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-amber-600", children: [
        "· ",
        filteredTests.filter((t) => (t.results ?? []).length === 0).length,
        " pending lab results"
      ] })
    ] })
  ] });
}
const STATUS_PIN_COLORS = {
  sampled: "#3b82f6",
  sent_to_lab: "#f59e0b",
  results_received: "#16a34a",
  archived: "#9ca3af"
};
function destroyLeafletMap(map) {
  if (!map) return;
  try {
    map.off();
    map.remove();
  } catch {
  }
}
function extractNutrient(results, names) {
  for (const name of names) {
    const r = results.find((r2) => r2.nutrient.toLowerCase().includes(name.toLowerCase()));
    if (r) return r.value ?? (r.index ? `Index ${r.index}` : null);
  }
  return null;
}
function extractIndex(results, names) {
  for (const name of names) {
    const r = results.find((r2) => r2.nutrient.toLowerCase().includes(name.toLowerCase()));
    if (r?.index) return r.index;
  }
  return null;
}
function MapTab({ farmId }) {
  const mapRef = reactExports.useRef(null);
  const leafletMapRef = reactExports.useRef(null);
  const [leafletReady, setLeafletReady] = reactExports.useState(false);
  const fieldsQ = useQuery({
    queryKey: ["fields-soil-map", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }).then((r) => r.json())
  });
  const testsQ = useQuery({
    queryKey: ["soil-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/soil-tests`, { credentials: "include" }).then((r) => r.json())
  });
  const fields = fieldsQ.data?.records ?? [];
  const gpsTests = (testsQ.data?.records ?? []).filter((t) => t.latitude && t.longitude);
  const detailResults = useQueries({
    queries: gpsTests.map((t) => ({
      queryKey: ["soil-test-detail", farmId, t.id],
      queryFn: () => fetch(`/api/farms/${farmId}/soil-tests/${t.id}`, { credentials: "include" }).then((r) => r.json())
    }))
  });
  const detailMap = {};
  gpsTests.forEach((t, i) => {
    detailMap[t.id] = detailResults[i]?.data?.record?.results ?? [];
  });
  const allLoaded = gpsTests.length === 0 || !detailResults.some((r) => r.isLoading);
  reactExports.useEffect(() => {
    __vitePreload(() => import("./leaflet-src-Da-Npv1V.js").then((n) => n.l), true ? __vite__mapDeps([0,1,2]) : void 0).then((L) => {
      if (!("_leafletLoaded" in window)) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        window["_leafletLoaded"] = true;
      }
      window["_L"] = L;
      setLeafletReady(true);
    });
    return () => {
      destroyLeafletMap(leafletMapRef.current);
      leafletMapRef.current = null;
    };
  }, []);
  reactExports.useEffect(() => {
    if (!leafletReady || !mapRef.current || !allLoaded) return;
    const L = window["_L"];
    destroyLeafletMap(leafletMapRef.current);
    leafletMapRef.current = null;
    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([52.4, -1.5], 6);
    map.scrollWheelZoom.enable();
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri", maxZoom: 20 }
    ).addTo(map);
    leafletMapRef.current = map;
    const allBounds = [];
    gpsTests.forEach((test) => {
      if (!test.latitude || !test.longitude) return;
      const lat = parseFloat(test.latitude);
      const lng = parseFloat(test.longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      const fieldName = fields.find((f) => f.id === test.fieldId)?.name ?? `Field #${test.fieldId}`;
      const pinColor = STATUS_PIN_COLORS[test.status ?? "sampled"] ?? "#6b7280";
      const statusLabel = STATUS_CONFIG[test.status ?? "sampled"]?.label ?? test.status;
      const results = detailMap[test.id] ?? [];
      const pH = extractNutrient(results, ["pH", "ph"]);
      const pVal = extractNutrient(results, ["Phosphorus", "phosphorus", "P)"]);
      const pIdx = extractIndex(results, ["Phosphorus", "phosphorus", "P)"]);
      const kVal = extractNutrient(results, ["Potassium", "potassium", "K)"]);
      const kIdx = extractIndex(results, ["Potassium", "potassium", "K)"]);
      const mgVal = extractNutrient(results, ["Magnesium", "magnesium", "Mg)"]);
      const mgIdx = extractIndex(results, ["Magnesium", "magnesium", "Mg)"]);
      const nutrientRow = (label, val, idx) => `<tr><td style="padding:2px 6px 2px 0;color:#6b7280;font-size:11px">${label}</td>
              <td style="padding:2px 0;font-family:monospace;font-size:11px;font-weight:600;color:#111">${val ?? "—"}</td>
              ${idx ? `<td style="padding:2px 0 2px 6px;font-size:10px;color:#6b7280">Index ${idx}</td>` : "<td></td>"}
         </tr>`;
      const hasResults = results.length > 0;
      const nutrientTable = hasResults ? `<table style="margin-top:6px;border-collapse:collapse;width:100%">
             ${pH ? nutrientRow("pH", pH, null) : ""}
             ${pVal || pIdx ? nutrientRow("Phosphorus (P)", pVal, pIdx) : ""}
             ${kVal || kIdx ? nutrientRow("Potassium (K)", kVal, kIdx) : ""}
             ${mgVal || mgIdx ? nutrientRow("Magnesium (Mg)", mgVal, mgIdx) : ""}
           </table>` : `<p style="font-size:11px;color:#9ca3af;font-style:italic;margin:4px 0 0">Lab results pending</p>`;
      const popupHtml = `
        <div style="font-family:system-ui;font-size:13px;min-width:200px;max-width:260px;padding:2px 0">
          <p style="font-weight:700;margin:0 0 2px;color:#111">${fieldName}</p>
          <p style="margin:0 0 4px;font-family:monospace;font-size:10px;color:#6b7280">${test.sampleReference ?? "No ref"}</p>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
            <span style="font-size:10px;color:#6b7280">${formatDate(test.sampleDate)}</span>
            <span style="font-size:10px;font-weight:600;padding:1px 8px;border-radius:10px;background:${pinColor}22;color:${pinColor};border:1px solid ${pinColor}40">${statusLabel}</span>
          </div>
          ${test.locationDescription ? `<p style="font-size:10px;color:#6b7280;margin:2px 0;font-style:italic">${test.locationDescription}</p>` : ""}
          ${nutrientTable}
          ${test.sampledBy ? `<p style="font-size:10px;color:#9ca3af;margin:4px 0 0">Sampled by ${test.sampledBy}</p>` : ""}
        </div>`;
      const pinHtml = `<div style="width:26px;height:26px;border-radius:50%;background:${pinColor};border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="13" height="13"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
      </div>`;
      const icon = L.divIcon({ html: pinHtml, className: "", iconSize: [26, 26], iconAnchor: [13, 13] });
      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.bindPopup(popupHtml, { maxWidth: 280 });
      allBounds.push([lat, lng]);
    });
    if (allBounds.length > 0) {
      map.fitBounds(allBounds, { padding: [60, 60], maxZoom: 16 });
    }
  }, [leafletReady, allLoaded, gpsTests, fields, detailMap]);
  const loading = testsQ.isLoading || !allLoaded;
  const noGps = !loading && gpsTests.length === 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
      Object.entries(STATUS_CONFIG).map(([key, cfg]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs font-medium", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 h-3 rounded-full inline-block", style: { background: STATUS_PIN_COLORS[key] } }),
        cfg.label
      ] }, key)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40 ml-2", children: "Click any pin to see sample details and nutrient results" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border overflow-hidden", style: { position: "relative" }, children: [
      (loading || !leafletReady) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-muted flex items-center justify-center z-10", style: { height: 480 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-foreground/50 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
        " Loading sample map…"
      ] }) }),
      noGps && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-muted/80 flex flex-col items-center justify-center z-10", style: { height: 480 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-8 h-8 text-foreground/20 mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground/50", children: "No GPS-tagged samples yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-1", children: 'Use "Pick on map" when registering a sample to add it here.' })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: mapRef, style: { height: 480, width: "100%" } })
    ] }),
    gpsTests.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40", children: [
      gpsTests.length,
      " of ",
      testsQ.data?.records.length ?? 0,
      " samples have GPS coordinates · Showing all years"
    ] })
  ] });
}
const TREND_NUTRIENTS = [
  { key: "ph", label: "pH", names: ["pH", "ph"], color: "#7c3aed", target: 6.5, unit: "", higherIsBetter: true, targetNote: "Target ≥ 6.5 for arable" },
  { key: "p", label: "Phosphorus (P)", names: ["Phosphorus", "phospho"], color: "#ea580c", target: 2, unit: "index", higherIsBetter: false, targetNote: "AHDB Index 2 = optimal" },
  { key: "k", label: "Potassium (K)", names: ["Potassium", "potass"], color: "#0891b2", target: 2, unit: "index", higherIsBetter: false, targetNote: "AHDB Index 2 = optimal" },
  { key: "mg", label: "Magnesium (Mg)", names: ["Magnesium", "magnes"], color: "#16a34a", target: 2, unit: "index", higherIsBetter: false, targetNote: "AHDB Index 2 = optimal" }
];
function getNutrientValue(results, names) {
  for (const name of names) {
    const r = results.find((r2) => r2.nutrient.toLowerCase().includes(name.toLowerCase()));
    if (r) {
      const v = parseFloat(r.index ?? r.value ?? "");
      if (!isNaN(v)) return v;
    }
  }
  return null;
}
function TrendsTab({ farmId }) {
  const [selectedFieldId, setSelectedFieldId] = reactExports.useState("");
  const fieldsQ = useQuery({
    queryKey: ["fields-soil-trends", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }).then((r) => r.json())
  });
  const testsQ = useQuery({
    queryKey: ["soil-tests", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/soil-tests`, { credentials: "include" }).then((r) => r.json())
  });
  const fields = fieldsQ.data?.records ?? [];
  const allTests = testsQ.data?.records ?? [];
  const fieldTests = selectedFieldId ? allTests.filter((t) => t.fieldId === selectedFieldId && t.status === "results_received").sort((a, b) => new Date(a.sampleDate).getTime() - new Date(b.sampleDate).getTime()) : [];
  const detailResults = useQueries({
    queries: fieldTests.map((t) => ({
      queryKey: ["soil-test-detail", farmId, t.id],
      queryFn: () => fetch(`/api/farms/${farmId}/soil-tests/${t.id}`, { credentials: "include" }).then((r) => r.json())
    }))
  });
  const fieldsWithResults = allTests.length > 0 ? fields.filter((f) => allTests.some((t) => t.fieldId === f.id && t.status === "results_received")) : [];
  const chartData = fieldTests.map((test, i) => {
    const results = detailResults[i]?.data?.record?.results ?? [];
    const row = {
      date: new Date(test.sampleDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
      ref: test.sampleReference ?? ""
    };
    TREND_NUTRIENTS.forEach((n) => {
      row[n.key] = getNutrientValue(results, n.names);
    });
    return row;
  });
  const allDetailLoaded = fieldTests.length === 0 || !detailResults.some((r) => r.isLoading);
  function TrendArrow({ current, previous, higherIsBetter }) {
    if (current === null || previous === null) return /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-3.5 h-3.5 text-foreground/30" });
    const diff = current - previous;
    if (Math.abs(diff) < 0.1) return /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-3.5 h-3.5 text-foreground/40" });
    const improving = higherIsBetter ? diff > 0 : Math.abs(current - 2) < Math.abs(previous - 2);
    if (diff > 0) return /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: `w-3.5 h-3.5 ${improving ? "text-green-600" : "text-red-500"}` });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: `w-3.5 h-3.5 ${improving ? "text-green-600" : "text-red-500"}` });
  }
  const latestResults = fieldTests.length > 0 ? detailResults[fieldTests.length - 1]?.data?.record?.results ?? [] : [];
  const prevResults = fieldTests.length > 1 ? detailResults[fieldTests.length - 2]?.data?.record?.results ?? [] : [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium text-foreground/60 mb-1 block", children: "Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            className: "h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 min-w-48",
            value: selectedFieldId,
            onChange: (e) => setSelectedFieldId(e.target.value ? Number(e.target.value) : ""),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a field…" }),
              fieldsWithResults.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: f.id, children: [
                f.name,
                f.fieldReference ? ` (${f.fieldReference})` : ""
              ] }, f.id))
            ]
          }
        )
      ] }),
      selectedFieldId && fieldsWithResults.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50 mt-4", children: "No fields with completed lab results yet." })
    ] }),
    !selectedFieldId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-10 h-10 text-foreground/20 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground/50", children: "Select a field to view soil health trends" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-1", children: "Shows how pH, P, K and Mg have changed across all sampling events" })
    ] }),
    selectedFieldId && !allDetailLoaded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-foreground/50 text-sm py-8 justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
      " Loading nutrient history…"
    ] }),
    selectedFieldId && allDetailLoaded && fieldTests.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { className: "w-10 h-10 text-foreground/20 mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground/50", children: "No completed lab results for this field" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-1", children: 'Results will appear here once samples reach "Results Received" status.' })
    ] }),
    selectedFieldId && allDetailLoaded && fieldTests.length === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3", children: "Only one set of results recorded — trends appear when there are two or more sampling events with results." }),
    selectedFieldId && allDetailLoaded && fieldTests.length >= 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: TREND_NUTRIENTS.map((n) => {
        const latest = getNutrientValue(latestResults, n.names);
        const prev = getNutrientValue(prevResults, n.names);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-white p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-foreground/60 uppercase tracking-wider", children: n.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendArrow, { current: latest, previous: prev, higherIsBetter: n.higherIsBetter })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold", style: { color: n.color }, children: latest !== null ? latest.toFixed(n.key === "ph" ? 1 : 0) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/40 mt-0.5", children: [
            n.unit || "value",
            " · ",
            n.targetNote
          ] }),
          prev !== null && latest !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-foreground/50 mt-1", children: [
            "Previous: ",
            prev.toFixed(n.key === "ph" ? 1 : 0),
            " · ",
            latest > prev ? "▲" : latest < prev ? "▼" : "=",
            " ",
            Math.abs(latest - prev).toFixed(n.key === "ph" ? 1 : 0)
          ] })
        ] }, n.key);
      }) }),
      fieldTests.length >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-5", children: TREND_NUTRIENTS.map((n) => {
        const hasData = chartData.some((d) => d[n.key] !== null);
        if (!hasData) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-white p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-foreground", children: n.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-foreground/40", children: n.targetNote })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 180, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: chartData, margin: { top: 4, right: 8, bottom: 4, left: -16 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 10 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 10 }, domain: ["auto", "auto"] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Tooltip,
              {
                contentStyle: { fontSize: 11, borderRadius: 8 },
                formatter: (val) => [typeof val === "number" ? val.toFixed(n.key === "ph" ? 2 : 1) : String(val ?? ""), n.label],
                labelFormatter: (l) => `Sample: ${l}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ReferenceLine, { y: n.target, stroke: n.color, strokeDasharray: "5 3", opacity: 0.5, label: { value: `Target ${n.target}`, fontSize: 9, fill: n.color } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Line,
              {
                type: "monotone",
                dataKey: n.key,
                stroke: n.color,
                strokeWidth: 2.5,
                dot: { r: 4, fill: n.color, strokeWidth: 0 },
                activeDot: { r: 6 },
                connectNulls: false
              }
            )
          ] }) })
        ] }, n.key);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 bg-muted/30 border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-foreground", children: "All Sampling Events" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border bg-muted/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-4 font-bold text-foreground/50 uppercase tracking-wider", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 font-bold text-foreground/50 uppercase tracking-wider", children: "Reference" }),
            TREND_NUTRIENTS.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right py-2 px-3 font-bold uppercase tracking-wider", style: { color: n.color }, children: n.label.split(" ")[0] }, n.key)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-3 font-bold text-foreground/50 uppercase tracking-wider", children: "Lab" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: fieldTests.map((test, i) => {
            const res = detailResults[i]?.data?.record?.results ?? [];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/30 hover:bg-black/[0.02]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-4 text-foreground/70", children: formatDate(test.sampleDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 font-mono text-foreground/60", children: test.sampleReference ?? "—" }),
              TREND_NUTRIENTS.map((n) => {
                const val = getNutrientValue(res, n.names);
                return /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-right font-mono font-semibold", style: { color: val !== null ? n.color : void 0 }, children: val !== null ? val.toFixed(n.key === "ph" ? 2 : 1) : "—" }, n.key);
              }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-3 text-foreground/50", children: test.laboratory ?? "—" })
            ] }, test.id);
          }) })
        ] }) })
      ] })
    ] })
  ] });
}
const SOIL_TAB_IDS = ["register", "map", "trends", "sensors", "print"];
function SoilTestsPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "soil-tests", farmId, validIds: SOIL_TAB_IDS, defaultTab: "register" });
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppLayout, { title: "Soil Sample Register", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "register", onClick: () => setTab("register"), children: "Sample Register" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "map", onClick: () => setTab("map"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Map$1, { className: "w-3.5 h-3.5 mr-1 inline-block" }),
        "Sample Map"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "trends", onClick: () => setTab("trends"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3.5 h-3.5 mr-1 inline-block" }),
        "Soil Trends"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "sensors", onClick: () => setTab("sensors"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "w-3.5 h-3.5 mr-1 inline-block" }),
        "Sensors"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabButton, { active: tab === "print", onClick: () => setTab("print"), children: "Print / Export" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      tab === "register" && /* @__PURE__ */ jsxRuntimeExports.jsx(RegisterTab, { farmId }),
      tab === "map" && /* @__PURE__ */ jsxRuntimeExports.jsx(MapTab, { farmId }),
      tab === "trends" && /* @__PURE__ */ jsxRuntimeExports.jsx(TrendsTab, { farmId }),
      tab === "sensors" && /* @__PURE__ */ jsxRuntimeExports.jsx(SoilSensorsTab, { farmId }),
      tab === "print" && /* @__PURE__ */ jsxRuntimeExports.jsx(PrintTab, { farmId })
    ] })
  ] });
}
export {
  SoilTestsPage as default
};
