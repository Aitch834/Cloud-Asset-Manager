import React, { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Plus, Pencil, Trash2, TrendingUp, AlertTriangle, CheckCircle2,
  Package, PoundSterling, FileText, Thermometer, ShieldCheck,
  Wheat, BarChart3, Scale, AlertCircle, Info, Loader2,
  Truck, FileCheck, X, ChevronDown, ChevronRight, ArrowRight,
  CloudSun, Tractor, MapPin
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const STRAW_TYPES = ["Wheat Straw", "Barley Straw", "Oat Straw", "Oilseed Rape Straw"];
const BALE_FORMATS = ["Small Rectangular", "Big Round", "Big Square"];
const STORAGE_TYPES = ["Indoor", "Outdoor Covered", "Outdoor Uncovered"];
const PPP_RISKS = ["Low", "Medium", "High"];
const INTENDED_USES = ["Animal Feed", "Bedding", "Horticultural / Composting", "Unknown"];
const BUYER_TYPES = ["Farmer", "Merchant / Trader", "Market Gardener", "Contractor", "Other"];
const TRANSPORT_OPTIONS = ["Buyer Collects", "Own Transport", "Third-Party Haulier"];
const PAYMENT_STATUSES = ["unpaid", "paid", "overdue"];
const CONDITION_OPTIONS = ["Good", "Monitor", "Action Required", "Unsafe"];
const WEATHER_CONDITIONS = ["Sunny", "Dry & Windy", "Overcast", "Light Rain", "Humid", "Cloudy", "Hot & Dry", "Showery"];
const SOIL_CONDITIONS = ["Dry", "Slightly Moist", "Moist", "Wet"];
const CHART_COLORS = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

// ─── VAT intelligence ─────────────────────────────────────────────────────────
function deriveVatClassification(use: string): { classification: string; rate: string; warning?: string } {
  if (use === "Animal Feed") return { classification: "Zero-rated (0%)", rate: "0%" };
  if (use === "Bedding") return { classification: "Standard-rated (20%)", rate: "20%", warning: "Straw sold as bedding is standard-rated for VAT (20%). Ensure this is reflected on your invoice." };
  if (use === "Horticultural / Composting") return { classification: "Standard-rated (20%)", rate: "20%", warning: "Straw sold for horticultural or composting use is standard-rated for VAT (20%) per HMRC VAT Notice 701/15." };
  return { classification: "To be confirmed", rate: "TBC", warning: "Confirm intended use with buyer before invoicing. VAT rate depends on how straw is held out for sale (HMRC VAT Notice 701/15)." };
}

// ─── Moisture risk ────────────────────────────────────────────────────────────
function getMoistureRisk(pct: number | null | undefined, format: string): { status: string; colour: string; message: string } {
  if (pct == null) return { status: "Unknown", colour: "gray", message: "Record moisture at baling for fire risk assessment." };
  const limit = format === "Small Rectangular" ? 22 : 18;
  const warning = format === "Small Rectangular" ? 18 : 16;
  if (pct > limit) return { status: "Action Required", colour: "red", message: `Moisture ${pct}% exceeds safe limit (${limit}% for ${format}). Risk of spontaneous combustion. Monitor daily and consider moving/selling immediately.` };
  if (pct > warning) return { status: "Warning", colour: "amber", message: `Moisture ${pct}% is elevated (safe limit: ${limit}% for ${format}). Monitor closely for first 14 days.` };
  return { status: "Safe", colour: "green", message: `Moisture ${pct}% is within safe limits for ${format} (max ${limit}%).` };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const pToGBP = (p: number | null | undefined) =>
  p == null ? "—" : `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
const num = (v: any) => (v == null || v === "" ? null : Number(v));
const today = () => new Date().toISOString().slice(0, 10);

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    in_stock: "bg-green-100 text-green-800", sold: "bg-gray-100 text-gray-700",
    used_on_farm: "bg-blue-100 text-blue-800", disposed: "bg-red-100 text-red-700",
    unpaid: "bg-amber-100 text-amber-800", paid: "bg-green-100 text-green-800", overdue: "bg-red-100 text-red-800",
  };
  const label: Record<string, string> = {
    in_stock: "In Stock", sold: "Sold", used_on_farm: "Used On-Farm",
    disposed: "Disposed", unpaid: "Unpaid", paid: "Paid", overdue: "Overdue"
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-700"}`}>{label[status] ?? status}</span>;
}

