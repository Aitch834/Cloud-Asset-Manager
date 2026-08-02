import React, { useState, useEffect } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { CropYearSelector } from "@/components/CropYearSelector";
import { currentCropYear, isInCropYear, cropYearLabel } from "@/lib/cropYear";
import { FarmLocationSelect } from "@/components/ui/FarmLocationSelect";
import { TypeaheadInput } from "@/components/ui/TypeaheadInput";
import { SignatureModal } from "@/components/ui/SignaturePad";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Redirect, Link } from "wouter";
import {
  Plus, Search, Loader2, Pencil, Trash2, Users, Bug, ShieldCheck, Eye,
  CheckCircle2, XCircle, AlertTriangle, Calendar, Printer, FileText,
  Camera, File, ChevronDown, ChevronUp, Pen, X, Clock, Package, HardHat,
  ClipboardList, History, Droplets, FlaskConical,
} from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { useToast } from "@/hooks/use-toast";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";

type MainTab = "visitors" | "pest-control" | "cleaning" | "coshh" | "biosecurity-plan";

function formatDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  catch { return val; }
}
function formatDateTime(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
  catch { return val; }
}
function daysBetween(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - now.getTime()) / 86400000);
}
function dueBadge(dateStr: string | null | undefined, label = "Follow-up") {
  if (!dateStr) return null;
  const days = daysBetween(dateStr);
  if (days === null) return null;
  if (days < 0) return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200"><AlertTriangle className="w-3 h-3" />{label} overdue</span>;
  if (days === 0) return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200"><AlertTriangle className="w-3 h-3" />{label} today</span>;
  if (days <= 14) return <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200"><Calendar className="w-3 h-3" />{label} in {days}d</span>;
  return null;
}

// ─── Print helpers ────────────────────────────────────────────────────────────

const PRINT_CSS = `body{font-family:Arial,sans-serif;font-size:9.5px;margin:0;color:#000}
h1{font-size:13px;font-weight:700;margin:0 0 2px}p.sub{font-size:10px;color:#555;margin:1px 0}
table{width:100%;border-collapse:collapse;margin-top:14px}
th{background:#166534;color:#fff;padding:5px 7px;text-align:left;font-size:9px;font-weight:700;white-space:nowrap}
td{padding:4px 7px;border-bottom:1px solid #e5e7eb;vertical-align:top;font-size:9px}
tr:nth-child(even) td{background:#f9fafb}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #166534;padding-bottom:10px;margin-bottom:14px}
.hdr-r{text-align:right;font-size:10px;color:#555}.hdr-r b{display:block;font-size:13px;font-weight:700;color:#000}
.footer{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:20px}`;

function openPrint(html: string) {
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); w.addEventListener("afterprint", () => w.close()); w.print(); }
}

// ─── Visitor Log ──────────────────────────────────────────────────────────────

interface Visitor {
  id: number; farmId: number; visitorName: string; company: string | null; purpose: string;
  vehicleRegistration: string | null; arrivalTime: string; departureTime: string | null;
  areasVisited: string | null; biosecurityDeclarationSigned: boolean; healthDeclarationSigned: boolean;
  biosecuritySignature: string | null; healthSignature: string | null;
  escortedBy: string | null; notes: string | null; createdAt: string;
}

const EMPTY_VISITOR = {
  visitorName: "", company: "", purpose: "", vehicleRegistration: "",
  arrivalTime: new Date().toISOString().slice(0, 16), departureTime: "",
  areasVisited: "", biosecurityDeclarationSigned: false, healthDeclarationSigned: false,
  biosecuritySignature: null as string | null, healthSignature: null as string | null,
  escortedBy: "", notes: "",
};

