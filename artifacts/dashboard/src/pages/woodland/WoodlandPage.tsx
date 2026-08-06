import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/hooks/use-app-store";
import { usePersistedTab } from "@/hooks/use-persisted-tab";
import { AppLayout } from "@/components/layout/AppLayout";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { TreePine, Plus, Pencil, Trash2, AlertTriangle, Info } from "lucide-react";

const TAB_IDS = ["records", "licences"] as const;
type WoodlandTab = (typeof TAB_IDS)[number];

/** Legal basis options for a felling operation (England — Forestry Commission). */
const LEGAL_BASES: { value: string; label: string }[] = [
  { value: "licence", label: "Felling licence held" },
  { value: "quarterly_allowance", label: "Exempt — quarterly allowance (≤5 m³/quarter, ≤2 m³ sold)" },
  { value: "small_diameter", label: "Exempt — trees below diameter threshold" },
  { value: "garden_orchard_churchyard", label: "Exempt — garden, orchard or churchyard" },
  { value: "dangerous_nuisance", label: "Exempt — prevention of danger / nuisance" },
  { value: "tpo_planning_consent", label: "Other consent — TPO / planning permission" },
  { value: "statutory_undertaking", label: "Exempt — statutory undertaking" },
  { value: "lopping_topping", label: "Exempt — lopping & topping (maintenance)" },
  { value: "hedgerow", label: "Exempt — hedgerow trees / trimming" },
  { value: "other_exemption", label: "Other exemption (record evidence)" },
];
const basisLabel = (v: string) => LEGAL_BASES.find(b => b.value === v)?.label ?? v;

const LICENCE_STATUSES = ["planned", "applied", "approved", "refused", "expired"] as const;
const FELLING_TYPES = ["clear_fell", "thinning", "selective", "coppice", "other"] as const;

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    planned: "bg-gray-100 text-gray-700",
    applied: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    refused: "bg-red-100 text-red-700",
    expired: "bg-amber-100 text-amber-700",
  };
  return <Badge className={map[s] ?? "bg-gray-100 text-gray-700"}>{s}</Badge>;
};

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? ""));
  return isNaN(n) ? 0 : n;
};
const fmtDate = (d: string | null | undefined) => (d ? String(d).slice(0, 10) : "—");

