import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Globe, CheckCircle2, AlertTriangle, ExternalLink, Loader2,
  ChevronRight, Snowflake, Sprout, Leaf, Grape, Plus, FileDown,
  Clock, History, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiUrl as api } from "@/lib/api";
import { fmtDate, fmtNum, today, exportCSV, ConfirmDialog, BBCH_STAGES } from "./shared";

const WINEGB_URL = "https://winegb.co.uk/production/vineyards-wineries/";
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = new Date().getMonth() + 1; // 1-based

// ─── Types ────────────────────────────────────────────────────────────────────

type SurveyKey = "bud_burst" | "frost_damage" | "flowering" | "veraison" | "harvest";
type SurveyStatus = "submitted" | "overdue" | "in-season" | "upcoming" | "not-submitted";

interface SurveyDef {
  key: SurveyKey;
  label: string;
  window: string;
  months: number[];
  description: string;
  phenoBucket: "bud_burst" | "flowering" | "veraison" | null;
  isFrost?: boolean;
  isHarvest?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

// ─── Survey definitions ───────────────────────────────────────────────────────

const SURVEYS: SurveyDef[] = [
  {
    key: "bud_burst",
    label: "Bud Burst",
    window: "March–May",
    months: [3, 4, 5],
    description: "Report the date each variety reached 50% bud burst. Auto-populated from your BBCH 05–15 phenology observations.",
    phenoBucket: "bud_burst",
    icon: Sprout,
  },
  {
    key: "frost_damage",
    label: "Frost Damage",
    window: "March–May",
    months: [3, 4, 5],
    description: "Report frost events and their estimated impact on yield. Log individual events below. If no frost occurred, still submit to confirm nil damage.",
    phenoBucket: null,
    isFrost: true,
    icon: Snowflake,
  },
  {
    key: "flowering",
    label: "Flowering",
    window: "June–July",
    months: [6, 7],
    description: "Report the date each variety reached 50% flowering. Auto-populated from your BBCH 53–68 phenology observations.",
    phenoBucket: "flowering",
    icon: Leaf,
  },
  {
    key: "veraison",
    label: "Véraison",
    window: "Aug–Sep",
    months: [8, 9],
    description: "Report when colour change (véraison) began in each variety. Auto-populated from your BBCH 77–85 phenology observations.",
    phenoBucket: "veraison",
    icon: Grape,
  },
  {
    key: "harvest",
    label: "Harvest",
    window: "Oct–Nov",
    months: [9, 10, 11],
    description: "Report yield and must chemistry by variety. Auto-populated from your harvest records. Download the pre-formatted CSV to submit to WineGB.",
    phenoBucket: null,
    isHarvest: true,
    icon: Grape,
  },
];

const SEVERITY_OPTIONS = [
  { value: "light",        label: "Light (0 to −1 °C)" },
  { value: "moderate",     label: "Moderate (−1 to −3 °C)" },
  { value: "severe",       label: "Severe (−3 to −5 °C)" },
  { value: "catastrophic", label: "Catastrophic (below −5 °C)" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatus(survey: SurveyDef, submitted: boolean, isCurrentYear: boolean): SurveyStatus {
  if (submitted) return "submitted";
  if (!isCurrentYear) return "not-submitted";
  if (CURRENT_MONTH > Math.max(...survey.months)) return "overdue";
  if (survey.months.includes(CURRENT_MONTH)) return "in-season";
  return "upcoming";
}

function StatusBadge({ status, submittedAt }: { status: SurveyStatus; submittedAt?: string | null }) {
  if (status === "submitted") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 border border-green-200 px-2 py-0.5 text-xs font-semibold text-green-700 shrink-0">
      <CheckCircle2 className="w-3 h-3" />
      Submitted{submittedAt ? ` ${fmtDate(submittedAt)}` : ""}
    </span>
  );
  if (status === "overdue") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 border border-red-200 px-2 py-0.5 text-xs font-semibold text-red-700 shrink-0">
      <AlertTriangle className="w-3 h-3" /> Overdue
    </span>
  );
  if (status === "in-season") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700 shrink-0">
      <Clock className="w-3 h-3" /> Due now
    </span>
  );
  if (status === "not-submitted") return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-500 shrink-0">
      Not submitted
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-400 shrink-0">
      <Clock className="w-3 h-3" /> Upcoming
    </span>
  );
}

