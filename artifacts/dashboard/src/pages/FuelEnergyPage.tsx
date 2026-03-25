import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Fuel, Plus, AlertTriangle, CheckCircle2, XCircle, Droplets,
  Truck, ClipboardCheck, Gauge, ShieldAlert, Trash2, Zap,
  Flame, Wind, Edit2, Plug
} from "lucide-react";

type Tab = "tanks" | "deliveries" | "usage" | "inspections" | "grid-energy";

const FUEL_TYPES = [
  "red_diesel", "white_diesel", "heating_oil", "lpg_bulk", "lpg_bottles",
  "AdBlue", "petrol", "other"
];
const FUEL_TYPE_LABELS: Record<string, string> = {
  red_diesel: "Red Diesel (Gas Oil)",
  white_diesel: "Road Diesel (DERV)",
  heating_oil: "Heating Oil (Kerosene)",
  lpg_bulk: "LPG — Bulk Tank (Calor / Flogas)",
  lpg_bottles: "LPG — Bottled / Cylinder",
  AdBlue: "AdBlue",
  petrol: "Petrol",
  other: "Other",
};
const FUEL_TYPE_REGS: Record<string, string> = {
  red_diesel: "Oil Storage Regs 2001 + HMRC Fuel Duty",
  white_diesel: "HMRC Fuel Duty",
  heating_oil: "Oil Storage Regs 2001",
  lpg_bulk: "DSEAR 2002 / HSE LPGR + UKLPG CoP",
  lpg_bottles: "DSEAR 2002 / HSE — store upright in ventilated cage",
  AdBlue: "No fuel duty implications",
  petrol: "HMRC Fuel Duty",
};
const QUALIFYING_ACTIVITIES = [
  "agriculture", "forestry", "horticulture", "commercial_fishing", "rail", "non_commercial"
];

const METER_TYPES = [
  { value: "electricity", label: "Electricity (Grid)", icon: "⚡", unit: "kWh" },
  { value: "natural_gas", label: "Natural Gas (Grid)", icon: "🔥", unit: "kWh / m³" },
  { value: "lpg_mains", label: "LPG Mains Network", icon: "🔥", unit: "kWh / kg" },
];

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function fmtL(v: string | number | null | undefined) {
  if (v === null || v === undefined || v === "") return "—";
  return `${parseFloat(String(v)).toLocaleString("en-GB", { maximumFractionDigits: 0 })} L`;
}
function fmtKwh(v: string | number | null | undefined) {
  if (v === null || v === undefined || v === "") return "—";
  return `${parseFloat(String(v)).toLocaleString("en-GB", { maximumFractionDigits: 0 })} kWh`;
}
function fmtCost(p: number | null | undefined) {
  if (!p) return "—";
  return `£${(p / 100).toFixed(2)}`;
}
function pct(current: string | number, capacity: string | number) {
  const c = parseFloat(String(current));
  const cap = parseFloat(String(capacity));
  if (!cap) return 0;
  return Math.min(100, Math.round((c / cap) * 100));
}

function TankGauge({ current, capacity }: { current: string | number; capacity: string | number }) {
  const p = pct(current, capacity);
  const colour = p < 20 ? "#ef4444" : p < 40 ? "#f97316" : "#22c55e";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-200 rounded-full h-2" style={{ minWidth: 80 }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${p}%`, background: colour }} />
      </div>
      <span className="text-xs font-medium" style={{ color: colour }}>{p}%</span>
    </div>
  );
}

function ResultBadge({ result }: { result: string }) {
  if (result === "pass") return <Badge className="text-xs" style={{ background: "#d1fae5", color: "#065f46", border: "none" }}>Pass</Badge>;
  if (result === "advisory") return <Badge className="text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "none" }}>Advisory</Badge>;
  return <Badge className="text-xs" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}>Fail</Badge>;
}

function CheckRow({ label, value }: { label: string; value: boolean | null | undefined }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center justify-between py-1 border-b border-gray-50">
      <span className="text-xs text-gray-600">{label}</span>
      {value
        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
        : <XCircle className="w-4 h-4 text-red-500" />
      }
    </div>
  );
}

function MeterTypeIcon({ type }: { type: string }) {
  if (type === "electricity") return <Zap className="w-5 h-5 text-yellow-500" />;
  if (type === "natural_gas") return <Flame className="w-5 h-5 text-orange-500" />;
  if (type === "lpg_mains") return <Flame className="w-5 h-5 text-blue-500" />;
  return <Plug className="w-5 h-5 text-gray-400" />;
}

