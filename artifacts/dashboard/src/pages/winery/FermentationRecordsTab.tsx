import { BatchTrailDialog } from "./BatchTrail";
import { usePersistedFilter } from "@/hooks/use-persisted-filter";
import { useCrud, useVessels, usePressing, useStaff, usePersistedYearFilter, fmtDate, fmtNum, csvSlug, csvComment, exportCSV, QueryErrorNotice, EmptyState, fmt, SignOffBadge, BatchTrailButton, ViewAdditionsButton, SignOffButton, SignedEditWarning, SectionLabel, WINE_COLOUR_OPTIONS, FERMENTATION_TYPE_OPTIONS, COMMERCIAL_YEAST_STRAINS, INDIGENOUS_YEAST_STRAINS, today, ORGANIC_MAX_SO2, ViewField, ADDITIVE_COL, EXTRA_ADDITIVE_COLUMNS, AuditSignOffView, EditHistorySection, RecordSignOffDialog, SIGN_OFF_CSV_COLUMNS } from "./shared";
import { useState, useMemo, useEffect, useRef } from "react";
import { useFarmName } from "@/hooks/use-farm-name";
import { sumCellarSo2, cellarSo2RunningTotals } from "@/lib/so2-summary";
import { BOTTLING_COLUMNS, BOTTLING_IMPORT_HEADERS, resolveBottlingField, bottlingImportRecord, parseCsvText, parseBottlingCsv } from "@/lib/bottling-csv";
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

