import React, { useState } from "react";
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
import { Plus, Trash2, AlertTriangle, CheckCircle2, ClipboardList, Wrench } from "lucide-react";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

type Tab = "inspections" | "nonconformances" | "corrective-actions";

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
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ inspectionDate: "", inspectorName: "", inspectionBody: "", inspectionType: "", overallResult: "", summary: "", nextInspectionDue: "", notes: "" });

  const q = useQuery({
    queryKey: ["inspections", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/inspections`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["inspections", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/inspections`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Inspection saved" }); invalidate(); setAddOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/inspections/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => setForm({ inspectionDate: "", inspectorName: "", inspectionBody: "", inspectionType: "", overallResult: "", summary: "", nextInspectionDue: "", notes: "" });
  const records: any[] = q.data ?? [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Inspection</Button>
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
                {["Date", "Type", "Inspector", "Body", "Result", "Next Due", ""].map(h => (
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
                  <td style={{ padding: "0.5rem" }}>
                    <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) resetForm(); }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>Record Inspection</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.inspectionDate} onChange={e => setForm((f: any) => ({ ...f, inspectionDate: e.target.value }))} /></div>
              <div><Label>Type</Label>
                <Select value={form.inspectionType} onValueChange={v => setForm((f: any) => ({ ...f, inspectionType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Red Tractor", "Internal Audit", "EHO", "Trading Standards", "Organic", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Inspector Name <span style={{ color: "#ef4444" }}>*</span></Label><Input value={form.inspectorName} onChange={e => setForm((f: any) => ({ ...f, inspectorName: e.target.value }))} /></div>
              <div><Label>Inspection Body</Label><Input placeholder="e.g. Red Tractor Assurance" value={form.inspectionBody} onChange={e => setForm((f: any) => ({ ...f, inspectionBody: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Overall Result</Label>
                <Select value={form.overallResult} onValueChange={v => setForm((f: any) => ({ ...f, overallResult: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.inspectionDate || !form.inspectorName || createMut.isPending}>Save Inspection</Button>
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
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ category: "", description: "", severity: "", identifiedDate: "", identifiedBy: "", status: "open", notes: "" });

  const q = useQuery({
    queryKey: ["nonconformances", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/nonconformances`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["nonconformances", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/nonconformances`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Non-conformance logged" }); invalidate(); setAddOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/nonconformances/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Status updated" }); invalidate(); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/nonconformances/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => setForm({ category: "", description: "", severity: "", identifiedDate: "", identifiedBy: "", status: "open", notes: "" });
  const records: any[] = q.data ?? [];

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
        <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }}><Plus size={14} className="mr-1" />Log Non-Conformance</Button>
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
                    <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) resetForm(); }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>Log Non-Conformance</DialogTitle></DialogHeader>
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
                <Select value={form.severity} onValueChange={v => setForm((f: any) => ({ ...f, severity: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Description <span style={{ color: "#ef4444" }}>*</span></Label><Textarea placeholder="Describe the non-conformance in detail..." value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div><Label>Notes</Label><Textarea placeholder="Additional context..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.identifiedDate || !form.category || !form.description || createMut.isPending}>Save</Button>
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
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ nonconformanceId: "", description: "", assignedTo: "", dueDate: "", status: "open", notes: "" });

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
    onSuccess: () => { toast({ title: "Corrective action saved" }); invalidate(); setAddOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) => fetch(`/api/farms/${farmId}/corrective-actions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Status updated" }); invalidate(); },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/corrective-actions/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => setForm({ nonconformanceId: "", description: "", assignedTo: "", dueDate: "", status: "open", notes: "" });
  const records: any[] = q.data ?? [];
  const ncs: any[] = ncQ.data ?? [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Corrective Action</Button>
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
                    <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { setAddOpen(o); if (!o) resetForm(); }}>
        <DialogContent style={{ maxWidth: 520 }}>
          <DialogHeader><DialogTitle>Add Corrective Action</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Linked Non-Conformance</Label>
              <Select value={form.nonconformanceId} onValueChange={v => setForm((f: any) => ({ ...f, nonconformanceId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select NC..." /></SelectTrigger>
                <SelectContent>
                  {ncs.map((nc: any) => <SelectItem key={nc.id} value={String(nc.id)}>{nc.description.slice(0, 60)}{nc.description.length > 60 ? "…" : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Action Description <span style={{ color: "#ef4444" }}>*</span></Label><Textarea placeholder="Describe the corrective action to be taken..." value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Assigned To</Label><Input placeholder="Name" value={form.assignedTo} onChange={e => setForm((f: any) => ({ ...f, assignedTo: e.target.value }))} /></div>
              <div><Label>Due Date</Label><Input type="date" value={form.dueDate} onChange={e => setForm((f: any) => ({ ...f, dueDate: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea placeholder="Additional notes..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.description || createMut.isPending}>Save</Button>
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

export default function InspectionsPageFull() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("inspections");

  return (
    <AppLayout title="Inspections & Compliance">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Track Red Tractor and internal inspections, log non-conformances, and manage corrective actions through to closure.
        </p>
        <TabBar className="mb-6">
          <TabButton active={tab === "inspections"} onClick={() => setTab("inspections")}>Inspections</TabButton>
          <TabButton active={tab === "nonconformances"} onClick={() => setTab("nonconformances")}>Non-Conformances</TabButton>
          <TabButton active={tab === "corrective-actions"} onClick={() => setTab("corrective-actions")}>Corrective Actions</TabButton>
        </TabBar>
        {farmId && tab === "inspections" && <InspectionsTab farmId={farmId} />}
        {farmId && tab === "nonconformances" && <NonconformancesTab farmId={farmId} />}
        {farmId && tab === "corrective-actions" && <CorrectiveActionsTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
