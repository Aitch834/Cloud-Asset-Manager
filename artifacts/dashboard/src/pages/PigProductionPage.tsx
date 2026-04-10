import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, PiggyBank, Truck, FileText, UtensilsCrossed, Stethoscope, ClipboardCheck, AlertTriangle, Baby, ShieldCheck } from "lucide-react";
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
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive" }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
// ─── Simple table ──────────────────────────────────────────────────────────────
function DataTable({ cols, rows, onEdit, onDelete }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void }) {
  const [pendingDelete, setPendingDelete] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet. Add one using the button above." />;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete) && <th />}</tr></thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
              {(onEdit || onDelete) && (
                <td className="py-2 text-right space-x-1">
                  {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
                  {onDelete && <Button size="icon" variant="ghost" onClick={() => setPendingDelete(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
                </td>
              )}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete Record"
        message="Are you sure you want to delete this record? This cannot be undone."
        onConfirm={() => { if (pendingDelete && onDelete) { onDelete(pendingDelete); } setPendingDelete(null); }}
        onCancel={() => setPendingDelete(null)}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
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
          onDelete={r => del.mutate(r.id as number)}
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
          onDelete={r => del.mutate(r.id as number)}
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
          onDelete={r => del.mutate(r.id as number)}
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
          onDelete={r => del.mutate(r.id as number)}
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
          onDelete={r => del.mutate(r.id as number)}
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
          onDelete={r => del.mutate(r.id as number)}
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

function TailBitingRisksTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["pig-tail-biting", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-tail-biting-risks`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/pig-tail-biting-risks/${editing.id}`) : api(`farms/${farmId}/pig-tail-biting-risks`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-tail-biting", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-tail-biting-risks/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-tail-biting", farmId] }) });
  const defaults = { tailLengthAdequate: true, stockingDensityOk: true, enrichmentProvided: true, feedingSystemOk: true, healthStatusOk: true, currentBiting: false, tailsDockedAtBirth: false };
  function openAdd() { setEditing(null); setForm({ ...defaults }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : v as string | boolean]))); setOpen(true); }
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Tail Biting Risk Assessments</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Red Tractor Pigs Standard — a written risk assessment is required. Review when risk factors change or biting is observed.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />New Assessment</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "assessmentDate", label: "Date", fmt: r => fmtDate(r.assessmentDate) },
            { key: "assessedBy", label: "Assessed By" },
            { key: "riskLevel", label: "Risk Level" },
            { key: "currentBiting", label: "Biting Active?", fmt: r => r.currentBiting ? "Yes" : "No" },
            { key: "interventionsTaken", label: "Interventions" },
            { key: "reviewDate", label: "Review Date", fmt: r => fmtDate(r.reviewDate) },
          ]}
          rows={records}
          onEdit={openEdit}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>Tail Biting Risk Assessment</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto pr-1">
            <div><Label>Assessment Date *</Label><Input type="date" value={String(form.assessmentDate ?? "")} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
            <div><Label>Assessed By *</Label><Input value={String(form.assessedBy ?? "")} onChange={e => setForm(f => ({ ...f, assessedBy: e.target.value }))} /></div>
            <div>
              <Label>Risk Level *</Label>
              <Select value={String(form.riskLevel ?? "")} onValueChange={v => setForm(f => ({ ...f, riskLevel: v }))}>
                <SelectTrigger><SelectValue placeholder="Select risk level" /></SelectTrigger>
                <SelectContent>{["Low", "Medium", "High"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Monitoring Frequency</Label>
              <Select value={String(form.monitoringFrequency ?? "")} onValueChange={v => setForm(f => ({ ...f, monitoringFrequency: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Daily", "Twice daily", "Every check", "Weekly"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Mixing Frequency</Label><Input value={String(form.mixingFrequency ?? "")} onChange={e => setForm(f => ({ ...f, mixingFrequency: e.target.value }))} placeholder="e.g. Rarely / at weaning only" /></div>
            <div><Label>Review Date</Label><Input type="date" value={String(form.reviewDate ?? "")} onChange={e => setForm(f => ({ ...f, reviewDate: e.target.value }))} /></div>
            <div className="col-span-2">
              <Label className="mb-2 block">Risk Factor Checks</Label>
              <div className="grid grid-cols-2 gap-2">
                {([["tailsDockedAtBirth", "Tails docked at birth"], ["tailLengthAdequate", "Tail length adequate"], ["stockingDensityOk", "Stocking density within limits"], ["enrichmentProvided", "Enrichment material provided"], ["feedingSystemOk", "Feeding system adequate"], ["healthStatusOk", "Good health status (no disease)"], ["currentBiting", "Tail biting currently observed"]] as [string, string][]).map(([k, l]) => (
                  <div key={k} className="flex items-center gap-2">
                    <Checkbox id={k} checked={Boolean(form[k])} onCheckedChange={v => setForm(f => ({ ...f, [k]: Boolean(v) }))} />
                    <Label htmlFor={k} className="text-xs">{l}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div><Label>Enrichment Types</Label><Input value={String(form.enrichmentTypes ?? "")} onChange={e => setForm(f => ({ ...f, enrichmentTypes: e.target.value }))} placeholder="e.g. Straw, chains, hanging rope" /></div>
            <div><Label>Biting Level (if active)</Label>
              <Select value={String(form.bitingLevel ?? "")} onValueChange={v => setForm(f => ({ ...f, bitingLevel: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Minor — superficial", "Moderate — bleeding", "Severe — significant wound"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Interventions Taken</Label><Textarea value={String(form.interventionsTaken ?? "")} onChange={e => setForm(f => ({ ...f, interventionsTaken: e.target.value }))} rows={2} placeholder="e.g. Separated bitten pigs, increased enrichment, reduced stocking density" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FarrowingRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["pig-farrowing", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-farrowing-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/pig-farrowing-records/${editing.id}`) : api(`farms/${farmId}/pig-farrowing-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-farrowing", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-farrowing-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-farrowing", farmId] }) });
  const defaults = { totalBornAlive: "0", totalBornDead: "0", totalMummified: "0", fostersIn: "0", fostersOut: "0", assistanceRequired: false, colostrumManaged: true };
  function openAdd() { setEditing(null); setForm({ ...defaults }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : v as string | boolean]))); setOpen(true); }
  const totalBorn = (r: Record<string, unknown>) => ((r.totalBornAlive as number || 0) + (r.totalBornDead as number || 0) + (r.totalMummified as number || 0));
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Farrowing &amp; Sow Records</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Required for breeding herds — litter performance, weaning data and sow assistance records.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Log Farrowing</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "farrowingDate", label: "Date", fmt: r => fmtDate(r.farrowingDate) },
            { key: "sowEarTag", label: "Sow Ear Tag" },
            { key: "parityNumber", label: "Parity" },
            { key: "totalBornAlive", label: "Born Alive" },
            { key: "totalBornDead", label: "Stillbirths" },
            { key: "pigletsWeanedCount", label: "Weaned" },
            { key: "weaningDate", label: "Weaning Date", fmt: r => fmtDate(r.weaningDate) },
          ]}
          rows={records}
          onEdit={openEdit}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>Farrowing Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto pr-1">
            <div><Label>Farrowing Date *</Label><Input type="date" value={String(form.farrowingDate ?? "")} onChange={e => setForm(f => ({ ...f, farrowingDate: e.target.value }))} /></div>
            <div><Label>Sow Ear Tag *</Label><Input value={String(form.sowEarTag ?? "")} onChange={e => setForm(f => ({ ...f, sowEarTag: e.target.value }))} placeholder="UK ear tag" /></div>
            <div><Label>Sow Breed</Label><Input value={String(form.sowBreed ?? "")} onChange={e => setForm(f => ({ ...f, sowBreed: e.target.value }))} placeholder="e.g. Large White" /></div>
            <div><Label>Parity Number</Label><Input type="number" value={String(form.parityNumber ?? "")} onChange={e => setForm(f => ({ ...f, parityNumber: e.target.value }))} placeholder="1 = gilt" /></div>
            <div>
              <Label>Farrowing Ease</Label>
              <Select value={String(form.farrowingEase ?? "")} onValueChange={v => setForm(f => ({ ...f, farrowingEase: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["1 — Unassisted", "2 — Minor assistance", "3 — Major assistance", "4 — Vet required"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 mt-5">
              <Checkbox id="assistanceRequired" checked={Boolean(form.assistanceRequired)} onCheckedChange={v => setForm(f => ({ ...f, assistanceRequired: Boolean(v) }))} />
              <Label htmlFor="assistanceRequired" className="text-xs">Assistance required?</Label>
            </div>
            <div><Label>Born Alive *</Label><Input type="number" value={String(form.totalBornAlive ?? "0")} onChange={e => setForm(f => ({ ...f, totalBornAlive: e.target.value }))} /></div>
            <div><Label>Born Dead (Stillbirths)</Label><Input type="number" value={String(form.totalBornDead ?? "0")} onChange={e => setForm(f => ({ ...f, totalBornDead: e.target.value }))} /></div>
            <div><Label>Mummified</Label><Input type="number" value={String(form.totalMummified ?? "0")} onChange={e => setForm(f => ({ ...f, totalMummified: e.target.value }))} /></div>
            <div><Label>Avg Birth Weight (kg)</Label><Input type="number" step="0.01" value={String(form.averageBirthWeightKg ?? "")} onChange={e => setForm(f => ({ ...f, averageBirthWeightKg: e.target.value }))} /></div>
            <div><Label>Fosters In</Label><Input type="number" value={String(form.fostersIn ?? "0")} onChange={e => setForm(f => ({ ...f, fostersIn: e.target.value }))} /></div>
            <div><Label>Fosters Out</Label><Input type="number" value={String(form.fostersOut ?? "0")} onChange={e => setForm(f => ({ ...f, fostersOut: e.target.value }))} /></div>
            <div><Label>Weaning Date</Label><Input type="date" value={String(form.weaningDate ?? "")} onChange={e => setForm(f => ({ ...f, weaningDate: e.target.value }))} /></div>
            <div><Label>Piglets Weaned</Label><Input type="number" value={String(form.pigletsWeanedCount ?? "")} onChange={e => setForm(f => ({ ...f, pigletsWeanedCount: e.target.value }))} /></div>
            <div><Label>Avg Weaning Weight (kg)</Label><Input type="number" step="0.01" value={String(form.averageWeaningWeightKg ?? "")} onChange={e => setForm(f => ({ ...f, averageWeaningWeightKg: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-5">
              <Checkbox id="colostrumManaged" checked={Boolean(form.colostrumManaged)} onCheckedChange={v => setForm(f => ({ ...f, colostrumManaged: Boolean(v) }))} />
              <Label htmlFor="colostrumManaged" className="text-xs">Colostrum management confirmed</Label>
            </div>
            <div className="col-span-3"><Label>Assistance Details</Label><Textarea value={String(form.assistanceDetails ?? "")} onChange={e => setForm(f => ({ ...f, assistanceDetails: e.target.value }))} rows={2} placeholder="Details of any vet or manual assistance" /></div>
            <div className="col-span-3"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PigRedTractorChecklistTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["pig-rt-checklist", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-red-tractor-checklists`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/pig-red-tractor-checklists/${editing.id}`) : api(`farms/${farmId}/pig-red-tractor-checklists`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-rt-checklist", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-red-tractor-checklists/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-rt-checklist", farmId] }) });

  const BoolField = ({ label, field }: { label: string; field: string }) => (
    <div className="flex items-center gap-2">
      <Checkbox id={field} checked={Boolean(form[field])} onCheckedChange={v => setForm(f => ({ ...f, [field]: Boolean(v) }))} />
      <Label htmlFor={field} className="text-sm">{label}</Label>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Red Tractor Pig Compliance Checklist</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record Red Tractor Pigs Standard self-assessment results. Each major standard area is checked to maintain farm assurance status. Assessments should be carried out at least annually or following any significant changes.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ assessmentDate: new Date().toISOString().slice(0, 10), overallStatus: "pass" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Assessment</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "assessmentDate", label: "Assessment Date", fmt: r => fmtDate(r.assessmentDate) },
          { key: "assessorName", label: "Assessor" },
          { key: "certificateNumber", label: "Certificate No." },
          { key: "overallStatus", label: "Overall Status" },
          { key: "nextAssessmentDue", label: "Next Due", fmt: r => fmtDate(r.nextAssessmentDue) },
          { key: "nonConformances", label: "Non-conformances" },
        ]}
        rows={records as Record<string, unknown>[]}
        onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
        onDelete={r => del.mutate(r.id as number)}
      />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "54rem" }}>
          <DialogHeader><DialogTitle>Red Tractor Pig Self-Assessment</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Assessment Date *</Label><Input type="date" value={String(form.assessmentDate ?? "")} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
            <div><Label>Assessor Name</Label><Input value={String(form.assessorName ?? "")} onChange={e => setForm(f => ({ ...f, assessorName: e.target.value }))} /></div>
            <div><Label>Certificate Number</Label><Input value={String(form.certificateNumber ?? "")} onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))} /></div>
            <div><Label>Overall Status</Label>
              <Select value={String(form.overallStatus ?? "pass")} onValueChange={v => setForm(f => ({ ...f, overallStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["pass", "conditional-pass", "fail", "pending"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Next Assessment Due</Label><Input type="date" value={String(form.nextAssessmentDue ?? "")} onChange={e => setForm(f => ({ ...f, nextAssessmentDue: e.target.value }))} /></div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3 mb-2">RT Pig Standard Compliance Items</p>
          <div className="grid grid-cols-2 gap-2">
            <BoolField label="Medicines & veterinary treatments recorded correctly" field="medicinesRecorded" />
            <BoolField label="Withdrawal periods observed (no residue failures)" field="withdrawalPeriodsObserved" />
            <BoolField label="Pig movements / eAML2 records up to date" field="movementsRecorded" />
            <BoolField label="Feed records maintained (source, batch, HACCP)" field="feedRecordsKept" />
            <BoolField label="Water supply quality checked / tested" field="waterQualityChecked" />
            <BoolField label="Identification / tagging correct for all pigs" field="identificationCorrect" />
            <BoolField label="Stockmanship daily checks evidenced" field="stockmanshipChecked" />
            <BoolField label="Body condition scored and recorded" field="bodyConditionScored" />
            <BoolField label="Tail biting risk assessment completed" field="tailBitingRiskAssessed" />
            <BoolField label="Tail docking justification documented (if applicable)" field="tailDockingJustified" />
            <BoolField label="Boar tusk trimming recorded (if applicable)" field="boarTuskTrimmed" />
            <BoolField label="Environmental enrichment provided" field="enrichmentProvided" />
            <BoolField label="Ventilation and thermal environment adequate" field="ventilationAdequate" />
            <BoolField label="Building / housing structural integrity checked" field="housingStructuralOk" />
            <BoolField label="Pest and vermin control records current" field="pestControlCurrent" />
            <BoolField label="Biosecurity protocols in place and enforced" field="biosecurityInPlace" />
            <BoolField label="Casualty / fallen stock disposal compliant" field="casualtyDisposalCompliant" />
            <BoolField label="Vet health plan reviewed within 12 months" field="vetHealthPlanReviewed" />
            <BoolField label="Emergency plan / out-of-hours contact available" field="emergencyPlanInPlace" />
            <BoolField label="Farm training / competence records maintained" field="trainingRecordsKept" />
          </div>
          <div className="grid grid-cols-1 gap-3 mt-2">
            <div><Label>Non-conformances / Observations</Label><Textarea value={String(form.nonConformances ?? "")} onChange={e => setForm(f => ({ ...f, nonConformances: e.target.value }))} rows={2} /></div>
            <div><Label>Corrective Actions Required</Label><Textarea value={String(form.correctiveActions ?? "")} onChange={e => setForm(f => ({ ...f, correctiveActions: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save Assessment</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
type Tab = "flocks" | "movements" | "fci" | "feed" | "vet" | "stockmanship" | "tail-biting" | "farrowing" | "red-tractor";

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
          <TabButton active={tab === "tail-biting"} onClick={() => setTab("tail-biting")}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Tail Biting Risk</TabButton>
          <TabButton active={tab === "farrowing"} onClick={() => setTab("farrowing")}><Baby className="w-3.5 h-3.5 mr-1" />Farrowing</TabButton>
          <TabButton active={tab === "red-tractor"} onClick={() => setTab("red-tractor")}><ShieldCheck className="w-3.5 h-3.5 mr-1" />Red Tractor</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "flocks" && <FlocksTab farmId={farmId} />}
          {tab === "movements" && <MovementsTab farmId={farmId} />}
          {tab === "fci" && <FciDocumentsTab farmId={farmId} />}
          {tab === "feed" && <FeedRecordsTab farmId={farmId} />}
          {tab === "vet" && <VetAssessmentsTab farmId={farmId} />}
          {tab === "stockmanship" && <StockmanshipChecksTab farmId={farmId} />}
          {tab === "tail-biting" && <TailBitingRisksTab farmId={farmId} />}
          {tab === "farrowing" && <FarrowingRecordsTab farmId={farmId} />}
          {tab === "red-tractor" && <PigRedTractorChecklistTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
