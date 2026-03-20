import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppStore } from "@/hooks/use-app-store";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Search, Pencil, AlertTriangle, FileText, Truck } from "lucide-react";

interface WasteRecord {
  id: number;
  farmId: number;
  wasteType: string;
  quantity: string | null;
  disposalMethod: string;
  disposalDate: string;
  carrierName: string | null;
  carrierLicence: string | null;
  destinationSite: string | null;
  wasteTransferNote: string | null;
  notes: string | null;
  createdAt: string;
}

const WASTE_TYPES = [
  "Agricultural plastics (bale wrap, silage sheet)",
  "Chemical containers / pesticide packaging",
  "Clinical / veterinary waste",
  "Waste oil / lubricants",
  "Scrap metal",
  "Tyres",
  "Batteries",
  "Electronic waste (WEEE)",
  "Cardboard / paper",
  "General farm waste",
  "Sewage / slurry",
  "Asbestos",
  "Other",
];

const DISPOSAL_METHODS = [
  "Licensed waste carrier collection",
  "Registered waste site drop-off",
  "Agricultural waste contractor",
  "Retailer take-back scheme",
  "On-farm composting",
  "On-farm burning (permitted)",
  "Other",
];

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const TODAY = new Date().toISOString().slice(0, 10);
const EMPTY: Partial<WasteRecord> = {
  wasteType: "", quantity: "", disposalMethod: "", disposalDate: TODAY,
  carrierName: "", carrierLicence: "", destinationSite: "", wasteTransferNote: "", notes: "",
};

