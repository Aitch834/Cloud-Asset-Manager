import { useFarmName } from "@/hooks/use-farm-name";
import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffSelect } from "@/components/ui/staff-select";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  Plus, Trash2, Loader2, Eye, Grape, Leaf, ClipboardList, Sprout,
  BarChart3, Bug, Scissors, ShieldAlert, CheckCircle2, XCircle, AlertTriangle,
  FileDown, Pencil, Map, FileText, Receipt, CalendarCheck, ShieldCheck, Wine,
  Droplet, FlaskConical, ChevronRight, Package, TrendingUp, BookOpen, Printer,
  Award, Globe, BadgeAlert, Beaker, Wrench, Gauge,
} from "lucide-react";
import {
  ViticulturalAnalyticsTab,
  VintageSeasonReportTab,
  ViticulturalEnterpriseReport,
} from "@/components/ViticulturalReports";
import {
  HarvestReceptionTab,
  PressingRecordsTab,
  FermentationRecordsTab,
  VesselRegisterTab,
  CellarOpsTab,
  BottlingRecordsTab,
  So2TestingTab,
  EquipmentRegisterTab,
  BatchTrailQuickSearch,
  WINERY_VIEW_ADDITIONS_EVENT,
} from "@/pages/WineryManagementTabs";
import { sanitiseCsvCell } from "@/lib/csv";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { VineyardBlockBoundaryMapDialog } from "@/components/viticulture/VineyardBlockBoundaryMapDialog";
import { VineyardBlockMapTab } from "@/components/viticulture/VineyardBlockMapTab";
import { Checkbox } from "@/components/ui/checkbox";
import { useLookupStrings } from "@/hooks/use-lookup";
import { usePersistedTab } from "@/hooks/use-persisted-tab";

import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn, useFarmMeta, FarmSettingsWarning } from "./shared";

const EXCISE_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
};

