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

const TRANSFER_REASONS_DASH = ["Relocation", "Contract rearing", "Flock splitting", "Site consolidation", "Other"];

export function InterSiteTransfersTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ["poultry-transfers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-transfers`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? d ?? []),
    enabled: !!farmId,
  });
  const records: any[] = Array.isArray(rawData) ? rawData : [];

  const { data: flocksData } = useQuery({
    queryKey: ["poultry-flocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const flocks: any[] = flocksData?.records ?? flocksData ?? [];

  function openAdd() { setEditing(null); setForm({ transferDate: today, reason: "Relocation" }); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setOpen(true); }

  const saveMut = useMutation({
    mutationFn: async () => {
      const url = editing ? api(`farms/${farmId}/poultry-transfers/${editing.id}`) : api(`farms/${farmId}/poultry-transfers`);
      await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-transfers", farmId] }); setOpen(false); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const deleteMut2 = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-transfers/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-transfers", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Inter-Site Transfers</h3>
          <p className="text-xs text-gray-500 mt-0.5">Record movements of birds between holdings you own or manage. Distinct from FCI slaughter movements.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Transfer</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No inter-site transfers recorded</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">To Farm</th>
                <th className="pb-2 pr-4">CPH</th>
                <th className="pb-2 pr-4">Birds</th>
                <th className="pb-2 pr-4">Reason</th>
                <th className="pb-2 pr-4">Vehicle</th>
                <th className="pb-2 pr-4">Driver</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 pr-4 whitespace-nowrap">{fmtDate(r.transferDate)}</td>
                  <td className="py-2 pr-4 font-medium">{r.toFarmName ?? "—"}</td>
                  <td className="py-2 pr-4 text-gray-500">{r.toCph ?? "—"}</td>
                  <td className="py-2 pr-4">{r.quantityTransferred ?? "—"}</td>
                  <td className="py-2 pr-4 text-gray-600">{r.reason ?? "—"}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{r.vehicleReg ?? "—"}</td>
                  <td className="py-2 pr-4 text-gray-500">{r.driverName ?? "—"}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); } }}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Transfer" : "Add Inter-Site Transfer"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-gray-700">Destination Farm / Holding Name *</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm" value={form.toFarmName ?? ""} onChange={e => set("toFarmName", e.target.value)} placeholder="e.g. North Unit — Llanfair Farm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Destination CPH</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm" value={form.toCph ?? ""} onChange={e => set("toCph", e.target.value)} placeholder="12/345/6789" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Transfer Date *</label>
              <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={form.transferDate ?? today} onChange={e => set("transferDate", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Birds Transferred *</label>
              <input type="number" className="w-full border rounded px-2 py-1.5 text-sm" value={form.quantityTransferred ?? ""} onChange={e => set("quantityTransferred", e.target.value)} placeholder="e.g. 5000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Reason</label>
              <select className="w-full border rounded px-2 py-1.5 text-sm" value={form.reason ?? ""} onChange={e => set("reason", e.target.value)}>
                {TRANSFER_REASONS_DASH.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Flock (optional)</label>
              <select className="w-full border rounded px-2 py-1.5 text-sm" value={form.flockId ?? ""} onChange={e => set("flockId", e.target.value ? Number(e.target.value) : null)}>
                <option value="">— Any / not linked —</option>
                {flocks.map((f: any) => <option key={f.id} value={f.id}>{f.flockNumber ?? f.id}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Transport Company</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm" value={form.transportCompany ?? ""} onChange={e => set("transportCompany", e.target.value)} placeholder="e.g. Williams Haulage" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Vehicle Registration</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm uppercase" value={form.vehicleReg ?? ""} onChange={e => set("vehicleReg", e.target.value.toUpperCase())} placeholder="AB12 CDE" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Driver Name</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm" value={form.driverName ?? ""} onChange={e => set("driverName", e.target.value)} placeholder="e.g. John Williams" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Est. Journey (hours)</label>
              <input type="number" step="0.5" className="w-full border rounded px-2 py-1.5 text-sm" value={form.estimatedJourneyHours ?? ""} onChange={e => set("estimatedJourneyHours", e.target.value)} placeholder="e.g. 1.5" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-gray-700">Notes</label>
              <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows={2} value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button disabled={!form.toFarmName || !form.quantityTransferred || saveMut.isPending} onClick={() => saveMut.mutate()}>
              <Save className="w-3.5 h-3.5 mr-1" />{saveMut.isPending ? "Saving…" : editing ? "Save Changes" : "Save Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut2.reset(); } }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Transfer Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this inter-site transfer record?</p>
          <DialogMutationError mutation={deleteMut2} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMut2.isPending} onClick={() => deleteId !== null && deleteMut2.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Transport Welfare Tab ─────────────────────────────────────────────────────
