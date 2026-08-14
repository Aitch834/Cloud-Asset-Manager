import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Snowflake, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, DataTable, useCrud, ViewField, ConfirmDialog, Empty } from "./shared";
import { BBCH_STAGES } from "./shared";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";

type FrostEvent = Record<string, unknown>;

const SEVERITY_OPTIONS = [
  { value: "light",        label: "Light (0 to −1 °C)",          colour: "text-blue-600"  },
  { value: "moderate",     label: "Moderate (−1 to −3 °C)",       colour: "text-amber-600" },
  { value: "severe",       label: "Severe (−3 to −5 °C)",         colour: "text-orange-600"},
  { value: "catastrophic", label: "Catastrophic (below −5 °C)",   colour: "text-red-700"   },
];

function severityBadge(sev: unknown) {
  const opt = SEVERITY_OPTIONS.find(o => o.value === sev);
  if (!opt) return <span className="text-muted-foreground">—</span>;
  return <span className={`font-medium ${opt.colour}`}>{opt.label.split(" (")[0]}</span>;
}

export function FrostEventsSection({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<FrostEvent>(farmId, "vineyard-frost-events", "vineyard-frost-events");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<FrostEvent | null>(null);
  const [form, setForm] = useState<FrostEvent>({});
  const [viewing, setViewing] = useState<FrostEvent | null>(null);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "viticulture-frost", filter: "year", farmId, defaultValue: String(new Date().getFullYear()) });

  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? "All blocks";
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm({ frostDate: today, severity: "moderate" }); setCurrent(null); setOpen(true); };
  const openEdit = (r: FrostEvent) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const frostYears = Array.from(new Set(data.map(r => new Date(r.frostDate as string).getFullYear()))).sort((a, b) => b - a);
  if (!frostYears.includes(new Date().getFullYear())) frostYears.unshift(new Date().getFullYear());

  const filtered = yearFilter === "all" ? data : data.filter(r => new Date(r.frostDate as string).getFullYear() === Number(yearFilter));

  const csvCols = [
    { key: "frostDate",               label: "Date",             fmt: (r: Record<string, unknown>) => fmtDate(r.frostDate) },
    { key: "blockId",                  label: "Block",            fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
    { key: "severity",                 label: "Severity" },
    { key: "minTempC",                 label: "Min Temp (°C)",    fmt: (r: Record<string, unknown>) => fmtNum(r.minTempC, 1) },
    { key: "durationHours",            label: "Duration (hrs)",   fmt: (r: Record<string, unknown>) => fmtNum(r.durationHours, 1) },
    { key: "bbchStageAtFrost",         label: "BBCH Stage" },
    { key: "estimatedDamagePercent",   label: "Estimated Damage (%)" },
    { key: "damagedVinesCount",        label: "Damaged Vine Count" },
    { key: "notes",                    label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="animate-spin w-5 h-5 text-muted-foreground" /></div>;

  return (
    <div className="space-y-3 mt-6 pt-6 border-t">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold flex items-center gap-2"><Snowflake className="w-4 h-4 text-blue-500" />Frost Events</p>
          <p className="text-xs text-muted-foreground">Log frost dates, severity, and observed vine damage. Useful for insurance records and correlating with yield outcomes year on year.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {frostYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filtered, "frost-events.csv", csvCols)} disabled={!filtered.length}>
            <FileDown className="w-4 h-4 mr-1" />Export CSV
          </Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Frost Event</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty msg="No frost events recorded for this period." />
      ) : (
        <DataTable
          cols={[
            { key: "frostDate",             label: "Date",            render: r => fmtDate(r.frostDate) },
            { key: "blockId",               label: "Block",           render: r => <span className="text-sm">{String(blockName(r.blockId))}</span> },
            { key: "severity",              label: "Severity",        render: r => severityBadge(r.severity) },
            { key: "minTempC",              label: "Min Temp",        render: r => r.minTempC ? `${fmtNum(r.minTempC, 1)} °C` : "—" },
            { key: "durationHours",         label: "Duration",        render: r => r.durationHours ? `${fmtNum(r.durationHours, 1)} hrs` : "—" },
            { key: "estimatedDamagePercent",label: "Est. Damage",     render: r => r.estimatedDamagePercent ? `${r.estimatedDamagePercent}%` : "—" },
          ]}
          rows={filtered}
          onView={setViewing}
          onEdit={openEdit}
          onDelete={r => remove.mutateAsync(r.id as number)}
          deleteMutation={remove}
        />
      )}

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Frost Event</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3">
              <ViewField label="Date" value={fmtDate(viewing.frostDate)} />
              <ViewField label="Block" value={String(blockName(viewing.blockId))} />
              <ViewField label="Severity" value={SEVERITY_OPTIONS.find(o => o.value === viewing.severity)?.label ?? fmt(viewing.severity)} />
              <ViewField label="Min Temperature" value={viewing.minTempC ? `${fmtNum(viewing.minTempC, 1)} °C` : "—"} />
              <ViewField label="Duration" value={viewing.durationHours ? `${fmtNum(viewing.durationHours, 1)} hrs` : "—"} />
              <ViewField label="BBCH Stage at Frost" value={fmt(viewing.bbchStageAtFrost)} />
              <ViewField label="Estimated Damage" value={viewing.estimatedDamagePercent ? `${viewing.estimatedDamagePercent}%` : "—"} />
              <ViewField label="Damaged Vines" value={viewing.damagedVinesCount ? String(viewing.damagedVinesCount) : "—"} />
              {!!viewing.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <Button onClick={() => { openEdit(viewing!); setViewing(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); add.reset(); edit.reset(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Frost Event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date *</Label>
                <Input type="date" max={today} value={String(form.frostDate ?? "")} onChange={e => sf("frostDate", e.target.value)} />
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
            </div>
            <div>
              <Label>Severity *</Label>
              <Select value={String(form.severity ?? "moderate")} onValueChange={v => sf("severity", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
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
            <div>
              <Label>BBCH Stage at Time of Frost</Label>
              <Select value={String(form.bbchStageAtFrost ?? "__none__")} onValueChange={v => sf("bbchStageAtFrost", v === "__none__" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Select stage…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Unknown —</SelectItem>
                  {BBCH_STAGES.map(s => <SelectItem key={s.code} value={s.code}>{s.code} — {s.desc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Estimated Damage (%)</Label>
                <Input type="number" min="0" max="100" placeholder="0–100" value={String(form.estimatedDamagePercent ?? "")} onChange={e => sf("estimatedDamagePercent", e.target.value)} />
              </div>
              <div>
                <Label>Damaged Vine Count</Label>
                <Input type="number" min="0" placeholder="No. of vines" value={String(form.damagedVinesCount ?? "")} onChange={e => sf("damagedVinesCount", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} placeholder="Describe conditions, recovery actions taken, etc." />
            </div>
          </div>
          <DialogMutationError mutation={add} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={add.isPending || edit.isPending || !form.frostDate || !form.severity}>
              {(add.isPending || edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
