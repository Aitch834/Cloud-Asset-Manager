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
import { Trash2, Plus, Search, Pencil, AlertTriangle, FileText, Truck, Recycle } from "lucide-react";

interface WasteRecord {
  id: number;
  farmId: number;
  wasteType: string;
  quantity: string | null;
  disposalMethod: string;
  disposalDate: string;
  carrierName: string | null;
  carrierLicence: string | null;
  carrierRegistrationType: string | null;
  destinationSite: string | null;
  wasteTransferNote: string | null;
  ewcCode: string | null;
  notes: string | null;
  createdAt: string;
}

const WASTE_TYPES_WITH_EWC: { label: string; ewc: string }[] = [
  { label: "Agricultural plastics – bale wrap / silage sheet", ewc: "02 01 04" },
  { label: "Chemical containers / pesticide packaging", ewc: "15 01 10*" },
  { label: "Clinical / veterinary waste (sharps, medicines)", ewc: "18 02 02*" },
  { label: "Waste oil / lubricants", ewc: "13 02 05*" },
  { label: "Scrap metal", ewc: "17 04 05" },
  { label: "Tyres", ewc: "16 01 03" },
  { label: "Batteries", ewc: "16 06 01*" },
  { label: "Electronic waste (WEEE)", ewc: "16 02 14" },
  { label: "Cardboard / paper (non-hazardous)", ewc: "15 01 01" },
  { label: "General farm waste (mixed non-hazardous)", ewc: "02 01 99" },
  { label: "Sewage / slurry (non-hazardous)", ewc: "02 01 06" },
  { label: "Asbestos", ewc: "17 06 01*" },
  { label: "Food waste / organic waste", ewc: "02 01 02" },
  { label: "Spent chemicals / washings", ewc: "07 04 04*" },
  { label: "Mineral oils (non-hazardous)", ewc: "13 01 10" },
  { label: "Mixed construction waste", ewc: "17 09 04" },
  { label: "Other", ewc: "" },
];

const WASTE_TYPES = WASTE_TYPES_WITH_EWC.map(w => w.label);

const DISPOSAL_METHODS = [
  "Licensed waste carrier collection",
  "Registered waste site drop-off",
  "Agricultural waste contractor",
  "Retailer take-back scheme (e.g. AgXchange)",
  "On-farm composting",
  "On-farm burning (permitted materials only)",
  "Approved incineration facility",
  "Recycling facility",
  "Other",
];

const CARRIER_TYPES = [
  "Environment Agency Registered Carrier",
  "Upper Tier Carrier",
  "Lower Tier Carrier",
  "Exemption holder",
  "Retailer take-back scheme",
  "Other",
];

