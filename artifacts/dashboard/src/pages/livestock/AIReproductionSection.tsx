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

export function AIReproductionSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [pendingConfirm, setPendingConfirm] = useState<{ msg: string; fn: () => void } | null>(null);
  const [viewAIRecord, setViewAIRecord] = useState<Record<string, unknown> | null>(null);

  // Lookup data
  const { data: herdsData } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/herds`, { credentials: "include" }).then(r => r.json()),
  });
  const { data: animalsData } = useQuery({
    queryKey: ["animals", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/animals`, { credentials: "include" }).then(r => r.json()),
  });
  const { data: siresData } = useQuery({
    queryKey: ["sires", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/sires`, { credentials: "include" }).then(r => r.json()) as Promise<{ records: Sire[] }>,
  });
  const { data: strawsData } = useQuery({
    queryKey: ["straws", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straws`, { credentials: "include" }).then(r => r.json()) as Promise<{ records: StrawInventory[] }>,
  });
  const { data: membersData } = useFarmMembers(farmId);

  const { data: aiAttachCountsRaw = [] } = useQuery<Array<{recordType: string; recordId: number; count: number}>>({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments/counts`, { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });
  const aiAttachMap = Object.fromEntries(aiAttachCountsRaw.filter(c => c.recordType === "ai_breeding").map(c => [c.recordId, c.count]));

  const herds: Herd[] = (herdsData?.records ?? []).filter((h: Herd) => h.isActive);
  const allAnimals: Animal[] = animalsData?.records ?? [];
  const activeSires: Sire[] = (siresData?.records ?? []).filter((s: Sire) => s.isActive);
  const inStockStraws: StrawInventory[] = (strawsData?.records ?? []).filter((s: StrawInventory) => (s.strawsReceived - (s.strawsUsed ?? 0)) > 0);

  // Filter animals to selected herd (if any), active only
  const selectedHerdId = form.herdId ? Number(form.herdId) : null;
  const herdAnimals = allAnimals.filter(a =>
    a.status !== "Dead" && a.status !== "Sold" &&
    (selectedHerdId ? a.herdId === selectedHerdId : true)
  );

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["ai-reproduction", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/ai-reproduction-records`, { credentials: "include" }).then(r => r.json()),
  });

  const staffNames = (membersData?.members ?? []).map((m: Parameters<typeof memberFullName>[0]) => memberFullName(m));

  function handleSireSelect(val: string) {
    if (val === "__none__") {
      setForm(f => ({ ...f, sireRegisterId: "", sireName: "", sireBreed: "" }));
      return;
    }
    const sire = activeSires.find(s => String(s.id) === val);
    if (sire) {
      setForm(f => ({ ...f, sireRegisterId: String(sire.id), sireName: sire.name, sireBreed: sire.breed ?? "" }));
    }
  }

  function handleStrawSelect(val: string) {
    if (val === "__none__") {
      setForm(f => ({ ...f, strawInventoryId: "", strawBatchRef: "", sireName: "", sireBreed: "" }));
      return;
    }
    const straw = inStockStraws.find(s => String(s.id) === val);
    if (straw) {
      setForm(f => ({
        ...f,
        strawInventoryId: String(straw.id),
        strawBatchRef: straw.batchNumber,
        sireName: straw.sireName,
        sireBreed: straw.sireBreed ?? "",
      }));
    }
  }

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? `/api/farms/${farmId}/ai-reproduction-records/${editing.id}` : `/api/farms/${farmId}/ai-reproduction-records`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ai-reproduction", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/ai-reproduction-records/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-reproduction", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // When a herd is selected, store its id and name
  const handleHerdSelect = (herdId: string) => {
    if (herdId === "__none__") {
      setForm(f => ({ ...f, herdId: "", herdName: "", animalTag: "", animalId: "" }));
      return;
    }
    const herd = herds.find(h => String(h.id) === herdId);
    setForm(f => ({ ...f, herdId: herdId, herdName: herd?.name ?? "", animalTag: "", animalId: "" }));
  };

  // When an animal is selected, auto-fill tag and breed
  const handleAnimalSelect = (animalId: string) => {
    if (animalId === "__none__") {
      setForm(f => ({ ...f, animalId: "", animalTag: "" }));
      return;
    }
    const animal = allAnimals.find(a => String(a.id) === animalId);
    if (animal) {
      setForm(f => ({
        ...f,
        animalId: animalId,
        animalTag: animal.earTagNumber ?? animal.tagNumber ?? "",
      }));
    }
  };

  const allAIRows = (records as Record<string, unknown>[]);
  const [yearFilterAI, setYearFilterAI] = usePersistedFilter({ page: "livestock-ai", filter: "year", farmId, defaultValue: "all", isValid: v => v === "all" || /^\d{4}$/.test(v) });
  const yearsAI = useMemo(() => Array.from(new Set(allAIRows.map(r => String(r.eventDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allAIRows]);
  const rows = yearFilterAI === "all" ? allAIRows : allAIRows.filter(r => String(r.eventDate ?? "").startsWith(yearFilterAI));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold">AI & Reproduction Records</h3>
          <p className="text-sm text-muted-foreground">Log AI, natural service, RVI confirmation and expected calving / lambing dates.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearFilterAI} onValueChange={setYearFilterAI}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsAI.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditing(null); setForm({ servicingMethod: "AI", conceptionConfirmed: false }); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </Button>
        </div>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <Card><CardContent className="pt-4">
          {rows.length === 0 ? <p className="text-sm text-muted-foreground italic py-4 text-center">No AI/reproduction records yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {["Event Date", "Animal Tag", "Herd", "Type", "Method", "Sire", "Conception", "Expected Due"].map(h => <th key={h} className="text-left py-2 pr-4 font-medium text-muted-foreground">{h}</th>)}
                  <th />
                </tr></thead>
                <tbody>{rows.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 pr-4">{r.eventDate ? new Date(r.eventDate as string).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="py-2 pr-4">{String(r.animalTag ?? "—")}</td>
                    <td className="py-2 pr-4">{String(r.herdName ?? "—")}</td>
                    <td className="py-2 pr-4">{String(r.recordType ?? "—")}</td>
                    <td className="py-2 pr-4">{String(r.servicingMethod ?? "—")}</td>
                    <td className="py-2 pr-4">{String(r.sireName ?? r.sireId ?? "—")}</td>
                    <td className="py-2 pr-4">{r.conceptionConfirmed ? "Yes" : "No"}</td>
                    <td className="py-2 pr-4">{r.expectedDueDate ? new Date(r.expectedDueDate as string).toLocaleDateString("en-GB") : "—"}</td>
                    <td className="py-2 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(aiAttachMap[r.id as number] ?? 0) > 0 && (
                          <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />{aiAttachMap[r.id as number]}
                          </span>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => setViewAIRecord(r)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])) as Record<string, string | boolean>); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setPendingConfirm({ msg: "Delete this AI/Reproduction record? This cannot be undone.", fn: () => del.mutate(r.id as number) })}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </CardContent></Card>
      )}

      <ConfirmDialog
        open={!!pendingConfirm}
        title="Delete Record"
        message={pendingConfirm?.msg ?? ""}
        onConfirm={() => { pendingConfirm?.fn(); setPendingConfirm(null); }}
        onCancel={() => setPendingConfirm(null)}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />

      {viewAIRecord && (
        <Dialog open onOpenChange={() => setViewAIRecord(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>AI / Reproduction Record — {String(viewAIRecord.animalTag || `Record #${viewAIRecord.id}`)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mt-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Event Date</p><p className="font-medium">{viewAIRecord.eventDate ? new Date(viewAIRecord.eventDate as string).toLocaleDateString("en-GB") : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Record Type</p><p className="font-medium">{String(viewAIRecord.recordType ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Animal Tag</p><p className="font-medium font-mono">{String(viewAIRecord.animalTag ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd / Flock</p><p className="font-medium">{String(viewAIRecord.herdName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Servicing Method</p><p className="font-medium">{String(viewAIRecord.servicingMethod ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Inseminator / Technician</p><p className="font-medium">{String(viewAIRecord.inseminatorName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sire / Bull / Ram</p><p className="font-medium">{String(viewAIRecord.sireName ?? "—")}{viewAIRecord.sireBreed ? ` (${viewAIRecord.sireBreed})` : ""}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Straw Batch Ref</p><p className="font-medium font-mono">{String(viewAIRecord.strawBatchRef ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Conception Confirmed</p><p className="font-medium">{viewAIRecord.conceptionConfirmed ? "Yes ✓" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Due Date</p><p className="font-medium">{viewAIRecord.expectedDueDate ? new Date(viewAIRecord.expectedDueDate as string).toLocaleDateString("en-GB") : "—"}</p></div>
              {!!viewAIRecord.pregnancyDiagDate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pregnancy Diag Date</p><p className="font-medium">{new Date(viewAIRecord.pregnancyDiagDate as string).toLocaleDateString("en-GB")}</p></div>}
              {!!viewAIRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewAIRecord.notes)}</p></div>}
            </div>
            <div className="mt-4">
              <RecordAttachments farmId={farmId} recordType="ai_breeding" recordId={viewAIRecord.id as number} />
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setViewAIRecord(null)}>Close</Button>
              <Button onClick={() => { setEditing(viewAIRecord); setForm(Object.fromEntries(Object.entries(viewAIRecord).map(([k, v]) => [k, v ?? ""])) as Record<string, string | boolean>); setOpen(true); setViewAIRecord(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Record" : "Add AI / Reproduction Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[75vh] overflow-y-auto pr-1">
            <div><Label>Event Date *</Label><Input type="date" value={String(form.eventDate ?? "")} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} /></div>
            <div><Label>Record Type *</Label>
              <Select value={String(form.recordType ?? "")} onValueChange={v => setForm(f => ({ ...f, recordType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{["AI Service", "Natural Service", "Pregnancy Diagnosis", "Calving / Kidding / Lambing", "Embryo Transfer"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* ── Herd lookup ── */}
            <div><Label>Herd / Flock</Label>
              <Select value={String(form.herdId || "__none__")} onValueChange={handleHerdSelect}>
                <SelectTrigger><SelectValue placeholder="Select herd…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— No specific herd —</SelectItem>
                  {herds.map(h => (
                    <SelectItem key={h.id} value={String(h.id)}>
                      {h.name}{h.type ? ` (${herdSpeciesDisplayLabel(h.type)}${herdProductionSubtype(h.type, (h as any).productionType) ? ` · ${herdProductionSubtype(h.type, (h as any).productionType)}` : ""})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {herds.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">No herds registered — add one in the Herds &amp; Flocks tab first.</p>
              )}
            </div>

            {/* ── Animal Tag lookup, filtered by herd ── */}
            <div><Label>Animal Tag *</Label>
              {herdAnimals.length > 0 ? (
                <Select value={String(form.animalId || "__none__")} onValueChange={handleAnimalSelect}>
                  <SelectTrigger><SelectValue placeholder="Select animal…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Type manually below —</SelectItem>
                    {herdAnimals.map(a => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.earTagNumber ?? a.tagNumber ?? `Animal #${a.id}`}
                        {a.breed ? ` — ${a.breed}` : ""}
                        {a.sex ? ` (${a.sex})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-xs text-muted-foreground mt-1 mb-1">
                  {selectedHerdId ? "No active animals in this herd" : "Select a herd to filter animals"}
                </p>
              )}
              <Input
                className="mt-1"
                placeholder="Ear tag / tag number"
                value={String(form.animalTag ?? "")}
                onChange={e => setForm(f => ({ ...f, animalTag: e.target.value, animalId: "" }))}
              />
            </div>

            <div><Label>Servicing Method *</Label>
              <Select value={String(form.servicingMethod ?? "AI")} onValueChange={v => setForm(f => ({ ...f, servicingMethod: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["AI", "Natural Service", "Embryo Transfer", "N/A"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* ── Inseminator / Technician staff lookup ── */}
            <div><Label>Inseminator / Technician</Label>
              <StaffSelect
                staffNames={staffNames}
                value={String(form.inseminatorName ?? "")}
                onChange={v => setForm(f => ({ ...f, inseminatorName: v }))}
              />
            </div>

            {/* ── Straw inventory picker ── */}
            <div className="col-span-2">
              <Label>Select from Straw Inventory</Label>
              <Select value={String(form.strawInventoryId || "__none__")} onValueChange={handleStrawSelect}>
                <SelectTrigger><SelectValue placeholder="Pick an in-stock batch…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Enter batch ref manually —</SelectItem>
                  {inStockStraws.map(s => {
                    const remaining = s.strawsReceived - (s.strawsUsed ?? 0);
                    return (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.sireName} — {s.batchNumber}{s.supplierName ? ` (${s.supplierName})` : ""} · {remaining} left
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {inStockStraws.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">No straws in stock — add a delivery in the Straw Inventory tab, or enter the batch ref manually below.</p>
              )}
            </div>
            <div><Label>Straw / Batch Ref</Label><Input value={String(form.strawBatchRef ?? "")} onChange={e => setForm(f => ({ ...f, strawBatchRef: e.target.value }))} placeholder="Auto-filled from inventory, or enter manually" /></div>
            {/* ── Sire register lookup ── */}
            <div className="col-span-2">
              <Label>Sire / Bull / Ram</Label>
              <Select value={String(form.sireRegisterId || "__none__")} onValueChange={handleSireSelect}>
                <SelectTrigger><SelectValue placeholder="Select from sire register…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Enter manually below —</SelectItem>
                  {activeSires.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}{s.breed ? ` (${s.breed})` : ""}{s.tagNumber ? ` — ${s.tagNumber}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeSires.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">No sires in register — add one in the Sires &amp; Rams tab, or type a name below.</p>
              )}
            </div>
            <div><Label>Sire Name</Label><Input value={String(form.sireName ?? "")} onChange={e => setForm(f => ({ ...f, sireName: e.target.value }))} placeholder="Auto-filled from register, or type manually" /></div>
            <div><Label>Sire Breed</Label><Input value={String(form.sireBreed ?? "")} onChange={e => setForm(f => ({ ...f, sireBreed: e.target.value }))} placeholder="Auto-filled from register" /></div>
            <div><Label>Expected Due Date</Label><Input type="date" value={String(form.expectedDueDate ?? "")} onChange={e => setForm(f => ({ ...f, expectedDueDate: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-4">
              <input type="checkbox" id="conceptionConfirmed" checked={Boolean(form.conceptionConfirmed)} onChange={e => setForm(f => ({ ...f, conceptionConfirmed: e.target.checked }))} className="w-4 h-4" />
              <Label htmlFor="conceptionConfirmed">Conception confirmed?</Label>
            </div>
            <div><Label>Confirmation Method</Label>
              <Select value={String(form.confirmationMethod ?? "")} onValueChange={v => setForm(f => ({ ...f, confirmationMethod: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["RVI Scanning", "Blood Test", "Milk Progesterone", "Return to Service not observed", "Visual Assessment"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Confirmation Date</Label><Input type="date" value={String(form.confirmationDate ?? "")} onChange={e => setForm(f => ({ ...f, confirmationDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Vet Prescriptions / Medicine Treatment Register ────────────────────────────
