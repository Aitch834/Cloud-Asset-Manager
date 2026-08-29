import { s as createLucideIcon, r as reactExports, m as useQuery, c as useQueryClient, S as useMutation, j as jsxRuntimeExports, L as Label, e as LoaderCircle, I as Input, d as Button, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, N as DialogMutationError, J as DialogFooter, b as useAppStore, R as Redirect, n as Card, o as CardContent, a as useToast, T as Plus, C as Checkbox } from "./index-De1tglSK.js";
import { R as RaiseTaskDialog } from "./RaiseTaskDialog-BaXSGnhE.js";
import { S as Sprout, e as ChartColumn, G as Gauge, T as TrendingUp, I as Info, A as AppLayout, c as ClipboardList } from "./AppLayout-AS9SVnyn.js";
import { C as ConfirmDialog } from "./confirm-dialog-BN_vutkw.js";
import { T as Textarea } from "./textarea-CBg38xcQ.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-Dei_DleH.js";
import { T as TabBar, a as TabButton } from "./tab-button-4aFIv4ML.js";
import { u as usePersistedTab } from "./use-persisted-tab-DVhLG8SL.js";
import { a as usePersistedFilter } from "./use-persisted-filter-D4-NjDsd.js";
import { R as RecordAttachments } from "./RecordAttachments-CgEF402k.js";
import { u as useFarmMembers } from "./use-farm-members-LE4RjZVn.js";
import { S as StaffSelect } from "./staff-select-CVLv5MRN.js";
import { a as apiUrl } from "./api-Dhdsf4oM.js";
import { B as Badge } from "./badge-DdTg9Quq.js";
import { U as UK_MONTHLY_ET0_MM_DAY, m as matchCropProfile, D as DEFAULT_FIELD_CAPACITY_MM, g as getFieldCapacity, C as CirclePlus } from "./irrigationData-XOxbqNmA.js";
import { C as CircleAlert } from "./database-biFMvKzg.js";
import { T as TriangleAlert } from "./triangle-alert-BgC10_2a.js";
import { T as Thermometer } from "./thermometer-DxK0kkDk.js";
import { C as CloudRain } from "./cloud-rain-CKQMazbO.js";
import { g as generateCategoricalChart, X as XAxis, Y as YAxis, f as formatAxisMap, R as ResponsiveContainer, T as Tooltip, _ as ReferenceLine, B as Bar, C as Cell } from "./generateCategoricalChart-ici0DDv5.js";
import { A as Area } from "./Area-DE7dEPb3.js";
import { C as CartesianGrid } from "./CartesianGrid-CjULNmXg.js";
import { B as BarChart } from "./BarChart-Crh0qG2U.js";
import { M as Minus } from "./minus-Dc_EN5eA.js";
import { T as TrendingDown } from "./trending-down-CZBOIPhn.js";
import { D as Droplets } from "./shield-alert-B-jggoZQ.js";
import { T as Tractor } from "./tractor-DrfHD4BB.js";
import { F as FileCheck } from "./file-check-DXGoHqoj.js";
import { E as Eye } from "./eye-CKZarkpw.js";
import { P as Pencil } from "./pencil-DO5zIt8-.js";
import { T as Trash2 } from "./trash-2-C6rbWPxa.js";
import { P as Play } from "./play-DGfHiirT.js";
import "./use-safe-clerk-BjI1zB3C.js";
import "./shield-check-0tyWLCtv.js";
import "./index-EPPPfGm0.js";
import "./index-Be2cfGKd.js";
import "./chevron-up-Dv2JA1wd.js";
import "./use-upload-BgoxmqoD.js";
import "./paperclip-BCTmhmKu.js";
import "./upload-1N4YkEns.js";
import "./image-CXvb_1SM.js";
import "./download-DLcJwFHO.js";
const __iconNode$1 = [
  [
    "path",
    { d: "M10 18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a3 3 0 0 1-3-3 1 1 0 0 1 1-1z", key: "ioqxb1" }
  ],
  [
    "path",
    {
      d: "M13 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1l-.81 3.242a1 1 0 0 1-.97.758H8",
      key: "1rs59n"
    }
  ],
  ["path", { d: "M14 4h3a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-3", key: "105ega" }],
  ["path", { d: "M18 6h4", key: "66u95g" }],
  ["path", { d: "m5 10-2 8", key: "xt2lic" }],
  ["path", { d: "m7 18 2-8", key: "1bzku2" }]
];
const Drill = createLucideIcon("drill", __iconNode$1);
const __iconNode = [
  ["path", { d: "M15 12h-5", key: "r7krc0" }],
  ["path", { d: "M15 8h-5", key: "1khuty" }],
  ["path", { d: "M19 17V5a2 2 0 0 0-2-2H4", key: "zz82l3" }],
  [
    "path",
    {
      d: "M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3",
      key: "1ph1d7"
    }
  ]
];
const ScrollText = createLucideIcon("scroll-text", __iconNode);
var AreaChart = generateCategoricalChart({
  chartName: "AreaChart",
  GraphicalChild: Area,
  axisComponents: [{
    axisType: "xAxis",
    AxisComp: XAxis
  }, {
    axisType: "yAxis",
    AxisComp: YAxis
  }],
  formatAxisMap
});
function extraterrestrialRadiation(dayOfYear2) {
  const Gsc = 0.082;
  const lat = 0.9076;
  const dr = 1 + 0.033 * Math.cos(2 * Math.PI / 365 * dayOfYear2);
  const delta = 0.409 * Math.sin(2 * Math.PI / 365 * dayOfYear2 - 1.39);
  const ws = Math.acos(-Math.tan(lat) * Math.tan(delta));
  const Ra = 24 * 60 / Math.PI * Gsc * dr * (ws * Math.sin(lat) * Math.sin(delta) + Math.cos(lat) * Math.cos(delta) * Math.sin(ws));
  return Math.max(0, Ra);
}
function dayOfYear(dateStr) {
  const d = new Date(dateStr);
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 864e5);
}
function hargreavesET0(tmax, tmin, doy) {
  const tmean = (tmax + tmin) / 2;
  const Ra = extraterrestrialRadiation(doy);
  const et0MJ = 23e-4 * (tmean + 17.8) * Math.pow(Math.max(0, tmax - tmin), 0.5) * Ra;
  return Math.max(0, et0MJ / 2.45);
}
function fallbackET0(dateStr) {
  const month = new Date(dateStr).getMonth();
  return UK_MONTHLY_ET0_MM_DAY[month];
}
function getKc(profile, plantingDate, harvestDate, currentDate) {
  const plant = new Date(plantingDate).getTime();
  const harvest = harvestDate ? new Date(harvestDate).getTime() : plant + 180 * 864e5;
  const current = new Date(currentDate).getTime();
  if (current <= plant) return profile.Kc_ini;
  if (current >= harvest) return profile.Kc_end;
  const elapsed = (current - plant) / (harvest - plant);
  if (elapsed < profile.fracDev) return profile.Kc_ini;
  if (elapsed < profile.fracMid) {
    const t2 = (elapsed - profile.fracDev) / (profile.fracMid - profile.fracDev);
    return profile.Kc_ini + t2 * (profile.Kc_mid - profile.Kc_ini);
  }
  if (elapsed < profile.fracLate) return profile.Kc_mid;
  const t = (elapsed - profile.fracLate) / (1 - profile.fracLate);
  return profile.Kc_mid + t * (profile.Kc_end - profile.Kc_mid);
}
function computeSMD(readings, cropProfile, fieldCapacityMm, plantingDate, harvestDate) {
  const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date));
  let smd = 0;
  return sorted.map((day) => {
    const kc = cropProfile && plantingDate ? getKc(cropProfile, plantingDate, harvestDate ?? void 0, day.date) : 1;
    const hasStation = day.tmax != null && day.tmin != null;
    const et0 = hasStation ? hargreavesET0(day.tmax, day.tmin, dayOfYear(day.date)) : fallbackET0(day.date);
    const etC = et0 * kc;
    const rain = day.rainfall ?? 0;
    smd = Math.max(0, Math.min(fieldCapacityMm, smd + etC - rain));
    return { date: day.date, et0, etC, rainfall: rain, smd, kc, stationData: hasStation };
  });
}
function getGrowthStage(profile, plantingDate, harvestDate, today) {
  if (!profile || !plantingDate) return "Unknown";
  const plant = new Date(plantingDate).getTime();
  const harvest = harvestDate ? new Date(harvestDate).getTime() : plant + 180 * 864e5;
  const current = new Date(today).getTime();
  if (current <= plant) return "Initial";
  const elapsed = (current - plant) / (harvest - plant);
  if (elapsed < profile.fracDev) return "Initial";
  if (elapsed < profile.fracMid) return "Development";
  if (elapsed < profile.fracLate) return "Mid-season";
  return "Late season";
}
function computeForecastVerdict(opts) {
  const { currentSmdMm, forecastDailyMm, dailyEtcMm, fieldCapacityMm } = opts;
  if (currentSmdMm <= 0 || forecastDailyMm.length === 0) return null;
  let smd = currentSmdMm;
  let forecastTotal = 0;
  for (const day of forecastDailyMm) {
    forecastTotal += day.mm;
    smd = Math.max(0, Math.min(fieldCapacityMm, smd + dailyEtcMm - day.mm));
  }
  const verdict = smd <= 0 ? "sufficient" : smd < currentSmdMm * 0.5 ? "partial" : "insufficient";
  return { projectedSmd: smd, forecastTotal, verdict };
}
function getSmdStatus(smd, criticalSmdMm) {
  if (smd <= criticalSmdMm * 0.4) return "OK";
  if (smd <= criticalSmdMm * 0.8) return "Building";
  if (smd <= criticalSmdMm * 1.2) return "At Threshold";
  return "Critical";
}
function computeScenarios(opts) {
  const {
    currentSmdMm,
    irrigateMm,
    costPerMmHa,
    fieldAreaHa,
    cropPricePerTonne,
    typicalYieldTha,
    Ky,
    fieldCapacityMm,
    criticalSmdMm,
    expectedRainfall7dMm,
    currentDailyEtcMm
  } = opts;
  const HORIZON = 14;
  const FORECAST_DAYS = 7;
  const dailyRainInForecast = expectedRainfall7dMm / FORECAST_DAYS;
  const stressRange = Math.max(1, fieldCapacityMm - criticalSmdMm);
  const clamp = (v) => Math.max(0, Math.min(fieldCapacityMm, v));
  function simulate(irrigateAtDay) {
    let smd = currentSmdMm;
    let postIrrigSmd = currentSmdMm;
    let sumEtaEtm = 0;
    for (let day = 0; day < HORIZON; day++) {
      if (day === irrigateAtDay) {
        smd = clamp(smd - irrigateMm);
        postIrrigSmd = smd;
      }
      const etaEtm = smd <= criticalSmdMm ? 1 : Math.max(0, 1 - (smd - criticalSmdMm) / stressRange);
      sumEtaEtm += etaEtm;
      const dailyRain = day < FORECAST_DAYS ? dailyRainInForecast : 0;
      smd = clamp(smd + currentDailyEtcMm - dailyRain);
    }
    return {
      day14Smd: smd,
      meanEtaEtm: sumEtaEtm / HORIZON,
      postIrrigSmd
    };
  }
  const nowSim = simulate(0);
  const wait7Sim = simulate(7);
  const skipSim = simulate(HORIZON);
  const skipYieldLossFrac = Math.max(0, Math.min(0.5, Ky * (1 - skipSim.meanEtaEtm)));
  const skipYieldLossTha = typicalYieldTha * skipYieldLossFrac;
  const skipRevLoss = skipYieldLossTha * fieldAreaHa * cropPricePerTonne;
  function buildResult(label, sim, irrigMm) {
    const irrigCostPerHa = irrigMm * costPerMmHa;
    const irrigCostTotal = irrigCostPerHa * fieldAreaHa;
    const yieldLossFrac = Math.max(0, Math.min(0.5, Ky * (1 - sim.meanEtaEtm)));
    const yieldLossTha = typicalYieldTha * yieldLossFrac;
    const yieldLossRevLoss = yieldLossTha * fieldAreaHa * cropPricePerTonne;
    const revenueSaved = Math.max(0, skipRevLoss - yieldLossRevLoss);
    return {
      label,
      irrigationMm: irrigMm,
      irrigationCostPerHa: irrigCostPerHa,
      irrigationCostTotal: irrigCostTotal,
      projectedSmdAfterMm: sim.postIrrigSmd,
      // SMD immediately post-application
      projectedSmd14Mm: sim.day14Smd,
      // end-of-horizon SMD (context display)
      etaEtmRatio: sim.meanEtaEtm,
      // mean ETa/ETm over HORIZON days
      yieldLossFraction: yieldLossFrac,
      yieldLossTha,
      yieldLossRevenueLoss: yieldLossRevLoss,
      irrigationRevenueSaved: revenueSaved,
      netBenefit: revenueSaved - irrigCostTotal
    };
  }
  return {
    irrigateNow: buildResult("Irrigate now", nowSim, irrigateMm),
    wait7: buildResult("Wait 7 days", wait7Sim, irrigateMm),
    skip: buildResult("Don't irrigate", skipSim, 0)
  };
}
const LS_KEY = (farmId) => `irrigation-advisor-defaults-${farmId}`;
const LS_METHOD_KEY = (farmId) => `irrigation-advisor-method-${farmId}`;
const DEFAULT_IRRIGATION_METHOD = "Overhead sprinkler";
function loadLastMethod$1(farmId) {
  try {
    return localStorage.getItem(LS_METHOD_KEY(farmId)) ?? DEFAULT_IRRIGATION_METHOD;
  } catch {
  }
  return DEFAULT_IRRIGATION_METHOD;
}
function saveLastMethod$1(farmId, method) {
  try {
    localStorage.setItem(LS_METHOD_KEY(farmId), method);
  } catch {
  }
}
function loadDefaults(farmId) {
  try {
    const raw = localStorage.getItem(LS_KEY(farmId));
    if (raw) return { ...emptyDefaults(), ...JSON.parse(raw) };
  } catch {
  }
  return emptyDefaults();
}
function emptyDefaults() {
  return { costPerMmHa: "3.50", cropPricePerTonne: "220", expectedRainfall7dMm: "5", irrigateMm: "25" };
}
function saveDefaults(farmId, d) {
  try {
    localStorage.setItem(LS_KEY(farmId), JSON.stringify(d));
  } catch {
  }
}
function padReadings(readings) {
  const today = /* @__PURE__ */ new Date();
  const result = [];
  const byDate = {};
  for (const r of readings) byDate[r.date] = r;
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    result.push(byDate[key] ?? { date: key });
  }
  return result;
}
const statusColour = {
  "OK": { bg: "bg-green-50 border-green-200", text: "text-green-800", dot: "bg-green-500" },
  "Building": { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-800", dot: "bg-yellow-500" },
  "At Threshold": { bg: "bg-orange-50 border-orange-200", text: "text-orange-800", dot: "bg-orange-500" },
  "Critical": { bg: "bg-red-50 border-red-200", text: "text-red-800", dot: "bg-red-500" }
};
const statusDesc = {
  "OK": "Soil has adequate moisture — no irrigation needed yet.",
  "Building": "Deficit is growing — monitor closely over the next few days.",
  "At Threshold": "You are approaching the critical deficit for this crop — consider irrigating.",
  "Critical": "Deficit exceeds the critical threshold — crop is likely under stress. Irrigate promptly."
};
function fmtGbp(v) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(v);
}
function fmtPct(v) {
  return `${(v * 100).toFixed(1)}%`;
}
function SmdGauge({ smd, fc, critical }) {
  const pct = Math.min(100, smd / fc * 100);
  const critPct = critical / fc * 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Field Capacity (0 mm)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "Max Deficit (",
        fc,
        " mm)"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-4 bg-muted rounded-full overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute top-0 bottom-0 w-0.5 bg-orange-400 z-10",
          style: { left: `${critPct}%` },
          title: `Critical threshold: ${critical} mm`
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: `h-full rounded-full transition-all ${pct > critPct * 1.2 ? "bg-red-500" : pct > critPct ? "bg-orange-400" : pct > critPct * 0.6 ? "bg-yellow-400" : "bg-green-500"}`,
          style: { width: `${pct}%` }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center text-sm font-semibold", children: [
      smd.toFixed(1),
      " mm SMD"
    ] })
  ] });
}
function ScenarioCard({ result, accent, icon, onLog }) {
  const netPositive = result.netBenefit >= 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border p-4 space-y-3 ${accent}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-sm", children: result.label })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Irrigation applied" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-right", children: [
        result.irrigationMm,
        " mm"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Irrigation cost" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right", children: fmtGbp(result.irrigationCostTotal) }),
      result.irrigationMm > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "SMD after application" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-right", children: [
          result.projectedSmdAfterMm.toFixed(1),
          " mm"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Est. SMD (day 14)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-right", children: [
        result.projectedSmd14Mm.toFixed(1),
        " mm"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Yield loss est. (day 14)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-right", children: [
        result.yieldLossTha.toFixed(2),
        " t/ha (",
        fmtPct(result.yieldLossFraction),
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Revenue saved vs. no-irrig." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-right", children: fmtGbp(result.irrigationRevenueSaved) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "col-span-2 border-t pt-1.5 mt-0.5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-semibold ${netPositive ? "text-green-700" : "text-red-700"}`, children: "Net benefit" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-bold text-right ${netPositive ? "text-green-700" : "text-red-700"}`, children: [
        netPositive ? "+" : "",
        fmtGbp(result.netBenefit)
      ] })
    ] }),
    result.irrigationMm > 0 && onLog && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        size: "sm",
        variant: "outline",
        className: "w-full text-xs h-7",
        onClick: onLog,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CirclePlus, { className: "w-3.5 h-3.5 mr-1" }),
          "Log this application"
        ]
      }
    )
  ] });
}
function LogApplicationDialog({
  farmId,
  prefill,
  onClose
}) {
  const qc = useQueryClient();
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const { data: licences = [] } = useQuery({
    queryKey: ["water-abstraction-licences", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then((r) => {
      if (!r.ok) throw new Error("Failed");
      return r.json();
    }),
    staleTime: 2 * 60 * 1e3
  });
  const fieldIdNum = prefill.fieldId ? parseInt(prefill.fieldId) : null;
  const { data: fieldRecords = [] } = useQuery({
    queryKey: ["irrig-records-field", farmId, fieldIdNum],
    queryFn: () => {
      const params = fieldIdNum ? `?fieldId=${fieldIdNum}` : "";
      return fetch(apiUrl(`farms/${farmId}/irrigation-records${params}`), { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      });
    },
    enabled: !!fieldIdNum,
    staleTime: 2 * 60 * 1e3
  });
  const derivedLicenceId = reactExports.useMemo(() => {
    const mru = fieldRecords.find((r) => r.licenceId != null);
    if (mru?.licenceId != null) {
      if (licences.some((l) => l.id === mru.licenceId)) return String(mru.licenceId);
    }
    if (licences.length === 1) return String(licences[0].id);
    return "";
  }, [fieldRecords, licences]);
  const [form, setForm] = reactExports.useState({
    irrigationDate: today,
    cropType: prefill.cropName,
    applicationDepthMm: String(prefill.applicationDepthMm),
    irrigationMethod: loadLastMethod$1(farmId),
    status: "closed",
    licenceId: "",
    notes: ""
  });
  const licencePrefillAppliedRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    if (licencePrefillAppliedRef.current) return;
    if (derivedLicenceId) {
      licencePrefillAppliedRef.current = true;
      setForm((f) => ({ ...f, licenceId: derivedLicenceId }));
    }
  }, [derivedLicenceId]);
  const save = useMutation({
    mutationFn: (b) => fetch(apiUrl(`farms/${farmId}/irrigation-records`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(b)
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      saveLastMethod$1(farmId, form.irrigationMethod);
      qc.invalidateQueries({ queryKey: ["irrig-records", farmId] });
      qc.invalidateQueries({ queryKey: ["irrig-records-field", farmId, fieldIdNum] });
      onClose();
    }
  });
  function handleSave() {
    const payload = {
      irrigationDate: form.irrigationDate,
      cropType: form.cropType || void 0,
      applicationDepthMm: form.applicationDepthMm ? parseFloat(form.applicationDepthMm) : void 0,
      irrigationMethod: form.irrigationMethod,
      status: form.status,
      notes: form.notes || void 0
    };
    if (prefill.fieldId) payload.fieldId = parseInt(prefill.fieldId);
    if (form.licenceId) payload.licenceId = parseInt(form.licenceId);
    save.mutate(payload);
  }
  const prefillSource = reactExports.useMemo(() => {
    if (!form.licenceId || !derivedLicenceId || form.licenceId !== derivedLicenceId) return null;
    const mru = fieldRecords.find((r) => r.licenceId != null && String(r.licenceId) === form.licenceId);
    if (mru) return "previously used for this field";
    if (licences.length === 1) return "only licence on this farm";
    return null;
  }, [form.licenceId, derivedLicenceId, fieldRecords, licences]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: (v) => {
    if (!v) {
      save.reset();
      onClose();
    }
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "32rem" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Log Irrigation Application" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground -mt-1", children: [
      "Pre-filled from the ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: prefill.scenarioLabel }),
      " scenario — adjust before saving. The record will appear in the Applications tab."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Date *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "date",
            value: form.irrigationDate,
            onChange: (e) => setForm((f) => ({ ...f, irrigationDate: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: prefill.fieldName, readOnly: true, className: "bg-muted/50 text-muted-foreground" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.cropType,
            onChange: (e) => setForm((f) => ({ ...f, cropType: e.target.value })),
            placeholder: "e.g. Wheat"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Depth (mm)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            step: "0.1",
            value: form.applicationDepthMm,
            onChange: (e) => setForm((f) => ({ ...f, applicationDepthMm: e.target.value }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Water Source / Licence" }),
        licences.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: "",
            readOnly: true,
            disabled: true,
            className: "bg-muted/50 text-muted-foreground",
            placeholder: "No abstraction licences set up"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: form.licenceId || "__none__",
              onValueChange: (v) => setForm((f) => ({ ...f, licenceId: v === "__none__" ? "" : v })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select a licence…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                  licences.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(l.id), children: [
                    l.licenceNumber,
                    l.waterSource ? ` — ${l.waterSource}` : "",
                    l.sourceType ? ` (${l.sourceType})` : ""
                  ] }, l.id))
                ] })
              ]
            }
          ),
          prefillSource && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [
            "Auto-selected: ",
            prefillSource,
            "."
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Method *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.irrigationMethod, onValueChange: (v) => setForm((f) => ({ ...f, irrigationMethod: v })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Overhead sprinkler", "Drip / trickle", "Furrow / flood", "Pivot", "Boom", "Traveller", "Hand-held", "Other"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status, onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "closed", children: "Complete" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "open", children: "Open (in progress)" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.notes,
            onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })),
            placeholder: "Optional notes"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — please try again." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: save.isPending, children: [
        save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }) : null,
        "Log Application"
      ] })
    ] })
  ] }) });
}
function makeManualDays() {
  const rows = [];
  for (let i = 6; i >= 0; i--) {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - i);
    rows.push({ date: d.toISOString().slice(0, 10), tmax: "", tmin: "", rainfall: "" });
  }
  return rows;
}
function IrrigationAdvisorTab({ farmId }) {
  const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
  const [selectedFieldId, setSelectedFieldId] = reactExports.useState("");
  const [year, setYear] = reactExports.useState(String(currentYear));
  const [logPrefill, setLogPrefill] = reactExports.useState(null);
  const { data: platformConfig, isFetched: platformConfigFetched } = useQuery({
    queryKey: ["platform-config"],
    queryFn: () => fetch(apiUrl("platform-config")).then((r) => r.json()).then((d) => d.config),
    staleTime: 5 * 60 * 1e3
  });
  const { data: farmRecord, isFetched: farmRecordFetched } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(apiUrl(`farms/${farmId}`), { credentials: "include" }).then((r) => r.json()).then((d) => d.record ?? d),
    staleTime: 5 * 60 * 1e3,
    enabled: !!farmId
  });
  const [defaults, setDefaultsState] = reactExports.useState(() => loadDefaults(farmId));
  const prevFarmIdRef = reactExports.useRef(farmId);
  reactExports.useEffect(() => {
    if (prevFarmIdRef.current === farmId) return;
    prevFarmIdRef.current = farmId;
    setDefaultsState(loadDefaults(farmId));
    setForecastFlag(false);
    configSeededForFarmRef.current = null;
    forecastSeededForFarmRef.current = null;
  }, [farmId]);
  const configSeededForFarmRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (configSeededForFarmRef.current === farmId) return;
    if (!farmRecordFetched || !platformConfigFetched) return;
    configSeededForFarmRef.current = farmId;
    setDefaultsState((prev) => {
      const next = { ...prev };
      const farmCost = farmRecord?.irrigationCostPerMmHa;
      if (farmCost) {
        next.costPerMmHa = farmCost;
      } else if (!localStorage.getItem(LS_KEY(farmId))) {
        const serverCost = platformConfig?.["irrigation.costPerMmHa"];
        if (serverCost) next.costPerMmHa = serverCost;
      }
      const farmCropPrice = farmRecord?.irrigationCropPricePerTonne;
      if (farmCropPrice) next.cropPricePerTonne = farmCropPrice;
      const farmAppRate = farmRecord?.irrigationApplicationRateMm;
      if (farmAppRate) next.irrigateMm = farmAppRate;
      return next;
    });
  }, [farmRecord, farmRecordFetched, platformConfig, platformConfigFetched, farmId]);
  const qc = useQueryClient();
  const saveCostDefault = useMutation({
    mutationFn: (costPerMmHa) => fetch(apiUrl(`farms/${farmId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ irrigationCostPerMmHa: costPerMmHa })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r.json();
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-detail", farmId] });
    }
  });
  const saveCropPriceDefault = useMutation({
    mutationFn: (cropPricePerTonne) => fetch(apiUrl(`farms/${farmId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ irrigationCropPricePerTonne: cropPricePerTonne })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r.json();
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-detail", farmId] });
    }
  });
  const saveAppRateDefault = useMutation({
    mutationFn: (irrigateMm) => fetch(apiUrl(`farms/${farmId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ irrigationApplicationRateMm: irrigateMm })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r.json();
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["farm-detail", farmId] });
    }
  });
  function numericDiffersFromDb(session, dbVal) {
    const s = session.trim();
    const sEmpty = s === "";
    const dEmpty = dbVal == null || dbVal === "";
    if (sEmpty !== dEmpty) return true;
    if (sEmpty && dEmpty) return false;
    return parseFloat(s) !== parseFloat(dbVal);
  }
  const dbCost = farmRecord?.irrigationCostPerMmHa;
  const costDiffersFromDb = numericDiffersFromDb(defaults.costPerMmHa, dbCost);
  const dbCropPrice = farmRecord?.irrigationCropPricePerTonne;
  const cropPriceDiffersFromDb = numericDiffersFromDb(defaults.cropPricePerTonne, dbCropPrice);
  const dbAppRate = farmRecord?.irrigationApplicationRateMm;
  const appRateDiffersFromDb = numericDiffersFromDb(defaults.irrigateMm, dbAppRate);
  function updateDefault(key, value) {
    const next = { ...defaults, [key]: value };
    setDefaultsState(next);
    if (key !== "expectedRainfall7dMm" && rainfallFromForecastRef.current) {
      const { expectedRainfall7dMm: _omit, ...rest } = next;
      saveDefaults(farmId, rest);
    } else {
      saveDefaults(farmId, next);
    }
  }
  const [useManual, setUseManual] = reactExports.useState(false);
  const [manualRows, setManualRows] = reactExports.useState(() => makeManualDays());
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["irrigation-advisor", farmId, selectedFieldId, year],
    queryFn: () => {
      const params = new URLSearchParams({ year });
      if (selectedFieldId) params.set("fieldId", selectedFieldId);
      return fetch(apiUrl(`farms/${farmId}/irrigation-advisor?${params}`), { credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      });
    }
  });
  const forecastSeededForFarmRef = reactExports.useRef(null);
  const [rainfallFromForecast, setRainfallFromForecast] = reactExports.useState(false);
  const rainfallFromForecastRef = reactExports.useRef(false);
  function setForecastFlag(val) {
    rainfallFromForecastRef.current = val;
    setRainfallFromForecast(val);
  }
  reactExports.useEffect(() => {
    if (!data || isFetching) return;
    if (forecastSeededForFarmRef.current === farmId) return;
    if (data.forecastRainfall7dMm == null) {
      forecastSeededForFarmRef.current = farmId;
      return;
    }
    forecastSeededForFarmRef.current = farmId;
    const stored = localStorage.getItem(LS_KEY(farmId));
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.expectedRainfall7dMm != null) return;
      } catch {
      }
    }
    setDefaultsState((prev) => ({
      ...prev,
      expectedRainfall7dMm: String(data.forecastRainfall7dMm)
    }));
    setForecastFlag(true);
  }, [data, isFetching, farmId]);
  const field = reactExports.useMemo(
    () => data?.fields.find((f) => String(f.id) === selectedFieldId) ?? null,
    [data, selectedFieldId]
  );
  const areaHa = field ? parseFloat(String(field.areaHectares ?? "0")) || 1 : 1;
  const cropProfile = reactExports.useMemo(
    () => data?.assignment ? matchCropProfile(data.assignment.cropName) : null,
    [data?.assignment]
  );
  const fieldCapacity = reactExports.useMemo(
    () => field ? getFieldCapacity(field.soilType) : DEFAULT_FIELD_CAPACITY_MM,
    [field]
  );
  const smdSeries = reactExports.useMemo(() => {
    let dailyReadings;
    if (useManual || !data?.hasWeatherStation) {
      const manualByDate = {};
      for (const r of manualRows) manualByDate[r.date] = r;
      dailyReadings = padReadings([]).map((d) => {
        const m = manualByDate[d.date];
        if (!m) return d;
        return {
          date: d.date,
          tmax: m.tmax ? parseFloat(m.tmax) : void 0,
          tmin: m.tmin ? parseFloat(m.tmin) : void 0,
          rainfall: m.rainfall ? parseFloat(m.rainfall) : void 0
        };
      });
    } else {
      const stationRows = (data?.dailyWeather ?? []).map((r) => ({
        date: r.date,
        tmax: r.tmax != null ? r.tmax : void 0,
        tmin: r.tmin != null ? r.tmin : void 0,
        rainfall: r.rainfallMm != null ? r.rainfallMm : void 0
      }));
      dailyReadings = padReadings(stationRows);
    }
    return computeSMD(
      dailyReadings,
      cropProfile,
      fieldCapacity,
      data?.assignment?.plantingDate ?? null,
      data?.assignment?.expectedHarvestDate
    );
  }, [data, useManual, manualRows, cropProfile, fieldCapacity]);
  const todaySmd = smdSeries.length ? smdSeries[smdSeries.length - 1]?.smd ?? 0 : 0;
  const todayEtC = smdSeries.length ? smdSeries[smdSeries.length - 1]?.etC ?? 0 : 0;
  const smdStatus = cropProfile ? getSmdStatus(todaySmd, cropProfile.criticalSmdMm) : getSmdStatus(todaySmd, fieldCapacity * 0.5);
  const criticalThreshold = cropProfile?.criticalSmdMm ?? fieldCapacity * 0.5;
  const growthStage = getGrowthStage(
    cropProfile,
    data?.assignment?.plantingDate ?? null,
    data?.assignment?.expectedHarvestDate,
    (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
  );
  const scenarios = reactExports.useMemo(() => {
    if (!cropProfile) return null;
    const costPerMmHa = parseFloat(defaults.costPerMmHa) || 3.5;
    const cropPrice = parseFloat(defaults.cropPricePerTonne) || 220;
    const rain7d = parseFloat(defaults.expectedRainfall7dMm) || 0;
    const irrigateMm = parseFloat(defaults.irrigateMm) || 25;
    return computeScenarios({
      currentSmdMm: todaySmd,
      irrigateMm,
      costPerMmHa,
      fieldAreaHa: areaHa,
      cropPricePerTonne: cropPrice,
      typicalYieldTha: cropProfile.typicalYieldTha,
      Ky: cropProfile.Ky,
      fieldCapacityMm: fieldCapacity,
      criticalSmdMm: criticalThreshold,
      expectedRainfall7dMm: rain7d,
      currentDailyEtcMm: todayEtC
    });
  }, [cropProfile, todaySmd, todayEtC, defaults, areaHa, fieldCapacity, criticalThreshold]);
  const chartData = reactExports.useMemo(() => {
    const historical = smdSeries.slice(-30).map((d, i, arr) => ({
      date: d.date.slice(5),
      // MM-DD
      smd: parseFloat(d.smd.toFixed(1)),
      rain: parseFloat(d.rainfall.toFixed(1)),
      etC: parseFloat(d.etC.toFixed(2)),
      // Anchor the projection line at today so it connects without a gap
      smdProjected: i === arr.length - 1 ? parseFloat(d.smd.toFixed(1)) : null
    }));
    const forecastDays = data?.forecastDailyMm;
    const forecastTotal = data?.forecastRainfall7dMm;
    let dailyForecast = null;
    if (forecastDays && forecastDays.length > 0) {
      dailyForecast = forecastDays.slice(0, 7);
    } else if (forecastTotal != null) {
      const dailyMm = forecastTotal / 7;
      dailyForecast = Array.from({ length: 7 }, (_, i) => {
        const d = /* @__PURE__ */ new Date();
        d.setDate(d.getDate() + i + 1);
        return { date: d.toISOString().slice(0, 10), mm: dailyMm };
      });
    }
    if (!dailyForecast) return historical;
    let smd = todaySmd;
    const projected = dailyForecast.map((day) => {
      smd = Math.max(0, Math.min(fieldCapacity, smd + todayEtC - day.mm));
      return {
        date: day.date.slice(5),
        smd: null,
        rain: null,
        etC: null,
        smdProjected: parseFloat(smd.toFixed(1))
      };
    });
    return [...historical, ...projected];
  }, [smdSeries, data, todaySmd, todayEtC, fieldCapacity]);
  const todayChartDate = (/* @__PURE__ */ new Date()).toISOString().slice(5, 10);
  const statusStyle = statusColour[smdStatus];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold text-base flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "w-4 h-4 text-green-600" }),
          "Irrigation Advisor"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Soil moisture deficit model + what-if cost analysis for arable fields." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Year" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: year, onValueChange: setYear, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-24 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [currentYear, currentYear - 1, currentYear - 2].map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(y), children: y }, y)) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-sm", children: "Field" }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }),
        " Loading fields…"
      ] }) : isError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-red-600 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4" }),
        " Failed to load irrigation advisor data."
      ] }) : !data?.fields.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground py-2 italic", children: "No fields found. Add fields in the Field & Crop Management module first." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: selectedFieldId, onValueChange: setSelectedFieldId, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "max-w-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose a field…" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: data.fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(f.id), children: [
          f.name,
          f.fieldReference ? ` (${f.fieldReference})` : "",
          f.areaHectares ? ` — ${parseFloat(String(f.areaHectares)).toFixed(2)} ha` : ""
        ] }, f.id)) })
      ] })
    ] }),
    selectedFieldId && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border bg-muted/30 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Soil Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: field?.soilType ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Field Capacity (AWC)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            fieldCapacity,
            " mm"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Crop (",
            year,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: data?.assignment ? `${data.assignment.cropName}${data.assignment.variety ? ` — ${data.assignment.variety}` : ""}` : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "italic text-muted-foreground", children: "No crop assigned" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Growth Stage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: growthStage })
        ] }),
        (farmRecord?.irrigationAbstractionSource || platformConfig?.["irrigation.abstractionSource"]) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Abstraction Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: farmRecord?.irrigationAbstractionSource || platformConfig?.["irrigation.abstractionSource"] })
        ] }),
        cropProfile && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Kc (today)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: smdSeries.length ? smdSeries[smdSeries.length - 1]?.kc.toFixed(2) : "—" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Critical SMD" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              criticalThreshold,
              " mm"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Yield Response (Ky)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: cropProfile.Ky })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Daily ETc (est.)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
              todayEtC.toFixed(2),
              " mm/day"
            ] })
          ] })
        ] })
      ] }),
      field && !field.soilType && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: `/fields?editFieldId=${selectedFieldId}`,
          className: "flex items-center gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 hover:bg-yellow-100 transition-colors no-underline",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Soil type not set" }),
              " — field capacity is estimated at ",
              DEFAULT_FIELD_CAPACITY_MM,
              " mm (medium loam default). Set the soil type on this field for a more accurate calculation."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium underline underline-offset-2", children: "Edit field →" })
          ]
        }
      ),
      data && !data.hasWeatherStation && !useManual && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Thermometer, { className: "w-4 h-4 mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "No weather station connected." }),
          " ",
          "SMD is estimated from UK 52°N climate normals — accuracy will be lower than with real station data.",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "underline font-medium ml-1",
              onClick: () => setUseManual(true),
              children: "Enter readings manually instead"
            }
          )
        ] })
      ] }),
      data?.hasWeatherStation && !useManual && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CloudRain, { className: "w-3.5 h-3.5 text-blue-500" }),
        "Using 60 days of weather station data (Hargreaves-Samani ET₀).",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "underline", onClick: () => setUseManual(true), children: "Switch to manual entry" })
      ] }),
      useManual && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: "Manual Weather Entry (last 7 days)" }),
          data?.hasWeatherStation && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs underline text-muted-foreground", onClick: () => setUseManual(false), children: "Switch back to station data" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "text-xs w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 pr-2 font-medium text-muted-foreground", children: "Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 pr-2 font-medium text-muted-foreground", children: "Max °C" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 pr-2 font-medium text-muted-foreground", children: "Min °C" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1 font-medium text-muted-foreground", children: "Rainfall mm" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: manualRows.map((row, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2", children: row.date }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.1",
                value: row.tmax,
                onChange: (e) => {
                  const next = [...manualRows];
                  next[i] = { ...next[i], tmax: e.target.value };
                  setManualRows(next);
                },
                className: "h-6 w-20 text-xs"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1 pr-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.1",
                value: row.tmin,
                onChange: (e) => {
                  const next = [...manualRows];
                  next[i] = { ...next[i], tmin: e.target.value };
                  setManualRows(next);
                },
                className: "h-6 w-20 text-xs"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "0.1",
                value: row.rainfall,
                onChange: (e) => {
                  const next = [...manualRows];
                  next[i] = { ...next[i], rainfall: e.target.value };
                  setManualRows(next);
                },
                className: "h-6 w-20 text-xs"
              }
            ) })
          ] }, row.date)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-lg border p-4 space-y-4 ${statusStyle.bg}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block w-2.5 h-2.5 rounded-full ${statusStyle.dot}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-semibold text-sm ${statusStyle.text}`, children: smdStatus })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: (/* @__PURE__ */ new Date()).toLocaleDateString("en-GB") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-xs ${statusStyle.text}`, children: statusDesc[smdStatus] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SmdGauge, { smd: todaySmd, fc: fieldCapacity, critical: criticalThreshold })
      ] }),
      chartData.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-4 h-4 text-blue-500" }),
            "30-day Soil Moisture Deficit"
          ] }),
          data?.forecastDailyMm || data?.forecastRainfall7dMm != null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "inline-block w-6 border-t-2 border-dashed border-blue-400",
                style: { borderStyle: "dashed" }
              }
            ),
            "7-day forecast projection"
          ] }) : null
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 200, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: chartData, margin: { top: 4, right: 8, left: 0, bottom: 0 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 10 }, interval: "preserveStartEnd" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 10 }, unit: " mm" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tooltip,
            {
              contentStyle: { fontSize: 11 },
              formatter: (val, name) => {
                if (val === null || val === void 0) return [null, null];
                if (name === "smdProjected") return [`${Number(val).toFixed(1)} mm`, "Projected (with forecast rain)"];
                if (name === "smd") return [`${Number(val).toFixed(1)} mm`, "SMD"];
                if (name === "rain") return [`${Number(val).toFixed(1)} mm`, "Rainfall"];
                return [`${Number(val).toFixed(2)} mm`, "ETc"];
              }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ReferenceLine,
            {
              x: todayChartDate,
              stroke: "#64748b",
              strokeDasharray: "3 3",
              strokeWidth: 1,
              label: { value: "Today", position: "insideTop", fontSize: 10, fill: "#64748b" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ReferenceLine,
            {
              y: criticalThreshold,
              stroke: "#f97316",
              strokeDasharray: "4 2",
              label: { value: `Critical ${criticalThreshold}mm`, position: "insideTopRight", fontSize: 9, fill: "#f97316" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Area,
            {
              type: "monotone",
              dataKey: "smd",
              stroke: "#3b82f6",
              fill: "#93c5fd",
              fillOpacity: 0.3,
              name: "smd",
              strokeWidth: 1.5
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Area,
            {
              type: "monotone",
              dataKey: "smdProjected",
              stroke: "#3b82f6",
              fill: "#93c5fd",
              fillOpacity: 0.12,
              name: "smdProjected",
              strokeWidth: 1.5,
              strokeDasharray: "5 3",
              strokeOpacity: 0.65,
              connectNulls: true
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Gauge, { className: "w-4 h-4 text-purple-500" }),
          "What-if Parameters",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(saved per farm)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Cost per mm/ha (£)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "0.1",
                  min: "0",
                  value: defaults.costPerMmHa,
                  onChange: (e) => {
                    saveCostDefault.reset();
                    updateDefault("costPerMmHa", e.target.value);
                  },
                  className: "h-8 text-sm"
                }
              ),
              costDiffersFromDb && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "h-8 px-2 text-xs whitespace-nowrap shrink-0",
                  onClick: () => saveCostDefault.mutate(defaults.costPerMmHa),
                  disabled: saveCostDefault.isPending,
                  title: "Save this value as the farm default (persists across devices)",
                  children: saveCostDefault.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : saveCostDefault.isSuccess ? "Saved ✓" : "Save as default"
                }
              )
            ] }),
            saveCostDefault.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: "Failed to save — please try again." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Pump + abstraction cost" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Crop price (£/t)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "1",
                  min: "0",
                  value: defaults.cropPricePerTonne,
                  onChange: (e) => {
                    saveCropPriceDefault.reset();
                    updateDefault("cropPricePerTonne", e.target.value);
                  },
                  className: "h-8 text-sm"
                }
              ),
              cropPriceDiffersFromDb && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "h-8 px-2 text-xs whitespace-nowrap shrink-0",
                  onClick: () => saveCropPriceDefault.mutate(defaults.cropPricePerTonne),
                  disabled: saveCropPriceDefault.isPending,
                  title: "Save this value as the farm default (persists across devices)",
                  children: saveCropPriceDefault.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : saveCropPriceDefault.isSuccess ? "Saved ✓" : "Save as default"
                }
              )
            ] }),
            saveCropPriceDefault.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: "Failed to save — please try again." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Current market price" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Application rate (mm)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  type: "number",
                  step: "1",
                  min: "0",
                  value: defaults.irrigateMm,
                  onChange: (e) => {
                    saveAppRateDefault.reset();
                    updateDefault("irrigateMm", e.target.value);
                  },
                  className: "h-8 text-sm"
                }
              ),
              appRateDiffersFromDb && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  className: "h-8 px-2 text-xs whitespace-nowrap shrink-0",
                  onClick: () => saveAppRateDefault.mutate(defaults.irrigateMm),
                  disabled: saveAppRateDefault.isPending,
                  title: "Save this value as the farm default (persists across devices)",
                  children: saveAppRateDefault.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3 h-3 animate-spin" }) : saveAppRateDefault.isSuccess ? "Saved ✓" : "Save as default"
                }
              )
            ] }),
            saveAppRateDefault.isError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600", children: "Failed to save — please try again." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "mm per irrigation run" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs", children: "Expected rain (7d, mm)" }),
              rainfallFromForecast && data?.forecastRainfall7dMm != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CloudRain, { className: "w-2.5 h-2.5" }),
                "Forecast"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "number",
                step: "1",
                min: "0",
                value: defaults.expectedRainfall7dMm,
                onChange: (e) => {
                  setForecastFlag(false);
                  updateDefault("expectedRainfall7dMm", e.target.value);
                },
                className: "h-8 text-sm"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: rainfallFromForecast && data?.forecastRainfall7dMm != null ? "Pre-filled from Open-Meteo forecast" : "Forecast / estimate" })
          ] })
        ] })
      ] }),
      data?.forecastDailyMm && data.forecastDailyMm.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudRain, { className: "w-4 h-4 text-blue-500" }),
          "7-Day Rainfall Forecast",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground font-normal", children: "(Open-Meteo)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 130, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          BarChart,
          {
            data: data.forecastDailyMm.map((d) => ({
              day: (/* @__PURE__ */ new Date(d.date + "T00:00:00")).toLocaleDateString("en-GB", { weekday: "short" }),
              mm: d.mm
            })),
            margin: { top: 4, right: 8, left: 0, bottom: 0 },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#e5e7eb", vertical: false }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "day", tick: { fontSize: 11 } }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 10 }, unit: " mm", width: 42 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Tooltip,
                {
                  contentStyle: { fontSize: 11 },
                  formatter: (val) => [`${val.toFixed(1)} mm`, "Rainfall"]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "mm", radius: [3, 3, 0, 0], maxBarSize: 40, children: data.forecastDailyMm.map((d, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                Cell,
                {
                  fill: d.mm >= 5 ? "#3b82f6" : d.mm >= 1 ? "#93c5fd" : "#e5e7eb"
                },
                i
              )) })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Bars shaded darker blue for ≥ 5 mm days. Total: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            data.forecastRainfall7dMm ?? 0,
            " mm"
          ] }),
          " over 7 days."
        ] }),
        (() => {
          if (!data.forecastDailyMm) return null;
          const vr = computeForecastVerdict({
            currentSmdMm: todaySmd,
            forecastDailyMm: data.forecastDailyMm,
            dailyEtcMm: todayEtC,
            fieldCapacityMm: fieldCapacity
          });
          if (!vr) return null;
          const { projectedSmd, forecastTotal, verdict } = vr;
          const style = verdict === "sufficient" ? { bg: "bg-green-50 border-green-200", text: "text-green-800", dot: "bg-green-500" } : verdict === "partial" ? { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-800", dot: "bg-yellow-500" } : { bg: "bg-red-50 border-red-200", text: "text-red-800", dot: "bg-red-500" };
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium ${style.bg} ${style.text}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block w-2 h-2 rounded-full shrink-0 ${style.dot}` }),
            verdict === "sufficient" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "Forecast ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                forecastTotal.toFixed(1),
                " mm"
              ] }),
              " closes the",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                todaySmd.toFixed(1),
                " mm"
              ] }),
              " deficit — rain likely sufficient, consider holding off irrigation."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "Forecast ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                forecastTotal.toFixed(1),
                " mm"
              ] }),
              " vs",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                todaySmd.toFixed(1),
                " mm"
              ] }),
              " deficit — projected SMD",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                projectedSmd.toFixed(1),
                " mm"
              ] }),
              " after 7-day ET",
              verdict === "insufficient" ? " — consider irrigating" : "",
              "."
            ] })
          ] });
        })()
      ] }) : data && data.forecastDailyMm === null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-muted bg-muted/20 p-3 text-xs text-muted-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CloudRain, { className: "w-3.5 h-3.5 shrink-0" }),
        "No rainfall forecast available — set a farm location to enable the 7-day forecast chart."
      ] }),
      cropProfile && scenarios ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-green-500" }),
          "Decision Scenarios — ",
          field?.name,
          data?.assignment && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-normal", children: [
            "(",
            data.assignment.cropName,
            ", ",
            areaHa.toFixed(2),
            " ha)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ScenarioCard,
            {
              result: scenarios.irrigateNow,
              accent: "border bg-green-50/50",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-green-600" }),
              onLog: () => setLogPrefill({
                fieldId: selectedFieldId,
                fieldName: field?.name ?? "",
                cropName: data?.assignment?.cropName ?? "",
                applicationDepthMm: scenarios.irrigateNow.irrigationMm,
                scenarioLabel: scenarios.irrigateNow.label
              })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ScenarioCard,
            {
              result: scenarios.wait7,
              accent: "border bg-yellow-50/50",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-4 h-4 text-yellow-600" }),
              onLog: () => setLogPrefill({
                fieldId: selectedFieldId,
                fieldName: field?.name ?? "",
                cropName: data?.assignment?.cropName ?? "",
                applicationDepthMm: scenarios.wait7.irrigationMm,
                scenarioLabel: scenarios.wait7.label
              })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ScenarioCard,
            {
              result: scenarios.skip,
              accent: "border bg-red-50/50",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "w-4 h-4 text-red-600" })
            }
          )
        ] })
      ] }) : selectedFieldId && !cropProfile && data?.assignment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "w-4 h-4 shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Crop ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: data.assignment.cropName }),
          " is not in the built-in irrigation profile database — yield loss estimates are unavailable. The SMD chart above is still valid."
        ] })
      ] }),
      selectedFieldId && !data?.assignment && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg border border-muted bg-muted/20 p-4 text-sm text-muted-foreground italic text-center", children: [
        "No crop assignment found for this field in ",
        year,
        ". Assign a crop in Field & Crop Management to enable yield loss scenarios."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-muted/40 border p-3 text-xs text-muted-foreground space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: "Methodology note" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "ET₀ is calculated via Hargreaves-Samani (1985) when temperature data are available, otherwise UK 52°N monthly climate normals (ADAS / Met Office) are used. Crop coefficients (Kc) and yield response factors (Ky) follow FAO-56 / AHDB Irrigation Management Guide values. Yield loss estimates use the linear FAO-56 model and should be treated as indicative — actual losses depend on growth stage, variety, and soil variability. This tool does not replace agronomic or water management professional advice." })
      ] })
    ] }),
    logPrefill && /* @__PURE__ */ jsxRuntimeExports.jsx(
      LogApplicationDialog,
      {
        farmId,
        prefill: logPrefill,
        onClose: () => setLogPrefill(null)
      }
    )
  ] });
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
        (onEdit || onDelete || onView) && /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1 whitespace-nowrap", children: [
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
function LicencesTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [raiseTaskFor, setRaiseTaskFor] = reactExports.useState(null);
  const { data: licences = [], isLoading } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({ mutationFn: (b) => fetch(editing ? apiUrl(`farms/${farmId}/water-abstraction-licences/${editing.id}`) : apiUrl(`farms/${farmId}/water-abstraction-licences`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["water-licences", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/water-abstraction-licences/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["water-licences", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const openEdit = (r) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])));
    setOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Water Sources & Abstraction Licences" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Each licence defines a water source (borehole, river pump, reservoir, etc.). Set a cost per m³ here to enable automatic water cost calculation on irrigation records and season reports." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setForm({ meterRequired: true, returnRequired: true, issuingAuthority: "Environment Agency" });
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Source / Licence"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [{ key: "licenceNumber", label: "Licence No." }, { key: "sourceType", label: "Source Type" }, { key: "waterSource", label: "Source Description" }, { key: "purposeOfUse", label: "Purpose" }, { key: "annualLicencedVolumeM3", label: "Annual m³" }, { key: "costPerM3", label: "£/m³" }, { key: "licenceExpiryDate", label: "Expiry", fmt: (r) => fmtDate(r.licenceExpiryDate) }], rows: licences, onView: setViewRecord, onEdit: openEdit, onDelete: (r) => del.mutate(r.id), deleteMutation: del }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Licence" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Licence Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.licenceNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Issuing Authority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.issuingAuthority) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Source Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.sourceType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Water Source Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.waterSource) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Purpose of Use" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.purposeOfUse) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Cost per m³ (£)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.costPerM3 ? `£${parseFloat(String(viewRecord.costPerM3)).toFixed(4)}` : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Abstraction Point" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.abstractionPointDescription) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Annual Volume (m³)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.annualLicencedVolumeM3) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Daily Volume (m³)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.dailyLicencedVolumeM3) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.licenceStartDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.licenceExpiryDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Meter Serial Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.meterSerialNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Return Deadline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.returnDeadline) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Meter Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.meterRequired ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Return Required" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.returnRequired ? "Yes" : "No" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: "Edit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", className: "text-purple-700 border-purple-200 hover:bg-purple-50", onClick: () => {
          setRaiseTaskFor(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ClipboardList, { className: "w-3.5 h-3.5 mr-1" }),
          "Raise Task"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "48rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        editing ? "Edit" : "Add",
        " Water Source & Abstraction Licence"
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.sourceType ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, sourceType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select source type" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Borehole / Well", "River / Stream", "Reservoir / Pond", "Ditch / Drain", "Mains / Public Supply", "Recycled / Rainwater Harvesting", "Other"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Licence Number *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.licenceNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, licenceNumber: e.target.value })), placeholder: "e.g. 12/54/18/0012" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Source Location / Description *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.waterSource ?? ""), onChange: (e) => setForm((f) => ({ ...f, waterSource: e.target.value })), placeholder: "e.g. North borehole at GR SP123456, river pump on River Evenlode" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Issuing Authority *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.issuingAuthority ?? "Environment Agency"), onChange: (e) => setForm((f) => ({ ...f, issuingAuthority: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Purpose of Use *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.purposeOfUse ?? ""), onValueChange: (v) => setForm((f) => ({ ...f, purposeOfUse: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Irrigation", "Livestock Watering", "Spray Washing", "Amenity", "Fish Farming", "Human Consumption"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Abstraction Point Detail" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.abstractionPointDescription ?? ""), onChange: (e) => setForm((f) => ({ ...f, abstractionPointDescription: e.target.value })), rows: 2, placeholder: "Grid reference, OS coordinates, or description of the intake" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Annual Licensed Volume (m³)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.annualLicencedVolumeM3 ?? ""), onChange: (e) => setForm((f) => ({ ...f, annualLicencedVolumeM3: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Daily Licensed Volume (m³)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.dailyLicencedVolumeM3 ?? ""), onChange: (e) => setForm((f) => ({ ...f, dailyLicencedVolumeM3: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cost per m³ (£) — for cost reporting" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", value: String(form.costPerM3 ?? ""), onChange: (e) => setForm((f) => ({ ...f, costPerM3: e.target.value })), placeholder: "e.g. 0.0150" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Flow Rate (litres/sec)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: String(form.flowRateLitresPerSec ?? ""), onChange: (e) => setForm((f) => ({ ...f, flowRateLitresPerSec: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Licence Start Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.licenceStartDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, licenceStartDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Licence Expiry Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.licenceExpiryDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, licenceExpiryDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meter Serial Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.meterSerialNumber ?? ""), onChange: (e) => setForm((f) => ({ ...f, meterSerialNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Return Deadline (e.g. 31 Jan)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.returnDeadline ?? ""), onChange: (e) => setForm((f) => ({ ...f, returnDeadline: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "meter", checked: Boolean(form.meterRequired), onCheckedChange: (v) => setForm((f) => ({ ...f, meterRequired: Boolean(v) })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "meter", children: "Meter required?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "ret", checked: Boolean(form.returnRequired), onCheckedChange: (v) => setForm((f) => ({ ...f, returnRequired: Boolean(v) })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "ret", children: "Return required?" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) }),
    raiseTaskFor && /* @__PURE__ */ jsxRuntimeExports.jsx(
      RaiseTaskDialog,
      {
        farmId,
        open: !!raiseTaskFor,
        onClose: () => setRaiseTaskFor(null),
        defaultTitle: `Licence Review — ${raiseTaskFor.licenceNumber ?? "Water Abstraction Licence"}`,
        defaultDescription: `Authority: ${raiseTaskFor.issuingAuthority ?? "—"} · Expiry: ${raiseTaskFor.licenceExpiryDate ? new Date(String(raiseTaskFor.licenceExpiryDate)).toLocaleDateString("en-GB") : "—"} · Return deadline: ${raiseTaskFor.returnDeadline ?? "—"}`,
        module: "water-irrigation"
      }
    )
  ] });
}
function MeterReadingsTab({ farmId }) {
  const { data: licences = [] } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then((r) => r.json()) });
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const [licenceManuallySelected, setLicenceManuallySelected] = reactExports.useState(false);
  const { data: readings = [], isLoading } = useQuery({ queryKey: ["water-readings", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/water-meter-readings`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({ mutationFn: (b) => fetch(apiUrl(`farms/${farmId}/water-meter-readings`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["water-readings", farmId] });
    setOpen(false);
    setForm({});
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/water-meter-readings/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["water-readings", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const allReadings = readings;
  const derivedLicenceId = reactExports.useMemo(() => {
    const licArr = licences;
    const recs = allReadings;
    const mru = [...recs].sort((a, b) => String(b.readingDate ?? "").localeCompare(String(a.readingDate ?? ""))).find((r) => r.licenceId != null);
    if (mru?.licenceId != null && licArr.some((l) => String(l.id) === String(mru.licenceId))) return String(mru.licenceId);
    if (licArr.length === 1) return String(licArr[0].id);
    return null;
  }, [licences, allReadings]);
  reactExports.useEffect(() => {
    if (!open || licenceManuallySelected) return;
    if (derivedLicenceId) setForm((f) => ({ ...f, licenceId: derivedLicenceId }));
  }, [derivedLicenceId, open, licenceManuallySelected]);
  const licenceHint = reactExports.useMemo(() => {
    if (!derivedLicenceId || !form.licenceId || form.licenceId !== derivedLicenceId || licenceManuallySelected) return null;
    const recs = allReadings;
    const hasMru = recs.some((r) => r.licenceId != null && String(r.licenceId) === derivedLicenceId);
    return hasMru ? "pre-filled from last use" : "pre-filled — only licence on farm";
  }, [derivedLicenceId, form.licenceId, licenceManuallySelected, allReadings]);
  reactExports.useEffect(() => {
    const licId = form.licenceId;
    const reading = parseFloat(form.meterReading);
    if (!licId || isNaN(reading) || !form.meterReading) return;
    const licence = licences.find((l) => String(l.id) === licId);
    const licReadings = allReadings.filter((r) => String(r.licenceId) === licId).sort((a, b) => String(a.readingDate ?? "").localeCompare(String(b.readingDate ?? "")));
    const prevReading = licReadings.length > 0 ? parseFloat(String(licReadings[licReadings.length - 1]?.meterReading ?? "0")) : 0;
    const volume = Math.max(0, reading - prevReading);
    const yearStr = (form.readingDate ?? (/* @__PURE__ */ new Date()).toISOString()).slice(0, 4);
    const ytdBefore = licReadings.filter((r) => String(r.readingDate ?? "").startsWith(yearStr)).reduce((s, r) => s + parseFloat(String(r.volumeAbstractedM3 ?? "0")), 0);
    const cumYtd = ytdBefore + volume;
    const annualVol = parseFloat(String(licence?.annualLicencedVolumeM3 ?? "0"));
    setForm((f) => ({
      ...f,
      volumeAbstractedM3: volume.toFixed(2),
      cumulativeYtdM3: cumYtd.toFixed(2),
      percentOfAnnualAllocation: annualVol > 0 ? (cumYtd / annualVol * 100).toFixed(1) : f.percentOfAnnualAllocation
    }));
  }, [form.licenceId, form.meterReading, form.readingDate]);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "water-meter-readings", filter: "year", farmId, defaultValue: "all" });
  const years = reactExports.useMemo(() => Array.from(new Set(allReadings.map((r) => String(r.readingDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allReadings]);
  const filteredReadings = yearFilter === "all" ? allReadings : allReadings.filter((r) => String(r.readingDate ?? "").startsWith(yearFilter));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Abstraction Meter Readings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilter, onValueChange: setYearFilter, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            years.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setLicenceManuallySelected(false);
          setForm({});
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Log Reading"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [{ key: "readingDate", label: "Date", fmt: (r) => fmtDate(r.readingDate) }, { key: "licenceId", label: "Licence", fmt: (r) => {
      const l = licences.find((x) => String(x.id) === String(r.licenceId));
      return l ? `${String(l.licenceNumber)}${l.sourceType ? ` (${String(l.sourceType)})` : ""}` : fmt(r.licenceId);
    } }, { key: "meterReading", label: "Meter Reading" }, { key: "volumeAbstractedM3", label: "Abstracted (m³)" }, { key: "cumulativeYtdM3", label: "YTD (m³)" }, { key: "percentOfAnnualAllocation", label: "% of Allocation" }, { key: "readBy", label: "Read By" }], rows: filteredReadings, onView: setViewRecord, onDelete: (r) => del.mutate(r.id), deleteMutation: del }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Meter Reading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reading Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.readingDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Licence" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: (() => {
            const l = licences.find((x) => String(x.id) === String(viewRecord.licenceId));
            return l ? `${String(l.licenceNumber)}${l.sourceType ? ` (${String(l.sourceType)})` : ""}` : "—";
          })() })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Meter Reading" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.meterReading) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Volume Abstracted (m³)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.volumeAbstractedM3) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "YTD Cumulative (m³)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.cumulativeYtdM3) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "% of Annual Allocation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            fmt(viewRecord.percentOfAnnualAllocation),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Read By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.readBy) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "36rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Meter Reading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reading Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.readingDate ?? "", onChange: (e) => setForm((f) => ({ ...f, readingDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Licence *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.licenceId ?? "", onValueChange: (v) => {
            setLicenceManuallySelected(true);
            setForm((f) => ({ ...f, licenceId: v }));
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select licence" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: licences.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(l.id), children: [
              String(l.licenceNumber),
              l.sourceType ? ` (${String(l.sourceType)})` : ""
            ] }, String(l.id))) })
          ] }),
          licenceHint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-blue-600 mt-1", children: licenceHint })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meter Reading *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.meterReading ?? "", onChange: (e) => setForm((f) => ({ ...f, meterReading: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Volume Abstracted (m³) ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(auto)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.volumeAbstractedM3 ?? "", onChange: (e) => setForm((f) => ({ ...f, volumeAbstractedM3: e.target.value })), placeholder: "Auto-calculated from reading" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "YTD Cumulative (m³) ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(auto)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.cumulativeYtdM3 ?? "", onChange: (e) => setForm((f) => ({ ...f, cumulativeYtdM3: e.target.value })), placeholder: "Auto-calculated" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "% of Annual Allocation ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "(auto)" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.percentOfAnnualAllocation ?? "", onChange: (e) => setForm((f) => ({ ...f, percentOfAnnualAllocation: e.target.value })), placeholder: "Auto-calculated" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Read By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.readBy ?? "", onChange: (e) => setForm((f) => ({ ...f, readBy: e.target.value })) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function BoreholeTestsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [mode, setMode] = reactExports.useState("log");
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: tests = [], isLoading } = useQuery({ queryKey: ["borehole-tests", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/borehole-tests`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({
    mutationFn: (b) => {
      const url = editing ? apiUrl(`farms/${farmId}/borehole-tests/${editing.id}`) : apiUrl(`farms/${farmId}/borehole-tests`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["borehole-tests", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/borehole-tests/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["borehole-tests", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  function openAdd() {
    setEditing(null);
    setMode("log");
    setForm({});
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setMode("edit");
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  }
  function openEnterResult(r) {
    setEditing(r);
    setMode("result");
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  }
  const allBoreRows = tests;
  const [yearFilterBore, setYearFilterBore] = usePersistedFilter({ page: "water-borehole-tests", filter: "year", farmId, defaultValue: "all" });
  const yearsBore = reactExports.useMemo(() => Array.from(new Set(allBoreRows.map((r) => String(r.testDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allBoreRows]);
  const rows = yearFilterBore === "all" ? allBoreRows : allBoreRows.filter((r) => String(r.testDate ?? "").startsWith(yearFilterBore));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Borehole & Well Tests" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterBore, onValueChange: setYearFilterBore, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsBore.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Log Sample"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : rows.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground italic py-6 text-center", children: "No borehole test records yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted/50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: ["Test Date", "Testing Company", "Bacteriological", "Chemical", "Overall Result", "Next Test Due", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-4 py-3 font-medium text-muted-foreground text-xs", children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y", children: rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: fmtDate(r.testDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: fmt(r.testingCompany) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: r.bacteriologicalResult ? String(r.bacteriologicalResult) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-600 font-medium", children: "Awaiting results" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs", children: r.chemicalResult ? String(r.chemicalResult) : "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: !r.overallResult ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700", children: "Awaiting results" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${String(r.overallResult).startsWith("Pass") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`, children: String(r.overallResult) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: fmtDate(r.nextTestDueDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-wrap", children: [
          !r.overallResult && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", className: "h-7 px-2 text-xs text-amber-700 border-amber-300 hover:bg-amber-50", onClick: () => openEnterResult(r), children: "Enter results" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => setViewRecord(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-7 px-2 text-destructive", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }) })
        ] }) })
      ] }, String(r.id))) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Borehole Test" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Test Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.testDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Testing Company" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.testingCompany) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Static Water Level (m)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.staticWaterLevelM) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Pumping Water Level (m)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.pumpingWaterLevelM) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Bacteriological Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.bacteriologicalResult) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Chemical Result" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.chemicalResult) })
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
        setEditing(null);
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: mode === "log" ? "Log Borehole Test Sample" : mode === "result" ? "Enter Borehole Test Results" : "Edit Borehole Test Record" }) }),
      mode === "log" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground -mt-1", children: "Record the sampling visit now. Return to enter laboratory results once the report arrives." }),
      mode === "result" && editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground -mt-1", children: [
        "Sample from ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: fmtDate(editing.testDate) }),
        editing.testingCompany ? ` · ${editing.testingCompany}` : "",
        ". Enter results from your lab report."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        mode !== "result" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Test Date *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.testDate ?? "", onChange: (e) => setForm((f) => ({ ...f, testDate: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Testing Company" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.testingCompany ?? "", onChange: (e) => setForm((f) => ({ ...f, testingCompany: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Static Water Level (m)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.staticWaterLevelM ?? "", onChange: (e) => setForm((f) => ({ ...f, staticWaterLevelM: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pumping Water Level (m)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: form.pumpingWaterLevelM ?? "", onChange: (e) => setForm((f) => ({ ...f, pumpingWaterLevelM: e.target.value })) })
          ] })
        ] }),
        mode !== "log" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Bacteriological Result" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.bacteriologicalResult ?? "", onValueChange: (v) => setForm((f) => ({ ...f, bacteriologicalResult: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Pass", "Pass with treatment", "Fail", "Retest required"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Chemical Result" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.chemicalResult ?? "", onValueChange: (v) => setForm((f) => ({ ...f, chemicalResult: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Pass", "Pass with treatment", "Fail", "Retest required"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Overall Result *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.overallResult ?? "", onValueChange: (v) => setForm((f) => ({ ...f, overallResult: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Pass", "Pass with treatment", "Fail", "Retest required"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
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
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setEditing(null);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: mode === "log" ? "Log Sample" : mode === "result" ? "Save Results" : "Save Changes" })
      ] })
    ] }) })
  ] });
}
const LS_IRRIG_METHOD_KEY = (farmId) => `irrigation-advisor-method-${farmId}`;
const DEFAULT_IRRIG_METHOD = "Overhead sprinkler";
function loadLastMethod(farmId) {
  try {
    return localStorage.getItem(LS_IRRIG_METHOD_KEY(farmId)) ?? DEFAULT_IRRIG_METHOD;
  } catch {
  }
  return DEFAULT_IRRIG_METHOD;
}
function saveLastMethod(farmId, method) {
  try {
    localStorage.setItem(LS_IRRIG_METHOD_KEY(farmId), method);
  } catch {
  }
}
function IrrigationRecordsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [viewTab, setViewTab] = reactExports.useState("details");
  const [form, setForm] = reactExports.useState({});
  const [equipmentIds, setEquipmentIds] = reactExports.useState([]);
  const [confirmClose, setConfirmClose] = reactExports.useState(null);
  const [licenceManuallySelected, setLicenceManuallySelected] = reactExports.useState(false);
  const { data: licences = [] } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then((r) => r.json()) });
  const { data: fieldsData } = useQuery({ queryKey: ["fields", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/fields`), { credentials: "include" }).then((r) => r.json()) });
  const { data: contactsData } = useQuery({ queryKey: ["contacts", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/contacts`), { credentials: "include" }).then((r) => r.json()).then((d) => d.contacts ?? []) });
  const { data: equipmentData = [] } = useQuery({ queryKey: ["irrig-equip", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/irrigation-equipment`), { credentials: "include" }).then((r) => r.json()) });
  const { data: records = [], isLoading } = useQuery({ queryKey: ["irrig-records", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/irrigation-records`), { credentials: "include" }).then((r) => r.json()) });
  const mruFieldIdNum = !editing && open && form.fieldId && form.fieldId !== "__none__" ? parseInt(String(form.fieldId)) : null;
  const { data: fieldIrrigRecords = [] } = useQuery({
    queryKey: ["irrig-records-field", farmId, mruFieldIdNum],
    queryFn: () => fetch(apiUrl(`farms/${farmId}/irrigation-records?fieldId=${mruFieldIdNum}`), { credentials: "include" }).then((r) => r.json()),
    enabled: !!mruFieldIdNum
  });
  const derivedLicenceId = reactExports.useMemo(() => {
    if (editing) return null;
    const licArr = licences;
    if (mruFieldIdNum) {
      const fieldRecs = fieldIrrigRecords;
      const mru = fieldRecs.find((r) => r.licenceId != null);
      if (mru?.licenceId != null && licArr.some((l) => String(l.id) === String(mru.licenceId))) return String(mru.licenceId);
    }
    if (licArr.length === 1) return String(licArr[0].id);
    return null;
  }, [editing, mruFieldIdNum, fieldIrrigRecords, licences]);
  reactExports.useEffect(() => {
    if (!open || editing || licenceManuallySelected) return;
    if (derivedLicenceId) setForm((f) => ({ ...f, licenceId: derivedLicenceId }));
  }, [derivedLicenceId, open, editing, licenceManuallySelected]);
  const fields = Array.isArray(fieldsData?.records) ? fieldsData.records : [];
  const contacts = Array.isArray(contactsData) ? contactsData : [];
  const equipment = Array.isArray(equipmentData) ? equipmentData : [];
  const save = useMutation({
    mutationFn: (b) => {
      const url = editing ? apiUrl(`farms/${farmId}/irrigation-records/${editing.id}`) : apiUrl(`farms/${farmId}/irrigation-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) });
    },
    onSuccess: () => {
      if (form.irrigationMethod && form.irrigationMethod !== "__none__") saveLastMethod(farmId, String(form.irrigationMethod));
      qc.invalidateQueries({ queryKey: ["irrig-records", farmId] });
      setOpen(false);
      setEditing(null);
      setForm({});
      setEquipmentIds([]);
    },
    onError: () => toast({ title: "Save failed", variant: "destructive" })
  });
  const del = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/irrigation-records/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["irrig-records", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const closeEvent = useMutation({
    mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/irrigation-records/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status: "closed", endDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) })
    }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["irrig-records", farmId] });
      setConfirmClose(null);
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" })
  });
  function handleFieldSelect(fieldId) {
    setLicenceManuallySelected(false);
    if (!fieldId || fieldId === "__none__") {
      setForm((f) => ({ ...f, fieldId: "", areaIrrigatedHa: "", cropType: "", licenceId: "__none__" }));
      return;
    }
    const field = fields.find((f) => String(f.id) === fieldId);
    if (field) {
      setForm((f) => ({ ...f, fieldId, areaIrrigatedHa: field.areaHectares ? String(field.areaHectares) : String(f.areaIrrigatedHa ?? ""), cropType: field.currentUse ? String(field.currentUse) : String(f.cropType ?? ""), licenceId: "__none__" }));
    } else {
      setForm((f) => ({ ...f, fieldId, licenceId: "__none__" }));
    }
  }
  function openAdd() {
    setEditing(null);
    setLicenceManuallySelected(false);
    setForm({ irrigationDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), status: "open", irrigationMethod: loadLastMethod(farmId) });
    setEquipmentIds([]);
    setOpen(true);
  }
  function openEdit(r) {
    setEditing(r);
    setForm({ ...r });
    try {
      const ids = r.equipmentIdsJson ? JSON.parse(String(r.equipmentIdsJson)) : [];
      setEquipmentIds(Array.isArray(ids) ? ids.map(Number) : []);
    } catch {
      setEquipmentIds([]);
    }
    setOpen(true);
  }
  function handleSave() {
    const payload = { ...form };
    if (equipmentIds.length > 0) payload.equipmentIdsJson = JSON.stringify(equipmentIds);
    else delete payload.equipmentIdsJson;
    const meterVol = form.meterStartReading && form.meterEndReading ? Math.max(0, parseFloat(String(form.meterEndReading)) - parseFloat(String(form.meterStartReading))) : null;
    if (meterVol !== null) payload.volumeAppliedM3 = meterVol.toFixed(2);
    const vol = meterVol ?? (form.volumeAppliedM3 ? parseFloat(String(form.volumeAppliedM3)) : null);
    const area = form.areaIrrigatedHa ? parseFloat(String(form.areaIrrigatedHa)) : null;
    if (vol && area && area > 0) payload.applicationDepthMm = (vol / (area * 1e4) * 1e3).toFixed(1);
    if (form.fieldId && form.fieldId !== "__none__") payload.fieldId = parseInt(String(form.fieldId));
    else delete payload.fieldId;
    if (form.licenceId && form.licenceId !== "__none__") payload.licenceId = parseInt(String(form.licenceId));
    else delete payload.licenceId;
    if (form.startOperatorId && form.startOperatorId !== "__none__") payload.startOperatorId = parseInt(String(form.startOperatorId));
    else delete payload.startOperatorId;
    if (form.endOperatorId && form.endOperatorId !== "__none__") payload.endOperatorId = parseInt(String(form.endOperatorId));
    else delete payload.endOperatorId;
    save.mutate(payload);
  }
  function fieldLabel(r) {
    if (r.fieldName) return String(r.fieldName);
    if (r.fieldId) {
      const f = fields.find((x) => String(x.id) === String(r.fieldId));
      if (f) return String(f.name);
    }
    return r.fieldOrBlockDescription ? String(r.fieldOrBlockDescription) : "—";
  }
  function licenceLabel(r) {
    const l = licences.find((x) => String(x.id) === String(r.licenceId));
    if (!l) return "—";
    return `${String(l.licenceNumber)}${l.sourceType ? ` (${String(l.sourceType)})` : ""}`;
  }
  function contactName(id) {
    if (!id) return "—";
    const c = contacts.find((x) => String(x.id) === String(id));
    return c ? String(c.name) : "—";
  }
  function equipmentNames(r) {
    try {
      const ids = r.equipmentIdsJson ? JSON.parse(String(r.equipmentIdsJson)) : [];
      if (ids.length) return ids.map((id) => {
        const e = equipment.find((x) => String(x.id) === String(id));
        return e ? String(e.equipmentName) : `#${id}`;
      }).join(", ");
    } catch {
    }
    if (r.irrigationEquipmentId) {
      const e = equipment.find((x) => String(x.id) === String(r.irrigationEquipmentId));
      return e ? String(e.equipmentName) : "—";
    }
    return "—";
  }
  const selectedLicence = form.licenceId && form.licenceId !== "__none__" ? licences.find((l) => String(l.id) === String(form.licenceId)) : null;
  const licenceHint = reactExports.useMemo(() => {
    if (editing || !derivedLicenceId || !form.licenceId || form.licenceId !== derivedLicenceId) return null;
    const fieldRecs = fieldIrrigRecords;
    const mru = fieldRecs.find((r) => r.licenceId != null && String(r.licenceId) === form.licenceId);
    return mru ? "pre-filled from last use on this field" : "pre-filled — only licence on farm";
  }, [editing, derivedLicenceId, form.licenceId, fieldIrrigRecords]);
  const meterVolume = form.meterStartReading && form.meterEndReading ? Math.max(0, parseFloat(String(form.meterEndReading)) - parseFloat(String(form.meterStartReading))) : null;
  const effectiveVolume = meterVolume ?? (form.volumeAppliedM3 ? parseFloat(String(form.volumeAppliedM3)) : null);
  const effectiveArea = form.areaIrrigatedHa ? parseFloat(String(form.areaIrrigatedHa)) : null;
  const autoDepth = effectiveVolume && effectiveArea && effectiveArea > 0 ? (effectiveVolume / (effectiveArea * 1e4) * 1e3).toFixed(1) : null;
  const costPerM3 = form.costPerM3Override ? parseFloat(String(form.costPerM3Override)) : selectedLicence?.costPerM3 ? parseFloat(String(selectedLicence.costPerM3)) : null;
  const estimatedCost = effectiveVolume && costPerM3 ? (effectiveVolume * costPerM3).toFixed(2) : null;
  const allIrrigRecords = records;
  const [yearFilterIrrig, setYearFilterIrrig] = usePersistedFilter({ page: "water-irrigation-records", filter: "year", farmId, defaultValue: "all" });
  const yearsIrrig = reactExports.useMemo(() => Array.from(new Set(allIrrigRecords.map((r) => String(r.irrigationDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allIrrigRecords]);
  const filteredIrrigRecords = yearFilterIrrig === "all" ? allIrrigRecords : allIrrigRecords.filter((r) => String(r.irrigationDate ?? "").startsWith(yearFilterIrrig));
  const openCount = filteredIrrigRecords.filter((r) => r.status === "open").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Irrigation Application Records" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Log each irrigation event — track start/end operators, equipment and volume applied." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterIrrig, onValueChange: setYearFilterIrrig, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsIrrig.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: openAdd, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 mr-1" }),
          "Log Application"
        ] })
      ] })
    ] }),
    openCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 shrink-0" }),
      openCount,
      " open event",
      openCount !== 1 ? "s" : "",
      " — mark complete when irrigation finishes."
    ] }),
    !isLoading && filteredIrrigRecords.length > 0 && (() => {
      const recs = filteredIrrigRecords;
      const totalVol = recs.reduce((s, r) => s + (r.volumeAppliedM3 ? parseFloat(String(r.volumeAppliedM3)) : 0), 0);
      const totalArea = recs.reduce((s, r) => s + (r.areaIrrigatedHa ? parseFloat(String(r.areaIrrigatedHa)) : 0), 0);
      const openN = recs.filter((r) => r.status === "open").length;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 120 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Applications" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: recs.length })
        ] }),
        totalVol > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 16px", minWidth: 150 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#1d4ed8", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Total Volume" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#1e3a8a", lineHeight: 1, margin: 0 }, children: [
            totalVol.toFixed(1),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "m³" })
          ] })
        ] }),
        totalArea > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 16px", minWidth: 130 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#15803d", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Area Covered" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#14532d", lineHeight: 1, margin: 0 }, children: [
            totalArea.toFixed(1),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.7rem", fontWeight: 500 }, children: "ha" })
          ] })
        ] }),
        openN > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 16px", minWidth: 100 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", color: "#b45309", letterSpacing: "0.06em", margin: "0 0 3px" }, children: "Open" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "1.35rem", fontWeight: 800, color: "#78350f", lineHeight: 1, margin: 0 }, children: openN })
        ] })
      ] });
    })(),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: !filteredIrrigRecords.length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Empty, { msg: "No irrigation records yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground", children: "Field" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground", children: "Water Source" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground", children: "Vol (m³)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 pr-3 font-medium text-muted-foreground", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", {})
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: filteredIrrigRecords.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b last:border-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: fmtDate(r.irrigationDate) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: fieldLabel(r) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: licenceLabel(r) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: fmt(r.volumeAppliedM3) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 pr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${r.status === "open" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`, children: r.status === "open" ? "Open" : "Complete" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2 text-right space-x-1 whitespace-nowrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => {
            setViewRecord(r);
            setViewTab("details");
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => openEdit(r), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" }) }),
          r.status === "open" && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", title: "Mark complete", onClick: () => {
            closeEvent.reset();
            setConfirmClose(r);
          }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheck, { className: "w-3.5 h-3.5 text-green-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", onClick: () => del.mutate(r.id), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5 text-red-500" }) })
        ] })
      ] }, i)) })
    ] }) }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "52rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Irrigation Record — ",
        fmtDate(viewRecord.irrigationDate)
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 mb-3 border-b pb-2", children: ["details", "documents"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setViewTab(t),
          className: `text-xs px-3 py-1.5 rounded-md font-medium capitalize ${viewTab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`,
          children: t
        },
        t
      )) }),
      viewTab === "details" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm overflow-y-auto max-h-[60vh] pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${viewRecord.status === "open" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`, children: viewRecord.status === "open" ? "Open" : "Complete" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.irrigationDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Start Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.startTime) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "End Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.endDate ? fmtDate(viewRecord.endDate) : "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "End Time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.endTime) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Field" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fieldLabel(viewRecord) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Water Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: licenceLabel(viewRecord) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Crop Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.cropType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.irrigationMethod) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Equipment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: equipmentNames(viewRecord) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Area (ha)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.areaIrrigatedHa) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Volume (m³)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.volumeAppliedM3) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Depth (mm)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.applicationDepthMm) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Meter Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.meterStartReading) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Meter End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.meterEndReading) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Start Operator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: contactName(viewRecord.startOperatorId) !== "—" ? contactName(viewRecord.startOperatorId) : fmt(viewRecord.operatorName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "End Operator" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: contactName(viewRecord.endOperatorId) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Rainfall (7d mm)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.rainfallLast7DaysMm ? `${viewRecord.rainfallLast7DaysMm} mm` : "—" })
        ] }),
        !!viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: String(viewRecord.notes) })
        ] })
      ] }),
      viewTab === "documents" && /* @__PURE__ */ jsxRuntimeExports.jsx(RecordAttachments, { farmId, recordType: "irrigation_record", recordId: viewRecord.id }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        viewRecord.status === "open" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", className: "mr-auto text-green-700 border-green-300", onClick: () => {
          setViewRecord(null);
          closeEvent.reset();
          setConfirmClose(viewRecord);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheck, { className: "w-4 h-4 mr-1" }),
          "Mark Complete"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => {
          openEdit(viewRecord);
          setViewRecord(null);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5 mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setViewRecord(null), children: "Close" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ConfirmDialog,
      {
        open: !!confirmClose,
        title: "Mark irrigation complete?",
        message: `This will set the record for ${fmtDate(confirmClose?.irrigationDate)} to "Complete" and record today as the end date.`,
        confirmLabel: "Mark Complete",
        mutation: closeEvent,
        onConfirm: () => closeEvent.mutate(confirmClose.id),
        onCancel: () => {
          setConfirmClose(null);
          closeEvent.reset();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (v) => {
      if (!v) {
        setOpen(false);
        setEditing(null);
        setForm({});
        setEquipmentIds([]);
        save.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "52rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: editing ? "Edit Irrigation Record" : "Log Irrigation Application" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-y-auto max-h-[70vh] space-y-4 pr-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Event Timing" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.status ?? "open"), onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "open", children: "Open (in progress)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "closed", children: "Complete" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Date *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.irrigationDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, irrigationDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: String(form.startTime ?? ""), onChange: (e) => setForm((f) => ({ ...f, startTime: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Start Operator" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.startOperatorId ?? "__none__"), onValueChange: (v) => setForm((f) => ({ ...f, startOperatorId: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select contact…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— not specified —" }),
                  contacts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
                    String(c.name),
                    c.role ? ` (${String(c.role)})` : ""
                  ] }, String(c.id)))
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.endDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, endDate: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: String(form.endTime ?? ""), onChange: (e) => setForm((f) => ({ ...f, endTime: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "End Operator" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.endOperatorId ?? "__none__"), onValueChange: (v) => setForm((f) => ({ ...f, endOperatorId: v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select contact…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— not specified —" }),
                  contacts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(c.id), children: [
                    String(c.name),
                    c.role ? ` (${String(c.role)})` : ""
                  ] }, String(c.id)))
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Field & Water Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field / Block" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.fieldId ?? "__none__"), onValueChange: handleFieldSelect, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select field…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— manual entry —" }),
                  fields.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(f.id), children: String(f.name) }, String(f.id)))
                ] })
              ] })
            ] }),
            (!form.fieldId || form.fieldId === "__none__") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field / Block Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.fieldOrBlockDescription ?? ""), onChange: (e) => setForm((f) => ({ ...f, fieldOrBlockDescription: e.target.value })), placeholder: "e.g. North paddock" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Water Source / Licence" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.licenceId ?? "__none__"), onValueChange: (v) => {
                setLicenceManuallySelected(true);
                setForm((f) => ({ ...f, licenceId: v }));
              }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select licence…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— not linked —" }),
                  licences.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(l.id), children: [
                    String(l.licenceNumber),
                    l.sourceType ? ` (${String(l.sourceType)})` : ""
                  ] }, String(l.id)))
                ] })
              ] }),
              licenceHint && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-blue-600 mt-1", children: licenceHint })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Crop Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.cropType ?? ""), onChange: (e) => setForm((f) => ({ ...f, cropType: e.target.value })), placeholder: "Auto-filled from field" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Area Irrigated (ha)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: String(form.areaIrrigatedHa ?? ""), onChange: (e) => setForm((f) => ({ ...f, areaIrrigatedHa: e.target.value })) }),
              (() => {
                const fr = fields.find((f) => String(f.id) === String(form.fieldId));
                const area = form.areaIrrigatedHa ? parseFloat(String(form.areaIrrigatedHa)) : null;
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
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Method & Equipment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Irrigation Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.irrigationMethod ?? "__none__"), onValueChange: (v) => setForm((f) => ({ ...f, irrigationMethod: v === "__none__" ? "" : v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— select —" }),
                  ["Overhead sprinkler", "Drip / trickle", "Furrow / flood", "Pivot", "Boom", "Traveller", "Hand-held", "Other"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m))
                ] })
              ] })
            ] }),
            equipment.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Equipment Used" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: equipment.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Checkbox,
                  {
                    checked: equipmentIds.includes(Number(e.id)),
                    onCheckedChange: (checked) => {
                      const id = Number(e.id);
                      setEquipmentIds((ids) => checked ? [...ids, id] : ids.filter((x) => x !== id));
                    }
                  }
                ),
                String(e.equipmentName),
                e.equipmentType ? ` — ${String(e.equipmentType)}` : ""
              ] }, String(e.id))) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Volume Applied" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meter Start Reading (m³)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: String(form.meterStartReading ?? ""), onChange: (e) => setForm((f) => ({ ...f, meterStartReading: e.target.value })), placeholder: "Leave blank if no meter" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Meter End Reading (m³)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: String(form.meterEndReading ?? ""), onChange: (e) => setForm((f) => ({ ...f, meterEndReading: e.target.value })) })
            ] }),
            meterVolume !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2 flex items-center gap-2 rounded bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-700", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-4 h-4 shrink-0" }),
              "Meter volume: ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
                meterVolume.toFixed(2),
                " m³"
              ] }),
              " — will be saved as volume applied."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Volume Applied (m³)",
                meterVolume !== null ? " — set by meter" : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: String(form.volumeAppliedM3 ?? ""), onChange: (e) => setForm((f) => ({ ...f, volumeAppliedM3: e.target.value })), disabled: meterVolume !== null, placeholder: meterVolume !== null ? `${meterVolume.toFixed(2)} (from meter)` : "" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Application Depth (mm)",
                autoDepth ? " — auto" : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: autoDepth ?? String(form.applicationDepthMm ?? ""), readOnly: !!autoDepth, onChange: (e) => !autoDepth && setForm((f) => ({ ...f, applicationDepthMm: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Cost" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cost per m³ Override (£)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.0001", value: String(form.costPerM3Override ?? ""), onChange: (e) => setForm((f) => ({ ...f, costPerM3Override: e.target.value })), placeholder: selectedLicence?.costPerM3 ? `${parseFloat(String(selectedLicence.costPerM3)).toFixed(4)} from source` : "Leave blank to use source rate" })
            ] }),
            estimatedCost && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-center rounded-lg bg-blue-50 border border-blue-200 px-4 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-600", children: "Estimated water cost" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-blue-700", children: [
                "£",
                estimatedCost
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2", children: "Other" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rainfall Last 7 Days (mm)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: String(form.rainfallLast7DaysMm ?? ""), onChange: (e) => setForm((f) => ({ ...f, rainfallLast7DaysMm: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.notes ?? ""), onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setOpen(false);
          setEditing(null);
          setForm({});
          setEquipmentIds([]);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSave, disabled: save.isPending, children: [
          save.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-1" }) : null,
          editing ? "Save Changes" : "Log Application"
        ] })
      ] })
    ] }) })
  ] });
}
function IrrigationEquipmentTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: equipment = [], isLoading } = useQuery({ queryKey: ["irrig-equip", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/irrigation-equipment`), { credentials: "include" }).then((r) => r.json()) });
  const save = useMutation({ mutationFn: (b) => fetch(editing ? apiUrl(`farms/${farmId}/irrigation-equipment/${editing.id}`) : apiUrl(`farms/${farmId}/irrigation-equipment`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["irrig-equip", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/irrigation-equipment/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["irrig-equip", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const openEdit = (r) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Irrigation Equipment Register" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
        setEditing(null);
        setForm({ status: "active" });
        setOpen(true);
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Add Equipment"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [{ key: "equipmentName", label: "Name" }, { key: "equipmentType", label: "Type" }, { key: "manufacturer", label: "Manufacturer" }, { key: "applicationRateLph", label: "Rate (L/hr)" }, { key: "lastCalibrationDate", label: "Last Calibration", fmt: (r) => fmtDate(r.lastCalibrationDate) }, { key: "nextCalibrationDue", label: "Next Due", fmt: (r) => fmtDate(r.nextCalibrationDue) }, { key: "status", label: "Status" }], rows: equipment, onView: setViewRecord, onEdit: openEdit, onDelete: (r) => del.mutate(r.id), deleteMutation: del }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Equipment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Equipment Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.equipmentName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Equipment Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.equipmentType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Manufacturer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.manufacturer) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Model Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.modelNumber) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Application Rate (L/hr)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.applicationRateLph) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Last Calibration Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.lastCalibrationDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Next Calibration Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.nextCalibrationDue) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Calibrated By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.calibratedBy) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "38rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Irrigation Equipment" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Equipment Name *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.equipmentName ?? "", onChange: (e) => setForm((f) => ({ ...f, equipmentName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Equipment Type *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.equipmentType ?? "", onValueChange: (v) => setForm((f) => ({ ...f, equipmentType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Drip System", "Sprinkler", "Boom", "Linear Move", "Rain Gun", "Pump", "Filter", "Pressure Regulator"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Manufacturer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.manufacturer ?? "", onChange: (e) => setForm((f) => ({ ...f, manufacturer: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Serial Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.serialNumber ?? "", onChange: (e) => setForm((f) => ({ ...f, serialNumber: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Application Rate (L/hr)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.applicationRateLph ?? "", onChange: (e) => setForm((f) => ({ ...f, applicationRateLph: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Uniformity Coefficient" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.uniformityCoefficient ?? "", onChange: (e) => setForm((f) => ({ ...f, uniformityCoefficient: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Calibration Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.lastCalibrationDate ?? "", onChange: (e) => setForm((f) => ({ ...f, lastCalibrationDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Next Calibration Due" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", min: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.nextCalibrationDue ?? "", onChange: (e) => setForm((f) => ({ ...f, nextCalibrationDue: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.status ?? "active", onValueChange: (v) => setForm((f) => ({ ...f, status: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["active", "maintenance", "out-of-service", "retired"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function SoilMoistureTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: soilMembersData, isLoading: soilMembersLoading } = useFarmMembers(farmId);
  const soilStaffNames = (soilMembersData?.members ?? []).filter((m) => m.isActive).map((m) => `${m.firstName} ${m.lastName}`);
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["soil-moisture", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/soil-moisture-readings`), { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? []) });
  const save = useMutation({ mutationFn: (b) => fetch(editing ? apiUrl(`farms/${farmId}/soil-moisture-readings/${editing.id}`) : apiUrl(`farms/${farmId}/soil-moisture-readings`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["soil-moisture", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/soil-moisture-readings/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["soil-moisture", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const openEdit = (r) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };
  const allSoilRecords = records;
  const [yearFilterSoil, setYearFilterSoil] = usePersistedFilter({ page: "water-soil-moisture", filter: "year", farmId, defaultValue: "all" });
  const yearsSoil = reactExports.useMemo(() => Array.from(new Set(allSoilRecords.map((r) => String(r.readingDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allSoilRecords]);
  const filteredSoilRecords = yearFilterSoil === "all" ? allSoilRecords : allSoilRecords.filter((r) => String(r.readingDate ?? "").startsWith(yearFilterSoil));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Soil Moisture Monitoring" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Log soil moisture readings to optimise irrigation scheduling and evidence good water management. Compatible sensor data can be entered manually or imported from Sentek, METER Group (TEROS) or AquaSpy platforms." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterSoil, onValueChange: setYearFilterSoil, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsSoil.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({ readingMethod: "manual" });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Reading"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [{ key: "readingDate", label: "Date", fmt: (r) => fmtDate(r.readingDate) }, { key: "fieldOrBlockDescription", label: "Field / Block" }, { key: "sensorType", label: "Sensor Type" }, { key: "depthCm", label: "Depth (cm)" }, { key: "moisturePercent", label: "Moisture %" }, { key: "soilMoistureDeficitMm", label: "SMD (mm)" }, { key: "readingMethod", label: "Method" }, { key: "recordedBy", label: "Recorded By" }], rows: filteredSoilRecords, onView: setViewRecord, onEdit: openEdit, onDelete: (r) => del.mutate(r.id), deleteMutation: del }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Soil Moisture Reading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reading Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.readingDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Field / Block Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.fieldOrBlockDescription) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Sensor Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.sensorType) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Depth (cm)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.depthCm) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Moisture (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-medium", children: [
            fmt(viewRecord.moisturePercent),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Soil Moisture Deficit (mm)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.soilMoistureDeficitMm) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Reading Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.readingMethod) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Recorded By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.recordedBy) })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "40rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Soil Moisture Reading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reading Date *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: form.readingDate ?? "", onChange: (e) => setForm((f) => ({ ...f, readingDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Depth (cm)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: form.depthCm ?? "", onChange: (e) => setForm((f) => ({ ...f, depthCm: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field / Block *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.fieldOrBlockDescription ?? "", onChange: (e) => setForm((f) => ({ ...f, fieldOrBlockDescription: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sensor ID" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: form.sensorId ?? "", onChange: (e) => setForm((f) => ({ ...f, sensorId: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Sensor Type" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.sensorType ?? "", onValueChange: (v) => setForm((f) => ({ ...f, sensorType: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["Sentek EnviroScan", "METER TEROS 12", "AquaSpy", "Vegetronix", "Tensiometer", "Capacitance Probe", "Neutron Probe", "Manual / Gravimetric"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Moisture (%)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.moisturePercent ?? "", onChange: (e) => setForm((f) => ({ ...f, moisturePercent: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Soil Moisture Deficit (mm)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.soilMoistureDeficitMm ?? "", onChange: (e) => setForm((f) => ({ ...f, soilMoistureDeficitMm: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field Capacity (mm)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.fieldCapacityMm ?? "", onChange: (e) => setForm((f) => ({ ...f, fieldCapacityMm: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Wilting Point (mm)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.wiltingPointMm ?? "", onChange: (e) => setForm((f) => ({ ...f, wiltingPointMm: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Reading Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.readingMethod ?? "manual", onValueChange: (v) => setForm((f) => ({ ...f, readingMethod: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["manual", "sensor-auto", "sensor-manual-import"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Recorded By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StaffSelect, { value: form.recordedBy ?? "", onChange: (v) => setForm((f) => ({ ...f, recordedBy: v })), staffNames: soilStaffNames, loading: soilMembersLoading })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes ?? "", onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function DroughtManagementTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: licences = [] } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then((r) => r.json()) });
  const { data: records = [], isLoading } = useQuery({ queryKey: ["drought-plans", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/drought-management-plans`), { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? []) });
  const save = useMutation({ mutationFn: (b) => fetch(editing ? apiUrl(`farms/${farmId}/drought-management-plans/${editing.id}`) : apiUrl(`farms/${farmId}/drought-management-plans`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["drought-plans", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/drought-management-plans/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["drought-plans", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const openEdit = (r) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };
  const STAGES = ["normal", "prolonged dry spell", "drought", "severe drought", "exceptional drought"];
  const RESTRICTIONS = ["none", "voluntary reduction", "stage 1 restriction", "stage 2 restriction", "temporary use ban", "drought permit needed"];
  const allDroughtRecords = records;
  const [yearFilterDrought, setYearFilterDrought] = usePersistedFilter({ page: "water-drought-management", filter: "year", farmId, defaultValue: "all" });
  const yearsDrought = reactExports.useMemo(() => Array.from(new Set(allDroughtRecords.map((r) => String(r.planYear ?? "")).filter(Boolean))).sort().reverse(), [allDroughtRecords]);
  const filteredDroughtRecords = yearFilterDrought === "all" ? allDroughtRecords : allDroughtRecords.filter((r) => String(r.planYear ?? "") === yearFilterDrought);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "Drought Management Plans" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Record drought stages and restriction levels aligned to EA Drought Management Plans. Log actions taken and alternative water sources to demonstrate responsible management." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterDrought, onValueChange: setYearFilterDrought, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsDrought.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({ droughtStage: "normal", restrictionLevel: "none", isActive: true });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Plan"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [{ key: "planYear", label: "Year" }, { key: "planTitle", label: "Plan Title" }, { key: "droughtStage", label: "Drought Stage" }, { key: "restrictionLevel", label: "Restriction Level" }, { key: "isActive", label: "Active", fmt: (r) => r.isActive ? "Yes" : "No" }, { key: "reviewDate", label: "Review Date", fmt: (r) => fmtDate(r.reviewDate) }], rows: filteredDroughtRecords, onView: setViewRecord, onEdit: openEdit, onDelete: (r) => del.mutate(r.id), deleteMutation: del }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View Drought Management Plan" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Plan Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.planYear) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Review Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.reviewDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Plan Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.planTitle) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Drought Stage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.droughtStage) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Restriction Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.restrictionLevel) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Trigger Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.triggerCondition) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Actions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.actionsTaken) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Linked Licence" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: licences.find((l) => String(l.id) === String(viewRecord.licenceId))?.licenceNumber ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "EA Contact Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.eaContactName) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "EA Contact Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.eaContactRef) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Alternative Water Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.alternativeSourceDescription) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Alternative Source Available" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.alternativeSourceAvailable ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Currently Active" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.isActive ? "Yes" : "No" })
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
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "44rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Drought Management Plan" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Plan Year *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.planYear ?? ""), onChange: (e) => setForm((f) => ({ ...f, planYear: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Review Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: String(form.reviewDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, reviewDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Plan Title *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.planTitle ?? ""), onChange: (e) => setForm((f) => ({ ...f, planTitle: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Drought Stage" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.droughtStage ?? "normal"), onValueChange: (v) => setForm((f) => ({ ...f, droughtStage: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: STAGES.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Restriction Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.restrictionLevel ?? "none"), onValueChange: (v) => setForm((f) => ({ ...f, restrictionLevel: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: RESTRICTIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Trigger Conditions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.triggerCondition ?? ""), onChange: (e) => setForm((f) => ({ ...f, triggerCondition: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Actions Taken" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.actionsTaken ?? ""), onChange: (e) => setForm((f) => ({ ...f, actionsTaken: e.target.value })), rows: 2 })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Linked Licence" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.licenceId ?? "__none__"), onValueChange: (v) => setForm((f) => ({ ...f, licenceId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select licence" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
              licences.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(l.id), children: String(l.licenceNumber) }, String(l.id)))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "EA Contact Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.eaContactName ?? ""), onChange: (e) => setForm((f) => ({ ...f, eaContactName: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "EA Contact Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.eaContactRef ?? ""), onChange: (e) => setForm((f) => ({ ...f, eaContactRef: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Alternative Water Source" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.alternativeSourceDescription ?? ""), onChange: (e) => setForm((f) => ({ ...f, alternativeSourceDescription: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "altSrc", checked: Boolean(form.alternativeSourceAvailable), onCheckedChange: (v) => setForm((f) => ({ ...f, alternativeSourceAvailable: Boolean(v) })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "altSrc", children: "Alternative source available?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "isAct", checked: form.isActive !== "false" && form.isActive !== false, onCheckedChange: (v) => setForm((f) => ({ ...f, isActive: Boolean(v) })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "isAct", children: "Currently active?" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
function CamsReturnsTab({ farmId }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({});
  const { data: licences = [] } = useQuery({ queryKey: ["water-licences", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/water-abstraction-licences`), { credentials: "include" }).then((r) => r.json()) });
  const { data: records = [], isLoading } = useQuery({ queryKey: ["cams-returns", farmId], queryFn: () => fetch(apiUrl(`farms/${farmId}/cams-annual-returns`), { credentials: "include" }).then((r) => r.json()).then((d) => d.records ?? []) });
  const save = useMutation({ mutationFn: (b) => fetch(editing ? apiUrl(`farms/${farmId}/cams-annual-returns/${editing.id}`) : apiUrl(`farms/${farmId}/cams-annual-returns`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["cams-returns", farmId] });
    setOpen(false);
    setForm({});
    setEditing(null);
  }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id) => fetch(apiUrl(`farms/${farmId}/cams-annual-returns/${id}`), { method: "DELETE", credentials: "include" }).then(async (r) => {
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      throw new Error(t || `Request failed (${r.status})`);
    }
    return r;
  }), onSuccess: () => qc.invalidateQueries({ queryKey: ["cams-returns", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const openEdit = (r) => {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  };
  const allCamsRecords = records;
  const [yearFilterCams, setYearFilterCams] = usePersistedFilter({ page: "water-cams-returns", filter: "year", farmId, defaultValue: "all" });
  const yearsCams = reactExports.useMemo(() => Array.from(new Set(allCamsRecords.map((r) => String(r.returnYear ?? "")).filter(Boolean))).sort().reverse(), [allCamsRecords]);
  const filteredCamsRecords = yearFilterCams === "all" ? allCamsRecords : allCamsRecords.filter((r) => String(r.returnYear ?? "") === yearFilterCams);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm", children: "CAMS Annual Returns — EA Abstraction Compliance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5", children: "Record annual abstraction returns submitted to the Environment Agency under Catchment Abstraction Management Strategies (CAMS). Annual returns must be submitted by the deadline stated on your licence." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: yearFilterCams, onValueChange: setYearFilterCams, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { className: "w-28 h-8 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "All years" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "all", children: "All years" }),
            yearsCams.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: y, children: y }, y))
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setEditing(null);
          setForm({ submittedToEa: false, complianceStatus: "compliant", returnYear: String((/* @__PURE__ */ new Date()).getFullYear()) });
          setOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
          "Add Return"
        ] })
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, { cols: [{ key: "returnYear", label: "Year" }, { key: "licenceId", label: "Licence", fmt: (r) => {
      const l = licences.find((x) => String(x.id) === String(r.licenceId));
      return l ? String(l.licenceNumber) : fmt(r.licenceId);
    } }, { key: "totalAbstractedM3", label: "Total (m³)" }, { key: "submittedToEa", label: "Submitted", fmt: (r) => r.submittedToEa ? "Yes" : "No" }, { key: "submissionDate", label: "Submission Date", fmt: (r) => fmtDate(r.submissionDate) }, { key: "eaReturnReference", label: "EA Ref" }, { key: "complianceStatus", label: "Compliance" }], rows: filteredCamsRecords, onView: setViewRecord, onEdit: openEdit, onDelete: (r) => del.mutate(r.id), deleteMutation: del }),
    viewRecord && /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: true, onOpenChange: () => setViewRecord(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "View CAMS Annual Return" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Return Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.returnYear) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Licence" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: licences.find((l) => String(l.id) === String(viewRecord.licenceId))?.licenceNumber ?? "—" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Period Start" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.returnPeriodStart) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Period End" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.returnPeriodEnd) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Total Abstracted (m³)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.totalAbstractedM3) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Compliance Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.complianceStatus) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Submitted to EA" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: viewRecord.submittedToEa ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Submission Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmtDate(viewRecord.submissionDate) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "EA Return Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.eaReturnReference) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Submitted By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.submittedBy) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground uppercase tracking-wide", children: "Exceedance / Non-compliance Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: fmt(viewRecord.exceedanceNotes) })
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
      setOpen(o);
      if (!o) save.reset();
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: "42rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "CAMS Annual Return" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Return Year *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", value: String(form.returnYear ?? ""), onChange: (e) => setForm((f) => ({ ...f, returnYear: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Licence *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.licenceId ?? "__none__"), onValueChange: (v) => setForm((f) => ({ ...f, licenceId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select licence" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Select —" }),
              licences.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: String(l.id), children: String(l.licenceNumber) }, String(l.id)))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Period Start *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: String(form.returnPeriodStart ?? ""), onChange: (e) => setForm((f) => ({ ...f, returnPeriodStart: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Period End *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: String(form.returnPeriodEnd ?? ""), onChange: (e) => setForm((f) => ({ ...f, returnPeriodEnd: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Total Abstracted (m³)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "1", value: String(form.totalAbstractedM3 ?? ""), onChange: (e) => setForm((f) => ({ ...f, totalAbstractedM3: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Compliance Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(form.complianceStatus ?? "compliant"), onValueChange: (v) => setForm((f) => ({ ...f, complianceStatus: v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["compliant", "minor exceedance", "significant exceedance", "enforcement notice"].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: o, children: o }, o)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 col-span-2 mt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { id: "subEA", checked: Boolean(form.submittedToEa), onCheckedChange: (v) => setForm((f) => ({ ...f, submittedToEa: Boolean(v) })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "subEA", children: "Submitted to Environment Agency?" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Submission Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", max: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), value: String(form.submissionDate ?? ""), onChange: (e) => setForm((f) => ({ ...f, submissionDate: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "EA Return Reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.eaReturnReference ?? ""), onChange: (e) => setForm((f) => ({ ...f, eaReturnReference: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Submitted By" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(form.submittedBy ?? ""), onChange: (e) => setForm((f) => ({ ...f, submittedBy: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Exceedance / Non-compliance Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: String(form.exceedanceNotes ?? ""), onChange: (e) => setForm((f) => ({ ...f, exceedanceNotes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: save, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(form), disabled: save.isPending, children: "Save" })
      ] })
    ] }) })
  ] });
}
const WATER_TAB_IDS = ["licences", "readings", "borehole", "records", "equipment", "soil-moisture", "drought", "cams", "advisor"];
function WaterIrrigationPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "water-irrigation", farmId, validIds: WATER_TAB_IDS, defaultTab: "licences", urlOverride: new URLSearchParams(window.location.search).get("tab") });
  if (!farmId) return /* @__PURE__ */ jsxRuntimeExports.jsx(Redirect, { to: "/" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Water & Irrigation Management", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "licences", onClick: () => setTab("licences"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollText, { className: "w-3.5 h-3.5 mr-1" }),
        "Water Sources"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "readings", onClick: () => setTab("readings"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-3.5 h-3.5 mr-1" }),
        "Meter Readings"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "borehole", onClick: () => setTab("borehole"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Drill, { className: "w-3.5 h-3.5 mr-1" }),
        "Borehole Tests"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "records", onClick: () => setTab("records"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Droplets, { className: "w-3.5 h-3.5 mr-1" }),
        "Applications"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "equipment", onClick: () => setTab("equipment"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tractor, { className: "w-3.5 h-3.5 mr-1" }),
        "Equipment"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "soil-moisture", onClick: () => setTab("soil-moisture"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CloudRain, { className: "w-3.5 h-3.5 mr-1" }),
        "Soil Moisture"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "drought", onClick: () => setTab("drought"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-3.5 h-3.5 mr-1" }),
        "Drought Plans"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "cams", onClick: () => setTab("cams"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileCheck, { className: "w-3.5 h-3.5 mr-1" }),
        "CAMS Returns"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "advisor", onClick: () => setTab("advisor"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sprout, { className: "w-3.5 h-3.5 mr-1" }),
        "Irrigation Advisor"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "pt-4", children: [
      tab === "licences" && /* @__PURE__ */ jsxRuntimeExports.jsx(LicencesTab, { farmId }),
      tab === "readings" && /* @__PURE__ */ jsxRuntimeExports.jsx(MeterReadingsTab, { farmId }),
      tab === "borehole" && /* @__PURE__ */ jsxRuntimeExports.jsx(BoreholeTestsTab, { farmId }),
      tab === "records" && /* @__PURE__ */ jsxRuntimeExports.jsx(IrrigationRecordsTab, { farmId }),
      tab === "equipment" && /* @__PURE__ */ jsxRuntimeExports.jsx(IrrigationEquipmentTab, { farmId }),
      tab === "soil-moisture" && /* @__PURE__ */ jsxRuntimeExports.jsx(SoilMoistureTab, { farmId }),
      tab === "drought" && /* @__PURE__ */ jsxRuntimeExports.jsx(DroughtManagementTab, { farmId }),
      tab === "cams" && /* @__PURE__ */ jsxRuntimeExports.jsx(CamsReturnsTab, { farmId }),
      tab === "advisor" && /* @__PURE__ */ jsxRuntimeExports.jsx(IrrigationAdvisorTab, { farmId })
    ] }) })
  ] }) });
}
export {
  WaterIrrigationPage as default
};