export function FermentationRecordsTab({ farmId }: { farmId: number }) {
  const crud = useCrud(farmId, "winery-fermentation", "winery-fermentation");
  const { data: vessels = [] } = useVessels(farmId);
  const { data: pressingRecords = [] } = usePressing(farmId);
  const { staffNames, isLoading: staffLoading } = useStaff(farmId);
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [signingOff, setSigningOff] = useState<Record<string, unknown> | null>(null);
  const [view, setView] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [isOrganicForm, setIsOrganicForm] = useState(false);
  const [yearFilter, setYearFilter] = usePersistedYearFilter("fermentation", farmId);
  const [fermSearch, setFermSearch] = useState("");
  const [fermSignedFilter, setFermSignedFilter] = usePersistedFilter({ page: "fermentation-records", filter: "signed", farmId, defaultValue: "all" });
  const [so2FromPressing, setSo2FromPressing] = useState(false);
  const [trailRecord, setTrailRecord] = useState<Record<string, unknown> | null>(null);
  const farmNameFerm: string = useFarmName(farmId);
  const sf = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // Pressing records sorted newest-first for the link select
  const sortedPressingRecords = [...pressingRecords]
    .filter(r => r.batch_ref)
    .sort((a, b) => String(b.press_date ?? "").localeCompare(String(a.press_date ?? "")));

  const handlePressingLinkChange = async (val: string) => {
    sf("pressingRecordId", val);
    setSo2FromPressing(false);
    if (!val) return;
    const match = pressingRecords.find(p => String(p.id) === val);
    if (!match) return;
    // Auto-fill batch ref and vintage year when linking a pressing record
    if (!form.batchRef && match.batch_ref) sf("batchRef", String(match.batch_ref));
    if (!form.vintageYear && match.vintage_year) sf("vintageYear", String(match.vintage_year));
    if (!form.wineColour && match.wine_colour) sf("wineColour", String(match.wine_colour));
    // Inherit organic status from pressing record (user can override manually)
    setIsOrganicForm(!!(match.is_organic === true || match.is_organic === "true"));
    // Auto-fill volume from the pressing record's total juice yield (if not already set)
    const totalJuice = match.total_juice_litres ?? (
      (match.free_run_litres != null && match.press_wine_litres != null)
        ? (parseFloat(String(match.free_run_litres)) + parseFloat(String(match.press_wine_litres)))
        : null
    );
    if (totalJuice != null && !isNaN(Number(totalJuice))) {
      setForm(f => f.volumeLitres ? f : { ...f, volumeLitres: String(Math.round(Number(totalJuice))) });
    }
    // Fetch pressing additions and pre-fill SO₂ if the field is currently empty
    try {
      const res = await fetch(api(`farms/${farmId}/winery-pressing/${val}/additions`), { credentials: "include" });
      if (res.ok) {
        const d = await res.json();
        const additions: Record<string, unknown>[] = d.additions ?? [];
        const so2Row = additions.find(a => String(a.category ?? "") === "so2");
        if (so2Row && so2Row.dose != null) {
          setForm(f => {
            if (f.so2AtFermentationMgL) return f; // don't overwrite if user already entered a value
            setSo2FromPressing(true);
            return { ...f, so2AtFermentationMgL: String(so2Row.dose) };
          });
        }
      }
    } catch {
      // non-critical — silently skip if fetch fails
    }
  };

  const handleFermentationTypeChange = (val: string) => {
    if (val === "Wild / spontaneous fermentation") {
      setForm(f => ({ ...f, fermentationType: val, yeastStrain: "Wild / spontaneous", inoculationDate: "", inoculationTempC: "" }));
    } else {
      setForm(f => ({
        ...f,
        fermentationType: val,
        // Clear the auto-set wild value if switching away from wild
        yeastStrain: f.yeastStrain === "Wild / spontaneous" ? "" : f.yeastStrain,
      }));
    }
  };

  const openAdd = () => { setEditing(null); setForm({ vintageYear: String(new Date().getFullYear()) }); setIsOrganicForm(false); setSo2FromPressing(false); setOpen(true); };
  const openEdit = (r: Record<string, unknown>) => {
    setEditing(r.id as number);
    setForm(Object.fromEntries(Object.entries(r).filter(([k]) => k !== "is_organic" && k !== "so2_from_pressing").map(([k, v]) => [k, v == null ? "" : String(v)])));
    setIsOrganicForm(!!(r.is_organic === true || r.is_organic === "true"));
    // Drive the badge from the persisted flag — no fetch needed
    setSo2FromPressing(!!(r.so2_from_pressing === true || r.so2_from_pressing === "true"));
    setOpen(true);
  };
  const save = async () => {
    try {
      const payload = { ...form, isOrganic: isOrganicForm, so2FromPressing };
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
  const fermFilteredBySearch = fermSearch.trim() === "" ? filteredByYear : filteredByYear.filter(r => {
    const q = fermSearch.trim().toLowerCase();
    const vesselRef = r.vessel_ref ?? vessels.find(v => v.id === r.vessel_id)?.vessel_ref;
    return String(r.batch_ref ?? "").toLowerCase().includes(q)
      || String(r.variety ?? "").toLowerCase().includes(q)
      || String(vesselRef ?? "").toLowerCase().includes(q)
      || String(r.operator_name ?? "").toLowerCase().includes(q);
  });
  const filtered = fermSignedFilter === "all"
    ? fermFilteredBySearch
    : fermFilteredBySearch.filter(r => {
        const isSigned = r.audit_signature != null && r.audit_signature !== "";
        return fermSignedFilter === "signed" ? isSigned : !isSigned;
      });
  // Outstanding sign-offs across the current vintage filter (independent of
  // search / signed-status filters) — same as the Pressing table's header badge
  const fermUnsignedCount = useMemo(
    () => filteredByYear.filter(r => r.audit_signature == null || r.audit_signature === "").length,
    [filteredByYear],
  );
  const fermentCsvCols = [
    { key: "vintage_year", label: "Vintage" },
    { key: "batch_ref", label: "Batch Ref" },
    { key: "wine_colour", label: "Wine Colour" },
    { key: "is_organic", label: "Organic", fmt: (r: Record<string, unknown>) => (r.is_organic === true || r.is_organic === "true") ? "Yes" : "No" },
    { key: "volume_litres", label: "Volume (L)" },
    { key: "fermentation_type", label: "Fermentation Type" },
    { key: "yeast_strain", label: "Yeast Strain" },
    { key: "inoculation_date", label: "Inoculation Date", fmt: (r: Record<string, unknown>) => fmtDate(r.inoculation_date) },
    { key: "start_date", label: "Start Date", fmt: (r: Record<string, unknown>) => fmtDate(r.start_date) },
    { key: "end_date", label: "End Date", fmt: (r: Record<string, unknown>) => fmtDate(r.end_date) },
    { key: "start_brix", label: "Start Brix" },
    { key: "end_brix", label: "End Brix" },
    { key: "end_sg", label: "End SG" },
    { key: "residual_sugar_gl", label: "Residual Sugar (g/L)" },
    { key: "max_temp_c", label: "Max Temp (°C)" },
    { key: "min_temp_c", label: "Min Temp (°C)" },
    { key: "so2_at_fermentation_mg_l", label: "SO₂ at Fermentation (mg/L)" },
    { key: "end_ph", label: "End pH", fmt: (r: Record<string, unknown>) => r.end_ph != null ? fmtNum(r.end_ph, 2) : "" },
    { key: "end_ta_gl", label: "End TA (g/L)", fmt: (r: Record<string, unknown>) => r.end_ta_gl != null ? fmtNum(r.end_ta_gl, 1) : "" },
    { key: "operator_name", label: "Operator" },
    { key: "notes", label: "Notes" },
    // Sign-off columns — shared with the pressing export so formatting can't drift
    ...SIGN_OFF_CSV_COLUMNS,
  ];

  const fermentStatus = (r: Record<string, unknown>) => {
    if (r.end_date) return <span className="text-xs bg-green-100 text-green-700 rounded px-1.5 py-0.5">Complete</span>;
    if (r.start_date) return <span className="text-xs bg-amber-100 text-amber-700 rounded px-1.5 py-0.5">Active</span>;
    return <span className="text-xs bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">Pending</span>;
  };

  const brixChartData = filtered.filter(r => r.start_brix || r.end_brix).map(r => ({
    batch: String(r.batch_ref ?? r.id).slice(0, 12),
    "Start Brix": r.start_brix ? parseFloat(String(r.start_brix)) : null,
    "End Brix": r.end_brix ? parseFloat(String(r.end_brix)) : null,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-sm flex items-center gap-2 flex-wrap">
            Fermentation Records
            {fermUnsignedCount > 0 && (
              <button
                type="button"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 cursor-pointer hover:bg-amber-200 transition-colors"
                title={`${fermUnsignedCount} fermentation record${fermUnsignedCount === 1 ? "" : "s"} in the current vintage filter ${fermUnsignedCount === 1 ? "has" : "have"} not been signed off — click to ${fermSignedFilter === "unsigned" ? "show all records" : "show only unsigned records"}`}
                onClick={() => setFermSignedFilter(fermSignedFilter === "unsigned" ? "all" : "unsigned")}
              >
                <PenLine className="w-3 h-3" />{fermUnsignedCount} unsigned
              </button>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Track each fermentation batch from inoculation to dryness. One record per batch per vessel. Links to your Tank Register for vessel assignment.</p>
        </div>
        <Button size="sm" onClick={openAdd}><Plus className="w-3.5 h-3.5 mr-1" />Add Fermentation</Button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={yearFilter} onValueChange={v => { setYearFilter(v); setFermSearch(""); }}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All years</SelectItem>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            className="h-8 text-xs pl-7 w-52"
            placeholder="Batch, variety, vessel, operator…"
            value={fermSearch}
            onChange={e => setFermSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-muted-foreground">Sign-off:</span>
        <Select value={fermSignedFilter} onValueChange={v => setFermSignedFilter(v as "all" | "signed" | "unsigned")}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="signed">Signed only</SelectItem>
            <SelectItem value="unsigned">Unsigned only</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => {
          const searchTrim = fermSearch.trim();
          const parts = ["fermentation-records"];
          if (yearFilter !== "all") parts.push(yearFilter);
          if (searchTrim) parts.push(`search-${csvSlug(searchTrim)}`);
          const prefixLines = [
            csvComment(`Fermentation Records — ${farmNameFerm}`),
            csvComment(`Vintage: ${yearFilter === "all" ? "All vintages" : yearFilter}`),
            csvComment(`Search filter: ${searchTrim || "None"}`),
          ];
          exportCSV(filtered, `${parts.join("-")}.csv`, fermentCsvCols, prefixLines);
        }} disabled={!filtered.length}><FileDown className="w-3.5 h-3.5 mr-1" />Export CSV</Button>
        <span className="text-xs text-muted-foreground">{filtered.length} batch{filtered.length !== 1 ? "es" : ""}</span>
      </div>
      {brixChartData.length > 1 && (
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Start vs End Brix by Batch</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={brixChartData} margin={{ top: 4, right: 12, bottom: 24, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="batch" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} width={32} />
              <Tooltip contentStyle={{ fontSize: 11 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Start Brix" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="End Brix" fill="#10b981" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      {crud.isLoading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        : crud.isError ? <QueryErrorNotice label="fermentation records" error={crud.error} />
        : filtered.length === 0 ? <EmptyState icon={Beaker} title="No fermentation records yet" sub="Add a record when you begin each fermentation batch." />
        : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40"><tr>
              <th className="text-left p-3 font-medium">Vintage</th>
              <th className="text-left p-3 font-medium">Batch</th>
              <th className="text-left p-3 font-medium">Colour</th>
              <th className="text-left p-3 font-medium">Vessel</th>
              <th className="text-left p-3 font-medium">Start</th>
              <th className="text-left p-3 font-medium">Type</th>
              <th className="text-right p-3 font-medium">Start Brix</th>
              <th className="text-right p-3 font-medium">End Brix</th>
              <th className="text-right p-3 font-medium">End pH</th>
              <th className="text-right p-3 font-medium">End TA (g/L)</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Sign-off</th>
              <th className="p-3"></th>
            </tr></thead>
            <tbody className="divide-y">
              {filtered.map(r => (
                <tr key={String(r.id)} className="hover:bg-muted/20">
                  <td className="p-3">{fmt(r.vintage_year)}</td>
                  <td className="p-3 font-mono text-xs">{fmt(r.batch_ref)}</td>
                  <td className="p-3">
                    {r.wine_colour ? <span className="text-xs bg-purple-100 text-purple-700 rounded px-1.5 py-0.5">{String(r.wine_colour)}</span> : "—"}
                    {(r.is_organic === true || r.is_organic === "true" || r.is_organic === 1) && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 font-sans"><Leaf className="w-3 h-3" />Organic</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs">{fmt(r.vessel_ref ?? vessels.find(v => v.id === r.vessel_id)?.vessel_ref)}</td>
                  <td className="p-3 whitespace-nowrap">{fmtDate(r.start_date)}</td>
                  <td className="p-3 text-muted-foreground text-xs">{r.fermentation_type ? String(r.fermentation_type).split(" ")[0] : "—"}</td>
                  <td className="p-3 text-right">{fmtNum(r.start_brix, 1)}</td>
                  <td className="p-3 text-right">{fmtNum(r.end_brix, 1)}</td>
                  <td className="p-3 text-right">{r.end_ph != null ? fmtNum(r.end_ph, 2) : "—"}</td>
                  <td className="p-3 text-right">{r.end_ta_gl != null ? fmtNum(r.end_ta_gl, 1) : "—"}</td>
                  <td className="p-3">{fermentStatus(r)}</td>
                  <td className="p-3 whitespace-nowrap"><SignOffBadge r={r} /></td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <BatchTrailButton batchRef={r.batch_ref} onClick={() => setTrailRecord(r)} />
                    <ViewAdditionsButton farmId={farmId} record={r} />
                    <SignOffButton record={r} onClick={() => setSigningOff(r)} />
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

      <Dialog open={open} onOpenChange={o => !o && setOpen(false)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing !== null ? "Edit" : "Add"} Fermentation Record</DialogTitle></DialogHeader>
          {editing !== null && <SignedEditWarning signed={form.audit_signature} />}
          <div className="space-y-4">
            <SectionLabel>Batch identity</SectionLabel>
            {sortedPressingRecords.length > 0 && (
              <div>
                <Label>Link to Pressing Batch</Label>
                <Select value={String(form.pressingRecordId ?? "")} onValueChange={handlePressingLinkChange}>
                  <SelectTrigger><SelectValue placeholder="— Not linked to a pressing record —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Not linked —</SelectItem>
                    {sortedPressingRecords.map(p => (
                      <SelectItem key={String(p.id)} value={String(p.id)}>
                        {String(p.batch_ref)}{p.is_organic === true || p.is_organic === "true" ? " 🌿" : ""}{p.vintage_year ? ` (${String(p.vintage_year)})` : ""}{p.press_date ? ` — ${new Date(String(p.press_date)).toLocaleDateString("en-GB")}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Linking a pressing batch makes its additions visible here and inherits the organic status.</p>
              </div>
            )}
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Checkbox
                id="ferm-organic-chk"
                checked={isOrganicForm}
                onCheckedChange={v => setIsOrganicForm(!!v)}
              />
              <div>
                <Label htmlFor="ferm-organic-chk" className="cursor-pointer">Organic batch</Label>
                <p className="text-xs text-muted-foreground">Automatically inherited from linked pressing record — you can override manually.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vintage Year</Label><Input type="number" value={form.vintageYear ?? ""} onChange={e => sf("vintageYear", e.target.value)} /></div>
              <div>
                <Label>Batch / Lot Reference</Label>
                <Input
                  value={form.batchRef ?? ""}
                  onChange={e => sf("batchRef", e.target.value)}
                  placeholder="e.g. LOT-2024-001"
                />
              </div>
              <div>
                <Label>Wine Colour</Label>
                <Select value={form.wineColour ?? ""} onValueChange={v => sf("wineColour", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{WINE_COLOUR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vessel</Label>
                <Select value={form.vesselId ?? ""} onValueChange={v => sf("vesselId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select vessel" /></SelectTrigger>
                  <SelectContent>{vessels.filter(v => v.status === "active").map(v => <SelectItem key={String(v.id)} value={String(v.id)}>{String(v.vessel_ref)}{v.vessel_type ? ` — ${String(v.vessel_type)}` : ""}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Volume (L)</Label><Input type="number" step="0.1" value={form.volumeLitres ?? ""} onChange={e => sf("volumeLitres", e.target.value)} /></div>
              <div><Label>Operator</Label><StaffSelect value={form.operatorName ?? ""} onChange={v => sf("operatorName", v)} staffNames={staffNames} loading={staffLoading} /></div>
            </div>
            <SectionLabel>Fermentation type</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Fermentation Type</Label>
                <Select value={form.fermentationType ?? ""} onValueChange={handleFermentationTypeChange}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{FERMENTATION_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {/* Yeast strain — behaviour driven by fermentation type */}
              <div className="col-span-2 grid grid-cols-2 gap-3">
                <div>
                  <Label>Yeast Strain</Label>
                  {form.fermentationType === "Wild / spontaneous fermentation" ? (
                    <>
                      <Input value="Wild / spontaneous" disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
                      <p className="text-xs text-muted-foreground mt-1">Strain unknown by definition — not applicable.</p>
                    </>
                  ) : form.fermentationType?.startsWith("Inoculated") ? (
                    <>
                      <Input
                        value={form.yeastStrain ?? ""}
                        onChange={e => sf("yeastStrain", e.target.value)}
                        list="yeast-strain-datalist"
                        placeholder="Select or type strain…"
                      />
                      <datalist id="yeast-strain-datalist">
                        {(form.fermentationType === "Inoculated — cultured indigenous yeast"
                          ? INDIGENOUS_YEAST_STRAINS
                          : COMMERCIAL_YEAST_STRAINS
                        ).map(s => <option key={s} value={s} />)}
                      </datalist>
                      <p className="text-xs text-muted-foreground mt-1">Type to search known strains, or enter a custom name.</p>
                    </>
                  ) : (
                    <Input value={form.yeastStrain ?? ""} onChange={e => sf("yeastStrain", e.target.value)} placeholder="e.g. EC1118, Zymaflore F10" />
                  )}
                </div>
                {/* Inoculation details — not applicable for wild / spontaneous */}
                {form.fermentationType === "Wild / spontaneous fermentation" ? (
                  <div className="flex items-end pb-1">
                    <p className="text-xs text-muted-foreground italic border border-dashed border-muted-foreground/30 rounded px-3 py-2 w-full">
                      Inoculation date &amp; temperature not applicable for wild / spontaneous fermentation.
                    </p>
                  </div>
                ) : (
                  <div><Label>Inoculation Date</Label><Input type="date" max={today} value={form.inoculationDate ?? ""} onChange={e => sf("inoculationDate", e.target.value)} /></div>
                )}
              </div>
              {form.fermentationType !== "Wild / spontaneous fermentation" && (
                <div><Label>Inoculation Temp (°C)</Label><Input type="number" step="0.1" value={form.inoculationTempC ?? ""} onChange={e => sf("inoculationTempC", e.target.value)} /></div>
              )}
            </div>
            <SectionLabel>Fermentation progress</SectionLabel>
            <p className="text-xs text-muted-foreground -mt-2">Summary of the fermentation arc — key measurements at start and end. For daily Brix / temperature monitoring logs, use the cellar operations record.</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Date</Label>
                <Input type="date" max={today} value={form.startDate ?? ""} onChange={e => sf("startDate", e.target.value)} />
                <p className="text-xs text-muted-foreground mt-1">When fermentation visibly commenced (Brix drop / CO₂ activity) — typically 12–48 h after inoculation.</p>
              </div>
              <div><Label>Start Brix °</Label><Input type="number" step="0.1" value={form.startBrix ?? ""} onChange={e => sf("startBrix", e.target.value)} /></div>
              <div><Label>End Brix °</Label><Input type="number" step="0.01" value={form.endBrix ?? ""} onChange={e => sf("endBrix", e.target.value)} /></div>
              <div><Label>End SG</Label><Input type="number" step="0.0001" value={form.endSg ?? ""} onChange={e => sf("endSg", e.target.value)} placeholder="e.g. 0.9940" /></div>
              <div><Label>Residual Sugar (g/L)</Label><Input type="number" step="0.1" value={form.residualSugarGl ?? ""} onChange={e => sf("residualSugarGl", e.target.value)} /></div>
              <div><Label>End Date</Label><Input type="date" max={today} value={form.endDate ?? ""} onChange={e => sf("endDate", e.target.value)} /></div>
              <div><Label>Max Temp (°C)</Label><Input type="number" step="0.1" value={form.maxTempC ?? ""} onChange={e => sf("maxTempC", e.target.value)} /></div>
              <div><Label>Min Temp (°C)</Label><Input type="number" step="0.1" value={form.minTempC ?? ""} onChange={e => sf("minTempC", e.target.value)} /></div>
              <div><Label>End pH</Label><Input type="number" step="0.01" value={form.endPh ?? ""} onChange={e => sf("endPh", e.target.value)} placeholder="Post-fermentation pH" /></div>
              <div><Label>End TA (g/L)</Label><Input type="number" step="0.1" value={form.endTaGl ?? ""} onChange={e => sf("endTaGl", e.target.value)} placeholder="Post-fermentation titratable acidity" /></div>
            </div>
            <div><Label>Nutrient additions</Label><Input value={form.nutrientAdditions ?? ""} onChange={e => sf("nutrientAdditions", e.target.value)} placeholder="e.g. DAP 20g/hL at inoculation, Thiamine..." /></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Label>SO₂ addition at fermentation (mg/L)</Label>
                {so2FromPressing && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                    from pressing
                  </span>
                )}
              </div>
              <Input
                type="number"
                step="0.1"
                value={form.so2AtFermentationMgL ?? ""}
                onChange={e => { setSo2FromPressing(false); sf("so2AtFermentationMgL", e.target.value); }}
              />
              {(() => {
                if (!isOrganicForm || !form.wineColour) return null;
                const orgLimit = ORGANIC_MAX_SO2[form.wineColour];
                if (!orgLimit) return null;
                const dose = parseFloat(form.so2AtFermentationMgL ?? "");
                const exceeds = !isNaN(dose) && dose > parseFloat(orgLimit);
                return exceeds ? (
                  <p className="flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 mt-1">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Exceeds organic total SO₂ limit for {form.wineColour} ({orgLimit} mg/L)
                  </p>
                ) : (
                  <p className="text-xs text-amber-700 mt-1">
                    <Leaf className="inline h-3 w-3 mr-0.5" />Organic limit for {form.wineColour}: {orgLimit} mg/L total SO₂ — monitor cumulative additions across all stages.
                  </p>
                );
              })()}
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={e => sf("notes", e.target.value)} rows={2} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={crud.add.isPending || crud.edit.isPending}>
              {(crud.add.isPending || crud.edit.isPending) && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view && (
        <Dialog open onOpenChange={() => setView(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Fermentation — {fmt(view.batch_ref) !== "—" ? String(view.batch_ref) : `Vintage ${String(view.vintage_year)}`}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ViewField label="Vintage Year" value={fmt(view.vintage_year)} />
              <ViewField label="Batch Ref" value={fmt(view.batch_ref)} />
              <ViewField label="Wine Colour" value={fmt(view.wine_colour)} />
              <ViewField label="Organic" value={(view.is_organic === true || view.is_organic === "true") ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">✓ Organic</span> : <span className="text-muted-foreground text-xs">No</span>} />
              <ViewField label="Vessel" value={fmt(view.vessel_ref ?? vessels.find(v => v.id === view.vessel_id)?.vessel_ref)} />
              <ViewField label="Volume (L)" value={fmtNum(view.volume_litres, 0)} />
              <ViewField label="Fermentation Type" value={fmt(view.fermentation_type)} />
              <ViewField label="Yeast Strain" value={fmt(view.yeast_strain)} />
              <ViewField label="Inoculation Date" value={fmtDate(view.inoculation_date)} />
              <ViewField label="Inoculation Temp" value={view.inoculation_temp_c ? `${fmtNum(view.inoculation_temp_c, 1)} °C` : "—"} />
              <ViewField label="Start Date" value={fmtDate(view.start_date)} />
              <ViewField label="Start Brix °" value={fmtNum(view.start_brix, 1)} />
              <ViewField label="End Brix °" value={fmtNum(view.end_brix, 2)} />
              <ViewField label="End SG" value={fmtNum(view.end_sg, 4)} />
              <ViewField label="End Date" value={fmtDate(view.end_date)} />
              <ViewField label="Residual Sugar" value={view.residual_sugar_gl ? `${fmtNum(view.residual_sugar_gl, 1)} g/L` : "—"} />
              <ViewField label="Max Temp" value={view.max_temp_c ? `${fmtNum(view.max_temp_c, 1)} °C` : "—"} />
              <ViewField label="Min Temp" value={view.min_temp_c ? `${fmtNum(view.min_temp_c, 1)} °C` : "—"} />
              <ViewField label="SO₂ at Fermentation" value={view.so2_at_fermentation_mg_l ? `${fmtNum(view.so2_at_fermentation_mg_l, 0)} mg/L` : "—"} />
              <ViewField label="End pH" value={fmtNum(view.end_ph, 2)} />
              <ViewField label="End TA" value={view.end_ta_gl ? `${fmtNum(view.end_ta_gl, 1)} g/L` : "—"} />
              {!!view.nutrient_additions && <div className="col-span-2"><ViewField label="Nutrient Additions" value={fmt(view.nutrient_additions)} /></div>}
              {!!view.notes && <div className="col-span-2"><ViewField label="Notes" value={fmt(view.notes)} /></div>}
            </div>
            {/* Pressing additions — shown when this fermentation record is linked to a pressing batch */}
            {!!view.pressing_record_id && (() => {
              const additions = Array.isArray(view.pressing_additions) ? view.pressing_additions as Record<string, unknown>[] : [];
              // Find the pressing SO₂ addition for the SO₂ baseline callout
              const pressingSo2 = additions.find(a => String(a.category ?? "") === "so2");
              return (
                <div className="border-t pt-3 mt-1 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Additions added at pressing
                    {view.pressing_batch_ref ? ` — Batch ${String(view.pressing_batch_ref)}` : ""}
                    {view.pressing_press_date ? ` (${fmtDate(view.pressing_press_date)})` : ""}
                  </p>
                  {pressingSo2 && (
                    <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
                      <FlaskConical className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        <strong>SO₂ baseline at pressing:</strong>{" "}
                        {pressingSo2.dose != null ? `${String(pressingSo2.dose)} ${String(pressingSo2.unit ?? "")}` : "recorded"}
                        {pressingSo2.additive_name ? ` — ${String(pressingSo2.additive_name)}` : ""}
                      </span>
                    </div>
                  )}
                  {additions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No structured additions recorded for the linked pressing batch.</p>
                  ) : (
                    <div className="rounded-md border overflow-hidden text-xs">
                      {/* Headers/cells come from the shared PRESS_ADDITIVE_COLUMNS definitions
                          (via ADDITIVE_COL), the same source the exports render from, and any
                          extra shared field is appended generically — screen and downloads
                          can no longer drift apart. */}
                      <table className="w-full">
                        <thead className="bg-muted/40"><tr>
                          <th className={`text-${ADDITIVE_COL.additive_name.align} p-2 font-medium`}>{ADDITIVE_COL.additive_name.pdfLabel}</th>
                          <th className={`text-${ADDITIVE_COL.category.align} p-2 font-medium`}>{ADDITIVE_COL.category.pdfLabel}</th>
                          <th className={`text-${ADDITIVE_COL.dose.align} p-2 font-medium`}>{ADDITIVE_COL.dose.pdfLabel}</th>
                          <th className={`text-${ADDITIVE_COL.unit.align} p-2 font-medium`}>{ADDITIVE_COL.unit.pdfLabel}</th>
                          <th className={`text-${ADDITIVE_COL.notes.align} p-2 font-medium`}>{ADDITIVE_COL.notes.pdfLabel}</th>
                          {EXTRA_ADDITIVE_COLUMNS.map(col => (
                            <th key={col.field} className={`text-${col.align} p-2 font-medium`}>{col.pdfLabel}</th>
                          ))}
                        </tr></thead>
                        <tbody className="divide-y">
                          {additions.map((a, i) => (
                            <tr key={String(a.id ?? i)} className="hover:bg-muted/20">
                              <td className={`p-2 font-medium text-${ADDITIVE_COL.additive_name.align}`}>{ADDITIVE_COL.additive_name.pdfValue(a) || "—"}</td>
                              <td className={`p-2 text-muted-foreground text-${ADDITIVE_COL.category.align}`}>{ADDITIVE_COL.category.pdfValue(a) || "—"}</td>
                              <td className={`p-2 font-mono text-${ADDITIVE_COL.dose.align}`}>{a.dose != null && a.dose !== "" ? ADDITIVE_COL.dose.pdfValue(a) : "—"}</td>
                              <td className={`p-2 text-${ADDITIVE_COL.unit.align}`}>{ADDITIVE_COL.unit.pdfValue(a) || "—"}</td>
                              <td className={`p-2 text-muted-foreground text-${ADDITIVE_COL.notes.align} max-w-[8rem] lg:max-w-[11rem] xl:max-w-[14rem]`}>
                                {a.notes ? (
                                  <span className="truncate block cursor-help underline decoration-dotted decoration-muted-foreground/40 underline-offset-2" title={ADDITIVE_COL.notes.pdfValue(a)}>
                                    {ADDITIVE_COL.notes.pdfValue(a).length > 120 ? `${ADDITIVE_COL.notes.pdfValue(a).slice(0, 120)}…` : ADDITIVE_COL.notes.pdfValue(a)}
                                  </span>
                                ) : <span className="text-muted-foreground/50">—</span>}
                              </td>
                              {EXTRA_ADDITIVE_COLUMNS.map(col => (
                                <td key={col.field} className={`p-2 text-muted-foreground text-${col.align}`}>{col.pdfValue(a) || "—"}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}
            <AuditSignOffView record={view} />
            <EditHistorySection history={view.edit_history} />
            {typeof view.id === "number" && <div className="border-t pt-3 mt-1"><RecordAttachments farmId={farmId} recordType="winery-fermentation" recordId={view.id} /></div>}
            <DialogFooter><Button onClick={() => setView(null)}>Close</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {signingOff && (
        <RecordSignOffDialog farmId={farmId} endpoint="winery-fermentation" queryKey="winery-fermentation" recordLabel="Fermentation Record" record={signingOff} onClose={() => setSigningOff(null)} />
      )}
      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Fermentation Record</DialogTitle><DialogDescription>Remove this fermentation batch record? Cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { try { await crud.remove.mutateAsync(Number(deleting!.id)); toast({ title: "Deleted" }); } catch (err) { toast({ title: "Delete failed", description: (err as Error).message || "An unexpected error occurred.", variant: "destructive" }); } setDeleting(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {trailRecord && (
        <BatchTrailDialog
          farmId={farmId}
          pressing={trailRecord}
          farmName={farmNameFerm}
          onClose={() => setTrailRecord(null)}
        />
      )}
    </div>
  );
}

// ─── Vessel Register Tab ──────────────────────────────────────────────────────
