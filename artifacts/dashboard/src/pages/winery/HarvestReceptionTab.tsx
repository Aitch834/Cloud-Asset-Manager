import { useCrud, usePersistedYearFilter, useStaff, HARVEST_COLUMNS, HARVEST_IMPORT_HEADERS, resolveHarvestField, today, csvSlug, csvComment, exportCSV, QueryErrorNotice, EmptyState, fmtDate, fmt, fmtNum, NotesCell, SectionLabel, SOURCE_TYPE_OPTIONS, GRAPE_CONDITION_OPTIONS, ViewField } from "./shared";
import { useState, useMemo, useEffect, useRef } from "react";
import { useFarmName } from "@/hooks/use-farm-name";
import { sumCellarSo2, cellarSo2RunningTotals } from "@/lib/so2-summary";
import { parseImportCsv } from "@/lib/bottling-csv";
import { computePrimaryPhTa, computePhTaStagePoints } from "@/lib/ph-ta-stages";
import { StaffSelect } from "@/components/ui/staff-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Loader2, Pencil, Eye, FlaskConical, Wine, Beaker, Gauge, Thermometer, Package, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronRight, Wrench, ShieldCheck, FileDown, Printer, Settings2, RefreshCw, GitBranch, Leaf, Search, Upload, PenLine, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { RecordAttachments } from "@/components/ui/RecordAttachments";
import { DialogMutationError } from "@/components/ui/dialog-error";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts";
import SignatureCanvas from "react-signature-canvas";

import { apiUrl as api } from "@/lib/api";

