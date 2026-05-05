import React, { useState, useRef, useEffect } from "react";
import { useSearch } from "wouter";
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
import { OtherSelect } from "@/components/ui/other-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Plus, Trash2, AlertTriangle, CheckCircle2, ClipboardList, Wrench, Award, Pencil, Eye, Paperclip, File as FileIcon, Loader2, ExternalLink, ChevronDown, ChevronRight, Printer, RefreshCw } from "lucide-react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";

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

function InspectionsTab({ farmId, openInspId }: { farmId: number; openInspId?: number }) {
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

  // Auto-open a specific inspection record when deep-linked from Week Ahead
  useEffect(() => {
    if (!openInspId || !q.data) return;
    const record = (q.data as any[]).find((r: any) => r.id === openInspId);
    if (record) setViewRecord(record);
  }, [openInspId, q.data]);

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

  const [showOlder, setShowOlder] = useState(false);

  const openEdit = (r: any) => { setForm({ inspectionDate: r.inspectionDate?.slice(0, 10) ?? "", inspectorName: r.inspectorName ?? "", inspectionBody: r.inspectionBody ?? "", inspectionType: r.inspectionType ?? "", overallResult: r.overallResult ?? "", summary: r.summary ?? "", nextInspectionDue: r.nextInspectionDue?.slice(0, 10) ?? "", notes: r.notes ?? "" }); setEditRecord(r); };
  const records: any[] = q.data ?? [];
  const formOpen = addOpen || !!editRecord;

  // ── Rolling 2-year window ──
  // Default: current year + previous year. Older inspections go behind "Show older".
  const thisYear = new Date().getFullYear();
  const cutoffYear = thisYear - 1; // show thisYear and thisYear-1 by default
  const olderRecords = records.filter(r => {
    const yr = r.inspectionDate ? new Date(r.inspectionDate).getFullYear() : thisYear;
    return yr < cutoffYear;
  });
  const olderCount = olderRecords.length;
  // If the deep-linked inspection is older, force-expand
  const deepLinkIsOlder = openInspId ? olderRecords.some(r => r.id === openInspId) : false;
  const displayedRecords = (showOlder || deepLinkIsOlder) ? records : records.filter(r => {
    const yr = r.inspectionDate ? new Date(r.inspectionDate).getFullYear() : thisYear;
    return yr >= cutoffYear;
  });

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
        <>
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
                {displayedRecords.map((r: any, i: number) => {
                  const yr = r.inspectionDate ? new Date(r.inspectionDate).getFullYear() : thisYear;
                  const isOlder = yr < cutoffYear;
                  return (
                    <tr key={r.id} style={{ borderBottom: i < displayedRecords.length - 1 ? "1px solid #f3f4f6" : "none", background: isOlder ? "#fafafa" : "#fff", opacity: isOlder ? 0.85 : 1 }}>
                      <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>
                        {fmt(r.inspectionDate)}
                        {isOlder && <span style={{ marginLeft: 6, fontSize: "0.65rem", background: "#f3f4f6", color: "#9ca3af", borderRadius: 3, padding: "1px 5px" }}>archived</span>}
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Older inspections toggle ── */}
          {olderCount > 0 && (
            <div style={{ textAlign: "center", paddingTop: 8 }}>
              <button
                onClick={() => setShowOlder(v => !v)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", color: "#6b7280", display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 6 }}
              >
                {showOlder
                  ? <><ChevronUp size={13} /> Hide {olderCount} older {olderCount === 1 ? "inspection" : "inspections"} (before {cutoffYear})</>
                  : <><ChevronDown size={13} /> Show {olderCount} older {olderCount === 1 ? "inspection" : "inspections"} (before {cutoffYear})</>}
              </button>
            </div>
          )}
        </>
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
                <OtherSelect
                  options={inspectionTypes}
                  value={form.inspectionType}
                  onValueChange={v => setForm((f: any) => ({ ...f, inspectionType: v }))}
                  placeholder="Select type..."
                  specifyPlaceholder="Specify inspection type…"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Inspector Name <span style={{ color: "#ef4444" }}>*</span></Label><Input value={form.inspectorName} onChange={e => setForm((f: any) => ({ ...f, inspectorName: e.target.value }))} /></div>
              <div><Label>Inspection Body</Label>
                <OtherSelect
                  options={certificationBodies}
                  value={form.inspectionBody}
                  onValueChange={v => setForm((f: any) => ({ ...f, inspectionBody: v }))}
                  placeholder="Select body..."
                  specifyPlaceholder="Specify certification body…"
                />
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
function IssuesRegisterTab({ farmId, openCaId }: { farmId: number; openCaId?: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();

  // ── State ──
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const highlightCaRef = useRef<HTMLDivElement | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [ncAddOpen, setNcAddOpen] = useState(false);
  const [ncEdit, setNcEdit] = useState<any | null>(null);
  const [ncDeleteId, setNcDeleteId] = useState<number | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<any>(null);
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

  // Auto-expand NC containing the deep-linked corrective action
  useEffect(() => {
    if (!openCaId || !q.data) return;
    const parentNc = (q.data as any[]).find((nc: any) =>
      (nc.correctiveActions ?? []).some((ca: any) => ca.id === openCaId)
    );
    if (parentNc) {
      setExpanded(prev => { const s = new Set(prev); s.add(parentNc.id); return s; });
      // Scroll to the highlighted CA after render
      setTimeout(() => { highlightCaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, 300);
    }
  }, [openCaId, q.data]);

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

  // ── Archive filter ──
  // "Resolved this year" = the latest updatedAt across the NC and its CAs falls in the current calendar year.
  const thisYear = new Date().getFullYear();
  const resolvedAt = (nc: any): number => {
    const ts = [
      nc.updatedAt ? new Date(nc.updatedAt).getTime() : 0,
      ...(nc.correctiveActions ?? []).map((ca: any) => ca.updatedAt ? new Date(ca.updatedAt).getTime() : 0),
    ];
    return Math.max(...ts);
  };
  const isArchived = (nc: any) => computeNcStatus(nc) === "resolved" && new Date(resolvedAt(nc)).getFullYear() < thisYear;

  const archivedCount = issues.filter(isArchived).length;

  // If the deep-linked CA is inside an archived issue, force-show the archive
  const deepLinkIsArchived = openCaId
    ? issues.some(nc => isArchived(nc) && (nc.correctiveActions ?? []).some((ca: any) => ca.id === openCaId))
    : false;

  const displayedIssues = (showArchived || deepLinkIsArchived)
    ? issues
    : issues.filter(nc => !isArchived(nc));

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
      ) : displayedIssues.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <CheckCircle2 size={28} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
          <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>All clear — no open issues</p>
          <p style={{ fontSize: "0.875rem" }}>
            {archivedCount > 0 ? `${archivedCount} resolved ${archivedCount === 1 ? "issue" : "issues"} from prior years are in the archive.` : "No issues have been logged yet."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {displayedIssues.map((nc: any) => {
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
                    <button onClick={() => setRaiseTaskFor(nc)} title="Raise Task" style={{ background: "none", border: "none", cursor: "pointer", color: "#8b5cf6", padding: 4 }}><ClipboardList size={13} /></button>
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
                          const isHighlighted = openCaId === ca.id;
                          return (
                            <div key={ca.id} ref={isHighlighted ? highlightCaRef : null} style={{ borderBottom: i < cas.length - 1 ? "1px solid #f3f4f6" : "none", padding: "8px 6px", display: "flex", alignItems: "flex-start", gap: 10, borderRadius: isHighlighted ? 8 : 0, background: isHighlighted ? "#fef9c3" : "transparent", outline: isHighlighted ? "2px solid #fbbf24" : "none", transition: "background 0.5s" }}>
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

          {/* ── Archive toggle footer (inside list) ── */}
          {archivedCount > 0 && (
            <div style={{ textAlign: "center", paddingTop: 4 }}>
              <button
                onClick={() => setShowArchived(v => !v)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", color: "#6b7280", display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 6 }}
              >
                {showArchived
                  ? <><ChevronUp size={13} /> Hide {archivedCount} archived {archivedCount === 1 ? "issue" : "issues"} from prior years</>
                  : <><ChevronDown size={13} /> Show {archivedCount} archived {archivedCount === 1 ? "issue" : "issues"} from prior years</>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Archive toggle when ALL issues are archived (empty state has its own text) ── */}
      {!q.isLoading && issues.length > 0 && displayedIssues.length === 0 && archivedCount > 0 && (
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button
            onClick={() => setShowArchived(true)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.8125rem", color: "#6b7280", display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 6 }}
          >
            <ChevronDown size={13} /> Show {archivedCount} archived {archivedCount === 1 ? "issue" : "issues"} from prior years
          </button>
        </div>
      )}

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`NC Resolution — ${raiseTaskFor.category ?? "Non-Conformance"}`}
          defaultDescription={`${raiseTaskFor.description ?? ""}${raiseTaskFor.severity ? ` · Severity: ${raiseTaskFor.severity}` : ""}${raiseTaskFor.identifiedDate ? ` · Identified: ${new Date(raiseTaskFor.identifiedDate).toLocaleDateString("en-GB")}` : ""}`}
          module="inspections"
        />
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

function computeCertStatus(cert: { status: string; expiryDate?: string | null }): string {
  const stored = cert.status ?? "active";
  if (["suspended", "surrendered", "superseded", "withdrawn"].includes(stored)) return stored;
  if (cert.expiryDate) {
    const exp = new Date(cert.expiryDate);
    const now = new Date();
    if (exp < now) return "expired";
    const soon = new Date(now);
    soon.setDate(soon.getDate() + 60);
    if (exp < soon) return "expiring_soon";
  }
  if (stored === "pending") return "pending";
  return "active";
}

function CertStatusBadge({ status, expiryDate }: { status: string; expiryDate?: string | null }) {
  const cs = computeCertStatus({ status, expiryDate });
  const map: Record<string, { bg: string; color: string; label: string }> = {
    active:        { bg: "#dcfce7", color: "#166534", label: "Active" },
    expiring_soon: { bg: "#fef3c7", color: "#92400e", label: "Expiring Soon" },
    expired:       { bg: "#fee2e2", color: "#991b1b", label: "Expired" },
    suspended:     { bg: "#fef3c7", color: "#92400e", label: "Suspended" },
    surrendered:   { bg: "#f3f4f6", color: "#6b7280", label: "Surrendered" },
    superseded:    { bg: "#f3f4f6", color: "#9ca3af", label: "Superseded" },
    pending:       { bg: "#eff6ff", color: "#1e40af", label: "Pending" },
  };
  const s = map[cs] ?? { bg: "#f3f4f6", color: "#374151", label: cs };
  return (
    <Badge style={{ background: s.bg, color: s.color, border: "none", fontSize: "0.75rem" }}>
      {s.label}
    </Badge>
  );
}

function ContinuityTimeline({ certs }: { certs: any[] }) {
  const certsWithDates = certs.filter(c => c.issueDate || c.expiryDate);
  if (certsWithDates.length === 0) return null;

  const today = new Date();
  const fiveYearsAgo = new Date(today); fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  const twoYearsAhead = new Date(today); twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);

  let winStart = fiveYearsAgo.getTime();
  let winEnd = twoYearsAhead.getTime();
  certsWithDates.forEach(c => {
    if (c.issueDate) winStart = Math.min(winStart, new Date(c.issueDate).getTime());
    if (c.expiryDate) winEnd = Math.max(winEnd, new Date(c.expiryDate).getTime());
  });
  const winDuration = winEnd - winStart;
  if (winDuration <= 0) return null;

  const toPct = (ts: number) => Math.max(0, Math.min(100, ((ts - winStart) / winDuration) * 100));
  const todayPct = toPct(today.getTime());

  const groupMap = new Map<string, any[]>();
  certsWithDates.forEach(c => {
    const key = [c.certificationBody, c.sectors || c.scheme].filter(Boolean).join(" — ") || "Unknown";
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(c);
  });
  groupMap.forEach(g => g.sort((a, b) => new Date(a.issueDate || 0).getTime() - new Date(b.issueDate || 0).getTime()));

  const ticks: { pct: number; label: string }[] = [];
  const startYear = new Date(winStart).getFullYear();
  const endYear = new Date(winEnd).getFullYear() + 1;
  for (let y = startYear; y <= endYear; y++) {
    const pct = toPct(new Date(y, 0, 1).getTime());
    if (pct >= 0 && pct <= 100) ticks.push({ pct, label: String(y) });
  }

  const ss: Record<string, { bg: string }> = {
    active:        { bg: "#16a34a" },
    expiring_soon: { bg: "#d97706" },
    expired:       { bg: "#dc2626" },
    suspended:     { bg: "#d97706" },
    surrendered:   { bg: "#6b7280" },
    superseded:    { bg: "#9ca3af" },
    pending:       { bg: "#2563eb" },
  };

  return (
    <div style={{ marginBottom: 20, border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
      <div style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <Award size={13} color="#166534" />
        <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>Certification Continuity</span>
        <span style={{ fontSize: "0.72rem", color: "#9ca3af" }}>Gaps = periods without active coverage</span>
      </div>
      <div style={{ padding: "14px 16px 10px" }}>
        {Array.from(groupMap.entries()).map(([scheme, schemeCerts]) => (
          <div key={scheme} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 10, marginBottom: 10, alignItems: "center" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#374151", lineHeight: 1.35, paddingRight: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={scheme}>{scheme}</div>
            <div style={{ position: "relative", height: 26, background: "#f3f4f6", borderRadius: 4 }}>
              <div style={{ position: "absolute", left: `${todayPct}%`, top: 0, bottom: 0, width: 2, background: "#374151", opacity: 0.45, zIndex: 3 }} />
              {schemeCerts.map(cert => {
                const cs = computeCertStatus(cert);
                const st = cert.issueDate ? toPct(new Date(cert.issueDate).getTime()) : 0;
                const en = cert.expiryDate ? toPct(new Date(cert.expiryDate).getTime()) : todayPct;
                const w = Math.max(0.4, en - st);
                const bg = (ss[cs] ?? { bg: "#9ca3af" }).bg;
                return (
                  <div key={cert.id} title={`${cert.certificationBody}${cert.certNumber ? ` · ${cert.certNumber}` : ""} · ${fmt(cert.issueDate)} → ${fmt(cert.expiryDate)} · ${cs.replace(/_/g," ")}`}
                    style={{ position: "absolute", left: `${st}%`, width: `${w}%`, top: 3, bottom: 3, background: bg, borderRadius: 3, zIndex: 1, cursor: "help", overflow: "hidden", display: "flex", alignItems: "center", paddingLeft: 4 }}>
                    {w > 8 && cert.certNumber && (
                      <span style={{ fontSize: "0.6rem", color: "#fff", fontWeight: 700, whiteSpace: "nowrap" }}>{cert.certNumber}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 10, marginTop: 2 }}>
          <div />
          <div style={{ position: "relative", height: 18 }}>
            {ticks.map(tick => (
              <div key={tick.label} style={{ position: "absolute", left: `${tick.pct}%`, transform: "translateX(-50%)", fontSize: "0.63rem", color: "#9ca3af", whiteSpace: "nowrap" }}>{tick.label}</div>
            ))}
            <div style={{ position: "absolute", left: `${todayPct}%`, transform: "translateX(-50%)", fontSize: "0.63rem", color: "#374151", fontWeight: 700, whiteSpace: "nowrap" }}>Today</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap", paddingLeft: 210 }}>
          {[["active","Active"],["expiring_soon","Expiring Soon"],["expired","Expired"],["superseded","Superseded"],["pending","Pending"]].map(([cs, label]) => (
            <div key={cs} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: (ss[cs] ?? { bg: "#9ca3af" }).bg }} />
              <span style={{ fontSize: "0.65rem", color: "#6b7280" }}>{label}</span>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 2, height: 10, background: "#374151", opacity: 0.45 }} />
            <span style={{ fontSize: "0.65rem", color: "#6b7280" }}>Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type CertFilter = "all" | "active" | "expiring_soon" | "expired" | "other";

function AssuranceCertsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [renewingFrom, setRenewingFrom] = useState<number | null>(null);
  const [filterTab, setFilterTab] = useState<CertFilter>("all");
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
  const closeForm = () => { setAddOpen(false); setEditRecord(null); setRenewingFrom(null); setForm(emptyForm); };

  const saveMut = useMutation({
    mutationFn: async (body: any) => {
      const payload = {
        ...body,
        issueDate: body.issueDate ? new Date(body.issueDate).toISOString() : null,
        expiryDate: body.expiryDate ? new Date(body.expiryDate).toISOString() : null,
        nextVisitDue: body.nextVisitDue ? new Date(body.nextVisitDue).toISOString() : null,
      };
      if (editRecord) {
        return fetch(`/api/farms/${farmId}/assurance-certs/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      const res = await fetch(`/api/farms/${farmId}/assurance-certs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (renewingFrom) {
        await fetch(`/api/farms/${farmId}/assurance-certs/${renewingFrom}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "superseded" }) });
      }
      return res;
    },
    onSuccess: () => {
      toast({ title: renewingFrom ? "Certificate renewed — previous marked as superseded" : editRecord ? "Certificate updated" : "Certificate saved" });
      invalidate(); closeForm();
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/assurance-certs/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const records: any[] = q.data ?? [];

  const activeCt = records.filter(r => computeCertStatus(r) === "active").length;
  const expiringSoonCt = records.filter(r => computeCertStatus(r) === "expiring_soon").length;
  const expiredCt = records.filter(r => computeCertStatus(r) === "expired").length;
  const otherCt = records.filter(r => ["suspended", "surrendered", "superseded", "pending"].includes(computeCertStatus(r))).length;

  const filteredRecords = filterTab === "all" ? records : records.filter(r => {
    const cs = computeCertStatus(r);
    if (filterTab === "active") return cs === "active";
    if (filterTab === "expiring_soon") return cs === "expiring_soon";
    if (filterTab === "expired") return cs === "expired";
    if (filterTab === "other") return ["suspended", "surrendered", "superseded", "pending"].includes(cs);
    return true;
  });

  const openAdd = () => { setEditRecord(null); setRenewingFrom(null); setForm(emptyForm); setAddOpen(true); };
  const openEdit = (r: any) => {
    setEditRecord(r); setRenewingFrom(null);
    setForm({ ...r, issueDate: r.issueDate?.slice(0, 10) ?? "", expiryDate: r.expiryDate?.slice(0, 10) ?? "", nextVisitDue: r.nextVisitDue?.slice(0, 10) ?? "" });
    setAddOpen(true);
  };
  const openRenew = (r: any) => {
    setRenewingFrom(r.id); setEditRecord(null);
    setForm({ ...emptyForm, certificationBody: r.certificationBody, scheme: r.scheme || "", sectors: r.sectors || "", assessorName: r.assessorName || "", assessorMembershipNo: r.assessorMembershipNo || "" });
    setAddOpen(true);
  };

  const FILTER_TABS: { key: CertFilter; label: string; count: number }[] = [
    { key: "all",          label: "All",           count: records.length },
    { key: "active",       label: "Active",        count: activeCt },
    { key: "expiring_soon",label: "Expiring Soon", count: expiringSoonCt },
    { key: "expired",      label: "Expired",       count: expiredCt },
    { key: "other",        label: "Other",         count: otherCt },
  ];

  return (
    <div>
      {/* ── Header: status pills + Add button ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {activeCt > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px" }}>
              <Award size={13} color="#16a34a" />
              <span style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 600 }}>{activeCt} active certificate{activeCt !== 1 ? "s" : ""}</span>
            </div>
          )}
          {expiringSoonCt > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "4px 10px" }}>
              <AlertTriangle size={13} color="#d97706" />
              <span style={{ fontSize: "0.8rem", color: "#92400e", fontWeight: 600 }}>{expiringSoonCt} expiring within 60 days</span>
            </div>
          )}
          {expiredCt > 0 && activeCt === 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px" }}>
              <AlertTriangle size={13} color="#dc2626" />
              <span style={{ fontSize: "0.8rem", color: "#991b1b", fontWeight: 600 }}>{expiredCt} expired — renewal required</span>
            </div>
          )}
        </div>
        <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Add Certificate</Button>
      </div>

      {/* ── Continuity Timeline ── */}
      {records.length > 0 && <ContinuityTimeline certs={records} />}

      {/* ── Filter tabs ── */}
      {records.length > 0 && (
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb", marginBottom: 12 }}>
          {FILTER_TABS.filter(t => t.count > 0 || t.key === "all").map(tab => {
            const isAlert = (tab.key === "expired" && expiredCt > 0) || (tab.key === "expiring_soon" && expiringSoonCt > 0);
            return (
              <button key={tab.key} onClick={() => setFilterTab(tab.key)}
                style={{ border: "none", background: "none", padding: "8px 14px", fontSize: "0.8125rem", fontWeight: filterTab === tab.key ? 600 : 400,
                  color: filterTab === tab.key ? (isAlert ? "#991b1b" : "#166534") : isAlert ? "#b91c1c" : "#6b7280",
                  borderBottom: filterTab === tab.key ? `2px solid ${isAlert ? "#dc2626" : "#166534"}` : "2px solid transparent",
                  cursor: "pointer", whiteSpace: "nowrap", marginBottom: -1 }}>
                {tab.label}{tab.count > 0 ? ` (${tab.count})` : ""}
              </button>
            );
          })}
        </div>
      )}

      {q.isLoading ? (
        <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
      ) : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Award size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No assurance certificates recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Track Red Tractor, LEAF Marque, Organic and other farm assurance certificates here.</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <p style={{ textAlign: "center", padding: "2rem", color: "#9ca3af", fontSize: "0.875rem" }}>No certificates match this filter.</p>
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
              {filteredRecords.map((r: any, i: number) => {
                const cs = computeCertStatus(r);
                const isExpired = cs === "expired";
                const isExpiringSoon = cs === "expiring_soon";
                const rowBg = isExpired ? "#fff5f5" : isExpiringSoon ? "#fffdf0" : "#fff";
                return (
                  <tr key={r.id} style={{ borderBottom: i < filteredRecords.length - 1 ? "1px solid #f3f4f6" : "none", background: rowBg }}>
                    <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600 }}>{r.certificationBody}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.sectors || r.scheme || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: r.certNumber ? "monospace" : "inherit" }}>{r.certNumber || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.assessorName || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: r.assessorMembershipNo ? "monospace" : "inherit" }}>{r.assessorMembershipNo || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.issueDate)}</td>
                    <td style={{ padding: "0.625rem 0.875rem", whiteSpace: "nowrap" }}>
                      <span style={{ color: isExpired ? "#991b1b" : isExpiringSoon ? "#92400e" : "#166534", fontWeight: (isExpired || isExpiringSoon) ? 600 : 400 }}>
                        {isExpired && "⚠ "}{isExpiringSoon && "⚡ "}{fmt(r.expiryDate)}
                      </span>
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.nextVisitDue)}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}><CertStatusBadge status={r.status} expiryDate={r.expiryDate} /></td>
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
                      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
                        <button onClick={() => setViewRecord(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="View details"><Eye size={13} /></button>
                        <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="Edit"><Pencil size={13} /></button>
                        {(isExpired || isExpiringSoon) && (
                          <button onClick={() => openRenew(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a", padding: 4 }} title="Renew certificate"><RefreshCw size={13} /></button>
                        )}
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

      {/* ── View dialog ── */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: 560 }}>
            <DialogHeader><DialogTitle>Assurance Certificate</DialogTitle></DialogHeader>
            {(() => {
              const r = viewRecord;
              const cs = computeCertStatus(r);
              const isExp = cs === "expired";
              const vfmt = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
              const VF = ({ label, value }: { label: string; value?: string | null }) => (
                <div>
                  <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value || "—"}</div>
                </div>
              );
              return (
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <VF label="Certification Body" value={r.certificationBody} />
                    <VF label="Scheme / Sector" value={r.sectors || r.scheme} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <VF label="Certificate Number" value={r.certNumber} />
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>Effective Status</div>
                      <CertStatusBadge status={r.status} expiryDate={r.expiryDate} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <VF label="Assessor Name" value={r.assessorName} />
                    <VF label="Assessor Membership No." value={r.assessorMembershipNo} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <VF label="Issue Date" value={vfmt(r.issueDate)} />
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>Expiry Date</div>
                      <div style={{ fontSize: "0.875rem", fontWeight: isExp ? 600 : 400, color: isExp ? "#991b1b" : "#111827" }}>{isExp ? "⚠ " : ""}{vfmt(r.expiryDate)}</div>
                    </div>
                    <VF label="Next Visit Due" value={vfmt(r.nextVisitDue)} />
                  </div>
                  {r.notes && <VF label="Notes" value={r.notes} />}
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
              {viewRecord && (computeCertStatus(viewRecord) === "expired" || computeCertStatus(viewRecord) === "expiring_soon") && (
                <Button variant="outline" style={{ color: "#16a34a", borderColor: "#bbf7d0" }} onClick={() => { const rec = viewRecord; setViewRecord(null); openRenew(rec); }}>
                  <RefreshCw size={13} className="mr-1.5" />Renew
                </Button>
              )}
              <Button onClick={() => { const rec = viewRecord; setViewRecord(null); openEdit(rec); }}>Edit Certificate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Add / Edit / Renew dialog ── */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) closeForm(); }}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader>
            <DialogTitle>{renewingFrom ? "Renew Certificate" : editRecord ? "Edit Certificate" : "Add Assurance Certificate"}</DialogTitle>
            {renewingFrom && (
              <p style={{ fontSize: "0.8125rem", color: "#6b7280", marginTop: 4 }}>
                Fill in the new certificate details. The previous certificate will be marked as <strong>Superseded</strong> automatically.
              </p>
            )}
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Certification Body <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.certificationBody} onValueChange={v => setForm((f: any) => ({ ...f, certificationBody: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{certificationBodies.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Scheme / Sector</Label>
                <Select value={form.sectors || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, sectors: v === "__none__" ? "" : v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {CERT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Certificate Number</Label><Input className="mt-1" placeholder="e.g. RT-CC-2026-001234" value={form.certNumber} onChange={e => setForm((f: any) => ({ ...f, certNumber: e.target.value }))} /></div>
              <div>
                <Label>Stored Status</Label>
                <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="surrendered">Surrendered</SelectItem>
                    <SelectItem value="superseded">Superseded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Assessor Name</Label><Input className="mt-1" placeholder="Name of auditor / assessor" value={form.assessorName} onChange={e => setForm((f: any) => ({ ...f, assessorName: e.target.value }))} /></div>
              <div><Label>Assessor Membership No.</Label><Input className="mt-1" placeholder="e.g. FACTS / BASIS no." value={form.assessorMembershipNo} onChange={e => setForm((f: any) => ({ ...f, assessorMembershipNo: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Issue Date</Label><Input className="mt-1" type="date" value={form.issueDate} onChange={e => setForm((f: any) => ({ ...f, issueDate: e.target.value }))} /></div>
              <div><Label>Expiry Date</Label><Input className="mt-1" type="date" value={form.expiryDate} onChange={e => setForm((f: any) => ({ ...f, expiryDate: e.target.value }))} /></div>
            </div>
            <div><Label>Next Visit Due</Label><Input className="mt-1" type="date" value={form.nextVisitDue} onChange={e => setForm((f: any) => ({ ...f, nextVisitDue: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea className="mt-1" placeholder="Location of certificate, renewal actions, etc." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeForm}>Cancel</Button>
            <Button onClick={() => saveMut.mutate(form)} disabled={!form.certificationBody || saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : renewingFrom ? "Save Renewal" : editRecord ? "Save Changes" : "Add Certificate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete dialog ── */}
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

// ─── Compliance Report ────────────────────────────────────────────────────────

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function getCropYearStart(): Date {
  const today = new Date();
  const oct1 = new Date(today.getFullYear(), 9, 1);
  return today >= oct1 ? oct1 : new Date(today.getFullYear() - 1, 9, 1);
}

function getCropYearLabel(): string {
  const start = getCropYearStart();
  const y = start.getFullYear();
  return `${y}/${String(y + 1).slice(2)}`;
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#166534", fontFamily: "system-ui, sans-serif", margin: "0 0 12px", borderBottom: "2px solid #dcfce7", paddingBottom: 6 }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function ReportTable({ headers, rows, lastColWide }: { headers: string[]; rows: (string | React.ReactNode)[][]; lastColWide?: boolean }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", fontFamily: "system-ui, sans-serif" }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: "7px 10px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid #f3f4f6" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "7px 10px", color: "#374151", verticalAlign: "top", maxWidth: lastColWide && ci === row.length - 1 ? 260 : undefined }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultPill({ value }: { value: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    pass: { bg: "#dcfce7", color: "#166534" },
    conditional_pass: { bg: "#fef3c7", color: "#92400e" },
    fail: { bg: "#fee2e2", color: "#991b1b" },
    pending: { bg: "#f3f4f6", color: "#374151" },
  };
  const s = map[value] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.color, fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize", whiteSpace: "nowrap" }}>
      {value.replace(/_/g, " ")}
    </span>
  );
}

function SeverityPill({ value }: { value: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    critical: { bg: "#fee2e2", color: "#991b1b" },
    major: { bg: "#fef3c7", color: "#92400e" },
    minor: { bg: "#eff6ff", color: "#1e40af" },
  };
  const s = map[value] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ padding: "2px 7px", borderRadius: 4, background: s.bg, color: s.color, fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize" }}>
      {value}
    </span>
  );
}

function StatusPill({ value }: { value: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    open: { bg: "#fee2e2", color: "#991b1b" },
    action_raised: { bg: "#fef3c7", color: "#92400e" },
    in_progress: { bg: "#dbeafe", color: "#1e40af" },
    awaiting_verification: { bg: "#fde68a", color: "#78350f" },
    verified: { bg: "#dcfce7", color: "#166534" },
    closed: { bg: "#dcfce7", color: "#166534" },
  };
  const s = map[value] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ padding: "2px 7px", borderRadius: 4, background: s.bg, color: s.color, fontSize: "0.72rem", fontWeight: 600, textTransform: "capitalize", whiteSpace: "nowrap" }}>
      {value.replace(/_/g, " ")}
    </span>
  );
}

function ComplianceReportModal({ farmId, onClose }: { farmId: number; onClose: () => void }) {
  const farmQ = useQuery({
    queryKey: ["farm-record", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()),
  });
  const inspQ = useQuery({
    queryKey: ["inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/inspections`).then(r => r.json()),
    select: (d: any) => (d.records ?? []) as any[],
  });
  const issuesQ = useQuery({
    queryKey: ["issues-register", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/issues-register`).then(r => r.json()),
    select: (d: any) => (d.issues ?? []) as any[],
  });
  const certsQ = useQuery({
    queryKey: ["assurance-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/assurance-certs`).then(r => r.json()),
    select: (d: any) => (d.records ?? []) as any[],
  });

  const farm = farmQ.data?.record;
  const allInspections: any[] = inspQ.data ?? [];
  const allIssues: any[] = issuesQ.data ?? [];
  const allCerts: any[] = certsQ.data ?? [];

  const cropYearStart = getCropYearStart();
  const cropYearLabel = getCropYearLabel();
  const cropYearInspections = allInspections
    .filter(r => r.inspectionDate && new Date(r.inspectionDate) >= cropYearStart)
    .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime());

  const outstandingIssues = allIssues
    .filter(nc => computeNcStatus(nc) !== "resolved")
    .sort((a, b) => {
      const sevOrder: Record<string, number> = { critical: 0, major: 1, minor: 2 };
      return (sevOrder[a.severity] ?? 3) - (sevOrder[b.severity] ?? 3);
    });

  const activeCerts = allCerts.filter(c => { const cs = computeCertStatus(c); return cs === "active" || cs === "expiring_soon" || cs === "pending"; });
  const isLoading = farmQ.isLoading || inspQ.isLoading || issuesQ.isLoading || certsQ.isLoading;
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const printReport = () => {
    const contentEl = document.getElementById("compliance-report-content");
    if (!contentEl) return;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Compliance Report — ${today}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; font-family: system-ui, sans-serif; }
    @page { size: A4 portrait; margin: 12mm 15mm; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>${contentEl.innerHTML}</body>
</html>`;

    const win = window.open("", "_blank", "width=980,height=760,toolbar=0,menubar=0,scrollbars=1");
    if (!win) {
      alert("Pop-ups are blocked — please allow pop-ups for this site to open the print dialog.");
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.addEventListener("load", () => {
      win.focus();
      win.addEventListener("afterprint", () => win.close());
      win.print();
    });
  };

  return (
    <div id="compliance-report-root" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, overflow: "auto", padding: "24px 16px 48px" }}>
      <div style={{ background: "#fff", maxWidth: 920, margin: "0 auto", borderRadius: 12, boxShadow: "0 24px 64px rgba(0,0,0,0.35)", overflow: "hidden" }}>

          {/* Controls bar */}
          <div style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Printer size={16} style={{ color: "#166534" }} />
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#374151" }}>Compliance Report — Preview</span>
              <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>· Crop Year {cropYearLabel}</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button size="sm" onClick={printReport} disabled={isLoading}>
                <Printer size={13} className="mr-1.5" />Print / Save PDF
              </Button>
              <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: "5rem", textAlign: "center", color: "#9ca3af" }}>
              <Loader2 size={28} style={{ margin: "0 auto 12px", animation: "spin 1s linear infinite", display: "block" }} />
              <p style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.875rem" }}>Loading report data…</p>
            </div>
          ) : (
            <div id="compliance-report-content" style={{ padding: "40px 48px", fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "0.875rem", color: "#111827", lineHeight: 1.6 }}>

              {/* ── Report header ── */}
              <div style={{ borderBottom: "3px solid #166534", paddingBottom: 20, marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "#9ca3af", fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>
                      BDE Farm Trac · Compliance &amp; Inspections Report
                    </div>
                    <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "#111827", margin: "0 0 6px", fontFamily: "system-ui, sans-serif" }}>
                      {farm?.name ?? "—"}
                    </h1>
                    {farm?.redTractorId && (
                      <div style={{ fontSize: "0.875rem", fontFamily: "system-ui, sans-serif", color: "#374151" }}>
                        <span style={{ fontWeight: 600 }}>RT Membership ID:</span> {farm.redTractorId}
                      </div>
                    )}
                    {farm?.address && (
                      <div style={{ fontSize: "0.8rem", color: "#6b7280", fontFamily: "system-ui, sans-serif", marginTop: 2 }}>{farm.address}</div>
                    )}
                  </div>
                  <div style={{ textAlign: "right", fontFamily: "system-ui, sans-serif", fontSize: "0.8rem", color: "#6b7280", flexShrink: 0 }}>
                    <div style={{ fontWeight: 600, color: "#374151", fontSize: "0.875rem" }}>Report Date</div>
                    <div style={{ marginBottom: 6 }}>{today}</div>
                    <div style={{ fontWeight: 600, color: "#374151", fontSize: "0.875rem" }}>Crop Year</div>
                    <div>{cropYearLabel}</div>
                    <div style={{ marginTop: 8, fontSize: "0.68rem", color: "#9ca3af", maxWidth: 160 }}>For assessor and compliance body review</div>
                  </div>
                </div>
              </div>

              {/* ── Summary counts ── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 36, fontFamily: "system-ui, sans-serif" }}>
                {[
                  { label: "Inspections this year", value: cropYearInspections.length, accent: "#166534" },
                  { label: "Active certificates", value: activeCerts.length, accent: "#1e40af" },
                  { label: "Outstanding issues", value: outstandingIssues.length, accent: outstandingIssues.length > 0 ? "#b91c1c" : "#166534" },
                  { label: "Critical / major", value: outstandingIssues.filter(nc => nc.severity === "critical" || nc.severity === "major").length, accent: outstandingIssues.filter(nc => nc.severity === "critical" || nc.severity === "major").length > 0 ? "#b91c1c" : "#166534" },
                ].map(item => (
                  <div key={item.label} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: "1.75rem", fontWeight: 700, color: item.accent, lineHeight: 1 }}>{item.value}</div>
                    <div style={{ fontSize: "0.68rem", color: "#6b7280", marginTop: 4 }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* ── Section 1: Assurance Certificates ── */}
              <ReportSection title="1. Assurance Certificates">
                {activeCerts.length === 0 ? (
                  <p style={{ color: "#9ca3af", fontStyle: "italic", fontFamily: "system-ui, sans-serif", fontSize: "0.85rem" }}>No active assurance certificates recorded.</p>
                ) : (
                  <ReportTable
                    headers={["Certification Body", "Scheme / Sector", "Cert Number", "Status", "Issue Date", "Expiry Date", "Next Visit Due"]}
                    rows={activeCerts.map(c => [
                      c.certificationBody || "—",
                      c.sectors || "—",
                      c.certNumber || "—",
                      <span style={{ textTransform: "capitalize", fontWeight: computeCertStatus(c) === "expiring_soon" ? 600 : 400, color: computeCertStatus(c) === "expiring_soon" ? "#92400e" : "inherit" }}>{computeCertStatus(c).replace(/_/g, " ")}</span>,
                      fmtDate(c.issueDate),
                      fmtDate(c.expiryDate),
                      fmtDate(c.nextVisitDue),
                    ])}
                  />
                )}
              </ReportSection>

              {/* ── Section 2: Inspections this crop year ── */}
              <ReportSection title={`2. Inspections — Crop Year ${cropYearLabel} (from ${fmtDate(cropYearStart.toISOString())})`}>
                {cropYearInspections.length === 0 ? (
                  <p style={{ color: "#9ca3af", fontStyle: "italic", fontFamily: "system-ui, sans-serif", fontSize: "0.85rem" }}>No inspections recorded for the current crop year.</p>
                ) : (
                  <ReportTable
                    lastColWide
                    headers={["Date", "Type", "Inspector", "Body", "Result", "Summary"]}
                    rows={cropYearInspections.map(r => [
                      fmtDate(r.inspectionDate),
                      r.inspectionType || "—",
                      r.inspectorName || "—",
                      r.inspectionBody || "—",
                      r.overallResult ? <ResultPill value={r.overallResult} /> : <span style={{ color: "#d1d5db" }}>—</span>,
                      <span style={{ fontSize: "0.78rem", color: "#6b7280" }}>{r.summary || (r.notes ? r.notes : "—")}</span>,
                    ])}
                  />
                )}
              </ReportSection>

              {/* ── Section 3: Outstanding Issues ── */}
              <ReportSection title="3. Outstanding Issues Register">
                <p style={{ fontSize: "0.78rem", color: "#6b7280", fontFamily: "system-ui, sans-serif", marginBottom: 14, fontStyle: "italic" }}>
                  All unresolved non-conformances are shown below, regardless of when they were raised. Resolved items are omitted.
                </p>
                {outstandingIssues.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px", border: "1px solid #dcfce7", borderRadius: 8, background: "#f0fdf4" }}>
                    <CheckCircle2 size={24} style={{ color: "#16a34a", margin: "0 auto 8px", display: "block" }} />
                    <p style={{ color: "#166534", fontWeight: 600, fontFamily: "system-ui, sans-serif", margin: 0 }}>No outstanding issues — all non-conformances resolved.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {outstandingIssues.map((nc, i) => {
                      const computed = computeNcStatus(nc);
                      const isCritical = nc.severity === "critical";
                      const isMajor = nc.severity === "major";
                      const rowBg = isCritical ? "#fef2f2" : isMajor ? "#fffbeb" : "#fafafa";
                      return (
                        <div key={nc.id} style={{ border: `1px solid ${isCritical ? "#fecaca" : isMajor ? "#fde68a" : "#e5e7eb"}`, borderRadius: 8, overflow: "hidden" }}>
                          {/* NC header */}
                          <div style={{ background: rowBg, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", color: "#9ca3af", marginBottom: 3 }}>
                                NC {i + 1} &nbsp;·&nbsp; {nc.category || "Uncategorised"} &nbsp;·&nbsp; Identified {fmtDate(nc.identifiedDate)}{nc.identifiedBy ? ` by ${nc.identifiedBy}` : ""}
                              </div>
                              <div style={{ fontFamily: "system-ui, sans-serif", fontWeight: 600, color: "#111827", fontSize: "0.875rem" }}>
                                {nc.description}
                              </div>
                              {nc.notes && (
                                <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.78rem", color: "#6b7280", marginTop: 4 }}>
                                  {nc.notes}
                                </div>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                              {nc.severity && <SeverityPill value={nc.severity} />}
                              <StatusPill value={computed} />
                            </div>
                          </div>
                          {/* Corrective actions */}
                          {nc.correctiveActions?.length > 0 && (
                            <div style={{ padding: "8px 14px 10px", background: "#fff" }}>
                              <div style={{ fontFamily: "system-ui, sans-serif", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.06em", color: "#9ca3af", marginBottom: 6 }}>
                                Corrective Actions ({nc.correctiveActions.length})
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {nc.correctiveActions.map((ca: any) => (
                                  <div key={ca.id} style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px 110px", gap: 8, alignItems: "center", padding: "5px 10px", background: "#f9fafb", borderRadius: 6, fontFamily: "system-ui, sans-serif", fontSize: "0.78rem" }}>
                                    <div><span style={{ color: "#9ca3af", marginRight: 6 }}>→</span>{ca.description}</div>
                                    <div style={{ color: "#6b7280" }}>{ca.assignedTo ? `${ca.assignedTo}` : <span style={{ color: "#d1d5db" }}>Unassigned</span>}</div>
                                    <div style={{ color: "#6b7280" }}>{ca.dueDate ? `Due ${fmtDate(ca.dueDate)}` : <span style={{ color: "#d1d5db" }}>No due date</span>}</div>
                                    <div><StatusPill value={ca.status || "open"} /></div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {(!nc.correctiveActions || nc.correctiveActions.length === 0) && (
                            <div style={{ padding: "6px 14px 8px", background: "#fff", fontFamily: "system-ui, sans-serif", fontSize: "0.78rem", color: "#f59e0b" }}>
                              ⚠ No corrective actions logged for this non-conformance.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ReportSection>

              {/* ── Footer ── */}
              <div style={{ marginTop: 40, paddingTop: 14, borderTop: "1px solid #e5e7eb", fontFamily: "system-ui, sans-serif", fontSize: "0.7rem", color: "#9ca3af", display: "flex", justifyContent: "space-between" }}>
                <span>BDE Farm Trac · bdefarmtrac.co.uk · Barnett Davies Enterprises Ltd.</span>
                <span>Generated {today} · For compliance review purposes</span>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InspectionsPageFull() {
  const { farmId } = useAppStore();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const urlTab = params.get("tab") as Tab | null;
  const urlInspId = params.get("id") ? parseInt(params.get("id")!, 10) : undefined;
  const urlCaId = params.get("caId") ? parseInt(params.get("caId")!, 10) : undefined;

  const [tab, setTab] = useState<Tab>(urlTab && ["inspections", "issues-register", "assurance-certs"].includes(urlTab) ? urlTab : "inspections");
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <AppLayout title="Inspections & Compliance">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div className="flex items-start justify-between mb-4 gap-4">
          <p className="text-sm text-gray-500">
            Track Red Tractor and internal inspections, log non-conformances, manage corrective actions, and record farm assurance certificates.
          </p>
          <Button size="sm" variant="outline" className="shrink-0" onClick={() => setReportOpen(true)}>
            <Printer size={14} className="mr-1.5" />Print Compliance Report
          </Button>
        </div>
        <TabBar className="mb-6">
          <TabButton active={tab === "inspections"} onClick={() => setTab("inspections")}>Inspections</TabButton>
          <TabButton active={tab === "issues-register"} onClick={() => setTab("issues-register")}>Issues Register</TabButton>
          <TabButton active={tab === "assurance-certs"} onClick={() => setTab("assurance-certs")}>Assurance Certificates</TabButton>
        </TabBar>
        {farmId && tab === "inspections" && <InspectionsTab farmId={farmId} openInspId={urlInspId} />}
        {farmId && tab === "issues-register" && <IssuesRegisterTab farmId={farmId} openCaId={urlCaId} />}
        {farmId && tab === "assurance-certs"  && <AssuranceCertsTab farmId={farmId} />}
        {farmId && reportOpen && <ComplianceReportModal farmId={farmId} onClose={() => setReportOpen(false)} />}
      </div>
    </AppLayout>
  );
}
