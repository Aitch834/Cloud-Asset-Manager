import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Eye, Plus, Pencil, Trash2, Loader2, BarChart3, Flame, Trees, Zap, FileBarChart, SunMedium, Sprout, Upload, Sparkles, Printer } from "lucide-react";
import { printProReport } from "@/lib/print-report";
import { FctImportDialog } from "@/components/FctImportDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { useLookupStrings } from "@/hooks/use-lookup";
import { Redirect } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";
import { RecordAttachments } from "@/components/ui/RecordAttachments";

const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
function Empty({ msg }: { msg: string }) { return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>; }
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
function DataTable({ cols, rows, onEdit, onDelete, onView }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void; onView?: (r: Record<string, unknown>) => void }) {
  const [pendingDelete, setPendingDelete] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet." />;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete || onView) && <th />}</tr></thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
              {(onEdit || onDelete || onView) && <td className="py-2 text-right space-x-1">
                {onView && <Button size="icon" variant="ghost" onClick={() => onView(row)}><Eye className="w-3.5 h-3.5" /></Button>}
                {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
                {onDelete && <Button size="icon" variant="ghost" onClick={() => setPendingDelete(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
              </td>}
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

const AUDIT_TOOLS = [
  "Agrecalc",
  "Cool Farm Tool",
  "Farm Carbon Toolkit",
  "AHDB Carbon Calculator",
  "SAC Carbon Calculator",
  "Carbon Footprint Ltd",
  "Arla Carbon Check",
  "Soil Association / OF&G calculator",
  "Bespoke consultant methodology",
  "Other",
];

const AUDIT_VERIFICATION_STATUSES = [
  "Self-assessed / unverified",
  "Internal review completed",
  "Third-party verified",
  "Certified (e.g. PAS 2060)",
];

const AUDITOR_TYPES = [
  "Internal staff member",
  "External auditor / consultant",
  "Not yet confirmed",
];

type PrefillAudit = { scope1: number; scope2: number; scope3: number; total: number; notes: string };

function AuditsTab({ farmId, prefillAudit, onPrefillUsed }: { farmId: number; prefillAudit?: PrefillAudit | null; onPrefillUsed?: () => void }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [auditorMode, setAuditorMode] = useState<"list" | "other">("list");
  const [certBodyMode, setCertBodyMode] = useState<"list" | "other">("list");

  useEffect(() => {
    if (!prefillAudit) return;
    setEditing(null);
    setAuditorMode("list");
    setCertBodyMode("list");
    setForm({
      totalScope1TonnesCo2e: prefillAudit.scope1.toFixed(3),
      totalScope2TonnesCo2e: prefillAudit.scope2.toFixed(3),
      totalScope3TonnesCo2e: prefillAudit.scope3.toFixed(3),
      totalTonnesCo2e: prefillAudit.total.toFixed(3),
      notes: prefillAudit.notes,
    });
    setOpen(true);
    onPrefillUsed?.();
  }, [prefillAudit]);

  const certBodies = useLookupStrings("carbon_certification_bodies", [
    "Carbon Trust", "BSI (PAS 2060)", "LRQA (Lloyd's Register)", "Bureau Veritas",
    "SGS UK", "Intertek", "ADAS", "SAC Consulting", "Agrecalc Carbon Assurance",
    "Farm Carbon Toolkit", "Carbon Footprint Ltd", "Soil Association (organic carbon)",
    "Agri Carbon", "Other",
  ]);

  const { data: audits = [], isLoading } = useQuery({
    queryKey: ["carbon-audits", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/carbon-audits`), { credentials: "include" }).then(r => r.json()),
  });
  const { data: staffList = [] } = useQuery<{ id?: number | null; memberId?: number | null; name: string; role?: string }[]>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()).then(d => d.staff ?? []),
  });
  const { data: auditorSuppliers = [] } = useQuery<ContractorSupplier[]>({
    queryKey: ["contractor-suppliers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/contractor-suppliers`), { credentials: "include" })
      .then(r => r.ok ? r.json() : { records: [] })
      .then(d => d.records ?? []),
  });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/carbon-audits/${editing.id}`) : api(`farms/${farmId}/carbon-audits`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["carbon-audits", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/carbon-audits/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-audits", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const isInternal = form.auditorType === "Internal staff member";
  const isExternal = form.auditorType === "External auditor / consultant";

  const chartData = (audits as Record<string, unknown>[])
    .filter(a => a.auditYear && a.totalTonnesCo2e != null)
    .sort((a, b) => Number(a.auditYear) - Number(b.auditYear))
    .map(a => ({
      year: String(a.auditYear),
      gross: a.totalTonnesCo2e != null ? parseFloat(String(a.totalTonnesCo2e)) : 0,
      net: a.netTonnesCo2e != null ? parseFloat(String(a.netTonnesCo2e)) : 0,
      seq: a.sequestrationTonnesCo2e != null ? parseFloat(String(a.sequestrationTonnesCo2e)) : 0,
    }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Carbon Audits</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="w-4 h-4 mr-1" />Import from FCT
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm({}); setAuditorMode("list"); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Audit
          </Button>
        </div>
      </div>
      <FctImportDialog open={showImport} farmId={farmId} onClose={() => setShowImport(false)} />

      {chartData.length >= 2 && (
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Year-on-Year Carbon Trend (tCO₂e)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="t" />
              <Tooltip formatter={(v: number, name: string) => [`${v.toFixed(1)} tCO₂e`, name]} contentStyle={{ fontSize: "0.8rem" }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: "0.75rem" }} />
              <Bar dataKey="gross" name="Gross Emissions" fill="#f97316" radius={[3, 3, 0, 0]} />
              <Bar dataKey="seq" name="Sequestration" fill="#22c55e" radius={[3, 3, 0, 0]} />
              <Bar dataKey="net" name="Net Emissions" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "auditYear", label: "Year" },
            { key: "auditDate", label: "Audit Date", fmt: r => fmtDate(r.auditDate) },
            { key: "conductedBy", label: "Conducted By" },
            { key: "auditorType", label: "Auditor Type" },
            { key: "auditTool", label: "Audit Tool" },
            { key: "verificationStatus", label: "Verification" },
            { key: "totalTonnesCo2e", label: "Total tCO₂e" },
            { key: "netTonnesCo2e", label: "Net tCO₂e" },
          ]}
          rows={audits as Record<string, unknown>[]}
          onView={setViewRecord}
          onEdit={r => {
            setEditing(r);
            setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)])));
            setAuditorMode(r.conductedBy && staffList.some((s) => s.name === r.conductedBy) ? "list" : "other");
            setCertBodyMode(r.certificationBody && certBodies.includes(String(r.certificationBody)) ? "list" : "other");
            setOpen(true);
          }}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      {/* ── View dialog ── */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "46rem" }}>
            <DialogHeader><DialogTitle>View Carbon Audit</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm max-h-[70vh] overflow-y-auto pr-1">

              <div className="col-span-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Audit Overview</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Audit Year</p><p className="font-medium">{String(viewRecord.auditYear ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Audit Date</p><p className="font-medium">{fmtDate(viewRecord.auditDate)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Audit Tool / Methodology</p><p className="font-medium">{String(viewRecord.auditTool ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Verification Status</p><p className="font-medium">{String(viewRecord.verificationStatus ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Supply Chain Customer</p><p className="font-medium">{String(viewRecord.supplyChainRequirement ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Certification Body</p><p className="font-medium">{String(viewRecord.certificationBody ?? "—")}</p></div>
                </div>
              </div>

              <div className="col-span-2 border-t pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Auditor</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-muted-foreground">Auditor Type</p><p className="font-medium">{String(viewRecord.auditorType ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground">Conducted By</p><p className="font-medium">{String(viewRecord.conductedBy ?? "—")}</p></div>
                  {!!viewRecord.auditorCompany && (
                    <div>
                      <p className="text-xs text-muted-foreground">Auditor Company</p>
                      <p className="font-medium">{String(viewRecord.auditorCompany)}</p>
                      {!!viewRecord.auditorSupplierId && <p className="text-xs text-muted-foreground mt-0.5">Linked to supplier record</p>}
                    </div>
                  )}
                  {!!viewRecord.linkedPoReference && (
                    <div>
                      <p className="text-xs text-muted-foreground">Linked PO Reference</p>
                      <p className="font-medium font-mono">{String(viewRecord.linkedPoReference)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-2 border-t pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Emissions Figures (tCO₂e)</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["Scope 1", viewRecord.totalScope1TonnesCo2e],
                    ["Scope 2", viewRecord.totalScope2TonnesCo2e],
                    ["Scope 3", viewRecord.totalScope3TonnesCo2e],
                    ["Gross Total", viewRecord.totalTonnesCo2e],
                    ["Sequestration", viewRecord.sequestrationTonnesCo2e],
                    ["Net Total", viewRecord.netTonnesCo2e],
                  ].map(([label, val]) => (
                    <div key={String(label)} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs text-muted-foreground">{String(label)}</p>
                      <p className="font-semibold text-base">{val != null && val !== "" ? String(val) : "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {!!(viewRecord.intensityPerTonneProd || viewRecord.reductionTargetPct) && (
                <div className="col-span-2 border-t pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    {!!viewRecord.intensityPerTonneProd && <div><p className="text-xs text-muted-foreground">Intensity per Tonne Produced</p><p className="font-medium">{String(viewRecord.intensityPerTonneProd)}</p></div>}
                    {!!viewRecord.reductionTargetPct && <div><p className="text-xs text-muted-foreground">Reduction Target (%)</p><p className="font-medium">{String(viewRecord.reductionTargetPct)}%</p></div>}
                  </div>
                </div>
              )}

              <div className="col-span-2 border-t pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Documents</p>
                <RecordAttachments farmId={farmId} recordType="carbon_audit_report" recordId={viewRecord.id as number} />
              </div>

              {!!viewRecord.notes && (
                <div className="col-span-2 border-t pt-2">
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="font-medium whitespace-pre-wrap">{String(viewRecord.notes)}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setEditing(viewRecord);
                setForm(Object.fromEntries(Object.entries(viewRecord).map(([k, v]) => [k, v == null ? "" : String(v)])));
                setAuditorMode(viewRecord.conductedBy && staffList.some((s) => s.name === viewRecord.conductedBy) ? "list" : "other");
                setCertBodyMode(viewRecord.certificationBody && certBodies.includes(String(viewRecord.certificationBody)) ? "list" : "other");
                setOpen(true);
                setViewRecord(null);
              }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Edit / create dialog ── */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm({}); } }}>
        <DialogContent style={{ maxWidth: "46rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Carbon Audit" : "Add Carbon Audit"}</DialogTitle></DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto pr-1 space-y-4">

            {/* ── Audit overview ── */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Audit Overview</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Audit Year *</Label>
                  <Select value={form.auditYear ?? ""} onValueChange={v => setForm(f => ({ ...f, auditYear: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                    <SelectContent>{EM_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Audit Date *</Label><Input type="date" value={form.auditDate ?? ""} onChange={e => setForm(f => ({ ...f, auditDate: e.target.value }))} /></div>
                <div>
                  <Label>Audit Tool / Methodology</Label>
                  <Select value={form.auditTool ?? ""} onValueChange={v => setForm(f => ({ ...f, auditTool: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select tool…" /></SelectTrigger>
                    <SelectContent>{AUDIT_TOOLS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Verification Status</Label>
                  <Select value={form.verificationStatus ?? ""} onValueChange={v => setForm(f => ({ ...f, verificationStatus: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select status…" /></SelectTrigger>
                    <SelectContent>{AUDIT_VERIFICATION_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Supply Chain Customer</Label>
                  <Select value={form.supplyChainRequirement ?? ""} onValueChange={v => setForm(f => ({ ...f, supplyChainRequirement: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select customer…" /></SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">{SR_CUSTOMERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Certification Body</Label>
                  <Select
                    value={certBodyMode === "other" ? "__other__" : (form.certificationBody ?? "")}
                    onValueChange={v => {
                      if (v === "__other__") { setCertBodyMode("other"); setForm(f => ({ ...f, certificationBody: "" })); return; }
                      setCertBodyMode("list"); setForm(f => ({ ...f, certificationBody: v }));
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select certification body…" /></SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {certBodies.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      <SelectItem value="__other__">Not listed / enter manually</SelectItem>
                    </SelectContent>
                  </Select>
                  {certBodyMode === "other" && (
                    <Input
                      className="mt-1.5"
                      value={form.certificationBody ?? ""}
                      onChange={e => setForm(f => ({ ...f, certificationBody: e.target.value }))}
                      placeholder="Enter certification body name…"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* ── Auditor section ── */}
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Auditor</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Auditor Type</Label>
                  <Select value={form.auditorType ?? ""} onValueChange={v => {
                    setForm(f => ({ ...f, auditorType: v, conductedBy: "", auditorStaffId: "", auditorCompany: "", auditorSupplierId: "", linkedPoReference: "" }));
                    setAuditorMode("list");
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                    <SelectContent>{AUDITOR_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                {isInternal && (
                  <>
                    {auditorMode === "list" ? (
                      <div>
                        <Label>Staff Member *</Label>
                        <Select
                          value={form.auditorStaffId ?? ""}
                          onValueChange={v => {
                            if (v === "__other__") { setAuditorMode("other"); setForm(f => ({ ...f, auditorStaffId: "", conductedBy: "" })); return; }
                            const m = staffList.find(s => String(s.id ?? s.memberId) === v);
                            setForm(f => ({ ...f, auditorStaffId: v, conductedBy: m?.name ?? "" }));
                          }}
                        >
                          <SelectTrigger><SelectValue placeholder="Select staff member…" /></SelectTrigger>
                          <SelectContent>
                            {staffList.map(s => {
                              const id = String(s.id ?? s.memberId);
                              return <SelectItem key={id} value={id}>{s.name}{s.role ? ` — ${s.role}` : ""}</SelectItem>;
                            })}
                            <SelectItem value="__other__">Not in list (enter name manually)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div>
                        <Label>Name *</Label>
                        <div className="flex gap-2">
                          <Input value={form.conductedBy ?? ""} onChange={e => setForm(f => ({ ...f, conductedBy: e.target.value }))} placeholder="Full name" />
                          <Button type="button" size="sm" variant="ghost" className="shrink-0 text-xs" onClick={() => setAuditorMode("list")}>← Back to list</Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {isExternal && (
                  <>
                    <div><Label>Auditor Name *</Label><Input value={form.conductedBy ?? ""} onChange={e => setForm(f => ({ ...f, conductedBy: e.target.value }))} placeholder="Individual name" /></div>
                    <div>
                      <Label>Auditor Company</Label>
                      {auditorSuppliers.length > 0 ? (
                        <>
                          <Select
                            value={form.auditorSupplierId ?? ""}
                            onValueChange={v => {
                              if (v === "__manual__") { setForm(f => ({ ...f, auditorSupplierId: "", auditorCompany: "" })); return; }
                              const s = auditorSuppliers.find(s => String(s.id) === v);
                              setForm(f => ({ ...f, auditorSupplierId: v, auditorCompany: s?.name ?? "" }));
                            }}
                          >
                            <SelectTrigger><SelectValue placeholder="Link to supplier…" /></SelectTrigger>
                            <SelectContent>
                              {auditorSuppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}{s.category ? ` (${s.category})` : ""}</SelectItem>)}
                              <SelectItem value="__manual__">Not in supplier list</SelectItem>
                            </SelectContent>
                          </Select>
                          {(!form.auditorSupplierId || form.auditorSupplierId === "__manual__") && (
                            <Input className="mt-1.5" value={form.auditorCompany ?? ""} onChange={e => setForm(f => ({ ...f, auditorCompany: e.target.value }))} placeholder="Company name (manual)" />
                          )}
                          {!!form.auditorSupplierId && form.auditorSupplierId !== "__manual__" && (
                            <p className="text-xs text-muted-foreground mt-1">Linked — enables PO / invoice matching</p>
                          )}
                        </>
                      ) : (
                        <Input value={form.auditorCompany ?? ""} onChange={e => setForm(f => ({ ...f, auditorCompany: e.target.value }))} placeholder="Company / organisation name" />
                      )}
                    </div>
                    <div>
                      <Label>Linked PO Reference</Label>
                      <Input value={form.linkedPoReference ?? ""} onChange={e => setForm(f => ({ ...f, linkedPoReference: e.target.value }))} placeholder="e.g. PO-2024-0142" />
                      <p className="text-xs text-muted-foreground mt-1">Optional — links the audit fee to a purchase order</p>
                    </div>
                  </>
                )}

                {!form.auditorType && (
                  <div className="col-span-2"><Label>Conducted By *</Label><Input value={form.conductedBy ?? ""} onChange={e => setForm(f => ({ ...f, conductedBy: e.target.value }))} placeholder="Name of auditor or organisation" /></div>
                )}
              </div>
            </div>

            {/* ── Emissions figures ── */}
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Emissions Figures (tCO₂e)</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["totalScope1TonnesCo2e", "Scope 1 tCO₂e"],
                  ["totalScope2TonnesCo2e", "Scope 2 tCO₂e"],
                  ["totalScope3TonnesCo2e", "Scope 3 tCO₂e"],
                  ["totalTonnesCo2e", "Gross Total tCO₂e"],
                  ["sequestrationTonnesCo2e", "Sequestration tCO₂e"],
                  ["netTonnesCo2e", "Net Total tCO₂e"],
                  ["intensityPerTonneProd", "Intensity per Tonne Produced"],
                  ["reductionTargetPct", "Reduction Target (%)"],
                ] as [string, string][]).map(([k, l]) => (
                  <div key={k}>
                    <Label>{l}</Label>
                    <Input type="number" step="0.001" value={form[k] ?? ""} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Document attachment ── */}
            {!!editing?.id && (
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Audit Report Document</p>
                <RecordAttachments farmId={farmId} recordType="carbon_audit_report" recordId={editing.id as number} />
              </div>
            )}
            {!editing?.id && (
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground italic">Save this audit first, then re-open to attach the report document.</p>
              </div>
            )}

            {/* ── Notes ── */}
            <div className="border-t pt-3">
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Additional context, caveats, methodology notes…" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Emissions taxonomy with DEFRA 2024 indicative conversion factors ──────────
const EM_YEARS = Array.from(
  { length: new Date().getFullYear() - 2014 },
  (_, i) => String(new Date().getFullYear() + 1 - i),
);

const EM_FACTOR_SOURCES = [
  "DEFRA UK GHG Conversion Factors 2024",
  "DEFRA UK GHG Conversion Factors 2023",
  "IPCC 2019 Guidelines",
  "AHDB Carbon Calculator",
  "Agrecalc",
  "Cool Farm Tool",
  "Other / manual",
];

type EmSubcat = { label: string; unit: string; factor?: number };
type EmCatDef = { scope: string; subcategories: EmSubcat[] };

const EMISSION_TAXONOMY: Record<string, EmCatDef> = {
  "Fuel & Energy": {
    scope: "Scope 1",
    subcategories: [
      { label: "Red diesel (Gas oil)",      unit: "litres",    factor: 0.002557 },
      { label: "White diesel (DERV)",       unit: "litres",    factor: 0.002542 },
      { label: "Petrol",                    unit: "litres",    factor: 0.002154 },
      { label: "LPG",                       unit: "litres",    factor: 0.001566 },
      { label: "Natural gas",               unit: "kWh",       factor: 0.000183 },
      { label: "Kerosene (heating)",        unit: "litres",    factor: 0.002530 },
      { label: "Grid electricity (Scope 2)", unit: "kWh",      factor: 0.000207 },
      { label: "Biogas / biomethane",       unit: "kWh",       factor: 0.000010 },
    ],
  },
  "Livestock Enteric Fermentation": {
    scope: "Scope 1",
    subcategories: [
      { label: "Dairy cows",   unit: "head·year", factor: 1.90  },
      { label: "Beef cattle",  unit: "head·year", factor: 1.20  },
      { label: "Sheep",        unit: "head·year", factor: 0.083 },
      { label: "Pigs",         unit: "head·year", factor: 0.035 },
      { label: "Poultry",      unit: "head·year", factor: 0.001 },
    ],
  },
  "Livestock Manure": {
    scope: "Scope 1",
    subcategories: [
      { label: "Dairy cows",            unit: "head·year", factor: 0.960  },
      { label: "Beef cattle",           unit: "head·year", factor: 0.460  },
      { label: "Sheep",                 unit: "head·year", factor: 0.032  },
      { label: "Pigs",                  unit: "head·year", factor: 0.420  },
      { label: "Poultry (broilers)",    unit: "head·year", factor: 0.006  },
      { label: "Cattle slurry storage", unit: "m³",        factor: 0.0015 },
    ],
  },
  "Soil & Fertiliser N₂O": {
    scope: "Scope 1",
    subcategories: [
      { label: "Synthetic N fertiliser — direct N₂O",     unit: "kg N", factor: 0.00440 },
      { label: "Organic N (slurry/FYM) — direct N₂O",    unit: "kg N", factor: 0.00220 },
      { label: "Crop residues — direct N₂O",              unit: "kg N", factor: 0.00220 },
      { label: "Indirect N₂O (leaching & run-off)",       unit: "kg N", factor: 0.00075 },
    ],
  },
  "Land Use Change": {
    scope: "Scope 1",
    subcategories: [
      { label: "Peat drainage — arable",    unit: "ha", factor: 10.50 },
      { label: "Peat drainage — grassland", unit: "ha", factor:  7.00 },
      { label: "Deforestation",             unit: "ha", factor: 55.00 },
    ],
  },
  "Purchased Inputs": {
    scope: "Scope 3",
    subcategories: [
      { label: "Synthetic N fertiliser (manufacture)", unit: "kg",      factor: 0.00448 },
      { label: "Compound fertiliser (manufacture)",    unit: "kg",      factor: 0.00200 },
      { label: "Pesticides / agrochemicals",           unit: "kg a.i.", factor: 0.00850 },
      { label: "Purchased animal feed",                unit: "tonne",   factor: 0.45    },
      { label: "Lime / ground limestone",              unit: "tonne",   factor: 0.140   },
      { label: "Plastic film & packaging",             unit: "kg",      factor: 0.00320 },
    ],
  },
  "Transport": {
    scope: "Scope 3",
    subcategories: [
      { label: "Road haulage — HGV",         unit: "tonne·km", factor: 0.0000820 },
      { label: "Road haulage — rigid lorry", unit: "tonne·km", factor: 0.0001100 },
      { label: "Employee car travel",        unit: "km",        factor: 0.0001700 },
      { label: "Air freight",                unit: "tonne·km", factor: 0.0006020 },
    ],
  },
  "Buildings & Infrastructure": {
    scope: "Scope 3",
    subcategories: [
      { label: "Concrete (embodied carbon)",   unit: "tonne", factor: 0.1070 },
      { label: "Steel (embodied carbon)",      unit: "tonne", factor: 1.770  },
      { label: "Timber (embodied carbon)",     unit: "m³",    factor: 0.0580 },
      { label: "Refrigerant leak — HFC-134a", unit: "kg",    factor: 1.300  },
      { label: "Refrigerant leak — R410A",    unit: "kg",    factor: 2.088  },
    ],
  },
  "Other": {
    scope: "Scope 3",
    subcategories: [
      { label: "Waste to landfill",    unit: "tonne", factor: 0.4670   },
      { label: "Water consumption",    unit: "m³",    factor: 0.000149 },
      { label: "Other (manual entry)", unit: "unit"                    },
    ],
  },
};

// ── Generate-from-records dialog ─────────────────────────────────────────────
type GeneratedSuggestion = {
  source: string;
  category: string;
  subcategory: string;
  scope: string;
  activityDescription: string;
  quantity: number;
  unit: string;
  emissionFactorSource: string;
  tonnesCo2e: number;
  dataPoints: number;
};

const SOURCE_COLOURS: Record<string, string> = {
  "Fuel & Energy":    "bg-orange-100 text-orange-700",
  "Grid Energy":      "bg-yellow-100 text-yellow-700",
  "Fertiliser (NVZ)": "bg-green-100 text-green-700",
  "Slurry & Manure":  "bg-amber-100 text-amber-700",
  "Livestock":        "bg-blue-100 text-blue-700",
};

function GenerateDialog({ farmId, onDone }: { farmId: number; onDone: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [year, setYear] = useState(String(new Date().getFullYear() - 1));
  const [preview, setPreview] = useState<GeneratedSuggestion[] | null>(null);
  const [existingCount, setExistingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [editedCo2e, setEditedCo2e] = useState<Record<number, string>>({});
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const hasRowErrors = Object.keys(rowErrors).length > 0;

  const fetchPreview = async () => {
    setLoading(true);
    setPreview(null);
    setSelected(new Set());
    setEditedCo2e({});
    setRowErrors({});
    try {
      const res = await fetch(api(`farms/${farmId}/carbon-emissions/preview?year=${year}`), { credentials: "include" });
      const data = await res.json();
      const suggs: GeneratedSuggestion[] = data.suggestions ?? [];
      setPreview(suggs);
      setExistingCount(data.existingCount ?? 0);
      setSelected(new Set(suggs.map((_: GeneratedSuggestion, i: number) => i)));
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!preview) return;
    setSaving(true);
    const chosen = preview
      .map((s, i) => ({ s, i }))
      .filter(({ i }) => selected.has(i));
    const submittedIdx = chosen.map(({ i }) => i);
    const records = chosen.map(({ s, i }) => ({
        emissionYear: parseInt(year),
        category: s.category,
        subcategory: s.subcategory,
        scope: s.scope,
        activityDescription: s.activityDescription,
        quantity: String(s.quantity),
        unit: s.unit,
        emissionFactorSource: s.emissionFactorSource,
        tonnesCo2e: editedCo2e[i] !== undefined ? editedCo2e[i] : String(s.tonnesCo2e),
      }));
    try {
      const res = await fetch(api(`farms/${farmId}/carbon-emissions/bulk`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ records }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      const data = await res.json().catch(() => ({}));
      if (data.rejectedCount > 0) {
        // Map rejected row numbers (1-based, in submission order) back to preview indices
        const errs: Record<number, string> = {};
        for (const rej of (data.rejected ?? []) as { row: number; reason: string }[]) {
          const pIdx = submittedIdx[rej.row - 1];
          if (pIdx !== undefined) errs[pIdx] = rej.reason.replace(/^Row \d+:\s*/, "");
        }
        setRowErrors(errs);
        setSelected(new Set(Object.keys(errs).map(Number)));
        qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] });
        toast({
          title: `${data.created ?? 0} record${data.created === 1 ? "" : "s"} added, ${data.rejectedCount} skipped`,
          description: "The skipped rows are highlighted below — fix them and re-submit.",
          variant: "destructive",
        });
        setSaving(false);
        return; // keep the dialog open so the failed rows can be fixed and retried
      }
      setSaving(false);
      onDone();
    } catch (err) {
      setSaving(false);
      toast({ title: "Import failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const selectedCount = selected.size;
  const totalCo2e = preview
    ? preview.reduce((sum, s, i) => {
        if (!selected.has(i)) return sum;
        const co2e = parseFloat(editedCo2e[i] ?? String(s.tonnesCo2e));
        return sum + (isNaN(co2e) ? 0 : co2e);
      }, 0)
    : 0;

  return (
    <Dialog open onOpenChange={onDone}>
      <DialogContent style={{ maxWidth: "58rem" }}>
        <DialogHeader>
          <DialogTitle>Generate Emissions Records from Farm Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Pulls activity data from Fuel &amp; Energy, NVZ Fertiliser, Slurry &amp; Manure, and Livestock modules and calculates indicative CO₂e using DEFRA 2024 factors. Review and adjust each line before confirming.
          </p>
          <div className="flex items-end gap-3">
            <div className="w-36">
              <Label>Year</Label>
              <Select value={year} onValueChange={v => { setYear(v); if (!hasRowErrors) setPreview(null); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EM_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={fetchPreview} disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Fetching…</> : "Fetch from records"}
            </Button>
          </div>

          {hasRowErrors && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <span className="font-medium">{Object.keys(rowErrors).length} row{Object.keys(rowErrors).length !== 1 ? "s were" : " was"} skipped.</span>{" "}
              They are highlighted below with the reason — correct the values (e.g. pick a valid year) and click Create to re-submit just those rows.
            </div>
          )}

          {preview !== null && existingCount > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              <span className="font-medium">Note:</span>
              <span>{existingCount} emission record{existingCount !== 1 ? "s" : ""} already exist for {year}. New records will be added alongside them, not replace them.</span>
            </div>
          )}

          {preview !== null && preview.length === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-4">
              No activity data found for {year} in the connected modules. Check that fuel usage, NVZ fertiliser, slurry, and livestock records have been entered for this year.
            </p>
          )}

          {preview !== null && preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {preview.length} suggestion{preview.length !== 1 ? "s" : ""} — <span className="font-medium text-foreground">{selectedCount} selected</span>
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground select-none">
                  <Checkbox
                    checked={selectedCount === preview.length && preview.length > 0}
                    onCheckedChange={(c) => {
                      if (c === true) setSelected(new Set(preview.map((_, i) => i)));
                      else setSelected(new Set());
                    }}
                  />
                  Select all
                </label>
              </div>
              <div className="rounded-md border overflow-auto max-h-80">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="p-2 w-8"></th>
                      <th className="p-2 text-left">Source</th>
                      <th className="p-2 text-left">Sub-category</th>
                      <th className="p-2 text-left">Activity description</th>
                      <th className="p-2 text-right">Quantity</th>
                      <th className="p-2 text-left w-20">Unit</th>
                      <th className="p-2 text-right w-32">tCO₂e ✎</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((s, i) => (
                      <tr key={i} className={`border-t transition-opacity ${rowErrors[i] ? "bg-red-50" : ""} ${selected.has(i) ? "" : "opacity-40"}`}>
                        <td className="p-2">
                          <Checkbox
                            checked={selected.has(i)}
                            onCheckedChange={(c) => setSelected(prev => {
                              const next = new Set(prev);
                              if (c === true) next.add(i); else next.delete(i);
                              return next;
                            })}
                          />
                        </td>
                        <td className="p-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${SOURCE_COLOURS[s.source] ?? "bg-muted text-muted-foreground"}`}>
                            {s.source}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="font-medium text-xs leading-tight">{s.subcategory || s.category}</div>
                          <div className="text-xs text-muted-foreground">{s.scope}</div>
                          {!!rowErrors[i] && <div className="text-xs text-red-600 font-medium mt-0.5">{rowErrors[i]}</div>}
                        </td>
                        <td className="p-2 text-xs text-muted-foreground max-w-xs">
                          <span className="line-clamp-2">{s.activityDescription}</span>
                        </td>
                        <td className="p-2 text-right tabular-nums text-xs">
                          {Number(s.quantity).toLocaleString("en-GB", { maximumFractionDigits: 1 })}
                        </td>
                        <td className="p-2 text-xs text-muted-foreground">{s.unit}</td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="0.0001"
                            className="h-7 text-right text-xs w-full"
                            value={editedCo2e[i] ?? s.tonnesCo2e.toFixed(4)}
                            onChange={e => setEditedCo2e(prev => ({ ...prev, [i]: e.target.value }))}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t font-semibold text-sm sticky bottom-0">
                    <tr>
                      <td colSpan={6} className="p-2 text-right">Total (selected):</td>
                      <td className="p-2 text-right tabular-nums">{totalCo2e.toFixed(3)} tCO₂e</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                Figures use DEFRA 2024 factors. Edit any tCO₂e value before confirming. Livestock figures reflect the current active population — adjust if the {year} herd differed significantly.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDone} disabled={saving}>Cancel</Button>
          {preview !== null && preview.length > 0 && (
            <Button onClick={confirm} disabled={saving || selectedCount === 0}>
              {saving
                ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Creating…</>
                : `Create ${selectedCount} record${selectedCount !== 1 ? "s" : ""}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmissionsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [generateOpen, setGenerateOpen] = useState(false);
  const [filterYear, setFilterYear] = useState("all");

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["carbon-emissions", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/carbon-emissions`), { credentials: "include" }).then(r => r.json()),
  });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/carbon-emissions`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] }); setOpen(false); setForm({}); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/carbon-emissions/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const { data: farmRec } = useQuery<Record<string, unknown>>({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(api(`farms/${farmId}`), { credentials: "include" }).then(r => r.json()).then(d => d.record),
  });

  const allRows = records as Record<string, unknown>[];
  const availableYears = Array.from(new Set(allRows.map(r => String(r.emissionYear)))).sort((a, b) => Number(b) - Number(a));
  const filteredRows = filterYear === "all" ? allRows : allRows.filter(r => String(r.emissionYear) === filterYear);
  const totalCo2e = filteredRows.reduce((sum, r) => sum + (parseFloat(String(r.tonnesCo2e ?? "0")) || 0), 0);

  function printEmissions() {
    const yearLabel = filterYear === "all" ? "All Years" : filterYear;
    const scopeOrder = ["Scope 1", "Scope 2", "Scope 3"];
    const rowsByScope: Record<string, Record<string, unknown>[]> = {};
    filteredRows.forEach(r => {
      const s = String(r.scope ?? "Other");
      if (!rowsByScope[s]) rowsByScope[s] = [];
      rowsByScope[s].push(r);
    });
    const allScopes = [
      ...scopeOrder.filter(s => rowsByScope[s]?.length),
      ...Object.keys(rowsByScope).filter(s => !scopeOrder.includes(s) && rowsByScope[s]?.length),
    ];
    let tableHtml = "";
    let grand = 0;
    allScopes.forEach(scope => {
      const rows = rowsByScope[scope];
      const scopeTotal = rows.reduce((s, r) => s + (parseFloat(String(r.tonnesCo2e ?? "0")) || 0), 0);
      grand += scopeTotal;
      tableHtml += `<div class="section-head">${scope}</div><table><thead><tr><th>Category</th><th>Sub-category</th><th>Activity</th><th>Year</th><th>Quantity</th><th>Unit</th><th style="text-align:right">tCO₂e</th></tr></thead><tbody>`;
      rows.forEach(r => {
        tableHtml += `<tr><td>${r.category ?? "—"}</td><td>${r.subcategory ?? "—"}</td><td>${r.activityDescription ?? "—"}</td><td>${r.emissionYear ?? "—"}</td><td>${r.quantity ?? "—"}</td><td>${r.unit ?? "—"}</td><td style="text-align:right;font-weight:600">${parseFloat(String(r.tonnesCo2e ?? "0")).toFixed(4)}</td></tr>`;
      });
      tableHtml += `</tbody><tfoot><tr style="background:#f0fdf4"><td colspan="6" style="text-align:right;font-weight:700;padding:4px 5px">${scope} Total</td><td style="text-align:right;font-weight:700;padding:4px 5px">${scopeTotal.toFixed(3)} tCO₂e</td></tr></tfoot></table>`;
    });
    tableHtml += `<table style="margin-top:12px"><tfoot><tr style="background:#1a3a1a"><td style="color:#fff;font-weight:700;padding:5px 6px">Grand Total — ${yearLabel}</td><td colspan="5"></td><td style="color:#fff;font-weight:700;text-align:right;padding:5px 6px">${grand.toFixed(3)} tCO₂e</td></tr></tfoot></table>`;
    printProReport({
      title: "Annual Carbon Emissions Summary",
      farmName: farmRec?.name as string | undefined,
      cphNumber: farmRec?.cphNumber as string | undefined,
      subtitle: `Year: ${yearLabel}`,
      recordCount: filteredRows.length,
      recordLabel: "emission record",
      tableHtml,
      footerNote: "DEFRA/IPCC emission factors applied. Verify totals with your carbon auditor before submission.",
      landscape: true,
    });
  }

  const catDef = form.category ? EMISSION_TAXONOMY[form.category] : null;
  const subcatDef = catDef?.subcategories.find(s => s.label === form.subcategory) ?? null;
  const calcCo2e = subcatDef?.factor != null && form.quantity
    ? (parseFloat(form.quantity) * subcatDef.factor).toFixed(4)
    : null;

  const handleCategoryChange = (v: string) => {
    const def = EMISSION_TAXONOMY[v];
    setForm(f => ({ ...f, category: v, subcategory: "", unit: "", scope: def?.scope ?? "", tonnesCo2e: "" }));
  };

  const handleSubcategoryChange = (v: string) => {
    const def = catDef?.subcategories.find(s => s.label === v);
    const newScope = v.includes("Scope 2") ? "Scope 2" : (catDef?.scope ?? "");
    setForm(f => {
      const qty = parseFloat(f.quantity);
      const co2e = def?.factor != null && !isNaN(qty) ? (qty * def.factor).toFixed(4) : f.tonnesCo2e;
      return { ...f, subcategory: v, unit: def?.unit ?? "", scope: newScope, tonnesCo2e: co2e };
    });
  };

  const handleQuantityChange = (v: string) => {
    setForm(f => {
      const qty = parseFloat(v);
      const factor = catDef?.subcategories.find(s => s.label === f.subcategory)?.factor;
      const co2e = factor != null && !isNaN(qty) ? (qty * factor).toFixed(4) : f.tonnesCo2e;
      return { ...f, quantity: v, tonnesCo2e: co2e };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">Emissions Records</h3>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          {filteredRows.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {filteredRows.length} record{filteredRows.length !== 1 ? "s" : ""}
              {" · "}
              <span className="font-semibold text-foreground">{totalCo2e.toFixed(3)} tCO₂e</span>
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={printEmissions} disabled={filteredRows.length === 0}>
            <Printer className="w-4 h-4 mr-1" />Print
          </Button>
          <Button size="sm" variant="outline" onClick={() => setGenerateOpen(true)}>
            <Sparkles className="w-4 h-4 mr-1" />Generate from records
          </Button>
          <Button size="sm" onClick={() => { setForm({}); setOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" />Add Record
          </Button>
        </div>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "emissionYear", label: "Year" },
            { key: "scope", label: "Scope" },
            { key: "category", label: "Category" },
            { key: "subcategory", label: "Sub-category" },
            { key: "activityDescription", label: "Activity" },
            { key: "quantity", label: "Qty" },
            { key: "unit", label: "Unit" },
            { key: "tonnesCo2e", label: "tCO₂e" },
          ]}
          rows={filteredRows}
          onView={setViewRecord}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Emissions Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Year</p><p className="font-medium">{String(viewRecord.emissionYear ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Scope</p><p className="font-medium">{String(viewRecord.scope ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p><p className="font-medium">{String(viewRecord.category ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sub-category</p><p className="font-medium">{String(viewRecord.subcategory ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Activity Description</p><p className="font-medium">{String(viewRecord.activityDescription ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity</p><p className="font-medium">{String(viewRecord.quantity ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Unit</p><p className="font-medium">{String(viewRecord.unit ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Emission Factor Source</p><p className="font-medium">{String(viewRecord.emissionFactorSource ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">tCO₂e</p><p className="font-medium">{String(viewRecord.tonnesCo2e ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>Emissions Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">

            {/* Year — dropdown */}
            <div>
              <Label>Year *</Label>
              <Select value={form.emissionYear ?? ""} onValueChange={v => setForm(f => ({ ...f, emissionYear: v }))}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{EM_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Scope — read-only, driven by category */}
            <div>
              <Label>Scope</Label>
              <div className="flex items-center h-9 px-3 rounded-md border bg-muted/40 text-sm gap-2">
                {form.scope
                  ? <><span className="font-medium">{form.scope}</span><span className="text-xs text-muted-foreground ml-1">(set from category)</span></>
                  : <span className="text-muted-foreground italic">Select a category first</span>}
              </div>
            </div>

            {/* Category */}
            <div>
              <Label>Category *</Label>
              <Select value={form.category ?? ""} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(EMISSION_TAXONOMY).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Sub-category — cascading from category */}
            <div>
              <Label>Sub-category</Label>
              <Select value={form.subcategory ?? ""} onValueChange={handleSubcategoryChange} disabled={!catDef}>
                <SelectTrigger>
                  <SelectValue placeholder={catDef ? "Select sub-category" : "Select a category first"} />
                </SelectTrigger>
                <SelectContent>
                  {catDef?.subcategories.map(s => <SelectItem key={s.label} value={s.label}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Activity description */}
            <div className="col-span-2">
              <Label>Activity Description *</Label>
              <Input
                value={form.activityDescription ?? ""}
                onChange={e => setForm(f => ({ ...f, activityDescription: e.target.value }))}
                placeholder="e.g. Tractor fleet — mixed arable operations 2024"
              />
            </div>

            {/* Quantity */}
            <div>
              <Label>Quantity</Label>
              <Input type="number" step="0.001" value={form.quantity ?? ""} onChange={e => handleQuantityChange(e.target.value)} placeholder="0.000" />
            </div>

            {/* Unit — auto-filled from sub-category */}
            <div>
              <Label>Unit</Label>
              <div className="flex items-center h-9 px-3 rounded-md border bg-muted/40 text-sm">
                {form.unit
                  ? <span className="font-medium">{form.unit}</span>
                  : <span className="text-muted-foreground italic">Set by sub-category</span>}
              </div>
            </div>

            {/* Emission Factor Source — dropdown */}
            <div>
              <Label>Emission Factor Source</Label>
              <Select value={form.emissionFactorSource ?? ""} onValueChange={v => setForm(f => ({ ...f, emissionFactorSource: v }))}>
                <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                <SelectContent>{EM_FACTOR_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* tCO₂e — auto-calculated, manually overridable */}
            <div>
              <Label>tCO₂e *</Label>
              <Input
                type="number"
                step="0.0001"
                value={form.tonnesCo2e ?? ""}
                onChange={e => setForm(f => ({ ...f, tonnesCo2e: e.target.value }))}
                placeholder="0.0000"
              />
              {calcCo2e && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Indicative: {calcCo2e} tCO₂e (qty × DEFRA 2024 factor)
                  {form.tonnesCo2e && form.tonnesCo2e !== calcCo2e && (
                    <button
                      type="button"
                      className="ml-1 text-primary underline"
                      onClick={() => setForm(f => ({ ...f, tonnesCo2e: calcCo2e }))}
                    >
                      use this
                    </button>
                  )}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Input value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {generateOpen && (
        <GenerateDialog
          farmId={farmId}
          onDone={() => {
            setGenerateOpen(false);
            qc.invalidateQueries({ queryKey: ["carbon-emissions", farmId] });
          }}
        />
      )}
    </div>
  );
}

// Sequestration feature types with indicative annual sequestration factors
const SEQ_FEATURES: Record<string, { unit: string; factorTco2ePerUnit?: number }> = {
  "Woodland":            { unit: "ha",  factorTco2ePerUnit: 3.50 },
  "Hedgerow":            { unit: "km",  factorTco2ePerUnit: 0.34 },
  "Peatland":            { unit: "ha",  factorTco2ePerUnit: 5.50 },
  "Permanent Grassland": { unit: "ha",  factorTco2ePerUnit: 0.50 },
  "Wildflower Meadow":   { unit: "ha",  factorTco2ePerUnit: 0.30 },
  "Riparian Buffer":     { unit: "ha",  factorTco2ePerUnit: 1.20 },
  "Agroforestry":        { unit: "ha",  factorTco2ePerUnit: 1.50 },
  "Other":               { unit: "ha" },
};

const SEQ_FACTOR_SOURCES = [...EM_FACTOR_SOURCES, "Woodland Carbon Code", "Peatland Code"];

type SeqSuggestion = {
  source: string;
  featureType: string;
  featureName: string;
  quantity: number;
  unit: string;
  factorTco2ePerUnit: number;
  tonnesCo2eSequestered: number;
  sequestrationFactorSource: string;
};

const SEQ_SOURCE_COLOURS: Record<string, string> = {
  "Environmental Features": "bg-emerald-100 text-emerald-700",
  "Field Season Land Use":  "bg-lime-100 text-lime-700",
};

function GenerateSeqDialog({ farmId, onDone }: { farmId: number; onDone: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [year, setYear] = useState(String(new Date().getFullYear() - 1));
  const [preview, setPreview] = useState<SeqSuggestion[] | null>(null);
  const [existingCount, setExistingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [editedCo2e, setEditedCo2e] = useState<Record<number, string>>({});
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});
  const hasRowErrors = Object.keys(rowErrors).length > 0;

  const fetchPreview = async () => {
    setLoading(true);
    setPreview(null);
    setSelected(new Set());
    setEditedCo2e({});
    setRowErrors({});
    try {
      const res = await fetch(api(`farms/${farmId}/carbon-sequestration/preview?year=${year}`), { credentials: "include" });
      const data = await res.json();
      const suggs: SeqSuggestion[] = data.suggestions ?? [];
      setPreview(suggs);
      setExistingCount(data.existingCount ?? 0);
      setSelected(new Set(suggs.map((_: SeqSuggestion, i: number) => i)));
    } finally {
      setLoading(false);
    }
  };

  const confirm = async () => {
    if (!preview) return;
    setSaving(true);
    const chosen = preview
      .map((s, i) => ({ s, i }))
      .filter(({ i }) => selected.has(i));
    const submittedIdx = chosen.map(({ i }) => i);
    const records = chosen.map(({ s, i }) => ({
        sequestrationYear: parseInt(year),
        featureType: s.featureType,
        featureName: s.featureName,
        areaHaOrLengthM: String(s.quantity),
        unit: s.unit,
        tonnesCo2eSequestered: editedCo2e[i] !== undefined ? editedCo2e[i] : String(s.tonnesCo2eSequestered),
        sequestrationFactorSource: s.sequestrationFactorSource,
      }));
    try {
      const res = await fetch(api(`farms/${farmId}/carbon-sequestration/bulk`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ records }),
      }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
      const data = await res.json().catch(() => ({}));
      if (data.rejectedCount > 0) {
        const errs: Record<number, string> = {};
        for (const rej of (data.rejected ?? []) as { row: number; reason: string }[]) {
          const pIdx = submittedIdx[rej.row - 1];
          if (pIdx !== undefined) errs[pIdx] = rej.reason.replace(/^Row \d+:\s*/, "");
        }
        setRowErrors(errs);
        setSelected(new Set(Object.keys(errs).map(Number)));
        qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] });
        toast({
          title: `${data.created ?? 0} record${data.created === 1 ? "" : "s"} added, ${data.rejectedCount} skipped`,
          description: "The skipped rows are highlighted below — fix them and re-submit.",
          variant: "destructive",
        });
        setSaving(false);
        return; // keep the dialog open so the failed rows can be fixed and retried
      }
      setSaving(false);
      onDone();
    } catch (err) {
      setSaving(false);
      toast({ title: "Import failed", description: err instanceof Error ? err.message : undefined, variant: "destructive" });
    }
  };

  const selectedCount = selected.size;
  const totalSeq = preview
    ? preview.reduce((sum, s, i) => {
        if (!selected.has(i)) return sum;
        const v = parseFloat(editedCo2e[i] ?? String(s.tonnesCo2eSequestered));
        return sum + (isNaN(v) ? 0 : v);
      }, 0)
    : 0;

  const toggleAll = () => {
    if (!preview) return;
    if (selected.size === preview.length) setSelected(new Set());
    else setSelected(new Set(preview.map((_, i) => i)));
  };

  return (
    <Dialog open onOpenChange={onDone}>
      <DialogContent style={{ maxWidth: "58rem" }}>
        <DialogHeader>
          <DialogTitle>Generate Sequestration Records from Farm Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Reads your Environmental Features register and Field Season Land Use records and calculates indicative annual sequestration using recognised UK factors (Woodland Carbon Code, Peatland Code, DEFRA agri-environment guidance). Review and adjust each line before confirming.
          </p>
          <div className="flex items-end gap-3">
            <div className="w-36">
              <Label>Year</Label>
              <Select value={year} onValueChange={v => { setYear(v); if (!hasRowErrors) setPreview(null); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EM_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={fetchPreview} disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Scanning…</> : "Preview"}
            </Button>
          </div>

          {hasRowErrors && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <span className="font-medium">{Object.keys(rowErrors).length} row{Object.keys(rowErrors).length !== 1 ? "s were" : " was"} skipped.</span>{" "}
              They are highlighted below with the reason — correct the values (e.g. pick a valid year) and click Create to re-submit just those rows.
            </div>
          )}

          {existingCount > 0 && (
            <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
              <span>⚠</span>
              <span>There {existingCount === 1 ? "is" : "are"} already <strong>{existingCount}</strong> sequestration record{existingCount !== 1 ? "s" : ""} for {year}. Confirming will add to them — check for duplicates.</span>
            </div>
          )}

          {preview !== null && preview.length === 0 && (
            <div className="text-sm text-muted-foreground italic py-4 text-center">
              No mappable features found for {year}. Add features in the Environmental Features module, or record land use in Fields &amp; Crops with types such as "Woodland", "Hedgerow", or "Permanent Grassland".
            </div>
          )}

          {preview !== null && preview.length > 0 && (
            <div className="space-y-2">
              <div className="overflow-x-auto rounded-lg border max-h-80 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left w-8">
                        <Checkbox checked={selectedCount === preview.length} onCheckedChange={toggleAll} />
                      </th>
                      <th className="p-2 text-left">Source</th>
                      <th className="p-2 text-left">Feature Type</th>
                      <th className="p-2 text-left">Feature / Field Name</th>
                      <th className="p-2 text-right">Area / Length</th>
                      <th className="p-2 text-left">Unit</th>
                      <th className="p-2 text-right">tCO₂e / yr</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((s, i) => (
                      <tr key={i} className={`border-t ${rowErrors[i] ? "bg-red-50" : ""} ${!selected.has(i) ? "opacity-40" : ""}`}>
                        <td className="p-2">
                          <Checkbox checked={selected.has(i)} onCheckedChange={c => setSelected(prev => { const n = new Set(prev); c ? n.add(i) : n.delete(i); return n; })} />
                        </td>
                        <td className="p-2">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${SEQ_SOURCE_COLOURS[s.source] ?? "bg-muted text-muted-foreground"}`}>{s.source}</span>
                        </td>
                        <td className="p-2 font-medium">
                          {s.featureType}
                          {!!rowErrors[i] && <div className="text-xs text-red-600 font-normal mt-0.5">{rowErrors[i]}</div>}
                        </td>
                        <td className="p-2 text-muted-foreground max-w-[14rem] truncate">{s.featureName || "—"}</td>
                        <td className="p-2 text-right tabular-nums">{s.quantity.toFixed(3)}</td>
                        <td className="p-2 text-muted-foreground">{s.unit}</td>
                        <td className="p-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.001"
                            className="h-7 text-right text-xs w-24 border rounded px-1"
                            value={editedCo2e[i] ?? s.tonnesCo2eSequestered.toFixed(3)}
                            onChange={e => setEditedCo2e(prev => ({ ...prev, [i]: e.target.value }))}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/30 border-t font-semibold text-sm sticky bottom-0">
                    <tr>
                      <td colSpan={6} className="p-2 text-right">Total (selected):</td>
                      <td className="p-2 text-right tabular-nums">{totalSeq.toFixed(3)} tCO₂e / yr</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                Factors: Woodland 3.5 tCO₂e/ha, Hedgerow 0.34 tCO₂e/km, Peatland 5.5 tCO₂e/ha, Permanent Grassland 0.5 tCO₂e/ha, Wildflower Meadow 0.3 tCO₂e/ha, Riparian Buffer 1.2 tCO₂e/ha, Agroforestry 1.5 tCO₂e/ha. Edit any value before confirming.
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onDone} disabled={saving}>Cancel</Button>
          {preview !== null && preview.length > 0 && (
            <Button onClick={confirm} disabled={saving || selectedCount === 0}>
              {saving
                ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Creating…</>
                : `Create ${selectedCount} record${selectedCount !== 1 ? "s" : ""}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SequestrationTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [generateOpen, setGenerateOpen] = useState(false);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["carbon-seq", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/carbon-sequestration`), { credentials: "include" }).then(r => r.json()),
  });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/carbon-sequestration/${editing.id}`) : api(`farms/${farmId}/carbon-sequestration`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/carbon-sequestration/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const { data: farmRec } = useQuery<Record<string, unknown>>({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(api(`farms/${farmId}`), { credentials: "include" }).then(r => r.json()).then(d => d.record),
  });

  const [filterYear, setFilterYear] = useState("all");
  const allSeqRows = records as Record<string, unknown>[];
  const seqYears = Array.from(new Set(allSeqRows.map(r => String(r.sequestrationYear)))).sort((a, b) => Number(b) - Number(a));
  const filteredSeqRows = filterYear === "all" ? allSeqRows : allSeqRows.filter(r => String(r.sequestrationYear) === filterYear);
  const totalSeq = filteredSeqRows.reduce((sum, r) => sum + (parseFloat(String(r.tonnesCo2eSequestered ?? "0")) || 0), 0);

  const featDef = form.featureType ? SEQ_FEATURES[form.featureType] : null;
  const calcSeq = featDef?.factorTco2ePerUnit != null && form.areaHaOrLengthM
    ? (parseFloat(form.areaHaOrLengthM) * featDef.factorTco2ePerUnit).toFixed(3)
    : null;

  const handleFeatureTypeChange = (v: string) => {
    const def = SEQ_FEATURES[v];
    setForm(f => {
      const qty = parseFloat(f.areaHaOrLengthM);
      const seq = def?.factorTco2ePerUnit != null && !isNaN(qty) ? (qty * def.factorTco2ePerUnit).toFixed(3) : f.tonnesCo2eSequestered;
      return { ...f, featureType: v, unit: def?.unit ?? "ha", tonnesCo2eSequestered: seq };
    });
  };

  const handleAreaChange = (v: string) => {
    setForm(f => {
      const qty = parseFloat(v);
      const factor = featDef?.factorTco2ePerUnit;
      const seq = factor != null && !isNaN(qty) ? (qty * factor).toFixed(3) : f.tonnesCo2eSequestered;
      return { ...f, areaHaOrLengthM: v, tonnesCo2eSequestered: seq };
    });
  };

  function handleOpen(editRec?: Record<string, unknown>) {
    if (editRec) {
      setEditing(editRec);
      setForm(Object.fromEntries(Object.entries(editRec).map(([k, v]) => [k, v == null ? "" : String(v)])));
    } else {
      setEditing(null);
      setForm({});
    }
    setOpen(true);
  }

  function printSequestration() {
    const yearLabel = filterYear === "all" ? "All Years" : filterYear;
    const featureOrder = Object.keys(SEQ_FEATURES);
    const rowsByType: Record<string, Record<string, unknown>[]> = {};
    filteredSeqRows.forEach(r => {
      const t = String(r.featureType ?? "Other");
      if (!rowsByType[t]) rowsByType[t] = [];
      rowsByType[t].push(r);
    });
    const allTypes = [
      ...featureOrder.filter(t => rowsByType[t]?.length),
      ...Object.keys(rowsByType).filter(t => !featureOrder.includes(t) && rowsByType[t]?.length),
    ];
    let tableHtml = "";
    let grand = 0;
    allTypes.forEach(type => {
      const rows = rowsByType[type];
      const typeTotal = rows.reduce((s, r) => s + (parseFloat(String(r.tonnesCo2eSequestered ?? "0")) || 0), 0);
      grand += typeTotal;
      tableHtml += `<div class="section-head">${type}</div><table><thead><tr><th>Year</th><th>Feature Name</th><th>Area / Length</th><th>Unit</th><th>Factor Source</th><th style="text-align:right">tCO₂e Sequestered</th></tr></thead><tbody>`;
      rows.forEach(r => {
        tableHtml += `<tr><td>${r.sequestrationYear ?? "—"}</td><td>${r.featureName ?? "—"}</td><td>${r.areaHaOrLengthM ?? "—"}</td><td>${r.unit ?? "—"}</td><td>${r.sequestrationFactorSource ?? "—"}</td><td style="text-align:right;font-weight:600">${parseFloat(String(r.tonnesCo2eSequestered ?? "0")).toFixed(3)}</td></tr>`;
      });
      tableHtml += `</tbody><tfoot><tr style="background:#f0fdf4"><td colspan="5" style="text-align:right;font-weight:700;padding:4px 5px">${type} Total</td><td style="text-align:right;font-weight:700;padding:4px 5px">${typeTotal.toFixed(3)} tCO₂e</td></tr></tfoot></table>`;
    });
    tableHtml += `<table style="margin-top:12px"><tfoot><tr style="background:#1a3a1a"><td style="color:#fff;font-weight:700;padding:5px 6px">Grand Total Sequestered — ${yearLabel}</td><td colspan="4"></td><td style="color:#fff;font-weight:700;text-align:right;padding:5px 6px">${grand.toFixed(3)} tCO₂e</td></tr></tfoot></table>`;
    printProReport({
      title: "Carbon Sequestration Summary",
      farmName: farmRec?.name as string | undefined,
      cphNumber: farmRec?.cphNumber as string | undefined,
      subtitle: `Year: ${yearLabel}`,
      recordCount: filteredSeqRows.length,
      recordLabel: "sequestration record",
      tableHtml,
      footerNote: "Sequestration estimates based on DEFRA / Woodland Carbon Code / Peatland Code factors. Independent verification recommended.",
      landscape: true,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-sm">Carbon Sequestration</h3>
          <Select value={filterYear} onValueChange={setFilterYear}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {seqYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          {filteredSeqRows.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {filteredSeqRows.length} record{filteredSeqRows.length !== 1 ? "s" : ""}
              {" · "}
              <span className="font-semibold text-foreground">{totalSeq.toFixed(3)} tCO₂e sequestered</span>
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={printSequestration} disabled={filteredSeqRows.length === 0}>
            <Printer className="w-4 h-4 mr-1" />Print
          </Button>
          <Button size="sm" variant="outline" onClick={() => setGenerateOpen(true)}>
            <Sparkles className="w-4 h-4 mr-1" />Generate from records
          </Button>
          <Button size="sm" onClick={() => handleOpen()}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable cols={[
          { key: "sequestrationYear", label: "Year" },
          { key: "featureType", label: "Feature Type" },
          { key: "featureName", label: "Feature" },
          { key: "areaHaOrLengthM", label: "Area/Length" },
          { key: "unit", label: "Unit" },
          { key: "tonnesCo2eSequestered", label: "tCO₂e Sequestered" },
        ]} rows={filteredSeqRows} onView={setViewRecord} onEdit={r => handleOpen(r)} onDelete={r => del.mutate(r.id as number)} />
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Sequestration Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Year</p><p className="font-medium">{String(viewRecord.sequestrationYear ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Feature Type</p><p className="font-medium">{String(viewRecord.featureType ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Feature Name</p><p className="font-medium">{String(viewRecord.featureName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Area/Length</p><p className="font-medium">{String(viewRecord.areaHaOrLengthM ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Unit</p><p className="font-medium">{String(viewRecord.unit ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">tCO₂e Sequestered</p><p className="font-medium">{String(viewRecord.tonnesCo2eSequestered ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Sequestration Factor Source</p><p className="font-medium">{String(viewRecord.sequestrationFactorSource ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter><Button onClick={() => setViewRecord(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Sequestration Record" : "Add Sequestration Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">

            {/* Year */}
            <div>
              <Label>Year *</Label>
              <Select value={form.sequestrationYear ?? ""} onValueChange={v => setForm(f => ({ ...f, sequestrationYear: v }))}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{EM_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Feature Type — drives unit and calculation */}
            <div>
              <Label>Feature Type *</Label>
              <Select value={form.featureType ?? ""} onValueChange={handleFeatureTypeChange}>
                <SelectTrigger><SelectValue placeholder="Select feature" /></SelectTrigger>
                <SelectContent>{Object.keys(SEQ_FEATURES).map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Feature Name */}
            <div className="col-span-2">
              <Label>Feature Name</Label>
              <Input value={form.featureName ?? ""} onChange={e => setForm(f => ({ ...f, featureName: e.target.value }))} placeholder="e.g. North Wood, Boundary Hedge A" />
            </div>

            {/* Area / Length — triggers auto-calc */}
            <div>
              <Label>Area / Length</Label>
              <Input type="number" step="0.001" value={form.areaHaOrLengthM ?? ""} onChange={e => handleAreaChange(e.target.value)} placeholder="0.000" />
            </div>

            {/* Unit — auto-filled from feature type */}
            <div>
              <Label>Unit</Label>
              <div className="flex items-center h-9 px-3 rounded-md border bg-muted/40 text-sm">
                {form.unit ? <span className="font-medium">{form.unit}</span> : <span className="text-muted-foreground italic">Set by feature type</span>}
              </div>
            </div>

            {/* tCO₂e Sequestered — auto-calculated, overridable */}
            <div>
              <Label>tCO₂e Sequestered *</Label>
              <Input
                type="number"
                step="0.001"
                value={form.tonnesCo2eSequestered ?? ""}
                onChange={e => setForm(f => ({ ...f, tonnesCo2eSequestered: e.target.value }))}
                placeholder="0.000"
              />
              {calcSeq && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  Indicative: {calcSeq} tCO₂e (area × WCC/DEFRA factor)
                  {form.tonnesCo2eSequestered && form.tonnesCo2eSequestered !== calcSeq && (
                    <button type="button" className="ml-1 text-primary underline" onClick={() => setForm(f => ({ ...f, tonnesCo2eSequestered: calcSeq }))}>use this</button>
                  )}
                </p>
              )}
            </div>

            {/* Sequestration Factor Source — dropdown */}
            <div>
              <Label>Sequestration Factor Source</Label>
              <Select value={form.sequestrationFactorSource ?? ""} onValueChange={v => setForm(f => ({ ...f, sequestrationFactorSource: v }))}>
                <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                <SelectContent>{SEQ_FACTOR_SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Input value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {generateOpen && (
        <GenerateSeqDialog
          farmId={farmId}
          onDone={() => {
            setGenerateOpen(false);
            qc.invalidateQueries({ queryKey: ["carbon-seq", farmId] });
          }}
        />
      )}
    </div>
  );
}

// ─── Reduction Actions constants ──────────────────────────────────────────────
const RA_CATEGORIES = [
  "Renewable Energy", "Energy Efficiency", "Fertiliser Reduction",
  "Livestock Feed", "Woodland Planting", "Wetland Restoration",
  "Transport Efficiency", "Equipment Upgrade", "Soil Management",
  "Waste Reduction", "Other",
];
const RA_STATUSES = [
  { v: "planned",     l: "Planned" },
  { v: "in-progress", l: "In Progress" },
  { v: "completed",   l: "Completed" },
  { v: "cancelled",   l: "Cancelled" },
];
const RA_TARGET_SOURCES = [
  "Carbon audit report",
  "Scheme requirement document",
  "Internal target",
  "Advisor recommendation",
  "Other",
];
const RA_FUNDING_TYPES = [
  "Own farm funds",
  "Government grant",
  "Agri-environment scheme",
  "Third-party / charity funding",
  "Loan / finance",
];
const RA_CONTRACTOR_TYPES = [
  "External contractor / firm",
  "Internal staff member",
  "Not yet confirmed",
];

type StaffMember = { id?: number | null; memberId?: number | null; name: string; role?: string };
type ContractorSupplier = { id: number; name: string; category?: string | null; contactName?: string | null; phone?: string | null; email?: string | null };

function ReductionActionsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [responsibleMode, setResponsibleMode] = useState<"list" | "other">("list");

  const { data: actions = [], isLoading } = useQuery({
    queryKey: ["carbon-actions", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/carbon-reduction-actions`), { credentials: "include" }).then(r => r.json()),
  });
  const { data: staffList = [] } = useQuery<StaffMember[]>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()).then(d => d.staff ?? []),
  });
  const { data: contractorSuppliers = [] } = useQuery<ContractorSupplier[]>({
    queryKey: ["contractor-suppliers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/contractor-suppliers`), { credentials: "include" })
      .then(r => r.ok ? r.json() : { records: [] })
      .then(d => d.records ?? []),
  });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/carbon-reduction-actions/${editing.id}`) : api(`farms/${farmId}/carbon-reduction-actions`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["carbon-actions", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/carbon-reduction-actions/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["carbon-actions", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const [filterStatus, setFilterStatus] = useState("all");
  const { data: farmRec } = useQuery<Record<string, unknown>>({
    queryKey: ["farm", farmId],
    queryFn: () => fetch(api(`farms/${farmId}`), { credentials: "include" }).then(r => r.json()).then(d => d.record),
  });
  const allActions = actions as Record<string, unknown>[];
  const filteredActions = filterStatus === "all" ? allActions : allActions.filter(a => String(a.status ?? "") === filterStatus);

  function printActions() {
    const statusLabel = filterStatus === "all" ? "All Statuses" : filterStatus.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    let tableHtml = `<table><thead><tr><th>Action</th><th>Category</th><th>Description</th><th>Status</th><th style="text-align:right">Target tCO₂e</th><th>Planned Start</th><th>Target Date</th><th>Responsible</th><th>Funding</th></tr></thead><tbody>`;
    filteredActions.forEach(a => {
      const status = String(a.status ?? "—").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const startDate = a.plannedStartDate ? new Date(a.plannedStartDate as string).toLocaleDateString("en-GB") : "—";
      const endDate = a.plannedCompletionDate ? new Date(a.plannedCompletionDate as string).toLocaleDateString("en-GB") : "—";
      tableHtml += `<tr><td style="font-weight:600">${a.actionTitle ?? "—"}</td><td>${a.category ?? "—"}</td><td>${a.description ?? "—"}</td><td>${status}</td><td style="text-align:right">${a.targetReductionTonnesCo2e ?? "—"}</td><td>${startDate}</td><td>${endDate}</td><td>${a.responsiblePerson ?? "—"}</td><td>${a.fundingType ?? "—"}</td></tr>`;
    });
    const totalTarget = filteredActions.reduce((s, a) => s + (parseFloat(String(a.targetReductionTonnesCo2e ?? "0")) || 0), 0);
    tableHtml += `</tbody><tfoot><tr style="background:#1a3a1a"><td style="color:#fff;font-weight:700;padding:5px 6px" colspan="4">Total Target Reduction</td><td style="color:#fff;font-weight:700;text-align:right;padding:5px 6px">${totalTarget.toFixed(3)} tCO₂e</td><td colspan="4"></td></tr></tfoot></table>`;
    printProReport({
      title: "Carbon Reduction Action Plan",
      farmName: farmRec?.name as string | undefined,
      cphNumber: farmRec?.cphNumber as string | undefined,
      subtitle: `Status: ${statusLabel}`,
      recordCount: filteredActions.length,
      recordLabel: "action",
      tableHtml,
      footerNote: "Review and update reduction actions regularly as part of your farm carbon management strategy.",
      landscape: true,
    });
  }

  const isExternalFunding  = form.fundingType && form.fundingType !== "Own farm funds";
  const showGrantFields    = isExternalFunding && form.fundingType !== "Loan / finance";
  const isExternalDoc      = form.targetSourceType && form.targetSourceType !== "Internal target";
  const isExternalContractor = form.contractorType === "External contractor / firm";
  const isInternalContractor = form.contractorType === "Internal staff member";

  const fundingNameLabel = form.fundingType === "Government grant"       ? "Grant name"
    : form.fundingType === "Agri-environment scheme"                     ? "Scheme name"
    : form.fundingType === "Third-party / charity funding"               ? "Funder name"
    : form.fundingType === "Loan / finance"                              ? "Lender / bank name"
    : "Name / reference";
  const fundingRefLabel  = form.fundingType === "Government grant"       ? "Grant reference number"
    : form.fundingType === "Agri-environment scheme"                     ? "Agreement / scheme reference"
    : "Reference number";

  const handleOpen = (editRec?: Record<string, unknown>) => {
    if (editRec) {
      setEditing(editRec);
      const f = Object.fromEntries(Object.entries(editRec).map(([k, v]) => [k, v == null ? "" : String(v)]));
      setForm(f);
      const nameInList = staffList.some((s: StaffMember) => s.name === (editRec.responsiblePerson as string));
      setResponsibleMode(editRec.responsiblePerson && !nameInList ? "other" : "list");
    } else {
      setEditing(null);
      setForm({ status: "planned" });
      setResponsibleMode("list");
    }
    setOpen(true);
  };

  const f = (key: string) => form[key] ?? "";
  const sf = (key: string) => (v: string) => setForm(prev => ({ ...prev, [key]: v }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">Carbon Reduction Actions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Plan and track actions to reduce the holding's carbon footprint. Record who is responsible, how the work is funded, and who will carry it out.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={printActions} disabled={filteredActions.length === 0}>
            <Printer className="w-4 h-4 mr-1" />Print Plan
          </Button>
          <Button size="sm" onClick={() => handleOpen()}><Plus className="w-4 h-4 mr-1" />Add Action</Button>
        </div>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "actionTitle", label: "Action" },
            { key: "category", label: "Category" },
            { key: "targetReductionTonnesCo2e", label: "Target tCO₂e" },
            { key: "status", label: "Status", fmt: r => String(r.status ?? "").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) },
            { key: "plannedCompletionDate", label: "Target Date", fmt: r => fmtDate(r.plannedCompletionDate) },
            { key: "responsiblePerson", label: "Responsible" },
            { key: "fundingType", label: "Funding" },
          ]}
          rows={filteredActions}
          onView={setViewRecord}
          onEdit={r => handleOpen(r)}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      {/* ── View dialog ── */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "44rem" }}>
            <DialogHeader><DialogTitle>Reduction Action</DialogTitle></DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Action</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Title</p><p className="font-medium">{String(viewRecord.actionTitle ?? "—")}</p></div>
                <div><p className="text-xs text-muted-foreground">Category</p><p className="font-medium">{String(viewRecord.category ?? "—")}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><p className="font-medium">{String(viewRecord.status ?? "—").replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Description</p><p className="font-medium">{String(viewRecord.description ?? "—")}</p></div>

                <div className="col-span-2 border-t pt-2"><p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Carbon Target</p></div>
                <div><p className="text-xs text-muted-foreground">Target Reduction (tCO₂e)</p><p className="font-medium">{String(viewRecord.targetReductionTonnesCo2e ?? "—")}</p></div>
                <div><p className="text-xs text-muted-foreground">Target Source</p><p className="font-medium">{String(viewRecord.targetSourceType ?? "—")}</p></div>

                <div className="col-span-2 border-t pt-2"><p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Responsible Person</p></div>
                <div className="col-span-2"><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{String(viewRecord.responsiblePerson ?? "—")}</p></div>

                <div className="col-span-2 border-t pt-2"><p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Timeline & Cost</p></div>
                <div><p className="text-xs text-muted-foreground">Planned Start</p><p className="font-medium">{fmtDate(viewRecord.plannedStartDate)}</p></div>
                <div><p className="text-xs text-muted-foreground">Planned Completion</p><p className="font-medium">{fmtDate(viewRecord.plannedCompletionDate)}</p></div>
                <div><p className="text-xs text-muted-foreground">Estimated Cost (£)</p><p className="font-medium">{String(viewRecord.estimatedCost ?? "—")}</p></div>

                <div className="col-span-2 border-t pt-2"><p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Funding</p></div>
                <div><p className="text-xs text-muted-foreground">Funding Type</p><p className="font-medium">{String(viewRecord.fundingType ?? viewRecord.fundingSource ?? "—")}</p></div>
                {!!viewRecord.fundingGrantName && <div><p className="text-xs text-muted-foreground">Grant / Scheme Name</p><p className="font-medium">{String(viewRecord.fundingGrantName)}</p></div>}
                {!!viewRecord.fundingGrantReference && <div><p className="text-xs text-muted-foreground">Reference</p><p className="font-medium">{String(viewRecord.fundingGrantReference)}</p></div>}

                {!!(viewRecord.contractorName || viewRecord.contractorType || viewRecord.contractorCompany) && (
                  <>
                    <div className="col-span-2 border-t pt-2"><p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Contractor</p></div>
                    <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium">{String(viewRecord.contractorType ?? "—")}</p></div>
                    {!!viewRecord.contractorName && <div><p className="text-xs text-muted-foreground">Name</p><p className="font-medium">{String(viewRecord.contractorName)}</p></div>}
                    {!!viewRecord.contractorCompany && (
                      <div>
                        <p className="text-xs text-muted-foreground">Company</p>
                        <p className="font-medium">{String(viewRecord.contractorCompany)}</p>
                        {!!viewRecord.contractorSupplierId && <p className="text-xs text-muted-foreground mt-0.5">Linked to supplier record</p>}
                      </div>
                    )}
                    {!!viewRecord.linkedPoReference && (
                      <div>
                        <p className="text-xs text-muted-foreground">Linked PO Reference</p>
                        <p className="font-medium font-mono">{String(viewRecord.linkedPoReference)}</p>
                      </div>
                    )}
                  </>
                )}

                {!!viewRecord.notes && (
                  <div className="col-span-2 border-t pt-2"><p className="text-xs text-muted-foreground">Notes</p><p className="font-medium">{String(viewRecord.notes)}</p></div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { handleOpen(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Edit / Add dialog ── */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setEditing(null); }}>
        <DialogContent style={{ maxWidth: "46rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Reduction Action</DialogTitle></DialogHeader>
          <div className="max-h-[78vh] overflow-y-auto pr-1 space-y-0">
            <div className="grid grid-cols-2 gap-3">

              {/* ── Action ── */}
              <div className="col-span-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Action</p>
              </div>
              <div className="col-span-2">
                <Label>Action Title *</Label>
                <Input value={f("actionTitle")} onChange={e => sf("actionTitle")(e.target.value)} />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={f("category")} onValueChange={sf("category")}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {RA_CATEGORIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={f("status") || "planned"} onValueChange={sf("status")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RA_STATUSES.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea value={f("description")} onChange={e => sf("description")(e.target.value)} rows={2} />
              </div>

              {/* ── Carbon Target ── */}
              <div className="col-span-2 border-t pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Carbon Target</p>
                <p className="text-xs text-muted-foreground">The target reduction in tonnes of CO₂ equivalent. This figure should come from a carbon audit, scheme agreement, or advisor recommendation — not estimated.</p>
              </div>
              <div>
                <Label>Target Reduction (tCO₂e)</Label>
                <Input type="number" step="0.001" value={f("targetReductionTonnesCo2e")} onChange={e => sf("targetReductionTonnesCo2e")(e.target.value)} placeholder="e.g. 12.500" />
              </div>
              <div>
                <Label>Source of this figure</Label>
                <Select value={f("targetSourceType")} onValueChange={sf("targetSourceType")}>
                  <SelectTrigger><SelectValue placeholder="Where did this figure come from?" /></SelectTrigger>
                  <SelectContent>
                    {RA_TARGET_SOURCES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {isExternalDoc && (
                <div className="col-span-2">
                  {editing ? (
                    <RecordAttachments farmId={farmId} recordType="carbon_action_target_doc" recordId={editing.id as number} />
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Save this record first to attach the source document (audit report, scheme letter, etc.).</p>
                  )}
                </div>
              )}

              {/* ── Responsible Person ── */}
              <div className="col-span-2 border-t pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Responsible Person</p>
                <p className="text-xs text-muted-foreground">The person at this holding who is accountable for ensuring this action is delivered — typically the farm manager or business owner.</p>
              </div>
              <div className="col-span-2">
                <Label>Select from staff</Label>
                <Select
                  value={responsibleMode === "other" ? "__other__" : (f("responsiblePerson") || "")}
                  onValueChange={v => {
                    if (v === "__other__") {
                      setResponsibleMode("other");
                      setForm(prev => ({ ...prev, responsiblePerson: "" }));
                    } else {
                      setResponsibleMode("list");
                      setForm(prev => ({ ...prev, responsiblePerson: v }));
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select a staff member…" /></SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {staffList.map((s: StaffMember) => (
                      <SelectItem key={s.name} value={s.name}>
                        {s.name}{s.role ? ` (${s.role})` : ""}
                      </SelectItem>
                    ))}
                    <SelectItem value="__other__">Other / not in list</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {responsibleMode === "other" && (
                <div className="col-span-2">
                  <Label>Name</Label>
                  <Input value={f("responsiblePerson")} onChange={e => sf("responsiblePerson")(e.target.value)} placeholder="Full name" />
                </div>
              )}

              {/* ── Timeline & Cost ── */}
              <div className="col-span-2 border-t pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Timeline & Cost</p>
              </div>
              <div>
                <Label>Planned Start</Label>
                <Input type="date" value={f("plannedStartDate")} onChange={e => sf("plannedStartDate")(e.target.value)} />
              </div>
              <div>
                <Label>Planned Completion</Label>
                <Input type="date" value={f("plannedCompletionDate")} onChange={e => sf("plannedCompletionDate")(e.target.value)} />
              </div>
              <div>
                <Label>Estimated Cost (£)</Label>
                <Input type="number" step="0.01" value={f("estimatedCost")} onChange={e => sf("estimatedCost")(e.target.value)} />
              </div>

              {/* ── Funding ── */}
              <div className="col-span-2 border-t pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Funding</p>
              </div>
              <div className="col-span-2">
                <Label>Funding Type</Label>
                <Select value={f("fundingType")} onValueChange={sf("fundingType")}>
                  <SelectTrigger><SelectValue placeholder="How will this be funded?" /></SelectTrigger>
                  <SelectContent>
                    {RA_FUNDING_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {isExternalFunding && (
                <>
                  <div>
                    <Label>{fundingNameLabel}</Label>
                    <Input value={f("fundingGrantName")} onChange={e => sf("fundingGrantName")(e.target.value)} />
                  </div>
                  {showGrantFields && (
                    <div>
                      <Label>{fundingRefLabel}</Label>
                      <Input value={f("fundingGrantReference")} onChange={e => sf("fundingGrantReference")(e.target.value)} />
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Funding agreement / grant offer letter</p>
                    {editing ? (
                      <RecordAttachments farmId={farmId} recordType="carbon_action_funding_doc" recordId={editing.id as number} />
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Save this record first to attach the funding agreement document.</p>
                    )}
                  </div>
                </>
              )}

              {/* ── Contractor ── */}
              <div className="col-span-2 border-t pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Contractor / Who will do the work?</p>
                <p className="text-xs text-muted-foreground">The person or firm physically carrying out this work — which may be different from the responsible person above.</p>
              </div>
              <div className="col-span-2">
                <Label>Contractor type</Label>
                <Select value={f("contractorType")} onValueChange={sf("contractorType")}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {RA_CONTRACTOR_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {isInternalContractor && (
                <div className="col-span-2">
                  <Label>Staff member carrying out the work</Label>
                  <Select value={f("contractorName")} onValueChange={sf("contractorName")}>
                    <SelectTrigger><SelectValue placeholder="Select a staff member…" /></SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {staffList.map((s: StaffMember) => (
                        <SelectItem key={s.name} value={s.name}>
                          {s.name}{s.role ? ` (${s.role})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {isExternalContractor && (
                <>
                  {/* Supplier lookup — populated from the holding's suppliers list */}
                  {contractorSuppliers.length > 0 && (
                    <div className="col-span-2">
                      <Label>Select from approved suppliers</Label>
                      <Select
                        value={f("contractorSupplierId") || "__other__"}
                        onValueChange={v => {
                          if (v === "__other__") {
                            setForm(prev => ({ ...prev, contractorSupplierId: "", contractorCompany: "", contractorName: "" }));
                          } else {
                            const sup = contractorSuppliers.find((s: ContractorSupplier) => String(s.id) === v);
                            setForm(prev => ({
                              ...prev,
                              contractorSupplierId: v,
                              contractorCompany: sup?.name ?? "",
                              contractorName: sup?.contactName ?? prev.contractorName ?? "",
                            }));
                          }
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select a supplier…" /></SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {contractorSuppliers.map((s: ContractorSupplier) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                              {s.name}{s.category ? ` — ${s.category}` : ""}
                            </SelectItem>
                          ))}
                          <SelectItem value="__other__">Not in list (enter manually)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-0.5">Linking to a supplier enables POs and invoices to be matched to this action.</p>
                    </div>
                  )}
                  {/* Show manual fields when no supplier selected or list is empty */}
                  {(!f("contractorSupplierId") || f("contractorSupplierId") === "__other__") && (
                    <>
                      <div>
                        <Label>Contractor / individual name</Label>
                        <Input value={f("contractorName")} onChange={e => sf("contractorName")(e.target.value)} placeholder="Name or trading name" />
                      </div>
                      <div>
                        <Label>Company / firm</Label>
                        <Input value={f("contractorCompany")} onChange={e => sf("contractorCompany")(e.target.value)} placeholder="Registered company name" />
                      </div>
                    </>
                  )}
                  {/* Linked PO reference — shown whenever an external contractor is set */}
                  <div className="col-span-2">
                    <Label>Linked PO reference</Label>
                    <Input value={f("linkedPoReference")} onChange={e => sf("linkedPoReference")(e.target.value)} placeholder="e.g. PO-2024-0042" />
                    <p className="text-xs text-muted-foreground mt-0.5">Enter the purchase order number raised for this contractor's work so invoices can be matched.</p>
                  </div>
                </>
              )}

              {/* ── Notes ── */}
              <div className="col-span-2 border-t pt-3">
                <Label>Notes</Label>
                <Textarea value={f("notes")} onChange={e => sf("notes")(e.target.value)} rows={2} />
              </div>

            </div>
          </div>
          <DialogFooter className="mt-3">
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sustainability Reports constants ────────────────────────────────────────
const SR_CERTIFYING_BODIES = [
  "Red Tractor Assurance",
  "LEAF Marque",
  "Soil Association",
  "Organic Farmers & Growers",
  "Woodland Carbon Code",
  "Peatland Code",
  "Countryside Stewardship (Natural England)",
  "SFI (Sustainable Farming Incentive)",
  "Farm Carbon Toolkit",
  "Agrecalc",
  "Cool Farm Alliance",
  "RCMS",
  "Other",
];

