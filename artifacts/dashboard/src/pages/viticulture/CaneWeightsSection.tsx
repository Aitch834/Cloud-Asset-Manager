import { useState } from "react";
import { Loader2, Plus, FileDown, Info, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, DataTable, useCrud, ViewField, Empty } from "./shared";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { StaffSelect } from "@/components/ui/staff-select";
import { useQuery } from "@tanstack/react-query";

type CaneWeight = Record<string, unknown>;

function ravazBadge(idx: unknown) {
  const n = Number(idx);
  if (!idx || isNaN(n)) return <span className="text-muted-foreground">—</span>;
  let colour = "text-green-700";
  let label = "Balanced";
  if (n < 3)  { colour = "text-red-600";    label = "Very weak";     }
  else if (n < 5)  { colour = "text-amber-600";  label = "Weak";          }
  else if (n > 15) { colour = "text-red-700";    label = "Excessive";     }
  else if (n > 10) { colour = "text-orange-600"; label = "Vigorous";      }
  return <span className={`font-medium ${colour}`}>{n.toFixed(2)} <span className="font-normal text-xs">({label})</span></span>;
}

export function CaneWeightsSection({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<CaneWeight>(farmId, "vineyard-cane-weights", "vineyard-cane-weights");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<CaneWeight | null>(null);
  const [form, setForm] = useState<CaneWeight>({});
  const [viewing, setViewing] = useState<CaneWeight | null>(null);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "viticulture-cane-weights", filter: "year", farmId, defaultValue: String(new Date().getFullYear()) });
  const [blockFilter, setBlockFilter] = usePersistedFilter({ page: "viticulture-cane-weights", filter: "block", farmId, defaultValue: "__all__" });

  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? id;
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm({ measuredDate: today }); setCurrent(null); setOpen(true); };
  const openEdit = (r: CaneWeight) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const years = Array.from(new Set(data.map(r => new Date(r.measuredDate as string).getFullYear()))).sort((a, b) => b - a);
  if (!years.includes(new Date().getFullYear())) years.unshift(new Date().getFullYear());

  const filtered = data
    .filter(r => yearFilter === "all" || new Date(r.measuredDate as string).getFullYear() === Number(yearFilter))
    .filter(r => blockFilter === "__all__" || String(r.blockId) === blockFilter);

  const csvCols = [
    { key: "measuredDate",                label: "Date",                 fmt: (r: Record<string, unknown>) => fmtDate(r.measuredDate) },
    { key: "blockId",                     label: "Block",                fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
    { key: "vinesSampled",                label: "Vines Sampled" },
    { key: "averageCaneWeightG",          label: "Avg Cane Weight (g)",  fmt: (r: Record<string, unknown>) => fmtNum(r.averageCaneWeightG, 1) },
    { key: "totalCaneWeightKgPerVine",    label: "Total Pruning Wt (kg/vine)", fmt: (r: Record<string, unknown>) => fmtNum(r.totalCaneWeightKgPerVine, 3) },
    { key: "shootsPerVine",               label: "Shoots/Vine",          fmt: (r: Record<string, unknown>) => fmtNum(r.shootsPerVine, 1) },
    { key: "budsPerCane",                 label: "Buds/Cane",            fmt: (r: Record<string, unknown>) => fmtNum(r.budsPerCane, 1) },
    { key: "ravazIndex",                  label: "Ravaz Index",          fmt: (r: Record<string, unknown>) => fmtNum(r.ravazIndex, 2) },
    { key: "operatorName",                label: "Operator" },
    { key: "notes",                       label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-4"><Loader2 className="animate-spin w-5 h-5 text-muted-foreground" /></div>;

  return (
    <div className="space-y-3 mt-6 pt-6 border-t">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold flex items-center gap-2"><Scale className="w-4 h-4 text-emerald-600" />Cane Weights &amp; Vine Vigour</p>
          <p className="text-xs text-muted-foreground">
            Record pruning weights at winter pruning to track vine vigour. The Ravaz Index (yield ÷ pruning weight) is the industry standard vigour benchmark — a score of 5–10 indicates a balanced vine.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={blockFilter} onValueChange={setBlockFilter}>
            <SelectTrigger className={`w-36 h-8 text-xs ${blockFilter !== "__all__" ? "border-purple-400 text-purple-700" : ""}`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All blocks</SelectItem>
              {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filtered, "cane-weights.csv", csvCols)} disabled={!filtered.length}>
            <FileDown className="w-4 h-4 mr-1" />Export CSV
          </Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Measurement</Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Empty msg="No cane weight measurements recorded for this period." />
      ) : (
        <DataTable
          cols={[
            { key: "measuredDate",             label: "Date",            render: r => fmtDate(r.measuredDate) },
            { key: "blockId",                  label: "Block",           render: r => <span className="text-sm">{String(blockName(r.blockId))}</span> },
            { key: "vinesSampled",             label: "Vines",           render: r => fmt(r.vinesSampled) },
            { key: "averageCaneWeightG",       label: "Avg Cane (g)",    render: r => fmtNum(r.averageCaneWeightG, 1) },
            { key: "totalCaneWeightKgPerVine", label: "Total (kg/vine)", render: r => fmtNum(r.totalCaneWeightKgPerVine, 3) },
            { key: "ravazIndex",               label: "Ravaz Index",     render: r => ravazBadge(r.ravazIndex) },
            { key: "operatorName",             label: "Operator",        render: r => fmt(r.operatorName) },
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
          <DialogHeader><DialogTitle>Cane Weight Record</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3">
              <ViewField label="Date" value={fmtDate(viewing.measuredDate)} />
              <ViewField label="Block" value={String(blockName(viewing.blockId))} />
              <ViewField label="Vines Sampled" value={fmt(viewing.vinesSampled)} />
              <ViewField label="Avg Cane Weight" value={viewing.averageCaneWeightG ? `${fmtNum(viewing.averageCaneWeightG, 1)} g` : "—"} />
              <ViewField label="Total Pruning Wt / Vine" value={viewing.totalCaneWeightKgPerVine ? `${fmtNum(viewing.totalCaneWeightKgPerVine, 3)} kg` : "—"} />
              <ViewField label="Shoots per Vine" value={fmtNum(viewing.shootsPerVine, 1)} />
              <ViewField label="Buds per Cane" value={fmtNum(viewing.budsPerCane, 1)} />
              <ViewField label="Ravaz Index" value={viewing.ravazIndex ? String(Number(viewing.ravazIndex).toFixed(2)) : "—"} />
              <ViewField label="Operator" value={fmt(viewing.operatorName)} />
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
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Cane Weight Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date *</Label>
                <Input type="date" max={today} value={String(form.measuredDate ?? "")} onChange={e => sf("measuredDate", e.target.value)} />
              </div>
              <div>
                <Label>Block</Label>
                <Select value={String(form.blockId ?? "__none__")} onValueChange={v => sf("blockId", v === "__none__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— No block —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Vines Sampled</Label>
              <Input type="number" min="1" placeholder="Number of vines measured" value={String(form.vinesSampled ?? "")} onChange={e => sf("vinesSampled", e.target.value)} />
            </div>

            <div className="rounded-md bg-muted/40 border px-3 py-2.5 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pruning Weights</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Average Cane Weight (g)</Label>
                  <Input type="number" step="0.1" min="0" placeholder="Per individual cane" value={String(form.averageCaneWeightG ?? "")} onChange={e => sf("averageCaneWeightG", e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-0.5">Mean weight of one pruned cane</p>
                </div>
                <div>
                  <Label>Total Pruning Wt per Vine (kg)</Label>
                  <Input type="number" step="0.001" min="0" placeholder="All canes from one vine" value={String(form.totalCaneWeightKgPerVine ?? "")} onChange={e => sf("totalCaneWeightKgPerVine", e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-0.5">Used to calculate Ravaz Index</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Shoots per Vine</Label>
                <Input type="number" step="0.5" min="0" placeholder="e.g. 12" value={String(form.shootsPerVine ?? "")} onChange={e => sf("shootsPerVine", e.target.value)} />
              </div>
              <div>
                <Label>Buds per Cane</Label>
                <Input type="number" step="0.5" min="0" placeholder="e.g. 8" value={String(form.budsPerCane ?? "")} onChange={e => sf("budsPerCane", e.target.value)} />
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-1.5">
                Ravaz Index
                <span title="Yield (kg/vine) ÷ total pruning weight (kg/vine). Score of 5–10 is balanced. Enter manually from last year's yield records or calculate yourself.">
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </span>
              </Label>
              <Input type="number" step="0.01" min="0" placeholder="Yield ÷ pruning weight" value={String(form.ravazIndex ?? "")} onChange={e => sf("ravazIndex", e.target.value)} />
            </div>

            <div>
              <Label>Operator</Label>
              <StaffSelect value={String(form.operatorName ?? "")} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} />
            </div>
          </div>
          <DialogMutationError mutation={add} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={add.isPending || edit.isPending || !form.measuredDate}>
              {(add.isPending || edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
