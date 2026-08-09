// @ts-nocheck
import { useState, useRef, useMemo, type ReactNode } from "react";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { sanitiseCsvCell } from "@/lib/csv";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocAttach } from "@/components/DocAttach";
import { openPrintWindow } from "@/lib/print-report";
import { Plus, Pencil, Trash2, Loader2, Home, Bird, BarChart3, Pill, SprayCan, Thermometer, FileText, ShieldCheck, Scissors, ClipboardList, ClipboardCheck, Star, Truck, UtensilsCrossed, FileDown, AlertTriangle, TrendingUp, LayoutDashboard, CheckCircle2, XCircle, Circle, Eye, Receipt, HardHat, Users, Package, X as XIcon, QrCode, Printer, ChevronDown, ChevronUp, Syringe, Activity, ArrowRightLeft, ShieldAlert, MapPin, Clock, Save } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { useToast } from "@/hooks/use-toast";
import { StaffSelect } from "@/components/ui/staff-select";
import { ConfirmDialog as SharedConfirmDialog } from "@/components/ui/confirm-dialog";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, exportCSV, StatCard, Empty, ConfirmDialog, DataTable, useCrud, HOUSE_TYPES, POULTRY_SPECIES, PRODUCTION_SYSTEMS, SPECIES_LABEL_MAP, SYSTEM_LABEL_MAP, fmtSpecies, fmtSystem, getStockingDensityInfo, useFlocks, FlockSelect, fmtFlock } from "./shared";
import type { DensityInfo } from "./shared";

