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
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { Redirect } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { useFarmMembers } from "@/hooks/use-farm-members";
import { StaffSelect } from "@/components/ui/staff-select";
import { BuyerCombobox } from "@/components/sales/BuyerCombobox";
import { FlocksTab } from "./poultry/FlocksTab";
import { PoultryFlockReport } from "@/components/PoultryFlockReport";

const api = (path: string) => `/api/${path}`;
const fmt = (v: unknown) => (v == null || v === "" ? "—" : String(v));
const fmtDate = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("en-GB") : "—");
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
function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: "red" | "amber" | "green" }) {
  const cls = color === "red" ? "text-red-600" : color === "amber" ? "text-amber-600" : color === "green" ? "text-green-700" : "text-foreground";
  return (
    <div className="bg-white rounded-lg border p-3 space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold ${cls}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
function Empty({ msg }: { msg: string }) { return <p className="text-sm text-muted-foreground italic py-6 text-center">{msg}</p>; }
function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = "Confirm", confirmVariant = "default" }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; confirmLabel?: string; confirmVariant?: "default" | "destructive" }) {
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
function DataTable({ cols, rows, onEdit, onDelete, onView, onQr }: { cols: { key: string; label: string; fmt?: (r: Record<string, unknown>) => string; render?: (r: Record<string, unknown>) => ReactNode }[]; rows: Record<string, unknown>[]; onEdit?: (r: Record<string, unknown>) => void; onDelete?: (r: Record<string, unknown>) => void; onView?: (r: Record<string, unknown>) => void; onQr?: (r: Record<string, unknown>) => void }) {
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

const HOUSE_TYPES = [
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

type DensityInfo = {
  schemeUnit: "birds/m²" | "kg/m²";
  schemeLimit: number;
  typicalLiveWeightKg?: number;
  source: string;
};

function getStockingDensityInfo(species: string, productionSystem: string): DensityInfo | null {
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

function StockingDensityPanel({ floorAreaM2, capacity, species, productionSystem }: {
  floorAreaM2: number | null; capacity: number | null; species: string; productionSystem: string;
}) {
  if (!floorAreaM2 || floorAreaM2 <= 0) return null;
  const info = getStockingDensityInfo(species, productionSystem);
  const birdsPerM2 = capacity ? capacity / floorAreaM2 : null;

  let statusEl: React.ReactNode = null;
  if (info && birdsPerM2 !== null) {
    let withinLimit: boolean;
    if (info.schemeUnit === "birds/m²") {
      withinLimit = birdsPerM2 <= info.schemeLimit;
    } else {
      const kgPerM2 = birdsPerM2 * (info.typicalLiveWeightKg ?? 2.2);
      withinLimit = kgPerM2 <= info.schemeLimit;
    }
    statusEl = withinLimit
      ? <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded px-2 py-0.5">✓ Within scheme limit</span>
      : <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">⚠ May exceed scheme limit</span>;
  }

  return (
    <div className="col-span-2 rounded-lg border bg-muted/40 px-4 py-3 space-y-1.5 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium text-xs uppercase tracking-wide text-muted-foreground">Stocking Density</span>
        {statusEl}
      </div>
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <p className="text-muted-foreground">Floor Area</p>
          <p className="font-semibold">{floorAreaM2.toFixed(0)} m²</p>
        </div>
        {birdsPerM2 !== null && (
          <div>
            <p className="text-muted-foreground">Calculated Density</p>
            <p className="font-semibold">{birdsPerM2.toFixed(1)} birds/m²</p>
          </div>
        )}
        {info && (
          <div>
            <p className="text-muted-foreground">Scheme Limit</p>
            {info.schemeUnit === "birds/m²" ? (
              <p className="font-semibold">{info.schemeLimit} birds/m²</p>
            ) : (
              <p className="font-semibold">
                {info.schemeLimit} kg/m²
                {info.typicalLiveWeightKg && (
                  <span className="font-normal text-muted-foreground ml-1">
                    (≈{(info.schemeLimit / info.typicalLiveWeightKg).toFixed(1)} birds/m² at {info.typicalLiveWeightKg} kg)
                  </span>
                )}
              </p>
            )}
            <p className="text-muted-foreground mt-0.5">{info.source}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const HOUSE_LABEL_CSS = `
  @page{size:62mm 90mm;margin:0}
  body{font-family:'Segoe UI',Arial,sans-serif;padding:10px 12px;text-align:center;background:#fff;margin:0}
  .brand{font-size:9px;color:#0f766e;font-weight:700;letter-spacing:.06em;margin-bottom:3px}
  .divider{border:none;border-top:1px solid #e5e7eb;margin:4px 0}
  .farm{font-size:12px;font-weight:700;color:#111827;text-transform:uppercase;letter-spacing:.05em;margin:4px 0 6px}
  svg{display:block;margin:0 auto}
  .code{font-family:monospace;font-size:17px;font-weight:700;color:#0f766e;margin-top:7px;letter-spacing:.1em}
  .iname{font-size:11px;font-weight:600;color:#374151;margin-top:3px}
  .desc{font-size:9px;color:#9ca3af;margin-top:2px}
  .hint{font-size:8px;color:#d1d5db;margin-top:4px}
`;

function PoultryHouseQRDialog({ house, farmId, farmName, onClose }: {
  house: { id: number; houseName?: string; species?: string; houseType?: string };
  farmId: number;
  farmName: string;
  onClose: () => void;
}) {
  const houseCode = `PH-${house.id}`;
  const qrValue = `BDE:F${farmId}:${houseCode}`;
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const win = window.open("", "_blank");
    if (!win || !printRef.current) return;
    win.document.write(`<html><head><title>House Label — ${houseCode}</title><style>${HOUSE_LABEL_CSS}</style></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.addEventListener("afterprint", () => win.close());
    win.print();
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent style={{ maxWidth: "22rem" }}>
        <DialogHeader><DialogTitle>Poultry House QR Label</DialogTitle></DialogHeader>
        <div className="flex flex-col items-center gap-1.5 py-2 border rounded-xl bg-white px-5 shadow-sm" ref={printRef}>
          <p className="text-[11px] font-bold text-teal-700 tracking-widest mt-1">🌿 BDE Farm Trac</p>
          <hr className="w-full border-gray-200" />
          <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">{farmName}</p>
          <QRCodeSVG value={qrValue} size={180} bgColor="#ffffff" fgColor="#0f766e" level="M" />
          <p className="font-mono text-xl font-bold tracking-widest text-teal-700 mt-1">{houseCode}</p>
          <p className="text-sm font-semibold text-gray-700">{house.houseName ?? "Poultry House"}</p>
          {(house.species || house.houseType) && (
            <p className="text-xs text-gray-400">{[house.species, house.houseType].filter(Boolean).join(" · ")}</p>
          )}
          <p className="text-[10px] text-gray-300 mb-1">Scan to log records for this house</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint}><Printer className="h-4 w-4 mr-1" />Print Label</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function HousesTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [qrItem, setQrItem] = useState<Record<string, unknown> | null>(null);
  const { data: farmData } = useQuery<{ record: { name: string } }>({
    queryKey: ["farm-record", farmId],
    queryFn: () => fetch(api(`farms/${farmId}`), { credentials: "include" }).then(r => r.json()),
  });
  const farmName = (farmData as any)?.record?.name ?? (farmData as any)?.name ?? "Farm";
  const { data: houses, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "poultry-houses", "poultry-houses");
  const lengthM = parseFloat(String(form.lengthM ?? "")) || null;
  const widthM = parseFloat(String(form.widthM ?? "")) || null;
  const floorAreaM2 = (lengthM && widthM) ? lengthM * widthM : null;
  const capacity = parseInt(String(form.approvedCapacity ?? "")) || null;
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Poultry Houses</h3>
        <Button size="sm" onClick={() => openAdd()}><Plus className="w-4 h-4 mr-1" />Add House</Button>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "houseName", label: "House Name" },
        { key: "species", label: "Species", fmt: (r: Record<string, unknown>) => fmtSpecies(r.species) },
        { key: "houseType", label: "House Type" },
        { key: "productionSystem", label: "Production System", fmt: (r: Record<string, unknown>) => fmtSystem(r.productionSystem) },
        { key: "approvedCapacity", label: "Capacity (birds)" },
        { key: "floorArea", label: "Floor Area", fmt: r => (r.lengthM && r.widthM) ? `${(Number(r.lengthM) * Number(r.widthM)).toFixed(0)} m²` : "—" },
        { key: "density", label: "Density (birds/m²)", fmt: r => (r.lengthM && r.widthM && r.approvedCapacity) ? (Number(r.approvedCapacity) / (Number(r.lengthM) * Number(r.widthM))).toFixed(1) : "—" },
      ]} rows={houses as Record<string, unknown>[]} onEdit={r => openEdit(r as Record<string, unknown>)} onDelete={r => del.mutate(r.id as number)} onView={setViewRecord} onQr={setQrItem} />}
      {qrItem && (
        <PoultryHouseQRDialog
          house={{ id: Number(qrItem.id), houseName: qrItem.houseName as string, species: qrItem.species as string, houseType: qrItem.houseType as string }}
          farmId={farmId}
          farmName={farmName}
          onClose={() => setQrItem(null)}
        />
      )}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Poultry House — {String(viewRecord.houseName ?? "—")}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">House Name</p><p className="font-medium">{String(viewRecord.houseName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Approved Capacity (birds)</p><p className="font-medium">{String(viewRecord.approvedCapacity ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Species</p><p className="font-medium">{fmtSpecies(viewRecord.species)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">House Type</p><p className="font-medium">{String(viewRecord.houseType ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Production System</p><p className="font-medium">{fmtSystem(viewRecord.productionSystem)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Length (m)</p><p className="font-medium">{viewRecord.lengthM ? `${viewRecord.lengthM} m` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Width (m)</p><p className="font-medium">{viewRecord.widthM ? `${viewRecord.widthM} m` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Floor Area</p><p className="font-medium">{(viewRecord.lengthM && viewRecord.widthM) ? `${(Number(viewRecord.lengthM) * Number(viewRecord.widthM)).toFixed(0)} m²` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Stocking Density</p><p className="font-medium">{(viewRecord.lengthM && viewRecord.widthM && viewRecord.approvedCapacity) ? `${(Number(viewRecord.approvedCapacity) / (Number(viewRecord.lengthM) * Number(viewRecord.widthM))).toFixed(1)} birds/m²` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ventilation Type</p><p className="font-medium">{String(viewRecord.ventilationType ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Water System</p><p className="font-medium">{String(viewRecord.waterSystem ?? "—")}</p></div>
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
          <DialogHeader>
            <DialogTitle>{editing ? "Edit House" : "Add Poultry House"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>House Name *</Label><Input value={String(form.houseName ?? "")} onChange={e => setForm(f => ({ ...f, houseName: e.target.value }))} placeholder="e.g. House 1, Shed A" /></div>
            <div><Label>Approved Capacity (birds) *</Label><Input type="number" value={String(form.approvedCapacity ?? "")} onChange={e => setForm(f => ({ ...f, approvedCapacity: e.target.value }))} /></div>
            <div>
              <Label>Species *</Label>
              <p className="text-xs text-muted-foreground mb-1">Primary approved species for this house</p>
              <Select value={String(form.species ?? "")} onValueChange={v => setForm(f => ({ ...f, species: v }))}>
                <SelectTrigger><SelectValue placeholder="Select species" /></SelectTrigger>
                <SelectContent>{POULTRY_SPECIES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>House Type *</Label>
              <p className="text-xs text-muted-foreground mb-1">Physical structure / building design</p>
              <Select value={String(form.houseType ?? "")} onValueChange={v => setForm(f => ({ ...f, houseType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{HOUSE_TYPES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Production System *</Label>
              <p className="text-xs text-muted-foreground mb-1">Welfare / certification standard this house operates under</p>
              <Select value={String(form.productionSystem ?? "")} onValueChange={v => setForm(f => ({ ...f, productionSystem: v }))}>
                <SelectTrigger><SelectValue placeholder="Select system" /></SelectTrigger>
                <SelectContent>{PRODUCTION_SYSTEMS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>House Length (m)</Label>
              <p className="text-xs text-muted-foreground mb-1">Internal floor length</p>
              <Input type="number" step="0.1" min="0" value={String(form.lengthM ?? "")} onChange={e => setForm(f => ({ ...f, lengthM: e.target.value }))} placeholder="e.g. 120" />
            </div>
            <div>
              <Label>House Width (m)</Label>
              <p className="text-xs text-muted-foreground mb-1">Internal floor width</p>
              <Input type="number" step="0.1" min="0" value={String(form.widthM ?? "")} onChange={e => setForm(f => ({ ...f, widthM: e.target.value }))} placeholder="e.g. 12" />
            </div>
            <StockingDensityPanel
              floorAreaM2={floorAreaM2}
              capacity={capacity}
              species={String(form.species ?? "")}
              productionSystem={String(form.productionSystem ?? "")}
            />
            <div><Label>Ventilation Type</Label>
              <Select value={String(form.ventilationType ?? "")} onValueChange={v => setForm(f => ({ ...f, ventilationType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select ventilation type" /></SelectTrigger>
                <SelectContent>{["Tunnel ventilation","Cross-flow ventilation","Natural / passive ventilation","Positive pressure","Negative pressure","Hybrid ventilation","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Water System</Label>
              <Select value={String(form.waterSystem ?? "")} onValueChange={v => setForm(f => ({ ...f, waterSystem: v }))}>
                <SelectTrigger><SelectValue placeholder="Select water system" /></SelectTrigger>
                <SelectContent>{["Nipple drinkers","Bell drinkers","Cup drinkers","Trough","Combination (nipple + trough)","Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function useFlocks(farmId: number) {
  const { data: rawFlocks } = useQuery({ queryKey: ["poultry-flocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()) });
  return Array.isArray(rawFlocks) ? (rawFlocks as { flock: Record<string, unknown>; houseName: string | null }[]).map(r => ({ ...r.flock, houseName: r.houseName })) : [];
}

function FlockSelect({ flocks, value, onChange }: { flocks: Record<string, unknown>[]; value: string; onChange: (v: string) => void }) {
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

function fmtFlock(r: Record<string, unknown>): string {
  if (r.flockNumber) return String(r.flockNumber) + (r.houseName ? ` · ${r.houseName}` : "");
  return r.flockId ? String(r.flockId) : "—";
}

function ChickPurchasesTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const { data: flockData } = useQuery({ queryKey: ["poultry-flocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()) });
  const flockList = Array.isArray(flockData) ? (flockData as { flock: Record<string, unknown>; houseName: string | null }[]).map(r => ({ ...r.flock, houseName: r.houseName })) : [];
  const { data: supplierData = [] } = useQuery({ queryKey: ["suppliers", farmId, "hatchery"], queryFn: () => fetch(api(`farms/${farmId}/suppliers`), { credentials: "include" }).then(r => r.json()).catch(() => []) });
  const hatcherySuppliers = (Array.isArray(supplierData) ? supplierData as Record<string, unknown>[] : []).filter(s => s.supplierType === "hatchery");
  const { data: raw, isLoading, open, setOpen, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "poultry-chick-purchases", "poultry-chick-purchases");
  const records = (raw ?? []) as Record<string, unknown>[];
  const [payStatusFilter, setPayStatusFilter] = useState("all");
  const [flockFilterCP, setFlockFilterCP] = useState("all");
  const [yearFilterCP, setYearFilterCP] = useState("all");
  const yearsCP = useMemo(() => {
    const s = new Set(records.map(r => String(r.orderDate ?? r.deliveryDate ?? "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [records]);
  const filteredPurchases = records.filter(r =>
    (payStatusFilter === "all" || r.paymentStatus === payStatusFilter) &&
    (flockFilterCP === "all" || String(r.flockId) === flockFilterCP) &&
    (yearFilterCP === "all" || String(r.orderDate ?? r.deliveryDate ?? "").startsWith(yearFilterCP))
  );

  function fmtGBP(pence: unknown): string {
    const p = Number(pence ?? 0); if (!p) return "—";
    return `£${(p / 100).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  function fmtFlockLabel(flockId: unknown): string {
    const f = flockList.find(fl => String(fl.id) === String(flockId));
    if (!f) return flockId ? String(flockId) : "—";
    return String(f.flockNumber ?? f.id) + (f.houseName ? ` · ${f.houseName}` : "");
  }
  const payStatusClass = (s: unknown) => s === "paid" ? "text-green-700" : s === "overdue" ? "text-red-600" : s === "part-paid" ? "text-amber-600" : "text-muted-foreground";

  const birdsReceived = parseInt(String(form.numberOfBirdsReceived ?? "")) || 0;
  const pricePerBird = parseInt(String(form.pricePerBirdPence ?? "")) || 0;
  const autoTotal = birdsReceived > 0 && pricePerBird > 0 ? birdsReceived * pricePerBird : null;

  function printPurchases() {
    const fmtD = (d: unknown) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const fmtGBPp = (p: unknown) => { const n = Number(p ?? 0); return n ? `£${(n / 100).toFixed(2)}` : "—"; };
    const trs = filteredPurchases.map(r => `<tr><td>${fmtFlockLabel(r.flockId)}</td><td>${String(r.supplierName ?? "—")}</td><td>${String(r.poReference ?? "—")}</td><td>${fmtD(r.orderDate)}</td><td>${String(r.numberOfBirdsOrdered ?? "—")}</td><td>${String(r.numberOfBirdsReceived ?? "—")}</td><td>${fmtGBPp(r.totalCostPence)}</td><td>${String(r.invoiceReference ?? "—")}</td><td>${String(r.paymentStatus ?? "—")}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Chick Purchases</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>Chick Purchases</h1><h2>${filteredPurchases.length} record${filteredPurchases.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Flock</th><th>Hatchery</th><th>PO Ref</th><th>Order Date</th><th>Ordered</th><th>Received</th><th>Total Cost</th><th>Invoice Ref</th><th>Status</th></tr></thead><tbody>${trs}</tbody></table></body></html>`;
    openPrintWindow(html);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div><h3 className="font-semibold text-sm">Chick Purchases <span className="text-muted-foreground font-normal">({filteredPurchases.length})</span></h3><p className="text-xs text-muted-foreground mt-0.5">Track purchase orders, chick receipts, invoices and payment status for each flock placement.</p></div>
        <div className="flex gap-2">
          {filteredPurchases.length > 0 && <Button size="sm" variant="outline" onClick={printPurchases}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => openAdd({ paymentStatus: "unpaid", paymentTermsDays: "30" })}><Plus className="w-4 h-4 mr-1" />Add Purchase</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={yearFilterCP} onValueChange={setYearFilterCP}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {yearsCP.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={flockFilterCP} onValueChange={setFlockFilterCP}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All flocks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All flocks</SelectItem>
            {flockList.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockNumber ?? f.id)}{f.houseName ? ` · ${f.houseName}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={payStatusFilter} onValueChange={setPayStatusFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="part-paid">Part-paid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "flockId", label: "Flock", fmt: r => fmtFlockLabel(r.flockId) },
        { key: "supplierName", label: "Hatchery / Supplier" },
        { key: "poReference", label: "PO Ref" },
        { key: "orderDate", label: "Order Date", fmt: r => fmtDate(r.orderDate) },
        { key: "numberOfBirdsOrdered", label: "Ordered" },
        { key: "numberOfBirdsReceived", label: "Received" },
        { key: "pricePerBirdPence", label: "Price/Bird", fmt: r => r.pricePerBirdPence ? `£${(Number(r.pricePerBirdPence) / 100).toFixed(4)}` : "—" },
        { key: "totalCostPence", label: "Total Cost", fmt: r => fmtGBP(r.totalCostPence) },
        { key: "invoiceReference", label: "Invoice Ref" },
        { key: "paymentStatus", label: "Status", render: r => <span className={`capitalize font-medium text-xs ${payStatusClass(r.paymentStatus)}`}>{String(r.paymentStatus ?? "—")}</span> },
        { key: "_attach", label: "", render: r => r.id ? <RecordAttachments farmId={farmId} recordType="poultry-chick-purchases" recordId={r.id as number} compact /> : null },
      ]} rows={filteredPurchases} onEdit={r => openEdit(r)} onDelete={r => del.mutate(r.id as number)} onView={setViewRecord} />}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Chick Purchase — {String(viewRecord.poReference ?? fmtFlockLabel(viewRecord.flockId))}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock</p><p className="font-medium">{fmtFlockLabel(viewRecord.flockId)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Hatchery / Supplier</p><p className="font-medium">{String(viewRecord.supplierName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Hatchery Approval No.</p><p className="font-medium">{String(viewRecord.hatcheryApprovalNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">PO Reference</p><p className="font-medium">{String(viewRecord.poReference ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Order Date</p><p className="font-medium">{fmtDate(viewRecord.orderDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birds Ordered</p><p className="font-medium">{String(viewRecord.numberOfBirdsOrdered ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birds Received</p><p className="font-medium">{String(viewRecord.numberOfBirdsReceived ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Price per Bird</p><p className="font-medium">{viewRecord.pricePerBirdPence ? `£${(Number(viewRecord.pricePerBirdPence) / 100).toFixed(4)}` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Total Cost</p><p className="font-medium">{fmtGBP(viewRecord.totalCostPence)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Reference</p><p className="font-medium">{String(viewRecord.invoiceReference ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Invoice Date</p><p className="font-medium">{fmtDate(viewRecord.invoiceDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Terms</p><p className="font-medium">{viewRecord.paymentTermsDays ? `${viewRecord.paymentTermsDays} days` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Status</p><p className={`font-medium capitalize ${payStatusClass(viewRecord.paymentStatus)}`}>{String(viewRecord.paymentStatus ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Date</p><p className="font-medium">{fmtDate(viewRecord.paymentDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
              {viewRecord.id && <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="poultry-chick-purchases" recordId={viewRecord.id as number} /></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "46rem" }}>
          <DialogHeader><DialogTitle>Chick Purchase Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Flock</Label>
              <Select value={String(form.flockId ?? "")} onValueChange={v => setForm(f => ({ ...f, flockId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select flock..." /></SelectTrigger>
                <SelectContent>{flockList.map(fl => <SelectItem key={String(fl.id)} value={String(fl.id)}>{String(fl.flockNumber ?? fl.id)}{fl.houseName ? ` · ${fl.houseName}` : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Hatchery / Supplier</Label>
              <Select value={String(form._suppId ?? "__none__")} onValueChange={v => {
                if (v === "__none__") { setForm(f => ({ ...f, _suppId: "" })); return; }
                const s = hatcherySuppliers.find(h => String(h.id) === v);
                setForm(f => ({ ...f, _suppId: v, supplierId: v, supplierName: s ? String(s.name ?? "") : f.supplierName, hatcheryApprovalNumber: f.hatcheryApprovalNumber || String(s?.accountNumber ?? "") }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select hatchery..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Type name below —</SelectItem>
                  {hatcherySuppliers.map(s => <SelectItem key={String(s.id)} value={String(s.id)}>{String(s.name ?? "")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Hatchery Name</Label><Input placeholder="If not in list above" value={String(form.supplierName ?? "")} onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} /></div>
            <div><Label>Hatchery Approval No.</Label><Input value={String(form.hatcheryApprovalNumber ?? "")} onChange={e => setForm(f => ({ ...f, hatcheryApprovalNumber: e.target.value }))} /></div>
            <div><Label>PO Reference</Label><Input placeholder="e.g. PO-2025-001" value={String(form.poReference ?? "")} onChange={e => setForm(f => ({ ...f, poReference: e.target.value }))} /></div>
            <div><Label>Order Date</Label><Input type="date" value={String(form.orderDate ?? "")} onChange={e => setForm(f => ({ ...f, orderDate: e.target.value }))} /></div>
            <div><Label>Birds Ordered</Label><Input type="number" value={String(form.numberOfBirdsOrdered ?? "")} onChange={e => setForm(f => ({ ...f, numberOfBirdsOrdered: e.target.value }))} /></div>
            <div><Label>Birds Received (actual)</Label><Input type="number" value={String(form.numberOfBirdsReceived ?? "")} onChange={e => setForm(f => ({ ...f, numberOfBirdsReceived: e.target.value }))} /></div>
            <div>
              <Label>Price per Bird (£)</Label>
              <Input type="number" step="0.0001" placeholder="e.g. 0.4200" value={form.pricePerBirdPence ? String(Number(form.pricePerBirdPence) / 100) : ""} onChange={e => { const p = e.target.value ? String(Math.round(parseFloat(e.target.value) * 100)) : ""; setForm(f => ({ ...f, pricePerBirdPence: p })); }} />
            </div>
            <div>
              <Label>Total Cost (£)</Label>
              {autoTotal !== null && !form.totalCostPence && <p className="text-xs text-muted-foreground mb-1">Auto: £{(autoTotal / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}</p>}
              <Input type="number" step="0.01" placeholder="Auto-calculated from above" value={form.totalCostPence ? String(Number(form.totalCostPence) / 100) : ""} onChange={e => { const p = e.target.value ? String(Math.round(parseFloat(e.target.value) * 100)) : ""; setForm(f => ({ ...f, totalCostPence: p })); }} />
            </div>
            <div><Label>Invoice Reference</Label><Input value={String(form.invoiceReference ?? "")} onChange={e => setForm(f => ({ ...f, invoiceReference: e.target.value }))} /></div>
            <div><Label>Invoice Date</Label><Input type="date" value={String(form.invoiceDate ?? "")} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} /></div>
            <div><Label>Payment Terms (days)</Label><Input type="number" value={String(form.paymentTermsDays ?? "30")} onChange={e => setForm(f => ({ ...f, paymentTermsDays: e.target.value }))} /></div>
            <div>
              <Label>Payment Status</Label>
              <Select value={String(form.paymentStatus ?? "unpaid")} onValueChange={v => setForm(f => ({ ...f, paymentStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["unpaid", "part-paid", "paid", "overdue"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Payment Date</Label><Input type="date" value={String(form.paymentDate ?? "")} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              const tc = autoTotal && !form.totalCostPence ? String(autoTotal) : form.totalCostPence;
              save.mutate({ ...form, totalCostPence: tc });
            }} disabled={save.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MortalityTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Record<string, unknown> | null>(null);
  const CURRENT_YEAR = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState(String(CURRENT_YEAR));
  const [flockFilterMort, setFlockFilterMort] = useState("all");
  const flocks = useFlocks(farmId);
  const { data: records, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd, openEdit } = useCrud(farmId, "poultry-daily-mortality", "poultry-mortality");

  const recordsList = (records ?? []) as Record<string, unknown>[];

  // Form-related calculations always use full recordsList regardless of year filter
  const selectedFlock = flocks.find(f => String(f.id) === String(form.flockId)) ?? null;
  const flockRecords = recordsList.filter(r =>
    String(r.flockId) === String(form.flockId) && (!editing || String(r.id) !== String((editing as Record<string, unknown>).id))
  );
  const currentRunning = flockRecords.length > 0 ? Math.max(...flockRecords.map(r => Number(r.runningTotalMortality ?? 0))) : 0;
  const todayTotal = Number(form.mortalityCount ?? 0) + Number(form.culledCount ?? 0);
  const projectedRunning = currentRunning + todayTotal;
  const placementCount = Number(selectedFlock?.placementCount ?? 0);
  const projectedPct = placementCount > 0 ? (projectedRunning / placementCount * 100) : null;

  // Year filter
  const availableYears = [...new Set(recordsList.map(r => String(r.recordDate ?? "").slice(0, 4)).filter(y => y.length === 4))].sort((a, b) => Number(b) - Number(a));
  if (!availableYears.includes(String(CURRENT_YEAR))) availableYears.unshift(String(CURRENT_YEAR));
  const filteredList = (yearFilter === "all" ? recordsList : recordsList.filter(r => String(r.recordDate ?? "").startsWith(yearFilter))).filter(r => flockFilterMort === "all" || String(r.flockId) === flockFilterMort);

  // Summary stats from filtered list
  const totalDeaths = filteredList.reduce((s, r) => s + Number(r.mortalityCount ?? 0), 0);
  const totalCulled = filteredList.reduce((s, r) => s + Number(r.culledCount ?? 0), 0);
  const maxPct = filteredList.length ? Math.max(...filteredList.map(r => Number(r.mortalityPercentage ?? 0))) : 0;
  const causeCounts: Record<string, number> = {};
  filteredList.forEach(r => { if (r.mainCause) { const c = String(r.mainCause); causeCounts[c] = (causeCounts[c] ?? 0) + 1; } });
  const topCause = Object.entries(causeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const flockSummaryMap: Record<string, { label: string; deaths: number; culled: number; pct: number }> = {};
  filteredList.forEach(r => {
    const key = String(r.flockId ?? "?");
    if (!flockSummaryMap[key]) flockSummaryMap[key] = { label: r.flockNumber ? `${r.flockNumber}${r.houseName ? ` · ${r.houseName}` : ""}` : key, deaths: 0, culled: 0, pct: 0 };
    flockSummaryMap[key].deaths += Number(r.mortalityCount ?? 0);
    flockSummaryMap[key].culled += Number(r.culledCount ?? 0);
    flockSummaryMap[key].pct = Math.max(flockSummaryMap[key].pct, Number(r.mortalityPercentage ?? 0));
  });
  const flockSummary = Object.values(flockSummaryMap);

  // Breed / Strain breakdown (join each record to its flock to get breed)
  const breedMap: Record<string, { deaths: number; culled: number; pct: number; flockIds: string[] }> = {};
  filteredList.forEach(r => {
    const flock = flocks.find(f => String(f.id) === String(r.flockId));
    const breed = flock?.breed ? String(flock.breed) : "Not recorded";
    if (!breedMap[breed]) breedMap[breed] = { deaths: 0, culled: 0, pct: 0, flockIds: [] };
    breedMap[breed].deaths += Number(r.mortalityCount ?? 0);
    breedMap[breed].culled += Number(r.culledCount ?? 0);
    breedMap[breed].pct = Math.max(breedMap[breed].pct, Number(r.mortalityPercentage ?? 0));
    if (!breedMap[breed].flockIds.includes(String(r.flockId ?? ""))) breedMap[breed].flockIds.push(String(r.flockId ?? ""));
  });
  const breedSummary = Object.entries(breedMap)
    .map(([breed, d]) => ({ breed, deaths: d.deaths, culled: d.culled, pct: d.pct, crops: d.flockIds.length }))
    .sort((a, b) => b.deaths - a.deaths);
  const showBreedBreakdown = breedSummary.length > 1 && breedSummary.some(b => b.breed !== "Not recorded");

  // Hatchery / supplier breakdown
  const hatcheryMap: Record<string, { deaths: number; culled: number; pct: number; flockIds: string[] }> = {};
  filteredList.forEach(r => {
    const flock = flocks.find(f => String(f.id) === String(r.flockId));
    const hatchery = flock?.hatcheryName ? String(flock.hatcheryName) : "Not recorded";
    if (!hatcheryMap[hatchery]) hatcheryMap[hatchery] = { deaths: 0, culled: 0, pct: 0, flockIds: [] };
    hatcheryMap[hatchery].deaths += Number(r.mortalityCount ?? 0);
    hatcheryMap[hatchery].culled += Number(r.culledCount ?? 0);
    hatcheryMap[hatchery].pct = Math.max(hatcheryMap[hatchery].pct, Number(r.mortalityPercentage ?? 0));
    if (!hatcheryMap[hatchery].flockIds.includes(String(r.flockId ?? ""))) hatcheryMap[hatchery].flockIds.push(String(r.flockId ?? ""));
  });
  const hatcherySummary = Object.entries(hatcheryMap)
    .map(([hatchery, d]) => ({ hatchery, deaths: d.deaths, culled: d.culled, pct: d.pct, crops: d.flockIds.length }))
    .sort((a, b) => b.deaths - a.deaths);
  const showHatcheryBreakdown = hatcherySummary.length > 1 && hatcherySummary.some(h => h.hatchery !== "Not recorded");

  // Year-by-year stats (always computed from full recordsList for the trend table)
  function calcYearStats(recs: Record<string, unknown>[]) {
    const crops = new Set(recs.map(r => String(r.flockId ?? ""))).size;
    const deaths = recs.reduce((s, r) => s + Number(r.mortalityCount ?? 0), 0);
    const culled = recs.reduce((s, r) => s + Number(r.culledCount ?? 0), 0);
    const peakPct = recs.length ? Math.max(...recs.map(r => Number(r.mortalityPercentage ?? 0))) : 0;
    return { crops, deaths, culled, peakPct };
  }
  const yearlyStats = availableYears.map(y => ({ year: y, ...calcYearStats(recordsList.filter(r => String(r.recordDate ?? "").startsWith(y))) }));
  const hasMultiYearData = yearlyStats.filter(s => s.deaths > 0 || s.culled > 0).length > 1;

  const csvCols = [
    { key: "recordDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.recordDate) },
    { key: "flockNumber", label: "Flock" }, { key: "houseName", label: "House" },
    { key: "mortalityCount", label: "Deaths" }, { key: "culledCount", label: "Culled" },
    { key: "runningTotalMortality", label: "Running Total" }, { key: "mortalityPercentage", label: "Mortality %" },
    { key: "mainCause", label: "Main Cause" }, { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Daily Mortality Records</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Red Tractor Broilers: daily mortality must be recorded and retained for a minimum of 3 years.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={flockFilterMort} onValueChange={setFlockFilterMort}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All flocks" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All flocks</SelectItem>
              {flocks.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockNumber ?? f.id)}{f.houseName ? ` · ${f.houseName}` : ""}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
              <SelectItem value="all">All years</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredList, "mortality-records.csv", csvCols)} disabled={!filteredList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={() => openAdd({ mortalityCount: "0", culledCount: "0" })}><Plus className="w-4 h-4 mr-1" />Log Mortality</Button>
        </div>
      </div>
      {!isLoading && recordsList.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mortality Summary — {yearFilter === "all" ? "All Years" : yearFilter}</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Deaths" value={totalDeaths.toLocaleString()} />
            <StatCard label="Total Culled" value={totalCulled.toLocaleString()} />
            <StatCard label="Peak Mortality %" value={`${maxPct.toFixed(2)}%`} color={maxPct > 5 ? "red" : maxPct > 3 ? "amber" : "green"} />
            <StatCard label="Top Cause" value={topCause.split(" (")[0]} sub={topCause.includes("(") ? topCause.split("(")[1]?.replace(")", "") : undefined} />
          </div>
          {flockSummary.length > 1 && (
            <div className="overflow-x-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">By Flock</p>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left py-1.5 pr-4 text-muted-foreground font-medium">Flock</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Deaths</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Culled</th><th className="text-right py-1.5 text-muted-foreground font-medium">Peak Mortality %</th></tr></thead>
                <tbody>{flockSummary.map((fs, i) => <tr key={i} className="border-b last:border-0"><td className="py-1.5 pr-4 font-medium">{fs.label}</td><td className="py-1.5 pr-4 text-right">{fs.deaths.toLocaleString()}</td><td className="py-1.5 pr-4 text-right">{fs.culled.toLocaleString()}</td><td className={`py-1.5 text-right font-semibold ${fs.pct > 5 ? "text-red-600" : fs.pct > 3 ? "text-amber-600" : "text-green-700"}`}>{fs.pct.toFixed(2)}%</td></tr>)}</tbody>
              </table>
            </div>
          )}
          {showBreedBreakdown && (
            <div className="overflow-x-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">By Breed / Strain</p>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left py-1.5 pr-4 text-muted-foreground font-medium">Breed / Strain</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Crops</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Deaths</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Culled</th><th className="text-right py-1.5 text-muted-foreground font-medium">Peak Mort. %</th></tr></thead>
                <tbody>{breedSummary.map((bs, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5 pr-4 font-medium">{bs.breed}</td>
                    <td className="py-1.5 pr-4 text-right text-muted-foreground">{bs.crops}</td>
                    <td className="py-1.5 pr-4 text-right">{bs.deaths.toLocaleString()}</td>
                    <td className="py-1.5 pr-4 text-right">{bs.culled.toLocaleString()}</td>
                    <td className={`py-1.5 text-right font-semibold ${bs.pct > 5 ? "text-red-600" : bs.pct > 3 ? "text-amber-600" : "text-green-700"}`}>{bs.pct.toFixed(2)}%</td>
                  </tr>
                ))}</tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-1">Breed / strain is set on the Flock Register. Ensuring all flocks have a breed recorded gives the most accurate comparison.</p>
            </div>
          )}
          {showHatcheryBreakdown && (
            <div className="overflow-x-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">By Hatchery / Supplier</p>
              <table className="w-full text-xs">
                <thead><tr className="border-b"><th className="text-left py-1.5 pr-4 text-muted-foreground font-medium">Hatchery / Supplier</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Crops</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Deaths</th><th className="text-right py-1.5 pr-4 text-muted-foreground font-medium">Culled</th><th className="text-right py-1.5 text-muted-foreground font-medium">Peak Mort. %</th></tr></thead>
                <tbody>{hatcherySummary.map((hs, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1.5 pr-4 font-medium">{hs.hatchery}</td>
                    <td className="py-1.5 pr-4 text-right text-muted-foreground">{hs.crops}</td>
                    <td className="py-1.5 pr-4 text-right">{hs.deaths.toLocaleString()}</td>
                    <td className="py-1.5 pr-4 text-right">{hs.culled.toLocaleString()}</td>
                    <td className={`py-1.5 text-right font-semibold ${hs.pct > 5 ? "text-red-600" : hs.pct > 3 ? "text-amber-600" : "text-green-700"}`}>{hs.pct.toFixed(2)}%</td>
                  </tr>
                ))}</tbody>
              </table>
              <p className="text-xs text-muted-foreground mt-1">Hatchery name is set on the Flock Register. Flocks with no hatchery recorded show as 'Not recorded'.</p>
            </div>
          )}
          {hasMultiYearData && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year-by-Year Mortality Trend</p>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Year</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Crops</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Deaths</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Culled</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-500">Peak Mort. %</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-500">Bar</th>
                  </tr>
                </thead>
                <tbody>
                  {yearlyStats.map((s, i) => {
                    const maxRate = Math.max(...yearlyStats.map(x => x.peakPct), 0.1);
                    const barWidth = Math.round((s.peakPct / maxRate) * 100);
                    return (
                      <tr key={s.year} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-3 py-2 font-medium">{s.year}</td>
                        <td className="px-3 py-2 text-right">{s.crops}</td>
                        <td className="px-3 py-2 text-right">{s.deaths.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right">{s.culled.toLocaleString()}</td>
                        <td className={`px-3 py-2 text-right font-semibold ${s.peakPct > 5 ? "text-red-600" : s.peakPct > 3 ? "text-amber-600" : "text-green-700"}`}>{s.peakPct.toFixed(2)}%</td>
                        <td className="px-3 py-2 w-32">
                          <div className="h-3 bg-gray-100 rounded overflow-hidden">
                            <div className={`h-full rounded ${s.peakPct > 5 ? "bg-red-400" : s.peakPct > 3 ? "bg-amber-400" : "bg-green-400"}`} style={{ width: `${barWidth}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-400">Peak mortality % is the highest cumulative rate recorded in any crop in that year. Red &gt;5% · Amber 3–5% · Green &lt;3%. Red Tractor Broilers and NatureScot schemes may query rates above scheme thresholds.</p>
              </div>
            </div>
          )}
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "recordDate", label: "Date", fmt: r => fmtDate(r.recordDate) },
        { key: "flockNumber", label: "Flock", fmt: fmtFlock },
        { key: "mortalityCount", label: "Deaths" },
        { key: "culledCount", label: "Culled" },
        { key: "runningTotalMortality", label: "Running Total" },
        { key: "mortalityPercentage", label: "Mortality %", fmt: r => r.mortalityPercentage ? `${Number(r.mortalityPercentage).toFixed(2)}%` : "—" },
        { key: "mainCause", label: "Main Cause" },
      ]} rows={filteredList} onEdit={r => openEdit(r)} onDelete={r => del.mutate(r.id as number)} onView={setViewRecord} />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "38rem" }}>
            <DialogHeader><DialogTitle>Daily Mortality — {fmtDate(viewRecord.recordDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{fmtDate(viewRecord.recordDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock</p><p className="font-medium">{fmtFlock(viewRecord)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Deaths</p><p className="font-medium">{String(viewRecord.mortalityCount ?? "0")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Culled</p><p className="font-medium">{String(viewRecord.culledCount ?? "0")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Running Total Mortality</p><p className="font-medium">{String(viewRecord.runningTotalMortality ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Mortality %</p><p className="font-medium">{viewRecord.mortalityPercentage ? `${Number(viewRecord.mortalityPercentage).toFixed(2)}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Main Cause</p><p className="font-medium">{String(viewRecord.mainCause ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              {Number(viewRecord.mortalityPercentage) > 3 && (
                <Button size="sm" variant="outline" className="text-purple-700 border-purple-200 hover:bg-purple-50" onClick={() => { setRaiseTaskFor(viewRecord); setViewRecord(null); }}><ClipboardList className="w-3.5 h-3.5 mr-1" />Raise Task</Button>
              )}
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {raiseTaskFor && (
        <RaiseTaskDialog
          farmId={farmId}
          open={!!raiseTaskFor}
          onClose={() => setRaiseTaskFor(null)}
          defaultTitle={`High Mortality Investigation — ${raiseTaskFor.mortalityPercentage ? `${Number(raiseTaskFor.mortalityPercentage).toFixed(2)}%` : "Alert"}`}
          defaultDescription={`Date: ${raiseTaskFor.recordDate ?? "—"} · Deaths: ${raiseTaskFor.mortalityCount ?? 0} · Culled: ${raiseTaskFor.culledCount ?? 0} · Cause: ${raiseTaskFor.mainCause ?? "—"}`}
          module="poultry"
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "36rem" }}>
          <DialogHeader><DialogTitle>Daily Mortality</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date *</Label><Input type="date" value={String(form.recordDate ?? "")} onChange={e => setForm(f => ({ ...f, recordDate: e.target.value }))} /></div>
            <div><Label>Flock *</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            <div><Label>Deaths *</Label><Input type="number" min="0" value={String(form.mortalityCount ?? "0")} onChange={e => setForm(f => ({ ...f, mortalityCount: e.target.value }))} /></div>
            <div><Label>Culled *</Label><Input type="number" min="0" value={String(form.culledCount ?? "0")} onChange={e => setForm(f => ({ ...f, culledCount: e.target.value }))} /></div>
            {form.flockId && (
              <div className="col-span-2 rounded-lg border bg-muted/40 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">After this entry is saved</p>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Today's losses</p>
                    <p className="font-semibold">{todayTotal} birds</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Running total</p>
                    <p className="font-semibold">{projectedRunning.toLocaleString()} birds</p>
                  </div>
                  {projectedPct !== null ? (
                    <div>
                      <p className="text-muted-foreground">Mortality %</p>
                      <p className={`font-semibold ${projectedPct > 5 ? "text-red-600" : projectedPct > 3 ? "text-amber-600" : "text-green-700"}`}>
                        {projectedPct.toFixed(2)}%
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-muted-foreground">Mortality %</p>
                      <p className="text-muted-foreground text-xs">Set placement count on flock</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Running total and mortality % are calculated automatically — not editable.</p>
              </div>
            )}
            <div className="col-span-2">
              <Label>Main Cause of Death</Label>
              <Select value={String(form.mainCause ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, mainCause: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select cause" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select cause —</SelectItem>
                  {[
                    "Natural causes (normal losses)",
                    "Sudden Death Syndrome (SDS / Flip-over)",
                    "Ascites (Waterbelly)",
                    "Cardiovascular failure",
                    "Respiratory disease",
                    "Leg / skeletal problems",
                    "Digestive disorder",
                    "Bacterial infection",
                    "Viral disease",
                    "Injury / trauma",
                    "Cannibalism / pecking injury",
                    "Heat stress",
                    "Chilling (young chicks)",
                    "Smothering / piling",
                    "Nutritional deficiency",
                    "Unknown",
                    "Other (specify in notes)",
                  ].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TreatmentsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});

  const { data: rawRecords, isLoading } = useQuery({
    queryKey: ["poultry-treatments", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-treatments`), { credentials: "include" }).then(r => r.json()),
  });
  const records: Record<string, unknown>[] = Array.isArray(rawRecords) ? rawRecords : [];

  const { data: rawFlocks } = useQuery({
    queryKey: ["poultry-flocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()),
  });
  const flocks: Record<string, unknown>[] = Array.isArray(rawFlocks) ? rawFlocks.map((r: { flock: Record<string, unknown>; houseName: string | null }) => ({ ...r.flock, houseName: r.houseName })) : [];

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => {
      const url = editing ? api(`farms/${farmId}/poultry-treatments/${editing.id}`) : api(`farms/${farmId}/poultry-treatments`);
      const payload = { ...body };
      if (payload.flockId === "__none__" || payload.flockId === "") payload.flockId = null;
      else if (payload.flockId) payload.flockId = Number(payload.flockId);
      if (payload.durationDays === "") payload.durationDays = null; else if (payload.durationDays) payload.durationDays = Number(payload.durationDays);
      if (payload.withdrawalPeriodDays === "") payload.withdrawalPeriodDays = null; else if (payload.withdrawalPeriodDays) payload.withdrawalPeriodDays = Number(payload.withdrawalPeriodDays);
      if (payload.numberOfBirdsTreated === "") payload.numberOfBirdsTreated = null; else if (payload.numberOfBirdsTreated) payload.numberOfBirdsTreated = Number(payload.numberOfBirdsTreated);
      payload.prescriptionObtained = Boolean(payload.prescriptionObtained);
      return fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-treatments", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-treatments/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poultry-treatments", farmId] }),
  });

  function openAdd() { setEditing(null); setForm({ prescriptionObtained: false }); setOpen(true); }
  function openEdit(r: Record<string, unknown>) { setEditing(r); setForm({ ...r, flockId: r.flockId != null ? String(r.flockId) : "__none__" }); setOpen(true); }

  const todayStr = new Date().toISOString().split("T")[0];

  function handleWithdrawalDays(days: string) {
    setForm(f => {
      const updated = { ...f, withdrawalPeriodDays: days };
      const treatDate = f.treatmentDate as string | undefined;
      if (days && treatDate) {
        const clear = new Date(treatDate);
        clear.setDate(clear.getDate() + Number(days));
        updated.withdrawalClearDate = clear.toISOString().split("T")[0];
      }
      return updated;
    });
  }

  const [flockFilterTx, setFlockFilterTx] = useState("all");
  const [inWithdrawalOnly, setInWithdrawalOnly] = useState(false);
  const [yearFilterTx, setYearFilterTx] = useState("all");
  const yearsTx = useMemo(() => Array.from(new Set(records.map(r => String(r.treatmentDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [records]);
  const filteredTreatments = records.filter(r =>
    (flockFilterTx === "all" || String(r.flockId ?? "") === flockFilterTx) &&
    (!inWithdrawalOnly || (r.withdrawalClearDate && String(r.withdrawalClearDate) >= todayStr)) &&
    (yearFilterTx === "all" || String(r.treatmentDate ?? "").startsWith(yearFilterTx))
  );
  const inWithdrawal = records.filter(r => r.withdrawalClearDate && String(r.withdrawalClearDate) >= todayStr);
  const pomvCount = records.filter(r => r.prescriptionObtained).length;
  const medCounts: Record<string, number> = {};
  records.forEach(r => { if (r.productName) { const n = String(r.productName); medCounts[n] = (medCounts[n] ?? 0) + 1; } });
  const topMed = Object.entries(medCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const tCsvCols = [
    { key: "treatmentDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.treatmentDate) },
    { key: "flockNumber", label: "Flock" }, { key: "houseName", label: "House" },
    { key: "productName", label: "Product" }, { key: "activeIngredient", label: "Active Ingredient" },
    { key: "condition", label: "Condition" }, { key: "routeOfAdministration", label: "Route" },
    { key: "doseRate", label: "Dose Rate" }, { key: "durationDays", label: "Duration (days)" },
    { key: "numberOfBirdsTreated", label: "Birds Treated" }, { key: "batchNumber", label: "Batch No." },
    { key: "withdrawalPeriodDays", label: "Withdrawal (days)" }, { key: "withdrawalClearDate", label: "Clear Date", fmt: (r: Record<string, unknown>) => fmtDate(r.withdrawalClearDate) },
    { key: "prescriptionObtained", label: "Rx Obtained", fmt: (r: Record<string, unknown>) => r.prescriptionObtained ? "Yes" : "No" },
    { key: "prescribingVetName", label: "Vet Name" }, { key: "prescribingVetPractice", label: "Vet Practice" },
    { key: "administeredBy", label: "Administered By" }, { key: "notes", label: "Notes" },
  ];

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-blue-100 bg-blue-50 flex items-start gap-2">
        <Pill className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800">Records required under <strong>Veterinary Medicines Regulations 2013</strong>. Retain for minimum 5 years. POM-V medicines must have a valid veterinary prescription — record the prescribing vet's details for every such treatment.</p>
      </div>
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-semibold text-sm">Medication & Treatment Records</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredTreatments, "treatment-records.csv", tCsvCols)} disabled={!filteredTreatments.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Treatment</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={flockFilterTx} onValueChange={setFlockFilterTx}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All flocks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All flocks</SelectItem>
            {flocks.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockNumber ?? f.id)}{f.houseName ? ` · ${f.houseName}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
        <button
          onClick={() => setInWithdrawalOnly(v => !v)}
          className={`h-8 px-3 text-xs rounded-md border font-medium transition-colors ${inWithdrawalOnly ? "bg-amber-100 border-amber-400 text-amber-800" : "bg-background border-input text-muted-foreground hover:text-foreground"}`}
        >
          {inWithdrawalOnly ? "⚠ In withdrawal only" : "In withdrawal only"}
        </button>
        <Select value={yearFilterTx} onValueChange={setYearFilterTx}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsTx.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
      </div>
      {records.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Treatment Summary</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total Records" value={records.length} />
              <StatCard label="In Withdrawal" value={inWithdrawal.length} color={inWithdrawal.length > 0 ? "amber" : "green"} sub={inWithdrawal.length > 0 ? "flocks cannot go to slaughter" : "all clear"} />
              <StatCard label="POM-V Treatments" value={pomvCount} sub="require vet prescription" />
              <StatCard label="Most Used Medicine" value={topMed.length > 20 ? topMed.slice(0, 18) + "…" : topMed} />
            </div>
          </div>
          {inWithdrawal.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 space-y-2">
              <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /><p className="text-xs font-semibold text-amber-800">Active Withdrawal Periods — These flocks cannot be sent to slaughter yet</p></div>
              <div className="space-y-1">
                {inWithdrawal.map((r, i) => (
                  <div key={i} className="flex justify-between items-center text-xs bg-white rounded border border-amber-200 px-3 py-1.5">
                    <span className="font-medium">{r.flockNumber ? `Flock ${r.flockNumber}${r.houseName ? ` · ${r.houseName}` : ""}` : "—"}</span>
                    <span className="text-muted-foreground">{String(r.productName ?? "—")}</span>
                    <span className="text-amber-700 font-semibold">Clear: {fmtDate(r.withdrawalClearDate)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : filteredTreatments.length === 0 ? (
        <Empty msg={records.length === 0 ? "No treatment records yet. Log all medicines administered to your flocks, including over-the-counter and prescription products." : "No records match the current filters."} />
      ) : (
        <div className="space-y-2">
          {filteredTreatments.map((r, i) => {
            const isWithdrawal = r.withdrawalClearDate && String(r.withdrawalClearDate) >= todayStr;
            return (
              <div key={i} className={`border rounded-lg p-3 bg-white ${isWithdrawal ? "border-amber-300" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm">{String(r.productName ?? "—")}</span>
                      {!!r.flockNumber && <Badge variant="outline" className="text-xs">{String(r.flockNumber)}{r.houseName ? ` · ${r.houseName}` : ""}</Badge>}
                      {isWithdrawal && <Badge className="text-xs bg-amber-100 text-amber-800 border border-amber-300">⚠ Withdrawal until {fmtDate(r.withdrawalClearDate)}</Badge>}
                      {r.prescriptionObtained && <Badge className="text-xs bg-green-100 text-green-800 border border-green-200">Rx ✓</Badge>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      <span><span className="font-medium text-foreground/70">Date:</span> {fmtDate(r.treatmentDate)}</span>
                      <span><span className="font-medium text-foreground/70">Condition:</span> {String(r.condition ?? "—")}</span>
                      <span><span className="font-medium text-foreground/70">Route:</span> {String(r.routeOfAdministration ?? "—")}</span>
                      {!!r.numberOfBirdsTreated && <span><span className="font-medium text-foreground/70">Birds:</span> {String(r.numberOfBirdsTreated)}</span>}
                      {!!r.prescribingVetName && <span><span className="font-medium text-foreground/70">Vet:</span> {String(r.prescribingVetName)}</span>}
                      {!!r.withdrawalPeriodDays && <span><span className="font-medium text-foreground/70">Withdrawal:</span> {String(r.withdrawalPeriodDays)} days</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => setViewRecord(r)}><Eye className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(r.id as number)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </div>
                </div>
                <div className="mt-1.5 pt-1.5 border-t">
                  <DocAttach farmId={farmId} endpoint="poultry-treatments" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["poultry-treatments", farmId]} />
                </div>
              </div>
            );
          })}
        </div>
      )}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Treatment Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Product Name</p><p className="font-medium">{String(viewRecord.productName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Treatment Date</p><p className="font-medium">{fmtDate(viewRecord.treatmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Condition</p><p className="font-medium">{String(viewRecord.condition ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Route</p><p className="font-medium">{String(viewRecord.routeOfAdministration ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dosage</p><p className="font-medium">{String(viewRecord.doseRate ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birds Treated</p><p className="font-medium">{String(viewRecord.numberOfBirdsTreated ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescribing Vet</p><p className="font-medium">{String(viewRecord.prescribingVetName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Withdrawal Period</p><p className="font-medium">{String(viewRecord.withdrawalPeriodDays ?? "—")} days</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Clear Date</p><p className="font-medium">{fmtDate(viewRecord.withdrawalClearDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Prescription Obtained</p><p className="font-medium">{viewRecord.prescriptionObtained ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Batch Number</p><p className="font-medium">{String(viewRecord.batchNumber ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "44rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Treatment Record" : "Record Medicine Treatment"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">Treatment Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Treatment Date *</Label><Input type="date" value={String(form.treatmentDate ?? "")} onChange={e => setForm(f => ({ ...f, treatmentDate: e.target.value }))} /></div>
              <div><Label>Flock *</Label>
                <Select value={String(form.flockId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, flockId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select flock" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select flock —</SelectItem>
                    {flocks.map((fl: Record<string, unknown>) => (
                      <SelectItem key={String(fl.id)} value={String(fl.id)}>
                        {String(fl.flockNumber ?? fl.id)}{fl.houseName ? ` — ${fl.houseName}` : ""}{fl.species ? ` (${fl.species})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Number of Birds Treated</Label><Input type="number" min="1" value={String(form.numberOfBirdsTreated ?? "")} onChange={e => setForm(f => ({ ...f, numberOfBirdsTreated: e.target.value }))} /></div>
              <div>
                <Label>Condition / Diagnosis *</Label>
                <Select value={String(form.condition ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, condition: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select condition —</SelectItem>
                    {[
                      "Coccidiosis",
                      "Necrotic Enteritis",
                      "Colibacillosis (E. coli)",
                      "Infectious Bronchitis (IB)",
                      "Newcastle Disease (ND)",
                      "Marek's Disease",
                      "Mycoplasma (MG / MS)",
                      "Gumboro Disease (IBD)",
                      "Infectious Laryngotracheitis (ILT)",
                      "Avian Metapneumovirus (aMPV / TRT)",
                      "Salmonella",
                      "Fowl Cholera (Pasteurella)",
                      "Clostridial Disease",
                      "Swollen Head Syndrome (SHS)",
                      "Respiratory Disease (general)",
                      "Egg Peritonitis / Salpingitis",
                      "External Parasites (Red Mite / Lice)",
                      "Internal Parasites",
                      "Bumblefoot",
                      "Nutritional Deficiency",
                      "Vaccination Reaction",
                      "Injury / Trauma",
                      "Other (specify in notes)",
                    ].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">Medicine Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Product Name *</Label><Input placeholder="e.g. Tylan 200mg/ml, Baytril 100" value={String(form.productName ?? "")} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} /></div>
              <div>
                <Label>Active Ingredient</Label>
                <Select value={String(form.activeIngredient ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, activeIngredient: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select ingredient" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select or leave blank —</SelectItem>
                    {[
                      "Amoxicillin",
                      "Amprolium",
                      "Colistin",
                      "Diclazuril",
                      "Doxycycline",
                      "Enrofloxacin",
                      "Erythromycin",
                      "Florfenicol",
                      "Flubendazole",
                      "Ivermectin",
                      "Lasalocid",
                      "Lincomycin",
                      "Maduramicin",
                      "Monensin",
                      "Narasin",
                      "Neomycin",
                      "Oxytetracycline",
                      "Permethrin",
                      "Robenidine",
                      "Salinomycin",
                      "Spectinomycin",
                      "Thiamphenicol",
                      "Toltrazuril",
                      "Trimethoprim / Sulfadiazine",
                      "Tylosin",
                      "Other (specify in notes)",
                    ].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Route of Administration *</Label>
                <Select value={String(form.routeOfAdministration ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, routeOfAdministration: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select —</SelectItem>
                    {["In-water medication", "In-feed medication", "Injection", "Spray", "Eye drops", "Topical", "Oral (individual)"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Dose Rate</Label><Input placeholder="e.g. 1ml per litre of water" value={String(form.doseRate ?? "")} onChange={e => setForm(f => ({ ...f, doseRate: e.target.value }))} /></div>
              <div><Label>Duration (days)</Label><Input type="number" min="1" value={String(form.durationDays ?? "")} onChange={e => setForm(f => ({ ...f, durationDays: e.target.value }))} /></div>
              <div><Label>Batch Number</Label><Input placeholder="From product label" value={String(form.batchNumber ?? "")} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} /></div>
              <div><Label>Expiry Date</Label><Input type="date" value={String(form.expiryDate ?? "")} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
              <div><Label>Administered By</Label><Input placeholder="Person who gave the treatment" value={String(form.administeredBy ?? "")} onChange={e => setForm(f => ({ ...f, administeredBy: e.target.value }))} /></div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">Withdrawal Period</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Withdrawal Period (days)</Label><Input type="number" min="0" value={String(form.withdrawalPeriodDays ?? "")} onChange={e => handleWithdrawalDays(e.target.value)} /></div>
              <div><Label>Withdrawal Clear Date</Label><Input type="date" value={String(form.withdrawalClearDate ?? "")} onChange={e => setForm(f => ({ ...f, withdrawalClearDate: e.target.value }))} /></div>
            </div>

            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-b pb-1">Veterinary Prescription (VMR 2013)</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Prescribing Vet Name</Label><Input placeholder="e.g. Dr. J. Bloggs" value={String(form.prescribingVetName ?? "")} onChange={e => setForm(f => ({ ...f, prescribingVetName: e.target.value }))} /></div>
              <div><Label>Vet Practice</Label><Input placeholder="e.g. Westway Vets" value={String(form.prescribingVetPractice ?? "")} onChange={e => setForm(f => ({ ...f, prescribingVetPractice: e.target.value }))} /></div>
              <div className="col-span-2 flex items-center gap-2 mt-1">
                <Checkbox id="rxObtained" checked={Boolean(form.prescriptionObtained)} onCheckedChange={v => setForm(f => ({ ...f, prescriptionObtained: Boolean(v) }))} />
                <Label htmlFor="rxObtained" className="font-normal cursor-pointer">Prescription obtained (required for POM-V medicines)</Label>
              </div>
            </div>

            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate(form)} disabled={save.isPending || !form.treatmentDate || !form.productName || !form.condition || !form.routeOfAdministration || !form.flockId || form.flockId === "__none__"}>Save Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const APPROVED_DISINFECTANTS = ["Virkon S","Anigene HLD4V","FAM 30","Interkokask","Kilcox Extra","Defecto Forte","Menno Ter Forte","Biocide Extra","Glutex (Glutaraldehyde)","Acticide CMK","Perasafe (Peracetic Acid)","DupHast Forte","Other (specify in notes)"];

function CleanoutsTab({ farmId }: { farmId: number }) {
  const flocks = useFlocks(farmId);
  const { data: rawHouses = [] } = useQuery({ queryKey: ["poultry-houses", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-houses`), { credentials: "include" }).then(r => r.json()) });
  const houses = rawHouses as Record<string, unknown>[];
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const { data: records, isLoading, open, setOpen, editing, form, setForm, save, del, openAdd: _openAdd, openEdit: _openEdit } = useCrud(farmId, "poultry-house-cleanouts", "poultry-cleanouts");
  const { data: coMembersData, isLoading: coMembersLoading } = useFarmMembers(farmId);
  const coStaffNames = (coMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);

  const { data: rawStock = [] } = useQuery({ queryKey: ["stock-items", farmId], queryFn: () => fetch(api(`farms/${farmId}/stock-items`), { credentials: "include" }).then(r => r.json()).catch(() => []) });
  const stockItems = (Array.isArray(rawStock) ? rawStock : (rawStock as Record<string, unknown>)?.records ?? []) as { id: number; name: string; unit: string | null; category: string | null }[];
  const CLEANING_CATS = ["disinfectant","disinfectants","cleaning","sanitiser","sanitizer","biosecurity","insecticide"];
  const cleaningStock = stockItems.filter(s => s.category && CLEANING_CATS.includes(s.category.toLowerCase()));
  const stockForDrop = cleaningStock.length > 0 ? cleaningStock : stockItems;

  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [stockConsumptions, setStockConsumptions] = useState<Record<string, { stockItemId: string; quantity: string }>>({});
  const [customProduct, setCustomProduct] = useState("");

  function openAdd() {
    setSelectedProducts([]); setStockConsumptions({}); setCustomProduct("");
    _openAdd({ swabsTaken: false, performedByContractor: false, contractorOwnSupplies: false });
  }
  function openEditCO(r: Record<string, unknown>) {
    const cons = Array.isArray(r.consumptions) ? r.consumptions as Array<{ productName?: string; stockItemId?: number; quantityUsed?: string }> : [];
    setSelectedProducts(cons.map(c => c.productName ?? "").filter(Boolean));
    const consumMap: Record<string, { stockItemId: string; quantity: string }> = {};
    for (const c of cons) { if (c.productName) consumMap[c.productName] = { stockItemId: String(c.stockItemId ?? ""), quantity: c.quantityUsed ?? "" }; }
    setStockConsumptions(consumMap); setCustomProduct("");
    _openEdit(r);
  }
  function handleClose() { setOpen(false); setSelectedProducts([]); setStockConsumptions({}); setCustomProduct(""); }
  function buildConsumptions() {
    return selectedProducts.filter(p => stockConsumptions[p]?.quantity).map(p => ({
      productName: p,
      stockItemId: stockConsumptions[p]?.stockItemId ? Number(stockConsumptions[p].stockItemId) : null,
      quantityUsed: stockConsumptions[p].quantity,
    }));
  }
  function doSave() {
    save.mutate({
      ...form,
      houseId: form.houseId ? Number(form.houseId) : null,
      flockId: form.flockId ? Number(form.flockId) : null,
      costPence: form.costPence ? Math.round(Number(form.costPence) * 100) : null,
      consumptions: buildConsumptions(),
    });
  }

  const coList = (records ?? []) as Record<string, unknown>[];
  const [houseFilterCO, setHouseFilterCO] = useState("all");
  const [yearFilterCO, setYearFilterCO] = useState("all");
  const coYears = useMemo(() => Array.from(new Set(coList.map(r => String(r.cleanoutStartDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [coList]);
  const filteredCoList = coList.filter(r =>
    (houseFilterCO === "all" || String(r.houseId) === houseFilterCO) &&
    (yearFilterCO === "all" || String(r.cleanoutStartDate ?? "").startsWith(yearFilterCO))
  );
  const avgStanding = filteredCoList.filter(r => r.standingTimeDays).length ? Math.round(filteredCoList.filter(r => r.standingTimeDays).reduce((s, r) => s + Number(r.standingTimeDays), 0) / filteredCoList.filter(r => r.standingTimeDays).length) : null;
  const swabsTakenCount = filteredCoList.filter(r => r.swabsTaken).length;
  const totalCostPence = filteredCoList.reduce((s, r) => s + (Number(r.costPence) || 0), 0);
  const contractorCount = filteredCoList.filter(r => r.performedByContractor).length;
  const disinfCounts: Record<string, number> = {};
  filteredCoList.forEach(r => { if (r.disinfectantUsed) { const d = String(r.disinfectantUsed); disinfCounts[d] = (disinfCounts[d] ?? 0) + 1; } });
  const topDisinf = Object.entries(disinfCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const coCsvCols = [
    { key: "cleanoutStartDate", label: "Start Date", fmt: (r: Record<string, unknown>) => fmtDate(r.cleanoutStartDate) },
    { key: "cleanoutEndDate", label: "End Date", fmt: (r: Record<string, unknown>) => fmtDate(r.cleanoutEndDate) },
    { key: "houseName", label: "House" }, { key: "flockNumber", label: "Flock" },
    { key: "performedByContractor", label: "Contractor?", fmt: (r: Record<string, unknown>) => r.performedByContractor ? "Yes" : "No" },
    { key: "contractorName", label: "Contractor Name" },
    { key: "disinfectantUsed", label: "Primary Disinfectant" }, { key: "disinfectantApprovalNumber", label: "DEFRA Approval No." },
    { key: "dilutionRate", label: "Dilution Rate" }, { key: "contactTimeMins", label: "Contact Time (mins)" },
    { key: "standingTimeDays", label: "Standing Time (days)" },
    { key: "completedBy", label: "Completed By" }, { key: "verifiedBy", label: "Verified By" },
    { key: "costPence", label: "Cost (£)", fmt: (r: Record<string, unknown>) => r.costPence ? `£${(Number(r.costPence) / 100).toFixed(2)}` : "" },
    { key: "invoiceRef", label: "Invoice Ref" },
    { key: "swabsTaken", label: "Swabs Taken", fmt: (r: Record<string, unknown>) => r.swabsTaken ? "Yes" : "No" },
    { key: "swabResults", label: "Swab Results" }, { key: "notes", label: "Notes" },
  ];

  function printCleanouts() {
    const fmtD = (d: unknown) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const trs = filteredCoList.map(r => `<tr><td>${fmtD(r.cleanoutStartDate)}</td><td>${fmtD(r.cleanoutEndDate)}</td><td>${String(r.houseName ?? "—")}</td><td>${String(r.disinfectantUsed ?? "—")}</td><td>${r.performedByContractor ? `Yes — ${String(r.contractorName ?? "")}` : "No"}</td><td>${r.standingTimeDays ? `${r.standingTimeDays}d` : "—"}</td><td>${r.swabsTaken ? "Yes" : "No"}</td><td>${r.costPence ? `£${(Number(r.costPence) / 100).toFixed(2)}` : "—"}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Cleanout Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>House Cleanout &amp; Disinfection Records</h1><h2>${filteredCoList.length} record${filteredCoList.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Start Date</th><th>End Date</th><th>House</th><th>Disinfectant</th><th>Contractor</th><th>Standing Time</th><th>Swabs Taken</th><th>Cost</th></tr></thead><tbody>${trs}</tbody></table></body></html>`;
    openPrintWindow(html);
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-semibold text-sm">House Cleanout & Disinfection Records</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredCoList, "cleanout-records.csv", coCsvCols)} disabled={!filteredCoList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          {filteredCoList.length > 0 && <Button size="sm" variant="outline" onClick={printCleanouts}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Cleanout</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={yearFilterCO} onValueChange={setYearFilterCO}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {coYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={houseFilterCO} onValueChange={setHouseFilterCO}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="All houses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All houses</SelectItem>
            {houses.map(h => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.houseName ?? h.id)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {!isLoading && coList.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cleanout Summary</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Cleanouts" value={filteredCoList.length} />
            <StatCard label="Avg Standing Time" value={avgStanding !== null ? `${avgStanding} days` : "—"} sub="before restocking" />
            <StatCard label="Swab Records" value={swabsTakenCount} sub={`of ${filteredCoList.length} cleanouts`} />
            <StatCard label="Contractor Cleans" value={contractorCount} sub={totalCostPence > 0 ? `£${(totalCostPence / 100).toFixed(2)} total` : topDisinf.length > 18 ? topDisinf.slice(0, 16) + "…" : topDisinf} />
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "cleanoutStartDate", label: "Start Date", fmt: r => fmtDate(r.cleanoutStartDate) },
        { key: "houseName", label: "House", fmt: r => r.houseName ? String(r.houseName) : fmt(r.houseId) },
        { key: "flockNumber", label: "Flock", fmt: r => r.flockNumber ? String(r.flockNumber) : "—" },
        { key: "cleanoutEndDate", label: "End Date", fmt: r => fmtDate(r.cleanoutEndDate) },
        { key: "performedByContractor", label: "By", fmt: r => r.performedByContractor ? "Contractor" : "Farm staff" },
        { key: "disinfectantUsed", label: "Disinfectant" },
        { key: "standingTimeDays", label: "Standing (days)" },
        { key: "verifiedBy", label: "Verified By" },
        { key: "_attach", label: "", render: r => r.id ? <RecordAttachments farmId={farmId} recordType="poultry-house-cleanout" recordId={r.id as number} compact /> : null },
      ]} rows={filteredCoList} onEdit={r => openEditCO(r as Record<string, unknown>)} onDelete={r => del.mutate(r.id as number)} onView={setViewRecord} />}

      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "48rem" }}>
            <DialogHeader><DialogTitle>Cleanout Record — {String(viewRecord.houseName ?? "House")}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm max-h-[65vh] overflow-y-auto pr-1">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Start Date</p><p className="font-medium">{fmtDate(viewRecord.cleanoutStartDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">End Date</p><p className="font-medium">{fmtDate(viewRecord.cleanoutEndDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">House</p><p className="font-medium">{String(viewRecord.houseName ?? viewRecord.houseId ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock (outgoing)</p><p className="font-medium">{String(viewRecord.flockNumber ?? "—")}</p></div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Performed By</p>
                {viewRecord.performedByContractor
                  ? <p className="font-medium flex items-center gap-1"><HardHat className="w-3.5 h-3.5 text-amber-600" /><span className="text-amber-700">Contractor</span>{viewRecord.contractorName && <span className="text-foreground/70 font-normal"> — {String(viewRecord.contractorName)}</span>}</p>
                  : <p className="font-medium flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-600" />{String(viewRecord.completedBy || "Farm staff")}</p>}
              </div>
              {viewRecord.performedByContractor && (
                <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Own Supplies</p><p className="font-medium">{viewRecord.contractorOwnSupplies ? "Yes — contractor's own" : "No — farm supplies used"}</p></div>
              )}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Primary Disinfectant</p><p className="font-medium">{String(viewRecord.disinfectantUsed ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">DEFRA Approval No.</p><p className="font-medium">{String(viewRecord.disinfectantApprovalNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dilution Rate</p><p className="font-medium">{String(viewRecord.dilutionRate ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Contact Time (mins)</p><p className="font-medium">{String(viewRecord.contactTimeMins ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Standing Time (days)</p><p className="font-medium">{String(viewRecord.standingTimeDays ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Verified By</p><p className="font-medium">{String(viewRecord.verifiedBy ?? "—")}</p></div>
              {(viewRecord.costPence || viewRecord.invoiceRef) && (
                <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Cost / Invoice</p>
                  <p className="font-medium">{viewRecord.costPence ? `£${(Number(viewRecord.costPence) / 100).toFixed(2)}` : "—"}{viewRecord.invoiceRef && <span className="text-muted-foreground font-normal ml-2 text-xs">{String(viewRecord.invoiceRef)}</span>}</p>
                </div>
              )}
              {Array.isArray(viewRecord.consumptions) && (viewRecord.consumptions as unknown[]).length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Products / Stock Used</p>
                  <div className="space-y-1">
                    {(viewRecord.consumptions as Array<Record<string, unknown>>).map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium">{String(c.productName ?? c.stockItemName ?? `Item #${c.stockItemId}`)}</span>
                        <span className="text-muted-foreground">—</span>
                        <span className="font-medium">{String(c.quantityUsed)}{c.stockItemUnit ? ` ${c.stockItemUnit}` : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Swabs Taken</p><p className="font-medium">{viewRecord.swabsTaken ? "Yes" : "No"}</p></div>
              {viewRecord.swabResults && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Swab Results</p><p className="font-medium">{String(viewRecord.swabResults)}</p></div>}
              {viewRecord.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes)}</p></div>}
            </div>
            <div className="border rounded-lg p-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="poultry-house-cleanout" recordId={viewRecord.id as number} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEditCO(viewRecord); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); else setOpen(true); }}>
        <DialogContent style={{ maxWidth: "48rem" }}>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} House Cleanout Record</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[72vh] overflow-y-auto pr-1">

            <div className="grid grid-cols-2 gap-3">
              <div><Label>House *</Label>
                <Select value={String(form.houseId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, houseId: v === "__none__" ? "" : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— Select house —</SelectItem>
                    {houses.map(h => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.houseName ?? h.id)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Flock (outgoing)</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
              <div><Label>Cleanout Start *</Label><Input type="date" value={String(form.cleanoutStartDate ?? "")} onChange={e => setForm(f => ({ ...f, cleanoutStartDate: e.target.value }))} /></div>
              <div><Label>Cleanout End</Label><Input type="date" value={String(form.cleanoutEndDate ?? "")} onChange={e => setForm(f => ({ ...f, cleanoutEndDate: e.target.value }))} /></div>
            </div>

            <div className="border rounded-xl p-3 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Performed By</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setForm(f => ({ ...f, performedByContractor: false }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 text-sm font-medium transition-all ${!form.performedByContractor ? "border-green-600 bg-green-50 text-green-700" : "border-border text-muted-foreground hover:border-green-400"}`}>
                  <Users className="w-4 h-4" /> Farm Staff
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, performedByContractor: true }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 text-sm font-medium transition-all ${form.performedByContractor ? "border-amber-500 bg-amber-50 text-amber-700" : "border-border text-muted-foreground hover:border-amber-400"}`}>
                  <HardHat className="w-4 h-4" /> Contractor
                </button>
              </div>
              {form.performedByContractor ? (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Contractor Name *</Label><BuyerCombobox farmId={farmId!} types={["contractor", "general"]} valueId={(form.contractorSupplierId as number) ?? null} valueName={String(form.contractorName ?? "")} onChange={(id, name) => setForm(f => ({ ...f, contractorSupplierId: id, contractorName: name }))} /></div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <Checkbox checked={Boolean(form.contractorOwnSupplies)} onCheckedChange={v => setForm(f => ({ ...f, contractorOwnSupplies: Boolean(v) }))} />
                      <span className="text-sm text-muted-foreground">Contractor's own supplies</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Completed By</Label><StaffSelect value={String(form.completedBy ?? "")} onChange={v => setForm(f => ({ ...f, completedBy: v }))} staffNames={coStaffNames} loading={coMembersLoading} /></div>
                  <div><Label>Verified By</Label><StaffSelect value={String(form.verifiedBy ?? "")} onChange={v => setForm(f => ({ ...f, verifiedBy: v }))} staffNames={coStaffNames} loading={coMembersLoading} /></div>
                </div>
              )}
            </div>

            <div className="border rounded-xl p-3 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Primary Disinfectant (DEFRA Approved)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Select value={String(form.disinfectantUsed ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, disinfectantUsed: v === "__none__" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>{APPROVED_DISINFECTANTS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Input placeholder="DEFRA Approval No. (from label)" value={String(form.disinfectantApprovalNumber ?? "")} onChange={e => setForm(f => ({ ...f, disinfectantApprovalNumber: e.target.value }))} /></div>
                <div><Label>Dilution Rate</Label><Input placeholder="e.g. 1:100, 1%" value={String(form.dilutionRate ?? "")} onChange={e => setForm(f => ({ ...f, dilutionRate: e.target.value }))} /></div>
                <div><Label>Contact Time (mins)</Label><Input type="number" value={String(form.contactTimeMins ?? "")} onChange={e => setForm(f => ({ ...f, contactTimeMins: e.target.value }))} /></div>
                <div><Label>Standing Time (days)</Label><Input type="number" value={String(form.standingTimeDays ?? "")} onChange={e => setForm(f => ({ ...f, standingTimeDays: e.target.value }))} /></div>
              </div>
            </div>

            {!form.contractorOwnSupplies && (
              <div className="border rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />All Products Used — Stock & Cost Tracking</p>
                <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
                  {selectedProducts.map(p => (
                    <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                      {p}
                      <button type="button" onClick={() => setSelectedProducts(pp => pp.filter(x => x !== p))} className="hover:text-red-500"><XIcon className="w-3 h-3" /></button>
                    </span>
                  ))}
                  {selectedProducts.length === 0 && <span className="text-xs text-muted-foreground italic self-center">No products added yet</span>}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Type product name (e.g. pre-wash agent, insecticide)…" value={customProduct} onChange={e => setCustomProduct(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const v = customProduct.trim(); if (v) { setSelectedProducts(pp => pp.includes(v) ? pp : [...pp, v]); setCustomProduct(""); } } }}
                    className="flex-1 text-sm h-9" />
                  <Button type="button" variant="outline" className="h-9 px-3 shrink-0" disabled={!customProduct.trim()}
                    onClick={() => { const v = customProduct.trim(); if (v) { setSelectedProducts(pp => pp.includes(v) ? pp : [...pp, v]); setCustomProduct(""); } }}>Add</Button>
                </div>
                {selectedProducts.length > 0 && (
                  <div className="space-y-1 mt-1">
                    {selectedProducts.map(product => {
                      const consumption = stockConsumptions[product] ?? { stockItemId: "", quantity: "" };
                      const norm = product.toLowerCase();
                      const matched = stockForDrop.filter(s => s.name.toLowerCase().includes(norm) || norm.includes(s.name.toLowerCase()));
                      const others = stockForDrop.filter(s => !matched.includes(s));
                      const linkedItem = stockForDrop.find(s => s.id === Number(consumption.stockItemId));
                      return (
                        <div key={product} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
                          <span className="text-xs font-medium text-muted-foreground min-w-0 w-36 truncate" title={product}>{product}</span>
                          <span className="text-muted-foreground/30 shrink-0">→</span>
                          <select value={consumption.stockItemId}
                            onChange={e => setStockConsumptions(prev => ({ ...prev, [product]: { ...prev[product] ?? { quantity: "" }, stockItemId: e.target.value } }))}
                            className="flex-1 h-8 rounded-md border border-border bg-transparent px-2 text-xs focus:outline-none focus:border-primary min-w-0">
                            <option value="">Link stock item…</option>
                            {matched.length > 0 && <optgroup label="── Matched">{matched.map(s => <option key={s.id} value={s.id}>{s.name}{s.unit ? ` (${s.unit})` : ""}</option>)}</optgroup>}
                            {others.length > 0 && <optgroup label={matched.length > 0 ? "── Other stock" : "── Stock items"}>{others.map(s => <option key={s.id} value={s.id}>{s.name}{s.unit ? ` (${s.unit})` : ""}</option>)}</optgroup>}
                          </select>
                          <div className="flex items-center gap-1 shrink-0">
                            <Input className="w-20 h-8 text-xs" placeholder="Qty" value={consumption.quantity} disabled={!consumption.stockItemId}
                              onChange={e => setStockConsumptions(prev => ({ ...prev, [product]: { ...prev[product] ?? { stockItemId: "" }, quantity: e.target.value } }))} />
                            {linkedItem?.unit && <span className="text-xs text-muted-foreground w-8 shrink-0">{linkedItem.unit}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {stockItems.length === 0 && selectedProducts.length > 0 && <p className="text-xs text-amber-600">No stock items on register — add them in Stock & Suppliers to link quantities.</p>}
              </div>
            )}

            {form.performedByContractor && (
              <div className="border rounded-xl p-3 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cost & Invoice</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Cost (£)</Label>
                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">£</span>
                      <Input className="pl-7" type="number" step="0.01" min="0" placeholder="0.00" value={String(form.costPence ? (Number(form.costPence) / 100).toFixed(2) : "")} onChange={e => setForm(f => ({ ...f, costPence: e.target.value }))} />
                    </div>
                  </div>
                  <div><Label>Invoice / PO Reference</Label><Input placeholder="e.g. INV-2024-001" value={String(form.invoiceRef ?? "")} onChange={e => setForm(f => ({ ...f, invoiceRef: e.target.value }))} /></div>
                  <div><Label>Verified By</Label><StaffSelect value={String(form.verifiedBy ?? "")} onChange={v => setForm(f => ({ ...f, verifiedBy: v }))} staffNames={coStaffNames} loading={coMembersLoading} /></div>
                </div>
              </div>
            )}

            <div className="border rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Swab Testing</p>
              <div className="flex items-center gap-2"><Checkbox id="swabs" checked={Boolean(form.swabsTaken)} onCheckedChange={v => setForm(f => ({ ...f, swabsTaken: Boolean(v) }))} /><Label htmlFor="swabs">Swabs taken?</Label></div>
              {form.swabsTaken && <div><Label>Swab Results</Label><Input value={String(form.swabResults ?? "")} onChange={e => setForm(f => ({ ...f, swabResults: e.target.value }))} /></div>}
              {form.swabsTaken && (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                  <p className="font-semibold">Do not restock until negative swab results received.</p>
                  <p className="mt-0.5">Salmonella and Campylobacter results must be confirmed clear before new birds enter this house. Retain result documentation for FSA and Red Lion / Red Tractor audit.</p>
                </div>
              )}
            </div>

            <div><Label>Notes</Label><Input value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>

            {editing && (
              <div className="border rounded-lg p-3">
                <RecordAttachments farmId={farmId} recordType="poultry-house-cleanout" recordId={(editing as Record<string, unknown>).id as number} />
              </div>
            )}
            {!editing && <p className="text-xs text-muted-foreground flex items-center gap-1"><span>📎</span> Save first, then re-open to attach photos or documents.</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={doSave} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EnvironmentalLogsTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const flocks = useFlocks(farmId);
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "poultry-environmental-logs", "poultry-env-logs");
  const envList = (records ?? []) as Record<string, unknown>[];
  const [flockFilterEnv, setFlockFilterEnv] = useState("all");
  const [yearFilterEnv, setYearFilterEnv] = useState("all");
  const [dateFromEnv, setDateFromEnv] = useState("");
  const [dateToEnv, setDateToEnv] = useState("");
  const envYears = useMemo(() => Array.from(new Set(envList.map(r => String(r.logDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [envList]);
  const filteredEnvList = envList.filter(r =>
    (flockFilterEnv === "all" || String(r.flockId) === flockFilterEnv) &&
    (yearFilterEnv === "all" || String(r.logDate ?? "").startsWith(yearFilterEnv)) &&
    (!dateFromEnv || String(r.logDate ?? "") >= dateFromEnv) &&
    (!dateToEnv || String(r.logDate ?? "") <= dateToEnv)
  );
  const withTemp = filteredEnvList.filter(r => r.temperatureMin != null && r.temperatureMax != null);
  const avgMinTemp = withTemp.length ? (withTemp.reduce((s, r) => s + Number(r.temperatureMin), 0) / withTemp.length).toFixed(1) : null;
  const avgMaxTemp = withTemp.length ? (withTemp.reduce((s, r) => s + Number(r.temperatureMax), 0) / withTemp.length).toFixed(1) : null;
  const withAmm = filteredEnvList.filter(r => r.ammoniaPpm != null);
  const maxAmm = withAmm.length ? Math.max(...withAmm.map(r => Number(r.ammoniaPpm))) : null;
  const avgHum = filteredEnvList.filter(r => r.humidity != null).length ? (filteredEnvList.filter(r => r.humidity != null).reduce((s, r) => s + Number(r.humidity), 0) / filteredEnvList.filter(r => r.humidity != null).length).toFixed(1) : null;
  const alarmCount = filteredEnvList.filter(r => r.alarmActivated).length;
  const ammAlert = maxAmm !== null && maxAmm > 10;
  const ammWarn = maxAmm !== null && maxAmm >= 7 && maxAmm <= 10;
  const envCsvCols = [
    { key: "logDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.logDate) }, { key: "logTime", label: "Time" },
    { key: "flockNumber", label: "Flock" }, { key: "houseName", label: "House" },
    { key: "temperatureMin", label: "Min Temp °C" }, { key: "temperatureMax", label: "Max Temp °C" },
    { key: "humidity", label: "Humidity %" }, { key: "co2Ppm", label: "CO2 ppm" },
    { key: "ammoniaPpm", label: "Ammonia ppm" }, { key: "stockingDensity", label: "Stocking Density kg/m²" },
    { key: "lightingHours", label: "Lighting Hours" },
    { key: "alarmActivated", label: "Alarm", fmt: (r: Record<string, unknown>) => r.alarmActivated ? "Yes" : "No" },
    { key: "alarmDetails", label: "Alarm Details" },
  ];
  function printEnvLogs() {
    const fmtD = (d: unknown) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const trs = filteredEnvList.map(r => `<tr><td>${fmtD(r.logDate)}${r.logTime ? ` ${r.logTime}` : ""}</td><td>${String(r.flockNumber ?? r.flockId ?? "—")}</td><td>${String(r.houseName ?? "—")}</td><td>${r.temperatureMin != null ? `${r.temperatureMin}°C` : "—"}</td><td>${r.temperatureMax != null ? `${r.temperatureMax}°C` : "—"}</td><td>${r.humidity != null ? `${r.humidity}%` : "—"}</td><td>${r.ammoniaPpm != null ? `${r.ammoniaPpm} ppm` : "—"}</td><td>${r.alarmActivated ? "Yes" : "No"}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Environmental Logs</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>Environmental Monitoring Logs</h1><h2>${filteredEnvList.length} record${filteredEnvList.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date/Time</th><th>Flock</th><th>House</th><th>Min Temp</th><th>Max Temp</th><th>Humidity</th><th>Ammonia</th><th>Alarm</th></tr></thead><tbody>${trs}</tbody></table></body></html>`;
    openPrintWindow(html);
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h3 className="font-semibold text-sm">Environmental Monitoring Logs</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredEnvList, "environmental-logs.csv", envCsvCols)} disabled={!filteredEnvList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          {filteredEnvList.length > 0 && <Button size="sm" variant="outline" onClick={printEnvLogs}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => openAdd({ alarmActivated: false })}><Plus className="w-4 h-4 mr-1" />Log Reading</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={yearFilterEnv} onValueChange={setYearFilterEnv}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{envYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={flockFilterEnv} onValueChange={setFlockFilterEnv}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All flocks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All flocks</SelectItem>
            {flocks.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockNumber ?? f.id)}{f.houseName ? ` · ${f.houseName}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <label className="text-xs text-muted-foreground">From</label>
          <input type="date" value={dateFromEnv} onChange={e => setDateFromEnv(e.target.value)} className="h-8 rounded-md border border-input px-2 text-xs bg-background" />
        </div>
        <div className="flex items-center gap-1">
          <label className="text-xs text-muted-foreground">To</label>
          <input type="date" value={dateToEnv} onChange={e => setDateToEnv(e.target.value)} className="h-8 rounded-md border border-input px-2 text-xs bg-background" />
        </div>
        {(flockFilterEnv !== "all" || yearFilterEnv !== "all" || dateFromEnv || dateToEnv) && (
          <button onClick={() => { setFlockFilterEnv("all"); setYearFilterEnv("all"); setDateFromEnv(""); setDateToEnv(""); }} className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground border rounded-md">Clear</button>
        )}
      </div>
      {!isLoading && envList.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Environmental Summary{flockFilterEnv !== "all" || yearFilterEnv !== "all" || dateFromEnv || dateToEnv ? " — Filtered" : " — All Records"}</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Avg Min Temp" value={avgMinTemp !== null ? `${avgMinTemp} °C` : "—"} />
              <StatCard label="Avg Max Temp" value={avgMaxTemp !== null ? `${avgMaxTemp} °C` : "—"} />
              <StatCard label="Avg Humidity" value={avgHum !== null ? `${avgHum}%` : "—"} color={avgHum !== null && Number(avgHum) > 80 ? "amber" : undefined} sub={avgHum !== null && Number(avgHum) > 80 ? "above 80% threshold" : undefined} />
              <StatCard label="Max Ammonia" value={maxAmm !== null ? `${maxAmm} ppm` : "—"} color={ammAlert ? "red" : ammWarn ? "amber" : maxAmm !== null ? "green" : undefined} sub={ammAlert ? "above 10ppm — welfare concern" : ammWarn ? "approaching 10ppm limit" : undefined} />
            </div>
            {alarmCount > 0 && <p className="text-xs text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{alarmCount} alarm activation{alarmCount > 1 ? "s" : ""} recorded — check alarm details in the table below.</p>}
          </div>
          {ammAlert && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs text-red-800"><strong>Ammonia Alert:</strong> Peak reading of {maxAmm} ppm exceeds the 10 ppm welfare threshold. Review ventilation management and check litter condition. Red Tractor and RSPCA Assured require corrective action to be documented.</p>
            </div>
          )}
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable cols={[
        { key: "logDate", label: "Date", fmt: r => fmtDate(r.logDate) },
        { key: "flockNumber", label: "Flock", fmt: fmtFlock },
        { key: "temperatureMin", label: "Min °C" },
        { key: "temperatureMax", label: "Max °C" },
        { key: "humidity", label: "Humidity %" },
        { key: "ammoniaPpm", label: "Ammonia ppm" },
        { key: "stockingDensity", label: "kg/m²" },
      { key: "_attach", label: "", render: r => r.id ? <RecordAttachments recordType="poultry-environmental-logs" recordId={r.id as number} farmId={farmId} compact /> : null },
      ]} rows={filteredEnvList} onDelete={r => del.mutate(r.id as number)} onView={setViewRecord} />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Environmental Log — {fmtDate(viewRecord.logDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p><p className="font-medium">{fmtDate(viewRecord.logDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p><p className="font-medium">{String(viewRecord.logTime ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock</p><p className="font-medium">{fmtFlock(viewRecord)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Min Temperature (°C)</p><p className="font-medium">{viewRecord.temperatureMin != null ? `${viewRecord.temperatureMin} °C` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Max Temperature (°C)</p><p className="font-medium">{viewRecord.temperatureMax != null ? `${viewRecord.temperatureMax} °C` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Humidity (%)</p><p className="font-medium">{viewRecord.humidity != null ? `${viewRecord.humidity}%` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">CO₂ (ppm)</p><p className="font-medium">{viewRecord.co2Ppm != null ? String(viewRecord.co2Ppm) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Ammonia (ppm)</p><p className="font-medium">{viewRecord.ammoniaPpm != null ? String(viewRecord.ammoniaPpm) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Stocking Density (kg/m²)</p><p className="font-medium">{viewRecord.stockingDensity != null ? String(viewRecord.stockingDensity) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lighting Hours</p><p className="font-medium">{viewRecord.lightingHours != null ? String(viewRecord.lightingHours) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Alarm Activated</p><p className="font-medium">{viewRecord.alarmActivated ? "Yes" : "No"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Alarm Details</p><p className="font-medium">{String(viewRecord.alarmDetails ?? "—")}</p></div>
            </div>
            {viewRecord.id && <div className="border-t pt-3"><RecordAttachments farmId={farmId} recordType="poultry-environmental-logs" recordId={viewRecord.id as number} /></div>}
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "40rem" }}>
          <DialogHeader><DialogTitle>Environmental Log</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Date *</Label><Input type="date" value={String(form.logDate ?? "")} onChange={e => setForm(f => ({ ...f, logDate: e.target.value }))} /></div>
            <div><Label>Time</Label><Input type="time" value={String(form.logTime ?? "")} onChange={e => setForm(f => ({ ...f, logTime: e.target.value }))} /></div>
            <div><Label>Flock *</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            <div><Label>Min Temp (°C)</Label><Input type="number" step="0.1" value={String(form.temperatureMin ?? "")} onChange={e => setForm(f => ({ ...f, temperatureMin: e.target.value }))} /></div>
            <div><Label>Max Temp (°C)</Label><Input type="number" step="0.1" value={String(form.temperatureMax ?? "")} onChange={e => setForm(f => ({ ...f, temperatureMax: e.target.value }))} /></div>
            <div><Label>Humidity (%)</Label><Input type="number" step="0.1" value={String(form.humidity ?? "")} onChange={e => setForm(f => ({ ...f, humidity: e.target.value }))} /></div>
            <div><Label>CO₂ (ppm)</Label><Input type="number" value={String(form.co2Ppm ?? "")} onChange={e => setForm(f => ({ ...f, co2Ppm: e.target.value }))} /></div>
            <div><Label>Ammonia (ppm)</Label><Input type="number" step="0.1" value={String(form.ammoniaPpm ?? "")} onChange={e => setForm(f => ({ ...f, ammoniaPpm: e.target.value }))} /></div>
            <div><Label>Stocking Density (kg/m²)</Label><Input type="number" step="0.01" value={String(form.stockingDensity ?? "")} onChange={e => setForm(f => ({ ...f, stockingDensity: e.target.value }))} /></div>
            <div><Label>Lighting (hours)</Label><Input type="number" step="0.5" value={String(form.lightingHours ?? "")} onChange={e => setForm(f => ({ ...f, lightingHours: e.target.value }))} /></div>
            <div className="flex items-center gap-2 mt-5 col-span-3"><Checkbox id="alarm" checked={Boolean(form.alarmActivated)} onCheckedChange={v => setForm(f => ({ ...f, alarmActivated: Boolean(v) }))} /><Label htmlFor="alarm">Alarm activated?</Label></div>
            <div className="col-span-3"><Label>Alarm Details</Label><Input value={String(form.alarmDetails ?? "")} onChange={e => setForm(f => ({ ...f, alarmDetails: e.target.value }))} /></div>
            {form.alarmActivated && (
              <div className="col-span-3 rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
                <p className="font-semibold">Environmental alarm — investigate cause and record corrective action.</p>
                <p className="mt-0.5">Persistent alarms for temperature, humidity, CO₂, or ammonia must be investigated and resolved promptly. Raise a follow-up task if the cause has not been remedied. Retain this record for Red Tractor welfare audit.</p>
              </div>
            )}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FciTab({ farmId }: { farmId: number }) {
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
      ]} rows={filteredFciList} onDelete={r => del.mutate(r.id as number)} onView={setViewRecord} />}
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
      <Dialog open={open} onOpenChange={setOpen}>
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
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BroilerWelfareTab({ farmId }: { farmId: number }) {
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
        onDelete={r => del.mutate(r.id as number)}
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
      <Dialog open={open} onOpenChange={setOpen}>
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
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save Assessment</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ThinningRecordsTab({ farmId }: { farmId: number }) {
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const flocks = useFlocks(farmId);
  const { data: records, isLoading, open, setOpen, form, setForm, save, del, openAdd } = useCrud(farmId, "poultry-thinning-records", "poultry-thinning");
  const tList = (records ?? []) as Record<string, unknown>[];
  const [flockFilterThin, setFlockFilterThin] = useState("all");
  const [yearFilterThin, setYearFilterThin] = useState("all");
  const yearsThin = useMemo(() => {
    const s = new Set(tList.map(r => String(r.thinningDate ?? "").slice(0, 4)).filter(Boolean));
    return Array.from(s).sort().reverse();
  }, [tList]);
  const filteredThinList = tList.filter(r =>
    (flockFilterThin === "all" || String(r.flockId) === flockFilterThin) &&
    (yearFilterThin === "all" || String(r.thinningDate ?? "").startsWith(yearFilterThin))
  );
  const totalBirdsRemoved = filteredThinList.reduce((s, r) => s + Number(r.birdsRemoved ?? 0), 0);
  const totalDoas = filteredThinList.reduce((s, r) => s + Number(r.doasAtLoading ?? 0), 0);
  const withWeight = filteredThinList.filter(r => r.averageLiveWeightKg != null);
  const avgLiveWeight = withWeight.length ? (withWeight.reduce((s, r) => s + Number(r.averageLiveWeightKg), 0) / withWeight.length).toFixed(2) : null;
  const doaPct = totalBirdsRemoved > 0 ? ((totalDoas / totalBirdsRemoved) * 100).toFixed(2) : null;
  const tCsv = [
    { key: "thinningDate", label: "Date", fmt: (r: Record<string, unknown>) => fmtDate(r.thinningDate) },
    { key: "flockNumber", label: "Flock" }, { key: "houseName", label: "House" },
    { key: "thinningNumber", label: "Thinning No." }, { key: "birdsRemoved", label: "Birds Removed" },
    { key: "doasAtLoading", label: "DOAs at Loading" }, { key: "targetLiveWeightKg", label: "Target Live Wt (kg)" },
    { key: "averageLiveWeightKg", label: "Avg Live Wt (kg)" }, { key: "destinationAbattoir", label: "Abattoir" },
    { key: "catchingContractorName", label: "Catching Contractor" }, { key: "catchingConditions", label: "Catching Conditions" },
    { key: "transportVehicleReg", label: "Vehicle Reg" }, { key: "notes", label: "Notes" },
  ];
  function printThinning() {
    const fmtD = (d: unknown) => d ? new Date(String(d)).toLocaleDateString("en-GB") : "—";
    const trs = filteredThinList.map(r => `<tr><td>${fmtD(r.thinningDate)}</td><td>${String(r.flockNumber ?? r.flockId ?? "—")}</td><td>${String(r.houseName ?? "—")}</td><td>${String(r.thinningNumber ?? "—")}</td><td>${String(r.birdsRemoved ?? "—")}</td><td>${String(r.doasAtLoading ?? "0")}</td><td>${String(r.averageLiveWeightKg ?? "—")}</td><td>${String(r.destinationAbattoir ?? "—")}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Thinning Records</title><style>body{font-family:Arial,sans-serif;font-size:10px;margin:20px}h1{font-size:14px;margin:0 0 2px}h2{font-size:10px;color:#555;margin:0 0 10px}table{width:100%;border-collapse:collapse}th{background:#f9fafb;padding:4px 6px;border:1px solid #e5e7eb;text-align:left;font-size:8px;text-transform:uppercase;letter-spacing:.05em}td{padding:4px 6px;border:1px solid #e5e7eb}@media print{@page{margin:1.5cm}}</style></head><body><h1>Thinning Records</h1><h2>${filteredThinList.length} record${filteredThinList.length !== 1 ? "s" : ""} · Printed: ${new Date().toLocaleDateString("en-GB")}</h2><table><thead><tr><th>Date</th><th>Flock</th><th>House</th><th>Thinning No.</th><th>Birds Removed</th><th>DOAs</th><th>Avg Live Wt (kg)</th><th>Abattoir</th></tr></thead><tbody>${trs}</tbody></table></body></html>`;
    openPrintWindow(html);
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold text-sm">Thinning Records</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record each partial depletion event — numbers removed, live weight, catching details and any DOAs at loading.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredThinList, "thinning-records.csv", tCsv)} disabled={!filteredThinList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          {filteredThinList.length > 0 && <Button size="sm" variant="outline" onClick={printThinning}><Printer className="w-4 h-4 mr-1" />Print</Button>}
          <Button size="sm" onClick={() => openAdd({ thinningNumber: "1", doasAtLoading: "0" })}><Plus className="w-4 h-4 mr-1" />Log Thinning</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={yearFilterThin} onValueChange={setYearFilterThin}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {yearsThin.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={flockFilterThin} onValueChange={setFlockFilterThin}>
          <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="All flocks" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All flocks</SelectItem>
            {flocks.map(f => <SelectItem key={String(f.id)} value={String(f.id)}>{String(f.flockNumber ?? f.id)}{f.houseName ? ` · ${f.houseName}` : ""}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {!isLoading && tList.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thinning Summary</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Events" value={filteredThinList.length} />
            <StatCard label="Total Birds Removed" value={totalBirdsRemoved.toLocaleString()} />
            <StatCard label="Total DOAs" value={totalDoas} color={totalDoas > 0 ? "amber" : "green"} sub={doaPct !== null ? `${doaPct}% of birds removed` : undefined} />
            <StatCard label="Avg Live Weight" value={avgLiveWeight !== null ? `${avgLiveWeight} kg` : "—"} />
          </div>
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "thinningDate", label: "Date", fmt: r => fmtDate(r.thinningDate) },
          { key: "flockNumber", label: "Flock", fmt: fmtFlock },
          { key: "thinningNumber", label: "Thinning No." },
          { key: "birdsRemoved", label: "Birds Removed" },
          { key: "averageLiveWeightKg", label: "Avg Live Wt (kg)" },
          { key: "destinationAbattoir", label: "Abattoir" },
          { key: "doasAtLoading", label: "DOAs at Loading" },
          { key: "doc", label: "Doc", render: (r: Record<string, unknown>) => <DocAttach farmId={farmId} endpoint="poultry-thinning-records" recordId={r.id as number} documentPath={(r as any).documentPath ?? null} documentName={(r as any).documentName ?? null} queryKey={["poultry-thinning", farmId]} compact /> },
        ]}
        rows={filteredThinList}
        onDelete={r => del.mutate(r.id as number)}
        onView={setViewRecord}
      />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>Thinning Record — {fmtDate(viewRecord.thinningDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-2">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Thinning Date</p><p className="font-medium">{fmtDate(viewRecord.thinningDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock</p><p className="font-medium">{fmtFlock(viewRecord)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Thinning Number</p><p className="font-medium">{["", "1st thinning", "2nd thinning", "3rd thinning", "Final depletion"][Number(viewRecord.thinningNumber)] ?? String(viewRecord.thinningNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Birds Removed</p><p className="font-medium">{String(viewRecord.birdsRemoved ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">DOAs at Loading</p><p className="font-medium">{String(viewRecord.doasAtLoading ?? "0")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Target Live Weight (kg)</p><p className="font-medium">{viewRecord.targetLiveWeightKg != null ? `${viewRecord.targetLiveWeightKg} kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Average Live Weight (kg)</p><p className="font-medium">{viewRecord.averageLiveWeightKg != null ? `${viewRecord.averageLiveWeightKg} kg` : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Destination Abattoir</p><p className="font-medium">{String(viewRecord.destinationAbattoir ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Catching Contractor</p><p className="font-medium">{String(viewRecord.catchingContractorName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Catching Start Time</p><p className="font-medium">{String(viewRecord.catchingStartTime ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Catching End Time</p><p className="font-medium">{String(viewRecord.catchingEndTime ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Transport Vehicle Reg</p><p className="font-medium">{String(viewRecord.transportVehicleReg ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Catching Conditions</p><p className="font-medium">{String(viewRecord.catchingConditions ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>Thinning Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Thinning Date *</Label><Input type="date" value={String(form.thinningDate ?? "")} onChange={e => setForm(f => ({ ...f, thinningDate: e.target.value }))} /></div>
            <div><Label>Flock *</Label><FlockSelect flocks={flocks} value={String(form.flockId ?? "")} onChange={v => setForm(f => ({ ...f, flockId: v }))} /></div>
            <div>
              <Label>Thinning Number *</Label>
              <Select value={String(form.thinningNumber ?? "1")} onValueChange={v => setForm(f => ({ ...f, thinningNumber: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["1st thinning", "2nd thinning", "3rd thinning", "Final depletion"].map((o, i) => <SelectItem key={o} value={String(i + 1)}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Birds Removed *</Label><Input type="number" value={String(form.birdsRemoved ?? "")} onChange={e => setForm(f => ({ ...f, birdsRemoved: e.target.value }))} /></div>
            <div><Label>DOAs at Loading</Label><Input type="number" value={String(form.doasAtLoading ?? "0")} onChange={e => setForm(f => ({ ...f, doasAtLoading: e.target.value }))} /></div>
            <div><Label>Target Live Weight (kg)</Label><Input type="number" step="0.01" value={String(form.targetLiveWeightKg ?? "")} onChange={e => setForm(f => ({ ...f, targetLiveWeightKg: e.target.value }))} /></div>
            <div><Label>Average Live Weight (kg)</Label><Input type="number" step="0.01" value={String(form.averageLiveWeightKg ?? "")} onChange={e => setForm(f => ({ ...f, averageLiveWeightKg: e.target.value }))} /></div>
            <div><Label>Destination Abattoir</Label><Input value={String(form.destinationAbattoir ?? "")} onChange={e => setForm(f => ({ ...f, destinationAbattoir: e.target.value }))} /></div>
            <div><Label>Catching Contractor</Label><Input value={String(form.catchingContractorName ?? "")} onChange={e => setForm(f => ({ ...f, catchingContractorName: e.target.value }))} /></div>
            <div><Label>Catching Start Time</Label><Input type="time" value={String(form.catchingStartTime ?? "")} onChange={e => setForm(f => ({ ...f, catchingStartTime: e.target.value }))} /></div>
            <div><Label>Catching End Time</Label><Input type="time" value={String(form.catchingEndTime ?? "")} onChange={e => setForm(f => ({ ...f, catchingEndTime: e.target.value }))} /></div>
            <div><Label>Transport Vehicle Reg</Label><Input value={String(form.transportVehicleReg ?? "")} onChange={e => setForm(f => ({ ...f, transportVehicleReg: e.target.value }))} /></div>
            <div>
              <Label>Catching Conditions</Label>
              <Select value={String(form.catchingConditions ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, catchingConditions: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select conditions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select conditions —</SelectItem>
                  {[
                    "Good — dark, calm conditions",
                    "Good — cool overnight temperatures",
                    "Moderate — some natural light",
                    "Moderate — light wind or breeze",
                    "Poor — high ambient temperature (heat stress risk)",
                    "Poor — wet or adverse weather",
                    "Poor — strong wind",
                    "Emergency — welfare concern raised",
                    "Other (specify in notes)",
                  ].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate({ ...form, flockId: form.flockId ? Number(form.flockId) : null })} disabled={save.isPending}>Save Record</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BioBoolField({ label, field, form, setForm }: { label: string; field: string; form: Record<string, unknown>; setForm: React.Dispatch<React.SetStateAction<Record<string, unknown>>> }) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={`bio-${field}`} checked={Boolean(form[field])} onCheckedChange={v => setForm(f => ({ ...f, [field]: Boolean(v) }))} />
      <Label htmlFor={`bio-${field}`} className="text-sm">{label}</Label>
    </div>
  );
}

function BiosecurityChecklistTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { data: bioMembersData, isLoading: bioMembersLoading } = useFarmMembers(farmId);
  const bioStaffNames = (bioMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const flocks = useFlocks(farmId);
  const { data: rawHouses = [] } = useQuery({ queryKey: ["poultry-houses", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-houses`), { credentials: "include" }).then(r => r.json()) });
  const houses = rawHouses as Record<string, unknown>[];
  const { data: records = [], isLoading } = useQuery({ queryKey: ["poultry-biosecurity", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-biosecurity-checklists`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({
    mutationFn: (b: Record<string, unknown>) => {
      const payload = { ...b };
      if (payload.houseId) payload.houseId = Number(payload.houseId); else payload.houseId = null;
      if (payload.previousFlockId && payload.previousFlockId !== "__none__") payload.previousFlockId = Number(payload.previousFlockId); else payload.previousFlockId = null;
      if (payload.downtimeDays) payload.downtimeDays = Number(payload.downtimeDays); else payload.downtimeDays = null;
      return fetch(editing ? api(`farms/${farmId}/poultry-biosecurity-checklists/${editing.id}`) : api(`farms/${farmId}/poultry-biosecurity-checklists`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(payload) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-biosecurity", farmId] }); setOpen(false); setForm({}); setEditing(null); },
  });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-biosecurity-checklists/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["poultry-biosecurity", farmId] }) });

  const bioList = records as Record<string, unknown>[];
  const [houseFilterBio, setHouseFilterBio] = useState("all");
  const [statusFilterBio, setStatusFilterBio] = useState("all");
  const [yearFilterBio, setYearFilterBio] = useState("all");
  const yearsBio = useMemo(() => Array.from(new Set(bioList.map(r => String(r.cleanoutStartDate ?? "").slice(0, 4)).filter(Boolean))).sort().reverse(), [bioList]);
  const filteredBioList = bioList.filter(r =>
    (houseFilterBio === "all" || String(r.houseId) === houseFilterBio) &&
    (statusFilterBio === "all" || r.overallComplianceStatus === statusFilterBio) &&
    (yearFilterBio === "all" || String(r.cleanoutStartDate ?? "").startsWith(yearFilterBio))
  );
  const compliant = filteredBioList.filter(r => r.overallComplianceStatus === "compliant").length;
  const nonCompliant = filteredBioList.filter(r => r.overallComplianceStatus === "non-compliant").length;
  const inProgress = filteredBioList.filter(r => r.overallComplianceStatus === "in-progress").length;
  const avgDowntime = filteredBioList.filter(r => r.downtimeDays).length ? Math.round(filteredBioList.filter(r => r.downtimeDays).reduce((s, r) => s + Number(r.downtimeDays), 0) / filteredBioList.filter(r => r.downtimeDays).length) : null;
  const bioCsv = [
    { key: "cleanoutStartDate", label: "Start Date", fmt: (r: Record<string, unknown>) => fmtDate(r.cleanoutStartDate) },
    { key: "cleanoutEndDate", label: "End Date", fmt: (r: Record<string, unknown>) => fmtDate(r.cleanoutEndDate) },
    { key: "houseName", label: "House" }, { key: "previousFlockNumber", label: "Previous Flock" },
    { key: "downtimeDays", label: "Downtime (days)" }, { key: "overallComplianceStatus", label: "Status" },
    { key: "completedBy", label: "Completed By" }, { key: "verifiedBy", label: "Verified By" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold text-sm">Biosecurity Checklist — Downtime & Cleanout</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Record end-of-flock biosecurity procedures for each house cleanout to demonstrate Red Tractor and RSPCA Assured compliance. All items must be completed before restocking.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredBioList, "biosecurity-checklists.csv", bioCsv)} disabled={!filteredBioList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ cleanoutStartDate: new Date().toISOString().slice(0, 10), overallComplianceStatus: "in-progress", vehicleRestrictions: true }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Checklist</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={houseFilterBio} onValueChange={setHouseFilterBio}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="All houses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All houses</SelectItem>
            {houses.map(h => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.houseName ?? h.id)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilterBio} onValueChange={setStatusFilterBio}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="non-compliant">Non-Compliant</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
        <Select value={yearFilterBio} onValueChange={setYearFilterBio}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsBio.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
      </div>
      {!isLoading && bioList.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Biosecurity Compliance Summary</p></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Checklists" value={filteredBioList.length} />
            <StatCard label="Compliant" value={compliant} color={compliant === filteredBioList.length ? "green" : "amber"} sub={filteredBioList.length > 0 ? `${Math.round(compliant / filteredBioList.length * 100)}% of records` : undefined} />
            <StatCard label="Non-Compliant" value={nonCompliant} color={nonCompliant > 0 ? "red" : "green"} sub={nonCompliant > 0 ? "action required" : "none"} />
            <StatCard label="Avg Downtime" value={avgDowntime !== null ? `${avgDowntime} days` : "—"} sub="between flocks" />
          </div>
          {inProgress > 0 && <p className="text-xs text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />{inProgress} checklist{inProgress > 1 ? "s" : ""} still in progress — complete before restocking to maintain compliance.</p>}
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "cleanoutStartDate", label: "Cleanout Start", fmt: r => fmtDate(r.cleanoutStartDate) },
          { key: "houseName", label: "House", fmt: r => r.houseName ? String(r.houseName) : fmt(r.houseId) },
          { key: "cleanoutEndDate", label: "Cleanout End", fmt: r => fmtDate(r.cleanoutEndDate) },
          { key: "downtimeDays", label: "Downtime (days)" },
          { key: "overallComplianceStatus", label: "Status" },
          { key: "completedBy", label: "Completed By" },
          { key: "doc", label: "Document", render: r => <DocAttach farmId={farmId} endpoint="poultry-biosecurity-checklists" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["poultry-biosecurity", farmId]} /> },
        ]}
        rows={filteredBioList}
        onEdit={r => { setEditing(r); setForm({ ...r, houseId: r.houseId ? String(r.houseId) : "__none__", previousFlockId: r.previousFlockId ? String(r.previousFlockId) : "__none__" }); setOpen(true); }}
        onDelete={r => del.mutate(r.id as number)}
        onView={setViewRecord}
      />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Biosecurity Checklist</DialogTitle></DialogHeader>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cleanout Start</p><p className="font-medium">{fmtDate(viewRecord.cleanoutStartDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Cleanout End</p><p className="font-medium">{fmtDate(viewRecord.cleanoutEndDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">House</p><p className="font-medium">{String(viewRecord.houseName ?? viewRecord.houseId ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Previous Flock</p><p className="font-medium">{String(viewRecord.previousFlockNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Downtime (days)</p><p className="font-medium">{String(viewRecord.downtimeDays ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p><p className="font-medium">{String(viewRecord.overallComplianceStatus ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Disinfectant Used</p><p className="font-medium">{String(viewRecord.disinfectantUsed ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Dilution Rate</p><p className="font-medium">{String(viewRecord.disinfectantDilutionRate ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Completed By</p><p className="font-medium">{String(viewRecord.completedBy ?? "—")}</p></div>
              <div className="col-span-3 grid grid-cols-2 gap-2 mt-2">
                {[
                  ["catchingComplete", "Catching complete"],
                  ["litterRemoved", "Litter removed"],
                  ["dryCleanComplete", "Dry clean complete"],
                  ["washComplete", "Wash complete"],
                  ["disinfectionComplete", "Disinfection complete"],
                  ["disinfectantApproved", "Disinfectant approved"],
                  ["fumigationComplete", "Fumigation complete"],
                  ["verminControlComplete", "Vermin control complete"],
                  ["waterSystemFlushComplete", "Water system flush"],
                  ["waterSystemDisinfected", "Water system disinfected"],
                  ["feedSystemCleaned", "Feed system cleaned"],
                  ["ventilationChecked", "Ventilation checked"],
                  ["heatingChecked", "Heating checked"],
                  ["footbathsInstalled", "Footbaths installed"],
                  ["vehicleRestrictions", "Vehicle restrictions"],
                  ["visitorLogInPlace", "Visitor log in place"],
                  ["independentAuditCompleted", "Independent audit"],
                ].map(([k, l]) => (
                  <div key={k} className="flex items-center gap-2">
                    <span className={viewRecord[k] ? "text-green-600" : "text-red-600"}>{viewRecord[k] ? "✓" : "✗"}</span>
                    <span className="text-muted-foreground">{l}</span>
                  </div>
                ))}
              </div>
              <div className="col-span-3"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditing(viewRecord); setForm({ ...viewRecord, houseId: viewRecord.houseId ? String(viewRecord.houseId) : "__none__", previousFlockId: viewRecord.previousFlockId ? String(viewRecord.previousFlockId) : "__none__" }); setOpen(true); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "52rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Biosecurity Checklist</DialogTitle></DialogHeader>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Cleanout Start Date *</Label><Input type="date" value={String(form.cleanoutStartDate ?? "")} onChange={e => setForm(f => ({ ...f, cleanoutStartDate: e.target.value }))} /></div>
            <div><Label>Poultry House *</Label>
              <Select value={String(form.houseId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, houseId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                <SelectContent><SelectItem value="__none__">— Select house —</SelectItem>{houses.map(h => <SelectItem key={String(h.id)} value={String(h.id)}>{String(h.houseName ?? h.id)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Previous Flock</Label>
              <Select value={String(form.previousFlockId ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, previousFlockId: v }))}>
                <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— None —</SelectItem>
                  {flocks.map(fl => <SelectItem key={String(fl.id)} value={String(fl.id)}>{String(fl.flockNumber ?? fl.id)}{fl.houseName ? ` — ${fl.houseName}` : ""}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Cleanout End Date</Label><Input type="date" value={String(form.cleanoutEndDate ?? "")} onChange={e => setForm(f => ({ ...f, cleanoutEndDate: e.target.value }))} /></div>
            <div><Label>Downtime Days</Label><Input type="number" min="0" value={String(form.downtimeDays ?? "")} onChange={e => setForm(f => ({ ...f, downtimeDays: e.target.value }))} /></div>
            <div><Label>Overall Status</Label>
              <Select value={String(form.overallComplianceStatus ?? "in-progress")} onValueChange={v => setForm(f => ({ ...f, overallComplianceStatus: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["in-progress", "complete", "non-compliant"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mt-3 mb-1">Biosecurity Checklist Items</p>
          <div className="grid grid-cols-2 gap-2">
            <BioBoolField label="Catching / depopulation complete" field="catchingComplete" form={form} setForm={setForm} />
            <BioBoolField label="Litter / manure fully removed" field="litterRemoved" form={form} setForm={setForm} />
            <BioBoolField label="Dry clean complete (swept out)" field="dryCleanComplete" form={form} setForm={setForm} />
            <BioBoolField label="House washed out (wet clean)" field="washComplete" form={form} setForm={setForm} />
            <BioBoolField label="Disinfection complete" field="disinfectionComplete" form={form} setForm={setForm} />
            <BioBoolField label="Disinfectant is an approved product" field="disinfectantApproved" form={form} setForm={setForm} />
            <BioBoolField label="Fumigation complete" field="fumigationComplete" form={form} setForm={setForm} />
            <BioBoolField label="Vermin / pest control complete" field="verminControlComplete" form={form} setForm={setForm} />
            <BioBoolField label="Water system flushed" field="waterSystemFlushComplete" form={form} setForm={setForm} />
            <BioBoolField label="Water system disinfected" field="waterSystemDisinfected" form={form} setForm={setForm} />
            <BioBoolField label="Feed system cleaned" field="feedSystemCleaned" form={form} setForm={setForm} />
            <BioBoolField label="Ventilation checked" field="ventilationChecked" form={form} setForm={setForm} />
            <BioBoolField label="Heating checked" field="heatingChecked" form={form} setForm={setForm} />
            <BioBoolField label="Footbaths installed at entrances" field="footbathsInstalled" form={form} setForm={setForm} />
            <BioBoolField label="Vehicle restrictions in place" field="vehicleRestrictions" form={form} setForm={setForm} />
            <BioBoolField label="Visitor log in place" field="visitorLogInPlace" form={form} setForm={setForm} />
            <BioBoolField label="Independent audit completed" field="independentAuditCompleted" form={form} setForm={setForm} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <Label>Disinfectant Used</Label>
              <Select value={String(form.disinfectantUsed ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, disinfectantUsed: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select product —</SelectItem>
                  {["Virkon S", "Anigene HLD4V", "FAM 30", "Interkokask", "Kilcox Extra", "Defecto Forte", "Menno Ter Forte", "Biocide Extra", "Glutex (Glutaraldehyde)", "Acticide CMK", "Perasafe (Peracetic Acid)", "DupHast Forte", "Other (specify in notes)"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Dilution Rate</Label><Input placeholder="e.g. 1:200" value={String(form.disinfectantDilutionRate ?? "")} onChange={e => setForm(f => ({ ...f, disinfectantDilutionRate: e.target.value }))} /></div>
            <div>
              <Label>Litter Disposal Method</Label>
              <Select value={String(form.litterDisposalMethod ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, litterDisposalMethod: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select method —</SelectItem>
                  {[
                    "Spread to land — direct application",
                    "Spread to land — via licensed contractor",
                    "Composted on-farm",
                    "Collected by contractor (AD / biogas plant)",
                    "Sold to third party (e.g. mushroom compost)",
                    "Incinerated on-farm",
                    "Incinerated — licensed contractor",
                    "Landfill (licensed)",
                    "Other (specify in notes)",
                  ].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Audit Body</Label>
              <Select value={String(form.auditBody ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, auditBody: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select body" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select audit body —</SelectItem>
                  {["Red Tractor Assurance", "RSPCA Assured", "Soil Association", "Organic Farmers & Growers (OF&G)", "Lion Quality (BEIC)", "M&S Select Farms", "Tesco Nurture", "Internal audit", "Other (specify in notes)"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Completed By</Label><StaffSelect value={String(form.completedBy ?? "")} onChange={v => setForm(f => ({ ...f, completedBy: v }))} staffNames={bioStaffNames} loading={bioMembersLoading} /></div>
            <div>
              <Label>Scheme / Certification</Label>
              <Select value={String(form.schemeCertificationScheme ?? "__none__")} onValueChange={v => setForm(f => ({ ...f, schemeCertificationScheme: v === "__none__" ? "" : v }))}>
                <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Select scheme —</SelectItem>
                  {["Red Tractor Poultry (Broiler)", "Red Tractor Poultry (Turkey)", "Red Tractor Poultry (Laying Hens)", "Lion Quality", "RSPCA Assured", "Organic (Soil Association)", "Organic (OF&G)", "Free Range", "Higher Welfare", "M&S Select Farms", "Other"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2"><Label>Notes / Deficiencies</Label><Textarea value={String(form.notes ?? "")} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SchemeRecordsTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [viewRecord, setViewRecord] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const { data: records = [], isLoading } = useQuery({ queryKey: ["poultry-schemes", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-scheme-records`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []) });
  const save = useMutation({ mutationFn: (b: Record<string, unknown>) => fetch(editing ? api(`farms/${farmId}/poultry-scheme-records/${editing.id}`) : api(`farms/${farmId}/poultry-scheme-records`), { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(b) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-schemes", farmId] }); setOpen(false); setForm({}); setEditing(null); } });
  const del = useMutation({ mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-scheme-records/${id}`), { method: "DELETE", credentials: "include" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["poultry-schemes", farmId] }) });
  const SCHEMES = ["Red Tractor Poultry (Broiler)", "Red Tractor Poultry (Turkey)", "Red Tractor Poultry (Laying Hens)", "Lion Quality", "RSPCA Assured", "Organic (Soil Association)", "Organic (OF&G)", "Free Range", "Higher Welfare", "M&S Select Farms", "Other"];
  const OUTCOMES = ["Pass", "Conditional Pass", "Fail", "Pending", "Under Review"];
  const schList = records as Record<string, unknown>[];
  const [schemeNameFilter, setSchemeNameFilter] = useState("all");
  const [yearFilterSch, setYearFilterSch] = useState("all");
  const yearsSch = useMemo(() => Array.from(new Set(schList.map(r => String(r.assessmentYear ?? "")).filter(Boolean))).sort().reverse(), [schList]);
  const filteredSchList = schList.filter(r => (schemeNameFilter === "all" || String(r.schemeName ?? "") === schemeNameFilter) && (yearFilterSch === "all" || String(r.assessmentYear ?? "") === yearFilterSch));
  const today = new Date();
  const in60Days = new Date(today); in60Days.setDate(today.getDate() + 60);
  const expiringSoon = filteredSchList.filter(r => { if (!r.certificateExpiryDate) return false; const d = new Date(String(r.certificateExpiryDate)); return d >= today && d <= in60Days; });
  const expired = filteredSchList.filter(r => { if (!r.certificateExpiryDate) return false; return new Date(String(r.certificateExpiryDate)) < today; });
  const passes = filteredSchList.filter(r => r.assessmentOutcome === "Pass").length;
  const schCsv = [
    { key: "schemeName", label: "Scheme" }, { key: "certificateNumber", label: "Certificate No." },
    { key: "assessmentYear", label: "Year" }, { key: "assessmentDate", label: "Assessment Date", fmt: (r: Record<string, unknown>) => fmtDate(r.assessmentDate) },
    { key: "certificateExpiryDate", label: "Expiry Date", fmt: (r: Record<string, unknown>) => fmtDate(r.certificateExpiryDate) },
    { key: "assessorName", label: "Assessor" }, { key: "assessorOrganisation", label: "Assessor Organisation" },
    { key: "assessmentOutcome", label: "Outcome" }, { key: "nonConformances", label: "Non-conformances" },
    { key: "correctiveActionRequired", label: "Corrective Action Required" }, { key: "correctiveActionDueDate", label: "Action Due Date", fmt: (r: Record<string, unknown>) => fmtDate(r.correctiveActionDueDate) },
    { key: "notes", label: "Notes" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <div>
          <h3 className="font-semibold text-sm">Assurance Scheme Records</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Log all Red Tractor Poultry, Lion Quality, RSPCA Assured and retailer assurance assessments. Track certificate numbers, assessment dates and non-conformances to maintain compliance status.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredSchList, "scheme-records.csv", schCsv)} disabled={!filteredSchList.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ assessmentYear: String(new Date().getFullYear()), assessmentOutcome: "Pass" }); setOpen(true); }}><Plus className="w-4 h-4 mr-1" />Add Record</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Select value={schemeNameFilter} onValueChange={setSchemeNameFilter}>
          <SelectTrigger className="w-56 h-8 text-xs"><SelectValue placeholder="All schemes" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All schemes</SelectItem>
            {SCHEMES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={yearFilterSch} onValueChange={setYearFilterSch}><SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger><SelectContent><SelectItem value="all">All years</SelectItem>{yearsSch.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent></Select>
      </div>
      {!isLoading && schList.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-muted-foreground" /><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Scheme Compliance Overview</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Schemes Recorded" value={filteredSchList.length} />
              <StatCard label="Passes" value={passes} color={filteredSchList.length > 0 && passes === filteredSchList.length ? "green" : "amber"} />
              <StatCard label="Expiring Soon" value={expiringSoon.length} color={expiringSoon.length > 0 ? "amber" : "green"} sub="within 60 days" />
              <StatCard label="Expired Certificates" value={expired.length} color={expired.length > 0 ? "red" : "green"} sub={expired.length > 0 ? "renew immediately" : "none"} />
            </div>
          </div>
          {(expiringSoon.length > 0 || expired.length > 0) && (
            <div className={`rounded-lg border p-3 space-y-1 ${expired.length > 0 ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"}`}>
              <div className="flex items-center gap-2"><AlertTriangle className={`w-4 h-4 ${expired.length > 0 ? "text-red-600" : "text-amber-600"}`} /><p className={`text-xs font-semibold ${expired.length > 0 ? "text-red-800" : "text-amber-800"}`}>Certificate Expiry Alerts</p></div>
              {expired.map((r, i) => (
                <p key={i} className="text-xs text-red-700 pl-6"><strong>{String(r.schemeName ?? "Unknown scheme")}</strong> — Certificate expired {fmtDate(r.certificateExpiryDate)} — renew immediately to maintain scheme membership.</p>
              ))}
              {expiringSoon.map((r, i) => (
                <p key={i} className="text-xs text-amber-700 pl-6"><strong>{String(r.schemeName ?? "Unknown scheme")}</strong> — Expires {fmtDate(r.certificateExpiryDate)} — renewal due within 60 days.</p>
              ))}
            </div>
          )}
        </div>
      )}
      {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <DataTable
        cols={[
          { key: "schemeName", label: "Scheme" },
          { key: "certificateNumber", label: "Certificate No." },
          { key: "assessmentDate", label: "Assessment Date", fmt: r => fmtDate(r.assessmentDate) },
          { key: "assessorName", label: "Assessor" },
          { key: "assessmentOutcome", label: "Outcome" },
          { key: "certificateExpiryDate", label: "Expires", fmt: r => fmtDate(r.certificateExpiryDate) },
          { key: "nonConformances", label: "Non-conformances" },
          { key: "doc", label: "Document", render: r => <DocAttach farmId={farmId} endpoint="poultry-scheme-records" recordId={r.id as number} documentPath={r.documentPath as string | null} documentName={r.documentName as string | null} queryKey={["poultry-schemes", farmId]} /> },
        ]}
        rows={filteredSchList}
        onEdit={r => { setEditing(r); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); }}
        onDelete={r => del.mutate(r.id as number)}
        onView={setViewRecord}
      />}
      {viewRecord && (
        <Dialog open onOpenChange={() => setViewRecord(null)}>
          <DialogContent style={{ maxWidth: "42rem" }}>
            <DialogHeader><DialogTitle>View Scheme Record</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Scheme Name</p><p className="font-medium">{String(viewRecord.schemeName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate Number</p><p className="font-medium">{String(viewRecord.certificateNumber ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Date</p><p className="font-medium">{fmtDate(viewRecord.assessmentDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessor Name</p><p className="font-medium">{String(viewRecord.assessorName ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Assessment Outcome</p><p className="font-medium">{String(viewRecord.assessmentOutcome ?? "—")}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Certificate Expiry</p><p className="font-medium">{fmtDate(viewRecord.certificateExpiryDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Assessment Due</p><p className="font-medium">{fmtDate(viewRecord.nextAssessmentDate)}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Non-Conformances</p><p className="font-medium">{String(viewRecord.nonConformances ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Action Plan Required</p><p className="font-medium">{String(viewRecord.actionsRequired ?? "—")}</p></div>
              <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{String(viewRecord.notes ?? "—")}</p></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setEditing(viewRecord); setForm(Object.fromEntries(Object.entries(viewRecord).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); setViewRecord(null); }}>Edit</Button>
              <Button onClick={() => setViewRecord(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent style={{ maxWidth: "42rem" }}>
          <DialogHeader><DialogTitle>Assurance Scheme Record</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Scheme Name *</Label>
              <Select value={String(form.schemeName ?? "")} onValueChange={v => setForm(f => ({ ...f, schemeName: v }))}>
                <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
                <SelectContent>{SCHEMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Assessment Date *</Label><Input type="date" value={String(form.assessmentDate ?? "")} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
            <div><Label>Assessment Year</Label><Input type="number" value={String(form.assessmentYear ?? "")} onChange={e => setForm(f => ({ ...f, assessmentYear: e.target.value }))} /></div>
            <div><Label>Assessor Name</Label><Input value={String(form.assessorName ?? "")} onChange={e => setForm(f => ({ ...f, assessorName: e.target.value }))} /></div>
            <div><Label>Outcome</Label>
              <Select value={String(form.assessmentOutcome ?? "Pass")} onValueChange={v => setForm(f => ({ ...f, assessmentOutcome: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{OUTCOMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Certificate Number</Label><Input value={String(form.certificateNumber ?? "")} onChange={e => setForm(f => ({ ...f, certificateNumber: e.target.value }))} /></div>
            <div><Label>Certificate Expiry Date</Label><Input type="date" value={String(form.certificateExpiryDate ?? "")} onChange={e => setForm(f => ({ ...f, certificateExpiryDate: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Non-conformances / Observations</Label><Textarea value={String(form.nonConformances ?? "")} onChange={e => setForm(f => ({ ...f, nonConformances: e.target.value }))} rows={2} /></div>
            <div className="col-span-2"><Label>Actions Required</Label><Textarea value={String(form.actionsRequired ?? "")} onChange={e => setForm(f => ({ ...f, actionsRequired: e.target.value }))} rows={2} /></div>
            <div><Label>Actions Completed By Date</Label><Input type="date" value={String(form.actionsCompletedByDate ?? "")} onChange={e => setForm(f => ({ ...f, actionsCompletedByDate: e.target.value }))} /></div>
            <div><Label>Next Assessment Due</Label><Input type="date" value={String(form.nextAssessmentDate ?? "")} onChange={e => setForm(f => ({ ...f, nextAssessmentDate: e.target.value }))} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── POULTRY FEED TAB ──────────────────────────────────────────────────────────
function PoultryFeedTab({ farmId }: { farmId: number }) {
  const [subTab, setSubTab] = useState<"deliveries" | "consumption">("deliveries");

  const { data: raw, isLoading } = useQuery({
    queryKey: ["poultry-deliveries-view", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/feed-deliveries`), { credentials: "include" }).then(r => r.json()),
    enabled: subTab === "deliveries",
  });
  const all: Record<string, unknown>[] = Array.isArray(raw) ? raw : (raw?.records ?? []);
  const poultryDeliveries = all.filter(d => {
    const sp = String(d.speciesIntended ?? "").toLowerCase();
    return sp === "poultry" || sp === "mixed";
  }).sort((a, b) => String(b.deliveryDate ?? "").localeCompare(String(a.deliveryDate ?? "")));
  const [yearFilterFeed, setYearFilterFeed] = useState("all");
  const deliveryYears = [...new Set(poultryDeliveries.map(d => String(d.deliveryDate ?? "").slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a));
  const filteredDeliveries = yearFilterFeed === "all" ? poultryDeliveries : poultryDeliveries.filter(d => String(d.deliveryDate ?? "").startsWith(yearFilterFeed));

  return (
    <div className="space-y-4">
      <div className="flex gap-0 border-b">
        {(["deliveries", "consumption"] as const).map(t => (
          <button key={t} onClick={() => setSubTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${subTab === t ? "border-green-600 text-green-700" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "deliveries" ? "Feed Deliveries" : "Flock Consumption Records"}
          </button>
        ))}
      </div>
      {subTab === "deliveries" ? (
        <div className="space-y-3">
          <div className="p-3 rounded-lg border border-blue-100 bg-blue-50 flex items-start gap-2">
            <Truck className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800">
              Showing all feed deliveries from <strong>Feed Management</strong> where species is set to <em>Poultry</em> or <em>Mixed</em>. To add a delivery, go to Feed Management → Delivery Records.
            </p>
          </div>
          {deliveryYears.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Select value={yearFilterFeed} onValueChange={setYearFilterFeed}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {deliveryYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : filteredDeliveries.length === 0 ? (
            <Empty msg={poultryDeliveries.length === 0 ? 'No poultry or mixed-species feed deliveries on record. Log a delivery in Feed Management with species set to "Poultry" or "Mixed".' : "No deliveries match the selected year."} />
          ) : (
            <div className="space-y-2">
              {filteredDeliveries.map((r, i) => (
                <div key={i} className="border rounded-lg p-3 bg-white">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-medium text-sm">{fmt(r.supplierName)}</span>
                        {String(r.speciesIntended ?? "").toLowerCase() === "mixed" && (
                          <Badge className="text-xs" style={{ background: "#fef9c3", color: "#854d0e", border: "none" }}>Mixed species</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                        <span><span className="font-medium text-foreground/70">Date:</span> {fmtDate(r.deliveryDate)}</span>
                        <span><span className="font-medium text-foreground/70">Type:</span> {fmt(r.feedType)}</span>
                        <span><span className="font-medium text-foreground/70">Qty:</span> {fmt(r.quantityKg)} kg</span>
                        {!!r.productName && <span><span className="font-medium text-foreground/70">Product:</span> {fmt(r.productName)}</span>}
                        {!!r.batchNumber && <span><span className="font-medium text-foreground/70">Batch:</span> {fmt(r.batchNumber)}</span>}
                        {!!r.deliveryNoteNumber && <span><span className="font-medium text-foreground/70">Note No.:</span> {fmt(r.deliveryNoteNumber)}</span>}
                        {!!r.ufasNumberOnNote && <span><span className="font-medium text-foreground/70">UFAS No.:</span> {fmt(r.ufasNumberOnNote)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 rounded-lg border border-amber-100 bg-amber-50 flex items-start gap-2">
            <UtensilsCrossed className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-800">
              Flock-level consumption records (daily feed quantities per house/flock) are recorded via the Livestock section's Feed tab, linked to your poultry herds. This ensures one unified consumption record across all livestock species.
            </p>
          </div>
          <Empty msg="Go to Livestock → Feed tab to record daily flock feed consumption linked to your poultry herds." />
        </div>
      )}
    </div>
  );
}

type ComplianceStatus = "green" | "amber" | "red" | "grey";
type SummaryItem = { count: number; status: ComplianceStatus; label: string; lastDate?: string | null; activeCount?: number; activeWithdrawals?: number; highCount?: number; failCount?: number; unclearCount?: number; nonCompliantCount?: number; expiredCount?: number; expiringSoonCount?: number; maxAmm?: number | null };
type ComplianceSummary = { houses: SummaryItem; flocks: SummaryItem; mortality: SummaryItem; treatments: SummaryItem; cleanouts: SummaryItem; envLogs: SummaryItem; fci: SummaryItem; bwi: SummaryItem; thinning: SummaryItem; biosecurity: SummaryItem; schemes: SummaryItem };

function ComplianceCard({ title, icon, item, tab, onGoto }: { title: string; icon: ReactNode; item: SummaryItem; tab: string; onGoto: (t: string) => void }) {
  const borderCls = item.status === "red" ? "border-red-300 bg-red-50" : item.status === "amber" ? "border-amber-300 bg-amber-50" : item.status === "green" ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50";
  const iconCls = item.status === "red" ? "text-red-600" : item.status === "amber" ? "text-amber-600" : item.status === "green" ? "text-green-700" : "text-gray-400";
  const StatusIcon = item.status === "red" ? XCircle : item.status === "amber" ? AlertTriangle : item.status === "green" ? CheckCircle2 : Circle;
  return (
    <button onClick={() => onGoto(tab)} className={`w-full text-left rounded-lg border p-4 space-y-2 hover:shadow-sm transition-shadow ${borderCls}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={iconCls}>{icon}</span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        <StatusIcon className={`w-4 h-4 ${iconCls}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground leading-relaxed">{item.label}</p>
        {item.lastDate && <p className="text-xs text-muted-foreground mt-0.5">Last record: {new Date(item.lastDate).toLocaleDateString("en-GB")}</p>}
      </div>
    </button>
  );
}

function OverviewTab({ farmId, onGoto }: { farmId: number; onGoto: (tab: string) => void }) {
  const { data, isLoading } = useQuery<{ summary: ComplianceSummary }>({
    queryKey: ["poultry-compliance-summary", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-compliance-summary`), { credentials: "include" }).then(r => r.json()),
    refetchInterval: 60000,
  });
  const summary = data?.summary;

  const overallStatus: ComplianceStatus = !summary ? "grey" : (Object.values(summary) as SummaryItem[]).some(s => s.status === "red") ? "red" : (Object.values(summary) as SummaryItem[]).some(s => s.status === "amber") ? "amber" : "green";
  const redCount = summary ? (Object.values(summary) as SummaryItem[]).filter(s => s.status === "red").length : 0;
  const amberCount = summary ? (Object.values(summary) as SummaryItem[]).filter(s => s.status === "amber").length : 0;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-sm">Red Tractor Compliance Overview</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Live status across all 12 poultry record categories. Click any card to go straight to that tab.</p>
        </div>
        {summary && (
          <div className={`rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 ${overallStatus === "red" ? "bg-red-100 text-red-700" : overallStatus === "amber" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
            {overallStatus === "green" ? <CheckCircle2 className="w-3.5 h-3.5" /> : overallStatus === "amber" ? <AlertTriangle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {overallStatus === "green" ? "All Clear" : overallStatus === "amber" ? `${amberCount} Attention Needed` : `${redCount} Issue${redCount > 1 ? "s" : ""} Require Action`}
          </div>
        )}
      </div>

      {isLoading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center"><Loader2 className="animate-spin w-4 h-4" />Loading compliance status…</div>}

      {summary && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Farm Setup</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ComplianceCard title="Houses" icon={<Home className="w-4 h-4" />} item={summary.houses} tab="houses" onGoto={onGoto} />
              <ComplianceCard title="Flocks" icon={<Bird className="w-4 h-4" />} item={summary.flocks} tab="flocks" onGoto={onGoto} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Daily Records</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ComplianceCard title="Daily Mortality" icon={<BarChart3 className="w-4 h-4" />} item={summary.mortality} tab="mortality" onGoto={onGoto} />
              <ComplianceCard title="Environmental Logs" icon={<Thermometer className="w-4 h-4" />} item={summary.envLogs} tab="envlogs" onGoto={onGoto} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Treatments & Welfare</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ComplianceCard title="Treatments" icon={<Pill className="w-4 h-4" />} item={summary.treatments} tab="treatments" onGoto={onGoto} />
              <ComplianceCard title="Broiler Welfare (BWI)" icon={<ShieldCheck className="w-4 h-4" />} item={summary.bwi} tab="bwi" onGoto={onGoto} />
              <ComplianceCard title="FCI Documents" icon={<FileText className="w-4 h-4" />} item={summary.fci} tab="fci" onGoto={onGoto} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Biosecurity & Cleanouts</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ComplianceCard title="House Cleanouts" icon={<SprayCan className="w-4 h-4" />} item={summary.cleanouts} tab="cleanouts" onGoto={onGoto} />
              <ComplianceCard title="Biosecurity Checklists" icon={<ClipboardList className="w-4 h-4" />} item={summary.biosecurity} tab="biosecurity" onGoto={onGoto} />
              <ComplianceCard title="Thinning Records" icon={<Scissors className="w-4 h-4" />} item={summary.thinning} tab="thinning" onGoto={onGoto} />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Scheme Certification</p>
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3">
              <ComplianceCard title="Assurance Scheme Records" icon={<Star className="w-4 h-4" />} item={summary.schemes} tab="scheme-records" onGoto={onGoto} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

async function generateAuditPDF(farmId: number) {
  const headers = { credentials: "include" as const };
  const get = (path: string) => fetch(api(`farms/${farmId}/${path}`), headers).then(r => r.json());

  const [housesRes, flocksRes, mortalityRes, treatmentsRes, cleanoutsRes, envRes, fciRes, bwiRes, thinRes, bioRes, schemeRes] = await Promise.all([
    get("poultry-houses"), get("poultry-flocks"), get("poultry-daily-mortality"),
    get("poultry-treatments"), get("poultry-house-cleanouts"), get("poultry-environmental-logs"),
    get("poultry-fci-documents"), get("poultry-broiler-welfare"), get("poultry-thinning-records"),
    get("poultry-biosecurity-checklists"), get("poultry-scheme-records"),
  ]);

  const jsPDFModule = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");
  const jsPDF = jsPDFModule.default;
  const autoTable = autoTableModule.default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const today = new Date().toLocaleDateString("en-GB");

  function addSection(title: string, heads: string[], rows: (string | number)[][], newPage = true) {
    if (newPage) doc.addPage();
    doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 80, 40);
    doc.text(title, 14, 16);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(120, 120, 120);
    doc.text(`Generated ${today} — BDE Farm Trac`, pageW - 14, 16, { align: "right" });
    autoTable(doc, {
      head: [heads], body: rows.map(r => r.map(String)),
      startY: 22, styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [30, 80, 40], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 250, 246] },
    });
  }

  const fd = (v: unknown) => v ? new Date(v as string).toLocaleDateString("en-GB") : "";
  const yn = (v: unknown) => v ? "Yes" : "No";

  doc.setFontSize(20); doc.setFont("helvetica", "bold"); doc.setTextColor(30, 80, 40);
  doc.text("BDE Farm Trac — Poultry Production Audit Report", pageW / 2, 40, { align: "center" });
  doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${today}`, pageW / 2, 52, { align: "center" });
  doc.text("Barnett Davies Enterprises Ltd — Red Tractor Poultry Compliance Records", pageW / 2, 60, { align: "center" });

  const houses = (Array.isArray(housesRes) ? housesRes : housesRes?.houses ?? housesRes?.records ?? []) as Record<string, unknown>[];
  const flocks = (Array.isArray(flocksRes) ? flocksRes : flocksRes?.flocks ?? flocksRes?.records ?? []) as Record<string, unknown>[];
  const mortality = (mortalityRes?.records ?? []) as Record<string, unknown>[];
  const treatments = (treatmentsRes?.records ?? []) as Record<string, unknown>[];
  const cleanouts = (cleanoutsRes?.records ?? []) as Record<string, unknown>[];
  const envLogs = (envRes?.records ?? []) as Record<string, unknown>[];
  const fciDocs = (fciRes?.records ?? []) as Record<string, unknown>[];
  const bwi = (bwiRes?.records ?? []) as Record<string, unknown>[];
  const thinning = (thinRes?.records ?? []) as Record<string, unknown>[];
  const biosecurity = (bioRes?.records ?? []) as Record<string, unknown>[];
  const schemes = (Array.isArray(schemeRes) ? schemeRes : schemeRes?.records ?? []) as Record<string, unknown>[];

  if (houses.length) addSection("Houses", ["Name", "House Type", "Capacity", "Active"],
    houses.map(r => [String(r.houseName ?? ""), String(r.houseType ?? ""), String(r.capacity ?? ""), yn(r.isActive)]));

  if (flocks.length) addSection("Flocks", ["Flock No.", "Breed", "Placement Date", "Placement Count", "Status"],
    flocks.map(r => [String(r.flockNumber ?? ""), String(r.breed ?? ""), fd(r.placementDate), String(r.placementCount ?? ""), String(r.status ?? "")]));

  if (mortality.length) addSection("Daily Mortality Records", ["Date", "Flock", "Daily Mortality", "Running Total", "Percentage", "Main Cause"],
    mortality.map(r => [fd(r.mortalityDate), String(r.flockNumber ?? ""), String(r.dailyMortality ?? ""), String(r.runningTotalMortality ?? ""), `${r.mortalityPercentage ?? ""}%`, String(r.mainCause ?? "")]));

  if (treatments.length) addSection("Treatment Records", ["Date", "Flock", "Product", "Condition", "Route", "Withdrawal Clear Date", "Vet Prescribed"],
    treatments.map(r => [fd(r.treatmentDate), String(r.flockNumber ?? ""), String(r.productName ?? ""), String(r.condition ?? ""), String(r.routeOfAdministration ?? ""), fd(r.withdrawalClearDate), yn(r.prescriptionObtained)]));

  if (cleanouts.length) addSection("House Cleanout Records", ["Start Date", "End Date", "House", "Disinfectant", "Standing Time (days)", "Swabs Taken", "Results"],
    cleanouts.map(r => [fd(r.cleanoutStartDate), fd(r.cleanoutEndDate), String(r.houseName ?? ""), String(r.disinfectantUsed ?? ""), String(r.standingTimeDays ?? ""), yn(r.swabsTaken), String(r.swabResults ?? "")]));

  if (envLogs.length) addSection("Environmental Monitoring Logs", ["Date", "Flock", "Min °C", "Max °C", "Humidity %", "Ammonia ppm", "Alarm"],
    envLogs.map(r => [fd(r.logDate), String(r.flockNumber ?? ""), String(r.temperatureMin ?? ""), String(r.temperatureMax ?? ""), String(r.humidity ?? ""), String(r.ammoniaPpm ?? ""), yn(r.alarmActivated)]));

  if (fciDocs.length) addSection("Food Chain Information (FCI) Documents", ["Date", "Flock", "Abattoir", "Birds", "Withdrawal Clear", "Meds Last 7 Days", "Signed"],
    fciDocs.map(r => [fd(r.documentDate), String(r.flockNumber ?? ""), String(r.destinationAbattoir ?? ""), String(r.numberOfBirds ?? ""), yn(r.withdrawalPeriodClear), yn(r.medicationsLast7Days), yn(r.signedByFarmer)]));

  if (bwi.length) addSection("Broiler Welfare Indicators (BWI)", ["Date", "Flock", "Assessed By", "FPD Score", "Hock Burn", "Gait Score", "Outcome"],
    bwi.map(r => [fd(r.assessmentDate), String(r.flockNumber ?? ""), String(r.assessedBy ?? ""), String(r.footpadDermatitisScore ?? ""), String(r.hockBurnScore ?? ""), String(r.gaitScore ?? ""), String(r.overallOutcome ?? "")]));

  if (thinning.length) addSection("Thinning Records", ["Date", "Flock", "Thinning No.", "Birds Removed", "DOAs", "Avg Live Wt (kg)", "Abattoir"],
    thinning.map(r => [fd(r.thinningDate), String(r.flockNumber ?? ""), String(r.thinningNumber ?? ""), String(r.birdsRemoved ?? ""), String(r.doasAtLoading ?? "0"), String(r.averageLiveWeightKg ?? ""), String(r.destinationAbattoir ?? "")]));

  if (biosecurity.length) addSection("Biosecurity Checklists", ["Date", "House", "Downtime (days)", "Disinfectant", "Status", "Completed By"],
    biosecurity.map(r => [fd(r.cleanoutStartDate), String(r.houseName ?? ""), String(r.downtimeDays ?? ""), String(r.disinfectantUsed ?? ""), String(r.overallComplianceStatus ?? ""), String(r.completedBy ?? "")]));

  if (schemes.length) addSection("Assurance Scheme Records", ["Scheme", "Certificate No.", "Assessment Date", "Assessor", "Outcome", "Next Assessment Due"],
    schemes.map(r => [String(r.scheme ?? r.schemeName ?? ""), String(r.certificateNumber ?? ""), fd(r.assessmentDate), String(r.assessorName ?? ""), String(r.outcomeStatus ?? r.assessmentOutcome ?? ""), fd(r.nextAssessmentDue ?? r.certificateExpiryDate)]));

  const safeFarmId = String(farmId).replace(/[^a-z0-9]/gi, "");
  doc.save(`poultry-audit-report-farm${safeFarmId}-${today.replace(/\//g, "-")}.pdf`);
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────────
const POULTRY_COLORS = ["#15803d","#a16207","#1d4ed8","#b91c1c","#7c3aed","#0e7490"];

function PoultryAnalyticsTab({ farmId }: { farmId: number }) {
  const { data: flocksRaw } = useQuery({ queryKey: ["poultry-flocks", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()) });
  const { data: treatmentsRaw } = useQuery({ queryKey: ["poultry-treatments", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-treatments`), { credentials: "include" }).then(r => r.json()) });
  const { data: feedRaw } = useQuery({ queryKey: ["poultry-feed", farmId], queryFn: () => fetch(api(`farms/${farmId}/poultry-feed-deliveries`), { credentials: "include" }).then(r => r.json()).catch(() => []) });

  const flocks: Record<string, unknown>[] = useMemo(() => flocksRaw?.records ?? flocksRaw ?? [], [flocksRaw]);
  const treatments: Record<string, unknown>[] = useMemo(() => treatmentsRaw?.records ?? treatmentsRaw ?? [], [treatmentsRaw]);
  const feedDeliveries: Record<string, unknown>[] = useMemo(() => feedRaw?.records ?? feedRaw ?? [], [feedRaw]);

  const totalBirds = useMemo(() => flocks.reduce((s, r) => s + (Number(r.placedCount) || Number(r.initialPlacement) || 0), 0), [flocks]);
  const avgMortRate = useMemo(() => {
    const valid = flocks.filter(r => r.mortalityRate);
    return valid.length ? (valid.reduce((s, r) => s + Number(r.mortalityRate), 0) / valid.length).toFixed(2) : null;
  }, [flocks]);

  const treatmentsByType = useMemo(() => {
    const map: Record<string, number> = {};
    treatments.forEach(r => { const t = String(r.treatmentType || r.medicineType || r.type || "Other"); map[t] = (map[t] || 0) + 1; });
    return Object.entries(map).sort((a,b) => b[1]-a[1]).map(([name, value]) => ({ name: name.length > 14 ? name.slice(0,13)+"…" : name, value }));
  }, [treatments]);

  const flocksByMonth = useMemo(() => {
    const map: Record<string, number> = {};
    flocks.forEach(r => {
      const d = String(r.placementDate || r.placedDate || ""); const k = d.slice(0,7); if (!k || k.length < 7) return;
      map[k] = (map[k] || 0) + 1;
    });
    return Object.entries(map).sort().slice(-12).map(([m, count]) => ({ month: m.slice(5), count }));
  }, [flocks]);

  const noData = flocks.length === 0 && treatments.length === 0;
  if (noData) return (
    <div className="text-center py-16 text-muted-foreground text-sm">
      <BarChart3 className="w-8 h-8 mx-auto mb-3 opacity-30" />
      <p className="font-medium">No data yet</p>
      <p className="text-xs mt-1">Add flock or treatment records to see analytics.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Flocks", value: flocks.length, bg: "bg-amber-50 border-amber-100", text: "text-amber-800", sub: "text-amber-700" },
          { label: "Total Birds Placed", value: totalBirds.toLocaleString(), bg: "bg-green-50 border-green-100", text: "text-green-800", sub: "text-green-700" },
          { label: "Avg Mortality Rate", value: avgMortRate ? `${avgMortRate}%` : "—", bg: "bg-red-50 border-red-100", text: "text-red-800", sub: "text-red-700" },
          { label: "Treatment Events", value: treatments.length, bg: "bg-blue-50 border-blue-100", text: "text-blue-800", sub: "text-blue-700" },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-xl border p-4 text-center`}>
            <p className={`text-2xl font-bold ${c.text}`}>{c.value}</p>
            <p className={`text-xs mt-0.5 ${c.sub}`}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {flocksByMonth.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Flock Placements by Month</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={flocksByMonth} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip formatter={(v) => [`${v}`, "Flocks"]} />
                  <Bar dataKey="count" fill="#a16207" radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {treatmentsByType.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">Treatments by Type</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={treatmentsByType} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                    {treatmentsByType.map((_, i) => <Cell key={i} fill={POULTRY_COLORS[i % POULTRY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}`, "Events"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {feedDeliveries.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-sm mb-3">Feed Deliveries Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold">{feedDeliveries.length}</p><p className="text-xs text-muted-foreground">Deliveries</p></div>
            <div><p className="text-2xl font-bold">{feedDeliveries.reduce((s, r) => s + (Number(r.quantityTonnes) || Number(r.quantityKg) || 0), 0).toFixed(1)}</p><p className="text-xs text-muted-foreground">Total Tonnes/kg</p></div>
            <div><p className="text-2xl font-bold">{[...new Set(feedDeliveries.map(r => r.feedType || r.feedName).filter(Boolean))].length}</p><p className="text-xs text-muted-foreground">Feed Types</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

type Tab = "overview" | "houses" | "flocks" | "purchases" | "quality" | "mortality" | "treatments" | "cleanouts" | "envlogs" | "fci" | "bwi" | "thinning" | "biosecurity" | "scheme-records" | "feed" | "campylobacter" | "vaccination" | "disease-monitoring" | "analytics" | "enterprise" | "transfers" | "transport-welfare";

export default function PoultryProductionPage() {
  const { farmId } = useAppStore();
  const [tab, setTab] = useState<Tab>(() => { const p = new URLSearchParams(window.location.search); const t = p.get("tab") as Tab | null; const valid: Tab[] = ["overview","houses","flocks","purchases","mortality","treatments","cleanouts","envlogs","fci","bwi","thinning","biosecurity","scheme-records","feed","campylobacter","vaccination","disease-monitoring","analytics"]; return t && valid.includes(t) ? t : "overview"; });
  const [generating, setGenerating] = useState(false);
  if (!farmId) return <Redirect to="/" />;

  async function handleGeneratePdf() {
    setGenerating(true);
    try { await generateAuditPDF(farmId!); } catch (e) { console.error("PDF generation failed:", e); } finally { setGenerating(false); }
  }

  return (
    <AppLayout title="Poultry Production">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <TabBar>
            <TabButton active={tab === "overview"} onClick={() => setTab("overview")}><LayoutDashboard className="w-3.5 h-3.5 mr-1" />Overview</TabButton>
            <TabButton active={tab === "houses"} onClick={() => setTab("houses")}><Home className="w-3.5 h-3.5 mr-1" />Houses</TabButton>
            <TabButton active={tab === "flocks"} onClick={() => setTab("flocks")}><Bird className="w-3.5 h-3.5 mr-1" />Flocks</TabButton>
            <TabButton active={tab === "purchases"} onClick={() => setTab("purchases")}><Receipt className="w-3.5 h-3.5 mr-1" />Chick Purchases</TabButton>
            <TabButton active={tab === "quality"} onClick={() => setTab("quality")}><ClipboardCheck className="w-3.5 h-3.5 mr-1" />Placement Quality</TabButton>
            <TabButton active={tab === "mortality"} onClick={() => setTab("mortality")}><BarChart3 className="w-3.5 h-3.5 mr-1" />Mortality</TabButton>
            <TabButton active={tab === "treatments"} onClick={() => setTab("treatments")}><Pill className="w-3.5 h-3.5 mr-1" />Treatments</TabButton>
            <TabButton active={tab === "cleanouts"} onClick={() => setTab("cleanouts")}><SprayCan className="w-3.5 h-3.5 mr-1" />Cleanouts</TabButton>
            <TabButton active={tab === "envlogs"} onClick={() => setTab("envlogs")}><Thermometer className="w-3.5 h-3.5 mr-1" />Environment</TabButton>
            <TabButton active={tab === "fci"} onClick={() => setTab("fci")}><FileText className="w-3.5 h-3.5 mr-1" />FCI Docs</TabButton>
            <TabButton active={tab === "bwi"} onClick={() => setTab("bwi")}><ShieldCheck className="w-3.5 h-3.5 mr-1" />Broiler Welfare</TabButton>
            <TabButton active={tab === "thinning"} onClick={() => setTab("thinning")}><Scissors className="w-3.5 h-3.5 mr-1" />Thinning</TabButton>
            <TabButton active={tab === "biosecurity"} onClick={() => setTab("biosecurity")}><ClipboardList className="w-3.5 h-3.5 mr-1" />Biosecurity</TabButton>
            <TabButton active={tab === "scheme-records"} onClick={() => setTab("scheme-records")}><Star className="w-3.5 h-3.5 mr-1" />Scheme Records</TabButton>
            <TabButton active={tab === "feed"} onClick={() => setTab("feed")}><Truck className="w-3.5 h-3.5 mr-1" />Feed</TabButton>
            <TabButton active={tab === "campylobacter"} onClick={() => setTab("campylobacter")}><AlertTriangle className="w-3.5 h-3.5 mr-1" />Campylobacter</TabButton>
            <TabButton active={tab === "vaccination"} onClick={() => setTab("vaccination")}><Syringe className="w-3.5 h-3.5 mr-1" />Vaccination</TabButton>
            <TabButton active={tab === "disease-monitoring"} onClick={() => setTab("disease-monitoring")}><Activity className="w-3.5 h-3.5 mr-1" />Disease Monitoring</TabButton>
            <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}><TrendingUp className="w-3.5 h-3.5 mr-1" />Analytics</TabButton>
            <TabButton active={tab === "enterprise"} onClick={() => setTab("enterprise")}><TrendingUp className="w-3.5 h-3.5 mr-1" />Enterprise Report</TabButton>
            <TabButton active={tab === "transfers"} onClick={() => setTab("transfers")}><ArrowRightLeft className="w-3.5 h-3.5 mr-1" />Inter-Site Transfers</TabButton>
            <TabButton active={tab === "transport-welfare"} onClick={() => setTab("transport-welfare")}><ShieldAlert className="w-3.5 h-3.5 mr-1" />Transport Welfare</TabButton>
          </TabBar>
          <Button size="sm" variant="outline" onClick={handleGeneratePdf} disabled={generating} className="ml-3 shrink-0">
            {generating ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <FileDown className="w-3.5 h-3.5 mr-1" />}
            {generating ? "Generating…" : "Audit Report PDF"}
          </Button>
        </div>
        <HpaiBanner farmId={farmId} />
        <Card><CardContent className="pt-4">
          {tab === "overview" && <OverviewTab farmId={farmId} onGoto={t => setTab(t as Tab)} />}
          {tab === "houses" && <HousesTab farmId={farmId} />}
          {tab === "flocks" && <FlocksTab farmId={farmId} />}
          {tab === "purchases" && <ChickPurchasesTab farmId={farmId} />}
          {tab === "quality" && <PlacementQualityTab farmId={farmId} />}
          {tab === "mortality" && <MortalityTab farmId={farmId} />}
          {tab === "treatments" && <TreatmentsTab farmId={farmId} />}
          {tab === "cleanouts" && <CleanoutsTab farmId={farmId} />}
          {tab === "envlogs" && <EnvironmentalLogsTab farmId={farmId} />}
          {tab === "fci" && <FciTab farmId={farmId} />}
          {tab === "bwi" && <BroilerWelfareTab farmId={farmId} />}
          {tab === "thinning" && <ThinningRecordsTab farmId={farmId} />}
          {tab === "biosecurity" && <BiosecurityChecklistTab farmId={farmId} />}
          {tab === "scheme-records" && <SchemeRecordsTab farmId={farmId} />}
          {tab === "feed" && <PoultryFeedTab farmId={farmId} />}
          {tab === "campylobacter" && <CampylobacterMonitoringTab farmId={farmId} />}
          {tab === "vaccination" && <PoultryVaccinationTab farmId={farmId} />}
          {tab === "disease-monitoring" && <PoultryDiseaseMonitoringTab farmId={farmId} />}
          {tab === "analytics" && <PoultryAnalyticsTab farmId={farmId} />}
          {tab === "enterprise" && <PoultryFlockReport farmId={farmId} />}
          {tab === "transfers" && <InterSiteTransfersTab farmId={farmId} />}
          {tab === "transport-welfare" && <TransportWelfareTab farmId={farmId} />}
        </CardContent></Card>
      </div>
    </AppLayout>
  );
}

// ─── Campylobacter Monitoring Tab ─────────────────────────────────────────────
const CAMPY_SAMPLE_TYPES = [
  { value: "boot_swab", label: "Boot Swab (pre-harvest)" },
  { value: "neck_skin", label: "Neck Skin Swab (abattoir)" },
  { value: "caecal_content", label: "Caecal Content (abattoir)" },
  { value: "environmental", label: "Environmental Swab" },
];
const CAMPY_RESULTS = [
  { value: "negative", label: "Negative (<1 log CFU/g)" },
  { value: "positive", label: "Positive" },
  { value: "pending", label: "Pending" },
];
const CAMPY_CATEGORIES = [
  { value: "lowest", label: "Lowest (≤1,000 ccu/g)" },
  { value: "lower", label: "Lower (1,000–10,000 ccu/g)" },
  { value: "higher", label: "Higher (>10,000 ccu/g)" },
];
const FSA_BANDS = [
  { value: "a_very_low", label: "Band A — Very Low" },
  { value: "b_low", label: "Band B — Low" },
  { value: "c_intermediate", label: "Band C — Intermediate" },
  { value: "d_high", label: "Band D — High" },
  { value: "e_very_high", label: "Band E — Very High" },
];

function CampylobacterMonitoringTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewRec, setViewRec] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const { data: allRecordsRaw = [], isLoading } = useQuery({
    queryKey: ["campylobacter-monitoring", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/campylobacter-monitoring`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? []),
    enabled: !!farmId,
  });
  const allCampyRecords: any[] = allRecordsRaw;
  const [yearFilterCampy, setYearFilterCampy] = useState("all");
  const yearsCampy = useMemo(() => {
    const s = new Set(allCampyRecords.map((r: any) => String(r.sampleDate ?? "").slice(0, 4)).filter(Boolean) as string[]);
    return Array.from(s).sort().reverse();
  }, [allCampyRecords]);
  const records: any[] = yearFilterCampy === "all" ? allCampyRecords : allCampyRecords.filter((r: any) => String(r.sampleDate ?? "").startsWith(yearFilterCampy));

  const { data: flocksData } = useQuery({
    queryKey: ["poultry-flocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const flocks: any[] = flocksData?.records ?? flocksData ?? [];

  const { data: housesData } = useQuery({
    queryKey: ["poultry-houses", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-houses`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const houses: any[] = housesData?.records ?? housesData ?? [];

  const [mode, setMode] = useState<"log" | "result" | "edit">("log");
  function openAdd() { setEditing(null); setForm({ sampleType: "boot_swab", result: "pending", zapTriggered: false }); setMode("log"); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setMode("edit"); setOpen(true); }
  function openEnterResult(r: any) { setEditing(r); setForm({ ...r }); setMode("result"); setOpen(true); }

  async function save() {
    const url = editing ? api(`farms/${farmId}/campylobacter-monitoring/${editing.id}`) : api(`farms/${farmId}/campylobacter-monitoring`);
    await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    qc.invalidateQueries({ queryKey: ["campylobacter-monitoring", farmId] });
    setOpen(false);
  }

  async function del(id: number) {
    if (!confirm("Delete this Campylobacter monitoring record?")) return;
    await fetch(api(`farms/${farmId}/campylobacter-monitoring/${id}`), { method: "DELETE", credentials: "include" });
    qc.invalidateQueries({ queryKey: ["campylobacter-monitoring", farmId] });
  }

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const resultBadge = (r: string) => {
    const colours: Record<string, string> = { negative: "bg-green-100 text-green-800", positive: "bg-red-100 text-red-800", pending: "bg-amber-100 text-amber-800" };
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${colours[r] ?? "bg-gray-100 text-gray-700"}`}>{CAMPY_RESULTS.find(x => x.value === r)?.label ?? r}</span>;
  };

  function printCampyReport() {
    const printedDate = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    const rows = records.map((r: any) => `<tr>
      <td>${fmtDate(r.sampleDate)}</td>
      <td>${houses.find((h: any) => h.id === r.houseId)?.houseName ?? "—"}${r.flockId ? ` / ${flocks.find((f: any) => f.id === r.flockId)?.flockNumber ?? ""}` : ""}</td>
      <td>${CAMPY_SAMPLE_TYPES.find(t => t.value === r.sampleType)?.label ?? r.sampleType}</td>
      <td>${CAMPY_RESULTS.find(x => x.value === r.result)?.label ?? r.result}</td>
      <td>${CAMPY_CATEGORIES.find(c => c.value === r.resultCategory)?.label ?? "—"}</td>
      <td>${FSA_BANDS.find(b => b.value === r.fsa_band)?.label ?? "—"}</td>
      <td>${r.zapTriggered ? "ZAP Active" : "No"}</td>
      <td>${r.labName ?? "—"}</td>
      <td>${r.labReference ?? "—"}</td>
      <td>${fmtDate(r.nextSampleDue)}</td>
    </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Campylobacter Monitoring Programme</title>
<style>
  body{font-family:Arial,sans-serif;font-size:10px;color:#000;margin:0;padding:20px}
  h1{font-size:14px;margin:0 0 2px}h2{font-size:11px;margin:0 0 12px;color:#555}
  .hdr{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:14px}
  .hdr-r{text-align:right;font-size:9px;color:#555;line-height:1.8}
  table{width:100%;border-collapse:collapse;margin-bottom:14px}
  th{background:#f9fafb;font-weight:700;font-size:9px;text-transform:uppercase;letter-spacing:.05em;padding:5px 6px;border:1px solid #e5e7eb;text-align:left}
  td{padding:4px 6px;border:1px solid #e5e7eb;vertical-align:top;font-size:10px}
  tr:nth-child(even) td{background:#fafafa}
  .note{font-size:8px;color:#555;border-top:1px solid #e5e7eb;padding-top:8px;margin-top:8px}
  @media print{@page{margin:1.5cm;size:landscape}}
</style></head><body>
<div class="hdr">
  <div><h1>Campylobacter Monitoring Programme</h1><h2>Red Tractor Broiler/Turkey Scheme — Compliance Report</h2></div>
  <div class="hdr-r"><b>${records.length} record${records.length !== 1 ? "s" : ""}</b>${yearFilterCampy !== "all" ? `<br>Year: ${yearFilterCampy}` : ""}<br>Printed: ${printedDate}</div>
</div>
<table>
  <tr><th>Sample Date</th><th>House / Flock</th><th>Sample Type</th><th>Result</th><th>Category</th><th>FSA Band</th><th>ZAP</th><th>Lab</th><th>Lab Ref</th><th>Next Due</th></tr>
  ${rows || "<tr><td colspan='10'>No records</td></tr>"}
</table>
<p class="note">Campylobacter monitoring records produced by BDE Farm Trac (Barnett Davies Enterprises Ltd). Red Tractor requires documented Campylobacter monitoring with structured lab results. Retain for a minimum of 3 years. Printed: ${printedDate}</p>
</body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); w.print(); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Campylobacter Monitoring Programme</h3>
          <p className="text-xs text-gray-500 mt-0.5">Red Tractor Chicken/Turkey scheme requires documented Campylobacter monitoring with structured lab results. FSA bands and Zoonoses Action Plan (ZAP) triggers are recorded here.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={yearFilterCampy} onValueChange={setYearFilterCampy}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue placeholder="All years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {yearsCampy.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={printCampyReport} disabled={records.length === 0}><Printer className="w-3.5 h-3.5 mr-1" />Print</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Sample</Button>
        </div>
      </div>

      {isLoading ? <div className="text-center py-8 text-gray-400 text-sm">Loading…</div> : records.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <p className="font-medium text-gray-600">No Campylobacter records{yearFilterCampy !== "all" ? ` for ${yearFilterCampy}` : ""} yet</p>
          <p className="text-sm text-gray-400 mt-1">Add boot swab or neck skin results for each flock departure.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 bg-gray-50">
              <tr>{["Sample Date","House / Flock","Sample Type","Result","Category","FSA Band","ZAP Triggered","Next Sample","Doc",""].map(h => <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">{fmtDate(r.sampleDate)}</td>
                  <td className="px-3 py-2 text-xs">{houses.find((h: any) => h.id === r.houseId)?.houseName ?? "—"}{r.flockId ? ` / ${flocks.find((f: any) => f.id === r.flockId)?.flockNumber ?? ""}` : ""}</td>
                  <td className="px-3 py-2">{CAMPY_SAMPLE_TYPES.find(t => t.value === r.sampleType)?.label ?? r.sampleType}</td>
                  <td className="px-3 py-2">{resultBadge(r.result)}</td>
                  <td className="px-3 py-2 text-xs">{CAMPY_CATEGORIES.find(c => c.value === r.resultCategory)?.label ?? "—"}</td>
                  <td className="px-3 py-2 text-xs">{FSA_BANDS.find(b => b.value === r.fsa_band)?.label ?? "—"}</td>
                  <td className="px-3 py-2">{r.zapTriggered ? <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">ZAP Active</span> : <span className="text-gray-400 text-xs">No</span>}</td>
                  <td className="px-3 py-2">{fmtDate(r.nextSampleDue)}</td>
                  <td className="px-3 py-2"><DocAttach farmId={farmId} endpoint="campylobacter-monitoring" recordId={r.id as number} documentPath={(r as any).documentPath ?? null} documentName={(r as any).documentName ?? null} queryKey={["campylobacter-monitoring", farmId]} compact /></td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 flex-wrap">
                      {r.result === "pending" && (
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs text-amber-700 border-amber-300 hover:bg-amber-50" onClick={() => openEnterResult(r)}>Enter results</Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setViewRec(r)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-red-500" onClick={() => del(r.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {viewRec && (
        <Dialog open onOpenChange={() => setViewRec(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Campylobacter Sample — {fmtDate(viewRec.sampleDate)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sample Date</p><p className="font-medium">{fmtDate(viewRec.sampleDate)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Sample Type</p><p className="font-medium">{CAMPY_SAMPLE_TYPES.find(t => t.value === viewRec.sampleType)?.label ?? viewRec.sampleType}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">House</p><p className="font-medium">{houses.find((h: any) => h.id === viewRec.houseId)?.houseName ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Flock</p><p className="font-medium">{viewRec.flockId ? (flocks.find((f: any) => f.id === viewRec.flockId)?.flockNumber ?? `Flock #${viewRec.flockId}`) : "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Result</p><p className="font-medium">{resultBadge(viewRec.result)}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Result Category</p><p className="font-medium">{CAMPY_CATEGORIES.find(c => c.value === viewRec.resultCategory)?.label ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">FSA Band</p><p className="font-medium">{FSA_BANDS.find(b => b.value === viewRec.fsa_band)?.label ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">CFU Count</p><p className="font-medium">{viewRec.cfuCount ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ZAP Triggered</p><p className="font-medium">{viewRec.zapTriggered ? "Yes" : "No"}</p></div>
              {viewRec.zapReference && <div><p className="text-xs text-muted-foreground uppercase tracking-wide">ZAP Reference</p><p className="font-medium">{viewRec.zapReference}</p></div>}
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab</p><p className="font-medium">{viewRec.labName ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Lab Reference</p><p className="font-medium">{viewRec.labReference ?? "—"}</p></div>
              <div><p className="text-xs text-muted-foreground uppercase tracking-wide">Next Sample Due</p><p className="font-medium">{fmtDate(viewRec.nextSampleDue)}</p></div>
              {viewRec.actionsTaken && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Actions Taken</p><p className="font-medium">{viewRec.actionsTaken}</p></div>}
              {viewRec.notes && <div className="col-span-2"><p className="text-xs text-muted-foreground uppercase tracking-wide">Notes</p><p className="font-medium">{viewRec.notes}</p></div>}
              {viewRec.id && <div className="col-span-2 border-t pt-3"><RecordAttachments farmId={farmId} recordType="campylobacter-monitoring" recordId={viewRec.id as number} /></div>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { openEdit(viewRec); setViewRec(null); }}>Edit</Button>
              <Button onClick={() => setViewRec(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === "log" ? "Log Campylobacter Sample" : mode === "result" ? "Enter Campylobacter Results" : "Edit Campylobacter Sample Record"}</DialogTitle>
          </DialogHeader>
          {mode === "log" && <p className="text-xs text-muted-foreground -mt-1">Record the sampling event now. Return to enter laboratory results once the report arrives.</p>}
          {mode === "result" && editing && <p className="text-xs text-muted-foreground -mt-1">Sample from <strong>{fmtDate(editing.sampleDate)}</strong> · {CAMPY_SAMPLE_TYPES.find((t: any) => t.value === editing.sampleType)?.label ?? editing.sampleType}{editing.labName ? ` · ${editing.labName}` : ""}. Enter results from your lab report.</p>}
          <div className="grid grid-cols-2 gap-3">
            {mode !== "result" && <>
              <div><Label>Sample Date *</Label><Input type="date" value={form.sampleDate || ""} onChange={e => set("sampleDate", e.target.value)} /></div>
              <div><Label>Sample Type *</Label>
                <Select value={form.sampleType || "boot_swab"} onValueChange={v => set("sampleType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CAMPY_SAMPLE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>House</Label>
                <Select value={String(form.houseId || "__none__")} onValueChange={v => set("houseId", v === "__none__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select house" /></SelectTrigger>
                  <SelectContent><SelectItem value="__none__">— Not specified</SelectItem>{houses.map((h: any) => <SelectItem key={h.id} value={String(h.id)}>{h.houseName}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Flock</Label>
                <Select value={String(form.flockId || "__none__")} onValueChange={v => set("flockId", v === "__none__" ? null : Number(v))}>
                  <SelectTrigger><SelectValue placeholder="Select flock" /></SelectTrigger>
                  <SelectContent><SelectItem value="__none__">— Not specified</SelectItem>{flocks.map((f: any) => <SelectItem key={f.id} value={String(f.id)}>{f.flockNumber}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Samples Taken</Label><Input type="number" min="0" value={form.samplesTaken ?? ""} onChange={e => set("samplesTaken", e.target.value)} /></div>
              <div><Label>Lab Name</Label><Input value={form.labName || ""} onChange={e => set("labName", e.target.value)} /></div>
              <div><Label>Lab Reference</Label><Input value={form.labRef || ""} onChange={e => set("labRef", e.target.value)} placeholder="Submission ref (if known)" /></div>
            </>}
            {mode !== "log" && <>
              <div><Label>Result *</Label>
                <Select value={form.result || "pending"} onValueChange={v => set("result", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CAMPY_RESULTS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>CFU Count (cfu/g)</Label><Input type="number" step="any" value={form.cfuCount ?? ""} onChange={e => set("cfuCount", e.target.value)} /></div>
              <div><Label>Result Category</Label>
                <Select value={form.resultCategory || "__none__"} onValueChange={v => set("resultCategory", v === "__none__" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent><SelectItem value="__none__">— N/A</SelectItem>{CAMPY_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>FSA Band</Label>
                <Select value={form.fsa_band || "__none__"} onValueChange={v => set("fsa_band", v === "__none__" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Select band" /></SelectTrigger>
                  <SelectContent><SelectItem value="__none__">— Not banded</SelectItem>{FSA_BANDS.map(b => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="zap" checked={!!form.zapTriggered} onChange={e => set("zapTriggered", e.target.checked)} className="rounded" />
                <Label htmlFor="zap">ZAP Triggered</Label>
              </div>
              {form.zapTriggered && <div><Label>ZAP Reference</Label><Input value={form.zapReference || ""} onChange={e => set("zapReference", e.target.value)} /></div>}
              <div><Label>Next Sample Due</Label><Input type="date" value={form.nextSampleDue || ""} onChange={e => set("nextSampleDue", e.target.value)} /></div>
              <div className="col-span-2"><Label>Actions Taken</Label><Textarea rows={2} value={form.actionsTaken || ""} onChange={e => set("actionsTaken", e.target.value)} placeholder="Biosecurity, litter management, competitive exclusion…" /></div>
            </>}
            <div className="col-span-2"><Label>Notes</Label><Textarea rows={2} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{mode === "log" ? "Log Sample" : mode === "result" ? "Save Results" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Chick / Poult Placement Quality Assessment ────────────────────────────────
function PlacementQualityTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [editRec, setEditRec] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [flockFilter, setFlockFilter] = useState("all");

  const empty = { flockId: "", assessmentDate: new Date().toISOString().slice(0, 10), assessedBy: "", overallQualityScore: "", uniformityPercent: "", cullCountAtPlacement: "", cullPercentAtPlacement: "", arrivalTemperatureCelsius: "", hatcheryNotified: false, notes: "" };
  const [form, setForm] = useState({ ...empty });

  const assessQ = useQuery({ queryKey: ["placement-quality", farmId], queryFn: () => fetch(`/api/farms/${farmId}/poultry-placement-quality`).then(r => r.json()), enabled: !!farmId, select: (d: any) => d.assessments ?? [] });
  const flocksQ = useQuery({ queryKey: ["poultry-flocks", farmId], queryFn: () => fetch(`/api/farms/${farmId}/poultry-flocks`).then(r => r.json()), enabled: !!farmId, select: (d: any) => d.flocks ?? [] });
  const assessments: any[] = assessQ.data ?? [];
  const flocks: any[] = flocksQ.data ?? [];
  const { data: pqMembersData, isLoading: pqMembersLoading } = useFarmMembers(farmId);
  const pqStaffNames = (pqMembersData?.members ?? []).filter((m: any) => m.isActive).map((m: any) => `${m.firstName} ${m.lastName}`);

  const createMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/poultry-placement-quality`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { toast({ title: "Quality assessment saved" }); qc.invalidateQueries({ queryKey: ["placement-quality", farmId] }); setAddOpen(false); setForm({ ...empty }); }, onError: () => toast({ title: "Failed to save", variant: "destructive" }) });
  const updateMut = useMutation({ mutationFn: ({ id, b }: any) => fetch(`/api/farms/${farmId}/poultry-placement-quality/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { toast({ title: "Assessment updated" }); qc.invalidateQueries({ queryKey: ["placement-quality", farmId] }); setEditRec(null); }, onError: () => toast({ title: "Failed to update", variant: "destructive" }) });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/poultry-placement-quality/${id}`, { method: "DELETE" }), onSuccess: () => { toast({ title: "Assessment deleted" }); qc.invalidateQueries({ queryKey: ["placement-quality", farmId] }); setDeleteId(null); }, onError: () => toast({ title: "Failed to delete", variant: "destructive" }) });

  const fmtD = (d: any) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const flockName = (id: any) => { const f = flocks.find((fl: any) => String(fl.id) === String(id)); return f ? (f.flockName || f.houseNumber || `Flock #${id}`) : `Flock #${id}`; };
  const filtered = flockFilter === "all" ? assessments : assessments.filter((a: any) => String(a.flockId) === flockFilter);
  const scoreColour: Record<string, string> = { excellent: "bg-green-100 text-green-700", good: "bg-blue-100 text-blue-700", acceptable: "bg-amber-100 text-amber-700", poor: "bg-red-100 text-red-700", fail: "bg-red-200 text-red-900" };

  function openEdit(a: any) {
    setEditRec(a);
    setForm({ flockId: String(a.flockId ?? ""), assessmentDate: a.assessmentDate?.slice(0, 10) ?? "", assessedBy: a.assessedBy ?? "", overallQualityScore: a.overallQualityScore ?? "", uniformityPercent: String(a.uniformityPercent ?? ""), cullCountAtPlacement: String(a.cullCountAtPlacement ?? ""), cullPercentAtPlacement: String(a.cullPercentAtPlacement ?? ""), arrivalTemperatureCelsius: String(a.arrivalTemperatureCelsius ?? ""), hatcheryNotified: a.hatcheryNotified ?? false, notes: a.notes ?? "" });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Chick / Poult Quality Assessment at Placement</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Red Tractor requirement: record chick quality assessments at each placement including culls, uniformity, and arrival temperature.</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1" />Add Assessment</Button>
      </div>

      {flocks.length > 0 && (
        <div className="flex items-center gap-2">
          <select className="border border-input rounded-md px-3 py-1.5 text-sm bg-background" value={flockFilter} onChange={e => setFlockFilter(e.target.value)}>
            <option value="all">All Flocks</option>
            {flocks.map((f: any) => <option key={f.id} value={String(f.id)}>{flockName(f.id)}</option>)}
          </select>
          <span className="text-xs text-muted-foreground">{filtered.length} assessment{filtered.length !== 1 ? "s" : ""}</span>
        </div>
      )}

      {assessQ.isLoading && <div className="flex justify-center py-8 text-sm text-muted-foreground gap-2"><Loader2 className="w-4 h-4 animate-spin" />Loading…</div>}
      {!assessQ.isLoading && filtered.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <ClipboardCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-500">No quality assessments recorded</p>
          <p className="text-xs text-gray-400 mt-1">Record chick quality at each placement for full traceability.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((a: any) => {
          const isExp = expandedId === a.id;
          const sc = a.overallQualityScore ? (scoreColour[a.overallQualityScore] || "bg-gray-100 text-gray-600") : "bg-gray-100 text-gray-600";
          return (
            <div key={a.id} className="border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50" onClick={() => setExpandedId(isExp ? null : a.id)}>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{flockName(a.flockId)} — {fmtD(a.assessmentDate)}</p>
                  <p className="text-xs text-muted-foreground">{a.assessedBy ? `by ${a.assessedBy}` : ""}{a.uniformityPercent ? ` · Uniformity ${a.uniformityPercent}%` : ""}{a.cullCountAtPlacement ? ` · ${a.cullCountAtPlacement} culls` : ""}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {a.overallQualityScore && <span className={`text-xs border rounded px-1.5 py-0.5 capitalize ${sc}`}>{a.overallQualityScore}</span>}
                  {a.hatcheryNotified && <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 rounded px-1.5 py-0.5">Hatchery Notified</span>}
                  <button className="p-1 rounded hover:bg-gray-200" onClick={ev => { ev.stopPropagation(); openEdit(a); }}><Pencil className="w-3.5 h-3.5 text-gray-500" /></button>
                  <button className="p-1 rounded hover:bg-red-100" onClick={ev => { ev.stopPropagation(); setDeleteId(a.id); }}><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  {isExp ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {isExp && (
                <div className="border-t bg-gray-50 px-4 py-3 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                  <div><p className="text-xs text-muted-foreground">Overall Quality</p><p className="capitalize">{a.overallQualityScore || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Uniformity</p><p>{a.uniformityPercent ? `${a.uniformityPercent}%` : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Culls at Placement</p><p>{a.cullCountAtPlacement ?? "—"}{a.cullPercentAtPlacement ? ` (${a.cullPercentAtPlacement}%)` : ""}</p></div>
                  <div><p className="text-xs text-muted-foreground">Arrival Temperature</p><p>{a.arrivalTemperatureCelsius ? `${a.arrivalTemperatureCelsius}°C` : "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Hatchery Notified</p><p>{a.hatcheryNotified ? "Yes" : "No"}</p></div>
                  {a.notes && <div className="col-span-full"><p className="text-xs text-muted-foreground">Notes</p><p className="whitespace-pre-line">{a.notes}</p></div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={addOpen || !!editRec} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRec(null); setForm({ ...empty }); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editRec ? "Edit Quality Assessment" : "Quality Assessment at Placement"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Flock *</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.flockId} onChange={e => setForm(f => ({ ...f, flockId: e.target.value }))}>
                  <option value="">Select flock…</option>
                  {flocks.map((f: any) => <option key={f.id} value={String(f.id)}>{flockName(f.id)}</option>)}
                </select>
              </div>
              <div><Label className="text-xs">Assessment Date *</Label><Input type="date" value={form.assessmentDate} onChange={e => setForm(f => ({ ...f, assessmentDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Assessed By</Label><StaffSelect value={form.assessedBy} onChange={v => setForm(f => ({ ...f, assessedBy: v }))} staffNames={pqStaffNames} loading={pqMembersLoading} /></div>
              <div><Label className="text-xs">Overall Quality Score</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background" value={form.overallQualityScore} onChange={e => setForm(f => ({ ...f, overallQualityScore: e.target.value }))}>
                  <option value="">— Select —</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="acceptable">Acceptable</option>
                  <option value="poor">Poor</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Uniformity (%)</Label><Input type="number" min="0" max="100" step="0.1" value={form.uniformityPercent} onChange={e => setForm(f => ({ ...f, uniformityPercent: e.target.value }))} /></div>
              <div><Label className="text-xs">Arrival Temperature (°C)</Label><Input type="number" step="0.5" value={form.arrivalTemperatureCelsius} onChange={e => setForm(f => ({ ...f, arrivalTemperatureCelsius: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Culls at Placement (count)</Label><Input type="number" min="0" value={form.cullCountAtPlacement} onChange={e => setForm(f => ({ ...f, cullCountAtPlacement: e.target.value }))} /></div>
              <div><Label className="text-xs">Cull % at Placement</Label><Input type="number" min="0" max="100" step="0.01" value={form.cullPercentAtPlacement} onChange={e => setForm(f => ({ ...f, cullPercentAtPlacement: e.target.value }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="pq-hatch" checked={form.hatcheryNotified} onChange={e => setForm(f => ({ ...f, hatcheryNotified: e.target.checked }))} />
              <Label htmlFor="pq-hatch" className="text-sm cursor-pointer">Hatchery notified of quality issues</Label>
            </div>
            <div><Label className="text-xs">Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRec(null); setForm({ ...empty }); }}>Cancel</Button>
            <Button disabled={!form.flockId || !form.assessmentDate || createMut.isPending || updateMut.isPending} onClick={() => editRec ? updateMut.mutate({ id: editRec.id, b: form }) : createMut.mutate(form)}>
              {createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Save Assessment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Assessment</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this quality assessment?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMut.isPending} onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Poultry Vaccination Tab ──────────────────────────────────────────────────
const POULTRY_VACC_CATEGORIES: { value: string; label: string; products: string[] }[] = [
  { value: "ND", label: "Newcastle Disease (ND)", products: ["Nobilis ND Clone 30", "Nobilis ND Clone 45", "Nobilis ND Hitchner B1", "Nobilis ND Ma5+Clone30", "Avinew (La Sota)", "Hipraviar Clone 45", "Poulvac Bursa Plus ND", "La Sota (generic)", "Other — enter manually"] },
  { value: "IB", label: "Infectious Bronchitis (IB)", products: ["Nobilis IB Ma5", "Nobilis IB 4-91", "Nobilis IB H120", "Nobilis IB Multi+Clone30", "Hipraviar IB-H120", "Poulvac IB H52", "Vikavac IB", "Other — enter manually"] },
  { value: "Marek", label: "Marek's Disease", products: ["Nobilis Rismavac (HVT+Rispens)", "Nobilis Turkey Herpesvirus (HVT)", "Vectormune HVT NDV", "Rispens/CVI988", "Solvay Rispens", "HVT (generic)", "Other — enter manually"] },
  { value: "Gumboro", label: "Gumboro (IBD / Infectious Bursal Disease)", products: ["Nobilis Gumboro D78", "Nobilis Gumboro 228E", "Nobilis IBA", "Bursa-Vac", "TAD Gumboro vac", "Nobilis Gumboro Intervet", "Other — enter manually"] },
  { value: "aMPV", label: "Avian Metapneumovirus (aMPV / TRT)", products: ["Nobilis TRT", "Hipraviar TRT-C", "Poulvac TRT", "Biomune TRT", "Other — enter manually"] },
  { value: "ILT", label: "Infectious Laryngotracheitis (ILT)", products: ["Nobilis ILT", "TAD Laryngo vac", "Poulvac ILT", "Other — enter manually"] },
  { value: "EDS", label: "Egg Drop Syndrome (EDS)", products: ["Nobilis EDS", "ADS 76 (generic)", "Other — enter manually"] },
  { value: "AE", label: "Avian Encephalomyelitis / Fowl Typhoid (AE)", products: ["Nobilis AE+POX", "Poulvac AE Layervax", "AE Vac (generic)", "Other — enter manually"] },
  { value: "Salmonella", label: "Salmonella", products: ["Nobilis SalENT (live SE)", "AviPro Salmonella Vac E", "AviPro Salmonella Vac T", "Salenvac (inactivated)", "Salmovac 440", "Other — enter manually"] },
  { value: "Mycoplasma", label: "Mycoplasma (MG)", products: ["Nobilis MG 6/85", "Biomune MG-F36", "Other — enter manually"] },
  { value: "FowlPox", label: "Fowl Pox", products: ["Nobilis Pox", "Hipraviar Pox", "AE Vac+Pox combo", "Other — enter manually"] },
  { value: "Other", label: "Other", products: ["Other — enter manually"] },
];

const POULTRY_ADMIN_ROUTES = ["Drinking water", "Eye drop", "Spray (coarse)", "Spray (fine mist)", "Subcutaneous injection", "Intramuscular injection", "Wing web/stab", "In ovo", "Intranasal", "Other"];
const POULTRY_AGE_GROUPS = ["Day-old chicks", "Broilers", "Pullets", "Layers", "Breeders", "Turkeys", "Ducks", "All birds", "Other"];

function PoultryVaccinationTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["poultry-vaccination-records", farmId], queryFn: () => fetch(`/api/farms/${farmId}/poultry-vaccination-records`, { credentials: "include" }).then(r => r.json()) });
  const records: any[] = Array.isArray(q.data?.records) ? q.data.records : [];

  const empty = { vaccinationDate: new Date().toISOString().slice(0, 10), vaccinationCategory: "", vaccineProduct: "", customProduct: "", batchNumber: "", expiryDate: "", ageGroupTreated: "", numberTreated: "", doseVolume: "", administrationRoute: "", withdrawalPeriodDays: "0", nextDueDate: "", administeredBy: "", vetPrescribed: false, notes: "" };
  const [form, setForm] = useState({ ...empty });
  const [addOpen, setAddOpen] = useState(false);
  const [editRec, setEditRec] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const selectedCategory = POULTRY_VACC_CATEGORIES.find(c => c.value === form.vaccinationCategory);
  const productOptions = selectedCategory?.products ?? [];
  const isCustomProduct = form.vaccineProduct === "Other — enter manually";

  const invalidate = () => qc.invalidateQueries({ queryKey: ["poultry-vaccination-records", farmId] });
  const createMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/poultry-vaccination-records`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, vaccineProduct: b.vaccineProduct === "Other — enter manually" ? b.customProduct : b.vaccineProduct }) }).then(r => r.json()), onSuccess: () => { invalidate(); setAddOpen(false); setForm({ ...empty }); } });
  const updateMut = useMutation({ mutationFn: ({ id, b }: { id: number; b: any }) => fetch(`/api/farms/${farmId}/poultry-vaccination-records/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...b, vaccineProduct: b.vaccineProduct === "Other — enter manually" ? b.customProduct : b.vaccineProduct }) }).then(r => r.json()), onSuccess: () => { invalidate(); setAddOpen(false); setEditRec(null); setForm({ ...empty }); } });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/poultry-vaccination-records/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()), onSuccess: () => { invalidate(); setDeleteId(null); } });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const in30 = new Date(today); in30.setDate(in30.getDate() + 30);
  const overdueAlerts = records.filter((r: any) => r.nextDueDate && new Date(r.nextDueDate) <= in30);

  function openEdit(r: any) {
    setEditRec(r);
    const knownProducts = POULTRY_VACC_CATEGORIES.find(c => c.value === r.vaccinationCategory)?.products ?? [];
    const productIsKnown = knownProducts.includes(r.vaccineProduct);
    setForm({ vaccinationDate: r.vaccinationDate?.slice(0, 10) ?? "", vaccinationCategory: r.vaccinationCategory ?? "", vaccineProduct: productIsKnown ? r.vaccineProduct : "Other — enter manually", customProduct: productIsKnown ? "" : (r.vaccineProduct ?? ""), batchNumber: r.batchNumber ?? "", expiryDate: r.expiryDate?.slice(0, 10) ?? "", ageGroupTreated: r.ageGroupTreated ?? "", numberTreated: r.numberTreated ? String(r.numberTreated) : "", doseVolume: r.doseVolume ?? "", administrationRoute: r.administrationRoute ?? "", withdrawalPeriodDays: r.withdrawalPeriodDays ? String(r.withdrawalPeriodDays) : "0", nextDueDate: r.nextDueDate?.slice(0, 10) ?? "", administeredBy: r.administeredBy ?? "", vetPrescribed: r.vetPrescribed ?? false, notes: r.notes ?? "" });
    setAddOpen(true);
  }

  const fmtD = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const categoryLabel = (v: string) => POULTRY_VACC_CATEGORIES.find(c => c.value === v)?.label ?? v;

  return (
    <div className="space-y-4">
      {overdueAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
          <p className="text-xs font-semibold text-amber-800 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />Upcoming / Overdue Booster Alerts</p>
          {overdueAlerts.map((r: any) => {
            const due = new Date(r.nextDueDate); const overdue = due < today;
            return <p key={r.id} className={`text-xs ${overdue ? "text-red-700" : "text-amber-700"}`}>{overdue ? "✗ OVERDUE" : "⚠ Due soon"}: {r.vaccineProduct} ({categoryLabel(r.vaccinationCategory)}) — {fmtD(r.nextDueDate)}</p>;
          })}
        </div>
      )}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{records.length} vaccination record{records.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={() => { setEditRec(null); setForm({ ...empty }); setAddOpen(true); }}><Plus className="w-3.5 h-3.5 mr-1" />Add Vaccination Record</Button>
      </div>
      {q.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : records.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No vaccination records. Red Tractor Poultry requires a vet-signed vaccination programme — record each administration event here.</p>
      ) : (
        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs text-muted-foreground">{["Date","Category","Vaccine Product","Batch No.","Age Group","Num Treated","Route","Next Due","Docs",""].map(h => <th key={h} className="text-left py-2 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {records.map((r: any) => (
              <tr key={r.id} className="border-b hover:bg-muted/30">
                <td className="py-2 pr-3 whitespace-nowrap">{fmtD(r.vaccinationDate)}</td>
                <td className="py-2 pr-3">{categoryLabel(r.vaccinationCategory)}</td>
                <td className="py-2 pr-3">{r.vaccineProduct}{r.vetPrescribed && <span className="ml-1 text-xs text-blue-600 font-medium">POM-V</span>}</td>
                <td className="py-2 pr-3 text-muted-foreground">{r.batchNumber || "—"}</td>
                <td className="py-2 pr-3">{r.ageGroupTreated || "—"}</td>
                <td className="py-2 pr-3">{r.numberTreated ?? "—"}</td>
                <td className="py-2 pr-3">{r.administrationRoute || "—"}</td>
                <td className="py-2 pr-3 whitespace-nowrap">{r.nextDueDate ? <span className={new Date(r.nextDueDate) < today ? "text-red-600 font-medium" : new Date(r.nextDueDate) <= in30 ? "text-amber-600 font-medium" : ""}>{fmtD(r.nextDueDate)}</span> : "—"}</td>
                <td className="py-2 pr-3"><DocAttach recordId={r.id} endpoint={`/api/farms/${farmId}/poultry-vaccination-records/${r.id}/document`} currentPath={r.documentPath} currentName={r.documentName} onAttached={invalidate} /></td>
                <td className="py-2 text-right whitespace-nowrap">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRec(null); setForm({ ...empty }); } }}>
        <DialogContent style={{ maxWidth: 560 }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editRec ? "Edit Vaccination Record" : "Add Vaccination Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Date *</Label><input type="date" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.vaccinationDate} onChange={e => setForm(f => ({ ...f, vaccinationDate: e.target.value }))} /></div>
              <div><Label className="text-xs">Age Group</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.ageGroupTreated} onChange={e => setForm(f => ({ ...f, ageGroupTreated: e.target.value }))}>
                  <option value="">— select —</option>
                  {POULTRY_AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div><Label className="text-xs">Disease Category *</Label>
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.vaccinationCategory} onChange={e => setForm(f => ({ ...f, vaccinationCategory: e.target.value, vaccineProduct: "", customProduct: "" }))}>
                <option value="">— select category —</option>
                {POULTRY_VACC_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            {form.vaccinationCategory && (
              <div><Label className="text-xs">Vaccine Product *</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.vaccineProduct} onChange={e => setForm(f => ({ ...f, vaccineProduct: e.target.value }))}>
                  <option value="">— select product —</option>
                  {productOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            )}
            {isCustomProduct && <div><Label className="text-xs">Product Name (manual entry) *</Label><input type="text" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" placeholder="Enter vaccine product name" value={form.customProduct} onChange={e => setForm(f => ({ ...f, customProduct: e.target.value }))} /></div>}
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Batch Number</Label><input type="text" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} /></div>
              <div><Label className="text-xs">Expiry Date</Label><input type="date" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Number Treated</Label><input type="number" min="0" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.numberTreated} onChange={e => setForm(f => ({ ...f, numberTreated: e.target.value }))} /></div>
              <div><Label className="text-xs">Dose Volume (ml)</Label><input type="text" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" placeholder="e.g. 0.2" value={form.doseVolume} onChange={e => setForm(f => ({ ...f, doseVolume: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Administration Route</Label>
              <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.administrationRoute} onChange={e => setForm(f => ({ ...f, administrationRoute: e.target.value }))}>
                <option value="">— select —</option>
                {POULTRY_ADMIN_ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Withdrawal Period (days)</Label><input type="number" min="0" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.withdrawalPeriodDays} onChange={e => setForm(f => ({ ...f, withdrawalPeriodDays: e.target.value }))} /></div>
              <div><Label className="text-xs">Next Due Date</Label><input type="date" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.nextDueDate} onChange={e => setForm(f => ({ ...f, nextDueDate: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Administered By</Label><input type="text" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.administeredBy} onChange={e => setForm(f => ({ ...f, administeredBy: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="pv-vet" checked={form.vetPrescribed} onChange={e => setForm(f => ({ ...f, vetPrescribed: e.target.checked }))} /><label htmlFor="pv-vet" className="text-sm cursor-pointer">Vet prescribed (POM-V product)</label></div>
            <div><Label className="text-xs">Notes</Label><textarea className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRec(null); setForm({ ...empty }); }}>Cancel</Button>
            <Button disabled={!form.vaccinationDate || !form.vaccinationCategory || (!form.vaccineProduct || (isCustomProduct && !form.customProduct)) || createMut.isPending || updateMut.isPending} onClick={() => editRec ? updateMut.mutate({ id: editRec.id, b: form }) : createMut.mutate(form)}>
              {createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Save Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 360 }}><DialogHeader><DialogTitle>Delete Vaccination Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this vaccination record?</p>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" disabled={deleteMut.isPending} onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Poultry Disease Monitoring Tab ───────────────────────────────────────────
const POULTRY_MONITORING_TYPES = [
  { value: "AI", label: "Avian Influenza (AI) Surveillance" },
  { value: "Marek", label: "Marek's Disease Monitoring" },
  { value: "ND", label: "Newcastle Disease Serology" },
  { value: "MG", label: "Mycoplasma gallisepticum (MG) Surveillance" },
  { value: "IB", label: "Infectious Bronchitis Typing" },
  { value: "ART", label: "Avian Rhinotracheitis (ART) Surveillance" },
  { value: "Salmonella serology", label: "Salmonella Serology (non-NCP)" },
  { value: "General serology", label: "General Serology / Antibody Profiling" },
];

const POULTRY_FLOCK_STATUSES: { value: string; label: string; colour: string }[] = [
  { value: "negative", label: "Negative / Clear", colour: "bg-green-100 text-green-800 border-green-200" },
  { value: "low_positive", label: "Low Positive", colour: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "positive", label: "Positive", colour: "bg-red-100 text-red-800 border-red-200" },
  { value: "inconclusive", label: "Inconclusive", colour: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "pending", label: "Pending — awaiting results", colour: "bg-gray-100 text-gray-700 border-gray-200" },
];

function PoultryDiseaseMonitoringTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["poultry-disease-monitoring", farmId], queryFn: () => fetch(`/api/farms/${farmId}/poultry-disease-monitoring`, { credentials: "include" }).then(r => r.json()) });
  const records: any[] = Array.isArray(q.data?.records) ? q.data.records : [];

  const empty = { monitoringDate: new Date().toISOString().slice(0, 10), monitoringType: "", testingBody: "", numberOfSamples: "", positiveResults: "0", negativeResults: "0", flockStatus: "", aiRiskLevel: "", actionsTaken: "", nextTestDue: "", notes: "" };
  const [form, setForm] = useState({ ...empty });
  const [addOpen, setAddOpen] = useState(false);
  const [editRec, setEditRec] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["poultry-disease-monitoring", farmId] });
  const createMut = useMutation({ mutationFn: (b: any) => fetch(`/api/farms/${farmId}/poultry-disease-monitoring`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { invalidate(); setAddOpen(false); setForm({ ...empty }); } });
  const updateMut = useMutation({ mutationFn: ({ id, b }: { id: number; b: any }) => fetch(`/api/farms/${farmId}/poultry-disease-monitoring/${id}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(r => r.json()), onSuccess: () => { invalidate(); setAddOpen(false); setEditRec(null); setForm({ ...empty }); } });
  const deleteMut = useMutation({ mutationFn: (id: number) => fetch(`/api/farms/${farmId}/poultry-disease-monitoring/${id}`, { method: "DELETE", credentials: "include" }).then(r => r.json()), onSuccess: () => { invalidate(); setDeleteId(null); } });

  function openEdit(r: any) {
    setEditRec(r);
    setForm({ monitoringDate: r.monitoringDate?.slice(0, 10) ?? "", monitoringType: r.monitoringType ?? "", testingBody: r.testingBody ?? "", numberOfSamples: r.numberOfSamples ? String(r.numberOfSamples) : "", positiveResults: r.positiveResults ? String(r.positiveResults) : "0", negativeResults: r.negativeResults ? String(r.negativeResults) : "0", flockStatus: r.flockStatus ?? "", aiRiskLevel: r.aiRiskLevel ?? "", actionsTaken: r.actionsTaken ?? "", nextTestDue: r.nextTestDue?.slice(0, 10) ?? "", notes: r.notes ?? "" });
    setAddOpen(true);
  }

  const fmtD = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const typeLabel = (v: string) => POULTRY_MONITORING_TYPES.find(t => t.value === v)?.label ?? v;
  const statusInfo = (v: string) => POULTRY_FLOCK_STATUSES.find(s => s.value === v);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{records.length} monitoring record{records.length !== 1 ? "s" : ""}</p>
        <Button size="sm" onClick={() => { setEditRec(null); setForm({ ...empty }); setAddOpen(true); }}><Plus className="w-3.5 h-3.5 mr-1" />Add Monitoring Record</Button>
      </div>
      {q.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : records.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No disease monitoring records. Use this register to record AI surveillance, Marek's monitoring, ND serology, MG surveillance, IB typing, and general antibody profiling results.</p>
      ) : (
        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs text-muted-foreground">{["Date","Monitoring Type","Testing Body","Samples","Positive","Negative","Flock Status","AI Risk","Next Test","Docs",""].map(h => <th key={h} className="text-left py-2 pr-3 font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {records.map((r: any) => {
              const si = statusInfo(r.flockStatus);
              return (
                <tr key={r.id} className="border-b hover:bg-muted/30">
                  <td className="py-2 pr-3 whitespace-nowrap">{fmtD(r.monitoringDate)}</td>
                  <td className="py-2 pr-3">{typeLabel(r.monitoringType)}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{r.testingBody || "—"}</td>
                  <td className="py-2 pr-3">{r.numberOfSamples ?? "—"}</td>
                  <td className="py-2 pr-3">{r.positiveResults ?? "—"}</td>
                  <td className="py-2 pr-3">{r.negativeResults ?? "—"}</td>
                  <td className="py-2 pr-3">{si ? <span className={`inline-block rounded px-1.5 py-0.5 text-xs border font-medium ${si.colour}`}>{si.label}</span> : "—"}</td>
                  <td className="py-2 pr-3">{r.aiRiskLevel ? <span className={`inline-block rounded px-1.5 py-0.5 text-xs border font-medium ${r.aiRiskLevel === "low" ? "bg-green-100 text-green-800 border-green-200" : r.aiRiskLevel === "medium" ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-red-100 text-red-800 border-red-200"}`}>{r.aiRiskLevel.charAt(0).toUpperCase() + r.aiRiskLevel.slice(1)}</span> : "—"}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{fmtD(r.nextTestDue)}</td>
                  <td className="py-2 pr-3"><DocAttach recordId={r.id} endpoint={`/api/farms/${farmId}/poultry-disease-monitoring/${r.id}/document`} currentPath={r.documentPath} currentName={r.documentName} onAttached={invalidate} /></td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <Dialog open={addOpen} onOpenChange={o => { if (!o) { setAddOpen(false); setEditRec(null); setForm({ ...empty }); } }}>
        <DialogContent style={{ maxWidth: 560 }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editRec ? "Edit Monitoring Record" : "Add Monitoring Record"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Monitoring Date *</Label><input type="date" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.monitoringDate} onChange={e => setForm(f => ({ ...f, monitoringDate: e.target.value }))} /></div>
              <div><Label className="text-xs">Monitoring Type *</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.monitoringType} onChange={e => setForm(f => ({ ...f, monitoringType: e.target.value }))}>
                  <option value="">— select —</option>
                  {POULTRY_MONITORING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div><Label className="text-xs">Testing Body / Laboratory</Label><input type="text" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.testingBody} onChange={e => setForm(f => ({ ...f, testingBody: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Samples</Label><input type="number" min="0" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.numberOfSamples} onChange={e => setForm(f => ({ ...f, numberOfSamples: e.target.value }))} /></div>
              <div><Label className="text-xs">Positive</Label><input type="number" min="0" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.positiveResults} onChange={e => setForm(f => ({ ...f, positiveResults: e.target.value }))} /></div>
              <div><Label className="text-xs">Negative</Label><input type="number" min="0" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.negativeResults} onChange={e => setForm(f => ({ ...f, negativeResults: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Flock Status</Label>
                <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.flockStatus} onChange={e => setForm(f => ({ ...f, flockStatus: e.target.value }))}>
                  <option value="">— select —</option>
                  {POULTRY_FLOCK_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              {form.monitoringType === "AI" && (
                <div><Label className="text-xs">AI Risk Level</Label>
                  <select className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.aiRiskLevel} onChange={e => setForm(f => ({ ...f, aiRiskLevel: e.target.value }))}>
                    <option value="">— select —</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              )}
            </div>
            <div><Label className="text-xs">Next Test Due</Label><input type="date" className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" value={form.nextTestDue} onChange={e => setForm(f => ({ ...f, nextTestDue: e.target.value }))} /></div>
            <div><Label className="text-xs">Actions Taken</Label><textarea className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" rows={2} value={form.actionsTaken} onChange={e => setForm(f => ({ ...f, actionsTaken: e.target.value }))} /></div>
            <div><Label className="text-xs">Notes</Label><textarea className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background mt-1" rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddOpen(false); setEditRec(null); setForm({ ...empty }); }}>Cancel</Button>
            <Button disabled={!form.monitoringDate || !form.monitoringType || createMut.isPending || updateMut.isPending} onClick={() => editRec ? updateMut.mutate({ id: editRec.id, b: form }) : createMut.mutate(form)}>
              {createMut.isPending || updateMut.isPending ? "Saving…" : editRec ? "Save Changes" : "Save Record"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 360 }}><DialogHeader><DialogTitle>Delete Monitoring Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this disease monitoring record?</p>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button><Button variant="destructive" disabled={deleteMut.isPending} onClick={() => deleteId !== null && deleteMut.mutate(deleteId)}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Inter-Site Transfers Tab ─────────────────────────────────────────────────
const TRANSFER_REASONS_DASH = ["Relocation", "Contract rearing", "Flock splitting", "Site consolidation", "Other"];

function InterSiteTransfersTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ["poultry-transfers", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-transfers`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? d ?? []),
    enabled: !!farmId,
  });
  const records: any[] = Array.isArray(rawData) ? rawData : [];

  const { data: flocksData } = useQuery({
    queryKey: ["poultry-flocks", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-flocks`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });
  const flocks: any[] = flocksData?.records ?? flocksData ?? [];

  function openAdd() { setEditing(null); setForm({ transferDate: today, reason: "Relocation" }); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setOpen(true); }

  const saveMut = useMutation({
    mutationFn: async () => {
      const url = editing ? api(`farms/${farmId}/poultry-transfers/${editing.id}`) : api(`farms/${farmId}/poultry-transfers`);
      await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-transfers", farmId] }); setOpen(false); },
  });

  const deleteMut2 = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-transfers/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-transfers", farmId] }); setDeleteId(null); },
  });

  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Inter-Site Transfers</h3>
          <p className="text-xs text-gray-500 mt-0.5">Record movements of birds between holdings you own or manage. Distinct from FCI slaughter movements.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Transfer</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ArrowRightLeft className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No inter-site transfers recorded</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">To Farm</th>
                <th className="pb-2 pr-4">CPH</th>
                <th className="pb-2 pr-4">Birds</th>
                <th className="pb-2 pr-4">Reason</th>
                <th className="pb-2 pr-4">Vehicle</th>
                <th className="pb-2 pr-4">Driver</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r: any) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 pr-4 whitespace-nowrap">{fmtDate(r.transferDate)}</td>
                  <td className="py-2 pr-4 font-medium">{r.toFarmName ?? "—"}</td>
                  <td className="py-2 pr-4 text-gray-500">{r.toCph ?? "—"}</td>
                  <td className="py-2 pr-4">{r.quantityTransferred ?? "—"}</td>
                  <td className="py-2 pr-4 text-gray-600">{r.reason ?? "—"}</td>
                  <td className="py-2 pr-4 font-mono text-xs">{r.vehicleReg ?? "—"}</td>
                  <td className="py-2 pr-4 text-gray-500">{r.driverName ?? "—"}</td>
                  <td className="py-2 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); } }}>
        <DialogContent style={{ maxWidth: 560 }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Transfer" : "Add Inter-Site Transfer"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-gray-700">Destination Farm / Holding Name *</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm" value={form.toFarmName ?? ""} onChange={e => set("toFarmName", e.target.value)} placeholder="e.g. North Unit — Llanfair Farm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Destination CPH</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm" value={form.toCph ?? ""} onChange={e => set("toCph", e.target.value)} placeholder="12/345/6789" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Transfer Date *</label>
              <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={form.transferDate ?? today} onChange={e => set("transferDate", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Birds Transferred *</label>
              <input type="number" className="w-full border rounded px-2 py-1.5 text-sm" value={form.quantityTransferred ?? ""} onChange={e => set("quantityTransferred", e.target.value)} placeholder="e.g. 5000" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Reason</label>
              <select className="w-full border rounded px-2 py-1.5 text-sm" value={form.reason ?? ""} onChange={e => set("reason", e.target.value)}>
                {TRANSFER_REASONS_DASH.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Flock (optional)</label>
              <select className="w-full border rounded px-2 py-1.5 text-sm" value={form.flockId ?? ""} onChange={e => set("flockId", e.target.value ? Number(e.target.value) : null)}>
                <option value="">— Any / not linked —</option>
                {flocks.map((f: any) => <option key={f.id} value={f.id}>{f.flockNumber ?? f.id}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Transport Company</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm" value={form.transportCompany ?? ""} onChange={e => set("transportCompany", e.target.value)} placeholder="e.g. Williams Haulage" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Vehicle Registration</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm uppercase" value={form.vehicleReg ?? ""} onChange={e => set("vehicleReg", e.target.value.toUpperCase())} placeholder="AB12 CDE" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Driver Name</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm" value={form.driverName ?? ""} onChange={e => set("driverName", e.target.value)} placeholder="e.g. John Williams" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Est. Journey (hours)</label>
              <input type="number" step="0.5" className="w-full border rounded px-2 py-1.5 text-sm" value={form.estimatedJourneyHours ?? ""} onChange={e => set("estimatedJourneyHours", e.target.value)} placeholder="e.g. 1.5" />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-gray-700">Notes</label>
              <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows={2} value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button disabled={!form.toFarmName || !form.quantityTransferred || saveMut.isPending} onClick={() => saveMut.mutate()}>
              <Save className="w-3.5 h-3.5 mr-1" />{saveMut.isPending ? "Saving…" : editing ? "Save Changes" : "Save Transfer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Transfer Record</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this inter-site transfer record?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMut2.isPending} onClick={() => deleteId !== null && deleteMut2.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Transport Welfare Tab ─────────────────────────────────────────────────────
const JOURNEY_PURPOSES_DASH = [
  { value: "to_slaughter", label: "To Slaughter" },
  { value: "inter_site", label: "Inter-Site Transfer" },
  { value: "hatchery_collection", label: "Hatchery Collection" },
  { value: "other", label: "Other" },
];
const WELFARE_OUTCOMES_DASH = [
  { value: "satisfactory", label: "Satisfactory" },
  { value: "unsatisfactory", label: "Unsatisfactory" },
  { value: "not_assessed", label: "Not Assessed" },
];

function TransportWelfareTab({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const today = new Date().toISOString().split("T")[0];

  const { data: rawData = [], isLoading } = useQuery({
    queryKey: ["poultry-transport-welfare", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/poultry-transport-welfare`), { credentials: "include" }).then(r => r.json()).then(d => d.records ?? d ?? []),
    enabled: !!farmId,
  });
  const records: any[] = Array.isArray(rawData) ? rawData : [];

  const emptyForm = { journeyDate: today, journeyPurpose: "to_slaughter", temperatureAdequate: true, waterProvision: true, ventilationAdequate: true, overallWelfareAssessment: "satisfactory" };
  function openAdd() { setEditing(null); setForm({ ...emptyForm }); setOpen(true); }
  function openEdit(r: any) { setEditing(r); setForm({ ...r }); setOpen(true); }

  const saveMut2 = useMutation({
    mutationFn: async () => {
      const url = editing ? api(`farms/${farmId}/poultry-transport-welfare/${editing.id}`) : api(`farms/${farmId}/poultry-transport-welfare`);
      await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-transport-welfare", farmId] }); setOpen(false); },
  });

  const deleteMut3 = useMutation({
    mutationFn: (id: number) => fetch(api(`farms/${farmId}/poultry-transport-welfare/${id}`), { method: "DELETE", credentials: "include" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["poultry-transport-welfare", farmId] }); setDeleteId(null); },
  });

  const fmtDate2 = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB") : "—";
  const welfareBadge = (v: string) => {
    const cls: Record<string, string> = { satisfactory: "bg-green-100 text-green-800", unsatisfactory: "bg-red-100 text-red-800", not_assessed: "bg-gray-100 text-gray-600" };
    const label = WELFARE_OUTCOMES_DASH.find(o => o.value === v)?.label ?? v;
    return <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls[v] ?? "bg-gray-100 text-gray-600"}`}>{label}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Transport Welfare Documentation</h3>
          <p className="text-xs text-gray-500 mt-0.5">UK Welfare of Animals During Transport regs. Required for Red Tractor, RSPCA Assured, and organic audits. Journeys over 65 km require a transporter authorisation number.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Log</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ShieldAlert className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No transport welfare logs recorded</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Purpose</th>
                <th className="pb-2 pr-4">Vehicle</th>
                <th className="pb-2 pr-4">Driver</th>
                <th className="pb-2 pr-4">Distance</th>
                <th className="pb-2 pr-4">DOA</th>
                <th className="pb-2 pr-4">Assessment</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((r: any) => {
                const km = Number(r.journeyDistanceKm);
                const over65 = km > 65;
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="py-2 pr-4 whitespace-nowrap">{fmtDate2(r.journeyDate)}</td>
                    <td className="py-2 pr-4">{JOURNEY_PURPOSES_DASH.find(p => p.value === r.journeyPurpose)?.label ?? r.journeyPurpose ?? "—"}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{r.vehicleReg ?? "—"}</td>
                    <td className="py-2 pr-4 text-gray-500">{r.driverName ?? "—"}</td>
                    <td className="py-2 pr-4">
                      {r.journeyDistanceKm ? (
                        <span className="flex items-center gap-1">
                          {r.journeyDistanceKm} km
                          {over65 && <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full font-medium">WATD</span>}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="py-2 pr-4">{r.birdsDeadOnArrival ?? "0"}</td>
                    <td className="py-2 pr-4">{welfareBadge(r.overallWelfareAssessment ?? "not_assessed")}</td>
                    <td className="py-2 text-right whitespace-nowrap">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteId(r.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); setEditing(null); } }}>
        <DialogContent style={{ maxWidth: 600 }}>
          <DialogHeader><DialogTitle>{editing ? "Edit Transport Welfare Log" : "Add Transport Welfare Log"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Journey Date *</label>
              <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={form.journeyDate ?? today} onChange={e => set("journeyDate", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Journey Purpose</label>
              <select className="w-full border rounded px-2 py-1.5 text-sm" value={form.journeyPurpose ?? "to_slaughter"} onChange={e => set("journeyPurpose", e.target.value)}>
                {JOURNEY_PURPOSES_DASH.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Vehicle Registration *</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm uppercase" value={form.vehicleReg ?? ""} onChange={e => set("vehicleReg", e.target.value.toUpperCase())} placeholder="AB12 CDE" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Driver Name</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm" value={form.driverName ?? ""} onChange={e => set("driverName", e.target.value)} />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-gray-700">Transporter Authorisation No. {Number(form.journeyDistanceKm) > 65 ? "(Required — journey >65 km)" : "(optional)"}</label>
              <input className="w-full border rounded px-2 py-1.5 text-sm" value={form.transporterAuthorisationNo ?? ""} onChange={e => set("transporterAuthorisationNo", e.target.value)} placeholder="e.g. UK/TA/12345" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Start Time</label>
              <input type="time" className="w-full border rounded px-2 py-1.5 text-sm" value={form.journeyStartTime ?? ""} onChange={e => set("journeyStartTime", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">End Time</label>
              <input type="time" className="w-full border rounded px-2 py-1.5 text-sm" value={form.journeyEndTime ?? ""} onChange={e => set("journeyEndTime", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Journey Distance (km)</label>
              <input type="number" className="w-full border rounded px-2 py-1.5 text-sm" value={form.journeyDistanceKm ?? ""} onChange={e => set("journeyDistanceKm", e.target.value)} placeholder="e.g. 45" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Stocking Density (birds/m²)</label>
              <input type="number" className="w-full border rounded px-2 py-1.5 text-sm" value={form.stockingDensityBirdsM2 ?? ""} onChange={e => set("stockingDensityBirdsM2", e.target.value)} placeholder="e.g. 32" />
            </div>
            <div className="col-span-2 space-y-2">
              <p className="text-xs font-medium text-gray-700">Welfare Conditions</p>
              <div className="flex flex-wrap gap-4">
                {[
                  { k: "temperatureAdequate", label: "Temperature adequate" },
                  { k: "waterProvision", label: "Water provision" },
                  { k: "ventilationAdequate", label: "Ventilation adequate" },
                ].map(({ k, label }) => (
                  <label key={k} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Birds Dead on Arrival</label>
              <input type="number" className="w-full border rounded px-2 py-1.5 text-sm" value={form.birdsDeadOnArrival ?? "0"} onChange={e => set("birdsDeadOnArrival", e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Overall Welfare Assessment</label>
              <select className="w-full border rounded px-2 py-1.5 text-sm" value={form.overallWelfareAssessment ?? "satisfactory"} onChange={e => set("overallWelfareAssessment", e.target.value)}>
                {WELFARE_OUTCOMES_DASH.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-medium text-gray-700">Notes</label>
              <textarea className="w-full border rounded px-2 py-1.5 text-sm" rows={2} value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); setEditing(null); }}>Cancel</Button>
            <Button disabled={!form.vehicleReg || saveMut2.isPending} onClick={() => saveMut2.mutate()}>
              <Save className="w-3.5 h-3.5 mr-1" />{saveMut2.isPending ? "Saving…" : editing ? "Save Changes" : "Save Log"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={o => { if (!o) setDeleteId(null); }}>
        <DialogContent style={{ maxWidth: 360 }}>
          <DialogHeader><DialogTitle>Delete Transport Welfare Log</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Permanently delete this transport welfare log?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMut3.isPending} onClick={() => deleteId !== null && deleteMut3.mutate(deleteId)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── HPAI Banner ──────────────────────────────────────────────────────────────
const HPAI_ZONE_STATUSES = [
  { value: "none", label: "No zone restrictions" },
  { value: "protection_zone", label: "Protection Zone (PZ)" },
  { value: "surveillance_zone", label: "Surveillance Zone (SZ)" },
  { value: "temporary_control_zone", label: "Temporary Control Zone (TCZ)" },
];

function HpaiBanner({ farmId }: { farmId: number }) {
  const qc = useQueryClient();
  const [editingZone, setEditingZone] = useState(false);
  const [zoneForm, setZoneForm] = useState<any>({});

  const { data: platformAlert } = useQuery({
    queryKey: ["hpai-platform-alert"],
    queryFn: () => fetch("/api/hpai-alert").then(r => r.json()).catch(() => ({ active: false })),
    refetchInterval: 5 * 60 * 1000,
  });

  const { data: farmHpai } = useQuery({
    queryKey: ["hpai-status", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/hpai-status`), { credentials: "include" }).then(r => r.json()).catch(() => null),
    enabled: !!farmId,
  });

  const updateZoneMut = useMutation({
    mutationFn: () => fetch(api(`farms/${farmId}/hpai-status`), { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(zoneForm) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["hpai-status", farmId] }); setEditingZone(false); },
  });

  const levelColours: Record<string, string> = {
    national: "bg-red-600",
    regional: "bg-orange-500",
    advisory: "bg-amber-500",
  };

  const showPlatformAlert = platformAlert?.active;
  const farmZoneStatus = farmHpai?.hpaiZoneStatus ?? "none";
  const housingRequiredSince = farmHpai?.hpaiHousingRequiredSince ? new Date(farmHpai.hpaiHousingRequiredSince) : null;
  const daysSinceHousing = housingRequiredSince ? Math.floor((Date.now() - housingRequiredSince.getTime()) / 86400000) : null;
  const organicClock16wk = daysSinceHousing !== null;
  const clockWarning = daysSinceHousing !== null && daysSinceHousing >= 98;
  const clockBreached = daysSinceHousing !== null && daysSinceHousing >= 112;
  const farmInZone = farmZoneStatus !== "none";

  if (!showPlatformAlert && !farmInZone && !organicClock16wk) return null;

  return (
    <div className="space-y-2 mb-1">
      {showPlatformAlert && (
        <div className={`flex items-start gap-3 p-3 rounded-lg text-white ${levelColours[platformAlert.level] ?? "bg-red-600"}`}>
          <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">HPAI National Alert{platformAlert.level ? ` — ${platformAlert.level.charAt(0).toUpperCase() + platformAlert.level.slice(1)}` : ""}</p>
            {platformAlert.message && <p className="text-xs mt-0.5 opacity-90">{platformAlert.message}</p>}
            {platformAlert.date && <p className="text-xs opacity-75 mt-0.5">Issued: {new Date(platformAlert.date).toLocaleDateString("en-GB")}</p>}
          </div>
        </div>
      )}

      {farmInZone && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
          <MapPin className="w-5 h-5 mt-0.5 text-orange-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-orange-900">This farm is within an HPAI {HPAI_ZONE_STATUSES.find(z => z.value === farmZoneStatus)?.label ?? farmZoneStatus}</p>
            {farmHpai?.hpaiZoneDate && <p className="text-xs text-orange-700 mt-0.5">Zone applied: {new Date(farmHpai.hpaiZoneDate).toLocaleDateString("en-GB")}</p>}
          </div>
          <Button size="sm" variant="outline" className="shrink-0 text-xs" onClick={() => { setZoneForm({ hpaiZoneStatus: farmHpai?.hpaiZoneStatus ?? "none", hpaiZoneDate: farmHpai?.hpaiZoneDate ?? "", hpaiHousingRequiredSince: farmHpai?.hpaiHousingRequiredSince ?? "" }); setEditingZone(true); }}>
            Update Zone
          </Button>
        </div>
      )}

      {organicClock16wk && (
        <div className={`flex items-start gap-3 p-3 rounded-lg border ${clockBreached ? "bg-red-50 border-red-300" : clockWarning ? "bg-amber-50 border-amber-300" : "bg-blue-50 border-blue-200"}`}>
          <Clock className={`w-5 h-5 mt-0.5 shrink-0 ${clockBreached ? "text-red-600" : clockWarning ? "text-amber-600" : "text-blue-600"}`} />
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-sm ${clockBreached ? "text-red-900" : clockWarning ? "text-amber-900" : "text-blue-900"}`}>
              Organic 16-week Housing Derogation: {daysSinceHousing} of 112 days
              {clockBreached && " — DEROGATION PERIOD EXCEEDED"}
              {!clockBreached && clockWarning && " — approaching limit"}
            </p>
            <p className={`text-xs mt-0.5 ${clockBreached ? "text-red-700" : clockWarning ? "text-amber-700" : "text-blue-700"}`}>
              Housing required since {housingRequiredSince!.toLocaleDateString("en-GB")}. After 112 days continuous housing, organic status cannot be maintained — contact your certification body.
            </p>
          </div>
        </div>
      )}

      {!farmInZone && !!farmId && (
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" className="text-xs text-gray-400 h-6" onClick={() => { setZoneForm({ hpaiZoneStatus: "none", hpaiZoneDate: "", hpaiHousingRequiredSince: "" }); setEditingZone(true); }}>
            <MapPin className="w-3 h-3 mr-1" />Set HPAI zone status
          </Button>
        </div>
      )}

      <Dialog open={editingZone} onOpenChange={o => { if (!o) setEditingZone(false); }}>
        <DialogContent style={{ maxWidth: 440 }}>
          <DialogHeader><DialogTitle>Update HPAI Zone Status</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Zone Status</label>
              <select className="w-full border rounded px-2 py-1.5 text-sm" value={zoneForm.hpaiZoneStatus ?? "none"} onChange={e => setZoneForm((f: any) => ({ ...f, hpaiZoneStatus: e.target.value }))}>
                {HPAI_ZONE_STATUSES.map(z => <option key={z.value} value={z.value}>{z.label}</option>)}
              </select>
            </div>
            {zoneForm.hpaiZoneStatus !== "none" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Zone Applied Date</label>
                <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={zoneForm.hpaiZoneDate ?? ""} onChange={e => setZoneForm((f: any) => ({ ...f, hpaiZoneDate: e.target.value }))} />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Housing Required Since (organic 16-week clock start)</label>
              <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={zoneForm.hpaiHousingRequiredSince ?? ""} onChange={e => setZoneForm((f: any) => ({ ...f, hpaiHousingRequiredSince: e.target.value }))} />
              <p className="text-xs text-gray-500">Leave blank if not applicable. Set when mandatory housing order takes effect for organic farms.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingZone(false)}>Cancel</Button>
            <Button disabled={updateZoneMut.isPending} onClick={() => updateZoneMut.mutate()}>
              <Save className="w-3.5 h-3.5 mr-1" />{updateZoneMut.isPending ? "Saving…" : "Save Zone Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
