import React, { useState, useMemo, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import {
  Plus, Pencil, Trash2, Eye, TrendingUp, AlertTriangle, CheckCircle2,
  Package, DollarSign, FileText, Thermometer, Droplets, ShieldCheck,
  Wheat, BarChart3, Scale, Calendar, AlertCircle, Info, Loader2,
  Truck, FileCheck, X
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const STRAW_TYPES = ["Wheat Straw", "Barley Straw", "Oat Straw", "Oilseed Rape Straw"];
const BALE_FORMATS = ["Small Rectangular", "Big Round", "Big Square"];
const STORAGE_TYPES = ["Indoor", "Outdoor Covered", "Outdoor Uncovered"];
const PPP_RISKS = ["Low", "Medium", "High"];
const INTENDED_USES = ["Animal Feed", "Bedding", "Horticultural / Composting", "Unknown"];
const BUYER_TYPES = ["Farmer", "Merchant / Trader", "Market Gardener", "Contractor", "Other"];
const TRANSPORT_OPTIONS = ["Buyer Collects", "Own Transport", "Third-Party Haulier"];
const PAYMENT_STATUSES = ["unpaid", "paid", "overdue"];
const CONDITION_OPTIONS = ["Good", "Monitor", "Action Required", "Unsafe"];
const CHART_COLORS = ["#16a34a", "#2563eb", "#d97706", "#dc2626", "#7c3aed", "#0891b2"];

// ─── VAT intelligence ────────────────────────────────────────────────────────
function deriveVatClassification(use: string): { classification: string; rate: string; warning?: string } {
  if (use === "Animal Feed") return { classification: "Zero-rated (0%)", rate: "0%" };
  if (use === "Bedding") return {
    classification: "Standard-rated (20%)", rate: "20%",
    warning: "Straw sold as bedding is standard-rated for VAT (20%). Ensure this is reflected on your invoice."
  };
  if (use === "Horticultural / Composting") return {
    classification: "Standard-rated (20%)", rate: "20%",
    warning: "Straw sold for horticultural or composting use is standard-rated for VAT (20%) per HMRC VAT Notice 701/15."
  };
  return { classification: "To be confirmed", rate: "TBC", warning: "Confirm intended use with buyer before invoicing. VAT rate depends on how straw is held out for sale (HMRC VAT Notice 701/15)." };
}

// ─── Moisture risk intelligence ───────────────────────────────────────────────
function getMoistureRisk(pct: number | null | undefined, format: string): { status: string; colour: string; message: string } {
  if (pct == null) return { status: "Unknown", colour: "gray", message: "Record moisture at baling for fire risk assessment." };
  const limit = format === "Small Rectangular" ? 22 : 18;
  const warning = format === "Small Rectangular" ? 18 : 16;
  if (pct > limit) return { status: "Action Required", colour: "red", message: `Moisture ${pct}% exceeds safe limit (${limit}% for ${format}). Risk of spontaneous combustion. Monitor daily and consider moving/selling immediately.` };
  if (pct > warning) return { status: "Warning", colour: "amber", message: `Moisture ${pct}% is elevated (safe limit: ${limit}% for ${format}). Monitor closely for first 14 days.` };
  return { status: "Safe", colour: "green", message: `Moisture ${pct}% is within safe limits for ${format} (max ${limit}%).` };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const pToGBP = (p: number | null | undefined) =>
  p == null ? "—" : `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}`;
const num = (v: any) => (v == null || v === "" ? null : Number(v));
const today = () => new Date().toISOString().slice(0, 10);

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    in_stock: "bg-green-100 text-green-800",
    sold: "bg-gray-100 text-gray-700",
    used_on_farm: "bg-blue-100 text-blue-800",
    disposed: "bg-red-100 text-red-700",
    unpaid: "bg-amber-100 text-amber-800",
    paid: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
  };
  const label: Record<string, string> = {
    in_stock: "In Stock", sold: "Sold", used_on_farm: "Used On-Farm",
    disposed: "Disposed", unpaid: "Unpaid", paid: "Paid", overdue: "Overdue"
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? "bg-gray-100 text-gray-700"}`}>{label[status] ?? status}</span>;
}

function ConditionBadge({ cond }: { cond: string }) {
  const map: Record<string, string> = {
    Good: "bg-green-100 text-green-800",
    Monitor: "bg-amber-100 text-amber-800",
    "Action Required": "bg-orange-100 text-orange-800",
    Unsafe: "bg-red-100 text-red-800",
  };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${map[cond] ?? "bg-gray-100 text-gray-700"}`}>{cond}</span>;
}

