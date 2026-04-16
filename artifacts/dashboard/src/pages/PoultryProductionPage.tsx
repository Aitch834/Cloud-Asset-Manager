import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, Home, Bird, BarChart3, Pill, SprayCan, Thermometer, FileText, ShieldCheck, Scissors, ClipboardList, Star, Truck, UtensilsCrossed } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { Redirect } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
function Empty({ msg }: { msg: string }) { return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>; }
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
function DataTable({ cols, rows, onEdit, onDelete }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void }) {
  const [pendingDelete, setPendingDelete] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet. Add one using the button above." />;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete) && <th />}</tr></thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
              {(onEdit || onDelete) && (
                <td className="py-2 text-right space-x-1">
                  {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
                  {onDelete && <Button size="icon" variant="ghost" onClick={() => setPendingDelete(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
                </td>
              )}
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

function useCrud<T extends Record<string, unknown>>(farmId: number, endpoint: string, key: string) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const { data = [], isLoading } = useQuery({ queryKey: [key, farmId], queryFn: () => fetch(api(`farms/${farmId}/${endpoint}`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/${endpoint}/${editing.id}`) : api(`farms/${farmId}/${endpoint}`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [key, farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: [key, farmId] }) });
  function openAdd(defaults: Record<string, unknown> = {}) { setEditing(null); setForm(defaults); setOpen(true); }
  function openEdit(r: T) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""]))); setOpen(true); }
  return { data, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit };
}

const HOUSE_TYPES = [
  "Controlled Environment (Dark-out)",
  "Naturally Lit House",
  "Free Range Building (with range access)",
  "Deep Litter House",
  "Aviary System",
  "Cage System",
  "Open-sided / Naturally Ventilated",
  "Breeding / Parent Stock House",
  "Rearing / Grower House",
  "Mobile Unit / Arks",
  "Multi-purpose",
];

const POULTRY_SPECIES = [
  "Broiler (Meat Chicken)",
  "Layer (Laying Hen)",
  "Turkey",
  "Duck",
  "Goose",
  "Guinea Fowl",
  "Pheasant / Game Bird",
  "Mixed / Other",
];

const PRODUCTION_SYSTEMS = [
  "Conventional",
  "Barn",
  "Free Range",
  "Organic",
  "RSPCA Assured",
  "Higher Welfare",
  "Label Rouge",
];

function HousesTab({ farmId }: { farmId: number }) {
  const { data: houses, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "poultry-houses", "poultry-houses");
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Poultry Houses</h3>
        <Button size="sm" onClick={() => openAdd()}><Plus className="w-4 h-4 mr-1" />Add House</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "houseName", label: "House Name" },
        { key: "species", label: "Species" },
        { key: "houseType", label: "House Type" },
        { key: "productionSystem", label: "Production System" },
        { key: "approvedCapacity", label: "Capacity" },
        { key: "ventilationType", label: "Ventilation" },
      ]} rows={houses as Record<string, unknown>[]} onEdit={r => openEdit(r as Record<string, unknown>)} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit House" : "Add Poultry House"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>House Name *</Label><Input value={String(form.houseName ?? "")} onChange={e => setForm(f => ({ ...f, houseName: e.target.value }))} placeholder="e.g. House 1, Shed A" /></div>
            <div><Label>Approved Capacity (birds) *</Label><Input type="number" value={String(form.approvedCapacity ?? "")} onChange={e => setForm(f => ({ ...f, approvedCapacity: e.target.value }))} /></div>
            <div>
              <Label>Species *</Label>
              <p className="text-xs text-muted-foreground mb-1">Primary approved species for this house</p>
              <Select value={String(form.species ?? "")} onValueChange={v => setForm(f => ({ ...f, species: v }))}>
                <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                <SelectContent>{POULTRY_SPECIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>House Type *</Label>
              <p className="text-xs text-muted-foreground mb-1">Physical structure / building design</p>
              <Select value={String(form.houseType ?? "")} onValueChange={v => setForm(f => ({ ...f, houseType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{HOUSE_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Production System *</Label>
              <p className="text-xs text-muted-foreground mb-1">Welfare / certification standard this house operates under</p>
              <Select value={String(form.productionSystem ?? "")} onValueChange={v => setForm(f => ({ ...f, productionSystem: v }))}>
                <SelectTrigger><SelectValue placeholder="Select system" /></SelectTrigger>
                <SelectContent>{PRODUCTION_SYSTEMS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Ventilation Type</Label><Input value={String(form.ventilationType ?? "")} onChange={e => setForm(f => ({ ...f, ventilationType: e.target.value }))} placeholder="e.g. Tunnel, Cross-flow, Natural" /></div>
            <div><Label>Water System</Label><Input value={String(form.waterSystem ?? "")} onChange={e => setForm(f => ({ ...f, waterSystem: e.target.value }))} placeholder="e.g. Nipple drinkers, Bell drinkers" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FlocksTab({ farmId }: { farmId: number }) {
  const { data: houses = [] } = useQuery({ queryKey: ["poultry-houses", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-houses`), { credentials: "include" }).then(r => r.json()) });
  const { data: raw, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "poultry-flocks", "poultry-flocks");
  const flocks = (raw as { flock: Record<string, unknown>; houseName: string | null }[]).map(r => ({ ...r.flock, houseName: r.houseName }));
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Flock Register</h3><Button size="sm" onClick={() => openAdd()}><Plus className="w-4 h-4 mr-1" />Add Flock</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "flockNumber", label: "Flock No." }, { key: "houseName", label: "House" }, { key: "species", label: "Species" }, { key: "productionSystem", label: "System" }, { key: "placementDate", label: "Placed", fmt: r => fmtDate(r.placementDate) }, { key: "placementCount", label: "Placed" }, { key: "status", label: "Status" }]} rows={flocks as Record<string, unknown>[]} onEdit={r => openEdit(r as Record<string, unknown>)} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>Flock Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Flock Number *</Label><Input value={String(form.flockNumber ?? "")} onChange={e => setForm(f => ({ ...f, flockNumber: e.target.value }))} /></div>
            <div><Label>House</Label>
              <Select value={String(form.houseId ?? "")} onValueChange={v => setForm(f => ({ ...f, houseId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                <SelectContent>{(houses as Record<string, unknown>[]).map(h => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.houseName)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Species *</Label>
              <Select value={String(form.species ?? "")} onValueChange={v => setForm(f => ({ ...f, species: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{POULTRY_SPECIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Production System *</Label>
              <Select value={String(form.productionSystem ?? "")} onValueChange={v => setForm(f => ({ ...f, productionSystem: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{PRODUCTION_SYSTEMS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Placement Date *</Label><Input type="date" value={String(form.placementDate ?? "")} onChange={e => setForm(f => ({ ...f, placementDate: e.target.value }))} /></div>
            <div><Label>Placement Count *</Label><Input type="number" value={String(form.placementCount ?? "")} onChange={e => setForm(f => ({ ...f, placementCount: e.target.value }))} /></div>
            <div><Label>Breed / Strain</Label><Input value={String(form.breed ?? "")} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} /></div>
            <div><Label>Hatchery Name</Label><Input value={String(form.hatcheryName ?? "")} onChange={e => setForm(f => ({ ...f, hatcheryName: e.target.value }))} /></div>
            <div><Label>Hatchery Approval No.</Label><Input value={String(form.hatcheryApprovalNumber ?? "")} onChange={e => setForm(f => ({ ...f, hatcheryApprovalNumber: e.target.value }))} /></div>
            <div><Label>Status</Label>
              <Select value={String(form.status ?? "active")} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["active", "depleted", "thinned", "sold"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function useFlocks(farmId: number) {
  const { data: rawFlocks = [] } = useQuery({ queryKey: ["poultry-flocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()) });
  return (rawFlocks as { flock: Record<string, unknown>; houseName: string | null }[]).map(r => ({ ...r.flock, houseName: r.houseName }));
}

function FlockSelect({ flocks, value, onChange }: { flocks: Record<string, unknown>[]; value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value || "__none__"} onValueChange={v => onChange(v === "__none__" ? "" : v)}>
      <SelectTrigger><SelectValue placeholder="Select flock" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— Select flock —</SelectItem>
        {flocks.map(f => (
          <SelectItem key={String(f.id)} value={String(f.id)}>
            {String(f.flockNumber ?? f.id)}{f.houseName ? ` — ${f.houseName}` : ""}{f.species ? ` (${f.species})` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function fmtFlock(r: Record<string, unknown>): string {
  if (r.flockNumber) return String(r.flockNumber) + (r.houseName ? ` · ${r.houseName}` : "");
  return r.flockId ? String(r.flockId) : "—";
}

function MortalityTab({ farmId }: { farmId: number }) {
  const flocks = useFlocks(farmId);
  const { data: records, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "poultry-daily-mortality", "poultry-mortality");
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Daily Mortality Records</h3><Button size="sm" onClick={() => openAdd({ mortalityCount: "0", culledCount: "0" })}><Plus className="w-4 h-4 mr-1" />Log Mortality</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "recordDate", label: "Date", fmt: r => fmtDate(r.recordDate) },
        { key: "flockNumber", label: "Flock", fmt: fmtFlock },
        { key: "mortalityCount", label: "Deaths" },
        { key: "culledCount", label: "Culled" },
        { key: "mortalityPercentage", label: "% Running" },
        { key: "mainCause", label: "Main Cause" },
      ]} rows={records as Record<string, unknown>[]} onEdit={r => openEdit(r as Record<string, unknown>)} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Daily Mortality</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date *</Label><Input type="date" value={String(form.recordDate ?? "")} onChange={e => setForm(f => ({ ...f, recordDate: e.target.value }))} /></div>
            <div><Label>Flock *</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            {[["mortalityCount", "Deaths *"], ["culledCount", "Culled *"], ["runningTotalMortality", "Running Total"], ["mortalityPercentage", "Mortality %"]].map(([k, l]) => <div key={k}><Label>{l}</Label><Input type="number" step="0.01" value={String(form[k] ?? "")} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>)}
            <div className="col-span-2"><Label>Main Cause</Label><Input value={String(form.mainCause ?? "")} onChange={e => setForm(f => ({ ...f, mainCause: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TreatmentsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: rawRecords, isLoading } = useQuery({
    queryKey: ["poultry-treatments", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-treatments`), { credentials: "include" }).then(r => r.json()),
  });
  const records: Record<string, unknown>[] = Array.isArray(rawRecords) ? rawRecords : [];

  const { data: rawFlocks } = useQuery({
    queryKey: ["poultry-flocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()),
  });
  const flocks: Record<string, unknown>[] = Array.isArray(rawFlocks) ? rawFlocks.map((r: { flock: Record<string, unknown>; houseName: string | null }) => ({ ...r.flock, houseName: r.houseName })) : [];

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/poultry-treatments/${editing.id}`) : api(`farms/${farmId}/poultry-treatments`);
      const payload = { ...body };
      if (payload.flockId === "__none__" || payload.flockId === "") payload.flockId = null;
      else if (payload.flockId) payload.flockId = Number(payload.flockId);
      if (payload.durationDays === "") payload.durationDays = null; else if (payload.durationDays) payload.durationDays = Number(payload.durationDays);
      if (payload.withdrawalPeriodDays === "") payload.withdrawalPeriodDays = null; else if (payload.withdrawalPeriodDays) payload.withdrawalPeriodDays = Number(payload.withdrawalPeriodDays);
      if (payload.numberOfBirdsTreated === "") payload.numberOfBirdsTreated = null; else if (payload.numberOfBirdsTreated) payload.numberOfBirdsTreated = Number(payload.numberOfBirdsTreated);
      payload.prescriptionObtained = Boolean(payload.prescriptionObtained);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-treatments", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-treatments/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poultry-treatments", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ prescriptionObtained: false }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm({ ...r, flockId: r.flockId != null ? String(r.flockId) : "__none__" }); setOpen(true); }

  const todayStr = new Date().toISOString().split("T")[0];

  function handleWithdrawalDays(days: string) {
    setForm(f => {
      const updated = { ...f, withdrawalPeriodDays: days };
      const treatDate = f.treatmentDate as string | undefined;
      if (days && treatDate) {
        const clear = new Date(treatDate);
        clear.setDate(clear.getDate() + Number(days));
        updated.withdrawalClearDate = clear.toISOString().split("T")[0];
      }
      return updated;
    });
  }

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-blue-100 bg-blue-50 flex items-start gap-2">
        <Pill className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800">Records required under <strong>Veterinary Medicines Regulations 2013</strong>. Retain for minimum 5 years. POM-V medicines must have a valid veterinary prescription — record the prescribing vet's details for every such treatment.</p>
      </div>
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Medication & Treatment Records</h3>
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Treatment</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : records.length === 0 ? (
        <Empty msg="No treatment records yet. Log all medicines administered to your flocks, including over-the-counter and prescription products." />
      ) : (
        <div className="space-y-2">
          {records.map((r, i) => {
            const isWithdrawal = r.withdrawalClearDate && String(r.withdrawalClearDate) >= todayStr;
            return (
              <div key={i} className={`border rounded-lg p-3 bg-white ${isWithdrawal ? "border-amber-300" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{String(r.productName ?? "—")}</span>
                      {!!r.flockNumber && <Badge variant="outline" className="text-xs">{String(r.flockNumber)}{r.houseName ? ` · ${r.houseName}` : ""}</Badge>}
                      {isWithdrawal && <Badge className="text-xs bg-amber-100 text-amber-800 border border-amber-300">⚠ Withdrawal until {fmtDate(r.withdrawalClearDate)}</Badge>}
                      {r.prescriptionObtained && <Badge className="text-xs bg-green-100 text-green-800 border border-green-200">Rx ✓</Badge>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      <span><span className="font-medium text-foreground/70">Date:</span> {fmtDate(r.treatmentDate)}</span>
                      <span><span className="font-medium text-foreground/70">Condition:</span> {String(r.condition ?? "—")}</span>
                      <span><span className="font-medium text-foreground/70">Route:</span> {String(r.routeOfAdministration ?? "—")}</span>
                      {!!r.numberOfBirdsTreated && <span><span className="font-medium text-foreground/70">Birds:</span> {String(r.numberOfBirdsTreated)}</span>}
                      {!!r.prescribingVetName && <span><span className="font-medium text-foreground/70">Vet:</span> {String(r.prescribingVetName)}</span>}
                      {!!r.withdrawalPeriodDays && <span><span className="font-medium text-foreground/70">Withdrawal:</span> {String(r.withdrawalPeriodDays)} days</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(r.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Treatment Record" : "Record Medicine Treatment"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">Treatment Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Treatment Date *</Label><Input type="date" value={String(form.treatmentDate ?? "")} onChange={e => setForm(f => ({ ...f, treatmentDate: e.target.value }))} /></div>
              <div><Label>Flock *</Label>
                <Select value={String(form.flockId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, flockId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select flock" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select flock —</SelectItem>
                    {flocks.map((fl: Record<string, unknown>) => (
                      <SelectItem key={String(fl.id)} value={String(fl.id)}>
                        {String(fl.flockNumber ?? fl.id)}{fl.houseName ? ` — ${fl.houseName}` : ""}{fl.species ? ` (${fl.species})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Number of Birds Treated</Label><Input type="number" min="1" value={String(form.numberOfBirdsTreated ?? "")} onChange={e => setForm(f => ({ ...f, numberOfBirdsTreated: e.target.value }))} /></div>
              <div><Label>Condition / Diagnosis *</Label><Input placeholder="e.g. Respiratory infection" value={String(form.condition ?? "")} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))} /></div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">Medicine Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Product Name *</Label><Input placeholder="e.g. Tylan 200mg/ml, Baytril 100" value={String(form.productName ?? "")} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} /></div>
              <div><Label>Active Ingredient</Label><Input placeholder="e.g. Tylosin, Enrofloxacin" value={String(form.activeIngredient ?? "")} onChange={e => setForm(f => ({ ...f, activeIngredient: e.target.value }))} /></div>
              <div><Label>Route of Administration *</Label>
                <Select value={String(form.routeOfAdministration ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, routeOfAdministration: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {["In-water medication", "In-feed medication", "Injection", "Spray", "Eye drops", "Topical", "Oral (individual)"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Dose Rate</Label><Input placeholder="e.g. 1ml per litre of water" value={String(form.doseRate ?? "")} onChange={e => setForm(f => ({ ...f, doseRate: e.target.value }))} /></div>
              <div><Label>Duration (days)</Label><Input type="number" min="1" value={String(form.durationDays ?? "")} onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))} /></div>
              <div><Label>Batch Number</Label><Input placeholder="From product label" value={String(form.batchNumber ?? "")} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={String(form.expiryDate ?? "")} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
              <div><Label>Administered By</Label><Input placeholder="Person who gave the treatment" value={String(form.administeredBy ?? "")} onChange={e => setForm(f => ({ ...f, administeredBy: e.target.value }))} /></div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">Withdrawal Period</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Withdrawal Period (days)</Label><Input type="number" min="0" value={String(form.withdrawalPeriodDays ?? "")} onChange={e => handleWithdrawalDays(e.target.value)} /></div>
              <div><Label>Withdrawal Clear Date</Label><Input type="date" value={String(form.withdrawalClearDate ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalClearDate: e.target.value }))} /></div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">Veterinary Prescription (VMR 2013)</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prescribing Vet Name</Label><Input placeholder="e.g. Dr. J. Bloggs" value={String(form.prescribingVetName ?? "")} onChange={e => setForm(f => ({ ...f, prescribingVetName: e.target.value }))} /></div>
              <div><Label>Vet Practice</Label><Input placeholder="e.g. Westway Vets" value={String(form.prescribingVetPractice ?? "")} onChange={e => setForm(f => ({ ...f, prescribingVetPractice: e.target.value }))} /></div>
              <div className="col-span-2 flex items-center gap-2 mt-1">
                <Checkbox id="rxObtained" checked={Boolean(form.prescriptionObtained)} onCheckedChange={v => setForm(f => ({ ...f, prescriptionObtained: Boolean(v) }))} />
                <Label htmlFor="rxObtained" className="font-normal cursor-pointer">Prescription obtained (required for POM-V medicines)</Label>
              </div>
            </div>

            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.treatmentDate || !form.productName || !form.condition || !form.routeOfAdministration || !form.flockId || form.flockId === "__none__"}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CleanoutsTab({ farmId }: { farmId: number }) {
  const flocks = useFlocks(farmId);
  const { data: rawHouses = [] } = useQuery({ queryKey: ["poultry-houses", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-houses`), { credentials: "include" }).then(r => r.json()) });
  const houses = rawHouses as Record<string, unknown>[];
  const { data: records, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "poultry-house-cleanouts", "poultry-cleanouts");
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">House Cleanout & Disinfection Records</h3><Button size="sm" onClick={() => openAdd({ swabsTaken: false })}><Plus className="w-4 h-4 mr-1" />Add Cleanout</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "cleanoutStartDate", label: "Start Date", fmt: r => fmtDate(r.cleanoutStartDate) },
        { key: "houseName", label: "House", fmt: r => r.houseName ? String(r.houseName) : fmt(r.houseId) },
        { key: "flockNumber", label: "Flock", fmt: r => r.flockNumber ? String(r.flockNumber) : "—" },
        { key: "cleanoutEndDate", label: "End Date", fmt: r => fmtDate(r.cleanoutEndDate) },
        { key: "disinfectantUsed", label: "Disinfectant" },
        { key: "contactTimeMins", label: "Contact (mins)" },
        { key: "completedBy", label: "Completed By" },
      ]} rows={records as Record<string, unknown>[]} onEdit={r => openEdit(r as Record<string, unknown>)} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>House Cleanout Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>House *</Label>
              <Select value={String(form.houseId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, houseId: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select house —</SelectItem>
                  {houses.map(h => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.houseName ?? h.id)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Flock (outgoing)</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            <div><Label>Cleanout Start *</Label><Input type="date" value={String(form.cleanoutStartDate ?? "")} onChange={e => setForm(f => ({ ...f, cleanoutStartDate: e.target.value }))} /></div>
            <div><Label>Cleanout End</Label><Input type="date" value={String(form.cleanoutEndDate ?? "")} onChange={e => setForm(f => ({ ...f, cleanoutEndDate: e.target.value }))} /></div>
            <div><Label>Disinfectant Used</Label><Input value={String(form.disinfectantUsed ?? "")} onChange={e => setForm(f => ({ ...f, disinfectantUsed: e.target.value }))} /></div>
            <div><Label>Approval Number</Label><Input value={String(form.disinfectantApprovalNumber ?? "")} onChange={e => setForm(f => ({ ...f, disinfectantApprovalNumber: e.target.value }))} /></div>
            <div><Label>Contact Time (mins)</Label><Input type="number" value={String(form.contactTimeMins ?? "")} onChange={e => setForm(f => ({ ...f, contactTimeMins: e.target.value }))} /></div>
            <div><Label>Standing Time (days)</Label><Input type="number" value={String(form.standingTimeDays ?? "")} onChange={e => setForm(f => ({ ...f, standingTimeDays: e.target.value }))} /></div>
            <div><Label>Completed By</Label><Input value={String(form.completedBy ?? "")} onChange={e => setForm(f => ({ ...f, completedBy: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-5"><Checkbox id="swabs" checked={Boolean(form.swabsTaken)} onCheckedChange={v => setForm(f => ({ ...f, swabsTaken: Boolean(v) }))} /><Label htmlFor="swabs">Swabs taken?</Label></div>
            <div className="col-span-2"><Label>Swab Results</Label><Input value={String(form.swabResults ?? "")} onChange={e => setForm(f => ({ ...f, swabResults: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, houseId: form.houseId ? Number(form.houseId) : null, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EnvironmentalLogsTab({ farmId }: { farmId: number }) {
  const flocks = useFlocks(farmId);
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "poultry-environmental-logs", "poultry-env-logs");
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Environmental Monitoring Logs</h3><Button size="sm" onClick={() => openAdd({ alarmActivated: false })}><Plus className="w-4 h-4 mr-1" />Log Reading</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "logDate", label: "Date", fmt: r => fmtDate(r.logDate) },
        { key: "flockNumber", label: "Flock", fmt: fmtFlock },
        { key: "temperatureMin", label: "Min °C" },
        { key: "temperatureMax", label: "Max °C" },
        { key: "humidity", label: "Humidity %" },
        { key: "ammoniaPpm", label: "Ammonia ppm" },
        { key: "stockingDensity", label: "kg/m²" },
      ]} rows={records as Record<string, unknown>[]} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Environmental Log</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Date *</Label><Input type="date" value={String(form.logDate ?? "")} onChange={e => setForm(f => ({ ...f, logDate: e.target.value }))} /></div>
            <div><Label>Time</Label><Input type="time" value={String(form.logTime ?? "")} onChange={e => setForm(f => ({ ...f, logTime: e.target.value }))} /></div>
            <div><Label>Flock *</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            <div><Label>Min Temp (°C)</Label><Input type="number" step="0.1" value={String(form.temperatureMin ?? "")} onChange={e => setForm(f => ({ ...f, temperatureMin: e.target.value }))} /></div>
            <div><Label>Max Temp (°C)</Label><Input type="number" step="0.1" value={String(form.temperatureMax ?? "")} onChange={e => setForm(f => ({ ...f, temperatureMax: e.target.value }))} /></div>
            <div><Label>Humidity (%)</Label><Input type="number" step="0.1" value={String(form.humidity ?? "")} onChange={e => setForm(f => ({ ...f, humidity: e.target.value }))} /></div>
            <div><Label>CO₂ (ppm)</Label><Input type="number" value={String(form.co2Ppm ?? "")} onChange={e => setForm(f => ({ ...f, co2Ppm: e.target.value }))} /></div>
            <div><Label>Ammonia (ppm)</Label><Input type="number" step="0.1" value={String(form.ammoniaPpm ?? "")} onChange={e => setForm(f => ({ ...f, ammoniaPpm: e.target.value }))} /></div>
            <div><Label>Stocking Density (kg/m²)</Label><Input type="number" step="0.01" value={String(form.stockingDensity ?? "")} onChange={e => setForm(f => ({ ...f, stockingDensity: e.target.value }))} /></div>
            <div><Label>Lighting (hours)</Label><Input type="number" step="0.5" value={String(form.lightingHours ?? "")} onChange={e => setForm(f => ({ ...f, lightingHours: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-5 col-span-3"><Checkbox id="alarm" checked={Boolean(form.alarmActivated)} onCheckedChange={v => setForm(f => ({ ...f, alarmActivated: Boolean(v) }))} /><Label htmlFor="alarm">Alarm activated?</Label></div>
            <div className="col-span-3"><Label>Alarm Details</Label><Input value={String(form.alarmDetails ?? "")} onChange={e => setForm(f => ({ ...f, alarmDetails: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FciTab({ farmId }: { farmId: number }) {
  const flocks = useFlocks(farmId);
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "poultry-fci-documents", "poultry-fci");
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Food Chain Information (FCI) Documents</h3><Button size="sm" onClick={() => openAdd({ withdrawalPeriodClear: true, signedByFarmer: true, anyDiseaseOrCondition: false, medicationsLast7Days: false })}><Plus className="w-4 h-4 mr-1" />Add FCI Doc</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "documentDate", label: "Date", fmt: r => fmtDate(r.documentDate) },
        { key: "flockNumber", label: "Flock", fmt: fmtFlock },
        { key: "destinationAbattoir", label: "Abattoir" },
        { key: "numberOfBirds", label: "Birds" },
        { key: "catchingContractor", label: "Catching Contractor" },
        { key: "withdrawalPeriodClear", label: "Withdrawal Clear", fmt: r => r.withdrawalPeriodClear ? "✓ Yes" : "No" },
      ]} rows={records as Record<string, unknown>[]} onDelete={r => del.mutate(r.id as number)} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>Poultry FCI Document</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Document Date *</Label><Input type="date" value={String(form.documentDate ?? "")} onChange={e => setForm(f => ({ ...f, documentDate: e.target.value }))} /></div>
            <div><Label>Flock *</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            <div><Label>Catching Date</Label><Input type="date" value={String(form.catchingDate ?? "")} onChange={e => setForm(f => ({ ...f, catchingDate: e.target.value }))} /></div>
            <div><Label>Destination Abattoir</Label><Input value={String(form.destinationAbattoir ?? "")} onChange={e => setForm(f => ({ ...f, destinationAbattoir: e.target.value }))} /></div>
            <div><Label>Number of Birds *</Label><Input type="number" value={String(form.numberOfBirds ?? "")} onChange={e => setForm(f => ({ ...f, numberOfBirds: e.target.value }))} /></div>
            <div><Label>Catching Contractor</Label><Input value={String(form.catchingContractor ?? "")} onChange={e => setForm(f => ({ ...f, catchingContractor: e.target.value }))} /></div>
            <div><Label>Feed Withdrawal (hours)</Label><Input type="number" value={String(form.lastFeedWithdrawalHours ?? "")} onChange={e => setForm(f => ({ ...f, lastFeedWithdrawalHours: e.target.value }))} /></div>
            <div className="col-span-2 space-y-2">
              {([["anyDiseaseOrCondition", "Any disease or condition?"], ["medicationsLast7Days", "Medications in last 7 days?"], ["withdrawalPeriodClear", "Withdrawal period clear?"], ["signedByFarmer", "Signed by farmer?"]] as [string, string][]).map(([k, l]) => (
                <div key={k} className="flex items-center gap-2"><Checkbox id={k} checked={Boolean(form[k])} onCheckedChange={v => setForm(f => ({ ...f, [k]: Boolean(v) }))} /><Label htmlFor={k}>{l}</Label></div>
              ))}
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BroilerWelfareTab({ farmId }: { farmId: number }) {
  const flocks = useFlocks(farmId);
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "poultry-broiler-welfare", "poultry-broiler-welfare");
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Broiler Welfare Indicators (BWI)</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Red Tractor Broilers — pododermatitis, hock burn and gait score must be assessed and recorded at each crop cycle.</p>
        </div>
        <Button size="sm" onClick={() => openAdd({ overallOutcome: "Pass" })}><Plus className="w-4 h-4 mr-1" />Add Assessment</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "assessmentDate", label: "Date", fmt: r => fmtDate(r.assessmentDate) },
          { key: "flockNumber", label: "Flock", fmt: fmtFlock },
          { key: "assessedBy", label: "Assessed By" },
          { key: "ageAtAssessmentDays", label: "Bird Age (days)" },
          { key: "footpadDermatitisScore", label: "FPD Score" },
          { key: "hockBurnScore", label: "Hock Burn Score" },
          { key: "gaitScore", label: "Gait Score" },
          { key: "overallOutcome", label: "Outcome" },
        ]}
        rows={records as Record<string, unknown>[]}
        onDelete={r => del.mutate(r.id as number)}
      />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>Broiler Welfare Indicators Assessment</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto pr-1">
            <div><Label>Assessment Date *</Label><Input type="date" value={String(form.assessmentDate ?? "")} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
            <div><Label>Flock *</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            <div><Label>Assessed By *</Label><Input value={String(form.assessedBy ?? "")} onChange={e => setForm(f => ({ ...f, assessedBy: e.target.value }))} /></div>
            <div><Label>Bird Age (days)</Label><Input type="number" value={String(form.ageAtAssessmentDays ?? "")} onChange={e => setForm(f => ({ ...f, ageAtAssessmentDays: e.target.value }))} /></div>
            <div><Label>Sample Size (birds)</Label><Input type="number" value={String(form.sampleSize ?? "")} onChange={e => setForm(f => ({ ...f, sampleSize: e.target.value }))} /></div>
            <div>
              <Label>Footpad Dermatitis Score</Label>
              <Select value={String(form.footpadDermatitisScore ?? "")} onValueChange={v => setForm(f => ({ ...f, footpadDermatitisScore: v }))}>
                <SelectTrigger><SelectValue placeholder="AVEC 0–3" /></SelectTrigger>
                <SelectContent>{["0 — No lesion", "1 — Superficial", "2 — Moderate", "3 — Severe"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>FPD Prevalence (%)</Label><Input type="number" step="0.1" value={String(form.footpadDermatitisPercent ?? "")} onChange={e => setForm(f => ({ ...f, footpadDermatitisPercent: e.target.value }))} /></div>
            <div>
              <Label>Hock Burn Score</Label>
              <Select value={String(form.hockBurnScore ?? "")} onValueChange={v => setForm(f => ({ ...f, hockBurnScore: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["0 — None", "1 — Minor discolouration", "2 — Moderate lesion", "3 — Severe lesion"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Hock Burn Prevalence (%)</Label><Input type="number" step="0.1" value={String(form.hockBurnPercent ?? "")} onChange={e => setForm(f => ({ ...f, hockBurnPercent: e.target.value }))} /></div>
            <div>
              <Label>Gait Score</Label>
              <Select value={String(form.gaitScore ?? "")} onValueChange={v => setForm(f => ({ ...f, gaitScore: v }))}>
                <SelectTrigger><SelectValue placeholder="Bristol 0–5" /></SelectTrigger>
                <SelectContent>{["0 — Normal", "1 — Slight impairment", "2 — Definite abnormality", "3 — Moderate impairment", "4 — Severe impairment", "5 — Unable to walk"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Breast Blister (%)</Label><Input type="number" step="0.1" value={String(form.breastBlisterPercent ?? "")} onChange={e => setForm(f => ({ ...f, breastBlisterPercent: e.target.value }))} /></div>
            <div>
              <Label>Plumage Score</Label>
              <Select value={String(form.plumageScore ?? "")} onValueChange={v => setForm(f => ({ ...f, plumageScore: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Good — clean & full", "Fair — minor soiling", "Poor — dirty/wet", "Very poor — severe soiling"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Soiled Plumage (%)</Label><Input type="number" step="0.1" value={String(form.soiledPlumagePercent ?? "")} onChange={e => setForm(f => ({ ...f, soiledPlumagePercent: e.target.value }))} /></div>
            <div>
              <Label>Overall Outcome *</Label>
              <Select value={String(form.overallOutcome ?? "")} onValueChange={v => setForm(f => ({ ...f, overallOutcome: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Pass", "Advisory — monitor closely", "Fail — action required"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-3"><Label>Actions Taken</Label><Textarea value={String(form.actionsTaken ?? "")} onChange={e => setForm(f => ({ ...f, actionsTaken: e.target.value }))} rows={2} placeholder="e.g. Increased litter depth, adjusted drinker height, improved ventilation" /></div>
            <div className="col-span-3"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save Assessment</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ThinningRecordsTab({ farmId }: { farmId: number }) {
  const flocks = useFlocks(farmId);
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "poultry-thinning-records", "poultry-thinning");
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Thinning Records</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record each partial depletion event — numbers removed, live weight, catching details and any DOAs at loading.</p>
        </div>
        <Button size="sm" onClick={() => openAdd({ thinningNumber: "1", doasAtLoading: "0" })}><Plus className="w-4 h-4 mr-1" />Log Thinning</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "thinningDate", label: "Date", fmt: r => fmtDate(r.thinningDate) },
          { key: "flockNumber", label: "Flock", fmt: fmtFlock },
          { key: "thinningNumber", label: "Thinning No." },
          { key: "birdsRemoved", label: "Birds Removed" },
          { key: "averageLiveWeightKg", label: "Avg Live Wt (kg)" },
          { key: "destinationAbattoir", label: "Abattoir" },
          { key: "doasAtLoading", label: "DOAs at Loading" },
        ]}
        rows={records as Record<string, unknown>[]}
        onDelete={r => del.mutate(r.id as number)}
      />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>Thinning Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Thinning Date *</Label><Input type="date" value={String(form.thinningDate ?? "")} onChange={e => setForm(f => ({ ...f, thinningDate: e.target.value }))} /></div>
            <div><Label>Flock *</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            <div>
              <Label>Thinning Number *</Label>
              <Select value={String(form.thinningNumber ?? "1")} onValueChange={v => setForm(f => ({ ...f, thinningNumber: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["1st thinning", "2nd thinning", "3rd thinning", "Final depletion"].map((o, i) => <SelectItem key={o} value={String(i + 1)}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Birds Removed *</Label><Input type="number" value={String(form.birdsRemoved ?? "")} onChange={e => setForm(f => ({ ...f, birdsRemoved: e.target.value }))} /></div>
            <div><Label>DOAs at Loading</Label><Input type="number" value={String(form.doasAtLoading ?? "0")} onChange={e => setForm(f => ({ ...f, doasAtLoading: e.target.value }))} /></div>
            <div><Label>Target Live Weight (kg)</Label><Input type="number" step="0.01" value={String(form.targetLiveWeightKg ?? "")} onChange={e => setForm(f => ({ ...f, targetLiveWeightKg: e.target.value }))} /></div>
            <div><Label>Average Live Weight (kg)</Label><Input type="number" step="0.01" value={String(form.averageLiveWeightKg ?? "")} onChange={e => setForm(f => ({ ...f, averageLiveWeightKg: e.target.value }))} /></div>
            <div><Label>Destination Abattoir</Label><Input value={String(form.destinationAbattoir ?? "")} onChange={e => setForm(f => ({ ...f, destinationAbattoir: e.target.value }))} /></div>
            <div><Label>Catching Contractor</Label><Input value={String(form.catchingContractorName ?? "")} onChange={e => setForm(f => ({ ...f, catchingContractorName: e.target.value }))} /></div>
            <div><Label>Catching Start Time</Label><Input type="time" value={String(form.catchingStartTime ?? "")} onChange={e => setForm(f => ({ ...f, catchingStartTime: e.target.value }))} /></div>
            <div><Label>Catching End Time</Label><Input type="time" value={String(form.catchingEndTime ?? "")} onChange={e => setForm(f => ({ ...f, catchingEndTime: e.target.value }))} /></div>
            <div><Label>Transport Vehicle Reg</Label><Input value={String(form.transportVehicleReg ?? "")} onChange={e => setForm(f => ({ ...f, transportVehicleReg: e.target.value }))} /></div>
            <div><Label>Catching Conditions</Label><Input value={String(form.catchingConditions ?? "")} onChange={e => setForm(f => ({ ...f, catchingConditions: e.target.value }))} placeholder="e.g. Good, dark, calm" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BioBoolField({ label, field, form, setForm }: { label: string; field: string; form: Record<string, unknown>; setForm: React.Dispatch<React.SetStateAction<Record<string, unknown>>> }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={`bio-${field}`} checked={Boolean(form[field])} onCheckedChange={v => setForm(f => ({ ...f, [field]: Boolean(v) }))} />
      <Label htmlFor={`bio-${field}`} className="text-sm">{label}</Label>
    </div>
  );
}

function BiosecurityChecklistTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const flocks = useFlocks(farmId);
  const { data: rawHouses = [] } = useQuery({ queryKey: ["poultry-houses", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-houses`), { credentials: "include" }).then(r => r.json()) });
  const houses = rawHouses as Record<string, unknown>[];
  const { data: records = [], isLoading } = useQuery({ queryKey: ["poultry-biosecurity", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-biosecurity-checklists`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => {
      const payload = { ...b };
      if (payload.houseId) payload.houseId = Number(payload.houseId); else payload.houseId = null;
      if (payload.previousFlockId && payload.previousFlockId !== "__none__") payload.previousFlockId = Number(payload.previousFlockId); else payload.previousFlockId = null;
      if (payload.downtimeDays) payload.downtimeDays = Number(payload.downtimeDays); else payload.downtimeDays = null;
      return fetch(editing ? api(`farms/${farmId}/poultry-biosecurity-checklists/${editing.id}`) : api(`farms/${farmId}/poultry-biosecurity-checklists`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-biosecurity", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-biosecurity-checklists/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["poultry-biosecurity", farmId] }) });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Biosecurity Checklist — Downtime & Cleanout</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record end-of-flock biosecurity procedures for each house cleanout to demonstrate Red Tractor and RSPCA Assured compliance. All items must be completed before restocking.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ cleanoutStartDate: new Date().toISOString().slice(0, 10), overallComplianceStatus: "in-progress", vehicleRestrictions: true }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Checklist</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "cleanoutStartDate", label: "Cleanout Start", fmt: r => fmtDate(r.cleanoutStartDate) },
          { key: "houseName", label: "House", fmt: r => r.houseName ? String(r.houseName) : fmt(r.houseId) },
          { key: "cleanoutEndDate", label: "Cleanout End", fmt: r => fmtDate(r.cleanoutEndDate) },
          { key: "downtimeDays", label: "Downtime (days)" },
          { key: "overallComplianceStatus", label: "Status" },
          { key: "completedBy", label: "Completed By" },
        ]}
        rows={records as Record<string, unknown>[]}
        onEdit={r => { setEditing(r); setForm({ ...r, houseId: r.houseId ? String(r.houseId) : "__none__", previousFlockId: r.previousFlockId ? String(r.previousFlockId) : "__none__" }); setOpen(true); }}
        onDelete={r => del.mutate(r.id as number)}
      />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "52rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Biosecurity Checklist</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Cleanout Start Date *</Label><Input type="date" value={String(form.cleanoutStartDate ?? "")} onChange={e => setForm(f => ({ ...f, cleanoutStartDate: e.target.value }))} /></div>
            <div><Label>Poultry House *</Label>
              <Select value={String(form.houseId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, houseId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— Select house —</SelectItem>{houses.map(h => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.houseName ?? h.id)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Previous Flock</Label>
              <Select value={String(form.previousFlockId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, previousFlockId: v }))}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {flocks.map(fl => <SelectItem key={String(fl.id)} value={String(fl.id)}>{String(fl.flockNumber ?? fl.id)}{fl.houseName ? ` — ${fl.houseName}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Cleanout End Date</Label><Input type="date" value={String(form.cleanoutEndDate ?? "")} onChange={e => setForm(f => ({ ...f, cleanoutEndDate: e.target.value }))} /></div>
            <div><Label>Downtime Days</Label><Input type="number" min="0" value={String(form.downtimeDays ?? "")} onChange={e => setForm(f => ({ ...f, downtimeDays: e.target.value }))} /></div>
            <div><Label>Overall Status</Label>
              <Select value={String(form.overallComplianceStatus ?? "in-progress")} onValueChange={v => setForm(f => ({ ...f, overallComplianceStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["in-progress", "complete", "non-compliant"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3 mb-1">Biosecurity Checklist Items</p>
          <div className="grid grid-cols-2 gap-2">
            <BioBoolField label="Catching / depopulation complete" field="catchingComplete" form={form} setForm={setForm} />
            <BioBoolField label="Litter / manure fully removed" field="litterRemoved" form={form} setForm={setForm} />
            <BioBoolField label="Dry clean complete (swept out)" field="dryCleanComplete" form={form} setForm={setForm} />
            <BioBoolField label="House washed out (wet clean)" field="washComplete" form={form} setForm={setForm} />
            <BioBoolField label="Disinfection complete" field="disinfectionComplete" form={form} setForm={setForm} />
            <BioBoolField label="Disinfectant is an approved product" field="disinfectantApproved" form={form} setForm={setForm} />
            <BioBoolField label="Fumigation complete" field="fumigationComplete" form={form} setForm={setForm} />
            <BioBoolField label="Vermin / pest control complete" field="verminControlComplete" form={form} setForm={setForm} />
            <BioBoolField label="Water system flushed" field="waterSystemFlushComplete" form={form} setForm={setForm} />
            <BioBoolField label="Water system disinfected" field="waterSystemDisinfected" form={form} setForm={setForm} />
            <BioBoolField label="Feed system cleaned" field="feedSystemCleaned" form={form} setForm={setForm} />
            <BioBoolField label="Ventilation checked" field="ventilationChecked" form={form} setForm={setForm} />
            <BioBoolField label="Heating checked" field="heatingChecked" form={form} setForm={setForm} />
            <BioBoolField label="Footbaths installed at entrances" field="footbathsInstalled" form={form} setForm={setForm} />
            <BioBoolField label="Vehicle restrictions in place" field="vehicleRestrictions" form={form} setForm={setForm} />
            <BioBoolField label="Visitor log in place" field="visitorLogInPlace" form={form} setForm={setForm} />
            <BioBoolField label="Independent audit completed" field="independentAuditCompleted" form={form} setForm={setForm} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div><Label>Disinfectant Used</Label><Input value={String(form.disinfectantUsed ?? "")} onChange={e => setForm(f => ({ ...f, disinfectantUsed: e.target.value }))} /></div>
            <div><Label>Dilution Rate</Label><Input placeholder="e.g. 1:200" value={String(form.disinfectantDilutionRate ?? "")} onChange={e => setForm(f => ({ ...f, disinfectantDilutionRate: e.target.value }))} /></div>
            <div><Label>Litter Disposal Method</Label><Input placeholder="e.g. Composted on-farm" value={String(form.litterDisposalMethod ?? "")} onChange={e => setForm(f => ({ ...f, litterDisposalMethod: e.target.value }))} /></div>
            <div><Label>Audit Body</Label><Input placeholder="e.g. Red Tractor, RSPCA" value={String(form.auditBody ?? "")} onChange={e => setForm(f => ({ ...f, auditBody: e.target.value }))} /></div>
            <div><Label>Completed By</Label><Input value={String(form.completedBy ?? "")} onChange={e => setForm(f => ({ ...f, completedBy: e.target.value }))} /></div>
            <div><Label>Scheme / Certification</Label><Input placeholder="e.g. Red Tractor Broilers" value={String(form.schemeCertificationScheme ?? "")} onChange={e => setForm(f => ({ ...f, schemeCertificationScheme: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes / Deficiencies</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SchemeRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["poultry-schemes", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-scheme-records`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/poultry-scheme-records/${editing.id}`) : api(`farms/${farmId}/poultry-scheme-records`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-schemes", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-scheme-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["poultry-schemes", farmId] }) });
  const SCHEMES = ["Red Tractor Poultry (Broiler)", "Red Tractor Poultry (Turkey)", "Red Tractor Poultry (Laying Hens)", "Lion Quality", "RSPCA Assured", "Organic (Soil Association)", "Organic (OF&G)", "Free Range", "Higher Welfare", "M&S Select Farms", "Other"];
  const OUTCOMES = ["Pass", "Conditional Pass", "Fail", "Pending", "Under Review"];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Assurance Scheme Records</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Log all Red Tractor Poultry, Lion Quality, RSPCA Assured and retailer assurance assessments. Track certificate numbers, assessment dates and non-conformances to maintain compliance status.</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ assessmentYear: String(new Date().getFullYear()), assessmentOutcome: "Pass" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "schemeName", label: "Scheme" },
          { key: "certificateNumber", label: "Certificate No." },
          { key: "assessmentDate", label: "Assessment Date", fmt: r => fmtDate(r.assessmentDate) },
          { key: "assessorName", label: "Assessor" },
          { key: "assessmentOutcome", label: "Outcome" },
          { key: "certificateExpiryDate", label: "Expires", fmt: r => fmtDate(r.certificateExpiryDate) },
          { key: "nonConformances", label: "Non-conformances" },
        ]}
        rows={records as Record<string, unknown>[]}
        onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
        onDelete={r => del.mutate(r.id as number)}
      />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>Assurance Scheme Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Scheme Name *</Label>
              <Select value={String(form.schemeName ?? "")} onValueChange={v => setForm(f => ({ ...f, schemeName: v }))}>
                <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
                <SelectContent>{SCHEMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Assessment Date *</Label><Input type="date" value={String(form.assessmentDate ?? "")} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
            <div><Label>Assessment Year</Label><Input type="number" value={String(form.assessmentYear ?? "")} onChange={e => setForm(f => ({ ...f, assessmentYear: e.target.value }))} /></div>
            <div><Label>Assessor Name</Label><Input value={String(form.assessorName ?? "")} onChange={e => setForm(f => ({ ...f, assessorName: e.target.value }))} /></div>
            <div><Label>Outcome</Label>
              <Select value={String(form.assessmentOutcome ?? "Pass")} onValueChange={v => setForm(f => ({ ...f, assessmentOutcome: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OUTCOMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Certificate Number</Label><Input value={String(form.certificateNumber ?? "")} onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))} /></div>
            <div><Label>Certificate Expiry Date</Label><Input type="date" value={String(form.certificateExpiryDate ?? "")} onChange={e => setForm(f => ({ ...f, certificateExpiryDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Non-conformances / Observations</Label><Textarea value={String(form.nonConformances ?? "")} onChange={e => setForm(f => ({ ...f, nonConformances: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label>Actions Required</Label><Textarea value={String(form.actionsRequired ?? "")} onChange={e => setForm(f => ({ ...f, actionsRequired: e.target.value }))} rows={2} /></div>
            <div><Label>Actions Completed By Date</Label><Input type="date" value={String(form.actionsCompletedByDate ?? "")} onChange={e => setForm(f => ({ ...f, actionsCompletedByDate: e.target.value }))} /></div>
            <div><Label>Next Assessment Due</Label><Input type="date" value={String(form.nextAssessmentDate ?? "")} onChange={e => setForm(f => ({ ...f, nextAssessmentDate: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── POULTRY FEED TAB ──────────────────────────────────────────────────────────
function PoultryFeedTab({ farmId }: { farmId: number }) {
  const [subTab, setSubTab] = useState<"deliveries" | "consumption">("deliveries");

  const { data: raw, isLoading } = useQuery({
    queryKey: ["poultry-deliveries-view", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/feed-deliveries`), { credentials: "include" }).then(r => r.json()),
    enabled: subTab === "deliveries",
  });
  const all: Record<string, unknown>[] = Array.isArray(raw) ? raw : (raw?.records ?? []);
  const poultryDeliveries = all.filter(d => {
    const sp = String(d.speciesIntended ?? "").toLowerCase();
    return sp === "poultry" || sp === "mixed";
  }).sort((a, b) => String(b.deliveryDate ?? "").localeCompare(String(a.deliveryDate ?? "")));

  return (
    <div className="space-y-4">
      <div className="flex gap-0 border-b">
        {(["deliveries", "consumption"] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${subTab === t ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "deliveries" ? "Feed Deliveries" : "Flock Consumption Records"}
          </button>
        ))}
      </div>
      {subTab === "deliveries" ? (
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-blue-100 bg-blue-50 flex items-start gap-2">
            <Truck className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800">
              Showing all feed deliveries from <strong>Feed Management</strong> where species is set to <em>Poultry</em> or <em>Mixed</em>. To add a delivery, go to Feed Management → Delivery Records.
            </p>
          </div>
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : poultryDeliveries.length === 0 ? (
            <Empty msg='No poultry or mixed-species feed deliveries on record. Log a delivery in Feed Management with species set to "Poultry" or "Mixed".' />
          ) : (
            <div className="space-y-2">
              {poultryDeliveries.map((r, i) => (
                <div key={i} className="border rounded-lg p-3 bg-white">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm">{fmt(r.supplierName)}</span>
                        {String(r.speciesIntended ?? "").toLowerCase() === "mixed" && (
                          <Badge className="text-xs" style={{ background: "#fef9c3", color: "#854d0e", border: "none" }}>Mixed species</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        <span><span className="font-medium text-foreground/70">Date:</span> {fmtDate(r.deliveryDate)}</span>
                        <span><span className="font-medium text-foreground/70">Type:</span> {fmt(r.feedType)}</span>
                        <span><span className="font-medium text-foreground/70">Qty:</span> {fmt(r.quantityKg)} kg</span>
                        {!!r.productName && <span><span className="font-medium text-foreground/70">Product:</span> {fmt(r.productName)}</span>}
                        {!!r.batchNumber && <span><span className="font-medium text-foreground/70">Batch:</span> {fmt(r.batchNumber)}</span>}
                        {!!r.deliveryNoteNumber && <span><span className="font-medium text-foreground/70">Note No.:</span> {fmt(r.deliveryNoteNumber)}</span>}
                        {!!r.ufasNumberOnNote && <span><span className="font-medium text-foreground/70">UFAS No.:</span> {fmt(r.ufasNumberOnNote)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border border-amber-100 bg-amber-50 flex items-start gap-2">
            <UtensilsCrossed className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              Flock-level consumption records (daily feed quantities per house/flock) are recorded via the Livestock section's Feed tab, linked to your poultry herds. This ensures one unified consumption record across all livestock species.
            </p>
          </div>
          <Empty msg="Go to Livestock → Feed tab to record daily flock feed consumption linked to your poultry herds." />
        </div>
      )}
    </div>
  );
}

type Tab = "houses" | "flocks" | "mortality" | "treatments" | "cleanouts" | "envlogs" | "fci" | "bwi" | "thinning" | "biosecurity" | "scheme-records" | "feed";

export default function PoultryProductionPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>(() => { const p = new URLSearchParams(window.location.search); const t = p.get("tab") as Tab | null; const valid: Tab[] = ["houses","flocks","mortality","treatments","cleanouts","envlogs","fci","bwi","thinning","biosecurity","scheme-records","feed"]; return t && valid.includes(t) ? t : "houses"; });
  if (!farmId) return <Redirect to="/" />;
  return (
    <AppLayout title="Poultry Production">
      <div className="space-y-4">
        <TabBar>
          <TabButton active={tab === "houses"} onClick={() => setTab("houses")}><Home className="w-3.5 h-3.5 mr-1" />Houses</TabButton>
          <TabButton active={tab === "flocks"} onClick={() => setTab("flocks")}><Bird className="w-3.5 h-3.5 mr-1" />Flocks</TabButton>
          <TabButton active={tab === "mortality"} onClick={() => setTab("mortality")}><BarChart3 className="w-3.5 h-3.5 mr-1" />Mortality</TabButton>
          <TabButton active={tab === "treatments"} onClick={() => setTab("treatments")}><Pill className="w-3.5 h-3.5 mr-1" />Treatments</TabButton>
          <TabButton active={tab === "cleanouts"} onClick={() => setTab("cleanouts")}><SprayCan className="w-3.5 h-3.5 mr-1" />Cleanouts</TabButton>
          <TabButton active={tab === "envlogs"} onClick={() => setTab("envlogs")}><Thermometer className="w-3.5 h-3.5 mr-1" />Environment</TabButton>
          <TabButton active={tab === "fci"} onClick={() => setTab("fci")}><FileText className="w-3.5 h-3.5 mr-1" />FCI Docs</TabButton>
          <TabButton active={tab === "bwi"} onClick={() => setTab("bwi")}><ShieldCheck className="w-3.5 h-3.5 mr-1" />Broiler Welfare</TabButton>
          <TabButton active={tab === "thinning"} onClick={() => setTab("thinning")}><Scissors className="w-3.5 h-3.5 mr-1" />Thinning</TabButton>
          <TabButton active={tab === "biosecurity"} onClick={() => setTab("biosecurity")}><ClipboardList className="w-3.5 h-3.5 mr-1" />Biosecurity</TabButton>
          <TabButton active={tab === "scheme-records"} onClick={() => setTab("scheme-records")}><Star className="w-3.5 h-3.5 mr-1" />Scheme Records</TabButton>
          <TabButton active={tab === "feed"} onClick={() => setTab("feed")}><Truck className="w-3.5 h-3.5 mr-1" />Feed</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "houses" && <HousesTab farmId={farmId} />}
          {tab === "flocks" && <FlocksTab farmId={farmId} />}
          {tab === "mortality" && <MortalityTab farmId={farmId} />}
          {tab === "treatments" && <TreatmentsTab farmId={farmId} />}
          {tab === "cleanouts" && <CleanoutsTab farmId={farmId} />}
          {tab === "envlogs" && <EnvironmentalLogsTab farmId={farmId} />}
          {tab === "fci" && <FciTab farmId={farmId} />}
          {tab === "bwi" && <BroilerWelfareTab farmId={farmId} />}
          {tab === "thinning" && <ThinningRecordsTab farmId={farmId} />}
          {tab === "biosecurity" && <BiosecurityChecklistTab farmId={farmId} />}
          {tab === "scheme-records" && <SchemeRecordsTab farmId={farmId} />}
          {tab === "feed" && <PoultryFeedTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
