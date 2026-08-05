import React, { useState, useEffect, useRef, useMemo } from "react";
import { TabButton, TabBar } from "@/components/ui/tab-button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { useFields, useAddField, useUpdateField, useDeleteField } from "@/hooks/use-fields";
import { useCrops, useAddCrop, useFieldCropAssignments, useAssignCrop } from "@/hooks/use-crops";
import {
  getListFieldCropAssignmentsQueryKey,
  getListFieldsQueryKey,
  getListCropsQueryKey,
  useListSeedBatches,
  getListSeedBatchesQueryKey,
  useGenerateFieldCropLabels,
} from "@workspace/api-client-react/src/generated/api";
import { useFarmMembers, memberFullName } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import {
  Plus, PlusCircle, Search, Map as MapIcon, MoreVertical, Pencil, Trash2, AlertTriangle,
  Sprout, Leaf, CalendarDays, Wheat, ChevronRight, X, History, ChevronDown, Printer, FlaskConical, Loader2, QrCode, StickyNote, ShoppingCart,
  Landmark, Phone, MapPin, BadgePoundSterling, RefreshCw, FileText, CheckCircle2, XCircle, Paperclip, Download, Key,
  TreePine, Layers3, TrendingUp, TrendingDown, Minus, Scale, CloudRain, BarChart2, Trophy, Medal, ChevronUp, Eye,
} from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import { QRCodeSVG } from "qrcode.react";
import { FieldBoundaryMapDialog } from "@/components/fields/FieldBoundaryMapDialog";
import { FieldSchematicMap } from "@/components/fields/FieldSchematicMap";
import { useForm } from "react-hook-form";
import { Redirect, useLocation, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { printProReport } from "@/lib/print-report";
import { printSeedBagLabels } from "@/lib/print-labels";
import { cropYearOptions, cropYearLabel, currentCropYear, isInCropYear } from "@/lib/cropYear";
import { getEstablishmentPercent, calculateSeedRate, suggestTargetPopulation, BLACKGRASS_TARGET_POPULATION_M2 } from "@/lib/seedRateCalculator";
import { useToast } from "@/hooks/use-toast";
import { DocAttach } from "@/components/DocAttach";
import CropSeasonReport from "@/components/CropSeasonReport";

// ─── Grassland & Pasture Management ──────────────────────────────────────────
export function GrasslandSection({ farmId, fields }: { farmId: number; fields: any[] }) {
  const [subTab, setSubTab] = useState<"grazing" | "reseeding">("grazing");
  const qc = useQueryClient();
  const { toast } = useToast();

  const gEmpty = { fieldId: "", entryDate: "", exitDate: "", grazingSystem: "set-stocking", speciesGrazed: "", animalCount: "", preGrazingCoverMm: "", postGrazingResidualMm: "", manureAppliedBeforeEntry: false, notes: "" };
  const [gAddOpen, setGAddOpen] = useState(false);
  const [gEditRec, setGEditRec] = useState<any>(null);
  const [gDeleteId, setGDeleteId] = useState<number | null>(null);
  const [gExpandedId, setGExpandedId] = useState<number | null>(null);
  const [gForm, setGForm] = useState({ ...gEmpty });

  const rEmpty = { fieldId: "", reseedingDate: "", reason: "", seedMixDescription: "", seedRateKgHa: "", areaHa: "", seedingMethod: "direct-drill", notes: "" };
  const [rAddOpen, setRAddOpen] = useState(false);
  const [rEditRec, setREditRec] = useState<any>(null);
  const [rDeleteId, setRDeleteId] = useState<number | null>(null);
  const [rExpandedId, setRExpandedId] = useState<number | null>(null);
  const [rForm, setRForm] = useState({ ...rEmpty });

  const grazingQ = useQuery({ queryKey: ["grassland-grazing", farmId], queryFn: () => fetch(`/api/farms/${farmId}/grassland-grazing-events`).then(r => r.json()), enabled: !!farmId, select: (d: any) => d.events ?? [] });
  const reseedingQ = useQuery({ queryKey: ["grassland-reseeding", farmId], queryFn: () => fetch(`/api/farms/${farmId}/grassland-reseeding-records`).then(r => r.json()), enabled: !!farmId, select: (d: any) => d.records ?? [] });
  const gEvents: any[] = grazingQ.data ?? [];
  const rRecords: any[] = reseedingQ.data ?? [];

  const gCreateMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/grassland-grazing-events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Grazing event recorded" }); qc.invalidateQueries({ queryKey: ["grassland-grazing", farmId] }); setGAddOpen(false); setGForm({ ...gEmpty }); }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const gUpdateMut = useMutation({ mutationFn: ({ id, b }: any) => fetch(`/api/farms/${farmId}/grassland-grazing-events/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Event updated" }); qc.invalidateQueries({ queryKey: ["grassland-grazing", farmId] }); setGEditRec(null); }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const gDeleteMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/grassland-grazing-events/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => { toast({ title: "Event deleted" }); qc.invalidateQueries({ queryKey: ["grassland-grazing", farmId] }); setGDeleteId(null); }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });

  const rCreateMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/grassland-reseeding-records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Reseeding record created" }); qc.invalidateQueries({ queryKey: ["grassland-reseeding", farmId] }); setRAddOpen(false); setRForm({ ...rEmpty }); }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const rUpdateMut = useMutation({ mutationFn: ({ id, b }: any) => fetch(`/api/farms/${farmId}/grassland-reseeding-records/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { toast({ title: "Record updated" }); qc.invalidateQueries({ queryKey: ["grassland-reseeding", farmId] }); setREditRec(null); }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const rDeleteMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/grassland-reseeding-records/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => { toast({ title: "Record deleted" }); qc.invalidateQueries({ queryKey: ["grassland-reseeding", farmId] }); setRDeleteId(null); }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });

  const fmtD = (d: any) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const fldName = (id: any) => fields.find(f => String(f.id) === String(id))?.name || `Field #${id}`;
  function calcDays(a: string, b: string) { if (!a || !b) return null; const d = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000); return d >= 0 ? d : null; }

  function openGEdit(e: any) { setGEditRec(e); setGForm({ fieldId: String(e.fieldId ?? ""), entryDate: e.entryDate?.slice(0, 10) ?? "", exitDate: e.exitDate?.slice(0, 10) ?? "", grazingSystem: e.grazingSystem ?? "set-stocking", speciesGrazed: e.speciesGrazed ?? "", animalCount: String(e.animalCount ?? ""), preGrazingCoverMm: String(e.preGrazingCoverMm ?? ""), postGrazingResidualMm: String(e.postGrazingResidualMm ?? ""), manureAppliedBeforeEntry: e.manureAppliedBeforeEntry ?? false, notes: e.notes ?? "" }); }
  function openREdit(r: any) { setREditRec(r); setRForm({ fieldId: String(r.fieldId ?? ""), reseedingDate: r.reseedingDate?.slice(0, 10) ?? "", reason: r.reason ?? "", seedMixDescription: r.seedMixDescription ?? "", seedRateKgHa: String(r.seedRateKgHa ?? ""), areaHa: String(r.areaHa ?? ""), seedingMethod: r.seedingMethod ?? "direct-drill", notes: r.notes ?? "" }); }

  const gSystems = [["set-stocking","Set Stocking"],["rotational","Rotational"],["strip-grazing","Strip Grazing"],["zero-grazing","Zero Grazing"],["other","Other"]];
  const seedMethods = [["direct-drill","Direct Drill"],["plough-and-sow","Plough & Sow"],["oversow","Oversow"],["slot-seeding","Slot Seeding"],["other","Other"]];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">Grassland &amp; Pasture Management</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Record grazing rotations and reseeding activities for Red Tractor soil and grassland compliance.</p>
      </div>
      <div className="flex border-b gap-4">
        {(["grazing", "reseeding"] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={`pb-2 text-sm font-medium border-b-2 -mb-px capitalize transition-colors ${subTab === t ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "grazing" ? "Grazing Events" : "Reseeding Records"}
          </button>
        ))}
      </div>

      {subTab === "grazing" && (
        <div className="space-y-3">
          <div className="flex justify-end"><Button size="sm" onClick={() => setGAddOpen(true)}><Plus className="w-4 h-4 mr-1" />Log Grazing Event</Button></div>
          {grazingQ.isLoading && <div className="flex justify-center py-8 text-sm text-muted-foreground gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>}
          {!grazingQ.isLoading && gEvents.length === 0 && <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg"><p className="text-sm font-medium text-gray-500">No grazing events recorded</p><p className="text-xs text-gray-400 mt-1">Log each time a field is grazed to track rotations and rest periods.</p></div>}
          <div className="space-y-2">
            {gEvents.map((e: any) => {
              const isExp = gExpandedId === e.id;
              const days = calcDays(e.entryDate, e.exitDate);
              return (
                <div key={e.id} className="border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => setGExpandedId(isExp ? null : e.id)}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{fldName(e.fieldId)}</p>
                      <p className="text-xs text-muted-foreground">{fmtD(e.entryDate)} → {e.exitDate ? fmtD(e.exitDate) : "ongoing"}{days !== null ? ` · ${days} days` : ""}{e.speciesGrazed ? ` · ${e.speciesGrazed}` : ""}{e.animalCount ? ` · ${e.animalCount} animals` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded hover:bg-gray-200" onClick={ev => { ev.stopPropagation(); openGEdit(e); }}><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
                      <button className="p-1 rounded hover:bg-red-100" onClick={ev => { ev.stopPropagation(); setGDeleteId(e.id); }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  {isExp && (
                    <div className="border-t bg-gray-50 px-4 py-3 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                      <div><p className="text-xs text-muted-foreground">Grazing System</p><p className="capitalize">{e.grazingSystem?.replace(/-/g, " ") || "—"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Pre-Grazing Cover</p><p>{e.preGrazingCoverMm ? `${e.preGrazingCoverMm} mm` : "—"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Post-Grazing Residual</p><p>{e.postGrazingResidualMm ? `${e.postGrazingResidualMm} mm` : "—"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Manure Applied Before Entry</p><p>{e.manureAppliedBeforeEntry ? "Yes" : "No"}</p></div>
                      {e.notes && <div className="col-span-full"><p className="text-xs text-muted-foreground">Notes</p><p className="whitespace-pre-line">{e.notes}</p></div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Dialog open={gAddOpen || !!gEditRec} onOpenChange={o => { if (!o) { setGAddOpen(false); setGEditRec(null); setGForm({ ...gEmpty }); gCreateMut.reset(); gUpdateMut.reset(); } }}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{gEditRec ? "Edit Grazing Event" : "Log Grazing Event"}</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div><Label className="text-xs">Field *</Label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={gForm.fieldId} onChange={e => setGForm(f => ({ ...f, fieldId: e.target.value }))}>
                    <option value="">Select a field…</option>
                    {fields.map((f: any) => <option key={f.id} value={String(f.id)}>{f.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Entry Date *</Label><Input type="date" value={gForm.entryDate} onChange={e => setGForm(f => ({ ...f, entryDate: e.target.value }))} /></div>
                  <div><Label className="text-xs">Exit Date</Label><Input type="date" value={gForm.exitDate} onChange={e => setGForm(f => ({ ...f, exitDate: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Grazing System</Label>
                    <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={gForm.grazingSystem} onChange={e => setGForm(f => ({ ...f, grazingSystem: e.target.value }))}>
                      {gSystems.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div><Label className="text-xs">Species Grazed</Label><Input value={gForm.speciesGrazed} onChange={e => setGForm(f => ({ ...f, speciesGrazed: e.target.value }))} placeholder="e.g. Beef cattle" /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs">Animal Count</Label><Input type="number" min="0" value={gForm.animalCount} onChange={e => setGForm(f => ({ ...f, animalCount: e.target.value }))} /></div>
                  <div><Label className="text-xs">Pre-Cover (mm)</Label><Input type="number" min="0" value={gForm.preGrazingCoverMm} onChange={e => setGForm(f => ({ ...f, preGrazingCoverMm: e.target.value }))} /></div>
                  <div><Label className="text-xs">Post-Residual (mm)</Label><Input type="number" min="0" value={gForm.postGrazingResidualMm} onChange={e => setGForm(f => ({ ...f, postGrazingResidualMm: e.target.value }))} /></div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="g-manure" checked={gForm.manureAppliedBeforeEntry} onChange={e => setGForm(f => ({ ...f, manureAppliedBeforeEntry: e.target.checked }))} />
                  <Label htmlFor="g-manure" className="text-sm cursor-pointer">Manure applied before entry</Label>
                </div>
                <div><Label className="text-xs">Notes</Label><Textarea value={gForm.notes} onChange={e => setGForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              </div>
              <DialogMutationError mutation={gCreateMut} message="Failed to save — your entries are still here." />
              <DialogMutationError mutation={gUpdateMut} message="Failed to save — your entries are still here." />
              <DialogFooter>
                <Button variant="outline" onClick={() => { setGAddOpen(false); setGEditRec(null); setGForm({ ...gEmpty }); }}>Cancel</Button>
                <Button disabled={!gForm.fieldId || !gForm.entryDate || gCreateMut.isPending || gUpdateMut.isPending} onClick={() => gEditRec ? gUpdateMut.mutate({ id: gEditRec.id, b: gForm }) : gCreateMut.mutate(gForm)}>
                  {gCreateMut.isPending || gUpdateMut.isPending ? "Saving…" : gEditRec ? "Save Changes" : "Log Event"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={gDeleteId !== null} onOpenChange={o => { if (!o) { setGDeleteId(null); gDeleteMut.reset(); } }}>
            <DialogContent style={{ maxWidth: 360 }}><DialogHeader><DialogTitle>Delete Grazing Event</DialogTitle></DialogHeader><p className="text-sm text-gray-600 py-2">Permanently delete this grazing event?</p><DialogMutationError mutation={gDeleteMut} message="Failed to delete — please try again." /><DialogFooter><Button variant="outline" onClick={() => setGDeleteId(null)}>Cancel</Button><Button variant="destructive" disabled={gDeleteMut.isPending} onClick={() => gDeleteId !== null && gDeleteMut.mutate(gDeleteId)}>Delete</Button></DialogFooter></DialogContent>
          </Dialog>
        </div>
      )}

      {subTab === "reseeding" && (
        <div className="space-y-3">
          <div className="flex justify-end"><Button size="sm" onClick={() => setRAddOpen(true)}><Plus className="w-4 h-4 mr-1" />Add Reseeding Record</Button></div>
          {reseedingQ.isLoading && <div className="flex justify-center py-8 text-sm text-muted-foreground gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>}
          {!reseedingQ.isLoading && rRecords.length === 0 && <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg"><p className="text-sm font-medium text-gray-500">No reseeding records</p><p className="text-xs text-gray-400 mt-1">Record when fields are reseeded to track pasture history.</p></div>}
          <div className="space-y-2">
            {rRecords.map((r: any) => {
              const isExp = rExpandedId === r.id;
              return (
                <div key={r.id} className="border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => setRExpandedId(isExp ? null : r.id)}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{fldName(r.fieldId)}</p>
                      <p className="text-xs text-muted-foreground">{fmtD(r.reseedingDate)}{r.reason ? ` · ${r.reason}` : ""}{r.areaHa ? ` · ${r.areaHa} ha` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-1 rounded hover:bg-gray-200" onClick={ev => { ev.stopPropagation(); openREdit(r); }}><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
                      <button className="p-1 rounded hover:bg-red-100" onClick={ev => { ev.stopPropagation(); setRDeleteId(r.id); }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                  {isExp && (
                    <div className="border-t bg-gray-50 px-4 py-3 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                      <div><p className="text-xs text-muted-foreground">Seeding Method</p><p className="capitalize">{r.seedingMethod?.replace(/-/g, " ") || "—"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Seed Mix</p><p>{r.seedMixDescription || "—"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Seed Rate</p><p>{r.seedRateKgHa ? `${r.seedRateKgHa} kg/ha` : "—"}</p></div>
                      <div><p className="text-xs text-muted-foreground">Area</p><p>{r.areaHa ? `${r.areaHa} ha` : "—"}</p></div>
                      {r.notes && <div className="col-span-full"><p className="text-xs text-muted-foreground">Notes</p><p className="whitespace-pre-line">{r.notes}</p></div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Dialog open={rAddOpen || !!rEditRec} onOpenChange={o => { if (!o) { setRAddOpen(false); setREditRec(null); setRForm({ ...rEmpty }); rCreateMut.reset(); rUpdateMut.reset(); } }}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{rEditRec ? "Edit Reseeding Record" : "Add Reseeding Record"}</DialogTitle></DialogHeader>
              <div className="space-y-3 py-2">
                <div><Label className="text-xs">Field *</Label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={rForm.fieldId} onChange={e => setRForm(f => ({ ...f, fieldId: e.target.value }))}>
                    <option value="">Select a field…</option>
                    {fields.map((f: any) => <option key={f.id} value={String(f.id)}>{f.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Reseeding Date *</Label><Input type="date" value={rForm.reseedingDate} onChange={e => setRForm(f => ({ ...f, reseedingDate: e.target.value }))} /></div>
                  <div><Label className="text-xs">Area (ha)</Label><Input type="number" step="0.01" min="0" value={rForm.areaHa} onChange={e => setRForm(f => ({ ...f, areaHa: e.target.value }))} /></div>
                </div>
                <div><Label className="text-xs">Reason for Reseeding</Label><Input value={rForm.reason} onChange={e => setRForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Poaching damage, weed control, species improvement" /></div>
                <div><Label className="text-xs">Seed Mix Description</Label><Input value={rForm.seedMixDescription} onChange={e => setRForm(f => ({ ...f, seedMixDescription: e.target.value }))} placeholder="e.g. Perennial ryegrass + white clover" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Seed Rate (kg/ha)</Label><Input type="number" step="0.1" min="0" value={rForm.seedRateKgHa} onChange={e => setRForm(f => ({ ...f, seedRateKgHa: e.target.value }))} /></div>
                  <div><Label className="text-xs">Seeding Method</Label>
                    <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={rForm.seedingMethod} onChange={e => setRForm(f => ({ ...f, seedingMethod: e.target.value }))}>
                      {seedMethods.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div><Label className="text-xs">Notes</Label><Textarea value={rForm.notes} onChange={e => setRForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
              </div>
              <DialogMutationError mutation={rCreateMut} message="Failed to save — your entries are still here." />
              <DialogMutationError mutation={rUpdateMut} message="Failed to save — your entries are still here." />
              <DialogFooter>
                <Button variant="outline" onClick={() => { setRAddOpen(false); setREditRec(null); setRForm({ ...rEmpty }); }}>Cancel</Button>
                <Button disabled={!rForm.fieldId || !rForm.reseedingDate || rCreateMut.isPending || rUpdateMut.isPending} onClick={() => rEditRec ? rUpdateMut.mutate({ id: rEditRec.id, b: rForm }) : rCreateMut.mutate(rForm)}>
                  {rCreateMut.isPending || rUpdateMut.isPending ? "Saving…" : rEditRec ? "Save Changes" : "Add Record"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={rDeleteId !== null} onOpenChange={o => { if (!o) { setRDeleteId(null); rDeleteMut.reset(); } }}>
            <DialogContent style={{ maxWidth: 360 }}><DialogHeader><DialogTitle>Delete Reseeding Record</DialogTitle></DialogHeader><p className="text-sm text-gray-600 py-2">Permanently delete this reseeding record?</p><DialogMutationError mutation={rDeleteMut} message="Failed to delete — please try again." /><DialogFooter><Button variant="outline" onClick={() => setRDeleteId(null)}>Cancel</Button><Button variant="destructive" disabled={rDeleteMut.isPending} onClick={() => rDeleteId !== null && rDeleteMut.mutate(rDeleteId)}>Delete</Button></DialogFooter></DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

