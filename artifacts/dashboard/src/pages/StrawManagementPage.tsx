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
  CloudSun, Tractor, MapPin, Gauge, Calendar, BadgeCheck,
  Flame, Zap, HardHat, ClipboardList, SquareCheck
} from "lucide-react";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";

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
const BIOMASS_SCHEMES = [
  "Drax Power", "MGT Power (Teesside)", "Lynemouth Power", "EPH Biomass",
  "BECS (Biomass Energy Crop Scheme)", "RHI — Own installation",
  "AD Plant (Anaerobic Digestion)", "SARIA / Organic Processors",
  "ENplus Certified Scheme", "Straw to Energy — Direct Offtake", "Other",
];
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

function meterCalStatus(nextDue: string | null | undefined): { label: string; colour: string } {
  if (!nextDue) return { label: "No Cal", colour: "gray" };
  const days = Math.floor((new Date(nextDue).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "Overdue", colour: "red" };
  if (days <= 30) return { label: `Due ${fmtDate(nextDue)}`, colour: "amber" };
  return { label: "Current", colour: "green" };
}

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
    operatorSupplierId: null as number | null,
    machineHours: "", labourHours: "",
    weatherConditions: "", temperatureC: "", windSpeedKmh: "", soilConditions: "",
    notes: "",
  };
  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  const { data: fields = [] } = useQuery<any[]>({
    queryKey: ["fields", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/fields`, { credentials: "include" }); return r.ok ? r.json() : []; },
    select: (d: any) => Array.isArray(d) ? d : (d?.records ?? []),
    enabled: open && !!farmId, staleTime: 60_000,
  });
  const { data: equipment = [] } = useQuery<any[]>({
    queryKey: ["equipment", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/equipment`, { credentials: "include" }); return r.ok ? r.json() : []; },
    select: (d: any) => Array.isArray(d) ? d : (d?.records ?? []),
    enabled: open && !!farmId, staleTime: 60_000,
  });

  const { data: fieldCrops = [] } = useQuery<any[]>({
    queryKey: ["field-crops", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/field-crops`, { credentials: "include" }); return r.ok ? r.json() : []; },
    select: (d: any) => Array.isArray(d) ? d : (d?.records ?? []),
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
        operatorSupplierId: editRow.operatorSupplierId ?? null,
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

  // Auto-fill field name, area, straw type and crop variety when a field is selected
  React.useEffect(() => {
    if (!form.fieldId) return;
    const fid = Number(form.fieldId);
    const field = fields.find((fld: any) => fld.id === fid);
    if (!field) return;
    // Find the most recent crop assignment for this field
    const assignments = fieldCrops.filter((fc: any) => fc.fieldId === fid);
    const latest = assignments.sort((a: any, b: any) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )[0];
    const cropName: string = latest?.cropName ?? "";
    const strawTypeFromCrop = (() => {
      const n = cropName.toLowerCase();
      if (n.includes("wheat")) return "Wheat Straw";
      if (n.includes("barley")) return "Barley Straw";
      if (n.includes("oat")) return "Oat Straw";
      if (n.includes("oilseed") || n.includes("rape") || n.includes("osr")) return "Oilseed Rape Straw";
      return null;
    })();
    setForm(p => ({
      ...p,
      fieldOfOrigin: field.name ?? p.fieldOfOrigin,
      areaHa: p.areaHa || String(field.computedFarmableAreaHa ?? field.areaHectares ?? "") || p.areaHa,
      strawType: p.strawType === "Wheat Straw" && strawTypeFromCrop ? strawTypeFromCrop : (strawTypeFromCrop ?? p.strawType),
      cropVariety: p.cropVariety || (latest?.variety ?? "") || p.cropVariety,
    }));
  }, [form.fieldId, fields, fieldCrops]);

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
      operatorSupplierId: form.operatorSupplierId,
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
              <div><Label>Operator Name</Label><BuyerCombobox farmId={farmId} types={["contractor", "general"]} valueId={form.operatorSupplierId} valueName={form.operatorName} onChange={(id, name) => setForm(p => ({ ...p, operatorSupplierId: id, operatorName: name }))} /></div>
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
    operatorSupplierId: null as number | null,
    tractorDescription: "", trailerDescription: "",
    balesMoved: "", fromLocation: balingOp?.fieldOfOrigin ?? "",
    toLocation: "", toStorageType: "Indoor", notes: "",
  };
  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  const { data: equipment = [] } = useQuery<any[]>({
    queryKey: ["equipment", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/equipment`, { credentials: "include" }); return r.ok ? r.json() : []; },
    select: (d: any) => Array.isArray(d) ? d : (d?.records ?? []),
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
        operatorSupplierId: editRow.operatorSupplierId ?? null,
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
      operatorSupplierId: form.operatorSupplierId,
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
            <BuyerCombobox farmId={farmId} types={["contractor", "general"]} valueId={form.operatorSupplierId} valueName={form.operatorName} onChange={(id, name) => setForm(p => ({ ...p, operatorSupplierId: id, operatorName: name }))} />
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
    select: (d: any) => Array.isArray(d) ? d : (d?.records ?? []),
    enabled: open && !!farmId, staleTime: 60_000,
  });
  const { data: fieldCrops = [] } = useQuery<any[]>({
    queryKey: ["field-crops", farmId],
    queryFn: async () => { const r = await fetch(`/api/farms/${farmId}/field-crops`, { credentials: "include" }); return r.ok ? r.json() : []; },
    select: (d: any) => Array.isArray(d) ? d : (d?.records ?? []),
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
    const fid = Number(form.fieldId);
    const field = fields.find((fld: any) => fld.id === fid);
    if (!field) return;
    const crops: any[] = fieldCrops.filter((c: any) => c.fieldId === fid);
    const latest = crops.sort((a: any, b: any) =>
      new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
    )[0];
    const cropName: string = latest?.cropName ?? "";
    const strawTypeFromCrop = (() => {
      const n = cropName.toLowerCase();
      if (n.includes("wheat")) return "Wheat Straw";
      if (n.includes("barley")) return "Barley Straw";
      if (n.includes("oat")) return "Oat Straw";
      if (n.includes("oilseed") || n.includes("rape") || n.includes("osr")) return "Oilseed Rape Straw";
      return null;
    })();
    const variety = latest?.varietyName || latest?.cropVariety || latest?.variety || "";
    setForm(p => ({
      ...p,
      fieldOfOrigin: field.name ?? p.fieldOfOrigin,
      ...(strawTypeFromCrop ? { strawType: strawTypeFromCrop } : {}),
      ...(variety && !p.cropVariety ? { cropVariety: variety } : {}),
    }));
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
          {!balingOp && !isEdit && (
            <div className="col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex gap-2">
              <Package size={16} className="shrink-0 mt-0.5 text-blue-600" />
              <span>This registers a batch of straw bales in your inventory. If you've already recorded a <strong>Baling Operation</strong> for this harvest, click <strong>Add Batch</strong> from that row instead — it will pre-fill this form automatically. Use this standalone form for bales already in storage that have no linked baling record.</span>
            </div>
          )}
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
            <div className="grid grid-cols-3 gap-4 items-start">
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="rt" checked={form.redTractorCertified} onCheckedChange={v => f("redTractorCertified")(!!v)} />
                <Label htmlFor="rt" className="cursor-pointer">Red Tractor Certified</Label>
              </div>
              {form.redTractorCertified ? (
                <div><Label>Combinable Crops Passport Ref</Label><Input placeholder="e.g. BRM-2026-XXXX" value={form.combinableCropsPassportRef} onChange={e => f("combinableCropsPassportRef")(e.target.value)} /></div>
              ) : <div />}
              <div>
                <Label>PPP Residue Risk</Label>
                <Select value={form.pppResidueRisk} onValueChange={f("pppResidueRisk")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PPP_RISKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {form.strawType === "Wheat Straw" && (
                <div className="flex items-center gap-2 pt-1 col-span-1">
                  <Checkbox id="fus" checked={form.fusariumRiskAssessed} onCheckedChange={v => f("fusariumRiskAssessed")(!!v)} />
                  <Label htmlFor="fus" className="cursor-pointer">Fusarium Risk Assessed</Label>
                </div>
              )}
            </div>
            {form.strawType === "Wheat Straw" && !form.fusariumRiskAssessed && (
              <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 flex gap-1.5 items-start">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />Red Tractor requires a Fusarium mycotoxin risk assessment for wheat straw. This is a documented agronomic review covering field signs, fungicide programme, and season weather — tick once the assessment has been completed and recorded.
              </p>
            )}
            {form.strawType === "Wheat Straw" && form.fusariumRiskAssessed && (
              <p className="mt-2 text-xs text-green-700 bg-green-50 rounded px-2 py-1.5 flex gap-1.5 items-center">
                <CheckCircle2 size={13} className="shrink-0" />Fusarium risk assessment recorded for this wheat straw batch.
              </p>
            )}
          </div>

          <div className="col-span-2 border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Biomass / Energy Contract</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="bmc" checked={form.biomassContract} onCheckedChange={v => f("biomassContract")(!!v)} />
                <Label htmlFor="bmc" className="cursor-pointer">Biomass / Energy Contract</Label>
              </div>
              {form.biomassContract && (<>
                <div>
                  <Label>Scheme / Buyer</Label>
                  <input list="biomass-schemes-list"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Select or type scheme / buyer…"
                    value={form.biomassScheme} onChange={e => f("biomassScheme")(e.target.value)} />
                  <datalist id="biomass-schemes-list">{BIOMASS_SCHEMES.map(s => <option key={s} value={s} />)}</datalist>
                </div>
                <div><Label>Unique Bale / Scheme Ref</Label><Input placeholder="Scheme batch ID or reference" value={form.biomassUniqueBaleRef} onChange={e => f("biomassUniqueBaleRef")(e.target.value)} /></div>
              </>)}
            </div>
            {form.biomassContract && (
              <p className="mt-2 text-xs text-blue-700 bg-blue-50 rounded px-2 py-1.5 flex gap-1.5 items-start">
                <Info size={13} className="mt-0.5 shrink-0" />Straw supplied under a biomass or energy contract may be subject to sustainability criteria and scheme traceability requirements. Ensure the unique bale reference matches your contract documentation.
              </p>
            )}
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
    buyerType: "Farmer", transportedBy: "Buyer Collects", haulierName: "", haulierSupplierId: null as number | null, vehicleReg: "",
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
          haulierName: editRow.haulierName ?? "", haulierSupplierId: editRow.haulierSupplierId ?? null, vehicleReg: editRow.vehicleReg ?? "",
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
    transportedBy: form.transportedBy || null, haulierName: form.haulierName || null, haulierSupplierId: form.haulierSupplierId ?? null,
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
                <div><Label>Haulier Name</Label><BuyerCombobox farmId={farmId} types={["contractor", "general"]} valueId={form.haulierSupplierId ?? null} valueName={form.haulierName} onChange={(id, name) => setForm(p => ({ ...p, haulierSupplierId: id, haulierName: name }))} /></div>
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

// ─── Meter Calibration History ────────────────────────────────────────────────
function MeterCalHistory({ farmId, meter, onLogCal, onEdit, onDelete }: {
  farmId: number; meter: any;
  onLogCal: () => void; onEdit: (row: any) => void; onDelete: (id: number) => void;
}) {
  const { data: cals = [], isLoading } = useQuery<any[]>({
    queryKey: ["straw-meter-cals", farmId, meter.id],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-moisture-meters/${meter.id}/calibrations`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  if (isLoading) return <div className="px-12 py-3 text-center text-xs text-gray-400"><Loader2 size={13} className="animate-spin inline mr-1" />Loading…</div>;
  return (
    <div className="bg-gray-50 border-t px-5 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-600">Calibration History</span>
        <button onClick={onLogCal} className="text-xs text-blue-600 hover:underline flex items-center gap-1"><Plus size={11} />Log Calibration</button>
      </div>
      {cals.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No calibrations recorded yet.</p>
      ) : (
        <table className="w-full text-xs">
          <thead><tr className="text-gray-500">{["Date", "Performed By", "Method", "Result", "Cert Ref", "Next Due", ""].map(h => <th key={h} className="text-left pb-1 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100">
            {cals.map((c: any) => (
              <tr key={c.id} className="hover:bg-white">
                <td className="py-1.5 pr-3">{fmtDate(c.calibrationDate)}</td>
                <td className="py-1.5 pr-3 text-gray-600">{c.performedBy || "—"}</td>
                <td className="py-1.5 pr-3 text-gray-600">{c.method || "—"}</td>
                <td className="py-1.5 pr-3">
                  <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${c.result === "Pass" ? "bg-green-100 text-green-700" : c.result === "Fail" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{c.result}</span>
                </td>
                <td className="py-1.5 pr-3 text-gray-600">{c.certificateRef || "—"}</td>
                <td className="py-1.5 pr-3">{fmtDate(c.nextDue)}</td>
                <td className="py-1.5">
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(c)} className="p-0.5 rounded hover:bg-gray-200 text-gray-500"><Pencil size={11} /></button>
                    <button onClick={() => { if (confirm("Delete this calibration record?")) onDelete(c.id); }} className="p-0.5 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"><Trash2 size={11} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Meter Register Dialog ─────────────────────────────────────────────────────
function MeterDialog({ open, onClose, farmId, editRow }: { open: boolean; onClose: () => void; farmId: number; editRow?: any }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;
  const init = {
    deviceName: "", make: "", model: "", serialNumber: "", purchaseDate: "",
    lastCalibrationDate: "", nextCalibrationDue: "", calibrationIntervalMonths: "12", notes: "", isActive: true,
  };
  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  React.useEffect(() => {
    if (open) {
      if (editRow) {
        setForm({
          deviceName: editRow.deviceName ?? "", make: editRow.make ?? "", model: editRow.model ?? "",
          serialNumber: editRow.serialNumber ?? "", purchaseDate: editRow.purchaseDate ?? "",
          lastCalibrationDate: editRow.lastCalibrationDate ?? "", nextCalibrationDue: editRow.nextCalibrationDue ?? "",
          calibrationIntervalMonths: editRow.calibrationIntervalMonths != null ? String(editRow.calibrationIntervalMonths) : "12",
          notes: editRow.notes ?? "", isActive: editRow.isActive ?? true,
        });
      } else { setForm(init); }
    }
  }, [open, editRow]);

  React.useEffect(() => {
    if (form.lastCalibrationDate && form.calibrationIntervalMonths) {
      const d = new Date(form.lastCalibrationDate);
      d.setMonth(d.getMonth() + Number(form.calibrationIntervalMonths));
      setForm(p => ({ ...p, nextCalibrationDue: d.toISOString().slice(0, 10) }));
    }
  }, [form.lastCalibrationDate, form.calibrationIntervalMonths]);

  const mut = useMutation({
    mutationFn: async (body: any) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-moisture-meters/${editRow.id}` : `/api/farms/${farmId}/straw-moisture-meters`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-meters", farmId] });
      toast({ title: isEdit ? "Meter updated" : "Meter added to register" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const submit = () => {
    if (!form.deviceName.trim()) { toast({ title: "Device name is required", variant: "destructive" }); return; }
    mut.mutate({
      deviceName: form.deviceName.trim(), make: form.make || null, model: form.model || null,
      serialNumber: form.serialNumber || null, purchaseDate: form.purchaseDate || null,
      lastCalibrationDate: form.lastCalibrationDate || null, nextCalibrationDue: form.nextCalibrationDue || null,
      calibrationIntervalMonths: form.calibrationIntervalMonths ? Number(form.calibrationIntervalMonths) : 12,
      notes: form.notes || null, isActive: form.isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Add"} Moisture Meter</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label>Device Name / Label *</Label>
            <Input placeholder="e.g. Barn Meter 1, Field Kit" value={form.deviceName} onChange={e => f("deviceName")(e.target.value)} />
          </div>
          <div><Label>Make</Label><Input placeholder="e.g. Wile, Protimeter" value={form.make} onChange={e => f("make")(e.target.value)} /></div>
          <div><Label>Model</Label><Input placeholder="e.g. Wile 55" value={form.model} onChange={e => f("model")(e.target.value)} /></div>
          <div className="col-span-2"><Label>Serial Number</Label><Input value={form.serialNumber} onChange={e => f("serialNumber")(e.target.value)} /></div>
          <div><Label>Purchase Date</Label><Input type="date" value={form.purchaseDate} onChange={e => f("purchaseDate")(e.target.value)} /></div>
          <div><Label>Cal. Interval (months)</Label><Input type="number" min={1} max={120} value={form.calibrationIntervalMonths} onChange={e => f("calibrationIntervalMonths")(e.target.value)} /></div>
          <div><Label>Last Calibration Date</Label><Input type="date" value={form.lastCalibrationDate} onChange={e => f("lastCalibrationDate")(e.target.value)} /></div>
          <div><Label>Next Calibration Due</Label><Input type="date" value={form.nextCalibrationDue} onChange={e => f("nextCalibrationDue")(e.target.value)} /></div>
          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
          <div className="col-span-2 flex items-center gap-3">
            <Checkbox id="mtr-active" checked={form.isActive} onCheckedChange={v => f("isActive")(!!v)} />
            <Label htmlFor="mtr-active" className="cursor-pointer">Active (available for selection in moisture checks)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending}>{mut.isPending && <Loader2 size={14} className="mr-1 animate-spin" />}{isEdit ? "Save" : "Add Meter"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Calibration Log Dialog ────────────────────────────────────────────────────
const CAL_METHODS = ["Internal", "External Lab", "Manufacturer Service"];
const CAL_RESULTS = ["Pass", "Fail", "Advisory"];

function CalibrationDialog({ open, onClose, farmId, meter, editRow }: {
  open: boolean; onClose: () => void; farmId: number; meter: any; editRow?: any;
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;
  const init = { calibrationDate: today(), performedBy: "", method: "Internal", result: "Pass", certificateRef: "", nextDue: "", notes: "" };
  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  React.useEffect(() => {
    if (open) {
      if (editRow) {
        setForm({
          calibrationDate: editRow.calibrationDate ?? today(), performedBy: editRow.performedBy ?? "",
          method: editRow.method ?? "Internal", result: editRow.result ?? "Pass",
          certificateRef: editRow.certificateRef ?? "", nextDue: editRow.nextDue ?? "", notes: editRow.notes ?? "",
        });
      } else { setForm(init); }
    }
  }, [open, editRow]);

  const mut = useMutation({
    mutationFn: async (body: any) => {
      const url = isEdit
        ? `/api/farms/${farmId}/straw-moisture-meter-calibrations/${editRow.id}`
        : `/api/farms/${farmId}/straw-moisture-meters/${meter?.id}/calibrations`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-meters", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-meter-cals", farmId, meter?.id] });
      toast({ title: isEdit ? "Calibration updated" : "Calibration recorded" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const submit = () => mut.mutate({
    calibrationDate: form.calibrationDate, performedBy: form.performedBy || null,
    method: form.method || null, result: form.result,
    certificateRef: form.certificateRef || null, nextDue: form.nextDue || null, notes: form.notes || null,
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Log"} Calibration{meter ? ` — ${meter.deviceName}` : ""}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Calibration Date *</Label><Input type="date" value={form.calibrationDate} onChange={e => f("calibrationDate")(e.target.value)} /></div>
          <div>
            <Label>Result *</Label>
            <Select value={form.result} onValueChange={f("result")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CAL_RESULTS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Performed By</Label><Input value={form.performedBy} onChange={e => f("performedBy")(e.target.value)} /></div>
          <div className="col-span-2">
            <Label>Method</Label>
            <Select value={form.method} onValueChange={f("method")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CAL_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Certificate Ref</Label><Input value={form.certificateRef} onChange={e => f("certificateRef")(e.target.value)} /></div>
          <div><Label>Next Due</Label><Input type="date" value={form.nextDue} onChange={e => f("nextDue")(e.target.value)} /></div>
          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending}>{mut.isPending && <Loader2 size={14} className="mr-1 animate-spin" />}{isEdit ? "Save" : "Log Calibration"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Moisture Check Dialog ─────────────────────────────────────────────────────
function MoistureDialog({ open, onClose, farmId, editRow, inventory, activeMeters }: {
  open: boolean; onClose: () => void; farmId: number; editRow?: any; inventory: any[]; activeMeters: any[];
}) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;
  const init = {
    baleInventoryId: "", batchRef: "", checkDate: today(), daysFromStacking: "",
    moisturePercent: "", temperatureCelsius: "", odourObserved: false, odourDescription: "",
    deviceUsed: "", overallCondition: "Good", actionTaken: "", checkedBy: "", nextCheckDue: "", notes: "",
  };
  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));
  const nextCheckManual = React.useRef(false);

  const { data: membersData } = useFarmMembers(farmId);
  const members = membersData?.members ?? [];

  React.useEffect(() => {
    if (open) {
      nextCheckManual.current = false;
      if (editRow) {
        setForm({
          baleInventoryId: editRow.baleInventoryId ?? "", batchRef: editRow.batchRef ?? "",
          checkDate: editRow.checkDate ?? today(), daysFromStacking: editRow.daysFromStacking ?? "",
          moisturePercent: editRow.moisturePercent ?? "", temperatureCelsius: editRow.temperatureCelsius ?? "",
          odourObserved: editRow.odourObserved ?? false, odourDescription: editRow.odourDescription ?? "",
          deviceUsed: editRow.deviceUsed ?? "",
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

  // B: Auto-calculate next check due from risk level (new records, respects manual override)
  React.useEffect(() => {
    if (!open || isEdit || nextCheckManual.current || !form.checkDate) return;
    const moisture = form.moisturePercent ? Number(form.moisturePercent) : null;
    const daysFromStack = form.daysFromStacking ? Number(form.daysFromStacking) : null;
    let addDays = 14;
    if (moisture != null && moisture > 18) addDays = 1;
    else if (moisture != null && moisture > 16) addDays = 3;
    else if (daysFromStack != null && daysFromStack <= 14) addDays = 1;
    else if (daysFromStack != null && daysFromStack <= 21) addDays = 3;
    else if (moisture != null) addDays = 7;
    const next = new Date(form.checkDate);
    next.setDate(next.getDate() + addDays);
    setForm(p => ({ ...p, nextCheckDue: next.toISOString().slice(0, 10) }));
  }, [open, isEdit, form.checkDate, form.moisturePercent, form.daysFromStacking]);

  const m = num(form.moisturePercent);
  const selectedBatch = inventory.find((r: any) => r.id === Number(form.baleInventoryId));
  const risk = m != null && selectedBatch ? getMoistureRisk(m, selectedBatch.baleFormat) : null;
  const days = num(form.daysFromStacking);
  const willAlert = !isEdit && (form.odourObserved || (m != null && m > 18));

  const suggestedDaysLabel = (() => {
    const moisture = form.moisturePercent ? Number(form.moisturePercent) : null;
    const daysFromStack = form.daysFromStacking ? Number(form.daysFromStacking) : null;
    if (moisture != null && moisture > 18) return "daily — red risk";
    if (moisture != null && moisture > 16) return "every 3 days — amber risk";
    if (daysFromStack != null && daysFromStack <= 14) return "daily — critical window";
    if (daysFromStack != null && daysFromStack <= 21) return "every 3 days — post-critical";
    if (moisture != null) return "weekly";
    return null;
  })();

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
    deviceUsed: form.deviceUsed || null,
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
          {willAlert && (
            <div className="col-span-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded p-2 flex gap-1.5 items-start">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              SMS alert will be sent to farm managers on save.
            </div>
          )}
          <div className="col-span-2 flex items-center gap-3">
            <Checkbox id="odour" checked={form.odourObserved} onCheckedChange={v => f("odourObserved")(!!v)} />
            <Label htmlFor="odour" className="cursor-pointer">Odour Observed (caramel / musty = heating)</Label>
          </div>
          {form.odourObserved && <div className="col-span-2"><Label>Odour Description</Label><Input value={form.odourDescription} onChange={e => f("odourDescription")(e.target.value)} /></div>}

          {/* C: Device Used */}
          <div className="col-span-2">
            <Label>Device Used</Label>
            {activeMeters.length > 0 && (
              <Select value={activeMeters.some((mtr: any) => mtr.deviceName === form.deviceUsed) ? form.deviceUsed : ""}
                onValueChange={v => { if (v) f("deviceUsed")(v); }}>
                <SelectTrigger className="mb-1.5 text-sm"><SelectValue placeholder="Quick-fill from registered meter…" /></SelectTrigger>
                <SelectContent>
                  {activeMeters.map((mtr: any) => (
                    <SelectItem key={mtr.id} value={mtr.deviceName}>{mtr.deviceName}{mtr.make ? ` (${mtr.make}${mtr.model ? ` ${mtr.model}` : ""})` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input placeholder="e.g. Wile 55, Protimeter BLD5800" value={form.deviceUsed} onChange={e => f("deviceUsed")(e.target.value)} />
          </div>

          <div className="col-span-2">
            <Label>Overall Condition</Label>
            <Select value={form.overallCondition} onValueChange={f("overallCondition")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CONDITION_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Action Taken</Label><Input value={form.actionTaken} onChange={e => f("actionTaken")(e.target.value)} /></div>

          {/* A: Checked By — staff member lookup */}
          <div>
            <Label>Checked By</Label>
            {members.length > 0 ? (
              <Select value={form.checkedBy} onValueChange={f("checkedBy")}>
                <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">— Not specified —</SelectItem>
                  {members.filter((mbr: any) => mbr.isActive).map((mbr: any) => (
                    <SelectItem key={mbr.id} value={memberFullName(mbr)}>{memberFullName(mbr)}{mbr.jobTitle ? ` — ${mbr.jobTitle}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={form.checkedBy} onChange={e => f("checkedBy")(e.target.value)} placeholder="Name" />
            )}
          </div>

          {/* B: Next Check Due — auto-calculated, user can override */}
          <div>
            <Label>
              Next Check Due
              {suggestedDaysLabel && <span className="text-xs text-gray-400 font-normal ml-1">({suggestedDaysLabel})</span>}
            </Label>
            <Input type="date" value={form.nextCheckDue}
              onChange={e => { nextCheckManual.current = true; f("nextCheckDue")(e.target.value); }} />
          </div>

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
  const [meterDlg, setMeterDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [calDlg, setCalDlg] = useState<{ open: boolean; meter?: any; editRow?: any }>({ open: false });
  const [complianceDlg, setComplianceDlg] = useState(false);
  const [equipDlg, setEquipDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [permitDlg, setPermitDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [expandedOpId, setExpandedOpId] = useState<number | null>(null);
  const [expandedMeterId, setExpandedMeterId] = useState<number | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("all");
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

  const { data: meters = [] } = useQuery<any[]>({
    queryKey: ["straw-meters", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-moisture-meters`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: analytics } = useQuery<any>({
    queryKey: ["straw-analytics", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-analytics`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: fireComplianceRec } = useQuery<any>({
    queryKey: ["straw-fire-compliance", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-fire-compliance`, { credentials: "include" }).then(r => r.json()).then(d => d.record),
    enabled: !!farmId,
  });

  const { data: fireEquipment = [] } = useQuery<any[]>({
    queryKey: ["straw-fire-equipment", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-fire-equipment`, { credentials: "include" }).then(r => r.json()).then(d => d.items ?? []),
    enabled: !!farmId,
  });

  const { data: hotWorksPermits = [] } = useQuery<any[]>({
    queryKey: ["straw-hot-works-permits", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-hot-works-permits`, { credentials: "include" }).then(r => r.json()).then(d => d.permits ?? []),
    enabled: !!farmId,
  });

  const saveComplianceMut = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const r = await fetch(`/api/farms/${farmId}/straw-fire-compliance`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["straw-fire-compliance", farmId] }); setComplianceDlg(false); toast({ title: "Fire compliance record saved" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const saveEquipMut = useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: Record<string, unknown> }) => {
      const url = id ? `/api/farms/${farmId}/straw-fire-equipment/${id}` : `/api/farms/${farmId}/straw-fire-equipment`;
      const r = await fetch(url, { method: id ? "PATCH" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["straw-fire-equipment", farmId] }); setEquipDlg({ open: false }); toast({ title: "Equipment record saved" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const delEquipMut = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/farms/${farmId}/straw-fire-equipment/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["straw-fire-equipment", farmId] }); toast({ title: "Equipment removed" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const savePermitMut = useMutation({
    mutationFn: async ({ id, body }: { id?: number; body: Record<string, unknown> }) => {
      const url = id ? `/api/farms/${farmId}/straw-hot-works-permits/${id}` : `/api/farms/${farmId}/straw-hot-works-permits`;
      const r = await fetch(url, { method: id ? "PATCH" : "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) throw new Error("Save failed");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["straw-hot-works-permits", farmId] }); setPermitDlg({ open: false }); toast({ title: "Hot works permit saved" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const delPermitMut = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/farms/${farmId}/straw-hot-works-permits/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["straw-hot-works-permits", farmId] }); toast({ title: "Permit deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const delCalMut = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/farms/${farmId}/straw-moisture-meter-calibrations/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-meter-cals", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-meters", farmId] });
      toast({ title: "Calibration record deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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
      if (type === "straw-moisture-meters") qc.invalidateQueries({ queryKey: ["straw-meters", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-analytics", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // ── Year filter helpers ───────────────────────────────────────────────────
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    // Always include current year and 4 previous harvest years as baseline
    const thisYear = new Date().getFullYear();
    for (let y = thisYear; y >= thisYear - 4; y--) years.add(y.toString());
    // Add any years found in actual records
    balingOps.forEach((op: any) => { if (op.operationDate) years.add(new Date(op.operationDate).getFullYear().toString()); });
    inventory.forEach((r: any) => { if (r.harvestDate) years.add(new Date(r.harvestDate).getFullYear().toString()); });
    sales.forEach((r: any) => { if (r.saleDate) years.add(new Date(r.saleDate).getFullYear().toString()); });
    moisture.forEach((r: any) => { if (r.checkDate) years.add(new Date(r.checkDate).getFullYear().toString()); });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [balingOps, inventory, sales, moisture]);

  const filteredBalingOps = useMemo(() =>
    yearFilter === "all" ? balingOps : balingOps.filter((op: any) => op.operationDate && new Date(op.operationDate).getFullYear().toString() === yearFilter),
  [balingOps, yearFilter]);

  const filteredInventory = useMemo(() =>
    yearFilter === "all" ? inventory : inventory.filter((r: any) => r.harvestDate && new Date(r.harvestDate).getFullYear().toString() === yearFilter),
  [inventory, yearFilter]);

  const filteredSales = useMemo(() =>
    yearFilter === "all" ? sales : sales.filter((r: any) => r.saleDate && new Date(r.saleDate).getFullYear().toString() === yearFilter),
  [sales, yearFilter]);

  const filteredMoisture = useMemo(() =>
    yearFilter === "all" ? moisture : moisture.filter((r: any) => r.checkDate && new Date(r.checkDate).getFullYear().toString() === yearFilter),
  [moisture, yearFilter]);

  // Summary stats — use filtered data so cards reflect the active year
  const totalBalesInField = useMemo(() => filteredBalingOps.filter((op: any) => op.status === "open").reduce((s: number, op: any) => s + (op.balingBalance ?? 0), 0), [filteredBalingOps]);
  const totalBalesInStock = useMemo(() => filteredInventory.filter((r: any) => r.status === "in_stock").reduce((s: number, r: any) => s + (r.quantityRemaining ?? r.quantityBales ?? 0), 0), [filteredInventory]);
  const totalSalesValue = useMemo(() => filteredSales.reduce((s: number, r: any) => s + (r.totalValuePence ?? 0), 0), [filteredSales]);
  const unpaidSales = useMemo(() => filteredSales.filter((r: any) => r.paymentStatus === "unpaid" || r.paymentStatus === "overdue").reduce((s: number, r: any) => s + (r.totalValuePence ?? 0), 0), [filteredSales]);
  const actionRequired = useMemo(() => filteredInventory.filter((r: any) => r.moistureStatus === "Action Required" || r.moistureStatus === "Warning").length, [filteredInventory]);
  const openOps = useMemo(() => filteredBalingOps.filter((op: any) => op.status === "open").length, [filteredBalingOps]);

  // ── Annual production summary (all years, unfiltered — for the by-year table) ──
  const allStrawTypes = useMemo(() => {
    const types = new Set<string>();
    balingOps.forEach((op: any) => { if (op.strawType) types.add(op.strawType); });
    return Array.from(types).sort();
  }, [balingOps]);

  const annualSummary = useMemo(() => {
    const byYear: Record<string, { balesByType: Record<string, number>; totalBales: number; revenuePence: number; soldBales: number }> = {};
    balingOps.forEach((op: any) => {
      if (!op.operationDate) return;
      const year = new Date(op.operationDate).getFullYear().toString();
      if (!byYear[year]) byYear[year] = { balesByType: {}, totalBales: 0, revenuePence: 0, soldBales: 0 };
      const type = op.strawType || "Unknown";
      byYear[year].balesByType[type] = (byYear[year].balesByType[type] ?? 0) + (op.totalBalesProduced ?? 0);
      byYear[year].totalBales += op.totalBalesProduced ?? 0;
    });
    sales.forEach((s: any) => {
      if (!s.saleDate) return;
      const year = new Date(s.saleDate).getFullYear().toString();
      if (!byYear[year]) byYear[year] = { balesByType: {}, totalBales: 0, revenuePence: 0, soldBales: 0 };
      byYear[year].revenuePence += s.totalValuePence ?? 0;
      byYear[year].soldBales += s.quantitySold ?? 0;
    });
    return Object.entries(byYear)
      .sort(([a], [b]) => Number(b) - Number(a))
      .map(([year, data]) => ({ year, ...data }));
  }, [balingOps, sales]);

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
            {tab === "monitoring" && <><Button variant="outline" onClick={() => setMeterDlg({ open: true })}><Gauge size={15} className="mr-1" />Add Meter</Button><Button onClick={() => setMoistDlg({ open: true })}><Plus size={15} className="mr-1" />Record Check</Button></>}
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
            <div className="flex items-center gap-2 mb-1"><PoundSterling size={16} className="text-blue-600" /><span className="text-xs text-gray-500 font-medium">{yearFilter !== "all" ? `${yearFilter} Sales (net)` : "Total Sales (net)"}</span></div>
            <div className="text-2xl font-bold">{pToGBP(totalSalesValue)}</div>
            {yearFilter === "all" && <div className="text-xs text-gray-400 mt-0.5">all years</div>}
          </div>
          <div className={`bg-white rounded-xl border p-4 ${actionRequired > 0 ? "border-red-300" : ""}`}>
            <div className="flex items-center gap-2 mb-1"><AlertTriangle size={16} className={actionRequired > 0 ? "text-red-600" : "text-gray-400"} /><span className="text-xs text-gray-500 font-medium">Fire Risk Alerts</span></div>
            <div className={`text-2xl font-bold ${actionRequired > 0 ? "text-red-600" : ""}`}>{actionRequired}</div>
          </div>
        </div>

        {/* Year filter + Tabs row */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <TabBar className="mb-0">
            <TabButton active={tab === "baling"} onClick={() => setTab("baling")}><Tractor size={14} className="mr-1" />Baling</TabButton>
            <TabButton active={tab === "inventory"} onClick={() => setTab("inventory")}><Package size={14} className="mr-1" />Inventory (Batches)</TabButton>
            <TabButton active={tab === "sales"} onClick={() => setTab("sales")}><PoundSterling size={14} className="mr-1" />Sales</TabButton>
            <TabButton active={tab === "monitoring"} onClick={() => setTab("monitoring")}><Thermometer size={14} className="mr-1" />Fire Safety</TabButton>
            <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}><BarChart3 size={14} className="mr-1" />Analytics</TabButton>
          </TabBar>
          <div className="flex items-center gap-2 shrink-0">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Harvest year:</span>
            <Select value={yearFilter} onValueChange={v => setYearFilter(v)}>
              <SelectTrigger className="h-8 text-xs w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {availableYears.map(y => (
                  <SelectItem key={y} value={y}>{y} harvest</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {yearFilter !== "all" && (
              <button onClick={() => setYearFilter("all")} className="text-xs text-blue-600 hover:underline">Clear</button>
            )}
          </div>
        </div>

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
              ) : filteredBalingOps.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Tractor size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">{yearFilter !== "all" ? `No baling operations for ${yearFilter} harvest` : "No baling operations recorded"}</p>
                  <p className="text-sm mt-1">{yearFilter !== "all" ? "Try 'All years' or select a different harvest year." : "Start by recording your first baling session on a field."}</p>
                  {yearFilter === "all" && <Button className="mt-4" onClick={() => setBalingDlg({ open: true })}><Plus size={15} className="mr-1" />Record First Baling Op</Button>}
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
                      {filteredBalingOps.map((op: any) => {
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
          <div className="space-y-3">
            {/* Multi-year storage + Red Tractor mixing advisory */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900 flex gap-3">
              <Info size={18} className="shrink-0 mt-0.5 text-blue-600" />
              <div className="space-y-1">
                <p><strong>Multi-year storage:</strong> Straw bales stored dry and covered routinely carry over one or two harvests — this is normal practice. Each batch retains its own harvest year in the records so you can track age and traceability separately.</p>
                <p><strong>Red Tractor / EC 178/2002 mixing rules:</strong> There is no rule against holding different harvest years in the same building, but if bales from different <em>types</em> (e.g. wheat vs. barley straw) or harvest years are physically combined into one stack they can no longer be sold with individual identity claims. Keep separate stacks or bays and record each as a distinct batch. For seed-crop straw, variety identity must be maintained throughout.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
            {loadInv ? <div className="p-8 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Loading…</div> : filteredInventory.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Package size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">{yearFilter !== "all" ? `No straw batches for ${yearFilter} harvest` : "No straw batches recorded"}</p>
                <p className="text-sm mt-1">{yearFilter !== "all" ? "Try 'All years' — prior-year batches still in stock will appear there." : "Batches are typically created from a baling operation via the Baling tab — or add one manually here."}</p>
                {yearFilter === "all" && <Button className="mt-4" onClick={() => setInvDlg({ open: true })}><Plus size={15} className="mr-1" />Add Batch</Button>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>{["Batch Ref", "Type", "Format", "Harvest Date", "Qty (Total)", "Remaining", "Moisture", "Storage", "Status", "RT", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredInventory.map((r: any) => {
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
          </div>
        )}

        {/* ── Sales tab ── */}
        {tab === "sales" && (
          <div className="bg-white rounded-xl border overflow-hidden">
            {loadSales ? <div className="p-8 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Loading…</div> : filteredSales.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <PoundSterling size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">{yearFilter !== "all" ? `No sales for ${yearFilter} harvest` : "No straw sales recorded"}</p>
                <p className="text-sm mt-1">{yearFilter !== "all" ? "Try 'All years' to see sales from all harvests." : "Record your first sale to track revenue, VAT, and buyer traceability."}</p>
                {yearFilter === "all" && <Button className="mt-4" onClick={() => setSaleDlg({ open: true })}><Plus size={15} className="mr-1" />Record First Sale</Button>}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>{["Invoice", "Date", "Type / Format", "Qty", "Buyer", "Use / VAT", "Net Value", "VAT", "Gross", "Transport", "Payment", "Passport", ""].map(h => <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredSales.map((r: any) => {
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
                Monitor straw bales for the first <strong>10–14 days</strong> from stacking (spontaneous combustion window). Safe moisture limits: <strong>≤22%</strong> for small rectangular bales, <strong>≤18%</strong> for large round or square. Record checks daily initially, then every 2–3 days. SMS alerts fire automatically to farm managers on red moisture or odour events.
              </div>
            </div>

            {/* Moisture Checks Table */}
            <div className="bg-white rounded-xl border overflow-hidden">
              {loadMoist ? <div className="p-8 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Loading…</div> : filteredMoisture.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Thermometer size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">{yearFilter !== "all" ? `No monitoring checks for ${yearFilter} harvest` : "No monitoring checks recorded"}</p>
                  {yearFilter === "all" && <Button className="mt-4" onClick={() => setMoistDlg({ open: true })}><Plus size={15} className="mr-1" />Record First Check</Button>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>{["Batch", "Date", "Day #", "Moisture", "Temp (°C)", "Odour", "Condition", "Action Taken", "Checked By", "Device", "Next Due", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredMoisture.map((r: any) => (
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
                          <td className="px-4 py-3 text-xs text-gray-500">{r.deviceUsed || "—"}</td>
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

            {/* Moisture Meter Register */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2"><Gauge size={16} className="text-blue-600" />Moisture Meter Register</h3>
                <Button size="sm" variant="outline" onClick={() => setMeterDlg({ open: true })}><Plus size={14} className="mr-1" />Add Meter</Button>
              </div>
              {meters.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Gauge size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No meters registered. Add your moisture measurement devices to maintain a calibration audit trail.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {meters.map((mtr: any) => {
                    const calSt = meterCalStatus(mtr.nextCalibrationDue);
                    const isExpanded = expandedMeterId === mtr.id;
                    return (
                      <div key={mtr.id}>
                        <div className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50">
                          <button onClick={() => setExpandedMeterId(isExpanded ? null : mtr.id)} className="text-gray-400 hover:text-gray-600">
                            {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{mtr.deviceName}{!mtr.isActive && <span className="ml-2 text-xs text-gray-400">(inactive)</span>}</div>
                            <div className="text-xs text-gray-500">{[mtr.make, mtr.model, mtr.serialNumber ? `S/N: ${mtr.serialNumber}` : null].filter(Boolean).join(" · ")}</div>
                          </div>
                          <div className="text-xs text-gray-500 hidden sm:block"><Calendar size={11} className="inline mr-1" />Last cal: {fmtDate(mtr.lastCalibrationDate) || "—"}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${calSt.colour === "green" ? "bg-green-100 text-green-700" : calSt.colour === "amber" ? "bg-amber-100 text-amber-700" : calSt.colour === "red" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>{calSt.label}</span>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => setCalDlg({ open: true, meter: mtr })} title="Log Calibration" className="p-1.5 rounded hover:bg-blue-50 text-blue-500"><BadgeCheck size={14} /></button>
                            <button onClick={() => setMeterDlg({ open: true, row: mtr })} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil size={14} /></button>
                            <button onClick={() => { if (confirm("Remove this meter from the register?")) delMut.mutate({ type: "straw-moisture-meters", id: mtr.id }); }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        {isExpanded && (
                          <MeterCalHistory
                            farmId={farmId}
                            meter={mtr}
                            onLogCal={() => setCalDlg({ open: true, meter: mtr })}
                            onEdit={(row) => setCalDlg({ open: true, meter: mtr, editRow: row })}
                            onDelete={(id) => delCalMut.mutate(id)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Straw Store Fire Compliance Records ── */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 flex gap-3">
              <ShieldCheck size={18} className="shrink-0 mt-0.5 text-red-600" />
              <div>
                <strong>Straw Store Fire Compliance — RT FA.10 &amp; FSO 2005</strong><br />
                Red Tractor requires a current fire risk assessment for all straw stores, with annual review. Records below provide the audit evidence trail for RT FA.10, the Regulatory Reform (Fire Safety) Order 2005, and your insurer.
              </div>
            </div>

            {/* Fire Risk Assessment + Electrical Inspection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fire Risk Assessment */}
              <div className="bg-white rounded-xl border p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2"><Flame size={15} className="text-red-500" />Fire Risk Assessment <span className="text-xs font-normal text-gray-400">(RT FA.10)</span></h4>
                  <Button size="sm" variant="outline" onClick={() => setComplianceDlg(true)}><Pencil size={13} className="mr-1" />{fireComplianceRec ? "Update" : "Record"}</Button>
                </div>
                {fireComplianceRec?.lastFireRiskAssessmentDate ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Last assessment</span><span className="font-medium">{fmtDate(fireComplianceRec.lastFireRiskAssessmentDate)}</span></div>
                    {fireComplianceRec.assessmentConductedBy && <div className="flex justify-between"><span className="text-gray-500">Conducted by</span><span>{fireComplianceRec.assessmentConductedBy}</span></div>}
                    {fireComplianceRec.assessmentRef && <div className="flex justify-between"><span className="text-gray-500">Ref</span><span className="font-mono text-xs">{fireComplianceRec.assessmentRef}</span></div>}
                    {fireComplianceRec.nextFireRiskAssessmentDue && (() => {
                      const due = new Date(fireComplianceRec.nextFireRiskAssessmentDue);
                      const today = new Date(); today.setHours(0,0,0,0);
                      const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000);
                      const colour = daysLeft < 0 ? "red" : daysLeft <= 30 ? "amber" : "green";
                      return <div className="flex justify-between items-center"><span className="text-gray-500">Next review due</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colour === "red" ? "bg-red-100 text-red-700" : colour === "amber" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{fmtDate(fireComplianceRec.nextFireRiskAssessmentDue)}{daysLeft < 0 ? " — OVERDUE" : daysLeft <= 30 ? ` — due in ${daysLeft}d` : ""}</span></div>;
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <Flame size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No fire risk assessment recorded.<br />Red Tractor requires annual assessment.</p>
                  </div>
                )}
              </div>

              {/* Electrical Inspection */}
              <div className="bg-white rounded-xl border p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2"><Zap size={15} className="text-yellow-500" />Electrical Inspection <span className="text-xs font-normal text-gray-400">(Electricity at Work Regs 1989)</span></h4>
                  {!fireComplianceRec && <Button size="sm" variant="outline" onClick={() => setComplianceDlg(true)}><Pencil size={13} className="mr-1" />Record</Button>}
                </div>
                {fireComplianceRec?.lastElectricalInspectionDate ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Last inspection</span><span className="font-medium">{fmtDate(fireComplianceRec.lastElectricalInspectionDate)}</span></div>
                    {fireComplianceRec.electricalInspectorName && <div className="flex justify-between"><span className="text-gray-500">Inspector</span><span>{fireComplianceRec.electricalInspectorName}</span></div>}
                    {fireComplianceRec.electricalCertificateRef && <div className="flex justify-between"><span className="text-gray-500">Certificate ref</span><span className="font-mono text-xs">{fireComplianceRec.electricalCertificateRef}</span></div>}
                    {fireComplianceRec.nextElectricalInspectionDue && (() => {
                      const due = new Date(fireComplianceRec.nextElectricalInspectionDue);
                      const today = new Date(); today.setHours(0,0,0,0);
                      const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000);
                      const colour = daysLeft < 0 ? "red" : daysLeft <= 30 ? "amber" : "green";
                      return <div className="flex justify-between items-center"><span className="text-gray-500">Next inspection due</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colour === "red" ? "bg-red-100 text-red-700" : colour === "amber" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{fmtDate(fireComplianceRec.nextElectricalInspectionDue)}{daysLeft < 0 ? " — OVERDUE" : daysLeft <= 30 ? ` — due in ${daysLeft}d` : ""}</span></div>;
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <Zap size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No electrical inspection recorded.<br />Annual inspection required for buildings storing straw.</p>
                  </div>
                )}
              </div>
            </div>

            {/* INDG125 Safety Checklist */}
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-sm flex items-center gap-2"><ClipboardList size={15} className="text-blue-600" />HSE INDG125 Safety Checklist</h4>
                <div className="flex items-center gap-3">
                  {fireComplianceRec?.checklistLastReviewedDate && <span className="text-xs text-gray-400">Last reviewed: {fmtDate(fireComplianceRec.checklistLastReviewedDate)}{fireComplianceRec.checklistReviewedBy ? ` by ${fireComplianceRec.checklistReviewedBy}` : ""}</span>}
                  <Button size="sm" variant="outline" onClick={() => setComplianceDlg(true)}><Pencil size={13} className="mr-1" />Update</Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: "separationDistancesOk", label: "Separation distances ≥6 m from buildings/boundaries", ref: "INDG125 §3" },
                  { key: "smokingSignsDisplayed", label: "No smoking signs displayed at all straw store entrances", ref: "INDG125 §5" },
                  { key: "vehicleExhaustRuleInPlace", label: "Vehicle/machinery exhaust rule in place near straw", ref: "INDG125 §6" },
                  { key: "hotWorksPermitSystemInPlace", label: "Hot works permit system in place (no work within 10 m)", ref: "INDG125 §7" },
                  { key: "emergencyAccessClear", label: "Emergency vehicle access to all stacks kept clear", ref: "INDG125 §8" },
                ].map(({ key, label, ref }) => {
                  const checked = !!fireComplianceRec?.[key];
                  return (
                    <div key={key} className={`flex items-start gap-2 p-3 rounded-lg border ${checked ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                      {checked ? <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" /> : <AlertCircle size={16} className="text-gray-400 shrink-0 mt-0.5" />}
                      <div>
                        <p className={`text-xs font-medium leading-snug ${checked ? "text-green-800" : "text-gray-600"}`}>{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{ref}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!fireComplianceRec && <p className="text-center text-xs text-gray-400 mt-3">Click <strong>Update</strong> to record your checklist confirmations.</p>}
            </div>

            {/* Firefighting Equipment Register */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><Flame size={16} className="text-orange-500" />Firefighting Equipment Register <span className="text-xs font-normal text-gray-400 ml-1">(RT FA.10)</span></h4>
                <Button size="sm" variant="outline" onClick={() => setEquipDlg({ open: true })}><Plus size={14} className="mr-1" />Add Equipment</Button>
              </div>
              {fireEquipment.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Flame size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No firefighting equipment registered. Record extinguishers, hose reels and sand bins to maintain your RT FA.10 audit trail.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>{["Type", "Location", "Description / S/N", "Last Service", "Next Service Due", "Status", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y">
                      {fireEquipment.map((eq: any) => {
                        const svcDue = eq.nextServiceDue ? new Date(eq.nextServiceDue) : null;
                        const today = new Date(); today.setHours(0,0,0,0);
                        const daysLeft = svcDue ? Math.ceil((svcDue.getTime() - today.getTime()) / 86400000) : null;
                        const svcColour = daysLeft == null ? "gray" : daysLeft < 0 ? "red" : daysLeft <= 30 ? "amber" : "green";
                        return (
                          <tr key={eq.id} className={`hover:bg-gray-50 ${!eq.isActive ? "opacity-50" : ""}`}>
                            <td className="px-4 py-3 font-medium">{eq.equipmentType}</td>
                            <td className="px-4 py-3 text-gray-600">{eq.location}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">{[eq.description, eq.serialNumber ? `S/N: ${eq.serialNumber}` : null].filter(Boolean).join(" · ") || "—"}</td>
                            <td className="px-4 py-3">{fmtDate(eq.lastServiceDate) || "—"}</td>
                            <td className="px-4 py-3">{fmtDate(eq.nextServiceDue) || "—"}</td>
                            <td className="px-4 py-3">
                              {!eq.isActive ? <span className="text-xs text-gray-400">Inactive</span> : <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${svcColour === "red" ? "bg-red-100 text-red-700" : svcColour === "amber" ? "bg-amber-100 text-amber-700" : svcColour === "green" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{daysLeft == null ? "No date set" : daysLeft < 0 ? "Service overdue" : daysLeft <= 30 ? `Due in ${daysLeft}d` : "Current"}</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1">
                                <button onClick={() => setEquipDlg({ open: true, row: eq })} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil size={14} /></button>
                                <button onClick={() => { if (confirm("Remove this equipment record?")) delEquipMut.mutate(eq.id); }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
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

            {/* Hot Works Permits Log */}
            <div className="bg-white rounded-xl border overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center justify-between">
                <h4 className="font-semibold text-gray-700 flex items-center gap-2"><HardHat size={16} className="text-orange-600" />Hot Works Permit Log <span className="text-xs font-normal text-gray-400 ml-1">(HSE INDG125 — no hot work within 10 m of straw without permit)</span></h4>
                <Button size="sm" variant="outline" onClick={() => setPermitDlg({ open: true })}><Plus size={14} className="mr-1" />Issue Permit</Button>
              </div>
              {hotWorksPermits.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <HardHat size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No hot works permits recorded. Issue a permit before any grinding, welding, or cutting work near straw stores.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>{["Date", "Work Description", "Location", "Conducted By", "Supervisor", "Fire Watch", "Post-Work Check", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y">
                      {hotWorksPermits.map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">{fmtDate(p.permitDate)}</td>
                          <td className="px-4 py-3 max-w-[180px] truncate">{p.workDescription}</td>
                          <td className="px-4 py-3 text-gray-500">{p.location || "—"}</td>
                          <td className="px-4 py-3 text-gray-600">{p.conductedBy || "—"}</td>
                          <td className="px-4 py-3 text-gray-600">{p.supervisorName || "—"}</td>
                          <td className="px-4 py-3">{p.fireWatchDurationMins ? `${p.fireWatchDurationMins} min` : "—"}</td>
                          <td className="px-4 py-3">{p.postWorkInspectionDone ? <span className="text-xs text-green-700 font-medium">Done</span> : <span className="text-xs text-gray-400">Pending</span>}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setPermitDlg({ open: true, row: p })} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil size={14} /></button>
                              <button onClick={() => { if (confirm("Delete this permit record?")) delPermitMut.mutate(p.id); }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
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
            {/* Annual Production Summary — always shown, client-side from loaded data */}
            {annualSummary.length > 0 && (
              <div className="bg-white rounded-xl border overflow-hidden">
                <div className="px-5 py-4 border-b">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2"><BarChart3 size={16} className="text-amber-600" />Annual Production &amp; Revenue Summary</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Bales produced on-holding by harvest year and crop type, with total sales revenue booked in that calendar year</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Year</th>
                        {allStrawTypes.map(t => <th key={t} className="px-4 py-3 text-right text-xs font-semibold text-gray-600">{t.replace(" Straw", "").replace("Oilseed Rape", "OSR")}</th>)}
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Total Bales</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Bales Sold</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600">Sales Revenue (net)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {annualSummary.map(row => (
                        <tr key={row.year} className="hover:bg-amber-50 cursor-pointer" onClick={() => setYearFilter(row.year)}>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-amber-700">{row.year}</span>
                            <span className="text-xs text-gray-400 ml-1">harvest</span>
                          </td>
                          {allStrawTypes.map(t => (
                            <td key={t} className="px-4 py-3 text-right text-gray-700">{row.balesByType[t] ? row.balesByType[t].toLocaleString() : <span className="text-gray-300">—</span>}</td>
                          ))}
                          <td className="px-4 py-3 text-right font-semibold">{row.totalBales.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{row.soldBales > 0 ? row.soldBales.toLocaleString() : <span className="text-gray-300">—</span>}</td>
                          <td className="px-4 py-3 text-right font-semibold text-blue-700">{row.revenuePence > 0 ? pToGBP(row.revenuePence) : <span className="text-gray-300">—</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                    {annualSummary.length > 1 && (
                      <tfoot className="bg-gray-50 border-t">
                        <tr>
                          <td className="px-4 py-3 font-semibold text-xs text-gray-500 uppercase">All years</td>
                          {allStrawTypes.map(t => (
                            <td key={t} className="px-4 py-3 text-right font-semibold text-xs">
                              {annualSummary.reduce((s, r) => s + (r.balesByType[t] ?? 0), 0).toLocaleString()}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-right font-bold">{annualSummary.reduce((s, r) => s + r.totalBales, 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-semibold">{annualSummary.reduce((s, r) => s + r.soldBales, 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-bold text-blue-700">{pToGBP(annualSummary.reduce((s, r) => s + r.revenuePence, 0))}</td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
                <div className="px-5 py-2.5 bg-gray-50 border-t text-xs text-gray-400">Click a row to filter the whole page to that harvest year</div>
              </div>
            )}

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
                      { label: "RT Certified Batches", value: analytics.redTractorCount ?? 0, total: filteredInventory.length, icon: <ShieldCheck size={16} className="text-green-600" /> },
                      { label: "Passports Issued", value: analytics.passportCount ?? 0, total: filteredSales.length, icon: <FileCheck size={16} className="text-blue-600" /> },
                      { label: "Fusarium Assessed", value: analytics.fusariumCount ?? 0, total: filteredInventory.filter((r: any) => r.strawType === "Wheat Straw").length, icon: <CheckCircle2 size={16} className="text-amber-600" /> },
                      { label: "Fire Risk Alerts", value: actionRequired, total: filteredInventory.length, icon: <AlertTriangle size={16} className={actionRequired > 0 ? "text-red-600" : "text-gray-400"} /> },
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
      <MoistureDialog open={moistDlg.open} onClose={() => setMoistDlg({ open: false })} farmId={farmId} editRow={moistDlg.row} inventory={inventory} activeMeters={meters.filter((m: any) => m.isActive !== false)} />
      <MeterDialog open={meterDlg.open} onClose={() => setMeterDlg({ open: false })} farmId={farmId} editRow={meterDlg.row} />
      <CalibrationDialog open={calDlg.open} onClose={() => setCalDlg({ open: false })} farmId={farmId} meter={calDlg.meter} editRow={calDlg.editRow} />

      {/* ── Fire Compliance Dialog ── */}
      {complianceDlg && (
        <FireComplianceDialog
          open={complianceDlg}
          initial={fireComplianceRec}
          onClose={() => setComplianceDlg(false)}
          onSave={(body) => saveComplianceMut.mutate(body)}
          saving={saveComplianceMut.isPending}
          farmId={farmId}
        />
      )}

      {/* ── Equipment Dialog ── */}
      {equipDlg.open && (
        <FireEquipmentDialog
          open={equipDlg.open}
          row={equipDlg.row}
          onClose={() => setEquipDlg({ open: false })}
          onSave={(body) => saveEquipMut.mutate({ id: equipDlg.row?.id, body })}
          saving={saveEquipMut.isPending}
          farmId={farmId}
        />
      )}

      {/* ── Hot Works Permit Dialog ── */}
      {permitDlg.open && (
        <HotWorksDialog
          open={permitDlg.open}
          row={permitDlg.row}
          onClose={() => setPermitDlg({ open: false })}
          onSave={(body) => savePermitMut.mutate({ id: permitDlg.row?.id, body })}
          saving={savePermitMut.isPending}
          farmId={farmId}
        />
      )}
    </AppLayout>
  );
}

// ─── Shared: member-or-manual name picker ─────────────────────────────────────
// Shows a Select populated with farm members; choosing "— Not listed —" reveals
// a free-text Input underneath for external contractors / non-member staff.
function MemberOrManualInput({ label, value, onChange, members, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void;
  members: any[]; placeholder?: string; required?: boolean;
}) {
  const memberNames: string[] = members.map((m: any) => memberFullName(m));
  const [manual, setManual] = useState(() => !!(value && !memberNames.includes(value)));
  const selectVal = manual ? "__manual__" : (value || "");
  return (
    <div>
      <Label>{label}{required ? " *" : ""}</Label>
      <Select value={selectVal} onValueChange={v => {
        if (v === "__manual__") { setManual(true); onChange(""); }
        else { setManual(false); onChange(v); }
      }}>
        <SelectTrigger><SelectValue placeholder={members.length ? "Select person…" : "Loading…"} /></SelectTrigger>
        <SelectContent>
          {members.map((m: any) => <SelectItem key={m.id} value={memberFullName(m)}>{memberFullName(m)}{m.jobTitle ? ` — ${m.jobTitle}` : ""}</SelectItem>)}
          <SelectItem value="__manual__">— Not listed (enter below) —</SelectItem>
        </SelectContent>
      </Select>
      {manual && <Input className="mt-2" placeholder={placeholder ?? "Name / company"} value={value} onChange={e => onChange(e.target.value)} />}
    </div>
  );
}

// ─── Fire Compliance Dialog ────────────────────────────────────────────────────
function FireComplianceDialog({ open, initial, onClose, onSave, saving, farmId }: { open: boolean; initial: any; onClose: () => void; onSave: (b: Record<string, unknown>) => void; saving: boolean; farmId: number }) {
  const { data: membersData } = useFarmMembers(farmId);
  const members = membersData?.members ?? [];
  const blank = {
    lastFireRiskAssessmentDate: "", nextFireRiskAssessmentDue: "", assessmentConductedBy: "", assessmentConductedBySupplierId: null as number | null, assessmentRef: "",
    separationDistancesOk: false, smokingSignsDisplayed: false, vehicleExhaustRuleInPlace: false, hotWorksPermitSystemInPlace: false, emergencyAccessClear: false,
    checklistLastReviewedDate: "", checklistReviewedBy: "",
    lastElectricalInspectionDate: "", nextElectricalInspectionDue: "", electricalInspectorName: "", electricalInspectorSupplierId: null as number | null, electricalCertificateRef: "",
    notes: "",
  };
  const toStr = (v: unknown) => v ? String(v).slice(0, 10) : "";
  const [form, setForm] = useState(() => initial ? {
    lastFireRiskAssessmentDate: toStr(initial.lastFireRiskAssessmentDate),
    nextFireRiskAssessmentDue: toStr(initial.nextFireRiskAssessmentDue),
    assessmentConductedBy: initial.assessmentConductedBy ?? "",
    assessmentConductedBySupplierId: initial.assessmentConductedBySupplierId ?? null,
    assessmentRef: initial.assessmentRef ?? "",
    separationDistancesOk: !!initial.separationDistancesOk,
    smokingSignsDisplayed: !!initial.smokingSignsDisplayed,
    vehicleExhaustRuleInPlace: !!initial.vehicleExhaustRuleInPlace,
    hotWorksPermitSystemInPlace: !!initial.hotWorksPermitSystemInPlace,
    emergencyAccessClear: !!initial.emergencyAccessClear,
    checklistLastReviewedDate: toStr(initial.checklistLastReviewedDate),
    checklistReviewedBy: initial.checklistReviewedBy ?? "",
    lastElectricalInspectionDate: toStr(initial.lastElectricalInspectionDate),
    nextElectricalInspectionDue: toStr(initial.nextElectricalInspectionDue),
    electricalInspectorName: initial.electricalInspectorName ?? "",
    electricalInspectorSupplierId: initial.electricalInspectorSupplierId ?? null,
    electricalCertificateRef: initial.electricalCertificateRef ?? "",
    notes: initial.notes ?? "",
  } : blank);
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));
  const fb = (k: string) => (v: boolean) => setForm(p => ({ ...p, [k]: v }));
  const submit = () => onSave(form);
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Fire Compliance Record — RT FA.10 &amp; FSO 2005</DialogTitle></DialogHeader>
        <div className="space-y-5">
          {/* Fire Risk Assessment */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2"><Flame size={13} className="text-red-500" />Fire Risk Assessment</p>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Last Assessment Date</Label><Input type="date" value={form.lastFireRiskAssessmentDate} onChange={e => f("lastFireRiskAssessmentDate")(e.target.value)} /></div>
              <div><Label>Next Review Due</Label><Input type="date" value={form.nextFireRiskAssessmentDue} onChange={e => f("nextFireRiskAssessmentDue")(e.target.value)} /></div>
              <div><Label>Conducted By</Label><BuyerCombobox farmId={farmId} types={["contractor", "general"]} valueId={form.assessmentConductedBySupplierId ?? null} valueName={form.assessmentConductedBy} onChange={(id, name) => setForm(p => ({ ...p, assessmentConductedBySupplierId: id, assessmentConductedBy: name }))} /></div>
              <div><Label>Document Reference</Label><Input placeholder="e.g. FRA-2026-01" value={form.assessmentRef} onChange={e => f("assessmentRef")(e.target.value)} /></div>
            </div>
          </div>

          {/* INDG125 Checklist */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2"><ClipboardList size={13} className="text-blue-500" />HSE INDG125 Checklist Confirmations</p>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                { key: "separationDistancesOk", label: "Separation distances ≥6 m maintained from buildings, other stacks, and boundaries" },
                { key: "smokingSignsDisplayed", label: "No smoking signs displayed at all straw store entrances" },
                { key: "vehicleExhaustRuleInPlace", label: "Rule in place — no parking vehicles/machinery with hot exhausts near straw" },
                { key: "hotWorksPermitSystemInPlace", label: "Hot works permit system in place (no grinding/welding within 10 m without permit)" },
                { key: "emergencyAccessClear", label: "Emergency vehicle access route to all stacks kept clear at all times" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3 p-2.5 rounded-lg border bg-gray-50">
                  <Checkbox checked={!!(form as any)[key]} onCheckedChange={v => fb(key)(!!v)} />
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div><Label>Checklist Last Reviewed</Label><Input type="date" value={form.checklistLastReviewedDate} onChange={e => f("checklistLastReviewedDate")(e.target.value)} /></div>
              <MemberOrManualInput label="Reviewed By" value={form.checklistReviewedBy} onChange={v => f("checklistReviewedBy")(v)} members={members} placeholder="Name" />
            </div>
          </div>

          {/* Electrical Inspection */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2"><Zap size={13} className="text-yellow-500" />Electrical Inspection (Electricity at Work Regulations 1989)</p>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Last Inspection Date</Label><Input type="date" value={form.lastElectricalInspectionDate} onChange={e => f("lastElectricalInspectionDate")(e.target.value)} /></div>
              <div><Label>Next Inspection Due</Label><Input type="date" value={form.nextElectricalInspectionDue} onChange={e => f("nextElectricalInspectionDue")(e.target.value)} /></div>
              <div><Label>Inspector Name / Company</Label><BuyerCombobox farmId={farmId} types={["contractor", "general"]} valueId={form.electricalInspectorSupplierId ?? null} valueName={form.electricalInspectorName} onChange={(id, name) => setForm(p => ({ ...p, electricalInspectorSupplierId: id, electricalInspectorName: name }))} /></div>
              <div><Label>Certificate Reference</Label><Input placeholder="e.g. EICR-2026-Farm" value={form.electricalCertificateRef} onChange={e => f("electricalCertificateRef")(e.target.value)} /></div>
            </div>
          </div>

          <div className="border-t pt-3"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving && <Loader2 size={14} className="mr-1 animate-spin" />}Save Record</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Fire Equipment Dialog ─────────────────────────────────────────────────────
const EQUIP_TYPES = ["CO₂ Extinguisher", "Water Extinguisher", "Dry Powder Extinguisher", "Foam Extinguisher", "Sand Bin", "Hose Reel", "Fire Blanket", "Other"];
const SERVICE_INTERVAL_OPTIONS = [
  { value: 6,  label: "6 months" },
  { value: 12, label: "12 months (annual)" },
  { value: 24, label: "24 months (2 years)" },
  { value: 36, label: "36 months (3 years)" },
  { value: 48, label: "48 months (4 years)" },
];

function FireEquipmentDialog({ open, row, onClose, onSave, saving, farmId: _farmId }: { open: boolean; row?: any; onClose: () => void; onSave: (b: Record<string, unknown>) => void; saving: boolean; farmId: number }) {
  const [form, setForm] = useState({
    equipmentType: row?.equipmentType ?? "",
    location: row?.location ?? "",
    description: row?.description ?? "",
    serialNumber: row?.serialNumber ?? "",
    lastServiceDate: row?.lastServiceDate ? String(row.lastServiceDate).slice(0, 10) : "",
    nextServiceDue: row?.nextServiceDue ? String(row.nextServiceDue).slice(0, 10) : "",
    serviceIntervalMonths: row?.serviceIntervalMonths ?? 12,
    isActive: row ? !!row.isActive : true,
    notes: row?.notes ?? "",
  });
  const f = (k: string) => (v: string | number | boolean) => setForm(p => ({ ...p, [k]: v }));
  const submit = () => {
    if (!form.equipmentType || !form.location) return;
    onSave(form);
  };
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{row ? "Edit" : "Add"} Firefighting Equipment</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Equipment Type *</Label>
            <Select value={form.equipmentType} onValueChange={v => f("equipmentType")(v)}>
              <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
              <SelectContent>{EQUIP_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Location *</Label><Input placeholder="e.g. Main Straw Barn — entrance door" value={form.location} onChange={e => f("location")(e.target.value)} /></div>
          <div><Label>Description / Brand</Label><Input placeholder="e.g. 6 kg Britannia CO₂" value={form.description} onChange={e => f("description")(e.target.value)} /></div>
          <div><Label>Serial Number</Label><Input placeholder="Serial / ID number" value={form.serialNumber} onChange={e => f("serialNumber")(e.target.value)} /></div>
          <div><Label>Last Service Date</Label><Input type="date" value={form.lastServiceDate} onChange={e => f("lastServiceDate")(e.target.value)} /></div>
          <div><Label>Next Service Due</Label><Input type="date" value={form.nextServiceDue} onChange={e => f("nextServiceDue")(e.target.value)} /></div>
          <div>
            <Label>Service Interval</Label>
            <Select value={String(form.serviceIntervalMonths)} onValueChange={v => f("serviceIntervalMonths")(Number(v))}>
              <SelectTrigger><SelectValue placeholder="Select interval…" /></SelectTrigger>
              <SelectContent>
                {SERVICE_INTERVAL_OPTIONS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Checkbox checked={form.isActive} onCheckedChange={v => f("isActive")(!!v)} />
            <Label>Active / in service</Label>
          </div>
          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.equipmentType || !form.location}>{saving && <Loader2 size={14} className="mr-1 animate-spin" />}{row ? "Save" : "Add Equipment"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Hot Works Permit Dialog ───────────────────────────────────────────────────
const FIRE_WATCH_OPTIONS = [
  { value: 30,  label: "30 minutes" },
  { value: 45,  label: "45 minutes" },
  { value: 60,  label: "60 minutes (HSE minimum)" },
  { value: 90,  label: "90 minutes" },
  { value: 120, label: "120 minutes (2 hours)" },
];

const STD_PRECAUTIONS = [
  "Area cleared of loose straw and combustible material within 10 m",
  "Dry powder extinguisher (min. 9 kg) positioned within 3 m of work area",
  "Straw stacks covered with fire blanket where practicable",
  "Water source / hose available nearby",
  "Hot surfaces and spark zone inspected immediately after work stops",
  "Mobile phone / radio carried for emergency contact",
];

function parsePrecautions(raw: string): { checked: Set<string>; additional: string } {
  if (!raw) return { checked: new Set(), additional: "" };
  const lines = raw.split("\n").map(l => l.replace(/^[•\-]\s*/, "").trim()).filter(Boolean);
  const checked = new Set<string>();
  const extra: string[] = [];
  for (const line of lines) {
    if (STD_PRECAUTIONS.includes(line)) checked.add(line);
    else extra.push(line);
  }
  return { checked, additional: extra.join("\n") };
}

function HotWorksDialog({ open, row, onClose, onSave, saving, farmId }: { open: boolean; row?: any; onClose: () => void; onSave: (b: Record<string, unknown>) => void; saving: boolean; farmId: number }) {
  const { data: membersData } = useFarmMembers(farmId);
  const members = membersData?.members ?? [];

  const parsed = parsePrecautions(row?.precautionsTaken ?? "");
  const [checkedPrecautions, setCheckedPrecautions] = useState<Set<string>>(() => parsed.checked);
  const [additionalPrecautions, setAdditionalPrecautions] = useState(() => parsed.additional);

  const [form, setForm] = useState({
    permitDate: row?.permitDate ? String(row.permitDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
    workDescription: row?.workDescription ?? "",
    location: row?.location ?? "",
    conductedBy: row?.conductedBy ?? "",
    supervisorName: row?.supervisorName ?? "",
    fireWatchDurationMins: row?.fireWatchDurationMins ?? 60,
    postWorkInspectionDone: !!row?.postWorkInspectionDone,
    postWorkInspectionNotes: row?.postWorkInspectionNotes ?? "",
    workCompletedAt: row?.workCompletedAt ?? "",
    closedBy: row?.closedBy ?? "",
    notes: row?.notes ?? "",
  });
  const f = (k: string) => (v: string | number | boolean) => setForm(p => ({ ...p, [k]: v }));

  const togglePrecaution = (item: string) => {
    setCheckedPrecautions(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  };

  const submit = () => {
    if (!form.permitDate || !form.workDescription) return;
    const precautionLines = STD_PRECAUTIONS.filter(p => checkedPrecautions.has(p)).map(p => `• ${p}`);
    if (additionalPrecautions.trim()) precautionLines.push(additionalPrecautions.trim());
    onSave({ ...form, precautionsTaken: precautionLines.join("\n") });
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{row ? "Edit" : "Issue"} Hot Works Permit</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 flex gap-2">
            <HardHat size={16} className="shrink-0 mt-0.5 text-orange-600" />
            <span>HSE INDG125 requires no grinding, welding or cutting within <strong>10 m</strong> of straw stores without formal authorisation. Complete this permit before work begins.</span>
          </div>
          <div><Label>Permit Date *</Label><Input type="date" value={form.permitDate} onChange={e => f("permitDate")(e.target.value)} /></div>
          <div><Label>Work Completed At (time)</Label><Input type="time" value={form.workCompletedAt} onChange={e => f("workCompletedAt")(e.target.value)} /></div>
          <div className="col-span-2"><Label>Work Description *</Label><Input placeholder="e.g. Welding barn door hinge, 8 m from straw stack" value={form.workDescription} onChange={e => f("workDescription")(e.target.value)} /></div>
          <div className="col-span-2"><Label>Location</Label><Input placeholder="e.g. North straw barn — west gable end" value={form.location} onChange={e => f("location")(e.target.value)} /></div>
          <MemberOrManualInput label="Conducted By" value={form.conductedBy} onChange={v => f("conductedBy")(v)} members={members} placeholder="Operator name" />
          <MemberOrManualInput label="Authorised / Supervised By" value={form.supervisorName} onChange={v => f("supervisorName")(v)} members={members} placeholder="Responsible person" />

          {/* Precautions checklist */}
          <div className="col-span-2">
            <Label className="mb-2 block">Precautions Taken</Label>
            <div className="space-y-2">
              {STD_PRECAUTIONS.map(item => (
                <div key={item} className="flex items-start gap-3 p-2.5 rounded-lg border bg-gray-50">
                  <Checkbox checked={checkedPrecautions.has(item)} onCheckedChange={() => togglePrecaution(item)} className="mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-2">
              <Label className="text-xs text-gray-500">Additional precautions (optional)</Label>
              <Textarea rows={2} placeholder="Any other precautions taken…" value={additionalPrecautions} onChange={e => setAdditionalPrecautions(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Post-Work Fire Watch</Label>
            <Select value={String(form.fireWatchDurationMins)} onValueChange={v => f("fireWatchDurationMins")(Number(v))}>
              <SelectTrigger><SelectValue placeholder="Select duration…" /></SelectTrigger>
              <SelectContent>
                {FIRE_WATCH_OPTIONS.map(o => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Checkbox checked={form.postWorkInspectionDone} onCheckedChange={v => f("postWorkInspectionDone")(!!v)} />
            <Label>Post-work inspection completed</Label>
          </div>
          {form.postWorkInspectionDone && <div className="col-span-2"><Label>Post-Inspection Notes</Label><Textarea rows={2} value={form.postWorkInspectionNotes} onChange={e => f("postWorkInspectionNotes")(e.target.value)} /></div>}
          <MemberOrManualInput label="Closed By" value={form.closedBy} onChange={v => f("closedBy")(v)} members={members} placeholder="Name" />
          <div></div>
          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.permitDate || !form.workDescription}>{saving && <Loader2 size={14} className="mr-1 animate-spin" />}{row ? "Save" : "Issue Permit"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
