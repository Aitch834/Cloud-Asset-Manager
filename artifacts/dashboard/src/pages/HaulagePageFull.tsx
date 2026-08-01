import React, { useState, useMemo, useRef } from "react";
import { OtherSelect } from "@/components/ui/other-select";
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
import { Plus, Trash2, Truck, Building2, Wheat, BarChart3, Pencil, Eye, CheckCircle2, ArrowLeftRight, ArrowUpRight, Paperclip, X, FileText, Image, FileDown, Receipt, ChevronDown, ChevronUp, ClipboardList, ArrowRight } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";

type Tab = "plans" | "dispatches" | "transfers" | "grain-position" | "invoices" | "directory";

const DISPATCH_STATUSES = [
  { value: "booked", label: "Booked", bg: "#eff6ff", color: "#1e40af" },
  { value: "in-transit", label: "In Transit", bg: "#fef3c7", color: "#92400e" },
  { value: "dispatched", label: "Dispatched", bg: "#dcfce7", color: "#166534" },
  { value: "rejected", label: "Rejected", bg: "#fee2e2", color: "#991b1b" },
  { value: "cancelled", label: "Cancelled", bg: "#f3f4f6", color: "#6b7280" },
];

const GRAIN_COMMODITIES = [
  "Winter Wheat","Spring Wheat","Winter Barley","Spring Barley","Malting Barley",
  "Winter Oats","Spring Oats","Oilseed Rape","Winter Beans","Spring Beans",
  "Peas","Maize","Rye","Triticale","Linseed","Other",
];

