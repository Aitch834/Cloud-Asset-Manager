import React, { useState, useRef, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Pencil, Trash2, ChevronDown, ChevronUp, Activity,
  Upload, Loader2, MapPin, Calendar, Cpu, AlertCircle,
  CheckCircle, XCircle, BarChart2, TableIcon, FileUp, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/hooks/use-app-store";
import { toast } from "@/hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FieldRecord { id: number; name: string; fieldReference: string | null; }
interface SoilSensorProbe {
  id: number; farmId: number; fieldId: number | null;
  name: string; manufacturer: string | null; model: string | null;
  sensorType: string; depthsCm: string | null;
  latitude: string | null; longitude: string | null;
  installDate: string | null; notes: string | null; isActive: boolean;
  createdAt: string;
}
interface SoilSensorReading {
  id: number; probeId: number; farmId: number;
  readingAt: string; depthCm: number | null;
  moisturePercent: string | null; temperatureCelsius: string | null;
  ecUsPerCm: string | null; entryMethod: string; notes: string | null;
}

const SENSOR_TYPES: Record<string, string> = {
  moisture:          "Moisture only",
  moisture_temp:     "Moisture + Temperature",
  moisture_temp_ec:  "Moisture + Temperature + EC",
  multi_depth:       "Multi-depth (moisture + temperature + EC)",
};

interface ProbeSpec { sensorType: string; typicalDepthsCm?: string; }

// Knowledge base of manufacturers → models → known capabilities.
// sensorType keys map to SENSOR_TYPES above.
// typicalDepthsCm is suggested when the depths field is empty.
const PROBE_CATALOGUE: Record<string, Record<string, ProbeSpec>> = {
  "METER Group": {
    "TEROS 10":          { sensorType: "moisture" },
    "TEROS 11":          { sensorType: "moisture_temp_ec" },
    "TEROS 12":          { sensorType: "moisture_temp_ec" },
    "TEROS 21":          { sensorType: "moisture_temp" },
    "TEROS 54":          { sensorType: "moisture_temp" },
    "GS3":               { sensorType: "moisture_temp_ec" },
    "5TM":               { sensorType: "moisture_temp" },
    "5TE":               { sensorType: "moisture_temp_ec" },
    "EC-5":              { sensorType: "moisture" },
    "Em50 / Em50G":      { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 60" },
  },
  "Sentek Technologies": {
    "Drill & Drop":      { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 50, 60" },
    "EnviroSCAN":        { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 60, 100" },
    "EasyAG 50":         { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 50" },
    "EasyAG 70":         { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 50, 60, 70" },
    "TriSCAN":           { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 60" },
  },
  "Delta-T Devices": {
    "SM150T":            { sensorType: "moisture_temp" },
    "SM300":             { sensorType: "moisture_temp_ec" },
    "Profile Probe PR2": { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 60, 100" },
    "GP2":               { sensorType: "moisture_temp_ec" },
    "WET-2":             { sensorType: "moisture_temp_ec" },
    "HH2 / PR2":         { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 60, 100" },
  },
  "Stevens Water": {
    "HydraProbe":        { sensorType: "moisture_temp_ec" },
    "HydraProbe 2":      { sensorType: "moisture_temp_ec" },
    "Pico":              { sensorType: "moisture_temp" },
    "Vitel":             { sensorType: "moisture_temp_ec" },
  },
  "Pessl Instruments (METOS)": {
    "SMT100":            { sensorType: "moisture_temp" },
    "iMETOS Soil":       { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 60" },
    "PHOS":              { sensorType: "moisture_temp_ec" },
  },
  "Vegetronix": {
    "VH400":             { sensorType: "moisture" },
    "VH400-WB":          { sensorType: "moisture_temp" },
    "THERM200":          { sensorType: "moisture_temp" },
    "Aqua-Spy":          { sensorType: "multi_depth", typicalDepthsCm: "10, 20, 30, 40, 60" },
  },
  "Campbell Scientific": {
    "CS616":             { sensorType: "moisture" },
    "CS650":             { sensorType: "moisture_temp" },
    "CS655":             { sensorType: "moisture_temp_ec" },
    "Hydrosense II":     { sensorType: "moisture" },
  },
  "Acclima": {
    "TDR-310S":          { sensorType: "moisture_temp_ec" },
    "TDR-315L":          { sensorType: "moisture_temp_ec" },
    "TDR-315H":          { sensorType: "moisture_temp_ec" },
  },
  "Other": {},
};

const MANUFACTURERS = Object.keys(PROBE_CATALOGUE);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmt(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}
function fmtDt(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return val; }
}
function parseNum(s: string | null | undefined): number | null {
  if (!s) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive" }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptySensors({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mb-4">
        <Activity className="w-7 h-7 text-green-600" />
      </div>
      <h3 className="text-base font-semibold text-gray-800 mb-1">No sensor probes registered</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-5">
        Register your first continuous soil monitoring probe to start recording moisture, temperature, and electrical conductivity readings.
      </p>
      <Button onClick={onAdd} size="sm" className="gap-1.5">
        <Plus className="w-4 h-4" /> Add First Probe
      </Button>
    </div>
  );
}

// ─── Probe form ───────────────────────────────────────────────────────────────
const EMPTY_PROBE = {
  name: "", manufacturer: "", model: "", sensorType: "moisture_temp_ec",
  depthsCm: "", fieldId: "", latitude: "", longitude: "", installDate: "", notes: "",
};
function ProbeDialog({
  open, onClose, probe, fields, farmId,
}: {
  open: boolean; onClose: () => void;
  probe?: SoilSensorProbe | null;
  fields: FieldRecord[]; farmId: number;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState(() => probe ? {
    name: probe.name, manufacturer: probe.manufacturer ?? "",
    model: probe.model ?? "", sensorType: probe.sensorType,
    depthsCm: probe.depthsCm ?? "", fieldId: probe.fieldId ? String(probe.fieldId) : "",
    latitude: probe.latitude ?? "", longitude: probe.longitude ?? "",
    installDate: probe.installDate ? probe.installDate.slice(0, 10) : "", notes: probe.notes ?? "",
  } : EMPTY_PROBE);
  const [sensorTypeAutoDetected, setSensorTypeAutoDetected] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  // Derived: known models for the selected manufacturer (null = use free-text input)
  const knownModels = form.manufacturer && form.manufacturer !== "Other"
    ? Object.keys(PROBE_CATALOGUE[form.manufacturer] ?? {})
    : null;

  function handleManufacturerChange(mfr: string) {
    setForm(f => ({ ...f, manufacturer: mfr === "__none__" ? "" : mfr, model: "" }));
    setSensorTypeAutoDetected(false);
  }

  function handleModelSelect(modelValue: string) {
    const model = modelValue === "__none__" ? "" : modelValue;
    const spec = form.manufacturer ? PROBE_CATALOGUE[form.manufacturer]?.[model] : undefined;
    setForm(f => ({
      ...f,
      model,
      sensorType: spec ? spec.sensorType : f.sensorType,
      // Suggest depths only when the field is currently empty
      depthsCm: spec?.typicalDepthsCm && !f.depthsCm ? spec.typicalDepthsCm : f.depthsCm,
    }));
    setSensorTypeAutoDetected(!!spec);
  }

  const save = useMutation({
    mutationFn: async () => {
      const url = probe
        ? `/api/farms/${farmId}/soil-sensors/${probe.id}`
        : `/api/farms/${farmId}/soil-sensors`;
      const res = await fetch(url, {
        method: probe ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, isActive: true }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["soil-sensors", farmId] });
      toast({ title: probe ? "Probe updated" : "Probe registered", description: form.name });
      onClose();
    },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{probe ? "Edit Sensor Probe" : "Register Sensor Probe"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Probe Name *</label>
            <Input value={form.name} onChange={set("name")} placeholder="e.g. North Field — TEROS 12" />
          </div>

          {/* Manufacturer */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Manufacturer</label>
            <Select value={form.manufacturer || "__none__"} onValueChange={handleManufacturerChange}>
              <SelectTrigger><SelectValue placeholder="Select manufacturer…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Not specified —</SelectItem>
                {MANUFACTURERS.filter(m => m !== "Other").map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
                <SelectItem value="Other">Other / not listed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Model — dropdown if manufacturer known, free-text if Other / unset */}
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Model</label>
            {knownModels && knownModels.length > 0 ? (
              <Select value={form.model || "__none__"} onValueChange={handleModelSelect}>
                <SelectTrigger><SelectValue placeholder="Select model…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select model —</SelectItem>
                  {knownModels.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={form.model}
                onChange={set("model")}
                placeholder={form.manufacturer ? "Enter model name" : "Select a manufacturer first"}
                disabled={!form.manufacturer}
              />
            )}
          </div>

          {/* Sensor Type — auto-detected from model, still overridable */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600">Sensor Type</label>
              {sensorTypeAutoDetected && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Auto-detected
                </span>
              )}
            </div>
            <Select
              value={form.sensorType}
              onValueChange={v => { setForm(f => ({ ...f, sensorType: v })); setSensorTypeAutoDetected(false); }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(SENSOR_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            {sensorTypeAutoDetected && (
              <p className="text-xs text-gray-400 mt-0.5">Detected from the selected model — you can override this if needed.</p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Monitoring Depths (cm)</label>
            <Input value={form.depthsCm} onChange={set("depthsCm")} placeholder="e.g. 10, 20, 30, 60" />
            <p className="text-xs text-gray-400 mt-0.5">Comma-separated depths at which this probe measures</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Field (optional)</label>
            <Select value={form.fieldId || "__none__"} onValueChange={v => setForm(f => ({ ...f, fieldId: v === "__none__" ? "" : v }))}>
              <SelectTrigger><SelectValue placeholder="— Farm-wide —" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Farm-wide —</SelectItem>
                {fields.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.name}{f.fieldReference ? ` (${f.fieldReference})` : ""}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Latitude</label>
              <Input value={form.latitude} onChange={set("latitude")} placeholder="e.g. 52.1234" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Longitude</label>
              <Input value={form.longitude} onChange={set("longitude")} placeholder="e.g. -1.5678" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Install Date</label>
            <Input type="date" value={form.installDate} onChange={set("installDate")} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
            <textarea
              value={form.notes} onChange={set("notes")} rows={2}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Location description, calibration notes…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={!form.name || save.isPending}>
            {save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {probe ? "Save Changes" : "Register Probe"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Reading dialog ───────────────────────────────────────────────────────
const EMPTY_READING = {
  readingAt: new Date().toISOString().slice(0, 16),
  depthCm: "", moisturePercent: "", temperatureCelsius: "", ecUsPerCm: "", notes: "",
};
function AddReadingDialog({ open, onClose, probe, farmId }: { open: boolean; onClose: () => void; probe: SoilSensorProbe; farmId: number; }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_READING);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const save = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/soil-sensors/${probe.id}/readings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["soil-readings", probe.id] });
      toast({ title: "Reading recorded" });
      setForm(EMPTY_READING);
      onClose();
    },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Manual Reading</DialogTitle>
          <p className="text-xs text-gray-500">{probe.name}</p>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Date & Time *</label>
            <Input type="datetime-local" value={form.readingAt} onChange={set("readingAt")} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Depth (cm)</label>
            <Input type="number" value={form.depthCm} onChange={set("depthCm")} placeholder="e.g. 20" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Moisture (%)</label>
              <Input type="number" step="0.01" value={form.moisturePercent} onChange={set("moisturePercent")} placeholder="0–100" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Temp (°C)</label>
              <Input type="number" step="0.1" value={form.temperatureCelsius} onChange={set("temperatureCelsius")} placeholder="e.g. 12" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">EC (μS/cm)</label>
              <Input type="number" step="0.1" value={form.ecUsPerCm} onChange={set("ecUsPerCm")} placeholder="e.g. 250" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
            <Input value={form.notes} onChange={set("notes")} placeholder="Optional observation…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={!form.readingAt || save.isPending}>
            {save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Record Reading
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── CSV import dialog ────────────────────────────────────────────────────────
function CsvImportDialog({ open, onClose, probe, farmId }: { open: boolean; onClose: () => void; probe: SoilSensorProbe; farmId: number; }) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Array<Record<string, string>>>([]);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const parseCSV = useCallback((text: string) => {
    setError(null);
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) { setError("CSV must have a header row and at least one data row."); return; }
    const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
    const required = ["readingat"];
    const missing = required.filter(r => !headers.includes(r));
    if (missing.length > 0) { setError(`Missing required column: ${missing.join(", ")}. Expected headers: readingat, depthcm, moisturepercent, temperaturecelsius, ecuspercm`); return; }
    const rows = lines.slice(1).map(line => {
      const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
    });
    setPreview(rows.slice(0, 5));
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => parseCSV(String(ev.target?.result ?? ""));
    reader.readAsText(f);
  };

  const doImport = async () => {
    if (!fileRef.current?.files?.[0]) return;
    setImporting(true);
    try {
      const text = await fileRef.current.files[0].text();
      const lines = text.trim().split(/\r?\n/);
      const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, "").toLowerCase());
      const rows = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
        const row = Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
        return {
          readingAt: row["readingat"] || row["datetime"] || row["timestamp"],
          depthCm: row["depthcm"] ? parseInt(row["depthcm"], 10) : undefined,
          moisturePercent: row["moisturepercent"] || row["moisture"] || undefined,
          temperatureCelsius: row["temperaturecelsius"] || row["temperature"] || row["temp"] || undefined,
          ecUsPerCm: row["ecuspercm"] || row["ec"] || undefined,
          notes: row["notes"] || undefined,
        };
      }).filter(r => r.readingAt);

      const res = await fetch(`/api/farms/${farmId}/soil-sensors/${probe.id}/readings/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Import failed");
      const data = await res.json();
      qc.invalidateQueries({ queryKey: ["soil-readings", probe.id] });
      toast({ title: "Import complete", description: `${data.inserted} readings imported` });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Readings from CSV</DialogTitle>
          <p className="text-xs text-gray-500">{probe.name}</p>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
            <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><Info className="w-3 h-3" /> Expected CSV format</p>
            <code className="text-xs text-blue-800 block font-mono leading-5">
              readingat,depthcm,moisturepercent,temperaturecelsius,ecuspercm,notes<br />
              2026-03-01 09:00,20,28.5,11.2,185,<br />
              2026-03-01 10:00,20,28.3,11.4,186,Dry spell
            </code>
            <p className="text-xs text-blue-600 mt-1.5">Only <strong>readingat</strong> is required. Column names are case-insensitive. Up to 5,000 rows per import.</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Choose CSV file</label>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onFile}
              className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-200 file:bg-gray-50 file:text-gray-700 file:text-sm cursor-pointer" />
          </div>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Preview (first {preview.length} rows)</p>
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="text-xs w-full">
                  <thead className="bg-gray-50">
                    <tr>{Object.keys(preview[0]).map(k => <th key={k} className="px-2 py-1 text-left text-gray-500 font-medium">{k}</th>)}</tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        {Object.values(row).map((v, j) => <td key={j} className="px-2 py-1 text-gray-700">{v || "—"}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={doImport} disabled={!preview.length || !!error || importing}>
            {importing && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            <Upload className="w-4 h-4 mr-1.5" /> Import Readings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Probe panel with chart + table ──────────────────────────────────────────
type PanelTab = "chart" | "table" | "import";
function ProbePanel({ probe, farmId, fields }: { probe: SoilSensorProbe; farmId: number; fields: FieldRecord[] }) {
  const [panelTab, setPanelTab] = useState<PanelTab>("chart");
  const [range, setRange] = useState<"30" | "90" | "180" | "365">("90");
  const [showAddReading, setShowAddReading] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<{ msg: string; fn: () => void } | null>(null);

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - parseInt(range, 10));

  const { data, isLoading } = useQuery<{ records: SoilSensorReading[] }>({
    queryKey: ["soil-readings", probe.id, range],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/soil-sensors/${probe.id}/readings?from=${fromDate.toISOString()}&limit=2000`);
      if (!res.ok) throw new Error("Failed to load readings");
      return res.json();
    },
  });

  const qc = useQueryClient();
  const deleteReading = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/farms/${farmId}/soil-sensors/${probe.id}/readings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["soil-readings", probe.id] }); },
  });

  const readings = data?.records ?? [];

  const chartData = readings.map(r => ({
    t: new Date(r.readingAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    fullDt: fmtDt(r.readingAt),
    moisture: parseNum(r.moisturePercent),
    temp: parseNum(r.temperatureCelsius),
    ec: parseNum(r.ecUsPerCm),
  }));

  const hasMoisture = readings.some(r => r.moisturePercent !== null);
  const hasTemp     = readings.some(r => r.temperatureCelsius !== null);
  const hasEC       = readings.some(r => r.ecUsPerCm !== null);

  return (
    <div className="bg-gray-50 border-t border-gray-100 px-4 pt-3 pb-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex gap-1">
          {(["chart", "table", "import"] as PanelTab[]).map(t => (
            <button key={t} onClick={() => setPanelTab(t)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${panelTab === t ? "bg-white border border-gray-200 text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "chart" ? <><BarChart2 className="w-3 h-3 inline mr-1" />Chart</> : t === "table" ? <><TableIcon className="w-3 h-3 inline mr-1" />Readings</> : <><FileUp className="w-3 h-3 inline mr-1" />Import CSV</>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {panelTab !== "import" && (
            <select value={range} onChange={e => setRange(e.target.value as typeof range)}
              className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-green-500">
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 6 months</option>
              <option value="365">Last year</option>
            </select>
          )}
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowAddReading(true)}>
            <Plus className="w-3 h-3" /> Add Reading
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowImport(true)}>
            <Upload className="w-3 h-3" /> Import
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading readings…
        </div>
      ) : readings.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center text-gray-400">
          <Activity className="w-8 h-8 mb-2 opacity-40" />
          <p className="text-sm">No readings in this period</p>
          <p className="text-xs mt-0.5">Add a manual reading or import from CSV</p>
        </div>
      ) : panelTab === "chart" ? (
        <div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
              <YAxis yAxisId="m" domain={[0, 60]} unit="%" tick={{ fontSize: 10 }} width={38} />
              {hasTemp && <YAxis yAxisId="t" orientation="right" unit="°C" tick={{ fontSize: 10 }} width={38} />}
              <Tooltip
                labelFormatter={(_label, payload) => payload?.[0]?.payload?.fullDt ?? ""}
                formatter={(val: unknown, name: string) => {
                  if (name === "Moisture") return [`${val}%`, name];
                  if (name === "Temperature") return [`${val}°C`, name];
                  if (name === "EC") return [`${val} μS/cm`, name];
                  return [String(val), name];
                }}
              />
              <Legend />
              {hasMoisture && <Line yAxisId="m" type="monotone" dataKey="moisture" name="Moisture" stroke="#16a34a" dot={false} strokeWidth={2} connectNulls />}
              {hasTemp     && <Line yAxisId="t" type="monotone" dataKey="temp"     name="Temperature" stroke="#ea580c" dot={false} strokeWidth={1.5} connectNulls />}
              {hasEC       && <Line yAxisId="m" type="monotone" dataKey="ec"       name="EC" stroke="#7c3aed" dot={false} strokeWidth={1.5} connectNulls strokeDasharray="4 2" />}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-1 text-xs text-gray-400 justify-end">
            {hasMoisture && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-600 inline-block" /> Moisture (%)</span>}
            {hasTemp     && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-500 inline-block" /> Temperature (°C)</span>}
            {hasEC       && <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-violet-600 inline-block" /> EC (μS/cm)</span>}
          </div>
        </div>
      ) : panelTab === "table" ? (
        <div className="overflow-x-auto rounded border border-gray-200 bg-white">
          <table className="text-xs w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Date / Time</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">Depth (cm)</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">Moisture %</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">Temp °C</th>
                <th className="px-3 py-2 text-right font-medium text-gray-500">EC μS/cm</th>
                <th className="px-3 py-2 text-left font-medium text-gray-500">Method</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {readings.slice().reverse().map(r => (
                <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-gray-700 whitespace-nowrap">{fmtDt(r.readingAt)}</td>
                  <td className="px-3 py-2 text-right text-gray-600">{r.depthCm ?? "—"}</td>
                  <td className="px-3 py-2 text-right font-medium text-green-700">{r.moisturePercent ? `${parseFloat(r.moisturePercent).toFixed(1)}%` : "—"}</td>
                  <td className="px-3 py-2 text-right text-orange-600">{r.temperatureCelsius ? `${parseFloat(r.temperatureCelsius).toFixed(1)}°C` : "—"}</td>
                  <td className="px-3 py-2 text-right text-violet-700">{r.ecUsPerCm ? parseFloat(r.ecUsPerCm).toFixed(0) : "—"}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${r.entryMethod === "csv" ? "bg-blue-50 text-blue-700" : r.entryMethod === "api" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                      {r.entryMethod}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => setPendingConfirm({ msg: "Delete this soil moisture reading? This cannot be undone.", fn: () => deleteReading.mutate(r.id) })}
                      className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center py-10">
          <Button onClick={() => setShowImport(true)} size="sm" className="gap-2">
            <FileUp className="w-4 h-4" /> Open CSV Import
          </Button>
          <p className="text-xs text-gray-400 mt-2">Import up to 5,000 readings at a time from your data logger export</p>
        </div>
      )}

      {showAddReading && <AddReadingDialog open probe={probe} farmId={farmId} onClose={() => { setShowAddReading(false); qc.invalidateQueries({ queryKey: ["soil-readings", probe.id] }); }} />}
      {showImport && <CsvImportDialog open probe={probe} farmId={farmId} onClose={() => setShowImport(false)} />}
      <ConfirmDialog
        open={!!pendingConfirm}
        title="Delete Reading"
        message={pendingConfirm?.msg ?? ""}
        onConfirm={() => { pendingConfirm?.fn(); setPendingConfirm(null); }}
        onCancel={() => setPendingConfirm(null)}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}

// ─── Main tab export ──────────────────────────────────────────────────────────
export function SoilSensorsTab({ farmId }: { farmId: number }) {
  const { data: fieldsData } = useQuery<{ records: FieldRecord[] }>({
    queryKey: ["fields", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/fields`);
      if (!res.ok) return { records: [] };
      return res.json();
    },
  });
  const fields = fieldsData?.records ?? [];
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editProbe, setEditProbe] = useState<SoilSensorProbe | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [pendingConfirm, setPendingConfirm] = useState<{ msg: string; fn: () => void } | null>(null);

  const { data, isLoading } = useQuery<{ records: SoilSensorProbe[] }>({
    queryKey: ["soil-sensors", farmId],
    queryFn: async () => {
      const res = await fetch(`/api/farms/${farmId}/soil-sensors`);
      if (!res.ok) throw new Error("Failed to load sensor probes");
      return res.json();
    },
  });

  const deleteProbe = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/farms/${farmId}/soil-sensors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["soil-sensors", farmId] });
      toast({ title: "Probe removed" });
    },
  });

  const toggleExpand = (id: number) =>
    setExpanded(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const probes = data?.records ?? [];
  const activeCount = probes.filter(p => p.isActive).length;

  return (
    <div>
      <ConfirmDialog
        open={!!pendingConfirm}
        title="Delete Probe"
        message={pendingConfirm?.msg ?? ""}
        onConfirm={() => { pendingConfirm?.fn(); setPendingConfirm(null); }}
        onCancel={() => setPendingConfirm(null)}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Continuous Soil Monitoring</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {probes.length === 0 ? "Register sensor probes and log readings manually or import from your data logger CSV." : `${activeCount} active probe${activeCount !== 1 ? "s" : ""} · ${probes.length} registered`}
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Probe
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading probes…
        </div>
      ) : probes.length === 0 ? (
        <EmptySensors onAdd={() => setShowAdd(true)} />
      ) : (
        <div className="space-y-3">
          {probes.map(probe => {
            const field = fields.find(f => f.id === probe.fieldId);
            const isExpanded = expanded.has(probe.id);
            return (
              <Card key={probe.id} className="overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${probe.isActive ? "bg-green-500" : "bg-gray-300"}`} title={probe.isActive ? "Active" : "Inactive"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-800">{probe.name}</span>
                      {probe.manufacturer && (
                        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">
                          {probe.manufacturer}
                        </span>
                      )}
                      {probe.model && (
                        <span className="text-xs text-gray-500 font-mono">{probe.model}</span>
                      )}
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                        {SENSOR_TYPES[probe.sensorType] ?? probe.sensorType}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {field && (
                        <span className="text-xs text-gray-500 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />{field.name}
                        </span>
                      )}
                      {probe.depthsCm && (
                        <span className="text-xs text-gray-500 flex items-center gap-0.5">
                          <Activity className="w-3 h-3" />{probe.depthsCm} cm
                        </span>
                      )}
                      {probe.installDate && (
                        <span className="text-xs text-gray-500 flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" />Installed {fmt(probe.installDate)}
                        </span>
                      )}
                      {probe.latitude && probe.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${probe.latitude},${probe.longitude}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                          onClick={e => e.stopPropagation()}>
                          <MapPin className="w-3 h-3" />GPS
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setEditProbe(probe)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setPendingConfirm({ msg: `Delete "${probe.name}" and all its readings? This cannot be undone.`, fn: () => deleteProbe.mutate(probe.id) })}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleExpand(probe.id)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500 ml-1" title={isExpanded ? "Collapse" : "View readings"}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {isExpanded && <ProbePanel probe={probe} farmId={farmId} fields={fields} />}
              </Card>
            );
          })}
        </div>
      )}

      {showAdd && <ProbeDialog open farmId={farmId} fields={fields} onClose={() => setShowAdd(false)} />}
      {editProbe && <ProbeDialog open probe={editProbe} farmId={farmId} fields={fields} onClose={() => setEditProbe(null)} />}
    </div>
  );
}
