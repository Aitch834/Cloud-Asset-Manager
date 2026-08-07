import { useFarmName } from "@/hooks/use-farm-name";
import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaffSelect } from "@/components/ui/staff-select";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import {
  Plus, Trash2, Loader2, Eye, Grape, Leaf, ClipboardList, Sprout,
  BarChart3, Bug, Scissors, ShieldAlert, CheckCircle2, XCircle, AlertTriangle,
  FileDown, Pencil, Map, FileText, Receipt, CalendarCheck, ShieldCheck, Wine,
  Droplet, FlaskConical, ChevronRight, Package, TrendingUp, BookOpen, Printer,
  Award, Globe, BadgeAlert, Beaker, Wrench, Gauge,
} from "lucide-react";
import {
  ViticulturalAnalyticsTab,
  VintageSeasonReportTab,
  ViticulturalEnterpriseReport,
} from "@/components/ViticulturalReports";
import {
  HarvestReceptionTab,
  PressingRecordsTab,
  FermentationRecordsTab,
  VesselRegisterTab,
  CellarOpsTab,
  BottlingRecordsTab,
  So2TestingTab,
  EquipmentRegisterTab,
  BatchTrailQuickSearch,
  WINERY_VIEW_ADDITIONS_EVENT,
} from "@/pages/WineryManagementTabs";
import { sanitiseCsvCell } from "@/lib/csv";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { RaiseTaskDialog } from "@/components/tasks/RaiseTaskDialog";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabBar, TabButton } from "@/components/ui/tab-button";
import { useAppStore } from "@/hooks/use-app-store";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { VineyardBlockBoundaryMapDialog } from "@/components/viticulture/VineyardBlockBoundaryMapDialog";
import { VineyardBlockMapTab } from "@/components/viticulture/VineyardBlockMapTab";
import { Checkbox } from "@/components/ui/checkbox";
import { useLookupStrings } from "@/hooks/use-lookup";
import { usePersistedTab } from "@/hooks/use-persisted-tab";

import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, printHarvest, useFarmMeta, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";

type Harvest = Record<string, unknown>;

export function HarvestTab({ farmId, blocks, highlightBlockId }: { farmId: number; blocks: Record<string, unknown>[]; highlightBlockId?: number }) {
  const { data, isLoading, add, edit, remove } = useCrud<Harvest>(farmId, "vineyard-harvest", "vineyard-harvest");
  const farmName = useFarmName(farmId);
  const { farmRecord: farmMeta } = useFarmMeta(farmId);
  const { displayName } = useUserRole();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Harvest | null>(null);
  const [form, setForm] = useState<Harvest>({});
  const [viewing, setViewing] = useState<Harvest | null>(null);
  const [raiseTaskFor, setRaiseTaskFor] = useState<Harvest | null>(null);
  const [yearFilter, setYearFilter] = useState(String(new Date().getFullYear()));
  const [blockFilter, setBlockFilter] = useState<string>(highlightBlockId ? String(highlightBlockId) : "__all__");
  const [searchText, setSearchText] = useState("");

  // Sync block filter when navigating from a block card
  useEffect(() => {
    if (highlightBlockId) setBlockFilter(String(highlightBlockId));
  }, [highlightBlockId]);

  const { data: wineryContactsData } = useQuery<{ records: Record<string, unknown>[] }>({
    queryKey: ["vineyard-winery-contacts", farmId],
    queryFn: async () => { const r = await fetch(api(`farms/${farmId}/vineyard-harvest/winery-contacts`)); return r.json(); },
    staleTime: 60_000,
  });
  const wineryContacts = wineryContactsData?.records ?? [];
  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

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

  const filteredHarvest = useMemo(() => {
    let rows = yearFilter === "all" ? data : data.filter(r => String(r.vintageYear) === yearFilter);
    if (blockFilter !== "__all__") rows = rows.filter(r => String(r.blockId) === blockFilter);
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      rows = rows.filter(r => {
        const block = blocks.find(b => b.id === r.blockId);
        const blockNameStr = String(block?.blockName ?? "").toLowerCase();
        const variety = String(block?.variety ?? "").toLowerCase();
        const operator = String(r.operatorName ?? "").toLowerCase();
        return blockNameStr.includes(q) || variety.includes(q) || operator.includes(q);
      });
    }
    return rows;
  }, [data, yearFilter, blockFilter, searchText, blocks]);

  const highlightedBlockName = highlightBlockId ? String(blocks.find(b => b.id === highlightBlockId)?.blockName ?? highlightBlockId) : null;

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
      {/* Block highlight banner */}
      {highlightBlockId && blockFilter === String(highlightBlockId) && highlightedBlockName && (
        <div className="flex items-center gap-2.5 rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-800">
          <Grape className="w-4 h-4 shrink-0 text-purple-600" />
          <span>Showing harvest records for <span className="font-semibold">{highlightedBlockName}</span></span>
          <button type="button" className="ml-auto text-xs underline underline-offset-2 hover:text-purple-900" onClick={() => setBlockFilter("__all__")}>Show all blocks</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">Harvest & Vintage Records</p>
          <p className="text-xs text-muted-foreground">Per-block vintage records including yield, must chemistry, and grape condition. Required for GI / PDO vintage declarations.</p>
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
              <SelectItem value="all">All vintages</SelectItem>
              {harvestYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredHarvest, "vineyard-harvest.csv", csvCols)} disabled={!filteredHarvest.length}><FileDown className="w-4 h-4 mr-1" />Export CSV{searchText.trim() ? ` (${filteredHarvest.length})` : ""}</Button>
          <Button size="sm" variant="outline" onClick={() => void printHarvest(filteredHarvest, farmName, farmId, blocks, farmMeta)} disabled={!filteredHarvest.length}><Printer className="w-4 h-4 mr-1" />Print{searchText.trim() ? ` (${filteredHarvest.length})` : ""}</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Add Harvest Record</Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search block, variety or operator…"
            className={`h-8 text-xs w-52 pr-6 ${searchText.trim() ? "border-primary text-primary" : ""}`}
          />
          {searchText && (
            <button
              type="button"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchText("")}
              aria-label="Clear search"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {searchText.trim() && (
          <span className="text-xs text-muted-foreground">Showing {filteredHarvest.length} of {data.length}</span>
        )}
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
        onDelete={r => remove.mutateAsync(r.id as number)} deleteMutation={remove}
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
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); add.reset(); edit.reset(); } }}>
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
            <div><Label>Operator</Label><StaffSelect value={String(form.operatorName ?? "")} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} /></div>
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogMutationError mutation={add} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={edit} message="Failed to save — your entries are still here." />
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
