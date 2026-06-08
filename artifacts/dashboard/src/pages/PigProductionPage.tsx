import { useState, useMemo, type ReactNode } from "react";
import { openPrintWindow } from "@/lib/print-report";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { useQuery, useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { DocAttach } from "@/components/DocAttach";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Plus, Pencil, Trash2, Loader2, PiggyBank, Truck, FileText, UtensilsCrossed, Stethoscope, ClipboardCheck, AlertTriangle, Baby, ShieldCheck, Pill, CheckCircle2, Clock, MapPin, LayoutDashboard, XCircle, TrendingUp, Scale, FileDown, Eye, Paperclip, Printer } from "lucide-react";
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
function DataTable({ cols, rows, onEdit, onDelete, onView }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string; render?: (r: Record<string, unknown>) => ReactNode }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void; onView?: (r: Record<string, unknown>) => void }) {
  const [pendingDelete, setPendingDelete] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet. Add one using the button above." />;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete || onView) && <th />}</tr></thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.render ? c.render(row) : c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
              {(onEdit || onDelete || onView) && (
                <td className="py-2 text-right space-x-1">
                  {onView && <Button size="icon" variant="ghost" onClick={() => onView(row)}><Eye className="w-3.5 h-3.5" /></Button>}
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
  const { data: herds = [], isLoading } = useQuery({ queryKey: ["pig-flocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-flocks`), { credentials: "include" }).then(r => r.json()) });
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Production groups are managed in Livestock → Herds &amp; Animals.</strong><br />
        Records in all tabs link to that register. Create or edit herds and production groups there.
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Registered Herds / Production Groups <span className="font-normal text-muted-foreground">({(herds as Record<string, unknown>[]).length})</span></h3>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "flockName", label: "Name" },
            { key: "productionType", label: "Type" },
            { key: "breed", label: "Breed" },
            { key: "herdNumber", label: "Herd No." },
            { key: "notes", label: "Notes" },
          ]}
          rows={herds as Record<string, unknown>[]}
        />
      )}
    </div>
  );
}

