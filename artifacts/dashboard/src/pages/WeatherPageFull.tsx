import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Plus, Trash2, Cloud, TrendingUp, Truck, Loader2, MapPin, Cpu, AlertTriangle, Pencil, Eye, Printer } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function degreesToCompass(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

function wmoToCondition(code: number): string {
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

type Tab = "readings" | "chart" | "vehicle" | "devices" | "stations";
const WEATHER_TAB_IDS: Tab[] = ["readings", "chart", "vehicle", "devices", "stations"];

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtTime = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

// ─── Readings Tab ─────────────────────────────────────────────────────────────

function ReadingsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ readingTimestamp: "", temperatureC: "", humidityPercent: "", windSpeedKmh: "", windDirection: "", rainfallMm: "", pressureHpa: "", linkedSprayApplicationId: "", notes: "" });
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [weatherFetchMsg, setWeatherFetchMsg] = useState<string | null>(null);

  const sprayAppsQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then(r => r.json()), enabled: !!farmId, select: (d) => d.records ?? d ?? [] });
  const q = useQuery({ queryKey: ["weather-readings", farmId], queryFn: () => fetch(`/api/farms/${farmId}/weather-readings`).then(r => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["weather-readings", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/weather-readings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Reading saved" }); invalidate(); setAddOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/weather-readings/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const fetchWeatherFromApi = useCallback(async () => {
    setFetchingWeather(true);
    setWeatherFetchMsg(null);
    try {
      const pos: GeolocationPosition = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const { latitude, longitude } = pos.coords;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Open-Meteo error ${resp.status}`);
      const data = await resp.json();
      const c = data.current;
      const now = new Date().toISOString().slice(0, 16);
      setForm((f: any) => ({
        ...f,
        readingTimestamp: f.readingTimestamp || now,
        temperatureC: c.temperature_2m != null ? String(Math.round(c.temperature_2m * 10) / 10) : f.temperatureC,
        humidityPercent: c.relative_humidity_2m != null ? String(Math.round(c.relative_humidity_2m)) : f.humidityPercent,
        rainfallMm: c.precipitation != null ? String(Math.round(c.precipitation * 10) / 10) : f.rainfallMm,
        windSpeedKmh: c.wind_speed_10m != null ? String(Math.round(c.wind_speed_10m)) : f.windSpeedKmh,
        windDirection: c.wind_direction_10m != null ? degreesToCompass(c.wind_direction_10m) : f.windDirection,
        pressureHpa: c.pressure_msl != null ? String(Math.round(c.pressure_msl)) : f.pressureHpa,
        notes: f.notes || (c.weather_code != null ? `Conditions: ${wmoToCondition(c.weather_code)}` : ""),
      }));
      setWeatherFetchMsg(`Live data fetched · ${latitude.toFixed(3)}°N, ${Math.abs(longitude).toFixed(3)}°${longitude < 0 ? "W" : "E"}`);
    } catch (err) {
      setWeatherFetchMsg(`Could not fetch: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setFetchingWeather(false);
    }
  }, []);

  const sprayApps: any[] = sprayAppsQ.data ?? [];
  const resetForm = () => { setForm({ readingTimestamp: "", temperatureC: "", humidityPercent: "", windSpeedKmh: "", windDirection: "", rainfallMm: "", pressureHpa: "", linkedSprayApplicationId: "", notes: "" }); setWeatherFetchMsg(null); };
  const records: any[] = q.data ?? [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Reading</Button>
      </div>
      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Cloud size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No weather readings recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Log temperature, rainfall and wind conditions relevant to spraying decisions.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date / Time", "Temp (°C)", "Humidity (%)", "Wind (km/h)", "Direction", "Rainfall (mm)", "Pressure (hPa)", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtTime(r.readingTimestamp)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500 }}>{r.temperatureC ?? "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.humidityPercent ?? "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.windSpeedKmh ?? "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.windDirection || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.rainfallMm ?? "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.pressureHpa ?? "—"}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) { resetForm(); createMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>Add Weather Reading</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.625rem 0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: "0.8125rem", color: "#166534" }}>
                <strong>Auto-fill from Open-Meteo</strong> — uses your browser location to fetch live conditions
                {weatherFetchMsg && <div style={{ marginTop: 3, fontSize: "0.75rem", color: weatherFetchMsg.startsWith("Could") ? "#991b1b" : "#166534" }}>{weatherFetchMsg}</div>}
              </div>
              <Button size="sm" variant="outline" onClick={fetchWeatherFromApi} disabled={fetchingWeather} style={{ flexShrink: 0, borderColor: "#86efac", color: "#166534" }}>
                {fetchingWeather ? <><Loader2 size={13} className="mr-1 animate-spin" />Fetching…</> : <><MapPin size={13} className="mr-1" />Fetch Live</>}
              </Button>
            </div>
            <div><Label>Date &amp; Time <span style={{ color: "#ef4444" }}>*</span></Label><Input type="datetime-local" value={form.readingTimestamp} onChange={e => setForm((f: any) => ({ ...f, readingTimestamp: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Temperature (°C)</Label><Input type="number" step="0.1" value={form.temperatureC} onChange={e => setForm((f: any) => ({ ...f, temperatureC: e.target.value }))} /></div>
              <div><Label>Humidity (%)</Label><Input type="number" step="0.1" min="0" max="100" value={form.humidityPercent} onChange={e => setForm((f: any) => ({ ...f, humidityPercent: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Wind Speed (km/h)</Label><Input type="number" step="0.1" min="0" value={form.windSpeedKmh} onChange={e => setForm((f: any) => ({ ...f, windSpeedKmh: e.target.value }))} /></div>
              <div><Label>Wind Direction</Label>
                <Select value={form.windDirection} onValueChange={v => setForm((f: any) => ({ ...f, windDirection: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{["N","NE","E","SE","S","SW","W","NW","Variable","Calm"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Rainfall (mm)</Label><Input type="number" step="0.1" min="0" value={form.rainfallMm} onChange={e => setForm((f: any) => ({ ...f, rainfallMm: e.target.value }))} /></div>
              <div><Label>Pressure (hPa)</Label><Input type="number" step="0.1" value={form.pressureHpa} onChange={e => setForm((f: any) => ({ ...f, pressureHpa: e.target.value }))} /></div>
            </div>
            {sprayApps.length > 0 && (
              <div><Label>Link to Spray Application (optional)</Label>
                <Select value={form.linkedSprayApplicationId || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, linkedSprayApplicationId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select spray record…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {sprayApps.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.applicationDate ? new Date(s.applicationDate).toLocaleDateString("en-GB") : "—"}{s.product ? ` — ${s.product}` : ""}{s.fieldDescription ? ` (${s.fieldDescription})` : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate({ ...form, linkedSprayApplicationId: form.linkedSprayApplicationId ? parseInt(form.linkedSprayApplicationId) : null })} disabled={!form.readingTimestamp || createMut.isPending}>Save Reading</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Reading</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this weather reading?</p>
          <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Chart Tab ────────────────────────────────────────────────────────────────

function ChartTab({ farmId }: { farmId: number }) {
  const [metric, setMetric] = useState<"temperature" | "rainfall" | "humidity" | "wind">("temperature");
  const [days, setDays] = useState(30);

  const q = useQuery({ queryKey: ["weather-readings", farmId], queryFn: () => fetch(`/api/farms/${farmId}/weather-readings`).then(r => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const records: any[] = q.data ?? [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const chartData = records
    .filter((r: any) => r.readingTimestamp && new Date(r.readingTimestamp) >= cutoff)
    .sort((a: any, b: any) => new Date(a.readingTimestamp).getTime() - new Date(b.readingTimestamp).getTime())
    .map((r: any) => ({
      date: new Date(r.readingTimestamp).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      temperature: r.temperatureC != null ? parseFloat(r.temperatureC) : null,
      rainfall: r.rainfallMm != null ? parseFloat(r.rainfallMm) : null,
      humidity: r.humidityPercent != null ? parseFloat(r.humidityPercent) : null,
      wind: r.windSpeedKmh != null ? parseFloat(r.windSpeedKmh) : null,
    }));

  const metricConfig = {
    temperature: { key: "temperature", label: "Temperature (°C)", color: "#f97316", unit: "°C" },
    rainfall: { key: "rainfall", label: "Rainfall (mm)", color: "#3b82f6", unit: "mm" },
    humidity: { key: "humidity", label: "Humidity (%)", color: "#8b5cf6", unit: "%" },
    wind: { key: "wind", label: "Wind Speed (km/h)", color: "#10b981", unit: "km/h" },
  };
  const cfg = metricConfig[metric];

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {(["temperature", "rainfall", "humidity", "wind"] as const).map(m => (
            <button key={m} onClick={() => setMetric(m)} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid", borderColor: metric === m ? metricConfig[m].color : "#e5e7eb", background: metric === m ? metricConfig[m].color : "#fff", color: metric === m ? "#fff" : "#374151", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer" }}>
              {metricConfig[m].label.split(" ")[0]}
            </button>
          ))}
        </div>
        <Select value={String(days)} onValueChange={v => setDays(parseInt(v))}>
          <SelectTrigger style={{ width: 120 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            {[["7","Last 7 days"],["14","Last 14 days"],["30","Last 30 days"],["90","Last 90 days"],["365","Last year"]].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : chartData.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <TrendingUp size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No data for selected period</p>
          <p style={{ fontSize: "0.875rem" }}>Add weather readings in the Readings tab to see charts here.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1.5rem" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: 16 }}>{cfg.label} — last {days} days</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} unit={cfg.unit} />
              <Tooltip contentStyle={{ fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e7eb" }} formatter={(v: any) => [`${v}${cfg.unit}`, cfg.label]} />
              <Line type="monotone" dataKey={cfg.key} stroke={cfg.color} strokeWidth={2} dot={{ r: 3, fill: cfg.color }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ─── Vehicle Readings Tab ─────────────────────────────────────────────────────

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "Variable", "Calm"];
const EMPTY_VEH_FORM = { selectedEquipmentId: "", vehicleName: "", vehicleRegistration: "", deviceId: "", readingTimestamp: "", temperatureC: "", humidityPercent: "", windSpeedKmh: "", windDirection: "", rainfallMm: "", leafWetness: "", fieldDescription: "", linkedSprayApplicationId: "", notes: "" };

function VehicleReadingsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(EMPTY_VEH_FORM);

  const sprayAppsQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then(r => r.json()), enabled: !!farmId, select: (d) => d.records ?? d ?? [] });
  const equipmentQ = useQuery({ queryKey: ["equipment", farmId], queryFn: () => fetch(`/api/farms/${farmId}/equipment`).then(r => r.json()), enabled: !!farmId, select: (d) => (d.records ?? []).filter((e: any) => e.isActive !== false) });
  const devicesQ = useQuery({ queryKey: ["vehicle-weather-devices", farmId], queryFn: () => fetch(`/api/farms/${farmId}/vehicle-weather-devices`).then(r => r.json()), enabled: !!farmId, select: (d) => (d.records ?? []).filter((d: any) => d.isActive !== false) });
  const q = useQuery({ queryKey: ["vehicle-weather", farmId], queryFn: () => fetch(`/api/farms/${farmId}/vehicle-weather-readings`).then(r => r.json()), enabled: !!farmId });

  const sprayApps: any[] = sprayAppsQ.data ?? [];
  const equipment: any[] = equipmentQ.data ?? [];
  const devices: any[] = devicesQ.data ?? [];
  const records: any[] = q.data?.records ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ["vehicle-weather", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/vehicle-weather-readings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Reading saved" }); invalidate(); setAddOpen(false); setForm(EMPTY_VEH_FORM); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/vehicle-weather-readings/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const handleEquipmentSelect = (val: string) => {
    if (val === "__manual__" || val === "__none__") {
      setForm((f: any) => ({ ...f, selectedEquipmentId: val, vehicleName: "", vehicleRegistration: "" }));
      return;
    }
    const eq = equipment.find((e: any) => String(e.id) === val);
    if (eq) setForm((f: any) => ({ ...f, selectedEquipmentId: val, vehicleName: eq.name, vehicleRegistration: eq.registrationNumber || "" }));
  };

  const selectedDevice = devices.find((d: any) => String(d.id) === form.deviceId);
  const devForRecord = (r: any) => devices.find((d: any) => d.id === r.deviceId);

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
    deviceId: form.deviceId ? parseInt(form.deviceId) : null,
  });

  const showManualVehicle = !equipment.length || form.selectedEquipmentId === "__manual__" || form.selectedEquipmentId === "__none__" || !form.selectedEquipmentId;
  const showEquipmentPicker = equipment.length > 0;

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">Log weather conditions captured by vehicle-mounted stations at the point of spraying. Select the vehicle from the Equipment Register and the recording device from the Device Register.</p>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={() => { setForm(EMPTY_VEH_FORM); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Vehicle Reading</Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading…</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Truck size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No vehicle weather readings</p>
          <p style={{ fontSize: "0.875rem" }}>Vehicle-mounted weather stations record conditions at the point of application for precision spraying evidence.</p>
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead><tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Date/Time","Vehicle","Reg","Device","Temp °C","RH %","Wind km/h","Dir","Rain mm",""].map(h => <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, fontSize: "0.75rem", color: "#374151", whiteSpace: "nowrap" }}>{h}</th>)}
            </tr></thead>
            <tbody>{records.map((r: any, i: number) => {
              const dev = devForRecord(r);
              return (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer" }} onClick={() => setViewRecord(r)}>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtTime(r.readingTimestamp)}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontWeight: 500 }}>{r.vehicleName || "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.vehicleRegistration || "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{dev ? <span>{dev.name}{dev.serialNumber ? <span style={{ color: "#9ca3af" }}> · {dev.serialNumber}</span> : null}</span> : "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>{r.temperatureC ?? "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.humidityPercent ?? "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.windSpeedKmh ?? "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.windDirection || "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.rainfallMm ?? "—"}</td>
                  <td style={{ padding: "0.5rem" }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}

      {/* View dialog */}
      <Dialog open={!!viewRecord} onOpenChange={o => { if (!o) setViewRecord(null); }}>
        <DialogContent style={{ maxWidth: 500 }}>
          <DialogHeader><DialogTitle>Vehicle Weather Reading</DialogTitle></DialogHeader>
          {viewRecord && (() => {
            const dev = devForRecord(viewRecord);
            return (
              <div className="space-y-3 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Date / Time</Label><p className="text-sm font-medium">{fmtTime(viewRecord.readingTimestamp)}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Vehicle</Label><p className="text-sm font-medium">{viewRecord.vehicleName || "—"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Registration</Label><p className="text-sm">{viewRecord.vehicleRegistration || "—"}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Weather Device</Label><p className="text-sm">{dev ? `${dev.name}${dev.serialNumber ? ` (${dev.serialNumber})` : ""}` : "—"}</p></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Temp (°C)</Label><p className="text-sm font-medium">{viewRecord.temperatureC ?? "—"}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Humidity (%)</Label><p className="text-sm">{viewRecord.humidityPercent ?? "—"}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Wind (km/h)</Label><p className="text-sm">{viewRecord.windSpeedKmh ?? "—"}</p></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Direction</Label><p className="text-sm">{viewRecord.windDirection || "—"}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Rainfall (mm)</Label><p className="text-sm">{viewRecord.rainfallMm ?? "—"}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Leaf Wetness</Label><p className="text-sm">{viewRecord.leafWetness || "—"}</p></div>
                </div>
                {viewRecord.fieldDescription && <div><Label className="text-xs text-muted-foreground">Field / Location</Label><p className="text-sm">{viewRecord.fieldDescription}</p></div>}
                {viewRecord.notes && <div><Label className="text-xs text-muted-foreground">Notes</Label><p className="text-sm">{viewRecord.notes}</p></div>}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
            <Button variant="destructive" size="sm" onClick={() => { setDeleteId(viewRecord?.id); setViewRecord(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) { setForm(EMPTY_VEH_FORM); createMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>Add Vehicle Weather Reading</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2" style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 4 }}>
            {/* Vehicle */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "0.75rem" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Vehicle</p>
              {showEquipmentPicker ? (
                <>
                  <div>
                    <Label>Select from Equipment Register</Label>
                    <Select value={form.selectedEquipmentId || "__none__"} onValueChange={handleEquipmentSelect}>
                      <SelectTrigger><SelectValue placeholder="Choose vehicle / machine…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Choose vehicle / machine —</SelectItem>
                        {equipment.map((e: any) => <SelectItem key={e.id} value={String(e.id)}>{e.name}{e.registrationNumber ? ` (${e.registrationNumber})` : ""}</SelectItem>)}
                        <SelectItem value="__manual__">— Enter manually —</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {showManualVehicle && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div><Label>Vehicle Name <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. Amazone UX sprayer" value={form.vehicleName} onChange={e => setForm((f: any) => ({ ...f, vehicleName: e.target.value }))} /></div>
                      <div><Label>Registration</Label><Input placeholder="e.g. AB12 CDE" value={form.vehicleRegistration} onChange={e => setForm((f: any) => ({ ...f, vehicleRegistration: e.target.value }))} /></div>
                    </div>
                  )}
                  {!showManualVehicle && form.vehicleName && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div><Label className="text-xs text-muted-foreground">Vehicle</Label><p className="text-sm font-medium">{form.vehicleName}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Registration</Label><p className="text-sm">{form.vehicleRegistration || "—"}</p></div>
                    </div>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Vehicle Name <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. Amazone UX sprayer" value={form.vehicleName} onChange={e => setForm((f: any) => ({ ...f, vehicleName: e.target.value }))} /></div>
                  <div><Label>Registration</Label><Input placeholder="e.g. AB12 CDE" value={form.vehicleRegistration} onChange={e => setForm((f: any) => ({ ...f, vehicleRegistration: e.target.value }))} /></div>
                </div>
              )}
            </div>

            {/* Device */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "0.75rem" }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Weather Device</p>
              {devices.length > 0 ? (
                <>
                  <div>
                    <Label>Select from Device Register</Label>
                    <Select value={form.deviceId || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, deviceId: v === "__none__" ? "" : v }))}>
                      <SelectTrigger><SelectValue placeholder="Choose device…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Not linked to a device —</SelectItem>
                        {devices.map((d: any) => <SelectItem key={d.id} value={String(d.id)}>{d.name}{d.serialNumber ? ` · ${d.serialNumber}` : ""}{d.manufacturer ? ` (${d.manufacturer})` : ""}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedDevice && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div><Label className="text-xs text-muted-foreground">Model</Label><p className="text-sm">{[selectedDevice.manufacturer, selectedDevice.model].filter(Boolean).join(" ") || "—"}</p></div>
                      <div><Label className="text-xs text-muted-foreground">Serial No.</Label><p className="text-sm font-mono">{selectedDevice.serialNumber || "—"}</p></div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground">No devices registered — go to the <strong>Device Register</strong> tab to add weather devices.</p>
              )}
            </div>

            <div><Label>Date &amp; Time <span style={{ color: "#ef4444" }}>*</span></Label><Input type="datetime-local" value={form.readingTimestamp} onChange={e => setForm((f: any) => ({ ...f, readingTimestamp: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Temperature (°C)</Label><Input type="number" step="0.1" value={form.temperatureC} onChange={e => setForm((f: any) => ({ ...f, temperatureC: e.target.value }))} /></div>
              <div><Label>Relative Humidity (%)</Label><Input type="number" step="0.1" min="0" max="100" value={form.humidityPercent} onChange={e => setForm((f: any) => ({ ...f, humidityPercent: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Wind Speed (km/h)</Label><Input type="number" step="0.1" min="0" value={form.windSpeedKmh} onChange={e => setForm((f: any) => ({ ...f, windSpeedKmh: e.target.value }))} /></div>
              <div><Label>Wind Direction</Label>
                <Select value={form.windDirection || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, windDirection: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent><SelectItem value="__none__">— None —</SelectItem>{DIRECTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Rainfall (mm)</Label><Input type="number" step="0.1" min="0" value={form.rainfallMm} onChange={e => setForm((f: any) => ({ ...f, rainfallMm: e.target.value }))} /></div>
              <div><Label>Leaf Wetness</Label>
                <Select value={form.leafWetness || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, leafWetness: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent><SelectItem value="__none__">— None —</SelectItem>{["Dry","Slightly Wet","Moderately Wet","Very Wet"].map(lw => <SelectItem key={lw} value={lw}>{lw}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Field / Location</Label><Input placeholder="e.g. North field — Barley" value={form.fieldDescription} onChange={e => setForm((f: any) => ({ ...f, fieldDescription: e.target.value }))} /></div>
            {sprayApps.length > 0 && (
              <div><Label>Link to Spray Application (optional)</Label>
                <Select value={form.linkedSprayApplicationId || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, linkedSprayApplicationId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select spray record…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {sprayApps.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.applicationDate ? new Date(s.applicationDate).toLocaleDateString("en-GB") : "—"}{s.product ? ` — ${s.product}` : ""}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(buildPayload())} disabled={!form.vehicleName || !form.readingTimestamp || createMut.isPending}>Save Reading</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Reading</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this reading?</p>
          <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Device Register Tab ──────────────────────────────────────────────────────

const INSTALL_TYPES = ["portable", "permanent", "fixed-field-sensor"] as const;
const INSTALL_LABELS: Record<string, string> = { portable: "Portable", permanent: "Permanent (vehicle-fixed)", "fixed-field-sensor": "Fixed Field Sensor" };
const EMPTY_DEV_FORM = { name: "", manufacturer: "", model: "", serialNumber: "", installationType: "portable", calibrationDate: "", calibrationDueDate: "", apiDeviceId: "", notes: "" };

const MANUFACTURER_CATALOGUE: Record<string, string[]> = {
  "Davis Instruments":    ["WeatherLink 6100", "WeatherLink Live", "Vantage Pro2", "Vantage Vue", "EnviroMonitor Node", "Leaf & Soil Station"],
  "Pessl Instruments":    ["iMETOS 3.3", "iMETOS IMT300", "iMETOS Eco", "FrostPro", "FieldClimate Gateway"],
  "Onset (HOBO)":         ["RX3000 Station", "H21-USB Micro Station", "U30-NRC Station", "MX2301 Temp/RH", "MX2307 Temp/RH/Light"],
  "Campbell Scientific":  ["CR300 Datalogger", "CR310 Datalogger", "CR6 Datalogger", "AWS310 Station"],
  "Vaisala":              ["WXT536 Multi-Parameter", "WXT530 Series", "HMP110 Humidity Probe", "PTB330 Barometer"],
  "Lufft":                ["WS600 Smart Weather Sensor", "WS700 Smart Weather Sensor", "WS400-UMB", "OPUS20 THI"],
  "RM Young":             ["05103 Wind Monitor", "41382 Rain Gauge", "61302 Barometric Pressure"],
  "Meter Group":          ["ATMOS 41 Weather Station", "ATMOS 22 Wind Sensor", "ATMOS 14 Temp/RH/VP", "Zentra ZL6 Datalogger", "Em50G Datalogger"],
  "WatchDog (Spectrum)":  ["WatchDog 2900ET Station", "WatchDog 2550 Station", "WatchDog 1650 Series"],
  "Harvest Master":       ["HM1000", "Field Hub", "IntelliAg"],
  "OTT HydroMet":         ["OTT Parsivel²", "OTT Pluvio² Rain Gauge", "Hydromet Station"],
};

function calibrationStatus(r: any): { label: string; color: string; bg: string } {
  if (!r.calibrationDueDate) return { label: "No due date", color: "#6b7280", bg: "#f3f4f6" };
  const diffDays = Math.floor((new Date(r.calibrationDueDate).getTime() - Date.now()) / 86400000);
  if (diffDays < 0) return { label: "Overdue", color: "#991b1b", bg: "#fef2f2" };
  if (diffDays <= 30) return { label: `Due in ${diffDays}d`, color: "#92400e", bg: "#fffbeb" };
  return { label: "OK", color: "#166534", bg: "#f0fdf4" };
}

function DevicesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(EMPTY_DEV_FORM);
  const [mfgSel, setMfgSel] = useState(""); // catalogue key, "Other", or "" = not chosen
  const [mdlSel, setMdlSel] = useState(""); // model string, "Other", or ""

  const q = useQuery({ queryKey: ["vehicle-weather-devices", farmId], queryFn: () => fetch(`/api/farms/${farmId}/vehicle-weather-devices`).then(r => r.json()), enabled: !!farmId, select: (d) => d.records ?? [] });
  const records: any[] = q.data ?? [];
  const invalidate = () => qc.invalidateQueries({ queryKey: ["vehicle-weather-devices", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/vehicle-weather-devices`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Device added" }); invalidate(); setAddOpen(false); setForm(EMPTY_DEV_FORM); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/vehicle-weather-devices/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Device updated" }); invalidate(); setEditRecord(null); setForm(EMPTY_DEV_FORM); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/vehicle-weather-devices/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Device removed" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const openEdit = (r: any) => {
    const knownMfg = r.manufacturer && Object.prototype.hasOwnProperty.call(MANUFACTURER_CATALOGUE, r.manufacturer);
    const mfgSel_ = knownMfg ? r.manufacturer : (r.manufacturer ? "Other" : "");
    const knownMdl = mfgSel_ && mfgSel_ !== "Other" && r.model && MANUFACTURER_CATALOGUE[mfgSel_]?.includes(r.model);
    const mdlSel_ = knownMdl ? r.model : (r.model ? "Other" : "");
    setMfgSel(mfgSel_);
    setMdlSel(mdlSel_);
    setForm({
      name: r.name || "", manufacturer: r.manufacturer || "", model: r.model || "", serialNumber: r.serialNumber || "",
      installationType: r.installationType || "portable",
      calibrationDate: r.calibrationDate ? new Date(r.calibrationDate).toISOString().slice(0, 10) : "",
      calibrationDueDate: r.calibrationDueDate ? new Date(r.calibrationDueDate).toISOString().slice(0, 10) : "",
      apiDeviceId: r.apiDeviceId || "", notes: r.notes || "",
    });
    setEditRecord(r);
    setViewRecord(null);
  };

  const formPayload = () => ({ ...form, calibrationDate: form.calibrationDate || null, calibrationDueDate: form.calibrationDueDate || null, apiDeviceId: form.apiDeviceId || null });

  const attnItems = records.filter((r: any) => {
    if (!r.calibrationDueDate) return false;
    return Math.floor((new Date(r.calibrationDueDate).getTime() - Date.now()) / 86400000) < 30;
  });

  const knownMfgModels = mfgSel && mfgSel !== "Other" ? (MANUFACTURER_CATALOGUE[mfgSel] ?? []) : [];

  const DeviceFormFields = () => (
    <div className="space-y-3 py-2">
      <div>
        <Label>Device Name <span style={{ color: "#ef4444" }}>*</span></Label>
        <Input placeholder="e.g. North Field Davis Station" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Manufacturer — curated lookup */}
        <div>
          <Label>Manufacturer</Label>
          <Select value={mfgSel} onValueChange={v => {
            setMfgSel(v);
            setMdlSel("");
            setForm((f: any) => ({ ...f, manufacturer: v === "Other" ? "" : v, model: "" }));
          }}>
            <SelectTrigger><SelectValue placeholder="Select manufacturer…" /></SelectTrigger>
            <SelectContent>
              {Object.keys(MANUFACTURER_CATALOGUE).map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              <SelectItem value="Other">Other / Not listed</SelectItem>
            </SelectContent>
          </Select>
          {mfgSel === "Other" && (
            <Input className="mt-2" placeholder="Enter manufacturer name" value={form.manufacturer} onChange={e => setForm((f: any) => ({ ...f, manufacturer: e.target.value }))} />
          )}
        </div>

        {/* Model — dependent on manufacturer */}
        <div>
          <Label>Model</Label>
          {knownMfgModels.length > 0 ? (
            <>
              <Select value={mdlSel} onValueChange={v => {
                setMdlSel(v);
                setForm((f: any) => ({ ...f, model: v === "Other" ? "" : v }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select model…" /></SelectTrigger>
                <SelectContent>
                  {knownMfgModels.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  <SelectItem value="Other">Other / Not listed</SelectItem>
                </SelectContent>
              </Select>
              {mdlSel === "Other" && (
                <Input className="mt-2" placeholder="Enter model name" value={form.model} onChange={e => setForm((f: any) => ({ ...f, model: e.target.value }))} />
              )}
            </>
          ) : (
            <Input placeholder="e.g. WeatherLink 6100" value={form.model} onChange={e => setForm((f: any) => ({ ...f, model: e.target.value }))} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Serial Number</Label>
          <Input placeholder="e.g. WL-2024-00123" value={form.serialNumber} onChange={e => setForm((f: any) => ({ ...f, serialNumber: e.target.value }))} />
        </div>
        <div>
          <Label>Installation Type</Label>
          <Select value={form.installationType} onValueChange={v => setForm((f: any) => ({ ...f, installationType: v }))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{INSTALL_TYPES.map(t => <SelectItem key={t} value={t}>{INSTALL_LABELS[t]}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Last Calibration Date</Label>
          <Input type="date" value={form.calibrationDate} onChange={e => setForm((f: any) => ({ ...f, calibrationDate: e.target.value }))} />
          <p className="text-xs text-muted-foreground mt-1">Date shown on the calibration certificate issued by your calibrating body.</p>
        </div>
        <div>
          <Label>Calibration Due Date</Label>
          <Input type="date" value={form.calibrationDueDate} onChange={e => setForm((f: any) => ({ ...f, calibrationDueDate: e.target.value }))} />
          <p className="text-xs text-muted-foreground mt-1">Next renewal date from the certificate — typically 12 months after last calibration.</p>
        </div>
      </div>

      <div>
        <Label>API Device ID <span style={{ fontSize: "0.73rem", color: "#9ca3af", fontWeight: 400 }}>(for future cloud integration)</span></Label>
        <Input placeholder="e.g. station ID from device provider" value={form.apiDeviceId} onChange={e => setForm((f: any) => ({ ...f, apiDeviceId: e.target.value }))} />
      </div>
      <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
    </div>
  );

  return (
    <div>
      {attnItems.length > 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertTriangle size={16} style={{ color: "#d97706", flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: "0.875rem" }}>
            <strong style={{ color: "#92400e" }}>Calibration attention needed</strong>
            <ul style={{ margin: "4px 0 0 0", paddingLeft: 16, color: "#78350f" }}>
              {attnItems.map((r: any) => {
                const s = calibrationStatus(r);
                return <li key={r.id}><strong>{r.name}</strong>{r.serialNumber ? ` (${r.serialNumber})` : ""} — <span style={{ color: s.color }}>{s.label}</span>{r.calibrationDueDate ? ` · due ${fmt(r.calibrationDueDate)}` : ""}</li>;
              })}
            </ul>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
        <p className="text-sm text-muted-foreground">Register vehicle-mounted and portable weather devices. Serial numbers and calibration dates are stored here and linked to readings automatically.</p>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {records.length > 0 && <Button size="sm" variant="outline" onClick={() => window.print()}><Printer size={14} className="mr-1" />Print Register</Button>}
          <Button size="sm" onClick={() => { setForm(EMPTY_DEV_FORM); setMfgSel(""); setMdlSel(""); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Device</Button>
        </div>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading…</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Cpu size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No devices registered</p>
          <p style={{ fontSize: "0.875rem" }}>Add vehicle-mounted weather devices (Davis WeatherLink, Pessl iMETOS, etc.) to link readings to specific calibrated instruments.</p>
        </div>
      ) : (
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead><tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              {["Device Name","Make / Model","Serial No.","Install Type","Last Calibrated","Due Date","Status",""].map(h => <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, fontSize: "0.75rem", color: "#374151", whiteSpace: "nowrap" }}>{h}</th>)}
            </tr></thead>
            <tbody>{records.map((r: any, i: number) => {
              const s = calibrationStatus(r);
              return (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none", cursor: "pointer" }} onClick={() => setViewRecord(r)}>
                  <td style={{ padding: "0.5rem 0.75rem", fontWeight: 500 }}>{r.name}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{[r.manufacturer, r.model].filter(Boolean).join(" ") || "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", fontFamily: "monospace", fontSize: "0.8rem", color: "#374151" }}>{r.serialNumber || "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{INSTALL_LABELS[r.installationType] || r.installationType || "—"}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{fmt(r.calibrationDate)}</td>
                  <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{fmt(r.calibrationDueDate)}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}><span style={{ background: s.bg, color: s.color, padding: "2px 8px", borderRadius: 12, fontSize: "0.73rem", fontWeight: 600, whiteSpace: "nowrap" }}>{s.label}</span></td>
                  <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => setViewRecord(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px 4px" }} title="View"><Eye size={14} /></button>
                    <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "2px 4px" }} title="Edit"><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: "2px 4px" }} title="Remove"><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}

      {/* View dialog */}
      <Dialog open={!!viewRecord} onOpenChange={o => { if (!o) setViewRecord(null); }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>Device Details</DialogTitle></DialogHeader>
          {viewRecord && (() => {
            const s = calibrationStatus(viewRecord);
            return (
              <div className="space-y-3 py-2">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Device Name</Label><p className="text-sm font-medium">{viewRecord.name}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Installation Type</Label><p className="text-sm">{INSTALL_LABELS[viewRecord.installationType] || viewRecord.installationType}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Manufacturer</Label><p className="text-sm">{viewRecord.manufacturer || "—"}</p></div>
                  <div><Label className="text-xs text-muted-foreground">Model</Label><p className="text-sm">{viewRecord.model || "—"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Serial Number</Label><p className="text-sm font-mono">{viewRecord.serialNumber || "—"}</p></div>
                  <div><Label className="text-xs text-muted-foreground">API Device ID</Label><p className="text-sm font-mono text-muted-foreground">{viewRecord.apiDeviceId || "—"}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs text-muted-foreground">Last Calibrated</Label><p className="text-sm">{fmt(viewRecord.calibrationDate)}</p></div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Calibration Due</Label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <p className="text-sm">{fmt(viewRecord.calibrationDueDate)}</p>
                      {viewRecord.calibrationDueDate && <span style={{ background: s.bg, color: s.color, padding: "1px 7px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 600 }}>{s.label}</span>}
                    </div>
                  </div>
                </div>
                {viewRecord.notes && <div><Label className="text-xs text-muted-foreground">Notes</Label><p className="text-sm">{viewRecord.notes}</p></div>}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
            <Button variant="outline" onClick={() => openEdit(viewRecord)}><Pencil size={14} className="mr-1" />Edit</Button>
            <Button variant="destructive" size="sm" onClick={() => { setDeleteId(viewRecord?.id); setViewRecord(null); }}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) { setForm(EMPTY_DEV_FORM); setMfgSel(""); setMdlSel(""); createMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>Add Weather Device</DialogTitle></DialogHeader>
          <DeviceFormFields />
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(formPayload())} disabled={!form.name || createMut.isPending}>Add Device</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editRecord} onOpenChange={o => { if (!o) { setEditRecord(null); setForm(EMPTY_DEV_FORM); setMfgSel(""); setMdlSel(""); updateMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>Edit Device</DialogTitle></DialogHeader>
          <DeviceFormFields />
          <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditRecord(null); setForm(EMPTY_DEV_FORM); }}>Cancel</Button>
            <Button onClick={() => updateMut.mutate({ id: editRecord.id, body: formPayload() })} disabled={!form.name || updateMut.isPending}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Remove Device</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">This will remove the device from your register. Existing readings linked to this device will retain their data.</p>
          <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Connected Stations Tab ────────────────────────────────────────────────────

interface SensorReading {
  id: number;
  provider: string;
  stationId: string;
  stationName: string | null;
  sensorCategory: string;
  parameter: string;
  value: string | null;
  unit: string | null;
  depthCm: number | null;
  recordedAt: string;
}

const WEATHER_PARAM_META: Record<string, { label: string; color: string }> = {
  air_temperature:   { label: "Temperature",    color: "#f97316" },
  temp_indoor:       { label: "Indoor Temp",    color: "#fb923c" },
  humidity:          { label: "Humidity",       color: "#3b82f6" },
  rainfall:          { label: "Rainfall",       color: "#06b6d4" },
  rain_rate:         { label: "Rain Rate",      color: "#0284c7" },
  wind_speed:        { label: "Wind Speed",     color: "#8b5cf6" },
  wind_direction:    { label: "Wind Dir",       color: "#6b7280" },
  pressure:          { label: "Pressure",       color: "#10b981" },
  solar_radiation:   { label: "Solar Rad.",     color: "#eab308" },
  uv_index:          { label: "UV Index",       color: "#f59e0b" },
  dew_point:         { label: "Dew Point",      color: "#14b8a6" },
  wet_bulb_temp:     { label: "Wet Bulb",       color: "#06b6d4" },
  temperature:       { label: "Temperature",    color: "#f97316" },
  relative_humidity: { label: "Humidity",       color: "#3b82f6" },
  precipitation:     { label: "Precipitation",  color: "#06b6d4" },
  wind_gust:         { label: "Wind Gust",      color: "#7c3aed" },
  leaf_wetness:      { label: "Leaf Wetness",   color: "#22c55e" },
};

const SUMMARY_PARAMS = [
  "air_temperature", "temperature", "humidity", "relative_humidity",
  "rainfall", "precipitation", "wind_speed", "pressure", "solar_radiation",
];

function ConnectedStationsTab({ farmId }: { farmId: number }) {
  const [days, setDays] = useState<"7" | "14" | "30">("7");
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [selectedParam, setSelectedParam] = usePersistedFilter({ page: "weather-connected-stations", filter: "param", farmId, defaultValue: "" });

  const from = new Date(Date.now() - Number(days) * 86400000).toISOString();

  const { data, isLoading } = useQuery<{ readings: SensorReading[] }>({
    queryKey: ["sensor-readings-weather", farmId, days],
    queryFn: async () => {
      const res = await fetch(
        `/api/farms/${farmId}/sensor-readings?category=weather&from=${encodeURIComponent(from)}&limit=2000`
      );
      if (!res.ok) throw new Error("Failed to load station data");
      return res.json();
    },
  });

  const readings = data?.readings ?? [];

  const stationMap = new Map<string, { name: string; readings: SensorReading[] }>();
  for (const r of readings) {
    if (!stationMap.has(r.stationId))
      stationMap.set(r.stationId, { name: r.stationName ?? r.stationId, readings: [] });
    stationMap.get(r.stationId)!.readings.push(r);
  }
  const stations = Array.from(stationMap.entries());

  useEffect(() => {
    if (stations.length > 0 && !selectedStation) setSelectedStation(stations[0][0]);
  }, [stations.length]);

  const stationData = selectedStation ? stationMap.get(selectedStation) : null;
  const availableParams = Array.from(new Set(stationData?.readings.map(r => r.parameter) ?? []));

  useEffect(() => {
    if (availableParams.length > 0 && !selectedParam) {
      const pref =
        availableParams.find(p => p === "air_temperature") ??
        availableParams.find(p => p === "temperature") ??
        availableParams[0];
      setSelectedParam(pref);
    }
  }, [availableParams.join(",")]);

  const latestByParam = new Map<string, SensorReading>();
  for (const r of [...(stationData?.readings ?? [])].sort(
    (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  )) {
    if (!latestByParam.has(r.parameter)) latestByParam.set(r.parameter, r);
  }

  const chartData = (stationData?.readings ?? [])
    .filter(r => r.parameter === selectedParam)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map(r => ({
      t: new Date(r.recordedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      v: r.value != null ? Number(r.value) : null,
    }));

  if (isLoading) return (
    <div className="flex items-center gap-2 text-gray-400 py-16 justify-center">
      <Loader2 className="w-5 h-5 animate-spin" /> Loading station data…
    </div>
  );

  if (stations.length === 0) return (
    <div className="text-center py-16">
      <Cpu className="w-10 h-10 mx-auto mb-3 text-gray-300" />
      <p className="font-medium text-gray-600 mb-1">No connected weather stations</p>
      <p className="text-sm text-gray-400 max-w-sm mx-auto">
        Connect a Davis WeatherLink, Sencrop, or FieldClimate station in{" "}
        <strong>Farm Settings → Sensor Integrations</strong> to see live data here.
      </p>
    </div>
  );

  const summaryParams = SUMMARY_PARAMS.filter(p => latestByParam.has(p));

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {stations.length > 1 && (
          <select
            value={selectedStation ?? ""}
            onChange={e => { setSelectedStation(e.target.value); setSelectedParam(""); }}
            className="text-sm border border-gray-200 rounded px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400">
            {stations.map(([id, s]) => <option key={id} value={id}>{s.name}</option>)}
          </select>
        )}
        {stations.length === 1 && (
          <span className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <Cpu size={14} className="text-green-600" />{stations[0][1].name}
          </span>
        )}
        <select value={days} onChange={e => setDays(e.target.value as "7" | "14" | "30")}
          className="text-sm border border-gray-200 rounded px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400">
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">
          {stationData?.readings.length ?? 0} readings synced
        </span>
      </div>

      {/* Summary cards — click a card to chart that parameter */}
      {summaryParams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {summaryParams.map(param => {
            const r = latestByParam.get(param)!;
            const meta = WEATHER_PARAM_META[param];
            const isSelected = selectedParam === param;
            return (
              <button key={param} onClick={() => setSelectedParam(param)}
                className={`rounded-lg border p-3 text-left transition-all w-full ${
                  isSelected
                    ? "border-green-500 bg-green-50 ring-1 ring-green-400"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}>
                <div className="text-xs text-gray-500 mb-1 truncate">{meta?.label ?? param}</div>
                <div className="text-xl font-semibold text-gray-800">
                  {Number(r.value).toFixed(1)}
                  <span className="text-xs font-normal text-gray-500 ml-0.5">{r.unit}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {new Date(r.recordedAt).toLocaleString("en-GB", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-sm font-medium text-gray-700">
            {WEATHER_PARAM_META[selectedParam]?.label ?? selectedParam}
          </span>
          <select value={selectedParam} onChange={e => setSelectedParam(e.target.value)}
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-green-400 ml-auto">
            {availableParams.map(p => (
              <option key={p} value={p}>{WEATHER_PARAM_META[p]?.label ?? p}</option>
            ))}
          </select>
        </div>
        {chartData.length === 0 ? (
          <div className="text-center text-gray-400 py-12 text-sm">
            No data for selected parameter and date range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10 }} width={52} />
              <Tooltip
                formatter={(v: number) => [
                  `${v} ${latestByParam.get(selectedParam)?.unit ?? ""}`,
                  WEATHER_PARAM_META[selectedParam]?.label ?? selectedParam,
                ]}
              />
              <Line
                type="monotone" dataKey="v"
                stroke={WEATHER_PARAM_META[selectedParam]?.color ?? "#10b981"}
                dot={false} strokeWidth={2} connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WeatherPageFull() {
  const { farmId } = useAppStore();
  const [tab, setTab] = usePersistedTab<Tab>({ page: "weather", farmId, validIds: WEATHER_TAB_IDS, defaultTab: "readings" });

  return (
    <AppLayout title="Weather Records">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Log on-farm weather conditions to support spray application records and demonstrate compliance with spraying regulations.
        </p>
        <TabBar className="mb-6">
          <TabButton active={tab === "readings"} onClick={() => setTab("readings")}><Cloud size={14} className="mr-1" />Readings</TabButton>
          <TabButton active={tab === "chart"} onClick={() => setTab("chart")}><TrendingUp size={14} className="mr-1" />Chart</TabButton>
          <TabButton active={tab === "vehicle"} onClick={() => setTab("vehicle")}><Truck size={14} className="mr-1" />Vehicle Stations</TabButton>
          <TabButton active={tab === "devices"} onClick={() => setTab("devices")}><Cpu size={14} className="mr-1" />Device Register</TabButton>
          <TabButton active={tab === "stations"} onClick={() => setTab("stations")}><Cpu size={14} className="mr-1" />Connected Stations</TabButton>
        </TabBar>
        {farmId && tab === "readings" && <ReadingsTab farmId={farmId} />}
        {farmId && tab === "chart" && <ChartTab farmId={farmId} />}
        {farmId && tab === "vehicle" && <VehicleReadingsTab farmId={farmId} />}
        {farmId && tab === "devices" && <DevicesTab farmId={farmId} />}
        {farmId && tab === "stations" && <ConnectedStationsTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
