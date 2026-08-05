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

export function HousesTab({ farmId }: { farmId: number }) {
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
      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) save.reset(); }}>
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
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => save.mutate(form)} disabled={save.isPending}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

