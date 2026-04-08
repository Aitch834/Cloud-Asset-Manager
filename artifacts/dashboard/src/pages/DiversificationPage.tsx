import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Loader2, LayoutList, ShoppingBag, ClipboardCheck, PawPrint, Zap, PoundSterling, Crosshair, TrendingUp } from "lucide-react";
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
function Empty({ msg }: { msg: string }) { return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>; }

function DataTable({ cols, rows, onEdit, onDelete }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void }) {
  if (!rows.length) return <Empty msg="No records yet." />;
  return (
    <div className="overflow-x-auto"><table className="w-full text-sm">
      <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete) && <th />}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i} className="border-b last:border-0">
        {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
        {(onEdit || onDelete) && <td className="py-2 text-right space-x-1">
          {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
          {onDelete && <Button size="icon" variant="ghost" onClick={() => onDelete(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
        </td>}
      </tr>)}</tbody>
    </table></div>
  );
}

function useCrud(farmId: number, endpoint: string, key: string) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const { data = [], isLoading } = useQuery({ queryKey: [key, farmId], queryFn: () => fetch(api(`farms/${farmId}/${endpoint}`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/${endpoint}/${editing.id}`) : api(`farms/${farmId}/${endpoint}`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: [key, farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: [key, farmId] }) });
  function openAdd(def: Record<string, unknown> = {}) { setEditing(null); setForm(def); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""]))); setOpen(true); }
  return { data, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit };
}

function ActivitiesTab({ farmId }: { farmId: number }) {
  const { data: acts, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "diversification-activities", "div-activities");
  const TYPES = ["Farm Shop / Direct Sales", "Holiday Accommodation / Glamping", "Equine / Livery", "Renewable Energy", "Shooting & Game", "Leisure & Recreation", "Food Processing", "Events / Weddings", "Storage / Industrial Let", "Other"];
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Diversification Activities</h3><Button size="sm" onClick={() => openAdd({ status: "active" })}><Plus className="w-4 h-4 mr-1" />Add Activity</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "activityName", label: "Activity" }, { key: "activityType", label: "Type" }, { key: "startDate", label: "Start Date", fmt: r => fmtDate(r.startDate) }, { key: "planningPermissionRef", label: "Planning Ref" }, { key: "status", label: "Status" }, { key: "annualTurnover", label: "Annual Turnover (£)" }]} rows={acts as Record<string, unknown>[]} onEdit={r => openEdit(r as Record<string, unknown>)} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Diversification Activity</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Activity Name *</Label><Input value={String(form.activityName ?? "")} onChange={e => setForm(f => ({ ...f, activityName: e.target.value }))} /></div>
            <div><Label>Activity Type *</Label>
              <Select value={String(form.activityType ?? "")} onValueChange={v => setForm(f => ({ ...f, activityType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Status</Label>
              <Select value={String(form.status ?? "active")} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["active", "planned", "suspended", "ceased"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Start Date *</Label><Input type="date" value={String(form.startDate ?? "")} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
            <div><Label>Annual Turnover (£)</Label><Input type="number" step="0.01" value={String(form.annualTurnover ?? "")} onChange={e => setForm(f => ({ ...f, annualTurnover: e.target.value }))} /></div>
            <div><Label>Planning Permission Ref</Label><Input value={String(form.planningPermissionRef ?? "")} onChange={e => setForm(f => ({ ...f, planningPermissionRef: e.target.value }))} /></div>
            <div><Label>Insurance Policy No.</Label><Input value={String(form.insurancePolicyNumber ?? "")} onChange={e => setForm(f => ({ ...f, insurancePolicyNumber: e.target.value }))} /></div>
            <div><Label>Insurance Renewal Date</Label><Input type="date" value={String(form.insuranceRenewalDate ?? "")} onChange={e => setForm(f => ({ ...f, insuranceRenewalDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FarmShopTab({ farmId }: { farmId: number }) {
  const { data: products, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "farm-shop-products", "shop-products");
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Farm Shop Product List</h3><Button size="sm" onClick={() => openAdd({ active: true })}><Plus className="w-4 h-4 mr-1" />Add Product</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "productName", label: "Product" }, { key: "category", label: "Category" }, { key: "unitOfSale", label: "Unit" }, { key: "pricePerUnit", label: "Price (£)" }, { key: "countryOfOrigin", label: "Origin" }, { key: "active", label: "Active", fmt: r => r.active ? "Yes" : "No" }]} rows={products as Record<string, unknown>[]} onEdit={r => openEdit(r as Record<string, unknown>)} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Farm Shop Product</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Product Name *</Label><Input value={String(form.productName ?? "")} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} /></div>
            <div><Label>Category *</Label>
              <Select value={String(form.category ?? "")} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Meat & Poultry", "Dairy & Eggs", "Fruit & Vegetables", "Cereals & Bread", "Jams & Preserves", "Honey", "Alcohol", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Unit of Sale</Label><Input value={String(form.unitOfSale ?? "")} onChange={e => setForm(f => ({ ...f, unitOfSale: e.target.value }))} /></div>
            <div><Label>Price per Unit (£)</Label><Input type="number" step="0.01" value={String(form.pricePerUnit ?? "")} onChange={e => setForm(f => ({ ...f, pricePerUnit: e.target.value }))} /></div>
            <div><Label>Country of Origin</Label><Input value={String(form.countryOfOrigin ?? "")} onChange={e => setForm(f => ({ ...f, countryOfOrigin: e.target.value }))} /></div>
            <div><Label>Best Before (days)</Label><Input type="number" value={String(form.bestBeforeDays ?? "")} onChange={e => setForm(f => ({ ...f, bestBeforeDays: e.target.value }))} /></div>
            <div><Label>Storage Requirements</Label><Input value={String(form.storageRequirements ?? "")} onChange={e => setForm(f => ({ ...f, storageRequirements: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-4"><Checkbox id="active" checked={Boolean(form.active)} onCheckedChange={v => setForm(f => ({ ...f, active: Boolean(v) }))} /><Label htmlFor="active">Active product?</Label></div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={String(form.description ?? "")} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function HygieneInspectionsTab({ farmId }: { farmId: number }) {
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "farm-shop-hygiene-inspections", "shop-hygiene");
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Hygiene & Food Safety Inspections</h3><Button size="sm" onClick={() => openAdd({ reinspectionRequired: false })}><Plus className="w-4 h-4 mr-1" />Add Inspection</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "inspectionDate", label: "Date", fmt: r => fmtDate(r.inspectionDate) }, { key: "inspectorOrganisation", label: "Organisation" }, { key: "inspectionType", label: "Type" }, { key: "hygieneRating", label: "Hygiene Rating" }, { key: "reinspectionRequired", label: "Reinspection", fmt: r => r.reinspectionRequired ? "Yes" : "No" }]} rows={records as Record<string, unknown>[]} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>Hygiene Inspection</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Inspection Date *</Label><Input type="date" value={String(form.inspectionDate ?? "")} onChange={e => setForm(f => ({ ...f, inspectionDate: e.target.value }))} /></div>
            <div><Label>Inspector Name</Label><Input value={String(form.inspectorName ?? "")} onChange={e => setForm(f => ({ ...f, inspectorName: e.target.value }))} /></div>
            <div><Label>Organisation</Label><Input value={String(form.inspectorOrganisation ?? "")} onChange={e => setForm(f => ({ ...f, inspectorOrganisation: e.target.value }))} /></div>
            <div><Label>Inspection Type *</Label>
              <Select value={String(form.inspectionType ?? "")} onValueChange={v => setForm(f => ({ ...f, inspectionType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Local Authority Routine", "Allergen Compliance", "HACCP Audit", "Red Tractor", "Self-Audit", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Food Hygiene Rating (0-5)</Label><Input type="number" min="0" max="5" value={String(form.hygieneRating ?? "")} onChange={e => setForm(f => ({ ...f, hygieneRating: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-4"><Checkbox id="reinsp" checked={Boolean(form.reinspectionRequired)} onCheckedChange={v => setForm(f => ({ ...f, reinspectionRequired: Boolean(v) }))} /><Label htmlFor="reinsp">Reinspection required?</Label></div>
            <div className="col-span-2"><Label>Findings Summary</Label><Textarea value={String(form.findingsSummary ?? "")} onChange={e => setForm(f => ({ ...f, findingsSummary: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label>Corrective Actions</Label><Textarea value={String(form.correctiveActions ?? "")} onChange={e => setForm(f => ({ ...f, correctiveActions: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EquineTab({ farmId }: { farmId: number }) {
  const { data: horses, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "equine-records", "equine");
  const { data: events, isLoading: evL, open: evOpen, setOpen: setEvOpen, form: evForm, setForm: setEvForm, save: evSave, del: evDel, openAdd: evOpenAdd } = useCrud(farmId, "equine-health-events", "equine-health");
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-3"><h3 className="font-semibold text-sm">Equine Register</h3><Button size="sm" onClick={() => openAdd({ status: "active" })}><Plus className="w-4 h-4 mr-1" />Add Horse</Button></div>
        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "horseName", label: "Name" }, { key: "breed", label: "Breed" }, { key: "sex", label: "Sex" }, { key: "passportNumber", label: "Passport No." }, { key: "microchipNumber", label: "Microchip" }, { key: "ownerName", label: "Owner" }, { key: "liveryType", label: "Livery Type" }, { key: "box", label: "Box" }]} rows={horses as Record<string, unknown>[]} onEdit={r => openEdit(r as Record<string, unknown>)} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      </div>
      <div>
        <div className="flex justify-between items-center mb-3"><h3 className="font-semibold text-sm">Health Events (Worming, Farrier, Vaccination)</h3><Button size="sm" onClick={() => evOpenAdd()}><Plus className="w-4 h-4 mr-1" />Log Event</Button></div>
        {evL ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "eventDate", label: "Date", fmt: r => fmtDate(r.eventDate) }, { key: "eventType", label: "Type" }, { key: "vetOrFarrierName", label: "Vet / Farrier" }, { key: "treatmentGiven", label: "Treatment" }, { key: "productUsed", label: "Product" }, { key: "cost", label: "Cost (£)" }]} rows={events as Record<string, unknown>[]} onDelete={r => { if (confirm("Delete?")) evDel.mutate(r.id as number); }} />}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Equine Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Horse Name *</Label><Input value={String(form.horseName ?? "")} onChange={e => setForm(f => ({ ...f, horseName: e.target.value }))} /></div>
            <div><Label>Breed</Label><Input value={String(form.breed ?? "")} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} /></div>
            <div><Label>Colour</Label><Input value={String(form.colour ?? "")} onChange={e => setForm(f => ({ ...f, colour: e.target.value }))} /></div>
            <div><Label>Sex</Label>
              <Select value={String(form.sex ?? "")} onValueChange={v => setForm(f => ({ ...f, sex: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Stallion", "Gelding", "Mare", "Colt", "Filly"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Date of Birth</Label><Input type="date" value={String(form.dateOfBirth ?? "")} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} /></div>
            <div><Label>Passport Number</Label><Input value={String(form.passportNumber ?? "")} onChange={e => setForm(f => ({ ...f, passportNumber: e.target.value }))} /></div>
            <div><Label>UELN Number</Label><Input value={String(form.uelnNumber ?? "")} onChange={e => setForm(f => ({ ...f, uelnNumber: e.target.value }))} /></div>
            <div><Label>Microchip Number</Label><Input value={String(form.microchipNumber ?? "")} onChange={e => setForm(f => ({ ...f, microchipNumber: e.target.value }))} /></div>
            <div><Label>Owner Name</Label><Input value={String(form.ownerName ?? "")} onChange={e => setForm(f => ({ ...f, ownerName: e.target.value }))} /></div>
            <div><Label>Livery Type</Label>
              <Select value={String(form.liveryType ?? "")} onValueChange={v => setForm(f => ({ ...f, liveryType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Full Livery", "Part Livery", "DIY Livery", "Grass Livery", "Own Horses"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Box / Stable</Label><Input value={String(form.box ?? "")} onChange={e => setForm(f => ({ ...f, box: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={evOpen} onOpenChange={setEvOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Health Event</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date *</Label><Input type="date" value={String(evForm.eventDate ?? "")} onChange={e => setEvForm(f => ({ ...f, eventDate: e.target.value }))} /></div>
            <div><Label>Event Type *</Label>
              <Select value={String(evForm.eventType ?? "")} onValueChange={v => setEvForm(f => ({ ...f, eventType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Worming", "Farrier", "Vaccination", "Dental", "Veterinary Treatment", "Physiotherapy", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Vet / Farrier Name</Label><Input value={String(evForm.vetOrFarrierName ?? "")} onChange={e => setEvForm(f => ({ ...f, vetOrFarrierName: e.target.value }))} /></div>
            <div><Label>Treatment Given</Label><Input value={String(evForm.treatmentGiven ?? "")} onChange={e => setEvForm(f => ({ ...f, treatmentGiven: e.target.value }))} /></div>
            <div><Label>Product Used</Label><Input value={String(evForm.productUsed ?? "")} onChange={e => setEvForm(f => ({ ...f, productUsed: e.target.value }))} /></div>
            <div><Label>Cost (£)</Label><Input type="number" step="0.01" value={String(evForm.cost ?? "")} onChange={e => setEvForm(f => ({ ...f, cost: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEvOpen(false)}>Cancel</Button><Button onClick={() => evSave.mutate(evForm)} disabled={evSave.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RenewableTab({ farmId }: { farmId: number }) {
  const { data: installs, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "renewable-installations", "renewables");
  const { data: readings, isLoading: rL, open: rOpen, setOpen: setROpen, form: rForm, setForm: setRForm, save: rSave, del: rDel, openAdd: rOpenAdd } = useCrud(farmId, "renewable-meter-readings", "renewable-readings");
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between items-center mb-3"><h3 className="font-semibold text-sm">Renewable Energy Installations</h3><Button size="sm" onClick={() => openAdd()}><Plus className="w-4 h-4 mr-1" />Add Installation</Button></div>
        {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "installationName", label: "Name" }, { key: "technologyType", label: "Technology" }, { key: "installedCapacityKw", label: "Capacity (kW)" }, { key: "fitOrSegContractRef", label: "FIT/SEG Ref" }, { key: "tariffProvider", label: "Provider" }, { key: "nextServiceDate", label: "Next Service", fmt: r => fmtDate(r.nextServiceDate) }]} rows={installs as Record<string, unknown>[]} onEdit={r => openEdit(r as Record<string, unknown>)} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      </div>
      <div>
        <div className="flex justify-between items-center mb-3"><h3 className="font-semibold text-sm">Generation Meter Readings</h3><Button size="sm" onClick={() => rOpenAdd()}><Plus className="w-4 h-4 mr-1" />Log Reading</Button></div>
        {rL ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "readingDate", label: "Date", fmt: r => fmtDate(r.readingDate) }, { key: "generationKwh", label: "Generated (kWh)" }, { key: "exportKwh", label: "Exported (kWh)" }, { key: "selfConsumedKwh", label: "Self-Use (kWh)" }, { key: "fitPaymentPeriod", label: "FIT Period" }, { key: "fitPaymentAmount", label: "FIT Payment (£)" }]} rows={readings as Record<string, unknown>[]} onDelete={r => { if (confirm("Delete?")) rDel.mutate(r.id as number); }} />}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Renewable Energy Installation</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Installation Name *</Label><Input value={String(form.installationName ?? "")} onChange={e => setForm(f => ({ ...f, installationName: e.target.value }))} /></div>
            <div><Label>Technology Type *</Label>
              <Select value={String(form.technologyType ?? "")} onValueChange={v => setForm(f => ({ ...f, technologyType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Solar PV", "Wind Turbine", "Biomass", "Anaerobic Digestion", "Hydro", "Ground Source Heat Pump", "Air Source Heat Pump"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Capacity (kW)</Label><Input type="number" step="0.01" value={String(form.installedCapacityKw ?? "")} onChange={e => setForm(f => ({ ...f, installedCapacityKw: e.target.value }))} /></div>
            <div><Label>Installation Date</Label><Input type="date" value={String(form.installationDate ?? "")} onChange={e => setForm(f => ({ ...f, installationDate: e.target.value }))} /></div>
            <div><Label>FIT / SEG Contract Ref</Label><Input value={String(form.fitOrSegContractRef ?? "")} onChange={e => setForm(f => ({ ...f, fitOrSegContractRef: e.target.value }))} /></div>
            <div><Label>Tariff Provider</Label><Input value={String(form.tariffProvider ?? "")} onChange={e => setForm(f => ({ ...f, tariffProvider: e.target.value }))} /></div>
            <div><Label>Tariff Rate (p/kWh)</Label><Input type="number" step="0.01" value={String(form.tariffRatePence ?? "")} onChange={e => setForm(f => ({ ...f, tariffRatePence: e.target.value }))} /></div>
            <div><Label>Next Service Date</Label><Input type="date" value={String(form.nextServiceDate ?? "")} onChange={e => setForm(f => ({ ...f, nextServiceDate: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={rOpen} onOpenChange={setROpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Meter Reading</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Reading Date *</Label><Input type="date" value={String(rForm.readingDate ?? "")} onChange={e => setRForm(f => ({ ...f, readingDate: e.target.value }))} /></div>
            <div><Label>Meter Reference</Label><Input value={String(rForm.meterReference ?? "")} onChange={e => setRForm(f => ({ ...f, meterReference: e.target.value }))} /></div>
            <div><Label>Generation (kWh)</Label><Input type="number" step="0.01" value={String(rForm.generationKwh ?? "")} onChange={e => setRForm(f => ({ ...f, generationKwh: e.target.value }))} /></div>
            <div><Label>Export (kWh)</Label><Input type="number" step="0.01" value={String(rForm.exportKwh ?? "")} onChange={e => setRForm(f => ({ ...f, exportKwh: e.target.value }))} /></div>
            <div><Label>Self-Consumed (kWh)</Label><Input type="number" step="0.01" value={String(rForm.selfConsumedKwh ?? "")} onChange={e => setRForm(f => ({ ...f, selfConsumedKwh: e.target.value }))} /></div>
            <div><Label>FIT Payment Period</Label><Input value={String(rForm.fitPaymentPeriod ?? "")} onChange={e => setRForm(f => ({ ...f, fitPaymentPeriod: e.target.value }))} /></div>
            <div><Label>FIT Payment (£)</Label><Input type="number" step="0.01" value={String(rForm.fitPaymentAmount ?? "")} onChange={e => setRForm(f => ({ ...f, fitPaymentAmount: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setROpen(false)}>Cancel</Button><Button onClick={() => rSave.mutate(rForm)} disabled={rSave.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ShootingTab({ farmId }: { farmId: number }) {
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "shooting-game-records", "shooting");
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h3 className="font-semibold text-sm">Shooting & Game Records</h3><Button size="sm" onClick={() => openAdd({ bagsPheasant: "0", bagsPartridge: "0", bagsGrouse: "0", bagsDuck: "0", bagsWoodcock: "0", bagsOther: "0", totalBag: "0" })}><Plus className="w-4 h-4 mr-1" />Log Shoot</Button></div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[{ key: "shootDate", label: "Date", fmt: r => fmtDate(r.shootDate) }, { key: "shootType", label: "Type" }, { key: "organiser", label: "Organiser" }, { key: "numberOfGuns", label: "Guns" }, { key: "totalBag", label: "Total Bag" }, { key: "gameDealer", label: "Game Dealer" }, { key: "incomeLeaseFee", label: "Income (£)" }]} rows={records as Record<string, unknown>[]} onDelete={r => { if (confirm("Delete?")) del.mutate(r.id as number); }} />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Shoot Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Shoot Date *</Label><Input type="date" value={String(form.shootDate ?? "")} onChange={e => setForm(f => ({ ...f, shootDate: e.target.value }))} /></div>
            <div><Label>Shoot Type *</Label>
              <Select value={String(form.shootType ?? "")} onValueChange={v => setForm(f => ({ ...f, shootType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{["Driven Pheasant", "Rough Shoot", "Duck Flighting", "Walked-up", "Day Let", "Own Shoot"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Organiser / Tenant</Label><Input value={String(form.organiser ?? "")} onChange={e => setForm(f => ({ ...f, organiser: e.target.value }))} /></div>
            <div><Label>Number of Guns</Label><Input type="number" value={String(form.numberOfGuns ?? "")} onChange={e => setForm(f => ({ ...f, numberOfGuns: e.target.value }))} /></div>
            <div><Label>Gamekeeper Name</Label><Input value={String(form.gamekeeperName ?? "")} onChange={e => setForm(f => ({ ...f, gamekeeperName: e.target.value }))} /></div>
            <div><Label>Game Dealer</Label><Input value={String(form.gameDealer ?? "")} onChange={e => setForm(f => ({ ...f, gameDealer: e.target.value }))} /></div>
            {[["bagsPheasant", "Pheasant"], ["bagsPartridge", "Partridge"], ["bagsGrouse", "Grouse"], ["bagsDuck", "Duck"], ["bagsWoodcock", "Woodcock"], ["bagsOther", "Other"]].map(([k, l]) => <div key={k}><Label>{l}</Label><Input type="number" min="0" value={String(form[k] ?? "0")} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>)}
            <div><Label>Total Bag</Label><Input type="number" min="0" value={String(form.totalBag ?? "0")} onChange={e => setForm(f => ({ ...f, totalBag: e.target.value }))} /></div>
            <div><Label>Income / Lease Fee (£)</Label><Input type="number" step="0.01" value={String(form.incomeLeaseFee ?? "")} onChange={e => setForm(f => ({ ...f, incomeLeaseFee: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const INCOME_TYPES = [
  "Farm Shop Sales",
  "Holiday Accommodation",
  "Livery / Equine",
  "Shoot Day / Let",
  "FIT / SEG Payment",
  "Event Hire",
  "Storage Let",
  "Tourism & Recreation",
  "Food Processing",
  "Other",
];

const VAT_RATES = [
  { value: "exempt", label: "Exempt" },
  { value: "zero", label: "Zero Rated (0%)" },
  { value: "reduced", label: "Reduced (5%)" },
  { value: "standard", label: "Standard (20%)" },
  { value: "outside_scope", label: "Outside Scope" },
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function IncomeTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: activities = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["div-activities", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/diversification-activities`), { credentials: "include" }).then(r => r.json()),
  });

  const { data: records = [], isLoading } = useQuery<Record<string, unknown>[]>({
    queryKey: ["div-income", farmId, year],
    queryFn: () => fetch(api(`farms/${farmId}/diversification-income${year ? `?year=${year}` : ""}`), { credentials: "include" }).then(r => r.json()),
  });

  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => fetch(
      editing ? api(`farms/${farmId}/diversification-income/${editing.id}`) : api(`farms/${farmId}/diversification-income`),
      { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }
    ),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["div-income", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });

  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/diversification-income/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["div-income", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ vatRate: "exempt", incomeDate: new Date().toISOString().slice(0, 10) }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""]))); setOpen(true); }

  const fmtGbp = (v: unknown) => v ? `£${parseFloat(String(v)).toFixed(2)}` : "—";
  const fmtGbpLong = (v: number) => `£${v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const summary = useMemo(() => {
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    let grand = 0;
    for (const r of records) {
      const type = String(r.incomeType ?? "Other");
      const net = parseFloat(String(r.amountNet ?? "0")) || 0;
      totals[type] = (totals[type] ?? 0) + net;
      counts[type] = (counts[type] ?? 0) + 1;
      grand += net;
    }
    return { totals, counts, grand };
  }, [records]);

  const displayRecords = useMemo(
    () => selectedType ? records.filter(r => r.incomeType === selectedType) : records,
    [records, selectedType]
  );

  const drillDown = useMemo(() => {
    if (!selectedType) return null;
    const filtered = records.filter(r => r.incomeType === selectedType);
    const amounts = filtered.map(r => parseFloat(String(r.amountNet ?? "0")) || 0);
    const total = amounts.reduce((a, b) => a + b, 0);
    const count = filtered.length;
    const avg = count ? total / count : 0;
    const largest = Math.max(...amounts, 0);

    const byMonth: Record<string, { total: number; count: number }> = {};
    for (const r of filtered) {
      const d = String(r.incomeDate ?? "");
      if (!d) continue;
      const key = d.slice(0, 7);
      const net = parseFloat(String(r.amountNet ?? "0")) || 0;
      byMonth[key] = { total: (byMonth[key]?.total ?? 0) + net, count: (byMonth[key]?.count ?? 0) + 1 };
    }
    const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => {
      const [yr, mo] = k.split("-");
      return { label: `${MONTH_NAMES[parseInt(mo, 10) - 1]} ${yr}`, ...v };
    });

    const byCustomer: Record<string, number> = {};
    for (const r of filtered) {
      const name = String(r.customerName ?? "Unknown");
      byCustomer[name] = (byCustomer[name] ?? 0) + (parseFloat(String(r.amountNet ?? "0")) || 0);
    }
    const customers = Object.entries(byCustomer).sort((a, b) => b[1] - a[1]);

    const maxBar = Math.max(...months.map(m => m.total), 1);

    return { total, count, avg, largest, months, customers, maxBar };
  }, [records, selectedType]);

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="font-semibold text-sm">Diversification Income</h3>
        <div className="flex items-center gap-2">
          <select
            className="text-sm border rounded-md px-2 py-1.5 bg-background"
            value={year ?? ""}
            onChange={e => { setYear(e.target.value ? parseInt(e.target.value) : null); setSelectedType(null); }}
          >
            <option value="">All Years</option>
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Income</Button>
        </div>
      </div>

      {summary.grand > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <button
            onClick={() => setSelectedType(null)}
            className={`col-span-2 sm:col-span-3 lg:col-span-4 p-4 rounded-xl border flex items-center justify-between transition-all text-left ${
              selectedType === null
                ? "bg-emerald-100 border-emerald-400 ring-2 ring-emerald-400"
                : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-900">
                Total Net Income {year ? year : "— All Time"}
              </span>
              {selectedType === null && (
                <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-medium">All sources</span>
              )}
            </div>
            <span className="text-2xl font-bold text-emerald-700">{fmtGbpLong(summary.grand)}</span>
          </button>

          {Object.entries(summary.totals).sort((a, b) => b[1] - a[1]).map(([type, total]) => {
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => setSelectedType(isActive ? null : type)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isActive
                    ? "bg-blue-50 border-blue-400 ring-2 ring-blue-400 shadow-sm"
                    : "bg-muted/30 hover:bg-muted/60 hover:border-blue-200"
                }`}
              >
                <p className={`text-xs truncate font-medium ${isActive ? "text-blue-700" : "text-muted-foreground"}`}>{type}</p>
                <p className={`font-bold text-sm mt-0.5 ${isActive ? "text-blue-900" : ""}`}>{fmtGbpLong(total)}</p>
                <p className={`text-[10px] ${isActive ? "text-blue-600" : "text-muted-foreground"}`}>
                  {((total / summary.grand) * 100).toFixed(1)}% · {summary.counts[type]} transaction{summary.counts[type] !== 1 ? "s" : ""}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {drillDown && selectedType && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm text-blue-900">{selectedType} — Breakdown</h4>
            <div className="flex gap-3 text-xs text-blue-700 font-medium">
              <span>{drillDown.count} transactions</span>
              <span>Avg {fmtGbp(drillDown.avg)}</span>
              <span>Largest {fmtGbp(drillDown.largest)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-blue-800 mb-2">Monthly Income</p>
              {drillDown.months.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No monthly data</p>
              ) : (
                <div className="space-y-1.5">
                  {drillDown.months.map(m => (
                    <div key={m.label} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-16 shrink-0">{m.label}</span>
                      <div className="flex-1 h-4 bg-blue-100 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-400 rounded transition-all"
                          style={{ width: `${(m.total / drillDown.maxBar) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-blue-900 w-20 text-right shrink-0">{fmtGbp(m.total)}</span>
                      <span className="text-[10px] text-muted-foreground w-12 shrink-0">×{m.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-blue-800 mb-2">By Customer / Payer</p>
              {drillDown.customers.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No customer data</p>
              ) : (
                <div className="space-y-1">
                  {drillDown.customers.map(([name, total], i) => (
                    <div key={name} className="flex items-center justify-between gap-2 py-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[10px] font-bold text-blue-400 w-4 shrink-0">#{i + 1}</span>
                        <span className="text-xs truncate">{name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-semibold text-blue-900">{fmtGbp(total)}</span>
                        <span className="text-[10px] text-muted-foreground ml-1">{((total / drillDown.total) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <>
          {selectedType && (
            <div className="flex items-center gap-2 text-sm text-blue-700 font-medium">
              <span>Showing: {selectedType}</span>
              <button onClick={() => setSelectedType(null)} className="text-xs text-muted-foreground hover:text-foreground underline">Clear filter</button>
            </div>
          )}
          <DataTable
            cols={[
              { key: "incomeDate", label: "Date", fmt: r => fmtDate(r.incomeDate) },
              { key: "activityName", label: "Activity" },
              ...(!selectedType ? [{ key: "incomeType", label: "Type" }] : []),
              { key: "description", label: "Description" },
              { key: "customerName", label: "Customer" },
              { key: "amountNet", label: "Net Amount", fmt: r => fmtGbp(r.amountNet) },
              { key: "vatRate", label: "VAT", fmt: r => VAT_RATES.find(v => v.value === r.vatRate)?.label ?? String(r.vatRate) },
              { key: "invoiceRef", label: "Invoice Ref" },
            ]}
            rows={displayRecords}
            onEdit={r => openEdit(r)}
            onDelete={r => { if (confirm("Delete this income record?")) del.mutate(r.id as number); }}
          />
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Income Record" : "Add Income Record"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Income Date *</Label><Input type="date" value={String(form.incomeDate ?? "")} onChange={e => setForm(f => ({ ...f, incomeDate: e.target.value }))} /></div>
            <div><Label>Income Type *</Label>
              <Select value={String(form.incomeType ?? "")} onValueChange={v => setForm(f => ({ ...f, incomeType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{INCOME_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Linked Activity</Label>
              <Select value={String(form.activityId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, activityId: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {(activities as Record<string, unknown>[]).map((a) => <SelectItem key={String(a.id)} value={String(a.id)}>{String(a.activityName)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Customer / Payer</Label><Input value={String(form.customerName ?? "")} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} /></div>
            <div><Label>Net Amount (£) *</Label><Input type="number" step="0.01" min="0" value={String(form.amountNet ?? "")} onChange={e => setForm(f => ({ ...f, amountNet: e.target.value }))} /></div>
            <div><Label>VAT Rate</Label>
              <Select value={String(form.vatRate ?? "exempt")} onValueChange={v => setForm(f => ({ ...f, vatRate: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{VAT_RATES.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>VAT Amount (£)</Label><Input type="number" step="0.01" min="0" value={String(form.vatAmount ?? "")} onChange={e => setForm(f => ({ ...f, vatAmount: e.target.value }))} /></div>
            <div><Label>Invoice / Reference</Label><Input value={String(form.invoiceRef ?? "")} onChange={e => setForm(f => ({ ...f, invoiceRef: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={String(form.description ?? "")} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.incomeDate || !form.incomeType || !form.amountNet}>
              {save.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type Tab = "activities" | "shop" | "hygiene" | "equine" | "renewable" | "shooting" | "income";

export default function DiversificationPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>("activities");
  if (!farmId) return <Redirect to="/" />;
  return (
    <AppLayout title="Farm Diversification">
      <div className="space-y-4">
        <TabBar>
          <TabButton active={tab === "activities"} onClick={() => setTab("activities")}><LayoutList className="w-3.5 h-3.5 mr-1" />Activities</TabButton>
          <TabButton active={tab === "income"} onClick={() => setTab("income")}><PoundSterling className="w-3.5 h-3.5 mr-1" />Income</TabButton>
          <TabButton active={tab === "shop"} onClick={() => setTab("shop")}><ShoppingBag className="w-3.5 h-3.5 mr-1" />Farm Shop</TabButton>
          <TabButton active={tab === "hygiene"} onClick={() => setTab("hygiene")}><ClipboardCheck className="w-3.5 h-3.5 mr-1" />Hygiene</TabButton>
          <TabButton active={tab === "equine"} onClick={() => setTab("equine")}><PawPrint className="w-3.5 h-3.5 mr-1" />Equine</TabButton>
          <TabButton active={tab === "renewable"} onClick={() => setTab("renewable")}><Zap className="w-3.5 h-3.5 mr-1" />Renewables</TabButton>
          <TabButton active={tab === "shooting"} onClick={() => setTab("shooting")}><Crosshair className="w-3.5 h-3.5 mr-1" />Shooting</TabButton>
        </TabBar>
        <Card><CardContent className="pt-4">
          {tab === "activities" && <ActivitiesTab farmId={farmId} />}
          {tab === "income" && <IncomeTab farmId={farmId} />}
          {tab === "shop" && <FarmShopTab farmId={farmId} />}
          {tab === "hygiene" && <HygieneInspectionsTab farmId={farmId} />}
          {tab === "equine" && <EquineTab farmId={farmId} />}
          {tab === "renewable" && <RenewableTab farmId={farmId} />}
          {tab === "shooting" && <ShootingTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}