export function HarvestReceptionTab({ farmId, blocks }: { farmId: number; blocks: Record<string, unknown>[] }) {
  const crud = useCrud(farmId, "winery-reception", "winery-reception");
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [yearFilter, setYearFilter] = usePersistedYearFilter("harvest", farmId);
  const [harvestSearch, setHarvestSearch] = useState("");
  const farmName = useFarmName(farmId);
  const sf = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  // ── Import state ────────────────────────────────────────────────────────────
  const [importOpen, setImportOpen] = useState(false);
  const [importParsed, setImportParsed] = useState<Record<string, string>[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<{ insertedCount: number; rejectedCount: number; rejected: { row: number; reason: string }[] } | null>(null);
  // Headers not matching any HARVEST_COLUMNS header or dbKey — silently ignored
  // by the field mapping, so surface them as a preview warning (mirrors the
  // Bottling importer's unknownHeaders behaviour).
  const [importUnknownHeaders, setImportUnknownHeaders] = useState<string[]>([]);
  // WARNING: prefix rows our own exports prepend above the header — extracted
  // and surfaced in the preview so users know they're skipped (mirrors the
  // Bottling importer's warnings banner).
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const importFileRef = useRef<HTMLInputElement>(null);

  const downloadHarvestTemplate = () => {
    const exampleRow = HARVEST_COLUMNS.map(c => c.example);
    const header = HARVEST_IMPORT_HEADERS.map(h => `"${h}"`).join(",");
    const example = exampleRow.map(v => `"${v.replace(/"/g, '""')}"`).join(",");
    const blob = new Blob([header + "\n" + example + "\n"], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "harvest-reception-import-template.csv";
    a.click();
  };

  const handleHarvestImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportResult(null);
    setImportParsed([]);
    setImportUnknownHeaders([]);
    setImportWarnings([]);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      // Shared column-list-parameterised parser (same implementation as the
      // Bottling importer): full-file CSV state machine, WARNING-prefix
      // extraction, header detection via known headers, unknown-header
      // detection and the 500-row cap all live in one place.
      const parsed = parseImportCsv(text, new Set(HARVEST_COLUMNS.flatMap(c => [c.header, c.dbKey])));
      setImportWarnings(parsed.warnings);
      if (!parsed.ok) { setImportError(parsed.error); return; }
      setImportUnknownHeaders(parsed.unknownHeaders);
      setImportParsed(parsed.rows);
    };
    reader.readAsText(file);
  };

  const submitHarvestImport = async () => {
    if (!importParsed.length) return;
    setImportLoading(true);
    setImportError(null);
    try {
      const records = importParsed.map(row => {
        const rec: Record<string, string | undefined> = {};
        for (const c of HARVEST_COLUMNS) {
          const v = resolveHarvestField(row, c.header);
          rec[c.recordKey] = v || undefined;
        }
        rec.accepted = (rec.accepted ?? "yes").toLowerCase() === "no" ? "false" : "true";
        return rec;
      });
      const r = await fetch(api(`farms/${farmId}/winery-reception/bulk`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ records }),
      });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.error || "Import failed"); }
      const result = await r.json();
      setImportResult(result);
      if (result.insertedCount > 0) qc.invalidateQueries({ queryKey: ["winery-reception", farmId] });
    } catch (err) {
      setImportError((err as Error).message || "Import failed");
    } finally {
      setImportLoading(false);
    }
  };

  const resetHarvestImportDialog = () => {
    setImportParsed([]);
    setImportUnknownHeaders([]);
    setImportWarnings([]);
    setImportError(null);
    setImportResult(null);
    setImportLoading(false);
    if (importFileRef.current) importFileRef.current.value = "";
  };

  const { staffNames, isLoading: staffLoading } = useStaff(farmId);

  const grossKg = parseFloat(String(form.grossWeightKg || "0"));
  const tareKg = parseFloat(String(form.tareWeightKg || "0"));
  const autoNet = !isNaN(grossKg) && !isNaN(tareKg) && grossKg > 0 ? grossKg - tareKg : null;

  const brixVal = parseFloat(String(form.brix || ""));
  const autoPotentialAlcohol = !isNaN(brixVal) && brixVal > 0 ? (brixVal * 0.55).toFixed(1) : null;

  // Past grower names for datalist suggestions
  const growerNames = useMemo(
    () => Array.from(new Set(crud.data.map(r => String(r.grower_name ?? "").trim()).filter(Boolean))).sort(),
    [crud.data]
  );

  // Auto-populate variety when block is selected (only if variety field is currently empty)
  useEffect(() => {
    if (!form.blockId || !open) return;
    if (form.variety) return;
    const block = blocks.find(b => String(b.id) === String(form.blockId));
    if (block?.variety) sf("variety", String(block.variety));
  }, [form.blockId, open]);

  const openAdd = () => { setEditing(null); setForm({ receptionDate: today, vintageYear: String(new Date().getFullYear()), accepted: "true" }); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => { setEditing(r.id as number); setForm(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v == null ? "" : String(v)]))); setOpen(true); };
  const save = async () => {
    const payload = {
      ...form,
      netWeightKg: autoNet != null ? String(autoNet) : form.netWeightKg,
      potentialAlcohol: autoPotentialAlcohol != null ? autoPotentialAlcohol : form.potentialAlcohol,
    };
    try {
      if (editing !== null) await crud.edit.mutateAsync({ id: editing, ...payload } as Record<string, unknown> & { id: number });
      else await crud.add.mutateAsync(payload);
      toast({ title: "Saved" }); setOpen(false);
    } catch (err) {
      const e = err as Error;
      toast({ title: "Save failed", description: e.message || "An unexpected error occurred.", variant: "destructive" });
    }
  };

  const years = Array.from(new Set(crud.data.map(r => String(r.vintage_year)).filter(Boolean))).sort().reverse();
  if (!years.includes(String(new Date().getFullYear()))) years.unshift(String(new Date().getFullYear()));
  const filteredByYear = yearFilter === "all" ? crud.data : crud.data.filter(r => String(r.vintage_year) === yearFilter);
  const filtered = harvestSearch.trim() === "" ? filteredByYear : filteredByYear.filter(r => {
    const q = harvestSearch.trim().toLowerCase();
    return (
      String(r.grower_name ?? "").toLowerCase().includes(q) ||
      String(r.variety ?? "").toLowerCase().includes(q) ||
      String(r.source_type ?? "").toLowerCase().includes(q) ||
      String(r.grape_condition ?? "").toLowerCase().includes(q) ||
      String(r.notes ?? "").toLowerCase().includes(q)
    );
  });
  // Derived from HARVEST_COLUMNS — headers and value formats match the import
  // template exactly, so an exported CSV can be re-imported as-is.
  const harvestCsvCols = HARVEST_COLUMNS.map(c => ({ key: c.dbKey, label: c.header, fmt: c.exportValue }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Winery Grape Intake Register</p>
          <p className="text-xs text-muted-foreground mt-0.5">Record each grape delivery at the winery gate — separate from the vineyard harvest log. Captures winery-scale weights, intake analysis, vehicle details, and condition on arrival.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Log Intake</Button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={v => { setYearFilter(v); setHarvestSearch(""); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input className="h-8 pl-7 text-xs w-52" placeholder="Search grower, variety, notes…" value={harvestSearch} onChange={e => setHarvestSearch(e.target.value)} />
        </div>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => {
          const searchTrim = harvestSearch.trim();
          const parts = ["harvest-reception"];
          if (yearFilter !== "all") parts.push(yearFilter);
          if (searchTrim) parts.push(`search-${csvSlug(searchTrim)}`);
          const prefixLines = [
            csvComment(`Harvest Reception — ${farmName}`),
            csvComment(`Vintage: ${yearFilter === "all" ? "All vintages" : yearFilter}`),
            csvComment(`Search filter: ${searchTrim || "None"}`),
          ];
          exportCSV(filtered, `${parts.join("-")}.csv`, harvestCsvCols, prefixLines);
        }} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <Button size="sm" variant="outline" onClick={() => { resetHarvestImportDialog(); setImportOpen(true); }}><Upload className="w-3.5 h-3.5 mr-1" />Import CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : crud.isError ? <QueryErrorNotice label="intake records" error={crud.error} />
        : filtered.length === 0 ? <EmptyState icon={Wine} title="No intake records yet" sub="Log grape deliveries received at the winery gate." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Block / Variety</th>
              <th className="text-left p-3 font-medium">Source</th>
              <th className="text-right p-3 font-medium">Net Wt (kg)</th>
              <th className="text-right p-3 font-medium">Brix °</th>
              <th className="text-right p-3 font-medium">pH</th>
              <th className="text-right p-3 font-medium">TA (g/L)</th>
              <th className="text-left p-3 font-medium">Condition</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Notes</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3 whitespace-nowrap">{fmtDate(r.reception_date)}</td>
                  <td className="p-3">{fmt(blocks.find(b => b.id === r.block_id)?.blockName ?? r.block_id)} {r.variety ? <span className="text-muted-foreground text-xs">— {String(r.variety)}</span> : ""}</td>
                  <td className="p-3 text-muted-foreground">{fmt(r.source_type)}</td>
                  <td className="p-3 text-right font-mono">{fmtNum(r.net_weight_kg, 0)}</td>
                  <td className="p-3 text-right">{fmtNum(r.brix, 1)}</td>
                  <td className="p-3 text-right">{fmtNum(r.ph, 2)}</td>
                  <td className="p-3 text-right">{fmtNum(r.titratable_acidity_gl, 1)}</td>
                  <td className="p-3">{fmt(r.grape_condition)}</td>
                  <td className="p-3">{r.accepted === false || r.accepted === "false" ? <span className="text-xs bg-red-100 text-red-700 rounded px-2 py-0.5">Rejected</span> : <span className="text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">Accepted</span>}</td>
                  <NotesCell notes={r.notes} />
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setView(r)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing !== null ? "Edit" : "Log"} Grape Intake</DialogTitle>
            <DialogDescription>Record grape delivery details at the winery gate. Separate from vineyard harvest — this captures winery-scale data.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <SectionLabel>Delivery identity</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Reception Date *</Label><Input type="date" max={today} value={String(form.receptionDate ?? "")} onChange={e => sf("receptionDate", e.target.value)} /></div>
              <div><Label>Vintage Year</Label><Input type="number" value={String(form.vintageYear ?? "")} onChange={e => sf("vintageYear", e.target.value)} placeholder={String(new Date().getFullYear())} /></div>
              <div>
                <Label>Block</Label>
                <Select value={String(form.blockId ?? "")} onValueChange={v => { sf("blockId", v); if (!form.variety) { const blk = blocks.find(b => String(b.id) === v); if (blk?.variety) sf("variety", String(blk.variety)); } }}>
                  <SelectTrigger><SelectValue placeholder="Select block" /></SelectTrigger>
                  <SelectContent>{blocks.map(b => <SelectItem key={String(b.id)} value={String(b.id)}>{String(b.blockName)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Variety {!!(form.blockId && blocks.find(b => String(b.id) === String(form.blockId))?.variety) && <span className="text-xs text-muted-foreground font-normal">(from block)</span>}</Label>
                <Input value={String(form.variety ?? "")} onChange={e => sf("variety", e.target.value)} placeholder="e.g. Bacchus, Pinot Noir" />
              </div>
              <div>
                <Label>Source Type</Label>
                <Select value={String(form.sourceType ?? "")} onValueChange={v => { sf("sourceType", v); if (v === "Own vineyard") sf("growerName", ""); }}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SOURCE_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {form.sourceType !== "Own vineyard" && (
                <div>
                  <Label>{form.sourceType === "Purchased grapes" ? "Purchased From (Merchant / Grower)" : "Contract Grower Name"}</Label>
                  <datalist id="grower-names-list">{growerNames.map(n => <option key={n} value={n} />)}</datalist>
                  <Input list="grower-names-list" value={String(form.growerName ?? "")} onChange={e => sf("growerName", e.target.value)} placeholder={form.sourceType === "Purchased grapes" ? "Merchant or grower name" : "Contract grower name"} />
                </div>
              )}
            </div>
            <SectionLabel>Vehicle & transport</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vehicle Reg</Label><Input value={String(form.vehicleReg ?? "")} onChange={e => sf("vehicleReg", e.target.value)} /></div>
              <div><Label>Driver Name</Label><Input value={String(form.driverName ?? "")} onChange={e => sf("driverName", e.target.value)} /></div>
              <div><Label>Intake Temperature (°C)</Label><Input type="number" step="0.1" value={String(form.intakeTemperatureC ?? "")} onChange={e => sf("intakeTemperatureC", e.target.value)} /></div>
            </div>
            <SectionLabel>Weights (winery scales)</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Gross Weight (kg)</Label><Input type="number" step="0.1" value={String(form.grossWeightKg ?? "")} onChange={e => sf("grossWeightKg", e.target.value)} /></div>
              <div><Label>Tare Weight (kg)</Label><Input type="number" step="0.1" value={String(form.tareWeightKg ?? "")} onChange={e => sf("tareWeightKg", e.target.value)} /></div>
              <div>
                <Label>Net Weight (kg)</Label>
                {autoNet !== null
                  ? <div className="border rounded-md px-3 py-2 bg-blue-50 text-blue-900 font-mono text-sm mt-1">{autoNet.toFixed(1)} <span className="text-blue-600 text-xs">auto</span></div>
                  : <Input type="number" step="0.1" value={String(form.netWeightKg ?? "")} onChange={e => sf("netWeightKg", e.target.value)} placeholder="Or enter gross & tare" />}
              </div>
            </div>
            <SectionLabel>Intake analysis (at winery gate)</SectionLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Brix °</Label><Input type="number" step="0.1" value={String(form.brix ?? "")} onChange={e => sf("brix", e.target.value)} /></div>
              <div><Label>pH</Label><Input type="number" step="0.01" value={String(form.ph ?? "")} onChange={e => sf("ph", e.target.value)} /></div>
              <div><Label>TA (g/L)</Label><Input type="number" step="0.1" value={String(form.titratableAcidityGl ?? "")} onChange={e => sf("titratableAcidityGl", e.target.value)} /></div>
              <div>
                <Label>Potential Alcohol %</Label>
                {autoPotentialAlcohol !== null
                  ? <div className="border rounded-md px-3 py-2 bg-blue-50 text-blue-900 font-mono text-sm mt-1">{autoPotentialAlcohol} <span className="text-blue-600 text-xs">from Brix</span></div>
                  : <Input type="number" step="0.1" value={String(form.potentialAlcohol ?? "")} onChange={e => sf("potentialAlcohol", e.target.value)} placeholder="Or enter Brix" />}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tested by</Label>
                <StaffSelect value={String(form.testingBy ?? "")} onChange={v => sf("testingBy", v)} staffNames={staffNames} loading={staffLoading} />
              </div>
              <div><Label>Testing equipment / device</Label><Input value={String(form.testingEquipment ?? "")} onChange={e => sf("testingEquipment", e.target.value)} placeholder="e.g. Anton Paar EasyDens, Hanna HI98103" /></div>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2 bg-amber-50/60">
              <Checkbox id="lab-pending-chk" checked={form.labResultPending === "true" || form.labResultPending === true} onCheckedChange={v => sf("labResultPending", v ? "true" : "false")} />
              <div>
                <Label htmlFor="lab-pending-chk" className="cursor-pointer">Lab result still to come</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Tick if pH / TA figures above are gate estimates and a full lab report is expected — edit this record when the report arrives.</p>
              </div>
            </div>
            <SectionLabel>Condition & allocation</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Grape Condition</Label>
                <Select value={String(form.grapeCondition ?? "")} onValueChange={v => sf("grapeCondition", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{GRAPE_CONDITION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Botrytis %</Label><Input type="number" min="0" max="100" value={String(form.botrytisPct ?? "")} onChange={e => sf("botrytisPct", e.target.value)} /></div>
              <div><Label>MOG % (material other than grapes)</Label><Input type="number" step="0.1" min="0" max="100" value={String(form.mogPct ?? "")} onChange={e => sf("mogPct", e.target.value)} /></div>
              <div><Label>Holding Bin / Tank allocated</Label><Input value={String(form.holdingBin ?? "")} onChange={e => sf("holdingBin", e.target.value)} placeholder="e.g. Bin 3, T2" /></div>
              <div className="col-span-2 md:col-span-1">
                <Label>Receiving Inspector</Label>
                <StaffSelect value={String(form.inspectorName ?? "")} onChange={v => sf("inspectorName", v)} staffNames={staffNames} loading={staffLoading} />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Checkbox id="accepted-chk" checked={form.accepted !== "false" && form.accepted !== false} onCheckedChange={v => sf("accepted", v ? "true" : "false")} />
              <Label htmlFor="accepted-chk" className="cursor-pointer">Grapes accepted at intake</Label>
            </div>
            {(form.accepted === "false" || form.accepted === false) && (
              <div className="space-y-3 rounded-md border border-red-200 bg-red-50/40 p-3">
                <div><Label>Rejection Reason</Label><Textarea value={String(form.rejectionReason ?? "")} onChange={e => sf("rejectionReason", e.target.value)} rows={2} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Disposal Route</Label>
                    <Select value={String(form.disposalRoute ?? "")} onValueChange={v => sf("disposalRoute", v)}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Returned to grower">Returned to grower</SelectItem>
                        <SelectItem value="Animal feed">Animal feed</SelectItem>
                        <SelectItem value="Composting / anaerobic digestion">Composting / anaerobic digestion</SelectItem>
                        <SelectItem value="Licensed waste disposal">Licensed waste disposal</SelectItem>
                        <SelectItem value="Other">Other — see notes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Disposal Date</Label><Input type="date" value={String(form.disposalDate ?? "")} onChange={e => sf("disposalDate", e.target.value)} /></div>
                </div>
                <div><Label>Disposal destination / notes</Label><Textarea value={String(form.disposalNotes ?? "")} onChange={e => sf("disposalNotes", e.target.value)} rows={2} placeholder="e.g. Returned to Smith Farm, driver confirmed 14:30" /></div>
              </div>
            )}
            <div><Label>Notes</Label><Textarea value={String(form.notes ?? "")} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.receptionDate || crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Grape Intake — {fmtDate(view.reception_date)}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Reception Date" value={fmtDate(view.reception_date)} />
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Block" value={fmt(blocks.find(b => b.id === view.block_id)?.blockName ?? view.block_id)} />
              <ViewField label="Variety" value={fmt(view.variety)} />
              <ViewField label="Source" value={fmt(view.source_type)} />
              <ViewField label="Grower" value={fmt(view.grower_name)} />
              <ViewField label="Vehicle Reg" value={fmt(view.vehicle_reg)} />
              <ViewField label="Driver" value={fmt(view.driver_name)} />
              <ViewField label="Gross Weight" value={view.gross_weight_kg ? `${fmtNum(view.gross_weight_kg, 1)} kg` : "—"} />
              <ViewField label="Tare Weight" value={view.tare_weight_kg ? `${fmtNum(view.tare_weight_kg, 1)} kg` : "—"} />
              <ViewField label="Net Weight" value={view.net_weight_kg ? `${fmtNum(view.net_weight_kg, 1)} kg` : "—"} />
              <ViewField label="Intake Temp" value={view.intake_temperature_c ? `${fmtNum(view.intake_temperature_c, 1)} °C` : "—"} />
              <ViewField label="Brix °" value={fmtNum(view.brix, 1)} />
              <ViewField label="pH" value={fmtNum(view.ph, 2)} />
              <ViewField label="TA (g/L)" value={fmtNum(view.titratable_acidity_gl, 1)} />
              <ViewField label="Potential Alcohol %" value={fmtNum(view.potential_alcohol, 1)} />
              {!!view.testing_by && <ViewField label="Tested by" value={fmt(view.testing_by)} />}
              {!!view.testing_equipment && <ViewField label="Testing device" value={fmt(view.testing_equipment)} />}
              {(view.lab_result_pending === true || view.lab_result_pending === "true") && (
                <div className="col-span-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs text-amber-800">Lab result pending — analysis figures may be gate estimates</div>
              )}
              <ViewField label="Grape Condition" value={fmt(view.grape_condition)} />
              <ViewField label="Botrytis %" value={fmt(view.botrytis_pct)} />
              <ViewField label="MOG %" value={fmtNum(view.mog_pct, 1)} />
              <ViewField label="Holding Bin" value={fmt(view.holding_bin)} />
              <ViewField label="Inspector" value={fmt(view.inspector_name)} />
              <ViewField label="Status" value={view.accepted === false || view.accepted === "false" ? <span className="text-red-700">Rejected</span> : <span className="text-green-700">Accepted</span>} />
              {(view.accepted === false || view.accepted === "false") && !!view.rejection_reason && (
                <div className="col-span-2"><ViewField label="Rejection Reason" value={fmt(view.rejection_reason)} /></div>
              )}
              {(view.accepted === false || view.accepted === "false") && !!view.disposal_route && (
                <ViewField label="Disposal Route" value={fmt(view.disposal_route)} />
              )}
              {(view.accepted === false || view.accepted === "false") && !!view.disposal_date && (
                <ViewField label="Disposal Date" value={fmtDate(view.disposal_date)} />
              )}
              {(view.accepted === false || view.accepted === "false") && !!view.disposal_notes && (
                <div className="col-span-2"><ViewField label="Disposal Notes" value={fmt(view.disposal_notes)} /></div>
              )}
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-reception" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Intake Record</DialogTitle><DialogDescription>Remove the intake record for {fmtDate(deleting?.reception_date)}? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <Dialog open={importOpen} onOpenChange={o => { if (!o) { setImportOpen(false); resetHarvestImportDialog(); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Harvest Reception Records from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file to bulk-create intake records. Rows missing required fields (Reception Date, Vintage Year) or with an invalid date format will be reported and skipped. Other rows will be imported.
            </DialogDescription>
          </DialogHeader>

          {!importResult && (
            <div className="space-y-4">
              <div className="rounded-md border border-dashed p-4 bg-muted/30 text-xs text-muted-foreground space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-foreground">Expected CSV columns (header row required):</p>
                  <button
                    type="button"
                    onClick={downloadHarvestTemplate}
                    className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <FileDown className="w-3 h-3" />Download template
                  </button>
                </div>
                <p className="font-mono">{HARVEST_IMPORT_HEADERS.join(", ")}</p>
                <p className="mt-1">The template includes an example row showing the expected formats — delete it before importing real data.</p>
              </div>
              <div>
                <Label>Select CSV file</Label>
                <input
                  ref={importFileRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleHarvestImportFile}
                  className="mt-1 block w-full text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                />
              </div>
              {importError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}
              {importWarnings.length > 0 && !importError && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">This file contains warning{importWarnings.length !== 1 ? "s" : ""} from a previous export:</p>
                    {importWarnings.map((w, i) => <p key={i} className="text-xs mt-1">{w}</p>)}
                    <p className="text-xs mt-1 text-amber-700">Warning lines are skipped on import — only data rows below the header will be imported.</p>
                  </div>
                </div>
              )}
              {importUnknownHeaders.length > 0 && !importError && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Unrecognised column{importUnknownHeaders.length !== 1 ? "s" : ""} — these will be ignored on import:</p>
                    <p className="text-xs mt-1 font-mono">{importUnknownHeaders.join(", ")}</p>
                    <p className="text-xs mt-1 text-amber-700">Check for typos against the template headers. You can still import — data in unrecognised columns will not be saved.</p>
                  </div>
                </div>
              )}
              {importParsed.length > 0 && !importError && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
                  <p className="font-medium">{importParsed.length} row{importParsed.length !== 1 ? "s" : ""} parsed from file.</p>
                  <div className="mt-2 max-h-32 overflow-y-auto rounded border border-blue-200 bg-white">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-blue-50 border-b border-blue-200">
                        <th className="p-1.5 text-left">Reception Date</th>
                        <th className="p-1.5 text-left">Vintage</th>
                        <th className="p-1.5 text-left">Variety</th>
                        <th className="p-1.5 text-left">Net Weight (kg)</th>
                        <th className="p-1.5 text-left">Accepted</th>
                      </tr></thead>
                      <tbody>
                        {importParsed.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-b border-blue-100">
                            <td className="p-1.5">{row["Reception Date"] || "—"}</td>
                            <td className="p-1.5">{row["Vintage Year"] || "—"}</td>
                            <td className="p-1.5">{row["Variety"] || "—"}</td>
                            <td className="p-1.5">{row["Net Weight (kg)"] || "—"}</td>
                            <td className="p-1.5">{row["Accepted (Yes/No)"] || "—"}</td>
                          </tr>
                        ))}
                        {importParsed.length > 10 && (
                          <tr><td colSpan={5} className="p-1.5 text-center text-muted-foreground">… and {importParsed.length - 10} more rows</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {importResult && (
            <div className="space-y-3">
              <div className={`rounded-md p-3 border flex items-start gap-2 ${importResult.insertedCount > 0 ? "bg-green-50 border-green-200 text-green-800" : "bg-amber-50 border-amber-200 text-amber-800"}`}>
                {importResult.insertedCount > 0 ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                <div>
                  <p className="font-medium">
                    {importResult.insertedCount} record{importResult.insertedCount !== 1 ? "s" : ""} imported successfully.
                    {importResult.rejectedCount > 0 && ` ${importResult.rejectedCount} row${importResult.rejectedCount !== 1 ? "s" : ""} skipped — see details below.`}
                  </p>
                </div>
              </div>
              {importResult.rejected.length > 0 && (
                <div className="rounded-md border bg-muted/20 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Skipped rows</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => {
                        const skippedRows = importResult.rejected
                          .map(r => importParsed[r.row - 1])
                          .filter(Boolean);
                        const header = HARVEST_IMPORT_HEADERS.map(h => `"${h}"`).join(",");
                        const body = skippedRows.map(row =>
                          HARVEST_IMPORT_HEADERS.map(h => `"${resolveHarvestField(row, h).replace(/"/g, '""')}"`).join(",")
                        ).join("\n");
                        const blob = new Blob([header + "\n" + body + "\n"], { type: "text/csv" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = "harvest-reception-skipped-rows.csv";
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <FileDown className="w-3 h-3 mr-1" />Download skipped rows as CSV
                    </Button>
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {importResult.rejected.map((r, i) => (
                      <div key={i} className="text-xs text-red-700 flex items-start gap-1.5">
                        <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span>{r.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setImportOpen(false); resetHarvestImportDialog(); }}>
              {importResult ? "Close" : "Cancel"}
            </Button>
            {!importResult && (
              <Button
                onClick={submitHarvestImport}
                disabled={importParsed.length === 0 || importLoading || !!importError}
              >
                {importLoading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Import {importParsed.length > 0 ? `${importParsed.length} Row${importParsed.length !== 1 ? "s" : ""}` : ""}
              </Button>
            )}
            {importResult && (
              <Button variant="outline" onClick={resetHarvestImportDialog}>Import Another File</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Winery Batch Settings hook ───────────────────────────────────────────────
