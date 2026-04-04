import React, { useState } from "react";
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
import { Redirect } from "wouter";
import {
  Plus, Search, Loader2, Pencil, Trash2, Users, Bug, ShieldCheck, Eye,
  CheckCircle2, XCircle, AlertTriangle, Calendar, Printer, FileText,
  Camera, File, ChevronDown, ChevronUp, Pen,
} from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Visitor | null>(null);
  const [viewVisitor, setViewVisitor] = useState<Visitor | null>(null);
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
      fetch(`/api/farms/${farmId}/visitors`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["visitors", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_VISITOR); },
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/visitors/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["visitors", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_VISITOR); },
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/visitors/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["visitors", farmId] }); setDeleteId(null); },
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
        <CropYearSelector value={cropYear} onChange={setCropYear} />
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
    mutationFn: (photoId: number) => fetch(`/api/farms/${farmId}/pest-control/${recordId}/photos/${photoId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pest-control", farmId] }),
  });

  const { uploadFile, isUploading, progress } = useUpload({
    onSuccess: async (response) => {
      await fetch(`/api/farms/${farmId}/pest-control/${recordId}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectPath: response.objectPath, fileName: response.objectPath.split("/").pop() }),
      });
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
  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PestRecord | null>(null);
  const [form, setForm] = useState<typeof EMPTY_PEST>(EMPTY_PEST);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
      fetch(`/api/farms/${farmId}/pest-control`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pest-control", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_PEST); },
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/pest-control/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pest-control", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_PEST); },
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/pest-control/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pest-control", farmId] }); setDeleteId(null); },
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
        <CropYearSelector value={cropYear} onChange={setCropYear} />
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
                            <button onClick={() => setExpandedId(expanded ? null : p.id)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-primary" title="Photos">
                              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              {(p.photos?.length ?? 0) > 0 && <span style={{ fontSize: "0.65rem", background: "#2563eb", color: "#fff", borderRadius: 8, padding: "1px 5px", marginLeft: 2 }}>{p.photos.length}</span>}
                            </button>
                            <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-black/5 text-foreground/40 hover:text-primary"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-md hover:bg-red-50 text-foreground/40 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
                <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50" value={PEST_TYPES.includes(form.pestType) ? form.pestType : "Other"} onChange={e => setForm(f => ({ ...f, pestType: e.target.value }))} required>
                  <option value="">Select...</option>
                  {PEST_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
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
    </>
  );
}

// ─── Cleaning & Disinfection ──────────────────────────────────────────────────

interface CleaningRecord {
  id: number; farmId: number; area: string; cleaningType: string; productsUsed: string | null;
  dilutionRate: string | null; contactTime: string | null; cleanedBy: string | null;
  cleanedDate: string; nextDueDate: string | null; verifiedBy: string | null; notes: string | null; createdAt: string;
}

const EMPTY_CLEANING = { area: "", cleaningType: "", productsUsed: "", dilutionRate: "", contactTime: "", cleanedBy: "", cleanedDate: new Date().toISOString().slice(0, 10), nextDueDate: "", verifiedBy: "", notes: "" };
const CLEANING_TYPES = ["Routine clean", "Deep clean", "Disinfection", "Fogging / fumigation", "Pre-housing clean", "Post-TB restriction clean", "Emergency clean", "Other"];

function printCleaningRegister(records: CleaningRecord[], farmName: string, yearLabel: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (v: string | null | undefined) => v ? new Date(v).toLocaleDateString("en-GB") : "—";
  const rows = records.map(r => `<tr>
    <td>${r.area}</td><td>${r.cleaningType}</td><td>${r.productsUsed || "—"}</td>
    <td>${r.dilutionRate || "—"}</td><td>${r.contactTime || "—"}</td>
    <td style="white-space:nowrap">${fmtD(r.cleanedDate)}</td><td>${r.cleanedBy || "—"}</td>
    <td style="white-space:nowrap">${fmtD(r.nextDueDate)}</td><td>${r.verifiedBy || "—"}</td>
    <td>${r.notes || "—"}</td>
  </tr>`).join("");
  openPrint(`<!DOCTYPE html><html><head><title>Cleaning &amp; Disinfection Register — ${farmName}</title><style>${PRINT_CSS}@media print{@page{size:A4 landscape;margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p class="sub">Cleaning &amp; Disinfection Register · ${yearLabel} · Red Tractor Biosecurity Compliance</p></div>
<div class="hdr-r"><b>Cleaning &amp; Disinfection Register</b>${records.length} record${records.length !== 1 ? "s" : ""}<br>Printed: ${today}</div></div>
<table><thead><tr><th>Area / Location</th><th>Cleaning Type</th><th>Products Used</th><th>Dilution Rate</th><th>Contact Time</th><th>Cleaned Date</th><th>Cleaned By</th><th>Next Due</th><th>Verified By</th><th>Notes</th></tr></thead>
<tbody>${rows}</tbody></table>
<div class="footer">Cleaning &amp; Disinfection Register — Red Tractor compliance record. Retain for minimum 3 years. Barnett Davies Enterprises Ltd · BDE Farm Trac · ${today}</div>
</body></html>`);
}

function CleaningTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [cropYear, setCropYear] = useState(currentCropYear());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CleaningRecord | null>(null);
  const [form, setForm] = useState<typeof EMPTY_CLEANING>(EMPTY_CLEANING);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ records: CleaningRecord[] }>({
    queryKey: ["cleaning", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/cleaning`).then(r => r.json()),
  });
  const records: CleaningRecord[] = data?.records ?? [];
  const filtered = records.filter(r =>
    isInCropYear(r.cleanedDate, cropYear)
    && (!search
      || r.area.toLowerCase().includes(search.toLowerCase())
      || r.cleaningType.toLowerCase().includes(search.toLowerCase())
      || r.productsUsed?.toLowerCase().includes(search.toLowerCase()))
  );

  const createM = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetch(`/api/farms/${farmId}/cleaning`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cleaning", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_CLEANING); },
  });
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: number; body: Record<string, unknown> }) =>
      fetch(`/api/farms/${farmId}/cleaning/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cleaning", farmId] }); setFormOpen(false); setEditing(null); setForm(EMPTY_CLEANING); },
  });
  const deleteM = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/cleaning/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cleaning", farmId] }); setDeleteId(null); },
  });

  function openEdit(c: CleaningRecord) {
    setEditing(c);
    setForm({ area: c.area, cleaningType: c.cleaningType, productsUsed: c.productsUsed ?? "", dilutionRate: c.dilutionRate ?? "", contactTime: c.contactTime ?? "", cleanedBy: c.cleanedBy ?? "", cleanedDate: c.cleanedDate?.slice(0, 10) ?? "", nextDueDate: c.nextDueDate?.slice(0, 10) ?? "", verifiedBy: c.verifiedBy ?? "", notes: c.notes ?? "" });
    setFormOpen(true);
  }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = { ...form, cleanedDate: form.cleanedDate ? new Date(form.cleanedDate).toISOString() : null, nextDueDate: form.nextDueDate ? new Date(form.nextDueDate).toISOString() : null };
    if (editing) { updateM.mutate({ id: editing.id, body }); } else { createM.mutate(body); }
  }
  const isSubmitting = createM.isPending || updateM.isPending;

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <Input placeholder="Search area, type, product..." className="pl-9 bg-white" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <CropYearSelector value={cropYear} onChange={setCropYear} />
        <Button variant="outline" onClick={() => printCleaningRegister(filtered, farmName, cropYearLabel(cropYear))} className="gap-2 shrink-0" disabled={filtered.length === 0}>
          <Printer className="w-4 h-4" /> Print Register
        </Button>
        <Button onClick={() => { setEditing(null); setForm(EMPTY_CLEANING); setFormOpen(true); }} className="gap-2 shrink-0">
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
                  {["Area", "Type", "Products", "Cleaned Date", "Cleaned By", "Next Due", "Verified By", ""].map(h => (
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
                    <td className="p-4 text-sm text-foreground/70">{c.cleanedBy || "—"}</td>
                    <td className="p-4 text-sm">
                      <div className="flex flex-col gap-1">
                        {c.nextDueDate && <span className="text-foreground/70 whitespace-nowrap">{formatDate(c.nextDueDate)}</span>}
                        {dueBadge(c.nextDueDate, "Due")}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground/70">{c.verifiedBy || "—"}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
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

      <Dialog open={formOpen} onOpenChange={(o) => { if (!o) { setFormOpen(false); setEditing(null); setForm(EMPTY_CLEANING); } }}>
        <DialogContent style={{ maxWidth: "52rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {editing ? "Edit Cleaning Record" : "Add Cleaning Record"}
            </DialogTitle>
            <DialogDescription>Record cleaning and disinfection to maintain Red Tractor biosecurity standards.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Area / Location <span className="text-red-500">*</span></label>
                <FarmLocationSelect farmId={farmId} value={form.area} onChange={v => setForm(f => ({ ...f, area: v }))} required placeholder="Select area / location…" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Cleaning Type <span className="text-red-500">*</span></label>
                <select className="w-full h-12 rounded-xl border-2 border-border bg-transparent px-4 py-2 text-base focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50" value={form.cleaningType} onChange={e => setForm(f => ({ ...f, cleaningType: e.target.value }))} required>
                  <option value="">Select type...</option>
                  {CLEANING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Cleaned Date <span className="text-red-500">*</span></label>
                <Input type="date" value={form.cleanedDate} onChange={e => setForm(f => ({ ...f, cleanedDate: e.target.value }))} required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Cleaned By</label>
                <Input placeholder="Name or contractor" value={form.cleanedBy} onChange={e => setForm(f => ({ ...f, cleanedBy: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Products Used</label>
                <Input placeholder="e.g. Virkon S 1%, Stalosan F" value={form.productsUsed} onChange={e => setForm(f => ({ ...f, productsUsed: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Dilution Rate</label>
                <Input placeholder="e.g. 1:100, 1%" value={form.dilutionRate} onChange={e => setForm(f => ({ ...f, dilutionRate: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Contact Time</label>
                <Input placeholder="e.g. 30 minutes, overnight" value={form.contactTime} onChange={e => setForm(f => ({ ...f, contactTime: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Next Due Date</label>
                <Input type="date" value={form.nextDueDate} onChange={e => setForm(f => ({ ...f, nextDueDate: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/70 mb-1 block">Verified By</label>
                <Input placeholder="Supervisor / farm manager" value={form.verifiedBy} onChange={e => setForm(f => ({ ...f, verifiedBy: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground/70 mb-1 block">Notes</label>
              <Input placeholder="Additional notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setFormOpen(false); setEditing(null); setForm(EMPTY_CLEANING); }}>Cancel</Button>
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
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ substanceName: "", manufacturer: "", hazardClassification: "", usageArea: "", storageLocation: "", controlMeasures: "", ppe: "", emergencyProcedures: "", assessedBy: "", assessmentDate: "", reviewDate: "", notes: "" });

  const q = useQuery({
    queryKey: ["coshh", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/coshh`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["coshh", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/coshh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "COSHH assessment saved" }); invalidate(); setAddOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/coshh/${id}`, { method: "DELETE" }),
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
          <CropYearSelector value={cropYear} onChange={setCropYear} />
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
              <div><Label>Assessed By</Label><Input value={form.assessedBy} onChange={e => setForm((f: any) => ({ ...f, assessedBy: e.target.value }))} /></div>
              <div><Label>Assessment Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.assessmentDate} onChange={e => setForm((f: any) => ({ ...f, assessmentDate: e.target.value }))} /></div>
              <div><Label>Review Date</Label><Input type="date" value={form.reviewDate} onChange={e => setForm((f: any) => ({ ...f, reviewDate: e.target.value }))} /></div>
            </div>
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

interface BiosecurityPlan {
  id?: number;
  restrictedAreas: string | null;
  visitorProcedures: string | null;
  vehicleEntryProcedures: string | null;
  cleaningProtocols: string | null;
  pestManagementApproach: string | null;
  diseaseResponsePlan: string | null;
  wasteManagementProcedures: string | null;
  waterSourceProtection: string | null;
  staffResponsibilities: string | null;
  planAuthor: string | null;
  lastReviewedDate: string | null;
  nextReviewDate: string | null;
  approvedBy: string | null;
  notes: string | null;
}

const EMPTY_PLAN: BiosecurityPlan = {
  restrictedAreas: "", visitorProcedures: "", vehicleEntryProcedures: "",
  cleaningProtocols: "", pestManagementApproach: "", diseaseResponsePlan: "",
  wasteManagementProcedures: "", waterSourceProtection: "", staffResponsibilities: "",
  planAuthor: "", lastReviewedDate: "", nextReviewDate: "", approvedBy: "", notes: "",
};

function planField(label: string, value: string | null | undefined) {
  if (!value) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "0.875rem", color: "#111827", whiteSpace: "pre-wrap", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "8px 12px" }}>{value}</div>
    </div>
  );
}

function printBiosecurityPlan(plan: BiosecurityPlan, farmName: string) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const fmtD = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const row = (label: string, val: string | null | undefined) =>
    val ? `<tr><td style="font-weight:600;padding:6px 10px;background:#f9fafb;border:1px solid #e5e7eb;width:34%;vertical-align:top">${label}</td><td style="padding:6px 10px;border:1px solid #e5e7eb;white-space:pre-wrap">${val}</td></tr>` : "";

  const html = `<html><head><title>Biosecurity Plan</title>
<style>body{font-family:Arial,sans-serif;font-size:11px;margin:2cm;color:#000}
h1{font-size:14px;font-weight:700;margin:0 0 2px}p{font-size:10px;color:#555;margin:1px 0}
h2{font-size:11px;font-weight:700;margin:18px 0 6px;border-bottom:1px solid #e5e7eb;padding-bottom:3px}
table{width:100%;border-collapse:collapse;margin-bottom:14px}
.hdr{display:flex;justify-content:space-between;border-bottom:2px solid #16a34a;padding-bottom:10px;margin-bottom:16px}
.hdr-r{text-align:right;font-size:10px;color:#555}.hdr-r b{display:block;font-size:13px;font-weight:700;color:#000}
.sig{margin-top:40px;display:grid;grid-template-columns:1fr 1fr;gap:40px}
.sig-box{border-top:1px solid #000;padding-top:6px;font-size:10px}
.footer{font-size:9px;color:#888;border-top:1px solid #e5e7eb;padding-top:6px;margin-top:24px}
@media print{@page{margin:1.5cm}}</style></head><body>
<div class="hdr"><div><h1>${farmName}</h1><p>Biosecurity Plan — Red Tractor Compliance Document</p></div>
<div class="hdr-r"><b>Biosecurity Plan</b>Last reviewed: ${fmtD(plan.lastReviewedDate)}<br>Printed: ${today}</div></div>
<table>${row("Restricted Areas", plan.restrictedAreas)}${row("Visitor Procedures", plan.visitorProcedures)}${row("Vehicle Entry Procedures", plan.vehicleEntryProcedures)}${row("Cleaning &amp; Disinfection Protocols", plan.cleaningProtocols)}${row("Pest Management Approach", plan.pestManagementApproach)}${row("Disease Response Plan", plan.diseaseResponsePlan)}${row("Waste Management Procedures", plan.wasteManagementProcedures)}${row("Water Source Protection", plan.waterSourceProtection)}${row("Staff Responsibilities", plan.staffResponsibilities)}</table>
<h2>Document Control</h2>
<table>${row("Plan Author", plan.planAuthor)}${row("Approved By", plan.approvedBy)}${row("Last Reviewed", fmtD(plan.lastReviewedDate))}${row("Next Review Due", fmtD(plan.nextReviewDate))}${row("Additional Notes", plan.notes)}</table>
<div class="sig">
<div class="sig-box">Farm Manager Signature<br><br><br>Name: ____________________________<br><br>Date: ____________________________</div>
<div class="sig-box">Red Tractor Assessor<br><br><br>Name: ____________________________<br><br>Date: ____________________________</div>
</div>
<div class="footer">Biosecurity Plan — retained as part of Red Tractor Combinable Crops compliance documentation. Make available at audit and review annually. BDE Farm Trac · ${today}</div>
</body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); w.addEventListener("afterprint", () => w.close()); w.print(); }
}

function BiosecurityPlanTab({ farmId, farmName }: { farmId: number; farmName: string }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<BiosecurityPlan>({ ...EMPTY_PLAN });

  const q = useQuery<{ plan: BiosecurityPlan | null }>({
    queryKey: ["biosecurity-plan", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/biosecurity-plan`).then(r => r.json()),
    enabled: !!farmId,
  });

  const plan = q.data?.plan ?? null;

  const saveMut = useMutation({
    mutationFn: (body: BiosecurityPlan) => fetch(`/api/farms/${farmId}/biosecurity-plan`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { toast({ title: "Biosecurity plan saved" }); qc.invalidateQueries({ queryKey: ["biosecurity-plan", farmId] }); setEditOpen(false); },
  });

  function openEdit() {
    if (plan) {
      setForm({
        ...plan,
        lastReviewedDate: plan.lastReviewedDate ? plan.lastReviewedDate.slice(0, 10) : "",
        nextReviewDate: plan.nextReviewDate ? plan.nextReviewDate.slice(0, 10) : "",
      });
    } else {
      setForm({ ...EMPTY_PLAN });
    }
    setEditOpen(true);
  }

  const hasPlan = plan && (plan.visitorProcedures || plan.restrictedAreas || plan.cleaningProtocols);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280", margin: 0 }}>
            Red Tractor requires a written Biosecurity Plan documenting your on-farm procedures. This document is reviewed at inspection.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {hasPlan && (
            <Button variant="outline" size="sm" onClick={() => printBiosecurityPlan(plan!, farmName)}>
              <Printer size={14} className="mr-2" /> Print Plan
            </Button>
          )}
          <Button size="sm" onClick={openEdit}>
            <Pencil size={14} className="mr-2" /> {hasPlan ? "Edit Plan" : "Create Plan"}
          </Button>
        </div>
      </div>

      {q.isLoading ? (
        <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>Loading…</p>
      ) : !hasPlan ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af", border: "2px dashed #e5e7eb", borderRadius: 12 }}>
          <FileText size={32} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
          <p style={{ fontWeight: 600, color: "#374151", margin: "0 0 4px" }}>No Biosecurity Plan on file</p>
          <p style={{ fontSize: "0.875rem", margin: "0 0 16px" }}>Create your written Biosecurity Plan — inspectors will ask to see this document.</p>
          <Button onClick={openEdit}>Create Biosecurity Plan</Button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 4 }}>
          {plan.lastReviewedDate && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "8px 14px", marginBottom: 12, display: "flex", gap: 8, alignItems: "center", fontSize: "0.875rem" }}>
              <CheckCircle2 size={16} style={{ color: "#16a34a", flexShrink: 0 }} />
              <span><strong>Plan last reviewed:</strong> {formatDate(plan.lastReviewedDate)}{plan.nextReviewDate && ` · Next review due: ${formatDate(plan.nextReviewDate)}`}</span>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              {planField("Restricted Areas", plan.restrictedAreas)}
              {planField("Visitor Procedures", plan.visitorProcedures)}
              {planField("Vehicle Entry Procedures", plan.vehicleEntryProcedures)}
              {planField("Pest Management", plan.pestManagementApproach)}
              {planField("Disease Response Plan", plan.diseaseResponsePlan)}
            </div>
            <div>
              {planField("Cleaning & Disinfection Protocols", plan.cleaningProtocols)}
              {planField("Waste Management", plan.wasteManagementProcedures)}
              {planField("Water Source Protection", plan.waterSourceProtection)}
              {planField("Staff Responsibilities", plan.staffResponsibilities)}
              {planField("Notes", plan.notes)}
            </div>
          </div>
          <div style={{ marginTop: 8, paddingTop: 12, borderTop: "1px solid #e5e7eb", display: "flex", gap: 24, fontSize: "0.8125rem", color: "#6b7280" }}>
            {plan.planAuthor && <span><strong>Author:</strong> {plan.planAuthor}</span>}
            {plan.approvedBy && <span><strong>Approved by:</strong> {plan.approvedBy}</span>}
          </div>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={open => { if (!open) setEditOpen(false); }}>
        <DialogContent style={{ maxWidth: 680 }}>
          <DialogHeader><DialogTitle>Biosecurity Plan</DialogTitle></DialogHeader>
          <div className="max-h-[72vh] overflow-y-auto" style={{ display: "grid", gap: 14 }}>
            <div><Label>Restricted Areas on Farm</Label><Textarea className="mt-1" rows={3} placeholder="e.g. Grain store restricted to authorised personnel. Livestock areas signed and gated…" value={form.restrictedAreas ?? ""} onChange={e => setForm(f => ({ ...f, restrictedAreas: e.target.value }))} /></div>
            <div><Label>Visitor Procedures</Label><Textarea className="mt-1" rows={3} placeholder="e.g. All visitors must sign in/out, declare any recent animal contact, wear clean PPE provided…" value={form.visitorProcedures ?? ""} onChange={e => setForm(f => ({ ...f, visitorProcedures: e.target.value }))} /></div>
            <div><Label>Vehicle Entry Procedures</Label><Textarea className="mt-1" rows={2} placeholder="e.g. All vehicles entering the yard must use the wheel wash. Contractors must be accompanied…" value={form.vehicleEntryProcedures ?? ""} onChange={e => setForm(f => ({ ...f, vehicleEntryProcedures: e.target.value }))} /></div>
            <div><Label>Cleaning & Disinfection Protocols</Label><Textarea className="mt-1" rows={3} placeholder="e.g. All equipment cleaned and disinfected before use. Chemical name, dilution rate, contact time…" value={form.cleaningProtocols ?? ""} onChange={e => setForm(f => ({ ...f, cleaningProtocols: e.target.value }))} /></div>
            <div><Label>Pest Management Approach</Label><Textarea className="mt-1" rows={2} placeholder="e.g. Bait points checked monthly by certificated contractor. Records maintained in pest control log…" value={form.pestManagementApproach ?? ""} onChange={e => setForm(f => ({ ...f, pestManagementApproach: e.target.value }))} /></div>
            <div><Label>Disease Response Plan</Label><Textarea className="mt-1" rows={3} placeholder="e.g. In the event of a suspected notifiable disease, farming operations cease immediately. Vet contacted on…" value={form.diseaseResponsePlan ?? ""} onChange={e => setForm(f => ({ ...f, diseaseResponsePlan: e.target.value }))} /></div>
            <div><Label>Waste Management Procedures</Label><Textarea className="mt-1" rows={2} placeholder="e.g. Chemical containers triple rinsed and returned to authorised collection scheme…" value={form.wasteManagementProcedures ?? ""} onChange={e => setForm(f => ({ ...f, wasteManagementProcedures: e.target.value }))} /></div>
            <div><Label>Water Source Protection</Label><Textarea className="mt-1" rows={2} placeholder="e.g. Borehole locked. Water test conducted annually. No chemicals stored within 10m of water source…" value={form.waterSourceProtection ?? ""} onChange={e => setForm(f => ({ ...f, waterSourceProtection: e.target.value }))} /></div>
            <div><Label>Staff Responsibilities</Label><Textarea className="mt-1" rows={2} placeholder="e.g. Farm manager: plan owner. All staff: biosecurity induction on joining. Named deputy: …" value={form.staffResponsibilities ?? ""} onChange={e => setForm(f => ({ ...f, staffResponsibilities: e.target.value }))} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Plan Author</Label><Input className="mt-1" value={form.planAuthor ?? ""} onChange={e => setForm(f => ({ ...f, planAuthor: e.target.value }))} /></div>
              <div><Label>Approved By</Label><Input className="mt-1" value={form.approvedBy ?? ""} onChange={e => setForm(f => ({ ...f, approvedBy: e.target.value }))} /></div>
              <div><Label>Last Reviewed Date</Label><Input type="date" className="mt-1" value={form.lastReviewedDate ?? ""} onChange={e => setForm(f => ({ ...f, lastReviewedDate: e.target.value }))} /></div>
              <div><Label>Next Review Due</Label><Input type="date" className="mt-1" value={form.nextReviewDate ?? ""} onChange={e => setForm(f => ({ ...f, nextReviewDate: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea className="mt-1" rows={2} value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending}>Save Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BiosecurityPage({ defaultTab = "visitors" }: { defaultTab?: MainTab }) {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<MainTab>(defaultTab);

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
      {tab === "biosecurity-plan" && <BiosecurityPlanTab farmId={farmId} farmName={farmName} />}
    </AppLayout>
  );
}
