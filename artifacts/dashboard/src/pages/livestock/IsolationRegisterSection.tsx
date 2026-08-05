import React, { useState, useRef, useMemo } from "react";
import { canonicalHerdSpecies, herdSpeciesDisplayLabel, herdProductionSubtype } from "@/lib/herd-utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { MortalitySection } from "./MortalitySection";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Redirect } from "wouter";
import { Plus, Search, Loader2, Pencil, Trash2, ClipboardList, Stethoscope, CheckCircle2, Printer, AlertTriangle, Package, Droplets, XCircle, FileText, Upload, Paperclip, QrCode, Eye, FlaskConical, ClipboardCheck, Clock, ListChecks, BookOpen, ChevronDown, ChevronUp, RotateCcw, FileDown, Truck, BarChart3, Syringe } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { printProReport, openPrintWindow, buildProReport } from "@/lib/print-report";
import { LabSelector } from "@/components/ui/LabSelector";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

import { formatDate, formatDateLong, ConfirmDialog, PRODUCTION_TYPE_OPTIONS, EMPTY_SIRE, EMPTY_STRAW, EMPTY_HERD, EMPTY_PLAN, EMPTY_ANIMAL, PrintHerdRegisterDialog, PrintVetPlanDialog, getHerdNumberConfig, getBreedPlaceholder, getHerdNamePlaceholder, ANIMAL_SPECIES_FALLBACK, ANIMAL_STATUS_LABELS, MOVEMENT_TYPE_LABELS, OUTCOME_COLOURS, DOC_TYPE_LABELS } from "./shared";
import type { Farm, Herd, VetHealthPlan, VetHealthPlanActionCompletion, VetHealthPlanAction, MortalityRecord, FallenStockContractor, FeedRecord, WaterRecord, Animal, Sire, StrawInventory, AnimalDoc, VaccHistoryRecord, AnimalProfile } from "./shared";

