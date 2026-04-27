import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Warehouse, AlertTriangle, Eye } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { Redirect } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");

function Empty({ msg }: { msg: string }) {
  return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>;
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive" }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DataTable({ cols, rows, onDelete, onView }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]; rows: Record<string, unknown>[]; onDelete?: (r: Record<string, unknown>) => void; onView?: (r: Record<string, unknown>) => void }) {
  const [pendingDelete, setPendingDelete] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet. Add one using the button above." />;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onDelete || onView) && <th />}</tr></thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
              {(onDelete || onView) && <td className="py-2 text-right space-x-1 whitespace-nowrap">
                {onView && <Button size="icon" variant="ghost" onClick={() => onView(row)}><Eye className="w-3.5 h-3.5" /></Button>}
                {onDelete && <Button size="icon" variant="ghost" onClick={() => setPendingDelete(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
              </td>}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete Record"
        message="Are you sure you want to delete this record? This cannot be undone."
        onConfirm={() => { if (pendingDelete && onDelete) { onDelete(pendingDelete); } setPendingDelete(null); }}
        onCancel={() => setPendingDelete(null)}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}

function PackhouseTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["horti-packhouse", farmId], queryFn: () => fetch(api(`farms/${farmId}/horticulture-packhouse-records`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/horticulture-packhouse-records`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-packhouse", farmId] }); setOpen(false); setForm({}); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/horticulture-packhouse-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-packhouse", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Packhouse & Despatch Records</h3><Button size="sm" onClick={() => { setForm({ labelChecked: false, metalDetectorCheck: false, allergenCheck: false }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "packingDate", label: "Packing Date", fmt: r => fmtDate(r.packingDate) }, { key: "harvestBatchRef", label: "Batch Ref" }, { key: "productName", label: "Product" }, { key: "traceabilityCode", label: "Traceability Code" }, { key: "quantityPackedKg", label: "Qty (kg)" }, { key: "customerName", label: "Customer" }]} rows={records as Record<string, unknown>[]} onView={setViewRecord} onDelete={r => del.mutate(r.id as number)} />}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Packhouse Record — {fmtDate(viewRecord.packingDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Packing Date</p><p className="font-medium">{fmtDate(viewRecord.packingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Harvest Batch Ref</p><p className="font-medium">{fmt(viewRecord.harvestBatchRef)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{fmt(viewRecord.productName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Traceability Code</p><p className="font-medium">{fmt(viewRecord.traceabilityCode)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Quantity Packed (kg)</p><p className="font-medium">{fmt(viewRecord.quantityPackedKg)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Pack Format</p><p className="font-medium">{fmt(viewRecord.packFormat)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Packaging Type</p><p className="font-medium">{fmt(viewRecord.packagingType)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cold Store Temp (°C)</p><p className="font-medium">{fmt(viewRecord.coldStoreTemperature)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Customer Name</p><p className="font-medium">{fmt(viewRecord.customerName)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Vehicle Reg</p><p className="font-medium">{fmt(viewRecord.vehicleRegistration)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Label Checked</p><p className="font-medium">{viewRecord.labelChecked ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Metal Detector Check</p><p className="font-medium">{viewRecord.metalDetectorCheck ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Allergen Check</p><p className="font-medium">{viewRecord.allergenCheck ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Packhouse Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Packing Date *</Label><Input type="date" value={String(form.packingDate ?? "")} onChange={e => setForm(f => ({ ...f, packingDate: e.target.value }))} /></div>
            <div><Label>Harvest Batch Ref *</Label><Input value={String(form.harvestBatchRef ?? "")} onChange={e => setForm(f => ({ ...f, harvestBatchRef: e.target.value }))} /></div>
            <div><Label>Product Name *</Label><Input value={String(form.productName ?? "")} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} /></div>
            <div><Label>Traceability Code *</Label><Input value={String(form.traceabilityCode ?? "")} onChange={e => setForm(f => ({ ...f, traceabilityCode: e.target.value }))} /></div>
            <div><Label>Quantity Packed (kg)</Label><Input type="number" step="0.01" value={String(form.quantityPackedKg ?? "")} onChange={e => setForm(f => ({ ...f, quantityPackedKg: e.target.value }))} /></div>
            <div><Label>Pack Format</Label><Input value={String(form.packFormat ?? "")} onChange={e => setForm(f => ({ ...f, packFormat: e.target.value }))} /></div>
            <div><Label>Cold Store Temp (°C)</Label><Input type="number" step="0.1" value={String(form.coldStoreTemperature ?? "")} onChange={e => setForm(f => ({ ...f, coldStoreTemperature: e.target.value }))} /></div>
            <div><Label>Customer Name</Label><Input value={String(form.customerName ?? "")} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} /></div>
            <div><Label>Despatch Date</Label><Input type="date" value={String(form.dispatchDate ?? "")} onChange={e => setForm(f => ({ ...f, dispatchDate: e.target.value }))} /></div>
            <div><Label>Despatch Note No.</Label><Input value={String(form.despatchNoteNumber ?? "")} onChange={e => setForm(f => ({ ...f, despatchNoteNumber: e.target.value }))} /></div>
            <div className="col-span-2 space-y-2">
              {([["labelChecked", "Label checked?"], ["metalDetectorCheck", "Metal detector check?"], ["allergenCheck", "Allergen check completed?"]] as [string, string][]).map(([k, l]) => (
                <div key={k} className="flex items-center gap-2"><Checkbox id={k} checked={Boolean(form[k])} onCheckedChange={v => setForm(f => ({ ...f, [k]: Boolean(v) }))} /><Label htmlFor={k}>{l}</Label></div>
              ))}
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AllergenTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["horti-allergen", farmId], queryFn: () => fetch(api(`farms/${farmId}/allergen-management`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(api(`farms/${farmId}/allergen-management`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["horti-allergen", farmId] }); setOpen(false); setForm({}); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/allergen-management/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["horti-allergen", farmId] }) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Allergen Management Reviews</h3><Button size="sm" onClick={() => { setForm({ labellingVerified: false }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Review</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "reviewDate", label: "Review Date", fmt: r => fmtDate(r.reviewDate) }, { key: "reviewedBy", label: "Reviewed By" }, { key: "crossContaminationRisk", label: "Cross-Contamination Risk" }, { key: "nextReviewDate", label: "Next Review", fmt: r => fmtDate(r.nextReviewDate) }, { key: "labellingVerified", label: "Labelling Verified", fmt: r => r.labellingVerified ? "Yes" : "No" }]} rows={records as Record<string, unknown>[]} onView={setViewRecord} onDelete={r => del.mutate(r.id as number)} />}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Allergen Review — {fmtDate(viewRecord.reviewDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Review Date</p><p className="font-medium">{fmtDate(viewRecord.reviewDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Reviewed By</p><p className="font-medium">{fmt(viewRecord.reviewedBy)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cross Contamination Risk</p><p className="font-medium">{fmt(viewRecord.crossContaminationRisk)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Staff Training Date</p><p className="font-medium">{fmtDate(viewRecord.staffTrainingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Review Date</p><p className="font-medium">{fmtDate(viewRecord.nextReviewDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Labelling Verified</p><p className="font-medium">{viewRecord.labellingVerified ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Control Measures</p><p className="font-medium">{fmt(viewRecord.controlMeasures)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{fmt(viewRecord.notes)}</p></div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>Allergen Management Review</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Review Date *</Label><Input type="date" value={String(form.reviewDate ?? "")} onChange={e => setForm(f => ({ ...f, reviewDate: e.target.value }))} /></div>
            <div><Label>Reviewed By *</Label><Input value={String(form.reviewedBy ?? "")} onChange={e => setForm(f => ({ ...f, reviewedBy: e.target.value }))} /></div>
            <div><Label>Cross-Contamination Risk *</Label>
              <Select value={String(form.crossContaminationRisk ?? "")} onValueChange={v => setForm(f => ({ ...f, crossContaminationRisk: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["None", "Low", "Medium", "High"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Staff Training Date</Label><Input type="date" value={String(form.staffTrainingDate ?? "")} onChange={e => setForm(f => ({ ...f, staffTrainingDate: e.target.value }))} /></div>
            <div><Label>Next Review Date</Label><Input type="date" value={String(form.nextReviewDate ?? "")} onChange={e => setForm(f => ({ ...f, nextReviewDate: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-4"><Checkbox id="label" checked={Boolean(form.labellingVerified)} onCheckedChange={v => setForm(f => ({ ...f, labellingVerified: Boolean(v) }))} /><Label htmlFor="label">Labelling verified?</Label></div>
            <div className="col-span-2"><Label>Control Measures</Label><Textarea value={String(form.controlMeasures ?? "")} onChange={e => setForm(f => ({ ...f, controlMeasures: e.target.value }))} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type Tab = "packhouse" | "allergen";

export default function FreshProducePage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>(() => {
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tab") as Tab | null;
    const valid: Tab[] = ["packhouse", "allergen"];
    return t && valid.includes(t) ? t : "packhouse";
  });
  if (!farmId) return <Redirect to="/" />;
  return (
    <AppLayout title="Fresh Produce">
      <div className="space-y-4">
        <TabBar>
          <TabButton active={tab === "packhouse"} onClick={() => setTab("packhouse")}><Warehouse className="w-3.5 h-3.5 mr-1" />Packhouse</TabButton>
          <TabButton active={tab === "allergen"} onClick={() => setTab("allergen")}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Allergens</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "packhouse" && <PackhouseTab farmId={farmId} />}
          {tab === "allergen" && <AllergenTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
