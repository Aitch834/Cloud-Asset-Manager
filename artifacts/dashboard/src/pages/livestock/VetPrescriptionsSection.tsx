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

export function VetPrescriptionsSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean | number>>({});
  const [pendingConfirm, setPendingConfirm] = useState<{ msg: string; fn: () => void } | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["vet-prescriptions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/vet-prescriptions`, { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? `/api/farms/${farmId}/vet-prescriptions/${editing.id}` : `/api/farms/${farmId}/vet-prescriptions`;
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["vet-prescriptions", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/vet-prescriptions/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vet-prescriptions", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const allRxRows = (records as Record<string, unknown>[]);
  const [yearFilterRx, setYearFilterRx] = usePersistedFilter({ page: "livestock-prescriptions", filter: "year", farmId, defaultValue: "all", isValid: v => v === "all" || /^\d{4}$/.test(v) });
  const yearsRx = useMemo(() => Array.from(new Set(allRxRows.map(r => String(r.prescriptionDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allRxRows]);
  const rows = yearFilterRx === "all" ? allRxRows : allRxRows.filter(r => String(r.prescriptionDate ?? "").startsWith(yearFilterRx));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold">Prescription Register</h3>
          <p className="text-sm text-muted-foreground">Record the written prescription or SIC issued by your vet authorising use of each product. Treatment administration is recorded separately in the Medicine module.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={yearFilterRx} onValueChange={setYearFilterRx}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsRx.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditing(null); setForm({ signedByVet: true, farmRegistered: true }); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </Button>
        </div>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <Card><CardContent className="pt-4">
          {rows.length === 0 ? <p className="text-sm text-muted-foreground italic py-4 text-center">No medicine treatment records yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {["Rx Date", "Product / Active Ingredient", "Indication", "Withdrawal Meat", "Withdrawal Milk", "Vet / Practice", "Valid Until", "Treatments"].map(h => (
                    <th key={h} className="text-left py-2 pr-4 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                  <th />
                </tr></thead>
                <tbody>{rows.map((r, i) => {
                  const treatmentsRecorded = Number((r as any).treatmentsRecorded ?? 0);
                  return (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap">{r.prescriptionDate ? new Date(r.prescriptionDate as string).toLocaleDateString("en-GB") : "—"}</td>
                      <td className="py-2 pr-4">
                        <div className="font-medium">{String(r.productName ?? "—")}</div>
                        {r.activeIngredient != null && <div className="text-xs text-muted-foreground">{String(r.activeIngredient)}</div>}
                        {Boolean(r.isCascade) && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded mt-0.5 inline-block">Cascade</span>}
                      </td>
                      <td className="py-2 pr-4 max-w-[200px] text-xs text-muted-foreground">{r.indicationOrDiagnosis ? String(r.indicationOrDiagnosis).slice(0, 80) + (String(r.indicationOrDiagnosis).length > 80 ? "…" : "") : "—"}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{r.withdrawalPeriodMeat ? `${r.withdrawalPeriodMeat}d` : "—"}</td>
                      <td className="py-2 pr-4 whitespace-nowrap">{r.withdrawalPeriodMilk ? `${r.withdrawalPeriodMilk}d` : "—"}</td>
                      <td className="py-2 pr-4">
                        <div>{String(r.vetName ?? "—")}</div>
                        {r.vrcPracticeName != null && <div className="text-xs text-muted-foreground">{String(r.vrcPracticeName)}</div>}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {r.expiryDate
                          ? (() => {
                              const exp = new Date(r.expiryDate as string);
                              const daysLeft = Math.ceil((exp.getTime() - Date.now()) / 86400000);
                              return daysLeft < 0
                                ? <span className="text-xs text-red-600 font-medium">Expired</span>
                                : daysLeft <= 30
                                  ? <span className="text-xs text-amber-600 font-medium">{exp.toLocaleDateString("en-GB")} ({daysLeft}d)</span>
                                  : <span className="text-xs">{exp.toLocaleDateString("en-GB")}</span>;
                            })()
                          : "—"}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {treatmentsRecorded > 0
                          ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full"><CheckCircle2 className="h-3 w-3" />{treatmentsRecorded}</span>
                          : <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"><AlertTriangle className="h-3 w-3" />None</span>}
                      </td>
                      <td className="py-2 text-right space-x-1 whitespace-nowrap">
                        <Button size="icon" variant="ghost" title="View" onClick={() => setViewRecord(r)}><Eye className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""])) as Record<string, string | boolean>); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => setPendingConfirm({ msg: "Delete this prescription record? This cannot be undone.", fn: () => del.mutate(r.id as number, { onSuccess: () => setPendingConfirm(null) }) })}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
        </CardContent></Card>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "48rem", maxHeight: "90vh", overflowY: "auto" }}>
            <DialogHeader><DialogTitle>Prescription Record — {String(viewRecord.productName ?? "")}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescription Date</p><p className="font-medium">{viewRecord.prescriptionDate ? new Date(viewRecord.prescriptionDate as string).toLocaleDateString("en-GB") : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescription Ref</p><p className="font-medium">{String(viewRecord.prescriptionRef || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Name</p><p className="font-medium">{String(viewRecord.vetName || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Practice</p><p className="font-medium">{String(viewRecord.vetPractice || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet RCVS Number</p><p className="font-medium">{String(viewRecord.vetRcvsNumber || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Valid Until</p><p className="font-medium">{viewRecord.prescriptionValidUntil ? new Date(viewRecord.prescriptionValidUntil as string).toLocaleDateString("en-GB") : "—"}</p></div>
              <div className="col-span-2 border-t pt-3"><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{String(viewRecord.productName || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Active Ingredient</p><p className="font-medium">{String(viewRecord.activeIngredient || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Route of Administration</p><p className="font-medium">{String(viewRecord.routeOfAdministration || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dose</p><p className="font-medium">{String(viewRecord.dose || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Frequency</p><p className="font-medium">{String(viewRecord.frequency || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Duration</p><p className="font-medium">{String(viewRecord.treatmentDuration || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity Authorised</p><p className="font-medium">{String(viewRecord.quantityAuthorised || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity Dispensed</p><p className="font-medium">{String(viewRecord.dispensedQuantity || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Batch Number</p><p className="font-medium">{String(viewRecord.batchNumber || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expiry Date</p><p className="font-medium">{viewRecord.expiryDate ? new Date(viewRecord.expiryDate as string).toLocaleDateString("en-GB") : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal — Meat</p><p className="font-medium">{viewRecord.withdrawalPeriodMeat ? `${viewRecord.withdrawalPeriodMeat}d` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal — Milk</p><p className="font-medium">{viewRecord.withdrawalPeriodMilk ? `${viewRecord.withdrawalPeriodMilk}d` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal — Eggs</p><p className="font-medium">{viewRecord.withdrawalPeriodEggs ? `${viewRecord.withdrawalPeriodEggs}d` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Target Species</p><p className="font-medium">{String(viewRecord.targetSpecies || "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cascade / Off-label</p><p className="font-medium">{viewRecord.isCascade ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Signed by Vet</p><p className="font-medium">{viewRecord.signedByVet ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Farm Registered</p><p className="font-medium">{viewRecord.farmRegistered ? "Yes" : "No"}</p></div>
              {!!viewRecord.cascadeJustification && (
                <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Cascade Justification</p><p className="font-medium">{String(viewRecord.cascadeJustification)}</p></div>
              )}
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Indication / Diagnosis</p><p className="font-medium">{String(viewRecord.indicationOrDiagnosis || "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes || "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditing(viewRecord); setForm(Object.fromEntries(Object.entries(viewRecord).map(([k, v]) => [k, v ?? ""])) as Record<string, string | boolean>); setOpen(true); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog
        open={!!pendingConfirm}
        title="Delete Prescription Record"
        message={pendingConfirm?.msg ?? ""}
        mutation={del}
        onConfirm={() => { pendingConfirm?.fn(); }}
        onCancel={() => { setPendingConfirm(null); del.reset(); }}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "52rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Medicine Record" : "Add Prescription / Medicine Treatment Record"}</DialogTitle>
            <DialogDescription>Record the veterinary prescription and the animals treated. Required under VMR 2013 and Red Tractor standards.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[72vh] overflow-y-auto pr-1">

            {/* ── Prescription details ── */}
            <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Prescription Details</div>
            <div><Label>Prescription Date *</Label><Input type="date" value={String(form.prescriptionDate ?? "")} onChange={e => setForm(f => ({ ...f, prescriptionDate: e.target.value }))} /></div>
            <div><Label>Prescription Reference</Label><Input value={String(form.prescriptionRef ?? "")} onChange={e => setForm(f => ({ ...f, prescriptionRef: e.target.value }))} /></div>
            <div><Label>Vet Name *</Label><Input value={String(form.vetName ?? "")} onChange={e => setForm(f => ({ ...f, vetName: e.target.value }))} /></div>
            <div><Label>Vet Practice</Label><Input value={String(form.vetPractice ?? "")} onChange={e => setForm(f => ({ ...f, vetPractice: e.target.value }))} /></div>
            <div><Label>Vet RCVS Number</Label><Input value={String(form.vetRcvsNumber ?? "")} onChange={e => setForm(f => ({ ...f, vetRcvsNumber: e.target.value }))} /></div>
            <div><Label>Prescription Valid Until</Label><Input type="date" value={String(form.prescriptionValidUntil ?? "")} onChange={e => setForm(f => ({ ...f, prescriptionValidUntil: e.target.value }))} /></div>

            {/* ── Medicine details ── */}
            <div className="col-span-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2 border-t">Medicine Details</div>
            <div><Label>Product Name *</Label><Input value={String(form.productName ?? "")} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} /></div>
            <div><Label>Active Ingredient</Label><Input value={String(form.activeIngredient ?? "")} onChange={e => setForm(f => ({ ...f, activeIngredient: e.target.value }))} /></div>
            <div><Label>Route of Administration *</Label>
              <Select value={String(form.routeOfAdministration ?? "")} onValueChange={v => setForm(f => ({ ...f, routeOfAdministration: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Oral", "Injection (IM)", "Injection (SC)", "Injection (IV)", "Topical", "Pour-on", "Intramammary", "Intrauterine", "In-water", "In-feed"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Dose</Label><Input value={String(form.dose ?? "")} onChange={e => setForm(f => ({ ...f, dose: e.target.value }))} /></div>
            <div><Label>Frequency</Label><Input value={String(form.frequency ?? "")} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} /></div>
            <div><Label>Treatment Duration</Label><Input value={String(form.treatmentDuration ?? "")} onChange={e => setForm(f => ({ ...f, treatmentDuration: e.target.value }))} /></div>
            <div><Label>Quantity Authorised</Label><Input value={String(form.quantityAuthorised ?? "")} onChange={e => setForm(f => ({ ...f, quantityAuthorised: e.target.value }))} /></div>
            <div><Label>Quantity Dispensed</Label><Input value={String(form.dispensedQuantity ?? "")} onChange={e => setForm(f => ({ ...f, dispensedQuantity: e.target.value }))} /></div>
            <div><Label>Batch Number</Label><Input value={String(form.batchNumber ?? "")} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} /></div>
            <div><Label>Expiry Date</Label><Input type="date" value={String(form.expiryDate ?? "")} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
            <div><Label>Withdrawal — Meat (days)</Label><Input type="number" value={String(form.withdrawalPeriodMeat ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalPeriodMeat: e.target.value }))} /></div>
            <div><Label>Withdrawal — Milk (days)</Label><Input type="number" value={String(form.withdrawalPeriodMilk ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalPeriodMilk: e.target.value }))} /></div>
            <div><Label>Withdrawal — Eggs (days)</Label><Input type="number" value={String(form.withdrawalPeriodEggs ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalPeriodEggs: e.target.value }))} /></div>
            <div className="col-span-2 space-y-2">
              {([["signedByVet", "Signed by vet?"], ["isCascade", "Cascade / off-label use?"], ["farmRegistered", "Farm registered for prescribing?"]] as [string, string][]).map(([k, l]) => (
                <div key={k} className="flex items-center gap-2">
                  <input type="checkbox" id={`rx-${k}`} checked={Boolean(form[k])} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} className="w-4 h-4" />
                  <Label htmlFor={`rx-${k}`}>{l}</Label>
                </div>
              ))}
            </div>
            {Boolean(form.isCascade) && (
              <div className="col-span-2"><Label>Cascade Justification</Label><Textarea value={String(form.cascadeJustification ?? "")} onChange={e => setForm(f => ({ ...f, cascadeJustification: e.target.value }))} rows={2} /></div>
            )}
            <div className="col-span-2"><Label>Indication / Diagnosis</Label><Textarea value={String(form.indicationOrDiagnosis ?? "")} onChange={e => setForm(f => ({ ...f, indicationOrDiagnosis: e.target.value }))} rows={2} /></div>

            {/* ── Target species ── */}
            <div><Label>Target Species</Label><Input value={String(form.targetSpecies ?? "")} onChange={e => setForm(f => ({ ...f, targetSpecies: e.target.value }))} placeholder="e.g. Cattle, Sheep, Pigs" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>

            {/* ── Separation notice ── */}
            <div className="col-span-2 mt-1 p-3 rounded-lg border border-blue-200 bg-blue-50 text-sm text-blue-800">
              <strong>Recording actual treatments?</strong> Once medicine has been administered, record each treatment event — ear tags, date given, who administered it, batch number used — in the <strong>Medicine</strong> module (sidebar). When creating a treatment entry there, you can link it back to this prescription for a full audit trail. Keeping prescription authorisation and treatment administration in separate registers is the VMR 2013 standard.
            </div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save Record</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

