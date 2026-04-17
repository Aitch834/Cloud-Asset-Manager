import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, PiggyBank, Truck, FileText, UtensilsCrossed, Stethoscope, ClipboardCheck, AlertTriangle, Baby, ShieldCheck, Pill, CheckCircle2, Clock, MapPin, LayoutDashboard, XCircle, TrendingUp, Scale, FileDown } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

// ─── PIG FEED DELIVERIES VIEW (from master Feed Management) ───────────────────
function PigFeedDeliveriesView({ farmId }: { farmId: number }) {
  const { data: raw, isLoading } = useQuery({
    queryKey: ["pig-deliveries-view", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/feed-deliveries`), { credentials: "include" }).then(r => r.json()),
  });
  const all: Record<string, unknown>[] = Array.isArray(raw) ? raw : (raw?.records ?? []);
  const pigDeliveries = all.filter(d => {
    const sp = String(d.speciesIntended ?? "").toLowerCase();
    return sp === "pigs" || sp === "mixed";
  }).sort((a, b) => String(b.deliveryDate ?? "").localeCompare(String(a.deliveryDate ?? "")));

  if (isLoading) return <Loader2 className="animate-spin w-5 h-5" />;
  if (pigDeliveries.length === 0) return (
    <Empty msg='No pig or mixed-species feed deliveries on record. Log a delivery in Feed Management with species set to "Pigs" or "Mixed".' />
  );
  return (
    <div className="space-y-2">
      {pigDeliveries.map((r, i) => (
        <div key={i} className="border rounded-lg p-3 bg-white">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="font-medium text-sm">{fmt(r.supplierName)}</span>
                {String(r.speciesIntended ?? "").toLowerCase() === "mixed" && (
                  <Badge className="text-xs" style={{ background: "#fef9c3", color: "#854d0e", border: "none" }}>Mixed species</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                <span><span className="font-medium text-foreground/70">Date:</span> {fmtDate(r.deliveryDate)}</span>
                <span><span className="font-medium text-foreground/70">Type:</span> {fmt(r.feedType)}</span>
                <span><span className="font-medium text-foreground/70">Qty:</span> {fmt(r.quantityKg)} kg</span>
                {!!r.productName && <span><span className="font-medium text-foreground/70">Product:</span> {fmt(r.productName)}</span>}
                {!!r.batchNumber && <span><span className="font-medium text-foreground/70">Batch:</span> {fmt(r.batchNumber)}</span>}
                {!!r.deliveryNoteNumber && <span><span className="font-medium text-foreground/70">Note No.:</span> {fmt(r.deliveryNoteNumber)}</span>}
                {!!r.ufasNumberOnNote && <span><span className="font-medium text-foreground/70">UFAS No.:</span> {fmt(r.ufasNumberOnNote)}</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── PIG PEN CONSUMPTION RECORDS ──────────────────────────────────────────────
function PigPenConsumptionView({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: rawRows, isLoading } = useQuery({
    queryKey: ["pig-feed-consumption", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/pig-feed-consumption`), { credentials: "include" }).then(r => r.json()),
  });
  const rows: Record<string, unknown>[] = Array.isArray(rawRows) ? rawRows : (rawRows?.records ?? rawRows ?? []);
  const sorted = [...rows].sort((a, b) => String(b.consumptionDate ?? "").localeCompare(String(a.consumptionDate ?? "")));

  const { data: flocksRaw } = useQuery({
    queryKey: ["pig-flocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/pig-flocks`), { credentials: "include" }).then(r => r.json()),
  });
  const flocks: Record<string, unknown>[] = Array.isArray(flocksRaw) ? flocksRaw : (flocksRaw?.records ?? flocksRaw ?? []);

  const { data: locsRaw } = useQuery({
    queryKey: ["farm-locations", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/farm-locations`), { credentials: "include" }).then(r => r.json()),
  });
  const allLocations: Record<string, unknown>[] = Array.isArray(locsRaw) ? locsRaw : [];
  const activeLocations = allLocations.filter(l => l.isActive !== false);

  const { data: delivRaw } = useQuery({
    queryKey: ["feed-deliveries", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/feed-deliveries`), { credentials: "include" }).then(r => r.json()),
  });
  const deliveries: Record<string, unknown>[] = Array.isArray(delivRaw) ? delivRaw : (delivRaw?.records ?? []);
  const pigDeliveries = deliveries.filter(d => { const sp = String(d.speciesIntended ?? "").toLowerCase(); return sp === "pigs" || sp === "mixed"; });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/pig-feed-consumption/${editing.id}`) : api(`farms/${farmId}/pig-feed-consumption`);
      const payload = { ...body };
      if (payload.appliedToFlockId === "" || payload.appliedToFlockId === "__none__") payload.appliedToFlockId = null;
      else if (payload.appliedToFlockId) payload.appliedToFlockId = Number(payload.appliedToFlockId);
      if (payload.locationId === "" || payload.locationId === "__none__") payload.locationId = null;
      else if (payload.locationId) payload.locationId = Number(payload.locationId);
      if (payload.linkedDeliveryId === "" || payload.linkedDeliveryId === "__none__") payload.linkedDeliveryId = null;
      else if (payload.linkedDeliveryId) payload.linkedDeliveryId = Number(payload.linkedDeliveryId);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-feed-consumption", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-feed-consumption/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-feed-consumption", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({}); setOpen(true); }
  function openEdit(r: Record<string, unknown>) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-green-100 bg-green-50 flex items-start gap-2">
        <UtensilsCrossed className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
        <p className="text-xs text-green-800">Record feed quantity per <strong>flock/batch</strong> and <strong>location</strong> each day. Locations are drawn from your central Farm Locations list — add any sheds or outdoor areas there to keep all records consistent.</p>
      </div>
      {activeLocations.length === 0 && (
        <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">No farm locations are set up yet. Go to <strong>Farm Locations</strong> in the sidebar and add your pig sheds, farrowing houses, and outdoor areas before recording feed consumption.</p>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Pen Feeding Records</h3>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : sorted.length === 0 ? (
        <Empty msg="No feeding records yet. Add your pig sheds to Farm Locations, then record daily feed consumption per flock and location." />
      ) : (
        <div className="space-y-2">
          {sorted.map((r, i) => (
            <div key={i} className="border rounded-lg p-3 bg-white">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">{!!r.flockName ? fmt(r.flockName) : "Unknown flock"}</span>
                    {!!r.locationName && (
                      <Badge className="text-xs" style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                        <MapPin className="w-3 h-3 inline mr-0.5" />{fmt(r.locationName)}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span><span className="font-medium text-foreground/70">Date:</span> {fmtDate(r.consumptionDate)}</span>
                    <span><span className="font-medium text-foreground/70">Type:</span> {fmt(r.feedType)}</span>
                    <span><span className="font-medium text-foreground/70">Qty:</span> {fmt(r.quantityKg)} kg</span>
                    {!!r.batchLotNumber && <span><span className="font-medium text-foreground/70">Batch:</span> {fmt(r.batchLotNumber)}</span>}
                    {!!r.linkedDeliveryId && <span><span className="font-medium text-foreground/70">Linked delivery #:</span> {fmt(r.linkedDeliveryId)}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del.mutate(r.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Feeding Record" : "Add Feeding Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date *</Label><Input type="date" value={form.consumptionDate ?? ""} onChange={e => setForm(f => ({ ...f, consumptionDate: e.target.value }))} /></div>
            <div><Label>Flock / Batch *</Label>
              <Select value={form.appliedToFlockId ?? "__none__"} onValueChange={v => setForm(f => ({ ...f, appliedToFlockId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select flock" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select flock —</SelectItem>
                  {flocks.map((fl: Record<string, unknown>) => (
                    <SelectItem key={String(fl.id)} value={String(fl.id)}>
                      {fmt(fl.flockName)}{fl.productionType ? ` (${fl.productionType})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Location / Shed</Label>
              <Select value={form.locationId ?? "__none__"} onValueChange={v => setForm(f => ({ ...f, locationId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select location —</SelectItem>
                  {activeLocations.map((l: Record<string, unknown>) => (
                    <SelectItem key={String(l.id)} value={String(l.id)}>{fmt(l.name)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeLocations.length === 0 && <p className="text-xs text-amber-600 mt-1">Add pig buildings to <strong>Farm Locations</strong> first.</p>}
            </div>
            <div><Label>Feed Type *</Label>
              <Select value={form.feedType ?? "__none__"} onValueChange={v => setForm(f => ({ ...f, feedType: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select —</SelectItem>
                  {["Compound Feed", "Straights", "Home Mix", "Liquid Feed", "Creep Feed", "Supplement"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Quantity (kg) *</Label><Input type="number" step="0.5" value={form.quantityKg ?? ""} onChange={e => setForm(f => ({ ...f, quantityKg: e.target.value }))} /></div>
            <div><Label>Batch/Lot No. (traceability)</Label><Input placeholder="From delivery label" value={form.batchLotNumber ?? ""} onChange={e => setForm(f => ({ ...f, batchLotNumber: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Linked Delivery (optional)</Label>
              <Select value={form.linkedDeliveryId ?? "__none__"} onValueChange={v => {
                if (v === "__none__") { setForm(f => ({ ...f, linkedDeliveryId: "" })); return; }
                const d = pigDeliveries.find(x => String(x.id) === v);
                setForm(f => ({ ...f, linkedDeliveryId: v, batchLotNumber: d?.batchNumber ? String(d.batchNumber) : f.batchLotNumber }));
              }}>
                <SelectTrigger><SelectValue placeholder="Link to a feed delivery for traceability" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {pigDeliveries.map((d: Record<string, unknown>) => (
                    <SelectItem key={String(d.id)} value={String(d.id)}>
                      {fmtDate(d.deliveryDate)} — {fmt(d.supplierName)} {d.batchNumber ? `(Batch: ${d.batchNumber})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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

// ─── FEED RECORDS TAB ──────────────────────────────────────────────────────────
function FeedRecordsTab({ farmId }: { farmId: number }) {
  const [subTab, setSubTab] = useState<"deliveries" | "consumption">("deliveries");
  return (
    <div className="space-y-4">
      <div className="flex gap-0 border-b">
        {(["deliveries", "consumption"] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${subTab === t ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "deliveries" ? "Feed Deliveries" : "Pen Consumption Records"}
          </button>
        ))}
      </div>
      {subTab === "deliveries" ? (
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-blue-100 bg-blue-50 flex items-start gap-2">
            <Truck className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800">
              Showing all feed deliveries from <strong>Feed Management</strong> where species is set to <em>Pigs</em> or <em>Mixed</em>. To add a delivery, go to Feed Management → Delivery Records.
            </p>
          </div>
          <PigFeedDeliveriesView farmId={farmId} />
        </div>
      ) : (
        <PigPenConsumptionView farmId={farmId} />
      )}
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

// ─── MEDICINE REGISTER TAB ─────────────────────────────────────────────────────
const ROUTES = ["Injection", "Oral (individual)", "In-water medication", "In-feed medication", "Topical / pour-on", "Other"];
const UNITS = ["ml", "g", "kg", "L", "tablets", "sachets", "other"];

function WithdrawalBadge({ endDate }: { endDate: string | null | undefined }) {
  if (!endDate) return null;
  const today = new Date();
  const end = new Date(endDate);
  const inWithdrawal = end > today;
  if (inWithdrawal) {
    return <Badge className="text-xs" style={{ background: "#fee2e2", color: "#991b1b", border: "none" }}><Clock className="w-3 h-3 mr-1" />In Withdrawal until {fmtDate(endDate)}</Badge>;
  }
  return <Badge className="text-xs" style={{ background: "#dcfce7", color: "#166534", border: "none" }}><CheckCircle2 className="w-3 h-3 mr-1" />Withdrawal Clear</Badge>;
}

function MedicineRegisterTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);

  const { data: treatments = [], isLoading } = useQuery({
    queryKey: ["pig-medicine-treatments", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/pig-medicine-treatments`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []),
  });
  const { data: flocks = [] } = useQuery({
    queryKey: ["pig-flocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/pig-flocks`), { credentials: "include" }).then(r => r.json()),
  });
  const flockMap = new Map((flocks as Record<string, unknown>[]).map(f => [String(f.id), String(f.flockName)]));

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/pig-medicine-treatments/${editing.id}`) : api(`farms/${farmId}/pig-medicine-treatments`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-medicine-treatments", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-medicine-treatments/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-medicine-treatments", farmId] }),
  });

  const EMPTY_FORM: Record<string, string | boolean> = {
    treatmentDate: new Date().toISOString().substring(0, 10),
    flockId: "",
    batchOrPenRef: "",
    numberOfAnimals: "",
    medicineProductName: "",
    activeIngredient: "",
    manufacturer: "",
    productBatchNumber: "",
    expiryDate: "",
    administrationRoute: "Injection",
    quantityUsed: "",
    unitOfMeasure: "ml",
    diagnosisReason: "",
    prescribingVetName: "",
    prescribingVetPractice: "",
    prescriptionObtained: false,
    administeredBy: "",
    withdrawalPeriodMeatDays: "",
    notes: "",
  };

  function openAdd() { setEditing(null); setForm({ ...EMPTY_FORM }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) {
    setEditing(r);
    setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : (typeof v === "boolean" ? v : String(v))])));
    setOpen(true);
  }

  const sorted = [...(treatments as Record<string, unknown>[])].sort((a, b) => String(b.treatmentDate ?? "").localeCompare(String(a.treatmentDate ?? "")));
  const activeWithdrawals = sorted.filter(r => r.withdrawalEndDate && new Date(r.withdrawalEndDate as string) > new Date());

  return (
    <div className="space-y-4">
      {activeWithdrawals.length > 0 && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800">{activeWithdrawals.length} active withdrawal period{activeWithdrawals.length > 1 ? "s" : ""}</p>
            <p className="text-xs text-red-600 mt-0.5">Do not send these animals for slaughter until withdrawal period has expired.</p>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Medicine Register — Batch / Group Level</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Records required under Veterinary Medicines Regulations 2013. Retain for minimum 5 years.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Treatment</Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : sorted.length === 0 ? (
        <Empty msg="No medicine treatments recorded yet. Log batch treatments using the button above." />
      ) : (
        <div className="space-y-2">
          {sorted.map((r, i) => (
            <div key={i} className="border rounded-lg p-3 bg-white hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">{fmt(r.medicineProductName)}</span>
                    {!!r.withdrawalEndDate && <WithdrawalBadge endDate={r.withdrawalEndDate as string} />}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span><span className="font-medium text-foreground/70">Date:</span> {fmtDate(r.treatmentDate)}</span>
                    <span><span className="font-medium text-foreground/70">Animals:</span> {fmt(r.numberOfAnimals)}</span>
                    <span><span className="font-medium text-foreground/70">Route:</span> {fmt(r.administrationRoute)}</span>
                    <span><span className="font-medium text-foreground/70">Qty:</span> {fmt(r.quantityUsed)}{r.unitOfMeasure ? ` ${String(r.unitOfMeasure)}` : ""}</span>
                    {!!r.flockId && <span><span className="font-medium text-foreground/70">Flock:</span> {flockMap.get(String(r.flockId)) ?? fmt(r.flockId)}</span>}
                    {!!r.batchOrPenRef && <span><span className="font-medium text-foreground/70">Batch/Pen:</span> {fmt(r.batchOrPenRef)}</span>}
                    {!!r.diagnosisReason && <span className="col-span-2"><span className="font-medium text-foreground/70">Reason:</span> {fmt(r.diagnosisReason)}</span>}
                    {!!r.prescribingVetName && <span><span className="font-medium text-foreground/70">Vet:</span> {fmt(r.prescribingVetName)}</span>}
                    {!!r.productBatchNumber && <span><span className="font-medium text-foreground/70">Batch No.:</span> {fmt(r.productBatchNumber)}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => setViewRecord(r)}><FileText className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del.mutate(r.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={v => !v && setOpen(false)}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Treatment Record" : "Record Medicine Treatment"}</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <p className="text-xs text-muted-foreground bg-blue-50 border border-blue-100 rounded p-2">
              <strong>Batch/group level recording</strong> — record which pen, batch, or production group was treated. No individual ear tags required for pigs.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">Treatment Date *</Label><Input type="date" value={String(form.treatmentDate ?? "")} onChange={e => setForm(f => ({ ...f, treatmentDate: e.target.value }))} /></div>
              <div><Label className="text-xs mb-1 block">Number of Animals Treated *</Label><Input type="number" min="1" value={String(form.numberOfAnimals ?? "")} onChange={e => setForm(f => ({ ...f, numberOfAnimals: e.target.value }))} placeholder="e.g. 12" /></div>
              <div>
                <Label className="text-xs mb-1 block">Production Group / Flock</Label>
                <Select value={String(form.flockId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, flockId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select flock" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Not specified —</SelectItem>
                    {(flocks as Record<string, unknown>[]).map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs mb-1 block">Batch / Pen Reference</Label><Input value={String(form.batchOrPenRef ?? "")} onChange={e => setForm(f => ({ ...f, batchOrPenRef: e.target.value }))} placeholder="e.g. Pen 4, Batch W22-01" /></div>
            </div>
            <hr className="border-gray-100" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Medicine Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label className="text-xs mb-1 block">Medicine Product Name *</Label><Input value={String(form.medicineProductName ?? "")} onChange={e => setForm(f => ({ ...f, medicineProductName: e.target.value }))} placeholder="e.g. Alamycin LA 300mg/ml" /></div>
              <div><Label className="text-xs mb-1 block">Active Ingredient</Label><Input value={String(form.activeIngredient ?? "")} onChange={e => setForm(f => ({ ...f, activeIngredient: e.target.value }))} placeholder="e.g. Oxytetracycline" /></div>
              <div><Label className="text-xs mb-1 block">Manufacturer</Label><Input value={String(form.manufacturer ?? "")} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} placeholder="e.g. Norbrook" /></div>
              <div><Label className="text-xs mb-1 block">Product Batch Number</Label><Input value={String(form.productBatchNumber ?? "")} onChange={e => setForm(f => ({ ...f, productBatchNumber: e.target.value }))} placeholder="e.g. BN1234/A" /></div>
              <div><Label className="text-xs mb-1 block">Product Expiry Date</Label><Input type="date" value={String(form.expiryDate ?? "")} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
            </div>
            <hr className="border-gray-100" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Administration</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs mb-1 block">Route of Administration *</Label>
                <Select value={String(form.administrationRoute ?? "Injection")} onValueChange={v => setForm(f => ({ ...f, administrationRoute: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ROUTES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs mb-1 block">Administered By</Label><Input value={String(form.administeredBy ?? "")} onChange={e => setForm(f => ({ ...f, administeredBy: e.target.value }))} placeholder="Name of person" /></div>
              <div>
                <Label className="text-xs mb-1 block">Quantity Used *</Label>
                <div className="flex gap-2">
                  <Input className="flex-1" value={String(form.quantityUsed ?? "")} onChange={e => setForm(f => ({ ...f, quantityUsed: e.target.value }))} placeholder="e.g. 25" />
                  <Select value={String(form.unitOfMeasure ?? "ml")} onValueChange={v => setForm(f => ({ ...f, unitOfMeasure: v }))}>
                    <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs mb-1 block">Diagnosis / Reason for Treatment *</Label><Input value={String(form.diagnosisReason ?? "")} onChange={e => setForm(f => ({ ...f, diagnosisReason: e.target.value }))} placeholder="e.g. PRRS, respiratory disease" /></div>
            </div>
            <hr className="border-gray-100" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Veterinary Prescription</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">Prescribing Vet Name</Label><Input value={String(form.prescribingVetName ?? "")} onChange={e => setForm(f => ({ ...f, prescribingVetName: e.target.value }))} placeholder="e.g. Dr. A. Smith" /></div>
              <div><Label className="text-xs mb-1 block">Vet Practice</Label><Input value={String(form.prescribingVetPractice ?? "")} onChange={e => setForm(f => ({ ...f, prescribingVetPractice: e.target.value }))} placeholder="e.g. Farm Vet Services Ltd" /></div>
              <div className="col-span-2 flex items-center gap-2">
                <Checkbox id="prescObtained" checked={Boolean(form.prescriptionObtained)} onCheckedChange={v => setForm(f => ({ ...f, prescriptionObtained: Boolean(v) }))} />
                <Label htmlFor="prescObtained" className="text-sm">Written prescription obtained</Label>
              </div>
            </div>
            <hr className="border-gray-100" />
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Withdrawal Period</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs mb-1 block">Withdrawal Period — Meat (days)</Label><Input type="number" min="0" value={String(form.withdrawalPeriodMeatDays ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalPeriodMeatDays: e.target.value }))} placeholder="e.g. 28" /></div>
              <div className="flex items-end">
                <p className="text-xs text-muted-foreground pb-2">Withdrawal end date is calculated automatically from treatment date + withdrawal days.</p>
              </div>
            </div>
            <div><Label className="text-xs mb-1 block">Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Any additional notes" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              disabled={save.isPending || !form.treatmentDate || !form.numberOfAnimals || !form.medicineProductName || !form.quantityUsed || !form.diagnosisReason}
              onClick={() => save.mutate(form)}
            >{editing ? "Update Record" : "Save Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View detail dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "36rem" }}>
            <DialogHeader><DialogTitle>Treatment Record — {fmt(viewRecord.medicineProductName)}</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm">
              {!!viewRecord.withdrawalEndDate && <WithdrawalBadge endDate={viewRecord.withdrawalEndDate as string} />}
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {([["treatmentDate", "Treatment Date", fmtDate], ["numberOfAnimals", "Animals Treated"], ["administrationRoute", "Route"], ["quantityUsed", "Quantity Used"], ["unitOfMeasure", "Unit"], ["flockId", "Flock", (v: unknown) => flockMap.get(String(v)) ?? fmt(v)], ["batchOrPenRef", "Batch/Pen Ref"], ["medicineProductName", "Product Name"], ["activeIngredient", "Active Ingredient"], ["manufacturer", "Manufacturer"], ["productBatchNumber", "Product Batch No."], ["expiryDate", "Product Expiry", fmtDate], ["diagnosisReason", "Reason / Diagnosis"], ["prescribingVetName", "Prescribing Vet"], ["prescribingVetPractice", "Vet Practice"], ["prescriptionObtained", "Prescription Obtained", (v: unknown) => v ? "Yes" : "No"], ["administeredBy", "Administered By"], ["withdrawalPeriodMeatDays", "Withdrawal (days)"], ["withdrawalEndDate", "Withdrawal End", fmtDate], ["notes", "Notes"]] as [string, string, ((v: unknown) => string)?][]).map(([key, label, fmtFn]) => {
                  const val = viewRecord[key];
                  if (val == null || val === "") return null;
                  return (
                    <div key={key} className={key === "diagnosisReason" || key === "notes" ? "col-span-2" : ""}>
                      <span className="text-muted-foreground text-xs">{label}</span>
                      <p className="font-medium">{fmtFn ? fmtFn(val) : fmt(val)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Compliance Overview ───────────────────────────────────────────────────────
type ComplianceStatus = "green" | "amber" | "red" | "grey";
interface SummaryItem { status: ComplianceStatus; count: number; lastEntry: string | null; message: string; }
interface PigComplianceSummary {
  flocks: SummaryItem; stockmanship: SummaryItem; medicine: SummaryItem; fci: SummaryItem;
  feed: SummaryItem; vet: SummaryItem; tailBiting: SummaryItem; farrowing: SummaryItem;
  redTractor: SummaryItem; movements: SummaryItem;
}

function StatusDot({ status }: { status: ComplianceStatus }) {
  const cls = status === "green" ? "bg-green-500" : status === "amber" ? "bg-amber-400" : status === "red" ? "bg-red-500" : "bg-gray-300";
  return <span className={`inline-block w-2 h-2 rounded-full ${cls} shrink-0`} />;
}

function ComplianceCard({ title, icon, item, tab, onGoto }: { title: string; icon: React.ReactNode; item: SummaryItem; tab: string; onGoto: (t: string) => void }) {
  const borderCls = item.status === "green" ? "border-green-200 hover:border-green-400" : item.status === "amber" ? "border-amber-200 hover:border-amber-400" : item.status === "red" ? "border-red-200 hover:border-red-400" : "border-gray-200";
  const bgCls = item.status === "green" ? "bg-green-50" : item.status === "amber" ? "bg-amber-50" : item.status === "red" ? "bg-red-50" : "bg-gray-50";
  return (
    <button onClick={() => onGoto(tab)} className={`w-full text-left rounded-lg border p-3 transition-colors cursor-pointer ${borderCls} ${bgCls}`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 text-muted-foreground">{icon}<span className="text-xs font-semibold uppercase tracking-wide">{title}</span></div>
        <StatusDot status={item.status} />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
      {item.lastEntry && <p className="text-xs text-muted-foreground/60 mt-1">Last: {item.lastEntry}</p>}
    </button>
  );
}

function OverviewTab({ farmId, onGoto }: { farmId: number; onGoto: (tab: string) => void }) {
  const { data, isLoading } = useQuery<{ summary: PigComplianceSummary }>({
    queryKey: ["pig-compliance-summary", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/pig-compliance-summary`), { credentials: "include" }).then(r => r.json()),
    refetchInterval: 60000,
  });
  const summary = data?.summary;

  const statuses = summary ? Object.values(summary) as SummaryItem[] : [];
  const overallStatus: ComplianceStatus = !summary ? "grey" : statuses.some(s => s.status === "red") ? "red" : statuses.some(s => s.status === "amber") ? "amber" : "green";
  const redCount = statuses.filter(s => s.status === "red").length;
  const amberCount = statuses.filter(s => s.status === "amber").length;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm">Red Tractor Pig Compliance Overview</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Live status across all 10 pig record categories. Click any card to jump to that tab.</p>
        </div>
        {summary && (
          <div className={`rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shrink-0 ${overallStatus === "red" ? "bg-red-100 text-red-700" : overallStatus === "amber" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
            {overallStatus === "green" ? <CheckCircle2 className="w-3.5 h-3.5" /> : overallStatus === "amber" ? <AlertTriangle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {overallStatus === "green" ? "All Clear" : overallStatus === "amber" ? `${amberCount} Need${amberCount === 1 ? "s" : ""} Attention` : `${redCount} Issue${redCount > 1 ? "s" : ""} Require Action`}
          </div>
        )}
      </div>

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center"><Loader2 className="animate-spin w-4 h-4" />Loading compliance status…</div>}

      {summary && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Herd Setup</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ComplianceCard title="Flocks / Groups" icon={<PiggyBank className="w-4 h-4" />} item={summary.flocks} tab="flocks" onGoto={onGoto} />
              <ComplianceCard title="Movements" icon={<Truck className="w-4 h-4" />} item={summary.movements} tab="movements" onGoto={onGoto} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Daily Compliance</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ComplianceCard title="Stockmanship Checks" icon={<ClipboardCheck className="w-4 h-4" />} item={summary.stockmanship} tab="stockmanship" onGoto={onGoto} />
              <ComplianceCard title="Feed Records" icon={<UtensilsCrossed className="w-4 h-4" />} item={summary.feed} tab="feed" onGoto={onGoto} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Treatments & Slaughter</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ComplianceCard title="Medicine Register" icon={<Pill className="w-4 h-4" />} item={summary.medicine} tab="medicine" onGoto={onGoto} />
              <ComplianceCard title="FCI Documents" icon={<FileText className="w-4 h-4" />} item={summary.fci} tab="fci" onGoto={onGoto} />
              <ComplianceCard title="Farrowing Records" icon={<Baby className="w-4 h-4" />} item={summary.farrowing} tab="farrowing" onGoto={onGoto} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Health & Welfare</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ComplianceCard title="Vet Assessments" icon={<Stethoscope className="w-4 h-4" />} item={summary.vet} tab="vet" onGoto={onGoto} />
              <ComplianceCard title="Tail Biting Risk" icon={<AlertTriangle className="w-4 h-4" />} item={summary.tailBiting} tab="tail-biting" onGoto={onGoto} />
              <ComplianceCard title="Red Tractor Checklist" icon={<ShieldCheck className="w-4 h-4" />} item={summary.redTractor} tab="red-tractor" onGoto={onGoto} />
            </div>
          </div>
          <div className="rounded-lg border border-pink-200 bg-pink-50 p-3">
            <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-pink-600" /><p className="text-xs font-semibold text-pink-700">Scheme Compliance Status</p></div>
            <p className="text-xs text-pink-600">{summary.redTractor.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Kill Records Tab ──────────────────────────────────────────────────────────
function KillRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { data: records = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["pig-kill-records", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/pig-kill-records`), { credentials: "include" }).then(r => r.json()).then((d: unknown) => {
      if (Array.isArray(d)) return d as Record<string, unknown>[];
      if (d && typeof d === "object" && "records" in d && Array.isArray((d as { records: unknown[] }).records)) return (d as { records: Record<string, unknown>[] }).records;
      return [] as Record<string, unknown>[];
    }),
  });
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/pig-kill-records/${editing.id}`) : api(`farms/${farmId}/pig-kill-records`), {
      method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-kill-records", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-kill-records/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-kill-records", farmId] }); setConfirmDelete(null); },
  });

  const totalDeadweight = (records as Record<string, unknown>[]).reduce((s, r) => s + parseFloat(String(r.totalDeadweightKg ?? "0") || "0"), 0);
  const totalHead = (records as Record<string, unknown>[]).reduce((s, r) => s + (Number(r.headCount) || 0), 0);
  const avgP2 = records.length > 0 ? records.reduce((s, r) => s + parseFloat(String(r.averageP2BackfatMm ?? "0") || "0"), 0) / records.filter(r => r.averageP2BackfatMm).length : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center"><p className="text-xs text-muted-foreground">Total Head</p><p className="text-lg font-bold">{totalHead.toLocaleString()}</p></div>
          <div className="text-center"><p className="text-xs text-muted-foreground">Total Deadweight</p><p className="text-lg font-bold">{totalDeadweight.toFixed(0)} kg</p></div>
          {avgP2 > 0 && <div className="text-center"><p className="text-xs text-muted-foreground">Avg P2 Backfat</p><p className="text-lg font-bold">{avgP2.toFixed(1)} mm</p></div>}
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Kill Record</Button>
      </div>

      {isLoading && <div className="flex justify-center py-8"><Loader2 className="animate-spin w-5 h-5" /></div>}
      {!isLoading && records.length === 0 && <Empty msg="No pig kill records yet. Add your first abattoir kill sheet." />}
      {!isLoading && records.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-xs text-muted-foreground">
              <th className="text-left py-2 pr-3">Kill Date</th><th className="text-left py-2 pr-3">Processor</th>
              <th className="text-right py-2 pr-3">Head</th><th className="text-right py-2 pr-3">Deadweight (kg)</th>
              <th className="text-right py-2 pr-3">Avg DW (kg)</th><th className="text-right py-2 pr-3">P2 (mm)</th>
              <th className="text-left py-2 pr-3">Grade</th><th className="text-right py-2 pr-3">Net (£)</th>
              <th className="text-left py-2">Kill Sheet Ref</th><th />
            </tr></thead>
            <tbody>
              {(records as Record<string, unknown>[]).map(r => (
                <tr key={String(r.id)} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => setViewRecord(r)}>
                  <td className="py-2 pr-3 font-medium">{fmtDate(r.killDate)}</td>
                  <td className="py-2 pr-3">{fmt(r.processor)}</td>
                  <td className="py-2 pr-3 text-right">{fmt(r.headCount)}</td>
                  <td className="py-2 pr-3 text-right">{r.totalDeadweightKg ? parseFloat(String(r.totalDeadweightKg)).toFixed(1) : "—"}</td>
                  <td className="py-2 pr-3 text-right">{r.averageDeadweightKg ? parseFloat(String(r.averageDeadweightKg)).toFixed(1) : "—"}</td>
                  <td className="py-2 pr-3 text-right">{r.averageP2BackfatMm ? `${parseFloat(String(r.averageP2BackfatMm)).toFixed(1)}` : "—"}</td>
                  <td className="py-2 pr-3"><Badge variant="outline">{fmt(r.gradeOut)}</Badge></td>
                  <td className="py-2 pr-3 text-right">{r.netPaymentPence ? `£${(Number(r.netPaymentPence) / 100).toFixed(2)}` : "—"}</td>
                  <td className="py-2">{fmt(r.killSheetRef)}</td>
                  <td className="py-2 pl-2 flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setEditing(r); setForm(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => setConfirmDelete(Number(r.id))}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); setForm({}); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Kill Record" : "Add Pig Kill Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {[
              ["killDate", "Kill Date", "date"],["processor", "Processor / Abattoir", "text"],
              ["headCount", "Head Count", "number"],["totalDeadweightKg", "Total Deadweight (kg)", "number"],
              ["averageDeadweightKg", "Avg Deadweight (kg)", "number"],["pricePerKgPence", "Price per kg (pence)", "number"],
              ["grossValuePence", "Gross Value (pence)", "number"],["levelDeductionPence", "Levy Deduction (pence)", "number"],
              ["transportDeductionPence", "Transport Deduction (pence)", "number"],["otherDeductionsPence", "Other Deductions (pence)", "number"],
              ["netPaymentPence", "Net Payment (pence)", "number"],["averageP2BackfatMm", "Avg P2 Backfat (mm)", "number"],
              ["averageMuscleDepthMm", "Avg Muscle Depth (mm)", "number"],["leanMeatPct", "Lean Meat %", "number"],
              ["gradeOut", "Grade Out (R/O/P…)", "text"],["sppPriceKgPence", "SPP Price/kg (pence)", "number"],
              ["sppVariancePence", "SPP Variance (pence)", "number"],["killSheetRef", "Kill Sheet Reference", "text"],
              ["herdMark", "Herd Mark", "text"],["premiumScheme", "Premium Scheme", "text"],
              ["premiumPence", "Premium Value (pence)", "number"],["paymentDate", "Payment Date", "date"],
            ].map(([k, label, type]) => (
              <div key={k} className={type === "text" && k !== "gradeOut" && k !== "herdMark" && k !== "premiumScheme" && k !== "killSheetRef" ? "col-span-2" : ""}>
                <Label className="text-xs">{label}</Label>
                <Input type={type as string} value={String(form[k] ?? "")} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} />
              </div>
            ))}
            <div className="col-span-2">
              <Label className="text-xs">Notes</Label>
              <textarea className="w-full border rounded-md p-2 text-sm min-h-[60px]" value={String(form.notes ?? "")} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm({}); }}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>{save.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : editing ? "Save Changes" : "Add Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Kill Record — {fmtDate(viewRecord.killDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-2 text-sm py-2">
              {[
                ["Processor", viewRecord.processor],["Head Count", viewRecord.headCount],
                ["Total Deadweight", viewRecord.totalDeadweightKg ? `${parseFloat(String(viewRecord.totalDeadweightKg)).toFixed(1)} kg` : "—"],
                ["Avg Deadweight", viewRecord.averageDeadweightKg ? `${parseFloat(String(viewRecord.averageDeadweightKg)).toFixed(1)} kg` : "—"],
                ["P2 Backfat", viewRecord.averageP2BackfatMm ? `${parseFloat(String(viewRecord.averageP2BackfatMm)).toFixed(1)} mm` : "—"],
                ["Muscle Depth", viewRecord.averageMuscleDepthMm ? `${parseFloat(String(viewRecord.averageMuscleDepthMm)).toFixed(1)} mm` : "—"],
                ["Lean Meat %", viewRecord.leanMeatPct ? `${viewRecord.leanMeatPct}%` : "—"],
                ["Grade Out", viewRecord.gradeOut],["Kill Sheet Ref", viewRecord.killSheetRef],
                ["Price/kg", viewRecord.pricePerKgPence ? `${Number(viewRecord.pricePerKgPence)}p` : "—"],
                ["Gross Value", viewRecord.grossValuePence ? `£${(Number(viewRecord.grossValuePence) / 100).toFixed(2)}` : "—"],
                ["Net Payment", viewRecord.netPaymentPence ? `£${(Number(viewRecord.netPaymentPence) / 100).toFixed(2)}` : "—"],
                ["SPP Variance", viewRecord.sppVariancePence ? `${Number(viewRecord.sppVariancePence) > 0 ? "+" : ""}${(Number(viewRecord.sppVariancePence) / 100).toFixed(2)}` : "—"],
                ["Herd Mark", viewRecord.herdMark],["Premium Scheme", viewRecord.premiumScheme],
                ["Premium Value", viewRecord.premiumPence ? `£${(Number(viewRecord.premiumPence) / 100).toFixed(2)}` : "—"],
                ["Payment Date", fmtDate(viewRecord.paymentDate)],
              ].map(([l, v]) => (
                <div key={String(l)}><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{fmt(v)}</p></div>
              ))}
              {viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm">{String(viewRecord.notes)}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { setEditing(viewRecord); setForm(viewRecord); setViewRecord(null); setOpen(true); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog open={confirmDelete !== null} title="Delete Kill Record" message="Delete this kill record? This cannot be undone." confirmLabel="Delete" confirmVariant="destructive" onConfirm={() => { if (confirmDelete) del.mutate(confirmDelete); }} onCancel={() => setConfirmDelete(null)} />
    </div>
  );
}

// ─── PDF Audit Report ──────────────────────────────────────────────────────────
async function generatePigAuditPDF(farmId: number) {
  const [jsPDFModule, autoTableModule] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const jsPDF = jsPDFModule.default;
  const autoTable = autoTableModule.default;

  const [flocks, movements, medicine, fci, feed, vet, stockmanship, tailBiting, farrowing, redTractor, killRecords] = await Promise.all([
    fetch(`/api/farms/${farmId}/pig-flocks`, { credentials: "include" }).then(r => r.json()).then((d: unknown) => Array.isArray(d) ? d : (d as { records?: unknown[] }).records ?? []),
    fetch(`/api/farms/${farmId}/pig-movements`, { credentials: "include" }).then(r => r.json()).then((d: unknown) => Array.isArray(d) ? d : (d as { records?: unknown[] }).records ?? []),
    fetch(`/api/farms/${farmId}/pig-medicine-treatments`, { credentials: "include" }).then(r => r.json()).then((d: unknown) => Array.isArray(d) ? d : (d as { records?: unknown[] }).records ?? []),
    fetch(`/api/farms/${farmId}/pig-fci-documents`, { credentials: "include" }).then(r => r.json()).then((d: unknown) => Array.isArray(d) ? d : (d as { records?: unknown[] }).records ?? []),
    fetch(`/api/farms/${farmId}/pig-feed-consumption`, { credentials: "include" }).then(r => r.json()).then((d: unknown) => Array.isArray(d) ? d : (d as { records?: unknown[] }).records ?? []),
    fetch(`/api/farms/${farmId}/pig-vet-assessments`, { credentials: "include" }).then(r => r.json()).then((d: unknown) => Array.isArray(d) ? d : (d as { records?: unknown[] }).records ?? []),
    fetch(`/api/farms/${farmId}/pig-stockmanship-checks`, { credentials: "include" }).then(r => r.json()).then((d: unknown) => Array.isArray(d) ? d : (d as { records?: unknown[] }).records ?? []),
    fetch(`/api/farms/${farmId}/pig-tail-biting-risks`, { credentials: "include" }).then(r => r.json()).then((d: unknown) => Array.isArray(d) ? d : (d as { records?: unknown[] }).records ?? []),
    fetch(`/api/farms/${farmId}/pig-farrowing-records`, { credentials: "include" }).then(r => r.json()).then((d: unknown) => Array.isArray(d) ? d : (d as { records?: unknown[] }).records ?? []),
    fetch(`/api/farms/${farmId}/pig-red-tractor-checklists`, { credentials: "include" }).then(r => r.json()).then((d: unknown) => Array.isArray(d) ? d : (d as { records?: unknown[] }).records ?? []),
    fetch(`/api/farms/${farmId}/pig-kill-records`, { credentials: "include" }).then(r => r.json()).then((d: unknown) => Array.isArray(d) ? d : (d as { records?: unknown[] }).records ?? []),
  ]);

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const today = new Date().toLocaleDateString("en-GB");
  const fd = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
  const fv = (v: unknown) => (v == null || v === "" ? "—" : String(v));
  const fp = (p: unknown) => p ? `£${(Number(p) / 100).toFixed(2)}` : "—";

  doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text("BDE Farm Trac — Pig Production Audit Report", 14, 18);
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text(`Farm ID: ${farmId}   Generated: ${today}   Red Tractor Pig Assurance`, 14, 26);
  doc.setDrawColor(219, 39, 119); doc.setLineWidth(0.5);
  doc.line(14, 30, 283, 30);

  let y = 38;
  function addSection(title: string, head: string[], rows: string[][], colour = [219, 39, 119]) {
    if (rows.length === 0) return;
    if (y > 170) { doc.addPage(); y = 20; }
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.setTextColor(colour[0], colour[1], colour[2]);
    doc.text(title, 14, y); y += 4;
    doc.setTextColor(0, 0, 0);
    autoTable(doc, {
      startY: y, head: [head], body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: colour as [number, number, number], textColor: 255 },
      alternateRowStyles: { fillColor: [253, 242, 248] },
      margin: { left: 14, right: 14 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type R = Record<string, any>;
  if ((flocks as R[]).length) addSection("Pig Flocks / Groups", ["Name", "Type", "Breed", "Location", "Current Count", "Herd No.", "CPH"], (flocks as R[]).map(r => [fv(r.flockName), fv(r.productionType), fv(r.breed), fv(r.location), fv(r.currentCount), fv(r.herdNumber), fv(r.cphNumber)]));
  if ((stockmanship as R[]).length) addSection("Daily Stockmanship Checks", ["Date", "Group", "Behaviour", "Bedding", "Tail Biting", "Overall Welfare", "Action Taken"], (stockmanship as R[]).map(r => [fd(r.checkDate), fv(r.groupName), fv(r.behaviour), fv(r.beddingCondition), r.tailBitingObserved ? "Yes" : "No", fv(r.overallWelfare), fv(r.actionTaken)]));
  if ((medicine as R[]).length) addSection("Medicine Treatments", ["Date", "Group", "Product", "Diagnosis", "Route", "Qty", "Withdrawal Clear", "Vet"], (medicine as R[]).map(r => [fd(r.treatmentDate), fv(r.batchOrPenRef), fv(r.medicineProductName), fv(r.diagnosisReason), fv(r.administrationRoute), `${fv(r.quantityUsed)} ${fv(r.unitOfMeasure)}`, fd(r.withdrawalEndDate), fv(r.prescribingVetName)]));
  if ((movements as R[]).length) addSection("Pig Movements (EAML2)", ["Date", "Type", "From", "To", "Head", "EAML2 Ref", "Haulier"], (movements as R[]).map(r => [fd(r.movementDate), fv(r.movementType), `${fv(r.fromLocation)} (${fv(r.fromCph)})`, `${fv(r.toLocation)} (${fv(r.toCph)})`, fv(r.numberOfAnimals), fv(r.eaml2Reference), fv(r.transporterName)]));
  if ((fci as R[]).length) addSection("Food Chain Information (FCI)", ["Date", "Batch Ref", "Abattoir", "Pigs", "Medicines?", "WD Clear?", "Feed WD (h)", "Signed"], (fci as R[]).map(r => [fd(r.documentDate), fv(r.batchReference), fv(r.destinationAbattoir), fv(r.numberOfPigs), r.veterinaryMedicinesLast60Days ? "Yes" : "No", r.withdrawalPeriodClear ? "Yes" : "No", fv(r.feedWithdrawalHours), r.signedByFarmer ? "Yes" : "No"]));
  if ((feed as R[]).length) addSection("Feed Consumption Records", ["Date", "Group / Pen", "Feed Type", "Quantity (kg)", "Batch / Lot No."], (feed as R[]).map(r => [fd(r.consumptionDate), fv(r.penName), fv(r.feedType), fv(r.quantityKg), fv(r.batchLotNumber)]));
  if ((vet as R[]).length) addSection("Vet Health Assessments", ["Date", "Vet", "Practice", "BCS", "Lameness", "Respiratory", "Findings", "Next Review"], (vet as R[]).map(r => [fd(r.assessmentDate), fv(r.vetName), fv(r.practiceName), fv(r.bodyConditionScore), fv(r.lameness), fv(r.respiratoryHealth), String(fv(r.findings)).slice(0, 60), fd(r.nextReviewDate)]));
  if ((tailBiting as R[]).length) addSection("Tail Biting Risk Assessments", ["Date", "Assessed By", "Risk Level", "Current Biting", "Interventions", "Next Review"], (tailBiting as R[]).map(r => [fd(r.assessmentDate), fv(r.assessedBy), fv(r.riskLevel), r.currentBiting ? "Yes" : "No", String(fv(r.interventionsTaken)).slice(0, 50), fd(r.reviewDate)]));
  if ((farrowing as R[]).length) addSection("Farrowing Records", ["Date", "Sow Tag", "Parity", "Born Alive", "Stillborn", "Mummified", "Avg Birth Wt (kg)", "Ease"], (farrowing as R[]).map(r => [fd(r.farrowingDate), fv(r.sowEarTag), fv(r.parity), fv(r.bornAlive), fv(r.stillborn), fv(r.mummified), fv(r.averageBirthWeightKg), fv(r.farrowingEase)]));
  if ((redTractor as R[]).length) addSection("Red Tractor Checklists", ["Date", "Assessor", "Overall Status", "Non-conformances", "Next Due", "Corrective Action Deadline"], (redTractor as R[]).map(r => [fd(r.assessmentDate), fv(r.assessorName), fv(r.overallStatus), fv(r.nonConformancesCount), fd(r.nextAssessmentDue), fd(r.correctiveActionDeadline)]));
  if ((killRecords as R[]).length) addSection("Abattoir Kill Records", ["Kill Date", "Processor", "Head", "Total DW (kg)", "Avg DW (kg)", "P2 (mm)", "Grade", "Net Payment", "Kill Sheet Ref"], (killRecords as R[]).map(r => [fd(r.killDate), fv(r.processor), fv(r.headCount), r.totalDeadweightKg ? parseFloat(String(r.totalDeadweightKg)).toFixed(1) : "—", r.averageDeadweightKg ? parseFloat(String(r.averageDeadweightKg)).toFixed(1) : "—", r.averageP2BackfatMm ? parseFloat(String(r.averageP2BackfatMm)).toFixed(1) : "—", fv(r.gradeOut), fp(r.netPaymentPence), fv(r.killSheetRef)]));

  const safeFarmId = String(farmId).replace(/[^a-z0-9]/gi, "");
  doc.save(`pig-audit-report-farm${safeFarmId}-${today.replace(/\//g, "-")}.pdf`);
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
type Tab = "overview" | "flocks" | "movements" | "medicine" | "fci" | "feed" | "vet" | "stockmanship" | "tail-biting" | "farrowing" | "red-tractor" | "kill-records";

export default function PigProductionPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>(() => { const p = new URLSearchParams(window.location.search); const t = p.get("tab") as Tab | null; const valid: Tab[] = ["overview","flocks","movements","medicine","fci","feed","vet","stockmanship","tail-biting","farrowing","red-tractor","kill-records"]; return t && valid.includes(t) ? t : "overview"; });
  const [generating, setGenerating] = useState(false);
  if (!farmId) return <Redirect to="/" />;

  async function handleGeneratePdf() {
    setGenerating(true);
    try { await generatePigAuditPDF(farmId!); } catch (e) { console.error("Pig PDF generation failed:", e); } finally { setGenerating(false); }
  }

  return (
    <AppLayout title="Pig Production">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <TabBar>
            <TabButton active={tab === "overview"} onClick={() => setTab("overview")}><LayoutDashboard className="w-3.5 h-3.5 mr-1" />Overview</TabButton>
            <TabButton active={tab === "flocks"} onClick={() => setTab("flocks")}><PiggyBank className="w-3.5 h-3.5 mr-1" />Flocks</TabButton>
            <TabButton active={tab === "movements"} onClick={() => setTab("movements")}><Truck className="w-3.5 h-3.5 mr-1" />Movements</TabButton>
            <TabButton active={tab === "medicine"} onClick={() => setTab("medicine")}><Pill className="w-3.5 h-3.5 mr-1" />Medicine Register</TabButton>
            <TabButton active={tab === "fci"} onClick={() => setTab("fci")}><FileText className="w-3.5 h-3.5 mr-1" />FCI Documents</TabButton>
            <TabButton active={tab === "feed"} onClick={() => setTab("feed")}><UtensilsCrossed className="w-3.5 h-3.5 mr-1" />Feed Records</TabButton>
            <TabButton active={tab === "vet"} onClick={() => setTab("vet")}><Stethoscope className="w-3.5 h-3.5 mr-1" />Vet Assessments</TabButton>
            <TabButton active={tab === "stockmanship"} onClick={() => setTab("stockmanship")}><ClipboardCheck className="w-3.5 h-3.5 mr-1" />Stockmanship</TabButton>
            <TabButton active={tab === "tail-biting"} onClick={() => setTab("tail-biting")}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Tail Biting Risk</TabButton>
            <TabButton active={tab === "farrowing"} onClick={() => setTab("farrowing")}><Baby className="w-3.5 h-3.5 mr-1" />Farrowing</TabButton>
            <TabButton active={tab === "red-tractor"} onClick={() => setTab("red-tractor")}><ShieldCheck className="w-3.5 h-3.5 mr-1" />Red Tractor</TabButton>
            <TabButton active={tab === "kill-records"} onClick={() => setTab("kill-records")}><Scale className="w-3.5 h-3.5 mr-1" />Kill Records</TabButton>
          </TabBar>
          <Button size="sm" variant="outline" onClick={handleGeneratePdf} disabled={generating} className="ml-2 shrink-0">
            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <FileDown className="w-4 h-4 mr-1" />}
            Audit Report
          </Button>
        </div>
        <Card><CardContent className="pt-4">
          {tab === "overview" && <OverviewTab farmId={farmId} onGoto={t => setTab(t as Tab)} />}
          {tab === "flocks" && <FlocksTab farmId={farmId} />}
          {tab === "movements" && <MovementsTab farmId={farmId} />}
          {tab === "medicine" && <MedicineRegisterTab farmId={farmId} />}
          {tab === "fci" && <FciDocumentsTab farmId={farmId} />}
          {tab === "feed" && <FeedRecordsTab farmId={farmId} />}
          {tab === "vet" && <VetAssessmentsTab farmId={farmId} />}
          {tab === "stockmanship" && <StockmanshipChecksTab farmId={farmId} />}
          {tab === "tail-biting" && <TailBitingRisksTab farmId={farmId} />}
          {tab === "farrowing" && <FarrowingRecordsTab farmId={farmId} />}
          {tab === "red-tractor" && <PigRedTractorChecklistTab farmId={farmId} />}
          {tab === "kill-records" && <KillRecordsTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
