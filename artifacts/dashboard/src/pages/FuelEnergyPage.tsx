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
  Truck, ClipboardCheck, Gauge, ShieldAlert, Info, Trash2
} from "lucide-react";

type Tab = "tanks" | "deliveries" | "usage" | "inspections";

const FUEL_TYPES = ["red_diesel", "white_diesel", "AdBlue", "petrol", "heating_oil"];
const FUEL_TYPE_LABELS: Record<string, string> = {
  red_diesel: "Red Diesel (Gas Oil)",
  white_diesel: "Road Diesel (DERV)",
  AdBlue: "AdBlue",
  petrol: "Petrol",
  heating_oil: "Heating Oil",
};
const QUALIFYING_ACTIVITIES = ["agriculture", "forestry", "horticulture", "commercial_fishing", "rail", "non_commercial"];

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB");
}
function fmtL(v: string | number | null | undefined) {
  if (v === null || v === undefined) return "—";
  return `${parseFloat(String(v)).toLocaleString("en-GB", { maximumFractionDigits: 0 })} L`;
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

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["fuel-tanks", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-deliveries", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-usage", farmId] });
    qc.invalidateQueries({ queryKey: ["fuel-inspections", farmId] });
  };

  // --- Tank dialog state ---
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
      supplierId: String(t.supplierId ?? ""),
      notes: String(t.notes ?? ""),
    });
    setShowTankDialog(true);
  }
  const tankMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const url = editTank
        ? `/api/farms/${farmId}/fuel/tanks/${editTank.id}`
        : `/api/farms/${farmId}/fuel/tanks`;
      const res = await fetch(url, { method: editTank ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save tank");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowTankDialog(false); toast({ title: editTank ? "Tank updated" : "Tank added" }); },
    onError: () => toast({ title: "Error saving tank", variant: "destructive" }),
  });
  const delTankMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/tanks/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Tank removed" }); },
  });

  // --- Delivery dialog state ---
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState<Record<string, string>>({});
  const deliveryMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/deliveries`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowDeliveryDialog(false); toast({ title: "Delivery recorded" }); },
    onError: () => toast({ title: "Error saving delivery", variant: "destructive" }),
  });
  const delDeliveryMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/deliveries/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Delivery removed" }); },
  });

  // --- Usage dialog state ---
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [usageForm, setUsageForm] = useState<Record<string, string>>({});
  const usageMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/usage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowUsageDialog(false); toast({ title: "Usage recorded" }); },
    onError: () => toast({ title: "Error saving usage", variant: "destructive" }),
  });
  const delUsageMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/usage/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Usage record removed" }); },
  });

  // --- Inspection dialog state ---
  const [showInspDialog, setShowInspDialog] = useState(false);
  const [inspForm, setInspForm] = useState<Record<string, string>>({});
  const inspMut = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/farms/${farmId}/fuel/storage-inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => { invalidate(); setShowInspDialog(false); toast({ title: "Inspection recorded" }); },
    onError: () => toast({ title: "Error saving inspection", variant: "destructive" }),
  });
  const delInspMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/fuel/storage-inspections/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { invalidate(); toast({ title: "Inspection removed" }); },
  });

  const tanks: Record<string, unknown>[] = tanksQ.data ?? [];
  const deliveries: Record<string, unknown>[] = deliveriesQ.data ?? [];
  const usages: Record<string, unknown>[] = usageQ.data ?? [];
  const inspections: Record<string, unknown>[] = inspectionsQ.data ?? [];

  const totalStockL = tanks.reduce((s, t) => s + parseFloat(String(t.currentStockLitres ?? 0)), 0);
  const unbundedTanks = tanks.filter(t => !t.isBunded);
  const overdueTanks = tanks.filter(t => t.nextInspectionDue && new Date(String(t.nextInspectionDue)) < new Date());
  const totalDeliveredYTD = deliveries.filter(d => new Date(String(d.deliveryDate)).getFullYear() === new Date().getFullYear())
    .reduce((s, d) => s + parseFloat(String(d.quantityLitres ?? 0)), 0);

  return (
    <AppLayout title="Fuel & Energy">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Red diesel tank register, delivery log, usage records and oil storage compliance — HMRC-compliant records for rebated fuel use
        </p>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><Gauge className="w-4 h-4 text-green-700" /><span className="text-xs text-gray-500">Total on-farm stock</span></div>
            <p className="text-xl font-bold text-gray-800">{fmtL(totalStockL)}</p>
            <p className="text-xs text-gray-400">{tanks.length} tank{tanks.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-1"><Truck className="w-4 h-4 text-blue-600" /><span className="text-xs text-gray-500">Delivered YTD</span></div>
            <p className="text-xl font-bold text-gray-800">{fmtL(totalDeliveredYTD)}</p>
            <p className="text-xs text-gray-400">{deliveries.filter(d => new Date(String(d.deliveryDate)).getFullYear() === new Date().getFullYear()).length} deliveries</p>
          </div>
          <div className={`rounded-xl border p-4 ${unbundedTanks.length > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-1"><ShieldAlert className="w-4 h-4 text-amber-600" /><span className="text-xs text-gray-500">Oil storage</span></div>
            <p className="text-xl font-bold text-gray-800">{unbundedTanks.length}</p>
            <p className="text-xs text-gray-400">unbunded tank{unbundedTanks.length !== 1 ? "s" : ""}</p>
          </div>
          <div className={`rounded-xl border p-4 ${overdueTanks.length > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-200"}`}>
            <div className="flex items-center gap-2 mb-1"><ClipboardCheck className="w-4 h-4 text-red-600" /><span className="text-xs text-gray-500">Inspections overdue</span></div>
            <p className="text-xl font-bold text-gray-800">{overdueTanks.length}</p>
            <p className="text-xs text-gray-400">tank{overdueTanks.length !== 1 ? "s" : ""} need inspection</p>
          </div>
        </div>

        <TabBar className="mb-6">
          <TabButton active={tab === "tanks"} onClick={() => setTab("tanks")}>Tank Register ({tanks.length})</TabButton>
          <TabButton active={tab === "deliveries"} onClick={() => setTab("deliveries")}>Deliveries ({deliveries.length})</TabButton>
          <TabButton active={tab === "usage"} onClick={() => setTab("usage")}>Usage Log ({usages.length})</TabButton>
          <TabButton active={tab === "inspections"} onClick={() => setTab("inspections")}>Oil Storage Inspections ({inspections.length})</TabButton>
        </TabBar>

        {/* TANKS TAB */}
        {tab === "tanks" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Fuel Tanks</h3>
                <p className="text-xs text-gray-500">Tanks of 201 litres or more must be bunded under Oil Storage Regulations</p>
              </div>
              <Button onClick={openTankAdd} className="bg-green-800 hover:bg-green-900 text-white"><Plus className="w-4 h-4 mr-1" />Add Tank</Button>
            </div>
            {tanks.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Fuel className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No fuel tanks registered</p>
                <p className="text-sm">Add your first tank to start tracking fuel</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {tanks.map((tank) => {
                  const p = pct(tank.currentStockLitres as string, tank.capacityLitres as string);
                  const isOverdue = tank.nextInspectionDue && new Date(String(tank.nextInspectionDue)) < new Date();
                  return (
                    <div key={String(tank.id)} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">{String(tank.name)}</p>
                          <p className="text-xs text-gray-500">{FUEL_TYPE_LABELS[String(tank.fuelType)] ?? tank.fuelType as string}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          {tank.isBunded
                            ? <Badge className="text-xs" style={{ background: "#d1fae5", color: "#065f46", border: "none" }}>Bunded</Badge>
                            : <Badge className="text-xs" style={{ background: "#fef3c7", color: "#92400e", border: "none" }}>Not bunded</Badge>
                          }
                          <Button size="sm" variant="ghost" onClick={() => openTankEdit(tank)} className="h-7 px-2 text-xs">Edit</Button>
                          <Button size="sm" variant="ghost" onClick={() => delTankMut.mutate(Number(tank.id))} className="h-7 px-2 text-xs text-red-600"><Trash2 className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{fmtL(tank.currentStockLitres as string)} remaining</span>
                          <span>of {fmtL(tank.capacityLitres as string)}</span>
                        </div>
                        <TankGauge current={tank.currentStockLitres as string} capacity={tank.capacityLitres as string} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <span><span className="text-gray-400">Location:</span> {String(tank.location ?? "—")}</span>
                        <span><span className="text-gray-400">Material:</span> {String(tank.tankMaterial ?? "—")}</span>
                        <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                          <span className="text-gray-400">Inspect by:</span> {fmtDate(String(tank.nextInspectionDue ?? ""))}
                          {isOverdue && " ⚠ overdue"}
                        </span>
                        {tank.isBunded && <span><span className="text-gray-400">Bund cap:</span> {fmtL(tank.bundCapacityLitres as string)}</span>}
                      </div>
                      {tank.notes && <p className="text-xs text-gray-400 mt-2 italic">{String(tank.notes)}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* DELIVERIES TAB */}
        {tab === "deliveries" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Fuel Deliveries</h3>
                <p className="text-xs text-gray-500">Keep all delivery notes and invoices — HMRC may request these during a fuel duty inspection</p>
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
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Tank</th>
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
                          <td className="px-4 py-3 text-gray-600 text-xs">{tank ? String(tank.name) : "—"}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-800">{String(d.supplierName ?? "—")}</p>
                            <p className="text-xs text-gray-400">{String(d.deliveryNoteNumber ?? "")} {d.invoiceReference ? `/ ${d.invoiceReference}` : ""}</p>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-green-700">{fmtL(d.quantityLitres as string)}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{fmtCost(d.totalCostPence as number)}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 capitalize">{String(d.qualifyingUse ?? "agriculture").replace(/_/g, " ")}</td>
                          <td className="px-4 py-3">
                            <Button size="sm" variant="ghost" onClick={() => delDeliveryMut.mutate(Number(d.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
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

        {/* USAGE TAB */}
        {tab === "usage" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Fuel Usage Log</h3>
                <p className="text-xs text-gray-500">Record fuel drawn from tanks — link to machinery and field operations to demonstrate qualifying agricultural use</p>
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
                          <td className="px-4 py-3">
                            <Button size="sm" variant="ghost" onClick={() => delUsageMut.mutate(Number(u.id))} className="h-7 px-2 text-red-600"><Trash2 className="w-3 h-3" /></Button>
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

        {/* INSPECTIONS TAB */}
        {tab === "inspections" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">Oil Storage Inspections</h3>
                <p className="text-xs text-gray-500">Tanks &gt;201L must comply with Oil Storage Regulations — inspect annually and record issues and actions</p>
              </div>
              <Button onClick={() => { setInspForm({ overallResult: "pass", inspectionDate: new Date().toISOString().substring(0, 10) }); setShowInspDialog(true); }} className="bg-green-800 hover:bg-green-900 text-white">
                <Plus className="w-4 h-4 mr-1" />Record Inspection
              </Button>
            </div>
            {unbundedTanks.length > 0 && (
              <div className="flex gap-2 items-start bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">
                  <strong>{unbundedTanks.length} tank{unbundedTanks.length > 1 ? "s are" : " is"} not bunded.</strong> The Control of Pollution (Oil Storage) (England) Regulations 2001 require tanks of 201 litres or more to have secondary containment (bunding) with a capacity of 110% of the largest tank.
                </p>
              </div>
            )}
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
                      {ins.issuesFound && <div className="bg-red-50 rounded p-2 mb-2"><p className="text-xs font-medium text-red-800">Issues found:</p><p className="text-xs text-red-700">{String(ins.issuesFound)}</p></div>}
                      {ins.actionsRequired && <div className="bg-amber-50 rounded p-2 mb-2"><p className="text-xs font-medium text-amber-800">Actions required:</p><p className="text-xs text-amber-700">{String(ins.actionsRequired)}</p></div>}
                      <p className="text-xs text-gray-400 mt-2">Next inspection due: {fmtDate(String(ins.nextInspectionDue ?? ""))}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* TANK DIALOG */}
      <Dialog open={showTankDialog} onOpenChange={setShowTankDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editTank ? "Edit Tank" : "Add Fuel Tank"}</DialogTitle></DialogHeader>
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
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Capacity (litres) *</Label><Input type="number" value={tankForm.capacityLitres ?? ""} onChange={e => setTankForm(f => ({ ...f, capacityLitres: e.target.value }))} placeholder="10000" /></div>
              <div><Label>Current stock (litres)</Label><Input type="number" value={tankForm.currentStockLitres ?? ""} onChange={e => setTankForm(f => ({ ...f, currentStockLitres: e.target.value }))} placeholder="0" /></div>
            </div>
            <div><Label>Location</Label><Input value={tankForm.location ?? ""} onChange={e => setTankForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Main yard — adjacent to workshop" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Tank material</Label><Input value={tankForm.tankMaterial ?? ""} onChange={e => setTankForm(f => ({ ...f, tankMaterial: e.target.value }))} placeholder="Steel / Plastic" /></div>
              <div><Label>Is bunded?</Label>
                <Select value={tankForm.isBunded ?? "false"} onValueChange={v => setTankForm(f => ({ ...f, isBunded: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="true">Yes — bunded</SelectItem><SelectItem value="false">No — not bunded</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            {tankForm.isBunded === "true" && (
              <div><Label>Bund capacity (litres)</Label><Input type="number" value={tankForm.bundCapacityLitres ?? ""} onChange={e => setTankForm(f => ({ ...f, bundCapacityLitres: e.target.value }))} placeholder="11000" /></div>
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
              if (!tankForm.name || !tankForm.capacityLitres) return toast({ title: "Name and capacity are required", variant: "destructive" });
              tankMut.mutate({ ...tankForm, isBunded: tankForm.isBunded === "true" });
            }}>{editTank ? "Save Changes" : "Add Tank"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELIVERY DIALOG */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Log Fuel Delivery</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Delivery date *</Label><Input type="date" value={deliveryForm.deliveryDate ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, deliveryDate: e.target.value }))} /></div>
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
            <div><Label>Supplier name</Label><Input value={deliveryForm.supplierName ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, supplierName: e.target.value }))} placeholder="e.g. Northern Energy Fuels Ltd" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Delivery note number</Label><Input value={deliveryForm.deliveryNoteNumber ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, deliveryNoteNumber: e.target.value }))} placeholder="DN-0001" /></div>
              <div><Label>Invoice reference</Label><Input value={deliveryForm.invoiceReference ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, invoiceReference: e.target.value }))} placeholder="INV-2026-001" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Unit price (p/litre)</Label><Input type="number" value={deliveryForm.unitPricePence ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, unitPricePence: e.target.value }))} placeholder="78" /></div>
              <div><Label>Qualifying use</Label>
                <Select value={deliveryForm.qualifyingUse ?? "agriculture"} onValueChange={v => setDeliveryForm(f => ({ ...f, qualifyingUse: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{QUALIFYING_ACTIVITIES.map(a => <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Driver name</Label><Input value={deliveryForm.driverName ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, driverName: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={deliveryForm.notes ?? ""} onChange={e => setDeliveryForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!deliveryForm.deliveryDate || !deliveryForm.quantityLitres) return toast({ title: "Date and quantity required", variant: "destructive" });
              const totalCostPence = deliveryForm.unitPricePence && deliveryForm.quantityLitres
                ? Math.round(parseFloat(deliveryForm.unitPricePence) * parseFloat(deliveryForm.quantityLitres))
                : undefined;
              deliveryMut.mutate({ ...deliveryForm, totalCostPence });
            }}>Log Delivery</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* USAGE DIALOG */}
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
              <div><Label>Quantity (litres) *</Label><Input type="number" value={usageForm.quantityLitres ?? ""} onChange={e => setUsageForm(f => ({ ...f, quantityLitres: e.target.value }))} placeholder="380" /></div>
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

      {/* INSPECTION DIALOG */}
      <Dialog open={showInspDialog} onOpenChange={setShowInspDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Record Oil Storage Inspection</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Inspection date *</Label><Input type="date" value={inspForm.inspectionDate ?? ""} onChange={e => setInspForm(f => ({ ...f, inspectionDate: e.target.value }))} /></div>
              <div><Label>Tank</Label>
                <Select value={inspForm.tankId ?? ""} onValueChange={v => setInspForm(f => ({ ...f, tankId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select tank" /></SelectTrigger>
                  <SelectContent>{tanks.map(t => <SelectItem key={String(t.id)} value={String(t.id)}>{String(t.name)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Inspector</Label><Input value={inspForm.inspector ?? ""} onChange={e => setInspForm(f => ({ ...f, inspector: e.target.value }))} /></div>
              <div><Label>Overall result *</Label>
                <Select value={inspForm.overallResult ?? "pass"} onValueChange={v => setInspForm(f => ({ ...f, overallResult: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="pass">Pass</SelectItem><SelectItem value="advisory">Advisory</SelectItem><SelectItem value="fail">Fail</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Checklist items</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "bundingOk", label: "Bunding / secondary containment" },
                  { key: "labellingOk", label: "Tank labelling correct" },
                  { key: "spillKitPresent", label: "Spill kit present" },
                  { key: "spillKitComplete", label: "Spill kit complete" },
                  { key: "tankConditionOk", label: "Tank condition OK" },
                  { key: "pipeworkOk", label: "Pipework OK" },
                  { key: "fillPointLocked", label: "Fill point locked" },
                  { key: "overfillProtectionOk", label: "Overfill protection" },
                  { key: "drainageRiskOk", label: "Drainage risk managed" },
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
            <div><Label>Issues found</Label><Textarea value={inspForm.issuesFound ?? ""} onChange={e => setInspForm(f => ({ ...f, issuesFound: e.target.value }))} rows={2} placeholder="Describe any issues found" /></div>
            <div><Label>Actions required</Label><Textarea value={inspForm.actionsRequired ?? ""} onChange={e => setInspForm(f => ({ ...f, actionsRequired: e.target.value }))} rows={2} placeholder="List actions needed and timeline" /></div>
            <div><Label>Next inspection due</Label><Input type="date" value={inspForm.nextInspectionDue ?? ""} onChange={e => setInspForm(f => ({ ...f, nextInspectionDue: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={inspForm.notes ?? ""} onChange={e => setInspForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInspDialog(false)}>Cancel</Button>
            <Button className="bg-green-800 hover:bg-green-900 text-white" onClick={() => {
              if (!inspForm.inspectionDate) return toast({ title: "Inspection date required", variant: "destructive" });
              const boolFields = ["bundingOk", "labellingOk", "spillKitPresent", "spillKitComplete", "tankConditionOk", "pipeworkOk", "fillPointLocked", "overfillProtectionOk", "drainageRiskOk"];
              const data: Record<string, unknown> = { ...inspForm };
              boolFields.forEach(k => { if (data[k] !== undefined && data[k] !== "") data[k] = data[k] === "true"; else delete data[k]; });
              if (data.tankId === "") delete data.tankId;
              inspMut.mutate(data);
            }}>Save Inspection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
