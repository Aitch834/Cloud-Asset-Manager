const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/leaflet-src-B5dl3png.js","assets/index-CpnbykXG.js","assets/index-CNUbH-zj.css"])))=>i.map(i=>d[i]);
import { r as reactExports, b as useAppStore, _ as __vitePreload, j as jsxRuntimeExports, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, H as DialogDescription, J as DialogFooter, c as Button, l as useQuery, R as Redirect, m as Card, n as CardContent, t as useQueryClient, a as useToast, O as useMutation, S as Plus, d as LoaderCircle, L as Label, I as Input, C as Checkbox, K as Map } from "./index-CpnbykXG.js";
import { L as LabSelector } from "./LabSelector-D7apkjs3.js";
import { P as Printer } from "./printer-DJQ6f7jK.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip, L as Legend, B as Bar } from "./generateCategoricalChart-D6iBirZQ.js";
import { B as BarChart } from "./BarChart-DYiBYYkk.js";
import { C as CartesianGrid } from "./CartesianGrid-DLTTajXx.js";
import { L as Leaf, T as TriangleAlert } from "./triangle-alert-Cvpir6S0.js";
import { C as ChevronUp } from "./chevron-up-BPSVcmbE.js";
import { C as ChevronDown, T as Trash2 } from "./trash-2-D5ek_DDV.js";
import { A as AppLayout, W as Warehouse, T as TrendingUp, R as RotateCcw } from "./AppLayout-DrvSP1zp.js";
import { T as Textarea } from "./textarea-3imHyGnC.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BfKqAspQ.js";
import { T as TabBar, a as TabButton } from "./tab-button-BqQypJtj.js";
import { u as useFarmMembers } from "./use-farm-members-BKGGwgpP.js";
import { S as StaffSelect } from "./staff-select-D8O729XX.js";
import { L as LayoutGrid } from "./layout-grid-Bji9_PQ2.js";
import { D as Droplets } from "./shield-alert-DInfJqHd.js";
import { P as Package } from "./use-safe-clerk-Bd2bZQfW.js";
import { T as Thermometer } from "./thermometer-CKBn4TqT.js";
import { E as Eye } from "./eye-BHgYk9pi.js";
import { P as Pencil } from "./pencil-CAxDELIF.js";
import { A as Archive } from "./archive-B5GGRLj5.js";
import "./database-CNPrPUp0.js";
import "./shield-check-B8hTAzr3.js";
import "./tractor-XF3P5S-Y.js";
import "./index-DAEqPYnR.js";
import "./index-yfTt6Ofj.js";
function shoelaceHectares(pts) {
  if (pts.length < 3) return 0;
  const R = 6371e3;
  let area = 0;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = pts[i].lng * Math.PI / 180 * R * Math.cos(pts[i].lat * Math.PI / 180);
    const yi = pts[i].lat * Math.PI / 180 * R;
    const xj = pts[j].lng * Math.PI / 180 * R * Math.cos(pts[j].lat * Math.PI / 180);
    const yj = pts[j].lat * Math.PI / 180 * R;
    area += xi * yj - xj * yi;
  }
  return Math.abs(area / 2) / 1e4;
}
function destroyMap(ctx) {
  if (!ctx) return;
  try {
    ctx.map.off();
    ctx.map.remove();
  } catch {
  }
}
function BlockBoundaryMapDialog({ blockId, blockName, open, onClose, onSaved }) {
  const mapRef = reactExports.useRef(null);
  const leafletRef = reactExports.useRef(null);
  const { farmId } = useAppStore();
  const [points, setPoints] = reactExports.useState([]);
  const [area, setArea] = reactExports.useState(0);
  const [saving, setSaving] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [leafletReady, setLeafletReady] = reactExports.useState(false);
  const [existingBoundary, setExistingBoundary] = reactExports.useState(null);
  reactExports.useEffect(() => {
    if (open) {
      __vitePreload(() => import("./leaflet-src-B5dl3png.js").then((n) => n.l), true ? __vite__mapDeps([0,1,2]) : void 0).then((L) => {
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
    } else {
      destroyMap(leafletRef.current);
      leafletRef.current = null;
      setPoints([]);
      setArea(0);
      setError(null);
      setExistingBoundary(null);
      setLeafletReady(false);
    }
  }, [open]);
  reactExports.useEffect(() => {
    if (!open || !farmId) return;
    fetch(`/api/farms/${farmId}/horticulture-blocks/${blockId}/boundary`, {
      credentials: "include"
    }).then((r) => r.json()).then((d) => {
      if (d.boundary?.polygonPoints) {
        setExistingBoundary(d.boundary.polygonPoints);
      }
    }).catch(() => {
    });
  }, [open, farmId, blockId]);
  reactExports.useEffect(() => {
    if (!open || !leafletReady || !mapRef.current) return;
    const L = window["_L"];
    destroyMap(leafletRef.current);
    leafletRef.current = null;
    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: true }).setView([52.2, -1], 13);
    map.scrollWheelZoom.enable();
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
        maxZoom: 20
      }
    ).addTo(map);
    leafletRef.current = { map, polygon: null, markers: [] };
    if (existingBoundary && existingBoundary.length >= 3) {
      const latlngs = existingBoundary.map((p) => [p.lat, p.lng]);
      const poly = L.polygon(latlngs, { color: "#16a34a", fillOpacity: 0.2 }).addTo(map);
      leafletRef.current.polygon = poly;
      map.fitBounds(poly.getBounds(), { padding: [40, 40] });
      setPoints(existingBoundary);
      setArea(shoelaceHectares(existingBoundary));
      existingBoundary.forEach((pt) => {
        const marker = L.circleMarker([pt.lat, pt.lng], {
          radius: 6,
          color: "#16a34a",
          fillColor: "#fff",
          fillOpacity: 1,
          weight: 2
        }).addTo(map);
        leafletRef.current.markers.push(marker);
      });
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            map.setView([pos.coords.latitude, pos.coords.longitude], 16);
          },
          () => {
          }
        );
      }
    }
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      setPoints((prev) => {
        const next = [...prev, { lat, lng }];
        setArea(shoelaceHectares(next));
        const ctx = leafletRef.current;
        if (!ctx) return next;
        const marker = L.circleMarker([lat, lng], {
          radius: 6,
          color: "#16a34a",
          fillColor: "#fff",
          fillOpacity: 1,
          weight: 2
        }).addTo(ctx.map);
        ctx.markers.push(marker);
        if (ctx.polygon) ctx.polygon.remove();
        if (next.length >= 3) {
          ctx.polygon = L.polygon(
            next.map((p) => [p.lat, p.lng]),
            { color: "#16a34a", fillOpacity: 0.2 }
          ).addTo(ctx.map);
        }
        return next;
      });
    });
    return () => {
      destroyMap(leafletRef.current);
      leafletRef.current = null;
    };
  }, [open, leafletReady, existingBoundary]);
  const handleUndo = () => {
    setPoints((prev) => {
      const next = prev.slice(0, -1);
      setArea(shoelaceHectares(next));
      const ctx = leafletRef.current;
      if (ctx) {
        const last = ctx.markers.pop();
        if (last) last.remove();
        if (ctx.polygon) ctx.polygon.remove();
        if (next.length >= 3) {
          const L = window["_L"];
          ctx.polygon = L.polygon(
            next.map((p) => [p.lat, p.lng]),
            { color: "#16a34a", fillOpacity: 0.2 }
          ).addTo(ctx.map);
        } else {
          ctx.polygon = null;
        }
      }
      return next;
    });
  };
  const handleClear = () => {
    setPoints([]);
    setArea(0);
    const ctx = leafletRef.current;
    if (ctx) {
      ctx.markers.forEach((m) => m.remove());
      ctx.markers = [];
      if (ctx.polygon) {
        ctx.polygon.remove();
        ctx.polygon = null;
      }
    }
  };
  const handleSave = async () => {
    if (!farmId || points.length < 3) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/farms/${farmId}/horticulture-blocks/${blockId}/boundary`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ polygonPoints: points, areaHectares: area, capturedBy: "web-map" })
      });
      if (!res.ok) throw new Error("Failed to save boundary");
      onSaved(area);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) onClose();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-3xl p-0 gap-0 overflow-hidden rounded-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "px-6 pt-5 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Draw Block Boundary — ",
        blockName
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { children: "Click on the satellite map to place boundary points. Need at least 3 points to close the polygon. Area is calculated automatically." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full", style: { height: 440 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: mapRef, className: "w-full h-full" }),
      !leafletReady && open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-white bg-black/60 rounded-lg px-4 py-2", children: "Loading map…" }) }),
      leafletReady && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 left-3 bg-white rounded-xl shadow-md px-3 py-2 text-sm z-[999] border border-border/40", children: [
        points.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/60", children: "Click map to add points" }),
        points.length > 0 && points.length < 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground/70", children: [
          points.length,
          " point",
          points.length > 1 ? "s" : "",
          " — need ",
          3 - points.length,
          " more"
        ] }),
        points.length >= 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-green-700", children: [
          area.toFixed(2),
          " ha · ",
          points.length,
          " pts"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "px-6 py-4 flex-row items-center gap-2 border-t bg-white", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600 flex-1", children: error }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 ml-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleUndo, disabled: points.length === 0, children: "Undo" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleClear, disabled: points.length === 0, children: "Clear" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: handleSave,
            disabled: points.length < 3 || saving,
            className: "bg-green-600 hover:bg-green-700 text-white",
            children: saving ? "Saving…" : `Save Boundary (${area.toFixed(2)} ha)`
          }
        )
      ] })
    ] })
  ] }) });
}
function fmtDate$1(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function monthLabel(m) {
  return (/* @__PURE__ */ new Date(m + "-01")).toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
}
const PRINT_ID = "fresh-produce-reports-print";
function ensurePrintStyle() {
  if (document.getElementById(PRINT_ID + "-css")) return;
  const s = document.createElement("style");
  s.id = PRINT_ID + "-css";
  s.textContent = `@media print{body>*{display:none!important}#${PRINT_ID}{display:block!important;position:fixed;inset:0;overflow:auto;background:#fff;z-index:99999;padding:24px}.no-print{display:none!important}}`;
  document.head.appendChild(s);
}
function Collapsible({ title, open, setOpen, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full px-4 py-3 flex items-center justify-between text-sm font-semibold hover:bg-muted/30 transition-colors", onClick: () => setOpen(!open), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: title }),
      open ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" })
    ] }),
    open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto border-t border-border", children })
  ] });
}
function KpiCard({ label, value, sub, highlight }) {
  const cls = highlight === "emerald" ? "border-emerald-200 bg-emerald-50/50" : highlight === "amber" ? "border-amber-200 bg-amber-50/50" : highlight === "blue" ? "border-blue-200 bg-blue-50/50" : "border-border bg-card";
  const vCls = highlight === "emerald" ? "text-emerald-700" : highlight === "amber" ? "text-amber-700" : highlight === "blue" ? "text-blue-700" : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-xl border p-3 ${cls}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/50 mb-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-lg font-bold ${vCls}`, children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-foreground/40 mt-0.5", children: sub })
  ] });
}
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-border rounded-lg p-3 text-xs shadow-md space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: label }),
    payload.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { color: p.color }, children: [
      p.name,
      ": ",
      typeof p.value === "number" ? `${p.value.toLocaleString("en-GB")} kg` : p.value
    ] }, p.name))
  ] });
};
function FreshProduceReports({ farmId }) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [year, setYear] = reactExports.useState(currentYear);
  const [openSection, setOpenSection] = reactExports.useState(null);
  const toggle = (s) => setOpenSection((v) => v === s ? null : s);
  const { data: harvestRaw, isLoading: harvestLoading } = useQuery({
    queryKey: ["horti-harvest", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/horticulture-harvest-records`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: cropsRaw } = useQuery({
    queryKey: ["horti-crops", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/horticulture-crops`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const { data: intakeRaw } = useQuery({
    queryKey: ["fp-intake", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fresh-produce-intake`, { credentials: "include" }).then((r) => r.json()),
    enabled: !!farmId
  });
  const allHarvest = reactExports.useMemo(() => Array.isArray(harvestRaw) ? harvestRaw : harvestRaw?.records ?? [], [harvestRaw]);
  const allCrops = reactExports.useMemo(() => Array.isArray(cropsRaw) ? cropsRaw : cropsRaw?.records ?? [], [cropsRaw]);
  const allIntake = reactExports.useMemo(() => Array.isArray(intakeRaw) ? intakeRaw : intakeRaw?.records ?? [], [intakeRaw]);
  const years = reactExports.useMemo(() => {
    const s = /* @__PURE__ */ new Set();
    allHarvest.forEach((r) => {
      const y = parseInt(String(r.harvestDate ?? "").slice(0, 4));
      if (y) s.add(y);
    });
    allIntake.forEach((r) => {
      const y = parseInt(String(r.intakeDate ?? "").slice(0, 4));
      if (y) s.add(y);
    });
    if (!s.size) s.add(currentYear);
    return Array.from(s).sort((a, b) => b - a);
  }, [allHarvest, allIntake, currentYear]);
  const harvest = reactExports.useMemo(() => allHarvest.filter((r) => String(r.harvestDate ?? "").startsWith(String(year))), [allHarvest, year]);
  const intake = reactExports.useMemo(() => allIntake.filter((r) => String(r.intakeDate ?? "").startsWith(String(year))), [allIntake, year]);
  const totalHarvestKg = reactExports.useMemo(() => harvest.reduce((s, r) => s + (parseFloat(String(r.quantityKg)) || 0), 0), [harvest]);
  const totalGradeAKg = reactExports.useMemo(() => harvest.reduce((s, r) => s + (parseFloat(String(r.gradeA)) || 0), 0), [harvest]);
  const totalGradeBKg = reactExports.useMemo(() => harvest.reduce((s, r) => s + (parseFloat(String(r.gradeB)) || 0), 0), [harvest]);
  const gradeAPct = totalHarvestKg > 0 ? totalGradeAKg / totalHarvestKg * 100 : null;
  const gradeBPct = totalHarvestKg > 0 ? totalGradeBKg / totalHarvestKg * 100 : null;
  const phiFails = harvest.filter((r) => r.preHarvestInterval && parseInt(String(r.preHarvestInterval)) === 0).length;
  const monthlyChart = reactExports.useMemo(() => {
    const map = {};
    harvest.forEach((r) => {
      const m = String(r.harvestDate ?? "").slice(0, 7);
      if (!m || m.length < 7) return;
      if (!map[m]) map[m] = { totalKg: 0, gradeAKg: 0, gradeBKg: 0 };
      map[m].totalKg += parseFloat(String(r.quantityKg)) || 0;
      map[m].gradeAKg += parseFloat(String(r.gradeA)) || 0;
      map[m].gradeBKg += parseFloat(String(r.gradeB)) || 0;
    });
    return Object.entries(map).sort().map(([m, v]) => ({
      label: monthLabel(m),
      "Grade A (kg)": Math.round(v.gradeAKg),
      "Grade B (kg)": Math.round(v.gradeBKg),
      "Ungraded (kg)": Math.max(0, Math.round(v.totalKg - v.gradeAKg - v.gradeBKg))
    }));
  }, [harvest]);
  const cropBreakdown = reactExports.useMemo(() => {
    const map = {};
    harvest.forEach((r) => {
      const cropKey = r.cropName || "Unspecified";
      if (!map[cropKey]) map[cropKey] = { totalKg: 0, gradeAKg: 0, batches: 0 };
      map[cropKey].totalKg += parseFloat(String(r.quantityKg)) || 0;
      map[cropKey].gradeAKg += parseFloat(String(r.gradeA)) || 0;
      map[cropKey].batches++;
    });
    if (Object.keys(map).length === 1 && map["Unspecified"]) {
      const cropsGrouped = {};
      allCrops.filter((c) => c.status !== "Retired").forEach((c) => {
        const k = c.cropName + (c.variety ? ` — ${c.variety}` : "");
        cropsGrouped[k] = { totalKg: 0, gradeAKg: 0, batches: 0 };
      });
      if (Object.keys(cropsGrouped).length > 0) return Object.entries(cropsGrouped).map(([crop, v]) => ({ crop, ...v }));
    }
    return Object.entries(map).sort((a, b) => b[1].totalKg - a[1].totalKg).map(([crop, v]) => ({ crop, ...v }));
  }, [harvest, allCrops]);
  const intakeTempIssues = reactExports.useMemo(() => intake.filter((r) => {
    const t = parseFloat(String(r.intakeTemperatureC));
    return !isNaN(t) && t > 8;
  }).length, [intake]);
  const intakeTotalKg = reactExports.useMemo(() => intake.reduce((s, r) => s + (parseFloat(String(r.quantityKg)) || 0), 0), [intake]);
  const hasData = harvest.length > 0 || intake.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: PRINT_ID, className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3 no-print", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold", children: "Fresh Produce Season Report" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-foreground/50", children: "Harvest yield · Grade split · Crop breakdown · Intake quality" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("select", { className: "h-9 rounded-lg border border-border bg-background px-3 text-sm", value: year, onChange: (e) => setYear(parseInt(e.target.value)), children: years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: y, children: y }, y)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          ensurePrintStyle();
          window.print();
        }, className: "h-9 px-3 rounded-lg border border-border bg-background text-sm flex items-center gap-1.5 hover:bg-muted/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5" }),
          "Print"
        ] })
      ] })
    ] }),
    harvestLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16 text-foreground/40 text-sm", children: "Loading report…" }) : !hasData ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card p-8 text-center text-foreground/40 text-sm", children: [
      "No harvest or intake records found for ",
      year,
      ". Log harvest batches in the Harvest tab to generate this report."
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Harvest Batches", value: String(harvest.length), sub: `${totalHarvestKg > 0 ? `${totalHarvestKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg total` : "No weights"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Grade A Yield", value: gradeAPct != null ? `${gradeAPct.toFixed(1)}%` : totalGradeAKg > 0 ? `${totalGradeAKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "—", sub: totalGradeAKg > 0 ? `${totalGradeAKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "Not recorded", highlight: gradeAPct != null && gradeAPct >= 80 ? "emerald" : gradeAPct != null && gradeAPct >= 65 ? "amber" : void 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Grade B Yield", value: gradeBPct != null ? `${gradeBPct.toFixed(1)}%` : totalGradeBKg > 0 ? `${totalGradeBKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "—", sub: totalGradeBKg > 0 ? `${totalGradeBKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "Not recorded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(KpiCard, { label: "Intake Records", value: String(intake.length), sub: intakeTotalKg > 0 ? `${intakeTotalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg intake` : "No intake weights", highlight: intakeTempIssues > 0 ? "amber" : void 0 })
      ] }),
      phiFails > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "⚠ PHI Alert:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          phiFails,
          " harvest batch",
          phiFails > 1 ? "es" : "",
          " recorded with PHI of 0 days — verify pre-harvest intervals are compliant before despatch."
        ] })
      ] }),
      intakeTempIssues > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-orange-200 bg-orange-50/50 px-4 py-3 text-sm text-orange-800 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "⚠ Temperature Alert:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          intakeTempIssues,
          " intake record",
          intakeTempIssues > 1 ? "s" : "",
          " above 8°C — review cold chain compliance for affected batches."
        ] })
      ] }),
      monthlyChart.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
          "Monthly Harvest Volume by Grade — ",
          year
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 220, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: monthlyChart, margin: { top: 4, right: 8, bottom: 4, left: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "label", tick: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11 }, width: 52, tickFormatter: (v) => `${v.toLocaleString("en-GB")} kg` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { content: /* @__PURE__ */ jsxRuntimeExports.jsx(CustomTooltip, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Legend, { iconSize: 10, wrapperStyle: { fontSize: 11 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Grade A (kg)", fill: "#10b981", radius: [3, 3, 0, 0], maxBarSize: 40, stackId: "a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Grade B (kg)", fill: "#f59e0b", radius: [0, 0, 0, 0], maxBarSize: 40, stackId: "a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "Ungraded (kg)", fill: "#94a3b8", radius: [0, 0, 3, 3], maxBarSize: 40, stackId: "a" })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
            "Yield Summary — ",
            year
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Grade" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Quantity (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "% of Harvest" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: [
              { label: "Grade A", kg: totalGradeAKg, highlight: "emerald" },
              { label: "Grade B", kg: totalGradeBKg, highlight: "amber" },
              ...totalHarvestKg - totalGradeAKg - totalGradeBKg > 1 ? [{ label: "Ungraded / Other", kg: totalHarvestKg - totalGradeAKg - totalGradeBKg, highlight: void 0 }] : [],
              { label: "Total Harvested", kg: totalHarvestKg, bold: true }
            ].map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-t border-border/40 ${row.bold ? "bg-muted/20 font-semibold" : ""}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-4 py-2 ${row.highlight === "emerald" ? "text-emerald-700" : row.highlight === "amber" ? "text-amber-700" : ""}`, children: row.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: row.kg > 0 ? row.kg.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/50", children: totalHarvestKg > 0 && row.kg > 0 ? `${(row.kg / totalHarvestKg * 100).toFixed(1)}%` : "—" })
            ] }, i)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold", children: [
            "Crop Register — ",
            year
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Crop / Variety" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Batches" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Yield (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Grade A" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: cropBreakdown.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-4 text-center text-foreground/40 text-xs", colSpan: 4, children: "No crop breakdown available" }) }) : cropBreakdown.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 font-medium", children: row.crop }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: row.batches }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right", children: row.totalKg > 0 ? row.totalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-right text-foreground/50", children: row.totalKg > 0 && row.gradeAKg > 0 ? `${(row.gradeAKg / row.totalKg * 100).toFixed(1)}%` : "—" })
            ] }, i)) })
          ] })
        ] })
      ] }),
      allCrops.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-card overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 border-b border-border bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: "Active Crops — Sowing & Harvest Schedule" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60 text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Crop" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Variety" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Sown" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Expected Harvest" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-left", children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: allCrops.filter((c) => c.status !== "Retired").map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 font-medium", children: c.cropName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: c.variety || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2 text-xs", children: c.growingMethod || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: fmtDate$1(c.sowingDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: fmtDate$1(c.expectedHarvestDate) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs px-2 py-0.5 rounded-full border ${c.status === "Harvested" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : c.status === "Growing" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-border bg-muted/30"}`, children: c.status || "—" }) })
          ] }, c.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Collapsible,
        {
          title: `Harvest Batches (${harvest.length} · ${totalHarvestKg > 0 ? `${totalHarvestKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "no weights"})`,
          open: openSection === "harvest",
          setOpen: (v) => toggle(v ? "harvest" : ""),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Batch Ref" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Total (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Grade A" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Grade B" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "PHI (days)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Destination" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: harvest.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: fmtDate$1(r.harvestDate) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 font-medium", children: r.harvestBatchRef || "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.quantityKg ? parseFloat(String(r.quantityKg)).toLocaleString("en-GB") : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-emerald-700", children: r.gradeA ? parseFloat(String(r.gradeA)).toLocaleString("en-GB") : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right text-amber-700", children: r.gradeB ? parseFloat(String(r.gradeB)).toLocaleString("en-GB") : "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-1.5 text-right ${r.preHarvestInterval === "0" ? "text-red-600 font-medium" : ""}`, children: r.preHarvestInterval ?? "—" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: r.destination || "—" })
            ] }, r.id)) })
          ] })
        }
      ),
      intake.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Collapsible,
        {
          title: `Intake Records (${intake.length} · ${intakeTotalKg > 0 ? `${intakeTotalKg.toLocaleString("en-GB", { maximumFractionDigits: 0 })} kg` : "no weights"}${intakeTempIssues > 0 ? ` · ⚠ ${intakeTempIssues} temp issue${intakeTempIssues > 1 ? "s" : ""}` : ""})`,
          open: openSection === "intake",
          setOpen: (v) => toggle(v ? "intake" : ""),
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted/20 text-foreground/60", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Product" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Qty (kg)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Temp (°C)" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: intake.map((r) => {
              const tempVal = parseFloat(String(r.intakeTemperatureC));
              const tempHigh = !isNaN(tempVal) && tempVal > 8;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-border/40 hover:bg-muted/20", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: fmtDate$1(r.intakeDate) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5", children: r.productName || "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-1.5 text-right", children: r.quantityKg ? parseFloat(String(r.quantityKg)).toLocaleString("en-GB") : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: `px-3 py-1.5 text-right ${tempHigh ? "text-orange-600 font-medium" : ""}`, children: r.intakeTemperatureC ? `${r.intakeTemperatureC}°C${tempHigh ? " ⚠" : ""}` : "—" })
              ] }, r.id);
            }) })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted/20 px-4 py-3 text-xs text-foreground/50 flex items-start gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-3.5 h-3.5 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Selling prices and input costs (seeds, spray programme, labour) are not captured in harvest records. Add revenue and variable costs via the ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Financial" }),
          " module for a full enterprise gross margin."
        ] })
      ] })
    ] })
  ] });
}
const api = (path) => `/api/${path}`;
const fmt = (v) => v == null || v === "" ? "—" : String(v);
const fmtDate = (v) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
function Empty({ msg }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: msg });
}
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
    if (!o) onCancel();
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "22rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: title }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onCancel, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: confirmVariant, onClick: onConfirm, children: confirmLabel })
    ] })
  ] }) });
}
function DataTable({ cols, rows, onEdit, onDelete, onView }) {
  const [pendingDelete, setPendingDelete] = reactExports.useState(null);
  if (!rows.length) return /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No records yet. Add one using the button above." });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: c.label }, c.key)),
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: rows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
        cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: c.fmt ? c.fmt(row) : fmt(row[c.key]) }, c.key)),
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1 whitespace-nowrap", children: [
          onView && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onView(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          onEdit && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => onEdit(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          onDelete && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => setPendingDelete(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] })
      ] }, i)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!pendingDelete,
        title: "Delete Record",
        message: "Are you sure you want to delete this record? This cannot be undone.",
        onConfirm: () => {
          if (pendingDelete && onDelete) {
            onDelete(pendingDelete);
          }
          setPendingDelete(null);
        },
        onCancel: () => setPendingDelete(null),
        confirmLabel: "Delete",
        confirmVariant: "destructive"
      }
    )
  ] });
}
const RETIREMENT_REASONS = [
  "Absorbed back into parent field",
  "Amalgamated with adjacent block",
  "Converted to arable / combinable crops use",
  "Converted to non-agricultural use",
  "Infrastructure or development",
  "No longer in production",
  "Other"
];
function suggestBlockCode(blocks) {
  const existing = new Set(blocks.map((b) => (b.blockCode ?? "").toUpperCase()));
  for (let i = 1; i <= 999; i++) {
    const candidate = `BLOCK-${String(i).padStart(3, "0")}`;
    if (!existing.has(candidate)) return candidate;
  }
  return "";
}
function BlocksTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [codeError, setCodeError] = reactExports.useState(null);
  const [mapBlock, setMapBlock] = reactExports.useState(null);
  const [showRetired, setShowRetired] = reactExports.useState(false);
  const [retireRecord, setRetireRecord] = reactExports.useState(null);
  const [retireForm, setRetireForm] = reactExports.useState({ retirementReason: "", retiredBy: "", retirementNotes: "" });
  const [reactivateRecord, setReactivateRecord] = reactExports.useState(null);
  const { data: allBlocks = [], isLoading } = useQuery({
    queryKey: ["horti-blocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/horticulture-blocks?includeRetired=true`), { credentials: "include" }).then((r) => r.json())
  });
  const blocks = showRetired ? allBlocks : allBlocks.filter((b) => b.isActive !== false);
  const retiredCount = allBlocks.filter((b) => b.isActive === false).length;
  const { data: farmFields = [] } = useQuery({
    queryKey: ["farm-fields", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/fields`), { credentials: "include" }).then((r) => r.ok ? r.json().then((d) => Array.isArray(d) ? d : d.records ?? []) : [])
  });
  reactExports.useEffect(() => {
    if (open && !editing) {
      setForm((f) => ({ ...f, blockCode: f.blockCode || suggestBlockCode(allBlocks) }));
    }
  }, [open, editing, allBlocks]);
  const save = useMutation({
    mutationFn: (b) => {
      const code = (b.blockCode ?? "").trim().toUpperCase();
      const duplicate = allBlocks.some(
        (bl) => bl.blockCode?.toUpperCase() === code && String(bl.id) !== String(editing?.id)
      );
      if (code && duplicate) {
        setCodeError(`Block code "${code}" is already in use. Please choose a unique code.`);
        return Promise.reject(new Error("duplicate"));
      }
      setCodeError(null);
      return fetch(editing ? api(`farms/${farmId}/horticulture-blocks/${editing.id}`) : api(`farms/${farmId}/horticulture-blocks`), {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...b, blockCode: code || null, fieldId: b.fieldId ? parseInt(b.fieldId) : null })
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["horti-blocks", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
      setCodeError(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/horticulture-blocks/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-blocks", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const retire = useMutation({
    mutationFn: ({ id, ...body }) => fetch(api(`farms/${farmId}/horticulture-blocks/${id}/retire`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["horti-blocks", farmId] });
      setRetireRecord(null);
      setRetireForm({ retirementReason: "", retiredBy: "", retirementNotes: "" });
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const reactivate = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/horticulture-blocks/${id}/reactivate`), { method: "POST", credentials: "include" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["horti-blocks", farmId] });
      setReactivateRecord(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const openEdit = (r) => {
    setEditing(r);
    setCodeError(null);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Growing Blocks / Field Sections" }),
        retiredCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            className: "flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
            onClick: () => setShowRetired((v) => !v),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: `w-3.5 h-3.5 ${showRetired ? "" : "opacity-40"}` }),
              showRetired ? "Hide retired" : `Show retired (${retiredCount})`
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setCodeError(null);
        setForm({});
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Block"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Block Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Code" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Parent Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Area (ha)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Soil Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Irrigation" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-4 font-medium text-muted-foreground", children: "Water Source" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        blocks.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 8, className: "py-6 text-center text-sm text-muted-foreground italic", children: "No blocks yet. Add one using the button above." }) }),
        blocks.map((row, i) => {
          const isRetired = row.isActive === false;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: `border-b last:border-0 ${isRetired ? "opacity-50" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: isRetired ? "line-through text-muted-foreground" : "", children: fmt(row.blockName) }),
              isRetired && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 no-underline not-italic", children: "Retired" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4 font-mono text-xs", children: fmt(row.blockCode) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: row.fieldId ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs", children: [
              fmt(row.fieldName),
              row.fieldReference ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
                " (",
                fmt(row.fieldReference),
                ")"
              ] }) : null
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-xs", children: "—" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: fmt(row.areaHa) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: fmt(row.soilType) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: fmt(row.irrigationSystem) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-4", children: fmt(row.waterSource) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1 whitespace-nowrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "View", onClick: () => setViewRecord(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
              !isRetired && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Draw boundary on map", onClick: () => setMapBlock({ id: row.id, name: String(row.blockName) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "w-3.5 h-3.5 text-blue-600" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Edit", onClick: () => openEdit(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Retire block", onClick: () => {
                  setRetireRecord(row);
                  setRetireForm({ retirementReason: "", retiredBy: "", retirementNotes: "" });
                }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-3.5 h-3.5 text-amber-600" }) })
              ] }),
              isRetired && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Reactivate block", onClick: () => setReactivateRecord(row), children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-3.5 h-3.5 text-green-600" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Delete", onClick: () => del.mutate(row.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
            ] })
          ] }, i);
        })
      ] })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "flex items-center gap-2", children: [
        "View Block",
        viewRecord.isActive === false && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-amber-100 text-amber-700 rounded px-2 py-0.5 font-normal", children: "Retired" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Block Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.blockName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Block Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-mono text-sm", children: fmt(viewRecord.blockCode) })
        ] }),
        !!viewRecord.fieldId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 bg-muted/40 rounded p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide mb-1", children: "Parent Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            fmt(viewRecord.fieldName),
            viewRecord.fieldReference ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground text-xs ml-1", children: [
              "(",
              fmt(viewRecord.fieldReference),
              ")"
            ] }) : null
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 mt-1", children: [
            !!viewRecord.fieldIsNvz && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5", children: "NVZ" }),
            !!viewRecord.fieldIsOrganic && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5", children: "Organic" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Area (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.areaHa) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Soil Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.soilType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Irrigation System" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.irrigationSystem) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Water Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.waterSource) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.notes) })
        ] }),
        viewRecord.isActive === false && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 border-t pt-3 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-700 uppercase tracking-wide", children: "Retirement Record" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Retired On" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.retiredAt) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Retired By" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.retiredBy) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reason" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.retirementReason) })
            ] }),
            !!viewRecord.retirementNotes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.retirementNotes) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        viewRecord.isActive !== false && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => setMapBlock({ id: viewRecord.id, name: String(viewRecord.blockName) }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "w-4 h-4 mr-1" }),
            "Draw Boundary"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
            openEdit(viewRecord);
            setViewRecord(null);
          }, children: "Edit" })
        ] }),
        viewRecord.isActive === false && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          setReactivateRecord(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-4 h-4 mr-1" }),
          "Reactivate"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        setCodeError(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Block" : "Add Growing Block" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Block Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.blockName ?? "", onChange: (e) => setForm((f) => ({ ...f, blockName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Block Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: form.blockCode ?? "",
              onChange: (e) => {
                setCodeError(null);
                setForm((f) => ({ ...f, blockCode: e.target.value }));
              },
              placeholder: "e.g. BLOCK-001",
              className: codeError ? "border-red-500" : ""
            }
          ),
          codeError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mt-1", children: codeError }),
          !editing && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Auto-suggested — you can change this to match your farm plan." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Parent Field ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(optional — for mixed farms)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.fieldId ?? "", onValueChange: (v) => setForm((f) => ({ ...f, fieldId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Not linked to a field" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "Not linked to a field" }),
              farmFields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(f.id), children: [
                f.name,
                f.fieldReference ? ` (${f.fieldReference})` : ""
              ] }, f.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Link this block to a farm field to inherit NVZ / organic status." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.areaHa ?? "", onChange: (e) => setForm((f) => ({ ...f, areaHa: e.target.value })), placeholder: "Will update when boundary is drawn" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Soil Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.soilType ?? "", onValueChange: (v) => setForm((f) => ({ ...f, soilType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select soil type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Sandy", "Loamy sand", "Sandy loam", "Loam", "Clay loam", "Silty clay loam", "Silty clay", "Clay", "Peat", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Irrigation System" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.irrigationSystem ?? "", onValueChange: (v) => setForm((f) => ({ ...f, irrigationSystem: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select irrigation system" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Overhead sprinkler", "Drip / trickle irrigation", "Seep hose", "Boom / boom reel", "Flood irrigation", "Furrow irrigation", "None – rainfed"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Water Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.waterSource ?? "", onValueChange: (v) => setForm((f) => ({ ...f, waterSource: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select water source" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Borehole", "Reservoir", "River / stream", "Mains (potable)", "Rainwater harvesting", "Pond / lake", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
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
          setCodeError(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending || !form.blockName, children: save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : "Save" })
      ] })
    ] }) }),
    retireRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setRetireRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "34rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Retire Block — ",
        fmt(retireRecord.blockName)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "This block will be marked as permanently out of production. It will be hidden from active crop and record selectors, but its full history is preserved and it can be reactivated at any time." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reason *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: retireForm.retirementReason, onValueChange: (v) => setRetireForm((f) => ({ ...f, retirementReason: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select reason" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RETIREMENT_REASONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: r, children: r }, r)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Retired By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: retireForm.retiredBy, onChange: (e) => setRetireForm((f) => ({ ...f, retiredBy: e.target.value })), placeholder: "Name of person retiring this block" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Notes ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground font-normal", children: "(optional)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: retireForm.retirementNotes, onChange: (e) => setRetireForm((f) => ({ ...f, retirementNotes: e.target.value })), rows: 2, placeholder: "e.g. Reabsorbed into North Field for winter wheat rotation" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setRetireRecord(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "destructive",
            disabled: retire.isPending || !retireForm.retirementReason,
            onClick: () => retire.mutate({ id: retireRecord.id, ...retireForm }),
            children: retire.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-4 h-4 mr-1" }),
              "Retire Block"
            ] })
          }
        )
      ] })
    ] }) }),
    reactivateRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: true,
        title: `Reactivate Block — ${fmt(reactivateRecord.blockName)}`,
        message: "This will mark the block as active again, making it available in all crop and record selectors.",
        onConfirm: () => reactivate.mutate(reactivateRecord.id),
        onCancel: () => setReactivateRecord(null),
        confirmLabel: "Reactivate"
      }
    ),
    mapBlock && /* @__PURE__ */ jsxRuntimeExports.jsx(
      BlockBoundaryMapDialog,
      {
        blockId: mapBlock.id,
        blockName: mapBlock.name,
        open: !!mapBlock,
        onClose: () => setMapBlock(null),
        onSaved: () => {
          qc.invalidateQueries({ queryKey: ["horti-blocks", farmId] });
          setMapBlock(null);
        }
      }
    )
  ] });
}
const PLANTING_METHODS = ["Direct Seed", "Seedling (own propagation)", "Plug Plant (nursery)", "Bare Root Cane", "Crown / Rootstock", "Sapling", "Other"];
function isSeedMethod(m) {
  return !m || m === "Direct Seed";
}
function isNurseryMethod(m) {
  return !!m && m !== "Direct Seed" && m !== "Seedling (own propagation)";
}
function sowingLabel(m) {
  if (m === "Bare Root Cane" || m === "Crown / Rootstock" || m === "Sapling") return "Planting Date";
  if (m === "Plug Plant (nursery)" || m === "Seedling (own propagation)") return "Potting / Tray Date";
  return "Sowing Date";
}
function printCropEstablishmentRegister(farmName, crops, blocks) {
  const blockName = (id) => blocks.find((b) => String(b.id) === String(id))?.blockName ?? "—";
  const rows = crops.map((c) => `
    <tr>
      <td>${fmt(c.cropName)}</td>
      <td>${fmt(c.variety)}</td>
      <td>${blockName(c.blockId)}</td>
      <td>${fmt(c.plantingMethod) !== "—" ? fmt(c.plantingMethod) : "Direct Seed"}</td>
      <td>${c.quantityPlanted != null ? Number(c.quantityPlanted).toLocaleString() : "—"}</td>
      <td>${fmt(c.plantSupplier) !== "—" ? fmt(c.plantSupplier) : fmt(c.seedSupplier)}</td>
      <td>${fmt(c.nurseryBatchRef) !== "—" ? fmt(c.nurseryBatchRef) : fmt(c.seedLotNumber)}</td>
      <td>${fmtDate(c.sowingDate)}</td>
      <td>${fmtDate(c.transplantingDate)}</td>
      <td>${fmtDate(c.expectedHarvestDate)}</td>
      <td>${fmt(c.growingMethod)}</td>
      <td>${fmt(c.status)}</td>
    </tr>`).join("");
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>Crop Establishment Register — ${farmName}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #111; }
    h1 { font-size: 16px; margin-bottom: 2px; }
    h2 { font-size: 13px; font-weight: normal; color: #555; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #1a3c2a; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; white-space: nowrap; }
    td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
    tr:nth-child(even) td { background: #f9fafb; }
    .footer { margin-top: 24px; font-size: 10px; color: #888; }
    @media print { .no-print { display: none; } }
  </style></head><body>
  <button class="no-print" onclick="window.print()" style="margin-bottom:16px;padding:6px 16px;background:#1a3c2a;color:#fff;border:none;border-radius:4px;cursor:pointer;">Print / Save PDF</button>
  <h1>Crop Establishment Register</h1>
  <h2>${farmName} &mdash; Printed ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-GB")}</h2>
  <table>
    <thead><tr>
      <th>Crop</th><th>Variety</th><th>Block</th><th>Planting Method</th>
      <th>Qty Planted</th><th>Supplier</th><th>Batch / Lot Ref</th>
      <th>Sow / Plant Date</th><th>Transplant Date</th><th>Expected Harvest</th>
      <th>Growing Method</th><th>Status</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">Generated by BDE Farm Trac &bull; ${(/* @__PURE__ */ new Date()).toLocaleString("en-GB")}</div>
  </body></html>`);
  w.document.close();
}
function CropsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: farmInfo } = useQuery({ queryKey: ["farms-list"], queryFn: () => fetch(api("tenants/current/farms"), { credentials: "include" }).then((r) => r.json()) });
  const farmName = farmInfo?.farms?.[0]?.name ?? "Farm";
  const { data: blocks = [] } = useQuery({ queryKey: ["horti-blocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-blocks`), { credentials: "include" }).then((r) => r.json()) });
  const { data: crops = [], isLoading } = useQuery({ queryKey: ["horti-crops", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-crops`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({ mutationFn: (b) => fetch(editing ? api(`farms/${farmId}/horticulture-crops/${editing.id}`) : api(`farms/${farmId}/horticulture-crops`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["horti-crops", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/horticulture-crops/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-crops", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const openEdit = (r) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : v])));
    setOpen(true);
  };
  const pm = String(form.plantingMethod ?? "");
  const isSeed = isSeedMethod(pm);
  const isNursery = isNurseryMethod(pm);
  const blockName = (id) => blocks.find((b) => String(b.id) === String(id))?.blockName ?? "—";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Crop Register" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => printCropEstablishmentRegister(farmName, crops, blocks), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { className: "w-3.5 h-3.5 mr-1" }),
          "Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({ seedTreated: false, status: "growing" });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Crop"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(
      DataTable,
      {
        cols: [
          { key: "cropName", label: "Crop" },
          { key: "variety", label: "Variety" },
          { key: "plantingMethod", label: "Source", fmt: (r) => fmt(r.plantingMethod) !== "—" ? fmt(r.plantingMethod) : "Direct Seed" },
          { key: "quantityPlanted", label: "Qty", fmt: (r) => r.quantityPlanted != null ? Number(r.quantityPlanted).toLocaleString() : "—" },
          { key: "sowingDate", label: "Sow / Plant", fmt: (r) => fmtDate(r.sowingDate) },
          { key: "expectedHarvestDate", label: "Expected Harvest", fmt: (r) => fmtDate(r.expectedHarvestDate) },
          { key: "status", label: "Status" }
        ],
        rows: crops,
        onView: setViewRecord,
        onEdit: openEdit,
        onDelete: (r) => del.mutate(r.id)
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Crop Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Crop Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.cropName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Variety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.variety) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Block / Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: blockName(viewRecord.blockId) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Growing Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.growingMethod) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3 mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2", children: "Establishment" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Planting Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.plantingMethod) !== "—" ? fmt(viewRecord.plantingMethod) : "Direct Seed" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity Planted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.quantityPlanted != null ? Number(viewRecord.quantityPlanted).toLocaleString() : "—" })
        ] }),
        !isSeedMethod(String(viewRecord.plantingMethod ?? "")) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Nursery / Plant Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.plantSupplier) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Nursery Batch Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.nurseryBatchRef) })
          ] })
        ] }),
        isSeedMethod(String(viewRecord.plantingMethod ?? "")) && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Seed Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.seedSupplier) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Seed Lot Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.seedLotNumber) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Seed Treated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.seedTreated ? "Yes" : "No" })
          ] }),
          viewRecord.seedTreated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Treatment Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.seedTreatmentDetails) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3 mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2", children: "Dates & Yield" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: sowingLabel(String(viewRecord.plantingMethod ?? "")) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.sowingDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Transplanting Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.transplantingDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expected Harvest Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.expectedHarvestDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Target Yield (kg/ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.targetYieldKgHa) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.status) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Crop Record"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.cropName ?? ""), onChange: (e) => setForm((f) => ({ ...f, cropName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Variety" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.variety ?? ""), onChange: (e) => setForm((f) => ({ ...f, variety: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Block" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.blockId ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, blockId: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select block" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: blocks.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(b.id), children: String(b.blockName) }, String(b.id))) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Growing Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.growingMethod ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, growingMethod: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Open Field", "Protected Cropping", "Polytunnel", "Glasshouse", "Hydroponics", "Raised Bed"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2", children: "Establishment / Planting Source" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Planting Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: pm, onValueChange: (v) => setForm((f) => ({ ...f, plantingMethod: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select method" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: PLANTING_METHODS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Planted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: String(form.quantityPlanted ?? ""), onChange: (e) => setForm((f) => ({ ...f, quantityPlanted: e.target.value })), placeholder: "No. of plants / canes / crowns" })
        ] }),
        isNursery && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nursery / Plant Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.plantSupplier ?? ""), onChange: (e) => setForm((f) => ({ ...f, plantSupplier: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nursery Batch / Delivery Ref" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.nurseryBatchRef ?? ""), onChange: (e) => setForm((f) => ({ ...f, nurseryBatchRef: e.target.value })) })
          ] })
        ] }),
        isSeed && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Seed Supplier" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.seedSupplier ?? ""), onChange: (e) => setForm((f) => ({ ...f, seedSupplier: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Seed Lot Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.seedLotNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, seedLotNumber: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "treated", checked: Boolean(form.seedTreated), onCheckedChange: (v) => setForm((f) => ({ ...f, seedTreated: Boolean(v) })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "treated", children: "Seed treated?" })
          ] }),
          Boolean(form.seedTreated) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treatment Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.seedTreatmentDetails ?? ""), onChange: (e) => setForm((f) => ({ ...f, seedTreatmentDetails: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2", children: "Dates & Yield" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: sowingLabel(pm) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.sowingDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, sowingDate: e.target.value })) })
        ] }),
        !isSeedMethod(pm) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Transplanting Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.transplantingDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, transplantingDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Expected Harvest Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.expectedHarvestDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, expectedHarvestDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Yield (kg/ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: "0", value: String(form.targetYieldKgHa ?? ""), onChange: (e) => setForm((f) => ({ ...f, targetYieldKgHa: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 border-t pt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2", children: "Status & Notes" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.status ?? "growing"), onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["growing", "harvested", "failed", "retired"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o.charAt(0).toUpperCase() + o.slice(1) }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function WaterTestsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [mode, setMode] = reactExports.useState("log");
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [labSupplierId, setLabSupplierId] = reactExports.useState(null);
  const { data: tests = [], isLoading } = useQuery({ queryKey: ["horti-water", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-water-tests`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: (b) => fetch(editing ? api(`farms/${farmId}/horticulture-water-tests/${editing.id}`) : api(`farms/${farmId}/horticulture-water-tests`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["horti-water", farmId] });
      setOpen(false);
      setForm({});
      setEditing(null);
      setLabSupplierId(null);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/horticulture-water-tests/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-water", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  function openAdd() {
    setEditing(null);
    setMode("log");
    setForm({});
    setLabSupplierId(null);
    setOpen(true);
  }
  const openEdit = (r) => {
    setEditing(r);
    setMode("edit");
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setLabSupplierId(r.labSupplierId ?? null);
    setOpen(true);
  };
  const openEnterResult = (r) => {
    setEditing(r);
    setMode("result");
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setLabSupplierId(r.labSupplierId ?? null);
    setOpen(true);
  };
  const allWaterRows = tests;
  const [yearFilterWater, setYearFilterWater] = reactExports.useState("all");
  const yearsWater = reactExports.useMemo(() => Array.from(new Set(allWaterRows.map((r) => String(r.testDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allWaterRows]);
  const rows = yearFilterWater === "all" ? allWaterRows : allWaterRows.filter((r) => String(r.testDate ?? "").startsWith(yearFilterWater));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Irrigation Water Quality Tests" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterWater, onValueChange: setYearFilterWater, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsWater.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Log Sample"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: "No water test records yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Date", "Source", "Lab", "E.coli", "Coliform", "Overall Result", "Next Due", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-2 font-medium text-muted-foreground text-xs", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono text-xs", children: fmtDate(r.testDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.waterSource ? String(r.waterSource) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.testingLab ? String(r.testingLab) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.ecoli ? String(r.ecoli) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-xs", children: r.totalColiform ? String(r.totalColiform) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: !r.overallResult ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700", children: "Awaiting results" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${String(r.overallResult).startsWith("Pass") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: String(r.overallResult) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-mono text-xs", children: fmtDate(r.nextTestDueDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap", children: [
          !r.overallResult && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs text-amber-700 border-amber-300 hover:bg-amber-50", onClick: () => openEnterResult(r), children: "Enter results" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3 h-3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-destructive", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
        ] }) })
      ] }, String(r.id))) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Water Test" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Test Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.testDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Water Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.waterSource) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Testing Lab" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.testingLab) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sample Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.sampleReference) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "E.coli Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.ecoli) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Total Coliform" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.totalColiform) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Salmonella" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.salmonella) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cryptosporidium" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.cryptosporidium) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "pH" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.ph) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Nitrates (mg/L)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.nitratesMgL) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Overall Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.overallResult) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Test Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.nextTestDueDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Corrective Action" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.correctiveAction) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      if (!o) {
        setOpen(false);
        setLabSupplierId(null);
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: mode === "log" ? "Log Water Test Sample" : mode === "result" ? "Enter Water Test Results" : "Edit Water Test Record" }) }),
      mode === "log" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1", children: "Record the sample collection now. Return to enter laboratory results once the report arrives." }),
      mode === "result" && editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground -mt-1", children: [
        "Sample from ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtDate(editing.testDate) }),
        editing.waterSource ? ` · ${editing.waterSource}` : "",
        editing.testingLab ? ` · ${editing.testingLab}` : "",
        ". Enter results from your lab report."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        mode !== "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.testDate ?? "", onChange: (e) => setForm((f) => ({ ...f, testDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Water Source *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.waterSource ?? "", onValueChange: (v) => setForm((f) => ({ ...f, waterSource: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select source" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Borehole", "Reservoir", "River / stream", "Mains (potable)", "Rainwater harvesting", "Pond / lake", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LabSelector, { farmId, value: labSupplierId, labName: form.testingLab ?? null, onChange: (id, name) => {
            setLabSupplierId(id);
            setForm((f) => ({ ...f, testingLab: name ?? "" }));
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sample Reference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.sampleReference ?? "", onChange: (e) => setForm((f) => ({ ...f, sampleReference: e.target.value })), placeholder: "Lab submission ref (if known)" })
          ] })
        ] }),
        mode !== "log" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          [["ecoli", "E.coli Result"], ["totalColiform", "Total Coliform"], ["salmonella", "Salmonella"], ["cryptosporidium", "Cryptosporidium"]].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: l }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form[k] ?? "", onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })) })
          ] }, k)),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "pH" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.ph ?? "", onChange: (e) => setForm((f) => ({ ...f, ph: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nitrates (mg/L)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.nitratesMgL ?? "", onChange: (e) => setForm((f) => ({ ...f, nitratesMgL: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overall Result *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.overallResult ?? "", onValueChange: (v) => setForm((f) => ({ ...f, overallResult: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Pass", "Pass with Conditions", "Fail", "Retest Required"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Test Due" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.nextTestDueDate ?? "", onChange: (e) => setForm((f) => ({ ...f, nextTestDueDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Corrective Action" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.correctiveAction ?? "", onChange: (e) => setForm((f) => ({ ...f, correctiveAction: e.target.value })), rows: 2 })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setLabSupplierId(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate({ ...form, labSupplierId: labSupplierId ?? null }), disabled: save.isPending, children: mode === "log" ? "Log Sample" : mode === "result" ? "Save Results" : "Save Changes" })
      ] })
    ] }) })
  ] });
}
function HarvestTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["horti-harvest", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-harvest-records`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({ mutationFn: (b) => fetch(editing ? api(`farms/${farmId}/horticulture-harvest-records/${editing.id}`) : api(`farms/${farmId}/horticulture-harvest-records`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["horti-harvest", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/horticulture-harvest-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-harvest", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const openEdit = (r) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };
  const allHarvestRecords = records;
  const [yearFilterHarvest, setYearFilterHarvest] = reactExports.useState("all");
  const yearsHarvest = reactExports.useMemo(() => Array.from(new Set(allHarvestRecords.map((r) => String(r.harvestDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allHarvestRecords]);
  const filteredHarvestRecords = yearFilterHarvest === "all" ? allHarvestRecords : allHarvestRecords.filter((r) => String(r.harvestDate ?? "").startsWith(yearFilterHarvest));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Harvest Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterHarvest, onValueChange: setYearFilterHarvest, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsHarvest.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({});
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Harvest"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [{ key: "harvestDate", label: "Date", fmt: (r) => fmtDate(r.harvestDate) }, { key: "harvestBatchRef", label: "Batch Ref" }, { key: "quantityKg", label: "Total (kg)" }, { key: "gradeA", label: "Grade A (kg)" }, { key: "gradeB", label: "Grade B (kg)" }, { key: "preHarvestInterval", label: "PHI (days)" }, { key: "destination", label: "Destination" }], rows: filteredHarvestRecords, onView: setViewRecord, onEdit: openEdit, onDelete: (r) => del.mutate(r.id) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Harvest Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Harvest Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.harvestDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Batch Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.harvestBatchRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Block / Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.blockOrField) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Total Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.quantityKg) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Grade A (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.gradeA) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Grade B (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.gradeB) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Grade C (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.gradeC) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Waste (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.waste) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "PHI (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.preHarvestInterval) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Harvested By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.harvestedBy) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Destination" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.destination) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Customer Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.customerReference) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Harvest Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Harvest Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.harvestDate ?? "", onChange: (e) => setForm((f) => ({ ...f, harvestDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Batch Reference *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.harvestBatchRef ?? "", onChange: (e) => setForm((f) => ({ ...f, harvestBatchRef: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Quantity (kg) *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.quantityKg ?? "", onChange: (e) => setForm((f) => ({ ...f, quantityKg: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Grade A (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.gradeA ?? "", onChange: (e) => setForm((f) => ({ ...f, gradeA: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Grade B (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.gradeB ?? "", onChange: (e) => setForm((f) => ({ ...f, gradeB: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Waste (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.waste ?? "", onChange: (e) => setForm((f) => ({ ...f, waste: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "PHI (days)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.preHarvestInterval ?? "", onChange: (e) => setForm((f) => ({ ...f, preHarvestInterval: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Harvested By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.harvestedBy ?? "", onChange: (e) => setForm((f) => ({ ...f, harvestedBy: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Destination" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.destination ?? "", onValueChange: (v) => setForm((f) => ({ ...f, destination: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select destination" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Packing house – own", "Packing house – third party", "Direct retail (supermarket)", "Wholesale market", "Processor", "Export", "Farm shop / direct sale", "Food bank / donation", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Customer Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.customerReference ?? "", onChange: (e) => setForm((f) => ({ ...f, customerReference: e.target.value })) })
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
function useHarvestRecords(farmId) {
  return useQuery({
    queryKey: ["horti-harvest", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/horticulture-harvest-records`), { credentials: "include" }).then((r) => r.json())
  });
}
const COND_STYLE = (cond) => {
  if (cond === "Rejected") return { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" };
  if (cond === "Poor") return { bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" };
  if (cond === "Good" || cond === "Acceptable") return { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };
  return { bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb" };
};
function IntakeTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [manageLocOpen, setManageLocOpen] = reactExports.useState(false);
  const [newLocName, setNewLocName] = reactExports.useState("");
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["fp-intake", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/fresh-produce-intake`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: harvestRecords = [] } = useHarvestRecords(farmId);
  const { data: crops = [] } = useQuery({
    queryKey: ["horti-crops", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/horticulture-crops`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: storageLocs = [], refetch: refetchLocs } = useQuery({
    queryKey: ["fp-storage-locs", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/fresh-produce-storage-locations`), { credentials: "include" }).then((r) => r.json())
  });
  const { data: fpMembersData, isLoading: fpMembersLoading } = useFarmMembers(farmId);
  const fpStaffNames = (fpMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  [...new Set(records.map((r) => r.receivedBy).filter(Boolean))].sort();
  reactExports.useEffect(() => {
    const endTime = String(form.preCoolingEndTime ?? "");
    if (!endTime || form.achievedTemperatureC) return;
    const [h, m] = endTime.split(":").map(Number);
    const now = /* @__PURE__ */ new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return;
    const timerId = setTimeout(() => {
      toast({ title: "Pre-cooling end time reached", description: "Record the achieved temperature for this batch.", variant: "destructive" });
    }, diff);
    return () => clearTimeout(timerId);
  }, [form.preCoolingEndTime, form.achievedTemperatureC]);
  const save = useMutation({
    mutationFn: (b) => fetch(api(`farms/${farmId}/fresh-produce-intake`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(b)
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fp-intake", farmId] });
      qc.invalidateQueries({ queryKey: ["notifications", farmId] });
      setOpen(false);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/fresh-produce-intake/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fp-intake", farmId] });
      qc.invalidateQueries({ queryKey: ["notifications", farmId] });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const addLoc = useMutation({
    mutationFn: (name) => fetch(api(`farms/${farmId}/fresh-produce-storage-locations`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name })
    }),
    onSuccess: () => {
      refetchLocs();
      setNewLocName("");
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const delLoc = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/fresh-produce-storage-locations/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => refetchLocs(),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function onHarvestSelect(harvestId) {
    if (harvestId === "__none__") {
      setForm((f) => ({ ...f, harvestRecordId: "", harvestBatchRef: "" }));
      return;
    }
    const hr = harvestRecords.find((h) => String(h.id) === harvestId);
    if (hr) setForm((f) => ({ ...f, harvestRecordId: String(hr.id), harvestBatchRef: hr.harvestBatchRef, quantityKg: hr.quantityKg }));
  }
  const conditionBad = form.conditionOnArrival === "Poor" || form.conditionOnArrival === "Rejected";
  const batchRejected = form.accepted === false;
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const allIntakeRecords = records;
  const [yearFilterIntake, setYearFilterIntake] = reactExports.useState("all");
  const yearsIntake = reactExports.useMemo(() => Array.from(new Set(allIntakeRecords.map((r) => String(r.intakeDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allIntakeRecords]);
  const filteredIntakeRecords = yearFilterIntake === "all" ? allIntakeRecords : allIntakeRecords.filter((r) => String(r.intakeDate ?? "").startsWith(yearFilterIntake));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Pre-Cooling / Intake Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterIntake, onValueChange: setYearFilterIntake, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsIntake.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => setManageLocOpen(true), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Warehouse, { className: "w-3.5 h-3.5 mr-1" }),
          "Locations"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setForm({ foreignBodyCheck: false, pestDamageCheck: false, accepted: true });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Intake Record"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : filteredIntakeRecords.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: "No intake records yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b", children: ["Date", "Batch", "Product", "Qty (kg)", "Condition", "Temp (°C)", "Accepted", "Checks", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground whitespace-nowrap", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredIntakeRecords.map((r) => {
        const condBad = r.conditionOnArrival === "Poor" || r.conditionOnArrival === "Rejected";
        const notAccepted = r.accepted === false || r.accepted === "false";
        const fbMissing = !r.foreignBodyCheck || r.foreignBodyCheck === "false";
        const pdMissing = !r.pestDamageCheck || r.pestDamageCheck === "false";
        const preCoolingAlert = (() => {
          if (!r.preCoolingEndTime || r.achievedTemperatureC) return false;
          if (r.intakeDate !== today) return false;
          const [hh, mm] = String(r.preCoolingEndTime).split(":").map(Number);
          const end = /* @__PURE__ */ new Date();
          end.setHours(hh, mm, 0, 0);
          return end < /* @__PURE__ */ new Date();
        })();
        const cs = COND_STYLE(r.conditionOnArrival);
        const rowBg = notAccepted ? "#fef2f2" : condBad ? "#fff7ed" : "";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: "1px solid #f3f4f6", background: rowBg }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3 text-muted-foreground whitespace-nowrap", children: fmtDate(r.intakeDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-3", children: [
            fmt(r.harvestBatchRef),
            !!r.harvestRecordId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-xs text-green-600", title: "Linked to harvest record", children: "●" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: fmt(r.productName) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: fmt(r.quantityKg) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 600, padding: "2px 6px", borderRadius: 4, display: "inline-block", background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }, children: fmt(r.conditionOnArrival) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 pr-3", children: [
            fmt(r.intakeTemperatureC),
            preCoolingAlert && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-red-500 font-bold text-xs", title: "Pre-cooling end time passed — achieved temp not yet recorded", children: "⚠" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 600, padding: "2px 6px", borderRadius: 4, display: "inline-block", background: notAccepted ? "#fef2f2" : "#f0fdf4", color: notAccepted ? "#991b1b" : "#15803d", border: `1px solid ${notAccepted ? "#fecaca" : "#bbf7d0"}` }, children: notAccepted ? "Rejected" : "Yes" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 3 }, children: [["FB", fbMissing, "Foreign body check"], ["PD", pdMissing, "Pest damage check"]].map(([label, missing, title]) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { title, style: { fontSize: "0.68rem", fontWeight: 700, padding: "1px 5px", borderRadius: 3, background: missing ? "#fef2f2" : "#f0fdf4", color: missing ? "#991b1b" : "#15803d", border: `1px solid ${missing ? "#fecaca" : "#bbf7d0"}` }, children: label }, label)) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-destructive hover:text-destructive", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
          ] }) })
        ] }, String(r.id));
      }) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Intake Record — ",
        fmtDate(viewRecord.intakeDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Intake Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.intakeDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Harvest Batch Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            fmt(viewRecord.harvestBatchRef),
            !!viewRecord.harvestRecordId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-xs text-green-600", children: "● Linked" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.productName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.quantityKg) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Condition on Arrival" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.conditionOnArrival) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Accepted" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.accepted ? "Yes" : "Rejected" })
        ] }),
        !viewRecord.accepted && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Rejection Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.rejectionReason) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Intake Temp (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.intakeTemperatureC) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Target Storage Temp (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.targetStorageTemperatureC) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Pre-Cooling Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.preCoolingStartTime) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Pre-Cooling End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.preCoolingEndTime) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Achieved Temp (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.achievedTemperatureC) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Storage Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.storageLocation) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Received By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.receivedBy) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Foreign Body Check" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.foreignBodyCheck ? "✓ Yes" : "✗ No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Pest Damage Check" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.pestDamageCheck ? "✓ Yes" : "✗ No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: manageLocOpen, onOpenChange: setManageLocOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "32rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Packhouse / Cold Store Locations" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: 'Define your packhouse and cold store locations. These appear as a pick-list in the Storage Location field for full traceability (e.g. "Cold Store A — Bay 3").' }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              placeholder: "e.g. Cold Store A, Pre-cooling Chamber 1…",
              value: newLocName,
              onChange: (e) => setNewLocName(e.target.value),
              onKeyDown: (e) => {
                if (e.key === "Enter" && newLocName.trim()) addLoc.mutate(newLocName.trim());
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
            if (newLocName.trim()) addLoc.mutate(newLocName.trim());
          }, disabled: addLoc.isPending || !newLocName.trim(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
            "Add"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 max-h-64 overflow-y-auto", children: [
          storageLocs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground italic text-center py-4", children: "No locations yet — add your first above." }),
          storageLocs.map((loc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 12px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: String(loc.name) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "text-destructive hover:text-destructive", onClick: () => delLoc.mutate(loc.id), disabled: delLoc.isPending, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
          ] }, String(loc.id)))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setManageLocOpen(false), children: "Done" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, className: "max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Pre-Cooling / Intake Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Harvest Record" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.harvestRecordId ? String(form.harvestRecordId) : "__none__", onValueChange: onHarvestSelect, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select harvest record…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Enter batch ref manually —" }),
              harvestRecords.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(h.id), children: [
                h.harvestBatchRef,
                " — ",
                fmtDate(h.harvestDate),
                " (",
                fmt(h.quantityKg),
                " kg)"
              ] }, h.id))
            ] })
          ] }),
          form.harvestRecordId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-1", children: "✓ Linked — batch ref and quantity auto-filled. Full field-to-packhouse traceability maintained." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Intake Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.intakeDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, intakeDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Harvest Batch Ref *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.harvestBatchRef ?? ""), onChange: (e) => setForm((f) => ({ ...f, harvestBatchRef: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              list: "fp-crop-names",
              value: String(form.productName ?? ""),
              onChange: (e) => setForm((f) => ({ ...f, productName: e.target.value })),
              placeholder: "Type or select from crop register…"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "fp-crop-names", children: crops.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: `${String(c.cropName)}${c.variety ? ` — ${String(c.variety)}` : ""}` }, String(c.id))) }),
          crops.length > 0 && !form.productName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Suggestions from your crop register — or type a custom name." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: String(form.quantityKg ?? ""), onChange: (e) => setForm((f) => ({ ...f, quantityKg: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Condition on Arrival" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.conditionOnArrival ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, conditionOnArrival: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Good", "Acceptable", "Poor", "Rejected"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Received By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: String(form.receivedBy ?? ""), onChange: (v) => setForm((f) => ({ ...f, receivedBy: v })), staffNames: fpStaffNames, loading: fpMembersLoading })
        ] }),
        conditionBad && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", style: { display: "flex", gap: 8, padding: "10px 12px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, fontSize: "0.82rem", color: "#9a3412", alignItems: "flex-start" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 shrink-0 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Poor or Rejected condition selected." }),
            " Segregate this batch immediately, document the issue in full, and notify your quality/compliance manager before intake proceeds."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Intake Temperature (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: String(form.intakeTemperatureC ?? ""), onChange: (e) => setForm((f) => ({ ...f, intakeTemperatureC: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Target Storage Temp (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: String(form.targetStorageTemperatureC ?? ""), onChange: (e) => setForm((f) => ({ ...f, targetStorageTemperatureC: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pre-Cooling Start Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: String(form.preCoolingStartTime ?? ""), onChange: (e) => setForm((f) => ({ ...f, preCoolingStartTime: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pre-Cooling End Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: String(form.preCoolingEndTime ?? ""), onChange: (e) => setForm((f) => ({ ...f, preCoolingEndTime: e.target.value })) }),
          form.preCoolingEndTime && !form.achievedTemperatureC && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600 mt-1", children: "⏰ An alert will appear when this time is reached if no achieved temperature has been recorded." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Achieved Temperature (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: String(form.achievedTemperatureC ?? ""), onChange: (e) => setForm((f) => ({ ...f, achievedTemperatureC: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Storage Location" }),
          storageLocs.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.storageLocation ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, storageLocation: v === "__other__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select location…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              storageLocs.map((loc) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(loc.name), children: String(loc.name) }, String(loc.id))),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__other__", children: "Other / free text…" })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.storageLocation ?? ""), onChange: (e) => setForm((f) => ({ ...f, storageLocation: e.target.value })), placeholder: "Enter location…", className: "flex-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: () => setManageLocOpen(true), title: "Add managed locations", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Warehouse, { className: "w-3.5 h-3.5" }) })
          ] }),
          storageLocs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Add managed locations via the Locations button for a consistent pick-list." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 space-y-3 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "foreignBodyCheck", checked: Boolean(form.foreignBodyCheck), onCheckedChange: (v) => setForm((f) => ({ ...f, foreignBodyCheck: Boolean(v) })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "foreignBodyCheck", children: "Foreign body check completed?" })
            ] }),
            !form.foreignBodyCheck && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { marginLeft: 24, marginTop: 4, fontSize: "0.78rem", color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px" }, children: "This check is required — inspect produce thoroughly for foreign bodies before intake is recorded." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "pestDamageCheck", checked: Boolean(form.pestDamageCheck), onCheckedChange: (v) => setForm((f) => ({ ...f, pestDamageCheck: Boolean(v) })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "pestDamageCheck", children: "Pest damage check completed?" })
            ] }),
            !form.pestDamageCheck && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { marginLeft: 24, marginTop: 4, fontSize: "0.78rem", color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px" }, children: "Inspect produce for pest damage and contamination before storing." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "accepted", checked: form.accepted !== false, onCheckedChange: (v) => setForm((f) => ({ ...f, accepted: Boolean(v) })) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "accepted", children: "Batch accepted into store?" })
            ] }),
            batchRejected && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { marginLeft: 24, marginTop: 4, fontSize: "0.78rem", color: "#991b1b", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Rejection:" }),
              " Quarantine this batch, complete the rejection reason below, and notify your quality/compliance manager immediately."
            ] })
          ] })
        ] }),
        form.accepted === false && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rejection Reason" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.rejectionReason ?? ""), onChange: (e) => setForm((f) => ({ ...f, rejectionReason: e.target.value })), rows: 2, placeholder: "Describe why this batch was rejected…" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function PackhouseTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["horti-packhouse", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-packhouse-records`), { credentials: "include" }).then((r) => r.json()) });
  const { data: harvestRecords = [] } = useHarvestRecords(farmId);
  const { data: intakeRecords = [] } = useQuery({ queryKey: ["fp-intake", farmId], queryFn: () => fetch(api(`farms/${farmId}/fresh-produce-intake`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: (b) => fetch(api(`farms/${farmId}/horticulture-packhouse-records`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["horti-packhouse", farmId] });
      setOpen(false);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(api(`farms/${farmId}/horticulture-packhouse-records/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-packhouse", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  function onHarvestSelect(harvestId) {
    if (harvestId === "__none__") {
      setForm((f) => ({ ...f, harvestRecordId: "", harvestBatchRef: "" }));
      return;
    }
    const hr = harvestRecords.find((h) => String(h.id) === harvestId);
    if (hr) setForm((f) => ({ ...f, harvestRecordId: String(hr.id), harvestBatchRef: hr.harvestBatchRef }));
  }
  function onIntakeSelect(intakeId) {
    if (intakeId === "__none__") {
      setForm((f) => ({ ...f, intakeRecordId: "" }));
      return;
    }
    const ir = intakeRecords.find((r) => String(r.id) === intakeId);
    if (ir) setForm((f) => ({ ...f, intakeRecordId: String(ir.id), harvestBatchRef: String(ir.harvestBatchRef ?? f.harvestBatchRef), productName: String(ir.productName ?? f.productName) }));
  }
  const allPackhouseRecords = records;
  const [yearFilterPackhouse, setYearFilterPackhouse] = reactExports.useState("all");
  const yearsPackhouse = reactExports.useMemo(() => Array.from(new Set(allPackhouseRecords.map((r) => String(r.packingDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allPackhouseRecords]);
  const filteredPackhouseRecords = yearFilterPackhouse === "all" ? allPackhouseRecords : allPackhouseRecords.filter((r) => String(r.packingDate ?? "").startsWith(yearFilterPackhouse));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Packhouse & Despatch Records" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterPackhouse, onValueChange: setYearFilterPackhouse, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsPackhouse.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setForm({ labelChecked: false, metalDetectorCheck: false, allergenCheck: false });
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
          { key: "packingDate", label: "Packing Date", fmt: (r) => fmtDate(r.packingDate) },
          { key: "harvestBatchRef", label: "Batch Ref" },
          { key: "productName", label: "Product" },
          { key: "traceabilityCode", label: "Traceability Code" },
          { key: "quantityPackedKg", label: "Qty (kg)" },
          { key: "customerName", label: "Customer" }
        ],
        rows: filteredPackhouseRecords,
        onView: setViewRecord,
        onDelete: (r) => del.mutate(r.id)
      }
    ),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Packhouse Record — ",
        fmtDate(viewRecord.packingDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Packing Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.packingDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Harvest Batch Ref" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            fmt(viewRecord.harvestBatchRef),
            !!viewRecord.harvestRecordId && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 text-xs text-green-600", children: "● Linked to harvest" })
          ] })
        ] }),
        !!viewRecord.intakeRecordId && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Intake Record" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-green-700", children: "● Linked to pre-cooling intake record" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Product Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.productName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Traceability Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.traceabilityCode) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Quantity Packed (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.quantityPackedKg) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Pack Format" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.packFormat) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cold Store Temp (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.coldStoreTemperature) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Customer Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.customerName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Despatch Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.dispatchDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Despatch Note No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.despatchNoteNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Label Checked" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.labelChecked ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Metal Detector Check" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.metalDetectorCheck ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Allergen Check" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.allergenCheck ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, className: "max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Packhouse Record" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Harvest Record" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.harvestRecordId ? String(form.harvestRecordId) : "__none__", onValueChange: onHarvestSelect, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select harvest record…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Enter batch ref manually —" }),
              harvestRecords.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(h.id), children: [
                h.harvestBatchRef,
                " — ",
                fmtDate(h.harvestDate),
                " (",
                fmt(h.quantityKg),
                " kg)"
              ] }, h.id))
            ] })
          ] }),
          form.harvestRecordId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-1", children: "✓ Linked to harvest record." })
        ] }),
        intakeRecords.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Pre-Cooling / Intake Record" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.intakeRecordId ? String(form.intakeRecordId) : "__none__", onValueChange: onIntakeSelect, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select intake record…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— No intake record —" }),
              intakeRecords.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(r.id), children: [
                String(r.harvestBatchRef),
                " — ",
                fmtDate(r.intakeDate),
                " — ",
                String(r.productName)
              ] }, r.id))
            ] })
          ] }),
          form.intakeRecordId && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 mt-1", children: "✓ Linked — full field → intake → packhouse chain complete." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Packing Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.packingDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, packingDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Harvest Batch Ref *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.harvestBatchRef ?? ""), onChange: (e) => setForm((f) => ({ ...f, harvestBatchRef: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Product Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.productName ?? ""), onChange: (e) => setForm((f) => ({ ...f, productName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Traceability Code *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.traceabilityCode ?? ""), onChange: (e) => setForm((f) => ({ ...f, traceabilityCode: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quantity Packed (kg)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: String(form.quantityPackedKg ?? ""), onChange: (e) => setForm((f) => ({ ...f, quantityPackedKg: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pack Format" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.packFormat ?? ""), onChange: (e) => setForm((f) => ({ ...f, packFormat: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cold Store Temp (°C)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: String(form.coldStoreTemperature ?? ""), onChange: (e) => setForm((f) => ({ ...f, coldStoreTemperature: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Customer Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.customerName ?? ""), onChange: (e) => setForm((f) => ({ ...f, customerName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Despatch Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.dispatchDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, dispatchDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Despatch Note No." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.despatchNoteNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, despatchNoteNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 space-y-2", children: [["labelChecked", "Label checked?"], ["metalDetectorCheck", "Metal detector check?"], ["allergenCheck", "Allergen check completed?"]].map(([k, l]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: k, checked: Boolean(form[k]), onCheckedChange: (v) => setForm((f) => ({ ...f, [k]: Boolean(v) })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: k, children: l })
        ] }, k)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function AllergenTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["horti-allergen", farmId], queryFn: () => fetch(api(`farms/${farmId}/allergen-management`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({ mutationFn: (b) => fetch(api(`farms/${farmId}/allergen-management`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["horti-allergen", farmId] });
    setOpen(false);
    setForm({});
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(api(`farms/${farmId}/allergen-management/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-allergen", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const allAllergenRecords = records;
  const [yearFilterAllergen, setYearFilterAllergen] = reactExports.useState("all");
  const yearsAllergen = reactExports.useMemo(() => Array.from(new Set(allAllergenRecords.map((r) => String(r.reviewDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allAllergenRecords]);
  const filteredAllergenRecords = yearFilterAllergen === "all" ? allAllergenRecords : allAllergenRecords.filter((r) => String(r.reviewDate ?? "").startsWith(yearFilterAllergen));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Allergen Management Reviews" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterAllergen, onValueChange: setYearFilterAllergen, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsAllergen.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setForm({ labellingVerified: false });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Review"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [{ key: "reviewDate", label: "Review Date", fmt: (r) => fmtDate(r.reviewDate) }, { key: "reviewedBy", label: "Reviewed By" }, { key: "crossContaminationRisk", label: "Cross-Contamination Risk" }, { key: "nextReviewDate", label: "Next Review", fmt: (r) => fmtDate(r.nextReviewDate) }, { key: "labellingVerified", label: "Labelling Verified", fmt: (r) => r.labellingVerified ? "Yes" : "No" }], rows: filteredAllergenRecords, onView: setViewRecord, onDelete: (r) => del.mutate(r.id) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Allergen Review — ",
        fmtDate(viewRecord.reviewDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Review Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.reviewDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reviewed By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.reviewedBy) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cross Contamination Risk" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.crossContaminationRisk) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Staff Training Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.staffTrainingDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Review Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.nextReviewDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Labelling Verified" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.labellingVerified ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Control Measures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.controlMeasures) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.notes) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: setOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Allergen Management Review" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Review Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.reviewDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, reviewDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reviewed By *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.reviewedBy ?? ""), onChange: (e) => setForm((f) => ({ ...f, reviewedBy: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cross-Contamination Risk *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.crossContaminationRisk ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, crossContaminationRisk: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["None", "Low", "Medium", "High"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Staff Training Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.staffTrainingDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, staffTrainingDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Review Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.nextReviewDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, nextReviewDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "label", checked: Boolean(form.labellingVerified), onCheckedChange: (v) => setForm((f) => ({ ...f, labellingVerified: Boolean(v) })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "label", children: "Labelling verified?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Control Measures" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.controlMeasures ?? ""), onChange: (e) => setForm((f) => ({ ...f, controlMeasures: e.target.value })), rows: 3 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function FreshProducePage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = reactExports.useState(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tab");
    const valid = ["blocks", "crops", "water", "harvest", "intake", "packhouse", "allergen", "reports"];
    return t && valid.includes(t) ? t : "blocks";
  });
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Fresh Produce", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "blocks", onClick: () => setTab("blocks"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "w-3.5 h-3.5 mr-1" }),
        "Blocks"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "crops", onClick: () => setTab("crops"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Leaf, { className: "w-3.5 h-3.5 mr-1" }),
        "Crops"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "water", onClick: () => setTab("water"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-3.5 h-3.5 mr-1" }),
        "Water Tests"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "harvest", onClick: () => setTab("harvest"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-3.5 h-3.5 mr-1" }),
        "Harvest"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "intake", onClick: () => setTab("intake"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Thermometer, { className: "w-3.5 h-3.5 mr-1" }),
        "Intake"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "packhouse", onClick: () => setTab("packhouse"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Warehouse, { className: "w-3.5 h-3.5 mr-1" }),
        "Packhouse"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "allergen", onClick: () => setTab("allergen"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 mr-1" }),
        "Allergens"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "reports", onClick: () => setTab("reports"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-3.5 h-3.5 mr-1" }),
        "Season Report"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
      tab === "blocks" && /* @__PURE__ */ jsxRuntimeExports.jsx(BlocksTab, { farmId }),
      tab === "crops" && /* @__PURE__ */ jsxRuntimeExports.jsx(CropsTab, { farmId }),
      tab === "water" && /* @__PURE__ */ jsxRuntimeExports.jsx(WaterTestsTab, { farmId }),
      tab === "harvest" && /* @__PURE__ */ jsxRuntimeExports.jsx(HarvestTab, { farmId }),
      tab === "intake" && /* @__PURE__ */ jsxRuntimeExports.jsx(IntakeTab, { farmId }),
      tab === "packhouse" && /* @__PURE__ */ jsxRuntimeExports.jsx(PackhouseTab, { farmId }),
      tab === "allergen" && /* @__PURE__ */ jsxRuntimeExports.jsx(AllergenTab, { farmId }),
      tab === "reports" && /* @__PURE__ */ jsxRuntimeExports.jsx(FreshProduceReports, { farmId })
    ] }) })
  ] }) });
}
export {
  AllergenTab,
  CropsTab,
  HarvestTab,
  IntakeTab,
  PackhouseTab,
  WaterTestsTab,
  FreshProducePage as default
};