export function ExciseDutyTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-excise-returns", "winery-excise-returns");

  // Fetch tasting sessions so we can auto-sum volumes for the selected period
  const { data: tastingRecs = [] } = useQuery<Record<string, unknown>[]>({
    queryKey: ["winery-tasting-sessions", farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/winery-tasting-sessions`), { credentials: "include" });
      const d = await r.json();
      return d.records ?? [];
    },
    enabled: !!farmId,
    staleTime: 60_000,
  });

  // Farm name (shared hook) and first winery licence number for print header
  const [, setLocation] = useLocation();
  const farmName = useFarmName(farmId);
  const { farmRecord: farmMeta } = useFarmMeta(farmId);
  const exciseMissingFields = farmMeta
    ? [
        !farmMeta.name && "Company / farm name",
        !farmMeta.address && "Farm address",
        !farmMeta.vatNumber && "VAT number",
      ].filter(Boolean) as string[]
    : [];
  const appaRefMissingFields = farmMeta
    ? (!farmMeta.appaRef || String(farmMeta.appaRef).trim() === "" ? ["APPA Ref"] : [])
    : [];
  const { data: licencesData } = useQuery<{ records?: Record<string, unknown>[] }>({
    queryKey: ["winery-licences", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/winery-licences`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 300_000,
  });
  const firstLicenceNo = (licencesData?.records ?? [])[0]?.licenceNumber as string | undefined;

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const openAdd = () => { setEditing(null); setForm({ status: "draft", smallProducerRelief: false }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm({ ...r }); setOpen(true); };

  // ── Dialog computed values ─────────────────────────────────────────────────

  // 1. Tasting volumes logged within the selected period (from Tastings & Tours log)
  const periodTastingsL = useMemo(() => {
    if (!form.periodStart || !form.periodEnd) return null;
    const start = new Date(form.periodStart as string);
    const end = new Date(form.periodEnd as string);
    return tastingRecs
      .filter(s => { const d = new Date(s.sessionDate as string); return d >= start && d <= end; })
      .reduce((sum, s) => sum + (parseFloat(String(s.totalVolumeL ?? 0)) || 0), 0);
  }, [tastingRecs, form.periodStart, form.periodEnd]);

  // 2. Rolling 12-month production ending at periodEnd — for SPR eligibility
  const computedAnnualProductionL = useMemo(() => {
    if (!form.periodEnd) return null;
    const periodEnd = new Date(form.periodEnd as string);
    const cutoff = new Date(periodEnd); cutoff.setFullYear(cutoff.getFullYear() - 1);
    const historicalL = crud.data
      .filter(r => r.id !== editing && r.periodEnd &&
        new Date(r.periodEnd as string) > cutoff &&
        new Date(r.periodEnd as string) <= periodEnd)
      .reduce((s, r) => s + (parseFloat(String(r.totalLitresProduced ?? 0)) || 0), 0);
    return historicalL + (parseFloat(String(form.totalLitresProduced ?? 0)) || 0);
  }, [crud.data, editing, form.periodEnd, form.totalLitresProduced]);

  // 3. HMRC duty rates — fetched from platform config so they can be updated without redeployment
  const { data: hmrcRates } = useQuery<{
    lowAbvRatePerLpa: number;
    highAbvRatePerLpa: number;
    abvBandThresholdPct: number;
    sprThresholdHl: number;
  }>({
    queryKey: ["hmrc-duty-rates"],
    queryFn: async () => {
      const r = await fetch(api("hmrc-duty-rates"), { credentials: "include" });
      return r.json();
    },
    staleTime: 15 * 60 * 1000, // 15 min — rates rarely change
  });
  const lowAbvRate    = hmrcRates?.lowAbvRatePerLpa    ?? 9.27;
  const highAbvRate   = hmrcRates?.highAbvRatePerLpa   ?? 28.50;
  const abvThreshold  = hmrcRates?.abvBandThresholdPct ?? 8.5;
  const sprThresholdHl = hmrcRates?.sprThresholdHl     ?? 4500;

  // Rate per 100 L at ABV% = standardPerLPA × ABV
  // SPR: standard rate × min(1, annualProduction_hl / sprThreshold)
  const computedDutyRatePer100L = useMemo(() => {
    const abv = parseFloat(String(form.nominalAbvPct ?? 0));
    if (!abv || abv < 3.5) return null;
    const stdPerLPA = abv < abvThreshold ? lowAbvRate : highAbvRate;
    const stdPer100L = stdPerLPA * abv;
    if (!form.smallProducerRelief) return stdPer100L;
    const annualL = computedAnnualProductionL ?? (parseFloat(String(form.annualProductionL ?? 0)) || 0);
    const annualHl = annualL / 100;
    if (!annualHl) return stdPer100L;
    return stdPer100L * Math.min(1, annualHl / sprThresholdHl);
  }, [form.nominalAbvPct, form.smallProducerRelief, form.annualProductionL, computedAnnualProductionL,
      lowAbvRate, highAbvRate, abvThreshold, sprThresholdHl]);

  // 4. Dutiable litres: UK removals + domestic consumption + tastings (exports are duty-suspended)
  const dutiableLitres = useMemo(() => {
    return (parseFloat(String(form.totalLitresRemovedUK ?? 0)) || 0)
         + (parseFloat(String(form.totalLitresDomesticConsumption ?? 0)) || 0)
         + (parseFloat(String(form.totalLitresTastings ?? 0)) || 0);
  }, [form.totalLitresRemovedUK, form.totalLitresDomesticConsumption, form.totalLitresTastings]);

  // 5. Computed duty payable = dutiable L × rate / 100
  const computedDutyPayable = useMemo(() => {
    if (!computedDutyRatePer100L || !dutiableLitres) return null;
    return (dutiableLitres * computedDutyRatePer100L) / 100;
  }, [dutiableLitres, computedDutyRatePer100L]);

  // 6. Stock reconciliation: opening + produced − all outflows
  const suggestedClosingStock = useMemo(() => {
    const opening = parseFloat(String(form.openingStockL ?? 0)) || 0;
    const produced = parseFloat(String(form.totalLitresProduced ?? 0)) || 0;
    if (!opening && !produced) return null;
    const out = (parseFloat(String(form.totalLitresRemovedUK ?? 0)) || 0)
              + (parseFloat(String(form.totalLitresExported ?? 0)) || 0)
              + (parseFloat(String(form.totalLitresDomesticConsumption ?? 0)) || 0)
              + (parseFloat(String(form.totalLitresTastings ?? 0)) || 0);
    return opening + produced - out;
  }, [form.openingStockL, form.totalLitresProduced, form.totalLitresRemovedUK,
      form.totalLitresExported, form.totalLitresDomesticConsumption, form.totalLitresTastings]);

  const save = () => {
    const payload = {
      ...form,
      // Persist computed values so they appear in the view dialog and table
      annualProductionL: computedAnnualProductionL ?? form.annualProductionL,
      dutyRatePer100L: computedDutyRatePer100L ?? form.dutyRatePer100L,
      totalDutyPayable: computedDutyPayable ?? form.totalDutyPayable,
    };
    if (editing !== null) crud.edit.mutate({ id: editing, ...payload } as Record<string, unknown> & { id: number });
    else crud.add.mutate(payload);
    setOpen(false);
  };

  // Rolling 12-month production for the SPR status banner on the main tab
  const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const rolling12mL = crud.data.filter(r => r.periodEnd && new Date(r.periodEnd as string) >= oneYearAgo)
    .reduce((s, r) => s + (parseFloat(String(r.totalLitresProduced ?? 0)) || 0), 0);
  const rollingHl = rolling12mL / 100;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div><h3 className="font-semibold text-sm">Excise Duty Returns</h3><p className="text-xs text-muted-foreground mt-0.5">HMRC wine duty log (Excise Notice 163). All wine produced — including tasting volumes — is dutiable. Small Producer Relief (SPR) applies under {sprThresholdHl.toLocaleString()} hl/year.</p></div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Return</Button>
      </div>
      {rollingHl > 0 && (
        <div className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${rollingHl >= 4500 ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-green-50 border-green-200 text-green-800"}`}>
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <p>Rolling 12-month production: <strong>{rollingHl.toFixed(1)} hl</strong> of {sprThresholdHl.toLocaleString()} hl SPR threshold.{rollingHl >= sprThresholdHl ? " Standard duty rates apply." : " Small Producer Relief may apply."}</p>
        </div>
      )}
      <FarmSettingsWarning
        missingFields={exciseMissingFields}
        settingsSection="Basic Details"
        onNavigate={() => setLocation("/settings/farm")}
      />
      <FarmSettingsWarning
        missingFields={appaRefMissingFields}
        settingsSection="Viticulture & Wine"
        onNavigate={() => setLocation("/settings/farm")}
      />
      {crud.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "period", label: "Period", render: r => `${fmtDate(r.periodStart)} – ${fmtDate(r.periodEnd)}` },
            { key: "status", label: "Status", render: r => <span className={`text-xs rounded-full px-2 py-0.5 ${EXCISE_STATUS_COLORS[String(r.status)] ?? ""}`}>{fmt(r.status)}</span> },
            { key: "totalLitresProduced", label: "Produced (L)", render: r => fmtNum(r.totalLitresProduced) },
            { key: "totalLitresRemovedUK", label: "Removed UK (L)", render: r => fmtNum(r.totalLitresRemovedUK) },
            { key: "totalLitresTastings", label: "Tastings (L)", render: r => fmtNum(r.totalLitresTastings) },
            { key: "totalDutyPayable", label: "Duty (£)", render: r => r.totalDutyPayable ? `£${fmtNum(r.totalDutyPayable, 2)}` : "—" },
            { key: "paidDate", label: "Paid", render: r => fmtDate(r.paidDate) },
            {
              key: "appaRef", label: "APPA Ref", render: _r => {
                const ref = farmMeta?.appaRef ? String(farmMeta.appaRef).trim() : "";
                return ref
                  ? <span className="text-xs text-muted-foreground">{ref}</span>
                  : <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5"><AlertTriangle className="w-3 h-3 shrink-0" />Missing</span>;
              }
            },
          ]}
          rows={crud.data}
          onView={setView} onEdit={openEdit} onDelete={r => crud.remove.mutate(r.id as number)} deleteMutation={crud.remove}
        />
      )}

      {/* ── View dialog ── */}
      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Excise Return — {fmtDate(view.periodStart)} to {fmtDate(view.periodEnd)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ViewField label="HMRC Return Ref" value={fmt(view.hmrcReturnRef)} />
              <ViewField label="Status" value={<span className={`text-xs rounded-full px-2 py-0.5 ${EXCISE_STATUS_COLORS[String(view.status)] ?? ""}`}>{fmt(view.status)}</span>} />
              <ViewField label="Period Start" value={fmtDate(view.periodStart)} />
              <ViewField label="Period End" value={fmtDate(view.periodEnd)} />
              <ViewField label="Opening Stock (L)" value={fmtNum(view.openingStockL)} />
              <ViewField label="Closing Stock (L)" value={fmtNum(view.closingStockL)} />
              <ViewField label="Total Produced (L)" value={fmtNum(view.totalLitresProduced)} />
              <ViewField label="Removed — UK Market (L)" value={fmtNum(view.totalLitresRemovedUK)} />
              <ViewField label="Exported (L)" value={fmtNum(view.totalLitresExported)} />
              <ViewField label="Domestic Consumption (L)" value={fmtNum(view.totalLitresDomesticConsumption)} />
              <ViewField label="Tastings / Samples (L)" value={fmtNum(view.totalLitresTastings)} />
              <ViewField label="Nominal ABV (%)" value={fmt(view.nominalAbvPct)} />
              <ViewField label="Rolling 12M Production (L)" value={fmtNum(view.annualProductionL)} />
              <ViewField label="Small Producer Relief" value={view.smallProducerRelief ? "Yes — SPR claimed" : "No"} />
              <ViewField label="Duty Rate (£ / 100 L)" value={view.dutyRatePer100L ? `£${fmtNum(view.dutyRatePer100L, 2)}` : "—"} />
              <ViewField label="Total Duty Payable" value={view.totalDutyPayable ? `£${fmtNum(view.totalDutyPayable, 2)}` : "—"} />
              <ViewField label="Submitted Date" value={fmtDate(view.submittedDate)} />
              <ViewField label="Paid Date" value={fmtDate(view.paidDate)} />
              <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>
            </div>
            {typeof view.id === "number" && (
              <div className="border-t pt-3 mt-1">
                <RecordAttachments farmId={farmId} recordType="winery-excise-return" recordId={view.id} />
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => printExciseReturn(view, farmName ?? `Farm ${farmId}`, firstLicenceNo, farmMeta)}>
                <Printer className="w-3.5 h-3.5 mr-1.5" />Print Return
              </Button>
              <Button onClick={() => setView(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Add / Edit dialog ── */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); crud.add.reset(); crud.edit.reset(); } }}>
        <DialogContent style={{ maxWidth: "40rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing !== null ? "Edit" : "Add"} Excise Return</DialogTitle>
            <DialogDescription>
              Fields marked <span className="text-blue-600 font-medium">auto</span> are calculated from your records — you can still adjust them if needed.
            </DialogDescription>
          </DialogHeader>

          {/* Section: Period & Status */}
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-1">Return period &amp; status</p>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Period Start *</Label><Input type="date" value={String(form.periodStart ?? "")} onChange={e => sf("periodStart", e.target.value)} /></div>
            <div><Label>Period End *</Label><Input type="date" value={String(form.periodEnd ?? "")} onChange={e => sf("periodEnd", e.target.value)} /></div>
            <div><Label>HMRC Return Ref</Label><Input value={String(form.hmrcReturnRef ?? "")} onChange={e => sf("hmrcReturnRef", e.target.value)} placeholder="Assigned by HMRC on submission" /></div>
            <div><Label>Status</Label>
              <Select value={String(form.status ?? "draft")} onValueChange={v => sf("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted to HMRC</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section: Stock reconciliation */}
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3">Stock reconciliation</p>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Opening Stock (L)</Label><Input type="number" value={String(form.openingStockL ?? "")} onChange={e => sf("openingStockL", e.target.value)} placeholder="From previous period closing stock" /></div>
            <div><Label>Total Produced This Period (L)</Label><Input type="number" value={String(form.totalLitresProduced ?? "")} onChange={e => sf("totalLitresProduced", e.target.value)} /></div>
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-1">
                <Label>Closing Stock (L)</Label>
                {suggestedClosingStock !== null && (
                  <button type="button" className="text-xs text-blue-600 hover:underline" onClick={() => sf("closingStockL", suggestedClosingStock.toFixed(2))}>
                    Apply calculated: {suggestedClosingStock.toFixed(1)} L
                  </button>
                )}
              </div>
              <Input type="number" value={String(form.closingStockL ?? "")} onChange={e => sf("closingStockL", e.target.value)}
                placeholder={suggestedClosingStock !== null ? `Calculated: ${suggestedClosingStock.toFixed(1)} L` : "Opening + produced − all outflows"} />
              {suggestedClosingStock !== null && <p className="text-xs text-muted-foreground mt-1">= Opening + Produced − UK removals − Exported − Domestic − Tastings</p>}
            </div>
          </div>

          {/* Section: Movements */}
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3">Movements (removals from approved premises)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Removed — UK Market (L)</Label>
              <Input type="number" value={String(form.totalLitresRemovedUK ?? "")} onChange={e => sf("totalLitresRemovedUK", e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Dutiable — duty charged on removal, not on sale</p>
            </div>
            <div>
              <Label>Exported (L)</Label>
              <Input type="number" value={String(form.totalLitresExported ?? "")} onChange={e => sf("totalLitresExported", e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Duty-suspended on export — not included in duty calculation</p>
            </div>
            <div>
              <Label>Domestic Consumption (L)</Label>
              <Input type="number" value={String(form.totalLitresDomesticConsumption ?? "")} onChange={e => sf("totalLitresDomesticConsumption", e.target.value)} />
              <p className="text-xs text-muted-foreground mt-1">Grower's own use — dutiable</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Tastings / Samples (L)</Label>
                {periodTastingsL !== null && periodTastingsL > 0 && (
                  <button type="button" className="text-xs text-blue-600 hover:underline" onClick={() => sf("totalLitresTastings", periodTastingsL.toFixed(2))}>
                    Apply from log: {periodTastingsL.toFixed(1)} L
                  </button>
                )}
              </div>
              <Input type="number" value={String(form.totalLitresTastings ?? "")} onChange={e => sf("totalLitresTastings", e.target.value)}
                placeholder={periodTastingsL !== null && periodTastingsL > 0 ? `Log total: ${periodTastingsL.toFixed(1)} L` : "All tasting volumes are dutiable"} />
              {periodTastingsL !== null && <p className="text-xs text-blue-600 mt-1">{periodTastingsL > 0 ? `${periodTastingsL.toFixed(1)} L logged in Tastings & Tours for this period` : "No tasting sessions logged for this period"}</p>}
            </div>
          </div>

          {/* Section: Duty calculation */}
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3">Duty calculation (HMRC August 2023 rates)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nominal ABV (%)</Label>
              <Input type="number" step="0.01" value={String(form.nominalAbvPct ?? "")} onChange={e => sf("nominalAbvPct", e.target.value)} placeholder="e.g. 12.5" />
              <p className="text-xs text-muted-foreground mt-1">Still wine 8.5–22% ABV: £28.50/LPA standard rate</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Rolling 12M Production (L)</Label>
                {computedAnnualProductionL !== null && (
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5">auto</span>
                )}
              </div>
              <Input type="number" readOnly
                value={computedAnnualProductionL !== null ? computedAnnualProductionL.toFixed(0) : String(form.annualProductionL ?? "")}
                className="bg-muted/50 cursor-default" />
              <p className="text-xs text-muted-foreground mt-1">Calculated from your previous returns — SPR threshold: 450,000 L (4,500 hl)</p>
            </div>
            <div className="col-span-2 flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/30">
              <Checkbox checked={!!form.smallProducerRelief} onCheckedChange={v => sf("smallProducerRelief", !!v)} id="spr" />
              <Label htmlFor="spr" className="cursor-pointer">Claiming Small Producer Relief (production under 4,500 hl/year)</Label>
              {!!form.smallProducerRelief && computedAnnualProductionL !== null && computedAnnualProductionL / 100 < 4500 && (
                <span className="ml-auto text-xs text-green-700 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">Eligible</span>
              )}
              {!!form.smallProducerRelief && computedAnnualProductionL !== null && computedAnnualProductionL / 100 >= 4500 && (
                <span className="ml-auto text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">Over threshold</span>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Effective Rate (£ / 100 L)</Label>
                {computedDutyRatePer100L !== null && (
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5">auto</span>
                )}
              </div>
              <Input type="number" step="0.01" readOnly
                value={computedDutyRatePer100L !== null ? computedDutyRatePer100L.toFixed(2) : String(form.dutyRatePer100L ?? "")}
                className="bg-muted/50 cursor-default" />
              <p className="text-xs text-muted-foreground mt-1">{computedDutyRatePer100L !== null ? (form.smallProducerRelief ? "SPR reduced rate (HMRC Aug 2023)" : "Standard rate (HMRC Aug 2023)") : "Enter ABV to calculate rate"}</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <Label>Total Duty Payable (£)</Label>
                {computedDutyPayable !== null && (
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5">auto</span>
                )}
              </div>
              <Input type="number" step="0.01" readOnly
                value={computedDutyPayable !== null ? computedDutyPayable.toFixed(2) : String(form.totalDutyPayable ?? "")}
                className={`${computedDutyPayable !== null ? "bg-muted/50 cursor-default font-medium" : ""}`} />
              {computedDutyPayable !== null && (
                <p className="text-xs text-muted-foreground mt-1">{dutiableLitres.toFixed(1)} L dutiable × £{(computedDutyRatePer100L ?? 0).toFixed(2)} per 100 L</p>
              )}
            </div>
            {dutiableLitres > 0 && (
              <div className="col-span-2 text-xs text-muted-foreground bg-muted/30 rounded px-3 py-2">
                Dutiable litres = UK removals + domestic consumption + tastings (exports excluded) = <strong>{dutiableLitres.toFixed(1)} L</strong>
              </div>
            )}
          </div>

          {/* Section: Filing dates */}
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3">Filing dates</p>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Submitted to HMRC</Label><Input type="date" value={String(form.submittedDate ?? "")} onChange={e => sf("submittedDate", e.target.value)} /></div>
            <div><Label>Duty Paid Date</Label><Input type="date" value={String(form.paidDate ?? "")} onChange={e => sf("paidDate", e.target.value)} /></div>
          </div>

          <div className="mt-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>

          <DialogMutationError mutation={crud.add} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={crud.edit} message="Failed to save — your entries are still here." />
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending || !form.periodStart || !form.periodEnd}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Winery: Tastings & Tours ────────────────────────────────────────────────────

