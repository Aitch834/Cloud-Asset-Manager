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

const CAMPY_SAMPLE_TYPES = [
  { value: "boot_swab", label: "Boot Swab (pre-harvest)" },
  { value: "neck_skin", label: "Neck Skin Swab (abattoir)" },
  { value: "caecal_content", label: "Caecal Content (abattoir)" },
  { value: "environmental", label: "Environmental Swab" },
];
const CAMPY_RESULTS = [
  { value: "negative", label: "Negative (<1 log CFU/g)" },
  { value: "positive", label: "Positive" },
  { value: "pending", label: "Pending" },
];
const CAMPY_CATEGORIES = [
  { value: "lowest", label: "Lowest (≤1,000 ccu/g)" },
  { value: "lower", label: "Lower (1,000–10,000 ccu/g)" },
  { value: "higher", label: "Higher (>10,000 ccu/g)" },
];
const FSA_BANDS = [
  { value: "a_very_low", label: "Band A — Very Low" },
  { value: "b_low", label: "Band B — Low" },
  { value: "c_intermediate", label: "Band C — Intermediate" },
  { value: "d_high", label: "Band D — High" },
  { value: "e_very_high", label: "Band E — Very High" },
];

export function CampylobacterMonitoringTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewRec, setViewRec] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const { data: allRecordsRaw = [], isLoading } = useQuery({
    queryKey: ["campylobacter-monitoring", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/campylobacter-monitoring`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const allCampyRecords: any[] = allRecordsRaw;
  const [yearFilterCampy, setYearFilterCampy] = useState("all");
  const yearsCampy = useMemo(() => {
    const s = new Set(allCampyRecords.map((r: any) => String(r.sampleDate ?? "").slice(0, 4)).filter(Boolean) as string[]);
    return Array.from(s).sort().reverse();
  }, [allCampyRecords]);
  const records: any[] = yearFilterCampy === "all" ? allCampyRecords : allCampyRecords.filter((r: any) => String(r.sampleDate ?? "").startsWith(yearFilterCampy));

  const { data: flocksData } = useQuery({
    queryKey: ["poultry-flocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const flocks: any[] = flocksData?.records ?? flocksData ?? [];

  const { data: housesData } = useQuery({
    queryKey: ["poultry-houses", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-houses`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const houses: any[] = housesData?.records ?? housesData ?? [];

  const [mode, setMode] = useState<"log" | "result" | "edit">("log");
  function openAdd() { setEditing(null); setForm({ sampleType: "boot_swab", result: "pending", zapTriggered: false }); setMode("log"); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setMode("edit"); setOpen(true); }
  function openEnterResult(r: any) { setEditing(r); setForm({ ...r }); setMode("result"); setOpen(true); }

  async function save() {
    const url = editing ? api(`farms/${farmId}/campylobacter-monitoring/${editing.id}`) : api(`farms/${farmId}/campylobacter-monitoring`);
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    qc.invalidateQueries({ queryKey: ["campylobacter-monitoring", farmId] });
    setOpen(false);
  }

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/campylobacter-monitoring/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["campylobacter-monitoring", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const resultBadge = (r: string) => {
    const colours: Record<string, string> = { negative: "bg-green-100 text-green-800", positive: "bg-red-100 text-red-800", pending: "bg-amber-100 text-amber-800" };
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[r] ?? "bg-gray-100 text-gray-700"}`}>{CAMPY_RESULTS.find(x => x.value === r)?.label ?? r}</span>;
  };

  function printCampyReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const rows = records.map((r: any) => `<tr>
      <td>${fmtDate(r.sampleDate)}</td>
      <td>${houses.find((h: any) => h.id === r.houseId)?.houseName ?? "—"}${r.flockId ? ` / ${flocks.find((f: any) => f.id === r.flockId)?.flockNumber ?? ""}` : ""}</td>
      <td>${CAMPY_SAMPLE_TYPES.find(t => t.value === r.sampleType)?.label ?? r.sampleType}</td>
      <td>${CAMPY_RESULTS.find(x => x.value === r.result)?.label ?? r.result}</td>
      <td>${CAMPY_CATEGORIES.find(c => c.value === r.resultCategory)?.label ?? "—"}</td>
      <td>${FSA_BANDS.find(b => b.value === r.fsa_band)?.label ?? "—"}</td>
      <td>${r.zapTriggered ? "ZAP Active" : "No"}</td>
      <td>${r.labName ?? "—"}</td>
      <td>${r.labReference ?? "—"}</td>
      <td>${fmtDate(r.nextSampleDue)}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Campylobacter Monitoring Programme</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Campylobacter Monitoring Programme</h1><h2>Red Tractor Broiler/Turkey Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b>${yearFilterCampy !== "all" ? `<br>Year: ${yearFilterCampy}` : ""}<br>Printed: ${printedDate}</div>
</div>
<table>
  <tr><th>Sample Date</th><th>House / Flock</th><th>Sample Type</th><th>Result</th><th>Category</th><th>FSA Band</th><th>ZAP</th><th>Lab</th><th>Lab Ref</th><th>Next Due</th></tr>
  ${rows || "<tr><td colspan='10'>No records</td></tr>"}
</table>
<p class="note">Campylobacter monitoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor requires documented Campylobacter monitoring with structured lab results. Retain for a minimum of 3 years. Printed: ${printedDate}</p>
</body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Campylobacter Monitoring Programme</h3>
          <p className="text-xs text-gray-500 mt-0.5">Red Tractor Chicken/Turkey scheme requires documented Campylobacter monitoring with structured lab results. FSA bands and Zoonoses Action Plan (ZAP) triggers are recorded here.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={yearFilterCampy} onValueChange={setYearFilterCampy}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsCampy.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={printCampyReport} disabled={records.length === 0}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Sample</Button>
        </div>
      </div>

      {isLoading ? <div className="text-center py-8 text-gray-400 text-sm">Loading…</div> : records.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="font-medium text-gray-600">No Campylobacter records{yearFilterCampy !== "all" ? ` for ${yearFilterCampy}` : ""} yet</p>
          <p className="text-sm text-gray-400 mt-1">Add boot swab or neck skin results for each flock departure.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50">
              <tr>{["Sample Date","House / Flock","Sample Type","Result","Category","FSA Band","ZAP Triggered","Next Sample","Doc",""].map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{fmtDate(r.sampleDate)}</td>
                  <td className="px-3 py-2 text-xs">{houses.find((h: any) => h.id === r.houseId)?.houseName ?? "—"}{r.flockId ? ` / ${flocks.find((f: any) => f.id === r.flockId)?.flockNumber ?? ""}` : ""}</td>
                  <td className="px-3 py-2">{CAMPY_SAMPLE_TYPES.find(t => t.value === r.sampleType)?.label ?? r.sampleType}</td>
                  <td className="px-3 py-2">{resultBadge(r.result)}</td>
                  <td className="px-3 py-2 text-xs">{CAMPY_CATEGORIES.find(c => c.value === r.resultCategory)?.label ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{FSA_BANDS.find(b => b.value === r.fsa_band)?.label ?? "—"}</td>
                  <td className="px-3 py-2">{r.zapTriggered ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">ZAP Active</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                  <td className="px-3 py-2">{fmtDate(r.nextSampleDue)}</td>
                  <td className="px-3 py-2"><DocAttach farmId={farmId} endpoint="campylobacter-monitoring" recordId={r.id as number} documentPath={(r as any).documentPath ?? null} documentName={(r as any).documentName ?? null} queryKey={["campylobacter-monitoring", farmId]} compact /></td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 flex-wrap">
                      {r.result === "pending" && (
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-amber-700 border-amber-300 hover:bg-amber-50" onClick={() => openEnterResult(r)}>Enter results</Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => setPendingDelete(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Campylobacter Sample — {fmtDate(viewRec.sampleDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sample Date</p><p className="font-medium">{fmtDate(viewRec.sampleDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sample Type</p><p className="font-medium">{CAMPY_SAMPLE_TYPES.find(t => t.value === viewRec.sampleType)?.label ?? viewRec.sampleType}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">House</p><p className="font-medium">{houses.find((h: any) => h.id === viewRec.houseId)?.houseName ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock</p><p className="font-medium">{viewRec.flockId ? (flocks.find((f: any) => f.id === viewRec.flockId)?.flockNumber ?? `Flock #${viewRec.flockId}`) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Result</p><p className="font-medium">{resultBadge(viewRec.result)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Result Category</p><p className="font-medium">{CAMPY_CATEGORIES.find(c => c.value === viewRec.resultCategory)?.label ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">FSA Band</p><p className="font-medium">{FSA_BANDS.find(b => b.value === viewRec.fsa_band)?.label ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">CFU Count</p><p className="font-medium">{viewRec.cfuCount ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ZAP Triggered</p><p className="font-medium">{viewRec.zapTriggered ? "Yes" : "No"}</p></div>
              {viewRec.zapReference && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ZAP Reference</p><p className="font-medium">{viewRec.zapReference}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab</p><p className="font-medium">{viewRec.labName ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab Reference</p><p className="font-medium">{viewRec.labReference ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Sample Due</p><p className="font-medium">{fmtDate(viewRec.nextSampleDue)}</p></div>
              {viewRec.actionsTaken && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Actions Taken</p><p className="font-medium">{viewRec.actionsTaken}</p></div>}
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              {viewRec.id && <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="campylobacter-monitoring" recordId={viewRec.id as number} /></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRec); setViewRec(null); }}>Edit</Button>
              <Button onClick={() => setViewRec(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === "log" ? "Log Campylobacter Sample" : mode === "result" ? "Enter Campylobacter Results" : "Edit Campylobacter Sample Record"}</DialogTitle>
          </DialogHeader>
          {mode === "log" && <p className="text-xs text-muted-foreground -mt-1">Record the sampling event now. Return to enter laboratory results once the report arrives.</p>}
          {mode === "result" && editing && <p className="text-xs text-muted-foreground -mt-1">Sample from <strong>{fmtDate(editing.sampleDate)}</strong> · {CAMPY_SAMPLE_TYPES.find((t: any) => t.value === editing.sampleType)?.label ?? editing.sampleType}{editing.labName ? ` · ${editing.labName}` : ""}. Enter results from your lab report.</p>}
          <div className="grid grid-cols-2 gap-3">
            {mode !== "result" && <>
              <div><Label>Sample Date *</Label><Input type="date" value={form.sampleDate || ""} onChange={e => set("sampleDate", e.target.value)} /></div>
              <div><Label>Sample Type *</Label>
                <Select value={form.sampleType || "boot_swab"} onValueChange={v => set("sampleType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CAMPY_SAMPLE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>House</Label>
                <Select value={String(form.houseId || "__none__")} onValueChange={v => set("houseId", v === "__none__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                  <SelectContent><SelectItem value="__none__">— Not specified</SelectItem>{houses.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.houseName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Flock</Label>
                <Select value={String(form.flockId || "__none__")} onValueChange={v => set("flockId", v === "__none__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select flock" /></SelectTrigger>
                  <SelectContent><SelectItem value="__none__">— Not specified</SelectItem>{flocks.map((f: any) => <SelectItem key={f.id} value={String(f.id)}>{f.flockNumber}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Samples Taken</Label><Input type="number" min="0" value={form.samplesTaken ?? ""} onChange={e => set("samplesTaken", e.target.value)} /></div>
              <div><Label>Lab Name</Label><Input value={form.labName || ""} onChange={e => set("labName", e.target.value)} /></div>
              <div><Label>Lab Reference</Label><Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} placeholder="Submission ref (if known)" /></div>
            </>}
            {mode !== "log" && <>
              <div><Label>Result *</Label>
                <Select value={form.result || "pending"} onValueChange={v => set("result", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CAMPY_RESULTS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>CFU Count (cfu/g)</Label><Input type="number" step="any" value={form.cfuCount ?? ""} onChange={e => set("cfuCount", e.target.value)} /></div>
              <div><Label>Result Category</Label>
                <Select value={form.resultCategory || "__none__"} onValueChange={v => set("resultCategory", v === "__none__" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent><SelectItem value="__none__">— N/A</SelectItem>{CAMPY_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>FSA Band</Label>
                <Select value={form.fsa_band || "__none__"} onValueChange={v => set("fsa_band", v === "__none__" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Select band" /></SelectTrigger>
                  <SelectContent><SelectItem value="__none__">— Not banded</SelectItem>{FSA_BANDS.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="zap" checked={!!form.zapTriggered} onChange={e => set("zapTriggered", e.target.checked)} className="rounded" />
                <Label htmlFor="zap">ZAP Triggered</Label>
              </div>
              {form.zapTriggered && <div><Label>ZAP Reference</Label><Input value={form.zapReference || ""} onChange={e => set("zapReference", e.target.value)} /></div>}
              <div><Label>Next Sample Due</Label><Input type="date" value={form.nextSampleDue || ""} onChange={e => set("nextSampleDue", e.target.value)} /></div>
              <div className="col-span-2"><Label>Actions Taken</Label><Textarea rows={2} value={form.actionsTaken || ""} onChange={e => set("actionsTaken", e.target.value)} placeholder="Biosecurity, litter management, competitive exclusion…" /></div>
            </>}
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{mode === "log" ? "Log Sample" : mode === "result" ? "Save Results" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SharedConfirmDialog
        open={pendingDelete !== null}
        title="Delete Record"
        message="Delete this Campylobacter monitoring record?"
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={del}
        onConfirm={() => { if (pendingDelete !== null) del.mutate(pendingDelete, { onSuccess: () => setPendingDelete(null) }); }}
        onCancel={() => { setPendingDelete(null); del.reset(); }}
      />
    </div>
  );
}

// ─── Chick / Poult Placement Quality Assessment ────────────────────────────────
