import React, { useState, useMemo } from "react";
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
import { Plus, Trash2, Truck, Building2, Wheat, BarChart3, Pencil, Eye, CheckCircle2 } from "lucide-react";

type Tab = "records" | "grain-position" | "directory";

const DELIVERY_STATUSES = [
  { value: "booked", label: "Booked", bg: "#eff6ff", color: "#1e40af" },
  { value: "in-transit", label: "In Transit", bg: "#fef3c7", color: "#92400e" },
  { value: "delivered", label: "Delivered", bg: "#dcfce7", color: "#166534" },
  { value: "rejected", label: "Rejected", bg: "#fee2e2", color: "#991b1b" },
  { value: "cancelled", label: "Cancelled", bg: "#f3f4f6", color: "#6b7280" },
];

const GRAIN_COMMODITIES = [
  "Winter Wheat",
  "Spring Wheat",
  "Winter Barley",
  "Spring Barley",
  "Malting Barley",
  "Winter Oats",
  "Spring Oats",
  "Oilseed Rape",
  "Winter Beans",
  "Spring Beans",
  "Peas",
  "Maize",
  "Rye",
  "Triticale",
  "Linseed",
  "Other",
];

const LOAD_TYPES = ["Grain", "Straw", "Silage", "Livestock", "Fertiliser", "Machinery", "Waste", "Other"];

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtCost = (pence: number | null | undefined) => {
  if (pence == null) return "—";
  return `£${(pence / 100).toFixed(2)}`;
};

function DeliveryStatusBadge({ status }: { status: string }) {
  const s = DELIVERY_STATUSES.find(d => d.value === status) ?? { label: status, bg: "#f3f4f6", color: "#374151" };
  return <Badge style={{ background: s.bg, color: s.color, border: "none", fontSize: "0.7rem" }}>{s.label}</Badge>;
}

function HaulageRecordsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const commodityTypes = useLookupStrings("commodity_types", GRAIN_COMMODITIES);
  const loadTypes = useLookupStrings("load_types", LOAD_TYPES);
  const [addOpen, setAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const emptyForm = {
    departureDate: "", arrivalDate: "", loadType: "", loadDescription: "",
    commodity: "", variety: "", grade: "", moisturePercent: "", specificWeightKgHl: "",
    weighbridgeTicketNo: "", storageLocation: "", deliveryStatus: "delivered",
    weightTonnes: "", vehicleRegistration: "", driverName: "", haulierCompany: "",
    origin: "", destination: "", waybillNumber: "", costPence: "", notes: "",
  };
  const [form, setForm] = useState<any>(emptyForm);

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

  const saveMut = useMutation({
    mutationFn: (body: any) => {
      const payload = {
        ...body,
        costPence: body.costPence ? Math.round(parseFloat(body.costPence) * 100) : null,
        weightTonnes: body.weightTonnes || null,
        moisturePercent: body.moisturePercent || null,
        specificWeightKgHl: body.specificWeightKgHl || null,
      };
      if (editRecord) return fetch(`/api/farms/${farmId}/haulage/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch(`/api/farms/${farmId}/haulage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => { toast({ title: editRecord ? "Record updated" : "Record saved" }); invalidate(); setAddOpen(false); setEditRecord(null); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/haulage/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const confirmMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/haulage/${id}/confirm-delivery`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) }),
    onSuccess: () => { toast({ title: "Delivery confirmed" }); invalidate(); },
    onError: () => toast({ title: "Failed to confirm delivery", variant: "destructive" }),
  });

  const records: any[] = q.data ?? [];
  const hauliers: any[] = hauliersQ.data ?? [];

  const openAdd = () => { setEditRecord(null); setForm(emptyForm); setAddOpen(true); };
  const openEdit = (r: any) => {
    setEditRecord(r);
    setForm({ ...r, departureDate: r.departureDate?.slice(0, 10) ?? "", arrivalDate: r.arrivalDate?.slice(0, 10) ?? "", costPence: r.costPence ? (r.costPence / 100).toFixed(2) : "" });
    setAddOpen(true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Add Movement Record</Button>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading...</p> : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Truck size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No haulage records</p>
          <p style={{ fontSize: "0.875rem" }}>Record all commodity movements — grain, straw, livestock and inputs — for full traceability.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date", "Load Type", "Commodity / Variety", "Grade", "Weight (t)", "Moisture", "Sp. Wt.", "Weighbridge", "Vehicle", "Origin", "Destination", "Waybill", "Store", "Status", "Cost", ""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.departureDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500 }}>{r.loadType || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    <p style={{ fontWeight: 500 }}>{r.commodity || r.loadDescription || "—"}</p>
                    {r.variety && <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{r.variety}</p>}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.grade || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.weightTonnes ?? "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.moisturePercent ? `${r.moisturePercent}%` : "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.specificWeightKgHl ? `${r.specificWeightKgHl}` : "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: r.weighbridgeTicketNo ? "monospace" : "inherit", fontSize: "0.8rem" }}>{r.weighbridgeTicketNo || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.vehicleRegistration || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.origin || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.destination || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.waybillNumber || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.storageLocation || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    {r.deliveryStatus ? <DeliveryStatusBadge status={r.deliveryStatus} /> : "—"}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtCost(r.costPence)}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {!r.deliveryConfirmedAt && r.deliveryStatus !== "cancelled" && (
                        <button onClick={() => confirmMut.mutate(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a", padding: 4 }} title="Confirm delivery received"><CheckCircle2 size={14} /></button>
                      )}
                      {r.deliveryConfirmedAt && (
                        <span title={`Confirmed ${new Date(r.deliveryConfirmedAt).toLocaleDateString("en-GB")}${r.deliveryConfirmedBy ? ` by ${r.deliveryConfirmedBy}` : ""}`} style={{ color: "#16a34a", padding: 4, lineHeight: 1, display: "inline-flex" }}><CheckCircle2 size={14} /></span>
                      )}
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
          <DialogContent style={{ maxWidth: 600 }}>
            <DialogHeader><DialogTitle>Haulage Record</DialogTitle></DialogHeader>
            {(() => {
              const r = viewRecord;
              const fmt = (d: string | null | undefined) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
              const fmtCost = (p: number | null) => p != null ? `£${(p / 100).toFixed(2)}` : null;
              const F = ({ label, value }: { label: string; value?: string | null }) => (
                <div><div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value || "—"}</div></div>
              );
              return (
                <div style={{ display: "grid", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <F label="Date" value={fmt(r.departureDate)} />
                    <F label="Load Type" value={r.loadType} />
                    <F label="Status" value={r.deliveryStatus} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <F label="Commodity" value={r.commodity || r.loadDescription} />
                    <F label="Variety" value={r.variety} />
                    <F label="Grade" value={r.grade} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <F label="Weight (t)" value={r.weightTonnes != null ? String(r.weightTonnes) : null} />
                    <F label="Moisture %" value={r.moisturePercent != null ? `${r.moisturePercent}%` : null} />
                    <F label="Sp. Weight (kg/hl)" value={r.specificWeightKgHl != null ? String(r.specificWeightKgHl) : null} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Weighbridge Ticket" value={r.weighbridgeTicketNo} />
                    <F label="Vehicle Reg." value={r.vehicleRegistration} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <F label="Origin" value={r.origin} />
                    <F label="Destination" value={r.destination} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    <F label="Waybill Number" value={r.waybillNumber} />
                    <F label="Storage Location" value={r.storageLocation} />
                    <F label="Cost" value={fmtCost(r.costPence)} />
                  </div>
                  {r.notes && <F label="Notes" value={r.notes} />}
                </div>
              );
            })()}
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button onClick={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}>Edit Record</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm); } }}>
        <DialogContent style={{ maxWidth: 640 }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Haulage Record" : "Add Movement Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Departure Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.departureDate} onChange={e => setForm((f: any) => ({ ...f, departureDate: e.target.value }))} /></div>
              <div><Label>Arrival Date</Label><Input type="date" value={form.arrivalDate} onChange={e => setForm((f: any) => ({ ...f, arrivalDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Load Type <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.loadType} onValueChange={v => setForm((f: any) => ({ ...f, loadType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{loadTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Weight (tonnes)</Label><Input type="number" step="0.01" min="0" value={form.weightTonnes} onChange={e => setForm((f: any) => ({ ...f, weightTonnes: e.target.value }))} /></div>
              <div><Label>Delivery Status</Label>
                <Select value={form.deliveryStatus} onValueChange={v => setForm((f: any) => ({ ...f, deliveryStatus: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{DELIVERY_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {(form.loadType === "Grain" || GRAIN_COMMODITIES.includes(form.commodity)) && (
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Grain Quality Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Commodity</Label>
                    <Select value={form.commodity} onValueChange={v => setForm((f: any) => ({ ...f, commodity: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select commodity..." /></SelectTrigger>
                      <SelectContent>{commodityTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Variety</Label><Input placeholder="e.g. KWS Zyatt, Skyfall" value={form.variety} onChange={e => setForm((f: any) => ({ ...f, variety: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3" style={{ marginTop: "0.75rem" }}>
                  <div><Label>Grade</Label><Input placeholder="e.g. Group 1, Feed" value={form.grade} onChange={e => setForm((f: any) => ({ ...f, grade: e.target.value }))} /></div>
                  <div><Label>Moisture (%)</Label><Input type="number" step="0.1" min="0" max="40" placeholder="e.g. 14.5" value={form.moisturePercent} onChange={e => setForm((f: any) => ({ ...f, moisturePercent: e.target.value }))} /></div>
                  <div><Label>Specific Weight (kg/hl)</Label><Input type="number" step="0.1" min="0" placeholder="e.g. 76.0" value={form.specificWeightKgHl} onChange={e => setForm((f: any) => ({ ...f, specificWeightKgHl: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3" style={{ marginTop: "0.75rem" }}>
                  <div><Label>Weighbridge Ticket No.</Label><Input placeholder="e.g. WB-2025-00123" value={form.weighbridgeTicketNo} onChange={e => setForm((f: any) => ({ ...f, weighbridgeTicketNo: e.target.value }))} style={{ fontFamily: "monospace" }} /></div>
                  <div><Label>Storage Location</Label><Input placeholder="e.g. Barn 2, Bay 3 / Saxham Silos" value={form.storageLocation} onChange={e => setForm((f: any) => ({ ...f, storageLocation: e.target.value }))} /></div>
                </div>
              </div>
            )}

            {form.loadType !== "Grain" && (
              <div><Label>Load Description</Label><Input placeholder="e.g. Baled barley straw — 200 bales" value={form.loadDescription} onChange={e => setForm((f: any) => ({ ...f, loadDescription: e.target.value }))} /></div>
            )}

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
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm); }}>Cancel</Button>
            <Button onClick={() => saveMut.mutate(form)} disabled={!form.departureDate || !form.loadType || saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Save Record"}
            </Button>
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

function GrainPositionTab({ farmId }: { farmId: number }) {
  const q = useQuery({
    queryKey: ["haulage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulage`).then(r => r.json()),
    enabled: !!farmId,
    select: (d) => (d.records ?? []).filter((r: any) => r.loadType === "Grain" && r.commodity),
  });

  const records: any[] = q.data ?? [];

  const position = useMemo(() => {
    const byComm: Record<string, { commodity: string; varieties: string[]; totalTonnes: number; avgMoisture: number | null; moistureReadings: number[]; deliveredCount: number; pendingCount: number; locations: string[] }> = {};
    for (const r of records) {
      const key = r.commodity;
      if (!byComm[key]) byComm[key] = { commodity: key, varieties: [], totalTonnes: 0, avgMoisture: null, moistureReadings: [], deliveredCount: 0, pendingCount: 0, locations: [] };
      const entry = byComm[key];
      if (r.weightTonnes) entry.totalTonnes += parseFloat(r.weightTonnes);
      if (r.moisturePercent) entry.moistureReadings.push(parseFloat(r.moisturePercent));
      if (r.deliveryStatus === "delivered") entry.deliveredCount++;
      else if (r.deliveryStatus === "booked" || r.deliveryStatus === "in-transit") entry.pendingCount++;
      if (r.variety && !entry.varieties.includes(r.variety)) entry.varieties.push(r.variety);
      if (r.storageLocation && !entry.locations.includes(r.storageLocation)) entry.locations.push(r.storageLocation);
    }
    for (const key in byComm) {
      const e = byComm[key];
      if (e.moistureReadings.length > 0) e.avgMoisture = e.moistureReadings.reduce((a, b) => a + b, 0) / e.moistureReadings.length;
    }
    return Object.values(byComm).sort((a, b) => b.totalTonnes - a.totalTonnes);
  }, [records]);

  const totalTonnes = position.reduce((s, p) => s + p.totalTonnes, 0);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.5rem" }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "#dcfce7", borderRadius: 8, padding: 8 }}><Wheat size={18} color="#16a34a" /></div>
          <div><p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Total Tonnage</p><p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{totalTonnes.toFixed(1)}t</p></div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "#f3f4f6", borderRadius: 8, padding: 8 }}><BarChart3 size={18} color="#374151" /></div>
          <div><p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Commodities</p><p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{position.length}</p></div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "#f3f4f6", borderRadius: 8, padding: 8 }}><Truck size={18} color="#374151" /></div>
          <div><p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Movements</p><p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{records.length}</p></div>
        </div>
      </div>

      {records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Wheat size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No grain movements recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Add haulage records with Load Type "Grain" and select a commodity to see your grain position summary here.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {position.map(p => (
            <div key={p.commodity} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb", padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Wheat size={15} color="#374151" />
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>{p.commodity}</span>
                  {p.varieties.length > 0 && <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>— {p.varieties.join(", ")}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {p.pendingCount > 0 && <Badge style={{ background: "#fef3c7", color: "#92400e", border: "none", fontSize: "0.72rem" }}>{p.pendingCount} in transit</Badge>}
                  <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#166534" }}>{p.totalTonnes.toFixed(1)}t</span>
                </div>
              </div>
              <div style={{ padding: "0.75rem 1rem", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", fontSize: "0.875rem" }}>
                <div>
                  <p style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Delivered</p>
                  <p style={{ color: "#374151", fontWeight: 500 }}>{p.deliveredCount} load{p.deliveredCount !== 1 ? "s" : ""}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Avg Moisture</p>
                  <p style={{ color: "#374151", fontWeight: 500 }}>{p.avgMoisture !== null ? `${p.avgMoisture.toFixed(1)}%` : "—"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>Storage Locations</p>
                  <p style={{ color: "#374151", fontWeight: 500 }}>{p.locations.length > 0 ? p.locations.join(", ") : "—"}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>% of Total</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1, background: "#e5e7eb", borderRadius: 999, height: 6 }}>
                      <div style={{ background: "#16a34a", borderRadius: 999, height: 6, width: `${totalTonnes > 0 ? (p.totalTonnes / totalTonnes) * 100 : 0}%` }} />
                    </div>
                    <span style={{ fontWeight: 500, color: "#374151", fontSize: "0.8rem" }}>{totalTonnes > 0 ? ((p.totalTonnes / totalTonnes) * 100).toFixed(0) : 0}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Record commodity movements for traceability. View your grain position by commodity. Manage approved hauliers in the directory for quick selection.
        </p>
        <TabBar className="mb-6">
          <TabButton active={tab === "records"} onClick={() => setTab("records")}>Movement Records</TabButton>
          <TabButton active={tab === "grain-position"} onClick={() => setTab("grain-position")}>Grain Position</TabButton>
          <TabButton active={tab === "directory"} onClick={() => setTab("directory")}>Haulier Directory</TabButton>
        </TabBar>
        {farmId && tab === "records" && <HaulageRecordsTab farmId={farmId} />}
        {farmId && tab === "grain-position" && <GrainPositionTab farmId={farmId} />}
        {farmId && tab === "directory" && <HaulierDirectoryTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
