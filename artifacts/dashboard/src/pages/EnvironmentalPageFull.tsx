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
import { Plus, Trash2, Leaf, TreePine } from "lucide-react";

type Tab = "features" | "schemes";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtAmt = (pence: number | null | undefined) => {
  if (pence == null) return "—";
  return `£${(pence / 100).toFixed(2)}`;
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    active: { bg: "#dcfce7", color: "#166534" },
    completed: { bg: "#eff6ff", color: "#1e40af" },
    expired: { bg: "#fee2e2", color: "#991b1b" },
    pending: { bg: "#fef3c7", color: "#92400e" },
  };
  const s = map[status] ?? { bg: "#f3f4f6", color: "#374151" };
  return <Badge style={{ background: s.bg, color: s.color, border: "none", textTransform: "capitalize", fontSize: "0.75rem" }}>{status}</Badge>;
}

function FeatureTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    hedgerow: "Hedgerow",
    pond: "Pond",
    woodland: "Woodland",
    wetland: "Wetland",
    grassland: "Grassland",
    wildflower_margin: "Wildflower Margin",
    watercourse: "Watercourse",
    buffer_strip: "Buffer Strip",
    other: "Other",
  };
  return <span>{labels[type] ?? type}</span>;
}

function EnvironmentalFeaturesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({
    featureType: "", description: "", areaHectares: "", lengthMetres: "",
    managementPractice: "", dateRecorded: "", notes: "",
  });

  const q = useQuery({
    queryKey: ["environmental-features", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/environmental-features`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["environmental-features", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/environmental-features`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Feature saved" }); invalidate(); setAddOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/environmental-features/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => setForm({ featureType: "", description: "", areaHectares: "", lengthMetres: "", managementPractice: "", dateRecorded: "", notes: "" });
  const records: any[] = q.data ?? [];

  const totalHa = records.reduce((s, r) => s + (r.areaHectares ? parseFloat(r.areaHectares) : 0), 0);
  const totalM = records.reduce((s, r) => s + (r.lengthMetres ? parseFloat(r.lengthMetres) : 0), 0);

  return (
    <div>
      {records.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Total Features</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#166534" }}>{records.length}</p>
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Total Area</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#166534" }}>{totalHa.toFixed(2)} ha</p>
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Total Length</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#166534" }}>{totalM > 1000 ? `${(totalM / 1000).toFixed(1)} km` : `${Math.round(totalM)} m`}</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Feature</Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Leaf size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No environmental features recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Map hedgerows, ponds, woodland and other habitats on your farm.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Feature Type", "Description", "Area (ha)", "Length (m)", "Management Practice", "Date Recorded", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500 }}><FeatureTypeLabel type={r.featureType} /></td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 200 }}>{r.description || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.areaHectares != null ? parseFloat(r.areaHectares).toFixed(2) : "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.lengthMetres != null ? parseFloat(r.lengthMetres).toFixed(0) : "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.managementPractice || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.dateRecorded)}</td>
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
        <DialogContent style={{ maxWidth: 500 }}>
          <DialogHeader><DialogTitle>Add Environmental Feature</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Feature Type <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.featureType} onValueChange={v => setForm((f: any) => ({ ...f, featureType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["hedgerow", "pond", "woodland", "wetland", "grassland", "wildflower_margin", "watercourse", "buffer_strip", "other"].map(t => (
                      <SelectItem key={t} value={t}><FeatureTypeLabel type={t} /></SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date Recorded <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.dateRecorded} onChange={e => setForm((f: any) => ({ ...f, dateRecorded: e.target.value }))} /></div>
            </div>
            <div><Label>Description</Label><Input placeholder="e.g. Northern boundary hedgerow" value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Area (hectares)</Label><Input type="number" step="0.0001" min="0" value={form.areaHectares} onChange={e => setForm((f: any) => ({ ...f, areaHectares: e.target.value }))} /></div>
              <div><Label>Length (metres)</Label><Input type="number" step="0.1" min="0" value={form.lengthMetres} onChange={e => setForm((f: any) => ({ ...f, lengthMetres: e.target.value }))} /></div>
            </div>
            <div><Label>Management Practice</Label><Input placeholder="e.g. Annual trim, no autumn cutting" value={form.managementPractice} onChange={e => setForm((f: any) => ({ ...f, managementPractice: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.featureType || !form.dateRecorded || createMut.isPending}>Save Feature</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Feature</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Delete this environmental feature record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AgriEnvSchemesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({
    schemeName: "", agreementNumber: "", startDate: "", endDate: "",
    annualPaymentPence: "", obligations: "", status: "active", notes: "",
  });

  const q = useQuery({
    queryKey: ["agri-schemes", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/agri-schemes`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["agri-schemes", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/agri-schemes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, annualPaymentPence: body.annualPaymentPence ? Math.round(parseFloat(body.annualPaymentPence) * 100) : null }),
    }),
    onSuccess: () => { toast({ title: "Scheme saved" }); invalidate(); setAddOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/agri-schemes/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => setForm({ schemeName: "", agreementNumber: "", startDate: "", endDate: "", annualPaymentPence: "", obligations: "", status: "active", notes: "" });
  const records: any[] = q.data ?? [];

  const activeSchemes = records.filter(r => r.status === "active");
  const totalAnnual = activeSchemes.reduce((s, r) => s + (r.annualPaymentPence ?? 0), 0);

  return (
    <div>
      {records.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Active Schemes</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e40af" }}>{activeSchemes.length}</p>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "0.75rem 1rem" }}>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Total Annual Payment</p>
            <p style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e40af" }}>{fmtAmt(totalAnnual)}</p>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Scheme</Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <TreePine size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No agri-environment schemes</p>
          <p style={{ fontSize: "0.875rem" }}>Record Countryside Stewardship, SFI, and other agri-environment scheme agreements.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Scheme Name", "Agreement No.", "Start Date", "End Date", "Annual Payment", "Status", "Obligations", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600 }}>{r.schemeName}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.agreementNumber || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.startDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.endDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtAmt(r.annualPaymentPence)}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}><StatusBadge status={r.status || "active"} /></td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 220, fontSize: "0.8rem" }}>{r.obligations || "—"}</td>
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
          <DialogHeader><DialogTitle>Add Agri-Environment Scheme</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Scheme Name <span style={{ color: "#ef4444" }}>*</span></Label>
              <Input placeholder="e.g. Countryside Stewardship, SFI, HLS" value={form.schemeName} onChange={e => setForm((f: any) => ({ ...f, schemeName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Agreement Number</Label><Input value={form.agreementNumber} onChange={e => setForm((f: any) => ({ ...f, agreementNumber: e.target.value }))} /></div>
              <div><Label>Annual Payment (£)</Label><Input type="number" step="0.01" min="0" value={form.annualPaymentPence} onChange={e => setForm((f: any) => ({ ...f, annualPaymentPence: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.startDate} onChange={e => setForm((f: any) => ({ ...f, startDate: e.target.value }))} /></div>
              <div><Label>End Date</Label><Input type="date" value={form.endDate} onChange={e => setForm((f: any) => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
            <div><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Obligations</Label><Textarea placeholder="Key obligations and actions required under this scheme..." value={form.obligations} onChange={e => setForm((f: any) => ({ ...f, obligations: e.target.value }))} rows={3} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.schemeName || !form.startDate || createMut.isPending}>Save Scheme</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Scheme Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Delete this agri-environment scheme record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function EnvironmentalPageFull() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("features");

  return (
    <AppLayout title="Environmental Management">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Record environmental features for Red Tractor compliance and manage agri-environment scheme agreements.
        </p>
        <TabBar className="mb-6">
          <TabButton active={tab === "features"} onClick={() => setTab("features")}>Environmental Features</TabButton>
          <TabButton active={tab === "schemes"} onClick={() => setTab("schemes")}>Agri-Env Schemes</TabButton>
        </TabBar>
        {farmId && tab === "features" && <EnvironmentalFeaturesTab farmId={farmId} />}
        {farmId && tab === "schemes" && <AgriEnvSchemesTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
