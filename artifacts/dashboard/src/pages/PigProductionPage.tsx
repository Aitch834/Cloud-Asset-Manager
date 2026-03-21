import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, PiggyBank, Truck, FileText, UtensilsCrossed, Stethoscope, ClipboardCheck } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { Redirect } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");

// ─── Shared empty-state ────────────────────────────────────────────────────────
function Empty({ msg }: { msg: string }) {
  return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>;
}

// ─── Simple table ──────────────────────────────────────────────────────────────
function DataTable({ cols, rows, onEdit, onDelete }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void }) {
  if (!rows.length) return <Empty msg="No records yet. Add one using the button above." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete) && <th />}</tr></thead>
        <tbody>{rows.map((row, i) => (
          <tr key={i} className="border-b last:border-0">
            {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
            {(onEdit || onDelete) && (
              <td className="py-2 text-right space-x-1">
                {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
                {onDelete && <Button size="icon" variant="ghost" onClick={() => onDelete(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
              </td>
            )}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ─── FLOCKS TAB ────────────────────────────────────────────────────────────────
function FlocksTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: flocks = [], isLoading } = useQuery({ queryKey: ["pig-flocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-flocks`), { credentials: "include" }).then(r => r.json()) });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/pig-flocks/${editing.id}`) : api(`farms/${farmId}/pig-flocks`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-flocks", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-flocks/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-flocks", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({}); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Pig Flocks / Production Groups</h3>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Flock</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "flockName", label: "Name" }, { key: "productionType", label: "Type" }, { key: "breed", label: "Breed" },
            { key: "herdNumber", label: "Herd No." }, { key: "currentCount", label: "Head Count" }, { key: "location", label: "Location" },
          ]}
          rows={flocks}
          onEdit={openEdit}
          onDelete={r => { if (confirm("Delete this flock?")) del.mutate(r.id as number); }}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Flock" : "Add Pig Flock"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[["flockName", "Flock Name *"], ["productionType", "Production Type *"], ["breed", "Breed"], ["cphNumber", "CPH Number"], ["herdNumber", "Herd Number"], ["currentCount", "Current Count"], ["location", "Location"]].map(([k, l]) => (
              <div key={k} className={k === "flockName" || k === "location" ? "col-span-2" : ""}>
                <Label>{l}</Label>
                {k === "productionType" ? (
                  <Select value={form[k] ?? ""} onValueChange={v => setForm(f => ({ ...f, [k]: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>{["Breeding Sow Herd", "Weaner Production", "Grower-Finisher", "Boar Stud", "Outdoor Free-Range", "Conventional Indoor"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input value={form[k] ?? ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                )}
              </div>
            ))}
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── MOVEMENTS TAB ─────────────────────────────────────────────────────────────
function MovementsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: movements = [], isLoading } = useQuery({ queryKey: ["pig-movements", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-movements`), { credentials: "include" }).then(r => r.json()) });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/pig-movements/${editing.id}`) : api(`farms/${farmId}/pig-movements`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-movements", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-movements/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-movements", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({}); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Pig Movements (eAML2)</h3>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Log Movement</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "movementDate", label: "Date", fmt: r => fmtDate(r.movementDate) }, { key: "movementType", label: "Type" },
            { key: "fromLocation", label: "From" }, { key: "toLocation", label: "To" },
            { key: "numberOfAnimals", label: "Animals" }, { key: "eaml2Reference", label: "eAML2 Ref" },
          ]}
          rows={movements}
          onEdit={openEdit}
          onDelete={r => { if (confirm("Delete this movement?")) del.mutate(r.id as number); }}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Movement" : "Log Pig Movement"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Movement Date *</Label><Input type="date" value={form.movementDate ?? ""} onChange={e => setForm(f => ({ ...f, movementDate: e.target.value }))} /></div>
            <div><Label>Movement Type *</Label>
              <Select value={form.movementType ?? ""} onValueChange={v => setForm(f => ({ ...f, movementType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["On Farm", "Off Farm — Market", "Off Farm — Slaughter", "Off Farm — Dealer", "Internal Movement", "Out to Agistment"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {[["fromLocation", "From Location *"], ["fromCph", "From CPH"], ["toLocation", "To Location *"], ["toCph", "To CPH"], ["numberOfAnimals", "Number of Animals *"], ["eaml2Reference", "eAML2 Reference"], ["transporterName", "Transporter Name"], ["vehicleRegistration", "Vehicle Reg."]].map(([k, l]) => (
              <div key={k}><Label>{l}</Label><Input value={form[k] ?? ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
            ))}
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── FCI DOCUMENTS TAB ─────────────────────────────────────────────────────────
function FciDocumentsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});

  const { data: docs = [], isLoading } = useQuery({ queryKey: ["pig-fci", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-fci-documents`), { credentials: "include" }).then(r => r.json()) });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/pig-fci-documents/${editing.id}`) : api(`farms/${farmId}/pig-fci-documents`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-fci", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-fci-documents/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-fci", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ withdrawalPeriodClear: true, signedByFarmer: true }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : v as string | boolean]))); setOpen(true); }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Food Chain Information (FCI) Documents</h3>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add FCI Doc</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "documentDate", label: "Date", fmt: r => fmtDate(r.documentDate) }, { key: "batchReference", label: "Batch Ref" },
            { key: "destinationAbattoir", label: "Abattoir" }, { key: "numberOfPigs", label: "Pigs" },
            { key: "withdrawalPeriodClear", label: "Withdrawal Clear", fmt: r => r.withdrawalPeriodClear ? "Yes" : "No" },
            { key: "signedByFarmer", label: "Signed", fmt: r => r.signedByFarmer ? "Yes" : "No" },
          ]}
          rows={docs}
          onEdit={openEdit}
          onDelete={r => { if (confirm("Delete this FCI document?")) del.mutate(r.id as number); }}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>FCI Document</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Document Date *</Label><Input type="date" value={String(form.documentDate ?? "")} onChange={e => setForm(f => ({ ...f, documentDate: e.target.value }))} /></div>
            <div><Label>Batch Reference</Label><Input value={String(form.batchReference ?? "")} onChange={e => setForm(f => ({ ...f, batchReference: e.target.value }))} /></div>
            <div><Label>Destination Abattoir</Label><Input value={String(form.destinationAbattoir ?? "")} onChange={e => setForm(f => ({ ...f, destinationAbattoir: e.target.value }))} /></div>
            <div><Label>Number of Pigs *</Label><Input type="number" value={String(form.numberOfPigs ?? "")} onChange={e => setForm(f => ({ ...f, numberOfPigs: e.target.value }))} /></div>
            <div><Label>Feed Withdrawal (hours)</Label><Input type="number" value={String(form.feedWithdrawalHours ?? "")} onChange={e => setForm(f => ({ ...f, feedWithdrawalHours: e.target.value }))} /></div>
            <div><Label>Lameness / Casualty Status</Label><Input value={String(form.lambnessCasualtyStatus ?? "")} onChange={e => setForm(f => ({ ...f, lambnessCasualtyStatus: e.target.value }))} /></div>
            <div className="col-span-2 space-y-2">
              {([["veterinaryMedicinesLast60Days", "Veterinary medicines administered in last 60 days?"], ["withdrawalPeriodClear", "Withdrawal period clear?"], ["signedByFarmer", "Signed by farmer?"]] as [string, string][]).map(([k, l]) => (
                <div key={k} className="flex items-center gap-2">
                  <Checkbox id={k} checked={Boolean(form[k])} onCheckedChange={v => setForm(f => ({ ...f, [k]: Boolean(v) }))} />
                  <Label htmlFor={k}>{l}</Label>
                </div>
              ))}
            </div>
            <div className="col-span-2"><Label>Medicine Details (if applicable)</Label><Textarea value={String(form.medicineDetails ?? "")} onChange={e => setForm(f => ({ ...f, medicineDetails: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── FEED RECORDS TAB ──────────────────────────────────────────────────────────
function FeedRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: records = [], isLoading } = useQuery({ queryKey: ["pig-feed", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-feed-records`), { credentials: "include" }).then(r => r.json()) });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/pig-feed-records/${editing.id}`) : api(`farms/${farmId}/pig-feed-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-feed", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-feed-records/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-feed", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({}); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Feed Delivery Records</h3>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Delivery</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "deliveryDate", label: "Date", fmt: r => fmtDate(r.deliveryDate) }, { key: "supplierName", label: "Supplier" },
            { key: "feedType", label: "Feed Type" }, { key: "compoundFeedName", label: "Compound Name" },
            { key: "quantityTonnes", label: "Qty (t)" }, { key: "batchLotNumber", label: "Batch/Lot No." },
          ]}
          rows={records}
          onEdit={openEdit}
          onDelete={r => { if (confirm("Delete this record?")) del.mutate(r.id as number); }}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>Feed Delivery Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Delivery Date *</Label><Input type="date" value={form.deliveryDate ?? ""} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} /></div>
            <div><Label>Supplier Name *</Label><Input value={form.supplierName ?? ""} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} /></div>
            <div><Label>Supplier Approval No.</Label><Input value={form.supplierApprovalNumber ?? ""} onChange={e => setForm(f => ({ ...f, supplierApprovalNumber: e.target.value }))} /></div>
            <div><Label>Feed Type *</Label>
              <Select value={form.feedType ?? ""} onValueChange={v => setForm(f => ({ ...f, feedType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Compound Feed", "Straights", "Home Mix", "Liquid Feed", "Creep Feed", "Supplement"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Compound Feed Name</Label><Input value={form.compoundFeedName ?? ""} onChange={e => setForm(f => ({ ...f, compoundFeedName: e.target.value }))} /></div>
            <div><Label>Quantity (tonnes) *</Label><Input type="number" step="0.1" value={form.quantityTonnes ?? ""} onChange={e => setForm(f => ({ ...f, quantityTonnes: e.target.value }))} /></div>
            <div><Label>Batch/Lot Number</Label><Input value={form.batchLotNumber ?? ""} onChange={e => setForm(f => ({ ...f, batchLotNumber: e.target.value }))} /></div>
            <div><Label>Delivery Note No.</Label><Input value={form.deliveryNoteNumber ?? ""} onChange={e => setForm(f => ({ ...f, deliveryNoteNumber: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── VET ASSESSMENTS TAB ───────────────────────────────────────────────────────
function VetAssessmentsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: assessments = [], isLoading } = useQuery({ queryKey: ["pig-vet", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-vet-assessments`), { credentials: "include" }).then(r => r.json()) });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/pig-vet-assessments/${editing.id}`) : api(`farms/${farmId}/pig-vet-assessments`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-vet", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-vet-assessments/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-vet", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({}); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Veterinary Assessments & Health Plans</h3>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Assessment</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "assessmentDate", label: "Date", fmt: r => fmtDate(r.assessmentDate) }, { key: "vetName", label: "Vet" },
            { key: "practiceName", label: "Practice" }, { key: "lameness", label: "Lameness" },
            { key: "respiratoryHealth", label: "Respiratory" }, { key: "nextReviewDate", label: "Next Review", fmt: r => fmtDate(r.nextReviewDate) },
          ]}
          rows={assessments}
          onEdit={openEdit}
          onDelete={r => { if (confirm("Delete this assessment?")) del.mutate(r.id as number); }}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Vet Assessment</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Assessment Date *</Label><Input type="date" value={form.assessmentDate ?? ""} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
            <div><Label>Vet Name *</Label><Input value={form.vetName ?? ""} onChange={e => setForm(f => ({ ...f, vetName: e.target.value }))} /></div>
            <div><Label>Practice Name</Label><Input value={form.practiceName ?? ""} onChange={e => setForm(f => ({ ...f, practiceName: e.target.value }))} /></div>
            <div><Label>Mortality Rate (%)</Label><Input type="number" step="0.01" value={form.mortalityRate ?? ""} onChange={e => setForm(f => ({ ...f, mortalityRate: e.target.value }))} /></div>
            {[["lameness", "Lameness Assessment"], ["respiratoryHealth", "Respiratory Health"], ["skinCondition", "Skin Condition"], ["tailBiting", "Tail Biting"]].map(([k, l]) => (
              <div key={k}>
                <Label>{l}</Label>
                <Select value={form[k] ?? ""} onValueChange={v => setForm(f => ({ ...f, [k]: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{["None observed", "Low", "Moderate", "High", "Requires action"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
            <div><Label>Next Review Date</Label><Input type="date" value={form.nextReviewDate ?? ""} onChange={e => setForm(f => ({ ...f, nextReviewDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Findings</Label><Textarea value={form.findings ?? ""} onChange={e => setForm(f => ({ ...f, findings: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label>Recommendations</Label><Textarea value={form.recommendations ?? ""} onChange={e => setForm(f => ({ ...f, recommendations: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── STOCKMANSHIP CHECKS TAB ───────────────────────────────────────────────────
function StockmanshipChecksTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});

  const { data: checks = [], isLoading } = useQuery({ queryKey: ["pig-stockmanship", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-stockmanship-checks`), { credentials: "include" }).then(r => r.json()) });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/pig-stockmanship-checks/${editing.id}`) : api(`farms/${farmId}/pig-stockmanship-checks`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-stockmanship", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-stockmanship-checks/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-stockmanship", farmId] }),
  });

  const defaults = { waterSystemOk: true, feedSystemOk: true, ventilationOk: true, temperatureOk: true, lightingOk: true, beddingOk: true };
  function openAdd() { setEditing(null); setForm({ ...defaults }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : v as string | boolean]))); setOpen(true); }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Daily Stockmanship Checks</h3>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Log Check</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "checkDate", label: "Date", fmt: r => fmtDate(r.checkDate) }, { key: "checkedBy", label: "Checked By" },
            { key: "mortalitiesFound", label: "Mortalities" }, { key: "injuredFound", label: "Injured" },
            { key: "overallWelfare", label: "Welfare Status" }, { key: "actionsRequired", label: "Actions Required" },
          ]}
          rows={checks}
          onEdit={openEdit}
          onDelete={r => { if (confirm("Delete this check?")) del.mutate(r.id as number); }}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>Stockmanship Check</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Check Date *</Label><Input type="date" value={String(form.checkDate ?? "")} onChange={e => setForm(f => ({ ...f, checkDate: e.target.value }))} /></div>
            <div><Label>Checked By *</Label><Input value={String(form.checkedBy ?? "")} onChange={e => setForm(f => ({ ...f, checkedBy: e.target.value }))} /></div>
            <div><Label>Mortalities Found</Label><Input type="number" value={String(form.mortalitiesFound ?? "0")} onChange={e => setForm(f => ({ ...f, mortalitiesFound: e.target.value }))} /></div>
            <div><Label>Injured Found</Label><Input type="number" value={String(form.injuredFound ?? "0")} onChange={e => setForm(f => ({ ...f, injuredFound: e.target.value }))} /></div>
            <div><Label>Overall Welfare</Label>
              <Select value={String(form.overallWelfare ?? "")} onValueChange={v => setForm(f => ({ ...f, overallWelfare: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Excellent", "Good", "Satisfactory", "Requires Attention", "Urgent Action Needed"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="mb-2 block">System Checks</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["waterSystemOk", "feedSystemOk", "ventilationOk", "temperatureOk", "lightingOk", "beddingOk"] as const).map(k => (
                  <div key={k} className="flex items-center gap-2">
                    <Checkbox id={k} checked={Boolean(form[k])} onCheckedChange={v => setForm(f => ({ ...f, [k]: Boolean(v) }))} />
                    <Label htmlFor={k} className="text-xs">{k.replace(/Ok$/, "").replace(/([A-Z])/g, " $1").trim()} OK</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="col-span-2"><Label>Actions Required</Label><Textarea value={String(form.actionsRequired ?? "")} onChange={e => setForm(f => ({ ...f, actionsRequired: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
type Tab = "flocks" | "movements" | "fci" | "feed" | "vet" | "stockmanship";

export default function PigProductionPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("flocks");
  if (!farmId) return <Redirect to="/" />;
  return (
    <AppLayout title="Pig Production">
      <div className="space-y-4">
        <TabBar>
          <TabButton active={tab === "flocks"} onClick={() => setTab("flocks")}><PiggyBank className="w-3.5 h-3.5 mr-1" />Flocks</TabButton>
          <TabButton active={tab === "movements"} onClick={() => setTab("movements")}><Truck className="w-3.5 h-3.5 mr-1" />Movements</TabButton>
          <TabButton active={tab === "fci"} onClick={() => setTab("fci")}><FileText className="w-3.5 h-3.5 mr-1" />FCI Documents</TabButton>
          <TabButton active={tab === "feed"} onClick={() => setTab("feed")}><UtensilsCrossed className="w-3.5 h-3.5 mr-1" />Feed Records</TabButton>
          <TabButton active={tab === "vet"} onClick={() => setTab("vet")}><Stethoscope className="w-3.5 h-3.5 mr-1" />Vet Assessments</TabButton>
          <TabButton active={tab === "stockmanship"} onClick={() => setTab("stockmanship")}><ClipboardCheck className="w-3.5 h-3.5 mr-1" />Stockmanship</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "flocks" && <FlocksTab farmId={farmId} />}
          {tab === "movements" && <MovementsTab farmId={farmId} />}
          {tab === "fci" && <FciDocumentsTab farmId={farmId} />}
          {tab === "feed" && <FeedRecordsTab farmId={farmId} />}
          {tab === "vet" && <VetAssessmentsTab farmId={farmId} />}
          {tab === "stockmanship" && <StockmanshipChecksTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