function printVisitorRegister(records: Visitor[], farmName: string, yearLabel: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtDT = (v: string | null | undefined) => v ? new Date(v).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  const rows = records.map(r => `<tr>
    <td>${r.visitorName}</td><td>${r.company || "—"}</td><td>${r.purpose}</td>
    <td>${r.vehicleRegistration || "—"}</td><td style="white-space:nowrap">${fmtDT(r.arrivalTime)}</td>
    <td style="white-space:nowrap">${r.departureTime ? fmtDT(r.departureTime) : "—"}</td>
    <td>${r.areasVisited || "—"}</td>
    <td style="text-align:center;font-weight:700;color:${r.biosecurityDeclarationSigned ? "#16a34a" : "#dc2626"}">${r.biosecurityDeclarationSigned ? "✓" : "✗"}</td>
    <td style="text-align:center;font-weight:700;color:${r.healthDeclarationSigned ? "#16a34a" : "#dc2626"}">${r.healthDeclarationSigned ? "✓" : "✗"}</td>
    <td>${r.escortedBy || "—"}</td><td>${r.notes || "—"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Visitor Log — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Visitor &amp; Contractor Log · ${yearLabel} · Red Tractor Biosecurity Record</p></div>
<div class="hdr-r"><b>Visitor Log</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Visitor / Contractor</th><th>Company</th><th>Purpose</th><th>Vehicle Reg</th><th>Arrival</th><th>Departure</th><th>Areas Visited</th><th>Biosec</th><th>Health</th><th>Escorted By</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Visitor &amp; Contractor Log — Red Tractor biosecurity compliance record. Retain for minimum 3 years. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

const BIOSEC_DECLARATION_TEXT = `I confirm that:
1. I have not visited any other livestock or agricultural premises within the last 48 hours.
2. I agree to comply with all biosecurity measures required on this farm, including cleaning and disinfection of footwear, wearing PPE where required, and following all instructions given by farm staff.
3. I will not enter restricted areas without authorisation or escort.
4. I understand that failure to comply with biosecurity requirements may result in removal from the farm premises.`;

const HEALTH_DECLARATION_TEXT = `I confirm that:
1. I am in good health at the time of this visit.
2. I am not displaying symptoms of any infectious illness, including but not limited to vomiting, diarrhoea, respiratory illness, or open skin infections.
3. I have not been advised by a medical professional to avoid contact with livestock or to self-isolate.
4. I understand that any illness or health concern relevant to farm biosecurity must be declared to the farm manager before entering the farm.`;

function printBlankDeclarationForms(farmName: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  openPrint(`<!DOCTYPE html><html><head><title>Visitor Declaration Forms — ${farmName}</title><style>
body{font-family:Arial,sans-serif;font-size:11px;margin:2cm;color:#000}
h1{font-size:14px;font-weight:700;margin:0 0 2px}h2{font-size:12px;font-weight:700;margin:18px 0 8px;border-bottom:2px solid #166534;padding-bottom:4px;color:#166534}
p.sub{font-size:10px;color:#555;margin:1px 0 10px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #166534;padding-bottom:10px;margin-bottom:16px}
.hdr-r{text-align:right;font-size:10px;color:#555}.hdr-r b{display:block;font-size:13px;font-weight:700;color:#000}
.decl{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:10px 14px;font-size:10.5px;line-height:1.7;white-space:pre-wrap;margin-bottom:12px}
.field{border-bottom:1px solid #000;margin-top:6px;height:22px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.sig-area{border:1px solid #ccc;border-radius:4px;height:80px;margin-top:4px;background:#fff}
.label{font-size:9.5px;color:#555;margin-bottom:2px}
.page-break{page-break-after:always}
.footer{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:20px}
@media print{@page{margin:2cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Visitor &amp; Contractor Declaration Forms</p></div><div class="hdr-r"><b>Visitor Declarations</b>Date: ${today}</div></div>
<h2>BIOSECURITY DECLARATION</h2>
<div class="decl">${BIOSEC_DECLARATION_TEXT}</div>
<div class="grid">
  <div><p class="label">Visitor / Contractor Name</p><div class="field"></div></div>
  <div><p class="label">Company / Organisation</p><div class="field"></div></div>
  <div><p class="label">Purpose of Visit</p><div class="field"></div></div>
  <div><p class="label">Date &amp; Time of Arrival</p><div class="field"></div></div>
</div>
<div style="margin-top:16px"><p class="label">Signature</p><div class="sig-area"></div></div>
<div class="page-break"></div>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Visitor &amp; Contractor Declaration Forms</p></div><div class="hdr-r"><b>Visitor Declarations</b>Date: ${today}</div></div>
<h2>HEALTH DECLARATION</h2>
<div class="decl">${HEALTH_DECLARATION_TEXT}</div>
<div class="grid">
  <div><p class="label">Visitor / Contractor Name</p><div class="field"></div></div>
  <div><p class="label">Company / Organisation</p><div class="field"></div></div>
  <div><p class="label">Date of Visit</p><div class="field"></div></div>
  <div><p class="label">Date of Birth (optional)</p><div class="field"></div></div>
</div>
<div style="margin-top:16px"><p class="label">Signature</p><div class="sig-area"></div></div>
<div class="footer">Visitor Declaration Forms — ${farmName} · Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

function printVisitorDeclarationRecord(v: Visitor, farmName: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtDT = (val: string | null | undefined) => val ? new Date(val).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
  const sigBlock = (label: string, sig: string | null, signed: boolean) => sig
    ? `<div><p class="label">${label}</p><img src="${sig}" style="border:1px solid #e5e7eb;border-radius:6px;max-width:100%;height:120px;object-fit:contain;background:#fff;display:block;margin-top:4px" /></div>`
    : `<div><p class="label">${label}</p><div style="border:1px solid ${signed ? "#bbf7d0" : "#fca5a5"};background:${signed ? "#f0fdf4" : "#fff7f7"};border-radius:6px;padding:8px 12px;margin-top:4px;font-size:10px;color:${signed ? "#166534" : "#dc2626"};font-weight:600">${signed ? "✓ Signed on paper" : "✗ Not signed"}</div></div>`;
  openPrint(`<!DOCTYPE html><html><head><title>Visitor Declaration — ${v.visitorName}</title><style>
body{font-family:Arial,sans-serif;font-size:11px;margin:2cm;color:#000}
h1{font-size:14px;font-weight:700;margin:0 0 2px}h2{font-size:11px;font-weight:700;margin:16px 0 6px;border-bottom:1px solid #e5e7eb;padding-bottom:3px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #166534;padding-bottom:10px;margin-bottom:16px}
.hdr-r{text-align:right;font-size:10px;color:#555}.hdr-r b{display:block;font-size:13px;font-weight:700;color:#000}
table{width:100%;border-collapse:collapse;margin-bottom:12px}
td{padding:5px 10px;border:1px solid #e5e7eb;font-size:10.5px;vertical-align:top}td:first-child{font-weight:600;background:#f9fafb;width:34%}
.decl{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:8px 12px;font-size:10px;line-height:1.7;white-space:pre-wrap;margin-bottom:10px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:10px}
.label{font-size:9.5px;color:#6b7280;margin-bottom:2px;font-weight:600;text-transform:uppercase;letter-spacing:0.03em}
.footer{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:24px}
@media print{@page{margin:2cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p style="font-size:10px;color:#555;margin:1px 0">Visitor &amp; Contractor Declaration Record</p></div><div class="hdr-r"><b>Declaration Record</b>Printed: ${today}</div></div>
<h2>Visit Details</h2>
<table><tr><td>Visitor / Contractor</td><td>${v.visitorName}</td></tr><tr><td>Company</td><td>${v.company || "—"}</td></tr><tr><td>Purpose</td><td>${v.purpose}</td></tr><tr><td>Vehicle Registration</td><td>${v.vehicleRegistration || "—"}</td></tr><tr><td>Arrival</td><td>${fmtDT(v.arrivalTime)}</td></tr><tr><td>Departure</td><td>${v.departureTime ? fmtDT(v.departureTime) : "—"}</td></tr><tr><td>Areas Visited</td><td>${v.areasVisited || "—"}</td></tr><tr><td>Escorted By</td><td>${v.escortedBy || "—"}</td></tr></table>
<h2>Biosecurity Declaration</h2>
<div class="decl">${BIOSEC_DECLARATION_TEXT}</div>
<div class="grid">${sigBlock("Signature", v.biosecuritySignature, v.biosecurityDeclarationSigned)}${sigBlock("Health Declaration Signature", v.healthSignature, v.healthDeclarationSigned)}</div>
<div class="footer">Visitor Declaration Record — ${farmName} · Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

function VisitorTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Visitor | null>(null);
  const [viewVisitor, setViewVisitor] = useState<Visitor | null>(null);
  const [viewPest, setViewPest] = useState<PestRecord | null>(null);
  const [viewCleaning, setViewCleaning] = useState<CleaningRecord | null>(null);
  const [viewCoshh, setViewCoshh] = useState<any | null>(null);
  const [form, setForm] = useState<typeof EMPTY_VISITOR>(EMPTY_VISITOR);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [sigModal, setSigModal] = useState<"biosecurity" | "health" | null>(null);

  const { data, isLoading } = useQuery<{ records: Visitor[] }>({
    queryKey: ["visitors", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/visitors`).then(r => r.json()),
  });
  const records: Visitor[] = data?.records ?? [];
  const companySuggestions = [...new Set(records.map(r => r.company).filter(Boolean) as string[])];
  const escortedBySuggestions = [...new Set(records.map(r => r.escortedBy).filter(Boolean) as string[])];
  const filtered = records.filter(r =>
    isInCropYear(r.arrivalTime, cropYear) && (
      !search
      || r.visitorName.toLowerCase().includes(search.toLowerCase())
      || r.company?.toLowerCase().includes(search.toLowerCase())
      || r.purpose.toLowerCase().includes(search.toLowerCase())
    )
  );

  const createM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/visitors`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["visitors", farmId] }); qc.invalidateQueries({ queryKey: ["notifications", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_VISITOR); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/visitors/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["visitors", farmId] }); qc.invalidateQueries({ queryKey: ["notifications", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_VISITOR); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/visitors/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["visitors", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openEdit(v: Visitor) {
    setEditing(v);
    setForm({
      visitorName: v.visitorName, company: v.company ?? "", purpose: v.purpose,
      vehicleRegistration: v.vehicleRegistration ?? "", arrivalTime: v.arrivalTime?.slice(0, 16) ?? "",
      departureTime: v.departureTime?.slice(0, 16) ?? "", areasVisited: v.areasVisited ?? "",
      biosecurityDeclarationSigned: v.biosecurityDeclarationSigned, healthDeclarationSigned: v.healthDeclarationSigned,
      biosecuritySignature: v.biosecuritySignature ?? null, healthSignature: v.healthSignature ?? null,
      escortedBy: v.escortedBy ?? "", notes: v.notes ?? "",
    });
    setFormOpen(true);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      ...form,
      arrivalTime: form.arrivalTime ? new Date(form.arrivalTime).toISOString() : null,
      departureTime: form.departureTime ? new Date(form.departureTime).toISOString() : null,
    };
    if (editing) { updateM.mutate({ id: editing.id, body }); } else { createM.mutate(body); }
  }
  const isSubmitting = createM.isPending || updateM.isPending;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search visitors, company, purpose..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <CropYearSelector value={cropYear} onChange={setCropYear} showAllYears />
        <Button variant="outline" onClick={() => printVisitorRegister(filtered, farmName, cropYearLabel(cropYear))} className="gap-2 shrink-0" disabled={filtered.length === 0}>
          <Printer className="w-4 h-4" /> Print Register
        </Button>
        <Button variant="outline" onClick={() => printBlankDeclarationForms(farmName)} className="gap-2 shrink-0">
          <FileText className="w-4 h-4" /> Blank Declaration Forms
        </Button>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_VISITOR); setFormOpen(true); }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Log Visitor
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground/80 mb-1">No visitor records</h3>
            <p className="text-foreground/50 text-sm">{search ? "No visitors match your search." : "Log visitors and contractors to maintain biosecurity compliance."}</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Visitor / Contractor", "Company", "Purpose", "Arrival", "Departure", "Biosec", "Health", ""].map(h => (
                    <th key={h} className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b border-border/50 hover:bg-black/[0.02] transition-colors">
                    <td className="p-4 text-sm font-medium">{v.visitorName}</td>
                    <td className="p-4 text-sm text-foreground/70">{v.company || "—"}</td>
                    <td className="p-4 text-sm text-foreground/70 max-w-[160px] truncate">{v.purpose}</td>
                    <td className="p-4 text-sm text-foreground/70 whitespace-nowrap">{formatDateTime(v.arrivalTime)}</td>
                    <td className="p-4 text-sm text-foreground/70 whitespace-nowrap">{v.departureTime ? formatDateTime(v.departureTime) : <span className="text-amber-600 text-xs font-medium">On site</span>}</td>
                    <td className="p-4">
                      {v.biosecurityDeclarationSigned
                        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                        : <XCircle className="w-4 h-4 text-red-400" />}
                    </td>
                    <td className="p-4">
                      {v.healthDeclarationSigned
                        ? <CheckCircle2 className="w-4 h-4 text-green-600" />
                        : <XCircle className="w-4 h-4 text-red-400" />}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewVisitor(v)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-green-600"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(v)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(v.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/40 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {viewVisitor && (
        <Dialog open onOpenChange={() => setViewVisitor(null)}>
          <DialogContent style={{ maxWidth: 520 }}>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Visitor Record</DialogTitle></DialogHeader>
            <div className="space-y-3 text-sm py-1">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Visitor / Contractor</p><p className="font-medium">{viewVisitor.visitorName}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Company</p><p>{viewVisitor.company || "—"}</p></div>
                <div style={{ gridColumn: "1 / -1" }}><p className="text-xs text-gray-500 uppercase font-medium mb-1">Purpose of Visit</p><p>{viewVisitor.purpose}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Arrival</p><p>{viewVisitor.arrivalTime ? new Date(viewVisitor.arrivalTime).toLocaleString("en-GB") : "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Departure</p><p>{viewVisitor.departureTime ? new Date(viewVisitor.departureTime).toLocaleString("en-GB") : <span className="text-amber-600 text-xs font-medium">Still on site</span>}</p></div>
                {viewVisitor.vehicleRegistration && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Vehicle Reg</p><p className="font-mono">{viewVisitor.vehicleRegistration}</p></div>}
                {viewVisitor.escortedBy && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Escorted By</p><p>{viewVisitor.escortedBy}</p></div>}
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Biosec Declaration</p><p>{viewVisitor.biosecurityDeclarationSigned ? "✓ Signed" : "Not signed"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Health Declaration</p><p>{viewVisitor.healthDeclarationSigned ? "✓ Signed" : "Not signed"}</p></div>
              </div>
              {viewVisitor.areasVisited && <div style={{ gridColumn: "1 / -1" }}><p className="text-xs text-gray-500 uppercase font-medium mb-1">Areas Visited</p><p className="text-gray-700">{viewVisitor.areasVisited}</p></div>}
              {viewVisitor.notes && <div style={{ gridColumn: "1 / -1" }}><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewVisitor.notes}</p></div>}
            </div>
            {(viewVisitor.biosecuritySignature || viewVisitor.healthSignature) && (
              <div className="border-t border-border pt-3">
                <p className="text-xs text-gray-500 uppercase font-medium mb-2">Electronic Signatures</p>
                <div className="grid grid-cols-2 gap-3">
                  {viewVisitor.biosecuritySignature && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Biosecurity Declaration</p>
                      <img src={viewVisitor.biosecuritySignature} alt="Biosecurity signature" style={{ height: 80, maxWidth: "100%", objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", display: "block" }} />
                      <p className="text-xs text-green-700 font-medium mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Signed</p>
                    </div>
                  )}
                  {viewVisitor.healthSignature && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Health Declaration</p>
                      <img src={viewVisitor.healthSignature} alt="Health signature" style={{ height: 80, maxWidth: "100%", objectFit: "contain", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", display: "block" }} />
                      <p className="text-xs text-green-700 font-medium mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Signed</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attachments — scanned declarations, ID copies, contractor certificates */}
            <div className="border border-border rounded-xl p-4 mt-2">
              <RecordAttachments
                farmId={farmId}
                recordType="visitor-log"
                recordId={viewVisitor.id}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" className="gap-1.5" onClick={() => printVisitorDeclarationRecord(viewVisitor, farmName)}><Printer className="w-3.5 h-3.5" />Print Record</Button>
              <Button variant="outline" onClick={() => { openEdit(viewVisitor); setViewVisitor(null); }}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</Button>
              <Button variant="ghost" onClick={() => setViewVisitor(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); setEditing(null); setForm(EMPTY_VISITOR); } }}>
        <DialogContent style={{ maxWidth: "56rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              {editing ? "Edit Visitor Record" : "Log Visitor / Contractor"}
            </DialogTitle>
            <DialogDescription>Record all persons visiting the farm for Red Tractor biosecurity compliance.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Name <span className="text-red-500">*</span></label>
                <Input placeholder="Full name" value={form.visitorName} onChange={e => setForm(f => ({ ...f, visitorName: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Company / Organisation</label>
                <TypeaheadInput value={form.company} onChange={v => setForm(f => ({ ...f, company: v }))} suggestions={companySuggestions} placeholder="e.g. ADAS, NFU, Vet practice" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Purpose of Visit <span className="text-red-500">*</span></label>
                <Input placeholder="e.g. Vet visit, Red Tractor audit, Agronomist inspection" value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Vehicle Registration</label>
                <Input placeholder="e.g. AB12 CDE" value={form.vehicleRegistration} onChange={e => setForm(f => ({ ...f, vehicleRegistration: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Escorted By</label>
                <TypeaheadInput value={form.escortedBy} onChange={v => setForm(f => ({ ...f, escortedBy: v }))} suggestions={escortedBySuggestions} placeholder="Staff member name" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Arrival Date &amp; Time <span className="text-red-500">*</span></label>
                <Input type="datetime-local" value={form.arrivalTime} onChange={e => setForm(f => ({ ...f, arrivalTime: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Departure Date &amp; Time</label>
                <Input type="datetime-local" value={form.departureTime} onChange={e => setForm(f => ({ ...f, departureTime: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Areas Visited</label>
                <FarmLocationSelect farmId={farmId} value={form.areasVisited} onChange={v => setForm(f => ({ ...f, areasVisited: v }))} placeholder="Select farm areas visited..." />
              </div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground/40 mb-3">Declarations</p>
              <div className="grid grid-cols-2 gap-4">
                <div style={{ border: `2px solid ${form.biosecuritySignature ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: 12, padding: "12px 14px", background: form.biosecuritySignature ? "#f0fdf4" : "#fafafa" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">Biosecurity Declaration</span>
                    {form.biosecuritySignature && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, biosecuritySignature: null, biosecurityDeclarationSigned: false }))} className="text-xs text-red-500 hover:text-red-700">Clear</button>
                    )}
                  </div>
                  {form.biosecuritySignature ? (
                    <div>
                      <img src={form.biosecuritySignature} alt="Biosecurity signature" style={{ height: 72, maxWidth: "100%", objectFit: "contain", border: "1px solid #d1fae5", borderRadius: 6, background: "#fff", display: "block" }} />
                      <p className="text-xs text-green-700 font-medium mt-1.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Signed electronically</p>
                    </div>
                  ) : (
                    <div>
                      <Button type="button" variant="outline" className="w-full gap-2 text-sm h-10" onClick={() => setSigModal("biosecurity")}>
                        <Pen className="w-3.5 h-3.5" /> Sign electronically
                      </Button>
                      <label className="flex items-center gap-2 text-xs text-foreground/60 cursor-pointer mt-2">
                        <input type="checkbox" checked={form.biosecurityDeclarationSigned} onChange={e => setForm(f => ({ ...f, biosecurityDeclarationSigned: e.target.checked }))} className="rounded w-3.5 h-3.5 accent-green-600" />
                        Signed on paper
                      </label>
                    </div>
                  )}
                </div>
                <div style={{ border: `2px solid ${form.healthSignature ? "#bbf7d0" : "#e5e7eb"}`, borderRadius: 12, padding: "12px 14px", background: form.healthSignature ? "#f0fdf4" : "#fafafa" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground/50">Health Declaration</span>
                    {form.healthSignature && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, healthSignature: null, healthDeclarationSigned: false }))} className="text-xs text-red-500 hover:text-red-700">Clear</button>
                    )}
                  </div>
                  {form.healthSignature ? (
                    <div>
                      <img src={form.healthSignature} alt="Health signature" style={{ height: 72, maxWidth: "100%", objectFit: "contain", border: "1px solid #d1fae5", borderRadius: 6, background: "#fff", display: "block" }} />
                      <p className="text-xs text-green-700 font-medium mt-1.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Signed electronically</p>
                    </div>
                  ) : (
                    <div>
                      <Button type="button" variant="outline" className="w-full gap-2 text-sm h-10" onClick={() => setSigModal("health")}>
                        <Pen className="w-3.5 h-3.5" /> Sign electronically
                      </Button>
                      <label className="flex items-center gap-2 text-xs text-foreground/60 cursor-pointer mt-2">
                        <input type="checkbox" checked={form.healthDeclarationSigned} onChange={e => setForm(f => ({ ...f, healthDeclarationSigned: e.target.checked }))} className="rounded w-3.5 h-3.5 accent-green-600" />
                        Signed on paper
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <SignatureModal
              open={sigModal === "biosecurity"}
              label="Biosecurity Declaration"
              declarationText={BIOSEC_DECLARATION_TEXT}
              visitorName={form.visitorName || undefined}
              farmName={farmName}
              onConfirm={(sig) => { setForm(f => ({ ...f, biosecuritySignature: sig, biosecurityDeclarationSigned: true })); setSigModal(null); }}
              onCancel={() => setSigModal(null)}
            />
            <SignatureModal
              open={sigModal === "health"}
              label="Health Declaration"
              declarationText={HEALTH_DECLARATION_TEXT}
              visitorName={form.visitorName || undefined}
              farmName={farmName}
              onConfirm={(sig) => { setForm(f => ({ ...f, healthSignature: sig, healthDeclarationSigned: true })); setSigModal(null); }}
              onCancel={() => setSigModal(null)}
            />
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
              <Input placeholder="Additional notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

            {/* Attachments — only for existing records */}
            {editing && (
              <div className="border border-border rounded-xl p-4">
                <RecordAttachments
                  farmId={farmId}
                  recordType="visitor-log"
                  recordId={editing.id}
                />
              </div>
            )}
            {!editing && (
              <p className="text-xs text-foreground/40 flex items-center gap-1.5">
                <span>📎</span> Save the record first, then re-open it to attach scanned declarations or ID copies.
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditing(null); setForm(EMPTY_VISITOR); }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editing ? "Update Record" : "Log Visitor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Visitor Record</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteM.mutate(deleteId)} disabled={deleteM.isPending}>
              {deleteM.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Pest Control ─────────────────────────────────────────────────────────────

interface PestPhoto { id: number; objectPath: string; fileName: string | null; }

interface PestRecord {
  id: number; farmId: number; pestType: string; location: string | null; treatmentMethod: string | null;
  productUsed: string | null; treatmentDate: string; treatedBy: string | null;
  followUpDate: string | null; outcome: string | null; notes: string | null; createdAt: string;
  photos: PestPhoto[];
}

function PestPhotoPanel({ recordId, farmId, photos }: { recordId: number; farmId: number; photos: PestPhoto[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();

  const deleteMut = useMutation({
    mutationFn: (photoId: number) => fetch(`/api/farms/${farmId}/pest-control/${recordId}/photos/${photoId}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pest-control", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      await fetch(`/api/farms/${farmId}/pest-control/${recordId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath: response.objectPath, fileName: response.objectPath.split("/").pop() }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      qc.invalidateQueries({ queryKey: ["pest-control", farmId] });
      toast({ title: "Photo uploaded" });
    },
  });

  return (
    <td colSpan={8} style={{ padding: 0, background: "#f9fafb", borderBottom: "1px solid #f3f4f6" }}>
      <div style={{ padding: "10px 16px 12px" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 8 }}>Evidence Photos</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: photos.length ? 8 : 0 }}>
          {photos.map(p => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "4px 10px 4px 8px" }}>
              <File size={12} style={{ color: "#2563eb" }} />
              <a href={`/api/storage${p.objectPath}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8125rem", color: "#2563eb", textDecoration: "none" }}>
                {p.fileName ?? "photo"}
              </a>
              <button onClick={() => deleteMut.mutate(p.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: 0 }}>
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#374151", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 12px", cursor: "pointer" }}>
          {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
          {isUploading ? `Uploading… ${progress}%` : "Add Photo"}
          <input type="file" accept="image/*,application/pdf" style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }} />
        </label>
      </div>
    </td>
  );
}

const EMPTY_PEST = { pestType: "", location: "", treatmentMethod: "", productUsed: "", treatmentDate: new Date().toISOString().slice(0, 10), treatedBy: "", followUpDate: "", outcome: "", notes: "" };
const PEST_TYPES = ["Rats / Mice", "Rabbits", "Foxes", "Pigeons / Corvids", "Moles", "Slugs / Snails", "Insects", "Other"];

function printPestControlRegister(records: PestRecord[], farmName: string, yearLabel: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (v: string | null | undefined) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const rows = records.map(r => `<tr>
    <td>${r.pestType}</td><td>${r.location || "—"}</td><td>${r.treatmentMethod || "—"}</td>
    <td>${r.productUsed || "—"}</td><td style="white-space:nowrap">${fmtD(r.treatmentDate)}</td>
    <td>${r.treatedBy || "—"}</td><td style="white-space:nowrap">${fmtD(r.followUpDate)}</td>
    <td>${r.outcome || "—"}</td><td>${r.notes || "—"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Pest Control Register — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Pest Control Register · ${yearLabel} · Red Tractor Biosecurity Compliance</p></div>
<div class="hdr-r"><b>Pest Control Register</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Pest Type</th><th>Location</th><th>Method</th><th>Product Used</th><th>Treatment Date</th><th>Treated By</th><th>Follow-up Date</th><th>Outcome</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Pest Control Register — Red Tractor compliance record. Retain for minimum 3 years. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

function PestControlTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PestRecord | null>(null);
  const [viewPest, setViewPest] = useState<PestRecord | null>(null);
  const [form, setForm] = useState<typeof EMPTY_PEST>(EMPTY_PEST);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<PestRecord | null>(null);

  const { data, isLoading } = useQuery<{ records: PestRecord[] }>({
    queryKey: ["pest-control", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/pest-control`).then(r => r.json()),
  });
  const records: PestRecord[] = data?.records ?? [];
  const filtered = records.filter(r =>
    isInCropYear(r.treatmentDate, cropYear)
    && (!search
      || r.pestType.toLowerCase().includes(search.toLowerCase())
      || r.location?.toLowerCase().includes(search.toLowerCase())
      || r.productUsed?.toLowerCase().includes(search.toLowerCase()))
  );

  const createM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/pest-control`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pest-control", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_PEST); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/pest-control/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pest-control", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_PEST); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/pest-control/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pest-control", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openEdit(p: PestRecord) {
    setEditing(p);
    setForm({ pestType: p.pestType, location: p.location ?? "", treatmentMethod: p.treatmentMethod ?? "", productUsed: p.productUsed ?? "", treatmentDate: p.treatmentDate?.slice(0, 10) ?? "", treatedBy: p.treatedBy ?? "", followUpDate: p.followUpDate?.slice(0, 10) ?? "", outcome: p.outcome ?? "", notes: p.notes ?? "" });
    setFormOpen(true);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, treatmentDate: form.treatmentDate ? new Date(form.treatmentDate).toISOString() : null, followUpDate: form.followUpDate ? new Date(form.followUpDate).toISOString() : null };
    if (editing) { updateM.mutate({ id: editing.id, body }); } else { createM.mutate(body); }
  }
  const isSubmitting = createM.isPending || updateM.isPending;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search pest type, location, product..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <CropYearSelector value={cropYear} onChange={setCropYear} showAllYears />
        <Button variant="outline" onClick={() => printPestControlRegister(filtered, farmName, cropYearLabel(cropYear))} className="gap-2 shrink-0" disabled={filtered.length === 0}>
          <Printer className="w-4 h-4" /> Print Register
        </Button>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_PEST); setFormOpen(true); }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Record
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <Bug className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground/80 mb-1">No pest control records</h3>
            <p className="text-foreground/50 text-sm">{search ? "No records match your search." : "Record pest treatments to demonstrate active management for Red Tractor."}</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Pest Type", "Location", "Product / Method", "Treatment Date", "Treated By", "Follow-up", "Outcome", ""].map(h => (
                    <th key={h} className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const expanded = expandedId === p.id;
                  return (
                    <React.Fragment key={p.id}>
                      <tr className="border-b border-border/50 hover:bg-black/[0.02] transition-colors">
                        <td className="p-4 text-sm font-medium">{p.pestType}</td>
                        <td className="p-4 text-sm text-foreground/70">{p.location || "—"}</td>
                        <td className="p-4 text-sm text-foreground/70">{p.productUsed || p.treatmentMethod || "—"}</td>
                        <td className="p-4 text-sm text-foreground/70 whitespace-nowrap">{formatDate(p.treatmentDate)}</td>
                        <td className="p-4 text-sm text-foreground/70">{p.treatedBy || "—"}</td>
                        <td className="p-4 text-sm">
                          <div className="flex flex-col gap-1">
                            {p.followUpDate && <span className="text-foreground/70">{formatDate(p.followUpDate)}</span>}
                            {dueBadge(p.followUpDate)}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-foreground/70 max-w-[120px] truncate">{p.outcome || "—"}</td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setViewPest(p)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-green-600" title="View"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => setExpandedId(expanded ? null : p.id)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-primary" title="Photos">
                              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              {(p.photos?.length ?? 0) > 0 && <span style={{ fontSize: "0.65rem", background: "#2563eb", color: "#fff", borderRadius: 8, padding: "1px 5px", marginLeft: 2 }}>{p.photos.length}</span>}
                            </button>
                            <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/40 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            {p.followUpDate && <button onClick={() => setRaiseTaskFor(p)} className="p-1.5 rounded-md hover:bg-purple-50 text-foreground/40 hover:text-purple-600" title="Raise Task"><ClipboardList className="w-4 h-4" /></button>}
                          </div>
                        </td>
                      </tr>
                      {expanded && (
                        <tr>
                          <PestPhotoPanel recordId={p.id} farmId={farmId} photos={p.photos ?? []} />
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {viewPest && (
        <Dialog open onOpenChange={() => setViewPest(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><Bug className="w-5 h-5 text-primary" />View Pest Control Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm py-4">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pest Type</p><p className="font-medium">{String(viewPest.pestType ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p><p className="font-medium">{String(viewPest.location ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Date</p><p className="font-medium">{formatDate(viewPest.treatmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treated By</p><p className="font-medium">{String(viewPest.treatedBy ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Method</p><p className="font-medium">{String(viewPest.treatmentMethod ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Used</p><p className="font-medium">{String(viewPest.productUsed ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Follow-up Date</p><p className="font-medium">{formatDate(viewPest.followUpDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome</p><p className="font-medium">{String(viewPest.outcome ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewPest.notes ?? "—")}</p></div>
            </div>

            {/* Attachments — treatment reports, BPCA certificates, product data sheets */}
            <div className="border border-border rounded-xl p-4">
              <RecordAttachments
                farmId={farmId}
                recordType="pest-control"
                recordId={viewPest.id}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewPest); setViewPest(null); }}>Edit</Button>
              <Button onClick={() => setViewPest(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); setEditing(null); setForm(EMPTY_PEST); } }}>
        <DialogContent style={{ maxWidth: "52rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-primary" />
              {editing ? "Edit Pest Control Record" : "Add Pest Control Record"}
            </DialogTitle>
            <DialogDescription>Record pest control activities to demonstrate proactive management.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Pest Type <span className="text-red-500">*</span></label>
                <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50" value={PEST_TYPES.filter(p => p !== "Other").includes(form.pestType) ? form.pestType : (form.pestType ? "Other" : "")} onChange={e => setForm(f => ({ ...f, pestType: e.target.value }))} required>
                  <option value="">Select...</option>
                  {PEST_TYPES.map(p => <option key={p} value={p}>{p === "Other" ? "Other (please specify)" : p}</option>)}
                </select>
                {(form.pestType === "Other" || (form.pestType && !PEST_TYPES.filter(p => p !== "Other").includes(form.pestType))) && (
                  <Input className="mt-1.5" value={form.pestType === "Other" ? "" : form.pestType} onChange={e => setForm(f => ({ ...f, pestType: e.target.value || "Other" }))} placeholder="Please specify pest type…" autoFocus={form.pestType === "Other"} />
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Location</label>
                <FarmLocationSelect farmId={farmId} value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} placeholder="Select or type location…" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Treatment Date <span className="text-red-500">*</span></label>
                <Input type="date" value={form.treatmentDate} onChange={e => setForm(f => ({ ...f, treatmentDate: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Treated By</label>
                <Input placeholder="Name or contractor" value={form.treatedBy} onChange={e => setForm(f => ({ ...f, treatedBy: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Treatment Method</label>
                <Input placeholder="e.g. Traps, Bait stations, Shooting" value={form.treatmentMethod} onChange={e => setForm(f => ({ ...f, treatmentMethod: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Product Used</label>
                <Input placeholder="e.g. Brodifacoum, Pindone" value={form.productUsed} onChange={e => setForm(f => ({ ...f, productUsed: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Follow-up Date</label>
                <Input type="date" value={form.followUpDate} onChange={e => setForm(f => ({ ...f, followUpDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Outcome</label>
                <Input placeholder="e.g. Effective, Ongoing, Refer to contractor" value={form.outcome} onChange={e => setForm(f => ({ ...f, outcome: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
              <Input placeholder="Additional notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditing(null); setForm(EMPTY_PEST); }}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editing ? "Update Record" : "Save Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Pest Control Record</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteM.mutate(deleteId)} disabled={deleteM.isPending}>
              {deleteM.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Pest Control Follow-up — ${raiseTaskFor.pestType}`}
          defaultDescription={`Follow-up due ${raiseTaskFor.followUpDate ? new Date(raiseTaskFor.followUpDate).toLocaleDateString("en-GB") : ""}${raiseTaskFor.location ? ` at ${raiseTaskFor.location}` : ""}${raiseTaskFor.outcome ? ` · Outcome: ${raiseTaskFor.outcome}` : ""}`}
          module="biosecurity"
        />
      )}
    </>
  );
}

// ─── Cleaning & Disinfection ──────────────────────────────────────────────────

interface StockConsumptionItem {
  id?: number; stockItemId: number; stockItemName: string | null; stockItemUnit: string | null;
  productName: string | null; quantityUsed: string;
}

interface CleaningRecord {
  id: number; farmId: number; area: string; cleaningType: string; productsUsed: string | null;
  dilutionRate: string | null; contactTime: string | null; cleanedBy: string | null;
  cleanedDate: string; nextDueDate: string | null; verifiedBy: string | null; notes: string | null; createdAt: string;
  performedByContractor: boolean; contractorName: string | null; contractorOwnSupplies: boolean;
  costPence: number | null; invoiceRef: string | null; ramsId: number | null;
  consumptions: StockConsumptionItem[];
}

interface CleaningSchedule {
  id: number; farmId: number; area: string; cleaningType: string;
  intervalDays: number; notes: string | null; isActive: boolean; createdAt: string;
}

interface StockItem { id: number; name: string; unit: string | null; category: string | null; }
interface RiskAssessment { id: number; title: string; area: string | null; }

const EMPTY_CLEANING = {
  area: "", cleaningType: "", productsUsed: "", dilutionRate: "", contactTime: "",
  cleanedBy: "", cleanedDate: new Date().toISOString().slice(0, 10), nextDueDate: "",
  verifiedBy: "", notes: "",
  performedByContractor: false, contractorName: "", contractorSupplierId: null as number | null, contractorOwnSupplies: false,
  costPence: "" as string | number,
  invoiceRef: "", ramsId: "" as string | number,
};
const CLEANING_TYPES = ["Routine clean", "Deep clean", "Disinfection", "Fogging / fumigation", "Pre-housing clean", "Post-TB restriction clean", "Emergency clean", "Other"];
const EMPTY_SCHEDULE = { area: "", cleaningType: "", intervalDays: "" as string | number, notes: "", isActive: true };

// ─── C&D History Dialog ────────────────────────────────────────────────────────
const BIO_CLEAN_TYPE_LABELS: Record<string, string> = {
  full_clean_and_treat: "Full Clean + Treatment", physical_clean: "Physical Clean",
  insecticide_treatment: "Insecticide Treatment", fumigation: "Fumigation",
  inspection_only: "Inspection Only",
};
const BIO_CLEAN_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  full_clean_and_treat: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  physical_clean:       { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
  insecticide_treatment:{ bg: "#eff6ff", text: "#2563eb", border: "#bfdbfe" },
  fumigation:           { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  inspection_only:      { bg: "#f9fafb", text: "#6b7280", border: "#e5e7eb" },
};
function BioCleanHistoryDialog({ records, onClose }: { records: any[]; onClose: () => void }) {
  const [yearFilter, setYearFilter] = React.useState<number | "all">("all");
  const currentYear = new Date().getFullYear();
  const recentYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  const sorted = [...records].sort((a, b) => new Date(b.cleanedDate).getTime() - new Date(a.cleanedDate).getTime());
  const filtered = yearFilter === "all" ? sorted : sorted.filter(r => r.cleanedDate && new Date(r.cleanedDate).getFullYear() === yearFilter);

  function handlePrint() {
    const rows = filtered.map(r => `<tr><td>${r.cleanedDate ? new Date(r.cleanedDate).toLocaleDateString("en-GB") : "—"}</td><td>${r.area}</td><td>${BIO_CLEAN_TYPE_LABELS[r.cleaningType] ?? r.cleaningType}</td><td>${r.productsUsed || "—"}</td><td>${r.dilutionRate || "—"}</td><td>${r.cleanedBy || "—"}</td><td>${r.notes || ""}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (w) { w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>C&D History</title><style>body{font-family:Arial,sans-serif;font-size:11pt;margin:20mm}table{width:100%;border-collapse:collapse;margin-top:12px}th{background:#166534;color:#fff;padding:6px 8px;text-align:left;font-size:9pt}td{padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:9.5pt;vertical-align:top}tr:nth-child(even) td{background:#f9fafb}.footer{margin-top:18px;font-size:8pt;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:8px}@media print{body{margin:10mm}}</style></head><body><h1>Cleaning & Disinfection History</h1><p style="font-size:9pt;color:#555">Printed: ${new Date().toLocaleDateString("en-GB")}${yearFilter !== "all" ? ` · Year: ${yearFilter}` : ""}</p><table><thead><tr><th>Date</th><th>Area / Location</th><th>Type</th><th>Product</th><th>Dilution</th><th>Carried Out By</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table><p class="footer">Red Tractor &amp; APHA: retain C&D records for a minimum of 3 years.</p></body></html>`); w.document.close(); w.focus(); w.print(); }
  }

  return (
    <Dialog open onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><History className="w-4 h-4 text-green-700" />Cleaning &amp; Disinfection History</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 flex-wrap border-b pb-3">
          {(["all", ...recentYears] as (number | "all")[]).map(y => (
            <button key={y} onClick={() => setYearFilter(y)} style={{ padding: "3px 12px", borderRadius: 99, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: yearFilter === y ? "1.5px solid #15803d" : "1.5px solid #e5e7eb", background: yearFilter === y ? "#f0fdf4" : "#fff", color: yearFilter === y ? "#15803d" : "#6b7280" }}>
              {y === "all" ? "All years" : y}
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-muted-foreground gap-2">
              <ShieldCheck className="w-9 h-9 text-gray-300" />
              <p className="text-sm">No records for {yearFilter === "all" ? "any year" : yearFilter}</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((r: any) => {
                const date = r.cleanedDate ? new Date(r.cleanedDate) : null;
                const col = BIO_CLEAN_TYPE_COLORS[r.cleaningType] ?? BIO_CLEAN_TYPE_COLORS.inspection_only;
                return (
                  <div key={r.id} className="py-3 px-1">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-24 text-right">
                        {date ? (<><p className="text-sm font-semibold text-gray-800 leading-tight">{date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</p><p className="text-xs text-muted-foreground">{date.getFullYear()}</p></>) : <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-800">{r.area}</span>
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: col.bg, color: col.text, border: `1px solid ${col.border}` }}>{BIO_CLEAN_TYPE_LABELS[r.cleaningType] ?? r.cleaningType}</span>
                          {r.cleanedBy && <span className="text-xs text-muted-foreground">by {r.cleanedBy}</span>}
                        </div>
                        {r.productsUsed && <div className="flex items-center gap-1.5 text-sm text-gray-700"><FlaskConical className="w-3 h-3 text-blue-400 shrink-0" /><span className="font-medium">{r.productsUsed}</span>{r.dilutionRate && <span className="text-xs text-muted-foreground">— {r.dilutionRate}</span>}</div>}
                        {r.notes && <p className="text-xs text-muted-foreground italic">{r.notes}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter className="border-t pt-3 flex-row items-center gap-2 sm:justify-between">
          <p className="text-[11px] text-muted-foreground flex-1">Retain C&amp;D records for at least <strong>3 years</strong> (APHA / Red Tractor requirement).</p>
          <div className="flex gap-2">
            {filtered.length > 0 && <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5"><Printer className="w-3.5 h-3.5" />Print / Export</Button>}
            <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function printCleaningRegister(records: CleaningRecord[], farmName: string, yearLabel: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (v: string | null | undefined) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const rows = records.map(r => {
    const consumptionStr = r.consumptions?.length
      ? r.consumptions.map(c => `${c.productName || c.stockItemName || "Stock"}: ${c.quantityUsed}${c.stockItemUnit ? " " + c.stockItemUnit : ""}`).join("; ")
      : "—";
    return `<tr>
    <td>${r.area}</td><td>${r.cleaningType}</td><td>${r.productsUsed || "—"}</td>
    <td>${r.dilutionRate || "—"}</td><td>${r.contactTime || "—"}</td>
    <td style="white-space:nowrap">${fmtD(r.cleanedDate)}</td>
    <td>${r.performedByContractor ? `Contractor: ${r.contractorName || "—"}` : (r.cleanedBy || "—")}</td>
    <td style="white-space:nowrap">${fmtD(r.nextDueDate)}</td><td>${r.verifiedBy || "—"}</td>
    <td>${consumptionStr}</td>
    <td>${r.costPence ? `£${(r.costPence / 100).toFixed(2)}` : "—"}</td>
    <td>${r.notes || "—"}</td>
  </tr>`;
  }).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Cleaning &amp; Disinfection Register — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Cleaning &amp; Disinfection Register · ${yearLabel} · Red Tractor Biosecurity Compliance</p></div>
<div class="hdr-r"><b>Cleaning &amp; Disinfection Register</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Area / Location</th><th>Cleaning Type</th><th>Products Used</th><th>Dilution Rate</th><th>Contact Time</th><th>Cleaned Date</th><th>Cleaned By</th><th>Next Due</th><th>Verified By</th><th>Qty Used</th><th>Cost</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Cleaning &amp; Disinfection Register — Red Tractor compliance record. Retain for minimum 3 years. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

function CleaningTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CleaningRecord | null>(null);
  const [viewCleaning, setViewCleaning] = useState<CleaningRecord | null>(null);
  const [form, setForm] = useState<typeof EMPTY_CLEANING>(EMPTY_CLEANING);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [stockConsumptions, setStockConsumptions] = useState<Record<string, { stockItemId: string; quantity: string }>>({});
  const [customProduct, setCustomProduct] = useState("");
  const [autoNextDue, setAutoNextDue] = useState<string>("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<typeof EMPTY_SCHEDULE>(EMPTY_SCHEDULE);
  const [editingSchedule, setEditingSchedule] = useState<CleaningSchedule | null>(null);
  const [deleteScheduleId, setDeleteScheduleId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ records: CleaningRecord[] }>({
    queryKey: ["cleaning", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/cleaning`).then(r => r.json()),
  });
  const { data: coshhData } = useQuery<{ records: Array<{ id: number; substanceName: string }> }>({
    queryKey: ["coshh", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/coshh`).then(r => r.json()),
  });
  const { data: stockData } = useQuery<{ records: StockItem[] }>({
    queryKey: ["stock-items", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/stock-items`).then(r => r.json()),
  });
  const { data: ramsData } = useQuery<{ records: RiskAssessment[] }>({
    queryKey: ["risk-assessments", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/risk-assessments`).then(r => r.json()),
  });
  const { data: schedulesData, isLoading: schedulesLoading } = useQuery<{ schedules: CleaningSchedule[] }>({
    queryKey: ["cleaning-schedules", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/cleaning-schedules`).then(r => r.json()),
  });

  const records: CleaningRecord[] = data?.records ?? [];
  const coshhSubstances: string[] = (coshhData?.records ?? []).map(r => r.substanceName).filter(Boolean);
  const stockItems: StockItem[] = stockData?.records ?? [];
  const CLEANING_STOCK_CATEGORIES = ["disinfectant", "disinfectants", "cleaning", "sanitiser", "sanitizer", "biosecurity"];
  const cleaningStockItems = stockItems.filter(s => s.category && CLEANING_STOCK_CATEGORIES.includes(s.category.toLowerCase()));
  const stockForDropdown = cleaningStockItems.length > 0 ? cleaningStockItems : stockItems;
  const ramsRecords: RiskAssessment[] = ramsData?.records ?? [];
  const schedules: CleaningSchedule[] = schedulesData?.schedules ?? [];

  const { data: cleanMembersData, isLoading: cleanMembersLoading } = useFarmMembers(farmId);
  const cleanStaffNames = (cleanMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);
  const knownStaff: string[] = [...new Set([
    ...records.map(r => r.cleanedBy).filter(Boolean) as string[],
    ...records.map(r => r.verifiedBy).filter(Boolean) as string[],
  ])];
  const filtered = records.filter(r =>
    isInCropYear(r.cleanedDate, cropYear)
    && (!search
      || r.area.toLowerCase().includes(search.toLowerCase())
      || r.cleaningType.toLowerCase().includes(search.toLowerCase())
      || r.productsUsed?.toLowerCase().includes(search.toLowerCase())
      || r.contractorName?.toLowerCase().includes(search.toLowerCase()))
  );

  // Auto-compute Next Due Date from schedule rules when area, cleaningType or cleanedDate changes
  useEffect(() => {
    if (!form.area || !form.cleaningType || !form.cleanedDate) { setAutoNextDue(""); return; }
    const rule = schedules.find(s =>
      s.isActive &&
      s.area.toLowerCase() === form.area.toLowerCase() &&
      s.cleaningType.toLowerCase() === form.cleaningType.toLowerCase()
    );
    if (rule) {
      const d = new Date(form.cleanedDate);
      d.setDate(d.getDate() + rule.intervalDays);
      const computed = d.toISOString().slice(0, 10);
      setAutoNextDue(computed);
      // Only auto-fill if user hasn't manually set a date
      setForm(f => ({ ...f, nextDueDate: f.nextDueDate === autoNextDue || f.nextDueDate === "" ? computed : f.nextDueDate }));
    } else {
      setAutoNextDue("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.area, form.cleaningType, form.cleanedDate, schedules]);

  function resetCleaningDialog() {
    setFormOpen(false); setEditing(null); setForm(EMPTY_CLEANING);
    setSelectedProducts([]); setStockConsumptions({}); setCustomProduct(""); setAutoNextDue("");
  }

  const createM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/cleaning`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cleaning", farmId] }); qc.invalidateQueries({ queryKey: ["stock-items", farmId] }); resetCleaningDialog(); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/cleaning/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cleaning", farmId] }); resetCleaningDialog(); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/cleaning/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cleaning", farmId] }); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });
  const createScheduleM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/cleaning-schedules`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cleaning-schedules", farmId] }); setScheduleOpen(false); setEditingSchedule(null); setScheduleForm(EMPTY_SCHEDULE); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const updateScheduleM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/cleaning-schedules/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cleaning-schedules", farmId] }); setScheduleOpen(false); setEditingSchedule(null); setScheduleForm(EMPTY_SCHEDULE); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const deleteScheduleM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/cleaning-schedules/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cleaning-schedules", farmId] }); setDeleteScheduleId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  function openEdit(c: CleaningRecord) {
    setEditing(c);
    setForm({
      area: c.area, cleaningType: c.cleaningType, productsUsed: c.productsUsed ?? "",
      dilutionRate: c.dilutionRate ?? "", contactTime: c.contactTime ?? "",
      cleanedBy: c.cleanedBy ?? "", cleanedDate: c.cleanedDate?.slice(0, 10) ?? "",
      nextDueDate: c.nextDueDate?.slice(0, 10) ?? "", verifiedBy: c.verifiedBy ?? "", notes: c.notes ?? "",
      performedByContractor: c.performedByContractor ?? false,
      contractorName: c.contractorName ?? "", contractorSupplierId: (c as any).contractorSupplierId ?? null, contractorOwnSupplies: c.contractorOwnSupplies ?? false,
      costPence: c.costPence ? String(c.costPence / 100) : "", invoiceRef: c.invoiceRef ?? "",
      ramsId: c.ramsId ?? "",
    });
    const products = c.productsUsed ? c.productsUsed.split(",").map(s => s.trim()).filter(Boolean) : [];
    setSelectedProducts(products);
    // Restore per-product stock consumptions from saved data
    const savedConsumptions: Record<string, { stockItemId: string; quantity: string }> = {};
    for (const cons of c.consumptions ?? []) {
      const key = cons.productName || (cons.stockItemName ?? `item-${cons.stockItemId}`);
      savedConsumptions[key] = { stockItemId: String(cons.stockItemId), quantity: cons.quantityUsed };
    }
    setStockConsumptions(savedConsumptions);
    setCustomProduct(""); setAutoNextDue("");
    setFormOpen(true);
  }
  function openEditSchedule(s: CleaningSchedule) {
    setEditingSchedule(s);
    setScheduleForm({ area: s.area, cleaningType: s.cleaningType, intervalDays: s.intervalDays, notes: s.notes ?? "", isActive: s.isActive });
    setScheduleOpen(true);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const productsUsed = selectedProducts.join(", ");
    const costPenceVal = form.costPence !== "" ? Math.round(parseFloat(String(form.costPence)) * 100) : null;
    // Build consumptions array from per-product stock links
    const consumptions = selectedProducts
      .filter(p => stockConsumptions[p]?.stockItemId)
      .map(p => ({
        productName: p,
        stockItemId: parseInt(String(stockConsumptions[p].stockItemId)),
        quantityUsed: stockConsumptions[p].quantity || "0",
      }));
    const body = {
      ...form, productsUsed, consumptions,
      cleanedDate: form.cleanedDate ? new Date(form.cleanedDate).toISOString() : null,
      nextDueDate: form.nextDueDate ? new Date(form.nextDueDate).toISOString() : null,
      ramsId: form.ramsId !== "" ? parseInt(String(form.ramsId)) : null,
      costPence: !isNaN(costPenceVal as number) ? costPenceVal : null,
      invoiceRef: form.invoiceRef || null,
      contractorName: form.contractorName || null,
      contractorSupplierId: (form as any).contractorSupplierId ?? null,
    };
    if (editing) { updateM.mutate({ id: editing.id, body }); } else { createM.mutate(body); }
  }
  function handleScheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...scheduleForm, intervalDays: parseInt(String(scheduleForm.intervalDays)) };
    if (editingSchedule) { updateScheduleM.mutate({ id: editingSchedule.id, body }); } else { createScheduleM.mutate(body); }
  }
  const isSubmitting = createM.isPending || updateM.isPending;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search area, type, product..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <CropYearSelector value={cropYear} onChange={setCropYear} showAllYears />
        <Button variant="outline" onClick={() => setHistoryOpen(true)} className="gap-2 shrink-0">
          <History className="w-4 h-4" /> C&amp;D History
        </Button>
        <Button variant="outline" onClick={() => printCleaningRegister(filtered, farmName, cropYearLabel(cropYear))} className="gap-2 shrink-0" disabled={filtered.length === 0}>
          <Printer className="w-4 h-4" /> Print Register
        </Button>
        {historyOpen && <BioCleanHistoryDialog records={records} onClose={() => setHistoryOpen(false)} />}
        <Button onClick={() => { resetCleaningDialog(); setFormOpen(true); }} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Add Record
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-foreground/50"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-lg font-semibold text-foreground/80 mb-1">No cleaning records</h3>
            <p className="text-foreground/50 text-sm">{search ? "No records match your search." : "Record cleaning and disinfection activities to maintain biosecurity standards."}</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Area", "Type", "Products", "Cleaned Date", "Performed By", "Next Due", "Verified By", ""].map(h => (
                    <th key={h} className="text-left p-4 text-xs uppercase tracking-wider font-bold text-foreground/50 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-black/[0.02] transition-colors">
                    <td className="p-4 text-sm font-medium">{c.area}</td>
                    <td className="p-4 text-sm text-foreground/70">{c.cleaningType}</td>
                    <td className="p-4 text-sm text-foreground/70 max-w-[140px] truncate">{c.productsUsed || "—"}</td>
                    <td className="p-4 text-sm text-foreground/70 whitespace-nowrap">{formatDate(c.cleanedDate)}</td>
                    <td className="p-4 text-sm text-foreground/70">
                      {c.performedByContractor
                        ? <span className="inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200"><HardHat className="w-3 h-3" />{c.contractorName || "Contractor"}</span>
                        : (c.cleanedBy || "—")}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex flex-col gap-1">
                        {c.nextDueDate && <span className="text-foreground/70 whitespace-nowrap">{formatDate(c.nextDueDate)}</span>}
                        {dueBadge(c.nextDueDate, "Due")}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground/70">{c.verifiedBy || "—"}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewCleaning(c)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-green-600" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/40 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Schedule Rules Panel ─────────────────────────────────────────── */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary/60" />
            <h3 className="text-sm font-bold text-foreground/70 uppercase tracking-wider">Cleaning Schedule Rules</h3>
            <span className="text-xs text-foreground/40">— auto-calculate Next Due Date when area &amp; type match</span>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => { setEditingSchedule(null); setScheduleForm(EMPTY_SCHEDULE); setScheduleOpen(true); }}>
            <Plus className="w-3.5 h-3.5" /> Add Rule
          </Button>
        </div>
        {schedulesLoading ? (
          <div className="text-sm text-foreground/40 py-2">Loading schedules…</div>
        ) : schedules.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-6 text-center text-foreground/40 text-sm">
            No schedule rules yet. Add a rule to auto-fill Next Due Date when logging a clean.
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground/50">Area</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground/50">Cleaning Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground/50">Interval</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground/50">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-foreground/50">Notes</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(s => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-black/[0.015]">
                    <td className="px-4 py-2.5 font-medium">{s.area}</td>
                    <td className="px-4 py-2.5 text-foreground/70">{s.cleaningType}</td>
                    <td className="px-4 py-2.5 text-foreground/70">Every {s.intervalDays} day{s.intervalDays !== 1 ? "s" : ""}</td>
                    <td className="px-4 py-2.5">
                      {s.isActive
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200"><CheckCircle2 className="w-3 h-3" />Active</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">Inactive</span>}
                    </td>
                    <td className="px-4 py-2.5 text-foreground/50 text-xs max-w-[160px] truncate">{s.notes || "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditSchedule(s)} className="p-1 rounded hover:bg-black/5 text-foreground/40 hover:text-primary"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteScheduleId(s.id)} className="p-1 rounded hover:bg-red-50 text-foreground/40 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add / Edit Cleaning Record Dialog ────────────────────────────── */}
      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) resetCleaningDialog(); }}>
        <DialogContent style={{ maxWidth: "58rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {editing ? "Edit Cleaning Record" : "Add Cleaning Record"}
            </DialogTitle>
            <DialogDescription>Record cleaning and disinfection to maintain Red Tractor biosecurity standards.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5 pt-1 max-h-[70vh] overflow-y-auto pr-1">

              {/* Core fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Area / Location <span className="text-red-500">*</span></label>
                  <FarmLocationSelect farmId={farmId} value={form.area} onChange={v => setForm(f => ({ ...f, area: v }))} required placeholder="Select area / location…" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Cleaning Type <span className="text-red-500">*</span></label>
                  <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" value={CLEANING_TYPES.filter(t => t !== "Other").includes(form.cleaningType) ? form.cleaningType : (form.cleaningType ? "Other" : "")} onChange={e => setForm(f => ({ ...f, cleaningType: e.target.value }))} required>
                    <option value="">Select type...</option>
                    {CLEANING_TYPES.map(t => <option key={t} value={t}>{t === "Other" ? "Other (please specify)" : t}</option>)}
                  </select>
                  {(form.cleaningType === "Other" || (form.cleaningType && !CLEANING_TYPES.filter(t => t !== "Other").includes(form.cleaningType))) && (
                    <Input className="mt-1.5" value={form.cleaningType === "Other" ? "" : form.cleaningType} onChange={e => setForm(f => ({ ...f, cleaningType: e.target.value || "Other" }))} placeholder="Please specify cleaning type…" autoFocus={form.cleaningType === "Other"} />
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Cleaned Date <span className="text-red-500">*</span></label>
                  <Input type="date" value={form.cleanedDate} onChange={e => setForm(f => ({ ...f, cleanedDate: e.target.value }))} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">
                    Next Due Date
                    {autoNextDue && <span className="ml-2 text-xs font-normal text-green-600 bg-green-50 border border-green-200 rounded px-1.5 py-0.5"><Clock className="w-3 h-3 inline mr-0.5" />Auto from schedule</span>}
                  </label>
                  <Input type="date" value={form.nextDueDate} onChange={e => setForm(f => ({ ...f, nextDueDate: e.target.value }))} />
                  {autoNextDue && !form.nextDueDate && (
                    <p className="text-xs text-green-600 mt-1">Will auto-set to {new Date(autoNextDue).toLocaleDateString("en-GB")} on save</p>
                  )}
                </div>
              </div>

              {/* Performed By section */}
              <div className="border border-border rounded-xl p-4 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1">Performed By</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, performedByContractor: false }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${!form.performedByContractor ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground/50 hover:border-primary/40"}`}
                  >
                    <Users className="w-4 h-4" /> Farm Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, performedByContractor: true }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${form.performedByContractor ? "border-amber-500 bg-amber-50 text-amber-700" : "border-border text-foreground/50 hover:border-amber-400"}`}
                  >
                    <HardHat className="w-4 h-4" /> Contractor
                  </button>
                </div>

                {form.performedByContractor ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Contractor Name <span className="text-red-500">*</span></label>
                      <BuyerCombobox farmId={farmId!} types={["contractor", "general"]} valueId={(form as any).contractorSupplierId ?? null} valueName={form.contractorName} onChange={(id, name) => setForm(f => ({ ...f, contractorSupplierId: id, contractorName: name }))} />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={form.contractorOwnSupplies}
                          onChange={e => setForm(f => ({ ...f, contractorOwnSupplies: e.target.checked }))}
                          className="w-4 h-4 rounded accent-amber-600"
                        />
                        <span className="text-sm font-medium text-foreground/70">Contractor's own supplies</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm font-medium text-foreground/70 mb-1 block">Cleaned By</label>
                    <Input list="cleaning-staff-list" placeholder="Name of staff member" value={form.cleanedBy} onChange={e => setForm(f => ({ ...f, cleanedBy: e.target.value }))} />
                    <datalist id="cleaning-staff-list">{knownStaff.map(n => <option key={n} value={n} />)}</datalist>
                  </div>
                )}
              </div>

              {/* Products Used */}
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Products Used</label>
                <div className="flex flex-wrap gap-1.5 min-h-[2rem] mb-2">
                  {selectedProducts.map(p => (
                    <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      {p}
                      <button type="button" onClick={() => setSelectedProducts(pp => pp.filter(x => x !== p))} className="ml-0.5 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {selectedProducts.length === 0 && <span className="text-sm text-foreground/40 italic self-center">No products selected yet</span>}
                </div>
                <div className="flex gap-2">
                  <select value="" onChange={e => { const v = e.target.value; if (v) setSelectedProducts(pp => pp.includes(v) ? pp : [...pp, v]); }}
                    className="flex-1 h-10 rounded-xl border-2 border-border bg-transparent px-3 py-1.5 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
                    <option value="">+ Add from COSHH register…</option>
                    {coshhSubstances.filter(s => !selectedProducts.includes(s)).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 mt-2">
                  <Input placeholder="Or type unlisted product name…" value={customProduct} onChange={e => setCustomProduct(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const v = customProduct.trim(); if (v) { setSelectedProducts(pp => pp.includes(v) ? pp : [...pp, v]); setCustomProduct(""); } } }}
                    className="flex-1 text-sm h-10" />
                  <Button type="button" variant="outline" className="h-10 px-3 shrink-0" disabled={!customProduct.trim()}
                    onClick={() => { const v = customProduct.trim(); if (v) { setSelectedProducts(pp => pp.includes(v) ? pp : [...pp, v]); setCustomProduct(""); } }}>Add</Button>
                </div>
                {coshhSubstances.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1.5">No COSHH substances on register yet — type products manually above.</p>
                )}
              </div>

              {/* Application details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Dilution Rate</label>
                  <Input placeholder="e.g. 1:100, 1%" value={form.dilutionRate} onChange={e => setForm(f => ({ ...f, dilutionRate: e.target.value }))} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Contact Time</label>
                  <Input placeholder="e.g. 30 minutes, overnight" value={form.contactTime} onChange={e => setForm(f => ({ ...f, contactTime: e.target.value }))} />
                </div>
              </div>

              {/* Stock consumption — only shown when NOT contractor's own supplies */}
              {!form.contractorOwnSupplies && (
                <div className="border border-border rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 mb-2">
                    <Package className="w-3.5 h-3.5" />Stock Used — per product
                    {!form.performedByContractor && <span className="font-normal text-foreground/40">· farm supplies deducted on save</span>}
                  </p>
                  {selectedProducts.length === 0 ? (
                    <p className="text-xs text-foreground/40 italic py-1">Add products above to link stock items for each one.</p>
                  ) : (
                    <div className="space-y-1">
                      {selectedProducts.map(product => {
                        const consumption = stockConsumptions[product] ?? { stockItemId: "", quantity: "" };
                        const norm = product.toLowerCase();
                        const matched = stockForDropdown.filter(s => s.name.toLowerCase().includes(norm) || norm.includes(s.name.toLowerCase()));
                        const others = stockForDropdown.filter(s => !matched.includes(s));
                        const linkedItem = stockForDropdown.find(s => s.id === Number(consumption.stockItemId));
                        return (
                          <div key={product} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
                            <span className="text-xs font-medium text-foreground/70 min-w-0 w-36 truncate" title={product}>{product}</span>
                            <span className="text-foreground/30 shrink-0">→</span>
                            <select
                              value={consumption.stockItemId}
                              onChange={e => setStockConsumptions(prev => ({ ...prev, [product]: { ...prev[product] ?? { quantity: "" }, stockItemId: e.target.value } }))}
                              className="flex-1 h-9 rounded-lg border-2 border-border bg-transparent px-2 text-xs focus:outline-none focus:border-primary min-w-0"
                            >
                              <option value="">Link stock item…</option>
                              {matched.length > 0 && (
                                <optgroup label="── Matched by name">
                                  {matched.map(s => <option key={s.id} value={s.id}>{s.name}{s.unit ? ` (${s.unit})` : ""}</option>)}
                                </optgroup>
                              )}
                              {others.length > 0 && (
                                <optgroup label={matched.length > 0 ? "── Other stock items" : "── Stock items"}>
                                  {others.map(s => <option key={s.id} value={s.id}>{s.name}{s.unit ? ` (${s.unit})` : ""}</option>)}
                                </optgroup>
                              )}
                            </select>
                            <div className="flex items-center gap-1 shrink-0">
                              <Input
                                className="w-20 h-9 text-xs"
                                placeholder="Qty"
                                value={consumption.quantity}
                                disabled={!consumption.stockItemId}
                                onChange={e => setStockConsumptions(prev => ({ ...prev, [product]: { ...prev[product] ?? { stockItemId: "" }, quantity: e.target.value } }))}
                              />
                              {linkedItem?.unit && <span className="text-xs text-foreground/40 w-8 shrink-0">{linkedItem.unit}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {stockItems.length === 0 && selectedProducts.length > 0 && (
                    <p className="text-xs text-amber-600 mt-1">No stock items on register yet — add them in the Stock &amp; Suppliers module.</p>
                  )}
                  {stockItems.length > 0 && cleaningStockItems.length === 0 && selectedProducts.length > 0 && (
                    <p className="text-xs text-amber-600 mt-1">No items categorised as Disinfectant found — showing all stock items. Set the category to "Disinfectant" in Stock &amp; Suppliers to filter here.</p>
                  )}
                </div>
              )}

              {/* Cost / invoice — shown when contractor */}
              {form.performedByContractor && (
                <div className="border border-border rounded-xl p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1">Cost &amp; Invoice</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Cost (£)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-foreground/50">£</span>
                        <Input className="pl-7" type="number" step="0.01" min="0" placeholder="0.00" value={form.costPence} onChange={e => setForm(f => ({ ...f, costPence: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70 mb-1 block">Invoice / PO Reference</label>
                      <Input placeholder="e.g. INV-2024-001" value={form.invoiceRef} onChange={e => setForm(f => ({ ...f, invoiceRef: e.target.value }))} />
                    </div>
                  </div>
                </div>
              )}

              {/* RAMS reference */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">
                    <ClipboardList className="w-3.5 h-3.5 inline mr-1 text-foreground/40" />
                    RAMS / Risk Assessment Reference
                  </label>
                  <select value={form.ramsId} onChange={e => setForm(f => ({ ...f, ramsId: e.target.value }))}
                    className="w-full h-10 rounded-xl border-2 border-border bg-transparent px-3 py-1 text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10">
                    <option value="">None / not applicable</option>
                    {ramsRecords.map(r => <option key={r.id} value={r.id}>{r.title}{r.area ? ` — ${r.area}` : ""}</option>)}
                  </select>
                  {ramsRecords.length === 0 && <p className="text-xs text-foreground/40 mt-1">No risk assessments on file. Add them in the Risk &amp; Waste module.</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground/70 mb-1 block">Verified By</label>
                  <StaffSelect value={form.verifiedBy} onChange={v => setForm(f => ({ ...f, verifiedBy: v }))} staffNames={cleanStaffNames} loading={cleanMembersLoading} />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                <Input placeholder="Additional notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            {/* Attachments — only available when editing an existing record */}
            {editing && (
              <div className="border border-border rounded-xl p-4 mt-2">
                <RecordAttachments
                  farmId={farmId}
                  recordType="cleaning-disinfection"
                  recordId={editing.id}
                />
              </div>
            )}
            {!editing && (
              <p className="text-xs text-foreground/40 flex items-center gap-1.5 mt-1">
                <span>📎</span> Save the record first, then re-open it to attach photos or documents.
              </p>
            )}

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={resetCleaningDialog}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editing ? "Update Record" : "Save Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── View Cleaning Record Dialog ───────────────────────────────────── */}
      {viewCleaning && (
        <Dialog open onOpenChange={() => setViewCleaning(null)}>
          <DialogContent style={{ maxWidth: "48rem" }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Cleaning Record — {viewCleaning.area}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Area / Location</p><p className="font-medium">{viewCleaning.area}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Cleaning Type</p><p className="font-medium">{viewCleaning.cleaningType}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Cleaned Date</p><p className="font-medium">{formatDate(viewCleaning.cleanedDate)}</p></div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Performed By</p>
                {viewCleaning.performedByContractor
                  ? <p className="font-medium flex items-center gap-1"><HardHat className="w-3.5 h-3.5 text-amber-600" /><span className="text-amber-700">Contractor</span>{viewCleaning.contractorName && <span className="text-foreground/70 font-normal"> — {viewCleaning.contractorName}</span>}</p>
                  : <p className="font-medium">{viewCleaning.cleanedBy || "—"}</p>}
              </div>
              {viewCleaning.performedByContractor && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Contractor's Own Supplies</p>
                  <p className="font-medium">{viewCleaning.contractorOwnSupplies ? "Yes" : "No — farm supplies used"}</p>
                </div>
              )}
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Products Used</p><p className="font-medium">{viewCleaning.productsUsed || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Dilution Rate</p><p className="font-medium">{viewCleaning.dilutionRate || "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Contact Time</p><p className="font-medium">{viewCleaning.contactTime || "—"}</p></div>
              {viewCleaning.consumptions?.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Stock Used</p>
                  <div className="space-y-1">
                    {viewCleaning.consumptions.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Package className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                        <span className="font-medium">{c.stockItemName || `Item #${c.stockItemId}`}</span>
                        <span className="text-foreground/50">—</span>
                        <span className="font-medium">{c.quantityUsed}{c.stockItemUnit ? ` ${c.stockItemUnit}` : ""}</span>
                        {c.productName && c.productName !== c.stockItemName && (
                          <span className="text-xs text-foreground/40 italic">({c.productName})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(viewCleaning.costPence || viewCleaning.invoiceRef) && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Cost / Invoice</p>
                  <p className="font-medium">
                    {viewCleaning.costPence ? `£${(viewCleaning.costPence / 100).toFixed(2)}` : "—"}
                    {viewCleaning.invoiceRef && <span className="text-foreground/50 font-normal ml-2 text-xs">{viewCleaning.invoiceRef}</span>}
                  </p>
                </div>
              )}
              {viewCleaning.ramsId && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">RAMS Reference</p>
                  <p className="font-medium flex items-center gap-1"><ClipboardList className="w-3.5 h-3.5 text-foreground/40" />
                    {ramsRecords.find(r => r.id === viewCleaning.ramsId)?.title ?? `RA-${viewCleaning.ramsId}`}
                  </p>
                </div>
              )}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Next Due Date</p><p className="font-medium">{viewCleaning.nextDueDate ? formatDate(viewCleaning.nextDueDate) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Verified By</p><p className="font-medium">{viewCleaning.verifiedBy || "—"}</p></div>
              {viewCleaning.notes && (<div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Notes</p><p className="font-medium">{viewCleaning.notes}</p></div>)}
            </div>

            {/* Attachments */}
            <div className="border border-border rounded-xl p-4 mt-2">
              <RecordAttachments
                farmId={farmId}
                recordType="cleaning-disinfection"
                recordId={viewCleaning.id}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewCleaning); setViewCleaning(null); }}>Edit</Button>
              <Button onClick={() => setViewCleaning(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Delete Record Dialog ──────────────────────────────────────────── */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Cleaning Record</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">Are you sure? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId && deleteM.mutate(deleteId)} disabled={deleteM.isPending}>
              {deleteM.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Schedule Rule Dialog ──────────────────────────────── */}
      <Dialog open={scheduleOpen} onOpenChange={o => { if (!o) { setScheduleOpen(false); setEditingSchedule(null); setScheduleForm(EMPTY_SCHEDULE); } }}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" />{editingSchedule ? "Edit Schedule Rule" : "Add Schedule Rule"}</DialogTitle>
            <DialogDescription>Define recurring cleaning intervals. When you log a clean that matches an active rule, the Next Due Date is calculated automatically.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleScheduleSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Area / Location <span className="text-red-500">*</span></label>
                <FarmLocationSelect farmId={farmId} value={scheduleForm.area} onChange={v => setScheduleForm(f => ({ ...f, area: v }))} required placeholder="Select area…" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Cleaning Type <span className="text-red-500">*</span></label>
                <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" value={scheduleForm.cleaningType} onChange={e => setScheduleForm(f => ({ ...f, cleaningType: e.target.value }))} required>
                  <option value="">Select type...</option>
                  {CLEANING_TYPES.filter(t => t !== "Other").map(t => <option key={t} value={t}>{t}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Interval (days) <span className="text-red-500">*</span></label>
                <Input type="number" min="1" max="3650" placeholder="e.g. 7, 14, 28, 90" value={scheduleForm.intervalDays} onChange={e => setScheduleForm(f => ({ ...f, intervalDays: e.target.value }))} required />
                {scheduleForm.intervalDays && !isNaN(Number(scheduleForm.intervalDays)) && Number(scheduleForm.intervalDays) > 0 && (
                  <p className="text-xs text-foreground/50 mt-1">Every {Number(scheduleForm.intervalDays) === 7 ? "week" : Number(scheduleForm.intervalDays) === 14 ? "fortnight" : Number(scheduleForm.intervalDays) === 28 || Number(scheduleForm.intervalDays) === 30 ? "month" : `${scheduleForm.intervalDays} days`}</p>
                )}
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={scheduleForm.isActive} onChange={e => setScheduleForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded accent-green-600" />
                  <span className="text-sm font-medium text-foreground/70">Active (used for auto-date)</span>
                </label>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
                <Input placeholder="Optional — e.g. Red Tractor requirement, quarterly inspection" value={scheduleForm.notes} onChange={e => setScheduleForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setScheduleOpen(false); setEditingSchedule(null); setScheduleForm(EMPTY_SCHEDULE); }}>Cancel</Button>
              <Button type="submit" disabled={createScheduleM.isPending || updateScheduleM.isPending}>
                {(createScheduleM.isPending || updateScheduleM.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editingSchedule ? "Update Rule" : "Save Rule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Schedule Rule Dialog ───────────────────────────────────── */}
      <Dialog open={deleteScheduleId !== null} onOpenChange={() => setDeleteScheduleId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Schedule Rule</DialogTitle></DialogHeader>
          <p className="text-foreground/70 text-sm">This rule will no longer auto-calculate Next Due Date. Existing records are not affected.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteScheduleId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteScheduleId && deleteScheduleM.mutate(deleteScheduleId)} disabled={deleteScheduleM.isPending}>
              {deleteScheduleM.isPending && <Loader2 className="w-4 h-4 animate-spin mr-1" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── COSHH Tab ─────────────────────────────────────────────────────────────────

function printCoshhRegister(records: any[], farmName: string, yearLabel: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (v: string | null | undefined) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const rows = records.map(r => `<tr>
    <td style="font-weight:600">${r.substanceName}</td><td>${r.manufacturer || "—"}</td>
    <td>${r.hazardClassification || "—"}</td><td>${r.usageArea || "—"}</td>
    <td>${r.storageLocation || "—"}</td><td>${r.assessedBy || "—"}</td>
    <td style="white-space:nowrap">${fmtD(r.assessmentDate)}</td>
    <td style="white-space:nowrap">${fmtD(r.reviewDate)}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>COSHH Register — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">COSHH Assessment Register · ${yearLabel} · Control of Substances Hazardous to Health · Red Tractor Compliance</p></div>
<div class="hdr-r"><b>COSHH Register</b>${records.length} substance${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Substance</th><th>Manufacturer</th><th>Hazard Classification</th><th>Usage Area</th><th>Storage Location</th><th>Assessed By</th><th>Assessment Date</th><th>Review Due</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">COSHH Register — Control of Substances Hazardous to Health Regulations 2002. Retain for minimum 5 years. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

function printCoshhSheet(r: any, farmName: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (v: string | null | undefined) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const tRow = (label: string, val: string | null | undefined) =>
    val ? `<tr><td style="font-weight:600;padding:7px 10px;background:#f9fafb;border:1px solid #e5e7eb;width:34%;vertical-align:top;font-size:11px">${label}</td><td style="padding:7px 10px;border:1px solid #e5e7eb;white-space:pre-wrap;font-size:11px">${val}</td></tr>` : "";
  openPrint(`<!DOCTYPE html><html><head><title>COSHH Assessment — ${r.substanceName}</title><style>
body{font-family:Arial,sans-serif;font-size:11px;margin:2cm;color:#000}h1{font-size:15px;font-weight:700;margin:0 0 2px}
h2{font-size:11px;font-weight:700;margin:16px 0 6px;border-bottom:1px solid #e5e7eb;padding-bottom:3px}
p.sub{font-size:10px;color:#555;margin:1px 0}table{width:100%;border-collapse:collapse;margin-bottom:10px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #166534;padding-bottom:10px;margin-bottom:16px}
.hdr-r{text-align:right;font-size:10px;color:#555}.hdr-r b{display:block;font-size:13px;font-weight:700;color:#000}
.hazard{display:inline-block;background:#fef2f2;border:1px solid #fca5a5;color:#b91c1c;padding:3px 12px;border-radius:4px;font-weight:700;font-size:11px;margin:4px 0 14px}
.sig{margin-top:36px;display:grid;grid-template-columns:1fr 1fr;gap:40px}
.sig-box{border-top:1px solid #000;padding-top:6px;font-size:10px}
.footer{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:24px}
@media print{@page{margin:2cm}}</style></head><body>
<div class="hdr"><div><h1>${r.substanceName}</h1><p class="sub">${farmName} · COSHH Assessment Sheet · Ref: COSHH-${r.id ?? "—"}</p></div>
<div class="hdr-r"><b>COSHH Assessment</b>Assessed: ${fmtD(r.assessmentDate)}<br>Review due: ${fmtD(r.reviewDate)}<br>Printed: ${today}</div></div>
${r.hazardClassification ? `<div class="hazard">⚠ ${r.hazardClassification}</div>` : ""}
<h2>Substance Details</h2><table>${tRow("Substance Name", r.substanceName)}${tRow("Manufacturer", r.manufacturer)}${tRow("Hazard Classification", r.hazardClassification)}${tRow("Usage Area", r.usageArea)}${tRow("Storage Location", r.storageLocation)}</table>
<h2>Control Measures &amp; PPE Required</h2><table>${tRow("Control Measures / PPE", r.controlMeasures || r.ppe || "—")}</table>
<h2>Emergency Procedures</h2><table>${tRow("Spill / First Aid / Emergency Contacts", r.emergencyProcedures || "—")}</table>
<h2>Document Control</h2><table>${tRow("Assessed By", r.assessedBy)}${tRow("Assessment Date", fmtD(r.assessmentDate))}${tRow("Next Review Date", fmtD(r.reviewDate))}</table>
<div class="sig">
<div class="sig-box">Assessor Signature<br><br><br>Name: ____________________________<br><br>Date: ____________________________</div>
<div class="sig-box">Farm Manager Countersignature<br><br><br>Name: ____________________________<br><br>Date: ____________________________</div>
</div>
<div class="footer">COSHH Assessment — Control of Substances Hazardous to Health Regulations 2002. Must be available at the point of use. Retain for minimum 5 years. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

function CoshhTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [addOpen, setAddOpen] = useState(false);
  const [viewCoshh, setViewCoshh] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ substanceName: "", manufacturer: "", hazardClassification: "", usageArea: "", storageLocation: "", controlMeasures: "", ppe: "", emergencyProcedures: "", assessedBy: "", assessmentDate: "", reviewDate: "", notes: "" });
  const { data: coshhMembersData, isLoading: coshhMembersLoading } = useFarmMembers(farmId);
  const coshhStaffNames = (coshhMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);

  const q = useQuery({
    queryKey: ["coshh", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/coshh`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["coshh", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/coshh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "COSHH assessment saved" }); invalidate(); setAddOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/coshh/${id}`, { method: "DELETE" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => setForm({ substanceName: "", manufacturer: "", hazardClassification: "", usageArea: "", storageLocation: "", controlMeasures: "", ppe: "", emergencyProcedures: "", assessedBy: "", assessmentDate: "", reviewDate: "", notes: "" });
  const allRecords: any[] = q.data ?? [];
  const records: any[] = allRecords.filter(r => isInCropYear(r.assessmentDate, cropYear));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>COSHH assessments for hazardous substances used on the farm.</p>
        <div className="flex items-center gap-2 flex-wrap">
          <CropYearSelector value={cropYear} onChange={setCropYear} showAllYears />
          <Button size="sm" variant="outline" onClick={() => printCoshhRegister(records, farmName, cropYearLabel(cropYear))} disabled={records.length === 0}><Printer size={14} className="mr-1" />Print Register</Button>
          <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add COSHH Assessment</Button>
        </div>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <p style={{ fontWeight: 600, color: "#374151" }}>No COSHH assessments for {cropYearLabel(cropYear)}</p>
          <p style={{ fontSize: "0.875rem" }}>Record assessments for pesticides, cleaning chemicals, fuels and other hazardous substances.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Substance", "Manufacturer", "Hazard Class", "Usage Area", "Storage", "Assessed By", "Date", "Review Due", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600 }}>{r.substanceName}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.manufacturer || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.hazardClassification || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.usageArea || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.storageLocation || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.assessedBy || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{r.assessmentDate ? new Date(r.assessmentDate).toLocaleDateString("en-GB") : "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{r.reviewDate ? new Date(r.reviewDate).toLocaleDateString("en-GB") : "—"}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <div style={{ display: "flex", gap: 2 }}>
                      <button onClick={() => setViewCoshh(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="View"><Eye size={14} /></button>
                      <button onClick={() => printCoshhSheet(r, farmName)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Print COSHH Assessment Sheet"><Printer size={14} /></button>
                      <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewCoshh && (
        <Dialog open onOpenChange={() => setViewCoshh(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary" />View COSHH Assessment</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm py-4">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Substance</p><p className="font-medium">{String(viewCoshh.substanceName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Manufacturer</p><p className="font-medium">{String(viewCoshh.manufacturer ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Hazard Classification</p><p className="font-medium">{String(viewCoshh.hazardClassification ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Usage Area</p><p className="font-medium">{String(viewCoshh.usageArea ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Storage Location</p><p className="font-medium">{String(viewCoshh.storageLocation ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessed By</p><p className="font-medium">{String(viewCoshh.assessedBy ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Date</p><p className="font-medium">{viewCoshh.assessmentDate ? new Date(viewCoshh.assessmentDate).toLocaleDateString("en-GB") : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Review Date</p><p className="font-medium">{viewCoshh.reviewDate ? new Date(viewCoshh.reviewDate).toLocaleDateString("en-GB") : "—"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">PPE / Control Measures</p><p className="font-medium whitespace-pre-wrap">{String(viewCoshh.controlMeasures || viewCoshh.ppe || "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Emergency Procedures</p><p className="font-medium whitespace-pre-wrap">{String(viewCoshh.emergencyProcedures || "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewCoshh.notes ?? "—")}</p></div>
            </div>

            {/* Attachments — Safety Data Sheets, label copies, risk assessment documents */}
            <div className="border border-border rounded-xl p-4">
              <RecordAttachments
                farmId={farmId}
                recordType="coshh"
                recordId={viewCoshh.id}
              />
            </div>

            <DialogFooter>
              <Button onClick={() => setViewCoshh(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) resetForm(); }}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader><DialogTitle>Add COSHH Assessment</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Substance Name <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. Roundup 360" value={form.substanceName} onChange={e => setForm((f: any) => ({ ...f, substanceName: e.target.value }))} /></div>
              <div><Label>Manufacturer</Label><Input value={form.manufacturer} onChange={e => setForm((f: any) => ({ ...f, manufacturer: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Hazard Classification</Label><Input placeholder="e.g. Irritant, Harmful to environment" value={form.hazardClassification} onChange={e => setForm((f: any) => ({ ...f, hazardClassification: e.target.value }))} /></div>
              <div><Label>Usage Area</Label><Input placeholder="e.g. Arable fields, buildings" value={form.usageArea} onChange={e => setForm((f: any) => ({ ...f, usageArea: e.target.value }))} /></div>
            </div>
            <div><Label>Storage Location</Label><FarmLocationSelect farmId={farmId} value={form.storageLocation} onChange={v => setForm((f: any) => ({ ...f, storageLocation: v }))} placeholder="Select storage location…" /></div>
            <div><Label>Control Measures / PPE Required</Label><Textarea placeholder="Describe PPE, handling precautions, ventilation requirements..." value={form.controlMeasures} onChange={e => setForm((f: any) => ({ ...f, controlMeasures: e.target.value }))} rows={2} /></div>
            <div><Label>Emergency Procedures</Label><Textarea placeholder="Spill response, first aid, emergency contacts..." value={form.emergencyProcedures} onChange={e => setForm((f: any) => ({ ...f, emergencyProcedures: e.target.value }))} rows={2} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Assessed By</Label><StaffSelect value={form.assessedBy} onChange={v => setForm((f: any) => ({ ...f, assessedBy: v }))} staffNames={coshhStaffNames} loading={coshhMembersLoading} /></div>
              <div><Label>Assessment Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.assessmentDate} onChange={e => setForm((f: any) => ({ ...f, assessmentDate: e.target.value }))} /></div>
              <div><Label>Review Date</Label><Input type="date" value={form.reviewDate} onChange={e => setForm((f: any) => ({ ...f, reviewDate: e.target.value }))} /></div>
            </div>
            <p className="text-xs text-foreground/40 flex items-center gap-1.5 pt-1">
              <span>📎</span> Save the assessment first, then open it to attach the Safety Data Sheet or other documents.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.substanceName || !form.assessmentDate || createMut.isPending}>Save Assessment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete COSHH Assessment</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Delete this COSHH assessment record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Biosecurity Plan Tab ──────────────────────────────────────────────────────
// The Biosecurity Plan is now managed in full from Compliance & Plans, which
// provides the complete 13-section editor plus emergency contacts and document
// control. This tab shows current review status and directs users there.

interface BiosecurityPlanStatus {
  lastReviewedDate: string | null;
  nextReviewDate: string | null;
  planAuthor: string | null;
  approvedBy: string | null;
  restrictedAreas: string | null;
  visitorProcedures: string | null;
}

function BiosecurityPlanTab({ farmId }: { farmId: number }) {
  const q = useQuery<{ plan: BiosecurityPlanStatus | null }>({
    queryKey: ["biosecurity-plan", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biosecurity-plan`).then(r => r.json()),
    enabled: !!farmId,
  });
  const plan = q.data?.plan ?? null;
  const hasPlan = !!(plan?.restrictedAreas || plan?.visitorProcedures);

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "18px 20px", marginBottom: 20, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <ShieldCheck size={22} style={{ color: "#2563eb", flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontWeight: 600, color: "#1d4ed8", margin: "0 0 4px", fontSize: "0.9375rem" }}>
            Biosecurity Plan — managed in Compliance &amp; Plans
          </p>
          <p style={{ fontSize: "0.875rem", color: "#1e40af", margin: "0 0 12px", lineHeight: 1.5 }}>
            Your Biosecurity Plan now lives in <strong>Compliance &amp; Plans</strong>, giving you access to the full 13-section editor, emergency contacts (vet &amp; APHA area office), version control, and the printable Red Tractor document. Any edits made there are reflected here automatically.
          </p>
          <Link href="/compliance">
            <Button size="sm">
              <FileText size={14} className="mr-2" />
              Open Biosecurity Plan
            </Button>
          </Link>
        </div>
      </div>

      {q.isLoading ? (
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Loading…</p>
      ) : !hasPlan ? (
        <div style={{ textAlign: "center", padding: "2rem 1rem", border: "2px dashed #e5e7eb", borderRadius: 10, color: "#9ca3af" }}>
          <FileText size={28} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
          <p style={{ fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>No Biosecurity Plan on file yet</p>
          <p style={{ fontSize: "0.875rem", margin: "0 0 14px" }}>Inspectors will ask to see this document. Create it in Compliance &amp; Plans.</p>
          <Link href="/compliance">
            <Button size="sm" variant="outline">Go to Compliance &amp; Plans</Button>
          </Link>
        </div>
      ) : (
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 18px" }}>
          <p style={{ fontWeight: 600, color: "#111827", margin: "0 0 10px", fontSize: "0.875rem" }}>Current plan status</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", fontSize: "0.8125rem", color: "#374151" }}>
            {plan.lastReviewedDate && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <CheckCircle2 size={14} style={{ color: "#16a34a", flexShrink: 0 }} />
                <span><strong>Last reviewed:</strong> {formatDate(plan.lastReviewedDate)}</span>
              </div>
            )}
            {plan.nextReviewDate && (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Calendar size={14} style={{ color: "#d97706", flexShrink: 0 }} />
                <span><strong>Next review due:</strong> {formatDate(plan.nextReviewDate)}</span>
              </div>
            )}
            {plan.planAuthor && (
              <div><strong>Author:</strong> {plan.planAuthor}</div>
            )}
            {plan.approvedBy && (
              <div><strong>Approved by:</strong> {plan.approvedBy}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BiosecurityPage({ defaultTab = "visitors" }: { defaultTab?: MainTab }) {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<MainTab>(() => { const p = new URLSearchParams(window.location.search); const t = p.get("tab") as MainTab | null; const valid: MainTab[] = ["visitors","pest-control","cleaning","coshh","biosecurity-plan"]; return t && valid.includes(t) ? t : defaultTab; });

  const { data: farmData } = useQuery({
    queryKey: ["farm-detail", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
    enabled: !!farmId,
  });
  const farmName: string = farmData?.record?.name ?? farmData?.name ?? "Farm";

  if (!farmId) return <Redirect href="/select" />;
  return (
    <AppLayout title="Biosecurity">
      <TabBar className="mb-6">
        <TabButton active={tab === "visitors"} onClick={() => setTab("visitors")}>Visitor Log</TabButton>
        <TabButton active={tab === "pest-control"} onClick={() => setTab("pest-control")}>Pest Control</TabButton>
        <TabButton active={tab === "cleaning"} onClick={() => setTab("cleaning")}>Cleaning &amp; Disinfection</TabButton>
        <TabButton active={tab === "coshh"} onClick={() => setTab("coshh")}>COSHH</TabButton>
        <TabButton active={tab === "biosecurity-plan"} onClick={() => setTab("biosecurity-plan")}>Biosecurity Plan</TabButton>
      </TabBar>
      {tab === "visitors" && <VisitorTab farmId={farmId} farmName={farmName} />}
      {tab === "pest-control" && <PestControlTab farmId={farmId} farmName={farmName} />}
      {tab === "cleaning" && <CleaningTab farmId={farmId} farmName={farmName} />}
      {tab === "coshh" && <CoshhTab farmId={farmId} farmName={farmName} />}
      {tab === "biosecurity-plan" && <BiosecurityPlanTab farmId={farmId} />}
    </AppLayout>
  );
}
