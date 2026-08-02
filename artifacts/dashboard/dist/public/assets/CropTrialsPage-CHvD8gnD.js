const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/leaflet-src-BtEllOa3.js","assets/index-CZOZ9PUS.js","assets/index-CNUbH-zj.css"])))=>i.map(i=>d[i]);
import { q as createLucideIcon, b as useAppStore, r as reactExports, _ as __vitePreload, j as jsxRuntimeExports, t as useQueryClient, a as useToast, l as useQuery, O as useMutation, T as FlaskConical, c as Button, S as Plus, K as Map, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, L as Label, I as Input, J as DialogFooter, M as MapPin, d as LoaderCircle } from "./index-CZOZ9PUS.js";
import { p as printProReport } from "./print-report-B_FwCCVJ.js";
import { C as CropYearSelector } from "./CropYearSelector-Dv6_zHwD.js";
import { b as cropYearLabel, c as currentCropYear, i as isInCropYear } from "./cropYear-Dmv-iNR6.js";
import { A as AppLayout, h as List, S as Sprout, a as Wheat, i as TestTube, e as ChartColumn, N as Navigation } from "./AppLayout-Do_5oOQY.js";
import { T as Textarea } from "./textarea-2yrjDOZl.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BwbieXNY.js";
import { P as Printer } from "./printer-CwSfDCkA.js";
import { T as TriangleAlert } from "./triangle-alert-COBBLke9.js";
import { C as CircleCheckBig } from "./circle-check-big-DndZ7v60.js";
import { C as ChevronLeft } from "./chevron-left-DCAabCFn.js";
import { F as FileText } from "./shield-alert-DG8i8Vya.js";
import { E as Eye } from "./eye-DTDuM3N0.js";
import { M as MessageSquare } from "./message-square-qtYeOpQ7.js";
import { T as Trash2 } from "./trash-2-Br8I1Au-.js";
import { M as Mail } from "./mail-BHS55NzV.js";
import { P as Phone } from "./phone-CM8N3QaL.js";
import { A as ArrowUpRight } from "./arrow-up-right-M6LiOD1_.js";
import "./use-safe-clerk-BYXuxszW.js";
import "./database-BGfW_7Ny.js";
import "./shield-check-CKuh9SkA.js";
import "./tractor-BtvQMpsx.js";
import "./index-Dj8A5pKi.js";
import "./index-BRg5r7vP.js";
import "./chevron-up-C3chbAQz.js";
const __iconNode = [
  ["path", { d: "M17 7 7 17", key: "15tmo1" }],
  ["path", { d: "M17 17H7V7", key: "1org7z" }]
];
const ArrowDownLeft = createLucideIcon("arrow-down-left", __iconNode);
const STATUS_COLORS = {
  planned: { stroke: "#6b7280", fill: "#6b728033" },
  active: { stroke: "#2563eb", fill: "#2563eb33" },
  harvested: { stroke: "#16a34a", fill: "#16a34a33" },
  completed: { stroke: "#a16207", fill: "#a1620733" },
  cancelled: { stroke: "#dc2626", fill: "#dc262633" }
};
const STATUS_LABELS = {
  planned: "Planned",
  active: "Active",
  harvested: "Harvested",
  completed: "Completed",
  cancelled: "Cancelled"
};
function destroyMap(map) {
  if (!map) return;
  try {
    map.off();
    map.remove();
  } catch {
  }
}
function TrialMapView({ trials, cropYear }) {
  const { farmId } = useAppStore();
  const mapRef = reactExports.useRef(null);
  const leafletMapRef = reactExports.useRef(null);
  const [boundaries, setBoundaries] = reactExports.useState([]);
  const [leafletReady, setLeafletReady] = reactExports.useState(false);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    __vitePreload(() => import("./leaflet-src-BtEllOa3.js").then((n) => n.l), true ? __vite__mapDeps([0,1,2]) : void 0).then((L) => {
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
    };
  }, []);
  reactExports.useEffect(() => {
    if (!farmId) return;
    setLoading(true);
    fetch(`/api/farms/${farmId}/fields/boundaries/all`, { credentials: "include" }).then((r) => r.json()).then((d) => setBoundaries(d.boundaries ?? [])).catch(() => setBoundaries([])).finally(() => setLoading(false));
  }, [farmId]);
  reactExports.useEffect(() => {
    if (!leafletReady || !mapRef.current || loading) return;
    const L = window["_L"];
    destroyMap(leafletMapRef.current);
    leafletMapRef.current = null;
    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([52.4, -1.5], 11);
    map.scrollWheelZoom.enable();
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { attribution: "Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics", maxZoom: 20 }
    ).addTo(map);
    leafletMapRef.current = map;
    const allBounds = [];
    const seasonLabel2 = cropYearLabel(cropYear);
    trials.forEach((trial) => {
      if (trial.season && trial.season !== seasonLabel2) return;
      if (!trial.fieldId) return;
      const fieldEntry = boundaries.find((b) => b.fieldId === trial.fieldId);
      const colors = STATUS_COLORS[trial.status] ?? STATUS_COLORS.planned;
      if (fieldEntry && fieldEntry.boundary && fieldEntry.boundary.polygonPoints && fieldEntry.boundary.polygonPoints.length >= 3) {
        const pts = fieldEntry.boundary.polygonPoints;
        const latlngs = pts.map((p) => [p.lat, p.lng]);
        const poly = L.polygon(latlngs, {
          color: colors.stroke,
          fillColor: colors.fill.slice(0, 7),
          fillOpacity: 0.35,
          weight: 2.5
        }).addTo(map);
        const yieldPlots = trial.plots.filter((p) => p.latitude);
        const popupHtml = `
          <div style="font-family:system-ui;font-size:13px;min-width:180px">
            <p style="font-weight:700;margin:0 0 4px">${trial.trialName}</p>
            <p style="margin:0 0 2px;color:#6b7280">${[trial.cropName, trial.season].filter(Boolean).join(" · ")}</p>
            <span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:600;background:${colors.fill.slice(0, 7)}22;color:${colors.stroke};border:1px solid ${colors.stroke}30">${STATUS_LABELS[trial.status] ?? trial.status}</span>
            <p style="margin:6px 0 0;font-size:11px;color:#374151">${trial.plots.length} plot${trial.plots.length !== 1 ? "s" : ""} · ${yieldPlots.length} with GPS</p>
            <p style="margin:2px 0 0;font-size:11px;color:#6b7280">Field: ${fieldEntry.fieldName}</p>
          </div>`;
        poly.bindPopup(popupHtml);
        latlngs.forEach((p) => allBounds.push(p));
      }
      trial.plots.forEach((plot) => {
        if (!plot.latitude || !plot.longitude) return;
        const lat = parseFloat(plot.latitude);
        const lng = parseFloat(plot.longitude);
        if (isNaN(lat) || isNaN(lng)) return;
        const pinHtml = `<div style="width:20px;height:20px;border-radius:50%;background:${plot.isControl ? "#fde047" : colors.stroke};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:${plot.isControl ? "#92400e" : "#fff"}">${plot.plotNumber}</div>`;
        const icon = L.divIcon({ html: pinHtml, className: "", iconSize: [20, 20], iconAnchor: [10, 10] });
        const marker = L.marker([lat, lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:system-ui;font-size:12px">
            <p style="font-weight:700;margin:0">Plot ${plot.plotNumber}${plot.isControl ? " (Control)" : ""}</p>
            ${plot.treatmentLabel ? `<p style="margin:2px 0 0;color:#6b7280">${plot.treatmentLabel}</p>` : ""}
            <p style="margin:4px 0 0;font-size:10px;color:#9ca3af">${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
          </div>`);
        allBounds.push([lat, lng]);
      });
    });
    if (allBounds.length > 0) {
      map.fitBounds(allBounds, { padding: [40, 40] });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => map.setView([pos.coords.latitude, pos.coords.longitude], 13),
        () => {
        }
      );
    }
  }, [leafletReady, loading, trials, boundaries, cropYear]);
  const seasonLabel = cropYearLabel(cropYear);
  const visibleTrials = trials.filter((t) => !t.season || t.season === seasonLabel);
  visibleTrials.filter((t) => t.fieldId && boundaries.find((b) => b.fieldId === t.fieldId && b.boundary));
  const trialsNoBoundary = visibleTrials.filter((t) => t.fieldId && !boundaries.find((b) => b.fieldId === t.fieldId && b.boundary));
  const presentStatuses = [...new Set(visibleTrials.map((t) => t.status))];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 12 }, children: [
    presentStatuses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }, children: [
      presentStatuses.map((s) => {
        const c = STATUS_COLORS[s] ?? STATUS_COLORS.planned;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.75rem", fontWeight: 600, padding: "3px 10px", borderRadius: 12, background: c.fill.slice(0, 7) + "22", color: c.stroke, border: `1px solid ${c.stroke}50` }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: 10, height: 10, borderRadius: 2, background: c.stroke, display: "inline-block" } }),
          STATUS_LABELS[s]
        ] }, s);
      }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#9ca3af", marginLeft: 4 }, children: "Click a field polygon for details · Numbered pins = GPS-located plots" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative", borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb" }, children: [
      (loading || !leafletReady) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "absolute", inset: 0, background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem" }, children: "Loading map…" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: mapRef, style: { height: 480, width: "100%" } })
    ] }),
    trialsNoBoundary.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 14px", fontSize: "0.8125rem", color: "#92400e" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
        "Fields without a boundary drawn (",
        trialsNoBoundary.length,
        "):"
      ] }),
      " ",
      trialsNoBoundary.map((t) => t.trialName).join(", "),
      " — go to the Fields page and draw a boundary to show these on the map."
    ] }),
    visibleTrials.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "32px 16px", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 600, color: "#374151" }, children: [
        "No trials for ",
        seasonLabel
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Select a different crop year or create a new trial." })
    ] })
  ] });
}
const STATUS_MAP = {
  planned: { label: "Planned", bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" },
  active: { label: "Active", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  harvested: { label: "Harvested", bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  completed: { label: "Completed", bg: "#fefce8", color: "#a16207", border: "#fde047" },
  cancelled: { label: "Cancelled", bg: "#fef2f2", color: "#dc2626", border: "#fecaca" }
};
const TRIAL_PURPOSES = [
  "Variety comparison",
  "Input response (fertiliser)",
  "Input response (pesticide)",
  "Cultivation method comparison",
  "Seed rate trial",
  "Plant growth regulator response",
  "Fungicide programme comparison",
  "Cover crop establishment",
  "Irrigation response",
  "Other"
];
const TRIAL_TYPES = ["Replicated randomised", "Unreplicated strip", "Split plot", "Latin square", "Simple comparison", "Other"];
const TREATMENT_TYPES = ["Seed / variety", "Fertiliser", "Herbicide", "Fungicide", "Insecticide", "PGR", "Irrigation", "Cultivation", "Control", "Other"];
const GROWTH_STAGES = ["Pre-emergence", "GS11 (1st leaf)", "GS12-19 (Tillering)", "GS21-29 (Stem extension)", "GS31-39 (Jointing)", "GS41-49 (Flag leaf)", "GS51-59 (Heading)", "GS61-69 (Flowering)", "GS71-77 (Milk)", "GS83-87 (Dough)", "GS91-99 (Harvest)", "Other"];
const CONDITION_OPTIONS = ["Excellent", "Good", "Fair", "Poor"];
const CROP_OPTIONS = [
  "Winter wheat",
  "Spring wheat",
  "Winter barley",
  "Spring barley",
  "Winter oats",
  "Spring oats",
  "Oilseed rape",
  "Field peas",
  "Field beans",
  "Spring beans",
  "Sugar beet",
  "Potatoes",
  "Maize / forage maize",
  "Rye",
  "Triticale",
  "Linseed",
  "Grass / silage",
  "Cover crop mix",
  "Other"
];
function getSeasonOptions() {
  const base = currentCropYear();
  const out = [];
  for (let y = base - 1; y <= base + 4; y++) out.push(cropYearLabel(y));
  return out;
}
const STATUS_DESCRIPTIONS = {
  planned: "Trial designed but not yet underway",
  active: "Plots established, treatments being applied",
  harvested: "Harvest complete, yield data collected",
  completed: "All analysis done and results recorded",
  cancelled: "Trial abandoned or invalidated"
};
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtNum = (v, dp = 2) => v != null && v !== "" ? parseFloat(String(v)).toFixed(dp) : "—";
function StatusBadge({ status }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.planned;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "inline-block", padding: "2px 9px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600, background: s.bg, color: s.color, border: `1px solid ${s.border}` }, children: s.label });
}
function YieldComparisonTable({ plots }) {
  const plotsWithYield = plots.filter((p) => p.yields.length > 0);
  if (plotsWithYield.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "24px 0" }, children: "No yield data recorded yet. Add harvest results to each plot." });
  const control = plotsWithYield.find((p) => p.isControl);
  const controlYield = control?.yields[0]?.yieldTha ? parseFloat(control.yields[0].yieldTha) : null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { overflowX: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Plot" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "left", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Treatment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Yield (t/ha)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "vs Control" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Moisture %" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { textAlign: "right", padding: "10px 14px", fontWeight: 600, color: "#374151" }, children: "Fresh Wt (kg)" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: plotsWithYield.map((p, i) => {
      const y = p.yields[0];
      const yTha = y.yieldTha ? parseFloat(y.yieldTha) : null;
      const diff = controlYield && yTha && !p.isControl ? (yTha - controlYield) / controlYield * 100 : null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6", background: p.isControl ? "#fefce8" : void 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "10px 14px", fontWeight: 600 }, children: [
          p.plotNumber,
          " ",
          p.isControl && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", background: "#fde047", color: "#92400e", padding: "1px 6px", borderRadius: 8, marginLeft: 4, fontWeight: 700 }, children: "CTRL" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", color: "#6b7280" }, children: p.treatmentLabel || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", textAlign: "right", fontWeight: 600 }, children: yTha != null ? yTha.toFixed(3) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", textAlign: "right" }, children: p.isControl ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#9ca3af" }, children: "—" }) : diff != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontWeight: 600, color: diff >= 0 ? "#16a34a" : "#dc2626" }, children: [
          diff >= 0 ? "+" : "",
          diff.toFixed(1),
          "%"
        ] }) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", textAlign: "right", color: "#6b7280" }, children: fmtNum(y.moisturePercent, 1) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "10px 14px", textAlign: "right", color: "#6b7280" }, children: fmtNum(y.freshWeightKg, 1) })
      ] }, p.id);
    }) })
  ] }) });
}
function TrialDetailView({ trial, farmId, onBack, fields }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [detailTab, setDetailTab] = reactExports.useState("plots");
  const [addPlotOpen, setAddPlotOpen] = reactExports.useState(false);
  const [selectedPlot, setSelectedPlot] = reactExports.useState(null);
  const [addTreatmentOpen, setAddTreatmentOpen] = reactExports.useState(false);
  const [addObsOpen, setAddObsOpen] = reactExports.useState(false);
  const [addYieldOpen, setAddYieldOpen] = reactExports.useState(false);
  const [deletePlotId, setDeletePlotId] = reactExports.useState(null);
  const [statusPickerOpen, setStatusPickerOpen] = reactExports.useState(false);
  const [addCommOpen, setAddCommOpen] = reactExports.useState(false);
  const [commForm, setCommForm] = reactExports.useState({ commDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), commType: "email", direction: "inbound", subject: "", summary: "" });
  const updateStatusMut = useMutation({
    mutationFn: (status) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    }).then((r) => r.json()),
    onSuccess: (_, status) => {
      toast({ title: `Status updated to ${STATUS_MAP[status]?.label ?? status}` });
      invalidate();
      setStatusPickerOpen(false);
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" })
  });
  const [plotForm, setPlotForm] = reactExports.useState({ plotNumber: "", treatmentLabel: "", isControl: false, areaHa: "", locationDescription: "", replicationBlock: "", latitude: "", longitude: "" });
  const [gpsCapturing, setGpsCapturing] = reactExports.useState(false);
  const [txForm, setTxForm] = reactExports.useState({ treatmentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), treatmentType: "", productName: "", applicationRate: "", unit: "", notes: "" });
  const [obsForm, setObsForm] = reactExports.useState({ observationDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), growthStage: "", plantCount: "", plantHeightCm: "", diseasePresent: false, diseaseName: "", pestPresent: false, pestName: "", generalCondition: "", notes: "" });
  const [yieldForm, setYieldForm] = reactExports.useState({ harvestDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), freshWeightKg: "", moisturePercent: "", adjustedDryWeightKg: "", yieldTha: "", grainProteinPercent: "", specificWeight: "", notes: "" });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["crop-trials", farmId] });
  const commsQ = useQuery({
    queryKey: ["trial-comms", trial.id],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/communications`).then((r) => r.json()),
    enabled: detailTab === "comms"
  });
  const comms = commsQ.data ?? [];
  const addCommMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/communications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Communication logged" });
      qc.invalidateQueries({ queryKey: ["trial-comms", trial.id] });
      setAddCommOpen(false);
      setCommForm({ commDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), commType: "email", direction: "inbound", subject: "", summary: "" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteCommMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/communications/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trial-comms", trial.id] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const EMPTY_PLOT_FORM = { plotNumber: "", treatmentLabel: "", isControl: false, areaHa: "", locationDescription: "", replicationBlock: "", latitude: "", longitude: "" };
  const addPlotMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/plots`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Plot added" });
      invalidate();
      setAddPlotOpen(false);
      setPlotForm({ ...EMPTY_PLOT_FORM });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  async function captureGPS() {
    if (!navigator.geolocation) {
      toast({ title: "GPS not available in this browser" });
      return;
    }
    setGpsCapturing(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPlotForm((f) => ({ ...f, latitude: pos.coords.latitude.toFixed(7), longitude: pos.coords.longitude.toFixed(7) }));
        setGpsCapturing(false);
      },
      () => {
        toast({ title: "Could not get location", description: "Ensure location access is granted in your browser." });
        setGpsCapturing(false);
      },
      { enableHighAccuracy: true, timeout: 1e4 }
    );
  }
  function generateFullReport() {
    const field2 = fields.find((f) => f.id === trial.fieldId);
    const plotRows = trial.plots.map((p) => {
      const latestYield = p.yields[0];
      return `<tr>
        <td>${p.plotNumber}</td>
        <td>${p.isControl ? "✓" : ""}</td>
        <td>${p.treatmentLabel ?? "—"}</td>
        <td>${p.replicationBlock ?? "—"}</td>
        <td>${p.areaHa ? parseFloat(p.areaHa).toFixed(4) + " ha" : "—"}</td>
        <td>${p.latitude && p.longitude ? parseFloat(p.latitude).toFixed(5) + ", " + parseFloat(p.longitude).toFixed(5) : "—"}</td>
        <td>${p.locationDescription ?? "—"}</td>
        <td style="font-weight:${latestYield?.yieldTha ? "700" : "400"}">${latestYield?.yieldTha ? parseFloat(latestYield.yieldTha).toFixed(3) + " t/ha" : "—"}</td>
        <td>${latestYield?.moisturePercent ? parseFloat(latestYield.moisturePercent).toFixed(1) + "%" : "—"}</td>
      </tr>`;
    }).join("");
    const statusInfo = STATUS_MAP[trial.status];
    const html = `<!DOCTYPE html><html><head>
      <title>Full Trial Report — ${trial.trialName}</title>
      <style>
        @page { margin: 18mm; }
        body { font-family: Arial, sans-serif; font-size: 11px; color: #111; }
        h1 { font-size: 18px; margin: 0 0 4px; } h2 { font-size: 13px; margin: 18px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ddd; padding: 5px 7px; vertical-align: top; }
        th { background: #f0f0f0; font-size: 10px; text-transform: uppercase; font-weight: 600; }
        .meta { display: flex; flex-wrap: wrap; gap: 20px; padding: 10px 14px; background: #f9f9f9; border: 1px solid #e5e7eb; border-radius: 6px; margin: 10px 0; }
        .meta span { font-size: 11px; } .meta strong { font-weight: 700; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 10px; font-weight: 700; background: ${statusInfo?.bg}; color: ${statusInfo?.color}; border: 1px solid ${statusInfo?.border}; }
        .footer { margin-top: 30px; font-size: 9px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 8px; }
        .control-row { background: #fefce8; }
      </style>
    </head><body>
      <h1>Full Trial Report</h1>
      <p style="font-size:13px;font-weight:700;margin:0 0 4px">${trial.trialName} &nbsp; <span class="badge">${statusInfo?.label ?? trial.status}</span></p>
      <p style="color:#6b7280;margin:0 0 2px">${[trial.cropName, trial.season, trial.trialPurpose].filter(Boolean).join(" · ")}</p>
      ${field2 ? `<p style="color:#6b7280;margin:0">Field: <strong>${field2.name}</strong></p>` : ""}

      <div class="meta">
        ${trial.trialsBody ? `<span><strong>Trials Body:</strong> ${trial.trialsBody}</span>` : ""}
        ${trial.contactName ? `<span><strong>Contact:</strong> ${trial.contactName}</span>` : ""}
        ${trial.trialType ? `<span><strong>Design:</strong> ${trial.trialType}</span>` : ""}
        ${trial.numberOfTreatments ? `<span><strong>Treatments:</strong> ${trial.numberOfTreatments}</span>` : ""}
        ${trial.numberOfReplications ? `<span><strong>Reps:</strong> ${trial.numberOfReplications}</span>` : ""}
        ${trial.totalAreaHa ? `<span><strong>Total Area:</strong> ${parseFloat(trial.totalAreaHa).toFixed(4)} ha</span>` : ""}
        ${trial.startDate ? `<span><strong>Start:</strong> ${fmt(trial.startDate)}</span>` : ""}
        ${trial.endDate ? `<span><strong>End:</strong> ${fmt(trial.endDate)}</span>` : ""}
      </div>

      <h2>Plot Results Summary (${trial.plots.length} plots)</h2>
      <table>
        <thead><tr><th>Plot</th><th>Control</th><th>Treatment</th><th>Block</th><th>Area</th><th>GPS</th><th>Location</th><th>Yield (t/ha)</th><th>Moisture</th></tr></thead>
        <tbody>${plotRows}</tbody>
      </table>

      ${trial.notes ? `<h2>Trial Notes</h2><p style="white-space:pre-wrap;font-size:11px">${trial.notes}</p>` : ""}

      <p class="footer">
        Generated by BDE Farm Trac &nbsp;|&nbsp; Printed: ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
        &nbsp;|&nbsp; This report is for on-farm records only and does not constitute an official trial result submission.
      </p>
    </body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      w.addEventListener("afterprint", () => w.close());
      w.print();
    }
  }
  const deletePlotMut = useMutation({
    mutationFn: (plotId) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/plots/${plotId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Plot deleted" });
      invalidate();
      setDeletePlotId(null);
      setSelectedPlot(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const addTreatmentMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/plots/${selectedPlot.id}/treatments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Treatment recorded" });
      invalidate();
      setAddTreatmentOpen(false);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const addObsMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/plots/${selectedPlot.id}/observations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Observation saved" });
      invalidate();
      setAddObsOpen(false);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const addYieldMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/crop-trials/${trial.id}/plots/${selectedPlot.id}/yields`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Yield data saved" });
      invalidate();
      setAddYieldOpen(false);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  function computeYieldTha() {
    const fw = parseFloat(yieldForm.freshWeightKg);
    const mo = parseFloat(yieldForm.moisturePercent);
    const area = parseFloat(String(selectedPlot?.areaHa ?? "0"));
    if (!isNaN(fw) && !isNaN(mo) && area > 0) {
      const dry = fw * (1 - mo / 100);
      return (dry / 1e3 / area).toFixed(3);
    }
    return "";
  }
  const field = fields.find((f) => f.id === trial.fieldId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 20, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: onBack, style: { flexShrink: 0, marginTop: 3 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 14, className: "mr-1" }),
        " All Trials"
      ] }),
      (trial.status === "harvested" || trial.status === "completed") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: generateFullReport, style: { flexShrink: 0, marginTop: 3, gap: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 13 }),
        " Full Trial Report"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { style: { fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: 0 }, children: trial.trialName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "relative" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setStatusPickerOpen((p) => !p), style: { background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 4 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: trial.status }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", color: "#9ca3af" }, children: "▼" })
            ] }),
            statusPickerOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", padding: 6, minWidth: 220 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", padding: "2px 8px 6px", fontWeight: 500 }, children: "CHANGE STATUS" }),
              Object.entries(STATUS_MAP).map(([k, s]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => updateStatusMut.mutate(k),
                  style: { display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "7px 10px", borderRadius: 5, border: "none", cursor: "pointer", background: trial.status === k ? s.bg : "transparent", textAlign: "left" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { width: 8, height: 8, borderRadius: "50%", background: s.color, flexShrink: 0 } }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { flex: 1 }, children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8125rem", fontWeight: trial.status === k ? 700 : 500, color: trial.status === k ? s.color : "#374151" }, children: s.label }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { display: "block", fontSize: "0.7rem", color: "#9ca3af" }, children: STATUS_DESCRIPTIONS[k] })
                    ] }),
                    trial.status === k && /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 13, style: { color: s.color, flexShrink: 0 } })
                  ]
                },
                k
              ))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8125rem", color: "#6b7280", marginTop: 2 }, children: [
          trial.cropName && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            trial.cropName,
            " · "
          ] }),
          trial.season && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            trial.season,
            " · "
          ] }),
          trial.trialPurpose,
          field && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            " · ",
            field.name
          ] })
        ] })
      ] })
    ] }),
    statusPickerOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { position: "fixed", inset: 0, zIndex: 49 }, onClick: () => setStatusPickerOpen(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 20, flexWrap: "wrap", padding: "12px 16px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 20, fontSize: "0.8125rem", color: "#374151" }, children: [
      trial.trialsBody && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Body: " }),
        trial.trialsBody
      ] }),
      trial.contactName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Contact: " }),
        trial.contactName
      ] }),
      trial.numberOfTreatments && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Treatments: " }),
        trial.numberOfTreatments
      ] }),
      trial.numberOfReplications && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Reps: " }),
        trial.numberOfReplications
      ] }),
      trial.totalAreaHa && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Total area: " }),
        fmtNum(trial.totalAreaHa),
        " ha"
      ] }),
      trial.startDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Started: " }),
        fmt(trial.startDate)
      ] }),
      trial.endDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Ends: " }),
        fmt(trial.endDate)
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 4, marginBottom: 20, borderBottom: "2px solid #e5e7eb", paddingBottom: 0 }, children: [["plots", "Plots", Sprout], ["treatments", "Treatments", TestTube], ["observations", "Observations", Eye], ["results", "Results", ChartColumn], ["comms", "Communications", MessageSquare]].map(([key, label, Icon]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => setDetailTab(key),
        style: {
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "8px 14px",
          border: "none",
          background: "none",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: detailTab === key ? 600 : 400,
          color: detailTab === key ? "#111827" : "#6b7280",
          borderBottom: detailTab === key ? "2px solid #111827" : "2px solid transparent",
          marginBottom: -2
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 14 }),
          label
        ]
      },
      key
    )) }),
    detailTab === "plots" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setAddPlotOpen(true), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
        " Add Plot"
      ] }) }),
      trial.plots.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "40px 20px", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { size: 32, style: { margin: "0 auto 8px", opacity: 0.3 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No plots added yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Add each trial plot — including the control — to start recording treatments, observations and yields." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }, children: trial.plots.map((plot) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { border: "1px solid " + (plot.isControl ? "#fde047" : "#e5e7eb"), borderRadius: 8, padding: "14px", background: plot.isControl ? "#fefce8" : "#fff" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontWeight: 700, fontSize: "1rem", color: "#111827" }, children: [
              "Plot ",
              plot.plotNumber
            ] }),
            plot.isControl && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", background: "#fde047", color: "#92400e", padding: "1px 8px", borderRadius: 8, fontWeight: 700 }, children: "CONTROL" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeletePlotId(plot.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 13 }) })
        ] }),
        plot.treatmentLabel && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "#6b7280", marginTop: 4 }, children: plot.treatmentLabel }),
        plot.areaHa && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", color: "#9ca3af", marginTop: 2 }, children: [
          fmtNum(plot.areaHa),
          " ha",
          plot.replicationBlock ? ` · Block ${plot.replicationBlock}` : ""
        ] }),
        plot.latitude && plot.longitude && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.7rem", color: "#16a34a", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 10 }),
          " ",
          parseFloat(plot.latitude).toFixed(5),
          ", ",
          parseFloat(plot.longitude).toFixed(5)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            setSelectedPlot(plot);
            setDetailTab("treatments");
            setAddTreatmentOpen(true);
          }, style: { display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "3px 8px", borderRadius: 5, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", color: "#374151" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TestTube, { size: 11 }),
            " Treatment"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            setSelectedPlot(plot);
            setDetailTab("observations");
            setAddObsOpen(true);
          }, style: { display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "3px 8px", borderRadius: 5, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", color: "#374151" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 11 }),
            " Observe"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            setSelectedPlot(plot);
            setDetailTab("results");
            setAddYieldOpen(true);
          }, style: { display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", padding: "3px 8px", borderRadius: 5, border: "1px solid #22c55e", background: "#f0fdf4", cursor: "pointer", color: "#16a34a", fontWeight: 600 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 11 }),
            " Yield"
          ] })
        ] }),
        plot.yields.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 8, padding: "6px 10px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #bbf7d0" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.75rem", fontWeight: 700, color: "#16a34a" }, children: [
            "Yield: ",
            fmtNum(plot.yields[0].yieldTha, 3),
            " t/ha"
          ] }),
          plot.yields[0].moisturePercent && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.7rem", color: "#6b7280" }, children: [
            "Moisture: ",
            fmtNum(plot.yields[0].moisturePercent, 1),
            "%"
          ] })
        ] })
      ] }, plot.id)) })
    ] }),
    detailTab === "treatments" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "All treatment applications across all plots in this trial." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedPlot ? String(selectedPlot.id) : "", onValueChange: (v) => setSelectedPlot(trial.plots.find((p) => String(p.id) === v) ?? null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 180, fontSize: "0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select plot…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: trial.plots.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
              "Plot ",
              p.plotNumber,
              p.isControl ? " (Control)" : ""
            ] }, p.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: !selectedPlot, onClick: () => setAddTreatmentOpen(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
            " Log Treatment"
          ] })
        ] })
      ] }),
      trial.plots.every((p) => true) && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "24px 0" }, children: 'Select a plot above then click "Log Treatment" to record what was applied.' })
    ] }),
    detailTab === "observations" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "Growth stage assessments, disease and pest observations per plot." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedPlot ? String(selectedPlot.id) : "", onValueChange: (v) => setSelectedPlot(trial.plots.find((p) => String(p.id) === v) ?? null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 180, fontSize: "0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select plot…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: trial.plots.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
              "Plot ",
              p.plotNumber,
              p.isControl ? " (Control)" : ""
            ] }, p.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: !selectedPlot, onClick: () => setAddObsOpen(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
            " Record Observation"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#9ca3af", fontSize: "0.875rem", textAlign: "center", padding: "24px 0" }, children: 'Select a plot above then click "Record Observation" to log growth stage and crop health data.' })
    ] }),
    detailTab === "results" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "1rem", color: "#111827", margin: 0 }, children: "Yield Comparison" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedPlot ? String(selectedPlot.id) : "", onValueChange: (v) => setSelectedPlot(trial.plots.find((p) => String(p.id) === v) ?? null), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 180, fontSize: "0.875rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Record yield for plot…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: trial.plots.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(p.id), children: [
              "Plot ",
              p.plotNumber,
              p.isControl ? " (Control)" : ""
            ] }, p.id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", disabled: !selectedPlot, onClick: () => setAddYieldOpen(true), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 13, className: "mr-1" }),
            " Record Yield"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(YieldComparisonTable, { plots: trial.plots }) })
    ] }),
    detailTab === "comms" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280", margin: 0 }, children: "Correspondence log — emails, calls, letters and meetings with the conducting body." }),
          (trial.contactName || trial.contactEmail || trial.contactPhone) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap", fontSize: "0.8125rem", color: "#374151" }, children: [
            trial.contactName && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "flex", alignItems: "center", gap: 5 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 13, style: { color: "#6b7280" } }),
              trial.contactName
            ] }),
            trial.contactEmail && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `mailto:${trial.contactEmail}`, style: { display: "flex", alignItems: "center", gap: 5, color: "#2563eb", textDecoration: "none" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 13 }),
              trial.contactEmail
            ] }),
            trial.contactPhone && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: `tel:${trial.contactPhone}`, style: { display: "flex", alignItems: "center", gap: 5, color: "#2563eb", textDecoration: "none" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 13 }),
              trial.contactPhone
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setAddCommOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
          " Log Communication"
        ] })
      ] }),
      commsQ.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "center", padding: "40px 0" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 22, className: "animate-spin", style: { color: "#9ca3af" } }) }) : comms.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "40px 20px", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 32, style: { margin: "0 auto 8px", opacity: 0.3 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No communications logged yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Record emails, phone calls, letters and meetings with the trial body here." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8 }, children: comms.map((c) => {
        const typeIcons = { email: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 13 }), letter: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 13 }), phone: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 13 }), meeting: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 13 }), "site visit": /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 13 }), "video call": /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 13 }) };
        const dirColor = c.direction === "inbound" ? { bg: "#eff6ff", border: "#bfdbfe", badge: "#2563eb" } : { bg: "#f0fdf4", border: "#bbf7d0", badge: "#16a34a" };
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "12px 14px", border: `1px solid ${dirColor.border}`, borderRadius: 8, background: dirColor.bg }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 700, background: dirColor.badge, color: "#fff" }, children: [
                c.direction === "inbound" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownLeft, { size: 11 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { size: 11 }),
                c.direction === "inbound" ? "Received" : "Sent"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#6b7280", padding: "2px 8px", background: "#f3f4f6", borderRadius: 10 }, children: [
                typeIcons[c.commType] ?? /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { size: 11 }),
                " ",
                c.commType.charAt(0).toUpperCase() + c.commType.slice(1)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.8125rem", color: "#374151", fontWeight: 600 }, children: c.subject })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#9ca3af", whiteSpace: "nowrap" }, children: new Date(c.commDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => deleteCommMut.mutate(c.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
            ] })
          ] }),
          c.summary && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.8125rem", color: "#6b7280", marginTop: 6, marginBottom: 0 }, children: c.summary })
        ] }, c.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addCommOpen, onOpenChange: (o) => {
      if (!o) {
        setAddCommOpen(false);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 460 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log Communication" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: commForm.commDate, onChange: (e) => setCommForm((f) => ({ ...f, commDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: commForm.commType, onValueChange: (v) => setCommForm((f) => ({ ...f, commType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "email", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "letter", children: "Letter" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "phone", children: "Phone call" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "meeting", children: "Meeting" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "site visit", children: "Site visit" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "video call", children: "Video call" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Direction *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 8, marginTop: 6 }, children: [["inbound", "Received / Incoming", "#eff6ff", "#2563eb"], ["outbound", "Sent / Outgoing", "#f0fdf4", "#16a34a"]].map(([val, label, bg, color]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setCommForm((f) => ({ ...f, direction: val })),
              style: { flex: 1, padding: "8px 12px", borderRadius: 7, border: `2px solid ${commForm.direction === val ? color : "#e5e7eb"}`, background: commForm.direction === val ? bg : "#fff", cursor: "pointer", fontSize: "0.8125rem", fontWeight: commForm.direction === val ? 700 : 400, color: commForm.direction === val ? color : "#6b7280" },
              children: [
                val === "inbound" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownLeft, { size: 13, style: { display: "inline", marginRight: 4 } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { size: 13, style: { display: "inline", marginRight: 4 } }),
                label
              ]
            },
            val
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Subject *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: commForm.subject, onChange: (e) => setCommForm((f) => ({ ...f, subject: e.target.value })), placeholder: "e.g. Protocol agreement, Results summary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes / Summary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 3, value: commForm.summary, onChange: (e) => setCommForm((f) => ({ ...f, summary: e.target.value })), placeholder: "Key points, decisions, action items…" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddCommOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !commForm.commDate || !commForm.subject.trim() || addCommMut.isPending, onClick: () => addCommMut.mutate(commForm), children: "Log Communication" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addPlotOpen, onOpenChange: (o) => {
      if (!o) setAddPlotOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 460 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Trial Plot" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Plot Number / ID *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: plotForm.plotNumber, onChange: (e) => setPlotForm((f) => ({ ...f, plotNumber: e.target.value })), placeholder: "e.g. T1, A1, Plot-3" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Replication Block" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: plotForm.replicationBlock, onChange: (e) => setPlotForm((f) => ({ ...f, replicationBlock: e.target.value })), placeholder: "e.g. Block 1, Rep A" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Label" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: plotForm.treatmentLabel, onChange: (e) => setPlotForm((f) => ({ ...f, treatmentLabel: e.target.value })), placeholder: "e.g. Variety A @ 170 kg N/ha" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Plot Area (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", className: "mt-1", value: plotForm.areaHa, onChange: (e) => setPlotForm((f) => ({ ...f, areaHa: e.target.value })), placeholder: "e.g. 0.1250" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Location in Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: plotForm.locationDescription, onChange: (e) => setPlotForm((f) => ({ ...f, locationDescription: e.target.value })), placeholder: "e.g. North strip, rows 1–8" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { padding: "10px 12px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 7 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { marginBottom: 0 }, children: "GPS Coordinates (optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "outline", size: "sm", onClick: captureGPS, disabled: gpsCapturing, style: { height: 26, fontSize: "0.75rem", gap: 4 }, children: [
              gpsCapturing ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 11, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { size: 11 }),
              gpsCapturing ? "Getting…" : "Use GPS"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.75rem", color: "#6b7280" }, children: "Latitude" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: plotForm.latitude, onChange: (e) => setPlotForm((f) => ({ ...f, latitude: e.target.value })), placeholder: "e.g. 52.4862", style: { fontFamily: "monospace", fontSize: "0.8125rem" } })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { style: { fontSize: "0.75rem", color: "#6b7280" }, children: "Longitude" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: plotForm.longitude, onChange: (e) => setPlotForm((f) => ({ ...f, longitude: e.target.value })), placeholder: "e.g. -1.8904", style: { fontFamily: "monospace", fontSize: "0.8125rem" } })
            ] })
          ] }),
          plotForm.latitude && plotForm.longitude && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.7rem", color: "#0369a1", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 10 }),
            " ",
            parseFloat(plotForm.latitude).toFixed(5),
            ", ",
            parseFloat(plotForm.longitude).toFixed(5)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fefce8", border: "1px solid #fde047", borderRadius: 7 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "isControl", checked: plotForm.isControl, onChange: (e) => setPlotForm((f) => ({ ...f, isControl: e.target.checked })), style: { width: 15, height: 15 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "isControl", style: { fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }, children: "This is the control plot (untreated / standard practice)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddPlotOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !plotForm.plotNumber.trim(), onClick: () => addPlotMut.mutate(plotForm), children: "Add Plot" })
      ] })
    ] }) }),
    deletePlotId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setDeletePlotId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 360 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Plot?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "This will permanently remove this plot and all its treatments, observations and yield data." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeletePlotId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => deletePlotMut.mutate(deletePlotId), children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addTreatmentOpen, onOpenChange: (o) => {
      if (!o) setAddTreatmentOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Log Treatment — Plot ",
        selectedPlot?.plotNumber
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: txForm.treatmentDate, onChange: (e) => setTxForm((f) => ({ ...f, treatmentDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: txForm.treatmentType, onValueChange: (v) => setTxForm((f) => ({ ...f, treatmentType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TREATMENT_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product / Variety Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: txForm.productName, onChange: (e) => setTxForm((f) => ({ ...f, productName: e.target.value })), placeholder: "e.g. Crusoe, Kerb 500 SC, Latitude" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Rate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", className: "mt-1", value: txForm.applicationRate, onChange: (e) => setTxForm((f) => ({ ...f, applicationRate: e.target.value })), placeholder: "e.g. 170" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Unit" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: txForm.unit, onChange: (e) => setTxForm((f) => ({ ...f, unit: e.target.value })), placeholder: "kg/ha, L/ha" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, className: "mt-1", value: txForm.notes, onChange: (e) => setTxForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddTreatmentOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !txForm.treatmentDate || !txForm.treatmentType || addTreatmentMut.isPending, onClick: () => addTreatmentMut.mutate(txForm), children: "Save Treatment" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addObsOpen, onOpenChange: (o) => {
      if (!o) setAddObsOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Record Observation — Plot ",
        selectedPlot?.plotNumber
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: obsForm.observationDate, onChange: (e) => setObsForm((f) => ({ ...f, observationDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Growth Stage (BBCH)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: obsForm.growthStage, onValueChange: (v) => setObsForm((f) => ({ ...f, growthStage: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: GROWTH_STAGES.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: g, children: g }, g)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Plant Count/m²" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "mt-1", value: obsForm.plantCount, onChange: (e) => setObsForm((f) => ({ ...f, plantCount: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Height (cm)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", className: "mt-1", value: obsForm.plantHeightCm, onChange: (e) => setObsForm((f) => ({ ...f, plantHeightCm: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Condition" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: obsForm.generalCondition, onValueChange: (v) => setObsForm((f) => ({ ...f, generalCondition: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CONDITION_OPTIONS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "diseasePresent", checked: obsForm.diseasePresent, onChange: (e) => setObsForm((f) => ({ ...f, diseasePresent: e.target.checked })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "diseasePresent", style: { fontSize: "0.875rem", cursor: "pointer" }, children: "Disease present" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", id: "pestPresent", checked: obsForm.pestPresent, onChange: (e) => setObsForm((f) => ({ ...f, pestPresent: e.target.checked })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "pestPresent", style: { fontSize: "0.875rem", cursor: "pointer" }, children: "Pest present" })
          ] })
        ] }),
        obsForm.diseasePresent && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Disease Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: obsForm.diseaseName, onChange: (e) => setObsForm((f) => ({ ...f, diseaseName: e.target.value })), placeholder: "e.g. Septoria tritici, Fusarium, Mildew" })
        ] }),
        obsForm.pestPresent && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pest Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: obsForm.pestName, onChange: (e) => setObsForm((f) => ({ ...f, pestName: e.target.value })), placeholder: "e.g. BYDV aphids, Orange wheat blossom midge" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, className: "mt-1", value: obsForm.notes, onChange: (e) => setObsForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddObsOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !obsForm.observationDate || addObsMut.isPending, onClick: () => addObsMut.mutate(obsForm), children: "Save Observation" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addYieldOpen, onOpenChange: (o) => {
      if (!o) setAddYieldOpen(false);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 500 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Record Harvest Yield — Plot ",
        selectedPlot?.plotNumber
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 12 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Harvest Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: yieldForm.harvestDate, onChange: (e) => setYieldForm((f) => ({ ...f, harvestDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Fresh Weight (kg)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", className: "mt-1", value: yieldForm.freshWeightKg, onChange: (e) => {
              const v = e.target.value;
              setYieldForm((f) => ({ ...f, freshWeightKg: v, yieldTha: "" }));
            }, placeholder: "Total plot weight" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", className: "mt-1", value: yieldForm.moisturePercent, onChange: (e) => {
              const v = e.target.value;
              setYieldForm((f) => ({ ...f, moisturePercent: v, yieldTha: "" }));
            }, placeholder: "e.g. 15.2" })
          ] })
        ] }),
        yieldForm.freshWeightKg && yieldForm.moisturePercent && selectedPlot?.areaHa && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { padding: "8px 12px", background: "#f0fdf4", borderRadius: 7, border: "1px solid #bbf7d0" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8125rem", color: "#16a34a", fontWeight: 600 }, children: [
          "Calculated yield: ",
          computeYieldTha(),
          " t/ha (at 14% moisture equivalent)"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Yield (t/ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.001", className: "mt-1", value: yieldForm.yieldTha || computeYieldTha(), onChange: (e) => setYieldForm((f) => ({ ...f, yieldTha: e.target.value })), placeholder: "Override if known" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Protein %" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", className: "mt-1", value: yieldForm.grainProteinPercent, onChange: (e) => setYieldForm((f) => ({ ...f, grainProteinPercent: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Spec. Weight" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", className: "mt-1", value: yieldForm.specificWeight, onChange: (e) => setYieldForm((f) => ({ ...f, specificWeight: e.target.value })), placeholder: "kg/hl" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 2, className: "mt-1", value: yieldForm.notes, onChange: (e) => setYieldForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddYieldOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !yieldForm.harvestDate || addYieldMut.isPending, onClick: () => addYieldMut.mutate({ ...yieldForm, yieldTha: yieldForm.yieldTha || computeYieldTha() || null }), children: "Save Yield" })
      ] })
    ] }) })
  ] });
}
const TRIALS_BODIES = [
  "AHDB",
  "NIAB",
  "NIAB TAG",
  "Agrii",
  "Frontier Agriculture",
  "Hutchinsons",
  "ProCam",
  "Velcourt",
  "KWS",
  "Limagrain",
  "Bayer Crop Science",
  "Syngenta",
  "Corteva Agriscience",
  "DSV Seeds",
  "RAGT Seeds",
  "Elsoms Seeds",
  "BASIS",
  "Own Farm"
];
const EMPTY_TRIAL = { trialName: "", season: cropYearLabel(currentCropYear()), cropName: "", cropOther: "", trialPurpose: "", trialType: "", trialsBody: "", trialsBodyOther: "", contactName: "", contactEmail: "", contactPhone: "", numberOfTreatments: "", numberOfReplications: "", totalAreaHa: "", startDate: "", endDate: "", status: "planned", fieldId: "", notes: "" };
function CropTrialsPage() {
  const { farmId } = useAppStore();
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then((r) => r.json()),
    enabled: !!farmId
  });
  const fieldsQuery = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then((r) => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? []
  });
  const fields = fieldsQuery.data ?? [];
  const q = useQuery({
    queryKey: ["crop-trials", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-trials`).then((r) => r.json()),
    enabled: !!farmId
  });
  const trials = q.data?.records ?? [];
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editItem, setEditItem] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [selectedTrial, setSelectedTrial] = reactExports.useState(null);
  const [statusFilter, setStatusFilter] = reactExports.useState("all");
  const [cropYear, setCropYear] = reactExports.useState(currentCropYear());
  const [viewMode, setViewMode] = reactExports.useState("list");
  const [form, setForm] = reactExports.useState({ ...EMPTY_TRIAL });
  function openAdd() {
    setEditItem(null);
    setForm({ ...EMPTY_TRIAL });
    setAddOpen(true);
  }
  function openEdit(t) {
    setEditItem(t);
    const existingCrop = t.cropName ?? "";
    const isKnown = CROP_OPTIONS.includes(existingCrop);
    setForm({
      trialName: t.trialName,
      season: t.season ?? cropYearLabel(currentCropYear()),
      cropName: isKnown ? existingCrop : existingCrop ? "Other" : "",
      cropOther: isKnown ? "" : existingCrop,
      trialPurpose: t.trialPurpose,
      trialType: t.trialType ?? "",
      trialsBody: TRIALS_BODIES.includes(t.trialsBody ?? "") ? t.trialsBody ?? "" : t.trialsBody ? "__other__" : "",
      trialsBodyOther: TRIALS_BODIES.includes(t.trialsBody ?? "") ? "" : t.trialsBody ?? "",
      contactName: t.contactName ?? "",
      contactEmail: t.contactEmail ?? "",
      contactPhone: t.contactPhone ?? "",
      numberOfTreatments: t.numberOfTreatments ? String(t.numberOfTreatments) : "",
      numberOfReplications: t.numberOfReplications ? String(t.numberOfReplications) : "",
      totalAreaHa: t.totalAreaHa ?? "",
      startDate: t.startDate ?? "",
      endDate: t.endDate ?? "",
      status: t.status,
      fieldId: t.fieldId ? String(t.fieldId) : "",
      notes: t.notes ?? ""
    });
    setAddOpen(true);
  }
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/crop-trials`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Trial created" });
      qc.invalidateQueries({ queryKey: ["crop-trials", farmId] });
      setAddOpen(false);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/crop-trials/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Trial updated" });
      qc.invalidateQueries({ queryKey: ["crop-trials", farmId] });
      setAddOpen(false);
      setEditItem(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/crop-trials/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Trial deleted" });
      qc.invalidateQueries({ queryKey: ["crop-trials", farmId] });
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function handleSave() {
    const resolvedCrop = form.cropName === "Other" ? form.cropOther.trim() : form.cropName;
    const resolvedBody = form.trialsBody === "__other__" ? form.trialsBodyOther.trim() : form.trialsBody;
    const { trialsBodyOther: _drop, ...rest } = form;
    const body = {
      ...rest,
      cropName: resolvedCrop,
      trialsBody: resolvedBody || null,
      fieldId: form.fieldId && form.fieldId !== "__none__" ? parseInt(form.fieldId) : null,
      numberOfTreatments: form.numberOfTreatments ? parseInt(String(form.numberOfTreatments)) : null,
      numberOfReplications: form.numberOfReplications ? parseInt(String(form.numberOfReplications)) : null
    };
    if (editItem) updateMut.mutate({ id: editItem.id, body });
    else createMut.mutate(body);
  }
  const seasonOptions = getSeasonOptions();
  const currentTrial = selectedTrial ? trials.find((t) => t.id === selectedTrial.id) ?? null : null;
  const filtered = (statusFilter === "all" ? trials : trials.filter((t) => t.status === statusFilter)).filter((t) => !t.startDate || isInCropYear(t.startDate, cropYear));
  function handlePrint() {
    const farm = farmData?.record;
    const rows = filtered.map((t) => {
      const field = fields.find((f) => f.id === t.fieldId);
      const plotsWithYield = t.plots.filter((p) => p.yields.length > 0);
      const control = plotsWithYield.find((p) => p.isControl);
      const ctrlY = control?.yields[0]?.yieldTha ? parseFloat(control.yields[0].yieldTha) : null;
      return `<tr>
        <td><strong>${t.trialName}</strong></td>
        <td style="white-space:nowrap">${t.season ?? "—"}</td>
        <td>${t.cropName ?? "—"}</td>
        <td>${field?.name ?? "—"}</td>
        <td>${t.trialPurpose}</td>
        <td>${t.trialsBody ?? "—"}</td>
        <td>${t.plots.length}</td>
        <td style="white-space:nowrap">${ctrlY != null ? ctrlY.toFixed(3) + " t/ha" : "—"}</td>
        <td>${STATUS_MAP[t.status]?.label ?? t.status}</td>
      </tr>`;
    }).join("");
    const tableHtml = `<table><thead><tr>
      <th>Trial Name</th><th>Season</th><th>Crop</th><th>Field</th><th>Purpose</th><th>Trials Body</th><th>Plots</th><th>Control Yield</th><th>Status</th>
    </tr></thead><tbody>${rows}</tbody></table>`;
    printProReport({
      title: "Crop Trials Register",
      farmName: farm?.name,
      cphNumber: farm?.cphNumber ?? void 0,
      redTractorId: farm?.redTractorId ?? void 0,
      recordCount: filtered.length,
      recordLabel: "trial",
      extraMeta: `Crop Year: ${cropYearLabel(cropYear)}`,
      tableHtml
    });
  }
  if (currentTrial) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { maxWidth: 1100, margin: "0 auto", padding: "0 8px" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrialDetailView, { trial: currentTrial, farmId, onBack: () => setSelectedTrial(null), fields }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto", padding: "0 8px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { style: { fontSize: "1.5rem", fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { size: 22, style: { color: "#2563eb" } }),
          " Crop Trials Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem", marginTop: 4 }, children: "Record on-farm variety and input trials — plot design, treatment applications, growth observations and yield comparisons." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", onClick: handlePrint, disabled: !farmId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-2" }),
          " Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, disabled: !farmId, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          " New Trial"
        ] })
      ] })
    ] }),
    !farmId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, style: { flexShrink: 0, marginTop: 1, color: "#d97706" } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#92400e" }, children: "Select a farm from the sidebar to view and manage crop trials." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "space-between" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }, children: [
          ["all", "planned", "active", "harvested", "completed", "cancelled"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setStatusFilter(s),
              style: {
                padding: "4px 12px",
                borderRadius: 20,
                fontSize: "0.8125rem",
                cursor: "pointer",
                fontWeight: statusFilter === s ? 600 : 400,
                background: statusFilter === s ? "#111827" : "#f3f4f6",
                color: statusFilter === s ? "#fff" : "#374151",
                border: "1px solid " + (statusFilter === s ? "#111827" : "#e5e7eb")
              },
              children: s === "all" ? `All (${trials.length})` : STATUS_MAP[s]?.label ?? s
            },
            s
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CropYearSelector, { value: cropYear, onChange: setCropYear })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", flexShrink: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setViewMode("list"), style: { display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", border: "none", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500, background: viewMode === "list" ? "#111827" : "#f9fafb", color: viewMode === "list" ? "#fff" : "#374151" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(List, { size: 13 }),
            " List"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setViewMode("map"), style: { display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", border: "none", borderLeft: "1px solid #e5e7eb", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 500, background: viewMode === "map" ? "#111827" : "#f9fafb", color: viewMode === "map" ? "#fff" : "#374151" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { size: 13 }),
            " Map"
          ] })
        ] })
      ] }),
      viewMode === "map" ? /* @__PURE__ */ jsxRuntimeExports.jsx(TrialMapView, { trials: filtered, cropYear }) : q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { color: "#6b7280", fontSize: "0.875rem" }, children: "Loading…" }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "4rem 1rem", color: "#9ca3af" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FlaskConical, { size: 40, style: { margin: "0 auto 10px", opacity: 0.2, color: "#2563eb" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151", fontSize: "1rem" }, children: "No trials recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Use this register to log on-farm variety trials, input response trials, and agronomist or AHDB-coordinated plot experiments." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", style: { marginTop: 16 }, onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 13, className: "mr-1" }),
          " Create first trial"
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gap: 12 }, children: filtered.map((trial) => {
        const field = fields.find((f) => f.id === trial.fieldId);
        const plotsWithYield = trial.plots.filter((p) => p.yields.length > 0);
        const control = plotsWithYield.find((p) => p.isControl);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            style: { border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px 18px", background: "#fff", cursor: "pointer", transition: "box-shadow 0.15s" },
            onClick: () => setSelectedTrial(trial),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1 }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }, children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { style: { fontWeight: 700, fontSize: "1rem", color: "#111827", margin: 0 }, children: trial.trialName }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: trial.status })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.8125rem", color: "#6b7280", marginTop: 4 }, children: [
                    trial.cropName && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      trial.cropName,
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { margin: "0 6px" }, children: "·" })
                    ] }),
                    trial.trialPurpose,
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { margin: "0 6px" }, children: "·" }),
                    field ? field.name : "No field assigned",
                    trial.season && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { margin: "0 6px" }, children: "·" }),
                      trial.season
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }, onClick: (e) => e.stopPropagation(), children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28 }, onClick: () => openEdit(trial), children: "Edit" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", style: { fontSize: "0.75rem", height: 28, color: "#dc2626" }, onClick: () => setDeleteId(trial.id), children: "Delete" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#374151" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { size: 13, style: { color: "#16a34a" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: trial.plots.length }),
                    " plots"
                  ] })
                ] }),
                trial.trialsBody && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8125rem", color: "#6b7280" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Body:" }),
                  " ",
                  trial.trialsBody
                ] }),
                control?.yields[0]?.yieldTha && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#374151" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Wheat, { size: 13, style: { color: "#a16207" } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Control: ",
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                      parseFloat(control.yields[0].yieldTha).toFixed(3),
                      " t/ha"
                    ] })
                  ] })
                ] }),
                trial.startDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8125rem", color: "#9ca3af" }, children: [
                  fmt(trial.startDate),
                  trial.endDate ? ` – ${fmt(trial.endDate)}` : ""
                ] })
              ] })
            ]
          },
          trial.id
        );
      }) })
    ] }),
    addOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (o) => {
      if (!o) {
        setAddOpen(false);
        setEditItem(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 560, maxHeight: "85vh", overflowY: "auto" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editItem ? "Edit Trial" : "Create New Trial" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gap: 14 }, children: [
        editItem && form.startDate && new Date(form.startDate) <= /* @__PURE__ */ new Date() && form.status === "planned" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 7, background: "#fffbeb", border: "1px solid #fde68a", fontSize: "0.8125rem", color: "#92400e" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 15, style: { flexShrink: 0, marginTop: 1, color: "#d97706" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "The start date has passed — consider changing the status to ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Active" }),
            "."
          ] })
        ] }),
        editItem && editItem.plots.some((p) => p.yields.length > 0) && form.status === "active" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", borderRadius: 7, background: "#f0fdf4", border: "1px solid #bbf7d0", fontSize: "0.8125rem", color: "#166534" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 15, style: { flexShrink: 0, marginTop: 1, color: "#16a34a" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Yield data has been recorded on at least one plot — consider changing the status to ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Harvested" }),
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trial Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.trialName, onChange: (e) => setForm((f) => ({ ...f, trialName: e.target.value })), placeholder: "e.g. Winter wheat variety trial 2025/26" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.cropName, onValueChange: (v) => setForm((f) => ({ ...f, cropName: v, cropOther: v !== "Other" ? "" : f.cropOther })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select crop…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: CROP_OPTIONS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c, children: c }, c)) })
            ] }),
            form.cropName === "Other" && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: form.cropOther, onChange: (e) => setForm((f) => ({ ...f, cropOther: e.target.value })), placeholder: "Specify crop…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Season" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.season, onValueChange: (v) => setForm((f) => ({ ...f, season: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select season…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: seasonOptions.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: s, children: s }, s)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trial Purpose *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.trialPurpose, onValueChange: (v) => setForm((f) => ({ ...f, trialPurpose: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select purpose…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TRIAL_PURPOSES.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: p, children: p }, p)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trial Design" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.trialType, onValueChange: (v) => setForm((f) => ({ ...f, trialType: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: TRIAL_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: t }, t)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fieldId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, fieldId: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "None specified" }),
                fields.map((fld) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(fld.id), children: fld.name }, fld.id))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Conducting Body *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.trialsBody, onValueChange: (v) => setForm((f) => ({ ...f, trialsBody: v, trialsBodyOther: v !== "__other__" ? "" : f.trialsBodyOther })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select conducting body…" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                TRIALS_BODIES.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: b, children: b }, b)),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "— Other (specify below) —" })
              ] })
            ] }),
            form.trialsBody === "__other__" && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", value: form.trialsBodyOther, onChange: (e) => setForm((f) => ({ ...f, trialsBodyOther: e.target.value })), placeholder: "Enter conducting body name…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact / Agronomist" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", value: form.contactName, onChange: (e) => setForm((f) => ({ ...f, contactName: e.target.value })), placeholder: "Name of lead contact" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", type: "email", value: form.contactEmail, onChange: (e) => setForm((f) => ({ ...f, contactEmail: e.target.value })), placeholder: "contact@example.com" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-1", type: "tel", value: form.contactPhone, onChange: (e) => setForm((f) => ({ ...f, contactPhone: e.target.value })), placeholder: "+44 7700 000000" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "# Treatments" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", className: "mt-1", value: form.numberOfTreatments, onChange: (e) => setForm((f) => ({ ...f, numberOfTreatments: e.target.value })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 3 }, children: "Number of different treatments or varieties being compared" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "# Reps / Blocks" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "1", className: "mt-1", value: form.numberOfReplications, onChange: (e) => setForm((f) => ({ ...f, numberOfReplications: e.target.value })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", color: "#9ca3af", marginTop: 3 }, children: "How many times each treatment is repeated across the field" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Area (ha)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", className: "mt-1", value: form.totalAreaHa, onChange: (e) => setForm((f) => ({ ...f, totalAreaHa: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.startDate, onChange: (e) => setForm((f) => ({ ...f, startDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", className: "mt-1", value: form.endDate, onChange: (e) => setForm((f) => ({ ...f, endDate: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.75rem", color: "#6b7280", marginTop: 2, marginBottom: 6 }, children: "Update manually as the trial progresses — no automatic changes occur." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 6 }, children: Object.entries(STATUS_MAP).map(([k, s]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setForm((f) => ({ ...f, status: k })),
              style: {
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "7px 12px",
                borderRadius: 8,
                cursor: "pointer",
                textAlign: "left",
                background: form.status === k ? s.bg : "#f9fafb",
                border: `1px solid ${form.status === k ? s.border : "#e5e7eb"}`
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { minWidth: 80, fontWeight: 600, fontSize: "0.8125rem", color: form.status === k ? s.color : "#374151" }, children: s.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.75rem", color: "#6b7280" }, children: STATUS_DESCRIPTIONS[k] })
              ]
            },
            k
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { className: "mt-1", rows: 2, value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setAddOpen(false);
          setEditItem(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { disabled: !form.trialName.trim() || !form.trialPurpose || !form.trialsBody || form.trialsBody === "__other__" && !form.trialsBodyOther.trim() || createMut.isPending || updateMut.isPending, onClick: handleSave, children: editItem ? "Update Trial" : "Create Trial" })
      ] })
    ] }) }),
    deleteId !== null && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setDeleteId(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 380 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Trial?" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem", color: "#6b7280" }, children: "This will permanently remove this trial and all its plots, treatments, observations and yield data. This cannot be undone." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: { background: "#dc2626", color: "#fff" }, onClick: () => deleteMut.mutate(deleteId), children: "Delete" })
      ] })
    ] }) })
  ] }) });
}
export {
  CropTrialsPage as default
};
