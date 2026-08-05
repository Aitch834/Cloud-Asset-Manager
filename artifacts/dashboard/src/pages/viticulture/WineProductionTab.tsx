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
import { fmt, fmtDate, fmtNum, today, exportCSV, printExciseReturn, printOrganicWineRecords, PRESSURE_LABELS, BBCH_STAGES, UK_GRAPE_VARIETIES, UK_ROOTSTOCKS, OPERATION_TYPES, StatCard, Empty, ConfirmDialog, DataTable, useCrud, ViewField, RaiseTaskBtn } from "./shared";

const WINE_COLOUR_OPTIONS = ["Red", "White", "Rosé", "Sparkling", "Orange", "Other"];
const ADDITIVE_TYPE_OPTIONS = [
  "Sulphites / SO₂",
  "Fining Agent",
  "Stabiliser",
  "Acidifier",
  "De-acidifier",
  "Yeast Nutrient",
  "Preservative",
  "Tannin",
  "Other",
];
const ADDITIVE_UNIT_OPTIONS = ["g/hL", "mg/L", "g/L", "mL/hL", "mL/L", "g", "mL", "Other"];
const REGULATORY_BASIS_OPTIONS = [
  "UK-retained EU Reg 203/2012 (organic wine)",
  "UK-retained EU Reg 479/2008 (oenological practices)",
  "UK-retained EU Reg 606/2009 (oenological practices)",
  "England & Wales Wine Regulations 2011",
  "Certifier guidance",
  "Other",
];
const SO2_TEST_METHOD_OPTIONS = [
  "On-site — Ripper titration",
  "On-site — Enzymatic kit",
  "On-site — Aeration-oxidation",
  "Third-party laboratory",
  "Not tested / not applicable",
];
// Default max SO₂ (mg/L total) for organic wine by colour
const ORGANIC_MAX_SO2: Record<string, string> = {
  "Red": "100",
  "White": "150",
  "Rosé": "150",
  "Sparkling": "185",
  "Orange": "150",
};

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
  const [vintageFilter, setVintageFilter] = useState(String(new Date().getFullYear()));

  const { data, isLoading } = useQuery<{ records: Record<string, unknown>[] }>({
    queryKey: ["org-vit-wine", farmId],
    queryFn: () => fetch(`/api/farms/${farmId}/organic-viticulture/wine-production`, { credentials: "include" }).then(r => r.json()),
    enabled: !!farmId,
  });

  // Farm name for print header — shared hook, includes `Farm ${farmId}` fallback
  const farmName = useFarmName(farmId);

  const sf = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const sfv = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  // When wine colour changes, auto-populate organic SO₂ max if field is blank or was auto-set
  const handleColourChange = (colour: string) => {
    const autoMax = ORGANIC_MAX_SO2[colour];
    setForm(f => ({
      ...f,
      wineColour: colour,
      // Only auto-fill if currently blank or matches another auto value
      ...((!f.maxSO2MgL || Object.values(ORGANIC_MAX_SO2).includes(f.maxSO2MgL)) && autoMax
        ? { maxSO2MgL: autoMax }
        : {}),
    }));
  };

  // Auto-derive compliance — computed, not stored separately in the form
  const computedCompliant: "1" | "0" | null = useMemo(() => {
    const actual = parseFloat(form.actualSO2MgL ?? "");
    const max = parseFloat(form.maxSO2MgL ?? "");
    if (isNaN(actual) || isNaN(max)) return null;
    return actual <= max ? "1" : "0";
  }, [form.actualSO2MgL, form.maxSO2MgL]);

  const openAdd = () => {
    setForm({
      vintageYear: String(new Date().getFullYear()),
      recordDate: today,
      certifiedOrganic: "1",
      regulatoryBasis: "UK-retained EU Reg 203/2012 (organic wine)",
      so2TestMethod: "On-site — Ripper titration",
    });
    setShowAdd(true);
  };
  const openEdit = (r: Record<string, unknown>) => {
    setForm({
      vintageYear: r.vintageYear ? String(r.vintageYear) : "",
      wineColour: String(r.wineColour ?? ""),
      recordDate: String(r.recordDate ?? ""),
      batchRef: String(r.batchRef ?? ""),
      operatorName: String(r.operatorName ?? ""),
      volumeLitres: String(r.volumeLitres ?? ""),
      certifiedOrganic: r.certifiedOrganic != null ? String(r.certifiedOrganic) : "1",
      certifierRef: String(r.certifierRef ?? ""),
      additiveName: String(r.additiveName ?? ""),
      additiveType: String(r.additiveType ?? ""),
      quantityUsed: String(r.quantityUsed ?? ""),
      quantityUnit: String(r.quantityUnit ?? ""),
      maxPermittedLevel: String(r.maxPermittedLevel ?? ""),
      so2TestMethod: String(r.so2TestMethod ?? "On-site — Ripper titration"),
      labName: String(r.labName ?? ""),
      labRef: String(r.labRef ?? ""),
      actualSO2MgL: String(r.actualSO2MgL ?? ""),
      maxSO2MgL: String(r.maxSO2MgL ?? ""),
      regulatoryBasis: String(r.regulatoryBasis ?? ""),
      notes: String(r.notes ?? ""),
    });
    setEditing(r);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        so2Compliant: computedCompliant ?? (form.actualSO2MgL && form.maxSO2MgL ? "0" : undefined),
      };
      const url = editing
        ? `/api/farms/${farmId}/organic-viticulture/wine-production/${editing.id}`
        : `/api/farms/${farmId}/organic-viticulture/wine-production`;
      const method = editing ? "PUT" : "POST";
      const r = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error("Save failed");
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-wine", farmId] }); setShowAdd(false); setEditing(null); toast({ title: "Saved" }); },
    onError: () => toast({ title: "Error saving record", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { const r = await fetch(`/api/farms/${farmId}/organic-viticulture/wine-production/${id}`, { method: "DELETE", credentials: "include" }); if (!r.ok) throw new Error("Delete failed"); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["org-vit-wine", farmId] }); setDeleting(null); toast({ title: "Deleted" }); },
    onError: () => toast({ title: "Error deleting record", variant: "destructive" }),
  });

  const records = data?.records ?? [];
  const vintageYears = Array.from(new Set(records.map(r => String(r.vintageYear)).filter(Boolean))).sort().reverse();
  if (!vintageYears.includes(String(new Date().getFullYear()))) vintageYears.unshift(String(new Date().getFullYear()));
  const filtered = vintageFilter === "all" ? records : records.filter(r => String(r.vintageYear) === vintageFilter);

  const isLab = form.so2TestMethod === "Third-party laboratory";

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-700 font-medium">Wine Batch Production Register</p>
          <p className="text-sm text-gray-500 mt-0.5">Record each wine batch produced, plus additive use and SO₂ compliance per vintage. Complete one record per batch (or per additive addition event if multiple additives are used). SO₂ limits per UK-retained Reg 203/2012: 100 mg/L red, 150 mg/L white/rosé.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {records.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => printOrganicWineRecords(records, farmName ?? `Farm ${farmId}`)}>
              <Printer className="h-3.5 w-3.5 mr-1.5" />Print Register
            </Button>
          )}
          <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" />Add Record</Button>
        </div>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-900">
        <strong>SO₂ limits for organic wine (UK-retained Reg 203/2012):</strong> Red wine — 100 mg/L total SO₂. White and rosé wine — 150 mg/L. Organic sparkling — 185 mg/L. These limits are lower than for conventional wine. Selecting a wine colour will auto-fill the maximum permitted SO₂. All SO₂ values should be total SO₂ tested at bottling (or latest analysis).
      </div>

      {/* Year filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Vintage:</span>
        <Select value={vintageFilter} onValueChange={setVintageFilter}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {vintageYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-500 border rounded-lg">No wine production records for this vintage yet.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={String(r.id)} className="border rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">Vintage {String(r.vintageYear)}</span>
                    {!!r.batchRef && <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{String(r.batchRef)}</span>}
                    {!!r.wineColour && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{String(r.wineColour)}</span>}
                    {(r.certifiedOrganic === 1 || r.certifiedOrganic === "1")
                      ? <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded font-medium">Certified Organic</span>
                      : <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Not Certified</span>}
                    <SO2Chip compliant={Number(r.so2Compliant)} />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1 text-sm mt-2">
                    {!!r.recordDate && <div><span className="text-gray-500">Date:</span> <span className="font-medium">{fmtDate(r.recordDate)}</span></div>}
                    <div><span className="text-gray-500">Volume:</span> <span className="font-medium">{r.volumeLitres ? `${r.volumeLitres} L` : "—"}</span></div>
                    <div><span className="text-gray-500">Additive:</span> <span className="font-medium">{fmt(String(r.additiveName ?? ""))}</span></div>
                    <div><span className="text-gray-500">Qty:</span> <span className="font-medium">{r.quantityUsed ? `${r.quantityUsed} ${r.quantityUnit ?? ""}`.trim() : "—"}</span></div>
                    <div><span className="text-gray-500">Actual SO₂:</span> <span className="font-medium">{r.actualSO2MgL ? `${r.actualSO2MgL} mg/L` : "—"}</span></div>
                    <div><span className="text-gray-500">Max SO₂:</span> <span className="font-medium">{r.maxSO2MgL ? `${r.maxSO2MgL} mg/L` : "—"}</span></div>
                    {!!r.so2TestMethod && <div className="col-span-2"><span className="text-gray-500">Test method:</span> <span className="font-medium">{String(r.so2TestMethod)}</span></div>}
                  </div>
                  {!!r.operatorName && <p className="text-xs text-gray-500 mt-1">Operator: {String(r.operatorName)}</p>}
                  {!!r.labName && <p className="text-xs text-gray-500 mt-0.5">Lab: {String(r.labName)}{r.labRef ? ` — Ref: ${String(r.labRef)}` : ""}</p>}
                  {!!r.certifierRef && <p className="text-xs text-gray-500 mt-0.5">Certifier Ref: {String(r.certifierRef)}</p>}
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

      <Dialog open={showAdd || !!editing} onOpenChange={() => { setShowAdd(false); setEditing(null); saveMutation.reset(); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Wine Production Record" : "Add Wine Production Record"}</DialogTitle>
            <DialogDescription>
              One record per batch per vintage. If you use multiple additives at different stages, add a separate record for each addition event.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">

            {/* Section: Batch identity */}
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Batch identity</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Vintage Year *</Label><Input type="number" value={form.vintageYear ?? ""} onChange={sf("vintageYear")} placeholder="e.g. 2024" /></div>
              <div>
                <Label>Wine Colour</Label>
                <Select value={form.wineColour ?? ""} onValueChange={handleColourChange}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{WINE_COLOUR_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Batch / Lot Reference</Label><Input value={form.batchRef ?? ""} onChange={sf("batchRef")} placeholder="e.g. LOT-2024-001" /></div>
              <div><Label>Record Date</Label><Input type="date" max={today} value={form.recordDate ?? ""} onChange={sf("recordDate")} /></div>
            </div>

            {/* Section: Production */}
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-t pt-3">Production</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Volume Produced (L)</Label><Input type="number" value={form.volumeLitres ?? ""} onChange={sf("volumeLitres")} placeholder="Total batch volume" /></div>
              <div>
                <Label>Certified Organic?</Label>
                <Select value={form.certifiedOrganic ?? "1"} onValueChange={v => sfv("certifiedOrganic", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="1">Yes</SelectItem><SelectItem value="0">No</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Certifier Reference</Label><Input value={form.certifierRef ?? ""} onChange={sf("certifierRef")} placeholder="Batch certification ref" /></div>
              <div><Label>Operator</Label><Input value={form.operatorName ?? ""} onChange={sf("operatorName")} placeholder="Who made this addition" /></div>
            </div>

            {/* Section: Additive use */}
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-t pt-3">Additive use</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Additive Name</Label><Input value={form.additiveName ?? ""} onChange={sf("additiveName")} placeholder="e.g. Potassium Metabisulphite" /></div>
              <div>
                <Label>Additive Type</Label>
                <Select value={form.additiveType ?? ""} onValueChange={v => sfv("additiveType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{ADDITIVE_TYPE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Quantity Used</Label><Input value={form.quantityUsed ?? ""} onChange={sf("quantityUsed")} placeholder="e.g. 15" /></div>
              <div>
                <Label>Unit</Label>
                <Select value={form.quantityUnit ?? ""} onValueChange={v => sfv("quantityUnit", v)}>
                  <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                  <SelectContent>{ADDITIVE_UNIT_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Max Permitted Level</Label>
                <Input value={form.maxPermittedLevel ?? ""} onChange={sf("maxPermittedLevel")} placeholder="e.g. 50 g/hL per certifier approval" />
              </div>
              <div className="col-span-2">
                <Label>Regulatory Basis</Label>
                <Select value={form.regulatoryBasis ?? ""} onValueChange={v => sfv("regulatoryBasis", v)}>
                  <SelectTrigger><SelectValue placeholder="Select regulation" /></SelectTrigger>
                  <SelectContent>{REGULATORY_BASIS_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Section: SO₂ analysis */}
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground border-t pt-3">SO₂ analysis</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Test Method</Label>
                <Select value={form.so2TestMethod ?? ""} onValueChange={v => sfv("so2TestMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select test method" /></SelectTrigger>
                  <SelectContent>{SO2_TEST_METHOD_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {isLab && (
                <>
                  <div><Label>Laboratory Name</Label><Input value={form.labName ?? ""} onChange={sf("labName")} placeholder="e.g. WineLab UK Ltd" /></div>
                  <div><Label>Lab Report Reference</Label><Input value={form.labRef ?? ""} onChange={sf("labRef")} placeholder="Report or sample ref" /></div>
                </>
              )}
              <div>
                <Label>Actual Total SO₂ (mg/L)</Label>
                <Input type="number" value={form.actualSO2MgL ?? ""} onChange={sf("actualSO2MgL")} placeholder="From analysis" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Max SO₂ Permitted (mg/L)</Label>
                  {form.wineColour && ORGANIC_MAX_SO2[form.wineColour] && (
                    <span className="text-xs text-blue-600">auto from colour</span>
                  )}
                </div>
                <Input type="number" value={form.maxSO2MgL ?? ""} onChange={sf("maxSO2MgL")} placeholder="100 red / 150 white-rosé" />
              </div>
              {computedCompliant !== null && (
                <div className="col-span-2 flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                  <span className="text-muted-foreground">SO₂ compliance:</span>
                  <SO2Chip compliant={Number(computedCompliant)} />
                  <span className="text-xs text-muted-foreground ml-1">
                    ({form.actualSO2MgL} mg/L {computedCompliant === "1" ? "≤" : ">"} {form.maxSO2MgL} mg/L limit)
                  </span>
                </div>
              )}
            </div>

            <div><Label>Notes</Label><Textarea value={form.notes ?? ""} onChange={sf("notes")} rows={2} /></div>
          </div>
          {editing && (
            <div className="border-t pt-3 mt-1">
              <RecordAttachments farmId={farmId} recordType="wine-production" recordId={(editing as Record<string, unknown>).id as number} />
            </div>
          )}
          <DialogMutationError mutation={saveMutation} message="Failed to save — your entries are still here." />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.vintageYear || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => { setDeleting(null); deleteMutation.reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete Wine Production Record</DialogTitle><DialogDescription>Remove the record for vintage <strong>{String(deleting?.vintageYear ?? "")}</strong>? This cannot be undone.</DialogDescription></DialogHeader>
          <DialogMutationError mutation={deleteMutation} message="Failed to delete — please try again." />
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

