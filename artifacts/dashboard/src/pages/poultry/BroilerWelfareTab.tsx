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

export function BroilerWelfareTab({ farmId }: { farmId: number }) {
  const flocks = useFlocks(farmId);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "poultry-broiler-welfare", "poultry-broiler-welfare");
  const { data: bwiMembersData, isLoading: bwiMembersLoading } = useFarmMembers(farmId);
  const bwiStaffNames = (bwiMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);
  const bwiList = (records ?? []) as Record<string, unknown>[];
  const [flockFilterBwi, setFlockFilterBwi] = useState("all");
  const [outcomeFilterBwi, setOutcomeFilterBwi] = useState("all");
  const [yearFilterBwi, setYearFilterBwi] = useState("all");
  const yearsBwi = useMemo(() => Array.from(new Set(bwiList.map(r => String(r.assessmentDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [bwiList]);
  const filteredBwiList = bwiList.filter(r =>
    (flockFilterBwi === "all" || String(r.flockId) === flockFilterBwi) &&
    (outcomeFilterBwi === "all" || String(r.overallOutcome ?? "").startsWith(outcomeFilterBwi)) &&
    (yearFilterBwi === "all" || String(r.assessmentDate ?? "").startsWith(yearFilterBwi))
  );
  const passCount = filteredBwiList.filter(r => String(r.overallOutcome ?? "").startsWith("Pass")).length;
  const advisoryCount = filteredBwiList.filter(r => String(r.overallOutcome ?? "").startsWith("Advisory")).length;
  const failCount = filteredBwiList.filter(r => String(r.overallOutcome ?? "").startsWith("Fail")).length;
  const lastAssessment = filteredBwiList[0] ?? null;
  const passRate = filteredBwiList.length ? Math.round(passCount / filteredBwiList.length * 100) : null;
  const bwiCsvCols = [
    { key: "assessmentDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.assessmentDate) },
    { key: "flockNumber", label: "Flock" }, { key: "houseName", label: "House" },
    { key: "assessedBy", label: "Assessed By" }, { key: "ageAtAssessmentDays", label: "Bird Age (days)" },
    { key: "sampleSize", label: "Sample Size" },
    { key: "footpadDermatitisScore", label: "FPD Score" }, { key: "footpadDermatitisPercent", label: "FPD Prevalence %" },
    { key: "hockBurnScore", label: "Hock Burn Score" }, { key: "hockBurnPercent", label: "Hock Burn %" },
    { key: "gaitScore", label: "Gait Score" }, { key: "breastBlisterPercent", label: "Breast Blister %" },
    { key: "plumageScore", label: "Plumage Score" }, { key: "soiledPlumagePercent", label: "Soiled Plumage %" },
    { key: "overallOutcome", label: "Outcome" }, { key: "actionsTaken", label: "Actions Taken" }, { key: "notes", label: "Notes" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold text-sm">Broiler Welfare Indicators (BWI)</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Red Tractor Broilers — pododermatitis, hock burn and gait score must be assessed and recorded at each crop cycle.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredBwiList, "bwi-assessments.csv", bwiCsvCols)} disabled={!filteredBwiList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={() => openAdd({ overallOutcome: "Pass" })}><Plus className="w-4 h-4 mr-1" />Add Assessment</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={flockFilterBwi} onValueChange={setFlockFilterBwi}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All flocks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All flocks</SelectItem>
            {flocks.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockNumber ?? f.id)}{f.houseName ? ` · ${f.houseName}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={outcomeFilterBwi} onValueChange={setOutcomeFilterBwi}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="All outcomes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            <SelectItem value="Pass">Pass</SelectItem>
            <SelectItem value="Advisory">Advisory</SelectItem>
            <SelectItem value="Fail">Fail</SelectItem>
          </SelectContent>
        </Select>
        <Select value={yearFilterBwi} onValueChange={setYearFilterBwi}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsBwi.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
      </div>
      {!isLoading && bwiList.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">BWI Assessment Summary</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Assessments" value={filteredBwiList.length} />
            <StatCard label="Pass Rate" value={passRate !== null ? `${passRate}%` : "—"} color={passRate !== null && passRate >= 80 ? "green" : passRate !== null && passRate >= 60 ? "amber" : "red"} />
            <StatCard label="Advisory" value={advisoryCount} color={advisoryCount > 0 ? "amber" : "green"} sub="action recommended" />
            <StatCard label="Fail" value={failCount} color={failCount > 0 ? "red" : "green"} sub={failCount > 0 ? "action required — check notes" : "no failures"} />
          </div>
          {lastAssessment && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              <span className="font-medium">Last assessment:</span> {fmtDate(lastAssessment.assessmentDate)} — {String(lastAssessment.flockNumber ?? "Flock unknown")} — Outcome: <span className={`font-semibold ${String(lastAssessment.overallOutcome ?? "").startsWith("Fail") ? "text-red-600" : String(lastAssessment.overallOutcome ?? "").startsWith("Advisory") ? "text-amber-600" : "text-green-700"}`}>{String(lastAssessment.overallOutcome ?? "—")}</span>
            </div>
          )}
        </div>
      )}
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
          { key: "doc", label: "Document", render: r => <DocAttach farmId={farmId} endpoint="poultry-broiler-welfare" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["poultry-bwi", farmId]} /> },
        ]}
        rows={filteredBwiList}
        onDelete={r => del.mutate(r.id as number)} deleteMutation={del}
        onView={setViewRecord}
      />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Welfare Assessment</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Date</p><p className="font-medium">{fmtDate(viewRecord.assessmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock</p><p className="font-medium">{String(viewRecord.flockNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessed By</p><p className="font-medium">{String(viewRecord.assessedBy ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Bird Age (days)</p><p className="font-medium">{String(viewRecord.ageAtAssessmentDays ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">FPD Score</p><p className="font-medium">{String(viewRecord.footpadDermatitisScore ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Hock Burn Score</p><p className="font-medium">{String(viewRecord.hockBurnScore ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Gait Score</p><p className="font-medium">{String(viewRecord.gaitScore ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Breast Blisters (%)</p><p className="font-medium">{String(viewRecord.breastBlisterPercent ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Overall Outcome</p><p className="font-medium">{String(viewRecord.overallOutcome ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Actions Taken</p><p className="font-medium">{String(viewRecord.actionsTaken ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
        <DialogContent style={{ maxWidth: "44rem" }}>
          <DialogHeader><DialogTitle>Broiler Welfare Indicators Assessment</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3 max-h-[70vh] overflow-y-auto pr-1">
            <div><Label>Assessment Date *</Label><Input type="date" value={String(form.assessmentDate ?? "")} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
            <div><Label>Flock *</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            <div><Label>Assessed By *</Label><StaffSelect value={String(form.assessedBy ?? "")} onChange={v => setForm(f => ({ ...f, assessedBy: v }))} staffNames={bwiStaffNames} loading={bwiMembersLoading} /></div>
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
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save Assessment</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

