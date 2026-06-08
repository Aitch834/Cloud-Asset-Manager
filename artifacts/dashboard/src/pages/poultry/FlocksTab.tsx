// @ts-nocheck
import { type ReactNode, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");

function useCrud<T extends Record<string, unknown>>(farmId: number, endpoint: string, key: string) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const { data = [], isLoading } = useQuery({ queryKey: [key, farmId], queryFn: () => fetch(api(`farms/${farmId}/${endpoint}`), { credentials: "include" }).then(r => r.json()) });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/${endpoint}/${editing.id}`) : api(`farms/${farmId}/${endpoint}`);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: [key, farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: [key, farmId] }) });
  function openAdd(defaults: Record<string, unknown> = {}) { setEditing(null); setForm(defaults); setOpen(true); }
  function openEdit(r: T) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""]))); setOpen(true); }
  return { data, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit };
}

const POULTRY_SPECIES = [
  "Broiler (Meat Chicken)",
  "Layer (Laying Hen)",
  "Turkey",
  "Duck",
  "Goose",
  "Guinea Fowl",
  "Pheasant / Game Bird",
  "Mixed / Other",
];

const PRODUCTION_SYSTEMS = [
  "Conventional",
  "Barn",
  "Free Range",
  "Organic",
  "RSPCA Assured",
  "Higher Welfare",
  "Label Rouge",
];

const SPECIES_LABEL_MAP: Record<string, string> = {
  broiler_chicken: "Broiler (Meat Chicken)",
  broiler: "Broiler (Meat Chicken)",
  meat_chicken: "Broiler (Meat Chicken)",
  layer_hen: "Layer (Laying Hen)",
  layer: "Layer (Laying Hen)",
  laying_hen: "Layer (Laying Hen)",
  turkey: "Turkey",
  duck: "Duck",
  goose: "Goose",
  guinea_fowl: "Guinea Fowl",
  pheasant: "Pheasant / Game Bird",
  game_bird: "Pheasant / Game Bird",
  mixed: "Mixed / Other",
  other: "Mixed / Other",
};

const SYSTEM_LABEL_MAP: Record<string, string> = {
  indoor_intensive: "Conventional",
  conventional: "Conventional",
  barn: "Barn",
  free_range: "Free Range",
  organic: "Organic",
  rspca_assured: "RSPCA Assured",
  rspca: "RSPCA Assured",
  higher_welfare: "Higher Welfare",
  label_rouge: "Label Rouge",
};

function fmtSpecies(v: unknown): string {
  if (!v || v === "") return "—";
  const s = String(v);
  if (POULTRY_SPECIES.includes(s)) return s;
  return SPECIES_LABEL_MAP[s] ?? SPECIES_LABEL_MAP[s.toLowerCase()] ?? s;
}

function fmtSystem(v: unknown): string {
  if (!v || v === "") return "—";
  const s = String(v);
  if (PRODUCTION_SYSTEMS.includes(s)) return s;
  return SYSTEM_LABEL_MAP[s] ?? SYSTEM_LABEL_MAP[s.toLowerCase()] ?? s;
}

function Empty({ msg }: { msg: string }) {
  return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>;
}

function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: {
  open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive";
}) {
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onCancel(); }}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{message}</p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DataTable({ cols, rows, onEdit, onDelete, onView }: {
  cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string; render?: (r: Record<string, unknown>) => ReactNode }[];
  rows: Record<string, unknown>[];
  onEdit?: (r: Record<string, unknown>) => void;
  onDelete?: (r: Record<string, unknown>) => void;
  onView?: (r: Record<string, unknown>) => void;
}) {
  const [pendingDelete, setPendingDelete] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet. Add one using the button above." />;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete || onView) && <th />}</tr></thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.render ? c.render(row) : c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
              {(onEdit || onDelete || onView) && (
                <td className="py-2 text-right space-x-1">
                  {onView && <Button size="icon" variant="ghost" onClick={() => onView(row)}><Eye className="w-3.5 h-3.5" /></Button>}
                  {onEdit && <Button size="icon" variant="ghost" onClick={() => onEdit(row)}><Pencil className="w-3.5 h-3.5" /></Button>}
                  {onDelete && <Button size="icon" variant="ghost" onClick={() => setPendingDelete(row)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>}
                </td>
              )}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete Record"
        message="Are you sure you want to delete this record? This cannot be undone."
        onConfirm={() => { if (pendingDelete && onDelete) { onDelete(pendingDelete); } setPendingDelete(null); }}
        onCancel={() => setPendingDelete(null)}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}

export function FlocksTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const { data: houses = [] } = useQuery({ queryKey: ["poultry-houses", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-houses`), { credentials: "include" }).then(r => r.json()) });
  const { data: herds = [] } = useQuery({ queryKey: ["herds", farmId], queryFn: () => fetch(api(`farms/${farmId}/herds`), { credentials: "include" }).then(r => r.json()).then(d => (Array.isArray(d) ? d : Array.isArray(d?.records) ? d.records : []).filter((h: any) => { const t = String(h.type ?? "").toLowerCase(); return ["poultry", "chicken", "turkey", "broiler", "layer", "hen", "duck", "goose"].some(k => t.includes(k)); })).catch(() => []) });
  const { data: raw, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "poultry-flocks", "poultry-flocks");
  const flocks: any[] = Array.isArray(raw) ? (raw as { flock: Record<string, unknown>; houseName: string | null }[]).map(r => ({ ...r.flock, houseName: r.houseName })) : [];
  const [statusFilter, setStatusFilter] = useState("active");
  const filteredFlocks = statusFilter === "all" ? flocks : flocks.filter(f => statusFilter === "active" ? String(f.status ?? "").toLowerCase() !== "depleted" : String(f.status ?? "").toLowerCase() === "depleted");
  const houseList = houses as Record<string, unknown>[];
  const selectedHouse = houseList.find(h => String(h.id) === String(form.houseId)) ?? null;

  const { data: hatcherySuppData = [] } = useQuery({
    queryKey: ["suppliers", farmId, "hatchery"],
    queryFn: () => fetch(api(`farms/${farmId}/suppliers`), { credentials: "include" }).then(r => r.json()).catch(() => []),
  });
  const hatcherySuppliers = (Array.isArray(hatcherySuppData) ? hatcherySuppData as Record<string, unknown>[] : []).filter(s => s.supplierType === "hatchery");

  const speciesMismatch = selectedHouse && form.species && fmtSpecies(String(form.species)) !== fmtSpecies(String(selectedHouse.species ?? ""));
  const systemMismatch = selectedHouse && form.productionSystem && fmtSystem(String(form.productionSystem)) !== fmtSystem(String(selectedHouse.productionSystem ?? ""));

  function selectHouse(houseId: string) {
    const h = houseList.find(x => String(x.id) === houseId);
    setForm(f => ({
      ...f,
      houseId,
      species: h ? String(h.species ?? f.species) : f.species,
      productionSystem: h ? String(h.productionSystem ?? f.productionSystem) : f.productionSystem,
    }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-semibold text-sm">Flock Register <span className="text-muted-foreground font-normal">({filteredFlocks.length})</span></h3>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active flocks</SelectItem>
              <SelectItem value="depleted">Depleted</SelectItem>
              <SelectItem value="all">All flocks</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => openAdd()}><Plus className="w-4 h-4 mr-1" />Add Flock</Button>
        </div>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "flockNumber", label: "Flock No." },
        { key: "houseName", label: "House" },
        { key: "species", label: "Species", fmt: (r: Record<string, unknown>) => fmtSpecies(r.species) },
        { key: "productionSystem", label: "System", fmt: (r: Record<string, unknown>) => fmtSystem(r.productionSystem) },
        { key: "placementDate", label: "Placed", fmt: r => fmtDate(r.placementDate) },
        { key: "placementCount", label: "Placed" },
        { key: "status", label: "Status" },
      ]} rows={filteredFlocks as Record<string, unknown>[]} onEdit={r => openEdit(r as Record<string, unknown>)} onDelete={r => del.mutate(r.id as number)} onView={setViewRecord} />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Flock — {String(viewRecord.flockNumber ?? "—")}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock Number</p><p className="font-medium">{String(viewRecord.flockNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">House</p><p className="font-medium">{String(viewRecord.houseName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Species</p><p className="font-medium">{fmtSpecies(viewRecord.species)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Production System</p><p className="font-medium">{fmtSystem(viewRecord.productionSystem)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Placement Date</p><p className="font-medium">{fmtDate(viewRecord.placementDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Placement Count (birds)</p><p className="font-medium">{String(viewRecord.placementCount ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Breed / Strain</p><p className="font-medium">{String(viewRecord.breed ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Hatchery Name</p><p className="font-medium">{String(viewRecord.hatcheryName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Hatchery Approval No.</p><p className="font-medium">{String(viewRecord.hatcheryApprovalNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium capitalize">{String(viewRecord.status ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>Flock Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Linked Herd (Livestock Register)</Label>
              <Select value={String(form.herdId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, herdId: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Link to a registered herd..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Not linked —</SelectItem>
                  {(herds as Record<string, unknown>[]).map(h => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.name ?? "")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Flock Number *</Label><Input value={String(form.flockNumber ?? "")} onChange={e => setForm(f => ({ ...f, flockNumber: e.target.value }))} /></div>
            <div>
              <Label>House</Label>
              <Select value={String(form.houseId ?? "")} onValueChange={selectHouse}>
                <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                <SelectContent>{houseList.map(h => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.houseName)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Species *</Label>
              {selectedHouse && !speciesMismatch && (
                <p className="text-xs text-muted-foreground mb-1">Inherited from house — override only if intentional</p>
              )}
              {speciesMismatch && (
                <p className="text-xs text-amber-600 mb-1">⚠ Differs from house species ({String(selectedHouse!.species)})</p>
              )}
              <Select value={String(form.species ?? "")} onValueChange={v => setForm(f => ({ ...f, species: v }))}>
                <SelectTrigger className={speciesMismatch ? "border-amber-400" : ""}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{POULTRY_SPECIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Production System *</Label>
              {selectedHouse && !systemMismatch && (
                <p className="text-xs text-muted-foreground mb-1">Inherited from house — override only if intentional</p>
              )}
              {systemMismatch && (
                <p className="text-xs text-amber-600 mb-1">⚠ Differs from house system ({String(selectedHouse!.productionSystem)})</p>
              )}
              <Select value={String(form.productionSystem ?? "")} onValueChange={v => setForm(f => ({ ...f, productionSystem: v }))}>
                <SelectTrigger className={systemMismatch ? "border-amber-400" : ""}><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{PRODUCTION_SYSTEMS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Placement Date *</Label><Input type="date" value={String(form.placementDate ?? "")} onChange={e => setForm(f => ({ ...f, placementDate: e.target.value }))} /></div>
            <div><Label>Placement Count *</Label><Input type="number" min="1" step="1" value={String(form.placementCount ?? "")} onChange={e => setForm(f => ({ ...f, placementCount: e.target.value }))} /></div>
            <div><Label>Breed / Strain</Label><Input value={String(form.breed ?? "")} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} /></div>
            <div className="col-span-2">
              <Label>Hatchery / Chick Supplier</Label>
              <Select value={String(form._hatcherySuppId ?? "__none__")} onValueChange={v => {
                if (v === "__none__") { setForm(f => ({ ...f, _hatcherySuppId: "" })); return; }
                const s = hatcherySuppliers.find(h => String(h.id) === v);
                setForm(f => ({ ...f, _hatcherySuppId: v, hatcheryName: s ? String(s.name ?? f.hatcheryName) : f.hatcheryName, hatcheryApprovalNumber: f.hatcheryApprovalNumber || String(s?.accountNumber ?? "") }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select from registered hatcheries..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Not in list / type manually below —</SelectItem>
                  {hatcherySuppliers.map(s => <SelectItem key={String(s.id)} value={String(s.id)}>{String(s.name ?? "")}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">Or type hatchery details manually:</p>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div><Label>Hatchery Name</Label><Input value={String(form.hatcheryName ?? "")} onChange={e => setForm(f => ({ ...f, hatcheryName: e.target.value }))} /></div>
                <div><Label>Hatchery Approval No.</Label><Input value={String(form.hatcheryApprovalNumber ?? "")} onChange={e => setForm(f => ({ ...f, hatcheryApprovalNumber: e.target.value }))} /></div>
              </div>
            </div>
            <div><Label>Status</Label>
              <Select value={String(form.status ?? "active")} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["active", "depleted", "thinned", "sold"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FlocksTab;
