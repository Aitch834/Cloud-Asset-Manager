// @ts-nocheck
import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Eye, Scale, Bug, ClipboardList, AlertTriangle, Printer } from "lucide-react";
import { openPrintWindow } from "@/lib/print-report";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { Checkbox } from "@/components/ui/checkbox";

const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
const fmtNum = (v: unknown, dp = 1) => (v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp));
const gbp = (v: unknown) => (v == null || v === "" ? "—" : `£${parseFloat(String(v)).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`);

function Empty({ msg }: { msg: string }) {
  return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>;
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DataTable({ cols, rows, onEdit, onDelete, onView }: {
  cols: { key: string; label: string; render?: (r: Record<string, unknown>) => ReactNode }[];
  rows: Record<string, unknown>[];
  onEdit?: (r: Record<string, unknown>) => void;
  onDelete?: (r: Record<string, unknown>) => void;
  onView?: (r: Record<string, unknown>) => void;
}) {
  const [pending, setPending] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet. Add one using the button above." />;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete || onView) && <th />}</tr></thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.render ? c.render(row) : fmt(row[c.key])}</td>)}
              {(onEdit || onDelete || onView) && (
                <td className="py-2 text-right space-x-1 whitespace-nowrap">
                  {onView && <Button size="icon" variant="ghost" onClick={() => onView(row)}><Eye className="w-3.5 h-3.5" /></Button>}
                  {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
                  {onDelete && <Button size="icon" variant="ghost" onClick={() => setPending(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
                </td>
              )}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <ConfirmDialog open={!!pending} title="Delete Record" message="Are you sure? This cannot be undone." onConfirm={() => { if (pending && onDelete) onDelete(pending); setPending(null); }} onCancel={() => setPending(null)} />
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

// ─── HERDS PANEL (read-only) ──────────────────────────────────────────────────
function HerdsTab({ farmId }: { farmId: number }) {
  const { data: herds = [], isLoading } = useQuery({
    queryKey: ["goat-herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/goat-herds`), { credentials: "include" }).then(r => r.json()),
  });
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Herds are managed in Livestock → Herds &amp; Animals.</strong><br />
        Records in the tabs below link to those herds. To create, edit, or archive a herd, use the Livestock module.
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Registered Goat Herds <span className="font-normal text-muted-foreground">({(herds as Record<string, unknown>[]).length})</span></h3>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "flockName", label: "Name" },
            { key: "breed", label: "Breed" },
            { key: "flockPurpose", label: "Type / Purpose" },
            { key: "herdFlockNumber", label: "Herd No." },
            { key: "status", label: "Status", render: r => <Badge variant={r.status === "active" ? "default" : "secondary"}>{fmt(r.status)}</Badge> },
          ]}
          rows={herds as Record<string, unknown>[]}
        />
      )}
    </div>
  );
}

// ─── MATING TAB ───────────────────────────────────────────────────────────────
function MatingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["goat-mating", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-mating-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/goat-mating-records/${editing.id}`) : api(`farms/${farmId}/goat-mating-records`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-mating", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-mating-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["goat-mating", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  function openAdd() { setEditing(null); setForm({ progesteroneSpongeUsed: "false", matingMethod: "natural" }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }

  function printMatingRecords() {
    const tableRows = (rows as Record<string, unknown>[]).map(r => `<tr>
      <td>${fmtDate(r.matingStartDate)}</td>
      <td>${fmtDate(r.matingEndDate)}</td>
      <td>${fmt(r.buckBreed)}</td>
      <td>${fmt(r.buckEarTag)}</td>
      <td>${fmt(r.doesExposed)}</td>
      <td>${fmtDate(r.expectedKiddingDate)}</td>
      <td>${fmt(r.matingMethod)}</td>
      <td>${r.progesteroneSpongeUsed === "true" || r.progesteroneSpongeUsed === true ? "Yes" : "No"}</td>
      <td>${fmt(r.notes)}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Goat Mating Records</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style>
</head><body>
<h1>Goat Mating Records</h1>
<h2>Goat Production · ${(rows as Record<string, unknown>[]).length} record${(rows as Record<string, unknown>[]).length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Start Date</th><th>End Date</th><th>Buck Breed</th><th>Buck Tag</th><th>Does Exposed</th><th>Expected Kidding</th><th>Method</th><th>CIDR/Sponge</th><th>Notes</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<p class="footer">Mating records should be retained for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Mating Records</h3>
        <div className="flex gap-2">
          {(rows as Record<string, unknown>[]).length > 0 && <Button size="sm" variant="outline" onClick={printMatingRecords}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "matingStartDate", label: "Start Date", render: r => fmtDate(r.matingStartDate) },
            { key: "matingEndDate", label: "End Date", render: r => fmtDate(r.matingEndDate) },
            { key: "buckBreed", label: "Buck Breed" },
            { key: "buckEarTag", label: "Buck Tag" },
            { key: "doesExposed", label: "Does Exposed" },
            { key: "expectedKiddingDate", label: "Expected Kidding", render: r => fmtDate(r.expectedKiddingDate) },
          ]}
          rows={rows}
          onView={setViewing}
          onEdit={openEdit}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Mating Record Details</DialogTitle></DialogHeader>
          {viewing && <div className="grid grid-cols-2 gap-3 text-sm">
            {[["Start Date", fmtDate(viewing.matingStartDate)], ["End Date", fmtDate(viewing.matingEndDate)], ["Buck Breed", fmt(viewing.buckBreed)], ["Buck Ear Tag", fmt(viewing.buckEarTag)], ["Buck Owner", fmt(viewing.buckOwner)], ["Buck Hired/Owned", fmt(viewing.buckHiredOrOwned)], ["Does Exposed", fmt(viewing.doesExposed)], ["Mating Method", fmt(viewing.matingMethod)], ["CIDR / Sponge Used", viewing.progesteroneSpongeUsed ? "Yes" : "No"], ["Expected Kidding Date", fmtDate(viewing.expectedKiddingDate)]].map(([label, value]) => (
              <div key={String(label)}><span className="text-muted-foreground">{label}:</span> <span className="font-medium">{String(value)}</span></div>
            ))}
            {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Mating Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date *"><Input type="date" value={form.matingStartDate ?? ""} onChange={e => sf("matingStartDate", e.target.value)} /></Field>
            <Field label="End Date"><Input type="date" value={form.matingEndDate ?? ""} onChange={e => sf("matingEndDate", e.target.value)} /></Field>
            <Field label="Buck Breed">
              <Select value={form.buckBreed ?? ""} onValueChange={v => sf("buckBreed", v)}>
                <SelectTrigger><SelectValue placeholder="Select breed..." /></SelectTrigger>
                <SelectContent>{["Boer","Kiko","Savanna","Spanish","Nubian","Anglo-Nubian","Cashmere","Pygmy","Pygmy x","Crossbred","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Buck Ear Tag"><Input value={form.buckEarTag ?? ""} onChange={e => sf("buckEarTag", e.target.value)} /></Field>
            <Field label="Buck Owner"><Input value={form.buckOwner ?? ""} onChange={e => sf("buckOwner", e.target.value)} /></Field>
            <Field label="Buck Hired or Owned">
              <Select value={form.buckHiredOrOwned ?? ""} onValueChange={v => sf("buckHiredOrOwned", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["owned","hired"].map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Does Exposed"><Input type="number" value={form.doesExposed ?? ""} onChange={e => sf("doesExposed", e.target.value)} /></Field>
            <Field label="Mating Method">
              <Select value={form.matingMethod ?? ""} onValueChange={v => sf("matingMethod", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["natural","AI (fresh)","AI (frozen)","ET"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Expected Kidding Date"><Input type="date" value={form.expectedKiddingDate ?? ""} onChange={e => sf("expectedKiddingDate", e.target.value)} /></Field>
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox checked={form.progesteroneSpongeUsed === "true"} onCheckedChange={v => sf("progesteroneSpongeUsed", v ? "true" : "false")} id="sponge" />
              <Label htmlFor="sponge">CIDR / Progesterone sponge used</Label>
            </div>
            <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form })} disabled={save.isPending}>{save.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : null}{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── SCANNING TAB ─────────────────────────────────────────────────────────────
function ScanningTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["goat-scanning", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-scanning-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/goat-scanning-records/${editing.id}`) : api(`farms/${farmId}/goat-scanning-records`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-scanning", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-scanning-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["goat-scanning", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function printScanningRecords() {
    const tableRows = (rows as Record<string, unknown>[]).map(r => `<tr>
      <td>${fmtDate(r.scanDate)}</td>
      <td>${fmt(r.scannerName)}</td>
      <td>${fmt(r.totalDoesScanned)}</td>
      <td>${fmt(r.doesBarren)}</td>
      <td>${fmt(r.doesSingles)}</td>
      <td>${fmt(r.doesDoubles)}</td>
      <td>${fmt(r.doesTriples)}</td>
      <td>${fmt(r.scanningPercentage)}%</td>
      <td>${fmt(r.expectedTotalKids)}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Goat Scanning Records</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Goat Pregnancy Scanning Records</h1>
<h2>Goat Production · ${(rows as Record<string, unknown>[]).length} record${(rows as Record<string, unknown>[]).length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Scan Date</th><th>Scanner</th><th>Does Scanned</th><th>Barren</th><th>Singles</th><th>Doubles</th><th>Triplets</th><th>Scanning %</th><th>Expected Kids</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<p class="footer">Pregnancy scanning records should be retained for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Pregnancy Scanning Records</h3>
        <div className="flex gap-2">
          {(rows as Record<string, unknown>[]).length > 0 && <Button size="sm" variant="outline" onClick={printScanningRecords}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "scanDate", label: "Scan Date", render: r => fmtDate(r.scanDate) },
            { key: "scannerName", label: "Scanner" },
            { key: "totalDoesScanned", label: "Scanned" },
            { key: "doesBarren", label: "Barren" },
            { key: "doesSingles", label: "Singles" },
            { key: "doesDoubles", label: "Doubles" },
            { key: "scanningPercentage", label: "Scanning %" },
            { key: "expectedTotalKids", label: "Expected Kids" },
          ]}
          rows={rows}
          onView={setViewing}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Scanning Record</DialogTitle></DialogHeader>
          {viewing && <div className="grid grid-cols-2 gap-3 text-sm">
            {[["Scan Date", fmtDate(viewing.scanDate)], ["Scanner", fmt(viewing.scannerName)], ["Scanner Company", fmt(viewing.scannerCompany)], ["Does Scanned", fmt(viewing.totalDoesScanned)], ["Barren", fmt(viewing.doesBarren)], ["Singles", fmt(viewing.doesSingles)], ["Doubles", fmt(viewing.doesDoubles)], ["Triplets", fmt(viewing.doesTriples)], ["Scanning %", fmt(viewing.scanningPercentage)], ["Expected Kids", fmt(viewing.expectedTotalKids)]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
            {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Scanning Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Scan Date *"><Input type="date" value={form.scanDate ?? ""} onChange={e => sf("scanDate", e.target.value)} /></Field>
            <Field label="Scanner Name"><Input value={form.scannerName ?? ""} onChange={e => sf("scannerName", e.target.value)} /></Field>
            <Field label="Scanner Company"><Input value={form.scannerCompany ?? ""} onChange={e => sf("scannerCompany", e.target.value)} /></Field>
            <Field label="Does Scanned *"><Input type="number" value={form.totalDoesScanned ?? ""} onChange={e => sf("totalDoesScanned", e.target.value)} /></Field>
            <Field label="Barren"><Input type="number" value={form.doesBarren ?? ""} onChange={e => sf("doesBarren", e.target.value)} /></Field>
            <Field label="Scanning %"><Input type="number" step="0.1" value={form.scanningPercentage ?? ""} onChange={e => sf("scanningPercentage", e.target.value)} /></Field>
            <Field label="Singles"><Input type="number" value={form.doesSingles ?? ""} onChange={e => sf("doesSingles", e.target.value)} /></Field>
            <Field label="Doubles"><Input type="number" value={form.doesDoubles ?? ""} onChange={e => sf("doesDoubles", e.target.value)} /></Field>
            <Field label="Triplets"><Input type="number" value={form.doesTriples ?? ""} onChange={e => sf("doesTriples", e.target.value)} /></Field>
            <Field label="Expected Kids Total"><Input type="number" value={form.expectedTotalKids ?? ""} onChange={e => sf("expectedTotalKids", e.target.value)} /></Field>
            <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form })} disabled={save.isPending}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── WEIGH-IN TAB ─────────────────────────────────────────────────────────────
function WeighTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["goat-weigh", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-weigh-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/goat-weigh-records/${editing.id}`) : api(`farms/${farmId}/goat-weigh-records`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-weigh", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-weigh-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["goat-weigh", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function printWeighRecords() {
    const tableRows = (rows as Record<string, unknown>[]).map(r => `<tr>
      <td>${fmtDate(r.weighDate)}</td>
      <td>${fmt(r.ageClassWeighed)}</td>
      <td>${fmt(r.numberWeighed)}</td>
      <td>${fmtNum(r.averageWeightKg)}</td>
      <td>${fmtNum(r.targetWeightKg)}</td>
      <td>${fmtNum(r.dlwgGPerDay, 0)}</td>
      <td>${fmt(r.bodyConditionScore)}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Goat Weigh-in & Performance Records</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Goat Weigh-in &amp; Performance Records</h1>
<h2>Goat Production · ${(rows as Record<string, unknown>[]).length} record${(rows as Record<string, unknown>[]).length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Category</th><th>Count</th><th>Avg Wt (kg)</th><th>Target (kg)</th><th>DLWG (g/day)</th><th>BCS</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<p class="footer">Weight records and body condition scores must be maintained to demonstrate welfare monitoring. Retain for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Weigh-in & Performance Records</h3>
        <div className="flex gap-2">
          {(rows as Record<string, unknown>[]).length > 0 && <Button size="sm" variant="outline" onClick={printWeighRecords}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Weigh</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "weighDate", label: "Date", render: r => fmtDate(r.weighDate) },
            { key: "ageClassWeighed", label: "Category" },
            { key: "numberWeighed", label: "Count" },
            { key: "averageWeightKg", label: "Avg Wt (kg)", render: r => fmtNum(r.averageWeightKg) },
            { key: "dlwgGPerDay", label: "DLWG (g/day)", render: r => fmtNum(r.dlwgGPerDay) },
            { key: "bodyConditionScore", label: "BCS" },
          ]}
          rows={rows}
          onView={setViewing}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Weigh-in Record</DialogTitle></DialogHeader>
          {viewing && <div className="grid grid-cols-2 gap-3 text-sm">
            {[["Date", fmtDate(viewing.weighDate)], ["Weigh Type", fmt(viewing.weighType)], ["Weighed By", fmt(viewing.weighedBy)], ["Category", fmt(viewing.ageClassWeighed)], ["Animals Weighed", fmt(viewing.numberWeighed)], ["Avg Weight (kg)", fmtNum(viewing.averageWeightKg)], ["Lowest (kg)", fmtNum(viewing.lowestWeightKg)], ["Highest (kg)", fmtNum(viewing.highestWeightKg)], ["Target (kg)", fmtNum(viewing.targetWeightKg)], ["DLWG (g/day)", fmtNum(viewing.dlwgGPerDay)], ["Days Since Last", fmt(viewing.daysSincePreviousWeigh)], ["BCS", fmt(viewing.bodyConditionScore)]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
            {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
          </div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <Button size="sm" variant="outline" className="text-purple-700 border-purple-200 hover:bg-purple-50" onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }}><ClipboardList className="w-3.5 h-3.5 mr-1" />Raise Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Goat Weigh Review — ${raiseTaskFor.ageClassWeighed ?? "Batch"}`}
          defaultDescription={`Avg weight: ${raiseTaskFor.averageWeightKg ?? "—"} kg · DLWG: ${raiseTaskFor.dlwgGPerDay ?? "—"} g/day · BCS: ${raiseTaskFor.bodyConditionScore ?? "—"}`}
          module="goat"
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Weigh Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weigh Date *"><Input type="date" value={form.weighDate ?? ""} onChange={e => sf("weighDate", e.target.value)} /></Field>
            <Field label="Weigh Type">
              <Select value={form.weighType ?? ""} onValueChange={v => sf("weighType", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["routine","pre-sale","pre-weaning","post-weaning","draft check","BCS check"].map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Animal Category">
              <Select value={form.ageClassWeighed ?? ""} onValueChange={v => sf("ageClassWeighed", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Kids (pre-weaning)","Kids (post-weaning)","Young does","Does (adult)","Bucks","Cull does","Cull bucks"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Weighed By"><Input value={form.weighedBy ?? ""} onChange={e => sf("weighedBy", e.target.value)} /></Field>
            <Field label="Number Weighed *"><Input type="number" value={form.numberWeighed ?? ""} onChange={e => sf("numberWeighed", e.target.value)} /></Field>
            <Field label="Avg Weight (kg)"><Input type="number" step="0.1" value={form.averageWeightKg ?? ""} onChange={e => sf("averageWeightKg", e.target.value)} /></Field>
            <Field label="Lowest (kg)"><Input type="number" step="0.1" value={form.lowestWeightKg ?? ""} onChange={e => sf("lowestWeightKg", e.target.value)} /></Field>
            <Field label="Highest (kg)"><Input type="number" step="0.1" value={form.highestWeightKg ?? ""} onChange={e => sf("highestWeightKg", e.target.value)} /></Field>
            <Field label="Target Weight (kg)"><Input type="number" step="0.1" value={form.targetWeightKg ?? ""} onChange={e => sf("targetWeightKg", e.target.value)} /></Field>
            <Field label="DLWG (g/day)"><Input type="number" step="1" value={form.dlwgGPerDay ?? ""} onChange={e => sf("dlwgGPerDay", e.target.value)} /></Field>
            <Field label="Days Since Last Weigh"><Input type="number" value={form.daysSincePreviousWeigh ?? ""} onChange={e => sf("daysSincePreviousWeigh", e.target.value)} /></Field>
            <Field label="BCS (1–5)"><Input type="number" step="0.5" min="1" max="5" value={form.bodyConditionScore ?? ""} onChange={e => sf("bodyConditionScore", e.target.value)} /></Field>
            <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form })} disabled={save.isPending}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── CULL / DRAFT / MARKET TAB ────────────────────────────────────────────────
function CullTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["goat-cull", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-cull-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/goat-cull-records/${editing.id}`) : api(`farms/${farmId}/goat-cull-records`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-cull", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-cull-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["goat-cull", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  function printCullRecords() {
    const tableRows = (rows as Record<string, unknown>[]).map(r => `<tr>
      <td>${fmtDate(r.cullDate)}</td>
      <td>${fmt(r.ageClass)}</td>
      <td>${fmt(r.numberCulled)}</td>
      <td>${fmt(r.reasonForCulling)}</td>
      <td>${fmt(r.destination)}</td>
      <td>${fmtNum(r.averageLiveWeightKg)}</td>
      <td>${fmtNum(r.averageDeadweightKg)}</td>
      <td>${fmt(r.finishGrade)}</td>
      <td>${gbp(r.totalValueGbp)}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Goat Cull / Market Records</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style>
</head><body>
<h1>Goat Cull / Draft / Market Records</h1>
<h2>Goat Production · ${(rows as Record<string, unknown>[]).length} record${(rows as Record<string, unknown>[]).length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Category</th><th>Number</th><th>Reason</th><th>Destination</th><th>Live Wt (kg)</th><th>DW (kg)</th><th>Grade</th><th>Total Value</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<p class="footer">Cull, draft and market records should be retained for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }

  const totalValue = (rows as Record<string, unknown>[]).reduce((sum, r) => sum + (parseFloat(String(r.totalValueGbp)) || 0), 0);
  const totalHead = (rows as Record<string, unknown>[]).reduce((sum, r) => sum + (parseInt(String(r.numberCulled)) || 0), 0);

  return (
    <div className="space-y-4">
      {(rows as Record<string, unknown>[]).length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[["Total Batches", (rows as Record<string, unknown>[]).length], ["Total Head", totalHead], ["Total Value", `£${totalValue.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`]].map(([l, v]) => (
            <div key={String(l)} className="rounded-md border p-3 text-center">
              <p className="text-xs text-muted-foreground">{l}</p>
              <p className="text-lg font-semibold">{String(v)}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Cull / Draft / Market Records</h3>
        <div className="flex gap-2">
          {(rows as Record<string, unknown>[]).length > 0 && <Button size="sm" variant="outline" onClick={printCullRecords}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "cullDate", label: "Date", render: r => fmtDate(r.cullDate) },
            { key: "ageClass", label: "Category" },
            { key: "numberCulled", label: "Head" },
            { key: "reasonForCulling", label: "Reason" },
            { key: "destination", label: "Destination" },
            { key: "averageLiveWeightKg", label: "Avg Live Wt (kg)", render: r => fmtNum(r.averageLiveWeightKg) },
            { key: "totalValueGbp", label: "Total Value", render: r => gbp(r.totalValueGbp) },
          ]}
          rows={rows}
          onView={setViewing}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Cull / Market Record</DialogTitle></DialogHeader>
          {viewing && <div className="grid grid-cols-2 gap-3 text-sm">
            {[["Date", fmtDate(viewing.cullDate)], ["Category", fmt(viewing.ageClass)], ["Number", fmt(viewing.numberCulled)], ["Reason", fmt(viewing.reasonForCulling)], ["Destination", fmt(viewing.destination)], ["Destination CPH", fmt(viewing.destinationCph)], ["Abattoir", fmt(viewing.abattoirName)], ["Avg Live Wt (kg)", fmtNum(viewing.averageLiveWeightKg)], ["Avg Deadweight (kg)", fmtNum(viewing.averageDeadweightKg)], ["Killout %", fmtNum(viewing.deadweightKilloutPercent)], ["Finish Grade", fmt(viewing.finishGrade)], ["Price/Head", gbp(viewing.pricePerHeadGbp)], ["Total Value", gbp(viewing.totalValueGbp)]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
            {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Cull / Market Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date *"><Input type="date" value={form.cullDate ?? ""} onChange={e => sf("cullDate", e.target.value)} /></Field>
            <Field label="Age / Category">
              <Select value={form.ageClass ?? ""} onValueChange={v => sf("ageClass", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Kids","Young does","Cull does","Cull bucks","Store goats","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Number *"><Input type="number" value={form.numberCulled ?? ""} onChange={e => sf("numberCulled", e.target.value)} /></Field>
            <Field label="Reason *">
              <Select value={form.reasonForCulling ?? ""} onValueChange={v => sf("reasonForCulling", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Finished for slaughter","Store sale","Draft ewe/doe","Age cull","Health / injury","Poor performance","Surplus stock","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Destination *">
              <Select value={form.destination ?? ""} onValueChange={v => sf("destination", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Abattoir (direct)","Market / mart","Private sale","On-farm slaughter","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Destination CPH"><Input value={form.destinationCph ?? ""} onChange={e => sf("destinationCph", e.target.value)} /></Field>
            <Field label="Abattoir Name"><Input value={form.abattoirName ?? ""} onChange={e => sf("abattoirName", e.target.value)} /></Field>
            <Field label="Avg Live Weight (kg)"><Input type="number" step="0.1" value={form.averageLiveWeightKg ?? ""} onChange={e => sf("averageLiveWeightKg", e.target.value)} /></Field>
            <Field label="Avg Deadweight (kg)"><Input type="number" step="0.1" value={form.averageDeadweightKg ?? ""} onChange={e => sf("averageDeadweightKg", e.target.value)} /></Field>
            <Field label="Killout % (DW/LW)"><Input type="number" step="0.1" value={form.deadweightKilloutPercent ?? ""} onChange={e => sf("deadweightKilloutPercent", e.target.value)} /></Field>
            <Field label="Finish Grade"><Input value={form.finishGrade ?? ""} onChange={e => sf("finishGrade", e.target.value)} placeholder="e.g. 3L, 2H" /></Field>
            <Field label="Price / Head (£)"><Input type="number" step="0.01" value={form.pricePerHeadGbp ?? ""} onChange={e => sf("pricePerHeadGbp", e.target.value)} /></Field>
            <Field label="Total Value (£)"><Input type="number" step="0.01" value={form.totalValueGbp ?? ""} onChange={e => sf("totalValueGbp", e.target.value)} /></Field>
            <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form })} disabled={save.isPending}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── HEALTH / VACCINATION TAB ─────────────────────────────────────────────────
function HealthTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [subTab, setSubTab] = useState<"vaccinations" | "disease">("vaccinations");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: vaccRows = [], isLoading: vLoading } = useQuery({ queryKey: ["goat-vacc", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-vaccination-programmes`), { credentials: "include" }).then(r => r.json()) });
  const { data: diseaseRows = [], isLoading: dLoading } = useQuery({ queryKey: ["goat-disease", farmId], queryFn: () => fetch(api(`farms/${farmId}/goat-disease-monitoring`), { credentials: "include" }).then(r => r.json()) });
  const saveVacc = useMutation({ mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/goat-vaccination-programmes/${editing.id}`) : api(`farms/${farmId}/goat-vaccination-programmes`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-vacc", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const saveDisease = useMutation({ mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/goat-disease-monitoring/${editing.id}`) : api(`farms/${farmId}/goat-disease-monitoring`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["goat-disease", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const delVacc = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-vaccination-programmes/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["goat-vacc", farmId] }) });
  const delDisease = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/goat-disease-monitoring/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["goat-disease", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b pb-2">
        <Button size="sm" variant={subTab === "vaccinations" ? "default" : "ghost"} onClick={() => setSubTab("vaccinations")}>Vaccination Programmes</Button>
        <Button size="sm" variant={subTab === "disease" ? "default" : "ghost"} onClick={() => setSubTab("disease")}>Disease Monitoring</Button>
      </div>

      {subTab === "vaccinations" && <>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm">Vaccination Programmes</h3>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ vetPrescribed: "false" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </div>
        {vLoading ? <Loader2 className="animate-spin" /> : (
          <DataTable
            cols={[
              { key: "vaccinationDate", label: "Date", render: r => fmtDate(r.vaccinationDate) },
              { key: "vaccinationCategory", label: "Programme" },
              { key: "vaccineProduct", label: "Vaccine" },
              { key: "numberTreated", label: "Animals" },
              { key: "nextDueDate", label: "Next Due", render: r => fmtDate(r.nextDueDate) },
            ]}
            rows={vaccRows}
            onView={setViewing}
            onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
            onDelete={r => delVacc.mutate(r.id as number)}
          />
        )}
        <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Vaccination Programme</DialogTitle></DialogHeader>
            {viewing && <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Date", fmtDate(viewing.vaccinationDate)], ["Programme", fmt(viewing.vaccinationCategory)], ["Vaccine", fmt(viewing.vaccineProduct)], ["Route", fmt(viewing.administrationRoute)], ["Dose (ml)", fmt(viewing.doseVolumeMl)], ["Animals Treated", fmt(viewing.numberTreated)], ["Age Class", fmt(viewing.ageClassTreated)], ["Batch No.", fmt(viewing.batchNumber)], ["Expiry", fmtDate(viewing.expiryDate)], ["Next Due", fmtDate(viewing.nextDueDate)], ["Administered By", fmt(viewing.administeredBy)], ["Vet Prescribed", viewing.vetPrescribed ? "Yes" : "No"], ["Withdrawal (days)", fmt(viewing.withdrawalPeriodDays)]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
              {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>}
            <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={open && subTab === "vaccinations"} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); setForm({}); } }}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Vaccination</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Vaccination Programme">
                <Select value={form.vaccinationCategory ?? ""} onValueChange={v => sf("vaccinationCategory", v)}>
                  <SelectTrigger><SelectValue placeholder="Select programme..." /></SelectTrigger>
                  <SelectContent>{["CAE prevention (dam-raised)","Clostridial diseases","Pasteurella / pneumonia","Enterotoxaemia","Foot rot (Footvax)","Caseous Lymphadenitis (CLA)","E. coli (neonatal)","Orf","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Vaccine Product *"><Input value={form.vaccineProduct ?? ""} onChange={e => sf("vaccineProduct", e.target.value)} /></Field>
              <Field label="Date *"><Input type="date" value={form.vaccinationDate ?? ""} onChange={e => sf("vaccinationDate", e.target.value)} /></Field>
              <Field label="Batch Number"><Input value={form.batchNumber ?? ""} onChange={e => sf("batchNumber", e.target.value)} /></Field>
              <Field label="Expiry Date"><Input type="date" value={form.expiryDate ?? ""} onChange={e => sf("expiryDate", e.target.value)} /></Field>
              <Field label="Animals Treated *"><Input type="number" value={form.numberTreated ?? ""} onChange={e => sf("numberTreated", e.target.value)} /></Field>
              <Field label="Age Class Treated"><Input value={form.ageClassTreated ?? ""} onChange={e => sf("ageClassTreated", e.target.value)} placeholder="e.g. Kids, Does" /></Field>
              <Field label="Dose Volume (ml)"><Input type="number" step="0.1" value={form.doseVolumeMl ?? ""} onChange={e => sf("doseVolumeMl", e.target.value)} /></Field>
              <Field label="Administration Route">
                <Select value={form.administrationRoute ?? ""} onValueChange={v => sf("administrationRoute", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{["Subcutaneous (SC)","Intramuscular (IM)","Intradermal (ID)","Oral","Intranasal"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Withdrawal Period (days)"><Input type="number" value={form.withdrawalPeriodDays ?? ""} onChange={e => sf("withdrawalPeriodDays", e.target.value)} /></Field>
              <Field label="Next Due Date"><Input type="date" value={form.nextDueDate ?? ""} onChange={e => sf("nextDueDate", e.target.value)} /></Field>
              <Field label="Administered By"><Input value={form.administeredBy ?? ""} onChange={e => sf("administeredBy", e.target.value)} /></Field>
              <div className="col-span-2 flex items-center gap-2">
                <Checkbox checked={form.vetPrescribed === "true"} onCheckedChange={v => sf("vetPrescribed", v ? "true" : "false")} id="vetpx" />
                <Label htmlFor="vetpx">Vet prescribed</Label>
              </div>
              <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm({}); }}>Cancel</Button>
              <Button onClick={() => saveVacc.mutate({ ...form })} disabled={saveVacc.isPending}>{editing ? "Save" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>}

      {subTab === "disease" && <>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm">Disease Monitoring</h3>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ status: "pending" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </div>
        {dLoading ? <Loader2 className="animate-spin" /> : (
          <DataTable
            cols={[
              { key: "monitoringDate", label: "Date", render: r => fmtDate(r.monitoringDate) },
              { key: "monitoringType", label: "Type" },
              { key: "testingBody", label: "Testing Body" },
              { key: "numberOfSamples", label: "Samples" },
              { key: "positiveResults", label: "Positive" },
              { key: "status", label: "Status", render: r => <Badge variant={r.status === "clear" ? "default" : r.status === "positive" ? "destructive" : "secondary"}>{fmt(r.status)}</Badge> },
              { key: "nextTestDue", label: "Next Due", render: r => fmtDate(r.nextTestDue) },
            ]}
            rows={diseaseRows}
            onView={setViewing}
            onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
            onDelete={r => delDisease.mutate(r.id as number)}
          />
        )}
        <Dialog open={!!viewing && subTab === "disease"} onOpenChange={o => { if (!o) setViewing(null); }}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Disease Monitoring Record</DialogTitle></DialogHeader>
            {viewing && <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Date", fmtDate(viewing.monitoringDate)], ["Type", fmt(viewing.monitoringType)], ["Scheme Reference", fmt(viewing.schemeReference)], ["Testing Body", fmt(viewing.testingBody)], ["Samples", fmt(viewing.numberOfSamples)], ["Positive", fmt(viewing.positiveResults)], ["Negative", fmt(viewing.negativeResults)], ["Status", fmt(viewing.status)], ["Next Test Due", fmtDate(viewing.nextTestDue)]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
              {viewing.actionsTaken && <div className="col-span-2"><span className="text-muted-foreground">Actions Taken:</span> {fmt(viewing.actionsTaken)}</div>}
              {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>}
            <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={open && subTab === "disease"} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); setForm({}); } }}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Disease Monitoring</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Monitoring Type *">
                <Select value={form.monitoringType ?? ""} onValueChange={v => sf("monitoringType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                  <SelectContent>{["CAE (Caprine Arthritis Encephalitis)","CLA (Caseous Lymphadenitis)","Johne's Disease","Foot rot surveillance","Cryptosporidiosis","Toxoplasmosis","Chlamydiosis","Mycoplasma","Faecal egg count (worms)","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Date *"><Input type="date" value={form.monitoringDate ?? ""} onChange={e => sf("monitoringDate", e.target.value)} /></Field>
              <Field label="Scheme Reference"><Input value={form.schemeReference ?? ""} onChange={e => sf("schemeReference", e.target.value)} /></Field>
              <Field label="Testing Body"><Input value={form.testingBody ?? ""} onChange={e => sf("testingBody", e.target.value)} /></Field>
              <Field label="Number of Samples"><Input type="number" value={form.numberOfSamples ?? ""} onChange={e => sf("numberOfSamples", e.target.value)} /></Field>
              <Field label="Status">
                <Select value={form.status ?? ""} onValueChange={v => sf("status", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{["pending","clear","positive","inconclusive"].map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Positive Results"><Input type="number" value={form.positiveResults ?? ""} onChange={e => sf("positiveResults", e.target.value)} /></Field>
              <Field label="Negative Results"><Input type="number" value={form.negativeResults ?? ""} onChange={e => sf("negativeResults", e.target.value)} /></Field>
              <div className="col-span-2"><Field label="Actions Taken"><Textarea value={form.actionsTaken ?? ""} onChange={e => sf("actionsTaken", e.target.value)} rows={2} /></Field></div>
              <Field label="Next Test Due"><Input type="date" value={form.nextTestDue ?? ""} onChange={e => sf("nextTestDue", e.target.value)} /></Field>
              <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm({}); }}>Cancel</Button>
              <Button onClick={() => saveDisease.mutate({ ...form })} disabled={saveDisease.isPending}>{editing ? "Save" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function GoatProductionPage() {
  const { selectedFarm } = useAppStore();
  const farmId = selectedFarm?.id;
  const [tab, setTab] = useState<"herds" | "mating" | "scanning" | "weigh" | "cull" | "health">("herds");

  if (!farmId) {
    return (
      <AppLayout>
        <div className="p-6 flex items-center gap-2 text-muted-foreground">
          <AlertTriangle className="w-4 h-4" /><span>Please select a farm to view Goat Production records.</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Scale className="w-6 h-6 text-green-600" />
              Goat Production
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Mating records, pregnancy scanning, weigh-in &amp; DLWG, market records, health &amp; vaccination</p>
          </div>
        </div>

        <TabBar>
          <TabButton active={tab === "herds"} onClick={() => setTab("herds")}>Herds</TabButton>
          <TabButton active={tab === "mating"} onClick={() => setTab("mating")}>Mating</TabButton>
          <TabButton active={tab === "scanning"} onClick={() => setTab("scanning")}>Scanning</TabButton>
          <TabButton active={tab === "weigh"} onClick={() => setTab("weigh")}>Weigh-in</TabButton>
          <TabButton active={tab === "cull"} onClick={() => setTab("cull")}>Cull / Market</TabButton>
          <TabButton active={tab === "health"} onClick={() => setTab("health")}>Health</TabButton>
        </TabBar>

        <div className="rounded-md border p-4 bg-card">
          {tab === "herds" && <HerdsTab farmId={farmId} />}
          {tab === "mating" && <MatingTab farmId={farmId} />}
          {tab === "scanning" && <ScanningTab farmId={farmId} />}
          {tab === "weigh" && <WeighTab farmId={farmId} />}
          {tab === "cull" && <CullTab farmId={farmId} />}
          {tab === "health" && <HealthTab farmId={farmId} />}
        </div>
      </div>
    </AppLayout>
  );
}
