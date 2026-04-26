import React, { useState } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Redirect } from "wouter";
import {
  Plus, Loader2, Pencil, Trash2, CheckCircle2, AlertTriangle,
  Calendar, Printer, Leaf, ShieldCheck, FlaskConical, BookOpen,
  Clock, Info, ExternalLink, Eye,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmt(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / 86400000);
}

function conversionProgress(startDate: string | null | undefined): number {
  if (!startDate) return 0;
  const start = new Date(startDate).getTime();
  const end = start + 2 * 365.25 * 24 * 3600 * 1000;
  const now = Date.now();
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
}

function expectedCertDate(startDate: string): string {
  const d = new Date(startDate);
  d.setFullYear(d.getFullYear() + 2);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const INPUT_CLS = "h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base w-full";
const CERTIFIERS = ["Soil Association", "Organic Farmers & Growers (OF&G)", "Biodynamic Association (BDOCA)", "Other"];
const OUTCOMES = ["Pass", "Pass with Advisory Notes", "Non-conformance – Minor", "Non-conformance – Major", "Suspension"];
const STATUSES = ["certified", "in-conversion", "conventional"];
const STATUS_LABELS: Record<string, string> = { certified: "Certified Organic", "in-conversion": "In Conversion", conventional: "Conventional" };
const STATUS_COLORS: Record<string, string> = { certified: "bg-green-100 text-green-800 border-green-200", "in-conversion": "bg-amber-100 text-amber-800 border-amber-200", conventional: "bg-gray-100 text-gray-600 border-gray-200" };
const OUTCOME_COLORS: Record<string, string> = { "Pass": "text-green-700 bg-green-50 border-green-200", "Pass with Advisory Notes": "text-amber-700 bg-amber-50 border-amber-200", "Non-conformance – Minor": "text-orange-700 bg-orange-50 border-orange-200", "Non-conformance – Major": "text-red-700 bg-red-50 border-red-200", "Suspension": "text-red-900 bg-red-100 border-red-300" };

// ─── Print helper ────────────────────────────────────────────────────────────

const PRINT_CSS = `body{font-family:Arial,sans-serif;font-size:11px;color:#1f2937;margin:0}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #166534;padding-bottom:10px;margin-bottom:14px}
.hdr h1{margin:0;font-size:16px;color:#166534}.hdr .sub{margin:2px 0 0;font-size:10px;color:#6b7280}
.hdr-r{text-align:right;font-size:10px;color:#374151;line-height:1.6}
table{width:100%;border-collapse:collapse;margin-bottom:14px}
th{background:#166534;color:#fff;padding:6px 8px;text-align:left;font-size:10px;font-weight:600}
td{padding:5px 8px;border-bottom:1px solid #e5e7eb;vertical-align:top}
tr:nth-child(even) td{background:#f9fafb}
.footer{border-top:1px solid #e5e7eb;padding-top:8px;font-size:9px;color:#9ca3af;margin-top:14px}`;

function openPrint(html: string) {
  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.addEventListener("afterprint", () => w.close());
  setTimeout(() => w.print(), 400);
}

function printInspectionRegister(records: InspectionRecord[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const rows = records.map(r => `<tr>
    <td style="white-space:nowrap">${r.inspectionDate ? new Date(r.inspectionDate).toLocaleDateString("en-GB") : "—"}</td>
    <td>${r.certifier}</td><td>${r.inspectorName || "—"}</td>
    <td><span style="font-weight:600">${r.outcome}</span></td>
    <td>${r.certificateReference || "—"}</td>
    <td style="white-space:nowrap">${r.nextDueDate ? new Date(r.nextDueDate).toLocaleDateString("en-GB") : "—"}</td>
    <td>${r.nonConformances || "—"}</td><td>${r.actions || "—"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Inspection Register — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Organic Certification Inspection Register · Complementary Record</p></div>
<div class="hdr-r"><b>Inspection Register</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Date</th><th>Certifier</th><th>Inspector</th><th>Outcome</th><th>Cert Ref</th><th>Next Due</th><th>Non-Conformances</th><th>Actions Required</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Organic Inspection Register — Complementary record for Soil Association / OF&G portal. Retain with your organic certification documentation. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

function printFieldStatusRegister(records: FieldStatus[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const rows = records.map(r => `<tr>
    <td>${r.fieldName}</td>
    <td style="font-weight:600">${STATUS_LABELS[r.status] ?? r.status}</td>
    <td style="white-space:nowrap">${r.conversionStartDate ? new Date(r.conversionStartDate).toLocaleDateString("en-GB") : "—"}</td>
    <td style="white-space:nowrap">${r.certificationDate ? new Date(r.certificationDate).toLocaleDateString("en-GB") : "—"}</td>
    <td>${r.certifierRef || "—"}</td>
    <td>${r.parallelProduction ? "Yes" : "No"}</td>
    <td>${r.notes || "—"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Organic Field Status Register — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Organic Field Status Register · Complementary Record</p></div>
<div class="hdr-r"><b>Field Register</b>${records.length} field${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Field Name</th><th>Status</th><th>Conversion Start</th><th>Certified From</th><th>Certifier Ref</th><th>Parallel Production</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Organic Field Status Register — Complementary record for Soil Association / OF&G portal. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

function printRestrictedInputsLog(records: RestrictedInput[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const rows = records.map(r => `<tr>
    <td style="white-space:nowrap">${r.dateApplied ? new Date(r.dateApplied).toLocaleDateString("en-GB") : "—"}</td>
    <td style="font-weight:600">${r.productName}</td>
    <td>${r.productCategory || "—"}</td>
    <td>${r.fieldName || "—"}</td>
    <td>${r.appliedBy || "—"}</td>
    <td>${r.justification}</td>
    <td>${r.approvalReference || "—"}</td>
    <td>${r.certifierNotified ? "Yes" : "No"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Restricted Inputs Log — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Organic Restricted Inputs Log · Complementary Record</p></div>
<div class="hdr-r"><b>Restricted Inputs</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Date Applied</th><th>Product</th><th>Category</th><th>Field / Area</th><th>Applied By</th><th>Justification</th><th>Approval Ref</th><th>Certifier Notified</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Restricted Inputs Log — Complementary record for Soil Association / OF&G portal. Retain with derogation approvals. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Certification {
  id: number; farmId: number; certifier: string; certificateNumber: string | null;
  certificationDate: string | null; renewalDate: string | null; status: string;
  operatorNumber: string | null; notes: string | null;
}
interface FieldStatus {
  id: number; farmId: number; fieldId: number | null; fieldName: string; status: string;
  conversionStartDate: string | null; certificationDate: string | null;
  certifierRef: string | null; parallelProduction: boolean; notes: string | null;
}
interface InspectionRecord {
  id: number; farmId: number; certifier: string; inspectorName: string | null;
  inspectionDate: string; outcome: string; certificateReference: string | null;
  nextDueDate: string | null; nonConformances: string | null; actions: string | null; notes: string | null;
}
interface RestrictedInput {
  id: number; farmId: number; fieldId: number | null; fieldName: string | null;
  productName: string; productCategory: string | null; dateApplied: string;
  appliedBy: string | null; justification: string; approvalReference: string | null;
  certifierNotified: boolean; notes: string | null;
}
interface FarmField { id: number; name: string; areaHectares: string | null; }
interface SprayProduct { id: number; productName: string; category: string | null; }

// ─── Field picker helper ─────────────────────────────────────────────────────

function FieldPicker({
  farmFields,
  fieldId,
  fieldName,
  onFieldChange,
}: {
  farmFields: FarmField[];
  fieldId: number | null;
  fieldName: string;
  onFieldChange: (fieldId: number | null, fieldName: string) => void;
}) {
  const hasFields = farmFields.length > 0;
  const selectedInList = fieldId !== null || (hasFields && farmFields.some(f => f.name === fieldName));
  const [showCustom, setShowCustom] = useState(!selectedInList && fieldName !== "");

  if (!hasFields) {
    return (
      <Input
        className={INPUT_CLS}
        placeholder="e.g. Home Field, North Block"
        value={fieldName}
        onChange={e => onFieldChange(null, e.target.value)}
      />
    );
  }

  const selectValue = fieldId !== null ? String(fieldId)
    : farmFields.find(f => f.name === fieldName) ? String(farmFields.find(f => f.name === fieldName)!.id)
    : showCustom ? "__other__"
    : fieldName !== "" ? "__other__"
    : "";

  function handleSelect(val: string) {
    if (val === "__other__") {
      setShowCustom(true);
      onFieldChange(null, "");
    } else if (val === "") {
      setShowCustom(false);
      onFieldChange(null, "");
    } else {
      const field = farmFields.find(f => f.id === parseInt(val));
      if (field) {
        setShowCustom(false);
        onFieldChange(field.id, field.name);
      }
    }
  }

  return (
    <div className="space-y-1.5">
      <select className={INPUT_CLS} value={selectValue} onChange={e => handleSelect(e.target.value)}>
        <option value="">Select field…</option>
        {farmFields.map(f => (
          <option key={f.id} value={String(f.id)}>
            {f.name}{f.areaHectares ? ` (${parseFloat(f.areaHectares).toFixed(1)} ha)` : ""}
          </option>
        ))}
        <option value="__other__">Other / specify below</option>
      </select>
      {(showCustom || selectValue === "__other__") && (
        <Input
          className={INPUT_CLS}
          placeholder="Field or area name"
          value={fieldName}
          onChange={e => onFieldChange(null, e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
}

// ─── Certification Tab ───────────────────────────────────────────────────────

function CertificationTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [viewRecord, setViewRecord] = useState<Certification | null>(null);
  const EMPTY = { certifier: "Soil Association", certificateNumber: "", certificationDate: "", renewalDate: "", status: "certified", operatorNumber: "", notes: "" };
  const [form, setForm] = useState(EMPTY);

  const { data, isLoading } = useQuery<{ record: Certification | null }>({
    queryKey: ["organic-cert", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic/certification`).then(r => r.json()),
  });
  const record = data?.record ?? null;

  const saveMut = useMutation({
    mutationFn: (body: typeof EMPTY) => fetch(`/api/farms/${farmId}/organic/certification`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-cert", farmId] }); setEditing(false); toast({ title: "Certification details saved" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  function openEdit() {
    setForm({ certifier: record?.certifier ?? "Soil Association", certificateNumber: record?.certificateNumber ?? "", certificationDate: record?.certificationDate ?? "", renewalDate: record?.renewalDate ?? "", status: record?.status ?? "certified", operatorNumber: record?.operatorNumber ?? "", notes: record?.notes ?? "" });
    setEditing(true);
  }

  if (isLoading) return <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</div>;

  const renewalDays = daysUntil(record?.renewalDate);

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold mb-1">Complementary record — not a replacement</p>
          <p className="text-green-700">BDE Farm Trac stores your certification reference details alongside your operational records. Your official certification is managed directly with your certifier's portal (Soil Association, OF&amp;G, etc.).</p>
          <div className="flex gap-3 mt-2 flex-wrap">
            <a href="https://www.soilassociation.org/certification" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-700 underline underline-offset-2 hover:text-green-900"><ExternalLink className="w-3 h-3" />Soil Association Portal</a>
            <a href="https://www.ofgorganic.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-700 underline underline-offset-2 hover:text-green-900"><ExternalLink className="w-3 h-3" />OF&amp;G Portal</a>
          </div>
        </div>
      </div>

      {!record ? (
        <Card className="p-8 text-center">
          <Leaf className="w-12 h-12 mx-auto mb-3 text-green-600 opacity-50" />
          <p className="font-semibold text-lg mb-1">No certification details recorded</p>
          <p className="text-sm text-foreground/60 mb-4">Add your organic certification reference to link your operational records to your certifier.</p>
          <Button onClick={openEdit}><Plus className="w-4 h-4 mr-2" />Add Certification Details</Button>
        </Card>
      ) : (
        <Card className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><Leaf className="w-5 h-5 text-green-700" /></div>
              <div>
                <p className="font-semibold text-lg">{record.certifier}</p>
                <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[record.status] ?? STATUS_COLORS.conventional}`}>{STATUS_LABELS[record.status] ?? record.status}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewRecord(record)}><Eye className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={openEdit}><Pencil className="w-4 h-4 mr-1" />Edit</Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm border-t pt-4">
            {record.certificateNumber && <><span className="text-foreground/60">Certificate Number</span><span className="font-medium">{record.certificateNumber}</span></>}
            {record.operatorNumber && <><span className="text-foreground/60">Operator Number</span><span className="font-medium">{record.operatorNumber}</span></>}
            {record.certificationDate && <><span className="text-foreground/60">Certification Date</span><span className="font-medium">{fmt(record.certificationDate)}</span></>}
            {record.renewalDate && (
              <>
                <span className="text-foreground/60">Annual Renewal</span>
                <span className={`font-medium flex items-center gap-1 ${renewalDays !== null && renewalDays <= 60 ? "text-amber-600" : renewalDays !== null && renewalDays < 0 ? "text-red-600" : ""}`}>
                  {fmt(record.renewalDate)}
                  {renewalDays !== null && renewalDays <= 60 && renewalDays >= 0 && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 rounded-full border border-amber-200">{renewalDays}d</span>}
                  {renewalDays !== null && renewalDays < 0 && <span className="text-xs bg-red-100 text-red-700 px-1.5 rounded-full border border-red-200">Overdue</span>}
                </span>
              </>
            )}
          </div>
          {record.notes && <p className="text-sm text-foreground/70 border-t pt-3">{record.notes}</p>}
        </Card>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Organic Certification</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifying Body</p><p className="font-medium">{String(viewRecord.certifier ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{STATUS_LABELS[viewRecord.status] ?? viewRecord.status}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate Number</p><p className="font-medium">{String(viewRecord.certificateNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Operator Number</p><p className="font-medium">{String(viewRecord.operatorNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certification Date</p><p className="font-medium">{fmt(viewRecord.certificationDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Renewal Date</p><p className="font-medium">{fmt(viewRecord.renewalDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{record ? "Edit Certification Details" : "Add Certification Details"}</DialogTitle><DialogDescription>Reference details for your organic certification — stored alongside your operational records.</DialogDescription></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); saveMut.mutate(form); }} className="space-y-4">
            <div><Label>Certifying Body *</Label>
              <select className={INPUT_CLS}
                value={CERTIFIERS.filter(c => c !== "Other").includes(form.certifier) ? form.certifier : "Other"}
                onChange={e => setForm(f => ({ ...f, certifier: e.target.value }))}>
                {CERTIFIERS.map(c => <option key={c} value={c}>{c === "Other" ? "Other (please specify)" : c}</option>)}
              </select>
              {(form.certifier === "Other" || (form.certifier && !CERTIFIERS.filter(c => c !== "Other").includes(form.certifier))) && (
                <Input className={`${INPUT_CLS} mt-1`}
                  value={form.certifier === "Other" ? "" : form.certifier}
                  onChange={e => setForm(f => ({ ...f, certifier: e.target.value || "Other" }))}
                  placeholder="Please specify certifying body…"
                  autoFocus={form.certifier === "Other"}
                />
              )}
            </div>
            <div><Label>Farm Status *</Label>
              <select className={INPUT_CLS} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Certificate Number</Label><Input className={INPUT_CLS} value={form.certificateNumber} onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))} /></div>
              <div><Label>Operator Number</Label><Input className={INPUT_CLS} value={form.operatorNumber} onChange={e => setForm(f => ({ ...f, operatorNumber: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Certification Date</Label><Input type="date" className={INPUT_CLS} value={form.certificationDate} onChange={e => setForm(f => ({ ...f, certificationDate: e.target.value }))} /></div>
              <div><Label>Annual Renewal Date</Label><Input type="date" className={INPUT_CLS} value={form.renewalDate} onChange={e => setForm(f => ({ ...f, renewalDate: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending || !form.certifier}>{saveMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Save Details</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Fields Tab ──────────────────────────────────────────────────────────────

const EMPTY_FIELD = { fieldId: null as number | null, fieldName: "", status: "conventional", conversionStartDate: "", certificationDate: "", certifierRef: "", parallelProduction: false, notes: "" };

function FieldsTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<FieldStatus | null>(null);
  const [editing, setEditing] = useState<FieldStatus | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FIELD);

  const { data, isLoading } = useQuery<{ records: FieldStatus[] }>({
    queryKey: ["organic-fields", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic/fields`).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const { data: fieldsData } = useQuery<{ records: FarmField[] }>({
    queryKey: ["farm-fields-lookup", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.ok ? r.json() : { records: [] }),
  });
  const farmFields: FarmField[] = (fieldsData?.records ?? []).map(f => ({ id: f.id, name: f.name, areaHectares: f.areaHectares }));

  const createM = useMutation({
    mutationFn: (body: typeof EMPTY_FIELD) => fetch(`/api/farms/${farmId}/organic/fields`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-fields", farmId] }); setFormOpen(false); setForm(EMPTY_FIELD); toast({ title: "Field saved" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: typeof EMPTY_FIELD }) => fetch(`/api/farms/${farmId}/organic/fields/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-fields", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_FIELD); toast({ title: "Field updated" }); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic/fields/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-fields", farmId] }); setDeleteId(null); toast({ title: "Field removed" }); },
  });

  function openEdit(r: FieldStatus) {
    setEditing(r);
    setForm({ fieldId: r.fieldId ?? null, fieldName: r.fieldName, status: r.status, conversionStartDate: r.conversionStartDate ?? "", certificationDate: r.certificationDate ?? "", certifierRef: r.certifierRef ?? "", parallelProduction: r.parallelProduction, notes: r.notes ?? "" });
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) { updateM.mutate({ id: editing.id, body: form }); }
    else { createM.mutate(form); }
  }

  const certified = records.filter(r => r.status === "certified");
  const converting = records.filter(r => r.status === "in-conversion");
  const conventional = records.filter(r => r.status === "conventional");

  if (isLoading) return <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{certified.length} certified</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{converting.length} in conversion</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />{conventional.length} conventional</span>
          </div>
          {records.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => printFieldStatusRegister(records, farmName)} className="gap-2">
              <Printer className="w-4 h-4" />Print Register
            </Button>
          )}
        </div>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_FIELD); setFormOpen(true); }} className="gap-2"><Plus className="w-4 h-4" />Add Field</Button>
      </div>

      {records.length === 0 ? (
        <Card className="p-8 text-center">
          <Leaf className="w-10 h-10 mx-auto mb-3 text-green-500 opacity-50" />
          <p className="font-semibold mb-1">No fields recorded</p>
          <p className="text-sm text-foreground/60">Add your fields to track organic status and conversion progress.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {converting.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">In Conversion</p>
              <div className="space-y-2">
                {converting.map(r => {
                  const pct = conversionProgress(r.conversionStartDate);
                  const expDate = r.conversionStartDate ? expectedCertDate(r.conversionStartDate) : null;
                  return (
                    <Card key={r.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{r.fieldName}</span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-100 text-amber-800 border-amber-200">In Conversion</span>
                            {r.parallelProduction && <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">Parallel production</span>}
                          </div>
                          {r.conversionStartDate && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-foreground/60 mb-1">
                                <span>Conversion started {fmt(r.conversionStartDate)}</span>
                                <span>{pct}% complete{expDate ? ` · cert. eligible ${expDate}` : ""}</span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          )}
                          {r.certifierRef && <p className="text-xs text-foreground/50 mt-1">Ref: {r.certifierRef}</p>}
                          {r.notes && <p className="text-xs text-foreground/50 mt-1">{r.notes}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewRecord(r)}><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {certified.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Certified Organic</p>
              <div className="space-y-2">
                {certified.map(r => (
                  <Card key={r.id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                        <div>
                          <span className="font-medium">{r.fieldName}</span>
                          {r.certificationDate && <span className="text-sm text-foreground/60 ml-2">Since {fmt(r.certificationDate)}</span>}
                          {r.certifierRef && <span className="text-xs text-foreground/40 ml-2">· {r.certifierRef}</span>}
                          {r.parallelProduction && <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 ml-2">Parallel production</span>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewRecord(r)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                    {r.notes && <p className="text-xs text-foreground/50 mt-2 pl-8">{r.notes}</p>}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {conventional.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Conventional</p>
              <div className="space-y-2">
                {conventional.map(r => (
                  <Card key={r.id} className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <span className="font-medium">{r.fieldName}</span>
                        <span className="text-xs ml-2 px-2 py-0.5 rounded-full border bg-gray-100 text-gray-600 border-gray-200">Conventional</span>
                        {r.notes && <p className="text-xs text-foreground/50 mt-1">{r.notes}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewRecord(r)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Field Status</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Field Name</p><p className="font-medium">{viewRecord.fieldName}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{STATUS_LABELS[viewRecord.status] ?? viewRecord.status}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Conversion Start</p><p className="font-medium">{fmt(viewRecord.conversionStartDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certified From</p><p className="font-medium">{fmt(viewRecord.certificationDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Reference</p><p className="font-medium">{viewRecord.certifierRef || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Parallel Production</p><p className="font-medium">{viewRecord.parallelProduction ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes || "—"}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={formOpen} onOpenChange={v => { setFormOpen(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Field" : "Add Field"}</DialogTitle>
            <DialogDescription>Record the organic status of this field.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Field Name *</Label>
              <FieldPicker
                farmFields={farmFields}
                fieldId={form.fieldId}
                fieldName={form.fieldName}
                onFieldChange={(id, name) => setForm(f => ({ ...f, fieldId: id, fieldName: name }))}
              />
            </div>
            <div><Label>Status *</Label>
              <select className={INPUT_CLS} required value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            {form.status === "in-conversion" && (
              <div><Label>Conversion Start Date</Label><Input type="date" className={INPUT_CLS} value={form.conversionStartDate} onChange={e => setForm(f => ({ ...f, conversionStartDate: e.target.value }))} /></div>
            )}
            {form.status === "certified" && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Certified From</Label><Input type="date" className={INPUT_CLS} value={form.certificationDate} onChange={e => setForm(f => ({ ...f, certificationDate: e.target.value }))} /></div>
                <div><Label>Certifier Reference</Label><Input className={INPUT_CLS} placeholder="e.g. SA-2024-F001" value={form.certifierRef} onChange={e => setForm(f => ({ ...f, certifierRef: e.target.value }))} /></div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="parallel" checked={form.parallelProduction} onChange={e => setForm(f => ({ ...f, parallelProduction: e.target.checked }))} className="rounded border-border" />
              <Label htmlFor="parallel">Parallel production (part-organic, part-conventional enterprise)</Label>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditing(null); }}>Cancel</Button>
              <Button type="submit" disabled={createM.isPending || updateM.isPending || !form.fieldName.trim()}>{(createM.isPending || updateM.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remove Field</DialogTitle><DialogDescription>Remove this field from the organic register? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteM.isPending} onClick={() => deleteId && deleteM.mutate(deleteId)}>{deleteM.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Inspections Tab ─────────────────────────────────────────────────────────

const EMPTY_INSP = { certifier: "Soil Association", inspectorName: "", inspectionDate: new Date().toISOString().slice(0, 10), outcome: "Pass", certificateReference: "", nextDueDate: "", nonConformances: "", actions: "", notes: "" };

function InspectionsTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<InspectionRecord | null>(null);
  const [editing, setEditing] = useState<InspectionRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_INSP);

  const { data, isLoading } = useQuery<{ records: InspectionRecord[] }>({
    queryKey: ["organic-inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic/inspections`).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const createM = useMutation({
    mutationFn: (body: typeof EMPTY_INSP) => fetch(`/api/farms/${farmId}/organic/inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-inspections", farmId] }); setFormOpen(false); setForm(EMPTY_INSP); toast({ title: "Inspection recorded" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: typeof EMPTY_INSP }) => fetch(`/api/farms/${farmId}/organic/inspections/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-inspections", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_INSP); toast({ title: "Inspection updated" }); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic/inspections/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-inspections", farmId] }); setDeleteId(null); toast({ title: "Inspection deleted" }); },
  });

  function openEdit(r: InspectionRecord) {
    setEditing(r);
    setForm({ certifier: r.certifier, inspectorName: r.inspectorName ?? "", inspectionDate: r.inspectionDate?.slice(0, 10) ?? "", outcome: r.outcome, certificateReference: r.certificateReference ?? "", nextDueDate: r.nextDueDate ?? "", nonConformances: r.nonConformances ?? "", actions: r.actions ?? "", notes: r.notes ?? "" });
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) { updateM.mutate({ id: editing.id, body: form }); }
    else { createM.mutate(form); }
  }

  if (isLoading) return <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</div>;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => printInspectionRegister(records, farmName)} disabled={records.length === 0} className="gap-2"><Printer className="w-4 h-4" />Print Register</Button>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_INSP); setFormOpen(true); }} className="gap-2"><Plus className="w-4 h-4" />Add Inspection</Button>
      </div>

      {records.length === 0 ? (
        <Card className="p-8 text-center">
          <ShieldCheck className="w-10 h-10 mx-auto mb-3 text-green-500 opacity-50" />
          <p className="font-semibold mb-1">No inspections recorded</p>
          <p className="text-sm text-foreground/60">Record your annual certifier inspection visits here to keep a local evidence trail alongside your certifier's portal.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map(r => {
            const nextDays = daysUntil(r.nextDueDate);
            const outcomeColor = OUTCOME_COLORS[r.outcome] ?? "text-gray-700 bg-gray-50 border-gray-200";
            return (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Calendar className="w-4 h-4 text-foreground/40 shrink-0" />
                      <span className="font-semibold">{fmt(r.inspectionDate)}</span>
                      <span className="text-sm text-foreground/60">{r.certifier}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${outcomeColor}`}>{r.outcome}</span>
                    </div>
                    <div className="text-sm text-foreground/60 space-y-0.5">
                      {r.inspectorName && <p>Inspector: {r.inspectorName}</p>}
                      {r.certificateReference && <p>Certificate ref: {r.certificateReference}</p>}
                      {r.nextDueDate && (
                        <p className={`flex items-center gap-1 ${nextDays !== null && nextDays <= 60 ? "text-amber-600 font-medium" : ""}`}>
                          <Clock className="w-3.5 h-3.5" />Next due: {fmt(r.nextDueDate)}
                          {nextDays !== null && nextDays <= 60 && nextDays >= 0 && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 rounded-full border border-amber-200">{nextDays}d</span>}
                          {nextDays !== null && nextDays < 0 && <span className="text-xs bg-red-100 text-red-700 px-1.5 rounded-full border border-red-200">Overdue</span>}
                        </p>
                      )}
                      {r.nonConformances && <p className="text-orange-700"><span className="font-medium">Non-conformances:</span> {r.nonConformances}</p>}
                      {r.actions && <p><span className="font-medium">Actions:</span> {r.actions}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewRecord(r)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Organic Inspection</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Inspection Date</p><p className="font-medium">{fmt(viewRecord.inspectionDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifying Body</p><p className="font-medium">{String(viewRecord.certifier ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Inspector Name</p><p className="font-medium">{String(viewRecord.inspectorName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome</p><p className="font-medium">{String(viewRecord.outcome ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate Reference</p><p className="font-medium">{String(viewRecord.certificateReference ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Inspection Due</p><p className="font-medium">{fmt(viewRecord.nextDueDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Non-Conformances</p><p className="font-medium">{String(viewRecord.nonConformances ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Actions Required</p><p className="font-medium">{String(viewRecord.actions ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={formOpen} onOpenChange={v => { setFormOpen(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Inspection" : "Record Inspection"}</DialogTitle><DialogDescription>Log your annual certifier inspection visit.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Certifying Body *</Label>
                <select className={INPUT_CLS} value={form.certifier} onChange={e => setForm(f => ({ ...f, certifier: e.target.value }))}>
                  {CERTIFIERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><Label>Inspection Date *</Label><Input type="date" className={INPUT_CLS} required value={form.inspectionDate} onChange={e => setForm(f => ({ ...f, inspectionDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Inspector Name</Label><Input className={INPUT_CLS} value={form.inspectorName} onChange={e => setForm(f => ({ ...f, inspectorName: e.target.value }))} /></div>
              <div><Label>Outcome *</Label>
                <select className={INPUT_CLS} value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))}>
                  {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Certificate Reference</Label><Input className={INPUT_CLS} placeholder="e.g. SA-2024-12345" value={form.certificateReference} onChange={e => setForm(f => ({ ...f, certificateReference: e.target.value }))} /></div>
              <div><Label>Next Inspection Due</Label><Input type="date" className={INPUT_CLS} value={form.nextDueDate} onChange={e => setForm(f => ({ ...f, nextDueDate: e.target.value }))} /></div>
            </div>
            {(form.outcome.includes("Non-conformance") || form.outcome.includes("Suspension")) && (
              <>
                <div><Label>Non-Conformances Identified</Label><Textarea value={form.nonConformances} onChange={e => setForm(f => ({ ...f, nonConformances: e.target.value }))} rows={2} /></div>
                <div><Label>Actions Required</Label><Textarea value={form.actions} onChange={e => setForm(f => ({ ...f, actions: e.target.value }))} rows={2} /></div>
              </>
            )}
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditing(null); }}>Cancel</Button>
              <Button type="submit" disabled={createM.isPending || updateM.isPending}>{(createM.isPending || updateM.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Inspection</DialogTitle><DialogDescription>Delete this inspection record? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteM.isPending} onClick={() => deleteId && deleteM.mutate(deleteId)}>{deleteM.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Restricted Inputs Tab ───────────────────────────────────────────────────

const EMPTY_INPUT = { fieldId: null as number | null, fieldName: "", productName: "", productCategory: "", dateApplied: new Date().toISOString().slice(0, 10), appliedBy: "", justification: "", approvalReference: "", certifierNotified: false, notes: "" };
const INPUT_CATEGORIES = ["Fertiliser / Soil Amendment", "Crop Protection / Pesticide", "Growth Regulator", "Cleaning / Disinfectant", "Veterinary Treatment", "Other"];

function RestrictedInputsTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<RestrictedInput | null>(null);
  const [editing, setEditing] = useState<RestrictedInput | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_INPUT);
  const [productCustom, setProductCustom] = useState(false);

  const { data, isLoading } = useQuery<{ records: RestrictedInput[] }>({
    queryKey: ["organic-restricted", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic/restricted-inputs`).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const { data: fieldsData } = useQuery<{ records: FarmField[] }>({
    queryKey: ["farm-fields-lookup", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.ok ? r.json() : { records: [] }),
  });
  const farmFields: FarmField[] = (fieldsData?.records ?? []).map(f => ({ id: f.id, name: f.name, areaHectares: f.areaHectares }));

  const { data: sprayData } = useQuery<{ records: SprayProduct[] }>({
    queryKey: ["spray-products-lookup", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/spray-products`).then(r => r.ok ? r.json() : { records: [] }),
  });
  const sprayProducts: SprayProduct[] = (sprayData?.records ?? []).map((p: any) => ({ id: p.id, productName: p.productName, category: p.category ?? null }));

  const createM = useMutation({
    mutationFn: (body: typeof EMPTY_INPUT) => fetch(`/api/farms/${farmId}/organic/restricted-inputs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-restricted", farmId] }); setFormOpen(false); setForm(EMPTY_INPUT); toast({ title: "Restricted input recorded" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: typeof EMPTY_INPUT }) => fetch(`/api/farms/${farmId}/organic/restricted-inputs/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-restricted", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_INPUT); toast({ title: "Record updated" }); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic/restricted-inputs/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-restricted", farmId] }); setDeleteId(null); toast({ title: "Record deleted" }); },
  });

  function openEdit(r: RestrictedInput) {
    setEditing(r);
    const productInList = sprayProducts.some(p => p.productName === r.productName);
    setProductCustom(!productInList);
    setForm({ fieldId: r.fieldId ?? null, fieldName: r.fieldName ?? "", productName: r.productName, productCategory: r.productCategory ?? "", dateApplied: r.dateApplied?.slice(0, 10) ?? "", appliedBy: r.appliedBy ?? "", justification: r.justification, approvalReference: r.approvalReference ?? "", certifierNotified: r.certifierNotified, notes: r.notes ?? "" });
    setFormOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setProductCustom(false);
    setForm(EMPTY_INPUT);
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) { updateM.mutate({ id: editing.id, body: form }); }
    else { createM.mutate(form); }
  }

  const productSelectValue = sprayProducts.find(p => p.productName === form.productName)
    ? form.productName
    : productCustom ? "__other__"
    : form.productName !== "" ? "__other__"
    : "";

  function handleProductSelect(val: string) {
    if (val === "__other__") {
      setProductCustom(true);
      setForm(f => ({ ...f, productName: "" }));
    } else if (val === "") {
      setProductCustom(false);
      setForm(f => ({ ...f, productName: "" }));
    } else {
      const product = sprayProducts.find(p => p.productName === val);
      if (product) {
        setProductCustom(false);
        setForm(f => ({
          ...f,
          productName: product.productName,
          productCategory: product.category ? mapSprayCategory(product.category) : f.productCategory,
        }));
      }
    }
  }

  if (isLoading) return <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</div>;

  return (
    <>
      <div className="mb-4 flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <p>Restricted inputs are products not normally permitted under organic standards but used in exceptional circumstances with certifier approval or notification. Always consult your certifier before use.</p>
      </div>
      <div className="flex justify-between items-center mb-6">
        {records.length > 0 ? (
          <Button variant="outline" onClick={() => printRestrictedInputsLog(records, farmName)} className="gap-2">
            <Printer className="w-4 h-4" />Print Log
          </Button>
        ) : <div />}
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" />Record Restricted Input</Button>
      </div>

      {records.length === 0 ? (
        <Card className="p-8 text-center">
          <FlaskConical className="w-10 h-10 mx-auto mb-3 text-amber-500 opacity-50" />
          <p className="font-semibold mb-1">No restricted inputs recorded</p>
          <p className="text-sm text-foreground/60">If you've had to use a restricted product on organic land, log it here with your justification and any certifier approval reference.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <FlaskConical className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-semibold">{r.productName}</span>
                    {r.productCategory && <span className="text-xs text-foreground/60 bg-secondary px-2 py-0.5 rounded-full">{r.productCategory}</span>}
                    {r.certifierNotified ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Certifier notified</span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">Certifier not yet notified</span>
                    )}
                  </div>
                  <div className="text-sm text-foreground/60 space-y-0.5">
                    <p>Applied: {fmt(r.dateApplied)}{r.fieldName ? ` · ${r.fieldName}` : ""}{r.appliedBy ? ` · By: ${r.appliedBy}` : ""}</p>
                    <p><span className="font-medium text-foreground/80">Justification:</span> {r.justification}</p>
                    {r.approvalReference && <p>Approval ref: {r.approvalReference}</p>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewRecord(r)}><Eye className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(r.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Restricted Input</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{String(viewRecord.productName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p><p className="font-medium">{String(viewRecord.productCategory ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date Applied</p><p className="font-medium">{fmt(viewRecord.dateApplied)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Field / Area</p><p className="font-medium">{String(viewRecord.fieldName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Applied By</p><p className="font-medium">{String(viewRecord.appliedBy ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Approval Reference</p><p className="font-medium">{String(viewRecord.approvalReference ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Notified</p><p className="font-medium">{viewRecord.certifierNotified ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Justification</p><p className="font-medium">{String(viewRecord.justification ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={formOpen} onOpenChange={v => { setFormOpen(v); if (!v) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Record" : "Record Restricted Input"}</DialogTitle>
            <DialogDescription>Document the exceptional use of a restricted product on organic land.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Product Name *</Label>
              {sprayProducts.length > 0 ? (
                <div className="space-y-1.5">
                  <select className={INPUT_CLS} value={productSelectValue} onChange={e => handleProductSelect(e.target.value)}>
                    <option value="">Select from spray products…</option>
                    {sprayProducts.map(p => (
                      <option key={p.id} value={p.productName}>{p.productName}</option>
                    ))}
                    <option value="__other__">Other / specify below</option>
                  </select>
                  {(productCustom || productSelectValue === "__other__") && (
                    <Input
                      className={INPUT_CLS}
                      required
                      placeholder="Product name"
                      value={form.productName}
                      onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
                      autoFocus
                    />
                  )}
                </div>
              ) : (
                <Input className={INPUT_CLS} required value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} />
              )}
            </div>
            <div><Label>Category</Label>
              <select className={INPUT_CLS} value={form.productCategory} onChange={e => setForm(f => ({ ...f, productCategory: e.target.value }))}>
                <option value="">Select…</option>
                {INPUT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date Applied *</Label><Input type="date" className={INPUT_CLS} required value={form.dateApplied} onChange={e => setForm(f => ({ ...f, dateApplied: e.target.value }))} /></div>
              <div>
                <Label>Field / Area</Label>
                <FieldPicker
                  farmFields={farmFields}
                  fieldId={form.fieldId}
                  fieldName={form.fieldName}
                  onFieldChange={(id, name) => setForm(f => ({ ...f, fieldId: id, fieldName: name }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Applied By</Label><Input className={INPUT_CLS} value={form.appliedBy} onChange={e => setForm(f => ({ ...f, appliedBy: e.target.value }))} /></div>
              <div><Label>Approval Reference</Label><Input className={INPUT_CLS} placeholder="Certifier approval ref" value={form.approvalReference} onChange={e => setForm(f => ({ ...f, approvalReference: e.target.value }))} /></div>
            </div>
            <div><Label>Justification *</Label><Textarea required value={form.justification} onChange={e => setForm(f => ({ ...f, justification: e.target.value }))} rows={3} placeholder="Explain the exceptional circumstances that required this input…" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="notified" checked={form.certifierNotified} onChange={e => setForm(f => ({ ...f, certifierNotified: e.target.checked }))} className="rounded border-border" />
              <Label htmlFor="notified">Certifier has been notified of this use</Label>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditing(null); }}>Cancel</Button>
              <Button type="submit" disabled={createM.isPending || updateM.isPending || !form.productName.trim()}>{(createM.isPending || updateM.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Record</DialogTitle><DialogDescription>Delete this restricted input record? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteM.isPending} onClick={() => deleteId && deleteM.mutate(deleteId)}>{deleteM.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function mapSprayCategory(cat: string): string {
  const c = cat.toLowerCase();
  if (c.includes("herbicide") || c.includes("fungicide") || c.includes("insecticide") || c.includes("pesticide")) return "Crop Protection / Pesticide";
  if (c.includes("fertiliser") || c.includes("fertilizer") || c.includes("nutrient")) return "Fertiliser / Soil Amendment";
  if (c.includes("growth")) return "Growth Regulator";
  return "Other";
}

// ─── Page shell ──────────────────────────────────────────────────────────────

const TABS = ["certification", "fields", "inspections", "restricted-inputs"] as const;
type TabKey = typeof TABS[number];
const TAB_LABELS: Record<TabKey, string> = {
  certification: "Certification",
  fields: "Field Status",
  inspections: "Inspections",
  "restricted-inputs": "Restricted Inputs",
};
const TAB_ICONS: Record<TabKey, React.ElementType> = {
  certification: Leaf,
  fields: BookOpen,
  inspections: ShieldCheck,
  "restricted-inputs": FlaskConical,
};

export default function OrganicPage() {
  const { selectedFarmId, farms } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabKey>("certification");

  if (!selectedFarmId) return <Redirect to="/" />;

  const farm = farms.find(f => f.id === selectedFarmId);
  const farmName = farm?.name ?? "Farm";

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Leaf className="w-6 h-6 text-green-600" />Organic Compliance</h1>
          <p className="text-sm text-foreground/60 mt-1">Complementary records alongside your certifier's portal — Soil Association, OF&G, BDOCA.</p>
        </div>

        <TabBar>
          {TABS.map(tab => {
            const Icon = TAB_ICONS[tab];
            return (
              <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                <Icon className="w-4 h-4" />{TAB_LABELS[tab]}
              </TabButton>
            );
          })}
        </TabBar>

        {activeTab === "certification" && <CertificationTab farmId={selectedFarmId} />}
        {activeTab === "fields" && <FieldsTab farmId={selectedFarmId} farmName={farmName} />}
        {activeTab === "inspections" && <InspectionsTab farmId={selectedFarmId} farmName={farmName} />}
        {activeTab === "restricted-inputs" && <RestrictedInputsTab farmId={selectedFarmId} farmName={farmName} />}
      </div>
    </AppLayout>
  );
}