export function IsolationRegisterSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: isoMembersData, isLoading: isoMembersLoading } = useFarmMembers(farmId);
  const isoStaffNames = (isoMembersData?.members ?? []).filter((m: any) => m.isActive !== false).map((m: any) => memberFullName(m));
  const [addOpen, setAddOpen] = useState(false);
  const [editRec, setEditRec] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hcOpen, setHcOpen] = useState<number | null>(null);
  const [deleteHcId, setDeleteHcId] = useState<{ recId: number; checkId: number } | null>(null);

  const emptyForm = { isolationStartDate: "", isolationEndDate: "", animalCount: "", animalDescription: "", isolationReason: "", supplierName: "", clearanceDate: "", clearanceSignedBy: "", notes: "", sourceJohnesVaccStatus: "", sourceJohnesVaccNotes: "", sourcePrrsStatus: "", sourcePrrsNotes: "", sourceMhStatus: "", sourceMhNotes: "", sourceMareksStatus: "", sourceMareksNotes: "", sourceSalmonellaNcpCategory: "", sourceSalmonellaNotes: "" };
  const [form, setForm] = useState({ ...emptyForm });
  const emptyHc = { checkDate: new Date().toISOString().slice(0, 10), checkedBy: "", healthStatus: "satisfactory", temperatureCelsius: "", notes: "", actionTaken: "" };
  const [hcForm, setHcForm] = useState({ ...emptyHc });

  const recordsQ = useQuery({ queryKey: ["isolation-records", farmId], queryFn: () => fetch(`/api/farms/${farmId}/isolation-records`).then(r => r.json()), enabled: !!farmId, select: (d: any) => d.records ?? [] });
  const hcQ = useQuery({ queryKey: ["isolation-hc", farmId, expandedId], queryFn: () => expandedId ? fetch(`/api/farms/${farmId}/isolation-records/${expandedId}/health-checks`).then(r => r.json()) : null, enabled: !!expandedId, select: (d: any) => d?.healthChecks ?? [] });
  const records: any[] = recordsQ.data ?? [];
  const hcs: any[] = hcQ.data ?? [];

  const createMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/isolation-records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Isolation record created" }); qc.invalidateQueries({ queryKey: ["isolation-records", farmId] }); setAddOpen(false); setForm({ ...emptyForm }); }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: ({ id, b }: any) => fetch(`/api/farms/${farmId}/isolation-records/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Record updated" }); qc.invalidateQueries({ queryKey: ["isolation-records", farmId] }); setEditRec(null); }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/isolation-records/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => { toast({ title: "Record deleted" }); qc.invalidateQueries({ queryKey: ["isolation-records", farmId] }); setDeleteId(null); }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });
  const createHcMut = useMutation({ mutationFn: ({ recId, b }: any) => fetch(`/api/farms/${farmId}/isolation-records/${recId}/health-checks`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Health check added" }); qc.invalidateQueries({ queryKey: ["isolation-hc", farmId, expandedId] }); setHcOpen(null); setHcForm({ ...emptyHc }); }, onError: () => toast({ title: "Failed to save health check", variant: "destructive" }) });
  const deleteHcMut = useMutation({ mutationFn: ({ recId, checkId }: any) => fetch(`/api/farms/${farmId}/isolation-records/${recId}/health-checks/${checkId}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => { toast({ title: "Health check deleted" }); qc.invalidateQueries({ queryKey: ["isolation-hc", farmId, expandedId] }); setDeleteHcId(null); }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });

  const fmtD = (d: any) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const active = records.filter((r: any) => !r.clearanceDate);
  const cleared = records.filter((r: any) => !!r.clearanceDate);
  const overdue = records.filter((r: any) => !r.clearanceDate && r.isolationEndDate && new Date(r.isolationEndDate) < new Date());

  function openEdit(r: any) {
    setEditRec(r);
    setForm({ isolationStartDate: r.isolationStartDate?.slice(0, 10) ?? "", isolationEndDate: r.isolationEndDate?.slice(0, 10) ?? "", animalCount: String(r.animalCount ?? ""), animalDescription: r.animalDescription ?? "", isolationReason: r.isolationReason ?? "", supplierName: r.supplierName ?? "", clearanceDate: r.clearanceDate?.slice(0, 10) ?? "", clearanceSignedBy: r.clearanceSignedBy ?? "", notes: r.notes ?? "", sourceJohnesVaccStatus: r.sourceJohnesVaccStatus ?? "", sourceJohnesVaccNotes: r.sourceJohnesVaccNotes ?? "", sourcePrrsStatus: r.sourcePrrsStatus ?? "", sourcePrrsNotes: r.sourcePrrsNotes ?? "", sourceMhStatus: r.sourceMhStatus ?? "", sourceMhNotes: r.sourceMhNotes ?? "", sourceMareksStatus: r.sourceMareksStatus ?? "", sourceMareksNotes: r.sourceMareksNotes ?? "", sourceSalmonellaNcpCategory: r.sourceSalmonellaNcpCategory ?? "", sourceSalmonellaNotes: r.sourceSalmonellaNotes ?? "" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Incoming Stock Isolation Register</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Red Tractor requirement: record isolation of all incoming livestock with daily health monitoring until clearance is given.</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1" />New Isolation Record</Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded-lg p-3 bg-amber-50"><p className="text-xs text-amber-700 font-medium">Active Isolations</p><p className="text-2xl font-bold text-amber-800 mt-1">{active.length}</p></div>
        <div className="border rounded-lg p-3 bg-green-50"><p className="text-xs text-green-700 font-medium">Cleared</p><p className="text-2xl font-bold text-green-800 mt-1">{cleared.length}</p></div>
        <div className="border rounded-lg p-3 bg-red-50"><p className="text-xs text-red-700 font-medium">Overdue Clearance</p><p className="text-2xl font-bold text-red-800 mt-1">{overdue.length}</p></div>
      </div>

      {recordsQ.isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>}
      {!recordsQ.isLoading && records.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <ClipboardCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-500">No isolation records yet</p>
          <p className="text-xs text-gray-400 mt-1">Add a record when you receive incoming livestock.</p>
        </div>
      )}

      <div className="space-y-2">
        {records.map((r: any) => {
          const isExp = expandedId === r.id;
          const isOverdue = !r.clearanceDate && r.isolationEndDate && new Date(r.isolationEndDate) < new Date();
          return (
            <div key={r.id} className={`border rounded-lg overflow-hidden ${isOverdue ? "border-red-300" : r.clearanceDate ? "border-green-300" : "border-amber-300"}`}>
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => { if (isExp) setExpandedId(null); else { setExpandedId(r.id); qc.invalidateQueries({ queryKey: ["isolation-hc", farmId, r.id] }); } }}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOverdue ? "bg-red-500" : r.clearanceDate ? "bg-green-500" : "bg-amber-400"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.animalDescription || r.isolationReason || "Isolation Record"}</p>
                    <p className="text-xs text-muted-foreground">{fmtD(r.isolationStartDate)} — {r.isolationEndDate ? fmtD(r.isolationEndDate) : "ongoing"}{r.animalCount ? ` · ${r.animalCount} animals` : ""}{r.supplierName ? ` · ${r.supplierName}` : ""}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.clearanceDate && <span className="text-xs bg-green-100 text-green-700 border border-green-200 rounded px-1.5 py-0.5">Cleared</span>}
                  {isOverdue && <span className="text-xs bg-red-100 text-red-700 border border-red-200 rounded px-1.5 py-0.5">Overdue</span>}
                  <button className="p-1 rounded hover:bg-gray-200" onClick={e => { e.stopPropagation(); openEdit(r); }}><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
                  <button className="p-1 rounded hover:bg-red-100" onClick={e => { e.stopPropagation(); setDeleteId(r.id); }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {isExp && (
                <div className="border-t bg-gray-50 px-4 py-3 space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                    <div><p className="text-xs text-muted-foreground">Reason</p><p>{r.isolationReason || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Supplier</p><p>{r.supplierName || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Animal Count</p><p>{r.animalCount ?? "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground">Clearance Date</p><p>{fmtD(r.clearanceDate)}</p></div>
                    <div><p className="text-xs text-muted-foreground">Clearance Signed By</p><p>{r.clearanceSignedBy || "—"}</p></div>
                    {r.notes && <div className="col-span-full"><p className="text-xs text-muted-foreground">Notes</p><p className="whitespace-pre-line">{r.notes}</p></div>}
                    {r.sourceJohnesVaccStatus && (
                      <div className={`col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r.sourceJohnesVaccStatus === "vaccinating" ? "bg-green-50 border-green-200 text-green-800" : r.sourceJohnesVaccStatus === "not_vaccinating" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                        <span className="font-semibold shrink-0">Johne's (source flock):</span>
                        <span>{r.sourceJohnesVaccStatus === "vaccinating" ? "✓ Vaccinating with Gudair — confirmed" : r.sourceJohnesVaccStatus === "not_vaccinating" ? "✗ Not vaccinating — biosecurity risk noted" : "Unknown — not confirmed by supplier"}{r.sourceJohnesVaccNotes ? ` · ${r.sourceJohnesVaccNotes}` : ""}</span>
                      </div>
                    )}
                    {r.sourcePrrsStatus && (
                      <div className={`col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r.sourcePrrsStatus === "negative" ? "bg-green-50 border-green-200 text-green-800" : r.sourcePrrsStatus === "positive_stable" ? "bg-amber-50 border-amber-200 text-amber-800" : r.sourcePrrsStatus === "positive_unstable" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                        <span className="font-semibold shrink-0">PRRS (source herd):</span>
                        <span>{r.sourcePrrsStatus === "negative" ? "✓ PRRS-negative — confirmed" : r.sourcePrrsStatus === "positive_stable" ? "⚠ PRRS-positive stable" : r.sourcePrrsStatus === "positive_unstable" ? "✗ PRRS-positive unstable — biosecurity risk" : "Unknown — not confirmed by supplier"}{r.sourcePrrsNotes ? ` · ${r.sourcePrrsNotes}` : ""}</span>
                      </div>
                    )}
                    {r.sourceMhStatus && (
                      <div className={`col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r.sourceMhStatus === "negative" ? "bg-green-50 border-green-200 text-green-800" : r.sourceMhStatus === "positive_stable" ? "bg-amber-50 border-amber-200 text-amber-800" : r.sourceMhStatus === "positive" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                        <span className="font-semibold shrink-0">MH / Enzootic Pneumonia (source herd):</span>
                        <span>{r.sourceMhStatus === "negative" ? "✓ MH-negative — confirmed" : r.sourceMhStatus === "positive_stable" ? "⚠ MH-positive stable" : r.sourceMhStatus === "positive" ? "✗ MH-positive" : "Unknown — not confirmed by supplier"}{r.sourceMhNotes ? ` · ${r.sourceMhNotes}` : ""}</span>
                      </div>
                    )}
                    {r.sourceMareksStatus && (
                      <div className={`col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r.sourceMareksStatus === "vaccinated" ? "bg-green-50 border-green-200 text-green-800" : r.sourceMareksStatus === "not_vaccinated" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                        <span className="font-semibold shrink-0">Marek's Disease (source flock):</span>
                        <span>{r.sourceMareksStatus === "vaccinated" ? "✓ Vaccinated — confirmed by hatchery/supplier" : r.sourceMareksStatus === "not_vaccinated" ? "✗ Not vaccinated — biosecurity risk noted" : "Unknown — not confirmed by supplier"}{r.sourceMareksNotes ? ` · ${r.sourceMareksNotes}` : ""}</span>
                      </div>
                    )}
                    {r.sourceSalmonellaNcpCategory && (
                      <div className={`col-span-full flex items-start gap-2 rounded px-2.5 py-2 text-xs border ${r.sourceSalmonellaNcpCategory === "category_1" ? "bg-green-50 border-green-200 text-green-800" : r.sourceSalmonellaNcpCategory === "category_2" ? "bg-amber-50 border-amber-200 text-amber-800" : r.sourceSalmonellaNcpCategory === "category_3" ? "bg-red-50 border-red-200 text-red-800" : "bg-gray-50 border-gray-200 text-gray-600"}`}>
                        <span className="font-semibold shrink-0">Salmonella NCP (source flock):</span>
                        <span>{r.sourceSalmonellaNcpCategory === "category_1" ? "✓ Category 1 — low prevalence" : r.sourceSalmonellaNcpCategory === "category_2" ? "⚠ Category 2 — moderate prevalence" : r.sourceSalmonellaNcpCategory === "category_3" ? "✗ Category 3 — high prevalence" : r.sourceSalmonellaNcpCategory === "not_tested" ? "Not tested" : "Unknown — not confirmed by supplier"}{r.sourceSalmonellaNotes ? ` · ${r.sourceSalmonellaNotes}` : ""}</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Daily Health Checks</p>
                      <Button size="sm" variant="outline" onClick={() => { setHcOpen(r.id); setHcForm({ ...emptyHc, checkDate: new Date().toISOString().slice(0, 10) }); }}><Plus className="w-3 h-3 mr-1" />Add Check</Button>
                    </div>
                    {hcQ.isLoading && <p className="text-xs text-muted-foreground">Loading…</p>}
                    {!hcQ.isLoading && hcs.length === 0 && <p className="text-xs text-gray-400">No health checks recorded.</p>}
                    <div className="space-y-1.5">
                      {hcs.map((hc: any) => (
                        <div key={hc.id} className="flex items-center justify-between bg-white border rounded px-3 py-2 text-sm">
                          <div className="flex items-center gap-3">
                            <span className={`w-2 h-2 rounded-full ${hc.healthStatus === "satisfactory" || hc.healthStatus === "clear" ? "bg-green-400" : hc.healthStatus === "poor" ? "bg-red-400" : "bg-amber-400"}`} />
                            <span className="font-medium">{fmtD(hc.checkDate)}</span>
                            <span className="text-muted-foreground capitalize">{hc.healthStatus?.replace(/_/g, " ")}</span>
                            {hc.temperatureCelsius && <span className="text-muted-foreground">{hc.temperatureCelsius}°C</span>}
                            {hc.checkedBy && <span className="text-muted-foreground">by {hc.checkedBy}</span>}
                          </div>
                          <button className="p-1 rounded hover:bg-red-100" onClick={() => setDeleteHcId({ recId: r.id, checkId: hc.id })}><Trash2 className="w-3 h-3 text-red-400" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={addOpen || !!editRec} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRec(null); setForm({ ...emptyForm }); createMut.reset(); updateMut.reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editRec ? "Edit Isolation Record" : "New Isolation Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Start Date *</Label><Input type="date" value={form.isolationStartDate} onChange={e => setForm(f => ({ ...f, isolationStartDate: e.target.value }))} /></div>
              <div><Label className="text-xs">Expected End Date</Label><Input type="date" value={form.isolationEndDate} onChange={e => setForm(f => ({ ...f, isolationEndDate: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Animal Description</Label><Input value={form.animalDescription} onChange={e => setForm(f => ({ ...f, animalDescription: e.target.value }))} placeholder="e.g. 12 Hereford heifers" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Number of Animals</Label><Input type="number" min="0" value={form.animalCount} onChange={e => setForm(f => ({ ...f, animalCount: e.target.value }))} /></div>
              <div><Label className="text-xs">Supplier / Source</Label><Input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Reason for Isolation</Label><Input value={form.isolationReason} onChange={e => setForm(f => ({ ...f, isolationReason: e.target.value }))} placeholder="e.g. New purchase, returned from show" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Clearance Date</Label><Input type="date" value={form.clearanceDate} onChange={e => setForm(f => ({ ...f, clearanceDate: e.target.value }))} /></div>
              <div><Label className="text-xs">Clearance Signed By</Label><Input value={form.clearanceSignedBy} onChange={e => setForm(f => ({ ...f, clearanceSignedBy: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Johne's Biosecurity — Sheep &amp; Goats</p>
              <p className="text-xs text-gray-400">AHDB recommends sourcing only from flocks vaccinating with Gudair (Ovilis Gudair). Record the source flock's status here for audit purposes.</p>
              <div><Label className="text-xs">Source Flock Johne's Vaccination Status</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.sourceJohnesVaccStatus} onChange={e => setForm(f => ({ ...f, sourceJohnesVaccStatus: e.target.value }))}>
                  <option value="">Not applicable / not recorded</option>
                  <option value="vaccinating">Vaccinating with Gudair — confirmed by supplier</option>
                  <option value="not_vaccinating">Not vaccinating — risk noted</option>
                  <option value="unknown">Unknown — not confirmed by supplier</option>
                </select>
              </div>
              <div><Label className="text-xs">Johne's Biosecurity Notes</Label><Input className="mt-1" value={form.sourceJohnesVaccNotes} onChange={e => setForm(f => ({ ...f, sourceJohnesVaccNotes: e.target.value }))} placeholder="e.g. Supplier confirmed Gudair programme since 2022…" /></div>
            </div>
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">PRRS Biosecurity — Pigs</p>
              <p className="text-xs text-gray-400">AHDB PRRS Accreditation Scheme: purchase only from herds with the same or lower PRRS risk status. Record the source herd's status at point of purchase.</p>
              <div><Label className="text-xs">Source Herd PRRS Status</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.sourcePrrsStatus} onChange={e => setForm(f => ({ ...f, sourcePrrsStatus: e.target.value }))}>
                  <option value="">Not applicable / not recorded</option>
                  <option value="negative">PRRS-negative — confirmed by supplier</option>
                  <option value="positive_stable">PRRS-positive stable</option>
                  <option value="positive_unstable">PRRS-positive unstable — elevated biosecurity risk</option>
                  <option value="unknown">Unknown — not confirmed by supplier</option>
                </select>
              </div>
              <div><Label className="text-xs">PRRS Biosecurity Notes</Label><Input className="mt-1" value={form.sourcePrrsNotes} onChange={e => setForm(f => ({ ...f, sourcePrrsNotes: e.target.value }))} placeholder="e.g. Supplier holds AHDB PRRS Negative accreditation…" /></div>
            </div>
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Enzootic Pneumonia / MH Biosecurity — Pigs</p>
              <p className="text-xs text-gray-400">AHDB MH Accreditation: source from MH-negative herds where possible. Record the source herd's Mycoplasma hyopneumoniae status at point of purchase.</p>
              <div><Label className="text-xs">Source Herd MH Status</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.sourceMhStatus} onChange={e => setForm(f => ({ ...f, sourceMhStatus: e.target.value }))}>
                  <option value="">Not applicable / not recorded</option>
                  <option value="negative">MH-negative — confirmed by supplier</option>
                  <option value="positive_stable">MH-positive stable</option>
                  <option value="positive">MH-positive</option>
                  <option value="unknown">Unknown — not confirmed by supplier</option>
                </select>
              </div>
              <div><Label className="text-xs">MH Biosecurity Notes</Label><Input className="mt-1" value={form.sourceMhNotes} onChange={e => setForm(f => ({ ...f, sourceMhNotes: e.target.value }))} placeholder="e.g. Supplier holds AHDB MH Negative accreditation…" /></div>
            </div>
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Marek's Disease Biosecurity — Poultry</p>
              <p className="text-xs text-gray-400">Marek's Disease is a highly contagious herpesvirus. Commercial chicks are typically vaccinated at the hatchery. Record the Marek's vaccination status of the source flock/hatchery at point of purchase.</p>
              <div><Label className="text-xs">Source Flock / Hatchery Marek's Vaccination Status</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.sourceMareksStatus} onChange={e => setForm(f => ({ ...f, sourceMareksStatus: e.target.value }))}>
                  <option value="">Not applicable / not recorded</option>
                  <option value="vaccinated">Vaccinated — confirmed by hatchery/supplier</option>
                  <option value="not_vaccinated">Not vaccinated — biosecurity risk noted</option>
                  <option value="unknown">Unknown — not confirmed by supplier</option>
                </select>
              </div>
              <div><Label className="text-xs">Marek's Biosecurity Notes</Label><Input className="mt-1" value={form.sourceMareksNotes} onChange={e => setForm(f => ({ ...f, sourceMareksNotes: e.target.value }))} placeholder="e.g. Confirmed HVT-vaccinated in ovo at hatchery…" /></div>
            </div>
            <div className="border-t pt-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Salmonella NCP Biosecurity — Poultry</p>
              <p className="text-xs text-gray-400">Red Tractor Poultry and BEIC require knowledge of source flock Salmonella NCP category. Record the most recent Salmonella NCP category of the source flock at point of purchase.</p>
              <div><Label className="text-xs">Source Flock Salmonella NCP Category</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.sourceSalmonellaNcpCategory} onChange={e => setForm(f => ({ ...f, sourceSalmonellaNcpCategory: e.target.value }))}>
                  <option value="">Not applicable / not recorded</option>
                  <option value="category_1">Category 1 — low prevalence (≤5%)</option>
                  <option value="category_2">Category 2 — moderate prevalence (5–19%)</option>
                  <option value="category_3">Category 3 — high prevalence (≥20%)</option>
                  <option value="not_tested">Not tested</option>
                  <option value="unknown">Unknown — not confirmed by supplier</option>
                </select>
              </div>
              <div><Label className="text-xs">Salmonella NCP Biosecurity Notes</Label><Input className="mt-1" value={form.sourceSalmonellaNotes} onChange={e => setForm(f => ({ ...f, sourceSalmonellaNotes: e.target.value }))} placeholder="e.g. Source flock most recent NCP result June 2026 Category 1…" /></div>
            </div>
          </div>
          <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRec(null); setForm({ ...emptyForm }); }}>Cancel</Button>
            <Button disabled={!form.isolationStartDate || createMut.isPending || updateMut.isPending} onClick={() => editRec ? updateMut.mutate({ id: editRec.id, b: form }) : createMut.mutate(form)}>
              {createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Create Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 380 }}>
          <DialogHeader><DialogTitle>Delete Isolation Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">This will permanently delete this isolation record and all associated health checks.</p>
          <DialogMutationError mutation={deleteMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMut.isPending} onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={hcOpen !== null} onOpenChange={o => { if (!o) { setHcOpen(null); createHcMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 420 }}>
          <DialogHeader><DialogTitle>Add Daily Health Check</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Check Date *</Label><Input type="date" value={hcForm.checkDate} onChange={e => setHcForm(f => ({ ...f, checkDate: e.target.value }))} /></div>
              <div><Label className="text-xs">Checked By</Label><StaffSelect value={hcForm.checkedBy} onChange={v => setHcForm(f => ({ ...f, checkedBy: v }))} staffNames={isoStaffNames} loading={isoMembersLoading} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Health Status</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={hcForm.healthStatus} onChange={e => setHcForm(f => ({ ...f, healthStatus: e.target.value }))}>
                  <option value="satisfactory">Satisfactory</option>
                  <option value="monitoring">Monitoring Required</option>
                  <option value="poor">Poor — Vet Notified</option>
                  <option value="clear">Clear — Released</option>
                </select>
              </div>
              <div><Label className="text-xs">Temperature (°C)</Label><Input type="number" step="0.1" value={hcForm.temperatureCelsius} onChange={e => setHcForm(f => ({ ...f, temperatureCelsius: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Notes</Label><Textarea value={hcForm.notes} onChange={e => setHcForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <div><Label className="text-xs">Action Taken</Label><Input value={hcForm.actionTaken} onChange={e => setHcForm(f => ({ ...f, actionTaken: e.target.value }))} placeholder="e.g. Vet called, medication administered" /></div>
          </div>
          <DialogMutationError mutation={createHcMut} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setHcOpen(null)}>Cancel</Button>
            <Button disabled={!hcForm.checkDate || createHcMut.isPending} onClick={() => hcOpen !== null && createHcMut.mutate({ recId: hcOpen, b: hcForm })}>
              {createHcMut.isPending ? "Saving…" : "Add Health Check"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteHcId !== null} onOpenChange={o => { if (!o) { setDeleteHcId(null); deleteHcMut.reset(); } }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Health Check</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this health check entry?</p>
          <DialogMutationError mutation={deleteHcMut} message="Failed to delete — please try again." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteHcId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteHcMut.isPending} onClick={() => deleteHcId && deleteHcMut.mutate(deleteHcId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

