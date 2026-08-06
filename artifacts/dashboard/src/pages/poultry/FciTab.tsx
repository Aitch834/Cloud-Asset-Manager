// @ts-nocheck
import { useState, useRef, useMemo, type ReactNode } from "react";
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
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, exportCSV, StatCard, Empty, ConfirmDialog, DataTable, useCrud, HOUSE_TYPES, POULTRY_SPECIES, PRODUCTION_SYSTEMS, SPECIES_LABEL_MAP, SYSTEM_LABEL_MAP, fmtSpecies, fmtSystem, getStockingDensityInfo, useFlocks, FlockSelect, fmtFlock } from "./shared";
import type { DensityInfo } from "./shared";

export function FciTab({ farmId }: { farmId: number }) {
  const flocks = useFlocks(farmId);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "poultry-fci-documents", "poultry-fci");
  const fciList = (records ?? []) as Record<string, unknown>[];
  const [flockFilterFci, setFlockFilterFci] = useState("all");
  const [yearFilterFci, setYearFilterFci] = useState("all");
  const yearsFci = useMemo(() => Array.from(new Set(fciList.map(r => String(r.documentDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [fciList]);
  const filteredFciList = fciList.filter(r => (flockFilterFci === "all" || String(r.flockId) === flockFilterFci) && (yearFilterFci === "all" || String(r.documentDate ?? "").startsWith(yearFilterFci)));
  const notWithdrawalClear = filteredFciList.filter(r => !r.withdrawalPeriodClear).length;
  const withMeds = filteredFciList.filter(r => r.medicationsLast7Days).length;
  const withDisease = filteredFciList.filter(r => r.anyDiseaseOrCondition).length;
  const totalBirds = filteredFciList.reduce((s, r) => s + Number(r.numberOfBirds ?? 0), 0);
  const fciCsvCols = [
    { key: "documentDate", label: "FCI Date", fmt: (r: Record<string, unknown>) => fmtDate(r.documentDate) },
    { key: "catchingDate", label: "Catching Date", fmt: (r: Record<string, unknown>) => fmtDate(r.catchingDate) },
    { key: "flockNumber", label: "Flock" }, { key: "houseName", label: "House" },
    { key: "destinationAbattoir", label: "Abattoir" }, { key: "numberOfBirds", label: "Number of Birds" },
    { key: "catchingContractor", label: "Catching Contractor" }, { key: "lastFeedWithdrawalHours", label: "Feed Withdrawal (hrs)" },
    { key: "anyDiseaseOrCondition", label: "Disease/Condition", fmt: (r: Record<string, unknown>) => r.anyDiseaseOrCondition ? "Yes" : "No" },
    { key: "medicationsLast7Days", label: "Meds Last 7 Days", fmt: (r: Record<string, unknown>) => r.medicationsLast7Days ? "Yes" : "No" },
    { key: "withdrawalPeriodClear", label: "Withdrawal Clear", fmt: (r: Record<string, unknown>) => r.withdrawalPeriodClear ? "Yes" : "No" },
    { key: "signedByFarmer", label: "Signed by Farmer", fmt: (r: Record<string, unknown>) => r.signedByFarmer ? "Yes" : "No" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-semibold text-sm">Food Chain Information (FCI) Documents</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredFciList, "fci-documents.csv", fciCsvCols)} disabled={!filteredFciList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={() => openAdd({ withdrawalPeriodClear: true, signedByFarmer: true, anyDiseaseOrCondition: false, medicationsLast7Days: false })}><Plus className="w-4 h-4 mr-1" />Add FCI Doc</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={flockFilterFci} onValueChange={setFlockFilterFci}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All flocks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All flocks</SelectItem>
            {flocks.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockNumber ?? f.id)}{f.houseName ? ` · ${f.houseName}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={yearFilterFci} onValueChange={setYearFilterFci}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsFci.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
      </div>
      {!isLoading && fciList.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">FCI Summary</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="FCI Documents" value={filteredFciList.length} />
              <StatCard label="Total Birds Declared" value={totalBirds.toLocaleString()} />
              <StatCard label="Withdrawal Not Clear" value={notWithdrawalClear} color={notWithdrawalClear > 0 ? "red" : "green"} sub={notWithdrawalClear > 0 ? "review before slaughter" : "all clear"} />
              <StatCard label="Medications Last 7 Days" value={withMeds} color={withMeds > 0 ? "amber" : "green"} sub={withMeds > 0 ? "declared on FCI docs" : "none declared"} />
            </div>
            {withDisease > 0 && <p className="text-xs text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{withDisease} FCI doc{withDisease > 1 ? "s" : ""} declared a disease or condition — ensure abattoir was notified before birds were accepted.</p>}
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "documentDate", label: "Date", fmt: r => fmtDate(r.documentDate) },
        { key: "flockNumber", label: "Flock", fmt: fmtFlock },
        { key: "destinationAbattoir", label: "Abattoir" },
        { key: "numberOfBirds", label: "Birds" },
        { key: "catchingContractor", label: "Catching Contractor" },
        { key: "withdrawalPeriodClear", label: "Withdrawal Clear", fmt: r => r.withdrawalPeriodClear ? "✓ Yes" : "No" },
        { key: "doc", label: "Document", render: r => <DocAttach farmId={farmId} endpoint="poultry-fci-documents" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["poultry-fci", farmId]} /> },
      ]} rows={filteredFciList} onDelete={r => del.mutate(r.id as number)} deleteMutation={del} onView={setViewRecord} />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View FCI Document</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Document Date</p><p className="font-medium">{fmtDate(viewRecord.documentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock</p><p className="font-medium">{String(viewRecord.flockNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Destination Abattoir</p><p className="font-medium">{String(viewRecord.destinationAbattoir ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Number of Birds</p><p className="font-medium">{String(viewRecord.numberOfBirds ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Catching Date</p><p className="font-medium">{fmtDate(viewRecord.catchingDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Catching Contractor</p><p className="font-medium">{String(viewRecord.catchingContractor ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal Period Clear</p><p className="font-medium">{viewRecord.withdrawalPeriodClear ? "Yes" : "No"}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Additional Information</p><p className="font-medium">{String(viewRecord.additionalInfo ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
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
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

