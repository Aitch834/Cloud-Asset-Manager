import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { useSafeUser } from "@/hooks/use-safe-clerk";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, PieChart, Pie, Cell, Legend } from "recharts";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { DocAttach } from "@/components/DocAttach";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Eye, Droplets, Thermometer, FileDown, Paperclip, BarChart2, QrCode, Download, MapPin, ChevronsUpDown, Search, X, Sparkles, ClipboardList, Printer, Building2, ShoppingCart, PackageCheck, Receipt, Clock, BadgeCheck, XCircle, TrendingUp, TrendingDown, Package, Check, FlaskConical } from "lucide-react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { QRCodeSVG } from "qrcode.react";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { openPrintWindow } from "@/lib/print-report";
import { VMD_MEDICINES } from "@/data/vmdMedicines";
import { useToast } from "@/hooks/use-toast";
import { api, today } from "./shared";

// ─── SCC Test Equipment ────────────────────────────────────────────────────────

interface SccEquipmentRecord {
  id: number;
  deviceName: string;
  manufacturer?: string | null;
  modelNumber?: string | null;
  serialNumber?: string | null;
  testMethod?: string | null;
  lastCalibrationDate?: string | null;
  calibrationExpiryDate?: string | null;
  calibratedBy?: string | null;
  lastServiceDate?: string | null;
  nextServiceDueDate?: string | null;
  serviceProvider?: string | null;
  inService?: boolean;
  notes?: string | null;
}

function sccDueBadge(date: string | null | undefined) {
  if (!date) return null;
  const d = new Date(date);
  const today = new Date();
  const daysUntil = Math.floor((d.getTime() - today.getTime()) / 86400000);
  if (daysUntil < 0) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Overdue</span>;
  if (daysUntil <= 30) return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Due in {daysUntil}d</span>;
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">OK</span>;
}

