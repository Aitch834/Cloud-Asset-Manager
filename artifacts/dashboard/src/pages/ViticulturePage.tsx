import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffSelect } from "@/components/ui/staff-select";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  Plus, Trash2, Loader2, Eye, Grape, Leaf, ClipboardList, Sprout,
  BarChart3, Bug, Scissors, ShieldAlert, CheckCircle2, XCircle, AlertTriangle,
  FileDown, Pencil, Map, FileText, Receipt, CalendarCheck, ShieldCheck, Wine,
  Droplet, FlaskConical, ChevronRight,
} from "lucide-react";
import { sanitiseCsvCell } from "@/lib/csv";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { VineyardBlockBoundaryMapDialog } from "@/components/viticulture/VineyardBlockBoundaryMapDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useLookupStrings } from "@/hooks/use-lookup";

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
export function OverviewTab({ farmId }: { farmId: number }) {
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

export function VineRegisterTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<VineReg>(farmId, "vine-register", "vine-register");
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<VineReg | null>(null);
  const [form, setForm] = useState<VineReg>({});
  const [viewing, setViewing] = useState<VineReg | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<VineReg | null>(null);
  const varieties = useLookupStrings("vineyard_grape_varieties", UK_GRAPE_VARIETIES);

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
          {viewing && typeof viewing.id === "number" && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="vine-register" recordId={viewing.id} />
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
                  <SelectContent>{varieties.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
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
                <Select value={String(form.blockId ?? "__none__")} onValueChange={v => sf("blockId", v === "__none__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— None —</SelectItem>
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

function plantingStatusBadge(status: unknown) {
  if (status === "active") return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Active</Badge>;
  if (status === "suspended") return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0">Suspended</Badge>;
  if (status === "removed") return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">Removed</Badge>;
  return <Badge variant="secondary">No Planting</Badge>;
}

function PlantingFormFields({ form, sf }: { form: Block; sf: (k: string, v: unknown) => void }) {
  const varieties = useLookupStrings("vineyard_grape_varieties", UK_GRAPE_VARIETIES);
  const rootstocks = useLookupStrings("vineyard_rootstocks", UK_ROOTSTOCKS);
  const trainingSystems = useLookupStrings("vineyard_training_systems", ["Double Guyot", "Single Guyot", "Cordon", "Scott Henry", "Lenz Moser", "VSP", "Other"]);
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Variety *</Label>
          <Select value={String(form.variety ?? "")} onValueChange={v => sf("variety", v)}>
            <SelectTrigger><SelectValue placeholder="Select variety…" /></SelectTrigger>
            <SelectContent>{varieties.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Clone</Label><Input value={String(form.clone ?? "")} onChange={e => sf("clone", e.target.value)} placeholder="e.g. Chardonnay 96" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Rootstock</Label>
          <Select value={String(form.rootstock ?? "")} onValueChange={v => sf("rootstock", v)}>
            <SelectTrigger><SelectValue placeholder="Select rootstock…" /></SelectTrigger>
            <SelectContent>{rootstocks.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Planting Year</Label><Input type="number" min="1900" max={new Date().getFullYear()} value={String(form.plantingYear ?? "")} onChange={e => sf("plantingYear", e.target.value)} placeholder="e.g. 2018" /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label>Area (ha)</Label><Input type="number" step="0.0001" value={String(form.areaHa ?? "")} onChange={e => sf("areaHa", e.target.value)} /></div>
        <div><Label>Number of Vines</Label><Input type="number" value={String(form.numberOfVines ?? "")} onChange={e => sf("numberOfVines", e.target.value)} /></div>
        <div><Label>Planted Date</Label><Input type="date" max={today} value={String(form.plantedDate ?? "")} onChange={e => sf("plantedDate", e.target.value)} /></div>
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
              {trainingSystems.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Trellis Type</Label><Input value={String(form.trellisType ?? "")} onChange={e => sf("trellisType", e.target.value)} placeholder="e.g. High wire, 2-wire" /></div>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox checked={!!form.isOrganicBlock} onCheckedChange={v => sf("isOrganicBlock", !!v)} id="org-planting" />
        <Label htmlFor="org-planting">Organic planting</Label>
      </div>
    </>
  );
}

export function BlocksTab({ farmId }: { farmId: number }) {
  const { data, isLoading, add, edit, remove } = useCrud<Block>(farmId, "vineyard-blocks", "vineyard-blocks");
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["vineyard-blocks", farmId] });

  // Main add/edit dialog
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Block | null>(null);
  const [form, setForm] = useState<Block>({});

  // View dialog
  const [viewing, setViewing] = useState<Block | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Block | null>(null);
  const [boundaryBlock, setBoundaryBlock] = useState<Block | null>(null);

  // Retire dialog
  const [retireOpen, setRetireOpen] = useState(false);
  const [retirePlanting, setRetirePlanting] = useState<Block | null>(null);
  const [retireForm, setRetireForm] = useState<Record<string, string>>({});

  // Replant dialog
  const [replantOpen, setReplantOpen] = useState(false);
  const [replantBlock, setReplantBlock] = useState<Block | null>(null);
  const [replantForm, setReplantForm] = useState<Block>({});

  // Reactivate mutation
  const reactivateMutation = useMutation({
    mutationFn: async ({ plantingId }: { plantingId: number }) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-block-plantings/${plantingId}/status`), {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status: "active" }),
      });
      return r.json();
    },
    onSuccess: invalidate,
  });

  // Retire mutation
  const retireMutation = useMutation({
    mutationFn: async ({ plantingId, body }: { plantingId: number; body: Record<string, string> }) => {
      const status = body.deactivationType === "temporary_suspension" ? "suspended" : "removed";
      const r = await fetch(api(`farms/${farmId}/vineyard-block-plantings/${plantingId}/status`), {
        method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ status, ...body }),
      });
      return r.json();
    },
    onSuccess: () => { invalidate(); setRetireOpen(false); setRetirePlanting(null); setRetireForm({}); },
  });

  // Replant mutation
  const replantMutation = useMutation({
    mutationFn: async ({ blockId, currentPlantingId, body }: { blockId: number; currentPlantingId: number | null; body: Block }) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-blocks/${blockId}/replant`), {
        method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include",
        body: JSON.stringify({ currentPlantingId, deactivationType: "replanting", ...body }),
      });
      return r.json();
    },
    onSuccess: () => { invalidate(); setReplantOpen(false); setReplantBlock(null); setReplantForm({}); },
  });

  const openAdd = () => { setForm({}); setCurrent(null); setOpen(true); };
  const openEdit = (r: Block) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const sfr = (k: string, v: unknown) => setReplantForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number, plantingId: form.plantingId });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const openRetire = (block: Block) => {
    setRetirePlanting(block);
    setRetireForm({ deactivationType: "grubbed_up", deactivationReason: "", deactivationNotes: "", deactivatedBy: "" });
    setRetireOpen(true);
    setViewing(null);
  };

  const openReplant = (block: Block) => {
    setReplantBlock(block);
    setReplantForm({ variety: "", plantingYear: String(new Date().getFullYear()) });
    setReplantOpen(true);
    setViewing(null);
  };

  // Filter controls
  const [showAll, setShowAll] = useState(false);
  const displayedBlocks = showAll ? data : data.filter(b => b.isActive !== false || (b.plantingStatus as string) === "suspended");

  const csvCols = [
    { key: "blockName", label: "Block Name" },
    { key: "blockRef", label: "Block Ref" },
    { key: "fieldParcelRef", label: "BPS/SFI Parcel Ref" },
    { key: "aspect", label: "Aspect" },
    { key: "soilType", label: "Soil Type" },
    { key: "variety", label: "Variety" },
    { key: "clone", label: "Clone" },
    { key: "rootstock", label: "Rootstock" },
    { key: "plantingYear", label: "Planting Year" },
    { key: "areaHa", label: "Area (ha)" },
    { key: "numberOfVines", label: "Number of Vines" },
    { key: "rowSpacingM", label: "Row Spacing (m)" },
    { key: "vineSpacingM", label: "Vine Spacing (m)" },
    { key: "trainingSystem", label: "Training System" },
    { key: "isOrganicBlock", label: "Organic", fmt: (r: Record<string, unknown>) => r.isOrganicBlock ? "Yes" : "No" },
    { key: "plantingStatus", label: "Status" },
    { key: "notes", label: "Notes" },
  ];

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin w-6 h-6 text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Vineyard Blocks</p>
          <p className="text-xs text-muted-foreground">Each block is a permanent geographic site. Individual plantings (variety, rootstock, spacing) are tracked with a full lifecycle — active, suspended, or removed.</p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1.5">
            <Checkbox checked={showAll} onCheckedChange={v => setShowAll(!!v)} id="show-all" />
            <Label htmlFor="show-all" className="text-xs text-muted-foreground cursor-pointer">Show removed</Label>
          </div>
          <Button size="sm" variant="outline" onClick={() => exportCSV(data, "vineyard-blocks.csv", csvCols)} disabled={!data.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Block</Button>
        </div>
      </div>

      <DataTable
        cols={[
          { key: "blockName", label: "Block" },
          { key: "blockRef", label: "Ref" },
          { key: "variety", label: "Variety" },
          { key: "rootstock", label: "Rootstock" },
          { key: "plantingYear", label: "Planted" },
          { key: "areaHa", label: "Area (ha)", render: r => fmtNum(r.areaHa, 4) },
          { key: "numberOfVines", label: "Vines" },
          { key: "trainingSystem", label: "Training" },
          { key: "isOrganicBlock", label: "Organic", render: r => r.isOrganicBlock ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Organic</Badge> : <span className="text-muted-foreground text-xs">—</span> },
          { key: "plantingStatus", label: "Status", render: r => plantingStatusBadge(r.plantingStatus) },
        ]}
        rows={displayedBlocks}
        onView={setViewing}
        onEdit={openEdit}
        onDelete={r => remove.mutateAsync(r.id as number)}
      />

      {/* ── View Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!viewing} onOpenChange={o => { if (!o) setViewing(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Vineyard Block — {fmt(viewing?.blockName)}
              {viewing && plantingStatusBadge(viewing.plantingStatus)}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              {/* Block site identity */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Block Site</p>
                <div className="grid grid-cols-3 gap-3">
                  <ViewField label="Block Name" value={fmt(viewing.blockName)} />
                  <ViewField label="Block Ref" value={fmt(viewing.blockRef)} />
                  <ViewField label="BPS/SFI Parcel" value={fmt(viewing.fieldParcelRef)} />
                  <ViewField label="Aspect" value={fmt(viewing.aspect)} />
                  <ViewField label="Soil Type" value={fmt(viewing.soilType)} />
                  {!!viewing.notes && <div className="col-span-3"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
                </div>
              </div>

              {/* Current planting */}
              {viewing.plantingStatus !== "no_planting" && (
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Current Planting</p>
                    {viewing.plantingStatus === "suspended" && (
                      <Button size="sm" variant="outline" className="h-6 text-xs text-green-700 border-green-200" onClick={() => reactivateMutation.mutate({ plantingId: viewing.plantingId as number })}>
                        {reactivateMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}Reactivate
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
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
                    <ViewField label="Organic" value={!!viewing.isOrganicBlock ? <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0">Organic</Badge> : "No"} />
                    <ViewField label="Status" value={plantingStatusBadge(viewing.plantingStatus)} />
                  </div>
                  {/* Deactivation record */}
                  {(viewing.plantingStatus === "suspended" || viewing.plantingStatus === "removed") && (() => {
                    const plantings = viewing.plantings as Block[];
                    const cur = plantings?.find((p: Block) => p.id === viewing.plantingId);
                    if (!cur) return null;
                    return (
                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3 space-y-1 text-xs">
                        <p className="font-semibold text-amber-800 uppercase tracking-wide">Deactivation Record</p>
                        {!!cur.deactivatedAt && <p className="text-amber-700">Date: {fmtDate(cur.deactivatedAt)}</p>}
                        {!!cur.deactivationType && <p className="text-amber-700">Type: {String(cur.deactivationType).replace(/_/g, " ")}</p>}
                        {!!cur.deactivationReason && <p className="text-amber-700">Reason: {fmt(cur.deactivationReason)}</p>}
                        {!!cur.deactivatedBy && <p className="text-amber-700">By: {fmt(cur.deactivatedBy)}</p>}
                        {!!cur.deactivationNotes && <p className="text-amber-700">Notes: {fmt(cur.deactivationNotes)}</p>}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Planting history */}
              {(() => {
                const plantings = (viewing.plantings as Block[]) ?? [];
                const past = plantings.filter((p: Block) => p.id !== viewing.plantingId);
                if (!past.length) return null;
                return (
                  <div className="border-t pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Planting History</p>
                    <div className="space-y-2">
                      {past.map((p: Block, i: number) => (
                        <div key={i} className="flex items-start justify-between text-xs bg-gray-50 rounded px-3 py-2 border">
                          <div>
                            <span className="font-medium">{fmt(p.variety)}</span>
                            {p.rootstock ? ` / ${fmt(p.rootstock)}` : ""}
                            {p.plantingYear ? ` · Planted ${fmt(p.plantingYear)}` : ""}
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            {plantingStatusBadge(p.status)}
                            {!!p.deactivatedAt && <span className="text-muted-foreground">{String(p.deactivationType ?? "").replace(/_/g, " ")} {fmtDate(p.deactivatedAt)}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <Button variant="outline" onClick={() => { setBoundaryBlock(viewing); setViewing(null); }}>
              <Map className="w-4 h-4 mr-1" />Draw Boundary
            </Button>
            {viewing && viewing.plantingStatus === "active" && (
              <Button variant="outline" className="text-amber-700 border-amber-200 hover:bg-amber-50" onClick={() => openRetire(viewing!)}>
                Retire / Take Out of Production
              </Button>
            )}
            {viewing && (viewing.plantingStatus === "removed" || viewing.plantingStatus === "no_planting") && (
              <Button variant="outline" className="text-green-700 border-green-200 hover:bg-green-50" onClick={() => openReplant(viewing!)}>
                <Plus className="w-4 h-4 mr-1" />Replant
              </Button>
            )}
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

      {/* ── Retire Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={retireOpen} onOpenChange={o => { if (!o) { setRetireOpen(false); setRetirePlanting(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Retire / Take Out of Production</DialogTitle>
          </DialogHeader>
          {retirePlanting && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded p-3 text-sm">
                <span className="font-medium">{fmt(retirePlanting.blockName)}</span>
                {!!retirePlanting.variety && <> — {fmt(retirePlanting.variety)}</>}
                {!!retirePlanting.plantingYear && <> (planted {fmt(retirePlanting.plantingYear)})</>}
              </div>
              <div>
                <Label>Reason for Retirement *</Label>
                <Select value={retireForm.deactivationType} onValueChange={v => setRetireForm(p => ({ ...p, deactivationType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select reason…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temporary_suspension">Temporary Suspension (will reactivate)</SelectItem>
                    <SelectItem value="grubbed_up">Permanently Grubbed Up</SelectItem>
                    <SelectItem value="replanting">Grubbed Up for Replanting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {retireForm.deactivationType === "temporary_suspension" && (
                  <p className="text-xs text-amber-700 mt-1">Status will be set to Suspended. You can reactivate this planting later.</p>
                )}
                {retireForm.deactivationType === "grubbed_up" && (
                  <p className="text-xs text-red-700 mt-1">Status will be set to Removed. HMRC vine register may need updating.</p>
                )}
                {retireForm.deactivationType === "replanting" && (
                  <p className="text-xs text-blue-700 mt-1">Status will be set to Removed. Use the Replant button to add a new planting on this site afterwards.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Retired By</Label><Input value={retireForm.deactivatedBy} onChange={e => setRetireForm(p => ({ ...p, deactivatedBy: e.target.value }))} placeholder="Name or role" /></div>
                <div><Label>Reason Summary</Label><Input value={retireForm.deactivationReason} onChange={e => setRetireForm(p => ({ ...p, deactivationReason: e.target.value }))} placeholder="Brief reason" /></div>
              </div>
              <div><Label>Additional Notes</Label><Textarea value={retireForm.deactivationNotes} onChange={e => setRetireForm(p => ({ ...p, deactivationNotes: e.target.value }))} rows={2} placeholder="Any supporting detail for the audit trail…" /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRetireOpen(false); setRetirePlanting(null); }}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={!retireForm.deactivationType || retireMutation.isPending}
              onClick={() => retireMutation.mutate({ plantingId: retirePlanting!.plantingId as number, body: retireForm })}
            >
              {retireMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Confirm Retirement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Replant Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={replantOpen} onOpenChange={o => { if (!o) { setReplantOpen(false); setReplantBlock(null); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Planting — {fmt(replantBlock?.blockName)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Enter the details for the new planting on this block site. A new planting record will be created and linked to the block's history.</p>
            <PlantingFormFields form={replantForm} sf={sfr} />
            <div><Label>Notes (optional)</Label><Textarea value={String(replantForm.notes ?? "")} onChange={e => sfr("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setReplantOpen(false); setReplantBlock(null); }}>Cancel</Button>
            <Button
              disabled={!replantForm.variety || replantMutation.isPending}
              onClick={() => replantMutation.mutate({ blockId: replantBlock!.id as number, currentPlantingId: replantBlock!.plantingId as number | null, body: replantForm })}
            >
              {replantMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Create New Planting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={o => { if (!o) setOpen(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{current ? "Edit" : "Add"} Vineyard Block</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Block Site</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Block Name *</Label><Input value={String(form.blockName ?? "")} onChange={e => sf("blockName", e.target.value)} placeholder="e.g. South Slope" /></div>
              <div><Label>Block Reference</Label><Input value={String(form.blockRef ?? "")} onChange={e => sf("blockRef", e.target.value)} placeholder="e.g. BLK-01" /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
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
              <div><Label>BPS/SFI Parcel Ref</Label><Input value={String(form.fieldParcelRef ?? "")} onChange={e => sf("fieldParcelRef", e.target.value)} /></div>
            </div>
            <div><Label>Block Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={1} /></div>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide border-t pt-3">{current ? "Current Planting" : "Initial Planting"}</p>
            <PlantingFormFields form={form} sf={sf} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={add.isPending || edit.isPending}>{(add.isPending || edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {boundaryBlock && (
        <VineyardBlockBoundaryMapDialog
          blockId={boundaryBlock.id as number}
          blockName={fmt(boundaryBlock.blockName)}
          open={!!boundaryBlock}
          onClose={() => setBoundaryBlock(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["vineyard-blocks", farmId] });
            setBoundaryBlock(null);
          }}
        />
      )}
    </div>
  );
}

// ─── Phenology ─────────────────────────────────────────────────────────────────
type Phenology = Record<string, unknown>;

export function PhenologyTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<Phenology>(farmId, "vineyard-phenology", "vineyard-phenology");
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Phenology | null>(null);
  const [form, setForm] = useState<Phenology>({});
  const [viewing, setViewing] = useState<Phenology | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Phenology | null>(null);
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));

  const openAdd = () => { setForm({ observationDate: today, observer: displayName ?? "" }); setCurrent(null); setOpen(true); };
  const openEdit = (r: Phenology) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? id;
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const phenologyYears = Array.from(new Set(data.map(r => new Date(r.observationDate as string).getFullYear()))).sort((a, b) => b - a);
  if (!phenologyYears.includes(new Date().getFullYear())) phenologyYears.unshift(new Date().getFullYear());
  const filteredPhenology = yearFilter === "all" ? data : data.filter(r => new Date(r.observationDate as string).getFullYear() === Number(yearFilter));

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
        <div className="flex gap-2 items-center">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {phenologyYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredPhenology, "phenology.csv", csvCols)} disabled={!filteredPhenology.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
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
        rows={filteredPhenology}
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

export function OperationsTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<Operation>(farmId, "vineyard-operations", "vineyard-operations");
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Operation | null>(null);
  const [form, setForm] = useState<Operation>({});
  const [viewing, setViewing] = useState<Operation | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Operation | null>(null);
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const operationTypes = useLookupStrings("vineyard_operation_types", OPERATION_TYPES);

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

  const operationYears = Array.from(new Set(data.map(r => new Date(r.operationDate as string).getFullYear()))).sort((a, b) => b - a);
  if (!operationYears.includes(new Date().getFullYear())) operationYears.unshift(new Date().getFullYear());
  const filteredOperations = yearFilter === "all" ? data : data.filter(r => new Date(r.operationDate as string).getFullYear() === Number(yearFilter));

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
        <div className="flex gap-2 items-center">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {operationYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredOperations, "vineyard-operations.csv", csvCols)} disabled={!filteredOperations.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
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
        rows={filteredOperations}
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
                <Select value={String(form.blockId ?? "__none__")} onValueChange={v => sf("blockId", v === "__none__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— All blocks —</SelectItem>
                    {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Operation Type *</Label>
              <Select value={String(form.operationType ?? "")} onValueChange={v => sf("operationType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>{operationTypes.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
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

export function HarvestTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<Harvest>(farmId, "vineyard-harvest", "vineyard-harvest");
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Harvest | null>(null);
  const [form, setForm] = useState<Harvest>({});
  const [viewing, setViewing] = useState<Harvest | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Harvest | null>(null);
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));

  const { data: wineryContactsData } = useQuery<{ records: Record<string, unknown>[] }>({
    queryKey: ["vineyard-winery-contacts", farmId],
    queryFn: async () => { const r = await fetch(api(`farms/${farmId}/vineyard-harvest/winery-contacts`)); return r.json(); },
    staleTime: 60_000,
  });
  const wineryContacts = wineryContactsData?.records ?? [];

  const openAdd = () => { setForm({ harvestDate: today, vintageYear: new Date().getFullYear(), operatorName: displayName ?? "" }); setCurrent(null); setOpen(true); };
  const openEdit = (r: Harvest) => { setForm({ ...r }); setCurrent(r); setOpen(true); };
  const sf = (k: string, v: unknown) => setForm(p => ({ ...p, [k]: v }));
  const blockName = (id: unknown) => blocks.find(b => b.id === id)?.blockName ?? id;
  const save = async () => {
    if (current) await edit.mutateAsync({ ...form, id: current.id as number });
    else await add.mutateAsync(form);
    setOpen(false);
  };

  const harvestYears = Array.from(new Set(data.map(r => Number(r.vintageYear)))).filter(Boolean).sort((a, b) => b - a);
  if (!harvestYears.includes(new Date().getFullYear())) harvestYears.unshift(new Date().getFullYear());
  const filteredHarvest = yearFilter === "all" ? data : data.filter(r => String(r.vintageYear) === yearFilter);

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
        <div className="flex gap-2 items-center">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All vintages</SelectItem>
              {harvestYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredHarvest, "vineyard-harvest.csv", csvCols)} disabled={!filteredHarvest.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
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
        rows={filteredHarvest}
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
              <ViewField label="Destination" value={
                viewing.destinationWineryType === "own-holding" ? "Own winery (on-holding)" :
                viewing.destinationWineryType === "contract-processor" ? `Contract processor: ${fmt(viewing.destinationWinery)}` :
                viewing.destinationWineryType === "grape-sale" ? `Grape sale: ${fmt(viewing.destinationWinery)}` :
                fmt(viewing.destinationWinery)
              } />
              <ViewField label="Operator" value={fmt(viewing.operatorName)} />
              {!!viewing.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(viewing.notes)} /></div>}
            </div>
          )}
          {viewing && typeof viewing.id === "number" && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="vineyard-harvest" recordId={viewing.id} />
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
          defaultTitle={
            raiseTaskFor.botrytisPresent
              ? `Botrytis at Harvest — ${fmt(raiseTaskFor.vintageYear)} · ${fmt(blockName(raiseTaskFor.blockId))}`
              : `Harvest — ${fmt(raiseTaskFor.vintageYear)} · ${fmt(blockName(raiseTaskFor.blockId))}`
          }
          defaultDescription={
            raiseTaskFor.botrytisPresent
              ? `${raiseTaskFor.botrytisPercentage ? `${raiseTaskFor.botrytisPercentage}% botrytis` : "Botrytis"} recorded at harvest on ${fmtDate(raiseTaskFor.harvestDate)} — ${fmt(blockName(raiseTaskFor.blockId))} block. Actions: assess must, confirm SO₂ protocol with winemaker, verify GI / PDO eligibility before vintage declaration, notify destination winery.`
              : `Date: ${fmtDate(raiseTaskFor.harvestDate)} · Yield: ${fmtNum(raiseTaskFor.yieldKg, 1)} kg · Brix: ${fmtNum(raiseTaskFor.brix, 1)}° · Condition: ${fmt(raiseTaskFor.grapeCondition)}`
          }
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
                <Select value={form.blockId ? String(form.blockId) : "__all__"} onValueChange={v => sf("blockId", v === "__all__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select block…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">— All blocks —</SelectItem>
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
              <div><Label>TA (g/L)</Label><Input type="number" step="0.1" value={String(form.titratableAcidityGl ?? "")} onChange={e => sf("titratableAcidityGl", e.target.value)} /><p className="text-xs text-muted-foreground mt-1">Lab result — can be added after harvest</p></div>
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
              <div>
                <Label>Destination Type</Label>
                <Select
                  value={String(form.destinationWineryType ?? "")}
                  onValueChange={v => {
                    sf("destinationWineryType", v);
                    if (v === "own-holding") { sf("destinationWinery", "Own winery (on-holding)"); sf("destinationWineryContactId", null); }
                    else { sf("destinationWinery", ""); sf("destinationWineryContactId", null); }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="own-holding">Own winery (on-holding)</SelectItem>
                    <SelectItem value="contract-processor">Contract winery / processor</SelectItem>
                    <SelectItem value="grape-sale">Grape sale to buyer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(form.destinationWineryType === "contract-processor" || form.destinationWineryType === "grape-sale") && (
              <div>
                <Label>{form.destinationWineryType === "grape-sale" ? "Grape Buyer" : "Contract Winery"}</Label>
                <Select
                  value={form.destinationWineryContactId ? String(form.destinationWineryContactId) : ""}
                  onValueChange={v => {
                    const contact = wineryContacts.find(c => String(c.id) === v);
                    sf("destinationWineryContactId", Number(v));
                    sf("destinationWinery", contact ? String(contact.name) : "");
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select from trade contacts…" /></SelectTrigger>
                  <SelectContent>
                    {wineryContacts.length === 0 && <SelectItem value="__none__" disabled>No contacts found — add them in Suppliers & Stock</SelectItem>}
                    {wineryContacts.map(c => (
                      <SelectItem key={String(c.id)} value={String(c.id)}>
                        {String(c.name)}{c.supplierType ? ` · ${String(c.supplierType)}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox checked={!!form.botrytisPresent} onCheckedChange={v => sf("botrytisPresent", !!v)} id="bot" />
              <Label htmlFor="bot">Botrytis present at harvest</Label>
            </div>
            {!!form.botrytisPresent && (
              <>
                <div><Label>Botrytis Percentage (%)</Label><Input type="number" min="0" max="100" value={String(form.botrytisPercentage ?? "")} onChange={e => sf("botrytisPercentage", e.target.value)} /></div>
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 space-y-1">
                  <p className="font-semibold">Botrytis at harvest — please review before dispatch:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li><span className="font-medium">SO₂ management:</span> botrytis-affected must requires higher initial SO₂ addition and closer monitoring throughout fermentation.</li>
                    <li><span className="font-medium">GI / PDO eligibility:</span> significant botrytis may affect vintage declaration eligibility — check your scheme rules before lodging a claim.</li>
                    <li><span className="font-medium">Notify your winemaker</span> before grape intake so they can adjust must treatment protocols accordingly.</li>
                  </ul>
                </div>
              </>
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

export function ScoutingTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data, isLoading, add, edit, remove } = useCrud<Scouting>(farmId, "vineyard-scouting", "vineyard-scouting");
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Scouting | null>(null);
  const [form, setForm] = useState<Scouting>({});
  const [viewing, setViewing] = useState<Scouting | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Scouting | null>(null);
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));

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
    if (current) {
      await edit.mutateAsync({ ...form, id: current.id as number });
      setOpen(false);
    } else {
      await add.mutateAsync(form);
      setOpen(false);
      const hasHighPressure =
        Number(form.downyMildewPressure) >= 2 ||
        Number(form.powderyMildewPressure) >= 2 ||
        Number(form.botrytisPressure) >= 2 ||
        Number(form.phomopsisPressure) >= 2 ||
        Number(form.leafhopperPressure) >= 2 ||
        Number(form.spiderMitePressure) >= 2 ||
        !!form.vineWeevilSighted ||
        !!form.xylellaFastidiosa ||
        !!form.phytophthoraViticola ||
        !!form.eutypaDiebackSighted;
      if (hasHighPressure) setRaiseTaskFor(form);
    }
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
    { key: "nextScoutDate", label: "Next Scout Date", fmt: (r: Record<string, unknown>) => fmtDate(r.nextScoutDate) },
    { key: "actionTaken", label: "Action Taken" },
    { key: "notes", label: "Notes" },
  ];

  const scoutingYears = Array.from(new Set(data.map(r => new Date(r.scoutDate as string).getFullYear()))).sort((a, b) => b - a);
  if (!scoutingYears.includes(new Date().getFullYear())) scoutingYears.unshift(new Date().getFullYear());
  const filteredScouting = yearFilter === "all" ? data : data.filter(r => new Date(r.scoutDate as string).getFullYear() === Number(yearFilter));

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
        <div className="flex gap-2 items-center">
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {scoutingYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredScouting, "vineyard-scouting.csv", csvCols)} disabled={!filteredScouting.length}><FileDown className="w-4 h-4 mr-1" />Export CSV</Button>
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
        ]}
        rows={filteredScouting}
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
                <Select value={form.blockId ? String(form.blockId) : "__all__"} onValueChange={v => sf("blockId", v === "__all__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="All blocks…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">— All blocks —</SelectItem>
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

// ─── Winery: Wine Production (shared with Organic Viticulture) ─────────────────

const WINE_COLOUR_OPTIONS = ["Red", "White", "Rosé", "Sparkling", "Orange", "Other"];
const ADDITIVE_TYPE_OPTIONS = [
  "Sulphites / SO₂",
  "Fining Agent",
  "Stabiliser",
  "Acidifier",
  "Preservative",
  "Other",
];

export function SO2Chip({ compliant }: { compliant: number }) {
  return compliant === 1
    ? <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Compliant</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Exceeds Limit</span>;
}

export function WineProductionTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<{ records: Record<string, unknown>[] }>({
    queryKey: ["org-vit-wine", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/wine-production`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  const openAdd = () => {
    setForm({ vintageYear: String(new Date().getFullYear()), certifiedOrganic: "1", so2Compliant: "1" });
    setShowAdd(true);
  };
  const openEdit = (r: Record<string, unknown>) => {
    setForm({
      vintageYear: r.vintageYear ? String(r.vintageYear) : "",
      wineColour: String(r.wineColour ?? ""),
      volumeLitres: String(r.volumeLitres ?? ""),
      certifiedOrganic: r.certifiedOrganic != null ? String(r.certifiedOrganic) : "1",
      certifierRef: String(r.certifierRef ?? ""),
      additiveName: String(r.additiveName ?? ""),
      additiveType: String(r.additiveType ?? ""),
      quantityUsed: String(r.quantityUsed ?? ""),
      quantityUnit: String(r.quantityUnit ?? ""),
      maxPermittedLevel: String(r.maxPermittedLevel ?? ""),
      actualSO2MgL: String(r.actualSO2MgL ?? ""),
      maxSO2MgL: String(r.maxSO2MgL ?? ""),
      so2Compliant: r.so2Compliant != null ? String(r.so2Compliant) : "1",
      regulatoryBasis: String(r.regulatoryBasis ?? ""),
      notes: String(r.notes ?? ""),
    });
    setEditing(r);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/wine-production/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/wine-production`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-wine", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => fetch(`/api/farms/${farmId}/organic-viticulture/wine-production/${id}`, { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-wine", farmId] }); setDeleting(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const records = data?.records ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Record organic wine production additive use and SO₂ compliance per vintage. UK-retained EU Reg 203/2012 sets SO₂ limits: 100 mg/L red, 150 mg/L white/rosé.</p>
        <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Record</Button>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-900">
        <strong>SO₂ limits for organic wine (UK-retained Reg 203/2012):</strong> Red wine — 100 mg/L total SO₂. White and rosé wine — 150 mg/L. These limits are lower than for conventional wine. Sparkling and sweet wine may have higher permitted levels — check your certifier guidance.
      </div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border rounded-lg">No wine production records yet.</div>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div key={String(r.id)} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">Vintage {String(r.vintageYear)}</span>
                    {!!r.wineColour && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{String(r.wineColour)}</span>}
                    {(r.certifiedOrganic === 1 || r.certifiedOrganic === "1")
                      ? <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">Certified Organic</span>
                      : <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Not Certified</span>}
                    <SO2Chip compliant={Number(r.so2Compliant)} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mt-2">
                    <div><span className="text-gray-500">Volume:</span> <span className="font-medium">{r.volumeLitres ? `${r.volumeLitres} L` : "—"}</span></div>
                    <div><span className="text-gray-500">Additive:</span> <span className="font-medium">{fmt(String(r.additiveName ?? ""))}</span></div>
                    <div><span className="text-gray-500">Type:</span> <span className="font-medium">{fmt(String(r.additiveType ?? ""))}</span></div>
                    <div><span className="text-gray-500">Quantity Used:</span> <span className="font-medium">{r.quantityUsed ? `${r.quantityUsed} ${r.quantityUnit ?? ""}`.trim() : "—"}</span></div>
                    <div><span className="text-gray-500">Actual SO₂:</span> <span className="font-medium">{r.actualSO2MgL ? `${r.actualSO2MgL} mg/L` : "—"}</span></div>
                    <div><span className="text-gray-500">Max SO₂ Permitted:</span> <span className="font-medium">{r.maxSO2MgL ? `${r.maxSO2MgL} mg/L` : "—"}</span></div>
                  </div>
                  {!!r.certifierRef && <p className="text-xs text-gray-500 mt-1">Certifier Ref: {String(r.certifierRef)}</p>}
                  {!!r.regulatoryBasis && <p className="text-xs text-gray-500 mt-0.5">Regulatory basis: {String(r.regulatoryBasis)}</p>}
                  {!!r.notes && <p className="text-sm text-gray-500 mt-1">{String(r.notes)}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Wine Production Record" : "Add Wine Production Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vintage Year *</Label><Input type="number" value={form.vintageYear ?? ""} onChange={sf("vintageYear")} placeholder="e.g. 2024" /></div>
              <div>
                <Label>Wine Colour</Label>
                <Select value={form.wineColour ?? ""} onValueChange={v => setForm(f => ({ ...f, wineColour: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{WINE_COLOUR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Volume (Litres)</Label><Input type="number" value={form.volumeLitres ?? ""} onChange={sf("volumeLitres")} placeholder="Total production" /></div>
              <div>
                <Label>Certified Organic?</Label>
                <Select value={form.certifiedOrganic ?? "1"} onValueChange={v => setForm(f => ({ ...f, certifiedOrganic: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="1">Yes</SelectItem><SelectItem value="0">No</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Certifier Reference</Label><Input value={form.certifierRef ?? ""} onChange={sf("certifierRef")} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Additive Name</Label><Input value={form.additiveName ?? ""} onChange={sf("additiveName")} placeholder="e.g. Potassium Metabisulphite" /></div>
              <div>
                <Label>Additive Type</Label>
                <Select value={form.additiveType ?? ""} onValueChange={v => setForm(f => ({ ...f, additiveType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{ADDITIVE_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Quantity Used</Label><Input value={form.quantityUsed ?? ""} onChange={sf("quantityUsed")} /></div>
              <div><Label>Unit</Label><Input value={form.quantityUnit ?? ""} onChange={sf("quantityUnit")} placeholder="e.g. g/hL" /></div>
            </div>
            <div><Label>Max Permitted Level</Label><Input value={form.maxPermittedLevel ?? ""} onChange={sf("maxPermittedLevel")} placeholder="e.g. 50 g/hL" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Actual SO₂ (mg/L)</Label><Input type="number" value={form.actualSO2MgL ?? ""} onChange={sf("actualSO2MgL")} /></div>
              <div><Label>Max SO₂ Permitted (mg/L)</Label><Input type="number" value={form.maxSO2MgL ?? ""} onChange={sf("maxSO2MgL")} placeholder="100 or 150" /></div>
            </div>
            <div>
              <Label>SO₂ Compliant?</Label>
              <Select value={form.so2Compliant ?? "1"} onValueChange={v => setForm(f => ({ ...f, so2Compliant: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="1">Yes — within limit</SelectItem><SelectItem value="0">No — exceeds limit</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Regulatory Basis</Label><Input value={form.regulatoryBasis ?? ""} onChange={sf("regulatoryBasis")} placeholder="e.g. UK-retained EU Reg 203/2012" /></div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          {editing && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="wine-production" recordId={(editing as Record<string, unknown>).id as number} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.vintageYear || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Wine Production Record</DialogTitle><DialogDescription>Remove the record for vintage <strong>{String(deleting?.vintageYear ?? "")}</strong>? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate(Number(deleting!.id))} disabled={deleteMutation.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Winery: Licensing ─────────────────────────────────────────────────────────

const LICENCE_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  suspended: "bg-amber-100 text-amber-700",
  lapsed: "bg-red-100 text-red-700",
};

export function LicensingTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-licences", "winery-licences");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const openAdd = () => { setEditing(null); setForm({ status: "active" }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm({ ...r }); setOpen(true); };
  const save = () => { if (editing !== null) crud.edit.mutate({ id: editing, ...form } as Record<string, unknown> & { id: number }); else crud.add.mutate(form); setOpen(false); };
  const today30 = new Date(); today30.setDate(today30.getDate() + 30); const now = new Date();
  const expiringDps = crud.data.filter(r => r.dpsPersonalLicenceExpiry && new Date(r.dpsPersonalLicenceExpiry as string) <= today30 && new Date(r.dpsPersonalLicenceExpiry as string) >= now);
  const dueReview = crud.data.filter(r => r.reviewDate && new Date(r.reviewDate as string) <= today30 && new Date(r.reviewDate as string) >= now);
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div><h3 className="font-semibold text-sm">Premises Licences & DPS</h3><p className="text-xs text-muted-foreground mt-0.5">Licensing Act 2003 — premises licence, Designated Premises Supervisor personal licence, and review dates.</p></div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Licence</Button>
      </div>
      {expiringDps.length > 0 && <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /><p><strong>DPS Personal Licence expiring soon:</strong> {expiringDps.map(r => fmt(r.dpsName)).join(", ")}. Renewal must be completed before it lapses.</p></div>}
      {dueReview.length > 0 && <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /><p><strong>Premises licence review due within 30 days:</strong> {dueReview.map(r => fmt(r.licenceNumber) || "unlicensed record").join(", ")}.</p></div>}
      {crud.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "licenceNumber", label: "Licence No." },
            { key: "localAuthority", label: "Issuing Council" },
            { key: "dpsName", label: "DPS" },
            { key: "licenceType", label: "Type", render: r => <span className="capitalize">{fmt(r.licenceType)?.replace(/_/g, " ")}</span> },
            { key: "reviewDate", label: "Review Date", render: r => fmtDate(r.reviewDate) },
            { key: "status", label: "Status", render: r => <span className={`text-xs rounded-full px-2 py-0.5 ${LICENCE_STATUS_COLORS[String(r.status)] ?? "bg-gray-100 text-gray-600"}`}>{fmt(r.status)}</span> },
          ]}
          rows={crud.data}
          onView={setView} onEdit={openEdit} onDelete={r => crud.remove.mutate(r.id as number)}
        />
      )}
      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent style={{ maxWidth: "40rem" }}>
            <DialogHeader><DialogTitle>Premises Licence — {fmt(view.licenceNumber) || "Record"}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ViewField label="Licence Number" value={fmt(view.licenceNumber)} />
              <ViewField label="Licence Type" value={<span className="capitalize">{fmt(view.licenceType)?.replace(/_/g, " ")}</span>} />
              <ViewField label="Issuing Council" value={fmt(view.localAuthority)} />
              <ViewField label="Status" value={<span className={`text-xs rounded-full px-2 py-0.5 ${LICENCE_STATUS_COLORS[String(view.status)] ?? ""}`}>{fmt(view.status)}</span>} />
              <ViewField label="DPS Name" value={fmt(view.dpsName)} />
              <ViewField label="DPS Personal Licence No." value={fmt(view.dpsPersonalLicenceNumber)} />
              <ViewField label="DPS Licence Expiry" value={fmtDate(view.dpsPersonalLicenceExpiry)} />
              <ViewField label="Granted Date" value={fmtDate(view.grantedDate)} />
              <ViewField label="Review Date" value={fmtDate(view.reviewDate)} />
              <div className="col-span-2"><ViewField label="Conditions" value={fmt(view.conditions)} /></div>
              <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>
            </div>
            {typeof view.id === "number" && (
              <div className="border-t pt-3 mt-1">
                <RecordAttachments farmId={farmId} recordType="winery-licence" recordId={view.id} />
              </div>
            )}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Add"} Premises Licence</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Licence Number</Label><Input value={String(form.licenceNumber ?? "")} onChange={e => sf("licenceNumber", e.target.value)} /></div>
            <div><Label>Licence Type</Label>
              <Select value={String(form.licenceType ?? "")} onValueChange={v => sf("licenceType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="on_licence">On-licence (on-site consumption)</SelectItem>
                  <SelectItem value="off_licence">Off-licence (retail / farm shop)</SelectItem>
                  <SelectItem value="both">Both on- and off-licence</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Issuing Local Authority</Label><Input value={String(form.localAuthority ?? "")} onChange={e => sf("localAuthority", e.target.value)} placeholder="e.g. East Sussex County Council" /></div>
            <div><Label>DPS Name</Label><Input value={String(form.dpsName ?? "")} onChange={e => sf("dpsName", e.target.value)} /></div>
            <div><Label>DPS Personal Licence No.</Label><Input value={String(form.dpsPersonalLicenceNumber ?? "")} onChange={e => sf("dpsPersonalLicenceNumber", e.target.value)} /></div>
            <div><Label>DPS Licence Expiry</Label><Input type="date" value={String(form.dpsPersonalLicenceExpiry ?? "")} onChange={e => sf("dpsPersonalLicenceExpiry", e.target.value)} /></div>
            <div><Label>Granted Date</Label><Input type="date" value={String(form.grantedDate ?? "")} onChange={e => sf("grantedDate", e.target.value)} /></div>
            <div><Label>Review / Renewal Date</Label><Input type="date" value={String(form.reviewDate ?? "")} onChange={e => sf("reviewDate", e.target.value)} /></div>
            <div><Label>Status</Label>
              <Select value={String(form.status ?? "active")} onValueChange={v => sf("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="lapsed">Lapsed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Licence Conditions</Label><Textarea value={String(form.conditions ?? "")} onChange={e => sf("conditions", e.target.value)} rows={2} placeholder="e.g. No off-sales after 22:00, Challenge 25 policy required…" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending}>{(crud.add.isPending || crud.edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Winery: Excise & Duty Returns ─────────────────────────────────────────────

const EXCISE_STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-amber-100 text-amber-700",
  paid: "bg-green-100 text-green-700",
};

export function ExciseDutyTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-excise-returns", "winery-excise-returns");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const openAdd = () => { setEditing(null); setForm({ status: "draft", smallProducerRelief: false }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm({ ...r }); setOpen(true); };
  const save = () => { if (editing !== null) crud.edit.mutate({ id: editing, ...form } as Record<string, unknown> & { id: number }); else crud.add.mutate(form); setOpen(false); };
  const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const rolling12mL = crud.data.filter(r => r.periodEnd && new Date(r.periodEnd as string) >= oneYearAgo).reduce((s, r) => s + parseFloat(String(r.totalLitresProduced ?? 0)), 0);
  const rollingHl = rolling12mL / 100;
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div><h3 className="font-semibold text-sm">Excise Duty Returns</h3><p className="text-xs text-muted-foreground mt-0.5">HMRC wine duty log (Excise Notice 163). All wine produced — including tasting volumes — is dutiable. Small Producer Relief (SPR) applies under 4,500 hl/year.</p></div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Return</Button>
      </div>
      {rollingHl > 0 && (
        <div className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${rollingHl >= 4500 ? "bg-amber-50 border-amber-200 text-amber-800" : "bg-green-50 border-green-200 text-green-800"}`}>
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <p>Rolling 12-month production: <strong>{rollingHl.toFixed(1)} hl</strong> of 4,500 hl SPR threshold.{rollingHl >= 4500 ? " Standard duty rates apply." : " Small Producer Relief may apply."}</p>
        </div>
      )}
      {crud.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "period", label: "Period", render: r => `${fmtDate(r.periodStart)} – ${fmtDate(r.periodEnd)}` },
            { key: "status", label: "Status", render: r => <span className={`text-xs rounded-full px-2 py-0.5 ${EXCISE_STATUS_COLORS[String(r.status)] ?? ""}`}>{fmt(r.status)}</span> },
            { key: "totalLitresProduced", label: "Produced (L)", render: r => fmtNum(r.totalLitresProduced) },
            { key: "totalLitresSold", label: "Sold (L)", render: r => fmtNum(r.totalLitresSold) },
            { key: "totalLitresTastings", label: "Tastings (L)", render: r => fmtNum(r.totalLitresTastings) },
            { key: "totalDutyPayable", label: "Duty (£)", render: r => r.totalDutyPayable ? `£${fmtNum(r.totalDutyPayable, 2)}` : "—" },
            { key: "paidDate", label: "Paid", render: r => fmtDate(r.paidDate) },
          ]}
          rows={crud.data}
          onView={setView} onEdit={openEdit} onDelete={r => crud.remove.mutate(r.id as number)}
        />
      )}
      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Excise Return — {fmtDate(view.periodStart)} to {fmtDate(view.periodEnd)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ViewField label="HMRC Excise Ref" value={fmt(view.hmrcExciseRef)} />
              <ViewField label="Status" value={<span className={`text-xs rounded-full px-2 py-0.5 ${EXCISE_STATUS_COLORS[String(view.status)] ?? ""}`}>{fmt(view.status)}</span>} />
              <ViewField label="Period Start" value={fmtDate(view.periodStart)} />
              <ViewField label="Period End" value={fmtDate(view.periodEnd)} />
              <ViewField label="Total Produced (L)" value={fmtNum(view.totalLitresProduced)} />
              <ViewField label="Total Sold (L)" value={fmtNum(view.totalLitresSold)} />
              <ViewField label="Tastings / Samples (L)" value={fmtNum(view.totalLitresTastings)} />
              <ViewField label="Duty Rate (£ / 100 L)" value={view.dutyRatePer100L ? `£${fmtNum(view.dutyRatePer100L, 2)}` : "—"} />
              <ViewField label="Total Duty Payable" value={view.totalDutyPayable ? `£${fmtNum(view.totalDutyPayable, 2)}` : "—"} />
              <ViewField label="Small Producer Relief" value={view.smallProducerRelief ? "Yes — SPR claimed" : "No"} />
              <ViewField label="Submitted Date" value={fmtDate(view.submittedDate)} />
              <ViewField label="Paid Date" value={fmtDate(view.paidDate)} />
              <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>
            </div>
            {typeof view.id === "number" && (
              <div className="border-t pt-3 mt-1">
                <RecordAttachments farmId={farmId} recordType="winery-excise-return" recordId={view.id} />
              </div>
            )}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Add"} Excise Return</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>HMRC Excise Ref</Label><Input value={String(form.hmrcExciseRef ?? "")} onChange={e => sf("hmrcExciseRef", e.target.value)} placeholder="e.g. WP123456" /></div>
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
            <div><Label>Period Start *</Label><Input type="date" value={String(form.periodStart ?? "")} onChange={e => sf("periodStart", e.target.value)} /></div>
            <div><Label>Period End *</Label><Input type="date" value={String(form.periodEnd ?? "")} onChange={e => sf("periodEnd", e.target.value)} /></div>
            <div><Label>Total Produced (L)</Label><Input type="number" value={String(form.totalLitresProduced ?? "")} onChange={e => sf("totalLitresProduced", e.target.value)} /></div>
            <div><Label>Total Sold (L)</Label><Input type="number" value={String(form.totalLitresSold ?? "")} onChange={e => sf("totalLitresSold", e.target.value)} /></div>
            <div><Label>Tastings / Samples (L)</Label><Input type="number" value={String(form.totalLitresTastings ?? "")} onChange={e => sf("totalLitresTastings", e.target.value)} placeholder="All tasting volumes are dutiable" /></div>
            <div><Label>Duty Rate (£ / 100 L)</Label><Input type="number" step="0.01" value={String(form.dutyRatePer100L ?? "")} onChange={e => sf("dutyRatePer100L", e.target.value)} /></div>
            <div><Label>Total Duty Payable (£)</Label><Input type="number" step="0.01" value={String(form.totalDutyPayable ?? "")} onChange={e => sf("totalDutyPayable", e.target.value)} /></div>
            <div><Label>Submitted Date</Label><Input type="date" value={String(form.submittedDate ?? "")} onChange={e => sf("submittedDate", e.target.value)} /></div>
            <div><Label>Paid Date</Label><Input type="date" value={String(form.paidDate ?? "")} onChange={e => sf("paidDate", e.target.value)} /></div>
            <div className="flex items-center gap-2 col-span-2"><Checkbox checked={!!form.smallProducerRelief} onCheckedChange={v => sf("smallProducerRelief", !!v)} id="spr" /><Label htmlFor="spr">Claiming Small Producer Relief (under 4,500 hl/year)</Label></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending || !form.periodStart || !form.periodEnd}>{(crud.add.isPending || crud.edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Winery: Tastings & Tours ────────────────────────────────────────────────────

const SESSION_TYPES: Record<string, string> = {
  tour: "Winery Tour",
  event: "Event / Open Day",
  trade_tasting: "Trade Tasting",
  private_tasting: "Private Tasting",
};

export function TastingsToursTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-tasting-sessions", "winery-tasting-sessions");
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const openAdd = () => { setEditing(null); setForm({ sessionDate: today }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm({ ...r }); setOpen(true); };
  const save = () => { if (editing !== null) crud.edit.mutate({ id: editing, ...form } as Record<string, unknown> & { id: number }); else crud.add.mutate(form); setOpen(false); };
  const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const rolling = crud.data.filter(r => r.sessionDate && new Date(r.sessionDate as string) >= oneYearAgo);
  const rolling12mVolumeL = rolling.reduce((s, r) => s + parseFloat(String(r.totalVolumeL ?? 0)), 0);
  const rolling12mVisitors = rolling.reduce((s, r) => s + (parseInt(String(r.visitorCount ?? 0)) || 0), 0);
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div><h3 className="font-semibold text-sm">Tastings & Tours Log</h3><p className="text-xs text-muted-foreground mt-0.5">Record all tour sessions, tastings, and events. Tasting volumes are dutiable and must be declared in excise duty returns.</p></div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Log Session</Button>
      </div>
      {crud.data.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Rolling 12M Sessions" value={rolling.length} />
          <StatCard label="Rolling 12M Visitors" value={rolling12mVisitors.toLocaleString()} />
          <StatCard label="Rolling 12M Tasting Volume" value={`${rolling12mVolumeL.toFixed(1)} L`} sub="Must be included in duty returns" color="amber" />
        </div>
      )}
      {crud.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "sessionDate", label: "Date", render: r => fmtDate(r.sessionDate) },
            { key: "sessionType", label: "Type", render: r => SESSION_TYPES[String(r.sessionType)] ?? fmt(r.sessionType) },
            { key: "sessionName", label: "Session" },
            { key: "visitorCount", label: "Visitors" },
            { key: "totalVolumeL", label: "Volume (L)", render: r => fmtNum(r.totalVolumeL) },
            { key: "revenueGbp", label: "Revenue", render: r => r.revenueGbp ? `£${fmtNum(r.revenueGbp, 2)}` : "—" },
            { key: "staffName", label: "Staff" },
          ]}
          rows={crud.data}
          onView={setView} onEdit={openEdit} onDelete={r => crud.remove.mutate(r.id as number)}
        />
      )}
      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent style={{ maxWidth: "40rem" }}>
            <DialogHeader><DialogTitle>Session — {fmtDate(view.sessionDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ViewField label="Date" value={fmtDate(view.sessionDate)} />
              <ViewField label="Type" value={SESSION_TYPES[String(view.sessionType)] ?? fmt(view.sessionType)} />
              <ViewField label="Session Name" value={fmt(view.sessionName)} />
              <ViewField label="Staff Name" value={fmt(view.staffName)} />
              <ViewField label="Visitor Count" value={fmt(view.visitorCount)} />
              <ViewField label="Wines Shown" value={fmt(view.winesShownCount)} />
              <ViewField label="Volume per Person (ml)" value={fmt(view.volumePerPersonMl)} />
              <ViewField label="Total Volume (L)" value={fmtNum(view.totalVolumeL)} />
              <ViewField label="Ticket Price" value={view.ticketPriceGbp ? `£${fmtNum(view.ticketPriceGbp, 2)}` : "—"} />
              <ViewField label="Revenue" value={view.revenueGbp ? `£${fmtNum(view.revenueGbp, 2)}` : "—"} />
              <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>
            </div>
            {typeof view.id === "number" && (
              <div className="border-t pt-3 mt-1">
                <RecordAttachments farmId={farmId} recordType="winery-tasting-session" recordId={view.id} />
              </div>
            )}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent style={{ maxWidth: "38rem" }}>
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Log"} Tasting Session</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date *</Label><Input type="date" value={String(form.sessionDate ?? "")} onChange={e => sf("sessionDate", e.target.value)} /></div>
            <div><Label>Session Type</Label>
              <Select value={String(form.sessionType ?? "")} onValueChange={v => sf("sessionType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{Object.entries(SESSION_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Session Name</Label><Input value={String(form.sessionName ?? "")} onChange={e => sf("sessionName", e.target.value)} placeholder="e.g. Saturday afternoon vineyard walk & tasting" /></div>
            <div><Label>Visitor Count</Label><Input type="number" value={String(form.visitorCount ?? "")} onChange={e => sf("visitorCount", e.target.value)} /></div>
            <div><Label>Wines Shown</Label><Input type="number" value={String(form.winesShownCount ?? "")} onChange={e => sf("winesShownCount", e.target.value)} /></div>
            <div><Label>Volume per Person (ml)</Label><Input type="number" value={String(form.volumePerPersonMl ?? "")} onChange={e => sf("volumePerPersonMl", e.target.value)} placeholder="e.g. 150" /></div>
            <div><Label>Total Volume (L)</Label><Input type="number" step="0.01" value={String(form.totalVolumeL ?? "")} onChange={e => sf("totalVolumeL", e.target.value)} /></div>
            <div><Label>Staff Name</Label><Input value={String(form.staffName ?? "")} onChange={e => sf("staffName", e.target.value)} /></div>
            <div><Label>Ticket Price (£)</Label><Input type="number" step="0.01" value={String(form.ticketPriceGbp ?? "")} onChange={e => sf("ticketPriceGbp", e.target.value)} /></div>
            <div><Label>Revenue (£)</Label><Input type="number" step="0.01" value={String(form.revenueGbp ?? "")} onChange={e => sf("revenueGbp", e.target.value)} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending || !form.sessionDate}>{(crud.add.isPending || crud.edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Winery: Age Verification — Challenge 25 ───────────────────────────────────

const UK_TRAINING_PROVIDERS = [
  "BIIAB Level 2 Award in Responsible Alcohol Retailing",
  "BIIAB Award for Personal Licence Holders (APLH)",
  "Highfield Level 2 Award in Responsible Alcohol Retailing",
  "Highfield Award for Personal Licence Holders",
  "Pearson BTEC Level 2 Award in Responsible Alcohol Retailing",
  "NCPLH (Pearson/EdExcel National Certificate for Personal Licence Holders)",
  "In-House Training Programme",
  "Online / eLearning (CPL Online, Inncentive, etc.)",
];

export function AgeVerificationTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-age-verification", "winery-age-verification");
  const { data: staffData, isLoading: staffLoading } = useQuery({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/staff`).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [providerOther, setProviderOther] = useState(false);

  const sf = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = (type: "training" | "refusal") => {
    setEditing(null);
    setForm({ recordType: type, recordDate: today, idRequested: false, idProduced: false, supervisorNotified: false });
    setProviderOther(false);
    setOpen(true);
  };
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    setForm({ ...r });
    const isKnown = UK_TRAINING_PROVIDERS.includes(r.trainingProvider as string);
    setProviderOther(!isKnown && !!r.trainingProvider);
    setOpen(true);
  };
  const save = () => {
    if (editing !== null) crud.edit.mutate({ id: editing, ...form } as Record<string, unknown> & { id: number });
    else crud.add.mutate(form);
    setOpen(false);
  };

  const now = new Date();
  const soon = new Date(); soon.setDate(soon.getDate() + 90);
  const trainings = crud.data.filter(r => r.recordType === "training");
  const refusals = crud.data.filter(r => r.recordType === "refusal");
  const expiredTraining = trainings.filter(r => r.trainingExpiryDate && new Date(r.trainingExpiryDate as string) < now);
  const expiringSoon = trainings.filter(r => {
    if (!r.trainingExpiryDate) return false;
    const d = new Date(r.trainingExpiryDate as string);
    return d >= now && d <= soon;
  });

  const expiryBadge = (r: Record<string, unknown>) => {
    if (!r.trainingExpiryDate) return null;
    const d = new Date(r.trainingExpiryDate as string);
    if (d < now) return <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5 font-medium shrink-0">Expired</span>;
    if (d <= soon) return <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium shrink-0">Expiring soon</span>;
    return <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-medium shrink-0">Active</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm">Age Verification — Challenge 25</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Staff training records and refusal log. Both are typically required by premises licence conditions and must be available for inspection.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => openAdd("refusal")}><Plus className="w-3.5 h-3.5 mr-1" />Log Refusal</Button>
          <Button size="sm" onClick={() => openAdd("training")}><Plus className="w-3.5 h-3.5 mr-1" />Add Training</Button>
        </div>
      </div>

      {expiredTraining.length > 0 && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <p><strong>Expired training:</strong> {expiredTraining.map(r => fmt(r.staffName)).join(", ")}. Renewal required before staff may sell alcohol unsupervised.</p>
        </div>
      )}
      {expiringSoon.length > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <p><strong>Training expiring within 90 days:</strong> {expiringSoon.map(r => fmt(r.staffName)).join(", ")}. Book renewal now to avoid a compliance gap.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Staff Trained" value={trainings.length} sub="Challenge 25 certificates on file" />
        <StatCard label="Refusals Logged" value={refusals.length} sub="Keep for licence review / inspection" />
      </div>

      {trainings.length > 0 && (
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="px-3 py-2 border-b bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Trained &amp; Certified Staff</p>
          </div>
          <ul>
            {trainings.map(r => (
              <li key={r.id as number} className="flex items-center justify-between gap-3 px-3 py-2.5 border-b last:border-0 hover:bg-muted/20">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{fmt(r.staffName)}</p>
                  <p className="text-xs text-muted-foreground truncate">{fmt(r.trainingProvider)}</p>
                </div>
                <div className="flex items-center gap-2 text-xs shrink-0">
                  {!!r.trainingExpiryDate && <span className="text-muted-foreground">Expires {fmtDate(r.trainingExpiryDate)}</span>}
                  {expiryBadge(r)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {crud.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "recordDate", label: "Date", render: r => fmtDate(r.recordDate) },
            { key: "recordType", label: "Type", render: r => r.recordType === "training"
              ? <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">Training</span>
              : <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">Refusal</span> },
            { key: "staffName", label: "Staff Name" },
            { key: "details", label: "Details", render: r => r.recordType === "training"
              ? <span className="text-xs text-muted-foreground">{fmt(r.trainingProvider)}{r.trainingExpiryDate ? ` — expires ${fmtDate(r.trainingExpiryDate)}` : ""}</span>
              : <span className="text-xs text-muted-foreground">Est. age {fmt(r.estimatedAge)} — ID {r.idProduced ? "produced" : "not produced"}</span> },
          ]}
          rows={crud.data}
          onView={setView} onEdit={openEdit} onDelete={r => crud.remove.mutate(r.id as number)}
        />
      )}

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent style={{ maxWidth: "40rem" }}>
            <DialogHeader>
              <DialogTitle>{view.recordType === "training" ? "Training Record" : "Refusal Record"} — {fmtDate(view.recordDate)}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ViewField label="Date" value={fmtDate(view.recordDate)} />
              <ViewField label="Staff Name" value={fmt(view.staffName)} />
              {view.recordType === "training" ? <>
                <div className="col-span-2"><ViewField label="Training Provider" value={fmt(view.trainingProvider)} /></div>
                <ViewField label="Certificate Ref" value={fmt(view.trainingCertificateRef)} />
                <ViewField label="Certificate Expiry" value={fmtDate(view.trainingExpiryDate)} />
              </> : <>
                <ViewField label="Refusal Location" value={fmt(view.refusalLocation)} />
                <ViewField label="Estimated Customer Age" value={fmt(view.estimatedAge)} />
                <ViewField label="ID Requested" value={view.idRequested ? "Yes" : "No"} />
                <ViewField label="ID Produced" value={view.idProduced ? "Yes" : "No"} />
                <ViewField label="Supervisor Notified" value={view.supervisorNotified ? "Yes" : "No"} />
              </>}
              <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>
            </div>
            {view.recordType === "training" && typeof view.id === "number" && (
              <div className="border-t pt-3 mt-1">
                <RecordAttachments farmId={farmId} recordType="age-verification-training" recordId={view.id} />
              </div>
            )}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader>
            <DialogTitle>{editing !== null ? "Edit Record" : form.recordType === "training" ? "Add Training Record" : "Log Refusal"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date *</Label><Input type="date" value={String(form.recordDate ?? "")} onChange={e => sf("recordDate", e.target.value)} /></div>
            <div>
              <Label>Staff Name</Label>
              <StaffSelect
                value={String(form.staffName ?? "")}
                onChange={v => sf("staffName", v)}
                staffNames={staffNames}
                loading={staffLoading}
              />
            </div>
            {form.recordType === "training" ? <>
              <div className="col-span-2">
                <Label>Training Provider</Label>
                <Select
                  value={providerOther ? "other" : String(form.trainingProvider ?? "")}
                  onValueChange={v => {
                    if (v === "other") { setProviderOther(true); sf("trainingProvider", ""); }
                    else { setProviderOther(false); sf("trainingProvider", v); }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Select accredited body…" /></SelectTrigger>
                  <SelectContent>
                    {UK_TRAINING_PROVIDERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    <SelectItem value="other">Other (specify below)</SelectItem>
                  </SelectContent>
                </Select>
                {providerOther && (
                  <Input
                    className="mt-1.5"
                    value={String(form.trainingProvider ?? "")}
                    onChange={e => sf("trainingProvider", e.target.value)}
                    placeholder="Enter training provider name…"
                  />
                )}
              </div>
              <div><Label>Certificate Reference</Label><Input value={String(form.trainingCertificateRef ?? "")} onChange={e => sf("trainingCertificateRef", e.target.value)} /></div>
              <div><Label>Certificate Expiry</Label><Input type="date" value={String(form.trainingExpiryDate ?? "")} onChange={e => sf("trainingExpiryDate", e.target.value)} /></div>
            </> : <>
              <div>
                <Label>Refusal Location</Label>
                <Select value={String(form.refusalLocation ?? "")} onValueChange={v => sf("refusalLocation", v)}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shop">Farm Shop</SelectItem>
                    <SelectItem value="tour">Winery Tour</SelectItem>
                    <SelectItem value="event">Event / Tasting</SelectItem>
                    <SelectItem value="cellar-door">Cellar Door</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Customer's Estimated Age</Label><Input type="number" value={String(form.estimatedAge ?? "")} onChange={e => sf("estimatedAge", e.target.value)} /></div>
              <div className="flex items-center gap-2"><Checkbox checked={!!form.idRequested} onCheckedChange={v => sf("idRequested", !!v)} id="idr" /><Label htmlFor="idr">ID Requested</Label></div>
              <div className="flex items-center gap-2"><Checkbox checked={!!form.idProduced} onCheckedChange={v => sf("idProduced", !!v)} id="idp" /><Label htmlFor="idp">ID Produced</Label></div>
              <div className="flex items-center gap-2 col-span-2"><Checkbox checked={!!form.supervisorNotified} onCheckedChange={v => sf("supervisorNotified", !!v)} id="sup" /><Label htmlFor="sup">Supervisor Notified</Label></div>
            </>}
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending || !form.recordDate}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Spray Diary Tab ──────────────────────────────────────────────────────────

const SPRAY_PRODUCT_TYPES = [
  "Fungicide", "Herbicide", "Insecticide", "Acaricide",
  "Growth Regulator", "Adjuvant / Spreader", "Biostimulant",
  "Nutritional Foliar", "Other",
];

const SPRAY_APPLICATION_METHODS = [
  "Knapsack Sprayer", "Tractor-mounted Boom Sprayer",
  "Air-blast / Vineyard Sprayer", "Lean-to / Facing Sprayer",
  "Drone Application", "Hand-held Lance", "Other",
];

export function SprayDiaryTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const crud = useCrud(farmId, "vineyard-spray-diary", "vineyard-spray-diary");
  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);
  const { data: productsData } = useQuery<{ records: { id: number; productName: string; mappaNumber: string | null; activeIngredient: string | null; category: string | null; harvestInterval: number | null }[] }>({
    queryKey: ["spray-products", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/spray-products`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const { data: certsData } = useQuery<{ records: { userId: string; certificateType: string; certificateNumber: string | null; issueDate: string }[] }>({
    queryKey: ["staff-certificates", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/certificates`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const sprayProducts = productsData?.records ?? [];
  const sprayTypes = useLookupStrings("spray_product_categories", SPRAY_PRODUCT_TYPES);
  const sprayMethods = useLookupStrings("vineyard_spray_application_methods", SPRAY_APPLICATION_METHODS);
  const rateUnits = useLookupStrings("vineyard_spray_rate_units", ["L/ha", "mL/ha", "kg/ha", "g/ha", "Other"]);
  const qtyUnits = useLookupStrings("vineyard_spray_quantity_units", ["L", "mL", "kg", "g", "Other"]);
  const weatherOptions = useLookupStrings("vineyard_weather_conditions", ["Clear and calm", "Overcast, dry, calm", "Light breeze (< 3 mph)", "Moderate breeze (3–5 mph)", "Other"]);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [editing, setEditing] = useState<number | null>(null);
  const [productLookupId, setProductLookupId] = useState<string>("");
  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const sfv = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const blockName = (id: unknown) => (blocks.find(b => b.id === id) as Record<string, unknown> | undefined)?.blockName ?? id;

  const handleProductLookup = (id: string) => {
    setProductLookupId(id);
    const p = sprayProducts.find(p => String(p.id) === id);
    if (p) {
      setForm(f => ({
        ...f,
        productName: p.productName,
        mappNumber: p.mappaNumber ?? f.mappNumber ?? "",
        activeIngredient: p.activeIngredient ?? f.activeIngredient ?? "",
        productType: p.category ?? f.productType ?? "",
        harvestIntervalDays: p.harvestInterval != null ? String(p.harvestInterval) : (f.harvestIntervalDays ?? ""),
      }));
    }
  };

  const PA_CERT_KEYWORDS = ["pa1", "pa2", "pa6", "nptc", "spray", "pesticide", "coshh", "basis", "city & guilds"];
  const handleOperatorChange = (name: string) => {
    sfv("operatorName", name);
    const member = (staffData?.staff ?? []).find(s => s.name === name);
    if (!member) return;
    const certs = (certsData?.records ?? [])
      .filter(c => c.userId === member.id && PA_CERT_KEYWORDS.some(kw => (c.certificateType ?? "").toLowerCase().includes(kw)))
      .sort((a, b) => (a.issueDate > b.issueDate ? -1 : 1));
    if (certs[0]?.certificateNumber) sfv("operatorCertificateNo", certs[0].certificateNumber);
  };

  const openAdd = () => { setEditing(null); setProductLookupId(""); setForm({ applicationDate: today }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setProductLookupId(""); setForm({ ...r }); setOpen(true); };
  const save = () => {
    if (editing !== null) crud.edit.mutate({ id: editing, ...form } as Record<string, unknown> & { id: number });
    else crud.add.mutate(form);
    setOpen(false);
  };

  const csvCols = [
    { key: "applicationDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.applicationDate) },
    { key: "blockId", label: "Block", fmt: (r: Record<string, unknown>) => String(blockName(r.blockId) ?? "") },
    { key: "productName", label: "Product Name" },
    { key: "mappNumber", label: "MAPP No." },
    { key: "productType", label: "Type" },
    { key: "ratePerHectare", label: "Rate/ha" },
    { key: "rateUnit", label: "Rate Unit" },
    { key: "areaTreatedHa", label: "Area (ha)" },
    { key: "operatorName", label: "Operator" },
    { key: "harvestIntervalDays", label: "Harvest Interval (days)" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm">Spray Diary</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Records must be completed within 48 hours of application and kept for 3 years (Plant Protection Products Regs 2011). Required for WineGB, Red Tractor, and cross-compliance audits.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="outline" onClick={() => exportCSV(crud.data, "spray-diary.csv", csvCols)} disabled={!crud.data.length}><FileDown className="w-4 h-4 mr-1" />CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Application</Button>
        </div>
      </div>
      {crud.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "applicationDate", label: "Date", render: r => fmtDate(r.applicationDate) },
            { key: "blockId", label: "Block", render: r => fmt(blockName(r.blockId)) },
            { key: "productName", label: "Product" },
            { key: "mappNumber", label: "MAPP No." },
            { key: "productType", label: "Type" },
            { key: "ratePerHectare", label: "Rate/ha", render: r => r.ratePerHectare ? `${fmtNum(r.ratePerHectare)} ${fmt(r.rateUnit)}` : "—" },
            { key: "areaTreatedHa", label: "Area (ha)", render: r => fmtNum(r.areaTreatedHa, 4) },
            { key: "operatorName", label: "Operator" },
          ]}
          rows={crud.data}
          onView={setView} onEdit={openEdit} onDelete={r => crud.remove.mutate(r.id as number)}
        />
      )}
      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent style={{ maxWidth: "42rem" }} className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Spray Application — {fmtDate(view.applicationDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <ViewField label="Date" value={fmtDate(view.applicationDate)} />
              <ViewField label="Block" value={fmt(blockName(view.blockId))} />
              <ViewField label="Product Name" value={fmt(view.productName)} />
              <ViewField label="MAPP Number" value={fmt(view.mappNumber)} />
              <ViewField label="Active Ingredient" value={fmt(view.activeIngredient)} />
              <ViewField label="Product Type" value={fmt(view.productType)} />
              <ViewField label="Rate per Hectare" value={view.ratePerHectare ? `${fmtNum(view.ratePerHectare)} ${fmt(view.rateUnit)}` : "—"} />
              <ViewField label="Total Quantity Applied" value={view.totalQuantityApplied ? `${fmtNum(view.totalQuantityApplied)} ${fmt(view.quantityUnit)}` : "—"} />
              <ViewField label="Area Treated (ha)" value={fmtNum(view.areaTreatedHa, 4)} />
              <ViewField label="Water Volume (L/ha)" value={fmt(view.waterVolumeLPerHa)} />
              <ViewField label="Application Method" value={fmt(view.applicationMethod)} />
              <ViewField label="Re-entry Period (hrs)" value={fmt(view.reentryPeriodHours)} />
              <ViewField label="Harvest Interval (days)" value={fmt(view.harvestIntervalDays)} />
              <ViewField label="Wind Speed (mph)" value={fmt(view.windSpeedMph)} />
              <ViewField label="Temperature (°C)" value={fmt(view.temperatureCelsius)} />
              <ViewField label="Weather Conditions" value={fmt(view.weatherConditions)} />
              <ViewField label="Operator" value={fmt(view.operatorName)} />
              <ViewField label="Operator Certificate No." value={fmt(view.operatorCertificateNo)} />
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            {typeof view.id === "number" && (
              <div className="border-t pt-3 mt-1">
                <RecordAttachments farmId={farmId} recordType="vineyard-spray-diary" recordId={view.id} />
              </div>
            )}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent style={{ maxWidth: "40rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Add"} Spray Application</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Application Date *</Label><Input type="date" max={today} value={String(form.applicationDate ?? "")} onChange={sf("applicationDate")} /></div>
            <div>
              <Label>Block</Label>
              <Select value={form.blockId ? String(form.blockId) : "__all__"} onValueChange={v => sfv("blockId", v === "__all__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="All blocks" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">— All blocks —</SelectItem>
                  {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String((b as Record<string, unknown>).blockName ?? b.id)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* ── Product lookup ── */}
            <div className="col-span-2">
              <Label>Product Register Lookup</Label>
              <Select value={productLookupId} onValueChange={handleProductLookup}>
                <SelectTrigger><SelectValue placeholder={sprayProducts.length ? "Select from product register to auto-fill…" : "No products in register — enter manually below"} /></SelectTrigger>
                <SelectContent>
                  {sprayProducts.map(p => <SelectItem key={String(p.id)} value={String(p.id)}>{p.productName}{p.activeIngredient ? ` — ${p.activeIngredient}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
              {sprayProducts.length === 0 && <p className="text-xs text-muted-foreground mt-1">Add products in <strong>Sprays &amp; Inputs → Products</strong> to enable auto-fill.</p>}
            </div>
            <div className="col-span-2">
              <Label>Product Name *</Label>
              <Input value={String(form.productName ?? "")} onChange={sf("productName")} placeholder="e.g. Amistar 250 SC" />
              {productLookupId && <p className="text-xs text-green-700 mt-1">Auto-filled from product register — edit if needed.</p>}
            </div>
            <div>
              <Label>MAPP Number</Label>
              <Input value={String(form.mappNumber ?? "")} onChange={sf("mappNumber")} placeholder="e.g. 12345" />
              {productLookupId && form.mappNumber && <p className="text-xs text-green-700 mt-1">From product register</p>}
            </div>
            <div>
              <Label>Active Ingredient</Label>
              <Input value={String(form.activeIngredient ?? "")} onChange={sf("activeIngredient")} placeholder="e.g. Azoxystrobin" />
              {productLookupId && form.activeIngredient && <p className="text-xs text-green-700 mt-1">From product register</p>}
            </div>
            <div>
              <Label>Product Type</Label>
              <Select value={String(form.productType ?? "")} onValueChange={v => sfv("productType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{sprayTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
              {productLookupId && form.productType && <p className="text-xs text-green-700 mt-1">From product register</p>}
            </div>
            <div>
              <Label>Application Method</Label>
              <Select value={String(form.applicationMethod ?? "")} onValueChange={v => sfv("applicationMethod", v)}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>{sprayMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Rate per Hectare</Label><Input type="number" step="0.001" value={String(form.ratePerHectare ?? "")} onChange={sf("ratePerHectare")} /></div>
            <div>
              <Label>Rate Unit</Label>
              <Select value={String(form.rateUnit ?? "")} onValueChange={v => sfv("rateUnit", v)}>
                <SelectTrigger><SelectValue placeholder="Select unit…" /></SelectTrigger>
                <SelectContent>{rateUnits.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Total Qty Applied</Label><Input type="number" step="0.001" value={String(form.totalQuantityApplied ?? "")} onChange={sf("totalQuantityApplied")} /></div>
            <div>
              <Label>Quantity Unit</Label>
              <Select value={String(form.quantityUnit ?? "")} onValueChange={v => sfv("quantityUnit", v)}>
                <SelectTrigger><SelectValue placeholder="Select unit…" /></SelectTrigger>
                <SelectContent>{qtyUnits.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Area Treated (ha)</Label><Input type="number" step="0.0001" value={String(form.areaTreatedHa ?? "")} onChange={sf("areaTreatedHa")} /></div>
            <div><Label>Water Volume (L/ha)</Label><Input type="number" value={String(form.waterVolumeLPerHa ?? "")} onChange={sf("waterVolumeLPerHa")} /></div>
            <div><Label>Re-entry Period (hrs)</Label><Input type="number" value={String(form.reentryPeriodHours ?? "")} onChange={sf("reentryPeriodHours")} /></div>
            <div>
              <Label>Harvest Interval (days)</Label>
              <Input type="number" value={String(form.harvestIntervalDays ?? "")} onChange={sf("harvestIntervalDays")} />
              {productLookupId && form.harvestIntervalDays && <p className="text-xs text-green-700 mt-1">From product register</p>}
            </div>
            <div><Label>Wind Speed (mph)</Label><Input type="number" step="0.1" value={String(form.windSpeedMph ?? "")} onChange={sf("windSpeedMph")} /></div>
            <div><Label>Temperature (°C)</Label><Input type="number" step="0.1" value={String(form.temperatureCelsius ?? "")} onChange={sf("temperatureCelsius")} /></div>
            <div className="col-span-2">
              <Label>Weather Conditions</Label>
              <Select value={String(form.weatherConditions ?? "")} onValueChange={v => sfv("weatherConditions", v)}>
                <SelectTrigger><SelectValue placeholder="Select conditions…" /></SelectTrigger>
                <SelectContent>{weatherOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Operator</Label>
              <StaffSelect value={String(form.operatorName ?? "")} onChange={handleOperatorChange} staffNames={staffNames} loading={staffLoading} />
            </div>
            <div>
              <Label>Operator Certificate No. (PA1/PA2/PA6)</Label>
              <Input value={String(form.operatorCertificateNo ?? "")} onChange={sf("operatorCertificateNo")} placeholder="e.g. PA6 — 12345" />
              {form.operatorName && form.operatorCertificateNo && staffNames.includes(String(form.operatorName)) && <p className="text-xs text-green-700 mt-1">Auto-filled from staff certificate record</p>}
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={sf("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending || !form.applicationDate || !form.productName}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Soil & Leaf Analysis Tab ──────────────────────────────────────────────────

type SoilSampleStatus = "pending_collection" | "collected" | "awaiting_results" | "complete";

const SOIL_ANALYSIS_TYPES = [
  "Soil Analysis", "Petiole (Leaf) Analysis", "Must Analysis", "Tissue Analysis",
];

const SAMPLE_STATUS_CONFIG: Record<SoilSampleStatus, { label: string; badge: string; step: number }> = {
  pending_collection: { label: "Awaiting Collection",  badge: "bg-amber-100 text-amber-800 border-amber-200",    step: 0 },
  collected:          { label: "Sample Collected",      badge: "bg-sky-100 text-sky-800 border-sky-200",          step: 1 },
  awaiting_results:   { label: "Awaiting Lab Results",  badge: "bg-purple-100 text-purple-800 border-purple-200", step: 2 },
  complete:           { label: "Results Received",      badge: "bg-green-100 text-green-800 border-green-200",    step: 3 },
};

const STEPPER_LABELS = ["Requested", "Collected", "Dispatched", "Results In"];

function SoilStepper({ status }: { status: string }) {
  const currentStep = SAMPLE_STATUS_CONFIG[status as SoilSampleStatus]?.step ?? 3;
  return (
    <div className="flex items-start gap-0 w-full mb-2">
      {STEPPER_LABELS.map((label, i) => (
        <div key={i} className="flex items-start flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
              i < currentStep
                ? "bg-green-500 border-green-500 text-white"
                : i === currentStep
                ? "bg-primary border-primary text-primary-foreground"
                : "bg-white border-muted-foreground/25 text-muted-foreground/40"
            }`}>
              {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : <span>{i + 1}</span>}
            </div>
            <span className={`text-[10px] font-medium text-center leading-tight ${i <= currentStep ? "text-foreground" : "text-muted-foreground/40"}`}>
              {label}
            </span>
          </div>
          {i < STEPPER_LABELS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mt-3.5 ${i < currentStep ? "bg-green-500" : "bg-muted-foreground/15"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function SoilAnalysisTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const { data: records, isLoading, add, edit, remove } = useCrud(farmId, "vineyard-soil-analysis", "vineyard-soil-analysis");
  const analysisTypes = useLookupStrings("vineyard_soil_analysis_types", SOIL_ANALYSIS_TYPES);
  const labOptions = useLookupStrings("vineyard_laboratories", ["NRM Group", "Lancrop Laboratories", "ADAS Analytical Services", "Eurofins Agro UK", "Other"]);

  type DialogMode = "request" | "collect" | "dispatch" | "results" | "view";
  const [mode, setMode] = useState<DialogMode | null>(null);
  const [active, setActive] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const sfv = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const blockName = (id: unknown) => (blocks.find(b => b.id === id) as Record<string, unknown> | undefined)?.blockName ?? id;

  const close = () => { setMode(null); setActive(null); setForm({}); };

  const awaitingCount = (records as Record<string, unknown>[]).filter(r => r.status === "awaiting_results").length;
  const pendingCount = (records as Record<string, unknown>[]).filter(r => r.status === "pending_collection").length;

  const openRequest = () => { setActive(null); setForm({ requestDate: today }); setMode("request"); };
  const openCollect = (r: Record<string, unknown>) => { setActive(r); setForm({ collectionDate: today }); setMode("collect"); };
  const openDispatch = (r: Record<string, unknown>) => {
    setActive(r);
    setForm({ dispatchDate: today, labName: r.labName ?? "", sampleReference: r.sampleReference ?? "" });
    setMode("dispatch");
  };
  const openResults = (r: Record<string, unknown>) => {
    setActive(r);
    setForm({
      resultsReceivedDate: r.resultsReceivedDate ?? today,
      analysisDate: r.analysisDate ?? today,
      ph: r.ph ?? "", organicMatterPct: r.organicMatterPct ?? "",
      phosphorusMgL: r.phosphorusMgL ?? "", potassiumMgL: r.potassiumMgL ?? "",
      magnesiumMgL: r.magnesiumMgL ?? "", calciumMgL: r.calciumMgL ?? "",
      ironMgL: r.ironMgL ?? "", manganeseMgL: r.manganeseMgL ?? "",
      boronMgL: r.boronMgL ?? "", nitrogenMgL: r.nitrogenMgL ?? "",
      sulphurMgL: r.sulphurMgL ?? "", cecCmolKg: r.cecCmolKg ?? "",
      recommendations: r.recommendations ?? "", notes: r.notes ?? "",
    });
    setMode("results");
  };
  const openView = (r: Record<string, unknown>) => { setActive(r); setMode("view"); };
  const openNextAction = (r: Record<string, unknown>) => {
    const s = (r.status as SoilSampleStatus) ?? "complete";
    if (s === "pending_collection") openCollect(r);
    else if (s === "collected") openDispatch(r);
    else openResults(r);
  };
  const nextActionLabel = (s: string) => {
    if (s === "pending_collection") return "Record Collection";
    if (s === "collected") return "Mark Dispatched";
    if (s === "awaiting_results") return "Enter Results";
    return "Edit Results";
  };

  const saveRequest = () => { add.mutate({ ...form, status: "pending_collection" } as any); close(); };
  const saveCollect = () => { edit.mutate({ id: active!.id as number, ...form, status: "collected" } as any); close(); };
  const saveDispatch = () => { edit.mutate({ id: active!.id as number, ...form, status: "awaiting_results" } as any); close(); };
  const saveResults = () => { edit.mutate({ id: active!.id as number, ...form, status: "complete" } as any); close(); };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm">Soil &amp; Leaf Analysis</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Multi-stage workflow: request a sample → field collection → dispatch to lab → record results. Attach lab report PDFs to completed records.
          </p>
        </div>
        <Button size="sm" onClick={openRequest} className="shrink-0">
          <Plus className="w-3.5 h-3.5 mr-1" />Request Analysis
        </Button>
      </div>

      {/* Status banners */}
      {(awaitingCount > 0 || pendingCount > 0) && (
        <div className="space-y-2">
          {awaitingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-purple-50 border border-purple-200 text-purple-800 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span><strong>{awaitingCount}</strong> sample{awaitingCount !== 1 ? "s" : ""} awaiting lab results — check for incoming reports.</span>
            </div>
          )}
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span><strong>{pendingCount}</strong> sample{pendingCount !== 1 ? "s" : ""} waiting to be collected from the field.</span>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "status", label: "Status", render: r => {
              const cfg = SAMPLE_STATUS_CONFIG[(r.status as SoilSampleStatus) ?? "complete"];
              return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${cfg?.badge ?? ""}`}>{cfg?.label ?? "—"}</span>;
            }},
            { key: "requestDate", label: "Requested", render: r => fmtDate(r.requestDate ?? r.analysisDate) },
            { key: "blockId", label: "Block", render: r => fmt(blockName(r.blockId)) },
            { key: "analysisType", label: "Type" },
            { key: "labName", label: "Lab" },
            { key: "analysisDate", label: "Results Date", render: r => r.status === "complete" ? fmtDate(r.analysisDate) : "—" },
            { key: "_action", label: "", render: r => {
              const s = (r.status as SoilSampleStatus) ?? "complete";
              return (
                <Button
                  size="sm"
                  variant={s === "complete" ? "ghost" : "outline"}
                  className={`h-7 text-xs whitespace-nowrap ${s !== "complete" ? "border-primary text-primary hover:bg-primary/5" : ""}`}
                  onClick={e => { e.stopPropagation(); openNextAction(r); }}
                >
                  {nextActionLabel(s)}<ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              );
            }},
          ]}
          rows={records}
          onView={openView}
          onDelete={r => remove.mutate(r.id as number)}
        />
      )}

      {/* ── Request Dialog ──────────────────────────────────────────── */}
      <Dialog open={mode === "request"} onOpenChange={o => !o && close()}>
        <DialogContent style={{ maxWidth: "32rem" }}>
          <DialogHeader>
            <DialogTitle>Request Soil / Leaf Analysis</DialogTitle>
            <DialogDescription>Raise a sample request — a field worker will collect the sample and it will be dispatched to the lab.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Request Date</Label><Input type="date" max={today} value={String(form.requestDate ?? today)} onChange={sf("requestDate")} /></div>
            <div>
              <Label>Block</Label>
              <Select value={form.blockId ? String(form.blockId) : "__none__"} onValueChange={v => sfv("blockId", v === "__none__" ? null : Number(v))}>
                <SelectTrigger><SelectValue placeholder="Select block" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None / Farm-wide —</SelectItem>
                  {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String((b as any).blockName ?? b.id)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Analysis Type *</Label>
              <Select value={String(form.analysisType ?? "")} onValueChange={v => sfv("analysisType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{analysisTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Requested By</Label><Input placeholder="Name of manager / agronomist" value={String(form.requestedBy ?? "")} onChange={sf("requestedBy")} /></div>
            <div className="col-span-2"><Label>Instructions for Collector</Label><Textarea placeholder="Where to sample, depth, method, any special notes…" value={String(form.notes ?? "")} onChange={sf("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveRequest} disabled={!form.analysisType || add.isPending}>
              {add.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Create Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Collect Dialog ──────────────────────────────────────────── */}
      <Dialog open={mode === "collect"} onOpenChange={o => !o && close()}>
        <DialogContent style={{ maxWidth: "32rem" }}>
          <DialogHeader>
            <DialogTitle>Record Sample Collection</DialogTitle>
            <DialogDescription>{active && <>{fmt(blockName(active.blockId))} — {fmt(active.analysisType)}</>}</DialogDescription>
          </DialogHeader>
          <SoilStepper status="pending_collection" />
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Collection Date *</Label><Input type="date" max={today} value={String(form.collectionDate ?? today)} onChange={sf("collectionDate")} /></div>
            <div><Label>Collected By *</Label><Input placeholder="Field worker name" value={String(form.collectedBy ?? "")} onChange={sf("collectedBy")} /></div>
            <div><Label>GPS Latitude</Label><Input type="number" step="any" placeholder="51.5074" value={String(form.collectionGpsLat ?? "")} onChange={sf("collectionGpsLat")} /></div>
            <div><Label>GPS Longitude</Label><Input type="number" step="any" placeholder="-1.2278" value={String(form.collectionGpsLng ?? "")} onChange={sf("collectionGpsLng")} /></div>
            <div className="col-span-2"><Label>Collection Notes</Label><Textarea placeholder="Exact location, sample depth, soil conditions…" value={String(form.collectionNotes ?? "")} onChange={sf("collectionNotes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveCollect} disabled={!form.collectionDate || !form.collectedBy || edit.isPending}>
              {edit.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Mark as Collected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dispatch Dialog ─────────────────────────────────────────── */}
      <Dialog open={mode === "dispatch"} onOpenChange={o => !o && close()}>
        <DialogContent style={{ maxWidth: "32rem" }}>
          <DialogHeader>
            <DialogTitle>Mark Sample as Dispatched to Lab</DialogTitle>
            <DialogDescription>{active && <>{fmt(blockName(active.blockId))} — collected {fmtDate(active.collectionDate)}</>}</DialogDescription>
          </DialogHeader>
          <SoilStepper status="collected" />
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Dispatch Date *</Label><Input type="date" max={today} value={String(form.dispatchDate ?? today)} onChange={sf("dispatchDate")} /></div>
            <div>
              <Label>Laboratory</Label>
              <Select value={String(form.labName ?? "")} onValueChange={v => sfv("labName", v)}>
                <SelectTrigger><SelectValue placeholder="Select laboratory" /></SelectTrigger>
                <SelectContent>{labOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Sample Reference / Barcode</Label><Input placeholder="Lab submission reference or barcode number" value={String(form.sampleReference ?? "")} onChange={sf("sampleReference")} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveDispatch} disabled={!form.dispatchDate || edit.isPending}>
              {edit.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Mark as Dispatched
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Results Dialog ──────────────────────────────────────────── */}
      <Dialog open={mode === "results"} onOpenChange={o => !o && close()}>
        <DialogContent style={{ maxWidth: "40rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{active?.status === "complete" ? "Edit Lab Results" : "Record Lab Results"}</DialogTitle>
            <DialogDescription>
              {active && <>{fmt(blockName(active.blockId))} — {fmt(active.analysisType)}{active.sampleReference ? ` · Ref: ${active.sampleReference}` : ""}</>}
            </DialogDescription>
          </DialogHeader>
          {active?.status !== "complete" && <SoilStepper status="awaiting_results" />}
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Results Received Date *</Label><Input type="date" max={today} value={String(form.resultsReceivedDate ?? today)} onChange={sf("resultsReceivedDate")} /></div>
            <div><Label>Analysis Date (on report)</Label><Input type="date" max={today} value={String(form.analysisDate ?? today)} onChange={sf("analysisDate")} /></div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide col-span-2 pt-1">Nutrient Values</p>
            <div><Label>pH</Label><Input type="number" step="0.01" value={String(form.ph ?? "")} onChange={sf("ph")} /></div>
            <div><Label>Organic Matter (%)</Label><Input type="number" step="0.01" value={String(form.organicMatterPct ?? "")} onChange={sf("organicMatterPct")} /></div>
            <div><Label>Phosphorus — P (mg/L)</Label><Input type="number" step="0.1" value={String(form.phosphorusMgL ?? "")} onChange={sf("phosphorusMgL")} /></div>
            <div><Label>Potassium — K (mg/L)</Label><Input type="number" step="0.1" value={String(form.potassiumMgL ?? "")} onChange={sf("potassiumMgL")} /></div>
            <div><Label>Magnesium — Mg (mg/L)</Label><Input type="number" step="0.1" value={String(form.magnesiumMgL ?? "")} onChange={sf("magnesiumMgL")} /></div>
            <div><Label>Calcium — Ca (mg/L)</Label><Input type="number" step="0.1" value={String(form.calciumMgL ?? "")} onChange={sf("calciumMgL")} /></div>
            <div><Label>Iron — Fe (mg/L)</Label><Input type="number" step="0.1" value={String(form.ironMgL ?? "")} onChange={sf("ironMgL")} /></div>
            <div><Label>Manganese — Mn (mg/L)</Label><Input type="number" step="0.1" value={String(form.manganeseMgL ?? "")} onChange={sf("manganeseMgL")} /></div>
            <div><Label>Boron — B (mg/L)</Label><Input type="number" step="0.1" value={String(form.boronMgL ?? "")} onChange={sf("boronMgL")} /></div>
            <div><Label>Nitrogen — N (mg/L)</Label><Input type="number" step="0.1" value={String(form.nitrogenMgL ?? "")} onChange={sf("nitrogenMgL")} /></div>
            <div><Label>Sulphur — S (mg/L)</Label><Input type="number" step="0.1" value={String(form.sulphurMgL ?? "")} onChange={sf("sulphurMgL")} /></div>
            <div><Label>CEC (cmol/kg)</Label><Input type="number" step="0.01" value={String(form.cecCmolKg ?? "")} onChange={sf("cecCmolKg")} /></div>
            <div className="col-span-2"><Label>Lab Recommendations</Label><Textarea value={String(form.recommendations ?? "")} onChange={sf("recommendations")} rows={2} placeholder="Recommendations from the lab report" /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={sf("notes")} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button onClick={saveResults} disabled={!form.resultsReceivedDate || edit.isPending}>
              {edit.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {active?.status === "complete" ? "Save Changes" : "Save Results"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Dialog ─────────────────────────────────────────────── */}
      {active && mode === "view" && (
        <Dialog open onOpenChange={close}>
          <DialogContent style={{ maxWidth: "44rem" }} className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{fmt(blockName(active.blockId))} — {fmt(active.analysisType)}</DialogTitle>
            </DialogHeader>
            <SoilStepper status={(active.status as string) ?? "complete"} />

            <div className="space-y-4 text-sm">
              {/* Stage 1: Request */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sample Request</p>
                <div className="grid grid-cols-2 gap-3">
                  <ViewField label="Requested On" value={fmtDate(active.requestDate ?? active.analysisDate)} />
                  <ViewField label="Requested By" value={fmt(active.requestedBy)} />
                  <ViewField label="Block" value={fmt(blockName(active.blockId))} />
                  <ViewField label="Analysis Type" value={fmt(active.analysisType)} />
                  {!!active.notes && <div className="col-span-2"><ViewField label="Instructions" value={fmt(active.notes)} /></div>}
                </div>
              </div>

              {/* Stage 2: Collection */}
              {["collected", "awaiting_results", "complete"].includes(active.status as string) && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sample Collection</p>
                  <div className="grid grid-cols-2 gap-3">
                    <ViewField label="Collected On" value={fmtDate(active.collectionDate)} />
                    <ViewField label="Collected By" value={fmt(active.collectedBy)} />
                    {!!(active.collectionGpsLat || active.collectionGpsLng) && (
                      <ViewField label="GPS Coordinates" value={`${fmt(active.collectionGpsLat)}, ${fmt(active.collectionGpsLng)}`} />
                    )}
                    {!!active.collectionNotes && <div className="col-span-2"><ViewField label="Collection Notes" value={fmt(active.collectionNotes)} /></div>}
                  </div>
                </div>
              )}

              {/* Stage 3: Dispatch */}
              {["awaiting_results", "complete"].includes(active.status as string) && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Dispatch to Lab</p>
                  <div className="grid grid-cols-2 gap-3">
                    <ViewField label="Dispatched On" value={fmtDate(active.dispatchDate)} />
                    <ViewField label="Laboratory" value={fmt(active.labName)} />
                    <ViewField label="Sample Reference" value={fmt(active.sampleReference)} />
                  </div>
                </div>
              )}

              {/* Stage 4: Results */}
              {active.status === "complete" && (
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lab Results</p>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { close(); setTimeout(() => openResults(active), 80); }}>
                      <Pencil className="w-3 h-3 mr-1" />Edit Results
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <ViewField label="Results Received" value={fmtDate(active.resultsReceivedDate ?? active.analysisDate)} />
                    <ViewField label="Analysis Date" value={fmtDate(active.analysisDate)} />
                    <ViewField label="pH" value={fmtNum(active.ph, 2)} />
                    <ViewField label="Organic Matter (%)" value={fmtNum(active.organicMatterPct, 2)} />
                    <ViewField label="Phosphorus — P (mg/L)" value={fmtNum(active.phosphorusMgL)} />
                    <ViewField label="Potassium — K (mg/L)" value={fmtNum(active.potassiumMgL)} />
                    <ViewField label="Magnesium — Mg (mg/L)" value={fmtNum(active.magnesiumMgL)} />
                    <ViewField label="Calcium — Ca (mg/L)" value={fmtNum(active.calciumMgL)} />
                    <ViewField label="Iron — Fe (mg/L)" value={fmtNum(active.ironMgL)} />
                    <ViewField label="Manganese — Mn (mg/L)" value={fmtNum(active.manganeseMgL)} />
                    <ViewField label="Boron — B (mg/L)" value={fmtNum(active.boronMgL)} />
                    <ViewField label="Nitrogen — N (mg/L)" value={fmtNum(active.nitrogenMgL)} />
                    <ViewField label="Sulphur — S (mg/L)" value={fmtNum(active.sulphurMgL)} />
                    <ViewField label="CEC (cmol/kg)" value={fmtNum(active.cecCmolKg, 2)} />
                    {!!active.recommendations && <div className="col-span-2"><ViewField label="Lab Recommendations" value={fmt(active.recommendations)} /></div>}
                  </div>
                </div>
              )}

              {/* Advance action for non-complete records */}
              {active.status !== "complete" && (
                <div className="border-t pt-3 flex justify-end">
                  <Button onClick={() => { close(); setTimeout(() => openNextAction(active), 80); }}>
                    <ChevronRight className="w-4 h-4 mr-1" />{nextActionLabel(active.status as string)}
                  </Button>
                </div>
              )}
            </div>

            {typeof active.id === "number" && (
              <div className="border-t pt-3 mt-1">
                <RecordAttachments farmId={farmId} recordType="vineyard-soil-analysis" recordId={active.id} />
              </div>
            )}
            <DialogFooter><Button variant="outline" onClick={close}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
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
  { id: "licensing", label: "Licensing", icon: FileText },
  { id: "excise", label: "Excise & Duty", icon: Receipt },
  { id: "tours", label: "Tastings & Tours", icon: CalendarCheck },
  { id: "age-check", label: "Age Verification", icon: ShieldCheck },
  { id: "wine-production", label: "Wine Production", icon: Wine },
  { id: "spray-diary", label: "Spray Diary", icon: Droplet },
  { id: "soil-analysis", label: "Soil & Leaf Analysis", icon: FlaskConical },
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
          {tab === "licensing" && <LicensingTab farmId={selectedFarmId} />}
          {tab === "excise" && <ExciseDutyTab farmId={selectedFarmId} />}
          {tab === "tours" && <TastingsToursTab farmId={selectedFarmId} />}
          {tab === "age-check" && <AgeVerificationTab farmId={selectedFarmId} />}
          {tab === "wine-production" && <WineProductionTab farmId={selectedFarmId} />}
          {tab === "spray-diary" && <SprayDiaryTab farmId={selectedFarmId} blocks={blocks.data} />}
          {tab === "soil-analysis" && <SoilAnalysisTab farmId={selectedFarmId} blocks={blocks.data} />}
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