const SR_CUSTOMERS = [
  "Tesco", "Sainsbury's", "ASDA / Walmart", "M&S (Marks & Spencer)",
  "Waitrose / John Lewis Partnership", "Co-op", "Morrisons", "Aldi UK", "Lidl GB",
  "McDonald's UK", "ABP Food Group", "Cargill UK", "Müller UK", "Arla Foods UK",
  "Saputo Dairy UK", "AHDB Benchmarking", "Red Tractor Assurance",
  "LEAF (Linking Environment And Farming)", "Other",
];
const SR_REPORT_TYPES = [
  "Agrecalc", "Cool Farm Tool", "Farm Carbon Cutting Toolkit (FCCT)",
  "AHDB GHG Calculator", "Red Tractor Sustainability Assessment",
  "LEAF Marque Assessment", "Retailer Bespoke Format", "Other",
];
const SR_STATUS_OPTIONS = [
  { v: "draft",                 l: "Draft" },
  { v: "ready",                 l: "Ready to Submit" },
  { v: "submitted",             l: "Submitted" },
  { v: "acknowledged",          l: "Acknowledged" },
  { v: "resubmission_required", l: "Resubmission Required" },
  { v: "completed",             l: "Completed" },
];
const SR_SUBMISSION_METHODS = ["Email", "Retailer Portal", "Post", "Hand Delivery", "Other"];
const srStatusLabel = (v: unknown) =>
  SR_STATUS_OPTIONS.find(o => o.v === String(v ?? ""))?.l ?? String(v ?? "—");

function ReportsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["sustainability-reports", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/sustainability-reports`), { credentials: "include" }).then(r => r.json()),
  });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/sustainability-reports/${editing.id}`) : api(`farms/${farmId}/sustainability-reports`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sustainability-reports", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/sustainability-reports/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sustainability-reports", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const { data: reportSuppliers = [] } = useQuery<ContractorSupplier[]>({
    queryKey: ["contractor-suppliers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/contractor-suppliers`), { credentials: "include" })
      .then(r => r.ok ? r.json() : { records: [] })
      .then(d => d.records ?? []),
  });
  const { data: schemeRecords = [] } = useQuery<{ id: number; schemeName: string; agreementNumber: string; type: string }[]>({
    queryKey: ["scheme-records", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/scheme-records`), { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(d => Array.isArray(d) ? d : []),
  });

  // Auto-calculate net position from emissions minus sequestration
  const calcNetPosition = (() => {
    const em = parseFloat(String(form.totalEmissionsTonnesCo2e ?? ""));
    const seq = parseFloat(String(form.sequestrationTonnesCo2e ?? "0"));
    return !isNaN(em) ? (em - (isNaN(seq) ? 0 : seq)).toFixed(3) : null;
  })();

  // Suggest a title from year + type + customer
  const suggestedTitle = [form.reportYear, form.reportType, form.supplyChainCustomer].filter(Boolean).join(" — ");

  const handleOpen = (editRec?: Record<string, unknown>) => {
    if (editRec) {
      setEditing(editRec);
      setForm(Object.fromEntries(
        Object.entries(editRec).map(([k, v]) => [k, v == null ? "" : typeof v === "boolean" ? v : String(v)])
      ) as Record<string, string | boolean>);
    } else {
      setEditing(null);
      setForm({ status: "draft", submittedToCustomer: false });
    }
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Sustainability Report Submissions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Track carbon and sustainability reports submitted to supply chain customers — retailers, processors, and certification bodies.</p>
        </div>
        <Button size="sm" onClick={() => handleOpen()}><Plus className="w-4 h-4 mr-1" />Add Report</Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "reportYear", label: "Year" },
            { key: "reportTitle", label: "Title" },
            { key: "reportType", label: "Type" },
            { key: "supplyChainCustomer", label: "Customer" },
            { key: "deadlineDate", label: "Deadline", fmt: r => fmtDate(r.deadlineDate) },
            { key: "status", label: "Status", fmt: r => srStatusLabel(r.status) },
            { key: "submittedToCustomer", label: "Submitted", fmt: r => r.submittedToCustomer ? "Yes" : "No" },
            { key: "netPositionTonnesCo2e", label: "Net Position (tCO₂e)" },
          ]}
          rows={reports as Record<string, unknown>[]}
          onView={setViewRecord}
          onEdit={r => handleOpen(r)}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      {/* View dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "48rem" }}>
            <DialogHeader>
              <DialogTitle>
                {String(viewRecord.reportYear ?? "")} — {String(viewRecord.supplyChainCustomer ?? "Sustainability Report")}
                <span className="ml-2 text-sm font-normal text-muted-foreground">{srStatusLabel(viewRecord.status)}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Report Title</p><p className="font-medium">{String(viewRecord.reportTitle ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Report Type</p><p className="font-medium">{String(viewRecord.reportType ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Generated Date</p><p className="font-medium">{fmtDate(viewRecord.generatedDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Supply Chain Customer</p><p className="font-medium">{String(viewRecord.supplyChainCustomer ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Contact at Customer</p><p className="font-medium">{String(viewRecord.contactNameAtCustomer ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Customer Deadline</p><p className="font-medium">{fmtDate(viewRecord.deadlineDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Submission Method</p><p className="font-medium">{String(viewRecord.submissionMethod ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Submitted to Customer</p><p className="font-medium">{viewRecord.submittedToCustomer ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Submission Date</p><p className="font-medium">{fmtDate(viewRecord.submissionDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Customer Reference</p><p className="font-medium">{String(viewRecord.customerReference ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Acknowledged Date</p><p className="font-medium">{fmtDate(viewRecord.acknowledgedDate)}</p></div>
              {!!(viewRecord.preparedBy || viewRecord.certifyingBody || viewRecord.certificateReference || viewRecord.preparedBySupplierId || viewRecord.preparedByPoReference || viewRecord.preparedByInvoiceRef) && (
                <div className="col-span-2 border-t pt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Prepared By</p>
                    <p className="font-medium">{String(viewRecord.preparedBy ?? "—")}</p>
                    {!!viewRecord.preparedBySupplierId && <p className="text-xs text-muted-foreground mt-0.5">Linked to supplier record</p>}
                  </div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">PO Reference</p><p className="font-medium">{String(viewRecord.preparedByPoReference ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Reference</p><p className="font-medium">{String(viewRecord.preparedByInvoiceRef ?? "—")}</p></div>
                  <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certifying / Issuing Body</p><p className="font-medium">{String(viewRecord.certifyingBody ?? "—")}</p></div>
                  <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate / Reference No.</p><p className="font-medium">{String(viewRecord.certificateReference ?? "—")}</p></div>
                </div>
              )}
              <div className="col-span-2 border-t pt-3 grid grid-cols-3 gap-3">
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Emissions (tCO₂e)</p><p className="font-medium">{String(viewRecord.totalEmissionsTonnesCo2e ?? "—")}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sequestration (tCO₂e)</p><p className="font-medium">{String(viewRecord.sequestrationTonnesCo2e ?? "—")}</p></div>
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net Position (tCO₂e)</p><p className="font-medium">{String(viewRecord.netPositionTonnesCo2e ?? "—")}</p></div>
              </div>
              <div className="col-span-2 border-t pt-3">
                <RecordAttachments farmId={farmId} recordType="sustainability_report" recordId={viewRecord.id as number} />
              </div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { handleOpen(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setEditing(null); }}>
        <DialogContent style={{ maxWidth: "46rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Sustainability Report</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">

            {/* Year + Status */}
            <div>
              <Label>Report Year *</Label>
              <Select value={String(form.reportYear ?? "")} onValueChange={v => setForm(f => ({ ...f, reportYear: v }))}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{EM_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={String(form.status ?? "draft")} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SR_STATUS_OPTIONS.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Report Type + Generated Date */}
            <div>
              <Label>Report Type *</Label>
              <Select value={String(form.reportType ?? "")} onValueChange={v => setForm(f => ({ ...f, reportType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select tool / format" /></SelectTrigger>
                <SelectContent>{SR_REPORT_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Generated Date *</Label>
              <Input type="date" value={String(form.generatedDate ?? "")} onChange={e => setForm(f => ({ ...f, generatedDate: e.target.value }))} />
            </div>

            {/* Report Title — auto-suggested */}
            <div className="col-span-2">
              <Label>Report Title *</Label>
              <Input
                value={String(form.reportTitle ?? "")}
                onChange={e => setForm(f => ({ ...f, reportTitle: e.target.value }))}
                placeholder={suggestedTitle || "e.g. 2024 Agrecalc Carbon Report — Tesco"}
              />
              {suggestedTitle && !form.reportTitle && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Suggested:{" "}
                  <button type="button" className="text-primary underline" onClick={() => setForm(f => ({ ...f, reportTitle: suggestedTitle }))}>
                    {suggestedTitle}
                  </button>
                </p>
              )}
            </div>

            {/* Customer details */}
            <div>
              <Label>Supply Chain Customer</Label>
              <Select value={String(form.supplyChainCustomer ?? "")} onValueChange={v => setForm(f => ({ ...f, supplyChainCustomer: v }))}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">{SR_CUSTOMERS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Contact at Customer</Label>
              <Input value={String(form.contactNameAtCustomer ?? "")} onChange={e => setForm(f => ({ ...f, contactNameAtCustomer: e.target.value }))} placeholder="Name / team" />
            </div>
            <div>
              <Label>Customer Deadline</Label>
              <Input type="date" value={String(form.deadlineDate ?? "")} onChange={e => setForm(f => ({ ...f, deadlineDate: e.target.value }))} />
            </div>

            {/* Submission tracking */}
            <div className="flex items-center gap-2 mt-5">
              <Checkbox id="sr-sub" checked={Boolean(form.submittedToCustomer)} onCheckedChange={v => setForm(f => ({ ...f, submittedToCustomer: Boolean(v) }))} />
              <Label htmlFor="sr-sub">Submitted to customer?</Label>
            </div>
            <div>
              <Label>Submission Method</Label>
              <Select value={String(form.submissionMethod ?? "")} onValueChange={v => setForm(f => ({ ...f, submissionMethod: v }))}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>{SR_SUBMISSION_METHODS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Submission Date</Label>
              <Input type="date" value={String(form.submissionDate ?? "")} onChange={e => setForm(f => ({ ...f, submissionDate: e.target.value }))} />
            </div>
            <div>
              <Label>Customer Reference</Label>
              <Input value={String(form.customerReference ?? "")} onChange={e => setForm(f => ({ ...f, customerReference: e.target.value }))} />
            </div>
            <div>
              <Label>Acknowledged Date</Label>
              <Input type="date" value={String(form.acknowledgedDate ?? "")} onChange={e => setForm(f => ({ ...f, acknowledgedDate: e.target.value }))} />
            </div>

            {/* Report source / preparer */}
            <div className="col-span-2 border-t pt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Report Source</p>
              <div className="grid grid-cols-2 gap-3">

                {/* Prepared By — supplier lookup */}
                <div className="col-span-2">
                  <Label>Prepared By</Label>
                  {reportSuppliers.length > 0 ? (
                    <>
                      <Select
                        value={String(form.preparedBySupplierId ?? "")}
                        onValueChange={v => {
                          if (v === "__manual__") { setForm(f => ({ ...f, preparedBySupplierId: "", preparedBy: "" })); return; }
                          const s = reportSuppliers.find(s => String(s.id) === v);
                          setForm(f => ({ ...f, preparedBySupplierId: v, preparedBy: s?.name ?? "" }));
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select from suppliers…" /></SelectTrigger>
                        <SelectContent>
                          {reportSuppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}{s.category ? ` (${s.category})` : ""}</SelectItem>)}
                          <SelectItem value="__manual__">Not in supplier list</SelectItem>
                        </SelectContent>
                      </Select>
                      {(!form.preparedBySupplierId || form.preparedBySupplierId === "__manual__") && (
                        <Input className="mt-1.5" value={String(form.preparedBy ?? "")} onChange={e => setForm(f => ({ ...f, preparedBy: e.target.value }))} placeholder="Company / organisation name" />
                      )}
                      {!!form.preparedBySupplierId && form.preparedBySupplierId !== "__manual__" && (
                        <p className="text-xs text-muted-foreground mt-1">Linked to supplier — enables PO / invoice matching</p>
                      )}
                    </>
                  ) : (
                    <Input value={String(form.preparedBy ?? "")} onChange={e => setForm(f => ({ ...f, preparedBy: e.target.value }))} placeholder="Organisation / consultant name" />
                  )}
                </div>

                {/* PO + Invoice refs */}
                <div>
                  <Label>Purchase Order Ref.</Label>
                  <Input value={String(form.preparedByPoReference ?? "")} onChange={e => setForm(f => ({ ...f, preparedByPoReference: e.target.value }))} placeholder="e.g. PO-2024-0142" />
                </div>
                <div>
                  <Label>Invoice Ref.</Label>
                  <Input value={String(form.preparedByInvoiceRef ?? "")} onChange={e => setForm(f => ({ ...f, preparedByInvoiceRef: e.target.value }))} placeholder="Invoice number" />
                </div>

                {/* Certifying Body — predefined dropdown */}
                <div>
                  <Label>Certifying / Issuing Body</Label>
                  <Select value={String(form.certifyingBody ?? "")} onValueChange={v => setForm(f => ({ ...f, certifyingBody: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select body…" /></SelectTrigger>
                    <SelectContent>{SR_CERTIFYING_BODIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>

                {/* Certificate / Reference No. — with scheme auto-populate */}
                <div>
                  <Label>Certificate / Reference No.</Label>
                  {schemeRecords.length > 0 && (
                    <Select
                      value=""
                      onValueChange={v => {
                        const s = schemeRecords.find(r => String(r.id) + r.type === v);
                        if (!s) return;
                        setForm(f => ({
                          ...f,
                          certificateReference: String(s.agreementNumber ?? ""),
                          ...(f.certifyingBody ? {} : { certifyingBody: String(s.schemeName ?? "") }),
                        }));
                      }}
                    >
                      <SelectTrigger className="mb-1.5 h-8 text-xs">
                        <SelectValue placeholder="Auto-fill from a scheme record…" />
                      </SelectTrigger>
                      <SelectContent>
                        {schemeRecords.map(s => (
                          <SelectItem key={`${s.type}-${s.id}`} value={String(s.id) + s.type}>
                            {s.schemeName} — {s.agreementNumber} ({s.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Input value={String(form.certificateReference ?? "")} onChange={e => setForm(f => ({ ...f, certificateReference: e.target.value }))} placeholder="Agreement / certificate reference" />
                </div>

              </div>
            </div>

            {/* Key metrics */}
            <div className="col-span-2 border-t pt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Key Metrics from Report</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Total Emissions (tCO₂e)</Label>
                  <Input type="number" step="0.001" value={String(form.totalEmissionsTonnesCo2e ?? "")}
                    onChange={e => {
                      const em = parseFloat(e.target.value);
                      const seq = parseFloat(String(form.sequestrationTonnesCo2e ?? "0"));
                      const net = !isNaN(em) ? (em - (isNaN(seq) ? 0 : seq)).toFixed(3) : String(form.netPositionTonnesCo2e ?? "");
                      setForm(f => ({ ...f, totalEmissionsTonnesCo2e: e.target.value, netPositionTonnesCo2e: net }));
                    }} placeholder="0.000" />
                </div>
                <div>
                  <Label>Sequestration (tCO₂e)</Label>
                  <Input type="number" step="0.001" value={String(form.sequestrationTonnesCo2e ?? "")}
                    onChange={e => {
                      const seq = parseFloat(e.target.value);
                      const em = parseFloat(String(form.totalEmissionsTonnesCo2e ?? ""));
                      const net = !isNaN(em) ? (em - (isNaN(seq) ? 0 : seq)).toFixed(3) : String(form.netPositionTonnesCo2e ?? "");
                      setForm(f => ({ ...f, sequestrationTonnesCo2e: e.target.value, netPositionTonnesCo2e: net }));
                    }} placeholder="0.000" />
                </div>
                <div>
                  <Label>Net Position (tCO₂e)</Label>
                  <Input type="number" step="0.001" value={String(form.netPositionTonnesCo2e ?? "")}
                    onChange={e => setForm(f => ({ ...f, netPositionTonnesCo2e: e.target.value }))}
                    placeholder="Auto-calculated" />
                  {calcNetPosition && String(form.netPositionTonnesCo2e) !== calcNetPosition && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      = {calcNetPosition} tCO₂e{" "}
                      <button type="button" className="text-primary underline" onClick={() => setForm(f => ({ ...f, netPositionTonnesCo2e: calcNetPosition }))}>use this</button>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Attachments — only available once the record has been saved */}
            {editing && (
              <div className="col-span-2 border-t pt-2">
                <RecordAttachments farmId={farmId} recordType="sustainability_report" recordId={editing.id as number} />
              </div>
            )}
            {!editing && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground italic">Save the report first, then open it to attach documents.</p>
              </div>
            )}

            {/* Notes */}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => save.mutate(form as Record<string, unknown>)} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const TECH_TYPE_MAP: Record<string, string> = {
  solar_pv: "Solar PV", wind_turbine: "Wind Turbine", hydro: "Hydro",
  biomass_boiler: "Biomass Boiler", anaerobic_digester: "Anaerobic Digestion (AD)",
  ground_source_heat_pump: "Ground Source Heat Pump", air_source_heat_pump: "Air Source Heat Pump",
  other: "Other",
};
const UK_GRID_KG_CO2E_PER_KWH = 0.207;

function RenewableEnergyTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ time: string; created: number } | null>(null);
  const hasSyncedRef = useRef(false);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["renewable-energy", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/renewable-energy-production`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []),
  });
  const { data: installations = [], isLoading: instLoading } = useQuery({
    queryKey: ["solar-installations", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/solar-installations`), { credentials: "include" }).then(r => r.json()).then(d => Array.isArray(d) ? d : (d.records ?? [])),
  });
  const { data: generationReadings = [], isLoading: genLoading } = useQuery({
    queryKey: ["solar-generation", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/solar-generation`), { credentials: "include" }).then(r => r.json()).then(d => Array.isArray(d) ? d : (d.records ?? [])),
  });

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/renewable-energy-production/${editing.id}`) : api(`farms/${farmId}/renewable-energy-production`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["renewable-energy", farmId] }); setOpen(false); setForm({}); setEditing(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/renewable-energy-production/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["renewable-energy", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const doSync = async (force = false) => {
    if (!installations.length && !generationReadings.length) { setSyncStatus({ time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), created: 0 }); return; }
    setSyncing(true);
    let created = 0;
    try {
      type InstRow = { id: number; installationName: string; technologyType: string; installedCapacityKw?: number; tariffRatePence?: number; fitOrSegContractRef?: string };
      type GenRow = { id: number; installationId: number; readingDate: string; generationKwh?: number; exportKwh?: number; selfConsumedKwh?: number; fitPaymentAmount?: number };
      type CarbonRow = { systemName?: string; productionYear?: number | string };

      const instMap = new Map<number, InstRow>();
      (installations as InstRow[]).forEach(i => instMap.set(i.id, i));

      type Group = { installationId: number; year: number; readings: GenRow[] };
      const groups = new Map<string, Group>();
      (generationReadings as GenRow[]).forEach(g => {
        if (!g.readingDate) return;
        const year = new Date(g.readingDate).getFullYear();
        const key = `${g.installationId}_${year}`;
        if (!groups.has(key)) groups.set(key, { installationId: g.installationId, year, readings: [] });
        groups.get(key)!.readings.push(g);
      });

      const existingKeys = new Set(
        (records as CarbonRow[]).map(r => `${String(r.systemName ?? "").trim().toLowerCase()}_${r.productionYear}`)
      );

      for (const { installationId, year, readings } of groups.values()) {
        const inst = instMap.get(installationId);
        if (!inst) continue;
        const existKey = `${inst.installationName.trim().toLowerCase()}_${year}`;
        if (!force && existingKeys.has(existKey)) continue;

        const totalGen = readings.reduce((s, r) => s + (Number(r.generationKwh) || 0), 0);
        const totalExport = readings.reduce((s, r) => s + (Number(r.exportKwh) || 0), 0);
        const totalSelf = readings.reduce((s, r) => s + (Number(r.selfConsumedKwh) || 0), 0);
        const totalRevenue = readings.reduce((s, r) => s + (Number(r.fitPaymentAmount) || 0), 0);
        const co2Avoided = parseFloat(((totalGen * UK_GRID_KG_CO2E_PER_KWH) / 1000).toFixed(3));
        const dates = readings.map(r => r.readingDate).sort();
        const periodStart = `${year}-01-01`;
        const periodEnd = `${year}-12-31`;

        await fetch(api(`farms/${farmId}/renewable-energy-production`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            technologyType: TECH_TYPE_MAP[inst.technologyType] ?? "Other",
            systemName: inst.installationName,
            productionYear: year,
            installedCapacityKw: inst.installedCapacityKw ?? null,
            periodStart,
            periodEnd,
            generationKwh: totalGen || null,
            selfConsumedKwh: totalSelf || null,
            exportedKwh: totalExport || null,
            exportTariffPencePerKwh: inst.tariffRatePence ?? null,
            exportRevenueGbp: totalRevenue ? parseFloat((totalRevenue / 100).toFixed(2)) : null,
            co2AvoidedTonnes: co2Avoided || null,
            fitRocReference: inst.fitOrSegContractRef ?? null,
            meterReadingStart: null,
            meterReadingEnd: null,
            notes: `Auto-synced from Fuel & Energy (${readings.length} reading${readings.length !== 1 ? "s" : ""}, ${dates[0]} – ${dates[dates.length - 1]})`,
          }),
        }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; });
        created++;
      }

      if (created > 0) qc.invalidateQueries({ queryKey: ["renewable-energy", farmId] });
      setSyncStatus({ time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }), created });
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (!hasSyncedRef.current && !isLoading && !instLoading && !genLoading) {
      hasSyncedRef.current = true;
      doSync(false);
    }
  }, [isLoading, instLoading, genLoading]);

  const TECH_TYPES = ["Solar PV", "Wind Turbine", "Anaerobic Digestion (AD)", "Hydro", "Biomass Boiler", "Ground Source Heat Pump", "Air Source Heat Pump", "Other"];

  const calcCo2Avoided = form.generationKwh
    ? ((parseFloat(form.generationKwh) * UK_GRID_KG_CO2E_PER_KWH) / 1000).toFixed(3)
    : null;
  const calcExportRevenue = form.exportedKwh && form.exportTariffPencePerKwh
    ? ((parseFloat(form.exportedKwh) * parseFloat(form.exportTariffPencePerKwh)) / 100).toFixed(2)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Renewable Energy Production Log</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Auto-synced from Fuel &amp; Energy. Generation, self-consumption and export from all on-farm renewables. CO₂ avoided calculated using the BEIS UK grid factor (0.207 kgCO₂e/kWh).</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ productionYear: String(new Date().getFullYear()) }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Manual Record</Button>
      </div>

      <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-green-50 border border-green-200 text-xs text-green-800">
        {syncing ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /><span>Syncing from Fuel &amp; Energy…</span></>
        ) : syncStatus ? (
          <>
            <SunMedium className="w-3.5 h-3.5 shrink-0 text-green-600" />
            <span className="flex-1">
              {syncStatus.created > 0
                ? <><strong>{syncStatus.created} new record{syncStatus.created !== 1 ? "s" : ""}</strong> pulled from Fuel &amp; Energy · {syncStatus.time}</>
                : <>Up to date · last checked {syncStatus.time}</>}
            </span>
            <button className="underline text-green-700 hover:text-green-900" onClick={() => { hasSyncedRef.current = false; doSync(false); }}>Re-sync</button>
          </>
        ) : (
          <><SunMedium className="w-3.5 h-3.5 shrink-0" /><span>Checking Fuel &amp; Energy for new generation data…</span></>
        )}
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "technologyType", label: "Technology" },
            { key: "systemName", label: "System" },
            { key: "productionYear", label: "Year" },
            { key: "periodStart", label: "Period", fmt: r => `${fmtDate(r.periodStart)} – ${fmtDate(r.periodEnd)}` },
            { key: "generationKwh", label: "Generated (kWh)" },
            { key: "selfConsumedKwh", label: "Self-used (kWh)" },
            { key: "exportedKwh", label: "Exported (kWh)" },
            { key: "exportRevenueGbp", label: "Export Revenue (£)" },
            { key: "co2AvoidedTonnes", label: "CO₂ Avoided (t)" },
          ]}
          rows={records as Record<string, unknown>[]}
          onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>Renewable Energy Production</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Technology Type *</Label>
              <Select value={form.technologyType ?? ""} onValueChange={v => setForm(f => ({ ...f, technologyType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{TECH_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>System Name</Label><Input placeholder="e.g. South Barn Solar Array" value={form.systemName ?? ""} onChange={e => setForm(f => ({ ...f, systemName: e.target.value }))} /></div>
            <div><Label>Production Year *</Label>
              <Select value={form.productionYear ?? ""} onValueChange={v => setForm(f => ({ ...f, productionYear: v }))}>
                <SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger>
                <SelectContent>{EM_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Installed Capacity (kW)</Label><Input type="number" step="0.01" value={form.installedCapacityKw ?? ""} onChange={e => setForm(f => ({ ...f, installedCapacityKw: e.target.value }))} /></div>
            <div><Label>Period Start *</Label><Input type="date" value={form.periodStart ?? ""} onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))} /></div>
            <div><Label>Period End *</Label><Input type="date" value={form.periodEnd ?? ""} onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))} /></div>
            <div>
              <Label>Generation (kWh) *</Label>
              <Input type="number" step="0.01" value={form.generationKwh ?? ""} onChange={e => {
                const gen = parseFloat(e.target.value);
                const co2 = !isNaN(gen) ? ((gen * UK_GRID_KG_CO2E_PER_KWH) / 1000).toFixed(3) : form.co2AvoidedTonnes;
                setForm(f => ({ ...f, generationKwh: e.target.value, co2AvoidedTonnes: co2 }));
              }} />
            </div>
            <div><Label>Self-consumed (kWh)</Label><Input type="number" step="0.01" value={form.selfConsumedKwh ?? ""} onChange={e => setForm(f => ({ ...f, selfConsumedKwh: e.target.value }))} /></div>
            <div>
              <Label>Exported (kWh)</Label>
              <Input type="number" step="0.01" value={form.exportedKwh ?? ""} onChange={e => {
                const exp = parseFloat(e.target.value);
                const tariff = parseFloat(form.exportTariffPencePerKwh ?? "");
                const rev = !isNaN(exp) && !isNaN(tariff) ? ((exp * tariff) / 100).toFixed(2) : form.exportRevenueGbp;
                setForm(f => ({ ...f, exportedKwh: e.target.value, exportRevenueGbp: rev }));
              }} />
            </div>
            <div>
              <Label>Export Tariff (p/kWh)</Label>
              <Input type="number" step="0.01" value={form.exportTariffPencePerKwh ?? ""} onChange={e => {
                const tariff = parseFloat(e.target.value);
                const exp = parseFloat(form.exportedKwh ?? "");
                const rev = !isNaN(tariff) && !isNaN(exp) ? ((exp * tariff) / 100).toFixed(2) : form.exportRevenueGbp;
                setForm(f => ({ ...f, exportTariffPencePerKwh: e.target.value, exportRevenueGbp: rev }));
              }} />
            </div>
            <div>
              <Label>Export Revenue (£)</Label>
              <Input type="number" step="0.01" value={form.exportRevenueGbp ?? ""} onChange={e => setForm(f => ({ ...f, exportRevenueGbp: e.target.value }))} />
              {calcExportRevenue && form.exportRevenueGbp !== calcExportRevenue && (
                <p className="text-xs text-muted-foreground mt-0.5">Calculated: £{calcExportRevenue} (exported kWh × tariff)
                  <button type="button" className="ml-1 text-primary underline" onClick={() => setForm(f => ({ ...f, exportRevenueGbp: calcExportRevenue }))}>use this</button>
                </p>
              )}
            </div>
            <div>
              <Label>CO₂ Avoided (tonnes)</Label>
              <Input type="number" step="0.001" value={form.co2AvoidedTonnes ?? ""} onChange={e => setForm(f => ({ ...f, co2AvoidedTonnes: e.target.value }))} />
              {calcCo2Avoided && form.co2AvoidedTonnes !== calcCo2Avoided && (
                <p className="text-xs text-muted-foreground mt-0.5">Calculated: {calcCo2Avoided} t (generation × 0.207 kgCO₂e/kWh)
                  <button type="button" className="ml-1 text-primary underline" onClick={() => setForm(f => ({ ...f, co2AvoidedTonnes: calcCo2Avoided }))}>use this</button>
                </p>
              )}
            </div>
            <div><Label>FIT / RO Reference</Label><Input value={form.fitRocReference ?? ""} onChange={e => setForm(f => ({ ...f, fitRocReference: e.target.value }))} /></div>
            <div><Label>Meter Reading (Start)</Label><Input type="number" step="0.01" value={form.meterReadingStart ?? ""} onChange={e => setForm(f => ({ ...f, meterReadingStart: e.target.value }))} /></div>
            <div><Label>Meter Reading (End)</Label><Input type="number" step="0.01" value={form.meterReadingEnd ?? ""} onChange={e => setForm(f => ({ ...f, meterReadingEnd: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── BNG constants ────────────────────────────────────────────────────────────
const BNG_ASSESSOR_TYPES = [
  "Internal staff",
  "Agri-environment advisor",
  "Independent ecologist",
  "CIEEM member ecologist",
];
const BNG_RECORD_TYPES = [
  { v: "baseline",          l: "Baseline" },
  { v: "post-creation",     l: "Post-creation" },
  { v: "annual-monitoring", l: "Annual Monitoring" },
  { v: "final-assessment",  l: "Final Assessment" },
];
const BNG_HABITATS = [
  "Arable Field Margins", "Deciduous Woodland", "Hedgerow",
  "Grassland (neutral)", "Grassland (calcareous)", "Grassland (acid)",
  "Heathland", "Bog / Mire", "Fen", "Wetland / Reed Bed",
  "Pond / Lake", "River / Stream", "Wildflower Meadow", "Woodland Edge", "Other",
];
const BNG_CONDITIONS = ["Distinctly sub-optimal", "Moderate", "Fairly good", "Good", "Excellent"];
const BNG_COMPLIANCE = ["On track", "Shortfall identified", "Remedial action in progress", "In breach"];
const BNG_LEGAL_TYPES = ["Section 106", "Conservation Covenant", "Management Agreement", "Habitat Bank Agreement", "Planning Condition", "Other"];

function BngTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [assessorSupplierId, setAssessorSupplierId] = useState<number | null>(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["bng", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/biodiversity-net-gain`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []),
  });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/biodiversity-net-gain/${editing.id}`) : api(`farms/${farmId}/biodiversity-net-gain`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["bng", farmId] }); setOpen(false); setForm({}); setEditing(null); setAssessorSupplierId(null); },
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/biodiversity-net-gain/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bng", farmId] }),
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const isMonitoring = form.recordType !== "baseline";

  // Net gain: baseline records use target − baseline; monitoring uses achieved − baseline
  const calcNetGain = (() => {
    const bl = parseFloat(form.baselineUnits ?? "");
    if (isNaN(bl)) return null;
    const comparator = isMonitoring ? parseFloat(form.achievedUnits ?? "") : parseFloat(form.targetUnits ?? "");
    return !isNaN(comparator) ? (comparator - bl).toFixed(3) : null;
  })();

  // Warn when a legal record is being logged by internal staff only
  const showAssessorWarning =
    form.assessorType === "Internal staff" &&
    !!(form.legalAgreementType || form.planningReference);

  const handleOpen = (editRec?: Record<string, unknown>) => {
    if (editRec) {
      setEditing(editRec);
      setForm(Object.fromEntries(Object.entries(editRec).filter(([k]) => k !== "assessorSupplierId").map(([k, v]) => [k, v == null ? "" : String(v)])));
      setAssessorSupplierId(editRec.assessorSupplierId != null ? Number(editRec.assessorSupplierId) : null);
    } else {
      setEditing(null);
      setForm({ assessmentTool: "Defra Metric 4.0", recordType: "baseline", status: "active" });
      setAssessorSupplierId(null);
    }
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Biodiversity Net Gain (BNG) Tracker</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record habitat baseline assessments and post-creation monitoring using Defra Metric 4.0. Mandatory 10% BNG applies to most new planning permissions from April 2024. Biodiversity unit values must come from the Defra Metric calculator.</p>
        </div>
        <Button size="sm" onClick={() => handleOpen()}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "assessmentDate", label: "Date", fmt: r => fmtDate(r.assessmentDate) },
            { key: "recordType", label: "Type", fmt: r => BNG_RECORD_TYPES.find(t => t.v === String(r.recordType ?? ""))?.l ?? String(r.recordType ?? "—") },
            { key: "habitatType", label: "Habitat" },
            { key: "areaHa", label: "Area (ha)" },
            { key: "assessorType", label: "Assessor Type" },
            { key: "baselineCondition", label: "Baseline Condition" },
            { key: "targetCondition", label: "Target Condition" },
            { key: "achievedCondition", label: "Achieved Condition" },
            { key: "netGainUnits", label: "Net Gain Units" },
            { key: "complianceStatus", label: "Compliance" },
            { key: "status", label: "Status" },
          ]}
          rows={records as Record<string, unknown>[]}
          onEdit={r => handleOpen(r)}
          onDelete={r => del.mutate(r.id as number)}
        />
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setEditing(null); }}>
        <DialogContent style={{ maxWidth: "48rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} BNG Record</DialogTitle></DialogHeader>

          {showAssessorWarning && (
            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
              ⚠ This record references a legal agreement or planning permission. Legally binding BNG assessments must be conducted by a qualified ecologist — not internal staff.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">

            {/* ── Assessment ── */}
            <div className="col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assessment</p>
            </div>
            <div>
              <Label>Assessment Date *</Label>
              <Input type="date" value={form.assessmentDate ?? ""} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} />
            </div>
            <div>
              <Label>Record Type *</Label>
              <Select value={form.recordType ?? "baseline"} onValueChange={v => setForm(f => ({ ...f, recordType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BNG_RECORD_TYPES.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assessor Type</Label>
              <Select value={form.assessorType ?? ""} onValueChange={v => setForm(f => ({ ...f, assessorType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select assessor type" /></SelectTrigger>
                <SelectContent>{BNG_ASSESSOR_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Assessor Name</Label>
              <Input value={form.assessorName ?? ""} onChange={e => setForm(f => ({ ...f, assessorName: e.target.value }))} />
            </div>
            <div>
              <Label>Assessor Organisation / Firm</Label>
              <BuyerCombobox farmId={farmId!} types={["contractor", "general"]} valueId={assessorSupplierId} valueName={form.assessorOrganisation ?? ""} onChange={(id, name) => { setAssessorSupplierId(id); setForm(f => ({ ...f, assessorOrganisation: name })); }} />
            </div>
            <div>
              <Label>Assessment Tool</Label>
              <Select value={form.assessmentTool ?? "Defra Metric 4.0"} onValueChange={v => setForm(f => ({ ...f, assessmentTool: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Defra Metric 4.0", "Defra Metric 3.1", "Defra Metric 3.0", "CIEEM Rapid Assessment", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* ── Habitat ── */}
            <div className="col-span-2 border-t pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Habitat</p>
            </div>
            <div>
              <Label>Habitat Type *</Label>
              <Select value={form.habitatType ?? ""} onValueChange={v => setForm(f => ({ ...f, habitatType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select habitat" /></SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">{BNG_HABITATS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Area (ha) *</Label>
              <Input type="number" step="0.0001" value={form.areaHa ?? ""} onChange={e => setForm(f => ({ ...f, areaHa: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <Label>Habitat Description</Label>
              <Textarea value={form.habitatDescription ?? ""} onChange={e => setForm(f => ({ ...f, habitatDescription: e.target.value }))} rows={2} />
            </div>

            {/* ── Baseline condition & units ── */}
            <div className="col-span-2 border-t pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {isMonitoring ? "Baseline (from original survey)" : "Condition & Biodiversity Units"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isMonitoring
                  ? "Enter the original baseline values for reference. Condition is assessed by the ecologist using habitat-specific Defra criteria."
                  : "Condition is assessed by the ecologist using habitat-specific Defra criteria. Unit values come directly from the Defra Biodiversity Metric calculator output."}
              </p>
            </div>
            <div>
              <Label>Baseline Condition *</Label>
              <Select value={form.baselineCondition ?? ""} onValueChange={v => setForm(f => ({ ...f, baselineCondition: v }))}>
                <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                <SelectContent>{BNG_CONDITIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Baseline Units</Label>
              <Input type="number" step="0.001" value={form.baselineUnits ?? ""}
                onChange={e => {
                  const bl = parseFloat(e.target.value);
                  const comp = isMonitoring ? parseFloat(form.achievedUnits ?? "") : parseFloat(form.targetUnits ?? "");
                  const net = !isNaN(bl) && !isNaN(comp) ? (comp - bl).toFixed(3) : form.netGainUnits ?? "";
                  setForm(f => ({ ...f, baselineUnits: e.target.value, netGainUnits: net }));
                }}
                placeholder="From Defra Metric calculator" />
            </div>

            {/* Target — shown for all record types */}
            <div>
              <Label>Target Condition</Label>
              <Select value={form.targetCondition ?? ""} onValueChange={v => setForm(f => ({ ...f, targetCondition: v }))}>
                <SelectTrigger><SelectValue placeholder="Committed target" /></SelectTrigger>
                <SelectContent>{BNG_CONDITIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-0.5">Committed in the management agreement</p>
            </div>
            <div>
              <Label>Target Units</Label>
              <Input type="number" step="0.001" value={form.targetUnits ?? ""}
                onChange={e => {
                  if (!isMonitoring) {
                    const bl = parseFloat(form.baselineUnits ?? "");
                    const tgt = parseFloat(e.target.value);
                    const net = !isNaN(bl) && !isNaN(tgt) ? (tgt - bl).toFixed(3) : form.netGainUnits ?? "";
                    setForm(f => ({ ...f, targetUnits: e.target.value, netGainUnits: net }));
                  } else {
                    setForm(f => ({ ...f, targetUnits: e.target.value }));
                  }
                }}
                placeholder="From Defra Metric calculator" />
              <p className="text-xs text-muted-foreground mt-0.5">Must be ≥ 10% above baseline</p>
            </div>

            {/* Net gain — baseline only */}
            {!isMonitoring && (
              <div className="col-span-2">
                <Label>Projected Net Gain Units</Label>
                <Input type="number" step="0.001" value={form.netGainUnits ?? ""}
                  onChange={e => setForm(f => ({ ...f, netGainUnits: e.target.value }))}
                  placeholder="Auto-calculated: target − baseline" />
                {calcNetGain && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    = {calcNetGain} units (target {form.targetUnits} − baseline {form.baselineUnits}){" "}
                    {String(form.netGainUnits) !== calcNetGain && (
                      <button type="button" className="text-primary underline" onClick={() => setForm(f => ({ ...f, netGainUnits: calcNetGain! }))}>use this</button>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* ── Monitoring results — non-baseline only ── */}
            {isMonitoring && (
              <>
                <div className="col-span-2 border-t pt-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Monitoring Results</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Record what was actually achieved in this monitoring period. Achieved condition must be assessed by the ecologist on site.</p>
                </div>
                <div>
                  <Label>Achieved Condition</Label>
                  <Select value={form.achievedCondition ?? ""} onValueChange={v => setForm(f => ({ ...f, achievedCondition: v }))}>
                    <SelectTrigger><SelectValue placeholder="Condition found on site" /></SelectTrigger>
                    <SelectContent>{BNG_CONDITIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Achieved Units</Label>
                  <Input type="number" step="0.001" value={form.achievedUnits ?? ""}
                    onChange={e => {
                      const bl = parseFloat(form.baselineUnits ?? "");
                      const ach = parseFloat(e.target.value);
                      const net = !isNaN(bl) && !isNaN(ach) ? (ach - bl).toFixed(3) : form.netGainUnits ?? "";
                      setForm(f => ({ ...f, achievedUnits: e.target.value, netGainUnits: net }));
                    }}
                    placeholder="From Defra Metric calculator" />
                </div>
                <div className="col-span-2">
                  <Label>Net Gain Units (Achieved)</Label>
                  <Input type="number" step="0.001" value={form.netGainUnits ?? ""}
                    onChange={e => setForm(f => ({ ...f, netGainUnits: e.target.value }))}
                    placeholder="Auto-calculated: achieved − baseline" />
                  {calcNetGain && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      = {calcNetGain} units (achieved {form.achievedUnits} − baseline {form.baselineUnits}){" "}
                      {String(form.netGainUnits) !== calcNetGain && (
                        <button type="button" className="text-primary underline" onClick={() => setForm(f => ({ ...f, netGainUnits: calcNetGain! }))}>use this</button>
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Compliance Status</Label>
                  <Select value={form.complianceStatus ?? ""} onValueChange={v => setForm(f => ({ ...f, complianceStatus: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>{BNG_COMPLIANCE.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {(form.complianceStatus && form.complianceStatus !== "On track") && (
                  <div className="col-span-2">
                    <Label>Remedial Action / Notes</Label>
                    <Textarea
                      value={form.remedialActionNotes ?? ""}
                      onChange={e => setForm(f => ({ ...f, remedialActionNotes: e.target.value }))}
                      rows={2}
                      placeholder="Describe the shortfall and any remedial actions being taken or planned…" />
                  </div>
                )}
              </>
            )}

            {/* ── Legal agreement ── */}
            <div className="col-span-2 border-t pt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legal Agreement</p>
            </div>
            <div>
              <Label>Legal Agreement Type</Label>
              <Select value={form.legalAgreementType ?? ""} onValueChange={v => setForm(f => ({ ...f, legalAgreementType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{BNG_LEGAL_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Planning Reference</Label>
              <Input value={form.planningReference ?? ""} onChange={e => setForm(f => ({ ...f, planningReference: e.target.value }))} />
            </div>
            <div>
              <Label>Management Commitment (years)</Label>
              <Input type="number" value={form.managementCommitmentYears ?? ""} onChange={e => setForm(f => ({ ...f, managementCommitmentYears: e.target.value }))} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status ?? "active"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[{ v: "active", l: "Active" }, { v: "monitoring", l: "Monitoring" }, { v: "completed", l: "Completed" }, { v: "lapsed", l: "Lapsed" }].map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => save.mutate({ ...form, assessorSupplierId: assessorSupplierId ?? null })} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type Tab = "audits" | "emissions" | "sequestration" | "actions" | "reports" | "renewable" | "bng" | "auto-calc";

export default function CarbonPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("audits");
  const [prefillAudit, setPrefillAudit] = useState<PrefillAudit | null>(null);
  if (!farmId) return <Redirect to="/" />;
  return (
    <AppLayout title="Carbon & Sustainability">
      <div className="space-y-4">
        <TabBar>
          <TabButton active={tab === "audits"} onClick={() => setTab("audits")}><BarChart3 className="w-3.5 h-3.5 mr-1" />Carbon Audits</TabButton>
          <TabButton active={tab === "emissions"} onClick={() => setTab("emissions")}><Flame className="w-3.5 h-3.5 mr-1" />Emissions</TabButton>
          <TabButton active={tab === "sequestration"} onClick={() => setTab("sequestration")}><Trees className="w-3.5 h-3.5 mr-1" />Sequestration</TabButton>
          <TabButton active={tab === "actions"} onClick={() => setTab("actions")}><Zap className="w-3.5 h-3.5 mr-1" />Reduction Actions</TabButton>
          <TabButton active={tab === "renewable"} onClick={() => setTab("renewable")}><SunMedium className="w-3.5 h-3.5 mr-1" />Renewable Energy</TabButton>
          <TabButton active={tab === "bng"} onClick={() => setTab("bng")}><Sprout className="w-3.5 h-3.5 mr-1" />Biodiversity Net Gain</TabButton>
          <TabButton active={tab === "reports"} onClick={() => setTab("reports")}><FileBarChart className="w-3.5 h-3.5 mr-1" />Reports</TabButton>
          <TabButton active={tab === "auto-calc"} onClick={() => setTab("auto-calc")}><Zap className="w-3.5 h-3.5 mr-1" />Auto-Calculator</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "audits" && <AuditsTab farmId={farmId} prefillAudit={prefillAudit} onPrefillUsed={() => setPrefillAudit(null)} />}
          {tab === "emissions" && <EmissionsTab farmId={farmId} />}
          {tab === "sequestration" && <SequestrationTab farmId={farmId} />}
          {tab === "actions" && <ReductionActionsTab farmId={farmId} />}
          {tab === "renewable" && <RenewableEnergyTab farmId={farmId} />}
          {tab === "bng" && <BngTab farmId={farmId} />}
          {tab === "reports" && <ReportsTab farmId={farmId} />}
          {tab === "auto-calc" && <CarbonAutoCalcTab farmId={farmId} onUseForAudit={(s1, s2, s3, t, notes) => { setPrefillAudit({ scope1: s1, scope2: s2, scope3: s3, total: t, notes }); setTab("audits"); }} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}

// ─── T015: Carbon Auto-Calculator ─────────────────────────────────────────────
const DEFRA_EF: Record<string, { label: string; unit: string; kgCo2ePerUnit: number; scope: string; category: string }> = {
  diesel:     { label: "Red Diesel / Gas Oil",       unit: "litres",   kgCo2ePerUnit: 2.5437,  scope: "1", category: "Fuel" },
  petrol:     { label: "Petrol",                     unit: "litres",   kgCo2ePerUnit: 2.1555,  scope: "1", category: "Fuel" },
  lng:        { label: "LNG / Propane (heating)",    unit: "litres",   kgCo2ePerUnit: 1.1544,  scope: "1", category: "Fuel" },
  elec:       { label: "Grid Electricity",           unit: "kWh",      kgCo2ePerUnit: 0.20705, scope: "2", category: "Energy" },
  ammonium:   { label: "Ammonium Nitrate (34.5%N)",  unit: "kg",       kgCo2ePerUnit: 5.82,    scope: "3", category: "Fertiliser" },
  urea:       { label: "Urea (46%N)",                unit: "kg",       kgCo2ePerUnit: 4.70,    scope: "3", category: "Fertiliser" },
  can:        { label: "CAN (27%N)",                 unit: "kg",       kgCo2ePerUnit: 3.04,    scope: "3", category: "Fertiliser" },
  beef_head:  { label: "Beef cattle (per head/yr)",  unit: "head",     kgCo2ePerUnit: 3200,    scope: "1", category: "Livestock" },
  dairy_head: { label: "Dairy cows (per head/yr)",   unit: "head",     kgCo2ePerUnit: 5400,    scope: "1", category: "Livestock" },
  sheep_head: { label: "Sheep (per head/yr)",        unit: "head",     kgCo2ePerUnit: 320,     scope: "1", category: "Livestock" },
  pigs_head:  { label: "Pigs (per head/yr)",         unit: "head",     kgCo2ePerUnit: 310,     scope: "1", category: "Livestock" },
  poultry_k:  { label: "Poultry (per 1,000 birds)", unit: "k birds",  kgCo2ePerUnit: 280,     scope: "1", category: "Livestock" },
};

function CarbonAutoCalcTab({ farmId, onUseForAudit }: { farmId: number; onUseForAudit: (s1: number, s2: number, s3: number, total: number, notes: string) => void }) {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [prefillYear, setPrefillYear] = useState(String(new Date().getFullYear() - 1));
  const [prefilling, setPrefilling] = useState(false);
  const [prefillSources, setPrefillSources] = useState<{ fuel?: boolean; fertiliser?: boolean; livestock?: boolean; electricity?: boolean } | null>(null);
  const set = (key: string, val: string) => setInputs(p => ({ ...p, [key]: val }));

  const results = Object.entries(DEFRA_EF).map(([key, ef]) => {
    const qty = parseFloat(inputs[key] ?? "0") || 0;
    const tCo2e = (qty * ef.kgCo2ePerUnit) / 1000;
    return { key, ...ef, qty, tCo2e };
  });

  const s1 = results.filter(r => r.scope === "1").reduce((s, r) => s + r.tCo2e, 0);
  const s2 = results.filter(r => r.scope === "2").reduce((s, r) => s + r.tCo2e, 0);
  const s3 = results.filter(r => r.scope === "3").reduce((s, r) => s + r.tCo2e, 0);
  const total = s1 + s2 + s3;
  const fmt = (t: number) => t.toFixed(3);
  const cats = [...new Set(Object.values(DEFRA_EF).map(e => e.category))];
  const prefillYears = Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - i));

  const handlePrefill = async () => {
    setPrefilling(true);
    try {
      const r = await fetch(api(`farms/${farmId}/carbon-calc-prefill?year=${prefillYear}`), { credentials: "include" });
      if (r.ok) {
        const data = await r.json() as Record<string, unknown>;
        const next: Record<string, string> = {};
        Object.keys(DEFRA_EF).forEach(key => {
          const v = data[key];
          if (v != null && Number(v) > 0) next[key] = String(parseFloat(String(v)));
        });
        setInputs(next);
        setPrefillSources(data.sources as { fuel?: boolean; fertiliser?: boolean; livestock?: boolean } ?? {});
      }
    } finally {
      setPrefilling(false);
    }
  };

  const auditNotes = total > 0
    ? `Auto-calculated from farm records (${prefillYear}) using DEFRA 2023 GHG Conversion Factors.\n${results.filter(r => r.qty > 0).map(r => `${r.label}: ${r.qty} ${r.unit} → ${fmt(r.tCo2e)} tCO₂e`).join("\n")}`
    : "";

  return (
    <div className="space-y-5">

      {/* Controls row — year picker + prefill button + source badges */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <p className="text-xs text-muted-foreground mb-1 font-medium">Pre-fill year</p>
          <Select value={prefillYear} onValueChange={setPrefillYear}>
            <SelectTrigger className="w-28 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{prefillYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button size="sm" variant="outline" onClick={handlePrefill} disabled={prefilling}>
          {prefilling ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Loading…</> : "Pre-fill from farm records"}
        </Button>
        {prefillSources && (
          <div className="flex gap-1.5 flex-wrap">
            {(["fuel", "fertiliser", "livestock", "electricity"] as const).map(s => (
              <span key={s} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${prefillSources[s] ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                {prefillSources[s] ? "✓" : "—"} {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
        <Zap className="w-4 h-4 mt-0.5 shrink-0" />
        <div><strong>DEFRA 2023 GHG Conversion Factors.</strong> Pre-fill from your farm records or enter quantities manually — totals update instantly. When ready, use <strong>Create Carbon Audit</strong> to push the figures directly into a new audit record.</div>
      </div>

      {total > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Scope 1 (Direct)", val: s1, bg: "#fef2f2", col: "#dc2626" },
            { label: "Scope 2 (Energy)", val: s2, bg: "#fffbeb", col: "#d97706" },
            { label: "Scope 3 (Indirect)", val: s3, bg: "#f5f3ff", col: "#7c3aed" },
            { label: "Total tCO₂e / yr", val: total, bg: "#f9fafb", col: "#111827" },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 border text-center" style={{ background: s.bg }}>
              <p className="text-2xl font-bold" style={{ color: s.col }}>{fmt(s.val)}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {cats.map(cat => (
        <div key={cat}>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{cat}</h3>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-xs text-gray-600">
                  <th className="text-left px-4 py-2 font-medium">Activity</th>
                  <th className="text-left px-4 py-2 font-medium">Scope</th>
                  <th className="text-left px-4 py-2 font-medium">Quantity / year</th>
                  <th className="text-left px-4 py-2 font-medium">EF (kg CO₂e)</th>
                  <th className="text-right px-4 py-2 font-medium">tCO₂e</th>
                </tr>
              </thead>
              <tbody>
                {results.filter(r => r.category === cat).map((r, i, arr) => (
                  <tr key={r.key} style={{ borderBottom: i < arr.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{r.label}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${r.scope === "1" ? "bg-red-100 text-red-700" : r.scope === "2" ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-700"}`}>S{r.scope}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <input type="number" min="0" step="any" className="w-24 border rounded px-2 py-1 text-sm" value={inputs[r.key] ?? ""} onChange={e => set(r.key, e.target.value)} placeholder="0" />
                        <span className="text-xs text-gray-400">{r.unit}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">{r.kgCo2ePerUnit.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-semibold">{r.tCo2e > 0 ? fmt(r.tCo2e) : <span className="text-gray-300 font-normal">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {total > 0 && (
        <div className="flex gap-3 flex-wrap">
          <Button onClick={() => onUseForAudit(s1, s2, s3, total, auditNotes)}>
            <BarChart3 className="w-4 h-4 mr-1.5" />Use these figures → Create Carbon Audit
          </Button>
          <button
            className="text-sm border px-4 py-2 rounded-lg font-medium hover:bg-gray-50"
            onClick={() => {
              const lines = [`DEFRA Auto-Calc — Total: ${fmt(total)} tCO₂e/yr`, `Scope 1: ${fmt(s1)} | Scope 2: ${fmt(s2)} | Scope 3: ${fmt(s3)}`, ``, ...results.filter(r => r.qty > 0).map(r => `  ${r.label}: ${r.qty} ${r.unit} → ${fmt(r.tCo2e)} tCO₂e`)];
              navigator.clipboard.writeText(lines.join("\n"));
              setCopied(true);
              setTimeout(() => setCopied(false), 2500);
            }}
          >{copied ? "✓ Copied" : "Copy to Clipboard"}</button>
        </div>
      )}
    </div>
  );
}