export default function FuelEnergyPage() {
  const [tab, setTab] = useState<Tab>("tanks");
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const tanksQ = useQuery({
    queryKey: ["fuel-tanks", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/tanks`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const deliveriesQ = useQuery({
    queryKey: ["fuel-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/deliveries`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const usageQ = useQuery({
    queryKey: ["fuel-usage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/usage`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const inspectionsQ = useQuery({
    queryKey: ["fuel-inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fuel/storage-inspections`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const metersQ = useQuery({
    queryKey: ["energy-meters", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/energy/meters`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const readingsQ = useQuery({
    queryKey: ["energy-readings", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/energy/readings`).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["fuel-tanks", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-usage", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-inspections", farmId] });
    qc.invalidateQueries({ queryKey: ["energy-meters", farmId] });
    qc.invalidateQueries({ queryKey: ["energy-readings", farmId] });
  };

  // Tank dialog
  const [showTankDialog, setShowTankDialog] = useState(false);
  const [editTank, setEditTank] = useState<Record<string, unknown> | null>(null);
  const [tankForm, setTankForm] = useState<Record<string, string>>({});

  function openTankAdd() {
    setEditTank(null);
    setTankForm({ fuelType: "red_diesel", isBunded: "false" });
    setShowTankDialog(true);
  }
  function openTankEdit(t: Record<string, unknown>) {
    setEditTank(t);
    setTankForm({
      name: String(t.name ?? ""),
      fuelType: String(t.fuelType ?? "red_diesel"),
      capacityLitres: String(t.capacityLitres ?? ""),
      currentStockLitres: String(t.currentStockLitres ?? "0"),
      location: String(t.location ?? ""),
      isBunded: String(t.isBunded ?? "false"),
      bundCapacityLitres: String(t.bundCapacityLitres ?? ""),
      tankMaterial: String(t.tankMaterial ?? ""),
      installDate: t.installDate ? String(t.installDate).substring(0, 10) : "",
      nextInspectionDue: t.nextInspectionDue ? String(t.nextInspectionDue).substring(0, 10) : "",
      notes: String(t.notes ?? ""),
    });
    setShowTankDialog(true);
  }
  const tankMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editTank ? `/api/farms/${farmId}/fuel/tanks/${editTank.id}` : `/api/farms/${farmId}/fuel/tanks`;
      const res = await fetch(url, { method: editTank ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowTankDialog(false); toast({ title: editTank ? "Tank updated" : "Tank added" }); },
    onError: () => toast({ title: "Error saving tank", variant: "destructive" }),
  });
  const delTankMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/tanks/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Tank removed" }); },
  });

  // Delivery dialog
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState<Record<string, string>>({});
  const deliveryMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/deliveries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowDeliveryDialog(false); toast({ title: "Delivery recorded" }); },
    onError: () => toast({ title: "Error saving delivery", variant: "destructive" }),
  });
  const delDeliveryMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/deliveries/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Delivery removed" }); },
  });

  // Usage dialog
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [usageForm, setUsageForm] = useState<Record<string, string>>({});
  const usageMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/usage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowUsageDialog(false); toast({ title: "Usage recorded" }); },
    onError: () => toast({ title: "Error saving usage", variant: "destructive" }),
  });
  const delUsageMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/usage/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Record removed" }); },
  });

  // Inspection dialog
  const [showInspDialog, setShowInspDialog] = useState(false);
  const [inspForm, setInspForm] = useState<Record<string, string>>({});
  const inspMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/storage-inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowInspDialog(false); toast({ title: "Inspection recorded" }); },
    onError: () => toast({ title: "Error saving inspection", variant: "destructive" }),
  });
  const delInspMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/storage-inspections/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Inspection removed" }); },
  });

  // Meter dialog
  const [showMeterDialog, setShowMeterDialog] = useState(false);
  const [editMeter, setEditMeter] = useState<Record<string, unknown> | null>(null);
  const [meterForm, setMeterForm] = useState<Record<string, string>>({});
  const meterMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editMeter ? `/api/farms/${farmId}/energy/meters/${editMeter.id}` : `/api/farms/${farmId}/energy/meters`;
      const res = await fetch(url, { method: editMeter ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowMeterDialog(false); toast({ title: editMeter ? "Meter updated" : "Meter added" }); },
    onError: () => toast({ title: "Error saving meter", variant: "destructive" }),
  });
  const delMeterMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/energy/meters/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Meter removed" }); },
  });

  // Reading dialog
  const [showReadingDialog, setShowReadingDialog] = useState(false);
  const [readingForm, setReadingForm] = useState<Record<string, string>>({});
  const readingMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/energy/readings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowReadingDialog(false); toast({ title: "Reading recorded" }); },
    onError: () => toast({ title: "Error saving reading", variant: "destructive" }),
  });
  const delReadingMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/energy/readings/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Reading removed" }); },
  });

  const tanks: Record<string, unknown>[] = tanksQ.data ?? [];
  const deliveries: Record<string, unknown>[] = deliveriesQ.data ?? [];
  const usages: Record<string, unknown>[] = usageQ.data ?? [];
  const inspections: Record<string, unknown>[] = inspectionsQ.data ?? [];
  const meters: Record<string, unknown>[] = metersQ.data ?? [];
  const readings: Record<string, unknown>[] = readingsQ.data ?? [];

  const totalStockL = tanks.reduce((s, t) => s + parseFloat(String(t.currentStockLitres ?? 0)), 0);
  const unbundedTanks = tanks.filter(t => !t.isBunded && !["lpg_bottles", "AdBlue"].includes(String(t.fuelType)));
  const overdueTanks = tanks.filter(t => t.nextInspectionDue && new Date(String(t.nextInspectionDue)) < new Date());
  const totalDeliveredYTD = deliveries
    .filter(d => new Date(String(d.deliveryDate)).getFullYear() === new Date().getFullYear())
    .reduce((s, d) => s + parseFloat(String(d.quantityLitres ?? 0)), 0);

  // Grid energy totals
  const elecMeters = meters.filter(m => m.meterType === "electricity");
  const gasMeters = meters.filter(m => m.meterType === "natural_gas" || m.meterType === "lpg_mains");
  const currentYearReadings = readings.filter(r => new Date(String(r.readingDate)).getFullYear() === new Date().getFullYear());
  const totalElecKwh = currentYearReadings.filter(r => {
    const m = meters.find(m => m.id === r.meterId);
    return m?.meterType === "electricity";
  }).reduce((s, r) => s + parseFloat(String(r.consumptionKwh ?? 0)), 0);
  const totalGasKwh = currentYearReadings.filter(r => {
    const m = meters.find(m => m.id === r.meterId);
    return m?.meterType === "natural_gas" || m?.meterType === "lpg_mains";
  }).reduce((s, r) => s + parseFloat(String(r.consumptionKwh ?? 0)), 0);
  const totalEnergyCostYTD = currentYearReadings.reduce((s, r) => s + (r.costPence ? Number(r.costPence) : 0), 0);

  const [selectedMeterId, setSelectedMeterId] = useState<string>("all");
  const filteredReadings = selectedMeterId === "all" ? readings : readings.filter(r => String(r.meterId) === selectedMeterId);

  return (
    <AppLayout title="Fuel & Energy">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Red diesel, LPG, heating oil, electricity and gas — complete on-farm energy register for HMRC compliance, Red Tractor and carbon reporting
        </p>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><Gauge className="w-4 h-4 text-green-700" /><span className="text-xs text-gray-500">Total tank stock</span></div>
            <p className="text-xl font-bold text-gray-800">{fmtL(totalStockL)}</p>
            <p className="text-xs text-gray-400">{tanks.length} tank{tanks.length !== 1 ? "s" : ""} registered</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><Truck className="w-4 h-4 text-blue-600" /><span className="text-xs text-gray-500">Fuel delivered YTD</span></div>
            <p className="text-xl font-bold text-gray-800">{fmtL(totalDeliveredYTD)}</p>
            <p className="text-xs text-gray-400">{deliveries.filter(d => new Date(String(d.deliveryDate)).getFullYear() === new Date().getFullYear()).length} deliveries</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><Zap className="w-4 h-4 text-yellow-500" /><span className="text-xs text-gray-500">Electricity YTD</span></div>
            <p className="text-xl font-bold text-gray-800">{fmtKwh(totalElecKwh || null)}</p>
            <p className="text-xs text-gray-400">{elecMeters.length} meter{elecMeters.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><Flame className="w-4 h-4 text-orange-500" /><span className="text-xs text-gray-500">Gas / LPG energy YTD</span></div>
            <p className="text-xl font-bold text-gray-800">{fmtKwh(totalGasKwh || null)}</p>
            <p className="text-xs text-gray-400">{gasMeters.length} meter{gasMeters.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {(unbundedTanks.length > 0 || overdueTanks.length > 0) && (
          <div className="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-sm text-amber-800">
              {unbundedTanks.length > 0 && <><strong>{unbundedTanks.length} tank{unbundedTanks.length > 1 ? "s are" : " is"} not bunded</strong> (Oil Storage Regs 2001 apply to tanks ≥201L). </>}
              {overdueTanks.length > 0 && <><strong>{overdueTanks.length} tank{overdueTanks.length > 1 ? "s have" : " has"} an overdue inspection.</strong></>}
            </p>
          </div>
        )}

        <TabBar className="mb-6">
          <TabButton active={tab === "tanks"} onClick={() => setTab("tanks")}>Tank Register ({tanks.length})</TabButton>
          <TabButton active={tab === "deliveries"} onClick={() => setTab("deliveries")}>Deliveries ({deliveries.length})</TabButton>
          <TabButton active={tab === "usage"} onClick={() => setTab("usage")}>Usage Log ({usages.length})</TabButton>
          <TabButton active={tab === "inspections"} onClick={() => setTab("inspections")}>Inspections ({inspections.length})</TabButton>
          <TabButton active={tab === "grid-energy"} onClick={() => setTab("grid-energy")}>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" />Grid Energy ({meters.length})</span>
          </TabButton>
        </TabBar>

        {/* ── TANKS ── */}
        {tab === "tanks" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Fuel & LPG Tanks</h3>
                <p className="text-xs text-gray-500">Register all on-farm storage tanks — diesel, heating oil and LPG. Regulations differ by fuel type.</p>
              </div>
              <Button onClick={openTankAdd} className="bg-green-800 hover:bg-green-900 text-white"><Plus className="w-4 h-4 mr-1" />Add Tank</Button>
            </div>
            {tanks.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Fuel className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No tanks registered</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {tanks.map((tank) => {
                  const isLpg = String(tank.fuelType).startsWith("lpg");
                  const isOverdue = tank.nextInspectionDue && new Date(String(tank.nextInspectionDue)) < new Date();
                  const regs = FUEL_TYPE_REGS[String(tank.fuelType)];
                  return (
                    <div key={String(tank.id)} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{String(tank.name)}</p>
                          <p className="text-xs text-gray-500">{FUEL_TYPE_LABELS[String(tank.fuelType)] ?? String(tank.fuelType)}</p>
                          {regs && <p className="text-xs text-blue-600 mt-0.5">{regs}</p>}
                        </div>
                        <div className="flex gap-1.5 items-center flex-wrap justify-end">
                          {isLpg
                            ? <Badge className="text-xs" style={{ background: "#eff6ff", color: "#1d4ed8", border: "none" }}>LPG / DSEAR</Badge>
                            : tank.isBunded
                              ? <Badge className="text-xs" style={{ background: "#d1fae5", color: "#065f46", border: "none" }}>Bunded</Badge>
                              : <Badge className="text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "none" }}>Not bunded</Badge>
                          }
                          <Button size="sm" variant="ghost" onClick={() => openTankEdit(tank)} className="h-7 px-2 text-xs"><Edit2 className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" onClick={() => delTankMut.mutate(Number(tank.id))} className="h-7 px-2 text-xs text-red-600"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      {String(tank.fuelType) !== "lpg_bottles" && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{fmtL(tank.currentStockLitres as string)} remaining</span>
                            <span>of {fmtL(tank.capacityLitres as string)}</span>
                          </div>
                          <TankGauge current={tank.currentStockLitres as string} capacity={tank.capacityLitres as string} />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600">
                        <span><span className="text-gray-400">Location:</span> {String(tank.location ?? "—")}</span>
                        {tank.tankMaterial && <span><span className="text-gray-400">Material:</span> {String(tank.tankMaterial)}</span>}
                        {tank.nextInspectionDue && (
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                            <span className="text-gray-400">Inspect by:</span> {fmtDate(String(tank.nextInspectionDue))}
                            {isOverdue && " ⚠"}
                          </span>
                        )}
                        {tank.isBunded && tank.bundCapacityLitres && (
                          <span><span className="text-gray-400">Bund:</span> {fmtL(tank.bundCapacityLitres as string)}</span>
                        )}
                      </div>
                      {tank.notes && <p className="text-xs text-gray-400 mt-2 italic">{String(tank.notes)}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── DELIVERIES ── */}
        {tab === "deliveries" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Fuel Deliveries</h3>
                <p className="text-xs text-gray-500">Retain all delivery notes and invoices — HMRC may request these during a fuel duty inspection</p>
              </div>
              <Button onClick={() => { setDeliveryForm({ fuelType: "red_diesel", qualifyingUse: "agriculture", deliveryDate: new Date().toISOString().substring(0, 10) }); setShowDeliveryDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
                <Plus className="w-4 h-4 mr-1" />Log Delivery
              </Button>
            </div>
            {deliveries.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><Truck className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-medium">No deliveries recorded</p></div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tank / Fuel</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier / Note</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Litres</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Cost</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Use</th>
                    <th className="px-4 py-3"></th>
                  </tr></thead>
                  <tbody>
                    {deliveries.map((d) => {
                      const tank = tanks.find(t => t.id === d.tankId);
                      return (
                        <tr key={String(d.id)} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700">{fmtDate(String(d.deliveryDate ?? ""))}</td>
                          <td className="px-4 py-3 text-xs">
                            <p className="text-gray-700">{tank ? String(tank.name) : "—"}</p>
                            <p className="text-gray-400">{FUEL_TYPE_LABELS[String(d.fuelType)] ?? String(d.fuelType)}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{String(d.supplierName ?? "—")}</p>
                            <p className="text-xs text-gray-400">{String(d.deliveryNoteNumber ?? "")} {d.invoiceReference ? `/ ${d.invoiceReference}` : ""}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-green-700">{fmtL(d.quantityLitres as string)}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{fmtCost(d.totalCostPence as number)}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 capitalize">{String(d.qualifyingUse ?? "agriculture").replace(/_/g, " ")}</td>
                          <td className="px-4 py-3"><Button size="sm" variant="ghost" onClick={() => delDeliveryMut.mutate(Number(d.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── USAGE ── */}
        {tab === "usage" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Fuel Usage Log</h3>
                <p className="text-xs text-gray-500">Record every draw-down from tanks — demonstrates qualifying use for HMRC rebated fuel</p>
              </div>
              <Button onClick={() => { setUsageForm({ qualifyingActivity: "agriculture", usageDate: new Date().toISOString().substring(0, 10) }); setShowUsageDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
                <Plus className="w-4 h-4 mr-1" />Record Usage
              </Button>
            </div>
            {usages.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><Droplets className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-medium">No usage records</p></div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tank</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Purpose / Activity</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Litres</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Recorded by</th>
                    <th className="px-4 py-3"></th>
                  </tr></thead>
                  <tbody>
                    {usages.map((u) => {
                      const tank = tanks.find(t => t.id === u.tankId);
                      return (
                        <tr key={String(u.id)} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700">{fmtDate(String(u.usageDate ?? ""))}</td>
                          <td className="px-4 py-3 text-gray-600 text-xs">{tank ? String(tank.name) : "—"}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{String(u.purpose ?? "—")}</p>
                            <p className="text-xs text-gray-400 capitalize">{String(u.qualifyingActivity ?? "").replace(/_/g, " ")}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-red-600">{fmtL(u.quantityLitres as string)}</td>
                          <td className="px-4 py-3 text-xs text-gray-500">{String(u.recordedBy ?? "—")}</td>
                          <td className="px-4 py-3"><Button size="sm" variant="ghost" onClick={() => delUsageMut.mutate(Number(u.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── INSPECTIONS ── */}
        {tab === "inspections" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Storage Inspections</h3>
                <p className="text-xs text-gray-500">Annual oil storage inspection checklist + LPG periodic inspection records (UKLPG CoP)</p>
              </div>
              <Button onClick={() => { setInspForm({ overallResult: "pass", inspectionDate: new Date().toISOString().substring(0, 10) }); setShowInspDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
                <Plus className="w-4 h-4 mr-1" />Record Inspection
              </Button>
            </div>
            {inspections.length === 0 ? (
              <div className="text-center py-16 text-gray-400"><ClipboardCheck className="w-10 h-10 mx-auto mb-3 opacity-30" /><p className="font-medium">No inspections recorded</p></div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {inspections.map((ins) => {
                  const tank = tanks.find(t => t.id === ins.tankId);
                  return (
                    <div key={String(ins.id)} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{fmtDate(String(ins.inspectionDate ?? ""))}</p>
                          <p className="text-xs text-gray-500">{tank ? String(tank.name) : "All tanks"} — {String(ins.inspector ?? "—")}</p>
                        </div>
                        <div className="flex gap-2">
                          <ResultBadge result={String(ins.overallResult ?? "pass")} />
                          <Button size="sm" variant="ghost" onClick={() => delInspMut.mutate(Number(ins.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      <div className="mb-3 space-y-0.5">
                        <CheckRow label="Bunding / secondary containment" value={ins.bundingOk as boolean} />
                        <CheckRow label="Tank labelling correct" value={ins.labellingOk as boolean} />
                        <CheckRow label="Spill kit present" value={ins.spillKitPresent as boolean} />
                        <CheckRow label="Spill kit complete" value={ins.spillKitComplete as boolean} />
                        <CheckRow label="Tank condition OK" value={ins.tankConditionOk as boolean} />
                        <CheckRow label="Pipework OK" value={ins.pipeworkOk as boolean} />
                        <CheckRow label="Fill point locked" value={ins.fillPointLocked as boolean} />
                        <CheckRow label="Overfill protection" value={ins.overfillProtectionOk as boolean} />
                        <CheckRow label="Drainage risk managed" value={ins.drainageRiskOk as boolean} />
                      </div>
                      {ins.issuesFound && <div className="bg-red-50 rounded p-2 mb-2"><p className="text-xs font-medium text-red-800">Issues:</p><p className="text-xs text-red-700">{String(ins.issuesFound)}</p></div>}
                      {ins.actionsRequired && <div className="bg-amber-50 rounded p-2 mb-2"><p className="text-xs font-medium text-amber-800">Actions:</p><p className="text-xs text-amber-700">{String(ins.actionsRequired)}</p></div>}
                      <p className="text-xs text-gray-400 mt-2">Next due: {fmtDate(String(ins.nextInspectionDue ?? ""))}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── GRID ENERGY ── */}
        {tab === "grid-energy" && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-semibold text-gray-800">Grid Energy — Meters & Readings</h3>
                <p className="text-xs text-gray-500">Track electricity, natural gas and mains LPG consumption for carbon reporting, ESOS compliance and cost management</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setReadingForm({ readingType: "actual", readingDate: new Date().toISOString().substring(0, 10) }); setShowReadingDialog(true); }}>
                  <Plus className="w-4 h-4 mr-1" />Add Reading
                </Button>
                <Button onClick={() => { setEditMeter(null); setMeterForm({ meterType: "electricity" }); setShowMeterDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
                  <Plus className="w-4 h-4 mr-1" />Add Meter
                </Button>
              </div>
            </div>

            {/* Info banner */}
            <div className="flex gap-2 items-start bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
              <Zap className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800">
                <strong>Why track grid energy?</strong> Electricity and gas consumption data is required for Scope 1 &amp; 2 carbon footprint calculations, ESOS energy audits, and increasingly for Red Tractor sustainability assessments. MPAN (electricity) and MPRN (gas) numbers appear on your utility bills.
              </p>
            </div>

            {/* Meters */}
            {meters.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Plug className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No energy meters registered</p>
                <p className="text-sm">Add your electricity and gas meters to start logging readings</p>
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-3 mb-6">
                  {meters.map((m) => {
                    const meterReadings = readings.filter(r => r.meterId === m.id);
                    const latestReading = meterReadings[0];
                    const ytdKwh = currentYearReadings.filter(r => r.meterId === m.id).reduce((s, r) => s + parseFloat(String(r.consumptionKwh ?? 0)), 0);
                    const ytdCost = currentYearReadings.filter(r => r.meterId === m.id).reduce((s, r) => s + (r.costPence ? Number(r.costPence) : 0), 0);
                    const mLabel = METER_TYPES.find(t => t.value === m.meterType);
                    return (
                      <div key={String(m.id)} className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <MeterTypeIcon type={String(m.meterType)} />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{String(m.name)}</p>
                              <p className="text-xs text-gray-400">{mLabel?.label ?? String(m.meterType)}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => { setEditMeter(m); setMeterForm({ name: String(m.name ?? ""), meterType: String(m.meterType ?? "electricity"), meterReference: String(m.meterReference ?? ""), mpan: String(m.mpan ?? ""), mprn: String(m.mprn ?? ""), supplier: String(m.supplier ?? ""), accountNumber: String(m.accountNumber ?? ""), location: String(m.location ?? ""), tariffName: String(m.tariffName ?? ""), unitRatePencePerKwh: String(m.unitRatePencePerKwh ?? ""), standingChargePencePerDay: String(m.standingChargePencePerDay ?? ""), notes: String(m.notes ?? "") }); setShowMeterDialog(true); }} className="h-7 px-2"><Edit2 className="w-3 h-3" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => delMeterMut.mutate(Number(m.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
                          </div>
                        </div>
                        {m.location && <p className="text-xs text-gray-500 mb-2">{String(m.location)}</p>}
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          {m.mpan && <div><span className="text-gray-400">MPAN:</span> <span className="font-mono text-gray-700">{String(m.mpan)}</span></div>}
                          {m.mprn && <div><span className="text-gray-400">MPRN:</span> <span className="font-mono text-gray-700">{String(m.mprn)}</span></div>}
                          {m.supplier && <div><span className="text-gray-400">Supplier:</span> {String(m.supplier)}</div>}
                          {m.tariffName && <div><span className="text-gray-400">Tariff:</span> {String(m.tariffName)}</div>}
                          {m.unitRatePencePerKwh && <div><span className="text-gray-400">Rate:</span> {String(m.unitRatePencePerKwh)}p/kWh</div>}
                        </div>
                        <div className="border-t pt-2 mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div><p className="text-gray-400">YTD consumption</p><p className="font-bold text-gray-800">{fmtKwh(ytdKwh || null)}</p></div>
                          <div><p className="text-gray-400">YTD cost</p><p className="font-bold text-gray-800">{ytdCost ? fmtCost(ytdCost) : "—"}</p></div>
                          {latestReading && <div className="col-span-2"><p className="text-gray-400">Last reading</p><p className="text-gray-700">{parseFloat(String(latestReading.meterReading)).toLocaleString()} — {fmtDate(String(latestReading.readingDate))}</p></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Readings table */}
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800 text-sm">Meter Readings</h4>
                  <Select value={selectedMeterId} onValueChange={setSelectedMeterId}>
                    <SelectTrigger className="w-52 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All meters</SelectItem>
                      {meters.map(m => <SelectItem key={String(m.id)} value={String(m.id)}>{String(m.name)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {filteredReadings.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">No readings recorded yet</div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-gray-50 border-b">
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Meter</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Reading</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Consumption</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Export</th>
                        <th className="text-right px-4 py-3 font-medium text-gray-600">Cost</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-600">Invoice</th>
                        <th className="px-4 py-3"></th>
                      </tr></thead>
                      <tbody>
                        {filteredReadings.map((r) => {
                          const meter = meters.find(m => m.id === r.meterId);
                          return (
                            <tr key={String(r.id)} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-700">{fmtDate(String(r.readingDate ?? ""))}</td>
                              <td className="px-4 py-3 text-xs">
                                <div className="flex items-center gap-1">
                                  {meter && <MeterTypeIcon type={String(meter.meterType)} />}
                                  <span>{meter ? String(meter.name) : "—"}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-gray-700">{parseFloat(String(r.meterReading)).toLocaleString()}</td>
                              <td className="px-4 py-3 text-right font-medium text-green-700">{r.consumptionKwh ? fmtKwh(r.consumptionKwh as string) : "—"}</td>
                              <td className="px-4 py-3 text-right text-blue-600">{r.exportKwh ? fmtKwh(r.exportKwh as string) : "—"}</td>
                              <td className="px-4 py-3 text-right text-gray-600">{fmtCost(r.costPence as number)}</td>
                              <td className="px-4 py-3 text-xs text-gray-500 capitalize">{String(r.readingType ?? "actual")}</td>
                              <td className="px-4 py-3 text-xs text-gray-400">{String(r.invoiceReference ?? "—")}</td>
                              <td className="px-4 py-3"><Button size="sm" variant="ghost" onClick={() => delReadingMut.mutate(Number(r.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── TANK DIALOG ── */}
      <Dialog open={showTankDialog} onOpenChange={setShowTankDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editTank ? "Edit Tank" : "Add Fuel / LPG Tank"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tank name *</Label><Input value={tankForm.name ?? ""} onChange={e => setTankForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Main Yard Tank" /></div>
              <div><Label>Fuel type *</Label>
                <Select value={tankForm.fuelType ?? "red_diesel"} onValueChange={v => setTankForm(f => ({ ...f, fuelType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FUEL_TYPES.map(ft => <SelectItem key={ft} value={ft}>{FUEL_TYPE_LABELS[ft] ?? ft}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {tankForm.fuelType === "lpg_bottles" ? (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
                LPG cylinders/bottles: note the number of cylinders and total kg capacity. DSEAR 2002 requires cylinders to be stored upright in a ventilated cage, away from ignition sources and drains.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Capacity (litres) *</Label><Input type="number" value={tankForm.capacityLitres ?? ""} onChange={e => setTankForm(f => ({ ...f, capacityLitres: e.target.value }))} placeholder="10000" /></div>
                <div><Label>Current stock (litres)</Label><Input type="number" value={tankForm.currentStockLitres ?? ""} onChange={e => setTankForm(f => ({ ...f, currentStockLitres: e.target.value }))} placeholder="0" /></div>
              </div>
            )}
            <div><Label>Location</Label><Input value={tankForm.location ?? ""} onChange={e => setTankForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Main yard" /></div>
            {!String(tankForm.fuelType ?? "").startsWith("lpg") && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Tank material</Label><Input value={tankForm.tankMaterial ?? ""} onChange={e => setTankForm(f => ({ ...f, tankMaterial: e.target.value }))} placeholder="Steel / Plastic" /></div>
                <div><Label>Is bunded?</Label>
                  <Select value={tankForm.isBunded ?? "false"} onValueChange={v => setTankForm(f => ({ ...f, isBunded: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="true">Yes — bunded</SelectItem><SelectItem value="false">No</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {tankForm.isBunded === "true" && (
              <div><Label>Bund capacity (litres)</Label><Input type="number" value={tankForm.bundCapacityLitres ?? ""} onChange={e => setTankForm(f => ({ ...f, bundCapacityLitres: e.target.value }))} /></div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Install date</Label><Input type="date" value={tankForm.installDate ?? ""} onChange={e => setTankForm(f => ({ ...f, installDate: e.target.value }))} /></div>
              <div><Label>Next inspection due</Label><Input type="date" value={tankForm.nextInspectionDue ?? ""} onChange={e => setTankForm(f => ({ ...f, nextInspectionDue: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={tankForm.notes ?? ""} onChange={e => setTankForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTankDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!tankForm.name) return toast({ title: "Tank name is required", variant: "destructive" });
              tankMut.mutate({ ...tankForm, isBunded: tankForm.isBunded === "true" });
            }}>{editTank ? "Save Changes" : "Add Tank"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELIVERY DIALOG ── */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Log Fuel Delivery</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" value={deliveryForm.deliveryDate ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, deliveryDate: e.target.value }))} /></div>
              <div><Label>Tank</Label>
                <Select value={deliveryForm.tankId ?? ""} onValueChange={v => setDeliveryForm(f => ({ ...f, tankId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select tank" /></SelectTrigger>
                  <SelectContent>{tanks.map(t => <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Fuel type</Label>
                <Select value={deliveryForm.fuelType ?? "red_diesel"} onValueChange={v => setDeliveryForm(f => ({ ...f, fuelType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FUEL_TYPES.map(ft => <SelectItem key={ft} value={ft}>{FUEL_TYPE_LABELS[ft] ?? ft}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Quantity (litres) *</Label><Input type="number" value={deliveryForm.quantityLitres ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, quantityLitres: e.target.value }))} placeholder="5000" /></div>
            </div>
            <div><Label>Supplier</Label><Input value={deliveryForm.supplierName ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, supplierName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Delivery note no.</Label><Input value={deliveryForm.deliveryNoteNumber ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, deliveryNoteNumber: e.target.value }))} /></div>
              <div><Label>Invoice ref</Label><Input value={deliveryForm.invoiceReference ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, invoiceReference: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Unit price (p/litre)</Label><Input type="number" value={deliveryForm.unitPricePence ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, unitPricePence: e.target.value }))} /></div>
              <div><Label>Qualifying use</Label>
                <Select value={deliveryForm.qualifyingUse ?? "agriculture"} onValueChange={v => setDeliveryForm(f => ({ ...f, qualifyingUse: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{QUALIFYING_ACTIVITIES.map(a => <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Driver</Label><Input value={deliveryForm.driverName ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, driverName: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={deliveryForm.notes ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!deliveryForm.deliveryDate || !deliveryForm.quantityLitres) return toast({ title: "Date and quantity required", variant: "destructive" });
              const totalCostPence = deliveryForm.unitPricePence && deliveryForm.quantityLitres ? Math.round(parseFloat(deliveryForm.unitPricePence) * parseFloat(deliveryForm.quantityLitres)) : undefined;
              deliveryMut.mutate({ ...deliveryForm, totalCostPence });
            }}>Log Delivery</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── USAGE DIALOG ── */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record Fuel Usage</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" value={usageForm.usageDate ?? ""} onChange={e => setUsageForm(f => ({ ...f, usageDate: e.target.value }))} /></div>
              <div><Label>Tank</Label>
                <Select value={usageForm.tankId ?? ""} onValueChange={v => setUsageForm(f => ({ ...f, tankId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select tank" /></SelectTrigger>
                  <SelectContent>{tanks.map(t => <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Purpose / Activity *</Label><Input value={usageForm.purpose ?? ""} onChange={e => setUsageForm(f => ({ ...f, purpose: e.target.value }))} placeholder="e.g. Ploughing — Home Field" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity (litres) *</Label><Input type="number" value={usageForm.quantityLitres ?? ""} onChange={e => setUsageForm(f => ({ ...f, quantityLitres: e.target.value }))} /></div>
              <div><Label>Qualifying activity</Label>
                <Select value={usageForm.qualifyingActivity ?? "agriculture"} onValueChange={v => setUsageForm(f => ({ ...f, qualifyingActivity: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{QUALIFYING_ACTIVITIES.map(a => <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Recorded by</Label><Input value={usageForm.recordedBy ?? ""} onChange={e => setUsageForm(f => ({ ...f, recordedBy: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={usageForm.notes ?? ""} onChange={e => setUsageForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUsageDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!usageForm.usageDate || !usageForm.quantityLitres || !usageForm.purpose) return toast({ title: "Date, quantity and purpose required", variant: "destructive" });
              usageMut.mutate({ ...usageForm });
            }}>Record Usage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── INSPECTION DIALOG ── */}
      <Dialog open={showInspDialog} onOpenChange={setShowInspDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record Storage Inspection</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" value={inspForm.inspectionDate ?? ""} onChange={e => setInspForm(f => ({ ...f, inspectionDate: e.target.value }))} /></div>
              <div><Label>Tank</Label>
                <Select value={inspForm.tankId ?? ""} onValueChange={v => setInspForm(f => ({ ...f, tankId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select tank" /></SelectTrigger>
                  <SelectContent>{tanks.map(t => <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Inspector</Label><Input value={inspForm.inspector ?? ""} onChange={e => setInspForm(f => ({ ...f, inspector: e.target.value }))} /></div>
              <div><Label>Result *</Label>
                <Select value={inspForm.overallResult ?? "pass"} onValueChange={v => setInspForm(f => ({ ...f, overallResult: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pass">Pass</SelectItem><SelectItem value="advisory">Advisory</SelectItem><SelectItem value="fail">Fail</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Checklist</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "bundingOk", label: "Bunding OK" }, { key: "labellingOk", label: "Labelling OK" },
                  { key: "spillKitPresent", label: "Spill kit present" }, { key: "spillKitComplete", label: "Spill kit complete" },
                  { key: "tankConditionOk", label: "Tank condition OK" }, { key: "pipeworkOk", label: "Pipework OK" },
                  { key: "fillPointLocked", label: "Fill point locked" }, { key: "overfillProtectionOk", label: "Overfill protection" },
                  { key: "drainageRiskOk", label: "Drainage risk OK" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Select value={inspForm[key] ?? ""} onValueChange={v => setInspForm(f => ({ ...f, [key]: v }))}>
                      <SelectTrigger className="h-7 text-xs w-16"><SelectValue placeholder="?" /></SelectTrigger>
                      <SelectContent><SelectItem value="true">✓</SelectItem><SelectItem value="false">✗</SelectItem></SelectContent>
                    </Select>
                    <span className="text-xs text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div><Label>Issues found</Label><Textarea value={inspForm.issuesFound ?? ""} onChange={e => setInspForm(f => ({ ...f, issuesFound: e.target.value }))} rows={2} /></div>
            <div><Label>Actions required</Label><Textarea value={inspForm.actionsRequired ?? ""} onChange={e => setInspForm(f => ({ ...f, actionsRequired: e.target.value }))} rows={2} /></div>
            <div><Label>Next inspection due</Label><Input type="date" value={inspForm.nextInspectionDue ?? ""} onChange={e => setInspForm(f => ({ ...f, nextInspectionDue: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={inspForm.notes ?? ""} onChange={e => setInspForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInspDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!inspForm.inspectionDate) return toast({ title: "Date required", variant: "destructive" });
              const boolFields = ["bundingOk", "labellingOk", "spillKitPresent", "spillKitComplete", "tankConditionOk", "pipeworkOk", "fillPointLocked", "overfillProtectionOk", "drainageRiskOk"];
              const data: Record<string, unknown> = { ...inspForm };
              boolFields.forEach(k => { if (data[k] !== undefined && data[k] !== "") data[k] = data[k] === "true"; else delete data[k]; });
              if (!data.tankId) delete data.tankId;
              inspMut.mutate(data);
            }}>Save Inspection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── METER DIALOG ── */}
      <Dialog open={showMeterDialog} onOpenChange={setShowMeterDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editMeter ? "Edit Meter" : "Add Energy Meter"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Meter name *</Label><Input value={meterForm.name ?? ""} onChange={e => setMeterForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Farmhouse Electricity" /></div>
              <div><Label>Meter type *</Label>
                <Select value={meterForm.meterType ?? "electricity"} onValueChange={v => setMeterForm(f => ({ ...f, meterType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{METER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Location / Building</Label><Input value={meterForm.location ?? ""} onChange={e => setMeterForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Farmhouse, Grain store, Livestock building" /></div>
            <div className="bg-blue-50 border border-blue-200 rounded p-2 grid grid-cols-2 gap-2">
              <div>
                <Label className="text-blue-800">MPAN (electricity)</Label>
                <Input value={meterForm.mpan ?? ""} onChange={e => setMeterForm(f => ({ ...f, mpan: e.target.value }))} placeholder="13-digit number on bill" className="font-mono text-sm" />
              </div>
              <div>
                <Label className="text-blue-800">MPRN (gas)</Label>
                <Input value={meterForm.mprn ?? ""} onChange={e => setMeterForm(f => ({ ...f, mprn: e.target.value }))} placeholder="6–10 digit number on bill" className="font-mono text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Supplier</Label><Input value={meterForm.supplier ?? ""} onChange={e => setMeterForm(f => ({ ...f, supplier: e.target.value }))} placeholder="e.g. OVO Energy" /></div>
              <div><Label>Account number</Label><Input value={meterForm.accountNumber ?? ""} onChange={e => setMeterForm(f => ({ ...f, accountNumber: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tariff name</Label><Input value={meterForm.tariffName ?? ""} onChange={e => setMeterForm(f => ({ ...f, tariffName: e.target.value }))} placeholder="e.g. Agri Flex 24" /></div>
              <div><Label>Unit rate (p/kWh)</Label><Input type="number" step="0.01" value={meterForm.unitRatePencePerKwh ?? ""} onChange={e => setMeterForm(f => ({ ...f, unitRatePencePerKwh: e.target.value }))} placeholder="24.5" /></div>
            </div>
            <div><Label>Standing charge (p/day)</Label><Input type="number" step="0.01" value={meterForm.standingChargePencePerDay ?? ""} onChange={e => setMeterForm(f => ({ ...f, standingChargePencePerDay: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={meterForm.notes ?? ""} onChange={e => setMeterForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMeterDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!meterForm.name || !meterForm.meterType) return toast({ title: "Name and type required", variant: "destructive" });
              const data: Record<string, unknown> = { ...meterForm };
              if (data.unitRatePencePerKwh) data.unitRatePencePerKwh = Math.round(parseFloat(String(data.unitRatePencePerKwh)) * 100) / 100;
              meterMut.mutate(data);
            }}>{editMeter ? "Save Changes" : "Add Meter"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── READING DIALOG ── */}
      <Dialog open={showReadingDialog} onOpenChange={setShowReadingDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record Meter Reading</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Reading date *</Label><Input type="date" value={readingForm.readingDate ?? ""} onChange={e => setReadingForm(f => ({ ...f, readingDate: e.target.value }))} /></div>
              <div><Label>Meter *</Label>
                <Select value={readingForm.meterId ?? ""} onValueChange={v => setReadingForm(f => ({ ...f, meterId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select meter" /></SelectTrigger>
                  <SelectContent>{meters.map(m => <SelectItem key={String(m.id)} value={String(m.id)}>{String(m.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Meter reading *</Label><Input type="number" step="0.01" value={readingForm.meterReading ?? ""} onChange={e => setReadingForm(f => ({ ...f, meterReading: e.target.value }))} placeholder="Cumulative reading" className="font-mono" /></div>
              <div><Label>Reading type</Label>
                <Select value={readingForm.readingType ?? "actual"} onValueChange={v => setReadingForm(f => ({ ...f, readingType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actual">Actual read</SelectItem>
                    <SelectItem value="estimated">Estimated</SelectItem>
                    <SelectItem value="final">Final (change of tenancy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Consumption (kWh)</Label><Input type="number" step="0.01" value={readingForm.consumptionKwh ?? ""} onChange={e => setReadingForm(f => ({ ...f, consumptionKwh: e.target.value }))} placeholder="kWh since last reading" /></div>
              <div><Label>Export (kWh)</Label><Input type="number" step="0.01" value={readingForm.exportKwh ?? ""} onChange={e => setReadingForm(f => ({ ...f, exportKwh: e.target.value }))} placeholder="Solar / wind export" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bill cost (£)</Label><Input type="number" step="0.01" value={readingForm.costPounds ?? ""} onChange={e => setReadingForm(f => ({ ...f, costPounds: e.target.value }))} placeholder="Amount on bill" /></div>
              <div><Label>Invoice reference</Label><Input value={readingForm.invoiceReference ?? ""} onChange={e => setReadingForm(f => ({ ...f, invoiceReference: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Billing period start</Label><Input type="date" value={readingForm.billingPeriodStart ?? ""} onChange={e => setReadingForm(f => ({ ...f, billingPeriodStart: e.target.value }))} /></div>
              <div><Label>Billing period end</Label><Input type="date" value={readingForm.billingPeriodEnd ?? ""} onChange={e => setReadingForm(f => ({ ...f, billingPeriodEnd: e.target.value }))} /></div>
            </div>
            <div><Label>Recorded by</Label><Input value={readingForm.recordedBy ?? ""} onChange={e => setReadingForm(f => ({ ...f, recordedBy: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={readingForm.notes ?? ""} onChange={e => setReadingForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReadingDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!readingForm.readingDate || !readingForm.meterId || !readingForm.meterReading) return toast({ title: "Date, meter and reading required", variant: "destructive" });
              const costPence = readingForm.costPounds ? Math.round(parseFloat(readingForm.costPounds) * 100) : undefined;
              const data: Record<string, unknown> = { ...readingForm, costPence };
              delete data.costPounds;
              if (!data.billingPeriodStart) delete data.billingPeriodStart;
              if (!data.billingPeriodEnd) delete data.billingPeriodEnd;
              if (!data.consumptionKwh) delete data.consumptionKwh;
              if (!data.exportKwh) delete data.exportKwh;
              readingMut.mutate(data);
            }}>Save Reading</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
