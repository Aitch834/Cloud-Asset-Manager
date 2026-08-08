import { s as createLucideIcon, b as useAppStore, j as jsxRuntimeExports, a as useToast, c as useQueryClient, r as reactExports, m as useQuery, S as useMutation, d as Button, T as Plus, z as Dialog, E as DialogContent, F as DialogHeader, G as DialogTitle, e as LoaderCircle, M as MapPin, L as Label, I as Input, N as DialogMutationError, J as DialogFooter } from "./index-B8sVot4o.js";
import { u as usePersistedTab } from "./use-persisted-tab-C4O-_l_O.js";
import { A as AppLayout, T as TrendingUp, j as Truck } from "./AppLayout-Bs7WB20u.js";
import { T as Textarea } from "./textarea-4Kn5ipG3.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-ucpJpIWZ.js";
import { T as TabBar, a as TabButton } from "./tab-button-ByJAcpjQ.js";
import { C as Cpu } from "./cpu-fJ2Xo0S9.js";
import { T as Trash2 } from "./trash-2-C2Fh_1Gp.js";
import { R as ResponsiveContainer, X as XAxis, Y as YAxis, T as Tooltip } from "./generateCategoricalChart-Ryk_WwGJ.js";
import { L as LineChart } from "./LineChart-efcb8d8c.js";
import { C as CartesianGrid } from "./CartesianGrid-BLsWB0CH.js";
import { L as Line } from "./Line-BM2sTjC0.js";
import { T as TriangleAlert } from "./triangle-alert-DoQ8EUIO.js";
import { P as Printer } from "./printer-m-vwwXEc.js";
import { E as Eye } from "./eye-BRKAOEOF.js";
import { P as Pencil } from "./pencil-CoTy7pTl.js";
import "./use-safe-clerk-CX5yKyqg.js";
import "./database-XKt5Qy7o.js";
import "./shield-alert-BHtht01A.js";
import "./shield-check-CkrOgCmu.js";
import "./tractor-BIyncDZ-.js";
import "./index-CLt43KFt.js";
import "./index-C4A6eVaU.js";
import "./chevron-up-q1nvWxlD.js";
const __iconNode = [
  ["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", key: "p7xjir" }]
];
const Cloud = createLucideIcon("cloud", __iconNode);
function degreesToCompass(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}
function wmoToCondition(code) {
  if (code <= 1) return "Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 95) return "Thunderstorm";
  return "Variable";
}
const WEATHER_TAB_IDS = ["readings", "chart", "vehicle", "devices", "stations"];
const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtTime = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};
function ReadingsTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState({ readingTimestamp: "", temperatureC: "", humidityPercent: "", windSpeedKmh: "", windDirection: "", rainfallMm: "", pressureHpa: "", linkedSprayApplicationId: "", notes: "" });
  const [fetchingWeather, setFetchingWeather] = reactExports.useState(false);
  const [weatherFetchMsg, setWeatherFetchMsg] = reactExports.useState(null);
  const sprayAppsQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? d ?? [] });
  const q = useQuery({ queryKey: ["weather-readings", farmId], queryFn: () => fetch(`/api/farms/${farmId}/weather-readings`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["weather-readings", farmId] });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/weather-readings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Reading saved" });
      invalidate();
      setAddOpen(false);
      resetForm();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/weather-readings/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const fetchWeatherFromApi = reactExports.useCallback(async () => {
    setFetchingWeather(true);
    setWeatherFetchMsg(null);
    try {
      const pos = await new Promise(
        (resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 1e4 })
      );
      const { latitude, longitude } = pos.coords;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Open-Meteo error ${resp.status}`);
      const data = await resp.json();
      const c = data.current;
      const now = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16);
      setForm((f) => ({
        ...f,
        readingTimestamp: f.readingTimestamp || now,
        temperatureC: c.temperature_2m != null ? String(Math.round(c.temperature_2m * 10) / 10) : f.temperatureC,
        humidityPercent: c.relative_humidity_2m != null ? String(Math.round(c.relative_humidity_2m)) : f.humidityPercent,
        rainfallMm: c.precipitation != null ? String(Math.round(c.precipitation * 10) / 10) : f.rainfallMm,
        windSpeedKmh: c.wind_speed_10m != null ? String(Math.round(c.wind_speed_10m)) : f.windSpeedKmh,
        windDirection: c.wind_direction_10m != null ? degreesToCompass(c.wind_direction_10m) : f.windDirection,
        pressureHpa: c.pressure_msl != null ? String(Math.round(c.pressure_msl)) : f.pressureHpa,
        notes: f.notes || (c.weather_code != null ? `Conditions: ${wmoToCondition(c.weather_code)}` : "")
      }));
      setWeatherFetchMsg(`Live data fetched · ${latitude.toFixed(3)}°N, ${Math.abs(longitude).toFixed(3)}°${longitude < 0 ? "W" : "E"}`);
    } catch (err) {
      setWeatherFetchMsg(`Could not fetch: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setFetchingWeather(false);
    }
  }, []);
  const sprayApps = sprayAppsQ.data ?? [];
  const resetForm = () => {
    setForm({ readingTimestamp: "", temperatureC: "", humidityPercent: "", windSpeedKmh: "", windDirection: "", rainfallMm: "", pressureHpa: "", linkedSprayApplicationId: "", notes: "" });
    setWeatherFetchMsg(null);
  };
  const records = q.data ?? [];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
      resetForm();
      setAddOpen(true);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
      "Add Reading"
    ] }) }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No weather readings recorded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Log temperature, rainfall and wind conditions relevant to spraying decisions." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date / Time", "Temp (°C)", "Humidity (%)", "Wind (km/h)", "Direction", "Rainfall (mm)", "Pressure (hPa)", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmtTime(r.readingTimestamp) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", fontWeight: 500 }, children: r.temperatureC ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.humidityPercent ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.windSpeedKmh ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.windDirection || "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.rainfallMm ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.625rem 0.875rem", color: "#6b7280" }, children: r.pressureHpa ?? "—" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }) })
      ] }, r.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      setAddOpen(o);
      if (!o) {
        resetForm();
        createMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Weather Reading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.625rem 0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.8125rem", color: "#166534" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Auto-fill from Open-Meteo" }),
            " — uses your browser location to fetch live conditions",
            weatherFetchMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 3, fontSize: "0.75rem", color: weatherFetchMsg.startsWith("Could") ? "#991b1b" : "#166534" }, children: weatherFetchMsg })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "outline", onClick: fetchWeatherFromApi, disabled: fetchingWeather, style: { flexShrink: 0, borderColor: "#86efac", color: "#166534" }, children: fetchingWeather ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 13, className: "mr-1 animate-spin" }),
            "Fetching…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 13, className: "mr-1" }),
            "Fetch Live"
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Date & Time ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: form.readingTimestamp, onChange: (e) => setForm((f) => ({ ...f, readingTimestamp: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temperature (°C)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.temperatureC, onChange: (e) => setForm((f) => ({ ...f, temperatureC: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Humidity (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", max: "100", value: form.humidityPercent, onChange: (e) => setForm((f) => ({ ...f, humidityPercent: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Wind Speed (km/h)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", value: form.windSpeedKmh, onChange: (e) => setForm((f) => ({ ...f, windSpeedKmh: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Wind Direction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.windDirection, onValueChange: (v) => setForm((f) => ({ ...f, windDirection: v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "Variable", "Calm"].map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d, children: d }, d)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rainfall (mm)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", value: form.rainfallMm, onChange: (e) => setForm((f) => ({ ...f, rainfallMm: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pressure (hPa)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.pressureHpa, onChange: (e) => setForm((f) => ({ ...f, pressureHpa: e.target.value })) })
          ] })
        ] }),
        sprayApps.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Spray Application (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.linkedSprayApplicationId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, linkedSprayApplicationId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select spray record…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
              sprayApps.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                s.applicationDate ? new Date(s.applicationDate).toLocaleDateString("en-GB") : "—",
                s.product ? ` — ${s.product}` : "",
                s.fieldDescription ? ` (${s.fieldDescription})` : ""
              ] }, s.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate({ ...form, linkedSprayApplicationId: form.linkedSprayApplicationId ? parseInt(form.linkedSprayApplicationId) : null }), disabled: !form.readingTimestamp || createMut.isPending, children: "Save Reading" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 400 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Reading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure you want to delete this weather reading?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
function ChartTab({ farmId }) {
  const [metric, setMetric] = reactExports.useState("temperature");
  const [days, setDays] = reactExports.useState(30);
  const q = useQuery({ queryKey: ["weather-readings", farmId], queryFn: () => fetch(`/api/farms/${farmId}/weather-readings`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const records = q.data ?? [];
  const cutoff = /* @__PURE__ */ new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const chartData = records.filter((r) => r.readingTimestamp && new Date(r.readingTimestamp) >= cutoff).sort((a, b) => new Date(a.readingTimestamp).getTime() - new Date(b.readingTimestamp).getTime()).map((r) => ({
    date: new Date(r.readingTimestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    temperature: r.temperatureC != null ? parseFloat(r.temperatureC) : null,
    rainfall: r.rainfallMm != null ? parseFloat(r.rainfallMm) : null,
    humidity: r.humidityPercent != null ? parseFloat(r.humidityPercent) : null,
    wind: r.windSpeedKmh != null ? parseFloat(r.windSpeedKmh) : null
  }));
  const metricConfig = {
    temperature: { key: "temperature", label: "Temperature (°C)", color: "#f97316", unit: "°C" },
    rainfall: { key: "rainfall", label: "Rainfall (mm)", color: "#3b82f6", unit: "mm" },
    humidity: { key: "humidity", label: "Humidity (%)", color: "#8b5cf6", unit: "%" },
    wind: { key: "wind", label: "Wind Speed (km/h)", color: "#10b981", unit: "km/h" }
  };
  const cfg = metricConfig[metric];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 4 }, children: ["temperature", "rainfall", "humidity", "wind"].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setMetric(m), style: { padding: "4px 12px", borderRadius: 6, border: "1px solid", borderColor: metric === m ? metricConfig[m].color : "#e5e7eb", background: metric === m ? metricConfig[m].color : "#fff", color: metric === m ? "#fff" : "#374151", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer" }, children: metricConfig[m].label.split(" ")[0] }, m)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: String(days), onValueChange: (v) => setDays(parseInt(v)), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { style: { width: 120 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: [["7", "Last 7 days"], ["14", "Last 14 days"], ["30", "Last 30 days"], ["90", "Last 90 days"], ["365", "Last year"]].map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: v, children: l }, v)) })
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading..." }) : chartData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No data for selected period" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Add weather readings in the Readings tab to see charts here." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.5rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: 16 }, children: [
        cfg.label,
        " — last ",
        days,
        " days"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 300, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: chartData, margin: { top: 5, right: 20, left: 0, bottom: 5 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f3f4f6" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "date", tick: { fontSize: 11, fill: "#9ca3af" } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 11, fill: "#9ca3af" }, unit: cfg.unit }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: { fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e7eb" }, formatter: (v) => [`${v}${cfg.unit}`, cfg.label] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { type: "monotone", dataKey: cfg.key, stroke: cfg.color, strokeWidth: 2, dot: { r: 3, fill: cfg.color }, connectNulls: true })
      ] }) })
    ] })
  ] });
}
const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "Variable", "Calm"];
const EMPTY_VEH_FORM = { selectedEquipmentId: "", vehicleName: "", vehicleRegistration: "", deviceId: "", readingTimestamp: "", temperatureC: "", humidityPercent: "", windSpeedKmh: "", windDirection: "", rainfallMm: "", leafWetness: "", fieldDescription: "", linkedSprayApplicationId: "", notes: "" };
function VehicleReadingsTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_VEH_FORM);
  const sprayAppsQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? d ?? [] });
  const equipmentQ = useQuery({ queryKey: ["equipment", farmId], queryFn: () => fetch(`/api/farms/${farmId}/equipment`).then((r) => r.json()), enabled: !!farmId, select: (d) => (d.records ?? []).filter((e) => e.isActive !== false) });
  const devicesQ = useQuery({ queryKey: ["vehicle-weather-devices", farmId], queryFn: () => fetch(`/api/farms/${farmId}/vehicle-weather-devices`).then((r) => r.json()), enabled: !!farmId, select: (d) => (d.records ?? []).filter((d2) => d2.isActive !== false) });
  const q = useQuery({ queryKey: ["vehicle-weather", farmId], queryFn: () => fetch(`/api/farms/${farmId}/vehicle-weather-readings`).then((r) => r.json()), enabled: !!farmId });
  const sprayApps = sprayAppsQ.data ?? [];
  const equipment = equipmentQ.data ?? [];
  const devices = devicesQ.data ?? [];
  const records = q.data?.records ?? [];
  const invalidate = () => qc.invalidateQueries({ queryKey: ["vehicle-weather", farmId] });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/vehicle-weather-readings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Reading saved" });
      invalidate();
      setAddOpen(false);
      setForm(EMPTY_VEH_FORM);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/vehicle-weather-readings/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Deleted" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const handleEquipmentSelect = (val) => {
    if (val === "__manual__" || val === "__none__") {
      setForm((f) => ({ ...f, selectedEquipmentId: val, vehicleName: "", vehicleRegistration: "" }));
      return;
    }
    const eq = equipment.find((e) => String(e.id) === val);
    if (eq) setForm((f) => ({ ...f, selectedEquipmentId: val, vehicleName: eq.name, vehicleRegistration: eq.registrationNumber || "" }));
  };
  const selectedDevice = devices.find((d) => String(d.id) === form.deviceId);
  const devForRecord = (r) => devices.find((d) => d.id === r.deviceId);
  const buildPayload = () => ({
    vehicleName: form.vehicleName,
    vehicleRegistration: form.vehicleRegistration || null,
    readingTimestamp: form.readingTimestamp,
    temperatureC: form.temperatureC || null,
    humidityPercent: form.humidityPercent || null,
    windSpeedKmh: form.windSpeedKmh || null,
    windDirection: form.windDirection || null,
    rainfallMm: form.rainfallMm || null,
    leafWetness: form.leafWetness || null,
    fieldDescription: form.fieldDescription || null,
    linkedSprayApplicationId: form.linkedSprayApplicationId ? parseInt(form.linkedSprayApplicationId) : null,
    notes: form.notes || null,
    equipmentId: form.selectedEquipmentId && form.selectedEquipmentId !== "__manual__" && form.selectedEquipmentId !== "__none__" ? parseInt(form.selectedEquipmentId) : null,
    deviceId: form.deviceId ? parseInt(form.deviceId) : null
  });
  const showManualVehicle = !equipment.length || form.selectedEquipmentId === "__manual__" || form.selectedEquipmentId === "__none__" || !form.selectedEquipmentId;
  const showEquipmentPicker = equipment.length > 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-3", children: "Log weather conditions captured by vehicle-mounted stations at the point of spraying. Select the vehicle from the Equipment Register and the recording device from the Device Register." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", justifyContent: "flex-end", marginBottom: 12 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
      setForm(EMPTY_VEH_FORM);
      setAddOpen(true);
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
      "Add Vehicle Reading"
    ] }) }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading…" }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No vehicle weather readings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Vehicle-mounted weather stations record conditions at the point of application for precision spraying evidence." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #e5e7eb", borderRadius: 10, overflow: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Date/Time", "Vehicle", "Reg", "Device", "Temp °C", "RH %", "Wind km/h", "Dir", "Rain mm", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, fontSize: "0.75rem", color: "#374151", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => {
        const dev = devForRecord(r);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer" }, onClick: () => setViewRecord(r), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280", whiteSpace: "nowrap" }, children: fmtTime(r.readingTimestamp) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", fontWeight: 500 }, children: r.vehicleName || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: r.vehicleRegistration || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: dev ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            dev.name,
            dev.serialNumber ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { color: "#9ca3af" }, children: [
              " · ",
              dev.serialNumber
            ] }) : null
          ] }) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: r.temperatureC ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: r.humidityPercent ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: r.windSpeedKmh ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: r.windDirection || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: r.rainfallMm ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem" }, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }, title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }) })
        ] }, r.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewRecord, onOpenChange: (o) => {
      if (!o) setViewRecord(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 500 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Vehicle Weather Reading" }) }),
      viewRecord && (() => {
        const dev = devForRecord(viewRecord);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Date / Time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: fmtTime(viewRecord.readingTimestamp) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Vehicle" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: viewRecord.vehicleName || "—" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Registration" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: viewRecord.vehicleRegistration || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Weather Device" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: dev ? `${dev.name}${dev.serialNumber ? ` (${dev.serialNumber})` : ""}` : "—" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Temp (°C)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: viewRecord.temperatureC ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Humidity (%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: viewRecord.humidityPercent ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Wind (km/h)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: viewRecord.windSpeedKmh ?? "—" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Direction" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: viewRecord.windDirection || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Rainfall (mm)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: viewRecord.rainfallMm ?? "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Leaf Wetness" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: viewRecord.leafWetness || "—" })
            ] })
          ] }),
          viewRecord.fieldDescription && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Field / Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: viewRecord.fieldDescription })
          ] }),
          viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: viewRecord.notes })
          ] })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", size: "sm", onClick: () => {
          setDeleteId(viewRecord?.id);
          setViewRecord(null);
        }, children: "Delete" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      setAddOpen(o);
      if (!o) {
        setForm(EMPTY_VEH_FORM);
        createMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 520 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Vehicle Weather Reading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", style: { maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }, children: "Vehicle" }),
          showEquipmentPicker ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Select from Equipment Register" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.selectedEquipmentId || "__none__", onValueChange: handleEquipmentSelect, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose vehicle / machine…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Choose vehicle / machine —" }),
                  equipment.map((e) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(e.id), children: [
                    e.name,
                    e.registrationNumber ? ` (${e.registrationNumber})` : ""
                  ] }, e.id)),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__manual__", children: "— Enter manually —" })
                ] })
              ] })
            ] }),
            showManualVehicle && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                  "Vehicle Name ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Amazone UX sprayer", value: form.vehicleName, onChange: (e) => setForm((f) => ({ ...f, vehicleName: e.target.value })) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Registration" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. AB12 CDE", value: form.vehicleRegistration, onChange: (e) => setForm((f) => ({ ...f, vehicleRegistration: e.target.value })) })
              ] })
            ] }),
            !showManualVehicle && form.vehicleName && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Vehicle" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: form.vehicleName })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Registration" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: form.vehicleRegistration || "—" })
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
                "Vehicle Name ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. Amazone UX sprayer", value: form.vehicleName, onChange: (e) => setForm((f) => ({ ...f, vehicleName: e.target.value })) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Registration" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. AB12 CDE", value: form.vehicleRegistration, onChange: (e) => setForm((f) => ({ ...f, vehicleRegistration: e.target.value })) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "0.75rem" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.7rem", fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }, children: "Weather Device" }),
          devices.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Select from Device Register" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.deviceId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, deviceId: v === "__none__" ? "" : v })), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choose device…" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— Not linked to a device —" }),
                  devices.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(d.id), children: [
                    d.name,
                    d.serialNumber ? ` · ${d.serialNumber}` : "",
                    d.manufacturer ? ` (${d.manufacturer})` : ""
                  ] }, d.id))
                ] })
              ] })
            ] }),
            selectedDevice && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Model" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: [selectedDevice.manufacturer, selectedDevice.model].filter(Boolean).join(" ") || "—" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Serial No." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-mono", children: selectedDevice.serialNumber || "—" })
              ] })
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "No devices registered — go to the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Device Register" }),
            " tab to add weather devices."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
            "Date & Time ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "datetime-local", value: form.readingTimestamp, onChange: (e) => setForm((f) => ({ ...f, readingTimestamp: e.target.value })) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Temperature (°C)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", value: form.temperatureC, onChange: (e) => setForm((f) => ({ ...f, temperatureC: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Relative Humidity (%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", max: "100", value: form.humidityPercent, onChange: (e) => setForm((f) => ({ ...f, humidityPercent: e.target.value })) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Wind Speed (km/h)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", value: form.windSpeedKmh, onChange: (e) => setForm((f) => ({ ...f, windSpeedKmh: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Wind Direction" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.windDirection || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, windDirection: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                DIRECTIONS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: d, children: d }, d))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rainfall (mm)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.1", min: "0", value: form.rainfallMm, onChange: (e) => setForm((f) => ({ ...f, rainfallMm: e.target.value })) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Leaf Wetness" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.leafWetness || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, leafWetness: v === "__none__" ? "" : v })), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select..." }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
                ["Dry", "Slightly Wet", "Moderately Wet", "Very Wet"].map((lw) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: lw, children: lw }, lw))
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Field / Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. North field — Barley", value: form.fieldDescription, onChange: (e) => setForm((f) => ({ ...f, fieldDescription: e.target.value })) })
        ] }),
        sprayApps.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link to Spray Application (optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.linkedSprayApplicationId || "__none__", onValueChange: (v) => setForm((f) => ({ ...f, linkedSprayApplicationId: v === "__none__" ? "" : v })), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select spray record…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__none__", children: "— None —" }),
              sprayApps.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectItem, { value: String(s.id), children: [
                s.applicationDate ? new Date(s.applicationDate).toLocaleDateString("en-GB") : "—",
                s.product ? ` — ${s.product}` : ""
              ] }, s.id))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(buildPayload()), disabled: !form.vehicleName || !form.readingTimestamp || createMut.isPending, children: "Save Reading" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 360 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Delete Reading" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "Are you sure you want to delete this reading?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Delete" })
      ] })
    ] }) })
  ] });
}
const INSTALL_TYPES = ["portable", "permanent", "fixed-field-sensor"];
const INSTALL_LABELS = { portable: "Portable", permanent: "Permanent (vehicle-fixed)", "fixed-field-sensor": "Fixed Field Sensor" };
const EMPTY_DEV_FORM = { name: "", manufacturer: "", model: "", serialNumber: "", installationType: "portable", calibrationDate: "", calibrationDueDate: "", apiDeviceId: "", notes: "" };
const MANUFACTURER_CATALOGUE = {
  "Davis Instruments": ["WeatherLink 6100", "WeatherLink Live", "Vantage Pro2", "Vantage Vue", "EnviroMonitor Node", "Leaf & Soil Station"],
  "Pessl Instruments": ["iMETOS 3.3", "iMETOS IMT300", "iMETOS Eco", "FrostPro", "FieldClimate Gateway"],
  "Onset (HOBO)": ["RX3000 Station", "H21-USB Micro Station", "U30-NRC Station", "MX2301 Temp/RH", "MX2307 Temp/RH/Light"],
  "Campbell Scientific": ["CR300 Datalogger", "CR310 Datalogger", "CR6 Datalogger", "AWS310 Station"],
  "Vaisala": ["WXT536 Multi-Parameter", "WXT530 Series", "HMP110 Humidity Probe", "PTB330 Barometer"],
  "Lufft": ["WS600 Smart Weather Sensor", "WS700 Smart Weather Sensor", "WS400-UMB", "OPUS20 THI"],
  "RM Young": ["05103 Wind Monitor", "41382 Rain Gauge", "61302 Barometric Pressure"],
  "Meter Group": ["ATMOS 41 Weather Station", "ATMOS 22 Wind Sensor", "ATMOS 14 Temp/RH/VP", "Zentra ZL6 Datalogger", "Em50G Datalogger"],
  "WatchDog (Spectrum)": ["WatchDog 2900ET Station", "WatchDog 2550 Station", "WatchDog 1650 Series"],
  "Harvest Master": ["HM1000", "Field Hub", "IntelliAg"],
  "OTT HydroMet": ["OTT Parsivel²", "OTT Pluvio² Rain Gauge", "Hydromet Station"]
};
function calibrationStatus(r) {
  if (!r.calibrationDueDate) return { label: "No due date", color: "#6b7280", bg: "#f3f4f6" };
  const diffDays = Math.floor((new Date(r.calibrationDueDate).getTime() - Date.now()) / 864e5);
  if (diffDays < 0) return { label: "Overdue", color: "#991b1b", bg: "#fef2f2" };
  if (diffDays <= 30) return { label: `Due in ${diffDays}d`, color: "#92400e", bg: "#fffbeb" };
  return { label: "OK", color: "#166534", bg: "#f0fdf4" };
}
function DevicesTab({ farmId }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = reactExports.useState(false);
  const [editRecord, setEditRecord] = reactExports.useState(null);
  const [viewRecord, setViewRecord] = reactExports.useState(null);
  const [deleteId, setDeleteId] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(EMPTY_DEV_FORM);
  const [mfgSel, setMfgSel] = reactExports.useState("");
  const [mdlSel, setMdlSel] = reactExports.useState("");
  const q = useQuery({ queryKey: ["vehicle-weather-devices", farmId], queryFn: () => fetch(`/api/farms/${farmId}/vehicle-weather-devices`).then((r) => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const records = q.data ?? [];
  const invalidate = () => qc.invalidateQueries({ queryKey: ["vehicle-weather-devices", farmId] });
  const createMut = useMutation({
    mutationFn: (body) => fetch(`/api/farms/${farmId}/vehicle-weather-devices`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Device added" });
      invalidate();
      setAddOpen(false);
      setForm(EMPTY_DEV_FORM);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" })
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }) => fetch(`/api/farms/${farmId}/vehicle-weather-devices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Device updated" });
      invalidate();
      setEditRecord(null);
      setForm(EMPTY_DEV_FORM);
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" })
  });
  const deleteMut = useMutation({
    mutationFn: (id) => fetch(`/api/farms/${farmId}/vehicle-weather-devices/${id}`, { method: "DELETE" }).then(async (r) => {
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `Request failed (${r.status})`);
      }
      return r;
    }),
    onSuccess: () => {
      toast({ title: "Device removed" });
      invalidate();
      setDeleteId(null);
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" })
  });
  const openEdit = (r) => {
    const knownMfg = r.manufacturer && Object.prototype.hasOwnProperty.call(MANUFACTURER_CATALOGUE, r.manufacturer);
    const mfgSel_ = knownMfg ? r.manufacturer : r.manufacturer ? "Other" : "";
    const knownMdl = mfgSel_ && mfgSel_ !== "Other" && r.model && MANUFACTURER_CATALOGUE[mfgSel_]?.includes(r.model);
    const mdlSel_ = knownMdl ? r.model : r.model ? "Other" : "";
    setMfgSel(mfgSel_);
    setMdlSel(mdlSel_);
    setForm({
      name: r.name || "",
      manufacturer: r.manufacturer || "",
      model: r.model || "",
      serialNumber: r.serialNumber || "",
      installationType: r.installationType || "portable",
      calibrationDate: r.calibrationDate ? new Date(r.calibrationDate).toISOString().slice(0, 10) : "",
      calibrationDueDate: r.calibrationDueDate ? new Date(r.calibrationDueDate).toISOString().slice(0, 10) : "",
      apiDeviceId: r.apiDeviceId || "",
      notes: r.notes || ""
    });
    setEditRecord(r);
    setViewRecord(null);
  };
  const formPayload = () => ({ ...form, calibrationDate: form.calibrationDate || null, calibrationDueDate: form.calibrationDueDate || null, apiDeviceId: form.apiDeviceId || null });
  const attnItems = records.filter((r) => {
    if (!r.calibrationDueDate) return false;
    return Math.floor((new Date(r.calibrationDueDate).getTime() - Date.now()) / 864e5) < 30;
  });
  const knownMfgModels = mfgSel && mfgSel !== "Other" ? MANUFACTURER_CATALOGUE[mfgSel] ?? [] : [];
  const DeviceFormFields = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
        "Device Name ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: "#ef4444" }, children: "*" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. North Field Davis Station", value: form.name, onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Manufacturer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mfgSel, onValueChange: (v) => {
          setMfgSel(v);
          setMdlSel("");
          setForm((f) => ({ ...f, manufacturer: v === "Other" ? "" : v, model: "" }));
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select manufacturer…" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            Object.keys(MANUFACTURER_CATALOGUE).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other / Not listed" })
          ] })
        ] }),
        mfgSel === "Other" && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", placeholder: "Enter manufacturer name", value: form.manufacturer, onChange: (e) => setForm((f) => ({ ...f, manufacturer: e.target.value })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Model" }),
        knownMfgModels.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: mdlSel, onValueChange: (v) => {
            setMdlSel(v);
            setForm((f) => ({ ...f, model: v === "Other" ? "" : v }));
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Select model…" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
              knownMfgModels.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: m, children: m }, m)),
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Other", children: "Other / Not listed" })
            ] })
          ] }),
          mdlSel === "Other" && /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "mt-2", placeholder: "Enter model name", value: form.model, onChange: (e) => setForm((f) => ({ ...f, model: e.target.value })) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. WeatherLink 6100", value: form.model, onChange: (e) => setForm((f) => ({ ...f, model: e.target.value })) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Serial Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. WL-2024-00123", value: form.serialNumber, onChange: (e) => setForm((f) => ({ ...f, serialNumber: e.target.value })) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Installation Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: form.installationType, onValueChange: (v) => setForm((f) => ({ ...f, installationType: v })), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectContent, { children: INSTALL_TYPES.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: t, children: INSTALL_LABELS[t] }, t)) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Last Calibration Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.calibrationDate, onChange: (e) => setForm((f) => ({ ...f, calibrationDate: e.target.value })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Date shown on the calibration certificate issued by your calibrating body." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Calibration Due Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "date", value: form.calibrationDueDate, onChange: (e) => setForm((f) => ({ ...f, calibrationDueDate: e.target.value })) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Next renewal date from the certificate — typically 12 months after last calibration." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Label, { children: [
        "API Device ID ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: "0.73rem", color: "#9ca3af", fontWeight: 400 }, children: "(for future cloud integration)" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "e.g. station ID from device provider", value: form.apiDeviceId, onChange: (e) => setForm((f) => ({ ...f, apiDeviceId: e.target.value })) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Notes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: form.notes, onChange: (e) => setForm((f) => ({ ...f, notes: e.target.value })), rows: 2 })
    ] })
  ] });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    attnItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 16, style: { color: "#d97706", flexShrink: 0, marginTop: 2 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { fontSize: "0.875rem" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: "#92400e" }, children: "Calibration attention needed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { style: { margin: "4px 0 0 0", paddingLeft: 16, color: "#78350f" }, children: attnItems.map((r) => {
          const s = calibrationStatus(r);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: r.name }),
            r.serialNumber ? ` (${r.serialNumber})` : "",
            " — ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: s.color }, children: s.label }),
            r.calibrationDueDate ? ` · due ${fmt(r.calibrationDueDate)}` : ""
          ] }, r.id);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Register vehicle-mounted and portable weather devices. Serial numbers and calibration dates are stored here and linked to readings automatically." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, flexShrink: 0 }, children: [
        records.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => window.print(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 14, className: "mr-1" }),
          "Print Register"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => {
          setForm(EMPTY_DEV_FORM);
          setMfgSel("");
          setMdlSel("");
          setAddOpen(true);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "mr-1" }),
          "Add Device"
        ] })
      ] })
    ] }),
    q.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 py-8 text-center", children: "Loading…" }) : records.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "3rem", color: "#9ca3af" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { size: 32, style: { margin: "0 auto 12px", opacity: 0.5 } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontWeight: 600, color: "#374151" }, children: "No devices registered" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: "0.875rem" }, children: "Add vehicle-mounted weather devices (Davis WeatherLink, Pessl iMETOS, etc.) to link readings to specific calibrated instruments." })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { border: "1px solid #e5e7eb", borderRadius: 10, overflow: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { style: { background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }, children: ["Device Name", "Make / Model", "Serial No.", "Install Type", "Last Calibrated", "Due Date", "Status", ""].map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { style: { padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, fontSize: "0.75rem", color: "#374151", whiteSpace: "nowrap" }, children: h }, h)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: records.map((r, i) => {
        const s = calibrationStatus(r);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { style: { borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer" }, onClick: () => setViewRecord(r), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", fontWeight: 500 }, children: r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: [r.manufacturer, r.model].filter(Boolean).join(" ") || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", fontFamily: "monospace", fontSize: "0.8rem", color: "#374151" }, children: r.serialNumber || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: INSTALL_LABELS[r.installationType] || r.installationType || "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: fmt(r.calibrationDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem", color: "#6b7280" }, children: fmt(r.calibrationDueDate) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { style: { padding: "0.5rem 0.75rem" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 12, fontSize: "0.73rem", fontWeight: 600, whiteSpace: "nowrap" }, children: s.label }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { style: { padding: "0.5rem", whiteSpace: "nowrap" }, onClick: (e) => e.stopPropagation(), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setViewRecord(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px 4px" }, title: "View", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => openEdit(r), style: { background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px 4px" }, title: "Edit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDeleteId(r.id), style: { background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: "2px 4px" }, title: "Remove", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) })
          ] })
        ] }, r.id);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!viewRecord, onOpenChange: (o) => {
      if (!o) setViewRecord(null);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Device Details" }) }),
      viewRecord && (() => {
        const s = calibrationStatus(viewRecord);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Device Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: viewRecord.name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Installation Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: INSTALL_LABELS[viewRecord.installationType] || viewRecord.installationType })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Manufacturer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: viewRecord.manufacturer || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Model" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: viewRecord.model || "—" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Serial Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-mono", children: viewRecord.serialNumber || "—" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "API Device ID" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-mono text-muted-foreground", children: viewRecord.apiDeviceId || "—" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Last Calibrated" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: fmt(viewRecord.calibrationDate) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Calibration Due" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6 }, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: fmt(viewRecord.calibrationDueDate) }),
                viewRecord.calibrationDueDate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { background: s.bg, color: s.color, padding: "1px 7px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 600 }, children: s.label })
              ] })
            ] })
          ] }),
          viewRecord.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: viewRecord.notes })
          ] })
        ] });
      })(),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setViewRecord(null), children: "Close" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", onClick: () => openEdit(viewRecord), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { size: 14, className: "mr-1" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", size: "sm", onClick: () => {
          setDeleteId(viewRecord?.id);
          setViewRecord(null);
        }, children: "Remove" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: addOpen, onOpenChange: (o) => {
      setAddOpen(o);
      if (!o) {
        setForm(EMPTY_DEV_FORM);
        setMfgSel("");
        setMdlSel("");
        createMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Add Weather Device" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DeviceFormFields, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: createMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setAddOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => createMut.mutate(formPayload()), disabled: !form.name || createMut.isPending, children: "Add Device" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: !!editRecord, onOpenChange: (o) => {
      if (!o) {
        setEditRecord(null);
        setForm(EMPTY_DEV_FORM);
        setMfgSel("");
        setMdlSel("");
        updateMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 480 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit Device" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DeviceFormFields, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: updateMut, message: "Failed to save — your entries are still here." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => {
          setEditRecord(null);
          setForm(EMPTY_DEV_FORM);
        }, children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => updateMut.mutate({ id: editRecord.id, body: formPayload() }), disabled: !form.name || updateMut.isPending, children: "Save Changes" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: deleteId !== null, onOpenChange: (o) => {
      if (!o) {
        setDeleteId(null);
        deleteMut.reset();
      }
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { style: { maxWidth: 360 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Remove Device" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 py-2", children: "This will remove the device from your register. Existing readings linked to this device will retain their data." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogMutationError, { mutation: deleteMut, message: "Failed to delete — please try again." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setDeleteId(null), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "destructive", onClick: () => deleteId !== null && deleteMut.mutate(deleteId), disabled: deleteMut.isPending, children: "Remove" })
      ] })
    ] }) })
  ] });
}
const WEATHER_PARAM_META = {
  air_temperature: { label: "Temperature", color: "#f97316" },
  temp_indoor: { label: "Indoor Temp", color: "#fb923c" },
  humidity: { label: "Humidity", color: "#3b82f6" },
  rainfall: { label: "Rainfall", color: "#06b6d4" },
  rain_rate: { label: "Rain Rate", color: "#0284c7" },
  wind_speed: { label: "Wind Speed", color: "#8b5cf6" },
  wind_direction: { label: "Wind Dir", color: "#6b7280" },
  pressure: { label: "Pressure", color: "#10b981" },
  solar_radiation: { label: "Solar Rad.", color: "#eab308" },
  uv_index: { label: "UV Index", color: "#f59e0b" },
  dew_point: { label: "Dew Point", color: "#14b8a6" },
  wet_bulb_temp: { label: "Wet Bulb", color: "#06b6d4" },
  temperature: { label: "Temperature", color: "#f97316" },
  relative_humidity: { label: "Humidity", color: "#3b82f6" },
  precipitation: { label: "Precipitation", color: "#06b6d4" },
  wind_gust: { label: "Wind Gust", color: "#7c3aed" },
  leaf_wetness: { label: "Leaf Wetness", color: "#22c55e" }
};
const SUMMARY_PARAMS = [
  "air_temperature",
  "temperature",
  "humidity",
  "relative_humidity",
  "rainfall",
  "precipitation",
  "wind_speed",
  "pressure",
  "solar_radiation"
];
function ConnectedStationsTab({ farmId }) {
  const [days, setDays] = reactExports.useState("7");
  const [selectedStation, setSelectedStation] = reactExports.useState(null);
  const [selectedParam, setSelectedParam] = reactExports.useState("");
  const from = new Date(Date.now() - Number(days) * 864e5).toISOString();
  const { data, isLoading } = useQuery({
    queryKey: ["sensor-readings-weather", farmId, days],
    queryFn: async () => {
      const res = await fetch(
        `/api/farms/${farmId}/sensor-readings?category=weather&from=${encodeURIComponent(from)}&limit=2000`
      );
      if (!res.ok) throw new Error("Failed to load station data");
      return res.json();
    }
  });
  const readings = data?.readings ?? [];
  const stationMap = /* @__PURE__ */ new Map();
  for (const r of readings) {
    if (!stationMap.has(r.stationId))
      stationMap.set(r.stationId, { name: r.stationName ?? r.stationId, readings: [] });
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
      const pref = availableParams.find((p) => p === "air_temperature") ?? availableParams.find((p) => p === "temperature") ?? availableParams[0];
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
  if (isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-gray-400 py-16 justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin" }),
    " Loading station data…"
  ] });
  if (stations.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { className: "w-10 h-10 mx-auto mb-3 text-gray-300" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-600 mb-1", children: "No connected weather stations" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-400 max-w-sm mx-auto", children: [
      "Connect a Davis WeatherLink, Sencrop, or FieldClimate station in",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Farm Settings → Sensor Integrations" }),
      " to see live data here."
    ] })
  ] });
  const summaryParams = SUMMARY_PARAMS.filter((p) => latestByParam.has(p));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-5", children: [
      stations.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          value: selectedStation ?? "",
          onChange: (e) => {
            setSelectedStation(e.target.value);
            setSelectedParam("");
          },
          className: "text-sm border border-gray-200 rounded px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400",
          children: stations.map(([id, s]) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: id, children: s.name }, id))
        }
      ),
      stations.length === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-gray-700 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { size: 14, className: "text-green-600" }),
        stations[0][1].name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: days,
          onChange: (e) => setDays(e.target.value),
          className: "text-sm border border-gray-200 rounded px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "7", children: "Last 7 days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "14", children: "Last 14 days" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "30", children: "Last 30 days" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-400 ml-auto", children: [
        stationData?.readings.length ?? 0,
        " readings synced"
      ] })
    ] }),
    summaryParams.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6", children: summaryParams.map((param) => {
      const r = latestByParam.get(param);
      const meta = WEATHER_PARAM_META[param];
      const isSelected = selectedParam === param;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setSelectedParam(param),
          className: `rounded-lg border p-3 text-left transition-all w-full ${isSelected ? "border-green-500 bg-green-50 ring-1 ring-green-400" : "border-gray-200 bg-white hover:border-gray-300"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-500 mb-1 truncate", children: meta?.label ?? param }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xl font-semibold text-gray-800", children: [
              Number(r.value).toFixed(1),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-gray-500 ml-0.5", children: r.unit })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-400 mt-0.5", children: new Date(r.recordedAt).toLocaleString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            }) })
          ]
        },
        param
      );
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: WEATHER_PARAM_META[selectedParam]?.label ?? selectedParam }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "select",
          {
            value: selectedParam,
            onChange: (e) => setSelectedParam(e.target.value),
            className: "text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-green-400 ml-auto",
            children: availableParams.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: p, children: WEATHER_PARAM_META[p]?.label ?? p }, p))
          }
        )
      ] }),
      chartData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-gray-400 py-12 text-sm", children: "No data for selected parameter and date range" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: 280, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LineChart, { data: chartData, margin: { top: 4, right: 16, left: 0, bottom: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f0f0f0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "t", tick: { fontSize: 10 }, interval: "preserveStartEnd" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: { fontSize: 10 }, width: 52 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Tooltip,
          {
            formatter: (v) => [
              `${v} ${latestByParam.get(selectedParam)?.unit ?? ""}`,
              WEATHER_PARAM_META[selectedParam]?.label ?? selectedParam
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Line,
          {
            type: "monotone",
            dataKey: "v",
            stroke: WEATHER_PARAM_META[selectedParam]?.color ?? "#10b981",
            dot: false,
            strokeWidth: 2,
            connectNulls: true
          }
        )
      ] }) })
    ] })
  ] });
}
function WeatherPageFull() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab({ page: "weather", farmId, validIds: WEATHER_TAB_IDS, defaultTab: "readings" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { title: "Weather Records", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 1100, margin: "0 auto" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-4", children: "Log on-farm weather conditions to support spray application records and demonstrate compliance with spraying regulations." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(TabBar, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "readings", onClick: () => setTab("readings"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { size: 14, className: "mr-1" }),
        "Readings"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "chart", onClick: () => setTab("chart"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 14, className: "mr-1" }),
        "Chart"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "vehicle", onClick: () => setTab("vehicle"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 14, className: "mr-1" }),
        "Vehicle Stations"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "devices", onClick: () => setTab("devices"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { size: 14, className: "mr-1" }),
        "Device Register"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabButton, { active: tab === "stations", onClick: () => setTab("stations"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Cpu, { size: 14, className: "mr-1" }),
        "Connected Stations"
      ] })
    ] }),
    farmId && tab === "readings" && /* @__PURE__ */ jsxRuntimeExports.jsx(ReadingsTab, { farmId }),
    farmId && tab === "chart" && /* @__PURE__ */ jsxRuntimeExports.jsx(ChartTab, { farmId }),
    farmId && tab === "vehicle" && /* @__PURE__ */ jsxRuntimeExports.jsx(VehicleReadingsTab, { farmId }),
    farmId && tab === "devices" && /* @__PURE__ */ jsxRuntimeExports.jsx(DevicesTab, { farmId }),
    farmId && tab === "stations" && /* @__PURE__ */ jsxRuntimeExports.jsx(ConnectedStationsTab, { farmId })
  ] }) });
}
export {
  WeatherPageFull as default
};
