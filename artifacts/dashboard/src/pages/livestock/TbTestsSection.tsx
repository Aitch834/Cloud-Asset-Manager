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


// ─── TB Test Register ──────────────────────────────────────────────────────────

interface TbTest { id: number; farmId: number; testDate: string; readingDate: string | null; testType: string; species: string; herdFlockRef: string | null; herdId: number | null; animalsTested: number | null; animalEarTags: string | null; reactors: number; inconclusives: number; outcome: string; aphaOfficer: string | null; aphaCaseRef: string | null; movementRestriction: boolean; restrictionLiftedDate: string | null; nextTestDueDate: string | null; testingVet: string | null; documentUrl: string | null; documentName: string | null; documentPath: string | null; movementId: number | null; notes: string | null; }

const EMPTY_TB: Omit<TbTest, "id" | "farmId"> = { testDate: "", readingDate: null, testType: "routine-skin", species: "cattle", herdFlockRef: null, herdId: null, animalsTested: null, animalEarTags: null, reactors: 0, inconclusives: 0, outcome: "clear", aphaOfficer: null, aphaCaseRef: null, movementRestriction: false, restrictionLiftedDate: null, nextTestDueDate: null, testingVet: null, documentUrl: null, documentName: null, documentPath: null, movementId: null, notes: null };

