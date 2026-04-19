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
import { Plus, Trash2, Truck, Building2, Wheat, BarChart3, Pencil, Eye, CheckCircle2, ArrowLeftRight, ArrowUpRight, Paperclip, X, FileText, Image } from "lucide-react";
import { useUpload } from "@workspace/object-storage-web";

type Tab = "dispatches" | "transfers" | "grain-position" | "directory";

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
    haulierRegisteredId: null as number | null, haulierCompany: "",
    deliveryStatus: "booked",
    weightTonnes: "", vehicleRegistration: "", driverName: "",
    origin: "", destination: "",
    departureDate: "", arrivalDate: "",
    waybillNumber: "", costPence: "", notes: "",
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

  const invalidate = () => qc.invalidateQueries({ queryKey: ["haulage", farmId] });

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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <F label="Waybill" value={viewRecord.waybillNumber} />
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
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setViewRecord(null)}>Close</Button>
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
                <div><Label>Driver Name</Label><Input value={form.driverName} onChange={e => setForm((f: any) => ({ ...f, driverName: e.target.value }))} /></div>
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
                    <Input placeholder="Haulier company name" value={form.haulierCompany} onChange={e => setForm((f: any) => ({ ...f, haulierCompany: e.target.value }))} />
                  )}
                </div>
                <div><Label>Waybill / Docket Ref</Label><Input value={form.waybillNumber} onChange={e => setForm((f: any) => ({ ...f, waybillNumber: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3" style={{ marginTop: "0.75rem" }}>
                <div><Label>Origin (farm / field)</Label><Input placeholder="e.g. Home Farm, Barn 2" value={form.origin} onChange={e => setForm((f: any) => ({ ...f, origin: e.target.value }))} /></div>
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
              <div><Label>Driver / Operator</Label><Input value={form.driverName} onChange={e => setForm((f: any) => ({ ...f, driverName: e.target.value }))} /></div>
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

// ─── Haulier Directory Tab ──────────────────────────────────────────────────
function HaulierDirectoryTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [editHaulier, setEditHaulier] = useState<any | null>(null);

  const empty = { companyName: "", contactName: "", phone: "", email: "", address: "", vehicleTypes: "", operatorLicence: "", notes: "" };
  const [form, setForm] = useState<any>(empty);

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
    onSuccess: () => { toast({ title: editHaulier ? "Haulier updated" : "Haulier added" }); qc.invalidateQueries({ queryKey: ["hauliers", farmId] }); setAddOpen(false); setEditHaulier(null); setForm(empty); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const records: any[] = q.data ?? [];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button size="sm" onClick={() => { setEditHaulier(null); setForm(empty); setAddOpen(true); }}><Plus size={14} className="mr-1" />Add Haulier</Button>
      </div>

      {records.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
          <Building2 size={32} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <p style={{ fontWeight: 600, color: "#374151" }}>No hauliers registered</p>
          <p style={{ fontSize: "0.875rem" }}>Add your approved hauliers to select them quickly when recording dispatches.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {records.map((h: any) => (
            <div key={h.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontWeight: 600, color: "#111827" }}>{h.companyName}</p>
                {h.contactName && <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>{h.contactName}</p>}
                <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                  {h.phone && <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>{h.phone}</p>}
                  {h.email && <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>{h.email}</p>}
                  {h.operatorLicence && <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Licence: {h.operatorLicence}</p>}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { setEditHaulier(h); setForm({ ...h }); setAddOpen(true); }}><Pencil size={14} /></Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditHaulier(null); setForm(empty); } }}>
        <DialogContent style={{ maxWidth: 500 }}>
          <DialogHeader><DialogTitle>{editHaulier ? "Edit Haulier" : "Add Haulier"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Company Name <span style={{ color: "#ef4444" }}>*</span></Label><Input placeholder="e.g. Smith Agricultural Haulage Ltd" value={form.companyName} onChange={e => setForm((f: any) => ({ ...f, companyName: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Contact Name</Label><Input value={form.contactName} onChange={e => setForm((f: any) => ({ ...f, contactName: e.target.value }))} /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Operator Licence No.</Label><Input value={form.operatorLicence} onChange={e => setForm((f: any) => ({ ...f, operatorLicence: e.target.value }))} /></div>
            <div><Label>Vehicle Types</Label><Input placeholder="e.g. Articulated tipper, grain trailer" value={form.vehicleTypes} onChange={e => setForm((f: any) => ({ ...f, vehicleTypes: e.target.value }))} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditHaulier(null); setForm(empty); }}>Cancel</Button>
            <Button onClick={() => saveMut.mutate(form)} disabled={!form.companyName || saveMut.isPending}>
              {saveMut.isPending ? "Saving…" : editHaulier ? "Save Changes" : "Add Haulier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Page Shell ─────────────────────────────────────────────────────────────
export default function HaulagePageFull() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("dispatches");

  return (
    <AppLayout title="Haulage & Transport">
      <TabBar>
        <TabButton active={tab === "dispatches"} onClick={() => setTab("dispatches")}><ArrowUpRight size={14} className="mr-1" />Dispatches</TabButton>
        <TabButton active={tab === "transfers"} onClick={() => setTab("transfers")}><ArrowLeftRight size={14} className="mr-1" />On-Farm Transfers</TabButton>
        <TabButton active={tab === "grain-position"} onClick={() => setTab("grain-position")}><Wheat size={14} className="mr-1" />Grain Position</TabButton>
        <TabButton active={tab === "directory"} onClick={() => setTab("directory")}><Building2 size={14} className="mr-1" />Haulier Directory</TabButton>
      </TabBar>

      <div style={{ marginTop: 20 }}>
        {farmId && tab === "dispatches" && <DispatchesTab farmId={farmId} />}
        {farmId && tab === "transfers" && <TransfersTab farmId={farmId} />}
        {farmId && tab === "grain-position" && <GrainPositionTab farmId={farmId} onGoToDispatches={() => setTab("dispatches")} />}
        {farmId && tab === "directory" && <HaulierDirectoryTab farmId={farmId} />}
      </div>
    </AppLayout>
  );
}
