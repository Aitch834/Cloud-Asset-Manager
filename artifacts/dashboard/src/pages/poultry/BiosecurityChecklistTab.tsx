// @ts-nocheck
import { useState, useRef, useMemo, type ReactNode } from "react";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";
import { sanitiseCsvCell } from "@/lib/csv";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DocAttach } from "@/components/DocAttach";
import { openPrintWindow } from "@/lib/print-report";
import { Plus, Pencil, Trash2, Loader2, Home, Bird, BarChart3, Pill, SprayCan, Thermometer, FileText, ShieldCheck, Scissors, ClipboardList, ClipboardCheck, Star, Truck, UtensilsCrossed, FileDown, AlertTriangle, TrendingUp, LayoutDashboard, CheckCircle2, XCircle, Circle, Eye, Receipt, HardHat, Users, Package, X as XIcon, QrCode, Printer, ChevronDown, ChevronUp, Syringe, Activity, ArrowRightLeft, ShieldAlert, MapPin, Clock, Save } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { useToast } from "@/hooks/use-toast";
import { StaffSelect } from "@/components/ui/staff-select";
import { ConfirmDialog as SharedConfirmDialog } from "@/components/ui/confirm-dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, exportCSV, StatCard, Empty, ConfirmDialog, DataTable, useCrud, HOUSE_TYPES, POULTRY_SPECIES, PRODUCTION_SYSTEMS, SPECIES_LABEL_MAP, SYSTEM_LABEL_MAP, fmtSpecies, fmtSystem, getStockingDensityInfo, useFlocks, FlockSelect, fmtFlock } from "./shared";
import type { DensityInfo } from "./shared";

function BiosecurityStatusBadge({ status }: { status: unknown }) {
  const value = String(status ?? "").toLowerCase();
  const config = value === "in-progress"
    ? { label: "In Progress", className: "border-amber-300 bg-amber-100 text-amber-800", icon: <Clock className="w-3 h-3 mr-1" /> }
    : value === "non-compliant"
      ? { label: "Non-Compliant", className: "border-red-300 bg-red-100 text-red-800", icon: <AlertTriangle className="w-3 h-3 mr-1" /> }
      : value === "complete" || value === "compliant"
        ? { label: value === "complete" ? "Complete" : "Compliant", className: "border-green-300 bg-green-100 text-green-800", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> }
        : { label: status ? String(status) : "—", className: "border-slate-300 bg-slate-100 text-slate-700", icon: <Circle className="w-3 h-3 mr-1" /> };

  return <Badge variant="outline" className={`text-xs ${config.className}`}>{config.icon}{config.label}</Badge>;
}

function BioBoolField({ label, field, form, setForm }: { label: string; field: string; form: Record<string, unknown>; setForm: React.Dispatch<React.SetStateAction<Record<string, unknown>>> }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={`bio-${field}`} checked={Boolean(form[field])} onCheckedChange={v => setForm(f => ({ ...f, [field]: Boolean(v) }))} />
      <Label htmlFor={`bio-${field}`} className="text-sm">{label}</Label>
    </div>
  );
}