// ─── Felling Record dialog ────────────────────────────────────────────────────
function RecordDialog({ farmId, editRow, licences, fields, onClose }: {
  farmId: number; editRow?: any; licences: any[]; fields: any[]; onClose: () => void;
}) {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(() => ({
    fellingDate: editRow?.fellingDate?.slice(0, 10) ?? "",
    location: editRow?.location ?? "",
    fieldId: editRow?.fieldId ? String(editRow.fieldId) : "",
    species: editRow?.species ?? "",
    treeCount: editRow?.treeCount != null ? String(editRow.treeCount) : "",
    volumeM3: editRow?.volumeM3 ?? "",
    volumeSoldM3: editRow?.volumeSoldM3 ?? "",
    legalBasis: editRow?.legalBasis ?? "licence",
    licenceId: editRow?.licenceId ? String(editRow.licenceId) : "",
    purpose: editRow?.purpose ?? "",
    contractor: editRow?.contractor ?? "",
    evidenceNotes: editRow?.evidenceNotes ?? "",
    notes: editRow?.notes ?? "",
  }));
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        fellingDate: f.fellingDate,
        location: f.location || null,
        fieldId: f.fieldId ? Number(f.fieldId) : null,
        species: f.species || null,
        treeCount: f.treeCount ? Number(f.treeCount) : null,
        volumeM3: f.volumeM3 || null,
        volumeSoldM3: f.volumeSoldM3 || null,
        legalBasis: f.legalBasis,
        licenceId: f.legalBasis === "licence" && f.licenceId ? Number(f.licenceId) : null,
        purpose: f.purpose || null,
        contractor: f.contractor || null,
        evidenceNotes: f.evidenceNotes || null,
        notes: f.notes || null,
      };
      return editRow
        ? api.put(`/farms/${farmId}/felling-records/${editRow.id}`, payload)
        : api.post(`/farms/${farmId}/felling-records`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["felling-records", farmId] });
      onClose();
    },
  });

  const isExemption = f.legalBasis !== "licence" && f.legalBasis !== "tpo_planning_consent";

  return (
    <Dialog open onOpenChange={o => { if (!o) { saveMut.reset(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editRow ? "Edit Felling Record" : "Record Tree Felling"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Felling date *</Label><Input type="date" value={f.fellingDate} onChange={e => set("fellingDate", e.target.value)} /></div>
          <div><Label>Location / woodland</Label><Input value={f.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Long Copse" /></div>
          <div>
            <Label>Field (optional)</Label>
            <Select value={f.fieldId || "none"} onValueChange={v => set("fieldId", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select field" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {fields.map((fd: any) => <SelectItem key={fd.id} value={String(fd.id)}>{fd.name ?? fd.fieldName ?? `Field ${fd.id}`}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Species</Label><Input value={f.species} onChange={e => set("species", e.target.value)} placeholder="e.g. Ash, Oak" /></div>
          <div><Label>Number of trees</Label><Input type="number" min="0" value={f.treeCount} onChange={e => set("treeCount", e.target.value)} /></div>
          <div><Label>Volume felled (m³)</Label><Input type="number" min="0" step="0.01" value={f.volumeM3} onChange={e => set("volumeM3", e.target.value)} /></div>
          <div><Label>Volume sold (m³)</Label><Input type="number" min="0" step="0.01" value={f.volumeSoldM3} onChange={e => set("volumeSoldM3", e.target.value)} /></div>
          <div className="col-span-2">
            <Label>Legal basis *</Label>
            <Select value={f.legalBasis} onValueChange={v => set("legalBasis", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LEGAL_BASES.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {f.legalBasis === "licence" && (
            <div className="col-span-2">
              <Label>Felling licence</Label>
              <Select value={f.licenceId || "none"} onValueChange={v => set("licenceId", v === "none" ? "" : v)}>
                <SelectTrigger><SelectValue placeholder="Select licence" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Not linked —</SelectItem>
                  {licences.map((l: any) => <SelectItem key={l.id} value={String(l.id)}>{l.licenceNumber || `Licence #${l.id}`} ({l.status})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div><Label>Purpose</Label><Input value={f.purpose} onChange={e => set("purpose", e.target.value)} placeholder="e.g. thinning, firewood, safety" /></div>
          <div><Label>Contractor</Label><Input value={f.contractor} onChange={e => set("contractor", e.target.value)} /></div>
          <div className="col-span-2">
            <Label>Evidence kept {isExemption && <span className="text-amber-600 font-medium">(required to prove an exemption)</span>}</Label>
            <Textarea rows={2} value={f.evidenceNotes} onChange={e => set("evidenceNotes", e.target.value)}
              placeholder="Photos, maps, surveys, permissions kept — where they're stored" />
          </div>
          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={f.notes} onChange={e => set("notes", e.target.value)} /></div>
        </div>
        {isExemption && (
          <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            <Info size={14} className="mt-0.5 shrink-0" />
            <span>If the Forestry Commission asks, the burden of proof is on you: keep photos, maps, surveys and any permissions. Without records you may be liable to prosecution.</span>
          </div>
        )}
        <DialogMutationError mutation={saveMut} />
        <DialogFooter>
          <Button variant="outline" onClick={() => { saveMut.reset(); onClose(); }}>Cancel</Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending || !f.fellingDate}>
            {saveMut.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Licence dialog ───────────────────────────────────────────────────────────
function LicenceDialog({ farmId, editRow, onClose }: { farmId: number; editRow?: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState<any>(() => ({
    licenceNumber: editRow?.licenceNumber ?? "",
    status: editRow?.status ?? "planned",
    fellingType: editRow?.fellingType ?? "",
    areaDescription: editRow?.areaDescription ?? "",
    areaHectares: editRow?.areaHectares ?? "",
    estimatedVolumeM3: editRow?.estimatedVolumeM3 ?? "",
    applicationDate: editRow?.applicationDate?.slice(0, 10) ?? "",
    approvalDate: editRow?.approvalDate?.slice(0, 10) ?? "",
    expiryDate: editRow?.expiryDate?.slice(0, 10) ?? "",
    restockingRequired: editRow?.restockingRequired ?? true,
    restockingConditions: editRow?.restockingConditions ?? "",
    restockingDeadline: editRow?.restockingDeadline?.slice(0, 10) ?? "",
    restockingCompletedDate: editRow?.restockingCompletedDate?.slice(0, 10) ?? "",
    notes: editRow?.notes ?? "",
  }));
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));

  const saveMut = useMutation({
    mutationFn: async () => {
      const payload = {
        licenceNumber: f.licenceNumber || null,
        status: f.status,
        fellingType: f.fellingType || null,
        areaDescription: f.areaDescription || null,
        areaHectares: f.areaHectares || null,
        estimatedVolumeM3: f.estimatedVolumeM3 || null,
        applicationDate: f.applicationDate || null,
        approvalDate: f.approvalDate || null,
        expiryDate: f.expiryDate || null,
        restockingRequired: !!f.restockingRequired,
        restockingConditions: f.restockingConditions || null,
        restockingDeadline: f.restockingDeadline || null,
        restockingCompletedDate: f.restockingCompletedDate || null,
        notes: f.notes || null,
      };
      return editRow
        ? api.put(`/farms/${farmId}/felling-licences/${editRow.id}`, payload)
        : api.post(`/farms/${farmId}/felling-licences`, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["felling-licences", farmId] });
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={o => { if (!o) { saveMut.reset(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{editRow ? "Edit Felling Licence" : "Add Felling Licence"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Licence number</Label><Input value={f.licenceNumber} onChange={e => set("licenceNumber", e.target.value)} placeholder="Forestry Commission ref" /></div>
          <div>
            <Label>Status</Label>
            <Select value={f.status} onValueChange={v => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LICENCE_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Felling type</Label>
            <Select value={f.fellingType || "none"} onValueChange={v => set("fellingType", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Not set —</SelectItem>
                {FELLING_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Area / woodland</Label><Input value={f.areaDescription} onChange={e => set("areaDescription", e.target.value)} /></div>
          <div><Label>Area (ha)</Label><Input type="number" min="0" step="0.0001" value={f.areaHectares} onChange={e => set("areaHectares", e.target.value)} /></div>
          <div><Label>Estimated volume (m³)</Label><Input type="number" min="0" step="0.01" value={f.estimatedVolumeM3} onChange={e => set("estimatedVolumeM3", e.target.value)} /></div>
          <div><Label>Application date</Label><Input type="date" value={f.applicationDate} onChange={e => set("applicationDate", e.target.value)} /></div>
          <div><Label>Approval date</Label><Input type="date" value={f.approvalDate} onChange={e => set("approvalDate", e.target.value)} /></div>
          <div><Label>Expiry date</Label><Input type="date" value={f.expiryDate} onChange={e => set("expiryDate", e.target.value)} /></div>
          <div className="col-span-2 flex items-center gap-2 pt-1">
            <Checkbox id="restock-req" checked={!!f.restockingRequired} onCheckedChange={v => set("restockingRequired", !!v)} />
            <Label htmlFor="restock-req" className="cursor-pointer">Restocking required (usual for all licences except thinning-only)</Label>
          </div>
          {!!f.restockingRequired && (
            <>
              <div className="col-span-2"><Label>Restocking conditions</Label><Textarea rows={2} value={f.restockingConditions} onChange={e => set("restockingConditions", e.target.value)} placeholder="Replanting / natural regeneration conditions from the licence" /></div>
              <div><Label>Restocking deadline</Label><Input type="date" value={f.restockingDeadline} onChange={e => set("restockingDeadline", e.target.value)} /></div>
              <div><Label>Restocking completed</Label><Input type="date" value={f.restockingCompletedDate} onChange={e => set("restockingCompletedDate", e.target.value)} /></div>
            </>
          )}
          <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={f.notes} onChange={e => set("notes", e.target.value)} /></div>
        </div>
        <DialogMutationError mutation={saveMut} />
        <DialogFooter>
          <Button variant="outline" onClick={() => { saveMut.reset(); onClose(); }}>Cancel</Button>
          <Button onClick={() => saveMut.mutate()} disabled={saveMut.isPending}>{saveMut.isPending ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WoodlandPage() {
  const { farmId: rawFarmId } = useAppStore();
  const farmId = rawFarmId!;
  const qc = useQueryClient();
  const [tab, setTab] = usePersistedTab<WoodlandTab>({ page: "woodland", farmId: rawFarmId, validIds: TAB_IDS, defaultTab: "records" });

  const recordsQ = useQuery({
    queryKey: ["felling-records", farmId],
    queryFn: () => api.get(`/farms/${farmId}/felling-records`),
    enabled: !!farmId,
    select: (d: any) => (Array.isArray(d?.records) ? d.records : []),
  });
  const licencesQ = useQuery({
    queryKey: ["felling-licences", farmId],
    queryFn: () => api.get(`/farms/${farmId}/felling-licences`),
    enabled: !!farmId,
    select: (d: any) => (Array.isArray(d?.records) ? d.records : []),
  });
  const fieldsQ = useQuery({
    queryKey: ["fields", farmId],
    queryFn: () => api.get(`/farms/${farmId}/fields`),
    enabled: !!farmId,
    select: (d: any) => (Array.isArray(d?.records) ? d.records : Array.isArray(d) ? d : []),
    staleTime: 60_000,
  });

  const records = recordsQ.data ?? [];
  const licences = licencesQ.data ?? [];
  const fields = fieldsQ.data ?? [];

  const [recDlg, setRecDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [licDlg, setLicDlg] = useState<{ open: boolean; row?: any }>({ open: false });
  const [pendingDelRec, setPendingDelRec] = useState<number | null>(null);
  const [pendingDelLic, setPendingDelLic] = useState<number | null>(null);

  const delRecMut = useMutation({
    mutationFn: (id: number) => api.delete(`/farms/${farmId}/felling-records/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["felling-records", farmId] }),
  });
  const delLicMut = useMutation({
    mutationFn: (id: number) => api.delete(`/farms/${farmId}/felling-licences/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["felling-licences", farmId] }),
  });

  // Current calendar-quarter personal allowance usage (5 m³ felled, 2 m³ sold)
  const quarter = useMemo(() => {
    const now = new Date();
    const qi = Math.floor(now.getMonth() / 3);
    const start = new Date(now.getFullYear(), qi * 3, 1);
    const end = new Date(now.getFullYear(), qi * 3 + 3, 1);
    const inQuarter = records.filter((r: any) => {
      if (r.legalBasis !== "quarterly_allowance" || !r.fellingDate) return false;
      const d = new Date(String(r.fellingDate).slice(0, 10) + "T00:00:00");
      return d >= start && d < end;
    });
    const felled = inQuarter.reduce((a: number, r: any) => a + num(r.volumeM3), 0);
    const sold = inQuarter.reduce((a: number, r: any) => a + num(r.volumeSoldM3), 0);
    return { label: `Q${qi + 1} ${now.getFullYear()}`, felled, sold };
  }, [records]);

  const restockingDue = useMemo(() => licences.filter((l: any) =>
    l.restockingRequired && !l.restockingCompletedDate && l.restockingDeadline
  ), [licences]);

  const overAllowance = quarter.felled > 5 || quarter.sold > 2;
  const nearAllowance = !overAllowance && (quarter.felled >= 4 || quarter.sold >= 1.5);

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><TreePine size={24} className="text-green-700" /> Woodland &amp; Tree Felling</h1>
            <p className="text-sm text-gray-500 mt-1">Felling licences, exemption evidence and restocking — Forestry Commission (England) rules, updated July 2026</p>
          </div>
          <div className="flex gap-2">
            {tab === "records" && <Button onClick={() => setRecDlg({ open: true })} data-testid="button-add-felling-record"><Plus size={15} className="mr-1" />Record Felling</Button>}
            {tab === "licences" && <Button onClick={() => setLicDlg({ open: true })} data-testid="button-add-licence"><Plus size={15} className="mr-1" />Add Licence</Button>}
          </div>
        </div>

        {/* Quarterly allowance tracker */}
        <div className={`mb-4 rounded-lg border px-4 py-3 text-sm flex items-start gap-2 ${overAllowance ? "border-red-300 bg-red-50 text-red-800" : nearAllowance ? "border-amber-300 bg-amber-50 text-amber-800" : "border-green-200 bg-green-50 text-green-800"}`}>
          {(overAllowance || nearAllowance) && <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
          <div>
            <span className="font-semibold">Personal allowance — {quarter.label}:</span>{" "}
            {quarter.felled.toFixed(2)} of 5 m³ felled without a licence, {quarter.sold.toFixed(2)} of 2 m³ sold.
            {overAllowance && <span className="font-semibold"> Allowance exceeded — a felling licence is required; felling without one is an offence.</span>}
            {nearAllowance && <span> Approaching the limit — plan a licence before further felling this quarter.</span>}
          </div>
        </div>

        {restockingDue.length > 0 && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span className="font-semibold">Restocking outstanding:</span>{" "}
            {restockingDue.map((l: any) => `${l.licenceNumber || `Licence #${l.id}`} (by ${fmtDate(l.restockingDeadline)})`).join(", ")}
          </div>
        )}

        <TabBar className="mb-4">
          <TabButton active={tab === "records"} onClick={() => setTab("records")}>Felling Records</TabButton>
          <TabButton active={tab === "licences"} onClick={() => setTab("licences")}>Licences ({licences.length})</TabButton>
        </TabBar>

        {tab === "records" && (
          <div className="bg-white rounded-lg border overflow-x-auto">
            {recordsQ.isError ? <p className="p-4 text-sm text-red-600">Failed to load felling records — please refresh.</p> :
            records.length === 0 ? <p className="p-6 text-sm text-gray-500">No felling recorded yet. Every felling operation should be logged here with its legal basis and the evidence you keep.</p> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Date</th><th className="px-3 py-2">Location</th><th className="px-3 py-2">Species</th>
                    <th className="px-3 py-2">Trees</th><th className="px-3 py-2">Vol (m³)</th><th className="px-3 py-2">Legal basis</th>
                    <th className="px-3 py-2">Evidence</th><th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r: any) => {
                    const isExempt = r.legalBasis !== "licence" && r.legalBasis !== "tpo_planning_consent";
                    return (
                      <tr key={r.id} className="border-t" data-testid={`row-felling-${r.id}`}>
                        <td className="px-3 py-2 whitespace-nowrap">{fmtDate(r.fellingDate)}</td>
                        <td className="px-3 py-2">{r.location || "—"}</td>
                        <td className="px-3 py-2">{r.species || "—"}</td>
                        <td className="px-3 py-2">{r.treeCount ?? "—"}</td>
                        <td className="px-3 py-2">{r.volumeM3 ? num(r.volumeM3).toFixed(2) : "—"}</td>
                        <td className="px-3 py-2 max-w-[260px]"><span className="text-xs">{basisLabel(r.legalBasis)}</span></td>
                        <td className="px-3 py-2">
                          {isExempt && !r.evidenceNotes
                            ? <Badge className="bg-red-100 text-red-700">Missing</Badge>
                            : r.evidenceNotes ? <Badge className="bg-green-100 text-green-700">Kept</Badge> : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-3 py-2 text-right whitespace-nowrap">
                          <Button size="sm" variant="ghost" onClick={() => setRecDlg({ open: true, row: r })}><Pencil size={14} /></Button>
                          <Button size="sm" variant="ghost" onClick={() => setPendingDelRec(r.id)}><Trash2 size={14} className="text-red-500" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "licences" && (
          <div className="bg-white rounded-lg border overflow-x-auto">
            {licencesQ.isError ? <p className="p-4 text-sm text-red-600">Failed to load licences — please refresh.</p> :
            licences.length === 0 ? <p className="p-6 text-sm text-gray-500">No felling licences yet. Licences are free and issued by the Forestry Commission; most carry restocking conditions you must meet.</p> : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2">Licence no.</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Area</th><th className="px-3 py-2">Expiry</th><th className="px-3 py-2">Restocking</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licences.map((l: any) => (
                    <tr key={l.id} className="border-t" data-testid={`row-licence-${l.id}`}>
                      <td className="px-3 py-2">{l.licenceNumber || `#${l.id}`}</td>
                      <td className="px-3 py-2">{statusBadge(l.status)}</td>
                      <td className="px-3 py-2">{l.fellingType ? l.fellingType.replace("_", " ") : "—"}</td>
                      <td className="px-3 py-2">{l.areaDescription || "—"}{l.areaHectares ? ` (${num(l.areaHectares)} ha)` : ""}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{fmtDate(l.expiryDate)}</td>
                      <td className="px-3 py-2">
                        {!l.restockingRequired ? <span className="text-gray-400">Not required</span>
                          : l.restockingCompletedDate ? <Badge className="bg-green-100 text-green-700">Done {fmtDate(l.restockingCompletedDate)}</Badge>
                          : <Badge className="bg-amber-100 text-amber-700">Due {fmtDate(l.restockingDeadline)}</Badge>}
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <Button size="sm" variant="ghost" onClick={() => setLicDlg({ open: true, row: l })}><Pencil size={14} /></Button>
                        <Button size="sm" variant="ghost" onClick={() => setPendingDelLic(l.id)}><Trash2 size={14} className="text-red-500" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {recDlg.open && <RecordDialog farmId={farmId} editRow={recDlg.row} licences={licences} fields={fields} onClose={() => setRecDlg({ open: false })} />}
        {licDlg.open && <LicenceDialog farmId={farmId} editRow={licDlg.row} onClose={() => setLicDlg({ open: false })} />}

        <ConfirmDialog
          open={pendingDelRec !== null}
          title="Delete felling record"
          message="Delete this felling record? Compliance evidence will be lost."
          confirmLabel="Delete"
          confirmVariant="destructive"
          mutation={delRecMut}
          onConfirm={() => { if (pendingDelRec !== null) delRecMut.mutate(pendingDelRec, { onSuccess: () => setPendingDelRec(null) }); }}
          onCancel={() => { setPendingDelRec(null); delRecMut.reset(); }}
        />
        <ConfirmDialog
          open={pendingDelLic !== null}
          title="Delete licence"
          message="Delete this felling licence record?"
          confirmLabel="Delete"
          confirmVariant="destructive"
          mutation={delLicMut}
          onConfirm={() => { if (pendingDelLic !== null) delLicMut.mutate(pendingDelLic, { onSuccess: () => setPendingDelLic(null) }); }}
          onCancel={() => { setPendingDelLic(null); delLicMut.reset(); }}
        />
      </div>
    </AppLayout>
  );
}
