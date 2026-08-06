// @ts-nocheck
import { useState, useRef, useMemo, type ReactNode } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { sanitiseCsvCell } from "@/lib/csv";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocAttach } from "@/components/DocAttach";
import { openPrintWindow } from "@/lib/print-report";
import { Plus, Pencil, Trash2, Loader2, Home, Bird, BarChart3, Pill, SprayCan, Thermometer, FileText, ShieldCheck, Scissors, ClipboardList, ClipboardCheck, Star, Truck, UtensilsCrossed, FileDown, AlertTriangle, TrendingUp, LayoutDashboard, CheckCircle2, XCircle, Circle, Eye, Receipt, HardHat, Users, Package, X as XIcon, QrCode, Printer, ChevronDown, ChevronUp, Syringe, Activity, ArrowRightLeft, ShieldAlert, MapPin, Clock, Save } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { useToast } from "@/hooks/use-toast";
import { StaffSelect } from "@/components/ui/staff-select";
import { ConfirmDialog as SharedConfirmDialog } from "@/components/ui/confirm-dialog";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, exportCSV, StatCard, Empty, ConfirmDialog, DataTable, useCrud, HOUSE_TYPES, POULTRY_SPECIES, PRODUCTION_SYSTEMS, SPECIES_LABEL_MAP, SYSTEM_LABEL_MAP, fmtSpecies, fmtSystem, getStockingDensityInfo, useFlocks, FlockSelect, fmtFlock } from "./shared";
import type { DensityInfo } from "./shared";