const fmt = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export default function WasteDisposalPage() {
  const { farmId } = useAppStore();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<WasteRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const emptyForm = {
    wasteType: "", ewcCode: "", quantity: "", disposalMethod: "", disposalDate: "",
    carrierName: "", carrierLicence: "", carrierRegistrationType: "", destinationSite: "",
    wasteTransferNote: "", notes: "",
  };
  const [form, setForm] = useState<any>(emptyForm);

  const q = useQuery({
    queryKey: ["waste", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/waste`).then(r => r.json()),
    enabled: !!farmId,
    select: d => d.records ?? [],
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["waste", farmId] });

  const saveMut = useMutation({
    mutationFn: (body: any) => {
      const payload = { ...body, disposalDate: body.disposalDate ? new Date(body.disposalDate).toISOString() : undefined };
      if (editRecord) return fetch(`/api/farms/${farmId}/waste/${editRecord.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      return fetch(`/api/farms/${farmId}/waste`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    },
    onSuccess: () => { toast({ title: editRecord ? "Record updated" : "Record saved" }); invalidate(); setAddOpen(false); setEditRecord(null); setForm(emptyForm); },
    onError: () => toast({ title: "Failed to save", variant: "destructive" }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => fetch(`/api/farms/${farmId}/waste/${id}`, { method: "DELETE" }),
    onSuccess: () => { toast({ title: "Deleted" }); invalidate(); setDeleteId(null); },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  const records: WasteRecord[] = q.data ?? [];
  const filtered = records.filter(r =>
    !search || r.wasteType?.toLowerCase().includes(search.toLowerCase()) || r.carrierName?.toLowerCase().includes(search.toLowerCase()) || r.destinationSite?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditRecord(null); setForm(emptyForm); setAddOpen(true); };
  const openEdit = (r: WasteRecord) => {
    setEditRecord(r);
    setForm({ ...r, disposalDate: r.disposalDate?.slice(0, 10) ?? "" });
    setAddOpen(true);
  };

  const onWasteTypeChange = (v: string) => {
    const match = WASTE_TYPES_WITH_EWC.find(w => w.label === v);
    setForm((f: any) => ({ ...f, wasteType: v, ewcCode: match?.ewc || f.ewcCode }));
  };

  return (
    <AppLayout title="Waste Disposal">
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p className="text-sm text-gray-500 mb-4">
          Waste disposal records — Duty of Care compliance, waste transfer notes, and licensed carrier tracking for Red Tractor and legal requirements.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: "1.5rem" }}>
          <div style={{ background: "#f0fdf4", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "#dcfce7", borderRadius: 8, padding: 8 }}><Recycle size={18} color="#16a34a" /></div>
            <div><p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Total Records</p><p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{records.length}</p></div>
          </div>
          <div style={{ background: "#fffbeb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "#fef3c7", borderRadius: 8, padding: 8 }}><FileText size={18} color="#92400e" /></div>
            <div><p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Waste Transfer Notes</p><p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{records.filter(r => r.wasteTransferNote).length}</p></div>
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ background: "#dbeafe", borderRadius: 8, padding: 8 }}><Truck size={18} color="#1d4ed8" /></div>
            <div><p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: 2 }}>Unique Carriers</p><p style={{ fontSize: "1.375rem", fontWeight: 700, color: "#111827" }}>{new Set(records.filter(r => r.carrierName).map(r => r.carrierName)).size}</p></div>
          </div>
        </div>

        <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#856404" }}>
          <strong>Duty of Care reminder:</strong> Always use licensed waste carriers. Obtain a Waste Transfer Note (WTN) for every collection. EWC codes marked with * are hazardous waste — special rules apply.
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: "1rem", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
            <Input placeholder="Search waste records..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          <Button size="sm" onClick={openAdd}><Plus size={14} className="mr-1" />Add Waste Record</Button>
        </div>

        {q.isLoading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", textAlign: "center" }}>
            <div style={{ background: "#f3f4f6", borderRadius: "50%", padding: "1rem", marginBottom: "1rem" }}><Recycle size={28} color="#9ca3af" /></div>
            <p style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>{records.length === 0 ? "No waste records" : "No records match your search"}</p>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", maxWidth: 400, marginBottom: "1.25rem" }}>
              Log all waste movements to maintain your Duty of Care obligations and Red Tractor records.
            </p>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Date", "Waste Type", "EWC Code", "Quantity", "Method", "Carrier", "Carrier Licence", "Carrier Type", "Destination", "WTN", ""].map(h => (
                    <th key={h} style={{ padding: "0.625rem 0.875rem", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: "0.75rem", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r: WasteRecord, i: number) => (
                  <tr key={r.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", whiteSpace: "nowrap" }}>{fmt(r.disposalDate)}</td>
                    <td style={{ padding: "0.625rem 0.875rem", fontWeight: 500, maxWidth: 200 }}>{r.wasteType || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      {r.ewcCode ? (
                        <Badge style={{ background: r.ewcCode.includes("*") ? "#fee2e2" : "#f3f4f6", color: r.ewcCode.includes("*") ? "#991b1b" : "#374151", border: "none", fontFamily: "monospace", fontSize: "0.72rem" }}>
                          {r.ewcCode}
                        </Badge>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.quantity || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", maxWidth: 160 }}>{r.disposalMethod || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.carrierName || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontFamily: r.carrierLicence ? "monospace" : "inherit", fontSize: r.carrierLicence ? "0.8rem" : "inherit" }}>{r.carrierLicence || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280", fontSize: "0.75rem" }}>{(r as any).carrierRegistrationType || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem", color: "#6b7280" }}>{r.destinationSite || "—"}</td>
                    <td style={{ padding: "0.625rem 0.875rem" }}>
                      {r.wasteTransferNote ? (
                        <Badge style={{ background: "#dcfce7", color: "#166534", border: "none", fontFamily: "monospace", fontSize: "0.72rem" }}>{r.wasteTransferNote}</Badge>
                      ) : <span style={{ color: "#d1d5db", fontSize: "0.75rem" }}>None</span>}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => openEdit(r)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4 }} title="Edit"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteId(r.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#d1d5db", padding: 4 }} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRecord(null); setForm(emptyForm); } }}>
          <DialogContent style={{ maxWidth: 600 }}>
            <DialogHeader><DialogTitle>{editRecord ? "Edit Waste Record" : "Add Waste Disposal Record"}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Disposal Date <span style={{ color: "#ef4444" }}>*</span></Label>
                  <Input type="date" value={form.disposalDate} onChange={e => setForm((f: any) => ({ ...f, disposalDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Quantity / Volume</Label>
                  <Input placeholder="e.g. 50 bags, 200 litres, 0.5 tonnes" value={form.quantity} onChange={e => setForm((f: any) => ({ ...f, quantity: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Waste Type <span style={{ color: "#ef4444" }}>*</span></Label>
                  <Select value={form.wasteType} onValueChange={onWasteTypeChange}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{WASTE_TYPES_WITH_EWC.map(w => <SelectItem key={w.label} value={w.label}>{w.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>EWC Code</Label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Input placeholder="e.g. 02 01 04" value={form.ewcCode} onChange={e => setForm((f: any) => ({ ...f, ewcCode: e.target.value }))} style={{ fontFamily: "monospace" }} />
                    {form.ewcCode?.includes("*") && <span style={{ color: "#991b1b", fontSize: "0.75rem", whiteSpace: "nowrap" }}>⚠ Hazardous</span>}
                  </div>
                </div>
              </div>
              <div>
                <Label>Disposal Method <span style={{ color: "#ef4444" }}>*</span></Label>
                <Select value={form.disposalMethod} onValueChange={v => setForm((f: any) => ({ ...f, disposalMethod: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{DISPOSAL_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "0.75rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>Duty of Care — Carrier Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Carrier Company Name</Label><Input placeholder="e.g. Smith Waste Services Ltd" value={form.carrierName} onChange={e => setForm((f: any) => ({ ...f, carrierName: e.target.value }))} /></div>
                  <div><Label>Environment Agency Licence No.</Label><Input placeholder="e.g. CBDU01234" value={form.carrierLicence} onChange={e => setForm((f: any) => ({ ...f, carrierLicence: e.target.value }))} style={{ fontFamily: "monospace" }} /></div>
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  <Label>Carrier Registration Type</Label>
                  <Select value={form.carrierRegistrationType} onValueChange={v => setForm((f: any) => ({ ...f, carrierRegistrationType: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>{CARRIER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label>Destination / Permitted Site</Label><Input placeholder="e.g. Smiths Quarry Transfer Station" value={form.destinationSite} onChange={e => setForm((f: any) => ({ ...f, destinationSite: e.target.value }))} /></div>
                <div>
                  <Label>Waste Transfer Note No.</Label>
                  <Input placeholder="e.g. WTN-2025-001" value={form.wasteTransferNote} onChange={e => setForm((f: any) => ({ ...f, wasteTransferNote: e.target.value }))} style={{ fontFamily: "monospace" }} />
                </div>
              </div>
              <div><Label>Notes</Label><Textarea placeholder="Additional information, collection reference, driver details..." value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} rows={2} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAddOpen(false); setEditRecord(null); setForm(emptyForm); }}>Cancel</Button>
              <Button onClick={() => saveMut.mutate(form)} disabled={!form.disposalDate || !form.wasteType || !form.disposalMethod || saveMut.isPending}>
                {saveMut.isPending ? "Saving…" : editRecord ? "Save Changes" : "Save Record"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
          <DialogContent style={{ maxWidth: 400 }}>
            <DialogHeader><DialogTitle>Delete Waste Record</DialogTitle></DialogHeader>
            <p className="text-sm text-gray-600 py-2">Are you sure you want to delete this waste disposal record?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending}>Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