export function BiosecurityChecklistTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { data: bioMembersData, isLoading: bioMembersLoading } = useFarmMembers(farmId);
  const bioStaffNames = (bioMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Record<string, unknown> | null>(null);
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
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-biosecurity-checklists/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: ["poultry-biosecurity", farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });

  const bioList = records as Record<string, unknown>[];
  const [houseFilterBio, setHouseFilterBio] = usePersistedFilter({ page: "poultry-biosecurity", filter: "house", farmId, defaultValue: "all" });
  const [statusFilterBio, setStatusFilterBio] = usePersistedFilter({ page: "poultry-biosecurity", filter: "status", farmId, defaultValue: "all" });
  const [yearFilterBio, setYearFilterBio] = usePersistedFilter({ page: "poultry-biosecurity", filter: "year", farmId, defaultValue: "all" });
  const yearsBio = useMemo(() => Array.from(new Set(bioList.map(r => String(r.cleanoutStartDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [bioList]);
  const filteredBioList = bioList.filter(r =>
    (houseFilterBio === "all" || String(r.houseId) === houseFilterBio) &&
    (statusFilterBio === "all" || r.overallComplianceStatus === statusFilterBio) &&
    (yearFilterBio === "all" || String(r.cleanoutStartDate ?? "").startsWith(yearFilterBio))
  );
  const compliant = filteredBioList.filter(r => r.overallComplianceStatus === "compliant").length;
  const nonCompliant = filteredBioList.filter(r => r.overallComplianceStatus === "non-compliant").length;
  const inProgress = filteredBioList.filter(r => r.overallComplianceStatus === "in-progress").length;
  const avgDowntime = filteredBioList.filter(r => r.downtimeDays).length ? Math.round(filteredBioList.filter(r => r.downtimeDays).reduce((s, r) => s + Number(r.downtimeDays), 0) / filteredBioList.filter(r => r.downtimeDays).length) : null;
  const bioCsv = [
    { key: "cleanoutStartDate", label: "Start Date", fmt: (r: Record<string, unknown>) => fmtDate(r.cleanoutStartDate) },
    { key: "cleanoutEndDate", label: "End Date", fmt: (r: Record<string, unknown>) => fmtDate(r.cleanoutEndDate) },
    { key: "houseName", label: "House" }, { key: "previousFlockNumber", label: "Previous Flock" },
    { key: "downtimeDays", label: "Downtime (days)" }, { key: "overallComplianceStatus", label: "Status" },
    { key: "completedBy", label: "Completed By" }, { key: "verifiedBy", label: "Verified By" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold text-sm">Biosecurity Checklist — Downtime & Cleanout</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record end-of-flock biosecurity procedures for each house cleanout to demonstrate Red Tractor and RSPCA Assured compliance. All items must be completed before restocking.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredBioList, "biosecurity-checklists.csv", bioCsv)} disabled={!filteredBioList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ cleanoutStartDate: new Date().toISOString().slice(0, 10), overallComplianceStatus: "in-progress", vehicleRestrictions: true }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Checklist</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={houseFilterBio} onValueChange={setHouseFilterBio}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="All houses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All houses</SelectItem>
            {houses.map(h => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.houseName ?? h.id)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilterBio} onValueChange={setStatusFilterBio}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="non-compliant">Non-Compliant</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
        <Select value={yearFilterBio} onValueChange={setYearFilterBio}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsBio.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
      </div>
      {!isLoading && bioList.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Biosecurity Compliance Summary</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Checklists" value={filteredBioList.length} />
            <StatCard label="Compliant" value={compliant} color={compliant === filteredBioList.length ? "green" : "amber"} sub={filteredBioList.length > 0 ? `${Math.round(compliant / filteredBioList.length * 100)}% of records` : undefined} />
            <StatCard label="Non-Compliant" value={nonCompliant} color={nonCompliant > 0 ? "red" : "green"} sub={nonCompliant > 0 ? "action required" : "none"} />
            <StatCard label="Avg Downtime" value={avgDowntime !== null ? `${avgDowntime} days` : "—"} sub="between flocks" />
          </div>
          {inProgress > 0 && <p className="text-xs text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{inProgress} checklist{inProgress > 1 ? "s" : ""} still in progress — complete before restocking to maintain compliance.</p>}
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "cleanoutStartDate", label: "Cleanout Start", fmt: r => fmtDate(r.cleanoutStartDate) },
          { key: "houseName", label: "House", fmt: r => r.houseName ? String(r.houseName) : fmt(r.houseId) },
          { key: "cleanoutEndDate", label: "Cleanout End", fmt: r => fmtDate(r.cleanoutEndDate) },
          { key: "downtimeDays", label: "Downtime (days)" },
          { key: "overallComplianceStatus", label: "Status", render: r => <BiosecurityStatusBadge status={r.overallComplianceStatus} /> },
          { key: "completedBy", label: "Completed By" },
          { key: "doc", label: "Document", render: r => <DocAttach farmId={farmId} endpoint="poultry-biosecurity-checklists" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["poultry-biosecurity", farmId]} /> },
        ]}
        rows={filteredBioList}
        onEdit={r => { setEditing(r); setForm({ ...r, houseId: r.houseId ? String(r.houseId) : "__none__", previousFlockId: r.previousFlockId ? String(r.previousFlockId) : "__none__" }); setOpen(true); }}
        onDelete={r => del.mutate(r.id as number)} deleteMutation={del}
        onView={setViewRecord}
      />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Biosecurity Checklist</DialogTitle></DialogHeader>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cleanout Start</p><p className="font-medium">{fmtDate(viewRecord.cleanoutStartDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cleanout End</p><p className="font-medium">{fmtDate(viewRecord.cleanoutEndDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">House</p><p className="font-medium">{String(viewRecord.houseName ?? viewRecord.houseId ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Previous Flock</p><p className="font-medium">{String(viewRecord.previousFlockNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Downtime (days)</p><p className="font-medium">{String(viewRecord.downtimeDays ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{String(viewRecord.overallComplianceStatus ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disinfectant Used</p><p className="font-medium">{String(viewRecord.disinfectantUsed ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dilution Rate</p><p className="font-medium">{String(viewRecord.disinfectantDilutionRate ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Completed By</p><p className="font-medium">{String(viewRecord.completedBy ?? "—")}</p></div>
              <div className="col-span-3 grid grid-cols-2 gap-2 mt-2">
                {[
                  ["catchingComplete", "Catching complete"],
                  ["litterRemoved", "Litter removed"],
                  ["dryCleanComplete", "Dry clean complete"],
                  ["washComplete", "Wash complete"],
                  ["disinfectionComplete", "Disinfection complete"],
                  ["disinfectantApproved", "Disinfectant approved"],
                  ["fumigationComplete", "Fumigation complete"],
                  ["verminControlComplete", "Vermin control complete"],
                  ["waterSystemFlushComplete", "Water system flush"],
                  ["waterSystemDisinfected", "Water system disinfected"],
                  ["feedSystemCleaned", "Feed system cleaned"],
                  ["ventilationChecked", "Ventilation checked"],
                  ["heatingChecked", "Heating checked"],
                  ["footbathsInstalled", "Footbaths installed"],
                  ["vehicleRestrictions", "Vehicle restrictions"],
                  ["visitorLogInPlace", "Visitor log in place"],
                  ["independentAuditCompleted", "Independent audit"],
                ].map(([k, l]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className={viewRecord[k] ? "text-green-600" : "text-red-600"}>{viewRecord[k] ? "✓" : "✗"}</span>
                    <span className="text-muted-foreground">{l}</span>
                  </div>
                ))}
              </div>
              <div className="col-span-3"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              {viewRecord.overallComplianceStatus === "non-compliant" && (
                <Button variant="outline" className="text-purple-700 border-purple-200 hover:bg-purple-50 mr-auto" onClick={() => { setRaiseTaskFor(viewRecord); setViewRecord(null); }}>
                  <ClipboardList className="w-3.5 h-3.5 mr-1" />Raise Corrective Action Task
                </Button>
              )}
              <Button variant="outline" onClick={() => { setEditing(viewRecord); setForm({ ...viewRecord, houseId: viewRecord.houseId ? String(viewRecord.houseId) : "__none__", previousFlockId: viewRecord.previousFlockId ? String(viewRecord.previousFlockId) : "__none__" }); setOpen(true); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle="Corrective Action — Poultry Biosecurity Checklist"
          defaultDescription={`Cleanout start: ${raiseTaskFor.cleanoutStartDate ?? "—"} · House: ${raiseTaskFor.houseName ?? raiseTaskFor.houseId ?? "—"} · Status: ${raiseTaskFor.overallComplianceStatus ?? "—"}`}
          taskType="compliance_corrective"
          module="poultry-biosecurity"
          onAssigned={() => setRaiseTaskFor(null)}
        />
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "52rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Biosecurity Checklist</DialogTitle></DialogHeader>
          <p className="text-xs text-muted-foreground rounded-md border border-blue-200 bg-blue-50 px-3 py-2">
            <strong>Save at any stage:</strong> enter the start date and house now to open this record, then tick checklist items and add the end date as the cleanout is completed. Change the status to <em>Complete</em> once all steps are done and the house is ready to restock.
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-1 mb-1">Cleanout start</p>
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
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3 mb-1">Cleanout completion — fill in when the process is done</p>
          <div className="grid grid-cols-3 gap-3">
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
            <div>
              <Label>Disinfectant Used</Label>
              <Select value={String(form.disinfectantUsed ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, disinfectantUsed: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select product —</SelectItem>
                  {["Virkon S", "Anigene HLD4V", "FAM 30", "Interkokask", "Kilcox Extra", "Defecto Forte", "Menno Ter Forte", "Biocide Extra", "Glutex (Glutaraldehyde)", "Acticide CMK", "Perasafe (Peracetic Acid)", "DupHast Forte", "Other (specify in notes)"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Dilution Rate</Label><Input placeholder="e.g. 1:200" value={String(form.disinfectantDilutionRate ?? "")} onChange={e => setForm(f => ({ ...f, disinfectantDilutionRate: e.target.value }))} /></div>
            <div>
              <Label>Litter Disposal Method</Label>
              <Select value={String(form.litterDisposalMethod ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, litterDisposalMethod: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select method —</SelectItem>
                  {[
                    "Spread to land — direct application",
                    "Spread to land — via licensed contractor",
                    "Composted on-farm",
                    "Collected by contractor (AD / biogas plant)",
                    "Sold to third party (e.g. mushroom compost)",
                    "Incinerated on-farm",
                    "Incinerated — licensed contractor",
                    "Landfill (licensed)",
                    "Other (specify in notes)",
                  ].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Audit Body</Label>
              <Select value={String(form.auditBody ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, auditBody: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select body" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select audit body —</SelectItem>
                  {["Red Tractor Assurance", "RSPCA Assured", "Soil Association", "Organic Farmers & Growers (OF&G)", "Lion Quality (BEIC)", "M&S Select Farms", "Tesco Nurture", "Internal audit", "Other (specify in notes)"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Completed By</Label><StaffSelect value={String(form.completedBy ?? "")} onChange={v => setForm(f => ({ ...f, completedBy: v }))} staffNames={bioStaffNames} loading={bioMembersLoading} /></div>
            <div>
              <Label>Scheme / Certification</Label>
              <Select value={String(form.schemeCertificationScheme ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, schemeCertificationScheme: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select scheme —</SelectItem>
                  {["Red Tractor Poultry (Broiler)", "Red Tractor Poultry (Turkey)", "Red Tractor Poultry (Laying Hens)", "Lion Quality", "RSPCA Assured", "Organic (Soil Association)", "Organic (OF&G)", "Free Range", "Higher Welfare", "M&S Select Farms", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes / Deficiencies</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

