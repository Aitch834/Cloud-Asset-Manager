import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Trash2, Loader2, Eye, Grape, Leaf, ClipboardList, Sprout,
  BarChart3, Bug, Scissors, ShieldAlert, CheckCircle2, XCircle, AlertTriangle,
  FileDown, Pencil,
} from "lucide-react";
import { sanitiseCsvCell } from "@/lib/csv";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { useUserRole } from "@/hooks/use-user-role";
import { Checkbox } from "@/components/ui/checkbox";

const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
const fmtNum = (v: unknown, dp = 1) => (v == null || v === "" ? "—" : parseFloat(String(v)).toFixed(dp));
const today = new Date().toISOString().split("T")[0];

function exportCSV(rows: Record<string, unknown>[], filename: string, cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]) {
  if (!rows.length) return;
  const header = cols.map(c => `"${c.label.replace(/"/g, '""')}"`).join(",");
  const body = rows.map(r =>
    cols.map(c => {
      const raw = c.fmt ? c.fmt(r) : String(r[c.key] ?? "");
      const safe = sanitiseCsvCell(raw);
      return `"${safe.replace(/"/g, '""')}"`;
    }).join(",")
  ).join("\n");
  const blob = new Blob(["\uFEFF" + header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

const PRESSURE_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "None", color: "text-gray-400" },
  1: { label: "Low", color: "text-green-600" },
  2: { label: "Medium", color: "text-amber-600" },
  3: { label: "High", color: "text-red-600" },
};

const BBCH_STAGES = [
  { code: "00", desc: "Dormancy — buds dormant" },
  { code: "05", desc: "Wool stage — bud scales swelling" },
  { code: "07", desc: "Burst bud — green tips visible" },
  { code: "09", desc: "Two or three leaves unfolded" },
  { code: "11", desc: "First leaf unfolded" },
  { code: "13", desc: "Three leaves unfolded" },
  { code: "15", desc: "Five leaves unfolded" },
  { code: "53", desc: "Inflorescence visible — closed" },
  { code: "55", desc: "Inflorescence clearly visible" },
  { code: "57", desc: "Single flowers separating" },
  { code: "60", desc: "Start of flowering — first caps fallen" },
  { code: "65", desc: "Full flowering — 50% of caps fallen" },
  { code: "68", desc: "End of flowering — nearly all caps fallen" },
  { code: "71", desc: "Fruit set — berries pea-sized" },
  { code: "73", desc: "Berries beginning to touch" },
  { code: "75", desc: "Berries touching" },
  { code: "77", desc: "Berries beginning to soften" },
  { code: "81", desc: "Beginning of ripening — berries begin to colour" },
  { code: "83", desc: "Berries developing variety colour" },
  { code: "85", desc: "Berries softening" },
  { code: "89", desc: "Berries ripe for harvest" },
  { code: "93", desc: "Beginning of leaf colouration / fall" },
  { code: "97", desc: "End of leaf fall" },
];

const UK_GRAPE_VARIETIES = [
  "Bacchus", "Chardonnay", "Dornfelder", "Huxelrebe",
  "Madeleine Angevine", "Müller-Thurgau", "Ortega", "Phoenix",
  "Pinot Blanc", "Pinot Gris", "Pinot Meunier", "Pinot Noir",
  "Regent", "Reichensteiner", "Rondo", "Seyval Blanc",
  "Siegerrebe", "Solaris", "Auxerrois", "Cabernet Cortis",
  "Cabernet Blanc", "Johanniter", "Lakhta", "Sauvignon Blanc",
  "Other",
];

const UK_ROOTSTOCKS = [
  "5C Teleki", "SO4", "3309 Couderc", "101-14 Millardet",
  "5BB Kober", "125AA", "41B", "420A", "Gravesac",
  "Riparia Gloire de Montpellier", "161-49 Couderc",
  "Fercal", "Schwarzmann", "Own Rooted", "Other",
];

const OPERATION_TYPES = [
  "Winter Pruning", "Spur Thinning", "Bud Rubbing", "Shoot Thinning",
  "Tie Down / Cane Laying", "Wire Lifting", "Leaf Removal", "Topping / Hedging",
  "Green Harvest (Crop Thinning)", "Soil Cultivation", "Mulching", "Other",
];

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: "red" | "amber" | "green" | "purple" }) {
  const cls = color === "red" ? "text-red-600" : color === "amber" ? "text-amber-600" : color === "green" ? "text-green-700" : color === "purple" ? "text-purple-700" : "text-foreground";
  return (
    <div className="bg-white rounded-lg border p-3 space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold ${cls}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>;
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DataTable({ cols, rows, onEdit, onDelete, onView }: {
  cols: { key: string; label: string; render?: (r: Record<string, unknown>) => ReactNode }[];
  rows: Record<string, unknown>[];
  onEdit?: (r: Record<string, unknown>) => void;
  onDelete?: (r: Record<string, unknown>) => void;
  onView?: (r: Record<string, unknown>) => void;
}) {
  const [pending, setPending] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet. Add one using the button above." />;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete || onView) && <th />}</tr></thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.render ? c.render(row) : fmt(row[c.key])}</td>)}
              {(onEdit || onDelete || onView) && (
                <td className="py-2 text-right space-x-1 whitespace-nowrap">
                  {onView && <Button size="icon" variant="ghost" onClick={() => onView(row)}><Eye className="w-3.5 h-3.5" /></Button>}
                  {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
                  {onDelete && <Button size="icon" variant="ghost" onClick={() => setPending(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
                </td>
              )}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <ConfirmDialog open={!!pending} title="Delete Record" message="Are you sure you want to delete this record? This cannot be undone." onConfirm={() => { if (pending && onDelete) onDelete(pending); setPending(null); }} onCancel={() => setPending(null)} />
    </>
  );
}

function useCrud<T extends Record<string, unknown>>(farmId: number, endpoint: string, key: string) {
  const qc = useQueryClient();
  const q = useQuery<T[]>({
    queryKey: [key, farmId],
    queryFn: async () => {
      const r = await fetch(api(`farms/${farmId}/${endpoint}`), { credentials: "include" });
      const d = await r.json();
      return d.records ?? [];
    },
    enabled: !!farmId,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: [key, farmId] });
  const add = useMutation({
    mutationFn: async (body: Partial<T>) => {
      const r = await fetch(api(`farms/${farmId}/${endpoint}`), { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      return r.json();
    },
    onSuccess: invalidate,
  });
  const edit = useMutation({
    mutationFn: async ({ id, ...body }: Partial<T> & { id: number }) => {
      const r = await fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      return r.json();
    },
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: number) => { await fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "DELETE", credentials: "include" }); },
    onSuccess: invalidate,
  });
  return { data: q.data ?? [], isLoading: q.isLoading, add, edit, remove };
}

function ViewField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="font-medium text-sm">{value ?? "—"}</p>
    </div>
  );
}

function RaiseTaskBtn({ onClick }: { onClick: () => void }) {
  return (
    <Button size="sm" variant="outline" className="text-purple-700 border-purple-200 hover:bg-purple-50" onClick={onClick}>
      <ClipboardList className="w-3.5 h-3.5 mr-1" />Raise Task
    </Button>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────
function OverviewTab({ farmId }: { farmId: number }) {
  const blocks = useCrud(farmId, "vineyard-blocks", "vineyard-blocks");
  const register = useCrud(farmId, "vine-register", "vine-register");
  const harvest = useCrud(farmId, "vineyard-harvest", "vineyard-harvest");
  const scouting = useCrud(farmId, "vineyard-scouting", "vineyard-scouting");

  const activeBlocks = blocks.data.filter(b => b.isActive !== false);
  const totalHa = activeBlocks.reduce((s, b) => s + parseFloat(String(b.areaHa || 0)), 0);
  const totalVines = activeBlocks.reduce((s, b) => s + Number(b.numberOfVines || 0), 0);
  const registeredHa = register.data.filter(r => !r.isRemovedFromRegister).reduce((s, r) => s + parseFloat(String(r.registeredAreaHa || 0)), 0);
  const latestHarvest = harvest.data[0];
  const latestScout = scouting.data[0];
  const xylellaAlert = scouting.data.some(s => s.xylellaFastidiosa);
  const highPressure = scouting.data.slice(0, 3).some(s =>
    Number(s.downyMildewPressure) >= 3 || Number(s.powderyMildewPressure) >= 3 || Number(s.botrytisPressure) >= 3
  );

  return (
    <div className="space-y-6">
      {xylellaAlert && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Xylella fastidiosa Suspected</p>
            <p className="text-sm text-red-700 mt-0.5">A recent scouting record has flagged a possible Xylella sighting. This is a notifiable plant disease — contact APHA immediately and do not move plant material off-site.</p>
          </div>
        </div>
      )}
      {highPressure && !xylellaAlert && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-800">High Disease Pressure Recorded</p>
            <p className="text-sm text-amber-700 mt-0.5">A recent scouting record shows high pressure from one or more diseases. Review the Disease Scouting tab and consider spray intervention.</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Active Blocks" value={activeBlocks.length} sub="in production" />
        <StatCard label="Total Vineyard Area" value={`${totalHa.toFixed(2)} ha`} sub="across all blocks" color="green" />
        <StatCard label="Total Vines" value={totalVines.toLocaleString()} sub="registered plants" />
        <StatCard label="HMRC Registered" value={`${registeredHa.toFixed(2)} ha`} sub="on vine register" color="purple" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <p className="font-semibold text-sm">Block Summary</p>
          {activeBlocks.length === 0 ? <Empty msg="No blocks registered yet." /> : (
            <table className="w-full text-sm">
              <thead><tr className="border-b"><th className="text-left py-1 pr-3 font-medium text-muted-foreground">Block</th><th className="text-left py-1 pr-3 font-medium text-muted-foreground">Variety</th><th className="text-left py-1 font-medium text-muted-foreground">Area (ha)</th></tr></thead>
              <tbody>{activeBlocks.slice(0, 8).map((b, i) => (
                <tr key={i} className="border-b last:border-0"><td className="py-1.5 pr-3">{fmt(b.blockName)}</td><td className="py-1.5 pr-3">{fmt(b.variety)}</td><td className="py-1.5">{fmtNum(b.areaHa, 4)}</td></tr>
              ))}</tbody>
            </table>
          )}
        </div>
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <p className="font-semibold text-sm">Latest Vintage</p>
          {!latestHarvest ? <Empty msg="No harvest records yet." /> : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Vintage Year</span><span className="font-medium">{fmt(latestHarvest.vintageYear)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Harvest Date</span><span>{fmtDate(latestHarvest.harvestDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Yield (kg)</span><span>{fmtNum(latestHarvest.yieldKg, 1)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Brix</span><span>{fmtNum(latestHarvest.brix, 1)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Grape Condition</span><span>{fmt(latestHarvest.grapeCondition)}</span></div>
            </div>
          )}
          <p className="font-semibold text-sm pt-2">Latest Scouting</p>
          {!latestScout ? <Empty msg="No scouting records yet." /> : (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{fmtDate(latestScout.scoutDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Downy Mildew</span><span className={PRESSURE_LABELS[Number(latestScout.downyMildewPressure) || 0]?.color}>{PRESSURE_LABELS[Number(latestScout.downyMildewPressure) || 0]?.label}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Powdery Mildew</span><span className={PRESSURE_LABELS[Number(latestScout.powderyMildewPressure) || 0]?.color}>{PRESSURE_LABELS[Number(latestScout.powderyMildewPressure) || 0]?.label}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Botrytis</span><span className={PRESSURE_LABELS[Number(latestScout.botrytisPressure) || 0]?.color}>{PRESSURE_LABELS[Number(latestScout.botrytisPressure) || 0]?.label}</span></div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <p className="font-semibold text-sm mb-2">UK Vineyard Compliance Checklist</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {[
            { label: "HMRC Vine Register up to date", ok: register.data.length > 0 },
            { label: "All active blocks on vine register", ok: register.data.filter(r => !r.isRemovedFromRegister).length >= activeBlocks.length },
            { label: "Disease scouting undertaken this season", ok: scouting.data.length > 0 },
            { label: "Vintage harvest records complete", ok: harvest.data.length > 0 },
            { label: "Pruning / canopy records logged", ok: false },
            { label: "No Xylella suspicion outstanding", ok: !xylellaAlert },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              {item.ok ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
              <span className={item.ok ? "" : "text-muted-foreground"}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Vine Register ─────────────────────────────────────────────────────────────
type VineReg = Record<string, unknown>;

function VineRegisterTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<VineReg>(farmId, "vine-register", "vine-register");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<VineReg | null>(null);
  const [form, setForm] = useState<VineReg>({});
  const [viewing, setViewing] = useState<VineReg | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<VineReg | null>(null);

  const openAdd = () => { setForm({}); setCurrent(null); setOpen(true); };
  const openEdit = (r: VineReg) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const csvCols = [
    { key: "hmrcVineRegisterRef", label: "HMRC Ref" },
    { key: "registeredVariety", label: "Variety" },
    { key: "registeredAreaHa", label: "Area (ha)" },
    { key: "giClassification", label: "GI Classification" },
    { key: "wineColour", label: "Wine Colour" },
    { key: "dateRegistered", label: "Date Registered", fmt: (r: Record<string, unknown>) => fmtDate(r.dateRegistered) },
    { key: "dateAmended", label: "Date Amended", fmt: (r: Record<string, unknown>) => fmtDate(r.dateAmended) },
    { key: "isRemovedFromRegister", label: "Status", fmt: (r: Record<string, unknown>) => r.isRemovedFromRegister ? "Removed" : "Active" },
    { key: "removalDate", label: "Removal Date", fmt: (r: Record<string, unknown>) => fmtDate(r.removalDate) },
    { key: "removalReason", label: "Removal Reason" },
    { key: "notes", label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">HMRC Vine Register</p>
          <p className="text-xs text-muted-foreground">Mandatory for all UK vineyards over 0.01 ha. Keep this up to date and report any changes to HMRC.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(data, "vine-register.csv", csvCols)} disabled={!data.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Entry</Button>
        </div>
      </div>
      <DataTable
        cols={[
          { key: "hmrcVineRegisterRef", label: "HMRC Ref" },
          { key: "registeredVariety", label: "Variety" },
          { key: "registeredAreaHa", label: "Area (ha)", render: r => fmtNum(r.registeredAreaHa, 4) },
          { key: "giClassification", label: "GI / PDO" },
          { key: "wineColour", label: "Colour" },
          { key: "dateRegistered", label: "Date Registered", render: r => fmtDate(r.dateRegistered) },
          { key: "isRemovedFromRegister", label: "Status", render: r => <Badge variant={r.isRemovedFromRegister ? "destructive" : "default"}>{r.isRemovedFromRegister ? "Removed" : "Active"}</Badge> },
        ]}
        rows={data}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Vine Register Entry</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3">
              <ViewField label="HMRC Ref" value={fmt(viewing.hmrcVineRegisterRef)} />
              <ViewField label="Registered Variety" value={fmt(viewing.registeredVariety)} />
              <ViewField label="Registered Area (ha)" value={fmtNum(viewing.registeredAreaHa, 4)} />
              <ViewField label="GI Classification" value={fmt(viewing.giClassification)} />
              <ViewField label="Wine Colour" value={fmt(viewing.wineColour)} />
              <ViewField label="Linked Block" value={fmt(blocks.find(b => b.id === viewing.blockId)?.blockName)} />
              <ViewField label="Date Registered" value={fmtDate(viewing.dateRegistered)} />
              <ViewField label="Date Amended" value={fmtDate(viewing.dateAmended)} />
              <ViewField label="Status" value={!!viewing.isRemovedFromRegister ? <Badge variant="destructive">Removed</Badge> : <Badge>Active</Badge>} />
              {!!viewing.isRemovedFromRegister && <>
                <ViewField label="Removal Date" value={fmtDate(viewing.removalDate)} />
                <div className="col-span-2"><ViewField label="Removal Reason" value={fmt(viewing.removalReason)} /></div>
              </>}
              {!!viewing.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <RaiseTaskBtn onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }} />
            <Button onClick={() => { openEdit(viewing!); setViewing(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Vine Register — ${fmt(raiseTaskFor.registeredVariety)} (${fmt(raiseTaskFor.hmrcVineRegisterRef)})`}
          defaultDescription={`Area: ${fmtNum(raiseTaskFor.registeredAreaHa, 4)} ha · GI: ${fmt(raiseTaskFor.giClassification)} · Status: ${raiseTaskFor.isRemovedFromRegister ? "Removed" : "Active"}`}
          module="Viticulture"
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) setOpen(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Vine Register Entry</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>HMRC Vine Register Ref</Label><Input value={String(form.hmrcVineRegisterRef ?? "")} onChange={e => sf("hmrcVineRegisterRef", e.target.value)} placeholder="e.g. VR-12345" /></div>
              <div>
                <Label>Registered Variety *</Label>
                <Select value={String(form.registeredVariety ?? "")} onValueChange={v => sf("registeredVariety", v)}>
                  <SelectTrigger><SelectValue placeholder="Select variety…" /></SelectTrigger>
                  <SelectContent>{UK_GRAPE_VARIETIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Registered Area (ha) *</Label><Input type="number" step="0.0001" value={String(form.registeredAreaHa ?? "")} onChange={e => sf("registeredAreaHa", e.target.value)} /></div>
              <div>
                <Label>GI Classification</Label>
                <Select value={String(form.giClassification ?? "")} onValueChange={v => sf("giClassification", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["English Wine PDO", "English Wine PGI", "Welsh Wine PDO", "Welsh Wine PGI", "UK Table Wine", "No GI"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Wine Colour</Label>
                <Select value={String(form.wineColour ?? "")} onValueChange={v => sf("wineColour", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["White", "Red", "Rosé", "Sparkling White", "Sparkling Rosé", "Sparkling Red"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Link to Block</Label>
                <Select value={String(form.blockId ?? "")} onValueChange={v => sf("blockId", Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— None —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)} ({String(b.variety)})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date Registered</Label><Input type="date" max={today} value={String(form.dateRegistered ?? "")} onChange={e => sf("dateRegistered", e.target.value)} /></div>
              <div><Label>Date Amended</Label><Input type="date" max={today} value={String(form.dateAmended ?? "")} onChange={e => sf("dateAmended", e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={!!form.isRemovedFromRegister} onCheckedChange={v => sf("isRemovedFromRegister", !!v)} id="rmv" />
              <Label htmlFor="rmv">Removed from register</Label>
            </div>
            {!!form.isRemovedFromRegister && (
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Removal Date</Label><Input type="date" max={today} value={String(form.removalDate ?? "")} onChange={e => sf("removalDate", e.target.value)} /></div>
                <div><Label>Removal Reason</Label><Input value={String(form.removalReason ?? "")} onChange={e => sf("removalReason", e.target.value)} /></div>
              </div>
            )}
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={add.isPending || edit.isPending}>{(add.isPending || edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Blocks ────────────────────────────────────────────────────────────────────
type Block = Record<string, unknown>;

function BlocksTab({ farmId }: { farmId: number }) {
  const { data, isLoading, add, edit, remove } = useCrud<Block>(farmId, "vineyard-blocks", "vineyard-blocks");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Block | null>(null);
  const [form, setForm] = useState<Block>({});
  const [viewing, setViewing] = useState<Block | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Block | null>(null);

  const openAdd = () => { setForm({ isActive: true }); setCurrent(null); setOpen(true); };
  const openEdit = (r: Block) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const csvCols = [
    { key: "blockName", label: "Block Name" },
    { key: "blockRef", label: "Block Ref" },
    { key: "variety", label: "Variety" },
    { key: "clone", label: "Clone" },
    { key: "rootstock", label: "Rootstock" },
    { key: "plantingYear", label: "Planting Year" },
    { key: "areaHa", label: "Area (ha)" },
    { key: "numberOfVines", label: "Number of Vines" },
    { key: "rowSpacingM", label: "Row Spacing (m)" },
    { key: "vineSpacingM", label: "Vine Spacing (m)" },
    { key: "trainingSystem", label: "Training System" },
    { key: "aspect", label: "Aspect" },
    { key: "soilType", label: "Soil Type" },
    { key: "isOrganicBlock", label: "Organic", fmt: (r: Record<string, unknown>) => r.isOrganicBlock ? "Yes" : "No" },
    { key: "isActive", label: "Status", fmt: (r: Record<string, unknown>) => r.isActive !== false ? "Active" : "Inactive" },
    { key: "fieldParcelRef", label: "BPS/SFI Parcel Ref" },
    { key: "notes", label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Vineyard Blocks</p>
          <p className="text-xs text-muted-foreground">Each block represents a distinct planting unit — typically a single variety, rootstock, and training system combination.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(data, "vineyard-blocks.csv", csvCols)} disabled={!data.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Block</Button>
        </div>
      </div>
      <DataTable
        cols={[
          { key: "blockName", label: "Block Name" },
          { key: "blockRef", label: "Ref" },
          { key: "variety", label: "Variety" },
          { key: "rootstock", label: "Rootstock" },
          { key: "plantingYear", label: "Planted" },
          { key: "areaHa", label: "Area (ha)", render: r => fmtNum(r.areaHa, 4) },
          { key: "numberOfVines", label: "Vines" },
          { key: "trainingSystem", label: "Training" },
          { key: "isOrganicBlock", label: "Organic", render: r => r.isOrganicBlock ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Organic</Badge> : <span className="text-muted-foreground">—</span> },
          { key: "isActive", label: "Status", render: r => <Badge variant={r.isActive === false ? "secondary" : "default"}>{r.isActive === false ? "Inactive" : "Active"}</Badge> },
        ]}
        rows={data}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Vineyard Block — {fmt(viewing?.blockName)}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-3 gap-3">
              <ViewField label="Block Name" value={fmt(viewing.blockName)} />
              <ViewField label="Block Ref" value={fmt(viewing.blockRef)} />
              <ViewField label="BPS/SFI Parcel" value={fmt(viewing.fieldParcelRef)} />
              <ViewField label="Variety" value={fmt(viewing.variety)} />
              <ViewField label="Clone" value={fmt(viewing.clone)} />
              <ViewField label="Rootstock" value={fmt(viewing.rootstock)} />
              <ViewField label="Planting Year" value={fmt(viewing.plantingYear)} />
              <ViewField label="Area (ha)" value={fmtNum(viewing.areaHa, 4)} />
              <ViewField label="Number of Vines" value={fmt(viewing.numberOfVines)} />
              <ViewField label="Row Spacing (m)" value={fmtNum(viewing.rowSpacingM, 2)} />
              <ViewField label="Vine Spacing (m)" value={fmtNum(viewing.vineSpacingM, 2)} />
              <ViewField label="Training System" value={fmt(viewing.trainingSystem)} />
              <ViewField label="Trellis Type" value={fmt(viewing.trellisType)} />
              <ViewField label="Aspect" value={fmt(viewing.aspect)} />
              <ViewField label="Soil Type" value={fmt(viewing.soilType)} />
              <ViewField label="Organic" value={!!viewing.isOrganicBlock ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Organic</Badge> : "No"} />
              <ViewField label="Status" value={<Badge variant={viewing.isActive === false ? "secondary" : "default"}>{viewing.isActive === false ? "Inactive" : "Active"}</Badge>} />
              {!!viewing.notes && <div className="col-span-3"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <RaiseTaskBtn onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }} />
            <Button onClick={() => { openEdit(viewing!); setViewing(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Vineyard Block — ${fmt(raiseTaskFor.blockName)}`}
          defaultDescription={`Variety: ${fmt(raiseTaskFor.variety)} · Rootstock: ${fmt(raiseTaskFor.rootstock)} · Area: ${fmtNum(raiseTaskFor.areaHa, 4)} ha · Vines: ${fmt(raiseTaskFor.numberOfVines)}`}
          module="Viticulture"
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) setOpen(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Vineyard Block</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Block Name *</Label><Input value={String(form.blockName ?? "")} onChange={e => sf("blockName", e.target.value)} placeholder="e.g. South Slope" /></div>
              <div><Label>Block Reference</Label><Input value={String(form.blockRef ?? "")} onChange={e => sf("blockRef", e.target.value)} placeholder="e.g. BLK-01" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Variety *</Label>
                <Select value={String(form.variety ?? "")} onValueChange={v => sf("variety", v)}>
                  <SelectTrigger><SelectValue placeholder="Select variety…" /></SelectTrigger>
                  <SelectContent>{UK_GRAPE_VARIETIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Clone</Label><Input value={String(form.clone ?? "")} onChange={e => sf("clone", e.target.value)} placeholder="e.g. Chardonnay 96" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Rootstock</Label>
                <Select value={String(form.rootstock ?? "")} onValueChange={v => sf("rootstock", v)}>
                  <SelectTrigger><SelectValue placeholder="Select rootstock…" /></SelectTrigger>
                  <SelectContent>{UK_ROOTSTOCKS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Planting Year</Label><Input type="number" min="1900" max={new Date().getFullYear()} value={String(form.plantingYear ?? "")} onChange={e => sf("plantingYear", e.target.value)} placeholder="e.g. 2018" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Area (ha)</Label><Input type="number" step="0.0001" value={String(form.areaHa ?? "")} onChange={e => sf("areaHa", e.target.value)} /></div>
              <div><Label>Number of Vines</Label><Input type="number" value={String(form.numberOfVines ?? "")} onChange={e => sf("numberOfVines", e.target.value)} /></div>
              <div><Label>BPS/SFI Parcel Ref</Label><Input value={String(form.fieldParcelRef ?? "")} onChange={e => sf("fieldParcelRef", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Row Spacing (m)</Label><Input type="number" step="0.01" value={String(form.rowSpacingM ?? "")} onChange={e => sf("rowSpacingM", e.target.value)} /></div>
              <div><Label>Vine Spacing (m)</Label><Input type="number" step="0.01" value={String(form.vineSpacingM ?? "")} onChange={e => sf("vineSpacingM", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Training System</Label>
                <Select value={String(form.trainingSystem ?? "")} onValueChange={v => sf("trainingSystem", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["Double Guyot", "Single Guyot", "Cordon", "Scott Henry", "Lenz Moser", "VSP", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Trellis Type</Label><Input value={String(form.trellisType ?? "")} onChange={e => sf("trellisType", e.target.value)} placeholder="e.g. High wire, 2-wire" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Aspect</Label>
                <Select value={String(form.aspect ?? "")} onValueChange={v => sf("aspect", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["N", "NE", "E", "SE", "S", "SW", "W", "NW", "Flat"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Soil Type</Label><Input value={String(form.soilType ?? "")} onChange={e => sf("soilType", e.target.value)} placeholder="e.g. Greensand over clay" /></div>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Checkbox checked={!!form.isOrganicBlock} onCheckedChange={v => sf("isOrganicBlock", !!v)} id="org" />
                <Label htmlFor="org">Organic block</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.isActive !== false} onCheckedChange={v => sf("isActive", !!v)} id="act" />
                <Label htmlFor="act">Active / In production</Label>
              </div>
            </div>
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={add.isPending || edit.isPending}>{(add.isPending || edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Phenology ─────────────────────────────────────────────────────────────────
type Phenology = Record<string, unknown>;

function PhenologyTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<Phenology>(farmId, "vineyard-phenology", "vineyard-phenology");
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Phenology | null>(null);
  const [form, setForm] = useState<Phenology>({});
  const [viewing, setViewing] = useState<Phenology | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Phenology | null>(null);

  const openAdd = () => { setForm({ observationDate: today, observer: displayName ?? "" }); setCurrent(null); setOpen(true); };
  const openEdit = (r: Phenology) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? id;
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const csvCols = [
    { key: "observationDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.observationDate) },
    { key: "blockId", label: "Block", fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
    { key: "bbchStage", label: "BBCH Stage" },
    { key: "bbchDescription", label: "Description" },
    { key: "percentageReached", label: "% Reached" },
    { key: "observer", label: "Observer" },
    { key: "temperatureC", label: "Temp (°C)" },
    { key: "notes", label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Phenology (BBCH Growth Stages)</p>
          <p className="text-xs text-muted-foreground">Log key growth stages using the BBCH scale. Used to time spray applications, canopy operations, and vintner decisions.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(data, "phenology.csv", csvCols)} disabled={!data.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Observation</Button>
        </div>
      </div>
      <DataTable
        cols={[
          { key: "observationDate", label: "Date", render: r => fmtDate(r.observationDate) },
          { key: "blockId", label: "Block", render: r => fmt(blockName(r.blockId)) },
          { key: "bbchStage", label: "BBCH Stage" },
          { key: "bbchDescription", label: "Description" },
          { key: "percentageReached", label: "% Reached", render: r => r.percentageReached ? `${r.percentageReached}%` : "—" },
          { key: "observer", label: "Observer" },
          { key: "temperatureC", label: "Temp (°C)", render: r => fmtNum(r.temperatureC, 1) },
        ]}
        rows={data}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Phenology Observation</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3">
              <ViewField label="Observation Date" value={fmtDate(viewing.observationDate)} />
              <ViewField label="Block" value={fmt(blockName(viewing.blockId))} />
              <ViewField label="BBCH Stage" value={fmt(viewing.bbchStage)} />
              <ViewField label="% Reached" value={viewing.percentageReached ? `${viewing.percentageReached}%` : "—"} />
              <div className="col-span-2"><ViewField label="Description" value={fmt(viewing.bbchDescription)} /></div>
              <ViewField label="Observer" value={fmt(viewing.observer)} />
              <ViewField label="Temperature (°C)" value={fmtNum(viewing.temperatureC, 1)} />
              {!!viewing.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <RaiseTaskBtn onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }} />
            <Button onClick={() => { openEdit(viewing!); setViewing(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Phenology — BBCH ${fmt(raiseTaskFor.bbchStage)} · ${fmt(blockName(raiseTaskFor.blockId))}`}
          defaultDescription={`Date: ${fmtDate(raiseTaskFor.observationDate)} · ${fmt(raiseTaskFor.bbchDescription)} · ${raiseTaskFor.percentageReached ? `${raiseTaskFor.percentageReached}% reached` : ""}`}
          module="Viticulture"
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) setOpen(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Phenology Observation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" max={today} value={String(form.observationDate ?? "")} onChange={e => sf("observationDate", e.target.value)} /></div>
              <div><Label>Block</Label>
                <Select value={String(form.blockId ?? "")} onValueChange={v => sf("blockId", Number(v))}>
                  <SelectTrigger><SelectValue placeholder="All blocks…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— All blocks —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>BBCH Stage *</Label>
              <Select value={String(form.bbchStage ?? "")} onValueChange={v => { const s = BBCH_STAGES.find(x => x.code === v); sf("bbchStage", v); if (s) sf("bbchDescription", s.desc); }}>
                <SelectTrigger><SelectValue placeholder="Select BBCH stage…" /></SelectTrigger>
                <SelectContent>
                  {BBCH_STAGES.map(s => <SelectItem key={s.code} value={s.code}>{s.code} — {s.desc}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Description</Label><Input value={String(form.bbchDescription ?? "")} onChange={e => sf("bbchDescription", e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>% Reached</Label><Input type="number" min="0" max="100" value={String(form.percentageReached ?? "")} onChange={e => sf("percentageReached", e.target.value)} /></div>
              <div><Label>Observer</Label><Input value={String(form.observer ?? "")} onChange={e => sf("observer", e.target.value)} /></div>
              <div><Label>Temp (°C)</Label><Input type="number" step="0.1" value={String(form.temperatureC ?? "")} onChange={e => sf("temperatureC", e.target.value)} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={add.isPending || edit.isPending}>{(add.isPending || edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Operations ────────────────────────────────────────────────────────────────
type Operation = Record<string, unknown>;

function OperationsTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<Operation>(farmId, "vineyard-operations", "vineyard-operations");
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Operation | null>(null);
  const [form, setForm] = useState<Operation>({});
  const [viewing, setViewing] = useState<Operation | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Operation | null>(null);

  const openAdd = () => { setForm({ operationDate: today, operatorName: displayName ?? "" }); setCurrent(null); setOpen(true); };
  const openEdit = (r: Operation) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? id;
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const isPruning = String(form.operationType ?? "").toLowerCase().includes("prun");

  const csvCols = [
    { key: "operationDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.operationDate) },
    { key: "blockId", label: "Block", fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
    { key: "operationType", label: "Operation Type" },
    { key: "pruningSystem", label: "Pruning System" },
    { key: "budsPerVineTarget", label: "Target Buds/Vine" },
    { key: "budsPerVineActual", label: "Actual Buds/Vine" },
    { key: "pruningWeightKgPerVine", label: "Pruning Wt (kg/vine)" },
    { key: "shootsRemovedPct", label: "Shoots Removed (%)" },
    { key: "leavesRemovedZone", label: "Leaves Removed Zone" },
    { key: "operatorName", label: "Operator" },
    { key: "contractorName", label: "Contractor" },
    { key: "machineUsed", label: "Machine" },
    { key: "hoursWorked", label: "Hours" },
    { key: "notes", label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Pruning & Canopy Operations</p>
          <p className="text-xs text-muted-foreground">Record all canopy management activities. Pruning records including bud counts are required for GI / PDO compliance and assurance schemes.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(data, "vineyard-operations.csv", csvCols)} disabled={!data.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Operation</Button>
        </div>
      </div>
      <DataTable
        cols={[
          { key: "operationDate", label: "Date", render: r => fmtDate(r.operationDate) },
          { key: "blockId", label: "Block", render: r => fmt(blockName(r.blockId)) },
          { key: "operationType", label: "Operation" },
          { key: "pruningSystem", label: "System" },
          { key: "budsPerVineActual", label: "Buds/Vine" },
          { key: "pruningWeightKgPerVine", label: "Wt (kg/vine)", render: r => fmtNum(r.pruningWeightKgPerVine, 3) },
          { key: "operatorName", label: "Operator" },
          { key: "hoursWorked", label: "Hours", render: r => fmtNum(r.hoursWorked, 1) },
        ]}
        rows={data}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Vineyard Operation</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3">
              <ViewField label="Date" value={fmtDate(viewing.operationDate)} />
              <ViewField label="Block" value={fmt(blockName(viewing.blockId))} />
              <ViewField label="Operation Type" value={fmt(viewing.operationType)} />
              <ViewField label="Pruning System" value={fmt(viewing.pruningSystem)} />
              <ViewField label="Target Buds/Vine" value={fmt(viewing.budsPerVineTarget)} />
              <ViewField label="Actual Buds/Vine" value={fmt(viewing.budsPerVineActual)} />
              <ViewField label="Pruning Wt (kg/vine)" value={fmtNum(viewing.pruningWeightKgPerVine, 3)} />
              <ViewField label="Shoots Removed (%)" value={viewing.shootsRemovedPct ? `${viewing.shootsRemovedPct}%` : "—"} />
              <ViewField label="Leaves Removed Zone" value={fmt(viewing.leavesRemovedZone)} />
              <ViewField label="Machine Used" value={fmt(viewing.machineUsed)} />
              <ViewField label="Operator" value={fmt(viewing.operatorName)} />
              <ViewField label="Contractor" value={fmt(viewing.contractorName)} />
              <ViewField label="Hours Worked" value={fmtNum(viewing.hoursWorked, 1)} />
              {!!viewing.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <RaiseTaskBtn onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }} />
            <Button onClick={() => { openEdit(viewing!); setViewing(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Vineyard Operation — ${fmt(raiseTaskFor.operationType)} · ${fmt(blockName(raiseTaskFor.blockId))}`}
          defaultDescription={`Date: ${fmtDate(raiseTaskFor.operationDate)} · Operator: ${fmt(raiseTaskFor.operatorName)} · Hours: ${fmtNum(raiseTaskFor.hoursWorked, 1)}`}
          module="Viticulture"
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) setOpen(false); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Vineyard Operation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" max={today} value={String(form.operationDate ?? "")} onChange={e => sf("operationDate", e.target.value)} /></div>
              <div><Label>Block</Label>
                <Select value={String(form.blockId ?? "")} onValueChange={v => sf("blockId", Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— All blocks —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Operation Type *</Label>
              <Select value={String(form.operationType ?? "")} onValueChange={v => sf("operationType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>{OPERATION_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {isPruning && (
              <>
                <div>
                  <Label>Pruning System</Label>
                  <Select value={String(form.pruningSystem ?? "")} onValueChange={v => sf("pruningSystem", v)}>
                    <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>
                      {["Double Guyot", "Single Guyot", "Cordon Spur", "Scott Henry", "Cane Replacement", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Target Buds/Vine</Label><Input type="number" value={String(form.budsPerVineTarget ?? "")} onChange={e => sf("budsPerVineTarget", e.target.value)} /></div>
                  <div><Label>Actual Buds/Vine</Label><Input type="number" value={String(form.budsPerVineActual ?? "")} onChange={e => sf("budsPerVineActual", e.target.value)} /></div>
                  <div><Label>Pruning Wt (kg/vine)</Label><Input type="number" step="0.001" value={String(form.pruningWeightKgPerVine ?? "")} onChange={e => sf("pruningWeightKgPerVine", e.target.value)} /></div>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Shoots Removed (%)</Label><Input type="number" min="0" max="100" value={String(form.shootsRemovedPct ?? "")} onChange={e => sf("shootsRemovedPct", e.target.value)} /></div>
              <div><Label>Leaves Removed Zone</Label><Input value={String(form.leavesRemovedZone ?? "")} onChange={e => sf("leavesRemovedZone", e.target.value)} placeholder="e.g. Fruit zone" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Operator</Label><Input value={String(form.operatorName ?? "")} onChange={e => sf("operatorName", e.target.value)} /></div>
              <div><Label>Contractor</Label><Input value={String(form.contractorName ?? "")} onChange={e => sf("contractorName", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Machine Used</Label><Input value={String(form.machineUsed ?? "")} onChange={e => sf("machineUsed", e.target.value)} /></div>
              <div><Label>Hours Worked</Label><Input type="number" step="0.5" value={String(form.hoursWorked ?? "")} onChange={e => sf("hoursWorked", e.target.value)} /></div>
            </div>
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={add.isPending || edit.isPending}>{(add.isPending || edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Harvest ───────────────────────────────────────────────────────────────────
type Harvest = Record<string, unknown>;

function HarvestTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<Harvest>(farmId, "vineyard-harvest", "vineyard-harvest");
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Harvest | null>(null);
  const [form, setForm] = useState<Harvest>({});
  const [viewing, setViewing] = useState<Harvest | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Harvest | null>(null);

  const openAdd = () => { setForm({ harvestDate: today, vintageYear: new Date().getFullYear(), operatorName: displayName ?? "" }); setCurrent(null); setOpen(true); };
  const openEdit = (r: Harvest) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? id;
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const csvCols = [
    { key: "harvestDate", label: "Harvest Date", fmt: (r: Record<string, unknown>) => fmtDate(r.harvestDate) },
    { key: "vintageYear", label: "Vintage Year" },
    { key: "blockId", label: "Block", fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
    { key: "harvestMethod", label: "Harvest Method" },
    { key: "yieldKg", label: "Yield (kg)" },
    { key: "yieldKgPerVine", label: "kg/Vine" },
    { key: "yieldTonnesPerHa", label: "t/ha" },
    { key: "brix", label: "Brix °" },
    { key: "ph", label: "pH" },
    { key: "titratableAcidityGl", label: "TA (g/L)" },
    { key: "potentialAlcohol", label: "Potential Alcohol %" },
    { key: "grapeCondition", label: "Grape Condition" },
    { key: "botrytisPresent", label: "Botrytis Present", fmt: (r: Record<string, unknown>) => r.botrytisPresent ? "Yes" : "No" },
    { key: "botrytisPercentage", label: "Botrytis %" },
    { key: "destinationWinery", label: "Destination Winery" },
    { key: "operatorName", label: "Operator" },
    { key: "notes", label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Harvest & Vintage Records</p>
          <p className="text-xs text-muted-foreground">Per-block vintage records including yield, must chemistry, and grape condition. Required for GI / PDO vintage declarations.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(data, "vineyard-harvest.csv", csvCols)} disabled={!data.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Harvest Record</Button>
        </div>
      </div>
      <DataTable
        cols={[
          { key: "harvestDate", label: "Date", render: r => fmtDate(r.harvestDate) },
          { key: "vintageYear", label: "Vintage" },
          { key: "blockId", label: "Block", render: r => fmt(blockName(r.blockId)) },
          { key: "harvestMethod", label: "Method" },
          { key: "yieldKg", label: "Yield (kg)", render: r => fmtNum(r.yieldKg, 1) },
          { key: "yieldTonnesPerHa", label: "t/ha", render: r => fmtNum(r.yieldTonnesPerHa, 2) },
          { key: "brix", label: "Brix °", render: r => fmtNum(r.brix, 1) },
          { key: "ph", label: "pH", render: r => fmtNum(r.ph, 2) },
          { key: "grapeCondition", label: "Condition" },
          { key: "botrytisPresent", label: "Botrytis", render: r => r.botrytisPresent ? <Badge variant="destructive">Yes {r.botrytisPercentage ? `${r.botrytisPercentage}%` : ""}</Badge> : <span className="text-muted-foreground">No</span> },
        ]}
        rows={data}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Harvest Record — {fmt(viewing?.vintageYear)} Vintage</DialogTitle></DialogHeader>
          {viewing && (
            <div className="grid grid-cols-2 gap-3">
              <ViewField label="Harvest Date" value={fmtDate(viewing.harvestDate)} />
              <ViewField label="Vintage Year" value={fmt(viewing.vintageYear)} />
              <ViewField label="Block" value={fmt(blockName(viewing.blockId))} />
              <ViewField label="Harvest Method" value={fmt(viewing.harvestMethod)} />
              <ViewField label="Total Yield (kg)" value={fmtNum(viewing.yieldKg, 1)} />
              <ViewField label="kg / Vine" value={fmtNum(viewing.yieldKgPerVine, 3)} />
              <ViewField label="t / ha" value={fmtNum(viewing.yieldTonnesPerHa, 3)} />
              <ViewField label="Grape Condition" value={fmt(viewing.grapeCondition)} />
              <ViewField label="Brix °" value={fmtNum(viewing.brix, 1)} />
              <ViewField label="pH" value={fmtNum(viewing.ph, 2)} />
              <ViewField label="TA (g/L)" value={fmtNum(viewing.titratableAcidityGl, 1)} />
              <ViewField label="Potential Alcohol %" value={fmtNum(viewing.potentialAlcohol, 1)} />
              <ViewField label="Botrytis Present" value={!!viewing.botrytisPresent ? <Badge variant="destructive">Yes {viewing.botrytisPercentage ? `— ${viewing.botrytisPercentage}%` : ""}</Badge> : "No"} />
              <ViewField label="Destination Winery" value={fmt(viewing.destinationWinery)} />
              <ViewField label="Operator" value={fmt(viewing.operatorName)} />
              {!!viewing.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <RaiseTaskBtn onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }} />
            <Button onClick={() => { openEdit(viewing!); setViewing(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Harvest — ${fmt(raiseTaskFor.vintageYear)} · ${fmt(blockName(raiseTaskFor.blockId))}`}
          defaultDescription={`Date: ${fmtDate(raiseTaskFor.harvestDate)} · Yield: ${fmtNum(raiseTaskFor.yieldKg, 1)} kg · Brix: ${fmtNum(raiseTaskFor.brix, 1)}° · Condition: ${fmt(raiseTaskFor.grapeCondition)}`}
          module="Viticulture"
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) setOpen(false); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Harvest Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Harvest Date *</Label><Input type="date" max={today} value={String(form.harvestDate ?? "")} onChange={e => sf("harvestDate", e.target.value)} /></div>
              <div><Label>Vintage Year *</Label><Input type="number" min="1900" max={new Date().getFullYear()} value={String(form.vintageYear ?? "")} onChange={e => sf("vintageYear", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Block</Label>
                <Select value={String(form.blockId ?? "")} onValueChange={v => sf("blockId", Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— All blocks —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)} ({String(b.variety)})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Harvest Method</Label>
                <Select value={String(form.harvestMethod ?? "")} onValueChange={v => sf("harvestMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["Hand Picked", "Machine Harvested", "Selective Hand Pick", "Triage Pick"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Yield</p>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Total Yield (kg)</Label><Input type="number" step="0.1" value={String(form.yieldKg ?? "")} onChange={e => sf("yieldKg", e.target.value)} /></div>
              <div><Label>kg / Vine</Label><Input type="number" step="0.001" value={String(form.yieldKgPerVine ?? "")} onChange={e => sf("yieldKgPerVine", e.target.value)} /></div>
              <div><Label>t / ha</Label><Input type="number" step="0.001" value={String(form.yieldTonnesPerHa ?? "")} onChange={e => sf("yieldTonnesPerHa", e.target.value)} /></div>
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Must Chemistry</p>
            <div className="grid grid-cols-4 gap-3">
              <div><Label>Brix °</Label><Input type="number" step="0.1" value={String(form.brix ?? "")} onChange={e => sf("brix", e.target.value)} /></div>
              <div><Label>pH</Label><Input type="number" step="0.01" value={String(form.ph ?? "")} onChange={e => sf("ph", e.target.value)} /></div>
              <div><Label>TA (g/L)</Label><Input type="number" step="0.1" value={String(form.titratableAcidityGl ?? "")} onChange={e => sf("titratableAcidityGl", e.target.value)} /></div>
              <div><Label>Pot. Alcohol %</Label><Input type="number" step="0.1" value={String(form.potentialAlcohol ?? "")} onChange={e => sf("potentialAlcohol", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Grape Condition</Label>
                <Select value={String(form.grapeCondition ?? "")} onValueChange={v => sf("grapeCondition", v)}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{["Excellent", "Good", "Fair", "Poor"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Destination Winery</Label><Input value={String(form.destinationWinery ?? "")} onChange={e => sf("destinationWinery", e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={!!form.botrytisPresent} onCheckedChange={v => sf("botrytisPresent", !!v)} id="bot" />
              <Label htmlFor="bot">Botrytis present at harvest</Label>
            </div>
            {!!form.botrytisPresent && (
              <div><Label>Botrytis Percentage (%)</Label><Input type="number" min="0" max="100" value={String(form.botrytisPercentage ?? "")} onChange={e => sf("botrytisPercentage", e.target.value)} /></div>
            )}
            <div><Label>Operator</Label><Input value={String(form.operatorName ?? "")} onChange={e => sf("operatorName", e.target.value)} /></div>
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={add.isPending || edit.isPending}>{(add.isPending || edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Disease Scouting ──────────────────────────────────────────────────────────
type Scouting = Record<string, unknown>;

function ScoutingTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<Scouting>(farmId, "vineyard-scouting", "vineyard-scouting");
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Scouting | null>(null);
  const [form, setForm] = useState<Scouting>({});
  const [viewing, setViewing] = useState<Scouting | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Scouting | null>(null);

  const openAdd = () => {
    setForm({ scoutDate: today, scoutedBy: displayName ?? "", downyMildewPressure: "0", powderyMildewPressure: "0", botrytisPressure: "0", phomopsisPressure: "0", leafhopperPressure: "0", spiderMitePressure: "0" });
    setCurrent(null);
    setOpen(true);
  };
  const openEdit = (r: Scouting) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? id;
  const pressureLabel = (v: unknown) => { const p = PRESSURE_LABELS[Number(v) || 0]; return <span className={p?.color}>{p?.label ?? "—"}</span>; };
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const csvCols = [
    { key: "scoutDate", label: "Scout Date", fmt: (r: Record<string, unknown>) => fmtDate(r.scoutDate) },
    { key: "blockId", label: "Block", fmt: (r: Record<string, unknown>) => String(blockName(r.blockId)) },
    { key: "scoutedBy", label: "Scouted By" },
    { key: "downyMildewPressure", label: "Downy Mildew", fmt: (r: Record<string, unknown>) => PRESSURE_LABELS[Number(r.downyMildewPressure) || 0]?.label },
    { key: "powderyMildewPressure", label: "Powdery Mildew", fmt: (r: Record<string, unknown>) => PRESSURE_LABELS[Number(r.powderyMildewPressure) || 0]?.label },
    { key: "botrytisPressure", label: "Botrytis", fmt: (r: Record<string, unknown>) => PRESSURE_LABELS[Number(r.botrytisPressure) || 0]?.label },
    { key: "phomopsisPressure", label: "Phomopsis", fmt: (r: Record<string, unknown>) => PRESSURE_LABELS[Number(r.phomopsisPressure) || 0]?.label },
    { key: "leafhopperPressure", label: "Leafhopper", fmt: (r: Record<string, unknown>) => PRESSURE_LABELS[Number(r.leafhopperPressure) || 0]?.label },
    { key: "spiderMitePressure", label: "Spider Mite", fmt: (r: Record<string, unknown>) => PRESSURE_LABELS[Number(r.spiderMitePressure) || 0]?.label },
    { key: "vineWeevilSighted", label: "Vine Weevil", fmt: (r: Record<string, unknown>) => r.vineWeevilSighted ? "Yes" : "No" },
    { key: "eutypaDiebackSighted", label: "Eutypa Dieback", fmt: (r: Record<string, unknown>) => r.eutypaDiebackSighted ? "Yes" : "No" },
    { key: "xylellaFastidiosa", label: "Xylella", fmt: (r: Record<string, unknown>) => r.xylellaFastidiosa ? "ALERT" : "No" },
    { key: "phytophthoraViticola", label: "Phytophthora viticola", fmt: (r: Record<string, unknown>) => r.phytophthoraViticola ? "ALERT" : "No" },
    { key: "sprayApplied", label: "Spray Applied", fmt: (r: Record<string, unknown>) => r.sprayApplied ? "Yes" : "No" },
    { key: "sprayProduct", label: "Spray Product" },
    { key: "nextScoutDate", label: "Next Scout Date", fmt: (r: Record<string, unknown>) => fmtDate(r.nextScoutDate) },
    { key: "actionTaken", label: "Action Taken" },
    { key: "notes", label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  const xylellaRows = data.filter(r => r.xylellaFastidiosa);

  return (
    <div className="space-y-4">
      {xylellaRows.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-3">
          <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Xylella fastidiosa — Notifiable Organism</p>
            <p className="text-xs text-red-700 mt-0.5">{xylellaRows.length} scouting record(s) have flagged possible Xylella. This is a regulated plant pest (Regulation EU 2016/2031 retained in UK law). Report immediately to APHA via the online plant health portal or call 0300 1000 313.</p>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Disease & Pest Scouting</p>
          <p className="text-xs text-muted-foreground">Regular scouting records demonstrate due diligence for plant health and inform spray timing decisions.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(data, "vineyard-scouting.csv", csvCols)} disabled={!data.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Scouting Record</Button>
        </div>
      </div>
      <DataTable
        cols={[
          { key: "scoutDate", label: "Date", render: r => fmtDate(r.scoutDate) },
          { key: "blockId", label: "Block", render: r => fmt(blockName(r.blockId)) },
          { key: "scoutedBy", label: "Scout" },
          { key: "downyMildewPressure", label: "Downy", render: r => pressureLabel(r.downyMildewPressure) },
          { key: "powderyMildewPressure", label: "Powdery", render: r => pressureLabel(r.powderyMildewPressure) },
          { key: "botrytisPressure", label: "Botrytis", render: r => pressureLabel(r.botrytisPressure) },
          { key: "vineWeevilSighted", label: "Vine Weevil", render: r => r.vineWeevilSighted ? <Badge variant="destructive">Yes</Badge> : <span className="text-muted-foreground">No</span> },
          { key: "xylellaFastidiosa", label: "Xylella", render: r => r.xylellaFastidiosa ? <Badge className="bg-red-700 text-white hover:bg-red-700">ALERT</Badge> : <span className="text-muted-foreground">No</span> },
          { key: "sprayApplied", label: "Spray", render: r => r.sprayApplied ? <Badge variant="default">Applied</Badge> : <span className="text-muted-foreground">No</span> },
        ]}
        rows={data}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)}
      />

      {/* View Dialog */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Disease Scouting Record</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <ViewField label="Scout Date" value={fmtDate(viewing.scoutDate)} />
                <ViewField label="Block" value={fmt(blockName(viewing.blockId))} />
                <ViewField label="Scouted By" value={fmt(viewing.scoutedBy)} />
                <ViewField label="Next Scout Date" value={fmtDate(viewing.nextScoutDate)} />
              </div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-t pt-2">Disease Pressure</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {(["downyMildewPressure", "powderyMildewPressure", "botrytisPressure", "phomopsisPressure"] as const).map(k => {
                  const labels: Record<string, string> = { downyMildewPressure: "Downy Mildew", powderyMildewPressure: "Powdery Mildew", botrytisPressure: "Botrytis", phomopsisPressure: "Phomopsis" };
                  return <ViewField key={k} label={labels[k]} value={pressureLabel(viewing[k])} />;
                })}
                {(["leafhopperPressure", "spiderMitePressure"] as const).map(k => {
                  const labels: Record<string, string> = { leafhopperPressure: "Leafhopper", spiderMitePressure: "Spider Mite" };
                  return <ViewField key={k} label={labels[k]} value={pressureLabel(viewing[k])} />;
                })}
                <ViewField label="Vine Weevil Sighted" value={!!viewing.vineWeevilSighted ? <Badge variant="destructive">Yes</Badge> : "No"} />
                <ViewField label="Eutypa Dieback" value={!!viewing.eutypaDiebackSighted ? <Badge variant="destructive">Yes</Badge> : "No"} />
              </div>
              {(!!viewing.xylellaFastidiosa || !!viewing.phytophthoraViticola) && (
                <div className="border border-red-200 rounded bg-red-50 p-2 space-y-1">
                  <p className="text-xs font-semibold text-red-800 uppercase">Notifiable Organisms</p>
                  {!!viewing.xylellaFastidiosa && <p className="text-xs text-red-700">⚠ Xylella fastidiosa suspected</p>}
                  {!!viewing.phytophthoraViticola && <p className="text-xs text-red-700">⚠ Phytophthora viticola suspected</p>}
                </div>
              )}
              {!!viewing.sprayApplied && <ViewField label="Spray Product" value={fmt(viewing.sprayProduct)} />}
              {!!viewing.actionTaken && <div className="col-span-2"><ViewField label="Action Taken" value={fmt(viewing.actionTaken)} /></div>}
              {!!viewing.notes && <ViewField label="Notes" value={fmt(viewing.notes)} />}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <RaiseTaskBtn onClick={() => { setRaiseTaskFor(viewing); setViewing(null); }} />
            <Button onClick={() => { openEdit(viewing!); setViewing(null); }}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`Disease Scouting — ${fmt(blockName(raiseTaskFor.blockId))} · ${fmtDate(raiseTaskFor.scoutDate)}`}
          defaultDescription={`Downy: ${PRESSURE_LABELS[Number(raiseTaskFor.downyMildewPressure) || 0]?.label} · Powdery: ${PRESSURE_LABELS[Number(raiseTaskFor.powderyMildewPressure) || 0]?.label} · Botrytis: ${PRESSURE_LABELS[Number(raiseTaskFor.botrytisPressure) || 0]?.label}${raiseTaskFor.xylellaFastidiosa ? " · ⚠ XYLELLA SUSPECTED" : ""}`}
          module="Viticulture"
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={open} onOpenChange={o => { if (!o) setOpen(false); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Scouting Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Scout Date *</Label><Input type="date" max={today} value={String(form.scoutDate ?? "")} onChange={e => sf("scoutDate", e.target.value)} /></div>
              <div><Label>Block</Label>
                <Select value={String(form.blockId ?? "")} onValueChange={v => sf("blockId", Number(v))}>
                  <SelectTrigger><SelectValue placeholder="All blocks…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— All blocks —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Scouted By</Label><Input value={String(form.scoutedBy ?? "")} onChange={e => sf("scoutedBy", e.target.value)} /></div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Disease Pressure (0 = None → 3 = High)</p>
            <div className="grid grid-cols-2 gap-3">
              {(["downyMildewPressure", "powderyMildewPressure", "botrytisPressure", "phomopsisPressure"] as const).map(k => {
                const labels: Record<string, string> = { downyMildewPressure: "Downy Mildew", powderyMildewPressure: "Powdery Mildew", botrytisPressure: "Botrytis", phomopsisPressure: "Phomopsis" };
                return (
                  <div key={k}>
                    <Label>{labels[k]}</Label>
                    <Select value={String(form[k] ?? "0")} onValueChange={v => sf(k, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[0, 1, 2, 3].map(n => <SelectItem key={n} value={String(n)}>{n} — {PRESSURE_LABELS[n]?.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pest Pressure</p>
            <div className="grid grid-cols-2 gap-3">
              {(["leafhopperPressure", "spiderMitePressure"] as const).map(k => {
                const labels: Record<string, string> = { leafhopperPressure: "Leafhopper", spiderMitePressure: "Spider Mite" };
                return (
                  <div key={k}>
                    <Label>{labels[k]}</Label>
                    <Select value={String(form[k] ?? "0")} onValueChange={v => sf(k, v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{[0, 1, 2, 3].map(n => <SelectItem key={n} value={String(n)}>{n} — {PRESSURE_LABELS[n]?.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2"><Checkbox checked={!!form.vineWeevilSighted} onCheckedChange={v => sf("vineWeevilSighted", !!v)} id="vw" /><Label htmlFor="vw">Vine Weevil sighted</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={!!form.eutypaDiebackSighted} onCheckedChange={v => sf("eutypaDiebackSighted", !!v)} id="ed" /><Label htmlFor="ed">Eutypa dieback sighted</Label></div>
            </div>
            <div className="border border-red-200 rounded-lg p-3 bg-red-50 space-y-2">
              <p className="text-xs font-semibold text-red-800 uppercase tracking-wide">Notifiable Organisms — Report to APHA if suspected</p>
              <div className="flex items-center gap-2"><Checkbox checked={!!form.xylellaFastidiosa} onCheckedChange={v => sf("xylellaFastidiosa", !!v)} id="xy" /><Label htmlFor="xy" className="text-red-900">Xylella fastidiosa suspected</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={!!form.phytophthoraViticola} onCheckedChange={v => sf("phytophthoraViticola", !!v)} id="pv" /><Label htmlFor="pv" className="text-red-900">Phytophthora viticola suspected</Label></div>
            </div>
            <div className="flex items-center gap-2"><Checkbox checked={!!form.sprayApplied} onCheckedChange={v => sf("sprayApplied", !!v)} id="sp" /><Label htmlFor="sp">Spray applied following this scouting</Label></div>
            {!!form.sprayApplied && <div><Label>Spray Product(s)</Label><Input value={String(form.sprayProduct ?? "")} onChange={e => sf("sprayProduct", e.target.value)} placeholder="Product name(s)" /></div>}
            <div><Label>Action Taken</Label><Textarea value={String(form.actionTaken ?? "")} onChange={e => sf("actionTaken", e.target.value)} rows={2} placeholder="Describe any action taken…" /></div>
            <div><Label>Next Scout Date</Label><Input type="date" min={today} value={String(form.nextScoutDate ?? "")} onChange={e => sf("nextScoutDate", e.target.value)} /></div>
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={add.isPending || edit.isPending}>{(add.isPending || edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "vine-register", label: "Vine Register", icon: ClipboardList },
  { id: "blocks", label: "Blocks", icon: Sprout },
  { id: "phenology", label: "Phenology", icon: Leaf },
  { id: "operations", label: "Pruning & Canopy", icon: Scissors },
  { id: "harvest", label: "Harvest", icon: Grape },
  { id: "scouting", label: "Disease Scouting", icon: Bug },
];

export default function ViticulturePage() {
  const { farmId: selectedFarmId } = useAppStore();
  const [tab, setTab] = useState("overview");
  const [raiseOpen, setRaiseOpen] = useState(false);
  const blocks = useCrud(selectedFarmId ?? 0, "vineyard-blocks", "vineyard-blocks");

  if (!selectedFarmId) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64 text-muted-foreground">Select a farm to view Viticulture records.</div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4 max-w-full">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Grape className="w-5 h-5 text-purple-600" />
              Viticulture
            </h1>
            <p className="text-sm text-muted-foreground">Growing compliance — HMRC vine register, blocks, phenology, operations, harvest and disease scouting</p>
          </div>
          <Button variant="outline" size="sm" className="text-purple-700 border-purple-200 hover:bg-purple-50" onClick={() => setRaiseOpen(true)}>
            <ClipboardList className="w-4 h-4 mr-1" />
            Raise Task
          </Button>
        </div>
        <TabBar>
          {TABS.map(t => (
            <TabButton key={t.id} active={tab === t.id} onClick={() => setTab(t.id)}>
              <t.icon className="w-3.5 h-3.5 mr-1" />
              {t.label}
            </TabButton>
          ))}
        </TabBar>
        <div className="bg-muted/30 rounded-xl p-4">
          {tab === "overview" && <OverviewTab farmId={selectedFarmId} />}
          {tab === "vine-register" && <VineRegisterTab farmId={selectedFarmId} blocks={blocks.data} />}
          {tab === "blocks" && <BlocksTab farmId={selectedFarmId} />}
          {tab === "phenology" && <PhenologyTab farmId={selectedFarmId} blocks={blocks.data} />}
          {tab === "operations" && <OperationsTab farmId={selectedFarmId} blocks={blocks.data} />}
          {tab === "harvest" && <HarvestTab farmId={selectedFarmId} blocks={blocks.data} />}
          {tab === "scouting" && <ScoutingTab farmId={selectedFarmId} blocks={blocks.data} />}
        </div>
      </div>
      <RaiseTaskDialog
        farmId={selectedFarmId}
        open={raiseOpen}
        onClose={() => setRaiseOpen(false)}
        defaultTitle="Viticulture Task"
        module="Viticulture"
      />
    </AppLayout>
  );
}