export function TbTestsSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const base = `/api/farms/${farmId}/tb-tests`;
  const { data, isLoading } = useQuery<{ records: TbTest[] }>({ queryKey: ["tb-tests", farmId], queryFn: () => fetch(base).then(r => r.json()) });
  const records = data?.records ?? [];
  const [yearFilterTb, setYearFilterTb] = usePersistedFilter({ page: "livestock-tb", filter: "year", farmId, defaultValue: "all", isValid: v => v === "all" || /^\d{4}$/.test(v) });
  const yearsTb = useMemo(() => Array.from(new Set(records.map(r => String(r.testDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredTbRecords = yearFilterTb === "all" ? records : records.filter(r => String(r.testDate ?? "").startsWith(yearFilterTb));

  const { data: herdsData } = useQuery<{ records: { id: number; name: string; type: string; herdNumber: string | null }[] }>({ queryKey: ["herds", farmId], queryFn: () => fetch(`/api/farms/${farmId}/herds`).then(r => r.json()) });
  const herds = herdsData?.records ?? [];

  const vetNames = [...new Set(records.map(r => r.testingVet).filter((v): v is string => !!v))];

  const outMovQ = useQuery<{ records: { id: number; movementType: string; movementDate: string; numberOfAnimals: number | null; species: string | null; fromLocation: string | null; toLocation: string | null; licenceNumber: string | null }[] }>({ queryKey: ["outgoing-movements", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-movements/outgoing`).then(r => r.json()), enabled: !!farmId });
  const outgoingMovements = outMovQ.data?.records ?? [];

  const { uploadFile, isUploading: isUploadingDoc } = useUpload();
  const [pendingDoc, setPendingDoc] = useState<{ path: string; name: string } | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [viewItem, setViewItem] = useState<TbTest | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TbTest | null>(null);
  const [form, setForm] = useState<typeof EMPTY_TB>({ ...EMPTY_TB });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const setF = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const createMut = useMutation({ mutationFn: (b: typeof EMPTY_TB) => fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["tb-tests", farmId] }); setShowForm(false); setForm({ ...EMPTY_TB }); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: (b: typeof EMPTY_TB & { id: number }) => fetch(`${base}/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["tb-tests", farmId] }); setShowForm(false); setEditing(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`${base}/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()), onSuccess: () => { qc.invalidateQueries({ queryKey: ["tb-tests", farmId] }); setDeleteId(null); }, onError: () => toast({ title: "Delete failed", variant: "destructive" }) });

  function openEdit(r: TbTest) { setEditing(r); setPendingDoc(null); setForm({ testDate: r.testDate, readingDate: r.readingDate ?? null, testType: r.testType, species: r.species, herdFlockRef: r.herdFlockRef ?? null, herdId: r.herdId ?? null, animalsTested: r.animalsTested, animalEarTags: r.animalEarTags ?? null, reactors: r.reactors, inconclusives: r.inconclusives, outcome: r.outcome, aphaOfficer: r.aphaOfficer ?? null, aphaCaseRef: r.aphaCaseRef ?? null, movementRestriction: r.movementRestriction, restrictionLiftedDate: r.restrictionLiftedDate ?? null, nextTestDueDate: r.nextTestDueDate ?? null, testingVet: r.testingVet ?? null, documentUrl: r.documentUrl ?? null, documentName: r.documentName ?? null, documentPath: r.documentPath ?? null, movementId: r.movementId ?? null, notes: r.notes ?? null }); setShowForm(true); }

  function printReport() {
    const rows = records.map(r => `<tr><td>${formatDate(r.testDate)}</td><td>${r.testType.replace(/-/g," ")}</td><td>${r.species}</td><td>${r.herdFlockRef ?? "—"}</td><td>${r.animalsTested ?? "—"}</td><td>${r.reactors}</td><td>${r.inconclusives}</td><td>${r.outcome.toUpperCase()}</td><td>${r.movementRestriction ? "YES" : "No"}</td><td>${formatDate(r.nextTestDueDate)}</td><td style="text-align:center;color:${r.movementId ? "#166534" : "#9ca3af"};font-weight:${r.movementId ? "700" : "400"}">${r.movementId ? "✓ Linked" : "—"}</td></tr>`).join("");
    printProReport({ title: "TB Test Register", subtitle: `${records.length} test records`, tableHtml: `<table><thead><tr><th>Test Date</th><th>Test Type</th><th>Species</th><th>Herd/Flock</th><th>Tested</th><th>Reactors</th><th>Inconc.</th><th>Outcome</th><th>Restriction</th><th>Next Due</th><th>Movement Linked</th></tr></thead><tbody>${rows}</tbody></table>` });
  }


  return (
    <>
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="font-semibold text-gray-900">TB Test Register</h3>
          <p className="text-sm text-gray-500 mt-0.5">Official bovine tuberculosis test records as required under TB (England) Order 2021 and Red Tractor standards.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearFilterTb} onValueChange={setYearFilterTb}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsTb.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={printReport}><Printer className="h-3.5 w-3.5 mr-1" />Print Report</Button>
          <Button onClick={() => { setEditing(null); setForm({ ...EMPTY_TB }); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" />Log TB Test</Button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>Red Tractor Requirement:</strong> All bovine TB test results must be recorded with test date, reading date, number tested, reactors, inconclusives and outcome. Movement restrictions must be noted where applicable.
      </div>

      {isLoading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
        : filteredTbRecords.length === 0 ? <Card><CardContent className="py-16 text-center"><AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="font-medium text-gray-700 mb-1">No TB tests recorded</p><p className="text-sm text-muted-foreground">Log your first bovine TB test result to start your register.</p></CardContent></Card>
        : <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Injection / Reading</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Species</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Herd/Flock</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Tested</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Reactors</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Outcome</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Next Due</th>
                <th className="px-4 py-3" />
              </tr></thead>
              <tbody className="divide-y">
                {filteredTbRecords.map(r => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{formatDate(r.testDate)}</div>
                      {r.readingDate
                        ? <div className="text-xs text-muted-foreground mt-0.5">Reading: {formatDate(r.readingDate)}</div>
                        : <div className="text-xs text-amber-600 font-semibold mt-0.5">⏳ Reading pending</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 capitalize">
                      <div>{r.testType.replace(/-/g," ")}</div>
                      {r.movementId && <span className="text-xs font-semibold rounded px-1 py-0.5" style={{ fontSize: "0.65rem", background: "#dcfce7", color: "#166534" }}>Movement</span>}
                    </td>
                    <td className="px-4 py-3 text-xs capitalize">{r.species}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{r.herdFlockRef ?? "—"}</td>
                    <td className="px-4 py-3 text-right">{r.animalsTested ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold">{r.reactors > 0 ? <span className="text-red-600">{r.reactors}</span> : r.reactors}</td>
                    <td className="px-4 py-3"><span className={`inline-flex text-xs font-semibold rounded-full px-2 py-0.5 ${OUTCOME_COLOURS[r.outcome] ?? "bg-gray-100 text-gray-700"}`}>{r.outcome.toUpperCase()}</span>{r.movementRestriction && <span className="ml-1 text-xs text-red-600 font-semibold">⚠ Restricted</span>}</td>
                    <td className="px-4 py-3 text-xs">{formatDate(r.nextTestDueDate)}</td>
                    <td className="px-4 py-3"><div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setViewItem(r)} title="View"><Eye className="h-3 w-3 text-blue-500" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3 w-3" /></Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}

      {viewItem && (
        <Dialog open onOpenChange={() => setViewItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>TB Test — {formatDate(viewItem.testDate)}</DialogTitle><DialogDescription>{viewItem.species} · {viewItem.testType.replace(/-/g," ")}</DialogDescription></DialogHeader>
            <div className="flex items-center gap-2 mt-1 mb-2">
              {viewItem.readingDate
                ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800">✓ Both stages complete</span>
                : <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">⏳ Stage 1 done — Reading pending</span>}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Stage 1 — Injection</p><p className="font-medium">{formatDate(viewItem.testDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Stage 2 — Reading (72 h)</p><p className="font-medium">{viewItem.readingDate ? formatDate(viewItem.readingDate) : <span className="text-amber-600">Pending</span>}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Test Type</p><p className="font-medium capitalize">{viewItem.testType.replace(/-/g," ")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Species</p><p className="font-medium capitalize">{viewItem.species}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd / Flock Ref</p><p className="font-medium">{viewItem.herdFlockRef ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Animals Tested</p><p className="font-medium">{viewItem.animalsTested ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reactors</p><p className="font-semibold text-red-600">{viewItem.reactors}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Inconclusives</p><p className="font-medium">{viewItem.inconclusives}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome</p><p className="font-semibold uppercase">{viewItem.outcome}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Movement Restriction</p><p className={viewItem.movementRestriction ? "font-semibold text-red-600" : ""}>{viewItem.movementRestriction ? "YES — Restricted" : "No"}</p></div>
              {viewItem.restrictionLiftedDate && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Restriction Lifted</p><p className="font-medium">{formatDate(viewItem.restrictionLiftedDate)}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Test Due</p><p className="font-medium">{formatDate(viewItem.nextTestDueDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Testing Vet</p><p className="font-medium">{viewItem.testingVet ?? "—"}</p></div>
              {viewItem.aphaOfficer && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">APHA Officer</p><p className="font-medium">{viewItem.aphaOfficer}</p></div>}
              {viewItem.aphaCaseRef && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">APHA Case Ref</p><p className="font-medium font-mono">{viewItem.aphaCaseRef}</p></div>}
              {viewItem.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="whitespace-pre-line">{viewItem.notes}</p></div>}
              {(viewItem.documentName || viewItem.documentPath) && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Document</p><a href={viewItem.documentPath ? `/api/storage${viewItem.documentPath}` : (viewItem.documentUrl ?? "#")} target="_blank" rel="noreferrer" className="text-primary text-xs underline">{viewItem.documentName || "View Document"}</a></div>}
              {viewItem.animalEarTags && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Ear Tags ({viewItem.animalEarTags.split("\n").filter(t => t.trim()).length})</p><pre className="text-xs font-mono bg-muted rounded p-2 max-h-32 overflow-y-auto whitespace-pre-wrap">{viewItem.animalEarTags}</pre></div>}
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Linked Movement Record</p>
                {viewItem.movementId
                  ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800 mt-0.5">✓ Movement #{viewItem.movementId} linked — pre/post-movement audit trail complete</span>
                  : <span className="text-sm text-muted-foreground">{(viewItem.testType === "pre-movement" || viewItem.testType === "post-movement") ? <span className="text-amber-700 font-medium">Not yet linked — edit this record to link the corresponding off-farm movement</span> : "Not linked (optional for routine tests)"}</span>}
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { openEdit(viewItem); setViewItem(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewItem(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showForm && (
        <Dialog open onOpenChange={o => { if (!o) { setShowForm(false); setEditing(null); createMut.reset(); updateMut.reset(); } }}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Edit TB Test Record" : "Log TB Test"}</DialogTitle><DialogDescription>Record bovine TB test results as required by APHA and Red Tractor standards.</DialogDescription></DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div><Label>Test Date *</Label><Input type="date" value={form.testDate ?? ""} onChange={e => setF("testDate", e.target.value)} /></div>
              <div><Label>Reading Date</Label><Input type="date" value={form.readingDate ?? ""} onChange={e => setF("readingDate", e.target.value || null)} /></div>
              <div><Label>Test Type *</Label>
                <Select value={form.testType} onValueChange={v => setF("testType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine-skin">Routine Skin Test</SelectItem>
                    <SelectItem value="short-interval">Short Interval Test (SIT)</SelectItem>
                    <SelectItem value="check-test">Check Test</SelectItem>
                    <SelectItem value="gamma-interferon">Gamma Interferon Blood Test</SelectItem>
                    <SelectItem value="pre-movement">Pre-movement Test (PMT)</SelectItem>
                    <SelectItem value="post-movement">Post-movement Test</SelectItem>
                    <SelectItem value="new-herd">New Herd Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Species *</Label>
                <Select value={form.species} onValueChange={v => setF("species", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cattle">Cattle</SelectItem>
                    <SelectItem value="deer">Deer</SelectItem>
                    <SelectItem value="camelids">Camelids / Llamas</SelectItem>
                    <SelectItem value="goats">Goats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Herd / Flock</Label>
                {herds.length > 0 ? (
                  <Select value={form.herdId ? String(form.herdId) : "__manual"} onValueChange={v => { if (v === "__manual") { setF("herdId", null); } else { const h = herds.find(h => h.id === Number(v)); setF("herdId", Number(v)); if (h) setF("herdFlockRef", h.herdNumber || h.name); } }}>
                    <SelectTrigger><SelectValue placeholder="Select herd…" /></SelectTrigger>
                    <SelectContent>
                      {herds.map(h => <SelectItem key={h.id} value={String(h.id)}>{h.name}{h.herdNumber ? ` (${h.herdNumber})` : ""}</SelectItem>)}
                      <SelectItem value="__manual">Enter manually…</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={form.herdFlockRef ?? ""} onChange={e => setF("herdFlockRef", e.target.value || null)} placeholder="CPH / herd name" />
                )}
                {form.herdId === null && herds.length > 0 && (
                  <Input className="mt-1" value={form.herdFlockRef ?? ""} onChange={e => setF("herdFlockRef", e.target.value || null)} placeholder="Herd / flock number or name" />
                )}
              </div>
              <div><Label>Animals Tested</Label><Input type="number" min={0} value={form.animalsTested ?? ""} onChange={e => setF("animalsTested", e.target.value ? Number(e.target.value) : null)} placeholder={form.animalEarTags ? String((form.animalEarTags.split("\n").filter(t => t.trim()).length)) : ""} /></div>
              <div className="col-span-2">
                <Label>Animal Ear Tags <span className="text-muted-foreground font-normal">(one per line — count auto-fills Animals Tested)</span></Label>
                <Textarea
                  rows={4}
                  value={form.animalEarTags ?? ""}
                  onChange={e => {
                    const raw = e.target.value || null;
                    setF("animalEarTags", raw);
                    const count = raw ? raw.split("\n").filter(t => t.trim()).length : null;
                    if (count) setF("animalsTested", count);
                  }}
                  placeholder={"UK123456789012\nUK123456789013\n…"}
                  className="font-mono text-xs"
                />
              </div>
              <div><Label>Reactors</Label><Input type="number" min={0} value={form.reactors} onChange={e => setF("reactors", Number(e.target.value))} /></div>
              <div><Label>Inconclusives</Label><Input type="number" min={0} value={form.inconclusives} onChange={e => setF("inconclusives", Number(e.target.value))} /></div>
              <div className="col-span-2"><Label>Outcome *</Label>
                <Select value={form.outcome} onValueChange={v => setF("outcome", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clear">Clear — All animals negative</SelectItem>
                    <SelectItem value="inconclusive">Inconclusive — Some reactors inconclusive</SelectItem>
                    <SelectItem value="restricted">Restricted — Movement restriction imposed</SelectItem>
                    <SelectItem value="breakdown">Breakdown — TB confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input type="checkbox" id="tbRestriction" checked={form.movementRestriction} onChange={e => setF("movementRestriction", e.target.checked)} className="h-4 w-4" />
                <Label htmlFor="tbRestriction">Movement restriction currently in place</Label>
              </div>
              {form.movementRestriction && <div><Label>Restriction Lifted Date</Label><Input type="date" value={form.restrictionLiftedDate ?? ""} onChange={e => setF("restrictionLiftedDate", e.target.value || null)} /></div>}
              <div><Label>Next Test Due Date</Label><Input type="date" value={form.nextTestDueDate ?? ""} onChange={e => setF("nextTestDueDate", e.target.value || null)} /></div>
              <div><Label>Testing Vet</Label>
                <Input list="tb-vet-list" value={form.testingVet ?? ""} onChange={e => setF("testingVet", e.target.value || null)} placeholder="Veterinary surgeon name" />
                <datalist id="tb-vet-list">{vetNames.map(v => <option key={v} value={v} />)}</datalist>
              </div>
              <div><Label>APHA Officer</Label><Input value={form.aphaOfficer ?? ""} onChange={e => setF("aphaOfficer", e.target.value || null)} /></div>
              <div><Label>APHA Case Reference</Label><Input value={form.aphaCaseRef ?? ""} onChange={e => setF("aphaCaseRef", e.target.value || null)} className="font-mono" /></div>
              <div className="col-span-2">
                <Label>Test Document</Label>
                <input type="file" ref={docInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const upload = await uploadFile(file);
                  if (upload?.objectPath) { setPendingDoc({ path: upload.objectPath, name: file.name }); setF("documentPath", upload.objectPath); setF("documentName", file.name); }
                  if (docInputRef.current) docInputRef.current.value = "";
                }} />
                {(pendingDoc || form.documentPath || form.documentName) ? (
                  <div className="flex items-center gap-2 mt-1 p-2 border rounded text-sm">
                    <span className="text-muted-foreground">📎</span>
                    {form.documentPath ? (
                      <a href={`/api/storage${form.documentPath}`} target="_blank" rel="noreferrer" className="text-primary underline truncate flex-1">{form.documentName || "Document"}</a>
                    ) : (
                      <span className="truncate flex-1">{form.documentName || "Document"}</span>
                    )}
                    <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setPendingDoc(null); setF("documentPath", null); setF("documentName", null); }}>×</Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => docInputRef.current?.click()} disabled={isUploadingDoc}>
                    {isUploadingDoc ? "Uploading…" : "Upload Document (PDF / image)"}
                  </Button>
                )}
              </div>
              <div className="col-span-2">
                  <Label>Link to Livestock Movement Record <span className="font-normal text-muted-foreground text-xs">{(form.testType === "pre-movement" || form.testType === "post-movement") ? "(required for pre/post-movement tests)" : "(optional)"}</span></Label>
                  <select
                    value={form.movementId ?? ""}
                    onChange={e => setF("movementId", e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">— Not linked to a movement record —</option>
                    {outgoingMovements.map((m) => (
                      <option key={m.id} value={m.id}>
                        {new Date(m.movementDate).toLocaleDateString("en-GB")} · {m.movementType.toUpperCase()} · {m.species ?? "Unknown"} · {m.numberOfAnimals ?? "?"} head {m.toLocation ? `→ ${m.toLocation}` : ""} {m.licenceNumber ? `[${m.licenceNumber}]` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setF("notes", e.target.value || null)} rows={2} /></div>
            </div>
            <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
            <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
              <Button onClick={() => editing ? updateMut.mutate({ ...form, id: editing.id }) : createMut.mutate(form)} disabled={!form.testDate || !form.outcome || createMut.isPending || updateMut.isPending}>
                {(createMut.isPending || updateMut.isPending) && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                {editing ? "Update" : "Log TB Test"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {deleteId !== null && <ConfirmDialog open title="Delete TB Test Record?" message="This record will be permanently removed from your TB register." onConfirm={() => deleteMut.mutate(deleteId!)} onCancel={() => setDeleteId(null)} confirmLabel="Delete" confirmVariant="destructive" />}
    </>
  );
}
