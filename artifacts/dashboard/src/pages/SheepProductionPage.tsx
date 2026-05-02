import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Eye, Scissors, Scale, Bug, ShieldCheck, Clipboard } from "lucide-react";
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

// ─── FLOCKS TAB ───────────────────────────────────────────────────────────────
function FlocksTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-flocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-flocks`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-flocks/${editing.id}`) : api(`farms/${farmId}/sheep-flocks`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-flocks", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-flocks/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-flocks", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  function openAdd() { setEditing(null); setForm({ status: "active" }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }
  function submit() { save.mutate({ ...form }); }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Sheep Flocks / Production Groups</h3>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Flock</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "flockName", label: "Flock Name" },
            { key: "breed", label: "Breed" },
            { key: "flockPurpose", label: "Purpose" },
            { key: "currentCount", label: "Head Count" },
            { key: "assuranceScheme", label: "Assurance" },
            { key: "status", label: "Status", render: r => <Badge variant={r.status === "active" ? "default" : "secondary"}>{fmt(r.status)}</Badge> },
          ]}
          rows={rows}
          onView={setViewing}
          onEdit={openEdit}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Flock Details</DialogTitle></DialogHeader>
          {viewing && <div className="grid grid-cols-2 gap-3 text-sm">
            {[["Flock Name", "flockName"], ["Breed", "breed"], ["Purpose", "flockPurpose"], ["CPH Number", "cphNumber"], ["Herd/Flock No.", "herdFlockNumber"], ["Current Count", "currentCount"], ["Location", "location"], ["Assurance Scheme", "assuranceScheme"], ["Membership No.", "assuranceMembershipNumber"], ["Status", "status"]].map(([label, key]) => (
              <div key={key}><span className="text-muted-foreground">{label}:</span> <span className="font-medium">{fmt(viewing[key])}</span></div>
            ))}
            {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> <span>{fmt(viewing.notes)}</span></div>}
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Flock</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Flock Name *"><Input value={form.flockName ?? ""} onChange={e => sf("flockName", e.target.value)} /></Field></div>
            <Field label="Breed"><Input value={form.breed ?? ""} onChange={e => sf("breed", e.target.value)} /></Field>
            <Field label="Purpose">
              <Select value={form.flockPurpose ?? ""} onValueChange={v => sf("flockPurpose", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Breeding ewes","Ewe lambs","Store lambs","Finishing lambs","Ram flock","Replacements"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="CPH Number"><Input value={form.cphNumber ?? ""} onChange={e => sf("cphNumber", e.target.value)} /></Field>
            <Field label="Herd/Flock Number"><Input value={form.herdFlockNumber ?? ""} onChange={e => sf("herdFlockNumber", e.target.value)} /></Field>
            <Field label="Current Count"><Input type="number" value={form.currentCount ?? ""} onChange={e => sf("currentCount", e.target.value)} /></Field>
            <Field label="Location"><Input value={form.location ?? ""} onChange={e => sf("location", e.target.value)} /></Field>
            <Field label="Assurance Scheme"><Input value={form.assuranceScheme ?? ""} onChange={e => sf("assuranceScheme", e.target.value)} placeholder="e.g. Red Tractor Assured" /></Field>
            <Field label="Membership Number"><Input value={form.assuranceMembershipNumber ?? ""} onChange={e => sf("assuranceMembershipNumber", e.target.value)} /></Field>
            <Field label="Status">
              <Select value={form.status ?? "active"} onValueChange={v => sf("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["active","archived"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={save.isPending}>{save.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : null}{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── TUPPING TAB ──────────────────────────────────────────────────────────────
function TuppingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-tupping", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-tupping-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-tupping-records/${editing.id}`) : api(`farms/${farmId}/sheep-tupping-records`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-tupping", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-tupping-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-tupping", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  function openAdd() { setEditing(null); setForm({ progesteroneUsed: "false" }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Tupping Records</h3>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "tuppingStartDate", label: "Start Date", render: r => fmtDate(r.tuppingStartDate) },
            { key: "tuppingEndDate", label: "End Date", render: r => fmtDate(r.tuppingEndDate) },
            { key: "ramBreed", label: "Ram Breed" },
            { key: "ramTagNumber", label: "Ram Tag" },
            { key: "ewesExposed", label: "Ewes Exposed" },
            { key: "expectedLambingStart", label: "Expected Lambing", render: r => fmtDate(r.expectedLambingStart) },
          ]}
          rows={rows}
          onView={setViewing}
          onEdit={openEdit}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tupping Record Details</DialogTitle></DialogHeader>
          {viewing && <div className="grid grid-cols-2 gap-3 text-sm">
            {[["Start Date", fmtDate(viewing.tuppingStartDate)], ["End Date", fmtDate(viewing.tuppingEndDate)], ["Ram Breed", fmt(viewing.ramBreed)], ["Ram Tag", fmt(viewing.ramTagNumber)], ["Ram Source", fmt(viewing.ramSource)], ["Ewes Exposed", fmt(viewing.ewesExposed)], ["Tupping Method", fmt(viewing.tuppingMethod)], ["Harness Colour", fmt(viewing.harnessColour)], ["Progesterone Used", viewing.progesteroneUsed ? "Yes" : "No"], ["Expected Lambing Start", fmtDate(viewing.expectedLambingStart)], ["Expected Lambing End", fmtDate(viewing.expectedLambingEnd)]].map(([label, value]) => (
              <div key={String(label)}><span className="text-muted-foreground">{label}:</span> <span className="font-medium">{String(value)}</span></div>
            ))}
            {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Tupping Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date *"><Input type="date" value={form.tuppingStartDate ?? ""} onChange={e => sf("tuppingStartDate", e.target.value)} /></Field>
            <Field label="End Date"><Input type="date" value={form.tuppingEndDate ?? ""} onChange={e => sf("tuppingEndDate", e.target.value)} /></Field>
            <Field label="Ram Breed"><Input value={form.ramBreed ?? ""} onChange={e => sf("ramBreed", e.target.value)} /></Field>
            <Field label="Ram Tag Number"><Input value={form.ramTagNumber ?? ""} onChange={e => sf("ramTagNumber", e.target.value)} /></Field>
            <Field label="Ram Source"><Input value={form.ramSource ?? ""} onChange={e => sf("ramSource", e.target.value)} /></Field>
            <Field label="Ewes Exposed"><Input type="number" value={form.ewesExposed ?? ""} onChange={e => sf("ewesExposed", e.target.value)} /></Field>
            <Field label="Tupping Method">
              <Select value={form.tuppingMethod ?? ""} onValueChange={v => sf("tuppingMethod", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Natural service","AI (fresh)","AI (frozen)","ET"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Harness Colour"><Input value={form.harnessColour ?? ""} onChange={e => sf("harnessColour", e.target.value)} /></Field>
            <Field label="Expected Lambing Start"><Input type="date" value={form.expectedLambingStart ?? ""} onChange={e => sf("expectedLambingStart", e.target.value)} /></Field>
            <Field label="Expected Lambing End"><Input type="date" value={form.expectedLambingEnd ?? ""} onChange={e => sf("expectedLambingEnd", e.target.value)} /></Field>
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox checked={form.progesteroneUsed === "true"} onCheckedChange={v => sf("progesteroneUsed", v ? "true" : "false")} id="prog" />
              <Label htmlFor="prog">Progesterone / CIDR used</Label>
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
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-scanning", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-scanning-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-scanning-records/${editing.id}`) : api(`farms/${farmId}/sheep-scanning-records`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-scanning", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-scanning-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-scanning", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Scanning Records</h3>
        <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "scanDate", label: "Scan Date", render: r => fmtDate(r.scanDate) },
            { key: "scannerName", label: "Scanner" },
            { key: "ewesScanned", label: "Scanned" },
            { key: "ewesInLamb", label: "In Lamb" },
            { key: "ewesBare", label: "Bare" },
            { key: "scanningPercentage", label: "Scanning %" },
            { key: "expectedLambsTotal", label: "Expected Lambs" },
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
            {[["Scan Date", fmtDate(viewing.scanDate)], ["Scanner", fmt(viewing.scannerName)], ["Ewes Scanned", fmt(viewing.ewesScanned)], ["Ewes In Lamb", fmt(viewing.ewesInLamb)], ["Ewes Bare", fmt(viewing.ewesBare)], ["Singles", fmt(viewing.singlesCount)], ["Twins", fmt(viewing.twinsCount)], ["Triplets", fmt(viewing.triplesCount)], ["Quads", fmt(viewing.quadsCount)], ["Scanning %", fmt(viewing.scanningPercentage)], ["Expected Lambs", fmt(viewing.expectedLambsTotal)]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
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
            <Field label="Ewes Scanned"><Input type="number" value={form.ewesScanned ?? ""} onChange={e => sf("ewesScanned", e.target.value)} /></Field>
            <Field label="Ewes In Lamb"><Input type="number" value={form.ewesInLamb ?? ""} onChange={e => sf("ewesInLamb", e.target.value)} /></Field>
            <Field label="Ewes Bare"><Input type="number" value={form.ewesBare ?? ""} onChange={e => sf("ewesBare", e.target.value)} /></Field>
            <Field label="Scanning %"><Input type="number" step="0.1" value={form.scanningPercentage ?? ""} onChange={e => sf("scanningPercentage", e.target.value)} /></Field>
            <Field label="Singles"><Input type="number" value={form.singlesCount ?? ""} onChange={e => sf("singlesCount", e.target.value)} /></Field>
            <Field label="Twins"><Input type="number" value={form.twinsCount ?? ""} onChange={e => sf("twinsCount", e.target.value)} /></Field>
            <Field label="Triplets"><Input type="number" value={form.triplesCount ?? ""} onChange={e => sf("triplesCount", e.target.value)} /></Field>
            <Field label="Expected Lambs Total"><Input type="number" value={form.expectedLambsTotal ?? ""} onChange={e => sf("expectedLambsTotal", e.target.value)} /></Field>
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
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-weigh", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-weigh-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-weigh-records/${editing.id}`) : api(`farms/${farmId}/sheep-weigh-records`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-weigh", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-weigh-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-weigh", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Weigh-in & Performance Records</h3>
        <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Weigh</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "weighDate", label: "Date", render: r => fmtDate(r.weighDate) },
            { key: "weighBatchRef", label: "Batch Ref" },
            { key: "animalCategory", label: "Category" },
            { key: "numberOfAnimalsWeighed", label: "Count" },
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
            {[["Date", fmtDate(viewing.weighDate)], ["Batch Ref", fmt(viewing.weighBatchRef)], ["Category", fmt(viewing.animalCategory)], ["Animals Weighed", fmt(viewing.numberOfAnimalsWeighed)], ["Avg Weight (kg)", fmtNum(viewing.averageWeightKg)], ["Total Weight (kg)", fmtNum(viewing.totalWeightKg)], ["Target Weight (kg)", fmtNum(viewing.targetWeightKg)], ["DLWG (g/day)", fmtNum(viewing.dlwgGPerDay)], ["Days Since Last Weigh", fmt(viewing.daysSincePreviousWeigh)], ["BCS", fmt(viewing.bodyConditionScore)]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
            {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Weigh Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weigh Date *"><Input type="date" value={form.weighDate ?? ""} onChange={e => sf("weighDate", e.target.value)} /></Field>
            <Field label="Batch Ref"><Input value={form.weighBatchRef ?? ""} onChange={e => sf("weighBatchRef", e.target.value)} /></Field>
            <Field label="Animal Category">
              <Select value={form.animalCategory ?? ""} onValueChange={v => sf("animalCategory", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Lambs (spring)","Lambs (autumn)","Store lambs","Hoggets","Ewes","Ram lambs"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Number Weighed"><Input type="number" value={form.numberOfAnimalsWeighed ?? ""} onChange={e => sf("numberOfAnimalsWeighed", e.target.value)} /></Field>
            <Field label="Avg Weight (kg)"><Input type="number" step="0.1" value={form.averageWeightKg ?? ""} onChange={e => sf("averageWeightKg", e.target.value)} /></Field>
            <Field label="Total Weight (kg)"><Input type="number" step="0.1" value={form.totalWeightKg ?? ""} onChange={e => sf("totalWeightKg", e.target.value)} /></Field>
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

// ─── SHEARING TAB ─────────────────────────────────────────────────────────────
function ShearingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-shearing", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-shearing-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-shearing-records/${editing.id}`) : api(`farms/${farmId}/sheep-shearing-records`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-shearing", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-shearing-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-shearing", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Shearing Records</h3>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ isContractor: "false", ectoparasiteTreatmentApplied: "false" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "shearingDate", label: "Date", render: r => fmtDate(r.shearingDate) },
            { key: "shearerName", label: "Shearer" },
            { key: "numberOfSheepSheared", label: "Head" },
            { key: "woolWeightKg", label: "Wool (kg)", render: r => fmtNum(r.woolWeightKg) },
            { key: "woolGrade", label: "Grade" },
            { key: "woolSaleValue", label: "Sale Value", render: r => gbp(r.woolSaleValue) },
          ]}
          rows={rows}
          onView={setViewing}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Shearing Record</DialogTitle></DialogHeader>
          {viewing && <div className="grid grid-cols-2 gap-3 text-sm">
            {[["Date", fmtDate(viewing.shearingDate)], ["Shearer", fmt(viewing.shearerName)], ["Contractor", viewing.isContractor ? "Yes" : "No"], ["Head Sheared", fmt(viewing.numberOfSheepSheared)], ["Wool Weight (kg)", fmtNum(viewing.woolWeightKg)], ["Wool Grade", fmt(viewing.woolGrade)], ["British Wool Board Ref", fmt(viewing.britishWoolBoardRef)], ["Sale Value", gbp(viewing.woolSaleValue)], ["Ectoparasite Treatment", viewing.ectoparasiteTreatmentApplied ? "Yes" : "No"], ["Treatment Product", fmt(viewing.treatmentProductName)]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
            {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Shearing Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Shearing Date *"><Input type="date" value={form.shearingDate ?? ""} onChange={e => sf("shearingDate", e.target.value)} /></Field>
            <Field label="Shearer Name"><Input value={form.shearerName ?? ""} onChange={e => sf("shearerName", e.target.value)} /></Field>
            <Field label="Head Sheared"><Input type="number" value={form.numberOfSheepSheared ?? ""} onChange={e => sf("numberOfSheepSheared", e.target.value)} /></Field>
            <Field label="Wool Weight (kg)"><Input type="number" step="0.1" value={form.woolWeightKg ?? ""} onChange={e => sf("woolWeightKg", e.target.value)} /></Field>
            <Field label="Wool Grade"><Input value={form.woolGrade ?? ""} onChange={e => sf("woolGrade", e.target.value)} /></Field>
            <Field label="British Wool Board Ref"><Input value={form.britishWoolBoardRef ?? ""} onChange={e => sf("britishWoolBoardRef", e.target.value)} /></Field>
            <Field label="Sale Value (£)"><Input type="number" step="0.01" value={form.woolSaleValue ?? ""} onChange={e => sf("woolSaleValue", e.target.value)} /></Field>
            <Field label="Treatment Product"><Input value={form.treatmentProductName ?? ""} onChange={e => sf("treatmentProductName", e.target.value)} placeholder="If ectoparasite treatment applied" /></Field>
            <div className="col-span-2 flex gap-4">
              <div className="flex items-center gap-2"><Checkbox checked={form.isContractor === "true"} onCheckedChange={v => sf("isContractor", v ? "true" : "false")} id="contr" /><Label htmlFor="contr">Contractor shearer</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={form.ectoparasiteTreatmentApplied === "true"} onCheckedChange={v => sf("ectoparasiteTreatmentApplied", v ? "true" : "false")} id="ecto" /><Label htmlFor="ecto">Ectoparasite treatment applied</Label></div>
            </div>
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
  const { data: vaccRows = [], isLoading: vLoading } = useQuery({ queryKey: ["sheep-vacc", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-vaccination-programmes`), { credentials: "include" }).then(r => r.json()) });
  const { data: diseaseRows = [], isLoading: dLoading } = useQuery({ queryKey: ["sheep-disease", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-disease-monitoring`), { credentials: "include" }).then(r => r.json()) });
  const saveVacc = useMutation({ mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-vaccination-programmes/${editing.id}`) : api(`farms/${farmId}/sheep-vaccination-programmes`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-vacc", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const saveDisease = useMutation({ mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-disease-monitoring/${editing.id}`) : api(`farms/${farmId}/sheep-disease-monitoring`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-disease", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const delVacc = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-vaccination-programmes/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-vacc", farmId] }) });
  const delDisease = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-disease-monitoring/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-disease", farmId] }) });
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
              { key: "programmeName", label: "Programme" },
              { key: "vaccineProduct", label: "Vaccine" },
              { key: "diseaseTargeted", label: "Disease" },
              { key: "numberOfAnimalsVaccinated", label: "Animals" },
              { key: "boosterDueDate", label: "Booster Due", render: r => fmtDate(r.boosterDueDate) },
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
              {[["Date", fmtDate(viewing.vaccinationDate)], ["Programme", fmt(viewing.programmeName)], ["Vaccine", fmt(viewing.vaccineProduct)], ["Disease Targeted", fmt(viewing.diseaseTargeted)], ["Route", fmt(viewing.administrationRoute)], ["Dose (ml)", fmt(viewing.doseMl)], ["Animals Vaccinated", fmt(viewing.numberOfAnimalsVaccinated)], ["Batch No.", fmt(viewing.batchNumber)], ["Expiry", fmtDate(viewing.expiryDate)], ["Booster Due", fmtDate(viewing.boosterDueDate)], ["Administered By", fmt(viewing.administeredBy)], ["Vet Prescribed", viewing.vetPrescribed ? "Yes" : "No"], ["Withdrawal Period", fmt(viewing.withdrawalPeriodDays) + " days"]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
              {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>}
            <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Vaccination</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Programme Name *"><Input value={form.programmeName ?? ""} onChange={e => sf("programmeName", e.target.value)} /></Field>
              <Field label="Vaccine Product *"><Input value={form.vaccineProduct ?? ""} onChange={e => sf("vaccineProduct", e.target.value)} /></Field>
              <Field label="Disease Targeted"><Input value={form.diseaseTargeted ?? ""} onChange={e => sf("diseaseTargeted", e.target.value)} placeholder="e.g. Clostridial disease, OPA" /></Field>
              <Field label="Vaccination Date *"><Input type="date" value={form.vaccinationDate ?? ""} onChange={e => sf("vaccinationDate", e.target.value)} /></Field>
              <Field label="Booster Due Date"><Input type="date" value={form.boosterDueDate ?? ""} onChange={e => sf("boosterDueDate", e.target.value)} /></Field>
              <Field label="Animals Vaccinated"><Input type="number" value={form.numberOfAnimalsVaccinated ?? ""} onChange={e => sf("numberOfAnimalsVaccinated", e.target.value)} /></Field>
              <Field label="Dose (ml)"><Input type="number" step="0.1" value={form.doseMl ?? ""} onChange={e => sf("doseMl", e.target.value)} /></Field>
              <Field label="Admin Route"><Input value={form.administrationRoute ?? ""} onChange={e => sf("administrationRoute", e.target.value)} placeholder="e.g. SC, IM" /></Field>
              <Field label="Batch Number"><Input value={form.batchNumber ?? ""} onChange={e => sf("batchNumber", e.target.value)} /></Field>
              <Field label="Expiry Date"><Input type="date" value={form.expiryDate ?? ""} onChange={e => sf("expiryDate", e.target.value)} /></Field>
              <Field label="Administered By"><Input value={form.administeredBy ?? ""} onChange={e => sf("administeredBy", e.target.value)} /></Field>
              <Field label="Withdrawal Period (days)"><Input type="number" value={form.withdrawalPeriodDays ?? ""} onChange={e => sf("withdrawalPeriodDays", e.target.value)} /></Field>
              <div className="col-span-2 flex items-center gap-2"><Checkbox checked={form.vetPrescribed === "true"} onCheckedChange={v => sf("vetPrescribed", v ? "true" : "false")} id="vp" /><Label htmlFor="vp">Vet prescribed</Label></div>
              <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => saveVacc.mutate({ ...form })} disabled={saveVacc.isPending}>{editing ? "Save" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </>}

      {subTab === "disease" && <>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm">Disease & Condition Monitoring</h3>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ vetConsulted: "false", reportableDisease: "false", ahrbiNotified: "false" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add</Button>
        </div>
        {dLoading ? <Loader2 className="animate-spin" /> : (
          <DataTable
            cols={[
              { key: "observationDate", label: "Date", render: r => fmtDate(r.observationDate) },
              { key: "condition", label: "Condition" },
              { key: "numberOfAnimalsAffected", label: "Animals" },
              { key: "severity", label: "Severity", render: r => { const s = String(r.severity ?? ""); return <Badge variant={s === "severe" ? "destructive" : s === "moderate" ? "outline" : "secondary"}>{s || "—"}</Badge>; } },
              { key: "outcome", label: "Outcome" },
              { key: "reportableDisease", label: "Reportable", render: r => r.reportableDisease ? <Badge variant="destructive">Yes</Badge> : <Badge variant="secondary">No</Badge> },
            ]}
            rows={diseaseRows}
            onView={setViewing}
            onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
            onDelete={r => delDisease.mutate(r.id as number)}
          />
        )}
        <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Disease Monitoring Record</DialogTitle></DialogHeader>
            {viewing && <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Date", fmtDate(viewing.observationDate)], ["Condition", fmt(viewing.condition)], ["Animals Affected", fmt(viewing.numberOfAnimalsAffected)], ["Severity", fmt(viewing.severity)], ["Action Taken", fmt(viewing.actionTaken)], ["Vet Consulted", viewing.vetConsulted ? "Yes" : "No"], ["Vet Name", fmt(viewing.vetName)], ["Treatment Product", fmt(viewing.treatmentProduct)], ["Outcome", fmt(viewing.outcome)], ["Reportable Disease", viewing.reportableDisease ? "Yes" : "No"], ["AHRBI Notified", viewing.ahrbiNotified ? "Yes" : "No"]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
              {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>}
            <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Disease Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Observation Date *"><Input type="date" value={form.observationDate ?? ""} onChange={e => sf("observationDate", e.target.value)} /></Field>
              <Field label="Condition / Disease *"><Input value={form.condition ?? ""} onChange={e => sf("condition", e.target.value)} placeholder="e.g. Footrot, OPA, Flystrike" /></Field>
              <Field label="Animals Affected"><Input type="number" value={form.numberOfAnimalsAffected ?? ""} onChange={e => sf("numberOfAnimalsAffected", e.target.value)} /></Field>
              <Field label="Severity">
                <Select value={form.severity ?? ""} onValueChange={v => sf("severity", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{["mild","moderate","severe"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <div className="col-span-2"><Field label="Action Taken"><Input value={form.actionTaken ?? ""} onChange={e => sf("actionTaken", e.target.value)} /></Field></div>
              <Field label="Treatment Product"><Input value={form.treatmentProduct ?? ""} onChange={e => sf("treatmentProduct", e.target.value)} /></Field>
              <Field label="Vet Name"><Input value={form.vetName ?? ""} onChange={e => sf("vetName", e.target.value)} /></Field>
              <Field label="Outcome"><Input value={form.outcome ?? ""} onChange={e => sf("outcome", e.target.value)} /></Field>
              <div className="col-span-2 flex gap-4 flex-wrap">
                <div className="flex items-center gap-2"><Checkbox checked={form.vetConsulted === "true"} onCheckedChange={v => sf("vetConsulted", v ? "true" : "false")} id="vc" /><Label htmlFor="vc">Vet consulted</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.reportableDisease === "true"} onCheckedChange={v => sf("reportableDisease", v ? "true" : "false")} id="rd" /><Label htmlFor="rd">Reportable disease</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.ahrbiNotified === "true"} onCheckedChange={v => sf("ahrbiNotified", v ? "true" : "false")} id="ahrb" /><Label htmlFor="ahrb">AHRBI notified</Label></div>
              </div>
              <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => saveDisease.mutate({ ...form })} disabled={saveDisease.isPending}>{editing ? "Save" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </>}
    </div>
  );
}

// ─── RED TRACTOR CHECKLIST TAB ────────────────────────────────────────────────
function RTChecklistTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-rt", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-rt-checklists`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-rt-checklists/${editing.id}`) : api(`farms/${farmId}/sheep-rt-checklists`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-rt", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-rt-checklists/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-rt", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const boolFields = ["flockRegisterUpToDate","medicineRecordsComplete","movementRecordsComplete","feedRecordsComplete","mbmFreeStatus","assuranceMembershipCurrent","vetHealthPlanOnFile","staffTrainingCurrent","welfareOutcomesRecorded"];
  const boolLabels: Record<string, string> = { flockRegisterUpToDate: "Flock register up to date", medicineRecordsComplete: "Medicine records complete", movementRecordsComplete: "Movement records complete", feedRecordsComplete: "Feed records complete", mbmFreeStatus: "MBM-free status confirmed", assuranceMembershipCurrent: "Assurance membership current", vetHealthPlanOnFile: "Vet health plan on file", staffTrainingCurrent: "Staff training current", welfareOutcomesRecorded: "Welfare outcomes recorded" };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Red Tractor Sheep Checklists</h3>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ overallStatus: "pending" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />New Check</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "checkDate", label: "Date", render: r => fmtDate(r.checkDate) },
            { key: "checkedBy", label: "Checked By" },
            { key: "overallStatus", label: "Status", render: r => { const s = String(r.overallStatus ?? ""); return <Badge variant={s === "pass" ? "default" : s === "fail" ? "destructive" : "secondary"}>{s}</Badge>; } },
          ]}
          rows={rows}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "New"} RT Sheep Checklist</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check Date *"><Input type="date" value={form.checkDate ?? ""} onChange={e => sf("checkDate", e.target.value)} /></Field>
            <Field label="Checked By"><Input value={form.checkedBy ?? ""} onChange={e => sf("checkedBy", e.target.value)} /></Field>
            <div className="col-span-2 grid grid-cols-1 gap-2 border rounded p-3">
              {boolFields.map(k => (
                <div key={k} className="flex items-center gap-2">
                  <Checkbox checked={form[k] === "true"} onCheckedChange={v => sf(k, v ? "true" : "false")} id={k} />
                  <Label htmlFor={k} className="text-sm">{boolLabels[k]}</Label>
                </div>
              ))}
            </div>
            <Field label="Overall Status">
              <Select value={form.overallStatus ?? "pending"} onValueChange={v => sf("overallStatus", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["pending","pass","fail","action-required"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form })} disabled={save.isPending}>{editing ? "Save" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
type Tab = "flocks" | "tupping" | "scanning" | "weigh" | "shearing" | "health" | "rt-checklist";

export default function SheepProductionPage() {
  const farmId = useAppStore(s => s.farmId);
  const [tab, setTab] = useState<Tab>("flocks");

  if (!farmId) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-muted-foreground">Select a farm to view sheep production records.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Scissors className="w-6 h-6 text-green-700" />
          <div>
            <h1 className="text-2xl font-bold">Sheep Production</h1>
            <p className="text-sm text-muted-foreground">Flock management, tupping, scanning, performance, shearing, health plans and Red Tractor compliance</p>
          </div>
        </div>

        <TabBar className="mb-6">
          <TabButton active={tab === "flocks"} onClick={() => setTab("flocks")}>Flocks</TabButton>
          <TabButton active={tab === "tupping"} onClick={() => setTab("tupping")}>Tupping</TabButton>
          <TabButton active={tab === "scanning"} onClick={() => setTab("scanning")}>Scanning</TabButton>
          <TabButton active={tab === "weigh"} onClick={() => setTab("weigh")}>Weigh-in & Performance</TabButton>
          <TabButton active={tab === "shearing"} onClick={() => setTab("shearing")}>Shearing</TabButton>
          <TabButton active={tab === "health"} onClick={() => setTab("health")}>Health Plans</TabButton>
          <TabButton active={tab === "rt-checklist"} onClick={() => setTab("rt-checklist")}>RT Checklist</TabButton>
        </TabBar>

        {tab === "flocks" && <FlocksTab farmId={farmId} />}
        {tab === "tupping" && <TuppingTab farmId={farmId} />}
        {tab === "scanning" && <ScanningTab farmId={farmId} />}
        {tab === "weigh" && <WeighTab farmId={farmId} />}
        {tab === "shearing" && <ShearingTab farmId={farmId} />}
        {tab === "health" && <HealthTab farmId={farmId} />}
        {tab === "rt-checklist" && <RTChecklistTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
