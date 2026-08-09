// @ts-nocheck
import { useState, useRef, useMemo, type ReactNode } from "react";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
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

const APPROVED_DISINFECTANTS = ["Virkon S","Anigene HLD4V","FAM 30","Interkokask","Kilcox Extra","Defecto Forte","Menno Ter Forte","Biocide Extra","Glutex (Glutaraldehyde)","Acticide CMK","Perasafe (Peracetic Acid)","DupHast Forte","Other (specify in notes)"];

export function CleanoutsTab({ farmId }: { farmId: number }) {
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
  const [houseFilterCO, setHouseFilterCO] = usePersistedFilter({ page: "poultry-cleanouts", filter: "house", farmId, defaultValue: "all" });
  const [yearFilterCO, setYearFilterCO] = usePersistedFilter({ page: "poultry-cleanouts", filter: "year", farmId, defaultValue: "all" });
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
      ]} rows={filteredCoList} onEdit={r => openEditCO(r as Record<string, unknown>)} onDelete={r => del.mutate(r.id as number)} deleteMutation={del} onView={setViewRecord} />}

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

      <Dialog open={open} onOpenChange={v => { if (!v) { handleClose(); save.reset(); } else setOpen(true); }}>
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
          <DialogMutationError mutation={save} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button onClick={doSave} disabled={save.isPending}>{save.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

