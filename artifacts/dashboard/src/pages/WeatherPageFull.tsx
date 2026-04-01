import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Plus, Trash2, Cloud, TrendingUp, Truck } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Tab = "readings" | "chart" | "vehicle";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtTime = (d: string | null | undefined) => {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

function ReadingsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({
    readingTimestamp: "",
    temperatureC: "",
    humidityPercent: "",
    windSpeedKmh: "",
    windDirection: "",
    rainfallMm: "",
    pressureHpa: "",
    linkedSprayApplicationId: "",
    notes: "",
  });

  const sprayAppsQ = useQuery({
    queryKey: ["spray-applications", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? d ?? [],
  });

  const q = useQuery({
    queryKey: ["weather-readings", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/weather-readings`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["weather-readings", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/weather-readings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
    onSuccess: () => { toast({ title: "Reading saved" }); invalidate(); setAddOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/weather-readings/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const sprayApps: any[] = sprayAppsQ.data ?? [];
  const resetForm = () => setForm({ readingTimestamp: "", temperatureC: "", humidityPercent: "", windSpeedKmh: "", windDirection: "", rainfallMm: "", pressureHpa: "", linkedSprayApplicationId: "", notes: "" });
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

      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) resetForm(); }}>
        <DialogContent style={{ maxWidth: 480 }}>
          <DialogHeader><DialogTitle>Add Weather Reading</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
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
                  <SelectContent>
                    {["N", "NE", "E", "SE", "S", "SW", "W", "NW", "Variable", "Calm"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate({ ...form, linkedSprayApplicationId: form.linkedSprayApplicationId ? parseInt(form.linkedSprayApplicationId) : null })} disabled={!form.readingTimestamp || createMut.isPending}>Save Reading</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Reading</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this weather reading?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChartTab({ farmId }: { farmId: number }) {
  const [metric, setMetric] = useState<"temperature" | "rainfall" | "humidity" | "wind">("temperature");
  const [days, setDays] = useState(30);

  const q = useQuery({
    queryKey: ["weather-readings", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/weather-readings`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

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
            <button
              key={m}
              onClick={() => setMetric(m)}
              style={{
                padding: "4px 12px",
                borderRadius: 6,
                border: "1px solid",
                borderColor: metric === m ? metricConfig[m].color : "#e5e7eb",
                background: metric === m ? metricConfig[m].color : "#fff",
                color: metric === m ? "#fff" : "#374151",
                fontSize: "0.8rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {metricConfig[m].label.split(" ")[0]}
            </button>
          ))}
        </div>
        <Select value={String(days)} onValueChange={v => setDays(parseInt(v))}>
          <SelectTrigger style={{ width: 120 }}><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {q.isLoading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
      ) : chartData.length === 0 ? (
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
              <Tooltip
                contentStyle={{ fontSize: "0.8rem", borderRadius: 8, border: "1px solid #e5e7eb" }}
                formatter={(v: any) => [`${v}${cfg.unit}`, cfg.label]}
              />
              <Line
                type="monotone"
                dataKey={cfg.key}
                stroke={cfg.color}
                strokeWidth={2}
                dot={{ r: 3, fill: cfg.color }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function VehicleReadingsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ vehicleName: "", vehicleRegistration: "", readingTimestamp: "", temperatureC: "", humidityPercent: "", windSpeedKmh: "", windDirection: "", rainfallMm: "", notes: "" });

  const sprayAppsQ = useQuery({ queryKey: ["spray-applications", farmId], queryFn: () => fetch(`/api/farms/${farmId}/spray-applications`).then(r => r.json()), enabled: !!farmId, select: (d) => d.records ?? d ?? [] });
  const sprayApps: any[] = sprayAppsQ.data ?? [];

  const q = useQuery({ queryKey: ["vehicle-weather", farmId], queryFn: () => fetch(`/api/farms/${farmId}/vehicle-weather-readings`).then(r => r.json()), enabled: !!farmId });
  const records: any[] = q.data?.records ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ["vehicle-weather", farmId] });
  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/vehicle-weather-readings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, linkedSprayApplicationId: body.linkedSprayApplicationId ? parseInt(body.linkedSprayApplicationId) : null }) }),
    onSuccess: () => { toast({ title: "Reading saved" }); invalidate(); setAddOpen(false); setForm({ vehicleName: "", vehicleRegistration: "", readingTimestamp: "", temperatureC: "", humidityPercent: "", windSpeedKmh: "", windDirection: "", rainfallMm: "", notes: "" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/vehicle-weather-readings/${id}`, { method: "DELETE" }), onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); } });

  const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <p className="text-sm text-muted-foreground">Log weather conditions captured by vehicle-mounted stations (e.g. Davis WeatherLink, Pessl iMETOS) at the point of spraying. Provides field-level evidence for spray records and Red Tractor compliance.</p>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus size={14} className="mr-1" />Add Vehicle Reading</Button>
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
              {["Date/Time", "Vehicle", "Reg", "Temp (°C)", "RH (%)", "Wind (km/h)", "Dir", "Rain (mm)", "Linked Spray", ""].map(h => <th key={h} style={{ padding: "0.5rem 0.75rem", textAlign: "left", fontWeight: 600, fontSize: "0.75rem", color: "#374151", whiteSpace: "nowrap" }}>{h}</th>)}
            </tr></thead>
            <tbody>{records.map((r: any, i: number) => (
              <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                <td style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap", color: "#6b7280", fontSize: "0.8rem" }}>{fmt(r.readingTimestamp)}</td>
                <td style={{ padding: "0.5rem 0.75rem", fontWeight: 500 }}>{r.vehicleName || "—"}</td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280", fontFamily: "monospace", fontSize: "0.8rem" }}>{r.vehicleRegistration || "—"}</td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.temperatureC ?? "—"}</td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.humidityPercent ? `${r.humidityPercent}%` : "—"}</td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.windSpeedKmh ?? "—"}</td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.windDirection || "—"}</td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280" }}>{r.rainfallMm ?? "—"}</td>
                <td style={{ padding: "0.5rem 0.75rem", color: "#6b7280", fontSize: "0.8rem" }}>{r.linkedSprayApplicationId ? `#${r.linkedSprayApplicationId}` : "—"}</td>
                <td style={{ padding: "0.5rem" }}><button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={13} /></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) setAddOpen(false); }}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader><DialogTitle>Vehicle Weather Reading</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vehicle Name</Label><Input placeholder="e.g. John Deere 6120R" value={form.vehicleName} onChange={e => setForm((f: any) => ({ ...f, vehicleName: e.target.value }))} /></div>
              <div><Label>Registration</Label><Input placeholder="e.g. AB12 CDE" value={form.vehicleRegistration} onChange={e => setForm((f: any) => ({ ...f, vehicleRegistration: e.target.value }))} /></div>
            </div>
            <div><Label>Date & Time *</Label><Input type="datetime-local" value={form.readingTimestamp} onChange={e => setForm((f: any) => ({ ...f, readingTimestamp: e.target.value }))} /></div>
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
            <div><Label>Rainfall (mm)</Label><Input type="number" step="0.1" min="0" value={form.rainfallMm} onChange={e => setForm((f: any) => ({ ...f, rainfallMm: e.target.value }))} /></div>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.readingTimestamp || createMut.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Reading</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function WeatherPageFull() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("readings");

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
        </TabBar>
        {farmId && tab === "readings" && <ReadingsTab farmId={farmId} />}
        {farmId && tab === "chart" && <ChartTab farmId={farmId} />}
        {farmId && tab === "vehicle" && <VehicleReadingsTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