export default function WasteDisposalPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<WasteRecord | null>(null);
  const [editing, setEditing] = useState<WasteRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<WasteRecord>>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ["waste", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/waste`).then(r => r.json()),
    enabled: !!farmId,
  });

  const records: WasteRecord[] = data?.records ?? [];

  const thisMonthCount = (() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return records.filter(r => new Date(r.disposalDate) >= start).length;
  })();

  const uniqueTypes = new Set(records.map(r => r.wasteType)).size;
  const missingWTN = records.filter(r => !r.wasteTransferNote && r.disposalMethod.toLowerCase().includes("carrier")).length;

  const filtered = records.filter(r => {
    const matchSearch = !search
      || r.wasteType.toLowerCase().includes(search.toLowerCase())
      || r.carrierName?.toLowerCase().includes(search.toLowerCase())
      || r.destinationSite?.toLowerCase().includes(search.toLowerCase())
      || r.wasteTransferNote?.toLowerCase().includes(search.toLowerCase());
    const matchMethod = filterMethod === "all" || r.disposalMethod === filterMethod;
    return matchSearch && matchMethod;
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<WasteRecord>) => {
      const url = editing
        ? `/api/farms/${farmId}/waste/${editing.id}`
        : `/api/farms/${farmId}/waste`;
      return fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          disposalDate: data.disposalDate ? new Date(data.disposalDate).toISOString() : new Date().toISOString(),
          quantity: data.quantity || null,
          carrierName: data.carrierName || null,
          carrierLicence: data.carrierLicence || null,
          destinationSite: data.destinationSite || null,
          wasteTransferNote: data.wasteTransferNote || null,
          notes: data.notes || null,
        }),
      }).then(r => r.json());
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["waste", farmId] });
      toast({ title: editing ? "Record updated" : "Record added" });
      closeDialog();
    },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/waste/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["waste", farmId] }); setDeleteId(null); toast({ title: "Record deleted" }); },
  });

  function openAdd() { setEditing(null); setForm({ ...EMPTY, disposalDate: TODAY }); setDialogOpen(true); }
  function openEdit(r: WasteRecord) {
    setEditing(r);
    setForm({ ...r, disposalDate: r.disposalDate?.slice(0, 10) });
    setViewRecord(null);
    setDialogOpen(true);
  }
  function closeDialog() { setDialogOpen(false); setEditing(null); setForm(EMPTY); }
  const set = (k: keyof WasteRecord, v: string) => setForm(f => ({ ...f, [k]: v }));

  const uniqueMethods = Array.from(new Set(records.map(r => r.disposalMethod).filter(Boolean)));

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Waste Disposal</h1>
              <p className="text-sm text-gray-500">Farm waste disposal records and carrier documentation</p>
            </div>
          </div>
          <Button className="bg-brand-forest hover:bg-brand-forest/90 text-white" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </Button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem" }}>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Total Disposals</p>
            <p className="text-2xl font-bold text-gray-900">{records.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-blue-200 p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">This Month</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">{thisMonthCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Disposals recorded</p>
          </div>
          <div className="bg-white rounded-lg border border-purple-200 p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Truck className="w-3.5 h-3.5 text-purple-600" />
              <p className="text-xs text-purple-600 uppercase tracking-wide font-medium">Waste Categories</p>
            </div>
            <p className="text-2xl font-bold text-purple-700">{uniqueTypes}</p>
            <p className="text-xs text-gray-500 mt-0.5">Unique waste types</p>
          </div>
          <div className={`bg-white rounded-lg border p-4 ${missingWTN > 0 ? "border-orange-200" : "border-green-200"}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className={`w-3.5 h-3.5 ${missingWTN > 0 ? "text-orange-600" : "text-green-600"}`} />
              <p className={`text-xs uppercase tracking-wide font-medium ${missingWTN > 0 ? "text-orange-600" : "text-green-600"}`}>Missing WTN</p>
            </div>
            <p className={`text-2xl font-bold ${missingWTN > 0 ? "text-orange-700" : "text-green-700"}`}>{missingWTN}</p>
            <p className="text-xs text-gray-500 mt-0.5">Carrier records without transfer note</p>
          </div>
        </div>

        {/* Compliance note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>Red Tractor requires waste disposal records for all hazardous and controlled waste. When using a licensed waste carrier, always obtain and retain the <strong>Waste Transfer Note (WTN)</strong> — this is a legal requirement under the Environmental Protection Act 1990.</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search by waste type, carrier or WTN…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterMethod} onValueChange={setFilterMethod}>
            <SelectTrigger className="w-52"><SelectValue placeholder="Disposal method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              {uniqueMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Loading records…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <Trash2 className="w-8 h-8 text-gray-300" />
              <p className="text-gray-500 text-sm">No waste disposal records found</p>
              <p className="text-gray-400 text-xs">Log all farm waste disposals to demonstrate compliance</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Waste Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Disposal Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Method</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Carrier</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">WTN Ref</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Qty</th>
                  <th className="text-right px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.wasteType}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{fmt(r.disposalDate)}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px]"><span className="line-clamp-1">{r.disposalMethod}</span></td>
                    <td className="px-4 py-3 text-gray-600">
                      {r.carrierName ? (
                        <div>
                          <p>{r.carrierName}</p>
                          {r.carrierLicence && <p className="text-xs text-gray-400">Lic: {r.carrierLicence}</p>}
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {r.wasteTransferNote
                        ? <span className="font-mono text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">{r.wasteTransferNote}</span>
                        : <span className="text-orange-500 text-xs">No WTN</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{r.quantity || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setViewRecord(r)}>View</Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setDeleteId(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={v => { if (!v) closeDialog(); }}>
        <DialogContent style={{ maxWidth: "52rem" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-slate-600" />
              {editing ? "Edit Disposal Record" : "New Waste Disposal Record"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="space-y-1.5">
                <Label>Waste Type *</Label>
                <Select value={form.wasteType ?? ""} onValueChange={v => set("wasteType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select waste type" /></SelectTrigger>
                  <SelectContent>
                    {WASTE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Disposal Date *</Label>
                <Input type="date" value={form.disposalDate ?? ""} onChange={e => set("disposalDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Disposal Method *</Label>
                <Select value={form.disposalMethod ?? ""} onValueChange={v => set("disposalMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    {DISPOSAL_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Quantity</Label>
                <Input value={form.quantity ?? ""} onChange={e => set("quantity", e.target.value)} placeholder="e.g. 500 kg, 20 bales" />
              </div>
              <div className="space-y-1.5">
                <Label>Carrier Name</Label>
                <Input value={form.carrierName ?? ""} onChange={e => set("carrierName", e.target.value)} placeholder="Name of licensed waste carrier" />
              </div>
              <div className="space-y-1.5">
                <Label>Carrier Licence Number</Label>
                <Input value={form.carrierLicence ?? ""} onChange={e => set("carrierLicence", e.target.value)} placeholder="e.g. CBDU123456" />
              </div>
              <div className="space-y-1.5">
                <Label>Destination Site</Label>
                <Input value={form.destinationSite ?? ""} onChange={e => set("destinationSite", e.target.value)} placeholder="Name and location of receiving site" />
              </div>
              <div className="space-y-1.5">
                <Label>Waste Transfer Note Reference</Label>
                <Input value={form.wasteTransferNote ?? ""} onChange={e => set("wasteTransferNote", e.target.value)} placeholder="WTN reference number" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Notes</Label>
                <Textarea value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} rows={2} placeholder="Any additional notes…" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button
              className="bg-brand-forest hover:bg-brand-forest/90 text-white"
              disabled={!form.wasteType || !form.disposalMethod || !form.disposalDate || saveMutation.isPending}
              onClick={() => saveMutation.mutate(form)}
            >
              {saveMutation.isPending ? "Saving…" : editing ? "Save Changes" : "Add Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      {viewRecord && !dialogOpen && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-slate-600" />
                {viewRecord.wasteType}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Disposal Date</p><p>{fmt(viewRecord.disposalDate)}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Quantity</p><p>{viewRecord.quantity || "—"}</p></div>
                <div className="col-span-2"><p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Disposal Method</p><p>{viewRecord.disposalMethod}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Carrier</p><p>{viewRecord.carrierName || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Carrier Licence</p><p className="font-mono text-xs">{viewRecord.carrierLicence || "—"}</p></div>
                <div><p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Destination Site</p><p>{viewRecord.destinationSite || "—"}</p></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium mb-0.5">Waste Transfer Note</p>
                  {viewRecord.wasteTransferNote
                    ? <span className="font-mono text-sm bg-gray-50 border border-gray-200 rounded px-2 py-0.5">{viewRecord.wasteTransferNote}</span>
                    : <span className="text-orange-500 text-sm">Not recorded</span>}
                </div>
              </div>
              {viewRecord.notes && <div><p className="text-xs text-gray-500 uppercase font-medium mb-1">Notes</p><p className="text-gray-700 whitespace-pre-line">{viewRecord.notes}</p></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => openEdit(viewRecord)}>Edit</Button>
              <Button variant="ghost" onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirm */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent style={{ maxWidth: "28rem" }}>
          <DialogHeader><DialogTitle>Delete Waste Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600">This will permanently delete this waste disposal record. This cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
