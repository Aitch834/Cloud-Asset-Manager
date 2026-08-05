// @ts-nocheck
import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sanitiseCsvCell } from "@/lib/csv";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Eye, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiUrl as api } from "@/lib/api";

export const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));

export const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");

export function exportCSV(rows: Record<string, unknown>[], filename: string, cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string }[]) {
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

export function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: "red" | "amber" | "green" }) {
  const cls = color === "red" ? "text-red-600" : color === "amber" ? "text-amber-600" : color === "green" ? "text-green-700" : "text-foreground";
  return (
    <div className="bg-white rounded-lg border p-3 space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold ${cls}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Empty({ msg }: { msg: string }) { return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>; }

export function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive" }) {
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

export function DataTable({ cols, rows, onEdit, onDelete, onView, onQr }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string; render?: (r: Record<string, unknown>) => ReactNode }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void; onView?: (r: Record<string, unknown>) => void; onQr?: (r: Record<string, unknown>) => void }) {
  const [pendingDelete, setPendingDelete] = useState<Record<string, unknown> | null>(null);
  if (!rows.length) return <Empty msg="No records yet. Add one using the button above." />;
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{cols.map(c => <th key={c.key} className="text-left py-2 pr-4 font-medium text-muted-foreground">{c.label}</th>)}{(onEdit || onDelete || onView || onQr) && <th />}</tr></thead>
          <tbody>{rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {cols.map(c => <td key={c.key} className="py-2 pr-4">{c.render ? c.render(row) : c.fmt ? c.fmt(row) : fmt(row[c.key])}</td>)}
              {(onEdit || onDelete || onView || onQr) && (
                <td className="py-2 text-right space-x-1">
                  {onQr && <Button size="icon" variant="ghost" title="Print QR Label" onClick={() => onQr(row)}><QrCode className="w-3.5 h-3.5 text-teal-600" /></Button>}
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


export function useCrud<T extends Record<string, unknown>>(farmId: number, endpoint: string, key: string) {
  const qc = useQueryClient();
  const { toast } = useToast();
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
    onError: () => toast({ title: "Save failed", variant: "destructive" }),
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/${endpoint}/${id}`), { method: "DELETE", credentials: "include" }).then(async r => { if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(t || `Request failed (${r.status})`); } return r; }), onSuccess: () => qc.invalidateQueries({ queryKey: [key, farmId] }), onError: () => toast({ title: "Delete failed", variant: "destructive" }) });
  function openAdd(defaults: Record<string, unknown> = {}) { setEditing(null); setForm(defaults); setOpen(true); }
  function openEdit(r: T) { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v ?? ""]))); setOpen(true); }
  return { data, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit };
}


export const HOUSE_TYPES = [
  "Controlled Environment (Dark-out)",
  "Naturally Lit House",
  "Free Range Building (with range access)",
  "Deep Litter House",
  "Aviary System",
  "Cage System",
  "Open-sided / Naturally Ventilated",
  "Breeding / Parent Stock House",
  "Rearing / Grower House",
  "Mobile Unit / Arks",
  "Multi-purpose",
];

export const POULTRY_SPECIES = [
  "Broiler (Meat Chicken)",
  "Layer (Laying Hen)",
  "Turkey",
  "Duck",
  "Goose",
  "Guinea Fowl",
  "Pheasant / Game Bird",
  "Mixed / Other",
];

export const PRODUCTION_SYSTEMS = [
  "Conventional",
  "Barn",
  "Free Range",
  "Organic",
  "RSPCA Assured",
  "Higher Welfare",
  "Label Rouge",
];

export const SPECIES_LABEL_MAP: Record<string, string> = {
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
export const SYSTEM_LABEL_MAP: Record<string, string> = {
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

export function fmtSpecies(v: unknown): string {
  if (!v || v === "") return "—";
  const s = String(v);
  if (POULTRY_SPECIES.includes(s)) return s;
  return SPECIES_LABEL_MAP[s] ?? SPECIES_LABEL_MAP[s.toLowerCase()] ?? s;
}

export function fmtSystem(v: unknown): string {
  if (!v || v === "") return "—";
  const s = String(v);
  if (PRODUCTION_SYSTEMS.includes(s)) return s;
  return SYSTEM_LABEL_MAP[s] ?? SYSTEM_LABEL_MAP[s.toLowerCase()] ?? s;
}


export type DensityInfo = {
  schemeUnit: "birds/m²" | "kg/m²";
  schemeLimit: number;
  typicalLiveWeightKg?: number;
  source: string;
};


export function getStockingDensityInfo(species: string, productionSystem: string): DensityInfo | null {
  const s = species.toLowerCase();
  const p = productionSystem.toLowerCase();
  if (s.includes("layer") || s.includes("laying")) {
    if (p.includes("organic")) return { schemeUnit: "birds/m²", schemeLimit: 6, source: "Organic (Soil Association / OF&G)" };
    return { schemeUnit: "birds/m²", schemeLimit: 9, source: "Red Tractor / Barn / Free Range standard" };
  }
  if (s.includes("broiler") || s.includes("meat chicken")) {
    let lim = 33; let src = "Red Tractor standard";
    if (p.includes("organic")) { lim = 21; src = "Organic standard"; }
    else if (p.includes("free range")) { lim = 25; src = "Free Range standard"; }
    else if (p.includes("rspca") || p.includes("higher welfare")) { lim = 30; src = "RSPCA Assured / Higher Welfare standard"; }
    return { schemeUnit: "kg/m²", schemeLimit: lim, typicalLiveWeightKg: 2.2, source: src };
  }
  if (s.includes("turkey")) {
    const lim = p.includes("rspca") ? 40 : 50;
    return { schemeUnit: "kg/m²", schemeLimit: lim, typicalLiveWeightKg: 12, source: p.includes("rspca") ? "RSPCA Assured" : "Red Tractor Turkey standard" };
  }
  if (s.includes("duck")) {
    return { schemeUnit: "kg/m²", schemeLimit: 25, typicalLiveWeightKg: 3, source: "Duck production standard" };
  }
  return null;
}


export function useFlocks(farmId: number) {
  const { data: rawFlocks } = useQuery({ queryKey: ["poultry-flocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()) });
  return Array.isArray(rawFlocks) ? (rawFlocks as { flock: Record<string, unknown>; houseName: string | null }[]).map(r => ({ ...r.flock, houseName: r.houseName })) : [];
}


export function FlockSelect({ flocks, value, onChange }: { flocks: Record<string, unknown>[]; value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value || "__none__"} onValueChange={v => onChange(v === "__none__" ? "" : v)}>
      <SelectTrigger><SelectValue placeholder="Select flock" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">— Select flock —</SelectItem>
        {flocks.map(f => (
          <SelectItem key={String(f.id)} value={String(f.id)}>
            {String(f.flockNumber ?? f.id)}{f.houseName ? ` — ${f.houseName}` : ""}{f.species ? ` (${f.species})` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


export function fmtFlock(r: Record<string, unknown>): string {
  if (r.flockNumber) return String(r.flockNumber) + (r.houseName ? ` · ${r.houseName}` : "");
  return r.flockId ? String(r.flockId) : "—";
}

