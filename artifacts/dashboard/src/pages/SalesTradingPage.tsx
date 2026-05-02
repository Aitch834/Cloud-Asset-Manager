import React, { useState, useMemo } from "react";
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
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import {
  Plus, Trash2, Pencil, Eye, TrendingUp, Wheat, PiggyBank, Bird, Milk,
  ShoppingCart, BarChart3, Package, Scale, CheckCircle2, DollarSign, AlertCircle,
  FileText, Calendar, ChevronDown, ChevronRight, X, Handshake, Droplets, Printer
} from "lucide-react";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const fmtMonth = (m: string | null | undefined) => {
  if (!m) return "—";
  const [y, mo] = m.split("-");
  return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};

const pToGBP = (pence: number | null | undefined) => {
  if (pence == null) return "—";
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const ppToGBP = (pence: number | null | undefined) => {
  if (pence == null) return "—";
  return `${(pence / 100).toFixed(2)}p`;
};

const num = (v: any) => (v == null || v === "" ? null : Number(v));

const CHART_COLORS = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2", "#be185d"];

type Tab = "grain" | "contracts" | "livestock" | "milk" | "poultry" | "pigs" | "direct" | "reports" | "settlement-notes";

// ─── Grain Bin Selector ───────────────────────────────────────────────────────
function GrainBinSelect({ farmId, value, onChange }: { farmId: number; value: number | null; onChange: (id: number | null, name: string) => void }) {
  const q = useQuery({
    queryKey: ["grain-storage-bins", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/grain-storage-bins`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => Array.isArray(d) ? d : (d.rows ?? d.records ?? []),
  });
  const bins: any[] = q.data ?? [];
  return (
    <Select value={value ? String(value) : "__none__"} onValueChange={v => {
      if (v === "__none__") { onChange(null, ""); return; }
      const bin = bins.find((b: any) => String(b.id) === v);
      onChange(bin?.id ?? null, bin?.binName ?? "");
    }}>
      <SelectTrigger><SelectValue placeholder="Select bin / store..." /></SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— None —</SelectItem>
        {bins.map((b: any) => <SelectItem key={b.id} value={String(b.id)}>{b.binName}{b.binType ? ` (${b.binType})` : ""}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

// ─── Grain Sales Tab ─────────────────────────────────────────────────────────
const COMMODITIES = [
  "Winter Wheat","Spring Wheat","Winter Barley","Spring Barley","Malting Barley",
  "Winter Oats","Spring Oats","Oilseed Rape","Winter Beans","Spring Beans",
  "Peas","Maize","Rye","Triticale","Linseed","Other",
];
const SALE_TYPES = [
  { value: "spot", label: "Spot" },
  { value: "forward", label: "Forward Contract Call-Off" },
  { value: "pool", label: "Pool Scheme" },
  { value: "ex-store", label: "Ex-Store" },
];

function GrainSalesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [viewSale, setViewSale] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const empty = {
    saleDate: "", saleType: "spot", buyerId: null as number | null, buyer: "", merchantRef: "", commodity: "", variety: "",
    tonnage: "", pricePerTonnePence: "", grossValuePence: "", deductionsPence: "", netValuePence: "",
    moisture: "", specificWeight: "", protein: "", gradeAchieved: "", qualitySpec: "",
    deliveryDate: "", deliveryLocation: "", haulierName: "", vehicleReg: "",
    weighbridgeTicket: "", invoiceNumber: "", paymentDate: "", cropYear: "", field: "", storeBin: "",
    storeBinId: null as number | null, notes: "",
    isOrganicCertified: false as boolean,
    organicCertRef: "",
  };
  const [form, setForm] = useState<any>(empty);

  const [cropYearFilter, setCropYearFilter] = useState<string>("__all__");

  const q = useQuery({ queryKey: ["grain-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/grain-sales`).then(r => r.json()), enabled: !!farmId });
  const records = q.data?.records ?? [];

  const availableCropYears = [...new Set<string>(records.map((r: any) => r.cropYear).filter(Boolean))].sort().reverse();
  const filteredRecords: any[] = cropYearFilter === "__all__" ? records : records.filter((r: any) => r.cropYear === cropYearFilter);

  const postMut = useMutation({
    mutationFn: (body: any) => editing
      ? fetch(`/api/farms/${farmId}/grain-sales/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json())
      : fetch(`/api/farms/${farmId}/grain-sales`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grain-sales", farmId] }); setOpen(false); setEditing(null); setForm(empty); toast({ title: editing ? "Grain sale updated" : "Grain sale recorded" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const delMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/grain-sales/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["grain-sales", farmId] }); setDeleteId(null); toast({ title: "Deleted" }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      ...form,
      tonnage: num(form.tonnage),
      pricePerTonnePence: num(form.pricePerTonnePence),
      grossValuePence: num(form.grossValuePence),
      deductionsPence: num(form.deductionsPence),
      netValuePence: num(form.netValuePence),
      moisture: num(form.moisture),
      specificWeight: num(form.specificWeight),
      protein: num(form.protein),
      saleDate: form.saleDate ? new Date(form.saleDate).toISOString() : undefined,
      deliveryDate: form.deliveryDate ? new Date(form.deliveryDate).toISOString() : undefined,
      paymentDate: form.paymentDate ? new Date(form.paymentDate).toISOString() : undefined,
    };
    postMut.mutate(body);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({
      ...r,
      saleDate: r.saleDate ? r.saleDate.slice(0, 10) : "",
      deliveryDate: r.deliveryDate ? r.deliveryDate.slice(0, 10) : "",
      paymentDate: r.paymentDate ? r.paymentDate.slice(0, 10) : "",
      isOrganicCertified: r.isOrganicCertified ?? false,
      organicCertRef: r.organicCertRef ?? "",
    });
    setOpen(true);
  };

  const totalRevenue = filteredRecords.reduce((s: number, r: any) => s + (r.netValuePence ?? r.grossValuePence ?? 0), 0);
  const totalTonnage = filteredRecords.reduce((s: number, r: any) => s + parseFloat(r.tonnage ?? "0"), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Total Revenue</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#16a34a" }}>{pToGBP(totalRevenue)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Total Tonnes</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1d4ed8" }}>{totalTonnage.toFixed(2)} t</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Avg Price</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#92400e" }}>
              {filteredRecords.length > 0 && totalTonnage > 0
                ? `£${((totalRevenue / 100) / totalTonnage).toFixed(2)}/t`
                : "—"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={cropYearFilter}
            onChange={e => setCropYearFilter(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }}
          >
            <option value="__all__">All Crop Years</option>
            {availableCropYears.map((y: string) => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} style={{ background: "#16a34a", color: "#fff" }}>
            <Plus size={16} style={{ marginRight: 6 }} /> Record Grain Sale
          </Button>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
              {["Date","Type","Buyer","Commodity","Variety","Tonnage","Price/t","Net Value","Invoice","Actions"].map(h => (
                <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 && (
              <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>{records.length === 0 ? "No grain sales recorded yet" : `No grain sales for ${cropYearFilter}`}</td></tr>
            )}
            {filteredRecords.map((r: any) => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 12px" }}>{fmtDate(r.saleDate)}</td>
                <td style={{ padding: "8px 12px" }}>
                  <Badge style={{ background: r.saleType === "spot" ? "#dbeafe" : r.saleType === "pool" ? "#dcfce7" : "#fef3c7", color: "#374151", border: "none", fontSize: "0.7rem" }}>
                    {SALE_TYPES.find(t => t.value === r.saleType)?.label ?? r.saleType}
                  </Badge>
                </td>
                <td style={{ padding: "8px 12px", fontWeight: 500 }}>{r.buyer}</td>
                <td style={{ padding: "8px 12px" }}>{r.commodity}</td>
                <td style={{ padding: "8px 12px", color: "#6b7280" }}>{r.variety ?? "—"}</td>
                <td style={{ padding: "8px 12px" }}>{r.tonnage ? `${parseFloat(r.tonnage).toFixed(2)} t` : "—"}</td>
                <td style={{ padding: "8px 12px" }}>{r.pricePerTonnePence ? `£${(r.pricePerTonnePence / 100).toFixed(2)}` : "—"}</td>
                <td style={{ padding: "8px 12px", fontWeight: 600, color: "#16a34a" }}>{pToGBP(r.netValuePence ?? r.grossValuePence)}</td>
                <td style={{ padding: "8px 12px", color: "#6b7280", fontSize: "0.8rem" }}>{r.invoiceNumber ?? "—"}</td>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Button size="sm" variant="ghost" onClick={() => setViewSale(r)}><Eye size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil size={14} /></Button>
                    <Button size="sm" variant="ghost" style={{ color: "#dc2626" }} onClick={() => setDeleteId(r.id)}><Trash2 size={14} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewSale && (
        <Dialog open onOpenChange={() => setViewSale(null)}>
          <DialogContent style={{ maxWidth: 560 }}>
            <DialogHeader><DialogTitle>Grain Sale</DialogTitle></DialogHeader>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.875rem", padding: "4px 0" }}>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Sale Date</p><p>{fmtDate(viewSale.saleDate)}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Type</p><p>{SALE_TYPES.find((t: any) => t.value === viewSale.saleType)?.label ?? viewSale.saleType}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Buyer</p><p style={{ fontWeight: 600 }}>{viewSale.buyer}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Commodity</p><p>{viewSale.commodity}</p></div>
              {viewSale.variety && <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Variety</p><p>{viewSale.variety}</p></div>}
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Tonnage</p><p>{viewSale.tonnage ? `${parseFloat(viewSale.tonnage).toFixed(2)} t` : "—"}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Price/t</p><p>{viewSale.pricePerTonnePence ? `£${(viewSale.pricePerTonnePence / 100).toFixed(2)}` : "—"}</p></div>
              <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Net Value</p><p style={{ fontWeight: 600, color: "#16a34a" }}>{pToGBP(viewSale.netValuePence ?? viewSale.grossValuePence)}</p></div>
              {viewSale.invoiceNumber && <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Invoice</p><p className="font-mono text-xs">{viewSale.invoiceNumber}</p></div>}
              {viewSale.merchantRef && <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Merchant Ref</p><p>{viewSale.merchantRef}</p></div>}
              {viewSale.deliveryDate && <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Delivery Date</p><p>{fmtDate(viewSale.deliveryDate)}</p></div>}
              {viewSale.deliveryLocation && <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Delivery Location</p><p>{viewSale.deliveryLocation}</p></div>}
              {viewSale.gradeAchieved && <div><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Grade</p><p>{viewSale.gradeAchieved}</p></div>}
            </div>
            {viewSale.notes && <div style={{ marginTop: 8 }}><p style={{ fontSize: "0.7rem", color: "#6b7280", textTransform: "uppercase", fontWeight: 600, marginBottom: 2 }}>Notes</p><p style={{ fontSize: "0.875rem", whiteSpace: "pre-line", color: "#374151" }}>{viewSale.notes}</p></div>}
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewSale); setViewSale(null); }}><Pencil size={13} style={{ marginRight: 4 }} />Edit</Button>
              <Button variant="ghost" onClick={() => setViewSale(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm(empty); } }}>
        <DialogContent style={{ maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Grain Sale" : "Record Grain Sale"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <Label>Sale Date *</Label>
                <Input type="date" value={form.saleDate} onChange={e => setForm((f: any) => ({ ...f, saleDate: e.target.value }))} required />
              </div>
              <div>
                <Label>Sale Type *</Label>
                <Select value={form.saleType} onValueChange={v => setForm((f: any) => ({ ...f, saleType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SALE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Buyer / Merchant {form.buyer ? "" : "*"}</Label>
                <BuyerCombobox
                  farmId={farmId}
                  types={["grain_merchant"]}
                  valueId={form.buyerId}
                  valueName={form.buyer}
                  onChange={(id, name) => setForm((f: any) => ({ ...f, buyerId: id, buyer: name }))}
                  required
                  placeholder="Search or add grain merchant..."
                  typeLabel="Grain Merchant"
                  postAddNavigatePath="/suppliers-stock?tab=suppliers"
                />
              </div>
              <div>
                <Label>Merchant Ref</Label>
                <Input value={form.merchantRef} onChange={e => setForm((f: any) => ({ ...f, merchantRef: e.target.value }))} placeholder="Contract / lot reference" />
              </div>
              <div>
                <Label>Commodity *</Label>
                <Select value={form.commodity} onValueChange={v => setForm((f: any) => ({ ...f, commodity: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select commodity" /></SelectTrigger>
                  <SelectContent>{COMMODITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Variety</Label>
                <Input value={form.variety} onChange={e => setForm((f: any) => ({ ...f, variety: e.target.value }))} placeholder="e.g. Skyfall, Extase" />
              </div>
              <div>
                <Label>Tonnage (t) *</Label>
                <Input type="number" step="0.01" value={form.tonnage} onChange={e => setForm((f: any) => ({ ...f, tonnage: e.target.value }))} required placeholder="0.00" />
              </div>
              <div>
                <Label>Price (£/tonne)</Label>
                <Input type="number" step="0.01" value={form.pricePerTonnePence ? (form.pricePerTonnePence / 100).toFixed(2) : ""}
                  onChange={e => setForm((f: any) => ({ ...f, pricePerTonnePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} placeholder="0.00" />
              </div>
              <div>
                <Label>Gross Value (£)</Label>
                <Input type="number" step="0.01" value={form.grossValuePence ? (form.grossValuePence / 100).toFixed(2) : ""}
                  onChange={e => setForm((f: any) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} placeholder="0.00" />
              </div>
              <div>
                <Label>Deductions (£) <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>(levy, drying, samples)</span></Label>
                <Input type="number" step="0.01" value={form.deductionsPence ? (form.deductionsPence / 100).toFixed(2) : ""}
                  onChange={e => setForm((f: any) => ({ ...f, deductionsPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} placeholder="0.00" />
              </div>
              <div>
                <Label>Net Value (£)</Label>
                <Input type="number" step="0.01" value={form.netValuePence ? (form.netValuePence / 100).toFixed(2) : ""}
                  onChange={e => setForm((f: any) => ({ ...f, netValuePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} placeholder="0.00" />
              </div>
              <div>
                <Label>Moisture (%)</Label>
                <Input type="number" step="0.1" value={form.moisture} onChange={e => setForm((f: any) => ({ ...f, moisture: e.target.value }))} placeholder="e.g. 14.5" />
              </div>
              <div>
                <Label>Specific Weight (kg/hl)</Label>
                <Input type="number" step="0.1" value={form.specificWeight} onChange={e => setForm((f: any) => ({ ...f, specificWeight: e.target.value }))} placeholder="e.g. 76.0" />
              </div>
              <div>
                <Label>Protein (%)</Label>
                <Input type="number" step="0.1" value={form.protein} onChange={e => setForm((f: any) => ({ ...f, protein: e.target.value }))} placeholder="e.g. 13.0" />
              </div>
              <div>
                <Label>Grade Achieved</Label>
                <Input value={form.gradeAchieved} onChange={e => setForm((f: any) => ({ ...f, gradeAchieved: e.target.value }))} placeholder="e.g. Group 1 Milling" />
              </div>
              <div>
                <Label>Crop Year</Label>
                <Input value={form.cropYear} onChange={e => setForm((f: any) => ({ ...f, cropYear: e.target.value }))} placeholder="e.g. 2024/25" />
              </div>
              <div>
                <Label>Source Bin / Store</Label>
                <GrainBinSelect
                  farmId={farmId}
                  value={form.storeBinId}
                  onChange={(id, name) => setForm((f: any) => ({ ...f, storeBinId: id, storeBin: name }))}
                />
              </div>
              <div>
                <Label>Delivery Date</Label>
                <Input type="date" value={form.deliveryDate} onChange={e => setForm((f: any) => ({ ...f, deliveryDate: e.target.value }))} />
              </div>
              <div>
                <Label>Payment Date</Label>
                <Input type="date" value={form.paymentDate} onChange={e => setForm((f: any) => ({ ...f, paymentDate: e.target.value }))} />
              </div>
              <div>
                <Label>Delivery Location</Label>
                <Input value={form.deliveryLocation} onChange={e => setForm((f: any) => ({ ...f, deliveryLocation: e.target.value }))} placeholder="e.g. Cambs Grain store" />
              </div>
              <div>
                <Label>Weighbridge Ticket</Label>
                <Input value={form.weighbridgeTicket} onChange={e => setForm((f: any) => ({ ...f, weighbridgeTicket: e.target.value }))} />
              </div>
              <div>
                <Label>Invoice Number</Label>
                <Input value={form.invoiceNumber} onChange={e => setForm((f: any) => ({ ...f, invoiceNumber: e.target.value }))} />
              </div>
              <div>
                <Label>Haulier</Label>
                <Input value={form.haulierName} onChange={e => setForm((f: any) => ({ ...f, haulierName: e.target.value }))} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} />
              </div>

              {/* ─── Organic Certification ─────────────────────────────────── */}
              <div style={{ gridColumn: "1/-1" }}>
                <div style={{ borderRadius: 12, border: form.isOrganicCertified ? "2px solid #4ade80" : "2px dashed #e5e7eb", background: form.isOrganicCertified ? "#f0fdf4" : "transparent", padding: 12, transition: "all 0.15s" }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={form.isOrganicCertified ?? false}
                      onChange={e => setForm((f: any) => ({ ...f, isOrganicCertified: e.target.checked }))}
                      style={{ width: 16, height: 16, marginTop: 2, accentColor: "#16a34a" }}
                    />
                    <div>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#111827", margin: 0 }}>Organic Certified Sale</p>
                      <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "2px 0 0" }}>Mark this grain sale as organic produce — required for Red Tractor organic traceability and certifier reporting.</p>
                    </div>
                  </label>
                  {form.isOrganicCertified && (
                    <div style={{ marginTop: 10 }}>
                      <Label>Organic Certification Reference</Label>
                      <Input
                        placeholder="e.g. SA-CERT-12345 or certifier contract reference"
                        value={form.organicCertRef ?? ""}
                        onChange={e => setForm((f: any) => ({ ...f, organicCertRef: e.target.value }))}
                        style={{ marginTop: 4, borderColor: "#86efac" }}
                      />
                      <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: 4 }}>Your certifier's reference — links this sale to your organic certification record and provides the buyer with an audit trail.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm(empty); }}>Cancel</Button>
              <Button type="submit" style={{ background: "#16a34a", color: "#fff" }} disabled={postMut.isPending}>
                {postMut.isPending ? "Saving…" : editing ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Grain Sale?</DialogTitle></DialogHeader>
          <p style={{ color: "#6b7280" }}>This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => deleteId && delMut.mutate(deleteId)} disabled={delMut.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Livestock Trading Tab ────────────────────────────────────────────────────
const SPECIES = ["Cattle","Sheep","Pigs","Deer","Goats","Other"];
const LIVESTOCK_CATEGORIES = ["Store","Finished","Breeding","Pedigree","Cull"];

function LivestockTradingTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [subTab, setSubTab] = useState<"deadweight" | "mart">("deadweight");
  const [openDW, setOpenDW] = useState(false);
  const [editingDW, setEditingDW] = useState<any | null>(null);
  const [deleteDWId, setDeleteDWId] = useState<number | null>(null);
  const [openMart, setOpenMart] = useState(false);
  const [editingMart, setEditingMart] = useState<any | null>(null);
  const [deleteMartId, setDeleteMartId] = useState<number | null>(null);
  const [lsYearFilter, setLsYearFilter] = useState("__all__");
  const [expandedDWId, setExpandedDWId] = useState<number | null>(null);

  const emptyDW = {
    killDate: "", processorId: null as number | null, processor: "", species: "", breed: "", headCount: "",
    totalDeadweightKg: "", averageDeadweightKg: "", pricePerKgPence: "",
    gradeClassification: "", fatClass: "", conformationClass: "", killSheetRef: "",
    grossValuePence: "", transportDeductionPence: "", levyDeductionPence: "", otherDeductionsPence: "", netPaymentPence: "",
    paymentDate: "", redTractorAssured: false, organicCertified: false,
    premiumSchemeName: "", premiumPence: "", vendorDeclarationRef: "", animalIds: "", notes: "",
  };
  const [formDW, setFormDW] = useState<any>(emptyDW);

  const emptyMart = {
    saleDate: "", martId: null as number | null, martName: "", martLocation: "", species: "", category: "store",
    lotNumber: "", headCount: "", averageLiveweightKg: "", priceType: "per_head",
    pricePerUnitPence: "", grossValuePence: "", commissionPence: "", levyPence: "",
    transportCostPence: "", otherCostsPence: "", netPaymentPence: "",
    buyerName: "", auctioneerRef: "", paymentDate: "", vendorDeclarationRef: "", animalIds: "", notes: "",
  };
  const [formMart, setFormMart] = useState<any>(emptyMart);

  const dwQ = useQuery({ queryKey: ["dw-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-deadweight-sales`).then(r => r.json()), enabled: !!farmId });
  const dwRecords = dwQ.data?.records ?? [];

  const martQ = useQuery({ queryKey: ["mart-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-mart-sales`).then(r => r.json()), enabled: !!farmId });
  const martRecords = martQ.data?.records ?? [];

  const dwMut = useMutation({
    mutationFn: (body: any) => editingDW
      ? fetch(`/api/farms/${farmId}/livestock-deadweight-sales/${editingDW.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json())
      : fetch(`/api/farms/${farmId}/livestock-deadweight-sales`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dw-sales", farmId] }); setOpenDW(false); setEditingDW(null); setFormDW(emptyDW); toast({ title: "Kill sheet saved" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const dwDelMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/livestock-deadweight-sales/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["dw-sales", farmId] }); setDeleteDWId(null); },
  });

  const martMut = useMutation({
    mutationFn: (body: any) => editingMart
      ? fetch(`/api/farms/${farmId}/livestock-mart-sales/${editingMart.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json())
      : fetch(`/api/farms/${farmId}/livestock-mart-sales`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mart-sales", farmId] }); setOpenMart(false); setEditingMart(null); setFormMart(emptyMart); toast({ title: "Mart sale saved" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const martDelMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/livestock-mart-sales/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["mart-sales", farmId] }); setDeleteMartId(null); },
  });

  const submitDW = (e: React.FormEvent) => {
    e.preventDefault();
    dwMut.mutate({
      ...formDW,
      headCount: num(formDW.headCount),
      totalDeadweightKg: num(formDW.totalDeadweightKg),
      averageDeadweightKg: num(formDW.averageDeadweightKg),
      pricePerKgPence: num(formDW.pricePerKgPence),
      grossValuePence: num(formDW.grossValuePence),
      transportDeductionPence: num(formDW.transportDeductionPence),
      levyDeductionPence: num(formDW.levyDeductionPence),
      otherDeductionsPence: num(formDW.otherDeductionsPence),
      netPaymentPence: num(formDW.netPaymentPence),
      premiumPence: num(formDW.premiumPence),
      killDate: formDW.killDate ? new Date(formDW.killDate).toISOString() : undefined,
      paymentDate: formDW.paymentDate ? new Date(formDW.paymentDate).toISOString() : undefined,
    });
  };

  const submitMart = (e: React.FormEvent) => {
    e.preventDefault();
    martMut.mutate({
      ...formMart,
      headCount: num(formMart.headCount),
      averageLiveweightKg: num(formMart.averageLiveweightKg),
      pricePerUnitPence: num(formMart.pricePerUnitPence),
      grossValuePence: num(formMart.grossValuePence),
      commissionPence: num(formMart.commissionPence),
      levyPence: num(formMart.levyPence),
      transportCostPence: num(formMart.transportCostPence),
      otherCostsPence: num(formMart.otherCostsPence),
      netPaymentPence: num(formMart.netPaymentPence),
      saleDate: formMart.saleDate ? new Date(formMart.saleDate).toISOString() : undefined,
      paymentDate: formMart.paymentDate ? new Date(formMart.paymentDate).toISOString() : undefined,
    });
  };

  const lsYears = [...new Set<string>([
    ...dwRecords.map((r: any) => r.killDate ? new Date(r.killDate).getFullYear().toString() : null),
    ...martRecords.map((r: any) => r.saleDate ? new Date(r.saleDate).getFullYear().toString() : null),
  ].filter(Boolean) as string[])].sort().reverse();
  const filteredDW = lsYearFilter === "__all__" ? dwRecords : dwRecords.filter((r: any) => r.killDate && new Date(r.killDate).getFullYear().toString() === lsYearFilter);
  const filteredMart = lsYearFilter === "__all__" ? martRecords : martRecords.filter((r: any) => r.saleDate && new Date(r.saleDate).getFullYear().toString() === lsYearFilter);
  const dwTotal = filteredDW.reduce((s: number, r: any) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0);
  const martTotal = filteredMart.reduce((s: number, r: any) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0);

  return (
    <div>
      {/* Summary KPIs */}
      <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 20px" }}>
          <div style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: 600 }}>Deadweight Revenue</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#15803d" }}>{pToGBP(dwTotal)}</div>
        </div>
        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 20px" }}>
          <div style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 600 }}>Mart Revenue</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#1d4ed8" }}>{pToGBP(martTotal)}</div>
        </div>
        <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "12px 20px" }}>
          <div style={{ fontSize: "0.75rem", color: "#7c3aed", fontWeight: 600 }}>Total Livestock Revenue</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#6d28d9" }}>{pToGBP(dwTotal + martTotal)}</div>
        </div>
      </div>

      {/* Sub-tabs + year filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setSubTab("deadweight")} style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid", borderColor: subTab === "deadweight" ? "#15803d" : "#d1d5db", background: subTab === "deadweight" ? "#15803d" : "#fff", color: subTab === "deadweight" ? "#fff" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
            Deadweight / Kill Sheets
          </button>
          <button onClick={() => setSubTab("mart")} style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid", borderColor: subTab === "mart" ? "#2563eb" : "#d1d5db", background: subTab === "mart" ? "#2563eb" : "#fff", color: subTab === "mart" ? "#fff" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
            Mart / Auction Sales
          </button>
        </div>
        <select value={lsYearFilter} onChange={e => setLsYearFilter(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }}>
          <option value="__all__">All Years</option>
          {lsYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {subTab === "deadweight" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Button onClick={() => { setEditingDW(null); setFormDW(emptyDW); setOpenDW(true); }} style={{ background: "#15803d", color: "#fff" }}>
              <Plus size={16} style={{ marginRight: 6 }} /> Add Kill Sheet
            </Button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
                {["Kill Date","Processor","Species","Head","Total DW (kg)","Avg DW (kg)","Price/kg","Net Payment","Grade","Actions"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDW.length === 0 && <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>{dwRecords.length === 0 ? "No kill sheets yet" : `No kill sheets for ${lsYearFilter}`}</td></tr>}
              {filteredDW.map((r: any) => (
                <React.Fragment key={r.id}>
                  <tr style={{ borderBottom: expandedDWId === r.id ? "none" : "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 12px" }}>{fmtDate(r.killDate)}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 500 }}>{r.processor}</td>
                    <td style={{ padding: "8px 12px" }}>{r.species}</td>
                    <td style={{ padding: "8px 12px" }}>{r.headCount}</td>
                    <td style={{ padding: "8px 12px" }}>{r.totalDeadweightKg ? `${parseFloat(r.totalDeadweightKg).toFixed(1)} kg` : "—"}</td>
                    <td style={{ padding: "8px 12px" }}>{r.averageDeadweightKg ? `${parseFloat(r.averageDeadweightKg).toFixed(1)} kg` : "—"}</td>
                    <td style={{ padding: "8px 12px" }}>{r.pricePerKgPence ? `${r.pricePerKgPence}p/kg` : "—"}</td>
                    <td style={{ padding: "8px 12px", fontWeight: 600, color: "#15803d" }}>{pToGBP(r.netPaymentPence)}</td>
                    <td style={{ padding: "8px 12px" }}>{r.gradeClassification ?? "—"}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {r.animalIds && (
                          <Button size="sm" variant="ghost" title="View ear tags" onClick={() => setExpandedDWId(expandedDWId === r.id ? null : r.id)}>
                            {expandedDWId === r.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => { setEditingDW(r); setFormDW({ ...r, killDate: r.killDate?.slice(0, 10) ?? "", paymentDate: r.paymentDate?.slice(0, 10) ?? "" }); setOpenDW(true); }}><Pencil size={14} /></Button>
                        <Button size="sm" variant="ghost" style={{ color: "#dc2626" }} onClick={() => setDeleteDWId(r.id)}><Trash2 size={14} /></Button>
                      </div>
                    </td>
                  </tr>
                  {expandedDWId === r.id && r.animalIds && (
                    <tr style={{ background: "#f0fdf4", borderBottom: "1px solid #bbf7d0" }}>
                      <td colSpan={10} style={{ padding: "8px 16px 12px" }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#15803d", marginBottom: 6 }}>
                          Animal Ear Tags — {r.animalIds.split(",").length} head
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {r.animalIds.split(",").map((tag: string, i: number) => (
                            <span key={i} style={{ background: "#dcfce7", border: "1px solid #86efac", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontFamily: "monospace", color: "#166534" }}>
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === "mart" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Button onClick={() => { setEditingMart(null); setFormMart(emptyMart); setOpenMart(true); }} style={{ background: "#2563eb", color: "#fff" }}>
              <Plus size={16} style={{ marginRight: 6 }} /> Add Mart Sale
            </Button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
                {["Sale Date","Mart","Species","Category","Lot","Head","Price/Unit","Net Payment","Buyer","Actions"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMart.length === 0 && <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>{martRecords.length === 0 ? "No mart sales yet" : `No mart sales for ${lsYearFilter}`}</td></tr>}
              {filteredMart.map((r: any) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 12px" }}>{fmtDate(r.saleDate)}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 500 }}>{r.martName}</td>
                  <td style={{ padding: "8px 12px" }}>{r.species}</td>
                  <td style={{ padding: "8px 12px" }}><Badge style={{ background: "#f3f4f6", color: "#374151", border: "none", fontSize: "0.7rem" }}>{r.category}</Badge></td>
                  <td style={{ padding: "8px 12px", color: "#6b7280" }}>{r.lotNumber ?? "—"}</td>
                  <td style={{ padding: "8px 12px" }}>{r.headCount}</td>
                  <td style={{ padding: "8px 12px" }}>{r.pricePerUnitPence ? pToGBP(r.pricePerUnitPence) : "—"}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1d4ed8" }}>{pToGBP(r.netPaymentPence)}</td>
                  <td style={{ padding: "8px 12px", color: "#6b7280" }}>{r.buyerName ?? "—"}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingMart(r); setFormMart({ ...r, saleDate: r.saleDate?.slice(0, 10) ?? "", paymentDate: r.paymentDate?.slice(0, 10) ?? "" }); setOpenMart(true); }}><Pencil size={14} /></Button>
                      <Button size="sm" variant="ghost" style={{ color: "#dc2626" }} onClick={() => setDeleteMartId(r.id)}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Deadweight Dialog */}
      <Dialog open={openDW} onOpenChange={v => { setOpenDW(v); if (!v) { setEditingDW(null); setFormDW(emptyDW); } }}>
        <DialogContent style={{ maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editingDW ? "Edit Kill Sheet" : "Add Kill Sheet"}</DialogTitle></DialogHeader>
          <form onSubmit={submitDW}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Kill Date *</Label><Input type="date" value={formDW.killDate} onChange={e => setFormDW((f: any) => ({ ...f, killDate: e.target.value }))} required /></div>
              <div>
                <Label>Processor {formDW.processor ? "" : "*"}</Label>
                <BuyerCombobox
                  farmId={farmId}
                  types={["livestock_processor"]}
                  valueId={formDW.processorId}
                  valueName={formDW.processor}
                  onChange={(id, name) => setFormDW((f: any) => ({ ...f, processorId: id, processor: name }))}
                  required
                  placeholder="Search or add processor..."
                  typeLabel="Processor"
                  postAddNavigatePath="/suppliers-stock?tab=suppliers"
                />
              </div>
              <div>
                <Label>Species *</Label>
                <Select value={formDW.species} onValueChange={v => setFormDW((f: any) => ({ ...f, species: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                  <SelectContent>{SPECIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Breed</Label><Input value={formDW.breed} onChange={e => setFormDW((f: any) => ({ ...f, breed: e.target.value }))} placeholder="e.g. Limousin x" /></div>
              <div><Label>Head Count *</Label><Input type="number" value={formDW.headCount} onChange={e => setFormDW((f: any) => ({ ...f, headCount: e.target.value }))} required /></div>
              <div><Label>Total Deadweight (kg)</Label><Input type="number" step="0.1" value={formDW.totalDeadweightKg} onChange={e => setFormDW((f: any) => ({ ...f, totalDeadweightKg: e.target.value }))} /></div>
              <div><Label>Avg Deadweight (kg)</Label><Input type="number" step="0.1" value={formDW.averageDeadweightKg} onChange={e => setFormDW((f: any) => ({ ...f, averageDeadweightKg: e.target.value }))} /></div>
              <div>
                <Label>Price (pence/kg)</Label>
                <Input type="number" step="1" value={formDW.pricePerKgPence ? String(formDW.pricePerKgPence) : ""}
                  onChange={e => setFormDW((f: any) => ({ ...f, pricePerKgPence: Math.round(parseFloat(e.target.value || "0")) }))} placeholder="e.g. 512" />
              </div>
              <div><Label>Grade / Classification</Label><Input value={formDW.gradeClassification} onChange={e => setFormDW((f: any) => ({ ...f, gradeClassification: e.target.value }))} placeholder="e.g. R4L, U3" /></div>
              <div><Label>Fat Class</Label><Input value={formDW.fatClass} onChange={e => setFormDW((f: any) => ({ ...f, fatClass: e.target.value }))} placeholder="e.g. 3" /></div>
              <div><Label>Kill Sheet Ref</Label><Input value={formDW.killSheetRef} onChange={e => setFormDW((f: any) => ({ ...f, killSheetRef: e.target.value }))} /></div>
              <div><Label>Gross Value (£)</Label><Input type="number" step="0.01" value={formDW.grossValuePence ? (formDW.grossValuePence / 100).toFixed(2) : ""} onChange={e => setFormDW((f: any) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Transport Deduction (£)</Label><Input type="number" step="0.01" value={formDW.transportDeductionPence ? (formDW.transportDeductionPence / 100).toFixed(2) : ""} onChange={e => setFormDW((f: any) => ({ ...f, transportDeductionPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Levy Deduction (£)</Label><Input type="number" step="0.01" value={formDW.levyDeductionPence ? (formDW.levyDeductionPence / 100).toFixed(2) : ""} onChange={e => setFormDW((f: any) => ({ ...f, levyDeductionPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Net Payment (£)</Label><Input type="number" step="0.01" value={formDW.netPaymentPence ? (formDW.netPaymentPence / 100).toFixed(2) : ""} onChange={e => setFormDW((f: any) => ({ ...f, netPaymentPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Payment Date</Label><Input type="date" value={formDW.paymentDate} onChange={e => setFormDW((f: any) => ({ ...f, paymentDate: e.target.value }))} /></div>
              <div><Label>Premium Scheme</Label><Input value={formDW.premiumSchemeName} onChange={e => setFormDW((f: any) => ({ ...f, premiumSchemeName: e.target.value }))} placeholder="e.g. RSPCA Assured, Organic" /></div>
              <div><Label>Premium Value (£)</Label><Input type="number" step="0.01" value={formDW.premiumPence ? (formDW.premiumPence / 100).toFixed(2) : ""} onChange={e => setFormDW((f: any) => ({ ...f, premiumPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Vendor Declaration Ref</Label><Input value={formDW.vendorDeclarationRef} onChange={e => setFormDW((f: any) => ({ ...f, vendorDeclarationRef: e.target.value }))} /></div>
              <div><Label>Animal Ear Tags</Label><Input value={formDW.animalIds} onChange={e => setFormDW((f: any) => ({ ...f, animalIds: e.target.value }))} placeholder="comma-separated" /></div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={formDW.redTractorAssured} onChange={e => setFormDW((f: any) => ({ ...f, redTractorAssured: e.target.checked }))} id="rtAssured" />
                <Label htmlFor="rtAssured">Red Tractor Assured</Label>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={formDW.organicCertified} onChange={e => setFormDW((f: any) => ({ ...f, organicCertified: e.target.checked }))} id="organic" />
                <Label htmlFor="organic">Organic Certified</Label>
              </div>
              <div style={{ gridColumn: "1/-1" }}><Label>Notes</Label><Textarea value={formDW.notes} onChange={e => setFormDW((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={() => { setOpenDW(false); setEditingDW(null); setFormDW(emptyDW); }}>Cancel</Button>
              <Button type="submit" style={{ background: "#15803d", color: "#fff" }} disabled={dwMut.isPending}>{dwMut.isPending ? "Saving…" : editingDW ? "Update" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Mart Dialog */}
      <Dialog open={openMart} onOpenChange={v => { setOpenMart(v); if (!v) { setEditingMart(null); setFormMart(emptyMart); } }}>
        <DialogContent style={{ maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editingMart ? "Edit Mart Sale" : "Add Mart Sale"}</DialogTitle></DialogHeader>
          <form onSubmit={submitMart}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Sale Date *</Label><Input type="date" value={formMart.saleDate} onChange={e => setFormMart((f: any) => ({ ...f, saleDate: e.target.value }))} required /></div>
              <div>
                <Label>Mart Name {formMart.martName ? "" : "*"}</Label>
                <BuyerCombobox
                  farmId={farmId}
                  types={["livestock_mart"]}
                  valueId={formMart.martId}
                  valueName={formMart.martName}
                  onChange={(id, name) => setFormMart((f: any) => ({ ...f, martId: id, martName: name }))}
                  required
                  placeholder="Search or add mart..."
                  typeLabel="Livestock Mart"
                  postAddNavigatePath="/suppliers-stock?tab=suppliers"
                />
              </div>
              <div><Label>Mart Location</Label><Input value={formMart.martLocation} onChange={e => setFormMart((f: any) => ({ ...f, martLocation: e.target.value }))} /></div>
              <div>
                <Label>Species *</Label>
                <Select value={formMart.species} onValueChange={v => setFormMart((f: any) => ({ ...f, species: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                  <SelectContent>{SPECIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={formMart.category} onValueChange={v => setFormMart((f: any) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LIVESTOCK_CATEGORIES.map(c => <SelectItem key={c.toLowerCase()} value={c.toLowerCase()}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Lot Number</Label><Input value={formMart.lotNumber} onChange={e => setFormMart((f: any) => ({ ...f, lotNumber: e.target.value }))} /></div>
              <div><Label>Head Count *</Label><Input type="number" value={formMart.headCount} onChange={e => setFormMart((f: any) => ({ ...f, headCount: e.target.value }))} required /></div>
              <div><Label>Avg Liveweight (kg)</Label><Input type="number" step="0.1" value={formMart.averageLiveweightKg} onChange={e => setFormMart((f: any) => ({ ...f, averageLiveweightKg: e.target.value }))} /></div>
              <div>
                <Label>Price Type</Label>
                <Select value={formMart.priceType} onValueChange={v => setFormMart((f: any) => ({ ...f, priceType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_head">Per Head</SelectItem>
                    <SelectItem value="per_kg_lw">Per kg Liveweight</SelectItem>
                    <SelectItem value="per_kg_dw">Per kg Deadweight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Price per Unit (£)</Label><Input type="number" step="0.01" value={formMart.pricePerUnitPence ? (formMart.pricePerUnitPence / 100).toFixed(2) : ""} onChange={e => setFormMart((f: any) => ({ ...f, pricePerUnitPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Gross Value (£)</Label><Input type="number" step="0.01" value={formMart.grossValuePence ? (formMart.grossValuePence / 100).toFixed(2) : ""} onChange={e => setFormMart((f: any) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Commission (£)</Label><Input type="number" step="0.01" value={formMart.commissionPence ? (formMart.commissionPence / 100).toFixed(2) : ""} onChange={e => setFormMart((f: any) => ({ ...f, commissionPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Levy (£)</Label><Input type="number" step="0.01" value={formMart.levyPence ? (formMart.levyPence / 100).toFixed(2) : ""} onChange={e => setFormMart((f: any) => ({ ...f, levyPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Transport Cost (£)</Label><Input type="number" step="0.01" value={formMart.transportCostPence ? (formMart.transportCostPence / 100).toFixed(2) : ""} onChange={e => setFormMart((f: any) => ({ ...f, transportCostPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Net Payment (£)</Label><Input type="number" step="0.01" value={formMart.netPaymentPence ? (formMart.netPaymentPence / 100).toFixed(2) : ""} onChange={e => setFormMart((f: any) => ({ ...f, netPaymentPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Buyer Name</Label><Input value={formMart.buyerName} onChange={e => setFormMart((f: any) => ({ ...f, buyerName: e.target.value }))} /></div>
              <div><Label>Auctioneer Ref</Label><Input value={formMart.auctioneerRef} onChange={e => setFormMart((f: any) => ({ ...f, auctioneerRef: e.target.value }))} /></div>
              <div><Label>Payment Date</Label><Input type="date" value={formMart.paymentDate} onChange={e => setFormMart((f: any) => ({ ...f, paymentDate: e.target.value }))} /></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Notes</Label><Textarea value={formMart.notes} onChange={e => setFormMart((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={() => { setOpenMart(false); setEditingMart(null); setFormMart(emptyMart); }}>Cancel</Button>
              <Button type="submit" style={{ background: "#2563eb", color: "#fff" }} disabled={martMut.isPending}>{martMut.isPending ? "Saving…" : editingMart ? "Update" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirms */}
      <Dialog open={deleteDWId !== null} onOpenChange={v => !v && setDeleteDWId(null)}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Kill Sheet?</DialogTitle></DialogHeader>
          <p style={{ color: "#6b7280" }}>This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDWId(null)}>Cancel</Button>
            <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => deleteDWId && dwDelMut.mutate(deleteDWId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteMartId !== null} onOpenChange={v => !v && setDeleteMartId(null)}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Mart Sale?</DialogTitle></DialogHeader>
          <p style={{ color: "#6b7280" }}>This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteMartId(null)}>Cancel</Button>
            <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => deleteMartId && martDelMut.mutate(deleteMartId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Milk Sales Tab ────────────────────────────────────────────────────────────
function MilkSalesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [milkYearFilter, setMilkYearFilter] = useState("__all__");

  const empty = {
    statementMonth: "", buyerId: null as number | null, buyer: "", cphNumber: "", litresSupplied: "", pencePerLitre: "",
    grossValuePence: "", butterfatPct: "", proteinPct: "", scc: "", bactoscan: "",
    butterfatBonusPence: "", proteinBonusPence: "", qualityBonusPence: "", qualityPenaltyPence: "",
    sccPenaltyPence: "", bactoscanPenaltyPence: "", transportDeductionPence: "",
    membershipDeductionPence: "", otherDeductionsPence: "", netPaymentPence: "",
    paymentDate: "", organicPremiumPence: "", sustainabilityBonusPence: "", statementRef: "", notes: "",
  };
  const [form, setForm] = useState<any>(empty);

  const q = useQuery({ queryKey: ["milk-statements", farmId], queryFn: () => fetch(`/api/farms/${farmId}/milk-statements`).then(r => r.json()), enabled: !!farmId });
  const records = q.data?.records ?? [];

  const mut = useMutation({
    mutationFn: (body: any) => editing
      ? fetch(`/api/farms/${farmId}/milk-statements/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json())
      : fetch(`/api/farms/${farmId}/milk-statements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["milk-statements", farmId] }); setOpen(false); setEditing(null); setForm(empty); toast({ title: "Milk statement saved" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const delMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/milk-statements/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["milk-statements", farmId] }); setDeleteId(null); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({
      ...form,
      litresSupplied: num(form.litresSupplied),
      pencePerLitre: num(form.pencePerLitre),
      grossValuePence: num(form.grossValuePence),
      butterfatPct: num(form.butterfatPct),
      proteinPct: num(form.proteinPct),
      scc: num(form.scc),
      bactoscan: num(form.bactoscan),
      butterfatBonusPence: num(form.butterfatBonusPence),
      proteinBonusPence: num(form.proteinBonusPence),
      qualityBonusPence: num(form.qualityBonusPence),
      qualityPenaltyPence: num(form.qualityPenaltyPence),
      sccPenaltyPence: num(form.sccPenaltyPence),
      bactoscanPenaltyPence: num(form.bactoscanPenaltyPence),
      transportDeductionPence: num(form.transportDeductionPence),
      membershipDeductionPence: num(form.membershipDeductionPence),
      otherDeductionsPence: num(form.otherDeductionsPence),
      netPaymentPence: num(form.netPaymentPence),
      organicPremiumPence: num(form.organicPremiumPence),
      sustainabilityBonusPence: num(form.sustainabilityBonusPence),
      paymentDate: form.paymentDate ? new Date(form.paymentDate).toISOString() : undefined,
    });
  };

  const milkYears = [...new Set<string>(records.map((r: any) => r.statementMonth ? new Date(r.statementMonth).getFullYear().toString() : null).filter(Boolean) as string[])].sort().reverse();
  const filteredMilk = milkYearFilter === "__all__" ? records : records.filter((r: any) => r.statementMonth && new Date(r.statementMonth).getFullYear().toString() === milkYearFilter);
  const totalLitres = filteredMilk.reduce((s: number, r: any) => s + parseFloat(r.litresSupplied ?? "0"), 0);
  const totalNet = filteredMilk.reduce((s: number, r: any) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0);
  const avgPpl = filteredMilk.length > 0 ? filteredMilk.reduce((s: number, r: any) => s + parseFloat(r.pencePerLitre ?? "0"), 0) / filteredMilk.length : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 18px" }}>
            <div style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 600 }}>Total Litres</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#15803d" }}>{totalLitres.toLocaleString("en-GB", { maximumFractionDigits: 0 })} L</div>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 18px" }}>
            <div style={{ fontSize: "0.72rem", color: "#2563eb", fontWeight: 600 }}>Net Revenue</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1d4ed8" }}>{pToGBP(totalNet)}</div>
          </div>
          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 18px" }}>
            <div style={{ fontSize: "0.72rem", color: "#7c3aed", fontWeight: 600 }}>Avg PPL</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#6d28d9" }}>{avgPpl > 0 ? `${avgPpl.toFixed(2)}p` : "—"}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={milkYearFilter} onChange={e => setMilkYearFilter(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }}>
            <option value="__all__">All Years</option>
            {milkYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} style={{ background: "#1d4ed8", color: "#fff" }}>
            <Plus size={16} style={{ marginRight: 6 }} /> Add Milk Statement
          </Button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
            {["Month","Buyer","Litres","PPL","BF%","Protein%","SCC","Net Payment","Actions"].map(h => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#374151" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredMilk.length === 0 && <tr><td colSpan={9} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>{records.length === 0 ? "No milk statements yet" : `No milk statements for ${milkYearFilter}`}</td></tr>}
          {filteredMilk.map((r: any) => {
            const sccWarning = r.scc && parseInt(r.scc) > 200;
            return (
              <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 12px", fontWeight: 500 }}>{fmtMonth(r.statementMonth)}</td>
                <td style={{ padding: "8px 12px" }}>{r.buyer}</td>
                <td style={{ padding: "8px 12px" }}>{r.litresSupplied ? `${parseFloat(r.litresSupplied).toLocaleString("en-GB")} L` : "—"}</td>
                <td style={{ padding: "8px 12px" }}>{r.pencePerLitre ? `${parseFloat(r.pencePerLitre).toFixed(2)}p` : "—"}</td>
                <td style={{ padding: "8px 12px" }}>{r.butterfatPct ? `${parseFloat(r.butterfatPct).toFixed(2)}%` : "—"}</td>
                <td style={{ padding: "8px 12px" }}>{r.proteinPct ? `${parseFloat(r.proteinPct).toFixed(2)}%` : "—"}</td>
                <td style={{ padding: "8px 12px" }}>
                  <span style={{ color: sccWarning ? "#dc2626" : "#374151", fontWeight: sccWarning ? 600 : 400 }}>
                    {r.scc ?? "—"} {sccWarning && <AlertCircle size={12} style={{ display: "inline" }} />}
                  </span>
                </td>
                <td style={{ padding: "8px 12px", fontWeight: 600, color: "#1d4ed8" }}>{pToGBP(r.netPaymentPence)}</td>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Button size="sm" variant="ghost" onClick={() => setViewRecord(r)}><Eye size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setForm({ ...r, paymentDate: r.paymentDate?.slice(0, 10) ?? "" }); setOpen(true); }}><Pencil size={14} /></Button>
                    <Button size="sm" variant="ghost" style={{ color: "#dc2626" }} onClick={() => setDeleteId(r.id)}><Trash2 size={14} /></Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Milk Sale</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Month</p><p className="font-medium">{fmtMonth(viewRecord.statementMonth)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Buyer</p><p className="font-medium">{String(viewRecord.buyer ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Litres</p><p className="font-medium">{viewRecord.litresSupplied ? `${parseFloat(viewRecord.litresSupplied).toLocaleString("en-GB")} L` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">PPL</p><p className="font-medium">{viewRecord.pencePerLitre ? `${parseFloat(viewRecord.pencePerLitre).toFixed(2)}p` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Butterfat %</p><p className="font-medium">{viewRecord.butterfatPct ? `${parseFloat(viewRecord.butterfatPct).toFixed(2)}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Protein %</p><p className="font-medium">{viewRecord.proteinPct ? `${parseFloat(viewRecord.proteinPct).toFixed(2)}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC</p><p className="font-medium">{String(viewRecord.scc ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Bactoscan</p><p className="font-medium">{String(viewRecord.bactoscan ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Gross Value</p><p className="font-medium">{pToGBP(viewRecord.grossValuePence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quality Bonus</p><p className="font-medium">{pToGBP(viewRecord.qualityBonusPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quality Penalty</p><p className="font-medium">{pToGBP(viewRecord.qualityPenaltyPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SCC Penalty</p><p className="font-medium">{pToGBP(viewRecord.sccPenaltyPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Transport Deduction</p><p className="font-medium">{pToGBP(viewRecord.transportDeductionPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Other Deductions</p><p className="font-medium">{pToGBP(viewRecord.otherDeductionsPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net Payment</p><p className="font-medium font-bold text-blue-600">{pToGBP(viewRecord.netPaymentPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Date</p><p className="font-medium">{fmtDate(viewRecord.paymentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Reference</p><p className="font-medium">{String(viewRecord.statementRef ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">CPH Number</p><p className="font-medium">{String(viewRecord.cphNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Organic Premium</p><p className="font-medium">{pToGBP(viewRecord.organicPremiumPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sustainability Bonus</p><p className="font-medium">{pToGBP(viewRecord.sustainabilityBonusPence)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditing(viewRecord); setForm({ ...viewRecord, paymentDate: viewRecord.paymentDate?.slice(0, 10) ?? "" }); setOpen(true); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm(empty); } }}>
        <DialogContent style={{ maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Milk Statement" : "Add Milk Statement"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Statement Month *</Label><Input type="month" value={form.statementMonth} onChange={e => setForm((f: any) => ({ ...f, statementMonth: e.target.value }))} required /></div>
              <div>
                <Label>Milk Buyer {form.buyer ? "" : "*"}</Label>
                <BuyerCombobox
                  farmId={farmId}
                  types={["milk_buyer"]}
                  valueId={form.buyerId}
                  valueName={form.buyer}
                  onChange={(id, name) => setForm((f: any) => ({ ...f, buyerId: id, buyer: name }))}
                  required
                  placeholder="Search or add milk buyer..."
                  typeLabel="Milk Buyer"
                  postAddNavigatePath="/suppliers-stock?tab=suppliers"
                />
              </div>
              <div><Label>CPH Number</Label><Input value={form.cphNumber} onChange={e => setForm((f: any) => ({ ...f, cphNumber: e.target.value }))} /></div>
              <div><Label>Statement Ref</Label><Input value={form.statementRef} onChange={e => setForm((f: any) => ({ ...f, statementRef: e.target.value }))} /></div>
              <div><Label>Litres Supplied</Label><Input type="number" step="0.01" value={form.litresSupplied} onChange={e => setForm((f: any) => ({ ...f, litresSupplied: e.target.value }))} /></div>
              <div><Label>Pence per Litre</Label><Input type="number" step="0.01" value={form.pencePerLitre} onChange={e => setForm((f: any) => ({ ...f, pencePerLitre: e.target.value }))} /></div>
              <div><Label>Gross Value (£)</Label><Input type="number" step="0.01" value={form.grossValuePence ? (form.grossValuePence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Butterfat %</Label><Input type="number" step="0.001" value={form.butterfatPct} onChange={e => setForm((f: any) => ({ ...f, butterfatPct: e.target.value }))} placeholder="e.g. 4.12" /></div>
              <div><Label>Protein %</Label><Input type="number" step="0.001" value={form.proteinPct} onChange={e => setForm((f: any) => ({ ...f, proteinPct: e.target.value }))} placeholder="e.g. 3.32" /></div>
              <div><Label>SCC (000s/ml)</Label><Input type="number" value={form.scc} onChange={e => setForm((f: any) => ({ ...f, scc: e.target.value }))} placeholder="e.g. 150" /></div>
              <div><Label>Bactoscan (000s/ml)</Label><Input type="number" value={form.bactoscan} onChange={e => setForm((f: any) => ({ ...f, bactoscan: e.target.value }))} /></div>
              <div><Label>Quality Bonus (£)</Label><Input type="number" step="0.01" value={form.qualityBonusPence ? (form.qualityBonusPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, qualityBonusPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Quality Penalty (£)</Label><Input type="number" step="0.01" value={form.qualityPenaltyPence ? (form.qualityPenaltyPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, qualityPenaltyPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>SCC Penalty (£)</Label><Input type="number" step="0.01" value={form.sccPenaltyPence ? (form.sccPenaltyPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, sccPenaltyPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Transport Deduction (£)</Label><Input type="number" step="0.01" value={form.transportDeductionPence ? (form.transportDeductionPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, transportDeductionPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Other Deductions (£)</Label><Input type="number" step="0.01" value={form.otherDeductionsPence ? (form.otherDeductionsPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, otherDeductionsPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Net Payment (£)</Label><Input type="number" step="0.01" value={form.netPaymentPence ? (form.netPaymentPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, netPaymentPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Payment Date</Label><Input type="date" value={form.paymentDate} onChange={e => setForm((f: any) => ({ ...f, paymentDate: e.target.value }))} /></div>
              <div><Label>Organic Premium (£)</Label><Input type="number" step="0.01" value={form.organicPremiumPence ? (form.organicPremiumPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, organicPremiumPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Sustainability Bonus (£)</Label><Input type="number" step="0.01" value={form.sustainabilityBonusPence ? (form.sustainabilityBonusPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, sustainabilityBonusPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm(empty); }}>Cancel</Button>
              <Button type="submit" style={{ background: "#1d4ed8", color: "#fff" }} disabled={mut.isPending}>{mut.isPending ? "Saving…" : editing ? "Update" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Milk Statement?</DialogTitle></DialogHeader>
          <p style={{ color: "#6b7280" }}>This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => deleteId && delMut.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Poultry Settlement Tab ────────────────────────────────────────────────────
function PoultrySettlementTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [subTab, setSubTab] = useState<"batch" | "eggs">("batch");
  const [openBatch, setOpenBatch] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any | null>(null);
  const [viewBatch, setViewBatch] = useState<any | null>(null);
  const [openEgg, setOpenEgg] = useState(false);
  const [editingEgg, setEditingEgg] = useState<any | null>(null);
  const [viewEgg, setViewEgg] = useState<any | null>(null);
  const [deleteBatchId, setDeleteBatchId] = useState<number | null>(null);
  const [deleteEggId, setDeleteEggId] = useState<number | null>(null);
  const [poultryYearFilter, setPoultryYearFilter] = useState("__all__");

  const emptyBatch = {
    flockRef: "", integratorId: null as number | null, integratorName: "", species: "broiler", placementDate: "", catchDate: "",
    birdsPlaced: "", birdsDelivered: "", mortalityPct: "", averageLiveweightKg: "", totalLiveweightKg: "",
    fcr: "", ebi: "", settlementRatePence: "", grossValuePence: "", bonusPence: "", penaltyPence: "",
    catchingCostPence: "", otherDeductionsPence: "", netPaymentPence: "", paymentDate: "",
    slaughterhouseName: "", settlementRef: "", notes: "",
  };
  const [formBatch, setFormBatch] = useState<any>(emptyBatch);

  const emptyEgg = {
    weekEnding: "", packingStationId: null as number | null, packingStation: "", salesChannel: "packing_station", flockRef: "",
    dozensCollected: "", dozensDelivered: "", gradeADozens: "", gradeBDozens: "", crackWasteDozens: "",
    layRatePct: "", pricePerDozenPence: "", grossValuePence: "", deductionsPence: "", netValuePence: "",
    paymentDate: "", eggType: "free_range", packingRef: "", notes: "",
  };
  const [formEgg, setFormEgg] = useState<any>(emptyEgg);

  const batchQ = useQuery({ queryKey: ["poultry-batch-settlements", farmId], queryFn: () => fetch(`/api/farms/${farmId}/poultry-batch-settlements`).then(r => r.json()), enabled: !!farmId });
  const batchRecords = batchQ.data?.records ?? [];
  const eggQ = useQuery({ queryKey: ["egg-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/egg-sales`).then(r => r.json()), enabled: !!farmId });
  const eggRecords = eggQ.data?.records ?? [];

  const batchMut = useMutation({
    mutationFn: (body: any) => editingBatch
      ? fetch(`/api/farms/${farmId}/poultry-batch-settlements/${editingBatch.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json())
      : fetch(`/api/farms/${farmId}/poultry-batch-settlements`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-batch-settlements", farmId] }); setOpenBatch(false); setEditingBatch(null); setFormBatch(emptyBatch); toast({ title: "Batch settlement saved" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const batchDelMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/poultry-batch-settlements/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-batch-settlements", farmId] }); setDeleteBatchId(null); },
  });
  const eggMut = useMutation({
    mutationFn: (body: any) => editingEgg
      ? fetch(`/api/farms/${farmId}/egg-sales/${editingEgg.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json())
      : fetch(`/api/farms/${farmId}/egg-sales`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["egg-sales", farmId] }); setOpenEgg(false); setEditingEgg(null); setFormEgg(emptyEgg); toast({ title: "Egg sale saved" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const eggDelMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/egg-sales/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["egg-sales", farmId] }); setDeleteEggId(null); },
  });

  const submitBatch = (e: React.FormEvent) => {
    e.preventDefault();
    batchMut.mutate({
      ...formBatch,
      birdsPlaced: num(formBatch.birdsPlaced), birdsDelivered: num(formBatch.birdsDelivered),
      mortalityPct: num(formBatch.mortalityPct), averageLiveweightKg: num(formBatch.averageLiveweightKg),
      totalLiveweightKg: num(formBatch.totalLiveweightKg), fcr: num(formBatch.fcr), ebi: num(formBatch.ebi),
      settlementRatePence: num(formBatch.settlementRatePence), grossValuePence: num(formBatch.grossValuePence),
      bonusPence: num(formBatch.bonusPence), penaltyPence: num(formBatch.penaltyPence),
      catchingCostPence: num(formBatch.catchingCostPence), otherDeductionsPence: num(formBatch.otherDeductionsPence),
      netPaymentPence: num(formBatch.netPaymentPence),
      placementDate: formBatch.placementDate ? new Date(formBatch.placementDate).toISOString() : undefined,
      catchDate: formBatch.catchDate ? new Date(formBatch.catchDate).toISOString() : undefined,
      paymentDate: formBatch.paymentDate ? new Date(formBatch.paymentDate).toISOString() : undefined,
    });
  };

  const submitEgg = (e: React.FormEvent) => {
    e.preventDefault();
    eggMut.mutate({
      ...formEgg,
      dozensCollected: num(formEgg.dozensCollected), dozensDelivered: num(formEgg.dozensDelivered),
      gradeADozens: num(formEgg.gradeADozens), gradeBDozens: num(formEgg.gradeBDozens),
      crackWasteDozens: num(formEgg.crackWasteDozens), layRatePct: num(formEgg.layRatePct),
      pricePerDozenPence: num(formEgg.pricePerDozenPence), grossValuePence: num(formEgg.grossValuePence),
      deductionsPence: num(formEgg.deductionsPence), netValuePence: num(formEgg.netValuePence),
      weekEnding: formEgg.weekEnding ? new Date(formEgg.weekEnding).toISOString() : undefined,
      paymentDate: formEgg.paymentDate ? new Date(formEgg.paymentDate).toISOString() : undefined,
    });
  };

  const poultryYears = [...new Set<string>([
    ...batchRecords.map((r: any) => r.catchDate ? new Date(r.catchDate).getFullYear().toString() : null),
    ...eggRecords.map((r: any) => r.weekEnding ? new Date(r.weekEnding).getFullYear().toString() : null),
  ].filter(Boolean) as string[])].sort().reverse();
  const filteredBatch = poultryYearFilter === "__all__" ? batchRecords : batchRecords.filter((r: any) => r.catchDate && new Date(r.catchDate).getFullYear().toString() === poultryYearFilter);
  const filteredEgg = poultryYearFilter === "__all__" ? eggRecords : eggRecords.filter((r: any) => r.weekEnding && new Date(r.weekEnding).getFullYear().toString() === poultryYearFilter);
  const batchTotal = filteredBatch.reduce((s: number, r: any) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0);
  const eggTotal = filteredEgg.reduce((s: number, r: any) => s + (r.netValuePence ?? r.grossValuePence ?? 0), 0);

  return (
    <div>
      <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
        <div style={{ background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 8, padding: "10px 18px" }}>
          <div style={{ fontSize: "0.72rem", color: "#d97706", fontWeight: 600 }}>Batch Settlement Revenue</div>
          <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#b45309" }}>{pToGBP(batchTotal)}</div>
        </div>
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "10px 18px" }}>
          <div style={{ fontSize: "0.72rem", color: "#ea580c", fontWeight: 600 }}>Egg Sales Revenue</div>
          <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#c2410c" }}>{pToGBP(eggTotal)}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setSubTab("batch")} style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid", borderColor: subTab === "batch" ? "#b45309" : "#d1d5db", background: subTab === "batch" ? "#b45309" : "#fff", color: subTab === "batch" ? "#fff" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>Broiler / Turkey Batches</button>
          <button onClick={() => setSubTab("eggs")} style={{ padding: "6px 16px", borderRadius: 6, border: "1px solid", borderColor: subTab === "eggs" ? "#ea580c" : "#d1d5db", background: subTab === "eggs" ? "#ea580c" : "#fff", color: subTab === "eggs" ? "#fff" : "#374151", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>Egg Sales</button>
        </div>
        <select value={poultryYearFilter} onChange={e => setPoultryYearFilter(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }}>
          <option value="__all__">All Years</option>
          {poultryYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {subTab === "batch" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Button onClick={() => { setEditingBatch(null); setFormBatch(emptyBatch); setOpenBatch(true); }} style={{ background: "#b45309", color: "#fff" }}><Plus size={16} style={{ marginRight: 6 }} /> Add Batch Settlement</Button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
                {["Flock Ref","Integrator","Species","Catch Date","Birds In","Birds Out","Mortality","Avg LW (kg)","FCR","Net Payment","Actions"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredBatch.length === 0 && <tr><td colSpan={11} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>{batchRecords.length === 0 ? "No batch settlements yet" : `No batch settlements for ${poultryYearFilter}`}</td></tr>}
              {filteredBatch.map((r: any) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 10px", fontWeight: 500 }}>{r.flockRef}</td>
                  <td style={{ padding: "8px 10px" }}>{r.integratorName}</td>
                  <td style={{ padding: "8px 10px" }}>{r.species}</td>
                  <td style={{ padding: "8px 10px" }}>{fmtDate(r.catchDate)}</td>
                  <td style={{ padding: "8px 10px" }}>{r.birdsPlaced?.toLocaleString()}</td>
                  <td style={{ padding: "8px 10px" }}>{r.birdsDelivered?.toLocaleString()}</td>
                  <td style={{ padding: "8px 10px" }}>{r.mortalityPct ? `${parseFloat(r.mortalityPct).toFixed(2)}%` : "—"}</td>
                  <td style={{ padding: "8px 10px" }}>{r.averageLiveweightKg ? `${parseFloat(r.averageLiveweightKg).toFixed(3)} kg` : "—"}</td>
                  <td style={{ padding: "8px 10px" }}>{r.fcr ? parseFloat(r.fcr).toFixed(3) : "—"}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 600, color: "#b45309" }}>{pToGBP(r.netPaymentPence)}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Button size="sm" variant="ghost" onClick={() => setViewBatch(r)}><Eye size={14} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingBatch(r); setFormBatch({ ...r, placementDate: r.placementDate?.slice(0, 10) ?? "", catchDate: r.catchDate?.slice(0, 10) ?? "", paymentDate: r.paymentDate?.slice(0, 10) ?? "" }); setOpenBatch(true); }}><Pencil size={14} /></Button>
                      <Button size="sm" variant="ghost" style={{ color: "#dc2626" }} onClick={() => setDeleteBatchId(r.id)}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === "eggs" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <Button onClick={() => { setEditingEgg(null); setFormEgg(emptyEgg); setOpenEgg(true); }} style={{ background: "#ea580c", color: "#fff" }}><Plus size={16} style={{ marginRight: 6 }} /> Add Egg Sale</Button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
                {["Week Ending","Channel","Flock","Type","Dozens Delivered","Grade A","Lay Rate","Price/Dozen","Net Value","Actions"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEgg.length === 0 && <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>{eggRecords.length === 0 ? "No egg sales yet" : `No egg sales for ${poultryYearFilter}`}</td></tr>}
              {filteredEgg.map((r: any) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 10px" }}>{fmtDate(r.weekEnding)}</td>
                  <td style={{ padding: "8px 10px" }}>{r.salesChannel}</td>
                  <td style={{ padding: "8px 10px", color: "#6b7280" }}>{r.flockRef ?? "—"}</td>
                  <td style={{ padding: "8px 10px" }}><Badge style={{ background: "#fff7ed", color: "#c2410c", border: "none", fontSize: "0.7rem" }}>{r.eggType?.replace("_", " ")}</Badge></td>
                  <td style={{ padding: "8px 10px" }}>{r.dozensDelivered ? `${parseFloat(r.dozensDelivered).toFixed(0)} doz` : "—"}</td>
                  <td style={{ padding: "8px 10px" }}>{r.gradeADozens ? `${parseFloat(r.gradeADozens).toFixed(0)} doz` : "—"}</td>
                  <td style={{ padding: "8px 10px" }}>{r.layRatePct ? `${parseFloat(r.layRatePct).toFixed(1)}%` : "—"}</td>
                  <td style={{ padding: "8px 10px" }}>{r.pricePerDozenPence ? pToGBP(r.pricePerDozenPence) : "—"}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 600, color: "#c2410c" }}>{pToGBP(r.netValuePence)}</td>
                  <td style={{ padding: "8px 10px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <Button size="sm" variant="ghost" onClick={() => setViewEgg(r)}><Eye size={14} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingEgg(r); setFormEgg({ ...r, weekEnding: r.weekEnding?.slice(0, 10) ?? "", paymentDate: r.paymentDate?.slice(0, 10) ?? "" }); setOpenEgg(true); }}><Pencil size={14} /></Button>
                      <Button size="sm" variant="ghost" style={{ color: "#dc2626" }} onClick={() => setDeleteEggId(r.id)}><Trash2 size={14} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewBatch && (
        <Dialog open onOpenChange={() => setViewBatch(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Batch Settlement</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock Ref</p><p className="font-medium">{String(viewBatch.flockRef ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Integrator</p><p className="font-medium">{String(viewBatch.integratorName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Species</p><p className="font-medium">{String(viewBatch.species ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Placement Date</p><p className="font-medium">{fmtDate(viewBatch.placementDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Catch Date</p><p className="font-medium">{fmtDate(viewBatch.catchDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birds Placed</p><p className="font-medium">{viewBatch.birdsPlaced?.toLocaleString() ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birds Delivered</p><p className="font-medium">{viewBatch.birdsDelivered?.toLocaleString() ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mortality %</p><p className="font-medium">{viewBatch.mortalityPct ? `${parseFloat(viewBatch.mortalityPct).toFixed(2)}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Liveweight</p><p className="font-medium">{viewBatch.averageLiveweightKg ? `${parseFloat(viewBatch.averageLiveweightKg).toFixed(3)} kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Liveweight</p><p className="font-medium">{viewBatch.totalLiveweightKg ? `${parseFloat(viewBatch.totalLiveweightKg).toFixed(2)} kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">FCR</p><p className="font-medium">{viewBatch.fcr ? parseFloat(viewBatch.fcr).toFixed(3) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">EBI</p><p className="font-medium">{viewBatch.ebi ? parseFloat(viewBatch.ebi).toFixed(2) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Settlement Rate</p><p className="font-medium">{viewBatch.settlementRatePence ? `${(viewBatch.settlementRatePence / 100).toFixed(2)}p/kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Gross Value</p><p className="font-medium">{pToGBP(viewBatch.grossValuePence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Performance Bonus</p><p className="font-medium">{pToGBP(viewBatch.bonusPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Penalty</p><p className="font-medium">{pToGBP(viewBatch.penaltyPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Catching Cost</p><p className="font-medium">{pToGBP(viewBatch.catchingCostPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net Payment</p><p className="font-medium font-bold text-blue-600">{pToGBP(viewBatch.netPaymentPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Date</p><p className="font-medium">{fmtDate(viewBatch.paymentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Settlement Ref</p><p className="font-medium">{String(viewBatch.settlementRef ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewBatch.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditingBatch(viewBatch); setFormBatch({ ...viewBatch, placementDate: viewBatch.placementDate?.slice(0, 10) ?? "", catchDate: viewBatch.catchDate?.slice(0, 10) ?? "", paymentDate: viewBatch.paymentDate?.slice(0, 10) ?? "" }); setOpenBatch(true); setViewBatch(null); }}>Edit</Button>
              <Button onClick={() => setViewBatch(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {viewEgg && (
        <Dialog open onOpenChange={() => setViewEgg(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Egg Sale</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Week Ending</p><p className="font-medium">{fmtDate(viewEgg.weekEnding)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sales Channel</p><p className="font-medium text-capitalize">{viewEgg.salesChannel?.replace("_", " ") ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Packing Station</p><p className="font-medium">{String(viewEgg.packingStation ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock Ref</p><p className="font-medium">{String(viewEgg.flockRef ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Egg Type</p><p className="font-medium text-capitalize">{viewEgg.eggType?.replace("_", " ") ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dozens Collected</p><p className="font-medium">{viewEgg.dozensCollected ? `${parseFloat(viewEgg.dozensCollected).toLocaleString()} doz` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dozens Delivered</p><p className="font-medium">{viewEgg.dozensDelivered ? `${parseFloat(viewEgg.dozensDelivered).toLocaleString()} doz` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Grade A Dozens</p><p className="font-medium">{viewEgg.gradeADozens ? `${parseFloat(viewEgg.gradeADozens).toLocaleString()} doz` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Grade B Dozens</p><p className="font-medium">{viewEgg.gradeBDozens ? `${parseFloat(viewEgg.gradeBDozens).toLocaleString()} doz` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Crack / Waste Dozens</p><p className="font-medium">{viewEgg.crackWasteDozens ? `${parseFloat(viewEgg.crackWasteDozens).toLocaleString()} doz` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lay Rate %</p><p className="font-medium">{viewEgg.layRatePct ? `${parseFloat(viewEgg.layRatePct).toFixed(1)}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Price per Dozen</p><p className="font-medium">{viewEgg.pricePerDozenPence ? pToGBP(viewEgg.pricePerDozenPence) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Gross Value</p><p className="font-medium">{pToGBP(viewEgg.grossValuePence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Deductions</p><p className="font-medium">{pToGBP(viewEgg.deductionsPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net Value</p><p className="font-medium font-bold text-orange-600">{pToGBP(viewEgg.netValuePence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Date</p><p className="font-medium">{fmtDate(viewEgg.paymentDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewEgg.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditingEgg(viewEgg); setFormEgg({ ...viewEgg, weekEnding: viewEgg.weekEnding?.slice(0, 10) ?? "", paymentDate: viewEgg.paymentDate?.slice(0, 10) ?? "" }); setOpenEgg(true); setViewEgg(null); }}>Edit</Button>
              <Button onClick={() => setViewEgg(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Batch Dialog */}
      <Dialog open={openBatch} onOpenChange={v => { setOpenBatch(v); if (!v) { setEditingBatch(null); setFormBatch(emptyBatch); } }}>
        <DialogContent style={{ maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editingBatch ? "Edit Batch Settlement" : "Add Batch Settlement"}</DialogTitle></DialogHeader>
          <form onSubmit={submitBatch}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Flock Ref *</Label><Input value={formBatch.flockRef} onChange={e => setFormBatch((f: any) => ({ ...f, flockRef: e.target.value }))} required /></div>
              <div>
                <Label>Integrator {formBatch.integratorName ? "" : "*"}</Label>
                <BuyerCombobox
                  farmId={farmId}
                  types={["poultry_integrator"]}
                  valueId={formBatch.integratorId}
                  valueName={formBatch.integratorName}
                  onChange={(id, name) => setFormBatch((f: any) => ({ ...f, integratorId: id, integratorName: name }))}
                  required
                  placeholder="Search or add integrator..."
                  typeLabel="Integrator"
                  postAddNavigatePath="/suppliers-stock?tab=suppliers"
                />
              </div>
              <div>
                <Label>Species</Label>
                <Select value={formBatch.species} onValueChange={v => setFormBatch((f: any) => ({ ...f, species: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="broiler">Broiler</SelectItem>
                    <SelectItem value="turkey">Turkey</SelectItem>
                    <SelectItem value="duck">Duck</SelectItem>
                    <SelectItem value="layers">Layers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Settlement Ref</Label><Input value={formBatch.settlementRef} onChange={e => setFormBatch((f: any) => ({ ...f, settlementRef: e.target.value }))} /></div>
              <div><Label>Placement Date</Label><Input type="date" value={formBatch.placementDate} onChange={e => setFormBatch((f: any) => ({ ...f, placementDate: e.target.value }))} /></div>
              <div><Label>Catch Date</Label><Input type="date" value={formBatch.catchDate} onChange={e => setFormBatch((f: any) => ({ ...f, catchDate: e.target.value }))} /></div>
              <div><Label>Birds Placed</Label><Input type="number" value={formBatch.birdsPlaced} onChange={e => setFormBatch((f: any) => ({ ...f, birdsPlaced: e.target.value }))} /></div>
              <div><Label>Birds Delivered</Label><Input type="number" value={formBatch.birdsDelivered} onChange={e => setFormBatch((f: any) => ({ ...f, birdsDelivered: e.target.value }))} /></div>
              <div><Label>Mortality %</Label><Input type="number" step="0.01" value={formBatch.mortalityPct} onChange={e => setFormBatch((f: any) => ({ ...f, mortalityPct: e.target.value }))} /></div>
              <div><Label>Avg Liveweight (kg)</Label><Input type="number" step="0.001" value={formBatch.averageLiveweightKg} onChange={e => setFormBatch((f: any) => ({ ...f, averageLiveweightKg: e.target.value }))} /></div>
              <div><Label>Total Liveweight (kg)</Label><Input type="number" step="0.01" value={formBatch.totalLiveweightKg} onChange={e => setFormBatch((f: any) => ({ ...f, totalLiveweightKg: e.target.value }))} /></div>
              <div><Label>FCR</Label><Input type="number" step="0.001" value={formBatch.fcr} onChange={e => setFormBatch((f: any) => ({ ...f, fcr: e.target.value }))} placeholder="Feed Conversion Ratio" /></div>
              <div><Label>EBI</Label><Input type="number" step="0.01" value={formBatch.ebi} onChange={e => setFormBatch((f: any) => ({ ...f, ebi: e.target.value }))} placeholder="European Broiler Index" /></div>
              <div><Label>Settlement Rate (pence/kg LW)</Label><Input type="number" step="0.01" value={formBatch.settlementRatePence ? (formBatch.settlementRatePence / 100).toFixed(2) : ""} onChange={e => setFormBatch((f: any) => ({ ...f, settlementRatePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Gross Value (£)</Label><Input type="number" step="0.01" value={formBatch.grossValuePence ? (formBatch.grossValuePence / 100).toFixed(2) : ""} onChange={e => setFormBatch((f: any) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Performance Bonus (£)</Label><Input type="number" step="0.01" value={formBatch.bonusPence ? (formBatch.bonusPence / 100).toFixed(2) : ""} onChange={e => setFormBatch((f: any) => ({ ...f, bonusPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Penalty (£)</Label><Input type="number" step="0.01" value={formBatch.penaltyPence ? (formBatch.penaltyPence / 100).toFixed(2) : ""} onChange={e => setFormBatch((f: any) => ({ ...f, penaltyPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Catching Cost (£)</Label><Input type="number" step="0.01" value={formBatch.catchingCostPence ? (formBatch.catchingCostPence / 100).toFixed(2) : ""} onChange={e => setFormBatch((f: any) => ({ ...f, catchingCostPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Net Payment (£)</Label><Input type="number" step="0.01" value={formBatch.netPaymentPence ? (formBatch.netPaymentPence / 100).toFixed(2) : ""} onChange={e => setFormBatch((f: any) => ({ ...f, netPaymentPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Payment Date</Label><Input type="date" value={formBatch.paymentDate} onChange={e => setFormBatch((f: any) => ({ ...f, paymentDate: e.target.value }))} /></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Notes</Label><Textarea value={formBatch.notes} onChange={e => setFormBatch((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={() => { setOpenBatch(false); setEditingBatch(null); setFormBatch(emptyBatch); }}>Cancel</Button>
              <Button type="submit" style={{ background: "#b45309", color: "#fff" }} disabled={batchMut.isPending}>{batchMut.isPending ? "Saving…" : editingBatch ? "Update" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Egg Dialog */}
      <Dialog open={openEgg} onOpenChange={v => { setOpenEgg(v); if (!v) { setEditingEgg(null); setFormEgg(emptyEgg); } }}>
        <DialogContent style={{ maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editingEgg ? "Edit Egg Sale" : "Add Egg Sale"}</DialogTitle></DialogHeader>
          <form onSubmit={submitEgg}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Week Ending *</Label><Input type="date" value={formEgg.weekEnding} onChange={e => setFormEgg((f: any) => ({ ...f, weekEnding: e.target.value }))} required /></div>
              <div>
                <Label>Sales Channel</Label>
                <Select value={formEgg.salesChannel} onValueChange={v => setFormEgg((f: any) => ({ ...f, salesChannel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="packing_station">Packing Station</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="farm_gate">Farm Gate</SelectItem>
                    <SelectItem value="processor">Processor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Packing Station</Label>
                <BuyerCombobox
                  farmId={farmId}
                  types={["egg_packer"]}
                  valueId={formEgg.packingStationId}
                  valueName={formEgg.packingStation ?? ""}
                  onChange={(id, name) => setFormEgg((f: any) => ({ ...f, packingStationId: id, packingStation: name }))}
                  placeholder="Search or add packing station..."
                  typeLabel="Packing Station"
                  postAddNavigatePath="/suppliers-stock?tab=suppliers"
                />
              </div>
              <div><Label>Flock Ref</Label><Input value={formEgg.flockRef} onChange={e => setFormEgg((f: any) => ({ ...f, flockRef: e.target.value }))} /></div>
              <div>
                <Label>Egg Type</Label>
                <Select value={formEgg.eggType} onValueChange={v => setFormEgg((f: any) => ({ ...f, eggType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free_range">Free Range</SelectItem>
                    <SelectItem value="barn">Barn</SelectItem>
                    <SelectItem value="organic">Organic</SelectItem>
                    <SelectItem value="colony">Colony</SelectItem>
                    <SelectItem value="enriched">Enriched Cage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Dozens Collected</Label><Input type="number" step="0.01" value={formEgg.dozensCollected} onChange={e => setFormEgg((f: any) => ({ ...f, dozensCollected: e.target.value }))} /></div>
              <div><Label>Dozens Delivered</Label><Input type="number" step="0.01" value={formEgg.dozensDelivered} onChange={e => setFormEgg((f: any) => ({ ...f, dozensDelivered: e.target.value }))} /></div>
              <div><Label>Grade A Dozens</Label><Input type="number" step="0.01" value={formEgg.gradeADozens} onChange={e => setFormEgg((f: any) => ({ ...f, gradeADozens: e.target.value }))} /></div>
              <div><Label>Grade B Dozens</Label><Input type="number" step="0.01" value={formEgg.gradeBDozens} onChange={e => setFormEgg((f: any) => ({ ...f, gradeBDozens: e.target.value }))} /></div>
              <div><Label>Crack / Waste Dozens</Label><Input type="number" step="0.01" value={formEgg.crackWasteDozens} onChange={e => setFormEgg((f: any) => ({ ...f, crackWasteDozens: e.target.value }))} /></div>
              <div><Label>Lay Rate %</Label><Input type="number" step="0.01" value={formEgg.layRatePct} onChange={e => setFormEgg((f: any) => ({ ...f, layRatePct: e.target.value }))} /></div>
              <div><Label>Price per Dozen (£)</Label><Input type="number" step="0.01" value={formEgg.pricePerDozenPence ? (formEgg.pricePerDozenPence / 100).toFixed(2) : ""} onChange={e => setFormEgg((f: any) => ({ ...f, pricePerDozenPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Gross Value (£)</Label><Input type="number" step="0.01" value={formEgg.grossValuePence ? (formEgg.grossValuePence / 100).toFixed(2) : ""} onChange={e => setFormEgg((f: any) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Deductions (£)</Label><Input type="number" step="0.01" value={formEgg.deductionsPence ? (formEgg.deductionsPence / 100).toFixed(2) : ""} onChange={e => setFormEgg((f: any) => ({ ...f, deductionsPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Net Value (£)</Label><Input type="number" step="0.01" value={formEgg.netValuePence ? (formEgg.netValuePence / 100).toFixed(2) : ""} onChange={e => setFormEgg((f: any) => ({ ...f, netValuePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Payment Date</Label><Input type="date" value={formEgg.paymentDate} onChange={e => setFormEgg((f: any) => ({ ...f, paymentDate: e.target.value }))} /></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Notes</Label><Textarea value={formEgg.notes} onChange={e => setFormEgg((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={() => { setOpenEgg(false); setEditingEgg(null); setFormEgg(emptyEgg); }}>Cancel</Button>
              <Button type="submit" style={{ background: "#ea580c", color: "#fff" }} disabled={eggMut.isPending}>{eggMut.isPending ? "Saving…" : editingEgg ? "Update" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteBatchId !== null} onOpenChange={v => !v && setDeleteBatchId(null)}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Batch Settlement?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteBatchId(null)}>Cancel</Button>
            <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => deleteBatchId && batchDelMut.mutate(deleteBatchId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteEggId !== null} onOpenChange={v => !v && setDeleteEggId(null)}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Egg Sale?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteEggId(null)}>Cancel</Button>
            <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => deleteEggId && eggDelMut.mutate(deleteEggId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Pig Sales Tab ─────────────────────────────────────────────────────────────
function PigSalesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [pigYearFilter, setPigYearFilter] = useState("__all__");

  const empty = {
    killDate: "", processorId: null as number | null, processor: "", headCount: "", totalDeadweightKg: "", averageDeadweightKg: "",
    pricePerKgPence: "", grossValuePence: "", levyDeductionPence: "", transportDeductionPence: "",
    otherDeductionsPence: "", netPaymentPence: "", paymentDate: "",
    averageP2BackfatMm: "", averageMuscleDepthMm: "", leanMeatPct: "", gradeOut: "",
    sppPriceKgPence: "", sppVariancePence: "", killSheetRef: "", herdMark: "",
    premiumScheme: "", premiumPence: "", notes: "",
  };
  const [form, setForm] = useState<any>(empty);

  const q = useQuery({ queryKey: ["pig-kill-records", farmId], queryFn: () => fetch(`/api/farms/${farmId}/pig-kill-records`).then(r => r.json()), enabled: !!farmId });
  const records = q.data?.records ?? [];

  const mut = useMutation({
    mutationFn: (body: any) => editing
      ? fetch(`/api/farms/${farmId}/pig-kill-records/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json())
      : fetch(`/api/farms/${farmId}/pig-kill-records`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-kill-records", farmId] }); setOpen(false); setEditing(null); setForm(empty); toast({ title: "Kill record saved" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const delMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/pig-kill-records/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["pig-kill-records", farmId] }); setDeleteId(null); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({
      ...form,
      headCount: num(form.headCount),
      totalDeadweightKg: num(form.totalDeadweightKg),
      averageDeadweightKg: num(form.averageDeadweightKg),
      pricePerKgPence: num(form.pricePerKgPence),
      grossValuePence: num(form.grossValuePence),
      levyDeductionPence: num(form.levyDeductionPence),
      levelDeductionPence: num(form.levyDeductionPence),
      transportDeductionPence: num(form.transportDeductionPence),
      otherDeductionsPence: num(form.otherDeductionsPence),
      netPaymentPence: num(form.netPaymentPence),
      averageP2BackfatMm: num(form.averageP2BackfatMm),
      averageMuscleDepthMm: num(form.averageMuscleDepthMm),
      leanMeatPct: num(form.leanMeatPct),
      sppPriceKgPence: num(form.sppPriceKgPence),
      sppVariancePence: num(form.sppVariancePence),
      premiumPence: num(form.premiumPence),
      killDate: form.killDate ? new Date(form.killDate).toISOString() : undefined,
      paymentDate: form.paymentDate ? new Date(form.paymentDate).toISOString() : undefined,
    });
  };

  const pigYears = [...new Set<string>(records.map((r: any) => r.killDate ? new Date(r.killDate).getFullYear().toString() : null).filter(Boolean) as string[])].sort().reverse();
  const filteredPig = pigYearFilter === "__all__" ? records : records.filter((r: any) => r.killDate && new Date(r.killDate).getFullYear().toString() === pigYearFilter);
  const totalNet = filteredPig.reduce((s: number, r: any) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0);
  const totalHead = filteredPig.reduce((s: number, r: any) => s + (r.headCount ?? 0), 0);
  const avgP2 = filteredPig.filter((r: any) => r.averageP2BackfatMm).length > 0 ? filteredPig.reduce((s: number, r: any) => s + parseFloat(r.averageP2BackfatMm ?? "0"), 0) / filteredPig.filter((r: any) => r.averageP2BackfatMm).length : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ background: "#fdf2f8", border: "1px solid #f0abfc", borderRadius: 8, padding: "10px 18px" }}>
            <div style={{ fontSize: "0.72rem", color: "#a21caf", fontWeight: 600 }}>Net Revenue</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#86198f" }}>{pToGBP(totalNet)}</div>
          </div>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 18px" }}>
            <div style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 600 }}>Total Head</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#15803d" }}>{totalHead.toLocaleString()}</div>
          </div>
          {avgP2 > 0 && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 18px" }}>
              <div style={{ fontSize: "0.72rem", color: "#2563eb", fontWeight: 600 }}>Avg P2 Backfat</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1d4ed8" }}>{avgP2.toFixed(1)} mm</div>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={pigYearFilter} onChange={e => setPigYearFilter(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }}>
            <option value="__all__">All Years</option>
            {pigYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} style={{ background: "#86198f", color: "#fff" }}>
            <Plus size={16} style={{ marginRight: 6 }} /> Add Kill Record
          </Button>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
            {["Kill Date","Processor","Head","Total DW (kg)","Avg DW (kg)","Price/kg","P2 (mm)","Lean%","Grade","Net Payment","vs SPP","Actions"].map(h => (
              <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredPig.length === 0 && <tr><td colSpan={12} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>{records.length === 0 ? "No kill records yet" : `No kill records for ${pigYearFilter}`}</td></tr>}
          {filteredPig.map((r: any) => {
            const sppVar = r.sppVariancePence;
            return (
              <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 10px" }}>{fmtDate(r.killDate)}</td>
                <td style={{ padding: "8px 10px", fontWeight: 500 }}>{r.processor}</td>
                <td style={{ padding: "8px 10px" }}>{r.headCount}</td>
                <td style={{ padding: "8px 10px" }}>{r.totalDeadweightKg ? `${parseFloat(r.totalDeadweightKg).toFixed(1)} kg` : "—"}</td>
                <td style={{ padding: "8px 10px" }}>{r.averageDeadweightKg ? `${parseFloat(r.averageDeadweightKg).toFixed(1)} kg` : "—"}</td>
                <td style={{ padding: "8px 10px" }}>{r.pricePerKgPence ? `${r.pricePerKgPence}p/kg` : "—"}</td>
                <td style={{ padding: "8px 10px" }}>{r.averageP2BackfatMm ? `${parseFloat(r.averageP2BackfatMm).toFixed(1)} mm` : "—"}</td>
                <td style={{ padding: "8px 10px" }}>{r.leanMeatPct ? `${parseFloat(r.leanMeatPct).toFixed(1)}%` : "—"}</td>
                <td style={{ padding: "8px 10px" }}>{r.gradeOut ?? "—"}</td>
                <td style={{ padding: "8px 10px", fontWeight: 600, color: "#86198f" }}>{pToGBP(r.netPaymentPence)}</td>
                <td style={{ padding: "8px 10px" }}>
                  {sppVar != null ? (
                    <span style={{ color: sppVar >= 0 ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
                      {sppVar >= 0 ? "+" : ""}{pToGBP(Math.abs(sppVar))}
                    </span>
                  ) : "—"}
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <Button size="sm" variant="ghost" onClick={() => setViewRecord(r)}><Eye size={14} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setForm({ ...r, killDate: r.killDate?.slice(0, 10) ?? "", paymentDate: r.paymentDate?.slice(0, 10) ?? "" }); setOpen(true); }}><Pencil size={14} /></Button>
                    <Button size="sm" variant="ghost" style={{ color: "#dc2626" }} onClick={() => setDeleteId(r.id)}><Trash2 size={14} /></Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Kill Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Kill Date</p><p className="font-medium">{fmtDate(viewRecord.killDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Processor</p><p className="font-medium">{String(viewRecord.processor ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Head Count</p><p className="font-medium">{String(viewRecord.headCount ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Herd Mark</p><p className="font-medium">{String(viewRecord.herdMark ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Deadweight</p><p className="font-medium">{viewRecord.totalDeadweightKg ? `${parseFloat(viewRecord.totalDeadweightKg).toFixed(1)} kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Deadweight</p><p className="font-medium">{viewRecord.averageDeadweightKg ? `${parseFloat(viewRecord.averageDeadweightKg).toFixed(1)} kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Price</p><p className="font-medium">{viewRecord.pricePerKgPence ? `${viewRecord.pricePerKgPence}p/kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Avg P2 Backfat</p><p className="font-medium">{viewRecord.averageP2BackfatMm ? `${parseFloat(viewRecord.averageP2BackfatMm).toFixed(1)} mm` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Avg Muscle Depth</p><p className="font-medium">{viewRecord.averageMuscleDepthMm ? `${parseFloat(viewRecord.averageMuscleDepthMm).toFixed(1)} mm` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lean Meat %</p><p className="font-medium">{viewRecord.leanMeatPct ? `${parseFloat(viewRecord.leanMeatPct).toFixed(1)}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Grade Out</p><p className="font-medium">{String(viewRecord.gradeOut ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Kill Sheet Ref</p><p className="font-medium">{String(viewRecord.killSheetRef ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Gross Value</p><p className="font-medium">{pToGBP(viewRecord.grossValuePence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Levy</p><p className="font-medium">{pToGBP(viewRecord.levyDeductionPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Transport Deduction</p><p className="font-medium">{pToGBP(viewRecord.transportDeductionPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net Payment</p><p className="font-medium font-bold text-purple-600">{pToGBP(viewRecord.netPaymentPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Date</p><p className="font-medium">{fmtDate(viewRecord.paymentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">SPP Variance</p><p className="font-medium">{viewRecord.sppVariancePence != null ? (viewRecord.sppVariancePence >= 0 ? "+" : "") + pToGBP(viewRecord.sppVariancePence) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Premium Scheme</p><p className="font-medium">{String(viewRecord.premiumScheme ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Premium Value</p><p className="font-medium">{pToGBP(viewRecord.premiumPence)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditing(viewRecord); setForm({ ...viewRecord, killDate: viewRecord.killDate?.slice(0, 10) ?? "", paymentDate: viewRecord.paymentDate?.slice(0, 10) ?? "" }); setOpen(true); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm(empty); } }}>
        <DialogContent style={{ maxWidth: 720, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Kill Record" : "Add Kill Record"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Kill Date *</Label><Input type="date" value={form.killDate} onChange={e => setForm((f: any) => ({ ...f, killDate: e.target.value }))} required /></div>
              <div>
                <Label>Processor {form.processor ? "" : "*"}</Label>
                <BuyerCombobox
                  farmId={farmId}
                  types={["pig_processor"]}
                  valueId={form.processorId}
                  valueName={form.processor}
                  onChange={(id, name) => setForm((f: any) => ({ ...f, processorId: id, processor: name }))}
                  required
                  placeholder="Search or add processor..."
                  typeLabel="Pig Processor"
                  postAddNavigatePath="/suppliers-stock?tab=suppliers"
                />
              </div>
              <div><Label>Head Count *</Label><Input type="number" value={form.headCount} onChange={e => setForm((f: any) => ({ ...f, headCount: e.target.value }))} required /></div>
              <div><Label>Herd Mark</Label><Input value={form.herdMark} onChange={e => setForm((f: any) => ({ ...f, herdMark: e.target.value }))} /></div>
              <div><Label>Total Deadweight (kg)</Label><Input type="number" step="0.1" value={form.totalDeadweightKg} onChange={e => setForm((f: any) => ({ ...f, totalDeadweightKg: e.target.value }))} /></div>
              <div><Label>Avg Deadweight (kg)</Label><Input type="number" step="0.1" value={form.averageDeadweightKg} onChange={e => setForm((f: any) => ({ ...f, averageDeadweightKg: e.target.value }))} /></div>
              <div><Label>Price (pence/kg)</Label><Input type="number" step="1" value={form.pricePerKgPence ? String(form.pricePerKgPence) : ""} onChange={e => setForm((f: any) => ({ ...f, pricePerKgPence: Math.round(parseFloat(e.target.value || "0")) }))} placeholder="e.g. 485" /></div>
              <div><Label>Avg P2 Backfat (mm)</Label><Input type="number" step="0.1" value={form.averageP2BackfatMm} onChange={e => setForm((f: any) => ({ ...f, averageP2BackfatMm: e.target.value }))} /></div>
              <div><Label>Avg Muscle Depth (mm)</Label><Input type="number" step="0.1" value={form.averageMuscleDepthMm} onChange={e => setForm((f: any) => ({ ...f, averageMuscleDepthMm: e.target.value }))} /></div>
              <div><Label>Lean Meat %</Label><Input type="number" step="0.1" value={form.leanMeatPct} onChange={e => setForm((f: any) => ({ ...f, leanMeatPct: e.target.value }))} /></div>
              <div><Label>Grade Out</Label><Input value={form.gradeOut} onChange={e => setForm((f: any) => ({ ...f, gradeOut: e.target.value }))} placeholder="e.g. R, O, P" /></div>
              <div><Label>Kill Sheet Ref</Label><Input value={form.killSheetRef} onChange={e => setForm((f: any) => ({ ...f, killSheetRef: e.target.value }))} /></div>
              <div><Label>Gross Value (£)</Label><Input type="number" step="0.01" value={form.grossValuePence ? (form.grossValuePence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Levy (£)</Label><Input type="number" step="0.01" value={form.levyDeductionPence ? (form.levyDeductionPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, levyDeductionPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Transport Deduction (£)</Label><Input type="number" step="0.01" value={form.transportDeductionPence ? (form.transportDeductionPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, transportDeductionPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Net Payment (£)</Label><Input type="number" step="0.01" value={form.netPaymentPence ? (form.netPaymentPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, netPaymentPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Payment Date</Label><Input type="date" value={form.paymentDate} onChange={e => setForm((f: any) => ({ ...f, paymentDate: e.target.value }))} /></div>
              <div><Label>SPP Price (pence/kg) <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>for benchmarking</span></Label><Input type="number" step="0.01" value={form.sppPriceKgPence ? (form.sppPriceKgPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, sppPriceKgPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>SPP Variance (£) +/-</Label><Input type="number" step="0.01" value={form.sppVariancePence ? (form.sppVariancePence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, sppVariancePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Premium Scheme</Label><Input value={form.premiumScheme} onChange={e => setForm((f: any) => ({ ...f, premiumScheme: e.target.value }))} placeholder="e.g. Outdoor, Organic" /></div>
              <div><Label>Premium Value (£)</Label><Input type="number" step="0.01" value={form.premiumPence ? (form.premiumPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, premiumPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div style={{ gridColumn: "1/-1" }}><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm(empty); }}>Cancel</Button>
              <Button type="submit" style={{ background: "#86198f", color: "#fff" }} disabled={mut.isPending}>{mut.isPending ? "Saving…" : editing ? "Update" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Kill Record?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => deleteId && delMut.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Direct Sales Tab ──────────────────────────────────────────────────────────
const DIRECT_CHANNELS = [
  { value: "farm_shop", label: "Farm Shop" },
  { value: "box_scheme", label: "Box Scheme / Veg Box" },
  { value: "farmers_market", label: "Farmers Market" },
  { value: "wholesale", label: "Wholesale" },
  { value: "online", label: "Online" },
  { value: "restaurant", label: "Restaurant / Hospitality" },
  { value: "school", label: "School / Institution" },
];
const PRODUCT_CATEGORIES = ["Vegetables","Fruit","Meat","Dairy","Eggs","Grain","Honey","Baked Goods","Preserves","Other"];
const UNITS = ["kg","dozen","unit","litre","bunch","head","box","bag","jar","punnet"];

function DirectSalesTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [viewRecord, setViewRecord] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [channelFilter, setChannelFilter] = useState("all");
  const [directYearFilter, setDirectYearFilter] = useState("__all__");

  const empty = {
    saleDate: "", customerId: null as number | null, channel: "farm_shop", productName: "", productCategory: "",
    quantity: "", unit: "kg", unitPricePence: "", grossValuePence: "", vatPence: "", vatRate: "0",
    netValuePence: "", paymentMethod: "cash", paymentStatus: "paid",
    customerName: "", customerRef: "", invoiceNumber: "", marketName: "", notes: "",
  };
  const [form, setForm] = useState<any>(empty);

  const q = useQuery({ queryKey: ["direct-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/direct-sales`).then(r => r.json()), enabled: !!farmId });
  const records = q.data?.records ?? [];

  const directYears = [...new Set<string>(records.map((r: any) => r.saleDate ? new Date(r.saleDate).getFullYear().toString() : null).filter(Boolean) as string[])].sort().reverse();
  const filtered = records
    .filter((r: any) => channelFilter === "all" || r.channel === channelFilter)
    .filter((r: any) => directYearFilter === "__all__" || (r.saleDate && new Date(r.saleDate).getFullYear().toString() === directYearFilter));

  const mut = useMutation({
    mutationFn: (body: any) => editing
      ? fetch(`/api/farms/${farmId}/direct-sales/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json())
      : fetch(`/api/farms/${farmId}/direct-sales`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["direct-sales", farmId] }); setOpen(false); setEditing(null); setForm(empty); toast({ title: "Sale recorded" }); },
    onError: () => toast({ title: "Error saving", variant: "destructive" }),
  });
  const delMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/direct-sales/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["direct-sales", farmId] }); setDeleteId(null); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mut.mutate({
      ...form,
      quantity: num(form.quantity),
      unitPricePence: num(form.unitPricePence),
      grossValuePence: num(form.grossValuePence),
      vatPence: num(form.vatPence),
      netValuePence: num(form.netValuePence),
      saleDate: form.saleDate ? new Date(form.saleDate).toISOString() : undefined,
    });
  };

  const totalGross = filtered.reduce((s: number, r: any) => s + (r.grossValuePence ?? 0), 0);
  const totalNet = filtered.reduce((s: number, r: any) => s + (r.netValuePence ?? r.grossValuePence ?? 0), 0);
  const byChannel = DIRECT_CHANNELS.map(c => ({
    channel: c.label,
    value: filtered.filter((r: any) => r.channel === c.value).reduce((s: number, r: any) => s + (r.grossValuePence ?? 0), 0) / 100,
  })).filter(c => c.value > 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 18px" }}>
            <div style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: 600 }}>Total Gross</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#15803d" }}>{pToGBP(totalGross)}</div>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 18px" }}>
            <div style={{ fontSize: "0.72rem", color: "#2563eb", fontWeight: 600 }}>Net (ex-VAT)</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1d4ed8" }}>{pToGBP(totalNet)}</div>
          </div>
          <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: 8, padding: "10px 18px" }}>
            <div style={{ fontSize: "0.72rem", color: "#7c3aed", fontWeight: 600 }}>Transactions</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#6d28d9" }}>{filtered.length}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={directYearFilter} onChange={e => setDirectYearFilter(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }}>
            <option value="__all__">All Years</option>
            {directYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} style={{ background: "#0891b2", color: "#fff" }}>
            <Plus size={16} style={{ marginRight: 6 }} /> Record Sale
          </Button>
        </div>
      </div>

      {/* Channel filter */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => setChannelFilter("all")} style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid", borderColor: channelFilter === "all" ? "#0891b2" : "#d1d5db", background: channelFilter === "all" ? "#0891b2" : "#fff", color: channelFilter === "all" ? "#fff" : "#374151", fontSize: "0.8rem", cursor: "pointer" }}>All</button>
        {DIRECT_CHANNELS.map(c => (
          <button key={c.value} onClick={() => setChannelFilter(c.value)} style={{ padding: "4px 12px", borderRadius: 20, border: "1px solid", borderColor: channelFilter === c.value ? "#0891b2" : "#d1d5db", background: channelFilter === c.value ? "#0891b2" : "#fff", color: channelFilter === c.value ? "#fff" : "#374151", fontSize: "0.8rem", cursor: "pointer" }}>{c.label}</button>
        ))}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e5e7eb", background: "#f9fafb" }}>
            {["Date","Channel","Product","Category","Qty","Unit Price","Gross Value","Status","Customer","Actions"].map(h => (
              <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>No direct sales yet</td></tr>}
          {filtered.map((r: any) => (
            <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
              <td style={{ padding: "8px 10px" }}>{fmtDate(r.saleDate)}</td>
              <td style={{ padding: "8px 10px" }}><Badge style={{ background: "#e0f2fe", color: "#0369a1", border: "none", fontSize: "0.7rem" }}>{DIRECT_CHANNELS.find(c => c.value === r.channel)?.label ?? r.channel}</Badge></td>
              <td style={{ padding: "8px 10px", fontWeight: 500 }}>{r.productName}</td>
              <td style={{ padding: "8px 10px", color: "#6b7280" }}>{r.productCategory ?? "—"}</td>
              <td style={{ padding: "8px 10px" }}>{r.quantity ? `${parseFloat(r.quantity).toFixed(2)} ${r.unit}` : "—"}</td>
              <td style={{ padding: "8px 10px" }}>{r.unitPricePence ? pToGBP(r.unitPricePence) : "—"}</td>
              <td style={{ padding: "8px 10px", fontWeight: 600, color: "#0891b2" }}>{pToGBP(r.grossValuePence)}</td>
              <td style={{ padding: "8px 10px" }}>
                <Badge style={{ background: r.paymentStatus === "paid" ? "#dcfce7" : r.paymentStatus === "pending" ? "#fef3c7" : "#fee2e2", color: "#374151", border: "none", fontSize: "0.7rem" }}>{r.paymentStatus}</Badge>
              </td>
              <td style={{ padding: "8px 10px", color: "#6b7280" }}>{r.customerName ?? "—"}</td>
              <td style={{ padding: "8px 10px" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <Button size="sm" variant="ghost" onClick={() => setViewRecord(r)}><Eye size={14} /></Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditing(r); setForm({ ...r, saleDate: r.saleDate?.slice(0, 10) ?? "" }); setOpen(true); }}><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" style={{ color: "#dc2626" }} onClick={() => setDeleteId(r.id)}><Trash2 size={14} /></Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Direct Sale</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{fmtDate(viewRecord.saleDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Channel</p><p className="font-medium">{DIRECT_CHANNELS.find(c => c.value === viewRecord.channel)?.label ?? viewRecord.channel}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product</p><p className="font-medium">{String(viewRecord.productName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Category</p><p className="font-medium">{String(viewRecord.productCategory ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity</p><p className="font-medium">{viewRecord.quantity ? `${parseFloat(viewRecord.quantity).toFixed(2)} ${viewRecord.unit}` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Unit Price</p><p className="font-medium">{pToGBP(viewRecord.unitPricePence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Gross Value</p><p className="font-medium">{pToGBP(viewRecord.grossValuePence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">VAT Rate</p><p className="font-medium">{viewRecord.vatRate}%</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">VAT Amount</p><p className="font-medium">{pToGBP(viewRecord.vatPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Net Value</p><p className="font-medium font-bold text-cyan-600">{pToGBP(viewRecord.netValuePence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Status</p><p className="font-medium text-capitalize">{viewRecord.paymentStatus}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Method</p><p className="font-medium text-capitalize">{viewRecord.paymentMethod}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Customer</p><p className="font-medium">{String(viewRecord.customerName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Number</p><p className="font-medium">{String(viewRecord.invoiceNumber ?? "—")}</p></div>
              {viewRecord.marketName && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Market Name</p><p className="font-medium">{viewRecord.marketName}</p></div>}
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium whitespace-pre-wrap">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditing(viewRecord); setForm({ ...viewRecord, saleDate: viewRecord.saleDate?.slice(0, 10) ?? "" }); setOpen(true); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) { setEditing(null); setForm(empty); } }}>
        <DialogContent style={{ maxWidth: 700, maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Sale" : "Record Direct Sale"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>Sale Date *</Label><Input type="date" value={form.saleDate} onChange={e => setForm((f: any) => ({ ...f, saleDate: e.target.value }))} required /></div>
              <div>
                <Label>Sales Channel *</Label>
                <Select value={form.channel} onValueChange={v => setForm((f: any) => ({ ...f, channel: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIRECT_CHANNELS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Product Name *</Label><Input value={form.productName} onChange={e => setForm((f: any) => ({ ...f, productName: e.target.value }))} required placeholder="e.g. Organic Carrots, Free Range Eggs" /></div>
              <div>
                <Label>Product Category</Label>
                <Select value={form.productCategory || "__none__"} onValueChange={v => setForm((f: any) => ({ ...f, productCategory: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Quantity *</Label><Input type="number" step="0.001" value={form.quantity} onChange={e => setForm((f: any) => ({ ...f, quantity: e.target.value }))} required /></div>
              <div>
                <Label>Unit *</Label>
                <Select value={form.unit} onValueChange={v => setForm((f: any) => ({ ...f, unit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Unit Price (£) *</Label><Input type="number" step="0.01" value={form.unitPricePence ? (form.unitPricePence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, unitPricePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} required /></div>
              <div><Label>Gross Value (£) *</Label><Input type="number" step="0.01" value={form.grossValuePence ? (form.grossValuePence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, grossValuePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} required /></div>
              <div>
                <Label>VAT Rate</Label>
                <Select value={form.vatRate} onValueChange={v => setForm((f: any) => ({ ...f, vatRate: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Zero-rated (0%)</SelectItem>
                    <SelectItem value="5">Reduced (5%)</SelectItem>
                    <SelectItem value="20">Standard (20%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>VAT Amount (£)</Label><Input type="number" step="0.01" value={form.vatPence ? (form.vatPence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, vatPence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div><Label>Net Value (£)</Label><Input type="number" step="0.01" value={form.netValuePence ? (form.netValuePence / 100).toFixed(2) : ""} onChange={e => setForm((f: any) => ({ ...f, netValuePence: Math.round(parseFloat(e.target.value || "0") * 100) }))} /></div>
              <div>
                <Label>Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={v => setForm((f: any) => ({ ...f, paymentMethod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Payment Status</Label>
                <Select value={form.paymentStatus} onValueChange={v => setForm((f: any) => ({ ...f, paymentStatus: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Customer Name</Label>
                <BuyerCombobox
                  farmId={farmId}
                  types={["direct_customer"]}
                  valueId={form.customerId}
                  valueName={form.customerName ?? ""}
                  onChange={(id, name) => setForm((f: any) => ({ ...f, customerId: id, customerName: name }))}
                  placeholder="Search or add customer..."
                  typeLabel="Customer"
                  postAddNavigatePath="/suppliers-stock?tab=suppliers"
                />
              </div>
              <div><Label>Invoice Number</Label><Input value={form.invoiceNumber} onChange={e => setForm((f: any) => ({ ...f, invoiceNumber: e.target.value }))} /></div>
              {form.channel === "farmers_market" && <div><Label>Market Name</Label><Input value={form.marketName} onChange={e => setForm((f: any) => ({ ...f, marketName: e.target.value }))} /></div>}
              <div style={{ gridColumn: "1/-1" }}><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter style={{ marginTop: 16 }}>
              <Button type="button" variant="outline" onClick={() => { setOpen(false); setEditing(null); setForm(empty); }}>Cancel</Button>
              <Button type="submit" style={{ background: "#0891b2", color: "#fff" }} disabled={mut.isPending}>{mut.isPending ? "Saving…" : editing ? "Update" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={v => !v && setDeleteId(null)}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Sale Record?</DialogTitle></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button style={{ background: "#dc2626", color: "#fff" }} onClick={() => deleteId && delMut.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Reports Tab ───────────────────────────────────────────────────────────────
function ReportsTab({ farmId }: { farmId: number }) {
  const [reportYearFilter, setReportYearFilter] = useState("__all__");

  const farmQ = useQuery({ queryKey: ["farm-detail", farmId], queryFn: () => fetch(`/api/farms/${farmId}`).then(r => r.json()), enabled: !!farmId, select: (d: any) => d.record });
  const farm = farmQ.data;

  const grainQ = useQuery({ queryKey: ["grain-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/grain-sales`).then(r => r.json()), enabled: !!farmId });
  const dwQ = useQuery({ queryKey: ["dw-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-deadweight-sales`).then(r => r.json()), enabled: !!farmId });
  const martQ = useQuery({ queryKey: ["mart-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/livestock-mart-sales`).then(r => r.json()), enabled: !!farmId });
  const milkQ = useQuery({ queryKey: ["milk-statements", farmId], queryFn: () => fetch(`/api/farms/${farmId}/milk-statements`).then(r => r.json()), enabled: !!farmId });
  const batchQ = useQuery({ queryKey: ["poultry-batch-settlements", farmId], queryFn: () => fetch(`/api/farms/${farmId}/poultry-batch-settlements`).then(r => r.json()), enabled: !!farmId });
  const eggQ = useQuery({ queryKey: ["egg-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/egg-sales`).then(r => r.json()), enabled: !!farmId });
  const pigQ = useQuery({ queryKey: ["pig-kill-records", farmId], queryFn: () => fetch(`/api/farms/${farmId}/pig-kill-records`).then(r => r.json()), enabled: !!farmId });
  const directQ = useQuery({ queryKey: ["direct-sales", farmId], queryFn: () => fetch(`/api/farms/${farmId}/direct-sales`).then(r => r.json()), enabled: !!farmId });

  const allYears = useMemo(() => {
    const yrOf = (d: string | null | undefined) => d ? new Date(d).getFullYear().toString() : null;
    return [...new Set<string>([
      ...(grainQ.data?.records ?? []).map((r: any) => yrOf(r.saleDate)),
      ...(dwQ.data?.records ?? []).map((r: any) => yrOf(r.killDate)),
      ...(martQ.data?.records ?? []).map((r: any) => yrOf(r.saleDate)),
      ...(milkQ.data?.records ?? []).map((r: any) => yrOf(r.statementMonth)),
      ...(batchQ.data?.records ?? []).map((r: any) => yrOf(r.catchDate)),
      ...(eggQ.data?.records ?? []).map((r: any) => yrOf(r.weekEnding)),
      ...(pigQ.data?.records ?? []).map((r: any) => yrOf(r.killDate)),
      ...(directQ.data?.records ?? []).map((r: any) => yrOf(r.saleDate)),
    ].filter(Boolean) as string[])].sort().reverse();
  }, [grainQ.data, dwQ.data, martQ.data, milkQ.data, batchQ.data, eggQ.data, pigQ.data, directQ.data]);

  const totals = useMemo(() => {
    const yr = reportYearFilter;
    const yrOf = (d: string | null | undefined) => d ? new Date(d).getFullYear().toString() : null;
    const byYr = (date: string | null | undefined) => yr === "__all__" || yrOf(date) === yr;
    const grain = (grainQ.data?.records ?? []).filter((r: any) => byYr(r.saleDate)).reduce((s: number, r: any) => s + (r.netValuePence ?? r.grossValuePence ?? 0), 0) / 100;
    const dw = (dwQ.data?.records ?? []).filter((r: any) => byYr(r.killDate)).reduce((s: number, r: any) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0) / 100;
    const mart = (martQ.data?.records ?? []).filter((r: any) => byYr(r.saleDate)).reduce((s: number, r: any) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0) / 100;
    const milk = (milkQ.data?.records ?? []).filter((r: any) => byYr(r.statementMonth)).reduce((s: number, r: any) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0) / 100;
    const batch = (batchQ.data?.records ?? []).filter((r: any) => byYr(r.catchDate)).reduce((s: number, r: any) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0) / 100;
    const eggs = (eggQ.data?.records ?? []).filter((r: any) => byYr(r.weekEnding)).reduce((s: number, r: any) => s + (r.netValuePence ?? r.grossValuePence ?? 0), 0) / 100;
    const pigs = (pigQ.data?.records ?? []).filter((r: any) => byYr(r.killDate)).reduce((s: number, r: any) => s + (r.netPaymentPence ?? r.grossValuePence ?? 0), 0) / 100;
    const direct = (directQ.data?.records ?? []).filter((r: any) => byYr(r.saleDate)).reduce((s: number, r: any) => s + (r.grossValuePence ?? 0), 0) / 100;
    return { grain, dw, mart, milk, batch, eggs, pigs, direct };
  }, [reportYearFilter, grainQ.data, dwQ.data, martQ.data, milkQ.data, batchQ.data, eggQ.data, pigQ.data, directQ.data]);

  const sectorData = [
    { name: "Grain", value: totals.grain },
    { name: "Livestock DW", value: totals.dw },
    { name: "Mart", value: totals.mart },
    { name: "Milk", value: totals.milk },
    { name: "Poultry Batch", value: totals.batch },
    { name: "Eggs", value: totals.eggs },
    { name: "Pig Sales", value: totals.pigs },
    { name: "Direct Sales", value: totals.direct },
  ].filter(s => s.value > 0);

  const totalAll = Object.values(totals).reduce((a, b) => a + b, 0);

  const kpis = [
    { label: "Grain Sales", value: totals.grain, color: "#16a34a" },
    { label: "Livestock Deadweight", value: totals.dw, color: "#15803d" },
    { label: "Mart Sales", value: totals.mart, color: "#1d4ed8" },
    { label: "Milk Revenue", value: totals.milk, color: "#7c3aed" },
    { label: "Poultry Settlement", value: totals.batch, color: "#b45309" },
    { label: "Egg Sales", value: totals.eggs, color: "#c2410c" },
    { label: "Pig Sales", value: totals.pigs, color: "#86198f" },
    { label: "Direct Sales", value: totals.direct, color: "#0891b2" },
  ];

  const periodLabel = reportYearFilter === "__all__" ? "All Time" : reportYearFilter;

  const handlePrint = () => {
    const farmName = farm?.name ?? "Farm";
    const cph = farm?.cphNumber ? `CPH: ${farm.cphNumber}` : "";
    const rtId = farm?.redTractorId ? `Red Tractor ID: ${farm.redTractorId}` : "";
    const address = [farm?.addressLine1, farm?.addressTown, farm?.addressCounty, farm?.addressPostcode].filter(Boolean).join(", ");
    const generatedAt = new Date().toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" });

    const rows = kpis.map(k => `
      <tr>
        <td>${k.label}</td>
        <td style="text-align:right; font-weight:600; color:${k.value > 0 ? "#166534" : "#6b7280"}">
          ${k.value > 0 ? `£${k.value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "No data"}
        </td>
        <td style="text-align:right; color:#6b7280">
          ${totalAll > 0 && k.value > 0 ? `${((k.value / totalAll) * 100).toFixed(1)}%` : "—"}
        </td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sales &amp; Trading Report — ${farmName}</title>
  <style>
    @page { size: A4 landscape; margin: 18mm 18mm 16mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 10pt; color: #111; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 10px; border-bottom: 2px solid #16a34a; margin-bottom: 14px; }
    .header-left h1 { font-size: 18pt; font-weight: 800; color: #15803d; }
    .header-left h2 { font-size: 12pt; font-weight: 600; color: #374151; margin-top: 2px; }
    .header-left p { font-size: 9pt; color: #6b7280; margin-top: 2px; }
    .header-right { text-align: right; font-size: 9pt; color: #6b7280; }
    .header-right strong { display: block; font-size: 11pt; color: #111; font-weight: 700; }
    .total-box { background: #f0fdf4; border: 2px solid #16a34a; border-radius: 6px; padding: 14px 20px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .total-box .amount { font-size: 22pt; font-weight: 800; color: #15803d; }
    .total-box .label { font-size: 10pt; color: #166534; font-weight: 600; }
    .total-box .sub { font-size: 9pt; color: #6b7280; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
    th { background: #f9fafb; text-align: left; padding: 7px 10px; font-size: 9pt; font-weight: 700; color: #374151; border-bottom: 2px solid #e5e7eb; }
    th:not(:first-child) { text-align: right; }
    td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; font-size: 10pt; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    .total-row td { border-top: 2px solid #16a34a; font-weight: 700; background: #f9fafb; }
    .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 8pt; color: #9ca3af; display: flex; justify-content: space-between; }
    .badge { display: inline-block; background: #dcfce7; color: #166534; border-radius: 4px; padding: 2px 8px; font-size: 8pt; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <h1>BDE Farm Trac</h1>
      <h2>${farmName}</h2>
      <p>${[address, cph, rtId].filter(Boolean).join(" &nbsp;·&nbsp; ")}</p>
    </div>
    <div class="header-right">
      <strong>Sales &amp; Trading Report</strong>
      Period: ${periodLabel}<br>
      Produced: ${generatedAt}<br>
      <span class="badge">Barnett Davies Enterprises Ltd</span>
    </div>
  </div>

  <div class="total-box">
    <div>
      <div class="label">Total Farm Sales Revenue</div>
      <div class="sub">All sectors combined &nbsp;·&nbsp; Period: ${periodLabel}</div>
    </div>
    <div class="amount">£${totalAll.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Sales Sector</th>
        <th style="text-align:right">Revenue</th>
        <th style="text-align:right">% of Total</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td>Total</td>
        <td style="text-align:right">£${totalAll.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td style="text-align:right">100.0%</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <span>BDE Farm Trac — Barnett Davies Enterprises Ltd &nbsp;·&nbsp; Confidential — not for circulation</span>
    <span>Generated: ${generatedAt}</span>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=650");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  return (
    <div>
      {/* Year filter + Print button */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <select value={reportYearFilter} onChange={e => setReportYearFilter(e.target.value)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }}>
          <option value="__all__">All Years</option>
          {allYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <Button variant="outline" size="sm" onClick={handlePrint} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Printer size={14} /> Print Report
        </Button>
      </div>

      {/* Grand total */}
      <div style={{ background: "linear-gradient(135deg, #16a34a, #15803d)", borderRadius: 12, padding: "20px 28px", color: "#fff", marginBottom: 24 }}>
        <div style={{ fontSize: "0.875rem", opacity: 0.8, marginBottom: 4 }}>{reportYearFilter === "__all__" ? "Total Farm Sales Revenue — All Time" : `Total Farm Sales Revenue — ${reportYearFilter}`}</div>
        <div style={{ fontSize: "2.5rem", fontWeight: 800 }}>£{totalAll.toLocaleString("en-GB", { minimumFractionDigits: 2 })}</div>
        <div style={{ fontSize: "0.8rem", opacity: 0.7, marginTop: 4 }}>All sectors combined</div>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 32 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "14px 16px", borderLeft: `4px solid ${k.color}` }}>
            <div style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700, color: k.color }}>
              {k.value > 0 ? `£${k.value.toLocaleString("en-GB", { minimumFractionDigits: 2 })}` : "No data"}
            </div>
          </div>
        ))}
      </div>

      {/* Sector breakdown chart */}
      {sectorData.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: "#374151" }}>Revenue by Sector</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sectorData} margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v: number) => `£${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, "Revenue"]} />
                <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: "#374151" }}>Revenue Mix</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={sectorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {sectorData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`£${v.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`, ""]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {sectorData.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
          <BarChart3 size={48} style={{ margin: "0 auto 16px" }} />
          <p style={{ fontWeight: 500 }}>No sales data yet</p>
          <p style={{ fontSize: "0.875rem" }}>Start recording sales in each sector to see reports here</p>
        </div>
      )}
    </div>
  );
}

// ─── Grain Contracts & Pools Tab ─────────────────────────────────────────────

const CONTRACT_STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active:    { bg: "#dcfce7", color: "#15803d", label: "Active" },
  fulfilled: { bg: "#dbeafe", color: "#1d4ed8", label: "Fulfilled" },
  pending:   { bg: "#fef9c3", color: "#92400e", label: "Pending" },
  cancelled: { bg: "#fee2e2", color: "#b91c1c", label: "Cancelled" },
  disputed:  { bg: "#fef3c7", color: "#b45309", label: "Disputed" },
  open:      { bg: "#f3f4f6", color: "#374151", label: "Open" },
};

function ContractProgressBar({ calledOff, total, type }: { calledOff: number; total: number; type: string }) {
  const pct = total > 0 ? Math.min(100, (calledOff / total) * 100) : 0;
  const isPool = type === "pool";
  const barColor = isPool ? "#7c3aed" : (pct >= 100 ? "#16a34a" : "#2563eb");
  return (
    <div>
      <div style={{ background: "#e5e7eb", borderRadius: 4, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: barColor, height: "100%", borderRadius: 4, transition: "width 0.3s ease" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, fontSize: "0.7rem", color: "#6b7280" }}>
        <span>{calledOff.toFixed(2)}t {isPool ? "allocated" : "called off"}</span>
        <span>{Math.max(0, total - calledOff).toFixed(2)}t remaining of {total.toFixed(2)}t</span>
      </div>
    </div>
  );
}

function GrainContractsTab({ farmId }: { farmId: number }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [cropYearFilter, setCropYearFilter] = useState<string>("__all__");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [addType, setAddType] = useState<"forward" | "pool" | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const emptyForward = {
    contractType: "forward", cropYear: "", buyerId: null as number | null, buyer: "", commodity: "", variety: "",
    qualitySpec: "", quantityTonnes: "", contractedPricePence: "", contractDate: "",
    deliveryWindowStart: "", deliveryWindowEnd: "", deliveryLocation: "",
    callOffWindowNotes: "", contractReference: "", status: "active", notes: "",
  };
  const emptyPool = {
    contractType: "pool", cropYear: "", buyerId: null as number | null, buyer: "", commodity: "", variety: "",
    qualitySpec: "", quantityTonnes: "", advancePaymentPence: "", poolLevyPence: "",
    poolClosingDate: "", poolSettlementDate: "", deliveryLocation: "",
    contractReference: "", status: "active", notes: "",
  };
  const [form, setForm] = useState<any>(emptyForward);

  const q = useQuery({
    queryKey: ["crop-contracts", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-contracts`).then(r => r.json()),
    enabled: !!farmId,
    select: (d: any) => d.records ?? [],
  });
  const contracts: any[] = q.data ?? [];

  const txQ = useQuery({
    queryKey: ["contract-transactions", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/crop-contracts/${expandedId}/transactions`).then(r => r.json()),
    enabled: !!expandedId,
    select: (d: any) => d.records ?? [],
  });
  const transactions: any[] = txQ.data ?? [];

  const availableCropYears = [...new Set<string>(contracts.map((c: any) => c.cropYear).filter(Boolean))].sort().reverse();
  const filtered = contracts.filter((c: any) => cropYearFilter === "__all__" || c.cropYear === cropYearFilter);
  const forwardContracts = filtered.filter((c: any) => c.contractType === "forward" || !c.contractType);
  const poolContracts = filtered.filter((c: any) => c.contractType === "pool");

  const saveMut = useMutation({
    mutationFn: (body: any) => editing
      ? fetch(`/api/farms/${farmId}/crop-contracts/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json())
      : fetch(`/api/farms/${farmId}/crop-contracts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crop-contracts", farmId] });
      setAddType(null); setEditing(null); setForm(emptyForward);
      toast({ title: editing ? "Contract updated" : "Contract created" });
    },
    onError: () => toast({ title: "Error saving contract", variant: "destructive" }),
  });

  const delMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/crop-contracts/${id}`, { method: "DELETE" }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["crop-contracts", farmId] }); setDeleteId(null); toast({ title: "Contract deleted" }); },
  });

  const isPool = form.contractType === "pool";
  const isOpen = addType !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const body: any = {
      ...form,
      quantityTonnes: num(form.quantityTonnes),
      contractDate: form.contractDate ? new Date(form.contractDate).toISOString() : undefined,
    };
    if (isPool) {
      body.advancePaymentPence = num(form.advancePaymentPence);
      body.poolLevyPence = num(form.poolLevyPence);
      body.poolClosingDate = form.poolClosingDate ? new Date(form.poolClosingDate).toISOString() : undefined;
      body.poolSettlementDate = form.poolSettlementDate ? new Date(form.poolSettlementDate).toISOString() : undefined;
    } else {
      body.contractedPricePence = num(form.contractedPricePence);
      body.deliveryWindowStart = form.deliveryWindowStart ? new Date(form.deliveryWindowStart).toISOString() : undefined;
      body.deliveryWindowEnd = form.deliveryWindowEnd ? new Date(form.deliveryWindowEnd).toISOString() : undefined;
    }
    saveMut.mutate(body);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      ...c,
      contractDate: c.contractDate ? c.contractDate.slice(0, 10) : "",
      deliveryWindowStart: c.deliveryWindowStart ? c.deliveryWindowStart.slice(0, 10) : "",
      deliveryWindowEnd: c.deliveryWindowEnd ? c.deliveryWindowEnd.slice(0, 10) : "",
      poolClosingDate: c.poolClosingDate ? c.poolClosingDate.slice(0, 10) : "",
      poolSettlementDate: c.poolSettlementDate ? c.poolSettlementDate.slice(0, 10) : "",
      contractedPricePence: c.contractedPricePence ?? "",
      advancePaymentPence: c.advancePaymentPence ?? "",
      poolLevyPence: c.poolLevyPence ?? "",
      quantityTonnes: c.quantityTonnes ?? "",
    });
    setAddType(c.contractType as "forward" | "pool");
  };

  // Summary figures across filtered contracts
  const totalCommitted = filtered.reduce((s: number, c: any) => s + parseFloat(c.quantityTonnes ?? "0"), 0);
  const totalCalledOff = filtered.reduce((s: number, c: any) => s + (c.calledOffTonnes ?? 0), 0);
  const totalForwardValue = filtered
    .filter((c: any) => c.contractType !== "pool" && c.contractedPricePence)
    .reduce((s: number, c: any) => s + (parseFloat(c.quantityTonnes ?? "0") * (c.contractedPricePence / 100)), 0);

  const renderContractCard = (c: any) => {
    const qty = parseFloat(c.quantityTonnes ?? "0");
    const calledOff = parseFloat(String(c.calledOffTonnes ?? 0));
    const isExpanded = expandedId === c.id;
    const sty = CONTRACT_STATUS_STYLE[c.status] ?? CONTRACT_STATUS_STYLE.open;
    const cardIsPool = c.contractType === "pool";
    const borderColor = cardIsPool ? "#e9d5ff" : "#e5e7eb";
    const bgColor = cardIsPool ? "#faf5ff" : "#fff";
    const txnLabel = cardIsPool ? "Pool Allocations" : "Call-Off Movements";
    const txnColColor = cardIsPool ? "#7c3aed" : "#6b7280";

    return (
      <div key={c.id} style={{ border: `1px solid ${borderColor}`, borderRadius: 10, overflow: "hidden", background: bgColor, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div
          onClick={() => setExpandedId(isExpanded ? null : c.id)}
          style={{ padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111827" }}>{c.buyer}</span>
              {c.cropYear && (
                <span style={{ fontSize: "0.72rem", background: cardIsPool ? "#f3e8ff" : "#dbeafe", color: cardIsPool ? "#7c3aed" : "#1d4ed8", borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>
                  {c.cropYear}
                </span>
              )}
              <span style={{ fontSize: "0.72rem", background: sty.bg, color: sty.color, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>
                {sty.label}
              </span>
            </div>
            <div style={{ fontSize: "0.85rem", color: "#374151" }}>{c.commodity}{c.variety ? ` — ${c.variety}` : ""}</div>
            <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: 2 }}>
              {cardIsPool
                ? `${c.advancePaymentPence ? `£${(c.advancePaymentPence / 100).toFixed(2)}/t advance` : "Pool — no advance set"}${c.poolLevyPence ? ` · £${(c.poolLevyPence / 100).toFixed(2)}/t levy` : ""}`
                : `${c.contractedPricePence ? `£${(c.contractedPricePence / 100).toFixed(2)}/t` : "Price TBC"}`
              }
              {c.contractReference ? ` · ${c.contractReference}` : ""}
            </div>
            <div style={{ marginTop: 10 }}>
              <ContractProgressBar calledOff={calledOff} total={qty} type={c.contractType} />
            </div>
          </div>
          <div style={{ marginLeft: 12, flexShrink: 0 }}>
            {isExpanded ? <ChevronDown size={16} color="#6b7280" /> : <ChevronRight size={16} color="#6b7280" />}
          </div>
        </div>

        {isExpanded && (
          <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${borderColor}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12, marginTop: 12 }}>
              {cardIsPool ? (
                <>
                  {c.poolClosingDate && (
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Pool Closes</div>
                      <div style={{ fontSize: "0.82rem", color: "#374151" }}>{fmtDate(c.poolClosingDate)}</div>
                    </div>
                  )}
                  {c.poolSettlementDate && (
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Settlement Date</div>
                      <div style={{ fontSize: "0.82rem", color: "#374151" }}>{fmtDate(c.poolSettlementDate)}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {c.deliveryWindowStart && (
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Delivery Window</div>
                      <div style={{ fontSize: "0.82rem", color: "#374151" }}>{fmtDate(c.deliveryWindowStart)} – {fmtDate(c.deliveryWindowEnd)}</div>
                    </div>
                  )}
                  {c.callOffWindowNotes && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Call-Off Notes</div>
                      <div style={{ fontSize: "0.82rem", color: "#374151" }}>{c.callOffWindowNotes}</div>
                    </div>
                  )}
                </>
              )}
              {c.deliveryLocation && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Delivery Location</div>
                  <div style={{ fontSize: "0.82rem", color: "#374151" }}>{c.deliveryLocation}</div>
                </div>
              )}
              {c.qualitySpec && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Quality Spec</div>
                  <div style={{ fontSize: "0.82rem", color: "#374151" }}>{c.qualitySpec}</div>
                </div>
              )}
              {c.notes && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Notes</div>
                  <div style={{ fontSize: "0.82rem", color: "#6b7280" }}>{c.notes}</div>
                </div>
              )}
            </div>

            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 6 }}>{txnLabel}</div>
            {txQ.isPending && expandedId === c.id ? (
              <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>Loading...</div>
            ) : transactions.length === 0 ? (
              <div style={{ color: "#9ca3af", fontSize: "0.8rem" }}>No {cardIsPool ? "allocations" : "movements"} recorded against this {cardIsPool ? "pool position" : "contract"}.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${borderColor}` }}>
                    <th style={{ textAlign: "left", padding: "3px 6px", color: txnColColor, fontWeight: 600 }}>Date</th>
                    <th style={{ textAlign: "left", padding: "3px 6px", color: txnColColor, fontWeight: 600 }}>Buyer</th>
                    <th style={{ textAlign: "right", padding: "3px 6px", color: txnColColor, fontWeight: 600 }}>Tonnes</th>
                    <th style={{ textAlign: "right", padding: "3px 6px", color: txnColColor, fontWeight: 600 }}>£/t</th>
                    <th style={{ textAlign: "right", padding: "3px 6px", color: txnColColor, fontWeight: 600 }}>Value</th>
                    <th style={{ textAlign: "left", padding: "3px 6px", color: txnColColor, fontWeight: 600 }}>Ref</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t: any) => (
                    <tr key={t.id} style={{ borderBottom: `1px solid ${cardIsPool ? "#f3e8ff" : "#f3f4f6"}` }}>
                      <td style={{ padding: "3px 6px" }}>{fmtDate(t.saleDate)}</td>
                      <td style={{ padding: "3px 6px" }}>{t.buyer}</td>
                      <td style={{ padding: "3px 6px", textAlign: "right" }}>{parseFloat(t.tonnage ?? "0").toFixed(2)}t</td>
                      <td style={{ padding: "3px 6px", textAlign: "right" }}>{t.pricePerTonnePence ? `£${(t.pricePerTonnePence / 100).toFixed(2)}` : "—"}</td>
                      <td style={{ padding: "3px 6px", textAlign: "right" }}>{(t.netValuePence ?? t.grossValuePence) ? pToGBP(t.netValuePence ?? t.grossValuePence) : "—"}</td>
                      <td style={{ padding: "3px 6px", color: "#6b7280" }}>{t.merchantRef ?? t.invoiceNumber ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
              <Button size="sm" variant="outline" onClick={() => openEdit(c)} style={{ fontSize: "0.78rem" }}>
                <Pencil size={12} style={{ marginRight: 4 }} /> Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => setDeleteId(c.id)} style={{ fontSize: "0.78rem", borderColor: "#fca5a5", color: "#dc2626" }}>
                <Trash2 size={12} style={{ marginRight: 4 }} /> Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header strip */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Total Committed</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1d4ed8" }}>{totalCommitted.toFixed(2)} t</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Called Off / Allocated</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#16a34a" }}>{totalCalledOff.toFixed(2)} t</div>
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>Forward Contract Value</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#92400e" }}>
              £{totalForwardValue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select
            value={cropYearFilter}
            onChange={e => setCropYearFilter(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#374151", background: "#fff", cursor: "pointer" }}
          >
            <option value="__all__">All Crop Years</option>
            {availableCropYears.map((y: string) => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button onClick={() => { setEditing(null); setForm(emptyForward); setAddType("forward"); }}
            style={{ background: "#2563eb", color: "#fff", padding: "6px 14px", fontSize: "0.85rem" }}>
            <Plus size={14} style={{ marginRight: 5 }} /> Forward Contract
          </Button>
          <Button onClick={() => { setEditing(null); setForm(emptyPool); setAddType("pool"); }}
            style={{ background: "#7c3aed", color: "#fff", padding: "6px 14px", fontSize: "0.85rem" }}>
            <Droplets size={14} style={{ marginRight: 5 }} /> Pool Scheme
          </Button>
        </div>
      </div>

      {/* Forward Contracts section */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Handshake size={18} color="#2563eb" />
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1d4ed8", margin: 0 }}>
            Forward Contracts ({forwardContracts.length})
          </h2>
        </div>
        {forwardContracts.length === 0 ? (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0", border: "1px dashed #e5e7eb", borderRadius: 8 }}>
            No forward contracts{cropYearFilter !== "__all__" ? ` for ${cropYearFilter}` : ""}. Add one above.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 14 }}>
            {forwardContracts.map(renderContractCard)}
          </div>
        )}
      </div>

      {/* Pool Scheme Positions section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Droplets size={18} color="#7c3aed" />
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#7c3aed", margin: 0 }}>
            Pool Scheme Positions ({poolContracts.length})
          </h2>
        </div>
        {poolContracts.length === 0 ? (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: "32px 0", border: "1px dashed #e5e7eb", borderRadius: 8 }}>
            No pool scheme positions{cropYearFilter !== "__all__" ? ` for ${cropYearFilter}` : ""}. Add one above.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))", gap: 14 }}>
            {poolContracts.map(renderContractCard)}
          </div>
        )}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={isOpen} onOpenChange={v => { if (!v) { setAddType(null); setEditing(null); setForm(emptyForward); } }}>
        <DialogContent style={{ maxWidth: 600, maxHeight: "80vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit" : "Add"} {isPool ? "Pool Scheme Position" : "Forward Contract"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>
                  {isPool ? "Pool Operator" : "Merchant / Buyer"} *
                </label>
                <BuyerCombobox
                  farmId={farmId}
                  types={["grain_merchant"]}
                  valueId={form.buyerId}
                  valueName={form.buyer}
                  onChange={(id, name) => setForm((f: any) => ({ ...f, buyerId: id, buyer: name }))}
                  required
                  placeholder={isPool ? "Search or add pool operator..." : "Search or add grain merchant..."}
                  typeLabel={isPool ? "Pool Operator" : "Grain Merchant"}
                  postAddNavigatePath="/suppliers-stock?tab=suppliers"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Commodity *</label>
                <select required value={form.commodity ?? ""} onChange={e => setForm((f: any) => ({ ...f, commodity: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem" }}>
                  <option value="">Select...</option>
                  {["Winter Wheat","Winter Barley","Spring Barley","Oilseed Rape","Winter Oats","Maize","Spring Oats","Rye","Triticale"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Variety</label>
                <Input value={form.variety ?? ""} onChange={e => setForm((f: any) => ({ ...f, variety: e.target.value }))} placeholder="e.g. KWS Zyatt" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Crop Year</label>
                <Input value={form.cropYear ?? ""} onChange={e => setForm((f: any) => ({ ...f, cropYear: e.target.value }))} placeholder="e.g. 2024 Harvest" />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Quantity (tonnes) *</label>
                <Input required type="number" step="0.01" value={form.quantityTonnes ?? ""} onChange={e => setForm((f: any) => ({ ...f, quantityTonnes: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Contract Reference</label>
                <Input value={form.contractReference ?? ""} onChange={e => setForm((f: any) => ({ ...f, contractReference: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Status</label>
                <select value={form.status ?? "active"} onChange={e => setForm((f: any) => ({ ...f, status: e.target.value }))}
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem" }}>
                  {["active","pending","fulfilled","cancelled","disputed","open"].map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              {/* Forward-specific fields */}
              {!isPool && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Price (£/t)</label>
                    <Input type="number" step="0.01"
                      value={form.contractedPricePence !== "" && form.contractedPricePence !== null ? (Number(form.contractedPricePence) / 100).toFixed(2) : ""}
                      onChange={e => setForm((f: any) => ({ ...f, contractedPricePence: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : "" }))}
                      placeholder="e.g. 192.00" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Delivery From</label>
                    <Input type="date" value={form.deliveryWindowStart ?? ""} onChange={e => setForm((f: any) => ({ ...f, deliveryWindowStart: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Delivery To</label>
                    <Input type="date" value={form.deliveryWindowEnd ?? ""} onChange={e => setForm((f: any) => ({ ...f, deliveryWindowEnd: e.target.value }))} />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Call-Off Notes</label>
                    <Input value={form.callOffWindowNotes ?? ""} onChange={e => setForm((f: any) => ({ ...f, callOffWindowNotes: e.target.value }))} placeholder="e.g. Full tonnage Aug–Sep, call-off at farm gate" />
                  </div>
                </>
              )}

              {/* Pool-specific fields */}
              {isPool && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Advance Payment (£/t)</label>
                    <Input type="number" step="0.01"
                      value={form.advancePaymentPence !== "" && form.advancePaymentPence !== null ? (Number(form.advancePaymentPence) / 100).toFixed(2) : ""}
                      onChange={e => setForm((f: any) => ({ ...f, advancePaymentPence: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : "" }))}
                      placeholder="e.g. 300.00" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Pool Levy (£/t)</label>
                    <Input type="number" step="0.01"
                      value={form.poolLevyPence !== "" && form.poolLevyPence !== null ? (Number(form.poolLevyPence) / 100).toFixed(2) : ""}
                      onChange={e => setForm((f: any) => ({ ...f, poolLevyPence: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : "" }))}
                      placeholder="e.g. 1.50" />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Pool Closes</label>
                    <Input type="date" value={form.poolClosingDate ?? ""} onChange={e => setForm((f: any) => ({ ...f, poolClosingDate: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Settlement Date</label>
                    <Input type="date" value={form.poolSettlementDate ?? ""} onChange={e => setForm((f: any) => ({ ...f, poolSettlementDate: e.target.value }))} />
                  </div>
                </>
              )}

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Delivery Location</label>
                <Input value={form.deliveryLocation ?? ""} onChange={e => setForm((f: any) => ({ ...f, deliveryLocation: e.target.value }))} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Quality Specification</label>
                <Input value={form.qualitySpec ?? ""} onChange={e => setForm((f: any) => ({ ...f, qualitySpec: e.target.value }))} placeholder="e.g. Feed, min 76 SWt, max 15% moisture" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 4 }}>Notes</label>
                <textarea value={form.notes ?? ""} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))}
                  rows={2} style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: "0.875rem", resize: "vertical" }} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setAddType(null); setEditing(null); }}>Cancel</Button>
              <Button type="submit" disabled={saveMut.isPending}
                style={{ background: isPool ? "#7c3aed" : "#2563eb", color: "#fff" }}>
                {saveMut.isPending ? "Saving..." : editing ? "Save Changes" : `Add ${isPool ? "Pool Position" : "Contract"}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={v => { if (!v) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 400 }}>
          <DialogHeader><DialogTitle>Delete Contract?</DialogTitle></DialogHeader>
          <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>This will permanently delete this contract record. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button onClick={() => deleteId && delMut.mutate(deleteId)} disabled={delMut.isPending}
              style={{ background: "#dc2626", color: "#fff" }}>
              {delMut.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Tabs Config ──────────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: React.FC<any> }[] = [
  { id: "grain", label: "Grain Trading", icon: Wheat },
  { id: "contracts", label: "Grain Contracts", icon: Handshake },
  { id: "livestock", label: "Livestock", icon: Scale },
  { id: "milk", label: "Milk Sales", icon: Milk },
  { id: "poultry", label: "Poultry", icon: Bird },
  { id: "pigs", label: "Pig Sales", icon: PiggyBank },
  { id: "direct", label: "Direct Sales", icon: ShoppingCart },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settlement-notes", label: "Settlement Notes", icon: FileText },
];

export default function SalesTradingPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("grain");

  if (!farmId) {
    return (
      <AppLayout title="Sales & Trading">
        <div style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>Please select a farm to view Sales & Trading.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Sales & Trading">
      <div style={{ padding: "24px 28px", maxWidth: 1400 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", margin: 0 }}>Sales & Trading</h1>
          <p style={{ color: "#6b7280", marginTop: 4, fontSize: "0.9rem" }}>
            Comprehensive sales records for all farming sectors — grain, livestock, milk, poultry, pigs, and direct sales
          </p>
        </div>

        <TabBar>
          {TABS.map(t => (
            <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
              <t.icon size={14} style={{ marginRight: 6 }} />
              {t.label}
            </TabButton>
          ))}
        </TabBar>

        <div style={{ marginTop: 20 }}>
          {tab === "grain" && <GrainSalesTab farmId={farmId} />}
          {tab === "contracts" && <GrainContractsTab farmId={farmId} />}
          {tab === "livestock" && <LivestockTradingTab farmId={farmId} />}
          {tab === "milk" && <MilkSalesTab farmId={farmId} />}
          {tab === "poultry" && <PoultrySettlementTab farmId={farmId} />}
          {tab === "pigs" && <PigSalesTab farmId={farmId} />}
          {tab === "direct" && <DirectSalesTab farmId={farmId} />}
          {tab === "reports" && <ReportsTab farmId={farmId} />}
          {tab === "settlement-notes" && <SettlementNotesTab farmId={farmId} />}
        </div>
      </div>
    </AppLayout>
  );
}
