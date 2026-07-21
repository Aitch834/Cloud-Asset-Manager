// @ts-nocheck
import { useState, useMemo, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Eye, Scissors, Scale, Bug, ShieldCheck, ClipboardList, AlertTriangle, Printer, BarChart3, Paperclip } from "lucide-react";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { openPrintWindow } from "@/lib/print-report";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { SheepEnterpriseReport } from "@/components/SheepEnterpriseReport";
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
import { useFarmMembers } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";

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

// ─── FLOCKS PANEL (read-only — managed via Livestock → Herds & Animals) ────────
function FlocksTab({ farmId }: { farmId: number }) {
  const { data: herds = [], isLoading } = useQuery({ queryKey: ["sheep-flocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-flocks`), { credentials: "include" }).then(r => r.json()) });
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <strong>Flocks are managed in Livestock → Herds &amp; Animals.</strong><br />
        Records in the tabs below link to those herds. To create, edit, or archive a flock, use the Livestock module.
      </div>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Registered Flocks / Herds <span className="font-normal text-muted-foreground">({(herds as Record<string, unknown>[]).length})</span></h3>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "flockName", label: "Name" },
            { key: "breed", label: "Breed" },
            { key: "flockPurpose", label: "Type / Purpose" },
            { key: "herdFlockNumber", label: "Herd / Flock No." },
            { key: "status", label: "Status", render: r => <Badge variant={r.status === "active" ? "default" : "secondary"}>{fmt(r.status)}</Badge> },
          ]}
          rows={herds as Record<string, unknown>[]}
        />
      )}
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
  const [yearFilter, setYearFilter] = useState<string>("all");
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-tupping", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-tupping-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/sheep-tupping-records/${editing.id}`) : api(`farms/${farmId}/sheep-tupping-records`);
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      const tupping = await res.json();
      const cidrUsed = body.progesteroneUsed === "true" || body.progesteroneUsed === true;
      if (cidrUsed && body.cidrProductName) {
        const adminDate = body.cidrAdminDate || body.tuppingStartDate;
        const wdDays = parseInt(String(body.cidrWithdrawalDays ?? "1")) || 1;
        const wdEnd = adminDate ? new Date(new Date(String(adminDate)).getTime() + wdDays * 86400000).toISOString().slice(0, 10) : null;
        await fetch(api(`farms/${farmId}/medicine-records`), {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({
            medicineName: body.cidrProductName, batchNumber: body.cidrBatchNumber || null,
            dosage: body.cidrDosePerEwe || "1 device per ewe",
            administrationRoute: body.cidrRoute || "Intravaginal",
            administeredBy: body.cidrAdministeredBy || null, administeredDate: adminDate,
            vetName: body.cidrPrescribingVet || null, treatmentScope: "group",
            treatedAnimalCount: body.ewesExposed ? parseInt(String(body.ewesExposed)) : null,
            withdrawalPeriodDays: wdDays, withdrawalEndDate: wdEnd,
            reason: "Reproductive cycle synchronisation — tupping preparation",
            notes: `Tupping: ${body.tuppingStartDate} → ${body.tuppingEndDate || "—"} | Ram: ${body.ramBreed || ""} ${body.ramTagNumber || ""} | Rx ref: ${body.cidrPrescriptionRef || "—"} | Practice: ${body.cidrVetPractice || "—"}`,
            source: "tupping-record",
          }),
        });
      }
      if (cidrUsed && body.createVetVisit === "true" && body.cidrPrescribingVet) {
        await fetch(api(`farms/${farmId}/vet-visits`), {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({
            visitDate: body.cidrAdminDate || body.tuppingStartDate,
            vetName: body.cidrPrescribingVet, vetPractice: body.cidrVetPractice || null,
            reasonForVisit: "POM-V prescription — Progesterone/CIDR for cycle synchronisation",
            treatmentsCarriedOut: `${body.cidrProductName || "CIDR/Progesterone"} administered to ${body.ewesExposed || "?"} ewes`,
            prescriptionsIssued: body.cidrPrescriptionRef || null,
            notes: `Tupping: ${body.tuppingStartDate} → ${body.tuppingEndDate || "—"} | Ram: ${body.ramBreed || ""} ${body.ramTagNumber || ""}`,
          }),
        });
      }
      if (cidrUsed && body.cidrCostGbp && parseFloat(String(body.cidrCostGbp)) > 0) {
        await fetch(api(`farms/${farmId}/financial-transactions`), {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
          body: JSON.stringify({
            transactionType: "expense", category: "Veterinary & Medicine",
            description: `${body.cidrProductName || "CIDR/Progesterone"} — ${body.ewesExposed || ""} ewes (tupping ${body.tuppingStartDate})`,
            amountPence: Math.round(parseFloat(String(body.cidrCostGbp)) * 100),
            transactionDate: body.cidrAdminDate || body.tuppingStartDate,
            reference: body.cidrPrescriptionRef || null, vendorCustomer: body.cidrVetPractice || null,
            notes: "Auto-created from tupping record (CIDR/Progesterone cost)",
          }),
        });
      }
      return tupping;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-tupping", farmId] }); qc.invalidateQueries({ queryKey: ["medicine-records", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-tupping-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-tupping", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  function openAdd() { setEditing(null); setForm({ progesteroneUsed: "false" }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }

  const years = useMemo(() => Array.from(new Set((rows as Record<string, unknown>[]).map(r => String(r.tuppingStartDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = useMemo(() => yearFilter === "all" ? rows as Record<string, unknown>[] : (rows as Record<string, unknown>[]).filter(r => String(r.tuppingStartDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);

  function printTuppingRecords() {
    const tableRows = filtered.map(r => `<tr>
      <td>${fmtDate(r.tuppingStartDate)}</td><td>${fmtDate(r.tuppingEndDate)}</td><td>${fmt(r.ramBreed)}</td><td>${fmt(r.ramTagNumber)}</td><td>${fmt(r.ewesExposed)}</td><td>${fmtDate(r.expectedLambingStart)}</td><td>${r.progesteroneUsed ? "Yes" : "No"}</td><td>${fmt(r.notes)}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Tupping Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style></head><body>
<h1>Tupping Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1>
<h2>Red Tractor Sheep Assurance · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Start Date</th><th>End Date</th><th>Ram Breed</th><th>Ram Tag</th><th>Ewes Exposed</th><th>Expected Lambing</th><th>Progesterone</th><th>Notes</th></tr></thead>
<tbody>${tableRows}</tbody></table>
<p class="footer">Red Tractor Sheep Assurance requires tupping records to be maintained and available at audit. Retain records for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p>
</body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Tupping Records</h3>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && <Button size="sm" variant="outline" onClick={printTuppingRecords}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
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
            { key: "progesteroneUsed", label: "Progesterone", render: r => r.progesteroneUsed ? <Badge className="bg-purple-100 text-purple-800 border border-purple-200 text-xs font-medium">CIDR / Prog.</Badge> : null },
            { key: "_attach", label: "", render: r => r.id ? <RecordAttachments recordType="sheep-tupping-records" recordId={r.id as number} farmId={farmId} compact /> : null },
          ]}
          rows={filtered}
          onView={setViewing}
          onEdit={openEdit}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tupping Record Details</DialogTitle></DialogHeader>
          {viewing && <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Start Date", fmtDate(viewing.tuppingStartDate)], ["End Date", fmtDate(viewing.tuppingEndDate)], ["Ram Breed", fmt(viewing.ramBreed)], ["Ram Tag", fmt(viewing.ramTagNumber)], ["Ram Source", fmt(viewing.ramSource)], ["Ewes Exposed", fmt(viewing.ewesExposed)], ["Tupping Method", fmt(viewing.tuppingMethod)], ["Harness Colour", fmt(viewing.harnessColour)], ["Progesterone Used", viewing.progesteroneUsed ? "Yes" : "No"], ["Expected Lambing Start", fmtDate(viewing.expectedLambingStart)], ["Expected Lambing End", fmtDate(viewing.expectedLambingEnd)]].map(([label, value]) => (
                <div key={String(label)}><span className="text-muted-foreground">{label}:</span> <span className="font-medium">{String(value)}</span></div>
              ))}
              {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>
            {viewing.id && <RecordAttachments recordType="sheep-tupping-records" recordId={viewing.id as number} farmId={farmId} />}
          </>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Tupping Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date *"><Input type="date" value={form.tuppingStartDate ?? ""} onChange={e => sf("tuppingStartDate", e.target.value)} /></Field>
            <Field label="End Date"><Input type="date" value={form.tuppingEndDate ?? ""} onChange={e => sf("tuppingEndDate", e.target.value)} /></Field>
            <Field label="Ram Breed">
              <Select value={form.ramBreed ?? ""} onValueChange={v => sf("ramBreed", v)}>
                <SelectTrigger><SelectValue placeholder="Select breed..." /></SelectTrigger>
                <SelectContent>{["Suffolk","Texel","Charollais","Beltex","Bluefaced Leicester","Border Leicester","Hampshire Down","Poll Dorset","Rouge de l'Ouest","Vendeen","Lleyn","Cheviot","Swaledale","Herdwick","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Ram Tag Number"><Input value={form.ramTagNumber ?? ""} onChange={e => sf("ramTagNumber", e.target.value)} /></Field>
            <Field label="Ram Source">
              <Select value={form.ramSource ?? ""} onValueChange={v => sf("ramSource", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Home bred","Purchased at auction/market","Private sale","AI centre","ET donor flock","Hired/loaned","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Ewes Exposed"><Input type="number" min="1" step="1" value={form.ewesExposed ?? ""} onChange={e => sf("ewesExposed", e.target.value)} /></Field>
            <Field label="Tupping Method">
              <Select value={form.tuppingMethod ?? ""} onValueChange={v => sf("tuppingMethod", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Natural service","AI (fresh)","AI (frozen)","ET"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Harness Colour">
              <Select value={form.harnessColour ?? ""} onValueChange={v => sf("harnessColour", v)}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>{["Red","Orange","Yellow","Green","Blue","Purple","Pink","None"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Expected Lambing Start"><Input type="date" value={form.expectedLambingStart ?? ""} onChange={e => sf("expectedLambingStart", e.target.value)} /></Field>
            <Field label="Expected Lambing End"><Input type="date" value={form.expectedLambingEnd ?? ""} onChange={e => sf("expectedLambingEnd", e.target.value)} /></Field>
            <div className="col-span-2 flex items-center gap-2">
              <Checkbox checked={form.progesteroneUsed === "true"} onCheckedChange={v => sf("progesteroneUsed", v ? "true" : "false")} id="prog" />
              <Label htmlFor="prog">Progesterone / CIDR used (POM-V)</Label>
            </div>
            {form.progesteroneUsed === "true" && (
              <div className="col-span-2 space-y-3 rounded-md border border-amber-300 bg-amber-50 p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="text-xs font-semibold text-amber-800">POM-V Medicine Record — Veterinary Medicines Regulations 2013 &amp; Red Tractor Sheep Assurance</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Product Name *">
                    <Select value={form.cidrProductName ?? ""} onValueChange={v => sf("cidrProductName", v)}>
                      <SelectTrigger><SelectValue placeholder="Select product..." /></SelectTrigger>
                      <SelectContent>{["Chronogest CR 0.3g (progesterone sponge)","Eazi-Breed CIDR Sheep (0.3g progesterone)","Chronogest CR 0.33g","Cue-Mate","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Batch Number *"><Input value={form.cidrBatchNumber ?? ""} onChange={e => sf("cidrBatchNumber", e.target.value)} placeholder="e.g. B24031A" /></Field>
                  <Field label="Dose / Qty per Ewe"><Input value={form.cidrDosePerEwe ?? "1 sponge / device"} onChange={e => sf("cidrDosePerEwe", e.target.value)} /></Field>
                  <Field label="Route of Administration">
                    <Select value={form.cidrRoute ?? "Intravaginal"} onValueChange={v => sf("cidrRoute", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{["Intravaginal","Subcutaneous injection (GnRH / eCG)","Intramuscular injection"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Administered By"><Input value={form.cidrAdministeredBy ?? ""} onChange={e => sf("cidrAdministeredBy", e.target.value)} placeholder="Person who inserted devices" /></Field>
                  <Field label="Administration Date"><Input type="date" value={form.cidrAdminDate || form.tuppingStartDate || ""} onChange={e => sf("cidrAdminDate", e.target.value)} /></Field>
                  <Field label="Prescribing Vet *"><Input value={form.cidrPrescribingVet ?? ""} onChange={e => sf("cidrPrescribingVet", e.target.value)} placeholder="Required for POM-V" /></Field>
                  <Field label="Vet Practice"><Input value={form.cidrVetPractice ?? ""} onChange={e => sf("cidrVetPractice", e.target.value)} /></Field>
                  <Field label="Prescription Reference"><Input value={form.cidrPrescriptionRef ?? ""} onChange={e => sf("cidrPrescriptionRef", e.target.value)} placeholder="e.g. WP-2024-001" /></Field>
                  <Field label="Meat W/D (days)"><Input type="number" value={form.cidrWithdrawalDays ?? "1"} onChange={e => sf("cidrWithdrawalDays", e.target.value)} /></Field>
                  <Field label="Total Medicine Cost (£)"><Input type="number" step="0.01" value={form.cidrCostGbp ?? ""} onChange={e => sf("cidrCostGbp", e.target.value)} placeholder="Optional — creates expense record" /></Field>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                  <Checkbox checked={form.createVetVisit === "true"} onCheckedChange={v => sf("createVetVisit", v ? "true" : "false")} id="create-vet-visit" />
                  <Label htmlFor="create-vet-visit" className="text-xs cursor-pointer font-normal text-amber-900">Also create a Vet Visit entry in the Vet Ledger</Label>
                </div>
                <p className="text-xs text-green-700 font-medium">✓ A Medicine Register entry will be created automatically in Livestock → Medicines when saved.</p>
              </div>
            )}
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
  const [yearFilter, setYearFilter] = useState<string>("all");
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-scanning", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-scanning-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-scanning-records/${editing.id}`) : api(`farms/${farmId}/sheep-scanning-records`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-scanning", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-scanning-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-scanning", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const years = useMemo(() => Array.from(new Set((rows as Record<string, unknown>[]).map(r => String(r.scanDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = useMemo(() => yearFilter === "all" ? rows as Record<string, unknown>[] : (rows as Record<string, unknown>[]).filter(r => String(r.scanDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);

  function printScanningRecords() {
    const tableRows = filtered.map(r => `<tr><td>${fmtDate(r.scanDate)}</td><td>${fmt(r.scannerName)}</td><td>${fmt(r.ewesScanned)}</td><td>${fmt(r.ewesInLamb)}</td><td>${fmt(r.ewesBare)}</td><td>${fmt(r.singlesCount)}</td><td>${fmt(r.twinsCount)}</td><td>${fmt(r.triplesCount)}</td><td>${fmt(r.quadsCount)}</td><td>${fmt(r.scanningPercentage)}%</td><td>${fmt(r.expectedLambsTotal)}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Scanning Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body>
<h1>Scanning Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Sheep Assurance · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Scan Date</th><th>Scanner</th><th>Scanned</th><th>In Lamb</th><th>Bare</th><th>Singles</th><th>Twins</th><th>Triplets</th><th>Quads</th><th>Scanning %</th><th>Expected Lambs</th></tr></thead><tbody>${tableRows}</tbody></table>
<p class="footer">Red Tractor Sheep Assurance: scanning records must be maintained and available at audit. Retain for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p></body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Scanning Records</h3>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && <Button size="sm" variant="outline" onClick={printScanningRecords}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "scanDate", label: "Scan Date", render: r => fmtDate(r.scanDate) },
            { key: "scannerName", label: "Scanner" },
            { key: "ewesScanned", label: "Scanned" },
            { key: "ewesInLamb", label: "In Lamb" },
            { key: "scanningPercentage", label: "Scanning %" },
            { key: "expectedLambsTotal", label: "Expected Lambs" },
            { key: "_attach", label: "", render: r => r.id ? <RecordAttachments recordType="sheep-scanning-records" recordId={r.id as number} farmId={farmId} compact /> : null },
          ]}
          rows={filtered}
          onView={setViewing}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Scanning Record</DialogTitle></DialogHeader>
          {viewing && <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Scan Date", fmtDate(viewing.scanDate)], ["Scanner", fmt(viewing.scannerName)], ["Ewes Scanned", fmt(viewing.ewesScanned)], ["Ewes In Lamb", fmt(viewing.ewesInLamb)], ["Ewes Bare", fmt(viewing.ewesBare)], ["Singles", fmt(viewing.singlesCount)], ["Twins", fmt(viewing.twinsCount)], ["Triplets", fmt(viewing.triplesCount)], ["Quads", fmt(viewing.quadsCount)], ["Scanning %", fmt(viewing.scanningPercentage)], ["Expected Lambs", fmt(viewing.expectedLambsTotal)]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
              {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>
            {viewing.id && <RecordAttachments recordType="sheep-scanning-records" recordId={viewing.id as number} farmId={farmId} />}
          </>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Scanning Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Scan Date *"><Input type="date" value={form.scanDate ?? ""} onChange={e => sf("scanDate", e.target.value)} /></Field>
            <Field label="Scanner Name"><Input value={form.scannerName ?? ""} onChange={e => sf("scannerName", e.target.value)} /></Field>
            <Field label="Ewes Scanned"><Input type="number" min="1" step="1" value={form.ewesScanned ?? ""} onChange={e => sf("ewesScanned", e.target.value)} /></Field>
            <Field label="Ewes In Lamb"><Input type="number" min="0" step="1" value={form.ewesInLamb ?? ""} onChange={e => sf("ewesInLamb", e.target.value)} /></Field>
            <Field label="Ewes Bare"><Input type="number" min="0" step="1" value={form.ewesBare ?? ""} onChange={e => sf("ewesBare", e.target.value)} /></Field>
            <Field label="Scanning %"><Input type="number" step="0.1" value={form.scanningPercentage ?? ""} onChange={e => sf("scanningPercentage", e.target.value)} /></Field>
            <Field label="Singles"><Input type="number" min="0" step="1" value={form.singlesCount ?? ""} onChange={e => sf("singlesCount", e.target.value)} /></Field>
            <Field label="Twins"><Input type="number" min="0" step="1" value={form.twinsCount ?? ""} onChange={e => sf("twinsCount", e.target.value)} /></Field>
            <Field label="Triplets"><Input type="number" min="0" step="1" value={form.triplesCount ?? ""} onChange={e => sf("triplesCount", e.target.value)} /></Field>
            <Field label="Expected Lambs Total"><Input type="number" min="0" step="1" value={form.expectedLambsTotal ?? ""} onChange={e => sf("expectedLambsTotal", e.target.value)} /></Field>
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
  const [yearFilter, setYearFilter] = useState<string>("all");

  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-weigh", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-weigh-records`), { credentials: "include" }).then(r => r.json()) });
  const { data: weighEquipList = [] } = useQuery({ queryKey: ["weighing-equipment", farmId], queryFn: () => fetch(api(`farms/${farmId}/weighing-equipment`), { credentials: "include" }).then(r => r.json()) });

  // Previous weigh record lookup — for auto-calc of Days and DLWG
  const prevWeigh = useQuery({
    queryKey: ["sheep-weigh-latest", farmId, form.animalCategory, form.weighDate],
    queryFn: async () => {
      const params = new URLSearchParams({ category: form.animalCategory ?? "", beforeDate: form.weighDate ?? "" });
      const res = await fetch(api(`farms/${farmId}/sheep-weigh-latest?${params}`), { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !editing && !!form.animalCategory && !!form.weighDate,
    staleTime: 60_000,
  });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/sheep-weigh-records/${editing.id}`) : api(`farms/${farmId}/sheep-weigh-records`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-weigh", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-weigh-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-weigh", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const years = useMemo(() => Array.from(new Set((rows as Record<string, unknown>[]).map(r => String(r.weighDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = useMemo(() => yearFilter === "all" ? rows as Record<string, unknown>[] : (rows as Record<string, unknown>[]).filter(r => String(r.weighDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);
  const equipMap = useMemo(() => Object.fromEntries((weighEquipList as Record<string, unknown>[]).map(e => [String(e.id), String(e.name)])), [weighEquipList]);

  // Auto-calculations (used as placeholder values & merged on save)
  const prevRec = prevWeigh.data as Record<string, unknown> | null;
  const calcTotalKg = useMemo(() => {
    const n = parseFloat(form.numberOfAnimalsWeighed ?? "");
    const avg = parseFloat(form.averageWeightKg ?? "");
    return Number.isFinite(n) && Number.isFinite(avg) && n > 0 && avg > 0 ? (n * avg).toFixed(1) : null;
  }, [form.numberOfAnimalsWeighed, form.averageWeightKg]);
  const calcDays = useMemo(() => {
    if (!prevRec?.weighDate || !form.weighDate) return null;
    const diff = new Date(form.weighDate).getTime() - new Date(String(prevRec.weighDate)).getTime();
    return diff > 0 ? Math.round(diff / 86400000) : null;
  }, [prevRec, form.weighDate]);
  const calcDlwg = useMemo(() => {
    const curr = parseFloat(form.averageWeightKg ?? "");
    if (!prevRec?.averageWeightKg || !Number.isFinite(curr) || !calcDays || calcDays <= 0) return null;
    return Math.round(((curr - parseFloat(String(prevRec.averageWeightKg))) * 1000) / calcDays);
  }, [prevRec, form.averageWeightKg, calcDays]);

  function handleSave() {
    const body = { ...form };
    if (!body.totalWeightKg && calcTotalKg) body.totalWeightKg = calcTotalKg;
    if (!body.daysSincePreviousWeigh && calcDays != null) body.daysSincePreviousWeigh = String(calcDays);
    if (!body.dlwgGPerDay && calcDlwg != null) body.dlwgGPerDay = String(calcDlwg);
    save.mutate(body);
  }

  function printWeighRecords() {
    const tableRows = filtered.map(r => `<tr><td>${fmtDate(r.weighDate)}</td><td>${fmt(r.weighBatchRef)}</td><td>${fmt(r.animalCategory)}</td><td>${fmt(r.numberOfAnimalsWeighed)}</td><td>${fmtNum(r.averageWeightKg)}</td><td>${fmtNum(r.totalWeightKg)}</td><td>${fmtNum(r.targetWeightKg)}</td><td>${fmtNum(r.dlwgGPerDay, 0)}</td><td>${fmt(r.bodyConditionScore)}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Sheep Weigh-in Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body>
<h1>Sheep Weigh-in &amp; Performance Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Sheep Assurance · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Batch Ref</th><th>Category</th><th>Count</th><th>Avg Wt (kg)</th><th>Total Wt (kg)</th><th>Target (kg)</th><th>DLWG (g/day)</th><th>BCS</th></tr></thead><tbody>${tableRows}</tbody></table>
<p class="footer">Red Tractor Sheep Assurance: weight records must be maintained to demonstrate welfare monitoring. Retain for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p></body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Weigh-in & Performance Records</h3>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && <Button size="sm" variant="outline" onClick={printWeighRecords}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => { setEditing(null); setForm({}); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Weigh</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "weighDate", label: "Date", render: r => fmtDate(r.weighDate) },
            { key: "weighBatchRef", label: "Batch Ref" },
            { key: "animalCategory", label: "Category" },
            { key: "numberOfAnimalsWeighed", label: "Count" },
            { key: "averageWeightKg", label: "Avg Wt (kg)", render: r => fmtNum(r.averageWeightKg) },
            { key: "dlwgGPerDay", label: "DLWG (g/day)", render: r => fmtNum(r.dlwgGPerDay, 0) },
            { key: "bodyConditionScore", label: "BCS" },
            { key: "_equip", label: "Equipment", render: r => r.weighingEquipmentId ? <span className="text-xs text-muted-foreground">{equipMap[String(r.weighingEquipmentId)] ?? "—"}</span> : null },
            { key: "_attach", label: "", render: r => r.id ? <RecordAttachments recordType="sheep-weigh-records" recordId={r.id as number} farmId={farmId} compact /> : null },
          ]}
          rows={filtered}
          onView={setViewing}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Weigh-in Record</DialogTitle></DialogHeader>
          {viewing && <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Date", fmtDate(viewing.weighDate)],
                ["Batch Ref", fmt(viewing.weighBatchRef)],
                ["Category", fmt(viewing.animalCategory)],
                ["Animals Weighed", fmt(viewing.numberOfAnimalsWeighed)],
                ["Avg Weight (kg)", fmtNum(viewing.averageWeightKg)],
                ["Total Weight (kg)", fmtNum(viewing.totalWeightKg)],
                ["Target Weight (kg)", fmtNum(viewing.targetWeightKg)],
                ["DLWG (g/day)", fmtNum(viewing.dlwgGPerDay, 0)],
                ["Days Since Last Weigh", fmt(viewing.daysSincePreviousWeigh)],
                ["BCS", fmt(viewing.bodyConditionScore)],
                ["Equipment", viewing.weighingEquipmentId ? (equipMap[String(viewing.weighingEquipmentId)] ?? "—") : "—"],
              ].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
              {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>
            {viewing.id && <RecordAttachments recordType="sheep-weigh-records" recordId={viewing.id as number} farmId={farmId} />}
          </>}
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
          defaultTitle={`Sheep Weigh Review — ${raiseTaskFor.weighBatchRef ?? raiseTaskFor.animalCategory ?? "Batch"}`}
          defaultDescription={`Avg weight: ${raiseTaskFor.averageWeightKg ?? "—"} kg · DLWG: ${raiseTaskFor.dlwgGPerDay ?? "—"} g/day · BCS: ${raiseTaskFor.bodyConditionScore ?? "—"}`}
          module="sheep"
        />
      )}

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); setForm({}); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Weigh Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Weigh Date *"><Input type="date" value={form.weighDate ?? ""} onChange={e => sf("weighDate", e.target.value)} /></Field>
            <Field label="Batch Ref"><Input value={form.weighBatchRef ?? ""} onChange={e => sf("weighBatchRef", e.target.value)} placeholder="e.g. Spring 2024 — Group A" /></Field>
            <div className="col-span-2">
              <Field label="Animal Category">
                <Select value={form.animalCategory ?? ""} onValueChange={v => sf("animalCategory", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{["Lambs (spring)","Lambs (autumn)","Store lambs","Hoggets","Ewes","Ram lambs"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>

            {/* Previous record info banner */}
            {prevRec && !editing && (
              <div className="col-span-2 flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                <Scale className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
                <div>
                  <strong>Previous record found:</strong> {fmtDate(prevRec.weighDate)} · Avg {fmtNum(prevRec.averageWeightKg)} kg
                  {calcDays != null ? ` · ${calcDays} days ago` : ""}
                  {" — Days and DLWG will be auto-calculated on save."}
                </div>
              </div>
            )}

            {/* Weighing Equipment */}
            <div className="col-span-2">
              <Field label="Weighing Equipment">
                <Select value={form.weighingEquipmentId ?? ""} onValueChange={v => sf("weighingEquipmentId", v)}>
                  <SelectTrigger><SelectValue placeholder={(weighEquipList as any[]).filter(e => e.status === "active").length ? "Select scale / crush…" : "No active equipment registered"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None selected</SelectItem>
                    {(weighEquipList as Record<string, unknown>[]).filter(e => e.status === "active").map(e => (
                      <SelectItem key={String(e.id)} value={String(e.id)}>{String(e.name)} — {String(e.type ?? "").replace(/_/g, " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Number Weighed"><Input type="number" min="1" step="1" value={form.numberOfAnimalsWeighed ?? ""} onChange={e => sf("numberOfAnimalsWeighed", e.target.value)} /></Field>
            <Field label="Avg Weight (kg)"><Input type="number" step="0.1" value={form.averageWeightKg ?? ""} onChange={e => sf("averageWeightKg", e.target.value)} /></Field>

            {/* Total weight — auto from N × Avg */}
            <Field label={<span className="flex items-center gap-1">Total Weight (kg){!form.totalWeightKg && calcTotalKg && !editing && <Badge className="ml-1 text-[9px] px-1 py-0 h-4 bg-blue-100 text-blue-700">auto</Badge>}</span>}>
              <Input type="number" step="0.1" value={form.totalWeightKg ?? ""} onChange={e => sf("totalWeightKg", e.target.value)} placeholder={!editing && calcTotalKg ? calcTotalKg : ""} className={!form.totalWeightKg && calcTotalKg && !editing ? "placeholder:text-blue-400 bg-blue-50/40" : ""} />
            </Field>
            <Field label="Target Weight (kg)"><Input type="number" step="0.1" value={form.targetWeightKg ?? ""} onChange={e => sf("targetWeightKg", e.target.value)} /></Field>

            {/* Days since last — auto from DB lookup */}
            <Field label={<span className="flex items-center gap-1">Days Since Last Weigh{!form.daysSincePreviousWeigh && calcDays != null && !editing && <Badge className="ml-1 text-[9px] px-1 py-0 h-4 bg-blue-100 text-blue-700">auto</Badge>}</span>}>
              <Input type="number" value={form.daysSincePreviousWeigh ?? ""} onChange={e => sf("daysSincePreviousWeigh", e.target.value)} placeholder={!editing && calcDays != null ? String(calcDays) : ""} className={!form.daysSincePreviousWeigh && calcDays != null && !editing ? "placeholder:text-blue-400 bg-blue-50/40" : ""} />
            </Field>

            {/* DLWG — auto from prev record */}
            <Field label={<span className="flex items-center gap-1">DLWG (g/day){!form.dlwgGPerDay && calcDlwg != null && !editing && <Badge className="ml-1 text-[9px] px-1 py-0 h-4 bg-blue-100 text-blue-700">auto</Badge>}</span>}>
              <Input type="number" step="1" value={form.dlwgGPerDay ?? ""} onChange={e => sf("dlwgGPerDay", e.target.value)} placeholder={!editing && calcDlwg != null ? String(calcDlwg) : ""} className={!form.dlwgGPerDay && calcDlwg != null && !editing ? "placeholder:text-blue-400 bg-blue-50/40" : ""} />
            </Field>

            <Field label="BCS (1–5, steps of 0.5)"><Input type="number" step="0.5" min="1" max="5" value={form.bodyConditionScore ?? ""} onChange={e => sf("bodyConditionScore", e.target.value)} /></Field>
            <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm({}); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={save.isPending}>{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── WEIGHING EQUIPMENT TAB ───────────────────────────────────────────────────
function WeighingEquipmentTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [calOpen, setCalOpen] = useState(false);
  const [calForm, setCalForm] = useState<Record<string, unknown>>({});
  const [form, setForm] = useState<Record<string, string>>({});
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ["weighing-equipment", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/weighing-equipment`), { credentials: "include" }).then(r => r.json()),
  });
  const { data: calibrations = [] } = useQuery({
    queryKey: ["weighing-equipment-calibrations", farmId, viewing?.id],
    queryFn: () => fetch(api(`farms/${farmId}/weighing-equipment/${viewing!.id}/calibrations`), { credentials: "include" }).then(r => r.json()),
    enabled: !!viewing?.id,
  });

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/weighing-equipment/${editing.id}`) : api(`farms/${farmId}/weighing-equipment`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["weighing-equipment", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/weighing-equipment/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weighing-equipment", farmId] }),
  });
  const saveCal = useMutation({
    mutationFn: (body: Record<string, unknown>) => fetch(api(`farms/${farmId}/weighing-equipment/${viewing!.id}/calibrations`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weighing-equipment-calibrations", farmId, viewing?.id] });
      qc.invalidateQueries({ queryKey: ["weighing-equipment", farmId] });
      setCalOpen(false); setCalForm({});
    },
  });

  const EQUIP_TYPES: Record<string, string> = {
    crush_scale: "Crush Scale", floor_scale: "Floor / Platform Scale", hanging_scale: "Hanging Scale",
    weigh_band: "Weigh Band / Tape", electronic_crate: "Electronic Weigh Crate",
    portable_weigher: "Portable Weigher", other: "Other",
  };

  const overdueAny = (equipment as Record<string, unknown>[]).some(e =>
    e.status === "active" && e.nextCalibrationDue && new Date(String(e.nextCalibrationDue)) < new Date()
  );

  function CalibBadge({ equip }: { equip: Record<string, unknown> }) {
    if (!equip.nextCalibrationDue) return <Badge variant="outline" className="text-xs font-normal">Not set</Badge>;
    const daysUntil = Math.ceil((new Date(String(equip.nextCalibrationDue)).getTime() - Date.now()) / 86400000);
    if (daysUntil < 0) return <Badge className="bg-red-100 text-red-800 text-xs font-normal">Overdue {Math.abs(daysUntil)}d</Badge>;
    if (daysUntil <= 30) return <Badge className="bg-amber-100 text-amber-800 text-xs font-normal">Due in {daysUntil}d</Badge>;
    return <Badge className="bg-green-100 text-green-800 text-xs font-normal">{fmtDate(equip.nextCalibrationDue)}</Badge>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold text-sm">Weighing Equipment Register</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Register livestock weighing equipment and track calibration dates for Red Tractor compliance and accuracy assurance.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ calibrationIntervalMonths: "12", status: "active" }); setOpen(true); }}>
          <Plus className="w-4 h-4 mr-1" />Add Equipment
        </Button>
      </div>

      {overdueAny && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span><strong>Calibration overdue</strong> — one or more items require calibration. Arrange immediately to maintain weighing accuracy.</span>
        </div>
      )}

      {isLoading ? <Loader2 className="animate-spin" /> : (equipment as Record<string, unknown>[]).length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">
          <Scale className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No equipment registered</p>
          <p className="text-xs mt-1">Add your first scale or crush to begin tracking calibrations.</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b">
                {["Name / Type", "Last Calibration", "Next Due", "Status", ""].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(equipment as Record<string, unknown>[]).map(e => (
                <tr key={String(e.id)} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-3 py-2">
                    <div className="font-medium text-sm">{String(e.name)}</div>
                    <div className="text-xs text-muted-foreground">
                      {EQUIP_TYPES[String(e.type ?? "")] ?? String(e.type ?? "")}
                      {e.manufacturer ? ` · ${e.manufacturer}` : ""}
                      {e.model ? ` ${e.model}` : ""}
                      {e.location ? ` · ${e.location}` : ""}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {e.lastCalibrationDate ? (
                      <div>
                        <div className="text-xs">{fmtDate(e.lastCalibrationDate)}</div>
                        {e.lastCalibrationResult && (
                          <Badge className={`text-xs mt-0.5 font-normal ${e.lastCalibrationResult === "pass" ? "bg-green-100 text-green-800" : e.lastCalibrationResult === "advisory" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                            {String(e.lastCalibrationResult)}
                          </Badge>
                        )}
                      </div>
                    ) : <span className="text-muted-foreground text-xs">Not recorded</span>}
                  </td>
                  <td className="px-3 py-2"><CalibBadge equip={e} /></td>
                  <td className="px-3 py-2">
                    <Badge variant={e.status === "active" ? "default" : "secondary"} className="text-xs font-normal">{String(e.status ?? "").replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" title="View / Calibrations" onClick={() => setViewing(e)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditing(e); setForm(Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => del.mutate(e.id as number)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View / Calibration history dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewing && String(viewing.name)}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  ["Type", EQUIP_TYPES[String(viewing.type ?? "")] ?? fmt(viewing.type)],
                  ["Manufacturer", fmt(viewing.manufacturer)],
                  ["Model", fmt(viewing.model)],
                  ["Serial Number", fmt(viewing.serialNumber)],
                  ["Location", fmt(viewing.location)],
                  ["Status", fmt(viewing.status)],
                  ["Purchase Date", fmtDate(viewing.purchaseDate)],
                  ["Calibration Interval", viewing.calibrationIntervalMonths ? `${viewing.calibrationIntervalMonths} months` : "—"],
                  ["Last Calibration", fmtDate(viewing.lastCalibrationDate)],
                  ["Last Result", fmt(viewing.lastCalibrationResult)],
                  ["Calibrated By", fmt(viewing.calibratedBy)],
                  ["Next Due", fmtDate(viewing.nextCalibrationDue)],
                ].map(([l, v]) => (
                  <div key={String(l)}><span className="text-muted-foreground text-xs">{l}</span><div className="font-medium text-sm">{String(v)}</div></div>
                ))}
                {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground text-xs">Notes</span><div className="text-sm">{fmt(viewing.notes)}</div></div>}
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold">Calibration History</h4>
                  <Button size="sm" onClick={() => { setCalForm({ calibrationDate: new Date().toISOString().slice(0, 10) }); setCalOpen(true); }}>
                    <Plus className="w-3.5 h-3.5 mr-1" />Log Calibration
                  </Button>
                </div>
                {(calibrations as Record<string, unknown>[]).length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No calibrations logged yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(calibrations as Record<string, unknown>[]).map(c => (
                      <div key={String(c.id)} className="flex items-start gap-2 p-2.5 bg-muted/30 rounded-lg text-xs">
                        <div className="flex-1">
                          <div className="font-medium">{fmtDate(c.calibrationDate)}{c.calibratedBy ? ` · ${String(c.calibratedBy)}` : ""}</div>
                          {c.certificateRef && <div className="text-muted-foreground">Cert ref: {String(c.certificateRef)}</div>}
                          {c.nextDueDate && <div className="text-muted-foreground">Next due: {fmtDate(c.nextDueDate)}</div>}
                          {c.notes && <div className="mt-0.5">{String(c.notes)}</div>}
                        </div>
                        <Badge className={`text-xs font-normal ${c.result === "pass" ? "bg-green-100 text-green-800" : c.result === "advisory" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                          {String(c.result)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Calibration dialog */}
      <Dialog open={calOpen} onOpenChange={setCalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Log Calibration / Inspection{viewing ? ` — ${String(viewing.name)}` : ""}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Field label="Calibration Date *">
              <Input type="date" value={calForm.calibrationDate ?? ""} onChange={e => {
                const d = e.target.value;
                setCalForm(f => {
                  const interval = viewing?.calibrationIntervalMonths ? parseInt(String(viewing.calibrationIntervalMonths)) : null;
                  let nextDue = f.nextDueDate;
                  if (d && interval) {
                    const nd = new Date(d + "T00:00:00");
                    nd.setMonth(nd.getMonth() + interval);
                    nextDue = nd.toISOString().slice(0, 10);
                  }
                  return { ...f, calibrationDate: d, nextDueDate: nextDue ?? "" };
                });
              }} />
            </Field>
            <Field label="Result *">
              <Select value={calForm.result ?? ""} onValueChange={v => setCalForm(f => ({ ...f, result: v }))}>
                <SelectTrigger><SelectValue placeholder="Select result…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="advisory">Advisory (minor adjustment needed)</SelectItem>
                  <SelectItem value="fail">Fail (take out of service)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Contractor / Supplier"><BuyerCombobox farmId={farmId!} types={["contractor", "general"]} valueId={(calForm.calibratedBySupplierId as number) ?? null} valueName={String(calForm.calibratedBy ?? "")} onChange={(id, name) => setCalForm(f => ({ ...f, calibratedBySupplierId: id, calibratedBy: name }))} /></Field>
            <Field label="Certificate / Reference No."><Input value={calForm.certificateRef ?? ""} onChange={e => setCalForm(f => ({ ...f, certificateRef: e.target.value }))} /></Field>
            <Field label="Next Due Date">
              <Input type="date" value={calForm.nextDueDate ?? ""} onChange={e => setCalForm(f => ({ ...f, nextDueDate: e.target.value }))} />
              {viewing?.calibrationIntervalMonths && <p className="text-xs text-muted-foreground mt-1">Auto-calculated from {String(viewing.calibrationIntervalMonths)}-month interval — adjust if needed</p>}
            </Field>
            <Field label="Notes"><Textarea value={calForm.notes ?? ""} onChange={e => setCalForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCalOpen(false)}>Cancel</Button>
            <Button onClick={() => saveCal.mutate(calForm)} disabled={saveCal.isPending || !calForm.result || !calForm.calibrationDate}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Equipment dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); setForm({}); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Register"} Weighing Equipment</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Field label="Equipment Name *"><Input value={form.name ?? ""} onChange={e => sf("name", e.target.value)} placeholder="e.g. Main Yard Crush Scale" /></Field></div>
            <Field label="Type *">
              <Select value={form.type ?? ""} onValueChange={v => sf("type", v)}>
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(EQUIP_TYPES).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status ?? "active"} onValueChange={v => sf("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="out_of_service">Out of Service</SelectItem>
                  <SelectItem value="decommissioned">Decommissioned</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Manufacturer"><Input value={form.manufacturer ?? ""} onChange={e => sf("manufacturer", e.target.value)} /></Field>
            <Field label="Model"><Input value={form.model ?? ""} onChange={e => sf("model", e.target.value)} /></Field>
            <Field label="Serial Number"><Input value={form.serialNumber ?? ""} onChange={e => sf("serialNumber", e.target.value)} /></Field>
            <Field label="Location"><Input value={form.location ?? ""} onChange={e => sf("location", e.target.value)} placeholder="e.g. Main yard, Loading bay" /></Field>
            <Field label="Purchase Date"><Input type="date" value={form.purchaseDate ?? ""} onChange={e => sf("purchaseDate", e.target.value)} /></Field>
            <Field label="Calibration Interval (months)"><Input type="number" min="1" value={form.calibrationIntervalMonths ?? "12"} onChange={e => sf("calibrationIntervalMonths", e.target.value)} /></Field>
            <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm({}); }}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.name || !form.type}>{editing ? "Save Changes" : "Register"}</Button>
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
  const [yearFilter, setYearFilter] = useState<string>("all");
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-shearing", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-shearing-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-shearing-records/${editing.id}`) : api(`farms/${farmId}/sheep-shearing-records`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-shearing", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-shearing-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-shearing", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const years = useMemo(() => Array.from(new Set((rows as Record<string, unknown>[]).map(r => String(r.shearingDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = useMemo(() => yearFilter === "all" ? rows as Record<string, unknown>[] : (rows as Record<string, unknown>[]).filter(r => String(r.shearingDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);

  function printShearingRecords() {
    const tableRows = filtered.map(r => `<tr><td>${fmtDate(r.shearingDate)}</td><td>${fmt(r.shearerName)}</td><td>${r.isContractor ? "Contractor" : "Own staff"}</td><td>${fmt(r.numberOfSheepSheared)}</td><td>${fmtNum(r.woolWeightKg)}</td><td>${fmt(r.woolGrade)}</td><td>${fmt(r.britishWoolBoardRef)}</td><td>${gbp(r.woolSaleValue)}</td><td>${r.ectoparasiteTreatmentApplied ? "Yes" : "No"}</td><td>${fmt(r.treatmentProductName)}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Shearing Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm;size:landscape}}</style></head><body>
<h1>Shearing Records${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Sheep Assurance · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2>
<table><thead><tr><th>Date</th><th>Shearer</th><th>Contractor?</th><th>Head Sheared</th><th>Wool (kg)</th><th>Grade</th><th>BWB Ref</th><th>Sale Value</th><th>Ectoparasite Tx</th><th>Treatment Product</th></tr></thead><tbody>${tableRows}</tbody></table>
<p class="footer">Red Tractor Sheep Assurance: shearing records including any ectoparasite treatment applied must be maintained and available at audit. Retain for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p></body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Shearing Records</h3>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && <Button size="sm" variant="outline" onClick={printShearingRecords}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => { setEditing(null); setForm({ isContractor: "false", ectoparasiteTreatmentApplied: "false" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
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
            { key: "_attach", label: "", render: r => r.id ? <RecordAttachments recordType="sheep-shearing-records" recordId={r.id as number} farmId={farmId} compact /> : null },
          ]}
          rows={filtered}
          onView={setViewing}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Shearing Record</DialogTitle></DialogHeader>
          {viewing && <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Date", fmtDate(viewing.shearingDate)], ["Shearer", fmt(viewing.shearerName)], ["Contractor", viewing.isContractor ? "Yes" : "No"], ["Head Sheared", fmt(viewing.numberOfSheepSheared)], ["Wool Weight (kg)", fmtNum(viewing.woolWeightKg)], ["Wool Grade", fmt(viewing.woolGrade)], ["British Wool Board Ref", fmt(viewing.britishWoolBoardRef)], ["Sale Value", gbp(viewing.woolSaleValue)], ["Ectoparasite Treatment", viewing.ectoparasiteTreatmentApplied ? "Yes" : "No"], ["Treatment Product", fmt(viewing.treatmentProductName)]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
              {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>
            {viewing.id && <RecordAttachments recordType="sheep-shearing-records" recordId={viewing.id as number} farmId={farmId} />}
          </>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Shearing Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Shearing Date *"><Input type="date" value={form.shearingDate ?? ""} onChange={e => sf("shearingDate", e.target.value)} /></Field>
            <Field label="Shearer Name"><Input value={form.shearerName ?? ""} onChange={e => sf("shearerName", e.target.value)} /></Field>
            <Field label="Head Sheared"><Input type="number" min="1" step="1" value={form.numberOfSheepSheared ?? ""} onChange={e => sf("numberOfSheepSheared", e.target.value)} /></Field>
            <Field label="Wool Weight (kg)"><Input type="number" step="0.1" value={form.woolWeightKg ?? ""} onChange={e => sf("woolWeightKg", e.target.value)} /></Field>
            <Field label="Wool Grade">
              <Select value={form.woolGrade ?? ""} onValueChange={v => sf("woolGrade", v)}>
                <SelectTrigger><SelectValue placeholder="Select grade..." /></SelectTrigger>
                <SelectContent>{["Fine (Merino)","Medium (DKDF)","Coarse (Herdwick/Swaledale)","Double Knit (DK)","Kemp","Locks","Broken/Tender","Crutchings/Bellies","Dags","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
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
  const [raiseTaskFor, setRaiseTaskFor] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [vaccYearFilter, setVaccYearFilter] = useState<string>("all");
  const [diseaseYearFilter, setDiseaseYearFilter] = useState<string>("all");
  const { data: vaccRows = [], isLoading: vLoading } = useQuery({ queryKey: ["sheep-vacc", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-vaccination-programmes`), { credentials: "include" }).then(r => r.json()) });
  const { data: diseaseRows = [], isLoading: dLoading } = useQuery({ queryKey: ["sheep-disease", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-disease-monitoring`), { credentials: "include" }).then(r => r.json()) });
  const saveVacc = useMutation({ mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-vaccination-programmes/${editing.id}`) : api(`farms/${farmId}/sheep-vaccination-programmes`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-vacc", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const saveDisease = useMutation({ mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-disease-monitoring/${editing.id}`) : api(`farms/${farmId}/sheep-disease-monitoring`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-disease", farmId] }); qc.invalidateQueries({ queryKey: ["notifications", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const delVacc = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-vaccination-programmes/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-vacc", farmId] }) });
  const delDisease = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-disease-monitoring/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-disease", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const vaccYears = useMemo(() => Array.from(new Set((vaccRows as Record<string, unknown>[]).map(r => String(r.vaccinationDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [vaccRows]);
  const filteredVacc = useMemo(() => vaccYearFilter === "all" ? vaccRows as Record<string, unknown>[] : (vaccRows as Record<string, unknown>[]).filter(r => String(r.vaccinationDate ?? "").startsWith(vaccYearFilter)), [vaccRows, vaccYearFilter]);
  const diseaseYears = useMemo(() => Array.from(new Set((diseaseRows as Record<string, unknown>[]).map(r => String(r.observationDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [diseaseRows]);
  const filteredDisease = useMemo(() => diseaseYearFilter === "all" ? diseaseRows as Record<string, unknown>[] : (diseaseRows as Record<string, unknown>[]).filter(r => String(r.observationDate ?? "").startsWith(diseaseYearFilter)), [diseaseRows, diseaseYearFilter]);

  function printVaccRecords() {
    const tableRows = filteredVacc.map(r => `<tr><td>${fmtDate(r.vaccinationDate)}</td><td>${fmt(r.programmeName)}</td><td>${fmt(r.vaccineProduct)}</td><td>${fmt(r.diseaseTargeted)}</td><td>${fmt(r.numberOfAnimalsVaccinated)}</td><td>${fmt(r.administeredBy)}</td><td>${fmtDate(r.boosterDueDate)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Vaccination Programmes</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style></head><body><h1>Vaccination Programmes${vaccYearFilter !== "all" ? ` — ${vaccYearFilter}` : ""}</h1><h2>Red Tractor Sheep · ${filteredVacc.length} record${filteredVacc.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Programme</th><th>Vaccine</th><th>Disease</th><th>Animals</th><th>Administered By</th><th>Booster Due</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Red Tractor Sheep: vaccination records must be retained for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p></body></html>`);
  }

  function printDiseaseRecords() {
    const tableRows = filteredDisease.map(r => `<tr><td>${fmtDate(r.observationDate)}</td><td>${fmt(r.condition)}</td><td>${fmt(r.numberOfAnimalsAffected)}</td><td>${fmt(r.severity)}</td><td>${fmt(r.actionTaken)}</td><td>${fmt(r.outcome)}</td><td>${r.reportableDisease ? "Yes" : "No"}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>Disease Monitoring</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style></head><body><h1>Disease Monitoring Records${diseaseYearFilter !== "all" ? ` — ${diseaseYearFilter}` : ""}</h1><h2>Red Tractor Sheep · ${filteredDisease.length} record${filteredDisease.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Condition</th><th>Animals</th><th>Severity</th><th>Action</th><th>Outcome</th><th>Reportable</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Red Tractor Sheep: disease monitoring records must be retained for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p></body></html>`);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b pb-2">
        <Button size="sm" variant={subTab === "vaccinations" ? "default" : "ghost"} onClick={() => setSubTab("vaccinations")}>Vaccination Programmes</Button>
        <Button size="sm" variant={subTab === "disease" ? "default" : "ghost"} onClick={() => setSubTab("disease")}>Disease Monitoring</Button>
      </div>

      {subTab === "vaccinations" && <>
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Vaccination Programmes</h3>
            <Select value={vaccYearFilter} onValueChange={setVaccYearFilter}>
              <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All years</SelectItem>{vaccYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {filteredVacc.length > 0 && <Button size="sm" variant="outline" onClick={printVaccRecords}><Printer className="w-4 h-4 mr-1" />Print</Button>}
            <Button size="sm" onClick={() => { setEditing(null); setForm({ vetPrescribed: "false" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add</Button>
          </div>
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
              { key: "_attach", label: "", render: r => r.id ? <RecordAttachments recordType="sheep-vaccination-programmes" recordId={r.id as number} farmId={farmId} compact /> : null },
            ]}
            rows={filteredVacc}
            onView={setViewing}
            onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
            onDelete={r => delVacc.mutate(r.id as number)}
          />
        )}
        <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Vaccination Programme</DialogTitle></DialogHeader>
            {viewing && <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[["Date", fmtDate(viewing.vaccinationDate)], ["Programme", fmt(viewing.programmeName)], ["Vaccine", fmt(viewing.vaccineProduct)], ["Disease Targeted", fmt(viewing.diseaseTargeted)], ["Route", fmt(viewing.administrationRoute)], ["Dose (ml)", fmt(viewing.doseMl)], ["Animals Vaccinated", fmt(viewing.numberOfAnimalsVaccinated)], ["Batch No.", fmt(viewing.batchNumber)], ["Expiry", fmtDate(viewing.expiryDate)], ["Booster Due", fmtDate(viewing.boosterDueDate)], ["Administered By", fmt(viewing.administeredBy)], ["Vet Prescribed", viewing.vetPrescribed ? "Yes" : "No"], ["Withdrawal Period", fmt(viewing.withdrawalPeriodDays) + " days"]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
                {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
              </div>
              {viewing.id && <RecordAttachments recordType="sheep-vaccination-programmes" recordId={viewing.id as number} farmId={farmId} />}
            </>}
            <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Vaccination</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Programme Name *"><Input value={form.programmeName ?? ""} onChange={e => sf("programmeName", e.target.value)} /></Field>
              <Field label="Vaccine Product *">
                <Select value={form.vaccineProduct ?? ""} onValueChange={v => sf("vaccineProduct", v)}>
                  <SelectTrigger><SelectValue placeholder="Select vaccine..." /></SelectTrigger>
                  <SelectContent>{["Heptavac P Plus","Covexin 8","Ovivac P","Ovivac P Plus","Scabivax Forte","Footvax","Toxovax","Ovilis Enzovax","Ovilis Fluvac","Mevac T","Lambivac","Bravoxin 10","Tasvax 8","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Disease Targeted">
                <Select value={form.diseaseTargeted ?? ""} onValueChange={v => sf("diseaseTargeted", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{["Clostridial disease","Pasteurellosis","Enzootic abortion (EAE)","Toxoplasmosis","OPA","Footrot","Louping ill","Caseous lymphadenitis","Orf","Maedi Visna","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Vaccination Date *"><Input type="date" value={form.vaccinationDate ?? ""} onChange={e => sf("vaccinationDate", e.target.value)} /></Field>
              <Field label="Booster Due Date"><Input type="date" value={form.boosterDueDate ?? ""} onChange={e => sf("boosterDueDate", e.target.value)} /></Field>
              <Field label="Animals Vaccinated"><Input type="number" min="1" step="1" value={form.numberOfAnimalsVaccinated ?? ""} onChange={e => sf("numberOfAnimalsVaccinated", e.target.value)} /></Field>
              <Field label="Dose (ml)"><Input type="number" step="0.1" value={form.doseMl ?? ""} onChange={e => sf("doseMl", e.target.value)} /></Field>
              <Field label="Admin Route">
                <Select value={form.administrationRoute ?? ""} onValueChange={v => sf("administrationRoute", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{["SC (subcutaneous)","IM (intramuscular)","IV (intravenous)","Oral","Intranasal","Topical"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Batch Number"><Input value={form.batchNumber ?? ""} onChange={e => sf("batchNumber", e.target.value)} /></Field>
              <Field label="Expiry Date"><Input type="date" value={form.expiryDate ?? ""} onChange={e => sf("expiryDate", e.target.value)} /></Field>
              <Field label="Administered By"><Input value={form.administeredBy ?? ""} onChange={e => sf("administeredBy", e.target.value)} /></Field>
              <Field label="Withdrawal Period (days)"><Input type="number" min="0" step="1" value={form.withdrawalPeriodDays ?? ""} onChange={e => sf("withdrawalPeriodDays", e.target.value)} /></Field>
              <div className="col-span-2 flex items-center gap-2"><Checkbox checked={form.vetPrescribed === "true"} onCheckedChange={v => sf("vetPrescribed", v ? "true" : "false")} id="vp" /><Label htmlFor="vp">Vet prescribed</Label></div>
              <div className="col-span-2"><Field label="Notes"><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></Field></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => saveVacc.mutate({ ...form })} disabled={saveVacc.isPending}>{editing ? "Save" : "Add"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </>}

      {subTab === "disease" && <>
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Disease & Condition Monitoring</h3>
            <Select value={diseaseYearFilter} onValueChange={setDiseaseYearFilter}>
              <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">All years</SelectItem>{diseaseYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {filteredDisease.length > 0 && <Button size="sm" variant="outline" onClick={printDiseaseRecords}><Printer className="w-4 h-4 mr-1" />Print</Button>}
            <Button size="sm" onClick={() => { setEditing(null); setForm({ vetConsulted: "false", reportableDisease: "false", ahrbiNotified: "false" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add</Button>
          </div>
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
              { key: "_attach", label: "", render: r => r.id ? <RecordAttachments recordType="sheep-disease-monitoring" recordId={r.id as number} farmId={farmId} compact /> : null },
            ]}
            rows={filteredDisease}
            onView={setViewing}
            onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
            onDelete={r => delDisease.mutate(r.id as number)}
          />
        )}
        <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>Disease Monitoring Record</DialogTitle></DialogHeader>
            {viewing && <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[["Date", fmtDate(viewing.observationDate)], ["Condition", fmt(viewing.condition)], ["Animals Affected", fmt(viewing.numberOfAnimalsAffected)], ["Severity", fmt(viewing.severity)], ["Action Taken", fmt(viewing.actionTaken)], ["Vet Consulted", viewing.vetConsulted ? "Yes" : "No"], ["Vet Name", fmt(viewing.vetName)], ["Treatment Product", fmt(viewing.treatmentProduct)], ["Outcome", fmt(viewing.outcome)], ["Reportable Disease", viewing.reportableDisease ? "Yes" : "No"], ["AHRBI Notified", viewing.ahrbiNotified ? "Yes" : "No"]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
                {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
              </div>
              {viewing.id && <RecordAttachments recordType="sheep-disease-monitoring" recordId={viewing.id as number} farmId={farmId} />}
            </>}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
              {viewing?.reportableDisease && (
                <Button size="sm" variant="outline" className="text-red-700 border-red-200 hover:bg-red-50" onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }}>
                  <ClipboardList className="w-3.5 h-3.5 mr-1" />Raise APHA Task
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {raiseTaskFor && (
          <RaiseTaskDialog
            farmId={farmId}
            open={!!raiseTaskFor}
            onClose={() => setRaiseTaskFor(null)}
            defaultTitle={`Notifiable Disease — APHA Notification — ${raiseTaskFor.condition ?? "Suspected case"}`}
            defaultDescription={`Observation: ${fmtDate(raiseTaskFor.observationDate)} · Animals affected: ${raiseTaskFor.numberOfAnimalsAffected ?? "—"} · Severity: ${raiseTaskFor.severity ?? "—"}. Contact APHA immediately on 03000 200 301 (24 hr). Do not move animals until an APHA vet authorises movement. Failure to report is a criminal offence under the Animal Health Act 1981.`}
          />
        )}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Disease Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Observation Date *"><Input type="date" value={form.observationDate ?? ""} onChange={e => sf("observationDate", e.target.value)} /></Field>
              <Field label="Condition / Disease *">
                <Select value={form.condition ?? ""} onValueChange={v => sf("condition", v)}>
                  <SelectTrigger><SelectValue placeholder="Select condition..." /></SelectTrigger>
                  <SelectContent>{["Footrot","Foot abscess","Flystrike (myiasis)","OPA (ovine pulmonary adenocarcinoma)","Maedi Visna","Caseous lymphadenitis","Scrapie","Clostridial disease","Toxoplasmosis","Enzootic abortion (EAE)","Mastitis","Pneumonia","Orf","Lamb dysentery","Pulpy kidney","Black disease","Redwater (babesiosis)","Listeriosis","Louping ill","Border disease","Twin lamb disease","Hypocalcaemia","Hypomagnesaemia","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Animals Affected"><Input type="number" min="1" step="1" value={form.numberOfAnimalsAffected ?? ""} onChange={e => sf("numberOfAnimalsAffected", e.target.value)} /></Field>
              <Field label="Severity">
                <Select value={form.severity ?? ""} onValueChange={v => sf("severity", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{["mild","moderate","severe"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <div className="col-span-2"><Field label="Action Taken"><Input value={form.actionTaken ?? ""} onChange={e => sf("actionTaken", e.target.value)} /></Field></div>
              <Field label="Treatment Product"><Input value={form.treatmentProduct ?? ""} onChange={e => sf("treatmentProduct", e.target.value)} /></Field>
              <Field label="Vet Name"><Input value={form.vetName ?? ""} onChange={e => sf("vetName", e.target.value)} /></Field>
              <Field label="Outcome">
                <Select value={form.outcome ?? ""} onValueChange={v => sf("outcome", v)}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{["Recovered – no treatment","Recovered – treated","Ongoing treatment","Culled","Died","Referred to vet","Notified to APHA","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <div className="col-span-2 flex gap-4 flex-wrap">
                <div className="flex items-center gap-2"><Checkbox checked={form.vetConsulted === "true"} onCheckedChange={v => sf("vetConsulted", v ? "true" : "false")} id="vc" /><Label htmlFor="vc">Vet consulted</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.reportableDisease === "true"} onCheckedChange={v => sf("reportableDisease", v ? "true" : "false")} id="rd" /><Label htmlFor="rd">Reportable disease</Label></div>
                <div className="flex items-center gap-2"><Checkbox checked={form.ahrbiNotified === "true"} onCheckedChange={v => sf("ahrbiNotified", v ? "true" : "false")} id="ahrb" /><Label htmlFor="ahrb">AHRBI notified</Label></div>
              </div>
              {form.reportableDisease === "true" && (
                <div className="col-span-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800 space-y-1.5">
                  <p className="font-semibold flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />Notifiable disease — statutory reporting obligation</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>You must notify APHA <strong>immediately</strong>. Failure to report is a criminal offence under the Animal Health Act 1981.</li>
                    <li>Do not move animals on or off the holding until authorised by an APHA vet.</li>
                    <li>APHA report line: <strong>03000 200 301</strong> (England) — 24 hours, 7 days.</li>
                  </ul>
                </div>
              )}
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
  const [viewing, setViewing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [yearFilter, setYearFilter] = useState<string>("all");
  const { data: rows = [], isLoading } = useQuery({ queryKey: ["sheep-rt", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-rt-checklists`), { credentials: "include" }).then(r => r.json()) });
  const { data: membersData, isLoading: membersLoading } = useFarmMembers(farmId);
  const staffNames = (membersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);
  const save = useMutation({ mutationFn: (body: Record<string, unknown>) => { const url = editing ? api(`farms/${farmId}/sheep-rt-checklists/${editing.id}`) : api(`farms/${farmId}/sheep-rt-checklists`); return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) }); }, onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheep-rt", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/sheep-rt-checklists/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["sheep-rt", farmId] }) });
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const boolFields = ["flockRegisterUpToDate","medicineRecordsComplete","movementRecordsComplete","feedRecordsComplete","mbmFreeStatus","assuranceMembershipCurrent","vetHealthPlanOnFile","staffTrainingCurrent","welfareOutcomesRecorded"];
  const boolLabels: Record<string, string> = { flockRegisterUpToDate: "Flock register up to date", medicineRecordsComplete: "Medicine records complete", movementRecordsComplete: "Movement records complete", feedRecordsComplete: "Feed records complete", mbmFreeStatus: "MBM-free status confirmed", assuranceMembershipCurrent: "Assurance membership current", vetHealthPlanOnFile: "Vet health plan on file", staffTrainingCurrent: "Staff training current", welfareOutcomesRecorded: "Welfare outcomes recorded" };
  const years = useMemo(() => Array.from(new Set((rows as Record<string, unknown>[]).map(r => String(r.checkDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [rows]);
  const filtered = useMemo(() => yearFilter === "all" ? rows as Record<string, unknown>[] : (rows as Record<string, unknown>[]).filter(r => String(r.checkDate ?? "").startsWith(yearFilter)), [rows, yearFilter]);

  function printRtChecklists() {
    const tableRows = filtered.map(r => `<tr><td>${fmtDate(r.checkDate)}</td><td>${fmt(r.checkedBy)}</td><td>${fmt(r.overallStatus)}</td><td>${boolFields.filter(k => r[k]).map(k => boolLabels[k]).join("; ") || "—"}</td><td>${fmt(r.notes)}</td></tr>`).join("");
    openPrintWindow(`<!DOCTYPE html><html><head><title>RT Sheep Checklists</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;font-size:8px;font-weight:700;text-transform:uppercase;padding:4px 6px;border:1px solid #e5e7eb;text-align:left}td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top}tr:nth-child(even) td{background:#fafafa}.footer{margin-top:14px;font-size:8px;color:#888;border-top:1px solid #e5e7eb;padding-top:8px}@media print{@page{margin:1.5cm}}</style></head><body><h1>Red Tractor Sheep Checklists${yearFilter !== "all" ? ` — ${yearFilter}` : ""}</h1><h2>Red Tractor Sheep · ${filtered.length} record${filtered.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Checked By</th><th>Status</th><th>Compliant Items</th><th>Notes</th></tr></thead><tbody>${tableRows}</tbody></table><p class="footer">Red Tractor Sheep: checklist records must be retained for a minimum of 3 years. Printed: ${new Date().toLocaleDateString("en-GB")}</p></body></html>`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Red Tractor Sheep Checklists</h3>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {filtered.length > 0 && <Button size="sm" variant="outline" onClick={printRtChecklists}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => { setEditing(null); setForm({ overallStatus: "pending" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />New Check</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin" /> : (
        <DataTable
          cols={[
            { key: "checkDate", label: "Date", render: r => fmtDate(r.checkDate) },
            { key: "checkedBy", label: "Checked By" },
            { key: "overallStatus", label: "Status", render: r => { const s = String(r.overallStatus ?? ""); return <Badge variant={s === "pass" ? "default" : s === "fail" ? "destructive" : "secondary"}>{s}</Badge>; } },
            { key: "_attach", label: "", render: r => r.id ? <RecordAttachments recordType="sheep-rt-checklists" recordId={r.id as number} farmId={farmId} compact /> : null },
          ]}
          rows={filtered}
          onView={setViewing}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>RT Sheep Checklist</DialogTitle></DialogHeader>
          {viewing && <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[["Date", fmtDate(viewing.checkDate)], ["Checked By", fmt(viewing.checkedBy)], ["Status", fmt(viewing.overallStatus)]].map(([l, v]) => <div key={String(l)}><span className="text-muted-foreground">{l}:</span> <span className="font-medium">{String(v)}</span></div>)}
              {boolFields.map(k => <div key={k}><span className="text-muted-foreground">{boolLabels[k]}:</span> <span className="font-medium">{viewing[k] ? "Yes" : "No"}</span></div>)}
              {viewing.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {fmt(viewing.notes)}</div>}
            </div>
            {viewing.id && <RecordAttachments recordType="sheep-rt-checklists" recordId={viewing.id as number} farmId={farmId} />}
          </>}
          <DialogFooter><Button variant="outline" onClick={() => setViewing(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? "Edit" : "New"} RT Sheep Checklist</DialogTitle></DialogHeader>
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
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form })} disabled={save.isPending}>{editing ? "Save" : "Add"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
type Tab = "flocks" | "tupping" | "scanning" | "weigh" | "shearing" | "health" | "rt-checklist" | "analytics" | "weighing-equipment" | "enterprise";

const SHEEP_COLORS = ["#15803d", "#a16207", "#1d4ed8", "#b91c1c", "#7c3aed", "#0e7490"];

function SheepAnalyticsTab({ farmId }: { farmId: number }) {
  const { data: scanning = [] } = useQuery<Record<string, unknown>[]>({ queryKey: ["sheep-scanning", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-scanning-records`), { credentials: "include" }).then(r => r.json()) });
  const { data: weigh = [] } = useQuery<Record<string, unknown>[]>({ queryKey: ["sheep-weigh", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-weigh-records`), { credentials: "include" }).then(r => r.json()) });
  const { data: shearing = [] } = useQuery<Record<string, unknown>[]>({ queryKey: ["sheep-shearing", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-shearing-records`), { credentials: "include" }).then(r => r.json()) });
  const { data: tupping = [] } = useQuery<Record<string, unknown>[]>({ queryKey: ["sheep-tupping", farmId], queryFn: () => fetch(api(`farms/${farmId}/sheep-tupping-records`), { credentials: "include" }).then(r => r.json()) });

  const totalScanned = useMemo(() => scanning.reduce((s, r) => s + (Number(r.ewesScanned) || 0), 0), [scanning]);
  const totalInLamb = useMemo(() => scanning.reduce((s, r) => s + (Number(r.ewesInLamb) || 0), 0), [scanning]);
  const scanPct = totalScanned > 0 ? ((totalInLamb / totalScanned) * 100).toFixed(1) : null;

  const litterData = useMemo(() => [
    { name: "Singles", value: scanning.reduce((s, r) => s + (Number(r.singles) || 0), 0) },
    { name: "Twins", value: scanning.reduce((s, r) => s + (Number(r.twins) || 0), 0) },
    { name: "Triplets", value: scanning.reduce((s, r) => s + (Number(r.triplets) || 0), 0) },
    { name: "Quads+", value: scanning.reduce((s, r) => s + (Number(r.quads) || 0), 0) },
  ].filter(d => d.value > 0), [scanning]);

  const dlwgData = useMemo(() => weigh.filter(r => r.dlwgGPerDay).slice(-10).map(r => ({
    name: String(r.batchRef || r.animalCategory || "Batch").slice(0, 12),
    dlwg: Math.round(Number(r.dlwgGPerDay)),
  })), [weigh]);

  const shearData = useMemo(() => {
    const byYear: Record<string, { wool: number; head: number; value: number }> = {};
    shearing.forEach(r => {
      const yr = r.shearingDate ? String(r.shearingDate).slice(0, 4) : "Unknown";
      if (!byYear[yr]) byYear[yr] = { wool: 0, head: 0, value: 0 };
      byYear[yr].wool += Number(r.woolWeightKg) || 0;
      byYear[yr].head += Number(r.headSheared) || 0;
      byYear[yr].value += Number(r.saleValue) || 0;
    });
    return Object.entries(byYear).sort().map(([yr, d]) => ({ year: yr, wool: +d.wool.toFixed(1), head: d.head, value: +d.value.toFixed(2) }));
  }, [shearing]);

  const avgDlwg = useMemo(() => {
    const valid = weigh.filter(r => r.dlwgGPerDay);
    return valid.length ? Math.round(valid.reduce((s, r) => s + Number(r.dlwgGPerDay), 0) / valid.length) : null;
  }, [weigh]);

  const noData = scanning.length === 0 && weigh.length === 0 && shearing.length === 0;
  if (noData) return (
    <div className="text-center py-16 text-muted-foreground text-sm">
      <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-30" />
      <p className="font-medium">No data yet</p>
      <p className="text-xs mt-1">Add scanning, weigh-in, or shearing records to see analytics.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Scanning Records", value: scanning.length, bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
          { label: "Overall Scanning %", value: scanPct ? `${scanPct}%` : "—", bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
          { label: "Avg DLWG (g/day)", value: avgDlwg ?? "—", bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
          { label: "Shearing Records", value: shearing.length, bg: "bg-purple-50 border-purple-100", text: "text-purple-800", sub: "text-purple-700" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl border p-4 text-center`}>
            <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            <p className={`text-xs mt-0.5 ${c.sub}`}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {litterData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Litter Type Distribution (all scans)</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={litterData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {litterData.map((_, i) => <Cell key={i} fill={SHEEP_COLORS[i % SHEEP_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} ewes`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {dlwgData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">DLWG by Batch (g/day)</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dlwgData} layout="vertical" margin={{ left: 4, right: 24, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={70} />
                  <Tooltip formatter={(v) => [`${v} g/day`, "DLWG"]} />
                  <Bar dataKey="dlwg" fill="#15803d" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {shearData.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-4">Wool Yield & Head Sheared by Year</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shearData} margin={{ left: 0, right: 24, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} unit="kg" />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="hd" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="wool" name="Wool (kg)" fill="#15803d" radius={[3, 3, 0, 0]} />
                <Bar yAxisId="right" dataKey="head" name="Head Sheared" fill="#a16207" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tupping.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-3">Tupping Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold">{tupping.length}</p><p className="text-xs text-muted-foreground">Tupping Cycles</p></div>
            <div><p className="text-2xl font-bold">{tupping.reduce((s, r) => s + (Number(r.ewesExposed) || 0), 0)}</p><p className="text-xs text-muted-foreground">Total Ewes Exposed</p></div>
            <div><p className="text-2xl font-bold">{[...new Set(tupping.map(r => r.ramBreed).filter(Boolean))].length}</p><p className="text-xs text-muted-foreground">Ram Breeds Used</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SheepProductionPage() {
  const farmId = useAppStore(s => s.farmId);
  const [tab, setTab] = useState<Tab>("tupping");

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
          <TabButton active={tab === "weighing-equipment"} onClick={() => setTab("weighing-equipment")}><Scale className="w-3.5 h-3.5 mr-1 inline" />Equipment</TabButton>
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}><BarChart3 className="w-3.5 h-3.5 mr-1 inline" />Analytics</TabButton>
          <TabButton active={tab === "enterprise"} onClick={() => setTab("enterprise")}><BarChart3 className="w-3.5 h-3.5 mr-1 inline" />Enterprise Report</TabButton>
        </TabBar>

        {tab === "flocks" && <FlocksTab farmId={farmId} />}
        {tab === "tupping" && <TuppingTab farmId={farmId} />}
        {tab === "scanning" && <ScanningTab farmId={farmId} />}
        {tab === "weigh" && <WeighTab farmId={farmId} />}
        {tab === "shearing" && <ShearingTab farmId={farmId} />}
        {tab === "health" && <HealthTab farmId={farmId} />}
        {tab === "rt-checklist" && <RTChecklistTab farmId={farmId} />}
        {tab === "weighing-equipment" && <WeighingEquipmentTab farmId={farmId} />}
        {tab === "analytics" && <SheepAnalyticsTab farmId={farmId} />}
        {tab === "enterprise" && <SheepEnterpriseReport farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
