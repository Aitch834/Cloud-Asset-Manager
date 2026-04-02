import React, { useState, useRef } from "react";
import { useLookupStrings } from "@/hooks/use-lookup";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Plus, Trash2, AlertTriangle, CheckCircle2, ClipboardList, Wrench, Award, Pencil, Eye, Paperclip, File as FileIcon, Loader2, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function DocCell({ endpoint, queryKey, documentPath, documentName, portalUrl }: {
  endpoint: string;
  queryKey: unknown[];
  documentPath: string | null;
  documentName: string | null;
  portalUrl?: string;
}) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type || "application/octet-stream" }),
      });
      const { uploadURL, objectPath } = await urlRes.json();
      await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
      const fileName = objectPath.split("/").pop() ?? file.name;
      await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentPath: objectPath, documentName: fileName }) });
      qc.invalidateQueries({ queryKey });
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentPath: null, documentName: null }) });
    qc.invalidateQueries({ queryKey });
  }

  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {portalUrl && (
        <a href={portalUrl} target="_blank" rel="noopener noreferrer" title="View on assurance portal" style={{ display: "flex", alignItems: "center", color: "#6b7280", padding: 4 }}>
          <ExternalLink size={13} />
        </a>
      )}
      {documentPath ? (
        <>
          <a href={`/api/storage${documentPath}`} target="_blank" rel="noopener noreferrer" title={documentName || "View document"} style={{ display: "flex", alignItems: "center", color: "#2563eb", padding: 4 }}>
            <FileIcon size={13} />
          </a>
          <button onClick={handleRemove} title="Remove document" style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4, fontSize: "0.8rem", lineHeight: 1 }}>×</button>
        </>
      ) : (
        <>
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          {uploading
            ? <Loader2 size={13} style={{ color: "#9ca3af", padding: 4, animation: "spin 1s linear infinite" }} />
            : <button onClick={() => fileRef.current?.click()} title="Attach document copy" style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }}><Paperclip size={13} /></button>
          }
        </>
      )}
    </div>
  );
}

type Tab = "inspections" | "issues-register" | "assurance-certs";

function SeverityBadge({ severity }: { severity: string | null }) {
  const map: Record<string, { bg: string; color: string }> = {
    critical: { bg: "#fee2e2", color: "#991b1b" },
    major: { bg: "#fef3c7", color: "#92400e" },
    minor: { bg: "#eff6ff", color: "#1e40af" },
  };
  const style = map[severity ?? ""] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <Badge style={{ background: style.bg, color: style.color, border: "none", textTransform: "capitalize", fontSize: "0.75rem" }}>
      {severity || "unset"}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    open: { bg: "#fee2e2", color: "#991b1b" },
    in_progress: { bg: "#fef3c7", color: "#92400e" },
    closed: { bg: "#dcfce7", color: "#166534" },
    resolved: { bg: "#dcfce7", color: "#166534" },
    verified: { bg: "#eff6ff", color: "#1e40af" },
    pass: { bg: "#dcfce7", color: "#166534" },
    conditional_pass: { bg: "#fef3c7", color: "#92400e" },
    fail: { bg: "#fee2e2", color: "#991b1b" },
    pending: { bg: "#f3f4f6", color: "#374151" },
  };
  const style = map[status] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <Badge style={{ background: style.bg, color: style.color, border: "none", textTransform: "capitalize", fontSize: "0.75rem" }}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

function InspectionsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const inspectionTypes = useLookupStrings("inspection_types", ["Red Tractor", "Internal Audit", "EHO", "Trading Standards", "Organic", "Other"]);
  const certificationBodies = useLookupStrings("certification_bodies", ["Red Tractor Assurance", "LEAF Marque", "Organic Farmers & Growers", "Soil Association", "RSPCA Assured", "Linking Environment and Farming", "Other"]);
  const [addOpen, setAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const emptyForm = { inspectionDate: "", inspectorName: "", inspectionBody: "", inspectionType: "", overallResult: "", summary: "", nextInspectionDue: "", notes: "" };
  const [form, setForm] = useState<any>(emptyForm);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [docUploading, setDocUploading] = useState(false);
  const addFileRef = useRef<HTMLInputElement>(null);

  const q = useQuery({
    queryKey: ["inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/inspections`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["inspections", farmId] });

  const uploadDoc = async (recordId: number, file: File) => {
    const urlRes = await fetch("/api/storage/uploads/request-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileName: file.name, contentType: file.type || "application/octet-stream" }) });
    const { uploadURL, objectPath } = await urlRes.json();
    await fetch(uploadURL, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file });
    const fileName = objectPath.split("/").pop() ?? file.name;
    await fetch(`/api/farms/${farmId}/inspections/${recordId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documentPath: objectPath, documentName: fileName }) });
  };

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: async (data) => {
      if (pendingFile && data.record?.id) {
        setDocUploading(true);
        try { await uploadDoc(data.record.id, pendingFile); } finally { setDocUploading(false); }
      }
      toast({ title: "Inspection saved" }); invalidate(); setAddOpen(false); setForm(emptyForm); setPendingFile(null);
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/inspections/${editRecord?.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Inspection updated" }); invalidate(); setEditRecord(null); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/inspections/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const openEdit = (r: any) => { setForm({ inspectionDate: r.inspectionDate?.slice(0, 10) ?? "", inspectorName: r.inspectorName ?? "", inspectionBody: r.inspectionBody ?? "", inspectionType: r.inspectionType ?? "", overallResult: r.overallResult ?? "", summary: r.summary ?? "", nextInspectionDue: r.nextInspectionDue?.slice(0, 10) ?? "", notes: r.notes ?? "" }); setEditRecord(r); };
  const records: any[] = q.data ?? [];
  const formOpen = addOpen || !!editRecord;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Inspection</Button>
      </div>
      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <ClipboardList size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No inspections recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Log Red Tractor, internal, and regulatory inspections here.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date", "Type", "Inspector", "Body", "Result", "Next Due", "Report", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{fmt(r.inspectionDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500 }}>{r.inspectionType || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.inspectorName || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.inspectionBody || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>{r.overallResult ? <StatusBadge status={r.overallResult} /> : "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{fmt(r.nextInspectionDue)}</td>
                  <td style={{ padding: "0.25rem 0.5rem" }}>
                    <DocCell
                      endpoint={`/api/farms/${farmId}/inspections/${r.id}`}
                      queryKey={["inspections", farmId]}
                      documentPath={r.documentPath ?? null}
                      documentName={r.documentName ?? null}
                    />
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => setViewRecord(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="View"><Eye size={13} /></button>
                      <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: 560 }}>
            <DialogHeader><DialogTitle>Inspection Record</DialogTitle></DialogHeader>
            {(() => {
              const r = viewRecord;
              const fmtD = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
              const F = ({ label, value }: { label: string; value?: string | null }) => (
                <div><div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value || "—"}</div></div>
              );
              return (
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Date" value={fmtD(r.inspectionDate)} />
                    <F label="Type" value={r.inspectionType} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Inspector Name" value={r.inspectorName} />
                    <F label="Inspection Body" value={r.inspectionBody} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>Overall Result</div>
                      {r.overallResult ? <StatusBadge status={r.overallResult} /> : <span style={{ color: "#d1d5db", fontSize: "0.875rem" }}>—</span>}
                    </div>
                    <F label="Next Inspection Due" value={fmtD(r.nextInspectionDue)} />
                  </div>
                  {r.summary && <F label="Summary" value={r.summary} />}
                  {r.notes && <F label="Notes" value={r.notes} />}
                  <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>Report Document</div>
                    {r.documentPath ? (
                      <a href={`/api/storage${r.documentPath}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem", color: "#2563eb", textDecoration: "none" }}>
                        <FileIcon size={14} />{r.documentName || "View Report"}
                      </a>
                    ) : (
                      <span style={{ fontSize: "0.875rem", color: "#d1d5db" }}>No report document attached</span>
                    )}
                  </div>
                </div>
              );
            })()}
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}>Edit Inspection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={formOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Inspection" : "Record Inspection"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.inspectionDate} onChange={e => setForm((f: any) => ({ ...f, inspectionDate: e.target.value }))} /></div>
              <div><Label>Type</Label>
                <Select value={form.inspectionType} onValueChange={v => setForm((f: any) => ({ ...f, inspectionType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {inspectionTypes.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Inspector Name <span style={{ color: "#ef4444" }}>*</span></Label><Input value={form.inspectorName} onChange={e => setForm((f: any) => ({ ...f, inspectorName: e.target.value }))} /></div>
              <div><Label>Inspection Body</Label>
                <Select value={form.inspectionBody || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, inspectionBody: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select body..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {certificationBodies.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Overall Result</Label>
                <Select value={form.overallResult || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, overallResult: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="conditional_pass">Conditional Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Next Inspection Due</Label><Input type="date" value={form.nextInspectionDue} onChange={e => setForm((f: any) => ({ ...f, nextInspectionDue: e.target.value }))} /></div>
            </div>
            <div><Label>Summary</Label><Textarea placeholder="Summary of findings..." value={form.summary} onChange={e => setForm((f: any) => ({ ...f, summary: e.target.value }))} rows={2} /></div>
            <div><Label>Notes</Label><Textarea placeholder="Additional notes..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            <div>
              <Label>Report Document</Label>
              {editRecord ? (
                <div className="mt-1">
                  <DocCell
                    endpoint={`/api/farms/${farmId}/inspections/${editRecord.id}`}
                    queryKey={["inspections", farmId]}
                    documentPath={editRecord.documentPath ?? null}
                    documentName={editRecord.documentName ?? null}
                  />
                </div>
              ) : (
                <div className="mt-1" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input ref={addFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) setPendingFile(f); e.target.value = ""; }} />
                  <button type="button" onClick={() => addFileRef.current?.click()} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", border: "1px solid #e5e7eb", borderRadius: 6, background: "#f9fafb", cursor: "pointer", fontSize: "0.8rem", color: "#374151" }}>
                    <Paperclip size={13} />{pendingFile ? pendingFile.name : "Attach report…"}
                  </button>
                  {pendingFile && <button type="button" onClick={() => setPendingFile(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "0.75rem" }}>Remove</button>}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm); setPendingFile(null); }}>Cancel</Button>
            <Button
              onClick={() => editRecord ? updateMut.mutate(form) : createMut.mutate(form)}
              disabled={!form.inspectionDate || !form.inspectorName || createMut.isPending || updateMut.isPending || docUploading}
            >{docUploading ? "Uploading…" : editRecord ? "Save Changes" : "Save Inspection"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Inspection</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this inspection record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const NC_CATEGORIES = ["Animal Health & Welfare", "Biosecurity", "Crop Production", "Documentation", "Equipment & Machinery", "Environmental", "Food Safety", "Hygiene", "Record Keeping", "Staff Training", "Traceability", "Other"];

function computeNcStatus(nc: { status: string; correctiveActions: { status: string }[] }) {
  const cas = nc.correctiveActions;
  if (cas.length === 0) return nc.status ?? "open";
  if (cas.every(ca => ca.status === "verified")) return "resolved";
  if (cas.every(ca => ca.status === "closed" || ca.status === "verified")) return "awaiting_verification";
  if (cas.some(ca => ca.status === "in_progress")) return "in_progress";
  if (cas.some(ca => ca.status === "open")) return "action_raised";
  return nc.status ?? "open";
}

const PIPELINE_STEPS = ["Identified", "Action Raised", "In Progress", "Awaiting Verification", "Resolved"];
function pipelineStep(computed: string): number {
  if (computed === "resolved") return 4;
  if (computed === "awaiting_verification") return 3;
  if (computed === "in_progress") return 2;
  if (computed === "action_raised") return 1;
  return 0;
}

function ComputedStatusBadge({ computed }: { computed: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    open: { bg: "#fee2e2", color: "#991b1b", label: "Open" },
    action_raised: { bg: "#fef3c7", color: "#92400e", label: "Action Raised" },
    in_progress: { bg: "#dbeafe", color: "#1e40af", label: "In Progress" },
    awaiting_verification: { bg: "#fde68a", color: "#78350f", label: "Awaiting Verification" },
    resolved: { bg: "#dcfce7", color: "#166534", label: "Resolved" },
  };
  const s = map[computed] ?? { bg: "#f3f4f6", color: "#374151", label: computed };
  return <Badge style={{ background: s.bg, color: s.color, border: "none", fontSize: "0.72rem", whiteSpace: "nowrap" }}>{s.label}</Badge>;
}

function PipelineBar({ step }: { step: number }) {
  const colors = ["#d1d5db", "#f59e0b", "#3b82f6", "#f97316", "#16a34a"];
  const activeColor = colors[step] ?? "#d1d5db";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 6 }}>
      {PIPELINE_STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 64 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: i <= step ? activeColor : "#e5e7eb", border: `2px solid ${i <= step ? activeColor : "#d1d5db"}`, transition: "background 0.2s" }} />
            <span style={{ fontSize: "0.6rem", color: i <= step ? activeColor : "#9ca3af", marginTop: 2, fontWeight: i === step ? 700 : 400, textAlign: "center", lineHeight: 1.1 }}>{label}</span>
          </div>
          {i < PIPELINE_STEPS.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < step ? activeColor : "#e5e7eb", margin: "-14px 0 0 0", alignSelf: "flex-start", marginTop: 4 }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Issues Register Tab ──────────────────────────────────────────────────────
function IssuesRegisterTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  // ── State ──
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [ncAddOpen, setNcAddOpen] = useState(false);
  const [ncEdit, setNcEdit] = useState<any | null>(null);
  const [ncDeleteId, setNcDeleteId] = useState<number | null>(null);
  const [caAddForNc, setCaAddForNc] = useState<any | null>(null);
  const [caEdit, setCaEdit] = useState<any | null>(null);
  const [caDeleteId, setCaDeleteId] = useState<number | null>(null);

  const emptyNcForm = { category: "", description: "", severity: "", identifiedDate: "", identifiedBy: "", notes: "" };
  const emptyCaForm = { description: "", assignedTo: "", dueDate: "", verifiedBy: "", notes: "" };
  const [ncForm, setNcForm] = useState<any>(emptyNcForm);
  const [caForm, setCaForm] = useState<any>(emptyCaForm);

  // ── Data ──
  const q = useQuery({
    queryKey: ["issues-register", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/issues-register`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => d.issues ?? [],
  });
  const issues: any[] = q.data ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ["issues-register", farmId] });

  // ── NC mutations ──
  const createNc = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/nonconformances`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: (_, vars: any) => {
      toast({ title: "Non-conformance logged" });
      invalidate();
      setNcAddOpen(false);
      setNcForm(emptyNcForm);
      // Auto-expand the new NC on next render
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateNc = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/nonconformances/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Updated" }); invalidate(); setNcEdit(null); setNcForm(emptyNcForm); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteNc = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/nonconformances/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setNcDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  // ── CA mutations ──
  const createCa = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/corrective-actions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Corrective action added" }); invalidate(); setCaAddForNc(null); setCaForm(emptyCaForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateCa = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/corrective-actions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Updated" }); invalidate(); setCaEdit(null); setCaForm(emptyCaForm); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteCa = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/corrective-actions/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setCaDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  // ── Helpers ──
  const toggleExpand = (id: number) => setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const openEditNc = (nc: any) => { setNcForm({ category: nc.category ?? "", description: nc.description ?? "", severity: nc.severity ?? "", identifiedDate: nc.identifiedDate?.slice(0, 10) ?? "", identifiedBy: nc.identifiedBy ?? "", notes: nc.notes ?? "" }); setNcEdit(nc); };
  const openEditCa = (ca: any) => { setCaForm({ description: ca.description ?? "", assignedTo: ca.assignedTo ?? "", dueDate: ca.dueDate?.slice(0, 10) ?? "", verifiedBy: ca.verifiedBy ?? "", notes: ca.notes ?? "", status: ca.status ?? "open" }); setCaEdit(ca); };

  // ── Summary counts ──
  const openCount = issues.filter(nc => { const s = computeNcStatus(nc); return s !== "resolved"; }).length;
  const critCount = issues.filter(nc => nc.severity === "critical" && computeNcStatus(nc) !== "resolved").length;
  const resolvedCount = issues.filter(nc => computeNcStatus(nc) === "resolved").length;
  const overdueCount = issues.filter(nc => {
    const cas = nc.correctiveActions ?? [];
    return cas.some((ca: any) => ca.status !== "verified" && ca.status !== "closed" && ca.dueDate && new Date(ca.dueDate) < new Date());
  }).length;

  const ncFormOpen = ncAddOpen || !!ncEdit;
  const caFormOpen = !!caAddForNc || !!caEdit;

  return (
    <div>
      {/* ── Summary Bar ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {openCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "5px 12px" }}>
              <AlertTriangle size={13} color="#ef4444" />
              <span style={{ fontSize: "0.8rem", color: "#991b1b", fontWeight: 600 }}>{openCount} open {openCount === 1 ? "issue" : "issues"}</span>
            </div>
          )}
          {critCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: "5px 12px" }}>
              <AlertTriangle size={13} color="#dc2626" />
              <span style={{ fontSize: "0.8rem", color: "#7f1d1d", fontWeight: 600 }}>{critCount} critical</span>
            </div>
          )}
          {overdueCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "5px 12px" }}>
              <AlertTriangle size={13} color="#ea580c" />
              <span style={{ fontSize: "0.8rem", color: "#9a3412", fontWeight: 600 }}>{overdueCount} overdue {overdueCount === 1 ? "action" : "actions"}</span>
            </div>
          )}
          {resolvedCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "5px 12px" }}>
              <CheckCircle2 size={13} color="#16a34a" />
              <span style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 600 }}>{resolvedCount} resolved</span>
            </div>
          )}
        </div>
        <Button size="sm" onClick={() => { setNcForm(emptyNcForm); setNcAddOpen(true); }}>
          <Plus size={14} className="mr-1" />Log Non-Conformance
        </Button>
      </div>

      {/* ── Empty state ── */}
      {q.isLoading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
      ) : issues.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af", background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <CheckCircle2 size={36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No issues recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Non-conformances raised during inspections are tracked here, along with their corrective actions and resolution status.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {issues.map((nc: any) => {
            const computed = computeNcStatus(nc);
            const step = pipelineStep(computed);
            const isExpanded = expanded.has(nc.id);
            const cas: any[] = nc.correctiveActions ?? [];
            const openCas = cas.filter(ca => ca.status === "open" || ca.status === "in_progress").length;
            const severityBorderColor: Record<string, string> = { critical: "#ef4444", major: "#f59e0b", minor: "#60a5fa" };
            const borderLeft = `4px solid ${severityBorderColor[nc.severity ?? ""] ?? "#d1d5db"}`;

            return (
              <div key={nc.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", borderLeft }}>
                {/* ── NC Header row ── */}
                <div
                  onClick={() => toggleExpand(nc.id)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", cursor: "pointer" }}
                >
                  <div style={{ paddingTop: 2, color: "#9ca3af", flexShrink: 0 }}>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: "0.72rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(nc.identifiedDate)}</span>
                      {nc.category && <span style={{ fontSize: "0.72rem", background: "#f3f4f6", color: "#374151", borderRadius: 4, padding: "1px 6px" }}>{nc.category}</span>}
                      <SeverityBadge severity={nc.severity} />
                      <ComputedStatusBadge computed={computed} />
                      {cas.length > 0 && (
                        <span style={{ fontSize: "0.72rem", background: openCas > 0 ? "#fef3c7" : "#f0fdf4", color: openCas > 0 ? "#92400e" : "#166534", borderRadius: 4, padding: "1px 7px", border: `1px solid ${openCas > 0 ? "#fde68a" : "#bbf7d0"}` }}>
                          {cas.length} {cas.length === 1 ? "action" : "actions"}{openCas > 0 ? ` · ${openCas} open` : " · all done"}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827", margin: 0, lineHeight: 1.4 }}>{nc.description}</p>
                    {nc.identifiedBy && <p style={{ fontSize: "0.72rem", color: "#9ca3af", margin: "2px 0 0" }}>Identified by {nc.identifiedBy}</p>}
                    <PipelineBar step={step} />
                  </div>
                  <div style={{ display: "flex", gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEditNc(nc)} title="Edit NC" style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}><Pencil size={13} /></button>
                    <button onClick={() => setNcDeleteId(nc.id)} title="Delete NC" style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }}><Trash2 size={13} /></button>
                  </div>
                </div>

                {/* ── Expanded: Corrective Actions ── */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid #f3f4f6", background: "#fafafa" }}>
                    {cas.length === 0 ? (
                      <div style={{ padding: "12px 20px 8px 40px", color: "#9ca3af", fontSize: "0.8rem" }}>
                        No corrective actions yet — add one below.
                      </div>
                    ) : (
                      <div style={{ padding: "8px 14px 4px 40px" }}>
                        {cas.map((ca: any, i: number) => {
                          const isOverdue = ca.dueDate && new Date(ca.dueDate) < new Date() && ca.status !== "verified" && ca.status !== "closed";
                          return (
                            <div key={ca.id} style={{ borderBottom: i < cas.length - 1 ? "1px solid #f3f4f6" : "none", padding: "8px 0", display: "flex", alignItems: "flex-start", gap: 10 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: ca.status === "verified" ? "#16a34a" : ca.status === "closed" ? "#2563eb" : ca.status === "in_progress" ? "#f59e0b" : "#ef4444", marginTop: 6, flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: "0.825rem", fontWeight: 500, color: "#374151", margin: 0 }}>{ca.description}</p>
                                <div style={{ display: "flex", gap: 10, marginTop: 3, flexWrap: "wrap", alignItems: "center" }}>
                                  {ca.assignedTo && <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>→ {ca.assignedTo}</span>}
                                  {ca.dueDate && (
                                    <span style={{ fontSize: "0.72rem", color: isOverdue ? "#dc2626" : "#6b7280", fontWeight: isOverdue ? 600 : 400 }}>
                                      Due {fmt(ca.dueDate)}{isOverdue ? " ⚠ overdue" : ""}
                                    </span>
                                  )}
                                  {ca.verifiedBy && <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>Verified by {ca.verifiedBy}</span>}
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                                <Select value={ca.status} onValueChange={v => updateCa.mutate({ id: ca.id, body: { status: v } })}>
                                  <SelectTrigger style={{ height: 26, fontSize: "0.72rem", padding: "0 6px", width: 130 }}><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                  </SelectContent>
                                </Select>
                                <button onClick={() => openEditCa(ca)} title="Edit action" style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }}><Pencil size={12} /></button>
                                <button onClick={() => setCaDeleteId(ca.id)} title="Delete action" style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 2 }}><Trash2 size={12} /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <div style={{ padding: "8px 14px 12px 40px" }}>
                      <Button size="sm" variant="outline" onClick={() => { setCaForm(emptyCaForm); setCaAddForNc(nc); }}>
                        <Plus size={13} className="mr-1" />Add Corrective Action
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Log / Edit NC Dialog ── */}
      <Dialog open={ncFormOpen} onOpenChange={o => { if (!o) { setNcAddOpen(false); setNcEdit(null); setNcForm(emptyNcForm); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>{ncEdit ? "Edit Non-Conformance" : "Log Non-Conformance"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date Identified <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={ncForm.identifiedDate} onChange={e => setNcForm((f: any) => ({ ...f, identifiedDate: e.target.value }))} /></div>
              <div><Label>Identified By</Label><Input placeholder="Name" value={ncForm.identifiedBy} onChange={e => setNcForm((f: any) => ({ ...f, identifiedBy: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={ncForm.category} onValueChange={v => setNcForm((f: any) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent className="max-h-56">
                    {NC_CATEGORIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Severity</Label>
                <Select value={ncForm.severity || "__none__"} onValueChange={v => setNcForm((f: any) => ({ ...f, severity: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description <span style={{ color: "#ef4444" }}>*</span></Label><Textarea placeholder="Describe the non-conformance in detail..." value={ncForm.description} onChange={e => setNcForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div><Label>Notes</Label><Textarea placeholder="Additional context..." value={ncForm.notes} onChange={e => setNcForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setNcAddOpen(false); setNcEdit(null); setNcForm(emptyNcForm); }}>Cancel</Button>
            <Button onClick={() => ncEdit ? updateNc.mutate({ id: ncEdit.id, body: ncForm }) : createNc.mutate(ncForm)} disabled={!ncForm.identifiedDate || !ncForm.category || !ncForm.description || createNc.isPending || updateNc.isPending}>
              {ncEdit ? "Save Changes" : "Log Issue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit CA Dialog ── */}
      <Dialog open={caFormOpen} onOpenChange={o => { if (!o) { setCaAddForNc(null); setCaEdit(null); setCaForm(emptyCaForm); } }}>
        <DialogContent style={{ maxWidth: 500 }}>
          <DialogHeader>
            <DialogTitle>{caEdit ? "Edit Corrective Action" : "Add Corrective Action"}</DialogTitle>
            {caAddForNc && (
              <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "4px 0 0", lineHeight: 1.4 }}>
                For: <em>{caAddForNc.description?.slice(0, 80)}{(caAddForNc.description?.length ?? 0) > 80 ? "…" : ""}</em>
              </p>
            )}
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Action Description <span style={{ color: "#ef4444" }}>*</span></Label><Textarea placeholder="Describe the corrective action to be taken..." value={caForm.description} onChange={e => setCaForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Assigned To</Label><Input placeholder="Name" value={caForm.assignedTo} onChange={e => setCaForm((f: any) => ({ ...f, assignedTo: e.target.value }))} /></div>
              <div><Label>Due Date</Label><Input type="date" value={caForm.dueDate} onChange={e => setCaForm((f: any) => ({ ...f, dueDate: e.target.value }))} /></div>
            </div>
            {caEdit && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Status</Label>
                  <Select value={caForm.status ?? "open"} onValueChange={v => setCaForm((f: any) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Verified By</Label><Input placeholder="Name" value={caForm.verifiedBy} onChange={e => setCaForm((f: any) => ({ ...f, verifiedBy: e.target.value }))} /></div>
              </div>
            )}
            <div><Label>Notes</Label><Textarea placeholder="Additional notes..." value={caForm.notes} onChange={e => setCaForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCaAddForNc(null); setCaEdit(null); setCaForm(emptyCaForm); }}>Cancel</Button>
            <Button
              onClick={() => caEdit
                ? updateCa.mutate({ id: caEdit.id, body: caForm })
                : createCa.mutate({ ...caForm, nonconformanceId: caAddForNc?.id })
              }
              disabled={!caForm.description || createCa.isPending || updateCa.isPending}
            >
              {caEdit ? "Save Changes" : "Add Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete NC confirm ── */}
      <Dialog open={ncDeleteId !== null} onOpenChange={o => { if (!o) setNcDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Non-Conformance</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure? This will also permanently delete all linked corrective actions.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNcDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => ncDeleteId !== null && deleteNc.mutate(ncDeleteId)} disabled={deleteNc.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete CA confirm ── */}
      <Dialog open={caDeleteId !== null} onOpenChange={o => { if (!o) setCaDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Corrective Action</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this corrective action?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCaDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => caDeleteId !== null && deleteCa.mutate(caDeleteId)} disabled={deleteCa.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const CERT_BODIES = [
  "Red Tractor Assurance",
  "LEAF Marque",
  "Organic Farmers & Growers",
  "Soil Association",
  "RSPCA Assured",
  "Certus (Assured Food Standards)",
  "QMS (Quality Meat Scotland)",
  "HCC Assured",
  "BRCGS",
  "Other",
];

const CERT_SECTORS = [
  "Combinable Crops",
  "Fruit & Vegetables",
  "Fresh Produce",
  "Beef & Lamb",
  "Dairy",
  "Pigs",
  "Poultry",
  "Eggs",
  "Horticulture",
  "Arable",
  "Other",
];

function CertStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    active: { bg: "#dcfce7", color: "#166534" },
    expired: { bg: "#fee2e2", color: "#991b1b" },
    suspended: { bg: "#fef3c7", color: "#92400e" },
    surrendered: { bg: "#f3f4f6", color: "#6b7280" },
    pending: { bg: "#eff6ff", color: "#1e40af" },
  };
  const s = map[status] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <Badge style={{ background: s.bg, color: s.color, border: "none", textTransform: "capitalize", fontSize: "0.75rem" }}>
      {status}
    </Badge>
  );
}

function AssuranceCertsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const emptyForm = { certificationBody: "", scheme: "", certNumber: "", sectors: "", assessorName: "", assessorMembershipNo: "", issueDate: "", expiryDate: "", status: "active", nextVisitDue: "", notes: "" };
  const [form, setForm] = useState<any>(emptyForm);
  const certificationBodies = useLookupStrings("certification_bodies", CERT_BODIES);

  const q = useQuery({
    queryKey: ["assurance-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/assurance-certs`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["assurance-certs", farmId] });

  const saveMut = useMutation({
    mutationFn: (body: any) => {
      const payload = {
        ...body,
        issueDate: body.issueDate ? new Date(body.issueDate).toISOString() : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate).toISOString() : null,
        nextVisitDue: body.nextVisitDue ? new Date(body.nextVisitDue).toISOString() : null,
      };
      if (editRecord) return fetch(`/api/farms/${farmId}/assurance-certs/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch(`/api/farms/${farmId}/assurance-certs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => { toast({ title: editRecord ? "Certificate updated" : "Certificate saved" }); invalidate(); setAddOpen(false); setEditRecord(null); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/assurance-certs/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const records: any[] = q.data ?? [];
  const activeCount = records.filter(r => r.status === "active").length;

  const openAdd = () => { setEditRecord(null); setForm(emptyForm); setAddOpen(true); };
  const openEdit = (r: any) => {
    setEditRecord(r);
    setForm({ ...r, issueDate: r.issueDate?.slice(0, 10) ?? "", expiryDate: r.expiryDate?.slice(0, 10) ?? "", nextVisitDue: r.nextVisitDue?.slice(0, 10) ?? "" });
    setAddOpen(true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {activeCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px" }}>
              <Award size={13} color="#16a34a" />
              <span style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 600 }}>{activeCount} active certificate{activeCount !== 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
        <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Add Certificate</Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Award size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No assurance certificates recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Track Red Tractor, LEAF Marque, Organic and other farm assurance certificates here.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Certification Body", "Scheme / Sector", "Cert No.", "Assessor", "Membership No.", "Issue Date", "Expiry", "Next Visit", "Status", "Doc / Portal", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => {
                const isExpired = r.expiryDate && new Date(r.expiryDate) < new Date();
                return (
                  <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600 }}>{r.certificationBody}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.sectors || r.scheme || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: r.certNumber ? "monospace" : "inherit" }}>{r.certNumber || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.assessorName || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: r.assessorMembershipNo ? "monospace" : "inherit" }}>{r.assessorMembershipNo || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.issueDate)}</td>
                    <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }}>
                      <span style={{ color: isExpired ? "#991b1b" : "#166534", fontWeight: isExpired ? 600 : 400 }}>
                        {isExpired && "⚠ "}{fmt(r.expiryDate)}
                      </span>
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.nextVisitDue)}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}><CertStatusBadge status={r.status} /></td>
                    <td style={{ padding: "0.25rem 0.5rem" }}>
                      <DocCell
                        endpoint={`/api/farms/${farmId}/assurance-certs/${r.id}`}
                        queryKey={["assurance-certs", farmId]}
                        documentPath={r.documentPath ?? null}
                        documentName={r.documentName ?? null}
                        portalUrl={r.certificationBody?.toLowerCase().includes("red tractor") ? "https://assured.redtractor.org.uk" : undefined}
                      />
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => setViewRecord(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="View"><Eye size={13} /></button>
                        <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: 560 }}>
            <DialogHeader><DialogTitle>Assurance Certificate</DialogTitle></DialogHeader>
            {(() => {
              const r = viewRecord;
              const fmt = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
              const now = new Date();
              const isExpired = r.expiryDate && new Date(r.expiryDate) < now;
              const F = ({ label, value }: { label: string; value?: string | null }) => (
                <div><div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value || "—"}</div></div>
              );
              return (
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Certification Body" value={r.certificationBody} />
                    <F label="Scheme / Sector" value={r.sectors || r.scheme} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Certificate Number" value={r.certNumber} />
                    <F label="Status" value={r.status} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Assessor Name" value={r.assessorName} />
                    <F label="Assessor Membership No." value={r.assessorMembershipNo} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <F label="Issue Date" value={fmt(r.issueDate)} />
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>Expiry Date</div>
                      <div style={{ fontSize: "0.875rem", fontWeight: isExpired ? 600 : 400, color: isExpired ? "#991b1b" : "#111827" }}>{isExpired ? "⚠ " : ""}{fmt(r.expiryDate)}</div>
                    </div>
                    <F label="Next Visit Due" value={fmt(r.nextVisitDue)} />
                  </div>
                  {r.notes && <F label="Notes" value={r.notes} />}
                  <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>Certificate Document</div>
                    {r.documentPath ? (
                      <a href={`/api/storage${r.documentPath}`} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.875rem", color: "#2563eb", textDecoration: "none" }}>
                        <Paperclip size={14} />{r.documentName || "View Certificate"}
                      </a>
                    ) : (
                      <span style={{ fontSize: "0.875rem", color: "#d1d5db" }}>No certificate document attached</span>
                    )}
                  </div>
                </div>
              );
            })()}
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}>Edit Certificate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm); } }}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Certificate" : "Add Assurance Certificate"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Certification Body <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.certificationBody} onValueChange={v => setForm((f: any) => ({ ...f, certificationBody: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{certificationBodies.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Scheme / Sector</Label>
                <Select value={form.sectors} onValueChange={v => setForm((f: any) => ({ ...f, sectors: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{CERT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Certificate Number</Label><Input placeholder="e.g. RT-CC-2025-001234" value={form.certNumber} onChange={e => setForm((f: any) => ({ ...f, certNumber: e.target.value }))} /></div>
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="surrendered">Surrendered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Assessor Name</Label><Input placeholder="Name of auditor / assessor" value={form.assessorName} onChange={e => setForm((f: any) => ({ ...f, assessorName: e.target.value }))} /></div>
              <div><Label>Assessor Membership No.</Label><Input placeholder="e.g. FACTS / CRoPS / BASIS no." value={form.assessorMembershipNo} onChange={e => setForm((f: any) => ({ ...f, assessorMembershipNo: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Issue Date</Label><Input type="date" value={form.issueDate} onChange={e => setForm((f: any) => ({ ...f, issueDate: e.target.value }))} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={e => setForm((f: any) => ({ ...f, expiryDate: e.target.value }))} /></div>
            </div>
            <div><Label>Next Visit Due</Label><Input type="date" value={form.nextVisitDue} onChange={e => setForm((f: any) => ({ ...f, nextVisitDue: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea placeholder="Location of certificate, renewal actions, etc." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm); }}>Cancel</Button>
            <Button onClick={() => saveMut.mutate(form)} disabled={!form.certificationBody || saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Add Certificate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Certificate</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to remove this certificate record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function InspectionsPageFull() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("inspections");

  return (
    <AppLayout title="Inspections & Compliance">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Track Red Tractor and internal inspections, log non-conformances, manage corrective actions, and record farm assurance certificates.
        </p>
        <TabBar className="mb-6">
          <TabButton active={tab === "inspections"} onClick={() => setTab("inspections")}>Inspections</TabButton>
          <TabButton active={tab === "issues-register"} onClick={() => setTab("issues-register")}>Issues Register</TabButton>
          <TabButton active={tab === "assurance-certs"} onClick={() => setTab("assurance-certs")}>Assurance Certificates</TabButton>
        </TabBar>
        {farmId && tab === "inspections" && <InspectionsTab farmId={farmId} />}
        {farmId && tab === "issues-register" && <IssuesRegisterTab farmId={farmId} />}
        {farmId && tab === "assurance-certs" && <AssuranceCertsTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
