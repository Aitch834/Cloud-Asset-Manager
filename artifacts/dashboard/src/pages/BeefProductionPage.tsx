import { useState, useEffect, useMemo, type ReactNode } from "react";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { openPrintWindow } from "@/lib/print-report";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Eye, Scale, TrendingUp, CheckCircle2, ClipboardList, Printer, BarChart3 } from "lucide-react";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { BeefEnterpriseReport } from "@/components/BeefEnterpriseReport";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { Checkbox } from "@/components/ui/checkbox";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";

import { apiUrl as api } from "@/lib/api";
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
const fmtNum = (v: unknown, dp = 1) => (v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp));
const gbp = (v: unknown) => (v == null || v === "" ? "—" : `£${parseFloat(String(v)).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`);

function Empty({ msg }: { msg: string }) {
  return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>;
}

function DataTable({ cols, rows, onEdit, onDelete, onView, deleteMutation }: {
  cols: { key: string; label: string; render?: (r: Record<string, unknown>) => ReactNode }[];
  rows: Record<string, unknown>[];
  onEdit?: (r: Record<string, unknown>) => void;
  onDelete?: (r: Record<string, unknown>) => void;
  onView?: (r: Record<string, unknown>) => void;
  deleteMutation?: { isError: boolean; isPending: boolean; isSuccess: boolean; error: unknown; reset: () => void };
}) {
  const [pending, setPending] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { if (deleteMutation?.isSuccess) setPending(null); }, [deleteMutation?.isSuccess]);
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
      <ConfirmDialog open={!!pending} title="Delete Record" message="Are you sure? This cannot be undone." confirmLabel="Delete" confirmVariant="destructive" mutation={deleteMutation} onConfirm={() => { if (pending && onDelete) { onDelete(pending); if (!deleteMutation) setPending(null); } }} onCancel={() => { setPending(null); deleteMutation?.reset(); }} />
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="space-y-1"><Label>{label}</Label>{children}</div>;
}