function ConditionBadge({ cond }: { cond: string }) {
  const map: Record<string, string> = { Good: "bg-green-100 text-green-800", Monitor: "bg-amber-100 text-amber-800", "Action Required": "bg-orange-100 text-orange-800", Unsafe: "bg-red-100 text-red-800" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${map[cond] ?? "bg-gray-100 text-gray-700"}`}>{cond}</span>;
}

function BalingStatusBadge({ status, balance }: { status: string; balance: number }) {
  if (status === "complete") return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">Complete</span>;
  if (balance > 0) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">{balance} in field</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Open</span>;
}

// ─── Baling Dialog (Phase 1) ──────────────────────────────────────────────────
function BalingDialog({ open, onClose, farmId, editRow }: { open: boolean; onClose: () => void; farmId: number; editRow?: any }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;

  const init = {
    operationDate: today(), fieldId: "", fieldOfOrigin: "", cropVariety: "",
    strawType: "Wheat Straw", baleFormat: "Big Round", areaHa: "",
    totalBalesProduced: "", baleWeightKg: "",
    tractorDescription: "", balerDescription: "", operatorName: "",
    machineHours: "", labourHours: "",
    weatherConditions: "", temperatureC: "", windSpeedKmh: "", soilConditions: "",
    notes: "",
  };
  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  const { data: fields = [] } = useQuery<any[]>({
    queryKey: ["fields", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }); return r.ok ? r.json() : []; },
    enabled: open && !!farmId, staleTime: 60_000,
  });
  const { data: equipment = [] } = useQuery<any[]>({
    queryKey: ["equipment", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/equipment`, { credentials: "include" }); return r.ok ? r.json() : []; },
    enabled: open && !!farmId, staleTime: 60_000,
  });

  const tractors = equipment.filter((e: any) => /tractor|power unit/i.test(e.type ?? ""));
  const balers = equipment.filter((e: any) => /baler|implement/i.test(e.type ?? ""));

  React.useEffect(() => {
    if (open) {
      setForm(editRow ? {
        operationDate: editRow.operationDate ?? today(),
        fieldId: editRow.fieldId != null ? String(editRow.fieldId) : "",
        fieldOfOrigin: editRow.fieldOfOrigin ?? "",
        cropVariety: editRow.cropVariety ?? "",
        strawType: editRow.strawType ?? "Wheat Straw",
        baleFormat: editRow.baleFormat ?? "Big Round",
        areaHa: editRow.areaHa ?? "",
        totalBalesProduced: editRow.totalBalesProduced ?? "",
        baleWeightKg: editRow.baleWeightKg ?? "",
        tractorDescription: editRow.tractorDescription ?? "",
        balerDescription: editRow.balerDescription ?? "",
        operatorName: editRow.operatorName ?? "",
        machineHours: editRow.machineHours ?? "",
        labourHours: editRow.labourHours ?? "",
        weatherConditions: editRow.weatherConditions ?? "",
        temperatureC: editRow.temperatureC ?? "",
        windSpeedKmh: editRow.windSpeedKmh ?? "",
        soilConditions: editRow.soilConditions ?? "",
        notes: editRow.notes ?? "",
      } : init);
    }
  }, [open, editRow]);

  // Auto-fill field name when field is selected
  React.useEffect(() => {
    if (!form.fieldId) return;
    const field = fields.find((fld: any) => fld.id === Number(form.fieldId));
    if (field) setForm(p => ({ ...p, fieldOfOrigin: field.name ?? p.fieldOfOrigin }));
  }, [form.fieldId, fields]);

  const mut = useMutation({
    mutationFn: async (body: any) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-baling-operations/${editRow.id}` : `/api/farms/${farmId}/straw-baling-operations`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-baling-ops", farmId] });
      qc.invalidateQueries({ queryKey: ["field-operations"] });
      toast({ title: isEdit ? "Baling operation updated" : "Baling operation recorded" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const submit = () => {
    if (!form.operationDate || !form.totalBalesProduced) {
      toast({ title: "Required fields missing", description: "Date and bale count are required.", variant: "destructive" }); return;
    }
    mut.mutate({
      operationDate: form.operationDate,
      fieldId: form.fieldId ? Number(form.fieldId) : null,
      fieldOfOrigin: form.fieldOfOrigin || null,
      cropVariety: form.cropVariety || null,
      strawType: form.strawType, baleFormat: form.baleFormat,
      areaHa: form.areaHa || null,
      totalBalesProduced: num(form.totalBalesProduced) ?? 0,
      baleWeightKg: form.baleWeightKg || null,
      tractorDescription: form.tractorDescription || null,
      balerDescription: form.balerDescription || null,
      operatorName: form.operatorName || null,
      machineHours: form.machineHours || null,
      labourHours: form.labourHours || null,
      weatherConditions: form.weatherConditions || null,
      temperatureC: form.temperatureC || null,
      windSpeedKmh: form.windSpeedKmh || null,
      soilConditions: form.soilConditions || null,
      notes: form.notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Record"} Baling Operation</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 flex gap-2">
            <Wheat size={16} className="shrink-0 mt-0.5 text-amber-600" />
            <span>This records the baling machine's output for the session. Once saved, use <strong>Add Journey</strong> to track each trailer load moved to storage.</span>
          </div>

          <div><Label>Operation Date *</Label><Input type="date" value={form.operationDate} onChange={e => f("operationDate")(e.target.value)} /></div>
          <div>
            <Label>Field of Origin</Label>
            {fields.length > 0 ? (
              <Select value={form.fieldId || "__other__"} onValueChange={v => { if (v === "__other__") setForm(p => ({ ...p, fieldId: "", fieldOfOrigin: "" })); else f("fieldId")(v); }}>
                <SelectTrigger><SelectValue placeholder="Select field…" /></SelectTrigger>
                <SelectContent>
                  {fields.map((fld: any) => <SelectItem key={fld.id} value={String(fld.id)}>{fld.name}{fld.fieldReference ? ` (${fld.fieldReference})` : ""}</SelectItem>)}
                  <SelectItem value="__other__">Other / not in list</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input placeholder="e.g. North Field" value={form.fieldOfOrigin} onChange={e => f("fieldOfOrigin")(e.target.value)} />
            )}
            {fields.length > 0 && (
              <Input className="mt-1.5" placeholder="Field name (auto-filled or enter)" value={form.fieldOfOrigin} onChange={e => f("fieldOfOrigin")(e.target.value)} />
            )}
          </div>

          <div>
            <Label>Straw Type *</Label>
            <Select value={form.strawType} onValueChange={f("strawType")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STRAW_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Bale Format *</Label>
            <Select value={form.baleFormat} onValueChange={f("baleFormat")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BALE_FORMATS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Crop Variety</Label><Input placeholder="e.g. Skyfall, Crusoe" value={form.cropVariety} onChange={e => f("cropVariety")(e.target.value)} /></div>
          <div><Label>Area Baled (ha)</Label><Input type="number" min={0} step={0.1} placeholder="ha" value={form.areaHa} onChange={e => f("areaHa")(e.target.value)} /></div>

          <div>
            <Label>Total Bales Produced *</Label>
            <Input type="number" min={0} placeholder="e.g. 320" value={form.totalBalesProduced} onChange={e => f("totalBalesProduced")(e.target.value)} />
            <p className="text-xs text-gray-500 mt-1">Total count produced by the baler on this day / session</p>
          </div>
          <div><Label>Approx. Weight / Bale (kg)</Label><Input type="number" min={0} step={1} placeholder="e.g. 300" value={form.baleWeightKg} onChange={e => f("baleWeightKg")(e.target.value)} /></div>

          <div className="col-span-2 border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Machine & Labour</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tractor / Power Unit</Label>
                {tractors.length > 0 ? (
                  <Select value={form.tractorDescription} onValueChange={v => f("tractorDescription")(v)}>
                    <SelectTrigger><SelectValue placeholder="Select tractor…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      {tractors.map((e: any) => <SelectItem key={e.id} value={`${e.name}${e.registrationNumber ? ` (${e.registrationNumber})` : ""}`}>{e.name}{e.registrationNumber ? ` — ${e.registrationNumber}` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="e.g. JD 6175R — AB23 XYZ" value={form.tractorDescription} onChange={e => f("tractorDescription")(e.target.value)} />
                )}
              </div>
              <div>
                <Label>Baler / Implement</Label>
                {balers.length > 0 ? (
                  <Select value={form.balerDescription} onValueChange={v => f("balerDescription")(v)}>
                    <SelectTrigger><SelectValue placeholder="Select baler…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not specified</SelectItem>
                      {balers.map((e: any) => <SelectItem key={e.id} value={e.name}>{e.name}{e.make ? ` — ${e.make}` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="e.g. Claas Variant 460" value={form.balerDescription} onChange={e => f("balerDescription")(e.target.value)} />
                )}
              </div>
              <div><Label>Operator Name</Label><Input placeholder="e.g. John Smith" value={form.operatorName} onChange={e => f("operatorName")(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Machine Hours</Label><Input type="number" min={0} step={0.5} placeholder="0.0" value={form.machineHours} onChange={e => f("machineHours")(e.target.value)} /></div>
                <div><Label>Labour Hours</Label><Input type="number" min={0} step={0.5} placeholder="0.0" value={form.labourHours} onChange={e => f("labourHours")(e.target.value)} /></div>
              </div>
            </div>
          </div>

          <div className="col-span-2 border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-1"><CloudSun size={13} />Weather Conditions</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Conditions</Label>
                <Select value={form.weatherConditions} onValueChange={f("weatherConditions")}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Not recorded</SelectItem>
                    {WEATHER_CONDITIONS.map(w => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Temperature (°C)</Label><Input type="number" step={0.5} placeholder="e.g. 22" value={form.temperatureC} onChange={e => f("temperatureC")(e.target.value)} /></div>
              <div><Label>Wind Speed (km/h)</Label><Input type="number" min={0} step={1} placeholder="e.g. 15" value={form.windSpeedKmh} onChange={e => f("windSpeedKmh")(e.target.value)} /></div>
            </div>
            <div className="mt-3">
              <Label>Soil Conditions</Label>
              <Select value={form.soilConditions} onValueChange={f("soilConditions")}>
                <SelectTrigger className="max-w-[200px]"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not recorded</SelectItem>
                  {SOIL_CONDITIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending || !form.operationDate || !form.totalBalesProduced}>
            {mut.isPending && <Loader2 size={14} className="mr-1 animate-spin" />}{isEdit ? "Save Changes" : "Record Baling Operation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Cartage Journey Dialog (Phase 2) ────────────────────────────────────────
function CartageDialog({ open, onClose, farmId, balingOp, editRow }: { open: boolean; onClose: () => void; farmId: number; balingOp: any; editRow?: any }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;

  const init = {
    journeyDate: today(), journeyTime: "", operatorName: "",
    tractorDescription: "", trailerDescription: "",
    balesMoved: "", fromLocation: balingOp?.fieldOfOrigin ?? "",
    toLocation: "", toStorageType: "Indoor", notes: "",
  };
  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  const { data: equipment = [] } = useQuery<any[]>({
    queryKey: ["equipment", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/equipment`, { credentials: "include" }); return r.ok ? r.json() : []; },
    enabled: open && !!farmId, staleTime: 60_000,
  });
  const tractors = equipment.filter((e: any) => /tractor|power unit/i.test(e.type ?? ""));
  const trailers = equipment.filter((e: any) => /trailer/i.test(e.type ?? ""));

  React.useEffect(() => {
    if (open) {
      setForm(editRow ? {
        journeyDate: editRow.journeyDate ?? today(),
        journeyTime: editRow.journeyTime ?? "",
        operatorName: editRow.operatorName ?? "",
        tractorDescription: editRow.tractorDescription ?? "",
        trailerDescription: editRow.trailerDescription ?? "",
        balesMoved: editRow.balesMoved ?? "",
        fromLocation: editRow.fromLocation ?? balingOp?.fieldOfOrigin ?? "",
        toLocation: editRow.toLocation ?? "",
        toStorageType: editRow.toStorageType ?? "Indoor",
        notes: editRow.notes ?? "",
      } : { ...init, fromLocation: balingOp?.fieldOfOrigin ?? "" });
    }
  }, [open, editRow, balingOp]);

  const balance = balingOp ? (balingOp.balingBalance ?? 0) : 0;

  const mut = useMutation({
    mutationFn: async (body: any) => {
      const url = isEdit
        ? `/api/farms/${farmId}/straw-cartage-journeys/${editRow.id}`
        : `/api/farms/${farmId}/straw-baling-operations/${balingOp.id}/journeys`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-baling-ops", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-journeys", balingOp?.id] });
      toast({ title: isEdit ? "Journey updated" : "Journey recorded" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const submit = () => {
    if (!form.balesMoved || !form.toLocation) {
      toast({ title: "Required fields missing", description: "Bales moved and destination are required.", variant: "destructive" }); return;
    }
    const moved = num(form.balesMoved) ?? 0;
    if (!isEdit && moved > balance) {
      toast({ title: "Exceeds balance", description: `Only ${balance} bales remain in field. You cannot move ${moved}.`, variant: "destructive" }); return;
    }
    mut.mutate({
      journeyDate: form.journeyDate, journeyTime: form.journeyTime || null,
      operatorName: form.operatorName || null,
      tractorDescription: form.tractorDescription || null,
      trailerDescription: form.trailerDescription || null,
      balesMoved: moved,
      fromLocation: form.fromLocation || null,
      toLocation: form.toLocation,
      toStorageType: form.toStorageType,
      notes: form.notes || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Record"} Cartage Journey</DialogTitle>
          {balingOp && <p className="text-sm text-gray-500 mt-1">{balingOp.fieldOfOrigin || "Field"} → Storage &nbsp;|&nbsp; <span className={`font-semibold ${balance > 0 ? "text-amber-700" : "text-green-700"}`}>{balance} bales remaining in field</span></p>}
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Journey Date *</Label><Input type="date" value={form.journeyDate} onChange={e => f("journeyDate")(e.target.value)} /></div>
          <div><Label>Time (optional)</Label><Input type="time" value={form.journeyTime} onChange={e => f("journeyTime")(e.target.value)} /></div>

          <div>
            <Label>Operator</Label>
            <Input placeholder="Operator name" value={form.operatorName} onChange={e => f("operatorName")(e.target.value)} />
          </div>
          <div>
            <Label>Bales This Journey *</Label>
            <Input type="number" min={1} placeholder="e.g. 40" value={form.balesMoved} onChange={e => f("balesMoved")(e.target.value)} />
            {!isEdit && balance > 0 && <p className="text-xs text-gray-500 mt-1">{balance} bales still to move</p>}
          </div>

          <div>
            <Label>Tractor</Label>
            {tractors.length > 0 ? (
              <Select value={form.tractorDescription} onValueChange={v => f("tractorDescription")(v)}>
                <SelectTrigger><SelectValue placeholder="Select tractor…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  {tractors.map((e: any) => <SelectItem key={e.id} value={`${e.name}${e.registrationNumber ? ` (${e.registrationNumber})` : ""}`}>{e.name}{e.registrationNumber ? ` — ${e.registrationNumber}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input placeholder="e.g. JD 6175R" value={form.tractorDescription} onChange={e => f("tractorDescription")(e.target.value)} />
            )}
          </div>
          <div>
            <Label>Trailer</Label>
            {trailers.length > 0 ? (
              <Select value={form.trailerDescription} onValueChange={v => f("trailerDescription")(v)}>
                <SelectTrigger><SelectValue placeholder="Select trailer…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  {trailers.map((e: any) => <SelectItem key={e.id} value={e.name}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input placeholder="e.g. 14T grain trailer" value={form.trailerDescription} onChange={e => f("trailerDescription")(e.target.value)} />
            )}
          </div>

          <div>
            <Label>From (Field / Area)</Label>
            <Input placeholder="Auto-filled from baling op" value={form.fromLocation} onChange={e => f("fromLocation")(e.target.value)} />
          </div>
          <div>
            <Label>To (Storage Location) *</Label>
            <Input placeholder="e.g. Home Farm Barn 2" value={form.toLocation} onChange={e => f("toLocation")(e.target.value)} />
          </div>

          <div className="col-span-2">
            <Label>Storage Type</Label>
            <Select value={form.toStorageType} onValueChange={f("toStorageType")}>
              <SelectTrigger className="max-w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>{STORAGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending || !form.balesMoved || !form.toLocation}>
            {mut.isPending && <Loader2 size={14} className="mr-1 animate-spin" />}{isEdit ? "Save Changes" : "Record Journey"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Cartage Journeys Panel (drill-down within a baling op row) ───────────────
function CartageJourneysPanel({ farmId, balingOp, onAddJourney }: { farmId: number; balingOp: any; onAddJourney: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editJourney, setEditJourney] = useState<any>(null);

  const { data: journeys = [], isLoading } = useQuery<any[]>({
    queryKey: ["straw-journeys", balingOp.id],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-baling-operations/${balingOp.id}/journeys`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId && !!balingOp.id,
  });

  const delMut = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/farms/${farmId}/straw-cartage-journeys/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-journeys", balingOp.id] });
      qc.invalidateQueries({ queryKey: ["straw-baling-ops", farmId] });
      toast({ title: "Journey deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const runningBalance = balingOp.totalBalesProduced ?? 0;
  let remaining = runningBalance;

  return (
    <div className="bg-amber-50 border-t border-amber-200">
      {/* Balance summary */}
      <div className="flex items-center gap-6 px-6 py-3 border-b border-amber-200">
        <div className="text-sm">
          <span className="text-gray-500">Produced: </span>
          <span className="font-bold">{(balingOp.totalBalesProduced ?? 0).toLocaleString()} bales</span>
        </div>
        <ArrowRight size={14} className="text-gray-400" />
        <div className="text-sm">
          <span className="text-gray-500">Moved to storage: </span>
          <span className="font-bold text-green-700">{(balingOp.balesMoved ?? 0).toLocaleString()}</span>
        </div>
        <ArrowRight size={14} className="text-gray-400" />
        <div className="text-sm">
          <span className="text-gray-500">Still in field: </span>
          <span className={`font-bold ${(balingOp.balingBalance ?? 0) > 0 ? "text-amber-700" : "text-green-700"}`}>
            {(balingOp.balingBalance ?? 0).toLocaleString()}
          </span>
        </div>
        <Button size="sm" className="ml-auto" onClick={onAddJourney}>
          <Truck size={13} className="mr-1" />Add Journey
        </Button>
      </div>

      {isLoading ? (
        <div className="p-4 text-center text-gray-400"><Loader2 size={18} className="animate-spin mx-auto" /></div>
      ) : journeys.length === 0 ? (
        <div className="px-6 py-4 text-sm text-gray-500 italic">No cartage journeys recorded yet. Click <strong>Add Journey</strong> to record the first trailer load.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-amber-200">
                {["Date", "Time", "Operator", "Tractor", "Trailer", "Bales", "From", "To", "Storage Type", "Running Balance", ""].map(h => (
                  <th key={h} className="px-4 py-2 text-left font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {journeys.map((j: any) => {
                remaining -= j.balesMoved ?? 0;
                return (
                  <tr key={j.id} className="border-b border-amber-100 hover:bg-amber-100/60">
                    <td className="px-4 py-2">{fmtDate(j.journeyDate)}</td>
                    <td className="px-4 py-2 text-gray-500">{j.journeyTime || "—"}</td>
                    <td className="px-4 py-2">{j.operatorName || "—"}</td>
                    <td className="px-4 py-2 text-gray-600">{j.tractorDescription || "—"}</td>
                    <td className="px-4 py-2 text-gray-600">{j.trailerDescription || "—"}</td>
                    <td className="px-4 py-2 font-semibold text-green-700">+{j.balesMoved}</td>
                    <td className="px-4 py-2 text-gray-600">{j.fromLocation || "—"}</td>
                    <td className="px-4 py-2 font-medium">{j.toLocation || "—"}</td>
                    <td className="px-4 py-2 text-gray-500">{j.toStorageType || "—"}</td>
                    <td className="px-4 py-2">
                      <span className={`font-semibold ${remaining > 0 ? "text-amber-700" : "text-green-700"}`}>{remaining} in field</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        <button onClick={() => setEditJourney(j)} className="p-1 rounded hover:bg-amber-200 text-gray-500"><Pencil size={12} /></button>
                        <button onClick={() => { if (confirm("Delete this journey?")) delMut.mutate(j.id); }} className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editJourney && (
        <CartageDialog
          open={!!editJourney}
          onClose={() => setEditJourney(null)}
          farmId={farmId}
          balingOp={balingOp}
          editRow={editJourney}
        />
      )}
    </div>
  );
}

// ─── Inventory Dialog (Phase 3 — Batch Record) ────────────────────────────────
function InventoryDialog({ open, onClose, farmId, editRow, existingInventory, balingOp }: { open: boolean; onClose: () => void; farmId: number; editRow?: any; existingInventory: any[]; balingOp?: any }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;

  const init = {
    batchRef: "", strawType: "Wheat Straw", baleFormat: "Big Round",
    harvestDate: today(), fieldId: "", fieldOfOrigin: "", cropVariety: "",
    quantityBales: "", baleWeightKg: "", moistureAtBaling: "",
    storageLocation: "", storageType: "Indoor", stackingStartDate: today(),
    redTractorCertified: false, combinableCropsPassportRef: "",
    pppResidueRisk: "Low", fusariumRiskAssessed: false,
    biomassContract: false, biomassScheme: "", biomassUniqueBaleRef: "",
    status: "in_stock", notes: "",
  };
  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  const { data: fields = [] } = useQuery<any[]>({
    queryKey: ["fields", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }); return r.ok ? r.json() : []; },
    enabled: open && !!farmId, staleTime: 60_000,
  });
  const { data: fieldCrops = [] } = useQuery<any[]>({
    queryKey: ["field-crops", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/field-crops`, { credentials: "include" }); return r.ok ? r.json() : []; },
    enabled: open && !!farmId, staleTime: 60_000,
  });

  const knownLocations = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of existingInventory) {
      if (row.storageLocation && !map.has(row.storageLocation)) map.set(row.storageLocation, row.storageType ?? "Indoor");
    }
    return Array.from(map.entries()).map(([name, type]) => ({ name, type }));
  }, [existingInventory]);

  React.useEffect(() => {
    if (open) {
      if (editRow) {
        setForm({
          batchRef: editRow.batchRef ?? "", strawType: editRow.strawType ?? "Wheat Straw",
          baleFormat: editRow.baleFormat ?? "Big Round", harvestDate: editRow.harvestDate ?? today(),
          fieldId: editRow.fieldId != null ? String(editRow.fieldId) : "",
          fieldOfOrigin: editRow.fieldOfOrigin ?? "", cropVariety: editRow.cropVariety ?? "",
          quantityBales: editRow.quantityBales ?? "", baleWeightKg: editRow.baleWeightKg ?? "",
          moistureAtBaling: editRow.moistureAtBaling ?? "",
          storageLocation: editRow.storageLocation ?? "", storageType: editRow.storageType ?? "Indoor",
          stackingStartDate: editRow.stackingStartDate ?? today(),
          redTractorCertified: editRow.redTractorCertified ?? false,
          combinableCropsPassportRef: editRow.combinableCropsPassportRef ?? "",
          pppResidueRisk: editRow.pppResidueRisk ?? "Low", fusariumRiskAssessed: editRow.fusariumRiskAssessed ?? false,
          biomassContract: editRow.biomassContract ?? false,
          biomassScheme: editRow.biomassScheme ?? "", biomassUniqueBaleRef: editRow.biomassUniqueBaleRef ?? "",
          status: editRow.status ?? "in_stock", notes: editRow.notes ?? "",
        });
      } else if (balingOp) {
        // Pre-fill from a baling operation
        setForm({ ...init,
          strawType: balingOp.strawType ?? "Wheat Straw",
          baleFormat: balingOp.baleFormat ?? "Big Round",
          harvestDate: balingOp.operationDate ?? today(),
          fieldId: balingOp.fieldId != null ? String(balingOp.fieldId) : "",
          fieldOfOrigin: balingOp.fieldOfOrigin ?? "",
          cropVariety: balingOp.cropVariety ?? "",
          quantityBales: String(balingOp.totalBalesProduced ?? ""),
          baleWeightKg: balingOp.baleWeightKg ?? "",
          stackingStartDate: today(),
        });
      } else {
        setForm(init);
      }
    }
  }, [open, editRow, balingOp]);

  React.useEffect(() => {
    if (!form.fieldId) return;
    const field = fields.find((fld: any) => fld.id === Number(form.fieldId));
    if (!field) return;
    setForm(p => ({ ...p, fieldOfOrigin: field.name ?? p.fieldOfOrigin }));
    const crops: any[] = fieldCrops.filter((c: any) => c.fieldId === Number(form.fieldId));
    if (crops.length > 0) {
      const latest = crops.sort((a: any, b: any) => (b.harvestYear ?? 0) - (a.harvestYear ?? 0))[0];
      const variety = latest.varietyName || latest.cropVariety || "";
      if (variety) setForm(p => ({ ...p, cropVariety: variety }));
    }
  }, [form.fieldId, fields, fieldCrops]);

  const moisture = num(form.moistureAtBaling);
  const risk = getMoistureRisk(moisture, form.baleFormat);

  const handleStorageLocation = (val: string) => {
    const known = knownLocations.find(l => l.name === val);
    setForm(p => ({ ...p, storageLocation: val, ...(known ? { storageType: known.type } : {}) }));
  };

  const mut = useMutation({
    mutationFn: async (body: any) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-bale-inventory/${editRow.id}` : `/api/farms/${farmId}/straw-bale-inventory`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-inventory", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-analytics", farmId] });
      toast({ title: isEdit ? "Batch updated" : "Batch added" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const submit = () => mut.mutate({
    batchRef: form.batchRef || null, strawType: form.strawType, baleFormat: form.baleFormat,
    harvestDate: form.harvestDate || null,
    fieldId: form.fieldId ? Number(form.fieldId) : null,
    fieldOfOrigin: form.fieldOfOrigin || null, cropVariety: form.cropVariety || null,
    quantityBales: num(form.quantityBales) ?? 0,
    quantityRemaining: num(form.quantityBales) ?? 0,
    baleWeightKg: form.baleWeightKg || null,
    moistureAtBaling: form.moistureAtBaling || null,
    moistureStatus: moisture != null ? risk.status : null,
    storageLocation: form.storageLocation || null, storageType: form.storageType,
    stackingStartDate: form.stackingStartDate || null,
    redTractorCertified: form.redTractorCertified,
    combinableCropsPassportRef: form.combinableCropsPassportRef || null,
    pppResidueRisk: form.pppResidueRisk, fusariumRiskAssessed: form.fusariumRiskAssessed,
    biomassContract: form.biomassContract,
    biomassScheme: form.biomassScheme || null, biomassUniqueBaleRef: form.biomassUniqueBaleRef || null,
    status: form.status,
    balingOperationId: balingOp?.id ?? null,
    notes: form.notes || null,
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add"} Straw Bale Batch</DialogTitle>
          {balingOp && !isEdit && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 mt-1 flex items-center gap-1">
              <CheckCircle2 size={13} />Pre-filled from baling operation — {fmtDate(balingOp.operationDate)} · {balingOp.fieldOfOrigin}
            </p>
          )}
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 grid grid-cols-3 gap-4">
            <div><Label>Batch Reference</Label><Input placeholder="e.g. WS-2026-001" value={form.batchRef} onChange={e => f("batchRef")(e.target.value)} /></div>
            <div>
              <Label>Straw Type *</Label>
              <Select value={form.strawType} onValueChange={f("strawType")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STRAW_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bale Format *</Label>
              <Select value={form.baleFormat} onValueChange={f("baleFormat")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BALE_FORMATS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div><Label>Harvest Date</Label><Input type="date" value={form.harvestDate} onChange={e => f("harvestDate")(e.target.value)} /></div>
          <div>
            <Label>Field of Origin</Label>
            {fields.length > 0 ? (
              <Select value={form.fieldId || "__other__"} onValueChange={v => { if (v === "__other__") setForm(p => ({ ...p, fieldId: "", fieldOfOrigin: "" })); else f("fieldId")(v); }}>
                <SelectTrigger><SelectValue placeholder="Select field…" /></SelectTrigger>
                <SelectContent>
                  {fields.map((fld: any) => <SelectItem key={fld.id} value={String(fld.id)}>{fld.name}{fld.fieldReference ? ` (${fld.fieldReference})` : ""}</SelectItem>)}
                  <SelectItem value="__other__">Other / not in field list</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input placeholder="e.g. North Field" value={form.fieldOfOrigin} onChange={e => f("fieldOfOrigin")(e.target.value)} />
            )}
            {fields.length > 0 && <Input className="mt-1.5" placeholder={form.fieldId ? "Field name (auto-filled)" : "Enter field name"} value={form.fieldOfOrigin} onChange={e => f("fieldOfOrigin")(e.target.value)} />}
          </div>
          <div>
            <Label>Crop Variety</Label>
            <Input placeholder="e.g. Skyfall, Crusoe" value={form.cropVariety} onChange={e => f("cropVariety")(e.target.value)} />
            {form.fieldId && form.cropVariety && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Info size={11} />Auto-populated from field crop records.</p>}
          </div>
          <div>
            <Label>Total Batch Size (Bales) *</Label>
            <Input type="number" min={0} value={form.quantityBales} onChange={e => f("quantityBales")(e.target.value)} />
            {balingOp && !isEdit && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Info size={11} />From baling operation — edit if only part going to this location</p>}
          </div>
          <div><Label>Approx. Weight / Bale (kg)</Label><Input type="number" min={0} step={0.1} placeholder="e.g. 250" value={form.baleWeightKg} onChange={e => f("baleWeightKg")(e.target.value)} /></div>

          <div className="col-span-2">
            <Label>Moisture at Baling (%)</Label>
            <Input type="number" min={0} max={60} step={0.1} placeholder="%" value={form.moistureAtBaling} onChange={e => f("moistureAtBaling")(e.target.value)} />
            {moisture != null && (
              <div className={`mt-1.5 p-2 rounded text-xs flex gap-1.5 items-start ${risk.colour === "red" ? "bg-red-50 text-red-700" : risk.colour === "amber" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                {risk.colour === "red" ? <AlertTriangle size={13} className="mt-0.5 shrink-0" /> : risk.colour === "amber" ? <AlertCircle size={13} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={13} className="mt-0.5 shrink-0" />}
                <span><strong>{risk.status}:</strong> {risk.message}</span>
              </div>
            )}
          </div>

          <div>
            <Label>Storage Location</Label>
            <input list="straw-locations-list" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder={knownLocations.length > 0 ? "Select or type a location…" : "e.g. Barn 2, Home Farm Yard"}
              value={form.storageLocation} onChange={e => handleStorageLocation(e.target.value)} />
            {knownLocations.length > 0 && <datalist id="straw-locations-list">{knownLocations.map(l => <option key={l.name} value={l.name} />)}</datalist>}
          </div>
          <div>
            <Label>Storage Type</Label>
            <Select value={form.storageType} onValueChange={f("storageType")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STORAGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            {knownLocations.some(l => l.name === form.storageLocation) && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Info size={11} />Auto-set from previous records for this location.</p>}
          </div>
          <div><Label>Stacking Start Date</Label><Input type="date" value={form.stackingStartDate} onChange={e => f("stackingStartDate")(e.target.value)} /></div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={f("status")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="used_on_farm">Used On-Farm</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2 border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Red Tractor / Compliance</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="rt" checked={form.redTractorCertified} onCheckedChange={v => f("redTractorCertified")(!!v)} />
                <Label htmlFor="rt" className="cursor-pointer">Red Tractor Certified</Label>
              </div>
              <div><Label>Passport Ref</Label><Input placeholder="Combinable Crops Passport ref" value={form.combinableCropsPassportRef} onChange={e => f("combinableCropsPassportRef")(e.target.value)} /></div>
              <div>
                <Label>PPP Residue Risk</Label>
                <Select value={form.pppResidueRisk} onValueChange={f("pppResidueRisk")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PPP_RISKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="fus" checked={form.fusariumRiskAssessed} onCheckedChange={v => f("fusariumRiskAssessed")(!!v)} />
                <Label htmlFor="fus" className="cursor-pointer">Fusarium Risk Assessed</Label>
              </div>
            </div>
            {form.strawType === "Wheat Straw" && !form.fusariumRiskAssessed && (
              <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 flex gap-1.5">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />Red Tractor requires a Fusarium mycotoxin risk assessment for wheat straw.
              </p>
            )}
          </div>

          <div className="col-span-2 border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Biomass / Energy Contract</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="bmc" checked={form.biomassContract} onCheckedChange={v => f("biomassContract")(!!v)} />
                <Label htmlFor="bmc" className="cursor-pointer">Biomass Contract</Label>
              </div>
              {form.biomassContract && (<>
                <div><Label>Scheme / Buyer</Label><Input placeholder="e.g. BECS, Drax, AD plant" value={form.biomassScheme} onChange={e => f("biomassScheme")(e.target.value)} /></div>
                <div><Label>Unique Bale Ref</Label><Input placeholder="Scheme reference" value={form.biomassUniqueBaleRef} onChange={e => f("biomassUniqueBaleRef")(e.target.value)} /></div>
              </>)}
            </div>
          </div>

          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending}>{mut.isPending && <Loader2 size={14} className="mr-1 animate-spin" />}{isEdit ? "Save Changes" : "Add Batch"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sales Dialog ─────────────────────────────────────────────────────────────
function SalesDialog({ open, onClose, farmId, editRow, inventory }: { open: boolean; onClose: () => void; farmId: number; editRow?: any; inventory: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;
  const init = {
    baleInventoryId: "", invoiceRef: "", saleDate: today(), deliveryDate: "",
    strawType: "Wheat Straw", baleFormat: "Big Round", quantitySold: "", batchRef: "",
    intendedUse: "Animal Feed", pricePerBalePence: "", buyerName: "",
    buyerAddress: "", buyerPostcode: "", buyerPhone: "", buyerEmail: "",
    buyerType: "Farmer", transportedBy: "Buyer Collects", haulierName: "", vehicleReg: "",
    passportIssued: false, passportRef: "", paymentStatus: "unpaid", paymentDate: "", notes: "",
  };
  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  React.useEffect(() => {
    if (open) {
      if (editRow) {
        setForm({
          baleInventoryId: editRow.baleInventoryId ?? "", invoiceRef: editRow.invoiceRef ?? "",
          saleDate: editRow.saleDate ?? today(), deliveryDate: editRow.deliveryDate ?? "",
          strawType: editRow.strawType ?? "Wheat Straw", baleFormat: editRow.baleFormat ?? "Big Round",
          quantitySold: editRow.quantitySold ?? "", batchRef: editRow.batchRef ?? "",
          intendedUse: editRow.intendedUse ?? "Animal Feed",
          pricePerBalePence: editRow.pricePerBalePence ? (editRow.pricePerBalePence / 100).toFixed(2) : "",
          buyerName: editRow.buyerName ?? "", buyerAddress: editRow.buyerAddress ?? "",
          buyerPostcode: editRow.buyerPostcode ?? "", buyerPhone: editRow.buyerPhone ?? "",
          buyerEmail: editRow.buyerEmail ?? "", buyerType: editRow.buyerType ?? "Farmer",
          transportedBy: editRow.transportedBy ?? "Buyer Collects",
          haulierName: editRow.haulierName ?? "", vehicleReg: editRow.vehicleReg ?? "",
          passportIssued: editRow.passportIssued ?? false, passportRef: editRow.passportRef ?? "",
          paymentStatus: editRow.paymentStatus ?? "unpaid", paymentDate: editRow.paymentDate ?? "",
          notes: editRow.notes ?? "",
        });
      } else { setForm(init); }
    }
  }, [open, editRow]);

  React.useEffect(() => {
    if (form.baleInventoryId) {
      const row = inventory.find((r: any) => r.id === Number(form.baleInventoryId));
      if (row) setForm(p => ({ ...p, strawType: row.strawType ?? p.strawType, baleFormat: row.baleFormat ?? p.baleFormat, batchRef: row.batchRef ?? p.batchRef }));
    }
  }, [form.baleInventoryId]);

  const vatInfo = deriveVatClassification(form.intendedUse);
  const qty = num(form.quantitySold) ?? 0;
  const pricePence = form.pricePerBalePence ? Math.round(Number(form.pricePerBalePence) * 100) : null;
  const totalPence = pricePence && qty ? pricePence * qty : null;
  const vatPence = vatInfo.rate === "20%" && totalPence ? Math.round(totalPence * 0.2) : null;

  const mut = useMutation({
    mutationFn: async (body: any) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-sales/${editRow.id}` : `/api/farms/${farmId}/straw-sales`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-sales", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-analytics", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-inventory", farmId] });
      toast({ title: isEdit ? "Sale updated" : "Sale recorded" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const submit = () => mut.mutate({
    baleInventoryId: form.baleInventoryId ? num(form.baleInventoryId) : null,
    invoiceRef: form.invoiceRef || null, saleDate: form.saleDate,
    deliveryDate: form.deliveryDate || null, strawType: form.strawType,
    baleFormat: form.baleFormat, quantitySold: num(form.quantitySold) ?? 0,
    batchRef: form.batchRef || null, intendedUse: form.intendedUse,
    vatClassification: vatInfo.classification,
    pricePerBalePence: pricePence, totalValuePence: totalPence, vatAmountPence: vatPence,
    buyerName: form.buyerName, buyerAddress: form.buyerAddress || null,
    buyerPostcode: form.buyerPostcode || null, buyerPhone: form.buyerPhone || null,
    buyerEmail: form.buyerEmail || null, buyerType: form.buyerType || null,
    transportedBy: form.transportedBy || null, haulierName: form.haulierName || null,
    vehicleReg: form.vehicleReg || null, passportIssued: form.passportIssued,
    passportRef: form.passportRef || null, paymentStatus: form.paymentStatus,
    paymentDate: form.paymentDate || null, notes: form.notes || null,
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Record"} Straw Sale</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Link to Bale Batch (optional)</Label>
            <Select value={form.baleInventoryId?.toString() ?? ""} onValueChange={f("baleInventoryId")}>
              <SelectTrigger><SelectValue placeholder="Select batch or leave blank" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not linked</SelectItem>
                {inventory.filter((r: any) => r.status === "in_stock").map((r: any) => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.batchRef || `Batch #${r.id}`} — {r.strawType} {r.baleFormat} ({r.quantityRemaining ?? r.quantityBales} remaining)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Invoice Reference</Label><Input placeholder="INV-2026-001" value={form.invoiceRef} onChange={e => f("invoiceRef")(e.target.value)} /></div>
          <div><Label>Sale Date *</Label><Input type="date" value={form.saleDate} onChange={e => f("saleDate")(e.target.value)} /></div>
          <div><Label>Delivery Date</Label><Input type="date" value={form.deliveryDate} onChange={e => f("deliveryDate")(e.target.value)} /></div>
          <div>
            <Label>Straw Type *</Label>
            <Select value={form.strawType} onValueChange={f("strawType")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STRAW_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Bale Format *</Label>
            <Select value={form.baleFormat} onValueChange={f("baleFormat")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BALE_FORMATS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Quantity Sold *</Label><Input type="number" min={1} value={form.quantitySold} onChange={e => f("quantitySold")(e.target.value)} /></div>
          <div><Label>Price per Bale (£)</Label><Input type="number" min={0} step={0.01} placeholder="0.00" value={form.pricePerBalePence} onChange={e => f("pricePerBalePence")(e.target.value)} /></div>
          <div className="col-span-2">
            <Label>Intended Use *</Label>
            <Select value={form.intendedUse} onValueChange={f("intendedUse")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{INTENDED_USES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <div className={`mt-1.5 p-2 rounded text-xs flex gap-1.5 items-start ${vatInfo.rate === "0%" ? "bg-green-50 text-green-700" : vatInfo.rate === "20%" ? "bg-amber-50 text-amber-800" : "bg-gray-50 text-gray-600"}`}>
              {vatInfo.rate === "0%" ? <CheckCircle2 size={13} className="mt-0.5 shrink-0" /> : vatInfo.rate === "20%" ? <AlertTriangle size={13} className="mt-0.5 shrink-0" /> : <Info size={13} className="mt-0.5 shrink-0" />}
              <span><strong>VAT: {vatInfo.classification}</strong>{vatInfo.warning ? ` — ${vatInfo.warning}` : " — no VAT to charge."}</span>
            </div>
            {totalPence != null && (
              <div className="mt-1 grid grid-cols-3 gap-2 text-sm bg-gray-50 rounded p-2">
                <div><span className="text-gray-500 text-xs">Net Total</span><br /><strong>{pToGBP(totalPence)}</strong></div>
                <div><span className="text-gray-500 text-xs">VAT ({vatInfo.rate})</span><br /><strong>{pToGBP(vatPence ?? 0)}</strong></div>
                <div><span className="text-gray-500 text-xs">Gross Total</span><br /><strong>{pToGBP((totalPence ?? 0) + (vatPence ?? 0))}</strong></div>
              </div>
            )}
          </div>
          <div className="col-span-2 border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Buyer Details (EC Reg 178/2002 Traceability)</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Buyer Name *</Label><Input value={form.buyerName} onChange={e => f("buyerName")(e.target.value)} /></div>
              <div>
                <Label>Buyer Type</Label>
                <Select value={form.buyerType} onValueChange={f("buyerType")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BUYER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Address</Label><Input value={form.buyerAddress} onChange={e => f("buyerAddress")(e.target.value)} /></div>
              <div><Label>Postcode</Label><Input value={form.buyerPostcode} onChange={e => f("buyerPostcode")(e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={form.buyerPhone} onChange={e => f("buyerPhone")(e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" value={form.buyerEmail} onChange={e => f("buyerEmail")(e.target.value)} /></div>
            </div>
            {form.buyerType === "Market Gardener" && (
              <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 flex gap-1.5">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />Sales to market gardeners are treated as horticultural use by HMRC — standard-rated at 20% VAT (HMRC VAT Notice 701/15).
              </p>
            )}
          </div>
          <div className="col-span-2 border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Transport</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Transported By</Label>
                <Select value={form.transportedBy} onValueChange={f("transportedBy")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TRANSPORT_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {form.transportedBy === "Third-Party Haulier" && (<>
                <div><Label>Haulier Name</Label><Input value={form.haulierName} onChange={e => f("haulierName")(e.target.value)} /></div>
                <div><Label>Vehicle Reg</Label><Input value={form.vehicleReg} onChange={e => f("vehicleReg")(e.target.value)} /></div>
              </>)}
            </div>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-3 border-t pt-3">
            <div className="flex items-center gap-2 pt-1">
              <Checkbox id="passport" checked={form.passportIssued} onCheckedChange={v => f("passportIssued")(!!v)} />
              <Label htmlFor="passport" className="cursor-pointer">Combinable Crops Passport Issued</Label>
            </div>
            {form.passportIssued && <div><Label>Passport Reference</Label><Input value={form.passportRef} onChange={e => f("passportRef")(e.target.value)} /></div>}
          </div>
          <div>
            <Label>Payment Status</Label>
            <Select value={form.paymentStatus} onValueChange={f("paymentStatus")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PAYMENT_STATUSES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {form.paymentStatus === "paid" && <div><Label>Payment Date</Label><Input type="date" value={form.paymentDate} onChange={e => f("paymentDate")(e.target.value)} /></div>}
          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending || !form.buyerName || !form.quantitySold}>
            {mut.isPending && <Loader2 size={14} className="mr-1 animate-spin" />}{isEdit ? "Save Changes" : "Record Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Moisture Check Dialog ─────────────────────────────────────────────────────
function MoistureDialog({ open, onClose, farmId, editRow, inventory }: { open: boolean; onClose: () => void; farmId: number; editRow?: any; inventory: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;
  const init = {
    baleInventoryId: "", batchRef: "", checkDate: today(), daysFromStacking: "",
    moisturePercent: "", temperatureCelsius: "", odourObserved: false, odourDescription: "",
    overallCondition: "Good", actionTaken: "", checkedBy: "", nextCheckDue: "", notes: "",
  };
  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  React.useEffect(() => {
    if (open) {
      if (editRow) {
        setForm({
          baleInventoryId: editRow.baleInventoryId ?? "", batchRef: editRow.batchRef ?? "",
          checkDate: editRow.checkDate ?? today(), daysFromStacking: editRow.daysFromStacking ?? "",
          moisturePercent: editRow.moisturePercent ?? "", temperatureCelsius: editRow.temperatureCelsius ?? "",
          odourObserved: editRow.odourObserved ?? false, odourDescription: editRow.odourDescription ?? "",
          overallCondition: editRow.overallCondition ?? "Good", actionTaken: editRow.actionTaken ?? "",
          checkedBy: editRow.checkedBy ?? "", nextCheckDue: editRow.nextCheckDue ?? "", notes: editRow.notes ?? "",
        });
      } else { setForm(init); }
    }
  }, [open, editRow]);

  React.useEffect(() => {
    if (form.baleInventoryId) {
      const row = inventory.find((r: any) => r.id === Number(form.baleInventoryId));
      if (row) {
        const days = row.stackingStartDate
          ? Math.floor((new Date(form.checkDate).getTime() - new Date(row.stackingStartDate).getTime()) / 86400000)
          : null;
        setForm(p => ({ ...p, batchRef: row.batchRef ?? p.batchRef, daysFromStacking: days != null ? String(days) : p.daysFromStacking }));
      }
    }
  }, [form.baleInventoryId, form.checkDate]);

  const m = num(form.moisturePercent);
  const selectedBatch = inventory.find((r: any) => r.id === Number(form.baleInventoryId));
  const risk = m != null && selectedBatch ? getMoistureRisk(m, selectedBatch.baleFormat) : null;
  const days = num(form.daysFromStacking);

  const mut = useMutation({
    mutationFn: async (body: any) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-moisture-checks/${editRow.id}` : `/api/farms/${farmId}/straw-moisture-checks`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-moisture", farmId] });
      toast({ title: isEdit ? "Check updated" : "Check recorded" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const submit = () => mut.mutate({
    baleInventoryId: form.baleInventoryId ? num(form.baleInventoryId) : null,
    batchRef: form.batchRef || null, checkDate: form.checkDate,
    daysFromStacking: form.daysFromStacking ? num(form.daysFromStacking) : null,
    moisturePercent: form.moisturePercent || null, temperatureCelsius: form.temperatureCelsius || null,
    odourObserved: form.odourObserved, odourDescription: form.odourDescription || null,
    overallCondition: form.overallCondition, actionTaken: form.actionTaken || null,
    checkedBy: form.checkedBy || null, nextCheckDue: form.nextCheckDue || null, notes: form.notes || null,
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Record"} Moisture / Condition Check</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Bale Batch</Label>
            <Select value={form.baleInventoryId?.toString() ?? ""} onValueChange={f("baleInventoryId")}>
              <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not linked</SelectItem>
                {inventory.map((r: any) => <SelectItem key={r.id} value={String(r.id)}>{r.batchRef || `Batch #${r.id}`} — {r.strawType} {r.baleFormat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Batch Ref</Label><Input value={form.batchRef} onChange={e => f("batchRef")(e.target.value)} /></div>
          <div><Label>Check Date *</Label><Input type="date" value={form.checkDate} onChange={e => f("checkDate")(e.target.value)} /></div>
          <div><Label>Days from Stacking</Label><Input type="number" min={0} value={form.daysFromStacking} onChange={e => f("daysFromStacking")(e.target.value)} /></div>
          {days != null && days <= 14 && (
            <div className="col-span-2 bg-amber-50 text-amber-800 text-xs rounded p-2 flex gap-1.5">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              Day {days} from stacking — within the critical 14-day spontaneous combustion window. Daily monitoring recommended (HSE INDG125).
            </div>
          )}
          <div><Label>Moisture (%)</Label><Input type="number" min={0} max={60} step={0.1} value={form.moisturePercent} onChange={e => f("moisturePercent")(e.target.value)} /></div>
          <div><Label>Temperature (°C)</Label><Input type="number" step={0.1} value={form.temperatureCelsius} onChange={e => f("temperatureCelsius")(e.target.value)} /></div>
          {risk && (
            <div className={`col-span-2 p-2 rounded text-xs flex gap-1.5 items-start ${risk.colour === "red" ? "bg-red-50 text-red-700" : risk.colour === "amber" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
              {risk.colour === "red" ? <AlertTriangle size={13} className="mt-0.5 shrink-0" /> : <AlertCircle size={13} className="mt-0.5 shrink-0" />}
              <span><strong>{risk.status}:</strong> {risk.message}</span>
            </div>
          )}
          <div className="col-span-2 flex items-center gap-3">
            <Checkbox id="odour" checked={form.odourObserved} onCheckedChange={v => f("odourObserved")(!!v)} />
            <Label htmlFor="odour" className="cursor-pointer">Odour Observed (caramel / musty = heating)</Label>
          </div>
          {form.odourObserved && <div className="col-span-2"><Label>Odour Description</Label><Input value={form.odourDescription} onChange={e => f("odourDescription")(e.target.value)} /></div>}
          <div className="col-span-2">
            <Label>Overall Condition</Label>
            <Select value={form.overallCondition} onValueChange={f("overallCondition")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CONDITION_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Action Taken</Label><Input value={form.actionTaken} onChange={e => f("actionTaken")(e.target.value)} /></div>
          <div><Label>Checked By</Label><Input value={form.checkedBy} onChange={e => f("checkedBy")(e.target.value)} /></div>
          <div><Label>Next Check Due</Label><Input type="date" value={form.nextCheckDue} onChange={e => f("nextCheckDue")(e.target.value)} /></div>
          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending}>{mut.isPending && <Loader2 size={14} className="mr-1 animate-spin" />}{isEdit ? "Save" : "Record Check"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StrawManagementPage() {
  const { farmId: rawFarmId } = useAppStore();
  const farmId = rawFarmId!;
  const [tab, setTab] = useState<"baling" | "inventory" | "sales" | "monitoring" | "analytics">("baling");
  const [balingDlg, setBalingDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [journeyDlg, setJourneyDlg] = useState<{ open: boolean; balingOp?: any }>({ open: false });
  const [invDlg, setInvDlg] = useState<{ open: boolean; row?: any; balingOp?: any }>({ open: false });
  const [saleDlg, setSaleDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [moistDlg, setMoistDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [expandedOpId, setExpandedOpId] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: balingOps = [], isLoading: loadBaling } = useQuery<any[]>({
    queryKey: ["straw-baling-ops", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-baling-operations`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: inventory = [], isLoading: loadInv } = useQuery<any[]>({
    queryKey: ["straw-inventory", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-bale-inventory`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: sales = [], isLoading: loadSales } = useQuery<any[]>({
    queryKey: ["straw-sales", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-sales`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: moisture = [], isLoading: loadMoist } = useQuery<any[]>({
    queryKey: ["straw-moisture", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-moisture-checks`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: analytics } = useQuery<any>({
    queryKey: ["straw-analytics", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-analytics`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const delMut = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      const r = await fetch(`/api/farms/${farmId}/${type}/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: (_, { type }) => {
      if (type === "straw-baling-operations") { qc.invalidateQueries({ queryKey: ["straw-baling-ops", farmId] }); setExpandedOpId(null); }
      if (type === "straw-bale-inventory") qc.invalidateQueries({ queryKey: ["straw-inventory", farmId] });
      if (type === "straw-sales") qc.invalidateQueries({ queryKey: ["straw-sales", farmId] });
      if (type === "straw-moisture-checks") qc.invalidateQueries({ queryKey: ["straw-moisture", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-analytics", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // Summary stats
  const totalBalesInField = useMemo(() => balingOps.filter((op: any) => op.status === "open").reduce((s: number, op: any) => s + (op.balingBalance ?? 0), 0), [balingOps]);
  const totalBalesInStock = useMemo(() => inventory.filter((r: any) => r.status === "in_stock").reduce((s: number, r: any) => s + (r.quantityRemaining ?? r.quantityBales ?? 0), 0), [inventory]);
  const totalSalesValue = useMemo(() => sales.reduce((s: number, r: any) => s + (r.totalValuePence ?? 0), 0), [sales]);
  const unpaidSales = useMemo(() => sales.filter((r: any) => r.paymentStatus === "unpaid" || r.paymentStatus === "overdue").reduce((s: number, r: any) => s + (r.totalValuePence ?? 0), 0), [sales]);
  const actionRequired = useMemo(() => inventory.filter((r: any) => r.moistureStatus === "Action Required" || r.moistureStatus === "Warning").length, [inventory]);
  const openOps = useMemo(() => balingOps.filter((op: any) => op.status === "open").length, [balingOps]);

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Wheat size={24} className="text-amber-600" /> Straw Management</h1>
            <p className="text-sm text-gray-500 mt-1">Baling operations, cartage journeys, batch inventory, sales and fire safety</p>
          </div>
          <div className="flex gap-2">
            {tab === "baling" && <Button onClick={() => setBalingDlg({ open: true })}><Plus size={15} className="mr-1" />Record Baling Op</Button>}
            {tab === "inventory" && <Button onClick={() => setInvDlg({ open: true })}><Plus size={15} className="mr-1" />Add Batch</Button>}
            {tab === "sales" && <Button onClick={() => setSaleDlg({ open: true })}><Plus size={15} className="mr-1" />Record Sale</Button>}
            {tab === "monitoring" && <Button onClick={() => setMoistDlg({ open: true })}><Plus size={15} className="mr-1" />Record Check</Button>}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className={`bg-white rounded-xl border p-4 ${openOps > 0 ? "border-amber-300" : ""}`}>
            <div className="flex items-center gap-2 mb-1"><Tractor size={16} className="text-amber-600" /><span className="text-xs text-gray-500 font-medium">Open Baling Ops</span></div>
            <div className={`text-2xl font-bold ${openOps > 0 ? "text-amber-600" : ""}`}>{openOps}</div>
          </div>
          <div className={`bg-white rounded-xl border p-4 ${totalBalesInField > 0 ? "border-amber-300" : ""}`}>
            <div className="flex items-center gap-2 mb-1"><MapPin size={16} className={totalBalesInField > 0 ? "text-amber-500" : "text-gray-400"} /><span className="text-xs text-gray-500 font-medium">Bales in Field</span></div>
            <div className={`text-2xl font-bold ${totalBalesInField > 0 ? "text-amber-600" : ""}`}>{totalBalesInField.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-1"><Package size={16} className="text-green-600" /><span className="text-xs text-gray-500 font-medium">Bales in Storage</span></div>
            <div className="text-2xl font-bold">{totalBalesInStock.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-1"><PoundSterling size={16} className="text-blue-600" /><span className="text-xs text-gray-500 font-medium">Total Sales (net)</span></div>
            <div className="text-2xl font-bold">{pToGBP(totalSalesValue)}</div>
          </div>
          <div className={`bg-white rounded-xl border p-4 ${actionRequired > 0 ? "border-red-300" : ""}`}>
            <div className="flex items-center gap-2 mb-1"><AlertTriangle size={16} className={actionRequired > 0 ? "text-red-600" : "text-gray-400"} /><span className="text-xs text-gray-500 font-medium">Fire Risk Alerts</span></div>
            <div className={`text-2xl font-bold ${actionRequired > 0 ? "text-red-600" : ""}`}>{actionRequired}</div>
          </div>
        </div>

        {/* Tabs */}
        <TabBar className="mb-4">
          <TabButton active={tab === "baling"} onClick={() => setTab("baling")}><Tractor size={14} className="mr-1" />Baling</TabButton>
          <TabButton active={tab === "inventory"} onClick={() => setTab("inventory")}><Package size={14} className="mr-1" />Inventory (Batches)</TabButton>
          <TabButton active={tab === "sales"} onClick={() => setTab("sales")}><PoundSterling size={14} className="mr-1" />Sales</TabButton>
          <TabButton active={tab === "monitoring"} onClick={() => setTab("monitoring")}><Thermometer size={14} className="mr-1" />Fire Safety</TabButton>
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}><BarChart3 size={14} className="mr-1" />Analytics</TabButton>
        </TabBar>

        {/* ── Baling Operations tab ── */}
        {tab === "baling" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex gap-3">
              <Wheat size={18} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Three-phase straw workflow:</strong>
                <span className="ml-1">① Record baling operation (machine output per field)</span>
                <span className="mx-1 text-amber-500">→</span>
                <span>② Log each cartage journey (field to storage, with running balance)</span>
                <span className="mx-1 text-amber-500">→</span>
                <span>③ Create inventory batch for each storage location</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border overflow-hidden">
              {loadBaling ? (
                <div className="p-8 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Loading…</div>
              ) : balingOps.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Tractor size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No baling operations recorded</p>
                  <p className="text-sm mt-1">Start by recording your first baling session on a field.</p>
                  <Button className="mt-4" onClick={() => setBalingDlg({ open: true })}><Plus size={15} className="mr-1" />Record First Baling Op</Button>
                </div>
              ) : (
                <div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>{["", "Date", "Field", "Type / Format", "Produced", "Moved", "In Field", "Status", "Weather", "Operator", ""].map((h, i) => (
                        <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {balingOps.map((op: any) => {
                        const isExpanded = expandedOpId === op.id;
                        return (
                          <React.Fragment key={op.id}>
                            <tr className={`border-t hover:bg-gray-50 ${isExpanded ? "bg-amber-50/40" : ""}`}>
                              <td className="px-3 py-3">
                                <button
                                  onClick={() => setExpandedOpId(isExpanded ? null : op.id)}
                                  className="p-1 rounded hover:bg-amber-100 text-gray-500"
                                  title={isExpanded ? "Hide journeys" : "Show journeys"}
                                >
                                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">{fmtDate(op.operationDate)}</td>
                              <td className="px-4 py-3 font-medium max-w-[140px] truncate">{op.fieldOfOrigin || "—"}</td>
                              <td className="px-4 py-3 text-gray-600">{op.strawType}<br /><span className="text-xs">{op.baleFormat}</span></td>
                              <td className="px-4 py-3 font-semibold">{(op.totalBalesProduced ?? 0).toLocaleString()}</td>
                              <td className="px-4 py-3 text-green-700 font-semibold">{(op.balesMoved ?? 0).toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={`font-bold ${(op.balingBalance ?? 0) > 0 ? "text-amber-600" : "text-green-600"}`}>{(op.balingBalance ?? 0).toLocaleString()}</span>
                              </td>
                              <td className="px-4 py-3"><BalingStatusBadge status={op.status} balance={op.balingBalance ?? 0} /></td>
                              <td className="px-4 py-3 text-gray-500 text-xs">{op.weatherConditions || "—"}{op.temperatureC ? ` · ${Number(op.temperatureC).toFixed(0)}°C` : ""}</td>
                              <td className="px-4 py-3 text-gray-600">{op.operatorName || "—"}</td>
                              <td className="px-4 py-3">
                                <div className="flex gap-1 flex-nowrap">
                                  <button
                                    onClick={() => setJourneyDlg({ open: true, balingOp: op })}
                                    title="Add cartage journey"
                                    className="p-1.5 rounded hover:bg-amber-100 text-amber-700 text-xs font-medium flex items-center gap-1"
                                  >
                                    <Truck size={13} />
                                  </button>
                                  <button
                                    onClick={() => setInvDlg({ open: true, balingOp: op })}
                                    title="Create inventory batch from this op"
                                    className="p-1.5 rounded hover:bg-green-100 text-green-700 flex items-center gap-1"
                                  >
                                    <Package size={13} />
                                  </button>
                                  <button onClick={() => setBalingDlg({ open: true, row: op })} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil size={13} /></button>
                                  <button onClick={() => { if (confirm("Delete this baling operation and all its journeys?")) delMut.mutate({ type: "straw-baling-operations", id: op.id }); }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={13} /></button>
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={11} className="p-0">
                                  <CartageJourneysPanel
                                    farmId={farmId}
                                    balingOp={op}
                                    onAddJourney={() => setJourneyDlg({ open: true, balingOp: op })}
                                  />
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Inventory tab ── */}
        {tab === "inventory" && (
          <div className="bg-white rounded-xl border overflow-hidden">
            {loadInv ? <div className="p-8 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Loading…</div> : inventory.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Package size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No straw batches recorded</p>
                <p className="text-sm mt-1">Batches are typically created from a baling operation via the Baling tab — or add one manually here.</p>
                <Button className="mt-4" onClick={() => setInvDlg({ open: true })}><Plus size={15} className="mr-1" />Add Batch</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>{["Batch Ref", "Type", "Format", "Harvest Date", "Qty (Total)", "Remaining", "Moisture", "Storage", "Status", "RT", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {inventory.map((r: any) => {
                      const risk = getMoistureRisk(r.moistureAtBaling ? Number(r.moistureAtBaling) : null, r.baleFormat);
                      return (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs">{r.batchRef || <span className="text-gray-400">#{r.id}</span>}</td>
                          <td className="px-4 py-3">{r.strawType}</td>
                          <td className="px-4 py-3 text-gray-600">{r.baleFormat}</td>
                          <td className="px-4 py-3">{fmtDate(r.harvestDate)}</td>
                          <td className="px-4 py-3 font-semibold">{r.quantityBales?.toLocaleString()}</td>
                          <td className="px-4 py-3">{r.quantityRemaining ?? r.quantityBales}</td>
                          <td className="px-4 py-3">
                            {r.moistureAtBaling ? (
                              <span className={`text-xs font-medium ${risk.colour === "red" ? "text-red-600" : risk.colour === "amber" ? "text-amber-600" : "text-green-600"}`}>
                                {Number(r.moistureAtBaling).toFixed(1)}%
                                {risk.colour !== "green" && <AlertTriangle size={11} className="inline ml-1" />}
                              </span>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{r.storageLocation || "—"}</td>
                          <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-3">{r.redTractorCertified ? <span title="Red Tractor Certified"><ShieldCheck size={15} className="text-green-600" /></span> : <X size={14} className="text-gray-300" />}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setInvDlg({ open: true, row: r })} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil size={14} /></button>
                              <button onClick={() => { if (confirm("Delete this batch?")) delMut.mutate({ type: "straw-bale-inventory", id: r.id }); }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Sales tab ── */}
        {tab === "sales" && (
          <div className="bg-white rounded-xl border overflow-hidden">
            {loadSales ? <div className="p-8 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Loading…</div> : sales.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <PoundSterling size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No straw sales recorded</p>
                <p className="text-sm mt-1">Record your first sale to track revenue, VAT, and buyer traceability.</p>
                <Button className="mt-4" onClick={() => setSaleDlg({ open: true })}><Plus size={15} className="mr-1" />Record First Sale</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>{["Invoice", "Date", "Type / Format", "Qty", "Buyer", "Use / VAT", "Net Value", "VAT", "Gross", "Transport", "Payment", "Passport", ""].map(h => <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {sales.map((r: any) => {
                      const vat = deriveVatClassification(r.intendedUse);
                      const gross = (r.totalValuePence ?? 0) + (r.vatAmountPence ?? 0);
                      return (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-3 py-3 font-mono text-xs">{r.invoiceRef || <span className="text-gray-400">—</span>}</td>
                          <td className="px-3 py-3">{fmtDate(r.saleDate)}</td>
                          <td className="px-3 py-3">{r.strawType}<br /><span className="text-xs text-gray-500">{r.baleFormat}</span></td>
                          <td className="px-3 py-3 font-semibold">{r.quantitySold}</td>
                          <td className="px-3 py-3 max-w-[140px]">
                            <div className="font-medium truncate">{r.buyerName}</div>
                            <div className="text-xs text-gray-500">{r.buyerType}</div>
                          </td>
                          <td className="px-3 py-3">
                            <div>{r.intendedUse}</div>
                            <span className={`text-xs font-semibold ${vat.rate === "0%" ? "text-green-700" : "text-amber-700"}`}>{vat.rate} VAT</span>
                          </td>
                          <td className="px-3 py-3">{pToGBP(r.totalValuePence)}</td>
                          <td className="px-3 py-3">{pToGBP(r.vatAmountPence)}</td>
                          <td className="px-3 py-3 font-semibold">{pToGBP(gross || r.totalValuePence)}</td>
                          <td className="px-3 py-3 text-xs text-gray-600">{r.transportedBy || "—"}</td>
                          <td className="px-3 py-3"><StatusBadge status={r.paymentStatus} /></td>
                          <td className="px-3 py-3">{r.passportIssued ? <span title={r.passportRef || "Passport issued"}><FileCheck size={15} className="text-green-600" /></span> : <X size={14} className="text-gray-300" />}</td>
                          <td className="px-3 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setSaleDlg({ open: true, row: r })} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil size={14} /></button>
                              <button onClick={() => { if (confirm("Delete this sale record?")) delMut.mutate({ type: "straw-sales", id: r.id }); }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Fire Safety tab ── */}
        {tab === "monitoring" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex gap-3">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>HSE INDG125 — Fire Safety Monitoring</strong><br />
                Monitor straw bales for the first <strong>10–14 days</strong> from stacking (spontaneous combustion window). Safe moisture limits: <strong>≤22%</strong> for small rectangular bales, <strong>≤18%</strong> for large round or square. Record checks daily initially, then every 2–3 days.
              </div>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
              {loadMoist ? <div className="p-8 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Loading…</div> : moisture.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Thermometer size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No monitoring checks recorded</p>
                  <Button className="mt-4" onClick={() => setMoistDlg({ open: true })}><Plus size={15} className="mr-1" />Record First Check</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>{["Batch", "Date", "Day #", "Moisture", "Temp (°C)", "Odour", "Condition", "Action Taken", "Checked By", "Next Due", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y">
                      {moisture.map((r: any) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs">{r.batchRef || "—"}</td>
                          <td className="px-4 py-3">{fmtDate(r.checkDate)}</td>
                          <td className="px-4 py-3">{r.daysFromStacking != null ? <span className={`${r.daysFromStacking <= 14 ? "font-semibold text-amber-700" : "text-gray-600"}`}>Day {r.daysFromStacking}</span> : "—"}</td>
                          <td className="px-4 py-3">{r.moisturePercent ? `${Number(r.moisturePercent).toFixed(1)}%` : "—"}</td>
                          <td className="px-4 py-3">{r.temperatureCelsius ? `${Number(r.temperatureCelsius).toFixed(1)}°C` : "—"}</td>
                          <td className="px-4 py-3">{r.odourObserved ? <span className="text-amber-600 font-medium text-xs">Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                          <td className="px-4 py-3"><ConditionBadge cond={r.overallCondition} /></td>
                          <td className="px-4 py-3 max-w-[160px] truncate text-gray-600">{r.actionTaken || "—"}</td>
                          <td className="px-4 py-3 text-gray-600">{r.checkedBy || "—"}</td>
                          <td className="px-4 py-3">{fmtDate(r.nextCheckDue)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setMoistDlg({ open: true, row: r })} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil size={14} /></button>
                              <button onClick={() => { if (confirm("Delete this check?")) delMut.mutate({ type: "straw-moisture-checks", id: r.id }); }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Analytics tab ── */}
        {tab === "analytics" && (
          <div className="space-y-6">
            {!analytics ? (
              <div className="p-8 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto" /></div>
            ) : (
              <>
                {analytics.inventoryByType?.length > 0 && (
                  <div className="bg-white rounded-xl border p-5">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Package size={16} />Current Inventory by Straw Type</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={analytics.inventoryByType} margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="strawType" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: any) => [`${v} bales`, "In Stock"]} />
                        <Bar dataKey="totalBales" fill="#d97706" radius={[4, 4, 0, 0]} name="Bales" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {analytics.salesByUse?.length > 0 && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border p-5">
                      <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><PoundSterling size={16} />Sales Revenue by Intended Use (Net)</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={analytics.salesByUse} dataKey="totalNetPence" nameKey="intendedUse" cx="50%" cy="50%" outerRadius={75} label={({ intendedUse, percent }: any) => `${intendedUse} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {analytics.salesByUse.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => pToGBP(v)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="bg-white rounded-xl border p-5">
                      <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Scale size={16} />VAT Summary</h3>
                      <div className="space-y-3">
                        {analytics.vatSummary?.map((v: any) => (
                          <div key={v.vatClassification} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                            <div><div className="font-medium text-sm">{v.vatClassification}</div><div className="text-xs text-gray-500">{v.count} sale{v.count !== 1 ? "s" : ""}</div></div>
                            <div className="text-right"><div className="font-semibold">{pToGBP(v.totalNetPence)}</div><div className="text-xs text-gray-500">VAT: {pToGBP(v.totalVatPence)}</div></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {analytics.monthlySales?.length > 0 && (
                  <div className="bg-white rounded-xl border p-5">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><TrendingUp size={16} />Monthly Sales (Net Revenue)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={analytics.monthlySales} margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v: number) => `£${(v / 100).toFixed(0)}`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => [pToGBP(v), "Net Revenue"]} />
                        <Line type="monotone" dataKey="totalPence" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><ShieldCheck size={16} />Compliance Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "RT Certified Batches", value: analytics.redTractorCount ?? 0, total: inventory.length, icon: <ShieldCheck size={16} className="text-green-600" /> },
                      { label: "Passports Issued", value: analytics.passportCount ?? 0, total: sales.length, icon: <FileCheck size={16} className="text-blue-600" /> },
                      { label: "Fusarium Assessed", value: analytics.fusariumCount ?? 0, total: inventory.filter((r: any) => r.strawType === "Wheat Straw").length, icon: <CheckCircle2 size={16} className="text-amber-600" /> },
                      { label: "Fire Risk Alerts", value: actionRequired, total: inventory.length, icon: <AlertTriangle size={16} className={actionRequired > 0 ? "text-red-600" : "text-gray-400"} /> },
                    ].map(c => (
                      <div key={c.label} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">{c.icon}<span className="text-xs text-gray-600 font-medium">{c.label}</span></div>
                        <div className="font-bold">{c.value}{c.total > 0 ? ` / ${c.total}` : ""}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <BalingDialog open={balingDlg.open} onClose={() => setBalingDlg({ open: false })} farmId={farmId} editRow={balingDlg.row} />
      <CartageDialog
        open={journeyDlg.open}
        onClose={() => setJourneyDlg({ open: false })}
        farmId={farmId}
        balingOp={journeyDlg.balingOp}
      />
      <InventoryDialog
        open={invDlg.open}
        onClose={() => setInvDlg({ open: false })}
        farmId={farmId}
        editRow={invDlg.row}
        existingInventory={inventory}
        balingOp={invDlg.balingOp}
      />
      <SalesDialog open={saleDlg.open} onClose={() => setSaleDlg({ open: false })} farmId={farmId} editRow={saleDlg.row} inventory={inventory} />
      <MoistureDialog open={moistDlg.open} onClose={() => setMoistDlg({ open: false })} farmId={farmId} editRow={moistDlg.row} inventory={inventory} />
    </AppLayout>
  );
}
