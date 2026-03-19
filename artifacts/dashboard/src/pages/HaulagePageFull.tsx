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
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Plus, Trash2, Truck, Building2 } from "lucide-react";

type Tab = "records" | "directory";

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtCost = (pence: number | null | undefined) => {
  if (pence == null) return "—";
  return `£${(pence / 100).toFixed(2)}`;
};

function HaulageRecordsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({
    departureDate: "", arrivalDate: "", loadType: "", loadDescription: "",
    weightTonnes: "", vehicleRegistration: "", driverName: "", haulierCompany: "",
    origin: "", destination: "", waybillNumber: "", costPence: "", notes: "",
  });

  const q = useQuery({
    queryKey: ["haulage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulage`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const hauliersQ = useQuery({
    queryKey: ["hauliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/hauliers`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["haulage", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/haulage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, costPence: body.costPence ? Math.round(parseFloat(body.costPence) * 100) : null }),
    }),
    onSuccess: () => { toast({ title: "Record saved" }); invalidate(); setAddOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/haulage/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => setForm({ departureDate: "", arrivalDate: "", loadType: "", loadDescription: "", weightTonnes: "", vehicleRegistration: "", driverName: "", haulierCompany: "", origin: "", destination: "", waybillNumber: "", costPence: "", notes: "" });
  const records: any[] = q.data ?? [];
  const hauliers: any[] = hauliersQ.data ?? [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Movement Record</Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Truck size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No haulage records</p>
          <p style={{ fontSize: "0.875rem" }}>Record all commodity movements for traceability.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Departure", "Load Type", "Description", "Weight (t)", "Vehicle", "Driver", "Haulier", "Origin", "Destination", "Waybill", "Cost", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.departureDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500 }}>{r.loadType || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 160 }}>{r.loadDescription || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.weightTonnes ?? "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.vehicleRegistration || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.driverName || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.haulierCompany || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.origin || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.destination || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.waybillNumber || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtCost(r.costPence)}</td>
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
        <DialogContent style={{ maxWidth: 580 }}>
          <DialogHeader><DialogTitle>Add Haulage Record</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Departure Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.departureDate} onChange={e => setForm((f: any) => ({ ...f, departureDate: e.target.value }))} /></div>
              <div><Label>Arrival Date</Label><Input type="date" value={form.arrivalDate} onChange={e => setForm((f: any) => ({ ...f, arrivalDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Load Type <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.loadType} onValueChange={v => setForm((f: any) => ({ ...f, loadType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {["Grain", "Straw", "Silage", "Livestock", "Fertiliser", "Machinery", "Waste", "Other"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Weight (tonnes)</Label><Input type="number" step="0.01" min="0" value={form.weightTonnes} onChange={e => setForm((f: any) => ({ ...f, weightTonnes: e.target.value }))} /></div>
            </div>
            <div><Label>Load Description</Label><Input placeholder="e.g. Wheat — winter variety, harvested Field A" value={form.loadDescription} onChange={e => setForm((f: any) => ({ ...f, loadDescription: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vehicle Registration</Label><Input placeholder="e.g. AB12 CDE" value={form.vehicleRegistration} onChange={e => setForm((f: any) => ({ ...f, vehicleRegistration: e.target.value }))} /></div>
              <div><Label>Driver Name</Label><Input value={form.driverName} onChange={e => setForm((f: any) => ({ ...f, driverName: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Haulier Company</Label>
                {hauliers.length > 0 ? (
                  <Select value={form.haulierCompany} onValueChange={v => setForm((f: any) => ({ ...f, haulierCompany: v === "__none__" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select or type below..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— None —</SelectItem>
                      {hauliers.map((h: any) => <SelectItem key={h.id} value={h.companyName}>{h.companyName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="Haulier company name" value={form.haulierCompany} onChange={e => setForm((f: any) => ({ ...f, haulierCompany: e.target.value }))} />
                )}
              </div>
              <div><Label>Waybill / Ref No.</Label><Input value={form.waybillNumber} onChange={e => setForm((f: any) => ({ ...f, waybillNumber: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Origin</Label><Input placeholder="e.g. Home Farm" value={form.origin} onChange={e => setForm((f: any) => ({ ...f, origin: e.target.value }))} /></div>
              <div><Label>Destination</Label><Input placeholder="e.g. Grain store, Huntingdon" value={form.destination} onChange={e => setForm((f: any) => ({ ...f, destination: e.target.value }))} /></div>
            </div>
            <div><Label>Cost (£)</Label><Input type="number" step="0.01" min="0" value={form.costPence} onChange={e => setForm((f: any) => ({ ...f, costPence: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.departureDate || !form.loadType || createMut.isPending}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Haulage Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this haulage record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HaulierDirectoryTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ companyName: "", contactName: "", phone: "", email: "", address: "", vehicleTypes: "", operatorLicence: "", notes: "" });

  const q = useQuery({
    queryKey: ["hauliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/hauliers`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["hauliers", farmId] });

  const createMut = useMutation({
    mutationFn: (body: any) => fetch(`/api/farms/${farmId}/hauliers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Haulier added" }); invalidate(); setAddOpen(false); resetForm(); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/hauliers/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const resetForm = () => setForm({ companyName: "", contactName: "", phone: "", email: "", address: "", vehicleTypes: "", operatorLicence: "", notes: "" });
  const records: any[] = q.data ?? [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Approved hauliers used by this farm. Linked automatically when adding movement records.</p>
        <Button size="sm" onClick={() => { resetForm(); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Haulier</Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Building2 size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No hauliers in directory</p>
          <p style={{ fontSize: "0.875rem" }}>Add approved hauliers here to quickly select them when logging movements.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Company", "Contact", "Phone", "Email", "Vehicle Types", "Operator Licence", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 600 }}>{r.companyName}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.contactName || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.phone || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.email ? <a href={`mailto:${r.email}`} style={{ color: "#2563eb" }}>{r.email}</a> : "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.vehicleTypes || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.operatorLicence || "—"}</td>
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
          <DialogHeader><DialogTitle>Add Haulier to Directory</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Company Name <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. Smith Agricultural Haulage Ltd" value={form.companyName} onChange={e => setForm((f: any) => ({ ...f, companyName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contact Name</Label><Input value={form.contactName} onChange={e => setForm((f: any) => ({ ...f, contactName: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input type="tel" value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={e => setForm((f: any) => ({ ...f, address: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vehicle Types</Label><Input placeholder="e.g. Artic, Rigid 7.5t" value={form.vehicleTypes} onChange={e => setForm((f: any) => ({ ...f, vehicleTypes: e.target.value }))} /></div>
              <div><Label>Operator Licence No.</Label><Input value={form.operatorLicence} onChange={e => setForm((f: any) => ({ ...f, operatorLicence: e.target.value }))} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={() => createMut.mutate(form)} disabled={!form.companyName || createMut.isPending}>Save Haulier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Remove Haulier</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Remove this haulier from the directory? Existing movement records will not be affected.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function HaulagePageFull() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("records");

  return (
    <AppLayout title="Haulage & Transport">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Record commodity movements for traceability. Manage approved hauliers in the directory for quick selection.
        </p>
        <TabBar className="mb-6">
          <TabButton active={tab === "records"} onClick={() => setTab("records")}>Movement Records</TabButton>
          <TabButton active={tab === "directory"} onClick={() => setTab("directory")}>Haulier Directory</TabButton>
        </TabBar>
        {farmId && tab === "records" && <HaulageRecordsTab farmId={farmId} />}
        {farmId && tab === "directory" && <HaulierDirectoryTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