// ─── Phenology table (bud burst / flowering / véraison) ───────────────────────

function PhenoTable({ rows }: { rows: Record<string, unknown>[] }) {
  if (!rows.length) return (
    <p className="text-xs text-muted-foreground italic py-1">
      No matching phenology observations logged for this year. Record them on the Phenology tab and they will appear here automatically.
    </p>
  );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="py-1.5 pr-4 font-medium text-muted-foreground">Variety</th>
            <th className="py-1.5 pr-4 font-medium text-muted-foreground">Block</th>
            <th className="py-1.5 pr-4 font-medium text-muted-foreground">Observation Date</th>
            <th className="py-1.5 pr-4 font-medium text-muted-foreground">BBCH Stage</th>
            <th className="py-1.5 font-medium text-muted-foreground">% Reached</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-dashed last:border-0">
              <td className="py-1.5 pr-4 font-medium">{String(r.variety ?? "—")}</td>
              <td className="py-1.5 pr-4 text-muted-foreground">{String(r.blockName ?? "—")}</td>
              <td className="py-1.5 pr-4">{fmtDate(r.observationDate)}</td>
              <td className="py-1.5 pr-4 font-mono text-xs">{String(r.bbchStage ?? "—")}</td>
              <td className="py-1.5">{r.percentageReached != null ? `${r.percentageReached}%` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Harvest table + CSV export ───────────────────────────────────────────────

function HarvestTable({ rows, year }: { rows: Record<string, unknown>[]; year: number }) {
  if (!rows.length) return (
    <p className="text-xs text-muted-foreground italic py-1">
      No harvest records for {year}. Add them on the Harvest tab and they will appear here automatically.
    </p>
  );

  const exportWinegbCsv = () => {
    exportCSV(rows, `winegb-harvest-survey-${year}.csv`, [
      { key: "variety",              label: "Grape Variety" },
      { key: "blockName",            label: "Block" },
      { key: "areaHa",               label: "Area (ha)",      fmt: (r: Record<string, unknown>) => r.areaHa != null ? fmtNum(r.areaHa, 2) : "" },
      { key: "yieldKg",              label: "Yield (kg)",     fmt: (r: Record<string, unknown>) => r.yieldKg != null ? String(r.yieldKg) : "" },
      { key: "yieldTonnesPerHa",     label: "Yield (t/ha)",   fmt: (r: Record<string, unknown>) => r.yieldTonnesPerHa != null ? fmtNum(r.yieldTonnesPerHa, 3) : "" },
      { key: "brix",                 label: "Brix (°)",       fmt: (r: Record<string, unknown>) => r.brix != null ? fmtNum(r.brix, 1) : "" },
      { key: "titratableAcidityGl",  label: "TA (g/L)",       fmt: (r: Record<string, unknown>) => r.titratableAcidityGl != null ? fmtNum(r.titratableAcidityGl, 1) : "" },
      { key: "ph",                   label: "pH",             fmt: (r: Record<string, unknown>) => r.ph != null ? fmtNum(r.ph, 2) : "" },
      { key: "potentialAlcohol",     label: "Pot. Alc. (%)",  fmt: (r: Record<string, unknown>) => r.potentialAlcohol != null ? fmtNum(r.potentialAlcohol, 1) : "" },
      { key: "grapeCondition",       label: "Grape Condition" },
      { key: "harvestDate",          label: "Harvest Date",   fmt: (r: Record<string, unknown>) => fmtDate(r.harvestDate) },
      { key: "harvestMethod",        label: "Harvest Method" },
    ]);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="py-1.5 pr-3 font-medium text-muted-foreground">Variety</th>
              <th className="py-1.5 pr-3 font-medium text-muted-foreground">Block</th>
              <th className="py-1.5 pr-3 text-right font-medium text-muted-foreground">Area (ha)</th>
              <th className="py-1.5 pr-3 text-right font-medium text-muted-foreground">Yield (kg)</th>
              <th className="py-1.5 pr-3 text-right font-medium text-muted-foreground">t/ha</th>
              <th className="py-1.5 pr-3 text-right font-medium text-muted-foreground">Brix</th>
              <th className="py-1.5 pr-3 text-right font-medium text-muted-foreground">TA (g/L)</th>
              <th className="py-1.5 pr-3 text-right font-medium text-muted-foreground">pH</th>
              <th className="py-1.5 text-right font-medium text-muted-foreground">Pot. Alc.</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-dashed last:border-0">
                <td className="py-1.5 pr-3 font-medium">{String(r.variety ?? "—")}</td>
                <td className="py-1.5 pr-3 text-muted-foreground">{String(r.blockName ?? "—")}</td>
                <td className="py-1.5 pr-3 text-right">{r.areaHa != null ? fmtNum(r.areaHa, 2) : "—"}</td>
                <td className="py-1.5 pr-3 text-right">{r.yieldKg != null ? Number(r.yieldKg).toLocaleString() : "—"}</td>
                <td className="py-1.5 pr-3 text-right">{r.yieldTonnesPerHa != null ? fmtNum(r.yieldTonnesPerHa, 2) : "—"}</td>
                <td className="py-1.5 pr-3 text-right">{r.brix != null ? fmtNum(r.brix, 1) : "—"}</td>
                <td className="py-1.5 pr-3 text-right">{r.titratableAcidityGl != null ? fmtNum(r.titratableAcidityGl, 1) : "—"}</td>
                <td className="py-1.5 pr-3 text-right">{r.ph != null ? fmtNum(r.ph, 2) : "—"}</td>
                <td className="py-1.5 text-right">{r.potentialAlcohol != null ? `${fmtNum(r.potentialAlcohol, 1)}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button size="sm" variant="outline" onClick={exportWinegbCsv}>
        <FileDown className="w-4 h-4 mr-1.5" />Export WineGB Harvest Survey CSV
      </Button>
    </div>
  );
}

// ─── Frost events mini-section ────────────────────────────────────────────────

function FrostSection({
  farmId, year, frostEvents, onRefetch, blocks,
}: {
  farmId: number;
  year: number;
  frostEvents: Record<string, unknown>[];
  onRefetch: () => void;
  blocks: Record<string, unknown>[];
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const blockName = (id: unknown) => {
    const blk = blocks.find(b => b.id === id);
    return blk ? String(blk.blockName) : "All blocks";
  };

  const addMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-frost-events`), {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Failed to save frost event");
      return r.json();
    },
    onSuccess: () => { setDialogOpen(false); onRefetch(); },
  });

  const editMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-frost-events/${data.id}`), {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Failed to save frost event");
      return r.json();
    },
    onSuccess: () => { setDialogOpen(false); onRefetch(); },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-frost-events/${id}`), {
        method: "DELETE", credentials: "include",
      });
      if (!r.ok) throw new Error("Failed to delete");
      return r.json();
    },
    onSuccess: () => onRefetch(),
  });

  const openAdd = () => {
    setForm({ frostDate: today, severity: "moderate" });
    setCurrent(null);
    setDialogOpen(true);
  };
  const openEdit = (row: Record<string, unknown>) => { setForm({ ...row }); setCurrent(row); setDialogOpen(true); };
  const save = () => {
    if (current) editMutation.mutate({ ...form, id: current.id as number });
    else addMutation.mutate(form);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {frostEvents.length === 0
            ? `No frost events recorded for ${year}.`
            : `${frostEvents.length} frost event${frostEvents.length === 1 ? "" : "s"} logged for ${year}.`}
        </p>
        <Button size="sm" variant="outline" onClick={openAdd}>
          <Plus className="w-3.5 h-3.5 mr-1" />Add Frost Event
        </Button>
      </div>

      {frostEvents.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          If no frost occurred this season, you can still submit to WineGB to confirm nil damage.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="py-1.5 pr-3 font-medium text-muted-foreground">Date</th>
                <th className="py-1.5 pr-3 font-medium text-muted-foreground">Block</th>
                <th className="py-1.5 pr-3 font-medium text-muted-foreground">Severity</th>
                <th className="py-1.5 pr-3 text-right font-medium text-muted-foreground">Min Temp</th>
                <th className="py-1.5 pr-3 text-right font-medium text-muted-foreground">Est. Damage</th>
                <th className="py-1.5 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {frostEvents.map((ev, i) => (
                <tr key={String(ev.id ?? i)} className="border-b border-dashed last:border-0">
                  <td className="py-1.5 pr-3">{fmtDate(ev.frostDate)}</td>
                  <td className="py-1.5 pr-3 text-muted-foreground">{String(ev.blockName ?? "All blocks")}</td>
                  <td className="py-1.5 pr-3 capitalize">{String(ev.severity ?? "—")}</td>
                  <td className="py-1.5 pr-3 text-right">{ev.minTempC != null ? `${fmtNum(ev.minTempC, 1)} °C` : "—"}</td>
                  <td className="py-1.5 pr-3 text-right">{ev.estimatedDamagePercent != null ? `${ev.estimatedDamagePercent}%` : "—"}</td>
                  <td className="py-1.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button type="button" className="text-xs text-muted-foreground underline underline-offset-1 hover:text-foreground" onClick={() => openEdit(ev)}>Edit</button>
                      <button type="button" className="text-xs text-red-500 underline underline-offset-1 hover:text-red-700" onClick={() => setPendingDeleteId(ev.id as number)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={pendingDeleteId !== null}
        title="Delete this frost event?"
        message="This cannot be undone."
        onConfirm={() => { if (pendingDeleteId !== null) removeMutation.mutate(pendingDeleteId, { onSuccess: () => setPendingDeleteId(null) }); }}
        onCancel={() => { setPendingDeleteId(null); removeMutation.reset(); }}
        confirmLabel="Delete"
        confirmVariant="destructive"
        mutation={removeMutation}
      />

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={o => { if (!o) { setDialogOpen(false); addMutation.reset(); editMutation.reset(); } }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Frost Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date *</Label>
                <Input type="date" max={today} value={String(form.frostDate ?? "")} onChange={e => sf("frostDate", e.target.value)} />
              </div>
              <div>
                <Label>Severity *</Label>
                <Select value={String(form.severity ?? "moderate")} onValueChange={v => sf("severity", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SEVERITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Block (leave blank if farm-wide)</Label>
              <Select value={String(form.blockId ?? "__none__")} onValueChange={v => sf("blockId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="All blocks…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— All blocks —</SelectItem>
                  {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Min Temperature (°C)</Label>
                <Input type="number" step="0.1" placeholder="e.g. −2.5" value={String(form.minTempC ?? "")} onChange={e => sf("minTempC", e.target.value)} />
              </div>
              <div>
                <Label>Duration (hours)</Label>
                <Input type="number" step="0.5" min="0" placeholder="e.g. 3.5" value={String(form.durationHours ?? "")} onChange={e => sf("durationHours", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>BBCH Stage at Frost</Label>
                <Select value={String(form.bbchStageAtFrost ?? "__none__")} onValueChange={v => sf("bbchStageAtFrost", v === "__none__" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Unknown…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Unknown —</SelectItem>
                    {BBCH_STAGES.map(s => <SelectItem key={s.code} value={s.code}>{s.code} — {s.desc}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estimated Damage (%)</Label>
                <Input type="number" min="0" max="100" placeholder="0–100" value={String(form.estimatedDamagePercent ?? "")} onChange={e => sf("estimatedDamagePercent", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} placeholder="Conditions, recovery actions taken, insurance references…" />
            </div>
          </div>
          <DialogMutationError mutation={addMutation} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={editMutation} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={addMutation.isPending || editMutation.isPending || !form.frostDate || !form.severity}>
              {(addMutation.isPending || editMutation.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Individual survey card ───────────────────────────────────────────────────

function SurveyCard({
  survey, submission, phenoRows, harvestRows, frostEvents,
  farmId, year, isCurrentYear, blocks, onRefetch, onToggle, isTogglePending,
}: {
  survey: SurveyDef;
  submission: { submitted: boolean; submittedAt: string | null } | undefined;
  phenoRows: Record<string, unknown>[];
  harvestRows: Record<string, unknown>[];
  frostEvents: Record<string, unknown>[];
  farmId: number;
  year: number;
  isCurrentYear: boolean;
  blocks: Record<string, unknown>[];
  onRefetch: () => void;
  onToggle: (key: SurveyKey, submitted: boolean) => void;
  isTogglePending: boolean;
}) {
  const submitted = submission?.submitted ?? false;
  const status = getStatus(survey, submitted, isCurrentYear);
  const Icon = survey.icon;

  const borderClass = submitted
    ? "border-green-200 bg-green-50/30"
    : status === "overdue"
    ? "border-red-200 bg-red-50/20"
    : status === "in-season"
    ? "border-amber-200 bg-amber-50/20"
    : "border-slate-200 bg-white";

  const iconClass = submitted
    ? "text-green-600"
    : status === "overdue"
    ? "text-red-500"
    : status === "in-season"
    ? "text-amber-600"
    : "text-slate-400";

  return (
    <div className={`rounded-lg border ${borderClass}`}>
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-0">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconClass}`} />
        <div className="flex-1 min-w-0 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{survey.label}</span>
            <span className="text-xs text-muted-foreground">Collection window: {survey.window}</span>
            <StatusBadge status={status} submittedAt={submission?.submittedAt} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{survey.description}</p>
        </div>
      </div>

      {/* Data panel */}
      <div className="px-4 pb-4 space-y-3">
        <div className="rounded-md border bg-white/80 p-3">
          {survey.phenoBucket !== null ? (
            <PhenoTable rows={phenoRows} />
          ) : survey.isFrost ? (
            <FrostSection farmId={farmId} year={year} frostEvents={frostEvents} onRefetch={onRefetch} blocks={blocks} />
          ) : survey.isHarvest ? (
            <HarvestTable rows={harvestRows} year={year} />
          ) : null}
        </div>

        {/* CTA row */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            size="sm"
            variant={submitted ? "outline" : "default"}
            className={submitted ? "border-green-300 text-green-700 hover:bg-green-50" : ""}
            disabled={isTogglePending}
            onClick={() => onToggle(survey.key, !submitted)}
          >
            {isTogglePending
              ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              : submitted
              ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              : null}
            {submitted ? "Submitted — click to unmark" : "Mark as Submitted to WineGB"}
          </Button>
          <a
            href={WINEGB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
          >
            Submit to WineGB <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Year-on-year history table ───────────────────────────────────────────────

function HistoryTable({ farmId, years }: { farmId: number; years: number[] }) {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery<{
    history: Record<string, Record<string, { submitted: boolean; submittedAt: string | null }>>;
    years: number[];
  }>({
    queryKey: ["winegb-submissions-history", farmId],
    queryFn: () =>
      fetch(api(`farms/${farmId}/winegb-submissions-history`), { credentials: "include" })
        .then(r => { if (!r.ok) throw new Error("Failed to load history"); return r.json(); }),
    enabled: open && !!farmId,
    staleTime: 120_000,
  });

  const displayYears = (data?.years.length ? data.years : years).filter(Boolean);

  return (
    <div className="rounded-lg border bg-white">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors rounded-lg"
        onClick={() => setOpen(v => !v)}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <History className="w-4 h-4 text-muted-foreground" />
          Year-on-Year Submission History
        </span>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="border-t px-4 pb-4 pt-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />Loading history…
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-6 font-medium text-muted-foreground">Year</th>
                    {SURVEYS.map(s => (
                      <th key={s.key} className="text-center py-2 px-3 font-medium text-muted-foreground whitespace-nowrap">{s.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayYears.map(yr => {
                    const yearSubs = data?.history?.[String(yr)] ?? {};
                    return (
                      <tr key={yr} className="border-b border-dashed last:border-0">
                        <td className="py-2 pr-6 font-semibold">{yr}</td>
                        {SURVEYS.map(s => {
                          const sub = yearSubs[s.key];
                          const done = sub?.submitted ?? false;
                          const isPast = yr < CURRENT_YEAR;
                          return (
                            <td key={s.key} className="py-2 px-3 text-center">
                              {done ? (
                                <span title={sub?.submittedAt ? `Submitted ${fmtDate(sub.submittedAt)}` : "Submitted"}>
                                  <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto" />
                                </span>
                              ) : isPast ? (
                                <X className="w-4 h-4 text-red-300 mx-auto" />
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {displayYears.length === 0 && (
                    <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No historical data yet.</td></tr>
                  )}
                </tbody>
              </table>
              <p className="text-[11px] text-muted-foreground mt-2">Years are included when harvest records, phenology observations, or survey submissions exist.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function WinegbSurveysTab({
  farmId,
  blocks,
}: {
  farmId: number;
  blocks: Record<string, unknown>[];
}) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery<{
    year: number;
    submissions: Record<string, { submitted: boolean; submittedAt: string | null }>;
    phenologySummary: Record<string, Record<string, unknown>[]>;
    harvestSummary: Record<string, unknown>[];
    frostEvents: Record<string, unknown>[];
    allYears: number[];
  }>({
    queryKey: ["winegb-survey-data", farmId, year],
    queryFn: () =>
      fetch(api(`farms/${farmId}/winegb-survey-data?year=${year}`), { credentials: "include" })
        .then(r => { if (!r.ok) throw new Error("Failed to load survey data"); return r.json(); }),
    enabled: !!farmId,
    staleTime: 60_000,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ key, submitted }: { key: SurveyKey; submitted: boolean }) => {
      const r = await fetch(api(`farms/${farmId}/winegb-submissions/${key}`), {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submitted, year }),
      });
      if (!r.ok) throw new Error("Failed to update survey status");
      return r.json();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["winegb-survey-data", farmId, year] });
      void queryClient.invalidateQueries({ queryKey: ["winegb-submissions", farmId, year] });
      void queryClient.invalidateQueries({ queryKey: ["winegb-submissions-history", farmId] });
    },
  });

  const submissions = data?.submissions ?? {};
  const phenologySummary = data?.phenologySummary ?? {};
  const harvestSummary = data?.harvestSummary ?? [];
  const frostEvents = data?.frostEvents ?? [];

  const allYears = useMemo(() => {
    const ys = new Set<number>(data?.allYears ?? []);
    ys.add(CURRENT_YEAR);
    return Array.from(ys).sort((a, b) => b - a);
  }, [data?.allYears]);

  const isCurrentYear = year === CURRENT_YEAR;
  const submittedCount = SURVEYS.filter(s => submissions[s.key]?.submitted).length;
  const allDone = submittedCount === SURVEYS.length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-600" />
            WineGB Seasonal Surveys
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
            Track your five seasonal WineGB survey submissions year on year. Your phenology and harvest records auto-populate the data tables so you have everything ready before opening the WineGB portal.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={String(year)} onValueChange={v => setYear(Number(v))}>
            <SelectTrigger className="w-24 h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {allYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <a
            href={WINEGB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            WineGB Member Portal <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Progress summary bar */}
      {!isLoading && (
        <div className={`rounded-lg border px-4 py-3 flex items-center gap-3 ${allDone ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}>
          {allDone
            ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            : <Globe className="w-5 h-5 text-muted-foreground shrink-0" />
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              {allDone
                ? `All ${SURVEYS.length} surveys submitted for ${year}`
                : `${submittedCount} of ${SURVEYS.length} surveys submitted for ${year}`}
            </p>
            <p className="text-xs text-muted-foreground">
              Click "Mark as Submitted" on each survey after uploading your data directly to WineGB. Submission dates are recorded here for your audit trail.
            </p>
          </div>
          {/* Progress dots */}
          <div className="flex gap-1.5 shrink-0">
            {SURVEYS.map(s => (
              <span
                key={s.key}
                title={s.label}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${submissions[s.key]?.submitted ? "bg-green-500" : "bg-slate-200"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Survey cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mr-2" />
          <span className="text-sm text-muted-foreground">Loading survey data…</span>
        </div>
      ) : (
        <div className="space-y-4">
          {SURVEYS.map(survey => (
            <SurveyCard
              key={survey.key}
              survey={survey}
              submission={submissions[survey.key]}
              phenoRows={survey.phenoBucket ? (phenologySummary[survey.phenoBucket] ?? []) : []}
              harvestRows={survey.isHarvest ? harvestSummary : []}
              frostEvents={survey.isFrost ? frostEvents : []}
              farmId={farmId}
              year={year}
              isCurrentYear={isCurrentYear}
              blocks={blocks}
              onRefetch={() => void refetch()}
              onToggle={(key, submitted) => toggleMutation.mutate({ key, submitted })}
              isTogglePending={toggleMutation.isPending && (toggleMutation.variables as { key: SurveyKey })?.key === survey.key}
            />
          ))}
        </div>
      )}

      {/* Year-on-year history */}
      <HistoryTable farmId={farmId} years={allYears} />
    </div>
  );
}