export function SchemeRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["poultry-schemes", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-scheme-records`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/poultry-scheme-records/${editing.id}`) : api(`farms/${farmId}/poultry-scheme-records`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-schemes", farmId] }); setOpen(false); setForm({}); setEditing(null); }, onError: () => toast({ title: "Save failed", variant: "destructive" }) });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-scheme-records/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["poultry-schemes", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  const SCHEMES = ["Red Tractor Poultry (Broiler)", "Red Tractor Poultry (Turkey)", "Red Tractor Poultry (Laying Hens)", "Lion Quality", "RSPCA Assured", "Organic (Soil Association)", "Organic (OF&G)", "Free Range", "Higher Welfare", "M&S Select Farms", "Other"];
  const OUTCOMES = ["Pass", "Conditional Pass", "Fail", "Pending", "Under Review"];
  const schList = records as Record<string, unknown>[];
  const [schemeNameFilter, setSchemeNameFilter] = usePersistedFilter({ page: "poultry-scheme-records", filter: "scheme", farmId, defaultValue: "all" });
  const [yearFilterSch, setYearFilterSch] = usePersistedFilter({ page: "poultry-scheme-records", filter: "year", farmId, defaultValue: "all" });
  const yearsSch = useMemo(() => Array.from(new Set(schList.map(r => String(r.assessmentYear ?? "")).filter(Boolean))).sort().reverse(), [schList]);
  const filteredSchList = schList.filter(r => (schemeNameFilter === "all" || String(r.schemeName ?? "") === schemeNameFilter) && (yearFilterSch === "all" || String(r.assessmentYear ?? "") === yearFilterSch));
  const today = new Date();
  const in60Days = new Date(today); in60Days.setDate(today.getDate() + 60);
  const expiringSoon = filteredSchList.filter(r => { if (!r.certificateExpiryDate) return false; const d = new Date(String(r.certificateExpiryDate)); return d >= today && d <= in60Days; });
  const expired = filteredSchList.filter(r => { if (!r.certificateExpiryDate) return false; return new Date(String(r.certificateExpiryDate)) < today; });
  const passes = filteredSchList.filter(r => r.assessmentOutcome === "Pass").length;
  const schCsv = [
    { key: "schemeName", label: "Scheme" }, { key: "certificateNumber", label: "Certificate No." },
    { key: "assessmentYear", label: "Year" }, { key: "assessmentDate", label: "Assessment Date", fmt: (r: Record<string, unknown>) => fmtDate(r.assessmentDate) },
    { key: "certificateExpiryDate", label: "Expiry Date", fmt: (r: Record<string, unknown>) => fmtDate(r.certificateExpiryDate) },
    { key: "assessorName", label: "Assessor" }, { key: "assessorOrganisation", label: "Assessor Organisation" },
    { key: "assessmentOutcome", label: "Outcome" }, { key: "nonConformances", label: "Non-conformances" },
    { key: "correctiveActionRequired", label: "Corrective Action Required" }, { key: "correctiveActionDueDate", label: "Action Due Date", fmt: (r: Record<string, unknown>) => fmtDate(r.correctiveActionDueDate) },
    { key: "notes", label: "Notes" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold text-sm">Assurance Scheme Records</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Log all Red Tractor Poultry, Lion Quality, RSPCA Assured and retailer assurance assessments. Track certificate numbers, assessment dates and non-conformances to maintain compliance status.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredSchList, "scheme-records.csv", schCsv)} disabled={!filteredSchList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ assessmentYear: String(new Date().getFullYear()), assessmentOutcome: "Pass" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={schemeNameFilter} onValueChange={setSchemeNameFilter}>
          <SelectTrigger className="w-56 h-8 text-xs"><SelectValue placeholder="All schemes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All schemes</SelectItem>
            {SCHEMES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={yearFilterSch} onValueChange={setYearFilterSch}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsSch.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
      </div>
      {!isLoading && schList.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scheme Compliance Overview</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Schemes Recorded" value={filteredSchList.length} />
              <StatCard label="Passes" value={passes} color={filteredSchList.length > 0 && passes === filteredSchList.length ? "green" : "amber"} />
              <StatCard label="Expiring Soon" value={expiringSoon.length} color={expiringSoon.length > 0 ? "amber" : "green"} sub="within 60 days" />
              <StatCard label="Expired Certificates" value={expired.length} color={expired.length > 0 ? "red" : "green"} sub={expired.length > 0 ? "renew immediately" : "none"} />
            </div>
          </div>
          {(expiringSoon.length > 0 || expired.length > 0) && (
            <div className={`rounded-lg border p-3 space-y-1 ${expired.length > 0 ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"}`}>
              <div className="flex items-center gap-2"><AlertTriangle className={`w-4 h-4 ${expired.length > 0 ? "text-red-600" : "text-amber-600"}`} /><p className={`text-xs font-semibold ${expired.length > 0 ? "text-red-800" : "text-amber-800"}`}>Certificate Expiry Alerts</p></div>
              {expired.map((r, i) => (
                <p key={i} className="text-xs text-red-700 pl-6"><strong>{String(r.schemeName ?? "Unknown scheme")}</strong> — Certificate expired {fmtDate(r.certificateExpiryDate)} — renew immediately to maintain scheme membership.</p>
              ))}
              {expiringSoon.map((r, i) => (
                <p key={i} className="text-xs text-amber-700 pl-6"><strong>{String(r.schemeName ?? "Unknown scheme")}</strong> — Expires {fmtDate(r.certificateExpiryDate)} — renewal due within 60 days.</p>
              ))}
            </div>
          )}
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "schemeName", label: "Scheme" },
          { key: "certificateNumber", label: "Certificate No." },
          { key: "assessmentDate", label: "Assessment Date", fmt: r => fmtDate(r.assessmentDate) },
          { key: "assessorName", label: "Assessor" },
          { key: "assessmentOutcome", label: "Outcome" },
          { key: "certificateExpiryDate", label: "Expires", fmt: r => fmtDate(r.certificateExpiryDate) },
          { key: "nonConformances", label: "Non-conformances" },
          { key: "doc", label: "Document", render: r => <DocAttach farmId={farmId} endpoint="poultry-scheme-records" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["poultry-schemes", farmId]} /> },
        ]}
        rows={filteredSchList}
        onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
        onDelete={r => del.mutate(r.id as number)} deleteMutation={del}
        onView={setViewRecord}
      />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Scheme Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Scheme Name</p><p className="font-medium">{String(viewRecord.schemeName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate Number</p><p className="font-medium">{String(viewRecord.certificateNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Date</p><p className="font-medium">{fmtDate(viewRecord.assessmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessor Name</p><p className="font-medium">{String(viewRecord.assessorName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Outcome</p><p className="font-medium">{String(viewRecord.assessmentOutcome ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate Expiry</p><p className="font-medium">{fmtDate(viewRecord.certificateExpiryDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Assessment Due</p><p className="font-medium">{fmtDate(viewRecord.nextAssessmentDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Non-Conformances</p><p className="font-medium">{String(viewRecord.nonConformances ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Action Plan Required</p><p className="font-medium">{String(viewRecord.actionsRequired ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditing(viewRecord); setForm(Object.fromEntries(Object.entries(viewRecord).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>Assurance Scheme Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Scheme Name *</Label>
              <Select value={String(form.schemeName ?? "")} onValueChange={v => setForm(f => ({ ...f, schemeName: v }))}>
                <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
                <SelectContent>{SCHEMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Assessment Date *</Label><Input type="date" value={String(form.assessmentDate ?? "")} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
            <div><Label>Assessment Year</Label><Input type="number" value={String(form.assessmentYear ?? "")} onChange={e => setForm(f => ({ ...f, assessmentYear: e.target.value }))} /></div>
            <div><Label>Assessor Name</Label><Input value={String(form.assessorName ?? "")} onChange={e => setForm(f => ({ ...f, assessorName: e.target.value }))} /></div>
            <div><Label>Outcome</Label>
              <Select value={String(form.assessmentOutcome ?? "Pass")} onValueChange={v => setForm(f => ({ ...f, assessmentOutcome: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OUTCOMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Certificate Number</Label><Input value={String(form.certificateNumber ?? "")} onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))} /></div>
            <div><Label>Certificate Expiry Date</Label><Input type="date" value={String(form.certificateExpiryDate ?? "")} onChange={e => setForm(f => ({ ...f, certificateExpiryDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Non-conformances / Observations</Label><Textarea value={String(form.nonConformances ?? "")} onChange={e => setForm(f => ({ ...f, nonConformances: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label>Actions Required</Label><Textarea value={String(form.actionsRequired ?? "")} onChange={e => setForm(f => ({ ...f, actionsRequired: e.target.value }))} rows={2} /></div>
            <div><Label>Actions Completed By Date</Label><Input type="date" value={String(form.actionsCompletedByDate ?? "")} onChange={e => setForm(f => ({ ...f, actionsCompletedByDate: e.target.value }))} /></div>
            <div><Label>Next Assessment Due</Label><Input type="date" value={String(form.nextAssessmentDate ?? "")} onChange={e => setForm(f => ({ ...f, nextAssessmentDate: e.target.value }))} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── POULTRY FEED TAB ──────────────────────────────────────────────────────────
