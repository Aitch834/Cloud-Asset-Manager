import React, { useState, useMemo } from "react";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Loader2, Pencil, Trash2, AlertTriangle,
  Leaf, ShieldCheck, FlaskConical, FileText,
  Eye, Info, Package, CheckCircle2, Clock, Grape,
  ChevronDown, ChevronUp, Wine, Beaker, Award, ClipboardList,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

function fmt(val: string | null | undefined): string {
  if (!val) return "—";
  return val;
}
function fmtDate(val: string | null | undefined): string {
  if (!val) return "—";
  try { return new Date(val).toLocaleDateString("en-GB"); } catch { return val; }
}
function fmtNum(val: number | null | undefined): string {
  if (val === null || val === undefined) return "—";
  return String(val);
}

type Tab = "block-conversion" | "input-log" | "copper-register" | "input-derogations" | "wine-production" | "certificates";

const TABS: { id: Tab; label: string }[] = [
  { id: "block-conversion", label: "Block Conversion" },
  { id: "input-log", label: "Organic Inputs" },
  { id: "copper-register", label: "Copper Register" },
  { id: "input-derogations", label: "Input Derogations" },
  { id: "wine-production", label: "Wine Production" },
  { id: "certificates", label: "Certificates" },
];

const BLOCK_STATUS_OPTIONS = ["in-conversion", "fully-organic", "suspended", "withdrawn"];
const INPUT_TYPE_OPTIONS = ["Fungicide", "Insecticide", "Fertiliser", "Growth Regulator", "Soil Amendment", "Biostimulant", "Other"];
const APPROVAL_STATUS_OPTIONS = ["permitted", "derogation", "not-permitted"];
const COPPER_UNIT_OPTIONS = ["kg/ha", "g/ha", "L/ha"];
const DEROGATION_STATUS_OPTIONS = ["pending", "approved", "refused", "withdrawn", "expired"];
const CORRESPONDENCE_TYPE_OPTIONS = ["Email", "Letter", "Phone Call", "Meeting", "Portal Submission", "Decision Notice", "Other"];
const DIRECTION_OPTIONS = ["outbound", "inbound"];
const CERT_TYPE_OPTIONS = ["Vineyard Organic Certificate", "Organic Wine Certificate", "In-Conversion Certificate", "Other"];
const CERT_STATUS_OPTIONS = ["active", "expired", "suspended", "withdrawn"];
const WINE_COLOUR_OPTIONS = ["Red", "White", "Rosé", "Sparkling", "Orange", "Other"];
const ADDITIVE_TYPE_OPTIONS = [
  "Sulphites / SO₂",
  "Fining Agent",
  "Stabiliser",
  "Acidifier",
  "Preservative",
  "Other",
];

// ─── Status Chips ─────────────────────────────────────────────────────────────

function BlockStatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    "in-conversion": "bg-amber-100 text-amber-800",
    "fully-organic": "bg-green-100 text-green-800",
    "suspended": "bg-red-100 text-red-800",
    "withdrawn": "bg-gray-100 text-gray-700",
  };
  const label: Record<string, string> = {
    "in-conversion": "In Conversion",
    "fully-organic": "Fully Organic",
    "suspended": "Suspended",
    "withdrawn": "Withdrawn",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {label[status] ?? status}
    </span>
  );
}

function ApprovalChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    "permitted": "bg-green-100 text-green-800",
    "derogation": "bg-amber-100 text-amber-800",
    "not-permitted": "bg-red-100 text-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status === "not-permitted" ? "Not Permitted" : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function DerogationStatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    "pending": "bg-amber-100 text-amber-800",
    "approved": "bg-green-100 text-green-800",
    "refused": "bg-red-100 text-red-800",
    "withdrawn": "bg-gray-100 text-gray-700",
    "expired": "bg-orange-100 text-orange-800",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function CertStatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    "active": "bg-green-100 text-green-800",
    "expired": "bg-red-100 text-red-800",
    "suspended": "bg-amber-100 text-amber-800",
    "withdrawn": "bg-gray-100 text-gray-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${map[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SO2Chip({ compliant }: { compliant: number }) {
  return compliant === 1
    ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Compliant</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Exceeds Limit</span>;
}

// ─── Block Conversion Tab ────────────────────────────────────────────────────

function BlockConversionTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<{ records: any[] }>({
    queryKey: ["org-vit-block-status", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/block-status`).then(r => r.json()),
  });

  const openAdd = () => { setForm({ status: "in-conversion" }); setShowAdd(true); };
  const openEdit = (r: any) => {
    setForm({
      blockName: r.blockName ?? "",
      certifyingBody: r.certifyingBody ?? "",
      status: r.status ?? "in-conversion",
      conversionStartDate: r.conversionStartDate ?? "",
      fullyOrganicDate: r.fullyOrganicDate ?? "",
      preConversionLandUse: r.preConversionLandUse ?? "",
      syntheticHistory: r.syntheticHistory ?? "",
      notes: r.notes ?? "",
    });
    setEditing(r);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/block-status/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/block-status`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-block-status", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => fetch(`/api/farms/${farmId}/organic-viticulture/block-status/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-block-status", farmId] }); setDeleting(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const records = data?.records ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Organic conversion register for each vineyard block — certifying body, conversion dates, and pre-conversion land-use history.</p>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Block</Button>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <strong>UK Organic Regs 2020:</strong> A 3-year conversion period applies to vineyard blocks. Records must be retained for at least 5 years. Certifying bodies include Soil Association and OF&G.
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No block conversion records yet. Add your first block above.</Card>
      ) : (
        <div className="space-y-3">
          {records.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">{r.blockName}</span>
                    <BlockStatusChip status={r.status} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mt-2">
                    <div><span className="text-gray-500">Certifying Body:</span> <span className="font-medium">{fmt(r.certifyingBody)}</span></div>
                    <div><span className="text-gray-500">Conversion Start:</span> <span className="font-medium">{fmtDate(r.conversionStartDate)}</span></div>
                    <div><span className="text-gray-500">Fully Organic:</span> <span className="font-medium">{fmtDate(r.fullyOrganicDate)}</span></div>
                    <div><span className="text-gray-500">Pre-conversion Use:</span> <span className="font-medium">{fmt(r.preConversionLandUse)}</span></div>
                  </div>
                  {r.syntheticHistory && <p className="text-sm text-gray-600 mt-1"><span className="text-gray-500">Synthetic History:</span> {r.syntheticHistory}</p>}
                  {r.notes && <p className="text-sm text-gray-500 mt-1">{r.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeleting(r)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Block Conversion Record" : "Add Block Conversion Record"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Block Name *</Label><Input value={form.blockName ?? ""} onChange={sf("blockName")} placeholder="e.g. North Slope" /></div>
            <div>
              <Label>Status</Label>
              <Select value={form.status ?? "in-conversion"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BLOCK_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Certifying Body</Label><Input value={form.certifyingBody ?? ""} onChange={sf("certifyingBody")} placeholder="e.g. Soil Association" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Conversion Start Date</Label><Input type="date" value={form.conversionStartDate ?? ""} onChange={sf("conversionStartDate")} /></div>
              <div><Label>Fully Organic Date</Label><Input type="date" value={form.fullyOrganicDate ?? ""} onChange={sf("fullyOrganicDate")} /></div>
            </div>
            <div><Label>Pre-conversion Land Use</Label><Input value={form.preConversionLandUse ?? ""} onChange={sf("preConversionLandUse")} placeholder="e.g. Conventional arable" /></div>
            <div><Label>Synthetic Input History</Label><Textarea value={form.syntheticHistory ?? ""} onChange={sf("syntheticHistory")} placeholder="Note any synthetic pesticide/fertiliser history relevant to conversion" rows={2} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.blockName || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Block Record</DialogTitle><DialogDescription>Remove <strong>{deleting?.blockName}</strong> from the conversion register? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Organic Inputs Log Tab ──────────────────────────────────────────────────

function InputLogTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<{ records: any[] }>({
    queryKey: ["org-vit-input-log", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/input-log`).then(r => r.json()),
  });

  const openAdd = () => { setForm({ approvalStatus: "permitted", vintageYear: String(new Date().getFullYear()) }); setShowAdd(true); };
  const openEdit = (r: any) => {
    setForm({
      blockName: r.blockName ?? "",
      productName: r.productName ?? "",
      inputType: r.inputType ?? "",
      supplier: r.supplier ?? "",
      dateApplied: r.dateApplied ?? "",
      quantity: r.quantity ?? "",
      unit: r.unit ?? "",
      areaHa: r.areaHa ?? "",
      vintageYear: r.vintageYear ? String(r.vintageYear) : "",
      approvalStatus: r.approvalStatus ?? "permitted",
      certifierApprovalRef: r.certifierApprovalRef ?? "",
      appliedBy: r.appliedBy ?? "",
      notes: r.notes ?? "",
    });
    setEditing(r);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/input-log/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/input-log`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-input-log", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => fetch(`/api/farms/${farmId}/organic-viticulture/input-log/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-input-log", farmId] }); setDeleting(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const records = data?.records ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Log all organic-approved inputs applied in the vineyard — copper, sulphur, plant preparations, fertilisers, and any inputs requiring certifier approval.</p>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Input</Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No input records yet.</Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-3 py-2 text-left font-medium text-gray-600">Date</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Product</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Type</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Block</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Quantity</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Approval</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Vintage</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">{fmtDate(r.dateApplied)}</td>
                  <td className="px-3 py-2 font-medium">{r.productName}</td>
                  <td className="px-3 py-2 text-gray-600">{fmt(r.inputType)}</td>
                  <td className="px-3 py-2 text-gray-600">{fmt(r.blockName)}</td>
                  <td className="px-3 py-2 text-gray-600">{r.quantity ? `${r.quantity} ${r.unit ?? ""}`.trim() : "—"}</td>
                  <td className="px-3 py-2"><ApprovalChip status={r.approvalStatus} /></td>
                  <td className="px-3 py-2 text-gray-600">{fmtNum(r.vintageYear)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeleting(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Input Record" : "Add Input Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Product Name *</Label><Input value={form.productName ?? ""} onChange={sf("productName")} placeholder="e.g. Bordeaux Mixture WP" /></div>
              <div>
                <Label>Input Type *</Label>
                <Select value={form.inputType ?? ""} onValueChange={v => setForm(f => ({ ...f, inputType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{INPUT_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date Applied *</Label><Input type="date" value={form.dateApplied ?? ""} onChange={sf("dateApplied")} /></div>
              <div><Label>Vintage Year</Label><Input type="number" value={form.vintageYear ?? ""} onChange={sf("vintageYear")} placeholder="e.g. 2025" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Block Name</Label><Input value={form.blockName ?? ""} onChange={sf("blockName")} placeholder="Block or whole vineyard" /></div>
              <div><Label>Area (ha)</Label><Input type="number" value={form.areaHa ?? ""} onChange={sf("areaHa")} placeholder="0.00" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity</Label><Input value={form.quantity ?? ""} onChange={sf("quantity")} placeholder="e.g. 3.0" /></div>
              <div><Label>Unit</Label><Input value={form.unit ?? ""} onChange={sf("unit")} placeholder="e.g. kg/ha" /></div>
            </div>
            <div><Label>Supplier</Label><Input value={form.supplier ?? ""} onChange={sf("supplier")} /></div>
            <div>
              <Label>Approval Status</Label>
              <Select value={form.approvalStatus ?? "permitted"} onValueChange={v => setForm(f => ({ ...f, approvalStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{APPROVAL_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Certifier Approval Ref</Label><Input value={form.certifierApprovalRef ?? ""} onChange={sf("certifierApprovalRef")} placeholder="Reference if certifier pre-approval was required" /></div>
            <div><Label>Applied By</Label><Input value={form.appliedBy ?? ""} onChange={sf("appliedBy")} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.productName || !form.inputType || !form.dateApplied || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Input Record</DialogTitle><DialogDescription>Remove <strong>{deleting?.productName}</strong>? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Copper Register Tab ─────────────────────────────────────────────────────

function CopperRegisterTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<{ records: any[] }>({
    queryKey: ["org-vit-copper-log", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/copper-log`).then(r => r.json()),
  });

  const openAdd = () => { setForm({ quantityUnit: "kg/ha" }); setShowAdd(true); };
  const openEdit = (r: any) => {
    setForm({
      blockName: r.blockName ?? "",
      applicationDate: r.applicationDate ?? "",
      productName: r.productName ?? "",
      copperContent: r.copperContent ?? "",
      quantityApplied: r.quantityApplied ?? "",
      quantityUnit: r.quantityUnit ?? "kg/ha",
      areaHa: r.areaHa ?? "",
      copperKgApplied: r.copperKgApplied ?? "",
      applicationMethod: r.applicationMethod ?? "",
      operatorName: r.operatorName ?? "",
      notes: r.notes ?? "",
    });
    setEditing(r);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/copper-log/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/copper-log`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-copper-log", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => fetch(`/api/farms/${farmId}/organic-viticulture/copper-log/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-copper-log", farmId] }); setDeleting(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const records = data?.records ?? [];

  // Running total of copper kg applied
  const totalCopperKg = useMemo(() => {
    return records.reduce((sum, r) => {
      const v = parseFloat(r.copperKgApplied ?? "0");
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
  }, [records]);

  const LIMIT_7YR = 28;
  const limitPct = Math.min((totalCopperKg / LIMIT_7YR) * 100, 100);
  const limitColour = limitPct >= 90 ? "bg-red-500" : limitPct >= 70 ? "bg-amber-500" : "bg-green-500";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Running register of all copper-based fungicide applications. UK Organic Regs 2020 cap copper at 28 kg/ha over any 7-year period (equivalent to 4 kg/ha/year average).</p>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Application</Button>
      </div>

      {/* 7-year running total widget */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Recorded copper applied (all records)</span>
          <span className={`text-sm font-bold ${limitPct >= 90 ? "text-red-600" : limitPct >= 70 ? "text-amber-600" : "text-green-700"}`}>
            {totalCopperKg.toFixed(2)} kg/ha of 28 kg/ha limit
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-2 rounded-full transition-all ${limitColour}`} style={{ width: `${limitPct}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-1">This total covers all records in your register. Filter by block and 7-year rolling window in your certifier audit report.</p>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No copper applications recorded yet.</Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-3 py-2 text-left font-medium text-gray-600">Date</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Product</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Block</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Area (ha)</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Cu Applied (kg)</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Method</th>
                <th className="px-3 py-2 text-left font-medium text-gray-600">Operator</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap">{fmtDate(r.applicationDate)}</td>
                  <td className="px-3 py-2 font-medium">{r.productName}</td>
                  <td className="px-3 py-2 text-gray-600">{fmt(r.blockName)}</td>
                  <td className="px-3 py-2 text-gray-600">{fmt(r.areaHa)}</td>
                  <td className="px-3 py-2 font-medium">{fmt(r.copperKgApplied)}</td>
                  <td className="px-3 py-2 text-gray-600">{fmt(r.applicationMethod)}</td>
                  <td className="px-3 py-2 text-gray-600">{fmt(r.operatorName)}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeleting(r)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Copper Application" : "Add Copper Application"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Application Date *</Label><Input type="date" value={form.applicationDate ?? ""} onChange={sf("applicationDate")} /></div>
              <div><Label>Product Name *</Label><Input value={form.productName ?? ""} onChange={sf("productName")} placeholder="e.g. Bordeaux Mixture 20WG" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Block Name</Label><Input value={form.blockName ?? ""} onChange={sf("blockName")} placeholder="Whole vineyard or specific block" /></div>
              <div><Label>Area Applied (ha)</Label><Input type="number" value={form.areaHa ?? ""} onChange={sf("areaHa")} placeholder="0.00" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Copper Content (%)</Label><Input value={form.copperContent ?? ""} onChange={sf("copperContent")} placeholder="e.g. 20" /></div>
              <div><Label>Quantity Applied</Label><Input value={form.quantityApplied ?? ""} onChange={sf("quantityApplied")} placeholder="Amount applied" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Unit</Label>
                <Select value={form.quantityUnit ?? "kg/ha"} onValueChange={v => setForm(f => ({ ...f, quantityUnit: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COPPER_UNIT_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Copper kg Applied *</Label><Input type="number" value={form.copperKgApplied ?? ""} onChange={sf("copperKgApplied")} placeholder="Actual kg Cu applied" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Application Method</Label><Input value={form.applicationMethod ?? ""} onChange={sf("applicationMethod")} placeholder="e.g. Tractor sprayer" /></div>
              <div><Label>Operator</Label><Input value={form.operatorName ?? ""} onChange={sf("operatorName")} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.applicationDate || !form.productName || !form.copperKgApplied || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Copper Application</DialogTitle><DialogDescription>Remove <strong>{deleting?.productName}</strong> on {fmtDate(deleting?.applicationDate)}? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Input Derogations Tab ────────────────────────────────────────────────────

type DerogCase = {
  id: number; farmId: number; inputName: string; inputType: string;
  regulatoryBasis?: string | null; certifier?: string | null; certifierRef?: string | null;
  availabilitySearchDate?: string | null; availabilitySearchRef?: string | null;
  applicationDate?: string | null; decisionDate?: string | null;
  status: string; approvalConditions?: string | null; expiryDate?: string | null;
  vintageYear?: number | null; justification?: string | null; notes?: string | null;
  createdAt: string;
};

type CorrespondenceItem = {
  id: number; derogationId: number; correspondenceDate: string;
  direction: string; correspondenceType: string; summary: string;
  reference?: string | null; notes?: string | null;
};

function InputDerogationsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<DerogCase | null>(null);
  const [deleting, setDeleting] = useState<DerogCase | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<{ title: string; description: string; dueDate?: string } | null>(null);

  // Correspondence
  const [showAddCorr, setShowAddCorr] = useState(false);
  const [editingCorr, setEditingCorr] = useState<CorrespondenceItem | null>(null);
  const [deletingCorr, setDeletingCorr] = useState<CorrespondenceItem | null>(null);
  const [corrForm, setCorrForm] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<{ cases: DerogCase[] }>({
    queryKey: ["org-vit-derogations", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/input-derogations`).then(r => r.json()),
  });

  const { data: corrData } = useQuery<{ items: CorrespondenceItem[] }>({
    queryKey: ["org-vit-derog-corr", farmId, expandedId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/input-derogations/${expandedId}/correspondence`).then(r => r.json()),
    enabled: expandedId !== null,
  });

  const openAdd = () => { setForm({ status: "pending", vintageYear: String(new Date().getFullYear()) }); setShowAdd(true); };
  const openEdit = (c: DerogCase) => {
    setForm({
      inputName: c.inputName ?? "",
      inputType: c.inputType ?? "",
      regulatoryBasis: c.regulatoryBasis ?? "",
      certifier: c.certifier ?? "",
      certifierRef: c.certifierRef ?? "",
      availabilitySearchDate: c.availabilitySearchDate ?? "",
      availabilitySearchRef: c.availabilitySearchRef ?? "",
      applicationDate: c.applicationDate ?? "",
      decisionDate: c.decisionDate ?? "",
      status: c.status ?? "pending",
      approvalConditions: c.approvalConditions ?? "",
      expiryDate: c.expiryDate ?? "",
      vintageYear: c.vintageYear ? String(c.vintageYear) : "",
      justification: c.justification ?? "",
      notes: c.notes ?? "",
    });
    setEditing(c);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/input-derogations/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/input-derogations`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-derogations", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => fetch(`/api/farms/${farmId}/organic-viticulture/input-derogations/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-derogations", farmId] }); setDeleting(null); if (expandedId === deleting?.id) setExpandedId(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  // Correspondence mutations
  const saveCorr = useMutation({
    mutationFn: async () => {
      if (!expandedId) return;
      const url = editingCorr
        ? `/api/farms/${farmId}/organic-viticulture/input-derogation-correspondence/${editingCorr.id}`
        : `/api/farms/${farmId}/organic-viticulture/input-derogations/${expandedId}/correspondence`;
      const method = editingCorr ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(corrForm) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-derog-corr", farmId, expandedId] }); setShowAddCorr(false); setEditingCorr(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving correspondence", variant: "destructive" }),
  });

  const deleteCorr = useMutation({
    mutationFn: async (id: number) => fetch(`/api/farms/${farmId}/organic-viticulture/input-derogation-correspondence/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-derog-corr", farmId, expandedId] }); setDeletingCorr(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting correspondence", variant: "destructive" }),
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const csf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setCorrForm(f => ({ ...f, [k]: e.target.value }));

  const openAddCorr = () => { setCorrForm({ direction: "outbound", correspondenceDate: new Date().toISOString().slice(0, 10) }); setShowAddCorr(true); };
  const openEditCorr = (c: CorrespondenceItem) => {
    setCorrForm({ correspondenceDate: c.correspondenceDate, direction: c.direction, correspondenceType: c.correspondenceType, summary: c.summary, reference: c.reference ?? "", notes: c.notes ?? "" });
    setEditingCorr(c);
  };

  const cases = data?.cases ?? [];
  const corrItems = corrData?.items ?? [];

  // Expiry urgency
  function expiryBadge(expiry: string | null | undefined) {
    if (!expiry) return null;
    const d = new Date(expiry);
    const now = new Date();
    const daysLeft = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    if (daysLeft < 0) return <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium">Expired</span>;
    if (daysLeft <= 30) return <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-medium">Expires in {daysLeft}d</span>;
    if (daysLeft <= 90) return <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">Expires in {daysLeft}d</span>;
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Manage UK Organic Regs 2020 Sch. 1 / Annex II input derogation cases — availability searches, certifier correspondence, and decisions.</p>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />New Case</Button>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
        <strong>Derogation requirement:</strong> Where an approved organic input is not available in sufficient quantity, farmers may apply to their certifying body for a time-limited derogation to use a non-organic equivalent. An availability search must be completed and documented before application.
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : cases.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No derogation cases yet.</Card>
      ) : (
        <div className="space-y-3">
          {cases.map((c) => {
            const isOpen = expandedId === c.id;
            return (
              <Card key={c.id} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900">{c.inputName}</span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{c.inputType}</span>
                        <DerogationStatusChip status={c.status} />
                        {expiryBadge(c.expiryDate)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mt-2">
                        <div><span className="text-gray-500">Certifier:</span> <span className="font-medium">{fmt(c.certifier)}</span></div>
                        <div><span className="text-gray-500">Cert. Ref:</span> <span className="font-medium">{fmt(c.certifierRef)}</span></div>
                        <div><span className="text-gray-500">Applied:</span> <span className="font-medium">{fmtDate(c.applicationDate)}</span></div>
                        <div><span className="text-gray-500">Decision:</span> <span className="font-medium">{fmtDate(c.decisionDate)}</span></div>
                        <div><span className="text-gray-500">Expiry:</span> <span className="font-medium">{fmtDate(c.expiryDate)}</span></div>
                        <div><span className="text-gray-500">Vintage:</span> <span className="font-medium">{fmtNum(c.vintageYear)}</span></div>
                      </div>
                      {c.regulatoryBasis && <p className="text-xs text-gray-500 mt-1"><span className="font-medium">Regulatory basis:</span> {c.regulatoryBasis}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {c.expiryDate && (
                        <Button variant="ghost" size="icon" title="Raise task" onClick={e => { e.stopPropagation(); setRaiseTaskFor({ title: `Organic Viticulture Derogation Expiring — ${c.inputName}`, description: `The derogation approval for '${c.inputName}' is due to expire. Renew or confirm with your certifying body.`, dueDate: c.expiryDate ?? undefined }); }}>
                          <ClipboardList className="h-4 w-4 text-amber-600" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeleting(c)}><Trash2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setExpandedId(isOpen ? null : c.id)}>
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t bg-gray-50 p-4 space-y-4">
                    {c.availabilitySearchRef && (
                      <div className="text-sm"><span className="font-medium text-gray-700">Availability Search Ref:</span> {c.availabilitySearchRef} {c.availabilitySearchDate ? `(${fmtDate(c.availabilitySearchDate)})` : ""}</div>
                    )}
                    {c.justification && (
                      <div className="text-sm"><span className="font-medium text-gray-700">Justification:</span> <span className="text-gray-600">{c.justification}</span></div>
                    )}
                    {c.approvalConditions && (
                      <div className="text-sm"><span className="font-medium text-gray-700">Approval Conditions:</span> <span className="text-gray-600">{c.approvalConditions}</span></div>
                    )}
                    {c.notes && (
                      <div className="text-sm text-gray-500">{c.notes}</div>
                    )}

                    {/* Correspondence Log */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">Correspondence Log</h4>
                        <Button size="sm" variant="outline" onClick={openAddCorr}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
                      </div>
                      {corrItems.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No correspondence recorded.</p>
                      ) : (
                        <div className="space-y-2">
                          {corrItems.map((ci) => (
                            <div key={ci.id} className="bg-white border rounded p-3 flex items-start justify-between gap-2">
                              <div className="text-sm flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <span className="font-medium text-gray-800">{fmtDate(ci.correspondenceDate)}</span>
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{ci.direction}</span>
                                  <span className="text-xs text-gray-500">{ci.correspondenceType}</span>
                                </div>
                                <p className="text-gray-700">{ci.summary}</p>
                                {ci.reference && <p className="text-xs text-gray-500 mt-0.5">Ref: {ci.reference}</p>}
                                {ci.notes && <p className="text-xs text-gray-400">{ci.notes}</p>}
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="icon" onClick={() => openEditCorr(ci)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeletingCorr(ci)}><Trash2 className="h-3.5 w-3.5" /></Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Case Dialog */}
      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Derogation Case" : "New Derogation Case"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Input Name *</Label><Input value={form.inputName ?? ""} onChange={sf("inputName")} placeholder="e.g. Copper Hydroxide WP" /></div>
              <div>
                <Label>Input Type *</Label>
                <Select value={form.inputType ?? ""} onValueChange={v => setForm(f => ({ ...f, inputType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{INPUT_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Regulatory Basis</Label><Input value={form.regulatoryBasis ?? ""} onChange={sf("regulatoryBasis")} placeholder="e.g. UK Organic Regs 2020, Sch. 1 Part B" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Certifier</Label><Input value={form.certifier ?? ""} onChange={sf("certifier")} placeholder="e.g. Soil Association" /></div>
              <div><Label>Certifier Reference</Label><Input value={form.certifierRef ?? ""} onChange={sf("certifierRef")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Availability Search Date</Label><Input type="date" value={form.availabilitySearchDate ?? ""} onChange={sf("availabilitySearchDate")} /></div>
              <div><Label>Availability Search Ref</Label><Input value={form.availabilitySearchRef ?? ""} onChange={sf("availabilitySearchRef")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Application Date</Label><Input type="date" value={form.applicationDate ?? ""} onChange={sf("applicationDate")} /></div>
              <div><Label>Decision Date</Label><Input type="date" value={form.decisionDate ?? ""} onChange={sf("decisionDate")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status ?? "pending"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DEROGATION_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate ?? ""} onChange={sf("expiryDate")} /></div>
            </div>
            <div><Label>Vintage Year</Label><Input type="number" value={form.vintageYear ?? ""} onChange={sf("vintageYear")} placeholder="e.g. 2025" /></div>
            <div><Label>Justification</Label><Textarea value={form.justification ?? ""} onChange={sf("justification")} placeholder="Why the organic alternative was unavailable" rows={3} /></div>
            <div><Label>Approval Conditions</Label><Textarea value={form.approvalConditions ?? ""} onChange={sf("approvalConditions")} rows={2} /></div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.inputName || !form.inputType || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Correspondence Dialog */}
      <Dialog open={showAddCorr || !!editingCorr} onOpenChange={() => { setShowAddCorr(false); setEditingCorr(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingCorr ? "Edit Correspondence" : "Add Correspondence"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Date *</Label><Input type="date" value={corrForm.correspondenceDate ?? ""} onChange={csf("correspondenceDate")} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Direction</Label>
                <Select value={corrForm.direction ?? "outbound"} onValueChange={v => setCorrForm(f => ({ ...f, direction: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIRECTION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type *</Label>
                <Select value={corrForm.correspondenceType ?? ""} onValueChange={v => setCorrForm(f => ({ ...f, correspondenceType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{CORRESPONDENCE_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Summary *</Label><Textarea value={corrForm.summary ?? ""} onChange={csf("summary")} rows={2} placeholder="Brief summary of the correspondence" /></div>
            <div><Label>Reference</Label><Input value={corrForm.reference ?? ""} onChange={csf("reference")} placeholder="Letter/email reference" /></div>
            <div><Label>Notes</Label><Textarea value={corrForm.notes ?? ""} onChange={csf("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddCorr(false); setEditingCorr(null); }}>Cancel</Button>
            <Button onClick={() => saveCorr.mutate()} disabled={!corrForm.correspondenceDate || !corrForm.correspondenceType || !corrForm.summary || saveCorr.isPending}>
              {saveCorr.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Case Dialog */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Derogation Case</DialogTitle><DialogDescription>Remove the derogation case for <strong>{deleting?.inputName}</strong>? All correspondence will also be deleted. This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting!.id)} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Correspondence Dialog */}
      <Dialog open={!!deletingCorr} onOpenChange={() => setDeletingCorr(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Correspondence</DialogTitle><DialogDescription>Remove this correspondence entry? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingCorr(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteCorr.mutate(deletingCorr!.id)} disabled={deleteCorr.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          defaultTitle={raiseTaskFor.title}
          defaultDescription={raiseTaskFor.description}
          defaultDueDate={raiseTaskFor.dueDate}
          taskType="compliance_fix"
          module="Organic Viticulture"
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
        />
      )}
    </div>
  );
}

// ─── Wine Production Tab ──────────────────────────────────────────────────────

function WineProductionTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<{ records: any[] }>({
    queryKey: ["org-vit-wine", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/wine-production`).then(r => r.json()),
  });

  const openAdd = () => {
    setForm({ vintageYear: String(new Date().getFullYear()), certifiedOrganic: "1", so2Compliant: "1" });
    setShowAdd(true);
  };
  const openEdit = (r: any) => {
    setForm({
      vintageYear: r.vintageYear ? String(r.vintageYear) : "",
      wineColour: r.wineColour ?? "",
      volumeLitres: r.volumeLitres ?? "",
      certifiedOrganic: r.certifiedOrganic != null ? String(r.certifiedOrganic) : "1",
      certifierRef: r.certifierRef ?? "",
      additiveName: r.additiveName ?? "",
      additiveType: r.additiveType ?? "",
      quantityUsed: r.quantityUsed ?? "",
      quantityUnit: r.quantityUnit ?? "",
      maxPermittedLevel: r.maxPermittedLevel ?? "",
      actualSO2MgL: r.actualSO2MgL ?? "",
      maxSO2MgL: r.maxSO2MgL ?? "",
      so2Compliant: r.so2Compliant != null ? String(r.so2Compliant) : "1",
      regulatoryBasis: r.regulatoryBasis ?? "",
      notes: r.notes ?? "",
    });
    setEditing(r);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/wine-production/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/wine-production`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-wine", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => fetch(`/api/farms/${farmId}/organic-viticulture/wine-production/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-wine", farmId] }); setDeleting(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const records = data?.records ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Record organic wine production additive use and SO₂ compliance per vintage. UK-retained EU Reg 203/2012 sets SO₂ limits: 100 mg/L red, 150 mg/L white/rosé.</p>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Record</Button>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-900">
        <strong>SO₂ limits for organic wine (UK-retained Reg 203/2012):</strong> Red wine — 100 mg/L total SO₂. White and rosé wine — 150 mg/L. These limits are lower than for conventional wine. Sparkling and sweet wine may have higher permitted levels — check your certifier guidance.
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No wine production records yet.</Card>
      ) : (
        <div className="space-y-3">
          {records.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">Vintage {r.vintageYear}</span>
                    {r.wineColour && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{r.wineColour}</span>}
                    {r.certifiedOrganic === 1 || r.certifiedOrganic === "1"
                      ? <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">Certified Organic</span>
                      : <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Not Certified</span>}
                    <SO2Chip compliant={Number(r.so2Compliant)} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mt-2">
                    <div><span className="text-gray-500">Volume:</span> <span className="font-medium">{r.volumeLitres ? `${r.volumeLitres} L` : "—"}</span></div>
                    <div><span className="text-gray-500">Additive:</span> <span className="font-medium">{fmt(r.additiveName)}</span></div>
                    <div><span className="text-gray-500">Type:</span> <span className="font-medium">{fmt(r.additiveType)}</span></div>
                    <div><span className="text-gray-500">Quantity Used:</span> <span className="font-medium">{r.quantityUsed ? `${r.quantityUsed} ${r.quantityUnit ?? ""}`.trim() : "—"}</span></div>
                    <div><span className="text-gray-500">Actual SO₂:</span> <span className="font-medium">{r.actualSO2MgL ? `${r.actualSO2MgL} mg/L` : "—"}</span></div>
                    <div><span className="text-gray-500">Max SO₂ Permitted:</span> <span className="font-medium">{r.maxSO2MgL ? `${r.maxSO2MgL} mg/L` : "—"}</span></div>
                  </div>
                  {r.certifierRef && <p className="text-xs text-gray-500 mt-1">Certifier Ref: {r.certifierRef}</p>}
                  {r.regulatoryBasis && <p className="text-xs text-gray-500 mt-0.5">Regulatory basis: {r.regulatoryBasis}</p>}
                  {r.notes && <p className="text-sm text-gray-500 mt-1">{r.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Wine Production Record" : "Add Wine Production Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vintage Year *</Label><Input type="number" value={form.vintageYear ?? ""} onChange={sf("vintageYear")} placeholder="e.g. 2024" /></div>
              <div>
                <Label>Wine Colour</Label>
                <Select value={form.wineColour ?? ""} onValueChange={v => setForm(f => ({ ...f, wineColour: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{WINE_COLOUR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Volume (Litres)</Label><Input type="number" value={form.volumeLitres ?? ""} onChange={sf("volumeLitres")} placeholder="Total production" /></div>
              <div>
                <Label>Certified Organic?</Label>
                <Select value={form.certifiedOrganic ?? "1"} onValueChange={v => setForm(f => ({ ...f, certifiedOrganic: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="1">Yes</SelectItem><SelectItem value="0">No</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Certifier Reference</Label><Input value={form.certifierRef ?? ""} onChange={sf("certifierRef")} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Additive Name</Label><Input value={form.additiveName ?? ""} onChange={sf("additiveName")} placeholder="e.g. Potassium Metabisulphite" /></div>
              <div>
                <Label>Additive Type</Label>
                <Select value={form.additiveType ?? ""} onValueChange={v => setForm(f => ({ ...f, additiveType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{ADDITIVE_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity Used</Label><Input value={form.quantityUsed ?? ""} onChange={sf("quantityUsed")} /></div>
              <div><Label>Unit</Label><Input value={form.quantityUnit ?? ""} onChange={sf("quantityUnit")} placeholder="e.g. g/hL" /></div>
            </div>
            <div><Label>Max Permitted Level</Label><Input value={form.maxPermittedLevel ?? ""} onChange={sf("maxPermittedLevel")} placeholder="e.g. 50 g/hL" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Actual SO₂ (mg/L)</Label><Input type="number" value={form.actualSO2MgL ?? ""} onChange={sf("actualSO2MgL")} /></div>
              <div><Label>Max SO₂ Permitted (mg/L)</Label><Input type="number" value={form.maxSO2MgL ?? ""} onChange={sf("maxSO2MgL")} placeholder="100 or 150" /></div>
            </div>
            <div>
              <Label>SO₂ Compliant?</Label>
              <Select value={form.so2Compliant ?? "1"} onValueChange={v => setForm(f => ({ ...f, so2Compliant: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="1">Yes — within limit</SelectItem><SelectItem value="0">No — exceeds limit</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Regulatory Basis</Label><Input value={form.regulatoryBasis ?? ""} onChange={sf("regulatoryBasis")} placeholder="e.g. UK-retained EU Reg 203/2012" /></div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.vintageYear || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Wine Production Record</DialogTitle><DialogDescription>Remove the record for vintage <strong>{deleting?.vintageYear}</strong>? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Certificates Tab ─────────────────────────────────────────────────────────

function CertificatesTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [raiseTaskFor, setRaiseTaskFor] = useState<{ title: string; description: string; dueDate?: string } | null>(null);

  const { data, isLoading } = useQuery<{ records: any[] }>({
    queryKey: ["org-vit-certs", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/certificates`).then(r => r.json()),
  });

  const openAdd = () => { setForm({ status: "active" }); setShowAdd(true); };
  const openEdit = (r: any) => {
    setForm({
      certifyingBody: r.certifyingBody ?? "",
      certificateNumber: r.certificateNumber ?? "",
      certificateType: r.certificateType ?? "",
      issueDate: r.issueDate ?? "",
      expiryDate: r.expiryDate ?? "",
      scope: r.scope ?? "",
      status: r.status ?? "active",
      notes: r.notes ?? "",
    });
    setEditing(r);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/certificates/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/certificates`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-certs", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => fetch(`/api/farms/${farmId}/organic-viticulture/certificates/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-certs", farmId] }); setDeleting(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const records = data?.records ?? [];

  function expiryBadge(expiry: string | null | undefined) {
    if (!expiry) return null;
    const d = new Date(expiry);
    const now = new Date();
    const daysLeft = Math.ceil((d.getTime() - now.getTime()) / 86400000);
    if (daysLeft < 0) return <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded font-medium">Expired</span>;
    if (daysLeft <= 30) return <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded font-medium">Expires in {daysLeft}d</span>;
    if (daysLeft <= 90) return <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">Expires in {daysLeft}d</span>;
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Store organic viticulture and wine certificates issued by your certifying body.</p>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Certificate</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">No certificates stored yet.</Card>
      ) : (
        <div className="space-y-3">
          {records.map((r: any) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">{r.certifyingBody}</span>
                    {r.certificateType && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{r.certificateType}</span>}
                    <CertStatusChip status={r.status} />
                    {expiryBadge(r.expiryDate)}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mt-2">
                    <div><span className="text-gray-500">Certificate No:</span> <span className="font-medium">{fmt(r.certificateNumber)}</span></div>
                    <div><span className="text-gray-500">Issued:</span> <span className="font-medium">{fmtDate(r.issueDate)}</span></div>
                    <div><span className="text-gray-500">Expires:</span> <span className="font-medium">{fmtDate(r.expiryDate)}</span></div>
                  </div>
                  {r.scope && <p className="text-sm text-gray-600 mt-1"><span className="text-gray-500">Scope:</span> {r.scope}</p>}
                  {r.notes && <p className="text-sm text-gray-500 mt-1">{r.notes}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  {r.expiryDate && (
                    <Button variant="ghost" size="icon" title="Raise task" onClick={() => setRaiseTaskFor({ title: `Organic Viticulture Certificate Expiring — ${r.certificateType || r.certifyingBody}`, description: `The organic viticulture certificate${r.certifyingBody ? ` from ${r.certifyingBody}` : ""}${r.certificateType ? ` (${r.certificateType})` : ""} is due to expire. Arrange renewal with your certifying body.`, dueDate: r.expiryDate ?? undefined })}>
                      <ClipboardList className="h-4 w-4 text-amber-600" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Certificate" : "Add Certificate"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Certifying Body *</Label><Input value={form.certifyingBody ?? ""} onChange={sf("certifyingBody")} placeholder="e.g. Soil Association" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Certificate Number</Label><Input value={form.certificateNumber ?? ""} onChange={sf("certificateNumber")} /></div>
              <div>
                <Label>Certificate Type</Label>
                <Select value={form.certificateType ?? ""} onValueChange={v => setForm(f => ({ ...f, certificateType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{CERT_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Issue Date</Label><Input type="date" value={form.issueDate ?? ""} onChange={sf("issueDate")} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={form.expiryDate ?? ""} onChange={sf("expiryDate")} /></div>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status ?? "active"} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CERT_STATUS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Scope</Label><Textarea value={form.scope ?? ""} onChange={sf("scope")} rows={2} placeholder="What does this certificate cover?" /></div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.certifyingBody || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Certificate</DialogTitle><DialogDescription>Remove the certificate from <strong>{deleting?.certifyingBody}</strong>? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(deleting.id)} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          defaultTitle={raiseTaskFor.title}
          defaultDescription={raiseTaskFor.description}
          defaultDueDate={raiseTaskFor.dueDate}
          taskType="compliance_fix"
          module="Organic Viticulture"
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrganicViticulturePage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("block-conversion");

  if (!farmId) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64 text-gray-500">No farm selected.</div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Grape className="h-5 w-5 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Organic Viticulture</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Full organic compliance for your vineyard — block conversion register, approved inputs log, copper register, input derogation cases, organic wine production additives, and certificate storage. UK Organic Regulations 2020 and UK-retained EU Reg 203/2012.
          </p>
        </div>

        <TabBar>
          {TABS.map(t => (
            <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </TabButton>
          ))}
        </TabBar>

        <Card className="p-6">
          {tab === "block-conversion" && <BlockConversionTab farmId={farmId} />}
          {tab === "input-log" && <InputLogTab farmId={farmId} />}
          {tab === "copper-register" && <CopperRegisterTab farmId={farmId} />}
          {tab === "input-derogations" && <InputDerogationsTab farmId={farmId} />}
          {tab === "wine-production" && <WineProductionTab farmId={farmId} />}
          {tab === "certificates" && <CertificatesTab farmId={farmId} />}
        </Card>
      </div>
    </AppLayout>
  );
}
