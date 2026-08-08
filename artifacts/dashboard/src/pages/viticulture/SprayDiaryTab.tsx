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
  Award, Globe, BadgeAlert, Beaker, Wrench, Gauge, Link, Unlink,
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
import { usePersistedFilter } from "@/hooks/use-persisted-filter";

import { apiUrl as api } from "@/lib/api";
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, printSprayRecords, useFarmMeta, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";

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

type VitSprayProduct = {
  id: number;
  productName: string;
  mappaNumber: string | null;
  activeIngredient: string | null;
  category: string | null;
  harvestInterval: number | null;
  maxApplicationsPerSeason: number | null;
  lerapCategory: string | null;
  lerapStandardBufferM: string | null;
  beePrecaution: boolean;
  currentStockQuantity: number | null;
  stockUnit: string | null;
  coshhRecord: {
    id: number;
    substanceName: string | null;
    hazardClassification: string | null;
    ppe: string | null;
    emergencyProcedures: string | null;
    controlMeasures: string | null;
  } | null;
};

function vitDegreesToCompass(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export function SprayDiaryTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const crud = useCrud(farmId, "vineyard-spray-diary", "vineyard-spray-diary");
  const farmName = useFarmName(farmId);
  const { farmRecord: farmMeta } = useFarmMeta(farmId);

  const { data: staffData, isLoading: staffLoading } = useQuery<{ staff: { id: string; name: string }[] }>({
    queryKey: ["farm-staff", farmId],
    queryFn: () => fetch(api(`farms/${farmId}/staff`), { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
    staleTime: 120_000,
  });
  const staffNames: string[] = (staffData?.staff ?? []).map((s: { name: string }) => s.name);

  const { data: productsData } = useQuery<{ records: VitSprayProduct[] }>({
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

  const sprayProducts: VitSprayProduct[] = productsData?.records ?? [];
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
  const [weatherFetching, setWeatherFetching] = useState(false);
  const [weatherMsg, setWeatherMsg] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = usePersistedFilter({ page: "viticulture-spray-diary", filter: "year", farmId, defaultValue: String(new Date().getFullYear()) });
  const [bulkLinkOpen, setBulkLinkOpen] = useState(false);
  const [bulkLinks, setBulkLinks] = useState<Record<number, number | null>>({});
  const [unlinkRecordId, setUnlinkRecordId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const sfv = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));
  const blockName = (id: unknown) => (blocks.find(b => b.id === id) as Record<string, unknown> | undefined)?.blockName ?? id;

  // ── Computed values from selected product ──────────────────────────────────
  const selectedProduct = useMemo(() =>
    sprayProducts.find(p => String(p.id) === productLookupId) ?? null,
    [sprayProducts, productLookupId]
  );

  // Current UK crop year starts 1 October
  const cropYearStart = useMemo(() => {
    const now = new Date();
    const y = now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
    return new Date(y, 9, 1);
  }, []);

  // Count how many times this product has been applied to this block in the current crop year
  const seasonApplicationCount = useMemo(() => {
    if (!form.productName || !form.blockId) return 0;
    return crud.data.filter(r => {
      const d = r.applicationDate ? new Date(r.applicationDate as string) : null;
      return r.productName === form.productName &&
             r.blockId === form.blockId &&
             d && d >= cropYearStart &&
             r.id !== editing;
    }).length;
  }, [crud.data, form.productName, form.blockId, editing, cropYearStart]);

  // Estimated total product needed = rate × area
  const estimatedProductNeeded = useMemo(() => {
    const rate = parseFloat(String(form.ratePerHectare ?? 0));
    const area = parseFloat(String(form.areaTreatedHa ?? 0));
    if (!rate || !area) return null;
    return rate * area;
  }, [form.ratePerHectare, form.areaTreatedHa]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleBlockChange = (v: string) => {
    const blockId = v === "__all__" ? null : Number(v);
    sfv("blockId", blockId);
    if (blockId) {
      const block = blocks.find(b => b.id === blockId) as Record<string, unknown> | undefined;
      if (block?.areaHa != null) sfv("areaTreatedHa", parseFloat(String(block.areaHa)).toFixed(4));
    }
  };

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

  async function fetchLiveWeather() {
    setWeatherFetching(true);
    setWeatherMsg(null);
    try {
      const pos: GeolocationPosition = await new Promise((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const { latitude, longitude } = pos.coords;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,wind_direction_10m&wind_speed_unit=kmh`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`Weather service error ${resp.status}`);
      const data = await resp.json();
      const c = data.current;
      setForm(f => ({
        ...f,
        // Open-Meteo returns kmh; viticulture form stores mph
        windSpeedMph: c.wind_speed_10m != null ? String(Math.round(c.wind_speed_10m / 1.60934 * 10) / 10) : f.windSpeedMph,
        temperatureCelsius: c.temperature_2m != null ? String(Math.round(c.temperature_2m * 10) / 10) : f.temperatureCelsius,
      }));
      setWeatherMsg(`Live · ${latitude.toFixed(3)}°N, ${Math.abs(longitude).toFixed(3)}°${longitude < 0 ? "W" : "E"} · ${c.wind_direction_10m != null ? vitDegreesToCompass(c.wind_direction_10m) : ""}`);
    } catch (err) {
      setWeatherMsg(`Could not fetch: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setWeatherFetching(false);
    }
  }

  const openAdd = () => { setEditing(null); setProductLookupId(""); setWeatherMsg(null); setForm({ applicationDate: today }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setProductLookupId(""); setWeatherMsg(null); setForm({ ...r }); setOpen(true); };
  const save = () => {
    if (editing !== null) crud.edit.mutate({ id: editing, ...form } as Record<string, unknown> & { id: number });
    else crud.add.mutate(form);
    setOpen(false);
  };

  // ── Bulk-link ─────────────────────────────────────────────────────────────
  const unlinkedSpray = useMemo(() => crud.data.filter(r => !r.blockId), [crud.data]);

  const openBulkLink = () => {
    const initial: Record<number, number | null> = {};
    for (const rec of unlinkedSpray) initial[rec.id as number] = null;
    setBulkLinks(initial);
    setBulkLinkOpen(true);
  };

  const bulkLinkMutation = useMutation({
    mutationFn: async (links: Record<number, number | null>) => {
      const toSave = Object.entries(links).filter(([, blockId]) => blockId !== null);
      if (!toSave.length) return 0;
      await Promise.all(
        toSave.map(([id, blockId]) =>
          fetch(api(`farms/${farmId}/vineyard-spray-diary/${id}`), {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blockId }),
          }).then(r => { if (!r.ok) throw new Error("Failed to link record"); return r.json(); })
        )
      );
      return toSave.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["vineyard-spray-diary", farmId] });
      setBulkLinkOpen(false);
      toast({ title: `${count} ${count === 1 ? "record" : "records"} linked`, description: "Block links saved successfully." });
    },
  });

  const bulkLinkCount = Object.values(bulkLinks).filter(v => v !== null).length;

  const unlinkMutation = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(api(`farms/${farmId}/vineyard-spray-diary/${id}`), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockId: null }),
      });
      if (!r.ok) throw new Error("Failed to unlink record");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vineyard-spray-diary", farmId] });
      setUnlinkRecordId(null);
      toast({ title: "Block link removed", description: "The spray record is no longer linked to a block." });
    },
  });

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

  const sprayYears = Array.from(new Set(crud.data.map(r => new Date(r.applicationDate as string).getFullYear()))).sort((a, b) => b - a);
  if (!sprayYears.includes(new Date().getFullYear())) sprayYears.unshift(new Date().getFullYear());
  const filteredSpray = yearFilter === "all" ? crud.data : crud.data.filter(r => new Date(r.applicationDate as string).getFullYear() === Number(yearFilter));

  const maxApps = selectedProduct?.maxApplicationsPerSeason;
  const seasonLimitReached = maxApps != null && seasonApplicationCount >= maxApps;
  const coshh = selectedProduct?.coshhRecord;
  const ppeList = coshh?.ppe ? coshh.ppe.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm">Spray Diary</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Records must be completed within 48 hours of application and kept for 3 years (Plant Protection Products Regs 2011). Required for WineGB, Red Tractor, and cross-compliance audits.
          </p>
        </div>
        <div className="flex gap-2 shrink-0 items-center flex-wrap justify-end">
          {unlinkedSpray.length > 0 && (
            <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50" onClick={openBulkLink}>
              <Link className="w-4 h-4 mr-1" />Link unlinked records ({unlinkedSpray.length})
            </Button>
          )}
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {sprayYears.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => exportCSV(filteredSpray, "spray-diary.csv", csvCols)} disabled={!filteredSpray.length}><FileDown className="w-4 h-4 mr-1" />CSV</Button>
          <Button size="sm" variant="outline" onClick={() => void printSprayRecords(filteredSpray, farmName, farmId, blocks, farmMeta)} disabled={!filteredSpray.length}><Printer className="w-4 h-4 mr-1" />Print</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Application</Button>
        </div>
      </div>
      {crud.isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : (
        <DataTable
          cols={[
            { key: "applicationDate", label: "Date", render: r => fmtDate(r.applicationDate) },
            {
              key: "blockId", label: "Block",
              render: r => {
                const linked = blocks.find(b => b.id === r.blockId);
                if (linked) return (
                  <span className="inline-flex items-center gap-1.5 group">
                    <span className="text-sm">{String(linked.blockName)}</span>
                    <button
                      type="button"
                      title="Remove block link"
                      className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={e => { e.stopPropagation(); setUnlinkRecordId(r.id as number); }}
                    >
                      <Unlink className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
                return (
                  <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    Not linked
                  </span>
                );
              },
            },
            { key: "productName", label: "Product" },
            { key: "mappNumber", label: "MAPP No." },
            { key: "productType", label: "Type" },
            { key: "ratePerHectare", label: "Rate/ha", render: r => r.ratePerHectare ? `${fmtNum(r.ratePerHectare)} ${fmt(r.rateUnit)}` : "—" },
            { key: "areaTreatedHa", label: "Area (ha)", render: r => fmtNum(r.areaTreatedHa, 4) },
            { key: "operatorName", label: "Operator" },
          ]}
          rows={filteredSpray}
          onView={setView} onEdit={openEdit} onDelete={r => crud.remove.mutate(r.id as number)} deleteMutation={crud.remove}
        />
      )}

      {/* ── View dialog ── */}
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

      {/* Unlink confirm */}
      <ConfirmDialog
        open={unlinkRecordId !== null}
        title="Remove block link?"
        message="This spray record will no longer be linked to its block. You can re-link it at any time from the edit form or the bulk-link tool."
        confirmLabel="Unlink"
        confirmVariant="destructive"
        onConfirm={() => unlinkMutation.mutate(unlinkRecordId!)}
        onCancel={() => { setUnlinkRecordId(null); unlinkMutation.reset(); }}
        mutation={unlinkMutation}
      />

      {/* Bulk-link Dialog */}
      <Dialog open={bulkLinkOpen} onOpenChange={o => { if (!o) { setBulkLinkOpen(false); bulkLinkMutation.reset(); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Link unlinked spray records to blocks</DialogTitle>
            <DialogDescription>
              Assign each unlinked spray application to a vineyard block. Records already linked to a block are not shown.
            </DialogDescription>
          </DialogHeader>
          {unlinkedSpray.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All spray records are already linked to blocks.</p>
          ) : (
            <div className="space-y-1 mt-1">
              <div className="grid grid-cols-[1fr_1fr_1.5fr] gap-x-3 px-1 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b">
                <span>Product</span>
                <span>Date</span>
                <span>Link to block</span>
              </div>
              {unlinkedSpray.map(rec => {
                const recId = rec.id as number;
                const selectedBlockId = bulkLinks[recId] ?? null;
                return (
                  <div key={recId} className="grid grid-cols-[1fr_1fr_1.5fr] gap-x-3 items-center px-1 py-1.5 rounded hover:bg-muted/30">
                    <span className="text-sm truncate" title={String(rec.productName ?? "")}>
                      {String(rec.productName ?? <span className="text-muted-foreground italic">Unknown</span>)}
                    </span>
                    <span className="text-sm text-muted-foreground truncate">{fmtDate(rec.applicationDate)}</span>
                    <Select
                      value={selectedBlockId !== null ? String(selectedBlockId) : "__none__"}
                      onValueChange={v => setBulkLinks(prev => ({ ...prev, [recId]: v === "__none__" ? null : Number(v) }))}
                    >
                      <SelectTrigger className={`h-8 text-xs flex-1 min-w-0 ${selectedBlockId !== null ? "border-green-400 text-green-800 bg-green-50" : ""}`}>
                        <SelectValue placeholder="— No link —" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— No link —</SelectItem>
                        {blocks.map(b => (
                          <SelectItem key={String(b.id)} value={String(b.id)}>
                            {String(b.blockName)}{b.variety ? ` (${String(b.variety)})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
          <DialogMutationError mutation={bulkLinkMutation} message="Some links could not be saved. Please try again." />
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setBulkLinkOpen(false)}>Cancel</Button>
            <Button
              onClick={() => bulkLinkMutation.mutate(bulkLinks)}
              disabled={bulkLinkCount === 0 || bulkLinkMutation.isPending}
            >
              {bulkLinkMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Save {bulkLinkCount > 0 ? `${bulkLinkCount} link${bulkLinkCount === 1 ? "" : "s"}` : "links"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit dialog ── */}
      <Dialog open={open} onOpenChange={o => { if (!o) { setOpen(false); crud.add.reset(); crud.edit.reset(); } }}>
        <DialogContent style={{ maxWidth: "40rem" }} className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Add"} Spray Application</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">

            {/* Date & Block */}
            <div><Label>Application Date *</Label><Input type="date" max={today} value={String(form.applicationDate ?? "")} onChange={sf("applicationDate")} /></div>
            <div>
              <Label>Block</Label>
              <Select value={form.blockId ? String(form.blockId) : "__all__"} onValueChange={handleBlockChange}>
                <SelectTrigger><SelectValue placeholder="All blocks" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">— All blocks —</SelectItem>
                  {blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String((b as Record<string, unknown>).blockName ?? b.id)}</SelectItem>)}
                </SelectContent>
              </Select>
              {!!form.blockId && (() => { const bl = blocks.find(b => b.id === form.blockId) as Record<string, unknown> | undefined; return bl?.areaHa ? <p className="text-xs text-blue-600 mt-1">Block area: {parseFloat(String(bl.areaHa)).toFixed(2)} ha — auto-filled below</p> : null; })()}
            </div>

            {/* Product lookup */}
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

            {/* Season limit warning */}
            {seasonLimitReached && (
              <div className="col-span-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p><strong>Season application limit reached.</strong> {String(form.productName)} has a maximum of {maxApps} application{maxApps !== 1 ? "s" : ""} per season on this block. {seasonApplicationCount} already recorded this crop year (Oct–Sep).</p>
              </div>
            )}
            {!seasonLimitReached && maxApps != null && seasonApplicationCount > 0 && (
              <div className="col-span-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p>{seasonApplicationCount} of {maxApps} application{maxApps !== 1 ? "s" : ""} used this crop year on this block.</p>
              </div>
            )}

            {/* Stock level */}
            {selectedProduct?.currentStockQuantity !== null && selectedProduct?.currentStockQuantity !== undefined && (
              <div className={`col-span-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${selectedProduct.currentStockQuantity <= 0 ? "border-red-200 bg-red-50 text-red-800" : selectedProduct.currentStockQuantity < 5 ? "border-amber-200 bg-amber-50 text-amber-800" : "border-green-200 bg-green-50 text-green-800"}`}>
                <Package className="w-4 h-4 shrink-0" />
                <p>
                  {selectedProduct.currentStockQuantity <= 0
                    ? <strong>Out of stock</strong>
                    : <><strong>Stock: </strong>{selectedProduct.currentStockQuantity} {selectedProduct.stockUnit ?? ""}</>}
                  {selectedProduct.currentStockQuantity > 0 && selectedProduct.currentStockQuantity < 5 && " — Low stock"}
                </p>
              </div>
            )}

            {/* COSHH reminder */}
            {coshh && (
              <div className="col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-semibold text-amber-800 uppercase tracking-wide text-xs">Safety Reminder — COSHH</span>
                  {coshh.hazardClassification && <span className="ml-auto text-xs bg-amber-100 border border-amber-300 text-amber-800 rounded px-1.5 py-0.5">{coshh.hazardClassification}</span>}
                </div>
                {ppeList.length > 0 && <p className="text-amber-800 text-xs mb-1"><strong>PPE required:</strong> {ppeList.join(" · ")}</p>}
                {coshh.controlMeasures && <p className="text-amber-700 text-xs mb-1">{coshh.controlMeasures}</p>}
                {coshh.emergencyProcedures && <p className="text-amber-700 text-xs"><strong>Emergency:</strong> {coshh.emergencyProcedures}</p>}
                <p className="text-amber-600 text-xs mt-1">Full COSHH assessment in Risk &amp; Safety → Chemical Handling</p>
              </div>
            )}

            {/* LERAP warning */}
            {selectedProduct?.lerapCategory && (
              <div className={`col-span-2 flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${selectedProduct.lerapCategory === "A" ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">LERAP — Category {selectedProduct.lerapCategory}{selectedProduct.lerapStandardBufferM ? ` · ${selectedProduct.lerapStandardBufferM}m standard buffer` : ""}</p>
                  {selectedProduct.lerapCategory === "A"
                    ? <p className="text-xs mt-0.5">This product carries a <strong>Category A LERAP label</strong>. The buffer zone is <strong>fixed</strong> and cannot be reduced. Maintain the full buffer from any watercourse, ditch or drain.</p>
                    : <p className="text-xs mt-0.5">This product carries a <strong>Category B LERAP label</strong>. A LERAP assessment must be completed before application near surface water — a valid assessment may allow a reduced buffer.</p>
                  }
                </div>
              </div>
            )}

            {/* Bee precaution */}
            {selectedProduct?.beePrecaution && (
              <div className="col-span-2 flex items-center gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <p><strong>Bee precaution label.</strong> Do not apply when crop is in flower or when bees are actively foraging. Check product label for specific timing restrictions.</p>
              </div>
            )}

            {/* Product details */}
            <div className="col-span-2">
              <Label>Product Name *</Label>
              <Input value={String(form.productName ?? "")} onChange={sf("productName")} placeholder="e.g. Amistar 250 SC" />
              {productLookupId && <p className="text-xs text-green-700 mt-1">Auto-filled from product register — edit if needed.</p>}
            </div>
            <div>
              <Label>MAPP Number</Label>
              <Input value={String(form.mappNumber ?? "")} onChange={sf("mappNumber")} placeholder="e.g. 12345" />
            </div>
            <div>
              <Label>Active Ingredient</Label>
              <Input value={String(form.activeIngredient ?? "")} onChange={sf("activeIngredient")} placeholder="e.g. Azoxystrobin" />
            </div>
            <div>
              <Label>Product Type</Label>
              <Select value={String(form.productType ?? "")} onValueChange={v => sfv("productType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{sprayTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Application Method</Label>
              <Select value={String(form.applicationMethod ?? "")} onValueChange={v => sfv("applicationMethod", v)}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>{sprayMethods.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Rates & quantities */}
            <div><Label>Rate per Hectare</Label><Input type="number" step="0.001" value={String(form.ratePerHectare ?? "")} onChange={sf("ratePerHectare")} /></div>
            <div>
              <Label>Rate Unit</Label>
              <Select value={String(form.rateUnit ?? "")} onValueChange={v => sfv("rateUnit", v)}>
                <SelectTrigger><SelectValue placeholder="Select unit…" /></SelectTrigger>
                <SelectContent>{rateUnits.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Area Treated (ha)</Label>
              <Input type="number" step="0.0001" value={String(form.areaTreatedHa ?? "")} onChange={sf("areaTreatedHa")} />
              {!!form.blockId && (() => { const bl = blocks.find(b => b.id === form.blockId) as Record<string, unknown> | undefined; return bl?.areaHa ? <p className="text-xs text-blue-600 mt-1">From block ({parseFloat(String(bl.areaHa)).toFixed(4)} ha)</p> : null; })()}
            </div>
            <div><Label>Water Volume (L/ha)</Label><Input type="number" value={String(form.waterVolumeLPerHa ?? "")} onChange={sf("waterVolumeLPerHa")} /></div>
            <div>
              <Label>Total Qty Applied</Label>
              <Input type="number" step="0.001" value={String(form.totalQuantityApplied ?? "")} onChange={sf("totalQuantityApplied")} />
            </div>
            <div>
              <Label>Quantity Unit</Label>
              <Select value={String(form.quantityUnit ?? "")} onValueChange={v => sfv("quantityUnit", v)}>
                <SelectTrigger><SelectValue placeholder="Select unit…" /></SelectTrigger>
                <SelectContent>{qtyUnits.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Estimated product needed */}
            {estimatedProductNeeded !== null && (
              <div className="col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span className="font-medium">Estimated product needed: </span>
                {estimatedProductNeeded.toFixed(2)} {String(form.rateUnit ?? "")}
                <span className="text-xs text-muted-foreground ml-2">({fmtNum(form.ratePerHectare)} {String(form.rateUnit ?? "")} × {fmtNum(form.areaTreatedHa, 4)} ha)</span>
              </div>
            )}

            <div><Label>Re-entry Period (hrs)</Label><Input type="number" value={String(form.reentryPeriodHours ?? "")} onChange={sf("reentryPeriodHours")} /></div>
            <div>
              <Label>Harvest Interval (days)</Label>
              <Input type="number" value={String(form.harvestIntervalDays ?? "")} onChange={sf("harvestIntervalDays")} />
              {productLookupId && !!form.harvestIntervalDays && <p className="text-xs text-green-700 mt-1">From product register</p>}
            </div>

            {/* Weather */}
            <div className="col-span-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Weather conditions</p>
              <button type="button" onClick={fetchLiveWeather} disabled={weatherFetching}
                className="text-xs text-blue-600 hover:underline disabled:opacity-50 flex items-center gap-1">
                {weatherFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                {weatherFetching ? "Fetching…" : "Get live conditions"}
              </button>
            </div>
            {weatherMsg && <p className={`col-span-2 text-xs mt-0 ${weatherMsg.startsWith("Could not") ? "text-red-600" : "text-blue-600"}`}>{weatherMsg}</p>}
            <div><Label>Wind Speed (mph)</Label><Input type="number" step="0.1" value={String(form.windSpeedMph ?? "")} onChange={sf("windSpeedMph")} /></div>
            <div><Label>Temperature (°C)</Label><Input type="number" step="0.1" value={String(form.temperatureCelsius ?? "")} onChange={sf("temperatureCelsius")} /></div>
            <div className="col-span-2">
              <Label>Weather Conditions</Label>
              <Select value={String(form.weatherConditions ?? "")} onValueChange={v => sfv("weatherConditions", v)}>
                <SelectTrigger><SelectValue placeholder="Select conditions…" /></SelectTrigger>
                <SelectContent>{weatherOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            {/* Operator */}
            <div>
              <Label>Operator</Label>
              <StaffSelect value={String(form.operatorName ?? "")} onChange={handleOperatorChange} staffNames={staffNames} loading={staffLoading} />
            </div>
            <div>
              <Label>Operator Certificate No. (PA1/PA2/PA6)</Label>
              <Input value={String(form.operatorCertificateNo ?? "")} onChange={sf("operatorCertificateNo")} placeholder="e.g. PA6 — 12345" />
              {!!form.operatorName && !!form.operatorCertificateNo && staffNames.includes(String(form.operatorName)) && <p className="text-xs text-green-700 mt-1">Auto-filled from staff certificate record</p>}
            </div>
            <div className="col-span-2"><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={sf("notes")} rows={2} /></div>
          </div>
          <DialogMutationError mutation={crud.add} message="Failed to save — your entries are still here." />
          <DialogMutationError mutation={crud.edit} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending || !form.applicationDate || !form.productName || seasonLimitReached}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Soil & Leaf Analysis Tab ──────────────────────────────────────────────────