const LOAD_TYPES = ["Grain","Straw","Silage","Fertiliser","Machinery","Waste","Other"];

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtCost = (pence: number | null | undefined) => {
  if (pence == null) return "—";
  return `£${(pence / 100).toFixed(2)}`;
};
const F = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <div style={{ fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#9ca3af", marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: "0.875rem", color: value ? "#111827" : "#d1d5db" }}>{value || "—"}</div>
  </div>
);

function StatusBadge({ status }: { status: string }) {
  const s = DISPATCH_STATUSES.find(d => d.value === status) ?? { label: status, bg: "#f3f4f6", color: "#374151" };
  return <Badge style={{ background: s.bg, color: s.color, border: "none", fontSize: "0.7rem" }}>{s.label}</Badge>;
}

// ─── Buyer combobox (same pattern as SalesTradingPage) ─────────────────────
function BuyerSelect({ farmId, valueId, valueName, onChange }: {
  farmId: number; valueId: number | null; valueName: string;
  onChange: (id: number | null, name: string) => void;
}) {
  const q = useQuery({
    queryKey: ["buyers", farmId, "grain_merchant,merchant,customer"],
    queryFn: () => fetch(`/api/farms/${farmId}/buyers?types=grain_merchant,merchant,customer`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const buyers: any[] = q.data ?? [];
  return (
    <Select
      value={valueId ? String(valueId) : "__none__"}
      onValueChange={v => {
        if (v === "__none__") { onChange(null, ""); return; }
        const buyer = buyers.find((b: any) => String(b.id) === v);
        onChange(buyer?.id ?? null, buyer?.name ?? "");
      }}
    >
      <SelectTrigger><SelectValue placeholder="Select buyer / merchant..." /></SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— Select buyer —</SelectItem>
        {buyers.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

// ─── Grain bin selector ────────────────────────────────────────────────────
function BinSelect({ farmId, value, onChange, placeholder }: {
  farmId: number; value: number | null; onChange: (id: number | null, name: string) => void; placeholder?: string;
}) {
  const q = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.rows ?? d.records ?? [],
  });
  const bins: any[] = q.data ?? [];
  return (
    <Select
      value={value ? String(value) : "__none__"}
      onValueChange={v => {
        if (v === "__none__") { onChange(null, ""); return; }
        const bin = bins.find((b: any) => String(b.id) === v);
        onChange(bin?.id ?? null, bin?.binName ?? "");
      }}
    >
      <SelectTrigger><SelectValue placeholder={placeholder ?? "Select bin / store..."} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— None —</SelectItem>
        {bins.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.binName}{b.binType ? ` (${b.binType})` : ""}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

// ─── Linked livestock movements panel (shown inside view dialog) ────────────
function LinkedMovementsPanel({ farmId, recordId }: { farmId: number; recordId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["linked-livestock-movements", farmId, recordId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulage/${recordId}/linked-livestock-movements`).then(r => r.json()),
  });
  const records: Array<{ id: number; species: string | null; movementType: string; movementDate: string; numberOfAnimals: number | null; fromLocation: string | null; toLocation: string | null; checklistCompletedAt: string | null; checklistCompletedBy: string | null }> = data?.records ?? [];
  if (isLoading || records.length === 0) return null;
  return (
    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1e40af", marginBottom: 8 }}>
        Linked Livestock Movements ({records.length})
      </p>
      {records.map(m => (
        <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 4, borderBottom: "1px solid #dbeafe", marginBottom: 4 }}>
          <div>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1d4ed8" }}>
              {m.species || "Livestock"} — {m.numberOfAnimals ?? "?"} animals
            </span>
            <span style={{ fontSize: "0.75rem", color: "#6b7280", marginLeft: 8 }}>
              {m.fromLocation || "?"} → {m.toLocation || "?"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {m.checklistCompletedAt ? (
              <span style={{ fontSize: "0.7rem", background: "#dcfce7", color: "#166534", borderRadius: 10, padding: "1px 7px", fontWeight: 600 }}>✓ Checklist signed</span>
            ) : (
              <span style={{ fontSize: "0.7rem", background: "#fef3c7", color: "#92400e", borderRadius: 10, padding: "1px 7px" }}>Checklist pending</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Dispatches Tab ────────────────────────────────────────────────────────
function DispatchesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const commodityTypes = useLookupStrings("commodity_types", GRAIN_COMMODITIES);
  const loadTypes = useLookupStrings("load_types", LOAD_TYPES);
  const [yearFilter, setYearFilter] = useState(() => new Date().getFullYear());
  const [addOpen, setAddOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmRecord, setConfirmRecord] = useState<any | null>(null);
  const [confirmForm, setConfirmForm] = useState({ confirmedBy: "", notes: "", weighbridgeWeightTonnes: "", proofOfDeliveryUrl: "" });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const proofInputRef = useRef<HTMLInputElement>(null);

  const { uploadFile, isUploading, progress: uploadProgress } = useUpload({
    onSuccess: (res: any) => {
      setConfirmForm(f => ({ ...f, proofOfDeliveryUrl: res.objectPath }));
    },
    onError: () => toast({ title: "File upload failed", variant: "destructive" }),
  });

  const emptyForm = {
    movementType: "farm_exit_dispatch",
    loadType: "", loadDescription: "",
    commodity: "", variety: "", grade: "",
    moisturePercent: "", specificWeightKgHl: "",
    weighbridgeTicketNo: "",
    binId: null as number | null, binName: "",
    buyerId: null as number | null, buyerName: "",
    customerRef: "",
    haulierRegisteredId: null as number | null, haulierCompany: "", haulierSupplierId: null as number | null,
    deliveryStatus: "booked",
    weightTonnes: "", vehicleRegistration: "", driverName: "",
    origin: "", destination: "",
    departureDate: "", arrivalDate: "",
    waybillNumber: "", invoiceRef: "", costPence: "", notes: "",
    dispatchPlanId: null as number | null,
  };
  const [form, setForm] = useState<any>(emptyForm);

  const q = useQuery({
    queryKey: ["haulage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulage`).then(r => r.json()),
    enabled: !!farmId,
    select: d => (d.records ?? []).filter((r: any) => r.movementType !== "on_farm_transfer"),
  });

  const hauliersQ = useQuery({
    queryKey: ["hauliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/hauliers`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const plansQ = useQuery({
    queryKey: ["dispatch-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dispatch-plans`).then(r => r.json()),
    enabled: !!farmId,
    select: d => (d.records ?? []).filter((p: any) => p.status !== "cancelled" && p.status !== "complete"),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["haulage", farmId] });
  const { data: dispMembersData, isLoading: dispMembersLoading } = useFarmMembers(farmId);
  const dispStaffNames = (dispMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);

  const saveMut = useMutation({
    mutationFn: (body: any) => {
      const payload = {
        ...body,
        movementType: "farm_exit_dispatch",
        costPence: body.costPence ? Math.round(parseFloat(body.costPence) * 100) : null,
        weightTonnes: body.weightTonnes || null,
        moisturePercent: body.moisturePercent || null,
        specificWeightKgHl: body.specificWeightKgHl || null,
        binId: body.binId || null,
        buyerId: body.buyerId || null,
        haulierRegisteredId: body.haulierRegisteredId || null,
      };
      if (editRecord) return fetch(`/api/farms/${farmId}/haulage/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch(`/api/farms/${farmId}/haulage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => { toast({ title: editRecord ? "Dispatch updated" : "Dispatch recorded" }); invalidate(); setAddOpen(false); setEditRecord(null); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/haulage/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const confirmMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      fetch(`/api/farms/${farmId}/haulage/${id}/confirm-dispatch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => {
      toast({ title: "Dispatch confirmed — stock deducted from bin" });
      invalidate();
      setConfirmId(null);
      setConfirmRecord(null);
      setConfirmForm({ confirmedBy: "", notes: "", weighbridgeWeightTonnes: "", proofOfDeliveryUrl: "" });
      setProofFile(null);
    },
    onError: () => toast({ title: "Failed to confirm dispatch", variant: "destructive" }),
  });

  const allRecords: any[] = q.data ?? [];
  const hauliers: any[] = hauliersQ.data ?? [];
  const activePlans: any[] = plansQ.data ?? [];

  const years = useMemo(() => {
    const ys = new Set(allRecords.map(r => r.departureDate?.slice(0, 4)).filter(Boolean).map(Number));
    ys.add(new Date().getFullYear());
    return [...ys].sort((a, b) => b - a);
  }, [allRecords]);

  const records = useMemo(
    () => allRecords.filter(r => r.departureDate?.startsWith(String(yearFilter))),
    [allRecords, yearFilter]
  );

  const totalWeightT = useMemo(
    () => records.reduce((s, r) => s + parseFloat(r.weightTonnes ?? "0"), 0),
    [records]
  );
  const totalCostPence = useMemo(
    () => records.reduce((s, r) => s + (r.costPence ?? 0), 0),
    [records]
  );

  const openAdd = () => { setEditRecord(null); setForm(emptyForm); setAddOpen(true); };
  const openEdit = (r: any) => {
    setEditRecord(r);
    setForm({ ...r, departureDate: r.departureDate?.slice(0, 10) ?? "", arrivalDate: r.arrivalDate?.slice(0, 10) ?? "", costPence: r.costPence ? (r.costPence / 100).toFixed(2) : "" });
    setAddOpen(true);
  };

  const isGrain = (f: any) => f.loadType === "Grain" || GRAIN_COMMODITIES.includes(f.commodity);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Crop and commodity dispatches leaving the farm — stock deducted on confirmation.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Select value={String(yearFilter)} onValueChange={v => setYearFilter(Number(v))}>
            <SelectTrigger style={{ width: 96 }}><SelectValue /></SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" /><ArrowUpRight size={14} className="mr-1" />Record Dispatch</Button>
        </div>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading…</p> : allRecords.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Truck size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No dispatches recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Record crop dispatches leaving the farm — grain, straw, or other commodities sent to merchants or customers.</p>
        </div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Truck size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No dispatches in {yearFilter}</p>
          <p style={{ fontSize: "0.875rem" }}>Try selecting a different year, or record a new dispatch.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date","Load","Commodity","Buyer / Merchant","Weight (t)","Source Bin","Waybill","Vehicle","Status","Cost",""].map(h => (
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
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    {r.destination ? <p style={{ fontWeight: 500 }}>{r.destination}</p> : "—"}
                    {r.customerRef && <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Ref: {r.customerRef}</p>}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.weightTonnes ?? "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.storageLocation || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.waybillNumber || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.vehicleRegistration || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>{r.deliveryStatus ? <StatusBadge status={r.deliveryStatus} /> : "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtCost(r.costPence)}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                      {!r.deliveryConfirmedAt && r.deliveryStatus !== "cancelled" && (
                        <button
                          onClick={() => { setConfirmId(r.id); setConfirmRecord(r); setConfirmForm({ confirmedBy: "", notes: "", weighbridgeWeightTonnes: "", proofOfDeliveryUrl: "" }); setProofFile(null); }}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", padding: "3px 8px", fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap" }}
                          title="Confirm receipt at destination & deduct stock"
                        ><CheckCircle2 size={12} />Confirm Receipt</button>
                      )}
                      {r.deliveryConfirmedAt && (
                        <span
                          title={`Confirmed ${new Date(r.deliveryConfirmedAt).toLocaleDateString("en-GB")}${r.deliveryConfirmedBy ? ` by ${r.deliveryConfirmedBy}` : ""}${r.proofOfDeliveryUrl ? " · Proof attached" : ""}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#dcfce7", color: "#166534", borderRadius: 6, padding: "3px 7px", fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap" }}
                        >
                          <CheckCircle2 size={12} />Stock Deducted
                          {r.proofOfDeliveryUrl && <Paperclip size={11} style={{ marginLeft: 2 }} />}
                        </span>
                      )}
                      <button onClick={() => setViewRecord(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="View"><Eye size={13} /></button>
                      <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="Edit"><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f9fafb", borderTop: "2px solid #e5e7eb" }}>
                <td colSpan={4} style={{ padding: "0.625rem 0.875rem", fontWeight: 600, fontSize: "0.8rem", color: "#6b7280" }}>
                  {records.length} dispatch{records.length !== 1 ? "es" : ""} · {yearFilter}
                </td>
                <td style={{ padding: "0.625rem 0.875rem", fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
                  {totalWeightT > 0 ? `${totalWeightT.toFixed(2)} t` : "—"}
                </td>
                <td colSpan={4} />
                <td style={{ padding: "0.625rem 0.875rem", fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
                  {totalCostPence > 0 ? fmtCost(totalCostPence) : "—"}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Confirm Dispatch Dialog */}
      <Dialog open={confirmId !== null} onOpenChange={o => { if (!o) { setConfirmId(null); setConfirmRecord(null); setProofFile(null); } }}>
        <DialogContent style={{ maxWidth: 460 }}>
          <DialogHeader><DialogTitle>Confirm Receipt at Destination</DialogTitle></DialogHeader>
          {confirmRecord && (
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "0.625rem 0.875rem", fontSize: "0.8rem", color: "#374151" }}>
              <span style={{ fontWeight: 600 }}>{confirmRecord.commodity || confirmRecord.loadType}</span>
              {confirmRecord.destination ? <> → {confirmRecord.destination}</> : null}
              {confirmRecord.weightTonnes ? <span style={{ color: "#6b7280" }}> · {parseFloat(confirmRecord.weightTonnes).toFixed(2)} t (estimated)</span> : null}
            </div>
          )}
          <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
            This will record delivery confirmation and deduct stock from the source bin. This action cannot be undone.
          </p>
          <div className="space-y-3 mt-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Confirmed By <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input placeholder="Your name" value={confirmForm.confirmedBy} onChange={e => setConfirmForm(f => ({ ...f, confirmedBy: e.target.value }))} />
              </div>
              <div>
                <Label>Weighbridge Weight (t)</Label>
                <Input type="number" step="0.01" min="0" placeholder="Actual delivered" value={confirmForm.weighbridgeWeightTonnes} onChange={e => setConfirmForm(f => ({ ...f, weighbridgeWeightTonnes: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <Textarea rows={2} placeholder="e.g. Weighbridge ticket ref, any discrepancies…" value={confirmForm.notes} onChange={e => setConfirmForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div>
              <Label>Proof of Delivery</Label>
              <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginBottom: 6 }}>Attach a photo of the weighbridge ticket, text message, or any confirmation received from the destination.</p>
              <input
                ref={proofInputRef}
                type="file"
                accept="image/*,application/pdf,.jpg,.jpeg,.png,.pdf,.heic,.webp"
                style={{ display: "none" }}
                onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setProofFile(file);
                  await uploadFile(file);
                }}
              />
              {!proofFile ? (
                <button
                  type="button"
                  onClick={() => proofInputRef.current?.click()}
                  style={{ width: "100%", border: "2px dashed #d1d5db", borderRadius: 8, padding: "0.875rem", background: "#fafafa", cursor: "pointer", color: "#6b7280", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <Paperclip size={14} /> Click to attach file
                </button>
              ) : (
                <div style={{ border: "1px solid #d1fae5", borderRadius: 8, padding: "0.625rem 0.875rem", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#374151", minWidth: 0 }}>
                    {proofFile.type.startsWith("image/") ? <Image size={14} style={{ color: "#16a34a", flexShrink: 0 }} /> : <FileText size={14} style={{ color: "#16a34a", flexShrink: 0 }} />}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{proofFile.name}</span>
                    {isUploading && <span style={{ color: "#9ca3af", flexShrink: 0 }}>({uploadProgress}%)</span>}
                    {!isUploading && confirmForm.proofOfDeliveryUrl && <span style={{ color: "#16a34a", flexShrink: 0 }}>✓ Uploaded</span>}
                  </div>
                  <button type="button" onClick={() => { setProofFile(null); setConfirmForm(f => ({ ...f, proofOfDeliveryUrl: "" })); if (proofInputRef.current) proofInputRef.current.value = ""; }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2, flexShrink: 0 }}><X size={14} /></button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => { setConfirmId(null); setConfirmRecord(null); setProofFile(null); }}>Cancel</Button>
            <Button
              style={{ background: "#16a34a", color: "#fff" }}
              onClick={() => confirmId !== null && confirmMut.mutate({
                id: confirmId,
                body: {
                  confirmedBy: confirmForm.confirmedBy,
                  notes: confirmForm.notes,
                  ...(confirmForm.weighbridgeWeightTonnes ? { weighbridgeWeightTonnes: parseFloat(confirmForm.weighbridgeWeightTonnes) } : {}),
                  ...(confirmForm.proofOfDeliveryUrl ? { proofOfDeliveryUrl: confirmForm.proofOfDeliveryUrl } : {}),
                }
              })}
              disabled={!confirmForm.confirmedBy || isUploading || confirmMut.isPending}
            >
              {confirmMut.isPending ? "Confirming…" : isUploading ? `Uploading… ${uploadProgress}%` : "Confirm Receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: 600 }}>
            <DialogHeader><DialogTitle>Dispatch Record</DialogTitle></DialogHeader>
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <F label="Departure Date" value={fmt(viewRecord.departureDate)} />
                <F label="Load Type" value={viewRecord.loadType} />
                <F label="Status" value={viewRecord.deliveryStatus} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <F label="Commodity" value={viewRecord.commodity || viewRecord.loadDescription} />
                <F label="Variety" value={viewRecord.variety} />
                <F label="Grade" value={viewRecord.grade} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <F label="Weight (t)" value={viewRecord.weightTonnes != null ? String(viewRecord.weightTonnes) : null} />
                <F label="Moisture %" value={viewRecord.moisturePercent != null ? `${viewRecord.moisturePercent}%` : null} />
                <F label="Sp. Weight (kg/hl)" value={viewRecord.specificWeightKgHl != null ? String(viewRecord.specificWeightKgHl) : null} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <F label="Buyer / Destination" value={viewRecord.destination} />
                <F label="Customer Ref" value={viewRecord.customerRef} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <F label="Source Bin / Store" value={viewRecord.storageLocation} />
                <F label="Weighbridge Ticket" value={viewRecord.weighbridgeTicketNo} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <F label="Vehicle Reg." value={viewRecord.vehicleRegistration} />
                <F label="Driver" value={viewRecord.driverName} />
                <F label="Haulier" value={viewRecord.haulierCompany} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <F label="Waybill" value={viewRecord.waybillNumber} />
                <F label="Invoice Ref" value={viewRecord.invoiceRef} />
                <F label="Cost" value={fmtCost(viewRecord.costPence)} />
              </div>
              {viewRecord.deliveryConfirmedAt && (
                <div style={{ background: "#dcfce7", borderRadius: 8, padding: 10 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <CheckCircle2 size={16} style={{ color: "#16a34a", flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "0.875rem", color: "#166534", fontWeight: 600 }}>
                        Stock Deducted — confirmed {fmt(viewRecord.deliveryConfirmedAt)}{viewRecord.deliveryConfirmedBy ? ` by ${viewRecord.deliveryConfirmedBy}` : ""}
                      </p>
                      {viewRecord.weighbridgeWeightTonnes && (
                        <p style={{ fontSize: "0.8rem", color: "#16a34a", marginTop: 2 }}>
                          Weighbridge weight: <strong>{parseFloat(viewRecord.weighbridgeWeightTonnes).toFixed(2)} t</strong>
                          {viewRecord.weightTonnes && Math.abs(parseFloat(viewRecord.weighbridgeWeightTonnes) - parseFloat(viewRecord.weightTonnes)) > 0.01
                            ? <span style={{ color: "#92400e" }}> (estimated was {parseFloat(viewRecord.weightTonnes).toFixed(2)} t)</span>
                            : null}
                        </p>
                      )}
                      {viewRecord.deliveryConfirmationNotes && (
                        <p style={{ fontSize: "0.8rem", color: "#374151", marginTop: 2 }}>{viewRecord.deliveryConfirmationNotes}</p>
                      )}
                      {viewRecord.proofOfDeliveryUrl && (
                        <div style={{ marginTop: 8 }}>
                          <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#166534", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Proof of Delivery</p>
                          <a
                            href={`/api/storage${viewRecord.proofOfDeliveryUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px", fontSize: "0.8rem", color: "#166534", textDecoration: "none", fontWeight: 500 }}
                          >
                            <Paperclip size={13} /> View attachment
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {viewRecord.notes && <F label="Notes" value={viewRecord.notes} />}
              <LinkedMovementsPanel farmId={farmId} recordId={viewRecord.id} />
            </div>
            <DialogFooter className="mt-4" style={{ display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
              <Button variant="outline" style={{ gap: 6 }} onClick={async () => {
                const win = window.open("", "_blank");
                try {
                  const resp = await fetch(`/api/farms/${farmId}/haulage/${viewRecord.id}/dispatch-note`);
                  if (!resp.ok) throw new Error("failed");
                  const html = await resp.text();
                  if (win) {
                    win.document.write(html);
                    win.document.close();
                    win.addEventListener("afterprint", () => win.close());
                    win.print();
                  }
                } catch { if (win) win.close(); }
              }}><FileDown size={14} /> Dispatch Note</Button>
              <Button onClick={() => { const r = viewRecord; setViewRecord(null); openEdit(r); }}>Edit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm); } }}>
        <DialogContent style={{ maxWidth: 680, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Dispatch" : "Record Dispatch"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {/* Link to Dispatch Plan */}
            {activePlans.length > 0 && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 12px" }}>
                <Label style={{ color: "#166534" }}>Link to Dispatch Plan (optional)</Label>
                <Select
                  value={form.dispatchPlanId ? String(form.dispatchPlanId) : "__none__"}
                  onValueChange={v => {
                    if (v === "__none__") { setForm((f: any) => ({ ...f, dispatchPlanId: null })); return; }
                    const plan = activePlans.find((p: any) => String(p.id) === v);
                    if (!plan) return;
                    setForm((f: any) => ({
                      ...f,
                      dispatchPlanId: plan.id,
                      loadType: plan.loadType || f.loadType,
                      commodity: plan.commodity || f.commodity,
                      destination: plan.destination || f.destination,
                      haulierRegisteredId: plan.haulierId || f.haulierRegisteredId,
                      haulierCompany: plan.haulierName || (plan.haulierId ? hauliers.find((h: any) => h.id === plan.haulierId)?.companyName : f.haulierCompany) || f.haulierCompany,
                      customerRef: plan.buyerRef || f.customerRef,
                    }));
                  }}
                >
                  <SelectTrigger style={{ marginTop: 4 }}><SelectValue placeholder="Select a plan to link this load…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— No plan (standalone load) —</SelectItem>
                    {activePlans.map((p: any) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.planRef ? `[${p.planRef}] ` : ""}{p.title} — {p.plannedDate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.dispatchPlanId && <p style={{ fontSize: "0.72rem", color: "#166534", marginTop: 4 }}>Destination, haulier, and commodity pre-filled from plan where available.</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div><Label>Departure Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.departureDate} onChange={e => setForm((f: any) => ({ ...f, departureDate: e.target.value }))} /></div>
              <div><Label>Arrival / Expected Date</Label><Input type="date" value={form.arrivalDate} onChange={e => setForm((f: any) => ({ ...f, arrivalDate: e.target.value }))} /></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div><Label>Load Type <span style={{ color: "#ef4444" }}>*</span></Label>
                <OtherSelect
                  options={loadTypes}
                  value={form.loadType}
                  onValueChange={v => setForm((f: any) => ({ ...f, loadType: v }))}
                  placeholder="Select type..."
                  specifyPlaceholder="Specify load type…"
                />
              </div>
              <div><Label>Weight (tonnes)</Label><Input type="number" step="0.01" min="0" value={form.weightTonnes} onChange={e => setForm((f: any) => ({ ...f, weightTonnes: e.target.value }))} /></div>
              <div><Label>Status</Label>
                <Select value={form.deliveryStatus} onValueChange={v => setForm((f: any) => ({ ...f, deliveryStatus: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{DISPATCH_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Grain-specific quality fields */}
            {isGrain(form) && (
              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Crop Quality</p>
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
                  <div><Label>Moisture (%)</Label><Input type="number" step="0.1" min="0" max="40" value={form.moisturePercent} onChange={e => setForm((f: any) => ({ ...f, moisturePercent: e.target.value }))} /></div>
                  <div><Label>Sp. Weight (kg/hl)</Label><Input type="number" step="0.1" min="0" value={form.specificWeightKgHl} onChange={e => setForm((f: any) => ({ ...f, specificWeightKgHl: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3" style={{ marginTop: "0.75rem" }}>
                  <div><Label>Weighbridge Ticket No.</Label><Input placeholder="e.g. WB-2025-00123" value={form.weighbridgeTicketNo} onChange={e => setForm((f: any) => ({ ...f, weighbridgeTicketNo: e.target.value }))} style={{ fontFamily: "monospace" }} /></div>
                  <div><Label>Source Bin / Store Location</Label><BinSelect farmId={farmId} value={form.binId} onChange={(id, name) => setForm((f: any) => ({ ...f, binId: id, storageLocation: name }))} /></div>
                </div>
              </div>
            )}

            {!isGrain(form) && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Load Description</Label><Input placeholder="e.g. 200 bales barley straw" value={form.loadDescription} onChange={e => setForm((f: any) => ({ ...f, loadDescription: e.target.value }))} /></div>
                <div><Label>Source Bin / Store</Label><BinSelect farmId={farmId} value={form.binId} onChange={(id, name) => setForm((f: any) => ({ ...f, binId: id, storageLocation: name }))} /></div>
              </div>
            )}

            {/* Buyer / customer */}
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Buyer / Customer</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Buyer / Merchant</Label><BuyerSelect farmId={farmId} valueId={form.buyerId} valueName={form.buyerName} onChange={(id, name) => setForm((f: any) => ({ ...f, buyerId: id, buyerName: name, destination: name || f.destination }))} /></div>
                <div><Label>Customer Reference</Label><Input placeholder="Contract / order ref" value={form.customerRef} onChange={e => setForm((f: any) => ({ ...f, customerRef: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-1 gap-3" style={{ marginTop: "0.75rem" }}>
                <div><Label>Destination (merchant store / location)</Label><Input placeholder="e.g. Gleadell Agriculture Ltd — Bury St Edmunds" value={form.destination} onChange={e => setForm((f: any) => ({ ...f, destination: e.target.value }))} /></div>
              </div>
            </div>

            {/* Transport */}
            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Transport</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Vehicle Registration</Label><Input placeholder="e.g. AB12 CDE" value={form.vehicleRegistration} onChange={e => setForm((f: any) => ({ ...f, vehicleRegistration: e.target.value }))} /></div>
                <div><Label>Driver Name</Label><StaffSelect value={form.driverName} onChange={v => setForm((f: any) => ({ ...f, driverName: v }))} staffNames={dispStaffNames} loading={dispMembersLoading} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3" style={{ marginTop: "0.75rem" }}>
                <div><Label>Haulier Company</Label>
                  {hauliers.length > 0 ? (
                    <Select value={form.haulierCompany || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, haulierCompany: v === "__none__" ? "" : v }))}>
                      <SelectTrigger><SelectValue placeholder="Select haulier..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— None —</SelectItem>
                        {hauliers.map((h: any) => <SelectItem key={h.id} value={h.companyName}>{h.companyName}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <BuyerCombobox farmId={farmId!} types={["contractor", "general"]} valueId={form.haulierSupplierId ?? null} valueName={form.haulierCompany} onChange={(id, name) => setForm((f: any) => ({ ...f, haulierSupplierId: id, haulierCompany: name }))} />
                  )}
                </div>
                <div><Label>Waybill / Docket Ref</Label><Input value={form.waybillNumber} onChange={e => setForm((f: any) => ({ ...f, waybillNumber: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3" style={{ marginTop: "0.75rem" }}>
                <div><Label>Origin (farm / field)</Label><Input placeholder="e.g. Home Farm, Barn 2" value={form.origin} onChange={e => setForm((f: any) => ({ ...f, origin: e.target.value }))} /></div>
                <div><Label>Invoice Ref</Label><Input placeholder="e.g. INV-1234" value={form.invoiceRef ?? ""} onChange={e => setForm((f: any) => ({ ...f, invoiceRef: e.target.value }))} /></div>
                <div><Label>Haulage Cost (£)</Label><Input type="number" step="0.01" min="0" value={form.costPence} onChange={e => setForm((f: any) => ({ ...f, costPence: e.target.value }))} /></div>
              </div>
            </div>

            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm); }}>Cancel</Button>
            <Button onClick={() => saveMut.mutate(form)} disabled={!form.departureDate || !form.loadType || saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Save Dispatch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Dispatch?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">This cannot be undone. Any confirmed stock movements will not be reversed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── On-Farm Transfers Tab ─────────────────────────────────────────────────
function TransfersTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const commodityTypes = useLookupStrings("commodity_types", GRAIN_COMMODITIES);
  const loadTypes = useLookupStrings("load_types", LOAD_TYPES);
  const [yearFilter, setYearFilter] = useState(() => new Date().getFullYear());
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmForm, setConfirmForm] = useState({ confirmedBy: "", notes: "" });
  const { data: transMembersData, isLoading: transMembersLoading } = useFarmMembers(farmId);
  const transStaffNames = (transMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);

  const emptyForm = {
    movementType: "on_farm_transfer",
    loadType: "Grain",
    commodity: "", variety: "",
    binId: null as number | null, fromBinName: "",
    destinationBinId: null as number | null, toBinName: "",
    weightTonnes: "", vehicleRegistration: "", driverName: "",
    departureDate: "", notes: "",
  };
  const [form, setForm] = useState<any>(emptyForm);

  const q = useQuery({
    queryKey: ["haulage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulage`).then(r => r.json()),
    enabled: !!farmId,
    select: d => (d.records ?? []).filter((r: any) => r.movementType === "on_farm_transfer"),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["haulage", farmId] });

  const saveMut = useMutation({
    mutationFn: (body: any) => {
      const payload = {
        ...body,
        movementType: "on_farm_transfer",
        weightTonnes: body.weightTonnes || null,
        binId: body.binId || null,
        destinationBinId: body.destinationBinId || null,
        deliveryStatus: "booked",
      };
      if (editRecord) return fetch(`/api/farms/${farmId}/haulage/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch(`/api/farms/${farmId}/haulage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => { toast({ title: editRecord ? "Transfer updated" : "Transfer recorded" }); invalidate(); setAddOpen(false); setEditRecord(null); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/haulage/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  const confirmMut = useMutation({
    mutationFn: ({ id, body }: { id: number; body: any }) =>
      fetch(`/api/farms/${farmId}/haulage/${id}/confirm-dispatch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    onSuccess: () => { toast({ title: "Transfer confirmed — stock moved between bins" }); invalidate(); setConfirmId(null); setConfirmForm({ confirmedBy: "", notes: "" }); },
    onError: () => toast({ title: "Failed to confirm transfer", variant: "destructive" }),
  });

  const allRecords: any[] = q.data ?? [];

  const years = useMemo(() => {
    const ys = new Set(allRecords.map(r => r.departureDate?.slice(0, 4)).filter(Boolean).map(Number));
    ys.add(new Date().getFullYear());
    return [...ys].sort((a, b) => b - a);
  }, [allRecords]);

  const records = useMemo(
    () => allRecords.filter(r => r.departureDate?.startsWith(String(yearFilter))),
    [allRecords, yearFilter]
  );

  const totalWeightT = useMemo(
    () => records.reduce((s, r) => s + parseFloat(r.weightTonnes ?? "0"), 0),
    [records]
  );

  const openAdd = () => { setEditRecord(null); setForm(emptyForm); setAddOpen(true); };
  const openEdit = (r: any) => {
    setEditRecord(r);
    setForm({ ...r, departureDate: r.departureDate?.slice(0, 10) ?? "" });
    setAddOpen(true);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>On-farm movements between bins or storage locations — stock is deducted from source and added to destination.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Select value={String(yearFilter)} onValueChange={v => setYearFilter(Number(v))}>
            <SelectTrigger style={{ width: 96 }}><SelectValue /></SelectTrigger>
            <SelectContent>{years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
          </Select>
          <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" /><ArrowLeftRight size={14} className="mr-1" />Record Transfer</Button>
        </div>
      </div>

      {q.isLoading ? <p className="text-sm text-gray-400 py-8 text-center">Loading…</p> : allRecords.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <ArrowLeftRight size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No on-farm transfers recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Record internal movements of crop between grain bins, stores, or field heaps.</p>
        </div>
      ) : records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <ArrowLeftRight size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No transfers in {yearFilter}</p>
          <p style={{ fontSize: "0.875rem" }}>Try selecting a different year, or record a new transfer.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Date","Commodity","From Bin / Store","To Bin / Store","Weight (t)","Confirmed",""].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < records.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.departureDate)}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    <p style={{ fontWeight: 500 }}>{r.commodity || r.loadType || "—"}</p>
                    {r.variety && <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>{r.variety}</p>}
                  </td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.storageLocation || r.origin || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.destination || "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.weightTonnes ?? "—"}</td>
                  <td style={{ padding: "0.625rem 0.875rem" }}>
                    {r.deliveryConfirmedAt ? (
                      <span style={{ color: "#16a34a", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem" }}>
                        <CheckCircle2 size={14} /> {new Date(r.deliveryConfirmedAt).toLocaleDateString("en-GB")}
                      </span>
                    ) : <span style={{ color: "#d1d5db", fontSize: "0.8rem" }}>Pending</span>}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {!r.deliveryConfirmedAt && (
                        <button onClick={() => { setConfirmId(r.id); setConfirmForm({ confirmedBy: "", notes: "" }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#16a34a", padding: 4 }} title="Confirm transfer complete"><CheckCircle2 size={14} /></button>
                      )}
                      <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }}><Pencil size={13} /></button>
                      <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f9fafb", borderTop: "2px solid #e5e7eb" }}>
                <td colSpan={4} style={{ padding: "0.625rem 0.875rem", fontWeight: 600, fontSize: "0.8rem", color: "#6b7280" }}>
                  {records.length} transfer{records.length !== 1 ? "s" : ""} · {yearFilter}
                </td>
                <td style={{ padding: "0.625rem 0.875rem", fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
                  {totalWeightT > 0 ? `${totalWeightT.toFixed(2)} t` : "—"}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Confirm Transfer Dialog */}
      <Dialog open={confirmId !== null} onOpenChange={o => { if (!o) setConfirmId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Confirm Transfer Complete</DialogTitle></DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>Stock will be deducted from the source bin and added to the destination bin.</p>
          <div className="space-y-3 mt-2">
            <div><Label>Confirmed By</Label><Input placeholder="Your name" value={confirmForm.confirmedBy} onChange={e => setConfirmForm(f => ({ ...f, confirmedBy: e.target.value }))} /></div>
            <div><Label>Notes (optional)</Label><Textarea rows={2} value={confirmForm.notes} onChange={e => setConfirmForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmId(null)}>Cancel</Button>
            <Button style={{ background: "#16a34a", color: "#fff" }} onClick={() => confirmId !== null && confirmMut.mutate({ id: confirmId, body: confirmForm })} disabled={confirmMut.isPending}>
              {confirmMut.isPending ? "Confirming…" : "Confirm Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm); } }}>
        <DialogContent style={{ maxWidth: 580 }}>
          <DialogHeader><DialogTitle>{editRecord ? "Edit Transfer" : "Record On-Farm Transfer"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.departureDate} onChange={e => setForm((f: any) => ({ ...f, departureDate: e.target.value }))} /></div>
              <div><Label>Weight (tonnes) <span style={{ color: "#ef4444" }}>*</span></Label><Input type="number" step="0.01" min="0" value={form.weightTonnes} onChange={e => setForm((f: any) => ({ ...f, weightTonnes: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Commodity</Label>
                <Select value={form.commodity || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, commodity: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select commodity..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {commodityTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Variety</Label><Input placeholder="e.g. KWS Zyatt" value={form.variety} onChange={e => setForm((f: any) => ({ ...f, variety: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>From Bin / Store <span style={{ color: "#ef4444" }}>*</span></Label><BinSelect farmId={farmId} value={form.binId} onChange={(id, name) => setForm((f: any) => ({ ...f, binId: id, fromBinName: name, storageLocation: name, origin: name }))} placeholder="Source bin..." /></div>
              <div><Label>To Bin / Store <span style={{ color: "#ef4444" }}>*</span></Label><BinSelect farmId={farmId} value={form.destinationBinId} onChange={(id, name) => setForm((f: any) => ({ ...f, destinationBinId: id, toBinName: name, destination: name }))} placeholder="Destination bin..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vehicle Reg (if applicable)</Label><Input placeholder="e.g. AB12 CDE" value={form.vehicleRegistration} onChange={e => setForm((f: any) => ({ ...f, vehicleRegistration: e.target.value }))} /></div>
              <div><Label>Driver / Operator</Label><StaffSelect value={form.driverName} onChange={v => setForm((f: any) => ({ ...f, driverName: v }))} staffNames={transStaffNames} loading={transMembersLoading} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm); }}>Cancel</Button>
            <Button onClick={() => saveMut.mutate(form)} disabled={!form.departureDate || !form.weightTonnes || saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Save Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Transfer?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">This cannot be undone. Confirmed stock movements will not be reversed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Grain Position Tab ─────────────────────────────────────────────────────
function GrainPositionTab({ farmId, onGoToDispatches }: { farmId: number; onGoToDispatches: () => void }) {
  const curYear = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState(curYear);

  const stockQ = useQuery({
    queryKey: ["crop-stock-levels", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-stock-levels`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const haulageQ = useQuery({
    queryKey: ["haulage", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulage`).then(r => r.json()),
    enabled: !!farmId,
    select: d => (d.records ?? []).filter((r: any) => r.movementType !== "on_farm_transfer"),
  });

  const stockLevels: any[] = stockQ.data ?? [];
  const allHaulageRecords: any[] = haulageQ.data ?? [];

  const dispatchYears = useMemo(() => {
    const ys = new Set(allHaulageRecords.map(r => r.departureDate?.slice(0, 4)).filter(Boolean).map(Number));
    ys.add(curYear);
    return Array.from(ys).sort((a, b) => b - a);
  }, [allHaulageRecords, curYear]);

  const haulageInYear = useMemo(
    () => allHaulageRecords.filter(r => r.departureDate?.startsWith(String(yearFilter))),
    [allHaulageRecords, yearFilter],
  );

  const confirmedInYear = useMemo(() => haulageInYear.filter(r => r.deliveryConfirmedAt), [haulageInYear]);
  const pendingInYear   = useMemo(() => haulageInYear.filter(r => !r.deliveryConfirmedAt), [haulageInYear]);

  const totalDispatchedT = useMemo(() => confirmedInYear.reduce((s, r) => s + parseFloat(r.weightTonnes ?? "0"), 0), [confirmedInYear]);
  const totalPendingT    = useMemo(() => pendingInYear.reduce((s, r) => s + parseFloat(r.weightTonnes ?? "0"), 0), [pendingInYear]);

  const totalStockTonnes = stockLevels.reduce((s, r) => s + parseFloat(r.quantityTonnes ?? "0"), 0);

  const commodityTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of stockLevels) {
      const key = r.commodity || "Unknown";
      map.set(key, (map.get(key) ?? 0) + parseFloat(r.quantityTonnes ?? "0"));
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [stockLevels]);

  const cardClick: React.CSSProperties = { cursor: "pointer", transition: "box-shadow 0.15s" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>Dispatch year:</span>
        <Select value={String(yearFilter)} onValueChange={v => setYearFilter(Number(v))}>
          <SelectTrigger style={{ width: 100, height: 32, fontSize: "0.85rem" }}><SelectValue /></SelectTrigger>
          <SelectContent>
            {dispatchYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.5rem" }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "1rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "#16a34a", marginBottom: 4 }}>Live Stock in Store</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#14532d" }}>{totalStockTonnes.toFixed(1)} t</p>
          {commodityTotals.length > 1 ? (
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
              {commodityTotals.map(([commodity, tonnes]) => (
                <div key={commodity} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#374151" }}>
                  <span>{commodity}</span>
                  <span style={{ fontWeight: 600 }}>{tonnes.toFixed(1)} t</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 4 }}>
              {stockLevels.length === 0 ? "No stock records yet" : `across ${stockLevels.length} bin/commodity row${stockLevels.length !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>

        <div
          style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 10, padding: "1rem", ...cardClick }}
          onClick={onGoToDispatches}
          title="Click to view confirmed dispatches"
        >
          <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "#92400e", marginBottom: 4 }}>
            Total Dispatched (confirmed)
          </p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#78350f" }}>{totalDispatchedT.toFixed(1)} t</p>
          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            {confirmedInYear.length} confirmed in {yearFilter} — click to view ↗
          </p>
        </div>

        <div
          style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "1rem", ...cardClick }}
          onClick={onGoToDispatches}
          title="Click to view pending dispatches"
        >
          <p style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", color: "#1e40af", marginBottom: 4 }}>Pending Dispatches</p>
          <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1e3a8a" }}>{totalPendingT.toFixed(1)} t</p>
          <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
            {pendingInYear.length} booked/in-transit in {yearFilter} — click to view ↗
          </p>
        </div>
      </div>

      {stockLevels.length > 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
            <p style={{ fontWeight: 600, color: "#374151", fontSize: "0.875rem" }}>Live Stock Levels</p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Updated automatically when dispatches and transfers are confirmed</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                {["Commodity","Variety","Crop Year","Quantity (t)","Last Updated"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 1rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stockLevels.map((r: any, i: number) => (
                <tr key={r.id} style={{ borderBottom: i < stockLevels.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                  <td style={{ padding: "0.625rem 1rem", fontWeight: 500 }}>{r.commodity}</td>
                  <td style={{ padding: "0.625rem 1rem", color: "#6b7280" }}>{r.variety || "—"}</td>
                  <td style={{ padding: "0.625rem 1rem", color: "#6b7280" }}>{r.cropYear || "—"}</td>
                  <td style={{ padding: "0.625rem 1rem" }}>
                    <span style={{ fontWeight: 700, color: parseFloat(r.quantityTonnes) > 0 ? "#16a34a" : "#dc2626" }}>
                      {parseFloat(r.quantityTonnes ?? "0").toFixed(2)} t
                    </span>
                  </td>
                  <td style={{ padding: "0.625rem 1rem", color: "#6b7280", fontSize: "0.8rem" }}>{fmt(r.lastUpdated)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Wheat size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No live stock data yet</p>
          <p style={{ fontSize: "0.875rem" }}>Stock levels are updated automatically when dispatches and transfers are confirmed. Add harvest-in records via the Crop Stock page to initialise your position.</p>
        </div>
      )}
    </div>
  );
}

// ─── Dispatch Plans Tab ─────────────────────────────────────────────────────
const PLAN_LOAD_TYPES = ["Grain", "Livestock", "Machinery / Equipment", "Straw / Forage", "Other"];

const PLAN_STATUSES = [
  { value: "draft",       label: "Draft",       bg: "#f1f5f9", color: "#475569" },
  { value: "confirmed",   label: "Confirmed",   bg: "#eff6ff", color: "#1e40af" },
  { value: "in_progress", label: "In Progress", bg: "#fef3c7", color: "#92400e" },
  { value: "complete",    label: "Complete",    bg: "#dcfce7", color: "#166534" },
  { value: "cancelled",   label: "Cancelled",   bg: "#fee2e2", color: "#991b1b" },
];

function planStatus(s: string) { return PLAN_STATUSES.find(x => x.value === s) ?? PLAN_STATUSES[0]; }
function planLoadTypeBadge(t: string): { bg: string; color: string } {
  if (t === "Grain") return { bg: "#fef9c3", color: "#854d0e" };
  if (t === "Livestock") return { bg: "#dcfce7", color: "#166534" };
  if (t?.startsWith("Machinery")) return { bg: "#eff6ff", color: "#1e40af" };
  return { bg: "#f1f5f9", color: "#475569" };
}

// Load type → preferred storage location types (for source filtering)
const LOAD_TYPE_STORAGE_TYPES: Record<string, string[]> = {
  "Grain":         ["grain_store"],
  "Straw / Forage": ["grain_store"],
  // Livestock, Machinery, Other → no filter, show all
};

// Commodity suggestions keyed by load type
const COMMODITY_SUGGESTIONS: Record<string, string[]> = {
  "Grain": ["Feed Wheat", "Milling Wheat", "Premium Wheat", "Distilling Wheat", "Winter Barley", "Spring Barley", "Feed Barley", "Malting Barley", "Oilseed Rape (OSR)", "Winter Beans", "Spring Beans", "Peas", "Oats", "Linseed", "Rye"],
  "Livestock": ["Finished Beef Cattle", "Store Cattle", "Dairy Heifers", "Beef Cows", "Finished Lambs", "Store Lambs", "Breeding Ewes", "Rams", "Finished Pigs", "Weaners", "Breeding Sows", "Broilers", "Point-of-Lay Hens"],
  "Straw / Forage": ["Wheat Straw", "Barley Straw", "Oat Straw", "Big Bale Silage", "Wholecrop Silage", "Grass Silage", "Hay", "Haylage", "Maize Silage"],
  "Machinery / Equipment": ["Combine Harvester", "Tractor", "Baler", "Sprayer", "Drill", "Plough", "Cultivator", "Trailer", "Loader", "Mower", "Forager"],
  "Other": [],
};

interface PlanForm {
  title: string; loadType: string; commodity: string; commodityCustom: string;
  sourceLocation: string; binId: string; destination: string;
  haulierId: string; haulierName: string; useHaulierDir: boolean;
  buyerId: string; buyerRef: string; contractId: string;
  plannedDate: string; plannedDateEnd: string;
  estimatedLoads: string; estimatedVehicles: string; estimatedTonnes: string;
  status: string; notes: string;
  decisionMadeByMemberId: string;
}
const emptyPlanForm = (): PlanForm => ({
  title: "", loadType: "Grain", commodity: "", commodityCustom: "",
  sourceLocation: "", binId: "", destination: "",
  haulierId: "", haulierName: "", useHaulierDir: true,
  buyerId: "", buyerRef: "", contractId: "",
  plannedDate: "", plannedDateEnd: "",
  estimatedLoads: "", estimatedVehicles: "", estimatedTonnes: "",
  status: "draft", notes: "",
  decisionMadeByMemberId: "",
});

function planToForm(p: any): PlanForm {
  const suggestions = COMMODITY_SUGGESTIONS[p.loadType ?? "Grain"] ?? [];
  const isCustom = p.commodity && !suggestions.includes(p.commodity);
  return {
    title: p.title ?? "", loadType: p.loadType ?? "Grain",
    commodity: isCustom ? "__custom__" : (p.commodity ?? ""),
    commodityCustom: isCustom ? (p.commodity ?? "") : "",
    sourceLocation: p.sourceLocation ?? "",
    binId: p.binId ? String(p.binId) : "", destination: p.destination ?? "",
    haulierId: p.haulierId ? String(p.haulierId) : "", haulierName: p.haulierName ?? "",
    useHaulierDir: !!p.haulierId,
    buyerId: p.buyerId ? String(p.buyerId) : "", buyerRef: p.buyerRef ?? "",
    contractId: p.linkedContractId ? String(p.linkedContractId) : "",
    plannedDate: p.plannedDate ?? "", plannedDateEnd: p.plannedDateEnd ?? "",
    estimatedLoads: p.estimatedLoads != null ? String(p.estimatedLoads) : "",
    estimatedVehicles: p.estimatedVehicles != null ? String(p.estimatedVehicles) : "",
    estimatedTonnes: p.estimatedTonnes != null ? String(parseFloat(p.estimatedTonnes).toFixed(2)) : "",
    status: p.status ?? "draft", notes: p.notes ?? "",
    decisionMadeByMemberId: p.decisionMadeByMemberId ? String(p.decisionMadeByMemberId) : "",
  };
}

function DispatchPlansTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyPlanForm());

  const plansQ = useQuery({
    queryKey: ["dispatch-plans", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/dispatch-plans`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const hauliersQ = useQuery({
    queryKey: ["hauliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/hauliers`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const buyersQ = useQuery({
    queryKey: ["buyers-directory", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/buyers?types=buyer,trader,merchant,grain_merchant,customer`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const loadsQ = useQuery({
    queryKey: ["dispatch-plan-loads", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/dispatch-plans/${expandedId}/loads`).then(r => r.json()),
    enabled: !!expandedId,
    select: d => d.loads ?? [],
  });
  const membersQ = useQuery({
    queryKey: ["farm-members", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/members`).then(r => r.json()),
    enabled: !!farmId,
    select: d => (d.members ?? []).filter((m: any) => m.isActive !== false),
  });
  const storageQ = useQuery({
    queryKey: ["storage-locations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/storage-locations`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const contractsQ = useQuery({
    queryKey: ["crop-contracts-for-buyer", farmId, form.buyerId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-contracts?buyerId=${form.buyerId}&status=open,active`).then(r => r.json()),
    enabled: !!farmId && !!form.buyerId,
    select: d => d.records ?? [],
  });

  const saveMut = useMutation({
    mutationFn: (body: any) => {
      if (editPlan) return fetch(`/api/farms/${farmId}/dispatch-plans/${editPlan.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
      return fetch(`/api/farms/${farmId}/dispatch-plans`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
    },
    onSuccess: (data: any) => {
      const ref = data?.record?.planRef;
      toast({ title: editPlan ? "Dispatch plan updated" : `Dispatch plan created${ref ? ` — ${ref}` : ""}` });
      qc.invalidateQueries({ queryKey: ["dispatch-plans", farmId] });
      setAddOpen(false); setEditPlan(null); setForm(emptyPlanForm());
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const notifyMut = useMutation({
    mutationFn: (planId: number) => fetch(`/api/farms/${farmId}/dispatch-plans/${planId}/notify-haulier`, { method: "POST" }).then(r => r.json()),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["dispatch-plans", farmId] });
      toast({ title: data?.smsSent ? "Haulier notified — SMS sent" : "Haulier marked as notified" });
    },
    onError: () => toast({ title: "Failed to notify haulier", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/dispatch-plans/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Plan deleted" }); qc.invalidateQueries({ queryKey: ["dispatch-plans", farmId] }); setDeleteTarget(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      fetch(`/api/farms/${farmId}/dispatch-plans/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dispatch-plans", farmId] }),
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });

  const plans: any[] = plansQ.data ?? [];
  const hauliers: any[] = hauliersQ.data ?? [];
  const buyers: any[] = buyersQ.data ?? [];
  const members: any[] = membersQ.data ?? [];
  const storageLocations: any[] = storageQ.data ?? [];

  // Filter storage locations to those relevant to the current load type
  const filteredStorageLocations = (() => {
    const preferredTypes = LOAD_TYPE_STORAGE_TYPES[form.loadType];
    if (!preferredTypes || preferredTypes.length === 0) return storageLocations;
    const preferred = storageLocations.filter((s: any) => preferredTypes.includes(s.type));
    return preferred.length > 0 ? preferred : storageLocations; // fallback to all if no matches
  })();

  const openAdd = () => { setEditPlan(null); setForm(emptyPlanForm()); setAddOpen(true); };
  const openEdit = (p: any) => { setEditPlan(p); setForm(planToForm(p)); setAddOpen(true); };

  const resolvedCommodity = form.commodity === "__custom__" ? form.commodityCustom : form.commodity;

  const contracts: any[] = contractsQ.data ?? [];

  // Destination field helpers (computed outside JSX to avoid IIFE-in-render issues)
  const destIsKnownBuyer = !!buyers.find((b: any) => b.name === form.destination);
  const destSelectVal = destIsKnownBuyer ? form.destination : (form.destination ? "__custom__" : "__none__");
  const destShowTextInput = destSelectVal === "__custom__" || (!!form.destination && !destIsKnownBuyer && form.destination !== "__custom__");

  const handleSave = () => {
    saveMut.mutate({
      title: form.title,
      loadType: form.loadType,
      commodity: resolvedCommodity || null,
      sourceLocation: form.sourceLocation || null,
      binId: form.binId ? parseInt(form.binId) : null,
      destination: (form.destination && form.destination !== "__custom__") ? form.destination : null,
      haulierId: form.useHaulierDir && form.haulierId ? parseInt(form.haulierId) : null,
      haulierName: (!form.useHaulierDir && form.haulierName) ? form.haulierName : (form.useHaulierDir && form.haulierId ? hauliers.find((h: any) => String(h.id) === form.haulierId)?.companyName : null),
      buyerId: form.buyerId ? parseInt(form.buyerId) : null,
      buyerRef: form.buyerRef || null,
      plannedDate: form.plannedDate,
      plannedDateEnd: form.plannedDateEnd || null,
      estimatedLoads: form.estimatedLoads ? parseInt(form.estimatedLoads) : null,
      estimatedVehicles: form.estimatedVehicles ? parseInt(form.estimatedVehicles) : null,
      estimatedTonnes: form.estimatedTonnes || null,
      status: form.status,
      notes: form.notes || null,
      decisionMadeByMemberId: form.decisionMadeByMemberId ? parseInt(form.decisionMadeByMemberId) : null,
      linkedContractId: form.contractId ? parseInt(form.contractId) : null,
    });
  };

  const activePlans = plans.filter(p => p.status !== "cancelled" && p.status !== "complete");
  const archivedPlans = plans.filter(p => p.status === "cancelled" || p.status === "complete");
  const [showArchived, setShowArchived] = useState(false);
  const visiblePlans = showArchived ? plans : activePlans;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          Plan and co-ordinate dispatch movements before execution. Confirmed plans appear in the Week Ahead planner.
        </p>
        <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />New Plan</Button>
      </div>

      {plans.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <ClipboardList size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No dispatch plans yet</p>
          <p style={{ fontSize: "0.875rem" }}>Create a plan to co-ordinate a movement — grain dispatch, livestock transport, machinery movement, or anything else.</p>
        </div>
      ) : (
        <div>
          <div style={{ display: "grid", gap: 10 }}>
            {visiblePlans.map((plan: any) => {
              const st = planStatus(plan.status);
              const lt = planLoadTypeBadge(plan.loadType);
              const isExpanded = expandedId === plan.id;
              const haulierLabel = plan.haulierName || (hauliers.find((h: any) => h.id === plan.haulierId)?.companyName) || null;
              return (
                <div key={plan.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "0.875rem 1rem", display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Row 1: badges + title */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                        {plan.planRef && <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "#6b7280", background: "#f1f5f9", padding: "1px 6px", borderRadius: 4 }}>{plan.planRef}</span>}
                        <span style={{ background: st.bg, color: st.color, fontSize: "0.7rem", fontWeight: 600, padding: "1px 8px", borderRadius: 10 }}>{st.label}</span>
                        <span style={{ background: lt.bg, color: lt.color, fontSize: "0.7rem", fontWeight: 600, padding: "1px 8px", borderRadius: 10 }}>{plan.loadType}</span>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>{plan.title}</p>
                      </div>
                      {/* Row 2: commodity · loads progress · vehicles · tonnes */}
                      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: "0.8rem", color: "#6b7280", alignItems: "center" }}>
                        {plan.commodity && <span style={{ fontWeight: 500, color: "#374151" }}>{plan.commodity}</span>}
                        {plan.estimatedLoads
                          ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <span style={{ fontWeight: 600, color: plan.loadCount >= plan.estimatedLoads ? "#166534" : "#374151" }}>
                                {plan.loadCount ?? 0}
                              </span>
                              <span style={{ color: "#9ca3af" }}>/ {plan.estimatedLoads}</span>
                              <span>load{plan.estimatedLoads !== 1 ? "s" : ""}</span>
                              {plan.loadCount >= plan.estimatedLoads && plan.estimatedLoads > 0 && <CheckCircle2 size={12} style={{ color: "#16a34a" }} />}
                            </span>
                          : plan.loadCount > 0
                            ? <span>{plan.loadCount} load{plan.loadCount !== 1 ? "s" : ""} recorded</span>
                            : null
                        }
                        {plan.estimatedVehicles && <span><Truck size={11} style={{ display: "inline", marginRight: 2 }} />{plan.estimatedVehicles} vehicle{plan.estimatedVehicles !== 1 ? "s" : ""}</span>}
                        {(plan.actualTonnes > 0 || plan.estimatedTonnes)
                          ? <span>
                              {plan.actualTonnes > 0 && <><strong style={{ color: "#374151" }}>{plan.actualTonnes.toFixed(1)} t</strong> {plan.estimatedTonnes ? `of ${parseFloat(plan.estimatedTonnes).toFixed(1)} t est.` : "dispatched"}</>}
                              {!plan.actualTonnes && plan.estimatedTonnes && <span>{parseFloat(plan.estimatedTonnes).toFixed(1)} t est.</span>}
                            </span>
                          : null
                        }
                      </div>
                      {/* Row 3: haulier → destination */}
                      {(haulierLabel || plan.destination) && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: "0.8rem" }}>
                          {haulierLabel && <span style={{ color: "#374151" }}><Truck size={11} style={{ display: "inline", marginRight: 3 }} />{haulierLabel}</span>}
                          {haulierLabel && plan.destination && <ArrowRight size={11} style={{ color: "#9ca3af" }} />}
                          {plan.destination && <span style={{ color: "#374151" }}>{plan.destination}</span>}
                        </div>
                      )}
                      {/* Row 4: dates + haulier notified */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
                        <p style={{ fontSize: "0.78rem", color: "#9ca3af", margin: 0 }}>
                          Planned: <strong style={{ color: "#374151" }}>{plan.plannedDate}</strong>
                          {plan.plannedDateEnd && plan.plannedDateEnd !== plan.plannedDate ? ` — ${plan.plannedDateEnd}` : ""}
                          {plan.buyerRef && !plan.linkedContractId && <span style={{ marginLeft: 10 }}>Ref: <strong style={{ color: "#374151" }}>{plan.buyerRef}</strong></span>}
                        </p>
                        {plan.linkedContractId && plan.buyerRef && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.72rem", color: "#1e40af", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1px 8px", borderRadius: 10 }}>
                            <FileText size={10} />
                            Contract: {plan.buyerRef}
                          </span>
                        )}
                        {plan.haulierNotifiedAt
                          ? <span style={{ fontSize: "0.72rem", color: "#166534", background: "#dcfce7", padding: "1px 8px", borderRadius: 10 }}>
                              <CheckCircle2 size={10} style={{ display: "inline", marginRight: 3 }} />
                              Haulier notified {new Date(plan.haulierNotifiedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </span>
                          : (plan.haulierId || plan.haulierName) && plan.status !== "draft" && plan.status !== "cancelled" && plan.status !== "complete"
                            ? <button type="button" onClick={() => notifyMut.mutate(plan.id)} disabled={notifyMut.isPending} style={{ fontSize: "0.72rem", color: "#1e40af", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "1px 8px", borderRadius: 10, cursor: "pointer" }}>
                                Notify haulier
                              </button>
                            : null
                        }
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end", flexShrink: 0 }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        <Button size="sm" variant="ghost" title={isExpanded ? "Hide loads" : "View linked loads"} onClick={() => setExpandedId(isExpanded ? null : plan.id)}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Button>
                        <Button size="sm" variant="ghost" title="Edit plan" onClick={() => openEdit(plan)}><Pencil size={14} /></Button>
                        <Button size="sm" variant="ghost" title="Delete" style={{ color: "#ef4444" }} onClick={() => setDeleteTarget(plan)}><Trash2 size={14} /></Button>
                      </div>
                      {/* Quick status advance */}
                      {plan.status === "draft" && <Button size="sm" variant="outline" style={{ fontSize: "0.72rem", height: 24, padding: "0 8px" }} onClick={() => statusMut.mutate({ id: plan.id, status: "confirmed" })}>Confirm Plan</Button>}
                      {plan.status === "confirmed" && <Button size="sm" variant="outline" style={{ fontSize: "0.72rem", height: 24, padding: "0 8px" }} onClick={() => statusMut.mutate({ id: plan.id, status: "in_progress" })}>Start Moving</Button>}
                      {plan.status === "in_progress" && <Button size="sm" style={{ fontSize: "0.72rem", height: 24, padding: "0 8px", background: "#166534" }} onClick={() => statusMut.mutate({ id: plan.id, status: "complete" })}>Mark Complete</Button>}
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: "1px solid #e5e7eb", background: "#f9fafb", padding: "10px 16px" }}>
                      {loadsQ.isLoading ? (
                        <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Loading loads…</p>
                      ) : (loadsQ.data ?? []).length === 0 ? (
                        <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                          No dispatch records linked to this plan yet. When recording a dispatch, select this plan from the "Link to Plan" dropdown to connect it here.
                        </p>
                      ) : (
                        <div>
                          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                            {(loadsQ.data ?? []).length} load{(loadsQ.data ?? []).length !== 1 ? "s" : ""} recorded against this plan
                          </p>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                            <thead><tr style={{ color: "#6b7280" }}>
                              <th style={{ textAlign: "left", padding: "3px 8px" }}>Date</th>
                              <th style={{ textAlign: "left", padding: "3px 8px" }}>Commodity</th>
                              <th style={{ textAlign: "left", padding: "3px 8px" }}>Vehicle</th>
                              <th style={{ textAlign: "left", padding: "3px 8px" }}>Status</th>
                              <th style={{ textAlign: "right", padding: "3px 8px" }}>Weight (t)</th>
                            </tr></thead>
                            <tbody>
                              {(loadsQ.data ?? []).map((load: any) => (
                                <tr key={load.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                                  <td style={{ padding: "4px 8px" }}>{load.departureDate?.slice(0, 10) ?? "—"}</td>
                                  <td style={{ padding: "4px 8px" }}>{load.commodity || load.loadType || "—"}</td>
                                  <td style={{ padding: "4px 8px" }}>{load.vehicleRegistration || load.haulierCompany || "—"}</td>
                                  <td style={{ padding: "4px 8px" }}>
                                    {load.deliveryConfirmedAt
                                      ? <span style={{ color: "#166534", fontWeight: 500 }}>Confirmed</span>
                                      : <span style={{ color: "#92400e" }}>{load.deliveryStatus || "Pending"}</span>}
                                  </td>
                                  <td style={{ padding: "4px 8px", textAlign: "right" }}>{load.weightTonnes ? parseFloat(load.weightTonnes).toFixed(2) : "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot><tr style={{ borderTop: "2px solid #e5e7eb", fontWeight: 600 }}>
                              <td colSpan={4} style={{ padding: "4px 8px" }}>
                                {(loadsQ.data ?? []).filter((l: any) => l.deliveryConfirmedAt).length} of {(loadsQ.data ?? []).length} confirmed
                              </td>
                              <td style={{ padding: "4px 8px", textAlign: "right" }}>
                                {(loadsQ.data ?? []).reduce((s: number, l: any) => s + parseFloat(l.weightTonnes ?? "0"), 0).toFixed(2)} t
                              </td>
                            </tr></tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {archivedPlans.length > 0 && (
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <button type="button" onClick={() => setShowArchived(a => !a)} style={{ fontSize: "0.8rem", color: "#6b7280", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                {showArchived ? "Hide" : `Show ${archivedPlans.length} completed / cancelled plan${archivedPlans.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditPlan(null); setForm(emptyPlanForm()); } }}>
        <DialogContent style={{ maxWidth: 660, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editPlan ? "Edit Dispatch Plan" : "New Dispatch Plan"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">

            {/* Identity */}
            {editPlan?.planRef && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                <span style={{ fontSize: "0.72rem", color: "#64748b" }}>Plan Ref</span>
                <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e40af", fontSize: "0.9rem", letterSpacing: "0.04em" }}>{editPlan.planRef}</span>
                <span style={{ fontSize: "0.7rem", color: "#94a3b8", marginLeft: 4 }}>— assigned by system, cannot be changed</span>
              </div>
            )}
            <div><Label>Title <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. Feed wheat to Frontier — 5 loads" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>

            {/* Load type + commodity */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Load Type</Label>
                <Select value={form.loadType} onValueChange={v => setForm(f => ({ ...f, loadType: v, commodity: "", commodityCustom: "" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PLAN_LOAD_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Commodity</Label>
                {(COMMODITY_SUGGESTIONS[form.loadType] ?? []).length > 0 ? (
                  <>
                    <Select value={form.commodity || "__none__"} onValueChange={v => setForm(f => ({ ...f, commodity: v, commodityCustom: "" }))}>
                      <SelectTrigger><SelectValue placeholder="Select commodity…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— Select —</SelectItem>
                        {(COMMODITY_SUGGESTIONS[form.loadType] ?? []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        <SelectItem value="__custom__">Other / enter manually…</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.commodity === "__custom__" && (
                      <Input className="mt-1" placeholder={`Describe the ${form.loadType.toLowerCase()} being moved`} value={form.commodityCustom} onChange={e => setForm(f => ({ ...f, commodityCustom: e.target.value }))} />
                    )}
                  </>
                ) : (
                  <Input placeholder="Describe what's being moved" value={form.commodityCustom} onChange={e => setForm(f => ({ ...f, commodityCustom: e.target.value }))} />
                )}
              </div>
            </div>

            {/* Source + Destination */}
            <div>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }}>Movement</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>From (source location)</Label>
                  {filteredStorageLocations.length > 0 ? (
                    <>
                      <Select value={form.sourceLocation || "__custom__"} onValueChange={v => setForm(f => ({ ...f, sourceLocation: v === "__custom__" ? "" : v }))}>
                        <SelectTrigger><SelectValue placeholder="Select farm location…" /></SelectTrigger>
                        <SelectContent>
                          {filteredStorageLocations.map((s: any) => (
                            <SelectItem key={s.id} value={s.name}>
                              {s.name}{s.binType ? ` — ${s.binType}` : ""}{s.capacityTonnes ? ` (${parseFloat(s.capacityTonnes).toFixed(0)}t)` : ""}
                            </SelectItem>
                          ))}
                          {filteredStorageLocations.length < storageLocations.length && (
                            storageLocations.filter((s: any) => !filteredStorageLocations.includes(s)).map((s: any) => (
                              <SelectItem key={`other-${s.id}`} value={s.name} style={{ color: "#6b7280" }}>{s.name} (other)</SelectItem>
                            ))
                          )}
                          <SelectItem value="__custom__">Other / type manually…</SelectItem>
                        </SelectContent>
                      </Select>
                      {(!form.sourceLocation || form.sourceLocation === "__custom__") && (
                        <Input className="mt-1" placeholder="e.g. Home Farm, Barn 2, Field 7" value={form.sourceLocation === "__custom__" ? "" : form.sourceLocation} onChange={e => setForm(f => ({ ...f, sourceLocation: e.target.value }))} />
                      )}
                    </>
                  ) : (
                    <Input placeholder="e.g. Home Farm, Barn 2, Field 7" value={form.sourceLocation} onChange={e => setForm(f => ({ ...f, sourceLocation: e.target.value }))} />
                  )}
                </div>
                <div>
                  <Label>To (destination)</Label>
                  {buyers.length > 0 ? (
                    <>
                      <Select
                        value={destSelectVal}
                        onValueChange={v => {
                          if (v === "__none__") { setForm(f => ({ ...f, destination: "" })); return; }
                          if (v === "__custom__") { setForm(f => ({ ...f, destination: "__custom__" })); return; }
                          const b = buyers.find((bx: any) => bx.name === v);
                          setForm(f => ({
                            ...f,
                            destination: v,
                            buyerId: f.buyerId || (b ? String(b.id) : f.buyerId),
                          }));
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Select known trader / merchant…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">— None —</SelectItem>
                          {buyers.map((b: any) => (
                            <SelectItem key={b.id} value={b.name}>
                              {b.name}{b.address ? ` — ${b.address.split(",")[0]}` : ""}
                            </SelectItem>
                          ))}
                          <SelectItem value="__custom__">Other / type manually…</SelectItem>
                        </SelectContent>
                      </Select>
                      {destShowTextInput && (
                        <Input
                          className="mt-1"
                          placeholder="e.g. Frontier Grain, Stowmarket"
                          value={form.destination === "__custom__" ? "" : form.destination}
                          onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                        />
                      )}
                    </>
                  ) : (
                    <Input placeholder="e.g. Frontier Grain, Stowmarket" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
                  )}
                </div>
              </div>
            </div>

            {/* Haulier */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Label>Haulier</Label>
                <button type="button" onClick={() => setForm(f => ({ ...f, useHaulierDir: !f.useHaulierDir, haulierId: "", haulierName: "" }))} style={{ fontSize: "0.75rem", color: "#1a6b3a", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  {form.useHaulierDir ? "Enter name manually" : "Use directory"}
                </button>
              </div>
              {form.useHaulierDir ? (
                <Select value={form.haulierId || "__none__"} onValueChange={v => setForm(f => ({ ...f, haulierId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select haulier from directory" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— No haulier selected —</SelectItem>
                    {hauliers.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.companyName}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input placeholder="Haulier company name" value={form.haulierName} onChange={e => setForm(f => ({ ...f, haulierName: e.target.value }))} />
              )}
            </div>

            {/* Buyer + ref */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Buyer / Merchant</Label>
                <Select
                  value={form.buyerId || "__none__"}
                  onValueChange={v => {
                    const b = v === "__none__" ? null : buyers.find((bx: any) => String(bx.id) === v);
                    setForm(f => ({
                      ...f,
                      buyerId: v === "__none__" ? "" : v,
                      // Auto-fill destination if it's empty or was "None"
                      destination: (!f.destination || f.destination === "__custom__") && b ? b.name : f.destination,
                    }));
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select or leave blank" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
                    {buyers.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Contract / TASQ Ref</Label>
                {contracts.length > 0 ? (
                  <>
                    <Select
                      value={form.contractId || "__none__"}
                      onValueChange={v => {
                        if (v === "__none__") { setForm(f => ({ ...f, contractId: "", buyerRef: "" })); return; }
                        const c = contracts.find((cx: any) => String(cx.id) === v);
                        setForm(f => ({
                          ...f,
                          contractId: v,
                          buyerRef: c?.contractReference ?? "",
                          // Auto-fill commodity if blank and contract has one
                          commodity: (!f.commodity || f.commodity === "__none__") && c?.commodity
                            ? (COMMODITY_SUGGESTIONS[f.loadType]?.includes(c.commodity) ? c.commodity : "__custom__")
                            : f.commodity,
                          commodityCustom: (!f.commodity || f.commodity === "__none__") && c?.commodity
                            ? (!COMMODITY_SUGGESTIONS[f.loadType]?.includes(c.commodity) ? c.commodity : f.commodityCustom)
                            : f.commodityCustom,
                        }));
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select open contract…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— No contract linked —</SelectItem>
                        {contracts.map((c: any) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.contractReference ? `${c.contractReference} — ` : ""}{c.commodity}{c.quantityTonnes ? ` · ${parseFloat(c.remainingTonnes ?? c.quantityTonnes).toFixed(0)}t remaining` : ""}
                          </SelectItem>
                        ))}
                        <SelectItem value="__custom__">Enter ref manually…</SelectItem>
                      </SelectContent>
                    </Select>
                    {(form.contractId === "__custom__" || (form.buyerRef && !contracts.find((c: any) => c.contractReference === form.buyerRef))) && (
                      <Input className="mt-1" placeholder="e.g. TASQ-12345" value={form.buyerRef} onChange={e => setForm(f => ({ ...f, buyerRef: e.target.value, contractId: "__custom__" }))} />
                    )}
                  </>
                ) : (
                  <Input placeholder="e.g. TASQ-12345" value={form.buyerRef} onChange={e => setForm(f => ({ ...f, buyerRef: e.target.value }))} />
                )}
                {form.buyerId && !contractsQ.isFetched && <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 2 }}>Loading contracts…</p>}
                {form.buyerId && contractsQ.isFetched && contracts.length === 0 && <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 2 }}>No open contracts for this buyer</p>}
              </div>
            </div>

            {/* Dates + load estimates */}
            <div>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }}>Schedule & Quantities</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Planned Date <span style={{ color: "#ef4444" }}>*</span></Label><Input type="date" value={form.plannedDate} onChange={e => setForm(f => ({ ...f, plannedDate: e.target.value }))} /></div>
                <div><Label>End Date (if multi-day)</Label><Input type="date" value={form.plannedDateEnd} onChange={e => setForm(f => ({ ...f, plannedDateEnd: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-4 gap-3" style={{ marginTop: "0.75rem" }}>
                <div>
                  <Label>Est. Loads (trips)</Label>
                  <Input type="number" min="1" step="1" placeholder="e.g. 20" value={form.estimatedLoads} onChange={e => setForm(f => ({ ...f, estimatedLoads: e.target.value }))} />
                </div>
                <div>
                  <Label>Est. Vehicles</Label>
                  <Input type="number" min="1" step="1" placeholder="e.g. 4" value={form.estimatedVehicles} onChange={e => setForm(f => ({ ...f, estimatedVehicles: e.target.value }))} />
                  {form.estimatedLoads && form.estimatedVehicles && parseInt(form.estimatedVehicles) > 0 && (
                    <p style={{ fontSize: "0.68rem", color: "#6b7280", marginTop: 2 }}>≈ {Math.ceil(parseInt(form.estimatedLoads) / parseInt(form.estimatedVehicles))} trips/vehicle</p>
                  )}
                </div>
                <div><Label>Est. Tonnes</Label><Input type="number" min="0" step="0.01" placeholder="e.g. 250.00" value={form.estimatedTonnes} onChange={e => setForm(f => ({ ...f, estimatedTonnes: e.target.value }))} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PLAN_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Decision made by + notes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Decision made by</Label>
                {members.length > 0 ? (
                  <Select value={form.decisionMadeByMemberId || "__none__"} onValueChange={v => setForm(f => ({ ...f, decisionMadeByMemberId: v === "__none__" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select team member…" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Not specified —</SelectItem>
                      {members.map((m: any) => <SelectItem key={m.id} value={String(m.id)}>{m.firstName} {m.lastName}{m.jobTitle ? ` (${m.jobTitle})` : ""}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input placeholder="e.g. James Barnett" value={form.decisionMadeByMemberId} onChange={e => setForm(f => ({ ...f, decisionMadeByMemberId: e.target.value }))} />
                )}
              </div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditPlan(null); setForm(emptyPlanForm()); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.plannedDate || saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : editPlan ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null); }}>
        <DialogContent style={{ maxWidth: 420 }}>
          <DialogHeader><DialogTitle>Delete Dispatch Plan</DialogTitle></DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#374151" }}>
            Delete plan <strong>{deleteTarget?.title}</strong>? Any dispatch records linked to it will remain, but the link will be removed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMut.mutate(deleteTarget.id)} disabled={deleteMut.isPending}>
              {deleteMut.isPending ? "Deleting…" : "Delete Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Haulier Directory — constants ──────────────────────────────────────────
const VEHICLE_TYPES = [
  "Articulated lorry", "Articulated tipper", "Rigid tipper", "Grain trailer",
  "Livestock wagon", "Double-deck livestock wagon", "Tanker", "Flatbed / dropsider",
  "Curtain-sider", "Refrigerated lorry", "Container lorry", "Low-loader",
];
const CONTACT_ROLES = ["Office / Admin", "Driver", "Emergency / Out-of-hours", "Accounts", "Other"];

interface HaulierContact { name: string; role: string; phone: string; email: string; }
interface HaulierForm {
  companyName: string; operatorLicence: string; notes: string; email: string;
  addressLine1: string; addressLine2: string; town: string; county: string; postcode: string;
  vehicleTypes: string[]; contacts: HaulierContact[];
}

const emptyContact = (): HaulierContact => ({ name: "", role: "Office / Admin", phone: "", email: "" });
const emptyHaulierForm = (): HaulierForm => ({
  companyName: "", operatorLicence: "", notes: "", email: "",
  addressLine1: "", addressLine2: "", town: "", county: "", postcode: "",
  vehicleTypes: [], contacts: [emptyContact()],
});

function parseVehicleTypes(raw: string | string[] | null | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return raw ? [raw as string] : []; }
}
function parseContacts(raw: string | HaulierContact[] | null | undefined): HaulierContact[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch { return []; }
}
function haulierToForm(h: any): HaulierForm {
  return {
    companyName: h.companyName ?? "", operatorLicence: h.operatorLicence ?? "",
    notes: h.notes ?? "", email: h.email ?? "",
    addressLine1: h.addressLine1 ?? "", addressLine2: h.addressLine2 ?? "",
    town: h.town ?? "", county: h.county ?? "", postcode: h.postcode ?? "",
    vehicleTypes: parseVehicleTypes(h.vehicleTypes),
    contacts: parseContacts(h.contacts).length > 0 ? parseContacts(h.contacts) : [emptyContact()],
  };
}
function addressOneLine(h: any): string {
  return [h.addressLine1, h.town, h.postcode].filter(Boolean).join(", ") || "";
}
function primaryContact(h: any): HaulierContact | null {
  const contacts = parseContacts(h.contacts);
  return contacts[0] ?? null;
}

// ─── Haulier Directory Tab ──────────────────────────────────────────────────
function HaulierDirectoryTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editHaulier, setEditHaulier] = useState<any | null>(null);
  const [viewHaulier, setViewHaulier] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [form, setForm] = useState<HaulierForm>(emptyHaulierForm());

  const q = useQuery({
    queryKey: ["hauliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/hauliers`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const saveMut = useMutation({
    mutationFn: (body: any) => {
      if (editHaulier) return fetch(`/api/farms/${farmId}/hauliers/${editHaulier.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return fetch(`/api/farms/${farmId}/hauliers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    },
    onSuccess: () => {
      toast({ title: editHaulier ? "Haulier updated" : "Haulier added" });
      qc.invalidateQueries({ queryKey: ["hauliers", farmId] });
      setAddOpen(false); setEditHaulier(null); setForm(emptyHaulierForm());
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/hauliers/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Haulier removed" }); qc.invalidateQueries({ queryKey: ["hauliers", farmId] }); setDeleteTarget(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const records: any[] = q.data ?? [];

  const openAdd = () => { setEditHaulier(null); setForm(emptyHaulierForm()); setAddOpen(true); };
  const openEdit = (h: any) => { setEditHaulier(h); setForm(haulierToForm(h)); setAddOpen(true); };

  const setContact = (i: number, field: keyof HaulierContact, value: string) =>
    setForm(f => { const cs = [...f.contacts]; cs[i] = { ...cs[i], [field]: value }; return { ...f, contacts: cs }; });
  const addContact = () => setForm(f => ({ ...f, contacts: [...f.contacts, emptyContact()] }));
  const removeContact = (i: number) => setForm(f => ({ ...f, contacts: f.contacts.filter((_, idx) => idx !== i) }));
  const toggleVehicle = (v: string) => setForm(f => ({
    ...f, vehicleTypes: f.vehicleTypes.includes(v) ? f.vehicleTypes.filter(x => x !== v) : [...f.vehicleTypes, v],
  }));

  const handleSave = () => {
    saveMut.mutate({
      ...form,
      vehicleTypes: JSON.stringify(form.vehicleTypes),
      contacts: JSON.stringify(form.contacts.filter(c => c.name || c.phone || c.email)),
    });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Add Haulier</Button>
      </div>

      {records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Building2 size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No hauliers registered</p>
          <p style={{ fontSize: "0.875rem" }}>Add your approved hauliers to select them quickly when recording dispatches.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {records.map((h: any) => {
            const vts = parseVehicleTypes(h.vehicleTypes);
            const pc = primaryContact(h);
            const addr = addressOneLine(h);
            return (
              <div key={h.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <p style={{ fontWeight: 600, color: "#111827", fontSize: "0.95rem" }}>{h.companyName}</p>
                    {h.operatorLicence && <span style={{ fontSize: "0.75rem", background: "#eff6ff", color: "#1e40af", padding: "1px 7px", borderRadius: 4 }}>O Licence: {h.operatorLicence}</span>}
                  </div>
                  {addr && <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>{addr}</p>}
                  {pc && <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 2 }}>{pc.name}{pc.role ? ` · ${pc.role}` : ""}{pc.phone ? ` · ${pc.phone}` : ""}</p>}
                  {vts.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                      {vts.map(v => <span key={v} style={{ fontSize: "0.7rem", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "1px 6px", borderRadius: 4 }}>{v}</span>)}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <Button size="sm" variant="ghost" title="View" onClick={() => setViewHaulier(h)}><Eye size={14} /></Button>
                  <Button size="sm" variant="ghost" title="Edit" onClick={() => openEdit(h)}><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" title="Delete" style={{ color: "#ef4444" }} onClick={() => setDeleteTarget(h)}><Trash2 size={14} /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── View Dialog ── */}
      <Dialog open={!!viewHaulier} onOpenChange={o => { if (!o) setViewHaulier(null); }}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader><DialogTitle>{viewHaulier?.companyName}</DialogTitle></DialogHeader>
          {viewHaulier && (() => {
            const vts = parseVehicleTypes(viewHaulier.vehicleTypes);
            const cs = parseContacts(viewHaulier.contacts);
            const addr = [viewHaulier.addressLine1, viewHaulier.addressLine2, viewHaulier.town, viewHaulier.county, viewHaulier.postcode].filter(Boolean).join(", ");
            return (
              <div className="space-y-4 py-1">
                {viewHaulier.operatorLicence && <div><p style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Operator Licence</p><p style={{ fontWeight: 500 }}>{viewHaulier.operatorLicence}</p></div>}
                {addr && <div><p style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Address</p><p style={{ whiteSpace: "pre-line" }}>{[viewHaulier.addressLine1, viewHaulier.addressLine2, viewHaulier.town, viewHaulier.county, viewHaulier.postcode].filter(Boolean).join("\n")}</p></div>}
                {vts.length > 0 && <div><p style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Vehicle Types</p><div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{vts.map(v => <span key={v} style={{ fontSize: "0.8rem", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", padding: "2px 8px", borderRadius: 4 }}>{v}</span>)}</div></div>}
                {cs.length > 0 && <div><p style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Contacts</p>
                  <div className="space-y-2">{cs.map((c, i) => <div key={i} style={{ background: "#f9fafb", borderRadius: 6, padding: "8px 10px" }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{c.name} {c.role && <span style={{ fontWeight: 400, color: "#6b7280" }}>· {c.role}</span>}</p>
                    <div style={{ display: "flex", gap: 16, marginTop: 2 }}>
                      {c.phone && <p style={{ fontSize: "0.8rem", color: "#374151" }}>{c.phone}</p>}
                      {c.email && <p style={{ fontSize: "0.8rem", color: "#374151" }}>{c.email}</p>}
                    </div>
                  </div>)}</div>
                </div>}
                {viewHaulier.notes && <div><p style={{ fontSize: "0.75rem", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Notes</p><p style={{ fontSize: "0.875rem" }}>{viewHaulier.notes}</p></div>}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewHaulier(null)}>Close</Button>
            <Button onClick={() => { openEdit(viewHaulier); setViewHaulier(null); }}><Pencil size={14} className="mr-1" />Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditHaulier(null); setForm(emptyHaulierForm()); } }}>
        <DialogContent style={{ maxWidth: 620, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editHaulier ? "Edit Haulier" : "Add Haulier"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">

            {/* Company + Licence */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Company Name <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. Smith Agricultural Haulage Ltd" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} /></div>
              <div><Label>Operator Licence No.</Label><Input placeholder="O-XXXXXX" value={form.operatorLicence} onChange={e => setForm(f => ({ ...f, operatorLicence: e.target.value }))} /></div>
              <div><Label>General Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            </div>

            {/* Address */}
            <div>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }}>Address</p>
              <div className="space-y-2">
                <Input placeholder="Address line 1" value={form.addressLine1} onChange={e => setForm(f => ({ ...f, addressLine1: e.target.value }))} />
                <Input placeholder="Address line 2 (optional)" value={form.addressLine2} onChange={e => setForm(f => ({ ...f, addressLine2: e.target.value }))} />
                <div className="grid grid-cols-3 gap-2">
                  <Input placeholder="Town / City" value={form.town} onChange={e => setForm(f => ({ ...f, town: e.target.value }))} />
                  <Input placeholder="County" value={form.county} onChange={e => setForm(f => ({ ...f, county: e.target.value }))} />
                  <Input placeholder="Postcode" value={form.postcode} onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Vehicle Types */}
            <div>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }}>Vehicle Types</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 12px" }}>
                {VEHICLE_TYPES.map(v => (
                  <label key={v} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", cursor: "pointer", padding: "3px 0" }}>
                    <input type="checkbox" checked={form.vehicleTypes.includes(v)} onChange={() => toggleVehicle(v)} style={{ accentColor: "#1a6b3a" }} />
                    {v}
                  </label>
                ))}
              </div>
            </div>

            {/* Contacts */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: 4, marginBottom: 8 }}>
                <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>Contacts</p>
                <Button size="sm" variant="outline" type="button" onClick={addContact} style={{ height: 26, fontSize: "0.75rem" }}><Plus size={12} className="mr-1" />Add Contact</Button>
              </div>
              <div className="space-y-3">
                {form.contacts.map((c, i) => (
                  <div key={i} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Contact {i + 1}</span>
                      {form.contacts.length > 1 && <Button size="sm" variant="ghost" type="button" onClick={() => removeContact(i)} style={{ height: 22, padding: "0 6px", color: "#ef4444" }}><X size={12} /></Button>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Full name" value={c.name} onChange={e => setContact(i, "name", e.target.value)} style={{ fontSize: "0.85rem" }} />
                      <Select value={c.role} onValueChange={v => setContact(i, "role", v)}>
                        <SelectTrigger style={{ fontSize: "0.85rem" }}><SelectValue /></SelectTrigger>
                        <SelectContent>{CONTACT_ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input placeholder="Phone number" value={c.phone} onChange={e => setContact(i, "phone", e.target.value)} style={{ fontSize: "0.85rem" }} />
                      <Input placeholder="Email address" type="email" value={c.email} onChange={e => setContact(i, "email", e.target.value)} style={{ fontSize: "0.85rem" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditHaulier(null); setForm(emptyHaulierForm()); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.companyName || saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : editHaulier ? "Save Changes" : "Add Haulier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null); }}>
        <DialogContent style={{ maxWidth: 420 }}>
          <DialogHeader><DialogTitle>Remove Haulier</DialogTitle></DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#374151" }}>
            Remove <strong>{deleteTarget?.companyName}</strong> from the directory? This haulier will no longer appear in dropdown lists, but existing dispatch records that reference them will be preserved.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMut.mutate(deleteTarget.id)} disabled={deleteMut.isPending}>
              {deleteMut.isPending ? "Removing…" : "Remove Haulier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Haulier Invoices Tab ───────────────────────────────────────────────────
const INV_STATUSES: { value: string; label: string; bg: string; color: string }[] = [
  { value: "received",    label: "Received",    bg: "#fef3c7", color: "#92400e" },
  { value: "queried",     label: "Queried",     bg: "#fee2e2", color: "#991b1b" },
  { value: "reconciled",  label: "Reconciled",  bg: "#eff6ff", color: "#1e40af" },
  { value: "paid",        label: "Paid",        bg: "#dcfce7", color: "#166534" },
];

function fmtGBP(pence: number | null | undefined): string {
  if (pence == null) return "—";
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface InvoiceForm {
  haulierId: string; haulierName: string; invoiceNumber: string;
  invoiceDate: string; periodFrom: string; periodTo: string;
  amountNetPence: string; vatPence: string; amountGrossPence: string;
  status: string; notes: string;
}
const emptyInvoiceForm = (): InvoiceForm => ({
  haulierId: "", haulierName: "", invoiceNumber: "",
  invoiceDate: "", periodFrom: "", periodTo: "",
  amountNetPence: "", vatPence: "", amountGrossPence: "",
  status: "received", notes: "",
});

function HaulierInvoicesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editInv, setEditInv] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState<InvoiceForm>(emptyInvoiceForm());
  const [useDirectory, setUseDirectory] = useState(true);
  // Assign loads modal
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedLoadIds, setSelectedLoadIds] = useState<Set<number>>(new Set());

  const invQ = useQuery({
    queryKey: ["haulier-invoices", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulier-invoices`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const hauliersQ = useQuery({
    queryKey: ["hauliers", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/hauliers`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });
  const loadsQ = useQuery({
    queryKey: ["haulier-invoice-loads", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulier-invoices/${expandedId}/loads`).then(r => r.json()),
    enabled: !!expandedId,
    select: d => d.loads ?? [],
  });
  const eligibleLoadsQ = useQuery({
    queryKey: ["haulier-invoice-eligible-loads", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/haulier-invoices/${expandedId}/eligible-loads`).then(r => r.json()),
    enabled: !!expandedId && assignOpen,
    select: d => d.loads ?? [],
  });

  const saveMut = useMutation({
    mutationFn: (body: any) => {
      if (editInv) return fetch(`/api/farms/${farmId}/haulier-invoices/${editInv.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      return fetch(`/api/farms/${farmId}/haulier-invoices`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    },
    onSuccess: () => {
      toast({ title: editInv ? "Invoice updated" : "Invoice added" });
      qc.invalidateQueries({ queryKey: ["haulier-invoices", farmId] });
      setAddOpen(false); setEditInv(null); setForm(emptyInvoiceForm());
    },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/haulier-invoices/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Invoice deleted" });
      qc.invalidateQueries({ queryKey: ["haulier-invoices", farmId] });
      setDeleteTarget(null);
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const assignMut = useMutation({
    mutationFn: ({ invId, loadIds }: { invId: number; loadIds: number[] }) =>
      fetch(`/api/farms/${farmId}/haulier-invoices/${invId}/assign-loads`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ loadIds }),
      }).then(r => r.json()),
    onSuccess: (_, { loadIds }) => {
      toast({ title: `${loadIds.length} load${loadIds.length !== 1 ? "s" : ""} assigned to invoice` });
      qc.invalidateQueries({ queryKey: ["haulier-invoice-loads", farmId, expandedId] });
      qc.invalidateQueries({ queryKey: ["haulier-invoice-eligible-loads", farmId, expandedId] });
      setAssignOpen(false); setSelectedLoadIds(new Set());
    },
    onError: () => toast({ title: "Failed to assign loads", variant: "destructive" }),
  });

  const unassignMut = useMutation({
    mutationFn: ({ invId, loadIds }: { invId: number; loadIds: number[] }) =>
      fetch(`/api/farms/${farmId}/haulier-invoices/${invId}/unassign-loads`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ loadIds }),
      }).then(r => r.json()),
    onSuccess: () => {
      toast({ title: "Load removed from invoice" });
      qc.invalidateQueries({ queryKey: ["haulier-invoice-loads", farmId, expandedId] });
      qc.invalidateQueries({ queryKey: ["haulier-invoice-eligible-loads", farmId, expandedId] });
    },
    onError: () => toast({ title: "Failed to remove load", variant: "destructive" }),
  });

  const invoices: any[] = invQ.data ?? [];
  const hauliers: any[] = hauliersQ.data ?? [];

  const openAdd = () => { setEditInv(null); setForm(emptyInvoiceForm()); setUseDirectory(true); setAddOpen(true); };
  const openEdit = (inv: any) => {
    setEditInv(inv);
    setUseDirectory(!!inv.haulierId);
    setForm({
      haulierId: inv.haulierId ? String(inv.haulierId) : "",
      haulierName: inv.haulierName ?? "",
      invoiceNumber: inv.invoiceNumber ?? "",
      invoiceDate: inv.invoiceDate ?? "",
      periodFrom: inv.periodFrom ?? "",
      periodTo: inv.periodTo ?? "",
      amountNetPence: inv.amountNetPence != null ? (inv.amountNetPence / 100).toFixed(2) : "",
      vatPence: inv.vatPence != null ? (inv.vatPence / 100).toFixed(2) : "",
      amountGrossPence: inv.amountGrossPence != null ? (inv.amountGrossPence / 100).toFixed(2) : "",
      status: inv.status ?? "received",
      notes: inv.notes ?? "",
    });
    setAddOpen(true);
  };

  const autoGross = () => {
    const net = parseFloat(form.amountNetPence) || 0;
    const vat = parseFloat(form.vatPence) || 0;
    if (net || vat) setForm(f => ({ ...f, amountGrossPence: (net + vat).toFixed(2) }));
  };

  const invStatus = (s: string) => INV_STATUSES.find(x => x.value === s) ?? INV_STATUSES[0];

  const outstanding = invoices.filter(i => i.status === "received" || i.status === "queried").length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Invoices received from hauliers — reconcile against dispatches for accurate records.
          </p>
          {outstanding > 0 && (
            <span style={{ background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", padding: "2px 10px", borderRadius: 12, fontSize: "0.75rem", fontWeight: 600 }}>
              {outstanding} outstanding
            </span>
          )}
        </div>
        <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Record Invoice</Button>
      </div>

      {invoices.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Receipt size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No haulier invoices recorded</p>
          <p style={{ fontSize: "0.875rem" }}>Record invoices received from hauliers and reconcile them against individual loads.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {invoices.map((inv: any) => {
            const st = invStatus(inv.status);
            const isExpanded = expandedId === inv.id;
            const haulierLabel = inv.haulierName || (hauliers.find((h: any) => h.id === inv.haulierId)?.companyName) || "Unknown haulier";
            return (
              <div key={inv.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ padding: "0.875rem 1rem", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>{inv.invoiceNumber}</p>
                      <span style={{ background: st.bg, color: st.color, padding: "1px 8px", borderRadius: 10, fontSize: "0.7rem", fontWeight: 600 }}>{st.label}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 2, flexWrap: "wrap" }}>
                      <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>{haulierLabel}</p>
                      {inv.invoiceDate && <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Dated {inv.invoiceDate}</p>}
                      {(inv.periodFrom || inv.periodTo) && (
                        <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Period: {inv.periodFrom ?? "?"} — {inv.periodTo ?? "?"}</p>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>{fmtGBP(inv.amountGrossPence)}</p>
                    {inv.amountNetPence != null && inv.vatPence != null && (
                      <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Net {fmtGBP(inv.amountNetPence)} + VAT {fmtGBP(inv.vatPence)}</p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                    <Button size="sm" variant="ghost" title={isExpanded ? "Hide loads" : "View matched loads"} onClick={() => setExpandedId(isExpanded ? null : inv.id)}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </Button>
                    <Button size="sm" variant="ghost" title="Edit" onClick={() => openEdit(inv)}><Pencil size={14} /></Button>
                    <Button size="sm" variant="ghost" title="Delete" style={{ color: "#ef4444" }} onClick={() => setDeleteTarget(inv)}><Trash2 size={14} /></Button>
                  </div>
                </div>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid #e5e7eb", background: "#f9fafb", padding: "10px 16px" }}>
                    {/* ── Matched loads ── */}
                    {loadsQ.isLoading ? (
                      <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Loading loads…</p>
                    ) : (loadsQ.data ?? []).length === 0 ? (
                      <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: 10 }}>
                        No dispatch records linked to this invoice yet.
                      </p>
                    ) : (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ fontSize: "0.75rem", color: "#374151", fontWeight: 600, marginBottom: 6 }}>
                          {(loadsQ.data ?? []).length} load{(loadsQ.data ?? []).length !== 1 ? "s" : ""} linked to this invoice
                        </p>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                          <thead>
                            <tr style={{ color: "#6b7280" }}>
                              <th style={{ textAlign: "left", padding: "3px 8px" }}>Date</th>
                              <th style={{ textAlign: "left", padding: "3px 8px" }}>Commodity</th>
                              <th style={{ textAlign: "left", padding: "3px 8px" }}>Destination</th>
                              <th style={{ textAlign: "right", padding: "3px 8px" }}>Weight (t)</th>
                              <th style={{ textAlign: "right", padding: "3px 8px" }}>Cost</th>
                              <th style={{ width: 28 }} />
                            </tr>
                          </thead>
                          <tbody>
                            {(loadsQ.data ?? []).map((load: any) => (
                              <tr key={load.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                                <td style={{ padding: "4px 8px" }}>{load.departureDate?.slice(0, 10) ?? "—"}</td>
                                <td style={{ padding: "4px 8px" }}>{load.commodity || load.loadType || "—"}</td>
                                <td style={{ padding: "4px 8px" }}>{load.destination || "—"}</td>
                                <td style={{ padding: "4px 8px", textAlign: "right" }}>{load.weightTonnes ? parseFloat(load.weightTonnes).toFixed(2) : "—"}</td>
                                <td style={{ padding: "4px 8px", textAlign: "right" }}>{fmtGBP(load.costPence)}</td>
                                <td style={{ padding: "4px 4px", textAlign: "center" }}>
                                  <button
                                    title="Remove from invoice"
                                    onClick={() => unassignMut.mutate({ invId: inv.id, loadIds: [load.id] })}
                                    style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", lineHeight: 1 }}
                                  >×</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr style={{ borderTop: "2px solid #e5e7eb", fontWeight: 600 }}>
                              <td colSpan={3} style={{ padding: "4px 8px" }}>Total linked</td>
                              <td style={{ padding: "4px 8px", textAlign: "right" }}>
                                {(loadsQ.data ?? []).reduce((s: number, l: any) => s + parseFloat(l.weightTonnes ?? "0"), 0).toFixed(2)} t
                              </td>
                              <td style={{ padding: "4px 8px", textAlign: "right" }}>
                                {fmtGBP((loadsQ.data ?? []).reduce((s: number, l: any) => s + (l.costPence ?? 0), 0))}
                              </td>
                              <td />
                            </tr>
                            {/* Variance row — compare matched cost vs invoice gross */}
                            {inv.amountGrossPence != null && (
                              <tr style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                <td colSpan={4} style={{ padding: "2px 8px" }}>Invoice gross</td>
                                <td style={{ padding: "2px 8px", textAlign: "right" }}>{fmtGBP(inv.amountGrossPence)}</td>
                                <td />
                              </tr>
                            )}
                            {inv.amountGrossPence != null && (() => {
                              const matched = (loadsQ.data ?? []).reduce((s: number, l: any) => s + (l.costPence ?? 0), 0);
                              const diff = matched - inv.amountGrossPence;
                              if (diff === 0) return null;
                              return (
                                <tr style={{ fontSize: "0.75rem", color: diff > 0 ? "#b45309" : "#dc2626" }}>
                                  <td colSpan={4} style={{ padding: "2px 8px" }}>Variance</td>
                                  <td style={{ padding: "2px 8px", textAlign: "right" }}>{diff > 0 ? "+" : ""}{fmtGBP(Math.abs(diff))}{diff > 0 ? " over" : " under"}</td>
                                  <td />
                                </tr>
                              );
                            })()}
                          </tfoot>
                        </table>
                      </div>
                    )}
                    {/* ── Assign unlinked loads ── */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: (loadsQ.data ?? []).length > 0 ? 8 : 0, borderTop: (loadsQ.data ?? []).length > 0 ? "1px dashed #e5e7eb" : "none" }}>
                      <Button size="sm" variant="outline" onClick={() => { setAssignOpen(true); }}>
                        <Plus size={13} className="mr-1" />Find loads to assign
                      </Button>
                      <p style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                        {inv.haulierId || inv.haulierName ? "Shows dispatch records from this haulier not yet linked to any invoice." : "Set the Invoice Ref on individual dispatch records to link them manually."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditInv(null); setForm(emptyInvoiceForm()); } }}>
        <DialogContent style={{ maxWidth: 580, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editInv ? "Edit Invoice" : "Record Haulier Invoice"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">

            {/* Haulier */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Label>Haulier</Label>
                <button type="button" onClick={() => setUseDirectory(d => !d)} style={{ fontSize: "0.75rem", color: "#1a6b3a", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  {useDirectory ? "Enter name manually" : "Use directory"}
                </button>
              </div>
              {useDirectory ? (
                <Select value={form.haulierId || "__none__"} onValueChange={v => {
                  const h = hauliers.find((x: any) => String(x.id) === v);
                  setForm(f => ({ ...f, haulierId: v === "__none__" ? "" : v, haulierName: h ? h.companyName : "" }));
                }}>
                  <SelectTrigger><SelectValue placeholder="Select haulier from directory" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select haulier —</SelectItem>
                    {hauliers.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.companyName}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input placeholder="Haulier company name" value={form.haulierName} onChange={e => setForm(f => ({ ...f, haulierName: e.target.value, haulierId: "" }))} />
              )}
            </div>

            {/* Invoice number + date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Invoice Number <span style={{ color: "#ef4444" }}>*</span></Label>
                <Input placeholder="e.g. INV-1234" value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} />
              </div>
              <div>
                <Label>Invoice Date</Label>
                <Input type="date" value={form.invoiceDate} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} />
              </div>
            </div>

            {/* Period */}
            <div>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }}>Billing Period</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>From</Label><Input type="date" value={form.periodFrom} onChange={e => setForm(f => ({ ...f, periodFrom: e.target.value }))} /></div>
                <div><Label>To</Label><Input type="date" value={form.periodTo} onChange={e => setForm(f => ({ ...f, periodTo: e.target.value }))} /></div>
              </div>
            </div>

            {/* Amounts */}
            <div>
              <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6, borderBottom: "1px solid #e5e7eb", paddingBottom: 4 }}>Amounts</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Net (£)</Label>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.amountNetPence} onChange={e => setForm(f => ({ ...f, amountNetPence: e.target.value }))} onBlur={autoGross} />
                </div>
                <div>
                  <Label>VAT (£)</Label>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.vatPence} onChange={e => setForm(f => ({ ...f, vatPence: e.target.value }))} onBlur={autoGross} />
                </div>
                <div>
                  <Label>Gross (£)</Label>
                  <Input type="number" step="0.01" min="0" placeholder="0.00" value={form.amountGrossPence} onChange={e => setForm(f => ({ ...f, amountGrossPence: e.target.value }))} />
                </div>
              </div>
              <p style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: 4 }}>Tab out of Net or VAT to auto-calculate Gross.</p>
            </div>

            {/* Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INV_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditInv(null); setForm(emptyInvoiceForm()); }}>Cancel</Button>
            <Button onClick={() => saveMut.mutate(form)} disabled={!form.invoiceNumber || saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : editInv ? "Save Changes" : "Record Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={!!deleteTarget} onOpenChange={o => { if (!o) setDeleteTarget(null); }}>
        <DialogContent style={{ maxWidth: 420 }}>
          <DialogHeader><DialogTitle>Delete Invoice</DialogTitle></DialogHeader>
          <p style={{ fontSize: "0.875rem", color: "#374151" }}>
            Delete invoice <strong>{deleteTarget?.invoiceNumber}</strong>? This will not affect the dispatch records linked to it.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMut.mutate(deleteTarget.id)} disabled={deleteMut.isPending}>
              {deleteMut.isPending ? "Deleting…" : "Delete Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Assign Loads Modal ── */}
      {expandedId && (() => {
        const inv = invoices.find((i: any) => i.id === expandedId);
        if (!inv) return null;
        const eligible: any[] = eligibleLoadsQ.data ?? [];
        const allSelected = eligible.length > 0 && eligible.every((l: any) => selectedLoadIds.has(l.id));
        return (
          <Dialog open={assignOpen} onOpenChange={o => { if (!o) { setAssignOpen(false); setSelectedLoadIds(new Set()); } }}>
            <DialogContent style={{ maxWidth: 680, maxHeight: "85vh", overflowY: "auto" }}>
              <DialogHeader>
                <DialogTitle>Assign dispatch loads — {inv.invoiceNumber}</DialogTitle>
              </DialogHeader>
              <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                Showing unlinked dispatch records from {inv.haulierName || (hauliers.find((h: any) => h.id === inv.haulierId)?.companyName) || "this haulier"}
                {(inv.periodFrom || inv.periodTo) ? ` between ${inv.periodFrom ?? "?"} and ${inv.periodTo ?? "?"}` : ""}.
                Tick the loads covered by this invoice, then click Assign.
              </p>
              {eligibleLoadsQ.isLoading ? (
                <p style={{ fontSize: "0.85rem", color: "#6b7280", padding: "1rem 0" }}>Searching for loads…</p>
              ) : eligible.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                  <p style={{ fontWeight: 600, color: "#374151" }}>No unlinked loads found</p>
                  <p style={{ fontSize: "0.8rem", marginTop: 4 }}>
                    {inv.haulierId || inv.haulierName
                      ? "All loads from this haulier in the billing period are already linked to an invoice."
                      : "Add a haulier to this invoice to find matching dispatch records automatically."}
                  </p>
                </div>
              ) : (
                <div>
                  {/* Select all toggle */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #e5e7eb", marginBottom: 6 }}>
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => {
                        if (allSelected) setSelectedLoadIds(new Set());
                        else setSelectedLoadIds(new Set(eligible.map((l: any) => l.id)));
                      }}
                      style={{ accentColor: "#1a6b3a", width: 15, height: 15 }}
                    />
                    <span style={{ fontSize: "0.8rem", color: "#374151", fontWeight: 600 }}>
                      Select all ({eligible.length} load{eligible.length !== 1 ? "s" : ""})
                    </span>
                    {selectedLoadIds.size > 0 && (
                      <span style={{ marginLeft: "auto", fontSize: "0.75rem", background: "#dcfce7", color: "#166534", padding: "1px 8px", borderRadius: 10, fontWeight: 600 }}>
                        {selectedLoadIds.size} selected
                      </span>
                    )}
                  </div>
                  <div style={{ display: "grid", gap: 4 }}>
                    {eligible.map((load: any) => {
                      const checked = selectedLoadIds.has(load.id);
                      return (
                        <label
                          key={load.id}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", background: checked ? "#f0fdf4" : "#fff", border: `1px solid ${checked ? "#86efac" : "#e5e7eb"}`, borderRadius: 8, cursor: "pointer" }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setSelectedLoadIds(prev => {
                              const next = new Set(prev);
                              if (next.has(load.id)) next.delete(load.id); else next.add(load.id);
                              return next;
                            })}
                            style={{ accentColor: "#1a6b3a", width: 15, height: 15, flexShrink: 0 }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", gap: 10, fontSize: "0.82rem", fontWeight: 500, color: "#111827" }}>
                              <span>{load.departureDate?.slice(0, 10) ?? "—"}</span>
                              <span>{load.commodity || load.loadType || "—"}</span>
                              {load.destination && <span style={{ color: "#6b7280" }}>→ {load.destination}</span>}
                            </div>
                            <div style={{ display: "flex", gap: 10, fontSize: "0.75rem", color: "#6b7280", marginTop: 1 }}>
                              {load.weightTonnes && <span>{parseFloat(load.weightTonnes).toFixed(2)} t</span>}
                              {load.costPence != null && <span>{fmtGBP(load.costPence)}</span>}
                              {load.waybillNumber && <span>Waybill {load.waybillNumber}</span>}
                              {load.invoiceRef && <span style={{ color: "#b45309" }}>Currently on: {load.invoiceRef}</span>}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {/* Selected totals */}
                  {selectedLoadIds.size > 0 && (() => {
                    const sel = eligible.filter((l: any) => selectedLoadIds.has(l.id));
                    const totalT = sel.reduce((s: number, l: any) => s + parseFloat(l.weightTonnes ?? "0"), 0);
                    const totalCost = sel.reduce((s: number, l: any) => s + (l.costPence ?? 0), 0);
                    return (
                      <div style={{ display: "flex", gap: 16, padding: "8px 10px", marginTop: 8, background: "#f9fafb", borderRadius: 8, fontSize: "0.8rem", color: "#374151" }}>
                        <span><strong>{selectedLoadIds.size}</strong> loads selected</span>
                        <span><strong>{totalT.toFixed(2)} t</strong></span>
                        <span><strong>{fmtGBP(totalCost)}</strong></span>
                        {inv.amountGrossPence != null && totalCost !== inv.amountGrossPence && (
                          <span style={{ marginLeft: "auto", color: totalCost > inv.amountGrossPence ? "#b45309" : "#6b7280" }}>
                            vs invoice {fmtGBP(inv.amountGrossPence)} ({totalCost > inv.amountGrossPence ? "+" : ""}{fmtGBP(Math.abs(totalCost - inv.amountGrossPence))} {totalCost > inv.amountGrossPence ? "over" : "under"})
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => { setAssignOpen(false); setSelectedLoadIds(new Set()); }}>Cancel</Button>
                <Button
                  onClick={() => assignMut.mutate({ invId: inv.id, loadIds: Array.from(selectedLoadIds) })}
                  disabled={selectedLoadIds.size === 0 || assignMut.isPending}
                >
                  {assignMut.isPending ? "Assigning…" : `Assign ${selectedLoadIds.size > 0 ? selectedLoadIds.size + " load" + (selectedLoadIds.size !== 1 ? "s" : "") : "loads"} to invoice`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      })()}
    </div>
  );
}

// ─── Page Shell ─────────────────────────────────────────────────────────────
export default function HaulagePageFull() {
  const { farmId } = useAppStore();
  const initialTab = (): Tab => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("tab");
      const valid: Tab[] = ["plans", "dispatches", "transfers", "grain-position", "invoices", "directory"];
      if (p && valid.includes(p as Tab)) return p as Tab;
    }
    return "dispatches";
  };
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <AppLayout title="Haulage & Transport">
      <TabBar>
        <TabButton active={tab === "plans"} onClick={() => setTab("plans")}><ClipboardList size={14} className="mr-1" />Dispatch Plans</TabButton>
        <TabButton active={tab === "dispatches"} onClick={() => setTab("dispatches")}><ArrowUpRight size={14} className="mr-1" />Dispatches</TabButton>
        <TabButton active={tab === "transfers"} onClick={() => setTab("transfers")}><ArrowLeftRight size={14} className="mr-1" />On-Farm Transfers</TabButton>
        <TabButton active={tab === "grain-position"} onClick={() => setTab("grain-position")}><Wheat size={14} className="mr-1" />Grain Position</TabButton>
        <TabButton active={tab === "invoices"} onClick={() => setTab("invoices")}><Receipt size={14} className="mr-1" />Haulier Invoices</TabButton>
        <TabButton active={tab === "directory"} onClick={() => setTab("directory")}><Building2 size={14} className="mr-1" />Haulier Directory</TabButton>
      </TabBar>

      <div style={{ marginTop: 20 }}>
        {farmId && tab === "plans" && <DispatchPlansTab farmId={farmId} />}
        {farmId && tab === "dispatches" && <DispatchesTab farmId={farmId} />}
        {farmId && tab === "transfers" && <TransfersTab farmId={farmId} />}
        {farmId && tab === "grain-position" && <GrainPositionTab farmId={farmId} onGoToDispatches={() => setTab("dispatches")} />}
        {farmId && tab === "invoices" && <HaulierInvoicesTab farmId={farmId} />}
        {farmId && tab === "directory" && <HaulierDirectoryTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
