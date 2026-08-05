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

const JOURNEY_PURPOSES_DASH = [
  { value: "to_slaughter", label: "To Slaughter" },
  { value: "inter_site", label: "Inter-Site Transfer" },
  { value: "hatchery_collection", label: "Hatchery Collection" },
  { value: "other", label: "Other" },
];
const WELFARE_OUTCOMES_DASH = [
  { value: "satisfactory", label: "Satisfactory" },
  { value: "unsatisfactory", label: "Unsatisfactory" },
  { value: "not_assessed", label: "Not Assessed" },
];

export function TransportWelfareTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ["poultry-transport-welfare", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-transport-welfare`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? d ?? []),
    enabled: !!farmId,
  });
  const records: any[] = Array.isArray(rawData) ? rawData : [];

  const emptyForm = { journeyDate: today, journeyPurpose: "to_slaughter", temperatureAdequate: true, waterProvision: true, ventilationAdequate: true, overallWelfareAssessment: "satisfactory" };
  function openAdd() { setEditing(null); setForm({ ...emptyForm }); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setOpen(true); }

  const saveMut2 = useMutation({
    mutationFn: async () => {
      const url = editing ? api(`farms/${farmId}/poultry-transport-welfare/${editing.id}`) : api(`farms/${farmId}/poultry-transport-welfare`);
      await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-transport-welfare", farmId] }); setOpen(false); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteMut3 = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-transport-welfare/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-transport-welfare", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const fmtDate2 = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const welfareBadge = (v: string) => {
    const cls: Record<string, string> = { satisfactory: "bg-green-100 text-green-800", unsatisfactory: "bg-red-100 text-red-800", not_assessed: "bg-gray-100 text-gray-600" };
    const label = WELFARE_OUTCOMES_DASH.find(o => o.value === v)?.label ?? v;
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls[v] ?? "bg-gray-100 text-gray-600"}`}>{label}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Transport Welfare Documentation</h3>
          <p className="text-xs text-gray-500 mt-0.5">UK Welfare of Animals During Transport regs. Required for Red Tractor, RSPCA Assured, and organic audits. Journeys over 65 km require a transporter authorisation number.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Log</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No transport welfare logs recorded</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Purpose</th>
                <th className="pb-2 pr-4">Vehicle</th>
                <th className="pb-2 pr-4">Driver</th>
                <th className="pb-2 pr-4">Distance</th>
                <th className="pb-2 pr-4">DOA</th>
                <th className="pb-2 pr-4">Assessment</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r: any) => {
                const km = Number(r.journeyDistanceKm);
                const over65 = km > 65;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-2 pr-4 whitespace-nowrap">{fmtDate2(r.journeyDate)}</td>
                    <td className="py-2 pr-4">{JOURNEY_PURPOSES_DASH.find(p => p.value === r.journeyPurpose)?.label ?? r.journeyPurpose ?? "—"}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{r.vehicleReg ?? "—"}</td>
                    <td className="py-2 pr-4 text-gray-500">{r.driverName ?? "—"}</td>
                    <td className="py-2 pr-4">
                      {r.journeyDistanceKm ? (
                        <span className="flex items-center gap-1">
                          {r.journeyDistanceKm} km
                          {over65 && <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">WATD</span>}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="py-2 pr-4">{r.birdsDeadOnArrival ?? "0"}</td>
                    <td className="py-2 pr-4">{welfareBadge(r.overallWelfareAssessment ?? "not_assessed")}</td>
                    <td className="py-2 text-right whitespace-nowrap">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); } }}>
        <DialogContent style={{ maxWidth: 600 }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Transport Welfare Log" : "Add Transport Welfare Log"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Journey Date *</label>
              <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={form.journeyDate ?? today} onChange={e => set("journeyDate", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Journey Purpose</label>
              <select className="w-full border rounded px-2 py-1.5 text-sm" value={form.journeyPurpose ?? "to_slaughter"} onChange={e => set("journeyPurpose", e.target.value)}>
                {JOURNEY_PURPOSES_DASH.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Vehicle Registration *</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm uppercase" value={form.vehicleReg ?? ""} onChange={e => set("vehicleReg", e.target.value.toUpperCase())} placeholder="AB12 CDE" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Driver Name</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm" value={form.driverName ?? ""} onChange={e => set("driverName", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-gray-700">Transporter Authorisation No. {Number(form.journeyDistanceKm) > 65 ? "(Required — journey >65 km)" : "(optional)"}</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm" value={form.transporterAuthorisationNo ?? ""} onChange={e => set("transporterAuthorisationNo", e.target.value)} placeholder="e.g. UK/TA/12345" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Start Time</label>
              <input type="time" className="w-full border rounded px-2 py-1.5 text-sm" value={form.journeyStartTime ?? ""} onChange={e => set("journeyStartTime", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">End Time</label>
              <input type="time" className="w-full border rounded px-2 py-1.5 text-sm" value={form.journeyEndTime ?? ""} onChange={e => set("journeyEndTime", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Journey Distance (km)</label>
              <input type="number" className="w-full border rounded px-2 py-1.5 text-sm" value={form.journeyDistanceKm ?? ""} onChange={e => set("journeyDistanceKm", e.target.value)} placeholder="e.g. 45" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Stocking Density (birds/m²)</label>
              <input type="number" className="w-full border rounded px-2 py-1.5 text-sm" value={form.stockingDensityBirdsM2 ?? ""} onChange={e => set("stockingDensityBirdsM2", e.target.value)} placeholder="e.g. 32" />
            </div>
            <div className="col-span-2 space-y-2">
              <p className="text-xs font-medium text-gray-700">Welfare Conditions</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { k: "temperatureAdequate", label: "Temperature adequate" },
                  { k: "waterProvision", label: "Water provision" },
                  { k: "ventilationAdequate", label: "Ventilation adequate" },
                ].map(({ k, label }) => (
                  <label key={k} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Birds Dead on Arrival</label>
              <input type="number" className="w-full border rounded px-2 py-1.5 text-sm" value={form.birdsDeadOnArrival ?? "0"} onChange={e => set("birdsDeadOnArrival", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Overall Welfare Assessment</label>
              <select className="w-full border rounded px-2 py-1.5 text-sm" value={form.overallWelfareAssessment ?? "satisfactory"} onChange={e => set("overallWelfareAssessment", e.target.value)}>
                {WELFARE_OUTCOMES_DASH.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-gray-700">Notes</label>
              <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows={2} value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button disabled={!form.vehicleReg || saveMut2.isPending} onClick={() => saveMut2.mutate()}>
              <Save className="w-3.5 h-3.5 mr-1" />{saveMut2.isPending ? "Saving…" : editing ? "Save Changes" : "Save Log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut3.reset(); } }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Transport Welfare Log</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this transport welfare log?</p>
          <DialogMutationError mutation={deleteMut3} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMut3.isPending} onClick={() => deleteId !== null && deleteMut3.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── HPAI Banner ──────────────────────────────────────────────────────────────