export function SccEquipmentSection({ farmId, species }: { farmId: number; species: "cattle" | "sheep" | "goat" }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SccEquipmentRecord | null>(null);
  const [viewRec, setViewRec] = useState<SccEquipmentRecord | null>(null);
  const blank: Partial<SccEquipmentRecord> = { inService: true };
  const [form, setForm] = useState<Partial<SccEquipmentRecord>>(blank);
  const [pendingDel, setPendingDel] = useState<number | null>(null);
  const set = (k: keyof SccEquipmentRecord, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const qKey = ["scc-equipment", farmId, species];
  const { data, isLoading } = useQuery<{ equipment: SccEquipmentRecord[] }>({
    queryKey: qKey,
    queryFn: () => fetch(api(`farms/${farmId}/scc-equipment?species=${species}`), { credentials: "include" }).then(r => r.json()),
  });
  const records = data?.equipment ?? [];
  const overdueCount = records.filter(r => r.calibrationExpiryDate && new Date(r.calibrationExpiryDate) < new Date()).length;

  const save = useMutation({
    mutationFn: (body: Partial<SccEquipmentRecord>) =>
      fetch(api(`farms/${farmId}/scc-equipment${editing ? `/${editing.id}` : ""}`), {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...body, species }),
      }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qKey }); setOpen(false); setEditing(null); setForm(blank); toast({ title: editing ? "Equipment record updated" : "Equipment record added" }); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/scc-equipment/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qKey }); toast({ title: "Record deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const speciesLabel = species === "cattle" ? "Cattle / Buffalo" : species === "sheep" ? "Sheep" : "Goat";
  const regulatoryLimit = species === "sheep" ? "1,500k" : species === "goat" ? "1,000k" : "400k";

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <strong>SCC Test Equipment Register</strong> — {speciesLabel}. Record every piece of equipment used for on-site somatic cell count testing (e.g. PortaSCC, DeLaval DCC, Fossomatic portable). Keep calibration and service dates up to date to satisfy {species === "cattle" ? "Red Tractor Dairy / NMR" : species === "sheep" ? "BSDA" : "BGS"} assurance requirements. UK regulatory SCC limit: {regulatoryLimit} cells/mL.
      </div>

      {overdueCount > 0 && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠ {overdueCount} device{overdueCount > 1 ? "s have" : " has"} an overdue calibration. Check the records below.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Devices Registered</p><p className="text-2xl font-bold text-gray-800">{records.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">In Service</p><p className="text-2xl font-bold text-green-700">{records.filter(r => r.inService).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-gray-500 mb-1">Calibration Overdue</p><p className={`text-2xl font-bold ${overdueCount > 0 ? "text-red-700" : "text-gray-400"}`}>{overdueCount}</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2">
        <h2 className="text-base font-semibold text-gray-800">SCC Test Equipment</h2>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" variant="outline" onClick={() => {
            const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
            const overdue = records.filter(r => r.calibrationExpiryDate && new Date(r.calibrationExpiryDate) < new Date());
            const rows = records.map(r => {
              const expired = r.calibrationExpiryDate && new Date(r.calibrationExpiryDate) < new Date();
              return `<tr${expired ? ' style="background:#fef2f2"' : ""}><td>${r.deviceName}</td><td>${r.testMethod || "—"}</td><td>${r.serialNumber || "—"}</td><td>${r.manufacturer || "—"}</td><td>${r.calibrationExpiryDate ? new Date(r.calibrationExpiryDate).toLocaleDateString("en-GB") : "—"}${expired ? ' <strong style="color:red">OVERDUE</strong>' : ""}</td><td>${r.nextServiceDueDate ? new Date(r.nextServiceDueDate).toLocaleDateString("en-GB") : "—"}</td><td>${r.inService ? "✓" : "✗"}</td></tr>`;
            }).join("");
            const html = `<!DOCTYPE html><html><head><title>SCC Equipment Calibration Schedule — ${speciesLabel}</title><style>body{font-family:Arial,sans-serif;font-size:10px;padding:20px}h1{font-size:14px}h2{font-size:11px;color:#555}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{border:1px solid #e5e7eb;padding:4px 6px;text-align:left}th{background:#f9fafb;font-weight:700;text-transform:uppercase;font-size:9px}.alert{background:#fef2f2;border:1px solid #fecaca;padding:8px 12px;border-radius:4px;margin-bottom:12px;font-size:11px;color:#991b1b}.note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:12px}</style></head><body><h1>SCC Equipment Calibration Schedule — ${speciesLabel}</h1><h2>Printed: ${printedDate}</h2>${overdue.length > 0 ? `<div class="alert">⚠ ${overdue.length} device${overdue.length !== 1 ? "s" : ""} with overdue calibration: ${overdue.map(r => r.deviceName).join(", ")}</div>` : ""}<table><tr><th>Device Name</th><th>Type</th><th>Serial No.</th><th>Manufacturer</th><th>Calibration Expiry</th><th>Next Service Due</th><th>In Service</th></tr>${rows || "<tr><td colspan='7'>No equipment recorded</td></tr>"}</table><p class="note">${speciesLabel} SCC test equipment register — BDE Farm Trac. Regulatory SCC limit: ${regulatoryLimit} cells/mL. Keep calibration certificates on file for ${species === "cattle" ? "Red Tractor Dairy / NMR" : species === "sheep" ? "BSDA" : "BGS"} assurance inspections. Printed: ${printedDate}.</p></body></html>`;
            const w = window.open("", "_blank");
            if (!w) return;
            w.document.write(html);
            w.document.close();
            w.print();
          }}><Printer className="w-3.5 h-3.5 mr-1" />Print Schedule</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm(blank); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Device</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400"><AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" /><p>No SCC test equipment registered yet.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
              <th className="py-2 px-3 text-left">Device</th>
              <th className="py-2 px-3 text-left">Serial No.</th>
              <th className="py-2 px-3 text-left">Test Method</th>
              <th className="py-2 px-3 text-left">Last Calibration</th>
              <th className="py-2 px-3 text-left">Cal. Expiry</th>
              <th className="py-2 px-3 text-left">Next Service</th>
              <th className="py-2 px-3 text-left">Status</th>
              <th className="py-2 px-3 text-left">Actions</th>
            </tr></thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 px-3">
                    <p className="font-medium">{r.deviceName}</p>
                    {r.manufacturer && <p className="text-xs text-gray-400">{r.manufacturer}{r.modelNumber ? ` · ${r.modelNumber}` : ""}</p>}
                  </td>
                  <td className="py-2 px-3 font-mono text-xs">{r.serialNumber || "—"}</td>
                  <td className="py-2 px-3 text-xs capitalize">{r.testMethod || "—"}</td>
                  <td className="py-2 px-3 text-xs">{r.lastCalibrationDate ? new Date(r.lastCalibrationDate).toLocaleDateString("en-GB") : "—"}</td>
                  <td className="py-2 px-3 text-xs">
                    {r.calibrationExpiryDate ? new Date(r.calibrationExpiryDate).toLocaleDateString("en-GB") : "—"}
                    {" "}{sccDueBadge(r.calibrationExpiryDate)}
                  </td>
                  <td className="py-2 px-3 text-xs">
                    {r.nextServiceDueDate ? new Date(r.nextServiceDueDate).toLocaleDateString("en-GB") : "—"}
                    {" "}{sccDueBadge(r.nextServiceDueDate)}
                  </td>
                  <td className="py-2 px-3">
                    {r.inService
                      ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">In service</span>
                      : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Retired</span>}
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(r); setForm({ ...r }); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setPendingDel(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View dialog */}
      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent style={{ maxWidth: "38rem" }}>
            <DialogHeader><DialogTitle>{viewRec.deviceName}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Manufacturer</p><p className="font-medium">{viewRec.manufacturer || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Model</p><p className="font-medium">{viewRec.modelNumber || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Serial Number</p><p className="font-mono font-medium">{viewRec.serialNumber || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Test Method</p><p className="font-medium capitalize">{viewRec.testMethod || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Last Calibration</p><p className="font-medium">{viewRec.lastCalibrationDate ? new Date(viewRec.lastCalibrationDate).toLocaleDateString("en-GB") : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calibration Expiry</p><p className="font-medium flex items-center gap-1">{viewRec.calibrationExpiryDate ? new Date(viewRec.calibrationExpiryDate).toLocaleDateString("en-GB") : "—"} {sccDueBadge(viewRec.calibrationExpiryDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Calibrated By</p><p className="font-medium">{viewRec.calibratedBy || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Last Service</p><p className="font-medium">{viewRec.lastServiceDate ? new Date(viewRec.lastServiceDate).toLocaleDateString("en-GB") : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Service Due</p><p className="font-medium flex items-center gap-1">{viewRec.nextServiceDueDate ? new Date(viewRec.nextServiceDueDate).toLocaleDateString("en-GB") : "—"} {sccDueBadge(viewRec.nextServiceDueDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Service Provider</p><p className="font-medium">{viewRec.serviceProvider || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>{viewRec.inService ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">In service</span> : <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Retired</span>}</div>
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRec(null)}>Close</Button><Button onClick={() => { setEditing(viewRec); setForm({ ...viewRec }); setOpen(true); setViewRec(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Equipment Record" : "Add SCC Test Equipment"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2"><Label>Device Name *</Label><Input value={form.deviceName || ""} onChange={e => set("deviceName", e.target.value)} placeholder="e.g. PortaSCC, DeLaval DCC, Fossomatic Portable" /></div>
            <div><Label>Manufacturer</Label><Input value={form.manufacturer || ""} onChange={e => set("manufacturer", e.target.value)} placeholder="e.g. PortaCheck, DeLaval, Foss" /></div>
            <div><Label>Model Number</Label><Input value={form.modelNumber || ""} onChange={e => set("modelNumber", e.target.value)} /></div>
            <div><Label>Serial Number</Label><Input value={form.serialNumber || ""} onChange={e => set("serialNumber", e.target.value)} /></div>
            <div><Label>Test Method</Label>
              <Select value={form.testMethod || "__none__"} onValueChange={v => set("testMethod", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Not specified</SelectItem>
                  <SelectItem value="fluorooptic">Fluorooptic (e.g. PortaSCC)</SelectItem>
                  <SelectItem value="electronic-cell-counting">Electronic cell counting (e.g. DCC)</SelectItem>
                  <SelectItem value="flow-cytometry">Flow cytometry (e.g. Fossomatic)</SelectItem>
                  <SelectItem value="cmrt">California Mastitis Reagent Test (CMRT)</SelectItem>
                  <SelectItem value="pcr">PCR-based</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Last Calibration Date</Label><Input type="date" value={String(form.lastCalibrationDate || "").slice(0, 10)} onChange={e => set("lastCalibrationDate", e.target.value || null)} /></div>
            <div><Label>Calibration Expiry Date</Label><Input type="date" value={String(form.calibrationExpiryDate || "").slice(0, 10)} onChange={e => set("calibrationExpiryDate", e.target.value || null)} /></div>
            <div><Label>Calibrated By</Label><Input value={form.calibratedBy || ""} onChange={e => set("calibratedBy", e.target.value)} placeholder="Name or organisation" /></div>
            <div><Label>Last Service Date</Label><Input type="date" value={String(form.lastServiceDate || "").slice(0, 10)} onChange={e => set("lastServiceDate", e.target.value || null)} /></div>
            <div><Label>Next Service Due</Label><Input type="date" value={String(form.nextServiceDueDate || "").slice(0, 10)} onChange={e => set("nextServiceDueDate", e.target.value || null)} /></div>
            <div><Label>Service Provider</Label><Input value={form.serviceProvider || ""} onChange={e => set("serviceProvider", e.target.value)} placeholder="Name or company" /></div>
            <div className="col-span-2 flex items-center gap-2">
              <input type="checkbox" id="scc-in-service" className="rounded" checked={!!form.inService} onChange={e => set("inService", e.target.checked)} />
              <label htmlFor="scc-in-service" className="text-sm cursor-pointer">Currently in service</label>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Condition notes, certificate reference, etc." /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.deviceName}>
              {save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={pendingDel !== null}
        title="Delete equipment record"
        message="Delete this equipment record?"
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={del}
        onConfirm={() => { if (pendingDel !== null) del.mutate(pendingDel, { onSuccess: () => setPendingDel(null) }); }}
        onCancel={() => { setPendingDel(null); del.reset(); }}
      />
    </div>
  );
}