// ─── WEIGH-IN & DLWG TAB ──────────────────────────────────────────────────────
function WeighTab({ farmId, onRaiseTask }: { farmId: number; onRaiseTask: (row: Record<string, unknown>) => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["beef-weigh", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/beef-weigh-records`), { credentials: "include" }).then(r => r.json()),
  });
  const { data: herdsRaw } = useQuery({
    queryKey: ["herds", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/herds`), { credentials: "include" }).then(r => r.json()),
  });
  const herds: Record<string, unknown>[] = (Array.isArray(herdsRaw) ? herdsRaw : []).filter((h: any) => {
    const t = String(h.type ?? "").toLowerCase();
    return ["cattle", "beef", "dairy", "suckler", "bovine"].some(k => t.includes(k));
  });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/beef-weigh-records/${editing.id}`) : api(`farms/${farmId}/beef-weigh-records`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beef-weigh", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/beef-weigh-records/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["beef-weigh", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "beef-weigh", filter: "year", farmId, defaultValue: "all" });
  const years = useMemo(() => Array.from(new Set((rows as Record<string, unknown>[]).map(r => String(r.weighDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = useMemo(() => yearFilter === "all" ? rows as Record<string, unknown>[] : (rows as Record<string, unknown>[]).filter(r => String(r.weighDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);

  function printWeighReport() {
    const tableRows = filtered.map(r => `<tr><td>${fmtDate(r.weighDate)}</td><td>${fmt(r.groupRef)}</td><td>${fmt(r.breed)}</td><td>${fmt(r.category)}</td><td>${fmt(r.numberOfAnimals)}</td><td>${fmtNum(r.averageLiveWeightKg)}</td><td>${fmtNum(r.dlwgGPerDay)}</td><td>${fmt(r.averageBcsScore)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Beef Weigh-in Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body><h1>Beef Weigh-in &amp; DLWG Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Beef &amp; Dairy · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Group</th><th>Breed</th><th>Category</th><th>Count</th><th>Avg Wt (kg)</th><th>DLWG (g/day)</th><th>Avg BCS</th></tr></thead><tbody>${tableRows}</tbody></table><p style="margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px">Red Tractor Beef &amp; Dairy: weight records and DLWG must be maintained as evidence of performance monitoring. Retain for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p></body></html>`);
  }

  const cols = [
    { key: "weighDate", label: "Date", render: (r: Record<string, unknown>) => fmtDate(r.weighDate) },
    { key: "groupRef", label: "Group" },
    { key: "breed", label: "Breed" },
    { key: "category", label: "Category" },
    { key: "numberOfAnimals", label: "Count" },
    { key: "averageLiveWeightKg", label: "Avg Wt (kg)", render: (r: Record<string, unknown>) => fmtNum(r.averageLiveWeightKg) },
    { key: "dlwgGPerDay", label: "DLWG (g/day)", render: (r: Record<string, unknown>) => fmtNum(r.dlwgGPerDay) },
    { key: "averageBcsScore", label: "BCS" },
    { key: "_attach", label: "", render: (r: Record<string, unknown>) => r.id ? <RecordAttachments recordType="beef-weigh-records" recordId={r.id as number} farmId={farmId} compact /> : null },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Beef Weigh-in & DLWG Records</h3>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && <Button size="sm" variant="outline" onClick={printWeighReport}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Weigh</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable cols={cols} rows={filtered} onView={setViewing} onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }} onDelete={r => del.mutate(r.id as number)} deleteMutation={del} />
      )}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Weigh-in Record</DialogTitle></DialogHeader>
          {viewing && <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {([ ["Date", fmtDate(viewing.weighDate)], ["Group Ref", fmt(viewing.groupRef)], ["Breed", fmt(viewing.breed)], ["Category", fmt(viewing.category)], ["Animals Weighed", fmt(viewing.numberOfAnimals)], ["Avg Live Weight (kg)", fmtNum(viewing.averageLiveWeightKg)], ["Total Live Weight (kg)", fmtNum(viewing.totalLiveWeightKg)], ["Target Weight (kg)", fmtNum(viewing.targetWeightKg)], ["DLWG (g/day)", fmtNum(viewing.dlwgGPerDay)], ["Days Since Last Weigh", fmt(viewing.daysSincePreviousWeigh)], ["Avg BCS", fmt(viewing.averageBcsScore)], ["Location", fmt(viewing.location)], ["Weighed By", fmt(viewing.weighedBy)] ] as [string, string][]).map(([l, v]) => (
                <div key={l}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{v}</span></div>
              ))}
              {!!viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>
            {viewing.id && <RecordAttachments recordType="beef-weigh-records" recordId={viewing.id as number} farmId={farmId} />}
          </>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <Button size="sm" variant="outline" className="text-purple-700 border-purple-200 hover:bg-purple-50" onClick={() => { onRaiseTask(viewing!); setViewing(null); }}>
              <ClipboardList className="w-3.5 h-3.5 mr-1" />Raise Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Weigh Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Herd / Group">
              <Select value={form.herdId ?? "__none__"} onValueChange={v => sf("herdId", v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select herd..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Not specified —</SelectItem>
                  {(herds as Record<string, unknown>[]).map(h => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.name ?? "")}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field></div>
            <Field label="Weigh Date *"><Input type="date" value={form.weighDate ?? ""} onChange={e => sf("weighDate", e.target.value)} /></Field>
            <Field label="Group Reference"><Input value={form.groupRef ?? ""} onChange={e => sf("groupRef", e.target.value)} /></Field>
            <Field label="Breed">
              <Select value={form.breed ?? ""} onValueChange={v => sf("breed", v)}>
                <SelectTrigger><SelectValue placeholder="Select breed..." /></SelectTrigger>
                <SelectContent>{["Hereford","Angus","Limousin","Charolais","Simmental","Blonde d'Aquitaine","Shorthorn","Belgian Blue","British Friesian","Murray Grey","Dexter","Highland","Red Poll","South Devon","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Category">
              <Select value={form.category ?? ""} onValueChange={v => sf("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Suckler calves","Weaned calves","Store cattle","Finishing cattle","Cows","Bulls"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Number of Animals"><Input type="number" value={form.numberOfAnimals ?? ""} onChange={e => sf("numberOfAnimals", e.target.value)} /></Field>
            <Field label="Avg Live Weight (kg)"><Input type="number" step="0.1" value={form.averageLiveWeightKg ?? ""} onChange={e => sf("averageLiveWeightKg", e.target.value)} /></Field>
            <Field label="Total Live Weight (kg)"><Input type="number" step="0.1" value={form.totalLiveWeightKg ?? ""} onChange={e => sf("totalLiveWeightKg", e.target.value)} /></Field>
            <Field label="Target Weight (kg)"><Input type="number" step="0.1" value={form.targetWeightKg ?? ""} onChange={e => sf("targetWeightKg", e.target.value)} /></Field>
            <Field label="DLWG (g/day)"><Input type="number" step="1" value={form.dlwgGPerDay ?? ""} onChange={e => sf("dlwgGPerDay", e.target.value)} /></Field>
            <Field label="Days Since Last Weigh"><Input type="number" value={form.daysSincePreviousWeigh ?? ""} onChange={e => sf("daysSincePreviousWeigh", e.target.value)} /></Field>
            <Field label="Avg BCS (1–5)"><Input type="number" step="0.5" min="1" max="5" value={form.averageBcsScore ?? ""} onChange={e => sf("averageBcsScore", e.target.value)} /></Field>
            <Field label="Location"><Input value={form.location ?? ""} onChange={e => sf("location", e.target.value)} /></Field>
            <Field label="Weighed By"><Input value={form.weighedBy ?? ""} onChange={e => sf("weighedBy", e.target.value)} /></Field>
            <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form })} disabled={save.isPending}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── FINISHING RECORDS TAB ────────────────────────────────────────────────────
function FinishingTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["beef-finishing", farmId], queryFn: () => fetch(api(`farms/${farmId}/beef-finishing-records`), { credentials: "include" }).then(r => r.json()) });
  const { data: herdsRaw2 } = useQuery({ queryKey: ["herds", farmId], queryFn: () => fetch(api(`farms/${farmId}/herds`), { credentials: "include" }).then(r => r.json()) });
  const herds: Record<string, unknown>[] = (Array.isArray(herdsRaw2) ? herdsRaw2 : []).filter((h: any) => {
    const t = String(h.type ?? "").toLowerCase();
    return ["cattle", "beef", "dairy", "suckler", "bovine"].some(k => t.includes(k));
  });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/beef-finishing-records/${editing.id}`) : api(`farms/${farmId}/beef-finishing-records`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beef-finishing", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/beef-finishing-records/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["beef-finishing", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "beef-finishing", filter: "year", farmId, defaultValue: "all" });
  const years = useMemo(() => Array.from(new Set((rows as Record<string, unknown>[]).map(r => String(r.dateEnteredFinishing ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = useMemo(() => yearFilter === "all" ? rows as Record<string, unknown>[] : (rows as Record<string, unknown>[]).filter(r => String(r.dateEnteredFinishing ?? "").startsWith(yearFilter)), [rows, yearFilter]);

  function printFinishingReport() {
    const tableRows = filtered.map(r => `<tr><td>${fmt(r.animalTagNumber)}</td><td>${fmt(r.breed)}</td><td>${fmt(r.sex)}</td><td>${fmtDate(r.dateEnteredFinishing)}</td><td>${fmtNum(r.entryLiveWeightKg)}</td><td>${fmtDate(r.slaughterDate)}</td><td>${fmtNum(r.overallDlwgGPerDay)}</td><td>${fmt(r.status)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Beef Finishing Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;font-size:10px}tr:nth-child(even) td{background:#fafafa}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body><h1>Beef Finishing Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Beef &amp; Dairy · ${filtered.length} animal${filtered.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Tag No.</th><th>Breed</th><th>Sex</th><th>Entered Finishing</th><th>Entry Wt (kg)</th><th>Slaughter Date</th><th>DLWG (g/day)</th><th>Status</th></tr></thead><tbody>${tableRows}</tbody></table><p style="margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px">Red Tractor Beef &amp; Dairy: individual animal finishing records support traceability requirements. Retain for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p></body></html>`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Finishing Records</h3>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && <Button size="sm" variant="outline" onClick={printFinishingReport}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => { setEditing(null); setForm({ status: "active" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Animal</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "animalTagNumber", label: "Tag No." },
            { key: "breed", label: "Breed" },
            { key: "sex", label: "Sex" },
            { key: "dateEnteredFinishing", label: "Entered Finishing", render: r => fmtDate(r.dateEnteredFinishing) },
            { key: "entryLiveWeightKg", label: "Entry Wt (kg)", render: r => fmtNum(r.entryLiveWeightKg) },
            { key: "targetSlaughterDate", label: "Target Slaughter", render: r => fmtDate(r.targetSlaughterDate) },
            { key: "overallDlwgGPerDay", label: "DLWG (g/day)", render: r => fmtNum(r.overallDlwgGPerDay) },
            { key: "status", label: "Status", render: r => <Badge variant={r.status === "active" ? "default" : "secondary"}>{fmt(r.status)}</Badge> },
            { key: "_attach", label: "", render: r => r.id ? <RecordAttachments recordType="beef-finishing-records" recordId={r.id as number} farmId={farmId} compact /> : null },
          ]}
          rows={filtered}
          onView={setViewing}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
          deleteMutation={del}
        />
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Finishing Record</DialogTitle></DialogHeader>
          {viewing && <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Tag Number", fmt(viewing.animalTagNumber)], ["Breed", fmt(viewing.breed)], ["Sex", fmt(viewing.sex)], ["Date of Birth", fmtDate(viewing.dateOfBirth)], ["Entered Finishing", fmtDate(viewing.dateEnteredFinishing)], ["Entry Live Weight (kg)", fmtNum(viewing.entryLiveWeightKg)], ["Target Slaughter Wt (kg)", fmtNum(viewing.targetSlaughterWeightKg)], ["Target Slaughter Date", fmtDate(viewing.targetSlaughterDate)], ["Finishing System", fmt(viewing.finishingSystem)], ["Slaughter Date", fmtDate(viewing.slaughterDate)], ["Slaughter Live Wt (kg)", fmtNum(viewing.slaughterLiveWeightKg)], ["Days on Finishing", fmt(viewing.totalDaysOnFinishing)], ["Overall DLWG (g/day)", fmtNum(viewing.overallDlwgGPerDay)], ["Status", fmt(viewing.status)]].map(([l, v]: [string, string]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
              {!!viewing.rationsDescription && <div className="col-span-2"><span className="text-muted-foreground">Rations:</span> {fmt(viewing.rationsDescription)}</div>}
              {!!viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>
            {viewing.id && <RecordAttachments recordType="beef-finishing-records" recordId={viewing.id as number} farmId={farmId} />}
          </>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Finishing Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Herd / Group">
              <Select value={form.herdId ?? "__none__"} onValueChange={v => sf("herdId", v === "__none__" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select herd..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Not specified —</SelectItem>
                  {(herds as Record<string, unknown>[]).map(h => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.name ?? "")}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field></div>
            <Field label="Animal Tag No. *"><Input value={form.animalTagNumber ?? ""} onChange={e => sf("animalTagNumber", e.target.value)} /></Field>
            <Field label="Breed">
              <Select value={form.breed ?? ""} onValueChange={v => sf("breed", v)}>
                <SelectTrigger><SelectValue placeholder="Select breed..." /></SelectTrigger>
                <SelectContent>{["Hereford","Angus","Limousin","Charolais","Simmental","Blonde d'Aquitaine","Shorthorn","Belgian Blue","British Friesian","Murray Grey","Dexter","Highland","Red Poll","South Devon","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Sex">
              <Select value={form.sex ?? ""} onValueChange={v => sf("sex", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Bull","Steer","Heifer","Cow"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Date of Birth"><Input type="date" value={form.dateOfBirth ?? ""} onChange={e => sf("dateOfBirth", e.target.value)} /></Field>
            <Field label="Date Entered Finishing"><Input type="date" value={form.dateEnteredFinishing ?? ""} onChange={e => sf("dateEnteredFinishing", e.target.value)} /></Field>
            <Field label="Entry Live Weight (kg)"><Input type="number" step="0.1" value={form.entryLiveWeightKg ?? ""} onChange={e => sf("entryLiveWeightKg", e.target.value)} /></Field>
            <Field label="Target Slaughter Wt (kg)"><Input type="number" step="0.1" value={form.targetSlaughterWeightKg ?? ""} onChange={e => sf("targetSlaughterWeightKg", e.target.value)} /></Field>
            <Field label="Target Slaughter Date"><Input type="date" value={form.targetSlaughterDate ?? ""} onChange={e => sf("targetSlaughterDate", e.target.value)} /></Field>
            <Field label="Finishing System">
              <Select value={form.finishingSystem ?? ""} onValueChange={v => sf("finishingSystem", v)}>
                <SelectTrigger><SelectValue placeholder="Select system..." /></SelectTrigger>
                <SelectContent>{["Cereal beef","Grass finishing","18-month beef","Maize silage","TMR (Total Mixed Ration)","Silage-based","Specialist slow-finish","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status ?? "active"} onValueChange={v => sf("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["active","slaughtered","sold-store","died"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Slaughter Date"><Input type="date" value={form.slaughterDate ?? ""} onChange={e => sf("slaughterDate", e.target.value)} /></Field>
            <Field label="Slaughter Live Wt (kg)"><Input type="number" step="0.1" value={form.slaughterLiveWeightKg ?? ""} onChange={e => sf("slaughterLiveWeightKg", e.target.value)} /></Field>
            <Field label="Days on Finishing"><Input type="number" value={form.totalDaysOnFinishing ?? ""} onChange={e => sf("totalDaysOnFinishing", e.target.value)} /></Field>
            <Field label="Overall DLWG (g/day)"><Input type="number" step="1" value={form.overallDlwgGPerDay ?? ""} onChange={e => sf("overallDlwgGPerDay", e.target.value)} /></Field>
            <div className="col-span-2"><Field label="Rations Description"><Textarea value={form.rationsDescription ?? ""} onChange={e => sf("rationsDescription", e.target.value)} rows={2} /></Field></div>
            <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form })} disabled={save.isPending}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── DEADWEIGHT SETTLEMENT TAB ────────────────────────────────────────────────
function DeadweightTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "beef-deadweight", filter: "year", farmId, defaultValue: "all" });
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["beef-deadweight", farmId], queryFn: () => fetch(api(`farms/${farmId}/beef-deadweight-settlements`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/beef-deadweight-settlements/${editing.id}`) : api(`farms/${farmId}/beef-deadweight-settlements`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["beef-deadweight", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/beef-deadweight-settlements/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["beef-deadweight", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const years = useMemo(() => Array.from(new Set((rows as Record<string, unknown>[]).map(r => String(r.killDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = useMemo(() => yearFilter === "all" ? rows as Record<string, unknown>[] : (rows as Record<string, unknown>[]).filter(r => String(r.killDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);

  function printDeadweightReport() {
    const tableRows = filtered.map(r => `<tr><td>${fmtDate(r.killDate)}</td><td>${fmt(r.abattoirName)}</td><td>${fmt(r.numberOfHead)}</td><td>${fmtNum(r.averageCarcassWeightKg)}</td><td>${fmt(r.dominantGrade)}</td><td>${fmt(r.killingOutPercentage)}%</td><td>${gbp(r.netPaymentGbp)}</td><td>${r.paymentReceived ? "Yes" : "No"}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Beef Deadweight Settlements</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body><h1>Beef Deadweight Settlement Notes${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Beef &amp; Dairy · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Kill Date</th><th>Abattoir</th><th>Head</th><th>Avg Carcass (kg)</th><th>Grade</th><th>Kill-Out %</th><th>Net Payment</th><th>Paid</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Deadweight settlement records should be retained for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p></body></html>`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Deadweight Settlement Notes</h3>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && <Button size="sm" variant="outline" onClick={printDeadweightReport}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => { setEditing(null); setForm({ paymentReceived: "false" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Settlement</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "killDate", label: "Kill Date", render: r => fmtDate(r.killDate) },
            { key: "abattoirName", label: "Abattoir" },
            { key: "numberOfHead", label: "Head" },
            { key: "averageCarcassWeightKg", label: "Avg Carcass (kg)", render: r => fmtNum(r.averageCarcassWeightKg) },
            { key: "dominantGrade", label: "Grade" },
            { key: "netPaymentGbp", label: "Net Payment", render: r => gbp(r.netPaymentGbp) },
            { key: "paymentReceived", label: "Paid", render: r => r.paymentReceived ? <Badge variant="default">Paid</Badge> : <Badge variant="outline">Outstanding</Badge> },
            { key: "_attach", label: "", render: r => r.id ? <RecordAttachments recordType="beef-deadweight-settlements" recordId={r.id as number} farmId={farmId} compact /> : null },
          ]}
          rows={filtered}
          onView={setViewing}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
          deleteMutation={del}
        />
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Settlement Note</DialogTitle></DialogHeader>
          {viewing && <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Kill Date", fmtDate(viewing.killDate)], ["Abattoir", fmt(viewing.abattoirName)], ["Ref", fmt(viewing.abattoirRef)], ["Head", fmt(viewing.numberOfHead)], ["Avg Carcass Wt (kg)", fmtNum(viewing.averageCarcassWeightKg)], ["Total Carcass Wt (kg)", fmtNum(viewing.totalCarcassWeightKg)], ["Killing Out %", fmt(viewing.killingOutPercentage)], ["Grade", fmt(viewing.dominantGrade)], ["Avg Price/kg", gbp(viewing.averagePricePerKgGbp)], ["Total Value", gbp(viewing.totalValueGbp)], ["Levy Deduction", gbp(viewing.levyDeductionGbp)], ["Net Payment", gbp(viewing.netPaymentGbp)], ["Settlement Date", fmtDate(viewing.settlementDate)], ["Payment Received", viewing.paymentReceived ? "Yes" : "No"]].map(([l, v]: [string, string]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
              {!!viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>
            {viewing.id && <RecordAttachments recordType="beef-deadweight-settlements" recordId={viewing.id as number} farmId={farmId} />}
          </>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Settlement Note</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kill Date *"><Input type="date" value={form.killDate ?? ""} onChange={e => sf("killDate", e.target.value)} /></Field>
            <Field label="Abattoir Name *"><Input value={form.abattoirName ?? ""} onChange={e => sf("abattoirName", e.target.value)} /></Field>
            <Field label="Abattoir Ref"><Input value={form.abattoirRef ?? ""} onChange={e => sf("abattoirRef", e.target.value)} /></Field>
            <Field label="Number of Head"><Input type="number" value={form.numberOfHead ?? ""} onChange={e => sf("numberOfHead", e.target.value)} /></Field>
            <Field label="Avg Carcass Wt (kg)"><Input type="number" step="0.1" value={form.averageCarcassWeightKg ?? ""} onChange={e => sf("averageCarcassWeightKg", e.target.value)} /></Field>
            <Field label="Total Carcass Wt (kg)"><Input type="number" step="0.1" value={form.totalCarcassWeightKg ?? ""} onChange={e => sf("totalCarcassWeightKg", e.target.value)} /></Field>
            <Field label="Killing Out %"><Input type="number" step="0.1" value={form.killingOutPercentage ?? ""} onChange={e => sf("killingOutPercentage", e.target.value)} /></Field>
            <Field label="Dominant Grade">
              <Select value={form.dominantGrade ?? ""} onValueChange={v => sf("dominantGrade", v)}>
                <SelectTrigger><SelectValue placeholder="Select EUROP grade..." /></SelectTrigger>
                <SelectContent>{["E3L","E3H","E4L","E4H","U3L","U3H","U4L","U4H","R3L","R3H","R4L","R4H","O3L","O3H","O4L","O4H","P3L","P3H","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Avg Price per kg (£)"><Input type="number" step="0.001" value={form.averagePricePerKgGbp ?? ""} onChange={e => sf("averagePricePerKgGbp", e.target.value)} /></Field>
            <Field label="Total Value (£)"><Input type="number" step="0.01" value={form.totalValueGbp ?? ""} onChange={e => sf("totalValueGbp", e.target.value)} /></Field>
            <Field label="Levy Deduction (£)"><Input type="number" step="0.01" value={form.levyDeductionGbp ?? ""} onChange={e => sf("levyDeductionGbp", e.target.value)} /></Field>
            <Field label="Net Payment (£)"><Input type="number" step="0.01" value={form.netPaymentGbp ?? ""} onChange={e => sf("netPaymentGbp", e.target.value)} /></Field>
            <Field label="Settlement Date"><Input type="date" value={form.settlementDate ?? ""} onChange={e => sf("settlementDate", e.target.value)} /></Field>
            <div className="flex items-center gap-2 mt-5"><Checkbox checked={form.paymentReceived === "true"} onCheckedChange={v => sf("paymentReceived", v ? "true" : "false")} id="pr" /><Label htmlFor="pr">Payment received</Label></div>
            <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form })} disabled={save.isPending}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── RED TRACTOR CHECKLIST TAB ────────────────────────────────────────────────
function RTChecklistTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "beef-rt-checklist", filter: "year", farmId, defaultValue: "all" });
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["beef-rt", farmId], queryFn: () => fetch(api(`farms/${farmId}/beef-rt-checklists`), { credentials: "include" }).then(r => r.json()) });
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);
  const save = useMutation({ mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/beef-rt-checklists/${editing.id}`) : api(`farms/${farmId}/beef-rt-checklists`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["beef-rt", farmId] }); setOpen(false); setForm({}); setEditing(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/beef-rt-checklists/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["beef-rt", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const boolFields = ["cattlePassportsCurrent","herdRegisterUpToDate","movementRecordsComplete","medicineRecordsComplete","feedRecordsComplete","mbmFreeStatus","tbStatusCurrent","assuranceMembershipCurrent","vetHealthPlanOnFile","staffTrainingCurrent"];
  const boolLabels: Record<string, string> = { cattlePassportsCurrent: "Cattle passports current & on farm", herdRegisterUpToDate: "Herd register up to date", movementRecordsComplete: "Movement records complete", medicineRecordsComplete: "Medicine records complete", feedRecordsComplete: "Feed records complete", mbmFreeStatus: "MBM-free status confirmed", tbStatusCurrent: "TB test status current", assuranceMembershipCurrent: "Assurance membership current", vetHealthPlanOnFile: "Vet health plan on file", staffTrainingCurrent: "Staff training current" };
  const years = useMemo(() => Array.from(new Set((rows as Record<string, unknown>[]).map(r => String(r.checkDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = useMemo(() => yearFilter === "all" ? rows as Record<string, unknown>[] : (rows as Record<string, unknown>[]).filter(r => String(r.checkDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);

  function printRtChecklists() {
    const tableRows = filtered.map(r => `<tr><td>${r.checkDate ? new Date(String(r.checkDate)).toLocaleDateString("en-GB") : "—"}</td><td>${String(r.checkedBy ?? "—")}</td><td>${String(r.overallStatus ?? "—")}</td><td>${boolFields.filter(k => r[k]).map(k => boolLabels[k]).join("; ") || "—"}</td><td>${String(r.notes ?? "—")}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>RT Beef Checklists</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top}@media print{@page{margin:1.5cm}}</style></head><body><h1>Red Tractor Beef &amp; Cattle Checklists${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Checked By</th><th>Status</th><th>Compliant Items</th><th>Notes</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Red Tractor Beef & Cattle Checklists</h3>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && <Button size="sm" variant="outline" onClick={printRtChecklists}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => { setEditing(null); setForm({ overallStatus: "pending" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />New Check</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "checkDate", label: "Date", render: r => fmtDate(r.checkDate) },
            { key: "checkedBy", label: "Checked By" },
            { key: "overallStatus", label: "Status", render: r => { const s = String(r.overallStatus ?? ""); return <Badge variant={s === "pass" ? "default" : s === "fail" ? "destructive" : "secondary"}>{s}</Badge>; } },
            { key: "_attach", label: "", render: r => r.id ? <RecordAttachments recordType="beef-rt-checklists" recordId={r.id as number} farmId={farmId} compact /> : null },
          ]}
          rows={filtered}
          onView={setViewing}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
          deleteMutation={del}
        />
      )}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>RT Beef & Cattle Checklist</DialogTitle></DialogHeader>
          {viewing && <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Date", fmtDate(viewing.checkDate)], ["Checked By", fmt(viewing.checkedBy)], ["Status", fmt(viewing.overallStatus)]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
              <div className="col-span-2 space-y-1 border rounded p-2">
                {boolFields.map(k => <div key={k} className="flex items-center gap-2 text-xs"><span className={viewing[k] ? "text-green-600" : "text-muted-foreground"}>{viewing[k] ? "✓" : "✗"}</span><span>{boolLabels[k]}</span></div>)}
              </div>
              {!!viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>
            {viewing.id && <RecordAttachments recordType="beef-rt-checklists" recordId={viewing.id as number} farmId={farmId} />}
          </>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "New"} RT Beef & Cattle Checklist</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check Date *"><Input type="date" value={form.checkDate ?? ""} onChange={e => sf("checkDate", e.target.value)} /></Field>
            <Field label="Checked By"><StaffSelect value={form.checkedBy ?? ""} onChange={v => sf("checkedBy", v)} staffNames={staffNames} loading={membersLoading} /></Field>
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
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form })} disabled={save.isPending}>{editing ? "Save" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── REPORTS TAB ──────────────────────────────────────────────────────────────
function ReportsTab({ farmId }: { farmId: number }) {
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "beef-reports", filter: "year", farmId, defaultValue: "__all__" });

  const weighQ = useQuery({ queryKey: ["beef-weigh", farmId], queryFn: () => fetch(api(`farms/${farmId}/beef-weigh-records`), { credentials: "include" }).then(r => r.json()) });
  const finishQ = useQuery({ queryKey: ["beef-finishing", farmId], queryFn: () => fetch(api(`farms/${farmId}/beef-finishing-records`), { credentials: "include" }).then(r => r.json()) });
  const dwQ = useQuery({ queryKey: ["beef-deadweight", farmId], queryFn: () => fetch(api(`farms/${farmId}/beef-deadweight-records`), { credentials: "include" }).then(r => r.json()) });

  const weighRows: Record<string, unknown>[] = Array.isArray(weighQ.data) ? weighQ.data : [];
  const finishRows: Record<string, unknown>[] = Array.isArray(finishQ.data) ? finishQ.data : [];
  const dwRows: Record<string, unknown>[] = Array.isArray(dwQ.data) ? dwQ.data : [];

  const years = [...new Set([
    ...weighRows.map(r => r.weighDate ? String(r.weighDate).slice(0, 4) : null),
    ...finishRows.map(r => r.exitDate ? String(r.exitDate).slice(0, 4) : null),
    ...dwRows.map(r => r.killDate ? String(r.killDate).slice(0, 4) : null),
  ].filter((y): y is string => !!y))].sort().reverse();

  const inYear = (date: unknown) => yearFilter === "__all__" || (!!date && String(date).slice(0, 4) === yearFilter);
  const fw = weighRows.filter(r => inYear(r.weighDate));
  const ff = finishRows.filter(r => inYear(r.exitDate));
  const fd = dwRows.filter(r => inYear(r.killDate));

  const avgDlwg = fw.length > 0 ? (fw.reduce((s, r) => s + (parseFloat(String(r.dlwgGPerDay ?? 0)) || 0), 0) / fw.length).toFixed(0) : null;
  const groups = [...new Set(fw.map(r => r.groupRef).filter(Boolean))].length;
  const totalDw = fd.reduce((s, r) => s + (parseFloat(String(r.coldDeadweightKg ?? 0)) || 0), 0);
  const avgKillOut = fd.length > 0 ? (fd.reduce((s, r) => s + (parseFloat(String(r.killOutPct ?? 0)) || 0), 0) / fd.length).toFixed(1) : null;
  const totalSettlement = fd.reduce((s, r) => s + (parseFloat(String(r.netSettlementValue ?? 0)) || 0), 0);
  const gradeMap: Record<string, number> = {};
  fd.forEach(r => { const g = String(r.europConformation ?? "Not recorded"); gradeMap[g] = (gradeMap[g] || 0) + 1; });
  const statusMap: Record<string, number> = {};
  ff.forEach(r => { const s = String(r.status ?? "active"); statusMap[s] = (statusMap[s] || 0) + 1; });

  const isLoading = weighQ.isLoading || finishQ.isLoading || dwQ.isLoading;
  const periodLabel = yearFilter === "__all__" ? "All Time" : yearFilter;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h3 className="font-semibold text-sm">Beef Production Report — {periodLabel}</h3>
        <div className="flex gap-2 items-center">
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }}>
            <option value="__all__">All Time</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button size="sm" variant="outline" onClick={() => {
            const gradeRows = Object.entries(gradeMap).map(([g, n]) => `<tr><td>${g}</td><td style="text-align:right">${n}</td></tr>`).join("");
            const statusRows = Object.entries(statusMap).map(([s, n]) => `<tr><td style="text-transform:capitalize">${s}</td><td style="text-align:right">${n}</td></tr>`).join("");
            openPrintWindow(`<!DOCTYPE html><html><head><title>Beef Production Report — ${periodLabel}</title>
<style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}h3{font-size:11px;margin:14px 0 6px;border-bottom:1px solid #e5e7eb;padding-bottom:2px}table{border-collapse:collapse;margin-bottom:12px}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;padding:4px 8px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 8px;border:1px solid #e5e7eb}.stats{display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px}.stat{text-align:center;border:1px solid #e5e7eb;border-radius:6px;padding:8px 14px}.stat-n{font-size:20px;font-weight:700}.stat-l{font-size:9px;color:#666;margin-top:2px}@media print{@page{margin:1.5cm}}</style>
</head><body>
<h1>Beef Production Report — ${periodLabel}</h1>
<h2>Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<h3>Weigh-in &amp; DLWG</h3>
<div class="stats">
  <div class="stat"><div class="stat-n">${fw.length}</div><div class="stat-l">Records</div></div>
  <div class="stat"><div class="stat-n">${avgDlwg ?? "—"}</div><div class="stat-l">Avg DLWG (g/day)</div></div>
  <div class="stat"><div class="stat-n">${groups || "—"}</div><div class="stat-l">Groups Weighed</div></div>
</div>
<h3>Finishing Records</h3>
<div class="stats">
  <div class="stat"><div class="stat-n">${ff.length}</div><div class="stat-l">Total Records</div></div>
</div>
${statusRows ? `<table><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>${statusRows}</tbody></table>` : ""}
<h3>Deadweight Settlements</h3>
<div class="stats">
  <div class="stat"><div class="stat-n">${fd.length}</div><div class="stat-l">Kill Sheets</div></div>
  <div class="stat"><div class="stat-n">${totalDw > 0 ? `${totalDw.toFixed(0)}kg` : "—"}</div><div class="stat-l">Total Deadweight</div></div>
  <div class="stat"><div class="stat-n">${avgKillOut ? `${avgKillOut}%` : "—"}</div><div class="stat-l">Avg Kill-Out</div></div>
  <div class="stat"><div class="stat-n">${totalSettlement > 0 ? `£${totalSettlement.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : "—"}</div><div class="stat-l">Total Settlement</div></div>
</div>
${gradeRows ? `<table><thead><tr><th>EUROP Grade</th><th>Count</th></tr></thead><tbody>${gradeRows}</tbody></table>` : ""}
</body></html>`);
          }}>
            <Printer className="w-4 h-4 mr-1" />Print Report
          </Button>
        </div>
      </div>

      {isLoading ? <Loader2 className="animate-spin" /> : (
        <>
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2"><Scale className="w-4 h-4 text-amber-700" />Weigh-in & DLWG</h4>
            {fw.length === 0 ? <p className="text-sm text-muted-foreground italic">No weigh-in records for this period.</p> : (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-2xl font-bold">{fw.length}</p><p className="text-xs text-muted-foreground">Records</p></div>
                <div><p className="text-2xl font-bold">{avgDlwg ?? "—"}</p><p className="text-xs text-muted-foreground">Avg DLWG (g/day)</p></div>
                <div><p className="text-2xl font-bold">{groups || "—"}</p><p className="text-xs text-muted-foreground">Groups Weighed</p></div>
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-700" />Finishing Records</h4>
            {ff.length === 0 ? <p className="text-sm text-muted-foreground italic">No finishing records for this period.</p> : (
              <div className="flex flex-wrap gap-4">
                <div className="text-center"><p className="text-2xl font-bold">{ff.length}</p><p className="text-xs text-muted-foreground">Total Records</p></div>
                {Object.entries(statusMap).map(([s, n]) => (
                  <div key={s} className="text-center"><p className="text-2xl font-bold">{n}</p><p className="text-xs text-muted-foreground capitalize">{s}</p></div>
                ))}
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-700" />Deadweight Settlements</h4>
            {fd.length === 0 ? <p className="text-sm text-muted-foreground italic">No deadweight records for this period.</p> : (
              <>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div><p className="text-2xl font-bold">{fd.length}</p><p className="text-xs text-muted-foreground">Kill Sheets</p></div>
                  <div><p className="text-2xl font-bold">{totalDw > 0 ? `${totalDw.toFixed(0)}kg` : "—"}</p><p className="text-xs text-muted-foreground">Total Deadweight</p></div>
                  <div><p className="text-2xl font-bold">{avgKillOut ? `${avgKillOut}%` : "—"}</p><p className="text-xs text-muted-foreground">Avg Kill-Out</p></div>
                  <div><p className="text-2xl font-bold">{totalSettlement > 0 ? `£${totalSettlement.toLocaleString("en-GB", { maximumFractionDigits: 0 })}` : "—"}</p><p className="text-xs text-muted-foreground">Total Settlement</p></div>
                </div>
                {Object.keys(gradeMap).length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">EUROP Grade Distribution</p>
                    <div className="flex flex-wrap gap-2">{Object.entries(gradeMap).map(([g, n]) => <Badge key={g} variant="secondary">{g}: {n}</Badge>)}</div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
type Tab = "weigh" | "finishing" | "deadweight" | "rt-checklist" | "reports" | "enterprise";

export default function BeefProductionPage() {
  const farmId = useAppStore(s => s.farmId);
  const [tab, setTab] = usePersistedTab<Tab>({ page: "beef-production", farmId, validIds: ["weigh", "finishing", "deadweight", "rt-checklist", "reports", "enterprise"], defaultTab: "weigh" });
  const [raiseTaskFor, setRaiseTaskFor] = useState<Record<string, unknown> | null>(null);

  // tabsReady defers the first tab render until after React's commit phase.
  // Zustand v5 persist uses useSyncExternalStore; the farmId null→1 transition
  // can land mid-render and leave the hook dispatcher in a torn state when a
  // tab component first mounts. By gating on tabsReady (set via useEffect, which
  // only fires after a full commit), tabs always mount in a stable React context.
  const [tabsReady, setTabsReady] = useState(false);
  useEffect(() => { if (farmId) setTabsReady(true); else setTabsReady(false); }, [farmId]);

  if (!farmId) {
    return (
      <AppLayout>
        <div className="p-8 text-center text-muted-foreground">Select a farm to view beef production records.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Scale className="w-6 h-6 text-amber-700" />
          <div>
            <h1 className="text-2xl font-bold">Beef & Cattle Production</h1>
            <p className="text-sm text-muted-foreground">Weigh-in & DLWG, finishing records, deadweight settlements and Red Tractor cattle checklist</p>
          </div>
        </div>

        <TabBar className="mb-6">
          <TabButton active={tab === "weigh"} onClick={() => setTab("weigh")}>Weigh-in & DLWG</TabButton>
          <TabButton active={tab === "finishing"} onClick={() => setTab("finishing")}>Finishing Records</TabButton>
          <TabButton active={tab === "deadweight"} onClick={() => setTab("deadweight")}>Deadweight Settlement</TabButton>
          <TabButton active={tab === "rt-checklist"} onClick={() => setTab("rt-checklist")}>RT Checklist</TabButton>
          <TabButton active={tab === "reports"} onClick={() => setTab("reports")}><BarChart3 className="w-3.5 h-3.5 mr-1 inline" />Reports</TabButton>
          <TabButton active={tab === "enterprise"} onClick={() => setTab("enterprise")}><TrendingUp className="w-3.5 h-3.5 mr-1 inline" />Enterprise Report</TabButton>
        </TabBar>

        {tabsReady && tab === "weigh" && <WeighTab farmId={farmId} onRaiseTask={setRaiseTaskFor} />}
        {tabsReady && tab === "finishing" && <FinishingTab farmId={farmId} />}
        {tabsReady && tab === "deadweight" && <DeadweightTab farmId={farmId} />}
        {tabsReady && tab === "rt-checklist" && <RTChecklistTab farmId={farmId} />}
        {tabsReady && tab === "reports" && <ReportsTab farmId={farmId} />}
        {tabsReady && tab === "enterprise" && <BeefEnterpriseReport farmId={farmId} />}
      </div>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Beef Weigh Review — ${raiseTaskFor.groupRef ?? raiseTaskFor.breed ?? "Group"}`}
          defaultDescription={`Avg weight: ${raiseTaskFor.averageLiveWeightKg ?? "—"} kg · DLWG: ${raiseTaskFor.dlwgGPerDay ?? "—"} g/day · BCS: ${raiseTaskFor.averageBcsScore ?? "—"}`}
          module="beef"
        />
      )}
    </AppLayout>
  );
}