export function EnvironmentalLogsTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const flocks = useFlocks(farmId);
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "poultry-environmental-logs", "poultry-env-logs");
  const envList = (records ?? []) as Record<string, unknown>[];
  const [flockFilterEnv, setFlockFilterEnv] = useState("all");
  const [yearFilterEnv, setYearFilterEnv] = useState("all");
  const [dateFromEnv, setDateFromEnv] = useState("");
  const [dateToEnv, setDateToEnv] = useState("");
  const envYears = useMemo(() => Array.from(new Set(envList.map(r => String(r.logDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [envList]);
  const filteredEnvList = envList.filter(r =>
    (flockFilterEnv === "all" || String(r.flockId) === flockFilterEnv) &&
    (yearFilterEnv === "all" || String(r.logDate ?? "").startsWith(yearFilterEnv)) &&
    (!dateFromEnv || String(r.logDate ?? "") >= dateFromEnv) &&
    (!dateToEnv || String(r.logDate ?? "") <= dateToEnv)
  );
  const withTemp = filteredEnvList.filter(r => r.temperatureMin != null && r.temperatureMax != null);
  const avgMinTemp = withTemp.length ? (withTemp.reduce((s, r) => s + Number(r.temperatureMin), 0) / withTemp.length).toFixed(1) : null;
  const avgMaxTemp = withTemp.length ? (withTemp.reduce((s, r) => s + Number(r.temperatureMax), 0) / withTemp.length).toFixed(1) : null;
  const withAmm = filteredEnvList.filter(r => r.ammoniaPpm != null);
  const maxAmm = withAmm.length ? Math.max(...withAmm.map(r => Number(r.ammoniaPpm))) : null;
  const avgHum = filteredEnvList.filter(r => r.humidity != null).length ? (filteredEnvList.filter(r => r.humidity != null).reduce((s, r) => s + Number(r.humidity), 0) / filteredEnvList.filter(r => r.humidity != null).length).toFixed(1) : null;
  const alarmCount = filteredEnvList.filter(r => r.alarmActivated).length;
  const ammAlert = maxAmm !== null && maxAmm > 10;
  const ammWarn = maxAmm !== null && maxAmm >= 7 && maxAmm <= 10;
  const envCsvCols = [
    { key: "logDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.logDate) }, { key: "logTime", label: "Time" },
    { key: "flockNumber", label: "Flock" }, { key: "houseName", label: "House" },
    { key: "temperatureMin", label: "Min Temp °C" }, { key: "temperatureMax", label: "Max Temp °C" },
    { key: "humidity", label: "Humidity %" }, { key: "co2Ppm", label: "CO2 ppm" },
    { key: "ammoniaPpm", label: "Ammonia ppm" }, { key: "stockingDensity", label: "Stocking Density kg/m²" },
    { key: "lightingHours", label: "Lighting Hours" },
    { key: "alarmActivated", label: "Alarm", fmt: (r: Record<string, unknown>) => r.alarmActivated ? "Yes" : "No" },
    { key: "alarmDetails", label: "Alarm Details" },
  ];
  function printEnvLogs() {
    const fmtD = (d: unknown) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const trs = filteredEnvList.map(r => `<tr><td>${fmtD(r.logDate)}${r.logTime ? ` ${r.logTime}` : ""}</td><td>${String(r.flockNumber ?? r.flockId ?? "—")}</td><td>${String(r.houseName ?? "—")}</td><td>${r.temperatureMin != null ? `${r.temperatureMin}°C` : "—"}</td><td>${r.temperatureMax != null ? `${r.temperatureMax}°C` : "—"}</td><td>${r.humidity != null ? `${r.humidity}%` : "—"}</td><td>${r.ammoniaPpm != null ? `${r.ammoniaPpm} ppm` : "—"}</td><td>${r.alarmActivated ? "Yes" : "No"}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Environmental Logs</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>Environmental Monitoring Logs</h1><h2>${filteredEnvList.length} record${filteredEnvList.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date/Time</th><th>Flock</th><th>House</th><th>Min Temp</th><th>Max Temp</th><th>Humidity</th><th>Ammonia</th><th>Alarm</th></tr></thead><tbody>${trs}</tbody></table></body></html>`;
    openPrintWindow(html);
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-semibold text-sm">Environmental Monitoring Logs</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredEnvList, "environmental-logs.csv", envCsvCols)} disabled={!filteredEnvList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          {filteredEnvList.length > 0 && <Button size="sm" variant="outline" onClick={printEnvLogs}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => openAdd({ alarmActivated: false })}><Plus className="w-4 h-4 mr-1" />Log Reading</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={yearFilterEnv} onValueChange={setYearFilterEnv}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{envYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={flockFilterEnv} onValueChange={setFlockFilterEnv}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All flocks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All flocks</SelectItem>
            {flocks.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockNumber ?? f.id)}{f.houseName ? ` · ${f.houseName}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <label className="text-xs text-muted-foreground">From</label>
          <input type="date" value={dateFromEnv} onChange={e => setDateFromEnv(e.target.value)} className="h-8 rounded-md border border-input px-2 text-xs bg-background" />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-xs text-muted-foreground">To</label>
          <input type="date" value={dateToEnv} onChange={e => setDateToEnv(e.target.value)} className="h-8 rounded-md border border-input px-2 text-xs bg-background" />
        </div>
        {(flockFilterEnv !== "all" || yearFilterEnv !== "all" || dateFromEnv || dateToEnv) && (
          <button onClick={() => { setFlockFilterEnv("all"); setYearFilterEnv("all"); setDateFromEnv(""); setDateToEnv(""); }} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground border rounded-md">Clear</button>
        )}
      </div>
      {!isLoading && envList.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Environmental Summary{flockFilterEnv !== "all" || yearFilterEnv !== "all" || dateFromEnv || dateToEnv ? " — Filtered" : " — All Records"}</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Avg Min Temp" value={avgMinTemp !== null ? `${avgMinTemp} °C` : "—"} />
              <StatCard label="Avg Max Temp" value={avgMaxTemp !== null ? `${avgMaxTemp} °C` : "—"} />
              <StatCard label="Avg Humidity" value={avgHum !== null ? `${avgHum}%` : "—"} color={avgHum !== null && Number(avgHum) > 80 ? "amber" : undefined} sub={avgHum !== null && Number(avgHum) > 80 ? "above 80% threshold" : undefined} />
              <StatCard label="Max Ammonia" value={maxAmm !== null ? `${maxAmm} ppm` : "—"} color={ammAlert ? "red" : ammWarn ? "amber" : maxAmm !== null ? "green" : undefined} sub={ammAlert ? "above 10ppm — welfare concern" : ammWarn ? "approaching 10ppm limit" : undefined} />
            </div>
            {alarmCount > 0 && <p className="text-xs text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{alarmCount} alarm activation{alarmCount > 1 ? "s" : ""} recorded — check alarm details in the table below.</p>}
          </div>
          {ammAlert && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-800"><strong>Ammonia Alert:</strong> Peak reading of {maxAmm} ppm exceeds the 10 ppm welfare threshold. Review ventilation management and check litter condition. Red Tractor and RSPCA Assured require corrective action to be documented.</p>
            </div>
          )}
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "logDate", label: "Date", fmt: r => fmtDate(r.logDate) },
        { key: "flockNumber", label: "Flock", fmt: fmtFlock },
        { key: "temperatureMin", label: "Min °C" },
        { key: "temperatureMax", label: "Max °C" },
        { key: "humidity", label: "Humidity %" },
        { key: "ammoniaPpm", label: "Ammonia ppm" },
        { key: "stockingDensity", label: "kg/m²" },
      { key: "_attach", label: "", render: r => r.id ? <RecordAttachments recordType="poultry-environmental-logs" recordId={r.id as number} farmId={farmId} compact /> : null },
      ]} rows={filteredEnvList} onDelete={r => del.mutate(r.id as number)} deleteMutation={del} onView={setViewRecord} />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Environmental Log — {fmtDate(viewRecord.logDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{fmtDate(viewRecord.logDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p><p className="font-medium">{String(viewRecord.logTime ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock</p><p className="font-medium">{fmtFlock(viewRecord)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Min Temperature (°C)</p><p className="font-medium">{viewRecord.temperatureMin != null ? `${viewRecord.temperatureMin} °C` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Max Temperature (°C)</p><p className="font-medium">{viewRecord.temperatureMax != null ? `${viewRecord.temperatureMax} °C` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Humidity (%)</p><p className="font-medium">{viewRecord.humidity != null ? `${viewRecord.humidity}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">CO₂ (ppm)</p><p className="font-medium">{viewRecord.co2Ppm != null ? String(viewRecord.co2Ppm) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ammonia (ppm)</p><p className="font-medium">{viewRecord.ammoniaPpm != null ? String(viewRecord.ammoniaPpm) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Stocking Density (kg/m²)</p><p className="font-medium">{viewRecord.stockingDensity != null ? String(viewRecord.stockingDensity) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lighting Hours</p><p className="font-medium">{viewRecord.lightingHours != null ? String(viewRecord.lightingHours) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Alarm Activated</p><p className="font-medium">{viewRecord.alarmActivated ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Alarm Details</p><p className="font-medium">{String(viewRecord.alarmDetails ?? "—")}</p></div>
            </div>
            {viewRecord.id && <div className="border-t pt-3"><RecordAttachments farmId={farmId} recordType="poultry-environmental-logs" recordId={viewRecord.id as number} /></div>}
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Environmental Log</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Date *</Label><Input type="date" value={String(form.logDate ?? "")} onChange={e => setForm(f => ({ ...f, logDate: e.target.value }))} /></div>
            <div><Label>Time</Label><Input type="time" value={String(form.logTime ?? "")} onChange={e => setForm(f => ({ ...f, logTime: e.target.value }))} /></div>
            <div><Label>Flock *</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            <div><Label>Min Temp (°C)</Label><Input type="number" step="0.1" value={String(form.temperatureMin ?? "")} onChange={e => setForm(f => ({ ...f, temperatureMin: e.target.value }))} /></div>
            <div><Label>Max Temp (°C)</Label><Input type="number" step="0.1" value={String(form.temperatureMax ?? "")} onChange={e => setForm(f => ({ ...f, temperatureMax: e.target.value }))} /></div>
            <div><Label>Humidity (%)</Label><Input type="number" step="0.1" value={String(form.humidity ?? "")} onChange={e => setForm(f => ({ ...f, humidity: e.target.value }))} /></div>
            <div><Label>CO₂ (ppm)</Label><Input type="number" value={String(form.co2Ppm ?? "")} onChange={e => setForm(f => ({ ...f, co2Ppm: e.target.value }))} /></div>
            <div><Label>Ammonia (ppm)</Label><Input type="number" step="0.1" value={String(form.ammoniaPpm ?? "")} onChange={e => setForm(f => ({ ...f, ammoniaPpm: e.target.value }))} /></div>
            <div><Label>Stocking Density (kg/m²)</Label><Input type="number" step="0.01" value={String(form.stockingDensity ?? "")} onChange={e => setForm(f => ({ ...f, stockingDensity: e.target.value }))} /></div>
            <div><Label>Lighting (hours)</Label><Input type="number" step="0.5" value={String(form.lightingHours ?? "")} onChange={e => setForm(f => ({ ...f, lightingHours: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-5 col-span-3"><Checkbox id="alarm" checked={Boolean(form.alarmActivated)} onCheckedChange={v => setForm(f => ({ ...f, alarmActivated: Boolean(v) }))} /><Label htmlFor="alarm">Alarm activated?</Label></div>
            <div className="col-span-3"><Label>Alarm Details</Label><Input value={String(form.alarmDetails ?? "")} onChange={e => setForm(f => ({ ...f, alarmDetails: e.target.value }))} /></div>
            {form.alarmActivated && (
              <div className="col-span-3 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                <p className="font-semibold">Environmental alarm — investigate cause and record corrective action.</p>
                <p className="mt-0.5">Persistent alarms for temperature, humidity, CO₂, or ammonia must be investigated and resolved promptly. Raise a follow-up task if the cause has not been remedied. Retain this record for Red Tractor welfare audit.</p>
              </div>
            )}
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

