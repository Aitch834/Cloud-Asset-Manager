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
import { Plus, Trash2, AlertTriangle, CheckCircle2, ClipboardList, Wrench, Award, Pencil, Eye, Paperclip, File as FileIcon, Loader2, ExternalLink } from "lucide-react";

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

type Tab = "inspections" | "nonconformances" | "corrective-actions" | "assurance-certs";

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

function NonconformancesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const emptyForm = { category: "", description: "", severity: "", identifiedDate: "", identifiedBy: "", status: "open", notes: "" };
  const [addOpen, setAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const q = useQuery({
    queryKey: ["nonconformances", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nonconformances`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["nonconformances", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/nonconformances`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Non-conformance logged" }); invalidate(); setAddOpen(false); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/nonconformances/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: (_, vars) => { toast({ title: Object.keys(vars.body).length === 1 && "status" in vars.body ? "Status updated" : "Non-conformance updated" }); invalidate(); setEditRecord(null); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/nonconformances/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const openEdit = (r: any) => { setForm({ category: r.category ?? "", description: r.description ?? "", severity: r.severity ?? "", identifiedDate: r.identifiedDate?.slice(0, 10) ?? "", identifiedBy: r.identifiedBy ?? "", status: r.status ?? "open", notes: r.notes ?? "" }); setEditRecord(r); };
  const records: any[] = q.data ?? [];
  const formOpen = addOpen || !!editRecord;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {records.filter(r => r.status === "open").length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px" }}>
              <AlertTriangle size={13} color="#ef4444" />
              <span style={{ fontSize: "0.8rem", color: "#991b1b", fontWeight: 600 }}>{records.filter(r => r.status === "open").length} open</span>
            </div>
          )}
          {records.filter(r => r.status === "closed" || r.status === "resolved").length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px" }}>
              <CheckCircle2 size={13} color="#16a34a" />
              <span style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 600 }}>{records.filter(r => r.status === "closed" || r.status === "resolved").length} resolved</span>
            </div>
          )}
        </div>
        <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }}><Plus size={14} className="mr-1" />Log Non-Conformance</Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <CheckCircle2 size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No non-conformances recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Issues raised during inspections are logged and tracked here.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date Identified", "Category", "Description", "Severity", "Identified By", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.identifiedDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.category || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500, maxWidth: 220 }}>{r.description}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}><SeverityBadge severity={r.severity} /></td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.identifiedBy || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    <Select value={r.status} onValueChange={v => updateMut.mutate({ id: r.id, body: { status: v } })}>
                      <SelectTrigger style={{ height: 28, fontSize: "0.75rem", padding: "0 8px" }}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
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
            <DialogHeader><DialogTitle>Non-Conformance</DialogTitle></DialogHeader>
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
                    <F label="Date Identified" value={fmtD(r.identifiedDate)} />
                    <F label="Identified By" value={r.identifiedBy} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Category" value={r.category} />
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>Severity</div>
                      <SeverityBadge severity={r.severity} />
                    </div>
                  </div>
                  <F label="Description" value={r.description} />
                  <div>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>Status</div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.notes && <F label="Notes" value={r.notes} />}
                </div>
              );
            })()}
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}>Edit Non-Conformance</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={formOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Non-Conformance" : "Log Non-Conformance"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date Identified <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.identifiedDate} onChange={e => setForm((f: any) => ({ ...f, identifiedDate: e.target.value }))} /></div>
              <div><Label>Identified By</Label><Input placeholder="Name" value={form.identifiedBy} onChange={e => setForm((f: any) => ({ ...f, identifiedBy: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.category} onValueChange={v => setForm((f: any) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Animal Health & Welfare", "Biosecurity", "Crop Production", "Documentation", "Equipment & Machinery", "Environmental", "Food Safety", "Hygiene", "Record Keeping", "Staff Training", "Traceability", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Severity</Label>
                <Select value={form.severity || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, severity: v === "__none__" ? "" : v }))}>
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
            <div><Label>Description <span style={{ color: "#ef4444" }}>*</span></Label><Textarea placeholder="Describe the non-conformance in detail..." value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} /></div>
            {editRecord && (
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div><Label>Notes</Label><Textarea placeholder="Additional context..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm); }}>Cancel</Button>
            <Button onClick={() => editRecord ? updateMut.mutate({ id: editRecord.id, body: form }) : createMut.mutate(form)} disabled={!form.identifiedDate || !form.category || !form.description || createMut.isPending || updateMut.isPending}>{editRecord ? "Save Changes" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Non-Conformance</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure? This will also delete linked corrective actions.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CorrectiveActionsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const emptyForm = { nonconformanceId: "", description: "", assignedTo: "", dueDate: "", status: "open", verifiedBy: "", notes: "" };
  const [addOpen, setAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const ncQ = useQuery({
    queryKey: ["nonconformances", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nonconformances`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const q = useQuery({
    queryKey: ["corrective-actions", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/corrective-actions`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["corrective-actions", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/corrective-actions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, nonconformanceId: body.nonconformanceId ? parseInt(body.nonconformanceId) : undefined }) }),
    onSuccess: () => { toast({ title: "Corrective action saved" }); invalidate(); setAddOpen(false); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/corrective-actions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: (_, vars) => { toast({ title: Object.keys(vars.body).length === 1 && "status" in vars.body ? "Status updated" : "Corrective action updated" }); invalidate(); setEditRecord(null); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/corrective-actions/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const openEdit = (r: any) => { setForm({ nonconformanceId: r.nonconformanceId ? String(r.nonconformanceId) : "", description: r.description ?? "", assignedTo: r.assignedTo ?? "", dueDate: r.dueDate?.slice(0, 10) ?? "", status: r.status ?? "open", verifiedBy: r.verifiedBy ?? "", notes: r.notes ?? "" }); setEditRecord(r); };
  const records: any[] = q.data ?? [];
  const ncs: any[] = ncQ.data ?? [];
  const formOpen = addOpen || !!editRecord;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={() => { setForm(emptyForm); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Corrective Action</Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Wrench size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No corrective actions recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Actions to resolve non-conformances are tracked here.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Linked NC", "Action", "Assigned To", "Due Date", "Status", "Verified By", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.75rem", maxWidth: 160 }}>
                    {r.ncDescription ? (
                      <span style={{ background: "#eff6ff", color: "#1e40af", borderRadius: 4, padding: "2px 6px" }} title={r.ncDescription}>
                        {r.ncDescription.length > 40 ? r.ncDescription.slice(0, 40) + "…" : r.ncDescription}
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500, maxWidth: 200 }}>{r.description}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.assignedTo || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.dueDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    <Select value={r.status} onValueChange={v => updateMut.mutate({ id: r.id, body: { status: v } })}>
                      <SelectTrigger style={{ height: 28, fontSize: "0.75rem", padding: "0 8px" }}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.verifiedBy || "—"}</td>
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
            <DialogHeader><DialogTitle>Corrective Action</DialogTitle></DialogHeader>
            {(() => {
              const r = viewRecord;
              const fmtD = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
              const F = ({ label, value }: { label: string; value?: string | null }) => (
                <div><div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value || "—"}</div></div>
              );
              return (
                <div style={{ display: "grid", gap: 14 }}>
                  {r.ncDescription && (
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>Linked Non-Conformance</div>
                      <span style={{ background: "#eff6ff", color: "#1e40af", borderRadius: 4, padding: "3px 8px", fontSize: "0.8rem" }}>{r.ncDescription}</span>
                    </div>
                  )}
                  <F label="Action Description" value={r.description} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Assigned To" value={r.assignedTo} />
                    <F label="Due Date" value={fmtD(r.dueDate)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 4 }}>Status</div>
                      <StatusBadge status={r.status} />
                    </div>
                    <F label="Verified By" value={r.verifiedBy} />
                  </div>
                  {r.notes && <F label="Notes" value={r.notes} />}
                </div>
              );
            })()}
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}>Edit Action</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={formOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm); } }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Corrective Action" : "Add Corrective Action"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Linked Non-Conformance</Label>
              <Select value={form.nonconformanceId || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, nonconformanceId: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select NC..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {ncs.map((nc: any) => <SelectItem key={nc.id} value={String(nc.id)}>{nc.description.slice(0, 60)}{nc.description.length > 60 ? "…" : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Action Description <span style={{ color: "#ef4444" }}>*</span></Label><Textarea placeholder="Describe the corrective action to be taken..." value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Assigned To</Label><Input placeholder="Name" value={form.assignedTo} onChange={e => setForm((f: any) => ({ ...f, assignedTo: e.target.value }))} /></div>
              <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm((f: any) => ({ ...f, dueDate: e.target.value }))} /></div>
            </div>
            {editRecord && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Verified By</Label><Input placeholder="Name" value={form.verifiedBy} onChange={e => setForm((f: any) => ({ ...f, verifiedBy: e.target.value }))} /></div>
              </div>
            )}
            <div><Label>Notes</Label><Textarea placeholder="Additional notes..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm); }}>Cancel</Button>
            <Button onClick={() => editRecord ? updateMut.mutate({ id: editRecord.id, body: { ...form, nonconformanceId: form.nonconformanceId ? parseInt(form.nonconformanceId) : undefined } }) : createMut.mutate(form)} disabled={!form.description || createMut.isPending || updateMut.isPending}>{editRecord ? "Save Changes" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Corrective Action</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this corrective action?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
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
          <TabButton active={tab === "nonconformances"} onClick={() => setTab("nonconformances")}>Non-Conformances</TabButton>
          <TabButton active={tab === "corrective-actions"} onClick={() => setTab("corrective-actions")}>Corrective Actions</TabButton>
          <TabButton active={tab === "assurance-certs"} onClick={() => setTab("assurance-certs")}>Assurance Certificates</TabButton>
        </TabBar>
        {farmId && tab === "inspections" && <InspectionsTab farmId={farmId} />}
        {farmId && tab === "nonconformances" && <NonconformancesTab farmId={farmId} />}
        {farmId && tab === "corrective-actions" && <CorrectiveActionsTab farmId={farmId} />}
        {farmId && tab === "assurance-certs" && <AssuranceCertsTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