// ─── MOVEMENTS TAB ─────────────────────────────────────────────────────────────
function MovementsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [yearFilter, setYearFilter] = useState<string>("all");

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

  const years = useMemo(() => Array.from(new Set((movements as Record<string, unknown>[]).map(r => String(r.movementDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [movements]);
  const filtered = useMemo(() => yearFilter === "all" ? movements as Record<string, unknown>[] : (movements as Record<string, unknown>[]).filter(r => String(r.movementDate ?? "").startsWith(yearFilter)), [movements, yearFilter]);

  function printMovements() {
    const fmtD = (d: unknown) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const rows = filtered.map(r => `<tr><td>${fmtD(r.movementDate)}</td><td>${String(r.movementType ?? "—")}</td><td>${String(r.fromLocation ?? "—")} (${String(r.fromCph ?? "—")})</td><td>${String(r.toLocation ?? "—")} (${String(r.toCph ?? "—")})</td><td>${String(r.numberOfAnimals ?? "—")}</td><td>${String(r.eaml2Reference ?? "—")}</td><td>${String(r.transporterName ?? "—")}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Pig Movements (eAML2)</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>Pig Movements (eAML2)${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Type</th><th>From</th><th>To</th><th>Animals</th><th>eAML2 Ref</th><th>Transporter</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Pig Movements (eAML2)</h3>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && <Button size="sm" variant="outline" onClick={printMovements}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Log Movement</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "movementDate", label: "Date", fmt: r => fmtDate(r.movementDate) }, { key: "movementType", label: "Type" },
            { key: "fromLocation", label: "From" }, { key: "toLocation", label: "To" },
            { key: "numberOfAnimals", label: "Animals" }, { key: "eaml2Reference", label: "eAML2 Ref" },
            { key: "doc", label: "Document", render: r => <DocAttach farmId={farmId} endpoint="pig-movements" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["pig-movements", String(farmId)]} /> },
          ]}
          rows={filtered}
          onEdit={openEdit}
          onDelete={r => del.mutate(r.id as number)}
          onView={setViewRecord}
        />
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Movement</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Movement Date</p><p className="font-medium">{fmtDate(viewRecord.movementDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Movement Type</p><p className="font-medium">{String(viewRecord.movementType ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">From Location</p><p className="font-medium">{String(viewRecord.fromLocation ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">From CPH</p><p className="font-medium">{String(viewRecord.fromCph ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">To Location</p><p className="font-medium">{String(viewRecord.toLocation ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">To CPH</p><p className="font-medium">{String(viewRecord.toCph ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Animals</p><p className="font-medium">{String(viewRecord.numberOfAnimals ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">eAML2 Reference</p><p className="font-medium">{String(viewRecord.eaml2Reference ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Transporter Name</p><p className="font-medium">{String(viewRecord.transporterName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vehicle Registration</p><p className="font-medium">{String(viewRecord.vehicleRegistration ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
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
            { key: "doc", label: "Document", render: r => <DocAttach farmId={farmId} endpoint="pig-fci-documents" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["pig-fci", String(farmId)]} /> },
          ]}
          rows={docs}
          onEdit={openEdit}
          onDelete={r => del.mutate(r.id as number)}
          onView={setViewRecord}
        />
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View FCI Document</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Document Date</p><p className="font-medium">{fmtDate(viewRecord.documentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Batch Reference</p><p className="font-medium">{String(viewRecord.batchReference ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Destination Abattoir</p><p className="font-medium">{String(viewRecord.destinationAbattoir ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Pigs</p><p className="font-medium">{String(viewRecord.numberOfPigs ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Feed Withdrawal (hours)</p><p className="font-medium">{String(viewRecord.feedWithdrawalHours ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lameness / Casualty Status</p><p className="font-medium">{String(viewRecord.lambnessCasualtyStatus ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Veterinary Medicines Last 60 Days</p><p className="font-medium">{viewRecord.veterinaryMedicinesLast60Days ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal Period Clear</p><p className="font-medium">{viewRecord.withdrawalPeriodClear ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Signed By Farmer</p><p className="font-medium">{viewRecord.signedByFarmer ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Medicine Details</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.medicineDetails ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>FCI Document</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Document Date *</Label><Input type="date" value={String(form.documentDate ?? "")} onChange={e => setForm(f => ({ ...f, documentDate: e.target.value }))} /></div>
            <div><Label>Batch Reference</Label><Input value={String(form.batchReference ?? "")} onChange={e => setForm(f => ({ ...f, batchReference: e.target.value }))} /></div>
            <div><Label>Destination Abattoir</Label><Input value={String(form.destinationAbattoir ?? "")} onChange={e => setForm(f => ({ ...f, destinationAbattoir: e.target.value }))} /></div>
            <div><Label>Number of Pigs *</Label><Input type="number" min="1" step="1" value={String(form.numberOfPigs ?? "")} onChange={e => setForm(f => ({ ...f, numberOfPigs: e.target.value }))} /></div>
            <div><Label>Feed Withdrawal (hours)</Label><Input type="number" value={String(form.feedWithdrawalHours ?? "")} onChange={e => setForm(f => ({ ...f, feedWithdrawalHours: e.target.value }))} /></div>
            <div><Label>Lameness / Casualty Status</Label>
              <Select value={String(form.lambnessCasualtyStatus ?? "")} onValueChange={v => setForm(f => ({ ...f, lambnessCasualtyStatus: v }))}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>{["None","Lame – minor","Lame – moderate","Lame – severe","Casualty – suspected","Casualty – confirmed","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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
        <p className="text-xs text-green-800">Record feed quantity per <strong>herd / group</strong> and <strong>location</strong> each day. Locations are drawn from your central Farm Locations list — add any sheds or outdoor areas there to keep all records consistent.</p>
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
        <Empty msg="No feeding records yet. Add your pig sheds to Farm Locations, then record daily feed consumption per herd / group and location." />
      ) : (
        <div className="space-y-2">
          {sorted.map((r, i) => (
            <div key={i} className="border rounded-lg p-3 bg-white">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">{!!r.flockName ? fmt(r.flockName) : "Unknown group"}</span>
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
            <div><Label>Herd / Group *</Label>
              <Select value={form.appliedToFlockId ?? "__none__"} onValueChange={v => setForm(f => ({ ...f, appliedToFlockId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select herd / group" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select herd / group —</SelectItem>
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
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data: allAssessments = [], isLoading } = useQuery({ queryKey: ["pig-vet", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-vet-assessments`), { credentials: "include" }).then(r => r.json()) });
  const [vetYearFilter, setVetYearFilter] = useState("all");
  const vetYears = useMemo(() => Array.from(new Set((allAssessments as Record<string,unknown>[]).map(r => String(r.assessmentDate || "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allAssessments]);
  const assessments = useMemo(() => vetYearFilter === "all" ? allAssessments as Record<string,unknown>[] : (allAssessments as Record<string,unknown>[]).filter(r => String(r.assessmentDate || "").startsWith(vetYearFilter)), [allAssessments, vetYearFilter]);

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

  function printVetAssessments() {
    const rows = assessments as Record<string,unknown>[];
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Vet Assessments</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Veterinary Assessments & Health Plans${vetYearFilter !== "all" ? ` — ${vetYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Vet</th><th>Practice</th><th>Lameness</th><th>Respiratory</th><th>Next Review</th></tr></thead><tbody>${rows.map(r => `<tr><td>${fmtDate(r.assessmentDate)}</td><td>${r.vetName || "—"}</td><td>${r.practiceName || "—"}</td><td>${r.lameness || "—"}</td><td>${r.respiratoryHealth || "—"}</td><td>${fmtDate(r.nextReviewDate)}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-semibold text-sm">Veterinary Assessments & Health Plans</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={vetYearFilter} onValueChange={setVetYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{vetYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          {assessments.length > 0 && <Button size="sm" variant="outline" onClick={printVetAssessments}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>}
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Assessment</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "assessmentDate", label: "Date", fmt: r => fmtDate(r.assessmentDate) }, { key: "vetName", label: "Vet" },
            { key: "practiceName", label: "Practice" }, { key: "lameness", label: "Lameness" },
            { key: "respiratoryHealth", label: "Respiratory" }, { key: "nextReviewDate", label: "Next Review", fmt: r => fmtDate(r.nextReviewDate) },
            { key: "doc", label: "Document", render: r => <DocAttach farmId={farmId} endpoint="pig-vet-assessments" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["pig-vet", String(farmId)]} /> },
          ]}
          rows={assessments}
          onEdit={openEdit}
          onDelete={r => del.mutate(r.id as number)}
          onView={setViewRecord}
        />
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Vet Assessment</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Date</p><p className="font-medium">{fmtDate(viewRecord.assessmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Name</p><p className="font-medium">{String(viewRecord.vetName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Practice Name</p><p className="font-medium">{String(viewRecord.practiceName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mortality Rate (%)</p><p className="font-medium">{String(viewRecord.mortalityRate ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lameness Assessment</p><p className="font-medium">{String(viewRecord.lameness ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Respiratory Health</p><p className="font-medium">{String(viewRecord.respiratoryHealth ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Skin Condition</p><p className="font-medium">{String(viewRecord.skinCondition ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Tail Biting</p><p className="font-medium">{String(viewRecord.tailBiting ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Review Date</p><p className="font-medium">{fmtDate(viewRecord.nextReviewDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Findings</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.findings ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Recommendations</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.recommendations ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.notes ?? "—")}</p></div>
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="pig-vet-assessments" recordId={viewRecord.id as number} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});

  const { data: allChecks = [], isLoading } = useQuery({ queryKey: ["pig-stockmanship", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-stockmanship-checks`), { credentials: "include" }).then(r => r.json()) });

  const stockYears = useMemo(() => {
    const s = new Set<string>((allChecks as Record<string,unknown>[]).map(r => String(r.checkDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [allChecks]);
  const [stockYearFilter, setStockYearFilter] = useState("all");
  const checks = useMemo(() => stockYearFilter === "all" ? allChecks : (allChecks as Record<string,unknown>[]).filter(r => String(r.checkDate || "").startsWith(stockYearFilter)), [allChecks, stockYearFilter]);

  const printStock = () => {
    const rows = (checks as Record<string,unknown>[]);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Stockmanship Checks</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Daily Stockmanship Checks${stockYearFilter !== "all" ? ` — ${stockYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Checked By</th><th>Mortalities</th><th>Injured</th><th>Welfare Status</th><th>Actions Required</th></tr></thead><tbody>${rows.map(r => `<tr><td>${fmtDate(r.checkDate)}</td><td>${r.checkedBy || "—"}</td><td>${r.mortalitiesFound ?? 0}</td><td>${r.injuredFound ?? 0}</td><td>${r.overallWelfare || "—"}</td><td>${r.actionsRequired || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

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
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-semibold text-sm">Daily Stockmanship Checks</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={stockYearFilter} onValueChange={setStockYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{stockYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printStock}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Log Check</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "checkDate", label: "Date", fmt: r => fmtDate(r.checkDate) }, { key: "checkedBy", label: "Checked By" },
            { key: "mortalitiesFound", label: "Mortalities" }, { key: "injuredFound", label: "Injured" },
            { key: "overallWelfare", label: "Welfare Status" }, { key: "actionsRequired", label: "Actions Required" },
            { key: "doc", label: "Document", render: r => <DocAttach farmId={farmId} endpoint="pig-stockmanship-checks" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["pig-stockmanship", String(farmId)]} compact /> },
          ]}
          rows={checks as Record<string, unknown>[]}
          onEdit={openEdit}
          onDelete={r => del.mutate(r.id as number)}
          onView={setViewRecord}
        />
      )}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "38rem" }}>
            <DialogHeader><DialogTitle>Stockmanship Check — {fmtDate(viewRecord.checkDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Checked By</p><p className="font-medium">{String(viewRecord.checkedBy ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Welfare</p><p className="font-medium">{String(viewRecord.overallWelfare ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mortalities Found</p><p className="font-medium">{String(viewRecord.mortalitiesFound ?? 0)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Injured Found</p><p className="font-medium">{String(viewRecord.injuredFound ?? 0)}</p></div>
              {!!viewRecord.actionsRequired && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Actions Required</p><p className="font-medium">{String(viewRecord.actionsRequired)}</p></div>}
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="pig-stockmanship-checks" recordId={viewRecord.id as number} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button><Button onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>Stockmanship Check</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Check Date *</Label><Input type="date" value={String(form.checkDate ?? "")} onChange={e => setForm(f => ({ ...f, checkDate: e.target.value }))} /></div>
            <div><Label>Checked By *</Label><Input value={String(form.checkedBy ?? "")} onChange={e => setForm(f => ({ ...f, checkedBy: e.target.value }))} /></div>
            <div><Label>Mortalities Found</Label><Input type="number" min="0" step="1" value={String(form.mortalitiesFound ?? "0")} onChange={e => setForm(f => ({ ...f, mortalitiesFound: e.target.value }))} /></div>
            <div><Label>Injured Found</Label><Input type="number" min="0" step="1" value={String(form.injuredFound ?? "0")} onChange={e => setForm(f => ({ ...f, injuredFound: e.target.value }))} /></div>
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
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: allRecords = [], isLoading } = useQuery({ queryKey: ["pig-tail-biting", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-tail-biting-risks`), { credentials: "include" }).then(r => r.json()) });

  const tbYears = useMemo(() => {
    const s = new Set<string>((allRecords as Record<string,unknown>[]).map(r => String(r.assessmentDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [allRecords]);
  const [tbYearFilter, setTbYearFilter] = useState("all");
  const records = useMemo(() => tbYearFilter === "all" ? allRecords : (allRecords as Record<string,unknown>[]).filter(r => String(r.assessmentDate || "").startsWith(tbYearFilter)), [allRecords, tbYearFilter]);

  const printTb = () => {
    const rows = records as Record<string,unknown>[];
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Tail Biting Risk Assessments</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Tail Biting Risk Assessments${tbYearFilter !== "all" ? ` — ${tbYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Assessed By</th><th>Risk Level</th><th>Biting Active?</th><th>Interventions</th><th>Review Date</th></tr></thead><tbody>${rows.map(r => `<tr><td>${fmtDate(r.assessmentDate)}</td><td>${r.assessedBy || "—"}</td><td>${r.riskLevel || "—"}</td><td>${r.currentBiting ? "Yes" : "No"}</td><td>${r.interventionsTaken || "—"}</td><td>${fmtDate(r.reviewDate)}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

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
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold text-sm">Tail Biting Risk Assessments</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Red Tractor Pigs Standard — a written risk assessment is required. Review when risk factors change or biting is observed.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={tbYearFilter} onValueChange={setTbYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{tbYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printTb}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />New Assessment</Button>
        </div>
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
            { key: "doc", label: "Document", render: r => <DocAttach farmId={farmId} endpoint="pig-tail-biting-risks" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["pig-tail-biting", String(farmId)]} compact /> },
          ]}
          rows={records as Record<string, unknown>[]}
          onEdit={openEdit}
          onDelete={r => del.mutate(r.id as number)}
          onView={setViewRecord}
        />
      )}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Tail Biting Risk Assessment — {fmtDate(viewRecord.assessmentDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessed By</p><p className="font-medium">{String(viewRecord.assessedBy ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Risk Level</p><p className="font-medium">{String(viewRecord.riskLevel ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Biting Currently Active</p><p className="font-medium">{viewRecord.currentBiting ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Review Date</p><p className="font-medium">{fmtDate(viewRecord.reviewDate)}</p></div>
              {!!viewRecord.interventionsTaken && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Interventions Taken</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.interventionsTaken)}</p></div>}
              {!!viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.notes)}</p></div>}
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="pig-tail-biting-risks" recordId={viewRecord.id as number} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button><Button onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button></DialogFooter>
          </DialogContent>
        </Dialog>
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

interface FarrowingRecord {
  id: number;
  farrowingDate: string;
  expectedFarrowingDate?: string | null;
  sowEarTag: string;
  sowBreed?: string | null;
  parityNumber?: number | null;
  flockId?: number | null;
  totalBornAlive: number;
  totalBornDead: number;
  totalMummified: number;
  fostersIn: number;
  fostersOut: number;
  averageBirthWeightKg?: string | null;
  weaningDate?: string | null;
  pigletsWeanedCount?: number | null;
  averageWeaningWeightKg?: string | null;
  farrowingEase?: string | null;
  assistanceRequired?: boolean | null;
  assistanceDetails?: string | null;
  vetAttended?: boolean | null;
  vetName?: string | null;
  colostrumManaged?: boolean | null;
  perinatalDisposalContractorId?: number | null;
  perinatalCollectionDate?: string | null;
  perinatalCollectionRef?: string | null;
  perinatalDisposalMethod?: string | null;
  perinatalDisposalNotes?: string | null;
  notes?: string | null;
}

function FarrowingEaseBadge({ v }: { v?: string | null }) {
  if (!v) return null;
  const n = parseInt(v.charAt(0));
  const map: Record<number, { cls: string }> = {
    1: { cls: "bg-green-100 text-green-700" },
    2: { cls: "bg-yellow-100 text-yellow-700" },
    3: { cls: "bg-orange-100 text-orange-700" },
    4: { cls: "bg-red-100 text-red-700" },
  };
  const d = map[n];
  if (!d) return null;
  return <span className={`text-xs px-2 py-0.5 rounded font-medium ${d.cls}`}>{v}</span>;
}

function FarrowingRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const todayStr = new Date().toISOString().slice(0, 10);
  const EMPTY: Partial<FarrowingRecord> = {
    totalBornAlive: 0, totalBornDead: 0, totalMummified: 0,
    fostersIn: 0, fostersOut: 0, assistanceRequired: false, colostrumManaged: true,
  };

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FarrowingRecord | null>(null);
  const [viewRecord, setViewRecord] = useState<FarrowingRecord | null>(null);
  const [form, setForm] = useState<Partial<FarrowingRecord>>(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [showManualVet, setShowManualVet] = useState(false);
  const CURRENT_YEAR = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState(String(CURRENT_YEAR));

  const { data, isLoading } = useQuery<FarrowingRecord[]>({
    queryKey: ["pig-farrowing", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/pig-farrowing-records`), { credentials: "include" }).then(r => r.json()),
  });
  const allRecords: FarrowingRecord[] = Array.isArray(data) ? data : [];
  const records = yearFilter === "all" ? allRecords : allRecords.filter(r => r.farrowingDate?.startsWith(yearFilter));

  const vetVisitsQ = useQuery<{ records: Array<{ id: number; vetName: string; vetPractice?: string | null }> }>({
    queryKey: ["farrowing-vet-visits", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/vet-visits`), { credentials: "include" }).then(r => r.json()),
    enabled: open && !!form.vetAttended,
  });
  const uniqueVetNames = [...new Set((vetVisitsQ.data?.records ?? []).map(v => v.vetName).filter(Boolean))] as string[];
  const vetPracticeMap = Object.fromEntries(
    (vetVisitsQ.data?.records ?? []).filter(v => v.vetName && v.vetPractice).map(v => [v.vetName, v.vetPractice])
  );

  const availableYears = [...new Set(allRecords.map(r => r.farrowingDate?.slice(0, 4)).filter(Boolean))].sort((a, b) => Number(b) - Number(a)) as string[];
  if (!availableYears.includes(String(CURRENT_YEAR))) availableYears.unshift(String(CURRENT_YEAR));

  const save = useMutation({
    mutationFn: (body: Partial<FarrowingRecord>) => {
      const url = editing ? api(`farms/${farmId}/pig-farrowing-records/${editing.id}`) : api(`farms/${farmId}/pig-farrowing-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-farrowing", farmId] }); closeDialog(); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-farrowing-records/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-farrowing", farmId] }); setConfirmDelete(null); },
  });

  function closeDialog() { setOpen(false); setEditing(null); setForm(EMPTY); setShowManualVet(false); }
  function openAdd() { setEditing(null); setForm({ ...EMPTY, farrowingDate: todayStr }); setShowManualVet(false); setOpen(true); }
  function openEdit(r: FarrowingRecord) { setEditing(r); setForm({ ...r }); setShowManualVet(!!(r.vetAttended && r.vetName && !uniqueVetNames.includes(r.vetName ?? ""))); setOpen(true); }
  function set<K extends keyof FarrowingRecord>(k: K, v: unknown) { setForm(f => ({ ...f, [k]: v })); }

  const totalBorn = (r: FarrowingRecord) => (r.totalBornAlive || 0) + (r.totalBornDead || 0) + (r.totalMummified || 0);
  const weaningRate = (r: FarrowingRecord) => {
    const alive = r.totalBornAlive || 0;
    const weaned = r.pigletsWeanedCount || 0;
    if (!alive) return null;
    return Math.round((weaned / alive) * 100);
  };

  const { data: attachCountsRaw = [] } = useQuery<Array<{recordType: string; recordId: number; count: number}>>({
    queryKey: ["record-attachment-counts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/record-attachments/counts`, { credentials: "include" }).then(r => r.json()),
    staleTime: 30000,
  });
  const farrowingAttachMap = Object.fromEntries(attachCountsRaw.filter(c => c.recordType === "farrowing").map(c => [c.recordId, c.count]));

  const contractorsQ = useQuery<Array<{ id: number; name: string; approvalNumber: string; operatorType: string }>>({
    queryKey: ["fallen-stock-contractors", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/fallen-stock-contractors`), { credentials: "include" }).then(r => r.json()),
    enabled: open,
  });
  const contractors = contractorsQ.data ?? [];

  const hasDeadPiglets = (r: Partial<FarrowingRecord>) => (r.totalBornDead ?? 0) > 0 || (r.totalMummified ?? 0) > 0;

  function farrowingSeasonStats(recs: FarrowingRecord[]) {
    const farrowings = recs.length;
    const totalBornAll = recs.reduce((s, r) => s + totalBorn(r), 0);
    const stillborns = recs.reduce((s, r) => s + (r.totalBornDead || 0), 0);
    const mummified = recs.reduce((s, r) => s + (r.totalMummified || 0), 0);
    const perinatal = stillborns + mummified;
    const pct = (n: number) => totalBornAll > 0 ? ((n / totalBornAll) * 100).toFixed(1) : "—";
    return { farrowings, totalBornAll, stillborns, mummified, perinatal, pct };
  }
  const currentFarrowingStats = farrowingSeasonStats(records);
  const farrowingYearlyStats = availableYears.map(y => ({ year: y, ...farrowingSeasonStats(allRecords.filter(r => r.farrowingDate?.startsWith(y))) }));

  function generateFarrowingReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const fmtD = (v: unknown) => v ? new Date(v as string).toLocaleDateString("en-GB") : "—";
    const fv2 = (v: unknown) => (v === null || v === undefined || v === "") ? "—" : String(v);
    const yesNo = (v: boolean | null | undefined) => v === true ? "Yes" : v === false ? "No" : "—";

    const totalStillborns = records.reduce((s, r) => s + (r.totalBornDead || 0), 0);
    const totalMummifieds = records.reduce((s, r) => s + (r.totalMummified || 0), 0);
    const totalBornAll = records.reduce((s, r) => s + totalBorn(r), 0);
    const pctSB = totalBornAll > 0 ? ((totalStillborns / totalBornAll) * 100).toFixed(1) : "—";
    const pctMum = totalBornAll > 0 ? ((totalMummifieds / totalBornAll) * 100).toFixed(1) : "—";

    const rows = records.map(r => {
      const dead = (r.totalBornDead || 0) + (r.totalMummified || 0);
      const disposalCell = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod
        ? `${r.perinatalCollectionDate ? fmtD(r.perinatalCollectionDate) : "—"} · ${fv2(r.perinatalCollectionRef)} · ${fv2(r.perinatalDisposalMethod)}`
        : (dead > 0 ? "<span style='color:#b91c1c'>NOT RECORDED</span>" : "—");
      return `<tr>
        <td>${fmtD(r.farrowingDate)}</td>
        <td>${fv2(r.sowEarTag)}</td>
        <td>${r.parityNumber === 1 ? "Gilt" : r.parityNumber ? `P${r.parityNumber}` : "—"}</td>
        <td>${fv2(r.farrowingEase)}</td>
        <td>${totalBorn(r)}</td>
        <td>${r.totalBornAlive}</td>
        <td>${r.totalBornDead}</td>
        <td>${r.totalMummified}</td>
        <td>${r.averageBirthWeightKg ? `${r.averageBirthWeightKg} kg` : "—"}</td>
        <td>${yesNo(r.colostrumManaged)}</td>
        <td>${yesNo(r.assistanceRequired)}</td>
        <td style="font-size:9px">${disposalCell}</td>
        <td style="color:#888;font-size:9px">${fv2(r.notes).slice(0, 60)}</td>
      </tr>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><title>Farrowing Records — Red Tractor Pigs Audit</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  .stats{display:flex;gap:20px;margin-bottom:12px;flex-wrap:wrap}
  .stat{background:#f9fafb;border:1px solid #e5e7eb;border-radius:4px;padding:6px 12px;font-size:10px}
  .stat strong{display:block;font-size:12px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Farrowing Records</h1><h2>Red Tractor Pigs Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b><br>Year filter: ${yearFilter}<br>Printed: ${printedDate}</div>
</div>
<div class="stats">
  <div class="stat"><strong>${records.length}</strong>Farrowings recorded</div>
  <div class="stat"><strong>${totalStillborns} (${pctSB}%)</strong>Stillbirths</div>
  <div class="stat"><strong>${totalMummifieds} (${pctMum}%)</strong>Mummified</div>
  <div class="stat"><strong>${totalBornAll}</strong>Total piglets born</div>
</div>
<table>
  <thead><tr>
    <th>Farrowing Date</th><th>Sow Tag</th><th>Parity</th><th>Ease</th><th>Total Born</th>
    <th>Alive</th><th>Stillborn</th><th>Mummified</th><th>Avg Wt</th><th>Colostrum</th><th>Assisted</th>
    <th>ABP Disposal</th><th>Notes</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<p class="note">This farrowing records report is produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Retain for a minimum of 3 years and make available for inspection at Red Tractor Pigs audit. Printed: ${printedDate}</p>
</body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.addEventListener("afterprint", () => w.close()); w.print(); }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 gap-3">
        <div>
          <p className="text-sm text-gray-500 mb-1">Litter-level farrowing records — born alive/dead, fostering, avg birth weight, weaning performance, and sow assistance. Required for Red Tractor Pigs Standard compliance.</p>
          <p className="text-xs text-gray-400">Red Tractor Pigs: farrowing performance must be recorded and available at audit. Retain records for a minimum of 3 years.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              <SelectItem value="all">All years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={generateFarrowingReport}><FileDown className="w-4 h-4 mr-1" />Farrowing Report</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Log Farrowing</Button>
        </div>
      </div>

      {allRecords.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-5 gap-2 mb-3">
            {[
              { label: "Farrowings", value: String(currentFarrowingStats.farrowings), sub: yearFilter === "all" ? "all time" : yearFilter, colour: "" },
              { label: "Total Piglets Born", value: String(currentFarrowingStats.totalBornAll), sub: "", colour: "" },
              { label: "Stillborn", value: `${currentFarrowingStats.stillborns}`, sub: `${currentFarrowingStats.pct(currentFarrowingStats.stillborns)}% of born`, colour: currentFarrowingStats.stillborns > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50" },
              { label: "Mummified", value: `${currentFarrowingStats.mummified}`, sub: `${currentFarrowingStats.pct(currentFarrowingStats.mummified)}% of born`, colour: currentFarrowingStats.mummified > 0 ? "border-amber-200 bg-amber-50" : "border-green-200 bg-green-50" },
              { label: "Perinatal Loss", value: `${currentFarrowingStats.perinatal}`, sub: `${currentFarrowingStats.pct(currentFarrowingStats.perinatal)}% of born`, colour: currentFarrowingStats.perinatal > 0 ? "border-red-300 bg-red-50" : "border-green-200 bg-green-50" },
            ].map(s => (
              <div key={s.label} className={`rounded-lg border p-3 text-center ${s.colour || "border-gray-200 bg-gray-50"}`}>
                <p className={`text-xl font-bold ${s.colour.includes("red") ? "text-red-700" : s.colour.includes("amber") ? "text-amber-700" : s.colour.includes("green") ? "text-green-700" : "text-gray-900"}`}>{s.value}</p>
                <p className="text-xs font-medium text-gray-600 mt-0.5">{s.label}</p>
                {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
              </div>
            ))}
          </div>
          {farrowingYearlyStats.length > 1 && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year-by-Year Perinatal Mortality Trend</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Year</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Farrowings</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Total Born</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Stillborn</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Mummified</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Perinatal Loss</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {farrowingYearlyStats.map((s, i) => {
                    const maxRate = Math.max(...farrowingYearlyStats.map(x => Number(x.pct(x.perinatal)) || 0), 0.1);
                    const rate = Number(s.pct(s.perinatal)) || 0;
                    const barWidth = Math.round((rate / maxRate) * 100);
                    return (
                      <tr key={s.year} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 font-medium">{s.year}</td>
                        <td className="px-3 py-2 text-right">{s.farrowings}</td>
                        <td className="px-3 py-2 text-right">{s.totalBornAll}</td>
                        <td className="px-3 py-2 text-right">{s.stillborns} <span className="text-gray-400">({s.pct(s.stillborns)}%)</span></td>
                        <td className="px-3 py-2 text-right">{s.mummified} <span className="text-gray-400">({s.pct(s.mummified)}%)</span></td>
                        <td className={`px-3 py-2 text-right font-semibold ${rate > 8 ? "text-red-600" : rate > 4 ? "text-amber-600" : "text-green-700"}`}>{s.perinatal} ({s.pct(s.perinatal)}%)</td>
                        <td className="px-3 py-2 w-32">
                          <div className="h-3 bg-gray-100 rounded overflow-hidden">
                            <div className={`h-full rounded ${rate > 8 ? "bg-red-400" : rate > 4 ? "bg-amber-400" : "bg-green-400"}`} style={{ width: `${barWidth}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-400">Red &gt;8% perinatal loss · Amber 4–8% · Green &lt;4%. Red Tractor Pigs may query rates significantly above industry benchmarks.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading ? <Loader2 className="animate-spin w-5 h-5 text-gray-400" /> : (
        <div className="space-y-2">
          {records.length === 0 && (
            <Card><CardContent className="py-8 text-center text-gray-400 text-sm">No farrowing records yet. Log the first farrowing above.</CardContent></Card>
          )}
          {records.map(r => {
            const total = totalBorn(r);
            const rate = weaningRate(r);
            const parityLabel = r.parityNumber === 1 ? "Gilt (P1)" : r.parityNumber ? `Parity ${r.parityNumber}` : null;
            const fostering = (r.fostersIn || 0) + (r.fostersOut || 0) > 0;
            return (
              <Card key={r.id}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-medium text-sm">{fmtDate(r.farrowingDate)}</span>
                      <span className="text-sm text-gray-700 font-mono">Sow: {r.sowEarTag}</span>
                      {parityLabel && <span className="text-xs text-gray-500">{parityLabel}</span>}
                      <FarrowingEaseBadge v={r.farrowingEase} />

                      {/* Litter outcome */}
                      {total > 0 && (
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">
                          {total} born total
                        </span>
                      )}
                      {(r.totalBornAlive > 0) && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          {r.totalBornAlive} alive
                        </span>
                      )}
                      {(r.totalBornDead > 0) && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                          {r.totalBornDead} stillborn
                        </span>
                      )}
                      {(r.totalMummified > 0) && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          {r.totalMummified} mummified
                        </span>
                      )}

                      {/* Avg birth weight */}
                      {r.averageBirthWeightKg && (
                        <span className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded">
                          Avg birth {r.averageBirthWeightKg} kg
                        </span>
                      )}

                      {/* Fostering */}
                      {fostering && (
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                          Fostered {r.fostersIn > 0 ? `+${r.fostersIn}` : ""}{r.fostersOut > 0 ? ` −${r.fostersOut}` : ""}
                        </span>
                      )}

                      {/* Weaning */}
                      {r.weaningDate ? (
                        <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded">
                          Weaned {r.pigletsWeanedCount ?? "?"}{rate !== null ? ` (${rate}%)` : ""} · {fmtDate(r.weaningDate)}
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          Not yet weaned
                        </span>
                      )}

                      {/* Colostrum */}
                      {r.colostrumManaged !== null && r.colostrumManaged !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded ${r.colostrumManaged ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {r.colostrumManaged ? "Colostrum ✓" : "Colostrum not confirmed"}
                        </span>
                      )}
                      {hasDeadPiglets(r) && (
                        r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod
                          ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">ABP disposal ✓</span>
                          : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded font-medium">⚠ ABP disposal not recorded</span>
                      )}
                      {r.vetAttended && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Vet: {r.vetName || "attended"}</span>}
                      {r.expectedFarrowingDate && (() => {
                        const days = Math.floor((new Date(r.expectedFarrowingDate).getTime() - Date.now()) / 86400000);
                        return <span className={`text-xs px-2 py-0.5 rounded border ${days >= 0 && days <= 7 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}>Expected: {fmtDate(r.expectedFarrowingDate)}</span>;
                      })()}
                      {(farrowingAttachMap[r.id] ?? 0) > 0 && (
                        <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />{farrowingAttachMap[r.id]}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700" onClick={() => setViewRecord(r)}><Eye className="h-3.5 w-3.5" /></button>
                      <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></button>
                      <button className="p-1 rounded hover:bg-gray-100 text-red-300 hover:text-red-600" onClick={() => setConfirmDelete(r.id)}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  {r.notes && <p className="text-xs text-gray-400 mt-1.5">{r.notes}</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "44rem" }} className="max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Farrowing Record — {viewRecord.sowEarTag}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-2 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Farrowing Date</p><p className="font-medium">{fmtDate(viewRecord.farrowingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Expected Farrowing Date</p><p className="font-medium">{viewRecord.expectedFarrowingDate ? fmtDate(viewRecord.expectedFarrowingDate) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sow Ear Tag</p><p className="font-medium font-mono">{viewRecord.sowEarTag}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Breed</p><p className="font-medium">{viewRecord.sowBreed || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Parity</p><p className="font-medium">{viewRecord.parityNumber === 1 ? "1 — Gilt" : viewRecord.parityNumber ? `Parity ${viewRecord.parityNumber}` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Farrowing Ease</p><p className="font-medium">{viewRecord.farrowingEase || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Born Alive</p><p className="font-medium">{viewRecord.totalBornAlive}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Born Dead</p><p className="font-medium">{viewRecord.totalBornDead}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mummified</p><p className="font-medium">{viewRecord.totalMummified}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Fosters In</p><p className="font-medium">{viewRecord.fostersIn}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Fosters Out</p><p className="font-medium">{viewRecord.fostersOut}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Birth Weight</p><p className="font-medium">{viewRecord.averageBirthWeightKg ? `${viewRecord.averageBirthWeightKg} kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Colostrum Managed</p><p className="font-medium">{viewRecord.colostrumManaged === true ? "Yes ✓" : viewRecord.colostrumManaged === false ? "Not confirmed" : "—"}</p></div>
              {hasDeadPiglets(viewRecord) && (
                <div className="col-span-2 border rounded-md bg-amber-50 border-amber-200 p-3">
                  <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">ABP Perinatal Disposal (Category 3)</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Collection Date</p><p className="font-medium">{viewRecord.perinatalCollectionDate ? new Date(viewRecord.perinatalCollectionDate as string).toLocaleDateString("en-GB") : "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Consignment / NFAS Ref</p><p className="font-medium">{(viewRecord.perinatalCollectionRef as string) || "—"}</p></div>
                    <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Method</p><p className="font-medium">{(viewRecord.perinatalDisposalMethod as string) || "—"}</p></div>
                    {viewRecord.perinatalDisposalNotes && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disposal Notes</p><p className="font-medium">{viewRecord.perinatalDisposalNotes as string}</p></div>}
                  </div>
                </div>
              )}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assistance Required</p><p className="font-medium">{viewRecord.assistanceRequired ? "Yes" : "No"}</p></div>
              {viewRecord.assistanceDetails && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Assistance Details</p><p className="font-medium">{viewRecord.assistanceDetails}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Attended</p><p className="font-medium">{viewRecord.vetAttended ? "Yes" : "No"}</p></div>
              {viewRecord.vetAttended && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Name</p><p className="font-medium">{viewRecord.vetName || "—"}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Weaning Date</p><p className="font-medium">{viewRecord.weaningDate ? fmtDate(viewRecord.weaningDate) : "Not yet weaned"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Piglets Weaned</p><p className="font-medium">{viewRecord.pigletsWeanedCount ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Weaning Weight</p><p className="font-medium">{viewRecord.averageWeaningWeightKg ? `${viewRecord.averageWeaningWeightKg} kg` : "—"}</p></div>
              {!!viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes}</p></div>}
              <div className="col-span-2 border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="farrowing" recordId={viewRecord.id} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { openEdit(viewRecord); setViewRecord(null); }}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Confirm delete */}
      <Dialog open={confirmDelete !== null} onOpenChange={o => { if (!o) setConfirmDelete(null); }}>
        <DialogContent style={{ maxWidth: "22rem" }}>
          <DialogHeader><DialogTitle>Delete Farrowing Record</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently remove this farrowing record. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => confirmDelete !== null && del.mutate(confirmDelete)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) closeDialog(); }}>
        <DialogContent style={{ maxWidth: "58rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Farrowing Record" : "Log Farrowing"}</DialogTitle></DialogHeader>
          <div className="flex gap-6 py-2">

            {/* Left column: sow + litter data */}
            <div className="flex-1 flex flex-col gap-3 min-w-0">

              {/* Sow details */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sow Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Farrowing Date *</Label><Input type="date" value={form.farrowingDate?.slice(0, 10) || ""} onChange={e => set("farrowingDate", e.target.value)} /></div>
                  <div><Label>Sow Ear Tag *</Label><Input value={form.sowEarTag || ""} onChange={e => set("sowEarTag", e.target.value)} placeholder="UK ear tag" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Expected Farrowing Date</Label>
                    <Input type="date" value={form.expectedFarrowingDate?.slice(0, 10) || ""} onChange={e => set("expectedFarrowingDate", e.target.value || null)} />
                    <p className="text-xs text-muted-foreground mt-0.5">Set before birth to track in Week Ahead</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Sow Breed</Label>
                    <Select value={form.sowBreed || ""} onValueChange={v => set("sowBreed", v)}>
                      <SelectTrigger><SelectValue placeholder="Select breed" /></SelectTrigger>
                      <SelectContent>{["Large White","Landrace","Duroc","Hampshire","Pietrain","Berkshire","Oxford Sandy & Black","Welsh","British Lop","Hybrid / commercial cross","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Parity Number</Label>
                    <Input type="number" min="1" value={form.parityNumber ?? ""} onChange={e => set("parityNumber", e.target.value ? parseInt(e.target.value) : null)} placeholder="1 = gilt" />
                    <p className="text-xs text-gray-400 mt-0.5">1 = first litter (gilt)</p>
                  </div>
                </div>
                <div>
                  <Label>Farrowing Ease</Label>
                  <Select value={form.farrowingEase || "__none__"} onValueChange={v => set("farrowingEase", v === "__none__" ? null : v)}>
                    <SelectTrigger><SelectValue placeholder="Select ease score..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Not recorded</SelectItem>
                      <SelectItem value="1 — Unassisted">1 — Unassisted</SelectItem>
                      <SelectItem value="2 — Minor assistance">2 — Minor assistance (1 person)</SelectItem>
                      <SelectItem value="3 — Major assistance">3 — Major assistance</SelectItem>
                      <SelectItem value="4 — Vet required">4 — Vet required</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Litter performance */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Litter Performance</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label>Born Alive *</Label>
                    <Input type="number" min="0" value={form.totalBornAlive ?? 0} onChange={e => set("totalBornAlive", parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label>Stillbirths</Label>
                    <Input type="number" min="0" value={form.totalBornDead ?? 0} onChange={e => set("totalBornDead", parseInt(e.target.value) || 0)} />
                  </div>
                  <div>
                    <Label>Mummified</Label>
                    <Input type="number" min="0" value={form.totalMummified ?? 0} onChange={e => set("totalMummified", parseInt(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Avg Birth Weight (kg)</Label>
                    <Input type="number" step="0.01" min="0" value={form.averageBirthWeightKg ?? ""} onChange={e => set("averageBirthWeightKg", e.target.value || null)} placeholder="e.g. 1.35" />
                    <p className="text-xs text-gray-400 mt-0.5">Recommended — weigh a sample if not all. Target ≥1.2 kg.</p>
                  </div>
                  <div className="pt-4">
                    <p className="text-xs text-gray-500">
                      Total born: <strong>{(form.totalBornAlive || 0) + (form.totalBornDead || 0) + (form.totalMummified || 0)}</strong>
                    </p>
                    {(form.totalBornAlive || 0) > 0 && (form.totalBornDead || 0) > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Stillbirth rate: <strong>{Math.round(((form.totalBornDead || 0) / ((form.totalBornAlive || 0) + (form.totalBornDead || 0) + (form.totalMummified || 0))) * 100)}%</strong>
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Fosters In</Label>
                    <Input type="number" min="0" value={form.fostersIn ?? 0} onChange={e => set("fostersIn", parseInt(e.target.value) || 0)} />
                    <p className="text-xs text-gray-400 mt-0.5">Piglets moved onto this sow</p>
                  </div>
                  <div>
                    <Label>Fosters Out</Label>
                    <Input type="number" min="0" value={form.fostersOut ?? 0} onChange={e => set("fostersOut", parseInt(e.target.value) || 0)} />
                    <p className="text-xs text-gray-400 mt-0.5">Piglets moved off this sow</p>
                  </div>
                </div>
              </div>

              {/* Weaning */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Weaning</p>
                <p className="text-xs text-gray-400">Can be completed later once the litter is weaned. Minimum weaning age is 28 days (21 days with dispensation).</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Weaning Date</Label><Input type="date" value={form.weaningDate?.slice(0, 10) || ""} onChange={e => set("weaningDate", e.target.value || null)} /></div>
                  <div><Label>Piglets Weaned</Label><Input type="number" min="0" value={form.pigletsWeanedCount ?? ""} onChange={e => set("pigletsWeanedCount", e.target.value ? parseInt(e.target.value) : null)} /></div>
                </div>
                <div>
                  <Label>Avg Weaning Weight (kg)</Label>
                  <Input type="number" step="0.01" min="0" value={form.averageWeaningWeightKg ?? ""} onChange={e => set("averageWeaningWeightKg", e.target.value || null)} placeholder="e.g. 7.5" className="w-40" />
                </div>
              </div>
            </div>

            {/* Right column: assistance, colostrum, notes */}
            <div className="w-64 flex-shrink-0 flex flex-col gap-3">

              {/* Assistance */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Assistance</p>
                <div className="flex items-center gap-2">
                  <Checkbox id="farr-ar" checked={!!form.assistanceRequired} onCheckedChange={v => { set("assistanceRequired", !!v); if (!v) set("assistanceDetails", null); }} />
                  <Label htmlFor="farr-ar" className="text-sm">Assistance required</Label>
                </div>
                {form.assistanceRequired && (
                  <div>
                    <Label>Assistance Details</Label>
                    <Textarea value={form.assistanceDetails || ""} onChange={e => set("assistanceDetails", e.target.value)} rows={3} placeholder="e.g. 2 piglets presented incorrectly, manual repositioning required. Vet not needed." />
                  </div>
                )}
              </div>

              {/* Vet Attendance */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vet Attendance</p>
                <div className="flex items-center gap-2">
                  <Checkbox id="farr-vet" checked={!!form.vetAttended} onCheckedChange={v => { set("vetAttended", !!v); if (!v) { set("vetName", null); setShowManualVet(false); } }} />
                  <Label htmlFor="farr-vet" className="text-sm">Vet attended this farrowing</Label>
                </div>
                {form.vetAttended && (
                  <div className="space-y-2">
                    <Label>Vet Name <span className="text-xs text-gray-400">(for invoice reconciliation)</span></Label>
                    {!showManualVet && uniqueVetNames.length > 0 ? (
                      <div className="flex gap-2">
                        <Select value={form.vetName || "__none__"} onValueChange={v => set("vetName", v === "__none__" ? null : v)}>
                          <SelectTrigger className="flex-1"><SelectValue placeholder="Select from Vet Ledger…" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">— Select vet —</SelectItem>
                            {uniqueVetNames.map(n => (
                              <SelectItem key={n} value={n}>{n}{vetPracticeMap[n] ? ` — ${vetPracticeMap[n]}` : ""}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => setShowManualVet(true)}>Enter manually</Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input value={form.vetName || ""} onChange={e => set("vetName", e.target.value)} placeholder="Vet name…" className="flex-1" />
                        {uniqueVetNames.length > 0 && <Button variant="outline" size="sm" onClick={() => setShowManualVet(false)}>Use ledger</Button>}
                      </div>
                    )}
                    <p className="text-xs text-blue-600">Vet name is matched against the Vet Ledger for invoice reconciliation.</p>
                  </div>
                )}
              </div>

              {/* Colostrum */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Colostrum</p>
                <p className="text-xs text-gray-400">All piglets should receive colostrum within 12–24 hours of birth. Confirm management was completed.</p>
                <div className="flex items-center gap-2">
                  <Checkbox id="farr-col" checked={!!form.colostrumManaged} onCheckedChange={v => set("colostrumManaged", !!v)} />
                  <Label htmlFor="farr-col" className="text-sm">Colostrum management confirmed</Label>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-md border p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</p>
                <Textarea value={form.notes || ""} onChange={e => set("notes", e.target.value)} placeholder="Any additional observations..." rows={4} />
              </div>
            </div>
          </div>
          {hasDeadPiglets(form) && (
            <div className="border border-amber-300 bg-amber-50 rounded-md p-4 space-y-3 mt-2">
              <p className="text-sm font-semibold text-amber-800">ABP Perinatal Disposal — Category 3 (Required)</p>
              <p className="text-xs text-amber-700">Stillborn and mummified piglets are Category 3 Animal By-Product waste (Regulation (EC) 1069/2009). They must be collected by a licensed fallen stock contractor or disposed of via another approved route. Retain the collection note for at least 3 years.</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Fallen Stock Contractor</Label>
                  <Select value={form.perinatalDisposalContractorId ? String(form.perinatalDisposalContractorId) : ""} onValueChange={v => set("perinatalDisposalContractorId", v ? Number(v) : null)}>
                    <SelectTrigger><SelectValue placeholder="Select contractor…" /></SelectTrigger>
                    <SelectContent>
                      {contractors.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.approvalNumber})</SelectItem>)}
                      {contractors.length === 0 && <SelectItem value="none" disabled>No contractors set up — add in Livestock settings</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Collection Date</Label><Input type="date" value={form.perinatalCollectionDate?.slice(0, 10) || ""} onChange={e => set("perinatalCollectionDate", e.target.value)} /></div>
                <div><Label>Consignment / NFAS Reference</Label><Input value={form.perinatalCollectionRef || ""} onChange={e => set("perinatalCollectionRef", e.target.value)} placeholder="e.g. NFAS-LIN-0042-240317" /></div>
                <div><Label>Disposal Method (if no contractor)</Label><Input value={form.perinatalDisposalMethod || ""} onChange={e => set("perinatalDisposalMethod", e.target.value)} placeholder="e.g. Hunt kennels, on-farm incinerator" /></div>
              </div>
              <div><Label>Disposal Notes</Label><Input value={form.perinatalDisposalNotes || ""} onChange={e => set("perinatalDisposalNotes", e.target.value)} placeholder="Any additional disposal notes…" /></div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button disabled={save.isPending || !form.sowEarTag || !form.farrowingDate} onClick={() => save.mutate(form)}>
              {save.isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Saving…</> : editing ? "Save Changes" : "Log Farrowing"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PigRedTractorChecklistTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: allRtcRecords = [], isLoading } = useQuery({ queryKey: ["pig-rt-checklist", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-red-tractor-checklists`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const [rtcYearFilter, setRtcYearFilter] = useState("all");
  const rtcYears = useMemo(() => Array.from(new Set((allRtcRecords as Record<string,unknown>[]).map(r => String(r.assessmentDate || "").slice(0, 4)).filter(Boolean))).sort().reverse(), [allRtcRecords]);
  const records = useMemo(() => rtcYearFilter === "all" ? allRtcRecords as Record<string,unknown>[] : (allRtcRecords as Record<string,unknown>[]).filter(r => String(r.assessmentDate || "").startsWith(rtcYearFilter)), [allRtcRecords, rtcYearFilter]);
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/pig-red-tractor-checklists/${editing.id}`) : api(`farms/${farmId}/pig-red-tractor-checklists`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-rt-checklist", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/pig-red-tractor-checklists/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["pig-rt-checklist", farmId] }) });

  const BoolField = ({ label, field }: { label: string; field: string }) => (
    <div className="flex items-center gap-2">
      <Checkbox id={field} checked={Boolean(form[field])} onCheckedChange={v => setForm(f => ({ ...f, [field]: Boolean(v) }))} />
      <Label htmlFor={field} className="text-sm">{label}</Label>
    </div>
  );

  const openEdit = (r: Record<string, unknown>) => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); };

  function printRtcRecords() {
    const rows = records as Record<string,unknown>[];
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>RT Pig Checklists</title><style>body{font-family:sans-serif;font-size:12px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:4px 8px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Red Tractor Pig Compliance Checklists${rtcYearFilter !== "all" ? ` — ${rtcYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Assessor</th><th>Certificate No.</th><th>Overall Status</th><th>Next Due</th><th>Non-conformances</th></tr></thead><tbody>${rows.map(r => `<tr><td>${fmtDate(r.assessmentDate)}</td><td>${r.assessorName || "—"}</td><td>${r.certificateNumber || "—"}</td><td>${r.overallStatus || "—"}</td><td>${fmtDate(r.nextAssessmentDue)}</td><td>${r.nonConformances || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold text-sm">Red Tractor Pig Compliance Checklist</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record Red Tractor Pigs Standard self-assessment results. Each major standard area is checked to maintain farm assurance status. Assessments should be carried out at least annually or following any significant changes.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={rtcYearFilter} onValueChange={setRtcYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{rtcYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          {records.length > 0 && <Button size="sm" variant="outline" onClick={printRtcRecords}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => { setEditing(null); setForm({ assessmentDate: new Date().toISOString().slice(0, 10), overallStatus: "pass" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Assessment</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "assessmentDate", label: "Assessment Date", fmt: r => fmtDate(r.assessmentDate) },
          { key: "assessorName", label: "Assessor" },
          { key: "certificateNumber", label: "Certificate No." },
          { key: "overallStatus", label: "Overall Status" },
          { key: "nextAssessmentDue", label: "Next Due", fmt: r => fmtDate(r.nextAssessmentDue) },
          { key: "nonConformances", label: "Non-conformances" },
          { key: "doc", label: "Document", render: r => <DocAttach farmId={farmId} endpoint="pig-red-tractor-checklists" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["pig-rt-checklist", String(farmId)]} /> },
        ]}
        rows={records as Record<string, unknown>[]}
        onEdit={openEdit}
        onDelete={r => del.mutate(r.id as number)}
        onView={setViewRecord}
      />}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "54rem" }}>
            <DialogHeader><DialogTitle>View Red Tractor Pig Self-Assessment</DialogTitle></DialogHeader>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Date</p><p className="font-medium">{fmtDate(viewRecord.assessmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessor Name</p><p className="font-medium">{String(viewRecord.assessorName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate Number</p><p className="font-medium">{String(viewRecord.certificateNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Status</p><p className="font-medium uppercase">{String(viewRecord.overallStatus ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Assessment Due</p><p className="font-medium">{fmtDate(viewRecord.nextAssessmentDue)}</p></div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-4 mb-2">Compliance Items</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              {[
                ["medicinesRecorded", "Medicines & veterinary treatments recorded correctly"],
                ["withdrawalPeriodsObserved", "Withdrawal periods observed (no residue failures)"],
                ["movementsRecorded", "Pig movements / eAML2 records up to date"],
                ["feedRecordsKept", "Feed records maintained (source, batch, HACCP)"],
                ["waterQualityChecked", "Water supply quality checked / tested"],
                ["identificationCorrect", "Identification / tagging correct for all pigs"],
                ["stockmanshipChecked", "Stockmanship daily checks evidenced"],
                ["bodyConditionScored", "Body condition scored and recorded"],
                ["tailBitingRiskAssessed", "Tail biting risk assessment completed"],
                ["tailDockingJustified", "Tail docking justification documented"],
                ["boarTuskTrimmed", "Boar tusk trimming recorded"],
                ["enrichmentProvided", "Environmental enrichment provided"],
                ["ventilationAdequate", "Ventilation and thermal environment adequate"],
                ["housingStructuralOk", "Building / housing structural integrity checked"],
                ["pestControlCurrent", "Pest and vermin control records current"],
                ["biosecurityInPlace", "Biosecurity protocols in place and enforced"],
                ["casualtyDisposalCompliant", "Casualty / fallen stock disposal compliant"],
                ["vetHealthPlanReviewed", "Vet health plan reviewed within 12 months"],
                ["emergencyPlanInPlace", "Emergency plan / out-of-hours contact available"],
                ["trainingRecordsKept", "Farm training / competence records maintained"],
              ].map(([k, l]) => (
                <div key={k} className="flex justify-between items-center border-b border-gray-50 pb-0.5">
                  <span className="text-muted-foreground">{l}</span>
                  <span className={viewRecord[k] ? "text-green-600 font-medium" : "text-red-600 font-medium"}>{viewRecord[k] ? "Yes" : "No"}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3 mt-4">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Non-conformances / Observations</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.nonConformances ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Corrective Actions Required</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.correctiveActions ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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

  const allSorted = [...(treatments as Record<string, unknown>[])].sort((a, b) => String(b.treatmentDate ?? "").localeCompare(String(a.treatmentDate ?? "")));

  const medYears = useMemo(() => {
    const s = new Set<string>(allSorted.map(r => String(r.treatmentDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [allSorted]);
  const [medYearFilter, setMedYearFilter] = useState("all");
  const sorted = useMemo(() => medYearFilter === "all" ? allSorted : allSorted.filter(r => String(r.treatmentDate || "").startsWith(medYearFilter)), [allSorted, medYearFilter]);

  const activeWithdrawals = allSorted.filter(r => r.withdrawalEndDate && new Date(r.withdrawalEndDate as string) > new Date());

  const printMed = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Medicine Register</title><style>body{font-family:sans-serif;font-size:11px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:3px 6px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Pig Medicine Register${medYearFilter !== "all" ? ` — ${medYearFilter}` : ""}</h2><table><thead><tr><th>Date</th><th>Product</th><th>Animals</th><th>Route</th><th>Quantity</th><th>Vet</th><th>Withdrawal End</th><th>Reason</th></tr></thead><tbody>${sorted.map(r => `<tr><td>${fmtDate(r.treatmentDate)}</td><td>${r.medicineProductName || "—"}</td><td>${r.numberOfAnimals || "—"}</td><td>${r.administrationRoute || "—"}</td><td>${r.quantityUsed || "—"} ${r.unitOfMeasure || ""}</td><td>${r.prescribingVetName || "—"}</td><td>${fmtDate(r.withdrawalEndDate)}</td><td>${r.diagnosisReason || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

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
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold text-sm">Medicine Register — Batch / Group Level</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Records required under Veterinary Medicines Regulations 2013. Retain for minimum 5 years.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={medYearFilter} onValueChange={setMedYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{medYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printMed}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Treatment</Button>
        </div>
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
                    {!!r.flockId && <span><span className="font-medium text-foreground/70">Group:</span> {flockMap.get(String(r.flockId)) ?? fmt(r.flockId)}</span>}
                    {!!r.batchOrPenRef && <span><span className="font-medium text-foreground/70">Batch/Pen:</span> {fmt(r.batchOrPenRef)}</span>}
                    {!!r.diagnosisReason && <span className="col-span-2"><span className="font-medium text-foreground/70">Reason:</span> {fmt(r.diagnosisReason)}</span>}
                    {!!r.prescribingVetName && <span><span className="font-medium text-foreground/70">Vet:</span> {fmt(r.prescribingVetName)}</span>}
                    {!!r.productBatchNumber && <span><span className="font-medium text-foreground/70">Batch No.:</span> {fmt(r.productBatchNumber)}</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button size="icon" variant="ghost" onClick={() => setViewRecord(r)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del.mutate(r.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                </div>
              </div>
              <div className="mt-1.5 pt-1.5 border-t">
                <DocAttach farmId={farmId} endpoint="pig-medicine-treatments" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["pig-medicine-treatments", String(farmId)]} />
              </div>
            </div>
          ))}
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Medicine Treatment</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Date</p><p className="font-medium">{fmtDate(viewRecord.treatmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Animals</p><p className="font-medium">{String(viewRecord.numberOfAnimals ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Production Group / Herd</p><p className="font-medium">{flockMap.get(String(viewRecord.flockId)) ?? String(viewRecord.flockId ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Batch / Pen Reference</p><p className="font-medium">{String(viewRecord.batchOrPenRef ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Medicine Product Name</p><p className="font-medium">{String(viewRecord.medicineProductName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Active Ingredient</p><p className="font-medium">{String(viewRecord.activeIngredient ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Manufacturer</p><p className="font-medium">{String(viewRecord.manufacturer ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Batch Number</p><p className="font-medium">{String(viewRecord.productBatchNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Expiry Date</p><p className="font-medium">{fmtDate(viewRecord.expiryDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Administration Route</p><p className="font-medium">{String(viewRecord.administrationRoute ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity Used</p><p className="font-medium">{fmt(viewRecord.quantityUsed)}{viewRecord.unitOfMeasure ? ` ${String(viewRecord.unitOfMeasure)}` : ""}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Diagnosis / Reason</p><p className="font-medium">{String(viewRecord.diagnosisReason ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescribing Vet Name</p><p className="font-medium">{String(viewRecord.prescribingVetName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vet Practice</p><p className="font-medium">{String(viewRecord.prescribingVetPractice ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescription Obtained</p><p className="font-medium">{viewRecord.prescriptionObtained ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Administered By</p><p className="font-medium">{String(viewRecord.administeredBy ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal Period (Meat Days)</p><p className="font-medium">{String(viewRecord.withdrawalPeriodMeatDays ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal End Date</p><p className="font-medium">{fmtDate(viewRecord.withdrawalEndDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                <Label className="text-xs mb-1 block">Production Group / Herd</Label>
                <Select value={String(form.flockId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, flockId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select herd / group" /></SelectTrigger>
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
                {([["treatmentDate", "Treatment Date", fmtDate], ["numberOfAnimals", "Animals Treated"], ["administrationRoute", "Route"], ["quantityUsed", "Quantity Used"], ["unitOfMeasure", "Unit"], ["flockId", "Group", (v: unknown) => flockMap.get(String(v)) ?? fmt(v)], ["batchOrPenRef", "Batch/Pen Ref"], ["medicineProductName", "Product Name"], ["activeIngredient", "Active Ingredient"], ["manufacturer", "Manufacturer"], ["productBatchNumber", "Product Batch No."], ["expiryDate", "Product Expiry", fmtDate], ["diagnosisReason", "Reason / Diagnosis"], ["prescribingVetName", "Prescribing Vet"], ["prescribingVetPractice", "Vet Practice"], ["prescriptionObtained", "Prescription Obtained", (v: unknown) => v ? "Yes" : "No"], ["administeredBy", "Administered By"], ["withdrawalPeriodMeatDays", "Withdrawal (days)"], ["withdrawalEndDate", "Withdrawal End", fmtDate], ["notes", "Notes"]] as [string, string, ((v: unknown) => string)?][]).map(([key, label, fmtFn]) => {
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
              <div className="border-t pt-3"><RecordAttachments farmId={farmId} recordType="pig-medicine-treatments" recordId={viewRecord.id as number} /></div>
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
              <ComplianceCard title="Herds / Groups" icon={<PiggyBank className="w-4 h-4" />} item={summary.flocks} tab="flocks" onGoto={onGoto} />
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
  const { data: allKillRecords = [], isLoading } = useQuery<Record<string, unknown>[]>({
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

  const killYears = useMemo(() => {
    const s = new Set<string>((allKillRecords as Record<string,unknown>[]).map(r => String(r.killDate || "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort((a, b) => b.localeCompare(a));
  }, [allKillRecords]);
  const [killYearFilter, setKillYearFilter] = useState("all");
  const records = useMemo(() => killYearFilter === "all" ? allKillRecords : allKillRecords.filter(r => String(r.killDate || "").startsWith(killYearFilter)), [allKillRecords, killYearFilter]);

  const printKill = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Kill Records</title><style>body{font-family:sans-serif;font-size:11px;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:3px 6px;text-align:left}th{background:#f5f5f5}</style></head><body><h2>Pig Kill Records${killYearFilter !== "all" ? ` — ${killYearFilter}` : ""}</h2><table><thead><tr><th>Kill Date</th><th>Processor</th><th>Head</th><th>Total DW (kg)</th><th>Avg DW (kg)</th><th>P2 (mm)</th><th>Grade</th><th>Net Payment</th><th>Kill Sheet Ref</th></tr></thead><tbody>${(records as Record<string,unknown>[]).map(r => `<tr><td>${fmtDate(r.killDate)}</td><td>${r.processor || "—"}</td><td>${r.headCount || "—"}</td><td>${r.totalDeadweightKg ? parseFloat(String(r.totalDeadweightKg)).toFixed(1) : "—"}</td><td>${r.averageDeadweightKg ? parseFloat(String(r.averageDeadweightKg)).toFixed(1) : "—"}</td><td>${r.averageP2BackfatMm ? parseFloat(String(r.averageP2BackfatMm)).toFixed(1) : "—"}</td><td>${r.gradeOut || "—"}</td><td>${r.netPaymentPence ? `£${(Number(r.netPaymentPence) / 100).toFixed(2)}` : "—"}</td><td>${r.killSheetRef || "—"}</td></tr>`).join("")}</tbody></table></body></html>`);
    w.document.close(); w.print();
  };

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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <div className="text-center"><p className="text-xs text-muted-foreground">Total Head</p><p className="text-lg font-bold">{totalHead.toLocaleString()}</p></div>
          <div className="text-center"><p className="text-xs text-muted-foreground">Total Deadweight</p><p className="text-lg font-bold">{totalDeadweight.toFixed(0)} kg</p></div>
          {avgP2 > 0 && <div className="text-center"><p className="text-xs text-muted-foreground">Avg P2 Backfat</p><p className="text-lg font-bold">{avgP2.toFixed(1)} mm</p></div>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={killYearFilter} onValueChange={setKillYearFilter}>
            <SelectTrigger className="w-32 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{killYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printKill}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Kill Record</Button>
        </div>
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
              <th className="text-left py-2 pr-3">Kill Sheet Ref</th><th className="text-left py-2 pr-3">Document</th><th />
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
                  <td className="py-2 pr-3">{fmt(r.killSheetRef)}</td>
                  <td className="py-2 pr-3" onClick={e => e.stopPropagation()}>
                    <DocAttach farmId={farmId} endpoint="pig-kill-records" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["pig-kill-records", String(farmId)]} compact />
                  </td>
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
              ].map(([l, v]: [string, string]) => (
                <div key={String(l)}><p className="text-xs text-muted-foreground">{l}</p><p className="font-medium">{fmt(v)}</p></div>
              ))}
              {!!viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm">{String(viewRecord.notes)}</p></div>}
              <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="pig-kill-records" recordId={viewRecord.id as number} /></div>
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
  if ((flocks as R[]).length) addSection("Pig Herds / Groups", ["Name", "Type", "Breed", "Location", "Current Count", "Herd No.", "CPH"], (flocks as R[]).map(r => [fv(r.flockName), fv(r.productionType), fv(r.breed), fv(r.location), fv(r.currentCount), fv(r.herdNumber), fv(r.cphNumber)]));
  if ((stockmanship as R[]).length) addSection("Daily Stockmanship Checks", ["Date", "Group", "Behaviour", "Bedding", "Tail Biting", "Overall Welfare", "Action Taken"], (stockmanship as R[]).map(r => [fd(r.checkDate), fv(r.groupName), fv(r.behaviour), fv(r.beddingCondition), r.tailBitingObserved ? "Yes" : "No", fv(r.overallWelfare), fv(r.actionTaken)]));
  if ((medicine as R[]).length) addSection("Medicine Treatments", ["Date", "Group", "Product", "Diagnosis", "Route", "Qty", "Withdrawal Clear", "Vet"], (medicine as R[]).map(r => [fd(r.treatmentDate), fv(r.batchOrPenRef), fv(r.medicineProductName), fv(r.diagnosisReason), fv(r.administrationRoute), `${fv(r.quantityUsed)} ${fv(r.unitOfMeasure)}`, fd(r.withdrawalEndDate), fv(r.prescribingVetName)]));
  if ((movements as R[]).length) addSection("Pig Movements (EAML2)", ["Date", "Type", "From", "To", "Head", "EAML2 Ref", "Haulier"], (movements as R[]).map(r => [fd(r.movementDate), fv(r.movementType), `${fv(r.fromLocation)} (${fv(r.fromCph)})`, `${fv(r.toLocation)} (${fv(r.toCph)})`, fv(r.numberOfAnimals), fv(r.eaml2Reference), fv(r.transporterName)]));
  if ((fci as R[]).length) addSection("Food Chain Information (FCI)", ["Date", "Batch Ref", "Abattoir", "Pigs", "Medicines?", "WD Clear?", "Feed WD (h)", "Signed"], (fci as R[]).map(r => [fd(r.documentDate), fv(r.batchReference), fv(r.destinationAbattoir), fv(r.numberOfPigs), r.veterinaryMedicinesLast60Days ? "Yes" : "No", r.withdrawalPeriodClear ? "Yes" : "No", fv(r.feedWithdrawalHours), r.signedByFarmer ? "Yes" : "No"]));
  if ((feed as R[]).length) addSection("Feed Consumption Records", ["Date", "Group / Pen", "Feed Type", "Quantity (kg)", "Batch / Lot No."], (feed as R[]).map(r => [fd(r.consumptionDate), fv(r.penName), fv(r.feedType), fv(r.quantityKg), fv(r.batchLotNumber)]));
  if ((vet as R[]).length) addSection("Vet Health Assessments", ["Date", "Vet", "Practice", "BCS", "Lameness", "Respiratory", "Findings", "Next Review"], (vet as R[]).map(r => [fd(r.assessmentDate), fv(r.vetName), fv(r.practiceName), fv(r.bodyConditionScore), fv(r.lameness), fv(r.respiratoryHealth), String(fv(r.findings)).slice(0, 60), fd(r.nextReviewDate)]));
  if ((tailBiting as R[]).length) addSection("Tail Biting Risk Assessments", ["Date", "Assessed By", "Risk Level", "Current Biting", "Interventions", "Next Review"], (tailBiting as R[]).map(r => [fd(r.assessmentDate), fv(r.assessedBy), fv(r.riskLevel), r.currentBiting ? "Yes" : "No", String(fv(r.interventionsTaken)).slice(0, 50), fd(r.reviewDate)]));
  if ((farrowing as R[]).length) addSection("Farrowing Records", ["Date", "Sow Tag", "Parity", "Born Alive", "Stillborn", "Mummified", "Avg Birth Wt (kg)", "Ease", "Fosters In", "Fosters Out", "Weaning Date", "Piglets Weaned", "Colostrum", "ABP Disposal"], (farrowing as R[]).map(r => {
    const dead = (r.totalBornDead || 0) + (r.totalMummified || 0);
    const disposal = r.perinatalCollectionDate || r.perinatalCollectionRef || r.perinatalDisposalMethod
      ? `${r.perinatalCollectionDate ? fd(r.perinatalCollectionDate) : "—"} · ${fv(r.perinatalCollectionRef)} · ${fv(r.perinatalDisposalMethod)}`
      : (dead > 0 ? "NOT RECORDED" : "—");
    return [fd(r.farrowingDate), fv(r.sowEarTag), fv(r.parityNumber), fv(r.totalBornAlive), fv(r.totalBornDead), fv(r.totalMummified), fv(r.averageBirthWeightKg), fv(r.farrowingEase), fv(r.fostersIn), fv(r.fostersOut), fd(r.weaningDate), fv(r.pigletsWeanedCount), r.colostrumManaged ? "Yes" : r.colostrumManaged === false ? "No" : "—", disposal];
  }));
  if ((redTractor as R[]).length) addSection("Red Tractor Checklists", ["Date", "Assessor", "Overall Status", "Non-conformances", "Next Due", "Corrective Action Deadline"], (redTractor as R[]).map(r => [fd(r.assessmentDate), fv(r.assessorName), fv(r.overallStatus), fv(r.nonConformancesCount), fd(r.nextAssessmentDue), fd(r.correctiveActionDeadline)]));
  if ((killRecords as R[]).length) addSection("Abattoir Kill Records", ["Kill Date", "Processor", "Head", "Total DW (kg)", "Avg DW (kg)", "P2 (mm)", "Grade", "Net Payment", "Kill Sheet Ref"], (killRecords as R[]).map(r => [fd(r.killDate), fv(r.processor), fv(r.headCount), r.totalDeadweightKg ? parseFloat(String(r.totalDeadweightKg)).toFixed(1) : "—", r.averageDeadweightKg ? parseFloat(String(r.averageDeadweightKg)).toFixed(1) : "—", r.averageP2BackfatMm ? parseFloat(String(r.averageP2BackfatMm)).toFixed(1) : "—", fv(r.gradeOut), fp(r.netPaymentPence), fv(r.killSheetRef)]));

  const safeFarmId = String(farmId).replace(/[^a-z0-9]/gi, "");
  doc.save(`pig-audit-report-farm${safeFarmId}-${today.replace(/\//g, "-")}.pdf`);
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────────
const PIG_COLORS = ["#15803d","#a16207","#1d4ed8","#b91c1c","#7c3aed","#0e7490"];

function PigAnalyticsTab({ farmId }: { farmId: number }) {
  const { data: farrowingRaw } = useQuery({ queryKey: ["pig-farrowing", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-farrowing-records`), { credentials: "include" }).then(r => r.json()) });
  const { data: movementsRaw } = useQuery({ queryKey: ["pig-movements", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-movements`), { credentials: "include" }).then(r => r.json()) });
  const { data: feedRaw } = useQuery({ queryKey: ["pig-feed", farmId], queryFn: () => fetch(api(`farms/${farmId}/pig-feed-consumption`), { credentials: "include" }).then(r => r.json()) });

  const farrowing: Record<string, unknown>[] = useMemo(() => farrowingRaw?.records ?? farrowingRaw ?? [], [farrowingRaw]);
  const movements: Record<string, unknown>[] = useMemo(() => movementsRaw?.records ?? movementsRaw ?? [], [movementsRaw]);
  const feed: Record<string, unknown>[] = useMemo(() => feedRaw?.records ?? feedRaw ?? [], [feedRaw]);

  const avgBornAlive = useMemo(() => {
    const valid = farrowing.filter(r => r.pigletsBornAlive);
    return valid.length ? (valid.reduce((s, r) => s + Number(r.pigletsBornAlive), 0) / valid.length).toFixed(1) : null;
  }, [farrowing]);

  const avgWeaned = useMemo(() => {
    const valid = farrowing.filter(r => r.pigletsWeaned);
    return valid.length ? (valid.reduce((s, r) => s + Number(r.pigletsWeaned), 0) / valid.length).toFixed(1) : null;
  }, [farrowing]);

  const preWeanMortPct = useMemo(() => {
    const bornAliveTotal = farrowing.reduce((s, r) => s + (Number(r.pigletsBornAlive) || 0), 0);
    const weanedTotal = farrowing.reduce((s, r) => s + (Number(r.pigletsWeaned) || 0), 0);
    return bornAliveTotal > 0 ? (((bornAliveTotal - weanedTotal) / bornAliveTotal) * 100).toFixed(1) : null;
  }, [farrowing]);

  const farrowingByMonth = useMemo(() => {
    const map: Record<string, { farrowings: number; bornAlive: number; weaned: number }> = {};
    farrowing.forEach(r => {
      const d = String(r.farrowingDate || r.date || "");
      const k = d.slice(0, 7); if (!k || k.length < 7) return;
      if (!map[k]) map[k] = { farrowings: 0, bornAlive: 0, weaned: 0 };
      map[k].farrowings++;
      map[k].bornAlive += Number(r.pigletsBornAlive) || 0;
      map[k].weaned += Number(r.pigletsWeaned) || 0;
    });
    return Object.entries(map).sort().slice(-12).map(([m, d]) => ({ month: m.slice(5), ...d }));
  }, [farrowing]);

  const movementTypes = useMemo(() => {
    const map: Record<string, number> = {};
    movements.forEach(r => { const t = String(r.movementType || r.type || "Unknown"); map[t] = (map[t] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [movements]);

  const noData = farrowing.length === 0 && movements.length === 0;
  if (noData) return (
    <div className="text-center py-16 text-muted-foreground text-sm">
      <TrendingUp className="w-8 h-8 mx-auto mb-3 opacity-30" />
      <p className="font-medium">No data yet</p>
      <p className="text-xs mt-1">Add farrowing or movement records to see analytics.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Farrowing Records", value: farrowing.length, bg: "bg-pink-50 border-pink-100", text: "text-pink-800", sub: "text-pink-700" },
          { label: "Avg Born Alive", value: avgBornAlive ?? "—", bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
          { label: "Avg Pigs Weaned", value: avgWeaned ?? "—", bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
          { label: "Pre-wean Mortality", value: preWeanMortPct ? `${preWeanMortPct}%` : "—", bg: "bg-red-50 border-red-100", text: "text-red-800", sub: "text-red-700" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl border p-4 text-center`}>
            <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            <p className={`text-xs mt-0.5 ${c.sub}`}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {farrowingByMonth.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Monthly Farrowings</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={farrowingByMonth} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend iconSize={10} />
                  <Bar yAxisId="left" dataKey="bornAlive" name="Born Alive" fill="#15803d" radius={[3,3,0,0]} />
                  <Bar yAxisId="left" dataKey="weaned" name="Weaned" fill="#a16207" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {movementTypes.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Movement Types</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={movementTypes} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {movementTypes.map((_, i) => <Cell key={i} fill={PIG_COLORS[i % PIG_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} records`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {feed.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-3">Feed Consumption Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold">{feed.length}</p><p className="text-xs text-muted-foreground">Feed Records</p></div>
            <div><p className="text-2xl font-bold">{feed.reduce((s, r) => s + (Number(r.quantityKg) || Number(r.quantity) || 0), 0).toFixed(0)}</p><p className="text-xs text-muted-foreground">Total kg Consumed</p></div>
            <div><p className="text-2xl font-bold">{[...new Set(feed.map(r => r.feedType || r.feedName).filter(Boolean))].length}</p><p className="text-xs text-muted-foreground">Feed Types Used</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
type Tab = "overview" | "flocks" | "movements" | "medicine" | "fci" | "feed" | "vet" | "stockmanship" | "tail-biting" | "farrowing" | "red-tractor" | "kill-records" | "salmonella" | "analytics";

export default function PigProductionPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>(() => { const p = new URLSearchParams(window.location.search); const t = p.get("tab") as Tab | null; const valid: Tab[] = ["overview","flocks","movements","medicine","fci","feed","vet","stockmanship","tail-biting","farrowing","red-tractor","kill-records","salmonella","analytics"]; return t && valid.includes(t) ? t : "overview"; });
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
            <TabButton active={tab === "flocks"} onClick={() => setTab("flocks")}><PiggyBank className="w-3.5 h-3.5 mr-1" />Herds / Groups</TabButton>
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
            <TabButton active={tab === "salmonella"} onClick={() => setTab("salmonella")}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Salmonella</TabButton>
            <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}><TrendingUp className="w-3.5 h-3.5 mr-1" />Analytics</TabButton>
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
          {tab === "salmonella" && <SalmonellaMonitoringTab farmId={farmId} />}
          {tab === "analytics" && <PigAnalyticsTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}

// ─── Salmonella Monitoring Tab ────────────────────────────────────────────────
const SALM_SAMPLE_TYPES = [
  { value: "blood_serology", label: "Blood Serology (ELISA)" },
  { value: "meat_juice_elisa", label: "Meat Juice ELISA (post-slaughter)" },
  { value: "faecal_pooled", label: "Pooled Faecal Sample" },
  { value: "environmental", label: "Environmental Swab" },
];
const SALM_CATEGORIES = [1, 2, 3, 4, 5];

function SalmonellaMonitoringTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [yearFilter, setYearFilter] = useState<string>("all");

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["pig-salmonella-monitoring", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/pig-salmonella-monitoring`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });

  const { data: flocksData } = useQuery({
    queryKey: ["pig-flocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/pig-flocks`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const flocks: any[] = Array.isArray(flocksData) ? flocksData : (flocksData?.records ?? []);

  const salmYears = useMemo(() => Array.from(new Set((records as any[]).map((r: any) => String(r.samplingPeriodStart ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredSalm = useMemo(() => yearFilter === "all" ? records as any[] : (records as any[]).filter((r: any) => String(r.samplingPeriodStart ?? "").startsWith(yearFilter)), [records, yearFilter]);

  function openAdd() { setEditing(null); setForm({ sampleType: "meat_juice_elisa", actionRequired: false }); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setOpen(true); }

  const save = useMutation({
    mutationFn: (body: any) => {
      const url = editing ? api(`farms/${farmId}/pig-salmonella-monitoring/${editing.id}`) : api(`farms/${farmId}/pig-salmonella-monitoring`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-salmonella-monitoring", farmId] }); setOpen(false); setForm({ sampleType: "meat_juice_elisa", actionRequired: false }); setEditing(null); },
  });

  function printSalmonella() {
    const fmtD = (d: any) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const trs = filteredSalm.map((r: any) => `<tr><td>${fmtD(r.samplingPeriodStart)}${r.samplingPeriodEnd ? `–${fmtD(r.samplingPeriodEnd)}` : ""}</td><td>${flocks.find((f: any) => f.id === r.pigFlockId)?.flockName ?? "—"}</td><td>${SALM_SAMPLE_TYPES.find(t => t.value === r.sampleType)?.label ?? r.sampleType}</td><td>${r.sampleCount ?? "—"}</td><td>${r.positiveCount ?? 0}</td><td>${r.seroprevalence != null ? `${r.seroprevalence}%` : "—"}</td><td>Category ${r.salmonellaCategory ?? "—"}</td><td>${r.actionRequired ? "Yes" : "No"}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Salmonella Monitoring</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>Salmonella Monitoring Register${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>NSMP · ${filteredSalm.length} record${filteredSalm.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Sampling Period</th><th>Flock</th><th>Sample Type</th><th>Samples</th><th>Positive</th><th>Seroprevalence</th><th>Category</th><th>Action Required</th></tr></thead><tbody>${trs}</tbody></table></body></html>`;
    openPrintWindow(html);
  }

  async function del(id: number) {
    if (!confirm("Delete this Salmonella monitoring record?")) return;
    await fetch(api(`farms/${farmId}/pig-salmonella-monitoring/${id}`), { method: "DELETE", credentials: "include" });
    qc.invalidateQueries({ queryKey: ["pig-salmonella-monitoring", farmId] });
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const catBadge = (cat: number | null) => {
    if (!cat) return <span className="text-gray-400">—</span>;
    const colours = ["", "bg-green-100 text-green-800", "bg-green-100 text-green-800", "bg-amber-100 text-amber-800", "bg-red-100 text-red-800", "bg-red-200 text-red-900"];
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[cat]}`}>Category {cat}</span>;
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between mb-4 gap-2">
        <div>
          <h3 className="font-semibold text-gray-900">Salmonella Monitoring Register</h3>
          <p className="text-xs text-gray-500 mt-0.5">NSMP requires quarterly testing of finishing pigs. Red Tractor Pigs requires documented monitoring with serological category results.</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{salmYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
          {filteredSalm.length > 0 && <Button size="sm" variant="outline" onClick={printSalmonella}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>}
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Monitoring Record</Button>
        </div>
      </div>

      {isLoading ? <div className="text-center py-8 text-gray-400 text-sm">Loading…</div> : filteredSalm.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="font-medium text-gray-600">No Salmonella monitoring records yet</p>
          <p className="text-sm text-gray-400 mt-1">Record quarterly NSMP sampling results here. Category 1–2 is the Red Tractor target.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50">
              <tr>{["Sampling Period","Flock","Sample Type","Samples","Positive","Seroprevalence","Category","Change","Action Required","Doc",""].map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {filteredSalm.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{fmtDate(r.samplingPeriodStart)}{r.samplingPeriodEnd ? `–${fmtDate(r.samplingPeriodEnd)}` : ""}</td>
                  <td className="px-3 py-2">{flocks.find((f: any) => f.id === r.pigFlockId)?.flockName ?? "—"}</td>
                  <td className="px-3 py-2">{SALM_SAMPLE_TYPES.find(t => t.value === r.sampleType)?.label ?? r.sampleType}</td>
                  <td className="px-3 py-2">{r.sampleCount ?? "—"}</td>
                  <td className="px-3 py-2">{r.positiveCount ?? 0}</td>
                  <td className="px-3 py-2">{r.seroprevalence != null ? `${r.seroprevalence}%` : "—"}</td>
                  <td className="px-3 py-2">{catBadge(r.salmonellaCategory)}</td>
                  <td className="px-3 py-2">{r.categoryChange ? <span className={`text-xs font-medium ${r.categoryChange === "improved" ? "text-green-700" : r.categoryChange === "worsened" ? "text-red-700" : "text-gray-500"}`}>{r.categoryChange.charAt(0).toUpperCase() + r.categoryChange.slice(1)}</span> : "—"}</td>
                  <td className="px-3 py-2">{r.actionRequired ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                  <td className="px-3 py-2">
                    <DocAttach farmId={farmId} endpoint="pig-salmonella-monitoring" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["pig-salmonella-monitoring", String(farmId)]} compact />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => del(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Salmonella Monitoring Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Sampling Period Start *</Label><Input type="date" value={form.samplingPeriodStart || ""} onChange={e => set("samplingPeriodStart", e.target.value)} /></div>
            <div><Label>Sampling Period End</Label><Input type="date" value={form.samplingPeriodEnd || ""} onChange={e => set("samplingPeriodEnd", e.target.value)} /></div>
            <div><Label>Pig Flock</Label>
              <Select value={String(form.pigFlockId || "__none__")} onValueChange={v => set("pigFlockId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select flock" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— All flocks</SelectItem>{flocks.map((f: any) => <SelectItem key={f.id} value={String(f.id)}>{f.flockName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Sample Type *</Label>
              <Select value={form.sampleType || "meat_juice_elisa"} onValueChange={v => set("sampleType", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SALM_SAMPLE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Sample Count</Label><Input type="number" min="0" value={form.sampleCount ?? ""} onChange={e => set("sampleCount", e.target.value)} /></div>
            <div><Label>Positive Count</Label><Input type="number" min="0" value={form.positiveCount ?? 0} onChange={e => set("positiveCount", e.target.value)} /></div>
            <div><Label>Seroprevalence (%)</Label><Input type="number" step="0.1" min="0" max="100" value={form.seroprevalence ?? ""} onChange={e => set("seroprevalence", e.target.value)} /></div>
            <div><Label>Lab Name</Label><Input value={form.labName || ""} onChange={e => set("labName", e.target.value)} /></div>
            <div><Label>Lab Reference</Label><Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} /></div>
            <div><Label>Salmonella Category (1–5)</Label>
              <Select value={String(form.salmonellaCategory || "__none__")} onValueChange={v => set("salmonellaCategory", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— Not yet determined</SelectItem>{SALM_CATEGORIES.map(c => <SelectItem key={c} value={String(c)}>Category {c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Previous Category</Label>
              <Select value={String(form.previousCategory || "__none__")} onValueChange={v => set("previousCategory", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Previous period" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— N/A</SelectItem>{SALM_CATEGORIES.map(c => <SelectItem key={c} value={String(c)}>Category {c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Category Change</Label>
              <Select value={form.categoryChange || "__none__"} onValueChange={v => set("categoryChange", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select change" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— N/A</SelectItem><SelectItem value="improved">Improved</SelectItem><SelectItem value="unchanged">Unchanged</SelectItem><SelectItem value="worsened">Worsened</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input type="checkbox" id="actreq" checked={!!form.actionRequired} onChange={e => set("actionRequired", e.target.checked)} className="rounded" />
              <Label htmlFor="actreq">Action Required</Label>
            </div>
            <div><Label>Next Sampling Due</Label><Input type="date" value={form.nextSamplingDue || ""} onChange={e => set("nextSamplingDue", e.target.value)} /></div>
            <div className="col-span-2"><Label>Actions Taken</Label><Textarea rows={2} value={form.actionsTaken || ""} onChange={e => set("actionsTaken", e.target.value)} placeholder="Cleaning, biosecurity, feed changes, vet review…" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>{editing ? "Save Changes" : "Add Record"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