// ─── Inventory Dialog ─────────────────────────────────────────────────────────
function InventoryDialog({ open, onClose, farmId, editRow }: { open: boolean; onClose: () => void; farmId: number; editRow?: any }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;

  const init = {
    batchRef: "", strawType: "Wheat Straw", baleFormat: "Big Round",
    harvestDate: today(), fieldOfOrigin: "", cropVariety: "",
    quantityBales: "", baleWeightKg: "", moistureAtBaling: "",
    storageLocation: "", storageType: "Indoor", stackingStartDate: today(),
    redTractorCertified: false, combinableCropsPassportRef: "",
    pppResidueRisk: "Low", fusariumRiskAssessed: false,
    biomassContract: false, biomassScheme: "", biomassUniqueBaleRef: "",
    status: "in_stock", quantityRemaining: "", notes: "",
  };

  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  React.useEffect(() => {
    if (open) {
      if (editRow) {
        setForm({
          batchRef: editRow.batchRef ?? "",
          strawType: editRow.strawType ?? "Wheat Straw",
          baleFormat: editRow.baleFormat ?? "Big Round",
          harvestDate: editRow.harvestDate ?? today(),
          fieldOfOrigin: editRow.fieldOfOrigin ?? "",
          cropVariety: editRow.cropVariety ?? "",
          quantityBales: editRow.quantityBales ?? "",
          baleWeightKg: editRow.baleWeightKg ?? "",
          moistureAtBaling: editRow.moistureAtBaling ?? "",
          storageLocation: editRow.storageLocation ?? "",
          storageType: editRow.storageType ?? "Indoor",
          stackingStartDate: editRow.stackingStartDate ?? today(),
          redTractorCertified: editRow.redTractorCertified ?? false,
          combinableCropsPassportRef: editRow.combinableCropsPassportRef ?? "",
          pppResidueRisk: editRow.pppResidueRisk ?? "Low",
          fusariumRiskAssessed: editRow.fusariumRiskAssessed ?? false,
          biomassContract: editRow.biomassContract ?? false,
          biomassScheme: editRow.biomassScheme ?? "",
          biomassUniqueBaleRef: editRow.biomassUniqueBaleRef ?? "",
          status: editRow.status ?? "in_stock",
          quantityRemaining: editRow.quantityRemaining ?? "",
          notes: editRow.notes ?? "",
        });
      } else {
        setForm(init);
      }
    }
  }, [open, editRow]);

  const moisture = num(form.moistureAtBaling);
  const risk = getMoistureRisk(moisture, form.baleFormat);

  const mut = useMutation({
    mutationFn: async (body: any) => {
      const url = isEdit
        ? `/api/farms/${farmId}/straw-bale-inventory/${editRow.id}`
        : `/api/farms/${farmId}/straw-bale-inventory`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-inventory", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-analytics", farmId] });
      toast({ title: isEdit ? "Batch updated" : "Batch added" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const submit = () => mut.mutate({
    batchRef: form.batchRef || null,
    strawType: form.strawType, baleFormat: form.baleFormat,
    harvestDate: form.harvestDate || null, fieldOfOrigin: form.fieldOfOrigin || null,
    cropVariety: form.cropVariety || null,
    quantityBales: num(form.quantityBales) ?? 0,
    baleWeightKg: form.baleWeightKg || null,
    moistureAtBaling: form.moistureAtBaling || null,
    moistureStatus: moisture != null ? risk.status : null,
    storageLocation: form.storageLocation || null, storageType: form.storageType,
    stackingStartDate: form.stackingStartDate || null,
    redTractorCertified: form.redTractorCertified,
    combinableCropsPassportRef: form.combinableCropsPassportRef || null,
    pppResidueRisk: form.pppResidueRisk, fusariumRiskAssessed: form.fusariumRiskAssessed,
    biomassContract: form.biomassContract,
    biomassScheme: form.biomassScheme || null,
    biomassUniqueBaleRef: form.biomassUniqueBaleRef || null,
    status: form.status, quantityRemaining: form.quantityRemaining ? num(form.quantityRemaining) : null,
    notes: form.notes || null,
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Add"} Straw Bale Batch</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 grid grid-cols-3 gap-4">
            <div><Label>Batch Reference</Label><Input placeholder="e.g. WS-2026-001" value={form.batchRef} onChange={e => f("batchRef")(e.target.value)} /></div>
            <div>
              <Label>Straw Type *</Label>
              <Select value={form.strawType} onValueChange={f("strawType")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STRAW_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bale Format *</Label>
              <Select value={form.baleFormat} onValueChange={f("baleFormat")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BALE_FORMATS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          <div><Label>Harvest Date</Label><Input type="date" value={form.harvestDate} onChange={e => f("harvestDate")(e.target.value)} /></div>
          <div><Label>Field of Origin</Label><Input placeholder="e.g. North Field" value={form.fieldOfOrigin} onChange={e => f("fieldOfOrigin")(e.target.value)} /></div>
          <div><Label>Crop Variety</Label><Input placeholder="e.g. Skyfall, Crusoe" value={form.cropVariety} onChange={e => f("cropVariety")(e.target.value)} /></div>
          <div><Label>Quantity (Bales) *</Label><Input type="number" min={0} value={form.quantityBales} onChange={e => f("quantityBales")(e.target.value)} /></div>
          <div><Label>Approx. Weight / Bale (kg)</Label><Input type="number" min={0} step={0.1} placeholder="e.g. 250" value={form.baleWeightKg} onChange={e => f("baleWeightKg")(e.target.value)} /></div>
          <div>
            <Label>Quantity Remaining</Label>
            <Input type="number" min={0} placeholder="If different from total" value={form.quantityRemaining} onChange={e => f("quantityRemaining")(e.target.value)} />
          </div>

          {/* Moisture — fire risk intelligence */}
          <div className="col-span-2">
            <Label>Moisture at Baling (%)</Label>
            <Input type="number" min={0} max={60} step={0.1} placeholder="%" value={form.moistureAtBaling} onChange={e => f("moistureAtBaling")(e.target.value)} />
            {moisture != null && (
              <div className={`mt-1.5 p-2 rounded text-xs flex gap-1.5 items-start ${risk.colour === "red" ? "bg-red-50 text-red-700" : risk.colour === "amber" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
                {risk.colour === "red" ? <AlertTriangle size={13} className="mt-0.5 shrink-0" /> : risk.colour === "amber" ? <AlertCircle size={13} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={13} className="mt-0.5 shrink-0" />}
                <span><strong>{risk.status}:</strong> {risk.message}</span>
              </div>
            )}
          </div>

          <div><Label>Storage Location</Label><Input placeholder="e.g. Barn 2, Home Farm" value={form.storageLocation} onChange={e => f("storageLocation")(e.target.value)} /></div>
          <div>
            <Label>Storage Type</Label>
            <Select value={form.storageType} onValueChange={f("storageType")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STORAGE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Stacking Start Date</Label><Input type="date" value={form.stackingStartDate} onChange={e => f("stackingStartDate")(e.target.value)} /></div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={f("status")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="in_stock">In Stock</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="used_on_farm">Used On-Farm</SelectItem>
                <SelectItem value="disposed">Disposed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Red Tractor */}
          <div className="col-span-2 border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Red Tractor / Compliance</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="rt" checked={form.redTractorCertified} onCheckedChange={v => f("redTractorCertified")(!!v)} />
                <Label htmlFor="rt" className="cursor-pointer">Red Tractor Certified</Label>
              </div>
              <div>
                <Label>Passport Ref</Label>
                <Input placeholder="Combinable Crops Passport ref" value={form.combinableCropsPassportRef} onChange={e => f("combinableCropsPassportRef")(e.target.value)} />
              </div>
              <div>
                <Label>PPP Residue Risk</Label>
                <Select value={form.pppResidueRisk} onValueChange={f("pppResidueRisk")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PPP_RISKS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="fus" checked={form.fusariumRiskAssessed} onCheckedChange={v => f("fusariumRiskAssessed")(!!v)} />
                <Label htmlFor="fus" className="cursor-pointer">Fusarium Risk Assessed</Label>
              </div>
            </div>
            {form.strawType === "Wheat Straw" && !form.fusariumRiskAssessed && (
              <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 flex gap-1.5">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                Red Tractor requires a Fusarium mycotoxin risk assessment for wheat straw.
              </p>
            )}
          </div>

          {/* Biomass Contract */}
          <div className="col-span-2 border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Biomass / Energy Contract</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="bmc" checked={form.biomassContract} onCheckedChange={v => f("biomassContract")(!!v)} />
                <Label htmlFor="bmc" className="cursor-pointer">Biomass Contract</Label>
              </div>
              {form.biomassContract && (
                <>
                  <div>
                    <Label>Scheme / Buyer</Label>
                    <Input placeholder="e.g. BECS, Drax, AD plant" value={form.biomassScheme} onChange={e => f("biomassScheme")(e.target.value)} />
                  </div>
                  <div>
                    <Label>Unique Bale Ref</Label>
                    <Input placeholder="Scheme reference" value={form.biomassUniqueBaleRef} onChange={e => f("biomassUniqueBaleRef")(e.target.value)} />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending}>{mut.isPending && <Loader2 size={14} className="mr-1 animate-spin" />}{isEdit ? "Save Changes" : "Add Batch"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sales Dialog ─────────────────────────────────────────────────────────────
function SalesDialog({ open, onClose, farmId, editRow, inventory }: { open: boolean; onClose: () => void; farmId: number; editRow?: any; inventory: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;

  const init = {
    baleInventoryId: "", invoiceRef: "", saleDate: today(), deliveryDate: "",
    strawType: "Wheat Straw", baleFormat: "Big Round", quantitySold: "", batchRef: "",
    intendedUse: "Animal Feed", pricePerBalePence: "", buyerName: "",
    buyerAddress: "", buyerPostcode: "", buyerPhone: "", buyerEmail: "",
    buyerType: "Farmer", transportedBy: "Buyer Collects", haulierName: "", vehicleReg: "",
    passportIssued: false, passportRef: "", paymentStatus: "unpaid", paymentDate: "", notes: "",
  };
  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  React.useEffect(() => {
    if (open) {
      if (editRow) {
        setForm({
          baleInventoryId: editRow.baleInventoryId ?? "",
          invoiceRef: editRow.invoiceRef ?? "", saleDate: editRow.saleDate ?? today(),
          deliveryDate: editRow.deliveryDate ?? "", strawType: editRow.strawType ?? "Wheat Straw",
          baleFormat: editRow.baleFormat ?? "Big Round", quantitySold: editRow.quantitySold ?? "",
          batchRef: editRow.batchRef ?? "", intendedUse: editRow.intendedUse ?? "Animal Feed",
          pricePerBalePence: editRow.pricePerBalePence ? (editRow.pricePerBalePence / 100).toFixed(2) : "",
          buyerName: editRow.buyerName ?? "", buyerAddress: editRow.buyerAddress ?? "",
          buyerPostcode: editRow.buyerPostcode ?? "", buyerPhone: editRow.buyerPhone ?? "",
          buyerEmail: editRow.buyerEmail ?? "", buyerType: editRow.buyerType ?? "Farmer",
          transportedBy: editRow.transportedBy ?? "Buyer Collects",
          haulierName: editRow.haulierName ?? "", vehicleReg: editRow.vehicleReg ?? "",
          passportIssued: editRow.passportIssued ?? false, passportRef: editRow.passportRef ?? "",
          paymentStatus: editRow.paymentStatus ?? "unpaid", paymentDate: editRow.paymentDate ?? "",
          notes: editRow.notes ?? "",
        });
      } else {
        setForm(init);
      }
    }
  }, [open, editRow]);

  // Auto-fill from inventory selection
  React.useEffect(() => {
    if (form.baleInventoryId) {
      const row = inventory.find((r: any) => r.id === Number(form.baleInventoryId));
      if (row) setForm(p => ({
        ...p, strawType: row.strawType ?? p.strawType,
        baleFormat: row.baleFormat ?? p.baleFormat,
        batchRef: row.batchRef ?? p.batchRef,
      }));
    }
  }, [form.baleInventoryId]);

  const vatInfo = deriveVatClassification(form.intendedUse);
  const qty = num(form.quantitySold) ?? 0;
  const pricePence = form.pricePerBalePence ? Math.round(Number(form.pricePerBalePence) * 100) : null;
  const totalPence = pricePence && qty ? pricePence * qty : null;
  const vatPence = vatInfo.rate === "20%" && totalPence ? Math.round(totalPence * 0.2) : null;

  const mut = useMutation({
    mutationFn: async (body: any) => {
      const url = isEdit
        ? `/api/farms/${farmId}/straw-sales/${editRow.id}`
        : `/api/farms/${farmId}/straw-sales`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-sales", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-analytics", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-inventory", farmId] });
      toast({ title: isEdit ? "Sale updated" : "Sale recorded" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const submit = () => mut.mutate({
    baleInventoryId: form.baleInventoryId ? num(form.baleInventoryId) : null,
    invoiceRef: form.invoiceRef || null, saleDate: form.saleDate,
    deliveryDate: form.deliveryDate || null, strawType: form.strawType,
    baleFormat: form.baleFormat, quantitySold: num(form.quantitySold) ?? 0,
    batchRef: form.batchRef || null, intendedUse: form.intendedUse,
    vatClassification: vatInfo.classification,
    pricePerBalePence: pricePence, totalValuePence: totalPence, vatAmountPence: vatPence,
    buyerName: form.buyerName, buyerAddress: form.buyerAddress || null,
    buyerPostcode: form.buyerPostcode || null, buyerPhone: form.buyerPhone || null,
    buyerEmail: form.buyerEmail || null, buyerType: form.buyerType || null,
    transportedBy: form.transportedBy || null, haulierName: form.haulierName || null,
    vehicleReg: form.vehicleReg || null, passportIssued: form.passportIssued,
    passportRef: form.passportRef || null, paymentStatus: form.paymentStatus,
    paymentDate: form.paymentDate || null, notes: form.notes || null,
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Record"} Straw Sale</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          {/* Link to batch */}
          <div className="col-span-2">
            <Label>Link to Bale Batch (optional)</Label>
            <Select value={form.baleInventoryId?.toString() ?? ""} onValueChange={f("baleInventoryId")}>
              <SelectTrigger><SelectValue placeholder="Select batch or leave blank" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not linked</SelectItem>
                {inventory.filter((r: any) => r.status === "in_stock").map((r: any) => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.batchRef || `Batch #${r.id}`} — {r.strawType} {r.baleFormat} ({r.quantityRemaining ?? r.quantityBales} remaining)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div><Label>Invoice Reference</Label><Input placeholder="INV-2026-001" value={form.invoiceRef} onChange={e => f("invoiceRef")(e.target.value)} /></div>
          <div><Label>Sale Date *</Label><Input type="date" value={form.saleDate} onChange={e => f("saleDate")(e.target.value)} /></div>
          <div><Label>Delivery Date</Label><Input type="date" value={form.deliveryDate} onChange={e => f("deliveryDate")(e.target.value)} /></div>
          <div>
            <Label>Straw Type *</Label>
            <Select value={form.strawType} onValueChange={f("strawType")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STRAW_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Bale Format *</Label>
            <Select value={form.baleFormat} onValueChange={f("baleFormat")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{BALE_FORMATS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Quantity Sold *</Label><Input type="number" min={1} value={form.quantitySold} onChange={e => f("quantitySold")(e.target.value)} /></div>
          <div><Label>Price per Bale (£)</Label><Input type="number" min={0} step={0.01} placeholder="0.00" value={form.pricePerBalePence} onChange={e => f("pricePerBalePence")(e.target.value)} /></div>

          {/* VAT intelligence block */}
          <div className="col-span-2">
            <Label>Intended Use *</Label>
            <Select value={form.intendedUse} onValueChange={f("intendedUse")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{INTENDED_USES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <div className={`mt-1.5 p-2 rounded text-xs flex gap-1.5 items-start ${vatInfo.rate === "0%" ? "bg-green-50 text-green-700" : vatInfo.rate === "20%" ? "bg-amber-50 text-amber-800" : "bg-gray-50 text-gray-600"}`}>
              {vatInfo.rate === "0%" ? <CheckCircle2 size={13} className="mt-0.5 shrink-0" /> : vatInfo.rate === "20%" ? <AlertTriangle size={13} className="mt-0.5 shrink-0" /> : <Info size={13} className="mt-0.5 shrink-0" />}
              <span><strong>VAT: {vatInfo.classification}</strong>{vatInfo.warning ? ` — ${vatInfo.warning}` : " — no VAT to charge."}</span>
            </div>
            {totalPence != null && (
              <div className="mt-1 grid grid-cols-3 gap-2 text-sm bg-gray-50 rounded p-2">
                <div><span className="text-gray-500 text-xs">Net Total</span><br /><strong>{pToGBP(totalPence)}</strong></div>
                <div><span className="text-gray-500 text-xs">VAT ({vatInfo.rate})</span><br /><strong>{pToGBP(vatPence ?? 0)}</strong></div>
                <div><span className="text-gray-500 text-xs">Gross Total</span><br /><strong>{pToGBP((totalPence ?? 0) + (vatPence ?? 0))}</strong></div>
              </div>
            )}
          </div>

          {/* Buyer — EC Reg 178/2002 traceability */}
          <div className="col-span-2 border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Buyer Details (Traceability — EC Reg 178/2002)</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Buyer Name *</Label><Input value={form.buyerName} onChange={e => f("buyerName")(e.target.value)} /></div>
              <div>
                <Label>Buyer Type</Label>
                <Select value={form.buyerType} onValueChange={f("buyerType")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{BUYER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Address</Label><Input value={form.buyerAddress} onChange={e => f("buyerAddress")(e.target.value)} /></div>
              <div><Label>Postcode</Label><Input value={form.buyerPostcode} onChange={e => f("buyerPostcode")(e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={form.buyerPhone} onChange={e => f("buyerPhone")(e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" value={form.buyerEmail} onChange={e => f("buyerEmail")(e.target.value)} /></div>
            </div>
            {form.buyerType === "Market Gardener" && (
              <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 flex gap-1.5">
                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                Sales to market gardeners are treated as horticultural use by HMRC — standard-rated at 20% VAT (per British Hay and Straw Merchants' Association agreement, HMRC VAT Notice 701/15).
              </p>
            )}
          </div>

          {/* Transport */}
          <div className="col-span-2 border-t pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Transport</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Transported By</Label>
                <Select value={form.transportedBy} onValueChange={f("transportedBy")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TRANSPORT_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {form.transportedBy === "Third-Party Haulier" && (
                <>
                  <div><Label>Haulier Name</Label><Input value={form.haulierName} onChange={e => f("haulierName")(e.target.value)} /></div>
                  <div><Label>Vehicle Reg</Label><Input value={form.vehicleReg} onChange={e => f("vehicleReg")(e.target.value)} /></div>
                </>
              )}
            </div>
          </div>

          {/* Red Tractor Passport */}
          <div className="col-span-2 grid grid-cols-2 gap-3 border-t pt-3">
            <div className="flex items-center gap-2 pt-1">
              <Checkbox id="passport" checked={form.passportIssued} onCheckedChange={v => f("passportIssued")(!!v)} />
              <Label htmlFor="passport" className="cursor-pointer">Combinable Crops Passport Issued</Label>
            </div>
            {form.passportIssued && <div><Label>Passport Reference</Label><Input value={form.passportRef} onChange={e => f("passportRef")(e.target.value)} /></div>}
          </div>

          {/* Payment */}
          <div>
            <Label>Payment Status</Label>
            <Select value={form.paymentStatus} onValueChange={f("paymentStatus")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PAYMENT_STATUSES.map(t => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {form.paymentStatus === "paid" && <div><Label>Payment Date</Label><Input type="date" value={form.paymentDate} onChange={e => f("paymentDate")(e.target.value)} /></div>}

          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending || !form.buyerName || !form.quantitySold}>
            {mut.isPending && <Loader2 size={14} className="mr-1 animate-spin" />}{isEdit ? "Save Changes" : "Record Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Moisture Check Dialog ─────────────────────────────────────────────────────
function MoistureDialog({ open, onClose, farmId, editRow, inventory }: { open: boolean; onClose: () => void; farmId: number; editRow?: any; inventory: any[] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const isEdit = !!editRow;

  const init = {
    baleInventoryId: "", batchRef: "", checkDate: today(), daysFromStacking: "",
    moisturePercent: "", temperatureCelsius: "", odourObserved: false, odourDescription: "",
    overallCondition: "Good", actionTaken: "", checkedBy: "", nextCheckDue: "", notes: "",
  };
  const [form, setForm] = useState<typeof init>(init);
  const f = (k: keyof typeof init) => (v: any) => setForm(p => ({ ...p, [k]: v }));

  React.useEffect(() => {
    if (open) {
      if (editRow) {
        setForm({
          baleInventoryId: editRow.baleInventoryId ?? "", batchRef: editRow.batchRef ?? "",
          checkDate: editRow.checkDate ?? today(), daysFromStacking: editRow.daysFromStacking ?? "",
          moisturePercent: editRow.moisturePercent ?? "", temperatureCelsius: editRow.temperatureCelsius ?? "",
          odourObserved: editRow.odourObserved ?? false, odourDescription: editRow.odourDescription ?? "",
          overallCondition: editRow.overallCondition ?? "Good", actionTaken: editRow.actionTaken ?? "",
          checkedBy: editRow.checkedBy ?? "", nextCheckDue: editRow.nextCheckDue ?? "", notes: editRow.notes ?? "",
        });
      } else { setForm(init); }
    }
  }, [open, editRow]);

  // Auto-fill batch ref from inventory selection
  React.useEffect(() => {
    if (form.baleInventoryId) {
      const row = inventory.find((r: any) => r.id === Number(form.baleInventoryId));
      if (row) {
        const days = row.stackingStartDate
          ? Math.floor((new Date(form.checkDate).getTime() - new Date(row.stackingStartDate).getTime()) / 86400000)
          : null;
        setForm(p => ({ ...p, batchRef: row.batchRef ?? p.batchRef, daysFromStacking: days != null ? String(days) : p.daysFromStacking }));
      }
    }
  }, [form.baleInventoryId, form.checkDate]);

  const m = num(form.moisturePercent);
  const selectedBatch = inventory.find((r: any) => r.id === Number(form.baleInventoryId));
  const risk = m != null && selectedBatch ? getMoistureRisk(m, selectedBatch.baleFormat) : null;
  const days = num(form.daysFromStacking);

  const mut = useMutation({
    mutationFn: async (body: any) => {
      const url = isEdit ? `/api/farms/${farmId}/straw-moisture-checks/${editRow.id}` : `/api/farms/${farmId}/straw-moisture-checks`;
      const r = await fetch(url, { method: isEdit ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!r.ok) throw new Error((await r.json()).error ?? "Failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["straw-moisture", farmId] });
      toast({ title: isEdit ? "Check updated" : "Check recorded" });
      onClose();
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const submit = () => mut.mutate({
    baleInventoryId: form.baleInventoryId ? num(form.baleInventoryId) : null,
    batchRef: form.batchRef || null, checkDate: form.checkDate,
    daysFromStacking: form.daysFromStacking ? num(form.daysFromStacking) : null,
    moisturePercent: form.moisturePercent || null, temperatureCelsius: form.temperatureCelsius || null,
    odourObserved: form.odourObserved, odourDescription: form.odourDescription || null,
    overallCondition: form.overallCondition, actionTaken: form.actionTaken || null,
    checkedBy: form.checkedBy || null, nextCheckDue: form.nextCheckDue || null, notes: form.notes || null,
  });

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEdit ? "Edit" : "Record"} Moisture / Condition Check</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>Bale Batch</Label>
            <Select value={form.baleInventoryId?.toString() ?? ""} onValueChange={f("baleInventoryId")}>
              <SelectTrigger><SelectValue placeholder="Select batch" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not linked</SelectItem>
                {inventory.map((r: any) => (
                  <SelectItem key={r.id} value={String(r.id)}>{r.batchRef || `Batch #${r.id}`} — {r.strawType} {r.baleFormat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Batch Ref</Label><Input value={form.batchRef} onChange={e => f("batchRef")(e.target.value)} /></div>
          <div><Label>Check Date *</Label><Input type="date" value={form.checkDate} onChange={e => f("checkDate")(e.target.value)} /></div>
          <div><Label>Days from Stacking</Label><Input type="number" min={0} value={form.daysFromStacking} onChange={e => f("daysFromStacking")(e.target.value)} /></div>
          {days != null && days <= 14 && (
            <div className="col-span-2 bg-amber-50 text-amber-800 text-xs rounded p-2 flex gap-1.5">
              <AlertCircle size={13} className="mt-0.5 shrink-0" />
              Day {days} from stacking — within the critical 14-day spontaneous combustion window. Daily monitoring recommended (HSE INDG125).
            </div>
          )}
          <div><Label>Moisture (%)</Label><Input type="number" min={0} max={60} step={0.1} value={form.moisturePercent} onChange={e => f("moisturePercent")(e.target.value)} /></div>
          <div><Label>Temperature (°C)</Label><Input type="number" min={0} max={100} step={0.1} value={form.temperatureCelsius} onChange={e => f("temperatureCelsius")(e.target.value)} /></div>
          {risk && (
            <div className={`col-span-2 text-xs rounded p-2 flex gap-1.5 ${risk.colour === "red" ? "bg-red-50 text-red-700" : risk.colour === "amber" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
              {risk.colour === "red" ? <AlertTriangle size={13} className="mt-0.5 shrink-0" /> : risk.colour === "amber" ? <AlertCircle size={13} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={13} className="mt-0.5 shrink-0" />}
              <span><strong>{risk.status}:</strong> {risk.message}</span>
            </div>
          )}
          {form.temperatureCelsius && Number(form.temperatureCelsius) > 50 && (
            <div className="col-span-2 bg-red-50 text-red-700 text-xs rounded p-2 flex gap-1.5">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              Temperature above 50°C indicates active heating. Risk of spontaneous combustion — take immediate action.
            </div>
          )}
          <div className="col-span-2 flex items-center gap-2">
            <Checkbox id="odour" checked={form.odourObserved} onCheckedChange={v => f("odourObserved")(!!v)} />
            <Label htmlFor="odour" className="cursor-pointer">Odour Observed (caramel / musty)</Label>
          </div>
          {form.odourObserved && (
            <div className="col-span-2">
              <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5 mb-2 flex gap-1.5">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                Caramel or musty odour indicates internal heating. Measuring moisture at this stage is too late — monitor temperature directly (HSE guidance).
              </p>
              <Input placeholder="Describe odour observed" value={form.odourDescription} onChange={e => f("odourDescription")(e.target.value)} />
            </div>
          )}
          <div className="col-span-2">
            <Label>Overall Condition</Label>
            <Select value={form.overallCondition} onValueChange={f("overallCondition")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CONDITION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Action Taken</Label><Input placeholder="e.g. Increased ventilation, moved bales" value={form.actionTaken} onChange={e => f("actionTaken")(e.target.value)} /></div>
          <div><Label>Checked By</Label><Input value={form.checkedBy} onChange={e => f("checkedBy")(e.target.value)} /></div>
          <div><Label>Next Check Due</Label><Input type="date" value={form.nextCheckDue} onChange={e => f("nextCheckDue")(e.target.value)} /></div>
          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => f("notes")(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={mut.isPending}>{mut.isPending && <Loader2 size={14} className="mr-1 animate-spin" />}{isEdit ? "Save" : "Record Check"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StrawManagementPage() {
  const { farmId: rawFarmId } = useAppStore();
  const farmId = rawFarmId!;
  const [tab, setTab] = useState<"inventory" | "sales" | "monitoring" | "analytics">("inventory");
  const [invDlg, setInvDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [saleDlg, setSaleDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [moistDlg, setMoistDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [deleting, setDeleting] = useState<number | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: inventory = [], isLoading: loadInv } = useQuery<any[]>({
    queryKey: ["straw-inventory", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-bale-inventory`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: sales = [], isLoading: loadSales } = useQuery<any[]>({
    queryKey: ["straw-sales", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-sales`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: moisture = [], isLoading: loadMoist } = useQuery<any[]>({
    queryKey: ["straw-moisture", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-moisture-checks`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const { data: analytics } = useQuery<any>({
    queryKey: ["straw-analytics", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/straw-analytics`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const delMut = useMutation({
    mutationFn: async ({ type, id }: { type: string; id: number }) => {
      const r = await fetch(`/api/farms/${farmId}/${type}/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Delete failed");
    },
    onSuccess: (_, { type }) => {
      if (type === "straw-bale-inventory") qc.invalidateQueries({ queryKey: ["straw-inventory", farmId] });
      if (type === "straw-sales") qc.invalidateQueries({ queryKey: ["straw-sales", farmId] });
      if (type === "straw-moisture-checks") qc.invalidateQueries({ queryKey: ["straw-moisture", farmId] });
      qc.invalidateQueries({ queryKey: ["straw-analytics", farmId] });
      toast({ title: "Deleted" });
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

  // Summary stats
  const totalBalesInStock = useMemo(() => inventory.filter((r: any) => r.status === "in_stock").reduce((s: number, r: any) => s + (r.quantityRemaining ?? r.quantityBales ?? 0), 0), [inventory]);
  const totalSalesValue = useMemo(() => sales.reduce((s: number, r: any) => s + (r.totalValuePence ?? 0), 0), [sales]);
  const actionRequired = useMemo(() => inventory.filter((r: any) => r.moistureStatus === "Action Required" || r.moistureStatus === "Warning").length, [inventory]);
  const unpaidSales = useMemo(() => sales.filter((r: any) => r.paymentStatus === "unpaid" || r.paymentStatus === "overdue").reduce((s: number, r: any) => s + (r.totalValuePence ?? 0), 0), [sales]);

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Wheat size={24} className="text-amber-600" /> Straw Management</h1>
            <p className="text-sm text-gray-500 mt-1">Bale inventory, commercial sales, VAT classification, and fire safety monitoring</p>
          </div>
          <div className="flex gap-2">
            {tab === "inventory" && <Button onClick={() => setInvDlg({ open: true })}><Plus size={15} className="mr-1" />Add Batch</Button>}
            {tab === "sales" && <Button onClick={() => setSaleDlg({ open: true })}><Plus size={15} className="mr-1" />Record Sale</Button>}
            {tab === "monitoring" && <Button onClick={() => setMoistDlg({ open: true })}><Plus size={15} className="mr-1" />Record Check</Button>}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-1"><Package size={16} className="text-amber-600" /><span className="text-xs text-gray-500 font-medium">Bales In Stock</span></div>
            <div className="text-2xl font-bold">{totalBalesInStock.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-1"><DollarSign size={16} className="text-green-600" /><span className="text-xs text-gray-500 font-medium">Total Sales (net)</span></div>
            <div className="text-2xl font-bold">{pToGBP(totalSalesValue)}</div>
          </div>
          <div className={`bg-white rounded-xl border p-4 ${actionRequired > 0 ? "border-amber-300" : ""}`}>
            <div className="flex items-center gap-2 mb-1"><AlertTriangle size={16} className={actionRequired > 0 ? "text-amber-600" : "text-gray-400"} /><span className="text-xs text-gray-500 font-medium">Fire Risk Alerts</span></div>
            <div className={`text-2xl font-bold ${actionRequired > 0 ? "text-amber-600" : ""}`}>{actionRequired}</div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 mb-1"><TrendingUp size={16} className="text-blue-600" /><span className="text-xs text-gray-500 font-medium">Outstanding Payments</span></div>
            <div className="text-2xl font-bold">{pToGBP(unpaidSales)}</div>
          </div>
        </div>

        {/* Tabs */}
        <TabBar className="mb-4">
          <TabButton active={tab === "inventory"} onClick={() => setTab("inventory")}><Package size={14} className="mr-1" />Inventory</TabButton>
          <TabButton active={tab === "sales"} onClick={() => setTab("sales")}><DollarSign size={14} className="mr-1" />Sales</TabButton>
          <TabButton active={tab === "monitoring"} onClick={() => setTab("monitoring")}><Thermometer size={14} className="mr-1" />Fire Safety</TabButton>
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}><BarChart3 size={14} className="mr-1" />Analytics</TabButton>
        </TabBar>

        {/* ── Inventory tab ── */}
        {tab === "inventory" && (
          <div className="bg-white rounded-xl border overflow-hidden">
            {loadInv ? <div className="p-8 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Loading…</div> : inventory.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Wheat size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No straw batches recorded</p>
                <p className="text-sm mt-1">Add your first bale batch to track inventory and fire safety.</p>
                <Button className="mt-4" onClick={() => setInvDlg({ open: true })}><Plus size={15} className="mr-1" />Add First Batch</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>{["Batch Ref", "Type", "Format", "Harvest Date", "Qty (Total)", "Remaining", "Moisture", "Storage", "Status", "RT", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {inventory.map((r: any) => {
                      const risk = getMoistureRisk(r.moistureAtBaling ? Number(r.moistureAtBaling) : null, r.baleFormat);
                      return (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs">{r.batchRef || <span className="text-gray-400">#{r.id}</span>}</td>
                          <td className="px-4 py-3">{r.strawType}</td>
                          <td className="px-4 py-3 text-gray-600">{r.baleFormat}</td>
                          <td className="px-4 py-3">{fmtDate(r.harvestDate)}</td>
                          <td className="px-4 py-3 font-semibold">{r.quantityBales?.toLocaleString()}</td>
                          <td className="px-4 py-3">{r.quantityRemaining ?? r.quantityBales}</td>
                          <td className="px-4 py-3">
                            {r.moistureAtBaling ? (
                              <span className={`text-xs font-medium ${risk.colour === "red" ? "text-red-600" : risk.colour === "amber" ? "text-amber-600" : "text-green-600"}`}>
                                {Number(r.moistureAtBaling).toFixed(1)}%
                                {risk.colour !== "green" && <AlertTriangle size={11} className="inline ml-1" />}
                              </span>
                            ) : <span className="text-gray-400">—</span>}
                          </td>
                          <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{r.storageLocation || "—"}</td>
                          <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-3">{r.redTractorCertified ? <span title="Red Tractor Certified"><ShieldCheck size={15} className="text-green-600" /></span> : <X size={14} className="text-gray-300" />}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setInvDlg({ open: true, row: r })} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil size={14} /></button>
                              <button onClick={() => { if (confirm("Delete this batch?")) delMut.mutate({ type: "straw-bale-inventory", id: r.id }); }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Sales tab ── */}
        {tab === "sales" && (
          <div className="bg-white rounded-xl border overflow-hidden">
            {loadSales ? <div className="p-8 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Loading…</div> : sales.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <DollarSign size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No straw sales recorded</p>
                <p className="text-sm mt-1">Record your first sale to track revenue, VAT, and buyer traceability.</p>
                <Button className="mt-4" onClick={() => setSaleDlg({ open: true })}><Plus size={15} className="mr-1" />Record First Sale</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>{["Invoice", "Date", "Type / Format", "Qty", "Buyer", "Use / VAT", "Net Value", "VAT", "Gross", "Transport", "Payment", "Passport", ""].map(h => <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {sales.map((r: any) => {
                      const vat = deriveVatClassification(r.intendedUse);
                      const gross = (r.totalValuePence ?? 0) + (r.vatAmountPence ?? 0);
                      return (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-3 py-3 font-mono text-xs">{r.invoiceRef || <span className="text-gray-400">—</span>}</td>
                          <td className="px-3 py-3">{fmtDate(r.saleDate)}</td>
                          <td className="px-3 py-3">{r.strawType}<br /><span className="text-xs text-gray-500">{r.baleFormat}</span></td>
                          <td className="px-3 py-3 font-semibold">{r.quantitySold}</td>
                          <td className="px-3 py-3 max-w-[140px]">
                            <div className="font-medium truncate">{r.buyerName}</div>
                            <div className="text-xs text-gray-500">{r.buyerType}</div>
                          </td>
                          <td className="px-3 py-3">
                            <div>{r.intendedUse}</div>
                            <span className={`text-xs font-semibold ${vat.rate === "0%" ? "text-green-700" : "text-amber-700"}`}>{vat.rate} VAT</span>
                          </td>
                          <td className="px-3 py-3">{pToGBP(r.totalValuePence)}</td>
                          <td className="px-3 py-3">{pToGBP(r.vatAmountPence)}</td>
                          <td className="px-3 py-3 font-semibold">{pToGBP(gross || r.totalValuePence)}</td>
                          <td className="px-3 py-3 text-xs text-gray-600">{r.transportedBy || "—"}</td>
                          <td className="px-3 py-3"><StatusBadge status={r.paymentStatus} /></td>
                          <td className="px-3 py-3">{r.passportIssued ? <span title={r.passportRef || "Passport issued"}><FileCheck size={15} className="text-green-600" /></span> : <X size={14} className="text-gray-300" />}</td>
                          <td className="px-3 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setSaleDlg({ open: true, row: r })} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil size={14} /></button>
                              <button onClick={() => { if (confirm("Delete this sale record?")) delMut.mutate({ type: "straw-sales", id: r.id }); }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Fire Safety / Monitoring tab ── */}
        {tab === "monitoring" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex gap-3">
              <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>HSE INDG125 — Fire Safety Monitoring</strong><br />
                Monitor straw bales for the first <strong>10–14 days</strong> from stacking (spontaneous combustion window). Safe moisture limits: <strong>≤22%</strong> for small rectangular bales, <strong>≤18%</strong> for large round or square. Record checks daily initially, then every 2–3 days. Caramel or musty odour indicates heating — monitor temperature directly at that stage.
              </div>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden">
              {loadMoist ? <div className="p-8 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto mb-2" />Loading…</div> : moisture.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Thermometer size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No monitoring checks recorded</p>
                  <Button className="mt-4" onClick={() => setMoistDlg({ open: true })}><Plus size={15} className="mr-1" />Record First Check</Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>{["Batch", "Date", "Day #", "Moisture", "Temp (°C)", "Odour", "Condition", "Action Taken", "Checked By", "Next Due", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y">
                      {moisture.map((r: any) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-xs">{r.batchRef || "—"}</td>
                          <td className="px-4 py-3">{fmtDate(r.checkDate)}</td>
                          <td className="px-4 py-3">
                            {r.daysFromStacking != null ? (
                              <span className={`${r.daysFromStacking <= 14 ? "font-semibold text-amber-700" : "text-gray-600"}`}>Day {r.daysFromStacking}</span>
                            ) : "—"}
                          </td>
                          <td className="px-4 py-3">{r.moisturePercent ? `${Number(r.moisturePercent).toFixed(1)}%` : "—"}</td>
                          <td className="px-4 py-3">{r.temperatureCelsius ? `${Number(r.temperatureCelsius).toFixed(1)}°C` : "—"}</td>
                          <td className="px-4 py-3">{r.odourObserved ? <span className="text-amber-600 font-medium text-xs">Yes</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                          <td className="px-4 py-3"><ConditionBadge cond={r.overallCondition} /></td>
                          <td className="px-4 py-3 max-w-[160px] truncate text-gray-600">{r.actionTaken || "—"}</td>
                          <td className="px-4 py-3 text-gray-600">{r.checkedBy || "—"}</td>
                          <td className="px-4 py-3">{fmtDate(r.nextCheckDue)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => setMoistDlg({ open: true, row: r })} className="p-1.5 rounded hover:bg-gray-100 text-gray-500"><Pencil size={14} /></button>
                              <button onClick={() => { if (confirm("Delete this check?")) delMut.mutate({ type: "straw-moisture-checks", id: r.id }); }} className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Analytics tab ── */}
        {tab === "analytics" && (
          <div className="space-y-6">
            {!analytics ? (
              <div className="p-8 text-center text-gray-400"><Loader2 size={24} className="animate-spin mx-auto" /></div>
            ) : (
              <>
                {/* Inventory by type */}
                {analytics.inventoryByType?.length > 0 && (
                  <div className="bg-white rounded-xl border p-5">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Package size={16} />Current Inventory by Straw Type</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={analytics.inventoryByType} margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="strawType" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v: any) => [`${v} bales`, "In Stock"]} />
                        <Bar dataKey="totalBales" fill="#d97706" radius={[4, 4, 0, 0]} name="Bales" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Sales by intended use (VAT) */}
                {analytics.salesByUse?.length > 0 && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border p-5">
                      <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><DollarSign size={16} />Sales Revenue by Intended Use (Net)</h3>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie data={analytics.salesByUse} dataKey="totalNetPence" nameKey="intendedUse" cx="50%" cy="50%" outerRadius={75} label={({ intendedUse, percent }: any) => `${intendedUse} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                            {analytics.salesByUse.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: number) => pToGBP(v)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl border p-5">
                      <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><Scale size={16} />VAT Summary</h3>
                      <div className="space-y-3">
                        {analytics.vatSummary?.map((v: any) => (
                          <div key={v.vatClassification} className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                            <div>
                              <div className="font-medium text-sm">{v.vatClassification}</div>
                              <div className="text-xs text-gray-500">{v.count} sale{v.count !== 1 ? "s" : ""}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">{pToGBP(v.totalNetPence)}</div>
                              <div className="text-xs text-gray-500">VAT: {pToGBP(v.totalVatPence)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Monthly sales trend */}
                {analytics.monthlySales?.length > 0 && (
                  <div className="bg-white rounded-xl border p-5">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2"><TrendingUp size={16} />Monthly Sales (Net Revenue)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={analytics.monthlySales} margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v: number) => `£${(v / 100).toFixed(0)}`} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => [pToGBP(v), "Net Revenue"]} />
                        <Line type="monotone" dataKey="totalPence" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Compliance summary */}
                <div className="bg-white rounded-xl border p-5">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><ShieldCheck size={16} />Compliance Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "RT Certified Batches", value: analytics.redTractorCount ?? 0, total: inventory.length, icon: <ShieldCheck size={16} className="text-green-600" /> },
                      { label: "Passports Issued", value: analytics.passportCount ?? 0, total: sales.length, icon: <FileCheck size={16} className="text-blue-600" /> },
                      { label: "Fusarium Assessed", value: analytics.fusariumCount ?? 0, total: inventory.filter((r: any) => r.strawType === "Wheat Straw").length, icon: <CheckCircle2 size={16} className="text-amber-600" /> },
                      { label: "Fire Risk Alerts", value: actionRequired, total: inventory.length, icon: <AlertTriangle size={16} className={actionRequired > 0 ? "text-red-600" : "text-gray-400"} /> },
                    ].map(c => (
                      <div key={c.label} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">{c.icon}<span className="text-xs text-gray-600 font-medium">{c.label}</span></div>
                        <div className="font-bold">{c.value}{c.total > 0 ? ` / ${c.total}` : ""}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <InventoryDialog open={invDlg.open} onClose={() => setInvDlg({ open: false })} farmId={farmId} editRow={invDlg.row} />
      <SalesDialog open={saleDlg.open} onClose={() => setSaleDlg({ open: false })} farmId={farmId} editRow={saleDlg.row} inventory={inventory} />
      <MoistureDialog open={moistDlg.open} onClose={() => setMoistDlg({ open: false })} farmId={farmId} editRow={moistDlg.row} inventory={inventory} />
    </AppLayout>
  );
}
