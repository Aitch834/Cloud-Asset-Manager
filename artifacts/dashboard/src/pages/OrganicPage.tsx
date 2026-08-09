import React, { useState, useMemo } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Redirect } from "wouter";
import {
  Plus, Loader2, Pencil, Trash2, CheckCircle2, AlertTriangle,
  Calendar, Printer, Leaf, ShieldCheck, FlaskConical, BookOpen,
  Clock, Info, ExternalLink, Eye, ClipboardList, Package, ChevronsUpDown, Check,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DocAttach } from "@/components/DocAttach";

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
const CERT_SCOPES = ["All enterprises", "Arable", "Horticulture", "Livestock", "Livestock & Dairy", "Dairy", "Pigs", "Poultry", "Viticulture", "Other"];
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

function printRestrictedInputsLog(records: OrganicInput[], farmName: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const rows = records.map(r => `<tr>
    <td style="white-space:nowrap">${r.dateOfUse ? new Date(r.dateOfUse).toLocaleDateString("en-GB") : "—"}</td>
    <td style="font-weight:600">${r.productName}</td>
    <td>${r.inputType || "—"}</td>
    <td>${r.fieldName || "—"}</td>
    <td>${r.appliedBy || "—"}</td>
    <td>${r.supplier || "—"}</td>
    <td>${r.poReference || "—"}</td>
    <td>${r.grnReference || "—"}</td>
    <td>${r.justification || "—"}</td>
    <td>${r.certifierApprovalRef || "—"}</td>
    <td>${r.certifierNotified ? "Yes" : "No"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Restricted Inputs Log — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Organic Restricted Inputs Log · Complementary Record</p></div>
<div class="hdr-r"><b>Restricted Inputs</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Date Applied</th><th>Product</th><th>Category</th><th>Field / Area</th><th>Applied By</th><th>Supplier</th><th>PO Reference</th><th>GRN / Delivery</th><th>Justification</th><th>Approval Ref</th><th>Certifier Notified</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Restricted Inputs Log — Complementary record for Soil Association / OF&G portal. Retain with derogation approvals. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

function printInputRegister(records: OrganicInput[], farmName: string, cropYear: number | null) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const yearLabel = cropYear ? `Crop Year ${cropYear}` : "All Years";
  const rows = records.map(r => `<tr>
    <td style="white-space:nowrap">${r.dateOfUse ? new Date(r.dateOfUse).toLocaleDateString("en-GB") : "—"}</td>
    <td style="font-weight:600">${r.productName}</td>
    <td>${r.inputType || "—"}</td>
    <td>${r.supplier || "—"}</td>
    <td>${r.poReference || "—"}</td>
    <td>${r.grnReference || "—"}</td>
    <td style="font-weight:600;color:${r.approvalStatus === "permitted" ? "#166534" : r.approvalStatus === "restricted" ? "#92400e" : "#991b1b"}">${APPROVAL_STATUS_LABELS[r.approvalStatus] ?? r.approvalStatus}</td>
    <td>${r.certifierApprovalRef || "—"}</td>
    <td>${r.fieldName || "—"}</td>
    <td>${r.quantityAmount ? `${r.quantityAmount}${r.quantityUnit ? " " + r.quantityUnit : ""}` : "—"}</td>
    <td>${r.notes || "—"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Input Register — ${farmName} — ${yearLabel}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Organic Input Purchase Register · ${yearLabel} · Complementary Record</p></div>
<div class="hdr-r"><b>Input Register</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Date Used</th><th>Product</th><th>Input Type</th><th>Supplier</th><th>PO Reference</th><th>GRN / Delivery</th><th>Approval Status</th><th>Certifier Ref</th><th>Field / Area</th><th>Quantity</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Organic Input Register — Complementary record for Soil Association / OF&G portal. This register demonstrates that inputs used comply with organic standards. Retain with your organic certification documentation. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Certification {
  id: number; farmId: number; certifier: string; scope: string | null;
  certificateNumber: string | null; certificationDate: string | null;
  renewalDate: string | null; status: string; operatorNumber: string | null; notes: string | null;
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
  documentPath: string | null; documentName: string | null;
}
interface FarmField { id: number; name: string; areaHectares: string | null; }

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

const EMPTY_CERT = { certifier: "Soil Association", scope: "All enterprises", certificateNumber: "", certificationDate: "", renewalDate: "", status: "certified", operatorNumber: "", notes: "" };

function CertificationTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editRecord, setEditRecord] = useState<Certification | null>(null);
  const [viewRecord, setViewRecord] = useState<Certification | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<{ title: string; description: string; dueDate?: string } | null>(null);
  const [form, setForm] = useState(EMPTY_CERT);

  const { data, isLoading } = useQuery<{ records: Certification[] }>({
    queryKey: ["organic-cert", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic/certification`).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const createMut = useMutation({
    mutationFn: (body: typeof EMPTY_CERT) => fetch(`/api/farms/${farmId}/organic/certification`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-cert", farmId] }); setAdding(false); toast({ title: "Certifier registration added" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, ...body }: typeof EMPTY_CERT & { id: number }) => fetch(`/api/farms/${farmId}/organic/certification/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-cert", farmId] }); setEditRecord(null); toast({ title: "Certifier registration updated" }); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic/certification/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-cert", farmId] }); setDeleteId(null); toast({ title: "Certifier registration removed" }); },
    onError: () => toast({ title: "Failed to remove", variant: "destructive" }),
  });

  function openAdd() { setForm(EMPTY_CERT); setAdding(true); }
  function openEdit(r: Certification) {
    setForm({ certifier: r.certifier, scope: r.scope ?? "All enterprises", certificateNumber: r.certificateNumber ?? "", certificationDate: r.certificationDate ?? "", renewalDate: r.renewalDate ?? "", status: r.status, operatorNumber: r.operatorNumber ?? "", notes: r.notes ?? "" });
    setEditRecord(r);
  }

  if (isLoading) return <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-800">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold mb-1">Complementary record — not a replacement</p>
          <p className="text-green-700">BDE Farm Trac stores your certification reference details alongside your operational records. Your official certification is managed directly with your certifier's portal. Add one registration per certifying body — most holdings have one, but diversified farms registered with multiple bodies (e.g. Soil Association for livestock, OF&amp;G for horticulture) can record each separately.</p>
          <div className="flex gap-3 mt-2 flex-wrap">
            <a href="https://www.soilassociation.org/certification" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-700 underline underline-offset-2 hover:text-green-900"><ExternalLink className="w-3 h-3" />Soil Association Portal</a>
            <a href="https://www.ofgorganic.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-green-700 underline underline-offset-2 hover:text-green-900"><ExternalLink className="w-3 h-3" />OF&amp;G Portal</a>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Certifier Registration</Button>
      </div>

      {records.length === 0 ? (
        <Card className="p-8 text-center">
          <Leaf className="w-12 h-12 mx-auto mb-3 text-green-600 opacity-50" />
          <p className="font-semibold text-lg mb-1">No certifier registrations recorded</p>
          <p className="text-sm text-foreground/60 mb-4">Add the certifying body or bodies your holding is registered with.</p>
          <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Certifier Registration</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map(record => {
            const renewalDays = daysUntil(record.renewalDate);
            return (
              <Card key={record.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5"><Leaf className="w-4 h-4 text-green-700" /></div>
                    <div>
                      <p className="font-semibold">{record.certifier}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_COLORS[record.status] ?? STATUS_COLORS.conventional}`}>{STATUS_LABELS[record.status] ?? record.status}</span>
                        {record.scope && <span className="text-xs text-foreground/60 bg-muted px-2 py-0.5 rounded-full border">{record.scope}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {record.renewalDate && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Raise renewal task" onClick={() => setRaiseTaskFor({ title: `Organic Certification Renewal Due — ${record.certifier}`, description: `Your organic certification annual renewal is due. Contact ${record.certifier} and update the record in Organic Compliance → Certification.`, dueDate: record.renewalDate ?? undefined })}>
                        <ClipboardList className="w-4 h-4 text-amber-600" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => setViewRecord(record)}><Eye className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => openEdit(record)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Remove" onClick={() => setDeleteId(record.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mt-4 pt-3 border-t">
                  {record.certificateNumber && <><span className="text-foreground/60">Certificate No.</span><span className="font-medium">{record.certificateNumber}</span></>}
                  {record.operatorNumber && <><span className="text-foreground/60">Operator No.</span><span className="font-medium">{record.operatorNumber}</span></>}
                  {record.certificationDate && <><span className="text-foreground/60">Certified Since</span><span className="font-medium">{fmt(record.certificationDate)}</span></>}
                  {record.renewalDate && (
                    <>
                      <span className="text-foreground/60">Annual Renewal</span>
                      <span className={`font-medium flex items-center gap-1.5 ${renewalDays !== null && renewalDays <= 60 && renewalDays >= 0 ? "text-amber-600" : renewalDays !== null && renewalDays < 0 ? "text-red-600" : ""}`}>
                        {fmt(record.renewalDate)}
                        {renewalDays !== null && renewalDays <= 60 && renewalDays >= 0 && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 rounded-full border border-amber-200">{renewalDays}d</span>}
                        {renewalDays !== null && renewalDays < 0 && <span className="text-xs bg-red-100 text-red-700 px-1.5 rounded-full border border-red-200">Overdue</span>}
                      </span>
                    </>
                  )}
                </div>
                {record.notes && <p className="text-sm text-foreground/70 mt-2 pt-2 border-t">{record.notes}</p>}
              </Card>
            );
          })}
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Certifier Registration Detail</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifying Body</p><p className="font-medium">{viewRecord.certifier}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{STATUS_LABELS[viewRecord.status] ?? viewRecord.status}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Scope / Enterprise</p><p className="font-medium">{viewRecord.scope || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate Number</p><p className="font-medium">{viewRecord.certificateNumber || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Operator Number</p><p className="font-medium">{viewRecord.operatorNumber || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certification Date</p><p className="font-medium">{fmt(viewRecord.certificationDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Annual Renewal Date</p><p className="font-medium">{fmt(viewRecord.renewalDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes || "—"}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={adding || !!editRecord} onOpenChange={v => { if (!v) { setAdding(false); setEditRecord(null); createMut.reset(); updateMut.reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editRecord ? "Edit Certifier Registration" : "Add Certifier Registration"}</DialogTitle>
            <DialogDescription>Record one entry per certifying body. Most holdings have one; diversified farms may have more.</DialogDescription>
          </DialogHeader>
          <form onSubmit={e => {
            e.preventDefault();
            if (editRecord) updateMut.mutate({ ...form, id: editRecord.id });
            else createMut.mutate(form);
          }} className="space-y-4">
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
            <div>
              <Label>Scope / Enterprise</Label>
              <select className={INPUT_CLS} value={form.scope} onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}>
                {CERT_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <p className="text-xs text-foreground/50 mt-1">Which enterprises or activities this certifying body covers for your holding.</p>
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
              <div><Label>Certification Date</Label><Input type="date" className={INPUT_CLS} max={new Date().toISOString().slice(0, 10)} value={form.certificationDate} onChange={e => setForm(f => ({ ...f, certificationDate: e.target.value }))} /></div>
              <div><Label>Annual Renewal Date</Label><Input type="date" min={new Date().toISOString().slice(0, 10)} className={INPUT_CLS} value={form.renewalDate} onChange={e => setForm(f => ({ ...f, renewalDate: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></div>
            <DialogMutationError mutation={editRecord ? updateMut : createMut} message="Failed to save — your entries are still here." />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setAdding(false); setEditRecord(null); }}>Cancel</Button>
              <Button type="submit" disabled={(editRecord ? updateMut : createMut).isPending || !form.certifier}>
                {(editRecord ? updateMut : createMut).isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editRecord ? "Save Changes" : "Add Registration"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {deleteId !== null && (
        <Dialog open onOpenChange={() => { setDeleteId(null); deleteMut.reset(); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Certifier Registration</DialogTitle>
              <DialogDescription>This will permanently remove this certifier registration from your holding records. Are you sure?</DialogDescription>
            </DialogHeader>
            <DialogMutationError mutation={deleteMut} message="Failed to remove — the record is still here." />
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" disabled={deleteMut.isPending} onClick={() => deleteMut.mutate(deleteId)}>
                {deleteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          defaultTitle={raiseTaskFor.title}
          defaultDescription={raiseTaskFor.description}
          defaultDueDate={raiseTaskFor.dueDate}
          taskType="compliance_fix"
          module="Organic Compliance"
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
        />
      )}
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
    mutationFn: (body: typeof EMPTY_FIELD) => fetch(`/api/farms/${farmId}/organic/fields`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-fields", farmId] }); setFormOpen(false); setForm(EMPTY_FIELD); toast({ title: "Field saved" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: typeof EMPTY_FIELD }) => fetch(`/api/farms/${farmId}/organic/fields/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-fields", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_FIELD); toast({ title: "Field updated" }); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic/fields/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-fields", farmId] }); setDeleteId(null); toast({ title: "Field removed" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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

      <Dialog open={formOpen} onOpenChange={v => { setFormOpen(v); if (!v) { setEditing(null); createM.reset(); updateM.reset(); } }}>
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
              <div><Label>Conversion Start Date</Label><Input type="date" className={INPUT_CLS} max={new Date().toISOString().slice(0, 10)} value={form.conversionStartDate} onChange={e => setForm(f => ({ ...f, conversionStartDate: e.target.value }))} /></div>
            )}
            {form.status === "certified" && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Certified From</Label><Input type="date" className={INPUT_CLS} max={new Date().toISOString().slice(0, 10)} value={form.certificationDate} onChange={e => setForm(f => ({ ...f, certificationDate: e.target.value }))} /></div>
                <div><Label>Certifier Reference</Label><Input className={INPUT_CLS} placeholder="e.g. SA-2024-F001" value={form.certifierRef} onChange={e => setForm(f => ({ ...f, certifierRef: e.target.value }))} /></div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="parallel" checked={form.parallelProduction} onChange={e => setForm(f => ({ ...f, parallelProduction: e.target.checked }))} className="rounded border-border" />
              <Label htmlFor="parallel">Parallel production (part-organic, part-conventional enterprise)</Label>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <DialogMutationError mutation={editing ? updateM : createM} message="Failed to save — your entries are still here." />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditing(null); }}>Cancel</Button>
              <Button type="submit" disabled={createM.isPending || updateM.isPending || !form.fieldName.trim()}>{(createM.isPending || updateM.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={v => { if (!v) { setDeleteId(null); deleteM.reset(); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Remove Field</DialogTitle><DialogDescription>Remove this field from the organic register? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={deleteM} message="Failed to remove — the record is still here." />
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
  const [raiseTaskFor, setRaiseTaskFor] = useState<{ title: string; description: string; dueDate?: string } | null>(null);

  const { data, isLoading } = useQuery<{ records: InspectionRecord[] }>({
    queryKey: ["organic-inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic/inspections`).then(r => r.json()),
  });
  const records = data?.records ?? [];

  const createM = useMutation({
    mutationFn: (body: typeof EMPTY_INSP) => fetch(`/api/farms/${farmId}/organic/inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-inspections", farmId] }); setFormOpen(false); setForm(EMPTY_INSP); toast({ title: "Inspection recorded" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: typeof EMPTY_INSP }) => fetch(`/api/farms/${farmId}/organic/inspections/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-inspections", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_INSP); toast({ title: "Inspection updated" }); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic/inspections/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-inspections", farmId] }); setDeleteId(null); toast({ title: "Inspection deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
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
                      <p className="mt-1">
                        <DocAttach
                          farmId={farmId}
                          endpoint="organic/inspections"
                          recordId={r.id}
                          documentPath={r.documentPath}
                          documentName={r.documentName}
                          queryKey={["organic-inspections", String(farmId)]}
                        />
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {r.nextDueDate && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Raise task" onClick={() => setRaiseTaskFor({ title: `Organic Inspection Due — ${r.certifier}`, description: `The next annual organic inspection by ${r.certifier} is due. Contact your certifying body to schedule and confirm the visit.`, dueDate: r.nextDueDate ?? undefined })}>
                        <ClipboardList className="w-4 h-4 text-amber-600" />
                      </Button>
                    )}
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

      <Dialog open={formOpen} onOpenChange={v => { setFormOpen(v); if (!v) { setEditing(null); createM.reset(); updateM.reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Inspection" : "Record Inspection"}</DialogTitle><DialogDescription>Log your annual certifier inspection visit.</DialogDescription></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Certifying Body *</Label>
                <select className={INPUT_CLS} value={form.certifier} onChange={e => setForm(f => ({ ...f, certifier: e.target.value }))}>
                  {CERTIFIERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><Label>Inspection Date *</Label><Input type="date" className={INPUT_CLS} max={new Date().toISOString().slice(0, 10)} required value={form.inspectionDate} onChange={e => setForm(f => ({ ...f, inspectionDate: e.target.value }))} /></div>
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
              <div><Label>Next Inspection Due</Label><Input type="date" min={new Date().toISOString().slice(0, 10)} className={INPUT_CLS} value={form.nextDueDate} onChange={e => setForm(f => ({ ...f, nextDueDate: e.target.value }))} /></div>
            </div>
            {(form.outcome.includes("Non-conformance") || form.outcome.includes("Suspension")) && (
              <>
                <div><Label>Non-Conformances Identified</Label><Textarea value={form.nonConformances} onChange={e => setForm(f => ({ ...f, nonConformances: e.target.value }))} rows={2} /></div>
                <div><Label>Actions Required</Label><Textarea value={form.actions} onChange={e => setForm(f => ({ ...f, actions: e.target.value }))} rows={2} /></div>
              </>
            )}
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <DialogMutationError mutation={editing ? updateM : createM} message="Failed to save — your entries are still here." />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditing(null); }}>Cancel</Button>
              <Button type="submit" disabled={createM.isPending || updateM.isPending}>{(createM.isPending || updateM.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={v => { if (!v) { setDeleteId(null); deleteM.reset(); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Inspection</DialogTitle><DialogDescription>Delete this inspection record? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={deleteM} message="Failed to delete — the record is still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteM.isPending} onClick={() => deleteId && deleteM.mutate(deleteId)}>{deleteM.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          defaultTitle={raiseTaskFor.title}
          defaultDescription={raiseTaskFor.description}
          defaultDueDate={raiseTaskFor.dueDate}
          taskType="compliance_fix"
          module="Organic Compliance"
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
        />
      )}
    </>
  );
}

// ─── Approved substance lookups (UK Organic Regulation Annex I & II) ─────────

interface SubstanceOption {
  substance: string;
  autoType: string;
}

const ANNEX_I_INPUTS: SubstanceOption[] = [
  { substance: "Farmyard Manure (FYM) — composted or well-rotted", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Composted Plant & Animal Material", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Green Manure / Cover Crop Residue", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Slurry (composted; restricted from non-organic units)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Straw / Crop Residues", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Dried Blood (Blood Meal)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Bone Meal / Steamed Bone Flour", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Hoof & Horn Meal", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Feather Meal", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Fish Meal / Fish Emulsion", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Seaweed Meal", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Calcified Seaweed (Lithothamnium)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Seaweed Extract (liquid)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Rock Phosphate (soft / reactive)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Basic Slag", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Potassium Sulphate (natural mineral extraction, low chloride)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Kieserite (Magnesium Sulphate, natural mineral)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Vinasse (potassium-rich molasses by-product)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Wood Ash (from untreated wood only)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Leonardite / Humic Acid Product", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Ground Limestone / Calcium Carbonate", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Dolomitic Limestone / Magnesium Limestone", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Gypsum (natural calcium sulphate)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Elemental Sulphur", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Borax / Boron Product", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Zinc Sulphate (trace element)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Manganese Sulphate (trace element)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Iron Chelate / Iron Sulphate (trace element)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Molybdenum Product (trace element)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Bentonite / Clay Minerals", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Peat (growing media only, not direct soil application)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Vermiculite (growing media)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Perlite (growing media)", autoType: "Fertiliser / Soil Amendment" },
  { substance: "Certified Organic Seed", autoType: "Seed Treatment" },
  { substance: "Untreated Conventional Seed (derogation required)", autoType: "Seed Treatment" },
  { substance: "Potassium Permanganate (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Calcium Hydroxide / Slaked Lime (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Hydrogen Peroxide (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Peracetic Acid (disinfection)", autoType: "Cleaning & Disinfection" },
  { substance: "Sodium Hypochlorite (disinfection of equipment only)", autoType: "Cleaning & Disinfection" },
];

function SubstancePicker({
  options,
  value,
  onSelect,
  placeholder,
}: {
  options: SubstanceOption[];
  value: string;
  onSelect: (substance: string, autoType: string) => void;
  placeholder: string;
}) {
  const inList = options.some(o => o.substance === value);
  const [showCustom, setShowCustom] = useState(!inList && value !== "");
  const selectValue = inList ? value : (showCustom || value !== "") ? "__other__" : "";

  function handleSelect(val: string) {
    if (val === "__other__") {
      setShowCustom(true);
      onSelect("", "");
    } else if (val === "") {
      setShowCustom(false);
      onSelect("", "");
    } else {
      const opt = options.find(o => o.substance === val);
      if (opt) {
        setShowCustom(false);
        onSelect(opt.substance, opt.autoType);
      }
    }
  }

  return (
    <div className="space-y-1.5">
      <select className={INPUT_CLS} value={selectValue} onChange={e => handleSelect(e.target.value)}>
        <option value="">Select approved substance…</option>
        {options.map(o => (
          <option key={o.substance} value={o.substance}>{o.substance}</option>
        ))}
        <option value="__other__">Other / specify below</option>
      </select>
      {(showCustom || selectValue === "__other__") && (
        <Input
          className={INPUT_CLS}
          required
          placeholder={placeholder}
          value={inList ? "" : value}
          onChange={e => onSelect(e.target.value, "")}
          autoFocus
        />
      )}
    </div>
  );
}

// ─── Restricted Inputs Tab ───────────────────────────────────────────────────

interface OrganicInput {
  id: number; farmId: number; productName: string; inputType: string | null;
  supplier: string | null; poReference: string | null; grnReference: string | null;
  approvalStatus: string; certifierApprovalRef: string | null;
  cropYear: number | null; dateOfUse: string | null; quantityAmount: string | null;
  quantityUnit: string | null; fieldId: number | null; fieldName: string | null;
  justification: string | null; certifierNotified: boolean; appliedBy: string | null;
  notes: string | null; createdAt: string;
}

interface Supplier { id: number; name: string; supplierType: string; accountNumber?: string | null; }
interface PurchaseOrder { id: number; poNumber: string; supplierId: number | null; orderDate: string | null; status: string; }
interface StockDelivery { id: number; grnNumber: string | null; supplierId: number | null; poId: number | null; deliveryDate: string | null; }

const APPROVAL_STATUS_LABELS: Record<string, string> = {
  permitted: "Permitted",
  restricted: "Restricted (notify certifier)",
  derogation: "Derogation Required",
};
const APPROVAL_STATUS_COLORS: Record<string, string> = {
  permitted: "bg-green-100 text-green-800 border-green-200",
  restricted: "bg-amber-100 text-amber-800 border-amber-200",
  derogation: "bg-red-100 text-red-800 border-red-200",
};
const INPUT_TYPES = ["Fertiliser / Soil Amendment", "Crop Protection", "Seed Treatment", "Feed Supplement / Additive", "Cleaning & Disinfection", "Other"];
const QUANTITY_UNITS = ["kg", "g", "tonnes", "L", "mL", "bags", "units", "other"];

function yearRange(): number[] {
  const y = new Date().getFullYear();
  return [y + 1, y, y - 1, y - 2, y - 3, y - 4];
}

function SupplierCombobox({ suppliers, value, valueId, onChange }: {
  suppliers: Supplier[];
  value: string;
  valueId: number | null;
  onChange: (id: number | null, name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" type="button"
            className="flex-1 justify-between font-normal text-left h-12 px-3 rounded-xl border-2 border-border">
            <span className={value ? "text-foreground" : "text-muted-foreground"}>
              {value || "Search Trade Contacts…"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search suppliers…" />
            <CommandList>
              <CommandEmpty>No supplier found in Trade Contacts.</CommandEmpty>
              <CommandGroup>
                {suppliers.map(s => (
                  <CommandItem key={s.id} value={s.name} onSelect={() => { onChange(s.id, s.name); setOpen(false); }}>
                    <Check className={`mr-2 h-4 w-4 ${valueId === s.id ? "opacity-100" : "opacity-0"}`} />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{s.name}</span>
                      {s.accountNumber && <span className="text-xs text-muted-foreground">Acct: {s.accountNumber}</span>}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {(value || valueId !== null) && (
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null, "")}
          className="px-2 h-12 text-muted-foreground hover:text-destructive" title="Clear supplier">
          ×
        </Button>
      )}
    </div>
  );
}

function RestrictedInputsTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const { data, isLoading } = useQuery<{ records: OrganicInput[] }>({
    queryKey: ["organic-inputs", farmId, "all"],
    queryFn: () => fetch(`/api/farms/${farmId}/organic/inputs`).then(r => r.json()),
  });
  const allRecords = data?.records ?? [];
  const records = allRecords.filter(r => r.approvalStatus === "restricted" || r.approvalStatus === "derogation");

  if (isLoading) return <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</div>;

  return (
    <>
      <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm space-y-1.5">
        <div className="flex gap-2 items-center text-amber-900">
          <Info className="w-4 h-4 shrink-0" />
          <p className="font-semibold">Restricted &amp; derogation inputs — read-only audit view</p>
        </div>
        <p className="text-amber-800">This view shows all inputs from the <strong>Input Register</strong> that have Restricted or Derogation status — for easy inspection and printing. To add or edit a restricted input, use the <strong>Input Register</strong> tab and set the approval status accordingly.</p>
      </div>

      {records.length > 0 && (
        <div className="flex justify-end mb-4">
          <Button variant="outline" size="sm" onClick={() => printRestrictedInputsLog(records, farmName)} className="gap-2">
            <Printer className="w-4 h-4" />Print Restricted Inputs Log
          </Button>
        </div>
      )}

      {records.length === 0 ? (
        <Card className="p-8 text-center">
          <FlaskConical className="w-10 h-10 mx-auto mb-3 text-amber-500 opacity-50" />
          <p className="font-semibold mb-1">No restricted or derogation inputs recorded</p>
          <p className="text-sm text-foreground/60">When you add an input in the Input Register with Restricted or Derogation status, it will appear here for audit review.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <FlaskConical className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="font-semibold">{r.productName}</span>
                  {r.inputType && <span className="text-xs text-foreground/60 bg-secondary px-2 py-0.5 rounded-full">{r.inputType}</span>}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${APPROVAL_STATUS_COLORS[r.approvalStatus] ?? APPROVAL_STATUS_COLORS.permitted}`}>{APPROVAL_STATUS_LABELS[r.approvalStatus] ?? r.approvalStatus}</span>
                  {r.certifierNotified ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-green-50 text-green-700 border-green-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Certifier notified</span>
                  ) : (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200">Certifier not yet notified</span>
                  )}
                </div>
                <div className="text-sm text-foreground/60 space-y-0.5">
                  <p className="flex items-center gap-3 flex-wrap">
                    {r.dateOfUse && <span>Applied: {fmt(r.dateOfUse)}</span>}
                    {r.fieldName && <span>Field: {r.fieldName}</span>}
                    {r.appliedBy && <span>By: {r.appliedBy}</span>}
                  </p>
                  {r.justification && <p><span className="font-medium text-foreground/80">Justification:</span> {r.justification}</p>}
                  {r.certifierApprovalRef && <p>Certifier approval ref: {r.certifierApprovalRef}</p>}
                  {(r.supplier || r.poReference) && (
                    <p className="flex items-center gap-2 flex-wrap">
                      {r.supplier && <span>Supplier: {r.supplier}</span>}
                      {r.poReference && <span>· PO: {r.poReference}</span>}
                      {r.grnReference && <span>· GRN: {r.grnReference}</span>}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}



// ─── Input Register Tab ───────────────────────────────────────────────────────

const EMPTY_ORG_INPUT = {
  fieldId: null as number | null,
  fieldName: "",
  productName: "",
  inputType: "",
  supplier: "",
  poReference: "",
  grnReference: "",
  approvalStatus: "permitted",
  certifierApprovalRef: "",
  cropYear: new Date().getFullYear(),
  dateOfUse: new Date().toISOString().slice(0, 10),
  quantityAmount: "",
  quantityUnit: "kg",
  justification: "",
  certifierNotified: false,
  appliedBy: "",
  notes: "",
};

function InputRegisterTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<OrganicInput | null>(null);
  const [editing, setEditing] = useState<OrganicInput | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_ORG_INPUT);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "organic-input-register", filter: "year", farmId, defaultValue: String(new Date().getFullYear()) });
  const [supplierIdFilter, setSupplierIdFilter] = useState<number | null>(null);
  const [poIdFilter, setPoIdFilter] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ records: OrganicInput[] }>({
    queryKey: ["organic-inputs", farmId, yearFilter],
    queryFn: () => {
      const url = yearFilter === "all"
        ? `/api/farms/${farmId}/organic/inputs`
        : `/api/farms/${farmId}/organic/inputs?cropYear=${yearFilter}`;
      return fetch(url).then(r => r.json());
    },
  });
  const records = data?.records ?? [];

  const { data: fieldsData } = useQuery<{ records: FarmField[] }>({
    queryKey: ["farm-fields-lookup", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/fields`).then(r => r.ok ? r.json() : { records: [] }),
  });
  const farmFields: FarmField[] = (fieldsData?.records ?? []).map(f => ({ id: f.id, name: f.name, areaHectares: f.areaHectares }));

  const { data: suppliersData } = useQuery<Supplier[]>({
    queryKey: ["suppliers-list", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/suppliers`).then(r => r.json()).then(d => d.records ?? []),
  });
  const suppliers: Supplier[] = suppliersData ?? [];

  const { data: posData } = useQuery<PurchaseOrder[]>({
    queryKey: ["purchase-orders", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/purchase-orders`).then(r => r.json()).then(d => d.records ?? []),
  });
  const allPOs: PurchaseOrder[] = posData ?? [];

  const { data: grnsData } = useQuery<StockDelivery[]>({
    queryKey: ["stock-deliveries", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-deliveries`).then(r => r.json()).then(d => d.records ?? []),
  });
  const allGRNs: StockDelivery[] = grnsData ?? [];

  const filteredPOs = useMemo(
    () => supplierIdFilter ? allPOs.filter(p => p.supplierId === supplierIdFilter) : allPOs,
    [allPOs, supplierIdFilter]
  );
  const filteredGRNs = useMemo(
    () => poIdFilter ? allGRNs.filter(g => g.poId === poIdFilter)
      : supplierIdFilter ? allGRNs.filter(g => g.supplierId === supplierIdFilter)
      : allGRNs,
    [allGRNs, poIdFilter, supplierIdFilter]
  );

  const createM = useMutation({
    mutationFn: (body: typeof EMPTY_ORG_INPUT) => fetch(`/api/farms/${farmId}/organic/inputs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-inputs", farmId] }); setFormOpen(false); setForm(EMPTY_ORG_INPUT); toast({ title: "Input recorded" }); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: typeof EMPTY_ORG_INPUT }) => fetch(`/api/farms/${farmId}/organic/inputs/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-inputs", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_ORG_INPUT); toast({ title: "Input updated" }); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/organic/inputs/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["organic-inputs", farmId] }); setDeleteId(null); toast({ title: "Input deleted" }); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openEdit(r: OrganicInput) {
    setEditing(r);
    setForm({
      fieldId: r.fieldId ?? null,
      fieldName: r.fieldName ?? "",
      productName: r.productName,
      inputType: r.inputType ?? "",
      supplier: r.supplier ?? "",
      poReference: r.poReference ?? "",
      grnReference: r.grnReference ?? "",
      approvalStatus: r.approvalStatus,
      certifierApprovalRef: r.certifierApprovalRef ?? "",
      cropYear: r.cropYear ?? new Date().getFullYear(),
      dateOfUse: r.dateOfUse?.slice(0, 10) ?? "",
      quantityAmount: r.quantityAmount ?? "",
      quantityUnit: r.quantityUnit ?? "kg",
      justification: r.justification ?? "",
      certifierNotified: r.certifierNotified,
      appliedBy: r.appliedBy ?? "",
      notes: r.notes ?? "",
    });
    const matchedSupplier = suppliers.find(s => s.name === (r.supplier ?? ""));
    setSupplierIdFilter(matchedSupplier?.id ?? null);
    const matchedPO = allPOs.find(p => p.poNumber === (r.poReference ?? ""));
    setPoIdFilter(matchedPO?.id ?? null);
    setFormOpen(true);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_ORG_INPUT);
    setSupplierIdFilter(null);
    setPoIdFilter(null);
    setFormOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) { updateM.mutate({ id: editing.id, body: form }); }
    else { createM.mutate(form); }
  }

  const permitted = records.filter(r => r.approvalStatus === "permitted").length;
  const restricted = records.filter(r => r.approvalStatus === "restricted").length;
  const derogation = records.filter(r => r.approvalStatus === "derogation").length;

  if (isLoading) return <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</div>;

  return (
    <>
      <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-sm space-y-2">
        <div className="flex gap-2 items-center text-green-900">
          <Info className="w-4 h-4 shrink-0" />
          <p className="font-semibold">Input register — arable, horticultural &amp; general farm inputs</p>
        </div>
        <p className="text-green-800">Record all permitted, restricted, and derogated inputs applied to <strong>arable crops, general organic land, or shared farm infrastructure</strong> — fertilisers, crop protection, seed treatments, and cleaning products. This is your evidence register for annual certifier inspection.</p>
        <div className="text-green-700 space-y-1 text-xs border-t border-green-200 pt-2">
          <p className="font-medium mb-0.5">Other sectors have their own dedicated input logs — record in the correct place to avoid duplication:</p>
          <p>→ <strong>Vineyard inputs</strong> (including restricted &amp; derogated products) — use <em>Organic Viticulture → Organic Inputs</em></p>
          <p>→ <strong>Fresh produce inputs</strong> — use <em>Organic Fresh Produce → Input Log</em></p>
          <p>→ <strong>Livestock &amp; dairy feed records</strong> — use <em>Organic Livestock → Feed Records</em></p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-xl border-2 border-border bg-transparent px-3 text-sm"
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
          >
            <option value="all">All years</option>
            {yearRange().map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {records.length > 0 && (
            <>
              <div className="flex gap-3 text-sm pl-1">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />{permitted} permitted</span>
                {restricted > 0 && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{restricted} restricted</span>}
                {derogation > 0 && <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />{derogation} derogation</span>}
              </div>
              <Button variant="outline" size="sm" onClick={() => printInputRegister(records, farmName, yearFilter === "all" ? null : Number(yearFilter))} className="gap-2">
                <Printer className="w-4 h-4" />Print Register
              </Button>
            </>
          )}
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" />Add Input</Button>
      </div>

      {records.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="w-10 h-10 mx-auto mb-3 text-green-500 opacity-50" />
          <p className="font-semibold mb-1">No inputs recorded{yearFilter !== "all" ? ` for ${yearFilter}` : ""}</p>
          <p className="text-sm text-foreground/60">Log every input used on organic land — this is your evidence register for annual inspection.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {records.map(r => {
            const statusColor = APPROVAL_STATUS_COLORS[r.approvalStatus] ?? APPROVAL_STATUS_COLORS.permitted;
            return (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Package className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="font-semibold">{r.productName}</span>
                      {r.inputType && <span className="text-xs text-foreground/60 bg-secondary px-2 py-0.5 rounded-full">{r.inputType}</span>}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor}`}>{APPROVAL_STATUS_LABELS[r.approvalStatus] ?? r.approvalStatus}</span>
                    </div>
                    <div className="text-sm text-foreground/60 space-y-0.5">
                      <p className="flex items-center gap-3 flex-wrap">
                        {r.dateOfUse && <span>{fmt(r.dateOfUse)}</span>}
                        {r.supplier && <span>Supplier: {r.supplier}</span>}
                        {r.fieldName && <span>Field: {r.fieldName}</span>}
                        {r.quantityAmount && <span>Qty: {r.quantityAmount}{r.quantityUnit ? ` ${r.quantityUnit}` : ""}</span>}
                      </p>
                      {(r.poReference || r.grnReference) && (
                        <p className="flex items-center gap-2 flex-wrap">
                          {r.poReference && <span>PO: {r.poReference}</span>}
                          {r.grnReference && <span>· GRN: {r.grnReference}</span>}
                        </p>
                      )}
                      {(r.approvalStatus === "restricted" || r.approvalStatus === "derogation") && r.certifierApprovalRef && (
                        <p>Certifier ref: {r.certifierApprovalRef}</p>
                      )}
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
            <DialogHeader><DialogTitle>View Input Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{viewRecord.productName}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Input Type</p><p className="font-medium">{viewRecord.inputType || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supplier</p><p className="font-medium">{viewRecord.supplier || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Approval Status</p><p className="font-medium">{APPROVAL_STATUS_LABELS[viewRecord.approvalStatus] ?? viewRecord.approvalStatus}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Purchase Order</p><p className="font-medium">{viewRecord.poReference || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">GRN / Delivery Note</p><p className="font-medium">{viewRecord.grnReference || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Approval Ref</p><p className="font-medium">{viewRecord.certifierApprovalRef || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Crop Year</p><p className="font-medium">{viewRecord.cropYear ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date of Use</p><p className="font-medium">{fmt(viewRecord.dateOfUse)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Field / Area</p><p className="font-medium">{viewRecord.fieldName || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity</p><p className="font-medium">{viewRecord.quantityAmount ? `${viewRecord.quantityAmount}${viewRecord.quantityUnit ? " " + viewRecord.quantityUnit : ""}` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Applied By</p><p className="font-medium">{viewRecord.appliedBy || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifier Notified</p><p className="font-medium">{viewRecord.certifierNotified ? "Yes" : "No"}</p></div>
              {viewRecord.justification && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Justification</p><p className="font-medium">{viewRecord.justification}</p></div>}
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRecord.notes || "—"}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={formOpen} onOpenChange={v => { setFormOpen(v); if (!v) { setEditing(null); createM.reset(); updateM.reset(); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Input Record" : "Add Input"}</DialogTitle>
            <DialogDescription>Record an input used on organic land for your evidence register.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Substance / Product Name *</Label>
              <SubstancePicker
                options={ANNEX_I_INPUTS}
                value={form.productName}
                onSelect={(substance, autoType) => setForm(f => ({
                  ...f,
                  productName: substance,
                  inputType: autoType || f.inputType,
                }))}
                placeholder="e.g. Calcified seaweed, compost, product trade name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Input Type</Label>
                <select className={INPUT_CLS} value={form.inputType} onChange={e => setForm(f => ({ ...f, inputType: e.target.value }))}>
                  <option value="">Select…</option>
                  {INPUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="col-span-1">
                <Label>Supplier</Label>
                <SupplierCombobox
                  suppliers={suppliers}
                  value={form.supplier}
                  valueId={supplierIdFilter}
                  onChange={(id, name) => {
                    setSupplierIdFilter(id);
                    setPoIdFilter(null);
                    setForm(f => ({ ...f, supplier: name, poReference: "", grnReference: "" }));
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Purchase Order</Label>
                <select className={INPUT_CLS} value={form.poReference} onChange={e => {
                  const poNum = e.target.value;
                  const po = allPOs.find(p => p.poNumber === poNum);
                  setPoIdFilter(po?.id ?? null);
                  setForm(f => ({ ...f, poReference: poNum, grnReference: "" }));
                }}>
                  <option value="">— None —</option>
                  {filteredPOs.map(p => (
                    <option key={p.id} value={p.poNumber}>{p.poNumber}{p.orderDate ? ` · ${fmt(p.orderDate)}` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>GRN / Delivery Note</Label>
                <select className={INPUT_CLS} value={form.grnReference} onChange={e => setForm(f => ({ ...f, grnReference: e.target.value }))}>
                  <option value="">— None —</option>
                  {filteredGRNs.filter(g => g.grnNumber).map(g => (
                    <option key={g.id} value={g.grnNumber!}>{g.grnNumber}{g.deliveryDate ? ` · ${fmt(g.deliveryDate)}` : ""}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Approval Status *</Label>
                <select className={INPUT_CLS} value={form.approvalStatus} onChange={e => setForm(f => ({ ...f, approvalStatus: e.target.value }))}>
                  <option value="permitted">Permitted</option>
                  <option value="restricted">Restricted (notify certifier)</option>
                  <option value="derogation">Derogation Required</option>
                </select>
              </div>
              {(form.approvalStatus === "restricted" || form.approvalStatus === "derogation") && (
                <div><Label>Certifier Approval Ref</Label><Input className={INPUT_CLS} value={form.certifierApprovalRef} onChange={e => setForm(f => ({ ...f, certifierApprovalRef: e.target.value }))} /></div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Crop Year</Label>
                <select className={INPUT_CLS} value={form.cropYear} onChange={e => setForm(f => ({ ...f, cropYear: parseInt(e.target.value) }))}>
                  {yearRange().map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div><Label>Date of Use</Label><Input type="date" className={INPUT_CLS} max={new Date().toISOString().slice(0, 10)} value={form.dateOfUse} onChange={e => setForm(f => ({ ...f, dateOfUse: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Field / Area</Label>
                <FieldPicker
                  farmFields={farmFields}
                  fieldId={form.fieldId}
                  fieldName={form.fieldName}
                  onFieldChange={(id, name) => setForm(f => ({ ...f, fieldId: id, fieldName: name }))}
                />
              </div>
              <div>
                <Label>Quantity</Label>
                <div className="flex gap-1.5">
                  <Input className={INPUT_CLS} placeholder="Amount" value={form.quantityAmount} onChange={e => setForm(f => ({ ...f, quantityAmount: e.target.value }))} />
                  <select className="h-12 rounded-xl border-2 border-border bg-transparent px-2 text-sm" value={form.quantityUnit} onChange={e => setForm(f => ({ ...f, quantityUnit: e.target.value }))}>
                    {QUANTITY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </div>
            {form.approvalStatus !== "permitted" && (
              <>
                <div><Label>Justification *</Label><Textarea required value={form.justification} onChange={e => setForm(f => ({ ...f, justification: e.target.value }))} rows={2} placeholder="Explain why this restricted/derogated input is necessary…" /></div>
                <div><Label>Applied By</Label><Input className={INPUT_CLS} value={form.appliedBy} onChange={e => setForm(f => ({ ...f, appliedBy: e.target.value }))} /></div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="certNotifiedInput" checked={form.certifierNotified} onChange={e => setForm(f => ({ ...f, certifierNotified: e.target.checked }))} className="rounded border-border" />
                  <Label htmlFor="certNotifiedInput">Certifier has been notified of this use</Label>
                </div>
              </>
            )}
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <DialogMutationError mutation={editing ? updateM : createM} message="Failed to save — your entries are still here." />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditing(null); }}>Cancel</Button>
              <Button type="submit" disabled={createM.isPending || updateM.isPending || !form.productName.trim()}>{(createM.isPending || updateM.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={v => { if (!v) { setDeleteId(null); deleteM.reset(); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Input</DialogTitle><DialogDescription>Delete this input record? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={deleteM} message="Failed to delete — the record is still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteM.isPending} onClick={() => deleteId && deleteM.mutate(deleteId)}>{deleteM.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


// ─── Page shell ──────────────────────────────────────────────────────────────

const TABS = ["certification", "fields", "inspections", "restricted-inputs", "input-register"] as const;
type TabKey = typeof TABS[number];
const TAB_LABELS: Record<TabKey, string> = {
  certification: "Certification",
  fields: "Field Status",
  inspections: "Inspections",
  "restricted-inputs": "Restricted Inputs",
  "input-register": "Input Register",
};
const TAB_ICONS: Record<TabKey, React.ElementType> = {
  certification: Leaf,
  fields: BookOpen,
  inspections: ShieldCheck,
  "restricted-inputs": FlaskConical,
  "input-register": ClipboardList,
};

export default function OrganicPage() {
  const { farmId } = useAppStore();
  const [activeTab, setActiveTab] = usePersistedTab<TabKey>({ page: "organic", farmId, validIds: TABS, defaultTab: "certification" });

  const { data: farmData } = useQuery<{ name: string }>({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const farmName = farmData?.name ?? "Farm";

  if (!farmId) return <Redirect to="/" />;

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

        {activeTab === "certification" && <CertificationTab farmId={farmId} />}
        {activeTab === "fields" && <FieldsTab farmId={farmId} farmName={farmName} />}
        {activeTab === "inspections" && <InspectionsTab farmId={farmId} farmName={farmName} />}
        {activeTab === "restricted-inputs" && <RestrictedInputsTab farmId={farmId} farmName={farmName} />}
        {activeTab === "input-register" && <InputRegisterTab farmId={farmId} farmName={farmName} />}
      </div>
    </AppLayout>
  );
}
