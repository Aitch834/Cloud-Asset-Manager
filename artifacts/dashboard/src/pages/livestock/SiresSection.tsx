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

export function SiresSection({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Sire | null>(null);
  const [form, setForm] = useState<typeof EMPTY_SIRE>(EMPTY_SIRE);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const baseUrl = `/api/farms/${farmId}/sires`;
  const { data, isLoading } = useQuery({
    queryKey: ["sires", farmId],
    queryFn: () => fetch(baseUrl, { credentials: "include" }).then(r => r.json()) as Promise<{ records: Sire[] }>,
  });
  const records: Sire[] = (data?.records ?? []).filter(s => s.isActive);
  const filtered = records.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.breed ?? "").toLowerCase().includes(search.toLowerCase()));

  const createMut = useMutation({
    mutationFn: (body: Record<string, unknown>) => fetch(baseUrl, { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sires", farmId] }); setOpen(false); setForm(EMPTY_SIRE); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) => fetch(`${baseUrl}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sires", farmId] }); setOpen(false); setForm(EMPTY_SIRE); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`${baseUrl}/${id}`, { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sires", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openAdd() { setEditing(null); setForm(EMPTY_SIRE); setOpen(true); }
  function openEdit(s: Sire) {
    setEditing(s);
    setForm({
      name: s.name ?? "", species: s.species ?? "Cattle", breed: s.breed ?? "", tagNumber: s.tagNumber ?? "",
      passportNumber: s.passportNumber ?? "", dateOfBirth: s.dateOfBirth ?? "", ownershipType: s.ownershipType ?? "owned",
      supplierName: s.supplierName ?? "", supplierContact: s.supplierContact ?? "",
      hireStartDate: s.hireStartDate ?? "", hireEndDate: s.hireEndDate ?? "", returnDate: s.returnDate ?? "",
      bvdStatus: s.bvdStatus ?? "", fertilityTestDate: s.fertilityTestDate ?? "",
      fertilityTestResult: s.fertilityTestResult ?? "", scrapieGenotype: s.scrapieGenotype ?? "", notes: s.notes ?? "",
    });
    setOpen(true);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) clean[k] = v === "" ? null : v;
    if (editing) updateMut.mutate({ id: editing.id, body: clean });
    else createMut.mutate(clean);
  }
  const saving = createMut.isPending || updateMut.isPending;
  const isHiredOrLoaned = form.ownershipType === "hired_in" || form.ownershipType === "loaned";

  const ownershipLabel: Record<string, string> = { owned: "Owned", hired_in: "Hired In", loaned: "Loaned" };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Input placeholder="Search sires…" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
        </div>
        <Button onClick={openAdd} className="gap-1"><Plus className="h-4 w-4" /> Add Sire / Ram</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-medium">{search ? "No sires match your search" : "No sires registered yet"}</p>
          {!search && <p className="text-sm mt-1">Add your bulls and rams — both on-site and hired in.</p>}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b border-border">
              <tr>
                {["Name", "Species", "Breed", "Tag / Passport", "Ownership", "BVD / Scrapie", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr key={s.id} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                  <td className="px-4 py-3 font-semibold text-foreground">{s.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.species}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.breed ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.tagNumber ?? "—"}{s.passportNumber ? ` / ${s.passportNumber}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.ownershipType === "owned" ? "bg-green-100 text-green-800"
                      : s.ownershipType === "hired_in" ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                    }`}>{ownershipLabel[s.ownershipType] ?? s.ownershipType}</span>
                    {(s.ownershipType === "hired_in" || s.ownershipType === "loaned") && s.hireStartDate && (
                      <p className="text-xs text-muted-foreground mt-0.5">From {s.hireStartDate}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {s.species === "Cattle" && s.bvdStatus ? s.bvdStatus : ""}
                    {s.species === "Sheep" && s.scrapieGenotype ? s.scrapieGenotype : ""}
                    {!s.bvdStatus && !s.scrapieGenotype ? "—" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); setForm(EMPTY_SIRE); createMut.reset(); updateMut.reset(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Sire / Ram" : "Add Sire / Ram"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Oakfield Commander" required /></div>
              <div><Label>Species *</Label>
                <Select value={form.species} onValueChange={v => setForm(f => ({ ...f, species: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Cattle", "Sheep", "Pig", "Goat", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Breed</Label><Input value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} placeholder={({ Cattle: "e.g. Aberdeen Angus", Sheep: "e.g. Suffolk", Pig: "e.g. Large White", Goat: "e.g. Boer" } as Record<string,string>)[form.species] ?? "e.g. enter breed"} /></div>
              <div><Label>Ear Tag Number</Label><Input value={form.tagNumber} onChange={e => setForm(f => ({ ...f, tagNumber: e.target.value }))} placeholder="e.g. UK141092 12345" /></div>
              <div><Label>Passport Number</Label><Input value={form.passportNumber} onChange={e => setForm(f => ({ ...f, passportNumber: e.target.value }))} placeholder="Cattle passport / flock no." /></div>
              <div><Label>Date of Birth</Label><Input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} /></div>
              <div><Label>Ownership *</Label>
                <Select value={form.ownershipType} onValueChange={v => setForm(f => ({ ...f, ownershipType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owned">Owned — permanently on farm</SelectItem>
                    <SelectItem value="hired_in">Hired In — brought on for a season</SelectItem>
                    <SelectItem value="loaned">Loaned — temporary loan from another farm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isHiredOrLoaned && (
                <>
                  <div className="col-span-2 border-t pt-3">
                    <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Hire / Loan Details</p>
                  </div>
                  <div><Label>Supplier / Owner Name</Label><Input value={form.supplierName} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} placeholder="Farm or stud name" /></div>
                  <div><Label>Supplier Contact</Label><Input value={form.supplierContact} onChange={e => setForm(f => ({ ...f, supplierContact: e.target.value }))} placeholder="Phone or email" /></div>
                  <div><Label>Arrived on Farm</Label><Input type="date" value={form.hireStartDate} onChange={e => setForm(f => ({ ...f, hireStartDate: e.target.value }))} /></div>
                  <div><Label>Expected Return Date</Label><Input type="date" value={form.hireEndDate} onChange={e => setForm(f => ({ ...f, hireEndDate: e.target.value }))} /></div>
                  <div><Label>Actual Return Date</Label><Input type="date" value={form.returnDate} onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))} /></div>
                </>
              )}

              <div className="col-span-2 border-t pt-3">
                <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Health Status</p>
              </div>
              {form.species === "Cattle" && (
                <div><Label>BVD Status</Label>
                  <Select value={form.bvdStatus || "__none__"} onValueChange={v => setForm(f => ({ ...f, bvdStatus: v === "__none__" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Not recorded —</SelectItem>
                      <SelectItem value="Tested Negative">Tested Negative</SelectItem>
                      <SelectItem value="Vaccinated">Vaccinated</SelectItem>
                      <SelectItem value="Not Tested">Not Tested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {form.species === "Sheep" && (
                <div><Label>Scrapie Genotype</Label><Input value={form.scrapieGenotype} onChange={e => setForm(f => ({ ...f, scrapieGenotype: e.target.value }))} placeholder="e.g. ARR/ARR" /></div>
              )}
              <div><Label>Fertility Test Date</Label><Input type="date" value={form.fertilityTestDate} onChange={e => setForm(f => ({ ...f, fertilityTestDate: e.target.value }))} /></div>
              <div><Label>Fertility Test Result</Label><Input value={form.fertilityTestResult} onChange={e => setForm(f => ({ ...f, fertilityTestResult: e.target.value }))} placeholder="e.g. Satisfactory" /></div>
              <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogMutationError mutation={createMut} message="Failed to save — your entries are still here." />
            <DialogMutationError mutation={updateMut} message="Failed to save — your entries are still here." />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm(EMPTY_SIRE); }}>Cancel</Button>
              <Button type="submit" disabled={saving || !form.name.trim()}>{saving ? <Loader2 className="animate-spin h-4 w-4" /> : editing ? "Save Changes" : "Add Sire"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {deleteId !== null && (
        <Dialog open onOpenChange={o => { if (!o) { setDeleteId(null); deleteMut.reset(); } }}>
          <DialogContent>
            <DialogHeader><DialogTitle>Remove Sire from Register?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">This will deactivate the sire record. Existing AI/reproduction records linked to this sire are unaffected.</p>
            <DialogMutationError mutation={deleteMut} message="Failed to remove — please try again." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteMut.mutate(deleteId!)} disabled={deleteMut.isPending}>
                {deleteMut.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Remove"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// ─── AI / Reproduction Section ─────────────────────────────────────────────────
